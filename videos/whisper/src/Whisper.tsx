// "Never whisper in a round room" - a story Short in the format of the reference (narrator + character voices, a cut
// or snap zoom every ~2 s, word-by-word captions, music bed): the king's advisor whispers his plan into the wall of a
// round hall, the whisper slides around the curved wall to the sweeper 40 m away, nobody believes him, the advisor
// swaps the crown for a wooden one, the sweeper puts the king's ear to the far wall, the king hears every word, a
// whispering-gallery explainer (St Paul's, 34 m), and the advisor ends up scrubbing the walls: "Stupid round room." -
// "I heard that." -> loops to the opening whisper. King, advisor and two sweeper poses are Higgsfield cut-outs
// (public/whisper/char, measured in cast.json); hall, crowns, woodpecker, diagrams and effects are code.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, Key, Guy, Pose, Star, Sweat, Badge, W, pen, Puffs, paperFilter, SoundLayer, Cue,
  seg, popIn, spring, lerp, eio, eout, rnd, clamp, shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues,
  HookTitle, AskBanner, HEAD_R} from './lib/kit';
import CAST from './cast.json';
import DLG from './dialogue.json';
import LIB from './lib/library.json';

// ---------- timing (all from the dialogue track's word times) ----------
type Word = {w: string; spk: string; line: string; s: number; e: number};
const D = DLG as {voiceAt: number; end: number; lines: {id: string; spk: string; s: number; e: number}[]; words: Word[]};
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9-']/g, '');
const L = (id: string) => D.lines.find((l) => l.id === id)!;
const Wd = (line: string, word: string) => D.words.find((w) => w.line === line && norm(w.w) === word)!.s;
export const DURATION = Math.round((D.end + 0.85) * FPS) / FPS;
export const T = {
  pull: 0.3, arrive: 1.56, kingIns: 1.62, panicIns: 2.36, gulp1: 3.0, rewind: 3.86, hall: 4.45, cardOut: 5.15,
  leaned: Wd('leaned', 'leaned'), whispered: Wd('leaned', 'whispered'),
  s6: 8.25, tonight: L('tonight').s, fake: Wd('tonight', 'fake'),
  forty: L('forty').s, heard1: Wd('forty', 'heard'), word1: Wd('forty', 'word'),
  s8: 16.25, majesty: L('majesty').s, s9: 19.38, ghosts: Wd('ghosts', 'ghosts'),
  s10: 22.95, court: L('court').s, loudest: Wd('court', 'loudest'),
  s11: 26.03, scrubW: Wd('scrub', 'scrub'), allOf: Wd('scrub', 'all'),
  s12: 30.18, vanishes: Wd('night', 'vanishes'),
  s13: 32.33, wooden: Wd('morning', 'wooden'), painted: Wd('morning', 'painted'),
  s14: 35.58, day2: L('day2').s, squeaks: Wd('day2', 'squeaks'),
  s15: 37.53, day3: L('day3').s, pecker: Wd('day3', 'woodpecker'),
  s16: 39.65, s17: 41.06, treasury: L('treasury').s,
  s18: 42.85, ear: Wd('ready', 'ear'), listen: L('listen').s,
  s20: 47.93, fool: L('fool').s,
  s21: 50.42, every: Wd('heard', 'every'), s21b: 51.68,
  s22: 52.45, roundW: Wd('round', 'round'), whisperW: Wd('round', 'whisper'), spread: Wd('round', 'spread'), hugs: Wd('round', 'hugs'),
  slides: Wd('round', 'slides'), around: Wd('round', 'around'),
  s23: 58.72, pauls: Wd('pauls', 'paul\'s'), carries: Wd('pauls', 'carries'), m34: Wd('pauls', 'thirty-four'), other: Wd('pauls', 'other'),
  cta: 58.95,
  s24: 63.75, all2: Wd('now', 'all'), s25: 67.05, stupid: L('stupid').s, s26: 69.1, iheard: L('iheard').s,
};
type Shot = 'h1' | 'kingIns' | 'panicIns' | 's5' | 's6' | 's8' | 's9' | 's10' | 's11' | 's11b' | 's12' | 's13' | 's16' | 's17' | 's18' |
  's20' | 's22' | 's23' | 's24' | 's25' | 's26';
const SHOTS: [number, Shot][] = [[0, 'h1'], [T.kingIns, 'kingIns'], [T.panicIns, 'panicIns'], [T.hall, 's5'], [T.s6, 's6'], [T.s8, 's8'],
  [T.s9, 's9'], [T.s10, 's10'], [T.s11, 's11'], [T.allOf - 0.08, 's11b'], [T.s12, 's12'], [T.s13, 's13'], [T.s16, 's16'], [T.s17, 's17'],
  [T.s18, 's18'], [T.s20, 's20'], [T.s21, 'kingIns'], [T.s21b, 'panicIns'], [T.s22, 's22'], [T.s23, 's23'], [T.s24, 's24'], [T.s25, 's25'],
  [T.s26, 's26']];
const shotAt = (t: number) => { let s: Shot = 'h1'; for (const [a, id] of SHOTS) if (t >= a) s = id; return s; };

// ---------- the hall (world units, floor at y = 0; the guy is ~300 tall) ----------
export const RX = 1250, RY = 1650, WT = 130;   // inner ellipse of the domed hall + wall thickness
const ADV_X = -1085, WALL_X = 1085;           // advisor's spot at the left wall, the listening spot at the right wall
const STONE = '#E6D6BA', STONE2 = '#D6C3A2', RING = '#BCA585', OUT = '#5B4D45', FLOOR = '#C8AC84', GOLD = '#FFD43B', PURPLE = '#7B4FC9';
const ellPts = (rx: number, ry: number, a0: number, a1: number, n = 90) => Array.from({length: n + 1}, (_, i) => {
  const a = ((a0 + (a1 - a0) * (i / n)) * Math.PI) / 180; return [rx * Math.cos(a), -ry * Math.sin(a)];
});
const toD = (p: number[][]) => 'M ' + p.map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L ');

const Hall: React.FC<{t: number; night?: number}> = ({t, night = 0}) => {
  const inner = ellPts(RX, RY, 0, 180), outer = ellPts(RX + WT, RY + WT, 0, 180);
  const innerD = toD(inner) + ' Z';
  const ringD = toD(outer) + ' L ' + inner.slice().reverse().map((q) => `${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' L ') + ' Z';
  const sky = night > 0.5 ? '#22305E' : '#9FD3F2';
  const win = (x: number) => <g key={x}>
    <path d={`M ${x - 90} -860 V -1150 Q ${x - 90} -1250 ${x} -1250 Q ${x + 90} -1250 ${x + 90} -1150 V -860 Z`} fill={sky} stroke={INK} strokeWidth={9} />
    <path d={`M ${x} -1250 V -860 M ${x - 90} -1060 H ${x + 90}`} stroke={INK} strokeWidth={7} />
    {night > 0.5 ? <circle cx={x + 40} cy={-1170} r={22} fill="#FFF3C4" /> : null}
  </g>;
  const torch = (x: number, i: number) => {
    const f = 1 + 0.12 * Math.sin(t * 21 + i * 2) + 0.07 * Math.sin(t * 33 + i);
    return <g key={x}>
      <path d={`M ${x - 18} -560 L ${x + 18} -560 L ${x + 10} -470 L ${x - 10} -470 Z`} fill="#6B4A33" stroke={INK} strokeWidth={6} />
      <path d={`M ${x} ${-560 - 70 * f} Q ${x + 32} -600 ${x + 16} -566 Q ${x} -548 ${x - 16} -566 Q ${x - 32} -600 ${x} ${-560 - 70 * f} Z`} fill="#FF8A2B" stroke={INK} strokeWidth={6} />
      <path d={`M ${x} ${-560 - 38 * f} Q ${x + 12} -585 ${x + 6} -570 Q ${x} -562 ${x - 6} -570 Q ${x - 12} -585 ${x} ${-560 - 38 * f} Z`} fill="#FFE07A" />
    </g>;
  };
  const banner = (x: number) => <g key={x}>
    <path d={`M ${x - 80} -1380 H ${x + 80} V -1040 L ${x} -990 L ${x - 80} -1040 Z`} fill="#B5323B" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d={`M ${x - 40} -1180 L ${x - 40} -1230 L ${x - 20} -1205 L ${x} -1240 L ${x + 20} -1205 L ${x + 40} -1230 L ${x + 40} -1180 Z`} fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>;
  return (
    <W>
      <rect x={-7000} y={-7000} width={14000} height={7000} fill={OUT} />
      {Array.from({length: 26}, (_, r) => <path key={'o' + r} d={`M -7000 ${-r * 260} H 7000`} stroke="#4E413A" strokeWidth={6} />)}
      <path d={innerD} fill={STONE} />
      <clipPath id="hallIn"><path d={innerD} /></clipPath>
      <g clipPath="url(#hallIn)">
        {Array.from({length: 13}, (_, r) => <g key={r}>
          <path d={`M -1400 ${-r * 140} H 1400`} stroke={STONE2} strokeWidth={5} />
          {Array.from({length: 12}, (_, c) => <path key={c} d={`M ${-1400 + c * 240 + (r % 2) * 120} ${-r * 140} v -140`} stroke={STONE2} strokeWidth={5} />)}
        </g>)}
      </g>
      {[-560, 560].map(win)}
      {[-330, 330].map(banner)}
      {[-820, 820].map(torch)}
      <path d={ringD} fill={RING} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      {Array.from({length: 17}, (_, i) => {
        const a = ((5 + i * 10.6) * Math.PI) / 180;
        return <path key={i} d={`M ${RX * Math.cos(a)} ${-RY * Math.sin(a)} L ${(RX + WT) * Math.cos(a)} ${-(RY + WT) * Math.sin(a)}`} stroke={INK} strokeWidth={6} />;
      })}
      {/* floor, carpet, throne on its dais */}
      <rect x={-7000} y={0} width={14000} height={5000} fill={FLOOR} />
      {Array.from({length: 9}, (_, r) => <path key={'f' + r} d={`M -7000 ${70 + r * 120} H 7000`} stroke="#B89A72" strokeWidth={5} />)}
      <path d="M -150 0 L 150 0 L 330 1100 L -330 1100 Z" fill="#B2343A" stroke={INK} strokeWidth={8} />
      <path d="M -112 0 L -250 1100 M 112 0 L 250 1100" stroke={GOLD} strokeWidth={9} />
      <path d={`M -7000 0 H 7000`} stroke={INK} strokeWidth={9} />
      <g>
        <path d="M -160 -90 V -470 Q -160 -560 0 -580 Q 160 -560 160 -470 V -90 Z" fill="#E9B43E" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
        <path d="M -100 -140 V -440 Q -100 -500 0 -512 Q 100 -500 100 -440 V -140 Z" fill="#B5323B" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <circle cx={0} cy={-560} r={22} fill="#4FA3E0" stroke={INK} strokeWidth={6} />
        <rect x={-190} y={-150} width={380} height={70} rx={20} fill="#C2303A" stroke={INK} strokeWidth={8} />
        <rect x={-330} y={-42} width={660} height={42} fill={STONE2} stroke={INK} strokeWidth={8} />
        <rect x={-250} y={-84} width={500} height={42} fill={STONE} stroke={INK} strokeWidth={8} />
      </g>
    </W>
  );
};

// ---------- characters ----------
type CastName = keyof typeof CAST;
type CM = {w: number; h: number; head: number[]; feet: number[] | null};
/** a cut-out from public/whisper/char: head centre at x, bottom of the picture on y (waist-up pictures: head centre at (x, y)) */
const Char: React.FC<{name: CastName; x: number; y: number; t: number; sx?: number; sy?: number; flip?: boolean; rot?: number; breathe?: boolean; size?: number}> =
  ({name, x, y, t, sx = 1, sy = 1, flip = false, rot = 0, breathe = true, size = 1}) => {
    const m = (CAST as any)[name] as CM; const s = (HEAD_R * size) / m.head[2];
    const ax = m.head[0], ay = m.feet ? m.h - 14 : m.head[1];
    const b = breathe ? 1 + 0.009 * Math.sin(2 * Math.PI * 0.6 * t + x * 0.01) : 1;
    return <div style={{position: 'absolute', left: x - ax * s, top: y - ay * s, width: m.w * s, height: m.h * s, transformOrigin: `${ax * s}px ${ay * s}px`,
      transform: `rotate(${rot}deg) scale(${(flip ? -1 : 1) * sx}, ${sy * b})`}}>
      <Img src={staticFile(`whisper/char/${name}.png`)} style={{position: 'absolute', left: 0, top: 0, width: m.w * s, height: m.h * s}} />
    </div>;
  };
/** where a cut-out's head centre is (world), for crowns, sweat, hats */
const headOf = (name: CastName, x: number, y: number, size = 1) => {
  const m = (CAST as any)[name] as CM; const s = (HEAD_R * size) / m.head[2];
  return {x, y: m.feet ? y - (m.h - 14 - m.head[1]) * s : y, r: HEAD_R * size};
};
const guyHead = (pose: Pose, x: number, y: number, size = 1, flip = false) => {
  const m = (LIB as any)[pose]; const s = (HEAD_R * size) / m.head[2];
  return {x: x + (flip ? -1 : 1) * (m.head[0] - m.feet[0]) * s, y: y - (m.feet[1] - m.head[1]) * s, r: HEAD_R * size};
};
/** squash-swap between two cut-outs (anticipation squash, swap, settle) */
const sw = <P extends string>(t: number, at: number, a: P, b: P) => {
  if (t < at) { const pre = seg(t, at - 0.12, at); return {pose: a, sx: 1 + 0.04 * pre, sy: 1 - 0.06 * pre}; }
  return {pose: b, sx: 1 - spring(t, at, 0.03, 3, 6), sy: 1 + spring(t, at, 0.04, 3, 6)};
};

// ---------- props ----------
/** crown on a head (hx, hy = head centre, r = head radius). wood: 0 = gold, 1 = painted wood; chip / holes: wear; squeak: wobble */
const Crown: React.FC<{hx: number; hy: number; r: number; rot?: number; wood?: boolean; chip?: number; holes?: number; wob?: number}> =
  ({hx, hy, r, rot = 0, wood = false, chip = 0, holes = 0, wob = 0}) => {
    const k = r / 64, w = 60, base = wood ? '#E2B648' : GOLD;
    return <W><g transform={`translate(${hx} ${hy - 0.9 * r}) rotate(${rot + wob}) scale(${k})`}>
      <path d={`M ${-w} 10 L ${-w} -26 L ${-w * 0.62} -6 L ${-w * 0.32} -40 L 0 -10 L ${w * 0.32} -40 L ${w * 0.62} -6 L ${w} -26 L ${w} 10 Z`}
        fill={base} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <rect x={-w} y={-4} width={2 * w} height={18} rx={5} fill={wood ? '#D4A33C' : '#F5B92E'} stroke={INK} strokeWidth={7} />
      {wood ? null : [[-36, 5, '#E5484D'], [0, 5, '#4FA3E0'], [36, 5, '#3BB273']].map(([x, y, c], i) =>
        <circle key={i} cx={x as number} cy={y as number} r={7} fill={c as string} stroke={INK} strokeWidth={4} />)}
      {wood && chip > 0.01 ? <g opacity={1}>
        <path d="M 12 -4 L 34 -4 L 40 10 L 16 13 Z" fill="#A8713E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d="M 18 1 Q 26 4 36 1 M 20 7 Q 28 10 37 7" stroke="#7A4E2A" strokeWidth={2.5} fill="none" />
      </g> : null}
      {wood ? Array.from({length: Math.floor(holes)}, (_, i) => <ellipse key={i} cx={-26 + i * 11} cy={-14 + (i % 2) * 7} rx={4} ry={5} fill="#5A3A20" />) : null}
    </g></W>;
  };
/** a woodpecker perched at (x, y) (its feet), size r (head radius of the king), pecking when peck > 0 */
const Woodpecker: React.FC<{x: number; y: number; r: number; t: number; peck: number; flap?: number}> = ({x, y, r, t, peck, flap = 0}) => {
  const k = r / 64, a = peck > 0 ? 18 * Math.max(0, Math.sin(t * 2 * Math.PI * 5)) : 0;
  return <W><g transform={`translate(${x} ${y}) scale(${k})`}>
    <path d="M -6 0 L -4 -10 M 6 0 L 4 -10" stroke="#8A6A3C" strokeWidth={5} strokeLinecap="round" />
    <ellipse cx={-6} cy={-34} rx={30} ry={24} fill="#1F1F1F" stroke={INK} strokeWidth={5} />
    <ellipse cx={-2} cy={-28} rx={14} ry={14} fill="#F2F0EA" />
    {flap > 0 ? <path d={`M -14 -40 Q -40 ${-90 * flap} -60 ${-50 - 30 * flap} Q -40 -46 -14 -36 Z`} fill="#2B2B2B" stroke={INK} strokeWidth={4} /> : null}
    <g transform={`translate(6 -54) rotate(${a})`}>
      <circle cx={0} cy={0} r={17} fill="#F2F0EA" stroke={INK} strokeWidth={5} />
      <path d="M -10 -14 Q -2 -32 12 -20 Q 6 -12 -10 -14 Z" fill="#E5484D" stroke={INK} strokeWidth={4} />
      <circle cx={5} cy={-2} r={3.5} fill={INK} />
      <path d="M 14 0 L 38 4 L 14 9 Z" fill="#7C7C7C" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </g>
  </g></W>;
};
/** the dotted whisper that slides along the curved wall: from the speaker's mouth (sx,sy), around the dome, to the ear (ex,ey) */
const pathPts = (sx: number, sy: number, ex: number, ey: number) => {
  const ri = RX - 48, rj = RY - 48;
  const aL = 180 - (Math.asin(Math.min(0.9, -sy / rj)) * 180) / Math.PI, aR = (Math.asin(Math.min(0.9, -ey / rj)) * 180) / Math.PI;
  return [[sx, sy], ...ellPts(ri, rj, aL, aR, 140), [ex, ey]];
};
const cum = (p: number[][]) => { const c = [0]; for (let i = 1; i < p.length; i++) c.push(c[i - 1] + Math.hypot(p[i][0] - p[i - 1][0], p[i][1] - p[i - 1][1])); return c; };
const partial = (p: number[][], c: number[], u: number) => {
  const L1 = c[c.length - 1] * clamp(u); const out: number[][] = [p[0]];
  for (let i = 1; i < p.length; i++) {
    if (c[i] <= L1) { out.push(p[i]); continue; }
    const f = (L1 - c[i - 1]) / (c[i] - c[i - 1]); out.push([lerp(p[i - 1][0], p[i][0], f), lerp(p[i - 1][1], p[i][1], f)]); break;
  }
  return out;
};
const Whisper: React.FC<{sx: number; sy: number; ex: number; ey: number; p: number; t: number; out?: number; col?: string}> = ({sx, sy, ex, ey, p, t, out = 0, col = PURPLE}) => {
  if (p <= 0.002 || out >= 0.999) return null;
  const pts = pathPts(sx, sy, ex, ey), c = cum(pts);
  const vis = partial(pts, c, p), head = vis[vis.length - 1];
  const tail = out > 0 ? partial(pts, c, out) : null;
  const d = toD(vis);
  return <W>
    {tail ? <mask id="wmask"><rect x={-9000} y={-9000} width={18000} height={18000} fill="#fff" /><path d={toD(tail)} stroke="#000" strokeWidth={60} fill="none" /></mask> : null}
    <g mask={tail ? 'url(#wmask)' : undefined}>
      <path d={d} stroke={INK} strokeWidth={22} strokeDasharray="34 26" strokeDashoffset={-t * 160} strokeLinecap="round" fill="none" />
      <path d={d} stroke={col} strokeWidth={11} strokeDasharray="34 26" strokeDashoffset={-t * 160} strokeLinecap="round" fill="none" />
    </g>
    {p < 0.995 ? <g transform={`translate(${head[0]} ${head[1]})`}>
      <circle r={30} fill="#fff" stroke={INK} strokeWidth={7} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${-6 + i * 10} -16 Q ${2 + i * 10} 0 ${-6 + i * 10} 16`} stroke={col} strokeWidth={5} fill="none" strokeLinecap="round" />)}
    </g> : null}
  </W>;
};
/** whisper position along its path at progress p (for the camera) */
const whisperHead = (sx: number, sy: number, ex: number, ey: number, p: number) => { const pts = pathPts(sx, sy, ex, ey); const v = partial(pts, cum(pts), p); return v[v.length - 1]; };
const Ghost: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y + 8 * Math.sin(t * 6)}) scale(${s})`}>
    <path d="M -40 30 V -10 Q -40 -50 0 -50 Q 40 -50 40 -10 V 30 L 26 18 L 13 30 L 0 18 L -13 30 L -26 18 Z" fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={-12} cy={-14} r={5} fill={INK} /><circle cx={12} cy={-14} r={5} fill={INK} /><ellipse cx={0} cy={4} rx={6} ry={8} fill={INK} />
  </g></W>) : null;
const Hat: React.FC<{hx: number; hy: number; r: number; col: string; rot?: number}> = ({hx, hy, r, col, rot = 0}) => (
  <W><g transform={`translate(${hx} ${hy - 0.86 * r}) rotate(${rot}) scale(${r / 64})`}>
    <path d="M -58 6 Q -60 -30 0 -36 Q 60 -30 58 6 Z" fill={col} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 20 -30 Q 70 -90 96 -70 Q 70 -60 34 -26" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g></W>
);
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 70, rot = 0, fill = '#fff'}) => s > 0.01 ? (
  <W><text transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900}
    fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round" style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;

// ---------- screen-space close-up inserts ----------
const WallBg: React.FC<{dark?: number}> = ({dark = 0}) => (
  <AbsoluteFill style={{background: STONE}}>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: 15}, (_, r) => <g key={r}><path d={`M 0 ${r * 140} H 1080`} stroke={STONE2} strokeWidth={8} />
        {Array.from({length: 6}, (_, c) => <path key={c} d={`M ${c * 240 + (r % 2) * 120} ${r * 140} v 140`} stroke={STONE2} strokeWidth={8} />)}</g>)}
    </svg>
    <AbsoluteFill style={{background: `radial-gradient(ellipse 70% 60% at 50% 45%, transparent 40%, rgba(60,35,15,${0.35 + dark}) 100%)`}} />
  </AbsoluteFill>
);
/** the king's face, huge: eyes popped, wooden crown, woodpecker; the whisper shoots into his ear from the left */
const KingIns: React.FC<{t: number; at: number}> = ({t, at}) => {
  const u = t - at, m = (CAST as any).king_shock as CM, R = 420, s = R / m.head[2];
  const hx = 560, hy = 1040 + 30 * eout(1 - seg(u, 0, 0.25)), sc = 1 + spring(u, 0, -0.06, 3, 6);
  const sh = shake(t, hit(t, at + 0.05, 14));
  const line = seg(u, -0.05, 0.12);
  return <AbsoluteFill style={{overflow: 'hidden', transform: `translate(${sh.x}px, ${sh.y}px)`}}>
    <WallBg />
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {[...Array(10)].map((_, i) => { const a = (i / 10) * Math.PI * 2 + 0.3; const p = popIn(u, 0.03 + i * 0.012, 0.25);
        return p > 0.01 ? <path key={i} d={`M ${hx + Math.cos(a) * (R + 50)} ${hy + Math.sin(a) * (R + 50)} L ${hx + Math.cos(a) * (R + 50 + 110 * p)} ${hy + Math.sin(a) * (R + 50 + 110 * p)}`}
          stroke={INK} strokeWidth={14} strokeLinecap="round" /> : null; })}
    </svg>
    <AbsoluteFill style={{filter: paperFilter(7, 1.4)}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${hx}px ${hy}px`, transform: `scale(${sc})`}}>
        <Img src={staticFile('whisper/char/king_shock.png')} style={{position: 'absolute', left: hx - m.head[0] * s, top: hy - m.head[1] * s, width: m.w * s, height: m.h * s}} />
        <Crown hx={hx} hy={hy} r={R} wood chip={1} holes={4} wob={3 * Math.sin(u * 30) * Math.exp(-4 * u)} />
        <Woodpecker x={hx + 0.22 * R} y={hy - 1.3 * R} r={R * 0.6} t={t} peck={0} flap={0} />
      </div>
    </AbsoluteFill>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {line > 0 ? <path d={`M -40 ${hy - 160} Q 60 ${hy - 140} ${hx - R + 20} ${hy + 10}`} stroke={PURPLE} strokeWidth={22} strokeDasharray="40 30"
        strokeLinecap="round" fill="none" {...pen(line)} /> : null}
    </svg>
  </AbsoluteFill>;
};
/** the advisor caught: sweat flying, trembling, a gulp */
const PanicIns: React.FC<{t: number; at: number}> = ({t, at}) => {
  const u = t - at, m = (CAST as any).adv_panic as CM, R = 300, s = R / m.head[2];
  const hx = 540 + 2.5 * Math.sin(t * 2 * Math.PI * 17), hy = 900, gulp = u > 0.55 ? spring(u, 0.55, 0.06, 3, 6) : 0;
  return <AbsoluteFill style={{overflow: 'hidden'}}>
    <WallBg dark={0.1} />
    <AbsoluteFill style={{filter: paperFilter(7, 1.4)}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${hx}px ${hy + 400}px`, transform: `scale(${1 + 0.04 * popIn(u, 0, 0.2) - gulp}, ${1 + gulp})`}}>
        <Img src={staticFile('whisper/char/adv_panic.png')} style={{position: 'absolute', left: hx - m.head[0] * s, top: hy - m.head[1] * s, width: m.w * s, height: m.h * s}} />
      </div>
    </AbsoluteFill>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {[0, 1, 2, 3].map((i) => { const ph = ((u * 1.4 + i * 0.27) % 1); const side = i % 2 ? 1 : -1;
        return <Sweat key={i} x={hx + side * (R + 40 + 160 * ph)} y={hy - R * 0.6 - 120 * ph + 260 * ph * ph} s={2.2 * (ph < 0.15 ? ph / 0.15 : 1 - ph)} raw />; })}
    </svg>
  </AbsoluteFill>;
};

// ---------- captions (1-3 words, the spoken word in yellow) ----------
type Grp = {ws: Word[]; s: number; e: number};
const GROUPS: Grp[] = (() => {
  const gs: Grp[] = []; let cur: Word[] = [];
  D.words.forEach((w, i) => {
    const prev = D.words[i - 1];
    if (cur.length && (cur.length >= 3 || /[.,?!]$/.test(prev.w) || prev.line !== w.line || w.s - prev.e > 0.35)) { gs.push({ws: cur, s: cur[0].s, e: cur[cur.length - 1].e}); cur = []; }
    cur.push(w);
  });
  if (cur.length) gs.push({ws: cur, s: cur[0].s, e: cur[cur.length - 1].e});
  return gs;
})();
const WHISPERS = ['tonight', 'treasury', 'fool'];
const Captions: React.FC<{t: number}> = ({t}) => {
  if (t < 1.95 || (t > T.rewind && t < T.cardOut)) return null;
  let gi = -1; for (let i = 0; i < GROUPS.length; i++) if (GROUPS[i].s <= t) gi = i;
  if (gi < 0) return null;
  const g = GROUPS[gi], next = GROUPS[gi + 1];
  if (t > (next ? Math.min(next.s, g.e + 0.5) : g.e + 0.5)) return null;
  const pop = 1 + 0.14 * (1 - eout(seg(t, g.s, g.s + 0.13)));
  const it = WHISPERS.includes(g.ws[0].line);
  return <div style={{position: 'absolute', left: 540, top: 1395, transform: `translate(-50%,-50%) scale(${pop})`, whiteSpace: 'nowrap', fontFamily: FONT,
    fontWeight: 900, fontSize: 84, letterSpacing: -1, fontStyle: it ? 'italic' : 'normal', WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill',
    textShadow: `0 7px 0 ${INK}`}}>
    {g.ws.map((w, i) => <span key={i} style={{color: w.s <= t && (i === g.ws.length - 1 || g.ws[i + 1].s > t) ? GOLD : '#fff'}}>{(i ? ' ' : '') + w.w.toUpperCase()}</span>)}
  </div>;
};

// ---------- explainer diagrams (screen space, on the notebook paper) ----------
const Plan: React.FC<{t: number}> = ({t}) => {
  const cx = 540, cy = 900, R = 360;
  const ring = seg(t, T.s22, T.s22 + 0.6), dot = popIn(t, T.whisperW, 0.25);
  const rings = seg(t, T.spread - 0.35, T.spread + 0.45), xs = popIn(t, T.spread + 0.35, 0.25) * (1 - seg(t, T.hugs - 0.2, T.hugs));
  const hug = seg(t, T.hugs - 0.05, T.hugs + 0.5), slide = eio(seg(t, T.slides - 0.1, T.around + 0.15));
  const a0 = 180, a1 = a0 - 180 * (0.12 + 0.88 * slide * (hug >= 1 ? 1 : 0)) - (hug < 1 ? 0 : 0);
  const band = (from: number, to: number) => ellPts(R - 34, R - 34, from, to, 80).map((q) => [cx + q[0], cy + q[1]]);
  const ear = spring(t, T.around + 0.1, 0.25, 3, 5);
  return <AbsoluteFill>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <circle cx={cx} cy={cy} r={R + 34} fill="none" stroke={INK} strokeWidth={70} {...pen(ring)} />
      <circle cx={cx} cy={cy} r={R + 34} fill="none" stroke={RING} strokeWidth={50} {...pen(ring)} />
      {ring > 0.98 ? <circle cx={cx} cy={cy} r={R - 1} fill="#F6EEDC" stroke={INK} strokeWidth={8} /> : null}
      {[0, 1, 2].map((i) => { const u = clamp(rings * 1.4 - i * 0.2); return u > 0.01 && xs < 0.99 ? <circle key={i} cx={cx - R + 70} cy={cy} r={40 + 300 * u}
        fill="none" stroke={PURPLE} strokeWidth={8} strokeDasharray="22 18" opacity={0.5 * (1 - u) + 0.2} /> : null; })}
      {xs > 0.01 ? <g transform={`translate(${cx - R + 260} ${cy}) scale(${xs}) rotate(-8)`}>
        <path d="M -90 -90 L 90 90 M 90 -90 L -90 90" stroke="#E5484D" strokeWidth={34} strokeLinecap="round" /></g> : null}
      {hug > 0.01 ? <path d={toD(band(a0, hug < 1 ? a0 - 22 * hug : a1))} stroke={PURPLE} strokeWidth={26} strokeDasharray="40 26"
        strokeDashoffset={-t * 120} strokeLinecap="round" fill="none" /> : null}
    </svg>
    {/* the two people, seen from above */}
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: paperFilter(5, 1)}}>
      {dot > 0.01 ? <g transform={`translate(${cx - R + 70} ${cy}) scale(${dot})`}>
        <circle r={46} fill="#fff" stroke={INK} strokeWidth={8} /><path d="M -30 -30 L 0 -96 L 30 -30 Z" fill="#5B3A9E" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      </g> : null}
      {ring > 0.6 ? <g transform={`translate(${cx + R - 70} ${cy})`}>
        <circle r={46} fill="#fff" stroke={INK} strokeWidth={8} />
        <path d="M -34 -28 L -34 -62 L -17 -44 L 0 -70 L 17 -44 L 34 -62 L 34 -28 Z" fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cx={-46} cy={4} rx={14 * (1 + ear)} ry={20 * (1 + ear)} fill="#fff" stroke={INK} strokeWidth={6} />
      </g> : null}
    </svg>
    <Badge text="SEEN FROM ABOVE" s={0.55 * popIn(t, T.s22 + 0.2)} y={430} />
  </AbsoluteFill>;
};
const StPauls: React.FC<{t: number}> = ({t}) => {
  const cx = 540, top = 470, cut = seg(t, T.carries - 0.2, T.carries + 0.3), dim = popIn(t, T.m34, 0.3), trail = eio(seg(t, T.carries + 0.1, T.other + 0.4));
  const enter = popIn(t, T.s23, 0.35);
  const gy = top + 560, gr = 300;
  const ringPts = ellPts(gr, 70, 180, 360, 60).map((q) => [cx + q[0], gy + q[1]]);
  const tp = ringPts.slice(0, Math.max(2, Math.round(trail * ringPts.length)));
  return <AbsoluteFill>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible', filter: paperFilter(6, 1.2)}}>
      <g transform={`translate(${cx} ${gy + 230}) scale(${enter}) translate(${-cx} ${-(gy + 230)})`}>
        <rect x={cx - 400} y={gy + 120} width={800} height={240} fill="#D9D2C2" stroke={INK} strokeWidth={9} />
        {Array.from({length: 9}, (_, i) => <rect key={i} x={cx - 380 + i * 90} y={gy + 140} width={34} height={200} fill="#EFEADF" stroke={INK} strokeWidth={6} />)}
        <rect x={cx - 330} y={gy - 10} width={660} height={140} fill="#E4DED1" stroke={INK} strokeWidth={9} />
        {Array.from({length: 11}, (_, i) => <rect key={i} x={cx - 315 + i * 60} y={gy + 6} width={22} height={108} fill="#F3EFE6" stroke={INK} strokeWidth={5} />)}
        <rect x={cx - 210} y={gy + 196} width={420} height={92} rx={14} fill="#fff" stroke={INK} strokeWidth={7} />
        <text x={cx} y={gy + 258} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK} letterSpacing={-1}>ST PAUL'S</text>
        <path d={`M ${cx - 320} ${gy - 10} Q ${cx - 320} ${top + 40} ${cx} ${top + 20} Q ${cx + 320} ${top + 40} ${cx + 320} ${gy - 10} Z`} fill={cut > 0.5 ? '#F6F1E6' : '#9FB4BE'} stroke={INK} strokeWidth={10} />
        {cut <= 0.5 ? [-200, -100, 0, 100, 200].map((dx) => <path key={dx} d={`M ${cx + dx} ${gy - 10} Q ${cx + dx * 0.7} ${top + 140} ${cx + dx * 0.15} ${top + 30}`} stroke="#7F969F" strokeWidth={6} fill="none" />) : null}
        <rect x={cx - 34} y={top - 90} width={68} height={110} fill="#E4DED1" stroke={INK} strokeWidth={8} />
        <path d={`M ${cx - 46} ${top - 90} Q ${cx} ${top - 150} ${cx + 46} ${top - 90} Z`} fill="#9FB4BE" stroke={INK} strokeWidth={8} />
        <path d={`M ${cx} ${top - 150} V ${top - 215} M ${cx - 20} ${top - 190} H ${cx + 20}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
        {cut > 0.5 ? <>
          <ellipse cx={cx} cy={gy} rx={gr} ry={70} fill="none" stroke={INK} strokeWidth={10} />
          <ellipse cx={cx} cy={gy} rx={gr - 26} ry={56} fill="none" stroke={RING} strokeWidth={14} />
          <circle cx={cx - gr + 40} cy={gy + 46} r={24} fill="#fff" stroke={INK} strokeWidth={6} />
          <circle cx={cx + gr - 40} cy={gy + 46} r={24} fill="#fff" stroke={INK} strokeWidth={6} />
        </> : null}
      </g>
    </svg>
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {cut > 0.5 && trail > 0.01 ? <path d={toD(tp)} stroke={PURPLE} strokeWidth={16} strokeDasharray="26 18" strokeDashoffset={-t * 100} strokeLinecap="round" fill="none" /> : null}
      {dim > 0.01 ? <g opacity={1}>
        <path d={`M ${cx - gr + 10} ${gy - 150} H ${cx + gr - 10}`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
        <path d={`M ${cx - gr + 10} ${gy - 150} H ${cx + gr - 10}`} stroke={GOLD} strokeWidth={10} strokeLinecap="round" />
        <path d={`M ${cx - gr + 50} ${gy - 180} L ${cx - gr + 10} ${gy - 150} L ${cx - gr + 50} ${gy - 120} M ${cx + gr - 50} ${gy - 180} L ${cx + gr - 10} ${gy - 150} L ${cx + gr - 50} ${gy - 120}`}
          stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g> : null}
    </svg>
    {dim > 0.01 ? <div style={{position: 'absolute', left: cx, top: gy - 235, transform: `translate(-50%,-50%) scale(${dim}) rotate(-3deg)`, fontFamily: FONT, fontWeight: 900,
      fontSize: 96, color: GOLD, WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 7px 0 ${INK}`}}>34 M</div> : null}
  </AbsoluteFill>;
};

// ---------- the scene ----------
const WIDE = {x: 0, y: -830, k: 0.42};
const advMouth = (y = 0) => ({x: ADV_X - 58, y: y - 312});
const KING_EAR = {x: WALL_X + 66, y: -268}, GUY_EAR = {x: WALL_X + 62, y: -262};

export const WhisperScene: React.FC<{t: number}> = ({t}) => {
  const shot = shotAt(t);
  // ----- camera keys per shot (cuts = a key just before the cut time) -----
  const K: Key[] = [];
  const hold = (a: number, b: number, x: number, y: number, k: number) => { K.push({t: a, x, y, k}, {t: b - 0.001, x, y, k}); };
  const mv = (a: number, b: number, x0: number, y0: number, k0: number, x1: number, y1: number, k1: number, e?: 'out') => { K.push({t: a, x: x0, y: y0, k: k0}, {t: b, x: x1, y: y1, k: k1, e}); };
  mv(0, T.pull, -1060, -330, 1.45, -1060, -330, 1.42); mv(T.pull + 0.001, 1.5, -1060, -330, 1.42, WIDE.x, WIDE.y, WIDE.k);
  hold(1.5, T.hall, WIDE.x, WIDE.y, WIDE.k);
  mv(T.hall, T.leaned - 0.2, 0, -820, 0.43, 0, -800, 0.45); mv(T.leaned - 0.2, T.whispered + 0.6, 0, -800, 0.45, -980, -380, 1.05);
  hold(T.whispered + 0.6, T.s6, -980, -380, 1.05);
  // s6/s7: on the advisor, then follow the whisper over the dome to the sweeper
  const wS = advMouth(), p7 = (tt: number) => eio(seg(tt, T.tonight + 0.2, T.heard1 + 0.05));
  const head7 = (tt: number) => whisperHead(wS.x, wS.y, GUY_EAR.x, GUY_EAR.y, p7(tt));
  hold(T.s6, T.fake - 0.3, -1040, -350, 1.3);
  for (let tt = T.fake - 0.3; tt < T.heard1 + 0.4; tt += 0.25) {
    const h = head7(tt), f = seg(tt, T.fake - 0.3, T.fake + 0.4);
    K.push({t: tt, x: lerp(-1040, h[0], f), y: lerp(-350, h[1] + 120, f), k: lerp(1.3, 0.8, f)});
  }
  mv(T.heard1 + 0.4, T.s8, head7(T.heard1 + 0.4)[0], head7(T.heard1 + 0.4)[1] + 120, 0.8, 1000, -330, 1.1);
  hold(T.s8, T.s9, 130, -330, 1.05);
  hold(T.s9, T.s10, -170, -340, 1.05);
  mv(T.s10, T.loudest - 0.1, 0, -420, 0.6, 0, -410, 0.62); mv(T.loudest - 0.1, T.loudest + 0.3, 0, -410, 0.62, 0, -330, 1.1, 'out'); hold(T.loudest + 0.3, T.s11, 0, -330, 1.1);
  mv(T.s11, T.allOf - 0.08, 150, -330, 1.0, 160, -335, 1.04);
  hold(T.allOf - 0.08, T.s12, 0, -900, 0.3);
  mv(T.s12, T.s13, 0, -230, 1.45, 0, -240, 1.55);
  hold(T.s13, T.s16, 0, -330, 1.45);
  mv(T.s16, T.s17, 0, -330, 1.45, 0, -350, 1.2);
  hold(T.s17, T.s18, -1040, -350, 1.3);
  mv(T.s18, T.listen, 760, -340, 0.95, 860, -340, 1.0); hold(T.listen, T.s20, 900, -330, 1.12);
  mv(T.s20, T.fool + 0.4, -1040, -350, 1.3, -1040, -350, 1.34); mv(T.fool + 0.4, T.fool + 1.4, -1040, -350, 1.34, WIDE.x, WIDE.y, WIDE.k);
  hold(T.fool + 1.4, T.s21, WIDE.x, WIDE.y, WIDE.k);
  hold(T.s21, T.s24, 0, -500, 1);   // inserts / diagrams are screen space
  mv(T.s24, T.all2 - 0.1, -1000, -340, 1.15, -990, -345, 1.2); mv(T.all2 - 0.1, T.all2 + 0.6, -990, -345, 1.2, 0, -900, 0.3, 'out'); hold(T.all2 + 0.6, T.s25, 0, -900, 0.3);
  hold(T.s25, T.s26, -1030, -350, 1.35);
  hold(T.s26, DURATION + 1, 1010, -330, 1.25);
  K.sort((a, b) => a.t - b.t);
  const cam = camAt(K, t);

  const night = shot === 's12' ? 1 : 0;
  const woodCrown = t >= T.vanishes && t < T.s24;          // from the night swap until the advisor is caught
  const hasPecker = t >= T.pecker - 0.4 && t < T.s24;
  // ----- actors per shot -----
  const W1: React.ReactNode[] = [];
  const advWhisper = (flipPose?: 'scrub') => {
    const name: CastName = flipPose ? 'adv_scrub' : 'adv_whisper';
    W1.push(<Char key="adv" name={name} x={ADV_X + (flipPose ? 20 : 0)} y={0} t={t} sx={flipPose ? 1 + 0.02 * Math.sin(t * 14) : 1} />);
  };
  const kingAt = (pose: CastName, x: number, crownWood: boolean, flip = false, extra?: {sx?: number; sy?: number}) => {
    W1.push(<Char key={'k' + pose} name={pose} x={x} y={0} t={t} flip={flip} sx={extra?.sx} sy={extra?.sy} />);
    const h = headOf(pose, x, 0);
    const rot = pose === 'king_listen' ? (flip ? 10 : -10) : pose === 'king_laugh' ? -6 + 4 * Math.sin(t * 18) : 0;
    const dy = pose === 'king_laugh' ? -6 * Math.abs(Math.sin(t * 9)) : 0;
    const chip = crownWood && t > T.wooden ? 1 : 0, holes = t > T.pecker + 0.6 ? Math.min(5, (t - T.pecker - 0.6) * 3) : 0;
    const wob = t > T.squeaks - 0.1 && t < T.squeaks + 0.6 ? 8 * Math.sin((t - T.squeaks) * 40) * Math.exp(-4 * (t - T.squeaks)) : 0;
    W1.push(<Crown key="crown" hx={h.x + (flip ? -6 : 6) * (pose === 'king_listen' ? 1 : 0)} hy={h.y + dy} r={h.r} rot={rot} wood={crownWood} chip={chip} holes={holes} wob={wob} />);
    if (crownWood && hasPecker) {
      const land = seg(t, T.pecker - 0.4, T.pecker + 0.1), fx = lerp(h.x + 500, h.x + 0.22 * h.r, eout(land)), fy = lerp(h.y - 600, h.y - 1.32 * h.r, eout(land));
      W1.push(<Woodpecker key="wp" x={fx} y={fy + dy} r={h.r * 0.75} t={t} peck={t > T.pecker + 0.5 ? 1 : 0} flap={land < 1 ? Math.abs(Math.sin(t * 30)) : 0} />);
    }
    return h;
  };
  const sweeper = (pose: Pose, x: number, flip = false, sxy?: {sx: number; sy: number}) => W1.push(<Guy key={'g' + pose} pose={pose} x={x} y={0} t={t} flip={flip} sx={sxy?.sx} sy={sxy?.sy} />);
  let whisper: React.ReactNode = null;

  if (shot === 'h1' || shot === 's20') {
    // the trap: the advisor whispers at the left wall, the king (wooden crown, woodpecker) listens at the right wall, the sweeper beside him
    advWhisper();
    kingAt('king_listen', WALL_X, true, true);
    sweeper('present', WALL_X - 300, false);
    const a = shot === 'h1' ? 0.3 : T.fool + 0.3, b = shot === 'h1' ? T.arrive : T.s21 - 0.06;
    whisper = <Whisper sx={advMouth().x} sy={advMouth().y} ex={KING_EAR.x} ey={KING_EAR.y} p={eio(seg(t, a, b)) * 0.985 + (t < a ? 0.012 : 0)} t={t} />;
  } else if (shot === 's5' || shot === 's6') {
    const pose = sw<CastName>(t, T.leaned, 'adv_front', 'adv_whisper');
    W1.push(<Char key="adv" name={pose.pose} x={ADV_X} y={0} t={t} sx={pose.sx} sy={pose.sy} />);
    kingAt('king_calm', 0, false);
    const g = t < T.heard1 ? null : 1;
    W1.push(<Char key="sw" name={g ? 'guy_listen' : 'guy_sweep'} x={WALL_X - 20} y={0} t={t} flip={!!g} rot={g ? 0 : 3 * Math.sin(t * 7)} />);
    whisper = <Whisper sx={advMouth().x} sy={advMouth().y} ex={GUY_EAR.x} ey={GUY_EAR.y} p={p7(t)} t={t} out={seg(t, T.word1 + 0.2, T.s8 - 0.1)} />;
  } else if (shot === 's8') {
    kingAt('king_calm', 0, false);
    sweeper('point_right', 300, true);
  } else if (shot === 's9') {
    kingAt('king_calm', 120, false);
    W1.push(<Char key="adv" name="adv_laugh" x={-360} y={0} t={t} sy={1 + 0.02 * Math.abs(Math.sin(t * 12))} />);
    W1.push(<Ghost key="gh" x={-20} y={-600} s={2.1 * popIn(t, T.ghosts - 0.05, 0.3)} t={t} />);
  } else if (shot === 's10') {
    [-700, -520, 520, 700].forEach((x, i) => {
      const flip = x > 0, size = 0.9, bob = Math.abs(Math.sin(t * 11 + i));
      W1.push(<Guy key={'c' + i} pose="laugh" x={x} y={0} t={t} size={size} flip={flip} sy={1 + 0.03 * bob} />);
      const h = guyHead('laugh', x, 0, size, flip);
      W1.push(<Hat key={'h' + i} hx={h.x} hy={h.y - 3 * bob} r={h.r} col={['#3BB273', '#E5484D', '#4FA3E0', '#F2994A'][i]} rot={flip ? 8 : -8} />);
    });
    W1.push(<Char key="adv" name="adv_laugh" x={-300} y={0} t={t} />);
    kingAt('king_laugh', 0, false, false, {sy: 1 + 0.025 * Math.abs(Math.sin(t * 10))});
    sweeper('front_worried', 320, false);
  } else if (shot === 's11' || shot === 's11b') {
    if (shot === 's11') { kingAt('king_point', 0, false); sweeper('front_worried', 340, false); }
    else W1.push(<Char key="sw" name="guy_sweep" x={WALL_X - 20} y={0} t={t} rot={4 * Math.sin(t * 9)} />);
  } else if (shot === 's12') {
    // night: the advisor sneaks in, a puff, and the crown on the cushion is wooden
    const ax = lerp(-520, -230, eout(seg(t, T.s12 + 0.1, T.vanishes - 0.35))) - 400 * eio(seg(t, T.vanishes + 0.25, T.s13));
    W1.push(<Char key="adv" name="adv_front" x={ax} y={0} t={t} rot={2 * Math.sin(t * 8)} />);
    W1.push(<Crown key="cr" hx={0} hy={-150 + 0.9 * 64} r={64} wood={t >= T.vanishes} />);
    W1.push(<Puffs key="pf" t={t} born={T.vanishes - 0.05} x={0} y={-190} n={9} life={0.7} size={50} vy={-40} color="#fff" seed={6} />);
  } else if (shot === 's13' || shot === 's16') {
    const nod = t > T.squeaks - 0.25 && t < T.squeaks + 0.5 ? 1 + 0.04 * Math.sin((t - T.squeaks + 0.25) * 16) : 1;
    const h = kingAt('king_calm', 0, true, false, {sy: nod});
    if (t > T.wooden && t < T.wooden + 1.4) {   // a flake of gold paint falls off
      const u = t - T.wooden; W1.push(<W key="flake"><path d={`M ${h.x + 35 + 40 * u} ${h.y - 0.95 * h.r + 260 * u * u} l 18 4 l -6 14 z`} fill={GOLD} stroke={INK} strokeWidth={3} /></W>);
    }
    W1.push(<Txt key="wd" x={h.x + 150} y={h.y - 1.3 * h.r} s={popIn(t, T.wooden + 0.25) * (1 - seg(t, T.s14 - 0.3, T.s14 - 0.05))} text="WOOD" size={44} rot={-8} fill={GOLD} />);
    W1.push(<Txt key="sq" x={h.x - 140} y={h.y - 1.45 * h.r} s={popIn(t, T.squeaks, 0.2) * (1 - seg(t, T.squeaks + 0.7, T.squeaks + 0.9))} text="SQUEAK" size={40} rot={8} />);
    if (t > T.pecker + 0.5) {
      W1.push(<Puffs key="ch" t={t} born={T.pecker + 0.6 + Math.floor((t - T.pecker - 0.6) / 0.5) * 0.5} x={h.x + 30} y={h.y - 1.1 * h.r} n={4} life={0.45} size={9} vy={-120} vx={120} color="#C48A4F" seed={Math.floor(t * 2)} />);
    }
  } else if (shot === 's17') {
    advWhisper();
    whisper = <Whisper sx={advMouth().x} sy={advMouth().y} ex={KING_EAR.x} ey={KING_EAR.y} p={0.1 * seg(t, T.treasury + 0.1, T.s18)} t={t} />;
  } else if (shot === 's18') {
    // the sweeper leads the king to the far wall; on "ear" the king leans in, the sweeper steps aside
    const atWall = t >= T.ear;
    const kx = atWall ? WALL_X : lerp(330, 760, eio(seg(t, T.s18 + 0.4, T.ear - 0.2)));
    if (atWall) kingAt('king_listen', kx, true, true, sw(t, T.ear, 'a', 'b')); else kingAt('king_calm', kx, true);
    const gx = lerp(560, 990, eio(seg(t, T.s18 + 0.2, T.ear - 0.5))) - 190 * eio(seg(t, T.ear - 0.4, T.ear + 0.1));
    sweeper(t < T.listen - 0.1 ? 'walk' : 'present', gx, false);
  } else if (shot === 's24' || shot === 's25' || shot === 's26') {
    advWhisper('scrub');
    if (t > T.s24 + 0.05) W1.push(<Puffs key="suds" t={t} born={Math.floor(t / 0.4) * 0.4} x={ADV_X - 120} y={-330} n={5} life={0.5} size={14} vy={60} vx={-20} color="#fff" seed={Math.floor(t * 2.5)} />);
    // the king, gold crown back, now listens at the far wall himself; on "I heard that" he points back
    if (shot === 's26') kingAt(t < T.iheard - 0.05 ? 'king_listen' : 'king_point', WALL_X, false, true, sw(t, T.iheard - 0.05, 'a', 'b'));
    else kingAt('king_listen', WALL_X, false, true);
    if (shot === 's25' || shot === 's26') whisper = <Whisper sx={advMouth().x - 20} sy={advMouth().y + 10} ex={KING_EAR.x} ey={KING_EAR.y} p={eio(seg(t, T.stupid + 0.5, T.s26 + 0.05))} t={t} out={seg(t, T.s26 + 0.2, T.s26 + 0.7)} />;
  }

  const inserts = shot === 'kingIns' || shot === 'panicIns' || shot === 's22' || shot === 's23';
  const insAt = SHOTS.filter(([a, id]) => id === shot && a <= t).map(([a]) => a).pop() ?? 0;
  const sh = shake(t, hit(t, T.arrive, 6) + hit(t, T.s21 - 0.06, 6));
  // rewind: the panic shot spins away while an ink scribble wipes to three days earlier
  const rw = seg(t, T.rewind, T.hall), spin = shot === 'panicIns' && t > T.rewind && t < T.hall ? eio(rw) : 0;
  return (
    <AbsoluteFill style={{background: OUT, overflow: 'hidden'}}>
      {!inserts ? <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px)`}}>
        <Layer cam={cam} z={1000}>
          <Hall t={t} night={night} />
          {W1}
        </Layer>
        <Layer cam={cam} z={1000} paper={false}>{whisper}</Layer>
        {night ? <AbsoluteFill style={{background: 'rgba(16,26,72,0.55)', mixBlendMode: 'multiply'}} /> : null}
        {night ? <AbsoluteFill style={{background: 'linear-gradient(120deg, transparent 30%, rgba(255,245,200,0.18) 42%, transparent 55%)'}} /> : null}
      </AbsoluteFill> : null}
      {shot === 'kingIns' ? <KingIns t={t} at={insAt} /> : null}
      {shot === 'panicIns' ? <AbsoluteFill style={{transform: `rotate(${-200 * spin}deg) scale(${1 - 0.7 * spin})`}}><PanicIns t={t} at={insAt} /></AbsoluteFill> : null}
      {shot === 's22' ? <Plan t={t} /> : null}
      {shot === 's23' ? <StPauls t={t} /> : null}
      {t > T.rewind && t < T.hall + 0.35 ? <Scribble t={t} /> : null}
      <Badge text="3 DAYS EARLIER" s={popIn(t, T.rewind + 0.28, 0.3) * (1 - seg(t, T.cardOut - 0.25, T.cardOut))} y={760} color={INK} />
      <Badge text="40 METERS" s={0.85 * popIn(t, T.forty - 0.05) * (1 - seg(t, T.forty + 2.3, T.forty + 2.55))} y={330} />
      <Badge text="DAY 2" s={0.8 * popIn(t, T.day2 - 0.05) * (1 - seg(t, T.s15 - 0.2, T.s15))} y={330} />
      <Badge text="DAY 3" s={0.8 * popIn(t, T.day3 - 0.05) * (1 - seg(t, T.s16 + 0.6, T.s16 + 0.85))} y={330} />
      <Badge text="THAT NIGHT" s={0.8 * popIn(t, T.s12 + 0.05) * (1 - seg(t, T.s13 - 0.25, T.s13 - 0.05))} y={330} />
      <Captions t={t} />
      <HookTitle t={t} text="NEVER WHISPER IN A ROUND ROOM" hi="ROUND" />
      <CallToAction t={t} at={T.cta} />
    </AbsoluteFill>
  );
};
/** ink scribble wipe for the rewind: thick zigzags draw across the screen, then pull away */
const Scribble: React.FC<{t: number}> = ({t}) => {
  const a = seg(t, T.rewind + 0.05, T.rewind + 0.35), b = seg(t, T.hall - 0.05, T.hall + 0.3);
  const rows = 9, d = Array.from({length: rows}, (_, i) => `${i % 2 ? 1180 : -100} ${-60 + i * 250}`).join(' L ');
  const len = a * (1 - b);
  return len > 0.002 ? <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
    <path d={`M ${d}`} stroke="#2A2340" strokeWidth={300} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1}
      strokeDasharray={b > 0 ? `${len} 2` : `${a} 2`} strokeDashoffset={b > 0 ? -b : 0} />
  </svg> : null;
};

export const WhisperVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    {f: 'whisper/sfx/music.mp3', at: 0, db: -24, keys: [[0, -22], [4.5, -24], [52, -24], [53, -27], [63.5, -27], [64.5, -24]]},
    {f: 'whisper/sfx/travel.wav', at: 0.25, db: -16}, {f: 'whoosh.wav', at: T.pull, db: -22},
    {f: 'ding.mp3', at: T.arrive + 0.04, db: -15}, {f: 'pop.wav', at: T.kingIns, db: -16},
    {f: 'whisper/sfx/gulp.wav', at: T.gulp1, db: -12},
    {f: 'whisper/sfx/rewind.wav', at: T.rewind, db: -14}, {f: 'pop.wav', at: T.rewind + 0.3, db: -18},
    {f: 'whisper/sfx/travel.wav', at: T.tonight + 0.2, db: -24}, {f: 'pop.wav', at: T.forty - 0.05, db: -22},
    {f: 'ding.mp3', at: T.heard1 + 0.02, db: -22},
    {f: 'pop.wav', at: T.ghosts - 0.05, db: -20},
    {f: 'whisper/sfx/laugh.wav', at: T.court, db: -19, to: 3.0}, {f: 'giggle.mp3', at: T.loudest - 0.05, db: -24, to: 1.2},
    {f: 'whoosh.wav', at: T.allOf - 0.1, db: -24},
    {f: 'crickets.mp3', at: T.s12, db: -26, to: 2.15}, {f: 'pop.wav', at: T.s12 + 0.05, db: -22},
    {f: 'pop.wav', at: T.vanishes - 0.05, db: -15}, {f: 'whoosh.wav', at: T.vanishes + 0.2, db: -26},
    {f: 'tick.wav', at: T.wooden + 0.5, db: -18}, {f: 'pop.wav', at: T.wooden + 0.25, db: -22},
    {f: 'pop.wav', at: T.day2 - 0.05, db: -21}, {f: 'whisper/sfx/squeak.wav', at: T.squeaks - 0.02, db: -14}, {f: 'whisper/sfx/squeak.wav', at: T.squeaks + 0.22, db: -17},
    {f: 'pop.wav', at: T.day3 - 0.05, db: -21}, {f: 'whoosh.wav', at: T.pecker - 0.45, db: -27},
    {f: 'whisper/sfx/peck.wav', at: T.pecker + 0.55, db: -16}, {f: 'whisper/sfx/peck.wav', at: T.s16 + 0.4, db: -18},
    {f: 'whisper/sfx/travel.wav', at: T.treasury + 0.1, db: -24},
    {f: 'whisper/sfx/travel.wav', at: T.fool + 0.3, db: -17}, {f: 'whoosh.wav', at: T.fool + 0.4, db: -22},
    {f: 'ding.mp3', at: T.s21 - 0.04, db: -15}, {f: 'pop.wav', at: T.s21, db: -16},
    {f: 'whisper/sfx/gulp.wav', at: T.s21b + 0.3, db: -12},
    {f: 'pop.wav', at: T.whisperW, db: -22}, {f: 'twang.mp3', at: T.spread + 0.35, db: -22, to: 0.6}, {f: 'whisper/sfx/travel.wav', at: T.slides - 0.1, db: -21},
    {f: 'ding.mp3', at: T.around + 0.1, db: -22},
    {f: 'pop.wav', at: T.s23, db: -20}, {f: 'pop.wav', at: T.m34, db: -18},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: T.all2 - 0.1, db: -24},
    {f: 'whisper/sfx/travel.wav', at: T.stupid + 0.5, db: -19}, {f: 'ding.mp3', at: T.s26, db: -18},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -24},
  ];
  return (
    <AbsoluteFill style={{background: OUT, overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<WhisperScene t={0} />}>
        <WhisperScene t={t} />
      </LoopOut>
      <AskBanner />
      <Look />
      <SoundLayer voice="whisper/vo/dialogue.mp3" voiceAt={D.voiceAt} cues={cues} />
    </AbsoluteFill>
  );
};
export const WhisperWide: React.FC = () => <WideFit.Provider value={0.72}><WhisperVideo /></WideFit.Provider>;
