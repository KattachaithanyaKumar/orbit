"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { logout } from "@/store/auth-slice";
import WorkspaceSwitcher from "./workspace-switcher";
import FileTree from "./file-tree";

interface SidebarProps {
  onOpenCreateModal: () => void;
}

export default function Sidebar({ onOpenCreateModal }: SidebarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { activeWorkspaceId } = useAppSelector((state) => state.workspaces);

  return (
    <aside className="flex w-64 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <img
          src="/orbit-logo-dark.svg"
          alt="Orbit"
          className="h-8 w-8 rounded-md block dark:hidden"
        />
        <img
          src="/orbit-logo-light.svg"
          alt="Orbit"
          className="h-8 w-8 rounded-md hidden dark:block"
        />
        <span className="text-lg font-bold tracking-tight">orbit</span>
      </div>

      <div className="border-b border-border p-3">
        <WorkspaceSwitcher onOpenCreateModal={onOpenCreateModal} />
      </div>

      {activeWorkspaceId && (
        <FileTree workspaceId={activeWorkspaceId} />
      )}

      <div className="mt-auto border-t border-border p-3">
        <nav className="space-y-1">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </nav>
      </div>

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
  );
}
