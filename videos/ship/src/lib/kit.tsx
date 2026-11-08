// Cut-out cartoon kit: everything reusable from the elevator Short.
// Character poses come from public/library/char (Higgsfield, measured in library.json);
// everything else (props, faces, effects, badges) is drawn in code in the same flat style.
import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useVideoConfig} from 'remotion';
import LIB from './library.json';

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

// ---------- the guy (13 poses in the library) ----------
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
/** Shared effects in public/library/sfx: whoosh.wav pop.wav ding.mp3 twang.mp3 strain.mp3 whir.mp3 crickets.mp3 giggle.mp3 zap.wav chirp.wav hum.wav (20 s bed) */
export const SoundLayer: React.FC<{voice?: string; voiceAt?: number; cues: Cue[]}> = ({voice, voiceAt = 0.1, cues}) => (
  <>
    {voice ? <Sequence from={Math.round(voiceAt * FPS)} layout="none"><Audio src={staticFile(voice)} /></Sequence> : null}
    {cues.map((c, i) => <Sequence key={i} from={Math.round(c.at * FPS)} layout="none"
      durationInFrames={c.to !== undefined ? Math.max(1, Math.round((c.to - (c.from ?? 0)) * FPS)) : undefined}>
      <Audio src={staticFile(c.f.includes('/') ? c.f : `library/sfx/${c.f}`)} startFrom={c.from ? Math.round(c.from * FPS) : undefined}
        volume={c.keys ? (f: number) => 10 ** (cueDb(c, c.at + f / FPS) / 20) : 10 ** (c.db / 20)} /></Sequence>)}
  </>
);
