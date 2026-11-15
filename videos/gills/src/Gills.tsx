// "What if you had a fish's gills?" - body + animal powers, built on the zebra recipe: the guy DOES things (gasps,
// gets buckets of water poured through him, swims until he puffs up), a smug fish co-star with moods, a comedy hit
// (pufferfish BOING + stars + laugh), inside inserts (AIR vs WATER oxygen panel, YOUR GILLS collapsing in air), a live
// counter (BUCKETS A MINUTE 5 -> 40), a sticker word every ~1.5 s, a funny ending (the fish hands him a snorkel) that
// loops into frame 0, and a comment question asking for the next animal power.
// Frame 0: the guy big and upright underwater, red gills flapping on his neck, gasping, bubbles, O2 meter flashing,
// the fish beside him breathing easy. Everything drawn in code over the library body poses.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, W, Guy, swap, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd, clamp,
  shake, hit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle, CommentAsk, Cam} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.1; times below are video time). Last word ends ~22.6 s; + 0.8 s for the loop push.
export const DURATION = 23.4;
export const T = {
  gills: 0.90, drown: 2.15, under: 2.85,                                   // "He got fish gills... and nearly drowned in the sea."
  water: 3.39, thirty: 4.05, less: 4.85, oxygen: 5.14, air: 5.79,          // "Water has thirty times less oxygen than air."
  just: 6.34, still: 6.92, pump: 7.96, five: 8.23, buckets: 8.59, neck: 9.94, every: 10.19, minute: 10.55, // "Just sitting still, he had to pump five buckets of water through his neck every minute."
  swim: 11.14, forty: 11.86,                                               // "Swimming, forty."
  fish: 12.48, cold: 13.14, barely: 14.23, any: 14.88,                     // "The fish is cold-blooded. It barely needs any."
  land: 15.48, collapse: 16.65, so: 17.46, suffocate: 17.98, too: 18.66,   // "On land, his gills collapsed... and he couldn't breathe there either."
  gave: 19.65, back: 20.26, fish2: 21.08, gave2: 21.52, snorkel: 21.95,    // "So he gave the gills back... and the fish gave him a snorkel."
  cta: 12.75,
};
const SURF = -900;                       // water surface (world y)
const GOLD = '#FFD43B', RED = '#E2453C', BLUE = '#3E8FD0', WATER = '#2F79B8';
const ORANGE = '#FF8A3D', ORANGE2 = '#E0611E';
const D2R = Math.PI / 180;

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
const keysAt = (k: [number, number][], t: number, ease = eio) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) if (t <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], ease(seg(t, k[i][0], k[i + 1][0])));
  return k[k.length - 1][1];
};
const headOf = (pose: Pose) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s, hy: (m.head[1] - m.feet[1]) * s};
};

const Defs: React.FC = () => (
  <W><defs>
    <linearGradient id="gSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7CC8EC" /><stop offset="0.5" stopColor="#3D93CC" /><stop offset="1" stopColor="#1F5E96" /></linearGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FD3F5" /><stop offset="1" stopColor="#E4F6FF" /></linearGradient>
    <linearGradient id="gSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F0D79A" /><stop offset="1" stopColor="#D9B46A" /></linearGradient>
    <linearGradient id="gRock" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#B9A58C" /><stop offset="1" stopColor="#7E6C58" /></linearGradient>
    <linearGradient id="gFish" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFB067" /><stop offset="0.6" stopColor={ORANGE} /><stop offset="1" stopColor={ORANGE2} /></linearGradient>
  </defs></W>
);

// ---------- the sea ----------
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-5000} y={-6000} width={11000} height={9000} fill="url(#gSea)" />
    {Array.from({length: 7}, (_, i) => {
      const x = -1600 + i * 600 + 60 * Math.sin(t * 0.7 + i), w = 120 + 60 * rnd(i);
      return <path key={i} d={`M ${x - w} -2600 L ${x + w} -2600 L ${x + w * 2.6 + 300} 600 L ${x - w * 0.4 + 300} 600 Z`} fill="#FFFFFF" opacity={0.08 + 0.04 * Math.sin(t * 1.3 + i * 2)} />;
    })}
    <path d="M -5000 300 Q -3000 120 -1500 220 Q 0 80 1500 210 Q 3000 100 6000 260 L 6000 3000 L -5000 3000 Z" fill="#2C6E9E" />
  </W>
);
const Weed: React.FC<{x: number; y: number; h: number; t: number; seed: number; color?: string}> = ({x, y, h, t, seed, color = '#4FA36A'}) => {
  const pts: string[] = [];
  for (let i = 0; i <= 8; i++) {
    const u = i / 8, sway = Math.sin(t * 1.6 + seed + u * 3) * 26 * u;
    pts.push(`${i ? 'L' : 'M'} ${(x + sway + 14 * Math.sin(u * 7 + seed)).toFixed(1)} ${(y - h * u).toFixed(1)}`);
  }
  const d = pts.join(' ');
  return <g><path d={d} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" /><path d={d} stroke={color} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
};
const FarReef: React.FC<{t: number}> = ({t}) => (
  <W>
    {Array.from({length: 12}, (_, i) => {
      const x = -1700 + i * 330 + rnd(i * 4) * 140;
      return <g key={i}>
        <ellipse cx={x} cy={40} rx={110 + 60 * rnd(i)} ry={70 + 30 * rnd(i * 2)} fill="#5E7F9A" stroke={INK} strokeWidth={7} />
        <Weed x={x + 40} y={20} h={220 + 140 * rnd(i * 5)} t={t} seed={i * 1.7} color="#3F8D7A" />
      </g>;
    })}
  </W>
);
const Floor: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-4000} y={0} width={9000} height={3000} fill="url(#gSand)" />
    <path d="M -4000 0 H 5000" stroke={INK} strokeWidth={8} />
    {Array.from({length: 40}, (_, i) => <ellipse key={i} cx={-1800 + rnd(i * 3) * 3800} cy={40 + rnd(i * 7) * 500} rx={10} ry={5} fill="#C9A35C" />)}
    {/* rock island that rises out of the water on the right */}
    <path d={`M 560 4 Q 600 -500 660 ${SURF + 10} Q 700 -960 820 -945 Q 960 -935 1020 -950 Q 1150 -930 1220 -700 Q 1300 -300 1380 4 Z`} fill="url(#gRock)" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d="M 700 -600 Q 760 -560 740 -480 M 1100 -420 Q 1160 -380 1140 -300" stroke="#6A5A48" strokeWidth={6} fill="none" strokeLinecap="round" />
    <Weed x={-260} y={10} h={300} t={t} seed={1} />
    <Weed x={-300} y={10} h={220} t={t} seed={2.3} color="#62B577" />
    <Weed x={300} y={10} h={260} t={t} seed={4} />
    <Weed x={540} y={10} h={340} t={t} seed={5.2} color="#62B577" />
    <ellipse cx={-200} cy={20} rx={70} ry={28} fill="#9C8A74" stroke={INK} strokeWidth={7} />
  </W>
);
/** sky + wavy surface: everything above SURF */
const Surface: React.FC<{t: number}> = ({t}) => {
  let d = `M -4000 ${SURF}`;
  for (let x = -4000; x <= 5000; x += 100) d += ` L ${x} ${SURF + 10 * Math.sin(x * 0.012 + t * 3)}`;
  return <W>
    <path d={`${d} L 5000 -6000 L -4000 -6000 Z`} fill="url(#gSky)" />
    <circle cx={1150} cy={-1350} r={90} fill="#FFE066" stroke={INK} strokeWidth={8} />
    <path d={d} stroke={INK} strokeWidth={8} fill="none" />
    <path d={d} transform="translate(0 16)" stroke="#FFFFFF" strokeWidth={6} fill="none" opacity={0.6} />
  </W>;
};
/** drifting specks */
const Specks: React.FC<{t: number}> = ({t}) => (
  <W>{Array.from({length: 26}, (_, i) => {
    const x = -900 + rnd(i * 11) * 2200 + 30 * Math.sin(t * 0.8 + i), y = 80 - ((rnd(i * 5) * 1000 + t * 30) % 1000);
    return <circle key={i} cx={x} cy={y} r={4 + 3 * rnd(i)} fill="#FFFFFF" opacity={0.45} />;
  })}</W>
);

// ---------- bubbles ----------
type Src = {x: number; y: number; born: number; vx?: number};
const Bubbles: React.FC<{t: number; srcs: Src[]}> = ({t, srcs}) => (
  <W>{srcs.map((b, i) => {
    const a = t - b.born; if (a < 0 || a > 2.2) return null;
    const r = 7 + 9 * rnd(i * 3.1 + b.born);
    const x = b.x + (b.vx ?? 0) * a + 12 * Math.sin(a * 6 + i), y = b.y - 150 * a - 40 * a * a;
    return <g key={i} opacity={1 - seg(a, 1.7, 2.2)}><circle cx={x} cy={y} r={r} fill="#E8F7FF" fillOpacity={0.55} stroke={INK} strokeWidth={4} />
      <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.25} fill="#fff" /></g>;
  })}</W>
);
/** a stream of bubble sources: every `every` s between a and b from (x, y) */
const stream = (a: number, b: number, every: number, at: (tt: number) => {x: number; y: number}, vx = 0): Src[] => {
  const out: Src[] = [];
  for (let tt = a; tt < b; tt += every) { const p = at(tt); out.push({x: p.x + (rnd(tt * 13) - 0.5) * 20, y: p.y, born: tt, vx}); }
  return out;
};

// ---------- the guy's gills (drawn in his local frame, head centre = 0,0) ----------
/** open: 0 closed .. 1 wide; limp: collapsed, stuck together */
const GillSet: React.FC<{open: number; limp?: number}> = ({open, limp = 0}) => (
  <g>{[-1, 1].map((side) => [0, 1, 2].map((i) => {
    const y = 20 + i * 23, x = side * (52 - i * 4), L = 24;
    const o = open * (1 - limp) * (0.75 + 0.25 * (2 - i) / 2);
    const bulge = 7 + 20 * o;
    return <g key={`${side}${i}`} transform={`translate(${x} ${y + limp * i * 3}) scale(${side} 1) rotate(${limp * 18})`}>
      <path d={`M 0 ${-L} Q ${bulge * 1.4} 0 0 ${L} Q ${bulge * 0.2} 0 0 ${-L} Z`} fill={limp > 0.5 ? '#C98C8C' : RED} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      {o > 0.3 ? <path d={`M 2 ${-L * 0.6} Q ${bulge * 0.9} 0 2 ${L * 0.6}`} stroke="#8E1F1A" strokeWidth={3} fill="none" /> : null}
    </g>;
  }))}</g>
);
const Snorkel: React.FC<{s: number}> = ({s}) => s > 0.01 ? (
  <g transform={`scale(${s})`}>
    <path d="M 58 10 L 58 -120 Q 58 -140 78 -140" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M 58 10 L 58 -120 Q 58 -140 78 -140" stroke={GOLD} strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d="M -68 -10 H 68" stroke={INK} strokeWidth={8} />
    <rect x={-56} y={-34} width={112} height={44} rx={18} fill="#9FDcff" fillOpacity={0.45} stroke={INK} strokeWidth={8} />
    <path d="M 58 10 Q 40 34 14 34" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>) : null;

// ---------- the fish ----------
type FishMood = 'calm' | 'smug' | 'laugh' | 'sleepy';
/** faces screen-left; flip faces right. (x, y) = body centre, s = size */
const Fish: React.FC<{x: number; y: number; t: number; s?: number; mood?: FishMood; flip?: boolean; rot?: number}> = ({x, y, t, s = 1, mood = 'calm', flip, rot = 0}) => {
  const tail = 14 * Math.sin(t * 9), gill = 0.5 + 0.5 * Math.sin(t * 3);
  const blink = (t % 3.3) > 3.2;
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${(flip ? -1 : 1) * s} ${s})`}>
      <g transform={`translate(62 0) rotate(${tail})`}><path d="M 0 0 L 52 -40 Q 40 0 52 40 Z" fill={ORANGE2} stroke={INK} strokeWidth={7} strokeLinejoin="round" /></g>
      <path d="M -20 -44 Q 10 -84 44 -42 Z" fill={ORANGE2} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse rx={78} ry={50} fill="url(#gFish)" stroke={INK} strokeWidth={8} />
      <path d="M 20 -46 Q 6 0 20 46" stroke="#FFFFFF" strokeWidth={14} fill="none" />
      <path d="M 20 -46 Q 6 0 20 46" stroke={INK} strokeWidth={4} fill="none" opacity={0.5} />
      {/* gill flap */}
      <path d={`M -6 -22 Q ${-18 - 8 * gill} 0 -6 22`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      <g transform="rotate(15 10 30)"><path d={`M 6 20 Q 26 ${36 + 6 * Math.sin(t * 6)} 34 22 Z`} fill={ORANGE2} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>
      {/* eye */}
      <g transform="translate(-40 -12)">
        <circle r={19} fill="#fff" stroke={INK} strokeWidth={5} />
        {mood === 'laugh' ? <path d="M -12 4 Q 0 -10 12 4" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
          : <><circle cx={-4} cy={2} r={9} fill={INK} /><circle cx={-7} cy={-2} r={3} fill="#fff" />
            {mood === 'smug' || mood === 'sleepy' || blink ? <path d={blink ? 'M -20 0 A 20 20 0 0 1 20 0 Z' : mood === 'sleepy' ? 'M -20 4 A 20 20 0 0 1 20 4 Z' : 'M -20 -3 A 20 20 0 0 1 20 -3 Z'} fill={ORANGE} stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}</>}
      </g>
      {mood === 'smug' ? <path d="M -68 16 Q -56 26 -44 14" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /> : null}
      {mood === 'calm' ? <ellipse cx={-70} cy={14} rx={6} ry={8} fill="#8A2B2B" stroke={INK} strokeWidth={4.5} /> : null}
      {mood === 'sleepy' ? <ellipse cx={-70} cy={14} rx={9} ry={12 + 4 * Math.sin(t * 3)} fill="#8A2B2B" stroke={INK} strokeWidth={4.5} /> : null}
      {mood === 'laugh' ? <path d="M -76 6 Q -62 34 -44 10 Z" fill="#8A2B2B" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
    </g></W>
  );
};

// ---------- props ----------
const Bucket: React.FC<{x: number; y: number; rot: number; s: number; full: number}> = ({x, y, rot, s, full}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -46 -50 Q 0 -110 46 -50" stroke={INK} strokeWidth={7} fill="none" />
    <path d="M -50 -50 L 50 -50 L 38 50 L -38 50 Z" fill="#B8C3CC" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M 20 -50 L 12 50" stroke="#8E9AA4" strokeWidth={10} />
    {full > 0.05 ? <ellipse cx={0} cy={-50} rx={46} ry={12} fill={BLUE} stroke={INK} strokeWidth={5} /> : <ellipse cx={0} cy={-50} rx={46} ry={12} fill="#6D7880" stroke={INK} strokeWidth={5} />}
  </g></W>) : null;
/** O2 meter: a capsule with a low, flashing level */
const Meter: React.FC<{x: number; y: number; s: number; level: number; t: number}> = ({x, y, s, level, t}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-24} y={-90} width={48} height={180} rx={24} fill="#fff" stroke={INK} strokeWidth={7} />
    <rect x={-15} y={81 - 162 * level} width={30} height={162 * level} rx={12} fill={Math.sin(t * 18) > 0 ? RED : '#FF8A80'} />
    <text x={0} y={-118} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff" stroke={INK} strokeWidth={8} style={{paintOrder: 'stroke'}}>O₂</text>
  </g></W>) : null;

// ---------- screen inserts ----------
const Panel: React.FC<{s: number; x?: number; y: number; label: string; children: React.ReactNode; rot?: number}> = ({s, x = 540, y, label, children, rot = 2}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`}}>
    <svg width={620} height={620} viewBox="-310 -310 620 620" style={{overflow: 'visible'}}>
      <clipPath id={`cp${label.length}`}><circle r={250} /></clipPath>
      <circle r={266} fill={INK} />
      <g clipPath={`url(#cp${label.length})`}>{children}</g>
      <circle r={250} fill="none" stroke="#FFFFFF" strokeWidth={12} />
    </svg>
    <div style={{position: 'absolute', left: '50%', top: 40, transform: 'translate(-50%,-50%) rotate(-3deg)', background: '#fff', border: `7px solid ${INK}`, borderRadius: 24,
      padding: '6px 22px', fontFamily: FONT, fontWeight: 900, fontSize: 46, boxShadow: `0 7px 0 ${INK}`, whiteSpace: 'nowrap'}}>{label}</div>
  </div>) : null;
const O2 = ({x, y, r = 20}: {x: number; y: number; r?: number}) => <g transform={`translate(${x} ${y})`}>
  <circle r={r} fill="#fff" stroke={INK} strokeWidth={4} /><text y={2} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={r * 0.9} fill={RED}>O₂</text></g>;
/** AIR (full of oxygen) vs WATER (almost none) */
const OxyPanel: React.FC<{t: number; s: number}> = ({t, s}) => {
  const dots = Array.from({length: 30}, (_, i) => ({x: -230 + rnd(i * 3) * 210, y: -190 + rnd(i * 7) * 400}));
  const lessS = popIn(t, T.thirty, 0.35);
  return <Panel s={s} y={1440} label="SAME BOTTLE">
    <rect x={-300} y={-300} width={300} height={600} fill="#E9F7FF" />
    <rect x={0} y={-300} width={300} height={600} fill={WATER} />
    <path d="M 0 -300 V 300" stroke={INK} strokeWidth={8} />
    {dots.map((d, i) => <O2 key={i} x={d.x + 6 * Math.sin(t * 2 + i)} y={d.y + 6 * Math.cos(t * 2.3 + i)} r={17} />)}
    <O2 x={140 + 10 * Math.sin(t * 2)} y={30 + 8 * Math.cos(t * 2)} r={17} />
    <text x={-150} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK} stroke="#fff" strokeWidth={10} style={{paintOrder: 'stroke'}}>AIR</text>
    <text x={150} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill="#fff" stroke={INK} strokeWidth={10} style={{paintOrder: 'stroke'}}>WATER</text>
    {lessS > 0.01 ? <g transform={`translate(150 -100) rotate(-8) scale(${lessS})`}>
      <text textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={82} fill={GOLD} stroke={INK} strokeWidth={14} style={{paintOrder: 'stroke'}}>30x</text>
      <text y={70} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={58} fill={GOLD} stroke={INK} strokeWidth={12} style={{paintOrder: 'stroke'}}>LESS</text>
    </g> : null}
  </Panel>;
};
/** YOUR GILLS: fanned out in water, collapsed and stuck together in air */
const GillPanel: React.FC<{t: number; s: number}> = ({t, s}) => {
  const c = eio(seg(t, T.collapse - 0.1, T.collapse + 0.5));
  return <Panel s={s} y={1500} label={c > 0.5 ? 'YOUR GILLS IN AIR' : 'YOUR GILLS IN WATER'} rot={-2}>
    <rect x={-300} y={-300} width={600} height={600} fill={c > 0.5 ? '#E9F7FF' : WATER} />
    <path d="M -230 170 Q 0 120 230 170" stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
    <path d="M -230 170 Q 0 120 230 170" stroke="#F2E6D8" strokeWidth={18} fill="none" strokeLinecap="round" />
    {Array.from({length: 9}, (_, i) => {
      const u = i / 8, bx = -200 + 400 * u, by = 160 - 40 * Math.sin(Math.PI * u);
      const fan = (u - 0.5) * 60 * (1 - c) + 4 * Math.sin(t * 4 + i) * (1 - c);
      const len = 230 - 50 * c;
      const tipX = lerp(bx + Math.sin(fan * D2R) * len, 0 + (u - 0.5) * 60, c), tipY = lerp(by - Math.cos(fan * D2R) * len, by - 40, c);
      const d = `M ${bx} ${by} Q ${lerp(bx, tipX, 0.5) + 20 * c * (u - 0.5)} ${lerp(by, tipY, 0.5) + 60 * c} ${tipX} ${tipY}`;
      return <g key={i}><path d={d} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" /><path d={d} stroke={c > 0.5 ? '#C98C8C' : RED} strokeWidth={22} fill="none" strokeLinecap="round" />
        {c < 0.5 ? Array.from({length: 5}, (_, k) => { const v = (k + 1) / 6; return <path key={k} d={`M ${lerp(bx, tipX, v) - 14} ${lerp(by, tipY, v)} h 28`} stroke="#8E1F1A" strokeWidth={4} />; }) : null}
      </g>;
    })}
    {c > 0.5 ? <g transform={`translate(0 -150) rotate(-6) scale(${popIn(t, T.collapse + 0.3, 0.3)})`}>
      <text textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={GOLD} stroke={INK} strokeWidth={12} style={{paintOrder: 'stroke'}}>STUCK</text></g> : null}
  </Panel>;
};
/** BUCKETS A MINUTE counter */
const pours = [8.35, 8.8, 9.25, 9.7, 10.15];
const bucketsAt = (t: number) => {
  if (t < T.swim) return pours.filter((p) => t >= p + 0.15).length;
  return Math.round(lerp(5, 40, eio(seg(t, T.swim + 0.1, T.forty + 0.05))));
};
const Counter: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const n = bucketsAt(t), bump = 1 + 0.12 * Math.exp(-14 * Math.max(0, t - [...pours, T.forty].filter((p) => p + 0.15 <= t).pop()! - 0.15 || 9));
  return <div style={{position: 'absolute', left: 540, top: 330, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s})`, background: '#fff', border: `9px solid ${INK}`,
    borderRadius: 36, boxShadow: `0 10px 0 ${INK}`, padding: '10px 34px 14px', fontFamily: FONT, fontWeight: 900, textAlign: 'center', whiteSpace: 'nowrap'}}>
    <div style={{fontSize: 40, letterSpacing: 0}}>BUCKETS A MINUTE</div>
    <div style={{fontSize: 130, lineHeight: 1, color: n >= 40 ? RED : INK, transform: `scale(${bump})`}}>{n}</div>
  </div>;
};

// ---------- the story over time ----------
type GuyState = {pose: Pose; x: number; y: number; rot: number; sx: number; sy: number; tremble: number; gill: number; limp: number; gillsOn: number; snork: number};
const gasp = (t: number, a: number, every = 0.5) => (Math.floor((t - a) / every) % 2 ? 'front_worried' : 'surprised') as Pose;
const guyAt = (t: number): GuyState => {
  const b: GuyState = {pose: 'front_worried', x: 0, y: 0, rot: 0, sx: 1, sy: 1, tremble: 0, gill: 0.5, limp: 0, gillsOn: 1, snork: 0};
  const flap = (f: number) => 0.5 + 0.5 * Math.sin(t * 2 * Math.PI * f);
  if (t < T.water) return {...b, pose: gasp(t, -0.25, 0.5), tremble: 1.2, gill: flap(4), y: -4 * Math.abs(Math.sin(t * 6))};
  if (t < T.just) return {...b, pose: 'front_worried', tremble: 0.6, gill: flap(2.5)};
  if (t < T.swim - 0.1) {
    const pouring = pours.some((p) => t > p && t < p + 0.38);
    return {...b, pose: pouring ? 'surprised' : 'front_calm', gill: pouring ? 1 : flap(1.5) * 0.5, sy: pouring ? 1.02 : 1};
  }
  if (t < T.fish) {
    const rot = keysAt([[T.swim - 0.1, 0], [T.swim + 0.15, 80]], t, eout) + (t > T.swim + 0.15 ? 7 * Math.sin(t * 30) * (t < T.forty ? 1 : 0.2) : 0);
    const x = keysAt([[T.swim - 0.1, 0], [T.swim + 0.15, -120], [T.forty, 300], [T.fish, 360]], t, (u) => u);
    const y = keysAt([[T.swim - 0.1, 0], [T.swim + 0.15, -250], [T.forty, -300], [T.fish, -290]], t);
    const puff = t > T.forty ? 0.38 * eout(seg(t, T.forty, T.forty + 0.12)) + spring(t, T.forty + 0.12, 0.12, 3, 5) : 0;
    return {...b, pose: t > T.forty ? 'surprised' : 'walk', x, y, rot, sx: 1 + puff, sy: 1 + puff * 0.7, gill: t > T.forty ? 0 : flap(7)};
  }
  if (t < T.land - 0.15) {
    const puff = 0.38 * (1 - eio(seg(t, 12.9, 13.7)));
    return {...b, pose: t < 13.7 ? 'surprised' : 'front_worried', x: 380, sx: 1 + puff, sy: 1 + puff * 0.7, gill: flap(1.5) * 0.6, tremble: 0.3};
  }
  if (t < T.gave - 0.5) {
    // flops out onto the rock, gasps; gills collapse
    const u = seg(t, T.land - 0.15, T.land + 0.3);
    const x = lerp(700, 840, u), y = t < T.land + 0.3 ? lerp(-860, -945, u) - 120 * Math.sin(Math.PI * u) : -945;
    const g = swap(t, T.land + 0.3, 'surprised', 'front_worried');
    const lim = eio(seg(t, T.collapse - 0.1, T.collapse + 0.5));
    return {...b, pose: t < T.collapse ? g.pose : gasp(t, T.collapse, 0.42), x, y, rot: t < T.land + 0.3 ? 20 * (1 - u) : 0, sx: g.sx, sy: g.sy,
      tremble: t > T.collapse ? 1.4 : 0.4, gill: flap(5), limp: lim};
  }
  // back underwater: gives the gills back, gets a snorkel
  let pose: Pose = 'front_calm';
  if (t > T.gave - 0.1 && t < T.fish2) pose = 'present';
  if (t > T.gave2 + 0.25) pose = 'laugh';
  const g = swap(t, T.gave2 + 0.25, 'front_calm', 'laugh');
  return {...b, pose, sx: t > T.gave2 ? g.sx : 1, sy: t > T.gave2 ? g.sy : 1, gill: 0.3 + 0.2 * Math.sin(t * 5), gillsOn: 1 - seg(t, T.back - 0.25, T.back),
    snork: popIn(t, T.gave2 + 0.25, 0.3)};
};
type FishState = {x: number; y: number; flip: boolean; mood: FishMood; s: number; rot: number};
const fishAt = (t: number): FishState => {
  const bob = 8 * Math.sin(t * 2.2);
  if (t < T.swim - 0.3) return {x: lerp(118, 140, seg(t, T.water, T.water + 0.5)), y: lerp(-285, -265, seg(t, T.water, T.water + 0.5)) + bob, flip: false, mood: t > T.thirty && t < T.just ? 'calm' : 'smug', s: 0.9, rot: 0};
  if (t < T.fish) return {x: keysAt([[T.swim - 0.3, 130], [12.3, 590]], t), y: -310 + bob, flip: t < 11.7, mood: t > T.forty + 0.1 ? 'laugh' : 'smug', s: 0.9, rot: 0};
  if (t < T.land - 0.15) return {x: 590, y: -300 + bob, flip: false, mood: t > T.barely ? 'sleepy' : 'smug', s: 1.05, rot: 0};
  if (t < T.gave - 0.5) return {x: 640, y: SURF + 30 + bob * 0.6, flip: true, mood: t > T.collapse ? 'laugh' : 'smug', s: 0.85, rot: -10};
  return {x: 140, y: -262 + bob, flip: false, mood: t > T.snorkel ? 'laugh' : 'smug', s: 0.9, rot: 0};
};

const camKeys = (t: number): {x: number; y: number; k: number} => {
  if (t < T.water) return {x: lerp(15, 25, eio(seg(t, 0, T.water))), y: lerp(-200, -205, eio(seg(t, 0, T.water))), k: lerp(3.35, 3.5, eio(seg(t, 0, T.water)))};
  if (t < T.just) { const u = eio(seg(t, T.water - 0.05, T.water + 0.4)); return {x: lerp(25, 0, u), y: lerp(-205, -330, u), k: lerp(3.5, 2.3, u)}; }
  if (t < T.swim - 0.1) { const u = eio(seg(t, T.just - 0.05, T.just + 0.4)); return {x: 10, y: lerp(-330, -340, u), k: lerp(2.3, 2.05, u) + 0.12 * seg(t, T.just + 0.4, T.swim)}; }
  if (t < T.fish) {
    const g = guyAt(t), hx = g.x + Math.sin(g.rot * D2R) * 235, hy = g.y - Math.cos(g.rot * D2R) * 235;
    const u = eio(seg(t, T.swim - 0.1, T.swim + 0.3));
    return {x: lerp(10, hx + 60, u), y: lerp(-340, hy - 30, u), k: lerp(2.17, 2.15, u)};
  }
  if (t < T.land - 0.15) return {x: lerp(500, 490, seg(t, T.fish, T.land)), y: -290, k: lerp(2.35, 2.55, eio(seg(t, T.fish, T.land)))};
  if (t < T.gave - 0.5) return {x: 820, y: -1080, k: lerp(2.25, 2.45, eio(seg(t, T.land, T.gave - 0.5)))};
  return {x: lerp(40, 20, eio(seg(t, T.gave - 0.5, 22.6))), y: lerp(-230, -205, eio(seg(t, T.gave - 0.5, 22.6))), k: lerp(2.55, 2.8, eio(seg(t, T.gave - 0.5, 22.6)))};
};

export const GillsScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const ck = camK ?? camKeys(t);
  const sh = shake(t, hit(t, T.forty, 8, 6) + hit(t, T.land + 0.3, 7, 7) + hit(t, T.collapse, 5, 6) + (t < T.water ? 0.8 : 0));
  const cam: Cam = {x: ck.x + sh.x, y: ck.y + sh.y, z: 1000 - 1000 / ck.k};
  const g = guyAt(t);
  const h = headOf(g.pose);
  const trem = g.tremble * 1.5 * Math.sin(t * 2 * Math.PI * 17);
  const local = `translate(${g.x + trem} ${g.y}) rotate(${g.rot}) scale(${g.sx} ${g.sy}) translate(${h.hx} ${h.hy})`;
  // world position of a point in the head frame
  const wp = (lx: number, ly: number) => {
    const px = (h.hx + lx) * g.sx, py = (h.hy + ly) * g.sy, c = Math.cos(g.rot * D2R), s = Math.sin(g.rot * D2R);
    return {x: g.x + px * c - py * s, y: g.y + px * s + py * c};
  };
  const f = fishAt(t);
  const underwater = t < T.land - 0.15 || t > T.gave - 0.5;
  // bubbles
  const bub: Src[] = [];
  if (underwater) {
    bub.push(...stream(-0.4, T.water, 0.22, () => wp(-20, 34), -150), ...stream(-0.29, T.water, 0.22, () => wp(20, 34), 150));
    bub.push(...stream(-0.3, T.water, 0.2, () => wp(-62, 50), -110), ...stream(-0.2, T.water, 0.2, () => wp(62, 50), 110));
    bub.push(...stream(T.water, T.just, 0.35, () => wp(0, 30)));
    bub.push(...stream(T.swim, T.forty, 0.07, () => wp(-30, 40)));
    bub.push(...stream(T.fish, T.land, 0.9, () => ({x: f.x - 70, y: f.y + 10})));
    bub.push(...stream(T.gave - 0.5, DURATION, 0.5, () => ({x: f.x - 70, y: f.y + 10})));
    bub.push(...stream(T.snorkel - 0.2, DURATION, 0.3, () => wp(70, -150)));
  }
  // buckets pouring into his mouth, jets out of the gills
  const buckets = pours.map((p, i) => {
    const a = t - p; if (a < -0.35 || a > 0.75) return null;
    const m = wp(0, 0);
    const drop = eout(seg(a, -0.35, 0));
    const x = m.x + 70 + 30 * (i % 2 ? -1 : 1), y = m.y - 230 + (1 - drop) * -260 - seg(a, 0.45, 0.75) * 300;
    const rot = a < 0 ? 0 : -125 * eout(seg(a, 0, 0.18));
    const pour = a > 0.08 && a < 0.42;
    return <React.Fragment key={i}>
      {pour ? <W><path d={`M ${x - 40} ${y - 30} Q ${x - 50} ${y + 60} ${m.x + 6} ${m.y + 28}`} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
        <path d={`M ${x - 40} ${y - 30} Q ${x - 50} ${y + 60} ${m.x + 6} ${m.y + 28}`} stroke={BLUE} strokeWidth={22} fill="none" strokeLinecap="round" /></W> : null}
      <Bucket x={x} y={y} rot={rot} s={0.8} full={a < 0.15 ? 1 : 0} />
    </React.Fragment>;
  });
  const jets = pours.map((p, i) => {
    const a = t - p; if (a < 0.12 || a > 0.5) return null;
    const L = 120 * Math.sin(Math.PI * seg(a, 0.12, 0.5));
    return <W key={i}>{[-1, 1].map((sd) => { const o = wp(sd * 52, 44); return <g key={sd}>
      <path d={`M ${o.x} ${o.y} q ${sd * L * 0.6} -10 ${sd * L} 30`} stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d={`M ${o.x} ${o.y} q ${sd * L * 0.6} -10 ${sd * L} 30`} stroke={BLUE} strokeWidth={14} fill="none" strokeLinecap="round" /></g>; })}</W>;
  });
  // gills peeled off and handed back to the fish
  const handBack = t > T.back - 0.25 && t < T.fish2 ? [0, 1, 2].map((i) => {
    const u = eio(seg(t, T.back - 0.25 + i * 0.08, T.back + 0.45 + i * 0.08)), o = wp(50, 30 + i * 17);
    const x = lerp(o.x, f.x - 10, u), y = lerp(o.y, f.y - 5, u) - 70 * Math.sin(Math.PI * u);
    return u < 1 ? <W key={i}><g transform={`translate(${x} ${y}) rotate(${u * 360})`}><path d="M 0 -17 Q 24 0 0 17 Q 4 0 0 -17 Z" fill={RED} stroke={INK} strokeWidth={4.5} /></g></W> : null;
  }) : null;
  // the snorkel flies from the fish to his face
  const snU = eio(seg(t, T.gave2 - 0.3, T.gave2 + 0.25));
  const sp = wp(0, -10);
  const flyingSnorkel = t > T.fish2 && t < T.gave2 + 0.25
    ? <W><g transform={`translate(${lerp(f.x - 60, sp.x, snU)} ${lerp(f.y - 40, sp.y, snU) - 60 * Math.sin(Math.PI * snU)}) rotate(${-30 * (1 - snU)}) scale(0.9)`}><Snorkel s={1} /></g></W> : null;
  // stickers
  const S = (a: number, d: number) => pulse(t, a, d);
  const sx = ck.x, top = ck.y - 520 / ck.k * 1.0;
  const meterLevel = t < T.water ? 0.16 + 0.04 * Math.sin(t * 3) : lerp(0.3, 0.05, seg(t, T.land, T.suffocate));
  const meterS = t < T.water + 0.2 ? 1 - seg(t, T.water, T.water + 0.2) : t > T.land + 0.2 && t < T.gave - 0.55 ? popIn(t, T.land + 0.2, 0.3) : 0;
  const oxyS = popIn(t, T.water + 0.05, 0.35) * (1 - seg(t, T.just - 0.15, T.just + 0.05));
  const cntS = popIn(t, T.five - 0.1, 0.35) * (1 - seg(t, T.fish - 0.2, T.fish));
  const gillS = popIn(t, T.land + 0.55, 0.35) * (1 - seg(t, T.gave - 0.75, T.gave - 0.55));
  const headW = wp(0, 0);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#3D93CC'}}>
      <Defs />
      <Layer cam={cam} z={2600} paper={false}><Backdrop t={t} /></Layer>
      <Layer cam={cam} z={1700}><FarReef t={t} /></Layer>
      <Layer cam={cam} z={1000} paper={false}><Surface t={t} /></Layer>
      <Layer cam={cam} z={1000}>
        <Floor t={t} />
        <Meter x={g.x - (t < T.water + 0.3 ? 128 : 175)} y={g.y - 250} s={meterS} level={meterLevel} t={t} />
        <Fish x={f.x} y={f.y} t={t} s={f.s} mood={f.mood} flip={f.flip} rot={f.rot} />
        <Guy pose={g.pose} x={g.x + trem} y={g.y} t={t} sx={g.sx} sy={g.sy} rot={g.rot} breathe={false} />
        <W><g transform={local}>
          {g.gillsOn > 0.01 ? <g opacity={g.gillsOn}><GillSet open={g.gill} limp={g.limp} /></g> : null}
          <Snorkel s={g.snork} />
        </g></W>
        {buckets}{jets}{handBack}{flyingSnorkel}
      </Layer>
      <Layer cam={cam} z={1000} paper={false}>{thumb ? null : <Bubbles t={t} srcs={bub} />}<Specks t={t} /></Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 5 + (i * 2 * Math.PI) / 3, on = t > T.forty + 0.1 && t < 13.0 ? 1 : 0;
          return <Star key={i} x={headW.x + Math.cos(a) * 95} y={headW.y - 90 + Math.sin(a) * 18} s={on * 0.6} rot={t * 200} />;
        })}
        <Txt x={sx - 30} y={top + 20} s={thumb ? 0 : S(T.drown, 0.9)} text="NO AIR" size={70} rot={-5} fill={RED} />
        <Txt x={sx} y={top} s={S(T.just + 0.05, 1.2)} text="SITTING STILL" size={56} rot={-4} />
        <Txt x={sx} y={top + 40} s={S(T.neck, 0.9)} text="THROUGH HIS NECK" size={44} rot={4} fill={GOLD} />
        <Txt x={sx} y={ck.y + 230} s={S(T.swim, 1.0)} text="SWIM" size={90} rot={-6} fill={GOLD} />
        <Txt x={headW.x} y={headW.y - 170} s={S(T.forty + 0.05, 0.6)} text="BOING" size={84} rot={8} fill={GOLD} />
        <Txt x={sx} y={f.y + 150} s={S(T.cold, 1.0)} text="COLD-BLOODED" size={56} rot={-4} fill="#9FDcff" />
        <Txt x={sx} y={f.y + 150} s={S(T.barely, 0.75)} text="BARELY ANY" size={60} rot={4} fill={GOLD} />
        <Txt x={sx} y={-1300} s={S(T.land, 0.9)} text="ON LAND" size={80} rot={-5} fill={GOLD} />
        <Txt x={sx} y={-1300} s={S(T.suffocate, 0.75)} text="CAN'T BREATHE" size={50} rot={4} fill={RED} />
        <Txt x={sx} y={top + 60} s={S(T.back, 0.75)} text="NO THANKS" size={64} rot={-5} fill={GOLD} />
        <Txt x={sx} y={ck.y + 260} s={S(T.snorkel, 0.65)} text="SNORKEL" size={80} rot={-5} fill={GOLD} />
      </Layer>
      <OxyPanel t={t} s={oxyS} />
      <Counter t={t} s={cntS} />
      <GillPanel t={t} s={gillS} />
      {thumb ? null : <>
        <HookTitle t={t} text="HE HAS GILLS. STILL DROWNING" hi="DROWNING" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.gave - 0.4} until={DURATION - LOOP_DUR - 0.4} text="Which animal power next?" />
      </>}
    </AbsoluteFill>
  );
};

export const GillsVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    {f: 'splash.wav', at: 0, db: -14}, {f: 'whoosh.wav', at: 0, db: -18}, {f: 'bubbles.wav', at: 0.05, db: -18},
    ...[0.6, 1.2, 1.8, 2.4].map((a) => ({f: 'bubbles.wav', at: a, db: -26} as Cue)),
    {f: 'pop.wav', at: T.drown, db: -22},
    {f: 'whoosh.wav', at: T.water - 0.05, db: -26}, {f: 'pop.wav', at: T.water + 0.05, db: -22}, {f: 'ding.mp3', at: T.thirty, db: -22},
    {f: 'whoosh.wav', at: T.just - 0.1, db: -28}, {f: 'pop.wav', at: T.just + 0.05, db: -24}, {f: 'pop.wav', at: T.five - 0.1, db: -24},
    ...pours.flatMap((p) => [{f: 'whoosh.wav', at: p - 0.3, db: -30}, {f: 'splash.wav', at: p + 0.08, db: -22}, {f: 'gulp.wav', at: p + 0.12, db: -26, to: 0.4}, {f: 'tick.wav', at: p + 0.15, db: -16}] as Cue[]),
    {f: 'whoosh.wav', at: T.swim - 0.05, db: -18}, {f: 'bubbles.wav', at: T.swim, db: -22}, {f: 'bubbles.wav', at: T.swim + 0.55, db: -24},
    ...Array.from({length: 16}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.swim + 0.15, T.forty, (i + 1) / 16), db: -28} as Cue)),
    {f: 'twang.mp3', at: T.forty + 0.02, db: -14}, {f: 'chirp.wav', at: T.forty + 0.2, db: -28}, {f: 'crowd_laugh.wav', at: T.forty + 0.15, db: -32, to: 1.3},
    {f: 'whoosh.wav', at: T.fish - 0.1, db: -28}, {f: 'pop.wav', at: T.cold, db: -24}, {f: 'bubbles.wav', at: 13.6, db: -30}, {f: 'pop.wav', at: T.barely, db: -24},
    ...ctaCues(T.cta),
    {f: 'splash.wav', at: T.land - 0.15, db: -16}, {f: 'squeak.wav', at: T.land + 0.3, db: -24}, {f: 'waves.wav', at: T.land, db: -30}, {f: 'waves.wav', at: T.land + 2.7, db: -31},
    {f: 'zap.wav', at: T.collapse, db: -24}, {f: 'strain.mp3', at: T.collapse + 0.2, db: -28, to: 0.8}, {f: 'pop.wav', at: T.suffocate, db: -22},
    {f: 'giggle.mp3', at: T.collapse + 0.4, db: -30, to: 1.2},
    {f: 'splash.wav', at: T.gave - 0.5, db: -18}, {f: 'bubbles.wav', at: T.gave - 0.4, db: -24},
    {f: 'whoosh.wav', at: T.back - 0.25, db: -26}, {f: 'pop.wav', at: T.back, db: -22},
    {f: 'whoosh.wav', at: T.gave2 - 0.3, db: -24}, {f: 'pop.wav', at: T.gave2 + 0.25, db: -18}, {f: 'ding.mp3', at: T.snorkel, db: -24},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -22},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<GillsScene t={0} />}>
        <GillsScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="gills/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
