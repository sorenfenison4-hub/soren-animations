// "What if you could swallow like a snake?" - built on the owl formula (CLAUDE.md, Growth): the power is ON him at frame 0
// (a whole watermelon jammed in his stretched mouth, face going blue), the co-star does it with ease next to him (a smug
// python gulping an egg, the bulge sliding down its neck), two X-rays (the python's split chin, then its windpipe
// snorkel; then YOUR throat closing), a live versus counter (MOUTH OPENS 26 cm vs 5 cm), a comedy hit made by the power
// itself (straw "snorkel" -> the melon shoots out, BOING, dizzy + laugh), and a dumb-but-funny ending (he sticks to
// slices... and eyes the whole melon) that runs into frame 0. Everything drawn in code over the library body.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle, CommentAsk, Sweat} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.1; times below are video time). Last word ends ~21.85 s.
export const DURATION = 22.7;
export const T = {
  melon: 0.68, snake: 1.92, suffocate: 2.94, halfway: 3.45, down: 3.99,           // "Swallow a watermelon whole like a snake, and you'd suffocate halfway down."
  python: 4.72, jaw: 5.23, unhinge: 5.92,                                         // "A python's jaw doesn't unhinge."
  chin: 7.08, joined: 8.10, stretches: 8.83,                                      // "Its chin just isn't joined, so it stretches."
  big: 9.77, opens: 10.21, n26: 10.75, cm: 11.30, you: 12.26, five: 13.03,        // "A big one opens twenty-six centimeters. You, about five."
  slides: 13.92, windpipe: 14.54, forward: 15.01, food: 16.25, snorkel: 16.90,    // "And it slides its windpipe forward, past the food, like a snorkel."
  every: 17.48, swallow: 17.92, stops: 18.61, breath: 19.01,                      // "Every swallow stops your breath."
  so: 19.59, slices: 20.57, fornow: 21.28,                                        // "So he'll stick to slices... for now."
  cta: 13.35,
};
const POP = T.breath + 0.12;         // the melon shoots out of his mouth

const GOLD = '#FFD43B', RED = '#E2453C', BLUE = '#6FA8DC';
const SK = '#C9A35E', SK2 = '#9C7A3E', SK_D = '#5E4425', SK_L = '#EAD8A8';
const GX = -40;                      // guy's feet
const SX = 270;                      // python's coil centre
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
const Sticker: React.FC<{text: string; s: number; x: number | string; y: number; rot?: number; bg?: string; size?: number; color?: string}> = ({text, s, x, y, rot = 0, bg = '#fff', size = 54, color = INK}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: bg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 24px', fontFamily: FONT, fontWeight: 900, fontSize: size, color, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>) : null;

const Defs: React.FC = () => (
  <W><defs>
    <linearGradient id="sSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FCBEA" /><stop offset="1" stopColor="#DDF1F7" /></linearGradient>
    <linearGradient id="sGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8DC26B" /><stop offset="1" stopColor="#6C9E50" /></linearGradient>
    <radialGradient id="sFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <linearGradient id="sMelon" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#7CC25A" /><stop offset="1" stopColor="#3F8A33" /></linearGradient>
    <linearGradient id="sSnake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D8B46C" /><stop offset="1" stopColor={SK2} /></linearGradient>
  </defs></W>
);

// ---------- the sunny picnic ----------
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-4000} y={-5000} width={9000} height={5000} fill="url(#sSky)" />
    <g transform={`translate(-650 -1500) rotate(${t * 12})`}>
      {Array.from({length: 10}, (_, i) => <path key={i} transform={`rotate(${i * 36})`} d="M 0 -170 L 18 -230 L -18 -230 Z" fill="#FFD43B" stroke={INK} strokeWidth={7} strokeLinejoin="round" />)}
      <circle r={140} fill="#FFE27A" stroke={INK} strokeWidth={9} />
    </g>
    {[[500, -1700, 1], [-1300, -1250, 0.8], [1300, -1150, 0.7]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x + 30 * Math.sin(t * 0.4 + i)} ${y}) scale(${s})`}>
        <path d="M -200 40 Q -230 -30 -150 -40 Q -130 -120 -40 -100 Q 20 -170 100 -100 Q 190 -110 190 -20 Q 240 20 200 50 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      </g>))}
  </W>
);
const Hills: React.FC = () => (
  <W>
    <path d="M -3000 60 Q -2200 -380 -1300 -170 Q -700 -430 100 -210 Q 900 -470 1700 -200 Q 2500 -430 3300 -190 Q 4100 -400 5000 60 Z" fill="#A9D48A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {Array.from({length: 12}, (_, i) => {
      const x = -2400 + i * 440 + rnd(i) * 140, h = 240 + rnd(i * 3) * 160;
      return <g key={i} transform={`translate(${x} -40)`}>
        <rect x={-14} y={-h * 0.4} width={28} height={h * 0.4 + 40} fill="#8A6A45" stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={-h * 0.62} rx={h * 0.32} ry={h * 0.4} fill="#6FB25A" stroke={INK} strokeWidth={7} />
      </g>;
    })}
    <rect x={-3000} y={40} width={8000} height={3000} fill="#A9D48A" />
  </W>
);
const Ground: React.FC = () => (
  <W>
    <rect x={-4000} y={0} width={9000} height={3000} fill="url(#sGrass)" />
    <path d="M -4000 0 H 5000" stroke={INK} strokeWidth={8} />
    {Array.from({length: 70}, (_, i) => {
      const x = -2000 + rnd(i * 3) * 4400, y = 30 + rnd(i * 7) * 700;
      return <path key={i} d={`M ${x - 14} ${y} l 8 -26 l 6 22 l 8 -30 l 6 34`} stroke="#5A8A43" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
    {/* picnic blanket (flat on the ground, in perspective) */}
    <g transform="translate(60 30)">
      <path d="M -330 -24 L 330 -24 L 380 60 L -380 60 Z" fill="#F4F0E6" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M ${-330 + i * 110 + 30} -24 L ${-380 + i * 126.7 + 36} 60 L ${-380 + i * 126.7 + 84} 60 L ${-330 + i * 110 + 70} -24 Z`} fill="#E2453C" opacity={0.85} />)}
      <path d="M -350 12 L 350 12" stroke="#E2453C" strokeWidth={18} opacity={0.6} />
      <path d="M -330 -24 L 330 -24 L 380 60 L -380 60 Z" fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    </g>
  </W>
);
const CastShadow: React.FC<{x: number; w: number}> = ({x, w}) => <W><ellipse cx={x - w * 0.1} cy={8} rx={w * 0.6} ry={20} fill="#2E5020" opacity={0.28} /></W>;

// ---------- watermelon ----------
const Melon: React.FC<{x: number; y: number; rx: number; ry: number; rot?: number}> = ({x, y, rx, ry, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <ellipse rx={rx} ry={ry} fill="url(#sMelon)" stroke={INK} strokeWidth={7} />
    {[-0.62, -0.22, 0.2, 0.6].map((u, i) => (
      <path key={i} d={`M ${u * rx} ${-ry * 0.92} Q ${u * rx + rx * 0.12} ${-ry * 0.45} ${u * rx - rx * 0.04} 0 Q ${u * rx + rx * 0.12} ${ry * 0.45} ${u * rx} ${ry * 0.92}`}
        stroke="#21581F" strokeWidth={rx * 0.13} fill="none" strokeLinecap="round" />))}
    <ellipse cx={-rx * 0.38} cy={-ry * 0.45} rx={rx * 0.2} ry={ry * 0.1} fill="#fff" opacity={0.45} transform={`rotate(-30 ${-rx * 0.38} ${-ry * 0.45})`} />
  </g>
);
const Slice: React.FC<{x: number; y: number; s: number; rot?: number; bite?: number}> = ({x, y, s, rot = 0, bite = 0}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -44 -6 Q 0 34 44 -6 Z" fill="#3F8A33" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -38 -6 Q 0 24 38 -6 L 0 -70 Z" fill="#F0626E" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {bite > 0.01 ? <circle cx={0} cy={-70} r={16 * bite} fill="#F6EFD9" stroke={INK} strokeWidth={5} /> : null}
    {[[-10, -26], [8, -36], [0, -14], [14, -16]].map(([sx, sy], i) => <ellipse key={i} cx={sx} cy={sy} rx={3} ry={5} fill={INK} />)}
  </g></W>) : null;

// ---------- the guy's head, drawn in code (so the jaw can stretch round a melon) ----------
type Mood = 'melon' | 'calm' | 'dizzy' | 'happy' | 'chew' | 'sly' | 'gasp';
/** the guy's round head at (x, y). melon: 0..1 how far the melon is jammed in; blue: 0..1 face tint. */
const GuyHead: React.FC<{x: number; y: number; t: number; mood: Mood; blue?: number; roll?: number; stretch?: number; puff?: number}> = ({x, y, t, mood, blue = 0, roll = 0, stretch = 0, puff = 0}) => {
  const R = HEAD_R;
  const jaw = stretch;                                  // 0 = normal head, 1 = jaw stretched round a whole melon
  const jy = 24 + 56 * jaw, jrx = R * (0.78 + 0.32 * jaw + 0.12 * puff), jry = R * (0.7 + 0.45 * jaw);
  const shape = <>
    <circle r={R} />
    {jaw > 0.01 || puff > 0.01 ? <ellipse cx={0} cy={jy} rx={jrx} ry={jry} /> : null}
  </>;
  const eyeY = -10 - 14 * jaw, pop = mood === 'melon' ? 1 : 0;
  const eye = (side: number) => {
    const ex = side * 30;
    if (mood === 'dizzy') return <path key={side} d="M 0 0 m -9 0 a 9 9 0 1 1 9 9 a 5 5 0 1 1 -4 -5" transform={`translate(${ex} ${eyeY}) rotate(${t * 900})`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (mood === 'happy' || mood === 'chew') return <path key={side} d={`M ${ex - 11} ${eyeY + 3} Q ${ex} ${eyeY - 10} ${ex + 11} ${eyeY + 3}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (pop || mood === 'gasp') return <g key={side} transform={`translate(${ex} ${eyeY})`}>
      <circle r={pop ? 21 : 17} fill="#fff" stroke={INK} strokeWidth={5} />
      <circle cx={side * -2 + 1.5 * Math.sin(t * 31)} cy={1} r={pop ? 6 : 7} fill={INK} />
    </g>;
    if (mood === 'sly') return <g key={side} transform={`translate(${ex} ${eyeY})`}>
      <ellipse cx={5} rx={8.5} ry={12} fill={INK} /><path d="M -16 -5 L 14 -2" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    </g>;
    return <ellipse key={side} cx={ex} cy={eyeY} rx={8.5} ry={13} fill={INK} />;
  };
  const brow = (side: number) => {
    const lift = pop ? -14 : mood === 'gasp' ? -10 : 0;
    const tilt = mood === 'sly' ? side * 14 : pop ? -side * 12 : 0;
    return <path key={side} transform={`translate(${side * 30} ${eyeY - 25 + lift}) rotate(${tilt})`} d="M -14 3 Q 0 -6 14 3" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
  };
  let mouth: React.ReactNode = null;
  if (mood === 'calm') mouth = <path d="M -16 26 Q 0 36 16 26" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'happy') mouth = <path d="M -18 22 Q 0 42 18 22 Z" fill="#E4677A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
  if (mood === 'chew') mouth = <ellipse cx={0} cy={30 + 3 * Math.sin(t * 30)} rx={12} ry={6 + 3 * Math.abs(Math.sin(t * 15))} fill="#7A2B33" stroke={INK} strokeWidth={5} />;
  if (mood === 'sly') mouth = <path d="M -14 30 Q 4 34 18 22" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'dizzy') mouth = <path d="M -16 30 Q -8 22 0 30 Q 8 38 16 30" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  if (mood === 'gasp') mouth = <ellipse cx={0} cy={36} rx={22} ry={26} fill="#5A2328" stroke={INK} strokeWidth={5} />;
  const cid = `gh${Math.round(x)}${Math.round(y)}`;
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${roll})`}>
      <clipPath id={cid}>{shape}</clipPath>
      <g fill="none" stroke={INK} strokeWidth={13}>{shape}</g>
      <g fill="url(#sFace)">{shape}</g>
      <g clipPath={`url(#${cid})`}>
        <path d={`M ${R * 0.35} ${-R} A ${R} ${R} 0 0 1 ${R * 0.35} ${R} A ${R * 1.1} ${R * 1.1} 0 0 0 ${R * 0.35} ${-R} Z`} fill="#C9C5BF" opacity={0.35} />
        {blue > 0.01 ? <rect x={-200} y={-200} width={400} height={400} fill={BLUE} opacity={0.55 * blue} /> : null}
        {puff > 0.01 ? <>{[-1, 1].map((s) => <circle key={s} cx={s * 46} cy={26} r={12 * puff} fill="#F4A3AE" opacity={0.7} />)}</> : null}
      </g>
      {jaw > 0.01 ? <>
        <ellipse cx={0} cy={jy + 4} rx={jrx * 0.86} ry={jry * 0.8} fill="#5A2328" stroke={INK} strokeWidth={6} />
        <Melon x={0} y={jy + 6 + 2 * Math.sin(t * 23)} rx={jrx * 0.8 * (0.7 + 0.3 * jaw)} ry={jry * 0.72 * (0.7 + 0.3 * jaw)} rot={4 * Math.sin(t * 9)} />
        {/* lips wrapping the melon */}
        <path d={`M ${-jrx * 0.86} ${jy} A ${jrx * 0.86} ${jry * 0.8} 0 0 1 ${jrx * 0.86} ${jy}`} fill="none" stroke="#F1B6BE" strokeWidth={9} />
        <path d={`M ${-jrx * 0.86} ${jy} A ${jrx * 0.86} ${jry * 0.8} 0 0 1 ${jrx * 0.86} ${jy}`} fill="none" stroke={INK} strokeWidth={4} />
      </> : null}
      {[-1, 1].map(brow)}{[-1, 1].map(eye)}
      {mouth}
    </g></W>
  );
};
const headOf = (pose: Pose) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s, hy: (m.head[1] - m.feet[1]) * s};
};

// ---------- the python ----------
type SnakeMood = 'calm' | 'smug' | 'wide' | 'gulp';
/** quadratic bezier helper */
const qb = (p0: number[], p1: number[], p2: number[], u: number) => [
  (1 - u) * (1 - u) * p0[0] + 2 * (1 - u) * u * p1[0] + u * u * p2[0], (1 - u) * (1 - u) * p0[1] + 2 * (1 - u) * u * p1[1] + u * u * p2[1]];
/** coiled python at (x, 0). head at (hx, hy) facing left. open: jaw angle 0..1; egg: 0..1 egg in the mouth (1) -> bulge down
 *  the neck (2..3 = bulge u 0..1); gape: extra-wide opening for "26 cm". */
const Python: React.FC<{x: number; hx: number; hy: number; t: number; open: number; mood: SnakeMood; egg?: number; bulge?: number; tongue?: number; eggScale?: number}> =
  ({x, hx, hy, t, open, mood, egg = 0, bulge = -1, tongue = 0, eggScale = 1}) => {
    const n0 = [x + 30, -150], n1 = [x + 120, hy - 10], n2 = [hx + 40, hy + 8];
    const neck = `M ${n0[0]} ${n0[1]} Q ${n1[0]} ${n1[1]} ${n2[0]} ${n2[1]}`;
    const blot = Array.from({length: 7}, (_, i) => qb(n0, n1, n2, 0.08 + i * 0.13));
    const b = bulge >= 0 ? qb(n0, n1, n2, 1 - bulge) : null;
    const ang = open * 38;
    return (
      <W><g>
        {/* coils: three stacked rings */}
        {[[0, -20, 150, 46], [6, -70, 125, 42], [14, -118, 95, 38]].map(([dx, cy, rx, ry], i) => (
          <g key={i}>
            <ellipse cx={x + dx} cy={cy} rx={rx} ry={ry} fill="url(#sSnake)" stroke={INK} strokeWidth={7} />
            {Array.from({length: 5}, (_, j) => <ellipse key={j} cx={x + dx - rx * 0.7 + j * rx * 0.35} cy={cy + 4} rx={rx * 0.1} ry={ry * 0.35} fill={SK_D} opacity={0.75} />)}
            <path d={`M ${x + dx - rx * 0.8} ${cy + ry * 0.45} Q ${x + dx} ${cy + ry * 0.95} ${x + dx + rx * 0.8} ${cy + ry * 0.45}`} stroke={SK_L} strokeWidth={8} fill="none" opacity={0.7} />
          </g>))}
        {/* neck */}
        <path d={neck} stroke={INK} strokeWidth={60} fill="none" strokeLinecap="round" />
        <path d={neck} stroke={SK} strokeWidth={46} fill="none" strokeLinecap="round" />
        {blot.map(([bx, by], i) => <ellipse key={i} cx={bx} cy={by} rx={11} ry={8} fill={SK_D} opacity={0.75} />)}
        {b ? <g><circle cx={b[0]} cy={b[1]} r={40} fill={INK} /><circle cx={b[0]} cy={b[1]} r={33} fill={SK} /><ellipse cx={b[0] - 8} cy={b[1] - 10} rx={10} ry={6} fill="#fff" opacity={0.35} /></g> : null}
        {/* head facing left: upper jaw rotates up, lower jaw rotates down about the hinge at the back */}
        <g transform={`translate(${hx} ${hy}) scale(1.3)`}>
          {tongue > 0.01 && open < 0.2 ? <path d={`M -78 4 L ${-78 - 40 * tongue} 4 l -12 -8 M ${-78 - 40 * tongue} 4 l -12 8`} stroke={RED} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
          <g transform={`rotate(${-ang * 0.35} 40 0)`}>
            {/* lower jaw */}
            <g transform={`rotate(${-ang * 0.65} 40 4)`}>
              <path d="M 52 4 Q 10 34 -76 10 Q -82 4 -74 2 Z" fill={SK_L} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              {open > 0.1 ? <path d="M 40 6 Q 0 22 -66 8" stroke="#E68A92" strokeWidth={10} fill="none" strokeLinecap="round" /> : null}
            </g>
            {/* upper jaw / head */}
            <g transform={`rotate(${ang * 0.65} 40 0)`}>
              <path d="M 62 -4 Q 60 -52 0 -54 Q -60 -52 -84 -14 Q -88 0 -76 4 L 52 4 Z" fill="url(#sSnake)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
              <ellipse cx={20} cy={-30} rx={16} ry={9} fill={SK_D} opacity={0.75} /><ellipse cx={-14} cy={-40} rx={12} ry={7} fill={SK_D} opacity={0.75} />
              <circle cx={-70} cy={-14} r={3.5} fill={INK} />
              {/* eye */}
              <g transform="translate(-26 -24)">
                <circle r={mood === 'wide' ? 17 : 14} fill="#F3D35A" stroke={INK} strokeWidth={5} />
                <ellipse rx={mood === 'wide' ? 4 : 3.5} ry={mood === 'wide' ? 12 : 10} fill={INK} />
                {mood === 'smug' || mood === 'gulp' ? <path d="M -16 -2 A 16 16 0 0 1 16 -2 Z" fill={SK2} stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
                {mood === 'smug' ? <path d="M -16 -16 L 14 -10" stroke={INK} strokeWidth={6} strokeLinecap="round" /> : null}
              </g>
              {open < 0.1 && mood === 'smug' ? <path d="M -70 2 Q -40 10 -6 -2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
            </g>
            {egg > 0.01 ? <ellipse cx={-78 + 40 * (1 - egg)} cy={4} rx={40 * eggScale} ry={30 * eggScale} fill="#FBF6EA" stroke={INK} strokeWidth={6} /> : null}
          </g>
        </g>
      </g></W>
    );
  };

// ---------- inserts (screen space) ----------
const Panel: React.FC<{x: number; y: number; s: number; r?: number; label: string; rot?: number; children: React.ReactNode; size?: number}> = ({x, y, s, r = 340, label, rot = -1.5, children, size = 900}) => {
  if (s < 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`}}>
      <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{overflow: 'visible'}}>
        <clipPath id={`p${label.length}${r}`}><circle r={r} /></clipPath>
        <circle r={r + 18} fill={INK} />
        <g clipPath={`url(#p${label.length}${r})`}>
          <rect x={-size / 2} y={-size / 2} width={size} height={size} fill="#16223A" />
          {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-size / 2 + i * 75} ${-size / 2} V ${size / 2} M ${-size / 2} ${-size / 2 + i * 75} H ${size / 2}`} stroke="#2A3A5C" strokeWidth={3} />)}
          {children}
        </g>
        <circle r={r} fill="none" stroke="#3E6FB0" strokeWidth={20} />
      </svg>
      <Sticker text={label} s={1} x="50%" y={size / 2 - r - 10} rot={-3} />
    </div>
  );
};
const XB = '#EAF4FF';

/** the python's lower jaw seen from below: two separate bones, the chin tied by stretchy tissue; they spread apart */
const JawXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  const spread = eio(seg(t, T.stretches - 0.1, T.stretches + 0.6)) - eio(seg(t, 9.0, 9.3)) * 0;
  const chinS = popIn(t, T.chin, 0.3);
  const youS = popIn(t, T.joined, 0.3);
  const a = 10 + 18 * spread, gap = 8 + 70 * spread;
  const bone = (side: number) => (
    <g transform={`translate(${side * gap / 2} -150) rotate(${side * -a})`}>
      <path d={`M 0 0 Q ${side * 40} 150 ${side * 50} 300`} stroke={XB} strokeWidth={30} fill="none" strokeLinecap="round" />
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M ${side * (6 + i * 6)} ${30 + i * 36} l ${side * -16} -6`} stroke={XB} strokeWidth={6} strokeLinecap="round" />)}
    </g>);
  return (
    <Panel x={540} y={1000} s={s} label="PYTHON JAW X-RAY">
      {/* outline of the head from below */}
      <path d="M 0 -260 Q 200 -200 210 120 Q 200 230 0 250 Q -200 230 -210 120 Q -200 -200 0 -260 Z" fill="none" stroke={XB} strokeWidth={5} strokeDasharray="22 14" opacity={0.6} />
      {bone(-1)}{bone(1)}
      {/* stretchy chin */}
      <g opacity={Math.min(1, 0.3 + chinS)}>
        <path d={`M ${-gap / 2} -150 ${Array.from({length: 6}, (_, i) => `L ${-gap / 2 + gap * (i + 0.5) / 6} ${-150 + (i % 2 ? -14 : 14)}`).join(' ')} L ${gap / 2} -150`}
          stroke="#FF8FA3" strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      </g>
      {chinS > 0.01 ? <g transform={`translate(0 -215) scale(${chinS})`}>
        <circle r={36} fill="none" stroke={GOLD} strokeWidth={8} strokeDasharray="14 9" transform={`rotate(${t * 60})`} />
      </g> : null}
      {/* your jaw: one fused U */}
      {youS > 0.01 ? <g transform={`translate(0 175) scale(${youS * 0.75})`}>
        <path d="M -110 -60 Q -110 80 0 80 Q 110 80 110 -60" stroke="#FFFFFF" strokeWidth={28} fill="none" strokeLinecap="round" />
        <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#FFFFFF">YOU: 1 BONE</text>
      </g> : null}
      <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
    </Panel>
  );
};

/** MOUTH OPENS: python 26 cm vs you 5 cm, bars growing with ticks */
const GapePanel: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const pN = Math.round(26 * eout(seg(t, T.n26 - 0.05, T.cm + 0.3)));
  const yN = Math.round(5 * seg(t, T.you + 0.1, T.five + 0.15));
  const H = 560, unit = H / 26;
  const bar = (n: number, cx: number, color: string) => (
    <g>
      <rect x={cx - 85} y={300 - n * unit} width={170} height={n * unit} rx={16} fill={color} stroke={INK} strokeWidth={7} />
      {Array.from({length: Math.floor(n / 5)}, (_, i) => <path key={i} d={`M ${cx - 85} ${300 - (i + 1) * 5 * unit} h 34`} stroke={INK} strokeWidth={5} />)}
    </g>);
  return (
    <div style={{position: 'absolute', left: 540, top: 1010, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={880} height={1000} viewBox="-440 -500 880 1000" style={{overflow: 'visible'}}>
        <rect x={-420} y={-480} width={840} height={960} rx={46} fill="#FFFDF6" stroke={INK} strokeWidth={10} />
        <text x={0} y={-395} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={72} fill={INK}>MOUTH OPENS</text>
        <path d="M 0 -340 V 430" stroke={INK} strokeWidth={5} strokeDasharray="18 14" />
        <text x={-200} y={-290} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>PYTHON</text>
        <text x={200} y={-290} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>YOU</text>
        {bar(pN, -200, SK)}{bar(yN, 200, '#FFFFFF')}
        <text x={-200} y={405} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill={pN === 26 ? '#E08A1E' : INK} stroke={INK} strokeWidth={pN === 26 ? 4 : 0} style={{paintOrder: 'stroke'}}>{pN} cm</text>
        <text x={200} y={405} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={92} fill={INK}>{yN} cm</text>
      </svg>
    </div>
  );
};

/** side view of the python's head round the egg: the windpipe slides forward under the food and breathes */
const SnorkelXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  const slide = eio(seg(t, T.windpipe - 0.1, T.food + 0.1));
  const breathing = t > T.food;
  const tipX = lerp(150, -205, slide);
  const puff = breathing ? (Math.sin((t - T.food) * 2 * Math.PI * 1.4) + 1) / 2 : 0;
  return (
    <Panel x={540} y={1000} s={s} label="SNAKE X-RAY">
      {/* head outline (facing left), jaws wide round a big egg */}
      <path d="M 260 -60 Q 120 -210 -150 -190 Q -260 -150 -250 -110 L 60 -60" fill="none" stroke={XB} strokeWidth={8} strokeLinejoin="round" />
      <path d="M 260 60 Q 120 210 -150 200 Q -260 170 -250 130 L 60 70" fill="none" stroke={XB} strokeWidth={8} strokeLinejoin="round" />
      <path d="M 260 -60 L 420 -50 M 260 60 L 420 50" stroke={XB} strokeWidth={8} />
      <ellipse cx={-30} cy={-20} rx={170} ry={120} fill="#FBF6EA" fillOpacity={0.25} stroke={XB} strokeWidth={7} />
      <text x={-30} y={-10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={XB}>FOOD</text>
      {/* windpipe: from the throat forward along the floor of the mouth */}
      <path d={`M 420 140 L 250 140 Q 200 150 ${tipX + 40} 150`} stroke="#7FD0FF" strokeWidth={34} fill="none" strokeLinecap="round" />
      <circle cx={tipX + 30} cy={150} r={20} fill="#16223A" stroke="#7FD0FF" strokeWidth={8} />
      {breathing ? [0, 1, 2].map((i) => {
        const u = ((t - T.food) * 1.4 + i / 3) % 1;
        return <circle key={i} cx={tipX - 20 - u * 120} cy={150 - 20 * Math.sin(u * 6)} r={14 * (1 - u) + 4} fill="#CFEFFF" opacity={0.8 * (1 - u)} />;
      }) : null}
      {breathing ? <ellipse cx={330} cy={150} rx={40 + 14 * puff} ry={26 + 8 * puff} fill="#7FD0FF" fillOpacity={0.35} stroke="#7FD0FF" strokeWidth={5} /> : null}
      <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
    </Panel>
  );
};

/** YOUR throat, side view: when you swallow, a flap shuts the windpipe - breath paused */
const ThroatXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  const shut = eio(seg(t, T.swallow, T.swallow + 0.35));
  const airOn = 1 - shut;
  return (
    <Panel x={540} y={1480} s={s} r={250} size={640} label="YOUR THROAT" rot={2}>
      {/* food pipe (back) and windpipe (front) */}
      <path d="M 60 -320 L 60 320" stroke="#F6A6B8" strokeWidth={60} strokeLinecap="round" opacity={0.55} />
      <path d="M -70 -60 L -70 320" stroke="#7FD0FF" strokeWidth={60} opacity={0.7} />
      <path d="M -150 -320 Q -100 -120 -20 -110 L 60 -110" stroke="#F6A6B8" strokeWidth={60} fill="none" opacity={0.55} />
      {/* the flap */}
      <path d={`M -105 -70 l ${70 * Math.cos((-70 + 70 * shut) * D2R)} ${70 * Math.sin((-70 + 70 * shut) * D2R)}`} stroke={GOLD} strokeWidth={18} strokeLinecap="round" />
      {/* melon chunk sliding down the food pipe */}
      <ellipse cx={lerp(-130, 60, shut)} cy={lerp(-250, -60, shut) + 200 * seg(t, T.swallow + 0.35, T.breath)} rx={44} ry={36} fill="#3F8A33" stroke={INK} strokeWidth={5} />
      {airOn > 0.05 ? [0, 1, 2].map((i) => {
        const u = (t * 1.6 + i / 3) % 1;
        return <circle key={i} cx={-70} cy={300 - u * 330} r={12} fill="#CFEFFF" opacity={0.8 * airOn} />;
      }) : null}
      {shut > 0.5 ? <g transform={`translate(-70 120) scale(${popIn(t, T.stops, 0.3)})`}>
        <circle r={56} fill={RED} stroke={INK} strokeWidth={6} />
        <rect x={-34} y={-11} width={68} height={22} rx={6} fill="#fff" />
      </g> : null}
    </Panel>
  );
};

// ---------- the story over time ----------
type GuyState = {pose: Pose; mood: Mood; stretch: number; blue: number; roll: number; tremble: number; puff: number};
const guyAt = (t: number): GuyState => {
  const base: GuyState = {pose: 'front_calm', mood: 'calm', stretch: 0, blue: 0, roll: 0, tremble: 0, puff: 0};
  if (t < 4.5) return {...base, pose: 'front_worried', mood: 'melon', stretch: 1, blue: 0.25 + 0.75 * seg(t, 1.5, 4.0), roll: 4 * Math.sin(t * 5.5), tremble: 1};
  if (t < T.every - 0.1) return {...base, pose: 'front_worried', mood: 'melon', stretch: 1, blue: 1, roll: 3 * Math.sin(t * 4), tremble: 0.6};
  if (t < POP) {                         // tries a straw snorkel, puffs, the flap shuts
    const p = seg(t, T.swallow, T.breath);
    return {...base, pose: 'front_worried', mood: 'melon', stretch: 1, blue: 1, roll: 2 * Math.sin(t * 20) * p, tremble: 1 + p, puff: p};
  }
  if (t < T.so - 0.05) {                 // BOING: melon out, dizzy
    return {...base, pose: 'front_calm', mood: t < POP + 0.15 ? 'gasp' : 'dizzy', blue: 1 - seg(t, POP, POP + 0.5), roll: 9 * Math.sin((t - POP) * 9) * (1 - seg(t, POP, T.so))};
  }
  if (t < T.fornow - 0.1) return {...base, mood: t > T.slices - 0.1 ? 'chew' : 'happy'};
  return {...base, mood: 'sly', roll: -4 * eio(seg(t, T.fornow - 0.1, T.fornow + 0.2))};
};
/** python state */
const snakeAt = (t: number) => {
  // egg: in the mouth 0..~3.3, bulge slides down the neck until 4.3; then a new egg from 13.3 for the snorkel beat
  let open = 0, egg = 0, bulge = -1, mood: SnakeMood = 'smug', hx = SX - 95, hy = -260, tongue = 0, eggScale = 1;
  if (t < 4.4) {
    open = t < 3.1 ? 0.75 + 0.05 * Math.sin(t * 7) : lerp(0.8, 0, eio(seg(t, 3.1, 3.4)));
    egg = t < 3.3 ? 1 - 0.35 * seg(t, 0, 3.3) : 0;
    bulge = t >= 3.3 ? seg(t, 3.3, 4.4) : -1;
    mood = t < 3.3 ? 'gulp' : 'smug';
  } else if (t < 9.5) {
    mood = t > T.unhinge ? 'smug' : 'calm';
    tongue = Math.max(0, Math.sin((t - 4.4) * 9)) * (Math.sin(t * 1.3) > 0.3 ? 1 : 0);
  } else if (t < 13.4) {                 // a big one opens wide
    open = keysAt([[9.6, 0], [10.1, 1.25], [12.0, 1.25], [12.4, 0]], t);
    mood = t > 12.4 ? 'smug' : 'wide';
  } else if (t < 17.4) {                 // swallows another egg (the snorkel beat)
    open = keysAt([[13.4, 0], [13.75, 0.95], [16.6, 0.85], [17.1, 0]], t);
    egg = t > 13.6 && t < 17.0 ? 1 - 0.4 * seg(t, 13.6, 17.0) : 0;
    bulge = t >= 17.0 ? seg(t, 17.0, 17.9) : -1;
    mood = 'gulp';
  } else if (t < POP) {
    bulge = t < 17.9 ? seg(t, 17.0, 17.9) : -1;
    mood = 'smug';
  } else if (t < T.so) {
    mood = 'wide'; hy = -260 - 30 * Math.sin(Math.PI * seg(t, POP, POP + 0.5));     // ducks the flying melon
  } else {
    mood = t > T.fornow ? 'wide' : 'smug';
    tongue = Math.max(0, Math.sin((t - T.so) * 9));
  }
  return {open, egg, bulge, mood, hx, hy, tongue, eggScale};
};

export const SnakeScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: 38, y: -240, k: 3.0}, {t: 2.6, x: 32, y: -240, k: 3.1},           // both heads big: his melon face, the python's egg gulp
    {t: 3.0, x: GX, y: -215, k: 3.6}, {t: 4.25, x: GX, y: -215, k: 3.75},          // push in on his blue face
    {t: 4.6, x: SX - 70, y: -230, k: 2.6}, {t: 9.3, x: SX - 70, y: -235, k: 2.75},  // the python (behind the jaw X-ray)
    {t: 9.6, x: SX - 90, y: -250, k: 3.2}, {t: 13.3, x: SX - 90, y: -250, k: 3.3}, // jaw wide open (behind the counter)
    {t: 13.6, x: SX - 80, y: -240, k: 2.9}, {t: 17.2, x: SX - 80, y: -240, k: 3.0}, // second egg, snorkel X-ray
    {t: 17.5, x: GX + 20, y: -230, k: 3.3}, {t: 19.0, x: GX + 20, y: -235, k: 3.45},// the straw, his throat
    {t: 19.4, x: 40, y: -240, k: 2.6}, {t: 21.2, x: 40, y: -240, k: 2.7},          // BOING, dizzy, slices
    {t: 21.6, x: 38, y: -240, k: 3.0},                                             // "for now" - he eyes the whole melon
  ], t);
  const sh = shake(t, hit(t, POP, 12, 6) + (t < 4.4 ? 1.2 : 0) + (t > T.swallow && t < POP ? 1.5 * seg(t, T.swallow, T.breath) : 0));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t);
  const h = headOf(g.pose);
  const trem = g.tremble * 1.6 * Math.sin(t * 2 * Math.PI * 17);
  const headX = GX + h.hx + trem, headY = h.hy;
  const sn = snakeAt(t);
  // the melon that shoots out (world space)
  const flyU = seg(t, POP, POP + 0.9);
  const flyMelon = t > POP && t < POP + 0.9 ? {x: headX + 40 + 260 * flyU, y: headY + 60 - 520 * flyU + 600 * flyU * flyU, rot: 400 * flyU} : null;
  const strawS = popIn(t, T.every - 0.1, 0.25) * (t < POP ? 1 : 0);
  const sliceS = popIn(t, T.so - 0.05, 0.3);
  const wholeMelonS = popIn(t, T.fornow - 0.25, 0.3);
  // inserts
  const jawS = popIn(t, 4.5, 0.35) * (1 - seg(t, 9.3, 9.52));
  const gapeS = popIn(t, T.big - 0.1, 0.35) * (1 - seg(t, 13.25, 13.45));
  const snorkS = popIn(t, T.slides - 0.15, 0.35) * (1 - seg(t, 17.2, 17.42));
  const throatS = popIn(t, T.every + 0.1, 0.3) * (1 - seg(t, T.breath + 0.05, POP + 0.05));
  // labels
  const noAir = pulse(t, T.suffocate, 1.2);
  const halfS = pulse(t, T.halfway + 0.05, 0.75);
  const notS = pulse(t, T.unhinge, 1.0);
  const stretchS = pulse(t, T.stretches, 0.6);
  const snorkS2 = pulse(t, T.snorkel, 0.5);
  const pausedS = pulse(t, T.stops, 0.55);
  const boingS = pulse(t, POP + 0.05, 0.5);
  const slicesS = pulse(t, T.slices, 0.6);
  const nowS = pulse(t, T.fornow + 0.1, 0.55);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#A9D7EE'}}>
      <Defs />
      <Layer cam={cam} z={3200} paper={false}><Backdrop t={t} /></Layer>
      <Layer cam={cam} z={1900}><Hills /></Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Ground />
        <CastShadow x={GX} w={150} /><CastShadow x={SX} w={300} />
      </Layer>
      <Layer cam={cam} z={1000}>
        {wholeMelonS > 0.01 ? <W><g transform={`translate(${GX + 115} -40) scale(${wholeMelonS})`}><Melon x={0} y={0} rx={62} ry={46} /></g></W> : null}
        <Python x={SX} hx={sn.hx} hy={sn.hy} t={t} open={sn.open} mood={sn.mood} egg={sn.egg} bulge={sn.bulge} tongue={sn.tongue} eggScale={sn.eggScale} />
        <Guy pose={g.pose} x={GX + trem} y={0} t={t} breathe={false} />
        <GuyHead x={headX} y={headY} t={t} mood={g.mood} blue={g.blue} roll={g.roll} stretch={g.stretch} puff={g.puff} />
        {strawS > 0.01 ? <W><g transform={`translate(${headX + 66} ${headY + 60}) rotate(-28) scale(${strawS})`}>
          <rect x={-9} y={-130} width={18} height={150} rx={8} fill="#fff" stroke={INK} strokeWidth={5} />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M -9 ${-120 + i * 36} L 9 ${-104 + i * 36}`} stroke={RED} strokeWidth={6} />)}
        </g></W> : null}
        <Slice x={headX + 70} y={headY + 70} s={sliceS} rot={-20} bite={seg(t, T.slices, T.slices + 0.15)} />
        {flyMelon ? <W><Melon x={flyMelon.x} y={flyMelon.y} rx={62} ry={50} rot={flyMelon.rot} /></W> : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 5 + (i * 2 * Math.PI) / 3, on = t > POP + 0.15 && t < T.so ? 1 - seg(t, T.so - 0.25, T.so) : 0;
          return <Star key={i} x={headX + Math.cos(a) * 80} y={headY - 78 + Math.sin(a) * 16} s={on * 0.55} rot={t * 200} />;
        })}
        <Sweat x={headX + 70} y={headY - 40} s={t < 4.4 || (t > T.every && t < POP) ? 0.9 : 0} />
        <Txt x={cam0.x} y={headY - 120} s={noAir} text="NO AIR" size={72} rot={-5} fill={RED} />
        <Txt x={headX} y={headY + 175} s={halfS} text="HALFWAY" size={52} rot={4} fill={GOLD} />
        <Txt x={cam0.x} y={headY - 110} s={snorkS2} text="SNORKEL" size={60} rot={-5} fill={GOLD} />
        <Txt x={cam0.x} y={headY - 120} s={pausedS} text="BREATH PAUSED" size={50} rot={-4} fill={RED} />
        <Txt x={cam0.x} y={headY - 125} s={boingS} text="BOING" size={84} rot={-8} fill={GOLD} />
        <Txt x={cam0.x} y={headY - 125} s={slicesS} text="SLICES" size={66} rot={-5} fill={GOLD} />
        <Txt x={cam0.x} y={headY - 125} s={nowS} text="FOR NOW..." size={58} rot={4} />
      </Layer>
      <JawXRay t={t} s={jawS} />
      <Sticker text="NOT UNHINGED" s={notS} x={540} y={1530} rot={2} bg={GOLD} size={60} />
      <Sticker text="STRETCH" s={stretchS} x={540} y={1530} rot={-2} bg={GOLD} size={64} />
      <GapePanel t={t} s={gapeS} />
      <SnorkelXRay t={t} s={snorkS} />
      <ThroatXRay t={t} s={throatS} />
      {thumb ? null : <>
        <HookTitle t={t} text="HE SWALLOWED A MELON" hi="MELON" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so + 0.05} until={21.85} text="What should he swallow next?" />
      </>}
    </AbsoluteFill>
  );
};

export const SnakeVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks: Cue[] = [];
  for (let i = 1; i <= 13; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.n26 - 0.05, T.cm + 0.3, Math.pow(i / 13, 0.6)), db: -27});
  for (let i = 1; i <= 5; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.you + 0.1, T.five + 0.15, i / 5), db: -25});
  const cues: Cue[] = [
    {f: 'gulp.wav', at: 0.0, db: -12}, {f: 'twang.mp3', at: 0.0, db: -20, to: 0.5}, {f: 'strain.mp3', at: 0.25, db: -26, to: 2.4},
    {f: 'gulp.wav', at: 1.3, db: -22}, {f: 'zap.wav', at: T.suffocate - 0.05, db: -24}, {f: 'pop.wav', at: T.halfway + 0.05, db: -24},
    {f: 'gulp.wav', at: 3.35, db: -18}, {f: 'whoosh.wav', at: 4.45, db: -26}, {f: 'zap.wav', at: 4.5, db: -26},
    {f: 'pop.wav', at: T.unhinge, db: -22}, {f: 'tick.wav', at: T.chin, db: -18}, {f: 'pop.wav', at: T.joined, db: -24},
    {f: 'strain.mp3', at: T.stretches - 0.1, db: -24, to: 0.7}, {f: 'pop.wav', at: T.stretches, db: -22},
    {f: 'whoosh.wav', at: 9.5, db: -26}, {f: 'hiss.wav', at: 9.9, db: -24, to: 1.0}, ...ticks, {f: 'ding.mp3', at: T.cm + 0.3, db: -22}, {f: 'pop.wav', at: T.five + 0.15, db: -20},
    {f: 'whoosh.wav', at: 13.45, db: -26}, {f: 'zap.wav', at: T.slides - 0.15, db: -26}, {f: 'squeak.wav', at: T.windpipe, db: -26}, {f: 'bubbles.wav', at: T.food, db: -26, to: 0.9},
    {f: 'ding.mp3', at: T.snorkel, db: -22}, {f: 'gulp.wav', at: 17.0, db: -20},
    {f: 'whoosh.wav', at: 17.35, db: -26}, {f: 'pop.wav', at: T.every - 0.1, db: -24}, {f: 'gulp.wav', at: T.swallow, db: -18}, {f: 'tick.wav', at: T.swallow + 0.3, db: -14},
    {f: 'strain.mp3', at: T.stops - 0.2, db: -22, to: 0.6},
    {f: 'twang.mp3', at: POP, db: -14}, {f: 'pop.wav', at: POP, db: -14}, {f: 'whoosh.wav', at: POP + 0.05, db: -18}, {f: 'chirp.wav', at: POP + 0.3, db: -28},
    {f: 'crowd_laugh.wav', at: POP + 0.2, db: -32, to: 1.3},
    {f: 'pop.wav', at: T.so, db: -24}, {f: 'peck.wav', at: T.slices + 0.02, db: -20, to: 0.25}, {f: 'pop.wav', at: T.fornow - 0.2, db: -24},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<SnakeScene t={0} />}>
        <SnakeScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="snake/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const SnakeWide: React.FC = () => <WideFit.Provider value={0.72}><SnakeVideo /></WideFit.Provider>;
