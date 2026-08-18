"use client"

import { useEffect, useRef, useCallback } from "react"
import { useSelector } from "react-redux"
import { getSocket, initSocket } from "@/lib/socket"

interface RemoteCursor {
  userId: number
  email: string
  x: number
  y: number
}

interface RemoteCursorsExtensionProps {
  userId: number
  userEmail: string
}

export function useRemoteCursors({
  userId,
  userEmail,
}: RemoteCursorsExtensionProps) {
  const token = useSelector((state: any) => state.auth.token)
  const editorRef = useRef<any>(null)
  const cursorPositionRef = useRef({ x: 0, y: 0 })
  const throttledBroadcastRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Initialize socket if not already initialized
  useEffect(() => {
    if (token) {
      initSocket(token)
    }
  }, [token])

  // Broadcast cursor position
  const broadcastCursor = useCallback((editor: any) => {
    if (!token) return

    if (throttledBroadcastRef.current) clearTimeout(throttledBroadcastRef.current)

    throttledBroadcastRef.current = setTimeout(() => {
      const selection = editor?.state?.selection
      if (!selection?.empty) {
        const { from } = selection
        const nodePos = editor?.state?.doc?.resolve(from)
        if (nodePos && nodePos?.nodeAt) {
          const node = nodePos?.nodeAt(0)
          if (node) {
            const top = node?.top
            const left = node?.node?.left

            const socket = getSocket()
            if (socket?.connected) {
              socket.emit('cursor-update', {
                workspaceId: 1,
                cursorX: left || 0,
                cursorY: top || 0,
              })
            }
          }
        }
      }
    }, 100)
  }, [token])

  // Handle incoming cursor updates from other users
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    socket.on('cursor-update', (data: { userId: number; email: string; cursorX: number; cursorY: number }) => {
      // Store remote cursor position for rendering
    })

    return () => {
      socket.off('cursor-update')
    }
  }, [])

  // Create ProseMirror decorations for remote cursors
  useEffect(() => {
    if (!editorRef.current) return

    const socket = getSocket()
    if (!socket) return

    const onUpdate = () => {
      // Render own cursor position
      const ownPos = editorRef.current?.state?.selection
      if (ownPos) {
        const coord = editorRef.current?.coords?.from(ownPos.from)
        if (coord) {
          const span = document.createElement('span')
          span.className = `orbit-cursor orbit-cursor-${userId}`
          span.style.cssText = `
            position: absolute;
            left: ${coord.left}px;
            top: ${coord.top}px;
            width: 2px;
            height: 1.2em;
            background-color: #3b82f6;
            z-index: 9999;
            pointer-events: none;
          `
          const viewDom = editorRef.current.view.dom
          if (viewDom) {
            viewDom.appendChild(span)
            setTimeout(() => span?.remove?.(), 1000)
          }
        }
      }

      editorRef.current?.setDecorations?.([])
    }

    socket.on('cursor-update', onUpdate)
    return () => {
      socket.off('cursor-update', onUpdate)
    }
  }, [userId])

  return null
}

export default function RemoteCursorsExtension({
  userId,
  userEmail,
}: RemoteCursorsExtensionProps) {
  useRemoteCursors({ userId, userEmail })

  return null
}