// "He's been building a tower to the Moon for 60 years" - a story Short at night. The guy stands on a short tower of
// thin slabs next to his house. The Moon (with a face) drifts away about 3.8 cm a year, so every year he adds one 3.8 cm
// slab: after 60 years they are exactly as close as the night they met. "One more." loops back to the opening hop.
// Everything is drawn in code (no new pictures): night sky, stars, house, tower, Moon.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, Guy, swap, Ball, ObjectFace, FACE0, Face, Star, Badge, W, pen, Pose,
  SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues,
  HookTitle, AskBanner} from './lib/kit';

// voice (take1-trim.mp3) at 0.1 s, last word ends 29.76 s; + ~0.8 s so the loop push starts after it
export const DURATION = 30.6;
// beats (video time) from the word times
export const T = {
  hop: 0.12, slab: 0.42, land: 0.64,              // opening: hop, slide the slab under, land on it
  moon1: 1.7, tall: 3.95, door: 5.25, laugh: 6.5, // "...to the Moon", "It's about as tall as a door.", "People laugh."
  not: 8.05, drifts: 10.15, three: 11.7,          // "not trying to reach the Moon", "drifts away", "three point eight"
  so: 13.95, rewound: 14.65, grow0: 14.75, grow1: 17.55,  // "So every year, his tower grows exactly that much."
  cta: 17.95,
  moon3: 19.85, m1: 21.2,                         // "the Moon is two point three meters farther away"
  and: 22.95, m2: 24.25,                          // "And he's two point three meters higher."
  so2: 25.45, exactly: 26.27, close: 27.1, met: 28.2,
  one: 29.26,                                     // "One more."
};

// ---------- world (z = 1000 units; the guy is ~302 units = ~1.75 m, so 1 m = ~172 units) ----------
export const SH = 6.56;                 // one slab = 3.8 cm
export const N = 60;                    // sixty years
export const TX = 30, SW = 176;         // tower centre x, slab width
export const MX = 340, MR = 150;        // Moon centre x, radius
export const MY0 = -1217;               // Moon centre y at the start
const DRIFT = 44;                       // the cartoon nudge on "drifts away"
export const DOOR = {x: -390, w: 140};  // the house door (as tall as the tower)
export const NAVY = '#1C2850', SLAB_A = '#E7BB83', SLAB_B = '#D49F66', MOON_C = '#F2E8C9', MOON_S = '#DCCDA6', GOLD = '#FFD43B';

/** slabs in the tower (continuous: tower height = SH * n). The montage rewinds to 1966 and builds it again. */
export const slabsAt = (t: number) => {
  if (t < T.slab) return N - 1;
  if (t < T.so) return N;
  if (t < T.rewound) return N * (1 - eio(seg(t, T.so, T.rewound)));
  if (t < T.grow0) return 0;
  if (t < T.grow1) return N * seg(t, T.grow0, T.grow1);
  return N;
};
/** Moon centre y: nudges up on "drifts away"; in the montage it is lower in the past by exactly the missing slabs */
export const moonY = (t: number) => MY0 - DRIFT * eio(seg(t, T.drifts, T.drifts + 1.1)) + (t >= T.so ? (N - slabsAt(t)) * SH : 0);
const hopY = (t: number) => (t < T.hop || t > T.land ? 0 : -92 * Math.sin(Math.PI * seg(t, T.hop, T.land)));
const MY_1966 = MY0 - DRIFT + N * SH;

const moonFace = (t: number): Face => {
  const blink = [2.7, 9.1, 15.9, 21.0, 24.0].some((b) => t > b && t < b + 0.12) ? 1 : 0;
  let f: Face = {...FACE0, lx: -0.55, ly: 0.55};                                                    // fond of him
  if (t > T.moon1) f = {...FACE0, lx: -0.6, ly: 0.6, lid: 0.25};
  if (t > T.tall) f = {...FACE0, lx: -1, ly: 0.8, mouth: 'flat', brow: -6};                       // looks at the door
  if (t > T.laugh - 0.3) f = {...FACE0, lx: -1, ly: 0.35, mouth: 'flat', brow: 12};               // glares at the laughers
  if (t > T.not) f = {...FACE0, lx: -0.6, ly: 0.6, lid: 0.25};
  if (t > T.drifts) f = {...FACE0, open: 1 + spring(t, T.drifts, 0.2, 3, 6), lx: -0.6, ly: 0.6, mouth: 'o', brow: -14, sweat: 0.8}; // oops, drifting
  if (t > T.so - 0.3) f = {...FACE0, lx: -0.6, ly: 0.6};
  if (t > T.so2) f = {...FACE0, lx: -0.6, ly: 0.6, lid: 0.3};
  if (t > T.close) f = {...FACE0, squeeze: 1, mouth: 'grin'};
  if (t > T.met + 0.5) f = {...FACE0, lx: -0.6, ly: 0.6, lid: 0.3};
  if (t > T.one) f = {...FACE0, lx: -0.55, ly: 0.55};
  return {...f, lid: Math.max(f.lid, blink)};
};

type G = {pose: Pose; sx: number; sy: number};
const guyPose = (t: number): G => {
  let g: G = {pose: 'shrug', sx: 1, sy: 1};
  const steps: [number, Pose, Pose][] = [[0.33, 'shrug', 'front_calm'], [T.moon1, 'front_calm', 'lookup'], [T.tall, 'lookup', 'front_calm'],
    [T.laugh + 0.1, 'front_calm', 'shrug'], [T.not, 'shrug', 'lookup'], [T.moon3, 'lookup', 'point_right'], [T.and, 'point_right', 'present'],
    [T.so2, 'present', 'lookup'], [T.met, 'lookup', 'front_wave'], [T.one, 'front_wave', 'shrug']];
  for (const [at, a, b] of steps) if (t >= at - 0.12) g = swap(t, at, a, b);
  // the opening hop: crouch, stretch in the air, squash on landing
  if (t < T.hop) { const c = seg(t, 0, T.hop); g = {...g, sx: 1 + 0.04 * c, sy: 1 - 0.06 * c}; }
  else if (t < T.land) g = {...g, sx: g.sx * 0.98, sy: g.sy * 1.04};
  else g = {...g, sx: g.sx * (1 - spring(t, T.land, -0.04, 3, 7)), sy: g.sy * (1 + spring(t, T.land, -0.07, 3, 7))};
  if (t > T.one) g = {...g, sy: g.sy * (1 + spring(t, T.one, -0.05, 3, 6))};   // takes the weight of the new slab
  return g;
};

// ---------- pieces ----------
/** one slab (centre x, top y) with its ink outline */
const Slab: React.FC<{x: number; y: number; w?: number; fill?: string}> = ({x, y, w = SW, fill = SLAB_A}) => (
  <W>
    <rect x={x - w / 2 - 5} y={y - 5} width={w + 10} height={SH + 10} rx={5} fill={INK} />
    <rect x={x - w / 2} y={y} width={w} height={SH} rx={2} fill={fill} />
  </W>
);
/** the tower: n stacked slabs with one merged outline (ink pass first, then the fills, then thin seams) */
export const Tower: React.FC<{n: number}> = ({n}) => {
  const k = Math.max(0, Math.floor(n + 1e-6));
  const s = Array.from({length: k}, (_, i) => {
    const w = SW + (rnd(i * 5 + 1) - 0.5) * 14, dx = (rnd(i * 7 + 3) - 0.5) * 7;
    return {x: TX + dx - w / 2, y: -(i + 1) * SH, w};
  });
  return (
    <W>
      {s.map((b, i) => <rect key={'o' + i} x={b.x - 5} y={b.y - 5} width={b.w + 10} height={SH + 10} rx={5} fill={INK} />)}
      {s.map((b, i) => <rect key={'f' + i} x={b.x} y={b.y} width={b.w} height={SH + 0.6} rx={2} fill={i % 2 ? SLAB_B : SLAB_A} />)}
      {s.map((b, i) => (i % 10 === 9 ? <line key={'d' + i} x1={b.x + 4} y1={b.y} x2={b.x + b.w - 4} y2={b.y} stroke="#9A6A40" strokeWidth={2.2} /> : null))}
    </W>
  );
};
export const Moon: React.FC<{x: number; y: number; t: number; f: Face; s?: number; blush?: number}> = ({x, y, t, f, s = 1, blush = 0}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${x}px ${y}px`, transform: `scale(${s})`}}>
    <Ball x={x} y={y} r={MR} fill={MOON_C} shade={MOON_S} wobble={0.04} seed={21} />
    <W>
      {[[-95, -70, 26], [92, -60, 20], [-70, 85, 18], [100, 70, 24], [10, -112, 14]].map(([dx, dy, r], i) =>
        <circle key={i} cx={x + dx} cy={y + dy} r={r} fill={MOON_S} stroke={INK} strokeWidth={5} />)}
      {blush > 0.01 ? [-1, 1].map((q) => <ellipse key={q} cx={x + q * 0.56 * MR} cy={y + 0.3 * MR} rx={26 * blush} ry={15 * blush} fill="#FF8E9A" />) : null}
    </W>
    <ObjectFace x={x} y={y + 6} r={MR * 0.92} f={f} t={t} lidColor={MOON_C} />
  </div>
);
/** his house: the door is exactly as tall as the 60-slab tower; the window is lit */
export const House: React.FC<{doorS?: number}> = ({doorS = 1}) => {
  const dh = N * SH, x0 = -720, x1 = -300, wall = 470;
  return (
    <W>
      <rect x={-650} y={-wall - 300} width={64} height={190} fill="#8C4C44" stroke={INK} strokeWidth={8} />
      <rect x={x0} y={-wall} width={x1 - x0} height={wall} fill="#D3CAB7" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d={`M ${x0 - 50} ${-wall + 6} L ${(x0 + x1) / 2} ${-wall - 290} L ${x1 + 50} ${-wall + 6} Z`} fill="#7E3F3A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <g transform={`translate(${DOOR.x} 0) scale(${doorS}) translate(${-DOOR.x} 0)`}>
        <path d={`M ${DOOR.x - DOOR.w / 2} 0 V ${-dh + 24} Q ${DOOR.x - DOOR.w / 2} ${-dh} ${DOOR.x - DOOR.w / 2 + 24} ${-dh} H ${DOOR.x + DOOR.w / 2 - 24}
          Q ${DOOR.x + DOOR.w / 2} ${-dh} ${DOOR.x + DOOR.w / 2} ${-dh + 24} V 0 Z`} fill="#6E4A33" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <circle cx={DOOR.x + 42} cy={-190} r={10} fill={GOLD} stroke={INK} strokeWidth={4} />
      </g>
      <rect x={-670} y={-330} width={130} height={124} rx={8} fill="#FFD86A" stroke={INK} strokeWidth={8} />
      <path d="M -605 -330 V -206 M -670 -268 H -540" stroke={INK} strokeWidth={7} />
    </W>
  );
};
/** night ground: a dark hill, flat where the house and the tower stand */
const Hill: React.FC = () => (
  <W>
    <path d="M -4200 90 C -2600 -70 -1500 0 -860 0 L 760 0 C 1450 0 2500 -90 4200 60 L 4200 6000 L -4200 6000 Z" fill="#2B4A40" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[[-1100, 40], [-180, 60], [420, 30], [980, 70]].map(([x, y], i) =>
      <path key={i} d={`M ${x - 26} ${y + 10} Q ${x - 14} ${y - 22} ${x - 4} ${y + 6} Q ${x + 6} ${y - 30} ${x + 14} ${y + 6} Q ${x + 24} ${y - 18} ${x + 30} ${y + 10}`}
        stroke="#1E3830" strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
  </W>
);
/** vertical double arrow from y0 to y1 (y0 below), drawn from the bottom up with p */
const DimArrow: React.FC<{x: number; y0: number; y1: number; p: number}> = ({x, y0, y1, p}) => {
  if (p <= 0.002) return null;
  const ye = lerp(y0, y1, p), head = (y: number, d: number) => `M ${x - 30} ${y + d * 34} L ${x} ${y} L ${x + 30} ${y + d * 34}`;
  return (
    <W>
      <path d={`M ${x} ${y0} L ${x} ${ye}`} stroke={INK} strokeWidth={24} strokeLinecap="round" />
      <path d={head(y0, -1)} stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {p > 0.9 ? <path d={head(y1, 1)} stroke={INK} strokeWidth={24} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
      <path d={`M ${x} ${y0} L ${x} ${ye}`} stroke={GOLD} strokeWidth={11} strokeLinecap="round" />
      <path d={head(y0, -1)} stroke={GOLD} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {p > 0.9 ? <path d={head(y1, 1)} stroke={GOLD} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </W>
  );
};
/** world text: white (or gold) letters with a thick ink outline */
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const Heart: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M 0 30 C -50 -4 -46 -44 -20 -44 C -8 -44 -2 -36 0 -28 C 2 -36 8 -44 20 -44 C 46 -44 50 -4 0 30 Z" fill="#FF6B7D" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={-20} cy={-26} rx={7} ry={10} fill="#fff" opacity={0.85} transform="rotate(-30 -20 -26)" />
  </g></W>) : null;
/** "HA HA" bubbles from the neighbours (screen space) */
const HaHa: React.FC<{x: number; y: number; s: number; rot: number; text: string; tail: 1 | -1}> = ({x, y, s, rot, text, tail}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`}}>
    <div style={{position: 'relative', background: '#fff', border: `7px solid ${INK}`, borderRadius: 40, padding: '12px 30px', boxShadow: `0 8px 0 ${INK}`,
      fontFamily: FONT, fontWeight: 900, fontSize: 64, color: INK, whiteSpace: 'nowrap', letterSpacing: -1}}>
      {text}
      <svg width={60} height={50} style={{position: 'absolute', bottom: -44, [tail === 1 ? 'left' : 'right']: 26, overflow: 'visible'}}>
        <path d={tail === 1 ? 'M 6 0 L 0 44 L 40 0' : 'M 54 0 L 60 44 L 20 0'} fill="#fff" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <rect x={tail === 1 ? 4 : 18} y={-12} width={40} height={14} fill="#fff" />
      </svg>
    </div>
  </div>) : null;

// stars on the far layer: sparkles (cut paper) and small dots (flat)
const STARS = Array.from({length: 24}, (_, i) => ({x: -1700 + rnd(i * 3 + 1) * 3400, y: -3500 + rnd(i * 5 + 2) * 3900, s: 1.2 + rnd(i * 11 + 4) * 1.1, ph: rnd(i * 13) * 6}));
const DOTS = Array.from({length: 60}, (_, i) => ({x: -1800 + rnd(i * 17 + 5) * 3600, y: -3600 + rnd(i * 19 + 6) * 4000, r: 7 + rnd(i * 23 + 7) * 7}));

export const TowerScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([
    {t: 0, x: 60, y: -750, k: 0.8}, {t: 3.6, x: 60, y: -745, k: 0.83},           // opening: tower, Moon and door in one shot
    {t: 4.0, x: 60, y: -745, k: 0.83}, {t: 5.0, x: -110, y: -690, k: 0.8},        // "as tall as a door": the house comes in
    {t: 7.5, x: -150, y: -690, k: 0.78}, {t: 8.6, x: 120, y: -900, k: 0.86},      // "not trying to reach the Moon"
    {t: 9.9, x: 120, y: -900, k: 0.86}, {t: 11.2, x: 220, y: -1060, k: 1.0},      // the Moon drifts: closer on it
    {t: 13.6, x: 220, y: -1060, k: 1.0}, {t: 14.6, x: 80, y: -700, k: 0.66},      // montage: the whole tower and the Moon
    {t: 25.3, x: 80, y: -700, k: 0.66}, {t: 26.4, x: 160, y: -880, k: 0.8},       // "exactly as close"
    {t: 28.9, x: 160, y: -880, k: 0.8}, {t: 29.9, x: 60, y: -750, k: 0.8},        // "one more": back to the opening framing
  ], t);
  const n = slabsAt(t), top = -SH * n;
  const feet = top + hopY(t);
  const g = guyPose(t);
  const my = moonY(t);
  // the slab he carries: on his palms, then slid under him in the air (opening); back in his hands on "One more"
  const handY = (f: number) => f - 190 * g.sy;
  let held: {y: number} | null = null;
  if (t < 0.3) held = {y: handY(feet) - SH / 2};
  else if (t < T.slab) held = {y: lerp(handY(feet) - SH / 2, -N * SH, eio(seg(t, 0.3, T.slab)))};
  if (t >= T.one) held = {y: handY(feet) - SH / 2 - 14 * (1 - popIn(t, T.one, 0.25))};
  const slabPop = 1 + spring(t, T.slab, 0.25, 4, 9);
  // gags and labels
  const doorS = 1 + spring(t, T.door, 0.08, 3, 6);
  const doorLine = seg(t, T.door, T.door + 0.35) * (1 - seg(t, T.laugh - 0.4, T.laugh - 0.15));
  const ha = (i: number) => popIn(t, T.laugh - 0.1 + i * 0.17, 0.25) * (1 - seg(t, T.not - 0.55, T.not - 0.3));
  const cmS = popIn(t, T.three) * (1 - seg(t, T.so - 0.4, T.so - 0.15));
  const year = Math.round(1966 + slabsAt(t));
  const yearS = popIn(t, T.so, 0.3) * (1 - seg(t, T.grow1 + 0.15, T.grow1 + 0.35));
  const numbersOff = 1 - seg(t, T.so2 - 0.1, T.so2 + 0.15);
  const ghost = popIn(t, T.moon3, 0.3) * numbersOff;
  const moonArrow = eout(seg(t, T.moon3 + 0.55, T.m1)) * numbersOff;
  const towerArrow = eout(seg(t, T.and + 0.6, T.m2)) * numbersOff;
  const lineOn = seg(t, T.grow0, T.grow0 + 0.4) * (1 - seg(t, T.one - 0.35, T.one - 0.1));
  const gold = seg(t, T.exactly, T.exactly + 0.3);
  const sameS = popIn(t, T.close, 0.3) * (1 - seg(t, T.one - 0.35, T.one - 0.1));
  const heart = popIn(t, T.met + 0.05, 0.35) * (1 - seg(t, T.one - 0.35, T.one - 0.1));
  const blush = popIn(t, T.met, 0.3) * (1 - seg(t, T.one - 0.2, T.one));
  // the guy's head top and the Moon's bottom: the line between them never changes length
  const hx = TX, hy = feet - 320, bx = MX - 40, by = my + MR - 6;
  const ang = (Math.atan2(by - hy, bx - hx) * 180) / Math.PI;
  const lineCol = gold > 0 ? GOLD : '#FFF6D6';
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      {/* night sky coloured in with a navy marker: a few slightly different strokes */}
      <AbsoluteFill style={{background: `repeating-linear-gradient(-58deg, transparent 0 210px, rgba(255,255,255,0.025) 210px 330px, transparent 330px 520px)`}} />
      <Layer cam={cam} z={2600} paper={false}>
        <W>{DOTS.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#FFF3C4" opacity={0.55 + 0.35 * Math.sin(t * 2 + i)} />)}</W>
      </Layer>
      <Layer cam={cam} z={2600}>
        {STARS.map((s, i) => <Star key={i} x={s.x} y={s.y} s={s.s * (1 + 0.14 * Math.sin(t * 2.6 + s.ph))} rot={i * 23} />)}
      </Layer>
      {/* soft glows (see-through, so no paper edge): moonlight and the lit window */}
      <Layer cam={cam} z={1000} paper={false}>
        <div style={{position: 'absolute', left: MX - 3.4 * MR, top: my - 3.4 * MR, width: 6.8 * MR, height: 6.8 * MR, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,243,200,0.30) 0%, rgba(255,243,200,0.12) 32%, rgba(255,243,200,0) 62%)'}} />
        <div style={{position: 'absolute', left: -605 - 260, top: -268 - 260, width: 520, height: 520, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,214,110,0.32) 0%, rgba(255,214,110,0) 65%)'}} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Hill />
        <House doorS={doorS} />
        <Tower n={n} />
        {t >= T.slab && t < T.slab + 0.4 ? <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${TX}px ${-N * SH}px`, transform: `scale(${slabPop}, ${2 - slabPop})`}}>
          <Slab x={TX} y={-N * SH} /></div> : null}
        <Guy pose={g.pose} x={TX} y={feet} t={t} sx={g.sx} sy={g.sy} flip={g.pose === 'present'} />
        {held ? <Slab x={TX} y={held.y} fill={SLAB_A} /> : null}
        <Moon x={MX} y={my} t={t} f={moonFace(t)} s={1 + spring(t, T.drifts, 0.05, 3, 6) + spring(t, T.close, 0.06, 3, 6)} blush={blush} />
        {/* "3.8 CM A YEAR" next to the Moon as it nudges away */}
        {cmS > 0.01 ? <W><g transform={`translate(${MX - 300} ${my + 40}) scale(${cmS})`}>
          <path d="M -18 60 L 18 60 L 18 5 L 42 5 L 0 -45 L -42 5 L -18 5 Z" fill={GOLD} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        </g></W> : null}
        <Txt x={MX - 300} y={my - 70} s={cmS} text="3.8 CM" size={70} rot={-6} fill={GOLD} />
        <Txt x={MX - 300} y={my + 140} s={cmS} text="A YEAR" size={52} rot={-6} />
        {/* after 60 years: the Moon is 2.3 m farther, he is 2.3 m higher */}
        <DimArrow x={MX + 205} y0={MY_1966} y1={MY0 - DRIFT} p={moonArrow} />
        <Txt x={MX + 275} y={(MY_1966 + MY0 - DRIFT) / 2} s={popIn(t, T.m1, 0.3) * numbersOff} text="+2.3 M" size={64} rot={-90} fill={GOLD} />
        <DimArrow x={TX - 165} y0={0} y1={-N * SH} p={towerArrow} />
        <Txt x={TX - 235} y={-N * SH / 2} s={popIn(t, T.m2, 0.3) * numbersOff} text="+2.3 M" size={64} rot={-90} fill={GOLD} />
        <Txt x={(hx + bx) / 2 - 95} y={(hy + by) / 2 - 40} s={sameS} text="SAME" size={64} rot={ang} fill={GOLD} />
        <Heart x={(hx + bx) / 2 + 70} y={(hy + by) / 2 + 30} s={1.5 * heart * (1 + 0.05 * Math.sin(t * 7))} />
      </Layer>
      {/* thin see-through doodles on top: the door comparison, the ghost of the 1966 Moon, the line between the two friends */}
      <Layer cam={cam} z={1000} paper={false}>
        <W>
          {doorLine > 0 ? <path d={`M ${TX - SW / 2 - 6} ${-N * SH} L ${DOOR.x + DOOR.w / 2 + 8} ${-N * SH}`} stroke={GOLD} strokeWidth={9}
            strokeDasharray="26 18" strokeLinecap="round" {...pen(doorLine)} /> : null}
          {ghost > 0.01 ? <g transform={`translate(${MX} ${MY_1966}) scale(${ghost})`}>
            <circle cx={0} cy={0} r={MR} fill="none" stroke="#FFF6D6" strokeWidth={8} strokeDasharray="24 20" opacity={0.85} />
            <text x={0} y={8} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill="#FFF6D6" opacity={0.85}>1966</text>
          </g> : null}
          {lineOn > 0 ? <path d={`M ${hx} ${hy} L ${bx} ${by}`} stroke={lineCol} strokeWidth={8 + 4 * gold} strokeDasharray="26 20" strokeLinecap="round"
            strokeDashoffset={-t * 30} {...pen(lineOn)} /> : null}
        </W>
      </Layer>
      <HaHa x={225} y={1010} s={ha(0)} rot={-9} text="HA HA" tail={1} />
      <HaHa x={790} y={880} s={ha(1)} rot={8} text="HA HA" tail={-1} />
      <HaHa x={300} y={760} s={ha(2)} rot={5} text="HAHAHA" tail={1} />
      <Badge text={String(year)} s={yearS} y={330} />
      <HookTitle t={t} text="60 YEARS TO BUILD THIS" hi="THIS" y={320} />
      <CallToAction t={t} at={T.cta} />
    </AbsoluteFill>
  );
};

export const TowerVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks: Cue[] = [];
  for (let i = 1; i <= N; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.grow0, T.grow1, i / N) - 0.01, db: i === N ? -18 : -31});
  const crickets: Cue[] = [];
  for (let a = 0; a < DURATION; a += 1.96) crickets.push({f: 'crickets.mp3', at: a, db: -31});
  const cues: Cue[] = [
    ...crickets,
    {f: 'pop.wav', at: T.slab, db: -16}, {f: 'tick.wav', at: T.land, db: -22},
    {f: 'pop.wav', at: T.door, db: -20},
    {f: 'giggle.mp3', at: T.laugh - 0.05, db: -27, to: 1.3},
    {f: 'pop.wav', at: T.laugh - 0.1, db: -24}, {f: 'pop.wav', at: T.laugh + 0.07, db: -25}, {f: 'pop.wav', at: T.laugh + 0.24, db: -25},
    {f: 'whoosh.wav', at: T.drifts - 0.1, db: -30}, {f: 'pop.wav', at: T.three, db: -21},
    {f: 'pop.wav', at: T.so, db: -22}, {f: 'whir.mp3', at: T.so, db: -28, to: 0.75},
    ...ticks, {f: 'ding.mp3', at: T.grow1 + 0.02, db: -26},
    ...ctaCues(T.cta),
    {f: 'pop.wav', at: T.moon3, db: -24}, {f: 'pop.wav', at: T.m1, db: -21}, {f: 'pop.wav', at: T.m2, db: -21},
    {f: 'ding.mp3', at: T.close, db: -22}, {f: 'pop.wav', at: T.met + 0.05, db: -21}, {f: 'chirp.wav', at: T.met + 0.1, db: -27},
    {f: 'pop.wav', at: T.one, db: -17},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},   // the loop push back to the opening shot
  ];
  return (
    <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<TowerScene t={0} />}>
        <TowerScene t={t} />
      </LoopOut>
      <AskBanner />
      <Look />
      <SoundLayer voice="tower/vo/take1-trim.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const TowerWide: React.FC = () => <WideFit.Provider value={0.72}><TowerVideo /></WideFit.Provider>;
