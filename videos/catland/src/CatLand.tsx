// "What if you could land like a cat?" - shark formula (CLAUDE.md, Growth), niche: animal powers. All drawn in code.
// Frame 0: he falls past a high-rise beside a falling smug cat, both flipping over in midair (WHOOSH + falling whistle);
// 0.70 both land on all fours (THUD, TA-DA). 1.42 his arms wobble, 1.92 close-up: his chin slams the pavement (CRACK, an
// X-ray flash of his jaw, stars). 3.12 X-RAY: CAT - the inner ear finds down (INNER EAR), the front half twists, then the
// back half (TWIST), PAWS DOWN. 6.72 wide: nine cats drop out of the windows and land in a row (SURVIVED 0 -> 90 %, 9 IN 10);
// the smug cat drops last, onto his head (BONK, laugh). 10.22 SLOW-MO: the cat lands, its legs give, its chin taps the
// ground (CHIN). 13.36 both sit with a plaster on the chin (FACE HURT 0 -> 57 %, MORE THAN HALF). 15.40 the fire escape: he
// takes the stairs, the cat dashes between his feet, he trips and falls -> the loop push into frame 0.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd, spring,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, pen} from './lib/kit';

// voice: tight.mp3 at 0.1 s (scripts/vsplice.py: line 1 at 1.22, the rest at 1.12; word times refined to the loudness
// chunks with scripts/refine_words.py) - src/data/words.json. Last word ends 17.22 s; + 0.83 s so the push starts after it.
export const DURATION = 18.05;
export const T = {
  land: 0.12, cat: 0.65, and: 1.18, smash: 1.49, chin: 1.95, ground: 2.35,
  a: 3.21, falling: 3.35, cat2: 3.69, flips: 4.11, over: 4.39, midair: 4.80, lands: 5.54, paws: 6.11,
  nine: 6.91, ten: 7.38, survive: 7.56, falls: 7.97, highrise: 8.38, windows: 8.79,
  but: 10.34, lands2: 10.66, so: 10.88, hard: 11.23, chin2: 11.77, ground2: 12.29, too: 12.67,
  more: 13.50, half: 13.78, hurt: 14.04, faces: 14.35,
  so2: 15.50, now: 16.07, takes: 16.40, stairs: 16.61,
  cta: 10.95,
};
// shots (hard cuts)
const S2 = 1.88, S3 = 3.12, S4 = 6.72, S5 = 10.22, S6 = 13.36, S7 = 15.40;
const PUSH = DURATION - LOOP_DUR;
const LAND = 0.70, CAT_LAND = 0.72, CAT_SWAP = 0.98;                  // frame 0: the fall and the landing
const WOB0 = 1.42, DROP0 = 1.80, IMPACT = 1.92, XR_OFF = 2.17;         // the arms give, the chin hits, the X-ray flash
const EAR = 3.70, TW1 = 4.11, TW2 = 4.39, XLAND = 5.62;                // X-ray: the inner ear, the twist, the landing
const RAIN0 = 6.80, RAIN_DT = 0.17, RAIN_FALL = 0.42;                  // nine cats drop out of the windows
const TENTH0 = 8.82, TENTH_HIT = 9.25;                                  // the smug cat drops onto his head
const SL_TOUCH = 10.66, SL_CHIN = 11.80, SL_UP = 12.67;                // slow-mo
const FH0 = 13.56, FH1 = 14.95;                                        // FACE HURT counter
const STEPS = [15.56, 15.92, 16.28, 16.64], DASH0 = 16.70, DASH1 = 17.12, TRIP = 16.95;   // the stairs

const GOLD = '#FFD43B', RED = '#E2453C', WHITE = '#FFFFFF', FACE_C = '#F1EFEA';
const WALL = '#EAC9A2', BRICK = '#D9A87A', TRIM = '#FFF7EA', GLASS = '#BFE3F5', GLASS_DK = '#93C6E4', SILL = '#C9A27C';
const PAVE = '#DAD5CC', PAVE_DK = '#BDB7AC', CURB = '#A9A49B', STREET = '#8E939A', PLINTH = '#B99A7A';
const METAL = '#4D5661', METAL_LT = '#7B8692';
const XNAVY = '#151C40', XLINE = '#7F93D1', XFILL = '#2E3B7E', XBONE = '#DCE6FF';
const PLASTER = '#F2C88F', PLASTER_DK = '#D9A867';

type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const mul = (a: P2, k: number): P2 => [a[0] * k, a[1] * k];
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const inS = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.24) * (1 - seg(t, a + d, a + d + 0.16));
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixC = (a: string, b: string, u: number) => { const A = hx(a), B = hx(b), k = clamp(u); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
const cbez = (a: P2, b: P2, c: P2, d: P2, n = 18): P2[] => Array.from({length: n + 1}, (_, i) => {
  const u = i / n, v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]] as P2;
});
/** a tapered tube along pts (tail) as one closed outline */
const taper = (pts: P2[], w0: number, w1: number) => {
  const L: P2[] = [], R: P2[] = [];
  pts.forEach((p, i) => {
    const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1;
    const w = lerp(w0, w1, i / (pts.length - 1)) / 2;
    L.push([p[0] - (dy / d) * w, p[1] + (dx / d) * w]); R.push([p[0] + (dy / d) * w, p[1] - (dx / d) * w]);
  });
  const e = pts[pts.length - 1], r = w1 / 2;
  return `M ${L.map(P).join(' L ')} A ${r} ${r} 0 0 1 ${P(R[R.length - 1])} L ${R.reverse().map(P).join(' L ')} Z` + (e ? '' : '');
};

// ---------- stickers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const CountBox: React.FC<{label: string; val: string; sub2?: string; col: string; s: number; top: number; bump?: number}> = ({label, val, sub2, col, s, top, bump = 0}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s * (1 + 0.1 * bump)})`, background: '#FFFDF6', border: `9px solid ${INK}`,
    borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '4px 36px 10px', textAlign: 'center', minWidth: 360, fontFamily: FONT, color: INK, whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: 900, fontSize: 42, lineHeight: 1.1}}>{label}</div>
    <div style={{fontWeight: 900, fontSize: 118, lineHeight: 1, color: col}}>{val}</div>
    {sub2 ? <div style={{fontWeight: 900, fontSize: 36, lineHeight: 1.1}}>{sub2}</div> : null}
  </div>
) : null;

// ---------- limbs ----------
const ik = (A: P2, F: P2, L1: number, L2: number, bend: number): P2 => {
  const dx = F[0] - A[0], dy = F[1] - A[1], D = Math.hypot(dx, dy) || 1;
  const d = Math.min(D, L1 + L2 - 0.01);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / D, uy = dy / D;
  return [A[0] + ux * a - uy * h * bend, A[1] + uy * a + ux * h * bend];
};
const quadD = (S: P2, E: P2, H: P2) => { const C: P2 = [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2]; return `M ${P(S)} Q ${P(C)} ${P(H)}`; };
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; hand?: boolean; fill?: string; stroke?: string}> = ({S, H, L, sd, w = 29, hand = true, fill = WHITE, stroke = INK}) => {
  const d = quadD(S, ik(S, H, L, L, sd), H);
  return (
    <g>
      <path d={d} stroke={stroke} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke={fill} strokeWidth={w - 11} fill="none" strokeLinecap="round" />
      {hand ? <circle cx={H[0]} cy={H[1]} r={13} fill={fill} stroke={stroke} strokeWidth={5.5} /> : null}
    </g>
  );
};
const torsoD = (tw: number, top: number, bot: number) => {
  const h = bot - top, r1 = Math.min(34, h * 0.3), r2 = Math.min(29, h * 0.26), sw = tw * 0.6;
  return `M ${-sw} ${top} C ${-tw + 5} ${top + r1 * 0.18} ${-tw} ${top + r1 * 0.5} ${-tw} ${top + r1} L ${-tw + 1} ${bot - r2} Q ${-tw + 1} ${bot} ${-tw + r2} ${bot} ` +
    `L ${tw - r2} ${bot} Q ${tw - 1} ${bot} ${tw - 1} ${bot - r2} L ${tw} ${top + r1} C ${tw} ${top + r1 * 0.5} ${tw - 5} ${top + r1 * 0.18} ${sw} ${top} Z`;
};
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${ex - rx} ${ey} A ${rx} ${ry} 0 0 1 ${ex + rx} ${ey} L ${ex + w} ${y} L ${ex - w} ${y} Z`;
};
/** a sticking plaster: two crossed strips (local origin = centre) */
const Plaster: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => s > 0.01 ? (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    {[-28, 28].map((a) => <g key={a} transform={`rotate(${a})`}>
      <rect x={-27} y={-9} width={54} height={18} rx={8} fill={PLASTER} stroke={INK} strokeWidth={4} />
      <rect x={-9} y={-7} width={18} height={14} rx={3} fill={PLASTER_DK} />
      {[-18, 14].map((dx) => <circle key={dx} cx={dx} cy={0} r={1.8} fill={PLASTER_DK} />)}
    </g>)}
  </g>
) : null;

// ---------- his face ----------
type Mood = 'joy' | 'happy' | 'grin' | 'smug' | 'pop' | 'worry' | 'oof' | 'dazed' | 'focus' | 'grump';
const Face: React.FC<{t: number; m: Mood; look: P2}> = ({t, m, look}) => {
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (m === 'joy' || m === 'happy' || m === 'grin') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (m === 'oof') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = m === 'pop' ? 1.3 : m === 'worry' || m === 'dazed' ? 1.1 : 1;
    const rx = 12 * big, ry = 15 * big;
    const lid = m === 'focus' ? 0.34 : m === 'smug' ? 0.46 : m === 'grump' ? 0.44 : 0;
    const lk: P2 = m === 'dazed' ? [Math.sin(t * 9 + sd * 1.3), Math.cos(t * 9 + sd * 1.3)] : look;
    const px = ex + lk[0] * 4.5, py = ey + lk[1] * 5;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={px} cy={py + lid * 6} r={m === 'pop' ? 5 : 6.3} fill={INK} />
        <circle cx={px - 1.5} cy={py - 2 + lid * 6} r={2} fill="#fff" />
        {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brow = (sd: number) => {
    let d = `M ${sd * 12} -44 Q ${sd * 24} -52 ${sd * 37} -46`;
    if (m === 'focus') d = `M ${sd * 10} -34 L ${sd * 37} -42`;
    else if (m === 'oof') d = `M ${sd * 8} -32 L ${sd * 36} -44`;
    else if (m === 'grump') d = `M ${sd * 9} -33 L ${sd * 37} -41`;
    else if (m === 'worry' || m === 'dazed') d = `M ${sd * 10} -48 L ${sd * 36} -37`;
    else if (m === 'pop') d = `M ${sd * 12} -56 Q ${sd * 25} -66 ${sd * 38} -58`;
    else if (m === 'smug') d = sd < 0 ? `M -12 -40 L -37 -44` : `M 12 -50 Q 25 -60 38 -52`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  let mouth: React.ReactNode;
  if (m === 'joy') mouth = <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  else if (m === 'happy') mouth = <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  else if (m === 'grin') mouth = <g><path d="M -28 0 Q 0 6 28 0 Q 24 22 0 24 Q -24 22 -28 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><path d="M -26 8 Q 0 13 26 8" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (m === 'smug') mouth = <path d="M -20 10 Q 4 22 24 2" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (m === 'focus') mouth = <g><path d="M -15 9 Q 0 6 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /><path d="M 6 9 Q 12 22 18 10" fill="#E4677A" stroke={INK} strokeWidth={4} /></g>;
  else if (m === 'grump') mouth = <path d="M -16 14 Q 0 6 16 14" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (m === 'oof') mouth = <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (m === 'pop') mouth = <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;
  else mouth = <path d="M -18 10 q 6 -6 12 0 t 12 0 t 12 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;   // worry, dazed
  return <g>{eye(-1)}{eye(1)}{brow(-1)}{brow(1)}<g transform="translate(0 28)">{mouth}</g></g>;
};
/** his head as an X-ray: skull, eye sockets, nose, jaw with teeth; crack = the chin cracking (0..1) */
const SkullXR: React.FC<{crack: number}> = ({crack}) => (
  <g>
    <circle r={HEAD_R + 1} fill={XNAVY} stroke={INK} strokeWidth={6.5} />
    <path d="M -46 18 C -58 -30 -36 -56 0 -56 C 36 -56 58 -30 46 18 C 40 26 30 26 24 22 L -24 22 C -30 26 -40 26 -46 18 Z" fill={XFILL} stroke={XBONE} strokeWidth={4} strokeLinejoin="round" />
    {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 21} cy={-12} rx={13} ry={14} fill={XNAVY} stroke={XBONE} strokeWidth={3.5} />)}
    <path d="M -6 8 L 0 -2 L 6 8 Z" fill={XNAVY} stroke={XBONE} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -34 24 Q -36 52 0 58 Q 36 52 34 24" fill={XFILL} stroke={XBONE} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M -22 25 V 34 M -11 25 V 35 M 0 25 V 35 M 11 25 V 35 M 22 25 V 34" stroke={XBONE} strokeWidth={3} />
    {crack > 0.01 ? <g>
      <path d="M 0 60 L -5 50 L 4 42 L -3 32" stroke={RED} strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" style={pen(crack)} />
      <path d="M 2 58 L 14 52 M -2 58 L -15 54" stroke={RED} strokeWidth={4} fill="none" strokeLinecap="round" style={pen(crack)} />
      <circle cx={0} cy={60} r={14 * crack} fill="none" stroke={GOLD} strokeWidth={4} />
    </g> : null}
  </g>
);

// ---------- the guy: front view, hip at (x, y) ----------
type GS = {x: number; y: number; rot: number; sx: number; sy: number; top: number; neck: number; headX: number; shY: number;
  hA: P2; hB: P2; fA: P2; fB: P2; mood: Mood; look: P2; tilt: number; sq: number; band: number; xr: number; crack: number};
const STAND = {top: -112, neck: -165, shY: -90};
const CROUCH = {y: -46, top: -84, neck: -130, shY: -68, hA: [-36, 33] as P2, hB: [36, 33] as P2, fA: [-62, 32] as P2, fB: [62, 32] as P2};
const PLANT = {y: -78, top: -70, neck: 14, shY: -6, hA: [-122, 64] as P2, hB: [122, 64] as P2, fA: [-50, 63] as P2, fB: [50, 63] as P2};
const G0: GS = {x: -95, y: -80, rot: 0, sx: 1, sy: 1, top: STAND.top, neck: STAND.neck, headX: 0, shY: STAND.shY,
  hA: [-58, 60], hB: [58, 60], fA: [-26, 70], fB: [26, 70], mood: 'joy', look: [0, 0], tilt: 0, sq: 0, band: 0, xr: 0, crack: 0};
const Guy: React.FC<{t: number; g: GS}> = ({t, g}) => {
  const SA: P2 = [-38, g.shY], SB: P2 = [38, g.shY];
  const legs = [g.fA, g.fB].map((f, i) => ({S: [i ? 19 : -19, 4] as P2, H: f, sd: i ? -1 : 1}));
  const fy = Math.max(g.fA[1], g.fB[1]) + 14;
  const headT = `translate(${g.headX.toFixed(1)} ${g.neck.toFixed(1)}) rotate(${g.tilt.toFixed(2)}) scale(${(1 + 0.08 * g.sq).toFixed(3)} ${(1 - 0.1 * g.sq).toFixed(3)})`;
  const sdA = g.hA[1] > g.shY ? 1 : -1, sdB = g.hB[1] > g.shY ? -1 : 1;
  return (
    <W><g transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) translate(0 -55) rotate(${g.rot.toFixed(2)}) translate(0 55) translate(0 ${fy}) scale(${g.sx.toFixed(3)} ${g.sy.toFixed(3)}) translate(0 ${-fy})`}>
      {legs.map((l, i) => <Limb key={'l' + i} S={l.S} H={l.H} L={40} sd={l.sd} w={30} hand={false} />)}
      {legs.map((l, i) => <ellipse key={'f' + i} cx={l.H[0] + (i ? 2 : -2)} cy={l.H[1] + 5} rx={23} ry={9.5} fill={WHITE} stroke={INK} strokeWidth={6} />)}
      <path d={torsoD(47, g.top, 13)} fill={WHITE} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <Limb S={SA} H={g.hA} L={77} sd={sdA} />
      <Limb S={SB} H={g.hB} L={77} sd={sdB} />
      <g transform={headT}>
        <circle r={HEAD_R + 1} fill="url(#cFace)" stroke={INK} strokeWidth={6.5} />
        <Face t={t} m={g.mood} look={g.look} />
        <Plaster x={6} y={60} s={g.band * 0.9} rot={-4} />
        {g.xr > 0.01 ? <g opacity={g.xr}><SkullXR crack={g.crack} /></g> : null}
      </g>
    </g></W>
  );
};

// ---------- cats ----------
type Pal = {fur: string; st: string; lt: string; pink: string; face?: string};
const ORANGE: Pal = {fur: '#F2A33A', st: '#B9601A', lt: '#FFF0D9', pink: '#F49AA4'};
const PALS: Pal[] = [
  {fur: '#A9AFB8', st: '#6E757F', lt: '#E9ECF0', pink: '#F2A3AE'},   // grey
  {fur: '#3F3F48', st: '#26262D', lt: '#F4F1EA', pink: '#E68C9B'},   // tuxedo
  {fur: '#F4E6CC', st: '#D2B184', lt: '#FFFFFF', pink: '#F49AA4'},   // cream
  {fur: '#9A6B47', st: '#6B4630', lt: '#EBD3B6', pink: '#F0A0A8'},   // brown tabby
  {fur: '#F7F5F0', st: '#E8A04A', lt: '#FFFFFF', pink: '#F49AA4'},   // calico-ish
  {fur: '#55555F', st: '#33333B', lt: '#8A8A96', pink: '#E68C9B'},   // dark grey
  {fur: '#EFE3CF', st: '#6B4B3A', lt: '#FFF8EE', pink: '#E7949F'},   // siamese
  {fur: '#E9B270', st: '#B9772E', lt: '#FFF3E0', pink: '#F49AA4'},   // ginger
  {fur: '#C9C2B8', st: '#8E857A', lt: '#F3EFE9', pink: '#F2A3AE'},   // light tabby
];
// cat eye: almond with a pupil (pw 0 = slit, 1 = round)
const almond = (rx: number, ry: number) => {
  const a = (rx * 0.62).toFixed(1), b = (ry * 1.32).toFixed(1);
  return `M ${-rx} 0 C -${a} -${b} ${a} -${b} ${rx} 0 C ${a} ${b} -${a} ${b} ${-rx} 0 Z`;
};
type CMood = 'smug' | 'happy' | 'wide' | 'annoyed' | 'shock' | 'lick' | 'cross' | 'squeeze' | 'grin';
const CatEye: React.FC<{x: number; y: number; rx: number; ry: number; m: CMood; look: P2; sd: number; lidC: string; id: string; xr?: boolean}> = ({x, y, rx, ry, m, look, sd, lidC, id, xr}) => {
  if (m === 'happy' || m === 'lick' || m === 'grin') return <path d={`M ${x - rx} ${y + 5} Q ${x} ${y - ry * 0.95} ${x + rx} ${y + 5}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (m === 'squeeze') return <path d={`M ${x + sd * rx * 0.7} ${y - ry * 0.75} L ${x - sd * rx * 0.6} ${y} L ${x + sd * rx * 0.7} ${y + ry * 0.75}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const A = almond(rx, ry);
  const lid = m === 'smug' ? 0.45 : m === 'annoyed' ? 0.5 : 0;
  const lk: P2 = m === 'cross' ? [-sd * 0.9, 0.2] : look;
  const pw = m === 'shock' || m === 'wide' ? 0.9 : m === 'cross' ? 0.5 : 0.3;
  const prx = lerp(rx * 0.08, rx * 0.5, pw), pry = ry * lerp(0.98, 0.84, pw);
  const px = lk[0] * rx * 0.3, py = lk[1] * ry * 0.22;
  const ly = -ry * 1.05 + 2.1 * ry * lid;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs><clipPath id={id}><path d={A} /></clipPath></defs>
      <path d={A} fill={xr ? XFILL : '#B5D94A'} />
      <g clipPath={`url(#${id})`}>
        {xr ? null : <path d={A} fill="none" stroke="#7A9E2C" strokeWidth={rx * 0.32} opacity={0.6} />}
        <ellipse cx={px} cy={py} rx={prx} ry={pry} fill={xr ? XNAVY : INK} />
        <circle cx={px - rx * 0.3} cy={py - ry * 0.42} r={rx * 0.15} fill="#FFFFFF" />
        {lid > 0.01 ? <path d={`M ${-rx - 6} ${-ry * 2} H ${rx + 6} V ${ly.toFixed(1)} H ${-rx - 6} Z`} fill={lidC} /> : null}
        {lid > 0.01 ? <path d={`M ${-rx - 6} ${ly.toFixed(1)} H ${rx + 6}`} stroke={INK} strokeWidth={4.5} /> : null}
      </g>
      <path d={A} fill="none" stroke={xr ? XBONE : INK} strokeWidth={4.8} strokeLinejoin="round" />
    </g>
  );
};
/** the cat's head, front view, centre at 0,0 (radius ~66) */
const CatHead: React.FC<{p: Pal; m: CMood; look: P2; uid: string; band?: number; xr?: boolean; ear?: number; tongue?: number}> = ({p, m, look, uid, band = 0, xr = false, ear = 0, tongue = 0}) => {
  const fur = xr ? XFILL : p.fur, st = xr ? XLINE : p.st, lt = xr ? XFILL : p.lt, pink = xr ? XFILL : p.pink, ink = xr ? XBONE : INK;
  let mouth: React.ReactNode;
  if (m === 'shock') mouth = <ellipse cx={0} cy={31} rx={8} ry={10} fill="#5A2328" stroke={ink} strokeWidth={4} />;
  else if (m === 'annoyed' || m === 'cross') mouth = <path d="M -11 27 L 11 27" stroke={ink} strokeWidth={4} strokeLinecap="round" />;
  else if (m === 'smug') mouth = <path d="M -13 24 Q -6 31 0 24 Q 7 30 15 20" stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  else if (m === 'grin') mouth = <path d="M -17 22 Q -8 36 0 24 Q 8 36 17 22" stroke={ink} strokeWidth={4.5} fill="#5A2328" strokeLinecap="round" strokeLinejoin="round" />;
  else if (m === 'squeeze') mouth = <path d="M -14 28 Q 0 20 14 28" stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" />;
  else mouth = <path d="M -13 23 Q -6 31 0 23 Q 6 31 13 23" stroke={ink} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const brows = m === 'smug' ? 'M -42 -32 L -17 -30 M 16 -37 Q 28 -45 41 -38'
    : m === 'annoyed' ? 'M -42 -38 L -15 -28 M 15 -28 L 42 -38' : m === 'shock' ? 'M -41 -40 Q -28 -48 -15 -41 M 15 -41 Q 28 -48 41 -40' : '';
  return (
    <g>
      <path d="M -62 -24 L -52 -86 L -14 -50 Z" fill={fur} stroke={ink} strokeWidth={6.5} strokeLinejoin="round" /><path d="M -53 -36 L -48 -71 L -25 -50 Z" fill={pink} />
      <path d="M 62 -24 L 52 -86 L 14 -50 Z" fill={fur} stroke={ink} strokeWidth={6.5} strokeLinejoin="round" /><path d="M 53 -36 L 48 -71 L 25 -50 Z" fill={pink} />
      <path d="M -58 4 L -82 16 L -60 28 Z M 58 4 L 82 16 L 60 28 Z" fill={fur} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={0} cy={0} rx={66} ry={56} fill={fur} stroke={ink} strokeWidth={7} />
      <path d="M -12 -54 L -9 -38 M 0 -56 L 0 -39 M 12 -54 L 9 -38 M -65 -2 L -48 1 M -63 11 L -48 9 M 65 -2 L 48 1 M 63 11 L 48 9" stroke={st} strokeWidth={5.5} strokeLinecap="round" />
      <ellipse cx={-12} cy={20} rx={17} ry={13} fill={lt} /><ellipse cx={12} cy={20} rx={17} ry={13} fill={lt} />
      <CatEye x={-27} y={-6} rx={21} ry={17} sd={-1} m={m} look={look} lidC={fur} id={`ce${uid}l`} xr={xr} />
      <CatEye x={27} y={-6} rx={21} ry={17} sd={1} m={m} look={look} lidC={fur} id={`ce${uid}r`} xr={xr} />
      {brows && !xr ? <path d={brows} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
      <path d="M -8 9 L 8 9 L 0 18 Z" fill={xr ? XNAVY : pink} stroke={ink} strokeWidth={3.5} strokeLinejoin="round" />
      {mouth}
      {tongue > 0.01 ? <path d={`M -7 27 Q 0 ${27 + 18 * tongue} 7 27 Z`} fill="#E4677A" stroke={INK} strokeWidth={3} /> : null}
      {xr ? null : <path d="M -26 18 L -82 8 M -26 23 L -84 22 M -26 28 L -80 36 M 26 18 L 82 8 M 26 23 L 84 22 M 26 28 L 80 36" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />}
      <Plaster x={0} y={46} s={band * 0.8} rot={6} />
      {ear > 0.01 ? <g opacity={ear}>
        {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 44} -28)`}>
          <circle r={22} fill="none" stroke={GOLD} strokeWidth={4} opacity={0.5} />
          <path d="M -9 0 A 9 9 0 1 1 0 9 A 5 5 0 1 1 5 0" fill="none" stroke={GOLD} strokeWidth={5} strokeLinecap="round" />
        </g>)}
      </g> : null}
    </g>
  );
};

/** the cat sitting, front view, paws on the ground at (x, y) */
type CF = {x: number; y: number; s: number; p: Pal; m: CMood; look: P2; tilt: number; paw: number; pawTo: P2; band: number; tongue: number; sx?: number; sy?: number};
const CatFront: React.FC<{t: number; c: CF; uid: string}> = ({t, c, uid}) => {
  const {fur, st, lt} = c.p;
  const sw = 12 * Math.sin(t * 2.4);
  const tailPts = cbez([42, -20], [104, -8], [124 + sw * 0.4, -92], [92 + sw, -142]);
  const pw = c.paw > 0.01 ? eio(clamp(c.paw)) : 0;
  const pawRest: P2 = [20, -8], pawS: P2 = [20, -90];
  const pawP = lp2(pawRest, c.pawTo, pw);
  const pawD = quadD(pawS, lp2(pawS, pawP, 0.5), pawP);
  return (
    <W><g transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) scale(${(c.s * (c.sx ?? 1)).toFixed(3)} ${(c.s * (c.sy ?? 1)).toFixed(3)})`}>
      <path d={taper(tailPts, 22, 14)} fill={fur} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[0.42, 0.64, 0.86].map((u, i) => { const q = tailPts[Math.round(u * (tailPts.length - 1))]; return <circle key={i} cx={q[0]} cy={q[1]} r={5} fill={st} />; })}
      <ellipse cx={-50} cy={-30} rx={30} ry={32} fill={fur} stroke={INK} strokeWidth={6.5} />
      <ellipse cx={50} cy={-30} rx={30} ry={32} fill={fur} stroke={INK} strokeWidth={6.5} />
      <ellipse cx={0} cy={-68} rx={56} ry={68} fill={fur} stroke={INK} strokeWidth={7} />
      <path d="M -42 -100 Q -32 -92 -28 -78 M 42 -100 Q 32 -92 28 -78 M -52 -62 Q -42 -56 -38 -44 M 52 -62 Q 42 -56 38 -44" stroke={st} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-72} rx={28} ry={44} fill={lt} />
      {[-1, 1].map((sd) => (pw > 0.01 && sd === 1) ? null : <g key={sd}>
        <rect x={sd * 20 - 11} y={-80} width={22} height={76} rx={11} fill={fur} stroke={INK} strokeWidth={6} />
        <ellipse cx={sd * 20} cy={-6} rx={16} ry={9} fill={lt} stroke={INK} strokeWidth={4.5} />
      </g>)}
      <g transform={`translate(0 -158) rotate(${c.tilt.toFixed(2)})`}>
        <CatHead p={c.p} m={c.m} look={c.look} uid={uid} band={c.band} tongue={c.tongue} />
      </g>
      {pw > 0.01 ? <g>
        <path d={pawD} stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d={pawD} stroke={fur} strokeWidth={15} fill="none" strokeLinecap="round" />
        <circle cx={pawP[0]} cy={pawP[1]} r={15} fill={lt} stroke={INK} strokeWidth={4.5} />
        <path d={`M ${pawP[0] - 6} ${pawP[1] - 12} v 7 M ${pawP[0] + 1} ${pawP[1] - 14} v 7 M ${pawP[0] + 8} ${pawP[1] - 12} v 7`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      </g> : null}
    </g></W>
  );
};

/**
 * The cat in profile, facing left (face = 1 mirrors it to face right), origin on the ground under its middle.
 * fyF / fyB = how far the front / back half has turned over (-1 belly up .. 1 belly down): the famous twist, front half
 * first. legs: 'stand' | 'reach' (in the air, paws stretched down) | 'run'. crouch 0..1 bends the legs and lowers the body;
 * chin 0..1 brings the head down until the chin is on the ground. xr = drawn as an X-ray (bones, inner ear glow).
 */
type CSd = {x: number; y: number; s: number; face: 1 | -1; p: Pal; fyF: number; fyB: number; legs: 'stand' | 'reach' | 'run'; crouch: number; chin: number;
  m: CMood; look: P2; rot: number; ph: number; sx?: number; sy?: number; ear?: number};
const SIDE0: Omit<CSd, 'x' | 'y'> = {s: 1, face: 1, p: ORANGE, fyF: 1, fyB: 1, legs: 'stand', crouch: 0, chin: 0, m: 'smug', look: [-0.6, 0], rot: 0, ph: 0};
const CatSide: React.FC<{t: number; c: CSd; uid: string; xr?: boolean}> = ({t, c, uid, xr = false}) => {
  const fur = xr ? XFILL : c.p.fur, st = xr ? XLINE : c.p.st, lt = xr ? '#3A4A96' : c.p.lt, ink = xr ? XLINE : INK;
  const H = c.legs === 'reach' ? 74 : 62 - 30 * c.crouch;               // spine height above the paws
  const sy0 = -H;
  // legs: hip (on the body) -> paw; elbows / hocks bend backwards (+x)
  const run = c.legs === 'run' ? Math.sin(c.ph) : 0;
  const legDef = (front: boolean, near: boolean): {S: P2; F: P2} => {
    const hxp = front ? (near ? -44 : -28) : (near ? 40 : 56);
    const S: P2 = [hxp, sy0 + 16];
    let F: P2;
    if (c.legs === 'reach') F = [hxp + (front ? -14 : 12), sy0 + 84];
    else if (c.legs === 'run') {
      const k = front ? run : -run;
      F = [hxp + (front ? -40 : 40) * k + (near ? 6 : -6), -4 - 22 * Math.max(0, -k * (near ? 1 : 0.7))];
    } else F = [hxp + (front ? -4 : 4), 0];
    return {S, F};
  };
  const leg = (front: boolean, near: boolean) => {
    const {S, F} = legDef(front, near);
    const L = 34, E = ik(S, F, L, L, front ? -1 : 1);
    const d = quadD(S, E, F);
    const col = near ? fur : mixC(fur, INK, 0.18);
    return (
      <g key={(front ? 'f' : 'b') + (near ? 'n' : 'r')}>
        <path d={d} stroke={ink} strokeWidth={25} fill="none" strokeLinecap="round" />
        <path d={d} stroke={col} strokeWidth={13} fill="none" strokeLinecap="round" />
        {xr ? <path d={quadD(S, E, F)} stroke={XBONE} strokeWidth={3.5} fill="none" strokeLinecap="round" /> : null}
        <ellipse cx={F[0]} cy={F[1] - 2} rx={14} ry={8} fill={near ? lt : mixC(lt, INK, 0.12)} stroke={ink} strokeWidth={4.5} />
      </g>
    );
  };
  // halves turn over about the spine line
  const half = (fy: number) => `translate(0 ${sy0}) scale(1 ${fy.toFixed(3)}) translate(0 ${-sy0})`;
  const sw = 10 * Math.sin(t * 3 + c.x * 0.01);
  const tailPts = c.legs === 'run'
    ? cbez([64, sy0 - 4], [110, sy0 - 20], [150, sy0 - 34], [182, sy0 - 30])
    : cbez([64, sy0 - 4], [112, sy0 - 18 + sw * 0.3], [124 + sw * 0.4, sy0 - 84], [98 + sw, sy0 - 124]);
  // head: above the front of the spine, rotated with the front half; chin brings it to the ground
  const headUp: P2 = [-80, sy0 - 38];
  const headDown: P2 = [-96, -40];
  const hp = lp2(headUp, headDown, eio(clamp(c.chin)));
  const hy = sy0 + (hp[1] - sy0) * c.fyF;
  const hAng = (1 - c.fyF) * 90;
  const hs = 0.74;
  const spineDots = Array.from({length: 13}, (_, i) => -56 + i * 10.5);
  const twist = Math.abs(c.fyF - c.fyB);
  return (
    <W><g transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) rotate(${c.rot.toFixed(2)} 0 ${sy0}) scale(${(c.s * c.face * -1 * (c.sx ?? 1)).toFixed(3)} ${(c.s * (c.sy ?? 1)).toFixed(3)}) scale(-1 1)`}>
      {/* far legs */}
      <g transform={half(c.fyB)}>{leg(false, false)}</g>
      <g transform={half(c.fyF)}>{leg(true, false)}</g>
      {/* tail */}
      <g transform={half(c.fyB)}>
        <path d={taper(tailPts, 20, 12)} fill={fur} stroke={ink} strokeWidth={6} strokeLinejoin="round" />
        {xr ? null : [0.45, 0.68, 0.9].map((u, i) => { const q = tailPts[Math.round(u * (tailPts.length - 1))]; return <circle key={i} cx={q[0]} cy={q[1]} r={4.5} fill={st} />; })}
      </g>
      {/* body */}
      <ellipse cx={0} cy={sy0} rx={76} ry={34} fill={fur} stroke={ink} strokeWidth={7} />
      <g transform={half(c.fyF)}><path d={`M -62 ${sy0 + 14} Q -30 ${sy0 + 34} 0 ${sy0 + 33} L 0 ${sy0 + 22} Q -30 ${sy0 + 22} -58 ${sy0 + 8} Z`} fill={lt} />
        {xr ? null : <path d={`M -34 ${sy0 - 30} q 4 12 0 22`} stroke={st} strokeWidth={6} fill="none" strokeLinecap="round" />}</g>
      <g transform={half(c.fyB)}><path d={`M 0 ${sy0 + 33} Q 34 ${sy0 + 33} 62 ${sy0 + 14} L 58 ${sy0 + 8} Q 30 ${sy0 + 22} 0 ${sy0 + 22} Z`} fill={lt} />
        {xr ? null : [4, 32].map((x) => <path key={x} d={`M ${x} ${sy0 - 33} q 4 12 0 22`} stroke={st} strokeWidth={6} fill="none" strokeLinecap="round" />)}</g>
      {xr ? <g>
        {spineDots.map((x, i) => <circle key={i} cx={x} cy={sy0 - 6} r={4.6} fill={XBONE} />)}
        {twist > 0.15 ? <path d={`M -14 ${sy0 - 24} C -4 ${sy0 - 24} 4 ${sy0 + 24} 14 ${sy0 + 24} M -14 ${sy0 + 24} C -4 ${sy0 + 24} 4 ${sy0 - 24} 14 ${sy0 - 24}`}
          stroke={GOLD} strokeWidth={5} fill="none" strokeLinecap="round" opacity={clamp(twist)} /> : null}
      </g> : null}
      {/* near legs */}
      <g transform={half(c.fyB)}>{leg(false, true)}</g>
      <g transform={half(c.fyF)}>{leg(true, true)}</g>
      {/* head (front view, turned with the front half) */}
      <g transform={`translate(${hp[0].toFixed(1)} ${hy.toFixed(1)}) rotate(${hAng.toFixed(1)}) scale(${hs})`}>
        <g transform="scale(-1 1)"><CatHead p={c.p} m={c.m} look={[-c.look[0], c.look[1]]} uid={uid} xr={xr} ear={c.ear ?? 0} /></g>
      </g>
    </g></W>
  );
};

// ---------- the high-rise ----------
const WIN_W = 150, WIN_H = 196, COLS = [-560, -280, 0, 280, 560], ROW0 = -420, ROW_DY = 330;
const Window: React.FC<{x: number; y: number; seed: number; open?: number}> = ({x, y, seed, open = 0}) => {
  const r = rnd(seed), curtain = r < 0.35 ? '#F28C8C' : r < 0.6 ? '#FFD966' : '';
  const box = rnd(seed * 3.1) < 0.3;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-WIN_W / 2 - 12} y={-WIN_H / 2 - 12} width={WIN_W + 24} height={WIN_H + 24} rx={6} fill={TRIM} stroke={INK} strokeWidth={5} />
      <rect x={-WIN_W / 2} y={-WIN_H / 2} width={WIN_W} height={WIN_H} fill={open ? '#3B4A63' : GLASS} stroke={INK} strokeWidth={4} />
      {open ? null : <path d={`M ${-WIN_W / 2 + 18} ${WIN_H / 2 - 30} L ${-WIN_W / 2 + 60} ${-WIN_H / 2 + 20}`} stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.7} />}
      {curtain && !open ? <path d={`M ${-WIN_W / 2} ${-WIN_H / 2} h 44 q -14 70 -6 ${WIN_H} h -38 Z M ${WIN_W / 2} ${-WIN_H / 2} h -44 q 14 70 6 ${WIN_H} h 38 Z`} fill={curtain} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      <path d={`M 0 ${-WIN_H / 2} V ${WIN_H / 2} M ${-WIN_W / 2} -8 H ${WIN_W / 2}`} stroke={open ? '#2A3448' : TRIM} strokeWidth={9} />
      <rect x={-WIN_W / 2 - 22} y={WIN_H / 2 + 8} width={WIN_W + 44} height={16} rx={5} fill={SILL} stroke={INK} strokeWidth={5} />
      {box ? <g><rect x={-WIN_W / 2 + 4} y={WIN_H / 2 - 16} width={WIN_W - 8} height={26} rx={5} fill="#B9784A" stroke={INK} strokeWidth={4.5} />
        {[-50, -25, 0, 25, 50].map((fx, i) => <g key={i}><path d={`M ${fx} ${WIN_H / 2 - 16} v -14`} stroke="#4F8A3A" strokeWidth={4} />
          <circle cx={fx} cy={WIN_H / 2 - 32} r={8} fill={i % 2 ? '#F28C8C' : '#FFD966'} stroke={INK} strokeWidth={3} /></g>)}</g> : null}
    </g>
  );
};
/** the wall with windows between world y0 (top) and y1 (bottom); open = a set of [col, row] windows shown dark/open */
const Facade: React.FC<{y0: number; y1: number; open?: string[]}> = ({y0, y1, open = []}) => {
  const rows: number[] = [];
  for (let r = 0; r < 40; r++) { const y = ROW0 - r * ROW_DY; if (y < y0 - 200) break; if (y < y1 + 200) rows.push(r); }
  const top = Math.min(y0 - 300, -400), bh = -30 - top;
  return (
    <W><g>
      <rect x={-1400} y={top} width={2800} height={bh} fill={WALL} />
      {Array.from({length: Math.ceil(bh / 110)}, (_, i) => {
        const y = top + i * 110 + 50;
        if (y < y0 - 120 || y > y1 + 120) return null;
        return [0, 1, 2, 3, 4, 5].map((j) => { const x = -1200 + ((j * 460 + i * 170) % 2400); return <path key={i + '_' + j} d={`M ${x} ${y} h 64 M ${x + 30} ${y + 40} h 64`} stroke={BRICK} strokeWidth={8} strokeLinecap="round" />; });
      })}
      {rows.map((r) => COLS.map((cx, ci) => <Window key={r + '_' + ci} x={cx} y={ROW0 - r * ROW_DY} seed={r * 7 + ci * 13 + 1} open={open.includes(`${ci},${r}`) ? 1 : 0} />))}
      <rect x={-1400} y={-110} width={2800} height={80} fill={PLINTH} stroke={INK} strokeWidth={6} />
    </g></W>
  );
};
const Street: React.FC = () => (
  <W><g>
    <rect x={-1400} y={-30} width={2800} height={330} fill={PAVE} />
    <path d="M -1400 -30 H 1400" stroke={INK} strokeWidth={6} />
    {Array.from({length: 14}, (_, i) => <path key={i} d={`M ${-1300 + i * 200} -30 L ${-1340 + i * 200} 300`} stroke={PAVE_DK} strokeWidth={5} />)}
    <path d="M -1400 120 H 1400" stroke={PAVE_DK} strokeWidth={5} />
    <rect x={-1400} y={300} width={2800} height={40} fill={CURB} stroke={INK} strokeWidth={6} />
    <rect x={-1400} y={340} width={2800} height={900} fill={STREET} />
  </g></W>
);
/** cracks in the pavement radiating from (x, y), drawn in over p 0..1 */
const Cracks: React.FC<{x: number; y: number; p: number; s?: number}> = ({x, y, p, s = 1}) => p > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    {['M 0 0 L -30 8 L -52 4 L -80 14', 'M 0 0 L 28 10 L 50 6 L 84 16', 'M 0 0 L -12 22 L -30 36', 'M 0 0 L 16 24 L 12 44', 'M -52 4 L -60 -6'].map((d, i) =>
      <path key={i} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinejoin="round" strokeLinecap="round" style={pen(p)} />)}
  </g></W>
) : null;
/** the fire escape: a top landing and one flight of stairs down to the left, a handrail on the wall */
const STAIR_TOP: P2 = [160, -560], STEP_DX = -60, STEP_DY = 57.5, N_STEPS = 8;
/** the handrail's height at world x (it runs 150 above the treads, 10 to the right) */
const railY = (x: number) => (x > STAIR_TOP[0] + 10 ? STAIR_TOP[1] - 150 : STAIR_TOP[1] - 150 + (STAIR_TOP[0] + 10 - x) * STEP_DY / -STEP_DX);
const stepPt = (i: number): P2 => [STAIR_TOP[0] + STEP_DX * i + STEP_DX / 2 + 4, STAIR_TOP[1] + STEP_DY * i];   // feet on step i (0 = landing edge)
const FireEscape: React.FC = () => {
  const [x0, y0] = STAIR_TOP;
  const steps = Array.from({length: N_STEPS}, (_, i) => i + 1);
  const xb = x0 + STEP_DX * N_STEPS, yb = y0 + STEP_DY * N_STEPS;
  return (
    <W><g>
      {/* handrail on the wall */}
      <path d={`M ${x0 + 200} ${y0 - 150} L ${x0 + 10} ${y0 - 150} L ${xb + 10} ${yb - 150}`} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${x0 + 200} ${y0 - 150} L ${x0 + 10} ${y0 - 150} L ${xb + 10} ${yb - 150}`} stroke={METAL_LT} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {[x0 + 150, x0 + 40, x0 - 160, x0 - 360].map((x, i) => { const y = x > x0 ? y0 - 150 : y0 - 150 + (x0 - x) * STEP_DY / -STEP_DX;
        return <rect key={i} x={x - 6} y={y - 4} width={12} height={22} rx={3} fill={METAL} stroke={INK} strokeWidth={3} />; })}
      {/* top landing (grating) */}
      <rect x={x0} y={y0 - 4} width={300} height={22} fill={METAL} stroke={INK} strokeWidth={5} />
      {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${x0 + 20 + i * 32} ${y0} v 14`} stroke={METAL_LT} strokeWidth={4} />)}
      {/* stringer */}
      <path d={`M ${x0 + 10} ${y0 + 18} L ${xb + 10} ${yb + 18} L ${xb + 10} ${yb + 44} L ${x0 + 10} ${y0 + 44} Z`} fill={METAL} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {steps.map((i) => { const x = x0 + STEP_DX * i, y = y0 + STEP_DY * i;
        return <g key={i}><rect x={x} y={y - 4} width={-STEP_DX + 6} height={14} rx={3} fill={METAL_LT} stroke={INK} strokeWidth={4.5} />
          <path d={`M ${x + 6} ${y + 10} V ${y + STEP_DY - 6}`} stroke={METAL} strokeWidth={5} /></g>; })}
      {/* bottom landing */}
      <rect x={xb - 300} y={yb + 54} width={330} height={22} fill={METAL} stroke={INK} strokeWidth={5} />
    </g></W>
  );
};

// ---------- X-RAY: the cat turns over (screen space) ----------
const XRayCat: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 370, K = 2.5, GF = 40 * K;
  const fyF = lerp(-1, 1, eio(seg(t, TW1, TW1 + 0.32))), fyB = lerp(-1, 1, eio(seg(t, TW2, TW2 + 0.32)));
  const reach = t > TW2 + 0.2;
  const groundY = lerp(420, GF, eio(seg(t, XLAND - 0.36, XLAND)));     // the floor rises to the paws
  const land = t >= XLAND ? 1 : 0;
  const sq = land ? spring(t, XLAND, 0.14, 2.6, 7) : 0;
  const ear = popIn(t, EAR, 0.25) * (1 - seg(t, TW1 + 0.6, TW1 + 0.9));
  const c: CSd = {...SIDE0, x: 0, y: 40, s: 1, face: -1, fyF, fyB, legs: land ? 'stand' : reach ? 'reach' : 'stand', crouch: land ? clamp(0.5 - sq * 2) : 0,
    chin: 0, m: 'wide', look: [0, 1], rot: 0, ph: 0, ear, sy: 1 - sq, sx: 1 + sq * 0.6};
  return (
    <div style={{position: 'absolute', left: 540, top: 1040, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <defs><clipPath id="xcclip"><circle r={R} /></clipPath></defs>
        <circle r={R + 22} fill={INK} />
        <g clipPath="url(#xcclip)">
          <circle r={R} fill={XNAVY} />
          {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${-400 + i * 100} -400 V 400 M -400 ${-400 + i * 100} H 400`} stroke="#252F66" strokeWidth={3} />)}
          {/* falling: speed lines streaming up */}
          {t < XLAND ? Array.from({length: 7}, (_, i) => { const x = -300 + i * 100 + 30 * Math.sin(i * 2.3), y = 420 - ((t * 900 + i * 170) % 900);
            return <path key={'s' + i} d={`M ${x} ${y} v 90`} stroke="#5A6CB8" strokeWidth={7} strokeLinecap="round" />; }) : null}
          <g transform={`translate(-10 -40) scale(${K})`}>
            <path d={`M -200 ${groundY / K} H 200`} stroke={XLINE} strokeWidth={3} />
            <rect x={-200} y={groundY / K} width={400} height={300} fill="#1C2556" />
            <CatSide t={t} c={{...c, y: land ? groundY / K : 30}} uid="xc" xr />
          </g>
          {ear > 0.05 ? <g opacity={ear}>
            <path d="M 255 40 v 90 M 229 104 L 255 132 L 281 104" stroke={GOLD} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g> : null}
          <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.2} />
        </g>
        <circle r={R} fill="none" stroke="#8C98AE" strokeWidth={22} />
        <circle r={R + 14} fill="none" stroke={INK} strokeWidth={6} />
      </svg>
      <Card text="X-RAY: CAT" top={92} size={50} />
      <Card text="INNER EAR" top={790} left={600} color={GOLD} rot={5} s={popIn(t, EAR + 0.04, 0.26) * inS(t, EAR, 4.62)} size={56} />
      <Card text="TWIST" top={250} left={620} color="#FFFFFF" rot={-5} s={popIn(t, TW1 + 0.04, 0.26) * inS(t, TW1, XLAND - 0.3)} size={62} />
      <Card text="PAWS DOWN" top={790} left={450} color={GOLD} rot={-5} s={popIn(t, T.paws, 0.26) * inS(t, T.paws, S4)} size={58} />
    </div>
  );
};

// ---------- the story over time ----------
const GX = -95;
const blendG = (a: Partial<GS>, b: Partial<GS>, u: number): Partial<GS> => {
  const o: any = {};
  for (const k of Object.keys(b) as (keyof GS)[]) {
    const va: any = (a as any)[k], vb: any = (b as any)[k];
    if (typeof vb === 'number' && typeof va === 'number') o[k] = lerp(va, vb, u);
    else if (Array.isArray(vb) && Array.isArray(va)) o[k] = lp2(va as P2, vb as P2, u);
    else o[k] = u < 0.5 ? va : vb;
  }
  return o;
};
const fallY = (t: number) => -80 - 2400 * Math.max(0, LAND - t);          // his hip while falling (feet reach the ground at LAND)
const guyAt = (t: number): GS => {
  const g: GS = {...G0};
  if (t < LAND) {
    // falling, flipping over (frame 0: nearly upside down, already turning)
    g.y = fallY(t);
    g.rot = lerp(160, 0, eout(seg(t, 0, 0.5)));
    const fl = 1 - seg(t, 0.36, 0.5);
    g.hA = lp2([-100, -60], [-112, -20], 1 - fl); g.hB = lp2([100, -60], [112, -20], 1 - fl);
    g.hA = add(g.hA, [14 * Math.sin(t * 21) * fl, 20 * Math.sin(t * 17) * fl]); g.hB = add(g.hB, [14 * Math.sin(t * 19 + 1) * fl, 20 * Math.sin(t * 15 + 2) * fl]);
    g.fA = [-28 + 10 * Math.sin(t * 18) * fl, 72]; g.fB = [28 + 10 * Math.sin(t * 18 + 2) * fl, 72 - 8 * fl];
    g.mood = 'joy'; g.look = [0.6, 0.4];
    return g;
  }
  if (t < S3) {
    // the landing, the wobble, the drop and the face plant
    const crouch: Partial<GS> = {...CROUCH};
    let base: Partial<GS> = crouch;
    if (t >= WOB0) {
      const u = seg(t, WOB0, DROP0), tr = Math.sin(t * 46) * u;
      base = {...crouch, shY: lerp(CROUCH.shY, -52, u) + 4 * tr, neck: lerp(CROUCH.neck, -112, u) + 6 * tr, top: lerp(CROUCH.top, -74, u),
        hA: add(CROUCH.hA, [-6 * u, 0]), hB: add(CROUCH.hB, [6 * u, 0])};
    }
    if (t >= DROP0) {
      const u = eio(seg(t, DROP0, IMPACT));
      const wobEnd: Partial<GS> = {...crouch, shY: -52, neck: -112, top: -74, hA: add(CROUCH.hA, [-6, 0]), hB: add(CROUCH.hB, [6, 0])};
      base = blendG(wobEnd, {...PLANT}, u);
    }
    Object.assign(g, base);
    g.x = GX;
    const ls = spring(t, LAND, 0.13, 2.4, 7);
    g.sy = 1 - ls; g.sx = 1 + 0.6 * ls;
    g.mood = t < 0.95 ? 'joy' : t < WOB0 ? 'smug' : t < DROP0 ? 'worry' : t < IMPACT ? 'pop' : t < 2.3 ? 'oof' : 'dazed';
    g.look = t < 0.95 ? [0, 0.3] : t < WOB0 ? [1, -0.1] : [0, 1];
    if (t >= IMPACT) g.sq = hit(t, IMPACT, 1.1, 6);
    g.xr = t >= IMPACT && t < XR_OFF ? 1 : 0;
    g.crack = seg(t, IMPACT + 0.02, IMPACT + 0.14);
    return g;
  }
  if (t < S6) {
    // stuck in the face plant (S3, S4); the smug cat drops onto him at TENTH_HIT
    Object.assign(g, PLANT); g.x = GX;
    g.mood = t >= TENTH_HIT && t < TENTH_HIT + 0.45 ? 'oof' : 'dazed';
    g.sq = hit(t, TENTH_HIT, 0.9, 7);
    return g;
  }
  if (t < S7) {
    // sitting up, plaster on the chin
    g.x = -100; g.y = -22; g.fA = [-44, 20]; g.fB = [44, 20]; g.hA = [-84, 10]; g.hB = [84, 10];
    g.band = 1; g.mood = t < 14.5 ? 'grump' : 'worry'; g.look = t < 14.5 ? [1, 0] : [0.2, 0.2];
    g.tilt = 4;
    return g;
  }
  // the stairs: one step every ~0.36 s, then the trip
  let k = 0; for (let i = 0; i < STEPS.length; i++) if (t >= STEPS[i]) k = i + 1;
  const ki = Math.min(k, STEPS.length);
  const u = ki > 0 ? eio(seg(t, STEPS[ki - 1], STEPS[ki - 1] + 0.22)) : 0;
  const from = stepPt(Math.max(0, ki - 1)), to = stepPt(ki);
  const feet = ki > 0 ? lp2(from, to, u) : stepPt(0);
  const bob = ki > 0 ? -16 * Math.sin(Math.PI * u) : 0;
  g.x = feet[0]; g.y = feet[1] - 84 + bob;
  const rx = g.x - 66; g.hA = [rx - g.x, railY(rx) - g.y]; g.hB = [64, 40 + 6 * Math.sin(t * 6)];
  g.mood = 'focus'; g.look = [-0.4, 1];
  g.fA = [-24, 70 - 8 * Math.sin(Math.PI * u)]; g.fB = [24, 70];
  if (t >= TRIP) {
    const v = seg(t, TRIP, PUSH + 0.5);
    g.rot = -150 * eio(v);
    g.x = feet[0] - 160 * v; g.y = feet[1] - 84 + 700 * v * v - 60 * Math.sin(Math.PI * Math.min(1, v * 2));
    g.hA = [-110, -60 + 20 * Math.sin(t * 20)]; g.hB = [110, -60 + 20 * Math.sin(t * 18)];
    g.fA = [-30, 60]; g.fB = [30, 46];
    g.mood = 'pop'; g.look = [0, -0.6];
  }
  return g;
};

// the smug cat (orange): profile while it falls and lands, then front view sitting
const catSideAt = (t: number): CSd | null => {
  if (t < CAT_SWAP) {
    const y = t < CAT_LAND ? -2400 * (CAT_LAND - t) : 0;
    const fyF = lerp(-1, 1, eio(seg(t, 0.02, 0.24))), fyB = lerp(-1, 1, eio(seg(t, 0.16, 0.4)));
    const land = t >= CAT_LAND;
    const sq = land ? spring(t, CAT_LAND, 0.16, 2.4, 7) : 0;
    const sw = t > CAT_SWAP - 0.08 ? 1 - 0.22 * seg(t, CAT_SWAP - 0.08, CAT_SWAP) : 1;
    return {...SIDE0, x: 118, y, s: 1.05, face: 1, fyF, fyB, legs: land ? 'stand' : t > 0.4 ? 'reach' : 'stand', crouch: land ? clamp(0.55 - sq * 2.5) : 0,
      m: t < 0.4 ? 'wide' : 'smug', look: [-1, 0.2], sy: 1 - sq, sx: (1 + sq * 0.6) * sw};
  }
  return null;
};
const catFrontAt = (t: number): CF | null => {
  const base: CF = {x: 110, y: 0, s: 0.86, p: ORANGE, m: 'smug', look: [-1, 0.1], tilt: -4, paw: 0, pawTo: [40, -150], band: 0, tongue: 0};
  if (t < CAT_SWAP) return null;
  if (t < S2) { const sw = 1 - 0.22 * (1 - seg(t, CAT_SWAP, CAT_SWAP + 0.08)); return {...base, sx: sw, look: t < 1.5 ? [-1, 0.1] : [-1, 0.6]}; }
  if (t < S3) return {...base, x: 12, s: 0.95, look: [-1, 0.7], m: t < 2.55 ? 'smug' : 'grin', tilt: -8};
  if (t < S4) {
    // licks its paw while the X-ray plays
    const lick = 0.5 + 0.5 * Math.sin((t - S3) * 7);
    return {...base, m: 'lick', paw: 1, pawTo: [18, -172 + 6 * lick], tongue: 0.7 + 0.3 * lick, tilt: 6};
  }
  if (t >= S6 && t < S7) {
    // plaster on the chin, rubbing it
    const rub = Math.sin((t - S6) * 9);
    return {...base, x: 105, s: 0.9, m: t < 14.5 ? 'annoyed' : 'smug', look: t < 14.5 ? [-1, 0] : [-0.2, 0.2], band: 1, paw: 1, pawTo: [16 + 8 * rub, -128], tilt: -6};
  }
  return null;
};

// nine cats out of the windows: [window column x, window row, landing x, landing y (0 = by the wall, 175 = the front of the
// pavement), palette, facing (1 = left)]
const RAIN: [number, number, number, number, number, 1 | -1][] = [
  [-280, 1, -290, 6, 0, 1], [0, 0, 60, 6, 1, -1], [280, 1, 175, 6, 2, -1], [-280, 0, -400, 6, 3, 1], [0, 2, -100, 175, 4, -1],
  [-560, 1, -360, 175, 5, 1], [280, 0, 160, 175, 6, -1], [-280, 2, -230, 175, 7, 1], [0, 1, 30, 175, 8, -1],
];
const RAIN_S = 0.62;
const rainCat = (i: number, t: number): CSd | null => {
  const [cx, row, lx, ly, pi, face] = RAIN[i];
  const t0 = RAIN0 + i * RAIN_DT, t1 = t0 + RAIN_FALL;
  if (t < t0) return null;
  const wy = ROW0 - row * ROW_DY + 60;
  const u = seg(t, t0, t1);
  const land = t >= t1;
  const x = lerp(cx, lx, u), y = land ? ly : lerp(wy, ly, u * u);
  const fyF = lerp(-1, 1, eio(seg(u, 0.1, 0.55))), fyB = lerp(-1, 1, eio(seg(u, 0.3, 0.75)));
  const sq = land ? spring(t, t1, 0.16, 2.6, 7) : 0;
  return {...SIDE0, x, y, s: RAIN_S, face, p: PALS[pi], fyF, fyB, legs: land ? 'stand' : u > 0.6 ? 'reach' : 'stand', crouch: land ? clamp(0.4 - sq * 2.5) : 0,
    m: land ? 'smug' : 'wide', look: [face * 0.6, 0.2], sy: 1 - sq, sx: 1 + sq * 0.6, rot: land ? 0 : 0};
};
const rainLanded = (t: number) => RAIN.reduce((n, _, i) => n + (t >= RAIN0 + i * RAIN_DT + RAIN_FALL ? 1 : 0), 0);
// the tenth: the smug cat drops out of a window onto his head
const tenthAt = (t: number): CSd | null => {
  if (t < TENTH0 - 0.3 || t >= S5) return null;
  const head: P2 = [GX, -64 - 60];
  const wy = ROW0 - 1 * ROW_DY + 60;
  if (t < TENTH0) return {...SIDE0, x: -280, y: wy, s: 0.6, face: 1, legs: 'stand', m: 'smug', look: [0.4, 0.6]};
  const u = seg(t, TENTH0, TENTH_HIT);
  const land = t >= TENTH_HIT;
  const fyF = lerp(-1, 1, eio(seg(u, 0.1, 0.5))), fyB = lerp(-1, 1, eio(seg(u, 0.25, 0.7)));
  const sq = land ? spring(t, TENTH_HIT, 0.18, 2.6, 7) : 0;
  return {...SIDE0, x: land ? head[0] : lerp(-280, head[0], u), y: land ? head[1] : lerp(wy, head[1], u * u), s: 0.6, face: 1, fyF: land ? 1 : fyF, fyB: land ? 1 : fyB,
    legs: land ? 'stand' : u > 0.55 ? 'reach' : 'stand', crouch: land ? clamp(0.4 - sq * 2) : 0, m: land ? 'smug' : 'wide', look: [0.6, 0.4], sy: 1 - sq, sx: 1 + sq * 0.6};
};
// slow motion: the smug cat lands, its legs give, the chin taps the ground
const SL_X = 90;
const slowAt = (t: number): CSd => {
  const y = t < SL_TOUCH ? -150 * (1 - seg(t, S5, SL_TOUCH)) : 0;
  const cr = t < SL_TOUCH ? 0 : eout(seg(t, SL_TOUCH, SL_CHIN - 0.1));
  const chin = t < SL_TOUCH + 0.4 ? 0 : t < SL_CHIN ? eio(seg(t, SL_TOUCH + 0.4, SL_CHIN)) : 1 - eio(seg(t, SL_UP, SL_UP + 0.5)) * 0.85;
  const m: CMood = t < SL_CHIN ? 'wide' : t < SL_UP ? 'cross' : 'annoyed';
  return {...SIDE0, x: SL_X, y, s: 1.55, face: 1, legs: t < SL_TOUCH ? 'reach' : 'stand', crouch: cr * 1.0, chin, m, look: t < SL_UP ? [-0.4, 0.8] : [0.3, 0.2]};
};
// the dash down the stairs
const dashAt = (t: number): CSd | null => {
  if (t < DASH0 || t > DASH1) return null;
  const u = seg(t, DASH0, DASH1);
  const x = lerp(STAIR_TOP[0] + 240, STAIR_TOP[0] + STEP_DX * 9, u);
  const along = clamp((STAIR_TOP[0] - x) / -STEP_DX, 0, 9);
  const y = x > STAIR_TOP[0] ? STAIR_TOP[1] : STAIR_TOP[1] + along * STEP_DY;
  return {...SIDE0, x, y: y - 4, s: 0.62, face: -1, legs: 'run', ph: t * 40, m: 'grin', look: [-1, 0], rot: x > STAIR_TOP[0] ? 0 : -38};
};

type CK = {x: number; y: number; k: number};
const camFor = (t: number): CK => {
  if (t < LAND) return {x: -5, y: fallY(t) - 60, k: 2.3};
  if (t < S2) { const u = eio(seg(t, LAND + 0.05, 1.4)); return {x: lerp(-5, 2, u), y: lerp(-140, -124, u), k: lerp(2.3, 2.6, u)}; }
  if (t < S3) { const u = eio(seg(t, S2, S3)); return {x: lerp(-82, -72, u), y: lerp(-92, -100, u), k: lerp(3.75, 3.85, u)}; }
  if (t < S4) return {x: 6, y: -150, k: lerp(2.25, 2.32, seg(t, S3, S4))};
  if (t < S5) { const u = eio(seg(t, S4, S4 + 1.2)); return {x: -80, y: lerp(-250, -275, u), k: lerp(1.56, 1.5, u)}; }
  if (t < S6) return {x: lerp(-4, -14, seg(t, S5, S6)), y: -130, k: lerp(2.85, 3.0, seg(t, S5, S6))};
  if (t < S7) return {x: 0, y: -118, k: lerp(2.6, 2.7, seg(t, S6, S7))};
  return {x: 40, y: lerp(-600, -540, eio(seg(t, S7, PUSH))), k: 2.1};
};

export const CatScene: React.FC<{t: number; camK?: CK; thumb?: boolean; thumbG?: Partial<GS>}> = ({t, camK, thumb, thumbG}) => {
  const g0 = guyAt(t);
  const g = thumbG ? {...g0, ...thumbG} : g0;
  const ck = camK ?? camFor(t);
  const sh = shake(t, hit(t, LAND, 7, 8) + hit(t, IMPACT, 10, 8) + hit(t, TENTH_HIT, 6, 8) + hit(t, SL_CHIN, 3, 8));
  const k = ck.k;
  const cam = {x: ck.x + sh.x / k, y: ck.y + sh.y / k, z: 1000 - 1000 / k};
  const z = (n: number) => n / k;
  const shot = t < S2 ? 1 : t < S3 ? 2 : t < S4 ? 3 : t < S5 ? 4 : t < S6 ? 5 : t < S7 ? 6 : 7;
  const xS = popIn(t, S3 + 0.02, 0.32) * inS(t, S3, S4) * (1 - seg(t, S4 - 0.14, S4));
  const dimA = xS > 0.01 ? 0.5 * xS : 0;
  // what the facade needs to draw (rows inside the view)
  const vh = 1920 / 2 / k;
  const fy0 = ck.y - vh - 200, fy1 = ck.y + vh + 200;
  const open = shot === 4 ? RAIN.filter((_, i) => t >= RAIN0 + i * RAIN_DT - 0.25 && t < RAIN0 + i * RAIN_DT + 0.5).map(([cx, row]) => `${COLS.indexOf(cx)},${row}`)
    .concat(t > TENTH0 - 0.35 && t < TENTH0 + 0.4 ? ['1,1'] : []) : [];
  const cs = catSideAt(t), cf = catFrontAt(t);
  const head: P2 = [g.x + g.headX, g.y + g.neck];
  const landed = rainLanded(t);
  const stk = {
    tada: pulse(t, LAND + 0.06, 0.62),
    crack: popIn(t, IMPACT, 0.18) * inS(t, IMPACT, S3) * (1 - seg(t, 2.6, 2.7)),
    chinFirst: popIn(t, T.ground, 0.24) * inS(t, T.ground, S3),
    nine: popIn(t, T.ten, 0.26) * inS(t, T.ten, TENTH_HIT),
    bonk: popIn(t, TENTH_HIT, 0.18) * inS(t, TENTH_HIT, S5),
    chin: popIn(t, SL_CHIN + 0.02, 0.24) * inS(t, SL_CHIN, S6),
    careful: pulse(t, STEPS[0] + 0.05, 0.75),
    zoom: pulse(t, DASH0 + 0.1, 0.4),
    trip: popIn(t, TRIP + 0.02, 0.2) * inS(t, TRIP, PUSH),
  };
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id="cFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Layer cam={cam} z={1000}>
        <Facade y0={fy0} y1={fy1} open={open} />
        {shot === 7 ? <FireEscape /> : null}
        <Street />
        {/* falling: speed lines streaming past */}
        {shot === 1 && t < LAND ? <W>{Array.from({length: 9}, (_, i) => {
          const x = -300 + i * 75 + 20 * Math.sin(i * 3.1), y = fallY(t) - 420 + ((i * 137 - t * 2600) % 700 + 700) % 700;
          return <path key={i} d={`M ${x} ${y} v 120`} stroke="#FFFFFF" strokeWidth={10} strokeLinecap="round" opacity={0.85} />;
        })}</W> : null}
        {shot >= 2 && shot <= 4 ? <Cracks x={GX} y={0} p={seg(t, IMPACT, IMPACT + 0.16)} s={1.1} /> : null}
        {/* landing dust */}
        {shot === 1 && t > LAND ? <W>{[-1, 1].map((sd) => [0, 1, 2].map((i) => {
          const u = seg(t, LAND, LAND + 0.5), r = (16 + 6 * i) * Math.sin(Math.PI * u);
          return r > 0.5 ? <circle key={sd + '_' + i} cx={GX + sd * (70 + 60 * u + 24 * i)} cy={-12 - 14 * i * u} r={r} fill="#FFFFFF" stroke={INK} strokeWidth={4} /> : null;
        }))}</W> : null}
        {/* the cats (the back row lands behind him, the front row in front) */}
        {shot === 4 ? RAIN.map((r, i) => { const c = rainCat(i, t); return c && r[3] < 100 ? <CatSide key={i} t={t} c={c} uid={'r' + i} /> : null; }) : null}
        {cs && shot === 1 ? <CatSide t={t} c={cs} uid="cs" /> : null}
        {cf && (shot <= 3 || shot === 6) ? <CatFront t={t} c={cf} uid="cf" /> : null}
        {shot === 5 ? <CatSide t={t} c={slowAt(t)} uid="sl" /> : null}
        {shot !== 5 ? <Guy t={t} g={g} /> : null}
        {shot === 4 ? RAIN.map((r, i) => { const c = rainCat(i, t); return c && r[3] >= 100 ? <CatSide key={i} t={t} c={c} uid={'r' + i} /> : null; }) : null}
        {shot === 4 ? (() => { const c = tenthAt(t); return c ? <CatSide t={t} c={c} uid="tn" /> : null; })() : null}
        {shot === 7 ? (() => { const c = dashAt(t); return c ? <CatSide t={t} c={c} uid="ds" /> : null; })() : null}
        {/* stars */}
        {!thumb && ((shot === 2 && t > IMPACT + 0.3) || shot === 3 || (shot === 4 && t > TENTH_HIT)) ? [0, 1, 2].map((i) => { const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={head[0] + 84 * Math.cos(a)} y={head[1] - 74 + 18 * Math.sin(a)} s={0.5 * (shot === 2 ? popIn(t, IMPACT + 0.3, 0.2) : 1)} rot={t * 200} />; }) : null}
        {shot === 5 && t > SL_CHIN ? [0, 1].map((i) => <Star key={i} x={SL_X + (-96 * 1.55) + (i ? 60 : -60)} y={-30 - 40 * popIn(t, SL_CHIN, 0.3)} s={0.42 * pulse(t, SL_CHIN, 0.9)} rot={t * 160} />) : null}
        {shot === 1 && t > LAND ? <Star x={GX + 120} y={-200} s={pulse(t, LAND + 0.04, 0.5) * 0.7} rot={t * 300} /> : null}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={GX + 10} y={-250} s={stk.tada} text="TA-DA" size={z(100)} rot={-6} fill={GOLD} />
        <Txt x={GX - 70} y={-170} s={stk.crack} text="CRACK" size={z(104)} rot={-8} fill="#FFFFFF" />
        <Txt x={GX + 30} y={-222} s={stk.chinFirst} text="CHIN FIRST" size={z(112)} rot={-5} fill={GOLD} />
        <Txt x={GX + 150} y={-250} s={stk.bonk} text="BONK" size={z(96)} rot={8} fill="#FFFFFF" />
        <Txt x={-110} y={-232} s={stk.chin} text="CHIN" size={z(120)} rot={-6} fill={GOLD} />
        <Txt x={g.x + 175} y={g.y - 120} s={stk.careful} text="CAREFUL" size={z(80)} rot={-5} fill="#FFFFFF" />
        <Txt x={STAIR_TOP[0] - 10} y={STAIR_TOP[1] - 190} s={stk.zoom} text="ZOOM" size={z(84)} rot={6} fill={GOLD} />
        <Txt x={g.x + 60} y={g.y - 280} s={stk.trip} text="TRIP" size={z(100)} rot={-8} fill={GOLD} />
      </Layer>}
      {dimA > 0.01 ? <AbsoluteFill style={{background: '#0D1230', opacity: dimA}} /> : null}
      {thumb ? null : <>
        <XRayCat t={t} s={xS} />
        <CountBox label="SURVIVED" val={`${landed * 10} %`} sub2="CATS THAT FELL" col="#2E9E5B"
          s={popIn(t, T.nine - 0.05, 0.26) * inS(t, S4, S5) * (1 - seg(t, S5 - 0.12, S5))} top={470} bump={landed > 0 ? hit(t, RAIN0 + (landed - 1) * RAIN_DT + RAIN_FALL, 0.6, 9) : 0} />
        <Card text="9 IN 10" top={700} left={830} color={GOLD} rot={8} s={stk.nine} size={70} />
        <Card text="SLOW-MO" top={560} left={800} color="#FFFFFF" rot={-6} s={popIn(t, S5 + 0.05, 0.24) * inS(t, S5, S6)} size={50} />
        <CountBox label="FACE HURT" val={`${Math.round(57 * eio(seg(t, FH0, FH1)))} %`} sub2="CATS THAT FELL" col={RED}
          s={popIn(t, T.more, 0.26) * inS(t, S6, S7) * (1 - seg(t, S7 - 0.12, S7))} top={1640} bump={hit(t, FH1, 1, 6)} />
        <Card text="MORE THAN HALF" top={1430} left={560} color={GOLD} rot={-5} s={popIn(t, T.half, 0.26) * inS(t, T.half, S7)} size={56} />
        <CommentBubble t={t} text="what if you could land like a cat??" handle="@ninelives_doodle" likes="2.9K" out={1.5} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={15.1} until={PUSH - 0.4} text="Would you still jump?" />
      </>}
    </AbsoluteFill>
  );
};

export const catCues = (): Cue[] => {
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -21 : db}));
  const rain: Cue[] = RAIN.flatMap((_, i) => { const at = RAIN0 + i * RAIN_DT + RAIN_FALL; return [{f: 'pop.wav', at, db: -27}, {f: i % 2 ? 'tick.wav' : 'tick2.wav', at: at + 0.01, db: -28}]; });
  const cues: Cue[] = [
    // frame 0: falling past the windows, flipping over; THUD on the landing
    {f: 'whoosh.wav', at: 0, db: -19}, {f: 'whistle.wav', at: 0, db: -24, from: 0.68}, {f: 'wind.wav', at: 0, db: -31, to: 0.7},
    {f: 'thud.wav', at: LAND, db: -18}, {f: 'thud.wav', at: CAT_LAND, db: -30}, {f: 'tada.wav', at: LAND + 0.08, db: -34},
    {f: 'meow.wav', at: 0.98, db: -36},
    // the arms give, the chin hits
    {f: 'strain.mp3', at: WOB0, db: -29, to: 0.4}, {f: 'whoosh.wav', at: S2 - 0.04, db: -28},
    {f: 'crack.wav', at: IMPACT - 0.32, db: -17}, {f: 'bonk.wav', at: IMPACT, db: -15}, {f: 'zap.wav', at: IMPACT + 0.01, db: -27},
    {f: 'crowd_ooh.wav', at: IMPACT + 0.08, db: -30, to: 1.0}, {f: 'dizzy_birds.wav', at: IMPACT + 0.32, db: -31, to: 0.7},
    // X-RAY: the cat turns over
    {f: 'zap.wav', at: S3, db: -26}, {f: 'pop.wav', at: S3 + 0.06, db: -27}, {f: 'whoosh_slow.wav', at: S3 + 0.1, db: -34, to: 1.4},
    {f: 'shing.wav', at: EAR, db: -27, to: 0.4}, {f: 'zip.wav', at: TW1 + 0.06, db: -26}, {f: 'zip.wav', at: TW2 + 0.06, db: -27},
    {f: 'thud.wav', at: XLAND, db: -21}, {f: 'pop.wav', at: T.paws, db: -28},
    // nine cats out of the windows, the counter; the smug cat drops on his head
    {f: 'whoosh.wav', at: S4 - 0.02, db: -30}, ...rain, {f: 'meow.wav', at: RAIN0 + 0.5, db: -33}, {f: 'pop.wav', at: T.ten, db: -28},
    {f: 'ding.mp3', at: RAIN0 + 8 * RAIN_DT + RAIN_FALL + 0.04, db: -26},
    {f: 'whistle.wav', at: TENTH0 - 0.95, db: -25, from: 0.52}, {f: 'bonk.wav', at: TENTH_HIT, db: -13}, {f: 'meow.wav', at: TENTH_HIT + 0.2, db: -29},
    {f: 'crowd_laugh.wav', at: TENTH_HIT + 0.08, db: -26, to: 1.0},
    // slow motion: the legs give, the chin taps the ground
    {f: 'whoosh_slow.wav', at: S5, db: -33, to: 2.2}, {f: 'thud.wav', at: SL_TOUCH, db: -27}, {f: 'bonk.wav', at: SL_CHIN, db: -18}, {f: 'dizzy_birds.wav', at: SL_CHIN + 0.1, db: -33, to: 0.6},
    ...ctaCues(T.cta).map((c) => ({...c, db: c.db - 8})),
    // FACE HURT
    {f: 'whoosh.wav', at: S6 - 0.02, db: -30}, {f: 'pop.wav', at: T.more, db: -28}, ...ticks(FH0, FH1, 8, -31), {f: 'ding.mp3', at: FH1 + 0.02, db: -27},
    {f: 'crowd_aww.wav', at: FH1 + 0.06, db: -32, to: 0.9},
    // the stairs, the dash, the trip
    {f: 'whoosh.wav', at: S7 - 0.02, db: -30}, ...STEPS.map((s) => ({f: 'step.wav', at: s + 0.2, db: -27})),
    {f: 'zip.wav', at: DASH0 + 0.05, db: -22}, {f: 'meow.wav', at: DASH0 + 0.12, db: -28}, {f: 'squeak.wav', at: TRIP, db: -27}, {f: 'whistle.wav', at: TRIP + 0.1, db: -26},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  // every effect after frame 0 sits 3 dB lower than written above, so the voice stays clear
  return cues.map((c) => (c.at > 0.05 ? {...c, db: c.db - 3} : c));
};
/** the sound effects alone (no voice) - for checking the mix: render.mjs CatFx work/fx.wav */
export const CatFx: React.FC = () => <SoundLayer cues={catCues()} />;
export const CatVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<CatScene t={0} />}>
        <CatScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="catland/vo/tight.mp3" voiceAt={0.1} cues={catCues()} />
    </AbsoluteFill>
  );
};
export const CatWide: React.FC = () => <WideFit.Provider value={0.72}><CatVideo /></WideFit.Provider>;
