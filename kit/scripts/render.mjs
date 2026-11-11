// node scripts/render.mjs <CompId> <out.mp4> [scale] [from-to]  - bundles to work/bundle, renders H.264 on CPU (gl angle: 3x faster than swangle with the paper filters; GL env overrides); CRF env overrides 16
// out.aac / .wav / .mp3 renders only the sound (no frames: fast) - to fix levels after a long render, then swap it in:
//   ffmpeg -i video.mp4 -i sound.aac -map 0:v -map 1:a -c copy fixed.mp4
import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia} from '@remotion/renderer';
import path from 'path';
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const [id, out, scale = '1', range] = process.argv.slice(2);
const root = process.cwd(), outDir = path.join(root, process.env.BUNDLE || 'work/bundle'); // BUNDLE=work/bundle2: render while another render uses work/bundle
const audio = {aac: 'aac', m4a: 'aac', wav: 'wav', mp3: 'mp3'}[out.split('.').pop()];
await bundle({entryPoint: path.join(root, 'src/index.ts'), outDir, publicDir: path.join(root, 'public')});
const opts = {browserExecutable: BROWSER, chromiumOptions: {gl: (process.env.GL || 'angle')}};
const composition = await selectComposition({serveUrl: outDir, id, ...opts});
const t0 = Date.now(); let last = -1;
await renderMedia({composition, serveUrl: outDir, codec: audio || 'h264', outputLocation: out, frameRange: range ? range.split('-').map(Number) : null,
  ...(audio ? {} : {crf: Number(process.env.CRF || 16), pixelFormat: 'yuv420p', imageFormat: 'png', scale: Number(scale)}), concurrency: 4, ...opts,
  onProgress: ({progress}) => { const p = Math.floor(progress * 20); if (p !== last) { last = p; console.log(`${(progress * 100).toFixed(0)}% ${((Date.now() - t0) / 1000).toFixed(0)}s`); } }});
console.log('done', out, ((Date.now() - t0) / 1000).toFixed(0) + 's');
