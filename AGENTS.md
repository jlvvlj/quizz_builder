# Project Rules

## Worktree Per Session

Every coding session must use its own fresh worktree on its own branch. Do not
share worktrees between sessions, and do not reuse an existing worktree from a
previous session.

For any PR-bound work, do not edit files in the main/local project checkout.
Before making changes, create or move into a dedicated PR worktree using the
approved worktree setup below. If the current shell is in the main/local checkout,
stop and set up the PR worktree first.

Do not create worktrees manually with `git worktree add`, `git switch -c`, or
ad-hoc shell commands. Create PR worktrees only with:

```sh
scripts/create-pr-worktree.sh <branch-name> [worktree-path]
```

or with a first-class worktree tool that performs the same setup. The script
fetches `origin/main`, creates the branch from `origin/main`, refuses existing
branches/paths, links `.env.local`, and links or installs `node_modules`.

If a worktree is missing env vars or dependencies, recreate it through the
approved script/tool rather than patching setup manually.

## Check PR State Before Pushing

Never push commits to a branch whose pull request might already be merged or closed.
Before pushing to any branch associated with an existing PR, check the PR state first:

```sh
gh pr view <branch> --json state,url
```

- If the PR is `OPEN`, push to the existing branch.
- If the PR is `MERGED` or `CLOSED`, do not push to that branch. Create a new branch from `origin/main`, move or re-apply the work there, push it, and open a new PR.

When in doubt, assume the previous PR may no longer be open and verify before pushing.
