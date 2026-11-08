// node scripts/render.mjs <CompId> <out.mp4> [scale] [from-to]  - bundles to work/bundle, renders H.264 on CPU (swangle); CRF env overrides 16
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
import path from 'path';
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const [id, out, scale = '1', range] = process.argv.slice(2);
const root = process.cwd(), outDir = path.join(root, 'work/bundle');
await bundle({entryPoint: path.join(root, 'src/index.ts'), outDir, publicDir: path.join(root, 'public')});
const opts = {browserExecutable: BROWSER, chromiumOptions: {gl: 'swangle'}};
const composition = await selectComposition({serveUrl: outDir, id, ...opts});
const t0 = Date.now(); let last = -1;
await renderMedia({composition, serveUrl: outDir, codec: 'h264', outputLocation: out, crf: Number(process.env.CRF || 16), frameRange: range ? range.split('-').map(Number) : null, pixelFormat: 'yuv420p',
  imageFormat: 'png', scale: Number(scale), concurrency: 4, ...opts,
  onProgress: ({progress}) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; console.log(`${(progress * 100).toFixed(0)}% ${((Date.now() - t0) / 1000).toFixed(0)}s`); } }});
console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
