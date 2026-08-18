"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { getSocket, initSocket } from "@/lib/socket";

const CURSOR_COLORS = [
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

function hashToColor(userId: number): string {
  return CURSOR_COLORS[userId % CURSOR_COLORS.length];
}

export interface RemoteCursor {
  userId: number;
  userName: string;
  userColor: string;
  offset: number;
  docSize: number;
}

export interface RemoteFileUpdate {
  fileId: number;
  content: unknown;
  name?: string;
  userId: number;
}

export interface PresenceUser {
  userId: number;
  email: string;
}

interface UseCollaborationOptions {
  fileId: number;
  workspaceId: number;
  userId: number;
  token: string;
}

export function useCollaboration({
  fileId,
  workspaceId,
  userId,
  token,
}: UseCollaborationOptions) {
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [remoteFileUpdate, setRemoteFileUpdate] =
    useState<RemoteFileUpdate | null>(null);
  const [workspaceMembers, setWorkspaceMembers] = useState<PresenceUser[]>([]);
  const [fileViewers, setFileViewers] = useState<PresenceUser[]>([]);
  const cursorsRef = useRef<Map<number, RemoteCursor>>(new Map());
  const throttledCursorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [myColor] = useState(() => hashToColor(userId));
  const fileIdRef = useRef(fileId);
  const userIdRef = useRef(userId);
  const workspaceIdRef = useRef(workspaceId);

  useEffect(() => {
    fileIdRef.current = fileId;
    userIdRef.current = userId;
    workspaceIdRef.current = workspaceId;
  });

  useEffect(() => {
    if (!token) return;

    const socket = initSocket(token);

    function onConnect() {
      socket.emit("workspace-join", { workspaceId: workspaceIdRef.current });
      socket.emit("file-open", { fileId: fileIdRef.current });
    }

    function handleWorkspaceMembers(data: {
      workspaceId: number;
      members: PresenceUser[];
    }) {
      if (data.workspaceId !== workspaceIdRef.current) return;
      setWorkspaceMembers(
        data.members.filter((m) => m.userId !== userIdRef.current),
      );
    }

    function handleUserJoinedWorkspace(data: {
      userId: number;
      email: string;
      workspaceId: number;
    }) {
      if (data.workspaceId !== workspaceIdRef.current) return;
      if (data.userId === userIdRef.current) return;
      setWorkspaceMembers((prev) => {
        if (prev.some((m) => m.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, email: data.email }];
      });
    }

    function handleUserLeftWorkspace(data: {
      userId: number;
      workspaceId: number;
    }) {
      if (data.workspaceId !== workspaceIdRef.current) return;
      setWorkspaceMembers((prev) =>
        prev.filter((m) => m.userId !== data.userId),
      );
    }

    function handleFileViewers(data: {
      fileId: number;
      viewers: PresenceUser[];
    }) {
      if (data.fileId !== fileIdRef.current) return;
      setFileViewers(
        data.viewers.filter((v) => v.userId !== userIdRef.current),
      );
    }

    function handleUserEnteredFile(data: {
      userId: number;
      email: string;
      fileId: number;
    }) {
      if (data.fileId !== fileIdRef.current) return;
      if (data.userId === userIdRef.current) return;
      setFileViewers((prev) => {
        if (prev.some((v) => v.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, email: data.email }];
      });
    }

    function handleUserLeftFile(data: { userId: number; fileId: number }) {
      if (data.fileId !== fileIdRef.current) return;
      setFileViewers((prev) =>
        prev.filter((v) => v.userId !== data.userId),
      );
    }

    function handleFileUpdated(data: RemoteFileUpdate) {
      if (data.userId === userIdRef.current) return;
      if (data.fileId !== fileIdRef.current) return;
      setRemoteFileUpdate(data);
    }

    function handleCursorMoved(data: {
      fileId: number;
      userId: number;
      userName: string;
      userColor: string;
      offset: number;
      docSize: number;
    }) {
      if (data.userId === userIdRef.current) return;
      if (data.fileId !== fileIdRef.current) return;

      cursorsRef.current.set(data.userId, {
        userId: data.userId,
        userName: data.userName,
        userColor: data.userColor,
        offset: data.offset,
        docSize: data.docSize,
      });
      setRemoteCursors(Array.from(cursorsRef.current.values()));
    }

    function handleCursorRemove(data: { userId: number }) {
      cursorsRef.current.delete(data.userId);
      setRemoteCursors(Array.from(cursorsRef.current.values()));
    }

    function handleUserOnline(data: { userId: number; email: string }) {
      if (data.userId === userIdRef.current) return;
      setWorkspaceMembers((prev) => {
        if (prev.some((m) => m.userId === data.userId)) return prev;
        return [...prev, { userId: data.userId, email: data.email }];
      });
    }

    function handleUserOffline(data: { userId: number }) {
      if (data.userId === userIdRef.current) return;
      setWorkspaceMembers((prev) =>
        prev.filter((m) => m.userId !== data.userId),
      );
      setFileViewers((prev) =>
        prev.filter((v) => v.userId !== data.userId),
      );
    }

    if (socket.connected) {
      socket.emit("workspace-join", { workspaceId });
      socket.emit("file-open", { fileId });
    }

    socket.on("connect", onConnect);
    socket.on("workspace-members", handleWorkspaceMembers);
    socket.on("user-joined-workspace", handleUserJoinedWorkspace);
    socket.on("user-left-workspace", handleUserLeftWorkspace);
    socket.on("file-viewers", handleFileViewers);
    socket.on("user-entered-file", handleUserEnteredFile);
    socket.on("user-left-file", handleUserLeftFile);
    socket.on("file-updated", handleFileUpdated);
    socket.on("cursor-moved", handleCursorMoved);
    socket.on("cursor-remove", handleCursorRemove);
    socket.on("user-online", handleUserOnline);
    socket.on("user-offline", handleUserOffline);

    return () => {
      socket.emit("file-close", { fileId: fileIdRef.current });
      socket.emit("workspace-leave", {
        workspaceId: workspaceIdRef.current,
      });
      socket.off("connect", onConnect);
      socket.off("workspace-members", handleWorkspaceMembers);
      socket.off("user-joined-workspace", handleUserJoinedWorkspace);
      socket.off("user-left-workspace", handleUserLeftWorkspace);
      socket.off("file-viewers", handleFileViewers);
      socket.off("user-entered-file", handleUserEnteredFile);
      socket.off("user-left-file", handleUserLeftFile);
      socket.off("file-updated", handleFileUpdated);
      socket.off("cursor-moved", handleCursorMoved);
      socket.off("cursor-remove", handleCursorRemove);
      socket.off("user-online", handleUserOnline);
      socket.off("user-offline", handleUserOffline);
    };
  }, [token, fileId, workspaceId]);

  const broadcastCursor = useCallback(
    (offset: number, docSize: number) => {
      const socket = getSocket();
      if (!socket?.connected) return;

      if (throttledCursorRef.current) {
        clearTimeout(throttledCursorRef.current);
      }

      throttledCursorRef.current = setTimeout(() => {
        socket.emit("cursor-update", {
          fileId: fileIdRef.current,
          userId: userIdRef.current,
          userColor: myColor,
          offset,
          docSize,
        });
      }, 50);
    },
    [myColor],
  );

  const broadcastFileUpdate = useCallback(
    (content: unknown, name?: string) => {
      const socket = getSocket();
      if (!socket?.connected) return;

      socket.emit("file-update", {
        fileId: fileIdRef.current,
        content,
        name,
      });
    },
    [],
  );

  const clearRemoteUpdate = useCallback(() => {
    setRemoteFileUpdate(null);
  }, []);

  useEffect(() => {
    return () => {
      if (throttledCursorRef.current) {
        clearTimeout(throttledCursorRef.current);
      }
    };
  }, []);

  return {
    remoteCursors,
    remoteFileUpdate,
    clearRemoteUpdate,
    broadcastCursor,
    broadcastFileUpdate,
    myColor,
    workspaceMembers,
    fileViewers,
  };
}
