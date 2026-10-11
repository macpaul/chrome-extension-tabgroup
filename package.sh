#!/usr/bin/env bash
#
# package.sh — Packaging script for Chrome Web Store distribution
# Extracts production files from a specified Git tag or commit hash/ref.
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Ensure we are inside a Git repository
if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Error: This script must be executed inside a Git repository." >&2
  exit 1
fi

# Detect available tags and recent commits
AVAILABLE_TAGS=$(git tag -l --sort=-creatordate)
LATEST_TAG=$(echo "$AVAILABLE_TAGS" | head -n 1)
RECENT_COMMITS=$(git log -n 5 --oneline)

# Determine target Git tag/ref/commit
TARGET_REF="${1:-}"

if [[ -z "$TARGET_REF" ]]; then
  echo "=========================================="
  echo "  Chrome Extension Packaging Tool"
  echo "=========================================="
  echo "Available Git tags:"
  if [[ -n "$AVAILABLE_TAGS" ]]; then
    echo "$AVAILABLE_TAGS" | sed 's/^/  - /'
  else
    echo "  (No git tags found)"
  fi
  echo ""
  echo "Recent Git commits:"
  echo "$RECENT_COMMITS" | sed 's/^/  - /'
  echo "------------------------------------------"

  DEFAULT_PROMPT="${LATEST_TAG:-HEAD}"
  read -r -p "Enter tag name or commit hash to package [${DEFAULT_PROMPT}]: " INPUT_REF
  TARGET_REF="${INPUT_REF:-$DEFAULT_PROMPT}"
fi

# Verify the specified ref exists
if ! git rev-parse -q --verify "${TARGET_REF}^{commit}" >/dev/null; then
  echo "Error: Git reference, tag, or commit '${TARGET_REF}' does not exist." >&2
  exit 1
fi

COMMIT_HASH=$(git rev-parse --short "${TARGET_REF}^{commit}")
COMMIT_SUBJECT=$(git log -1 --format="%s" "${TARGET_REF}^{commit}")
COMMIT_DATE=$(git log -1 --format="%ad" --date=short "${TARGET_REF}^{commit}")
COMMIT_AUTHOR=$(git log -1 --format="%an <%ae>" "${TARGET_REF}^{commit}")

# Read version declared inside manifest.json for this ref
if ! git cat-file -e "${TARGET_REF}:manifest.json" 2>/dev/null; then
  echo "Error: manifest.json was not found in '${TARGET_REF}'." >&2
  exit 1
fi

MANIFEST_VERSION=$(git show "${TARGET_REF}:manifest.json" | grep '"version"' | head -n 1 | sed -E 's/.*"version": "([^"]+)".*/\1/')

# Prepare output directory and filename
OUTPUT_DIR="dist"
mkdir -p "$OUTPUT_DIR"

# Clean filename label (replace slashes in branch names if any)
SAFE_REF_NAME=$(echo "$TARGET_REF" | tr '/' '-')
if git rev-parse -q --verify "refs/tags/${TARGET_REF}" >/dev/null 2>&1; then
  OUTPUT_FILENAME="tab-purger-grouper-${SAFE_REF_NAME}.zip"
elif [[ "$SAFE_REF_NAME" == "$COMMIT_HASH"* ]]; then
  OUTPUT_FILENAME="tab-purger-grouper-${COMMIT_HASH}.zip"
else
  OUTPUT_FILENAME="tab-purger-grouper-${SAFE_REF_NAME}-${COMMIT_HASH}.zip"
fi

OUTPUT_PATH="${2:-${OUTPUT_DIR}/${OUTPUT_FILENAME}}"

# Production files to include in Chrome Web Store package
INCLUDE_PATHS=(
  "manifest.json"
  "icons"
  "_locales"
  "src"
)

echo ""
echo "Packaging Chrome extension:"
echo "  Target Ref   : ${TARGET_REF}"
echo "  Commit Hash  : ${COMMIT_HASH} (${COMMIT_DATE})"
echo "  Commit Author: ${COMMIT_AUTHOR}"
echo "  Commit Title : ${COMMIT_SUBJECT}"
echo "  Manifest Ver : v${MANIFEST_VERSION}"
echo "  Output File  : ${OUTPUT_PATH}"
echo "------------------------------------------"

# Remove existing zip if present
rm -f "$OUTPUT_PATH"

# Build ZIP archive directly from Git tree
git archive --format=zip -o "$OUTPUT_PATH" "$TARGET_REF" "${INCLUDE_PATHS[@]}"

# Display archive summary
FILE_SIZE=$(du -h "$OUTPUT_PATH" | cut -f1)
FILE_COUNT=$(unzip -l "$OUTPUT_PATH" | tail -n 1 | awk '{print $2}')

echo "Archive created successfully!"
echo "  File size    : ${FILE_SIZE}"
echo "  Total files  : ${FILE_COUNT}"
echo ""
echo "Archive contents:"
unzip -l "$OUTPUT_PATH"
echo "------------------------------------------"
echo "Package is ready for Chrome Web Store upload:"
echo "  ${OUTPUT_PATH}"
