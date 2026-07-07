#!/usr/bin/env bash
BRANCH=$(git rev-parse --abbrev-ref HEAD)
STATUS=$(git status --porcelain)
if [ -z "$STATUS" ]; then
  echo "Nothing to commit."
  exit 0
fi
MSG="${1:-auto: $(echo "$STATUS" | wc -l) file(s) changed}"
git add -A && git commit -m "$MSG"
echo "Committed to $BRANCH : $MSG"
