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
git add .
git commit -m "Updated submodules to latest commit on '$BRANCH'"
echo "Submodules updated to latest commit on '$BRANCH' and committed to main repository."
