"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import {
  FolderTree,
  LogOut,
  Plus,
  Search,
  Settings,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/auth-slice";

export default function DashboardPage() {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="flex w-64 flex-col border-r border-border bg-card">
        <div className="flex h-14 items-center gap-2 border-b border-border px-4">
          <FolderTree className="h-5 w-5 text-primary" />
          <span className="text-lg font-bold tracking-tight">orbit</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <button className="flex w-full items-center gap-2.5 rounded-lg bg-muted px-3 py-2 text-sm font-medium text-foreground transition-colors">
            <FolderTree className="h-4 w-4" />
            Workspaces
          </button>
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3 px-2 py-1.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
              {user?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 truncate text-sm">
              <p className="truncate font-medium">{user?.email}</p>
            </div>
            <button
              onClick={() => {
                dispatch(logout());
                router.push("/");
              }}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="flex h-14 items-center justify-between border-b border-border px-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Workspaces</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Search className="h-4 w-4" />
              Search
            </button>
            <button className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              <Plus className="h-4 w-4" />
              New workspace
            </button>
          </div>
        </header>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
            <FolderTree className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-1 text-lg font-semibold">No workspaces yet</h2>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Create your first workspace to start organizing projects with nested
            folders and files.
          </p>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Create workspace
          </button>
        </div>
      </main>
    </div>
  );
}
