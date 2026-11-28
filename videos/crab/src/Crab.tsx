// "What if you had a crab's claws?" - shark formula (CLAUDE.md, Growth), niche: animal powers. All drawn in code.
// Frame 0: on a beach he cracks a coconut in a giant crab claw (CRACK on frame 0) beside a smug coconut crab (the power at
// its best). 1.9 s, close-up: the claw's shell splits at the wrist, a pale soft claw slides out of it (FWOOP), the empty
// shell drops onto the sand (CLUNK), SOFT. 3.28 the coconut crab pinches a strength tester: PINCH 0 -> 180 KG, the bell
// DINGs. 6.60 X-RAY: CRAB CLAW - the shell glows (SHELL), the muscle pushes and nothing gives (CAN'T GROW); the muscle shrinks
// (MUSCLE 100 -> 50 %, HALF) and slides out through the narrow joint (EMPTY). 12.46 his soft claw tries a coconut: it
// squishes, the coconut squirts up and BONKs his head (laugh). 14.28 the crab crunches its own old shell; he picks his up.
// 15.26 he eats his old claw (CRUNCH x3), his claws harden (HARD AGAIN), he grabs a coconut -> the loop push to frame 0.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, pen} from './lib/kit';

// voice: tight.mp3 at 0.1 s (scripts/vsplice.py: line 1 at 1.22, the rest at 1.12; word times refined to the loudness
// chunks with scripts/refine_words.py) - src/data/words.json. Last word ends 16.83 s; + 0.87 s for the loop push.
export const DURATION = 17.70;
export const T = {
  get: 0.12, claws: 0.78, pull: 1.81, them: 1.99, out: 2.11, through: 2.29, wrists: 2.60,
  a: 3.34, coconut: 3.53, crab: 3.98, pinch: 4.58, hundred: 5.15, eighty: 5.76, kilos: 5.98,
  but: 6.65, claw: 6.94, shell: 7.84, and: 8.27, cant: 8.55, grow: 8.93,
  so: 9.40, muscle: 9.68, inside: 10.16, shrinks: 10.51, half: 11.20, slides: 11.84, out2: 12.15,
  the: 12.53, claw2: 12.80, comes: 13.06, soft: 13.56,
  to: 14.34, harden: 14.44, it: 14.70, he: 15.33, eats: 15.58, his: 15.82, old: 16.06, claws2: 16.29,
  cta: 9.55,
};
// shots (hard cuts)
const S2 = 1.76, S3 = 3.28, S4 = 6.60, S5 = 9.34, S6 = 12.46, S7 = 14.28, S8 = 15.26;
const PUSH = DURATION - LOOP_DUR;
const SPLIT = 0.06, SNIP = 1.05;                                    // frame 0: his coconut splits; the crab snips its claw at him
const SPLITC = 1.92, W0 = 2.0, W1 = 2.42, FALL = 2.45, CLUNK = 2.72; // the molt: crack, withdraw, the shell falls, lands
const SQ0 = 4.55, PUCK0 = 5.15, DING = 5.98;                        // the strength tester
const GLOW = 7.84, PUSHM = 8.30, STAMP = 8.93;                      // X-ray A: shell, the muscle pushes, CAN'T GROW
const MUS = 9.68, NARROW = 10.0, SHR0 = 10.51, SHR1 = 11.30, OUT0 = 11.84, OUT1 = 12.30;   // X-ray B
const SQZ = 12.92, SQUIRT = 13.50, BONK = 13.86;                    // the soft claw and the coconut
const CBITE = 14.52, LIFT = 14.62;                                  // the crab crunches its old shell; he lifts his
const B1 = 15.58, B2 = 15.92, B3 = 16.26, GULP = 16.46, HARD = 16.50, TOSS = 16.58, CATCH = 16.98;   // he eats it; the claws harden; the crab tosses him a coconut

const GOLD = '#FFD43B', RED = '#E2453C', WHITE = '#FFFFFF', FACE_C = '#F1EFEA';
const CRAB = '#E2603A', CRAB_DK = '#B44527', CRAB_LT = '#F5A27C', JOINT = '#7A2E1E', TIP = '#3B2622';
const SOFT = '#F8D9CB', SOFT_DK = '#E9B3A0', SOFT_LT = '#FFF1EA';
const SAND = '#F2D894', SAND_DK = '#DDBB6E', SEA = '#8FD0EC', SEA_DK = '#5FB4DC';
const COCO = '#8C5A36', COCO_DK = '#6B4226', COCO_IN = '#FFFDF4';
const XNAVY = '#151C40', XLINE = '#7F93D1', XFILL = '#2E3B7E', MUSC = '#F4A7B9';

type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const mul = (a: P2, k: number): P2 => [a[0] * k, a[1] * k];
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const rot2 = (p: P2, deg: number): P2 => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const inS = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.24) * (1 - seg(t, a + d, a + d + 0.16));
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mixC = (a: string, b: string, u: number) => { const A = hx(a), B = hx(b), k = clamp(u); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };

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
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; fill?: string}> = ({S, H, L, sd, w = 30, fill = WHITE}) => {
  const d = quadD(S, ik(S, H, L, L, sd), H);
  return <g><path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" /><path d={d} stroke={fill} strokeWidth={w - 11} fill="none" strokeLinecap="round" /></g>;
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

// ---------- the claw (claw coords: wrist joint at 0,0, pointing +x; the movable finger on the -y side) ----------
const CUFF_D = 'M -14 -15 Q -17 0 -14 15 L 16 18 Q 21 0 16 -18 Z';
const PALM_D = 'M 12 -20 C 20 -42 64 -48 88 -26 C 96 -14 96 18 88 28 C 64 46 22 42 12 22 Z';
const POLLEX_D = 'M 82 6 C 104 2 130 4 148 15 C 130 30 102 34 82 30 Z';
const POLLEX_TIP = 'M 128 7 C 138 9 144 11 148 15 C 141 21 133 24 125 26 Z';
const DACTYL_P: P2 = [84, -12];
const DACTYL_D = 'M 0 -14 C 22 -24 52 -18 66 4 C 46 0 22 4 0 12 Z';
const DACTYL_TIP = 'M 46 -17 C 55 -13 62 -6 66 4 C 59 2 51 2 44 4 Z';
const GRAN: [number, number][] = [[38, -20], [56, -27], [72, -16], [32, 4], [50, 10], [68, 22], [80, 2], [46, -6]];
type ClawP = {x: number; y: number; rot: number; s?: number; open?: number; hard?: number; droop?: number; wob?: number; t?: number;
  shell?: boolean; crack?: number; bites?: number; sx?: number; sy?: number; flip?: boolean; id?: string; mid?: React.ReactNode};
const BITES: [number, number, number][] = [[146, 8, 30], [118, 4, 32], [90, 0, 36], [58, 2, 40], [26, 0, 40]];
const Claw: React.FC<ClawP> = ({x, y, rot, s = 1, open = 0, hard = 1, droop = 0, wob = 0, t = 0, shell = false, crack = 0, bites = 0, sx = 1, sy = 1, flip = false, id = 'c', mid}) => {
  const fill = mixC(SOFT, CRAB, hard), dk = mixC(SOFT_DK, CRAB_DK, hard), lt = mixC(SOFT_LT, CRAB_LT, hard), tip = mixC(SOFT_DK, TIP, hard);
  const sag = droop * 26 + wob * 5 * Math.sin(t * 15);
  const dAng = -open * 40 + droop * 22, pAng = droop * 16;
  const nb = Math.min(BITES.length, Math.ceil(bites - 0.001));
  const maskId = `cm${id}`;
  const body = (
    <g>
      <path d={CUFF_D} fill={fill} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <g transform={`rotate(${sag.toFixed(2)} 12 0)`}>
        <g transform={`rotate(${pAng.toFixed(2)} 84 20)`}>
          <path d={POLLEX_D} fill={fill} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={POLLEX_TIP} fill={tip} />
          {[98, 112, 126].map((px) => <circle key={px} cx={px} cy={px > 120 ? 7 : 5} r={3.5} fill={lt} stroke={INK} strokeWidth={2} />)}
        </g>
        <g transform={`translate(${DACTYL_P[0]} ${DACTYL_P[1]}) rotate(${dAng.toFixed(2)})`}>
          <path d={DACTYL_D} fill={fill} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d={DACTYL_TIP} fill={tip} />
        </g>
        {mid}
        <path d={PALM_D} fill={fill} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        <path d="M 16 14 C 34 36 66 38 86 22 L 88 28 C 64 46 22 42 12 22 Z" fill={dk} opacity={0.75} />
        {hard > 0.5 ? GRAN.map(([gx, gy], i) => <circle key={i} cx={gx} cy={gy} r={3.6} fill={dk} />) :
          [[30, -10], [52, -2], [70, 10]].map(([gx, gy], i) => <path key={i} d={`M ${gx - 10} ${gy - 8} q 8 8 0 18`} stroke={dk} strokeWidth={3.5} fill="none" strokeLinecap="round" />)}
        <path d="M 26 -26 Q 52 -40 76 -30" stroke={lt} strokeWidth={7} fill="none" strokeLinecap="round" />
        <circle cx={DACTYL_P[0]} cy={DACTYL_P[1]} r={4.5} fill={dk} stroke={INK} strokeWidth={2.5} />
      </g>
      {shell ? <ellipse cx={-14} cy={0} rx={6} ry={13} fill="#3A2117" stroke={INK} strokeWidth={4} /> : null}
      {crack > 0.01 ? <path d="M 14 -18 L 8 -10 L 16 -3 L 7 4 L 15 11 L 9 18" stroke={INK} strokeWidth={4.5} fill="none" strokeLinejoin="round" strokeLinecap="round" style={pen(crack)} /> : null}
    </g>
  );
  return (
    <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(2)}) scale(${(s * sx).toFixed(3)} ${(s * sy * (flip ? -1 : 1)).toFixed(3)})`}>
      {nb > 0 ? <defs><mask id={maskId} maskUnits="userSpaceOnUse" x={-60} y={-90} width={260} height={180}>
        <rect x={-60} y={-90} width={260} height={180} fill="#fff" />
        {BITES.slice(0, nb).map(([bx, by, br], i) => {
          const u = i < nb - 1 ? 1 : clamp(bites - (nb - 1));
          return <g key={i}>{[-0.6, 0, 0.6].map((k) => <circle key={k} cx={bx + 6 * k} cy={by + br * 0.7 * k} r={br * (0.55 + 0.45 * u)} fill="#000" />)}</g>;
        })}
      </mask></defs> : null}
      {nb > 0 ? <g mask={`url(#${maskId})`}>{body}</g> : body}
    </g></W>
  );
};

// ---------- his face ----------
type Mood = 'joy' | 'happy' | 'grin' | 'smug' | 'pop' | 'worry' | 'oof' | 'dazed' | 'focus' | 'chew';
const Face: React.FC<{t: number; m: Mood; look: P2; cheek: number}> = ({t, m, look, cheek}) => {
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (m === 'joy' || m === 'happy' || m === 'grin' || m === 'chew') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
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
  else if (m === 'chew') { const c = Math.sin(t * 26); mouth = <path d={`M -16 ${8 + 2 * c} q 8 ${-5 - 3 * c} 16 0 t 16 0`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />; }
  else if (m === 'oof') mouth = <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (m === 'pop') mouth = <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;
  else mouth = <path d="M -18 10 q 6 -6 12 0 t 12 0 t 12 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;   // worry, dazed
  return (
    <g>
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}<g transform="translate(0 28)">{mouth}</g>
    </g>
  );
};

// ---------- the guy: front view, hip at (x, y); crab claws for hands ----------
type GS = {x: number; y: number; mood: Mood; look: P2; tilt: number; sq: number;
  hA: P2; hB: P2; rA: number; rB: number; oA: number; oB: number; kA: number; kB: number; dA: number; dB: number;
  cheek: number; showA: boolean; clawB: boolean; sxB: number; syB: number};
const SHX = 38, SH_Y = -90, NECK = -165, LEG = 40, L_ARM = 64;
const GX = -60, GY = -84;
const SA: P2 = [GX - SHX, GY + SH_Y], SB: P2 = [GX + SHX, GY + SH_Y];   // (-118, -174), (-42, -174)
const RAISE_B: P2 = [30, -200], RAISE_RB = -60;           // frame 0: claw B up beside his face with the coconut
const REST_A: P2 = [-118, -60], REST_B: P2 = [0, -60];
const G0: GS = {x: GX, y: GY, mood: 'joy', look: [0.8, -0.2], tilt: 0, sq: 0, hA: REST_A, hB: RAISE_B, rA: 100, rB: RAISE_RB, oA: 0.15, oB: 0.05,
  kA: 1, kB: 1, dA: 0, dB: 0, cheek: 0, showA: true, clawB: true, sxB: 1, syB: 1};
const Guy: React.FC<{t: number; g: GS; holdB?: React.ReactNode; front?: React.ReactNode}> = ({t, g, holdB, front}) => {
  const arm = (S: P2, H: P2, side: number) => {
    const v = sub(H, S);
    const sd = side < 0 ? (v[1] > 0 ? 1 : -1) : (v[1] > 0 ? -1 : 1);
    return <Limb key={side} S={S} H={H} L={L_ARM} sd={sd} />;
  };
  const legs = [[-26, 70], [26, 70]].map((f, i) => ({S: [g.x + (i ? 19 : -19), g.y + 4] as P2, H: [g.x + f[0], g.y + f[1]] as P2, sd: i ? -1 : 1}));
  return (
    <W><g>
      {legs.map((l, i) => <Limb key={'l' + i} S={l.S} H={l.H} L={LEG} sd={l.sd} w={30} />)}
      {legs.map((l, i) => <ellipse key={'f' + i} cx={l.H[0] + (i ? 2 : -2)} cy={l.H[1] + 5} rx={23} ry={9.5} fill={WHITE} stroke={INK} strokeWidth={6} />)}
      <path transform={`translate(${g.x} ${g.y})`} d={torsoD(47, -112, 13)} fill={WHITE} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <g transform={`translate(${g.x} ${g.y + NECK}) rotate(${g.tilt.toFixed(2)})`}>
        <g transform={`scale(${(1 + 0.08 * g.sq).toFixed(3)} ${(1 - 0.1 * g.sq).toFixed(3)})`}>
          {g.cheek > 0.01 ? [-1, 1].map((sd) => <circle key={'k' + sd} cx={sd * 54} cy={24} r={20 * g.cheek} fill={FACE_C} stroke={INK} strokeWidth={6} />) : null}
          <circle r={HEAD_R + 1} fill="url(#cFace)" stroke={INK} strokeWidth={6.5} />
          <Face t={t} m={g.mood} look={g.look} cheek={g.cheek} />
        </g>
      </g>
      {g.showA ? <g>{arm(SA, g.hA, -1)}</g> : null}
      {arm(SB, g.hB, 1)}
    </g></W>
  );
};
/** his claws, drawn after the arms (and after anything held, so the fingers close over it) */
const GuyClaws: React.FC<{t: number; g: GS; midB?: React.ReactNode}> = ({t, g, midB}) => (
  <>
    {g.showA ? <Claw x={g.hA[0]} y={g.hA[1]} rot={g.rA} open={g.oA} hard={g.kA} droop={g.dA} wob={g.dA} t={t} flip id="ga" /> : null}
    {g.clawB ? <Claw x={g.hB[0]} y={g.hB[1]} rot={g.rB} open={g.oB} hard={g.kB} droop={g.dB} wob={g.dB} t={t + 0.3} sx={g.sxB} sy={g.syB} id="gb" mid={midB} /> : null}
  </>
);

// ---------- the coconut crab: front view, origin on the sand under its middle ----------
type CMood = 'smug' | 'grin' | 'laugh' | 'shock' | 'chomp' | 'calm';
type CS = {x: number; y: number; s: number; mood: CMood; look: P2; tilt: number; bob: number;
  cA: P2; cB: P2; rA: number; rB: number; oA: number; oB: number};
const CX = 184, CS0 = 0.85;
const C_SH = (sd: number): P2 => [sd * 66, -88];
const crabLegs = (sd: number, ph: number): {H: P2; K: P2; F: P2}[] => [
  {H: [sd * 56, -64], K: [sd * 112, -112 + 4 * Math.sin(ph)], F: [sd * 136, 0]},
  {H: [sd * 64, -78], K: [sd * 142, -128 + 4 * Math.sin(ph + 1)], F: [sd * 180, -2]},
  {H: [sd * 70, -92], K: [sd * 164, -148 + 4 * Math.sin(ph + 2)], F: [sd * 218, -4]},
];
const CrabLeg: React.FC<{H: P2; K: P2; F: P2}> = ({H, K, F}) => {
  const d = `M ${P(H)} L ${P(K)} L ${P(F)}`;
  const dir = sub(F, K), L = Math.hypot(dir[0], dir[1]) || 1, u: P2 = [dir[0] / L, dir[1] / L];
  const tipA = add(F, mul(u, -22));
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={CRAB} strokeWidth={11} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${P(tipA)} L ${P(F)}`} stroke={TIP} strokeWidth={9} strokeLinecap="round" />
      <circle cx={K[0]} cy={K[1]} r={7} fill={JOINT} stroke={INK} strokeWidth={3} />
    </g>
  );
};
const Crab: React.FC<{t: number; c: CS; holdA?: React.ReactNode; holdB?: React.ReactNode}> = ({t, c, holdA, holdB}) => {
  const eye = (sd: number) => {
    const ex = sd * 30, ey = -182 + c.bob * 0.5;
    const lid = c.mood === 'smug' ? 0.5 : c.mood === 'calm' ? 0.36 : 0;
    const r = c.mood === 'shock' ? 18 : 16;
    if (c.mood === 'laugh') return <g key={sd}>
      <path d={`M ${sd * 22} -130 L ${ex} ${ey + 8}`} stroke={INK} strokeWidth={14} strokeLinecap="round" /><path d={`M ${sd * 22} -130 L ${ex} ${ey + 8}`} stroke={CRAB} strokeWidth={6} strokeLinecap="round" />
      <circle cx={ex} cy={ey} r={r} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <path d={`M ${ex - 10} ${ey + 3} Q ${ex} ${ey - 9} ${ex + 10} ${ey + 3}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>;
    const px = ex + c.look[0] * 5, py = ey + c.look[1] * 5 + lid * 6;
    return (
      <g key={sd}>
        <path d={`M ${sd * 22} -130 L ${ex} ${ey + 8}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${sd * 22} -130 L ${ex} ${ey + 8}`} stroke={CRAB} strokeWidth={6} strokeLinecap="round" />
        <circle cx={ex} cy={ey} r={r} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={px} cy={py} r={c.mood === 'shock' ? 5 : 7} fill={INK} />
        <circle cx={px - 2} cy={py - 2.5} r={2.2} fill="#fff" />
        {lid ? <path d={lidPath(ex, ey, r + 0.5, r + 0.5, lid)} fill={CRAB_DK} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brow = (sd: number) => {
    const ex = sd * 30, ey = -182 + c.bob * 0.5;
    let d = `M ${ex - 14} ${ey - 26} Q ${ex} ${ey - 32} ${ex + 14} ${ey - 26}`;
    if (c.mood === 'smug') d = sd < 0 ? `M ${ex - 14} ${ey - 22} L ${ex + 14} ${ey - 20}` : `M ${ex - 14} ${ey - 26} Q ${ex} ${ey - 36} ${ex + 14} ${ey - 28}`;
    if (c.mood === 'shock') d = `M ${ex - 14} ${ey - 32} Q ${ex} ${ey - 40} ${ex + 14} ${ey - 32}`;
    if (c.mood === 'chomp') d = `M ${ex - 14 * sd} ${ey - 28} L ${ex + 14 * sd} ${ey - 20}`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  let mouth: React.ReactNode;
  if (c.mood === 'smug') mouth = <path d="M -22 -84 Q 2 -72 24 -90" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (c.mood === 'grin') mouth = <g><path d="M -26 -88 Q 0 -84 26 -88 Q 22 -66 0 -64 Q -22 -66 -26 -88 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><path d="M -24 -80 Q 0 -76 24 -80" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (c.mood === 'laugh') mouth = <g><path d="M -28 -90 Q 0 -94 28 -90 Q 24 -56 0 -54 Q -24 -56 -28 -90 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={-64} rx={13} ry={6} fill="#E4677A" /></g>;
  else if (c.mood === 'shock') mouth = <ellipse cx={0} cy={-76} rx={13} ry={16} fill="#5A2328" stroke={INK} strokeWidth={5} />;
  else if (c.mood === 'chomp') { const k = Math.abs(Math.sin(t * 24)); mouth = <g><ellipse cx={0} cy={-80} rx={16} ry={3 + 9 * k} fill="#5A2328" stroke={INK} strokeWidth={5} /></g>; }
  else mouth = <path d="M -16 -82 Q 0 -76 16 -82" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  const sw = 6 * Math.sin(t * 1.6);
  const cheli = (sd: number) => {
    const S = C_SH(sd), H = sd < 0 ? c.cA : c.cB;
    const E = ik(S, H, 58, 58, sd < 0 ? -1 : 1);
    const d = `M ${P(S)} L ${P(E)} L ${P(H)}`;
    return <g key={'ch' + sd}>
      <path d={d} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={CRAB} strokeWidth={18} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={E[0]} cy={E[1]} r={9} fill={JOINT} stroke={INK} strokeWidth={3} />
    </g>;
  };
  const ph = t * 3;
  return (
    <W><g transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) scale(${c.s.toFixed(3)})`}>
      {[-1, 1].map((sd) => crabLegs(sd, ph + sd).map((l, i) => <CrabLeg key={sd + '_' + i} {...l} />))}
      <g transform={`translate(0 ${c.bob.toFixed(1)}) rotate(${c.tilt.toFixed(2)} 0 -90)`}>
        {/* antennae */}
        {[-1, 1].map((sd) => <g key={'an' + sd}>
          <path d={`M ${sd * 10} -136 Q ${sd * 50} ${-206 + sw} ${sd * 112} ${-236 + sw * 1.4}`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
          <path d={`M ${sd * 10} -136 Q ${sd * 50} ${-206 + sw} ${sd * 112} ${-236 + sw * 1.4}`} stroke={CRAB} strokeWidth={3} fill="none" strokeLinecap="round" />
        </g>)}
        {/* carapace */}
        <path d="M -94 -94 C -94 -154 94 -154 94 -94 C 94 -58 62 -42 0 -42 C -62 -42 -94 -58 -94 -94 Z" fill={CRAB} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -86 -114 C -72 -148 72 -148 86 -114 C 52 -130 -52 -130 -86 -114 Z" fill={CRAB_DK} />
        <path d="M -84 -70 C -56 -48 56 -48 84 -70 C 70 -46 40 -44 0 -44 C -40 -44 -70 -46 -84 -70 Z" fill={CRAB_LT} />
        {[[-58, -104], [-40, -116], [44, -112], [62, -100], [-66, -86], [70, -84]].map(([gx, gy], i) => <circle key={i} cx={gx} cy={gy} r={4} fill={CRAB_DK} />)}
        {mouth}
        {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
        {cheli(-1)}{cheli(1)}
        {holdA}{holdB}
        <Claw x={c.cA[0]} y={c.cA[1]} rot={c.rA} s={0.78} open={c.oA} flip id="ca" />
        <Claw x={c.cB[0]} y={c.cB[1]} rot={c.rB} s={0.98} open={c.oB} id="cb" />
      </g>
    </g></W>
  );
};

// ---------- coconuts ----------
const CR = 30;
const Fibres: React.FC<{r: number; seed: number; a0?: number; a1?: number}> = ({r, seed, a0 = 0, a1 = 360}) => (
  <g>{Array.from({length: 14}, (_, i) => {
    const a = ((a0 + ((a1 - a0) * (i + 0.5)) / 14) * Math.PI) / 180, l = 6 + 4 * rnd(seed + i);
    return <path key={i} d={`M ${(Math.cos(a) * (r - 3)).toFixed(1)} ${(Math.sin(a) * (r - 3)).toFixed(1)} l ${(Math.cos(a + 0.5) * l).toFixed(1)} ${(Math.sin(a + 0.5) * l).toFixed(1)}`}
      stroke={COCO_DK} strokeWidth={3.2} strokeLinecap="round" />;
  })}</g>
);
const Coconut: React.FC<{x: number; y: number; rot?: number; s?: number; crack?: number; sq?: number}> = (p) => <W><CocoG {...p} /></W>;
const CocoG: React.FC<{x: number; y: number; rot?: number; s?: number; crack?: number; sq?: number}> = ({x, y, rot = 0, s = 1, crack = 0, sq = 0}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${(s * (1 + 0.18 * sq)).toFixed(3)} ${(s * (1 - 0.18 * sq)).toFixed(3)})`}>
    <Fibres r={CR} seed={5} />
    <circle r={CR} fill={COCO} stroke={INK} strokeWidth={5.5} />
    {[[-14, -6], [-4, 12], [12, -10], [16, 10]].map(([px, py], i) => <path key={i} d={`M ${px - 6} ${py} q 6 -4 12 0`} stroke={COCO_DK} strokeWidth={3} fill="none" strokeLinecap="round" />)}
    {[[-7, 8], [7, 8], [0, 18]].map(([px, py], i) => <circle key={'e' + i} cx={px} cy={py} r={3.6} fill={COCO_DK} />)}
    {crack > 0.01 ? <path d="M -3 -29 L 3 -16 L -5 -5 L 5 6 L -2 16 L 2 29" stroke={INK} strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" style={pen(crack)} /> : null}
  </g>
);
/** half a coconut, cut face toward +x (rotate it) */
const CocoHalf: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`}>
    <Fibres r={CR} seed={9} a0={95} a1={265} />
    <path d={`M 0 ${-CR} A ${CR} ${CR} 0 0 0 0 ${CR} Z`} fill={COCO} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    <path d={`M 0 ${-CR + 6} A ${CR - 6} ${CR - 6} 0 0 0 0 ${CR - 6}`} fill="none" stroke={COCO_IN} strokeWidth={8} />
    <ellipse cx={2} cy={0} rx={7} ry={CR - 2} fill={COCO_IN} stroke={INK} strokeWidth={3.5} />
  </g></W>
);
/** drops / crumbs flying from a point with gravity (born at t0), stopping at the sand */
const Drops: React.FC<{t: number; t0: number; x: number; y: number; n: number; color: string; seed: number; spd?: number; up?: number; r?: number; floor?: number; life?: number}> =
  ({t, t0, x, y, n, color, seed, spd = 260, up = 300, r = 8, floor = 0, life = 0.9}) => {
  const u = t - t0;
  if (u < 0 || u > life) return null;
  return <W>{Array.from({length: n}, (_, i) => {
    const a = (-160 + 140 * rnd(seed + i)) * Math.PI / 180, v = spd * (0.6 + 0.6 * rnd(seed + i * 3));
    const px = x + Math.cos(a) * v * u, py = Math.min(floor - 3, y + Math.sin(a) * v * u - up * u * 0.2 + 900 * u * u);
    const rr = r * (0.6 + 0.6 * rnd(seed + i * 7)) * (1 - u / life);
    return rr > 0.5 ? <circle key={i} cx={px} cy={py} r={rr} fill={color} stroke={INK} strokeWidth={2.5} /> : null;
  })}</W>;
};

// ---------- the beach ----------
const Far: React.FC<{t: number}> = ({t}) => (
  <W><g>
    <rect x={-4000} y={-180} width={8000} height={3000} fill={SEA} />
    <path d="M -4000 -180 H 4000" stroke={INK} strokeWidth={5} />
    {Array.from({length: 18}, (_, i) => { const x = -1400 + i * 170 + 40 * Math.sin(t * 0.8 + i), y = -150 + (i % 3) * 34;
      return <path key={i} d={`M ${x} ${y} q 14 -10 28 0 q 14 10 28 0`} stroke={SEA_DK} strokeWidth={4} fill="none" strokeLinecap="round" />; })}
    <path d="M 420 -180 Q 500 -250 600 -236 Q 680 -280 780 -226 L 860 -180 Z" fill="#9BD06B" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {[[-560, -560, 1.0], [-120, -660, 0.8], [360, -600, 0.9]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x + 10 * Math.sin(t * 0.3 + i)} ${y}) scale(${s})`}>
        {[[-40, 6, 26], [-10, -8, 34], [26, 2, 28], [52, 10, 18]].map(([cx, cy, r], j) => <circle key={'i' + j} cx={cx} cy={cy} r={r + 4} fill={INK} />)}
        {[[-40, 6, 26], [-10, -8, 34], [26, 2, 28], [52, 10, 18]].map(([cx, cy, r], j) => <circle key={'w' + j} cx={cx} cy={cy} r={r} fill="#FFFFFF" />)}
      </g>
    ))}
  </g></W>
);
const Palm: React.FC<{x: number; s: number; lean: number}> = ({x, s, lean}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d={`M 0 0 Q ${lean * 0.3} -160 ${lean} -320`} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
    <path d={`M 0 0 Q ${lean * 0.3} -160 ${lean} -320`} stroke="#B98450" strokeWidth={18} fill="none" strokeLinecap="round" />
    {[0.2, 0.4, 0.6, 0.8].map((u) => { const px = 2 * (1 - u) * u * lean * 0.3 + u * u * lean, py = -320 * u; return <path key={u} d={`M ${px - 9} ${py} l 18 -6`} stroke="#8E5F33" strokeWidth={4} />; })}
    {[-150, -110, -40, 10, 60].map((a, i) => <g key={i} transform={`translate(${lean} -320) rotate(${a})`}>
      <path d="M 0 0 C 30 -40 90 -46 130 -10 C 90 -22 40 -18 0 0 Z" fill="#7CC35A" stroke={INK} strokeWidth={6} strokeLinejoin="round" /></g>)}
    <circle cx={lean - 10} cy={-306} r={11} fill={COCO} stroke={INK} strokeWidth={5} /><circle cx={lean + 10} cy={-302} r={11} fill={COCO} stroke={INK} strokeWidth={5} />
  </g>
);
const Sand: React.FC = () => (
  <W><g>
    <rect x={-3000} y={0} width={6000} height={1400} fill={SAND} />
    <path d="M -3000 0 H 3000" stroke={INK} strokeWidth={6} />
    {Array.from({length: 40}, (_, i) => { const x = -1400 + i * 81 + 30 * rnd(i), y = 26 + 160 * rnd(i * 3.3);
      return <path key={i} d={`M ${x} ${y} q 12 -7 24 0`} stroke={SAND_DK} strokeWidth={4} fill="none" strokeLinecap="round" />; })}
  </g></W>
);

// ---------- the strength tester ----------
const TX = 484, T_BOT = -80, T_TOP = -560, T_MAX = 180;
const tY = (v: number) => lerp(T_BOT, T_TOP, v / T_MAX);
const Tester: React.FC<{t: number; v: number; ring: number; press: number}> = ({t, v, ring, press}) => {
  const bell = 14 * ring * Math.sin(t * 55);
  return (
    <W><g>
      {/* base with the pinch handle */}
      <path d={`M ${TX - 70} 0 L ${TX - 58} -64 L ${TX + 58} -64 L ${TX + 70} 0 Z`} fill={RED} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <text x={TX} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#FFFFFF" stroke={INK} strokeWidth={5} style={{paintOrder: 'stroke'}}>PINCH</text>
      <rect x={TX - 150} y={-112} width={96} height={16} rx={7} fill="#C9CED6" stroke={INK} strokeWidth={5} />
      <rect x={TX - 150} y={-88 + 8 * (1 - press)} width={96} height={16} rx={7} fill="#C9CED6" stroke={INK} strokeWidth={5} />
      <rect x={TX - 62} y={-118} width={14} height={60} fill="#9AA2AE" stroke={INK} strokeWidth={4} />
      {/* column + scale */}
      <rect x={TX - 36} y={T_TOP - 10} width={72} height={T_BOT - T_TOP + 26} rx={10} fill="#FFFDF6" stroke={INK} strokeWidth={7} />
      {Array.from({length: 18}, (_, i) => <rect key={i} x={TX - 26} y={tY((i + 1) * 10)} width={52} height={(T_BOT - T_TOP) / 18 - 3}
        fill={i < 6 ? '#9BD06B' : i < 12 ? GOLD : RED} opacity={0.55} />)}
      {[0, 60, 120, 180].map((k) => <g key={k}>
        <path d={`M ${TX + 36} ${tY(k)} h 16`} stroke={INK} strokeWidth={5} />
        <text x={TX + 58} y={tY(k) + 10} fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}>{k}</text>
      </g>)}
      <path d={`M ${TX} ${T_BOT} V ${T_TOP}`} stroke={INK} strokeWidth={4} strokeDasharray="10 8" />
      {/* the puck */}
      <rect x={TX - 30} y={tY(v) - 14} width={60} height={28} rx={10} fill={GOLD} stroke={INK} strokeWidth={5} />
      {/* bell */}
      <g transform={`rotate(${bell.toFixed(1)} ${TX} ${T_TOP - 64})`}>
        <path d={`M ${TX - 34} ${T_TOP - 14} Q ${TX - 34} ${T_TOP - 64} ${TX} ${T_TOP - 66} Q ${TX + 34} ${T_TOP - 64} ${TX + 34} ${T_TOP - 14} Z`} fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <circle cx={TX} cy={T_TOP - 10} r={8} fill={INK} />
        <path d={`M ${TX - 20} ${T_TOP - 46} Q ${TX - 22} ${T_TOP - 28} ${TX - 16} ${T_TOP - 18}`} stroke="#FFF6C8" strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
      {ring > 0.05 ? [-1, 1].map((sd) => <g key={sd} opacity={ring}>
        {[0, 1, 2].map((i) => <path key={i} d={`M ${TX + sd * (50 + i * 16)} ${T_TOP - 70 + i * 14} l ${sd * 22} ${-10 + i * 10}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
      </g>) : null}
    </g></W>
  );
};

// ---------- X-RAY: the claw (screen space) ----------
const XRayClaw: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 370, K = 3.6, OX = -241;
  const glow = seg(t, GLOW - 0.04, GLOW + 0.3) * (1 - seg(t, PUSHM - 0.1, PUSHM + 0.1));
  const push = t > PUSHM && t < S5 ? 0.12 * Math.abs(Math.sin((t - PUSHM) * 9)) * (1 - seg(t, STAMP + 0.25, S5)) : 0;
  const strain = t > PUSHM && t < STAMP + 0.3 ? 1 : 0;
  const shrink = 1 - 0.38 * eio(seg(t, SHR0, SHR1));
  const outU = eio(seg(t, OUT0, OUT1));
  const mx = 50 - 210 * outU;                                 // muscle centre (claw units) slides out to the left
  const inCuff = Math.max(0, 1 - Math.abs(mx - 2) / 34);     // squeezed while it passes the narrow joint
  const mS = (1 + push) * shrink;
  const mSy = mS * (1 - 0.55 * inCuff);
  const musGlow = popIn(t, MUS, 0.22) * (1 - seg(t, SHR0 - 0.1, SHR0 + 0.1));
  const narrowU = seg(t, NARROW, NARROW + 0.35) * (1 - seg(t, OUT1 + 0.1, OUT1 + 0.3));
  const jit = strain ? 2.2 * Math.sin(t * 70) : 0;
  const shellStroke = glow > 0.02 ? GOLD : strain ? '#FF8A80' : XLINE;
  return (
    <div style={{position: 'absolute', left: 540, top: 1040, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <defs><clipPath id="cxclip"><circle r={R} /></clipPath></defs>
        <circle r={R + 22} fill={INK} />
        <g clipPath="url(#cxclip)">
          <circle r={R} fill={XNAVY} />
          {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${-400 + i * 100} -400 V 400 M -400 ${-400 + i * 100} H 400`} stroke="#252F66" strokeWidth={3} />)}
          <g transform={`translate(${OX + jit} ${jit * 0.5}) scale(${K})`}>
            {/* the arm behind the joint */}
            <path d="M -200 -13 L -14 -13 L -14 13 L -200 13" fill={XFILL} stroke={XLINE} strokeWidth={2} />
            {/* the shell */}
            <path d={CUFF_D} fill={XFILL} stroke={shellStroke} strokeWidth={glow > 0.02 ? 3.2 : 2.2} strokeLinejoin="round" />
            <path d={POLLEX_D} fill={XFILL} stroke={shellStroke} strokeWidth={glow > 0.02 ? 3.2 : 2.2} strokeLinejoin="round" />
            <g transform={`translate(${DACTYL_P[0]} ${DACTYL_P[1]})`}><path d={DACTYL_D} fill={XFILL} stroke={shellStroke} strokeWidth={glow > 0.02 ? 3.2 : 2.2} strokeLinejoin="round" /></g>
            <path d={PALM_D} fill={XFILL} stroke={shellStroke} strokeWidth={glow > 0.02 ? 3.2 : 2.2} strokeLinejoin="round" />
            {/* the muscle */}
            <g transform={`translate(${mx} 4) scale(${mS.toFixed(3)} ${mSy.toFixed(3)})`}>
              <ellipse rx={34} ry={22} fill={MUSC} stroke={musGlow > 0.02 ? GOLD : '#FFFFFF'} strokeWidth={musGlow > 0.02 ? 3 : 1.6} />
              {[-16, -6, 4, 14].map((k) => <path key={k} d={`M -28 ${k * 0.9} Q 0 ${k * 0.9 - 4} 28 ${k * 0.9}`} stroke="#D9768E" strokeWidth={1.4} fill="none" />)}
              {outU < 0.05 ? <path d="M 30 -6 L 40 -14" stroke="#FFFFFF" strokeWidth={2} strokeLinecap="round" /> : null}
            </g>
            {/* the narrow joint */}
            {narrowU > 0.01 ? <ellipse cx={2} cy={0} rx={13} ry={24} fill="none" stroke={RED} strokeWidth={3} strokeDasharray="5 4" style={pen(narrowU)} /> : null}
          </g>
          <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.2} />
        </g>
        <circle r={R} fill="none" stroke="#8C98AE" strokeWidth={22} />
        <circle r={R + 14} fill="none" stroke={INK} strokeWidth={6} />
      </svg>
      <Card text="X-RAY: CRAB CLAW" top={92} size={50} />
      <Card text="SHELL" top={250} left={600} color={GOLD} rot={6} s={popIn(t, GLOW, 0.26) * inS(t, GLOW, PUSHM - 0.05)} size={60} />
      <Card text="CAN'T GROW" top={780} left={450} color={RED} fg="#FFFFFF" rot={-6} s={popIn(t, STAMP, 0.26) * inS(t, STAMP, S5)} size={62} />
      <Card text="MUSCLE" top={260} left={560} color={MUSC} rot={5} s={popIn(t, MUS, 0.26) * inS(t, MUS, SHR0)} size={58} />
      <Card text="NARROW" top={700} left={200} color="#FFFFFF" rot={-5} s={popIn(t, NARROW + 0.1, 0.26) * inS(t, NARROW, SHR0)} size={50} />
      <Card text="EMPTY" top={260} left={600} color="#FFFFFF" rot={5} s={popIn(t, OUT1 - 0.06, 0.26) * inS(t, OUT1, S6)} size={60} />
    </div>
  );
};

// ---------- the story over time ----------
const SHELL_LAND_B: P2 = [-50, -14], SHELL_LAND_A: P2 = [-188, -14];   // the old shells on the sand (B = the one he eats)
const SHELL_LAND_RB = 6, SHELL_LAND_RA = 10;
const HALF_LAND_L: P2 = [-4, -26], HALF_LAND_R: P2 = [64, -24];
const W_DIR: P2 = [Math.cos((RAISE_RB * Math.PI) / 180), Math.sin((RAISE_RB * Math.PI) / 180)];
const wd = (t: number) => 150 * eio(seg(t, W0, W1));                 // how far claw and shell have come apart
const SOFT_REST_A: P2 = [-118, -64], SOFT_REST_B: P2 = [0, -64];
const DROOP_B: P2 = [16, -178];                                      // the soft claw B right after the molt
const S6_B: P2 = [6, -204], S6_RB = -36;                           // the soft claw B holding a coconut up
const REACH_B: P2 = [-1, -124], REACH_RB = 80;                      // claw B down at the old shell on the sand
const LOOK_B: P2 = [30, -150], LOOK_RB = -60;                        // claw B holding the old shell up to look at it
const MOUTH_OFF: P2 = [0, 30];

/** the old shell of claw B: pushed up-right while the arm pulls back, then it falls to the sand */
const shellB = (t: number): {x: number; y: number; rot: number} | null => {
  if (t < SPLITC) return null;
  const top = add(RAISE_B, mul(W_DIR, 0.5 * wd(Math.min(t, FALL))));
  if (t < FALL) return {x: top[0], y: top[1], rot: RAISE_RB};
  if (t < CLUNK) { const u = seg(t, FALL, CLUNK); return {x: lerp(top[0], SHELL_LAND_B[0], u), y: lerp(top[1], SHELL_LAND_B[1], u * u), rot: lerp(RAISE_RB, SHELL_LAND_RB, u)}; }
  const b = t - CLUNK, hop = b < 0.22 ? 16 * Math.sin(Math.PI * b / 0.22) : 0;
  return {x: SHELL_LAND_B[0], y: SHELL_LAND_B[1] - hop, rot: SHELL_LAND_RB};
};

const guyAt = (t: number): GS => {
  const g: GS = {...G0};
  if (t < S2) {
    // frame 0: the coconut cracks in claw B; then he snips at the crab, smug
    g.oB = t < SPLIT ? lerp(0.55, 0.1, t / SPLIT) : lerp(0.1, 0.45, eout(seg(t, SPLIT, SPLIT + 0.25)));
    if (t > 1.0) g.oB = 0.12 + 0.4 * Math.abs(Math.sin((t - 1.0) * 14));
    g.mood = t < 0.9 ? 'joy' : 'smug';
    g.look = t < 0.9 ? [0.8, -0.2] : [1, 0.3];
    g.tilt = t < 0.9 ? -3 * Math.sin(t * 6) : 4;
    g.sq = hit(t, 0, 0.5, 9);
    return g;
  }
  if (t < S3) {
    // the molt (close-up): the shell splits at the wrist, the arm pulls back out of it, a soft claw comes out and droops
    const d = wd(t);
    g.hB = sub(RAISE_B, mul(W_DIR, 0.5 * d)); g.rB = RAISE_RB;
    g.kB = t < SPLITC ? 1 : 0; g.oB = t < SPLITC ? 0.3 : 0.2;
    const stretch = t > W0 ? Math.sin(Math.PI * seg(t, W0, W1 + 0.1)) : 0;
    g.sxB = 1 + 0.25 * stretch; g.syB = 1 - 0.4 * stretch;
    if (t > W1) {
      const u = eout(seg(t, W1, W1 + 0.5));
      g.hB = lp2(sub(RAISE_B, mul(W_DIR, 0.5 * 150)), DROOP_B, u); g.rB = lerp(RAISE_RB, 24, u); g.dB = u;
    }
    g.clawB = t < SPLITC || t >= W0 + 0.06;
    g.mood = t < SPLITC ? 'smug' : t < W1 + 0.1 ? 'pop' : 'worry';
    g.look = t < SPLITC ? [1, 0.3] : t < W1 + 0.1 ? [0.9, -0.3] : [0.9, 0.5];
    g.sq = hit(t, SPLITC, 0.7, 9);
    g.tilt = t > W1 ? -5 : 0;
    return g;
  }
  // soft claws from here on
  g.kA = 0; g.kB = 0; g.dA = 1; g.dB = 1; g.oA = 0.25; g.oB = 0.25;
  g.hA = SOFT_REST_A; g.hB = SOFT_REST_B; g.rA = 98; g.rB = 82;
  if (t < S6) {
    g.mood = t < DING ? 'worry' : t < DING + 0.5 ? 'pop' : 'worry'; g.look = [1, -0.6];
    return g;
  }
  if (t < S7) {
    // the soft claw squeezes a coconut: it squishes, the coconut squirts up and lands on his head
    g.hB = S6_B; g.rB = S6_RB; g.dB = 0.3;
    if (t < SQUIRT) {
      const sq = seg(t, SQZ, SQUIRT);
      g.oB = lerp(0.5, 0.06, sq); g.sxB = 1 + 0.14 * Math.sin(sq * Math.PI); g.syB = 1 - 0.22 * Math.sin(sq * Math.PI);
      g.mood = t < SQZ ? 'happy' : 'focus'; g.look = [0.8, -0.2];
      g.tilt = t > SQZ ? 3 * Math.sin(t * 40) * sq : 0;
      return g;
    }
    g.dB = lerp(0.3, 1, eout(seg(t, SQUIRT, SQUIRT + 0.3))); g.oB = 0.5;
    if (t > BONK) { const u = eio(seg(t, BONK, BONK + 0.3)); g.hB = lp2(S6_B, SOFT_REST_B, u); g.rB = lerp(S6_RB, 82, u); }
    g.mood = t < BONK ? 'pop' : 'dazed'; g.look = [0.2, -1];
    g.sq = hit(t, BONK, 0.9, 8);
    return g;
  }
  if (t < S8) {
    // he reaches down for the old shell, picks it up and looks at it
    if (t < LIFT) { const u = eio(seg(t, S7, LIFT)); g.hB = lp2(SOFT_REST_B, REACH_B, u); g.rB = lerp(82, REACH_RB, u); g.oB = lerp(0.25, 0.55, u); g.dB = lerp(1, 0.5, u); }
    else { const u = eio(seg(t, LIFT + 0.04, LIFT + 0.4)); g.hB = lp2(REACH_B, LOOK_B, u); g.rB = lerp(REACH_RB, LOOK_RB, u); g.oB = 0.18; g.dB = 0.5; }
    g.mood = t < LIFT + 0.3 ? 'worry' : 'focus'; g.look = t < LIFT + 0.3 ? [0.6, 1] : [0.8, 0.5];
    return g;
  }
  // the old shell sticks out of his mouth: he eats it, the claws harden, the crab tosses him a coconut, he catches it
  const hardU = eio(seg(t, HARD, HARD + 0.28));
  g.kA = hardU; g.kB = hardU; g.dA = 1 - hardU; g.dB = 1 - hardU;
  g.hA = lp2(SOFT_REST_A, REST_A, hardU); g.rA = lerp(98, 100, hardU);
  const chew = t > B1 && t < GULP + 0.06 ? 1 : 0;
  g.mood = t < B1 ? 'focus' : t < GULP + 0.06 ? 'chew' : t < HARD + 0.3 ? 'pop' : 'joy';
  g.cheek = chew * Math.min(1, (t - B1) / 0.2);
  g.look = t < HARD + 0.3 ? [0.5, 0.2] : [0.9, -0.3];
  g.sq = hit(t, B1, 0.35, 10) + hit(t, B2, 0.35, 10) + hit(t, B3, 0.35, 10) + hit(t, CATCH, 0.3, 10);
  if (t > TOSS) {
    const u = eio(seg(t, TOSS + 0.04, CATCH));
    g.hB = lp2(SOFT_REST_B, RAISE_B, u); g.rB = lerp(82, RAISE_RB, u); g.oB = t < CATCH ? lerp(0.25, 0.7, u) : lerp(0.7, 0.55, seg(t, CATCH, CATCH + 0.1));
  }
  return g;
};

const crabAt = (t: number): CS => {
  const bob = 3 * Math.sin(t * 2.2);
  const c: CS = {x: CX, y: 0, s: CS0, mood: 'smug', look: [-1, -0.2], tilt: 0, bob, cA: [-58, -62], cB: [104, -150], rA: 84, rB: -60, oA: 0.15, oB: 0.3};
  if (t < S3) {
    // smug; snips the claw in front of it back at him
    if (t > SNIP) c.oA = 0.12 + 0.5 * Math.abs(Math.sin((t - SNIP) * 13));
    c.mood = t < SNIP ? 'smug' : 'grin';
    c.look = [-1, -0.1];
    return c;
  }
  if (t < S6) {
    // pinches the tester handle: claw B grips it, squeezes, the puck shoots up, DING
    c.cB = [130, -110]; c.rB = -6;
    const sq = eio(seg(t, SQ0, SQ0 + 0.3));
    c.oB = lerp(0.5, 0.06, sq);
    c.mood = t < DING ? 'smug' : 'grin';
    c.look = t < PUCK0 ? [1, 0.2] : t < DING + 0.1 ? [0.8, -1] : [-1, -0.2];
    c.cA = [-110, -150]; c.rA = -120; c.oA = 0.2 + (t > DING ? 0.35 * Math.abs(Math.sin((t - DING) * 14)) : 0);
    c.tilt = t > DING ? 4 * Math.sin((t - DING) * 8) * Math.exp(-(t - DING) * 2) : 0;
    return c;
  }
  if (t < S7) {
    c.cB = [104, -150]; c.rB = -80; c.oB = 0.2;
    if (t > BONK + 0.05) { c.mood = 'laugh'; c.tilt = 5 * Math.sin((t - BONK) * 22); c.bob = bob + 4 * Math.abs(Math.sin((t - BONK) * 22)); }
    else c.mood = t > SQUIRT ? 'shock' : 'smug';
    c.look = [-1, -0.6];
    return c;
  }
  if (t < S8) {
    // it crunches its own old shell (a piece in claw A at its mouth)
    c.cA = [-46, -112]; c.rA = -30; c.oA = 0.3;
    c.mood = t < CBITE ? 'smug' : t < CBITE + 0.5 ? 'chomp' : 'smug';
    return c;
  }
  // watches him eat; tosses him a coconut from claw A
  c.mood = t < HARD ? 'calm' : 'grin';
  c.cA = [-96, -150]; c.rA = -150; c.oA = 0.45;
  if (t > TOSS - 0.12) { const u = seg(t, TOSS - 0.12, TOSS + 0.1); c.cA = lp2([-96, -150], [-120, -210], eout(u)); c.rA = lerp(-150, -110, eout(u)); c.oA = t < TOSS ? 0.45 : 0.75; }
  return c;
};

type CK = {x: number; y: number; k: number};
const CAM0: CK = {x: 50, y: -240, k: 2.72};
const camFor = (t: number): CK => {
  if (t < S2) { const u = eio(seg(t, 0, S2)); return {x: lerp(CAM0.x, 46, u), y: lerp(CAM0.y, -240, u), k: lerp(CAM0.k, 2.82, u)}; }
  if (t < S3) { const u = eio(seg(t, W1, S3)); return {x: lerp(20, 10, u), y: lerp(-250, -236, u), k: lerp(3.3, 3.45, u)}; }
  if (t < S4) { const u = eio(seg(t, S3, S4)); return {x: lerp(336, 342, u), y: lerp(-300, -318, u), k: lerp(1.9, 1.98, u)}; }
  if (t < S6) return {x: 170, y: -150, k: lerp(2.1, 2.2, seg(t, S4, S6))};
  if (t < S7) return {x: 14, y: -252, k: lerp(2.55, 2.66, seg(t, S6, S7))};
  if (t < S8) return {x: 20, y: -150, k: 2.4};
  const u = eio(seg(t, HARD, PUSH));
  return {x: lerp(-38, CAM0.x, u), y: lerp(-240, CAM0.y, u), k: lerp(3.15, CAM0.k, u)};
};

export const CrabScene: React.FC<{t: number; camK?: CK; thumb?: boolean; thumbG?: Partial<GS>; thumbC?: Partial<CS>}> = ({t, camK, thumb, thumbG, thumbC}) => {
  const g0 = guyAt(t), c0 = crabAt(t);
  const g = thumbG ? {...g0, ...thumbG} : g0;
  const c = thumbC ? {...c0, ...thumbC} : c0;
  const ck = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 7, 8) + hit(t, SPLITC, 8, 8) + hit(t, CLUNK, 6, 8) + hit(t, DING, 4, 8) + hit(t, BONK, 8, 8));
  const k = ck.k;
  const cam = {x: ck.x + sh.x / k, y: ck.y + sh.y / k, z: 1000 - 1000 / k};
  const z = (n: number) => n / k;
  const shot = t < S2 ? 1 : t < S3 ? 2 : t < S4 ? 3 : t < S5 ? 4 : t < S6 ? 5 : t < S7 ? 6 : t < S8 ? 7 : 8;
  const xS = popIn(t, S4 + 0.02, 0.32) * inS(t, S4, S6) * (1 - seg(t, S6 - 0.14, S6));
  const dimA = xS > 0.01 ? 0.5 * xS : 0;
  const head: P2 = [g.x, g.y + NECK];
  const clawPt = (h: P2, rot: number, p: P2) => add(h, rot2(p, rot));
  // his coconut in frame 0: whole (cracking) until SPLIT, then two halves fly and land
  const HOLD: P2 = [122, -4];
  const holdPt = clawPt(RAISE_B, RAISE_RB, HOLD);
  const halves = shot === 1 && t >= SPLIT ? ([-1, 1] as const).map((sd) => {
    const u = seg(t, SPLIT, SPLIT + 0.62);
    const land = sd < 0 ? HALF_LAND_L : HALF_LAND_R;
    const x = lerp(holdPt[0] + sd * 8, land[0], u), y = lerp(holdPt[1], land[1], u) - 130 * Math.sin(Math.PI * Math.min(1, u * 1.1)) * (1 - u * 0.4);
    return {x, y: Math.min(land[1], y), rot: sd < 0 ? 180 + 300 * u : 300 * u};
  }) : null;
  // the tester
  const tv = shot === 3 ? T_MAX * eout(seg(t, PUCK0, DING)) * (1 - 0.02 * Math.sin((t - DING) * 30) * (t > DING ? Math.exp(-(t - DING) * 4) : 0)) : 0;
  const ring = shot === 3 && t > DING ? Math.exp(-(t - DING) * 3) : 0;
  const press = shot === 3 ? eio(seg(t, SQ0, SQ0 + 0.3)) : 0;
  // the soft claw's coconut (shot 6): held, squished, squirts up, bonks his head, rolls off
  const coco6 = (() => {
    if (shot !== 6) return null;
    const hp = clawPt(g.hB, g.rB, HOLD);
    if (t < SQUIRT) return null;
    const top: P2 = [head[0] + 4, head[1] - HEAD_R - CR + 4];
    if (t < BONK) { const u = seg(t, SQUIRT, BONK); return {x: lerp(hp[0], top[0], u), y: lerp(hp[1], top[1], u) - 150 * Math.sin(Math.PI * u), rot: 400 * u, sq: 0}; }
    const u = seg(t, BONK, BONK + 0.4);
    return {x: top[0] - 80 * u, y: top[1] - 50 * Math.sin(Math.PI * u) + 280 * u * u, rot: 400 - 300 * u, sq: 0};
  })();
  // the crab's toss (shot 8): from its claw A to his claw B
  const toss = (() => {
    if (shot !== 8 || t < TOSS) return null;
    const from = add([c.x, c.y], mul(clawPt([-120, -210], -110, [100, 0]), c.s));
    const to = clawPt(RAISE_B, RAISE_RB, HOLD);
    if (t >= CATCH) return null;
    const u = seg(t, TOSS, CATCH);
    return {x: lerp(from[0], to[0], u), y: lerp(from[1], to[1], u) - 170 * Math.sin(Math.PI * u), rot: -500 * u};
  })();
  // the old shell B: falls in shot 2, lies on the sand, is picked up at LIFT, sticks out of his mouth in shot 8 and is eaten
  const sb = shellB(t);
  const bitesN = t < B1 ? 0 : t < B2 ? 1.3 : t < B3 ? 2.6 : 4;
  const shellOnSand = sb && shot >= 3 && !(shot === 7 && t >= LIFT) && shot < 8;
  const held = shot === 7 && t >= LIFT ? (() => {
    const tip = clawPt(g.hB, g.rB, [118, 4]);
    const rot = SHELL_LAND_RB + (g.rB - REACH_RB);
    return {...sub(tip, rot2([66, 0], rot)).reduce((o, v, i) => ({...o, [i ? 'y' : 'x']: v}), {x: 0, y: 0}), rot};
  })() : null;
  const inMouth = shot === 8 && t < GULP ? (() => {
    const m = add(head, MOUTH_OFF), sc = 0.8;
    const shift = 28 * sc * bitesN;
    return {x: m[0] + 118 * sc - shift, y: m[1] - 6, rot: 186, s: sc};
  })() : null;
  const midB = shot === 1 && t < SPLIT ? <CocoG x={HOLD[0]} y={HOLD[1]} s={0.86} crack={0.4 + 0.6 * t / SPLIT} />
    : shot === 6 && t < SQUIRT ? <CocoG x={HOLD[0]} y={HOLD[1]} s={0.86} sq={0.7 * Math.sin(Math.PI * seg(t, SQZ, SQUIRT))} />
    : shot === 8 && t >= CATCH ? <CocoG x={HOLD[0]} y={HOLD[1]} s={0.86} /> : undefined;
  const stk = {
    crack: t < 0.9 ? 1 - seg(t, 0.75, 0.9) : 0,
    snip: pulse(t, SNIP + 0.05, 0.55),
    crack2: popIn(t, SPLITC, 0.18) * inS(t, SPLITC, W0 + 0.14),
    fwoop: popIn(t, W0 + 0.14, 0.2) * inS(t, W0 + 0.14, CLUNK - 0.05),
    clunk: popIn(t, CLUNK, 0.18) * inS(t, CLUNK, S3) * (1 - seg(t, 3.0, 3.08)),
    soft: popIn(t, 2.95, 0.22) * inS(t, 2.95, S3),
    easy: popIn(t, SQ0 + 0.2, 0.24) * inS(t, SQ0, PUCK0 + 0.2) * (1 - seg(t, PUCK0 + 0.1, PUCK0 + 0.2)),
    ding: popIn(t, DING, 0.2) * inS(t, DING, S4),
    soft2: popIn(t, T.soft, 0.22) * inS(t, T.soft, BONK) * (1 - seg(t, BONK - 0.06, BONK)),
    bonk: popIn(t, BONK, 0.18) * inS(t, BONK, S7),
    crunchC: pulse(t, CBITE, 0.5),
    crunch: popIn(t, B1, 0.18) * inS(t, B1, GULP),
    hard: popIn(t, HARD + 0.06, 0.24) * inS(t, HARD, PUSH),
  };
  const crabShell = shot === 7 ? <Claw x={c.cA[0] + 60} y={c.cA[1] + 6} rot={150} s={0.55} shell bites={t > CBITE ? 1.4 : 0} id="cs" /> : undefined;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id="cFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Layer cam={cam} z={1700}><Far t={t} /></Layer>
      <Layer cam={cam} z={1000}>
        <W><Palm x={-330} s={1.15} lean={34} /><Palm x={720} s={1.0} lean={-30} /></W>
        <Sand />
        <Tester t={t} v={tv} ring={ring} press={press} />
        {shot >= 2 ? <><CocoHalf x={HALF_LAND_L[0]} y={HALF_LAND_L[1]} rot={250} /><CocoHalf x={HALF_LAND_R[0]} y={HALF_LAND_R[1]} rot={-70} /></> : null}
        {shot >= 3 ? <Claw x={SHELL_LAND_A[0]} y={SHELL_LAND_A[1]} rot={SHELL_LAND_RA} shell flip id="sa" /> : null}
        {shellOnSand && sb ? <Claw x={sb.x} y={sb.y} rot={sb.rot} shell crack={1} id="sb" /> : null}
        <Crab t={t} c={c} holdA={crabShell} />
        <Guy t={t} g={g} />
        <GuyClaws t={t} g={g} midB={midB} />
        {halves ? halves.map((h, i) => <CocoHalf key={'h' + i} x={h.x} y={h.y} rot={h.rot} />) : null}
        {shot === 2 && sb ? <Claw x={sb.x} y={sb.y} rot={sb.rot} shell crack={seg(t, SPLITC, SPLITC + 0.12)} id="sb2" /> : null}
        {coco6 ? <Coconut x={coco6.x} y={coco6.y} rot={coco6.rot} s={0.86} sq={coco6.sq} /> : null}
        {toss ? <Coconut x={toss.x} y={toss.y} rot={toss.rot} s={0.86} /> : null}
        {held ? <Claw x={held.x} y={held.y} rot={held.rot} shell crack={1} id="hs" /> : null}
        {inMouth ? <Claw x={inMouth.x} y={inMouth.y} rot={inMouth.rot} s={inMouth.s} shell bites={bitesN} id="ms" /> : null}
        {shot === 1 ? <Drops t={t} t0={SPLIT} x={holdPt[0]} y={holdPt[1]} n={12} color="#E8F6FF" seed={3} spd={300} /> : null}
        {shot === 8 ? [B1, B2, B3].map((b, i) => <Drops key={i} t={t} t0={b} x={head[0] + 40} y={head[1] + 34} n={7} color={CRAB} seed={11 + i * 5} spd={200} r={6} life={0.7} />) : null}
        {shot === 7 ? <Drops t={t} t0={CBITE} x={c.x - 40} y={-120} n={6} color={CRAB} seed={31} spd={170} r={5} life={0.7} /> : null}
        {/* sparkles and dizzy stars */}
        {shot === 8 && t > HARD ? <><Star x={g.hB[0] + 60} y={g.hB[1] - 30} s={pulse(t, HARD, 0.45) * 0.9} rot={t * 300} /><Star x={g.hA[0] - 30} y={g.hA[1] + 40} s={pulse(t, HARD + 0.06, 0.4) * 0.8} rot={-t * 300} /></> : null}
        {shot === 6 && t > BONK ? [0, 1, 2].map((i) => { const a = t * 6 + (i * 2 * Math.PI) / 3; return <Star key={i} x={head[0] + 70 * Math.cos(a)} y={head[1] - 70 + 18 * Math.sin(a)} s={0.45 * popIn(t, BONK + 0.05, 0.2)} rot={t * 200} />; }) : null}
        {shot === 3 && t > DING ? <Star x={TX} y={T_TOP - 40} s={pulse(t, DING, 0.5)} rot={t * 300} /> : null}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={holdPt[0] + 78} y={holdPt[1] + 4} s={stk.crack} text="CRACK" size={z(110)} rot={-8} fill={GOLD} />
        <Txt x={c.x - 30} y={40} s={stk.snip} text="SNIP SNIP" size={z(70)} rot={-6} fill="#FFFFFF" />
        <Txt x={RAISE_B[0] + 30} y={RAISE_B[1] + 74} s={stk.crack2} text="CRACK" size={z(96)} rot={-6} fill="#FFFFFF" />
        <Txt x={70} y={-360} s={stk.fwoop} text="FWOOP" size={z(96)} rot={-8} fill={GOLD} />
        <Txt x={SHELL_LAND_B[0] + 90} y={SHELL_LAND_B[1] - 66} s={stk.clunk} text="CLUNK" size={z(90)} rot={6} fill="#FFFFFF" />
        <Txt x={64} y={-300} s={stk.soft} text="SOFT" size={z(110)} rot={6} fill={GOLD} />
        <Txt x={TX - 130} y={-240} s={stk.easy} text="EASY" size={z(84)} rot={-6} fill="#FFFFFF" />
        <Txt x={TX - 110} y={T_TOP + 50} s={stk.ding} text="DING" size={z(110)} rot={-8} fill={GOLD} />
        <Txt x={70} y={-330} s={stk.soft2} text="SOFT" size={z(104)} rot={6} fill={GOLD} />
        <Txt x={head[0] + 110} y={head[1] - 90} s={stk.bonk} text="BONK" size={z(110)} rot={8} fill="#FFFFFF" />
        <Txt x={c.x - 60} y={-236} s={stk.crunchC} text="CRUNCH" size={z(72)} rot={6} fill="#FFFFFF" />
        <Txt x={head[0] + 100} y={head[1] - 100} s={stk.crunch} text="CRUNCH" size={z(96)} rot={7} fill={GOLD} />
        <Txt x={head[0] + 60} y={head[1] + 190} s={stk.hard} text="HARD AGAIN" size={z(92)} rot={-4} fill={GOLD} />
      </Layer>}
      {dimA > 0.01 ? <AbsoluteFill style={{background: '#0D1230', opacity: dimA}} /> : null}
      {thumb ? null : <>
        <XRayClaw t={t} s={xS} />
        <CountBox label="PINCH" val={`${Math.round(tv)} KG`} sub2="COCONUT CRAB" col={RED}
          s={popIn(t, 4.4, 0.26) * inS(t, S3, S4) * (1 - seg(t, S4 - 0.12, S4))} top={1660} bump={hit(t, DING, 1, 6)} />
        <CountBox label="MUSCLE" val={`${Math.round(100 - 50 * eio(seg(t, SHR0, SHR1)))}%`} col={RED}
          s={popIn(t, SHR0 - 0.2, 0.26) * inS(t, S5, S6) * (1 - seg(t, S6 - 0.12, S6))} top={1640} bump={hit(t, SHR1, 1, 6)} />
        <Card text="HALF" top={1450} left={810} color={GOLD} rot={8} s={popIn(t, T.half, 0.26) * inS(t, T.half, OUT0)} size={64} />
        <CommentBubble t={t} text="what if you had a crab's claws??" handle="@pinchy_doodle" likes="3.1K" out={1.5} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.to} until={PUSH - 0.4} text="Would you still want them?" />
      </>}
    </AbsoluteFill>
  );
};

export const crabCues = (): Cue[] => {
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -21 : db}));
  const waves: Cue[] = Array.from({length: 7}, (_, i) => ({f: 'waves.wav', at: 0.02 + i * 2.7, db: -36}));
  const cues: Cue[] = [
    // frame 0: the coconut cracks in his claw; the crab cracks its own
    {f: 'crack.wav', at: 0, db: -10, from: 0.29}, {f: 'whoosh.wav', at: 0, db: -34}, {f: 'splash.wav', at: SPLIT + 0.03, db: -31},
    {f: 'seagulls.wav', at: 0.25, db: -36, to: 2.5}, ...waves,
    {f: 'clack.wav', at: SNIP + 0.06, db: -26}, {f: 'clack.wav', at: SNIP + 0.3, db: -28}, {f: 'clack.wav', at: SNIP + 0.54, db: -29},
    // the molt: the shell splits at the wrist, the soft claw slides out, the empty shell lands
    {f: 'whoosh.wav', at: S2 - 0.02, db: -30}, {f: 'crack.wav', at: SPLITC - 0.3, db: -13}, {f: 'rip_short.wav', at: SPLITC + 0.03, db: -26},
    {f: 'squelch.wav', at: W0 + 0.06, db: -22}, {f: 'fwoop.wav', at: W0 + 0.14, db: -16}, {f: 'whistle.wav', at: FALL, db: -31, to: 0.25},
    {f: 'bonk.wav', at: CLUNK, db: -19}, {f: 'thud.wav', at: CLUNK, db: -27}, {f: 'bonk.wav', at: CLUNK + 0.22, db: -29}, {f: 'crowd_gasp.wav', at: CLUNK + 0.06, db: -32, to: 0.75},
    {f: 'squeak.wav', at: 2.95, db: -27},
    // the strength tester: grip, the puck shoots up, DING
    {f: 'whoosh.wav', at: S3 - 0.02, db: -30}, {f: 'clack.wav', at: SQ0 + 0.2, db: -24}, {f: 'pop.wav', at: 4.4, db: -28},
    {f: 'slide_up.wav', at: PUCK0, db: -27, to: 0.5}, ...ticks(PUCK0, DING - 0.04, 9, -30), {f: 'ding.mp3', at: DING, db: -21}, {f: 'crowd_ooh.wav', at: DING + 0.05, db: -34, to: 1.0},
    // X-RAY A: the shell glows, the muscle pushes, nothing gives
    {f: 'zap.wav', at: S4, db: -26}, {f: 'pop.wav', at: S4 + 0.06, db: -27}, {f: 'shing.wav', at: GLOW, db: -27, to: 0.4},
    {f: 'stretch.wav', at: PUSHM, db: -27, to: 0.6}, {f: 'creak.wav', at: PUSHM + 0.25, db: -27, to: 0.4}, {f: 'wrong.wav', at: STAMP, db: -28, to: 0.45},
    ...ctaCues(T.cta),
    // X-RAY B: the muscle shrinks by half and slides out through the narrow joint
    {f: 'pop.wav', at: MUS, db: -27}, {f: 'scribble.wav', at: NARROW, db: -28, to: 0.4}, {f: 'slide_down.wav', at: SHR0, db: -27},
    ...ticks(SHR0, SHR1, 6, -31), {f: 'ding.mp3', at: SHR1 + 0.02, db: -27}, {f: 'fwoop.wav', at: OUT0 + 0.05, db: -19}, {f: 'pop.wav', at: OUT1, db: -28},
    // the soft claw: squish, the coconut squirts up and bonks his head, the laugh
    {f: 'whoosh.wav', at: S6 - 0.02, db: -30}, {f: 'squeak.wav', at: SQZ + 0.1, db: -23}, {f: 'squelch.wav', at: SQZ + 0.3, db: -25},
    {f: 'boing.wav', at: SQUIRT, db: -27}, {f: 'bonk.wav', at: BONK, db: -12}, {f: 'crowd_laugh.wav', at: BONK + 0.08, db: -27, to: 0.85}, {f: 'dizzy_birds.wav', at: BONK + 0.1, db: -32, to: 0.45},
    // the crab crunches its old shell; he picks his up
    {f: 'whoosh.wav', at: S7 - 0.02, db: -30}, {f: 'chomp.wav', at: CBITE, db: -27}, {f: 'pop.wav', at: LIFT + 0.1, db: -29},
    // he eats it, the claws harden, he grabs a coconut
    {f: 'whoosh.wav', at: S8 - 0.02, db: -30}, {f: 'chomp.wav', at: B1, db: -22}, {f: 'chomp.wav', at: B2, db: -21}, {f: 'chomp.wav', at: B3, db: -21},
    {f: 'gulp.wav', at: GULP - 0.05, db: -24}, {f: 'shing.wav', at: HARD + 0.04, db: -22, to: 0.45}, {f: 'ding.mp3', at: HARD + 0.1, db: -28},
    {f: 'whoosh.wav', at: TOSS, db: -31}, {f: 'clack.wav', at: CATCH, db: -22}, {f: 'pop.wav', at: CATCH + 0.02, db: -28},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  // every effect after frame 0 sits 3 dB lower than written above, so the voice stays clear
  return cues.map((c) => (c.at > 0.05 ? {...c, db: c.db - 3} : c));
};
/** the sound effects alone (no voice) - for checking the mix: render.mjs CrabFx work/fx.wav */
export const CrabFx: React.FC = () => <SoundLayer cues={crabCues()} />;
export const CrabVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<CrabScene t={0} />}>
        <CrabScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="crab/vo/tight.mp3" voiceAt={0.1} cues={crabCues()} />
    </AbsoluteFill>
  );
};
export const CrabWide: React.FC = () => <WideFit.Provider value={0.72}><CrabVideo /></WideFit.Provider>;
