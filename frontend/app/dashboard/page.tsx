"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FolderTree, Menu } from "lucide-react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <Sidebar
        onOpenCreateModal={() => setModalOpen(true)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="flex flex-1 flex-col overflow-auto">
        <header className="flex h-14 shrink-0 items-center justify-end border-b border-border px-3 sm:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <ThemeToggle />
        </header>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <FolderTree className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="mb-1 text-lg font-semibold">Select a workspace</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Choose a workspace from the sidebar or create a new one to get
              started.
            </p>
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
