// "What if you had a turtle's shell?" - owl formula (CLAUDE.md, Growth), animal-powers series. First video with
// word-by-word CAPTIONS for the whole voice-over (the 2026-11-19 test: white Inter 900, black outline, the spoken word
// in yellow, y ~1300, moved below his face in the close-up).
// (1) the power is ON HIM at frame 0: a dodgeball BONKs off his shell while he stands there smug, arms crossed;
// (2) the co-star (a big smug tortoise next to him); (3) the backfire hits his body in close-up by ~2.6 s: he puffs
// up for a proud deep breath, the shell won't give - a padlock CLACKs onto his chest, his face goes purple;
// (4) two X-rays: TURTLE (its ribs ARE the shell, 50 bones counted, LOCKED), then YOUR RIBS (they lift every breath,
// BREATHE IN for the viewer) - a shell slams around them, padlocks, RIBS THAT MOVE 24 -> 0; (5) the comedy hit comes
// from the power itself: he copies the turtle's trick (head into the shell) and the air is squeezed out of him - PFFT,
// dizzy, crowd laugh; (6) third X-ray: the turtle's muscle sling pumping its lungs; (7) the ending: he stopped dodging,
// he just stands there and the balls bounce off = frame 0; (8) comment bubble opener, CTA, CommentAsk (no either/or).
// Everything is drawn in code (the guy's body too, so his head can sink into the shell and his arms can cross).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import WORDS0 from './data/words.json';
import {FPS, INK, FONT, Layer, camAt, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, shake, hit, spring,
  WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Ground, Captions, CapWord, Puffs,
  Sweat} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.12; times are video time). Last word ends 19.31 s; + 0.8 s for the push.
export const DURATION = 20.1;
export const T = {
  shell: 0.81, never: 1.89, deep: 2.56, breath: 2.71, again: 3.10,              // "Get a turtle's shell, and you could never take a deep breath again."
  turtles: 3.80, ribs: 4.12, part: 4.69, shell2: 5.30,                          // "A turtle's ribs are part of its shell."
  over: 5.85, fifty: 6.10, bones: 6.46, locked: 7.24, together: 7.60,            // "Over fifty bones, locked together."
  your: 8.22, ribs2: 8.44, lift: 8.87, every: 9.30, breathe: 9.99, inn: 10.22,   // "Your ribs lift every time you breathe in."
  locked2: 10.69, shell3: 11.30, they: 11.83, couldnt: 11.97,                    // "Locked in a shell, they couldn't."
  turtles2: 12.63, sling: 13.51, muscles: 13.94, instead: 14.37,                 // "Turtles breathe with a sling of muscles instead."
  you: 15.14, one: 15.64,                                                        // "You don't have one."
  so: 16.12, stopped: 16.87, dodging: 17.08, now: 17.74, stands: 18.64, there: 18.92, // "So he stopped dodging. Now he just stands there."
  cta: 12.75,
};
// captions: "fifty" reads faster as a number
const WORDS: CapWord[] = (WORDS0 as {w: string; s: number; e: number}[]).map((w) => ({...w, w: w.w.replace(/^fifty/i, '50')}));

const GOLD = '#FFD43B', RED = '#E2453C', RED2 = '#B52F2A';
const SHELL = '#6FAE5B', SHELL_IN = '#88C26F', SEAM = '#2F5C27', RIM = '#5E9A4C';
const PLAS = '#EBCB79', PLAS2 = '#C99B45';
const SKIN = '#9CC47A', SKIN2 = '#7EA862', SKIN_LID = '#86B566';
const FACE_C = '#F1EFEA';
const GX = -100;               // guy's feet
const TX = 372;                // turtle's centre (it faces left, towards him)
const GAG_IN = 11.38, GAG_PFFT = 11.45, GAG_HIT = 11.6, GAG_OUT = 11.88;
const LOCK = 2.62;             // the padlock clacks onto his chest

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
type P2 = [number, number];
const lp = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];

// ---------- dodgeballs: each one flies in, BONKs off his shell and flies away ----------
type Hit = {tb: number; side: 1 | -1; tx: number; ty: number; vx: number; vy: number; from?: P2};
const HITS: Hit[] = [
  {tb: 0, side: 1, tx: GX + 8, ty: -80, vx: 560, vy: -900},
  {tb: 0.95, side: -1, tx: GX - 8, ty: -86, vx: -560, vy: -900},
  {tb: GAG_HIT, side: 1, tx: GX + 4, ty: -200, vx: 380, vy: -1050, from: [GX + 330, -520]},
  {tb: 16.9, side: 1, tx: GX + 10, ty: -78, vx: 560, vy: -900},
  {tb: 17.6, side: -1, tx: GX - 10, ty: -90, vx: -560, vy: -900},
  {tb: 18.3, side: 1, tx: GX + 6, ty: -70, vx: 600, vy: -850},
  {tb: 19.0, side: -1, tx: GX - 6, ty: -84, vx: -560, vy: -900},
];
const APPROACH = 0.3, BR = 30;
const ballAt = (h: Hit, t: number) => {
  const u = t - h.tb;
  if (u < -APPROACH || u > 0.75) return null;
  if (u <= 0) {
    const p = (u + APPROACH) / APPROACH;
    const s: P2 = h.from ?? [h.tx + h.side * 470, h.ty + 40];
    return {x: lerp(s[0], h.tx, p), y: lerp(s[1], h.ty, p) - 70 * Math.sin(Math.PI * p), rot: -h.side * 300 * p, sq: 0};
  }
  return {x: h.tx + h.vx * u, y: h.ty + h.vy * u + 0.5 * 2600 * u * u, rot: h.side * 520 * u, sq: Math.max(0, 1 - u / 0.08)};
};
const DodgeBall: React.FC<{x: number; y: number; rot: number; sq: number}> = ({x, y, rot, sq}) => (
  <g transform={`translate(${x} ${y}) scale(${1 + 0.16 * sq} ${1 - 0.24 * sq}) rotate(${rot})`}>
    <circle r={BR} fill={RED} stroke={INK} strokeWidth={6.5} />
    <path d={`M ${-BR + 4} 6 Q 0 ${BR * 0.9} ${BR - 4} 6`} fill="none" stroke={RED2} strokeWidth={9} strokeLinecap="round" />
    <path d={`M ${-BR * 0.85} -6 Q 0 8 ${BR * 0.85} -6`} fill="none" stroke={INK} strokeWidth={3.5} />
    <ellipse cx={-10} cy={-13} rx={8} ry={5} fill="#FF9C8F" transform="rotate(-30 -10 -13)" />
  </g>
);
const Burst: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  if (s < 0.02) return null;
  const pts = Array.from({length: 16}, (_, i) => { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 26 : 58; return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ');
  return <g transform={`translate(${x} ${y}) scale(${s})`}><polygon points={pts} fill="#FFF6C9" stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>;
};
const Balls: React.FC<{t: number}> = ({t}) => (
  <W>{HITS.map((h, i) => {
    const b = ballAt(h, t); if (!b) return null;
    // impact burst: full size on the hit frame (frame 0 shows it), shrinks in 0.18 s
    const bs = t >= h.tb ? 1 - seg(t, h.tb + 0.06, h.tb + 0.2) : 0;
    return <g key={i}><Burst x={h.tx - h.side * 18} y={h.ty + 4} s={bs} /><DodgeBall {...b} /></g>;
  })}</W>
);

// ---------- the guy, drawn in code: round head, turtle shell (carapace behind, plastron in front), stubby arms/legs ----------
type Mood = 'smug' | 'grin' | 'inhale' | 'strain' | 'gasp' | 'dizzy' | 'sad' | 'worry' | 'shock';
const Head: React.FC<{t: number; mood: Mood; tint?: number; look?: number}> = ({t, mood, tint = 0, look = 0}) => {
  const R = HEAD_R;
  const puff = mood === 'strain' ? 1 : 0;
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (mood === 'dizzy') return <path key={sd} d={`M ${ex} ${ey} m -2 0 a 3 3 0 1 1 4 2 a 7 7 0 1 1 -9 -6 a 11 11 0 1 1 15 10`} transform={`rotate(${t * 600 * sd} ${ex} ${ey})`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
    if (mood === 'strain') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === 'grin') return <path key={sd} d={`M ${ex - 11} ${ey + 3} Q ${ex} ${ey - 10} ${ex + 11} ${ey + 3}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    const big = mood === 'shock' || mood === 'inhale' || mood === 'gasp' ? 1.2 : 1;
    const rx = 12 * big, ry = 15 * big;
    const pr = mood === 'shock' || mood === 'gasp' ? 4.5 : mood === 'inhale' ? 5 : 6.5;
    const px = ex + look * 4 + (mood === 'smug' ? 2 : 0), py = ey + (mood === 'sad' ? 5 : mood === 'gasp' ? -3 : mood === 'smug' ? 3 : 1);
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={px} cy={py} r={pr} fill={INK} />
        <circle cx={px - 1.5} cy={py - 2} r={2} fill="#fff" />
        {mood === 'smug' ? <path d={`M ${ex - rx - 1} ${ey - 1} A ${rx + 1} ${ry + 1} 0 0 1 ${ex + rx + 1} ${ey - 1} Z`} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brow = (sd: number) => {
    let d = '';
    if (mood === 'smug') d = sd < 0 ? 'M -38 -38 L -12 -38' : 'M 12 -44 L 38 -52';
    else if (mood === 'inhale' || mood === 'shock') d = `M ${sd * 12} -46 L ${sd * 37} -52`;
    else if (mood === 'sad' || mood === 'worry' || mood === 'gasp') d = `M ${sd * 12} -42 L ${sd * 36} -33`;
    else if (mood === 'strain') d = `M ${sd * 9} -36 L ${sd * 36} -44`;
    return d ? <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null;
  };
  let mouth: React.ReactNode = null;
  if (mood === 'smug') mouth = <g><path d="M -24 4 Q 4 18 26 -8" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /><path d="M 22 -12 Q 30 -6 28 2" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /></g>;
  else if (mood === 'grin') mouth = <g><path d="M -30 -4 Q 0 0 30 -4 Q 26 32 0 34 Q -26 32 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={24} rx={13} ry={6} fill="#E4677A" /></g>;
  else if (mood === 'inhale') mouth = <g><ellipse cx={0} cy={6} rx={9} ry={12} fill="#5A2328" stroke={INK} strokeWidth={4.5} />
    {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 40} -6 q ${sd * 6} 10 0 20`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />)}</g>;
  else if (mood === 'strain') mouth = <path d="M -22 6 q 7 -7 14 0 t 14 0 t 14 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  else if (mood === 'gasp') { const o = 1 + 0.12 * Math.sin(t * 30); mouth = <g><ellipse cx={0} cy={10} rx={17} ry={22 * o} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={22} rx={9} ry={6} fill="#E4677A" /></g>; }
  else if (mood === 'dizzy') mouth = <path d={`M -20 10 Q -10 ${2 + 4 * Math.sin(t * 20)} 0 10 T 20 10`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (mood === 'sad') mouth = <path d="M -18 14 Q 0 0 18 14" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (mood === 'worry') mouth = <path d="M -16 10 q 5 -5 10 0 t 10 0 t 10 0" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'shock') mouth = <ellipse cx={0} cy={8} rx={13} ry={17} fill="#5A2328" stroke={INK} strokeWidth={4.5} />;
  return (
    <g transform={`scale(${1 + 0.08 * puff} ${1 - 0.02 * puff})`}>
      <circle r={R + 1} fill="url(#tFace)" stroke={INK} strokeWidth={6.5} />
      {tint > 0.01 ? <circle r={R - 2.5} fill="#7E57C2" opacity={0.45 * tint} /> : null}
      {puff ? [-1, 1].map((sd) => <circle key={sd} cx={sd * 40} cy={22} r={15} fill="#F2A7B5" opacity={0.85} />) : null}
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)">{mouth}</g>
    </g>
  );
};

type ArmP = {e: P2; h: P2};
type ArmsP = {l: ArmP; r: ArmP; front: number};
const mir = (a: ArmP): ArmP => ({e: [-a.e[0], a.e[1]], h: [-a.h[0], a.h[1]]});
const sym = (r: ArmP, front = 0): ArmsP => ({l: mir(r), r, front});
const ARM = {
  down: sym({e: [104, -112], h: [112, -72]}),
  cross: {r: {e: [102, -100], h: [-34, -112]}, l: {e: [-102, -108], h: [34, -124]}, front: 1} as ArmsP,
  clutch: sym({e: [108, -116], h: [46, -150]}, 1),
  shrug: sym({e: [128, -124], h: [156, -156]}),
  up: sym({e: [122, -198], h: [130, -258]}),
};
const blendArms = (a: ArmsP, b: ArmsP, u: number): ArmsP => ({
  l: {e: lp(a.l.e, b.l.e, u), h: lp(a.l.h, b.l.h, u)}, r: {e: lp(a.r.e, b.r.e, u), h: lp(a.r.h, b.r.h, u)}, front: u < 0.5 ? a.front : b.front});
const Arm: React.FC<{sd: number; a: ArmP}> = ({sd, a}) => {
  const S: P2 = [sd * 80, -152];
  const C: P2 = [2 * a.e[0] - (S[0] + a.h[0]) / 2, 2 * a.e[1] - (S[1] + a.h[1]) / 2];
  const d = `M ${S[0]} ${S[1]} Q ${C[0]} ${C[1]} ${a.h[0]} ${a.h[1]}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={33} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#FFFFFF" strokeWidth={21} fill="none" strokeLinecap="round" />
      <circle cx={a.h[0]} cy={a.h[1]} r={16} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} />
    </g>
  );
};
const Padlock: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => s > 0.01 ? (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -20 -8 V -26 A 20 20 0 0 1 20 -26 V -8" stroke={INK} strokeWidth={15} fill="none" />
    <path d="M -20 -8 V -26 A 20 20 0 0 1 20 -26 V -8" stroke="#C9CDD3" strokeWidth={7} fill="none" />
    <rect x={-32} y={-10} width={64} height={50} rx={10} fill="#F2B33D" stroke={INK} strokeWidth={6} />
    <circle cx={0} cy={10} r={7} fill={INK} /><rect x={-3} y={12} width={6} height={14} rx={2} fill={INK} />
  </g>) : null;

/** Carapace (behind him), seen from the front: a dome peeking out around his body, rim scutes. */
const Carapace: React.FC = () => {
  const cx = 0, cy = -114, rx = 114, ry = 108;
  const seams = Array.from({length: 18}, (_, i) => {
    const a = (i / 18) * Math.PI * 2;
    return <path key={i} d={`M ${cx + Math.cos(a) * rx * 0.8} ${cy + Math.sin(a) * ry * 0.8} L ${cx + Math.cos(a) * rx} ${cy + Math.sin(a) * ry}`} stroke={SEAM} strokeWidth={5} />;
  });
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={SHELL} stroke={INK} strokeWidth={7} />
      <ellipse cx={cx} cy={cy} rx={rx * 0.8} ry={ry * 0.8} fill={SHELL_IN} stroke={SEAM} strokeWidth={5} />
      {seams}
      <path d={`M ${cx - rx * 0.86} ${cy - ry * 0.32} A ${rx * 0.9} ${ry * 0.9} 0 0 1 ${cx - rx * 0.3} ${cy - ry * 0.86}`} stroke="#C9EBB4" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
      {/* openings: arms, legs (dark) */}
      {[-1, 1].map((sd) => <ellipse key={'a' + sd} cx={sd * 82} cy={-152} rx={17} ry={24} fill="#2B2116" stroke={INK} strokeWidth={4} />)}
      {[-1, 1].map((sd) => <ellipse key={'l' + sd} cx={sd * 46} cy={-30} rx={30} ry={13} fill="#2B2116" stroke={INK} strokeWidth={4} />)}
    </g>
  );
};
const PLAS_D = 'M -72 -170 Q 0 -184 72 -170 L 82 -124 Q 86 -84 72 -52 L 42 -28 Q 0 -18 -42 -28 L -72 -52 Q -86 -84 -82 -124 Z';
const Plastron: React.FC<{bulge: number}> = ({bulge}) => (
  <g transform={`translate(0 -100) scale(${1 + 0.05 * bulge} ${1 + 0.025 * bulge}) translate(0 100)`}>
    <path d={PLAS_D} fill={PLAS} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 0 -178 V -22" stroke={PLAS2} strokeWidth={5} />
    {[-146, -116, -84, -54].map((y, i) => <path key={i} d={`M ${-78 + (i === 3 ? 10 : 0)} ${y} Q 0 ${y + 8} ${78 - (i === 3 ? 10 : 0)} ${y}`} stroke={PLAS2} strokeWidth={5} fill="none" />)}
    <path d="M -58 -160 Q -66 -120 -60 -80" stroke="#FFF1C4" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.8} />
  </g>
);

type GuyS = {mood: Mood; arms: ArmsP; headIn: number; headDy: number; headRot: number; tint: number; bulge: number; lock: number;
  rot: number; sx: number; sy: number; dx: number; look: number; sweat: number};
const ShellGuy: React.FC<{t: number; g: GuyS}> = ({t, g}) => {
  const hy = -235 + g.headDy + 140 * g.headIn;
  const breathe = 1 + 0.008 * Math.sin(2 * Math.PI * 0.6 * t);
  const arms = <><Arm sd={-1} a={g.arms.l} /><Arm sd={1} a={g.arms.r} /></>;
  return (
    <W><g transform={`translate(${GX + g.dx} 0) rotate(${g.rot}) scale(${g.sx} ${g.sy * breathe})`}>
      <ellipse cx={0} cy={2} rx={120} ry={14} fill="rgba(72,54,42,0.22)" />
      <Carapace />
      {g.arms.front ? null : arms}
      {/* legs */}
      {[-1, 1].map((sd) => <g key={sd}>
        <path d={`M ${sd * 44} -34 L ${sd * 47} -12`} stroke={INK} strokeWidth={34} strokeLinecap="round" />
        <path d={`M ${sd * 44} -34 L ${sd * 47} -12`} stroke="#fff" strokeWidth={22} strokeLinecap="round" />
        <ellipse cx={sd * 52} cy={-7} rx={27} ry={13} fill="#fff" stroke={INK} strokeWidth={5.5} />
      </g>)}
      {/* neck hole: shows once the head sinks into the shell */}
      {g.headIn > 0.04 ? <ellipse cx={0} cy={-175} rx={58} ry={17} fill="#2B2116" stroke={INK} strokeWidth={5} opacity={clamp(g.headIn * 3)} /> : null}
      <g transform={`translate(0 ${hy}) rotate(${g.headRot})`}><Head t={t} mood={g.mood} tint={g.tint} look={g.look} /></g>
      <Plastron bulge={g.bulge} />
      {g.arms.front ? arms : null}
      <Padlock x={0} y={-124} s={g.lock * 0.8} rot={6 * Math.sin(t * 9) * Math.exp(-4 * Math.max(0, t - LOCK))} />
      {/* peeking eyes inside the shell */}
      {g.headIn > 0.85 ? [-1, 1].map((sd) => <g key={sd}>
        <ellipse cx={sd * 17} cy={-182} rx={9} ry={11} fill="#fff" stroke={INK} strokeWidth={3.5} />
        <circle cx={sd * 17 + 3 * Math.sin(t * 7)} cy={-181} r={4.5} fill={INK} />
      </g>) : null}
      {g.sweat > 0.01 ? <Sweat x={70} y={hy - 40 + 30 * ((t * 0.9) % 1)} s={0.9 * g.sweat} raw /> : null}
    </g></W>
  );
};

// ---------- the tortoise co-star (side view, facing left, 3/4 face) ----------
type TMood = 'smug' | 'laugh' | 'proud';
const SH = {rx: 215, ry: 190, y0: -58};
const arcPts = (f: number, a0: number, a1: number, n = 14) => Array.from({length: n + 1}, (_, i) => {
  const a = lerp(a0, a1, i / n); return [SH.rx * f * Math.cos(a), SH.y0 - SH.ry * f * Math.sin(a)] as P2; });
const platePath = (f0: number, f1: number, a0: number, a1: number, inset = 0) => {
  // inset shrinks the plate toward its middle (the lighter inner scute)
  const fm = (f0 + f1) / 2, am = (a0 + a1) / 2;
  const g0 = lerp(f0, fm, inset), g1 = lerp(f1, fm, inset), b0 = lerp(a0, am, inset), b1 = lerp(a1, am, inset);
  const pts = [...arcPts(g1, b0, b1, 10), ...arcPts(g0, b1, b0, 10)];
  return 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${Math.min(y, SH.y0).toFixed(1)}`).join(' L ') + ' Z';
};
const SHELL_OUT = 'M ' + arcPts(1, Math.PI, 0, 36).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ` Q 0 ${SH.y0 + 18} ${-SH.rx} ${SH.y0} Z`;
const PLATES: {d: string; di: string}[] = (() => {
  const out: {d: string; di: string}[] = [];
  const band = (f0: number, f1: number, n: number) => { for (let k = 0; k < n; k++) { const a0 = Math.PI * (1 - k / n), a1 = Math.PI * (1 - (k + 1) / n); out.push({d: platePath(f0, f1, a0, a1), di: platePath(f0, f1, a0, a1, 0.3)}); } };
  band(0, 0.5, 3); band(0.5, 0.84, 4); band(0.84, 1, 11);
  return out;
})();
const TurtleHead: React.FC<{t: number; mood: TMood; look: number}> = ({t, mood, look}) => {
  const laugh = mood === 'laugh';
  const eye = (cx: number, cy: number, rx: number, ry: number, k: number) => {
    if (laugh || mood === 'proud') return <path key={k} d={`M ${cx - rx} ${cy + 3} Q ${cx} ${cy - ry} ${cx + rx} ${cy + 3}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    return (
      <g key={k}>
        <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth={4.5} />
        <circle cx={cx + look * 5 - 2} cy={cy + 3} r={rx * 0.45} fill={INK} />
        <circle cx={cx + look * 5 - 4} cy={cy} r={2.2} fill="#fff" />
        <path d={`M ${cx - rx - 1} ${cy} A ${rx + 1} ${ry + 1} 0 0 1 ${cx + rx + 1} ${cy} Z`} fill={SKIN_LID} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
    );
  };
  const shakeY = laugh ? 3 * Math.sin(t * 28) : 0;
  return (
    <g transform={`translate(0 ${shakeY}) rotate(-6)`}>
      <ellipse cx={0} cy={0} rx={64} ry={52} fill={INK} /><ellipse cx={-46} cy={12} rx={38} ry={31} fill={INK} />
      <ellipse cx={0} cy={0} rx={57} ry={45} fill={SKIN} /><ellipse cx={-46} cy={12} rx={31} ry={24} fill={SKIN} />
      <ellipse cx={14} cy={18} rx={34} ry={18} fill={SKIN2} opacity={0.5} />
      {laugh ? <g><path d="M -74 12 Q -30 22 16 12 Q 4 52 -36 48 Q -66 40 -74 12 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={-30} cy={38} rx={16} ry={7} fill="#E4677A" /></g>
        : <path d={`M -74 14 Q -30 30 14 18 Q 22 16 26 6`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />}
      <circle cx={-72} cy={-4} r={3.2} fill={INK} /><circle cx={-62} cy={-8} r={3.2} fill={INK} />
      {eye(-26, -20, 12, 15, 0)}{eye(10, -18, 15, 18, 1)}
      <path d={mood === 'smug' ? 'M -38 -42 L -16 -40' : 'M -38 -44 L -16 -48'} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <path d={mood === 'smug' ? 'M 0 -46 L 26 -56' : 'M 0 -48 L 26 -50'} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
};
const Turtle: React.FC<{t: number; mood: TMood; neck?: number; look?: number}> = ({t, mood, neck = 1, look = -1}) => {
  const base: P2 = [-196, -112];
  const head: P2 = lp([-170, -110], [-292, -212 + 4 * Math.sin(t * 2.2)], neck);
  const ctl: P2 = [lerp(-190, -250, neck), lerp(-112, -140, neck)];
  const nd = `M ${base[0] + 30} ${base[1] + 6} Q ${ctl[0]} ${ctl[1]} ${head[0] + 16} ${head[1] + 26}`;
  const leg = (x: number, far: boolean) => (
    <g key={x} opacity={1}>
      <path d={`M ${x - 30} -78 L ${x - 33} -6 Q ${x} 8 ${x + 33} -6 L ${x + 30} -78 Z`} fill={far ? SKIN2 : SKIN} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {[-18, 0, 18].map((d) => <ellipse key={d} cx={x + d} cy={-4} rx={7} ry={6} fill="#F6F0DC" stroke={INK} strokeWidth={3} />)}
      {far ? null : <><circle cx={x - 8} cy={-48} r={5} fill={SKIN2} /><circle cx={x + 10} cy={-34} r={4} fill={SKIN2} /></>}
    </g>
  );
  return (
    <W><g transform={`translate(${TX} 0)`}>
      <ellipse cx={0} cy={2} rx={250} ry={16} fill="rgba(72,54,42,0.22)" />
      {leg(-118, true)}{leg(168, true)}
      <path d="M 200 -74 L 262 -46 L 200 -46 Z" fill={SKIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* neck + head (behind the shell's front rim) */}
      <path d={nd} stroke={INK} strokeWidth={62} fill="none" strokeLinecap="round" />
      <path d={nd} stroke={SKIN} strokeWidth={49} fill="none" strokeLinecap="round" />
      {neck > 0.3 ? [0.35, 0.6].map((u) => { const p = lp(base, head, u); return <path key={u} d={`M ${p[0] - 14} ${p[1] - 14} q 12 10 26 4`} stroke={SKIN2} strokeWidth={5} fill="none" strokeLinecap="round" />; }) : null}
      <g transform={`translate(${head[0]} ${head[1]})`}><TurtleHead t={t} mood={mood} look={look} /></g>
      {/* shell */}
      <path d={SHELL_OUT} fill={SHELL} />
      {PLATES.map((p, i) => <g key={i}><path d={p.d} fill={i < 7 ? SHELL : RIM} stroke={SEAM} strokeWidth={6} strokeLinejoin="round" /><path d={p.di} fill={i < 7 ? SHELL_IN : SHELL} opacity={0.9} /></g>)}
      <path d={SHELL_OUT} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d={`M ${-SH.rx + 6} ${SH.y0 + 2} Q 0 ${SH.y0 + 22} ${SH.rx - 6} ${SH.y0 + 2} L ${SH.rx - 20} ${SH.y0 + 18} Q 0 ${SH.y0 + 36} ${-SH.rx + 20} ${SH.y0 + 18} Z`} fill={PLAS} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M -150 -205 Q -90 -246 -20 -250`} stroke="#C9EBB4" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.6} />
      {leg(-150, false)}{leg(135, false)}
    </g></W>
  );
};

const Defs: React.FC = () => (
  <W><defs>
    <radialGradient id="tFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
  </defs></W>
);

// ---------- inserts (screen space) ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 450}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const XR = 320, XCY = 850;   // X-ray panels: radius and centre (screen); the captions sit below them
const XFrame: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => (
  <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
    <clipPath id={id}><circle r={XR} /></clipPath>
    <circle r={XR + 18} fill={INK} />
    <g clipPath={`url(#${id})`}>
      <rect x={-450} y={-450} width={900} height={900} fill="#16223A" />
      {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
      {children}
    </g>
    <circle r={XR} fill="none" stroke="#3E6FB0" strokeWidth={20} />
  </svg>
);
const Scan: React.FC<{t: number}> = ({t}) => <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.2} />;
const Counter: React.FC<{t: number; s: number; value: string | number; label: string; sub?: string; red: boolean; bumpAt: number; left: number; top: number; rot?: number}> =
  ({t, s, value, label, sub, red, bumpAt, left, top, rot = 6}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s * (1 + 0.1 * Math.max(0, 1 - (t - bumpAt) * 4) * (t > bumpAt ? 1 : 0))})`,
    background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 24px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: 900, fontSize: 104, lineHeight: 1, color: red ? RED : INK}}>{value}</div>
    <div style={{fontWeight: 900, fontSize: 34}}>{label}</div>
    {sub ? <div style={{fontWeight: 800, fontSize: 26}}>{sub}</div> : null}
  </div>
) : null;

/** X-RAY 1: a turtle from above. Its ribs run out from the spine into the shell; the shell is 50 bones (1 nuchal, 8 neurals,
 *  2 suprapygals, 1 pygal, 16 costals - one rib in each - and 22 peripherals), counted one by one, then LOCKED. */
const E1 = {rx: 168, ry: 222, cy: 18}, E2 = {rx: 138, ry: 188, cy: 18};
const ellX = (e: typeof E1, y: number) => e.rx * Math.sqrt(Math.max(0, 1 - ((y - e.cy) / e.ry) ** 2));
const BONES: {d: string; kind: 'col' | 'cost' | 'ring'}[] = (() => {
  const b: {d: string; kind: 'col' | 'cost' | 'ring'}[] = [];
  const rows = Array.from({length: 9}, (_, i) => -170 + 40 * i);   // 8 rows from -170 to 150
  for (let i = 0; i < 8; i++) b.push({d: `M -22 ${rows[i]} H 22 V ${rows[i + 1]} H -22 Z`, kind: 'col'});
  b.push({d: 'M -22 150 H 22 V 178 H -22 Z', kind: 'col'}, {d: 'M -22 178 H 22 V 215 H -22 Z', kind: 'col'});
  for (let i = 0; i < 8; i++) for (const s of [-1, 1]) {
    const y0 = i === 0 ? -220 : rows[i], y1 = i === 7 ? 240 : rows[i + 1];
    b.push({d: `M ${s * 22} ${y0} H ${s * 200} V ${y1} H ${s * 22} Z`, kind: 'cost'});
  }
  for (let k = 0; k < 24; k++) {
    const a0 = ((k - 0.5) / 24) * Math.PI * 2, a1 = ((k + 0.5) / 24) * Math.PI * 2, n = 6;
    const P = (e: typeof E1, a: number) => `${(Math.sin(a) * e.rx).toFixed(1)} ${(e.cy - Math.cos(a) * e.ry).toFixed(1)}`;
    const pts = [...Array.from({length: n + 1}, (_, i) => P(E1, lerp(a0, a1, i / n))), ...Array.from({length: n + 1}, (_, i) => P(E2, lerp(a1, a0, i / n)))];
    b.push({d: 'M ' + pts.join(' L ') + ' Z', kind: 'ring'});
  }
  return b;
})();
const COUNT_A = 5.88, COUNT_B = 7.16;
const TurtleXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const lit = Math.floor(50 * seg(t, COUNT_A, COUNT_B));
  const fused = seg(t, T.part, T.shell2 + 0.1);                 // the ribs turn into shell plates
  const ribGlow = t > T.ribs - 0.05 && t < T.part + 0.3 ? 0.5 + 0.5 * Math.sin((t - T.ribs) * 16) : 0;
  const locked = t > T.locked;
  const lockS = popIn(t, T.locked, 0.25);
  const flashOf = (i: number) => { const ti = lerp(COUNT_A, COUNT_B, (i + 0.5) / 50); return t > ti && t < ti + 0.12 ? 1 : 0; };
  const ribs = Array.from({length: 8}, (_, i) => -150 + 40 * i);
  return (
    <div style={{position: 'absolute', left: 540, top: XCY, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id="txr">
        <g transform={`translate(${locked ? 3 * Math.sin(t * 50) * Math.exp(-6 * (t - T.locked)) : 0} 0)`}>
          {/* skull + neck, limbs, tail */}
          <ellipse cx={0} cy={-250} rx={40} ry={46} fill="#DCD3BC" stroke={INK} strokeWidth={5} />
          <circle cx={-14} cy={-262} r={9} fill="#16223A" /><circle cx={14} cy={-262} r={9} fill="#16223A" />
          {[-1, 1].map((sd) => <g key={sd}>
            <path d={`M ${sd * 120} -120 L ${sd * 215} -190`} stroke="#DCD3BC" strokeWidth={22} strokeLinecap="round" />
            <path d={`M ${sd * 120} 150 L ${sd * 205} 215`} stroke="#DCD3BC" strokeWidth={22} strokeLinecap="round" />
          </g>)}
          <path d="M 0 236 L 0 290" stroke="#DCD3BC" strokeWidth={14} strokeLinecap="round" />
          {/* the 50 shell bones */}
          <g>
            <clipPath id="txrIn"><ellipse cx={0} cy={E2.cy} rx={E2.rx} ry={E2.ry} /></clipPath>
            {BONES.map((b, i) => {
              const on = i < lit || locked;
              const op = b.kind === 'cost' ? Math.max(on ? 1 : 0, 0.18 + 0.82 * fused) : on ? 1 : 0.18;
              const fill = flashOf(i) ? '#FFFFFF' : locked ? '#F1E6C8' : '#E5DBC2';
              return <path key={i} d={b.d} fill={fill} fillOpacity={op} stroke={op > 0.5 ? INK : '#6D82AA'} strokeWidth={op > 0.5 ? 4.5 : 3} strokeLinejoin="round"
                clipPath={b.kind === 'ring' ? undefined : 'url(#txrIn)'} />;
            })}
          </g>
          {/* ribs: from the spine out into the shell */}
          {ribs.map((y) => [-1, 1].map((sd) => (
            <path key={`${y}${sd}`} d={`M ${sd * 12} ${y} Q ${sd * 80} ${y - 6} ${sd * (ellX(E1, y + 6) - 8)} ${y + 8}`} stroke={ribGlow > 0 ? GOLD : '#FFFFFF'}
              strokeWidth={9 + 4 * ribGlow} fill="none" strokeLinecap="round" opacity={1 - 0.55 * fused * (ribGlow > 0 ? 0 : 1)} />
          )))}
          {/* spine */}
          {Array.from({length: 17}, (_, i) => <rect key={i} x={-9} y={-205 + i * 27} width={18} height={20} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={3} />)}
          {locked ? <path d={`M 0 ${E1.cy} m -${E1.rx} 0 a ${E1.rx} ${E1.ry} 0 1 0 ${2 * E1.rx} 0 a ${E1.rx} ${E1.ry} 0 1 0 -${2 * E1.rx} 0`} fill="none" stroke={GOLD} strokeWidth={10 * Math.max(0, 1 - (t - T.locked) * 2.5)} /> : null}
        </g>
        <Scan t={t} />
      </XFrame>
      <Card text="X-RAY: TURTLE" top={88} size={48} />
      <Card text="RIBS" top={330} left={110} color={GOLD} rot={-8} s={pulse(t, T.ribs - 0.05, 0.85)} size={52} />
      <Card text="RIBS = SHELL" top={742} color={GOLD} rot={3} s={pulse(t, T.shell2 - 0.08, 1.15)} size={52} />
      <Card text="LOCKED" top={742} color={RED} fg="#fff" rot={-3} s={popIn(t, T.locked + 0.05, 0.3)} size={56} />
      <div style={{position: 'absolute', left: 450, top: 450, transform: `translate(-50%,-50%) scale(${lockS * 2.2})`}}>
        <svg width={120} height={120} viewBox="-60 -60 120 120" style={{overflow: 'visible'}}><Padlock x={0} y={0} s={lockS > 0.01 ? 1 : 0} rot={8 * Math.sin(t * 12) * Math.exp(-4 * Math.max(0, t - T.locked))} /></svg>
      </div>
      <Counter t={t} s={popIn(t, COUNT_A - 0.12, 0.3)} value={locked ? '50+' : lit} label="BONES" sub="IN THE SHELL" red={locked} bumpAt={T.locked} left={800} top={300} />
    </div>
  );
};

/** X-RAY 2: YOUR ribs from the front. They swing up and out every time you breathe in (the lungs fill), then a shell
 *  slams around them, padlocks pop on, RIBS THAT MOVE 24 -> 0. */
const breathYou = (t: number) => {
  if (t > T.locked2) return 0.04 * Math.max(0, 1 - (t - T.locked2) * 2) * Math.sin(t * 45);
  const bump = (c: number, w: number) => Math.exp(-(((t - c) / w) ** 2));
  return clamp(bump(9.0, 0.32) + bump(10.3, 0.34) + 0.25 * bump(8.25, 0.25));
};
const YourXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const ph = breathYou(t);
  const slam = seg(t, T.locked2, T.locked2 + 0.14);
  const shellS = t < T.locked2 ? 0 : 1.45 - 0.45 * eout(slam) + spring(t, T.locked2 + 0.14, 0.04, 4, 8);
  const moving = t < T.locked2 + 0.06 ? 24 : Math.max(0, 24 - Math.floor(24 * seg(t, T.locked2 + 0.06, T.locked2 + 0.36)));
  const ribs = Array.from({length: 12}, (_, i) => {
    const y0 = -200 + i * 30, w = 112 + 74 * Math.sin((Math.PI * (i + 2)) / 14);
    const float = i >= 10;
    return [-1, 1].map((sd) => {
      const d = float
        ? `M ${sd * 12} ${y0} C ${sd * w * 0.55} ${y0 - 22} ${sd * w} ${y0 - 4} ${sd * w} ${y0 + 28} C ${sd * w} ${y0 + 46} ${sd * w * 0.92} ${y0 + 58} ${sd * w * 0.82} ${y0 + 64}`
        : `M ${sd * 12} ${y0} C ${sd * w * 0.55} ${y0 - 22} ${sd * w} ${y0 - 5} ${sd * w} ${y0 + 30} C ${sd * w} ${y0 + 62} ${sd * w * 0.72} ${y0 + 84} ${sd * w * 0.3} ${y0 + 94}`;
      return <path key={`${i}${sd}`} d={d} transform={`rotate(${-sd * (6 + 0.6 * i) * ph} ${sd * 12} ${y0})`} stroke="#EFE7D2" strokeWidth={13} fill="none" strokeLinecap="round" />;
    });
  });
  const pads: [number, number, number][] = [[-178, -120, 0], [178, -120, 0], [-192, -20, 1], [192, -20, 1], [-172, 80, 2], [172, 80, 2]];
  return (
    <div style={{position: 'absolute', left: 540, top: XCY, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s})`}}>
      <XFrame id="yxr">
        <g transform={`translate(0 10) scale(${1 + 0.05 * ph} 1)`}>
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 22} -175 C ${sd * 150} -200 ${sd * 175} 0 ${sd * 150} 150 C ${sd * 110} 175 ${sd * 40} 160 ${sd * 22} 120 Z`}
            fill="#E98FA0" opacity={0.5} transform={`translate(0 -175) scale(${1 + 0.1 * ph}) translate(0 175)`} />)}
          {ribs}
          {[-1, 1].map((sd) => <path key={'c' + sd} d={`M ${sd * 16} -232 Q ${sd * 80} -250 ${sd * 160} -238`} stroke="#EFE7D2" strokeWidth={14} fill="none" strokeLinecap="round" />)}
          <rect x={-16} y={-210} width={32} height={190} rx={12} fill="#EFE7D2" />
          {Array.from({length: 17}, (_, i) => <rect key={i} x={-13} y={-262 + i * 30} width={26} height={21} rx={7} fill="#FFFFFF" stroke="#16223A" strokeWidth={3} />)}
          {/* the shell slams around them */}
          {shellS > 0.01 ? <ellipse cx={0} cy={-20} rx={232 * shellS} ry={292 * shellS} fill="none" stroke={INK} strokeWidth={46} /> : null}
          {shellS > 0.01 ? <ellipse cx={0} cy={-20} rx={232 * shellS} ry={292 * shellS} fill="none" stroke={SHELL} strokeWidth={30} /> : null}
          {pads.map(([x, y, k], i) => <Padlock key={i} x={x} y={y} s={popIn(t, T.locked2 + 0.12 + k * 0.08, 0.22) * 1.05} rot={x > 0 ? 8 : -8} />)}
        </g>
        <Scan t={t} />
      </XFrame>
      <Card text="X-RAY: YOUR RIBS" top={88} size={48} />
      <Card text="BREATHE IN" top={742} left={450} color={GOLD} rot={-3} s={pulse(t, T.breathe - 0.12, 0.55)} size={54} />
      <Card text="LOCKED" top={742} left={450} color={RED} fg="#fff" rot={3} s={popIn(t, T.locked2 + 0.2, 0.3)} size={56} />
      <Counter t={t} s={popIn(t, T.ribs2 - 0.05, 0.3)} value={moving} label="RIBS THAT MOVE" red={moving < 24} bumpAt={T.locked2 + 0.36} left={790} top={300} />
    </div>
  );
};

/** X-RAY 3: the turtle from the side. Lungs under the shell, guts below, and a sling of muscle under the guts that pulls
 *  down (lungs fill) and pushes up (lungs empty). */
const SlingXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const ph = 0.5 - 0.5 * Math.cos((2 * Math.PI * (t - 12.75)) / 1.15);
  const outer = (f: number) => arcPts(f, Math.PI, 0, 28).map(([x, y]) => [x * 1.08, (y - SH.y0) * 0.95 + 60] as P2);
  const toD = (p: P2[]) => p.map(([x, y], i) => `${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const shellD = toD(outer(1)) + ' ' + toD(outer(0.86).reverse()).replace('M', 'L') + ' Z';
  const lungOut = outer(0.86), lungIn = outer(0.62 - 0.1 * ph).reverse();
  const lungD = toD(lungOut) + ' ' + toD(lungIn).replace('M', 'L') + ' Z';
  const sag = 92 + 46 * ph;
  const air = Array.from({length: 3}, (_, i) => {
    const u = ((t * 1.3 + i / 3) % 1), x = -330 + (ph > 0.5 ? 1 : -1) * 0;
    const dir = Math.sin((2 * Math.PI * (t - 12.75)) / 1.15) > 0 ? 1 : -1;   // in while the sling pulls down
    const xx = dir > 0 ? x - 60 + 90 * u : x + 30 - 90 * u;
    return <path key={i} d={`M ${xx} -8 l ${dir * 18} 14 l ${-dir * 18} 14`} stroke={GOLD} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />;
  });
  return (
    <div style={{position: 'absolute', left: 540, top: XCY, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id="sxr">
        <g transform="translate(36 -30) scale(1.12)">
          {/* head + neck bones (front, left) */}
          <ellipse cx={-300} cy={10} rx={46} ry={36} fill="#DCD3BC" stroke={INK} strokeWidth={5} />
          <circle cx={-316} cy={0} r={8} fill="#16223A" />
          <path d="M -258 20 Q -235 40 -215 50" stroke="#DCD3BC" strokeWidth={18} strokeLinecap="round" fill="none" />
          {air}
          {/* lungs (pink) fill and empty */}
          <path d={lungD} fill="#E98FA0" opacity={0.75} stroke="#F7B9C5" strokeWidth={4} />
          {/* guts */}
          <ellipse cx={0} cy={sag - 52} rx={150} ry={50} fill="#E8A65A" opacity={0.85} stroke="#F2C48C" strokeWidth={4} />
          {/* the muscle sling */}
          <path d={`M -215 70 Q 0 ${sag * 2 - 70} 215 70`} stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d={`M -215 70 Q 0 ${sag * 2 - 70} 215 70`} stroke="#D2453C" strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d={`M -215 70 Q 0 ${sag * 2 - 70} 215 70`} stroke="#F08A7E" strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray="14 12" />
          {/* shell (bone) and the flat bottom plate */}
          <path d={shellD} fill="#E5DBC2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -240 160 H 240 L 228 186 H -228 Z" fill="#E5DBC2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d="M -232 66 L -236 160 M 232 66 L 236 160" stroke="#E5DBC2" strokeWidth={16} />
        </g>
        <Scan t={t} />
      </XFrame>
      <Card text="X-RAY: TURTLE" top={88} size={48} />
      <Card text="MUSCLE SLING" top={742} left={450} color={GOLD} rot={-3} s={popIn(t, T.sling - 0.06, 0.3)} size={54} />
      <Card text="LUNGS" top={300} left={300} color="#fff" rot={-6} s={pulse(t, 12.95, 0.5)} size={44} />
    </div>
  );
};

// ---------- the story over time ----------
const guyAt = (t: number): GuyS => {
  const g: GuyS = {mood: 'smug', arms: ARM.cross, headIn: 0, headDy: 0, headRot: 0, tint: 0, bulge: 0, lock: 0, rot: 0, sx: 1, sy: 1, dx: 0, look: -0.4, sweat: 0};
  // nudge on every ball (he does not flinch)
  for (const h of HITS) if (h.tb !== GAG_HIT && t >= h.tb) g.dx += h.side * -spring(t, h.tb, 5, 3, 7);
  if (t < 1.62) return g;
  if (t < 3.52) {
    // the proud deep breath that the shell won't allow
    const up = eio(seg(t, T.never, 2.42));
    g.arms = blendArms(ARM.cross, ARM.clutch, eio(seg(t, 1.75, 2.1)));
    g.mood = t < T.never ? 'smug' : t < LOCK ? 'inhale' : t < T.again ? 'strain' : 'gasp';
    g.headDy = -10 * up * (t < LOCK ? 1 : 1 - seg(t, LOCK, LOCK + 0.2)) + spring(t, LOCK, 6, 4, 6);
    g.headRot = -4 * up * (t < LOCK ? 1 : 0);
    g.bulge = t < LOCK ? seg(t, 2.25, LOCK) : Math.max(0, -spring(t, LOCK, 1, 5, 7));
    g.sy = 1 + 0.03 * up * (t < LOCK ? 1 : 0) - spring(t, LOCK, 0.03, 4, 6);
    g.lock = popIn(t, LOCK, 0.22);
    g.tint = seg(t, LOCK + 0.05, 3.2);
    g.sweat = seg(t, 2.9, 3.1);
    g.look = 0;
    return g;
  }
  if (t < 11.18) {   // during the X-rays: worried, watching
    g.mood = t < 8.1 ? 'worry' : 'sad'; g.arms = ARM.down; g.look = 0.5;
    return g;
  }
  if (t < 12.62) {   // the gag: he copies the turtle's trick, head into the shell -> the air is squeezed out of him
    g.arms = ARM.down;
    g.mood = t < GAG_IN ? 'shock' : t < GAG_OUT ? 'shock' : t < 12.08 ? 'gasp' : 'dizzy';
    g.look = 1;
    g.headIn = t < GAG_OUT ? eout(seg(t, GAG_IN - 0.08, GAG_IN + 0.04)) : 1 - backOutLocal(seg(t, GAG_OUT, GAG_OUT + 0.16));
    g.tint = t > GAG_OUT ? 0.85 * (1 - seg(t, 12.3, 12.62)) : 0;
    g.sx = 1 - 0.06 * Math.exp(-6 * Math.max(0, t - GAG_PFFT)) * (t > GAG_PFFT ? 1 : 0);
    g.rot = t > GAG_PFFT && t < GAG_OUT ? 3 * Math.sin(t * 70) * Math.exp(-3 * (t - GAG_PFFT)) : 0;
    g.arms = blendArms(ARM.down, ARM.up, t > GAG_PFFT && t < GAG_OUT + 0.3 ? 0.35 + 0.25 * Math.sin(t * 40) : 0);
    g.sweat = t > GAG_OUT ? 1 : 0;
    return g;
  }
  if (t < 15.1) { g.mood = 'worry'; g.arms = ARM.down; g.look = 1; return g; }
  if (t < 16.12) {   // "You don't have one."
    g.mood = 'sad'; g.arms = blendArms(ARM.down, ARM.shrug, eio(seg(t, 15.2, 15.5))); g.look = 0; g.headRot = 6 * eio(seg(t, 15.2, 15.5));
    return g;
  }
  // "So he stopped dodging. Now he just stands there."
  g.arms = blendArms(ARM.shrug, ARM.cross, eio(seg(t, 16.15, 16.5)));
  g.mood = t < 16.35 ? 'sad' : 'smug';
  g.headRot = 6 * (1 - eio(seg(t, 16.15, 16.5)));
  return g;
};
function backOutLocal(u: number) { return u <= 0 ? 0 : u >= 1 ? 1 : 1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2); }
const turtleAt = (t: number): {mood: TMood; neck: number; look: number} => {
  if (t > 3.0 && t < 3.6) return {mood: 'laugh', neck: 1, look: -1};
  if (t > 11.95 && t < 12.75) return {mood: 'laugh', neck: 1, look: -1};
  // the turtle shows how it's done just before he tries: head in (hiss) and back out
  if (t > 11.17 && t < 11.7) return {mood: 'smug', neck: 1 - eout(seg(t, 11.18, 11.27)) + eout(seg(t, 11.48, 11.62)), look: -1};
  if (t > 12.75 && t < 15.1) return {mood: 'proud', neck: 1, look: -1};
  return {mood: 'smug', neck: 1, look: -1};
};

/** caption band per shot (screen y): below his face in the close-up */
const capY = (t: number) => (t >= 1.62 && t < 3.52 ? 1490 : 1310);

export const TurtleScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: -40, y: -160, k: 2.85}, {t: 1.6, x: -40, y: -160, k: 2.95},              // smug in the shell, BONK BONK
    {t: 1.62, x: GX + 4, y: -200, k: 3.8}, {t: 3.5, x: GX + 4, y: -204, k: 3.92},       // close-up: the deep breath that won't fit
    {t: 3.52, x: TX - 162, y: -182, k: 2.42}, {t: 8.08, x: TX - 128, y: -200, k: 2.78}, // the turtle, behind its X-ray (slow push-in)
    {t: 8.1, x: GX + 60, y: -175, k: 2.7}, {t: 11.16, x: GX + 60, y: -175, k: 2.85},   // him, behind YOUR RIBS
    {t: 11.18, x: 12, y: -178, k: 2.72}, {t: 12.6, x: 8, y: -180, k: 2.88},            // the gag: two-shot (his face + the turtle's shell front)
    {t: 12.62, x: TX - 150, y: -190, k: 2.5}, {t: 15.08, x: TX - 135, y: -190, k: 2.6}, // the turtle, behind the sling X-ray
    {t: 15.1, x: GX + 6, y: -186, k: 3.6}, {t: 16.1, x: GX + 6, y: -188, k: 3.75},     // "You don't have one."
    {t: 16.12, x: -40, y: -160, k: 2.55}, {t: 19.5, x: -40, y: -160, k: 2.85},          // he just stands there = frame 0
  ], t);
  const sh = shake(t, hit(t, 0, 7, 7) + hit(t, 0.95, 5, 7) + hit(t, LOCK, 9, 6) + hit(t, T.locked2, 4, 7) + hit(t, GAG_PFFT, 6, 6) + hit(t, GAG_HIT, 6, 7)
    + hit(t, 16.9, 4, 7) + hit(t, 17.6, 4, 7) + hit(t, 18.3, 4, 7) + hit(t, 19.0, 4, 7));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t), tt = turtleAt(t);
  const hx = GX + g.dx, hy = -235 + g.headDy + 140 * g.headIn;
  // inserts
  const txS = popIn(t, 3.56, 0.35) * (1 - seg(t, 7.92, 8.08));
  const yxS = popIn(t, 8.12, 0.35) * (1 - seg(t, 11.06, 11.17));
  const sxS = popIn(t, 12.66, 0.35) * (1 - seg(t, 14.92, 15.08));
  // stickers
  const bonk0 = t < 0.45 ? 1 : 1 - seg(t, 0.45, 0.6);
  const bonk1 = pulse(t, 0.95, 0.45), stuck = pulse(t, LOCK + 0.04, 0.2), noAir = pulse(t, T.again, 0.25);
  const pfft = pulse(t, GAG_PFFT, 0.45), bonkG = pulse(t, GAG_HIT, 0.3), hiss = pulse(t, 11.2, 0.12);
  const noSling = pulse(t, T.one - 0.05, 0.4);
  const endB = [16.9, 17.6, 18.3, 19.0].map((b) => pulse(t, b, 0.38));
  const stars = t > GAG_OUT + 0.1 && t < 12.62 ? 1 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Defs />
      <Sky />
      <Layer cam={cam} z={2600} paper={false}>
        <W><g>
          {[-1100, -400, 450, 1150].map((x, i) => <ellipse key={i} cx={x} cy={-30} rx={430} ry={170} fill="#CFE6B8" stroke={INK} strokeWidth={6} />)}
          {[[-760, -120], [-60, -150], [820, -110]].map(([x, y], i) => <g key={i}>
            <rect x={x - 16} y={y + 40} width={32} height={110} fill="#9A6B45" stroke={INK} strokeWidth={6} />
            <circle cx={x} cy={y} r={78} fill="#8CC774" stroke={INK} strokeWidth={6} />
          </g>)}
        </g></W>
        <Ground y={0} color="#DDEFC7" />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Ground y={0} line color="#CDE5B0" />
        <Turtle t={t} mood={tt.mood} neck={tt.neck} look={tt.look} />
        <ShellGuy t={t} g={g} />
        <Balls t={t} />
        {/* air squeezed out of every opening */}
        {[[-82, -152, -1, -0.3], [82, -152, 1, -0.3], [-46, -30, -1, 0.15], [46, -30, 1, 0.15]].map(([x, y, sd, vy], i) => (
          <Puffs key={i} t={t} born={GAG_PFFT} x={hx + x} y={y} n={7} life={0.7} size={27} vx={sd * 230} vy={vy * 260} color="#FFFFFF" seed={11 + i * 7} />
        ))}
      </Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={hx + Math.cos(a) * 92} y={hy - 92 + Math.sin(a) * 16} s={stars * 0.5} rot={t * 200} />;
        })}
        {thumb ? null : <>
        <Txt x={GX - 34} y={-128} s={bonk0} text="BONK" size={50} rot={-9} fill={GOLD} />
        <Txt x={GX + 34} y={-128} s={bonk1} text="BONK" size={50} rot={8} fill={GOLD} />
        <Txt x={GX + 30} y={-334} s={stuck} text="STUCK" size={44} rot={7} fill={RED} />
        <Txt x={GX + 20} y={-334} s={noAir} text="NO AIR" size={44} rot={-6} fill="#FFFFFF" />
        <Txt x={TX - 330} y={-310} s={hiss} text="HISS" size={46} rot={-6} fill="#FFFFFF" />
        <Txt x={GX + 24} y={-306} s={pfft} text="PFFFT" size={54} rot={-8} fill="#FFFFFF" />
        <Txt x={GX + 120} y={-330} s={bonkG} text="BONK" size={50} rot={8} fill={GOLD} />
        <Txt x={GX + 20} y={-330} s={noSling} text="NO SLING" size={40} rot={-5} fill={RED} />
        {endB.map((s, i) => <Txt key={i} x={GX + (i % 2 ? 34 : -34)} y={-128} s={s} text="BONK" size={50} rot={i % 2 ? 8 : -9} fill={GOLD} />)}
        </>}
      </Layer>
      <TurtleXRay t={t} s={txS} />
      <YourXRay t={t} s={yxS} />
      <SlingXRay t={t} s={sxS} />
      {thumb ? null : <>
        <Captions t={t} words={WORDS} y={capY(t)} size={80} />
        <CommentBubble t={t} text="what if you had a turtle's shell??" handle="@slow_n_steady" likes="3.1K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so + 0.05} until={DURATION - LOOP_DUR - 0.4} text="Still want the shell?" />
      </>}
    </AbsoluteFill>
  );
};

export const TurtleVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -29): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -18 : db}));
  const ball = (tb: number, db = -14): Cue[] => [{f: 'whoosh.wav', at: tb - 0.26, db: -30}, {f: 'bonk.wav', at: tb, db}];
  const cues: Cue[] = [
    // frame 0: a dodgeball BONKs off his shell
    {f: 'bonk.wav', at: 0, db: -9}, {f: 'pop.wav', at: 0.02, db: -26}, {f: 'whoosh.wav', at: 0.04, db: -26},
    ...ball(0.95, -13),
    // the deep breath that won't fit: gasp, CLACK, strain
    {f: 'whoosh.wav', at: 1.6, db: -30}, {f: 'gasp.wav', at: 2.12, db: -24}, {f: 'clack.wav', at: LOCK - 0.015, db: -10}, {f: 'pop.wav', at: LOCK + 0.05, db: -22},
    {f: 'strain.mp3', at: 2.75, db: -28, to: 0.55}, {f: 'crowd_laugh.wav', at: 3.05, db: -34, to: 0.5},
    // X-ray 1: the turtle's ribs are its shell, 50 bones, LOCKED
    {f: 'whoosh.wav', at: 3.5, db: -28}, {f: 'zap.wav', at: 3.56, db: -27}, {f: 'pop.wav', at: T.ribs, db: -23},
    {f: 'whir.mp3', at: T.part, db: -32, to: 0.6}, {f: 'ding.mp3', at: T.shell2 - 0.05, db: -25},
    ...ticks(COUNT_A, COUNT_B, 16), {f: 'clack.wav', at: T.locked - 0.015, db: -12}, {f: 'pop.wav', at: T.locked + 0.06, db: -22},
    // X-ray 2: YOUR ribs, BREATHE IN, the shell slams, padlocks, 24 -> 0
    {f: 'whoosh.wav', at: 8.06, db: -28}, {f: 'zap.wav', at: 8.12, db: -27}, {f: 'pop.wav', at: T.ribs2, db: -24},
    {f: 'pop.wav', at: T.breathe - 0.1, db: -22},
    {f: 'clack.wav', at: T.locked2 - 0.015, db: -11}, {f: 'pop.wav', at: T.locked2 + 0.13, db: -24}, {f: 'pop.wav', at: T.locked2 + 0.21, db: -24}, {f: 'pop.wav', at: T.locked2 + 0.29, db: -24},
    ...ticks(T.locked2 + 0.06, T.locked2 + 0.36, 6, -27),
    // the gag: the turtle hides (hiss), he copies it -> PFFFT, BONK, gasp, dizzy, laugh
    {f: 'whoosh.wav', at: 11.15, db: -28}, {f: 'hiss.wav', at: 11.19, db: -27, to: 0.4},
    {f: 'whoosh.wav', at: GAG_IN - 0.06, db: -24}, {f: 'pfft.wav', at: GAG_PFFT - 0.02, db: -11},
    ...ball(GAG_HIT, -14), {f: 'pop.wav', at: GAG_OUT, db: -20}, {f: 'gasp.wav', at: GAG_OUT + 0.02, db: -20},
    {f: 'twang.mp3', at: GAG_OUT + 0.04, db: -24, to: 0.5}, {f: 'crowd_laugh.wav', at: 11.98, db: -27, to: 1.1}, {f: 'giggle.mp3', at: 12.2, db: -33, to: 0.6},
    // X-ray 3: the turtle's muscle sling
    {f: 'whoosh.wav', at: 12.6, db: -28}, {f: 'zap.wav', at: 12.66, db: -27}, {f: 'pop.wav', at: T.sling - 0.05, db: -22},
    ...ctaCues(T.cta),
    // "You don't have one." -> he stopped dodging, the balls bounce off
    {f: 'whoosh.wav', at: 15.08, db: -28}, {f: 'pop.wav', at: T.one - 0.03, db: -22},
    {f: 'whoosh.wav', at: 16.1, db: -28}, {f: 'pop.wav', at: T.so + 0.06, db: -27},
    ...ball(16.9), ...ball(17.6, -15), ...ball(18.3, -15), ...ball(19.0, -15),
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<TurtleScene t={0} />}>
        <TurtleScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="turtle/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const TurtleWide: React.FC = () => <WideFit.Provider value={0.72}><TurtleVideo /></WideFit.Provider>;
