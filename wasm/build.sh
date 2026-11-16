#!/usr/bin/env bash
set -euo pipefail

# Requires Emscripten SDK (emsdk) activated in the current shell:
#   source /path/to/emsdk/emsdk_env.sh
# Then run:
#   bash wasm/build.sh

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

emcc "$ROOT_DIR/wasm/camera_path.cpp" -O3 \
  -s WASM=1 \
  -s MODULARIZE=1 \
  -s EXPORT_ES6=1 \
  -s ENVIRONMENT=web \
  -s EXPORTED_FUNCTIONS="['_computeCamera','_malloc','_free']" \
  -s EXPORTED_RUNTIME_METHODS="['cwrap','HEAPF32']" \
  -o "$ROOT_DIR/public/wasm/camera_path.js"

echo "Built: public/wasm/camera_path.js and public/wasm/camera_path.wasm"