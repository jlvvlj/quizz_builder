#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage:
  scripts/create-pr-worktree.sh <branch-name> [worktree-path]

Creates a fresh PR worktree from origin/main and prepares local-only runtime
assets for this project. Do not create PR worktrees by hand; use this script.

Environment:
  QUIZZ_WORKTREE_ROOT  Directory for default worktree paths.
                         Defaults to <repo>/.worktrees
  QUIZZ_NPM            npm binary to use when installation is needed.
                         Defaults to npm on PATH (Node 20.9+ required).

Examples:
  scripts/create-pr-worktree.sh codex/add-feature
  scripts/create-pr-worktree.sh codex/add-feature /private/tmp/quizz-add-feature
USAGE
}

die() {
  echo "error: $*" >&2
  exit 1
}

if [[ "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

branch="${1:-}"
[[ -n "$branch" ]] || { usage >&2; exit 2; }
[[ "$branch" != origin/* ]] || die "pass a local branch name, not '$branch'"

repo_root="$(git rev-parse --show-toplevel 2>/dev/null)" || die "not inside a git repository"
cd "$repo_root"

slug="$(printf '%s' "$branch" | tr '/[:space:]' '--' | tr -cd '[:alnum:]_.-')"
[[ -n "$slug" ]] || die "branch name produced an empty path slug"

worktree_root="${QUIZZ_WORKTREE_ROOT:-$repo_root/.worktrees}"
worktree_path="${2:-$worktree_root/$slug}"

case "$worktree_path" in
  "$repo_root") die "worktree path cannot be the repository root" ;;
esac

if [[ -e "$worktree_path" ]]; then
  die "worktree path already exists: $worktree_path"
fi

if git show-ref --verify --quiet "refs/heads/$branch"; then
  die "local branch already exists: $branch"
fi

echo "Fetching origin/main..."
git fetch origin main

if git ls-remote --exit-code --heads origin "$branch" >/dev/null 2>&1; then
  die "remote branch already exists: $branch"
fi

mkdir -p "$(dirname "$worktree_path")"

echo "Creating worktree:"
echo "  branch: $branch"
echo "  path:   $worktree_path"
git worktree add "$worktree_path" -b "$branch" origin/main

if [[ -f "$repo_root/.env.local" ]]; then
  ln -s "$repo_root/.env.local" "$worktree_path/.env.local"
  echo "Linked .env.local"
else
  echo "warning: .env.local not found in $repo_root; the worktree will need env setup before build/dev" >&2
fi

# Install from this worktree's lockfile; never mutate or reuse another session's packages.
npm_bin="${QUIZZ_NPM:-$(command -v npm || true)}"
[[ -n "$npm_bin" ]] || die "npm not found; install Node 20.9+ or set QUIZZ_NPM"
echo "Installing worktree dependencies from the lockfile..."
(cd "$worktree_path" && "$npm_bin" ci)

cat <<EOF

Ready.
  Worktree: $worktree_path
  Branch:   $branch

Next:
  cd "$worktree_path"
EOF
