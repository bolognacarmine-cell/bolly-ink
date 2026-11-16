import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(process.cwd());
const outJs = resolve(root, 'public/wasm/camera_path.js');
const outWasm = resolve(root, 'public/wasm/camera_path.wasm');

function hasEmcc() {
  try {
    execSync('emcc --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

if (existsSync(outJs) && existsSync(outWasm)) {
  console.log('[build-wasm] Artefatti Wasm già presenti, skip.');
  process.exit(0);
}

if (!hasEmcc()) {
  console.warn('[build-wasm] emcc non trovato: skip compilazione Wasm (verrà usato il fallback JS).');
  process.exit(0);
}

try {
  console.log('[build-wasm] Compilazione Wasm in corso...');
  execSync('bash wasm/build.sh', { stdio: 'inherit', cwd: root });
} catch (err) {
  console.warn('[build-wasm] Compilazione Wasm fallita, continuo con fallback JS.');
  console.warn(String(err?.message || err));
  process.exit(0);
}
