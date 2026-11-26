// "What if you could swing like a gibbon?" - shark formula (CLAUDE.md, Growth), niche: animal powers. All drawn in code.
// Frame 0: mid-swing through the jungle on long furry gibbon arms, the smug gibbon swinging beside him (the power at its
// best). The gibbon leaps the gap to the next tree; he grabs a dead twig instead: 2.0 s SNAP, he hangs in the air, drops;
// 2.44 THUD on the jungle floor in close-up, 2.58 an X-ray flash shows the crack in his arm (CRACK), a cast POOFs on.
// 2.86 the gibbon hangs by one hand -> 3.28 X-RAY: GIBBON - its wrist works like a ball joint (BALL JOINT), its body turns
// under the branch (TURNS). 6.86 the gibbon shows off with its eyes shut and MISSES (8.08): THUD next to him, a matching
// cast (comedy hit, laugh). 8.64 three wild gibbons on a branch: 1 IN 3, an X-ray shows the middle one's old healed break.
// 12.06 the playground see-saw: he sits down and the gibbon is catapulted into a tree (HEAVIER x1 -> x10). 14.2 the
// monkey bars in one swing - and on into the sandpit (kids laugh). 16.56 in bubble wrap: a branch snaps, BOING, he bounces
// back up to the branch -> the loop push to frame 0.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd, spring,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Poof, pen} from './lib/kit';

// voice: tight.mp3 at 0.1 s (scripts/vsplice.py: line 1 at 1.22, the rest at 1.12); word times in src/data/words.json.
// Last word ends 18.33 s; + ~0.87 s for the loop push.
export const DURATION = 19.2;
export const T = {
  swing: 0.10, gibbon: 0.76, breaking: 1.81, bones: 2.18,
  its: 2.88, wrist: 3.16, ball: 4.12, joint: 4.30, so: 4.88, body: 5.34, turns: 5.73, branch: 6.30,
  but: 7.03, even: 7.38, gibbons: 7.67, miss: 8.08,
  about: 8.72, one: 8.97, three: 9.46, wild: 9.67, gibbons2: 10.02, broken: 10.66, bones2: 10.87, healed: 11.36,
  and: 12.14, about2: 12.91, ten: 13.2, times: 13.54, heavier: 13.68,
  he: 14.28, crossed: 14.47, monkey: 14.85, bars: 15.17, one2: 15.55, swing2: 15.99,
  so2: 16.62, now: 16.90, swings: 17.19, bubble: 17.76, wrap: 18.05,
  cta: 12.3,
};
// shots (hard cuts)
const S2 = 2.40, S3 = 2.86, S3X = 3.28, S4 = 6.86, S5 = 8.64, S5X = 10.62, S6 = 12.06, S7 = 14.2, S8 = 16.56;
const PUSH = DURATION - LOOP_DUR;
const GRAB = 1.96, SNAP = 2.0, DROP = 2.17, LAND = 2.44, XR0 = 2.58, XR1 = 2.9, CAST = 2.72;     // frame 0 -> the fall
const LEAP0 = 1.52, LEAP1 = 1.86;                                                                // the gibbon's leap
const MISS = 8.08, GFALL = 8.1, S4B = 8.3, GTHUD = 8.42, GCAST = 8.5;                                      // the gibbon misses
const SIT = 12.24, THUMP = 12.4, FLY1 = 12.78, BACK0 = 13.42, HANG = 13.62, X10 = 13.45;           // see-saw
const BAR0 = 14.22, WIND = 14.62, LET = 14.9, OFFEND = 15.7, SAND = 16.3;                        // monkey bars
const SNAP8 = 17.5, BOING = 17.92, CATCH8 = 18.42;                                               // bubble wrap

const GOLD = '#FFD43B', RED = '#E2453C', BLUE = '#3D8FD6', WHITE = '#FFFFFF', FACE_C = '#F1EFEA';
const FUR = '#7A5238', FUR_DK = '#5A3B27', GFACE = '#4E3D36', GMUZ = '#76615A', RING = '#F8F2E9';
const BARK = '#8A5A35', BARK_DK = '#6B4426', DEAD = '#A89A86', DEAD_DK = '#857865';
const LEAF = '#4FA36A', LEAF2 = '#63BA7C', LEAF_DK = '#3B8456', FLOOR = '#6E8F3E', FLOOR_DK = '#5A7A31';
const XNAVY = '#1D2650', XLINE = '#7F93D1', BONE = '#F4F8FF';
const SKYC = '#CDEBFA', GRASS = '#9BD06B', GRASS_DK = '#82BC55', SAND_C = '#F2D894', SAND_DK = '#DDBB6E';
const WRAPC = '#D8F0FF';

type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const mul = (a: P2, k: number): P2 => [a[0] * k, a[1] * k];
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const rot2 = (p: P2, deg: number): P2 => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const inS = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);
const qpt = (S: P2, C: P2, H: P2, u: number): P2 => { const v = 1 - u; return [v * v * S[0] + 2 * v * u * C[0] + u * u * H[0], v * v * S[1] + 2 * v * u * C[1] + u * u * H[1]]; };
const DEG = Math.PI / 180;

// ---------- stickers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const CountBox: React.FC<{label: string; val: string; col: string; s: number; top: number; bump?: number}> = ({label, val, col, s, top, bump = 0}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s * (1 + 0.1 * bump)})`, background: '#FFFDF6', border: `9px solid ${INK}`,
    borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '4px 34px 10px', textAlign: 'center', minWidth: 330, fontFamily: FONT, color: INK, whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: 900, fontSize: 42, lineHeight: 1.1}}>{label}</div>
    <div style={{fontWeight: 900, fontSize: 112, lineHeight: 1, color: col}}>{val}</div>
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
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; fill?: string}> = ({S, H, L, sd, w = 30, fill = WHITE}) => {
  const d = quadD(S, ik(S, H, L, L, sd), H);
  return <g><path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" /><path d={d} stroke={fill} strokeWidth={w - 11} fill="none" strokeLinecap="round" /></g>;
};
/** a limb as a fur tube from S to H (elbow by IK): a jagged fur edge, round ends */
const furGeom = (S: P2, H: P2, L: number, sd: number, w: number, jag: number, n = 14) => {
  const E = ik(S, H, L, L, sd);
  const C: P2 = [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2];
  const pts = Array.from({length: n + 1}, (_, i) => qpt(S, C, H, i / n));
  const Ls: P2[] = [], Rs: P2[] = [];
  pts.forEach((p, i) => {
    const q = pts[Math.min(n, i + 1)], o = pts[Math.max(0, i - 1)];
    const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1;
    const k = w / 2 + (i % 2 === 1 && i < n - 1 ? jag : 0);
    Ls.push([p[0] - (dy / d) * k, p[1] + (dx / d) * k]); Rs.push([p[0] + (dy / d) * k, p[1] - (dx / d) * k]);
  });
  const r = w / 2;
  const d = `M ${P(Ls[0])} ` + Ls.slice(1).map((p) => `L ${P(p)}`).join(' ') + ` A ${r} ${r} 0 0 0 ${P(Rs[n])} ` +
    Rs.slice(0, n).reverse().map((p) => `L ${P(p)}`).join(' ') + ` A ${r} ${r} 0 0 0 ${P(Ls[0])} Z`;
  return {d, E, C, pts};
};
/** the X-ray of an arm: a navy tube, white bones, a zigzag crack across the forearm */
const XArm: React.FC<{S: P2; E: P2; H: P2; w: number; crack?: boolean}> = ({S, E, H, w, crack = true}) => {
  const d = quadD(S, E, H);
  const f = sub(H, E), fl = Math.hypot(f[0], f[1]) || 1, n: P2 = [-f[1] / fl, f[0] / fl];
  const W2 = lp2(E, H, 0.86);
  const mid = lp2(E, H, 0.5);
  const ck = [-1.2, -0.4, 0.4, 1.2].map((k, i) => add(add(mid, mul(n, k * 10)), mul(f, (i % 2 ? 0.05 : -0.05))));
  return (
    <g>
      <path d={d} stroke="#9FB4F0" strokeWidth={w + 8} fill="none" strokeLinecap="round" />
      <path d={d} stroke={XNAVY} strokeWidth={w - 2} fill="none" strokeLinecap="round" />
      <path d={`M ${P(S)} L ${P(E)}`} stroke={BONE} strokeWidth={9} strokeLinecap="round" />
      {[S, E].map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={7} fill={BONE} />)}
      {[-1, 1].map((k) => <path key={k} d={`M ${P(add(E, mul(n, k * 4.5)))} L ${P(add(W2, mul(n, k * 4.5)))}`} stroke={BONE} strokeWidth={5.5} strokeLinecap="round" />)}
      <circle cx={W2[0]} cy={W2[1]} r={6} fill={BONE} />
      {[-1, 0, 1].map((k) => <path key={'h' + k} d={`M ${P(W2)} L ${P(add(H, mul(n, k * 8)))}`} stroke={BONE} strokeWidth={3.5} strokeLinecap="round" />)}
      {crack ? <path d={`M ${ck.map(P).join(' L ')}`} stroke={RED} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
    </g>
  );
};
/** a white plaster cast over the forearm (elbow E -> hand H) */
const ArmCast: React.FC<{E: P2; H: P2; s: number}> = ({E, H, s}) => {
  if (s < 0.01) return null;
  const K = lp2(H, E, 0.15 + 0.7 * s), H2 = lp2(E, H, 0.92);
  const d = `M ${P(K)} L ${P(H2)}`;
  const a = Math.atan2(H[1] - E[1], H[0] - E[0]) / DEG;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={44 * s} strokeLinecap="round" fill="none" />
      <path d={d} stroke="#FFFFFF" strokeWidth={33 * s} strokeLinecap="round" fill="none" />
      <path transform={`translate(${P(lp2(K, H2, 0.5))}) rotate(${a - 90}) scale(${s})`} d="M 0 6 C -10 -4 -10 -12 -4 -12 C -1 -12 0 -9 0 -7 C 0 -9 1 -12 4 -12 C 10 -12 10 -4 0 6 Z" fill={RED} stroke={INK} strokeWidth={2.5} />
    </g>
  );
};
const FurArm: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; jag?: number; xr?: number; cast?: number; handR?: number}> = ({S, H, L, sd, w = 30, jag = 6, xr = 0, cast = 0, handR = 14}) => {
  const {d, E, pts} = furGeom(S, H, L, sd, w, jag);
  if (xr > 0.5) return <XArm S={S} E={E} H={H} w={w} />;
  const marks = [4, 8, 11].map((i) => { const p = pts[i], q = pts[i + 1], a = Math.atan2(q[1] - p[1], q[0] - p[0]) / DEG;
    return <path key={i} transform={`translate(${P(p)}) rotate(${a.toFixed(1)})`} d={`M -6 ${-w * 0.18} L 2 0 L -6 ${w * 0.18}`} stroke={FUR_DK} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />; });
  return (
    <g>
      <path d={d} fill={FUR} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
      {marks}
      {cast > 0.01 ? <ArmCast E={E} H={H} s={cast} /> : null}
      <circle cx={H[0]} cy={H[1]} r={handR} fill={WHITE} stroke={INK} strokeWidth={5.5} />
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

// ---------- the guy's face ----------
type Mood = 'joy' | 'happy' | 'grin' | 'smug' | 'pop' | 'worry' | 'oof' | 'dazed' | 'focus';
const Face: React.FC<{t: number; m: Mood; look: P2}> = ({t, m, look}) => {
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (m === 'joy' || m === 'happy' || m === 'grin') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (m === 'oof') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = m === 'pop' ? 1.3 : m === 'worry' || m === 'dazed' ? 1.1 : 1;
    const rx = 12 * big, ry = 15 * big;
    const lid = m === 'focus' ? 0.34 : m === 'smug' ? 0.46 : 0;
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
  else if (m === 'focus') mouth = <path d="M -15 9 Q 0 6 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (m === 'oof') mouth = <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (m === 'pop') mouth = <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;
  else mouth = <path d="M -18 10 q 6 -6 12 0 t 12 0 t 12 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;   // worry, dazed
  return <g>{eye(-1)}{eye(1)}{brow(-1)}{brow(1)}<g transform="translate(0 28)">{mouth}</g></g>;
};

// ---------- the guy: front view, hip at (0, 0); long furry gibbon arms ----------
type GS = {x: number; y: number; rot: number; tilt: number; mood: Mood; armA: P2; armB: P2; footA: P2; footB: P2; look: P2; sq: number; show: number;
  backA: boolean; backB: boolean; cast: number; xr: number; wrap: number; stick: number; stickSide: number; stickRot: number; flat: number};
const SHX = 38, SH_Y = -90, NECK = -165, LEG = 40, L_ARM = 108;
const BASE: GS = {x: 0, y: 0, rot: 0, tilt: 0, mood: 'happy', armA: [-40, 150], armB: [40, 150], footA: [-26, 70], footB: [26, 70], look: [0, 0], sq: 0, show: 1,
  backA: false, backB: false, cast: 0, xr: 0, wrap: 0, stick: 0, stickSide: 1, stickRot: 0, flat: 0};
const LEG_S = (sd: number): P2 => [sd * 19, 4];
/** a broken dead twig held in a hand (hand at 0, 0, pointing along +x) */
const Twig: React.FC<{len?: number}> = ({len = 150}) => (
  <g>
    <path d={`M -18 0 L ${len} -4 M ${len * 0.45} -2 L ${len * 0.58} -30 M ${len * 0.75} -3 L ${len * 0.86} 22`} stroke={INK} strokeWidth={17} strokeLinecap="round" fill="none" />
    <path d={`M -18 0 L ${len} -4 M ${len * 0.45} -2 L ${len * 0.58} -30 M ${len * 0.75} -3 L ${len * 0.86} 22`} stroke={DEAD} strokeWidth={7} strokeLinecap="round" fill="none" />
    <path d={`M -24 -9 L -32 -2 L -24 3 L -32 9`} stroke={INK} strokeWidth={4} fill="none" strokeLinejoin="round" />
  </g>
);
/** bubble wrap around the torso and legs */
const Wrap: React.FC<{s: number; t: number}> = ({s, t}) => {
  if (s < 0.01) return null;
  const bub: P2[] = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 4; c++) bub.push([-42 + c * 28 + (r % 2 ? 14 : 0), -112 + r * 36]);
  return (
    <g transform={`scale(${s.toFixed(3)})`}>
      <rect x={-66} y={-132} width={132} height={232} rx={44} fill={WRAPC} stroke={INK} strokeWidth={6} />
      {bub.map(([x, y], i) => x < 56 ? <circle key={i} cx={x} cy={y} r={10} fill="#FFFFFF" stroke="#8FBFDE" strokeWidth={3} /> : null)}
      <rect x={-68} y={-20} width={136} height={22} fill="#E8C66A" stroke={INK} strokeWidth={4.5} />
      <path d="M -44 -118 Q -54 -60 -48 10" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.9} />
    </g>
  );
};
const Guy: React.FC<{t: number; g: GS}> = ({t, g}) => {
  if (!g.show) return null;
  const SA: P2 = [-SHX, SH_Y], SB: P2 = [SHX, SH_Y];
  const hA = add(SA, g.armA), hB = add(SB, g.armB);
  const legs = [g.footA, g.footB].map((f, i) => ({S: LEG_S(i ? 1 : -1), H: f, sd: i ? -1 : 1}));
  const arm = (side: number) => {
    const v = side < 0 ? g.armA : g.armB;
    const sd = side < 0 ? (v[1] > 0 ? 1 : -1) : (v[1] > 0 ? -1 : 1);
    return <FurArm key={side} S={side < 0 ? SA : SB} H={side < 0 ? hA : hB} L={L_ARM} sd={sd} xr={side > 0 ? g.xr : 0} cast={side > 0 ? g.cast : 0} />;
  };
  const stickH = g.stickSide < 0 ? hA : hB;
  const outer = `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)}) scale(${(1 + 0.12 * g.flat).toFixed(3)} ${(1 - 0.12 * g.flat).toFixed(3)})`;
  return (
    <W><g transform={outer}>
      {g.backA ? arm(-1) : null}{g.backB ? arm(1) : null}
      {legs.map((l, i) => <Limb key={'l' + i} S={l.S} H={l.H} L={LEG} sd={l.sd} w={30} />)}
      {legs.map((l, i) => <ellipse key={'f' + i} cx={l.H[0] + (i ? 2 : -2)} cy={l.H[1] + 5} rx={23} ry={9.5} fill={WHITE} stroke={INK} strokeWidth={6} />)}
      <path d={torsoD(47, -112, 13)} fill={WHITE} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <Wrap s={g.wrap} t={t} />
      {[-1, 1].map((sd) => <path key={'c' + sd} d={`M ${sd * 26} -104 Q ${sd * 40} -116 ${sd * 52} -100 Q ${sd * 52} -82 ${sd * 38} -76`} fill={FUR} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
      {!g.backA ? arm(-1) : null}{!g.backB ? arm(1) : null}
      {g.stick > 0.01 ? <g transform={`translate(${P(stickH)}) rotate(${g.stickRot.toFixed(1)})`}><Twig /></g> : null}
      <g transform={`translate(0 ${NECK}) rotate(${(-g.rot * (1 - g.flat) + g.tilt).toFixed(2)})`}>
        <g transform={`scale(${(1 + 0.08 * g.sq).toFixed(3)} ${(1 - 0.1 * g.sq).toFixed(3)})`}>
          <circle r={HEAD_R + 1} fill="url(#wFace)" stroke={INK} strokeWidth={6.5} />
          {g.wrap > 0.5 ? <path d="M -66 30 Q -70 70 -40 78 L 40 78 Q 70 70 66 30" fill="none" stroke="none" /> : null}
          <Face t={t} m={g.mood} look={g.look} />
        </g>
      </g>
    </g></W>
  );
};

// ---------- the gibbon: front view, hip at (0, 0) ----------
type GMood = 'smug' | 'happy' | 'wide' | 'shock' | 'dizzy' | 'calm' | 'proud';
type CG = {x: number; y: number; rot: number; s: number; fx: number; mood: GMood; armA: P2; armB: P2; footA: P2; footB: P2; look: P2; tilt: number; sq: number; show: number;
  backA: boolean; backB: boolean; cast: number; xray: number; lump: number; glow: number};
const GSHX = 24, GSH_Y = -66, GNECK = -112, G_HEAD = 40, GL_ARM = 104, GLEG = 27;
const G_BASE: CG = {x: 0, y: 0, rot: 0, s: 1, fx: 1, mood: 'smug', armA: [-30, 140], armB: [30, 140], footA: [-26, 22], footB: [26, 22], look: [0, 0], tilt: 0, sq: 0, show: 1,
  backA: false, backB: false, cast: 0, xray: 0, lump: 0, glow: 0};
const GHIP = (sd: number): P2 => [sd * 13, -4];
const GFaceD: React.FC<{t: number; m: GMood; look: P2; back: boolean}> = ({t, m, look, back}) => {
  if (back) return <g><path d="M -20 -28 Q 0 -36 20 -28 M -24 -12 Q 0 -20 24 -12" stroke={FUR_DK} strokeWidth={4} fill="none" strokeLinecap="round" /></g>;
  const eye = (sd: number) => {
    const ex = sd * 10.5, ey = 0;
    if (m === 'happy' || m === 'proud') return <path key={sd} d={`M ${ex - 7} ${ey + 2} Q ${ex} ${ey - 7} ${ex + 7} ${ey + 2}`} stroke={RING} strokeWidth={3.8} fill="none" strokeLinecap="round" />;
    if (m === 'dizzy') return <path key={sd} d={`M ${ex - 5} ${ey - 5} L ${ex + 5} ${ey + 5} M ${ex + 5} ${ey - 5} L ${ex - 5} ${ey + 5}`} stroke={RING} strokeWidth={3.8} strokeLinecap="round" />;
    const big = m === 'wide' || m === 'shock' ? 1.25 : 1;
    const rx = 7.5 * big, ry = 8.5 * big;
    const lid = m === 'smug' ? 0.48 : m === 'calm' ? 0.3 : 0;
    const px = ex + look[0] * 2.8, py = ey + look[1] * 3;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={3} />
        <circle cx={px} cy={py + lid * 4} r={m === 'shock' ? 2.6 : 3.8} fill={INK} />
        <circle cx={px - 1} cy={py - 1.3 + lid * 4} r={1.3} fill="#fff" />
        {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={GFACE} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const browD = m === 'smug' ? 'M -17 -12 L -5 -11 M 5 -14 Q 11 -20 18 -14' : m === 'wide' || m === 'shock' ? 'M -17 -15 Q -11 -20 -5 -15 M 5 -15 Q 11 -20 17 -15'
    : m === 'dizzy' ? 'M -16 -13 L -5 -10 M 5 -10 L 16 -13' : 'M -16 -12 Q -11 -15 -5 -12 M 5 -12 Q 11 -15 16 -12';
  let mouth: React.ReactNode;
  if (m === 'smug') mouth = <path d="M -8 22 Q 2 27 10 18" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
  else if (m === 'happy' || m === 'proud') mouth = <path d="M -9 18 Q 0 30 9 18 Z" fill="#5A2328" stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  else if (m === 'shock') mouth = <ellipse cx={0} cy={23} rx={5} ry={6.5} fill="#5A2328" stroke={INK} strokeWidth={3} />;
  else if (m === 'wide') mouth = <ellipse cx={0} cy={22} rx={4} ry={4} fill="#5A2328" stroke={INK} strokeWidth={3} />;
  else if (m === 'dizzy') mouth = <path d={`M -9 22 q 3 -3 6 0 t 6 0 t 6 0`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />;
  else mouth = <path d="M -7 21 Q 0 25 7 21" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
  return (
    <g>
      <ellipse cx={0} cy={17} rx={14} ry={10} fill={GMUZ} />
      {eye(-1)}{eye(1)}
      <path d={browD} stroke={RING} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <circle cx={-3} cy={12} r={1.8} fill={INK} /><circle cx={3} cy={12} r={1.8} fill={INK} />
      {mouth}
    </g>
  );
};
/** the gibbon's skeleton (X-ray), same joints as the drawing */
const GSkel: React.FC<{g: CG; SA: P2; SB: P2; hA: P2; hB: P2; EA: P2; EB: P2; legs: {S: P2; H: P2; E: P2}[]; back: boolean}> = ({g, SA, SB, hA, hB, EA, EB, legs, back}) => {
  const arm = (S: P2, E: P2, H: P2, side: number) => {
    const f = sub(H, E), fl = Math.hypot(f[0], f[1]) || 1, n: P2 = [-f[1] / fl, f[0] / fl];
    const Wr = lp2(E, H, 0.8);
    const lump = side < 0 && g.lump > 0.01;
    const M = lp2(E, Wr, 0.5);
    return (
      <g key={side}>
        <path d={`M ${P(S)} L ${P(E)}`} stroke={BONE} strokeWidth={7} strokeLinecap="round" />
        {[-1, 1].map((k) => <path key={k} d={`M ${P(add(E, mul(n, k * 3.6)))} L ${P(add(Wr, mul(n, k * 3.6)))}`} stroke={BONE} strokeWidth={4.2} strokeLinecap="round" />)}
        {lump ? <g><ellipse cx={M[0]} cy={M[1]} rx={17} ry={11} transform={`rotate(${(Math.atan2(f[1], f[0]) / DEG).toFixed(1)} ${P(M)})`} fill={GOLD} opacity={0.55} />
          <ellipse cx={M[0]} cy={M[1]} rx={13} ry={8.5} transform={`rotate(${(Math.atan2(f[1], f[0]) / DEG).toFixed(1)} ${P(M)})`} fill={BONE} />
          <path d={`M ${P(add(M, mul(n, -10)))} L ${P(add(add(M, mul(n, -3)), mul(f, 0.03)))} L ${P(add(add(M, mul(n, 3)), mul(f, -0.03)))} L ${P(add(M, mul(n, 10)))}`} stroke="#8EA1D8" strokeWidth={2.5} fill="none" /></g> : null}
        <circle cx={Wr[0]} cy={Wr[1]} r={side > 0 && g.glow > 0.01 ? 8 : 5.5} fill={side > 0 && g.glow > 0.01 ? mixC(BONE, GOLD, g.glow) : BONE} />
        {side > 0 && g.glow > 0.01 ? <circle cx={Wr[0]} cy={Wr[1]} r={13} fill="none" stroke={GOLD} strokeWidth={3} opacity={g.glow} /> : null}
        {[-1, 0, 1].map((k) => { const tip = add(H, mul(n, k * 5)); const c = add(lp2(Wr, H, 0.6), mul(n, k * 6));
          return <path key={'f' + k} d={`M ${P(Wr)} Q ${P(c)} ${P(tip)}`} stroke={BONE} strokeWidth={2.8} fill="none" strokeLinecap="round" />; })}
        {[S, E].map((p, i) => <circle key={'j' + i} cx={p[0]} cy={p[1]} r={5} fill={BONE} />)}
      </g>
    );
  };
  return (
    <g>
      {legs.map((l, i) => <g key={'lg' + i}><path d={`M ${P(l.S)} L ${P(l.E)} L ${P(l.H)}`} stroke={BONE} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M ${P(l.H)} l ${i ? 10 : -10} 3`} stroke={BONE} strokeWidth={4} strokeLinecap="round" /></g>)}
      {Array.from({length: 7}, (_, i) => <rect key={'v' + i} x={-4} y={GSH_Y + 4 + i * 9.5} width={8} height={6.5} rx={2} fill={BONE} />)}
      {[0, 1, 2, 3].map((i) => <path key={'r' + i} d={`M -2 ${-58 + i * 8} Q -22 ${-56 + i * 8} -20 ${-46 + i * 9} M 2 ${-58 + i * 8} Q 22 ${-56 + i * 8} 20 ${-46 + i * 9}`} stroke={BONE} strokeWidth={3.2} fill="none" strokeLinecap="round" />)}
      <path d="M -17 -12 Q -18 4 -6 4 L 6 4 Q 18 4 17 -12 Q 8 -4 0 -6 Q -8 -4 -17 -12 Z" fill={BONE} />
      <path d={`M ${P(SA)} Q 0 ${GSH_Y - 6} ${P(SB)}`} stroke={BONE} strokeWidth={4} fill="none" />
      {arm(SA, EA, hA, -1)}{arm(SB, EB, hB, 1)}
      <g transform={`translate(0 ${GNECK})`}>
        <circle r={27} fill={BONE} />
        <path d="M -16 14 Q 0 30 16 14 L 12 24 Q 0 32 -12 24 Z" fill={BONE} />
        {!back ? <g><ellipse cx={-10} cy={0} rx={7} ry={8} fill={XNAVY} /><ellipse cx={10} cy={0} rx={7} ry={8} fill={XNAVY} /><path d="M -3 11 L 0 6 L 3 11 Z" fill={XNAVY} /></g> : null}
      </g>
    </g>
  );
};
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixC = (a: string, b: string, u: number) => { const A = hx(a), B = hx(b), k = clamp(u); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
const Gibbon: React.FC<{t: number; g: CG}> = ({t, g}) => {
  if (!g.show) return null;
  const SA: P2 = [-GSHX, GSH_Y], SB: P2 = [GSHX, GSH_Y];
  const hA = add(SA, g.armA), hB = add(SB, g.armB);
  const sdA = g.armA[1] > 0 ? 1 : -1, sdB = g.armB[1] > 0 ? -1 : 1;
  const EA = ik(SA, hA, GL_ARM, GL_ARM, sdA), EB = ik(SB, hB, GL_ARM, GL_ARM, sdB);
  const legs = [g.footA, g.footB].map((f, i) => { const S = GHIP(i ? 1 : -1), sd = i ? 1 : -1; return {S, H: f, E: ik(S, f, GLEG, GLEG, sd), sd}; });
  const back = g.fx < 0;
  const outer = `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)}) scale(${(g.s * (Math.abs(g.fx) < 0.08 ? 0.08 * Math.sign(g.fx || 1) : g.fx)).toFixed(3)} ${g.s.toFixed(3)})`;
  const headT = `translate(0 ${GNECK}) rotate(${(-g.rot * 0.4 + g.tilt).toFixed(2)}) scale(${(1 + 0.08 * g.sq).toFixed(3)} ${(1 - 0.1 * g.sq).toFixed(3)})`;
  if (g.xray > 0.5) {
    const tube = (S: P2, E: P2, H: P2, w: number, k: string) => <g key={k}><path d={quadD(S, E, H)} stroke={XLINE} strokeWidth={w + 6} fill="none" strokeLinecap="round" /><path d={quadD(S, E, H)} stroke={XNAVY} strokeWidth={w - 2} fill="none" strokeLinecap="round" /></g>;
    return (
      <W><g transform={outer}>
        {tube(SA, EA, hA, 22, 'a')}{tube(SB, EB, hB, 22, 'b')}
        {legs.map((l, i) => tube(l.S, l.E, l.H, 20, 'l' + i))}
        <ellipse cx={0} cy={-30} rx={32} ry={46} fill={XNAVY} stroke={XLINE} strokeWidth={4} />
        <circle cx={0} cy={GNECK} r={G_HEAD} fill={XNAVY} stroke={XLINE} strokeWidth={4} />
        <GSkel g={g} SA={SA} SB={SB} hA={hA} hB={hB} EA={EA} EB={EB} legs={legs} back={back} />
      </g></W>
    );
  }
  const arm = (side: number) => {
    const S = side < 0 ? SA : SB, H = side < 0 ? hA : hB;
    return <FurArm key={side} S={S} H={H} L={GL_ARM} sd={side < 0 ? sdA : sdB} w={24} jag={5} cast={side < 0 ? g.cast : 0} handR={11} />;
  };
  return (
    <W><g transform={outer}>
      {g.backA ? arm(-1) : null}{g.backB ? arm(1) : null}
      {legs.map((l, i) => <g key={'lg' + i}><path d={furGeom(l.S, l.H, GLEG, l.sd, 22, 4, 8).d} fill={FUR} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={l.H[0] + (i ? 4 : -4)} cy={l.H[1] + 3} rx={13} ry={8} fill={WHITE} stroke={INK} strokeWidth={4.5} /></g>)}
      <ellipse cx={0} cy={-30} rx={30} ry={45} fill={FUR} stroke={INK} strokeWidth={6} />
      <path d="M -14 -46 Q -10 -36 -14 -24 M 12 -50 Q 16 -40 12 -28 M -2 -16 Q 2 -8 -2 0" stroke={FUR_DK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      {!g.backA ? arm(-1) : null}{!g.backB ? arm(1) : null}
      <g transform={headT}>
        {!back ? <><circle cx={-38} cy={2} r={9} fill={GFACE} stroke={INK} strokeWidth={4} /><circle cx={38} cy={2} r={9} fill={GFACE} stroke={INK} strokeWidth={4} /></> : null}
        <circle r={G_HEAD} fill={FUR} stroke={INK} strokeWidth={6} />
        {!back ? <><circle cx={0} cy={5} r={31} fill={RING} stroke={INK} strokeWidth={3} /><ellipse cx={0} cy={6} rx={23} ry={25} fill={GFACE} /></> : null}
        <GFaceD t={t} m={g.mood} look={g.look} back={back} />
      </g>
    </g></W>
  );
};

// ---------- hanging and swinging ----------
/** a body hangs from hand H by its neck base N at distance R, angle phi (deg; + = body right of the hand); rot = body rotation */
const hangHip = (H: P2, phi: number, R: number, rot: number, shY: number, s = 1): {N: P2; hip: P2} => {
  const N: P2 = [H[0] + R * Math.sin(phi * DEG), H[1] + R * Math.cos(phi * DEG)];
  return {N, hip: sub(N, rot2([0, shY * s], rot))};
};
/** world point -> arm vector from the shoulder (sd) in the body frame */
const armVec = (hip: P2, rot: number, sd: number, shx: number, shy: number, Wp: P2, s = 1): P2 => {
  const S = add(hip, rot2([sd * shx * s, shy * s], rot));
  return mul(rot2(sub(Wp, S), -rot), 1 / s);
};
type Swing = {H: P2[]; t0: number; per: number; R: number; phi0: number; A: number};
/** brachiation along handholds H: swing i hangs from H[i], the free hand travels from H[i-1] to H[i+1] */
const brach = (sw: Swing, t: number) => {
  const n = sw.H.length;
  const i = clamp(Math.floor((t - sw.t0) / sw.per), 0, n - 2);
  const u = clamp((t - sw.t0 - i * sw.per) / sw.per);
  const s = 0.55 * u + 0.45 * (0.5 - 0.5 * Math.cos(Math.PI * u));
  const phi = lerp(-sw.phi0, sw.phi0, s);
  const rot = -sw.A * Math.sin(2 * Math.PI * u);
  const piv = sw.H[i], next = sw.H[i + 1];
  const prev: P2 = i > 0 ? sw.H[i - 1] : [piv[0] - (next[0] - piv[0]), piv[1]];
  const v = eio(clamp(u * 1.08));
  const ctrl: P2 = [(prev[0] + next[0]) / 2, piv[1] + sw.R * 1.15];
  const free = qpt(prev, ctrl, next, v);
  return {i, u, phi, rot, piv, free, hold: i % 2 === 0 ? 1 : -1};
};

// guy swing (frame 0 -> the twig)
const BR = -1150, BR2 = -700, D = 290;
const HG: P2[] = Array.from({length: 6}, (_, i) => [-640 + D * i, BR] as P2);    // H5 = the dead twig's tip
const TWIG_BASE: P2 = [962, BR - 4];
const SW_GUY: Swing = {H: HG, t0: -0.24, per: 0.44, R: 190, phi0: Math.asin(D / 380) / DEG, A: 13};
const G_S1 = 0.85;
const SW_GIB: Swing = {H: Array.from({length: 5}, (_, i) => [-420 + D * i, BR] as P2), t0: -0.24, per: 0.44, R: 157, phi0: Math.asin(D / 314) / DEG, A: 16};
const FAR: P2 = [1150, BR - 30];
// the gibbon in S4 (shows off, misses), the guy in S8 (bubble wrap)
const SW_G4: Swing = {H: [[-520, BR2], [-230, BR2], [60, BR2], [350, BR2]], t0: 6.76, per: 0.44, R: 157, phi0: Math.asin(D / 314) / DEG, A: 16};
const SW_8: Swing = {H: [[-900, BR2], [-610, BR2], [-320, BR2], [-30, BR2]], t0: 16.36, per: 0.44, R: 190, phi0: Math.asin(D / 380) / DEG, A: 13};
const BOUGH2_END = 300;

const legSwing = (u: number, k = 1): [P2, P2] => { const l = 14 * Math.sin(2 * Math.PI * u - 1.2) * k; return [[-24 + l, 68], [24 + l, 68]]; };
/** the guy hanging/swinging on a Swing */
const guySwing = (sw: Swing, t: number, extra: Partial<GS> = {}): GS => {
  const b = brach(sw, t);
  const {hip} = hangHip(b.piv, b.phi, sw.R, b.rot, SH_Y);
  const holdV = armVec(hip, b.rot, b.hold, SHX, SH_Y, b.piv), freeV = armVec(hip, b.rot, -b.hold, SHX, SH_Y, b.free);
  const [fa, fb] = legSwing(b.u);
  return {...BASE, x: hip[0], y: hip[1], rot: b.rot, armA: b.hold < 0 ? holdV : freeV, armB: b.hold > 0 ? holdV : freeV, backA: b.hold > 0, backB: b.hold < 0,
    footA: fa, footB: fb, mood: 'joy', look: [1, -0.3], tilt: 4 * Math.sin(2 * Math.PI * b.u), ...extra};
};
const gibSwing = (sw: Swing, t: number, s: number, extra: Partial<CG> = {}): CG => {
  const b = brach(sw, t);
  const {hip} = hangHip(b.piv, b.phi, sw.R, b.rot, GSH_Y, s);
  const holdV = armVec(hip, b.rot, b.hold, GSHX, GSH_Y, b.piv, s), freeV = armVec(hip, b.rot, -b.hold, GSHX, GSH_Y, b.free, s);
  const l = 8 * Math.sin(2 * Math.PI * b.u - 1.2);
  return {...G_BASE, x: hip[0], y: hip[1], rot: b.rot, s, armA: b.hold < 0 ? holdV : freeV, armB: b.hold > 0 ? holdV : freeV, backA: b.hold > 0, backB: b.hold < 0,
    footA: [-24 + l, 20], footB: [24 + l, 20], ...extra};
};
/** a body hanging still from one hand (side sd) at H, swaying */
const guyHang = (H: P2, sd: number, phi: number, extra: Partial<GS> = {}, R = 190): GS => {
  const rot = -phi * 0.5;
  const {hip} = hangHip(H, phi, R, rot, SH_Y);
  const v = armVec(hip, rot, sd, SHX, SH_Y, H);
  return {...BASE, x: hip[0], y: hip[1], rot, armA: sd < 0 ? v : [-58, 60], armB: sd > 0 ? v : [58, 60], footA: [-24, 68], footB: [24, 68], ...extra};
};
const gibHang = (H: P2, sd: number, phi: number, s: number, extra: Partial<CG> = {}, R = 160): CG => {
  const rot = -phi * 0.5;
  const {hip} = hangHip(H, phi, R * s, rot, GSH_Y, s);
  const v = armVec(hip, rot, sd, GSHX, GSH_Y, H, s);
  return {...G_BASE, x: hip[0], y: hip[1], rot, s, armA: sd < 0 ? v : [-46, 40], armB: sd > 0 ? v : [46, 40], ...extra};
};

// ---------- sets ----------
const seeded = (n: number, seed: number, f: (i: number, r: (k: number) => number) => React.ReactNode) => Array.from({length: n}, (_, i) => f(i, (k: number) => rnd(seed + i * 7.31 + k * 1.7)));
/** the jungle far back (own parallax layer) */
const JungleBack: React.FC = () => (
  <W><g>
    <rect x={-6000} y={-4000} width={12000} height={5200} fill="#2D6A48" />
    {seeded(46, 3, (i, r) => <rect key={'t' + i} x={-5000 + i * 230 + r(1) * 80} y={-4000} width={40 + 40 * r(2)} height={4200} fill="#24573B" />)}
    {seeded(90, 11, (i, r) => <circle key={'c' + i} cx={-5000 + (i % 45) * 230 + r(1) * 120} cy={-2300 + Math.floor(i / 45) * 380 + r(2) * 200} r={130 + 90 * r(3)} fill={i % 3 ? '#347A53' : '#3C8A5C'} />)}
    <rect x={-6000} y={60} width={12000} height={1200} fill="#4B6B2C" />
  </g></W>
);
const leafClump = (x: number, y: number, s: number, key: string, c1 = LEAF, c2 = LEAF2) => (
  <g key={key} transform={`translate(${x} ${y}) scale(${s})`}>
    {[[-46, 6, 34], [-14, -18, 40], [26, -6, 36], [50, 14, 28], [0, 18, 34]].map(([cx, cy, r], i) => <circle key={'o' + i} cx={cx} cy={cy} r={r + 6} fill={INK} />)}
    {[[-46, 6, 34], [-14, -18, 40], [26, -6, 36], [50, 14, 28], [0, 18, 34]].map(([cx, cy, r], i) => <circle key={'f' + i} cx={cx} cy={cy} r={r} fill={i % 2 ? c2 : c1} />)}
    <path d="M -30 -6 Q -14 -20 4 -14 M 12 0 Q 26 -10 40 -2" stroke={LEAF_DK} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);
const Trunk: React.FC<{x: number; w: number; top?: number}> = ({x, w, top = -3000}) => (
  <g>
    <rect x={x - w / 2} y={top} width={w} height={-top + 40} fill={BARK} stroke={INK} strokeWidth={7} />
    {seeded(14, x, (i, r) => <path key={i} d={`M ${x - w * 0.3 + r(1) * w * 0.5} ${top + 200 + i * 210} q ${8 + r(2) * 6} 40 0 ${70 + r(3) * 40}`} stroke={BARK_DK} strokeWidth={5} fill="none" strokeLinecap="round" />)}
  </g>
);
/** a horizontal bough from x0 to x1 at y (thick, bark lines, leaf clumps on top, vines hanging) */
const Bough: React.FC<{x0: number; x1: number; y: number; th?: number; seed: number; stub?: boolean}> = ({x0, x1, y, th = 34, seed, stub = true}) => (
  <g>
    <path d={`M ${x0} ${y - th / 2} L ${x1 - 10} ${y - th / 2 + 3} ${stub ? `L ${x1 + 6} ${y - 6} L ${x1 - 6} ${y} L ${x1 + 4} ${y + 6}` : `Q ${x1 + 18} ${y} ${x1 - 10}`} L ${x1 - 10} ${y + th / 2 - 2} L ${x0} ${y + th / 2} Z`}
      fill={BARK} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
    {seeded(Math.floor((x1 - x0) / 130), seed, (i, r) => <path key={'b' + i} d={`M ${x0 + 60 + i * 130 + r(1) * 40} ${y - 6} q 30 ${4 + r(2) * 4} 60 0`} stroke={BARK_DK} strokeWidth={4} fill="none" strokeLinecap="round" />)}
    {seeded(Math.floor((x1 - x0) / 420), seed + 5, (i, r) => (
      <path key={'v' + i} d={`M ${x0 + 200 + i * 420 + r(1) * 120} ${y + 10} q ${-20 + 40 * r(2)} ${120 + 60 * r(3)} ${-10 + 20 * r(4)} ${220 + 120 * r(3)}`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />))}
    {seeded(Math.floor((x1 - x0) / 420), seed + 5, (i, r) => (
      <path key={'w' + i} d={`M ${x0 + 200 + i * 420 + r(1) * 120} ${y + 10} q ${-20 + 40 * r(2)} ${120 + 60 * r(3)} ${-10 + 20 * r(4)} ${220 + 120 * r(3)}`} stroke="#5BAA5F" strokeWidth={5} fill="none" strokeLinecap="round" />))}
    {seeded(Math.floor((x1 - x0) / 260), seed + 9, (i, r) => leafClump(x0 + 100 + i * 260 + r(1) * 80, y - 40 - r(2) * 30, 0.8 + 0.5 * r(3), 'lc' + i))}
  </g>
);
const Floor: React.FC<{x0: number; x1: number}> = ({x0, x1}) => (
  <g>
    <rect x={x0} y={0} width={x1 - x0} height={900} fill={FLOOR} />
    <path d={`M ${x0} 0 H ${x1}`} stroke={INK} strokeWidth={7} />
    {seeded(Math.floor((x1 - x0) / 90), 21, (i, r) => <ellipse key={'l' + i} cx={x0 + i * 90 + r(1) * 60} cy={40 + r(2) * 220} rx={20 + 10 * r(3)} ry={8} transform={`rotate(${-30 + 60 * r(4)} ${x0 + i * 90 + r(1) * 60} ${40 + r(2) * 220})`} fill={i % 3 ? '#C79A4A' : FLOOR_DK} />)}
    {seeded(Math.floor((x1 - x0) / 320), 33, (i, r) => (
      <g key={'f' + i} transform={`translate(${x0 + 120 + i * 320 + r(1) * 120} 6) scale(${0.8 + 0.4 * r(2)})`}>
        {[-50, -25, 0, 25, 50].map((a) => <path key={a} d={`M 0 0 Q ${a * 0.8} -40 ${a * 1.8} ${-60 + Math.abs(a) * 0.6}`} stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" />)}
        {[-50, -25, 0, 25, 50].map((a) => <path key={'g' + a} d={`M 0 0 Q ${a * 0.8} -40 ${a * 1.8} ${-60 + Math.abs(a) * 0.6}`} stroke="#5FAE5A" strokeWidth={5} fill="none" strokeLinecap="round" />)}
      </g>))}
  </g>
);
/** the dead twig sticking out of the trunk (tip at HG[5]) - snaps at SNAP */
const DeadTwig: React.FC<{t: number}> = ({t}) => t < SNAP ? (
  <g>
    <path d={`M ${P(TWIG_BASE)} L ${HG[5][0] - 24} ${BR + 2} M ${HG[5][0] + 60} ${BR} L ${HG[5][0] + 74} ${BR - 30}`} stroke={INK} strokeWidth={19} strokeLinecap="round" fill="none" />
    <path d={`M ${P(TWIG_BASE)} L ${HG[5][0] - 24} ${BR + 2} M ${HG[5][0] + 60} ${BR} L ${HG[5][0] + 74} ${BR - 30}`} stroke={DEAD} strokeWidth={9} strokeLinecap="round" fill="none" />
  </g>
) : <g>
  <path d={`M ${P(TWIG_BASE)} L ${TWIG_BASE[0] - 26} ${BR - 2}`} stroke={INK} strokeWidth={19} strokeLinecap="round" />
  <path d={`M ${P(TWIG_BASE)} L ${TWIG_BASE[0] - 26} ${BR - 2}`} stroke={DEAD} strokeWidth={9} strokeLinecap="round" />
  <path d={`M ${TWIG_BASE[0] - 34} ${BR - 12} L ${TWIG_BASE[0] - 26} ${BR - 4} L ${TWIG_BASE[0] - 36} ${BR + 2} L ${TWIG_BASE[0] - 28} ${BR + 8}`} stroke={INK} strokeWidth={4} fill="none" />
</g>;
const JungleMain: React.FC<{t: number; shot: number}> = ({t, shot}) => (
  <W><g>
    {shot === 1 || shot === 3 ? <g>
      <Trunk x={-1250} w={120} /><Trunk x={1040} w={140} /><Trunk x={1900} w={130} />
      <Bough x0={-1700} x1={590} y={BR} seed={1} />
      <Bough x0={1100} x1={1840} y={FAR[1]} seed={7} stub={false} />
      <DeadTwig t={t} />
      {leafClump(-900, BR - 330, 1.4, 'u1')}{leafClump(-300, BR - 380, 1.6, 'u2', LEAF2, LEAF)}{leafClump(380, BR - 340, 1.5, 'u3')}{leafClump(1300, BR - 330, 1.5, 'u4', LEAF2, LEAF)}
      <Floor x0={-2200} x1={2400} />
    </g> : null}
    {shot === 2 ? <g><Trunk x={-640} w={130} /><Trunk x={520} w={120} /><Floor x0={-1200} x1={1200} /></g> : null}
    {shot === 4 || shot === 8 ? <g>
      <Trunk x={-1180} w={130} /><Trunk x={760} w={140} />
      <Bough x0={-1700} x1={BOUGH2_END} y={BR2} seed={3} />
      {leafClump(-700, BR2 - 330, 1.5, 'v1')}{leafClump(-60, BR2 - 360, 1.6, 'v2', LEAF2, LEAF)}{leafClump(560, BR2 - 320, 1.4, 'v3')}
      <Floor x0={-2200} x1={2200} />
    </g> : null}
    {shot === 5 ? <g>
      <Trunk x={3000 - 470} w={120} />
      <Bough x0={3000 - 470} x1={3000 + 560} y={-420} seed={13} stub={false} />
      {leafClump(3000 - 260, -760, 1.4, 'w1')}{leafClump(3000 + 220, -790, 1.6, 'w2', LEAF2, LEAF)}
      <Floor x0={2000} x1={4000} />
    </g> : null}
  </g></W>
);

// playground (S6, S7) around x = -3000
const PX = -3000;
const PlayBack: React.FC<{t: number}> = ({t}) => (
  <W><g>
    <rect x={-8000} y={-4000} width={12000} height={4200} fill={SKYC} />
    {[[-3600, -1300], [-2900, -1500], [-2300, -1250], [-3200, -900], [-1900, -1000]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x + 14 * Math.sin(t * 0.5 + i)} ${y})`}>
        {[[-60, 0, 50], [0, -20, 64], [64, 2, 48]].map(([cx, cy, r], j) => <circle key={j} cx={cx} cy={cy} r={r} fill="#FFFFFF" />)}
      </g>))}
    {seeded(18, 41, (i, r) => <g key={'h' + i}><circle cx={-4800 + i * 230 + r(1) * 90} cy={-60 - r(2) * 60} r={120 + 60 * r(3)} fill={i % 2 ? '#7CC46E' : '#6DB563'} /></g>)}
    <rect x={-8000} y={0} width={12000} height={1300} fill={GRASS_DK} />
  </g></W>
);
const SEE_PIV: P2 = [PX + 40, -92], SEE_L = 290;
const seeAng = (t: number) => {                  // + = right end down
  if (t < SIT) return 14.5;
  if (t < THUMP) return lerp(14.5, -14.5, eio(seg(t, SIT, THUMP)));
  return -14.5 + spring(t, THUMP, 2.5, 4, 6);
};
const seeEnd = (t: number, sd: number): P2 => add(SEE_PIV, rot2([sd * SEE_L, -16], seeAng(t)));
const MB_Y = -560, MB_X0 = PX - 520 + 1500, MB_X1 = PX + 520 + 1500, MB_RUNGS = 11;     // monkey bars around PX + 1500
const SANDX = PX + 1500 + 900;
const PlayMain: React.FC<{t: number; shot: number}> = ({t, shot}) => (
  <W><g>
    <rect x={PX - 2500} y={0} width={6500} height={900} fill={GRASS} />
    <path d={`M ${PX - 2500} 0 H ${PX + 4000}`} stroke={INK} strokeWidth={7} />
    {seeded(40, 51, (i, r) => <path key={'g' + i} d={`M ${PX - 2400 + i * 160 + r(1) * 60} ${50 + r(2) * 200} l 8 -22 l 8 22`} stroke={GRASS_DK} strokeWidth={5} fill="none" strokeLinecap="round" />)}
    {/* fence */}
    {Array.from({length: 40}, (_, i) => <rect key={'p' + i} x={PX - 2400 + i * 110} y={-170} width={34} height={170} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={5} />)}
    <rect x={PX - 2420} y={-130} width={4500} height={22} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
    {shot === 6 ? <g>
      {/* the tree the gibbon lands in */}
      <rect x={PX + 470} y={-900} width={90} height={910} fill={BARK} stroke={INK} strokeWidth={7} />
      <path d={`M ${PX + 480} -640 L ${PX + 250} -700 L ${PX + 250} -676 L ${PX + 480} -612 Z`} fill={BARK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {leafClump(PX + 520, -980, 2.4, 'tr1')}{leafClump(PX + 330, -800, 1.4, 'tr2', LEAF2, LEAF)}
      {/* the see-saw */}
      <path d={`M ${SEE_PIV[0] - 60} 6 L ${SEE_PIV[0]} ${SEE_PIV[1] + 8} L ${SEE_PIV[0] + 60} 6 Z`} fill={RED} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <g transform={`translate(${P(SEE_PIV)}) rotate(${seeAng(t).toFixed(2)})`}>
        <rect x={-SEE_L - 20} y={-30} width={2 * SEE_L + 40} height={28} rx={12} fill={GOLD} stroke={INK} strokeWidth={7} />
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * (SEE_L - 70)} -30 V -78 H ${sd * (SEE_L - 100)}`} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
        {[-1, 1].map((sd) => <path key={'i' + sd} d={`M ${sd * (SEE_L - 70)} -30 V -78 H ${sd * (SEE_L - 100)}`} stroke={BLUE} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
        <circle cx={0} cy={-16} r={10} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      </g>
    </g> : null}
    {shot === 7 ? <g>
      {/* sandbox */}
      <rect x={SANDX - 260} y={-36} width={520} height={60} rx={10} fill="#D9774A" stroke={INK} strokeWidth={7} />
      <path d={`M ${SANDX - 246} -30 Q ${SANDX - 120} -70 ${SANDX} -48 Q ${SANDX + 140} -74 ${SANDX + 246} -30 Z`} fill={SAND_C} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <g transform={`translate(${SANDX + 150} -60) rotate(-12)`}><path d="M -26 0 L 26 0 L 18 -40 L -18 -40 Z" fill={BLUE} stroke={INK} strokeWidth={5} strokeLinejoin="round" /><path d="M -18 -40 Q 0 -60 18 -40" stroke={INK} strokeWidth={5} fill="none" /></g>
      {/* monkey bars: far rail, rungs, near rail, posts and end ladders */}
      {[-1, 1].map((sd) => { const x = sd < 0 ? MB_X0 : MB_X1;
        return <g key={sd}>
          <path d={`M ${x + 24} ${MB_Y - 30} L ${x + 24} 0`} stroke={INK} strokeWidth={20} strokeLinecap="round" /><path d={`M ${x + 24} ${MB_Y - 30} L ${x + 24} 0`} stroke="#E8A93A" strokeWidth={9} strokeLinecap="round" />
        </g>; })}
      <path d={`M ${MB_X0 + 24} ${MB_Y - 30} L ${MB_X1 + 24} ${MB_Y - 30}`} stroke={INK} strokeWidth={20} strokeLinecap="round" /><path d={`M ${MB_X0 + 24} ${MB_Y - 30} L ${MB_X1 + 24} ${MB_Y - 30}`} stroke={RED} strokeWidth={9} strokeLinecap="round" />
      {Array.from({length: MB_RUNGS}, (_, i) => { const x = lerp(MB_X0, MB_X1, i / (MB_RUNGS - 1));
        return <g key={'r' + i}><path d={`M ${x} ${MB_Y} L ${x + 24} ${MB_Y - 30}`} stroke={INK} strokeWidth={15} strokeLinecap="round" /><path d={`M ${x} ${MB_Y} L ${x + 24} ${MB_Y - 30}`} stroke="#CFD6DD" strokeWidth={6} strokeLinecap="round" /></g>; })}
      <path d={`M ${MB_X0} ${MB_Y} L ${MB_X1} ${MB_Y}`} stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d={`M ${MB_X0} ${MB_Y} L ${MB_X1} ${MB_Y}`} stroke={RED} strokeWidth={10} strokeLinecap="round" />
      {[-1, 1].map((sd) => { const x = sd < 0 ? MB_X0 : MB_X1;
        return <g key={'n' + sd}>
          <path d={`M ${x} ${MB_Y} L ${x} 4`} stroke={INK} strokeWidth={22} strokeLinecap="round" /><path d={`M ${x} ${MB_Y} L ${x} 4`} stroke="#E8A93A" strokeWidth={10} strokeLinecap="round" />
          {[1, 2, 3, 4].map((k) => <path key={k} d={`M ${x - 4} ${MB_Y + k * 110} L ${x + 22} ${MB_Y + k * 110 - 24}`} stroke={INK} strokeWidth={12} strokeLinecap="round" />)}
        </g>; })}
    </g> : null}
  </g></W>
);

// ---------- inserts (screen space) ----------
/** X-RAY: GIBBON - the skeleton hangs by one hand; the wrist is a glowing ball; the body swings and turns under the branch */
const XR_H: P2 = [10, -318];
const xrPose = (t: number): CG => {
  const u = t - S3X;
  const phi = 22 * Math.sin(2 * Math.PI * 0.7 * u);
  const turnU = seg(t, T.so - 0.1, 6.75);
  const fx = turnU > 0 ? Math.cos(Math.PI * 2 * turnU * 1.5) : 1;
  return gibHang(XR_H, 1, phi, 2.35, {xray: 1, glow: popIn(t, T.ball - 0.1, 0.3) * (0.75 + 0.25 * Math.sin(t * 9)), fx, footA: [-24, 22], footB: [24, 22], armA: [-34, 110]}, 158);
};
const XRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 400;
  const g = xrPose(t);
  const bj = popIn(t, T.ball - 0.04, 0.3), tn = popIn(t, T.turns - 0.04, 0.3);
  const Hh = XR_H;
  const wristY = Hh[1] + 300;
  return (
    <div style={{position: 'absolute', left: 540, top: 930, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <defs><clipPath id="xclip"><circle r={R} /></clipPath></defs>
        <circle r={R + 22} fill={INK} />
        <g clipPath="url(#xclip)">
          <circle r={R} fill="#151C40" />
          {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${-400 + i * 100} -400 V 400 M -400 ${-400 + i * 100} H 400`} stroke="#252F66" strokeWidth={3} />)}
          <rect x={-420} y={Hh[1] - 18} width={840} height={36} rx={14} fill="#2B3778" stroke={XLINE} strokeWidth={4} />
          <Gibbon t={t} g={g} />
          {tn > 0.01 ? <g transform={`translate(${Hh[0]} ${wristY + 170}) scale(${tn})`}>
            {[-1, 1].map((sd) => <g key={sd}><path d={`M ${sd * 140} -40 A 150 60 0 0 ${sd > 0 ? 1 : 0} ${sd * 40} 50`} stroke={GOLD} strokeWidth={12} fill="none" strokeLinecap="round" />
              <path d={`M ${sd * 40 + sd * 22} 34 L ${sd * 40} 50 L ${sd * 40 + sd * 26} 62`} stroke={GOLD} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>)}
          </g> : null}
        </g>
        <circle r={R} fill="none" stroke="#8C98AE" strokeWidth={22} />
        <circle r={R + 14} fill="none" stroke={INK} strokeWidth={6} />
        {bj > 0.01 ? <g transform={`translate(-215 -150) scale(${bj})`}>
          <path d="M 70 -60 L 180 -112" stroke={INK} strokeWidth={13} strokeLinecap="round" />
          <path d="M 150 -122 L 184 -114 L 168 -84" stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <text x={0} y={0} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={GOLD} stroke={INK} strokeWidth={12} style={{paintOrder: 'stroke'}}>BALL</text>
          <text x={0} y={70} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={GOLD} stroke={INK} strokeWidth={12} style={{paintOrder: 'stroke'}}>JOINT</text>
        </g> : null}
      </svg>
    </div>
  );
};

// ---------- the story over time ----------
// S1: frame 0 -> the twig snaps -> he drops
const guyAt = (t: number): GS | null => {
  if (t < GRAB) return guySwing(SW_GUY, t, {mood: t < 1.5 ? 'joy' : 'grin', look: [1, -0.4]});
  if (t < S2) {
    // he grabbed the twig with the free hand (B: the hold side alternates; swing 4 holds with B) and let go of H4
    const g0 = guySwing(SW_GUY, GRAB - 0.001);
    const hip0: P2 = [g0.x, g0.y];
    const fallY = t > DROP ? 0.5 * 7200 * (t - DROP) ** 2 : 0;
    const drift = t > SNAP ? 70 * eout(seg(t, SNAP, DROP + 0.1)) : 0;
    const snapK = t > SNAP ? 1 : 0;
    const handB: P2 = t < SNAP ? HG[5] : [HG[5][0] - 20 + drift, BR + 10 + fallY];
    const hip: P2 = [hip0[0] + drift, hip0[1] + fallY + 10 * snapK];
    const rot = lerp(g0.rot, 0, seg(t, GRAB, DROP));
    return {...BASE, x: hip[0], y: hip[1], rot, armB: armVec(hip, rot, 1, SHX, SH_Y, handB), armA: t < GRAB + 0.04 ? g0.armA : lp2(g0.armA, [-70, -150], eout(seg(t, GRAB + 0.04, GRAB + 0.2))),
      backA: false, mood: t < SNAP ? 'grin' : 'pop', look: t < SNAP ? [1, -0.5] : t < 2.08 ? [0.8, -1] : [0, 0.2], stick: snapK, stickSide: 1, stickRot: t < DROP ? -8 : -8 - 200 * (t - DROP),
      footA: [-22, 70], footB: [22, 70], sq: hit(t, SNAP, 0.5, 9)};
  }
  if (t < S3) {
    // the ground close-up: he lands flat on his back (head to the left), the arm X-ray flashes, a cast poofs on
    const inU = seg(t, S2, LAND);
    const y = lerp(-420, -50, inU * inU);
    const raise = eout(seg(t, LAND + 0.04, XR0));
    return {...BASE, x: 40, y, rot: -90, flat: hit(t, LAND, 1, 9), mood: t < LAND ? 'pop' : t < XR1 + 0.02 ? 'oof' : 'dazed', armA: [-10, 200], backA: true, armB: lp2([10, 150], [196, -24], raise),
      footA: [-30, 62], footB: [26, 66], xr: inS(t, XR0, XR1), cast: t >= CAST + 0.1 ? 1 : 0, look: [0, 0], tilt: -10 + 6 * Math.sin(t * 7) * (t > LAND ? 1 : 0), sq: hit(t, LAND, 1.1, 7)};
  }
  if (t < S4B) return null;
  if (t < S5) {
    // lying on the floor with his cast; the gibbon lands next to him
    return {...BASE, x: 220, y: -50, rot: -90, mood: t < GTHUD ? 'worry' : 'smug', armA: [-10, 200], backA: true, armB: [150, -20], cast: 1, footA: [-30, 62], footB: [26, 66],
      look: t < GTHUD ? [-1, 0.2] : [1, 0.6], tilt: 30 + 8 * Math.sin(t * 2), sq: hit(t, GTHUD, 0.5, 8)};
  }
  if (t < S6) return null;
  if (t < S7) {
    // the see-saw: he drops onto the left end, slams it down
    const L = seeEnd(t, -1);
    const preY = t < SIT ? lerp(-260, 0, eio(seg(t, S6, SIT))) : 0;
    const hip: P2 = [L[0] + 20, L[1] - 30 + preY];
    return {...BASE, x: hip[0], y: hip[1], rot: 0, mood: t < THUMP ? 'joy' : t < 13.0 ? 'grin' : 'worry', armA: [-60, -120], armB: [60, -120],
      footA: [-34, 60], footB: [30, 66], look: t < 13.0 ? [0.6, -1] : [1, -0.6], sq: hit(t, THUMP, 1, 8), tilt: t > 13.0 ? 6 : 0};
  }
  if (t < S8) return mbGuy(t);
  return wrapGuy(t);
};
// monkey bars: hang from rung 0, wind up, one swing that flies him along the whole set and on into the sandpit
const mbGuy = (t: number): GS => {
  const R0: P2 = [MB_X0 + 40, MB_Y];
  if (t < LET) {
    const phi = t < WIND ? lerp(0, -40, eio(seg(t, BAR0, WIND))) : lerp(-40, 45, eio(seg(t, WIND, LET)));
    const g = guyHang(R0, 1, phi, {mood: t < WIND ? 'focus' : 'joy', look: [1, -0.5]});
    g.armA = armVec([g.x, g.y], g.rot, -1, SHX, SH_Y, [R0[0] - 10, R0[1]]);
    return g;
  }
  // flight: from the release point along a long shallow arc to the sandpit, head first at the end
  const u = seg(t, LET, SAND);
  const x = lerp(R0[0] + 140, SANDX - 20, u);
  const y = MB_Y + 250 - 120 * Math.sin(Math.PI * Math.min(1, u * 1.35)) + (u > 0.55 ? 560 * ((u - 0.55) / 0.45) ** 2 : 0);
  const rot = u < 0.6 ? lerp(-60, -80, u / 0.6) : lerp(-80, -170, eio(seg(u, 0.6, 1)));
  if (t >= SAND) {
    const k = seg(t, SAND, SAND + 0.12);
    return {...BASE, x: SANDX - 10, y: lerp(-250, -200, k), rot: 180, mood: 'oof', armA: [-150, 20 + 30 * Math.sin(t * 14)], armB: [150, 20 + 30 * Math.sin(t * 14 + 2)],
      footA: [-40, 66 + 12 * Math.sin(t * 20)], footB: [36, 70 + 12 * Math.sin(t * 20 + 1)], sq: hit(t, SAND, 0.8, 8), show: 1};
  }
  return {...BASE, x, y, rot, mood: u < 0.55 ? 'joy' : 'pop', armA: [-40, -190], armB: [40, -190], footA: [-26, 74], footB: [26, 74], look: [0.4, -1]};
};
// S8: bubble wrap, a branch snaps, BOING, back up to the bough
const wrapGuy = (t: number): GS => {
  if (t < SNAP8) return guySwing(SW_8, t, {wrap: 1, mood: 'joy'});
  const g0 = guySwing(SW_8, SNAP8 - 0.001, {wrap: 1});
  const x0 = g0.x;
  if (t < BOING) {
    const u = seg(t, SNAP8, BOING);
    const y = lerp(g0.y, -96, u * u);
    return {...g0, x: x0 + 60 * u, y, rot: lerp(g0.rot, 0, u), mood: 'pop', armA: [-60, -150], armB: [60, -150], stick: 1, stickSide: 1, stickRot: -60 - 160 * u, backA: false, backB: false, look: [0, 1]};
  }
  if (t < CATCH8) {
    const u = seg(t, BOING, CATCH8);
    const yTop = BR2 + 270;
    const y = lerp(-96, yTop, Math.sin(Math.PI * 0.5 * u));
    return {...g0, x: x0 + 60 + 50 * u, y, rot: 0, mood: 'joy', armA: [-50, -170], armB: [50, -170], backA: false, backB: false, flat: hit(t, BOING, 1.2, 10), look: [0, -1], stick: 0};
  }
  const H: P2 = [x0 + 110, BR2];
  const g = guyHang(H, 1, 10 * Math.sin((t - CATCH8) * 7) * Math.exp(-(t - CATCH8) * 2), {wrap: 1, mood: 'joy'});
  g.armA = armVec([g.x, g.y], g.rot, -1, SHX, SH_Y, [H[0] - 60, H[1]]);
  return g;
};

const gibAt = (t: number): CG | null => {
  if (t < S2) {
    if (t < LEAP0) return gibSwing(SW_GIB, t, G_S1, {mood: 'smug', look: [-1, 0.2], tilt: -6});
    const g0 = gibSwing(SW_GIB, LEAP0 - 0.001, G_S1, {mood: 'smug'});
    if (t < LEAP1) {
      const u = seg(t, LEAP0, LEAP1);
      const start: P2 = [g0.x, g0.y], end = gibHang(FAR, 1, -20, G_S1);
      const p = lp2(start, [end.x, end.y], eio(u));
      return {...g0, x: p[0], y: p[1] - 90 * Math.sin(Math.PI * u), rot: lerp(g0.rot, -20, u), armA: [-60, -150], armB: [150, -120], backA: false, backB: false, mood: 'happy', footA: [-20, 14], footB: [20, 14]};
    }
    const phi = -20 + 30 * Math.sin((t - LEAP1) * 6) * Math.exp(-(t - LEAP1) * 2);
    return gibHang(FAR, 1, phi, G_S1, {mood: t < SNAP + 0.06 ? 'happy' : 'wide', look: [-1, 0.6]});
  }
  if (t < S3) return null;
  if (t < S4) {
    // S3/S3X: hanging by one hand from the bough, smug, a lazy wave
    const phi = 10 * Math.sin((t - S3) * 3);
    return gibHang([200, BR], 1, phi, 1, {mood: 'smug', look: [-0.8, 0.3], armA: [-50 - 10 * Math.sin(t * 9), -60], tilt: -8});
  }
  if (t < S5) {
    if (t < MISS) return gibSwing(SW_G4, t, G_S1, {mood: t < 7.4 ? 'smug' : 'proud', look: [0.6, 0.4], tilt: -8});
    const g0 = gibSwing(SW_G4, MISS - 0.001, G_S1);
    if (t < S4B) {
      // the hand closes on air past the end of the bough; it drops out of the shot
      const u = seg(t, GFALL, S4B);
      const reach: P2 = [SW_G4.H[3][0] + 10, BR2 + 8];
      const hip: P2 = [g0.x + 40 * u, g0.y + 1600 * u * u];
      return {...g0, x: hip[0], y: hip[1], armA: t < GFALL ? g0.armA : [-60, -160], armB: t < GFALL ? armVec([g0.x, g0.y], g0.rot, 1, GSHX, GSH_Y, reach, G_S1) : [70, -150],
        backA: false, backB: false, mood: t < GFALL + 0.04 ? 'proud' : 'shock', look: [0, -1]};
    }
    const LX = 470;
    if (t < GTHUD) {
      const u = seg(t, S4B, GTHUD);
      return {...G_BASE, s: G_S1, x: LX, y: lerp(-760, -36, u * u), rot: lerp(-30, -90, u), armA: [-60, -150], armB: [60, -150], mood: 'shock', look: [0, -1]};
    }
    return {...G_BASE, s: G_S1, x: LX, y: -36, rot: -90, armA: [-40, 120], armB: [70, -60], mood: 'dizzy', footA: [-24, 24], footB: [26, 22], sq: hit(t, GTHUD, 1, 8),
      cast: t >= GCAST + 0.1 ? 1 : 0};
  }
  if (t < S6) return null;
  if (t < S7) {
    // see-saw: sits on the right end, catapulted at THUMP, catches the tree branch
    if (t < THUMP) { const R = seeEnd(t, 1); return {...G_BASE, x: R[0] - 10, y: R[1] - 20, mood: 'smug', armA: [-50, -20], armB: [40, -10], footA: [-26, 26], footB: [26, 26], look: [-1, 0]}; }
    if (t < BACK0) {
      const u = seg(t, THUMP, FLY1);
      const R = seeEnd(THUMP, 1);
      return {...G_BASE, x: R[0] + 200 * u, y: R[1] - 20 - 1400 * u + 300 * u * u, rot: 360 * u, mood: 'shock', armA: [-60, -130], armB: [60, -130], footA: [-26, 30], footB: [26, 30]};
    }
    const H: P2 = [PX + 300, -688];
    if (t < HANG) {
      const u = seg(t, BACK0, HANG);
      const end = gibHang(H, 1, -30, 1);
      return {...end, y: lerp(end.y - 700, end.y, u * u), armB: [30, -170], mood: 'shock'};
    }
    const phi = -30 + 40 * Math.sin((t - HANG) * 6) * Math.exp(-(t - HANG) * 1.6);
    return gibHang(H, 1, phi, 1, {mood: 'smug', look: [-1, 0.8], armA: [-60 + 14 * Math.sin(t * 10), -50]});
  }
  return null;
};
// S5: three gibbons hanging from one branch by both hands
const G3X = [3000 - 215, 3000, 3000 + 215];
const gib3At = (t: number, i: number): CG => {
  const H: P2 = [G3X[i] + 30, -420];
  const sway = 7 * Math.sin(t * 2.2 + i * 1.7);
  const xr = t >= S5X && t < 11.98 ? 1 : 0;
  return gibHang(H, 1, sway, 1.05, {mood: i === 1 ? 'calm' : i === 0 ? 'happy' : 'smug', look: [i === 0 ? 0.6 : i === 2 ? -0.6 : 0, 0.3],
    armA: [-62, 92 + 6 * Math.sin(t * 2 + i)], footA: [-24, 20 + 3 * Math.sin(t * 3 + i)], footB: [24, 20 + 3 * Math.sin(t * 3 + i + 1)], xray: xr, lump: i === 1 ? 1 : 0}, 172);
};

type CK = {x: number; y: number; k: number};
const camLin = (t: number) => -705 + (D / 0.44) * (t + 0.24);
const camFor = (t: number, g: GS | null, cg: CG | null): CK => {
  if (t < S2) {
    const w = eio(seg(t, 1.3, 1.95));
    const x = t < GRAB ? camLin(t) : lerp(camLin(GRAB), 770, eout(seg(t, GRAB, 2.3)));
    const k = lerp(2.6, 2.15, w);
    const y = lerp(BR + 165, BR + 205, w) + (t > DROP ? 300 * eio(seg(t, DROP, S2)) : 0);
    return {x, y, k};
  }
  if (t < S3) return {x: -40, y: -150, k: 3.15};
  if (t < S4) return {x: 200, y: BR + 150, k: lerp(3.0, 3.2, seg(t, S3, S4))};
  if (t < S4B) {
    const x0 = -665 + (D / 0.44) * (t - 6.76);
    return {x: Math.min(x0 + 50, 230), y: BR2 + 175, k: 2.3};
  }
  if (t < S5) return {x: 250, y: -190, k: 1.85};
  if (t < S6) return {x: 3000, y: -240, k: lerp(1.9, 2.0, seg(t, S5, S6))};
  if (t < S7) return {x: PX + 60, y: -360, k: 1.42};
  if (t < S8) {
    const u = seg(t, S7, SAND);
    const z = eio(seg(t, 15.7, SAND + 0.1));
    return {x: lerp(lerp(MB_X0 + 300, SANDX - 260, eio(u)), SANDX - 60, z), y: lerp(-360, -230, z), k: lerp(1.12, 1.75, z)};
  }
  const gx = g ? g.x : -500;
  return {x: clamp(gx + 70, -800, 200), y: -365, k: 1.6};
};

export const GibbonScene: React.FC<{t: number; camK?: CK; thumb?: boolean; thumbG?: Partial<GS>; thumbC?: Partial<CG>}> = ({t, camK, thumb, thumbG, thumbC}) => {
  const g0 = guyAt(t), cg0 = gibAt(t);
  const g = g0 && thumbG ? {...g0, ...thumbG} : g0;
  const cg = cg0 && thumbC ? {...cg0, ...thumbC} : cg0;
  const c0 = camK ?? camFor(t, g, cg);
  const sh = shake(t, hit(t, SNAP, 4, 9) + hit(t, LAND, 12, 7) + hit(t, XR0, 4, 8) + hit(t, GTHUD, 9, 7) + hit(t, THUMP, 9, 7) + hit(t, SAND, 8, 7) + hit(t, BOING, 6, 8));
  const k = c0.k;
  const cam = {x: c0.x + sh.x / k, y: c0.y + sh.y / k, z: 1000 - 1000 / k};
  const shot = t < S2 ? 1 : t < S3 ? 2 : t < S4 ? 3 : t < S5 ? 4 : t < S6 ? 5 : t < S7 ? 6 : t < S8 ? 7 : 8;
  const play = shot === 6 || shot === 7;
  const z = (n: number) => n / k;
  const xS = popIn(t, S3X + 0.02, 0.32) * inS(t, S3X, S4) * (1 - seg(t, S4 - 0.14, S4));
  const dimA = xS > 0.01 ? 0.5 * xS : 0;
  const head = g ? add([g.x, g.y], rot2([0, NECK], g.rot)) : [0, 0] as P2;
  const gHead = cg ? add([cg.x, cg.y], rot2([0, GNECK * cg.s], cg.rot)) : [0, 0] as P2;
  const g3 = shot === 5 ? [0, 1, 2].map((i) => gib3At(t, i)) : [];
  const xr5 = t >= S5X && t < 11.98;
  const lumpP: P2 | null = shot === 5 ? (() => { const gg = g3[1]; const SA: P2 = [-GSHX, GSH_Y], hA = add(SA, gg.armA), EA = ik(SA, hA, GL_ARM, GL_ARM, gg.armA[1] > 0 ? 1 : -1);
    const M = lp2(EA, lp2(EA, hA, 0.8), 0.5); return add([gg.x, gg.y], rot2(mul(M, gg.s), gg.rot)); })() : null;
  const stk = {
    whee: popIn(t, 0.45, 0.22) * inS(t, 0.45, 1.5) * (1 - seg(t, 1.4, 1.5)),
    snap: popIn(t, SNAP, 0.18) * inS(t, SNAP, S2),
    crack: popIn(t, XR0, 0.18) * inS(t, XR0, S3),
    easy: popIn(t, S3 + 0.06, 0.22) * inS(t, S3, S3X),
    miss: popIn(t, MISS, 0.2) * inS(t, MISS, S5),
    thud: popIn(t, GTHUD, 0.18) * inS(t, GTHUD, S5),
    healed: popIn(t, T.healed, 0.24) * inS(t, T.healed, S6),
    thump: popIn(t, THUMP, 0.18) * inS(t, THUMP, 13.0) * (1 - seg(t, 12.9, 13.0)),
    whee2: popIn(t, THUMP + 0.08, 0.2) * inS(t, THUMP, BACK0),
    one: popIn(t, T.swing2, 0.24) * inS(t, T.swing2, S8),
    oops: popIn(t, SAND + 0.02, 0.2) * inS(t, SAND, S8),
    wrap: popIn(t, T.bubble - 0.04, 0.24) * inS(t, T.bubble, SNAP8 + 0.02) * (1 - seg(t, SNAP8 - 0.08, SNAP8)),
    snap8: popIn(t, SNAP8, 0.18) * inS(t, SNAP8, BOING),
    boing: popIn(t, BOING, 0.2) * inS(t, BOING, CATCH8 + 0.1),
  };
  const ringU = seg(t, T.bones2 + 0.05, T.bones2 + 0.45);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id="wFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Layer cam={cam} z={1700}>{play ? <PlayBack t={t} /> : <JungleBack />}</Layer>
      <Layer cam={cam} z={1000}>
        {play ? <PlayMain t={t} shot={shot} /> : <JungleMain t={t} shot={shot} />}
      </Layer>
      <Layer cam={cam} z={1000}>
        {shot === 5 ? g3.map((gg, i) => <Gibbon key={i} t={t} g={gg} />) : null}
        {cg ? <Gibbon t={t} g={cg} /> : null}
        {g ? <Guy t={t} g={g} /> : null}
        <Poof t={t} at={CAST} x={head[0] + 170} y={head[1] - 110} s={0.7} />
        <Poof t={t} at={GCAST} x={gHead[0] + 120} y={gHead[1] - 70} s={0.55} />
        {/* dust and stars */}
        {t >= LAND && t < S3 ? [0, 1, 2].map((i) => { const a = t * 5 + (i * Math.PI * 2) / 3; return <Star key={i} x={head[0] + Math.cos(a) * 90} y={head[1] - 96 + Math.sin(a) * 18} s={0.8} rot={t * 200} />; }) : null}
        {t >= GTHUD && t < S5 && cg ? [0, 1, 2].map((i) => { const a = t * 6 + (i * Math.PI * 2) / 3; return <Star key={'g' + i} x={gHead[0] + Math.cos(a) * 52} y={gHead[1] - 60 + Math.sin(a) * 12} s={0.5} rot={t * 200} />; }) : null}
        {t >= SAND && t < S8 ? <W><rect x={SANDX - 260} y={-36} width={520} height={60} rx={10} fill="#D9774A" stroke={INK} strokeWidth={7} /></W> : null}
        {t >= SAND && t < S8 ? <W><path d={`M ${SANDX - 120} -26 Q ${SANDX - 70} -96 ${SANDX - 10} -${(70 + 20 * eout(seg(t, SAND, SAND + 0.15))).toFixed(1)} Q ${SANDX + 60} -94 ${SANDX + 110} -26 Z`} fill={SAND_C} stroke={INK} strokeWidth={6} strokeLinejoin="round" /></W> : null}
        {t >= SAND && t < S8 ? <g>{[0, 1, 2, 3, 4, 5].map((i) => { const u = (t - SAND) / 0.5, a = -150 + i * 24;
          return u < 1 ? <W key={'s' + i}><circle cx={SANDX + Math.cos(a * DEG) * 140 * u} cy={-40 + Math.sin(a * DEG) * 160 * u + 200 * u * u} r={14 * (1 - u * 0.6)} fill={SAND_DK} stroke={INK} strokeWidth={4} /></W> : null; })}</g> : null}
        {t >= BOING && t < CATCH8 ? <g>{[0, 1, 2, 3, 4].map((i) => { const u = (t - BOING) / 0.4; const a = -160 + i * 35;
          return u < 1 ? <W key={'p' + i}><g transform={`translate(${(g ? g.x : 0) + Math.cos(a * DEG) * 120 * u} ${-60 + Math.sin(a * DEG) * 90 * u}) scale(${(1 - u) * 0.9})`}>
            <path d="M 0 -22 L 6 -6 L 22 0 L 6 6 L 0 22 L -6 6 L -22 0 L -6 -6 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g></W> : null; })}</g> : null}
        {shot === 5 && xr5 && lumpP ? <W><circle cx={lumpP[0]} cy={lumpP[1]} r={46} fill="none" stroke="#FFFFFF" strokeWidth={18} style={pen(ringU)} /><circle cx={lumpP[0]} cy={lumpP[1]} r={46} fill="none" stroke={RED} strokeWidth={10} style={pen(ringU)} /></W> : null}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={g ? g.x + 130 : 0} y={g ? g.y + 90 : 0} s={stk.whee} text="WHEEE" size={z(100)} rot={-6} fill={GOLD} />
        <Txt x={HG[5][0] + 40} y={BR - 120} s={stk.snap} text="SNAP" size={z(110)} rot={8} fill="#FFFFFF" />
        <Txt x={60} y={-330} s={stk.crack} text="CRACK" size={z(120)} rot={-6} fill={RED} />
        <Txt x={200} y={BR + 20} s={stk.easy} text="EASY" size={z(100)} rot={-5} fill={GOLD} />
        <Txt x={330} y={BR2 - 110} s={stk.miss} text="MISS" size={z(120)} rot={7} fill={RED} />
        <Txt x={470} y={-300} s={stk.thud} text="THUD" size={z(110)} rot={-6} fill="#FFFFFF" />
        {lumpP ? <Txt x={lumpP[0] - 30} y={lumpP[1] + 92} s={stk.healed} text="HEALED" size={z(84)} rot={-5} fill={GOLD} /> : null}
        <Txt x={PX - 120} y={-380} s={stk.thump} text="THUMP" size={z(110)} rot={-6} fill={GOLD} />
        <Txt x={PX + 250} y={-520} s={stk.whee2} text="WHEEE" size={z(100)} rot={8} fill="#FFFFFF" />
        <Txt x={SANDX - 170} y={-470} s={stk.one} text="ONE SWING" size={z(100)} rot={-4} fill={GOLD} />
        <Txt x={SANDX + 150} y={-300} s={stk.oops} text="OOPS" size={z(100)} rot={6} fill="#FFFFFF" />
        <Txt x={g ? g.x : 0} y={BR2 - 130} s={stk.wrap} text="BUBBLE WRAP" size={z(92)} rot={-4} fill={GOLD} />
        <Txt x={g ? g.x + 60 : 0} y={BR2 - 120} s={stk.snap8} text="SNAP" size={z(110)} rot={8} fill="#FFFFFF" />
        <Txt x={g ? g.x + 210 : 0} y={-250} s={stk.boing} text="BOING" size={z(120)} rot={-6} fill={GOLD} />
      </Layer>}
      {dimA > 0.01 ? <AbsoluteFill style={{background: '#0D1230', opacity: dimA}} /> : null}
      {xr5 && !thumb ? <AbsoluteFill style={{background: '#0D1230', opacity: 0.18}} /> : null}
      {thumb ? null : <>
        <XRay t={t} s={xS} />
        <Card text="X-RAY: GIBBON" top={350} rot={-3} size={56} s={xS} />
        <CountBox label="BROKE A BONE" val="1 IN 3" col={RED} s={popIn(t, T.three - 0.04, 0.28) * inS(t, S5, S6) * (1 - seg(t, S6 - 0.12, S6))} top={1470} bump={hit(t, T.three, 1, 6)} />
        <Card text="X-RAY" top={340} rot={-3} size={56} color={GOLD} s={popIn(t, S5X, 0.22) * (xr5 ? 1 : 0)} />
        <CountBox label="YOU'RE HEAVIER" val={`x${1 + Math.round(9 * eio(seg(t, T.about2, X10)))}`} col={RED} s={popIn(t, T.about2 - 0.16, 0.26) * inS(t, S6, S7) * (1 - seg(t, S7 - 0.12, S7))} top={1500} bump={hit(t, X10, 1, 6)} />
        <CommentBubble t={t} text="what if you could swing like a gibbon??" handle="@vine_doodle" likes="3.6K" out={1.4} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so2} until={PUSH - 0.4} text="Would you still swing?" />
      </>}
    </AbsoluteFill>
  );
};

export const GibbonVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const swingWhooshes = (t0: number, per: number, n: number, db: number): Cue[] => Array.from({length: n}, (_, i) => ({f: 'whoosh.wav', at: t0 + per * i + per * 0.3, db}));
  const cues: Cue[] = [
    // frame 0: mid-swing, the gibbon beside him
    {f: 'whoosh.wav', at: 0, db: -20}, {f: 'monkey.wav', at: 0.05, db: -30, to: 1.1}, ...swingWhooshes(0.2, 0.44, 4, -29), {f: 'slap.wav', at: 0.2, db: -30}, {f: 'slap.wav', at: 0.64, db: -31}, {f: 'slap.wav', at: 1.08, db: -31}, {f: 'slap.wav', at: 1.52, db: -31},
    // the gibbon leaps the gap; he grabs the dead twig: SNAP, a beat in the air, the drop
    {f: 'whoosh_slow.wav', at: LEAP0, db: -27}, {f: 'creak.wav', at: GRAB - 0.02, db: -24}, {f: 'crack.wav', at: SNAP - 0.32, db: -18}, {f: 'gulp.wav', at: 2.06, db: -24}, {f: 'whistle.wav', at: DROP, db: -24, to: 0.3},
    // THUD in close-up, the X-ray flash of the crack, a cast poofs on
    {f: 'thud.wav', at: LAND, db: -14}, {f: 'crack.wav', at: XR0 - 0.32, db: -16}, {f: 'zap.wav', at: XR0, db: -27}, {f: 'dizzy_birds.wav', at: LAND + 0.2, db: -30, to: 0.42}, {f: 'pop.wav', at: CAST, db: -24},
    // the gibbon hangs, smug; X-RAY: GIBBON - BALL JOINT, TURNS
    {f: 'whoosh.wav', at: S3 - 0.02, db: -28}, {f: 'pop.wav', at: S3 + 0.06, db: -27}, {f: 'scanner.wav', at: S3X - 0.5, db: -26, from: 1.2}, {f: 'pop.wav', at: S3X + 0.06, db: -24},
    {f: 'shimmer.wav', at: T.ball - 0.06, db: -22}, {f: 'pop.wav', at: T.ball, db: -24}, {f: 'whir.mp3', at: T.so, db: -28, to: 1.8}, {f: 'pop.wav', at: T.turns, db: -24},
    // the gibbon shows off and misses: THUD, a matching cast, the laugh
    {f: 'whoosh.wav', at: S4 - 0.02, db: -28}, ...swingWhooshes(6.86, 0.44, 3, -29), {f: 'whoosh.wav', at: MISS - 0.05, db: -23}, {f: 'monkey.wav', at: MISS + 0.02, db: -22, from: 2.1, to: 2.9},
    {f: 'whistle.wav', at: GFALL, db: -26, to: 0.3}, {f: 'thud.wav', at: GTHUD, db: -15}, {f: 'pop.wav', at: GCAST, db: -24}, {f: 'crowd_laugh.wav', at: GTHUD + 0.08, db: -21, to: 1.3},
    // three wild gibbons: 1 IN 3, the X-ray, the old break circled
    {f: 'page_flip.wav', at: S5 - 0.38, db: -21}, {f: 'pop.wav', at: T.three - 0.04, db: -21}, {f: 'zap.wav', at: S5X, db: -24}, {f: 'scribble.wav', at: T.bones2 + 0.04, db: -24, to: 0.45}, {f: 'ding.mp3', at: T.healed, db: -24},
    // see-saw: THUMP, the gibbon flies, HEAVIER x1 -> x10
    {f: 'whoosh.wav', at: S6 - 0.02, db: -28}, {f: 'thud.wav', at: THUMP, db: -16}, {f: 'boing.wav', at: THUMP + 0.02, db: -24}, {f: 'monkey.wav', at: THUMP + 0.06, db: -23, from: 2.1, to: 3.0},
    {f: 'whoosh.wav', at: THUMP + 0.05, db: -22}, ...ticks(T.about2, X10, 6, -28), {f: 'pop.wav', at: X10, db: -21}, {f: 'slap.wav', at: HANG, db: -22},
    ...ctaCues(T.cta),
    // the monkey bars in one swing, and on into the sandpit
    {f: 'whoosh.wav', at: S7 - 0.02, db: -28}, {f: 'squeak.wav', at: BAR0 + 0.05, db: -26}, {f: 'whoosh_slow.wav', at: LET - 0.05, db: -21}, {f: 'pop.wav', at: T.swing2, db: -24},
    {f: 'thud.wav', at: SAND, db: -15}, {f: 'splat.wav', at: SAND + 0.01, db: -24, to: 0.6}, {f: 'kids_laugh.wav', at: SAND + 0.08, db: -22, to: 1.6},
    // bubble wrap: SNAP, BOING with pops, back up to the bough
    {f: 'whoosh.wav', at: S8 - 0.02, db: -28}, ...swingWhooshes(16.56, 0.44, 2, -30), {f: 'crack.wav', at: SNAP8 - 0.32, db: -19}, {f: 'whistle.wav', at: SNAP8 + 0.04, db: -27, to: 0.3},
    {f: 'boing.wav', at: BOING, db: -17}, {f: 'pop.wav', at: BOING + 0.01, db: -22}, {f: 'pop.wav', at: BOING + 0.07, db: -22}, {f: 'pop.wav', at: BOING + 0.13, db: -22}, {f: 'pop.wav', at: BOING + 0.2, db: -24},
    {f: 'slap.wav', at: CATCH8, db: -22},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<GibbonScene t={0} />}>
        <GibbonScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="gibbon/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const GibbonWide: React.FC = () => <WideFit.Provider value={0.72}><GibbonVideo /></WideFit.Provider>;
