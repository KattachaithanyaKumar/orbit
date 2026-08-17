"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FolderTree, Search } from "lucide-react";
import Sidebar from "@/components/sidebar/sidebar";
import ThemeToggle from "@/app/components/theme-toggle";
import CreateWorkspaceModal from "@/app/components/create-workspace-modal";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchWorkspaces, setActiveWorkspace } from "@/store/workspaces-slice";

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, hydrated } = useAppSelector((state) => state.auth);
  const { workspaces, loading } = useAppSelector((state) => state.workspaces);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, hydrated, router]);

  useEffect(() => {
    if (isAuthenticated && token) {
      dispatch(fetchWorkspaces(token));
    }
  }, [isAuthenticated, token, dispatch]);

  useEffect(() => {
    if (workspaces.length > 0 && workspaceId) {
      const exists = workspaces.some((ws) => ws.id === workspaceId);
      if (exists) {
        dispatch(setActiveWorkspace(workspaceId));
      } else if (!loading) {
        router.push("/dashboard");
      }
    }
  }, [workspaces, workspaceId, loading, dispatch, router]);

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  const workspace = workspaces.find((ws) => ws.id === workspaceId);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onOpenCreateModal={() => setModalOpen(true)} />

      <main className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : workspace ? (
          <div className="flex flex-col h-full">
            <header className="flex h-14 items-center gap-3 border-b border-border px-6">
              <span className="text-xl">{workspace.icon}</span>
              <h1 className="text-lg font-semibold">{workspace.name}</h1>
              {workspace.description && (
                <span className="text-sm text-muted-foreground">
                  {workspace.description}
                </span>
              )}
              <div className="ml-auto flex items-center gap-2">
                <ThemeToggle />
                <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                  <Search className="h-4 w-4" />
                  Search
                </button>
              </div>
            </header>

            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted mx-auto">
                  <FolderTree className="h-8 w-8 text-muted-foreground" />
                </div>
                <h2 className="mb-1 text-lg font-semibold">
                  {workspace.name}
                </h2>
                <p className="max-w-sm text-sm text-muted-foreground">
                  {workspace.description || "Start adding folders and files to organize your workspace."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-24">
            <p className="text-muted-foreground">Workspace not found</p>
          </div>
        )}
      </main>

      <CreateWorkspaceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
