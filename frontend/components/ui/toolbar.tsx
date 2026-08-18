"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

function Toolbar({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="toolbar"
      data-slot="toolbar"
      className={cn(
        "flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1 sm:px-3 sm:py-1.5",
        className
      )}
      {...props}
    />
  )
}

function ToolbarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-group"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

function ToolbarSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="toolbar-separator"
      className={cn("mx-1.5 h-5 w-px bg-border", className)}
      role="separator"
      {...props}
    />
  )
}

export { Toolbar, ToolbarGroup, ToolbarSeparator }
