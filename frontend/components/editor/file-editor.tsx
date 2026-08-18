"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateFileContent } from "@/store/files-slice";
import { FileItem, Role } from "@/lib/api";
import EditorToolbar from "./editor-toolbar";
import { RemoteCursorsExtension, setRemoteCursors } from "./remote-cursors";
import { useCollaboration } from "@/hooks/use-collaboration";

interface FileEditorProps {
  file: FileItem;
  workspaceId: number;
  folderId: number;
  userRole?: Role | null;
  onStatusChange?: (status: "saved" | "saving" | "error") => void;
  onTitleChange?: (title: string) => void;
  onViewersChange?: (viewers: { userId: number; email: string }[]) => void;
}

function extractTitle(content: unknown): string {
  if (!content || typeof content !== "object") return "Untitled";
  const doc = content as {
    content?: Array<{
      type: string;
      content?: Array<{ type: string; text?: string }>;
    }>;
  };
  if (!doc.content || !Array.isArray(doc.content)) return "Untitled";
  for (const node of doc.content) {
    if (node.content && Array.isArray(node.content)) {
      for (const child of node.content) {
        if (child.text && child.text.trim()) {
          return child.text.trim().slice(0, 100);
        }
      }
    }
  }
  return "Untitled";
}

const editorExtensions = [
  StarterKit,
  Placeholder.configure({ placeholder: "Start writing..." }),
  Underline,
  Highlight.configure({ multicolor: false }),
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: { class: "text-primary underline cursor-pointer" },
  }),
  Image.configure({ allowBase64: true }),
  RemoteCursorsExtension(),
];

function ReadOnlyViewer({ content }: { content: unknown }) {
  const html = useMemo(() => {
    if (!content || typeof content !== "object") return "";
    return generateHTML(content as Parameters<typeof generateHTML>[0], editorExtensions);
  }, [content]);

  if (!html) return null;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-12 sm:py-8">
      <div
        className="tiptap prose prose-sm max-w-none text-foreground [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-6 [&_h1]:mb-3 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-4 [&_h3]:mb-2 [&_p]:my-2 [&_ul]:my-2 [&_ul]:pl-6 [&_ul]:list-disc [&_ol]:my-2 [&_ol]:pl-6 [&_ol]:list-decimal [&_li]:my-0.5 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground [&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_code]:bg-muted [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-sm [&_hr]:my-6 [&_hr]:border-border [&_img]:max-w-full [&_img]:rounded-lg"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

interface EditableEditorProps {
  file: FileItem;
  workspaceId: number;
  folderId: number;
  user?: { id: number };
  onStatusChange?: (status: "saved" | "saving" | "error") => void;
  onTitleChange?: (title: string) => void;
  onViewersChange?: (viewers: { userId: number; email: string }[]) => void;
}

function EditableEditor({
  file,
  workspaceId,
  folderId,
  user,
  onStatusChange,
  onTitleChange,
  onViewersChange,
}: EditableEditorProps) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef(file);
  const isRemoteUpdateRef = useRef(false);

  useEffect(() => {
    fileRef.current = file;
  });

  const {
    remoteCursors,
    remoteFileUpdate,
    clearRemoteUpdate,
    broadcastCursor,
    broadcastFileUpdate,
    fileViewers,
  } = useCollaboration({
    fileId: file.id,
    workspaceId,
    userId: user?.id ?? 0,
    token: token ?? "",
  });

  useEffect(() => {
    onViewersChange?.(fileViewers);
  }, [fileViewers, onViewersChange]);

  const debouncedSave = useCallback(
    (editorInstance: { getJSON: () => unknown }, currentFileId: number) => {
      if (isRemoteUpdateRef.current) return;

      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      onStatusChange?.("saving");

      saveTimerRef.current = setTimeout(async () => {
        if (!token) return;
        const json = editorInstance.getJSON();
        const title = extractTitle(json);
        onTitleChange?.(title);
        try {
          await dispatch(
            updateFileContent({
              workspaceId,
              folderId,
              fileId: currentFileId,
              data: { content: json, name: title },
              token,
            }),
          ).unwrap();
          broadcastFileUpdate(json, title);
          onStatusChange?.("saved");
        } catch (err: unknown) {
          onStatusChange?.("error");
          let message = "Failed to save changes.";
          if (err && typeof err === "object" && "message" in err) {
            message = String((err as { message: unknown }).message);
          } else if (typeof err === "string") {
            message = err;
          }
          toast.error("Save failed", { description: message });
        }
      }, 1000);
    },
    [dispatch, token, workspaceId, folderId, onStatusChange, onTitleChange, broadcastFileUpdate],
  );

  const editor = useEditor({
    extensions: editorExtensions,
    content: file.content || undefined,
    onUpdate: ({ editor: editorInstance }) => {
      debouncedSave(editorInstance, fileRef.current.id);
    },
    onSelectionUpdate: ({ editor: editorInstance }) => {
      const { from } = editorInstance.state.selection;
      broadcastCursor(from, editorInstance.state.doc.content.size);
    },
    editorProps: {
      attributes: {
        class: "tiptap focus:outline-none min-h-full px-4 py-6 sm:px-12 sm:py-8",
      },
    },
  });

  // Update remote cursor decorations
  useEffect(() => {
    if (!editor?.view) return;
    setRemoteCursors(editor.view, remoteCursors);
  }, [remoteCursors, editor]);

  // Apply remote file updates
  useEffect(() => {
    if (!editor || !remoteFileUpdate) return;
    isRemoteUpdateRef.current = true;
    editor.commands.setContent(remoteFileUpdate.content || "");
    isRemoteUpdateRef.current = false;
    clearRemoteUpdate();
  }, [remoteFileUpdate, editor, clearRemoteUpdate]);

  useEffect(() => {
    if (editor && file.id !== fileRef.current.id) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      isRemoteUpdateRef.current = true;
      editor.commands.setContent(file.content || "");
      isRemoteUpdateRef.current = false;
    }
  }, [file.id, file.content, editor]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  if (!editor) return null;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <EditorToolbar editor={editor} />
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export default function FileEditor({
  file,
  workspaceId,
  folderId,
  userRole,
  onStatusChange,
  onTitleChange,
  onViewersChange,
}: FileEditorProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (userRole === "VIEWER") {
    return (
      <div className="flex flex-col min-h-0 flex-1">
        <ReadOnlyViewer content={file.content} />
      </div>
    );
  }

  return (
    <EditableEditor
      file={file}
      workspaceId={workspaceId}
      folderId={folderId}
      user={user ?? undefined}
      onStatusChange={onStatusChange}
      onTitleChange={onTitleChange}
      onViewersChange={onViewersChange}
    />
  );
}
