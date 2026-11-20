// "What if you could jump like a flea?" - the escalating "ladder" format from research/2026-11-20-findings.md (the
// small-channel million-view Shorts: one question, many animals, one number climbing, the last rung hits a human body).
// (1) frame 0: kangaroo legs, mid-hop over a car (the car's eyes look up), a smug kangaroo hopping behind it;
// (2) POOF - cat legs: the butt wiggle, POUNCE onto a roof beside a smug cat (MEOW); (3) POOF - flea legs: LOAD, SNAP,
// he rides up the side of a 30-floor tower while the counter races 6 -> 100 m (30 FLOORS); (4) X-RAY: FLEA (a spring
// squeezes, then snaps: CATAPULT); (5) the backfire: he looks down, GULP, drops; the flea floats (SO LIGHT, AIR); he falls
// 30 floors, the counter falls to 0, SPLAT in a crater (crowd laugh), the flea lands on his head; (6) POOF - back to
// kangaroo legs, he hops out = frame 0. A height counter with the ranked rungs (KANGAROO 2.4 m, CAT 6 m, FLEA 100 m).
// Comment bubble opener, CTA, CommentAsk (no either/or ending). All drawn in code; the guy is the camel / bat-wings
// code-drawn front view, his animal legs drawn in profile so their shape reads.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Puffs, Sweat} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.12; times are video time). Last word ends 17.35 s; + 0.85 s for the push.
export const DURATION = 18.2;
export const T = {
  jump: 0.10, kangaroo: 0.67, clear: 1.92, car: 2.17,                       // "Jump like a kangaroo, and you'd clear a car."
  like2: 2.78, cat: 3.06, leap: 3.85, onto: 4.21, roof: 4.49,               // "Like a cat, you'd leap onto a roof."
  like3: 5.08, flea: 5.37, clear2: 6.26, thirty: 6.65, tower: 7.30,         // "Like a flea, you'd clear a thirty-storey tower."
  fleas: 8.06, legs: 8.42, fire: 8.92, catapult: 9.56,                      // "A flea's legs fire like a catapult."
  but: 10.31, flea2: 10.56, so: 11.03, light: 11.21, air: 11.92, fall: 12.74,  // "But a flea is so light, air slows its fall."
  youd: 13.19, drop: 13.40, all: 13.76, thirty2: 14.08, storeys: 14.40,     // "You'd drop all thirty storeys."
  so2: 15.35, sticking: 15.85, kangaroo2: 16.28, legs2: 17.06,              // "So he's sticking with kangaroo legs."
  cta: 10.42,
};
// beats (shot changes are hard cuts)
const LAND1 = 0.80, HOP2 = 1.12, LAND2 = 2.40;                          // kangaroo hops over the car
const S_B = 2.76, POOF1 = 2.80, WIG = 3.18, LEAP = 3.86, RLAND = 4.45, MEOW = 4.62;   // cat legs, onto the roof
const POOF2 = 5.06, FHOP = 5.40, LOAD = 5.62, SNAP = 6.26, APEX = 7.40;  // flea legs, up the tower
const X_IN = 7.88, X_OUT = 10.28;                                       // X-RAY: FLEA
const S_E = 10.30, GULP = 10.84, DROP = 11.05, S_E2 = 11.22, S_F = 12.10, IMPACT = 14.45;   // the fall
const S_G2 = 15.18, NOSE = 15.50, S_G3 = 16.16, POOF3 = 16.26, HOP3 = 16.80;            // crater, back to kangaroo legs

// ---------- world ----------
const M = 171;                                         // world units per metre (he is 1.75 m = 300 units)
const HX0 = 900, HX1 = 1400, HOUSE_H = 1030, ROOF_Y = -1060;          // house facade; top of the roof cap
const TX0 = 1450, TX1 = 2100, FH = 560, FLOORS = 30, TOWER_TOP = -FH * FLOORS;   // 30 floors (98 m)
const APEX_FEET = -16_950;                              // his feet at the top of the flea jump (just over the roof: 100 m)
export const AX = 1780;                                        // apex x (over the tower)
const CX = 2430;                                        // the crater
const GX_B = 1080, GX_ROOF = 1110, CAT_X = 1336, FLEA_X = 1232;

const GOLD = '#FFD43B', RED = '#E2453C';
const ROO = '#C98A4B', ROO2 = '#A86B33', ROO_LT = '#EBC995', PINK = '#EFA3B6';
const CATC = '#F2A33A', CAT2 = '#D9822A', CAT_ST = '#B9601A', CAT_LT = '#FFF0D9';
const FLEAC = '#8A3B22', FLEA2 = '#64260F', FLEA_LT = '#B9653F';
const CARC = '#E2453C', CAR2 = '#B52F2A', GLASS = '#BFE6FF';
const BRICK = '#E9AE93', BRICK2 = '#D38E72', TOWERC = '#AFC6DA', TOWER2 = '#93AEC6', WIN = '#E3F3FF';
const ROAD = '#D9D2C3', ROAD2 = '#C4BCAA', FACE_C = '#F1EFEA';

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
const qbez = (a: P2, c: P2, b: P2, n = 14): P2[] => Array.from({length: n + 1}, (_, i) => {
  const u = i / n;
  return [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]] as P2;
});
const cbez = (a: P2, c1: P2, c2: P2, b: P2, n = 16): P2[] => Array.from({length: n + 1}, (_, i) => {
  const u = i / n, v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0],
    v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1]] as P2;
});
/** a ribbon along pts tapering from w0 to w1 with a round tip (tails) */
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

// ---------- the guy's head (from videos/batwings, + scream / smug / gulp) ----------
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
    return d ? <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null;
  };
  let mouth: React.ReactNode = null;
  if (mood === 'joy') mouth = <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  else if (mood === 'happy') mouth = <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  else if (mood === 'focus') mouth = <path d="M -15 9 Q 0 5 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'look') mouth = <path d="M -12 10 Q 0 13 12 10" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
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
      <circle r={R + 1} fill={`url(#jFace${uid})`} stroke={INK} strokeWidth={6.5} />
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
const ARM = {
  down: sym({e: [52, -56], h: [56, -20]}),
  up: sym({e: [84, -146], h: [96, -204]}),
  reach: sym({e: [76, -172], h: [82, -246]}),
  ready: sym({e: [76, -62], h: [96, -22]}),
  paws: sym({e: [62, -54], h: [42, -14]}),
  out: sym({e: [94, -100], h: [142, -106]}),
  splay: sym({e: [98, -54], h: [140, -30]}),
};
const blendArms = (a: ArmsP, b: ArmsP, u: number): ArmsP => ({l: {e: lp2(a.l.e, b.l.e, u), h: lp2(a.l.h, b.l.h, u)}, r: {e: lp2(a.r.e, b.r.e, u), h: lp2(a.r.h, b.r.h, u)}});
const flail = (t: number): ArmsP => ({
  r: {e: [88 + 8 * Math.sin(t * 17), -140 + 18 * Math.sin(t * 13)], h: [106 + 22 * Math.sin(t * 17 + 1), -196 + 26 * Math.sin(t * 13 + 1.3)]},
  l: {e: [-88 - 8 * Math.sin(t * 15 + 2), -140 + 18 * Math.sin(t * 11 + 2)], h: [-106 - 22 * Math.sin(t * 15 + 3), -196 + 26 * Math.sin(t * 11 + 3.1)]},
});
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

// ---------- animal legs in profile: hip -> knee -> ankle -> toe, blended between four poses ----------
type LegType = 'roo' | 'cat' | 'flea';
type LP = {st: number; cr: number; ex: number; tu: number};
const L_ST: LP = {st: 1, cr: 0, ex: 0, tu: 0}, L_CR: LP = {st: 0, cr: 1, ex: 0, tu: 0};
const L_EX: LP = {st: 0, cr: 0, ex: 1, tu: 0}, L_TU: LP = {st: 0, cr: 0, ex: 0, tu: 1};
const L_TOUCH: LP = {st: 0.6, cr: 0, ex: 0.4, tu: 0}, L_AIR: LP = {st: 0, cr: 0, ex: 0.7, tu: 0.3};
const mixLP = (a: LP, b: LP, u: number): LP => ({st: lerp(a.st, b.st, u), cr: lerp(a.cr, b.cr, u), ex: lerp(a.ex, b.ex, u), tu: lerp(a.tu, b.tu, u)});
type LegDef = {st: P2[]; cr: P2[]; ex: P2[]; tu: P2[]; w: [number, number, number]; c: string; c2: string};
const LEGS: Record<LegType, LegDef> = {
  roo: {st: [[0, 0], [24, 24], [-14, 40], [50, 58]], cr: [[0, 0], [36, 12], [-24, 26], [46, 40]], ex: [[0, 0], [8, 32], [-8, 64], [18, 96]],
    tu: [[0, 0], [36, 6], [2, 30], [54, 38]], w: [44, 24, 19], c: ROO, c2: ROO2},
  cat: {st: [[0, 0], [18, 22], [-10, 40], [2, 58]], cr: [[0, 0], [30, 12], [-22, 24], [8, 40]], ex: [[0, 0], [6, 32], [-8, 62], [-2, 92]],
    tu: [[0, 0], [30, 6], [0, 26], [26, 36]], w: [34, 18, 15], c: CATC, c2: CAT2},
  flea: {st: [[0, 0], [30, 2], [-6, 40], [42, 58]], cr: [[0, 0], [40, -8], [-12, 22], [44, 40]], ex: [[0, 0], [10, 32], [-4, 66], [10, 100]],
    tu: [[0, 0], [38, -4], [8, 26], [52, 34]], w: [26, 15, 11], c: FLEAC, c2: FLEA2},
};
const legPts = (type: LegType, lp: LP): P2[] => {
  const d = LEGS[type];
  return [0, 1, 2, 3].map((i) => [
    d.st[i][0] * lp.st + d.cr[i][0] * lp.cr + d.ex[i][0] * lp.ex + d.tu[i][0] * lp.tu,
    d.st[i][1] * lp.st + d.cr[i][1] * lp.cr + d.ex[i][1] * lp.ex + d.tu[i][1] * lp.tu] as P2);
};
const toeY = (type: LegType, lp: LP) => legPts(type, lp)[3][1];
const Leg: React.FC<{type: LegType; lp: LP; dir: number; back?: boolean}> = ({type, lp, dir, back}) => {
  const d = LEGS[type];
  const p = legPts(type, lp).map(([x, y]) => [x * dir, y] as P2);
  const c = back ? d.c2 : d.c;
  const segs: [P2, P2, number][] = [[p[0], p[1], d.w[0]], [p[1], p[2], d.w[1]], [p[2], p[3], d.w[2]]];
  const line = (a: P2, b: P2) => `M ${P(a)} L ${P(b)}`;
  const ink: React.ReactNode[] = [], fill: React.ReactNode[] = [], top: React.ReactNode[] = [];
  segs.forEach(([a, b, w], i) => {
    ink.push(<path key={'o' + i} d={line(a, b)} stroke={INK} strokeWidth={w + 11} strokeLinecap="round" />);
    fill.push(<path key={'f' + i} d={line(a, b)} stroke={c} strokeWidth={w} strokeLinecap="round" />);
  });
  const ang = (a: P2, b: P2) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;
  const len = (a: P2, b: P2) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const m01 = lp2(p[0], p[1], 0.5), a01 = ang(p[0], p[1]), l01 = len(p[0], p[1]);
  if (type === 'roo') {
    // a fat drumstick thigh and a long foot with a claw
    ink.push(<ellipse key="ti" cx={m01[0]} cy={m01[1]} rx={l01 / 2 + 22} ry={33} transform={`rotate(${a01} ${m01[0]} ${m01[1]})`} fill={INK} />);
    fill.push(<ellipse key="tf" cx={m01[0]} cy={m01[1]} rx={l01 / 2 + 16.5} ry={27.5} transform={`rotate(${a01} ${m01[0]} ${m01[1]})`} fill={c} />);
    const a23 = ang(p[2], p[3]);
    top.push(<path key="cl" d="M 0 -8 L 16 0 L 0 8 Z" transform={`translate(${P(p[3])}) rotate(${a23})`} fill="#F4EBDD" stroke={INK} strokeWidth={4} strokeLinejoin="round" />);
    if (!back) top.push(<path key="hl" d={`M ${P(lp2(p[0], p[1], 0.15))} Q ${P(lp2(m01, p[1], 0.3))} ${P(lp2(p[0], p[1], 0.85))}`} stroke={ROO_LT} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.85} />);
  } else if (type === 'cat') {
    ink.push(<ellipse key="pi" cx={p[3][0] + dir * 6} cy={p[3][1] - 2} rx={20} ry={14} fill={INK} />);
    fill.push(<ellipse key="pf" cx={p[3][0] + dir * 6} cy={p[3][1] - 2} rx={14.5} ry={8.5} fill={c} />);
    [0.38, 0.68].forEach((u, i) => {
      const q = lp2(p[0], p[1], u), a = (a01 + 90) * Math.PI / 180, hw = d.w[0] * 0.36;
      top.push(<path key={'s' + i} d={`M ${P([q[0] - Math.cos(a) * hw, q[1] - Math.sin(a) * hw])} L ${P([q[0] + Math.cos(a) * hw, q[1] + Math.sin(a) * hw])}`} stroke={CAT_ST} strokeWidth={6} strokeLinecap="round" />);
    });
  } else {
    // flea: knobbly joints, spines on the shin, a segmented foot with a claw
    [[p[1], 15], [p[2], 11]].forEach(([q, r], i) => top.push(<circle key={'j' + i} cx={(q as P2)[0]} cy={(q as P2)[1]} r={r as number} fill={c} stroke={INK} strokeWidth={4.5} />));
    const a12 = (ang(p[1], p[2]) - 90) * Math.PI / 180;
    [0.3, 0.55, 0.8].forEach((u, i) => {
      const q = lp2(p[1], p[2], u), sx = -dir;
      top.push(<path key={'sp' + i} d={`M ${P(q)} l ${(Math.cos(a12) * 14 * sx + 6 * dir).toFixed(1)} ${(Math.sin(a12) * 14 * sx - 6).toFixed(1)}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />);
    });
    [0.35, 0.65].forEach((u, i) => {
      const q = lp2(p[2], p[3], u), a = (ang(p[2], p[3]) + 90) * Math.PI / 180;
      top.push(<path key={'tk' + i} d={`M ${P([q[0] - Math.cos(a) * 7, q[1] - Math.sin(a) * 7])} L ${P([q[0] + Math.cos(a) * 7, q[1] + Math.sin(a) * 7])}`} stroke={INK} strokeWidth={3.5} />);
    });
    top.push(<path key="cw" d={`M ${P(p[3])} l ${10 * dir} 4 M ${P(p[3])} l ${8 * dir} -6`} stroke={INK} strokeWidth={4} strokeLinecap="round" />);
  }
  return <g>{ink}{fill}{top}</g>;
};
const Tail: React.FC<{type: LegType; dir: number; lift: number; toe: number; t: number}> = ({type, dir, lift, toe, t}) => {
  if (type === 'roo') {
    const a: P2 = [-30 * dir, 14], e: P2 = [lerp(-156, -150, lift) * dir, lerp(toe - 6, 96, lift)], c: P2 = [-108 * dir, lerp(toe * 0.62, 52, lift)];
    const d = taper(qbez(a, c, e), 44, 13);
    return <g><path d={d} fill={ROO} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <path d={taper(qbez(lp2(a, c, 0.3), lp2(c, e, 0.2), lp2(c, e, 0.75)), 8, 4)} fill={ROO_LT} opacity={0.7} /></g>;
  }
  if (type === 'cat') {
    const sw = 16 * Math.sin(t * 3.1) * (1 - lift);
    const pts = cbez([-34 * dir, 8], [-84 * dir, 22], [(-112 + sw * 0.3) * dir, -60], [(-74 + sw) * dir, lerp(-118, -64, lift)]);
    return <g><path d={taper(pts, 20, 13)} fill={CATC} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[0.35, 0.6, 0.82].map((u, i) => { const q = pts[Math.round(u * (pts.length - 1))]; return <circle key={i} cx={q[0]} cy={q[1]} r={5} fill={CAT_ST} />; })}</g>;
  }
  return null;
};
/** fur (or shell) hips over the bottom of his white body, so the animal legs read as his own */
const Haunch: React.FC<{type: LegType; dir: number}> = ({type, dir}) => {
  const c = LEGS[type].c;
  return (
    <g>
      <ellipse cx={0} cy={6} rx={54} ry={34} fill={c} stroke={INK} strokeWidth={6.5} />
      {type === 'roo' ? <ellipse cx={10 * dir} cy={0} rx={24} ry={16} fill={ROO_LT} opacity={0.8} /> : null}
      {type === 'cat' ? <path d="M -30 -14 Q -22 4 -30 22 M -6 -20 Q 2 0 -6 20 M 18 -16 Q 26 2 18 20" stroke={CAT_ST} strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
      {type === 'flea' ? <g><path d="M -48 0 Q 0 16 48 0 M -40 18 Q 0 32 40 18" stroke={FLEA2} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M -30 -16 Q 0 -24 30 -16" stroke={FLEA_LT} strokeWidth={6} fill="none" strokeLinecap="round" /></g> : null}
    </g>
  );
};
const TORSO_D = 'M -28 -124 C -42 -118 -47 -106 -47 -90 L -46 -16 Q -46 12 -20 13 L 20 13 Q 46 12 46 -16 L 47 -90 C 47 -106 42 -118 28 -124 Z';

type GS = {x: number; y: number; legs: LegType; lp: LP; dir: number; arms: ArmsP; mood: Mood; look: P2; rot: number; sx: number; sy: number;
  sweat: number; lift: number; flat: number; hide?: boolean};
const GuyJ: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  if (g.hide) return null;
  const breathe = 1 + 0.008 * Math.sin(2 * Math.PI * 0.6 * t);
  const sy = g.sy * (1 - 0.5 * g.flat) * breathe, sx = g.sx * (1 + 0.45 * g.flat);
  const toe = toeY(g.legs, g.lp);
  return (
    <W><g transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`}>
      <Tail type={g.legs} dir={g.dir} lift={g.lift} toe={toe} t={t} />
      <g transform={`translate(${-8 * g.dir} -4)`}><Leg type={g.legs} lp={g.lp} dir={g.dir} back /></g>
      <path d={TORSO_D} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <Haunch type={g.legs} dir={g.dir} />
      <g transform={`translate(${7 * g.dir} 2)`}><Leg type={g.legs} lp={g.lp} dir={g.dir} /></g>
      <Arm a={g.arms.l} sd={-1} /><Arm a={g.arms.r} sd={1} />
      <g transform="translate(0 -177)"><Head t={t} mood={g.mood} look={g.look} uid={uid} /></g>
      {g.sweat > 0.01 ? <Sweat x={HEAD_R - 2} y={-222 + 24 * ((t * 0.9) % 1)} s={0.9 * g.sweat} raw /> : null}
    </g></W>
  );
};

// ---------- co-stars ----------
/** the kangaroo, side view facing right, feet at (0,0); air = legs stretched in a hop */
const Kangaroo: React.FC<{t: number; air: number}> = ({t, air}) => {
  const foot = 30 * air;
  return (
    <g>
      <path d={taper(qbez([-26, -62], [-112, lerp(-30, -70, air)], [lerp(-168, -176, air), lerp(-6, -84, air)]), 32, 9)} fill={ROO} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {/* far leg */}
      <g transform="translate(-10 -4)">
        <path d="M -38 -4 Q -40 -26 -18 -26 L 62 -16 Q 82 -12 78 -2 Z" transform={`rotate(${foot} -24 -12)`} fill={ROO2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </g>
      {/* body */}
      <path d="M -36 -52 C -66 -112 -32 -196 18 -198 C 54 -198 64 -150 54 -100 C 48 -62 22 -38 -8 -38 Z" fill={ROO} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={28} cy={-112} rx={20} ry={50} fill={ROO_LT} />
      <path d="M 10 -84 Q 28 -74 46 -86" stroke={ROO2} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* near leg: a big thigh and a long foot */}
      <ellipse cx={-8} cy={-66} rx={50} ry={60} transform="rotate(-24 -8 -66)" fill={ROO} stroke={INK} strokeWidth={7} />
      <path d="M -40 -2 Q -42 -28 -18 -28 L 64 -18 Q 86 -14 80 -2 Z" transform={`rotate(${foot} -26 -14)`} fill={ROO} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {/* little arms */}
      <path d="M 38 -146 Q 58 -132 62 -112" stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" />
      <path d="M 38 -146 Q 58 -132 62 -112" stroke={ROO} strokeWidth={8} fill="none" strokeLinecap="round" />
      {/* ears + head + snout */}
      <ellipse cx={4} cy={-262} rx={11} ry={30} transform="rotate(-30 4 -262)" fill={ROO2} stroke={INK} strokeWidth={6} />
      <ellipse cx={22} cy={-268} rx={12} ry={32} transform="rotate(-14 22 -268)" fill={ROO} stroke={INK} strokeWidth={6} />
      <ellipse cx={23} cy={-266} rx={5} ry={20} transform="rotate(-14 23 -266)" fill={PINK} />
      <path d="M 4 -222 C 4 -252 46 -258 60 -240 L 96 -224 Q 108 -214 96 -204 L 60 -198 C 40 -192 4 -196 4 -222 Z" fill={ROO} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={98} cy={-216} rx={8} ry={6} fill={INK} />
      <ellipse cx={42} cy={-230} rx={10} ry={12} fill="#fff" stroke={INK} strokeWidth={4.5} />
      <circle cx={46} cy={-227} r={5.5} fill={INK} />
      <path d={lidPath(42, -230, 10.5, 12.5, 0.46)} fill={ROO} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M 30 -248 Q 42 -254 54 -248" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M 70 -206 Q 82 -200 92 -207" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    </g>
  );
};
/** the cat, sitting, facing left, bottom at (0,0); look = pupil shift, meow = mouth open */
const Cat: React.FC<{t: number; look: P2; meow: number}> = ({t, look, meow}) => {
  const sw = 14 * Math.sin(t * 2.6);
  const tail = cbez([34, -10], [96, -6], [118 + sw * 0.3, -86], [86 + sw, -134]);
  const eye = (ex: number, ey: number, k: number) => (
    <g key={k}>
      <ellipse cx={ex} cy={ey} rx={10} ry={12} fill="#C6E88E" stroke={INK} strokeWidth={4.5} />
      <ellipse cx={ex + look[0] * 3} cy={ey + 1 + look[1] * 3} rx={2.6} ry={8} fill={INK} />
      <path d={lidPath(ex, ey, 10.5, 12.5, 0.48)} fill={CATC} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
  return (
    <g>
      <path d={taper(tail, 20, 13)} fill={CATC} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[0.4, 0.62, 0.84].map((u, i) => { const q = tail[Math.round(u * (tail.length - 1))]; return <circle key={i} cx={q[0]} cy={q[1]} r={5} fill={CAT_ST} />; })}
      <ellipse cx={8} cy={-58} rx={50} ry={60} fill={CATC} stroke={INK} strokeWidth={7} />
      <path d="M 24 -100 Q 40 -92 50 -76 M 34 -112 Q 50 -100 56 -88" stroke={CAT_ST} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={28} cy={-30} rx={34} ry={30} fill={CATC} stroke={INK} strokeWidth={6.5} />
      <ellipse cx={-16} cy={-80} rx={18} ry={26} fill={CAT_LT} />
      <rect x={-38} y={-74} width={20} height={74} rx={10} fill={CATC} stroke={INK} strokeWidth={6} />
      <rect x={-16} y={-74} width={20} height={74} rx={10} fill={CATC} stroke={INK} strokeWidth={6} />
      <ellipse cx={-28} cy={-4} rx={14} ry={7} fill={CAT_LT} stroke={INK} strokeWidth={4} />
      <ellipse cx={-6} cy={-4} rx={14} ry={7} fill={CAT_LT} stroke={INK} strokeWidth={4} />
      <path d="M -54 -150 L -60 -196 L -24 -170 Z" fill={CATC} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -50 -158 L -54 -184 L -34 -168 Z" fill={PINK} />
      <path d="M 0 -172 L 20 -198 L 28 -152 Z" fill={CATC} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 6 -172 L 18 -188 L 22 -160 Z" fill={PINK} />
      <circle cx={-16} cy={-132} r={44} fill={CATC} stroke={INK} strokeWidth={7} />
      <path d="M -26 -174 L -24 -160 M -12 -176 L -12 -162 M 2 -172 L -1 -159" stroke={CAT_ST} strokeWidth={5.5} strokeLinecap="round" />
      <ellipse cx={-30} cy={-114} rx={19} ry={13} fill={CAT_LT} />
      {eye(-42, -138, 0)}{eye(-8, -140, 1)}
      <path d="M -34 -124 L -24 -124 L -29 -118 Z" fill={PINK} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {meow > 0.05 ? <ellipse cx={-29} cy={-106} rx={7} ry={8 * meow} fill="#5A2328" stroke={INK} strokeWidth={4} />
        : <path d="M -37 -111 Q -33 -106 -29 -111 Q -25 -106 -21 -111" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />}
      <path d="M -46 -116 L -76 -122 M -46 -110 L -76 -108 M -12 -116 L 16 -122 M -12 -110 L 16 -108" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
    </g>
  );
};
/** the flea, side view facing left, feet at (0,0); s scale; float = legs spread for falling slowly; mood */
const Flea: React.FC<{t: number; float: number; mood: 'smug' | 'wow'; hop?: number}> = ({t, float, mood, hop = 0}) => {
  const leg = (pts: P2[], w: number, k: number) => {
    const d = `M ${pts.map(P).join(' L ')}`;
    return <g key={k}><path d={d} stroke={INK} strokeWidth={w + 7} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={d} stroke={FLEA2} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>;
  };
  const f = float, ex = hop;
  return (
    <g>
      {leg([[-22, -26], lp2([-34, -12], [-46, -30], f), lp2([-46, 0], [-66, -12], f)], 7, 0)}
      {leg([[0, -22], lp2([-6, -8], [-6, -2], f), lp2([-14, 0], [-20, 14], f)], 7, 1)}
      {leg([[24, -26], lp2([50, -34 + 10 * ex], [50, -10], f), lp2([38, -8 + 14 * ex], [62, 6], f), lp2([60, 0 + 10 * ex], [80, 14], f)], 9, 2)}
      <path d="M 40 -72 L 48 -82 M 26 -78 L 30 -90 M 10 -80 L 10 -92 M 52 -60 L 62 -66" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <ellipse cx={8} cy={-48} rx={48} ry={32} transform="rotate(-10 8 -48)" fill={FLEAC} stroke={INK} strokeWidth={6.5} />
      <path d="M 14 -78 Q 4 -50 16 -20 M 32 -74 Q 24 -48 34 -24" stroke={FLEA2} strokeWidth={5} fill="none" strokeLinecap="round" />
      <path d="M -12 -70 Q 8 -80 30 -76" stroke={FLEA_LT} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={-38} cy={-44} rx={20} ry={17} fill={FLEAC} stroke={INK} strokeWidth={6} />
      <path d="M -40 -60 Q -36 -78 -22 -84" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M -54 -36 L -60 -22" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
      <ellipse cx={-42} cy={-50} rx={mood === 'wow' ? 10 : 8.5} ry={mood === 'wow' ? 12 : 10} fill="#fff" stroke={INK} strokeWidth={3.8} />
      <circle cx={-45} cy={-49} r={mood === 'wow' ? 3.5 : 4.5} fill={INK} />
      {mood === 'smug' ? <path d={lidPath(-42, -50, 9, 10.5, 0.46)} fill={FLEAC} stroke={INK} strokeWidth={3.4} strokeLinejoin="round" /> : null}
      <path d="M -52 -63 Q -44 -68 -34 -64" stroke={INK} strokeWidth={3.8} fill="none" strokeLinecap="round" />
      {mood === 'smug' ? <path d="M -50 -36 Q -42 -31 -34 -37" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        : <ellipse cx={-43} cy={-35} rx={4} ry={5} fill="#5A2328" stroke={INK} strokeWidth={3} />}
    </g>
  );
};

// ---------- props and set ----------
const Car: React.FC<{look: P2; wow: number}> = ({look, wow}) => {
  const eye = (ex: number, k: number) => (
    <g key={k}>
      <ellipse cx={ex} cy={-118} rx={13 + 3 * wow} ry={15 + 4 * wow} fill="#fff" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + look[0] * 5} cy={-118 + look[1] * 6} r={5.5} fill={INK} />
    </g>
  );
  return (
    <g>
      <path d="M -150 -42 Q -152 -84 -118 -88 L -78 -92 Q -56 -150 -20 -154 L 64 -154 Q 92 -152 106 -104 L 128 -98 Q 152 -92 150 -54 L 150 -40 Q 150 -28 138 -28 L -138 -28 Q -150 -28 -150 -42 Z"
        fill={CARC} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -146 -44 L 146 -44 L 146 -34 L -146 -34 Z" fill={CAR2} />
      <path d="M -66 -96 Q -50 -140 -24 -142 L 10 -142 L 10 -96 Z" fill={GLASS} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M 22 -96 L 22 -142 L 60 -142 Q 82 -140 94 -102 L 94 -96 Z" fill={GLASS} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {eye(-22, 0)}{eye(54, 1)}
      <path d="M 16 -92 L 16 -40" stroke={INK} strokeWidth={4} />
      <path d="M 26 -78 L 44 -78" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <ellipse cx={-140} cy={-66} rx={9} ry={11} fill="#FFE98A" stroke={INK} strokeWidth={4} />
      <rect x={140} y={-74} width={10} height={18} rx={3} fill="#FF8A7E" stroke={INK} strokeWidth={3.5} />
      {[-92, 92].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={32} fill="#3B3F46" stroke={INK} strokeWidth={6} /><circle cx={wx} cy={-30} r={12} fill="#C9CED6" stroke={INK} strokeWidth={4} /></g>)}
    </g>
  );
};
const House: React.FC = () => {
  const winAt = (x: number, y: number, w: number, h: number, k: string) => (
    <g key={k}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill={GLASS} stroke={INK} strokeWidth={6} />
      <path d={`M ${x} ${y - h / 2} V ${y + h / 2} M ${x - w / 2} ${y} H ${x + w / 2}`} stroke="#FFFFFF" strokeWidth={9} />
      <path d={`M ${x} ${y - h / 2} V ${y + h / 2} M ${x - w / 2} ${y} H ${x + w / 2}`} stroke={INK} strokeWidth={3} />
      <rect x={x - w / 2 - 12} y={y + h / 2} width={w + 24} height={16} fill="#F7F1E6" stroke={INK} strokeWidth={5} />
    </g>
  );
  return (
    <g>
      <rect x={1335} y={ROOF_Y - 128} width={58} height={130} fill={BRICK2} stroke={INK} strokeWidth={6} />
      <rect x={1327} y={ROOF_Y - 140} width={74} height={18} fill="#8B7468" stroke={INK} strokeWidth={5} />
      <rect x={HX0} y={-HOUSE_H} width={HX1 - HX0} height={HOUSE_H} fill={BRICK} stroke={INK} strokeWidth={7} />
      {Array.from({length: 16}, (_, i) => {
        const y = -HOUSE_H + 50 + i * 62, x = HX0 + 40 + rnd(i * 3.1) * 380;
        return <path key={i} d={`M ${x} ${y} h 46 M ${x + 23 + (i % 2 ? 40 : -30)} ${y + 30} h 46`} stroke={BRICK2} strokeWidth={6} strokeLinecap="round" />;
      })}
      <rect x={HX0 - 18} y={ROOF_Y} width={HX1 - HX0 + 36} height={30} fill="#8B7468" stroke={INK} strokeWidth={6} />
      {winAt(1030, -760, 130, 170, 'a')}{winAt(1270, -760, 130, 170, 'b')}
      {winAt(1010, -400, 120, 150, 'c')}{winAt(1290, -400, 120, 150, 'd')}
      <rect x={1092} y={-236} width={116} height={236} rx={8} fill="#6B8FB5" stroke={INK} strokeWidth={6} />
      <rect x={1106} y={-220} width={88} height={90} rx={6} fill="#5B7EA2" stroke={INK} strokeWidth={4} />
      <circle cx={1190} cy={-112} r={8} fill={GOLD} stroke={INK} strokeWidth={3.5} />
    </g>
  );
};
/** the 30-floor tower; only the floors near the camera are drawn */
const Tower: React.FC<{cam: {y: number; k: number}}> = ({cam}) => {
  // floor i (1..30 from the ground) spans y in [-i*FH, -(i-1)*FH]; draw only the floors near the camera
  const h = 960 / cam.k + 260;
  const iMin = Math.max(1, Math.floor(-(cam.y + h) / FH)), iMax = Math.min(FLOORS, Math.ceil(1 - (cam.y - h) / FH));
  const floors: React.ReactNode[] = [];
  for (let i = iMin; i <= iMax; i++) {
    const yTop = -i * FH;
    floors.push(<g key={i}>
      <path d={`M ${TX0} ${yTop + FH} H ${TX1}`} stroke={TOWER2} strokeWidth={10} />
      {[0, 1, 2, 3].map((j) => <rect key={j} x={TX0 + 150 + j * 122} y={yTop + 110} width={86} height={320} rx={6} fill={WIN} stroke={INK} strokeWidth={5} />)}
      <text x={TX0 + 74} y={yTop + 290} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={70}
        fill="#FFFFFF" stroke={INK} strokeWidth={10} strokeLinejoin="round" style={{paintOrder: 'stroke'}}>{i}</text>
    </g>);
  }
  return (
    <g>
      <path d={`M ${TX1 - 110} ${TOWER_TOP - 40} V ${TOWER_TOP - 250}`} stroke={INK} strokeWidth={12} />
      <circle cx={TX1 - 110} cy={TOWER_TOP - 256} r={13} fill={RED} stroke={INK} strokeWidth={5} />
      <rect x={TX0 + 90} y={TOWER_TOP - 170} width={150} height={130} rx={10} fill="#C9A27A" stroke={INK} strokeWidth={6} />
      <path d={`M ${TX0 + 105} ${TOWER_TOP - 40} V ${TOWER_TOP} M ${TX0 + 225} ${TOWER_TOP - 40} V ${TOWER_TOP}`} stroke={INK} strokeWidth={8} />
      <rect x={TX0} y={TOWER_TOP} width={TX1 - TX0} height={-TOWER_TOP} fill={TOWERC} stroke={INK} strokeWidth={8} />
      {floors}
      <rect x={TX0 - 14} y={TOWER_TOP - 42} width={TX1 - TX0 + 28} height={44} fill={TOWER2} stroke={INK} strokeWidth={6} />
    </g>
  );
};
const Ground: React.FC<{t: number}> = ({t}) => {
  const crater = t >= IMPACT ? eout(seg(t, IMPACT, IMPACT + 0.12)) : 0;
  return (
    <g>
      <rect x={-3000} y={0} width={9000} height={2600} fill={ROAD} />
      <rect x={-3000} y={0} width={9000} height={26} fill={ROAD2} />
      <path d="M -3000 0 H 6000" stroke={INK} strokeWidth={7} />
      {crater > 0 ? <g>
        <path d={`M ${CX - 190 * crater} 0 Q ${CX} ${120 * crater} ${CX + 190 * crater} 0 Z`} fill="#8E8573" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {[[-1, 0.5], [1, 0.4], [-1, 1.1], [1, 1.2]].map(([sd, a], i) => <path key={i} d={`M ${CX + sd * 150 * crater} ${8} l ${sd * 70 * crater} ${30 * a * crater} l ${sd * 30 * crater} ${50 * crater}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />)}
        {[-1, 1].map((sd) => <path key={'r' + sd} d={`M ${CX + sd * 175 * crater} 2 l ${sd * 26} -26 l ${sd * 30} 8 l ${sd * 8} 22 Z`} fill="#BDB4A2" stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
      </g> : null}
    </g>
  );
};
const Skyline: React.FC = () => {
  const cols = ['#E9DFCC', '#DCE6EE', '#EEDBD3', '#E3E9D6', '#E6DDEB'];
  return (
    <g>
      <rect x={-4000} y={0} width={12000} height={3000} fill="#E4DED1" />
      {Array.from({length: 22}, (_, i) => {
        const x = -2600 + i * 340 + rnd(i * 1.7) * 60, w = 260 + rnd(i * 2.3) * 120, h = 420 + rnd(i * 3.9) * 1100;
        return <g key={i}>
          <rect x={x} y={-h} width={w} height={h} fill={cols[i % cols.length]} stroke={INK} strokeWidth={6} />
          {Array.from({length: Math.floor(h / 160)}, (_, r) => [0, 1].map((c) => <rect key={`${r}${c}`} x={x + 40 + c * (w - 120)} y={-h + 50 + r * 160} width={40} height={70} fill="#FFFFFF" stroke={INK} strokeWidth={3} />))}
        </g>;
      })}
      <path d="M -4000 0 H 8000" stroke={INK} strokeWidth={6} />
    </g>
  );
};
const Cloud: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[[-90, 10, 60], [-30, -24, 78], [50, -10, 70], [110, 18, 50], [10, 28, 64]].map(([cx, cy, r], i) => <circle key={'o' + i} cx={cx} cy={cy} r={r + 7} fill={INK} />)}
    {[[-90, 10, 60], [-30, -24, 78], [50, -10, 70], [110, 18, 50], [10, 28, 64]].map(([cx, cy, r], i) => <circle key={'f' + i} cx={cx} cy={cy} r={r} fill="#FFFFFF" />)}
  </g>
);
const CLOUDS_FAR: [number, number, number][] = Array.from({length: 14}, (_, i) => [1100 + rnd(i * 4.1) * 1500, -2400 - i * 1300 - rnd(i * 2.2) * 400, 1.6 + rnd(i) * 0.8]);
const CLOUDS_NEAR: [number, number, number][] = [[1500, -17_700, 1.1], [2150, -17_050, 0.9], [1320, -16_400, 0.8], [2300, -15_200, 1.0], [1400, -12_800, 0.9], [2250, -9_600, 1.1], [1350, -6_200, 0.9]];

/** POOF: a burst of puffs around his hips that covers the leg swap (swap at +0.12 s) and is gone by +0.55 s */
const POOF_P: [number, number, number][] = [[-62, 18, 42], [-22, -14, 50], [30, 6, 50], [72, 28, 40], [0, 48, 48], [-52, 62, 38], [52, 70, 38], [8, -44, 34], [-86, 52, 30], [90, -6, 30]];
const Poof: React.FC<{t: number; at: number; x: number; y: number}> = ({t, at, x, y}) => {
  const u = t - at;
  if (u < 0 || u > 0.56) return null;
  const k = eout(clamp(u / 0.09)) * (1 - eio(seg(u, 0.3, 0.56)));
  if (k < 0.01) return null;
  const pts = POOF_P.map(([px, py, r]) => [x + px * (1 + 0.5 * u), y + py * (1 + 0.3 * u) - 60 * u, r * k] as [number, number, number]);
  return <W>
    {pts.map(([cx, cy, r], i) => <circle key={'o' + i} cx={cx} cy={cy} r={r + 7 * k} fill={INK} />)}
    {pts.map(([cx, cy, r], i) => <circle key={'f' + i} cx={cx} cy={cy} r={r} fill="#FFFFFF" />)}
  </W>;
};

// ---------- screen-space bits ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 450}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const XFrame: React.FC<{id: string; R: number; t: number; children: React.ReactNode}> = ({id, R, t, children}) => (
  <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
    <clipPath id={id}><circle r={R} /></clipPath>
    <circle r={R + 18} fill={INK} />
    <g clipPath={`url(#${id})`}>
      <rect x={-450} y={-450} width={900} height={900} fill="#16223A" />
      {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
      {children}
      <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
    </g>
    <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
  </svg>
);
/** X-RAY: FLEA - a spring inside its body squeezes as the leg folds (LOADED), then snaps on "catapult" and the flea shoots off */
const FleaXRay: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const rel = t >= T.catapult;
  const cock = eio(seg(t, T.legs - 0.05, T.legs + 0.6));
  const kick = rel ? eout(seg(t, T.catapult, T.catapult + 0.07)) : 0;
  const squeeze = rel ? 1 - kick : cock;
  const fly = rel ? eio(seg(t, T.catapult + 0.04, T.catapult + 0.42)) : 0;
  const trem = !rel && cock > 0.9 ? 2.5 * Math.sin(t * 80) : 0;
  const XL = '#CFE7FF', XB = '#EAF4FF', XD = '#0E1626';
  // hind leg: rest -> cocked (folded under) -> kicked (straight down and back)
  const REST: P2[] = [[70, 60], [150, 70], [96, 140], [176, 168]];
  const COCK: P2[] = [[70, 60], [150, 20], [74, 112], [166, 168]];
  const KICK: P2[] = [[70, 60], [110, 140], [150, 240], [196, 330]];
  const leg = REST.map((p, i) => (rel ? lp2(COCK[i], KICK[i], kick) : lp2(p, COCK[i], cock)));
  const sx0 = -128, sx1 = lerp(-10, -78, squeeze);
  const zig = Array.from({length: 15}, (_, i) => [lerp(sx0, sx1, i / 14), -40 + (i === 0 || i === 14 ? 0 : (i % 2 ? -24 : 24))] as P2);
  const chain = (pts: P2[], ws: number[]) => (
    <g>
      {pts.slice(0, -1).map((p, i) => <path key={'o' + i} d={`M ${P(p)} L ${P(pts[i + 1])}`} stroke={XD} strokeWidth={ws[i] + 9} strokeLinecap="round" />)}
      {pts.slice(0, -1).map((p, i) => <path key={'f' + i} d={`M ${P(p)} L ${P(pts[i + 1])}`} stroke={XB} strokeWidth={ws[i]} strokeLinecap="round" />)}
      {pts.slice(1, -1).map((p, i) => <circle key={'j' + i} cx={p[0]} cy={p[1]} r={ws[i] * 0.7} fill={XB} stroke={XD} strokeWidth={4} />)}
    </g>
  );
  return (
    <div style={{position: 'absolute', left: 540, top: 1100, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id={`fx${uid}`} R={330} t={t}>
        <path d="M -450 172 H 450" stroke="#6F8FB8" strokeWidth={6} strokeDasharray="22 16" />
        {fly > 0.02 ? [-60, 20, 100].map((x, i) => <path key={i} d={`M ${x} ${170 - 40 * i} v ${-260 * fly}`} stroke={XL} strokeWidth={8} strokeLinecap="round" opacity={0.6 * (1 - fly)} />) : null}
        <g transform={`translate(${trem} ${-820 * fly}) rotate(${-14 * fly})`}>
          {/* small legs */}
          {chain([[-110, 70], [-150, 120], [-196, 168]], [12, 9])}
          {chain([[-20, 80], [-40, 128], [-70, 168]], [12, 9])}
          {/* body: abdomen + head */}
          <ellipse cx={30} cy={0} rx={196} ry={120} transform="rotate(-8 30 0)" fill="#2B4470" fillOpacity={0.85} stroke={XL} strokeWidth={8} />
          {[40, 100, 160].map((x, i) => <path key={i} d={`M ${x} -110 Q ${x - 26} 0 ${x + 6} 106`} stroke={XL} strokeWidth={5} fill="none" opacity={0.5} />)}
          <ellipse cx={-186} cy={-6} rx={66} ry={58} fill="#2B4470" stroke={XL} strokeWidth={8} />
          <circle cx={-206} cy={-20} r={16} fill={XL} />
          <path d="M -170 -60 Q -150 -110 -110 -122" stroke={XL} strokeWidth={6} fill="none" strokeLinecap="round" />
          {/* the spring (resilin pad) */}
          <path d={`M ${zig.map(P).join(' L ')}`} stroke="#C6FF5A" strokeWidth={22} fill="none" strokeLinejoin="round" opacity={0.25 + 0.45 * squeeze} />
          <path d={`M ${zig.map(P).join(' L ')}`} stroke="#C6FF5A" strokeWidth={9} fill="none" strokeLinejoin="round" strokeLinecap="round" />
          {/* the big hind leg */}
          {chain(leg, [24, 18, 13])}
        </g>
      </XFrame>
      <Card text="X-RAY: FLEA" top={112} size={50} />
      <Card text="SPRING" top={300} left={190} color={GOLD} rot={-8} s={popIn(t, T.legs - 0.02, 0.3) * (rel ? 1 - seg(t, T.catapult, T.catapult + 0.12) : 1)} size={48} />
      <Card text="LOADED" top={300} left={700} color="#fff" rot={7} s={popIn(t, T.fire, 0.3) * (rel ? 1 - seg(t, T.catapult, T.catapult + 0.12) : 1)} size={46} />
      <Card text="CATAPULT" top={790} color={RED} fg="#fff" rot={-3} s={popIn(t, T.catapult + 0.02, 0.3)} size={58} />
    </div>
  );
};
const RUNGS = [{name: 'KANGAROO', v: '2.4', ref: 'OVER A CAR'}, {name: 'CAT', v: '6', ref: 'ONTO A ROOF'}, {name: 'FLEA', v: '100', ref: '30 FLOORS'}];
/** the one number: how high these legs would throw you, with the finished rungs ranked underneath */
const Counter: React.FC<{t: number; g: GS}> = ({t, g}) => {
  if (t > IMPACT + 0.75) return null;
  const out = 1 - eio(seg(t, IMPACT + 0.5, IMPACT + 0.75));
  const rung = t < POOF1 + 0.1 ? 0 : t < POOF2 + 0.1 ? 1 : 2;
  let v = RUNGS[rung].v, sub = RUNGS[rung].ref, subOn = 1, red = false, landed = 0;
  if (rung === 1) {
    const u = seg(t, LEAP, RLAND - 0.04);
    v = t < LEAP ? '?' : String(Math.max(1, Math.round(6 * u)));
    subOn = t >= RLAND ? 1 : 0; landed = RLAND;
  } else if (rung === 2) {
    if (t < SNAP) { v = '?'; subOn = 0; } else if (t < T.tower) { v = String(Math.max(7, Math.round(100 * eout(seg(t, SNAP, T.tower))))); subOn = 0; } else if (t >= DROP) {
      const h = Math.max(0, -(g.y + toeY(g.legs, g.lp)) / -APEX_FEET) * 100;
      v = String(Math.min(100, Math.round(h))); sub = 'FALLING'; red = true;
    }
    landed = T.tower;
  }
  const bump = landed && t >= landed ? 1 + 0.12 * Math.exp(-6 * (t - landed)) : 1;
  const chips = RUNGS.slice(0, rung);
  return (
    <div style={{position: 'absolute', left: 140, top: 452, transform: `scale(${out})`, transformOrigin: '0 0', fontFamily: FONT, color: INK}}>
      <div style={{background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '8px 26px 12px', minWidth: 300,
        transform: `rotate(-2deg) scale(${bump})`, transformOrigin: '20% 50%'}}>
        <div style={{fontWeight: 900, fontSize: 34, letterSpacing: -0.5}}>{`${rung + 1}. ${RUNGS[rung].name} LEGS`}</div>
        <div style={{fontWeight: 900, fontSize: 96, lineHeight: 1, color: red ? RED : INK}}>{v}<span style={{fontSize: 54}}>{v === '?' ? '' : ' m'}</span></div>
        <div style={{fontWeight: 900, fontSize: 32, color: red ? RED : '#7A5A2A', opacity: subOn}}>{sub}</div>
      </div>
      {chips.map((c, i) => (
        <div key={i} style={{marginTop: 14, marginLeft: 12, display: 'table', background: '#F3EDE0', border: `6px solid ${INK}`, borderRadius: 18, padding: '2px 16px',
          fontWeight: 900, fontSize: 28, transform: `rotate(${i ? 1.5 : -1}deg)`, whiteSpace: 'nowrap'}}>{`${i + 1}. ${c.name} ${c.v} m`}</div>
      ))}
    </div>
  );
};
/** speed streaks in screen space: dir -1 = the world rushes down (rising), 1 = up (falling) */
const Streaks: React.FC<{t: number; s: number; dir: number}> = ({t, s, dir}) => {
  if (s < 0.02) return null;
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      {Array.from({length: 11}, (_, i) => {
        const x = 90 + rnd(i * 7.3) * 900, len = 220 + rnd(i * 3.1) * 260, sp = 2600 + rnd(i * 5.7) * 1600;
        const y = ((((t * sp * -dir) + rnd(i * 9.1) * 2400) % 2400) + 2400) % 2400 - 300;
        return <g key={i} opacity={0.75 * s}>
          <path d={`M ${x} ${y} v ${len}`} stroke={INK} strokeWidth={13} strokeLinecap="round" />
          <path d={`M ${x} ${y} v ${len}`} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />
        </g>;
      })}
    </svg>
  );
};
/** wavy "air" arrows pushing up under the floating flea */
const AirArrows: React.FC<{t: number; x: number; y: number; s: number}> = ({t, x, y, s}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-46, 0, 46].map((dx, i) => {
      const ph = (t * 3 + i * 0.33) % 1, yy = 120 - 60 * ph;
      const d = `M ${dx} ${yy + 70} q 12 -18 0 -35 q -12 -18 0 -35`;
      return <g key={i} opacity={Math.sin(Math.PI * ph)}>
        <path d={d} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
        <path d={d} stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" />
        <path d={`M ${dx - 14} ${yy + 12} L ${dx} ${yy - 6} L ${dx + 14} ${yy + 12}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>;
    })}
  </g></W>
) : null;

// ---------- the story over time ----------
const HOP_ROOT = -175 - toeY('roo', L_AIR);         // kangaroo hop: toes just over the car roof
const hopY = (u: number, y0: number, yA: number, y1: number) => (u < 0.5 ? y0 + (yA - y0) * (1 - (1 - 2 * u) ** 2) : yA + (y1 - yA) * (2 * u - 1) ** 2);
const rootOn = (type: LegType, lp: LP, ground: number) => ground - toeY(type, lp);
export const APEX_ROOT = APEX_FEET - 36;
const fallY = (t: number) => APEX_ROOT + 520 * eio(seg(t, DROP, S_E2)) + (-30 - (APEX_ROOT + 520)) * seg(t, S_E2, IMPACT) ** 2;
const hoverY = (t: number) => APEX_ROOT - 34 * Math.sin(Math.PI * seg(t, APEX, DROP));
const base = (): GS => ({x: 0, y: -58, legs: 'roo', lp: L_ST, dir: 1, arms: ARM.down, mood: 'happy', look: [0, 0], rot: 0, sx: 1, sy: 1, sweat: 0, lift: 0, flat: 0});
const guyAt = (t: number): GS => {
  const g = base();
  // ---- shot A: kangaroo legs over the car ----
  if (t < S_B) {
    g.legs = 'roo';
    if (t < LAND1) {
      const u = t / LAND1;
      g.dir = -1; g.x = lerp(0, -250, u);
      g.lp = u < 0.3 ? L_AIR : mixLP(L_AIR, L_TOUCH, eio(seg(u, 0.3, 0.85)));
      g.y = lerp(HOP_ROOT, -toeY('roo', L_TOUCH), u * u);
      g.arms = ARM.up; g.mood = 'joy'; g.lift = 1 - seg(u, 0.6, 1);
    } else if (t < HOP2) {
      g.dir = t < 0.95 ? -1 : 1; g.x = -250;
      g.lp = t < 0.92 ? mixLP(L_TOUCH, L_CR, eio(seg(t, LAND1, 0.92))) : t < 1.0 ? L_CR : mixLP(L_CR, L_EX, eio(seg(t, 1.0, HOP2)));
      g.y = rootOn('roo', g.lp, 0);
      g.sx = 1 - 0.14 * Math.sin(Math.PI * seg(t, 0.9, 1.0));
      g.arms = blendArms(ARM.up, ARM.out, seg(t, LAND1, 0.9)); g.mood = 'happy';
    } else if (t < LAND2) {
      const u = (t - HOP2) / (LAND2 - HOP2);
      g.dir = 1; g.x = lerp(-250, 250, u);
      g.lp = u < 0.12 ? L_EX : u < 0.35 ? mixLP(L_EX, L_AIR, eio(seg(u, 0.12, 0.35))) : u < 0.62 ? L_AIR : mixLP(L_AIR, L_TOUCH, eio(seg(u, 0.62, 0.92)));
      g.y = hopY(u, -toeY('roo', L_EX), HOP_ROOT, -toeY('roo', L_TOUCH));
      g.arms = blendArms(ARM.out, ARM.up, seg(u, 0, 0.25)); g.mood = 'joy'; g.lift = seg(u, 0, 0.2) * (1 - seg(u, 0.7, 1));
      g.rot = -4 * Math.sin(Math.PI * u);
    } else {
      g.dir = 1; g.x = 250;
      g.lp = t < 2.55 ? mixLP(L_TOUCH, L_CR, eio(seg(t, LAND2, 2.55))) : mixLP(L_CR, L_ST, eio(seg(t, 2.55, S_B)));
      g.y = rootOn('roo', g.lp, 0);
      g.arms = blendArms(ARM.up, ARM.down, seg(t, LAND2, 2.6)); g.mood = 'happy';
    }
    if (t >= LAND1) g.sy *= 1 - 0.07 * Math.exp(-9 * (t - LAND1)) * (t < HOP2 ? 1 : 0);
    if (t >= LAND2) g.sy *= 1 - 0.07 * Math.exp(-9 * (t - LAND2));
    return g;
  }
  // ---- shot B: cat legs, the wiggle, onto the roof ----
  if (t < POOF2 + 0.12) {
    g.legs = t < POOF1 + 0.12 ? 'roo' : 'cat'; g.dir = 1;
    if (t < LEAP) {
      g.x = GX_B;
      g.lp = t < WIG ? L_ST : t < WIG + 0.2 ? mixLP(L_ST, L_CR, eio(seg(t, WIG, WIG + 0.2))) : t < LEAP - 0.08 ? L_CR : mixLP(L_CR, L_EX, eio(seg(t, LEAP - 0.08, LEAP)));
      g.y = rootOn(g.legs, g.lp, 0);
      const wig = seg(t, WIG + 0.2, WIG + 0.3) * (1 - seg(t, LEAP - 0.12, LEAP - 0.06));
      g.rot = 4 * Math.sin(2 * Math.PI * 6.5 * (t - WIG)) * wig; g.x += 6 * Math.sin(2 * Math.PI * 6.5 * (t - WIG)) * wig;
      g.arms = t < WIG ? ARM.down : blendArms(ARM.down, ARM.paws, seg(t, WIG, WIG + 0.2));
      g.mood = t < WIG ? 'happy' : 'focus'; g.look = [0.3, -0.8];
    } else if (t < RLAND) {
      const u = (t - LEAP) / (RLAND - LEAP);
      g.x = lerp(GX_B, GX_ROOF, u);
      g.lp = u < 0.12 ? L_EX : u < 0.4 ? mixLP(L_EX, L_TU, eio(seg(u, 0.12, 0.4))) : u < 0.7 ? L_TU : mixLP(L_TU, L_TOUCH, eio(seg(u, 0.7, 1)));
      const y0 = -toeY('cat', L_EX), yA = ROOF_Y - 36 - 90, y1 = ROOF_Y - toeY('cat', L_TOUCH);
      g.y = u < 0.78 ? y0 + (yA - y0) * (1 - (1 - u / 0.78) ** 2) : yA + (y1 - yA) * ((u - 0.78) / 0.22) ** 2;
      g.arms = blendArms(ARM.paws, ARM.reach, seg(u, 0, 0.3)); g.mood = 'joy'; g.lift = 1;
    } else {
      g.x = GX_ROOF;
      g.lp = t < RLAND + 0.15 ? mixLP(L_TOUCH, L_CR, eio(seg(t, RLAND, RLAND + 0.15))) : mixLP(L_CR, L_ST, eio(seg(t, RLAND + 0.15, RLAND + 0.4)));
      g.y = rootOn(g.legs, g.lp, ROOF_Y);
      g.sy *= 1 - 0.07 * Math.exp(-9 * (t - RLAND));
      g.arms = blendArms(ARM.reach, ARM.down, seg(t, RLAND, RLAND + 0.3));
      g.mood = t < MEOW ? 'happy' : 'look'; g.look = [1, -0.3];
    }
    return g;
  }
  // ---- shot C: flea legs, LOAD, SNAP, up the tower ----
  if (t < APEX) {
    g.legs = 'flea'; g.dir = 1;
    if (t < SNAP) {
      g.x = GX_ROOF;
      g.lp = t < LOAD ? L_ST : t < 6.18 ? mixLP(L_ST, L_CR, eio(seg(t, LOAD, LOAD + 0.3))) : mixLP(L_CR, L_EX, eio(seg(t, 6.18, SNAP)));
      g.y = rootOn('flea', g.lp, ROOF_Y);
      const strain = seg(t, LOAD + 0.2, LOAD + 0.3) * (t < 6.18 ? 1 : 0);
      g.x += 2.5 * Math.sin(t * 70) * strain;
      g.sy *= 1 - 0.05 * strain;
      g.arms = t < LOAD ? ARM.down : blendArms(ARM.down, ARM.ready, seg(t, LOAD, LOAD + 0.25));
      g.mood = t < LOAD ? 'look' : 'focus'; g.look = t < LOAD ? [1, 0.7] : [0, -1];
    } else {
      const u = (t - SNAP) / (APEX - SNAP);
      g.x = lerp(GX_ROOF, AX, eio(u));
      const y0 = rootOn('flea', L_EX, ROOF_Y);
      g.y = y0 + (APEX_ROOT - y0) * (1 - (1 - u) ** 2);
      g.lp = u < 0.62 ? L_EX : mixLP(L_EX, L_TU, eio(seg(u, 0.62, 0.95)));
      g.arms = blendArms(ARM.ready, ARM.reach, seg(u, 0, 0.12)); g.mood = 'joy';
      g.rot = -7 * Math.sin(Math.PI * u);
    }
    return g;
  }
  // ---- apex hover, the X-ray, then he looks down ----
  if (t < DROP) {
    g.legs = 'flea'; g.dir = 1; g.x = AX + 12 * seg(t, APEX, DROP); g.y = hoverY(t);
    g.lp = mixLP(L_TU, {st: 0.5, cr: 0, ex: 0.5, tu: 0}, eio(seg(t, APEX, APEX + 0.5)));
    g.arms = t < S_E ? blendArms(ARM.reach, ARM.up, seg(t, APEX, APEX + 0.3)) : blendArms(ARM.up, ARM.out, seg(t, S_E + 0.2, S_E + 0.5));
    if (t < S_E) { g.mood = t < 8.0 ? 'joy' : 'smug'; } else {
      g.mood = t < 10.5 ? 'look' : t < GULP ? 'worry' : 'gulp'; g.look = [0, 1]; g.sweat = seg(t, 10.5, 10.6);
    }
    return g;
  }
  // ---- the fall ----
  if (t < IMPACT) {
    g.legs = 'flea'; g.dir = 1;
    g.x = lerp(AX + 12, CX, seg(t, S_E2, IMPACT)); g.y = fallY(t);
    const w = 0.5 + 0.5 * Math.sin(t * 15);
    g.lp = mixLP(L_TU, L_EX, w);
    g.arms = flail(t); g.mood = t < S_E2 ? 'shock' : 'scream'; g.sweat = 1;
    g.rot = 7 * Math.sin(t * 5.5);
    return g;
  }
  // ---- crater, then back to kangaroo legs ----
  g.x = CX; g.dir = 1;
  g.legs = t < POOF3 + 0.12 ? 'flea' : 'roo';
  if (t < HOP3) {
    const flat = t < S_G3 ? lerp(1, 0.25, eout(seg(t, IMPACT + 0.05, IMPACT + 0.5))) - 0.12 * Math.sin(Math.PI * seg(t, IMPACT + 0.5, 15.0)) : lerp(0.25, 0, eio(seg(t, S_G3, POOF3 + 0.2)));
    g.flat = Math.max(0, flat);
    g.lp = t < POOF3 + 0.3 ? L_TU : t < 16.55 ? L_ST : t < 16.72 ? mixLP(L_ST, L_CR, eio(seg(t, 16.55, 16.72))) : mixLP(L_CR, L_EX, eio(seg(t, 16.72, HOP3)));
    g.y = t < POOF3 + 0.3 ? 40 - 30 * (1 - g.flat) : rootOn('roo', g.lp, 0);
    if (t >= POOF3 + 0.12 && t < POOF3 + 0.3) g.y = lerp(10, rootOn('roo', L_ST, 0), eio(seg(t, POOF3 + 0.12, POOF3 + 0.3)));
    g.arms = t < S_G3 ? ARM.splay : blendArms(ARM.splay, ARM.down, seg(t, S_G3, POOF3 + 0.3));
    g.mood = t < IMPACT + 0.16 ? 'oof' : t < S_G3 + 0.15 ? 'dizzy' : t < POOF3 + 0.2 ? 'look' : 'happy';
    g.look = [0, -1];
    g.lift = 0;
  } else {
    const u = seg(t, HOP3, HOP3 + 0.7);
    g.lp = u < 0.15 ? L_EX : mixLP(L_EX, L_AIR, eio(seg(u, 0.15, 0.5)));
    const y0 = rootOn('roo', L_EX, 0);
    g.y = y0 - 420 * (1 - (1 - u) ** 2);
    g.x = CX + 60 * u;
    g.arms = ARM.up; g.mood = 'joy'; g.lift = 1;
  }
  return g;
};
type FS = {on: boolean; x: number; y: number; float: number; mood: 'smug' | 'wow'; rot: number; s: number; hop: number};
const fleaAt = (t: number, g: GS): FS => {
  const f: FS = {on: false, x: 0, y: 0, float: 0, mood: 'smug', rot: 0, s: 1, hop: 0};
  if (t < 5.24 || (t >= S_F && t < 15.0)) return f;
  f.on = true;
  if (t < SNAP) {
    const u = seg(t, FHOP, FHOP + 0.42);
    f.x = FLEA_X; f.y = ROOF_Y - 230 * Math.sin(Math.PI * u) - 40 * (1 - popIn(t, 5.24, 0.3));
    f.hop = u > 0 && u < 1 ? 1 : 0;
    return f;
  }
  if (t < DROP) {
    // rides up beside him, then hovers by his head
    const hx = g.x + 104, hy = g.y - 150;
    const u = seg(t, SNAP, SNAP + 0.25);
    f.x = lerp(FLEA_X, hx, eio(u)); f.y = lerp(ROOF_Y, hy, eio(u)) + 6 * Math.sin(t * 4);
    f.mood = t > S_E + 0.3 ? 'smug' : 'smug';
    return f;
  }
  if (t < 15.0) {
    const x0 = AX + 12 + 104, y0 = hoverY(DROP) - 150;
    f.x = x0 + 14 * Math.sin((t - DROP) * 2.2); f.y = y0 + 58 * (t - DROP); f.float = eio(seg(t, DROP, DROP + 0.3));
    f.rot = 10 * Math.sin((t - DROP) * 1.7); f.mood = t < 11.5 ? 'wow' : 'smug';
    return f;
  }
  // lands on his head in the crater, rides along when he hops
  const headY = g.y - (177 + 64) * (g.sy * (1 - 0.5 * g.flat));
  const u = eout(seg(t, 15.0, NOSE));
  f.x = g.x + 6; f.y = lerp(headY - 420, headY + 4, u); f.float = 1 - seg(t, NOSE - 0.1, NOSE);
  f.s = 0.8;
  return f;
};

// ---------- camera ----------
const camFor = (t: number, g: GS, f: FS): {x: number; y: number; k: number} => {
  if (t < S_B) return {x: 0.55 * g.x, y: -365 - 8 * Math.sin(t * 1.7), k: 2.0 + 0.035 * t};
  if (t < LEAP - 0.05) return {x: 1110, y: -205, k: lerp(2.25, 2.33, seg(t, S_B, LEAP))};
  if (t < RLAND + 0.1) { const u = eout(seg(t, LEAP - 0.02, RLAND - 0.05)); return {x: lerp(1110, 1170, u), y: lerp(-205, ROOF_Y - 200, u), k: Math.exp(lerp(Math.log(2.33), Math.log(2.05), u))}; }
  if (t < SNAP) { const u = eio(seg(t, RLAND + 0.1, 6.0)); return {x: lerp(1170, 1236, u), y: ROOF_Y - 200 - 6 * u, k: lerp(2.05, 2.12, u)}; }
  if (t < APEX) {
    const u = seg(t, SNAP, APEX);
    const k = u < 0.3 ? Math.exp(lerp(Math.log(2.12), Math.log(1.75), eio(u / 0.3))) : Math.exp(lerp(Math.log(1.75), Math.log(1.6), eio((u - 0.3) / 0.7)));
    // his hips sit at screen y ~1080 (clear of the counter); the camera eases in from the roof shot
    const follow = g.y - 190 / k, u0 = eio(seg(t, SNAP, SNAP + 0.18));
    return {x: lerp(1236, g.x - 20, u0), y: lerp(ROOF_Y - 206, follow, u0), k};
  }
  if (t < S_E) return {x: AX + 10, y: APEX_ROOT - 113 - 8 * seg(t, APEX, S_E), k: lerp(1.6, 1.66, seg(t, APEX, S_E))};
  if (t < S_E2) { const hy = hoverY(S_E + 0.3) - 177; return {x: AX + 40, y: hy + 14, k: lerp(3.35, 3.5, seg(t, S_E, S_E2))}; }
  if (t < S_F) return {x: f.x - 30, y: f.y + 10, k: lerp(2.7, 2.5, seg(t, S_E2, S_F))};
  if (t < IMPACT) return {x: g.x, y: g.y - 100, k: 1.9};
  if (t < S_G2) return {x: CX + 20, y: -160, k: 1.85};
  if (t < S_G3) return {x: CX + 12, y: -150, k: 3.0};
  return {x: CX + 40, y: -230 - 150 * eio(seg(t, HOP3, 17.6)), k: 2.0};
};

export const JumpScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t), f = fleaAt(t, g);
  const c0 = camK ?? camFor(t, g, f);
  const sh = shake(t, hit(t, 0, 5, 7) + hit(t, LAND1, 4, 8) + hit(t, LAND2, 4, 8) + hit(t, RLAND, 3, 8) + hit(t, SNAP, 9, 6) + hit(t, IMPACT, 26, 4.5) + hit(t, NOSE, 2, 9));
  const camK0 = camAt([{t: 0, x: c0.x, y: c0.y, k: c0.k}], 0);
  const cam = {...camK0, x: camK0.x + sh.x, y: camK0.y + sh.y};
  // co-stars
  const kPh = ((t + 0.4) / 0.8) % 1, kAir = 4 * kPh * (1 - kPh);
  const roo = {x: -330 + 0.45 * g.x * (t < S_B ? 1 : 0), y: -150 * kAir};
  const catLook: P2 = t < RLAND ? [-1, 0.6] : [-1, 0];
  const meow = Math.sin(Math.PI * seg(t, MEOW, MEOW + 0.42));
  const headX = g.x, headY = g.y - 177 * g.sy * (1 - 0.5 * g.flat);
  const carLook: P2 = [clamp((g.x - 10) / 160, -1, 1), -1];
  // stickers (each ends before its cut)
  const st = {
    boing1: pulse(t, LAND1, 0.3), boing2: pulse(t, LAND2, 0.12), poof1: pulse(t, POOF1, 0.25), wiggle: popIn(t, WIG + 0.24, 0.3) * (1 - seg(t, LEAP - 0.1, LEAP + 0.02)),
    pounce: pulse(t, LEAP, 0.35), meow: pulse(t, MEOW, 0.3), poof2: pulse(t, POOF2, 0.25), fleaLbl: popIn(t, 5.3, 0.3) * (1 - seg(t, LOAD + 0.1, LOAD + 0.25)),
    load: popIn(t, LOAD + 0.12, 0.3) * (1 - seg(t, SNAP - 0.06, SNAP + 0.04)), snap: pulse(t, SNAP, 0.3), floors: popIn(t, T.tower, 0.3) * (1 - seg(t, X_IN - 0.12, X_IN)),
    gulp: popIn(t, GULP, 0.25) * (1 - seg(t, S_E2 - 0.12, S_E2)), light: popIn(t, T.light + 0.02, 0.3) * (1 - seg(t, S_F - 0.14, S_F)),
    air: popIn(t, T.air, 0.3) * (1 - seg(t, S_F - 0.14, S_F)), aaah: popIn(t, S_F + 0.1, 0.25) * (1 - seg(t, 13.6, 13.8)),
    splat: popIn(t, IMPACT, 0.22) * (1 - seg(t, S_G2 - 0.12, S_G2)), ouch: popIn(t, S_G2 + 0.06, 0.3) * (1 - seg(t, S_G3 - 0.12, S_G3)),
    boop: pulse(t, NOSE, 0.25), poof3: pulse(t, POOF3, 0.25), boing3: popIn(t, HOP3, 0.3) * (1 - seg(t, 17.5, 17.66)),
  };
  const stars = t > IMPACT + 0.15 && t < S_G3 + 0.1 ? 1 : 0;
  const floatS = t >= DROP && t < S_F ? seg(t, 11.45, 11.7) : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`jFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Sky />
      <Layer cam={cam} z={2700}><W><Skyline /></W></Layer>
      <Layer cam={cam} z={2000}><W>{CLOUDS_FAR.map(([x, y, s], i) => <Cloud key={i} x={x} y={y} s={s} />)}</W></Layer>
      {t < S_B ? <Layer cam={cam} z={1500}><W>
        <rect x={-3000} y={0} width={7000} height={2400} fill="#E1DACC" /><path d="M -3000 0 H 4000" stroke={INK} strokeWidth={6} />
        <g transform={`translate(${roo.x} ${roo.y})`}><Kangaroo t={t} air={kAir} /></g>
      </W></Layer> : null}
      <Layer cam={cam} z={1000}><W>
        {CLOUDS_NEAR.map(([x, y, s], i) => <Cloud key={i} x={x} y={y} s={s} />)}
        <Tower cam={cam0Of(cam)} />
        <House />
        <Ground t={t} />
        <g transform="translate(0 0)"><Car look={carLook} wow={t < 2.6 ? 1 : 0} /></g>
        <g transform={`translate(${CAT_X} ${ROOF_Y})`}><Cat t={t} look={catLook} meow={meow} /></g>
      </W></Layer>
      <Layer cam={cam} z={1000}>
        {t > IMPACT - 0.02 && t < IMPACT + 0.9 ? <>
          <Puffs t={t} born={IMPACT} x={CX - 60} y={-20} n={5} life={0.45} size={80} vx={-200} vy={-260} color="#EDE6D8" seed={11} />
          <Puffs t={t} born={IMPACT} x={CX + 60} y={-20} n={5} life={0.45} size={80} vx={200} vy={-260} color="#EDE6D8" seed={19} />
        </> : null}
        <GuyJ t={t} g={g} uid={uid} />
        {f.on ? <W><g transform={`translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.rot.toFixed(2)}) scale(${f.s})`}><Flea t={t} float={f.float} mood={f.mood} hop={f.hop} /></g></W> : null}
        <AirArrows t={t} x={f.x - 6} y={f.y + 10} s={floatS} />
        <Poof t={t} at={POOF1} x={GX_B} y={-30} />
        <Poof t={t} at={POOF2} x={GX_ROOF} y={ROOF_Y - 30} />
        <Poof t={t} at={POOF3} x={CX} y={-24} />
        {t > IMPACT - 0.02 && t < IMPACT + 0.8 ? <>
          <Puffs t={t} born={IMPACT} x={CX - 130} y={-10} n={6} life={0.6} size={46} vx={-360} vy={-50} color="#EDE6D8" seed={13} />
          <Puffs t={t} born={IMPACT} x={CX + 130} y={-10} n={6} life={0.6} size={46} vx={360} vy={-50} color="#EDE6D8" seed={17} />
        </> : null}
        {[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={headX + Math.cos(a) * 96} y={headY - 90 + Math.sin(a) * 16} s={stars * 0.52} rot={t * 200} />;
        })}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={g.x - 40} y={-30} s={st.boing1} text="BOING" size={50} rot={-6} fill={GOLD} />
        <Txt x={250 + 40} y={-30} s={st.boing2} text="BOING" size={50} rot={6} fill={GOLD} />
        <Txt x={GX_B + 130} y={-170} s={st.poof1} text="POOF" size={52} rot={8} fill="#FFFFFF" />
        <Txt x={GX_B + 160} y={-330} s={st.wiggle} text="WIGGLE" size={52} rot={-6} fill={GOLD} />
        <Txt x={g.x + 190} y={g.y - 120} s={st.pounce} text="POUNCE" size={56} rot={-8} fill="#FFFFFF" />
        <Txt x={CAT_X + 40} y={ROOF_Y - 250} s={st.meow} text="MEOW" size={46} rot={8} fill="#FFFFFF" />
        <Txt x={GX_ROOF + 140} y={ROOF_Y - 200} s={st.poof2} text="POOF" size={52} rot={-8} fill="#FFFFFF" />
        <Txt x={f.x + 112} y={f.y - 30} s={st.fleaLbl} text="FLEA" size={38} rot={-4} fill={GOLD} />
        <Txt x={GX_ROOF + 215} y={ROOF_Y - 330} s={st.load} text="LOAD" size={52} rot={-7} fill={GOLD} />
        <Txt x={GX_ROOF + 30} y={ROOF_Y - 40} s={st.snap} text="SNAP" size={64} rot={6} fill={RED} />
        <Txt x={AX + 30} y={TOWER_TOP - 72} s={st.floors} text="30 FLOORS" size={70} rot={-4} fill={GOLD} />
        <Txt x={headX + 128} y={headY + 70} s={st.gulp} text="GULP" size={36} rot={10} fill="#FFFFFF" />
        <Txt x={f.x + 60} y={f.y - 150} s={st.light} text="SO LIGHT" size={42} rot={-5} fill={GOLD} />
        <Txt x={f.x - 130} y={f.y + 110} s={st.air} text="AIR" size={44} rot={-8} fill="#FFFFFF" />
        <Txt x={g.x + 150} y={g.y - 240} s={st.aaah} text="AAAH" size={58} rot={8} fill="#FFFFFF" />
        <Txt x={CX} y={-470} s={st.splat} text="SPLAT" size={96} rot={-5} fill={RED} />
        <Txt x={CX + 120} y={-300} s={st.ouch} text="OUCH" size={40} rot={8} fill={GOLD} />
        <Txt x={CX - 110} y={headY - 120} s={st.boop} text="BOOP" size={30} rot={-8} fill="#FFFFFF" />
        <Txt x={CX + 150} y={-200} s={st.poof3} text="POOF" size={52} rot={8} fill="#FFFFFF" />
        <Txt x={CX - 140} y={-240} s={st.boing3} text="BOING" size={54} rot={-6} fill={GOLD} />
      </Layer>}
      {thumb ? null : <>
        <Streaks t={t} s={win(t, SNAP + 0.04, 7.2) * (1 - seg(t, 7.0, 7.2))} dir={-1} />
        <Streaks t={t} s={win(t, S_F, IMPACT)} dir={1} />
        <Counter t={t} g={g} />
        <FleaXRay t={t} s={popIn(t, X_IN, 0.35) * (1 - seg(t, X_OUT - 0.12, X_OUT))} uid={uid} />
        <CommentBubble t={t} text="what if you could jump like a flea??" handle="@hop_doodle" likes="3.1K" y={290} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so2 - 0.05} until={DURATION - LOOP_DUR - 0.4} text="What would you jump over first?" />
      </>}
    </AbsoluteFill>
  );
};
const cam0Of = (cam: {x: number; y: number; z: number}) => ({y: cam.y, k: 1000 / (1000 - cam.z)});

export const JumpVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const cues: Cue[] = [
    // frame 0: mid-hop over the car
    {f: 'twang.mp3', at: 0, db: -15, to: 0.55}, {f: 'whoosh.wav', at: 0, db: -19}, {f: 'pop.wav', at: 0.04, db: -24},
    {f: 'thud.wav', at: LAND1, db: -18}, {f: 'twang.mp3', at: LAND1 + 0.01, db: -17, to: 0.5},
    {f: 'whoosh.wav', at: HOP2 - 0.05, db: -23},
    {f: 'thud.wav', at: LAND2, db: -18}, {f: 'twang.mp3', at: LAND2 + 0.01, db: -18, to: 0.5},
    // cat legs
    {f: 'pop.wav', at: POOF1, db: -15}, {f: 'pfft.wav', at: POOF1 + 0.02, db: -21},
    {f: 'squeak.wav', at: WIG + 0.3, db: -30}, {f: 'squeak.wav', at: WIG + 0.52, db: -31},
    {f: 'whoosh.wav', at: LEAP - 0.06, db: -20}, ...ticks(LEAP + 0.05, RLAND - 0.04, 6),
    {f: 'thud.wav', at: RLAND, db: -24}, {f: 'meow.wav', at: MEOW, db: -17},
    // flea legs
    {f: 'pop.wav', at: POOF2, db: -15}, {f: 'pfft.wav', at: POOF2 + 0.02, db: -21},
    {f: 'pop.wav', at: FHOP, db: -24}, {f: 'pop.wav', at: FHOP + 0.36, db: -28},
    {f: 'strain.mp3', at: LOAD + 0.08, db: -24, to: 0.55},
    {f: 'clack.wav', at: SNAP, db: -12}, {f: 'crack.wav', at: SNAP - 0.3, db: -17}, {f: 'whoosh.wav', at: SNAP - 0.04, db: -15},
    {f: 'whisper_whoosh.wav', at: SNAP + 0.05, db: -22},
    ...ticks(SNAP + 0.06, T.tower - 0.02, 14, -32), {f: 'ding.mp3', at: T.tower, db: -17},
    // X-ray
    {f: 'zap.wav', at: X_IN, db: -25}, {f: 'pop.wav', at: X_IN + 0.06, db: -24}, {f: 'pop.wav', at: T.legs, db: -24},
    {f: 'stretch.wav', at: T.legs + 0.02, db: -27, to: 1.0}, {f: 'pop.wav', at: T.fire, db: -24},
    {f: 'twang.mp3', at: T.catapult, db: -14, to: 0.55}, {f: 'whoosh.wav', at: T.catapult + 0.02, db: -20}, {f: 'pop.wav', at: T.catapult + 0.04, db: -22},
    // the fall
    {f: 'whoosh.wav', at: S_E - 0.02, db: -28}, {f: 'gulp.wav', at: GULP - 0.05, db: -15},
    {f: 'whoosh.wav', at: DROP - 0.02, db: -17}, {f: 'shimmer.wav', at: 11.3, db: -27}, {f: 'pop.wav', at: T.light + 0.02, db: -26}, {f: 'pop.wav', at: T.air, db: -26},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: S_F - 0.03, db: -20}, {f: 'whistle.wav', at: 12.95, db: -16},
    ...ticks(S_F + 0.1, IMPACT - 0.05, 18, -33),
    // SPLAT
    {f: 'thud.wav', at: IMPACT, db: -4}, {f: 'crack.wav', at: IMPACT - 0.3, db: -9}, {f: 'bonk.wav', at: IMPACT, db: -12}, {f: 'squelch.wav', at: IMPACT + 0.01, db: -16},
    {f: 'crowd_laugh.wav', at: IMPACT + 0.22, db: -25, to: 1.4}, {f: 'giggle.mp3', at: 15.05, db: -31, to: 0.6},
    {f: 'whoosh.wav', at: S_G2 - 0.02, db: -30}, {f: 'pop.wav', at: NOSE, db: -20}, {f: 'squeak.wav', at: NOSE + 0.02, db: -30},
    {f: 'pop.wav', at: POOF3, db: -15}, {f: 'pfft.wav', at: POOF3 + 0.02, db: -21},
    {f: 'twang.mp3', at: HOP3, db: -15, to: 0.55}, {f: 'whoosh.wav', at: HOP3 + 0.02, db: -21},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -25},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<JumpScene t={0} />}>
        <JumpScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="jump/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const JumpWide: React.FC = () => <WideFit.Provider value={0.72}><JumpVideo /></WideFit.Provider>;
