// "This tiny bridge joins two continents" - a story Short. In Iceland the North American and Eurasian plates pull
// apart about 2 cm a year. The guy lives on one plate, his neighbour (red bobble hat) on the other, and every year he
// adds a 2 cm plank to the little bridge over the crack between them. Fifty years, one metre. Every morning they still
// meet in the middle for coffee. "One more." loops back to the opening plank drop. Everything is drawn in code.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, Guy, swap, Badge, W, pen, Pose, Sky, Puffs, HEAD_R,
  SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd, shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues,
  HookTitle, AskBanner} from './lib/kit';

// voice (take1-trim.mp3) at 0.1 s: video time = Scribe time + ~0.1; last word ends 28.82 s; + ~0.8 s for the loop push
export const DURATION = 29.6;
export const T = {
  drop: 0.35, bridge: 0.9, conts: 2.1,                    // "This tiny bridge joins two continents."
  longer: 3.3, fifty: 5.7,                                // "He's made it longer every year, for fifty years."
  see: 7.38, house: 8.26, na: 9.14,                       // "See, his house sits on the North American plate."
  neigh: 10.74, eu: 12.18,                                // "His neighbor's sits on the Eurasian plate."
  ice: 13.7, pull: 15.12, cm: 16.18,                      // "And here in Iceland, they pull apart about two centimeters a year."
  so: 18.18, rewound: 18.85, grow0: 18.95, grow1: 20.95,  // "So every year, he adds two centimeters."
  cta: 21.3,
  fifty2: 21.7, meter: 22.9,                              // "Fifty years, one meter."
  morning: 24.18, meet: 25.94, coffee: 26.82,             // "And every morning, they still meet in the middle for coffee."
  back: 27.65, one: 28.1,                                 // "One more."
};

// ---------- world (the guy is ~300 units = ~1.75 m, so 1 m = ~172 units; one plank = 2 cm) ----------
export const N = 50;                    // fifty years
export const PW = 3.44;                 // one 2 cm plank
export const OV = 34;                   // the bridge rests this far on each side
export const DECK = 14;                 // deck thickness (sits on the ground, top at -DECK)
export const GRASS = '#93B95A', ROCK = '#8C8178', ROCK2 = '#776C64', CHASM = '#2E2A35', WOOD = '#D9A86A', WOOD2 = '#C08F55', GOLD = '#FFD43B';
export const HAT = '#E2453C';

/** planks across the gap (the gap is exactly that many planks wide). The montage rewinds to 1976 and builds it again. */
export const planksAt = (t: number) => {
  if (t < T.so) return N;
  if (t < T.rewound) return N * (1 - eio(seg(t, T.so, T.rewound)));
  if (t < T.grow0) return 0;
  if (t < T.grow1) return N * seg(t, T.grow0, T.grow1);
  return N;
};
/** gap between the plates, plus a cartoon wobble when they "pull apart" */
export const gapAt = (t: number) => planksAt(t) * PW + 14 * Math.sin(Math.PI * seg(t, T.pull, T.pull + 0.7)) * (t < T.so ? 1 : 0);

// ---------- pieces ----------
/** the crack profile: both plate edges share it, so at gap 0 they fit together like a torn page */
const JAG = Array.from({length: 26}, (_, i) => ({y: i * 60, x: i === 0 ? 0 : (rnd(i * 13 + 2) - 0.5) * 34}));
const edge = (dx: number, dir: 1 | -1) => JAG.map((p) => `L ${dx + p.x} ${p.y}`).join(' ') + (dir ? '' : '');
const STRATA = [140, 300, 520, 760];
/** one plate: a big cut-paper slab with grass on top; side -1 = left (inner edge at gx), 1 = right */
const Plate: React.FC<{side: -1 | 1; gx: number}> = ({side, gx}) => {
  const far = side * 4200, bottom = 1600;
  const d = side < 0
    ? `M ${far} 0 L ${gx} 0 ${edge(gx, 1)} L ${far} ${bottom} Z`
    : `M ${far} 0 L ${gx} 0 ${edge(gx, 1)} L ${far} ${bottom} Z`;
  return (
    <W>
      <clipPath id={`pl${side}`}><path d={d} /></clipPath>
      <path d={d} fill={ROCK} />
      <g clipPath={`url(#pl${side})`}>
        {STRATA.map((y, i) => <path key={i} d={`M ${gx - side * 0 - 4300} ${y} ${Array.from({length: 70}, (_, k) => `Q ${gx - 4300 + k * 125 + 31} ${y + (k % 2 ? 14 : -14)} ${gx - 4300 + k * 125 + 62} ${y}`).join(' ')}`}
          stroke={ROCK2} strokeWidth={10} fill="none" strokeLinecap="round" />)}
        {Array.from({length: 18}, (_, i) => {
          const x = gx + side * (60 + rnd(i * 7 + side) * 1100), y = 90 + rnd(i * 5 + 9) * 900;
          return <ellipse key={i} cx={x} cy={y} rx={16 + rnd(i) * 18} ry={10 + rnd(i + 3) * 8} fill={ROCK2} />;
        })}
        <rect x={-6000} y={-2} width={12000} height={30} fill={GRASS} />
        <path d={`M -6000 28 ${Array.from({length: 120}, (_, k) => `L ${-6000 + k * 100 + 50} ${k % 2 ? 40 : 26}`).join(' ')}`} stroke="#7AA046" strokeWidth={8} fill="none" />
      </g>
      <path d={d} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    </W>
  );
};
/** the bridge: deck of 2 cm planks from x0 to x1 (deck top at -DECK), a post at each end and a sagging rope rail */
const Bridge: React.FC<{x0: number; x1: number; pop?: number}> = ({x0, x1, pop = 1}) => {
  const n = Math.max(1, Math.round((x1 - x0) / PW));
  const w = (x1 - x0) / n;
  const top = -DECK * pop;
  const rail = -96, span = x1 - x0;
  return (
    <W>
      {/* posts */}
      {[x0 + 8, x1 - 8].map((x, i) => <g key={i}>
        <rect x={x - 9} y={rail - 14} width={18} height={-rail + 14 + top + 2} rx={4} fill={WOOD2} stroke={INK} strokeWidth={6} />
        <circle cx={x} cy={rail - 14} r={11} fill={WOOD} stroke={INK} strokeWidth={6} />
      </g>)}
      {/* rope rail */}
      <path d={`M ${x0 + 8} ${rail} Q ${(x0 + x1) / 2} ${rail + 18 + span * 0.12} ${x1 - 8} ${rail}`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d={`M ${x0 + 8} ${rail} Q ${(x0 + x1) / 2} ${rail + 18 + span * 0.12} ${x1 - 8} ${rail}`} stroke="#E9D6A8" strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* deck: ink pass, plank fills, seams */}
      <rect x={x0 - 5} y={top - 5} width={x1 - x0 + 10} height={-top + 8} rx={5} fill={INK} />
      {Array.from({length: n}, (_, i) => <rect key={i} x={x0 + i * w} y={top} width={w + 0.6} height={-top} fill={i % 2 ? WOOD2 : WOOD} />)}
    </W>
  );
};
/** one plank held flat in the hands (seen a bit from above, so it reads as a board) */
const HeldPlank: React.FC<{x: number; y: number; w?: number; rot?: number}> = ({x, y, w = 120, rot = 0}) => (
  <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 - 5} y={-14} width={w + 10} height={28} rx={6} fill={INK} />
    <rect x={-w / 2} y={-9} width={w} height={18} rx={3} fill={WOOD} />
    <path d={`M ${-w / 2 + 10} -1 H ${w / 2 - 30}`} stroke={WOOD2} strokeWidth={3} strokeLinecap="round" />
  </g></W>
);
/** a little Icelandic house: corrugated walls, red roof, lit window */
const House: React.FC<{x: number; wall: string; roof: string; flip?: boolean}> = ({x, wall, roof, flip}) => {
  const w = 300, h = 230, f = flip ? -1 : 1;
  return (
    <W><g transform={`translate(${x} 0) scale(${f} 1)`}>
      <rect x={-w / 2} y={-h} width={w} height={h} fill={wall} stroke={INK} strokeWidth={8} />
      {Array.from({length: 9}, (_, i) => <line key={i} x1={-w / 2 + 30 + i * 30} y1={-h + 8} x2={-w / 2 + 30 + i * 30} y2={-6} stroke={INK} strokeOpacity={0.18} strokeWidth={5} />)}
      <path d={`M ${-w / 2 - 30} ${-h + 4} L 0 ${-h - 150} L ${w / 2 + 30} ${-h + 4} Z`} fill={roof} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <rect x={60} y={-h - 120} width={36} height={80} fill="#9A9089" stroke={INK} strokeWidth={6} />
      <rect x={-110} y={-150} width={80} height={80} rx={6} fill="#FFD86A" stroke={INK} strokeWidth={7} />
      <path d="M -70 -150 V -70 M -110 -110 H -30" stroke={INK} strokeWidth={5} />
      <rect x={30} y={-140} width={70} height={140} rx={6} fill="#5C4A3C" stroke={INK} strokeWidth={7} />
      <circle cx={88} cy={-70} r={6} fill={GOLD} stroke={INK} strokeWidth={3} />
    </g></W>
  );
};
/** distant Icelandic mountains with snow caps (far layer) */
const Mountains: React.FC = () => (
  <W>
    <path d="M -2600 120 L -1900 -420 L -1600 -250 L -1150 -640 L -760 -330 L -420 -520 L 40 -180 L 420 -560 L 760 -300 L 1150 -700 L 1600 -320 L 2000 -460 L 2600 120 Z"
      fill="#A9BCC7" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[[-1150, -640], [420, -560], [1150, -700], [-420, -520]].map(([x, y], i) =>
      <path key={i} d={`M ${x - 95} ${y + 100} L ${x} ${y} L ${x + 95} ${y + 100} L ${x + 45} ${y + 80} L ${x + 10} ${y + 110} L ${x - 30} ${y + 78} Z`}
        fill="#FFFFFF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
    <path d="M -2600 60 L 2600 60 L 2600 900 L -2600 900 Z" fill="#B9C98F" stroke={INK} strokeWidth={8} />
  </W>
);
/** the morning Sun with a sleepy-happy face */
const Sun: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => (
  <W><g transform={`translate(${x} ${y}) rotate(${t * 12})`}>
    {Array.from({length: 10}, (_, i) => <path key={i} transform={`rotate(${i * 36})`} d="M -16 -150 L 0 -200 L 16 -150 Z" fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
    <circle r={130} fill={GOLD} stroke={INK} strokeWidth={8} />
  </g><g transform={`translate(${x} ${y})`}>
    <path d="M -60 -10 Q -42 -28 -24 -10 M 24 -10 Q 42 -28 60 -10" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M -40 30 Q 0 66 40 30" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
    <ellipse cx={-78} cy={26} rx={20} ry={12} fill="#FF9E6E" /><ellipse cx={78} cy={26} rx={20} ry={12} fill="#FF9E6E" />
  </g></W>
);
/** a coffee mug with steam */
const Mug: React.FC<{x: number; y: number; s: number; color: string; flip?: boolean; rot?: number}> = ({x, y, s, color, flip, rot = 0}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    <path d="M 18 -30 Q 42 -30 42 -14 Q 42 2 18 0" stroke={INK} strokeWidth={14} fill="none" />
    <path d="M 18 -30 Q 42 -30 42 -14 Q 42 2 18 0" stroke={color} strokeWidth={5} fill="none" />
    <rect x={-24} y={-44} width={46} height={52} rx={8} fill={color} stroke={INK} strokeWidth={7} />
    <rect x={-17} y={-40} width={32} height={8} rx={3} fill="#6B4226" />
  </g></W>) : null;
/** world text: white (or gold) letters with a thick ink outline */
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
/** fat outlined arrow pointing along rot (0 = right) */
const PushArrow: React.FC<{x: number; y: number; s: number; rot: number}> = ({x, y, s, rot}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -80 -22 L 20 -22 L 20 -56 L 86 0 L 20 56 L 20 22 L -80 22 Z" fill="#F0503C" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
  </g></W>) : null;
/** horizontal double arrow from x0 to x1 drawn outward from the middle with p */
const DimArrow: React.FC<{x0: number; x1: number; y: number; p: number}> = ({x0, x1, y, p}) => {
  if (p <= 0.002) return null;
  const m = (x0 + x1) / 2, a = lerp(m, x0, p), b = lerp(m, x1, p);
  const head = (x: number, d: number) => `M ${x + d * 26} ${y - 24} L ${x} ${y} L ${x + d * 26} ${y + 24}`;
  return (
    <W>
      {[[INK, 22], [GOLD, 10]].map(([c, w], i) => <g key={i}>
        <path d={`M ${a} ${y} L ${b} ${y}`} stroke={c as string} strokeWidth={w as number} strokeLinecap="round" />
        {p > 0.9 ? <path d={head(x0, 1)} stroke={c as string} strokeWidth={w as number} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        {p > 0.9 ? <path d={head(x1, -1)} stroke={c as string} strokeWidth={w as number} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
      </g>)}
    </W>
  );
};
/** red knit bobble hat on a head (centre hx, hy, radius r) - the neighbour wears it; the guy never wears anything */
export const BobbleHat: React.FC<{hx: number; hy: number; r?: number}> = ({hx, hy, r = HEAD_R}) => (
  <W><g transform={`translate(${hx} ${hy}) scale(${r / 64})`}>
    <circle cx={0} cy={-92} r={20} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <path d="M -64 -22 A 64 64 0 0 1 64 -22 Z" fill={HAT} stroke={INK} strokeWidth={7} strokeLinejoin="round" transform="scale(1.06)" />
    <path d="M -46 -50 L -38 -36 M -18 -62 L -14 -46 M 14 -62 L 12 -46 M 42 -52 L 36 -38" stroke="#B5302A" strokeWidth={5} strokeLinecap="round" />
    <rect x={-72} y={-34} width={144} height={26} rx={12} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <path d="M -50 -21 h 8 M -26 -21 h 8 M -2 -21 h 8 M 22 -21 h 8 M 46 -21 h 8" stroke={HAT} strokeWidth={6} strokeLinecap="round" />
  </g></W>
);
/** head centre of the guy cut-out for a pose standing at (x, y) */
export const headOf = (pose: Pose, x: number, y: number, flip = false, sy = 1) => {
  const m = (LIB_M as any)[pose]; const s = HEAD_R / m.head[2];
  return {x: x + (flip ? -1 : 1) * (m.head[0] - m.feet[0]) * s, y: y - (m.feet[1] - m.head[1]) * s * sy};
};
/** Iceland doodle sticker with the rift drawn through it (screen space) */
const IcelandMap: React.FC<{s: number; t: number}> = ({s, t}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top: 560, transform: `translate(-50%,-50%) rotate(-4deg) scale(${0.9 * s})`}}>
    <svg width={560} height={430} viewBox="-280 -200 560 430" style={{overflow: 'visible'}}>
      <rect x={-270} y={-190} width={540} height={410} rx={34} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
      <path d="M -210 30 L -170 -10 L -205 -50 L -150 -62 L -110 -110 L -40 -80 L 10 -128 L 70 -96 L 128 -118 L 180 -78 L 222 -40 L 206 6 L 228 50 L 168 92 L 84 118 L 2 124 L -70 104 L -128 76 L -186 82 Z"
        fill="#B9D27C" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -120 100 L -60 40 L 0 -10 L 30 -60 L 60 -120" stroke="#F0503C" strokeWidth={10} strokeDasharray="22 16" strokeLinecap="round" fill="none"
        strokeDashoffset={-t * 40} />
      <text x={0} y={186} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>ICELAND</text>
    </svg>
  </div>) : null;

// ---------- the cast over time ----------
type G = {pose: Pose; sx: number; sy: number; flip: boolean};
const step = (t: number, steps: [number, Pose, Pose, boolean?][], first: Pose, flip0: boolean): G => {
  let g: G = {pose: first, sx: 1, sy: 1, flip: flip0};
  for (const [at, a, b, fl] of steps) if (t >= at - 0.12) g = {...swap(t, at, a, b), flip: t >= at ? (fl ?? flip0) : g.flip};
  return g;
};
const guyPose = (t: number): G => step(t, [
  [T.drop, 'front_calm', 'present'], [T.see, 'present', 'point_right', true], [T.neigh, 'point_right', 'front_calm', false],
  [T.pull, 'front_calm', 'surprised'], [T.so, 'surprised', 'front_calm'], [T.fifty2, 'front_calm', 'present'],
  [T.morning + 0.1, 'present', 'walk'], [T.meet, 'walk', 'present'], [T.back, 'present', 'walk', true], [T.one, 'walk', 'front_calm', false],
], 'front_calm', false);
const nbPose = (t: number): G => step(t, [
  [T.bridge, 'front_calm', 'front_wave', true], [T.longer, 'front_wave', 'front_calm', true], [T.neigh + 0.15, 'front_calm', 'point_right', false],
  [T.eu + 0.9, 'point_right', 'front_calm', true], [T.pull, 'front_calm', 'surprised', true], [T.so, 'surprised', 'front_calm', true],
  [T.morning + 0.25, 'front_calm', 'walk', true], [T.meet, 'walk', 'present', true], [T.back, 'present', 'walk', false], [T.one, 'walk', 'front_calm', true],
], 'front_calm', true);
/** distance from the plate edge where each of them stands at the bridge end */
const END = OV + 64;
const MID = 112;  // on the bridge, for coffee (their mugs meet in the middle)
/** x offset toward the middle (0 = at their bridge end, 1 = coffee spot) and feet lift onto the deck */
const walkU = (t: number, delay: number) => {
  if (t < T.morning) return 0;
  if (t < T.back) return eio(seg(t, T.morning + 0.1 + delay, T.meet - 0.05));
  return 1 - eio(seg(t, T.back, T.one - 0.02));
};

export const BridgeScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}}> = ({t, camK}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: 0, y: -260, k: 1.1}, {t: 2.8, x: 0, y: -255, k: 1.12},
    {t: 3.3, x: 0, y: -250, k: 1.16}, {t: 6.9, x: 0, y: -245, k: 1.2},
    {t: 7.6, x: -300, y: -60, k: 0.95}, {t: 10.3, x: -310, y: -60, k: 0.96},       // his house + the North American plate
    {t: 10.9, x: 300, y: -60, k: 0.95}, {t: 13.2, x: 310, y: -60, k: 0.96},         // her house + the Eurasian plate
    {t: 13.6, x: 0, y: -120, k: 0.8}, {t: 17.9, x: 0, y: -110, k: 0.82},             // both plates pulling apart
    {t: 18.4, x: 0, y: -220, k: 1.0}, {t: 21.2, x: 0, y: -220, k: 1.0},              // the time-lapse
    {t: 21.8, x: 0, y: -150, k: 1.25}, {t: 23.8, x: 0, y: -150, k: 1.27},            // "one meter"
    {t: 24.4, x: 0, y: -300, k: 1.0}, {t: 25.3, x: 0, y: -290, k: 1.02},             // morning: the Sun comes up
    {t: 26.1, x: 0, y: -220, k: 1.55}, {t: 27.55, x: 0, y: -215, k: 1.57},           // coffee in the middle
    {t: 28.75, x: 0, y: -260, k: 1.1},                                              // back to the opening framing
  ], t);
  const sh = shake(t, hit(t, T.pull, 9, 4));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = gapAt(t), L = -g / 2, R = g / 2;
  const n = planksAt(t);
  // bridge deck pops when a plank goes in
  const deckPop = 1 + spring(t, T.drop, 0.35, 4, 9) + spring(t, T.grow1, 0.2, 4, 9);
  // the guy and the neighbour
  const gp = guyPose(t), np = nbPose(t);
  const ug = walkU(t, 0), un = walkU(t, 0.12);
  const bob = (u: number, ph: number) => (u > 0.02 && u < 0.98 ? -7 * Math.abs(Math.sin((t + ph) * Math.PI * 4)) : 0);
  const gx = lerp(L - END, -MID, ug), nx = lerp(R + END, MID, un);
  const gy = -DECK * seg(ug, 0.25, 0.45) + bob(ug, 0), ny = -DECK * seg(un, 0.25, 0.45) + bob(un, 0.13);
  const nh = headOf(np.pose, nx, ny, np.flip, np.sy * (1 + 0.009 * Math.sin(2 * Math.PI * 0.6 * t + nx * 0.01)));
  // the plank in his hands: drops into the bridge end in the opening; back in his hands on "One more"
  let held: React.ReactNode = null;
  if (t < T.drop) {
    const u = eio(seg(t, 0, T.drop));
    held = <HeldPlank x={lerp(gx + 4, L - OV + 10, u)} y={lerp(gy - 132, -DECK / 2, u)} w={lerp(118, 14, u)} rot={lerp(0, 6, u)} />;
  }
  if (t >= T.one) held = <HeldPlank x={gx + 4} y={gy - 132 + 16 * (1 - popIn(t, T.one, 0.25))} w={118 * popIn(t, T.one, 0.25)} />;
  // labels and gags
  const fiftyS = popIn(t, T.fifty, 0.3) * (1 - seg(t, T.see - 0.3, T.see));
  const naS = popIn(t, T.na, 0.3) * (1 - seg(t, T.so - 0.3, T.so));
  const euS = popIn(t, T.eu, 0.3) * (1 - seg(t, T.so - 0.3, T.so));
  const iceS = popIn(t, T.ice, 0.3) * (1 - seg(t, T.pull - 0.3, T.pull - 0.05));
  const pushS = popIn(t, T.pull, 0.3) * (1 - seg(t, T.so - 0.4, T.so - 0.15));
  const pushX = 30 * Math.sin(Math.PI * seg(t, T.pull, T.pull + 0.7));
  const cmS = popIn(t, T.cm, 0.3) * (1 - seg(t, T.so - 0.4, T.so - 0.15));
  const year = Math.round(1976 + planksAt(t));
  const yearS = popIn(t, T.so, 0.3) * (1 - seg(t, T.grow1 + 0.05, T.grow1 + 0.3));
  const dimP = eout(seg(t, T.fifty2 + 0.1, T.meter)) * (1 - seg(t, T.morning - 0.4, T.morning - 0.15));
  const y50S = popIn(t, T.fifty2, 0.3) * (1 - seg(t, T.morning - 0.4, T.morning - 0.15));
  const meterS = popIn(t, T.meter, 0.3) * (1 - seg(t, T.morning - 0.4, T.morning - 0.15));
  const sunY = lerp(400, -1300, eout(seg(t, T.morning, T.morning + 1.3))) + lerp(0, 400 + 1300, seg(t, T.back, T.one + 0.6) * (t > T.back ? 1 : 0));
  const mugS = popIn(t, T.coffee, 0.3) * (1 - seg(t, T.back - 0.15, T.back + 0.1));
  const clink = Math.sin(Math.PI * seg(t, T.coffee + 0.25, T.coffee + 0.55));
  const gHand = {x: gx + 100, y: gy - 182}, nHand = {x: nx - 100, y: ny - 182};
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <Layer cam={cam} z={2600}>
        {t > T.morning - 0.1 && t < T.one + 0.7 ? <Sun x={-380} y={sunY} t={t} /> : null}
      </Layer>
      <Layer cam={cam} z={1700}>
        <Mountains />
      </Layer>
      <Layer cam={cam} z={1000}>
        {/* the chasm behind the plates */}
        <W><rect x={-400} y={-2} width={800} height={2000} fill={CHASM} /></W>
        <Plate side={-1} gx={L} />
        <Plate side={1} gx={R} />
        <House x={L - 470} wall="#E8E2D3" roof="#C2423A" />
        <House x={R + 470} wall="#7FA7C9" roof="#3F4F63" flip />
        <Bridge x0={L - OV} x1={R + OV} pop={deckPop} />
        <Txt x={L - 285} y={330} s={naS} text="NORTH AMERICAN" size={54} />
        <Txt x={L - 285} y={405} s={naS} text="PLATE" size={54} fill={GOLD} />
        <Txt x={R + 285} y={330} s={euS} text="EURASIAN" size={54} />
        <Txt x={R + 285} y={405} s={euS} text="PLATE" size={54} fill={GOLD} />
        <PushArrow x={L - 285 - pushX} y={560} s={pushS * 1.3} rot={180} />
        <PushArrow x={R + 285 + pushX} y={560} s={pushS * 1.3} rot={0} />
        <Txt x={0} y={-520} s={cmS} text="2 CM" size={110} fill={GOLD} rot={-4} />
        <Txt x={0} y={-410} s={cmS} text="A YEAR" size={64} rot={-4} />
        <Txt x={0} y={-470} s={fiftyS} text="50 YEARS" size={96} fill={GOLD} rot={-4} />
        <Guy pose={np.pose} x={nx} y={ny} t={t + 0.7} sx={np.sx} sy={np.sy} flip={np.flip} />
        <BobbleHat hx={nh.x} hy={nh.y} />
        <Guy pose={gp.pose} x={gx} y={gy} t={t} sx={gp.sx} sy={gp.sy} flip={gp.flip} />
        {held}
        <Mug x={gHand.x - 22 + 8 * clink} y={gHand.y} s={mugS} color={GOLD} rot={10 * clink} />
        <Mug x={nHand.x + 22 - 8 * clink} y={nHand.y} s={mugS} color={HAT} flip rot={-10 * clink} />
        {mugS > 0.5 ? <Puffs t={t} born={T.coffee + 0.1} x={0} y={gy - 250} n={6} life={1.2} size={20} vy={-90} seed={4} /> : null}
        <DimArrow x0={L} x1={R} y={110} p={dimP} />
        <Txt x={0} y={215} s={meterS} text="1 M" size={84} fill={GOLD} />
        <Txt x={0} y={-500} s={y50S} text="50 YEARS" size={90} rot={-4} />
      </Layer>
      <IcelandMap s={iceS} t={t} />
      <Badge text={String(year)} s={yearS} y={420} />
      <HookTitle t={t} text="THIS BRIDGE JOINS TWO CONTINENTS" hi="CONTINENTS" y={360} />
      <CallToAction t={t} at={T.cta} />
    </AbsoluteFill>
  );
};

export const BridgeVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks: Cue[] = [];
  for (let i = 1; i <= N; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.grow0, T.grow1, i / N) - 0.01, db: i === N ? -18 : -31});
  const steps: Cue[] = [];
  for (let a = T.morning + 0.2; a < T.meet - 0.1; a += 0.25) steps.push({f: 'tick2.wav', at: a, db: -34});
  for (let a = T.back + 0.05; a < T.one - 0.05; a += 0.2) steps.push({f: 'tick2.wav', at: a, db: -34});
  const cues: Cue[] = [
    {f: 'pop.wav', at: T.drop, db: -16}, {f: 'tick.wav', at: T.drop + 0.02, db: -22},
    {f: 'chirp.wav', at: T.bridge, db: -30},
    {f: 'pop.wav', at: T.fifty, db: -21},
    {f: 'pop.wav', at: T.na, db: -20}, {f: 'pop.wav', at: T.eu, db: -20},
    {f: 'pop.wav', at: T.ice, db: -21},
    {f: 'crack.wav', at: T.pull - 0.03, db: -20}, {f: 'strain.mp3', at: T.pull, db: -28, to: 0.9},
    {f: 'pop.wav', at: T.cm, db: -21},
    {f: 'rewind.wav', at: T.so, db: -27, to: 0.7}, {f: 'pop.wav', at: T.so, db: -23},
    ...ticks, {f: 'ding.mp3', at: T.grow1 + 0.02, db: -25},
    ...ctaCues(T.cta),
    {f: 'pop.wav', at: T.fifty2, db: -22}, {f: 'pop.wav', at: T.meter, db: -20},
    {f: 'chirp.wav', at: T.morning + 0.2, db: -26}, {f: 'chirp.wav', at: T.morning + 0.9, db: -29},
    ...steps,
    {f: 'pop.wav', at: T.coffee, db: -22}, {f: 'ding.mp3', at: T.coffee + 0.42, db: -24}, {f: 'giggle.mp3', at: T.coffee + 0.5, db: -29, to: 0.9},
    {f: 'pop.wav', at: T.one, db: -17},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},   // the loop push back to the opening shot
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<BridgeScene t={0} />}>
        <BridgeScene t={t} />
      </LoopOut>
      <AskBanner />
      <Look />
      <SoundLayer voice="bridge/vo/take1-trim.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const BridgeWide: React.FC = () => <WideFit.Provider value={0.72}><BridgeVideo /></WideFit.Provider>;
