# Development Workflow

## Branch Strategy

1. Create a feature branch from `main` with a descriptive name
2. Commit changes to the feature branch
3. Push the branch to origin
4. Create a PR targeting `main`

## Branch Naming

- `feat/description` — new features
- `fix/description` — bug fixes
- `chore/description` — maintenance tasks

## Rules

- **Every change** must go through a branch + PR, never push directly to `main`
- Commit messages should be concise and descriptive
- Always run lint/typecheck before pushing if available
