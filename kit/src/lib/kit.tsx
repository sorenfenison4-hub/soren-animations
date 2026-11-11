// Cut-out cartoon kit: everything reusable from the elevator Short.
// Character poses come from public/library/char (Higgsfield, measured in library.json);
// everything else (props, faces, effects, badges) is drawn in code in the same flat style.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import LIB from './library.json';
import CAST from './cast.json';

export const FPS = 60;
export const INK = '#141414';
export const FONT = "'Inter', 'DejaVu Sans', sans-serif";
export const C = {
  skyTop: '#5BC3D6', skyMid: '#A9E2E4', skyLow: '#FFF0D2', ground: '#D8D1C4', wall: '#F3E6CF', shaft: '#5B6879',
  yellow: '#FFD43B', red: '#FF6A4B', blue: '#2F80ED', sweat: '#8ED3FF', steel: '#A9B4BF', lava: '#FF6A2B', lavaHot: '#FFC867',
};

// ---------- timing helpers ----------
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
export const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
export const eout = (u: number) => 1 - Math.pow(1 - u, 3);
export const backOut = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2));
/** 0 -> 1 with an overshoot, starting at t0 */
export const popIn = (t: number, t0: number, d = 0.32) => backOut(seg(t, t0, t0 + d));
/** damped wobble that starts at t0 (use for squash settles, dips, twangs) */
export const spring = (t: number, t0: number, amp: number, f = 3, damp = 6) =>
  t < t0 ? 0 : amp * Math.exp(-damp * (t - t0)) * Math.cos(2 * Math.PI * f * (t - t0));
/** seeded random in [0,1): same value on every render worker */
export const rnd = (seed: number) => { const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- 2.5D multiplane camera ----------
export type Cam = {x: number; y: number; z: number};
export type Key = {t: number; x: number; y: number; k: number; e?: 'io' | 'out'};
/** Camera keys give the screen scale k of the Z=1000 layer; zoom is interpolated in log space. Repeat a key to hold. */
export const camAt = (keys: Key[], t: number): Cam => {
  let res = {x: keys[0].x, y: keys[0].y, k: keys[0].k};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const u0 = seg(t, a.t, b.t); const u = b.e === 'out' ? eout(u0) : eio(u0);
      res = {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), k: Math.exp(lerp(Math.log(a.k), Math.log(b.k), u))};
      break;
    }
    if (t > b.t) res = {x: b.x, y: b.y, k: b.k};
  }
  return {x: res.x, y: res.y, z: 1000 - 1000 / res.k};
};
/** How much of the vertical framing a landscape render keeps (0.5625 = all of it). Wrap a scene in a Provider to change it. */
export const WideFit = React.createContext(0.5625);
const useFit = () => { const {width, height} = useVideoConfig(); const wf = React.useContext(WideFit); return {cx: width / 2, cy: height / 2, kf: width > height ? wf : 1, wide: width > height}; };
/**
 * SIGNATURE STYLE part 1 - cut paper. Everything in a Layer gets a white paper edge and casts a soft shadow onto
 * the layers behind it, so every scene reads as a paper diorama. paper={false} for a layer that should stay flat.
 * See-through things (water, glass, glow) go in their own Layer with paper={false} at the same z: the edge filter
 * stacks four drop-shadows, which turns half-transparent areas almost opaque and hides what is behind them.
 * Each Layer clips to the frame (overflow hidden): without it the filter also processes everything drawn off-screen
 * (long sea / ground bands), which made renders ~2x slower.
 */
export const paperFilter = (edge = 6, lift = 1) =>
  `drop-shadow(${edge}px 0 0 #FFFDF6) drop-shadow(-${edge}px 0 0 #FFFDF6) drop-shadow(0 ${edge}px 0 #FFFDF6) drop-shadow(0 -${edge}px 0 #FFFDF6) ` +
  `drop-shadow(${4 * lift}px ${10 * lift}px ${7 * lift}px rgba(70,45,20,0.30))`;
/** A flat layer at depth z. Near layers (small z) move and grow faster than far ones. blur is in screen px. */
export const Layer: React.FC<{cam: Cam; z: number; blur?: number; paper?: boolean; children: React.ReactNode}> = ({cam, z, blur = 0, paper = true, children}) => {
  const fit = useFit(); const d = z - cam.z;
  if (d < 250) return null;
  const k = (1000 / d) * fit.kf;
  return (
    <AbsoluteFill style={{overflow: 'hidden', filter: [paper ? paperFilter() : '', blur > 0.05 ? `blur(${blur}px)` : ''].join(' ').trim() || undefined}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0',
        transform: `translate(${fit.cx}px, ${fit.cy}px) scale(${k}) translate(${-cam.x}px, ${-cam.y}px)`}}>{children}</div>
    </AbsoluteFill>
  );
};
/** Screen shake from sums of sines times an amplitude (never random jumps). Wrap the scene in its transform. */
export const shake = (t: number, amp: number) => ({
  x: amp * (Math.sin(t * 2 * Math.PI * 13.3) * 0.7 + Math.sin(t * 2 * Math.PI * 7.1) * 0.3),
  y: amp * (Math.sin(t * 2 * Math.PI * 11.7 + 1) * 0.6 + Math.sin(t * 2 * Math.PI * 5.3) * 0.4),
});
/** amplitude envelope: a hit at t0 of size a that decays */
export const hit = (t: number, t0: number, a: number, d = 5) => (t < t0 ? 0 : a * Math.exp(-d * (t - t0)));

// ---------- pictures ----------
/** Any picture in public/ placed by an anchor point (in picture px) at world (x, y) with scale s. */
export const Pic: React.FC<{src: string; w: number; h: number; x: number; y: number; s: number; ax?: number; ay?: number;
  rot?: number; sx?: number; sy?: number; flip?: boolean; op?: number}> = ({src, w, h, x, y, s, ax, ay, rot = 0, sx = 1, sy = 1, flip = false, op = 1}) => {
  const axp = ax ?? w / 2, ayp = ay ?? h / 2;
  return <Img src={staticFile(src)} style={{position: 'absolute', left: x - axp * s, top: y - ayp * s, width: w * s, height: h * s, opacity: op,
    transformOrigin: `${axp * s}px ${ayp * s}px`, transform: `rotate(${rot}deg) scale(${(flip ? -1 : 1) * sx}, ${sy})`}} />;
};

// ---------- the guy (16 poses in the library, incl. sweep / listen with a broom) ----------
export type Pose = keyof typeof LIB;
export const POSES = Object.keys(LIB) as Pose[];
/** world head radius shared by every pose, so pose swaps never change the head size (guy is ~300 world units tall) */
export const HEAD_R = 64;
/** The guy standing with his feet at (x, y). flip = mirror (point_right -> pointing left). Breathes by default. */
export const Guy: React.FC<{pose: Pose; x: number; y: number; t: number; size?: number; sx?: number; sy?: number; rot?: number; flip?: boolean; breathe?: boolean; tremble?: number}> =
  ({pose, x, y, t, size = 1, sx = 1, sy = 1, rot = 0, flip, breathe = true, tremble = 0}) => {
    const m = (LIB as any)[pose]; const s = (HEAD_R * size) / m.head[2];
    const b = breathe ? 1 + 0.009 * Math.sin(2 * Math.PI * 0.6 * t) : 1;
    const tx = tremble * Math.sin(t * 2 * Math.PI * 17) * 1.5;
    const [ax, ay] = m.feet;
    return (
      <div style={{position: 'absolute', left: x + tx - ax * s, top: y - ay * s, width: m.w * s, height: m.h * s,
        transformOrigin: `${ax * s}px ${ay * s}px`, transform: `rotate(${rot}deg) scale(${(flip ? -1 : 1) * sx}, ${sy * b})`}}>
        <Img src={staticFile(`library/char/${pose}.png`)} style={{position: 'absolute', left: 0, top: 0, width: m.w * s, height: m.h * s}} />
      </div>
    );
  };
/** Squash-swap helper: returns the pose to show and the squash scales for a swap at tSwap (turn = narrow, act = anticipation + stretch). */
export const swap = (t: number, tSwap: number, before: Pose, after: Pose, kind: 'turn' | 'act' = 'act') => {
  const pose = t < tSwap ? before : after;
  if (kind === 'turn') {
    const u = seg(t, tSwap - 0.09, tSwap + 0.09); const n = Math.sin(Math.PI * u);
    return {pose, sx: 1 - 0.2 * n, sy: 1 + 0.03 * n + spring(t, tSwap + 0.09, 0.03, 3, 7)};
  }
  const pre = seg(t, tSwap - 0.12, tSwap);
  if (t < tSwap) return {pose, sx: 1 + 0.04 * pre, sy: 1 - 0.06 * pre};
  return {pose, sx: 1 - spring(t, tSwap, 0.03, 3, 6), sy: 1 + spring(t, tSwap, 0.04, 3, 6)};
};
export const ContactShadow: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 120}) =>
  <div style={{position: 'absolute', left: x - w / 2, top: y - 13, width: w, height: 26, borderRadius: '50%', background: 'rgba(72,54,42,0.26)', filter: 'blur(3px)'}} />;

// ---------- world SVG canvas (origin = world 0,0) ----------
export const W: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>{children}</svg>
);

// ---------- faces for objects (the fun part) ----------
export type Face = {open: number; lx: number; ly: number; lid: number; brow: number;
  mouth: 'none' | 'smile' | 'flat' | 'grit' | 'o' | 'grin' | 'frown'; squeeze: number; sweat: number};
export const FACE0: Face = {open: 1, lx: 0, ly: 0, lid: 0, brow: 0, mouth: 'smile', squeeze: 0, sweat: 0};
const eyePts = (cx: number, cy: number, rx: number, ry: number, lidY: number) => {
  const p: string[] = [];
  for (let i = 0; i <= 40; i++) { const a = (i / 40) * Math.PI * 2; p.push(`${(cx + rx * Math.cos(a)).toFixed(1)},${Math.min(cy + ry * Math.sin(a), lidY).toFixed(1)}`); }
  return p.join(' ');
};
/**
 * Cartoon face drawn on anything. (x, y) = face centre, r = face size.
 * open: 0..1 eye pop · lx/ly: look direction -1..1 · lid: 0 open .. 1 shut (0.45 = smug) · brow: degrees (+ = angry/strain, - = worried)
 * squeeze: 1 = "> <" eyes · sweat: 0..1 drops sliding down · lidColor: the object's colour.
 */
export const ObjectFace: React.FC<{x: number; y: number; r: number; f: Face; t: number; lidColor?: string}> = ({x, y, r, f, t, lidColor = '#8E969F'}) => {
  const ex = 0.34 * r, ey = -0.1 * r, rx = 0.2 * r * f.open, ry = 0.25 * r * f.open, sw = Math.max(4, r * 0.05);
  const mx = x, my = y + 0.36 * r, mw = 0.24 * r;
  return (
    <W>
      {f.squeeze > 0.5 ? [-1, 1].map((s) => <path key={s} d={`M ${x + s * ex - s * 0.15 * r} ${y + ey - 0.12 * r} L ${x + s * ex + s * 0.1 * r} ${y + ey} L ${x + s * ex - s * 0.15 * r} ${y + ey + 0.12 * r}`}
        stroke={INK} strokeWidth={sw * 1.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />)
        : f.open > 0.02 ? [-1, 1].map((s) => {
          const cx = x + s * ex, cy = y + ey, lidY = cy - ry + 2 * ry * f.lid;
          const half = rx * Math.sqrt(Math.max(0, 1 - ((lidY - cy) / ry) ** 2));
          return <g key={s}>
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" />
            <circle cx={cx + f.lx * rx * 0.4} cy={cy + f.ly * ry * 0.45} r={0.4 * rx} fill={INK} />
            <circle cx={cx + f.lx * rx * 0.4 - 0.12 * rx} cy={cy + f.ly * ry * 0.45 - 0.14 * rx} r={0.12 * rx} fill="#fff" />
            {f.lid > 0.02 ? <><polygon points={eyePts(cx, cy, rx + 1, ry + 1, lidY)} fill={lidColor} />
              <line x1={cx - half} y1={lidY} x2={cx + half} y2={lidY} stroke={INK} strokeWidth={sw * 0.85} strokeLinecap="round" /></> : null}
            <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={sw} />
          </g>;
        }) : null}
      {f.open > 0.02 || f.squeeze > 0.5 ? [-1, 1].map((s) => {
        const cx = x + s * ex, cy = y + ey - 0.42 * r, a = (f.brow * Math.PI) / 180, L = 0.17 * r;
        return <line key={'b' + s} x1={cx - s * L * Math.cos(a)} y1={cy - L * Math.sin(a)} x2={cx + s * L * Math.cos(a)} y2={cy + L * Math.sin(a)} stroke={INK} strokeWidth={sw * 1.5} strokeLinecap="round" />;
      }) : null}
      {f.mouth === 'smile' ? <path d={`M ${mx - mw} ${my - 4} Q ${mx} ${my + 0.5 * mw} ${mx + mw} ${my - 4}`} stroke={INK} strokeWidth={sw * 1.2} fill="none" strokeLinecap="round" /> : null}
      {f.mouth === 'frown' ? <path d={`M ${mx - mw} ${my + 6} Q ${mx} ${my - 0.4 * mw} ${mx + mw} ${my + 6}`} stroke={INK} strokeWidth={sw * 1.2} fill="none" strokeLinecap="round" /> : null}
      {f.mouth === 'grin' ? <path d={`M ${mx - mw} ${my - 6} Q ${mx} ${my + 0.9 * mw} ${mx + mw} ${my - 6} Z`} stroke={INK} strokeWidth={sw} fill="#5A2328" strokeLinejoin="round" /> : null}
      {f.mouth === 'flat' ? <line x1={mx - 0.7 * mw} y1={my} x2={mx + 0.7 * mw} y2={my} stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" /> : null}
      {f.mouth === 'o' ? <ellipse cx={mx} cy={my} rx={0.32 * mw} ry={0.42 * mw} fill="#5A2328" stroke={INK} strokeWidth={sw} /> : null}
      {f.mouth === 'grit' ? <g>
        <rect x={mx - mw} y={my - 0.32 * mw} width={2 * mw} height={0.64 * mw} rx={0.25 * mw} fill="#fff" stroke={INK} strokeWidth={sw} />
        <line x1={mx - mw} y1={my} x2={mx + mw} y2={my} stroke={INK} strokeWidth={sw * 0.7} />
        {[-0.5, 0, 0.5].map((q) => <line key={q} x1={mx + q * mw} y1={my - 0.32 * mw} x2={mx + q * mw} y2={my + 0.32 * mw} stroke={INK} strokeWidth={sw * 0.7} />)}
      </g> : null}
      {f.sweat > 0.01 ? [0, 1].map((i) => {
        const ph = (t * 0.9 + i * 0.5) % 1;
        return <Sweat key={'s' + i} x={x + (i ? 1 : -1) * 0.95 * r} y={y - 0.5 * r + ph * 0.55 * r} s={(r / 120) * f.sweat * (ph < 0.15 ? ph / 0.15 : ph > 0.85 ? (1 - ph) / 0.15 : 1)} raw />;
      }) : null}
    </W>
  );
};

// ---------- effects ----------
export const Sweat: React.FC<{x: number; y: number; s: number; raw?: boolean}> = ({x, y, s, raw}) => {
  if (s < 0.01) return null;
  const g = <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 -26 C 10 -10 16 0 16 8 A 16 16 0 0 1 -16 8 C -16 0 -10 -10 0 -26 Z" fill={C.sweat} stroke={INK} strokeWidth={5} />
    <ellipse cx={-6} cy={6} rx={4} ry={6} fill="#fff" />
  </g>;
  return raw ? g : <W>{g}</W>;
};
export const Arrow: React.FC<{x: number; y: number; s: number; rot?: number; color?: string}> = ({x, y, s, rot = 0, color = C.red}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -18 -60 L 18 -60 L 18 -5 L 42 -5 L 0 45 L -42 -5 L -18 -5 Z" fill={color} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  </g></W>) : null;
export const Star: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 -30 Q 6 -6 30 0 Q 6 6 0 30 Q -6 6 -30 0 Q -6 -6 0 -30 Z" fill="#FFE066" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g></W>) : null;
/**
 * Smoke / steam puffs with ONE merged outline (all ink circles first, then all fills). Puffs grow, drift, then shrink away.
 * born = start time, n = puff count, (x, y) = source, vx/vy = drift per second, colour white = steam, grey = smoke.
 */
export const Puffs: React.FC<{t: number; born: number; x: number; y: number; n?: number; life?: number; size?: number; vx?: number; vy?: number; color?: string; seed?: number}> =
  ({t, born, x, y, n = 7, life = 1.4, size = 46, vx = 0, vy = -160, color = '#FFFFFF', seed = 1}) => {
    const puffs = Array.from({length: n}).map((_, i) => {
      const t0 = born + i * 0.06, a = (t - t0) / life;
      if (a <= 0 || a >= 1) return null;
      const grow = Math.sin(Math.PI * a); const r = size * (0.6 + 0.6 * rnd(seed + i)) * grow;
      const dx = (rnd(seed + i * 3) - 0.5) * 120 * a, dy = (rnd(seed + i * 7) - 0.3) * 40 * a;
      return {cx: x + vx * (t - t0) + dx, cy: y + vy * (t - t0) + dy, r};
    }).filter(Boolean) as {cx: number; cy: number; r: number}[];
    if (!puffs.length) return null;
    return <W>
      {puffs.map((p, i) => <circle key={'i' + i} cx={p.cx} cy={p.cy} r={p.r + 7} fill={INK} />)}
      {puffs.map((p, i) => <circle key={'f' + i} cx={p.cx} cy={p.cy} r={p.r} fill={color} />)}
    </W>;
  };
/** Screen-space label that pops in (counters, "1 km", "500 m"). */
export const Badge: React.FC<{text: string; s: number; y?: number; color?: string}> = ({text, s, y, color = INK}) => {
  const fit = useFit(); if (s < 0.01) return null;
  return <div style={{position: 'absolute', left: fit.wide ? fit.cx + 560 : fit.cx, top: y ?? (fit.wide ? 170 : 250), transform: `translate(-50%,-50%) scale(${s})`,
    background: '#fff', border: `9px solid ${INK}`, borderRadius: 44, padding: '14px 46px', fontFamily: FONT, fontWeight: 900, fontSize: 104,
    color, whiteSpace: 'nowrap', boxShadow: `0 10px 0 ${INK}`}}>{text}</div>;
};

// ---------- like / subscribe / comment (every video, once) ----------
/** seconds the like / subscribe / comment doodle stays on screen */
export const CTA_DUR = 2.6;
const THUMB_D = 'M 8 30 H 20 V 56 H 8 Z M 20 31 Q 29 28 31 18 Q 33 8 39 8 Q 46 9 44 21 L 42 28 H 53 Q 60 28 59 35 Q 58 38 55 39 Q 60 41 58 46 Q 57 49 53 49 Q 57 52 54 56 Q 52 58 48 58 H 30 Q 24 58 20 55 Z';
const BELL_D = 'M 32 8 Q 35 8 35 12 Q 47 15 47 31 V 41 L 52 47 H 12 L 17 41 V 31 Q 17 15 29 12 Q 29 8 32 8 Z';
const BUBBLE_D = 'M 11 10 H 53 Q 60 10 60 17 V 40 Q 60 47 53 47 H 30 L 17 57 L 20 47 H 11 Q 4 47 4 40 V 17 Q 4 10 11 10 Z';
const CURSOR_D = 'M 0 0 L 0 36 L 9 28 L 16 43 L 23 40 L 16 25 L 28 25 Z';
const CTA_CLICK = [0.8, 1.3, 1.8];
/**
 * Like / subscribe / comment doodle - every video has it once (the voice-over never asks). Three stickers pop in
 * along a band, a cursor taps LIKE (the thumb fills blue), SUBSCRIBE (turns grey, the bell rings) and COMMENT (the "?"
 * in the bubble pops), then they pop out. Lasts CTA_DUR s from `at`. Put it inside the scene function (so it boils and
 * slides out with LoopOut), in a calm stretch after the answer lands (about 55-80 % through), never in the first 3 s,
 * finished before the loop push. y = band centre in screen px (default 250 tall / 110 wide: above the Shorts buttons
 * and below the top bar). Sounds: spread ctaCues(at) into the cue list.
 */
export const CallToAction: React.FC<{t: number; at: number; y?: number}> = ({t, at, y}) => {
  const {width, height} = useVideoConfig();
  const u = t - at;
  if (u < 0 || u > CTA_DUR) return null;
  const wide = width > height, cy = y ?? (wide ? 110 : 250), cx = width / 2;
  const WS = [205, 330, 305], GAP = 18, total = WS[0] + WS[1] + WS[2] + 2 * GAP;
  const x0 = Math.max(cx - total / 2, 145);   // clear of the notebook's red margin line (x 118-122)
  const lefts = [x0, x0 + WS[0] + GAP, x0 + WS[0] + WS[1] + 2 * GAP];
  const scaleOf = (i: number) => popIn(u, i * 0.15, 0.3) * (1 - eio(seg(u, CTA_DUR - 0.4 + i * 0.07, CTA_DUR - 0.2 + i * 0.07)))
    * (1 + spring(u, CTA_CLICK[i], 0.1, 3, 7));
  const liked = u >= CTA_CLICK[0], subbed = u >= CTA_CLICK[1], asked = u >= CTA_CLICK[2];
  const thumbRot = liked ? -16 * Math.exp(-6 * (u - CTA_CLICK[0])) * Math.sin(2 * Math.PI * 4 * (u - CTA_CLICK[0])) : 0;
  const bellRot = subbed ? 22 * Math.exp(-4.5 * (u - CTA_CLICK[1])) * Math.sin(2 * Math.PI * 6 * (u - CTA_CLICK[1])) : 0;
  const qS = asked ? 1 + spring(u, CTA_CLICK[2], 0.5, 3, 6) : 1;
  // cursor: comes in from the lower right, taps each icon, leaves
  const tap = (i: number) => ({x: lefts[i] + 52, y: cy + 8});
  const keys: [number, number, number][] = [[0.35, cx + 470, cy + 230], [0.74, tap(0).x, tap(0).y], [0.86, tap(0).x, tap(0).y],
    [1.24, tap(1).x, tap(1).y], [1.36, tap(1).x, tap(1).y], [1.74, tap(2).x, tap(2).y], [1.9, tap(2).x, tap(2).y], [2.35, cx + 520, cy + 260]];
  let cur = {x: keys[0][1], y: keys[0][2]};
  for (let k = 0; k < keys.length - 1; k++) if (u >= keys[k][0]) {
    const e = eio(seg(u, keys[k][0], keys[k + 1][0]));
    cur = {x: lerp(keys[k][1], keys[k + 1][1], e), y: lerp(keys[k][2], keys[k + 1][2], e)};
  }
  const press = Math.max(...CTA_CLICK.map((c) => Math.max(0, 1 - Math.abs(u - c) / 0.06)));
  const curOn = u > 0.35 && u < 2.35;
  const sticker = (i: number, bg: string, children: React.ReactNode) => {
    const s = scaleOf(i); if (s < 0.01) return null;
    return <div key={i} style={{position: 'absolute', left: lefts[i], top: cy - 48, width: WS[i], height: 96, transform: `scale(${s})`,
      background: bg, border: `6px solid ${INK}`, borderRadius: 26, boxShadow: `0 7px 0 ${INK}`, boxSizing: 'border-box', display: 'flex',
      alignItems: 'center', justifyContent: 'center', gap: 12, fontFamily: FONT, fontWeight: 900, fontSize: 40, letterSpacing: -0.5}}>{children}</div>;
  };
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {sticker(0, '#fff', <>
        <svg width={58} height={58} viewBox="0 0 64 64" style={{transform: `rotate(${thumbRot}deg)`}}>
          <path d={THUMB_D} fill={liked ? '#3D8FD6' : '#fff'} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        </svg><span style={{color: liked ? '#2F6FB5' : INK}}>LIKE</span></>)}
      {sticker(1, subbed ? '#DDD7CB' : '#E5534B', <>
        <svg width={58} height={58} viewBox="0 0 64 64" style={{overflow: 'visible'}}><g transform={`rotate(${bellRot} 32 10)`}>
          <path d={BELL_D} fill={subbed ? '#FFD43B' : '#fff'} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          <circle cx={32} cy={52} r={5} fill="#fff" stroke={INK} strokeWidth={4} />
        </g></svg><span style={{color: subbed ? INK : '#fff'}}>SUBSCRIBE</span></>)}
      {sticker(2, '#fff', <>
        <svg width={58} height={58} viewBox="0 0 64 64" style={{overflow: 'visible'}}>
          <path d={BUBBLE_D} fill={asked ? '#FFE98A' : '#fff'} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          <text x={32} y={39} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}
            transform={`translate(32 29) scale(${qS}) translate(-32 -29)`}>?</text>
        </svg><span>COMMENT</span></>)}
      <svg width={width} height={height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
        {CTA_CLICK.map((c, i) => {
          const v = seg(u, c, c + 0.35); if (v <= 0 || v >= 1) return null;
          return <circle key={i} cx={tap(i).x} cy={tap(i).y} r={12 + 44 * eout(v)} fill="none" stroke={INK} strokeWidth={7 * (1 - v)} />;
        })}
        {curOn ? <g transform={`translate(${cur.x} ${cur.y}) scale(${1.6 * (1 - 0.16 * press)})`}>
          <path d={CURSOR_D} fill="#fff" stroke={INK} strokeWidth={3.4} strokeLinejoin="round" />
        </g> : null}
      </svg>
    </AbsoluteFill>
  );
};
/** sound cues for CallToAction(at): quiet pops as the stickers land, a click per tap, a soft ding for the bell */
export const ctaCues = (at: number): Cue[] => [
  {f: 'pop.wav', at, db: -30}, {f: 'pop.wav', at: at + 0.15, db: -31}, {f: 'pop.wav', at: at + 0.3, db: -31},
  {f: 'pop.wav', at: at + CTA_CLICK[0], db: -24}, {f: 'ding.mp3', at: at + CTA_CLICK[1], db: -27}, {f: 'pop.wav', at: at + CTA_CLICK[2], db: -24},
];

// ---------- "comment your question" banner (every video, whole video) ----------
/**
 * Small sticker in the top band that stays on screen for the WHOLE video, asking for the next question. Put it OUTSIDE
 * LoopOut (after it, before <Look />): it never moves or boils, so it is identical on frame 0 and the last frame and
 * cannot break the loop. Default y = 165 tall (just under the Shorts top bar, above the CallToAction band at 250) /
 * 46 wide. Not in thumbnails.
 */
export const AskBanner: React.FC<{text?: string; y?: number}> = ({text = 'Comment what question you want answered next', y}) => {
  const fit = useFit();
  const fs = fit.wide ? 26 : 32;
  return (
    <div style={{position: 'absolute', left: fit.cx, top: y ?? (fit.wide ? 46 : 165), transform: 'translate(-50%,-50%) rotate(-1deg)',
      display: 'flex', alignItems: 'center', gap: 12, background: '#FFF3B0', border: `5px solid ${INK}`, borderRadius: 18,
      padding: '7px 20px 7px 14px', boxShadow: `0 6px 0 ${INK}`, fontFamily: FONT, fontWeight: 800, fontSize: fs, color: INK,
      whiteSpace: 'nowrap', letterSpacing: -0.3, pointerEvents: 'none'}}>
      <svg width={fs * 1.35} height={fs * 1.35} viewBox="0 0 64 64">
        <path d={BUBBLE_D} fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <text x={32} y={39} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}>?</text>
      </svg>
      {text}
    </div>
  );
};

// ---------- opening hook text (every video) ----------
/** seconds the hook text stays before it pops out (default) */
export const HOOK_OUT = 1.8;
/**
 * Big hook text for the first ~2 s, for viewers scrolling with the sound off. It is fully on screen at frame 0 (no
 * pop-in: frame 0 is what the feed shows) and pops out at `out`. Put it inside the scene function so it boils, and so
 * LoopOut slides it back in with the opening shot (the question reappears as the loop restarts).
 * text: 2-6 words, the question or the surprising fact ("THE MOON IS LEAVING?"); hi: one word of it drawn on a yellow
 * marker stroke. Default band y = 350 tall / 130 wide (below the AskBanner). Keep faces out of that band at t = 0.
 */
export const HookTitle: React.FC<{t: number; text: string; hi?: string; out?: number; y?: number}> = ({t, text, hi, out = HOOK_OUT, y}) => {
  const fit = useFit();
  const s = 1 - backOut(seg(t, out - 0.05, out + 0.25)) * (t > out ? 1 : 0);
  if (s < 0.02 || t > out + 0.25) return null;
  const bob = 1 + 0.025 * Math.sin(t * 2 * Math.PI * 1.6);  // alive from frame 0 (sin 0 = 0, so frame 0 stays fixed)
  const words = text.split(' ');
  const fs = fit.wide ? 64 : 92;
  return (
    <div style={{position: 'absolute', left: fit.cx, top: y ?? (fit.wide ? 130 : 350), transform: `translate(-50%,-50%) rotate(-2deg) scale(${Math.max(0, s) * bob})`,
      background: '#fff', border: `9px solid ${INK}`, borderRadius: 40, padding: fit.wide ? '12px 36px' : '18px 44px', boxShadow: `0 10px 0 ${INK}`,
      fontFamily: FONT, fontWeight: 900, fontSize: fs, lineHeight: 1.08, letterSpacing: -1, color: INK, textAlign: 'center',
      maxWidth: fit.wide ? 1100 : 860, width: 'max-content'}}>
      {words.map((w, i) => {
        const on = hi && w.replace(/[^A-Za-z0-9']/g, '').toLowerCase() === hi.toLowerCase();
        return <React.Fragment key={i}>{i ? ' ' : ''}<span style={on ? {background: 'linear-gradient(transparent 18%, #FFD43B 18%, #FFD43B 88%, transparent 88%)',
          padding: '0 8px', margin: '0 -4px', borderRadius: 10} : undefined}>{w}</span></React.Fragment>;
      })}
    </div>
  );
};

// ---------- props drawn in code (flat fill + one soft shade + thick outline) ----------
/** Rounded box: crates, phones, books, signs, cars... with an optional shade band on the right. */
export const Box: React.FC<{x: number; y: number; w: number; h: number; fill: string; shade?: string; r?: number; rot?: number; children?: React.ReactNode}> =
  ({x, y, w, h, fill, shade, r = 18, rot = 0, children}) => (
    <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill={fill} />
      {shade ? <path d={`M ${w / 2 - w * 0.22} ${-h / 2} H ${w / 2 - r} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + r} V ${h / 2 - r} Q ${w / 2} ${h / 2} ${w / 2 - r} ${h / 2} H ${w / 2 - w * 0.22} Z`} fill={shade} /> : null}
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={r} fill="none" stroke={INK} strokeWidth={8} />
      {children}
    </g></W>
  );
/** Ball / planet / fruit / rock (wobble > 0 makes a lumpy rock). */
export const Ball: React.FC<{x: number; y: number; r: number; fill: string; shade?: string; wobble?: number; rot?: number; seed?: number}> =
  ({x, y, r, fill, shade, wobble = 0, rot = 0, seed = 3}) => {
    const pts = Array.from({length: 24}).map((_, i) => { const a = (i / 24) * Math.PI * 2; const rr = r * (1 + wobble * (rnd(seed + i) - 0.5)); return [Math.cos(a) * rr, Math.sin(a) * rr]; });
    const d = wobble > 0 ? 'M ' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L ') + ' Z' : `M ${-r} 0 A ${r} ${r} 0 1 0 ${r} 0 A ${r} ${r} 0 1 0 ${-r} 0 Z`;
    return <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <path d={d} fill={fill} />
      {shade ? <g><clipPath id={`b${seed}`}><path d={d} /></clipPath><circle cx={r * 0.35} cy={r * 0.35} r={r * 0.95} fill={shade} clipPath={`url(#b${seed})`} opacity={0.9} />
        <circle cx={-r * 0.12} cy={-r * 0.12} r={r * 0.92} fill={fill} clipPath={`url(#b${seed})`} /></g> : null}
      <path d={d} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    </g></W>;
  };
/** Thick outlined line / cable / rope / stick from (x0,y0) to (x1,y1) with an optional sag. */
export const Rope: React.FC<{x0: number; y0: number; x1: number; y1: number; w?: number; fill?: string; sag?: number}> = ({x0, y0, x1, y1, w = 12, fill = C.steel, sag = 0}) => {
  const d = `M ${x0} ${y0} Q ${(x0 + x1) / 2 + sag} ${(y0 + y1) / 2 + Math.abs(sag)} ${x1} ${y1}`;
  return <W><path d={d} stroke={INK} strokeWidth={w + 10} fill="none" strokeLinecap="round" /><path d={d} stroke={fill} strokeWidth={w} fill="none" strokeLinecap="round" /></W>;
};

// ---------- backgrounds ----------
/** Signature sky: blank notebook paper (the ruled lines come from Boil). Draw your own backdrop for night / space scenes. */
export const Sky: React.FC = () => <AbsoluteFill style={{background: '#FBF7EC'}} />;
/**
 * Signature finish, laid over the whole frame in every video (outside LoopOut, under nothing): static paper grain
 * plus a soft warm vignette. It never moves, so it cannot break the loop.
 */
export const Look: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.09}}>
      <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={7} />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.38  0 0 0 0 0.30  0 0 0 -1.6 1.25" /></filter>
      <rect width="100%" height="100%" filter="url(#paper)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 85% 75% at 50% 45%, transparent 60%, rgba(90,52,20,0.12) 100%)'}} />
  </AbsoluteFill>
);
export const Ground: React.FC<{y?: number; line?: boolean; color?: string}> = ({y = 0, line = true, color = C.ground}) =>
  <div style={{position: 'absolute', left: -40000, top: y, width: 80000, height: 40000, background: color, borderTop: line ? `8px solid ${INK}` : 'none'}} />;

/** pen stroke that draws itself (p 0..1): spread onto an SVG path. Hidden at 0 so round caps leave no dots. */
export const pen = (p: number) => ({pathLength: 1, strokeDasharray: `${p} 2`, visibility: (p > 0.002 ? 'visible' : 'hidden') as 'visible' | 'hidden'});
const waveD = (x0: number, x1: number, y: number, t: number, amp: number, len: number, phase: number) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 40) pts.push(`${x} ${(y + amp * Math.sin((x / len) * 2 * Math.PI + t * 1.7 + phase)).toFixed(1)}`);
  return 'M ' + pts.join(' L ');
};
/**
 * Sea / lake band: water surface at y = 0 (wavy ink line), filled down. op < 1 = see-through (put it in a Layer with
 * paper={false}). hole cuts a shape out (e.g. a hull, so the front water does not tint it): {d, tf: SVG transform, id}.
 * Used in videos/ship: back water opaque behind the boat, front water op 0.42 with the hull as the hole.
 */
export const Sea: React.FC<{t: number; x0: number; x1: number; fill: string; op: number; amp?: number; len?: number; phase?: number; line?: number; shine?: boolean;
  hole?: {d: string; tf: string; id: string}}> =
  ({t, x0, x1, fill, op, amp = 7, len = 420, phase = 0, line = 7, shine = true, hole}) => {
    const top = waveD(x0, x1, 0, t, amp, len, phase);
    return (
      <W>
        {hole ? <mask id={hole.id} maskUnits="userSpaceOnUse" x={-9000} y={-9000} width={18000} height={18000}>
          <rect x={-9000} y={-9000} width={18000} height={18000} fill="#fff" /><path d={hole.d} transform={hole.tf} fill="#000" />
        </mask> : null}
        <g mask={hole ? `url(#${hole.id})` : undefined}>
          <path d={`${top} L ${x1} 6000 L ${x0} 6000 Z`} fill={fill} fillOpacity={op} />
          {shine ? Array.from({length: 14}).map((_, i) => {
            const x = x0 + ((i * 397 + t * 22) % (x1 - x0)), y = 26 + (i % 3) * 22;
            return <path key={i} d={`M ${x} ${y} l ${46 + (i % 4) * 14} 0`} stroke="#fff" strokeOpacity={0.75} strokeWidth={6} strokeLinecap="round" />;
          }) : null}
          {line > 0 ? <path d={top} stroke={INK} strokeWidth={line} fill="none" strokeLinejoin="round" /> : null}
        </g>
      </W>
    );
  };

// ---------- 3D projectile (thrown things) ----------
/** y(tau) for a gravity arc from y0 to y1 over flight time T with the apex at time ta (late apex = low arc that stays in frame). */
export const arcY = (y0: number, y1: number, T: number, ta: number) => {
  const g = (2 * (y0 - y1)) / (ta * ta - (T - ta) * (T - ta)); const ya = y0 - 0.5 * g * ta * ta;
  return (tau: number) => ya + 0.5 * g * (tau - ta) * (tau - ta);
};

// ---------- signature style part 2: line boil ----------
/** How many times a second the drawing re-wobbles, how many different wobbles, and how far lines move (screen px). */
export const BOIL = {rate: 8, frames: 3, px: 5};
const BoilDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    {Array.from({length: BOIL.frames}, (_, i) => (
      <filter key={i} id={`boil${i}`} x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={2} seed={3 + i * 17} result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale={BOIL.px * 2} xChannelSelector="R" yChannelSelector="G" />
      </filter>))}
  </svg>
);
/**
 * SIGNATURE STYLE part 2 - line boil. Wraps a scene so its lines wobble like a hand-drawn, re-traced cartoon,
 * stepping BOIL.rate times a second (motion stays smooth at 60 fps; only the wobble steps). LoopOut applies it,
 * so every video gets it; wrap thumbnails in <Boil t={0}> too so they match.
 */
/** Notebook doodle: blue-ruled paper with a red margin; colours become streaky felt-tip marker that lets the rules show through. */
const NotebookOver: React.FC = () => (
  <AbsoluteFill style={{pointerEvents: 'none'}}>
    <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply', opacity: 0.55}}>
      <filter id="marker"><feTurbulence type="fractalNoise" baseFrequency="0.003 0.09" numOctaves={2} seed={5} />
        <feColorMatrix values="0 0 0 0 0.75  0 0 0 0 0.72  0 0 0 0 0.70  0 0 0 -1.4 1.1" /></filter>
      <rect width="100%" height="100%" filter="url(#marker)" />
    </svg>
    <AbsoluteFill style={{mixBlendMode: 'multiply', opacity: 0.7,
      backgroundImage: 'linear-gradient(90deg, transparent 118px, #F08A8A 118px, #F08A8A 122px, transparent 122px), repeating-linear-gradient(transparent 0 62px, #9CC3E8 62px 65px)'}} />
    {[0.22, 0.5, 0.78].map((f) => <div key={f} style={{position: 'absolute', left: 34, top: `calc(${f * 100}% - 24px)`, width: 48, height: 48, borderRadius: '50%',
      background: '#E9E4D8', boxShadow: 'inset 0 5px 7px rgba(60,45,25,0.35)'}} />)}
  </AbsoluteFill>
);
/**
 * SIGNATURE STYLE - notebook doodle. Wraps a scene: line boil (lines wobble like a re-traced hand drawing, stepping
 * BOIL.rate times a second while motion stays smooth), then lined notebook paper, red margin, hole punches and
 * felt-tip marker streaks over everything. Together with the cut-paper Layers it looks like stickers in a notebook. LoopOut applies it, so every video gets it; wrap
 * thumbnails in <Boil t={0}> too so they match.
 */
export const Boil: React.FC<{t: number; children: React.ReactNode}> = ({t, children}) => {
  const i = Math.floor(t * BOIL.rate + 1e-6) % BOIL.frames;
  const boiled = <AbsoluteFill style={{filter: `url(#boil${i})`, transform: 'scale(1.012)'}}>{children}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <BoilDefs />
      {boiled}
      <NotebookOver />
    </AbsoluteFill>
  );
};

// ---------- seamless loop ending ----------
/** Seconds the loop push takes. Make the composition about LOOP_DUR + 0.3 s longer than the voice. */
export const LOOP_DUR = 0.5;
/**
 * Every video ends with this. In the last `dur` seconds the final shot slides out sideways while the opening shot
 * (the same scene rendered at t = 0, passed as `start`) slides in, like a comic-panel push with an ink seam.
 * On the very last frame `start` is exactly in place, so the last frame equals frame 0 and a looping player
 * (Shorts, Reels, TikTok) jumps between two identical frames. Hard edges only, never a fade.
 * Wrap the picture only (not the SoundLayer) and add a whoosh cue at `total - dur`.
 */
export const LoopOut: React.FC<{t: number; total: number; start: React.ReactNode; children: React.ReactNode; dur?: number; dir?: 1 | -1}> =
  ({t, total, start: start0, children: children0, dur = LOOP_DUR, dir = 1}) => {
    const {width} = useVideoConfig();
    const tLast = (Math.round(total * FPS) - 1) / FPS; // time of the last rendered frame
    // every video boils: the scene wobbles like hand-drawn lines; the opening shot always uses boil frame 0
    const children = <Boil t={t}>{children0}</Boil>, start = <Boil t={0}>{start0}</Boil>;
    if (t < tLast - dur) return <>{children}</>;
    const u = eio(seg(t, tLast - dur, tLast));
    const startX = dir * width * (1 - u), endX = -dir * width * u;
    const seamX = dir === 1 ? startX : startX + width;
    return (
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <AbsoluteFill style={{transform: `translateX(${endX}px)`}}>{children}</AbsoluteFill>
        <AbsoluteFill style={{transform: `translateX(${startX}px)`}}>{start}</AbsoluteFill>
        {u < 1 ? <div style={{position: 'absolute', top: 0, bottom: 0, left: seamX - 8, width: 16, background: INK}} /> : null}
      </AbsoluteFill>
    );
  };

// ---------- sound ----------
/** keys: optional [video time s, dB] pairs (linear in dB) that override db over time; from/to: play only that part of the file (s). */
export type Cue = {f: string; at: number; db: number; keys?: [number, number][]; from?: number; to?: number};
const cueDb = (c: Cue, tt: number) => {
  const k = c.keys; if (!k || !k.length) return c.db;
  if (tt <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) if (tt <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], seg(tt, k[i][0], k[i + 1][0]));
  return k[k.length - 1][1];
};
/** Shared effects in public/library/sfx: gulp.wav (0.95 s cartoon gulp) squeak.wav (0.5 s wooden squeak) peck.wav (3 s woodpecker bursts)
 *  rewind.wav (2.7 s tape rewind) whisper_whoosh.wav (1.75 s airy travelling whoosh) crowd_laugh.wav (4 s crowd laughing)
 *  whoosh.wav pop.wav ding.mp3 twang.mp3 strain.mp3 whir.mp3 crickets.mp3 giggle.mp3 zap.wav chirp.wav hum.wav (20 s bed)
 *  splash.wav (0.75 s plop) bubbles.wav (0.6 s gurgle) horn.wav (1.75 s ship toot) waves.wav (3 s lapping: repeat every 2.7 s at -31 dB for a sea bed)
 *  tick.wav / tick2.wav (70 ms wheel clicker: alternate them, about -31 dB when fast up to -15 dB for the last click) confetti.wav (0.48 s party-popper burst)
 *  crack.wav (0.52 s stone crack: crackles, big snap at 0.32 s - start it 0.3 s before the beat) hiss.wav (2.6 s steam hiss, about -27 dB under a voice) */
export const SoundLayer: React.FC<{voice?: string; voiceAt?: number; cues: Cue[]}> = ({voice, voiceAt = 0.1, cues}) => (
  <>
    {voice ? <Sequence from={Math.round(voiceAt * FPS)} layout="none"><Audio src={staticFile(voice)} /></Sequence> : null}
    {cues.map((c, i) => <Sequence key={i} from={Math.round(c.at * FPS)} layout="none"
      durationInFrames={c.to !== undefined ? Math.max(1, Math.round((c.to - (c.from ?? 0)) * FPS)) : undefined}>
      <Audio src={staticFile(c.f.includes('/') ? c.f : `library/sfx/${c.f}`)} startFrom={c.from ? Math.round(c.from * FPS) : undefined}
        volume={c.keys ? (f: number) => 10 ** (cueDb(c, c.at + f / FPS) / 20) : 10 ** (c.db / 20)} /></Sequence>)}
  </>
);

// ---------- the cast: other characters in the guy's style (public/library/cast, measured in cast.json) ----------
/** king_calm / king_laugh / king_point / king_listen (faces left) / king_shock (waist-up close-up; no crown in the
 *  pictures, draw one on castHead) and adv_front / adv_whisper (faces left) / adv_laugh / adv_panic / adv_scrub (faces
 *  left, with a bucket): the king and the scheming advisor from videos/whisper. */
export type CastName = keyof typeof CAST;
type CastM = {w: number; h: number; head: number[]; feet: number[] | null};
/** A cast cut-out: head centre at x (so pose swaps never jump), bottom of the picture on the ground y. Waist-up
 *  pictures (feet null) put their head centre at (x, y). Same head size as the guy. */
export const Char: React.FC<{name: CastName; x: number; y: number; t: number; size?: number; sx?: number; sy?: number; flip?: boolean; rot?: number; breathe?: boolean}> =
  ({name, x, y, t, size = 1, sx = 1, sy = 1, flip = false, rot = 0, breathe = true}) => {
    const m = (CAST as any)[name] as CastM; const s = (HEAD_R * size) / m.head[2];
    const ax = m.head[0], ay = m.feet ? m.h - 14 : m.head[1];
    const b = breathe ? 1 + 0.009 * Math.sin(2 * Math.PI * 0.6 * t + x * 0.01) : 1;
    return <div style={{position: 'absolute', left: x - ax * s, top: y - ay * s, width: m.w * s, height: m.h * s, transformOrigin: `${ax * s}px ${ay * s}px`,
      transform: `rotate(${rot}deg) scale(${(flip ? -1 : 1) * sx}, ${sy * b})`}}>
      <Img src={staticFile(`library/cast/${name}.png`)} style={{position: 'absolute', left: 0, top: 0, width: m.w * s, height: m.h * s}} />
    </div>;
  };
/** where a cast cut-out's head centre is (for crowns, hats, sweat, speech) */
export const castHead = (name: CastName, x: number, y: number, size = 1) => {
  const m = (CAST as any)[name] as CastM; const s = (HEAD_R * size) / m.head[2];
  return {x, y: m.feet ? y - (m.h - 14 - m.head[1]) * s : y, r: HEAD_R * size};
};

// ---------- word-by-word captions (story Shorts with dialogue) ----------
/** words: [{w, s, e, line?}] in video seconds (scripts/assemble.py writes them to src/dialogue.json). */
export type CapWord = {w: string; s: number; e: number; line?: string};
type CapGroup = {ws: CapWord[]; s: number; e: number};
const capCache = new WeakMap<CapWord[], CapGroup[]>();
const capGroups = (words: CapWord[]) => {
  const hit0 = capCache.get(words); if (hit0) return hit0;
  const gs: CapGroup[] = []; let cur: CapWord[] = [];
  words.forEach((w, i) => {
    const prev = words[i - 1];
    if (cur.length && (cur.length >= 3 || /[.,?!]$/.test(prev.w) || prev.line !== w.line || w.s - prev.e > 0.35)) { gs.push({ws: cur, s: cur[0].s, e: cur[cur.length - 1].e}); cur = []; }
    cur.push(w);
  });
  if (cur.length) gs.push({ws: cur, s: cur[0].s, e: cur[cur.length - 1].e});
  capCache.set(words, gs); return gs;
};
/**
 * Captions like the big story channels: 1-3 words at a time, white Inter 900 with a thick black outline, the word being
 * spoken in yellow, each group pops in. Put it inside the scene function (it boils and slides with LoopOut). y = band
 * centre (default 1395 tall: above the Shorts title area); hide: [from, to] stretches with no captions (the HookTitle,
 * title cards); italicLines: line ids drawn in italics (whispers).
 */
export const Captions: React.FC<{t: number; words: CapWord[]; y?: number; size?: number; hide?: [number, number][]; italicLines?: string[]}> =
  ({t, words, y = 1395, size = 84, hide = [], italicLines = []}) => {
    if (hide.some(([a, b]) => t >= a && t < b)) return null;
    const gs = capGroups(words); let gi = -1;
    for (let i = 0; i < gs.length; i++) if (gs[i].s <= t) gi = i;
    if (gi < 0) return null;
    const g = gs[gi], next = gs[gi + 1];
    if (t > (next ? Math.min(next.s, g.e + 0.5) : g.e + 0.5)) return null;
    const pop = 1 + 0.14 * (1 - eout(seg(t, g.s, g.s + 0.13)));
    const it = g.ws[0].line !== undefined && italicLines.includes(g.ws[0].line);
    return <div style={{position: 'absolute', left: '50%', top: y, transform: `translate(-50%,-50%) scale(${pop})`, whiteSpace: 'nowrap', fontFamily: FONT,
      fontWeight: 900, fontSize: size, letterSpacing: -1, fontStyle: it ? 'italic' : 'normal', WebkitTextStroke: `${size * 0.19}px ${INK}`,
      paintOrder: 'stroke fill', textShadow: `0 ${size * 0.08}px 0 ${INK}`}}>
      {g.ws.map((w, i) => <span key={i} style={{color: w.s <= t && (i === g.ws.length - 1 || g.ws[i + 1].s > t) ? C.yellow : '#fff'}}>{(i ? ' ' : '') + w.w.toUpperCase()}</span>)}
    </div>;
  };
