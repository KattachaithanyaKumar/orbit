"use client"

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { LogOut, Settings, Users, X } from "lucide-react";
import { logout } from "@/store/auth-slice";
import WorkspaceSwitcher from "./workspace-switcher";
import FileTree from "./file-tree";
import CollaboratorsModal from "@/app/components/collaborators-modal";
import type { Role } from "@/lib/api";

interface SidebarProps {
  onOpenCreateModal: () => void;
  workspaceId?: number;
  userRole?: Role | null;
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ onOpenCreateModal, workspaceId, userRole, open, onClose }: SidebarProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [collaboratorsModalOpen, setCollaboratorsModalOpen] = useState(false);

  const canSeeCollaborators = userRole === "OWNER" || userRole === "ADMIN" || (workspaceId != null && userRole === null);

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card
          transition-transform duration-200 ease-in-out
          md:static md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
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
          {onClose && (
            <button
              onClick={onClose}
              className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="border-b border-border p-3">
          <WorkspaceSwitcher onOpenCreateModal={onOpenCreateModal} />
        </div>

        {workspaceId && (
          <FileTree workspaceId={workspaceId} userRole={userRole} />
        )}

        <div className="mt-auto border-t border-border p-3">
          <nav className="space-y-1">
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            {canSeeCollaborators && (
              <button
                onClick={() => setCollaboratorsModalOpen(true)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Users className="h-4 w-4" />
                Collaborators
              </button>
            )}
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

        {workspaceId && (
          <CollaboratorsModal
            workspaceId={workspaceId}
            open={collaboratorsModalOpen}
            onClose={() => setCollaboratorsModalOpen(false)}
          />
        )}
      </aside>
    </>
  );
}
