// "What if you could run as fast as these animals?" - the third LADDER (after videos/jump and videos/lifespan): one question,
// three animals, one speed counter, the top rung hits his body.
// (1) frame 0: he sprints with ostrich legs beside a smug ostrich (70 km/h) and leaves a dashed "fastest human" behind;
// (2) POOF - cheetah legs: a smug cheetah and a car with a face keep pace (93 km/h, HONK);
// (3) FOR ITS SIZE: a magnifier on a tiger beetle, BODY LENGTHS A SECOND: cheetah 20 vs beetle 120 (x6);
// (4) POOF - beetle legs: they turn into a blur wheel, the counter rockets to 750 km/h, an airliner with a face slowly passes him
//     (ALMOST A JET), the world smears (BLUR) - WHAM into an acacia, flattened, he slides down (crowd laugh);
// (5) ITS VIEW: while it runs, the beetle's world is a blur - it stops to look; (6) its antennae, held out stiff, tap a pebble and it
//     hops over; (7) close-up: he pats his head - no antennae - the beetle taps his cheek (BOOP); (8) POOF - ostrich legs, he runs
//     off beside the ostrich = frame 0. Comment bubble opener, CTA, CommentAsk (no either/or ending). All drawn in code; the guy is
//     the code-drawn front view (videos/jump) with animal legs in profile and a run cycle.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Poof} from './lib/kit';

// voice: tight.mp3 at 0.1 s (vsplice: line 1 at 1.22, the rest at 1.12; Scribe times refined to the loudness chunks).
// Last word ends 18.85 s; + 0.85 s so the push starts after it.
export const DURATION = 19.7;
export const T = {
  run: 0.12, ostrich: 0.67, outrun: 1.66, fastest: 2.17, human: 2.57,        // "Run like an ostrich, and you'd outrun the fastest human."
  like2: 3.19, cheetah: 3.42, keep: 4.26, cars: 4.69,                        // "Like a cheetah, you'd keep up with cars."
  but: 5.50, size: 5.92, tiger: 6.76, beetle: 7.11, faster: 7.68,            // "But for its size, a tiger beetle is faster."
  on: 8.46, you: 8.60, thats: 9.14, almost: 9.35, fast: 9.72, jet: 10.32,    // "On you, that's almost as fast as a jet."
  so: 11.58, fast2: 11.93, eyes: 12.66, cant: 13.03, up: 13.48,              // "So fast, its eyes can't keep up."
  it: 14.01, feels: 14.27, way: 14.75, antennae: 15.26,                      // "It feels its way with its antennae."
  you2: 16.01, dont: 16.12, have: 16.30, any: 16.55,                         // "You don't have any."
  so2: 17.04, hes: 17.55, back: 17.82, ostrich2: 18.02, legs: 18.38,         // "So he's back to ostrich legs."
  cta: 12.05,
};
// beats
const POOF1 = 3.0;                                          // ostrich -> cheetah legs
const MAG_IN = 5.45, MAG_OUT = 8.24;                        // FOR ITS SIZE panel
const POOF2 = 8.30, LAUNCH = 8.62, WHEEL_ON = 8.80, TOP = 10.30;   // beetle legs, launch, blur wheel, top speed
const JET_IN = 9.15, BLUR = 10.42, CRASH = 10.92, PEEL = 11.70;   // the jet, the smear, WHAM, he drops off the trunk
const P_IN = 11.50, STOP1 = 13.00, LOOK = 13.40, P_FLIP = 13.90, TAP = 14.72, P_OUT = 15.86;   // the panels
const SG = 15.86, PAT = 16.02, HOP = 16.30, BOOP1 = 16.60, BOOP2 = 16.86;    // close-up: no antennae
const POOF3 = 17.02, UP = 17.38;                              // ostrich legs; up and running in the gap after "So"
export const PUSH = DURATION - LOOP_DUR;

const GOLD = '#FFD43B', RED = '#E2453C';
const OST_LEG = '#E9A9A2', OST_LEG2 = '#CF8C86', OST_BODY = '#2E2B2B', OST_NECK = '#DDB0A8', BEAK = '#EDA066';
const CHE = '#EDB54E', CHE2 = '#D29A36', CHE_LT = '#FFF1D6', SPOT = '#2A2118';
const BUG = '#2FA36C', BUG2 = '#1E7C51', BUG_LT = '#8FE3B5', BUG_SPOT = '#F4EBD0', IVORY = '#F2E6C9';
const CARC = '#3E8EDE', CAR2 = '#2C6FB5', GLASS = '#CDEBFF';
const JET_W = '#FBFBFD', JET_B = '#3E6FD8';
const TRUNK = '#9C6B3F', TRUNK2 = '#7E5330', LEAF = '#6FA650', LEAF2 = '#4F8A3A';
const G_FAR = '#EADDB6', G_HILL = '#DCCD9C', G_MID = '#E8D39A', G_ROAD = '#E4CC8F', ROADC = '#C9C4B9', G_MAIN = '#DDBF84';
const FACE_C = '#F1EFEA';

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
const win = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${(ex - w).toFixed(1)} ${y.toFixed(1)} A ${rx} ${ry} 0 ${h > 0.5 ? 1 : 0} 1 ${(ex + w).toFixed(1)} ${y.toFixed(1)} Z`;
};
const cbez = (a: P2, c1: P2, c2: P2, b: P2, n = 16): P2[] => Array.from({length: n + 1}, (_, i) => {
  const u = i / n, v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0],
    v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1]] as P2;
});
/** a ribbon along pts tapering from w0 to w1 with a round tip (tails, necks) */
const taper = (pts: P2[], w0: number, w1: number) => {
  const n = pts.length, L: P2[] = [], R: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len, w = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  return `M ${P(L[0])} ${L.slice(1).map((p) => 'L ' + P(p)).join(' ')} A ${w1 / 2} ${w1 / 2} 0 0 1 ${P(R[n - 1])} ${R.slice(0, n - 1).reverse().map((p) => 'L ' + P(p)).join(' ')} Z`;
};
const ang = (a: P2, b: P2) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
const dist = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
/** cyclic Catmull-Rom through 4 keys (run cycles): ph in [0,1) */
const cr = (p0: number, p1: number, p2: number, p3: number, u: number) =>
  0.5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
const cyc = (keys: P2[][], ph: number): P2[] => {
  const f = ((((ph % 1) + 1) % 1) * keys.length), i = Math.floor(f), u = f - i, n = keys.length;
  const k0 = keys[(i + n - 1) % n], k1 = keys[i], k2 = keys[(i + 1) % n], k3 = keys[(i + 2) % n];
  return k1.map((_, j) => [cr(k0[j][0], k1[j][0], k2[j][0], k3[j][0], u), cr(k0[j][1], k1[j][1], k2[j][1], k3[j][1], u)] as P2);
};
/** points on an ellipse arc (degrees) */
const arcPts = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 10): P2[] =>
  Array.from({length: n + 1}, (_, i) => { const a = ((a0 + (a1 - a0) * i / n) * Math.PI) / 180; return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as P2; });
const poly = (pts: P2[]) => `M ${pts.map(P).join(' L ')}`;

// ---------- motion: speed and stride integrated once (240 steps a second) ----------
const V1 = 1150, V2 = 1550, V3 = 12000;                     // world units a second (cartoon speeds: 171 units = 1 m)
const vAt = (t: number) => {
  if (t < POOF1) return V1;
  if (t < POOF1 + 0.5) return lerp(V1, V2, eio(seg(t, POOF1, POOF1 + 0.5)));
  if (t < LAUNCH) return V2;
  if (t < TOP) return lerp(V2, V3, seg(t, LAUNCH, TOP) ** 0.55);   // an explosive launch, still climbing
  if (t < CRASH) return V3;
  if (t < UP) return 0;
  return lerp(0, V1, eout(seg(t, UP, UP + 0.4)));
};
const fAt = (t: number) => {                                 // strides a second
  if (t < POOF1) return 3.1;
  if (t < LAUNCH) return 3.6;
  if (t < CRASH) return lerp(3.6, 15, seg(t, LAUNCH, TOP) ** 0.7);
  if (t < UP) return 0;
  return 3.1;
};
const DT = 1 / 240, NT = Math.ceil((DURATION + 1) / DT);
const XT = new Float64Array(NT + 2), PT = new Float64Array(NT + 2);
for (let i = 0; i <= NT; i++) { XT[i + 1] = XT[i] + vAt(i * DT) * DT; PT[i + 1] = PT[i] + fAt(i * DT) * DT; }
const tab = (A: Float64Array, t: number) => { const f = clamp(t, 0, DURATION + 0.9) / DT, i = Math.floor(f); return lerp(A[i], A[i + 1], f - i); };
export const Xof = (t: number) => tab(XT, t);
const PHof = (t: number) => tab(PT, t) + 0.1;
const XC = Xof(CRASH);                                       // where he stops
const TREE_X = XC + 96;                                      // the acacia he hits (trunk centre)
/** footfall times (each foot touches down at phase 0 / 0.5) - for the step sounds */
const footfalls = (a: number, b: number): number[] => {
  const out: number[] = [];
  for (let t = a; t < b; t += DT) if (Math.floor(PHof(t) * 2) !== Math.floor(PHof(t + DT) * 2)) out.push(t + DT);
  return out;
};

// ---------- the guy's head (videos/jump) ----------
type Mood = 'joy' | 'happy' | 'focus' | 'look' | 'worry' | 'shock' | 'scream' | 'dizzy' | 'oof' | 'smug' | 'gulp';
const Head: React.FC<{t: number; mood: Mood; look: P2; uid: string}> = ({t, mood, look, uid}) => {
  const R = HEAD_R;
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (mood === 'happy') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'oof') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === 'dizzy') return <path key={sd} d={`M ${ex} ${ey} m -2 0 a 3 3 0 1 1 4 2 a 7 7 0 1 1 -9 -6 a 11 11 0 1 1 15 10`} transform={`rotate(${t * 600 * sd} ${ex} ${ey})`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
    const big = mood === 'shock' || mood === 'scream' ? 1.25 : mood === 'gulp' ? 1.12 : 1;
    const rx = 12 * big, ry = 15 * big;
    const px = ex + look[0] * 4.5, py = ey + look[1] * 5;
    const pr = big > 1.2 ? 4.4 : big > 1 ? 5.4 : 6.5;
    const lid = mood === 'smug' ? 0.46 : mood === 'focus' ? 0.32 : 0;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={px} cy={py + lid * 6} r={pr} fill={INK} />
        <circle cx={px - 1.5} cy={py - 2 + lid * 6} r={2} fill="#fff" />
        {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brow = (sd: number) => {
    let d = '';
    if (mood === 'joy' || mood === 'happy') d = `M ${sd * 12} -44 Q ${sd * 24} -52 ${sd * 37} -46`;
    else if (mood === 'shock' || mood === 'scream') d = `M ${sd * 12} -50 L ${sd * 37} -56`;
    else if (mood === 'focus') d = `M ${sd * 10} -33 L ${sd * 37} -43`;
    else if (mood === 'worry' || mood === 'gulp' || mood === 'dizzy') d = `M ${sd * 12} -43 L ${sd * 36} -34`;
    else if (mood === 'smug') d = sd > 0 ? `M 12 -46 Q 24 -54 37 -48` : `M -12 -36 L -36 -36`;
    else if (mood === 'oof') d = `M ${sd * 10} -38 L ${sd * 36} -30`;
    else if (mood === 'look') d = `M ${sd * 12} -45 Q ${sd * 24} -50 ${sd * 36} -45`;
    return d ? <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null;
  };
  let mouth: React.ReactNode = null;
  if (mood === 'joy') mouth = <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  else if (mood === 'happy') mouth = <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  else if (mood === 'focus') mouth = <path d="M -15 9 Q 0 5 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'look') mouth = <ellipse cx={0} cy={10} rx={8} ry={7} fill="#5A2328" stroke={INK} strokeWidth={4.5} />;
  else if (mood === 'worry' || mood === 'dizzy') mouth = <path d={`M -18 10 q 6 ${mood === 'dizzy' ? -6 + 3 * Math.sin(t * 14) : -6} 12 0 t 12 0 t 12 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (mood === 'gulp') mouth = <ellipse cx={0} cy={11} rx={7} ry={6} fill="#5A2328" stroke={INK} strokeWidth={4.5} />;
  else if (mood === 'shock') mouth = <ellipse cx={0} cy={9} rx={14} ry={18} fill="#5A2328" stroke={INK} strokeWidth={4.5} />;
  else if (mood === 'scream') mouth = <g><ellipse cx={0} cy={12} rx={24 + 2 * Math.sin(t * 40)} ry={28} fill="#5A2328" stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={28} rx={13} ry={8} fill="#E4677A" /><path d="M -18 -6 Q 0 -12 18 -6 L 16 0 Q 0 -5 -16 0 Z" fill="#fff" /></g>;
  else if (mood === 'oof') mouth = <g><path d="M -26 -2 Q 0 -10 26 -2 Q 22 28 0 30 Q -22 28 -26 -2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -21 0 Q 0 -6 21 0 L 19 6 Q 0 2 -19 6 Z" fill="#fff" /></g>;
  else if (mood === 'smug') mouth = <path d="M -16 9 Q 4 19 21 3" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  return (
    <g>
      <circle r={R + 1} fill={`url(#sFace${uid})`} stroke={INK} strokeWidth={6.5} />
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)">{mouth}</g>
    </g>
  );
};

// ---------- arms (shoulders at +-38, -94 in the hip frame) ----------
type ArmP = {e: P2; h: P2};
type ArmsP = {l: ArmP; r: ArmP};
const mir = (a: ArmP): ArmP => ({e: [-a.e[0], a.e[1]], h: [-a.h[0], a.h[1]]});
const sym = (r: ArmP): ArmsP => ({l: mir(r), r});
const bArm = (a: ArmP, b: ArmP, u: number): ArmP => ({e: lp2(a.e, b.e, u), h: lp2(a.h, b.h, u)});
const blendArms = (a: ArmsP, b: ArmsP, u: number): ArmsP => ({l: bArm(a.l, b.l, u), r: bArm(a.r, b.r, u)});
const A_BACK: ArmP = {e: [50, -50], h: [40, -12]}, A_FWD: ArmP = {e: [76, -82], h: [100, -124]};
const runArms = (ph: number): ArmsP => {
  const s = Math.sin(2 * Math.PI * ph);
  return {r: bArm(A_BACK, A_FWD, 0.5 + 0.5 * s), l: mir(bArm(A_BACK, A_FWD, 0.5 - 0.5 * s))};
};
const ARM = {
  down: sym({e: [52, -56], h: [56, -20]}),
  stream: {l: {e: [-96, -98], h: [-164, -92]} as ArmP, r: {e: [-28, -116], h: [-104, -118]} as ArmP},   // flung back at top speed
  splat: sym({e: [72, -150], h: [80, -214]}),                                                         // pressed on the trunk, arms up
  limp: sym({e: [66, -40], h: [96, -8]}),
  pat: sym({e: [80, -150], h: [34, -236]}),                                                           // hands on top of his head
  shrug: sym({e: [74, -70], h: [108, -98]}),
};
const Arm: React.FC<{a: ArmP; sd: number}> = ({a, sd}) => {
  const S: P2 = [sd * 38, -94];
  const C: P2 = [2 * a.e[0] - (S[0] + a.h[0]) / 2, 2 * a.e[1] - (S[1] + a.h[1]) / 2];
  const d = `M ${P(S)} Q ${P(C)} ${P(a.h)}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={29} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#FFFFFF" strokeWidth={18} fill="none" strokeLinecap="round" />
      <circle cx={a.h[0]} cy={a.h[1]} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} />
    </g>
  );
};

// ---------- animal legs in profile: hip -> knee -> ankle -> toe, a run cycle of 4 keys (contact, stance, push, swing) ----------
type LegType = 'ost' | 'chee' | 'bug';
type LegDef = {keys: P2[][]; sit: P2[]; w: [number, number, number]; c: string; c2: string; hip: number};
const LEGS: Record<LegType, LegDef> = {
  ost: {keys: [[[0, 0], [26, 20], [14, 72], [56, 124]], [[0, 0], [20, 26], [-12, 70], [8, 126]], [[0, 0], [6, 28], [-32, 74], [-70, 120]], [[0, 0], [36, 6], [-6, 48], [40, 90]]],
    sit: [[0, 0], [54, -12], [34, 38], [88, 44]], w: [40, 22, 17], c: OST_LEG, c2: OST_LEG2, hip: 126},
  chee: {keys: [[[0, 0], [28, 22], [18, 56], [52, 92]], [[0, 0], [22, 28], [-10, 58], [6, 94]], [[0, 0], [6, 30], [-32, 58], [-66, 86]], [[0, 0], [34, 8], [0, 40], [34, 62]]],
    sit: [[0, 0], [50, -8], [40, 28], [84, 38]], w: [34, 20, 16], c: CHE, c2: CHE2, hip: 94},
  bug: {keys: [[[0, 0], [40, -23], [68, 95], [94, 106]], [[0, 0], [32, -32], [18, 88], [42, 104]], [[0, 0], [8, -45], [-40, 76], [-64, 100]], [[0, 0], [30, -35], [52, 60], [78, 64]]],
    sit: [[0, 0], [52, -40], [118, 24], [146, 30]], w: [17, 12, 9], c: BUG, c2: BUG2, hip: 106},
};
const legPts = (type: LegType, ph: number, sit = 0): P2[] => {
  const d = LEGS[type], p = cyc(d.keys, ph);
  return sit > 0 ? p.map((q, j) => lp2(q, d.sit[j], sit)) : p;
};
const Leg: React.FC<{type: LegType; p: P2[]; back?: boolean; s?: number}> = ({type, p, back, s = 1}) => {
  const d = LEGS[type];
  const c = back ? d.c2 : d.c;
  const segs: [P2, P2, number][] = [[p[0], p[1], d.w[0]], [p[1], p[2], d.w[1]], [p[2], p[3], d.w[2]]];
  const line = (a: P2, b: P2) => `M ${P(a)} L ${P(b)}`;
  const ink: React.ReactNode[] = [], fill: React.ReactNode[] = [], top: React.ReactNode[] = [];
  segs.forEach(([a, b, w], i) => {
    ink.push(<path key={'o' + i} d={line(a, b)} stroke={INK} strokeWidth={w + 11 / s} strokeLinecap="round" />);
    fill.push(<path key={'f' + i} d={line(a, b)} stroke={c} strokeWidth={w} strokeLinecap="round" />);
  });
  const m01 = lp2(p[0], p[1], 0.5), a01 = ang(p[0], p[1]), l01 = dist(p[0], p[1]);
  const lift = clamp((p[3][1] < 0 ? 0 : (LEGS[type].hip - 6 - p[3][1]) / 40), 0, 1);   // toes droop when the foot is up
  if (type === 'ost') {
    // a bare pink drumstick thigh and two toes (a big one with a claw)
    ink.push(<ellipse key="ti" cx={m01[0]} cy={m01[1]} rx={l01 / 2 + 22} ry={30} transform={`rotate(${a01} ${m01[0]} ${m01[1]})`} fill={INK} />);
    fill.push(<ellipse key="tf" cx={m01[0]} cy={m01[1]} rx={l01 / 2 + 16.5} ry={24.5} transform={`rotate(${a01} ${m01[0]} ${m01[1]})`} fill={c} />);
    const ta = 12 + 50 * lift;
    top.push(<g key="toes" transform={`translate(${P(p[3])}) rotate(${ta})`}>
      <path d="M -4 -2 L 22 -2" stroke={INK} strokeWidth={22 + 11 / s} strokeLinecap="round" />
      <path d="M -4 -2 L 22 -2" stroke={c} strokeWidth={22} strokeLinecap="round" />
      <path d="M -2 8 L 12 10" stroke={INK} strokeWidth={13 + 9 / s} strokeLinecap="round" />
      <path d="M -2 8 L 12 10" stroke={c} strokeWidth={13} strokeLinecap="round" />
      <path d="M 30 -10 L 44 -2 L 30 5 Z" fill="#F7F0E4" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </g>);
    if (!back) top.push(<path key="hl" d={`M ${P(lp2(p[0], p[1], 0.15))} L ${P(lp2(p[0], p[1], 0.8))}`} transform="translate(-6 -8)" stroke="#F8D4CF" strokeWidth={7} strokeLinecap="round" opacity={0.9} />);
    [0.3, 0.55, 0.8].forEach((u, i) => {
      const q = lp2(p[2], p[3], u), a = (ang(p[2], p[3]) + 90) * Math.PI / 180;
      top.push(<path key={'sc' + i} d={`M ${P([q[0] - Math.cos(a) * 6, q[1] - Math.sin(a) * 6])} L ${P([q[0] + Math.cos(a) * 6, q[1] + Math.sin(a) * 6])}`} stroke={OST_LEG2} strokeWidth={3.5} strokeLinecap="round" />);
    });
  } else if (type === 'chee') {
    ink.push(<ellipse key="pi" cx={p[3][0] + 6} cy={p[3][1] - 2} rx={20} ry={13} fill={INK} />);
    fill.push(<ellipse key="pf" cx={p[3][0] + 6} cy={p[3][1] - 2} rx={14.5} ry={7.5} fill={c} />);
    ink.push(<ellipse key="ti" cx={m01[0]} cy={m01[1]} rx={l01 / 2 + 17} ry={24} transform={`rotate(${a01} ${m01[0]} ${m01[1]})`} fill={INK} />);
    fill.push(<ellipse key="tf" cx={m01[0]} cy={m01[1]} rx={l01 / 2 + 11.5} ry={18.5} transform={`rotate(${a01} ${m01[0]} ${m01[1]})`} fill={c} />);
    [[p[0], p[1], 0.35, -6], [p[0], p[1], 0.7, 7], [p[1], p[2], 0.4, 3], [p[1], p[2], 0.75, -3], [p[2], p[3], 0.5, 2]].forEach(([a, b, u, o], i) => {
      const q = lp2(a as P2, b as P2, u as number);
      top.push(<circle key={'s' + i} cx={q[0] + (o as number)} cy={q[1]} r={i < 2 ? 5.5 : 4} fill={SPOT} />);
    });
  } else {
    // beetle: knobbly joints, spines on the shin, a segmented foot with a hooked claw, a shine on the thigh
    [[p[1], 11], [p[2], 8.5]].forEach(([q, r], i) => top.push(<circle key={'j' + i} cx={(q as P2)[0]} cy={(q as P2)[1]} r={r as number} fill={c} stroke={INK} strokeWidth={4} />));
    const a12 = (ang(p[1], p[2]) - 90) * Math.PI / 180;
    [0.3, 0.52, 0.74].forEach((u, i) => {
      const q = lp2(p[1], p[2], u);
      top.push(<path key={'sp' + i} d={`M ${P(q)} l ${(-Math.cos(a12) * 12 - 5).toFixed(1)} ${(-Math.sin(a12) * 12 - 4).toFixed(1)}`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />);
    });
    [0.4, 0.75].forEach((u, i) => {
      const q = lp2(p[2], p[3], u), a = (ang(p[2], p[3]) + 90) * Math.PI / 180;
      top.push(<path key={'tk' + i} d={`M ${P([q[0] - Math.cos(a) * 6, q[1] - Math.sin(a) * 6])} L ${P([q[0] + Math.cos(a) * 6, q[1] + Math.sin(a) * 6])}`} stroke={INK} strokeWidth={3} />);
    });
    top.push(<path key="cw" d={`M ${P(p[3])} q 10 -2 12 6 M ${P(p[3])} q 8 4 6 12`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />);
    if (!back) top.push(<path key="hl" d={`M ${P(lp2(p[0], p[1], 0.2))} L ${P(lp2(p[0], p[1], 0.75))}`} stroke={BUG_LT} strokeWidth={4} strokeLinecap="round" />);
  }
  return <g>{ink}{fill}{top}</g>;
};
/** the legs at blur speed: a whirling wheel of legs (the cartoon "too fast to see" legs) - spokes from the hip, a foot on each */
const LegWheel: React.FC<{type: LegType; t: number}> = ({type, t}) => {
  const d = LEGS[type], cy = d.hip * 0.5, R = d.hip * 0.54;
  const a0 = t * 360 * 3.4;                                   // ~20 degrees a frame: reads as spinning, no wagon-wheel strobe
  const spokes = [0, 72, 144, 216, 288].map((k) => { const a = ((a0 + k) * Math.PI) / 180; return [[8 + 6 * Math.cos(a), cy * 0.25 + 6 * Math.sin(a)], [8 + R * Math.cos(a), cy + R * 0.9 * Math.sin(a)]] as P2[]; });
  const arcs = [0, 120, 240].map((k) => arcPts(8, cy, R + 6, R * 0.9 + 6, a0 + k, a0 + k + 70, 8));
  return (
    <g>
      <ellipse cx={8} cy={cy} rx={R + 16} ry={R * 0.9 + 16} fill={d.c} fillOpacity={0.28} />
      {arcs.map((a, i) => <path key={'ao' + i} d={poly(a)} stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" />)}
      {arcs.map((a, i) => <path key={'af' + i} d={poly(a)} stroke={d.c2} strokeWidth={8} fill="none" strokeLinecap="round" />)}
      {spokes.map((q, i) => <path key={'so' + i} d={poly(q)} stroke={INK} strokeWidth={d.w[1] + 10} fill="none" strokeLinecap="round" />)}
      {spokes.map((q, i) => <path key={'sf' + i} d={poly(q)} stroke={d.c} strokeWidth={d.w[1]} fill="none" strokeLinecap="round" />)}
      {spokes.map((q, i) => <ellipse key={'ft' + i} cx={q[1][0]} cy={q[1][1]} rx={11} ry={7} fill={d.c2} stroke={INK} strokeWidth={4} />)}
      {[-16, 8, 32].map((y, i) => <path key={'m' + i} d={`M ${-R - 40 - i * 12} ${cy + y} h ${-56 - i * 16}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />)}
    </g>
  );
};
/** the cheetah tail on the guy (from the back of his hips) */
const CheTail: React.FC<{t: number; sw: number}> = ({t, sw}) => {
  const s = 14 * Math.sin(t * 7) * sw;
  const pts = cbez([-36, 4], [-90, 2], [-130, -30 + s], [-176, -6 + s * 1.6]);
  return <g><path d={taper(pts, 18, 11)} fill={CHE} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[0.62, 0.74, 0.86].map((u, i) => { const q = pts[Math.round(u * (pts.length - 1))]; return <circle key={i} cx={q[0]} cy={q[1]} r={6.5} fill={SPOT} />; })}
    <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={7} fill={CHE_LT} stroke={INK} strokeWidth={4} /></g>;
};
/** fur / feathers / shell over his hips, so the animal legs read as his own */
const Haunch: React.FC<{type: LegType; t: number; ph: number}> = ({type, t, ph}) => {
  if (type === 'ost') {
    const b = 4 * Math.sin(2 * Math.PI * ph * 2);
    return (
      <g>
        {[[-56, -6 + b, -38], [-62, 12 + b, -18], [-50, 26 + b, 4]].map(([x, y, r], i) => (
          <path key={i} d={`M ${x + 14} ${y} q -30 -10 -42 8 q 10 12 26 4 q -10 -12 6 -10`} transform={`rotate(${r} ${x} ${y})`} fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />))}
        <path d="M -56 -10 Q -60 26 -40 34 Q -30 44 -16 36 Q -4 46 10 36 Q 24 46 36 34 Q 56 30 56 -8 Q 30 -30 0 -30 Q -32 -30 -56 -10 Z" fill={OST_BODY} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        <path d="M -30 -14 Q -24 6 -32 22 M 0 -18 Q 6 4 -2 24 M 28 -14 Q 34 6 26 22" stroke="#5A5555" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    );
  }
  if (type === 'chee') return (
    <g>
      <ellipse cx={0} cy={6} rx={54} ry={34} fill={CHE} stroke={INK} strokeWidth={6.5} />
      {[[-30, -4, 6], [-8, 12, 7], [16, -8, 6], [34, 14, 5.5], [-36, 20, 5], [6, 28, 5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={SPOT} />)}
    </g>
  );
  return (
    <g>
      <ellipse cx={0} cy={6} rx={56} ry={34} fill={BUG} stroke={INK} strokeWidth={6.5} />
      <path d="M 0 -26 L 0 38" stroke={BUG2} strokeWidth={5} strokeLinecap="round" />
      {[[-28, 2, 8], [26, 6, 8], [-18, 22, 6], [16, 24, 6]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={BUG_SPOT} stroke={INK} strokeWidth={3} />)}
      <path d="M -40 -12 Q -20 -24 4 -24" stroke={BUG_LT} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g>
  );
};
const TORSO_D = 'M -28 -124 C -42 -118 -47 -106 -47 -90 L -46 -16 Q -46 12 -20 13 L 20 13 Q 46 12 46 -16 L 47 -90 C 47 -106 42 -118 28 -124 Z';

type GS = {x: number; y: number; legs: LegType; ph: number; wheel: boolean; arms: ArmsP; mood: Mood; look: P2; rot: number; sx: number; sy: number;
  sit: number; tail: number; hide?: boolean};
const GuyR: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  if (g.hide) return null;
  const breathe = g.sit > 0.5 ? 1 + 0.008 * Math.sin(2 * Math.PI * 0.6 * t) : 1;
  return (
    <W><g transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)}) scale(${g.sx.toFixed(4)} ${(g.sy * breathe).toFixed(4)})`}>
      {g.legs === 'chee' ? <CheTail t={t} sw={g.tail} /> : null}
      {g.wheel ? null : <g transform={g.sit > 0.5 ? 'translate(-6 -2) scale(-1 1)' : 'translate(-8 -4)'}><Leg type={g.legs} p={legPts(g.legs, g.ph + 0.5, g.sit)} back /></g>}
      <path d={TORSO_D} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <Haunch type={g.legs} t={t} ph={g.ph} />
      {g.wheel ? <LegWheel type={g.legs} t={t} /> : <g transform="translate(7 2)"><Leg type={g.legs} p={legPts(g.legs, g.ph, g.sit)} /></g>}
      <Arm a={g.arms.l} sd={-1} /><Arm a={g.arms.r} sd={1} />
      <g transform="translate(0 -177)"><Head t={t} mood={g.mood} look={g.look} uid={uid} /></g>
    </g></W>
  );
};

// ---------- co-stars ----------
/** the ostrich, side view facing right, feet on y = 0; ph = run phase; legs are the 'ost' rig x1.62 */
const OS = 1.62;
const Ostrich: React.FC<{t: number; ph: number; mood: 'smug' | 'shock'}> = ({t, ph, mood}) => {
  const hip = LEGS.ost.hip * OS;
  const bob = 8 * Math.cos(4 * Math.PI * ph + Math.PI);
  const nk = 10 * Math.sin(4 * Math.PI * ph);                       // neck bob
  const hx = 118 + nk * 0.6, hy = -478 + bob + Math.abs(nk) * 0.4;
  const neck = cbez([62, -262 + bob], [118, -318 + bob], [78 + nk, -412 + bob], [hx - 8, hy + 10]);
  const leg = (p: number, back: boolean) => <g transform={`translate(${back ? -16 : 8} ${-hip + bob}) scale(${OS})`}><Leg type="ost" p={legPts('ost', p)} back={back} s={OS} /></g>;
  return (
    <g>
      {leg(ph + 0.5, true)}
      {/* tail plumes */}
      {[[-118, -270, -30], [-128, -244, -6], [-114, -218, 18]].map(([x, y, r], i) => (
        <path key={i} d={`M ${x + 30} ${y + bob} q -46 -20 -66 10 q 18 20 42 6 q -14 -18 10 -16`} transform={`rotate(${r} ${x} ${y + bob})`} fill="#FFFFFF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />))}
      <path d={taper(neck, 34, 26)} fill={OST_NECK} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <ellipse cx={-4} cy={-238 + bob} rx={124} ry={80} transform={`rotate(-8 -4 ${-238 + bob})`} fill={OST_BODY} stroke={INK} strokeWidth={7} />
      <path d={`M -70 ${-286 + bob} Q -20 ${-306 + bob} 40 ${-292 + bob}`} stroke="#5A5555" strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* white wing plumes */}
      {[[-10, -228, 10], [16, -212, 24], [40, -230, -6]].map(([x, y, r], i) => (
        <path key={'w' + i} d={`M ${x - 34} ${y + bob} q 30 -26 66 -6 q -14 22 -38 16 q 10 -14 -10 -14`} transform={`rotate(${r} ${x} ${y + bob})`} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />))}
      {leg(ph, false)}
      {/* head: small, a huge eye with lashes, a flat beak */}
      <path d={`M ${hx + 14} ${hy - 4} Q ${hx + 52} ${hy - 6} ${hx + 64} ${hy + 6} Q ${hx + 46} ${hy + 16} ${hx + 12} ${hy + 12} Z`} fill={BEAK} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
      <path d={`M ${hx + 20} ${hy + 6} Q ${hx + 40} ${mood === 'smug' ? hy + 10 : hy + 4} ${hx + 58} ${hy + 6}`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <ellipse cx={hx} cy={hy} rx={30} ry={26} fill={OST_NECK} stroke={INK} strokeWidth={6} />
      <path d={`M ${hx - 22} ${hy - 22} q 4 -14 12 -4 q 4 -14 12 -2 q 6 -12 12 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={hx + 4} cy={hy - 4} rx={mood === 'shock' ? 16 : 14} ry={mood === 'shock' ? 18 : 16} fill="#fff" stroke={INK} strokeWidth={4.5} />
      <circle cx={hx + 8} cy={hy - 2} r={mood === 'shock' ? 4.5 : 6} fill={INK} />
      {mood === 'smug' ? <path d={lidPath(hx + 4, hy - 4, 14.5, 16.5, 0.48)} fill={OST_NECK} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      <path d={`M ${hx - 6} ${hy - 20} l -6 -8 M ${hx + 2} ${hy - 21} l -2 -9 M ${hx + 10} ${hy - 20} l 2 -9`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};
/** the cheetah, side view facing right, feet on y = 0, galloping (ph = stride phase); mood */
const Cheetah: React.FC<{t: number; ph: number; mood: 'smug' | 'shock'; jaw?: number}> = ({t, ph, mood, jaw = 0}) => {
  const u = 0.5 - 0.5 * Math.cos(2 * Math.PI * ph);                  // 0 = stretched out, 1 = gathered
  const lift = 18 * Math.sin(2 * Math.PI * ph + 0.6);
  const sh: P2 = [lerp(118, 84, u), lerp(-124, -136, u) - lift], hp: P2 = [lerp(-96, -62, u), lerp(-118, -140, u) - lift];
  const fl = (o: number): P2[] => { const v = 0.5 - 0.5 * Math.cos(2 * Math.PI * (ph + o)); return [sh, lp2([168, -78], [70, -70], v), lp2([220, -10], [14, -8], v)].map((p, i) => i ? [p[0], p[1] - (i === 2 ? 0 : lift * 0.4)] as P2 : p); };
  const hl = (o: number): P2[] => { const v = 0.5 - 0.5 * Math.cos(2 * Math.PI * (ph + o)); return [hp, lp2([-150, -86], [-18, -96], v), lp2([-206, -12], [64, -10], v)]; };
  const leg = (pts: P2[], back: boolean, k: string) => {
    const c = back ? CHE2 : CHE;
    return <g key={k}>
      <path d={poly(pts)} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={poly(pts)} stroke={c} strokeWidth={19} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <ellipse cx={pts[2][0] + 6} cy={pts[2][1] - 2} rx={17} ry={10} fill={c} stroke={INK} strokeWidth={4.5} />
    </g>;
  };
  const mid = lp2(sh, hp, 0.5), a = ang(hp, sh), L = dist(hp, sh);
  const sw = 22 * Math.sin(2 * Math.PI * ph);
  const tail = cbez([hp[0] - 20, hp[1] - 6], [hp[0] - 90, hp[1] - 30], [hp[0] - 150, hp[1] + 10 + sw], [hp[0] - 196, hp[1] - 36 + sw]);
  const hd: P2 = [sh[0] + 62, sh[1] - 34];
  return (
    <g>
      {leg(hl(0.5), true, 'hb')}{leg(fl(0.5), true, 'fb')}
      <path d={taper(tail, 20, 12)} fill={CHE} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[0.66, 0.78, 0.9].map((v, i) => { const q = tail[Math.round(v * (tail.length - 1))]; return <circle key={i} cx={q[0]} cy={q[1]} r={7} fill={SPOT} />; })}
      <circle cx={tail[tail.length - 1][0]} cy={tail[tail.length - 1][1]} r={8} fill={CHE_LT} stroke={INK} strokeWidth={4} />
      <ellipse cx={mid[0]} cy={mid[1]} rx={L / 2 + 34} ry={40} transform={`rotate(${a} ${mid[0]} ${mid[1]})`} fill={CHE} stroke={INK} strokeWidth={7} />
      <ellipse cx={sh[0] - 6} cy={sh[1] + 8} rx={52} ry={48} fill={CHE} stroke={INK} strokeWidth={7} />
      <ellipse cx={hp[0] + 6} cy={hp[1] + 6} rx={46} ry={46} fill={CHE} stroke={INK} strokeWidth={7} />
      <ellipse cx={mid[0] + 10} cy={mid[1] + 14} rx={L / 2} ry={22} transform={`rotate(${a} ${mid[0]} ${mid[1]})`} fill={CHE} />
      <ellipse cx={sh[0] + 4} cy={sh[1] + 34} rx={30} ry={14} fill={CHE_LT} />
      {Array.from({length: 16}, (_, i) => {
        const v = 0.08 + 0.84 * rnd(i * 3.3), w = (rnd(i * 7.1) - 0.5) * 50;
        const q = lp2(hp, sh, v), ra = ((a + 90) * Math.PI) / 180;
        return <circle key={i} cx={q[0] + Math.cos(ra) * w} cy={q[1] + Math.sin(ra) * w} r={5 + 2 * rnd(i)} fill={SPOT} />;
      })}
      {leg(hl(0), false, 'hf')}{leg(fl(0), false, 'ff')}
      {/* head: small and round, black tear marks, smug */}
      <path d={`M ${hd[0] - 22} ${hd[1] - 30} l -4 -16 l 16 8 Z M ${hd[0] + 6} ${hd[1] - 34} l 4 -16 l 10 14 Z`} fill={CHE} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={hd[0]} cy={hd[1]} r={38} fill={CHE} stroke={INK} strokeWidth={6.5} />
      <ellipse cx={hd[0] + 28} cy={hd[1] + 14 + jaw * 8} rx={20} ry={15 + jaw * 6} fill={CHE_LT} stroke={INK} strokeWidth={5} />
      {jaw > 0.05 ? <ellipse cx={hd[0] + 30} cy={hd[1] + 26 + jaw * 6} rx={9} ry={10 * jaw} fill="#5A2328" stroke={INK} strokeWidth={3.5} /> : null}
      <path d={`M ${hd[0] + 38} ${hd[1] + 2} l 8 2 l -6 6 Z`} fill={INK} />
      <ellipse cx={hd[0] + 10} cy={hd[1] - 8} rx={11} ry={mood === 'shock' ? 14 : 12} fill="#F6C64A" stroke={INK} strokeWidth={4} />
      <circle cx={hd[0] + 13} cy={hd[1] - 7} r={mood === 'shock' ? 3.5 : 4.5} fill={INK} />
      {mood === 'smug' ? <path d={lidPath(hd[0] + 10, hd[1] - 8, 11.5, 12.5, 0.48)} fill={CHE} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /> : null}
      <path d={`M ${hd[0] + 4} ${hd[1] + 2} Q ${hd[0] + 10} ${hd[1] + 18} ${hd[0] + 18} ${hd[1] + 26}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      {mood === 'smug' && jaw < 0.05 ? <path d={`M ${hd[0] + 22} ${hd[1] + 22} q 8 5 18 -2`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" /> : null}
    </g>
  );
};
/** the tiger beetle, side view facing right, feet on y = 0, ~150 units long; ph = leg phase; ant: 0 antennae up, 1 held stiff forward */
const Beetle: React.FC<{t: number; ph: number; mood: 'smug' | 'calm'; ant?: number; blur?: number}> = ({t, ph, mood, ant = 0, blur = 0}) => {
  const bob = 2 * Math.sin(4 * Math.PI * ph);
  const legs = [[-30, 0], [6, 1 / 3], [40, 2 / 3]].map(([x, o], i) => {
    const q = 2 * Math.PI * (ph + o + (i % 2) * 0.5);
    const sw = Math.sin(q), up = Math.max(0, Math.cos(q));
    const hipP: P2 = [x, -34 + bob], knee: P2 = [x + 10 + 16 * sw, -70 + bob], foot: P2 = [x + 30 + 40 * sw, -2 - 14 * up];
    return [hipP, knee, foot, [foot[0] + 14, foot[1] + 2] as P2];
  });
  const leg = (pts: P2[], back: boolean, k: string) => <g key={k} transform={back ? 'translate(-10 -4)' : ''}>
    <path d={poly(pts)} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={poly(pts)} stroke={back ? BUG2 : BUG} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g>;
  const hx = 76, hy = -50 + bob;
  const tipY = lerp(-150, -4, ant), tipX = lerp(150, 236, ant);
  const antenna = (o: number) => {
    const wob = (1 - ant) * 10 * Math.sin(t * 5 + o);
    const pts = cbez([hx + 6, hy - 18], [hx + 40, lerp(hy - 70, hy - 26, ant)], [tipX - 50, lerp(tipY - 30, tipY - 10, ant) + wob], [tipX + o * 8, tipY + o * 6 + wob]);
    return <g key={o}>
      <path d={poly(pts)} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={poly(pts)} stroke={BUG2} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {[0.3, 0.5, 0.7, 0.88].map((v, i) => { const q = pts[Math.round(v * (pts.length - 1))]; return <circle key={i} cx={q[0]} cy={q[1]} r={3.2} fill={INK} />; })}
    </g>;
  };
  return (
    <g>
      {antenna(-1)}
      {blur > 0.5 ? <ellipse cx={4} cy={-24} rx={70} ry={30} fill={BUG2} fillOpacity={0.35} /> : legs.map((l, i) => leg(l, true, 'b' + i))}
      {/* body: metallic green wing cases with cream marks */}
      <ellipse cx={-6} cy={-46 + bob} rx={60} ry={30} fill={BUG} stroke={INK} strokeWidth={6} />
      <path d={`M -58 ${-48 + bob} Q -6 ${-62 + bob} 50 ${-52 + bob}`} stroke={BUG2} strokeWidth={4} fill="none" />
      <path d={`M -44 ${-62 + bob} Q -10 ${-74 + bob} 26 ${-70 + bob}`} stroke={BUG_LT} strokeWidth={6} fill="none" strokeLinecap="round" />
      {[[-34, -40, 7], [-6, -34, 6], [22, -42, 6.5]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y + bob} rx={r + 2} ry={r} fill={BUG_SPOT} stroke={INK} strokeWidth={3} />)}
      <ellipse cx={50} cy={-50 + bob} rx={20} ry={17} fill={BUG2} stroke={INK} strokeWidth={5.5} />
      {/* head: huge eyes, long crossed mandibles */}
      <path d={`M ${hx + 12} ${hy + 6} Q ${hx + 40} ${hy + 4} ${hx + 44} ${hy + 22} Q ${hx + 34} ${hy + 14} ${hx + 14} ${hy + 14} Z`} fill={IVORY} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M ${hx + 12} ${hy + 12} Q ${hx + 38} ${hy + 22} ${hx + 36} ${hy + 38} Q ${hx + 28} ${hy + 26} ${hx + 10} ${hy + 20} Z`} fill={IVORY} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={hx} cy={hy} r={21} fill={BUG} stroke={INK} strokeWidth={5.5} />
      <ellipse cx={hx + 4} cy={hy - 6} rx={14} ry={16} fill="#fff" stroke={INK} strokeWidth={4} />
      <circle cx={hx + 8} cy={hy - 5} r={5} fill={INK} />
      <circle cx={hx + 6} cy={hy - 8} r={1.8} fill="#fff" />
      {mood === 'smug' ? <path d={lidPath(hx + 4, hy - 6, 14.5, 16.5, 0.46)} fill={BUG} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /> : null}
      {antenna(1)}
      {blur > 0.5 ? <g>{[-20, 0, 20].map((dy, i) => <path key={i} d={`M ${-86 - i * 10} ${-24 + dy} h -60`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}</g> : legs.map((l, i) => leg(l, false, 'f' + i))}
    </g>
  );
};
/** the car (videos/jump), facing right: mirror of the original; wheels spin */
const Car: React.FC<{t: number; look: P2; wow: number; spin: number}> = ({look, wow, spin}) => {
  const eye = (ex: number, k: number) => (
    <g key={k}>
      <ellipse cx={ex} cy={-118} rx={13 + 3 * wow} ry={15 + 4 * wow} fill="#fff" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex - look[0] * 5} cy={-118 + look[1] * 6} r={5.5} fill={INK} />
    </g>
  );
  return (
    <g transform="scale(-1 1)">
      <path d="M -150 -42 Q -152 -84 -118 -88 L -78 -92 Q -56 -150 -20 -154 L 64 -154 Q 92 -152 106 -104 L 128 -98 Q 152 -92 150 -54 L 150 -40 Q 150 -28 138 -28 L -138 -28 Q -150 -28 -150 -42 Z"
        fill={CARC} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -146 -44 L 146 -44 L 146 -34 L -146 -34 Z" fill={CAR2} />
      <path d="M -66 -96 Q -50 -140 -24 -142 L 10 -142 L 10 -96 Z" fill={GLASS} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 22 -96 L 22 -142 L 60 -142 Q 82 -140 94 -102 L 94 -96 Z" fill={GLASS} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {eye(-22, 0)}{eye(54, 1)}
      <path d="M 16 -92 L 16 -40" stroke={INK} strokeWidth={4} />
      <ellipse cx={-140} cy={-66} rx={9} ry={11} fill="#FFE98A" stroke={INK} strokeWidth={4} />
      <rect x={140} y={-74} width={10} height={18} rx={3} fill="#FF8A7E" stroke={INK} strokeWidth={3.5} />
      {[-92, 92].map((wx) => <g key={wx}>
        <circle cx={wx} cy={-30} r={32} fill="#3B3F46" stroke={INK} strokeWidth={6} />
        <circle cx={wx} cy={-30} r={13} fill="#C9CED6" stroke={INK} strokeWidth={4} />
        {[0, 60, 120].map((k) => <path key={k} d="M -24 0 L 24 0" transform={`translate(${wx} -30) rotate(${k - spin})`} stroke="#6C717A" strokeWidth={4} strokeLinecap="round" />)}
      </g>)}
    </g>
  );
};
/** an airliner with a face, side view facing right, centre (0,0); ~900 units long */
const Jet: React.FC<{t: number; look: P2; wow: number}> = ({t, look, wow}) => {
  const eye = (ex: number, k: number) => (
    <g key={k}>
      <ellipse cx={ex} cy={-26} rx={18} ry={20 + 4 * wow} fill="#fff" stroke={INK} strokeWidth={5} />
      <circle cx={ex + look[0] * 6} cy={-26 + look[1] * 8} r={7} fill={INK} />
    </g>
  );
  return (
    <g>
      {[0, 1].map((i) => <path key={i} d={`M ${-430} ${-8 + i * 26} h ${-520 - i * 120}`} stroke="#FFFFFF" strokeWidth={14 - i * 4} strokeLinecap="round" opacity={0.9} />)}
      {/* far wing + tail plane */}
      <path d="M 40 -10 L -60 -10 L -190 -96 L -140 -96 Z" fill="#D9DEE8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -340 -30 L -420 -30 L -470 -70 L -430 -70 Z" fill="#D9DEE8" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* tail fin */}
      <path d="M -300 -40 L -400 -40 L -470 -196 L -414 -196 Z" fill={JET_B} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {/* fuselage */}
      <path d="M -440 -28 Q -460 -10 -440 20 L 300 44 Q 420 44 452 6 Q 440 -40 340 -46 L -380 -46 Q -420 -44 -440 -28 Z" fill={JET_W} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -430 6 L 420 14" stroke={JET_B} strokeWidth={12} strokeLinecap="round" />
      {Array.from({length: 14}, (_, i) => <circle key={i} cx={-300 + i * 40} cy={-16} r={9} fill={GLASS} stroke={INK} strokeWidth={3.5} />)}
      {eye(352, 0)}{eye(396, 1)}
      <ellipse cx={414} cy={16} rx={wow ? 12 : 9} ry={wow ? 14 : 5} fill="#5A2328" stroke={INK} strokeWidth={4} />
      {/* near wing + engine */}
      <path d="M 120 18 L 20 18 L -120 140 L -60 140 Z" fill="#E4E8F0" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 20 60 Q 20 40 50 40 L 150 40 Q 170 50 170 64 Q 170 80 150 86 L 50 86 Q 20 86 20 60 Z" fill="#C3CAD6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={164} cy={63} rx={8} ry={20} fill="#5B6270" stroke={INK} strokeWidth={4} />
    </g>
  );
};
/** an acacia tree, trunk base at (0,0) */
const Acacia: React.FC<{s?: number; dent?: number}> = ({s = 1, dent = 0}) => (
  <g transform={`scale(${s})`}>
    <path d="M -34 0 Q -26 -200 -18 -330 L -120 -440 L -100 -456 L 0 -360 L 110 -470 L 130 -452 L 22 -330 Q 30 -200 38 0 Z" fill={TRUNK} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -8 -40 Q -2 -160 -4 -300" stroke={TRUNK2} strokeWidth={6} fill="none" strokeLinecap="round" />
    {dent > 0 ? <path d={`M -34 ${-150} q -10 30 0 70`} stroke={INK} strokeWidth={5} fill="none" /> : null}
    <path d="M -340 -470 Q -330 -540 -240 -556 Q -180 -600 -90 -586 Q -20 -620 60 -596 Q 160 -616 240 -570 Q 340 -560 350 -486 Q 300 -452 200 -462 Q 100 -446 0 -458 Q -110 -444 -210 -458 Q -300 -448 -340 -470 Z"
      fill={LEAF} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -250 -540 Q -160 -572 -60 -560 M 40 -570 Q 140 -586 230 -548" stroke="#9BCB72" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M -300 -478 Q -200 -470 -100 -476 M 60 -474 Q 170 -470 290 -480" stroke={LEAF2} strokeWidth={7} fill="none" strokeLinecap="round" />
  </g>
);
// ---------- the land: four depth bands, drawn only where the camera can see (the camera travels ~15,000 units) ----------
type Cam3 = {x: number; y: number; z: number};
const vis = (cam: Cam3, z: number): [number, number] => { const k = 1000 / (z - cam.z); return [cam.x - 1250 / k, cam.x + 1250 / k]; };
const each = (r: [number, number], step: number, f: (x: number, i: number) => React.ReactNode) => {
  const out: React.ReactNode[] = [];
  for (let i = Math.floor(r[0] / step); i <= Math.ceil(r[1] / step); i++) out.push(f(i * step, i));
  return out;
};
const streaks = (r: [number, number], y0: number, y1: number, col: string, s: number, seed: number) => s < 0.02 ? null : each(r, 260, (x, i) => {
  const y = lerp(y0, y1, rnd(i * 3.7 + seed)), len = 500 + 900 * rnd(i * 1.9 + seed);
  return <path key={'k' + i} d={`M ${x} ${y} h ${len}`} stroke={col} strokeWidth={8 + 6 * rnd(i + seed)} strokeLinecap="round" opacity={s} />;
});
const Far: React.FC<{cam: Cam3; sm: number}> = ({cam, sm}) => {
  const r = vis(cam, 3200);
  const hill = (x: number) => -70 - 46 * Math.sin(x / 820) - 26 * Math.sin(x / 330 + 1.3);
  const pts = each([r[0] - 200, r[1] + 200], 80, (x) => `${x.toFixed(0)} ${hill(x).toFixed(1)}`) as string[];
  return (
    <g>
      <path d={`M ${pts.join(' L ')} L ${r[1] + 300} 3000 L ${r[0] - 300} 3000 Z`} fill={G_HILL} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <rect x={r[0] - 300} y={0} width={r[1] - r[0] + 600} height={3000} fill={G_FAR} />
      <path d={`M ${r[0] - 300} 0 H ${r[1] + 300}`} stroke={INK} strokeWidth={5} />
      <g opacity={1 - sm}>{each(r, 1100, (x, i) => rnd(i * 2.1) < 0.6 ? <g key={i} transform={`translate(${x + 300 * rnd(i)} ${hill(x + 300 * rnd(i)) + 6}) scale(0.32)`}><Acacia /></g> : null)}</g>
      {streaks(r, -120, 300, '#CDBF8E', sm, 1)}
    </g>
  );
};
const Mid: React.FC<{cam: Cam3; sm: number}> = ({cam, sm}) => {
  const r = vis(cam, 1900);
  return (
    <g>
      <rect x={r[0] - 300} y={0} width={r[1] - r[0] + 600} height={3000} fill={G_MID} />
      <path d={`M ${r[0] - 300} 0 H ${r[1] + 300}`} stroke={INK} strokeWidth={6} />
      <g opacity={1 - sm}>
        {each(r, 1500, (x, i) => rnd(i * 5.3) < 0.75 ? <g key={'a' + i} transform={`translate(${x + 500 * rnd(i * 1.7)} 0) scale(${0.62 + 0.3 * rnd(i * 2.9)})`}><Acacia /></g> : null)}
        {each(r, 340, (x, i) => <path key={'g' + i} d={`M ${x - 40} 2 q 10 -40 18 -60 q 2 30 8 40 q 8 -36 22 -50 q -2 34 4 56 q 10 -24 24 -30 q -6 22 -4 44 Z`}
          transform={`translate(${160 * rnd(i * 4.4)} 0)`} fill="#C9B26A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
      </g>
      {streaks(r, -140, 400, '#CDB677', sm, 2)}
    </g>
  );
};
const Road: React.FC<{cam: Cam3; sm: number}> = ({cam, sm}) => {
  const r = vis(cam, 1700);
  return (
    <g>
      <rect x={r[0] - 300} y={-30} width={r[1] - r[0] + 600} height={40} fill={ROADC} />
      <rect x={r[0] - 300} y={10} width={r[1] - r[0] + 600} height={3000} fill={G_ROAD} />
      <path d={`M ${r[0] - 300} -30 H ${r[1] + 300} M ${r[0] - 300} 10 H ${r[1] + 300}`} stroke={INK} strokeWidth={6} />
      <g opacity={1 - sm}>{each(r, 180, (x, i) => <path key={i} d={`M ${x} -10 h 80`} stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" />)}</g>
      {streaks(r, 30, 500, '#CDB377', sm, 3)}
    </g>
  );
};
const Main: React.FC<{cam: Cam3; sm: number}> = ({cam, sm}) => {
  const r = vis(cam, 1000);
  return (
    <g>
      <rect x={r[0] - 300} y={0} width={r[1] - r[0] + 600} height={3000} fill={G_MAIN} />
      <path d={`M ${r[0] - 300} 0 H ${r[1] + 300}`} stroke={INK} strokeWidth={7} />
      <g opacity={1 - sm}>
        {each(r, 170, (x, i) => <ellipse key={'p' + i} cx={x + 90 * rnd(i * 2.2)} cy={30 + 220 * rnd(i * 3.1)} rx={10 + 10 * rnd(i)} ry={6 + 4 * rnd(i * 1.3)} fill="#C9A86B" />)}
        {each(r, 430, (x, i) => <path key={'t' + i} d="M -30 4 q 6 -30 12 -44 q 2 22 6 30 q 6 -28 18 -38 q -2 26 2 42 q 8 -18 18 -22 q -4 16 -2 32 Z"
          transform={`translate(${x + 200 * rnd(i * 4.4)} 0)`} fill="#B9A35E" stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
      </g>
      {streaks(r, 20, 700, '#C7A96E', sm, 4)}
    </g>
  );
};
/** dust kicked up behind his feet: a puff at every footfall that stays where it was kicked */
const Dust: React.FC<{t: number; a: number; b: number; foot: (tt: number) => P2}> = ({t, a, b, foot}) => {
  const fs = DUST_T.filter((f) => f >= a && f < b && f <= t && t - f < 0.5);
  if (!fs.length) return null;
  const puffs = fs.flatMap((f, j) => {
    const u = (t - f) / 0.5, p = foot(f), k = Math.sin(Math.PI * Math.min(1, u * 1.3));
    return [0, 1, 2].map((i) => ({cx: p[0] - 30 - 40 * u - i * 26, cy: p[1] - 14 - 30 * u * (1 + i * 0.4), r: (16 + 8 * rnd(j * 3 + i)) * k}));
  }).filter((q) => q.r > 1);
  return <W>
    {puffs.map((q, i) => <circle key={'o' + i} cx={q.cx} cy={q.cy} r={q.r + 6} fill={INK} />)}
    {puffs.map((q, i) => <circle key={'f' + i} cx={q.cx} cy={q.cy} r={q.r} fill="#F2E6CC" />)}
  </W>;
};
const DUST_T = [...footfalls(0, CRASH - 0.01), ...footfalls(UP + 0.2, DURATION)];

// ---------- screen-space bits ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 450}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
/** a round panel (a magnifier when `handle`): its own little world inside a circle */
const Lens: React.FC<{id: string; R: number; bg: string; handle?: boolean; children: React.ReactNode}> = ({id, R, bg, handle, children}) => (
  <svg width={1000} height={1000} viewBox="-500 -500 1000 1000" style={{overflow: 'visible', position: 'absolute', left: -500, top: -500}}>
    <clipPath id={id}><circle r={R} /></clipPath>
    {handle ? <g transform="rotate(-135)"><rect x={R + 6} y={-26} width={170} height={52} rx={22} fill="#9C6B3F" stroke={INK} strokeWidth={9} /><rect x={R + 6} y={-12} width={150} height={10} rx={5} fill="#C08A57" /></g> : null}
    <circle r={R + 20} fill={INK} />
    <g clipPath={`url(#${id})`}>
      <rect x={-500} y={-500} width={1000} height={1000} fill={bg} />
      {children}
    </g>
    <circle r={R + 4} fill="none" stroke="#CFDDEA" strokeWidth={12} />
    <path d={`M ${-R * 0.62} ${-R * 0.42} A ${R * 0.75} ${R * 0.75} 0 0 1 ${-R * 0.12} ${-R * 0.74}`} stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.7} />
  </svg>
);
/** FOR ITS SIZE: the magnifier on a running tiger beetle + BODY LENGTHS A SECOND, cheetah 20 vs beetle 120 */
const SizePanel: React.FC<{t: number; uid: string}> = ({t, uid}) => {
  const s = popIn(t, MAG_IN, 0.35) * (1 - seg(t, MAG_OUT - 0.14, MAG_OUT));
  if (s < 0.01) return null;
  const ph = t * 6;
  const gx = -((t * 900) % 150);
  const bar = (v: number) => eout(seg(t, T.beetle, T.faster)) * v;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920}}>
      <div style={{position: 'absolute', left: 735, top: 650, transform: `rotate(2deg) scale(${s})`}}>
        <Lens id={`mag${uid}`} R={205} bg="#F7EDD3" handle>
          <rect x={-500} y={-500} width={1000} height={560} fill="#FFF8E8" />
          <path d="M -500 60 H 500" stroke={INK} strokeWidth={6} />
          {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={gx + i * 150 - 500 + 60 * rnd(i)} cy={96 + 40 * rnd(i * 2.3)} rx={14} ry={8} fill="#D9C08E" />)}
          {Array.from({length: 9}, (_, i) => <path key={'r' + i} d={`M ${gx + i * 150 - 500} 76 v 22`} stroke="#B89A62" strokeWidth={5} strokeLinecap="round" />)}
          <g transform="translate(-70 62) scale(1.45)"><Beetle t={t} ph={ph} mood="smug" ant={0.45} /></g>
          {[-40, -10, 20].map((dy, i) => <path key={'m' + i} d={`M ${-190 - i * 14} ${dy - 30} h -70`} stroke={INK} strokeWidth={7} strokeLinecap="round" />)}
        </Lens>
      </div>
      <Card text="FOR ITS SIZE" top={398} left={735} size={46} s={s * popIn(t, T.size, 0.3)} rot={-3} />
      <Card text="TIGER BEETLE" top={872} left={735} size={44} color={BUG} fg="#fff" s={s * popIn(t, T.tiger, 0.3)} rot={2} />
      <div style={{position: 'absolute', left: 742, top: 1090, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s * popIn(t, T.beetle - 0.15, 0.3)})`, background: '#FFFDF6',
        border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '12px 24px 18px', fontFamily: FONT, color: INK, width: 600, boxSizing: 'border-box'}}>
        <div style={{fontWeight: 900, fontSize: 38, letterSpacing: -0.5, textAlign: 'center'}}>BODY LENGTHS A SECOND</div>
        {[{n: 'CHEETAH', v: 20, c: CHE}, {n: 'BEETLE', v: 120, c: BUG}].map((r, i) => (
          <div key={i} style={{display: 'flex', alignItems: 'center', marginTop: 12, gap: 14}}>
            <div style={{width: 190, fontWeight: 900, fontSize: 38}}>{r.n}</div>
            <div style={{flex: 1, height: 44, position: 'relative'}}>
              <div style={{position: 'absolute', left: 0, top: 0, height: 44, width: `${(bar(r.v) / 120) * 100}%`, minWidth: 10, background: r.c, border: `7px solid ${INK}`, borderRadius: 14, boxSizing: 'border-box'}} />
            </div>
            <div style={{width: 84, fontWeight: 900, fontSize: 44, textAlign: 'right'}}>{Math.round(bar(r.v))}</div>
          </div>
        ))}
      </div>
      <Card text="x6" top={1210} left={985} size={70} color={GOLD} rot={8} s={s * popIn(t, T.faster, 0.3)} />
    </div>
  );
};
/** ITS VIEW (blurry while it runs, sharp when it stops) and then its antennae feeling the way (a pebble: TAP, hop) */
const BeetlePanel: React.FC<{t: number; uid: string}> = ({t, uid}) => {
  const s = popIn(t, P_IN, 0.35) * (1 - seg(t, P_OUT - 0.14, P_OUT));
  if (s < 0.01) return null;
  const flip = Math.abs(Math.cos(Math.PI * seg(t, P_FLIP - 0.09, P_FLIP + 0.09)));
  const mode = t < P_FLIP ? 'view' : 'ant';
  let content: React.ReactNode;
  if (mode === 'view') {
    const running = t < STOP1;
    // ground position: scrolls fast while running, holds once it stops
    const gx = -(1100 * (Math.min(t, STOP1) - P_IN));
    const ax = clamp(260 + 0.12 * gx, 80, 260);
    const scene = (
      <g>
        <rect x={-500} y={-500} width={1000} height={420} fill="#FFF8E8" />
        <path d="M -500 -80 H 500" stroke={INK} strokeWidth={5} />
        {Array.from({length: 12}, (_, i) => { const x = ((gx * 0.4 + i * 110) % 1100 + 1100) % 1100 - 550; return <path key={'g' + i} d={`M ${x} -78 q 6 -30 10 -40 q 4 26 8 34 q 6 -22 14 -28 q -2 20 0 34 Z`} fill="#C9B26A" stroke={INK} strokeWidth={4} />; })}
        {Array.from({length: 14}, (_, i) => { const x = ((gx + i * 90) % 1260 + 1260) % 1260 - 630; return <ellipse key={'p' + i} cx={x} cy={40 + 160 * rnd(i * 1.7)} rx={16 + 10 * rnd(i)} ry={9 + 4 * rnd(i)} fill="#D2B57D" stroke={INK} strokeWidth={4} />; })}
        {/* the ant it is chasing */}
        <g transform={`translate(${ax} 60) scale(1.5)`}>
          {[-14, 2, 18].map((x, i) => <path key={i} d={`M ${x} -14 l ${-8 + 4 * Math.sin(t * 30 + i)} 18`} stroke={INK} strokeWidth={4} strokeLinecap="round" />)}
          <ellipse cx={-22} cy={-22} rx={16} ry={12} fill="#3A2A22" stroke={INK} strokeWidth={4} />
          <ellipse cx={2} cy={-22} rx={9} ry={8} fill="#3A2A22" stroke={INK} strokeWidth={4} />
          <circle cx={20} cy={-24} r={10} fill="#3A2A22" stroke={INK} strokeWidth={4} />
          <path d="M 26 -32 q 10 -12 18 -8 M 22 -34 q 6 -14 14 -12" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          <circle cx={24} cy={-26} r={2.5} fill="#fff" />
        </g>
      </g>
    );
    content = running ? (
      <g>
        <filter id={`bl${uid}`} x="-50%" y="-20%" width="200%" height="140%"><feGaussianBlur stdDeviation="26 2" /></filter>
        <g filter={`url(#bl${uid})`}>{scene}</g>
        <rect x={-500} y={-500} width={1000} height={1000} fill="#F5E9CF" opacity={0.45} />
      </g>
    ) : scene;
  } else {
    // side view: the beetle runs right, antennae stiff forward just above the ground; a pebble comes; TAP; it pitches up and hops over
    const gx = -((t - P_FLIP) * 700);
    const rockX = 520 + gx * 1.0 + 0;                    // the pebble scrolls in from the right
    const hop = Math.sin(Math.PI * seg(t, TAP + 0.04, TAP + 0.42));
    const pitch = -16 * Math.sin(Math.PI * seg(t, TAP, TAP + 0.5));
    content = (
      <g>
        <rect x={-500} y={-500} width={1000} height={600} fill="#FFF8E8" />
        <path d="M -500 100 H 500" stroke={INK} strokeWidth={6} />
        {Array.from({length: 12}, (_, i) => { const x = ((gx + i * 100) % 1200 + 1200) % 1200 - 600; return <ellipse key={i} cx={x} cy={150 + 120 * rnd(i * 2.1)} rx={14 + 8 * rnd(i)} ry={8 + 3 * rnd(i)} fill="#D9C08E" />; })}
        <g transform={`translate(${rockX} 102)`}>
          <path d="M -46 0 Q -44 -40 -6 -48 Q 34 -46 44 -6 L 44 0 Z" fill="#B8AFA0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -26 -30 Q -10 -40 10 -38" stroke="#D7D0C4" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
        <g transform={`translate(-150 ${100 - 120 * hop}) rotate(${pitch}) scale(1.7)`}><Beetle t={t} ph={t * 7} mood="calm" ant={1} /></g>
        {[-30, 0, 30].map((dy, i) => <path key={'m' + i} d={`M ${-330 - i * 12} ${40 + dy - 120 * hop} h -70`} stroke={INK} strokeWidth={7} strokeLinecap="round" />)}
      </g>
    );
  }
  return (
    <div style={{position: 'absolute', left: 540, top: 800, transform: `rotate(-1.5deg) scale(${s * (0.06 + 0.94 * flip)}, ${s})`}}>
      <Lens id={`bp${uid}`} R={300} bg="#F7EDD3">{content}</Lens>
    </div>
  );
};
const RUNGS = [{name: 'OSTRICH', v: 70, ref: 'FASTEST HUMAN: 44'}, {name: 'CHEETAH', v: 93, ref: 'AS FAST AS A CAR'}, {name: 'TIGER BEETLE', v: 750, ref: 'ALMOST A JET'}];
/** the one number: how fast these legs would carry you, with the finished rungs ranked underneath */
const Counter: React.FC<{t: number}> = ({t}) => {
  const end = t >= UP + 0.2;
  if (!end && t > CRASH + 0.75) return null;
  const s = end ? popIn(t, UP + 0.25, 0.3) : 1 - eio(seg(t, CRASH + 0.5, CRASH + 0.75));
  if (s < 0.01) return null;
  const rung = end || t < POOF1 + 0.1 ? 0 : t < POOF2 + 0.1 ? 1 : 2;
  let v = String(RUNGS[rung].v), sub = RUNGS[rung].ref, subOn = 1, red = false, landed = 0;
  if (rung === 0 && !end) { subOn = popIn(t, T.fastest, 0.3); landed = T.fastest; }
  if (rung === 1) {
    const u = seg(t, 3.3, T.cars - 0.04);
    v = String(Math.round(lerp(70, 93, eout(u))));
    subOn = t >= T.cars ? 1 : 0; landed = T.cars;
  } else if (rung === 2) {
    if (t < LAUNCH) { v = '?'; subOn = 0; } else if (t < CRASH) {
      v = String(Math.round(lerp(93, 750, (vAt(t) - V2) / (V3 - V2))));     // follows his real speed
      subOn = t >= T.jet ? 1 : 0; landed = T.jet;
    } else { v = '0'; sub = 'CRASH'; red = true; }
  }
  const bump = landed && t >= landed ? 1 + 0.12 * Math.exp(-6 * (t - landed)) : 1;
  const chips = end ? [] : RUNGS.slice(0, rung);
  return (
    <div style={{position: 'absolute', left: 60, top: 468, transform: `scale(${s})`, transformOrigin: '0 0', fontFamily: FONT, color: INK}}>
      <div style={{background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '8px 26px 12px', minWidth: 300,
        transform: `rotate(-2deg) scale(${bump})`, transformOrigin: '20% 50%'}}>
        <div style={{fontWeight: 900, fontSize: 34, letterSpacing: -0.5}}>{`${rung + 1}. ${RUNGS[rung].name} LEGS`}</div>
        <div style={{fontWeight: 900, fontSize: 96, lineHeight: 1, color: red ? RED : INK}}>{v}<span style={{fontSize: 46}}>{v === '?' ? '' : ' km/h'}</span></div>
        <div style={{fontWeight: 900, fontSize: 32, color: red ? RED : '#7A5A2A', opacity: subOn > 0.01 ? 1 : 0, transform: `scale(${Math.max(0.01, subOn)})`, transformOrigin: '0 50%'}}>{sub}</div>
      </div>
      {chips.map((c, i) => (
        <div key={i} style={{marginTop: 14, marginLeft: 12, display: 'table', background: '#F3EDE0', border: `6px solid ${INK}`, borderRadius: 18, padding: '2px 16px',
          fontWeight: 900, fontSize: 28, transform: `rotate(${i ? 1.5 : -1}deg)`, whiteSpace: 'nowrap'}}>{`${i + 1}. ${c.name} ${c.v} km/h`}</div>
      ))}
    </div>
  );
};
/** horizontal speed streaks across the frame (the world rushing left) */
export const Streaks: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.02) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 14}, (_, i) => {
        const y = 200 + rnd(i * 7.3) * 1500, len = 260 + rnd(i * 3.1) * 360, sp = 3200 + rnd(i * 5.7) * 2400;
        const x = ((((-t * sp) + rnd(i * 9.1) * 2600) % 2600) + 2600) % 2600 - 600;
        return <g key={i} opacity={0.8 * s}>
          <path d={`M ${x} ${y} h ${len}`} stroke={INK} strokeWidth={13} strokeLinecap="round" />
          <path d={`M ${x} ${y} h ${len}`} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
        </g>;
      })}
    </svg>
  );
};

// ---------- the story over time ----------
const base = (): GS => ({x: 0, y: 0, legs: 'ost', ph: 0, wheel: false, arms: ARM.down, mood: 'joy', look: [1, 0], rot: 0, sx: 1, sy: 1, sit: 0, tail: 1});
const FLAT_Y0 = -LEGS.bug.hip - 30;                            // his hips as he hits the trunk
const SIT_X = TREE_X - 120, SIT_Y = -34;                        // sitting against the trunk
const guyAt = (t: number): GS => {
  const g = base();
  g.legs = t < POOF1 + 0.12 ? 'ost' : t < POOF2 + 0.12 ? 'chee' : t < POOF3 + 0.12 ? 'bug' : 'ost';
  const ph = PHof(t);
  g.ph = ph;
  if (t < CRASH) {
    const d = LEGS[g.legs];
    const bob = 7 * Math.cos(4 * Math.PI * ph + Math.PI);
    g.x = Xof(t); g.y = -d.hip + bob;
    g.wheel = t >= WHEEL_ON;
    g.rot = g.wheel ? 16 : g.legs === 'chee' ? 9 : 6;
    g.arms = g.wheel ? ARM.stream : runArms(ph);
    g.mood = t < POOF2 + 0.12 ? 'joy' : t < LAUNCH ? 'focus' : t < BLUR ? 'scream' : 'shock';
    g.look = t > BLUR ? [0.2, -0.2] : [1, 0];
    if (t >= LAUNCH && t < WHEEL_ON) g.ph = PHof(t);
    return g;
  }
  if (t < PEEL) {
    // WHAM: pressed flat against the trunk, then sliding down it
    const u = seg(t, CRASH + 0.25, PEEL);
    g.ph = PHof(CRASH - 0.01) % 1;
    g.x = TREE_X - 36 - 28; g.y = FLAT_Y0 + 70 * u * u;
    const k = Math.exp(-14 * (t - CRASH));
    g.sx = 0.56 - 0.22 * k; g.sy = 1.06 + 0.08 * k; g.rot = 0;
    g.arms = ARM.splat; g.mood = 'oof'; g.look = [0, 0];
    return g;
  }
  // dazed, sitting against the trunk; then the close-up
  const drop = eout(seg(t, PEEL, PEEL + 0.18));
  g.sit = 1; g.x = lerp(TREE_X - 54, SIT_X, drop); g.y = lerp(FLAT_Y0 + 70, SIT_Y, drop);
  g.sx = lerp(0.6, 1, eout(seg(t, PEEL, PEEL + 0.3))); g.sy = lerp(1.1, 1, drop);
  g.rot = -4; g.arms = ARM.limp; g.mood = 'dizzy'; g.look = [0, 0];
  if (t >= SG) {
    g.mood = t < PAT ? 'dizzy' : t < T.any ? 'worry' : 'look';
    const up = seg(t, PAT - 0.12, PAT + 0.1) * (1 - seg(t, T.have + 0.05, T.have + 0.25));
    g.arms = blendArms(ARM.limp, ARM.pat, eio(up));
    g.look = t < T.any ? [0, -1] : [1, -0.2];
    if (t >= T.have + 0.25 && t < POOF3) g.arms = blendArms(ARM.limp, ARM.shrug, eio(seg(t, T.have + 0.2, T.any)));
  }
  if (t >= POOF3 + 0.12 && t < UP) { g.mood = 'happy'; g.arms = ARM.down; }
  if (t >= UP) {
    // up and running again (the tracking shot = frame 0)
    const d = LEGS.ost;
    g.sit = 0; g.sx = 1; g.sy = 1;
    g.x = SIT_X + (Xof(t) - Xof(UP)); g.y = -d.hip + 7 * Math.cos(4 * Math.PI * ph + Math.PI);
    g.rot = 6; g.arms = runArms(ph); g.mood = 'joy'; g.look = [1, 0];
  }
  return g;
};
/** the ostrich's place: beside him (ahead) at frame 0, left behind at the cheetah POOF, back for the ending */
const ostAt = (t: number): {on: boolean; dx: number; mood: 'smug' | 'shock'} => {
  if (t < POOF1) return {on: true, dx: 165, mood: 'smug'};
  if (t < POOF1 + 1.2) return {on: true, dx: 165 - 1200 * (seg(t, POOF1, POOF1 + 1.2) ** 1.4), mood: 'shock'};
  if (t >= UP) return {on: true, dx: lerp(-900, 165, eout(seg(t, UP + 0.15, UP + 1.0))), mood: 'smug'};
  return {on: false, dx: 0, mood: 'smug'};
};
const cheAt = (t: number): {on: boolean; dx: number; mood: 'smug' | 'shock'; jaw: number} => {
  if (t < POOF1 + 0.1 || t > LAUNCH + 0.9) return {on: false, dx: 0, mood: 'smug', jaw: 0};
  const inn = eout(seg(t, POOF1 + 0.1, POOF1 + 0.6));
  const out = t > LAUNCH ? (Xof(t) - Xof(LAUNCH)) - V2 * (t - LAUNCH) : 0;
  return {on: true, dx: lerp(-900, 130, inn) - out, mood: t > T.faster ? 'shock' : 'smug', jaw: seg(t, T.faster, T.faster + 0.2)};
};
const carAt = (t: number): {on: boolean; dx: number} => {
  if (t < 3.7 || t > LAUNCH + 0.9) return {on: false, dx: 0};
  const out = t > LAUNCH ? (Xof(t) - Xof(LAUNCH)) - V2 * (t - LAUNCH) : 0;
  return {on: true, dx: lerp(-1800, 320, eout(seg(t, 3.7, 4.5))) - out};
};
const JET_DX0 = -2600, JET_DX1 = 40;
const jetAt = (t: number): {on: boolean; x: number} => {
  if (t < JET_IN || t > CRASH + 0.6) return {on: false, x: 0};
  if (t < CRASH) return {on: true, x: Xof(t) + lerp(JET_DX0, JET_DX1, eout(seg(t, JET_IN, CRASH)))};
  return {on: true, x: XC + JET_DX1 + V3 * 1.1 * (t - CRASH)};
};
// the beetle in the close-up: comes down the trunk, hops onto his head, tips forward and taps his forehead (BOOP BOOP), zips off at the POOF
const BUG_S = 0.42;
const bugAt = (t: number): {on: boolean; x: number; y: number; rot: number; ant: number; fl: boolean} => {
  if (t < SG || t > POOF3 + 0.3) return {on: false, x: 0, y: 0, rot: 0, ant: 0, fl: true};
  if (t < HOP) return {on: true, x: TREE_X - 40, y: lerp(-470, -330, eio(seg(t, SG, HOP - 0.05))), rot: 90, ant: 0.2, fl: false};
  const head: P2 = [SIT_X + 44, SIT_Y - 177 - 62];               // its feet on top of his head
  const u = seg(t, HOP, HOP + 0.22);
  const x = lerp(TREE_X - 40, head[0], eio(u)), y = lerp(-330, head[1], u) - 80 * Math.sin(Math.PI * u);
  const tap = Math.max(t >= BOOP1 - 0.06 ? Math.exp(-9 * Math.max(0, t - BOOP1)) * seg(t, BOOP1 - 0.06, BOOP1) : 0,
    t >= BOOP2 - 0.06 ? Math.exp(-9 * Math.max(0, t - BOOP2)) * seg(t, BOOP2 - 0.06, BOOP2) : 0);
  const zip = seg(t, POOF3, POOF3 + 0.3);
  return {on: true, x: x + 900 * zip * zip, y: y - 120 * zip, rot: -35 * tap, ant: 0.25 + 0.75 * tap, fl: true};
};

// ---------- camera ----------
const GROUND_SY = 1560;                                       // screen y of the ground while running
const camFor = (t: number, g: GS): {x: number; y: number; k: number} => {
  if (t < LAUNCH) {
    const mag = eio(seg(t, MAG_IN - 0.2, MAG_IN + 0.3)) * (1 - eio(seg(t, MAG_OUT - 0.2, MAG_OUT + 0.2)));
    const k = lerp(2.2, 1.95, mag), sx = lerp(400, 250, mag);
    return {x: Xof(t) + (540 - sx) / k, y: -(lerp(GROUND_SY, 1640, mag) - 960) / k, k};
  }
  if (t < CRASH) {
    const u = eio(seg(t, LAUNCH, 9.7));
    const k = Math.exp(lerp(Math.log(2.2), Math.log(1.5), u)), sx = lerp(400, 360, u);
    return {x: Xof(t) + (540 - sx) / k, y: -(lerp(GROUND_SY, 1660, u) - 960) / k, k};
  }
  if (t < SG) {
    const k = lerp(1.85, 1.92, seg(t, CRASH, SG));
    return {x: TREE_X - 150, y: -(1640 - 960) / k, k};
  }
  if (t < POOF3 - 0.02) return {x: SIT_X + 20, y: -330, k: lerp(3.3, 3.4, seg(t, SG, POOF3))};
  return {x: g.x + (540 - 400) / 2.2, y: -(GROUND_SY - 960) / 2.2, k: 2.2};
};

export const SpeedScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t);
  const c0 = camK ?? camFor(t, g);
  const sh = shake(t, hit(t, LAUNCH, 8, 6) + hit(t, CRASH, 30, 4.5) + hit(t, PEEL + 0.18, 4, 8) + hit(t, BOOP1, 1.5, 9) + hit(t, BOOP2, 1.5, 9)
    + (t > TOP - 0.6 && t < CRASH ? 3 * seg(t, TOP - 0.6, TOP) : 0));
  const camK0 = camAt([{t: 0, x: c0.x, y: c0.y, k: c0.k}], 0);
  const cam = {...camK0, x: camK0.x + sh.x, y: camK0.y + sh.y};
  const sm = t < CRASH ? seg(t, 9.2, 9.9) : 0;                // the land smears into streaks at top speed
  const blurPx = t < CRASH ? 7 * seg(t, BLUR - 0.1, CRASH) : 0;
  const o = ostAt(t), ch = cheAt(t), car = carAt(t), jet = jetAt(t), bug = bugAt(t);
  const running = t < CRASH || t >= UP;
  const X = running ? g.x : 0;
  const phO = PHof(t) * 0.9 + 0.3, phC = PHof(t) * 0.8 + 0.15;
  const headX = g.x, headY = g.y - 177 * g.sy;
  // stickers (each ends before its cut)
  const st = {
    zoom: pulse(t, T.outrun, 0.5), poof1: pulse(t, POOF1, 0.25), honk: pulse(t, 5.22, 0.3), poof2: pulse(t, POOF2, 0.25),
    whoosh: pulse(t, LAUNCH + 0.02, 0.45), blur: popIn(t, BLUR, 0.25) * (1 - seg(t, CRASH - 0.06, CRASH)),
    wham: popIn(t, CRASH, 0.22) * (1 - seg(t, P_IN - 0.1, P_IN + 0.1)), noant: popIn(t, T.any + 0.02, 0.3) * (1 - seg(t, POOF3 - 0.1, POOF3)),
    boop1: pulse(t, BOOP1, 0.18), boop2: popIn(t, BOOP2, 0.3) * (1 - seg(t, POOF3 - 0.12, POOF3 - 0.03)), poof3: pulse(t, POOF3, 0.25), boing: pulse(t, UP, 0.4),
  };
  const stars = t > CRASH + 0.15 && t < PAT ? 1 : 0;
  const leaves = t > CRASH && t < CRASH + 2.2;
  const dustFoot = (f: number): P2 => {
    const xg = f < CRASH ? Xof(f) : SIT_X + Xof(f) - Xof(UP);
    return [xg + 30, 0];
  };
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`sFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Sky />
      <Layer cam={cam} z={3200} blur={blurPx * 0.6}><W><Far cam={cam} sm={sm} /></W></Layer>
      <Layer cam={cam} z={1900} blur={blurPx * 0.8}><W><Mid cam={cam} sm={sm} /></W></Layer>
      <Layer cam={cam} z={1700} blur={blurPx}><W>
        <Road cam={cam} sm={sm} />
        {car.on ? <g transform={`translate(${(X + car.dx).toFixed(1)} -8)`}><Car t={t} look={[-1, 0]} wow={t > 4.5 ? 1 : 0} spin={Xof(t) * 0.9} /></g> : null}
      </W></Layer>
      {jet.on ? <Layer cam={cam} z={1500}><W><g transform={`translate(${jet.x.toFixed(1)} -600) scale(1.35)`}><Jet t={t} look={[-0.6, 0.8]} wow={t > T.jet - 0.3 ? 1 : 0} /></g></W></Layer> : null}
      {o.on && running ? <Layer cam={cam} z={1120}><W><g transform={`translate(${(X + o.dx).toFixed(1)} 0)`}><Ostrich t={t} ph={phO} mood={o.mood} /></g></W></Layer> : null}
      {ch.on ? <Layer cam={cam} z={1080}><W><g transform={`translate(${(X + ch.dx).toFixed(1)} 0)`}><Cheetah t={t} ph={phC} mood={ch.mood} jaw={ch.jaw} /></g></W></Layer> : null}
      <Layer cam={cam} z={1000}><W>
        <Main cam={cam} sm={sm} />
        {t > CRASH - 0.12 && t < UP + 1.2 ? <g transform={`translate(${TREE_X} 0)`}><Acacia dent={t > CRASH ? 1 : 0} /></g> : null}
      </W></Layer>
      <Layer cam={cam} z={1000}>
        <Dust t={t} a={0} b={DURATION} foot={dustFoot} />
        <GuyR t={t} g={g} uid={uid} />
        {bug.on ? <W><g transform={`translate(${bug.x.toFixed(1)} ${bug.y.toFixed(1)}) rotate(${bug.rot.toFixed(1)}) scale(${bug.fl ? -BUG_S : BUG_S} ${BUG_S})`}><Beetle t={t} ph={t * 3} mood="smug" ant={bug.ant} /></g></W> : null}
        <Poof t={t} at={POOF1} x={g.x} y={g.y + 30} />
        <Poof t={t} at={POOF2} x={Xof(POOF2 + 0.1) + (Xof(t) - Xof(POOF2 + 0.1))} y={-60} />
        <Poof t={t} at={WHEEL_ON - 0.1} x={g.x} y={-40} s={0.8} />
        <Poof t={t} at={POOF3} x={SIT_X + 10} y={SIT_Y + 4} s={1.1} />
        {leaves ? <W>{Array.from({length: 14}, (_, i) => {
          const u = t - CRASH, x0 = TREE_X - 300 + 600 * rnd(i * 2.3), y0 = -470 - 120 * rnd(i * 3.1);
          const x = x0 + (rnd(i * 5.1) - 0.5) * 260 * u + 30 * Math.sin(u * 6 + i), y = y0 + 300 * u + 260 * u * u;
          return y < 10 ? <ellipse key={i} cx={x} cy={y} rx={16} ry={8} transform={`rotate(${u * 300 + i * 40} ${x} ${y})`} fill={i % 3 ? LEAF : '#9BCB72'} stroke={INK} strokeWidth={4} /> : null;
        })}</W> : null}
        {[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={headX + Math.cos(a) * 96} y={headY - 90 + Math.sin(a) * 16} s={stars * 0.52} rot={t * 200} />;
        })}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={g.x - 70} y={-110} s={st.zoom} text="ZOOM" size={58} rot={-8} fill={GOLD} />
        <Txt x={g.x + 170} y={-200} s={st.poof1} text="POOF" size={52} rot={8} fill="#FFFFFF" />
        <Txt x={X + car.dx + 30} y={-330} s={st.honk} text="HONK" size={50} rot={-8} fill={GOLD} />
        <Txt x={g.x - 170} y={-190} s={st.poof2} text="POOF" size={52} rot={-8} fill="#FFFFFF" />
        <Txt x={g.x + 200} y={-370} s={st.whoosh} text="WHOOSH" size={56} rot={-6} fill="#FFFFFF" />
        <Txt x={g.x + 130} y={-420} s={st.blur} text="BLUR" size={70} rot={6} fill="#FFFFFF" />
        <Txt x={TREE_X - 170} y={-690} s={st.wham} text="WHAM" size={120} rot={-6} fill={RED} />
        <Txt x={SIT_X + 40} y={-450} s={st.noant} text="NO ANTENNAE" size={34} rot={-4} fill={GOLD} />
        <Txt x={SIT_X - 96} y={-292} s={st.boop1} text="BOOP" size={28} rot={-10} fill="#FFFFFF" />
        <Txt x={SIT_X - 84} y={-322} s={st.boop2} text="BOOP" size={28} rot={8} fill="#FFFFFF" />
        <Txt x={g.x + 170} y={-300} s={st.boing} text="BOING" size={54} rot={6} fill={GOLD} />
      </Layer>}
      {thumb ? null : <>
        <Streaks t={t} s={(t > LAUNCH + 0.1 && t < CRASH ? seg(t, LAUNCH + 0.1, 9.4) : 0)} />
        <Counter t={t} />
        <SizePanel t={t} uid={uid} />
        <BeetlePanel t={t} uid={uid} />
        <Card text="ITS VIEW" top={462} left={540} size={46} s={popIn(t, P_IN + 0.05, 0.3) * (1 - seg(t, P_FLIP - 0.1, P_FLIP))} rot={-3} />
        <Card text="BLURRY" top={1040} left={300} size={50} color="#fff" s={popIn(t, T.fast2, 0.3) * (1 - seg(t, STOP1 - 0.06, STOP1))} rot={-8} />
        <Card text="STOP" top={1060} left={800} size={56} color={RED} fg="#fff" s={popIn(t, STOP1, 0.25) * (1 - seg(t, P_FLIP - 0.1, P_FLIP))} rot={6} />
        <Card text="LOOK" top={1040} left={290} size={56} color={GOLD} s={popIn(t, LOOK, 0.25) * (1 - seg(t, P_FLIP - 0.1, P_FLIP))} rot={-5} />
        <Card text="FEELS ITS WAY" top={462} left={540} size={46} s={popIn(t, T.feels, 0.3) * (1 - seg(t, P_OUT - 0.14, P_OUT))} rot={2} />
        <Card text="TAP" top={1000} left={830} size={50} color={GOLD} s={pulse(t, TAP, 0.35)} rot={8} />
        <Card text="ANTENNAE" top={1140} left={540} size={54} color={BUG} fg="#fff" s={popIn(t, T.antennae, 0.3) * (1 - seg(t, P_OUT - 0.14, P_OUT))} rot={-3} />
        <CommentBubble t={t} text="what if you could run like a cheetah??" handle="@zoomy_doodle" likes="2.7K" y={272} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so2 - 0.02} until={PUSH - 0.4} text="What would you race first?" />
      </>}
    </AbsoluteFill>
  );
};

export const speedCues = (): Cue[] => {
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -21 : db}));
  const steps: Cue[] = [...footfalls(0.12, WHEEL_ON), ...footfalls(UP + 0.2, DURATION - 0.2)].map((f, i) => ({f: 'step.wav', at: f, db: (i % 2 ? -35 : -33) + (f > 3 && f < 8.6 ? -1 : 0)}));
  const cues: Cue[] = [
    // frame 0: a hard footfall + the tail of a whoosh, both mostly gone before the first word (0.12 s)
    {f: 'step.wav', at: 0, db: -12}, {f: 'whoosh.wav', at: 0, db: -22, from: 0.25, to: 0.6},
    ...steps,
    {f: 'whisper_whoosh.wav', at: 1.45, db: -31}, {f: 'pop.wav', at: T.fastest, db: -28}, {f: 'ding.mp3', at: 2.93, db: -24},
    // cheetah legs: POOF, the cheetah slides in, the car, HONK
    {f: 'pop.wav', at: POOF1, db: -16}, {f: 'pfft.wav', at: POOF1 + 0.02, db: -22},
    {f: 'meow.wav', at: 3.88, db: -31}, ...ticks(3.32, T.cars - 0.04, 8, -32).map((c, i) => (i === 7 ? {...c, db: -27} : c)),
    {f: 'whoosh.wav', at: 3.75, db: -31}, {f: 'honk.wav', at: 5.22, db: -17},
    // FOR ITS SIZE: the magnifier, the bars, x6
    {f: 'zip.wav', at: MAG_IN - 0.12, db: -30}, {f: 'pop.wav', at: MAG_IN + 0.02, db: -29}, {f: 'pop.wav', at: T.size, db: -29}, {f: 'pop.wav', at: T.tiger, db: -31},
    {f: 'whir.mp3', at: T.beetle, db: -32, to: 0.55}, {f: 'correct.wav', at: T.faster + 0.02, db: -29}, {f: 'slide_down.wav', at: T.faster + 0.1, db: -34},
    // beetle legs: POOF, launch (the whoosh peaks in the gap after "On you,"), the blur wheel, the jet
    {f: 'pop.wav', at: POOF2, db: -16}, {f: 'pfft.wav', at: POOF2 + 0.02, db: -22},
    {f: 'twang.mp3', at: LAUNCH - 0.02, db: -22, to: 0.5}, {f: 'whoosh.wav', at: LAUNCH, db: -19}, {f: 'slide_up.wav', at: LAUNCH + 0.05, db: -29, to: 0.5},
    {f: 'whisper_whoosh.wav', at: WHEEL_ON - 0.1, db: -30}, {f: 'wind.wav', at: 9.0, db: -30, keys: [[9.0, -36], [10.0, -30], [CRASH, -30], [CRASH + 0.05, -60]], to: CRASH - 9.0},
    ...ticks(LAUNCH + 0.12, T.jet - 0.04, 16, -32), {f: 'ding.mp3', at: T.jet, db: -28},
    {f: 'jet.wav', at: JET_IN + 0.3, db: -29},
    // WHAM - in the pause after "jet."
    {f: 'whoosh_slow.wav', at: BLUR - 0.05, db: -33, from: 0.42},
    {f: 'thud.wav', at: CRASH, db: -4}, {f: 'crack.wav', at: CRASH - 0.3, db: -11}, {f: 'bonk.wav', at: CRASH, db: -10}, {f: 'slap.wav', at: CRASH + 0.01, db: -14},
    {f: 'rustle.wav', at: CRASH + 0.04, db: -18}, {f: 'crowd_laugh.wav', at: CRASH + 0.2, db: -25, to: 0.5},
    {f: 'slide_down.wav', at: CRASH + 0.3, db: -33}, {f: 'thud.wav', at: PEEL + 0.18, db: -30}, {f: 'dizzy_birds.wav', at: PEEL + 0.25, db: -39, to: 1.2},
    // ITS VIEW: blurry, STOP, LOOK; then the antennae: TAP, hop
    {f: 'zap.wav', at: P_IN, db: -28}, {f: 'pop.wav', at: P_IN + 0.06, db: -29}, {f: 'whoosh_slow.wav', at: P_IN + 0.1, db: -34},
    {f: 'pop.wav', at: T.fast2, db: -30}, {f: 'record_scratch.wav', at: STOP1 - 0.03, db: -32, from: 1.9, to: 2.25}, {f: 'click.wav', at: STOP1, db: -27},
    {f: 'pop.wav', at: LOOK, db: -30},
    ...ctaCues(T.cta),
    {f: 'page_flip.wav', at: P_FLIP - 0.45, db: -30}, {f: 'pop.wav', at: T.feels, db: -30},
    {f: 'click.wav', at: TAP, db: -23}, {f: 'click.wav', at: TAP + 0.07, db: -26}, {f: 'boing.wav', at: TAP + 0.05, db: -28}, {f: 'pop.wav', at: T.antennae, db: -30},
    // close-up: no antennae - BOOP BOOP
    {f: 'whoosh.wav', at: SG - 0.02, db: -30}, {f: 'squeak.wav', at: PAT + 0.05, db: -34}, {f: 'squeak.wav', at: PAT + 0.22, db: -35}, {f: 'boing.wav', at: HOP, db: -31},
    {f: 'pop.wav', at: BOOP1, db: -25}, {f: 'pop.wav', at: BOOP2, db: -21}, {f: 'giggle.mp3', at: BOOP2 + 0.08, db: -31, to: 0.3},
    // ostrich legs, up and running = frame 0
    {f: 'whoosh.wav', at: POOF3 - 0.04, db: -30}, {f: 'pop.wav', at: POOF3, db: -26}, {f: 'pfft.wav', at: POOF3 + 0.02, db: -25}, {f: 'zip.wav', at: POOF3 + 0.04, db: -29},
    {f: 'boing.wav', at: UP, db: -20}, {f: 'whoosh.wav', at: UP - 0.2, db: -31},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  // every effect after frame 0 sits 3 dB lower than written above, so the voice stays clear
  return cues.map((c) => (c.at > 0.05 ? {...c, db: c.db - 3} : c));
};
/** the sound effects alone (no voice) - for checking the mix: render.mjs SpeedFx work/fx.wav */
export const SpeedFx: React.FC = () => <SoundLayer cues={speedCues()} />;

export const SpeedVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<SpeedScene t={0} />}>
        <SpeedScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="speed/vo/tight.mp3" voiceAt={0.1} cues={speedCues()} />
    </AbsoluteFill>
  );
};
export const SpeedWide: React.FC = () => <WideFit.Provider value={0.72}><SpeedVideo /></WideFit.Provider>;
