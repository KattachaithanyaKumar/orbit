"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  createNewWorkspace,
  setActiveWorkspace,
} from "../../store/workspaces-slice";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateWorkspaceModalProps {
  open: boolean;
  onClose: () => void;
}

const EMOJI_OPTIONS = [
  "📁",
  "🚀",
  "💡",
  "🎯",
  "🎨",
  "🏠",
  "📝",
  "🔬",
  "🎮",
  "🌟",
  "📊",
  "🛠️",
];

const COLOR_OPTIONS = [
  "#6366f1",
  "#2383e2",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#8b5cf6",
  "#6b7280",
];

export default function CreateWorkspaceModal({
  open,
  onClose,
}: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("📁");
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const token = useAppSelector((state) => state.auth.token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      const result = await dispatch(
        createNewWorkspace({
          data: {
            name,
            description: description || undefined,
            icon,
            accentColor,
          },
          token,
        }),
      ).unwrap();
      dispatch(setActiveWorkspace(result.id));
      toast.success("Workspace created!", { description: name });
      setName("");
      setDescription("");
      setIcon("📁");
      setAccentColor("#6366f1");
      onClose();
      router.push(`/dashboard/${result.id}`);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Failed to create workspace", {
        description: message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    setDescription("");
    setIcon("📁");
    setAccentColor("#6366f1");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-md">
        <div className="px-8 pt-8 pb-6">
          <h1 className="mb-1 text-xl font-bold tracking-tight">
            Create a workspace
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Organize your files and ideas in one place.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="ws-name"
                className="text-sm font-medium text-foreground"
              >
                Name
              </label>
              <Input
                id="ws-name"
                placeholder="My Workspace"
                required
                minLength={1}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="ws-desc"
                className="text-sm font-medium text-foreground"
              >
                Description{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </label>
              <Input
                id="ws-desc"
                placeholder="What's this workspace about?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Icon
              </label>
              <div className="grid grid-cols-6 gap-2">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setIcon(emoji)}
                    className={`flex h-10 w-full items-center justify-center rounded-lg border text-lg transition-all ${
                      icon === emoji
                        ? "border-primary bg-primary/10 ring-2 ring-primary"
                        : "border-border bg-muted/50 hover:bg-muted"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Accent color
              </label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    className={`h-8 w-8 rounded-full transition-all ${
                      accentColor === color
                        ? "ring-2 ring-offset-2 ring-offset-background scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{
                      backgroundColor: color,
                      ["--tw-ring-color" as string]:
                        accentColor === color ? color : undefined,
                    }}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="h-10 w-full rounded-lg text-sm font-semibold"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create workspace
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
