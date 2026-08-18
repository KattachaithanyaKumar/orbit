"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { Command } from "cmdk";
import {
  FileText,
  FolderPlus,
  FilePlus,
  Users,
  Sun,
  ArrowRight,
  Folder,
  Check,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  createNewFile,
  fetchFile,
  fetchFiles,
  setActiveFile,
  setActiveFolderId,
} from "@/store/files-slice";
import { setActiveWorkspace } from "@/store/workspaces-slice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  workspaceId: number;
  expandedFolderIds: number[];
  activeFolderId: number | null;
  onOpenCreateFolder: () => void;
  onOpenCollaborators: () => void;
  onOpenCreateWorkspace: () => void;
}

function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");
  const next = !isDark;
  document.documentElement.classList.toggle("dark", next);
  localStorage.setItem("theme", next ? "dark" : "light");
}

export default function CommandPalette({
  open,
  onClose,
  workspaceId,
  expandedFolderIds,
  activeFolderId,
  onOpenCreateFolder,
  onOpenCollaborators,
  onOpenCreateWorkspace,
}: CommandPaletteProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const { folders } = useAppSelector((state) => state.folders);
  const { filesByFolder } = useAppSelector((state) => state.files);
  const { workspaces } = useAppSelector((state) => state.workspaces);
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<"home" | "pick-folder">("home");
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      setStep("home");
      setSelectedFolderId(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const getDefaultFolderId = useCallback(() => {
    if (expandedFolderIds.length > 0) {
      return expandedFolderIds[expandedFolderIds.length - 1];
    }
    if (activeFolderId) {
      return activeFolderId;
    }
    if (folders.length === 1) {
      return folders[0].id;
    }
    return null;
  }, [expandedFolderIds, activeFolderId, folders]);

  const createFileInFolder = useCallback(
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
        await dispatch(fetchFiles({ workspaceId, folderId, token }));
        const full = await dispatch(
          fetchFile({ workspaceId, folderId, fileId: result.file.id, token }),
        ).unwrap();
        dispatch(setActiveFile(full));
        dispatch(setActiveFolderId(folderId));
        toast.success("File created");
        onClose();
      } catch {
        toast.error("Failed to create file");
      }
    },
    [dispatch, token, workspaceId, onClose],
  );

  const handleOpenFile = useCallback(
    async (fileId: number, folderId: number) => {
      if (!token) return;
      try {
        const file = await dispatch(
          fetchFile({ workspaceId, folderId, fileId, token }),
        ).unwrap();
        dispatch(setActiveFile(file));
        dispatch(setActiveFolderId(folderId));
        onClose();
      } catch {
        toast.error("Failed to open file");
      }
    },
    [dispatch, token, workspaceId, onClose],
  );

  const handleNewFile = useCallback(() => {
    if (folders.length === 0) {
      toast.info("Create a folder first");
      onClose();
      return;
    }
    const defaultId = getDefaultFolderId();
    if (defaultId !== null) {
      createFileInFolder(defaultId);
    } else {
      setSelectedFolderId(null);
      setStep("pick-folder");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [folders, getDefaultFolderId, createFileInFolder, onClose]);

  const handlePickFolder = useCallback(
    (folderId: number) => {
      createFileInFolder(folderId);
    },
    [createFileInFolder],
  );

  const handleSwitchWorkspace = useCallback(
    (id: number) => {
      dispatch(setActiveWorkspace(id));
      router.push(`/dashboard/${id}`);
      onClose();
    },
    [dispatch, router, onClose],
  );

  const handleCreateFolder = useCallback(() => {
    onOpenCreateFolder();
    onClose();
  }, [onOpenCreateFolder, onClose]);

  const handleOpenCollaborators = useCallback(() => {
    onOpenCollaborators();
    onClose();
  }, [onOpenCollaborators, onClose]);

  const handleCreateWorkspace = useCallback(() => {
    onOpenCreateWorkspace();
    onClose();
  }, [onOpenCreateWorkspace, onClose]);

  const isPickingFolder = step === "pick-folder";

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden p-0 sm:max-w-lg"
      >
        <Command
          loop
          className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-input-wrapper]_svg]:h-4 [&_[cmdk-input-wrapper]_svg]:w-4 [&_[cmdk-input]]:h-10 [&_[cmdk-input]]:rounded-lg [&_[cmdk-input]]:border-0 [&_[cmdk-input]]:bg-transparent [&_[cmdk-input]]:px-3 [&_[cmdk-input]]:text-sm [&_[cmdk-input]]:outline-none [&_[cmdk-item]]:flex [&_[cmdk-item]]:cursor-pointer [&_[cmdk-item]]:items-center [&_[cmdk-item]]:gap-2 [&_[cmdk-item]]:rounded-md [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-2 [&_[cmdk-item]]:text-sm [&_[cmdk-item]]:transition-colors [&_[cmdk-item]_svg]:h-4 [&_[cmdk-item]_svg]:w-4 [&_[cmdk-item]]:data-[selected=true]:bg-muted [&_[cmdk-item]]:data-[selected=true]:text-foreground [&_[cmdk-item]]:data-[disabled=true]:pointer-events-none [&_[cmdk-item]]:data-[disabled=true]:opacity-50 [&_[cmdk-list]]:max-h-[300px] [&_[cmdk-list]]:overflow-y-auto [&_[cmdk-list]]:overflow-x-hidden"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              if (isPickingFolder) {
                e.preventDefault();
                e.stopPropagation();
                setStep("home");
                setTimeout(() => inputRef.current?.focus(), 0);
              }
            }
          }}
        >
          <div className="flex items-center border-b border-border px-3">
            {isPickingFolder && (
              <button
                onClick={() => {
                  setStep("home");
                  setTimeout(() => inputRef.current?.focus(), 0);
                }}
                className="mr-2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ArrowRight className="h-4 w-4 rotate-180" />
              </button>
            )}
            <Command.Input
              ref={inputRef}
              placeholder={
                isPickingFolder
                  ? "Search folders..."
                  : "Type a command or search..."
              }
              className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            {isPickingFolder ? (
              <Command.Group heading="Select folder">
                {folders.map((folder) => {
                  const isSelected = selectedFolderId === folder.id;
                  return (
                    <Command.Item
                      key={folder.id}
                      value={`folder ${folder.name}`}
                      onSelect={() => handlePickFolder(folder.id)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted data-[selected=true]:bg-muted"
                    >
                      <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="flex-1 truncate">{folder.name}</span>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </Command.Item>
                  );
                })}
              </Command.Group>
            ) : (
              <>
                <Command.Group heading="Files">
                  {folders.map((folder) => {
                    const files = filesByFolder[folder.id] || [];
                    return files.map((file) => (
                      <Command.Item
                        key={file.id}
                        value={`file ${file.name} ${folder.name}`}
                        onSelect={() => handleOpenFile(file.id, folder.id)}
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted data-[selected=true]:bg-muted"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {folder.name}
                        </span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      </Command.Item>
                    ));
                  })}
                </Command.Group>

                <Command.Separator className="my-1 h-px bg-border" />

                <Command.Group heading="Workspaces">
                  {workspaces.map((ws) => (
                    <Command.Item
                      key={ws.id}
                      value={`workspace ${ws.name}`}
                      onSelect={() => handleSwitchWorkspace(ws.id)}
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted data-[selected=true]:bg-muted"
                    >
                      <span className="text-base">{ws.icon}</span>
                      <span className="flex-1 truncate">{ws.name}</span>
                      {ws.id === workspaceId && (
                        <span className="text-xs text-muted-foreground">
                          Current
                        </span>
                      )}
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </Command.Item>
                  ))}
                </Command.Group>

                <Command.Separator className="my-1 h-px bg-border" />

                <Command.Group heading="Actions">
                  <Command.Item
                    value="new file"
                    onSelect={handleNewFile}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted data-[selected=true]:bg-muted"
                  >
                    <FilePlus className="h-4 w-4 text-muted-foreground" />
                    <span>New file</span>
                  </Command.Item>
                  <Command.Item
                    value="new folder"
                    onSelect={handleCreateFolder}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted data-[selected=true]:bg-muted"
                  >
                    <FolderPlus className="h-4 w-4 text-muted-foreground" />
                    <span>New folder</span>
                  </Command.Item>
                  <Command.Item
                    value="toggle theme dark light"
                    onSelect={toggleTheme}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted data-[selected=true]:bg-muted"
                  >
                    <Sun className="h-4 w-4 text-muted-foreground" />
                    <span>Toggle theme</span>
                  </Command.Item>
                  <Command.Item
                    value="collaborators members"
                    onSelect={handleOpenCollaborators}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted data-[selected=true]:bg-muted"
                  >
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Manage collaborators</span>
                  </Command.Item>
                  <Command.Item
                    value="new workspace create"
                    onSelect={handleCreateWorkspace}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted data-[selected=true]:bg-muted"
                  >
                    <FolderPlus className="h-4 w-4 text-muted-foreground" />
                    <span>New workspace</span>
                  </Command.Item>
                </Command.Group>
              </>
            )}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
