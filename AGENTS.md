# Orbit — Agent Development Guidelines

> **Priority instruction:** Do not rebuild existing authentication or project setup. Start from the current dashboard and build the Workspace → Folders → Files foundation with realtime collaboration.

## Skills

This project uses [opencode skills](https://github.com/anthropics/skills). Installed:

- **frontend-design** (`anthropics/skills`) — consult for UI/visual decisions, layout, and styling choices.
- **code-review** (`mattpocock/skills`) — consult before opening a PR / when reviewing a diff.

Use these skills proactively when the task matches, don't wait to be asked.

- **Every change** must go through a branch + PR, never push directly to `main`
- **PRs target `main` only** — all pull requests must be created against the `main` branch
- Commit messages should be concise and descriptive
- Always run lint/typecheck before pushing if available

## Stack

| Layer        | Tech                                                                                                                                                                                                  |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend     | Next.js (App Router), React, TypeScript, Tailwind CSS, Tiptap, dnd-kit, Zustand, TanStack Query                                                                                                       |
| Backend      | Node.js, NestJS, TypeScript, REST API, Socket.IO                                                                                                                                                      |
| Database     | MySQL + Prisma ORM                                                                                                                                                                                    |
| File Storage | Free-tier object storage (e.g. Cloudflare R2 free tier, Supabase Storage free tier). **No AWS S3** — avoid paid services, everything must run at $0 cost. Never store binary files directly in MySQL. |

**Realtime:** Start with Socket.IO. Only introduce Yjs/CRDT when true concurrent editing is implemented. Only introduce Redis when scaling/pub-sub/multi-server needs require it.

## Repository Structure

Follow the **existing** repo structure — do not reorganize it. Inspect before assuming layout.

```
orbit/
├── frontend/   (app, components, features, hooks, lib, stores, types)
├── backend/    (src/{auth,users,workspaces,folders,files,permissions,realtime})
├── AGENTS.md
└── README.md
```

## Frontend Rules

- Server Components by default (workspace/page metadata, sidebar data, search, settings, auth checks).
- Client Components only where needed: Tiptap editor, drag-and-drop, slash commands, shortcuts, realtime/presence, interactive forms. Don't add `"use client"` unless required.
- **State:** TanStack Query = server state. Zustand = editor UI state (sidebar, selection, command palette). Tiptap owns document state — don't duplicate it in Zustand.

## Authentication

JWT auth is already implemented. Before touching it: inspect existing implementation, reuse existing utilities. Do not add another auth library/strategy. Every protected backend endpoint must validate the authenticated user.

## Current Priority (build in this order)

1. **Dashboard** — workspace shell, sidebar, header, user menu, logout, empty state
2. **Workspace** — model (`User → WorkspaceMember → Workspace`, roles: OWNER/ADMIN/EDITOR/VIEWER)
3. **Folders** — flat folder model per workspace, CRUD, sidebar tree
4. **Files** — files within folders, content stored as JSON (Tiptap document), CRUD
5. **Realtime collaboration** — Socket.IO connection, file rooms, cursor sync, presence
6. **Collaborators** — workspace-level permissions, member management (roles, invite, remove)
7. **Advanced collab** — Yjs/CRDT, Redis (only when required)
8. **Advanced features** — databases, templates, search, version history

Don't jump ahead — establish workspace/folder/file model before realtime.

### Realtime Progression

Socket connection → file rooms (`file:123`) → cursor sync → presence → optimistic updates → Yjs/CRDT → Redis (multi-instance only).

Server must always validate auth server-side. Never trust client-provided `userId`, `workspaceId`, `folderId`, `fileId`, or `permissions`.

## API Flow

```
Next.js → REST → NestJS → TypeORM → MySQL
```

Frontend never touches MySQL directly. Business logic lives in NestJS.

## Database

```
DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/orbit"
```

Use TypeORM entities (already configured). Never commit `.env` or credentials. Use `synchronize: true` only in development.

## Code Standards

- **TypeScript:** avoid `any` (use `unknown` when genuinely unknown); don't silence errors without understanding them.
- **Error handling:** never swallow errors silently (`catch {}`); handle, log, or propagate. Don't leak backend internals to users.
- **Performance:** correctness/maintainability first. For the editor: avoid unnecessary re-renders, don't recreate editor instances, don't duplicate document state, debounce expensive ops, don't persist every keystroke to MySQL.
- **Security:** validate all input server-side (auth, IDs, file types/sizes, permissions, payloads). Never commit secrets.

## UI/UX

Modern, calm productivity-app feel: whitespace, simple typography, subtle borders, clear hierarchy, responsive, keyboard-friendly, accessible. Avoid visual clutter — the editor is the primary focus. (Reference the **frontend-design** skill.)

## Dependencies

Before adding one: check if it already exists or an existing dep can solve it. Prefer well-maintained libs. Don't swap core stack technologies without explicit approval.

## Workflow

**Before starting a new task:** Comment a summary of all previous changes at the top of the conversation or in a changelog section. This helps track what was done and why.

**Before changes:** inspect repo → read relevant files → check conventions/deps → confirm functionality doesn't already exist → make the smallest reasonable change.

**Per feature:** Understand → Inspect → Plan → Implement → Typecheck → Lint → Test → Review diff (run **code-review** skill here). No unrelated refactors.

**Git:**

- Branch from `main`: `feat/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/` + description
- Never push to `main` directly; every change goes through a PR
- **Keep your branch updated:** Before starting work on a feature branch, run `git fetch origin main && git rebase origin/main` (or `git merge origin/main`) to pull the latest changes from `main`. This prevents large merge conflicts and keeps the branch history clean. Do this periodically during long-running branches.
- Focused commits, no mixed unrelated changes
- Run lint/typecheck/tests before pushing, review diff before committing
- After pushing a feature branch, open a PR against main using gh pr create with a concise title and a summary of the change (what/why, not a diff dump). Do not merge it — leave it open for manual review and approval.

## Definition of Done

- [ ] Feature works, nothing existing broke
- [ ] TypeScript + lint pass, relevant tests pass
- [ ] No console errors, no secrets committed
- [ ] Follows existing architecture, no unrelated diff
- [ ] Ready for PR into `main`

## Agent Decision Rules

Prefer the simplest solution → follow existing architecture → reuse existing code → avoid premature abstraction/infrastructure (no Redis/Yjs before required) → business logic in backend, interactive behavior in client components. Flag tradeoffs before any major architectural change.
