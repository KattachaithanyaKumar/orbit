"use client";

import { useCallback, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
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
import { FileItem } from "@/lib/api";
import EditorToolbar from "./editor-toolbar";

interface FileEditorProps {
  file: FileItem;
  workspaceId: number;
  folderId: number;
  onStatusChange?: (status: "saved" | "saving" | "error") => void;
  onTitleChange?: (title: string) => void;
}

function extractTitle(content: unknown): string {
  if (!content || typeof content !== "object") return "Untitled";
  const doc = content as { content?: Array<{ type: string; content?: Array<{ type: string; text?: string }> }> };
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

export default function FileEditor({
  file,
  workspaceId,
  folderId,
  onStatusChange,
  onTitleChange,
}: FileEditorProps) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileRef = useRef(file);
  fileRef.current = file;

  const debouncedSave = useCallback(
    (editorInstance: { getJSON: () => unknown }, fileId: number) => {
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
              fileId,
              data: { content: json, name: title },
              token,
            }),
          ).unwrap();
          onStatusChange?.("saved");
        } catch (err: unknown) {
          onStatusChange?.("error");
          const message =
            err instanceof Error ? err.message : "Failed to save changes.";
          toast.error("Save failed", { description: message });
        }
      }, 1000);
    },
    [dispatch, token, workspaceId, folderId, onStatusChange, onTitleChange],
  );

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
      Underline,
      Highlight.configure({
        multicolor: false,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        allowBase64: true,
      }),
    ],
    content: file.content || undefined,
    onUpdate: ({ editor: editorInstance }) => {
      debouncedSave(editorInstance, fileRef.current.id);
    },
    editorProps: {
      attributes: {
        class:
          "tiptap focus:outline-none min-h-full px-12 py-8",
      },
    },
  });

  useEffect(() => {
    if (editor && file.id !== fileRef.current.id) {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
      editor.commands.setContent(file.content || "");
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
