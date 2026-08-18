"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { FolderTree, FileText, Search } from "lucide-react";
import Sidebar from "@/components/sidebar/sidebar";
import ThemeToggle from "@/app/components/theme-toggle";
import CreateWorkspaceModal from "@/app/components/create-workspace-modal";
import FileEditor from "@/components/editor/file-editor";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { fetchWorkspaces, setActiveWorkspace } from "@/store/workspaces-slice";
import { clearActiveFile } from "@/store/files-slice";
import { fetchWorkspaceMembers } from "@/store/collaborators-slice";
import { getMyRole, type Role } from "@/lib/api";

const ROLE_COLORS: Record<Role, string> = {
  OWNER: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  EDITOR: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  VIEWER: "bg-muted text-muted-foreground",
};

function MemberAvatars({ emails }: { emails: string[] }) {
  const shown = emails.slice(0, 5);
  const overflow = emails.length - shown.length;

  return (
    <div className="flex items-center -space-x-2">
      {shown.map((email, i) => {
        const initial = email?.charAt(0).toUpperCase() || "?";
        const hue = [...email].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0);
        return (
          <div
            key={email + i}
            title={email}
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background text-[11px] font-medium text-white ring-0"
            style={{ backgroundColor: `hsl(${hue}, 55%, 45%)`, zIndex: shown.length - i }}
          >
            {initial}
          </div>
        );
      })}
      {overflow > 0 && (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-muted text-[11px] font-medium text-muted-foreground">
          +{overflow}
        </div>
      )}
    </div>
  );
}

export default function WorkspacePage() {
  const router = useRouter();
  const params = useParams();
  const workspaceId = Number(params.workspaceId);
  const dispatch = useAppDispatch();
  const { isAuthenticated, token, hydrated, user } = useAppSelector(
    (state) => state.auth,
  );
  const { workspaces, loading } = useAppSelector((state) => state.workspaces);
  const { activeFile, activeFolderId } = useAppSelector((state) => state.files);
  const { members } = useAppSelector((state) => state.collaborators);
  const [modalOpen, setModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">(
    "saved",
  );
  const [userRole, setUserRole] = useState<Role | null>(null);

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

  useEffect(() => {
    return () => {
      dispatch(clearActiveFile());
    };
  }, [workspaceId, dispatch]);

  useEffect(() => {
    if (!token || !workspaceId) return;
    getMyRole(workspaceId, token).then((role) => {
      const workspace = workspaces.find((ws) => ws.id === workspaceId);
      if (workspace?.owner?.id === user?.id) {
        setUserRole("OWNER");
      } else {
        setUserRole(role);
      }
    });
  }, [workspaceId, token, workspaces, user]);

  useEffect(() => {
    if (token && workspaceId) {
      dispatch(fetchWorkspaceMembers(workspaceId));
    }
  }, [token, workspaceId, dispatch]);

  const handleStatusChange = useCallback(
    (status: "saved" | "saving" | "error") => {
      setSaveStatus(status);
    },
    [],
  );

  const [editorTitle, setEditorTitle] = useState("");
  const handleTitleChange = useCallback((title: string) => {
    setEditorTitle(title);
  }, []);

  const displayTitle = editorTitle || activeFile?.name || "";

  if (!hydrated || !isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  const workspace = workspaces.find((ws) => ws.id === workspaceId);
  const memberEmails = members.map((m) => m.userEmail).filter(Boolean);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        onOpenCreateModal={() => setModalOpen(true)}
        workspaceId={workspaceId}
        userRole={userRole}
      />

      <main className="flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-6">
          {activeFile ? (
            <>
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <h1 className="truncate text-sm font-medium">
                {displayTitle || activeFile.name}
              </h1>
              <span
                className={`shrink-0 text-xs ${saveStatus === "error" ? "text-destructive" : "text-muted-foreground"}`}
              >
                {saveStatus === "saving"
                  ? "Saving..."
                  : saveStatus === "error"
                    ? "Save failed"
                    : "Saved"}
              </span>
            </>
          ) : workspace ? (
            <>
              <span className="text-xl">{workspace.icon}</span>
              <h1 className="text-lg font-semibold">{workspace.name}</h1>
              {workspace.description && (
                <span className="text-sm text-muted-foreground">
                  {workspace.description}
                </span>
              )}
            </>
          ) : null}
          <div className="ml-auto flex items-center gap-3">
            {userRole && (
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ROLE_COLORS[userRole]}`}>
                {userRole}
              </span>
            )}
            {memberEmails.length > 0 && (
              <MemberAvatars emails={memberEmails} />
            )}
            <ThemeToggle />
            <button className="flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Search className="h-4 w-4" />
              Search
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
            </div>
          ) : activeFile && activeFolderId ? (
            <FileEditor
              file={activeFile}
              workspaceId={workspaceId}
              folderId={activeFolderId}
              userRole={userRole}
              onStatusChange={handleStatusChange}
              onTitleChange={handleTitleChange}
            />
          ) : workspace ? (
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <FolderTree className="h-8 w-8 text-muted-foreground" />
              </div>
              <h2 className="mb-1 text-lg font-semibold">{workspace.name}</h2>
              <p className="max-w-sm text-sm text-muted-foreground">
                {workspace.description ||
                  "Start adding folders and files to organize your workspace."}
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-center py-24">
              <p className="text-muted-foreground">Workspace not found</p>
            </div>
          )}
        </div>
      </main>

      <CreateWorkspaceModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
