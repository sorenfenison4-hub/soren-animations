// "What if you could clone yourself like a starfish?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// (1) frame 0: he is tearing himself in half like a sheet of notebook paper (RIIIP) - both hands pull the two halves of his
//     head apart, the crack runs down his body - beside the smug six-armed starfish on its rock; POP 2.74 s: the halves spring
//     apart, each on its one leg; close-up 2.86 s: HALF (one eye, half a mouth each);
// (2) the starfish does it with ease: its two sides pull apart, POP, one half waves BYE and hops off;
// (3) X-RAY: STARFISH - its stomach reaches into every arm; the torn side heals and three new arms grow, DAYS 0 -> 30, CLONE;
// (4) his month as two halves: DAY 1..30, ONE EYE (blink), ONE ARM (wave), ONE LEG (hop hop BONK, dizzy, laugh); DAY 30 the
//     missing sides sketch in and POP - two of him; high five (CLAP);
// (5) "And now his clone wants a clone": the clone grins, grabs its head and starts to tear = frame 0.
// All drawn in code. The guy = the code-drawn front view (lizard / polar bear) split into two halves along a torn zigzag:
// each half has its own leg, arm, eye and half a mouth; the crack opens by shearing the points above the crack tip.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, spring, rnd, backOut,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Sea} from './lib/kit';

// voice: tight.mp3 at 0.1 s (line 1 at 1.22, the rest at 1.12 with pauses cut; times are video time). Last word ends 14.48 s.
export const DURATION = 15.3;
export const T = {
  clone: 0.10, starfish: 0.99, rip: 2.23, half: 2.89,                                   // "Clone yourself like a starfish, and you'd have to rip yourself in half."
  some: 3.45, really: 4.31, pull: 4.74, apart: 5.31,                                    // "Some starfish really pull themselves apart."
  each: 5.98, grows: 6.44, back: 6.73, missing: 7.08, arms: 7.44, about: 7.91, month: 8.30,   // "Each half grows back its missing arms in about a month."
  youd: 8.73, month2: 9.48, one1: 9.88, eye: 10.09, one2: 10.59, arm: 10.73, one3: 11.38, leg: 11.52,   // "You'd spend that month with one eye, one arm and one leg."
  and: 12.45, his: 13.09, clone2: 13.37, wants: 13.73, clone3: 14.23,                   // "And now his clone wants a clone."
  cta: 8.85,
};
// beats (shot changes are hard cuts)
const POP = 2.74, S2 = 2.86, S3 = 3.40;                          // the halves spring apart; close-up; the starfish
const SPULL = 4.74, SAPART = 5.31, SBYE = 5.46;                  // the starfish pulls itself apart; its right half hops off
const S4 = 5.72, HEAL = 6.44, CNT0 = 6.5, CNT1 = 8.28, WHOLE_S = 8.30;   // X-RAY: STARFISH
const S5 = 8.62, S5B = 10.55;                                    // his month as two halves
const BLINK = 10.12, WAVE0 = 10.72, HOP0 = 11.46, BONK = 11.8, DAY30 = 12.02, SKETCH = 12.05, WHOLE = 12.27, FIVE = 12.62;
const S6 = 12.95, GRIN = 13.37, GRIP = 13.73, TEAR2 = 14.23;     // his clone wants a clone
const PUSH = DURATION - LOOP_DUR;

const GOLD = '#FFD43B', RED = '#E2453C', HEADC = '#F6F4F0';
const STAR = '#F58A4B', STAR_DK = '#D9662F', STAR_NEW = '#FBB98E', BUMP = '#FFE2C0';
const SAND = '#F4E2BA', SAND2 = '#E8D09C', SEA = '#86CDE0', ROCK = '#BDB2A2', ROCK_DK = '#9C907F', BARN = '#EEE8DC', WEED = '#8CC37A';
const XBODY = '#88A8D8', GLAND = '#F2D96B', STOM = '#F49AB1';
const GX = -60;                         // where he stands (his centre line)
const SX = 105, SS = 0.75, SY = -138;   // the starfish on its rock: centre of its disc, scale
const LX5 = -185, RX5 = -75;            // his two halves during the month (x of each torn edge)
const LXA = -205, RXA = -55, MEET = -130;   // after the BONK they bounce back here; whole again: him at LXA, his clone at RXA
const FONT_W = 900;

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const rad = (d: number) => (d * Math.PI) / 180;
const rot2 = (p: P2, a: number): P2 => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const poly = (pts: P2[], close = true) => (pts.length ? 'M ' + pts.map(P).join(' L ') + (close ? ' Z' : '') : '');
const quad = (a: P2, c: P2, b: P2, u: number): P2 => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
const bez3 = (a: P2, b: P2, c: P2, d: P2, u: number): P2 => { const v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]; };
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={FONT_W} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${(ex - w).toFixed(1)} ${y.toFixed(1)} A ${rx} ${ry} 0 ${h > 0.5 ? 1 : 0} 1 ${(ex + w).toFixed(1)} ${y.toFixed(1)} Z`;
};
/** two-segment IK, the joint on the outer side (sd = -1 screen left, +1 screen right) */
const ikOut = (A: P2, F: P2, L1: number, L2: number, sd: number): P2 => {
  const dx = F[0] - A[0], dy = F[1] - A[1], D = Math.hypot(dx, dy) || 1;
  const d = Math.min(D, L1 + L2 - 0.01);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / D, uy = dy / D;
  const j1: P2 = [A[0] + ux * a - uy * h, A[1] + uy * a + ux * h], j2: P2 = [A[0] + ux * a + uy * h, A[1] + uy * a - ux * h];
  return sd * j1[0] >= sd * j2[0] ? j1 : j2;
};
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 450}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: FONT_W, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;

// ---------- the guy, as two halves along a torn zigzag (local frame: his centre line at x 0, feet at y 0) ----------
const HR = 65, HC = -235, TOP = HC - HR, CHIN = HC + HR;      // head outline radius, centre, top (-300), chin (-170)
const T_TOP = TOP + 117, T_BOT = TOP + 247;                   // torso -183 .. -53 (both on zero crossings of the zigzag)
const TW = 47, SHX = 38, SHY = -160, HIPX = 19, HIPY = -66;
const ZA = 8, ZS = 13;                                        // zigzag amplitude, half period (zero crossings every ZS from TOP)
const zx = (y: number) => {
  const u = (y - TOP) / ZS, k = Math.floor(u), f = u - k;
  const a = ZA * (0.7 + 0.6 * rnd(k + 11)) * (((k % 2) + 2) % 2 === 0 ? 1 : -1);
  return a * (f < 0.5 ? f * 2 : (1 - f) * 2);
};
/** zigzag points from y0 down to y1 (corners and zero crossings in between) */
const zzPts = (y0: number, y1: number): P2[] => {
  if (y1 <= y0 + 0.01) return [];
  const out: P2[] = [[zx(y0), y0]];
  const s = Math.floor(((y0 - TOP) / ZS) * 2) + 1, e = Math.ceil(((y1 - TOP) / ZS) * 2) - 1;
  for (let i = s; i <= e; i++) { const y = TOP + (i / 2) * ZS; if (y > y0 + 0.01 && y < y1 - 0.01) out.push([zx(y), y]); }
  out.push([zx(y1), y1]);
  return out;
};
const TORSO_R: P2[] = (() => {   // right side: top centre -> shoulder -> side -> bottom corner -> bottom centre
  const top = T_TOP, bot = T_BOT, h = bot - top, r1 = Math.min(34, h * 0.3), r2 = Math.min(29, h * 0.26), sw = TW * 0.6;
  const pts: P2[] = [[0, top], [sw, top]];
  for (let i = 1; i <= 8; i++) pts.push(bez3([sw, top], [TW - 5, top + r1 * 0.18], [TW, top + r1 * 0.5], [TW, top + r1], i / 8));
  pts.push([TW - 1, bot - r2]);
  for (let i = 1; i <= 5; i++) pts.push(quad([TW - 1, bot - r2], [TW - 1, bot], [TW - r2, bot], i / 5));
  pts.push([0, bot]);
  return pts;
})();
const ARC_R: P2[] = Array.from({length: 33}, (_, i) => { const a = -Math.PI / 2 + (i / 32) * Math.PI; return [HR * Math.cos(a), HC + HR * Math.sin(a)] as P2; });

type Mood = 'strain' | 'pop' | 'worry' | 'dizzy' | 'happy' | 'joy' | 'smug' | 'grin' | 'deadpan' | 'oof';
/** one figure: two halves that share a transform ('joined' / 'whole'), or a lone half */
type HS = {
  x: number; y: number; lean: number; piv: number;   // world position of the centre line at the feet, hop (y), lean (deg) about (piv, 0)
  tip: number; g: number;                            // crack tip (y; <= TOP = no crack) and how far the top of the head opens (per side)
  mood: Mood; look: number; blink: number; trem: number;
  hands: [P2, P2]; grip: number;                     // hand targets [left, right] (local, before the shear); grip 1 = hands on the head top
  feet: [P2, P2];
  torn: boolean;                                     // ink the torn edge (false = a whole guy)
};
const SPIRAL = 'M 0 0 m -2 0 a 3 3 0 1 1 4 2 a 7 7 0 1 1 -9 -6 a 11 11 0 1 1 15 10 a 15 15 0 1 1 -21 -14';
const Mouth: React.FC<{mood: Mood; t: number}> = ({mood, t}) => {
  if (mood === 'joy' || mood === 'grin') return <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  if (mood === 'happy') return <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  if (mood === 'smug') return <path d="M -20 6 Q 0 16 22 -3" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'deadpan') return <path d="M -16 8 L 16 8" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'strain' || mood === 'oof') return <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  if (mood === 'worry' || mood === 'dizzy') return <path d={`M -18 10 q 6 ${mood === 'dizzy' ? -6 + 3 * Math.sin(t * 14) : -6} 12 0 t 12 0 t 12 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  return <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;   // pop
};
/** one eye + brow of side sd, head-centred coordinates */
const EyeBrow: React.FC<{sd: number; mood: Mood; look: number; blink: number; t: number}> = ({sd, mood, look, blink, t}) => {
  const ex = sd * 25, ey = -14;
  let eye: React.ReactNode;
  if (blink > 0.5 || mood === 'happy' || mood === 'joy') eye = <path d={blink > 0.5 && mood !== 'happy' && mood !== 'joy' ? `M ${ex - 12} ${ey + 2} Q ${ex} ${ey + 8} ${ex + 12} ${ey + 2}` : `M ${ex - 13} ${ey + 4} Q ${ex} ${ey - 12} ${ex + 13} ${ey + 4}`}
    stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'strain' || mood === 'oof') eye = <path d={`M ${ex - sd * 12} ${ey - 10} L ${ex + sd * 10} ${ey} L ${ex - sd * 12} ${ey + 10}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  else if (mood === 'dizzy') eye = <g><circle cx={ex} cy={ey} r={14} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
    <path d={SPIRAL} transform={`translate(${ex} ${ey}) rotate(${(t * 520 * sd).toFixed(1)}) scale(0.62)`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" /></g>;
  else {
    const big = mood === 'pop' ? 1.28 : 1, lid = mood === 'smug' || mood === 'grin' ? 0.45 : mood === 'deadpan' ? 0.52 : 0, rx = 12 * big, ry = 15 * big;
    eye = <g>
      <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + look * 4} cy={ey + 1 + lid * 6} r={6.3 * (mood === 'pop' ? 0.82 : 1)} fill={INK} />
      <circle cx={ex + look * 4 - 1.5} cy={ey - 1 + lid * 6} r={2} fill="#fff" />
      {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={HEADC} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
    </g>;
  }
  let d = `M ${sd * 12} -45 Q ${sd * 25} -53 ${sd * 38} -47`;
  if (mood === 'strain' || mood === 'oof') d = `M ${sd * 10} -34 L ${sd * 37} -44`;
  else if (mood === 'worry' || mood === 'dizzy') d = `M ${sd * 10} -46 L ${sd * 36} -38`;
  else if (mood === 'smug' || mood === 'grin') d = `M ${sd * 12} ${sd < 0 ? -40 : -46} L ${sd * 38} ${sd < 0 ? -44 : -50}`;
  else if (mood === 'pop') d = `M ${sd * 12} -54 Q ${sd * 25} -64 ${sd * 38} -56`;
  else if (mood === 'deadpan') d = `M ${sd * 12} -38 L ${sd * 38} -38`;
  return <g>{eye}<path d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /></g>;
};
const LimbP: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; hand?: boolean; ghost?: boolean}> = ({S, H, L, sd, w = 29, hand = true, ghost}) => {
  const E = ikOut(S, H, L, L, sd);
  const C: P2 = [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2];
  const d = `M ${P(S)} Q ${P(C)} ${P(H)}`;
  if (ghost) return <g><path d={d} stroke={INK} strokeWidth={4} strokeDasharray="9 8" fill="none" strokeLinecap="round" />
    {hand ? <circle cx={H[0]} cy={H[1]} r={13} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="7 6" /> : null}</g>;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#FFFFFF" strokeWidth={w - 11} fill="none" strokeLinecap="round" />
      {hand ? <circle cx={H[0]} cy={H[1]} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} /> : null}
    </g>
  );
};
const crackD = (h: HS) => (y: number) => (h.tip <= TOP + 0.5 || y >= h.tip) ? 0 : h.g * Math.pow(clamp((h.tip - y) / (h.tip - TOP)), 1.25);
/** where the grip point (top of head half sd) is, local */
const gripPt = (h: HS, sd: number): P2 => { const D = crackD(h); return [sd * 40 + sd * D(TOP + 14), TOP + 14]; };
/** one half (sd) in the figure's local frame. ghost = draw it as a dashed pencil sketch (the side that is growing back) */
const Half: React.FC<{sd: number; h: HS; t: number; uid: string; ghost?: boolean; mouthWhole?: boolean; noMouth?: boolean}> = ({sd, h, t, uid, ghost, mouthWhole, noMouth}) => {
  const D = crackD(h);
  const dsp = (p: P2): P2 => [p[0] + sd * D(p[1]), p[1]];
  const side = (pts: P2[]) => pts.map(([x, y]) => [sd * x, y] as P2);
  const torsoOut = side(TORSO_R).map(dsp), headOut = side(ARC_R).map(dsp);
  const torsoEdge = zzPts(T_TOP, T_BOT).map(dsp), headEdge = zzPts(TOP, CHIN).map(dsp);
  const torsoPoly = [...torsoOut, ...torsoEdge.slice().reverse()], headPoly = [...headOut, ...headEdge.slice().reverse()];
  const tornT = h.torn ? zzPts(T_TOP, Math.min(h.tip, T_BOT)).map(dsp) : [], tornH = h.torn ? zzPts(TOP, Math.min(h.tip, CHIN)).map(dsp) : [];
  const seamT = zzPts(h.torn ? Math.max(h.tip, T_TOP) : T_TOP, T_BOT), seamH = zzPts(h.torn ? Math.max(h.tip, TOP) : TOP, CHIN);
  const hip = dsp([sd * HIPX, HIPY]), foot = h.feet[sd < 0 ? 0 : 1], sh = dsp([sd * SHX, SHY]);
  const hand = lp2(h.hands[sd < 0 ? 0 : 1], gripPt(h, sd), h.grip);
  if (ghost) {
    const dash = {stroke: INK, strokeWidth: 4.5, strokeDasharray: '10 8', fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
    return <g opacity={0.85}>
      <LimbP S={hip} H={foot} L={37} sd={sd} w={30} hand={false} ghost />
      <ellipse cx={foot[0] + sd * 2} cy={foot[1] + 5} rx={23} ry={9.5} {...dash} />
      <path d={poly(torsoOut, false)} {...dash} />
      <path d={poly(headOut, false)} {...dash} />
      <ellipse cx={sd * 25} cy={HC - 14} rx={12} ry={15} {...dash} strokeDasharray="6 6" />
      <LimbP S={sh} H={hand} L={77} sd={sd} ghost />
    </g>;
  }
  const eyeOff = sd * D(HC - 14), mouthOff = sd * D(HC + 28);
  const splitMouth = h.torn && h.tip > HC + 12;
  return (
    <g>
      <LimbP S={hip} H={foot} L={37} sd={sd} w={30} hand={false} />
      <ellipse cx={foot[0] + sd * 2} cy={foot[1] + 5} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />
      <path d={poly(torsoPoly)} fill="#FFFFFF" />
      {seamT.length ? <path d={poly(seamT, false)} stroke="#FFFFFF" strokeWidth={3} fill="none" /> : null}
      <path d={poly(torsoOut, false)} stroke={INK} strokeWidth={6.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {tornT.length > 1 ? <path d={poly(tornT, false)} stroke={INK} strokeWidth={5.5} fill="none" strokeLinejoin="round" strokeLinecap="round" /> : null}
      <path d={poly(headPoly)} fill={HEADC} />
      {seamH.length ? <path d={poly(seamH, false)} stroke={HEADC} strokeWidth={3} fill="none" /> : null}
      {sd < 0 ? <path d={`M ${P(dsp([-44, HC - 30]))} Q ${P(dsp([-40, HC - 50]))} ${P(dsp([-24, HC - 54]))}`} stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.9} /> : null}
      <path d={poly(headOut, false)} stroke={INK} strokeWidth={6.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {tornH.length > 1 ? <path d={poly(tornH, false)} stroke={INK} strokeWidth={5.5} fill="none" strokeLinejoin="round" strokeLinecap="round" /> : null}
      <g transform={`translate(${eyeOff.toFixed(2)} ${HC})`}><EyeBrow sd={sd} mood={h.mood} look={h.look} blink={h.blink} t={t} /></g>
      {noMouth ? null : <g transform={`translate(${mouthOff.toFixed(2)} ${HC + 28})`}>
        {splitMouth || !mouthWhole ? <g clipPath={`url(#hm${sd < 0 ? 'L' : 'R'}${uid})`}><Mouth mood={h.mood} t={t} /></g> : <Mouth mood={h.mood} t={t} />}
      </g>}
      <LimbP S={sh} H={hand} L={77} sd={sd} />
    </g>
  );
};
/** the figure in the world: mode 'pair' = both halves together (joined while tearing, or a whole guy), 'half' = one side alone */
const Figure: React.FC<{h: HS; t: number; uid: string; mode: 'pair' | 'half'; sd?: number; ghost?: number}> = ({h, t, uid, mode, sd = 1, ghost = 0}) => {
  const jig = h.trem * 2.4 * Math.sin(t * 71);
  const tf = `translate(${(h.x + jig).toFixed(1)} ${h.y.toFixed(1)}) rotate(${h.lean.toFixed(2)} ${h.piv} 0)`;
  if (mode === 'pair') {
    const whole = !h.torn || h.tip <= HC + 12;   // mouth not split yet: draw it once, unclipped
    return <W><g transform={tf}>
      <Half sd={-1} h={h} t={t} uid={uid} noMouth={whole} />
      <Half sd={1} h={h} t={t} uid={uid} mouthWhole={whole} />
    </g></W>;
  }
  return <W><g transform={tf}>
    {ghost > 0.01 && ghost < 1 ? <g opacity={clamp(ghost * 3)}><Half sd={-sd} h={h} t={t} uid={uid} ghost /></g> : null}
    <Half sd={sd} h={h} t={t} uid={uid} />
  </g></W>;
};
const headTop = (h: HS): P2 => [h.x, h.y + TOP];

// ---------- the starfish: six arms (fissiparous sea stars have 6-10), stands on the two lower arms ----------
const SN = 6, SRV = 30, SL = 80, SK = 1.3;
const ARM_A = [0, 60, 120, 180, 240, 300];        // screen degrees (y down): 60 / 120 = its legs; 0 1 5 = right side, 2 3 4 = left
const FOOT_L: P2 = [SL * Math.cos(rad(120)), SL * Math.sin(rad(120))], FOOT_R: P2 = [SL * Math.cos(rad(60)), SL * Math.sin(rad(60))];
const starPath = (lens: number[], ang: number[] = ARM_A, k = 1) => {
  const pts: string[] = [];
  for (let i = 0; i < 180; i++) {
    const phi = (i / 180) * 360;
    let r = SRV;
    for (let j = 0; j < SN; j++) {
      const d = ((phi - ang[j] + 540) % 360) - 180;
      if (Math.abs(d) < 30) r += (lens[j] - SRV) * Math.pow(Math.cos(rad(d * 3)), SK);
    }
    pts.push(`${(k * r * Math.cos(rad(phi))).toFixed(1)} ${(k * r * Math.sin(rad(phi))).toFixed(1)}`);
  }
  return 'M ' + pts.join(' L ') + ' Z';
};
const FULL = [SL, SL, SL, SL, SL, SL];
/** the star's torn edge: a short zigzag through the disc, valley to valley */
const STAR_ZZ: P2[] = Array.from({length: 9}, (_, i) => [i === 0 || i === 8 ? 0 : (i % 2 ? 4.5 : -4.5) * (0.7 + 0.6 * rnd(i + 40)), -36 + i * 9] as P2);
const starClip = (sd: number) => poly([[0, -220], ...STAR_ZZ, [0, 220], [sd * 220, 220], [sd * 220, -220]]);
type SMood = 'smug' | 'look' | 'laugh' | 'proud' | 'wink';
const StarFace: React.FC<{mood: SMood; eyes: [boolean, boolean]; t: number}> = ({mood, eyes}) => {
  const eye = (sd: number) => {
    const ex = sd * 11, ey = -8;
    if (mood === 'laugh' || mood === 'proud') return <path key={sd} d={`M ${ex - 7} ${ey + 2} Q ${ex} ${ey - 7} ${ex + 7} ${ey + 2}`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
    const lid = mood === 'smug' ? 0.48 : mood === 'wink' && sd > 0 ? 0.5 : 0;
    return <g key={sd}>
      <ellipse cx={ex} cy={ey} rx={7} ry={8.5} fill="#fff" stroke={INK} strokeWidth={3.2} />
      <circle cx={ex + (mood === 'look' ? -2.5 : 0)} cy={ey + 1 + lid * 4} r={3.6} fill={INK} />
      {lid ? <path d={lidPath(ex, ey, 7.4, 8.9, lid)} fill={STAR} stroke={INK} strokeWidth={3} strokeLinejoin="round" /> : null}
      <path d={mood === 'smug' ? `M ${ex - 7} ${ey - 13 + (sd < 0 ? 2 : -1)} L ${ex + 7} ${ey - 15 + (sd < 0 ? 2 : -1)}` : `M ${ex - 7} ${ey - 14} Q ${ex} ${ey - 19} ${ex + 7} ${ey - 14}`} stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" />
    </g>;
  };
  return <g>
    {eyes[0] ? eye(-1) : null}{eyes[1] ? eye(1) : null}
    {mood === 'laugh' ? <path d="M -10 6 Q 0 20 10 6 Z" fill="#5A2328" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      : <path d="M -9 9 Q 0 15 10 6" stroke={INK} strokeWidth={3.4} fill="none" strokeLinecap="round" />}
  </g>;
};
const Bumps: React.FC<{lens: number[]; ang?: number[]}> = ({lens, ang = ARM_A}) => <g>{lens.map((L, j) => L < SRV + 8 ? null : [0.48, 0.66, 0.82].map((f, i) => {
  const d = SRV + (L - SRV) * f - 4, a = rad(ang[j]);
  return <circle key={j + '_' + i} cx={d * Math.cos(a)} cy={d * Math.sin(a)} r={[5.2, 4.2, 3.2][i] * Math.min(1, (L - SRV) / (SL - SRV) + 0.3)} fill={BUMP} />;
}))}</g>;
/** a whole or regrowing star (no torn edge): lens per arm; arms on the missing side `newSide` drawn paler */
const StarBody: React.FC<{lens: number[]; ang?: number[]; mood: SMood; eyes: [boolean, boolean]; t: number; newSide?: number; uid: string}> = ({lens, ang = ARM_A, mood, eyes, t, newSide = 0, uid}) => {
  const d = starPath(lens, ang);
  return <g>
    <path d={d} fill={STAR} />
    {newSide ? <g clipPath={`url(#sc${newSide < 0 ? 'L' : 'R'}${uid})`}><path d={d} fill={STAR_NEW} /><circle r={SRV + 2} fill={STAR} /></g> : null}
    <path d={`M -14 ${-SRV + 4} Q 4 ${-SRV - 2} 18 ${-SRV + 8}`} stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
    <Bumps lens={lens} ang={ang} />
    <path d={d} fill="none" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    <StarFace mood={mood} eyes={eyes} t={t} />
  </g>;
};
/** one torn half of the full star (side sd), with its jagged edge */
const StarHalf: React.FC<{sd: number; mood: SMood; t: number; uid: string; ang?: number[]}> = ({sd, mood, t, uid, ang = ARM_A}) => {
  const d = starPath(FULL, ang);
  return <g>
    <g clipPath={`url(#sc${sd < 0 ? 'L' : 'R'}${uid})`}>
      <path d={d} fill={STAR} />
      <Bumps lens={FULL} ang={ang} />
      <path d={d} fill="none" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
      <StarFace mood={mood} eyes={[sd < 0, sd > 0]} t={t} />
    </g>
    <path d={poly(STAR_ZZ, false)} stroke={INK} strokeWidth={4.5} fill="none" strokeLinejoin="round" strokeLinecap="round" />
  </g>;
};
type SS = {mode: 'whole' | 'split' | 'apart'; th: number; sepR: number; hopL: number; Rx: number; Ry: number; Rrot: number; Lrot: number;
  mood: SMood; moodL: SMood; moodR: SMood; wave: number; grow: number; shake: number; rLeft: boolean};
const Starfish: React.FC<{t: number; s: SS; uid: string}> = ({t, s, uid}) => {
  const jig = s.shake * 2.5 * Math.sin(t * 60);
  const ang = ARM_A.map((a, j) => (j === 5 ? a - s.wave : a));
  const base = `translate(${(SX + jig).toFixed(1)} ${SY}) scale(${SS})`;
  if (s.mode === 'whole') {
    const g = s.grow;
    const lens = g < 1 ? FULL.map((L, j) => (j === 0 || j === 1 || j === 5 ? lerp(SRV * 0.95, SL, g) : L)) : FULL;
    return <W><g transform={base}><StarBody lens={lens} ang={ang} mood={s.mood} eyes={[true, g >= 0.92]} t={t} newSide={g < 1.5 ? 1 : 0} uid={uid} /></g></W>;
  }
  const L = <g transform={`translate(0 ${-s.hopL}) rotate(${(-s.th + s.Lrot).toFixed(2)} ${P(FOOT_L)})`}><StarHalf sd={-1} mood={s.moodL} t={t} uid={uid} /></g>;
  const R = s.rLeft ? null : <g transform={`translate(${(s.sepR + s.Rx).toFixed(1)} ${s.Ry.toFixed(1)}) rotate(${(s.th + s.Rrot).toFixed(2)} ${P(FOOT_R)})`}><StarHalf sd={1} mood={s.moodR} t={t} uid={uid} ang={ang} /></g>;
  return <W><g transform={base}>{L}{R}</g></W>;
};

// ---------- the beach ----------
const waveD = (x0: number, x1: number, y: number, t: number, amp: number, len: number, phase: number) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 30) pts.push(`${x} ${(y + amp * Math.sin((x / len) * 2 * Math.PI + t * 2.1 + phase)).toFixed(1)}`);
  return 'M ' + pts.join(' L ');
};
const Rock: React.FC = () => (
  <g>
    <path d={`M ${SX - 112} 4 C ${SX - 118} -36 ${SX - 98} -80 ${SX - 52} -86 C ${SX - 14} -91 ${SX + 36} -91 ${SX + 70} -84 C ${SX + 106} -76 ${SX + 116} -34 ${SX + 112} 4 Z`} fill={ROCK} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
    <path d={`M ${SX + 76} -76 C ${SX + 98} -54 ${SX + 104} -24 ${SX + 100} 2 L ${SX + 70} 2 C ${SX + 78} -24 ${SX + 76} -50 ${SX + 60} -72 Z`} fill={ROCK_DK} />
    {[[-80, -40, 7], [-62, -22, 5], [-40, -52, 6], [30, -30, 7], [52, -50, 5], [-10, -18, 5]].map(([x, y, r], i) => <circle key={i} cx={SX + x} cy={y} r={r} fill={BARN} stroke={INK} strokeWidth={3} />)}
    <path d={`M ${SX - 98} 2 Q ${SX - 104} -16 ${SX - 92} -30 M ${SX - 88} 2 Q ${SX - 82} -18 ${SX - 90} -36`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
    <path d={`M ${SX - 98} 2 Q ${SX - 104} -16 ${SX - 92} -30 M ${SX - 88} 2 Q ${SX - 82} -18 ${SX - 90} -36`} stroke={WEED} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);
const Shell: React.FC<{x: number; y: number; s: number; rot?: number}> = ({x, y, s, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 10 L -22 -6 Q -18 -26 0 -28 Q 18 -26 22 -6 Z" fill="#F8C9C0" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M 0 10 L -12 -24 M 0 10 L 0 -28 M 0 10 L 12 -24" stroke={INK} strokeWidth={3} />
  </g>
);

// ---------- screen-space panels ----------
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
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
/** X-RAY: STARFISH (seen from above): a stomach in the middle and a pair of digestive glands in every arm; the kept half's torn
 *  side heals and three new arms grow (their glands grow with them) while DAYS counts 0 -> 30 */
const XK = 2.85;
const glandPts = (L: number, a: number) => {
  const out: [number, number, number][] = [];
  for (let d = SRV * 0.85, i = 0; d < L - 12; d += 5, i++) {
    const r = Math.max(2.2, 5.6 - i * 0.2) * (0.8 + 0.25 * Math.abs(Math.sin(i * 0.9))), ca = Math.cos(rad(a)), sa = Math.sin(rad(a));
    [-1, 1].forEach((sd) => { const o = sd * (5.8 + 1.4 * Math.sin(i * 0.7)); out.push([XK * (d * ca - o * sa), XK * (d * sa + o * ca), XK * r]); });
  }
  return out;
};
/** the digestive glands of every arm as lobed tubes with one merged outline */
const Glands: React.FC<{lens: number[]; arms: number[]; glow?: number}> = ({lens, arms, glow = 0}) => {
  const pts = arms.flatMap((j) => glandPts(lens[j], ARM_A[j]));
  return <g>
    {glow > 0.01 ? pts.map(([x, y, r], i) => <circle key={'g' + i} cx={x} cy={y} r={r + 16} fill={GOLD} opacity={glow * 0.5} />) : null}
    {pts.map(([x, y, r], i) => <circle key={'i' + i} cx={x} cy={y} r={r + 4.5} fill={INK} />)}
    {pts.map(([x, y, r], i) => <circle key={'f' + i} cx={x} cy={y} r={r} fill={GLAND} />)}
  </g>;
};
const StarXRay: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const healed = t >= HEAL, g = eio(seg(t, HEAL + 0.05, WHOLE_S - 0.04));
  const lens = FULL.map((L, j) => (j === 0 || j === 1 || j === 5 ? (healed ? lerp(SRV * 0.92, SL, g) : L) : L));
  const glow = t > T.each - 0.05 && t < HEAL ? 0.55 + 0.45 * Math.sin((t - T.each) * 14) : 0;
  const cnt = seg(t, CNT0, CNT1) * 30, done = t >= WHOLE_S;
  const body = (lensX: number[]) => <path d={starPath(lensX, ARM_A, XK)} fill={XBODY} opacity={0.5} />;
  return (
    <div style={{position: 'absolute', left: 540, top: 1000, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s.toFixed(3)})`}}>
      <XFrame id={`xs${uid}`} R={330}>
        {healed ? <g>
          {body(lens)}
          <path d={starPath(lens, ARM_A, XK)} fill="none" stroke="#DCE9FA" strokeWidth={6} />
          <Glands lens={lens} arms={[0, 1, 2, 3, 4, 5]} />
          <circle r={XK * 19} fill={STOM} stroke={INK} strokeWidth={5} />
          <path d={`M ${-XK * 9} ${-XK * 4} Q 0 ${XK * 6} ${XK * 9} ${-XK * 4}`} stroke="#C9637F" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g> : <g>
          <g clipPath={`url(#scL${uid}x)`}>
            {body(FULL)}
            <path d={starPath(FULL, ARM_A, XK)} fill="none" stroke="#DCE9FA" strokeWidth={6} />
            <Glands lens={FULL} arms={[2, 3, 4]} glow={glow} />
            <circle r={XK * 19} fill={STOM} stroke={INK} strokeWidth={5} />
          </g>
          <path d={poly(STAR_ZZ.map(([x, y]) => [x * XK, y * XK] as P2), false)} stroke="#DCE9FA" strokeWidth={7} fill="none" strokeLinejoin="round" />
        </g>}
      </XFrame>
      <Card text="X-RAY: STARFISH" top={86} size={48} rot={-2} />
      <Card text="STOMACH IN EVERY ARM" top={790} left={450} color={GOLD} rot={3} size={44} s={popIn(t, T.each, 0.28) * (1 - seg(t, HEAL - 0.1, HEAL + 0.02))} />
      <Card text="GROWS BACK" top={300} left={700} color="#fff" rot={5} size={46} s={popIn(t, T.grows, 0.28) * (1 - seg(t, 7.9, 8.02))} />
      <Card text="CLONE" top={210} left={690} color={GOLD} rot={6} size={64} s={popIn(t, WHOLE_S, 0.3)} />
      <div style={{position: 'absolute', left: 760, top: 720, transform: `translate(-50%,-50%) rotate(5deg) scale(${(popIn(t, CNT0 - 0.12, 0.3) * (1 + 0.14 * Math.max(0, 1 - Math.abs(t - WHOLE_S) * 5))).toFixed(3)})`,
        background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 26px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{fontWeight: FONT_W, fontSize: 110, lineHeight: 1, color: done ? RED : INK}}>{fmt(Math.floor(cnt + 0.0001))}</div>
        <div style={{fontWeight: FONT_W, fontSize: 36}}>DAYS</div>
      </div>
    </div>
  );
};
/** DAY counter during his month (screen space, top band under the like / subscribe doodle) */
const DayCard: React.FC<{t: number}> = ({t}) => {
  const s = popIn(t, 8.72, 0.3) * (1 - seg(t, WHOLE - 0.14, WHOLE - 0.02));
  if (s < 0.01 || t < S5) return null;
  const day = t >= DAY30 ? 30 : Math.max(1, Math.min(29, 1 + Math.floor(seg(t, 8.9, 11.95) * 28.999)));
  const bump = 1 + 0.18 * Math.max(0, 1 - Math.abs(t - DAY30) * 5);
  return <div style={{position: 'absolute', left: 540, top: 455, transform: `translate(-50%,-50%) rotate(-3deg) scale(${(s * bump).toFixed(3)})`,
    background: day === 30 ? GOLD : '#FFFDF6', border: `8px solid ${INK}`, borderRadius: 24, boxShadow: `0 8px 0 ${INK}`, padding: '4px 30px', fontFamily: FONT,
    fontWeight: FONT_W, fontSize: 70, color: INK, whiteSpace: 'nowrap'}}>DAY {day}</div>;
};

// ---------- the story over time ----------
const REST: [P2, P2] = [[-62, -96], [62, -96]];
const FEET: [P2, P2] = [[-27, -12], [27, -12]];
const baseH = (): HS => ({x: GX, y: 0, lean: 0, piv: 0, tip: TOP - 10, g: 0, mood: 'smug', look: 0, blink: 0, trem: 0, hands: [REST[0], REST[1]], grip: 0, feet: [FEET[0], FEET[1]], torn: true});
/** the tearing pair at time t (0 .. POP): the crack runs down, the top opens, hands on the head halves */
const tearing = (h: HS, u: number, g0: number, g1: number, tip0: number, tip1: number) => {
  h.tip = lerp(tip0, tip1, u + 0.02 * Math.sin(u * 2 * Math.PI * 4));
  h.g = lerp(g0, g1, u); h.grip = 1; h.mood = 'strain'; h.trem = 0.7;
  h.hands = [[-70, TOP + 30], [70, TOP + 30]];
  h.feet = [[-30, -12], [30, -12]];
};
/** his two halves: returns [left half, right half] (both with mode 'half'), or one pair (whole / tearing) */
type Fig = {h: HS; mode: 'pair' | 'half'; sd: number; ghost: number};
const halfBase = (sd: number, x: number): HS => {
  const h = baseH(); h.x = x; h.tip = 0; h.g = 0; h.piv = sd * 22; h.feet = sd < 0 ? [[-20, -12], FEET[1]] : [FEET[0], [20, -12]];
  h.hands = [[-92, -150], [92, -150]]; h.mood = 'worry'; return h;
};
const guysAt = (t: number): Fig[] => {
  if (t < POP) {   // frame 0: tearing himself in half
    const h = baseH(); tearing(h, seg(t, 0, POP), 36, 56, -185, -40);
    return [{h, mode: 'pair', sd: 0, ghost: 0}];
  }
  if (t < S5) {    // the halves spring apart (POP), wobble on one leg; then watch the starfish
    const out: Fig[] = [];
    [-1, 1].forEach((sd) => {
      const u = t - POP, k = seg(u, 0, 0.24);
      const sep = (sd < 0 ? (t < S3 ? 46 : 120) : 16) * backOut(k);
      const h = halfBase(sd, GX + sd * sep);
      h.tip = 0; h.g = 56 * (1 - eout(seg(u, 0, 0.2)));
      const hop = Math.sin(Math.PI * seg(u, 0, 0.32));
      h.y = -46 * hop; h.feet[sd < 0 ? 0 : 1] = [sd * 20, -12 - 18 * hop];
      h.lean = spring(t, POP + 0.32, sd * 9, 2.2, 3.5) + sd * 2.5 * Math.sin(t * 2.6 + (sd > 0 ? 1 : 0));
      const fl = Math.sin(t * 9 + (sd > 0 ? 1.4 : 0));
      h.hands = [[-84, -168 + 22 * fl], [84, -168 - 22 * fl]];
      h.mood = u < 0.5 ? 'pop' : t < S3 ? 'worry' : t < SAPART ? 'worry' : t < SAPART + 0.45 ? 'pop' : 'deadpan';
      h.blink = t > 3.12 && t < 3.24 ? 1 : 0;
      h.look = t >= S3 ? 1 : 0; h.trem = 0;
      out.push({h, mode: 'half', sd, ghost: 0});
    });
    return out;
  }
  if (t < WHOLE) {   // his month: ONE EYE, ONE ARM, ONE LEG (hop hop BONK), DAY 30 the missing sides sketch in
    const out: Fig[] = [];
    [-1, 1].forEach((sd) => {
      const x0 = sd < 0 ? LX5 : RX5, xb = MEET + sd * 2, xa = sd < 0 ? LXA : RXA;
      let x = x0, y = 0;
      const h = halfBase(sd, x0);
      // balancing on one leg
      h.lean = sd * 3 * Math.sin(t * 2.4 + (sd > 0 ? 1.1 : 0)); h.mood = 'worry';
      const fl = Math.sin(t * 5 + (sd > 0 ? 1.4 : 0));
      h.hands = [[-84, -160 + 16 * fl], [84, -160 - 16 * fl]];
      if (t > BLINK - 0.25 && t < WAVE0) { h.mood = 'happy'; if (t > BLINK && t < BLINK + 0.14) h.blink = 1; h.mood = t > BLINK + 0.2 ? 'happy' : 'worry'; }
      if (t >= WAVE0 && t < HOP0) { const w = t - WAVE0; h.mood = 'joy'; h.hands[sd < 0 ? 0 : 1] = [sd * (104 + 16 * Math.sin(w * 2 * Math.PI * 2.4)), -246 - 10 * Math.cos(w * 2 * Math.PI * 2.4)]; h.look = -sd; }
      if (t >= HOP0) {
        const u1 = seg(t, HOP0, HOP0 + 0.17), u2 = seg(t, HOP0 + 0.17, BONK);
        const xm = lerp(x0, xb, 0.5);
        x = t < HOP0 + 0.17 ? lerp(x0, xm, eio(u1)) : t < BONK ? lerp(xm, xb, eio(u2)) : lerp(xb, xa, eout(seg(t, BONK, BONK + 0.28)));
        y = t < BONK ? -34 * Math.sin(Math.PI * (t < HOP0 + 0.17 ? u1 : u2)) : -20 * Math.sin(Math.PI * seg(t, BONK, BONK + 0.28));
        h.mood = t < BONK ? 'joy' : t < BONK + 0.16 ? 'oof' : 'dizzy';
        h.look = -sd;
        h.hands = t < BONK ? [[-80, -250], [80, -250]] : [[-86, -150 + 20 * fl], [86, -150 - 20 * fl]];
        if (t >= BONK) h.lean = spring(t, BONK, -sd * 14, 2.4, 3.2) + sd * 3 * Math.sin(t * 7);
        h.feet[sd < 0 ? 0 : 1] = [sd * 20, -12 + y * 0.4];
      }
      h.x = x; h.y = y;
      const ghost = t >= SKETCH ? 0.05 + 0.9 * seg(t, SKETCH, WHOLE - 0.02) : 0;
      out.push({h, mode: 'half', sd, ghost});
    });
    return out;
  }
  // two whole guys: him (left) and his clone (right)
  const him = baseH(), cl = baseH();
  him.x = LXA; cl.x = RXA; him.torn = false; cl.torn = false; him.tip = TOP - 10; cl.tip = TOP - 10;
  [him, cl].forEach((h, i) => {
    const sd = i === 0 ? 1 : -1;   // the hand toward the other one
    h.mood = t < T.and ? 'pop' : 'joy'; h.look = sd;
    h.lean = spring(t, WHOLE, sd * 6, 2.5, 4);
    if (t > T.and - 0.05 && t < S6 + 0.2) {   // high five
      const r = eout(seg(t, T.and - 0.05, FIVE)), back = eio(seg(t, FIVE + 0.2, S6 + 0.2));
      const meet: P2 = [(MEET - h.x), -318];
      const k = r * (1 - back);
      if (sd > 0) h.hands[1] = lp2(REST[1], meet, k); else h.hands[0] = lp2(REST[0], meet, k);
      if (t > FIVE) h.lean += spring(t, FIVE, -sd * 5, 3, 5);
    }
  });
  if (t >= S6) {
    him.mood = t < TEAR2 ? 'happy' : 'pop'; him.look = 1; him.trem = t > TEAR2 + 0.05 ? 0.5 : 0;
    if (t > TEAR2) { him.hands = [[-60, -250], [60, -250]]; }
    cl.look = 0;
    cl.mood = t < GRIN ? 'joy' : t < TEAR2 ? 'grin' : 'strain';
    if (t >= GRIP) {
      const r = eout(seg(t, GRIP, GRIP + 0.3));
      cl.hands = [lp2(REST[0], [-70, TOP + 30], r), lp2(REST[1], [70, TOP + 30], r)];
      cl.grip = r;
      cl.feet = [lp2(FEET[0], [-30, -12], r), lp2(FEET[1], [30, -12], r)];
    }
    if (t >= TEAR2) {
      cl.torn = true; cl.trem = 0.7;
      const u = seg(t, TEAR2, PUSH);
      cl.tip = lerp(TOP + 4, -205, eout(u)); cl.g = 26 * Math.pow(u, 1.6);
    }
  }
  return [{h: him, mode: 'pair', sd: 0, ghost: 0}, {h: cl, mode: 'pair', sd: 0, ghost: 0}];
};
const starAt = (t: number): SS => {
  const s: SS = {mode: 'whole', th: 0, sepR: 0, hopL: 0, Rx: 0, Ry: 0, Rrot: 0, Lrot: 0, mood: 'smug', moodL: 'proud', moodR: 'proud', wave: 0, grow: 1, shake: 0, rLeft: false};
  if (t < SPULL) {
    s.wave = t < POP ? 16 * Math.sin(t * 2 * Math.PI * 1.1) : t < S3 ? 0 : 22 * Math.max(0, Math.sin((t - T.some) * 2 * Math.PI * 1.6)) * (t > T.some && t < T.some + 0.9 ? 1 : 0);
    s.mood = t > POP + 0.08 && t < S3 ? 'laugh' : 'smug'; s.shake = t > POP + 0.08 && t < S3 ? 1 : 0;
    return s;
  }
  if (t < SAPART) { s.mode = 'split'; s.th = 13 * eio(seg(t, SPULL, SAPART)); s.moodL = 'proud'; s.moodR = 'proud'; return s; }
  if (t < HEAL) {
    s.mode = 'apart';
    const u = t - SAPART;
    s.th = 13 * (1 - eout(seg(u, 0, 0.18))); s.Lrot = spring(t, SAPART + 0.18, -6, 2.6, 4); s.hopL = 14 * Math.sin(Math.PI * seg(u, 0, 0.22));
    s.sepR = 34 * backOut(seg(u, 0, 0.22)); s.Rrot = spring(t, SAPART + 0.18, 6, 2.6, 4);
    s.moodL = u < 0.3 ? 'proud' : 'smug'; s.moodR = u < 0.3 ? 'proud' : 'wink';
    if (t > SBYE) {   // the right half waves bye and hops off to the right (down onto the sand)
      const k = seg(t, SBYE + 0.1, SBYE + 0.55);
      s.wave = t < SBYE + 0.1 ? 26 * Math.sin((t - SBYE) * 30) : 0;
      s.Rx = k * 200; s.Ry = -70 * Math.sin(Math.PI * k) + k * 70; s.rLeft = k >= 1;
    }
    return s;
  }
  // the kept half heals and grows three new arms (behind the X-ray), whole again at a month
  s.mode = 'whole'; s.grow = eio(seg(t, HEAL + 0.05, WHOLE_S - 0.04)); s.mood = 'smug';
  if (t > BONK + 0.05 && t < 12.9) { s.mood = 'laugh'; s.shake = 1; }
  if (t > TEAR2) s.mood = 'look';
  return s;
};

// ---------- camera (piecewise, hard cuts) ----------
const CAM0 = {x: -1, y: -205, k: 3.1};
const camFor = (t: number): {x: number; y: number; k: number} => {
  if (t < S2) { const u = eio(seg(t, 0, S2)); return {x: lerp(CAM0.x, -6, u), y: lerp(CAM0.y, -208, u), k: lerp(CAM0.k, 3.22, u)}; }
  if (t < S3) { const u = eio(seg(t, S2, S3)); return {x: -96, y: lerp(-205, -208, u), k: lerp(3.7, 3.78, u)}; }
  if (t < S4) { const u = eio(seg(t, S3, S4)); return {x: lerp(45, 48, u), y: lerp(-150, -148, u), k: lerp(2.9, 2.96, u)}; }
  if (t < S5) { const u = eio(seg(t, S4, S5)); return {x: lerp(48, 54, u), y: lerp(-148, -142, u), k: lerp(2.96, 3.02, u)}; }
  if (t < S5B) { const u = eio(seg(t, S5, S5B)); return {x: -135, y: lerp(-178, -184, u), k: lerp(3.0, 3.12, u)}; }
  if (t < S6) { const u = eio(seg(t, S5B, S6)); return {x: -135, y: lerp(-168, -172, u), k: lerp(2.72, 2.78, u)}; }
  const u = eio(seg(t, S6, PUSH - 0.05));
  return {x: lerp(-135, CAM0.x + (RXA - GX), u), y: lerp(-172, CAM0.y, u), k: lerp(2.78, CAM0.k, u)};
};

export const StarScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const figs = guysAt(t), st = starAt(t);
  if (thumb) { st.mood = 'smug'; st.wave = 0; st.shake = 0; figs.forEach((f) => { f.h.mood = 'pop'; f.h.lean = f.sd * 4; f.h.y = 0; f.h.feet[f.sd < 0 ? 0 : 1] = [f.sd * 20, -12]; f.h.blink = 0; }); }
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 4, 6) + 2.2 * (t < POP ? 1 : 0) + hit(t, POP, 14, 6) + hit(t, SAPART, 4, 8) + hit(t, BONK, 16, 6) + hit(t, WHOLE, 6, 7) + hit(t, FIVE, 6, 8) + (t > TEAR2 ? 2.2 : 0));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  // stickers (each ends before its cut)
  const stk = {
    riip: popIn(t, 1.86, 0.22) * (1 - seg(t, POP + 0.02, POP + 0.12)) * (1 + 0.06 * Math.sin(t * 40)), half: popIn(t, T.half - 0.02, 0.22) * (1 - seg(t, S3 - 0.12, S3)),
    easy: popIn(t, T.some + 0.1, 0.25) * (1 - seg(t, SPULL - 0.15, SPULL)), pull: popIn(t, SPULL, 0.22) * (1 - seg(t, SAPART - 0.1, SAPART)),
    pop: popIn(t, SAPART, 0.2) * (1 - seg(t, S4 - 0.12, S4)), bye: popIn(t, SBYE + 0.04, 0.2) * (1 - seg(t, S4 - 0.12, S4)),
    bonk: popIn(t, BONK, 0.2) * (1 - seg(t, 12.2, 12.32)),
    clap: popIn(t, FIVE, 0.2) * (1 - seg(t, S6 - 0.12, S6)), uhoh: popIn(t, TEAR2 + 0.05, 0.22) * (1 - seg(t, PUSH - 0.14, PUSH)),
  };
  const dizzy = t > BONK + 0.15 && t < WHOLE;
  const halves = figs.filter((f) => f.mode === 'half');
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        {/* half-mouth clips (head-centred: the mouth group sits at (0, HC + 28)) */}
        {[-1, 1].map((sd) => <clipPath key={sd} id={`hm${sd < 0 ? 'L' : 'R'}${uid}`}>
          <path d={poly([...zzPts(TOP - 0, CHIN).map(([x, y]) => [x, y - HC - 28] as P2), [sd * 160, CHIN - HC - 28 + 40], [sd * 160, TOP - HC - 28 - 40]])} />
        </clipPath>)}
        {[-1, 1].map((sd) => <clipPath key={'s' + sd} id={`sc${sd < 0 ? 'L' : 'R'}${uid}`}><path d={starClip(sd)} /></clipPath>)}
        <clipPath id={`scL${uid}x`}><path d={poly([[0, -900], ...STAR_ZZ.map(([x, y]) => [x * XK, y * XK] as P2), [0, 900], [-900, 900], [-900, -900]])} /></clipPath>
      </defs></svg>
      <Sky />
      <Layer cam={cam} z={2600}><W><g>
        <circle cx={520} cy={-470} r={78} fill="#FFE8A0" stroke={INK} strokeWidth={6} />
        {[[-700, -420], [160, -560], [1100, -480]].map(([x, y], i) => <g key={i}>
          {[[-46, 8, 34], [0, -6, 44], [46, 8, 32]].map(([dx, dy, r], j) => <circle key={j} cx={x + dx} cy={y + dy} r={r + 6} fill={INK} />)}
          {[[-46, 8, 34], [0, -6, 44], [46, 8, 32]].map(([dx, dy, r], j) => <circle key={'f' + j} cx={x + dx} cy={y + dy} r={r} fill="#FFFFFF" />)}
        </g>)}
        <g transform="translate(0 -40)"><Sea t={t} x0={-4000} x1={4000} fill={SEA} op={1} amp={6} len={360} /></g>
        <path d="M 780 -110 L 840 -110 L 828 -92 L 792 -92 Z M 810 -110 L 810 -170 L 846 -118 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </g></W></Layer>
      <Layer cam={cam} z={1000}><W><g>
        <rect x={-4000} y={-40} width={8000} height={3000} fill={SAND} />
        <path d={waveD(-4000, 4000, -40, t, 4, 220, 0) + ' L 4000 -60 L -4000 -60 Z'} fill={SEA} />
        <path d={waveD(-4000, 4000, -40, t, 4, 220, 0)} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" />
        <path d={waveD(-4000, 4000, -40, t, 4, 220, 0)} stroke={INK} strokeWidth={4} fill="none" transform="translate(0 6)" />
        {Array.from({length: 26}, (_, i) => { const x = -1400 + i * 120 + ((i * 53) % 70); return <ellipse key={i} cx={x} cy={22 + (i % 3) * 24} rx={13 + (i % 4) * 4} ry={5.5} fill={SAND2} />; })}
        <Shell x={-250} y={36} s={1} rot={-12} /><Shell x={60} y={58} s={0.8} rot={18} /><Shell x={330} y={30} s={0.9} rot={-4} />
        <Rock />
      </g></W></Layer>
      <Layer cam={cam} z={1000}>
        <Starfish t={t} s={st} uid={uid} />
        {figs.map((f, i) => <Figure key={i} h={f.h} t={t} uid={uid} mode={f.mode} sd={f.sd} ghost={f.ghost} />)}
        {t > WHOLE - 0.02 && t < WHOLE + 0.42 ? [LXA + 28, RXA - 28].map((x, i) => [[-40, -250], [44, -200], [-30, -120], [40, -60], [0, -300]].map(([dx, dy], j) => {
          const u = (t - WHOLE + 0.02) / 0.44; return <Star key={i + '_' + j} x={x + dx * (1 + 0.5 * u)} y={dy - 20 * u} s={0.5 * Math.sin(Math.PI * u)} rot={t * 300 + j * 40} />; })) : null}
        {t > BONK - 0.02 && t < BONK + 0.3 ? <W><g transform={`translate(${MEET} -240)`} opacity={1 - (t - BONK) / 0.3}>{[-150, -110, -70, -30, 30, 70, 110, 150, 180, 0].map((a) => <path key={a} d={`M ${(24 + 70 * (t - BONK)).toFixed(1)} 0 L ${(48 + 100 * (t - BONK)).toFixed(1)} 0`} transform={`rotate(${a - 90})`} stroke={GOLD} strokeWidth={8} strokeLinecap="round" />)}</g></W> : null}
        {dizzy ? halves.map((f, i) => [0, 1, 2].map((j) => { const a = t * 6 + (j * 2 * Math.PI) / 3 + i, c = headTop(f.h), cx = c[0] + f.sd * 32;
          return <Star key={i + '_' + j} x={cx + Math.cos(a) * 52} y={c[1] - 30 + Math.sin(a) * 14} s={0.42} rot={t * 200} />; })) : null}
        {t > POP - 0.02 && t < POP + 0.3 ? <W><g transform={`translate(${GX} -175)`} opacity={1 - (t - POP) / 0.3}>{[-160, -120, -60, -20, 20, 60, 120, 160].map((a) => <path key={a} d={`M ${(30 + 80 * (t - POP)).toFixed(1)} 0 L ${(56 + 110 * (t - POP)).toFixed(1)} 0`} transform={`rotate(${a - 90})`} stroke={GOLD} strokeWidth={9} strokeLinecap="round" />)}</g></W> : null}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={GX + 40} y={-345} s={stk.riip} text="RIIIP" size={58} rot={-6} fill={GOLD} />
        <Txt x={SX - 10} y={-250} s={stk.easy} text="EASY" size={40} rot={6} fill="#FFFFFF" />
        <Txt x={SX + 6} y={-262} s={stk.pull} text="PULL" size={44} rot={-6} fill={GOLD} />
        <Txt x={SX + 10} y={-268} s={stk.pop} text="POP" size={48} rot={6} fill={GOLD} />
        <Txt x={SX + 92} y={-196} s={stk.bye} text="BYE" size={34} rot={10} fill="#FFFFFF" />
        <Txt x={MEET + 92} y={-262} s={stk.bonk} text="BONK" size={46} rot={-8} fill="#FFFFFF" />
        <Txt x={MEET} y={-372} s={stk.clap} text="CLAP" size={46} rot={-5} fill="#FFFFFF" />
        <Txt x={RXA + 30} y={-352} s={stk.uhoh} text="UH-OH" size={44} rot={-6} fill="#FFFFFF" />
      </Layer>}
      {thumb ? null : <>
        <Card text="HALF" top={515} left={540} color={RED} fg="#fff" rot={-4} size={84} s={stk.half} />
        <Card text="2 OF HIM" top={455} left={540} color={GOLD} rot={3} size={66} s={popIn(t, WHOLE + 0.02, 0.25) * (1 - seg(t, FIVE - 0.16, FIVE - 0.04))} />
        <PartCards t={t} />
        <DayCard t={t} />
      </>}
      <StarXRay t={t} s={popIn(t, S4 + 0.03, 0.35) * (1 - seg(t, S5 - 0.14, S5)) * (t >= S4 ? 1 : 0)} uid={uid} />
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you could clone yourself like a starfish??" handle="@starry_doodle" likes="3.1K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.and} until={PUSH - 0.4} text="Which one is the real him?" />
      </>}
    </AbsoluteFill>
  );
};
/** ONE EYE / ONE ARM / ONE LEG between his two halves (screen space) */
const PART: [string, number, number, number][] = [['ONE EYE', T.one1 + 0.08, 760, -4], ['ONE ARM', T.one2 + 0.08, 1000, 3], ['ONE LEG', T.one3 + 0.06, 1260, -3]];
const PartCards: React.FC<{t: number}> = ({t}) => {
  if (t < S5 || t > BONK) return null;
  return <>{PART.map(([text, at, top, rot]) => <Card key={text} text={text} top={top} left={540} color={RED} fg="#fff" rot={rot} size={50}
    s={popIn(t, at, 0.26) * (1 - seg(t, HOP0 + 0.14, HOP0 + 0.26))} />)}</>;
};

export const StarVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const waves: Cue[] = Array.from({length: 6}, (_, i) => ({f: 'waves.wav', at: i * 2.7, db: -33}));
  const cues: Cue[] = [
    ...waves,
    // frame 0: RIIIP - tearing himself in half
    {f: 'rip.wav', at: 0, db: -3}, {f: 'pop.wav', at: 0, db: -15}, {f: 'strain.mp3', at: 0.1, db: -27, to: 1.4},
    // POP: the halves spring apart and land on one leg each
    {f: 'pop.wav', at: POP, db: -6}, {f: 'boing.wav', at: POP + 0.01, db: -11}, {f: 'thud.wav', at: POP + 0.31, db: -17},
    {f: 'whoosh.wav', at: S2 - 0.02, db: -31}, {f: 'pop.wav', at: T.half, db: -21},
    // the starfish: EASY, PULL, POP, BYE
    {f: 'whoosh.wav', at: S3 - 0.02, db: -31}, {f: 'crowd_laugh.wav', at: POP + 0.12, db: -30, to: 0.6},
    {f: 'pop.wav', at: T.some + 0.1, db: -27}, {f: 'rip_short.wav', at: SPULL + 0.02, db: -11}, {f: 'pop.wav', at: SAPART, db: -9}, {f: 'boing.wav', at: SAPART + 0.02, db: -18},
    {f: 'boing.wav', at: SBYE + 0.1, db: -20}, {f: 'pop.wav', at: SBYE + 0.04, db: -26},
    // X-RAY: STARFISH - stomach in every arm, grows back, DAYS 0 -> 30, CLONE
    {f: 'zap.wav', at: S4, db: -24}, {f: 'pop.wav', at: S4 + 0.05, db: -24}, {f: 'pop.wav', at: T.each, db: -23},
    {f: 'stretch.wav', at: HEAL, db: -19}, {f: 'pop.wav', at: T.grows, db: -24},
    ...ticks(CNT0, CNT1, 15, -31), {f: 'ding.mp3', at: WHOLE_S, db: -20}, {f: 'pop.wav', at: WHOLE_S + 0.02, db: -22},
    // his month: DAY 1, ONE EYE (blink), ONE ARM (wave), ONE LEG (hop hop BONK)
    {f: 'whoosh.wav', at: S5 - 0.02, db: -31}, {f: 'pop.wav', at: 8.72, db: -26},
    ...ctaCues(T.cta),
    {f: 'pop.wav', at: PART[0][1], db: -22}, {f: 'click.wav', at: BLINK, db: -22},
    {f: 'whoosh.wav', at: S5B - 0.02, db: -31}, {f: 'pop.wav', at: PART[1][1], db: -22}, {f: 'pop.wav', at: PART[2][1], db: -22},
    {f: 'boing.wav', at: HOP0, db: -17}, {f: 'boing.wav', at: HOP0 + 0.17, db: -17},
    {f: 'bonk.wav', at: BONK, db: -5}, {f: 'slap.wav', at: BONK, db: -15}, {f: 'crowd_laugh.wav', at: BONK + 0.12, db: -25, to: 1.1},
    // DAY 30: sketch, POP - two of him; high five
    {f: 'ding.mp3', at: DAY30, db: -21}, {f: 'scribble.wav', at: SKETCH, db: -17}, {f: 'pop.wav', at: WHOLE - 0.1, db: -9}, {f: 'pop.wav', at: WHOLE - 0.06, db: -13},
    {f: 'slap.wav', at: FIVE, db: -13},
    // his clone wants a clone
    {f: 'whoosh.wav', at: S6 - 0.02, db: -32}, {f: 'giggle.mp3', at: GRIN, db: -27, to: 0.6},
    {f: 'rip_short.wav', at: TEAR2, db: -9}, {f: 'rip.wav', at: TEAR2 + 0.35, db: -12, to: 0.75}, {f: 'gasp.wav', at: TEAR2 + 0.08, db: -21},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<StarScene t={0} />}>
        <StarScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="starfish/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const StarWide: React.FC = () => <WideFit.Provider value={0.72}><StarVideo /></WideFit.Provider>;
