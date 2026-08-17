"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  setActiveWorkspace,
  deleteWorkspaceById,
  fetchWorkspaces,
} from "@/store/workspaces-slice";

interface WorkspaceSwitcherProps {
  onOpenCreateModal: () => void;
}

export default function WorkspaceSwitcher({
  onOpenCreateModal,
}: WorkspaceSwitcherProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { workspaces, activeWorkspaceId, loading } = useAppSelector(
    (state) => state.workspaces,
  );
  const token = useAppSelector((state) => state.auth.token);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const activeWorkspace = workspaces.find((ws) => ws.id === activeWorkspaceId);

  useEffect(() => {
    if (workspaces.length > 0 && !activeWorkspace) {
      const first = workspaces[0];
      dispatch(setActiveWorkspace(first.id));
      router.push(`/dashboard/${first.id}`);
    }
  }, [workspaces, activeWorkspace, dispatch, router]);

  const handleSelectWorkspace = (id: number) => {
    dispatch(setActiveWorkspace(id));
    router.push(`/dashboard/${id}`);
  };

  const handleDelete = async () => {
    if (!token || !deleteTarget) return;

    setDeleting(true);
    try {
      await dispatch(deleteWorkspaceById({ id: deleteTarget.id, token })).unwrap();
      const result = await dispatch(fetchWorkspaces(token)).unwrap();
      toast.success("Workspace deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
      if (activeWorkspaceId === deleteTarget.id && result.length > 0) {
        const next = result[0];
        dispatch(setActiveWorkspace(next.id));
        router.push(`/dashboard/${next.id}`);
      } else if (result.length === 0) {
        dispatch(setActiveWorkspace(null));
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      toast.error("Failed to delete workspace", { description: message });
    } finally {
      setDeleting(false);
    }
  };

  if (loading && workspaces.length === 0) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <button
        onClick={() => onOpenCreateModal()}
        className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Plus className="h-4 w-4" />
        Create a workspace
      </button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-muted">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-sm"
            style={{
              backgroundColor: activeWorkspace.accentColor + "20",
              color: activeWorkspace.accentColor,
            }}
          >
            {activeWorkspace.icon}
          </span>
          <span className="flex-1 truncate text-sm font-medium">
            {activeWorkspace.name}
          </span>
          <svg
            className="h-4 w-4 shrink-0 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m7 15 5 5 5-5" />
            <path d="m7 9 5-5 5 5" />
          </svg>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          {workspaces.map((ws) => (
            <DropdownMenuItem
              key={ws.id}
              onClick={() => handleSelectWorkspace(ws.id)}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs"
                style={{
                  backgroundColor: ws.accentColor + "20",
                  color: ws.accentColor,
                }}
              >
                {ws.icon}
              </span>
              <span className="flex-1 truncate">{ws.name}</span>
              {ws.id === activeWorkspaceId && (
                <Check className="h-4 w-4 shrink-0 text-primary" />
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteTarget({ id: ws.id, name: ws.name });
                }}
                className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive"
                title="Delete workspace"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onOpenCreateModal()}>
            <Plus className="h-4 w-4" />
            <span>New workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete workspace"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All folders and files inside will be permanently deleted.`}
        confirmLabel="Delete"
        loading={deleting}
      />
    </>
  );
}
