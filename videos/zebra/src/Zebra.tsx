// "He painted his cow like a zebra... and the flies stopped biting." - a story Short in daylight, built on the new hook
// rules: frame 0 is the impossible picture already happening (a half-striped cow, brush mid-stroke), a claim instead of
// a question, danger by ~5 s (flies spread disease), and a hard number (flies land on zebras under a quarter as often as
// on horses). Biting flies zoom at stripes without slowing down and bounce off. Ends with the whole herd queuing for a
// paint job, which loops back to the brush. Everything drawn in code, lit by a low sun from the upper left.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Guy, swap, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle} from './lib/kit';

// voice: tight.mp3 at 0.1 s (pauses shortened, 1.06x). Last word ends 25.86 s; + 0.8 s for the loop push.
export const DURATION = 26.7;
export const T = {
  zebra: 1.58, flies: 2.75, stopped: 3.16, biting: 3.43,          // "He painted his cow like a zebra... and the flies stopped biting."
  bite: 4.05, itch: 5.49, disease: 6.75,                           // "Biting flies don't just itch. They can spread disease."
  stripes: 7.62, eyes: 9.13,                                       // "But stripes mess with their eyes."
  zoom: 10.07, slow: 11.13, bounce: 12.18, off: 12.79,             // "They zoom in, don't slow down, and bounce right off."
  real: 13.26, land: 14.88, quarter: 15.71, horses: 16.84,         // "On real zebras, flies land less than a quarter as often as on horses."
  sci: 17.64, cows: 18.99, way: 19.94, fewer: 20.54,               // "Scientists even tried it on cows. Way fewer flies."
  so: 21.33, why: 22.24, stripes2: 22.84,                          // "So that's why zebras have stripes."
  now: 23.58, every: 23.88, farm: 24.71, paint: 25.32, job: 25.54, // "Now every cow on the farm wants a paint job."
  cta: 17.45,
};

// ---------- palette (sunny afternoon, light from the upper left) ----------
const SKY0 = '#8FD0F5', SKY1 = '#DDF2FB', GRASS = '#8CC66A', GRASS2 = '#6FAE52', HILL = '#A9D88A', HILL2 = '#7DBE68';
const BROWN = '#B5764A', BROWN2 = '#8E5634', PINK = '#F2A7A0', GOLD = '#FFD43B', RED = '#E2574C';
const CA = 0, CB = 760, ZX = 1650, HX2 = 2350;     // cow A, cow B, zebra, horse (feet centre x)

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.25));

const Defs: React.FC = () => (
  <W><defs>
    <linearGradient id="zSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={SKY0} /><stop offset="1" stopColor={SKY1} /></linearGradient>
    <linearGradient id="zGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={GRASS} /><stop offset="1" stopColor={GRASS2} /></linearGradient>
    <linearGradient id="zBrown" x1="0" y1="0" x2="0.7" y2="1"><stop offset="0" stopColor="#CC8A5C" /><stop offset="0.6" stopColor={BROWN} /><stop offset="1" stopColor={BROWN2} /></linearGradient>
    <linearGradient id="zWhite" x1="0" y1="0" x2="0.7" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.6" stopColor="#F1EEE8" /><stop offset="1" stopColor="#C9C4BC" /></linearGradient>
    <linearGradient id="zHorse" x1="0" y1="0" x2="0.7" y2="1"><stop offset="0" stopColor="#A86A43" /><stop offset="0.6" stopColor="#8A5232" /><stop offset="1" stopColor="#663A22" /></linearGradient>
    <linearGradient id="zShade" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0.45" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#2A1606" stopOpacity={0.32} /></linearGradient>
    <radialGradient id="zSun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF6C8" stopOpacity={0.9} /><stop offset="0.4" stopColor="#FFE58A" stopOpacity={0.35} /><stop offset="1" stopColor="#FFE58A" stopOpacity={0} /></radialGradient>
    <linearGradient id="zBarn" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#D9564A" /><stop offset="1" stopColor="#A63A31" /></linearGradient>
  </defs></W>
);

// ---------- the farm ----------
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-4000} y={-4000} width={10000} height={4000} fill="url(#zSky)" />
    {[[-600, -1500, 1], [900, -1650, 0.8], [2300, -1450, 1.1], [3300, -1600, 0.9]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x + 20 * Math.sin(t * 0.2 + i)} ${y}) scale(${s})`}>
        <path d="M -170 40 Q -180 -20 -110 -20 Q -90 -90 -10 -70 Q 40 -120 100 -60 Q 180 -60 170 40 Z" fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -140 30 Q 0 50 150 30" stroke="#CFE6F2" strokeWidth={14} fill="none" strokeLinecap="round" />
      </g>))}
  </W>
);
const SunDisc: React.FC<{t: number}> = ({t}) => (
  <W><g transform="translate(-700 -1900)">
    <circle r={420} fill="url(#zSun)" />
    <g transform={`rotate(${t * 8})`}>{Array.from({length: 12}, (_, i) => <path key={i} transform={`rotate(${i * 30})`} d="M -14 -150 L 0 -196 L 14 -150 Z" fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}</g>
    <circle r={120} fill={GOLD} stroke={INK} strokeWidth={8} />
  </g></W>
);
const Hills: React.FC = () => (
  <W>
    <path d="M -3000 60 Q -2200 -480 -1300 -200 Q -700 -520 100 -260 Q 900 -560 1700 -240 Q 2500 -520 3300 -220 Q 4100 -480 5000 60 Z" fill={HILL} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -3000 60 Q -1800 -260 -600 -120 Q 600 -300 1900 -110 Q 3200 -300 5000 60 Z" fill={HILL2} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {/* the barn */}
    <g transform="translate(-1150 -150)">
      <rect x={-200} y={-300} width={400} height={300} fill="url(#zBarn)" stroke={INK} strokeWidth={8} />
      <path d="M -240 -290 L 0 -470 L 240 -290 Z" fill="#7E2F28" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={-80} y={-170} width={160} height={170} fill="#F2E6D0" stroke={INK} strokeWidth={7} />
      <path d="M -80 -170 L 80 0 M 80 -170 L -80 0" stroke={INK} strokeWidth={6} />
    </g>
  </W>
);
const Ground: React.FC = () => (
  <W>
    <rect x={-4000} y={0} width={10000} height={3000} fill="url(#zGrass)" />
    <path d="M -4000 0 H 6000" stroke={INK} strokeWidth={8} />
    {Array.from({length: 90}, (_, i) => {
      const x = -2600 + rnd(i * 3) * 6000, y = 40 + rnd(i * 7) * 900;
      return <path key={i} d={`M ${x - 14} ${y} l 8 -26 l 6 22 l 8 -30 l 6 34`} stroke={GRASS2} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
    {/* fence */}
    {Array.from({length: 40}, (_, i) => <rect key={i} x={-2600 + i * 180} y={-170} width={22} height={176} rx={4} fill="#E9D3A8" stroke={INK} strokeWidth={6} />)}
    <rect x={-2650} y={-150} width={8000} height={20} fill="#E9D3A8" stroke={INK} strokeWidth={6} />
    <rect x={-2650} y={-90} width={8000} height={20} fill="#E9D3A8" stroke={INK} strokeWidth={6} />
  </W>
);
/** soft cast shadow on the grass (sun upper left -> shadows lean right) */
const CastShadow: React.FC<{x: number; w: number}> = ({x, w}) => (
  <W><ellipse cx={x + w * 0.18} cy={6} rx={w * 0.62} ry={26} fill="#2E5A1E" opacity={0.32} /></W>
);

// ---------- animals (side view, facing right; feet centre at (x, 0)) ----------
type Kind = 'cow' | 'horse' | 'zebra';
type Mood = 'calm' | 'happy' | 'annoyed' | 'smug' | 'hopeful';
const BODY = 'M -200 -330 Q -215 -360 -170 -365 L 150 -360 Q 210 -355 215 -300 L 215 -200 Q 210 -150 160 -150 L -170 -150 Q -210 -150 -210 -200 Z';
const LEGS = [-160, -100, 120, 175];
const STRIPE_X = [-160, -105, -50, 5, 60, 115, 170];
const Quad: React.FC<{x: number; kind: Kind; t: number; flip?: boolean; painted?: number; mood?: Mood; walk?: number; id: string; twitch?: number}> =
  ({x, kind, t, flip, painted = 0, mood = 'calm', walk = 0, id, twitch = 0}) => {
    const fill = kind === 'cow' ? 'url(#zBrown)' : kind === 'horse' ? 'url(#zHorse)' : 'url(#zWhite)';
    const horse = kind !== 'cow';
    const head = horse
      ? 'M 150 -340 L 205 -470 Q 220 -500 255 -490 L 330 -400 Q 345 -370 315 -360 L 275 -355 Q 250 -330 215 -300 Z'
      : 'M 170 -350 Q 200 -420 270 -410 Q 330 -400 335 -340 Q 340 -280 300 -265 Q 250 -255 220 -290 Z';
    const legSwing = (i: number) => walk ? 18 * Math.sin(t * 2 * Math.PI * 2.2 + (i % 2 ? Math.PI : 0)) * walk : 0;
    const legs = LEGS.map((lx, i) => `M ${lx - 20} -170 L ${lx - 20 + legSwing(i)} -18 Q ${lx + legSwing(i)} -2 ${lx + 22 + legSwing(i)} -18 L ${lx + 20} -170 Z`).join(' ');
    const full = `${BODY} ${head} ${legs}`;
    const stripes = kind === 'zebra' ? 9 : painted;
    const bob = walk ? -6 * Math.abs(Math.sin(t * Math.PI * 2.2)) : 0;
    const tailA = 12 * Math.sin(t * 2.6 + x) + twitch * 30 * Math.sin(t * 30);
    // face
    const eyeX = horse ? 262 : 270, eyeY = horse ? -428 : -365;
    const eyes = mood === 'happy' || mood === 'smug'
      ? <path d={`M ${eyeX - 13} ${eyeY + 4} Q ${eyeX} ${eyeY - 12} ${eyeX + 13} ${eyeY + 4}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
      : <g><ellipse cx={eyeX} cy={eyeY} rx={10} ry={mood === 'annoyed' ? 8 : mood === 'hopeful' ? 15 : 13} fill={INK} />
        <circle cx={eyeX + 3} cy={eyeY - 5} r={4} fill="#fff" />
        {mood === 'annoyed' ? <path d={`M ${eyeX - 18} ${eyeY - 22} L ${eyeX + 14} ${eyeY - 12}`} stroke={INK} strokeWidth={7} strokeLinecap="round" /> : null}
        {mood === 'hopeful' ? <circle cx={eyeX - 3} cy={eyeY + 4} r={2.5} fill="#fff" /> : null}</g>;
    return (
      <W><g transform={`translate(${x} ${bob}) scale(${flip ? -1 : 1} 1)`}>
        <clipPath id={`zc${id}`}><path d={full} /></clipPath>
        {/* tail */}
        <g transform={`rotate(${tailA} -205 -320)`}>
          <path d="M -205 -320 Q -250 -260 -240 -200" stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M -205 -320 Q -250 -260 -240 -200" stroke={kind === 'horse' ? '#4A2A18' : kind === 'zebra' ? '#2A2A2A' : BROWN2} strokeWidth={6} fill="none" strokeLinecap="round" />
          <ellipse cx={-240} cy={-190} rx={16} ry={26} fill={kind === 'cow' ? '#5A3420' : '#2A2A2A'} stroke={INK} strokeWidth={6} />
        </g>
        <path d={full} fill={fill} />
        <g clipPath={`url(#zc${id})`}>
          {/* stripes (painted one by one on the cow; the zebra has them all) */}
          {STRIPE_X.concat(kind === 'zebra' ? [230, 285] : []).map((sx, i) => {
            const p = Math.max(0, Math.min(1, stripes - i)); if (p <= 0) return null;
            const top = -520, len = 560 * p;
            return <path key={i} d={`M ${sx - 18} ${top} Q ${sx + 12} ${top + 140} ${sx - 10} ${top + 280} Q ${sx - 30} ${top + 420} ${sx - 6} ${top + 560}`}
              stroke="#1C1C1C" strokeWidth={34} fill="none" strokeLinecap="round" {...{strokeDasharray: `${len} 2000`}} />;
          })}
          {kind === 'cow' && painted < 0.01 ? <><ellipse cx={-60} cy={-300} rx={50} ry={34} fill="#F3E7D6" opacity={0.85} /><ellipse cx={90} cy={-210} rx={40} ry={28} fill="#F3E7D6" opacity={0.85} /></> : null}
          {/* form shading (sun from the upper left) */}
          <rect x={-300} y={-560} width={700} height={580} fill="url(#zShade)" />
          <path d="M -190 -350 Q -40 -372 150 -352" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.35} />
        </g>
        <path d={full} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {/* mane / horns / ears / muzzle */}
        {horse ? <path d="M 150 -345 Q 160 -420 205 -478 Q 190 -430 175 -380 Q 168 -360 160 -340" fill={kind === 'zebra' ? '#1C1C1C' : '#4A2A18'} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          : <><path d="M 228 -405 Q 220 -440 236 -452 Q 244 -428 248 -408 Z" fill="#F3E7D6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <path d="M 300 -410 Q 312 -444 328 -448 Q 324 -422 316 -404 Z" fill="#F3E7D6" stroke={INK} strokeWidth={6} strokeLinejoin="round" /></>}
        <path d={horse ? 'M 225 -470 Q 214 -505 236 -515 Q 240 -490 240 -472 Z' : 'M 205 -395 Q 160 -410 170 -380 Q 190 -372 212 -380 Z'} fill={horse ? (kind === 'zebra' ? '#F1EEE8' : '#8A5232') : BROWN2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cx={horse ? 315 : 312} cy={horse ? -378 : -298} rx={horse ? 26 : 38} ry={horse ? 20 : 28} fill={horse ? (kind === 'zebra' ? '#2A2A2A' : '#5A3420') : PINK} stroke={INK} strokeWidth={6} />
        <circle cx={horse ? 322 : 300} cy={horse ? -382 : -300} r={5} fill={INK} /><circle cx={horse ? 308 : 324} cy={horse ? -376 : -300} r={5} fill={INK} />
        {eyes}
        {mood === 'happy' || mood === 'smug' ? <path d={horse ? 'M 290 -362 Q 305 -352 318 -360' : 'M 290 -270 Q 310 -256 330 -270'} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
        {kind === 'cow' ? <path d="M -40 -150 Q -30 -110 0 -112 Q 30 -110 40 -150" fill={PINK} stroke={INK} strokeWidth={6} /> : null}
      </g></W>
    );
  };

// ---------- flies ----------
/** a small biting fly: dark body, red eyes, flapping wings (alternates every frame) */
const Fly: React.FC<{x: number; y: number; t: number; s?: number; rot?: number; face?: boolean; dizzy?: number}> = ({x, y, t, s = 1, rot = 0, face, dizzy = 0}) => {
  const up = Math.floor(t * 60) % 2 === 0;
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={-4} cy={up ? -14 : -6} rx={14} ry={7} fill="#E8F4FF" opacity={0.85} stroke={INK} strokeWidth={2.5} transform={`rotate(${up ? -30 : 10} -4 -8)`} />
      <ellipse cx={-14} cy={0} rx={13} ry={9} fill="#2C2C30" stroke={INK} strokeWidth={3} />
      <circle cx={4} cy={-1} r={9} fill="#2C2C30" stroke={INK} strokeWidth={3} />
      <circle cx={9} cy={-3} r={5} fill="#D9443A" />
      {face ? <><path d="M 4 4 L 16 12" stroke={INK} strokeWidth={2.5} strokeLinecap="round" /><circle cx={10} cy={-5} r={1.6} fill="#fff" /></> : null}
      {dizzy > 0.01 ? [0, 1, 2].map((i) => {
        const a = t * 6 + (i * 2 * Math.PI) / 3;
        return <path key={i} transform={`translate(${Math.cos(a) * 22} ${-26 + Math.sin(a) * 6}) scale(${0.35 * dizzy})`} d="M 0 -14 L 4 -4 L 14 -4 L 6 3 L 9 13 L 0 7 L -9 13 L -6 3 L -14 -4 L -4 -4 Z" fill={GOLD} stroke={INK} strokeWidth={3} />;
      }) : null}
    </g></W>
  );
};
/** buzzing around a point: sums of sines, never random jumps */
const buzz = (t: number, i: number, cx: number, cy: number, rx: number, ry: number) => ({
  x: cx + rx * (0.7 * Math.sin(t * (2.1 + rnd(i) * 1.7) + i * 1.3) + 0.3 * Math.sin(t * 5.3 + i)),
  y: cy + ry * (0.7 * Math.sin(t * (2.7 + rnd(i + 9) * 1.5) + i * 2.1) + 0.3 * Math.sin(t * 6.1 + i * 3)),
});
/** a fly that dives at a striped body and bounces off at tHit (no slowing down): returns position + spin */
const diveBounce = (t: number, t0: number, tHit: number, from: [number, number], at: [number, number], seed: number) => {
  if (t < t0) return null;
  if (t < tHit) { const u = seg(t, t0, tHit); const e = u * u; return {x: lerp(from[0], at[0], e), y: lerp(from[1], at[1], e) + 30 * Math.sin(u * 9 + seed), rot: Math.atan2(at[1] - from[1], at[0] - from[0]) * 180 / Math.PI, dizzy: 0}; }
  const v = t - tHit, dir = from[0] < at[0] ? -1 : 1;
  return {x: at[0] + dir * 260 * v, y: at[1] - 380 * v + 300 * v * v, rot: v * 900, dizzy: Math.min(1, v * 4)};
};

// ---------- the guy's brush (in his pointing hand) ----------
const PR = (LIB_M as any).point_right, PRS = HEAD_R / PR.head[2];
const HAND = {dx: (1800 - PR.feet[0]) * PRS, dy: (1210 - PR.feet[1]) * PRS};
const Brush: React.FC<{hx: number; hy: number; ang: number}> = ({hx, hy, ang}) => (
  <W><g transform={`translate(${hx} ${hy}) rotate(${ang})`}>
    <rect x={-6} y={-7} width={70} height={14} rx={6} fill="#C99A5B" stroke={INK} strokeWidth={5} />
    <rect x={60} y={-12} width={16} height={24} rx={3} fill="#B9BEC9" stroke={INK} strokeWidth={5} />
    <path d="M 74 -13 L 104 -10 Q 112 0 104 10 L 74 13 Z" fill="#1C1C1C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g></W>
);
/** a paint bucket */
const Bucket: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -38 -70 L 38 -70 L 30 0 L -30 0 Z" fill="#C7CCD6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={0} cy={-70} rx={38} ry={10} fill="#1C1C1C" stroke={INK} strokeWidth={6} />
    <path d="M -36 -66 Q 0 -120 36 -66" stroke={INK} strokeWidth={5} fill="none" />
    <path d="M 14 -64 Q 18 -40 12 -30" stroke="#1C1C1C" strokeWidth={8} strokeLinecap="round" />
  </g></W>
);
/** sticker counter of landings */
const Counter: React.FC<{x: number; y: number; s: number; n: number; label: string; bg: string}> = ({x, y, s, n, label, bg}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-130} y={-70} width={260} height={140} rx={26} fill={bg} stroke={INK} strokeWidth={8} />
    <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill={INK}>{label}</text>
    <text x={0} y={46} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={74} fill={INK}>{n}</text>
  </g></W>) : null;
/** germs popping out of a bite */
const Germs: React.FC<{x: number; y: number; t: number; a: number}> = ({x, y, t, a}) => {
  if (t < a) return null;
  return <W>{[0, 1, 2, 3].map((i) => {
    const u = eout(seg(t, a + i * 0.08, a + i * 0.08 + 0.5)), ang = -150 + i * 40;
    const gx = x + Math.cos(ang * Math.PI / 180) * 120 * u, gy = y + Math.sin(ang * Math.PI / 180) * 120 * u + 4 * Math.sin(t * 8 + i);
    return <g key={i} transform={`translate(${gx} ${gy}) scale(${u})`}>
      {Array.from({length: 7}, (_, k) => <path key={k} transform={`rotate(${k * 51})`} d="M 0 -22 L 0 -32" stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
      <circle r={22} fill="#8BD86A" stroke={INK} strokeWidth={5} />
      <circle cx={-7} cy={-4} r={3.5} fill={INK} /><circle cx={7} cy={-4} r={3.5} fill={INK} />
      <path d="M -8 8 Q 0 2 8 8" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
    </g>;
  })}</W>;
};

/** fly-vision: a compound-eye view of stripes shimmering (screen space) */
const FlyVision: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 380, hex: React.ReactNode[] = [];
  for (let q = -9; q <= 9; q++) for (let r = -9; r <= 9; r++) {
    const hx = q * 52 + (r % 2 ? 26 : 0), hy = r * 45;
    if (hx * hx + hy * hy > (R + 30) * (R + 30)) continue;
    hex.push(<path key={`${q},${r}`} transform={`translate(${hx} ${hy})`} d="M 0 -30 L 26 -15 L 26 15 L 0 30 L -26 15 L -26 -15 Z" fill="none" stroke="#2A3B2A" strokeWidth={4} opacity={0.55} />);
  }
  return (
    <div style={{position: 'absolute', left: 540, top: 900, transform: `translate(-50%,-50%) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <clipPath id="zEye"><circle r={R} /></clipPath>
        <circle r={R + 18} fill={INK} />
        <g clipPath="url(#zEye)">
          <rect x={-450} y={-450} width={900} height={900} fill="#F4F1EA" />
          {Array.from({length: 26}, (_, i) => {
            const off = ((t * 520 + i * 70) % 1820) - 910;
            return <path key={i} d={`M ${off} -480 Q ${off + 60 * Math.sin(t * 9 + i)} 0 ${off - 40} 480`} stroke="#1C1C1C" strokeWidth={34} fill="none" />;
          })}
          {Array.from({length: 26}, (_, i) => {
            const off = ((-t * 380 + i * 70) % 1820 + 1820) % 1820 - 910;
            return <path key={`b${i}`} d={`M -480 ${off} Q 0 ${off + 40 * Math.sin(t * 7 + i)} 480 ${off - 30}`} stroke="#1C1C1C" strokeWidth={10} fill="none" opacity={0.25} />;
          })}
          {hex}
        </g>
        <circle r={R} fill="none" stroke="#7A2A22" strokeWidth={22} />
      </svg>
      <div style={{position: 'absolute', left: '50%', top: 40, transform: 'translate(-50%,-50%) rotate(-3deg)', background: '#fff', border: `8px solid ${INK}`, borderRadius: 26,
        padding: '8px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 56, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>FLY VISION</div>
    </div>
  );
};

/** a question sticker that invites comments (top band) */
const CommentAsk: React.FC<{t: number; at: number; until: number}> = ({t, at, until}) => {
  const s = popIn(t, at, 0.35) * (1 - eio(seg(t, until - 0.25, until)));
  if (s < 0.01) return null;
  const wob = 1 + 0.02 * Math.sin((t - at) * 2 * Math.PI * 1.2);
  return (
    <div style={{position: 'absolute', left: 540, top: 270, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s * wob})`, display: 'flex', alignItems: 'center', gap: 16,
      background: '#FFF3B0', border: `7px solid ${INK}`, borderRadius: 30, padding: '14px 30px 14px 20px', boxShadow: `0 8px 0 ${INK}`, fontFamily: FONT,
      fontWeight: 900, fontSize: 44, color: INK, whiteSpace: 'nowrap', letterSpacing: -0.5}}>
      <svg width={64} height={64} viewBox="0 0 64 64">
        <path d="M 11 10 H 53 Q 60 10 60 17 V 40 Q 60 47 53 47 H 30 L 17 57 L 20 47 H 11 Q 4 47 4 40 V 17 Q 4 10 11 10 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={20} cy={29} r={4} fill={INK} /><circle cx={32} cy={29} r={4} fill={INK} /><circle cx={44} cy={29} r={4} fill={INK} />
      </svg>
      <div style={{lineHeight: 1.05}}>What should he paint next?<div style={{fontSize: 32, fontWeight: 800}}>Tell us in the comments</div></div>
    </div>
  );
};

// ---------- story over time ----------
/** stripes painted on cow A: 3 done at frame 0, then one every 0.6 s until all 7 */
const paintedAt = (t: number) => Math.min(7, 3 + Math.max(0, t) / 0.6);
type G = {pose: Pose; sx: number; sy: number; flip: boolean};
const guyAt = (t: number): {x: number; g: G} => {
  if (t < 2.5) {
    const k = Math.min(6, Math.floor(paintedAt(t)));
    const sx = STRIPE_X[Math.min(6, k)];
    const x = CA + sx - HAND.dx - 92;
    return {x, g: {pose: 'point_right', sx: 1, sy: 1, flip: false}};
  }
  let g: G = {...swap(t, 2.5, 'point_right', 'front_calm'), flip: false};
  if (t >= T.so - 0.12) g = {...swap(t, T.so, 'front_calm', 'present'), flip: false};
  if (t >= T.farm - 0.12) g = {...swap(t, T.farm, 'present', 'shrug'), flip: false};
  const x = lerp(CA + STRIPE_X[6] - HAND.dx - 92, -330, eio(seg(t, 2.5, 3.0)));
  return {x, g};
};

export const ZebraScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}}> = ({t, camK}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: -10, y: -330, k: 1.5}, {t: 2.4, x: 30, y: -335, k: 1.55},               // brush mid-stroke on the half-striped cow
    {t: 2.9, x: 60, y: -360, k: 1.02}, {t: 3.85, x: 70, y: -360, k: 1.04},             // the flies bounce off
    {t: 4.35, x: CB + 40, y: -360, k: 1.35}, {t: 7.3, x: CB + 60, y: -360, k: 1.45},    // a plain cow gets bitten
    {t: 9.7, x: CB + 60, y: -360, k: 1.45}, {t: 10.2, x: 420, y: -380, k: 1.0},        // fly vision, then the dive
    {t: 13.0, x: 380, y: -390, k: 0.98},
    {t: 13.45, x: (ZX + HX2) / 2, y: -420, k: 0.76}, {t: 17.2, x: (ZX + HX2) / 2, y: -420, k: 0.78}, // zebra vs horse
    {t: 17.65, x: (CA + CB) / 2, y: -430, k: 0.8}, {t: 21.1, x: (CA + CB) / 2, y: -430, k: 0.82},   // cows, the study
    {t: 21.55, x: ZX + 60, y: -380, k: 1.15}, {t: 23.3, x: ZX + 60, y: -380, k: 1.2},             // that's why zebras have stripes
    {t: 23.75, x: 380, y: -440, k: 0.7}, {t: 25.6, x: 360, y: -430, k: 0.73},                     // the herd queues up
    {t: 26.15, x: -10, y: -330, k: 1.5},
  ], t);
  const sh = shake(t, hit(t, T.bounce, 9, 6));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const painted = paintedAt(t);
  const {x: gx, g} = guyAt(t);
  // brush tip follows the stripe being painted (top to bottom)
  const k = painted % 1, tipY = lerp(-330, -170, eio(k));
  const ang = Math.atan2(tipY - HAND.dy, 92) * 180 / Math.PI;
  const brushOn = t < 2.5;
  const moodA: Mood = t > T.stopped && t < T.bite ? 'happy' : t > T.cows && t < T.so ? 'smug' : t > T.now ? 'smug' : 'calm';
  const moodB: Mood = t > T.bite && t < T.stripes ? 'annoyed' : t > T.sci && t < T.so ? 'annoyed' : t > T.now ? 'hopeful' : 'calm';
  // the herd walks in at the end
  const herdU = eio(seg(t, T.now, T.every + 0.9));
  const herd = [CB, CB + 480, CB + 960].map((hx, i) => ({x: lerp(hx + (i ? 1600 : 0), hx, herdU), i}));
  // flies
  const flies: React.ReactNode[] = [];
  // opening: three flies buzz at the unpainted front of cow A, then bounce off the stripes
  for (let i = 0; i < 4; i++) {
    const tHit = T.stopped + i * 0.16;
    const b = diveBounce(t, T.flies - 0.25 + i * 0.1, tHit, [buzz(T.flies - 0.25, i, CA + 260, -460, 140, 60).x, buzz(T.flies - 0.25, i, CA + 260, -460, 140, 60).y], [CA + STRIPE_X[3 + (i % 3)], -280 + i * 20], i);
    if (t < T.flies - 0.25 + i * 0.1) { const p = buzz(t, i, CA + 260, -460, 140, 60); flies.push(<Fly key={`o${i}`} x={p.x} y={p.y} t={t + i * 0.01} s={1.6} />); }
    else if (b && t < T.bite + 0.6) flies.push(<Fly key={`o${i}`} x={b.x} y={b.y} t={t} s={1.6} rot={b.rot} dizzy={b.dizzy} />);
  }
  // the hero fly bites plain cow B
  const heroLand = {x: CB - 40, y: -360};
  if (t >= T.bite - 0.3 && t < T.stripes + 0.3) {
    const u = eout(seg(t, T.bite - 0.3, T.bite + 0.35));
    const sit = t > T.bite + 0.35;
    const hx = lerp(CB + 380, heroLand.x, u) + (sit ? 0 : 20 * Math.sin(t * 13));
    const hy = lerp(-560, heroLand.y, u) + (sit ? 2 * Math.sin(t * 30) : 0);
    flies.push(<Fly key="hero" x={hx} y={hy} t={t} s={3.2} rot={sit ? 70 : 10} face />);
  }
  // the dive: hero fly zooms at striped cow A, no slowing down, bounces off
  const dive = diveBounce(t, T.zoom - 0.2, T.bounce, [CB + 120, -620], [CA + 140, -300], 3);
  if (dive && t < T.real) flies.push(<Fly key="dive" x={dive.x} y={dive.y} t={t} s={3.2} rot={dive.rot} face dizzy={dive.dizzy} />);
  // zebra vs horse: flies land on the horse, bounce off the zebra
  const horseN = Math.min(20, Math.floor(20 * seg(t, T.land - 0.6, T.horses + 0.2)));
  const zebraN = Math.min(4, Math.floor(4 * seg(t, T.land - 0.6, T.horses + 0.2) + 0.2));
  if (t > T.real - 0.4 && t < T.sci + 0.2) {
    for (let i = 0; i < horseN; i++) flies.push(<Fly key={`h${i}`} x={HX2 - 170 + rnd(i * 3) * 360 * -1 + 200} y={-330 + rnd(i * 5) * 160 + Math.sin(t * 20 + i) * 2} t={t + i} s={1.4} rot={rnd(i) * 360} />);
    for (let i = 0; i < 6; i++) { const p = buzz(t, i + 20, HX2 - 20, -520, 260, 90); flies.push(<Fly key={`hb${i}`} x={p.x} y={p.y} t={t + i * 0.01} s={1.4} />); }
    for (let i = 0; i < 8; i++) {
      const t0 = T.real + i * 0.45, b = diveBounce(t, t0, t0 + 0.35, [ZX + 320 - (i % 2) * 640, -620 + (i % 3) * 30], [ZX + (i % 2 ? -120 : 120), -300 + (i % 3) * 30], i);
      if (b && t < t0 + 1.4) flies.push(<Fly key={`zb${i}`} x={b.x} y={b.y} t={t} s={1.4} rot={b.rot} dizzy={b.dizzy} />);
    }
    for (let i = 0; i < zebraN; i++) flies.push(<Fly key={`zl${i}`} x={ZX - 120 + i * 70} y={-250 - (i % 2) * 70} t={t + i} s={1.4} rot={20} />);
  }
  // the study: a swarm on plain cow B, a few bounce off striped cow A
  if (t > T.sci - 0.2 && t < T.so + 0.2) {
    const n = Math.floor(18 * seg(t, T.sci, T.way));
    for (let i = 0; i < n; i++) flies.push(<Fly key={`sb${i}`} x={CB - 190 + rnd(i * 7) * 380} y={-330 + rnd(i * 11) * 160 + Math.sin(t * 20 + i) * 2} t={t + i} s={1.4} rot={rnd(i) * 360} />);
    for (let i = 0; i < 10; i++) { const p = buzz(t, i + 40, CB, -520, 300, 90); flies.push(<Fly key={`sbb${i}`} x={p.x} y={p.y} t={t + i * 0.01} s={1.4} />); }
    for (let i = 0; i < 5; i++) {
      const t0 = T.sci + 0.2 + i * 0.6, b = diveBounce(t, t0, t0 + 0.35, [CA - 360 + (i % 2) * 760, -640], [CA + (i % 2 ? 120 : -120), -280], i);
      if (b && t < t0 + 1.3) flies.push(<Fly key={`sab${i}`} x={b.x} y={b.y} t={t} s={1.4} rot={b.rot} dizzy={b.dizzy} />);
    }
    if (t > T.way) flies.push(<Fly key="sa1" x={CA - 40} y={-250} t={t} s={1.4} rot={30} />);
  }
  // "that's why zebras have stripes": flies keep pinging off the zebra
  if (t > T.so - 0.2 && t < T.now + 0.2) {
    for (let i = 0; i < 6; i++) {
      const t0 = T.so + i * 0.4, b = diveBounce(t, t0, t0 + 0.3, [ZX - 600 + (i % 2) * 1100, -640], [ZX + (i % 2 ? 100 : -100), -300], i);
      if (b && t < t0 + 1.2) flies.push(<Fly key={`zz${i}`} x={b.x} y={b.y} t={t} s={1.4} rot={b.rot} dizzy={b.dizzy} />);
    }
  }
  // labels
  const diseaseS = pulse(t, T.disease, T.stripes - T.disease - 0.3);
  const itchS = pulse(t, T.itch, T.disease - T.itch - 0.05);
  const visionS = popIn(t, T.stripes + 0.05, 0.35) * (1 - seg(t, T.zoom - 0.35, T.zoom - 0.1));
  const noBrakes = pulse(t, T.slow, T.bounce - T.slow - 0.1);
  const boing = pulse(t, T.bounce, 0.9);
  const counterS = popIn(t, T.real + 0.2, 0.3) * (1 - seg(t, T.sci - 0.3, T.sci));
  const quarterS = pulse(t, T.quarter, T.sci - T.quarter - 0.35);
  const studyS = pulse(t, T.sci, T.so - T.sci - 0.35);
  const fewerS = pulse(t, T.way, T.so - T.way - 0.35);
  const meS = pulse(t, T.farm, 26.2 - T.farm);
  const stripeS = pulse(t, T.stripes2, T.now - T.stripes2 - 0.2);
  const bucketS = popIn(t, T.every, 0.3) * (1 - seg(t, 26.2, 26.35));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: SKY0}}>
      <Defs />
      <Layer cam={cam} z={3200} paper={false}><Backdrop t={t} /></Layer>
      <Layer cam={cam} z={3200}><SunDisc t={t} /></Layer>
      <Layer cam={cam} z={1900}><Hills /></Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Ground />
        <CastShadow x={CA} w={460} /><CastShadow x={CB} w={460} /><CastShadow x={ZX} w={460} /><CastShadow x={HX2} w={460} />
        {t > T.now - 0.2 ? herd.slice(1).map((h) => <CastShadow key={h.i} x={h.x} w={460} />) : null}
        <CastShadow x={gx} w={150} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Quad id="H" x={HX2} kind="horse" t={t} flip mood={t > T.land && t < T.sci ? 'annoyed' : 'calm'} twitch={t > T.land && t < T.sci ? 1 : 0} />
        <Quad id="Z" x={ZX} kind="zebra" t={t} mood={t > T.quarter || (t > T.so && t < T.now) ? 'smug' : 'calm'} />
        {t > T.now - 0.2 ? herd.slice(1).reverse().map((h) => <Quad key={h.i} id={`q${h.i}`} x={h.x} kind="cow" t={t} flip mood="hopeful" walk={herdU > 0.02 && herdU < 0.98 ? 1 : 0} />) : null}
        <Quad id="B" x={t > T.now ? herd[0].x : CB} kind="cow" t={t} flip mood={moodB} twitch={moodB === 'annoyed' ? 1 : 0} />
        <Quad id="A" x={CA} kind="cow" t={t} painted={painted} mood={moodA} />
        {bucketS > 0.01 ? herd.map((h) => <Bucket key={h.i} x={h.x - 60} y={0} s={bucketS} />) : null}
        <Bucket x={CA - 300} y={0} />
        <Guy pose={g.pose} x={gx} y={0} t={t} sx={g.sx} sy={g.sy} flip={g.flip} />
        {brushOn ? <Brush hx={gx + HAND.dx} hy={HAND.dy} ang={ang} /> : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        {flies}
        {t < T.stripes + 0.2 ? <Germs x={heroLand.x - 20} y={heroLand.y + 10} t={t} a={T.disease} /> : null}
        <Txt x={heroLand.x - 10} y={heroLand.y - 130} s={itchS} text="ITCH" size={70} rot={-6} />
        <Txt x={CB + 60} y={-640} s={diseaseS} text="DISEASE" size={84} rot={-4} fill="#8BD86A" />
        <Txt x={260} y={-660} s={noBrakes} text="NO BRAKES" size={80} rot={-6} fill={GOLD} />
        <Txt x={CA + 260} y={-520} s={boing} text="BOING" size={96} rot={8} fill={GOLD} />
        <Counter x={ZX} y={-690} s={counterS} n={zebraN} label="LANDINGS" bg="#FFFFFF" />
        <Counter x={HX2} y={-690} s={counterS} n={horseN} label="LANDINGS" bg="#FFE7C2" />
        <Txt x={(ZX + HX2) / 2} y={-890} s={quarterS} text="UNDER 1/4" size={96} rot={-4} fill={GOLD} />
        <Txt x={CB} y={-690} s={studyS} text="REAL STUDY" size={70} rot={4} />
        <Txt x={CA} y={-690} s={fewerS} text="WAY FEWER" size={80} rot={-4} fill={GOLD} />
        <Txt x={ZX + 20} y={-640} s={stripeS} text="FLY SHIELD" size={84} rot={-4} fill={GOLD} />
        <Txt x={herd[0].x + 140} y={-600} s={meS} text="ME NEXT" size={70} rot={6} />
        {[0, 1, 2].map((i) => <Star key={i} x={CA + 60 + i * 90} y={-470 - (i % 2) * 30} s={pulse(t, T.stopped + i * 0.06, 0.6) * 0.7} rot={i * 20} />)}
      </Layer>
      <FlyVision t={t} s={visionS} />
      <HookTitle t={t} text="STRIPES STOP FLIES" hi="STRIPES" />
      <CallToAction t={t} at={T.cta} />
      <CommentAsk t={t} at={T.farm - 0.3} until={26.15} />
    </AbsoluteFill>
  );
};

export const ZebraVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const bounces: Cue[] = [];
  for (let i = 0; i < 4; i++) bounces.push({f: 'twang.mp3', at: T.stopped + i * 0.16, db: -30, to: 0.35});
  for (let i = 0; i < 8; i++) bounces.push({f: 'twang.mp3', at: T.real + i * 0.45 + 0.35, db: -34, to: 0.3});
  for (let i = 0; i < 5; i++) bounces.push({f: 'twang.mp3', at: T.sci + 0.55 + i * 0.6, db: -34, to: 0.3});
  for (let i = 0; i < 6; i++) bounces.push({f: 'twang.mp3', at: T.so + 0.3 + i * 0.4, db: -34, to: 0.3});
  const ticks: Cue[] = [];
  for (let i = 1; i <= 20; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.land - 0.6, T.horses + 0.2, i / 20), db: -32});
  const cues: Cue[] = [
    {f: 'squeak.wav', at: 0.0, db: -30}, {f: 'squeak.wav', at: 0.6, db: -32}, {f: 'squeak.wav', at: 1.2, db: -32}, {f: 'squeak.wav', at: 1.8, db: -32},
    {f: 'whir.mp3', at: 0, db: -36, to: 2.6},
    ...bounces, {f: 'chirp.wav', at: T.stopped + 0.2, db: -30},
    {f: 'whoosh.wav', at: 4.0, db: -28}, {f: 'whir.mp3', at: T.bite - 0.3, db: -30, to: 0.9}, {f: 'peck.wav', at: T.bite + 0.35, db: -22},
    {f: 'pop.wav', at: T.itch, db: -24}, {f: 'bubbles.wav', at: T.disease, db: -26, to: 0.7}, {f: 'pop.wav', at: T.disease, db: -22},
    {f: 'zap.wav', at: T.stripes + 0.05, db: -28}, {f: 'pop.wav', at: T.stripes + 0.05, db: -22},
    {f: 'whoosh.wav', at: T.zoom - 0.2, db: -24}, {f: 'whir.mp3', at: T.zoom, db: -28, to: 2.0}, {f: 'pop.wav', at: T.slow, db: -24},
    {f: 'twang.mp3', at: T.bounce, db: -18}, {f: 'crowd_laugh.wav', at: T.bounce + 0.2, db: -36, to: 1.4},
    {f: 'whoosh.wav', at: T.real - 0.1, db: -28}, {f: 'pop.wav', at: T.real + 0.2, db: -26}, ...ticks,
    {f: 'ding.mp3', at: T.quarter, db: -22}, {f: 'pop.wav', at: T.quarter, db: -22},
    {f: 'whoosh.wav', at: T.sci - 0.1, db: -28}, {f: 'pop.wav', at: T.sci, db: -26}, {f: 'pop.wav', at: T.way, db: -22},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: T.so - 0.1, db: -28}, {f: 'pop.wav', at: T.stripes2, db: -22},
    {f: 'whoosh.wav', at: T.now - 0.1, db: -28}, {f: 'pop.wav', at: T.every, db: -24}, {f: 'pop.wav', at: T.farm, db: -22}, {f: 'giggle.mp3', at: T.paint, db: -30, to: 0.9},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<ZebraScene t={0} />}>
        <ZebraScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="zebra/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const ZebraWide: React.FC = () => <WideFit.Provider value={0.72}><ZebraVideo /></WideFit.Provider>;
