#!/usr/bin/env bash
set -euo pipefail

BRANCH="${1:-main}"

if ! git remote get-url upstream >/dev/null 2>&1; then
  echo "Missing upstream remote. Add it first:"
  echo "  git remote add upstream https://github.com/Qiao-920/claude-desktop-cn.git"
  exit 1
fi

if ! git diff-index --quiet HEAD --; then
  echo "Your working tree has uncommitted changes."
  echo "Commit or stash them before syncing upstream."
  exit 1
fi

git fetch upstream
git checkout "$BRANCH"
git rebase "upstream/$BRANCH"

if git remote get-url origin >/dev/null 2>&1; then
  git push origin "$BRANCH"
else
  echo "No origin remote configured yet. Local branch is synced with upstream."
fi
