#!/usr/bin/env bash
# Bundle the engine TypeScript source into a single JS file.
# Cuts cold start by ~600ms on dev and several seconds on packaged installs
# (asar disk reads + JIT compilation of ~1900 .ts files).
#
# Run from the project root. Output: engine/dist/cli.js
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT/engine"

# Pull version from package.json so MACRO.VERSION matches the desktop release.
VERSION=$(node -p "require('../package.json').version")
BUILD_TIME=$(date +%s%3N)

mkdir -p dist

# Externals are deps that exist in engine/package.json as optional / pulled in
# by conditional code paths but aren't installed in engine/node_modules.
# Leaving them external means the bundler skips them; if the code path that
# imports them never fires in our usage they cost nothing. Adjust if the
# bundler complains about a new "Could not resolve" — install or externalize.
bun build --target=bun \
  --external '@opentelemetry/exporter-*' \
  --external 'fflate' \
  --external 'sharp' \
  --external '@aws-sdk/*' \
  --external '@anthropic-ai/mcpb' \
  --external '@anthropic-ai/vertex-sdk' \
  --external '@anthropic-ai/foundry-sdk' \
  --external '@anthropic-ai/bedrock-sdk' \
  --external '@azure/identity' \
  --define "MACRO.VERSION=\"${VERSION}\"" \
  --define "MACRO.BUILD_TIME=\"${BUILD_TIME}\"" \
  --define 'MACRO.PACKAGE_URL=""' \
  --define 'MACRO.NATIVE_PACKAGE_URL=""' \
  --define 'MACRO.VERSION_CHANGELOG="[]"' \
  --define 'MACRO.ISSUES_EXPLAINER="report at https://github.com/anthropics/claude-code/issues"' \
  --define 'MACRO.FEEDBACK_CHANNEL=""' \
  --outfile=./dist/cli.js \
  ./src/entrypoints/cli.tsx

echo "engine bundle: $(du -h dist/cli.js | cut -f1) at engine/dist/cli.js"
