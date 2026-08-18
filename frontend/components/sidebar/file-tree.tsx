"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChevronRight,
  FolderTree,
  Folder as FolderIcon,
  FileText,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import CreateFolderModal from "@/app/components/create-folder-modal";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchFolders, deleteFolderById } from "@/store/folders-slice";
import {
  fetchFiles,
  createNewFile,
  fetchFile,
  deleteFileById,
  setActiveFile,
  setActiveFolderId,
  clearActiveFile,
} from "@/store/files-slice";
import type { Role } from "@/lib/api";

export default function FileTree({
  workspaceId,
  userRole,
  onExpandedFoldersChange,
}: {
  workspaceId: number;
  userRole?: Role | null;
  onExpandedFoldersChange?: (ids: number[]) => void;
}) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { folders, loading } = useAppSelector((state) => state.folders);
  const { filesByFolder, activeFile } = useAppSelector((state) => state.files);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
    type: "folder" | "file";
    folderId?: number;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const canEdit = userRole !== "VIEWER";

  useEffect(() => {
    if (token && workspaceId) {
      dispatch(fetchFolders({ workspaceId, token }));
    }
  }, [workspaceId, token, dispatch]);

  useEffect(() => {
    onExpandedFoldersChange?.(Array.from(expandedIds));
  }, [expandedIds, onExpandedFoldersChange]);

  const toggleExpand = useCallback(
    (folderId: number) => {
      setExpandedIds((prev) => {
        const next = new Set(prev);
        if (next.has(folderId)) {
          next.delete(folderId);
        } else {
          next.add(folderId);
          if (token) {
            dispatch(fetchFiles({ workspaceId, folderId, token }));
          }
        }
        return next;
      });
    },
    [dispatch, token, workspaceId],
  );

  const handleCreateFile = useCallback(
    async (folderId: number) => {
      if (!token) return;
      try {
        const result = await dispatch(
          createNewFile({
            workspaceId,
            folderId,
            data: { name: "Untitled" },
            token,
          }),
        ).unwrap();
        const full = await dispatch(
          fetchFile({
            workspaceId,
            folderId,
            fileId: result.file.id,
            token,
          }),
        ).unwrap();
        dispatch(setActiveFile(full));
        dispatch(setActiveFolderId(folderId));
        setExpandedIds((prev) => new Set([...prev, folderId]));
        toast.success("File created");
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        toast.error("Failed to create file", { description: message });
      }
    },
    [dispatch, token, workspaceId],
  );

  const handleFileClick = useCallback(
    async (fileId: number, folderId: number) => {
      if (!token) return;
      try {
        const file = await dispatch(
          fetchFile({ workspaceId, folderId, fileId, token }),
        ).unwrap();
        dispatch(setActiveFile(file));
        dispatch(setActiveFolderId(folderId));
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Something went wrong.";
        toast.error("Failed to open file", { description: message });
      }
    },
    [dispatch, token, workspaceId],
  );

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === "folder") {
        await dispatch(
          deleteFolderById({ workspaceId, folderId: deleteTarget.id, token }),
        ).unwrap();
        if (activeFile) {
          const folderFiles = filesByFolder[deleteTarget.id];
          if (folderFiles?.some((f) => f.id === activeFile.id)) {
            dispatch(clearActiveFile());
          }
        }
        toast.success("Folder deleted", { description: deleteTarget.name });
      } else {
        await dispatch(
          deleteFileById({
            workspaceId,
            folderId: deleteTarget.folderId!,
            fileId: deleteTarget.id,
            token,
          }),
        ).unwrap();
        toast.success("File deleted", { description: deleteTarget.name });
      }
      setDeleteTarget(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Failed to delete", { description: message });
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
          {canEdit && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => setCreateModalOpen(true)}
              title="Add folder"
            >
              <Plus className="h-3.5 w-3.5" />
            </Button>
          )}
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
              const files = filesByFolder[folder.id] || [];
              return (
                <div key={folder.id}>
                  <div
                    className="group flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted"
                    onClick={() => toggleExpand(folder.id)}
                  >
                    <button
                      className="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground"
                    >
                      <ChevronRight
                        className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                      />
                    </button>
                    <FolderIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{folder.name}</span>
                    {canEdit && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 group-hover:opacity-100"
                          title="Add file"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateFile(folder.id);
                          }}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget({
                              id: folder.id,
                              name: folder.name,
                              type: "folder",
                            });
                          }}
                          title="Delete folder"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                  {isExpanded && (
                    <div className="ml-6 border-l border-border py-1 pl-2">
                      {files.length === 0 ? (
                        <p className="px-2 py-2 text-xs text-muted-foreground/70">
                          No files yet
                        </p>
                      ) : (
                        files.map((file) => (
                          <div
                            key={file.id}
                            className={`group/file flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-sm transition-colors hover:bg-muted ${activeFile?.id === file.id ? "bg-muted" : ""}`}
                            onClick={() =>
                              handleFileClick(file.id, folder.id)
                            }
                          >
                            <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <span className="flex-1 truncate">
                              {file.name}
                            </span>
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon-xs"
                                className="opacity-0 group-hover/file:opacity-100 text-muted-foreground hover:text-destructive"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeleteTarget({
                                    id: file.id,
                                    name: file.name,
                                    type: "file",
                                    folderId: folder.id,
                                  });
                                }}
                                title="Delete file"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))
                      )}
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
        title={
          deleteTarget?.type === "folder" ? "Delete folder" : "Delete file"
        }
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  );
}
