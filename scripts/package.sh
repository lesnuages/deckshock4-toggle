#!/usr/bin/env bash

set -euo pipefail

print_usage() {
  cat <<'EOF'
Usage: scripts/package.sh [version] [--skip-build]

Packages the DeckShock4 Toggle plugin into the Decky ZIP layout.

Options:
  version        Optional version override for the ZIP filename. Defaults to the value in package.json.
  --skip-build   Skip running `pnpm run build` before packaging.
  -h, --help     Show this help message.
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

VERSION_OVERRIDE=""
SKIP_BUILD=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    -h|--help)
      print_usage
      exit 0
      ;;
    *)
      if [[ -n "$VERSION_OVERRIDE" ]]; then
        echo "Unexpected argument: $1" >&2
        print_usage
        exit 1
      fi
      VERSION_OVERRIDE="$1"
      shift
      ;;
  esac
done

cd "$PROJECT_ROOT"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm is required to build the frontend. Please install pnpm and retry." >&2
  exit 1
fi

if [[ $SKIP_BUILD -eq 0 ]]; then
  echo "Building frontend bundle..."
  pnpm run build
else
  echo "Skipping build step per --skip-build."
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is required to read package metadata. Please install Node.js and retry." >&2
  exit 1
fi

PLUGIN_NAME="$(node -p "require('./package.json').name")"
PACKAGE_VERSION="$(node -p "require('./package.json').version")"

if [[ -z "$PLUGIN_NAME" ]]; then
  echo "Unable to read plugin name from package.json" >&2
  exit 1
fi

if [[ -z "$PACKAGE_VERSION" ]]; then
  echo "Unable to read version from package.json" >&2
  exit 1
fi

VERSION="${VERSION_OVERRIDE:-$PACKAGE_VERSION}"
OUTPUT_DIR="$PROJECT_ROOT/out"
ZIP_NAME="${PLUGIN_NAME}-v${VERSION}.zip"

STAGING_DIR="$(mktemp -d)"
PLUGIN_STAGING_DIR="${STAGING_DIR}/${PLUGIN_NAME}"
mkdir -p "$PLUGIN_STAGING_DIR"

copy_item() {
  local item="$1"
  if [[ -e "$item" ]]; then
    if [[ -d "$item" ]]; then
      rsync -a --prune-empty-dirs "$item" "$PLUGIN_STAGING_DIR/"
    else
      rsync -a "$item" "$PLUGIN_STAGING_DIR/"
    fi
  fi
}

REQUIRED_ITEMS=(
  "dist"
  "package.json"
  "plugin.json"
  "main.py"
  "README.md"
  "LICENSE"
)

for item in "${REQUIRED_ITEMS[@]}"; do
  if [[ ! -e "$item" ]]; then
    echo "Required item '$item' is missing. Did you run the build?" >&2
    rm -rf "$STAGING_DIR"
    exit 1
  fi
done

OPTIONAL_ITEMS=(
  "assets"
  "defaults"
  "backend"
  "py_modules"
)

for item in "${REQUIRED_ITEMS[@]}" "${OPTIONAL_ITEMS[@]}"; do
  copy_item "$item"
done

mkdir -p "$OUTPUT_DIR"

pushd "$STAGING_DIR" >/dev/null
if command -v zip >/dev/null 2>&1; then
  zip -r "$OUTPUT_DIR/$ZIP_NAME" "$PLUGIN_NAME"
else
  echo "'zip' command not found. Please install zip utility." >&2
  popd >/dev/null || true
  rm -rf "$STAGING_DIR"
  exit 1
fi
popd >/dev/null

rm -rf "$STAGING_DIR"

echo "Created package: $OUTPUT_DIR/$ZIP_NAME"
