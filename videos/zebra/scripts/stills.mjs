// node work/stills.mjs [--bundle] <times...>  -> work/stills/fNNNN.png (0.5 scale). Bundles once to work/bundle.
import {bundle} from '@remotion/bundler';
import {selectComposition, renderStill} from '@remotion/renderer';
import path from 'path';
import fs from 'fs';
const BROWSER = '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const root = process.cwd(), outDir = path.join(root, process.env.BUNDLE || 'work/bundle');
const id = process.env.COMP || 'Birds';
if (process.argv.includes('--bundle') || !fs.existsSync(path.join(outDir, 'index.html'))) {
  await bundle({entryPoint: path.join(root, 'src/index.ts'), outDir, publicDir: path.join(root, 'public')});
  console.log('bundled');
}
const opts = {browserExecutable: BROWSER, chromiumOptions: {gl: (process.env.GL || 'angle')}};
const comp = await selectComposition({serveUrl: outDir, id, ...opts});
fs.mkdirSync('work/stills', {recursive: true});
for (const a of process.argv.slice(2).filter((x) => !x.startsWith('--'))) {
  const frame = Math.min(comp.durationInFrames - 1, Math.round(Number(a) * 60));
  await renderStill({composition: comp, serveUrl: outDir, output: `work/stills/f${String(frame).padStart(4, '0')}.png`, frame,
    scale: Number(process.env.SCALE || 0.5), ...opts});
}
console.log('stills done');
