"use client";

import { useState, useRef, useCallback } from "react";
import { Editor } from "@tiptap/react";
import { toast } from "sonner";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Highlighter,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Pilcrow,
  List,
  ListOrdered,
  Quote,
  CodeSquare,
  Minus,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  ChevronDown,
  Check,
  ExternalLink,
  Trash2,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toolbar, ToolbarGroup, ToolbarSeparator } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipPopup,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverTrigger,
  PopoverPopup,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

interface EditorToolbarProps {
  editor: Editor | null;
}

function ToolbarButton({
  icon: Icon,
  onClick,
  isActive,
  title,
  disabled,
}: {
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  isActive?: boolean;
  title: string;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClick}
            disabled={disabled}
            className={isActive ? "bg-muted text-foreground" : ""}
          />
        }
      >
        <Icon className="h-4 w-4" />
      </TooltipTrigger>
      <TooltipPopup>{title}</TooltipPopup>
    </Tooltip>
  );
}

function HeadingDropdown({ editor }: { editor: Editor }) {
  const currentLevel = editor.isActive("heading")
    ? editor.getAttributes("heading").level
    : 0;

  const label =
    currentLevel === 1
      ? "Heading 1"
      : currentLevel === 2
        ? "Heading 2"
        : currentLevel === 3
          ? "Heading 3"
          : "Text";

  const Icon =
    currentLevel === 1
      ? Heading1
      : currentLevel === 2
        ? Heading2
        : currentLevel === 3
          ? Heading3
          : Pilcrow;

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              className="flex h-7 items-center gap-1 rounded-lg px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted"
            >
              <Icon className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
          }
        >
          {label}
        </TooltipTrigger>
        <TooltipPopup>Text style</TooltipPopup>
      </Tooltip>
      <DropdownMenuContent className="w-44">
        <DropdownMenuItem
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow className="h-4 w-4" />
          <span>Text</span>
          {!editor.isActive("heading") && (
            <Check className="ml-auto h-3.5 w-3.5" />
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Headings</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
        >
          <Heading1 className="h-4 w-4" />
          <span className="text-base font-bold">Heading 1</span>
          {currentLevel === 1 && (
            <Check className="ml-auto h-3.5 w-3.5" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
        >
          <Heading2 className="h-4 w-4" />
          <span className="text-sm font-semibold">Heading 2</span>
          {currentLevel === 2 && (
            <Check className="ml-auto h-3.5 w-3.5" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 3 }).run()
          }
        >
          <Heading3 className="h-4 w-4" />
          <span className="text-sm font-semibold">Heading 3</span>
          {currentLevel === 3 && (
            <Check className="ml-auto h-3.5 w-3.5" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AlignmentDropdown({ editor }: { editor: Editor }) {
  const currentAlign =
    (editor.getAttributes("paragraph").textAlign as string) ||
    (editor.getAttributes("heading").textAlign as string) ||
    "left";

  const Icon =
    currentAlign === "center"
      ? AlignCenter
      : currentAlign === "right"
        ? AlignRight
        : AlignLeft;

  const label =
    currentAlign === "center"
      ? "Center"
      : currentAlign === "right"
        ? "Right"
        : "Left";

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger className="flex h-7 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted">
              <Icon className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
          }
        >
          Align: {label}
        </TooltipTrigger>
        <TooltipPopup>Text alignment</TooltipPopup>
      </Tooltip>
      <DropdownMenuContent className="w-40">
        <DropdownMenuItem
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="h-4 w-4" />
          <span>Left</span>
          {currentAlign === "left" && (
            <Check className="ml-auto h-3.5 w-3.5" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="h-4 w-4" />
          <span>Center</span>
          {currentAlign === "center" && (
            <Check className="ml-auto h-3.5 w-3.5" />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="h-4 w-4" />
          <span>Right</span>
          {currentAlign === "right" && (
            <Check className="ml-auto h-3.5 w-3.5" />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ListDropdown({ editor }: { editor: Editor }) {
  const isBullet = editor.isActive("bulletList");
  const isOrdered = editor.isActive("orderedList");
  const Icon = isBullet ? List : isOrdered ? ListOrdered : List;
  const label = isBullet
    ? "Bullet List"
    : isOrdered
      ? "Ordered List"
      : "List";

  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger className="flex h-7 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted">
              <Icon className="h-4 w-4" />
              <ChevronDown className="h-3 w-3" />
            </DropdownMenuTrigger>
          }
        >
          {label}
        </TooltipTrigger>
        <TooltipPopup>Lists</TooltipPopup>
      </Tooltip>
      <DropdownMenuContent className="w-44">
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
          <span>Bullet list</span>
          {isBullet && <Check className="ml-auto h-3.5 w-3.5" />}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
          <span>Ordered list</span>
          {isOrdered && <Check className="ml-auto h-3.5 w-3.5" />}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function LinkPopover({ editor }: { editor: Editor }) {
  const [url, setUrl] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const isLinkActive = editor.isActive("link");

  const handleSet = useCallback(() => {
    if (url) {
      editor
        .chain()
        .focus()
        .extendMarkRange("link")
        .setLink({ href: url })
        .run();
      setUrl("");
    }
  }, [editor, url]);

  const handleRemove = useCallback(() => {
    editor.chain().focus().unsetLink().run();
    setUrl("");
  }, [editor]);

  const handleOpen = useCallback(() => {
    const attrs = editor.getAttributes("link");
    setUrl(attrs.href || "");
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [editor]);

  return (
    <Popover onOpenChange={(open) => { if (open) handleOpen(); }}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted"
            >
              <Link className="h-4 w-4" />
            </PopoverTrigger>
          }
        />
        <TooltipPopup>{isLinkActive ? "Edit link" : "Add link"}</TooltipPopup>
      </Tooltip>
      <PopoverPopup className="w-80">
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            {isLinkActive ? "Edit link" : "Add link"}
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              ref={inputRef}
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSet();
              }}
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={handleSet} className="h-8 shrink-0">
              {isLinkActive ? "Update" : "Add"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            {isLinkActive && (
              <a
                href={editor.getAttributes("link").href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Open link
              </a>
            )}
            {isLinkActive && (
              <button
                onClick={handleRemove}
                className="flex items-center gap-1 text-xs text-destructive hover:underline"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </button>
            )}
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  );
}

function ImagePopover({ editor }: { editor: Editor }) {
  const [url, setUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInsertUrl = useCallback(() => {
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
      setUrl("");
    }
  }, [editor, url]);

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type", { description: "Please select an image file." });
        return;
      }

      const maxSize = 1 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error("File too large", { description: "Image must be under 1MB." });
        return;
      }

      setUploading(true);

      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        const maxwidth = 1920;
        const maxheight = 1080;
        let width = img.width;
        let height = img.height;

        if (width > maxwidth) {
          height = (height * maxwidth) / width;
          width = maxwidth;
        }
        if (height > maxheight) {
          width = (width * maxheight) / height;
          height = maxheight;
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
          editor.chain().focus().setImage({ src: dataUrl }).run();
        }
        URL.revokeObjectURL(objectUrl);
        setUploading(false);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        setUploading(false);
      };

      img.src = objectUrl;
      e.target.value = "";
    },
    [editor]
  );

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground data-[state=open]:bg-muted">
              <Image className="h-4 w-4" />
            </PopoverTrigger>
          }
        />
        <TooltipPopup>Insert image</TooltipPopup>
      </Tooltip>
      <PopoverPopup className="w-80" sideOffset={12}>
        <div className="space-y-3">
          <div className="text-xs font-medium text-muted-foreground">
            Insert image
          </div>

          <div className="rounded-lg border border-dashed border-border p-4 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="mb-2"
            >
              {uploading ? (
                <>
                  <div className="mr-1.5 h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-primary" />
                  Compressing...
                </>
              ) : (
                <>
                  <Upload className="mr-1.5 h-3.5 w-3.5" />
                  Upload from device
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, GIF, or WebP
            </p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-background px-2 text-muted-foreground">
                or paste URL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <Input
              placeholder="https://example.com/image.png"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleInsertUrl();
              }}
              className="h-8 text-sm"
            />
            <Button
              size="sm"
              onClick={handleInsertUrl}
              className="h-8 shrink-0"
            >
              Insert
            </Button>
          </div>
        </div>
      </PopoverPopup>
    </Popover>
  );
}

export default function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  return (
    <TooltipProvider>
      <Toolbar>
        <ToolbarGroup>
          <ToolbarButton
            icon={Bold}
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
            title="Bold (Ctrl+B)"
          />
          <ToolbarButton
            icon={Italic}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
            title="Italic (Ctrl+I)"
          />
          <ToolbarButton
            icon={Underline}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
            title="Underline (Ctrl+U)"
          />
          <ToolbarButton
            icon={Strikethrough}
            onClick={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
            title="Strikethrough"
          />
          <ToolbarButton
            icon={Highlighter}
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive("highlight")}
            title="Highlight"
          />
          <ToolbarButton
            icon={Code}
            onClick={() => editor.chain().focus().toggleCode().run()}
            isActive={editor.isActive("code")}
            title="Inline code"
          />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <HeadingDropdown editor={editor} />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <AlignmentDropdown editor={editor} />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <ListDropdown editor={editor} />
          <ToolbarButton
            icon={Quote}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive("blockquote")}
            title="Blockquote"
          />
          <ToolbarButton
            icon={CodeSquare}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive("codeBlock")}
            title="Code block"
          />
          <ToolbarButton
            icon={Minus}
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            title="Horizontal rule"
          />
        </ToolbarGroup>

        <ToolbarSeparator />

        <ToolbarGroup>
          <LinkPopover editor={editor} />
          <ImagePopover editor={editor} />
        </ToolbarGroup>
      </Toolbar>
    </TooltipProvider>
  );
}
