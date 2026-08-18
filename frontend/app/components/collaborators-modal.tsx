"use client"

import * as React from "react"
import { toast } from "sonner"
import { Search, UserPlus, Trash2, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import {
  fetchWorkspaceMembers,
  addNewMember,
  updateMemberRoleThunk,
  removeMemberThunk,
  searchUsersThunk,
  clearError,
  clearSearchResults,
} from "@/store/collaborators-slice"
import type { RootState } from "@/store"

interface Collaborator {
  id: number
  userId: number
  role: string
  joinedAt: string
  userEmail: string
}

interface UserSearchResult {
  id: number
  email: string
  isMember: boolean
}

const ROLES = ["ADMIN", "EDITOR", "VIEWER"] as const

const ROLE_COLORS: Record<string, string> = {
  OWNER: "bg-primary/10 text-primary",
  ADMIN: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  EDITOR: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  VIEWER: "bg-muted text-muted-foreground",
}

const SELECT_CLASS =
  "h-7 rounded-md border border-border bg-background px-2 text-xs font-medium outline-none focus:border-ring focus:ring-1 focus:ring-ring/50 cursor-pointer"

interface CollaboratorsModalProps {
  workspaceId: number
  open: boolean
  onClose: () => void
}

export default function CollaboratorsModal({
  workspaceId,
  open,
  onClose,
}: CollaboratorsModalProps) {
  const dispatch = useAppDispatch()
  const { members, loading, searchResults, searchLoading } = useAppSelector(
    (state: RootState) => state.collaborators,
  )
  const { user } = useAppSelector((state) => state.auth)

  const [searchQuery, setSearchQuery] = React.useState("")
  const [pendingRole, setPendingRole] = React.useState<Record<number, string>>({})

  React.useEffect(() => {
    if (open) {
      dispatch(fetchWorkspaceMembers(workspaceId))
      dispatch(clearError())
      setSearchQuery("")
    }
  }, [open, workspaceId, dispatch])

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    dispatch(searchUsersThunk({ workspaceId, email: searchQuery.trim() }))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch()
  }

  const handleAddMember = (userId: number, role: string) => {
    dispatch(addNewMember({ workspaceId, userId, role }))
      .unwrap()
      .then(() => {
        toast.success("Member added")
        setSearchQuery("")
        dispatch(clearSearchResults())
        dispatch(fetchWorkspaceMembers(workspaceId))
      })
      .catch((err: string) => toast.error(err))
  }

  const handleRoleChange = (userId: number, newRole: string) => {
    dispatch(updateMemberRoleThunk({ workspaceId, userId, role: newRole }))
      .unwrap()
      .then(() => {
        toast.success("Role updated")
        dispatch(fetchWorkspaceMembers(workspaceId))
      })
      .catch((err: string) => toast.error(err))
  }

  const handleRemoveMember = (userId: number) => {
    dispatch(removeMemberThunk({ workspaceId, userId }))
      .unwrap()
      .then(() => {
        toast.success("Member removed")
      })
      .catch((err: string) => toast.error(err))
  }

  const canManage = user?.id && (
    members.find((m: Collaborator) => m.userId === user.id && (m.role === "OWNER" || m.role === "ADMIN"))
  )

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Collaborators</DialogTitle>
        </DialogHeader>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-9"
            />
          </div>
          <Button
            variant="outline"
            onClick={handleSearch}
            disabled={!searchQuery.trim() || searchLoading}
          >
            {searchLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Search"
            )}
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Results</p>
            <div className="max-h-40 space-y-1 overflow-y-auto rounded-lg border border-border">
              {searchResults.map((result: UserSearchResult) => {
                const roleForNew = pendingRole[result.id] || "EDITOR"
                return (
                  <div
                    key={result.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {result.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="flex-1 truncate text-sm">{result.email}</span>
                    {result.isMember ? (
                      <span className="text-xs text-muted-foreground">Already a member</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <select
                          className={SELECT_CLASS}
                          value={roleForNew}
                          onChange={(e) =>
                            setPendingRole((prev) => ({ ...prev, [result.id]: e.target.value }))
                          }
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <Button
                          size="xs"
                          onClick={() => handleAddMember(result.id, roleForNew)}
                        >
                          <UserPlus className="h-3 w-3" />
                          Add
                        </Button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Members ({members.length})
          </p>
          <div className="max-h-60 space-y-1 overflow-y-auto rounded-lg border border-border">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No collaborators yet
              </p>
            ) : (
              members.map((member: Collaborator) => {
                const isCurrentUser = member.userId === user?.id
                const isOwner = member.role === "OWNER"
                return (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-muted/50"
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {member.userEmail?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium">{member.userEmail}</p>
                      {isCurrentUser && (
                        <p className="text-xs text-muted-foreground">You</p>
                      )}
                    </div>
                    {canManage && !isOwner ? (
                      <div className="flex items-center gap-1.5">
                        <select
                          className={SELECT_CLASS}
                          value={member.role}
                          onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                        >
                          {ROLES.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleRemoveMember(member.userId)}
                          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                          title="Remove member"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${ROLE_COLORS[member.role] || ""}`}
                      >
                        {member.role}
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>

        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  )
}
