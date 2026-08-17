"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createNewFolder } from "@/store/folders-slice";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateFolderModalProps {
  open: boolean;
  onClose: () => void;
  workspaceId: number;
}

export default function CreateFolderModal({
  open,
  onClose,
  workspaceId,
}: CreateFolderModalProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setLoading(true);

    try {
      await dispatch(
        createNewFolder({
          workspaceId,
          data: { name },
          token,
        }),
      ).unwrap();
      toast.success("Folder created!", { description: name });
      setName("");
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Failed to create folder", { description: message });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent showCloseButton={false} className="gap-0 p-0 sm:max-w-sm">
        <div className="px-8 pt-8 pb-6">
          <h1 className="mb-1 text-xl font-bold tracking-tight">
            Create a folder
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Organize your files into folders.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="folder-name"
                className="text-sm font-medium text-foreground"
              >
                Name
              </label>
              <Input
                id="folder-name"
                placeholder="My Folder"
                required
                minLength={1}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="h-10 w-full rounded-lg text-sm font-semibold"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Create folder
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
