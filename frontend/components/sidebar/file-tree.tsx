"use client";

import { FolderTree, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FileTree({ workspaceId }: { workspaceId: number }) {
  return (
    <div className="flex-1 overflow-auto px-2 py-2">
      <div className="mb-2 flex items-center justify-between px-2">
        <span className="text-xs font-medium text-muted-foreground">
          Files
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={() => {
            /* TODO: open create folder modal */
          }}
          title="Add folder"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center py-8 text-center">
        <FolderTree className="mb-2 h-8 w-8 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">No folders yet</p>
        <p className="text-xs text-muted-foreground/70">
          Click + to create one
        </p>
      </div>
    </div>
  );
}
