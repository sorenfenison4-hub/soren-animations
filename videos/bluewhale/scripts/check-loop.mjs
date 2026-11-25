// Checks that a video loops seamlessly: renders its first and last frame and compares them.
// Run inside a video folder:  node scripts/check-loop.mjs <CompositionId>
// Prints the mean pixel difference (0-255 scale). Under 1 = the loop is seamless; the script exits with an error above that.
// Also checks the hook: frame 0 vs 0.5 s must differ (something already moves), or people swipe on a still picture.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';

const id = process.argv[2] || 'Template';
const HOOK_MIN = 4; // a still opening scores ~2.8 (boil wobble alone); the template with motion scores ~5.6
const dir = path.resolve('out/loop-check');
fs.mkdirSync(dir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('work/bundle')});
const composition = await selectComposition({serveUrl, id});
const files = [];
for (const [name, frame] of [['first', 0], ['last', composition.durationInFrames - 1], ['hook', 30]]) {
  const output = path.join(dir, `${id}-${name}.png`);
  await renderStill({composition, serveUrl, output, frame, scale: 0.5, chromiumOptions: {gl: (process.env.GL || 'angle')}});
  files.push(output);
}
const compare = [
  'import sys, cv2, numpy as np',
  'a, b = (cv2.imread(p).astype(np.float32) for p in sys.argv[1:3])',
  'print(round(float(np.abs(a - b).mean()), 3))',
].join('\n');
const diff = parseFloat(execFileSync('python3', ['-c', compare, files[0], files[1]]).toString());
const ok = diff < 1;
console.log(`${id}: first vs last frame differ by ${diff} -> ${ok ? 'seamless loop' : 'NOT a seamless loop'}`);
const move = parseFloat(execFileSync('python3', ['-c', compare, files[0], files[2]]).toString());
const moves = move >= HOOK_MIN;
console.log(`${id}: frame 0 vs 0.5 s differ by ${move} -> ${moves ? 'opening moves (hook OK)' : 'opening is too still: start an action in the first 0.3 s'}`);
console.log(`frames saved in ${dir}`);
if (!ok || !moves) process.exitCode = 1;
