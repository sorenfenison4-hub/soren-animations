// "What if you were as tough as a tardigrade?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// Frame 0: he floats in open space beside a big smug tardigrade (water bear), an asteroid BONKs off his head and he keeps
// smiling. 2.45 s close-up: he shrivels - water sprays out of him, he darkens and wrinkles into a raisin with his tiny face.
// UNDER A MICROSCOPE: the real one (0.5 MM) in a water drop; the drop dries, WATER 100 -> 5 %, it curls into a dry barrel,
// BODY 100 -> 0.01 % (PAUSED). Space again: raisin him and the barrel float past a satellite, a meteor BOINGs off him (OPEN
// SPACE, 10 DAYS). A freezer: both frozen in ice cubes, YEARS FROZEN 0 -> 30, the ice cracks, the tardigrade yawns awake.
// Comedy hit: raisin him planted in a flower pot, the smug tardigrade waters him, POP - he springs up full size with the pot
// on his feet. A hot day: the thermometer climbs to 37 °C, both wilt, the awake tardigrade keels over (TOO HOT). Ending: he
// blow-dries himself back into a raisin and sits content next to the dried tardigrade - frame 0 is space again. All code.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, Key, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd, spring,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Poof} from './lib/kit';

// voice: tight.mp3 at 0.1 s (scripts/vsplice.py: line 1 at 1.22, the rest at 1.12; word times refined against the loudness,
// src/data/words.json). Last word ends 18.49 s; + ~0.86 s for the loop push.
export const DURATION = 19.35;
export const T = {
  survive: 0.14, anything: 0.64, tardigrade: 1.23, and: 2.02, shrivel: 2.57, raisin: 3.22, first: 3.61,
  it: 4.18, loses: 4.31, almost: 4.86, all: 5.18, water: 5.57, body: 6.29, nearly: 6.83, stops: 7.29,
  dried: 8.03, up: 8.24, survived: 8.89, open: 9.40, space: 9.76,
  frozen: 10.45, one: 11.03, woke: 11.19, after: 11.82, thirty: 12.16, years: 12.48,
  just: 13.19, add: 13.37, water2: 13.49, back: 14.37,
  but: 14.82, awake: 14.94, hot: 15.80, day: 16.20, kill: 16.63,
  so: 17.23, he: 17.64, stays: 17.75, raisin2: 17.98,
  cta: 10.75,
};
// shots (hard cuts)
const S2 = 2.45, S3 = 4.08, S4 = 7.92, S5 = 10.36, S6 = 13.12, S7 = 15.12, S8 = 17.14;
const PUSH = DURATION - LOOP_DUR;
const DRY0 = 2.55, DRY1 = 3.02;                                     // he shrivels into a raisin
const DROP0 = 4.86, DROP1 = 5.72, TUN0 = 5.18, TUN1 = 5.86, BODY0 = 6.29, BODY1 = 7.08;   // microscope
const METEOR = 8.56;                                                // a meteor bounces off raisin him
const FREEZE0 = 10.45, FREEZE1 = 10.8, YR0 = 11.0, YR1 = 12.45, ICE_CRACK = 12.56;          // freezer
const POUR0 = 13.28, POUR1 = 14.22, POP = 14.37;                    // the watering can
const TEMP0 = 15.5, TEMP1 = 16.22, WILT = 16.48, FLOP = 16.86;      // the hot day
const DRYER0 = 17.3, DRY2A = 17.86, DRY2B = 18.16;                  // the hair dryer

const GOLD = '#FFD43B', RED = '#E2453C', BLUE = '#3D8FD6', FACE_C = '#F1EFEA', WHITE = '#FFFFFF';
const RAISIN = '#6E3A4E', RAISIN_DK = '#47202F', RAISIN_LT = '#9C6479', MAUVE = '#C79AA6';
const TG = '#F2CDB1', TG_DK = '#DDAE8E', TG_TUN = '#C49572', TG_HOT = '#F3A890', TG_BLUSH = '#F09A9A', SNOUT = '#E08F8F';
const SPACE = '#222E58', STAR = '#FFF4C2';
const DROPC = '#8ED3FF', ICE = '#BCE6FA';
const SAND = '#F2DEA8', SAND_DK = '#DEC585', HOTSKY = '#FDE3B0';

type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const mul = (a: P2, k: number): P2 => [a[0] * k, a[1] * k];
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const rot2 = (p: P2, deg: number): P2 => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.26) * (1 - seg(t, a + d, a + d + 0.12));
const inS = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, u: number) => { const A = hx(a), B = hx(b), k = clamp(u); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
/** Catmull-Rom through the points -> smooth cubic path */
const smoothD = (pts: P2[], closed = true) => {
  const n = pts.length, g = (i: number) => pts[closed ? (i + n) % n : Math.max(0, Math.min(n - 1, i))];
  let d = `M ${P(pts[0])}`;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2);
    d += ` C ${P([p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6])} ${P([p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6])} ${P(p2)}`;
  }
  return closed ? d + ' Z' : d;
};
const blob = (rx: number, ry: number, seed: number, n = 14, amp = 0.08) =>
  smoothD(Array.from({length: n}, (_, i) => { const a = (i / n) * Math.PI * 2, r = 1 + amp * (rnd(seed + i * 3.1) * 2 - 1); return [Math.cos(a) * rx * r, Math.sin(a) * ry * r] as P2; }));
const DROP_D = 'M 0 -22 C 8 -8 14 0 14 7 A 14 14 0 0 1 -14 7 C -14 0 -8 -8 0 -22 Z';

// ---------- stickers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
/** a big counter box (screen space) */
const CountBox: React.FC<{label: string; val: string; col: string; s: number; top: number; bump?: number}> = ({label, val, col, s, top, bump = 0}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s * (1 + 0.1 * bump)})`, background: '#FFFDF6', border: `9px solid ${INK}`,
    borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '4px 34px 10px', textAlign: 'center', minWidth: 330, fontFamily: FONT, color: INK, whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: 900, fontSize: 42, lineHeight: 1.1}}>{label}</div>
    <div style={{fontWeight: 900, fontSize: 108, lineHeight: 1, color: col}}>{val}</div>
  </div>
) : null;

// ---------- the guy: front view on a small IK rig, hip at (0, 0), rotated as a whole ----------
const ik = (A: P2, F: P2, L1: number, L2: number, bend: number): P2 => {
  const dx = F[0] - A[0], dy = F[1] - A[1], D = Math.hypot(dx, dy) || 1;
  const d = Math.min(D, L1 + L2 - 0.01);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / D, uy = dy / D;
  return [A[0] + ux * a - uy * h * bend, A[1] + uy * a + ux * h * bend];
};
const quadD = (S: P2, E: P2, H: P2) => { const C: P2 = [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2]; return `M ${P(S)} Q ${P(C)} ${P(H)}`; };
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; hand?: boolean; fill?: string}> = ({S, H, L, sd, w = 29, hand = true, fill = WHITE}) => {
  const d = quadD(S, ik(S, H, L, L, sd), H);
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke={fill} strokeWidth={w - 11} fill="none" strokeLinecap="round" />
      {hand ? <circle cx={H[0]} cy={H[1]} r={13} fill={fill} stroke={INK} strokeWidth={5.5} /> : null}
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

type Mood = 'joy' | 'happy' | 'focus' | 'oof' | 'cry' | 'pop' | 'worry' | 'content' | 'grin' | 'smug' | 'sleep' | 'hot';
/** eyes, brows and mouth around (0, 0) = the middle of a head of radius HEAD_R */
const Face: React.FC<{t: number; m: Mood; look: P2; tears?: number; lidC?: string; red?: number}> = ({t, m, look, tears = 0, lidC = FACE_C, red = 0}) => {
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (m === 'joy' || m === 'happy' || m === 'grin') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (m === 'content' || m === 'sleep') return <path key={sd} d={`M ${ex - 12} ${ey - 2} Q ${ex} ${ey + 8} ${ex + 12} ${ey - 2}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (m === 'oof' || m === 'cry') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = m === 'pop' ? 1.3 : m === 'worry' ? 1.1 : 1;
    const rx = 12 * big, ry = 15 * big;
    const lid = m === 'focus' ? 0.34 : m === 'smug' ? 0.46 : m === 'hot' ? 0.52 : 0;
    const px = ex + look[0] * 4.5, py = ey + look[1] * 5;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={px} cy={py + lid * 6} r={m === 'pop' ? 5 : 6.3} fill={INK} />
        <circle cx={px - 1.5} cy={py - 2 + lid * 6} r={2} fill="#fff" />
        {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={lidC} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brow = (sd: number) => {
    let d = `M ${sd * 12} -44 Q ${sd * 24} -52 ${sd * 37} -46`;
    if (m === 'focus') d = `M ${sd * 10} -34 L ${sd * 37} -42`;
    else if (m === 'oof') d = `M ${sd * 8} -32 L ${sd * 36} -44`;
    else if (m === 'cry' || m === 'worry' || m === 'hot') d = `M ${sd * 10} -48 L ${sd * 36} -37`;
    else if (m === 'pop') d = `M ${sd * 12} -56 Q ${sd * 25} -66 ${sd * 38} -58`;
    else if (m === 'content' || m === 'sleep') d = `M ${sd * 12} -42 Q ${sd * 24} -47 ${sd * 37} -43`;
    else if (m === 'smug') d = sd < 0 ? `M -12 -40 L -37 -44` : `M 12 -50 Q 25 -60 38 -52`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  let mouth: React.ReactNode;
  if (m === 'joy') mouth = <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  else if (m === 'happy') mouth = <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  else if (m === 'grin') mouth = <g><path d="M -28 0 Q 0 6 28 0 Q 24 22 0 24 Q -24 22 -28 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><path d="M -26 8 Q 0 13 26 8" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (m === 'content' || m === 'sleep') mouth = <path d="M -16 6 Q 0 18 16 6" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (m === 'smug') mouth = <path d="M -20 10 Q 4 22 24 2" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (m === 'focus') mouth = <path d="M -15 9 Q 0 6 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (m === 'oof') mouth = <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (m === 'cry') mouth = <g><path d={`M -27 -2 Q 0 -9 27 -2 L 19 ${27 + 2 * Math.sin(t * 24)} Q 0 ${33 + 2 * Math.sin(t * 24)} -19 ${27 + 2 * Math.sin(t * 24)} Z`} fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={23} rx={11} ry={5} fill="#E4677A" /></g>;
  else if (m === 'pop') mouth = <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;
  else if (m === 'hot') { const pant = 3 * Math.sin(t * 22); mouth = <g><path d={`M -20 0 Q 0 -5 20 0 Q 17 ${20 + pant} 0 ${22 + pant} Q -17 ${20 + pant} -20 0 Z`} fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M -10 ${12 + pant} Q -11 ${38 + pant} 0 ${38 + pant} Q 11 ${38 + pant} 10 ${12 + pant} Z`} fill="#E4677A" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>; }
  else mouth = <path d="M -18 10 q 6 -6 12 0 t 12 0 t 12 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  const tearsN = tears > 0.01 ? [-1, 1].map((sd) => (
    <g key={'t' + sd}>
      {[0, 1, 2, 3].map((i) => {
        const ph = (t * 2.6 + i / 4) % 1, x = sd * (34 + ph * 70 * tears), y = -10 + ph * ph * 90 - 18 * ph;
        return <path key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(0.5 * (1 - ph * 0.4) * clamp(tears * 2)).toFixed(3)})`} d={DROP_D} fill={DROPC} stroke={INK} strokeWidth={5} />;
      })}
    </g>
  )) : null;
  return (
    <g>
      {red > 0.01 ? [-1, 1].map((sd) => <ellipse key={'r' + sd} cx={sd * 40} cy={16} rx={15} ry={9} fill="#F07A7A" opacity={0.85 * red} />) : null}
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)">{mouth}</g>
      {tearsN}
    </g>
  );
};

type GS = {x: number; y: number; rot: number; tilt: number; mood: Mood; armA: P2; armB: P2; footA: P2; footB: P2; look: P2;
  sq: number; trem: number; show: number; skin: string; wr: number; sc: number; sweat: number; red: number; tears: number; dryer: number; air: number};
const SHX = 38, SH_Y = -90, NECK = -165, LEG = 40, SOLE = 86;
const BASE: GS = {x: 0, y: 0, rot: 0, tilt: 0, mood: 'happy', armA: [-58, 60], armB: [58, 60], footA: [-26, 70], footB: [26, 70], look: [0, 0],
  sq: 0, trem: 0, show: 1, skin: WHITE, wr: 0, sc: 1, sweat: 0, red: 0, tears: 0, dryer: 0, air: 0};
const LEG_S = (sd: number): P2 => [sd * 19, 4];
const toWorld = (g: GS, p: P2): P2 => add([g.x, g.y], rot2([p[0] * g.sc, (p[1] + 60) * g.sc - 60], g.rot));

/** a sweat drop that slides down and shrinks, looping */
const SweatDrops: React.FC<{t: number; s: number; pts: P2[]}> = ({t, s, pts}) => s > 0.01 ? (
  <g>{pts.map((p, i) => { const ph = (t * 1.5 + i * 0.37) % 1; const k = 0.42 * s * (1 - 0.6 * ph);
    return <path key={i} transform={`translate(${p[0].toFixed(1)} ${(p[1] + ph * 46).toFixed(1)}) scale(${k.toFixed(3)})`} d={DROP_D} fill={DROPC} stroke={INK} strokeWidth={5} />; })}</g>
) : null;

/** the hair dryer, nozzle along +x from the grip at (0, 0) */
const Dryer: React.FC<{on: number; t: number}> = ({on, t}) => (
  <g>
    <path d="M -6 0 L -18 46 Q -20 56 -10 58 L 4 58 Q 12 57 12 48 L 16 8 Z" fill="#3FB6B0" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    <rect x={-52} y={-36} width={96} height={46} rx={23} fill="#F07C5A" stroke={INK} strokeWidth={6} />
    <rect x={40} y={-30} width={34} height={34} rx={8} fill="#3FB6B0" stroke={INK} strokeWidth={5.5} />
    <circle cx={-34} cy={-13} r={14} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
    <path d={`M -34 -13 L ${-34 + 10 * Math.cos(t * 40 * on)} ${-13 + 10 * Math.sin(t * 40 * on)}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    {on > 0.01 ? [0, 1, 2].map((i) => { const ph = (t * 3.2 + i / 3) % 1;
      return <path key={i} d={`M ${82 + ph * 70} ${-24 + i * 10} q 10 -8 20 0 t 20 0`} stroke="#F07C5A" strokeWidth={5} fill="none" strokeLinecap="round" opacity={on} transform={`scale(${1 - 0.4 * ph})`} />; }) : null}
  </g>
);

const Guy: React.FC<{t: number; g: GS}> = ({t, g}) => {
  if (g.show < 0.5) return null;
  const SA: P2 = [-SHX, SH_Y], SB: P2 = [SHX, SH_Y];
  const jig = g.trem * 2.2 * Math.sin(t * 71);
  const legs = [g.footA, g.footB].map((f, i) => { const sd = i ? -1 : 1, S = LEG_S(i ? 1 : -1); return {S, H: f, E: ik(S, f, LEG, LEG, sd), sd}; });
  const crease = mix(g.skin, INK, 0.45);
  const hB = add(SB, g.armB);
  const dryAng = Math.atan2(NECK + 10 - hB[1], -hB[0]) * 180 / Math.PI;
  return (
    <W><g transform={`translate(${(g.x + jig).toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)}) translate(0 -60) scale(${g.sc.toFixed(3)}) translate(0 60)`}>
      {legs.map((l, i) => <Limb key={'l' + i} S={l.S} H={l.H} L={LEG} sd={l.sd} w={30} hand={false} fill={g.skin} />)}
      {legs.map((l, i) => <ellipse key={'f' + i} cx={l.H[0] + (i ? 2 : -2)} cy={l.H[1] + 5} rx={23} ry={9.5} fill={g.skin} stroke={INK} strokeWidth={6} />)}
      <path d={torsoD(47, -112, 13)} fill={g.skin} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {g.wr > 0.01 ? <path d="M -30 -84 Q 0 -74 30 -84 M -38 -50 Q 0 -36 38 -50 M -34 -16 Q 0 -4 34 -16" stroke={crease} strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={g.wr} /> : null}
      <Limb S={SA} H={add(SA, g.armA)} L={77} sd={g.armA[1] > 0 ? 1 : -1} fill={g.skin} />
      <Limb S={SB} H={hB} L={77} sd={g.armB[1] > 0 ? -1 : 1} fill={g.skin} />
      <g transform={`translate(0 ${NECK}) rotate(${(-g.rot + g.tilt + g.trem * 1.6 * Math.sin(t * 53)).toFixed(2)})`}>
        <g transform={`scale(${(1 + 0.08 * g.sq).toFixed(3)} ${(1 - 0.1 * g.sq).toFixed(3)})`}>
          <circle r={HEAD_R + 1} fill={g.skin === WHITE ? 'url(#wFace)' : g.skin} stroke={INK} strokeWidth={6.5} />
          {g.wr > 0.01 ? <path d="M -34 -34 Q -17 -40 0 -34 Q 17 -28 34 -34 M -50 0 Q -42 14 -47 28 M 50 0 Q 42 14 47 28 M -18 54 Q 0 60 18 54" stroke={crease} strokeWidth={4.5} fill="none" strokeLinecap="round" opacity={g.wr} /> : null}
          <Face t={t} m={g.mood} look={g.look} tears={g.tears} lidC={g.skin === WHITE ? FACE_C : g.skin} red={g.red} />
          <SweatDrops t={t} s={g.sweat} pts={[[-70, -30], [72, -44], [-60, 30]]} />
        </g>
      </g>
      {g.dryer > 0.01 ? <g transform={`translate(${P(hB)}) rotate(${dryAng.toFixed(1)}) scale(${g.dryer})`}><Dryer on={g.air} t={t} /></g> : null}
    </g></W>
  );
};

// ---------- raisin him: a wrinkled purple-brown blob with his little face, tiny white hands and feet ----------
type RS = {x: number; y: number; rot: number; s: number; mood: Mood; armA: P2; armB: P2; look: P2; sq: number; trem: number; show: number; tears: number; frost: number};
const R_BASE: RS = {x: 0, y: 0, rot: 0, s: 1, mood: 'content', armA: [-30, 18], armB: [30, 18], look: [0, 0], sq: 0, trem: 0, show: 1, tears: 0, frost: 0};
const RAISIN_D = smoothD(Array.from({length: 40}, (_, i) => {
  const a = (i / 40) * Math.PI * 2, r = 1 + 0.07 * Math.sin(3 * a + 1.3) + 0.045 * Math.sin(5 * a + 0.4) + 0.03 * Math.sin(9 * a + 2.1);
  return [Math.cos(a) * 98 * r, Math.sin(a) * 84 * r] as P2;
}));
const R_GROOVES = 'M -78 -36 Q -52 -60 -16 -58 M 14 -64 Q 50 -62 76 -34 M -94 4 Q -76 -12 -62 8 M 64 18 Q 80 2 94 12 M -70 48 Q -36 70 0 64 M 24 66 Q 54 58 74 40 M -40 -74 Q -20 -80 0 -76';
const R_RIDGES = 'M -74 -46 Q -50 -68 -18 -68 M 18 -74 Q 50 -72 72 -46 M -86 -8 Q -74 -22 -64 -6 M 70 6 Q 82 -6 92 2 M -66 38 Q -36 58 -2 54 M 26 56 Q 52 48 68 32';
const MiniArm: React.FC<{S: P2; H: P2}> = ({S, H}) => (
  <g>
    <path d={`M ${P(S)} L ${P(H)}`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <path d={`M ${P(S)} L ${P(H)}`} stroke={WHITE} strokeWidth={12} strokeLinecap="round" />
    <circle cx={H[0]} cy={H[1]} r={11} fill={WHITE} stroke={INK} strokeWidth={5} />
  </g>
);
const Raisin: React.FC<{t: number; r: RS}> = ({t, r}) => {
  if (r.show < 0.5) return null;
  const jig = r.trem * 2.6 * Math.sin(t * 61);
  const SA: P2 = [-82, 18], SB: P2 = [82, 18];
  return (
    <W><g transform={`translate(${(r.x + jig).toFixed(1)} ${r.y.toFixed(1)}) rotate(${r.rot.toFixed(2)}) scale(${(r.s * (1 + 0.1 * r.sq)).toFixed(3)} ${(r.s * (1 - 0.12 * r.sq)).toFixed(3)})`}>
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 38} cy={86} rx={20} ry={10} fill={WHITE} stroke={INK} strokeWidth={5.5} />)}
      <MiniArm S={SA} H={add(SA, r.armA)} /><MiniArm S={SB} H={add(SB, r.armB)} />
      <path d={RAISIN_D} fill={RAISIN} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <path d={R_RIDGES} stroke={RAISIN_LT} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={R_GROOVES} stroke={RAISIN_DK} strokeWidth={7} fill="none" strokeLinecap="round" />
      {r.frost > 0.01 ? <g opacity={r.frost}>
        <path d={RAISIN_D} fill="#DDF2FF" opacity={0.45} />
        {[[-60, -40], [40, -50], [70, 20], [-30, 50], [-80, 10], [20, 30]].map(([x, y], i) => <path key={i} d={`M ${x - 7} ${y} L ${x + 7} ${y} M ${x} ${y - 7} L ${x} ${y + 7}`} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />)}
      </g> : null}
      <g transform="translate(0 -10) scale(0.8)"><Face t={t} m={r.mood} look={r.look} tears={r.tears} lidC={RAISIN} /></g>
    </g></W>
  );
};

// ---------- the tardigrade (water bear), upright like a cartoon bear, origin = middle of the body ----------
type TMood = 'smug' | 'happy' | 'worry' | 'ko' | 'sleep' | 'yawn' | 'wink' | 'hot';
export type TS = {x: number; y: number; rot: number; s: number; mood: TMood; tun: number; hot: number; wig: number; wave: number; reach: number; can: number; pour: number;
  show: number; frost: number; look: P2; sq: number; sweat: number};
const TG_BASE: TS = {x: 0, y: 0, rot: 0, s: 1, mood: 'smug', tun: 0, hot: 0, wig: 0.3, wave: 0, reach: 0, can: 0, pour: 0, show: 1, frost: 0, look: [0, 0], sq: 0, sweat: 0};
/** the green watering can, grip (top of the handle) at (0, 0), spout to the left */
const CAN_ROSE: P2 = [-150, -8];
const WateringCan: React.FC = () => (
  <g>
    <path d="M -64 34 L -146 -6 L -140 -18 L -58 16 Z" fill="#4FB06A" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    <ellipse cx={-150} cy={-12} rx={11} ry={19} transform="rotate(24 -150 -12)" fill="#3A8A50" stroke={INK} strokeWidth={5} />
    <path d="M -60 18 Q -60 6 -48 6 L 32 6 Q 44 6 44 18 L 40 84 Q 39 94 28 94 L -46 94 Q -57 94 -58 84 Z" fill="#4FB06A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 26 18 L 22 82" stroke="#3A8A50" strokeWidth={10} strokeLinecap="round" />
    <path d="M -30 8 Q -30 -26 0 -26 Q 30 -26 30 8" stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d="M -30 8 Q -30 -26 0 -26 Q 30 -26 30 8" stroke="#4FB06A" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);
const Tardi: React.FC<{t: number; S: TS; uid: string}> = ({t, S, uid}) => {
  if (S.show < 0.5) return null;
  const u = S.tun, hot = S.hot;
  const H = lerp(125, 82, u) * (1 - 0.08 * hot) * (1 - 0.1 * S.sq), R = lerp(74, 90, u) * (1 + 0.07 * hot) * (1 + 0.08 * S.sq);
  const segLen = (2 * H) / 4, amp = lerp(0.05, 0.08, u);
  const w = (y: number) => { const yy = y / H; const base = R * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(yy), 2.5)), 0.4); return base * (1 + amp * Math.cos(2 * Math.PI * ((y + H) / segLen - 0.5))); };
  const n = 36, right: P2[] = [], left: P2[] = [];
  for (let i = 0; i <= n; i++) { const y = -H + (2 * H * i) / n; right.push([w(y), y]); left.push([-w(y), y]); }
  const bodyD = smoothD([...right, ...left.slice(1, n).reverse()]);
  const col = mix(mix(TG, TG_TUN, u), TG_HOT, hot), shade = mix(col, '#9A6A4C', 0.28), line = mix(col, INK, 0.55);
  const Lk = 44 * (1 - u) * (1 - 0.12 * hot);
  const legs: {A: P2; E: P2; dir: P2; th: number}[] = [];
  [-1, 1].forEach((sd) => {
    [1, 2, 3].forEach((k) => {
      const yc = -H + segLen * (k + 0.5);
      let ang = 10 + 12 * k + S.wig * 16 * Math.sin(t * 9 + k * 1.7 + (sd > 0 ? 0 : 2.4)) + 26 * hot;
      let L = Lk;
      if (k === 1 && sd === 1 && S.wave > 0) { ang = lerp(ang, -48 + 22 * Math.sin(t * 15), S.wave); L = lerp(L, 50, S.wave); }
      if (k === 1 && sd === -1 && S.reach > 0) { ang = lerp(ang, -68, S.reach); L = lerp(L, 64, S.reach); }
      const a = (ang * Math.PI) / 180, dir: P2 = [sd * Math.cos(a), Math.sin(a)];
      const A: P2 = [sd * w(yc) * 0.86, yc];
      legs.push({A, E: add(A, mul(dir, L)), dir, th: 1});
    });
    const a = ((72 + S.wig * 10 * Math.sin(t * 9 + (sd > 0 ? 1 : 3.2))) * Math.PI) / 180, dir: P2 = [sd * Math.cos(a) * 0.9, Math.sin(a)];
    const A: P2 = [sd * R * 0.42, H - segLen * 0.32];
    legs.push({A, E: add(A, mul(dir, 34 * (1 - u))), dir, th: 0.92});
  });
  const legW = 34 * (1 - 0.55 * u);
  const fy = lerp(-H + segLen * 0.62, -H * 0.18, u);
  const m = S.mood;
  const eye = (sd: number) => {
    const ex = sd * 25, ey = fy - 10;
    if (m === 'happy') return <path key={sd} d={`M ${ex - 10} ${ey + 3} Q ${ex} ${ey - 9} ${ex + 10} ${ey + 3}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (m === 'sleep' || (m === 'wink' && sd > 0) || m === 'yawn') return <path key={sd} d={m === 'yawn' ? `M ${ex - 10} ${ey - 3} L ${ex + 10} ${ey + 2}` : `M ${ex - 10} ${ey - 1} Q ${ex} ${ey + 7} ${ex + 10} ${ey - 1}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (m === 'ko') return <path key={sd} d={`M ${ex - 8} ${ey - 8} L ${ex + 8} ${ey + 8} M ${ex + 8} ${ey - 8} L ${ex - 8} ${ey + 8}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />;
    const big = m === 'worry' ? 1.25 : 1, rx = 8 * big, ry = 10 * big;
    const lid = m === 'smug' || m === 'wink' ? 0.48 : m === 'hot' ? 0.55 : 0;
    const px = ex + S.look[0] * 2.5, py = ey + S.look[1] * 3;
    return (
      <g key={sd}>
        <ellipse cx={px} cy={py} rx={rx} ry={ry} fill={INK} />
        <circle cx={px - 2.5} cy={py - 3.5} r={2.6} fill="#fff" />
        {lid ? <path d={lidPath(ex, ey, rx + 3, ry + 3, lid)} fill={col} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brows = m === 'smug' || m === 'wink' ? <path d={`M -36 ${fy - 30} L -15 ${fy - 26} M 15 ${fy - 32} Q 26 ${fy - 41} 37 ${fy - 33}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    : m === 'worry' || m === 'hot' ? <path d={`M -36 ${fy - 24} L -15 ${fy - 33} M 15 ${fy - 33} L 36 ${fy - 24}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null;
  const sn = 1 - 0.55 * u, open = m === 'yawn' ? 1 : m === 'ko' || m === 'hot' ? 0.45 : 0;
  const cid = `tgc-${uid}`;
  return (
    <W><g transform={`translate(${S.x.toFixed(1)} ${S.y.toFixed(1)}) rotate(${S.rot.toFixed(2)}) scale(${S.s.toFixed(3)})`}>
      <defs><clipPath id={cid}><path d={bodyD} /></clipPath></defs>
      {legs.map((l, i) => {
        if (Math.hypot(l.E[0] - l.A[0], l.E[1] - l.A[1]) < 3) return null;
        const perp: P2 = [-l.dir[1], l.dir[0]];
        return (
          <g key={i}>
            <path d={`M ${P(l.A)} L ${P(l.E)}`} stroke={INK} strokeWidth={legW * l.th} strokeLinecap="round" />
            <path d={`M ${P(l.A)} L ${P(l.E)}`} stroke={col} strokeWidth={(legW - 11) * l.th} strokeLinecap="round" />
            {u < 0.6 ? [-1, 0, 1].map((c) => { const B = add(add(l.E, mul(l.dir, 12)), mul(perp, c * 8)); const tip = add(add(B, mul(l.dir, 9)), [0, 7]);
              return <path key={c} d={`M ${P(B)} Q ${P(add(B, mul(l.dir, 10)))} ${P(tip)}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />; }) : null}
          </g>
        );
      })}
      <path d={bodyD} fill={col} />
      <g clipPath={`url(#${cid})`}><ellipse cx={R * 0.55} cy={H * 0.45} rx={R * 0.9} ry={H * 0.75} fill={shade} opacity={0.55} /></g>
      {[1, 2, 3].map((k) => { const y = -H + segLen * k, xx = w(y) * 0.9; return <path key={k} d={`M ${-xx} ${y} Q 0 ${y + 10} ${xx} ${y}`} stroke={line} strokeWidth={4.5} fill="none" strokeLinecap="round" />; })}
      {u > 0.3 ? [0.5, 1.5, 2.5, 3.5].map((k) => { const y = -H + segLen * k, xx = w(y) * 0.8; return <path key={k} d={`M ${-xx} ${y + 3} Q 0 ${y + 11} ${xx} ${y + 3}`} stroke={line} strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={seg(u, 0.3, 0.8)} />; }) : null}
      <path d={bodyD} fill="none" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {S.frost > 0.01 ? <g opacity={S.frost}><path d={bodyD} fill="#DDF2FF" opacity={0.45} />
        {[[-40, -60], [30, -20], [-30, 30], [40, 60], [0, -100]].map(([x, y], i) => <path key={i} d={`M ${x - 7} ${y} L ${x + 7} ${y} M ${x} ${y - 7} L ${x} ${y + 7}`} stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />)}</g> : null}
      {[-1, 1].map((sd) => <ellipse key={'b' + sd} cx={sd * 44} cy={fy + 8} rx={11} ry={7} fill={TG_BLUSH} opacity={0.85} />)}
      {eye(-1)}{eye(1)}{brows}
      <g transform={`translate(0 ${fy + 16}) scale(${sn})`}>
        <ellipse cx={0} cy={0} rx={17} ry={13 + 9 * open} fill={SNOUT} stroke={INK} strokeWidth={5} />
        <ellipse cx={0} cy={1 + 2 * open} rx={8 + 3 * open} ry={6 + 9 * open} fill="#5A2328" />
      </g>
      {S.sweat > 0.01 ? <SweatDrops t={t} s={S.sweat} pts={[[-R - 10, fy - 20], [R + 8, fy - 30]]} /> : null}
      {S.can > 0.01 ? (() => {
        const leg = legs[0];   // left side, k = 1: the reaching leg holds the can
        const grip = add(leg.E, mul(leg.dir, 14));
        const tilt = -22 * S.pour;
        const rose = add(grip, rot2(CAN_ROSE, tilt));
        return (
          <g>
            <g transform={`translate(${P(grip)}) rotate(${tilt}) scale(${S.can})`}><WateringCan /></g>
            {S.pour > 0.3 ? Array.from({length: 14}, (_, i) => {
              const ph = (t * 2.4 + i / 14) % 1;
              const p: P2 = [rose[0] - 4 - 14 * ph + 6 * Math.sin(i * 2.1), rose[1] + 6 + 130 * ph * ph + 40 * ph];
              if (p[1] > 19) return null;
              return <path key={i} transform={`translate(${P(p)}) scale(${(0.36 * (1 - 0.3 * ph)).toFixed(3)})`} d={DROP_D} fill={DROPC} stroke={INK} strokeWidth={5} />;
            }) : null}
          </g>
        );
      })() : null}
    </g></W>
  );
};

// ---------- effects ----------
/** water spraying out of a body in all directions, then falling */
const DropSpray: React.FC<{t: number; t0: number; x: number; y: number; n?: number; r?: number; seed?: number; s?: number}> = ({t, t0, x, y, n = 16, r = 130, seed = 1, s = 1}) => {
  const u = t - t0; if (u < 0 || u > 0.8) return null;
  return <W>{Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rnd(seed + i) * 0.5, sp = (0.6 + 0.6 * rnd(seed + i * 5)) * r;
    const k = eout(clamp(u / 0.55));
    const px = x + Math.cos(a) * (36 + sp * k * 1.5), py = y + Math.sin(a) * (44 + sp * k * 1.15) + 240 * u * u;
    const sc = s * 0.46 * (1 - seg(u, 0.5, 0.8)) * (0.7 + 0.5 * rnd(seed + i * 9));
    if (sc < 0.02) return null;
    return <path key={i} transform={`translate(${px.toFixed(1)} ${py.toFixed(1)}) scale(${sc.toFixed(3)})`} d={DROP_D} fill={DROPC} stroke={INK} strokeWidth={5} />;
  })}</W>;
};
const ROCK_D = blob(34, 29, 7, 12, 0.16);
const Rock: React.FC<{x: number; y: number; rot: number; s?: number; trail?: number}> = ({x, y, rot, s = 1, trail = 0}) => (
  <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`}>
    {trail > 0.01 ? <g transform={`rotate(${trail > 0 ? 0 : 0})`}>
      <path d="M 20 -22 L 150 -40 M 26 0 L 190 0 M 20 22 L 150 40" stroke="#FFB347" strokeWidth={10} strokeLinecap="round" opacity={trail} />
    </g> : null}
    <g transform={`rotate(${rot.toFixed(1)})`}>
      <path d={ROCK_D} fill="#A39C93" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <circle cx={-10} cy={-8} r={7} fill="#857E76" stroke={INK} strokeWidth={3} />
      <circle cx={12} cy={6} r={5} fill="#857E76" stroke={INK} strokeWidth={3} />
      <circle cx={-4} cy={14} r={4} fill="#857E76" stroke={INK} strokeWidth={3} />
    </g>
  </g></W>
);
const Burst: React.FC<{x: number; y: number; u: number; r?: number}> = ({x, y, u, r = 1}) => u > 0 && u < 1 ? (
  <W><g transform={`translate(${x} ${y}) scale(${r * (1 - u)})`}>
    {Array.from({length: 8}, (_, i) => { const a = (i / 8) * Math.PI * 2; return <path key={i} d={`M ${Math.cos(a) * 20} ${Math.sin(a) * 20} L ${Math.cos(a) * 46} ${Math.sin(a) * 46}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />; })}
  </g></W>
) : null;

/** the kit's POOF, played faster (sp = speed) so the face shows again sooner */
const POOF_P: [number, number, number][] = [[-62, 18, 42], [-22, -14, 50], [30, 6, 50], [72, 28, 40], [0, 48, 48], [-52, 62, 38], [52, 70, 38], [8, -44, 34], [-86, 52, 30], [90, -6, 30]];
const QPoof: React.FC<{t: number; at: number; x: number; y: number; s?: number; sp?: number}> = ({t, at, x, y, s = 1, sp = 1.7}) => {
  const u = (t - at) * sp;
  if (u < 0 || u > 0.56) return null;
  const k = eout(clamp(u / 0.09)) * (1 - eio(seg(u, 0.3, 0.56)));
  if (k < 0.01) return null;
  const pts = POOF_P.map(([px, py, r]) => [x + s * px * (1 + 0.5 * u), y + s * (py * (1 + 0.3 * u) - 60 * u), s * r * k] as [number, number, number]);
  return <W>
    {pts.map(([cx, cy, r], i) => <circle key={'o' + i} cx={cx} cy={cy} r={r + 7 * k} fill={INK} />)}
    {pts.map(([cx, cy, r], i) => <circle key={'f' + i} cx={cx} cy={cy} r={r} fill="#FFFFFF" />)}
  </W>;
};

// ---------- sets ----------
const STARS = Array.from({length: 90}, (_, i) => ({x: (rnd(i * 7.3) - 0.5) * 3000, y: (rnd(i * 3.9 + 1) - 0.5) * 2600 - 200, r: 2 + 3 * rnd(i * 1.7), sp: rnd(i * 5.1) > 0.82}));
const SpaceFar: React.FC<{t: number}> = ({t}) => (
  <W><g>
    <rect x={-3000} y={-3000} width={6000} height={6000} fill={SPACE} />
    {STARS.map((s, i) => s.sp ? <path key={i} transform={`translate(${s.x.toFixed(0)} ${s.y.toFixed(0)}) scale(${(0.5 + 0.18 * Math.sin(t * 3 + i)).toFixed(3)})`}
      d="M 0 -16 Q 3 -3 16 0 Q 3 3 0 16 Q -3 3 -16 0 Q -3 -3 0 -16 Z" fill={STAR} /> : <circle key={i} cx={s.x} cy={s.y} r={s.r} fill={STAR} opacity={0.85} />)}
  </g></W>
);
const Planets: React.FC = () => (
  <W><g>
    <g transform="translate(-380 760)">
      <circle r={330} fill="#4FA3E0" stroke={INK} strokeWidth={9} />
      <path d="M -210 -180 Q -120 -240 -40 -190 Q 10 -150 -40 -100 Q -110 -60 -170 -100 Q -230 -130 -210 -180 Z M 40 -60 Q 120 -100 190 -40 Q 230 20 170 70 Q 100 100 60 40 Q 20 -10 40 -60 Z M -200 40 Q -140 10 -100 60 Q -80 120 -150 140 Q -220 120 -200 40 Z"
        fill="#7CC66A" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -260 -120 Q -300 0 -250 110" stroke="#FFFFFF" strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.6} />
    </g>
    <g transform="translate(600 -380) rotate(-18)">
      <ellipse rx={130} ry={30} fill="none" stroke={INK} strokeWidth={22} />
      <ellipse rx={130} ry={30} fill="none" stroke="#F5C27A" strokeWidth={11} />
      <circle r={72} fill="#F0A35E" stroke={INK} strokeWidth={8} />
      <path d="M -66 -18 Q 0 -8 66 -18 M -70 14 Q 0 24 70 14" stroke="#D9824A" strokeWidth={9} fill="none" />
      <path d="M -130 0 A 130 30 0 0 0 130 0" fill="none" stroke={INK} strokeWidth={22} />
      <path d="M -130 0 A 130 30 0 0 0 130 0" fill="none" stroke="#F5C27A" strokeWidth={11} />
    </g>
    <g transform="translate(-520 -620)">
      <circle r={44} fill="#D8D4CC" stroke={INK} strokeWidth={7} />
      <circle cx={-12} cy={-10} r={9} fill="#BDB8AE" /><circle cx={14} cy={10} r={7} fill="#BDB8AE" />
    </g>
  </g></W>
);
const Satellite: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <W><g transform={`translate(${x} ${y}) rotate(${rot.toFixed(1)})`}>
    {[-1, 1].map((sd) => <g key={sd}>
      <path d={`M ${sd * 36} 0 L ${sd * 62} 0`} stroke={INK} strokeWidth={8} />
      <rect x={sd > 0 ? 62 : -172} y={-24} width={110} height={48} rx={5} fill="#3D6FB6" stroke={INK} strokeWidth={6} />
      <path d={`M ${sd > 0 ? 99 : -135} -24 V 24 M ${sd > 0 ? 136 : -98} -24 V 24 M ${sd > 0 ? 62 : -172} 0 H ${sd > 0 ? 172 : -62}`} stroke="#9CC3F0" strokeWidth={4} />
    </g>)}
    <rect x={-36} y={-30} width={72} height={60} rx={8} fill="#E8B94A" stroke={INK} strokeWidth={6} />
    <path d="M -24 -14 H 24 M -24 2 H 24 M -24 16 H 10" stroke="#B88A24" strokeWidth={4} strokeLinecap="round" />
    <path d="M 0 -30 L 0 -52" stroke={INK} strokeWidth={5} />
    <path d="M -20 -60 Q 0 -44 20 -60 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g></W>
);

/** the freezer: a white cabinet with a cold blue inside, frost, a shelf */
const FREEZER = {x0: -270, x1: 270, y0: -300, y1: 250};
const Freezer: React.FC<{t: number}> = ({t}) => (
  <W><g>
    <rect x={FREEZER.x0} y={FREEZER.y0} width={FREEZER.x1 - FREEZER.x0} height={FREEZER.y1 - FREEZER.y0} rx={40} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
    <rect x={FREEZER.x0 + 30} y={FREEZER.y0 + 30} width={FREEZER.x1 - FREEZER.x0 - 60} height={FREEZER.y1 - FREEZER.y0 - 60} rx={24} fill="#D6F0FC" stroke={INK} strokeWidth={6} />
    <path d={`M ${FREEZER.x0 + 30} 168 H ${FREEZER.x1 - 30}`} stroke="#9FCBE3" strokeWidth={10} />
    {[[-200, -262, 30], [-130, -266, 22], [-40, -262, 34], [60, -266, 24], [150, -262, 32], [210, -264, 20], [-226, -200, 22], [226, -150, 24], [-226, 60, 18]].map(([x, y, r], i) =>
      <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.6} fill="#FFFFFF" stroke="#A9D7EE" strokeWidth={4} />)}
    {[0, 1, 2, 3].map((i) => { const ph = (t * 0.35 + i / 4) % 1; return <circle key={'m' + i} cx={-160 + i * 110 + 20 * Math.sin(t + i)} cy={-200 + 260 * ph} r={26 * Math.sin(Math.PI * ph)} fill="#FFFFFF" opacity={0.5} />; })}
    <rect x={FREEZER.x0 + 70} y={FREEZER.y1 - 4} width={60} height={22} rx={6} fill="#D8D8D8" stroke={INK} strokeWidth={5} />
    <rect x={FREEZER.x1 - 130} y={FREEZER.y1 - 4} width={60} height={22} rx={6} fill="#D8D8D8" stroke={INK} strokeWidth={5} />
  </g></W>
);
/** a see-through ice cube (drawn in a paper={false} Layer); split = the halves slide apart and fall */
const IceCube: React.FC<{x: number; y: number; w: number; h: number; s: number; split: number}> = ({x, y, w, h, s, split}) => {
  if (s < 0.01) return null;
  const half = (sd: number) => {
    const dx = sd * (70 * split), dy = 220 * split * split, rot = sd * 28 * split;
    const pts = sd < 0 ? `M ${-w / 2} ${-h / 2} L 6 ${-h / 2} L -10 -10 L 10 18 L -6 ${h / 2} L ${-w / 2} ${h / 2} Z` : `M 6 ${-h / 2} L ${w / 2} ${-h / 2} L ${w / 2} ${h / 2} L -6 ${h / 2} L 10 18 L -10 -10 Z`;
    return (
      <g key={sd} transform={`translate(${dx} ${dy}) rotate(${rot})`}>
        <path d={pts} fill={ICE} fillOpacity={0.55} stroke={INK} strokeOpacity={0.85} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M ${sd < 0 ? -w / 2 + 18 : w / 2 - 40} ${-h / 2 + 18} l 22 0 M ${sd < 0 ? -w / 2 + 18 : w / 2 - 30} ${-h / 2 + 34} l 0 30`} stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.9} />
      </g>
    );
  };
  return <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    {split > 0.001 ? [half(-1), half(1)] : <g>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={22} fill={ICE} fillOpacity={0.55} stroke={INK} strokeOpacity={0.85} strokeWidth={6} />
      <path d={`M ${-w / 2 + 20} ${-h / 2 + 20} l 30 0 M ${-w / 2 + 20} ${-h / 2 + 36} l 0 40 M ${w / 2 - 24} ${h / 2 - 60} l 0 30`} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.9} />
    </g>}
  </g></W>;
};

/** table + terracotta pot (rim top at y 0, standing on the table at y 140) */
const TABLE_Y = 140;
const Table: React.FC = () => (
  <W><g>
    <rect x={-900} y={TABLE_Y} width={1800} height={60} fill="#C98F5B" stroke={INK} strokeWidth={8} />
    <rect x={-900} y={TABLE_Y + 60} width={1800} height={600} fill="#A8703F" />
    <path d={`M -900 ${TABLE_Y + 22} H 900`} stroke="#B07A48" strokeWidth={5} />
    <g transform="translate(250 -330)">
      <rect x={-120} y={-150} width={240} height={250} rx={10} fill="#DFF3FB" stroke={INK} strokeWidth={8} />
      <path d="M 0 -150 V 100 M -120 -25 H 120" stroke={INK} strokeWidth={7} />
      <path d="M -90 -120 L -50 -160 M -80 -70 L -20 -130" stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" />
    </g>
  </g></W>
);
const POT_X = -88;
const PotBack: React.FC = () => (
  <W><g transform={`translate(${POT_X} 0)`}>
    <ellipse cx={0} cy={10} rx={112} ry={20} fill="#5A3B27" stroke={INK} strokeWidth={6} />
  </g></W>
);
const PotFront: React.FC<{dirt: number}> = ({dirt}) => (
  <W><g transform={`translate(${POT_X} 0)`}>
    <path d="M -108 30 L -86 140 L 86 140 L 108 30 Z" fill="#D9774A" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 60 40 L 48 132" stroke="#B85C33" strokeWidth={12} strokeLinecap="round" />
    <rect x={-128} y={0} width={256} height={34} rx={10} fill="#E58A5C" stroke={INK} strokeWidth={7} />
    {dirt > 0.01 ? Array.from({length: 7}, (_, i) => { const a = -Math.PI * (0.15 + 0.7 * rnd(i * 3.3)), sp = 160 + 120 * rnd(i * 1.9);
      const p: P2 = [Math.cos(a) * sp * dirt * 1.4, -20 + Math.sin(a) * sp * dirt * 1.5 + 300 * dirt * dirt];
      return <path key={i} transform={`translate(${P(p)}) rotate(${i * 50 + 300 * dirt})`} d="M -9 -6 Q 0 -12 9 -5 Q 12 4 2 8 Q -10 8 -9 -6 Z" fill="#6B4A33" stroke={INK} strokeWidth={4} />; }) : null}
  </g></W>
);

/** the hot day: warm sky, sand, a big sun with a face, heat waves */
const GROUND_Y = 100;
const HotFar: React.FC = () => (
  <W><g><rect x={-3000} y={-3000} width={6000} height={6000} fill={HOTSKY} /></g></W>
);
const HotSet: React.FC<{t: number; heat: number}> = ({t, heat}) => (
  <W><g>
    <g transform={`translate(150 -480) scale(${1 + 0.06 * heat * Math.sin(t * 9)})`}>
      {Array.from({length: 12}, (_, i) => <path key={i} transform={`rotate(${i * 30 + t * 25})`} d="M -16 -128 L 0 -176 L 16 -128 Z" fill="#FFB938" stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
      <circle r={112} fill={GOLD} stroke={INK} strokeWidth={9} />
      <path d="M -52 -16 Q -36 -30 -18 -16 M 18 -16 Q 36 -30 52 -16" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
      <path d="M -40 26 Q 0 62 40 26 Z" fill="#5A2328" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={-62} cy={18} rx={16} ry={10} fill="#F59A5A" /><ellipse cx={62} cy={18} rx={16} ry={10} fill="#F59A5A" />
    </g>
    <rect x={-900} y={GROUND_Y} width={1800} height={700} fill={SAND} stroke={INK} strokeWidth={8} />
    {[[-260, 140, 16], [-40, 180, 10], [170, 150, 13], [300, 200, 9], [-180, 230, 12]].map(([x, y, r], i) => <ellipse key={i} cx={x} cy={y} rx={r * 1.6} ry={r} fill={SAND_DK} stroke={INK} strokeWidth={4} />)}
    {heat > 0.01 ? [-230, -60, 60, 230].map((x, i) => { const ph = (t * 0.9 + i * 0.3) % 1;
      return <path key={'h' + i} d={`M ${x} ${60 - ph * 140} q 14 -20 0 -40 q -14 -20 0 -40`} stroke="#F2A65A" strokeWidth={7} fill="none" strokeLinecap="round" opacity={heat * Math.sin(Math.PI * ph)} />; }) : null}
  </g></W>
);
/** thermometer, bulb at (0, 0); `v` = degrees C shown */
const Thermo: React.FC<{x: number; y: number; v: number}> = ({x, y, v}) => {
  const h = 300, top = -h, lvl = -46 - (h - 70) * clamp((v - 10) / 32);
  return (
    <W><g transform={`translate(${x} ${y})`}>
      <rect x={-26} y={top} width={52} height={h} rx={26} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
      <rect x={-12} y={lvl} width={24} height={-lvl} fill={RED} />
      <circle r={40} fill={RED} stroke={INK} strokeWidth={7} />
      {Array.from({length: 7}, (_, i) => <path key={i} d={`M 26 ${-70 - i * 36} h ${i % 2 ? 14 : 22}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
      <circle cx={-12} cy={-12} r={9} fill="#FF8C84" />
    </g></W>
  );
};

// ---------- inserts (screen space) ----------
const DRIP_D = blob(300, 250, 31, 14, 0.07);
/** UNDER A MICROSCOPE: the real one, half a millimetre, in a water drop; the drop dries away and it curls into a barrel */
const Microscope: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const dry = seg(t, DROP0, DROP1), tun = eio(seg(t, TUN0, TUN1));
  const R = 390;
  const tg: TS = {...TG_BASE, x: 0, y: 6 + 8 * Math.sin(t * 2.2) * (1 - tun), rot: -10 * (1 - tun) * Math.sin(t * 1.7), s: 1.35, tun,
    mood: tun > 0.5 ? 'sleep' : dry > 0.02 ? 'worry' : 'happy', wig: (1 - dry) * 1.1 + 0.08, look: [Math.sin(t * 2.4), 0]};
  const ds = 1 - eio(dry);
  return (
    <div style={{position: 'absolute', left: 540, top: 840, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <defs>
          <radialGradient id="mscope" cx="0.45" cy="0.42" r="0.6"><stop offset="0" stopColor="#FFFDF0" /><stop offset="0.75" stopColor="#FBF0CC" /><stop offset="1" stopColor="#E9D39A" /></radialGradient>
          <clipPath id="mclip"><circle r={R} /></clipPath>
        </defs>
        <circle r={R + 22} fill={INK} />
        <g clipPath="url(#mclip)">
          <circle r={R} fill="url(#mscope)" />
          {ds > 0.02 ? <g transform={`scale(${ds.toFixed(3)})`}>
            <path d={DRIP_D} fill="#CDEEFF" stroke={INK} strokeWidth={6 / Math.max(0.3, ds)} />
            <path d="M -200 -150 Q -150 -200 -80 -210" stroke="#FFFFFF" strokeWidth={16} fill="none" strokeLinecap="round" />
          </g> : null}
          <Tardi t={t} S={tg} uid="ms" />
          <DropSpray t={t} t0={DROP0 + 0.05} x={0} y={-10} n={14} r={160} seed={4} s={1.1} />
          <DropSpray t={t} t0={DROP0 + 0.4} x={0} y={10} n={10} r={120} seed={9} />
          <g transform="translate(-90 344)">
            <path d="M 0 0 H 180 M 0 -14 V 14 M 180 -14 V 14" stroke={INK} strokeWidth={7} strokeLinecap="round" />
            {t > 4.32 ? <text x={90} y={-28} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={52} fill={INK}
              transform={`translate(90 -28) scale(${popIn(t, 4.32, 0.25)}) translate(-90 28)`}>0.5 MM</text> : null}
          </g>
        </g>
        <circle r={R} fill="none" stroke="#8C98AE" strokeWidth={22} />
        <circle r={R + 14} fill="none" stroke={INK} strokeWidth={6} />
      </svg>
    </div>
  );
};

// ---------- the story over time ----------
const G1: P2 = [-92, 4];             // the guy in space (hip)
const RZ: P2 = [-92, -50];           // raisin him right after the shrivel
const guyAt = (t: number): GS | null => {
  if (t < S2) {
    const bob = 6 * Math.sin(t * 1.9);
    const g: GS = {...BASE, x: G1[0], y: G1[1] + bob, rot: 6 + 3 * Math.sin(t * 1.3), tilt: -4, mood: t < 1.5 ? 'joy' : 'happy', look: t > 1.3 ? [1, 0] : [0, 0],
      armA: [-58 + 6 * Math.sin(t * 3), -104 + 8 * Math.sin(t * 2.6)], armB: [62, -58 + 10 * Math.sin(t * 2.2)], footA: [-30, 64], footB: [30, 56], sq: hit(t, 0, 0.5, 8)};
    return g;
  }
  if (t < DRY1) {
    const u = seg(t, DRY0, DRY1);
    const skin = u < 0.5 ? mix(WHITE, MAUVE, u / 0.5) : mix(MAUVE, RAISIN, (u - 0.5) / 0.5);
    return {...BASE, x: G1[0], y: G1[1] + 6 * Math.sin(t * 1.9), rot: 4, mood: t < DRY0 ? 'happy' : u < 0.35 ? 'pop' : 'worry', skin, wr: seg(u, 0.15, 0.7), sc: 1 - 0.38 * eio(u),
      armA: lp2([-58, -60], [-40, 0], u), armB: lp2([62, -40], [40, 0], u), footA: lp2([-30, 64], [-22, 34], u), footB: lp2([30, 56], [22, 34], u), trem: u > 0 ? 1 : 0, sq: 0.5 * Math.sin(Math.PI * u)};
  }
  if (t < POP) return null;
  if (t < S7) {
    // he sprang up out of the flower pot, dripping, the pot round his legs
    const up = spring(t, POP, 22, 3, 6);
    return {...BASE, x: POT_X, y: -36 - up, mood: t < POP + 0.35 ? 'pop' : 'joy', armA: [-74, -84], armB: [74, -84], footA: [-24, 66], footB: [24, 66], sq: hit(t, POP, 1, 7), sweat: 1};
  }
  if (t < S8) {
    const heat = seg(t, TEMP0, TEMP1), wilt = eio(seg(t, WILT, FLOP));
    return {...BASE, x: -80, y: 8 + 16 * wilt, mood: heat > 0.3 ? 'hot' : 'happy', red: heat, sweat: heat > 0.2 ? 1 : 0, sq: 0.35 * wilt,
      armA: lp2([-56, 60], [-40, 76], wilt), armB: lp2([56, 60], [40, 76], wilt), footA: [-28, 70 - 14 * wilt], footB: [28, 70 - 14 * wilt], tilt: -8 * wilt, look: [0, 0.6 * wilt]};
  }
  if (t < DRY2B) {
    const u = seg(t, DRY2A, DRY2B), grab = popIn(t, S8 + 0.02, 0.25);
    const skin = u < 0.5 ? mix(WHITE, MAUVE, u / 0.5) : mix(MAUVE, RAISIN, (u - 0.5) / 0.5);
    return {...BASE, x: -60, y: 8, mood: t < DRYER0 + 0.25 ? 'focus' : u > 0 ? 'content' : 'content', red: 0.6 * (1 - u), sweat: t < DRYER0 + 0.3 ? 1 : 0,
      armA: [-56, 58], armB: [36, -150], dryer: grab, air: t > DRYER0 ? 1 : 0, skin, wr: seg(u, 0.15, 0.7), sc: 1 - 0.38 * eio(u), sq: 0.4 * Math.sin(Math.PI * u), trem: u > 0 ? 0.6 : 0};
  }
  return null;
};
const raisinAt = (t: number): RS | null => {
  if (t < DRY1) return null;
  if (t < S3) {
    return {...R_BASE, x: RZ[0], y: RZ[1] + 4 * Math.sin(t * 2), rot: 4 * Math.sin(t * 1.5), s: 1 + spring(t, DRY1, 0.14, 4, 7), sq: hit(t, DRY1, 0.8, 7),
      mood: t < 3.4 ? 'pop' : 'worry', armA: [-34 + 10 * Math.sin(t * 17), -14 + 8 * Math.sin(t * 13)], armB: [34 - 10 * Math.sin(t * 15), -14 + 8 * Math.sin(t * 11)], trem: 0.5, look: [0, 0.5]};
  }
  if (t < S4) return {...R_BASE, x: -120, y: -30 + 8 * Math.sin(t * 1.6), rot: 8 * Math.sin(t * 0.9), s: 0.95, mood: 'content'};
  if (t < S5) {
    const hitU = t >= METEOR ? eout(seg(t, METEOR, METEOR + 0.9)) : 0;
    return {...R_BASE, x: -70 - 50 * hitU, y: -10 + 6 * Math.sin(t * 1.6) + 30 * hitU, rot: -10 + 8 * Math.sin(t * 0.9) - 340 * hitU, s: 1, sq: hit(t, METEOR, 1, 7),
      mood: t < METEOR ? 'content' : t < METEOR + 0.5 ? 'pop' : 'joy', armA: t > 9.0 ? [-30, -30 + 8 * Math.sin(t * 9)] : [-30, 18], armB: t > 9.0 ? [32, -34] : [30, 18]};
  }
  if (t < S6) {
    const crack = t >= ICE_CRACK;
    return {...R_BASE, x: -112, y: 66, s: 0.8, mood: crack ? 'worry' : t < FREEZE0 ? 'content' : 'sleep', frost: crack ? 1 - seg(t, ICE_CRACK + 0.2, 13.1) : seg(t, FREEZE0, FREEZE1),
      trem: crack ? 1 : 0, armA: crack ? [-28, 4] : [-30, 18], armB: crack ? [28, 4] : [30, 18]};
  }
  if (t < POP) {
    const wet = t > POUR0 + 0.3;
    return {...R_BASE, x: POT_X, y: -16, s: 0.72, mood: wet ? 'grin' : 'content', armA: [-30, -4 + (wet ? 6 * Math.sin(t * 8) : 0)], armB: [30, -4], look: [0.6, -0.6],
      sq: t > POP - 0.14 ? 0.8 * seg(t, POP - 0.14, POP) : 0};
  }
  if (t < DRY2B) return null;
  return {...R_BASE, x: -60, y: 8, s: 1 + spring(t, DRY2B, 0.12, 4, 7), sq: hit(t, DRY2B, 0.7, 7), mood: t < DRY2B + 0.3 ? 'pop' : 'content',
    armA: [-30, 18], armB: t > 18.4 ? [34, -36 + 6 * Math.sin(t * 6)] : [30, 18]};
};
const tgAt = (t: number): TS | null => {
  if (t < S2) return {...TG_BASE, x: 136, y: -36 + 7 * Math.sin(t * 1.7 + 1), rot: -6 + 3 * Math.sin(t * 1.2), s: 1.12, wig: 0.35,
    mood: t > 1.12 && t < 1.85 ? 'wink' : 'smug', wave: seg(t, 1.05, 1.25) * (1 - seg(t, 1.85, 2.05)), look: [-1, 0]};
  if (t < S3) return null;
  if (t < S4) return {...TG_BASE, x: 130, y: -40 + 8 * Math.sin(t * 1.4 + 2), rot: -8 + 6 * Math.sin(t), s: 1, tun: 1, mood: 'sleep'};
  if (t < S5) return {...TG_BASE, x: 120, y: 40 + 8 * Math.sin(t * 1.4 + 2), rot: 12 + 6 * Math.sin(t), s: 1, tun: 1, mood: 'sleep'};
  if (t < S6) {
    const awake = t >= ICE_CRACK, st = seg(t, ICE_CRACK, ICE_CRACK + 0.25);
    return {...TG_BASE, x: 118, y: 36, s: 0.82, mood: awake ? (t < 12.95 ? 'yawn' : 'smug') : 'sleep', wig: awake ? 0.5 : 0, frost: awake ? 1 - seg(t, ICE_CRACK + 0.2, 13.0) : seg(t, FREEZE0, FREEZE1),
      sq: awake ? -0.6 * Math.sin(Math.PI * st) + spring(t, ICE_CRACK + 0.25, 0.3, 3, 6) : 0, wave: awake && t > 12.75 ? 0.7 : 0};
  }
  if (t < S7) {
    const pour = eio(seg(t, POUR0, POUR0 + 0.25)) * (1 - eio(seg(t, POUR1, POUR1 + 0.2)));
    const done = seg(t, POP + 0.05, POP + 0.22);
    return {...TG_BASE, x: 110, y: -14, s: 0.92, mood: t > POP + 0.05 ? 'happy' : 'smug', reach: 1 - done, can: 1 - done, pour, wig: 0.15, look: [-1, 0.5], wave: seg(t, POP + 0.2, POP + 0.35)};
  }
  if (t < S8) {
    const heat = seg(t, TEMP0, TEMP1), flop = eio(seg(t, WILT, FLOP));
    return {...TG_BASE, x: 112 - 34 * flop, y: -50 + 72 * flop, rot: -88 * flop, s: 0.95, hot: heat, mood: t > FLOP ? 'ko' : heat > 0.3 ? 'hot' : 'smug', sweat: heat > 0.2 && t < FLOP ? 1 : 0,
      wig: 0.2 * (1 - heat), sq: hit(t, FLOP, 0.6, 7)};
  }
  return {...TG_BASE, x: 140, y: 30, s: 0.95, tun: 1, mood: 'sleep'};
};

const camFor = (t: number) => camAt([
  {t: 0, x: 24, y: -120, k: 2.36}, {t: S2 - 0.001, x: 10, y: -136, k: 2.58},                    // frame 0: floating in space, BONK
  {t: S2, x: -92, y: -150, k: 3.45}, {t: 3.0, x: -92, y: -100, k: 3.55}, {t: S3 - 0.001, x: -92, y: -66, k: 3.62},   // close-up: the shrivel
  {t: S3, x: 0, y: -40, k: 2.05}, {t: S4 - 0.001, x: 0, y: -40, k: 2.1},                      // (behind the microscope)
  {t: S4, x: 30, y: -70, k: 2.3}, {t: S5 - 0.001, x: 40, y: -66, k: 2.45},                    // open space, the satellite, BOING
  {t: S5, x: 0, y: -30, k: 2.15}, {t: S6 - 0.001, x: 0, y: -16, k: 2.32},                     // the freezer
  {t: S6, x: 16, y: -50, k: 2.22}, {t: S7 - 0.001, x: 16, y: -54, k: 2.28},                   // the watering can, POP
  {t: S7, x: -6, y: -100, k: 2.22}, {t: S8 - 0.001, x: -6, y: -80, k: 2.48},                  // the hot day
  {t: S8, x: 4, y: -80, k: 2.4}, {t: PUSH, x: 20, y: -50, k: 2.7},                            // the hair dryer
] as Key[], t);

export const TardiScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string; thumbTg?: Partial<TS>}> = ({t, camK, thumb, uid = 'm', thumbTg}) => {
  const c0 = camK ? {x: camK.x, y: camK.y, k: camK.k} : (() => { const c = camFor(t); return {x: c.x, y: c.y, k: 1000 / (1000 - c.z)}; })();
  const sh = shake(t, hit(t, 0, 8, 7) + hit(t, DRY1, 6, 7) + hit(t, METEOR, 7, 7) + hit(t, ICE_CRACK, 6, 7) + hit(t, POP, 9, 7) + hit(t, FLOP, 7, 7));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const g = guyAt(t), r = raisinAt(t), tg = thumbTg ? {...TG_BASE, ...thumbTg} : tgAt(t);
  const space = t < S5, hotSet = t >= S7;
  // the asteroid at frame 0 and the meteor in S4
  const rockT = t;
  const rock0: P2 = [-95 - 560 * rockT, -258 - 300 * rockT];
  const metU = seg(t, METEOR - 0.5, METEOR);
  const met: P2 = t < METEOR ? [lerp(560, -40, metU), lerp(-300, -40, metU)] : [lerp(-40, 380, eout(seg(t, METEOR, METEOR + 0.6))), lerp(-40, -420, eout(seg(t, METEOR, METEOR + 0.6)))];
  const heat = hotSet ? seg(t, TEMP0 - 0.3, TEMP1) * (t < S8 ? 1 : 0.4) : 0;
  const tempV = t < TEMP0 ? 24 : lerp(24, 37, eio(seg(t, TEMP0, TEMP1)));
  // inserts
  const micS = popIn(t, S3 + 0.02, 0.32) * (1 - seg(t, S4 - 0.14, S4)) * inS(t, S3, S4);
  const waterV = Math.round(lerp(100, 5, eout(seg(t, DROP0, DROP1 + 0.15))));
  const bodyU = seg(t, BODY0, BODY1), bodyV = 100 * Math.pow(1e-4, eio(bodyU));
  const fmtB = (v: number) => (v >= 10 ? v.toFixed(0) : v >= 1 ? v.toFixed(1) : v.toFixed(2));
  const cntS = inS(t, S3, S4) * (1 - seg(t, S4 - 0.14, S4));
  const waterS = popIn(t, DROP0 - 0.08, 0.26) * cntS * (t < BODY0 - 0.1 ? 1 : 0);
  const bodyS = popIn(t, BODY0 - 0.1, 0.26) * cntS * (t >= BODY0 - 0.1 ? 1 : 0);
  const yrV = Math.round(30 * eio(seg(t, YR0, YR1)));
  const yrS = popIn(t, YR0 - 0.1, 0.28) * inS(t, S5, S6) * (1 - seg(t, S6 - 0.14, S6));
  const iceS = inS(t, S5, S6) * popIn(t, FREEZE0, 0.3);
  const split = t >= ICE_CRACK ? eio(seg(t, ICE_CRACK, ICE_CRACK + 0.5)) : 0;
  const stk = {
    bonk: (t < 0.62 ? 1 : 1 - seg(t, 0.62, 0.74)) * inS(t, 0, S2),
    shrivel: popIn(t, T.shrivel, 0.22) * inS(t, S2, T.raisin - 0.02), raisin: popIn(t, T.raisin, 0.24) * inS(t, S2, S3),
    paused: popIn(t, T.stops - 0.02, 0.26) * inS(t, S3, S4) * (1 - seg(t, S4 - 0.14, S4)),
    boing: popIn(t, METEOR, 0.2) * inS(t, METEOR, S5), open: popIn(t, T.open - 0.04, 0.26) * inS(t, S4, S5), days: popIn(t, T.space + 0.04, 0.26) * inS(t, S4, S5),
    minus: popIn(t, FREEZE0 + 0.12, 0.26) * inS(t, S5, S6), crack: popIn(t, ICE_CRACK, 0.2) * inS(t, ICE_CRACK, 12.95),
    justadd: popIn(t, T.just - 0.04, 0.26) * inS(t, S6, POP), pop: popIn(t, POP, 0.2) * inS(t, POP, S7),
    deg: popIn(t, TEMP1, 0.26) * inS(t, S7, S8), toohot: popIn(t, T.kill - 0.02, 0.26) * inS(t, S7, S8),
    whirr: pulse(t, DRYER0 + 0.05, 0.4) * inS(t, S8, DURATION), safe: popIn(t, DRY2B + 0.05, 0.26) * (1 - seg(t, PUSH - 0.12, PUSH)) * inS(t, S8, DURATION),
  };
  const rx = r ? r.x : 0, ry = r ? r.y : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id="wFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      {space ? <>
        <Layer cam={cam} z={2600} paper={false}><SpaceFar t={t} /></Layer>
        <Layer cam={cam} z={1800}><Planets /></Layer>
      </> : null}
      {hotSet ? <Layer cam={cam} z={2600} paper={false}><HotFar /></Layer> : null}
      <Layer cam={cam} z={1000}>
        {t >= S4 && t < S5 ? <Satellite x={200} y={-250} rot={-12 + 8 * Math.sin(t * 0.8)} /> : null}
        {t >= S5 && t < S6 ? <Freezer t={t} /> : null}
        {t >= S6 && t < S7 ? <><Table /><PotBack /></> : null}
        {hotSet ? <HotSet t={t} heat={heat} /> : null}
        {t >= S7 && t < S8 ? <Thermo x={-214} y={-62} v={tempV} /> : null}
        {tg && !(t >= S6 && t < S7) ? <Tardi t={t} S={tg} uid={uid} /> : null}
        {r ? <Raisin t={t} r={r} /> : null}
        {g ? <Guy t={t} g={g} /> : null}
        {t >= S6 && t < S7 ? <PotFront dirt={t >= POP ? seg(t, POP, POP + 0.7) : 0} /> : null}
        {tg && t >= S6 && t < S7 ? <Tardi t={t} S={tg} uid={uid} /> : null}
        {t < 0.7 ? <Rock x={rock0[0]} y={rock0[1]} rot={-420 * t} /> : null}
        {t >= S4 && t < S5 && t > METEOR - 0.5 && t < METEOR + 0.7 ? <Rock x={met[0]} y={met[1]} rot={-300 * t} s={0.8} trail={t < METEOR ? 1 : 0} /> : null}
      </Layer>
      {t >= S5 && t < S6 ? <Layer cam={cam} z={1000} paper={false}>
        <IceCube x={-112} y={62} w={210} h={200} s={iceS} split={split} />
        <IceCube x={118} y={40} w={250} h={330} s={iceS} split={split} />
      </Layer> : null}
      <Layer cam={cam} z={1000}>
        <Burst x={-84} y={-232} u={seg(t, 0, 0.3)} />
        <DropSpray t={t} t0={DRY0 + 0.04} x={G1[0]} y={G1[1] - 70} n={18} r={150} seed={2} />
        <DropSpray t={t} t0={DRY2A + 0.02} x={-60} y={-60} n={16} r={140} seed={6} />
        <QPoof t={t} at={DRY1 - 0.08} x={G1[0]} y={G1[1] - 50} s={0.5} />
        <QPoof t={t} at={POP - 0.07} x={POT_X} y={-40} s={0.85} />
        <QPoof t={t} at={DRY2B - 0.08} x={-60} y={10} s={0.5} />
        <Burst x={rx - 30} y={ry - 70} u={seg(t, METEOR, METEOR + 0.3)} r={inS(t, S4, S5)} />
        {t >= ICE_CRACK && t < S6 ? Array.from({length: 10}, (_, i) => { const u = seg(t, ICE_CRACK, ICE_CRACK + 0.7), a = (i / 10) * Math.PI * 2;
          const p: P2 = [(i < 5 ? -112 : 118) + Math.cos(a) * 160 * eout(u), 40 + Math.sin(a) * 120 * eout(u) + 200 * u * u];
          return u < 1 ? <W key={i}><path transform={`translate(${P(p)}) rotate(${i * 40 + 400 * u}) scale(${1 - u})`} d="M -10 -8 L 12 -4 L 4 12 Z" fill="#EAF8FF" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></W> : null; }) : null}
        {thumb ? null : <>
          <Txt x={18} y={-246} s={stk.bonk} text="BONK" size={50} rot={-8} fill={GOLD} />
          <Txt x={-36} y={-26} s={stk.shrivel} text="SHRIVEL" size={34} rot={-8} fill="#FFFFFF" />
          <Txt x={RZ[0] + 40} y={RZ[1] + 128} s={stk.raisin} text="RAISIN" size={52} rot={-5} fill={GOLD} />
          <Txt x={rx + 10} y={ry - 140} s={stk.boing} text="BOING" size={46} rot={8} fill={GOLD} />
          <Txt x={40} y={150} s={stk.open} text="OPEN SPACE" size={52} rot={-4} fill="#FFFFFF" />
          <Txt x={150} y={-128} s={stk.days} text="10 DAYS" size={46} rot={6} fill={GOLD} />
          <Txt x={-150} y={-226} s={stk.minus} text="-20 °C" size={50} rot={-6} fill="#BDE7FF" />
          <Txt x={150} y={-200} s={stk.crack} text="CRACK" size={44} rot={7} fill="#FFFFFF" />
          <Txt x={16} y={-246} s={stk.justadd} text="JUST ADD WATER" size={42} rot={-5} fill="#BDE7FF" />
          <Txt x={44} y={-232} s={stk.pop} text="POP" size={64} rot={-10} fill={GOLD} />
          <Txt x={-150} y={-404} s={stk.deg} text="37 °C" size={56} rot={6} fill={RED} />
          <Txt x={60} y={-260} s={stk.toohot} text="TOO HOT" size={50} rot={-6} fill="#FFFFFF" />
          <Txt x={40} y={-250} s={stk.whirr} text="WHIRR" size={44} rot={-8} fill="#FFFFFF" />
          <Txt x={40} y={-170} s={stk.safe} text="SAFE AGAIN" size={50} rot={-4} fill={GOLD} />
        </>}
      </Layer>
      {thumb ? null : <>
        <Microscope t={t} s={micS} />
        <Card text="UNDER A MICROSCOPE" top={380} left={540} rot={-3} size={50} s={micS} />
        <CountBox label="WATER" val={`${waterV} %`} col={waterV > 50 ? BLUE : RED} s={waterS} top={1420} bump={hit(t, DROP1 + 0.15, 1, 6)} />
        <CountBox label="BODY" val={`${fmtB(bodyV)} %`} col={bodyU < 0.5 ? BLUE : RED} s={bodyS} top={1420} bump={hit(t, BODY1, 1, 6)} />
        <Card text="PAUSED" top={1250} left={760} color={GOLD} rot={6} size={56} s={stk.paused} />
        <CountBox label="YEARS FROZEN" val={`${yrV}`} col={BLUE} s={yrS} top={1540} bump={hit(t, YR1, 1, 6)} />
        <CommentBubble t={t} text="what if you were as tough as a tardigrade??" handle="@waterbear_doodle" likes="3.8K" out={1.4} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so} until={PUSH - 0.4} text="Would you live as a raisin?" />
      </>}
    </AbsoluteFill>
  );
};

export const TardiVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const cues: Cue[] = [
    // frame 0: the asteroid BONKs off his head in open space
    {f: 'bonk.wav', at: 0, db: -5}, {f: 'whoosh.wav', at: 0, db: -20}, {f: 'shimmer.wav', at: 0.35, db: -27},
    {f: 'pop.wav', at: 1.08, db: -25},
    // the shrivel: water sprays out, he wrinkles into a raisin
    {f: 'whoosh.wav', at: S2 - 0.02, db: -30}, {f: 'gasp.wav', at: 2.47, db: -19}, {f: 'pfft.wav', at: DRY0 + 0.02, db: -17}, {f: 'splash.wav', at: DRY0 + 0.05, db: -19},
    {f: 'slide_down.wav', at: DRY0 + 0.1, db: -19}, {f: 'crack.wav', at: DRY1 - 0.36, db: -21}, {f: 'squelch.wav', at: DRY1, db: -17}, {f: 'pop.wav', at: T.raisin, db: -22},
    // UNDER A MICROSCOPE: the drop dries, it curls up, its body nearly stops
    {f: 'zap.wav', at: S3 + 0.02, db: -24}, {f: 'pop.wav', at: S3 + 0.06, db: -24}, {f: 'pop.wav', at: 4.32, db: -24},
    {f: 'bubbles.wav', at: DROP0, db: -22}, {f: 'pfft.wav', at: DROP0 + 0.1, db: -21}, ...ticks(DROP0, DROP1 + 0.15, 14, -31), {f: 'stretch.wav', at: TUN0, db: -24, to: 0.7},
    {f: 'pop.wav', at: BODY0 - 0.1, db: -24}, ...ticks(BODY0, BODY1, 10, -31), {f: 'slide_down.wav', at: BODY0 + 0.2, db: -22}, {f: 'pop.wav', at: T.stops - 0.02, db: -20},
    // open space: the meteor BOINGs off raisin him
    {f: 'whoosh.wav', at: S4 - 0.02, db: -30}, {f: 'shimmer.wav', at: S4 + 0.1, db: -28}, {f: 'whoosh.wav', at: METEOR - 0.45, db: -22}, {f: 'boing.wav', at: METEOR, db: -11},
    {f: 'bonk.wav', at: METEOR, db: -16}, {f: 'pop.wav', at: T.open - 0.04, db: -22}, {f: 'pop.wav', at: T.space + 0.04, db: -22},
    // the freezer: ice forms, 30 years, CRACK, a yawn
    {f: 'whoosh.wav', at: S5 - 0.02, db: -30}, {f: 'ice_crack.wav', at: FREEZE0, db: -19, to: 0.9}, {f: 'pop.wav', at: FREEZE0 + 0.12, db: -23},
    {f: 'page_flip.wav', at: YR0 - 0.05, db: -22}, ...ticks(YR0, YR1, 16, -31), {f: 'crack.wav', at: ICE_CRACK - 0.32, db: -14}, {f: 'ice_crack.wav', at: ICE_CRACK, db: -19, from: 0.6, to: 1.4},
    {f: 'yawn.wav', at: ICE_CRACK + 0.06, db: -17, to: 0.62},
    ...ctaCues(T.cta),
    // the watering can: POP, he springs out of the flower pot
    {f: 'whoosh.wav', at: S6 - 0.02, db: -30}, {f: 'pop.wav', at: T.just - 0.04, db: -22}, {f: 'bubbles.wav', at: POUR0 + 0.2, db: -20}, {f: 'bubbles.wav', at: POUR0 + 0.6, db: -22},
    {f: 'stretch.wav', at: POP - 0.5, db: -20, to: 0.5}, {f: 'boing.wav', at: POP, db: -14}, {f: 'pop.wav', at: POP, db: -19}, {f: 'crowd_laugh.wav', at: POP + 0.12, db: -23, to: 1.4},
    // the hot day: 37 °C, wilting, the tardigrade keels over
    {f: 'whoosh.wav', at: S7 - 0.02, db: -30}, {f: 'sizzle.wav', at: S7 + 0.05, db: -30, keys: [[S7, -34], [TEMP1, -29], [S8, -31]], to: 2.0},
    {f: 'slide_up.wav', at: TEMP0, db: -23, to: 0.5}, ...ticks(TEMP0, TEMP1, 9, -32), {f: 'ding.mp3', at: TEMP1, db: -22}, {f: 'pop.wav', at: T.kill - 0.02, db: -25},
    {f: 'slide_down.wav', at: WILT, db: -25}, {f: 'thud.wav', at: FLOP, db: -18},
    // the hair dryer: back into a raisin
    {f: 'whoosh.wav', at: S8 - 0.02, db: -30}, {f: 'pop.wav', at: S8 + 0.04, db: -24}, {f: 'whir.mp3', at: DRYER0, db: -23, to: 1.0},
    {f: 'pfft.wav', at: DRY2A + 0.02, db: -19}, {f: 'squelch.wav', at: DRY2B, db: -20}, {f: 'pop.wav', at: DRY2B + 0.05, db: -22},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<TardiScene t={0} />}>
        <TardiScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="tardigrade/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const TardiWide: React.FC = () => <WideFit.Provider value={0.72}><TardiVideo /></WideFit.Provider>;
