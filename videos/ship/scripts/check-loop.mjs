// Checks that a video loops seamlessly: renders its first and last frame and compares them.
// Run inside a video folder:  node scripts/check-loop.mjs <CompositionId>
// Prints the mean pixel difference (0-255 scale). Under 1 = the loop is seamless; the script exits with an error above that.
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'child_process';
import fs from 'fs';
import path from 'path';

const id = process.argv[2] || 'Template';
const dir = path.resolve('out/loop-check');
fs.mkdirSync(dir, {recursive: true});
const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts'), outDir: path.resolve('work/bundle')});
const composition = await selectComposition({serveUrl, id});
const files = [];
for (const [name, frame] of [['first', 0], ['last', composition.durationInFrames - 1]]) {
  const output = path.join(dir, `${id}-${name}.png`);
  await renderStill({composition, serveUrl, output, frame, scale: 0.5, chromiumOptions: {gl: (process.env.GL || 'angle')}});
  files.push(output);
}
const compare = [
  'import sys, cv2, numpy as np',
  'a, b = (cv2.imread(p).astype(np.float32) for p in sys.argv[1:3])',
  'print(round(float(np.abs(a - b).mean()), 3))',
].join('\n');
const diff = parseFloat(execFileSync('python3', ['-c', compare, ...files]).toString());
const ok = diff < 1;
console.log(`${id}: first vs last frame differ by ${diff} -> ${ok ? 'seamless loop' : 'NOT a seamless loop'}`);
console.log(`frames saved in ${dir}`);
if (!ok) process.exitCode = 1;
