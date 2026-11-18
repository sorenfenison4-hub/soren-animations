// "What if you had a bat's ears?" - owl formula (CLAUDE.md, Growth), niche: animal powers.
// (1) the power is ON HIM at frame 0: huge bat ears on his round head, mouth wide open screaming, sonar rings flying
// out and lighting up the dark cave; (2) the co-star (a smug bat hanging upside down next to him) does it with ease;
// (3) two X-rays: the BAT EAR (a tiny muscle shuts the ear before every scream, then opens for the echo), then YOUR EAR
// (no muscle: the scream goes straight through, hair cells flatten, HEARING drops: DANGER); (4) live counters (DECIBELS
// 0 -> 140 = jet engine, SCREAMS A SECOND 0 -> 190); (5) the comedy hit is made by the power itself (he tries the
// 190-a-second buzz, it bounces back into his own giant ears, they flap, he spins dizzy); (6) a sticker word every
// ~1.5 s and a cut every 2-3 s; (7) his dumb-but-easy workaround (he pulls the light string) - the bat switches it off
// again and he screams = frame 0; (8) comment bubble opener + either/or comment ask.
// Everything is drawn in code; the guy's body is the library sprite, his head is drawn here so the ears can move.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.12; times are video time). Last word ends ~20.65 s; + 0.85 s for the push.
export const DURATION = 21.5;
export const T = {
  ears: 0.81, scream: 1.81, see: 2.46, loud: 3.10, deaf: 3.92,           // "Get a bat's ears, and you'd scream to see... loud enough to go deaf."
  some: 4.56, bats: 4.85, jet: 6.35, engine: 6.56,                        // "Some bats scream as loud as a jet engine."
  up: 7.15, n190: 7.58, second: 9.15,                                     // "Up to 190 times a second."
  tiny: 10.03, muscle: 10.31, shuts: 10.71, every: 11.96, scream2: 12.24, // "A tiny muscle shuts their ears before every scream."
  without: 13.01, one: 13.60, hurt: 14.46, good: 15.24,                   // "Without it, one scream could hurt yours for good."
  so: 15.97, turns: 16.83, light: 17.33,                                  // "So he just turns on the light."
  octopus: 17.83, shark: 19.05, comment: 19.99,                           // "Octopus arms or shark teeth? Comment below."
  cta: 14.95,
};

const GOLD = '#FFD43B', RED = '#E2453C', PINK = '#EFA3B6', PINK2 = '#D9788F';
const FUR = '#7B6A93', FUR2 = '#5E4F75', WING = '#4A3D60', RING = '#FFE27A';
const GX = -105;                   // guy's feet
const BX = 95;                     // bat's centre line
const LEDGE = -480;                // the bat's feet grip this rock
const OFF = 20.47, ON = 17.33;     // the light: on at ON, the bat switches it off at OFF

// when the guy screams (mouth wide, rings): [start, end, ring spacing]
const G_SCREAMS: [number, number, number][] = [[-1.2, 1.55, 0.3], [1.8, 2.75, 0.3], [8.95, 9.4, 0.07], [20.78, 23, 0.3]];
// when the bat screams at the moth (directed rings): [start, end, spacing]
const B_SCREAMS: [number, number, number][] = [[4.95, 6.7, 0.32], [7.3, 8.55, 0.11]];
const EAT = 8.6;                   // the bat snaps the moth

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
const inAny = (t: number, list: [number, number, number][]) => list.some(([a, b]) => t >= a && t < b);
const emits = (list: [number, number, number][], t: number) => {
  const out: number[] = [];
  for (const [a, b, sp] of list) for (let e = a; e < b && e <= t; e += sp) out.push(e);
  return out;
};
const lightAt = (t: number) => eout(seg(t, ON, ON + 0.08)) * (1 - seg(t, OFF, OFF + 0.06));

const headOf = (pose: Pose) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s, hy: (m.head[1] - m.feet[1]) * s};
};
const HEADS: Record<string, {hx: number; hy: number}> = {};
const headAt = (pose: Pose) => (HEADS[pose] ??= headOf(pose));
const H0 = headAt('front_calm');
const HX = GX + H0.hx, HY = H0.hy;
const MOUTH = {x: HX, y: HY + 30};
const BHEAD = {x: BX, y: LEDGE + 150};
const BMOUTH = {x: BX - 6, y: BHEAD.y + 22};
// the light bulb hangs between them; its pull string ends at his raised hand (front_wave)
const BULB = {x: GX + 100, y: -600};
const STRING_END = {x: GX + 100, y: -262};

// the moth: flutters near the ceiling (right), the bat eats it at EAT; a new one flutters in for the loop
const mothAt = (t: number) => {
  const tt = t > 17 ? t - 21.5 : t;                  // after 17 s the path is the frame-0 path shifted (loops)
  return {x: 230 + 50 * Math.sin(tt * 1.7) + (t > 7.3 && t < EAT ? -lerp(0, 90, seg(t, 7.3, EAT)) : 0),
    y: -560 + 30 * Math.sin(tt * 2.9) + (t > 7.3 && t < EAT ? lerp(0, 150, seg(t, 7.3, EAT)) : 0)};
};
const mothVisible = (t: number) => t < EAT || t > 17.9;

const Defs: React.FC = () => (
  <W><defs>
    <radialGradient id="bFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <radialGradient id="bGlow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF3B0" stopOpacity={0.95} /><stop offset="0.45" stopColor="#FFE27A" stopOpacity={0.35} /><stop offset="1" stopColor="#FFE27A" stopOpacity={0} /></radialGradient>
    <radialGradient id="bFur" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#9A89B2" /><stop offset="1" stopColor={FUR2} /></radialGradient>
  </defs></W>
);

// ---------- the cave ----------
const mix = (a: string, b: string, u: number) => {
  const p = (s: string) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], u)).toString(16).padStart(2, '0')).join('');
};
const Backdrop: React.FC<{L: number}> = ({L}) => (
  <W>
    <rect x={-4000} y={-5000} width={9000} height={8000} fill={mix('#332E52', '#B39C80', L)} />
    {/* far rock columns */}
    {[-900, -420, 380, 860].map((x, i) => (
      <path key={i} d={`M ${x - 140} 400 Q ${x - 170} -300 ${x - 90} -1400 L ${x + 110} -1400 Q ${x + 170} -300 ${x + 130} 400 Z`} fill={mix('#423B66', '#C7B192', L)} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    ))}
  </W>
);
// stalactites (ceiling) + stalagmites (floor), lit by the echo of each scream
const STALS: {x: number; y: number; h: number; up?: boolean}[] = [
  {x: -330, y: -760, h: 170}, {x: -230, y: -760, h: 110}, {x: -60, y: -760, h: 190}, {x: 40, y: -760, h: 120},
  {x: 260, y: -760, h: 150}, {x: 360, y: -760, h: 210}, {x: -420, y: 0, h: 130, up: true}, {x: 330, y: 0, h: 160, up: true}, {x: 410, y: 0, h: 90, up: true},
];
const echoGlow = (t: number, x: number, y: number) => {
  let g = 0;
  for (const e of emits(G_SCREAMS, t)) {
    const r = (t - e) * 900, d = Math.hypot(x - MOUTH.x, y - MOUTH.y);
    if (r < d - 80) continue;
    g = Math.max(g, r < d ? 1 - (d - r) / 80 : Math.exp(-(r - d) / 260));
  }
  return clamp(g);
};
const Cave: React.FC<{t: number; L: number}> = ({t, L}) => (
  <W>
    {/* ceiling */}
    <path d="M -4000 -5000 H 5000 V -770 Q 300 -730 0 -775 Q -300 -720 -4000 -770 Z" fill={mix('#2A2542', '#8F7B63', L)} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    {/* floor */}
    <path d="M -4000 0 Q -200 -14 200 0 Q 600 12 5000 0 V 3000 H -4000 Z" fill={mix('#3B3557', '#A08A6C', L)} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    {Array.from({length: 26}, (_, i) => <circle key={i} cx={-700 + rnd(i * 3) * 1400} cy={40 + rnd(i * 7) * 500} r={5 + rnd(i) * 6} fill={mix('#4A4370', '#8E785C', L)} />)}
    {STALS.map((s, i) => {
      const tipY = s.up ? s.y - s.h : s.y + s.h;
      const g = L > 0.5 ? 0 : echoGlow(t, s.x, tipY);
      const d = `M ${s.x - s.h * 0.28} ${s.y} Q ${s.x - 6} ${(s.y + tipY) / 2} ${s.x} ${tipY} Q ${s.x + 6} ${(s.y + tipY) / 2} ${s.x + s.h * 0.28} ${s.y} Z`;
      return (
        <g key={i}>
          <path d={d} fill={mix(mix('#4C4573', '#A99272', L), '#FFE9A0', g * 0.7)} stroke={g > 0.05 ? mix('#141414', '#FFD43B', g) : INK} strokeWidth={7 + 5 * g} strokeLinejoin="round" />
        </g>
      );
    })}
    {/* the ledge the bat hangs from */}
    <path d={`M ${BX - 120} -775 L ${BX - 110} ${LEDGE - 10} Q ${BX - 40} ${LEDGE + 12} ${BX + 40} ${LEDGE - 4} Q ${BX + 110} ${LEDGE - 20} ${BX + 170} -775 Z`} fill={mix('#352F55', '#8F7B63', L)} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </W>
);

// ---------- sound rings ----------
/** rings out of a mouth: full circles (dir undefined) or arcs aimed at `dir` (deg) */
const Rings: React.FC<{t: number; list: [number, number, number][]; at: {x: number; y: number}; speed?: number; maxR?: number; dir?: number; spread?: number; w?: number}> =
  ({t, list, at, speed = 900, maxR = 620, dir, spread = 40, w = 11}) => (
    <W><g>
      {emits(list, t).map((e, i) => {
        const r = (t - e) * speed;
        if (r < 6 || r > maxR) return null;
        const op = 1 - r / maxR;
        if (dir === undefined) return <circle key={i} cx={at.x} cy={at.y} r={r} fill="none" stroke={RING} strokeWidth={w * (0.8 + 0.7 * op)} opacity={0.25 + 0.75 * op} />;
        const a0 = ((dir - spread) * Math.PI) / 180, a1 = ((dir + spread) * Math.PI) / 180;
        const p0 = {x: at.x + r * Math.cos(a0), y: at.y + r * Math.sin(a0)}, p1 = {x: at.x + r * Math.cos(a1), y: at.y + r * Math.sin(a1)};
        return <path key={i} d={`M ${p0.x} ${p0.y} A ${r} ${r} 0 0 1 ${p1.x} ${p1.y}`} fill="none" stroke={RING} strokeWidth={w * (0.6 + 0.6 * op)} strokeLinecap="round" opacity={op} />;
      })}
    </g></W>
  );

// ---------- the guy's head, drawn in code: huge bat ears ----------
type HeadMood = 'calm' | 'scream' | 'pain' | 'dizzy' | 'happy' | 'worried' | 'shrug';
const GuyHead: React.FC<{t: number; x: number; y: number; mood: HeadMood; earRot: number; earBuzz: number; rot?: number}> = ({t, x, y, mood, earRot, earBuzz, rot = 0}) => {
  const R = HEAD_R;
  const ear = (sd: number) => {
    const wob = earBuzz * 9 * Math.sin(t * 70 + sd);
    return (
      <g transform={`translate(${sd * 36} ${-R + 20}) rotate(${sd * (24 + earRot) + wob})`}>
        <path d="M -38 14 Q -44 -50 -4 -124 L 4 -130 Q 18 -84 26 -62 Q 18 -50 32 -34 Q 26 -20 38 -6 Q 34 6 40 14 Z" fill="url(#bFur)" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        <path d="M -22 6 Q -26 -50 -2 -104 Q 14 -52 22 6 Z" fill={PINK} stroke={PINK2} strokeWidth={4} strokeLinejoin="round" />
        <path d="M -14 -24 q 10 -7 22 0 M -10 -54 q 8 -6 16 0" stroke={PINK2} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>
    );
  };
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {ear(-1)}{ear(1)}
      <circle r={R + 1} fill="url(#bFace)" stroke={INK} strokeWidth={6.5} />
      {/* eyes */}
      {[-1, 1].map((sd) => {
        const ex = sd * 24, ey = -10;
        if (mood === 'dizzy') return <path key={sd} d={`M ${ex} ${ey} m -2 0 a 3 3 0 1 1 4 2 a 7 7 0 1 1 -9 -6 a 11 11 0 1 1 15 10`} transform={`rotate(${t * 600 * sd} ${ex} ${ey})`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
        if (mood === 'pain') return <path key={sd} d={`M ${ex + 10 * sd} ${ey - 8} L ${ex - 8 * sd} ${ey} L ${ex + 10 * sd} ${ey + 8}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
        if (mood === 'happy') return <path key={sd} d={`M ${ex - 11} ${ey + 3} Q ${ex} ${ey - 9} ${ex + 11} ${ey + 3}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
        const big = mood === 'scream' || mood === 'worried' ? 1.15 : 1;
        return (
          <g key={sd}>
            <ellipse cx={ex} cy={ey} rx={12 * big} ry={15 * big} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
            <circle cx={ex + (mood === 'scream' ? 0 : 2)} cy={ey + 2} r={6.5} fill={INK} />
            <circle cx={ex - 1} cy={ey - 2} r={2.4} fill="#fff" />
          </g>
        );
      })}
      {mood === 'scream' || mood === 'worried' ? [-1, 1].map((sd) => <path key={sd} d={`M ${sd * 12} -34 L ${sd * 36} ${mood === 'scream' ? -40 : -30}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />) : null}
      {/* mouth */}
      <g transform="translate(0 28)">
        {mood === 'calm' ? <path d="M -16 -2 Q 0 9 16 -2" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'happy' ? <path d="M -20 -4 Q 0 18 20 -4 Z" fill="#E4677A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
        {mood === 'scream' ? <g><ellipse cx={0} cy={6} rx={19 + 2 * Math.sin(t * 50)} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={18} rx={10} ry={6} fill="#E4677A" /></g> : null}
        {mood === 'worried' ? <ellipse cx={0} cy={3} rx={9} ry={10} fill="#5A2328" stroke={INK} strokeWidth={5} /> : null}
        {mood === 'pain' ? <path d="M -18 4 L -9 -3 L 0 4 L 9 -3 L 18 4" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        {mood === 'dizzy' ? <path d="M -16 4 Q -8 -4 0 4 Q 8 12 16 4" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'shrug' ? <path d="M -14 2 Q 0 -4 14 2" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /> : null}
      </g>
    </g></W>
  );
};

// ---------- the bat: hangs upside down from the ledge (feet up, ears down), face drawn upright ----------
type BatMood = 'smug' | 'scream' | 'chew' | 'squint' | 'laugh' | 'grumpy';
const Bat: React.FC<{t: number; mood: BatMood; open: number; cover: number}> = ({t, mood, open, cover}) => {
  const sway = mood === 'laugh' ? 5 * Math.sin(t * 30) : 3 * Math.sin(t * 1.6);
  const hx = BHEAD.x - BX, hy = BHEAD.y - LEDGE;
  // wings: folded like a cloak (open 0) -> spread (open 1); a flap while hunting
  const flap = open > 0.5 ? 14 * Math.sin(t * 40) : 0;
  const wing = (sd: number) => {
    const tipX = sd * lerp(52, 200, open), tipY = lerp(120, 30 + flap, open);
    return (
      <path d={`M ${sd * 8} 30 L ${tipX} ${tipY - lerp(70, 30, open)} Q ${sd * lerp(56, 170, open)} ${lerp(150, 80, open) + flap} ${sd * lerp(46, 130, open)} ${lerp(160, 90, open) + flap} Q ${sd * lerp(40, 90, open)} ${lerp(150, 110, open) + flap} ${sd * lerp(34, 60, open)} ${lerp(170, 130, open)} Q ${sd * 26} 150 ${sd * 14} 120 Z`}
        fill={WING} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    );
  };
  // the covering wing (light on): one wing swings over the eyes
  const shield = cover > 0.01 ? (
    <path transform={`rotate(${lerp(60, 0, cover)} 50 40)`} d={`M 40 40 Q 70 ${hy - 50} ${hx + 50} ${hy - 22} Q ${hx + 10} ${hy - 4} ${hx - 52} ${hy - 20} Q ${hx - 30} ${hy - 4} ${hx - 44} ${hy + 6} Q 10 ${hy - 40} 10 40 Z`}
      fill={WING} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  ) : null;
  const eye = (sd: number) => {
    const ex = hx + sd * 17, ey = hy - 8;
    if (mood === 'squint' || mood === 'laugh') return <path key={sd} d={`M ${ex - 10} ${ey - 2} Q ${ex} ${ey + 7} ${ex + 10} ${ey - 2}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={11} ry={13} fill="#fff" stroke={INK} strokeWidth={4.5} />
        <circle cx={ex - 2 * (mood === 'scream' ? 0 : 1)} cy={ey + 2} r={5.5} fill={INK} />
        {mood === 'smug' || mood === 'grumpy' || mood === 'chew' ? <path d={`M ${ex - 11} ${ey - 2} A 11 13 0 0 1 ${ex + 11} ${ey - 2} Z`} fill={FUR} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
        {mood === 'grumpy' ? <path d={`M ${ex - 12 * sd} ${ey - 20} L ${ex + 10 * sd} ${ey - 13}`} stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
      </g>
    );
  };
  return (
    <W><g transform={`translate(${BX} ${LEDGE}) rotate(${sway} 0 0)`}>
      {/* feet gripping the ledge */}
      {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 10} 26 L ${sd * 12} 0 M ${sd * 12} 0 l ${-6 * sd} -8 M ${sd * 12} 0 l ${6 * sd} -8`} stroke={INK} strokeWidth={6} strokeLinecap="round" />)}
      {wing(-1)}{wing(1)}
      {/* body */}
      <ellipse cx={0} cy={80} rx={44} ry={66} fill="url(#bFur)" stroke={INK} strokeWidth={7} />
      <path d="M -20 50 q 20 12 40 0 M -16 82 q 16 10 32 0" stroke={FUR2} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* ears point down (it hangs upside down) */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${hx + sd * 26} ${hy + 18}) rotate(${sd * -35})`}>
          <path d="M -18 -8 Q -20 40 0 78 Q 20 40 18 -8 Z" fill="url(#bFur)" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -9 -2 Q -10 32 0 58 Q 10 32 9 -2 Z" fill={PINK} />
        </g>
      ))}
      {/* head */}
      <circle cx={hx} cy={hy} r={46} fill="url(#bFur)" stroke={INK} strokeWidth={7} />
      <ellipse cx={hx} cy={hy + 10} rx={30} ry={24} fill="#A796BE" />
      {eye(-1)}{eye(1)}
      {/* nose + mouth (below the eyes: face drawn upright) */}
      <path d={`M ${hx - 6} ${hy + 6} L ${hx + 6} ${hy + 6} L ${hx} ${hy + 12} Z`} fill={INK} />
      {mood === 'scream' ? <g><ellipse cx={hx} cy={hy + 27} rx={12} ry={11} fill="#5A2328" stroke={INK} strokeWidth={4.5} />
        <path d={`M ${hx - 8} ${hy + 18} l 3 6 l 3 -6 M ${hx + 2} ${hy + 18} l 3 6 l 3 -6`} fill="#fff" stroke={INK} strokeWidth={2} /></g> : null}
      {mood === 'smug' ? <path d={`M ${hx - 12} ${hy + 22} Q ${hx + 2} ${hy + 30} ${hx + 14} ${hy + 18}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
      {mood === 'grumpy' || mood === 'squint' ? <path d={`M ${hx - 12} ${hy + 27} Q ${hx} ${hy + 19} ${hx + 12} ${hy + 27}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
      {mood === 'laugh' ? <path d={`M ${hx - 14} ${hy + 18} Q ${hx} ${hy + 40} ${hx + 14} ${hy + 18} Z`} fill="#7A2A36" stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      {mood === 'chew' ? <g><ellipse cx={hx} cy={hy + 24} rx={10} ry={5 + 4 * Math.abs(Math.sin(t * 22))} fill="#5A2328" stroke={INK} strokeWidth={4} />
        <path d={`M ${hx + 16} ${hy + 24} q 10 -6 18 2 q -8 6 -18 -2`} fill="#E9E1C8" stroke={INK} strokeWidth={3} /></g> : null}
      {/* little fangs on smug */}
      {mood === 'smug' ? <path d={`M ${hx - 6} ${hy + 24} l 3 7 l 3 -6`} fill="#fff" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" /> : null}
      {shield}
    </g></W>
  );
};

const Moth: React.FC<{t: number}> = ({t}) => {
  if (!mothVisible(t)) return null;
  const p = mothAt(t), f = Math.abs(Math.sin(t * 36));
  return (
    <W><g transform={`translate(${p.x} ${p.y})`}>
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 18} cy={-4} rx={18} ry={12 * (0.3 + 0.7 * f)} fill="#E8DDC4" stroke={INK} strokeWidth={4} transform={`rotate(${sd * 20} ${sd * 18} -4)`} />)}
      <ellipse rx={7} ry={14} fill="#B49C7A" stroke={INK} strokeWidth={4} />
      <circle cx={-3} cy={-8} r={2.5} fill={INK} /><circle cx={3} cy={-8} r={2.5} fill={INK} />
    </g></W>
  );
};

const LightBulb: React.FC<{t: number; L: number; pull: number}> = ({t, L, pull}) => (
  <W><g>
    {L > 0.01 ? <circle cx={BULB.x} cy={BULB.y + 40} r={520} fill="url(#bGlow)" opacity={L} /> : null}
    <path d={`M ${BULB.x} -780 V ${BULB.y}`} stroke={INK} strokeWidth={6} />
    <rect x={BULB.x - 16} y={BULB.y} width={32} height={26} rx={4} fill="#9AA0A8" stroke={INK} strokeWidth={5} />
    <path d={`M ${BULB.x - 24} ${BULB.y + 40} A 30 34 0 1 0 ${BULB.x + 24} ${BULB.y + 40} Q ${BULB.x + 18} ${BULB.y + 26} ${BULB.x} ${BULB.y + 26} Q ${BULB.x - 18} ${BULB.y + 26} ${BULB.x - 24} ${BULB.y + 40} Z`}
      fill={L > 0.5 ? '#FFF2A8' : '#D8DCE2'} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {/* pull string with a bead */}
    <path d={`M ${BULB.x + 22} ${BULB.y + 20} Q ${BULB.x + 30 + 4 * Math.sin(t * 2)} ${(BULB.y + STRING_END.y) / 2} ${STRING_END.x} ${STRING_END.y + pull}`} stroke={INK} strokeWidth={3.5} fill="none" />
    <circle cx={STRING_END.x} cy={STRING_END.y + pull + 6} r={8} fill={GOLD} stroke={INK} strokeWidth={4} />
  </g></W>
);

// ---------- inserts (screen space) ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;

/** a live counter card (screen space) */
const Counter: React.FC<{t: number; at: number; s: number; value: number; label: string; done: boolean; icon: React.ReactNode; top?: number; doneAt: number}> = ({t, s, value, label, done, icon, top = 1450, doneAt}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s * (done ? 1 + 0.08 * Math.max(0, 1 - (t - doneAt) * 4) : 1)})`,
    background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '8px 32px 12px', fontFamily: FONT, color: INK,
    display: 'flex', alignItems: 'center', gap: 24, whiteSpace: 'nowrap'}}>
    {icon}
    <div>
      <div style={{fontWeight: 900, fontSize: 120, lineHeight: 1, color: done ? RED : INK}}>{value}</div>
      <div style={{fontWeight: 900, fontSize: 40}}>{label}</div>
    </div>
  </div>
) : null;
const JetIcon = () => (
  <svg width={150} height={100} viewBox="-75 -50 150 100">
    <path d="M -70 0 Q -40 -14 30 -12 L 60 -4 Q 72 0 60 4 L 30 12 Q -40 14 -70 0 Z" fill="#E7EBF0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -10 -10 L 20 -46 L 34 -46 L 22 -10 Z M -10 10 L 20 46 L 34 46 L 22 10 Z M -60 -4 L -72 -30 L -60 -30 L -44 -6 Z" fill="#C9D1DA" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 26 -6 h 12 M 26 6 h 12" stroke={INK} strokeWidth={4} />
  </svg>
);
const SpeakerIcon: React.FC<{t: number}> = ({t}) => (
  <svg width={110} height={100} viewBox="-55 -50 110 100">
    <path d="M -46 -16 H -26 L 0 -38 V 38 L -26 16 H -46 Z" fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => <path key={i} d={`M ${12 + i * 14} -${18 + i * 8} Q ${24 + i * 16} 0 ${12 + i * 14} ${18 + i * 8}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.4 + 0.6 * Math.abs(Math.sin(t * 9 - i))} />)}
  </svg>
);

const XFrame: React.FC<{id: string; R: number; children: React.ReactNode}> = ({id, R, children}) => (
  <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
    <clipPath id={id}><circle r={R} /></clipPath>
    <circle r={R + 18} fill={INK} />
    <g clipPath={`url(#${id})`}>
      <rect x={-450} y={-450} width={900} height={900} fill="#16223A" />
      {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
      {children}
    </g>
    <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
  </svg>
);

/**
 * Inside the ear (side cut): funnel + canal on the left, eardrum, three tiny bones, the snail (cochlea) on the right,
 * hair cells in a strip below. shut 0..1 = the muscle pulls the bones off the drum. wave: {x, amp} a sound pulse in the
 * canal (x from -330 to 220; it stops at the drum when shut). hairs 0..1 = flattened.
 */
const EarCut: React.FC<{t: number; shut: number; muscle: boolean; waves: {x: number; amp: number; col: string}[]; hairs: number; snail: number}> = ({t, shut, muscle, waves, hairs, snail}) => {
  const cy = -90;
  const lift = -26 * shut;
  return (
    <g>
      {/* funnel + canal */}
      <path d={`M -360 ${cy - 130} Q -250 ${cy - 40} -170 ${cy - 34} H -40 V ${cy + 34} H -170 Q -250 ${cy + 40} -360 ${cy + 130}`} fill="#3A2F4A" stroke="#EFA3B6" strokeWidth={8} strokeLinejoin="round" />
      {/* eardrum */}
      <ellipse cx={-34} cy={cy} rx={10} ry={44} fill={PINK} stroke="#FFD3DE" strokeWidth={5} />
      {/* bones (chain): hammer on the drum, anvil, stirrup into the snail */}
      <g transform={`translate(0 ${lift})`}>
        <path d={`M -24 ${cy - 26} Q 0 ${cy - 40} 18 ${cy - 22} L 10 ${cy + 4} Q -6 ${cy - 8} -24 ${cy + 10} Z`} fill="#F4EBD6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M 14 ${cy - 24} Q 40 ${cy - 34} 52 ${cy - 10} L 40 ${cy + 8} Q 30 ${cy - 6} 14 ${cy - 4} Z`} fill="#F4EBD6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M 48 ${cy - 8} L 86 ${cy - 22} L 92 ${cy + 16} L 52 ${cy + 8} Z`} fill="none" stroke="#F4EBD6" strokeWidth={8} strokeLinejoin="round" />
      </g>
      {/* gap mark when shut */}
      {shut > 0.5 ? <path d={`M -26 ${cy + 16} L 4 ${cy + 16}`} stroke={RED} strokeWidth={6} strokeDasharray="6 6" /> : null}
      {/* the tiny muscle: from the bones up to the skull */}
      {muscle ? <g>
        <path d={`M 20 ${cy - 30 + lift} Q ${30 + 10 * shut} ${cy - 90} 20 ${cy - 150}`} stroke={shut > 0.5 ? '#FF5A4E' : '#B5474A'} strokeWidth={22 + 12 * shut} fill="none" strokeLinecap="round" />
        <path d={`M 20 ${cy - 30 + lift} Q ${30 + 10 * shut} ${cy - 90} 20 ${cy - 150}`} stroke="#FFB0A8" strokeWidth={4} fill="none" strokeDasharray="8 10" strokeLinecap="round" />
      </g> : null}
      {/* snail */}
      <g transform={`translate(170 ${cy})`}>
        <circle r={78} fill={mix('#2E3E66', '#FFE07A', snail)} opacity={0.35} />
        <path d="M 0 0 m -6 0 a 6 6 0 1 1 12 4 a 16 16 0 1 1 -26 -10 a 30 30 0 1 1 46 16 a 46 46 0 1 1 -66 -22 a 62 62 0 1 1 86 30" stroke={mix('#9FB4E8', '#FFE07A', snail)} strokeWidth={10} fill="none" strokeLinecap="round" />
      </g>
      {/* hair cells strip */}
      <g transform="translate(0 150)">
        <rect x={-230} y={-60} width={460} height={130} rx={24} fill="#22304E" stroke="#9FB4E8" strokeWidth={5} />
        {Array.from({length: 9}, (_, i) => {
          const x = -180 + i * 45, ang = hairs * (60 + 25 * rnd(i)) + (1 - hairs) * 6 * Math.sin(t * 6 + i);
          const col = hairs > 0.5 ? '#7C8597' : '#FFE07A';
          return <g key={i} transform={`translate(${x} 50) rotate(${ang})`}>
            <path d="M 0 0 V -70" stroke={col} strokeWidth={8} strokeLinecap="round" />
            <circle cy={-74} r={9} fill={col} stroke={INK} strokeWidth={3} />
          </g>;
        })}
      </g>
      {/* sound pulses */}
      {waves.map((w, i) => {
        const pts: string[] = [];
        for (let k = -6; k <= 6; k++) { const x = w.x + k * 9; pts.push(`${k === -6 ? 'M' : 'L'} ${x} ${cy + w.amp * Math.sin(k * 1.4 + t * 40) * (1 - Math.abs(k) / 7)}`); }
        return <path key={i} d={pts.join(' ')} stroke={w.col} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
      })}
    </g>
  );
};

/** X-RAY: the bat's ear. Cycle: muscle shuts -> SCREAM wave stops at the drum -> opens -> small echo goes through, snail lights */
const BAT_CYCLE = 0.9;
const BatXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const u = ((t - 9.95) % BAT_CYCLE + BAT_CYCLE) % BAT_CYCLE;
  const shut = clamp(Math.min(seg(u, 0, 0.08), 1 - seg(u, 0.5, 0.58)));
  const waves: {x: number; amp: number; col: string}[] = [];
  if (u > 0.1 && u < 0.5) waves.push({x: lerp(-330, -60, seg(u, 0.1, 0.42)), amp: 34, col: RED});
  if (u > 0.6) waves.push({x: lerp(-330, 220, seg(u, 0.6, 0.88)), amp: 12, col: RING});
  const snail = u > 0.8 ? 1 - seg(u, 0.84, 0.9) : 0;
  const muscleS = pulse(t, T.muscle, 1.0);
  const everyS = popIn(t, T.every - 0.1, 0.3);
  return (
    <div style={{position: 'absolute', left: 540, top: 1000, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id="bxr" R={340}><g transform="scale(1.12) translate(10 10)"><EarCut t={t} shut={shut} muscle waves={waves} hairs={0} snail={snail} /></g>
        <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} /></XFrame>
      <Card text="X-RAY: BAT EAR" top={90} size={50} />
      <Card text="TINY MUSCLE" top={300} left={760} color={GOLD} rot={7} s={muscleS} size={50} />
      <Card text={shut > 0.5 ? 'SHUT' : 'OPEN'} top={300} left={160} color={shut > 0.5 ? RED : '#7FD68A'} fg={shut > 0.5 ? '#fff' : INK} rot={-8} s={t > T.shuts - 0.1 ? 1 : 0} size={58} />
      <Card text="BEFORE EVERY SCREAM" top={820} color={GOLD} rot={2} s={everyS} size={52} />
    </div>
  );
};

/** X-RAY: YOUR ear. No muscle: the scream goes straight through, hair cells flatten, HEARING drops */
const YourXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const a = T.one - 0.05;
  const waves: {x: number; amp: number; col: string}[] = [];
  if (t > a && t < a + 0.55) waves.push({x: lerp(-330, 230, seg(t, a, a + 0.5)), amp: 40, col: RED});
  const hairs = eout(seg(t, a + 0.28, a + 0.6));
  const hearing = Math.round(100 - 62 * seg(t, a + 0.3, T.good + 0.1));
  const noMuscleS = popIn(t, 13.05, 0.3), dangerS = popIn(t, T.hurt, 0.3), goodS = popIn(t, T.good, 0.3);
  return (
    <div style={{position: 'absolute', left: 540, top: 1000, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s})`}}>
      <XFrame id="yxr" R={340}><g transform="scale(1.12) translate(10 10)"><EarCut t={t} shut={0} muscle={false} waves={waves} hairs={hairs} snail={t > a + 0.35 && t < a + 0.6 ? 1 : 0} /></g>
        <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} /></XFrame>
      <Card text="YOUR EAR" top={90} />
      <Card text="NO MUSCLE" top={300} left={760} color={GOLD} rot={8} s={noMuscleS} size={50} />
      <Card text="DANGER" top={300} left={150} color={RED} fg="#fff" rot={-9} s={dangerS} size={56} />
      {/* hearing meter */}
      <div style={{position: 'absolute', left: 450, top: 840, transform: 'translate(-50%,-50%) rotate(-2deg)', background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30,
        boxShadow: `0 9px 0 ${INK}`, padding: '10px 28px 14px', fontFamily: FONT, color: INK, whiteSpace: 'nowrap', textAlign: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 38}}>HEARING{goodS > 0.5 ? ' - FOR GOOD' : ''}</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 300, height: 44, border: `7px solid ${INK}`, borderRadius: 22, overflow: 'hidden', background: '#fff'}}>
            <div style={{width: `${hearing}%`, height: '100%', background: hearing > 80 ? '#3FBF6A' : hearing > 60 ? GOLD : RED}} />
          </div>
          <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1, color: hearing < 70 ? RED : INK, minWidth: 170}}>{hearing}%</div>
        </div>
      </div>
    </div>
  );
};

// ---------- the story over time ----------
type GuyState = {pose: Pose; mood: HeadMood; earRot: number; earBuzz: number; rot: number; dy: number};
const guyAt = (t: number): GuyState => {
  const base: GuyState = {pose: 'front_calm', mood: 'calm', earRot: 0, earBuzz: 0, rot: 0, dy: 0};
  if (inAny(t, G_SCREAMS) && !(t > 8.9 && t < 9.9)) return {...base, mood: 'scream', earBuzz: 0.5, dy: -4 * Math.abs(Math.sin(t * 30))};
  if (t >= 2.75 && t < 3.1) return {...base, mood: 'worried'};
  if (t >= 3.1 && t < 4.5) return {...base, pose: 'scared', mood: 'pain', earBuzz: t < 4.2 ? 1 : 0.3, rot: 3 * Math.sin(t * 25) * (1 - seg(t, 3.1, 4.4))};
  if (t >= 4.5 && t < 7.2) return {...base, pose: 'scared', mood: t > 4.95 ? 'pain' : 'worried', earBuzz: t > 4.95 ? 0.6 : 0};
  if (t >= 7.2 && t < 8.95) return {...base, mood: 'worried'};
  if (t >= 8.95 && t < 9.4) return {...base, mood: 'scream', earBuzz: 1.6, dy: -6 * Math.abs(Math.sin(t * 40))};
  if (t >= 9.4 && t < 9.95) { const u = seg(t, 9.4, 9.95); return {...base, mood: 'dizzy', earRot: 50 * Math.sin(u * 14) * (1 - u) + 30, rot: 14 * Math.sin(t * 18) * (1 - u)}; }
  if (t >= 13.0 && t < 15.95) return {...base, mood: 'worried'};
  if (t >= 16.4 && t < 17.6) return {...base, pose: 'front_wave', mood: t > ON ? 'happy' : 'calm'};
  if (t >= 17.6 && t < OFF) return {...base, mood: 'happy'};
  if (t >= OFF && t < 20.78) return {...base, pose: 'shrug', mood: 'shrug'};
  return base;
};
const batAt = (t: number): {mood: BatMood; open: number; cover: number} => {
  if (inAny(t, B_SCREAMS)) return {mood: 'scream', open: t > 7.3 ? 1 : eout(seg(t, 4.9, 5.1)) * 0.4, cover: 0};
  if (t >= 8.55 && t < 9.4) return {mood: 'chew', open: 1 - seg(t, 8.6, 8.9), cover: 0};
  if (t >= 9.4 && t < 9.95) return {mood: 'laugh', open: 0, cover: 0};
  if (t >= ON && t < 19.9) return {mood: 'squint', open: 0, cover: eout(seg(t, ON + 0.05, ON + 0.3))};
  if (t >= 19.9 && t < OFF + 0.2) return {mood: 'grumpy', open: 0, cover: 1 - seg(t, 19.9, 20.1)};
  return {mood: 'smug', open: 0, cover: 0};
};

export const BatScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: -22, y: -330, k: 2.8}, {t: 1.75, x: -20, y: -330, k: 2.95},              // both big: he screams, rings, the bat smug
    {t: 1.78, x: 0, y: -380, k: 1.55}, {t: 3.05, x: 0, y: -380, k: 1.65},             // wide: the rings light up the cave (SCREAM TO SEE)
    {t: 3.08, x: HX, y: HY - 40, k: 3.6}, {t: 4.48, x: HX, y: HY - 40, k: 3.85},       // his face: echoes slam his ears, RINGGG, DEAF
    {t: 4.5, x: BX - 30, y: -400, k: 3.0}, {t: 7.12, x: BX - 20, y: -400, k: 3.2},     // the bat screams (decibels counter)
    {t: 7.15, x: 40, y: -420, k: 2.1}, {t: 8.9, x: 40, y: -420, k: 2.2},              // the hunt: 190 a second, GULP
    {t: 8.93, x: HX + 30, y: HY - 60, k: 2.9}, {t: 9.92, x: HX + 30, y: HY - 60, k: 3.1}, // he tries it: ears flap, dizzy
    {t: 9.95, x: 0, y: -330, k: 2.3}, {t: 15.9, x: 0, y: -330, k: 2.45},              // behind the two X-rays
    {t: 15.93, x: -10, y: -380, k: 2.05}, {t: 17.6, x: -10, y: -370, k: 2.25},        // he pulls the light string
    {t: 17.63, x: -8, y: -340, k: 2.5}, {t: 20.4, x: -6, y: -335, k: 2.7},         // lit: squinting bat, comment ask; switched off
    {t: 20.43, x: -22, y: -330, k: 2.8},                                             // = the frame-0 shot
  ], t);
  const sh = shake(t, hit(t, 0, 6, 7) + hit(t, 3.15, 6, 6) + hit(t, 4.95, 5, 6) + hit(t, 9.35, 9, 5) + hit(t, 20.78, 6, 7));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const L = lightAt(t);
  const g = guyAt(t), b = batAt(t);
  const hd = headAt(g.pose);
  const hx = GX + hd.hx, hy = hd.hy + g.dy;
  const pull = t > 16.9 && t < 17.5 ? 26 * Math.sin(Math.PI * seg(t, 16.95, 17.45)) : 0;
  // inserts
  const bxS = popIn(t, 9.95, 0.35) * (1 - seg(t, 12.8, 13.0));
  const yxS = popIn(t, 13.0, 0.35) * (1 - seg(t, 15.7, 15.9));
  const dbS = popIn(t, 4.9, 0.3) * (1 - seg(t, 7.0, 7.15));
  const db = Math.round(140 * eio(seg(t, 5.0, T.jet)));
  const rateS = popIn(t, 7.4, 0.3) * (1 - seg(t, 8.85, 8.95));
  const rate = Math.round(190 * seg(t, T.n190, 8.75));
  // stickers
  const skree0 = t < 1.4 ? 1 - seg(t, 1.15, 1.35) : 0;
  const toSee = pulse(t, 2.05, 0.75);
  const ring = pulse(t, 3.2, 0.6), deaf = pulse(t, T.deaf, 0.5);
  const skreeB = pulse(t, 5.0, 0.7);
  const gulp = pulse(t, EAT, 0.35);
  const aaa = pulse(t, 8.97, 0.35), boing = pulse(t, 9.36, 0.45);
  const click = pulse(t, ON, 0.4), easy = pulse(t, 16.1, 0.7), bright = pulse(t, 17.75, 0.7);
  const click2 = pulse(t, OFF, 0.3), skreeEnd = t > 20.78 ? popIn(t, 20.78, 0.25) : 0;
  const stars = t > 9.4 && t < 9.95 ? 1 : 0;
  // echo rings from his own scream bouncing back into his ears (3.05-4.2) and in the comedy hit (9.15-9.45)
  const backRings = (a: number, n: number, sp: number) => Array.from({length: n}, (_, i) => {
    const u = seg(t, a + i * sp, a + i * sp + 0.35);
    if (u <= 0 || u >= 1) return null;
    return [-1, 1].map((sd) => <circle key={`${a}-${i}-${sd}`} cx={hx + sd * 60} cy={hy - 110} r={lerp(150, 12, u)} fill="none" stroke={RING} strokeWidth={10} opacity={0.4 + 0.6 * u} />);
  });
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: mix('#332E52', '#B39C80', L)}}>
      <Defs />
      <Layer cam={cam} z={2600} paper={false}><Backdrop L={L} /></Layer>
      <Layer cam={cam} z={1000} paper={false}><Cave t={t} L={L} /></Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <LightBulb t={t} L={L} pull={pull} />
        <Rings t={t} list={G_SCREAMS} at={{x: hx, y: hy + 30}} />
        <Rings t={t} list={B_SCREAMS} at={BMOUTH} dir={-35} spread={30} speed={700} maxR={360} w={9} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Moth t={t} />
        <Bat t={t} mood={b.mood} open={b.open} cover={b.cover} />
        <Guy pose={g.pose} x={GX} y={0} t={t} rot={g.rot * 0.25} />
        <GuyHead t={t} x={hx} y={hy} mood={g.mood} earRot={g.earRot} earBuzz={g.earBuzz} rot={g.rot} />
      </Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <W><g>{backRings(3.05, 4, 0.18)}{backRings(9.12, 2, 0.12)}</g></W>
      </Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={hx + Math.cos(a) * 90} y={hy - 150 + Math.sin(a) * 16} s={stars * 0.5} rot={t * 200} />;
        })}
        {thumb ? null : <>
        <Txt x={hx + 95} y={hy + 150} s={skree0} text="SKREEE" size={62} rot={-7} fill={GOLD} />
        <Txt x={0} y={-640} s={toSee} text="SCREAM TO SEE" size={60} rot={-4} fill={GOLD} />
        <Txt x={hx + 10} y={hy - 215} s={ring} text="RINGGG" size={50} rot={-6} fill={GOLD} />
        <Txt x={hx + 10} y={hy + 120} s={deaf} text="DEAF" size={64} rot={6} fill={RED} />
        <Txt x={BX - 10} y={BHEAD.y + 115} s={skreeB} text="SKREEE" size={48} rot={-8} fill={GOLD} />
        <Txt x={mothAt(EAT).x - 40} y={mothAt(EAT).y - 60} s={gulp} text="GULP" size={60} rot={8} fill="#FFFFFF" />
        <Txt x={hx + 120} y={hy - 230} s={aaa} text="AAAAAA" size={56} rot={8} fill={GOLD} />
        <Txt x={hx + 10} y={hy + 120} s={boing} text="BOING" size={60} rot={-8} fill="#FFFFFF" />
        <Txt x={-10} y={-70} s={easy} text="THE EASY WAY" size={58} rot={-4} fill={GOLD} />
        <Txt x={BULB.x + 120} y={BULB.y + 30} s={click} text="CLICK" size={58} rot={10} fill="#FFFFFF" />
        <Txt x={BX - 10} y={BHEAD.y + 125} s={bright} text="TOO BRIGHT" size={44} rot={-6} fill={GOLD} />
        <Txt x={BULB.x + 120} y={BULB.y + 30} s={click2} text="CLICK" size={58} rot={10} fill="#FFFFFF" />
        <Txt x={hx + 95} y={hy + 150} s={skreeEnd} text="SKREEE" size={62} rot={-7} fill={GOLD} />
        </>}
      </Layer>
      {thumb ? null : <>
        <Counter t={t} at={4.9} s={dbS} value={db} label={t > T.jet ? 'DECIBELS = JET ENGINE' : 'DECIBELS'} done={t > T.jet} doneAt={T.jet} icon={t > T.jet ? <JetIcon /> : <SpeakerIcon t={t} />} />
        <Counter t={t} at={7.4} s={rateS} value={rate} label="SCREAMS A SECOND" done={t > 8.75} doneAt={8.75} icon={<SpeakerIcon t={t} />} />
      </>}
      <BatXRay t={t} s={bxS} />
      <YourXRay t={t} s={yxS} />
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you had a bat's ears??" handle="@echo_doodles" likes="3.1K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.octopus - 0.05} until={DURATION - LOOP_DUR - 0.4} text="Octopus arms or shark teeth?" />
      </>}
    </AbsoluteFill>
  );
};

export const BatVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -28): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -18 : db}));
  const cues: Cue[] = [
    {f: 'crickets.mp3', at: 0, db: -36, to: 4.4}, {f: 'crickets.mp3', at: 17.9, db: -40, to: 3.6},
    // frame 0: he is already screaming
    {f: 'screech.wav', at: 0, db: -14}, {f: 'whoosh.wav', at: 0, db: -16}, {f: 'buzz.wav', at: 0.1, db: -30, to: 0.6},
    {f: 'whoosh.wav', at: 1.76, db: -28}, {f: 'screech.wav', at: 1.82, db: -22}, {f: 'chirp.wav', at: 2.2, db: -30}, {f: 'pop.wav', at: 2.05, db: -22},
    {f: 'whoosh.wav', at: 3.05, db: -28}, {f: 'twang.mp3', at: 3.15, db: -22, to: 0.5}, {f: 'ring.wav', at: 3.2, db: -26}, {f: 'pop.wav', at: T.deaf, db: -18},
    {f: 'whoosh.wav', at: 4.48, db: -28}, {f: 'pop.wav', at: 4.9, db: -24}, {f: 'buzz.wav', at: 5.0, db: -24, to: 0.5}, {f: 'squeak.wav', at: 5.0, db: -26},
    ...ticks(5.0, T.jet, 14), {f: 'ding.mp3', at: T.jet, db: -20}, {f: 'buzz.wav', at: 5.9, db: -28, to: 0.5},
    {f: 'whoosh.wav', at: 7.13, db: -28}, {f: 'pop.wav', at: 7.4, db: -24}, {f: 'buzz.wav', at: 7.3, db: -24}, {f: 'buzz.wav', at: 8.0, db: -22, to: 0.6},
    ...ticks(T.n190, 8.75, 19, -30), {f: 'ding.mp3', at: 8.76, db: -22}, {f: 'gulp.wav', at: EAT, db: -18},
    {f: 'whoosh.wav', at: 8.91, db: -28}, {f: 'screech.wav', at: 8.95, db: -20, to: 0.45}, {f: 'buzz.wav', at: 8.95, db: -20, to: 0.45},
    {f: 'twang.mp3', at: 9.34, db: -16, to: 0.6}, {f: 'pop.wav', at: 9.36, db: -18}, {f: 'crowd_laugh.wav', at: 9.4, db: -29, to: 1.2}, {f: 'giggle.mp3', at: 9.45, db: -32, to: 0.6},
    {f: 'zap.wav', at: 9.95, db: -26}, {f: 'pop.wav', at: T.muscle, db: -22},
    ...[0, 1, 2, 3].map((i) => ({f: 'click.wav', at: 9.95 + i * BAT_CYCLE, db: -30} as Cue)),
    {f: 'pop.wav', at: T.every - 0.1, db: -22},
    {f: 'zap.wav', at: 13.0, db: -26}, {f: 'pop.wav', at: 13.05, db: -22}, {f: 'screech.wav', at: T.one - 0.05, db: -26, to: 0.5}, {f: 'ring.wav', at: T.one + 0.3, db: -30},
    {f: 'horn.wav', at: T.hurt, db: -32, to: 0.6}, {f: 'pop.wav', at: T.good, db: -22},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: 15.91, db: -28}, {f: 'pop.wav', at: 16.1, db: -24}, {f: 'click.wav', at: ON - 0.02, db: -14}, {f: 'ding.mp3', at: ON + 0.05, db: -28},
    {f: 'whoosh.wav', at: 17.61, db: -30}, {f: 'pop.wav', at: 17.75, db: -26},
    {f: 'click.wav', at: OFF - 0.02, db: -14}, {f: 'pop.wav', at: OFF, db: -26},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26}, {f: 'screech.wav', at: 20.78, db: -24},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<BatScene t={0} />}>
        <BatScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="bat/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const BatWide: React.FC = () => <WideFit.Provider value={0.72}><BatVideo /></WideFit.Provider>;
