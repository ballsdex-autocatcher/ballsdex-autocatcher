#!/bin/bash

# Check if main branch is passed as an argument; otherwise, default to "main"
BRANCH=${1:-main}

# Initialize and update submodules
git submodule update --init --recursive

# Loop through each submodule and update to the latest on the specified branch
git submodule foreach "
  git fetch origin $BRANCH &&
  git checkout $BRANCH &&
  git pull origin $BRANCH
"

# Commit updated submodule references in the main repository
git config --global user.name "${{ env.author }}"
git config --global user.email "username@users.noreply.github.com"

git add -A

if ! git diff --cached --quiet; then git stash; fi
git pull --rebase

if git stash list | grep -q 'stash@{0}'; then git stash pop; fi

git diff --cached --exit-code || (git add -A && git commit -m "${{ env.commit }}" && git push)