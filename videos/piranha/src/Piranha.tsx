// "What if you had a piranha's teeth?" - shark formula (CLAUDE.md, Growth), niche: animal powers. All drawn in code.
// Frame 0: close-up at the dinner table - a mouth full of interlocking piranha teeth crunches a coconut in half (CHOMP),
// a smug black piranha watches from its fishbowl (the power at its best). 2.03 s every tooth on the left side drops out
// as ONE piece (2.30 CLUNK on the table, HALF GONE). 3.05 X-RAY: PIRANHA - the teeth slide together and their side cusps
// click (LOCKED), the rows glow as one saw edge (ONE BLADE), a new set waits in the bone. 5.30 the piranha bites a drumstick
// to the bone and cracks it, ITS BITE x1 -> x30. 7.70 a log bite-off: the crocodile only dents its end, he snaps his end
// off (HARDER), the croc's jaw drops. 9.80 the piranha: ONE BY ONE? - NOPE; 12.85 its whole near side drops out (CLUNK),
// the new set slides up (NEW SET). 13.80 soup: his other side drops into it (SPLASH, laugh). 14.90 he smiles with one side,
// a hand over the gap; 16.95 the new set grows in, full grin -> the loop push to frame 0.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, pen} from './lib/kit';

// voice: tight.mp3 at 0.1 s (scripts/vsplice.py: line 1 at 1.22, the rest at 1.12; word times refined to the loudness
// chunks with scripts/refine_words.py) - src/data/words.json. Last word ends 17.07 s; + 0.88 s for the loop push.
export const DURATION = 17.95;
export const T = {
  get: 0.12, teeth: 0.84, and: 1.22, half: 1.40, fall: 2.01, out: 2.16, at: 2.31, once: 2.46,
  they: 3.10, lock: 3.30, together: 3.45, like: 4.21, one: 4.39, saw: 4.60, blade: 4.88,
  bites: 5.47, thirty: 6.12, times: 6.45, weight: 7.24,
  you: 7.83, thats: 8.37, harder: 8.57, crocodile: 8.98,
  but: 9.83, teeth2: 10.12, dont: 10.39, one2: 11.01, one3: 11.48,
  whole: 11.96, side: 12.36, drops: 12.83, together2: 13.21,
  then: 13.86, other: 14.10, side2: 14.30,
  so: 14.93, now: 15.13, smiles: 15.90, one4: 16.43, side3: 16.55,
  cta: 9.95,
};
// shots (hard cuts)
const S2 = 1.95, S3 = 3.05, S4 = 5.30, S5 = 7.70, S6 = 9.80, S7 = 11.75, S8 = 13.80, S9 = 14.90;
const PUSH = DURATION - LOOP_DUR;
const SPLIT = 0.06, SHINE = 0.84;                                  // frame 0: the coconut splits, the teeth gleam
const DROP1 = 2.03, CLUNK1 = 2.30;                                 // his left side drops onto the table
const LOCK = 3.30, BLADE = 4.60, NEWX = 3.95;                       // X-ray
const STICK0 = 5.30, BITE = 5.47, CRACKB = 5.64;                   // the piranha and the drumstick
const DENT = 7.95, SNAPL = 8.40, JAWDROP = 9.02;                    // log bite-off
const RING = 10.36, ONEBY = 10.98, NOPE = 11.48;                    // "one by one?" - nope
const PDROP = 12.85, PLAND = 13.20, PNEW = 13.30;                   // the piranha's near side drops, the new set slides up
const DROP2 = 14.12, SPLASH = 14.32;                               // his other side drops into the soup
const COVER = 15.02, REGROW = 16.95;                               // half a smile, then the new set grows in

const GOLD = '#FFD43B', RED = '#E2453C', WHITE = '#FFFFFF', FACE_C = '#F1EFEA';
const GUM = '#EE97A6', MOUTH_C = '#5A2328', TONGUE = '#E4677A', TOOTH = '#FFFFFF';
const P_BODY = '#66788B', P_BACK = '#52627A', P_BELLY = '#CDD5DC', P_THROAT = '#E2683F', P_FIN = '#4F5F73', P_EYE = '#E23B2E';
const CROC = '#62A04E', CROC_DK = '#477F38', CROC_BELLY = '#D6E8A6';
const WOOD = '#D29A62', WOOD_DK = '#AD7643', WOOD_TOP = '#E3B17C';
const WATER = '#8FD0EC', COCO = '#8C5A36', COCO_DK = '#6B4226', COCO_IN = '#FFFDF4';
const SOUP = '#EA7A3C', SOUP_DK = '#C95A28', LOG = '#A06E42', LOG_DK = '#7D5332', LOG_END = '#EAC892';
const XNAVY = '#151C40', XLINE = '#7F93D1', XBONE = '#2E3B7E', BONE = '#F4F8FF';

type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const rot2 = (p: P2, deg: number): P2 => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const inS = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.24) * (1 - seg(t, a + d, a + d + 0.16));

// ---------- stickers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot}) scale(${s.toFixed(3)})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const CountBox: React.FC<{label: string; val: string; sub2: string; col: string; s: number; top: number; bump?: number}> = ({label, val, sub2, col, s, top, bump = 0}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s * (1 + 0.1 * bump)})`, background: '#FFFDF6', border: `9px solid ${INK}`,
    borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '4px 36px 10px', textAlign: 'center', minWidth: 360, fontFamily: FONT, color: INK, whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: 900, fontSize: 42, lineHeight: 1.1}}>{label}</div>
    <div style={{fontWeight: 900, fontSize: 118, lineHeight: 1, color: col}}>{val}</div>
    <div style={{fontWeight: 900, fontSize: 36, lineHeight: 1.1}}>{sub2}</div>
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
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number}> = ({S, H, L, sd, w = 30}) => {
  const d = quadD(S, ik(S, H, L, L, sd), H);
  return <g><path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" /><path d={d} stroke={WHITE} strokeWidth={w - 11} fill="none" strokeLinecap="round" /></g>;
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

// ---------- his piranha mouth (head coords, mouth origin at head (0, 20)) ----------
/** open 0 = teeth meshed shut .. 1 = wide open; grin lifts the corners; L / R = how much of the left / right teeth are there
 *  (0 = gone, bare gums; a value in between = growing in). Teeth with x < 0 are the left side (it drops out first). */
type MS = {open: number; grin: number; L: number; R: number};
const MW = 44;
const lipY = (x: number, m: MS) => {
  const c = 4 - 10 * m.grin, u0 = -4 - 2 * m.grin, l0 = 22 + 38 * m.open + 8 * m.grin;
  const q = Math.min(1, (x / MW) ** 2);
  return {u: u0 + (c - u0) * q, l: l0 + (c - l0) * q};
};
const UPX = [-35, -21, -7, 7, 21, 35], LOX = [-28, -14, 0, 14, 28];
const Mouth: React.FC<{m: MS; part?: 'all' | 'upper'}> = ({m, part = 'all'}) => {
  const N = 18;
  const xs = Array.from({length: N + 1}, (_, i) => -MW + (2 * MW * i) / N);
  const hAt = (x: number) => { const y = lipY(x, m); return y.l - y.u; };
  const g = (x: number) => Math.min(6.5, 0.22 * hAt(x));
  const up = xs.map((x) => [x, lipY(x, m).u] as P2), lo = xs.map((x) => [x, lipY(x, m).l] as P2);
  const outline = `M ${up.map(P).join(' L ')} L ${lo.slice().reverse().map(P).join(' L ')} Z`;
  const tooth = (x: number, dir: 1 | -1, pres: number, key: string) => {
    if (pres < 0.02) return null;
    const hw = 7;
    const base = (xx: number) => (dir > 0 ? lipY(xx, m).u + g(xx) * 0.55 : lipY(xx, m).l - g(xx) * 0.55);
    const h = Math.min(17, 0.62 * hAt(x)) * pres;
    const a: P2 = [x - hw, base(x - hw)], b: P2 = [x + hw, base(x + hw)], tip: P2 = [x, base(x) + dir * h];
    return <path key={key} d={`M ${P(a)} L ${P(tip)} L ${P(b)} Z`} fill={TOOTH} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />;
  };
  const upperTeeth = UPX.map((x, i) => tooth(x, 1, x < 0 ? m.L : m.R, 'u' + i));
  if (part === 'upper') return <g>{upperTeeth}<path d={`M ${up.map(P).join(' L ')}`} fill="none" stroke={INK} strokeWidth={5} strokeLinecap="round" /></g>;
  const gumU = `M ${xs.map((x) => P([x, lipY(x, m).u])).join(' L ')} L ${xs.slice().reverse().map((x) => P([x, lipY(x, m).u + g(x)])).join(' L ')} Z`;
  const gumL = `M ${xs.map((x) => P([x, lipY(x, m).l])).join(' L ')} L ${xs.slice().reverse().map((x) => P([x, lipY(x, m).l - g(x)])).join(' L ')} Z`;
  return (
    <g>
      <path d={outline} fill={MOUTH_C} />
      {m.open > 0.2 ? <ellipse cx={0} cy={lipY(0, m).l - 9} rx={17} ry={6 * Math.min(1, m.open * 1.6)} fill={TONGUE} /> : null}
      <path d={gumU} fill={GUM} /><path d={gumL} fill={GUM} />
      {LOX.map((x, i) => tooth(x, -1, x < 0 ? m.L : m.R, 'l' + i))}
      {upperTeeth}
      <path d={outline} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g>
  );
};
/** one side of his teeth that came out as one piece: upper gum strip with 3 teeth down, meshed with the lower strip (2 up) */
const HalfSet: React.FC<{x: number; y: number; rot: number; side: -1 | 1; s?: number}> = ({x, y, rot, side, s = 1.35}) => (
  <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${(side * s).toFixed(3)} ${s.toFixed(3)})`}>
    <rect x={-24} y={6} width={48} height={10} rx={5} fill={GUM} stroke={INK} strokeWidth={3.5} />
    {[-9, 7].map((cx) => <path key={cx} d={`M ${cx - 7} 7 L ${cx} -9 L ${cx + 7} 7 Z`} fill={TOOTH} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />)}
    <rect x={-24} y={-16} width={48} height={10} rx={5} fill={GUM} stroke={INK} strokeWidth={3.5} />
    {[-16, -2, 12].map((cx) => <path key={cx} d={`M ${cx - 7} -7 L ${cx} 9 L ${cx + 7} -7 Z`} fill={TOOTH} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />)}
  </g></W>
);

// ---------- his face ----------
type Mood = 'joy' | 'grin' | 'smug' | 'pop' | 'oof' | 'focus' | 'calm';
const Eyes: React.FC<{t: number; m: Mood; look: P2}> = ({t, m, look}) => {
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -14;
    if (m === 'joy' || m === 'grin') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (m === 'oof') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = m === 'pop' ? 1.3 : 1;
    const rx = 12 * big, ry = 15 * big;
    const lid = m === 'focus' ? 0.38 : m === 'smug' ? 0.46 : 0;
    const px = ex + look[0] * 4.5, py = ey + look[1] * 5;
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
    let d = `M ${sd * 12} -46 Q ${sd * 24} -54 ${sd * 37} -48`;
    if (m === 'focus') d = `M ${sd * 10} -36 L ${sd * 37} -44`;
    else if (m === 'oof') d = `M ${sd * 8} -34 L ${sd * 36} -46`;
    else if (m === 'pop') d = `M ${sd * 12} -58 Q ${sd * 25} -68 ${sd * 38} -60`;
    else if (m === 'smug') d = sd < 0 ? `M -12 -42 L -37 -46` : `M 12 -52 Q 25 -62 38 -54`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  void t;
  return <g>{eye(-1)}{eye(1)}{brow(-1)}{brow(1)}</g>;
};

// ---------- the guy: front view, seated behind the table; hip at (x, y) ----------
type GS = {x: number; y: number; mood: Mood; look: P2; m: MS; hA: P2; hB: P2; tilt: number; sq: number; soup: number};
const SHX = 38, SH_Y = -90, NECK = -165, L_ARM = 64;
const GX = -150, GY = 80;
const HEAD: P2 = [GX, GY + NECK];                       // (-150, -85)
const MOUTH: P2 = [GX, GY + NECK + 20];                 // mouth origin
const G0: GS = {x: GX, y: GY, mood: 'calm', look: [0, 0], m: {open: 0, grin: 0.3, L: 1, R: 1}, hA: [-232, 30], hB: [-68, 30], tilt: 0, sq: 0, soup: 0};
/** his upper teeth again, drawn over something he bites (a log), with the same head transform as Guy */
const GuyTeeth: React.FC<{g: GS}> = ({g}) => (
  <W><g transform={`translate(${g.x} ${g.y + NECK}) rotate(${g.tilt.toFixed(2)})`}>
    <g transform={`scale(${(1 + 0.08 * g.sq).toFixed(3)} ${(1 - 0.1 * g.sq).toFixed(3)})`}>
      <g transform="translate(0 20)"><Mouth m={g.m} part="upper" /></g>
    </g>
  </g></W>
);
const Guy: React.FC<{t: number; g: GS; bite?: React.ReactNode; hold?: React.ReactNode}> = ({t, g, bite, hold}) => {
  const SA: P2 = [g.x - SHX, g.y + SH_Y], SB: P2 = [g.x + SHX, g.y + SH_Y];
  const arm = (S: P2, H: P2, side: number) => {
    const v = sub(H, S);
    const sd = side < 0 ? (v[1] > 0 ? 1 : -1) : (v[1] > 0 ? -1 : 1);
    return <g key={side}><Limb S={S} H={H} L={L_ARM} sd={sd} /><circle cx={H[0]} cy={H[1]} r={14} fill={WHITE} stroke={INK} strokeWidth={5.5} /></g>;
  };
  const hx = g.x, hy = g.y + NECK;
  return (
    <W><g>
      <path transform={`translate(${g.x} ${g.y})`} d={torsoD(47, -112, 13)} fill={WHITE} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <g transform={`translate(${hx} ${hy}) rotate(${g.tilt.toFixed(2)})`}>
        <g transform={`scale(${(1 + 0.08 * g.sq).toFixed(3)} ${(1 - 0.1 * g.sq).toFixed(3)})`}>
          <circle r={HEAD_R + 1} fill="url(#pFace)" stroke={INK} strokeWidth={6.5} />
          <Eyes t={t} m={g.mood} look={g.look} />
          <g transform="translate(0 20)"><Mouth m={g.m} /></g>
          {bite ? <g>{bite}<g transform="translate(0 20)"><Mouth m={g.m} part="upper" /></g></g> : null}
          {g.soup > 0.01 ? [[-30, -30, 7], [14, -44, 5], [34, 4, 6], [-44, 10, 5], [6, -20, 4]].map(([dx, dy, r], i) =>
            <g key={i} opacity={g.soup}><ellipse cx={dx} cy={dy + 4 * g.soup * (i % 2)} rx={r} ry={r * 1.25} fill={SOUP} stroke={INK} strokeWidth={2.5} /></g>) : null}
        </g>
      </g>
      {arm(SA, g.hA, -1)}{arm(SB, g.hB, 1)}
      {hold}
    </g></W>
  );
};

// ---------- props ----------
const CR = 40;
/** hairy coconut fibres around a circle of radius r */
const Fibres: React.FC<{r: number; seed: number; a0?: number; a1?: number}> = ({r, seed, a0 = 0, a1 = 360}) => (
  <g>{Array.from({length: 16}, (_, i) => {
    const a = ((a0 + ((a1 - a0) * (i + 0.5)) / 16) * Math.PI) / 180, l = 7 + 5 * rnd(seed + i);
    return <path key={i} d={`M ${(Math.cos(a) * (r - 3)).toFixed(1)} ${(Math.sin(a) * (r - 3)).toFixed(1)} l ${(Math.cos(a + 0.5) * l).toFixed(1)} ${(Math.sin(a + 0.5) * l).toFixed(1)}`}
      stroke={COCO_DK} strokeWidth={3.5} strokeLinecap="round" />;
  })}</g>
);
/** the whole coconut in his teeth (head coords): fibres, three eyes, a crack */
const CoconutBite: React.FC<{u: number}> = ({u}) => (
  <g transform="translate(0 64)">
    <Fibres r={CR} seed={5} />
    <circle r={CR} fill={COCO} stroke={INK} strokeWidth={6} />
    {[[-20, -6], [-6, 14], [14, -12], [22, 12], [-14, 26]].map(([x, y], i) => <path key={i} d={`M ${x - 8} ${y} q 8 -5 16 0`} stroke={COCO_DK} strokeWidth={3.5} fill="none" strokeLinecap="round" />)}
    {[[-9, 12], [9, 12], [0, 24]].map(([x, y], i) => <circle key={'e' + i} cx={x} cy={y} r={4.5} fill={COCO_DK} />)}
    <path d={`M -4 -38 L 4 -22 L -6 -8 L 6 6 L -2 ${16 + 14 * u}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
  </g>
);
/** half a coconut, cut face toward +x (rotate it) */
const CocoHalf: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`}>
    <Fibres r={CR} seed={9} a0={95} a1={265} />
    <path d={`M 0 ${-CR} A ${CR} ${CR} 0 0 0 0 ${CR} Z`} fill={COCO} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M 0 ${-CR + 7} A ${CR - 7} ${CR - 7} 0 0 0 0 ${CR - 7}`} fill="none" stroke={COCO_IN} strokeWidth={9} />
    <ellipse cx={2} cy={0} rx={9} ry={CR - 2} fill={COCO_IN} stroke={INK} strokeWidth={4} />
    <path d={`M -20 -14 q 6 -4 12 0 M -26 12 q 6 -4 12 0`} stroke={COCO_DK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
  </g></W>
);
/** drops flying from a point with gravity (born at t0) */
const Drops: React.FC<{t: number; t0: number; x: number; y: number; n: number; color: string; seed: number; spd?: number; up?: number; r?: number; floor?: number}> = ({t, t0, x, y, n, color, seed, spd = 260, up = 300, r = 9, floor = 36}) => {
  const u = t - t0;
  if (u < 0 || u > 0.9) return null;
  return <W>{Array.from({length: n}, (_, i) => {
    const a = (-150 + 120 * rnd(seed + i)) * Math.PI / 180, v = spd * (0.6 + 0.6 * rnd(seed + i * 3));
    const px = x + Math.cos(a) * v * u, py = y + Math.sin(a) * v * u - up * u * 0.2 + 900 * u * u;
    const rr = r * (0.6 + 0.6 * rnd(seed + i * 7)) * (1 - u / 0.9);
    return rr > 0.5 && py < floor ? <circle key={i} cx={px} cy={py} r={rr} fill={color} stroke={INK} strokeWidth={2.5} /> : null;
  })}</W>;
};

// ---------- the set: dinner table, window, clock ----------
const TOP_Y = 40;
/** the dinner table: a gingham tablecloth over the top and down the front */
const Table: React.FC = () => (
  <W><g>
    <rect x={-1500} y={TOP_Y} width={3000} height={900} fill="#FFF7EE" />
    {Array.from({length: 50}, (_, i) => <rect key={'v' + i} x={-1500 + i * 60} y={TOP_Y + 22} width={30} height={900} fill="#E9786B" opacity={0.32} />)}
    {Array.from({length: 14}, (_, i) => <rect key={'h' + i} x={-1500} y={TOP_Y + 40 + i * 60} width={3000} height={30} fill="#E9786B" opacity={0.32} />)}
    <rect x={-1500} y={TOP_Y} width={3000} height={24} fill="#FFFDF8" stroke={INK} strokeWidth={7} />
    {Array.from({length: 50}, (_, i) => <rect key={'t' + i} x={-1500 + i * 60} y={TOP_Y + 4} width={30} height={16} fill="#E9786B" opacity={0.22} />)}
    <path d={`M -1500 ${TOP_Y + 22} H 1500`} stroke={INK} strokeWidth={7} />
  </g></W>
);
const Room: React.FC = () => (
  <W><g>
    {/* window with curtains */}
    <rect x={-640} y={-560} width={330} height={250} rx={10} fill="#CDEBFA" stroke={INK} strokeWidth={8} />
    <path d="M -475 -560 V -310 M -640 -435 H -310" stroke={INK} strokeWidth={7} />
    <path d="M -600 -470 q 30 -30 60 -6 q 24 -26 54 -2" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" />
    {[-1, 1].map((sd) => <path key={sd} d={sd < 0 ? 'M -660 -580 Q -610 -440 -680 -290 L -705 -290 L -705 -580 Z' : 'M -290 -580 Q -340 -440 -270 -290 L -245 -290 L -245 -580 Z'}
      fill="#E9786B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
    {/* clock */}
    <circle cx={420} cy={-470} r={74} fill="#FFFDF6" stroke={INK} strokeWidth={8} />
    {Array.from({length: 12}, (_, i) => { const a = (i / 12) * Math.PI * 2; return <circle key={i} cx={420 + Math.sin(a) * 56} cy={-470 - Math.cos(a) * 56} r={5} fill={INK} />; })}
    <path d="M 420 -470 L 420 -520 M 420 -470 L 452 -456" stroke={INK} strokeWidth={8} strokeLinecap="round" />
    {/* shelf with a plant */}
    <rect x={140} y={-300} width={210} height={16} rx={5} fill={WOOD} stroke={INK} strokeWidth={6} />
    <path d="M 190 -300 L 196 -350 L 244 -350 L 250 -300 Z" fill="#E9786B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-30, -8, 14].map((dx, i) => <path key={i} d={`M ${220 + dx * 0.3} -350 q ${dx} -40 ${dx * 1.6} -70`} stroke="#4FA36A" strokeWidth={10} fill="none" strokeLinecap="round" />)}
  </g></W>
);

// ---------- the fishbowl ----------
const BX = 96, BY = -70, BR = 122;
const RIM_Y = BY - 0.8 * BR, WAT_Y = BY - 0.7 * BR, BOT_Y = BY + 0.92 * BR;
const bowlD = () => {
  const rl: P2 = [BX - 0.6 * BR, RIM_Y], rr: P2 = [BX + 0.6 * BR, RIM_Y], bl: P2 = [BX - 0.39 * BR, BOT_Y], br: P2 = [BX + 0.39 * BR, BOT_Y];
  return `M ${P(rl)} A ${BR} ${BR} 0 0 0 ${P(bl)} L ${P(br)} A ${BR} ${BR} 0 0 0 ${P(rr)}`;
};
const BowlBack: React.FC<{t: number}> = ({t}) => (
  <W><g>
    {/* gravel and a water plant */}
    {Array.from({length: 26}, (_, i) => { const x = BX - 0.36 * BR + (i % 13) * 7.2 + (i > 12 ? 3.5 : 0), y = BOT_Y - 8 - (i > 12 ? 9 : 0);
      return <circle key={i} cx={x} cy={y} r={6.5} fill={['#F2C76B', '#E9786B', '#8FC7E8', '#F4F0E6'][i % 4]} stroke={INK} strokeWidth={2.5} />; })}
    {[0, 1, 2].map((i) => <path key={i} d={`M ${BX + 52 + i * 9} ${BOT_Y - 14} q ${-14 + 8 * Math.sin(t * 2 + i)} -40 ${4 + 6 * Math.sin(t * 2.4 + i)} -${80 - i * 16}`}
      stroke="#4FA36A" strokeWidth={9} fill="none" strokeLinecap="round" />)}
  </g></W>
);
const BowlGlass: React.FC<{t: number}> = ({t}) => {
  const hw = 0.714 * BR;
  const wl: P2 = [BX - hw, WAT_Y], wr: P2 = [BX + hw, WAT_Y], bl: P2 = [BX - 0.39 * BR, BOT_Y], br: P2 = [BX + 0.39 * BR, BOT_Y];
  const surf = Array.from({length: 13}, (_, i) => { const x = BX - hw + (2 * hw * i) / 12; return [x, WAT_Y + 2.5 * Math.sin(t * 3 + i * 0.9)] as P2; });
  return (
    <W><g>
      <path d={`M ${P(wl)} A ${BR} ${BR} 0 0 0 ${P(bl)} L ${P(br)} A ${BR} ${BR} 0 0 0 ${P(wr)} Z`} fill={WATER} opacity={0.36} />
      <path d={`M ${surf.map(P).join(' L ')}`} stroke="#5FB4DC" strokeWidth={5} fill="none" strokeLinecap="round" />
      {[0, 1, 2].map((i) => { const u = ((t * 0.55 + i * 0.37) % 1); return <circle key={i} cx={BX + 30 + 12 * Math.sin(t * 3 + i)} cy={lerp(BOT_Y - 30, WAT_Y + 8, u)} r={5 + 2 * i} fill="none" stroke="#FFFFFF" strokeWidth={3} opacity={0.9} />; })}
      <path d={bowlD()} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={BX} cy={RIM_Y} rx={0.6 * BR} ry={11} fill="none" stroke={INK} strokeWidth={6} />
      <path d={`M ${BX - 0.78 * BR} ${BY - 0.2 * BR} A ${BR * 0.86} ${BR * 0.86} 0 0 1 ${BX - 0.42 * BR} ${BY - 0.62 * BR}`} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.9} />
    </g></W>
  );
};

// ---------- the piranha: side view, facing left (fx -1 faces right) ----------
type PMood = 'smug' | 'grin' | 'laugh' | 'shock' | 'chomp' | 'calm';
type PS = {x: number; y: number; s: number; rot: number; mood: PMood; jaw: number; near: number; look: P2; fx: number};
const P_HINGE: P2 = [-58, 12];
const P_UP0: P2 = [-96, -6];                             // snout tip (upper jaw)
const P_LO0: P2 = [-106, 6];                             // lower jaw tip (unrotated) - the underbite
const along = (a: P2, b: P2, u: number, off: number): {p: P2; n: P2} => {
  const d = sub(b, a), L = Math.hypot(d[0], d[1]) || 1, n: P2 = [-d[1] / L, d[0] / L];
  return {p: [a[0] + d[0] * u + n[0] * off, a[1] + d[1] * u + n[1] * off], n};
};
/** a triangle tooth standing on the edge a->b at u, pointing along the normal (dir +1/-1), base w, height h */
const edgeTooth = (a: P2, b: P2, u: number, w: number, h: number, dir: number, key: string) => {
  const d = sub(b, a), L = Math.hypot(d[0], d[1]) || 1, ux = d[0] / L, uy = d[1] / L, nx = -uy * dir, ny = ux * dir;
  const c = lp2(a, b, u);
  const p1: P2 = [c[0] - ux * w / 2, c[1] - uy * w / 2], p2: P2 = [c[0] + ux * w / 2, c[1] + uy * w / 2], tip: P2 = [c[0] + nx * h, c[1] + ny * h];
  return <path key={key} d={`M ${P(p1)} L ${P(tip)} L ${P(p2)} Z`} fill={TOOTH} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />;
};
const UP_U = [0.12, 0.36, 0.6, 0.84], LO_U = [0.08, 0.3, 0.52, 0.74];
const Piranha: React.FC<{t: number; p: PS; bone?: React.ReactNode}> = ({t, p, bone}) => {
  const jawDeg = -26 * p.jaw;
  const loTip = add(P_HINGE, rot2(sub(P_LO0, P_HINGE), jawDeg));
  const eye: P2 = [-50, -30];
  const er = p.mood === 'shock' ? 18 : 15;
  const lid = p.mood === 'smug' ? 0.48 : p.mood === 'calm' ? 0.36 : 0;
  const eyeEl = p.mood === 'laugh'
    ? <path d={`M ${eye[0] - 14} ${eye[1] + 4} Q ${eye[0]} ${eye[1] - 12} ${eye[0] + 14} ${eye[1] + 4}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    : <g>
      <circle cx={eye[0]} cy={eye[1]} r={er} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      <circle cx={eye[0] + p.look[0] * 4} cy={eye[1] + p.look[1] * 4 + lid * 5} r={p.mood === 'shock' ? 6 : 9} fill={P_EYE} />
      <circle cx={eye[0] + p.look[0] * 4} cy={eye[1] + p.look[1] * 4 + lid * 5} r={p.mood === 'shock' ? 3 : 4.5} fill={INK} />
      <circle cx={eye[0] + p.look[0] * 4 - 3} cy={eye[1] + p.look[1] * 4 - 3 + lid * 5} r={2.2} fill="#fff" />
      {lid ? <path d={lidPath(eye[0], eye[1], er + 0.5, er + 0.5, lid)} fill={P_BACK} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
    </g>;
  const browD = p.mood === 'chomp' ? 'M -72 -44 L -34 -58' : p.mood === 'shock' ? 'M -70 -60 Q -52 -70 -32 -60' : p.mood === 'grin' || p.mood === 'laugh' ? 'M -70 -52 Q -52 -60 -34 -54' : 'M -70 -48 L -32 -52';
  const tw = Math.sin(t * 7) * 6;
  return (
    <W><g transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) rotate(${p.rot.toFixed(2)}) scale(${(p.s * p.fx).toFixed(3)} ${p.s.toFixed(3)})`}>
      {/* tail, fins behind */}
      <path d={`M 70 -18 L ${118 + tw * 0.3} ${-60 + tw} Q 100 0 ${118 + tw * 0.3} ${60 + tw} L 70 16 Z`} fill={P_FIN} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -8 -66 L 10 -100 L 42 -62 Z" fill={P_FIN} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
      <path d="M 22 60 L 38 90 L 60 40 Z" fill={P_FIN} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
      <path d="M 50 -50 Q 60 -64 66 -44 Z" fill={P_FIN} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      {/* mouth inside (when open) */}
      <path d={`M ${P(P_UP0)} L ${P(P_HINGE)} L ${P(loTip)} Z`} fill={MOUTH_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {/* body */}
      <path d="M -96 -6 C -92 -42 -52 -72 2 -72 C 44 -72 66 -42 74 -18 L 74 16 C 64 46 34 70 -6 70 C -34 70 -50 60 -60 46 L -58 12 Z" fill={P_BODY} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <path d="M -88 -20 C -78 -50 -40 -68 2 -68 C 40 -68 60 -46 68 -26 C 40 -44 -20 -46 -88 -20 Z" fill={P_BACK} />
      <path d="M -56 44 C -40 64 -20 66 -4 66 C 32 66 58 44 68 18 C 30 34 -20 38 -56 30 Z" fill={P_BELLY} />
      {[[-6, -20], [14, -2], [34, -22], [6, 20], [30, 14]].map(([x, y], i) => <path key={i} d={`M ${x} ${y} q 7 6 0 12`} stroke={P_BACK} strokeWidth={3.5} fill="none" strokeLinecap="round" />)}
      <path d="M -30 -40 Q -16 -2 -34 38" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M -22 14 Q -6 18 4 34 Q -10 34 -22 26 Z" fill={P_FIN} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {/* upper teeth (near side) */}
      {p.near > 0.02 ? UP_U.map((u, i) => edgeTooth(P_UP0, P_HINGE, u, 9, 10 * p.near, 1, 'pu' + i)) : null}
      <path d={`M ${P(P_UP0)} L ${P(P_HINGE)}`} stroke={GUM} strokeWidth={p.near < 0.98 ? 4 : 0} />
      {/* lower jaw (rotates about the hinge), teeth on its top edge */}
      <g transform={`rotate(${jawDeg.toFixed(2)} ${P_HINGE[0]} ${P_HINGE[1]})`}>
        {p.near > 0.02 ? LO_U.map((u, i) => edgeTooth(P_LO0, P_HINGE, u, 10, 13 * p.near, 1, 'pl' + i)) : null}
        <path d={`M ${P(P_HINGE)} L ${P(P_LO0)} Q -110 18 -102 28 Q -82 44 -60 46 Z`} fill={P_THROAT} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M ${P(P_LO0)} L ${P(P_HINGE)}`} stroke={GUM} strokeWidth={p.near < 0.98 ? 4 : 0} />
      </g>
      {bone}
      {eyeEl}
      <path d={browD} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    </g></W>
  );
};
/** the piranha's near-side teeth after they came out as one piece */
const PBlock: React.FC<{x: number; y: number; rot: number; s: number}> = ({x, y, rot, s}) => (
  <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${s.toFixed(3)})`}>
    <rect x={-26} y={4} width={52} height={8} rx={4} fill={GUM} stroke={INK} strokeWidth={3} />
    {[-17, -5, 7, 19].map((cx) => <path key={cx} d={`M ${cx - 5.5} 5 L ${cx} -9 L ${cx + 5.5} 5 Z`} fill={TOOTH} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />)}
    <rect x={-26} y={-12} width={52} height={8} rx={4} fill={GUM} stroke={INK} strokeWidth={3} />
    {[-22, -10, 2, 14].map((cx) => <path key={cx} d={`M ${cx - 5} -5 L ${cx} 6 L ${cx + 5} -5 Z`} fill={TOOTH} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />)}
  </g></W>
);
/** a chicken drumstick standing up in the piranha's mouth (piranha coords, bite point at the mouth); meat 0..1 = how much
 *  is left; snap 0..1 breaks the bone: the top piece flips away and sinks */
const Drumstick: React.FC<{meat: number; snap: number; dy: number}> = ({meat, snap, dy}) => (
  <g transform={`translate(-104 ${(2 + dy).toFixed(1)})`}>
    <g transform={`translate(${(30 * snap).toFixed(1)} ${(-10 * snap + 170 * snap * snap).toFixed(1)}) rotate(${(100 * snap).toFixed(1)} 0 -40)`}>
      <path d="M -6 -40 L -6 -92 L 6 -92 L 6 -40 Z" fill={BONE} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <circle cx={-8} cy={-96} r={8} fill={BONE} stroke={INK} strokeWidth={4} /><circle cx={8} cy={-96} r={8} fill={BONE} stroke={INK} strokeWidth={4} />
      {snap > 0 ? <path d="M -6 -40 L -2 -46 L 2 -40 L 6 -45" stroke={INK} strokeWidth={3} fill="none" /> : null}
    </g>
    <path d="M -6 -40 L -6 -12 L 6 -12 L 6 -40 Z" fill={BONE} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {meat > 0.02 ? <ellipse cx={0} cy={2} rx={10 + 14 * meat} ry={14 + 22 * meat} fill="#B9733C" stroke={INK} strokeWidth={4.5} /> : null}
    {meat > 0.02 ? <path d={`M -6 ${-10 - 10 * meat} q 6 4 12 0`} stroke="#8E5528" strokeWidth={3.5} fill="none" strokeLinecap="round" /> : null}
  </g>
);

// ---------- the crocodile: side view, facing right, jaw hinge at (x, y) ----------
type CS = {x: number; y: number; jaw: number; mood: 'calm' | 'strain' | 'shock'};
const C_HINGE: P2 = [0, 2];
const C_LO: P2 = [226, 4];
const Croc: React.FC<{t: number; c: CS}> = ({t, c}) => {
  const jd = 24 * c.jaw;
  const eye: P2 = [46, -66];
  return (
    <W><g transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})`}>
      {/* mouth inside, then the lower jaw */}
      <path d={`M ${P(C_HINGE)} L 224 0 L ${P(add(C_HINGE, rot2(sub(C_LO, C_HINGE), jd)))} Z`} fill={MOUTH_C} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <g transform={`rotate(${jd.toFixed(2)} ${C_HINGE[0]} ${C_HINGE[1]})`}>
        <path d="M 0 2 L 210 4 Q 236 4 236 12 Q 232 24 214 24 L 30 32 Q 0 34 -40 24 Z" fill={CROC_BELLY} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        {Array.from({length: 10}, (_, i) => edgeTooth(C_HINGE, C_LO, 0.14 + i * 0.085, 11, 11, 1, 'cl' + i))}
      </g>
      {/* head + neck */}
      <path d="M -520 -40 L -70 -44 Q -10 -52 18 -60 Q 44 -92 72 -62 L 200 -40 Q 236 -40 240 -20 Q 240 -2 224 0 L 0 2 L -70 40 L -520 48 Z" fill={CROC} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {Array.from({length: 8}, (_, i) => <path key={i} d={`M ${-480 + i * 52} -42 l 14 -18 l 14 18`} fill={CROC_DK} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />)}
      {[[90, -30], [130, -26], [170, -22], [110, -12], [150, -10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill={CROC_DK} />)}
      <ellipse cx={224} cy={-28} rx={7} ry={5} fill={INK} />
      {Array.from({length: 10}, (_, i) => edgeTooth([224, 0], C_HINGE, 0.06 + i * 0.088, 11, 11, 1, 'cu' + i))}
      {/* eye on its bump */}
      <circle cx={eye[0]} cy={eye[1]} r={c.mood === 'shock' ? 17 : 14} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      <circle cx={eye[0] + 4} cy={eye[1] + (c.mood === 'shock' ? 0 : 3)} r={c.mood === 'shock' ? 4 : 6} fill={INK} />
      {c.mood !== 'shock' ? <path d={lidPath(eye[0], eye[1], 14.5, 14.5, c.mood === 'strain' ? 0.5 : 0.32)} fill={CROC_DK} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      {c.mood === 'strain' ? <path d={`M ${eye[0] - 18} ${eye[1] - 18} L ${eye[0] + 16} ${eye[1] - 10}`} stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
      {c.mood === 'shock' ? <path d={`M ${eye[0] - 16} ${eye[1] - 28} Q ${eye[0]} ${eye[1] - 36} ${eye[0] + 16} ${eye[1] - 28}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      {c.mood === 'strain' ? [0, 1].map((i) => <path key={i} d={`M ${eye[0] + 26 + i * 12} ${eye[1] - 26 - i * 6} q 4 6 0 10`} stroke="#5FB4DC" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(t * 20)} />) : null}
    </g></W>
  );
};
/** the log: from x0 (croc end) to x1 (his end) at height y; snap 0..1 breaks it at xs; dent shows tooth marks on the croc end */
const LogP: React.FC<{x0: number; x1: number; y: number; xs: number; snapped: boolean; tip: number; drop: number; dent: number; dentX: number; chew: number}> = ({x0, x1, y, xs, snapped, tip, drop, dent, dentX, chew}) => {
  const r = 18;
  const xc = lerp(xs + 6, x1 - 8, chew);           // his chunk gets shorter as he chews it
  const piece = (a: number, b: number, jag: 'l' | 'r' | null) => {
    const jy = [-r, -10, 0, 10, r];
    const jx = (sd: number) => jy.map((yy, i) => `L ${(sd === 1 ? b : a) + (i % 2 ? 7 : -3) * sd} ${yy}`).join(' ');
    const d = jag === 'r' ? `M ${a} ${-r} L ${b} ${-r} ${jx(1)} L ${a} ${r} Z` : jag === 'l' ? `M ${b} ${-r} L ${a} ${-r} ${jx(-1)} L ${b} ${r} Z` : `M ${a} ${-r} L ${b} ${-r} L ${b} ${r} L ${a} ${r} Z`;
    return <g>
      <path d={d} fill={LOG} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
      {[0.25, 0.55, 0.8].map((k, i) => <path key={i} d={`M ${lerp(a, b, k) - 14} ${-8 + i * 6} h 28`} stroke={LOG_DK} strokeWidth={3.5} strokeLinecap="round" />)}
    </g>;
  };
  return (
    <W><g transform={`translate(0 ${y})`}>
      {!snapped ? <g>{piece(x0, x1, null)}<ellipse cx={x1} cy={0} rx={8} ry={r} fill={LOG_END} stroke={INK} strokeWidth={5} /></g> : <g>
        <g transform={`translate(${x0} 0) rotate(${tip.toFixed(1)}) translate(${-x0} ${drop.toFixed(1)})`}>{piece(x0, xs, 'r')}</g>
        {xc < x1 - 9 ? <g>{piece(xc, x1, 'l')}<ellipse cx={x1} cy={0} rx={8} ry={r} fill={LOG_END} stroke={INK} strokeWidth={5} /></g> : null}
      </g>}
      {dent > 0.01 && !snapped ? [0, 1, 2].map((i) => <path key={i} d={`M ${dentX + i * 16} ${-r + 1} l 5 ${7 * dent} l 5 ${-7 * dent}`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinejoin="round" />) : null}
    </g></W>
  );
};
/** a soup bowl on the table in front of him */
const SoupBowl: React.FC<{t: number; x: number; splash: number}> = ({t, x, splash}) => (
  <W><g transform={`translate(${x} ${TOP_Y}) scale(0.8)`}>
    {[0, 1, 2].map((i) => <path key={i} d={`M ${-30 + i * 30} -70 q 10 -14 0 -28 q -10 -14 0 -28`} stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round"
      opacity={0.75} transform={`translate(${3 * Math.sin(t * 3 + i)} ${-((t * 30 + i * 10) % 20)})`} />)}
    <path d="M -96 -46 Q -92 4 -36 4 L 36 4 Q 92 4 96 -46 Z" fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -88 -24 Q 0 -12 88 -24" stroke="#3D8FD6" strokeWidth={7} fill="none" />
    <ellipse cx={0} cy={-46} rx={96} ry={14} fill={SOUP} stroke={INK} strokeWidth={6} />
    <ellipse cx={-20} cy={-48} rx={40} ry={5} fill="#F59A5E" />
    {splash > 0.01 ? <path d={`M -40 -48 L -30 ${-48 - 34 * splash} L -16 -50 L 0 ${-48 - 46 * splash} L 14 -50 L 30 ${-48 - 30 * splash} L 42 -48 Z`} fill={SOUP} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}
  </g></W>
);

// ---------- X-RAY: the piranha's jaw (screen space) ----------
const XTooth: React.FC<{x: number; y: number; dir: 1 | -1; w: number; h: number; glow?: boolean; ghost?: boolean}> = ({x, y, dir, w, h, glow, ghost}) => {
  // a triangle with a small cusp bump on its right edge and a notch on its left edge: neighbours click together
  const hw = w / 2;
  const L0: P2 = [x - hw, y], R0: P2 = [x + hw, y], tip: P2 = [x, y + dir * h];
  const lm = lp2(L0, tip, 0.42), rm = lp2(R0, tip, 0.42), cu = w * 0.13;
  const d = `M ${P(L0)} L ${P(lp2(L0, tip, 0.3))} L ${P([lm[0] + cu, lm[1]])} L ${P(lp2(L0, tip, 0.54))} L ${P(tip)} L ${P(lp2(R0, tip, 0.54))} ` +
    `L ${P([rm[0] + cu, rm[1]])} L ${P(lp2(R0, tip, 0.3))} L ${P(R0)} Z`;
  return <path d={d} fill={ghost ? 'none' : BONE} stroke={ghost ? '#9FB4F0' : glow ? GOLD : INK} strokeWidth={ghost ? 4 : glow ? 8 : 5} strokeDasharray={ghost ? '10 8' : undefined} strokeLinejoin="round" />;
};
const XRayJaw: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 380;
  const lockU = eout(seg(t, LOCK - 0.14, LOCK + 0.04));
  const gap = 26 * (1 - lockU);
  const glowU = seg(t, BLADE - 0.04, BLADE + 0.42);
  const newS = popIn(t, NEWX, 0.3);
  const TW = 112, TH = 124;
  const upY = -62, loY = 62;
  const upX = [-224, -112, 0, 112, 224], loX = [-280, -168, -56, 56, 168, 280];
  const sp = (x: number, i: number, n: number) => x + (i - (n - 1) / 2) * gap;
  const sawU = upX.map((x, i) => sp(x, i, 5)), sawL = loX.map((x, i) => sp(x, i, 6));
  const zig = (xs: number[], y: number, dir: 1 | -1) => `M ${xs[0] - TW / 2} ${y} ` + xs.map((x) => `L ${x} ${y + dir * TH} L ${x + TW / 2} ${y}`).join(' ');
  return (
    <div style={{position: 'absolute', left: 540, top: 1010, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <defs><clipPath id="pxclip"><circle r={R} /></clipPath></defs>
        <circle r={R + 22} fill={INK} />
        <g clipPath="url(#pxclip)">
          <circle r={R} fill={XNAVY} />
          {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${-400 + i * 100} -400 V 400 M -400 ${-400 + i * 100} H 400`} stroke="#252F66" strokeWidth={3} />)}
          {/* jaw bones */}
          <path d={`M -420 ${upY} L 330 ${upY} Q 380 ${upY - 60} 300 -260 L -420 -260 Z`} fill={XBONE} stroke={XLINE} strokeWidth={6} />
          <path d={`M -420 ${loY} L 340 ${loY} Q 390 ${loY + 70} 300 300 L -420 300 Z`} fill={XBONE} stroke={XLINE} strokeWidth={6} />
          <circle cx={250} cy={-200} r={56} fill="none" stroke={XLINE} strokeWidth={6} />
          {/* the new set waiting inside the bone */}
          {upX.map((x, i) => <XTooth key={'nu' + i} x={x + 14} y={upY - 128} dir={1} w={TW * 0.82} h={TH * 0.78} ghost />)}
          {loX.map((x, i) => <XTooth key={'nl' + i} x={x - 14} y={loY + 128} dir={-1} w={TW * 0.82} h={TH * 0.78} ghost />)}
          {/* the working teeth */}
          {sawL.map((x, i) => <XTooth key={'l' + i} x={x} y={loY} dir={-1} w={TW} h={TH} />)}
          {sawU.map((x, i) => <XTooth key={'u' + i} x={x} y={upY} dir={1} w={TW} h={TH} />)}
          {glowU > 0 ? <g>
            <path d={zig(sawU, upY, 1)} fill="none" stroke={GOLD} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" style={pen(glowU)} />
            <path d={zig(sawL, loY, -1)} fill="none" stroke={GOLD} strokeWidth={12} strokeLinejoin="round" strokeLinecap="round" style={pen(glowU)} />
          </g> : null}
          <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.2} />
        </g>
        <circle r={R} fill="none" stroke="#8C98AE" strokeWidth={22} />
        <circle r={R + 14} fill="none" stroke={INK} strokeWidth={6} />
      </svg>
      <Card text="X-RAY: PIRANHA" top={92} size={52} />
      <Card text="LOCKED" top={330} left={170} color={GOLD} rot={-8} s={popIn(t, LOCK, 0.26)} size={56} />
      <Card text="ONE BLADE" top={590} left={720} color="#FFFFFF" rot={6} s={popIn(t, BLADE + 0.26, 0.26)} size={56} />
      <Card text="NEW SET" top={808} left={330} color="#9FD3FF" rot={-4} s={newS} size={46} />
    </div>
  );
};

// ---------- the story over time ----------
const HA_REST: P2 = [-252, 30], HB_REST: P2 = [-48, 30];
const HALF_L: P2 = [-222, TOP_Y - 32], HALF_R: P2 = [-78, TOP_Y - 32];   // coconut halves resting on the table
// his left half: lets go at DROP1 from the left of his mouth, lands on the table at CLUNK1 (between the halves), bounces
const block1 = (t: number): {x: number; y: number; rot: number} | null => {
  if (t < DROP1 || t >= S3) return null;
  const y0 = MOUTH[1] + 14, x0 = MOUTH[0] - 22, yl = TOP_Y - 18;
  if (t < CLUNK1) { const u = seg(t, DROP1, CLUNK1); return {x: x0 + 8 * u, y: lerp(y0, yl, u * u), rot: -30 * u}; }
  const b = t - CLUNK1;
  const hop = b < 0.26 ? 24 * Math.sin(Math.PI * b / 0.26) : 0;
  return {x: x0 + 8 + 6 * Math.min(1, b / 0.26), y: yl - hop, rot: -30 + 22 * Math.min(1, b / 0.26)};
};
const SOUP_X = GX + 20;
const block2 = (t: number): {x: number; y: number; rot: number; sink: number} | null => {
  if (t < DROP2 || t >= S9) return null;
  const y0 = MOUTH[1] + 14, x0 = MOUTH[0] + 22, yl = TOP_Y - 48;
  if (t < SPLASH) { const u = seg(t, DROP2, SPLASH); return {x: lerp(x0, SOUP_X + 6, u), y: lerp(y0, yl, u * u), rot: 30 * u, sink: 0}; }
  return {x: SOUP_X + 6, y: yl, rot: 30, sink: 1};
};

const guyAt = (t: number): GS => {
  const g: GS = {...G0, m: {...G0.m}};
  if (t < S2) {
    // frame 0: the coconut cracks in his teeth, he holds the halves up, then sets them down on the table
    const sp = eout(seg(t, SPLIT, SPLIT + 0.2));
    const up: [P2, P2] = [[-206, -30], [-94, -30]];
    if (t < 1.0) {
      g.hA = lp2([-194, -36], up[0], sp); g.hB = lp2([-106, -36], up[1], sp);
    } else if (t < 1.45) {
      const u = eio(seg(t, 1.0, 1.42));
      g.hA = lp2(up[0], add(HALF_L, [16, 4]), u); g.hB = lp2(up[1], add(HALF_R, [-16, 4]), u);
    } else {
      const u = eio(seg(t, 1.45, 1.75));
      g.hA = lp2(add(HALF_L, [16, 4]), HA_REST, u); g.hB = lp2(add(HALF_R, [-16, 4]), HB_REST, u);
    }
    g.mood = t < 0.16 ? 'focus' : t < 1.3 ? 'joy' : 'smug';
    g.look = t < 1.3 ? [0, 0] : [1, 0.2];
    g.m = t < SPLIT ? {open: 0.55, grin: 0, L: 1, R: 1} : {open: lerp(0.55, 0.22, eout(seg(t, SPLIT, 0.4))), grin: lerp(0, 0.85, eout(seg(t, SPLIT, 0.4))), L: 1, R: 1};
    if (t > 1.3) g.m = {open: 0.16, grin: 0.7, L: 1, R: 1};
    g.tilt = t < 1.3 ? -3 * Math.sin(t * 5) : 4;
    return g;
  }
  if (t < S3) {
    g.hA = HA_REST; g.hB = HB_REST;
    if (t < DROP1) { g.mood = 'smug'; g.look = [1, 0.2]; g.m = {open: 0.16, grin: 0.7, L: 1, R: 1}; g.tilt = 4; return g; }
    const u = eout(seg(t, DROP1 + 0.02, DROP1 + 0.2));
    g.mood = 'pop'; g.look = [-0.6, 1];
    g.m = {open: lerp(0.16, 0.85, u), grin: lerp(0.7, 0, u), L: 0, R: 1};
    g.hA = lp2(HA_REST, [-222, -58], u); g.hB = lp2(HB_REST, [-78, -58], u);
    g.sq = hit(t, DROP1, 0.6, 9);
    g.tilt = -3 * Math.sin((t - DROP1) * 30) * Math.exp(-(t - DROP1) * 6);
    if (t > CLUNK1) g.look = [-0.8, 1];
    return g;
  }
  if (t < S5) { g.m = {open: 0, grin: 0.3, L: 1, R: 1}; return g; }   // off screen
  if (t < S6) {
    // the log bite-off: he bites the right end; strains, then snaps it off and chews it
    g.hA = [-232, -40]; g.hB = [-206, -58];
    if (t < SNAPL) { g.mood = 'focus'; g.look = [-1, 0]; g.m = {open: 0.42, grin: 0, L: 1, R: 1}; g.sq = 0.15 * Math.sin(t * 40) * seg(t, DENT, SNAPL); return g; }
    const chew = t < 9.5 ? Math.abs(Math.sin((t - SNAPL) * 13)) : 0;
    g.mood = t < JAWDROP ? 'focus' : 'smug'; g.look = t < JAWDROP ? [-1, 0] : [-1, 0.2];
    g.m = {open: 0.14 + 0.3 * chew, grin: t < JAWDROP ? 0.1 : 0.55, L: 1, R: 1};
    const u = eio(seg(t, SNAPL + 0.1, SNAPL + 0.4));
    g.hA = lp2([-232, -40], HA_REST, u); g.hB = lp2([-206, -58], HB_REST, u);
    g.sq = hit(t, SNAPL, 0.5, 9);
    g.tilt = t > JAWDROP ? 5 : 0;
    return g;
  }
  if (t < S8) { g.m = {open: 0, grin: 0.3, L: 1, R: 1}; return g; }   // off screen
  if (t < S9) {
    // soup: he leans in happily, then his other side drops into the bowl
    g.hA = [-262, 30]; g.hB = [-38, 30];
    g.tilt = 3 * Math.sin(t * 4);
    if (t < DROP2) { g.mood = 'joy'; g.m = {open: 0.25, grin: 0.6, L: 1, R: 1}; return g; }
    const u = eout(seg(t, DROP2 + 0.02, DROP2 + 0.2));
    g.mood = t < SPLASH ? 'pop' : 'oof'; g.look = [0.6, 1];
    g.m = {open: lerp(0.25, 0.6, u), grin: lerp(0.6, 0, u), L: 1, R: 0};
    g.soup = t > SPLASH + 0.06 ? 1 : 0;
    g.sq = hit(t, SPLASH, 0.7, 9);
    return g;
  }
  // half a smile with a hand over the gap, then the new set grows in
  g.hA = HA_REST;
  const cov = eio(seg(t, S9, COVER + 0.12)) * (1 - eio(seg(t, REGROW + 0.12, REGROW + 0.38)));
  g.hB = lp2(HB_REST, [-126, -42], cov);
  g.mood = t < REGROW ? 'grin' : 'joy';
  const grow = eout(seg(t, REGROW, REGROW + 0.25));
  g.m = {open: lerp(0.18, 0.26, grow), grin: lerp(0.8, 0.95, grow), L: 1, R: grow};
  g.tilt = t < REGROW ? 5 + 2 * Math.sin(t * 3) : -3;
  g.soup = 0;
  return g;
};

const P_HOME = {x: BX + 6, y: BY + 4};
const pirAt = (t: number): PS => {
  const bob = 5 * Math.sin(t * 2.4);
  const p: PS = {x: P_HOME.x, y: P_HOME.y + bob, s: 0.82, rot: 2 * Math.sin(t * 1.7), mood: 'smug', jaw: 0.12, near: 1, look: [-1, 0], fx: 1};
  if (t < S2) { if (t > SHINE - 0.05 && t < 1.5) { p.mood = 'grin'; p.jaw = 0.32; } return p; }
  if (t < S3) return p;
  if (t < S4) { p.mood = 'calm'; p.look = [-0.4, 0.2]; return p; }
  if (t < S5) {
    if (t < BITE) { p.mood = 'chomp'; p.jaw = lerp(0.12, 0.9, seg(t, STICK0, BITE - 0.02)); p.look = [-1, 0.3]; return p; }
    if (t < CRACKB) { p.mood = 'chomp'; p.jaw = 0.25 + 0.5 * Math.abs(Math.sin((t - BITE) * 60)); return p; }
    p.mood = t < 7.2 ? 'chomp' : 'grin'; p.jaw = t < 7.2 ? 0.12 : 0.3; p.look = [0.2, -0.6];
    return p;
  }
  if (t < S6) return p;
  if (t < S7) {
    // ONE BY ONE? - NOPE (head shake)
    p.mood = t < NOPE ? 'grin' : 'calm'; p.jaw = t < NOPE ? 0.5 : 0.18; p.look = [0.4, 0.3];
    if (t > NOPE) p.rot += 13 * Math.sin((t - NOPE) * 26) * Math.exp(-(t - NOPE) * 3.5);
    return p;
  }
  if (t < S8) {
    // the near side drops out together; the new set slides up
    p.look = [0.2, 0.6];
    if (t < PDROP) { p.mood = 'smug'; p.jaw = 0.36; return p; }
    p.jaw = 0.36;
    p.near = t < PNEW ? 0 : eout(seg(t, PNEW, PNEW + 0.18));
    p.mood = t < PNEW ? 'calm' : 'grin';
    if (t > PNEW + 0.5) p.mood = 'smug';
    return p;
  }
  return p;
};
const pblockAt = (t: number): {x: number; y: number; rot: number} | null => {
  if (t < PDROP || t >= S8) return null;
  const p = pirAt(PDROP - 0.001);
  const m = add([p.x, p.y], [(-80) * p.s, 2 * p.s]);
  const yl = BOT_Y - 26;
  if (t < PLAND) { const u = seg(t, PDROP, PLAND); return {x: m[0] - 10 * u, y: lerp(m[1], yl, u * u * (1 - 0.3 * u) / 0.7 * 0.7 + 0), rot: -60 * u}; }
  return {x: m[0] - 10, y: yl, rot: -60};
};
const CROC_X = -592, CROC_Y = -66;
const LOG_X0 = CROC_X + 120, LOG_X1 = MOUTH[0] + 8, LOG_Y = MOUTH[1] + 22;
const crocAt = (t: number): CS => {
  const c: CS = {x: CROC_X, y: CROC_Y, jaw: 0.62, mood: 'calm'};
  if (t < DENT - 0.15) return c;
  if (t < JAWDROP) { c.mood = 'strain'; c.jaw = 0.56; return c; }
  c.mood = 'shock'; c.jaw = lerp(0.56, 1.2, eout(seg(t, JAWDROP, JAWDROP + 0.2)));
  return c;
};

type CK = {x: number; y: number; k: number};
const camFor = (t: number): CK => {
  if (t < S2) { const u = eio(seg(t, 0, S2)); return {x: lerp(-84, -76, u), y: lerp(-80, -84, u), k: lerp(3.15, 3.26, u)}; }
  if (t < S3) return {x: -150, y: -44, k: 3.7};
  if (t < S4) return {x: BX - 10, y: BY - 30, k: lerp(2.55, 2.65, seg(t, S3, S4))};
  if (t < S5) return {x: BX - 22, y: BY - 6, k: lerp(3.3, 3.5, seg(t, S4, S5))};
  if (t < S6) return {x: -352, y: -86, k: lerp(2.04, 2.12, seg(t, S5, S6))};
  if (t < S7) return {x: BX - 8, y: BY - 2, k: lerp(3.3, 3.42, seg(t, S6, S7))};
  if (t < S8) return {x: BX - 20, y: BY + 14, k: lerp(3.6, 3.8, seg(t, S7, S8))};
  if (t < S9) return {x: GX + 8, y: -36, k: 3.25};
  return {x: GX, y: -76, k: lerp(3.55, 3.7, seg(t, S9, PUSH))};
};

export const PiranhaScene: React.FC<{t: number; camK?: CK; thumb?: boolean; thumbG?: Partial<GS>; thumbP?: Partial<PS>}> = ({t, camK, thumb, thumbG, thumbP}) => {
  const g0 = guyAt(t), p0 = pirAt(t);
  const g = thumbG ? {...g0, ...thumbG} : g0;
  const p = thumbP ? {...p0, ...thumbP} : p0;
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 7, 8) + hit(t, CLUNK1, 10, 8) + hit(t, CRACKB, 5, 8) + hit(t, SNAPL, 8, 8) + hit(t, PDROP, 4, 8) + hit(t, SPLASH, 9, 8));
  const k = c0.k;
  const cam = {x: c0.x + sh.x / k, y: c0.y + sh.y / k, z: 1000 - 1000 / k};
  const z = (n: number) => n / k;
  const shot = t < S2 ? 1 : t < S3 ? 2 : t < S4 ? 3 : t < S5 ? 4 : t < S6 ? 5 : t < S7 ? 6 : t < S8 ? 7 : t < S9 ? 8 : 9;
  const xS = popIn(t, S3 + 0.02, 0.32) * inS(t, S3, S4) * (1 - seg(t, S4 - 0.14, S4));
  const dimA = xS > 0.01 ? 0.5 * xS : 0;
  // coconut: in his teeth at frame 0, then two halves in his hands, then on the table (also seen in shot 2)
  const sp = eout(seg(t, SPLIT, SPLIT + 0.2));
  const halves = shot <= 2 && t >= SPLIT;
  const bite = shot === 1 && t < SPLIT ? <CoconutBite u={t / SPLIT} /> : undefined;
  const halfPos = (side: number): {x: number; y: number; rot: number} => {
    const r0 = side < 0 ? 180 : 0;
    if (t >= 1.42) return {x: side < 0 ? HALF_L[0] : HALF_R[0], y: HALF_L[1], rot: side < 0 ? 270 : -90};
    const h = side < 0 ? g.hA : g.hB;
    const u = seg(t, 1.0, 1.42);
    return {x: h[0] + side * 14 * (1 - u), y: h[1] - 8 * (1 - u) - 22 * u, rot: lerp(r0 + side * 90, r0 + side * 10, sp) + side * lerp(0, -100, eio(u))};
  };
  // the drumstick, the croc, the log
  const meat = 1 - seg(t, BITE, BITE + 0.12);
  const bsnap = seg(t, CRACKB, CRACKB + 0.75);
  const stickIn = shot === 4 ? eout(seg(t, STICK0, BITE - 0.02)) : 0;
  const bone = shot === 4 ? <Drumstick meat={meat} snap={bsnap} dy={-150 * (1 - stickIn)} /> : undefined;
  const cr = crocAt(t);
  const logTip = t > SNAPL ? (t < JAWDROP ? 10 * eout(seg(t, SNAPL, SNAPL + 0.2)) : 10 + 30 * eio(seg(t, JAWDROP, JAWDROP + 0.3))) : 0;
  const logDrop = t > JAWDROP ? 160 * seg(t, JAWDROP + 0.05, JAWDROP + 0.34) ** 2 : 0;
  const chewU = seg(t, SNAPL + 0.1, 9.5);
  const b1 = block1(t), b2 = block2(t), pb = pblockAt(t);
  const soupSplash = t > SPLASH ? Math.sin(Math.PI * seg(t, SPLASH, SPLASH + 0.35)) : 0;
  const head: P2 = [g.x, g.y + NECK];
  const stk = {
    chomp: t < 0.9 ? 1 - seg(t, 0.75, 0.9) : 0,
    shing: pulse(t, SHINE, 0.5),
    clunk: popIn(t, CLUNK1, 0.18) * inS(t, CLUNK1, S3),
    half: popIn(t, T.once, 0.24) * inS(t, T.once, S3),
    crack: popIn(t, CRACKB, 0.18) * inS(t, CRACKB, 6.4) * (1 - seg(t, 6.25, 6.4)),
    dent: popIn(t, DENT - 0.1, 0.2) * inS(t, DENT - 0.1, SNAPL),
    snap: popIn(t, SNAPL, 0.18) * inS(t, SNAPL, S6) * (1 - seg(t, 8.95, 9.05)),
    harder: popIn(t, JAWDROP + 0.04, 0.26) * inS(t, JAWDROP, S6),
    oneby: popIn(t, ONEBY - 0.04, 0.24) * inS(t, ONEBY, NOPE) * (1 - seg(t, NOPE - 0.08, NOPE)),
    nope: popIn(t, NOPE, 0.2) * inS(t, NOPE, S7),
    whole: popIn(t, T.side - 0.02, 0.24) * inS(t, T.side, PDROP) * (1 - seg(t, PDROP - 0.08, PDROP)),
    clunk2: popIn(t, PLAND - 0.02, 0.18) * inS(t, PLAND, PNEW) * (1 - seg(t, PNEW - 0.06, PNEW)),
    newset: popIn(t, PNEW + 0.02, 0.24) * inS(t, PNEW, S8),
    splash: popIn(t, SPLASH, 0.18) * inS(t, SPLASH, S9),
    halfSmile: popIn(t, T.smiles + 0.02, 0.24) * inS(t, T.smiles, REGROW) * (1 - seg(t, REGROW - 0.08, REGROW)),
    newset2: popIn(t, REGROW + 0.04, 0.24) * inS(t, REGROW, PUSH),
  };
  const ringU = seg(t, RING, RING + 0.4);
  const ringP: P2 = add([p.x, p.y], rot2([(-82) * p.s, 10 * p.s], p.rot));
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id="pFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Layer cam={cam} z={1700}><Room /></Layer>
      <Layer cam={cam} z={1000}>
        <Guy t={t} g={g} bite={bite} />
        <Table />
        <BowlBack t={t} />
        <Piranha t={t} p={p} bone={bone} />
        {pb ? <PBlock x={pb.x} y={pb.y} rot={pb.rot} s={0.82} /> : null}
        {halves ? <><CocoHalf {...halfPos(-1)} /><CocoHalf {...halfPos(1)} /></> : null}
        {shot === 1 ? <Drops t={t} t0={SPLIT} x={MOUTH[0]} y={MOUTH[1] + 40} n={10} color="#E8F6FF" seed={3} /> : null}
        {shot === 5 ? <LogP x0={LOG_X0} x1={LOG_X1} y={LOG_Y} xs={LOG_X1 - 60} snapped={t > SNAPL} tip={logTip} drop={logDrop} dent={seg(t, DENT, DENT + 0.15)}
          dentX={CROC_X + 246} chew={chewU} /> : null}
        {shot === 5 ? <Croc t={t} c={cr} /> : null}
        {shot === 5 ? <GuyTeeth g={g} /> : null}
        {shot === 5 && t > SNAPL ? <Drops t={t} t0={SNAPL} x={LOG_X1 - 54} y={LOG_Y} n={8} color={LOG_END} seed={11} spd={200} r={7} /> : null}
        {shot === 8 ? <SoupBowl t={t} x={SOUP_X} splash={soupSplash} /> : null}
        {shot === 8 ? <Drops t={t} t0={SPLASH} x={SOUP_X} y={TOP_Y - 40} n={12} color={SOUP} seed={21} spd={330} r={10} /> : null}
        {b1 ? <HalfSet x={b1.x} y={b1.y} rot={b1.rot} side={-1} /> : null}
        {b2 && b2.sink < 0.5 ? <HalfSet x={b2.x} y={b2.y} rot={b2.rot} side={1} /> : null}
        {shot === 9 ? <W><g transform={`translate(${g.hB[0].toFixed(1)} ${g.hB[1].toFixed(1)}) rotate(-14)`}>
          <ellipse rx={28} ry={21} fill={WHITE} stroke={INK} strokeWidth={5.5} />
          <path d="M -14 -16 Q -8 -4 -14 8 M 0 -19 Q 6 -6 0 9 M 13 -16 Q 19 -4 13 8" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </g></W> : null}
        {/* sparkles */}
        {shot === 1 ? <Star x={MOUTH[0] + 40} y={MOUTH[1] + 8} s={stk.shing * 0.9} rot={t * 300} /> : null}
        {shot === 7 && t > PNEW ? <Star x={ringP[0] - 6} y={ringP[1] - 18} s={pulse(t, PNEW, 0.4) * 0.7} rot={t * 300} /> : null}
        {shot === 9 && t > REGROW ? <Star x={MOUTH[0] + 36} y={MOUTH[1] + 10} s={pulse(t, REGROW, 0.45) * 0.8} rot={t * 300} /> : null}
        {shot === 6 ? <W><circle cx={ringP[0]} cy={ringP[1]} r={20} fill="none" stroke="#FFFFFF" strokeWidth={11} style={pen(ringU)} /><circle cx={ringP[0]} cy={ringP[1]} r={20} fill="none" stroke={RED} strokeWidth={6} style={pen(ringU)} /></W> : null}
      </Layer>
      <Layer cam={cam} z={1000} paper={false}><BowlGlass t={t} /></Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={MOUTH[0] + 90} y={MOUTH[1] + 96} s={stk.chomp} text="CHOMP" size={z(104)} rot={-8} fill={GOLD} />
        <Txt x={MOUTH[0] + 66} y={MOUTH[1] - 70} s={stk.shing} text="SHING" size={z(72)} rot={8} fill="#FFFFFF" />
        <Txt x={-150} y={TOP_Y + 62} s={stk.clunk} text="CLUNK" size={z(104)} rot={-6} fill="#FFFFFF" />
        <Txt x={head[0] + 20} y={head[1] - 100} s={stk.half} text="HALF GONE" size={z(100)} rot={4} fill={RED} />
        <Txt x={BX - 30} y={BY + 66} s={stk.crack} text="CRACK" size={z(96)} rot={-6} fill="#FFFFFF" />
        <Txt x={-420} y={-150} s={stk.dent} text="DENT" size={z(100)} rot={-6} fill="#FFFFFF" />
        <Txt x={-200} y={-170} s={stk.snap} text="SNAP" size={z(100)} rot={7} fill="#FFFFFF" />
        <Txt x={-300} y={-210} s={stk.harder} text="HARDER" size={z(118)} rot={-4} fill={GOLD} />
        <Txt x={BX - 10} y={BY + 98} s={stk.oneby} text="ONE BY ONE?" size={z(84)} rot={-4} fill="#FFFFFF" />
        <Txt x={BX - 10} y={BY + 98} s={stk.nope} text="NOPE" size={z(110)} rot={5} fill={RED} />
        <Txt x={BX - 20} y={BY - 96} s={stk.whole} text="WHOLE SIDE" size={z(84)} rot={-4} fill={GOLD} />
        <Txt x={BX - 40} y={BY + 70} s={stk.clunk2} text="CLUNK" size={z(88)} rot={-6} fill="#FFFFFF" />
        <Txt x={BX - 20} y={BY + 72} s={stk.newset} text="NEW SET" size={z(92)} rot={4} fill={GOLD} />
        <Txt x={SOUP_X + 96} y={TOP_Y - 120} s={stk.splash} text="SPLASH" size={z(100)} rot={6} fill={GOLD} />
        <Txt x={head[0] - 10} y={head[1] + 136} s={stk.halfSmile} text="HALF A SMILE" size={z(84)} rot={-4} fill={GOLD} />
        <Txt x={head[0] - 10} y={head[1] + 136} s={stk.newset2} text="NEW SET" size={z(92)} rot={4} fill="#FFFFFF" />
      </Layer>}
      {dimA > 0.01 ? <AbsoluteFill style={{background: '#0D1230', opacity: dimA}} /> : null}
      {thumb ? null : <>
        <XRayJaw t={t} s={xS} />
        <CountBox label="ITS BITE" val={`x${1 + Math.round(29 * eio(seg(t, T.thirty, 7.22)))}`} sub2="ITS OWN WEIGHT" col={RED}
          s={popIn(t, 6.0, 0.26) * inS(t, S4, S5) * (1 - seg(t, S5 - 0.12, S5))} top={1500} bump={hit(t, 7.24, 1, 6)} />
        <CommentBubble t={t} text="what if you had a piranha's teeth??" handle="@chomp_doodle" likes="2.9K" out={1.5} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so} until={PUSH - 0.4} text="What would you bite first?" />
      </>}
    </AbsoluteFill>
  );
};

export const PiranhaVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -21 : db}));
  const cues: Cue[] = [
    // frame 0: the coconut cracks in his teeth
    {f: 'chomp.wav', at: 0, db: -11}, {f: 'whoosh.wav', at: 0, db: -21}, {f: 'squelch.wav', at: SPLIT, db: -24}, {f: 'splash.wav', at: SPLIT + 0.04, db: -30},
    {f: 'shing.wav', at: SHINE - 0.02, db: -22}, {f: 'pop.wav', at: 1.46, db: -30},
    // his left side drops out: a beat, the fall, CLUNK on the table, the gasp
    {f: 'whoosh.wav', at: S2 - 0.02, db: -30}, {f: 'pop.wav', at: DROP1, db: -22}, {f: 'whistle.wav', at: DROP1 + 0.02, db: -30, to: 0.25},
    {f: 'bonk.wav', at: CLUNK1, db: -12}, {f: 'thud.wav', at: CLUNK1, db: -20}, {f: 'bonk.wav', at: CLUNK1 + 0.3, db: -24}, {f: 'crowd_gasp.wav', at: CLUNK1 + 0.06, db: -26, to: 0.75},
    // X-RAY: the teeth click together, glow as one blade, the new set
    {f: 'zap.wav', at: S3, db: -26}, {f: 'pop.wav', at: S3 + 0.06, db: -27}, {f: 'clack.wav', at: LOCK - 0.02, db: -18}, {f: 'pop.wav', at: LOCK + 0.02, db: -26},
    {f: 'whir.mp3', at: BLADE - 0.04, db: -29, to: 0.5}, {f: 'shing.wav', at: BLADE + 0.24, db: -24}, {f: 'pop.wav', at: NEWX, db: -27},
    // the piranha: the drumstick, the bite, CRACK, ITS BITE x1 -> x30
    {f: 'whoosh.wav', at: S4 - 0.02, db: -29}, {f: 'splash.wav', at: STICK0 + 0.08, db: -26}, {f: 'chomp.wav', at: BITE, db: -18}, {f: 'chomp.wav', at: BITE + 0.06, db: -22}, {f: 'chomp.wav', at: BITE + 0.12, db: -22},
    {f: 'crack.wav', at: CRACKB - 0.32, db: -16}, {f: 'pop.wav', at: 6.0, db: -26}, ...ticks(T.thirty, 7.22, 10, -29), {f: 'ding.mp3', at: 7.26, db: -21},
    // the log bite-off: the croc dents it, he snaps it, the croc's jaw drops
    {f: 'whoosh.wav', at: S5 - 0.02, db: -28}, {f: 'crocodile.wav', at: DENT - 0.25, db: -26, from: 1.9}, {f: 'creak.wav', at: DENT + 0.05, db: -28, to: 0.4},
    {f: 'crack.wav', at: SNAPL - 0.32, db: -14}, {f: 'chomp.wav', at: SNAPL, db: -19}, {f: 'chomp.wav', at: 8.62, db: -27}, {f: 'chomp.wav', at: 8.84, db: -28},
    {f: 'slide_down.wav', at: JAWDROP, db: -25}, {f: 'thud.wav', at: JAWDROP + 0.32, db: -24}, {f: 'crowd_ooh.wav', at: JAWDROP + 0.02, db: -27, to: 1.2},
    // ONE BY ONE? - NOPE
    {f: 'whoosh.wav', at: S6 - 0.02, db: -29}, {f: 'scribble.wav', at: RING, db: -26, to: 0.45}, {f: 'pop.wav', at: ONEBY, db: -25}, {f: 'wrong.wav', at: NOPE, db: -26, to: 0.5},
    ...ctaCues(T.cta),
    // its near side drops out together; the new set slides up
    {f: 'whoosh.wav', at: S7 - 0.02, db: -30}, {f: 'pop.wav', at: T.side, db: -27}, {f: 'bonk.wav', at: PDROP, db: -18}, {f: 'bubbles.wav', at: PDROP + 0.04, db: -21},
    {f: 'thud.wav', at: PLAND, db: -26}, {f: 'shing.wav', at: PNEW, db: -20}, {f: 'ding.mp3', at: PNEW + 0.06, db: -23},
    // soup: his other side drops in - SPLASH, the laugh
    {f: 'whoosh.wav', at: S8 - 0.02, db: -29}, {f: 'pop.wav', at: DROP2, db: -22}, {f: 'whistle.wav', at: DROP2 + 0.02, db: -30, to: 0.2},
    {f: 'splash.wav', at: SPLASH, db: -12}, {f: 'splat.wav', at: SPLASH + 0.04, db: -26, to: 0.5}, {f: 'crowd_laugh.wav', at: SPLASH + 0.08, db: -22, to: 1.3},
    // half a smile; the new set grows in
    {f: 'whoosh.wav', at: S9 - 0.02, db: -30}, {f: 'pop.wav', at: T.smiles, db: -27}, {f: 'shing.wav', at: REGROW, db: -20}, {f: 'ding.mp3', at: REGROW + 0.06, db: -23},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  // every effect after frame 0 sits 3 dB lower than written above, so the voice stays clear
  const mixed = cues.map((c) => (c.at > 0.05 ? {...c, db: c.db - 3} : c));
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<PiranhaScene t={0} />}>
        <PiranhaScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="piranha/vo/tight.mp3" voiceAt={0.1} cues={mixed} />
    </AbsoluteFill>
  );
};
export const PiranhaWide: React.FC = () => <WideFit.Provider value={0.72}><PiranhaVideo /></WideFit.Provider>;
