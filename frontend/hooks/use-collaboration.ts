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

interface UseCollaborationOptions {
  fileId: number;
  userId: number;
  token: string;
}

export function useCollaboration({
  fileId,
  userId,
  token,
}: UseCollaborationOptions) {
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursor[]>([]);
  const [remoteFileUpdate, setRemoteFileUpdate] =
    useState<RemoteFileUpdate | null>(null);
  const cursorsRef = useRef<Map<number, RemoteCursor>>(new Map());
  const throttledCursorRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [myColor] = useState(() => hashToColor(userId));
  const fileIdRef = useRef(fileId);
  const userIdRef = useRef(userId);

  useEffect(() => {
    fileIdRef.current = fileId;
    userIdRef.current = userId;
  });

  useEffect(() => {
    if (!token) return;

    const socket = initSocket(token);

    function onConnect() {
      socket.emit("file-open", { fileId: fileIdRef.current });
    }

    function onDisconnect() {
      // listeners will be cleaned up
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

    // If already connected, join immediately
    if (socket.connected) {
      socket.emit("file-open", { fileId });
    }

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("file-updated", handleFileUpdated);
    socket.on("cursor-moved", handleCursorMoved);
    socket.on("cursor-remove", handleCursorRemove);

    return () => {
      socket.emit("file-close", { fileId: fileIdRef.current });
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("file-updated", handleFileUpdated);
      socket.off("cursor-moved", handleCursorMoved);
      socket.off("cursor-remove", handleCursorRemove);
    };
  }, [token, fileId]);

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
  };
}
