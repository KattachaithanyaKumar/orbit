"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FolderTree } from "lucide-react";
import Sidebar from "@/components/sidebar/sidebar";
import ThemeToggle from "@/app/components/theme-toggle";
import CreateWorkspaceModal from "@/app/components/create-workspace-modal";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchWorkspaces } from "@/store/workspaces-slice";

export default function DashboardPage() {
  const { isAuthenticated, token, hydrated } = useAppSelector(
    (state) => state.auth,
  );
  const { loading } = useAppSelector((state) => state.workspaces);
  const dispatch = useAppDispatch();
  const router = useRouter();
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

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar onOpenCreateModal={() => setModalOpen(true)} />

      <main className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <header className="flex h-14 items-center justify-end border-b border-border px-6">
              <ThemeToggle />
            </header>

            <div className="flex flex-1 items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <FolderTree className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="mb-1 text-lg font-semibold">Select a workspace</h2>
              <p className="mb-6 max-w-sm text-sm text-muted-foreground">
                Choose a workspace from the sidebar or create a new one to get
                started.
              </p>
            </div>
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
