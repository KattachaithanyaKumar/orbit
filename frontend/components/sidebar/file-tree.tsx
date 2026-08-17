"use client";

import { useEffect, useState } from "react";
import {
  ChevronRight,
  FolderTree,
  Folder as FolderIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import CreateFolderModal from "@/app/components/create-folder-modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFolders, deleteFolderById } from "@/store/folders-slice";

export default function FileTree({ workspaceId }: { workspaceId: number }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { folders, loading } = useAppSelector((state) => state.folders);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (token && workspaceId) {
      dispatch(fetchFolders({ workspaceId, token }));
    }
  }, [workspaceId, token, dispatch]);

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      await dispatch(
        deleteFolderById({
          workspaceId,
          folderId: deleteTarget.id,
          token,
        }),
      ).unwrap();
      toast.success("Folder deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Failed to delete folder", { description: message });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="flex-1 overflow-auto px-2 py-2">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-medium text-muted-foreground">
            Files
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setCreateModalOpen(true)}
            title="Add folder"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : folders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <FolderTree className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-xs text-muted-foreground">No folders yet</p>
            <p className="text-xs text-muted-foreground/70">
              Click + to create one
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {folders.map((folder) => {
              const isExpanded = expandedIds.has(folder.id);
              return (
                <div key={folder.id}>
                  <div className="group flex items-center gap-1 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted">
                    <button
                      onClick={() => toggleExpand(folder.id)}
                      className="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
                    >
                      <ChevronRight
                        className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>
                    <FolderIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{folder.name}</span>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100"
                      title="Add file"
                      disabled
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget({ id: folder.id, name: folder.name });
                      }}
                      title="Delete folder"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  {isExpanded && (
                    <div className="ml-6 border-l border-border py-1 pl-2">
                      <p className="px-2 py-2 text-xs text-muted-foreground/70">
                        No files yet
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <CreateFolderModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        workspaceId={workspaceId}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete folder"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  );
}
