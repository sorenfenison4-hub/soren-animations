// "What if you had a cat's eyes?" - shark formula (CLAUDE.md, Growth), niche: animal powers. All drawn in code.
// Frame 0: a pitch-dark room, close-up: his huge glowing cat eyes next to the smug cat's; he snatches a yarn ball out of the
// air (the power at its best). 1.66 s the cat flips the light switch: lights on, both pairs of pupils snap to slits; 1.92 HIS
// VIEW is one big blur and the cat bats a second ball at us; 2.36 BONK in his face (close-up, dizzy). 3.36 the cat's face in
// the dark (NIGHT MODE) -> 5.2 X-RAY: CAT EYE - a MIRROR behind the retina, the light goes through twice (LIGHT PASSES:
// YOU 1 vs CAT 2). Comedy hit 8.28: a selfie flash - both pairs of eyes blaze in the photo (GLOW). 9.02 by day: eye charts
// YOU vs CAT EYES, the cat one blurs x1 -> x7 (ONLY THE BIG E). 12.84 he brushes his teeth with the cat's tail (HISS).
// 14.8 they nap on the rug in a sunbeam, night falls, both pairs of eyes pop open (WIDE AWAKE) -> the loop push to frame 0.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, Key, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd, spring,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky} from './lib/kit';

// voice: tight.mp3 at 0.1 s (scripts/vsplice.py: line 1 at 1.22, the rest at 1.12); word times in src/data/words.json.
// Last word ends 16.87 s; + ~0.88 s for the loop push.
export const DURATION = 17.75;
export const T = {
  see: 0.10, dark: 0.56, cat: 1.15, and: 1.64, daylight: 1.77, blur: 2.36, everything: 2.75,
  its: 3.41, eyes: 3.70, built: 4.20, dark2: 4.77, mirror: 5.40, back: 5.97, bounces: 6.40, light: 6.83, through: 7.15, twice: 7.37,
  thats: 8.10, glow: 8.45,
  but: 9.12, day: 9.48, cat2: 10.04, sees: 10.32, about: 10.68, seven: 10.96, times: 11.25, blurrier: 11.68, than: 12.18, you: 12.43,
  he: 13.02, brushed: 13.23, teeth: 13.66, with: 13.95, cat3: 14.45,
  so: 14.89, now: 15.11, naps: 15.43, all: 15.68, day2: 15.97, like: 16.31, cat4: 16.74,
  cta: 12.2,
};
// shots (hard cuts)
const S2 = 1.92, S3 = 2.36, S4 = 3.36, S4X = 5.2, S5 = 7.98, S6 = 9.02, S6X = 9.9, S7 = 12.84, S8 = 14.8;
const PUSH = DURATION - LOOP_DUR;
const CATCH = 0.22, RAISE = 1.36, FLIP = 1.66, LIGHTS = 1.72, SNAP = 1.8, BAT = 2.0, BONK = 2.36;   // frame 0 -> BONK
const BEAM0 = 6.4, BEAM1 = 6.86, BEAM2 = 7.4;                                                       // the x-ray light beam
const FLASH = 8.28, PHOTO = 8.4;                                                                    // the selfie
const BL0 = 10.3, BL1 = 11.7;                                                                       // chart blur x1 -> x7
const GRAB = 13.0, LIFT = 13.3, PASTE = 13.34, BRUSH0 = 13.62, HISS = 14.45;                        // toothbrush
const DUSK0 = 15.95, DUSK1 = 16.6, OPEN = 16.74;                                                    // nap -> night

const GOLD = '#FFD43B', RED = '#E2453C', BLUE = '#3D8FD6', WHITE = '#FFFFFF', FACE_C = '#F1EFEA';
const NIGHTC = '#26305E', NSKIN = '#8E99C3';
const CATC = '#F2A33A', CAT_ST = '#B9601A', CAT_LT = '#FFF0D9', CAT_PINK = '#F49AA4';
const IRIS = '#B5D94A', IRIS_DK = '#7A9E2C', GLOWC = '#F3FFA6';
const WOOD = '#B9783F', WOOD_DK = '#97602F', FLOORC = '#CF955A';
const YARN = '#E8577A', YARN_DK = '#B53A5B';

type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const mul = (a: P2, k: number): P2 => [a[0] * k, a[1] * k];
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const rot2 = (p: P2, deg: number): P2 => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const inS = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);
const hx = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const mix = (a: string, b: string, u: number) => { const A = hx(a), B = hx(b), k = clamp(u); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, '0')).join(''); };
/** a colour at night: pulled toward navy */
const nite = (c: string, nt: number, k = 0.6) => (nt > 0.001 ? mix(c, NIGHTC, k * nt) : c);
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
const cbez = (a: P2, b: P2, c: P2, d: P2, n = 22): P2[] => Array.from({length: n + 1}, (_, i) => {
  const u = i / n, v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]] as P2;
});
/** a tapered tube along a polyline (closed outline) */
const taper = (pts: P2[], w0: number, w1: number) => {
  const L: P2[] = [], R: P2[] = [];
  pts.forEach((p, i) => {
    const q = pts[Math.min(pts.length - 1, i + 1)], o = pts[Math.max(0, i - 1)];
    const dx = q[0] - o[0], dy = q[1] - o[1], d = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, i / (pts.length - 1)) / 2;
    L.push([p[0] - (dy / d) * w, p[1] + (dx / d) * w]); R.push([p[0] + (dy / d) * w, p[1] - (dx / d) * w]);
  });
  const e = pts[pts.length - 1], pe = pts[pts.length - 2], dx = e[0] - pe[0], dy = e[1] - pe[1], d = Math.hypot(dx, dy) || 1;
  const tip: P2 = [e[0] + (dx / d) * w1 * 0.45, e[1] + (dy / d) * w1 * 0.45];
  return smoothD([...L, tip, ...R.reverse()], true);
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
/** a big counter box (screen space) */
const CountBox: React.FC<{label: string; val: string; col: string; s: number; top: number; bump?: number}> = ({label, val, col, s, top, bump = 0}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s * (1 + 0.1 * bump)})`, background: '#FFFDF6', border: `9px solid ${INK}`,
    borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '4px 34px 10px', textAlign: 'center', minWidth: 330, fontFamily: FONT, color: INK, whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: 900, fontSize: 42, lineHeight: 1.1}}>{label}</div>
    <div style={{fontWeight: 900, fontSize: 108, lineHeight: 1, color: col}}>{val}</div>
  </div>
) : null;
/** versus box: LIGHT PASSES - YOU 1 | CAT 2 */
const VsBox: React.FC<{s: number; top: number; you: string; cat: string; label: string; bump?: number}> = ({s, top, you, cat, label, bump = 0}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s * (1 + 0.08 * bump)})`, background: '#FFFDF6', border: `9px solid ${INK}`,
    borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 30px 10px', fontFamily: FONT, color: INK, whiteSpace: 'nowrap', textAlign: 'center'}}>
    <div style={{fontWeight: 900, fontSize: 40, lineHeight: 1.1}}>{label}</div>
    <div style={{display: 'flex', gap: 34, alignItems: 'flex-end', justifyContent: 'center'}}>
      <div><div style={{fontWeight: 900, fontSize: 36}}>YOU</div><div style={{fontWeight: 900, fontSize: 104, lineHeight: 1, color: BLUE}}>{you}</div></div>
      <div style={{width: 7, alignSelf: 'stretch', background: INK, borderRadius: 4}} />
      <div><div style={{fontWeight: 900, fontSize: 36}}>CAT</div><div style={{fontWeight: 900, fontSize: 104, lineHeight: 1, color: '#E58A1C'}}>{cat}</div></div>
    </div>
  </div>
) : null;

// ---------- the rig (front view, hip at (0, 0)) ----------
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

// ---------- cat eyes (his and the cat's): almond, iris all over, a pupil from a slit (pw 0) to wide open (pw 1) ----------
type EyeP = {pw: number; look: P2; lid: number; low: number; glow: number; shut: '' | 'sleep' | 'happy' | 'squeeze'; lidC: string};
const almond = (rx: number, ry: number) => {
  const a = (rx * 0.62).toFixed(1), b = (ry * 1.32).toFixed(1);
  return `M ${-rx} 0 C -${a} -${b} ${a} -${b} ${rx} 0 C ${a} ${b} -${a} ${b} ${-rx} 0 Z`;
};
const CatEye: React.FC<{x: number; y: number; rx: number; ry: number; e: EyeP; id: string; sd: number}> = ({x, y, rx, ry, e, id, sd}) => {
  if (e.shut === 'sleep') return <path d={`M ${x - rx} ${y - 2} Q ${x} ${y + ry * 0.8} ${x + rx} ${y - 2}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (e.shut === 'happy') return <path d={`M ${x - rx} ${y + 5} Q ${x} ${y - ry * 0.95} ${x + rx} ${y + 5}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (e.shut === 'squeeze') return <path d={`M ${x + sd * rx * 0.7} ${y - ry * 0.75} L ${x - sd * rx * 0.6} ${y} L ${x + sd * rx * 0.7} ${y + ry * 0.75}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const iris = mix(IRIS, GLOWC, e.glow), rim = mix(IRIS_DK, '#CBEA5C', e.glow);
  const prx = lerp(rx * 0.08, rx * 0.5, e.pw), pry = ry * lerp(0.98, 0.84, e.pw);
  const px = e.look[0] * rx * 0.26, py = e.look[1] * ry * 0.2;
  const ly = -ry * 1.05 + 2.1 * ry * e.lid, by = ry * 1.05 - 2.1 * ry * e.low;
  const A = almond(rx, ry);
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs><clipPath id={id}><path d={A} /></clipPath></defs>
      <path d={A} fill={iris} />
      <g clipPath={`url(#${id})`}>
        <path d={A} fill="none" stroke={rim} strokeWidth={rx * 0.32} opacity={0.6} />
        <ellipse cx={px} cy={py} rx={prx} ry={pry} fill={INK} />
        <circle cx={px - rx * 0.3} cy={py - ry * 0.42} r={rx * 0.15} fill="#FFFFFF" />
        {e.glow > 0.05 ? <circle cx={px + rx * 0.3} cy={py + ry * 0.4} r={rx * 0.08} fill="#FFFFFF" opacity={e.glow} /> : null}
        {e.lid > 0.01 ? <path d={`M ${-rx - 6} ${-ry * 2} H ${rx + 6} V ${ly.toFixed(1)} H ${-rx - 6} Z`} fill={e.lidC} /> : null}
        {e.low > 0.01 ? <path d={`M ${-rx - 6} ${ry * 2} H ${rx + 6} V ${by.toFixed(1)} H ${-rx - 6} Z`} fill={e.lidC} /> : null}
        {e.lid > 0.01 ? <path d={`M ${-rx - 6} ${ly.toFixed(1)} H ${rx + 6}`} stroke={INK} strokeWidth={4.5} /> : null}
        {e.low > 0.01 ? <path d={`M ${-rx - 6} ${by.toFixed(1)} H ${rx + 6}`} stroke={INK} strokeWidth={4} /> : null}
      </g>
      <path d={A} fill="none" stroke={INK} strokeWidth={4.8} strokeLinejoin="round" />
    </g>
  );
};

// ---------- the guy ----------
type Mood = 'joy' | 'happy' | 'grin' | 'smug' | 'pop' | 'worry' | 'oof' | 'squint' | 'dazed' | 'sleep' | 'foam';
const GFace: React.FC<{t: number; m: Mood; look: P2; pw: number; glow: number; lidC: string; uid: string}> = ({t, m, look, pw, glow, lidC, uid}) => {
  const shut = m === 'sleep' ? 'sleep' : m === 'oof' ? 'squeeze' : '';
  const lid = m === 'smug' ? 0.42 : m === 'squint' || m === 'foam' ? 0.5 : m === 'happy' ? 0.12 : m === 'grin' ? 0.16 : m === 'dazed' ? 0.24 : 0;
  const low = m === 'squint' || m === 'foam' ? 0.3 : 0;
  const lk: P2 = m === 'dazed' ? [Math.sin(t * 9) * 0.8, Math.cos(t * 9) * 0.6] : look;
  const eye = (sd: number) => <CatEye key={sd} x={sd * 27} y={-12} rx={19} ry={16} sd={sd} id={`ge${uid}${sd}`} e={{pw, look: lk, lid, low, glow, shut, lidC}} />;
  const brow = (sd: number) => {
    let d = `M ${sd * 13} -46 Q ${sd * 27} -55 ${sd * 41} -48`;
    if (m === 'smug') d = sd < 0 ? 'M -14 -40 L -41 -44' : 'M 14 -51 Q 28 -61 42 -53';
    else if (m === 'squint' || m === 'foam') d = `M ${sd * 11} -36 L ${sd * 41} -44`;
    else if (m === 'pop') d = `M ${sd * 13} -58 Q ${sd * 27} -68 ${sd * 41} -60`;
    else if (m === 'worry' || m === 'dazed') d = `M ${sd * 12} -50 L ${sd * 40} -40`;
    else if (m === 'oof') d = `M ${sd * 9} -33 L ${sd * 39} -46`;
    else if (m === 'sleep') d = `M ${sd * 13} -40 Q ${sd * 27} -45 ${sd * 41} -41`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  let mouth: React.ReactNode;
  if (m === 'joy') mouth = <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  else if (m === 'happy') mouth = <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  else if (m === 'grin') mouth = <g><path d="M -28 0 Q 0 6 28 0 Q 24 22 0 24 Q -24 22 -28 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><path d="M -26 8 Q 0 13 26 8" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (m === 'smug') mouth = <path d="M -20 10 Q 4 22 24 2" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (m === 'pop') mouth = <g><ellipse cx={0} cy={12} rx={15} ry={19} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={22} rx={8} ry={5} fill="#E4677A" /></g>;
  else if (m === 'oof') mouth = <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (m === 'squint') mouth = <path d="M -16 10 Q 0 4 16 10" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (m === 'sleep') mouth = <ellipse cx={0} cy={10} rx={7} ry={6 + 2 * Math.sin(t * 3)} fill="#5A2328" stroke={INK} strokeWidth={4} />;
  else if (m === 'foam') mouth = <g><ellipse cx={0} cy={10} rx={18} ry={13} fill="#5A2328" stroke={INK} strokeWidth={5} />
    {[[-20, 4, 8], [-10, 20, 7], [8, 22, 8], [20, 8, 7], [0, -2, 6], [-26, 16, 5], [26, 18, 5]].map(([x, y, r], i) =>
      <circle key={i} cx={x + 1.5 * Math.sin(t * 20 + i)} cy={y} r={r} fill="#FFFFFF" stroke={INK} strokeWidth={3} />)}</g>;
  else mouth = <path d="M -18 10 q 6 -6 12 0 t 12 0 t 12 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;   // worry, dazed
  return <g>{eye(-1)}{eye(1)}{brow(-1)}{brow(1)}<g transform="translate(0 30)">{mouth}</g></g>;
};

type GS = {x: number; y: number; rot: number; tilt: number; mood: Mood; armA: P2; armB: P2; footA: P2; footB: P2; look: P2; sq: number;
  skin: string; nt: number; pw: number; glow: number; hold: '' | 'yarn' | 'phone'; holdRot: number; led: number; show: number};
const SHX = 38, SH_Y = -90, NECK = -165, LEG = 40;
const SB: P2 = [SHX, SH_Y];
const BASE: GS = {x: 0, y: 0, rot: 0, tilt: 0, mood: 'happy', armA: [-58, 60], armB: [58, 60], footA: [-26, 70], footB: [26, 70], look: [0, 0], sq: 0,
  skin: WHITE, nt: 0, pw: 0.06, glow: 0, hold: '', holdRot: 0, led: 0, show: 1};
const LEG_S = (sd: number): P2 => [sd * 19, 4];
/** world point -> armB vector for a guy standing upright at (gx, gy) */
const armTo = (gx: number, gy: number, w: P2): P2 => [w[0] - gx - SHX, w[1] - gy - SH_Y];

const YarnG: React.FC<{r?: number; rot?: number; nt?: number}> = ({r = 26, rot = 0, nt = 0}) => (
  <g transform={`rotate(${rot.toFixed(1)})`}>
    <path d={`M ${r * 0.55} ${r * 0.72} q ${r * 0.5} ${r * 0.55} ${r * 1.15} ${r * 0.18}`} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
    <path d={`M ${r * 0.55} ${r * 0.72} q ${r * 0.5} ${r * 0.55} ${r * 1.15} ${r * 0.18}`} stroke={nite(YARN, nt)} strokeWidth={4} fill="none" strokeLinecap="round" />
    <circle r={r} fill={nite(YARN, nt)} stroke={INK} strokeWidth={5.5} />
    <path d={`M ${-r * 0.82} ${-r * 0.3} Q 0 ${-r * 0.95} ${r * 0.8} ${-r * 0.22} M ${-r * 0.92} ${r * 0.14} Q 0 ${-r * 0.36} ${r * 0.9} ${r * 0.24} M ${-r * 0.62} ${r * 0.64} Q 0 ${r * 0.18} ${r * 0.66} ${r * 0.62}`}
      stroke={nite(YARN_DK, nt)} strokeWidth={4} fill="none" strokeLinecap="round" />
  </g>
);
const Yarn: React.FC<{x: number; y: number; r?: number; rot?: number; nt?: number; streak?: P2}> = ({x, y, r = 26, rot = 0, nt = 0, streak}) => (
  <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)})`}>
    {streak ? [-1, 0, 1].map((i) => { const n: P2 = [-streak[1], streak[0]], o = mul(n, i * r * 0.55);
      const d = `M ${P(add(o, mul(streak, r * 1.35)))} L ${P(add(o, mul(streak, r * (2.5 + 0.9 * (1 - Math.abs(i))))))}`;
      return <g key={i}><path d={d} stroke={INK} strokeWidth={12} strokeLinecap="round" /><path d={d} stroke="#FFFFFF" strokeWidth={5} strokeLinecap="round" /></g>; }) : null}
    <YarnG r={r} rot={rot} nt={nt} />
  </g></W>
);
/** the back of a phone held in a hand (hand at 0, 0) */
const PhoneG: React.FC<{led: number; nt: number}> = ({led, nt}) => (
  <g transform="translate(0 -40)">
    <rect x={-27} y={-48} width={54} height={96} rx={11} fill={nite('#4A5172', nt, 0.3)} stroke={INK} strokeWidth={5.5} />
    <rect x={-18} y={-38} width={24} height={24} rx={7} fill="#20253A" stroke={INK} strokeWidth={3} />
    <circle cx={-6} cy={-26} r={6} fill="#8EA2D8" stroke={INK} strokeWidth={2.5} />
    <circle cx={13} cy={-31} r={5.5} fill={led > 0.05 ? '#FFFFFF' : '#C9C9C9'} stroke={INK} strokeWidth={2.5} />
  </g>
);

const Guy: React.FC<{t: number; g: GS; uid: string; pass?: 'body' | 'glow'}> = ({t, g, uid, pass = 'body'}) => {
  if (!g.show) return null;
  const SA: P2 = [-SHX, SH_Y];
  const hB = add(SB, g.armB);
  const headT = `translate(0 ${NECK}) rotate(${(-g.rot + g.tilt).toFixed(2)}) scale(${(1 + 0.08 * g.sq).toFixed(3)} ${(1 - 0.1 * g.sq).toFixed(3)})`;
  const outer = `translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)})`;
  if (pass === 'glow') {
    if (g.glow < 0.02 || g.mood === 'sleep' || g.mood === 'oof') return null;
    return <W><g transform={outer}><g transform={headT}>{[-1, 1].map((sd) => <circle key={sd} cx={sd * 27} cy={-12} r={38} fill="url(#glowG)" opacity={0.68 * g.glow} />)}</g></g></W>;
  }
  const legs = [g.footA, g.footB].map((f, i) => ({S: LEG_S(i ? 1 : -1), H: f, sd: i ? -1 : 1}));
  return (
    <W><g transform={outer}>
      {legs.map((l, i) => <Limb key={'l' + i} S={l.S} H={l.H} L={LEG} sd={l.sd} w={30} hand={false} fill={g.skin} />)}
      {legs.map((l, i) => <ellipse key={'f' + i} cx={l.H[0] + (i ? 2 : -2)} cy={l.H[1] + 5} rx={23} ry={9.5} fill={g.skin} stroke={INK} strokeWidth={6} />)}
      <path d={torsoD(47, -112, 13)} fill={g.skin} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <Limb S={SA} H={add(SA, g.armA)} L={77} sd={g.armA[1] > 0 ? 1 : -1} fill={g.skin} />
      {g.hold === 'yarn' ? <g transform={`translate(${P(add(hB, [3, -20]))})`}><YarnG r={24} rot={g.holdRot} nt={g.nt} /></g> : null}
      {g.hold === 'phone' ? <g transform={`translate(${P(hB)}) rotate(${g.holdRot})`}><PhoneG led={g.led} nt={g.nt} /></g> : null}
      <Limb S={SB} H={hB} L={77} sd={g.armB[1] > 0 ? -1 : 1} fill={g.skin} />
      <g transform={headT}>
        <circle r={HEAD_R + 1} fill={g.skin === WHITE ? 'url(#wFace)' : g.skin} stroke={INK} strokeWidth={6.5} />
        <GFace t={t} m={g.mood} look={g.look} pw={g.pw} glow={g.glow} lidC={g.skin === WHITE ? FACE_C : g.skin} uid={uid} />
      </g>
    </g></W>
  );
};

// ---------- the cat: sitting, front view, paws at (0, 0) ----------
type CMood = 'smug' | 'happy' | 'wide' | 'annoyed' | 'shock' | 'hiss';
type CS = {x: number; y: number; s: number; mood: CMood; pw: number; glow: number; look: P2; paw: number; pawSide: number; pawTo: P2; tailTo: P2 | null;
  paste: number; puff: number; nt: number; tilt: number; ears: number; show: number};
const C_BASE: CS = {x: 0, y: 0, s: 1, mood: 'smug', pw: 0.06, glow: 0, look: [0, 0], paw: 0, pawSide: -1, pawTo: [-80, -150], tailTo: null, paste: 0, puff: 0, nt: 0, tilt: 0, ears: 0, show: 1};
const CHEAD: P2 = [0, -158];
const toCat = (c: CS, w: P2): P2 => [(w[0] - c.x) / c.s, (w[1] - c.y) / c.s];
const PUFF_D = (k: number) => smoothD(Array.from({length: 52}, (_, i) => {
  const a = (i / 52) * Math.PI * 2, r = i % 2 ? 1 : 1 + 0.2 * k;
  return [Math.cos(a) * 60 * r * (1 + 0.1 * k), -66 + Math.sin(a) * 70 * r * (1 + 0.1 * k)] as P2;
}));
const Cat: React.FC<{t: number; c: CS; uid: string; pass?: 'body' | 'glow'}> = ({t, c, uid, pass = 'body'}) => {
  if (!c.show) return null;
  const F = (col: string) => nite(col, c.nt);
  const fur = F(CATC), st = F(CAT_ST), lt = F(CAT_LT), pink = F(CAT_PINK);
  const outer = `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) scale(${c.s.toFixed(3)})`;
  const headT = `translate(${CHEAD[0]} ${CHEAD[1]}) rotate(${c.tilt.toFixed(2)})`;
  const m = c.mood;
  if (pass === 'glow') {
    if (c.glow < 0.02 || m === 'happy') return null;
    return <W><g transform={outer}><g transform={headT}>{[-1, 1].map((sd) => <circle key={sd} cx={sd * 27} cy={-6} r={38} fill="url(#glowG)" opacity={0.68 * c.glow} />)}</g></g></W>;
  }
  const sw = 12 * Math.sin(t * 2.4);
  const tw0 = 22 + 12 * c.puff, tw1 = 14 + 10 * c.puff;
  const tailPts = c.tailTo
    ? cbez([-40, -22], [-104, -8], [c.tailTo[0] + 60, c.tailTo[1] + 36], c.tailTo)
    : cbez([42, -20], [104, -8], [124 + sw * 0.4, -92], [92 + sw, -142]);
  const pw = c.paw > 0.01 ? eio(clamp(c.paw)) : 0;
  const pawRest: P2 = [c.pawSide * 20, -8], pawS: P2 = [c.pawSide * 20, -90];
  const pawP = lp2(pawRest, c.pawTo, pw);
  const pawD = quadD(pawS, lp2(pawS, pawP, 0.5), pawP);
  const legX = (sd: number) => sd * 20 - 11;
  const eyeP = (sd: number): EyeP => {
    const lid = m === 'smug' ? 0.45 : m === 'annoyed' ? 0.5 : m === 'hiss' ? 0.16 : 0;
    const low = m === 'annoyed' ? 0.12 : m === 'hiss' ? 0.1 : 0;
    return {pw: c.pw, look: c.look, lid, low, glow: c.glow, shut: m === 'happy' ? 'happy' : '', lidC: fur};
  };
  let mouth: React.ReactNode;
  if (m === 'hiss') mouth = <g><path d="M -19 22 Q 0 17 19 22 Q 15 48 0 50 Q -15 48 -19 22 Z" fill="#5A2328" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    <path d="M -13 23 L -9 35 L -5 23 Z M 13 23 L 9 35 L 5 23 Z" fill="#FFFFFF" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
    <ellipse cx={0} cy={41} rx={8} ry={4} fill="#E4677A" /></g>;
  else if (m === 'shock') mouth = <ellipse cx={0} cy={31} rx={8} ry={10} fill="#5A2328" stroke={INK} strokeWidth={4} />;
  else if (m === 'annoyed') mouth = <path d="M -11 27 L 11 27" stroke={INK} strokeWidth={4} strokeLinecap="round" />;
  else if (m === 'smug') mouth = <path d="M -13 24 Q -6 31 0 24 Q 7 30 15 20" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  else mouth = <path d="M -13 23 Q -6 31 0 23 Q 6 31 13 23" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  const brows = m === 'smug' ? 'M -42 -32 L -17 -30 M 16 -37 Q 28 -45 41 -38'
    : m === 'annoyed' || m === 'hiss' ? 'M -42 -38 L -15 -28 M 15 -28 L 42 -38' : m === 'shock' ? 'M -41 -40 Q -28 -48 -15 -41 M 15 -41 Q 28 -48 41 -40' : '';
  const earRot = -40 * c.ears;
  return (
    <W><g transform={outer}>
      {c.puff > 0.01 ? <path d={PUFF_D(c.puff)} fill={fur} stroke={INK} strokeWidth={6} strokeLinejoin="round" /> : null}
      <path d={taper(tailPts, tw0, tw1)} fill={fur} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[0.42, 0.64, 0.86].map((u, i) => { const q = tailPts[Math.round(u * (tailPts.length - 1))]; return <circle key={i} cx={q[0]} cy={q[1]} r={5 + 2 * c.puff} fill={st} />; })}
      {c.paste > 0.01 ? (() => { const e = tailPts[tailPts.length - 1];
        return <g transform={`translate(${P(e)}) scale(${c.paste})`}><path d="M -16 2 Q -18 -14 -4 -12 Q 2 -24 14 -12 Q 24 -6 16 6 Q 4 14 -16 2 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M -6 -4 Q 2 -8 8 -2" stroke="#7FD3F0" strokeWidth={4} fill="none" strokeLinecap="round" /></g>; })() : null}
      <ellipse cx={-50} cy={-30} rx={30} ry={32} fill={fur} stroke={INK} strokeWidth={6.5} />
      <ellipse cx={50} cy={-30} rx={30} ry={32} fill={fur} stroke={INK} strokeWidth={6.5} />
      <ellipse cx={0} cy={-68} rx={56} ry={68} fill={fur} stroke={INK} strokeWidth={7} />
      <path d="M -42 -100 Q -32 -92 -28 -78 M 42 -100 Q 32 -92 28 -78 M -52 -62 Q -42 -56 -38 -44 M 52 -62 Q 42 -56 38 -44" stroke={st} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={0} cy={-72} rx={28} ry={44} fill={lt} />
      {[-1, 1].map((sd) => (pw > 0.01 && sd === c.pawSide) ? null : <g key={sd}>
        <rect x={legX(sd)} y={-80} width={22} height={76} rx={11} fill={fur} stroke={INK} strokeWidth={6} />
        <ellipse cx={sd * 20} cy={-6} rx={16} ry={9} fill={lt} stroke={INK} strokeWidth={4.5} />
      </g>)}
      {pw > 0.01 ? <g>
        <path d={pawD} stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d={pawD} stroke={fur} strokeWidth={15} fill="none" strokeLinecap="round" />
        <circle cx={pawP[0]} cy={pawP[1]} r={15} fill={lt} stroke={INK} strokeWidth={4.5} />
        <path d={`M ${pawP[0] - 6} ${pawP[1] - 12} v 7 M ${pawP[0] + 1} ${pawP[1] - 14} v 7 M ${pawP[0] + 8} ${pawP[1] - 12} v 7`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      </g> : null}
      <g transform={headT}>
        <g transform={`rotate(${earRot} -36 -38)`}><path d="M -62 -24 L -52 -86 L -14 -50 Z" fill={fur} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" /><path d="M -53 -36 L -48 -71 L -25 -50 Z" fill={pink} /></g>
        <g transform={`rotate(${-earRot} 36 -38)`}><path d="M 62 -24 L 52 -86 L 14 -50 Z" fill={fur} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" /><path d="M 53 -36 L 48 -71 L 25 -50 Z" fill={pink} /></g>
        <path d="M -58 4 L -82 16 L -60 28 Z M 58 4 L 82 16 L 60 28 Z" fill={fur} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <ellipse cx={0} cy={0} rx={66} ry={56} fill={fur} stroke={INK} strokeWidth={7} />
        <path d="M -12 -54 L -9 -38 M 0 -56 L 0 -39 M 12 -54 L 9 -38 M -65 -2 L -48 1 M -63 11 L -48 9 M 65 -2 L 48 1 M 63 11 L 48 9" stroke={st} strokeWidth={5.5} strokeLinecap="round" />
        <ellipse cx={-12} cy={20} rx={17} ry={13} fill={lt} /><ellipse cx={12} cy={20} rx={17} ry={13} fill={lt} />
        <CatEye x={-27} y={-6} rx={21} ry={17} sd={-1} id={`ce${uid}l`} e={eyeP(-1)} />
        <CatEye x={27} y={-6} rx={21} ry={17} sd={1} id={`ce${uid}r`} e={eyeP(1)} />
        {brows ? <path d={brows} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
        <path d="M -8 9 L 8 9 L 0 18 Z" fill={pink} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        {mouth}
        <path d="M -26 18 L -82 8 M -26 23 L -84 22 M -26 28 L -80 36 M 26 18 L 82 8 M 26 23 L 84 22 M 26 28 L 80 36" stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
      </g>
    </g></W>
  );
};

// ---------- the cat curled up asleep (bottom at 0, 0); open = eyes open, the head lifts ----------
const CatCurl: React.FC<{t: number; x: number; y: number; s: number; nt: number; open: number; glow: number; uid: string; pass?: 'body' | 'glow'}> = ({t, x, y, s, nt, open, glow, uid, pass = 'body'}) => {
  const F = (col: string) => nite(col, nt);
  const fur = F(CATC), st = F(CAT_ST), lt = F(CAT_LT), pink = F(CAT_PINK);
  const breathe = 1 + 0.025 * Math.sin(t * 3) * (1 - open);
  const hy = -50 - 12 * open, hx0 = -60;
  const outer = `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`;
  if (pass === 'glow') {
    if (open < 0.5 || glow < 0.02) return null;
    return <W><g transform={outer}>{[-1, 1].map((sd) => <circle key={sd} cx={hx0 + sd * 16} cy={hy - 4} r={38} fill="url(#glowG)" opacity={glow} />)}</g></W>;
  }
  const tail = cbez([84, -30], [110, 4], [30, 12], [-36, 4]);
  return (
    <W><g transform={outer}>
      <g transform={`translate(10 -44) scale(1 ${breathe.toFixed(3)}) translate(-10 44)`}>
        <ellipse cx={10} cy={-44} rx={86} ry={46} fill={fur} stroke={INK} strokeWidth={7} />
        <path d="M -16 -86 Q -10 -72 -14 -58 M 14 -89 Q 20 -74 16 -60 M 44 -84 Q 50 -70 46 -58" stroke={st} strokeWidth={6} fill="none" strokeLinecap="round" />
      </g>
      <path d={taper(tail, 22, 14)} fill={fur} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[0.4, 0.62, 0.84].map((u, i) => { const q = tail[Math.round(u * (tail.length - 1))]; return <circle key={i} cx={q[0]} cy={q[1]} r={5} fill={st} />; })}
      <ellipse cx={-30} cy={-5} rx={14} ry={8} fill={lt} stroke={INK} strokeWidth={4} />
      <g transform={`translate(${hx0} ${hy})`}>
        <path d="M -40 -14 L -34 -56 L -8 -34 Z M 40 -14 L 34 -56 L 8 -34 Z" fill={fur} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -34 -22 L -31 -46 L -15 -33 Z M 34 -22 L 31 -46 L 15 -33 Z" fill={pink} />
        <ellipse cx={0} cy={0} rx={44} ry={38} fill={fur} stroke={INK} strokeWidth={6.5} />
        <path d="M -8 -36 L -6 -24 M 0 -38 L 0 -26 M 8 -36 L 6 -24" stroke={st} strokeWidth={4.5} strokeLinecap="round" />
        <ellipse cx={-8} cy={14} rx={11} ry={9} fill={lt} /><ellipse cx={8} cy={14} rx={11} ry={9} fill={lt} />
        {open > 0.5
          ? [-1, 1].map((sd) => <CatEye key={sd} x={sd * 16} y={-4} rx={14} ry={11} sd={sd} id={`cc${uid}${sd}`} e={{pw: 1, look: [-0.4, 0], lid: 0, low: 0, glow, shut: '', lidC: fur}} />)
          : [-1, 1].map((sd) => <path key={sd} d={`M ${sd * 16 - 11} -4 Q ${sd * 16} 4 ${sd * 16 + 11} -4`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />)}
        <path d="M -6 6 L 6 6 L 0 12 Z" fill={pink} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
        <path d="M -9 16 Q -4 21 0 16 Q 4 21 9 16" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      </g>
    </g></W>
  );
};

// ---------- sets ----------
const SWITCH: P2 = [20, -205];
/** the living room at night (nt 1) or lit (nt 0); the window always shows the night outside */
const Room: React.FC<{t: number; nt: number; on: number; ball2: number}> = ({t, nt, on, ball2}) => {
  const F = (c: string, k = 0.85) => nite(c, nt, k);
  return (
    <W><g>
      <rect x={-1600} y={-1700} width={3200} height={1790} fill={F('#F4E2C0')} />
      {Array.from({length: 40}, (_, i) => <rect key={i} x={-1570 + i * 80} y={-1700} width={26} height={1790} fill={F('#EDD5AA')} />)}
      <g transform="translate(-340 -440)">
        <rect x={-150} y={-170} width={300} height={330} rx={12} fill="#141A3C" stroke={INK} strokeWidth={9} />
        {[[-100, -120], [-40, -60], [90, -130], [-110, 60], [100, 40], [20, 110], [-60, 120]].map(([x, y], i) =>
          <path key={i} transform={`translate(${x} ${y}) scale(${(0.5 + 0.15 * Math.sin(t * 3 + i)).toFixed(3)})`} d="M 0 -16 Q 3 -3 16 0 Q 3 3 0 16 Q -3 3 -16 0 Q -3 -3 0 -16 Z" fill="#FFF4C2" />)}
        <path d="M 70 -110 A 46 46 0 1 0 110 -40 A 36 36 0 1 1 70 -110 Z" fill="#FFF0B3" stroke={INK} strokeWidth={5} />
        <path d="M 0 -170 V 160 M -150 -5 H 150" stroke={F('#FFFFFF', 0.7)} strokeWidth={13} />
        <rect x={-150} y={-170} width={300} height={330} rx={12} fill="none" stroke={INK} strokeWidth={9} />
        <path d="M -180 -190 Q -150 0 -190 180 L -122 180 Q -100 0 -122 -190 Z" fill={F('#4FA37A')} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 180 -190 Q 150 0 190 180 L 122 180 Q 100 0 122 -190 Z" fill={F('#4FA37A')} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <rect x={-210} y={-206} width={420} height={22} rx={10} fill={F(WOOD)} stroke={INK} strokeWidth={6} />
      </g>
      <g transform="translate(-180 -360)">
        <rect x={-62} y={-48} width={124} height={96} rx={6} fill={F('#FFFFFF', 0.8)} stroke={INK} strokeWidth={7} />
        <path d="M -40 8 Q -10 -26 24 4 Q -10 34 -40 8 Z M 24 4 L 42 -12 L 42 20 Z" fill={F('#7CC0E8')} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={-22} cy={2} r={4} fill={INK} />
      </g>
      <g transform={`translate(${SWITCH[0]} ${SWITCH[1]})`}>
        <rect x={-19} y={-29} width={38} height={58} rx={8} fill={F('#FFFFFF', 0.75)} stroke={INK} strokeWidth={5.5} />
        <rect x={-7} y={on > 0.5 ? -19 : -1} width={14} height={20} rx={4} fill={F('#E9E4D8', 0.75)} stroke={INK} strokeWidth={4} />
      </g>
      <rect x={-1600} y={84} width={3200} height={700} fill={F(FLOORC)} />
      {[160, 260, 400].map((y, i) => <path key={i} d={`M -1600 ${y} H 1600`} stroke={F('#B57C45')} strokeWidth={5} />)}
      <rect x={-1600} y={70} width={3200} height={18} fill={F('#FFFFFF', 0.75)} stroke={INK} strokeWidth={5} />
      <rect x={34} y={-6} width={262} height={98} fill={F(WOOD_DK)} stroke={INK} strokeWidth={7} />
      <path d="M 40 40 H 290" stroke={INK} strokeWidth={6} />
      <circle cx={165} cy={17} r={7} fill={F(GOLD)} stroke={INK} strokeWidth={4} /><circle cx={165} cy={64} r={7} fill={F(GOLD)} stroke={INK} strokeWidth={4} />
      <rect x={20} y={-30} width={290} height={26} rx={6} fill={F(WOOD)} stroke={INK} strokeWidth={7} />
      <g transform="translate(272 -30)">
        <path d="M -16 0 L -10 -60 L 10 -60 L 16 0 Z" fill={F('#7CC0E8')} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -38 -60 L -26 -120 L 26 -120 L 38 -60 Z" fill={on > 0.5 ? '#FFE98A' : F('#F2E4C4')} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </g>
      {ball2 > 0.5 ? <g transform="translate(222 -56)"><YarnG r={26} nt={nt} /></g> : null}
    </g></W>
  );
};
/** the eye-chart wall by day */
const CHART_ROWS = ['E', 'F P', 'T O Z', 'L P E D', 'P E C F D', 'E D F C Z P', 'F E L O P Z D', 'D E F P O T E C'];
const CHART_SIZES = [118, 64, 46, 35, 27, 21, 16, 12];
const ChartWall: React.FC<{t: number}> = ({t}) => (
  <W><g>
    <rect x={-1600} y={-1700} width={3200} height={1790} fill="#DDF0E5" />
    <rect x={-1600} y={-120} width={3200} height={210} fill="#C5E3D3" />
    <rect x={-1600} y={-134} width={3200} height={18} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
    <g transform="translate(-380 -430)">
      <rect x={-130} y={-150} width={260} height={290} rx={12} fill="#BFE6FF" stroke={INK} strokeWidth={9} />
      <g transform={`translate(40 -60) rotate(${(t * 20).toFixed(1)})`}>{Array.from({length: 10}, (_, i) => <path key={i} transform={`rotate(${i * 36})`} d="M -9 -50 L 0 -72 L 9 -50 Z" fill="#FFB938" stroke={INK} strokeWidth={4} strokeLinejoin="round" />)}</g>
      <circle cx={40} cy={-60} r={42} fill={GOLD} stroke={INK} strokeWidth={6} />
      <path d="M 0 -150 V 140 M -130 -5 H 130" stroke="#FFFFFF" strokeWidth={12} />
      <rect x={-130} y={-150} width={260} height={290} rx={12} fill="none" stroke={INK} strokeWidth={9} />
    </g>
    <g transform="translate(150 -330)">
      <rect x={-112} y={-172} width={224} height={344} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
      {CHART_ROWS.map((r, i) => <text key={i} x={0} y={-118 + [0, 70, 120, 160, 192, 218, 240, 258][i]} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={CHART_SIZES[i] * 0.62} fill={INK} letterSpacing={2}>{r}</text>)}
    </g>
    <g transform="translate(360 84)">
      <path d="M -40 0 L -32 -70 L 32 -70 L 40 0 Z" fill="#D9774A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {[[-30, -150, -30], [0, -180, 0], [30, -150, 30], [-50, -110, -50], [50, -110, 50]].map(([x, y, r], i) =>
        <ellipse key={i} cx={x} cy={y} rx={22} ry={48} transform={`rotate(${r} ${x} ${y + 40})`} fill="#5DB36E" stroke={INK} strokeWidth={5} />)}
    </g>
    <rect x={-1600} y={84} width={3200} height={700} fill="#D7AE76" />
    <rect x={-1600} y={70} width={3200} height={18} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
  </g></W>
);
/** the bathroom: tiles, mirror, counter with a sink, a cup with his real toothbrush */
const COUNTER_Y = -52;
const Bathroom: React.FC = () => (
  <W><g>
    <rect x={-1600} y={-1700} width={3200} height={1790} fill="#D3ECF6" />
    {Array.from({length: 30}, (_, i) => <path key={'v' + i} d={`M ${-900 + i * 64} -1700 V 90`} stroke="#ABD5E8" strokeWidth={4} />)}
    {Array.from({length: 30}, (_, i) => <path key={'h' + i} d={`M -1600 ${90 - i * 64} H 1600`} stroke="#ABD5E8" strokeWidth={4} />)}
    <rect x={-10} y={-470} width={380} height={250} rx={26} fill="#EAF8FF" stroke={INK} strokeWidth={9} />
    <path d="M 40 -300 L 120 -420 M 90 -280 L 150 -370" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" />
    <rect x={-66} y={COUNTER_Y + 22} width={492} height={120} fill={WOOD_DK} stroke={INK} strokeWidth={7} />
    <path d="M 180 -30 V 90" stroke={INK} strokeWidth={6} />
    <circle cx={160} cy={20} r={7} fill={GOLD} stroke={INK} strokeWidth={4} /><circle cx={200} cy={20} r={7} fill={GOLD} stroke={INK} strokeWidth={4} />
    <rect x={-80} y={COUNTER_Y} width={520} height={24} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <ellipse cx={262} cy={COUNTER_Y + 4} rx={66} ry={12} fill="#DDE7EC" stroke={INK} strokeWidth={5} />
    <path d={`M 262 ${COUNTER_Y} V ${COUNTER_Y - 44} Q 262 ${COUNTER_Y - 62} 244 ${COUNTER_Y - 62} H 232 V ${COUNTER_Y - 48}`} stroke={INK} strokeWidth={17} fill="none" strokeLinejoin="round" />
    <path d={`M 262 ${COUNTER_Y} V ${COUNTER_Y - 44} Q 262 ${COUNTER_Y - 62} 244 ${COUNTER_Y - 62} H 232 V ${COUNTER_Y - 48}`} stroke="#B9C4CC" strokeWidth={8} fill="none" strokeLinejoin="round" />
    <g transform={`translate(384 ${COUNTER_Y})`}>
      <path d="M 2 -64 L 14 -132 L 26 -130 L 16 -64 Z" fill="#4FB06A" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d="M 12 -132 L 10 -150 M 18 -133 L 17 -152 M 24 -132 L 25 -150" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <path d="M -26 0 L -30 -70 L 30 -70 L 26 0 Z" fill="#7CB8F0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
    <g transform={`translate(330 ${COUNTER_Y - 12})`}>
      <path d="M -40 -10 L 24 -12 L 30 0 L 24 12 L -40 10 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <rect x={28} y={-8} width={16} height={16} rx={3} fill={RED} stroke={INK} strokeWidth={4} />
    </g>
    <rect x={-1600} y={84} width={3200} height={700} fill="#EDEDED" />
    {Array.from({length: 26}, (_, i) => <path key={'f' + i} d={`M ${-900 + i * 90} 84 V 700`} stroke="#D5D5D5" strokeWidth={4} />)}
  </g></W>
);
/** the nap corner: a window (sun -> moon), a rug; nt 0 day -> 1 night */
const Nook: React.FC<{t: number; nt: number}> = ({t, nt}) => {
  const F = (c: string, k = 0.85) => nite(c, nt, k);
  const sky = mix('#BFE6FF', '#141A3C', nt), sunY = lerp(-60, 210, eio(clamp(nt * 1.2))), moonY = lerp(240, -70, eio(clamp(nt * 1.4 - 0.25)));
  return (
    <W><g>
      <rect x={-1600} y={-1700} width={3200} height={1790} fill={F('#F7DCBD')} />
      {Array.from({length: 40}, (_, i) => <circle key={i} cx={-1580 + (i % 20) * 160} cy={-1000 + Math.floor(i / 20) * 600 + 340} r={10} fill={F('#F0CCA4')} />)}
      <g transform="translate(-150 -380)">
        <defs><clipPath id="nookwin"><rect x={-150} y={-160} width={300} height={320} rx={12} /></clipPath></defs>
        <rect x={-150} y={-160} width={300} height={320} rx={12} fill={sky} />
        <g clipPath="url(#nookwin)">
          {nt < 0.9 ? <g transform={`translate(50 ${sunY.toFixed(1)})`}>
            {Array.from({length: 10}, (_, i) => <path key={i} transform={`rotate(${i * 36 + t * 20})`} d="M -9 -52 L 0 -74 L 9 -52 Z" fill="#FFB938" stroke={INK} strokeWidth={4} strokeLinejoin="round" />)}
            <circle r={44} fill={GOLD} stroke={INK} strokeWidth={6} /></g> : null}
          {nt > 0.3 ? <g opacity={clamp((nt - 0.3) / 0.4)}>
            {[[-100, -110], [-40, -40], [90, -120], [-100, 70], [100, 50]].map(([x, y], i) =>
              <path key={i} transform={`translate(${x} ${y}) scale(0.5)`} d="M 0 -16 Q 3 -3 16 0 Q 3 3 0 16 Q -3 3 -16 0 Q -3 -3 0 -16 Z" fill="#FFF4C2" />)}
            <path transform={`translate(-40 ${moonY.toFixed(1)})`} d="M 0 -40 A 40 40 0 1 0 34 20 A 31 31 0 1 1 0 -40 Z" fill="#FFF0B3" stroke={INK} strokeWidth={5} />
          </g> : null}
        </g>
        <path d="M 0 -160 V 160 M -150 0 H 150" stroke={F('#FFFFFF', 0.7)} strokeWidth={12} />
        <rect x={-150} y={-160} width={300} height={320} rx={12} fill="none" stroke={INK} strokeWidth={9} />
        <path d="M -182 -180 Q -152 0 -192 176 L -126 176 Q -104 0 -126 -180 Z" fill={F('#E07A5F')} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 182 -180 Q 152 0 192 176 L 126 176 Q 104 0 126 -180 Z" fill={F('#E07A5F')} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      </g>
      <g transform="translate(330 84)">
        <path d="M -42 0 L -34 -74 L 34 -74 L 42 0 Z" fill={F('#6FA8DC')} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {[[-30, -150, -30], [0, -184, 0], [30, -150, 30]].map(([x, y, r], i) =>
          <ellipse key={i} cx={x} cy={y} rx={22} ry={50} transform={`rotate(${r} ${x} ${y + 40})`} fill={F('#5DB36E')} stroke={INK} strokeWidth={5} />)}
      </g>
      <rect x={-1600} y={84} width={3200} height={700} fill={F(FLOORC)} />
      <rect x={-1600} y={70} width={3200} height={18} fill={F('#FFFFFF', 0.75)} stroke={INK} strokeWidth={5} />
      <ellipse cx={60} cy={118} rx={360} ry={56} fill={F('#E86A4E')} stroke={INK} strokeWidth={7} />
      <ellipse cx={60} cy={118} rx={300} ry={40} fill="none" stroke={F('#F3C35A')} strokeWidth={9} />
    </g></W>
  );
};

// ---------- inserts (screen space) ----------
/** X-RAY: CAT EYE - the eye from the side: light comes in through the pupil, crosses the retina, hits the mirror and goes back out */
const XRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 400;
  const mir = popIn(t, T.mirror - 0.05, 0.3);
  const inU = eio(seg(t, BEAM0, BEAM1)), outU = eio(seg(t, BEAM1, BEAM2));
  const A: P2 = [-470, -44], B: P2 = [252, -30], C: P2 = [-470, 12];
  const pIn = lp2(A, B, inU), pOut = lp2(B, C, outU);
  const flash1 = pulse2(t, BEAM1 - 0.08), flash2 = pulse2(t, BEAM1 + 0.12);
  const shine = 0.5 + 0.5 * Math.sin(t * 9);
  const eyeshine = seg(t, BEAM2 - 0.2, BEAM2 + 0.1);
  return (
    <div style={{position: 'absolute', left: 540, top: 900, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <defs>
          <clipPath id="xclip"><circle r={R} /></clipPath>
          <linearGradient id="tapG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4FD1C5" /><stop offset="0.5" stopColor="#F6E05E" /><stop offset="1" stopColor="#4FD1C5" /></linearGradient>
          <radialGradient id="shineG"><stop offset="0" stopColor="#F3FFA6" stopOpacity={0.95} /><stop offset="1" stopColor="#F3FFA6" stopOpacity={0} /></radialGradient>
        </defs>
        <circle r={R + 22} fill={INK} />
        <g clipPath="url(#xclip)">
          <circle r={R} fill="#1D2650" />
          {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${-400 + i * 100} -400 V 400 M -400 ${-400 + i * 100} H 400`} stroke="#2C3870" strokeWidth={3} />)}
          <g transform="translate(40 0)">
            <circle r={292} fill="#F5F1E6" stroke={INK} strokeWidth={8} />
            <path d="M 300 -40 Q 360 -30 420 -60 L 430 30 Q 360 40 300 40 Z" fill="#F2D58A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <path d={arcBand(262, 284, -66, 66)} fill="url(#tapG)" stroke={INK} strokeWidth={5} />
            {[[-40, 1], [-10, 0.6], [24, 1], [52, 0.7]].map(([a, k], i) => { const p = rot2([273, 0], a); return <path key={i} transform={`translate(${P(p)}) scale(${(0.35 + 0.25 * k * (i % 2 ? shine : 1 - shine)).toFixed(3)})`} d="M 0 -16 Q 3 -3 16 0 Q 3 3 0 16 Q -3 3 -16 0 Q -3 -3 0 -16 Z" fill="#FFFFFF" />; })}
            <path d={arcBand(238, 262, -82, 82)} fill="#F07C8A" stroke={INK} strokeWidth={5} />
            {Array.from({length: 14}, (_, i) => { const a = -78 + i * 12, p0 = rot2([241, 0], a), p1 = rot2([259, 0], a);
              return <path key={i} d={`M ${P(p0)} L ${P(p1)}`} stroke="#B8475A" strokeWidth={4} strokeLinecap="round" />; })}
            <path d="M -262 -158 Q -352 0 -262 158" fill="#DDF3FF" stroke={INK} strokeWidth={6} />
            <rect x={-262} y={-182} width={22} height={124} rx={8} fill={IRIS} stroke={INK} strokeWidth={5} />
            <rect x={-262} y={58} width={22} height={124} rx={8} fill={IRIS} stroke={INK} strokeWidth={5} />
            <ellipse cx={-196} cy={0} rx={46} ry={88} fill="#E9F6FF" stroke={INK} strokeWidth={5} />
            {inU > 0.001 ? <g>
              <path d={`M ${P(A)} L ${P(pIn)}`} stroke={INK} strokeWidth={28} strokeLinecap="round" />
              <path d={`M ${P(A)} L ${P(pIn)}`} stroke="#FFE45C" strokeWidth={16} strokeLinecap="round" />
            </g> : null}
            {outU > 0.001 ? <g>
              <path d={`M ${P(B)} L ${P(pOut)}`} stroke={INK} strokeWidth={28} strokeLinecap="round" />
              <path d={`M ${P(B)} L ${P(pOut)}`} stroke="#FFE45C" strokeWidth={16} strokeLinecap="round" />
            </g> : null}
            {flash1 > 0.01 ? <circle cx={246} cy={-32} r={46 * flash1} fill="url(#shineG)" /> : null}
            {flash2 > 0.01 ? <circle cx={246} cy={-28} r={52 * flash2} fill="url(#shineG)" /> : null}
            {t > BEAM1 - 0.08 ? <NumBadge x={196} y={-104} n="1" s={popIn(t, BEAM1 - 0.08, 0.24)} /> : null}
            {t > BEAM2 - 0.1 ? <NumBadge x={196} y={56} n="2" s={popIn(t, BEAM2 - 0.1, 0.24)} /> : null}
            {eyeshine > 0.01 ? <circle cx={-300} cy={6} r={120 * eyeshine} fill="url(#shineG)" opacity={0.9} /> : null}
            {mir > 0.01 ? <g transform={`translate(40 -200) scale(${mir})`}>
              <path d="M 96 26 L 168 52" stroke={INK} strokeWidth={12} strokeLinecap="round" />
              <path d="M 146 66 L 170 53 L 152 34" stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              <text x={0} y={0} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={GOLD} stroke={INK} strokeWidth={11} style={{paintOrder: 'stroke'}}>MIRROR</text>
            </g> : null}
          </g>
        </g>
        <circle r={R} fill="none" stroke="#8C98AE" strokeWidth={22} />
        <circle r={R + 14} fill="none" stroke={INK} strokeWidth={6} />
      </svg>
    </div>
  );
};
const pulse2 = (t: number, a: number) => (t < a ? 0 : Math.max(0, 1 - (t - a) / 0.35) * eout(clamp((t - a) / 0.08)));
const arcBand = (r0: number, r1: number, a0: number, a1: number) => {
  const p = (r: number, a: number) => P(rot2([r, 0], a));
  return `M ${p(r1, a0)} A ${r1} ${r1} 0 0 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 0 0 ${p(r0, a0)} Z`;
};
const NumBadge: React.FC<{x: number; y: number; n: string; s: number}> = ({x, y, n, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s.toFixed(3)})`}>
    <circle r={34} fill={GOLD} stroke={INK} strokeWidth={7} />
    <text x={0} y={3} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={INK}>{n}</text>
  </g>
);
/** two eye charts: YOU (sharp) and CAT EYES (blurs) */
const EyeChart: React.FC<{blur: number}> = ({blur}) => (
  <div style={{width: 420, height: 640, background: '#FFFFFF', border: `9px solid ${INK}`, borderRadius: 20, boxShadow: `0 9px 0 ${INK}`, overflow: 'hidden', position: 'relative'}}>
    <div style={{position: 'absolute', inset: 0, filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 18}}>
      {CHART_ROWS.map((r, i) => <div key={i} style={{fontFamily: FONT, fontWeight: 900, fontSize: CHART_SIZES[i], lineHeight: 1.12, letterSpacing: CHART_SIZES[i] * 0.18, color: INK, whiteSpace: 'nowrap'}}>{r}</div>)}
    </div>
  </div>
);
const Charts: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const u = eio(seg(t, BL0, BL1));
  return (
    <div style={{position: 'absolute', left: 540, top: 930, transform: `translate(-50%,-50%) scale(${s})`, display: 'flex', gap: 34}}>
      <div style={{transform: 'rotate(-2deg)'}}><EyeChart blur={0} /></div>
      <div style={{transform: 'rotate(2deg)'}}><EyeChart blur={lerp(0, 7.5, u)} /></div>
    </div>
  );
};
/** the selfie: both of them in the dark, four blazing eyes */
const Polaroid: React.FC<{t: number; s: number}> = ({t, s}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top: 1030, transform: `translate(-50%,-50%) rotate(-6deg) scale(${s})`, background: '#FFFDF6', border: `9px solid ${INK}`,
    borderRadius: 16, padding: '24px 24px 86px', boxShadow: `0 10px 0 ${INK}`}}>
    <svg width={520} height={440} viewBox="-260 -220 520 440" style={{display: 'block'}}>
      <defs><radialGradient id="polG"><stop offset="0" stopColor="#FFFFFF" stopOpacity={1} /><stop offset="0.3" stopColor="#F3FFA6" stopOpacity={0.9} /><stop offset="1" stopColor="#E3FF7A" stopOpacity={0} /></radialGradient></defs>
      <rect x={-260} y={-220} width={520} height={440} fill="#151A36" />
      <g transform="translate(-100 40)">
        <circle r={122} fill="#7D88B3" stroke={INK} strokeWidth={8} />
        <path d="M -44 52 Q 0 84 44 52" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
        {[-1, 1].map((sd) => <g key={sd}><circle cx={sd * 46} cy={-14} r={74} fill="url(#polG)" /><circle cx={sd * 46} cy={-14} r={30} fill="#FFFFFF" stroke={INK} strokeWidth={5} /></g>)}
      </g>
      <g transform="translate(125 20)">
        <path d="M -82 -50 L -70 -128 L -24 -78 Z M 82 -50 L 70 -128 L 24 -78 Z" fill="#6B5A57" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <ellipse rx={92} ry={78} fill="#6B5A57" stroke={INK} strokeWidth={8} />
        {[-1, 1].map((sd) => <g key={sd}><circle cx={sd * 36} cy={-10} r={64} fill="url(#polG)" /><circle cx={sd * 36} cy={-10} r={25} fill="#FFFFFF" stroke={INK} strokeWidth={5} /></g>)}
        <path d="M -8 22 L 8 22 L 0 31 Z" fill="#B97A80" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      </g>
    </svg>
    <div style={{position: 'absolute', left: 0, right: 0, bottom: 14, textAlign: 'center', fontFamily: FONT, fontWeight: 900, fontSize: 48, color: INK}}>say cheese</div>
  </div>
) : null;

// ---------- the story over time ----------
const GX = -70;                      // the guy in the room (hip x)
const NAP_X = 66;                    // his hip on the rug (lying, head to the left)
const CAT_ROOM: P2 = [116, -30];     // the cat on the dresser
const HAND0: P2 = [26, -238];        // his catching hand (world) at frame 0
const nightAt = (t: number) => (t < S2 ? (t < LIGHTS ? 1 : 1 - seg(t, LIGHTS, LIGHTS + 0.05)) : t < S4 ? 0 : t < S6 ? 1 : t < S8 ? 0 : seg(t, DUSK0, DUSK1));
const ball1At = (t: number): {p: P2; rot: number; held: boolean} | null => {
  if (t < CATCH) { const u = t / CATCH; return {p: [lerp(102, HAND0[0] + 3, u), lerp(-302, HAND0[1] - 20, u) - 14 * Math.sin(Math.PI * u)], rot: -900 * t, held: false}; }
  return null;
};
const guyAt = (t: number): GS | null => {
  const nt = nightAt(t);
  if (t < S2) {
    const skin = mix(WHITE, NSKIN, nt);
    const pw = t < LIGHTS ? 1 : lerp(1, 0.07, eio(seg(t, LIGHTS + 0.02, SNAP)));
    const toss = t > 0.82 && t < 1.18 ? Math.sin(Math.PI * seg(t, 0.82, 1.18)) : 0;
    const armB: P2 = t < CATCH ? armTo(GX, 0, [HAND0[0] + 10, HAND0[1] - 6]) : add(armTo(GX, 0, HAND0), [0, 10 * hit(t, CATCH, 1, 9) - 26 * toss]);
    const mood: Mood = t < CATCH ? 'joy' : t < LIGHTS ? (t < 0.6 ? 'grin' : 'smug') : 'pop';
    return {...BASE, x: GX, y: 0, mood, armB, armA: [-60, 58 - 4 * Math.sin(t * 3)], skin, nt, pw, glow: nt, hold: t >= CATCH ? 'yarn' : '', holdRot: -900 * CATCH - 260 * toss,
      look: t < CATCH ? [0.9, -0.6] : t < 1.3 ? [1, 0] : [0.9, -0.3], sq: hit(t, CATCH, 0.7, 9) + hit(t, LIGHTS, 0.6, 9), tilt: -3 + 2 * Math.sin(t * 2.2)};
  }
  if (t < S3) return null;
  if (t < S4) {
    const h = hit(t, BONK, 1, 5);
    return {...BASE, x: GX, y: 0, rot: -7 * h, tilt: -14 * h + 4 * Math.sin(t * 7) * (t > 2.8 ? 1 : 0), mood: t < BONK + 0.42 ? 'oof' : 'dazed', pw: 0.07,
      armA: lp2([-70, -40], [-56, 60], seg(t, BONK + 0.3, BONK + 0.8)), armB: lp2([74, -50], [58, 60], seg(t, BONK + 0.3, BONK + 0.8)), sq: hit(t, BONK, 1.1, 6)};
  }
  if (t < S5) return null;
  if (t < S6) {
    const flashU = t >= FLASH ? 1 - seg(t, FLASH, FLASH + 0.3) : 0;
    return {...BASE, x: GX, y: 0, skin: NSKIN, nt: 1, pw: 1, glow: 1, mood: t < FLASH ? 'grin' : t < PHOTO + 0.05 ? 'pop' : 'joy', armA: [-56, 60],
      armB: armTo(GX, 0, [40, -262 + 4 * Math.sin(t * 5)]), hold: 'phone', holdRot: -12, led: flashU, look: [0.8, -0.8], tilt: 6, sq: hit(t, FLASH, 0.6, 8)};
  }
  if (t < S7) return {...BASE, x: -128, y: 0, mood: 'squint', pw: 0.07, look: [1, -0.5], armA: [-58, 60], armB: armTo(-128, 0, [-104, -214]), tilt: 6 + 2 * Math.sin(t * 2), sq: 0.12 * Math.sin(t * 6)};
  if (t < S8) {
    const gx = -110, mouth: P2 = [gx + 26, -134];
    const tip = tailTipAt(t);
    let hand: P2 = tip ? tip : [gx + 120, -60];
    if (t < GRAB) hand = lp2([gx + 70, 40], [gx + 132, -66], eio(seg(t, S7, GRAB)));
    return {...BASE, x: gx, y: 0, mood: t < BRUSH0 ? 'squint' : 'foam', pw: 0.07, look: t < BRUSH0 ? [1, 0.4] : [0.5, -0.2], armA: [-58, 60], armB: armTo(gx, 0, hand),
      tilt: t < BRUSH0 ? 8 : 4 + 2 * Math.sin(t * 16), sq: t > BRUSH0 ? 0.06 * Math.sin(t * 32) : 0};
  }
  // the nap on the rug: lying on his side, head to the left; the head lifts when the eyes pop open
  const wake = t >= OPEN ? eout(seg(t, OPEN, OPEN + 0.25)) : 0;
  const skin = mix(WHITE, NSKIN, nt);
  return {...BASE, x: NAP_X, y: 28, rot: -90, tilt: lerp(-62, -18, wake) + spring(t, OPEN, 6, 3, 6), mood: t < OPEN ? 'sleep' : t < OPEN + 0.3 ? 'grin' : 'smug', skin, nt,
    pw: 1, glow: wake * nt, armA: [-22, -20], armB: [-58, -30], footA: [-18, 46], footB: [20, 40], look: [-0.6, 0], sq: 0.04 * Math.sin(t * 3) * (1 - wake) + hit(t, OPEN, 0.6, 8)};
};
/** the cat's tail tip in the bathroom (world), once he has hold of it */
const CAT_BATH: P2 = [118, COUNTER_Y];
const tailTipAt = (t: number): P2 | null => {
  if (t < S7 || t >= S8) return null;
  const rest: P2 = [26, COUNTER_Y - 14], gx = -110, mouth: P2 = [gx + 30, -130];
  if (t < GRAB) return rest;
  if (t < LIFT) return lp2(rest, [rest[0] - 6, rest[1] - 20], eio(seg(t, GRAB, LIFT)));
  if (t < BRUSH0) return lp2([rest[0] - 6, rest[1] - 20], mouth, eio(seg(t, LIFT + 0.04, BRUSH0)));
  return [mouth[0] + 14 * Math.sin((t - BRUSH0) * 2 * Math.PI * 4), mouth[1] + 3 * Math.cos((t - BRUSH0) * 2 * Math.PI * 8)];
};
const catAt = (t: number): CS | null => {
  const nt = nightAt(t);
  if (t < S3) {
    const pw = t < LIGHTS ? 1 : lerp(1, 0.06, eio(seg(t, LIGHTS + 0.02, SNAP)));
    let paw = 0, pawTo: P2 = [-80, -150], pawSide = -1;
    if (t >= RAISE && t < 1.92) { paw = eio(seg(t, RAISE, FLIP)) * (1 - eio(seg(t, 1.8, 1.92))); pawTo = add(toCat({...C_BASE, x: CAT_ROOM[0], y: CAT_ROOM[1]}, SWITCH), [6, 14]); }
    else if (t >= S2) { paw = Math.sin(Math.PI * seg(t, 1.94, 2.12)); pawTo = [70, -96]; pawSide = 1; }
    const mood: CMood = t < 0.3 ? 'wide' : t < LIGHTS ? 'smug' : t < S2 ? 'smug' : 'smug';
    return {...C_BASE, x: CAT_ROOM[0], y: CAT_ROOM[1], nt, glow: nt, pw, mood, paw, pawTo, pawSide, look: t < CATCH ? [-0.8, -0.9] : t < RAISE ? [-1, 0] : [-0.6, -0.6], tilt: -4 + 3 * Math.sin(t * 2)};
  }
  if (t < S4) return null;
  if (t < S5) {
    const mood: CMood = t < 4.6 ? 'smug' : 'wide';
    return {...C_BASE, x: CAT_ROOM[0], y: CAT_ROOM[1], nt: 1, glow: 1, pw: 1, mood, look: [0.1 * Math.sin(t * 1.3), 0], tilt: 5 * Math.sin(t * 1.1)};
  }
  if (t < S6) return {...C_BASE, x: CAT_ROOM[0], y: CAT_ROOM[1], nt: 1, glow: 1, pw: 1, mood: t < PHOTO + 0.05 ? 'smug' : 'happy', look: [-0.3, -0.4], tilt: -12};
  if (t < S7) return {...C_BASE, x: 72, y: 86, s: 0.7, mood: 'smug', look: [-1, -0.3], tilt: -6};
  if (t < S8) {
    const tip = tailTipAt(t)!;
    const c: CS = {...C_BASE, x: CAT_BATH[0], y: CAT_BATH[1], s: 0.9, look: [-1, 0.2],
      mood: t < GRAB ? 'smug' : t < BRUSH0 ? 'wide' : t < HISS ? 'shock' : 'hiss', pw: t < BRUSH0 ? 0.06 : 0.03, ears: t >= HISS ? eout(seg(t, HISS, HISS + 0.12)) : 0,
      puff: t >= HISS ? eout(seg(t, HISS, HISS + 0.14)) : 0, paste: t >= PASTE ? popIn(t, PASTE, 0.2) : 0, tilt: t >= HISS ? 4 * Math.sin(t * 40) * (1 - seg(t, HISS, HISS + 0.4)) : -6};
    c.tailTo = toCat(c, tip);
    return c;
  }
  return null;
};

const camFor = (t: number) => camAt([
  {t: 0, x: 24, y: -186, k: 3.05}, {t: S2 - 0.001, x: 14, y: -192, k: 3.3},                    // frame 0: the dark room, the catch; lights on
  {t: S2, x: 150, y: -170, k: 2.6}, {t: S3 - 0.001, x: 150, y: -170, k: 2.85},                  // HIS VIEW (blurred)
  {t: S3, x: -66, y: -182, k: 3.6}, {t: S4 - 0.001, x: -62, y: -172, k: 3.75},                  // BONK close-up
  {t: S4, x: 116, y: -190, k: 3.45}, {t: S4X, x: 116, y: -194, k: 3.75}, {t: S5 - 0.001, x: 116, y: -194, k: 3.85},   // the cat in the dark, X-ray
  {t: S5, x: 34, y: -160, k: 2.3}, {t: S6 - 0.001, x: 34, y: -166, k: 2.45},                    // the selfie
  {t: S6, x: 20, y: -220, k: 2.1}, {t: S7 - 0.001, x: 20, y: -220, k: 2.2},                     // the eye chart (behind the charts)
  {t: S7, x: 10, y: -150, k: 2.4}, {t: S8 - 0.001, x: 10, y: -160, k: 2.6},                     // the bathroom
  {t: S8, x: 60, y: -110, k: 2.1}, {t: PUSH, x: 60, y: -116, k: 2.3},                           // the nap -> night
] as Key[], t);

export const CatScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string; thumbG?: Partial<GS>; thumbC?: Partial<CS>}> = ({t, camK, thumb, uid = 'm', thumbG, thumbC}) => {
  const c0 = camK ? {x: camK.x, y: camK.y, k: camK.k} : (() => { const c = camFor(t); return {x: c.x, y: c.y, k: 1000 / (1000 - c.z)}; })();
  const sh = shake(t, hit(t, CATCH, 3, 9) + hit(t, LIGHTS, 3, 9) + hit(t, BONK, 10, 7) + hit(t, FLASH, 4, 8) + hit(t, HISS, 6, 7) + hit(t, OPEN, 3, 8));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const k = c0.k;
  const nt = nightAt(t);
  const g0 = guyAt(t), cat0 = catAt(t);
  const g = g0 && thumbG ? {...g0, ...thumbG} : g0;
  const cat = cat0 && thumbC ? {...cat0, ...thumbC} : cat0;
  const pov = t >= S2 && t < S3;
  const roomSet = t < S6, chartSet = t >= S6 && t < S7, bathSet = t >= S7 && t < S8, nookSet = t >= S8;
  const b1 = ball1At(t);
  // the second ball: off the dresser at the camera (POV, screen space), then off his face (world)
  const b2u = seg(t, BAT, BONK);
  const b2Bounce: P2 | null = t >= BONK && t < BONK + 0.7 ? (() => { const u = t - BONK; return [GX + 24 + 330 * u, -176 - 380 * u + 700 * u * u] as P2; })() : null;
  const dropBall: P2 | null = t >= BONK && t < S4 ? [HAND0[0] + 12 + 40 * (t - BONK), HAND0[1] + 900 * (t - BONK) ** 2] : null;
  // inserts
  const xS = popIn(t, S4X + 0.02, 0.32) * (1 - seg(t, S5 - 0.14, S5)) * inS(t, S4X, S5);
  const vsS = popIn(t, BEAM2 - 0.06, 0.28) * inS(t, S4X, S5) * (1 - seg(t, S5 - 0.14, S5));
  const chS = popIn(t, S6X, 0.32) * inS(t, S6X, S7) * (1 - seg(t, S7 - 0.14, S7));
  const blurV = 1 + Math.round(6 * eio(seg(t, BL0, BL1)));
  const polS = popIn(t, PHOTO, 0.3) * inS(t, PHOTO, S6);
  const flashA = t >= FLASH && t < S6 ? 1 - seg(t, FLASH, FLASH + 0.22) : 0;
  const lightsA = t >= LIGHTS && t < S2 ? 0.8 * (1 - seg(t, LIGHTS, LIGHTS + 0.14)) : 0;
  const dimA = xS > 0.01 ? 0.45 * xS : chS > 0.01 ? 0.35 * chS : 0;
  const head = g ? add([g.x, g.y], rot2([0, NECK], g.rot)) : [0, 0] as P2;
  const stk = {
    catch: popIn(t, CATCH, 0.2) * inS(t, CATCH, 1.0) * (1 - seg(t, 0.9, 1.0)),
    click: popIn(t, FLIP, 0.18) * inS(t, FLIP, S2),
    bonk: popIn(t, BONK, 0.18) * inS(t, BONK, S4), blurry: popIn(t, T.everything, 0.24) * inS(t, S3, S4),
    night: popIn(t, T.built - 0.02, 0.26) * inS(t, S4, S4X),
    glow: popIn(t, T.glow, 0.24) * inS(t, S5, S6),
    byday: popIn(t, T.day - 0.02, 0.26) * inS(t, S6, S6X + 0.1) * (1 - seg(t, S6X, S6X + 0.1)),
    onlyE: popIn(t, 12.05, 0.28) * inS(t, S6X, S7) * (1 - seg(t, S7 - 0.14, S7)),
    brush: popIn(t, BRUSH0 + 0.06, 0.24) * inS(t, S7, HISS), hiss: popIn(t, HISS, 0.2) * inS(t, HISS, S8),
    nap: popIn(t, T.naps - 0.02, 0.26) * inS(t, S8, DUSK0 + 0.2) * (1 - seg(t, DUSK0 + 0.1, DUSK0 + 0.2)), awake: popIn(t, OPEN + 0.04, 0.24) * (1 - seg(t, PUSH - 0.12, PUSH)) * inS(t, OPEN, DURATION),
  };
  const z = (n: number) => n / k;   // screen px -> world units at this zoom
  const zzz = (x: number, y: number, seed: number) => t >= S8 && t < OPEN ? [0, 1, 2].map((i) => {
    const ph = ((t - S8) * 0.7 + i / 3 + seed) % 1;
    return <Txt key={seed + '-' + i} x={x + 30 * ph + 8 * Math.sin(ph * 8)} y={y - 120 * ph} s={Math.sin(Math.PI * ph)} text="Z" size={z(52 + 22 * i)} rot={-10} fill="#FFFFFF" />;
  }) : null;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id="wFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
        <radialGradient id="glowG"><stop offset="0.3" stopColor="#F6FFC0" stopOpacity={0.85} /><stop offset="0.55" stopColor="#E6FF80" stopOpacity={0.35} /><stop offset="1" stopColor="#D6FF55" stopOpacity={0} /></radialGradient>
      </defs></svg>
      <Layer cam={cam} z={1000} blur={pov ? 15 : t >= S3 && t < S4 ? 5 : 0}>
        {roomSet ? <Room t={t} nt={nt} on={t >= FLIP && t < S4 ? 1 : 0} ball2={t < BAT ? 1 : 0} /> : null}
        {chartSet ? <ChartWall t={t} /> : null}
        {bathSet ? <Bathroom /> : null}
        {nookSet ? <Nook t={t} nt={nt} /> : null}
        {pov && cat ? <Cat t={t} c={cat} uid={uid + 'p'} /> : null}
      </Layer>
      {pov ? null : <Layer cam={cam} z={1000}>
        {g ? <Guy t={t} g={g} uid={uid} /> : null}
        {cat ? <Cat t={t} c={cat} uid={uid} /> : null}
        {nookSet ? <CatCurl t={t} x={214} y={92} s={0.9} nt={nt} open={t >= OPEN ? 1 : 0} glow={nt} uid={uid} /> : null}
        {bathSet && g && t >= GRAB ? <W><circle cx={tailTipAt(t)![0] + 6} cy={tailTipAt(t)![1] + 10} r={13} fill={WHITE} stroke={INK} strokeWidth={5.5} /></W> : null}
        {b1 ? <Yarn x={b1.p[0]} y={b1.p[1]} rot={b1.rot} nt={nt} streak={[0.76, -0.65]} /> : null}
        {b2Bounce ? <Yarn x={b2Bounce[0]} y={b2Bounce[1]} rot={600 * (t - BONK)} /> : null}
        {dropBall ? <Yarn x={dropBall[0]} y={dropBall[1]} r={24} rot={-300 * (t - BONK)} /> : null}
        {t >= BONK + 0.3 && t < S4 && g ? [0, 1, 2].map((i) => { const a = t * 5 + (i * Math.PI * 2) / 3; return <Star key={i} x={head[0] + Math.cos(a) * 82} y={head[1] - 86 + Math.sin(a) * 18} s={0.75} rot={t * 200} />; }) : null}
        {zzz(head[0] - 10, head[1] - 70, 0)}{zzz(214 - 70, 92 - 120, 0.5)}
      </Layer>}
      {pov ? null : <Layer cam={cam} z={1000} paper={false}>
        {g ? <Guy t={t} g={g} uid={uid + 'g'} pass="glow" /> : null}
        {cat ? <Cat t={t} c={cat} uid={uid + 'g'} pass="glow" /> : null}
        {nookSet ? <CatCurl t={t} x={214} y={92} s={0.9} nt={nt} open={t >= OPEN ? 1 : 0} glow={nt} uid={uid + 'g'} pass="glow" /> : null}
        {nookSet && nt < 0.98 ? <W><path d="M -300 -230 L -10 -230 L 330 120 L -60 140 Z" fill="#FFE9A0" opacity={0.36 * (1 - nt)} /></W> : null}
      </Layer>}
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={HAND0[0] + 6} y={HAND0[1] - 70} s={stk.catch} text="CATCH" size={z(88)} rot={-6} fill={GOLD} />
        <Txt x={SWITCH[0] + 2} y={SWITCH[1] - 66} s={stk.click} text="CLICK" size={z(80)} rot={6} fill="#FFFFFF" />
        <Txt x={GX + 70} y={-270} s={stk.bonk} text="BONK" size={z(120)} rot={-8} fill={GOLD} />
        <Txt x={GX} y={-40} s={stk.blurry} text="BLURRY" size={z(120)} rot={4} fill="#FFFFFF" />
        <Txt x={116} y={-62} s={stk.night} text="NIGHT MODE" size={z(104)} rot={-4} fill={GOLD} />
        <Txt x={20} y={-430} s={stk.glow} text="GLOW" size={z(130)} rot={-6} fill={GOLD} />
        <Txt x={-70} y={-420} s={stk.byday} text="BY DAY" size={z(120)} rot={-5} fill="#FFFFFF" />
        <Txt x={-30} y={-345} s={stk.brush} text="BRUSH BRUSH" size={z(90)} rot={-5} fill="#FFFFFF" />
        <Txt x={140} y={-330} s={stk.hiss} text="HISS" size={z(120)} rot={8} fill={RED} />
        <Txt x={40} y={-430} s={stk.nap} text="NAP TIME" size={z(110)} rot={-4} fill="#FFFFFF" />
        <Txt x={40} y={-430} s={stk.awake} text="WIDE AWAKE" size={z(104)} rot={-4} fill={GOLD} />
      </Layer>}
      {pov ? <>
        {b2u > 0 ? (() => { const u = eio(b2u), r = lerp(70, 820, u * u), x = lerp(740, 540, u), y = lerp(1060, 980, u);
          return <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, filter: 'blur(14px)'}}>
            <svg width={2 * r} height={2 * r} viewBox="-30 -30 60 60"><YarnG r={26} rot={-300 * t} /></svg></div>; })() : null}
        {thumb ? null : <Card text="HIS VIEW" top={330} rot={-3} size={60} s={popIn(t, S2 + 0.02, 0.22)} />}
      </> : null}
      {dimA > 0.01 ? <AbsoluteFill style={{background: '#0D1230', opacity: dimA}} /> : null}
      {thumb ? null : <>
        <XRay t={t} s={xS} />
        <Card text="X-RAY: CAT EYE" top={350} rot={-3} size={56} s={xS} />
        <VsBox s={vsS} top={1480} you="1" cat="2" label="LIGHT GOES THROUGH" bump={hit(t, T.twice + 0.02, 1, 6)} />
        <Polaroid t={t} s={polS} />
        <Charts t={t} s={chS} />
        <Card text="YOU" top={540} left={316} rot={-4} size={56} s={chS} />
        <Card text="CAT EYES" top={540} left={770} rot={4} size={56} color={GOLD} s={chS} />
        <CountBox label="BLURRIER" val={`x${blurV}`} col={RED} s={popIn(t, BL0 - 0.12, 0.26) * inS(t, S6X, S7) * (1 - seg(t, S7 - 0.14, S7))} top={1390} bump={hit(t, BL1, 1, 6)} />
        <Card text="ONLY THE BIG E" top={1560} rot={-3} size={56} color={GOLD} s={stk.onlyE} />
        <CommentBubble t={t} text="what if you had a cat's eyes??" handle="@yarnball_doodle" likes="4.1K" out={1.4} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so} until={PUSH - 0.4} text="Would you take cat eyes?" />
      </>}
      {flashA > 0.01 ? <AbsoluteFill style={{background: '#FFFFFF', opacity: flashA}} /> : null}
      {lightsA > 0.01 ? <AbsoluteFill style={{background: '#FFF8DC', opacity: lightsA}} /> : null}
    </AbsoluteFill>
  );
};

export const CatVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const cues: Cue[] = [
    // frame 0: the yarn ball flies in the dark, he snatches it
    {f: 'whoosh.wav', at: 0, db: -14}, {f: 'shimmer.wav', at: 0, db: -26}, {f: 'slap.wav', at: CATCH, db: -15}, {f: 'pop.wav', at: CATCH + 0.02, db: -22},
    {f: 'meow.wav', at: 0.62, db: -24, to: 0.8},
    // the cat flips the switch: lights on, pupils snap to slits
    {f: 'click.wav', at: FLIP, db: -11}, {f: 'shing.wav', at: LIGHTS + 0.03, db: -17}, {f: 'gasp.wav', at: LIGHTS + 0.06, db: -21},
    // HIS VIEW: the blurry cat bats the second ball at us -> BONK
    {f: 'whoosh.wav', at: S2 - 0.02, db: -26}, {f: 'pop.wav', at: BAT, db: -20}, {f: 'whoosh.wav', at: BAT + 0.06, db: -16},
    {f: 'bonk.wav', at: BONK, db: -5}, {f: 'boing.wav', at: BONK + 0.02, db: -18}, {f: 'dizzy_birds.wav', at: BONK + 0.35, db: -23, to: 1.0}, {f: 'pop.wav', at: T.everything, db: -23},
    // the cat's face in the dark, NIGHT MODE
    {f: 'whoosh.wav', at: S4 - 0.02, db: -28}, {f: 'shimmer.wav', at: S4 + 0.05, db: -22}, {f: 'pop.wav', at: T.built - 0.02, db: -23},
    // X-RAY: CAT EYE - the mirror, the light goes through twice
    {f: 'zap.wav', at: S4X + 0.02, db: -23}, {f: 'pop.wav', at: S4X + 0.06, db: -23}, {f: 'shimmer.wav', at: T.mirror - 0.04, db: -20}, {f: 'pop.wav', at: T.mirror, db: -24},
    {f: 'fwoop.wav', at: BEAM0, db: -22}, {f: 'ding.mp3', at: BEAM1 - 0.08, db: -24}, {f: 'twang.mp3', at: BEAM1, db: -26, to: 0.4}, {f: 'ding.mp3', at: BEAM2 - 0.1, db: -21},
    {f: 'pop.wav', at: BEAM2 - 0.06, db: -22},
    // the selfie flash: four glowing eyes in the photo
    {f: 'whoosh.wav', at: S5 - 0.02, db: -28}, {f: 'shutter.wav', at: FLASH, db: -10}, {f: 'pop.wav', at: PHOTO, db: -20}, {f: 'crowd_laugh.wav', at: PHOTO + 0.1, db: -21, to: 1.4},
    // by day: the eye charts, x1 -> x7
    {f: 'page_flip.wav', at: S6 - 0.38, db: -20}, {f: 'pop.wav', at: T.day - 0.02, db: -24}, {f: 'pop.wav', at: S6X, db: -22}, {f: 'pop.wav', at: BL0 - 0.12, db: -24},
    ...ticks(BL0, BL1, 6, -27), {f: 'slide_down.wav', at: BL0 + 0.1, db: -27}, {f: 'pop.wav', at: 12.05, db: -23},
    ...ctaCues(T.cta),
    // the bathroom: he brushes his teeth with the cat's tail
    {f: 'whoosh.wav', at: S7 - 0.02, db: -28}, {f: 'squeak.wav', at: GRAB, db: -22}, {f: 'squelch.wav', at: PASTE, db: -19},
    {f: 'brush.wav', at: BRUSH0, db: -17, to: 0.84}, {f: 'meow.wav', at: BRUSH0 + 0.08, db: -21, to: 0.7}, {f: 'cat_hiss.wav', at: HISS, db: -13, to: 0.9},
    {f: 'crowd_laugh.wav', at: HISS + 0.12, db: -22, to: 1.2},
    // the nap: snore + purr, night falls, the eyes pop open
    {f: 'whoosh.wav', at: S8 - 0.02, db: -28}, {f: 'snore.mp3', at: S8 + 0.05, db: -25, to: 1.1}, {f: 'cat_purr.wav', at: S8 + 0.1, db: -29, to: 1.9},
    {f: 'slide_down.wav', at: DUSK0, db: -27}, {f: 'crickets.mp3', at: DUSK1 - 0.3, db: -29, to: 1.0}, {f: 'shing.wav', at: OPEN, db: -15}, {f: 'shimmer.wav', at: OPEN + 0.02, db: -21},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<CatScene t={0} />}>
        <CatScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="cateyes/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const CatWide: React.FC = () => <WideFit.Provider value={0.72}><CatVideo /></WideFit.Provider>;
