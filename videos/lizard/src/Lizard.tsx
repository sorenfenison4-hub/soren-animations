// "What if you could regrow your arm like a lizard?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// (1) frame 0: POP - he pulls his own (regrown) arm off at a dotted line like a lizard drops its tail, flings it, it
//     flip-flops on the sand; a new one shoots out of his shoulder (GROWS BACK) beside the smug lizard on its rock;
// (2) he waves with it: it can't bend, the whole arm swings like a plank and WHACKs his face in close-up (2.45 s), NO BONES;
// (3) X-RAY: LIZARD TAIL - the tail snaps at a break line and grows back as ONE LONG TUBE of CARTILAGE = the TIP OF YOUR
//     NOSE (BOOP); (4) the lizard wags its stiff new tail: FINE; (5) X-RAY: YOUR ARM - 30 bones counted, then a scan turns
//     the new arm into one tube: 0; (6) ice cream: the stiff arm swings the cone over his head, PLOP on his head, NO ELBOW /
//     NO WRIST / NO KNUCKLES; (7) he pops it off again, a new one grows, he grabs it = frame 0.
// All drawn in code; the guy is the code-drawn front view (beetle / fly) on a small IK rig, his right arm (screen left) is
// the lizard arm: one straight tube that only turns at the shoulder.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, spring,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Puffs} from './lib/kit';

// voice: tight.mp3 at 0.1 s (line 1 tightened at 1.18, the rest at 1.12; times are video time). Last word ends 18.06 s.
export const DURATION = 18.9;
export const T = {
  regrow: 0.10, arm: 0.78, lizards: 1.32, tail: 1.73, comes: 2.44, no: 3.08, bones: 3.29,     // "Regrow your arm like a lizard's tail, and it comes back with no bones."
  a: 4.00, newt: 4.50, tail2: 4.72, one: 5.36, long: 5.72, tube: 6.07, cartilage: 6.50,      // "A lizard's new tail is one long tube of cartilage,"
  like: 7.29, tip: 7.50, nose: 7.89,                                                          // "like the tip of your nose."
  fine: 8.47, tail3: 8.97,                                                                    // "Fine for a tail."
  but: 9.50, arm2: 9.86, thirty: 10.57, bones2: 10.93,                                        // "But your arm has thirty bones."
  the: 11.57, new2: 11.75, zero: 12.54,                                                       // "The new one has zero."
  no1: 13.20, elbow: 13.41, no2: 14.05, wrist: 14.27, no3: 14.91, knuckles: 15.05,            // "No elbow, no wrist, no knuckles."
  so: 15.77, pops: 16.41, off: 16.77, tries: 17.30, again: 17.48,                             // "So he pops it off and tries again."
  cta: 12.98,
};
// beats (shot changes are hard cuts)
const REL = 0.12, FLY = 0.4;                                    // after a pop: he lets go / the arm tips over onto the sand (flip-flops after)
const GROW0 = 0.66, GROW1 = 1.04;                               // after a pop: the new arm shoots out of his shoulder
const RAISE0 = 1.1, RAISE1 = 1.36, WAVE0 = 1.5;                 // he lifts it, proud, and waves (stiff, from the shoulder)
const S2 = 2.2, WHACK = 2.45;                                   // close-up: the last swing whacks his face
const S3 = 3.95, SNAP = 4.2, REG0 = 4.42, REG1 = 5.62;          // X-RAY: LIZARD TAIL
const NOSE0 = 7.2, BOOP = 7.92;
const S4 = 8.36;                                                // the lizard wags its stiff new tail
const S5 = 9.42, CNT0 = 9.8, CNT1 = 10.95, SCAN0 = 11.62, SCAN1 = 12.5;   // X-RAY: YOUR ARM
const S6 = 13.06, LIFT0 = 13.14, PLOP = 13.38;                  // ice cream
const S7 = 15.66, GRAB = 15.92, POP2 = 16.41, GRAB2 = 17.86;    // he pops it off again; a new one grows; he grabs it
const PUSH = DURATION - LOOP_DUR;

const GOLD = '#FFD43B', RED = '#E2453C', FACE_C = '#F1EFEA';
const NEW = '#DCE7F3', NEW_HI = '#FFFFFF', CART = '#8CC2EE', CART_DK = '#3F78B5', CART_CORE = '#D8ECFB';
const LZ = '#8FCB5C', LZ_DK = '#5F9C3B', LZ_BELLY = '#D6EDB2', LZ_REG = '#BCAE86', LZ_REG_DK = '#958760', DEW = '#F58FAE';
const SAND = '#F4E2BA', SAND2 = '#E6CD98', MESA = '#F4D3A4', MESA_DK = '#E6B784', ROCK = '#D2C2A6', ROCK_DK = '#B19F80';
const CACTUS = '#A3CF7E', CACTUS_DK = '#7AAA5C';
const CONE = '#E8B66A', CONE_DK = '#C38D45', SCOOP = '#F7A9C6', SCOOP_DK = '#E37FA7';
const XBODY = '#7193C6', BONE = '#F4F2EA';
const GX = -55;                       // his feet
const ROCK_X = 140, ROCK_TOP = -104;  // the lizard's rock
const NA_L = 150;                     // the stiff arm: shoulder -> hand centre
const FONT_W = 900;

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const mul = (a: P2, k: number): P2 => [a[0] * k, a[1] * k];
const rad = (d: number) => (d * Math.PI) / 180;
/** arm direction: 0 = straight down, 90 = out to screen left, 180 = straight up, -90 = across to screen right */
const dirA = (a: number): P2 => [-Math.sin(rad(a)), Math.cos(rad(a))];
const rot2 = (p: P2, a: number): P2 => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={FONT_W} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${(ex - w).toFixed(1)} ${y.toFixed(1)} A ${rx} ${ry} 0 ${h > 0.5 ? 1 : 0} 1 ${(ex + w).toFixed(1)} ${y.toFixed(1)} Z`;
};
/** two-segment IK: the joint between A and F; bend = +1 / -1 picks the side */
const ik = (A: P2, F: P2, L1: number, L2: number, bend: number): P2 => {
  const dx = F[0] - A[0], dy = F[1] - A[1], D = Math.hypot(dx, dy) || 1;
  const d = Math.min(D, L1 + L2 - 0.01);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / D, uy = dy / D;
  return [A[0] + ux * a - uy * h * bend, A[1] + uy * a + ux * h * bend];
};
const quad = (a: P2, c: P2, b: P2, u: number): P2 => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
const quadT = (a: P2, c: P2, b: P2, u: number): P2 => { const x = 2 * (1 - u) * (c[0] - a[0]) + 2 * u * (b[0] - c[0]), y = 2 * (1 - u) * (c[1] - a[1]) + 2 * u * (b[1] - c[1]); const l = Math.hypot(x, y) || 1; return [x / l, y / l]; };
/** a tapered tube along a quadratic curve from u0 to u1 (widths w0 -> w1 at u = 0 -> 1): closed outline path */
const taper = (a: P2, c: P2, b: P2, u0: number, u1: number, w0: number, w1: number, n = 18, capEnd = true) => {
  const L: P2[] = [], R: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const u = lerp(u0, u1, i / n), p = quad(a, c, b, u), tg = quadT(a, c, b, u), w = lerp(w0, w1, u) / 2;
    L.push([p[0] - tg[1] * w, p[1] + tg[0] * w]); R.push([p[0] + tg[1] * w, p[1] - tg[0] * w]);
  }
  const pe = quad(a, c, b, u1), te = quadT(a, c, b, u1), we = lerp(w0, w1, u1) / 2;
  const tip: P2 = [pe[0] + te[0] * we * 0.9, pe[1] + te[1] * we * 0.9];
  return `M ${P(L[0])} ` + L.slice(1).map((p) => `L ${P(p)}`).join(' ') + (capEnd ? ` Q ${P(tip)} ${P(R[n])} ` : ` L ${P(R[n])} `) +
    R.slice(0, n).reverse().map((p) => `L ${P(p)}`).join(' ') + ' Z';
};

// ---------- the guy's face ----------
type Mood = 'joy' | 'happy' | 'smug' | 'focus' | 'oof' | 'dizzy' | 'pop' | 'worry' | 'strain' | 'deadpan' | 'hope';
const SPIRAL = 'M 0 0 m -2 0 a 3 3 0 1 1 4 2 a 7 7 0 1 1 -9 -6 a 11 11 0 1 1 15 10 a 15 15 0 1 1 -21 -14';
const Mouth: React.FC<{mood: Mood; t: number}> = ({mood, t}) => {
  if (mood === 'joy') return <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  if (mood === 'happy' || mood === 'hope') return <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  if (mood === 'smug') return <path d="M -20 6 Q 0 16 22 -3" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'focus') return <path d="M -15 9 Q 0 5 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'deadpan') return <path d="M -16 8 L 16 8" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'oof' || mood === 'strain') return <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  if (mood === 'worry' || mood === 'dizzy') return <path d={`M -18 10 q 6 ${mood === 'dizzy' ? -6 + 3 * Math.sin(t * 14) : -6} 12 0 t 12 0 t 12 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  return <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;   // pop
};
const Face: React.FC<{t: number; mood: Mood; uid: string; look?: number}> = ({t, mood, uid, look = 0}) => {
  const eye = (sd: number) => {
    const ex = sd * 25, ey = -14;
    if (mood === 'joy' || mood === 'happy') return <path key={sd} d={`M ${ex - 13} ${ey + 4} Q ${ex} ${ey - 12} ${ex + 13} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'oof' || mood === 'strain') return <path key={sd} d={`M ${ex - sd * 12} ${ey - 10} L ${ex + sd * 10} ${ey} L ${ex - sd * 12} ${ey + 10}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === 'dizzy') return <g key={sd}><circle cx={ex} cy={ey} r={14} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <path d={SPIRAL} transform={`translate(${ex} ${ey}) rotate(${(t * 520 * sd).toFixed(1)}) scale(0.62)`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></g>;
    const big = mood === 'pop' ? 1.25 : 1;
    const lid = mood === 'smug' ? 0.45 : mood === 'focus' ? 0.38 : mood === 'deadpan' ? 0.52 : 0;
    const rx = 12 * big, ry = 15 * big;
    return <g key={sd}>
      <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + look * 4} cy={ey + 1 + lid * 6 + (mood === 'hope' ? -3 : 0)} r={6.3 * (mood === 'pop' ? 0.85 : 1)} fill={INK} />
      <circle cx={ex + look * 4 - 1.5} cy={ey - 1 + lid * 6 + (mood === 'hope' ? -3 : 0)} r={2} fill="#fff" />
      {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
    </g>;
  };
  const brow = (sd: number) => {
    let d = `M ${sd * 12} -45 Q ${sd * 25} -53 ${sd * 38} -47`;
    if (mood === 'focus' || mood === 'strain' || mood === 'oof') d = `M ${sd * 10} -34 L ${sd * 37} -44`;
    else if (mood === 'worry' || mood === 'dizzy' || mood === 'hope') d = `M ${sd * 10} -46 L ${sd * 36} -38`;
    else if (mood === 'smug') d = `M ${sd * 12} ${sd < 0 ? -40 : -46} L ${sd * 38} ${sd < 0 ? -44 : -50}`;
    else if (mood === 'pop') d = `M ${sd * 12} -52 Q ${sd * 25} -62 ${sd * 38} -54`;
    else if (mood === 'deadpan') d = `M ${sd * 12} -38 L ${sd * 38} -38`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  return (
    <g>
      <circle r={HEAD_R + 1} fill={`url(#lFace${uid})`} stroke={INK} strokeWidth={6.5} />
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)"><Mouth mood={mood} t={t} /></g>
    </g>
  );
};

// ---------- the lizard arm: one straight tube that only turns at the shoulder (a twang = a small springy bend) ----------
const StiffArm: React.FC<{S: P2; a: number; len?: number; wob?: number; w?: number}> = ({S, a, len = 1, wob = 0, w = 30}) => {
  const L = NA_L * len;
  if (L < 1.5) return null;
  const d = dirA(a), pp: P2 = [-d[1], d[0]];
  const E = add(S, mul(d, L)), C = add(lp2(S, E, 0.5), mul(pp, wob * L * 0.22));
  const path = `M ${P(S)} Q ${P(C)} ${P(E)}`;
  const hr = 14 * Math.min(1, len * 2.2);
  const h0 = add(add(S, mul(d, 12)), mul(pp, 4.5)), h1 = add(add(E, mul(d, -18)), mul(pp, 4.5)), hc = add(C, mul(pp, 4.5));
  return (
    <g>
      <path d={path} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={path} stroke={NEW} strokeWidth={w - 11} fill="none" strokeLinecap="round" />
      {L > 40 ? <path d={`M ${P(h0)} Q ${P(hc)} ${P(h1)}`} stroke={NEW_HI} strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
      <circle cx={E[0]} cy={E[1]} r={hr} fill={NEW} stroke={INK} strokeWidth={5.5} />
    </g>
  );
};
const armEnd = (S: P2, a: number, len = 1): P2 => add(S, mul(dirA(a), NA_L * len));

// ---------- the guy: front view on a small IK rig (feet at 0) ----------
type GS = {x: number; y: number; rot: number; lean: number; hip: number; knee: number; armR: P2;
  na: number; nlen: number; nwob: number; seam: number; mood: Mood; look: number; sq: number; tilt: number; squish: number; trem: number;
  scoop: number; cone: number};
const torsoD = (tw: number, top: number, bot: number) => {
  const h = bot - top, r1 = Math.min(34, h * 0.3), r2 = Math.min(29, h * 0.26), sw = tw * 0.6;
  return `M ${-sw} ${top} C ${-tw + 5} ${top + r1 * 0.18} ${-tw} ${top + r1 * 0.5} ${-tw} ${top + r1} L ${-tw + 1} ${bot - r2} Q ${-tw + 1} ${bot} ${-tw + r2} ${bot} ` +
    `L ${tw - r2} ${bot} Q ${tw - 1} ${bot} ${tw - 1} ${bot - r2} L ${tw} ${top + r1} C ${tw} ${top + r1 * 0.5} ${tw - 5} ${top + r1 * 0.18} ${sw} ${top} Z`;
};
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; hand?: boolean}> = ({S, H, L, sd, w = 29, hand = true}) => {
  const E = ik(S, H, L, L, -sd * (H[1] < S[1] ? 1 : -1));
  const C: P2 = [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2];
  const d = `M ${P(S)} Q ${P(C)} ${P(H)}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#FFFFFF" strokeWidth={w - 11} fill="none" strokeLinecap="round" />
      {hand ? <circle cx={H[0]} cy={H[1]} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} /> : null}
    </g>
  );
};
const SHX = 38;
const shoulderL = (g: GS): P2 => [-SHX, -g.hip - 90];     // in the torso frame (before the lean)
const shoulderR = (g: GS): P2 => [SHX, -g.hip - 90];
/** a point in the torso frame -> world */
const toWorld = (g: GS, p: P2): P2 => {
  const hipY = -g.hip, q = rot2([p[0], p[1] - hipY], g.lean), r: P2 = [q[0], q[1] + hipY];
  const s = rot2(r, g.rot);
  return [g.x + s[0], g.y + s[1]];
};
const headLocal = (g: GS): P2 => [0, -g.hip - 165];
const headWorld = (g: GS): P2 => toWorld(g, headLocal(g));
/** the ice cream: cone tip at the hand, `a` = which way its top points (same convention as dirA, 180 = up) */
const IceCream: React.FC<{at: P2; a: number; scoop: boolean; s?: number}> = ({at, a, scoop, s = 1}) => (
  <g transform={`translate(${P(at)}) rotate(${(a - 180).toFixed(1)}) scale(${s})`}>
    {scoop ? <g>
      <path d="M -30 -50 Q -34 -84 0 -88 Q 34 -84 30 -50 Q 20 -44 12 -50 Q 4 -42 -4 -50 Q -14 -42 -22 -50 Z" fill={SCOOP} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -16 -76 Q -6 -82 6 -78" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} />
    </g> : null}
    <path d="M -27 -52 L 27 -52 L 0 18 Z" fill={CONE} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -18 -40 L 8 -14 M -6 -52 L 16 -30 M 8 -52 L 22 -40 M 18 -40 L -8 -14 M 6 -52 L -16 -30 M -8 -52 L -22 -40" stroke={CONE_DK} strokeWidth={3} />
  </g>
);
const GuyL: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  const hipY = -g.hip, shY = hipY - 112, tw = 47, headY = shY - 53;
  const footX = 27 + g.knee * 0.25;
  const jig = g.trem * 2.4 * Math.sin(t * 71);
  const SL = shoulderL(g), SR = shoulderR(g);
  const seamD = (() => { const d = dirA(g.na), pp: P2 = [-d[1], d[0]], c = add(SL, mul(d, 4)); return `M ${P(add(c, mul(pp, -22)))} L ${P(add(c, mul(pp, 22)))}`; })();
  const hand = armEnd(SL, g.na, g.nlen);
  return (
    <W><g transform={`translate(${(g.x + jig).toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)})`}>
      {[-1, 1].map((sd) => <Limb key={'l' + sd} S={[sd * 19, hipY + 4]} H={[sd * footX, -12]} L={37} sd={-sd} w={30} hand={false} />)}
      {[-1, 1].map((sd) => <ellipse key={'f' + sd} cx={sd * (footX + 2)} cy={-7} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />)}
      <g transform={`rotate(${g.lean.toFixed(2)} 0 ${hipY})`}>
        <path d={torsoD(tw, shY, hipY + 13)} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        {/* the socket where the lizard arm comes off: a round stump with a dotted break line */}
        {g.nlen < 0.2 ? <circle cx={SL[0] - 2} cy={SL[1]} r={15} fill={NEW} stroke={INK} strokeWidth={5} /> : null}
        <Limb S={SR} H={[SR[0] + g.armR[0], SR[1] + g.armR[1]]} L={77} sd={g.armR[1] > 0 ? -1 : 1} />
        <g transform={`translate(0 ${headY + HEAD_R}) rotate(${g.tilt.toFixed(2)} 0 0) scale(${(1 + 0.12 * g.sq + 0.1 * g.squish).toFixed(3)} ${(1 - 0.26 * g.sq).toFixed(3)}) translate(${(-12 * g.squish).toFixed(1)} ${-HEAD_R})`}>
          <Face t={t} mood={g.mood} uid={uid} look={g.look} />
          {g.scoop >= 0 ? <ScoopHat t={t} u={g.scoop} /> : null}
        </g>
        <StiffArm S={SL} a={g.na} len={g.nlen} wob={g.nwob} />
        {g.cone > 0 ? <IceCream at={hand} a={g.na + 155} scoop={g.cone > 1} /> : null}
        {g.seam > 0.01 ? <path d={seamD} stroke={INK} strokeWidth={5} strokeDasharray="7 7" strokeLinecap="round" opacity={g.seam} /> : null}
      </g>
    </g></W>
  );
};
/** the ice cream landed upside down on his head: the scoop squashed on top, the cone sticking up like a horn, drips (u: 0 -> 1) */
const ScoopHat: React.FC<{t: number; u: number}> = ({u}) => {
  const sq = 1 + 0.4 * Math.exp(-u * 12);
  const drips: [number, number, number][] = [[-42, 40, 0.0], [18, 58, 0.3], [44, 30, 0.55]];
  return <g transform={`translate(6 -4) scale(${sq.toFixed(3)} ${(1 / sq).toFixed(3)})`}>
    {drips.map(([x, len, d0], i) => { const l = len * clamp((u - d0) * 1.6);
      return l > 1 ? <path key={i} d={`M ${x} -40 L ${x} ${-40 + l}`} stroke={INK} strokeWidth={17} strokeLinecap="round" /> : null; })}
    {drips.map(([x, len, d0], i) => { const l = len * clamp((u - d0) * 1.6);
      return l > 1 ? <path key={'f' + i} d={`M ${x} -40 L ${x} ${-40 + l}`} stroke={SCOOP} strokeWidth={9} strokeLinecap="round" /> : null; })}
    <path d="M -58 -44 Q -60 -90 -6 -92 Q 52 -92 58 -46 Q 44 -34 30 -42 Q 16 -32 2 -42 Q -12 -32 -26 -42 Q -42 -32 -58 -44 Z" fill={SCOOP} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    <g transform="translate(2 -84) rotate(8)">
      <path d="M -27 0 L 27 0 L 0 -74 Z" fill={CONE} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -16 -14 L 6 -40 M -4 0 L 14 -22 M 10 0 L 20 -10 M 16 -14 L -6 -40 M 4 0 L -14 -22 M -10 0 L -20 -10" stroke={CONE_DK} strokeWidth={3} />
    </g>
  </g>;
};

// ---------- the lizard (side view, facing left), feet at 0 ----------
type LMood = 'smug' | 'laugh' | 'look' | 'proud' | 'down';
type LS = {x: number; y: number; s: number; mood: LMood; ta: number; bend: number; wob: number; dew: number; tilt: number; shake: number; reg: number; tlen: number; drop: number};
const LZ_TAIL = 150;
const Lizard: React.FC<{t: number; L: LS; uid: string}> = ({t, L, uid}) => {
  const jig = L.shake * 3 * Math.sin(t * 60);
  // tail spine (quadratic) from the hip; ta = direction (0 = right, 90 = down, -90 = up), bend curls it
  const B: P2 = [50, -27], len = LZ_TAIL * L.tlen;
  const dir: P2 = [Math.cos(rad(L.ta)), Math.sin(rad(L.ta))], pp: P2 = [-dir[1], dir[0]];
  const E = add(B, mul(dir, len));
  const C = add(add(lp2(B, E, 0.5), mul(pp, (L.bend + L.wob) * len * 0.5)), mul(dir, -len * 0.05));
  const reg = L.reg;
  const lid = L.mood === 'smug' ? 0.48 : L.mood === 'down' ? 0.3 : 0;
  const ex = -66, ey = -42;
  return (
    <W><g transform={`translate(${(L.x + jig).toFixed(1)} ${L.y.toFixed(1)}) scale(${L.s})`}>
      {/* far legs */}
      <path d="M -20 -16 L -26 -4 L -20 0 M 40 -18 L 54 -6 L 50 0" stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M -20 -16 L -26 -4 L -20 0 M 40 -18 L 54 -6 L 50 0" stroke={LZ_DK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* tail: original part green, the regrown part a duller tan, smooth */}
      {L.drop < 1 ? <g>
        <path d={taper(B, C, E, 0, reg, 26, 4, 14, false)} fill={LZ} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
        {reg < 0.999 ? <path d={taper(B, C, E, reg - 0.005, 1, 26, 6, 12)} fill={LZ_REG} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" /> : null}
        {[0.12, 0.26, 0.4].filter((u) => u < reg - 0.05).map((u) => { const p = quad(B, C, E, u), tg = quadT(B, C, E, u), w = lerp(26, 4, u) / 2 - 2;
          return <path key={u} d={`M ${P([p[0] - tg[1] * w, p[1] + tg[0] * w])} L ${P([p[0] + tg[1] * w, p[1] - tg[0] * w])}`} stroke={LZ_DK} strokeWidth={4} strokeLinecap="round" />; })}
      </g> : null}
      {/* body */}
      <path d="M -46 -38 C -30 -60 30 -58 54 -38 C 60 -30 58 -18 46 -14 C 20 -8 -20 -8 -42 -14 C -52 -18 -54 -30 -46 -38 Z" fill={LZ} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -40 -16 C -20 -10 20 -10 44 -16 C 30 -22 -20 -22 -40 -16 Z" fill={LZ_BELLY} />
      <path d="M -30 -48 C -10 -54 20 -53 40 -44" stroke={LZ_DK} strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray="2 12" />
      {/* near legs with toe pads */}
      {[[[-30, -20], [-44, -8], [-40, 0]], [[34, -20], [50, -10], [44, 0]]].map((lg, i) => {
        const [h, k, f] = lg as P2[];
        const d = `M ${P(h)} L ${P(k)} L ${P(f)}`;
        return <g key={i}>
          <path d={d} stroke={INK} strokeWidth={15} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d={d} stroke={LZ} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {[-14, -5, 4, 12].map((dx, j) => <g key={j}><path d={`M ${f[0]} ${f[1] - 2} L ${f[0] + dx} ${f[1] + 1}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
            <circle cx={f[0] + dx} cy={f[1] + 1} r={3.4} fill={LZ} stroke={INK} strokeWidth={2.5} /></g>)}
        </g>;
      })}
      {/* head */}
      <g transform={`rotate(${L.tilt.toFixed(1)} -40 -30)`}>
        {L.dew > 0.02 ? <path d={`M -80 -18 Q -66 ${(-18 + 40 * L.dew).toFixed(1)} -44 -16 Z`} fill={DEW} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}
        <path d="M -40 -44 C -56 -58 -92 -54 -108 -38 C -114 -32 -112 -22 -100 -19 C -84 -15 -60 -14 -40 -16 Z" fill={LZ} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={-100} cy={-34} r={2.6} fill={INK} />
        {L.mood === 'laugh'
          ? <path d="M -106 -26 Q -84 -20 -58 -24 Q -74 -6 -100 -16 Z" fill="#5A2328" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
          : <path d={L.mood === 'down' ? 'M -104 -24 Q -84 -21 -62 -26' : 'M -104 -25 Q -84 -21 -64 -24 Q -58 -26 -55 -31'} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />}
        {L.mood === 'laugh' || L.mood === 'proud'
          ? <path d={`M ${ex - 11} ${ey + 3} Q ${ex} ${ey - 9} ${ex + 11} ${ey + 3}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          : <g>
            <circle cx={ex} cy={ey} r={12} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
            <circle cx={ex - (L.mood === 'look' ? 4 : 2)} cy={ey + 1 + (L.mood === 'down' ? 4 : 0)} r={5.8} fill={INK} />
            <circle cx={ex - 3.5} cy={ey - 1} r={1.8} fill="#fff" />
            {lid ? <path d={lidPath(ex, ey, 12.5, 12.5, lid)} fill={LZ} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
          </g>}
        <path d={L.mood === 'smug' ? `M ${ex - 13} ${ey - 15} L ${ex + 12} ${ey - 19}` : L.mood === 'down' ? `M ${ex - 13} ${ey - 19} L ${ex + 12} ${ey - 14}` : `M ${ex - 13} ${ey - 16} Q ${ex} ${ey - 24} ${ex + 12} ${ey - 17}`}
          stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </g></W>
  );
};
/** world position of a point on the lizard's tail (u along it) */
const tailPoint = (L: LS, u: number): P2 => {
  const B: P2 = [50, -27], len = LZ_TAIL * L.tlen;
  const dir: P2 = [Math.cos(rad(L.ta)), Math.sin(rad(L.ta))], pp: P2 = [-dir[1], dir[0]];
  const E = add(B, mul(dir, len)), C = add(add(lp2(B, E, 0.5), mul(pp, (L.bend + L.wob) * len * 0.5)), mul(dir, -len * 0.05));
  const p = quad(B, C, E, u);
  return [L.x + p[0] * L.s, L.y + p[1] * L.s];
};

// ---------- the desert ----------
const Cactus: React.FC<{x: number; s: number}> = ({x, s}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -16 0 L -16 -150 Q -16 -170 0 -170 Q 16 -170 16 -150 L 16 0 Z M -16 -80 L -38 -80 Q -50 -80 -50 -92 L -50 -120 Q -50 -132 -40 -132 Q -30 -132 -30 -120 L -30 -98 L -16 -98 Z M 16 -60 L 36 -60 Q 48 -60 48 -72 L 48 -110 Q 48 -122 38 -122 Q 28 -122 28 -110 L 28 -78 L 16 -78 Z"
      fill={CACTUS} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -4 -150 L -4 -10 M 6 -140 L 6 -20" stroke={CACTUS_DK} strokeWidth={4} strokeLinecap="round" />
  </g>
);
const Rock: React.FC<{x: number}> = ({x}) => (
  <g>
    <path d={`M ${x - 100} 2 C ${x - 104} -50 ${x - 84} -98 ${x - 40} -106 C ${x - 10} -111 ${x + 30} -111 ${x + 60} -104 C ${x + 96} -94 ${x + 106} -44 ${x + 102} 2 Z`} fill={ROCK} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
    <path d={`M ${x + 70} -90 C ${x + 92} -64 ${x + 96} -30 ${x + 90} 0 L ${x + 60} 0 C ${x + 70} -30 ${x + 70} -60 ${x + 54} -86 Z`} fill={ROCK_DK} />
    <path d={`M ${x - 70} -60 Q ${x - 50} -76 ${x - 26} -72 M ${x - 20} -40 Q ${x} -50 ${x + 24} -44`} stroke={ROCK_DK} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// ---------- screen-space panels ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 450}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: FONT_W, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
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
const Bone: React.FC<{a: P2; b: P2; w: number; glow?: number; op?: number; knob?: boolean}> = ({a, b, w, glow = 0, op = 1, knob = false}) => op > 0.01 ? (
  <g opacity={op}>
    {glow > 0.01 ? <path d={`M ${P(a)} L ${P(b)}`} stroke={GOLD} strokeWidth={w + 22} strokeLinecap="round" opacity={glow} /> : null}
    <path d={`M ${P(a)} L ${P(b)}`} stroke={INK} strokeWidth={w + 8} strokeLinecap="round" />
    {knob ? [a, b].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={w * 0.72 + 4} fill={INK} />) : null}
    <path d={`M ${P(a)} L ${P(b)}`} stroke={BONE} strokeWidth={w} strokeLinecap="round" />
    {knob ? [a, b].map((p, i) => <circle key={'k' + i} cx={p[0]} cy={p[1]} r={w * 0.72} fill={BONE} />) : null}
  </g>
) : null;

// ---------- X-RAY: LIZARD TAIL - the tail snaps at a break line and grows back as one smooth tube of cartilage ----------
const XT_B: P2 = [-250, -150], XT_C: P2 = [70, -150], XT_E: P2 = [250, 250];   // tail spine in the panel
const XT_N = 14, XT_BREAK = 0.47;
const TailXRay: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const fall = t > SNAP ? Math.pow(t - SNAP, 2) * 1300 + (t - SNAP) * 120 : 0, spin = t > SNAP ? (t - SNAP) * 70 : 0;
  const grow = eio(seg(t, REG0, REG1));
  const pb = quad(XT_B, XT_C, XT_E, XT_BREAK);
  const verts = Array.from({length: XT_N}, (_, i) => (i + 0.5) / XT_N);
  const vert = (u: number, k: number) => {
    const p = quad(XT_B, XT_C, XT_E, u), tg = quadT(XT_B, XT_C, XT_E, u), w = lerp(50, 18, u), l = (lerp(52, 30, u)) * 0.8;
    const ang = (Math.atan2(tg[1], tg[0]) * 180) / Math.PI;
    return <g key={k} transform={`translate(${P(p)}) rotate(${ang.toFixed(1)})`}>
      <rect x={-l / 2} y={-w / 2} width={l} height={w} rx={w * 0.35} fill={BONE} stroke={INK} strokeWidth={4} />
      <path d={`M 0 ${-w / 2 - 6} L 0 ${w / 2 + 6}`} stroke={RED} strokeWidth={3.5} strokeDasharray="4 4" />
    </g>;
  };
  const glowTube = t > T.tube - 0.05 && t < T.tube + 0.6 ? Math.max(0, 1 - (t - T.tube) * 1.8) : 0;
  return (
    <div style={{position: 'absolute', left: 540, top: 1150, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s.toFixed(3)})`}}>
      <XFrame id={`xt${uid}`} R={330}>
        {/* the lizard's body (soft) at the top left, then the tail */}
        <path d="M -520 -230 C -440 -270 -300 -250 -240 -190 C -220 -160 -230 -120 -260 -110 C -340 -90 -460 -110 -520 -120 Z" fill={XBODY} opacity={0.55} />
        <path d={taper(XT_B, XT_C, XT_E, 0.02, XT_BREAK, 92, 30, 12, false)} fill={XBODY} opacity={0.55} />
        {/* spine in the body */}
        {Array.from({length: 5}, (_, i) => <rect key={'s' + i} x={-470 + i * 46} y={-200 + i * 9} width={34} height={36} rx={11} fill={BONE} stroke={INK} strokeWidth={4} />)}
        {/* original vertebrae up to the break */}
        {verts.filter((u) => u < XT_BREAK).map((u, i) => vert(u, i))}
        {/* the dropped end falls away */}
        {t < SNAP + 0.9 ? <g transform={`translate(${(fall * 0.15).toFixed(1)} ${fall.toFixed(1)}) rotate(${spin.toFixed(1)} ${P(pb)})`}>
          <path d={taper(XT_B, XT_C, XT_E, XT_BREAK, 1, 92, 30, 12)} fill={XBODY} opacity={0.55} />
          {verts.filter((u) => u >= XT_BREAK).map((u, i) => vert(u, 100 + i))}
        </g> : null}
        {/* the new tail: one smooth tube of cartilage (hollow: a light core) */}
        {grow > 0.005 ? <g>
          <path d={taper(XT_B, XT_C, XT_E, XT_BREAK - 0.01, lerp(XT_BREAK, 1, grow), 96, 40, 12)} fill={XBODY} opacity={0.4} />
          {glowTube > 0.01 ? <path d={taper(XT_B, XT_C, XT_E, XT_BREAK, lerp(XT_BREAK, 1, grow), 74, 44, 12)} fill={GOLD} opacity={glowTube} /> : null}
          <path d={taper(XT_B, XT_C, XT_E, XT_BREAK, lerp(XT_BREAK, 1, grow), 46, 22, 14)} fill={CART} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          <path d={taper(XT_B, XT_C, XT_E, XT_BREAK + 0.01, lerp(XT_BREAK, 1, grow) - 0.01, 12, 6, 12)} fill={CART_CORE} />
        </g> : null}
        {t > SNAP - 0.02 && t < SNAP + 0.35 ? <g transform={`translate(${P(pb)})`}>{[0, 60, 120, 180, 240, 300].map((a) => <path key={a} d="M 0 -30 L 0 -56" transform={`rotate(${a})`} stroke={GOLD} strokeWidth={8} strokeLinecap="round" opacity={1 - (t - SNAP) * 2.8} />)}</g> : null}
      </XFrame>
      <Card text="X-RAY: LIZARD TAIL" top={86} size={48} rot={-2} s={1 - seg(t, NOSE0 - 0.12, NOSE0)} />
      <Card text="SNAP" top={330} left={600} color={GOLD} rot={6} s={popIn(t, SNAP, 0.22) * (1 - seg(t, 4.75, 4.9))} size={56} />
      <Card text="BONES" top={300} left={250} rot={-5} s={popIn(t, 4.62, 0.25) * (1 - seg(t, NOSE0 - 0.15, NOSE0))} size={40} />
      <Card text="NEW TAIL" top={520} left={700} color="#fff" rot={4} s={popIn(t, T.newt, 0.28) * (1 - seg(t, T.tube - 0.12, T.tube))} size={44} />
      <Card text="1 LONG TUBE" top={560} left={650} color={GOLD} rot={4} s={popIn(t, T.tube - 0.02, 0.28) * (1 - seg(t, NOSE0 - 0.15, NOSE0))} size={50} />
      <Card text="CARTILAGE" top={690} left={290} color={CART} rot={-3} s={popIn(t, T.cartilage, 0.3)} size={56} />
    </div>
  );
};
/** the tip of your nose: X-ray profile, the tip is the same cartilage; a finger boops it */
const NoseXRay: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const push = t > BOOP - 0.16 ? Math.sin(Math.PI * seg(t, BOOP - 0.16, BOOP + 0.34)) : 0;
  const tx = -118 + 26 * push, ty = 62 - 12 * push;               // the tip of the nose (it squishes back when booped)
  const fx = tx - 8 - 120 * (1 - eout(seg(t, NOSE0 + 0.12, BOOP - 0.16)));
  // a big nose in profile, looking left: bridge down to the tip, under the tip back to the lip
  const skin = `M 260 -260 L 30 -260 Q 22 -170 6 -120 L ${(tx + 30).toFixed(1)} ${(ty - 52).toFixed(1)} Q ${(tx - 6).toFixed(1)} ${(ty - 30).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} ` +
    `Q ${(tx + 6).toFixed(1)} ${(ty + 40).toFixed(1)} ${(tx + 56).toFixed(1)} ${(ty + 36).toFixed(1)} Q -30 104 -10 98 Q 8 120 4 150 Q -16 178 0 210 L 0 260 L 260 260 Z`;
  const cart = `M -10 -60 L ${(tx + 30).toFixed(1)} ${(ty - 52).toFixed(1)} Q ${(tx - 6).toFixed(1)} ${(ty - 30).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)} ` +
    `Q ${(tx + 6).toFixed(1)} ${(ty + 40).toFixed(1)} ${(tx + 56).toFixed(1)} ${(ty + 36).toFixed(1)} Q -40 96 -26 70 Q -6 20 -10 -60 Z`;
  return (
    <div style={{position: 'absolute', left: 780, top: 360, transform: `translate(-50%,-50%) rotate(3deg) scale(${s.toFixed(3)})`}}>
      <svg width={420} height={420} viewBox="-210 -210 420 420" style={{overflow: 'visible'}}>
        <clipPath id={`nx${uid}`}><circle r={190} /></clipPath>
        <circle r={206} fill={INK} />
        <g clipPath={`url(#nx${uid})`}>
          <rect x={-210} y={-210} width={420} height={420} fill="#16223A" />
          {Array.from({length: 7}, (_, i) => <path key={i} d={`M ${-210 + i * 70} -210 V 210 M -210 ${-210 + i * 70} H 210`} stroke="#2A3A5C" strokeWidth={3} />)}
          <path d={skin} fill="#88A8D8" opacity={0.72} />
          <path d={skin} fill="none" stroke="#DCE9FA" strokeWidth={5} />
          {/* nasal bone: the top of the bridge */}
          <path d="M 34 -230 Q 20 -150 -12 -62" stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
          <path d="M 34 -230 Q 20 -150 -12 -62" stroke={BONE} strokeWidth={24} fill="none" strokeLinecap="round" />
          {/* the tip: cartilage */}
          <path d={cart} fill={CART} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={`M ${(tx + 40).toFixed(1)} ${(ty + 6).toFixed(1)} Q ${(tx + 70).toFixed(1)} ${(ty - 20).toFixed(1)} -40 50`} stroke={CART_DK} strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* the finger */}
          <g transform={`translate(${fx.toFixed(1)} ${(ty + 4).toFixed(1)}) rotate(-4)`}>
            <rect x={-260} y={-28} width={260} height={56} rx={28} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
            <path d="M -44 -18 Q -16 -18 -12 0 Q -16 18 -44 18" fill="#F6E3E3" stroke={INK} strokeWidth={4} />
          </g>
        </g>
        <circle r={190} fill="none" stroke="#3E6FB0" strokeWidth={12} />
      </svg>
      <div style={{position: 'absolute', left: 210, top: 2, transform: 'translate(-50%,-50%) rotate(-3deg)', background: CART, border: `7px solid ${INK}`, borderRadius: 20,
        padding: '2px 18px', fontFamily: FONT, fontWeight: FONT_W, fontSize: 40, whiteSpace: 'nowrap', boxShadow: `0 6px 0 ${INK}`}}>TIP OF YOUR NOSE</div>
      <Card text="BOOP" top={330} left={50} color={GOLD} rot={-8} s={popIn(t, BOOP, 0.22) * (1 - seg(t, S4 - 0.2, S4 - 0.06))} size={60} />
    </div>
  );
};

// ---------- X-RAY: YOUR ARM - 30 bones counted, then a scan turns the new arm into one tube ----------
type XB = {a: P2; b: P2; w: number; knob?: boolean};
const XA_O: P2 = [-420, 330];                                   // shoulder (off the panel, bottom left)
const XA_EL: P2 = [-165, 118], XA_WR: P2 = [40, -52];
const HAND_A = -44;                                             // the hand points up-right
const hp = (x: number, y: number): P2 => add(XA_WR, rot2([x, y], HAND_A));
const ARM_BONES: XB[] = (() => {
  const out: XB[] = [];
  out.push({a: XA_O, b: add(XA_EL, [-6, 4]), w: 44, knob: true});                       // humerus
  out.push({a: add(XA_EL, [4, -16]), b: add(XA_WR, [-10, -12]), w: 26, knob: true});    // ulna
  out.push({a: add(XA_EL, [18, 10]), b: add(XA_WR, [6, 10]), w: 24, knob: true});        // radius
  [[14, -24], [14, -8], [14, 8], [14, 24], [34, -26], [34, -9], [34, 8], [34, 25]].forEach(([x, y]) =>   // 8 carpals
    out.push({a: hp(x - 4, y), b: hp(x + 4, y), w: 13}));
  const meta: [number, number, number, number][] = [[46, -34, 84, -66], [52, -20, 120, -27], [54, -6, 128, -6], [52, 8, 122, 14], [48, 22, 108, 33]];
  meta.forEach(([x0, y0, x1, y1]) => out.push({a: hp(x0, y0), b: hp(x1, y1), w: 13}));   // 5 metacarpals
  const fingers: [number, number, number, number[]][] = [[84, -66, -40, [40, 30]], [120, -27, -8, [46, 30, 22]], [128, -6, 0, [50, 32, 24]], [122, 14, 7, [46, 30, 22]], [108, 33, 16, [36, 24, 18]]];
  fingers.forEach(([x, y, ang, ls]) => {                                                // 14 phalanges
    let p: P2 = [x, y];
    ls.forEach((l) => { const q: P2 = [p[0] + 6 + l * Math.cos(rad(ang)), p[1] + l * Math.sin(rad(ang))]; out.push({a: hp(p[0] + 7, p[1]), b: hp(q[0], q[1]), w: 11}); p = q; });
  });
  return out;
})();
const XA_AX: P2 = (() => { const d: P2 = [hp(200, 0)[0] - XA_O[0], hp(200, 0)[1] - XA_O[1]]; const l = Math.hypot(d[0], d[1]); return [d[0] / l, d[1] / l]; })();
const XA_LEN = Math.hypot(hp(200, 0)[0] - XA_O[0], hp(200, 0)[1] - XA_O[1]);
const along = (p: P2) => (p[0] - XA_O[0]) * XA_AX[0] + (p[1] - XA_O[1]) * XA_AX[1];
const scanPoly = (s: number, behind: boolean) => {
  const n: P2 = [XA_AX[1], -XA_AX[0]], c = add(XA_O, mul(XA_AX, s)), back = mul(XA_AX, behind ? -30000 : 30000);
  return [add(c, mul(n, 2000)), add(c, mul(n, -2000)), add(add(c, mul(n, -2000)), back), add(add(c, mul(n, 2000)), back)].map(P).join(' ');
};
const ArmXRay: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const lit = Math.floor(seg(t, CNT0, CNT1) * 30 + 0.0001);
  const sc = lerp(150, XA_LEN + 130, eio(seg(t, SCAN0, SCAN1)));
  const scanning = t > SCAN0 && t < SCAN1 + 0.05;
  const swept = (b: XB) => t > SCAN0 && along(lp2(b.a, b.b, 0.5)) < sc;
  const left = ARM_BONES.filter((b) => !swept(b)).length;
  const value = t < SCAN0 ? lit : left;
  const red = t > SCAN0 + 0.05;
  const handC = hp(64, 0);
  return (
    <div style={{position: 'absolute', left: 540, top: 1090, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s.toFixed(3)})`}}>
      <XFrame id={`xa${uid}`} R={340}>
        <clipPath id={`xab${uid}`}><polygon points={scanPoly(t > SCAN0 ? sc : -9999, true)} /></clipPath>
        <clipPath id={`xaf${uid}`}><polygon points={scanPoly(t > SCAN0 ? sc : -9999, false)} /></clipPath>
        {/* your arm (ahead of the scan line) */}
        <g clipPath={`url(#xaf${uid})`}>
          <g opacity={0.55}>
            <path d={`M ${P(XA_O)} L ${P(XA_EL)} L ${P(XA_WR)}`} stroke={XBODY} strokeWidth={104} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <circle cx={handC[0]} cy={handC[1]} r={78} fill={XBODY} />
            {[[84, -66, -40, 70], [120, -27, -8, 98], [128, -6, 0, 106], [122, 14, 7, 98], [108, 33, 16, 78]].map(([x, y, a, l], i) =>
              <path key={i} d={`M ${P(hp(x, y))} L ${P(hp(x + 6 + l * Math.cos(rad(a)), y + l * Math.sin(rad(a))))}`} stroke={XBODY} strokeWidth={34} strokeLinecap="round" />)}
            <path d={`M ${P(hp(40, -30))} L ${P(hp(84, -66))}`} stroke={XBODY} strokeWidth={40} strokeLinecap="round" />
          </g>
          {ARM_BONES.map((b, i) => <Bone key={i} a={b.a} b={b.b} w={b.w} knob={b.knob} glow={i < lit && t < SCAN0 ? Math.max(0.3, 1 - (t - (CNT0 + (i / 30) * (CNT1 - CNT0))) * 3) : 0} />)}
        </g>
        {/* the new arm (behind the scan line): one tube with a round end, no joints */}
        <g clipPath={`url(#xab${uid})`}>
          <path d={`M ${P(XA_O)} L ${P(handC)}`} stroke={XBODY} strokeWidth={96} strokeLinecap="round" opacity={0.45} />
          <path d={`M ${P(XA_O)} L ${P(handC)}`} stroke={CART_DK} strokeWidth={44} strokeLinecap="round" />
          <path d={`M ${P(XA_O)} L ${P(handC)}`} stroke={CART} strokeWidth={34} strokeLinecap="round" />
          <path d={`M ${P(XA_O)} L ${P(handC)}`} stroke={CART_CORE} strokeWidth={9} strokeLinecap="round" />
        </g>
        {scanning ? <path d={(() => { const n: P2 = [XA_AX[1], -XA_AX[0]], c = add(XA_O, mul(XA_AX, sc)); return `M ${P(add(c, mul(n, 600)))} L ${P(add(c, mul(n, -600)))}`; })()}
          stroke="#7DF9FF" strokeWidth={10} opacity={0.9} /> : null}
      </XFrame>
      <Card text={t < SCAN0 + 0.05 ? 'X-RAY: YOUR ARM' : 'X-RAY: NEW ARM'} top={86} size={48} rot={2} color={t < SCAN0 + 0.05 ? '#fff' : RED} fg={t < SCAN0 + 0.05 ? INK : '#fff'} />
      <div style={{position: 'absolute', left: 760, top: 700, transform: `translate(-50%,-50%) rotate(5deg) scale(${(popIn(t, CNT0 - 0.15, 0.3) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - (t < SCAN0 ? CNT1 : SCAN1)) * 5))).toFixed(3)})`,
        background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 26px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{fontWeight: FONT_W, fontSize: 110, lineHeight: 1, color: red ? RED : INK}}>{fmt(value)}</div>
        <div style={{fontWeight: FONT_W, fontSize: 36}}>BONES</div>
      </div>
    </div>
  );
};

// ---------- the story over time ----------
const REST_R: P2 = [24, 132];
const base = (): GS => ({x: GX, y: 0, rot: 0, lean: 0, hip: 70, knee: 0, armR: REST_R, na: 8, nlen: 1, nwob: 0, seam: 0, mood: 'smug', look: 0,
  sq: 0, tilt: 0, squish: 0, trem: 0, scoop: -1, cone: 0});
/** the popped arm, flung away: where it is at u seconds after the pop */
type DA = {on: boolean; S: P2; a: number; wob: number};
const POP_S: P2 = [-SHX - 32, -150], POP_A = 8;   // the popped arm's top (torso frame) and angle at the pop
const GRIP_POP: P2 = [POP_S[0] - 6 - SHX, POP_S[1] + 11 + 160];   // right hand on it (offset from the right shoulder)
const dropArm = (g0: GS, u: number): DA => {
  const S0 = toWorld(g0, POP_S), A0 = POP_A;
  if (u < REL) return {on: true, S: [S0[0] - 8 * (u / REL), S0[1]], a: A0, wob: 0.3 * Math.sin(u * 40)};
  const Sr: P2 = [S0[0] - 8, S0[1]], E0 = armEnd(Sr, A0);           // the hand end rests on the sand, the arm tips over onto it
  if (u < FLY) { const k = seg(u, REL, FLY), a = A0 + (90 - A0) * k * k; return {on: true, S: add(E0, mul(dirA(a), -NA_L)), a, wob: 0.2 * Math.sin(u * 30)}; }
  // flip-flops on the sand like a dropped lizard tail (stiff: it rocks and hops, it doesn't bend much)
  const w = u - FLY, hopT = [0, 0.22, 0.4, 0.55, 0.67, 0.77, 0.86], hopH = [40, 30, 20, 13, 8, 4];
  let i = 0; while (i < hopH.length - 1 && w > hopT[i + 1]) i++;
  const on = w < hopT[hopT.length - 1], k = clamp((w - hopT[i]) / (hopT[i + 1] - hopT[i]));
  const h = on ? hopH[i] * 4 * k * (1 - k) : 0;
  const cx = E0[0] + NA_L / 2 + 6 * Math.min(w, 1), cy = E0[1] - 4 - h;
  const a = 90 + (on ? (i % 2 ? -1 : 1) * 22 * Math.sin(Math.PI * k) : 2.5 * Math.sin(w * 9) * Math.exp(-w));
  const d = dirA(a);
  return {on: true, S: [cx - d[0] * NA_L / 2, cy - d[1] * NA_L / 2], a, wob: on ? 0.28 * Math.sin(w * 26) : 0.04 * Math.sin(w * 12)};
};
const gPop0: GS = (() => { const q = base(); q.armR = GRIP_POP; q.lean = -4; return q; })();
/** u seconds after a pop: right hand at the left shoulder, flings the arm, a new one grows */
const popSeq = (g: GS, u: number) => {
  g.seam = 1 - seg(u, 0.5, 0.75);
  g.nlen = u < GROW0 ? 0 : backOutLen(seg(u, GROW0, GROW1));
  g.na = 10 + spring(u, GROW1, 8, 3, 6); g.nwob = u > GROW0 ? spring(u, GROW0 + 0.3, 0.5, 4, 6) : 0;
  if (u < REL) { g.armR = GRIP_POP; g.lean = -4; g.mood = 'joy'; }
  else if (u < 0.5) { const k = eout(seg(u, REL, 0.5)); g.armR = lp2(GRIP_POP, REST_R, k); g.lean = lerp(-4, 0, k); g.mood = 'joy'; }
  else { g.armR = REST_R; g.mood = u < GROW0 + 0.05 ? 'joy' : 'happy'; }
};
const backOutLen = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 + 2.2 * Math.pow(u - 1, 3) + 1.2 * Math.pow(u - 1, 2));
const guyAt = (t: number): GS => {
  const g = base();
  if (t < S2) {
    popSeq(g, t);
    if (t > RAISE0) {   // lifts the new arm, proud; waves (the whole arm swings at the shoulder)
      const r = eout(seg(t, RAISE0, RAISE1));
      g.na = lerp(10, 168, r) + spring(t, RAISE1, 9, 3.2, 5); g.nwob = spring(t, RAISE1, 0.45, 4, 5);
      g.mood = 'smug'; g.armR = [30, 128];
      if (t > WAVE0) { const w = t - WAVE0; g.na = 172 - 15 * Math.sin(w * 2 * Math.PI * 1.6) * (1 - 0.2 * w); g.nwob = 0.35 * Math.sin(w * 2 * Math.PI * 1.6 - 1.2); g.mood = 'joy'; }
    }
    return g;
  }
  if (t < S3) {   // the last wave swings in: WHACK across his face, it springs back
    g.nlen = 1; g.armR = [30, 128];
    if (t < WHACK) { const u = Math.pow(seg(t, S2, WHACK), 1.8); g.na = lerp(160, 206, u); g.mood = u < 0.6 ? 'joy' : 'pop'; g.nwob = -0.2 * u; }
    else {
      const k = t - WHACK;
      g.na = 206 - 32 * eout(clamp(k / 0.22)) + spring(t, WHACK + 0.22, 6, 3, 5); g.nwob = spring(t, WHACK, 0.7, 5, 5);
      g.mood = t < 2.95 ? 'oof' : 'dizzy'; g.sq = Math.max(0, Math.exp(-6 * k) * (k < 0.06 ? k / 0.06 : Math.cos((k - 0.06) * 26))); g.squish = 0.8 * Math.exp(-5 * k);
      g.tilt = 14 * Math.exp(-4 * k) * Math.cos(k * 14); g.trem = 0.4 * Math.exp(-3 * k);
    }
    return g;
  }
  if (t < S6) {   // (offscreen during the lizard shots) medium shot behind the arm X-ray: rubs his face, looks at his arm
    g.na = 30 + 4 * Math.sin(t * 2.1); g.mood = t < S5 + 0.2 ? 'dizzy' : t < SCAN0 ? 'worry' : 'pop'; g.look = -1; g.armR = [24, 132];
    return g;
  }
  if (t < S7) {   // ice cream: no wrist, no elbow - the stiff arm swings the cone right over and onto his head
    g.armR = [30, 128];
    if (t < LIFT0) { g.na = 25; g.cone = 2; g.mood = 'happy'; g.look = -1; return g; }
    const r = eout(seg(t, LIFT0, PLOP));
    g.na = lerp(25, 178, r) + (t > PLOP ? -10 * eout(clamp((t - PLOP) / 0.2)) + spring(t, PLOP + 0.2, 5, 3, 4) : 0);
    g.nwob = spring(t, PLOP, 0.55, 4, 4);
    g.cone = t < PLOP ? 2 : 0;
    g.mood = t < LIFT0 + 0.1 ? 'joy' : t < PLOP ? 'pop' : 'deadpan';
    if (t > PLOP) { g.scoop = clamp((t - PLOP) / 1.6); g.sq = Math.max(0, Math.exp(-7 * (t - PLOP)) * Math.cos((t - PLOP) * 24)) * 0.8; }
    return g;
  }
  // pops it off again; a new one grows; he grabs it = frame 0
  if (t < POP2) {
    const k = eout(seg(t, GRAB, GRAB + 0.25));
    g.armR = lp2(REST_R, GRIP_POP, k); g.na = 10; g.mood = t < GRAB ? 'focus' : 'strain'; g.trem = t > GRAB + 0.2 ? 0.6 : 0; g.lean = -4 * k;
    return g;
  }
  popSeq(g, t - POP2);
  if (t > POP2 + GROW1 + 0.05) { g.mood = 'hope'; g.look = -1; }
  if (t > GRAB2) { const k = eout(seg(t, GRAB2, GRAB2 + 0.22)); g.armR = lp2(REST_R, GRIP_POP, k); g.mood = 'joy'; g.lean = -4 * k; g.trem = t > GRAB2 + 0.22 ? 0.5 : 0; }
  return g;
};
const lizAt = (t: number): LS => {
  const L: LS = {x: ROCK_X + 6, y: ROCK_TOP - 2, s: 1.1, mood: 'smug', ta: 74, bend: -0.3, wob: 0, dew: 0, tilt: 0, shake: 0, reg: 0.55, tlen: 1, drop: 0};
  if (t < S2) {
    if (t > T.lizards - 0.1) { const k = seg(t, T.lizards - 0.1, T.tail + 0.25); L.ta = 74 - 100 * Math.sin(Math.PI * k); L.bend = -0.3 + 0.22 * Math.sin(Math.PI * k); L.wob = spring(t, T.tail + 0.25, 0.25, 4, 5); L.mood = k > 0 && k < 1 ? 'proud' : 'smug'; }
    if (t > 1.9) L.mood = 'look';
    return L;
  }
  if (t < S3) { if (t > WHACK + 0.08) { L.mood = 'laugh'; L.shake = 1; L.tilt = -6; } else L.mood = 'look'; return L; }
  if (t < S4) { L.mood = t < SNAP ? 'smug' : t < T.cartilage ? 'down' : 'smug'; L.dew = t > T.cartilage ? popIn(t, T.cartilage, 0.3) * (1 - seg(t, 7.3, 7.6)) : 0; return L; }
  if (t < S5) {   // FINE: wags the stiff new tail up and down like a flag
    const w = t - S4;
    L.ta = -74 + 22 * Math.sin(w * 2 * Math.PI * 1.9); L.bend = -0.12; L.wob = 0.18 * Math.sin(w * 2 * Math.PI * 1.9 - 1.3); L.mood = 'proud'; L.dew = popIn(t, T.fine, 0.3);
    return L;
  }
  if (t < S7) { if (t > PLOP + 0.05) { L.mood = 'laugh'; L.shake = 1; L.tilt = -6; } else L.mood = 'look'; return L; }
  L.mood = t > POP2 + 0.1 ? 'smug' : 'look';
  return L;
};

// ---------- camera (piecewise, hard cuts) ----------
const CAM0 = {x: -4, y: -185, k: 3.2};
const camFor = (t: number): {x: number; y: number; k: number} => {
  if (t < S2) { const u = eio(seg(t, 0, S2 - 0.05)); return {x: lerp(CAM0.x, 20, u), y: lerp(CAM0.y, -175, u), k: lerp(CAM0.k, 2.9, u)}; }
  if (t < S3) { const u = eio(seg(t, S2, S3)); return {x: lerp(-66, -64, u), y: lerp(-205, -200, u), k: lerp(3.78, 3.86, u)}; }
  if (t < S4) { const u = eio(seg(t, S3, S4)); return {x: lerp(125, 130, u), y: lerp(-40, -35, u), k: lerp(3.0, 3.1, u)}; }
  if (t < S5) return {x: 130, y: -190, k: 3.5};
  if (t < S6) { const u = eio(seg(t, S5, S6)); return {x: lerp(GX + 20, GX + 18, u), y: lerp(-60, -55, u), k: lerp(2.6, 2.66, u)}; }
  if (t < S7) { const u = eio(seg(t, S6, S7)); return {x: lerp(-8, -4, u), y: lerp(-172, -174, u), k: lerp(2.6, 2.66, u)}; }
  const u = eio(seg(t, S7, PUSH - 0.1));
  return {x: lerp(20, CAM0.x, u), y: lerp(-175, CAM0.y, u), k: lerp(2.9, CAM0.k, u)};
};

export const LizScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t), L = lizAt(t);
  if (thumb) { L.mood = 'smug'; L.ta = 74; L.bend = -0.3; L.wob = 0; g.na = 154; g.nwob = 0; g.mood = 'smug'; }   // thumbnails: new arm up clear of his face, the lizard smug, its two-tone tail hanging
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 5, 7) + hit(t, WHACK, 18, 6) + hit(t, SNAP, 4, 8) + hit(t, PLOP, 10, 6) + hit(t, POP2, 6, 7) + hit(t, FLY, 3, 9) + hit(t, POP2 + FLY, 3, 9));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const hw = headWorld(g);
  // the popped arm: from frame 0 (pop at t = 0) and again after POP2
  const gPop = gPop0;
  const da: DA | null = t < 1.9 ? dropArm(gPop, t) : t > POP2 ? dropArm(gPop, t - POP2) : null;
  // stickers (each ends before its cut)
  const st = {
    pop: (t < 0.5 ? 1 : 1 - seg(t, 0.5, 0.62)), wiggle: popIn(t, FLY + 0.05, 0.25) * (1 - seg(t, 1.45, 1.6)),
    grows: popIn(t, GROW0 + 0.1, 0.28) * (1 - seg(t, 1.78, 1.9)), hi: popIn(t, 1.92, 0.22) * (1 - seg(t, S2 + 0.08, S2 + 0.18)),
    whack: popIn(t, WHACK, 0.2) * (1 - seg(t, 3.0, 3.15)),
    fine: popIn(t, T.fine, 0.28) * (1 - seg(t, S5 - 0.12, S5)),
    plop: popIn(t, PLOP, 0.2) * (1 - seg(t, 14.0, 14.15)),
    pop2: popIn(t, POP2, 0.2) * (1 - seg(t, POP2 + 0.5, POP2 + 0.62)), again: popIn(t, T.tries, 0.28) * (1 - seg(t, PUSH - 0.15, PUSH)),
  };
  const stars = (t > WHACK + 0.12 && t < S3) ? 1 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`lFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Sky />
      <Layer cam={cam} z={2600}><W><g>
        {[-1500, -300, 900, 2100].map((x, i) => <path key={i} d={`M ${x - 520} -10 L ${x - 380} -250 Q ${x - 360} -280 ${x - 320} -280 L ${x + 300} -280 Q ${x + 340} -280 ${x + 360} -250 L ${x + 520} -10 Z`}
          fill={i % 2 ? MESA_DK : MESA} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
        <circle cx={760} cy={-520} r={90} fill="#FFE8A0" stroke={INK} strokeWidth={6} />
        <Cactus x={-820} s={1.3} /><Cactus x={520} s={1.1} /><Cactus x={1500} s={1.4} />
        <rect x={-6000} y={-12} width={12000} height={4000} fill={SAND} />
        <path d="M -6000 -12 H 6000" stroke={INK} strokeWidth={6} />
      </g></W></Layer>
      <Layer cam={cam} z={1000}><W><g>
        <rect x={-4000} y={0} width={8000} height={3000} fill={SAND} />
        <path d="M -4000 0 H 4000" stroke={INK} strokeWidth={6} />
        {Array.from({length: 22}, (_, i) => { const x = -1300 + i * 130 + ((i * 47) % 60); return <ellipse key={i} cx={x} cy={30 + (i % 3) * 22} rx={14 + (i % 4) * 4} ry={6} fill={SAND2} />; })}
        <Rock x={ROCK_X} />
      </g></W></Layer>
      <Layer cam={cam} z={1000}>
        <Lizard t={t} L={L} uid={uid} />
        {t < S3 || t >= S5 ? <GuyL t={t} g={g} uid={uid} /> : null}
        {da && da.on ? <W><StiffArm S={da.S} a={da.a} wob={da.wob} /></W> : null}
        {t > FLY && t < 1.4 ? <Puffs t={t} born={FLY} x={da ? da.S[0] - 60 : 0} y={-6} n={5} life={0.45} size={20} vy={-50} color="#F7EBD0" seed={4} /> : null}
        {t > POP2 + FLY && t < POP2 + 1.4 ? <Puffs t={t} born={POP2 + FLY} x={da ? da.S[0] - 60 : 0} y={-6} n={5} life={0.45} size={20} vy={-50} color="#F7EBD0" seed={7} /> : null}
        <ArmXMarks t={t} g={g} />
        {[0, POP2].map((t0, j) => { const u = t - t0; if (u < 0 || u > 0.3 || (j === 0 && t > S2)) return null; const c = toWorld(gPop0, [-SHX - 10, -158]);
          return <W key={'pb' + j}><g transform={`translate(${P(c)})`} opacity={1 - u / 0.3}>{[-150, -110, -70, 160, 200].map((a) => <path key={a} d={`M ${(22 + 40 * u).toFixed(1)} 0 L ${(44 + 60 * u).toFixed(1)} 0`} transform={`rotate(${a})`} stroke={GOLD} strokeWidth={9} strokeLinecap="round" />)}</g></W>; })}
        {[0, 1, 2].map((i) => { const a = t * 6 + (i * 2 * Math.PI) / 3; const r = 64;
          return <Star key={i} x={hw[0] + Math.cos(a) * 1.45 * r} y={hw[1] - 1.45 * r + Math.sin(a) * 0.25 * r} s={stars * 0.5} rot={t * 200} />; })}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={8} y={-268} s={st.pop} text="POP" size={58} rot={8} fill={GOLD} />
        <Txt x={-62} y={-72} s={st.wiggle} text="WIGGLE" size={34} rot={-6} fill="#FFFFFF" />
        <Txt x={86} y={-218} s={st.grows} text="GROWS BACK" size={32} rot={-6} fill={GOLD} />
        <Txt x={40} y={-262} s={st.hi} text="HI" size={54} rot={8} fill="#FFFFFF" />
        <Txt x={-36} y={-326} s={st.whack} text="WHACK" size={44} rot={8} fill="#FFFFFF" />
        <Txt x={112} y={-300} s={st.fine} text="FINE" size={52} rot={-8} fill={GOLD} />
        <Txt x={-30} y={-392} s={st.plop} text="PLOP" size={50} rot={-6} fill="#FFFFFF" />
        <Txt x={8} y={-268} s={st.pop2} text="POP" size={58} rot={8} fill={GOLD} />
        <Txt x={62} y={-232} s={st.again} text="TRY AGAIN" size={34} rot={-6} fill={GOLD} />
      </Layer>}
      {thumb ? null : <>
        <Card text="NO BONES" top={400} left={540} color={RED} fg="#fff" rot={-4} s={popIn(t, T.no - 0.03, 0.3) * (1 - seg(t, S3 - 0.14, S3)) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - T.bones) * 6))} size={78} />
        <ArmLabels t={t} />
      </>}
      <TailXRay t={t} s={popIn(t, S3 + 0.03, 0.35) * (1 - seg(t, S4 - 0.14, S4)) * (t >= S3 ? 1 : 0)} uid={uid} />
      <NoseXRay t={t} s={popIn(t, NOSE0, 0.32) * (1 - seg(t, S4 - 0.14, S4))} uid={uid} />
      <ArmXRay t={t} s={popIn(t, S5 + 0.03, 0.35) * (1 - seg(t, S6 - 0.14, S6)) * (t >= S5 ? 1 : 0)} uid={uid} />
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you could regrow your arm like a lizard??" handle="@scaly_doodle" likes="2.7K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so - 0.05} until={PUSH - 0.4} text="Would you still want it?" />
      </>}
    </AbsoluteFill>
  );
};
/** NO ELBOW / NO WRIST / NO KNUCKLES: red X marks on the raised stiff arm (world) + three cards top right (screen) */
const ARM_X: [string, number, number][] = [['NO ELBOW', 0.5, T.elbow], ['NO WRIST', 0.84, T.wrist], ['NO KNUCKLES', 1.0, T.knuckles]];
const ArmXMarks: React.FC<{t: number; g: GS}> = ({t, g}) => {
  if (t < S6 || t > S7) return null;
  const S = shoulderL(g);
  return <W><g>{ARM_X.map(([, u, at], i) => {
    const p = toWorld(g, armEnd(S, g.na, u)), s = popIn(t, at - 0.02, 0.25);
    if (s < 0.01) return null;
    return <g key={i} transform={`translate(${P(p)}) scale(${s.toFixed(3)})`}>
      <path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <path d="M -14 -14 L 14 14 M 14 -14 L -14 14" stroke={RED} strokeWidth={6} strokeLinecap="round" />
    </g>;
  })}</g></W>;
};
const ArmLabels: React.FC<{t: number}> = ({t}) => {
  if (t < S6 || t > S7) return null;
  return <>{ARM_X.map(([text, , at], i) => <Card key={i} text={text} top={520 + i * 118} left={760} color={RED} fg="#fff" rot={[-4, 3, -3][i]}
    s={popIn(t, at - 0.02, 0.28) * (1 - seg(t, S7 - 0.14, S7))} size={50} />)}</>;
};

export const LizVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const flops = (t0: number): Cue[] => [0, 0.24, 0.44, 0.6, 0.73, 0.84].map((d, i) => ({f: 'slap.wav', at: t0 + d, db: -21 - i * 2.5}));
  const popCues = (t0: number, first = false): Cue[] => [
    {f: 'pop.wav', at: t0, db: first ? -6 : -8}, {f: 'squelch.wav', at: t0, db: first ? -16 : -18, to: 0.35}, {f: 'whoosh.wav', at: t0 + REL - 0.06, db: -21},
    ...flops(t0 + FLY), {f: 'giggle.mp3', at: t0 + FLY + 0.1, db: -32, to: 0.5},
    {f: 'stretch.wav', at: t0 + GROW0 - 0.02, db: -14}, {f: 'pop.wav', at: t0 + GROW1 - 0.05, db: -22},
  ];
  const cues: Cue[] = [
    // frame 0: POP - the arm comes off, flip-flops on the sand, a new one shoots out
    ...popCues(0, true), {f: 'whoosh.wav', at: 0, db: -22, from: 0.15},
    {f: 'twang.mp3', at: RAISE1, db: -18, to: 0.5}, {f: 'twang.mp3', at: WAVE0 + 0.3, db: -24, to: 0.4}, {f: 'twang.mp3', at: WAVE0 + 0.6, db: -24, to: 0.4},
    // close-up: WHACK
    {f: 'whoosh.wav', at: WHACK - 0.22, db: -18}, {f: 'slap.wav', at: WHACK, db: -4}, {f: 'bonk.wav', at: WHACK + 0.01, db: -12},
    {f: 'twang.mp3', at: WHACK + 0.04, db: -14, to: 0.7}, {f: 'crowd_laugh.wav', at: WHACK + 0.2, db: -27, to: 1.1}, {f: 'pop.wav', at: T.no, db: -22},
    // X-RAY: lizard tail
    {f: 'zap.wav', at: S3, db: -24}, {f: 'pop.wav', at: S3 + 0.05, db: -24}, {f: 'crack.wav', at: SNAP - 0.32, db: -13}, {f: 'pop.wav', at: 4.62, db: -27},
    {f: 'stretch.wav', at: REG0, db: -19}, {f: 'pop.wav', at: T.newt, db: -26}, {f: 'ding.mp3', at: T.tube, db: -21}, {f: 'pop.wav', at: T.cartilage, db: -22},
    {f: 'pop.wav', at: NOSE0, db: -23}, {f: 'squeak.wav', at: BOOP - 0.02, db: -14},
    // FINE: the lizard wags its stiff tail
    {f: 'whoosh.wav', at: S4 - 0.02, db: -30}, {f: 'twang.mp3', at: S4 + 0.1, db: -19, to: 0.45}, {f: 'twang.mp3', at: S4 + 0.62, db: -21, to: 0.45}, {f: 'pop.wav', at: T.fine, db: -22},
    // X-RAY: your arm - count 30, scan, 0
    {f: 'zap.wav', at: S5, db: -24}, {f: 'pop.wav', at: S5 + 0.05, db: -24},
    ...ticks(CNT0, CNT1, 15, -31), {f: 'ding.mp3', at: CNT1 + 0.02, db: -20},
    {f: 'whisper_whoosh.wav', at: SCAN0 - 0.1, db: -22}, {f: 'shimmer.wav', at: SCAN0 + 0.1, db: -23}, {f: 'pfft.wav', at: SCAN1 - 0.05, db: -18}, {f: 'pop.wav', at: T.zero, db: -21},
    // ice cream: PLOP
    {f: 'whoosh.wav', at: S6 - 0.02, db: -30}, {f: 'whoosh.wav', at: LIFT0, db: -18}, {f: 'twang.mp3', at: PLOP + 0.05, db: -20, to: 0.45},
    {f: 'squelch.wav', at: PLOP, db: -7}, {f: 'slap.wav', at: PLOP, db: -16}, {f: 'crowd_laugh.wav', at: PLOP + 0.15, db: -25, to: 1.3},
    {f: 'clack.wav', at: T.elbow, db: -19}, {f: 'clack.wav', at: T.wrist, db: -19}, {f: 'clack.wav', at: T.knuckles, db: -18},
    ...ctaCues(T.cta),
    // pops it off again, a new one grows, he grabs it = frame 0
    {f: 'whoosh.wav', at: S7 - 0.02, db: -30}, {f: 'strain.mp3', at: GRAB + 0.15, db: -24, to: 0.4},
    ...popCues(POP2), {f: 'strain.mp3', at: GRAB2 + 0.18, db: -25},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<LizScene t={0} />}>
        <LizScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="lizard/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const LizWide: React.FC = () => <WideFit.Provider value={0.72}><LizVideo /></WideFit.Provider>;
