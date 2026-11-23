// "What if you could squeeze like an octopus?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// (1) frame 0: he pours out of a door's keyhole like toothpaste and piles up into himself beside a smug octopus (SQUEEZE);
//     the last bit pops out, TA-DA; (2) close-up (2.3 s): no bones - he collapses into a puddle, SPLORCH (NO BONES);
// (3) X-RAY: OCTOPUS - a scan line finds 0 BONES, only the beak lights up (BEAK, ONLY HARD PART);
// (4) in a fish tank a big octopus pours through a hole in a divider, then holds a lemon up to it (SIZE OF A LEMON);
// (5) X-RAY: YOU - 206 bones vanish one group at a time (206 -> 0); he wobbles and FLOPs, the octopus pokes the puddle (JIGGLE);
// (6) "So he goes back the way he came": the puddle slurps up into the keyhole = frame 0.
// All drawn in code. The guy is a soft version of the code-drawn front view: one merged outline (ink pass, then fill pass) so
// he can melt from standing (f = 0) to a puddle (f = 1) and pour through a keyhole as a tapered stream.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble} from './lib/kit';

// voice: tight.mp3 at 0.1 s (line 1 at 1.22, the rest at 1.12; video time). Speech ends 15.30 s.
export const DURATION = 16.1;
export const T = {
  squeeze: 0.10, octopus: 0.84, lose: 2.02, every: 2.35, bone: 2.67, have: 3.13,      // "Squeeze like an octopus, and you'd have to lose every bone you have."
  octopus2: 3.82, no: 4.61, bones: 4.97, only: 5.48, beak: 5.87, hard: 6.23,           // "An octopus has no bones. Only its beak is hard."
  big: 7.35, squeeze2: 8.07, hole: 8.68, size: 9.07, lemon: 9.53,                      // "So a big one can squeeze through a hole the size of a lemon."
  lose2: 10.09, n206: 10.52, bones2: 11.31, just: 12.23, flop: 12.52,                  // "Lose your 206 bones, and you'd just flop."
  so: 13.34, goes: 13.91, back: 14.27, came: 14.87,                                    // "So he goes back the way he came."
  cta: 10.25,
};
const POPOUT = 1.36, S2 = 2.28, COLL0 = 2.36, COLL1 = 2.6;     // the last bit pops out; close-up; he collapses
const S3 = 3.62, SCAN0 = 3.95, SCAN1 = 4.85;                  // X-RAY: OCTOPUS
const S4 = 6.78, POUR0 = 7.75, POUR1 = 9.25, LEM = 9.42;      // the fish tank: the pour, the lemon
const S5 = 9.95, B0 = 10.45, B1 = 11.31;                      // X-RAY: YOU
const S5B = 11.85, WOB0 = 12.0, FL0 = 12.42, FL1 = 12.6, POKE = 12.82;   // he flops; the octopus pokes the puddle
const S6 = 13.25, SUCK0 = 13.8, SUCK1 = 15.45;                // back through the keyhole
const PUSH = DURATION - LOOP_DUR;

const GOLD = '#FFD43B', RED = '#E2453C', FACE_C = '#F1EFEA', LEMON_C = '#FFE04A', LEMON_DK = '#E9B81E';
const OCT = '#DE7098', OCT_DK = '#B84E74', OCT_LT = '#F5A3BF', SUCK = '#FFE6EE';
const WOOD = '#C98B4E', WOOD_DK = '#A86E39', WOOD_LT = '#DDA66C', FLOOR = '#E9C899', FLOOR_DK = '#D2AC76', WALL = '#F7EFDF';
const WATER = '#AEE0F0', WATER_DK = '#7FC6E0', SAND = '#F0DDAA', SAND_DK = '#DDC388', WEED = '#7CC47A', WEED_DK = '#4F9A55';
const XBODY = '#7193C6', BONE = '#E9F1FF', BONE_SH = '#B9CBEA';
const FONT_W = 900;
const KX = 92, KY = -262;                // the keyhole (world)
const GX = 118;                          // where he piles up / stands, in front of the door
const OX = -78, OS = 0.74;               // the octopus in the room
const AQ = 3000, DIVX = AQ, HOLE_Y = -150, HOLE_R = 30;   // the fish tank: divider x, hole

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const rad = (d: number) => (d * Math.PI) / 180;
const quad = (a: P2, c: P2, b: P2, u: number): P2 => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={FONT_W} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${(ex - w).toFixed(1)} ${y.toFixed(1)} A ${rx} ${ry} 0 ${h > 0.5 ? 1 : 0} 1 ${(ex + w).toFixed(1)} ${y.toFixed(1)} Z`;
};
const spiral = (cx: number, cy: number, r: number, a0: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 26; i++) { const u = i / 26, a = a0 + u * Math.PI * 4, rr = r * u; pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`); }
  return 'M ' + pts.join(' L ');
};
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: FONT_W, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const Counter: React.FC<{left: number; top: number; value: string; label: string; s: number; red?: boolean; rot?: number; sub?: string}> = ({left, top, value, label, s, red, rot = 4, sub}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s.toFixed(3)})`,
    background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 26px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: FONT_W, fontSize: 108, lineHeight: 1, color: red ? RED : INK}}>{value}</div>
    <div style={{fontWeight: FONT_W, fontSize: 36}}>{label}</div>
    {sub ? <div style={{fontWeight: 800, fontSize: 30, color: '#6B6B6B'}}>{sub}</div> : null}
  </div>
) : null;
const pulse = (t: number, at: number, w = 6) => 1 + 0.12 * Math.max(0, 1 - Math.abs(t - at - 0.15) * w);
/** a tapered tube along a quadratic curve a -> b (control c), width w0 at a, w1 at b: closed outline */
const tubeD = (a: P2, c: P2, b: P2, w0: number, w1: number, n = 18) => {
  const L: P2[] = [], R: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, p = quad(a, c, b, u), q = quad(a, c, b, Math.min(1, u + 0.01)), q0 = quad(a, c, b, Math.max(0, u - 0.01));
    const dx = q[0] - q0[0], dy = q[1] - q0[1], l = Math.hypot(dx, dy) || 1, w = lerp(w0, w1, u) / 2;
    L.push([p[0] - (dy / l) * w, p[1] + (dx / l) * w]); R.push([p[0] + (dy / l) * w, p[1] - (dx / l) * w]);
  }
  return 'M ' + [...L, ...R.reverse()].map(P).join(' L ') + ' Z';
};
/** a wiggly noodle from a to b: points with a sine wiggle across the line */
const noodlePts = (a: P2, b: P2, amp: number, ph: number, n = 14): P2[] => {
  const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
  return Array.from({length: n + 1}, (_, i) => { const u = i / n, w = amp * Math.sin(Math.PI * u) * Math.sin(2 * Math.PI * u * 1.2 + ph); return [a[0] + dx * u + nx * w, a[1] + dy * u + ny * w] as P2; });
};
const smoothD = (pts: P2[]) => {
  let d = `M ${P(pts[0])}`;
  for (let i = 1; i < pts.length - 1; i++) { const m: P2 = [(pts[i][0] + pts[i + 1][0]) / 2, (pts[i][1] + pts[i + 1][1]) / 2]; d += ` Q ${P(pts[i])} ${P(m)}`; }
  return d + ` L ${P(pts[pts.length - 1])}`;
};

// ---------- the guy's face (front view) ----------
type Mood = 'joy' | 'happy' | 'smug' | 'focus' | 'pop' | 'ouch' | 'worry' | 'dizzy' | 'deadpan' | 'hope';
const Face: React.FC<{t: number; mood: Mood; uid: string; look?: number; lookY?: number}> = ({t, mood, uid, look = 0, lookY = 0}) => {
  const eye = (sd: number) => {
    const ex = sd * 25, ey = -14;
    if (mood === 'joy' || mood === 'happy') return <path key={sd} d={`M ${ex - 13} ${ey + 4} Q ${ex} ${ey - 12} ${ex + 13} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'ouch') return <path key={sd} d={`M ${ex - sd * 12} ${ey - 10} L ${ex + sd * 10} ${ey} L ${ex - sd * 12} ${ey + 10}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === 'dizzy') return <g key={sd}><ellipse cx={ex} cy={ey} rx={13} ry={15} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <path d={spiral(ex, ey, 10, t * 9 * sd)} stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" /></g>;
    const big = mood === 'pop' ? 1.25 : 1;
    const lid = mood === 'smug' ? 0.45 : mood === 'focus' ? 0.38 : mood === 'deadpan' ? 0.52 : 0;
    const rx = 12 * big, ry = 15 * big, px = look * 4, py = lookY * 4 + (mood === 'hope' ? -3 : 0);
    return <g key={sd}>
      <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + px} cy={ey + 1 + lid * 6 + py} r={6.3 * (big > 1 ? 0.85 : 1)} fill={INK} />
      <circle cx={ex + px - 1.5} cy={ey - 1 + lid * 6 + py} r={2} fill="#fff" />
      {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
    </g>;
  };
  const brow = (sd: number) => {
    let d = `M ${sd * 12} -45 Q ${sd * 25} -53 ${sd * 38} -47`;
    if (mood === 'focus' || mood === 'ouch') d = `M ${sd * 10} -34 L ${sd * 37} -44`;
    else if (mood === 'worry' || mood === 'dizzy' || mood === 'hope') d = `M ${sd * 10} -46 L ${sd * 36} -38`;
    else if (mood === 'smug') d = `M ${sd * 12} ${sd < 0 ? -40 : -46} L ${sd * 38} ${sd < 0 ? -44 : -50}`;
    else if (mood === 'pop') d = `M ${sd * 12} -52 Q ${sd * 25} -62 ${sd * 38} -54`;
    else if (mood === 'deadpan') d = `M ${sd * 12} -38 L ${sd * 38} -38`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  let mouth: React.ReactNode;
  if (mood === 'joy') mouth = <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  else if (mood === 'happy' || mood === 'hope') mouth = <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  else if (mood === 'smug') mouth = <path d="M -20 6 Q 0 16 22 -3" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'focus') mouth = <path d="M -15 9 Q 0 5 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'deadpan') mouth = <path d="M -16 8 L 16 8" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'ouch') mouth = <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (mood === 'worry' || mood === 'dizzy') mouth = <path d="M -18 10 q 6 -6 12 0 t 12 0 t 12 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else mouth = <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;
  return <g>{eye(-1)}{eye(1)}{brow(-1)}{brow(1)}<g transform="translate(0 28)">{mouth}</g></g>;
};

// ---------- the soft guy: standing (f = 0) -> puddle (f = 1); one merged outline; optional stream to a point ----------
type SG = {x: number; f: number; wob: number; mood: Mood; look: number; lookY: number; tilt: number; armUp: number; hide: number; sc: number; jig: number;
  stream: {k: P2; w0: number; w1: number; cut: number} | null};
const SoftGuy: React.FC<{t: number; g: SG; uid: string}> = ({t, g, uid}) => {
  if (g.hide >= 1 || g.sc < 0.01) return null;
  const f = clamp(g.f), j = g.jig * Math.sin(t * 30) * Math.exp(0);
  const sway = g.wob * 12 * Math.sin(t * 8.5);
  const top = lerp(-182, -44, f) + j * 6, bot = lerp(-57, 0, f), hw = lerp(47, 170, f) - j * 5;
  const cx = sway * 0.6;
  // torso blob (rounded; a puddle when flat)
  const r1 = lerp(32, 40, f), r2 = lerp(26, 18, f);
  const torso = `M ${cx - hw * 0.6} ${top} C ${cx - hw + 5} ${top + r1 * 0.18} ${cx - hw} ${top + r1 * 0.5} ${cx - hw} ${top + r1} L ${cx - hw - 8 * f} ${bot - r2} Q ${cx - hw - 8 * f} ${bot} ${cx - hw + r2} ${bot} ` +
    `L ${cx + hw - r2} ${bot} Q ${cx + hw + 8 * f} ${bot} ${cx + hw + 8 * f} ${bot - r2} L ${cx + hw} ${top + r1} C ${cx + hw} ${top + r1 * 0.5} ${cx + hw - 5} ${top + r1 * 0.18} ${cx + hw * 0.6} ${top} Z`;
  const legs = f < 0.92 ? [-1, 1].map((sd) => noodlePts([cx + sd * 20, bot - 6], [sd * 27 + sway * 0.2, -10], 6 * g.wob, t * 9 + sd)) : [];
  const shY = top + lerp(24, 18, f);
  const arms = [-1, 1].map((sd) => {
    const S: P2 = [cx + sd * (hw - 8), shY];
    const E: P2 = g.armUp > 0.01 ? lp2([cx + sd * (hw + 20 + 40 * f), lerp(-76, -8, f)], [cx + sd * (hw + 46), shY - 118], g.armUp) : [cx + sd * (hw + 20 + 46 * f), lerp(-76, -8, f)];
    return noodlePts(S, E, lerp(8, 16, Math.max(f, g.wob)), t * 7 + sd * 1.3);
  });
  const hy = lerp(-235, -50, f) + j * 4 + top - lerp(-182, -44, f), hsx = lerp(1, 1.2, f) + j * 0.04, hsy = lerp(1, 0.6, f) - j * 0.05;
  const headX = cx + sway * 0.4;
  const st = g.stream;
  let streamD = '';
  if (st) {
    const kl: P2 = [(st.k[0] - g.x) / g.sc, st.k[1] / g.sc];
    const end: P2 = [cx + 18, top + 16];
    const a = lp2(kl, end, st.cut);
    const c: P2 = [lerp(a[0], end[0], 0.2) + 30, lerp(a[1], end[1], 0.5) - 20];
    if (st.cut < 0.98) streamD = tubeD(a, c, end, lerp(st.w0, st.w1 * 0.8, st.cut), st.w1);
  }
  const inkW = 13;
  return (
    <W><g transform={`translate(${g.x.toFixed(1)} 0) scale(${g.sc.toFixed(3)})`}>
      {/* ink pass */}
      {streamD ? <path d={streamD} fill={INK} stroke={INK} strokeWidth={inkW} strokeLinejoin="round" /> : null}
      {legs.map((p, i) => <path key={'li' + i} d={smoothD(p)} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />)}
      {legs.map((p, i) => <ellipse key={'fi' + i} cx={p[p.length - 1][0] + (i ? 3 : -3)} cy={-6} rx={23 + 3} ry={9.5 + 3} fill={INK} />)}
      <path d={torso} fill={INK} stroke={INK} strokeWidth={inkW} strokeLinejoin="round" />
      {arms.map((p, i) => <path key={'ai' + i} d={smoothD(p)} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />)}
      {arms.map((p, i) => <circle key={'hi' + i} cx={p[p.length - 1][0]} cy={p[p.length - 1][1]} r={13 + 5.5} fill={INK} />)}
      <ellipse cx={headX} cy={hy} rx={(HEAD_R + 6.5) * hsx} ry={(HEAD_R + 6.5) * hsy} fill={INK} transform={`rotate(${g.tilt.toFixed(1)} ${headX} ${hy})`} />
      {/* fill pass */}
      {streamD ? <path d={streamD} fill="#FFFFFF" /> : null}
      {legs.map((p, i) => <path key={'lf' + i} d={smoothD(p)} stroke="#FFFFFF" strokeWidth={19} fill="none" strokeLinecap="round" />)}
      {legs.map((p, i) => <ellipse key={'ff' + i} cx={p[p.length - 1][0] + (i ? 3 : -3)} cy={-6} rx={23} ry={9.5} fill="#FFFFFF" />)}
      <path d={torso} fill="#FFFFFF" />
      {f > 0.3 ? <path d={`M ${cx - hw * 0.7} ${bot - 8} Q ${cx} ${bot + 2} ${cx + hw * 0.7} ${bot - 8}`} stroke="#E4E1DA" strokeWidth={10} fill="none" strokeLinecap="round" opacity={f} /> : null}
      {arms.map((p, i) => <path key={'af' + i} d={smoothD(p)} stroke="#FFFFFF" strokeWidth={19} fill="none" strokeLinecap="round" />)}
      {arms.map((p, i) => <circle key={'hf' + i} cx={p[p.length - 1][0]} cy={p[p.length - 1][1]} r={13} fill="#FFFFFF" />)}
      <g transform={`translate(${headX.toFixed(1)} ${hy.toFixed(1)}) rotate(${g.tilt.toFixed(1)}) scale(${hsx.toFixed(3)} ${hsy.toFixed(3)})`}>
        <circle r={HEAD_R} fill={`url(#sFace${uid})`} />
        <g transform={`scale(${(1 / hsx).toFixed(3)} ${(Math.min(1.25, 1 / hsy) * 0.85 + 0.15).toFixed(3)})`}><Face t={t} mood={g.mood} uid={uid} look={g.look} lookY={g.lookY} /></g>
      </g>
    </g></W>
  );
};

// ---------- the octopus (front view, arms on the floor; feet at 0) ----------
type OMood = 'smug' | 'look' | 'laugh' | 'pop' | 'proud';
type OS = {x: number; y: number; s: number; mood: OMood; tilt: number; shake: number; hide: number; poke: number; pokeAt: P2; lemon: number; sq: number; sx: number};
const ARM_TIPS: P2[] = [[-232, -18], [-178, -6], [-112, 4], [-44, 10], [44, 10], [112, 4], [178, -6], [232, -18]];
const OctoArm: React.FC<{base: P2; tip: P2; t: number; i: number; w0: number; dark?: boolean; suck?: boolean}> = ({base, tip, t, i, w0, dark, suck}) => {
  const ph = t * 3.2 + i * 1.1;
  const c: P2 = [lerp(base[0], tip[0], 0.45) + 18 * Math.sin(ph), lerp(base[1], tip[1], 0.7) + 10 * Math.cos(ph * 0.8)];
  const sd = tip[0] >= base[0] ? 1 : -1, curl = 16 + 4 * Math.sin(ph * 1.3);
  const tipC: P2 = [tip[0] + sd * curl * 0.4, tip[1] - curl];
  return <g>
    <path d={tubeD(base, c, tip, w0, 12)} fill={dark ? OCT_DK : OCT} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    <path d={`M ${P(tip)} Q ${P([tip[0] + sd * curl, tip[1] - 4])} ${P(tipC)}`} stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
    <path d={`M ${P(tip)} Q ${P([tip[0] + sd * curl, tip[1] - 4])} ${P(tipC)}`} stroke={dark ? OCT_DK : OCT} strokeWidth={6} fill="none" strokeLinecap="round" />
    {suck ? [0.45, 0.62, 0.78].map((u, k) => { const p = quad(base, c, tip, u); return <circle key={k} cx={p[0]} cy={p[1] + 4} r={lerp(7, 4, u)} fill={SUCK} stroke={INK} strokeWidth={2.5} />; }) : null}
  </g>;
};
const Lemon: React.FC<{p: P2; s?: number; rot?: number}> = ({p, s = 1, rot = 0}) => (
  <g transform={`translate(${P(p)}) rotate(${rot}) scale(${s})`}>
    <path d="M -38 0 Q -40 -26 -2 -30 Q 36 -30 40 -4 Q 44 0 40 4 Q 36 30 -2 30 Q -40 26 -38 0 Z" fill={LEMON_C} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -46 0 L -38 0 M 40 0 L 48 0" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <path d="M -16 -16 Q 0 -22 16 -16" stroke="#FFF7B8" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);
const Octopus: React.FC<{t: number; O: OS}> = ({t, O}) => {
  if (O.hide >= 1) return null;
  const jig = O.shake * 3 * Math.sin(t * 60);
  const base = (i: number): P2 => [-66 + i * 19, -96];
  const eye = (sd: number) => {
    const cx = sd * 36, cy = -138;
    if (O.mood === 'laugh') return <path key={sd} d={`M ${cx - 13} ${cy + 4} Q ${cx} ${cy - 11} ${cx + 13} ${cy + 4}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    const big = O.mood === 'pop' ? 1.2 : 1, lid = O.mood === 'smug' || O.mood === 'proud' ? 0.48 : 0;
    return <g key={sd}><ellipse cx={cx} cy={cy} rx={16 * big} ry={19 * big} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      <circle cx={cx + (O.mood === 'look' ? 6 : 2)} cy={cy + 3 + lid * 6} r={7.5} fill={INK} /><circle cx={cx} cy={cy + lid * 6} r={2.6} fill="#FFF" />
      {lid ? <path d={lidPath(cx, cy, 16.5, 19.5, lid)} fill={OCT} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}</g>;
  };
  const brows = O.mood === 'smug' || O.mood === 'proud' ? 'M -50 -168 L -22 -164 M 22 -166 L 50 -174' : O.mood === 'pop' ? 'M -50 -172 Q -36 -182 -22 -172 M 22 -172 Q 36 -182 50 -172' : 'M -50 -166 Q -36 -172 -22 -166 M 22 -166 Q 36 -172 50 -166';
  const mouth = O.mood === 'laugh' ? <path d="M -16 -104 Q 0 -92 16 -104 Q 12 -86 0 -84 Q -12 -86 -16 -104 Z" fill="#5A2328" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    : O.mood === 'pop' ? <ellipse cx={0} cy={-98} rx={9} ry={11} fill="#5A2328" stroke={INK} strokeWidth={4.5} />
      : <path d="M -14 -104 Q 2 -96 16 -108" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  return (
    <W><g transform={`translate(${(O.x + jig).toFixed(1)} ${O.y.toFixed(1)}) scale(${(O.s * O.sx * (1 + 0.08 * O.sq)).toFixed(3)} ${(O.s * (1 - 0.12 * O.sq)).toFixed(3)}) rotate(${O.tilt.toFixed(1)} 0 -100)`}>
      {/* back arms */}
      {[1, 3, 4, 6].map((i) => <OctoArm key={'b' + i} base={base(i)} tip={[ARM_TIPS[i][0] * 0.82, ARM_TIPS[i][1] - 14]} t={t} i={i} w0={30} dark />)}
      {/* mantle */}
      <path d="M -86 -120 C -100 -230 -64 -322 0 -324 C 64 -322 100 -230 86 -120 C 78 -92 40 -84 0 -84 C -40 -84 -78 -92 -86 -120 Z" fill={OCT} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 40 -290 Q 66 -250 64 -190" stroke={OCT_LT} strokeWidth={12} fill="none" strokeLinecap="round" />
      {[[-40, -250, 9], [-12, -282, 7], [30, -232, 8], [-50, -200, 6]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={OCT_DK} />)}
      {eye(-1)}{eye(1)}
      <path d={brows} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      {mouth}
      {/* front arms */}
      {[0, 2, 5, 7].map((i) => O.poke > 0.01 && i === 7 ? null : <OctoArm key={'f' + i} base={base(i)} tip={ARM_TIPS[i]} t={t} i={i} w0={34} suck />)}
      {O.poke > 0.01 ? <OctoArm base={base(7)} tip={lp2(ARM_TIPS[7], [(O.pokeAt[0] - O.x) / O.s, (O.pokeAt[1] - O.y) / O.s], O.poke)} t={t} i={7} w0={34} suck /> : null}
      {O.lemon > 0.01 ? <Lemon p={[150, -250]} s={O.lemon} rot={-10} /> : null}
    </g></W>
  );
};
/** the octopus pouring through the divider hole: the left part shrinks into the hole, the right part grows out of it */
const OctoPour: React.FC<{t: number; u: number; s: number}> = ({t, u, s}) => {
  const hole: P2 = [DIVX, HOLE_Y];
  const L = 1 - eio(clamp(u * 1.15)), R = eio(clamp(u * 1.15 - 0.15));
  const lx = DIVX - lerp(70, 190, L), rx = DIVX + lerp(70, 190, R);
  const left = L > 0.02 ? <g transform={`translate(${lx.toFixed(1)} 0) scale(${(s * lerp(0.2, 1, L)).toFixed(3)})`}><OctoBody t={t} mood="focus" /></g> : null;
  const right = R > 0.02 ? <g transform={`translate(${rx.toFixed(1)} 0) scale(${(s * lerp(0.2, 1, R)).toFixed(3)})`}><OctoBody t={t} mood={R > 0.9 ? 'proud' : 'focus'} /></g> : null;
  const sL = s * lerp(0.2, 1, L), sR = s * lerp(0.2, 1, R), hw = HOLE_R * 1.7;
  const pL: P2 = [lx + 40 * sL, -150 * sL], pR: P2 = [rx - 40 * sR, -150 * sR];
  const neck = u > 0.02 && u < 0.98 ? <g>
    <path d={tubeD(pL, [lerp(pL[0], hole[0], 0.6), hole[1] + 10], hole, 150 * sL, hw)} fill={OCT} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    <path d={tubeD(hole, [lerp(hole[0], pR[0], 0.4), hole[1] + 10], pR, hw, 150 * sR)} fill={OCT} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    <ellipse cx={hole[0]} cy={hole[1]} rx={12} ry={hw / 2 - 3} fill={OCT} />
  </g> : null;
  return <W>{neck}{left}{right}</W>;
};
const OctoBody: React.FC<{t: number; mood: string}> = ({t, mood}) => {
  const base = (i: number): P2 => [-66 + i * 19, -96];
  return <g>
    {[1, 3, 4, 6].map((i) => <OctoArm key={'b' + i} base={base(i)} tip={[ARM_TIPS[i][0] * 0.82, ARM_TIPS[i][1] - 14]} t={t} i={i} w0={30} dark />)}
    <path d="M -86 -120 C -100 -230 -64 -322 0 -324 C 64 -322 100 -230 86 -120 C 78 -92 40 -84 0 -84 C -40 -84 -78 -92 -86 -120 Z" fill={OCT} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-1, 1].map((sd) => <g key={sd}><ellipse cx={sd * 36} cy={-138} rx={16} ry={19} fill="#FFFFFF" stroke={INK} strokeWidth={5} /><circle cx={sd * 36 + 2} cy={-134 + (mood === 'proud' ? 3 : 0)} r={7.5} fill={INK} />
      {mood === 'proud' ? <path d={lidPath(sd * 36, -138, 16.5, 19.5, 0.48)} fill={OCT} stroke={INK} strokeWidth={4.5} /> : null}</g>)}
    <path d={mood === 'proud' ? 'M -14 -104 Q 2 -96 16 -108' : 'M -10 -102 Q 0 -98 10 -102'} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    {[0, 2, 5, 7].map((i) => <OctoArm key={'f' + i} base={base(i)} tip={ARM_TIPS[i]} t={t} i={i} w0={34} suck />)}
  </g>;
};

// ---------- the room: wall, door with a keyhole, floor ----------
const Room: React.FC = () => (
  <g>
    <rect x={-1400} y={-1400} width={2800} height={1400} fill={WALL} />
    {Array.from({length: 22}, (_, i) => <path key={i} d={`M ${-1400 + i * 130} -1400 V -40`} stroke="#EFE3CC" strokeWidth={10} />)}
    <rect x={-1400} y={-40} width={2800} height={40} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <rect x={-1400} y={0} width={2800} height={1200} fill={FLOOR} />
    {Array.from({length: 8}, (_, i) => <path key={'p' + i} d={`M -1400 ${46 + i * 70} H 1400`} stroke={FLOOR_DK} strokeWidth={6} />)}
    <path d="M -1400 0 H 1400" stroke={INK} strokeWidth={6} />
    {/* door + frame */}
    <path d="M -210 0 L -210 -680 L 172 -680 L 172 0" fill="#FFFFFF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <rect x={-186} y={-658} width={334} height={658} fill={WOOD} stroke={INK} strokeWidth={6} />
    <rect x={-150} y={-620} width={262} height={250} rx={10} fill={WOOD_LT} stroke={INK} strokeWidth={5} />
    <rect x={-150} y={-330} width={262} height={290} rx={10} fill={WOOD_LT} stroke={INK} strokeWidth={5} />
    <path d="M -130 -600 L -130 -390 M -130 -310 L -130 -60" stroke={WOOD} strokeWidth={8} strokeLinecap="round" />
    {/* knob + keyhole plate */}
    <rect x={KX - 22} y={KY - 78} width={44} height={110} rx={20} fill={GOLD} stroke={INK} strokeWidth={5} />
    <circle cx={KX} cy={KY - 46} r={22} fill="#FFE27A" stroke={INK} strokeWidth={5} />
    <path d={`M ${KX} ${KY - 8} a 9 9 0 1 1 0.1 0 Z M ${KX - 6} ${KY} L ${KX - 9} ${KY + 18} L ${KX + 9} ${KY + 18} L ${KX + 6} ${KY} Z`} fill={INK} />
    {/* a little picture on the wall */}
    <rect x={330} y={-560} width={150} height={120} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    <path d="M 346 -456 L 390 -510 L 420 -476 L 440 -496 L 466 -456 Z" fill="#9FD08A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={446} cy={-530} r={12} fill={GOLD} stroke={INK} strokeWidth={4} />
  </g>
);
const Tank: React.FC<{t: number}> = ({t}) => (
  <g>
    <rect x={AQ - 900} y={-900} width={1800} height={900} fill={WATER} />
    {Array.from({length: 6}, (_, i) => <path key={i} d={`M ${AQ - 900} ${-820 + i * 140} q 150 -20 300 0 t 300 0 t 300 0 t 300 0 t 300 0 t 300 0`} stroke="#C7EBF6" strokeWidth={10} fill="none" />)}
    <path d={`M ${AQ - 900} -60 Q ${AQ - 500} -100 ${AQ - 100} -70 Q ${AQ + 300} -50 ${AQ + 900} -80 L ${AQ + 900} 300 L ${AQ - 900} 300 Z`} fill={SAND} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {Array.from({length: 16}, (_, i) => <circle key={'s' + i} cx={AQ - 820 + i * 110 + (i % 3) * 20} cy={-20 + (i % 4) * 14} r={6 + (i % 3) * 3} fill={SAND_DK} />)}
    {[[-640, 1.0], [-480, 0.8], [520, 0.9], [700, 1.1]].map(([dx, s], i) => <path key={'w' + i}
      d={`M ${AQ + dx} -60 C ${AQ + dx - 30 * s} ${-200 * s} ${AQ + dx + 40 * s} ${-280 * s} ${AQ + dx + 10 * s} ${-400 * s - 8 * Math.sin(t * 2 + i)} C ${AQ + dx + 60 * s} ${-300 * s} ${AQ + dx + 20 * s} ${-200 * s} ${AQ + dx + 26} -60 Z`}
      fill={i % 2 ? WEED : WEED_DK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
    {Array.from({length: 10}, (_, i) => { const ph = (t * 0.45 + i * 0.13) % 1; return <circle key={'b' + i} cx={AQ - 700 + i * 150 + 16 * Math.sin(t * 3 + i)} cy={-80 - ph * 820} r={8 + (i % 3) * 4} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={1 - ph * 0.6} />; })}
  </g>
);
const Divider: React.FC = () => (
  <g>
    <path d={`M ${DIVX - 22} -900 L ${DIVX + 22} -900 L ${DIVX + 22} ${HOLE_Y - HOLE_R} L ${DIVX - 22} ${HOLE_Y - HOLE_R} Z M ${DIVX - 22} ${HOLE_Y + HOLE_R} L ${DIVX + 22} ${HOLE_Y + HOLE_R} L ${DIVX + 22} -40 L ${DIVX - 22} -40 Z`}
      fill="#9CB4C4" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M ${DIVX - 8} -880 L ${DIVX - 8} ${HOLE_Y - HOLE_R - 20}`} stroke="#C8D8E2" strokeWidth={6} strokeLinecap="round" />
  </g>
);

// ---------- X-ray panels ----------
const XR_Y = 1000, XR_R = 330;
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
const XWrap: React.FC<{s: number; children: React.ReactNode}> = ({s, children}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540 - 450, top: XR_Y - 450, width: 900, height: 900, transform: `scale(${s.toFixed(3)})`}}>{children}</div>) : null;
const OctoXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  const draw = eout(seg(t, S3 + 0.1, S3 + 0.5));
  const scan = seg(t, SCAN0, SCAN1), sy = lerp(-300, 300, scan);
  const beak = popIn(t, T.beak - 0.05, 0.3), bite = Math.max(0, Math.sin(t * 9)) * beak;
  const base = (i: number): P2 => [-66 + i * 19, -96];
  return <XWrap s={s}><XFrame id="xrO" R={XR_R}>
    <g transform="translate(0 200) scale(1.22)" opacity={draw}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={tubeD(base(i), [lerp(base(i)[0], ARM_TIPS[i][0], 0.45), -30], ARM_TIPS[i], 30, 10)} fill="#2C4A78" stroke={XBODY} strokeWidth={4} opacity={0.9} />)}
      <path d="M -86 -120 C -100 -230 -64 -322 0 -324 C 64 -322 100 -230 86 -120 C 78 -92 40 -84 0 -84 C -40 -84 -78 -92 -86 -120 Z" fill="#2C4A78" stroke={XBODY} strokeWidth={5} strokeDasharray="12 8" />
      <ellipse cx={0} cy={-200} rx={46} ry={60} fill="#3A5C8E" opacity={0.7} />
      {/* the beak, hidden in the middle of the arms */}
      <g transform={`translate(0 -86) scale(${lerp(1.1, 2.4, beak)})`}>
        <circle r={36 * beak} fill="#FFE28A" opacity={0.35 * beak} />
        <path d={`M -18 ${-4 - 6 * bite} Q -4 -30 18 -14 Q 6 -10 2 ${-2 - 6 * bite} Z`} fill={beak > 0.05 ? '#FFF1C2' : BONE_SH} stroke={beak > 0.05 ? GOLD : BONE_SH} strokeWidth={4} strokeLinejoin="round" />
        <path d={`M -16 ${4 + 6 * bite} Q 0 24 16 10 Q 4 8 0 ${2 + 6 * bite} Z`} fill={beak > 0.05 ? '#FFF1C2' : BONE_SH} stroke={beak > 0.05 ? GOLD : BONE_SH} strokeWidth={4} strokeLinejoin="round" />
      </g>
    </g>
    {scan > 0 && scan < 1 ? <g><rect x={-450} y={sy - 4} width={900} height={8} fill="#7CF0C8" opacity={0.9} /><rect x={-450} y={sy - 40} width={900} height={40} fill="#7CF0C8" opacity={0.15} /></g> : null}
  </XFrame></XWrap>;
};
// X-RAY: YOU - his skeleton; bone groups vanish (pop) between B0 and B1
type Bone = {d: string; w: number; at: number};
const BONES: Bone[] = (() => {
  const list: {d: string; w: number}[] = [];
  // skull, spine, ribs, pelvis, arms, legs, hands, feet (front view, feet at 0; his body: head centre -235, shoulders -160, hips -70)
  list.push({d: 'M -44 -250 a 44 46 0 1 1 88 0 a 44 46 0 1 1 -88 0 Z M -22 -256 a 9 11 0 1 0 0.1 0 M 22 -256 a 9 11 0 1 0 0.1 0', w: 7});
  list.push({d: 'M -26 -214 Q 0 -196 26 -214', w: 9});
  for (let i = 0; i < 9; i++) list.push({d: `M -7 ${-178 + i * 12} h 14`, w: 8});
  for (let i = 0; i < 5; i++) list.push({d: `M -6 ${-168 + i * 15} Q -40 ${-172 + i * 15} -42 ${-150 + i * 15} M 6 ${-168 + i * 15} Q 40 ${-172 + i * 15} 42 ${-150 + i * 15}`, w: 6});
  list.push({d: 'M -36 -66 Q -40 -40 -14 -44 Q 0 -56 14 -44 Q 40 -40 36 -66 Q 0 -78 -36 -66 Z', w: 6});
  for (const sd of [-1, 1]) {
    list.push({d: `M ${sd * 42} -168 L ${sd * 62} -116`, w: 9}); list.push({d: `M ${sd * 62} -112 L ${sd * 70} -66`, w: 7});
    list.push({d: `M ${sd * 22} -50 L ${sd * 24} -24`, w: 10}); list.push({d: `M ${sd * 24} -20 L ${sd * 26} -6`, w: 8});
    for (let k = 0; k < 3; k++) list.push({d: `M ${sd * (66 + k * 5)} -58 l ${sd * 3} 10`, w: 5});
    list.push({d: `M ${sd * 18} -2 h ${sd * 22}`, w: 6});
  }
  const order = list.map((_, i) => i).sort((a, b) => rnd(a + 7) - rnd(b + 7));
  return list.map((b, i) => ({...b, at: lerp(B0 + 0.05, B1 - 0.12, order.indexOf(i) / (list.length - 1))}));
})();
const YouXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  const draw = eout(seg(t, S5 + 0.1, S5 + 0.5));
  return <XWrap s={s}><XFrame id="xrU" R={XR_R}>
    <g transform="translate(0 168) scale(1.62)" opacity={draw}>
      <path d={`M -47 -182 L 47 -182 L 47 -57 L -47 -57 Z`} fill="#2C4A78" stroke={XBODY} strokeWidth={3} strokeDasharray="8 6" />
      <circle cx={0} cy={-235} r={64} fill="#2C4A78" stroke={XBODY} strokeWidth={3} strokeDasharray="8 6" />
      {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 40} -168 Q ${sd * 70} -120 ${sd * 72} -60 M ${sd * 20} -57 L ${sd * 26} -6`} stroke="#2C4A78" strokeWidth={26} fill="none" strokeLinecap="round" />)}
      {BONES.map((b, i) => {
        const k = t < b.at ? 1 : 1 - eio(seg(t, b.at, b.at + 0.12));
        if (k < 0.02) return null;
        const pop = t > b.at ? 1 + 0.4 * Math.sin(Math.PI * seg(t, b.at, b.at + 0.12)) : 1;
        return <g key={i} opacity={Math.min(1, k * 1.4)} style={{transformBox: 'fill-box', transformOrigin: 'center'}} transform={`scale(${(pop * k + (1 - k) * 0.2).toFixed(3)})`}>
          <path d={b.d} stroke={BONE} strokeWidth={b.w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>;
      })}
    </g>
  </XFrame></XWrap>;
};

// ---------- the story over time ----------
const baseG = (): SG => ({x: GX, f: 0, wob: 0, mood: 'joy', look: 0, lookY: 0, tilt: 0, armUp: 0, hide: 0, sc: 1, jig: 0, stream: null});
const guyAt = (t: number): SG => {
  const g = baseG();
  if (t < S2) {           // frame 0: pouring out of the keyhole, piling up into himself; the last bit pops out
    const u = seg(t, 0, POPOUT);
    g.f = lerp(0.62, 0.0, eio(u)); g.mood = t < POPOUT ? 'joy' : 'joy'; g.look = -0.6; g.lookY = -0.4;
    g.stream = t < POPOUT + 0.1 ? {k: [KX, KY], w0: 12, w1: 62, cut: seg(t, POPOUT - 0.12, POPOUT + 0.1)} : null;
    g.wob = 0.35 * (1 - u); g.armUp = t > POPOUT ? eout(seg(t, POPOUT, POPOUT + 0.25)) : 0.2 + 0.2 * Math.sin(t * 6);
    if (t > 1.95) { g.wob = seg(t, 1.95, S2) * 0.8; g.mood = 'worry'; g.armUp = 1 - seg(t, 1.95, S2); }
    return g;
  }
  if (t < S3) {           // close-up: he collapses into a puddle
    const c = seg(t, COLL0, COLL1);
    g.f = Math.pow(c, 1.6); g.wob = t < COLL0 ? 0.9 : 0.3 * (1 - c); g.mood = t < COLL0 ? 'worry' : t < COLL1 + 0.12 ? 'pop' : 'dizzy';
    g.jig = t > COLL1 ? Math.exp(-5 * (t - COLL1)) * 0.9 : 0; g.lookY = 0;
    if (t > COLL1 + 0.5) { g.mood = 'worry'; g.look = Math.sin((t - COLL1) * 3) > 0 ? -1 : 1; }
    return g;
  }
  if (t < S5B) { g.hide = 1; return g; }
  if (t < S6) {           // he stands, wobbles and flops; the octopus pokes the puddle
    g.mood = t < WOB0 + 0.2 ? 'hope' : t < FL0 ? 'worry' : t < FL1 + 0.12 ? 'pop' : 'dizzy';
    g.wob = t < FL0 ? 0.25 + 0.75 * seg(t, WOB0, FL0) : 0;
    g.f = t < FL0 ? 0.04 * seg(t, WOB0, FL0) : Math.pow(seg(t, FL0, FL1), 1.6);
    const pk = t > POKE ? Math.exp(-4 * (t - POKE)) : 0;
    g.jig = (t > FL1 ? Math.exp(-5 * (t - FL1)) * 0.9 : 0) + pk * 1.1;
    if (t > POKE + 0.25) g.mood = 'deadpan';
    return g;
  }
  // back the way he came: the puddle slurps up into the keyhole
  g.f = 1; g.mood = t < SUCK0 + 0.2 ? 'deadpan' : 'smug';
  const u = eio(seg(t, SUCK0, SUCK1));
  g.sc = lerp(1, 0.38, u);
  g.stream = t > SUCK0 ? {k: [KX, KY], w0: 12, w1: lerp(20, 60, seg(t, SUCK0, SUCK0 + 0.3)), cut: 1 - seg(t, SUCK0, SUCK0 + 0.22)} : null;
  g.jig = 0.25 * Math.sin(t * 4);
  return g;
};
const baseO = (): OS => ({x: OX, y: 0, s: OS, mood: 'smug', tilt: 0, shake: 0, hide: 0, poke: 0, pokeAt: [GX - 40, -30], lemon: 0, sq: 0, sx: 1});
const octoAt = (t: number): OS => {
  const O = baseO();
  O.tilt = 3 * Math.sin(t * 2);
  if (t < S3) { O.mood = t > COLL1 && t < S3 ? 'laugh' : t > S2 ? 'look' : 'smug'; O.shake = O.mood === 'laugh' ? 1 : 0; return O; }
  if (t < S5B) { O.hide = t >= S4 && t < S5 ? 1 : 0; O.mood = 'smug'; return O; }
  if (t < S6) {
    O.mood = t < FL1 ? 'look' : t < POKE + 0.1 ? 'smug' : 'laugh'; O.shake = O.mood === 'laugh' ? 1 : 0;
    O.poke = t > FL1 + 0.05 ? Math.sin(Math.PI * clamp((t - FL1 - 0.05) / 0.55)) : 0; O.pokeAt = [GX - 60, -40];
    return O;
  }
  O.mood = 'smug';
  return O;
};

// ---------- camera (piecewise, hard cuts) ----------
const CAM0 = {x: 52, y: -224, k: 2.42};
const camFor = (t: number): {x: number; y: number; k: number} => {
  if (t < S2) { const u = eio(seg(t, 0, S2)); return {x: lerp(CAM0.x, 60, u), y: lerp(CAM0.y, -210, u), k: lerp(CAM0.k, 2.55, u)}; }
  if (t < S3) { const u = eio(seg(t, S2, S3)); return {x: lerp(GX - 6, GX, u), y: lerp(-150, -120, u), k: lerp(3.0, 3.25, u)}; }
  if (t < S4) return {x: 40, y: -230, k: 2.0};
  if (t < S5) { const u = eio(seg(t, S4, S5)); return {x: lerp(AQ - 20, AQ + 10, u), y: lerp(-230, -236, u), k: lerp(2.2, 2.3, u)}; }
  if (t < S5B) return {x: 40, y: -230, k: 2.0};
  if (t < S6) { const u = eio(seg(t, S5B, S6)); return {x: lerp(30, 36, u), y: lerp(-170, -166, u), k: lerp(2.35, 2.45, u)}; }
  const u = eio(seg(t, S6, PUSH));
  return {x: lerp(70, CAM0.x, u), y: lerp(-190, CAM0.y, u), k: lerp(2.55, CAM0.k, u)};
};

export const SqueezeScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t), O = octoAt(t);
  if (thumb) { g.f = 0.86; g.mood = 'pop'; g.jig = 0; g.wob = 0; g.stream = null; O.mood = 'smug'; O.poke = 0; }
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 4, 7) + hit(t, COLL1, 9, 6) + hit(t, FL1, 8, 6) + hit(t, POKE, 4, 7));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const inTank = t >= S4 && t < S5;
  const pourU = seg(t, POUR0, POUR1);
  const st = {
    squelch: (1 - seg(t, 0.55, 0.68)) * (t < S2 ? 1 : 0),
    pop: popIn(t, POPOUT, 0.18) * (1 - seg(t, POPOUT + 0.45, POPOUT + 0.58)),
    splorch: popIn(t, COLL1, 0.18) * (1 - seg(t, S3 - 0.12, S3)),
    squish: popIn(t, POUR0 + 0.1, 0.2) * (1 - seg(t, POUR0 + 0.9, POUR0 + 1.02)),
    splat: popIn(t, FL1, 0.18) * (1 - seg(t, POKE - 0.05, POKE + 0.05)),
    jiggle: popIn(t, POKE, 0.18) * (1 - seg(t, S6 - 0.12, S6)),
    slurp: popIn(t, SUCK0 + 0.3, 0.2) * (1 - seg(t, SUCK0 + 1.0, SUCK0 + 1.12)),
    slurp2: popIn(t, SUCK0 + 1.15, 0.2) * (1 - seg(t, PUSH - 0.15, PUSH - 0.03)),
  };
  const lemonU = popIn(t, LEM, 0.3);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`sFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Layer cam={cam} z={1000}><W>{inTank ? <Tank t={t} /> : <Room />}</W></Layer>
      <Layer cam={cam} z={1000}>
        {inTank ? <W><OctoPour t={t} u={pourU} s={0.95} /></W> : null}
        {inTank ? <W><Divider /></W> : null}
        {inTank && t > LEM - 0.02 ? <W><Lemon p={[DIVX - 58, HOLE_Y]} s={lemonU * 0.62} rot={0} /></W> : null}
        {!inTank ? <Octopus t={t} O={O} /> : null}
        {!inTank ? <SoftGuy t={t} g={g} uid={uid} /> : null}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={KX + 58} y={KY - 52} s={st.squelch} text="SQUEEZE" size={34} rot={8} fill="#FFFFFF" />
        <Txt x={KX + 70} y={KY - 60} s={st.pop} text="POP" size={52} rot={-8} fill={GOLD} />
        <Txt x={GX + 40} y={-250} s={st.splorch} text="SPLORCH" size={48} rot={-6} fill="#FFFFFF" />
        <Txt x={DIVX} y={-360} s={st.squish} text="SQUISH" size={52} rot={-6} fill="#FFFFFF" />
        <Txt x={GX + 60} y={-290} s={st.splat} text="SPLAT" size={50} rot={8} fill="#FFFFFF" />
        <Txt x={GX + 50} y={-250} s={st.jiggle} text="JIGGLE" size={46} rot={-8} fill={GOLD} />
        <Txt x={KX + 110} y={KY - 40} s={st.slurp} text="SLURP" size={44} rot={8} fill="#FFFFFF" />
        <Txt x={KX + 110} y={KY - 40} s={st.slurp2} text="SLURP" size={44} rot={-6} fill="#FFFFFF" />
      </Layer>}
      {thumb ? null : <>
        <Card text="SQUEEZE" top={1452} color="#FFFFFF" rot={-3} s={1 - seg(t, S2 - 0.12, S2)} size={84} />
        <Card text="NO BONES" top={1452} color={RED} fg="#fff" rot={3} s={popIn(t, T.bone - 0.04, 0.28) * (1 - seg(t, S3 - 0.12, S3)) * pulse(t, T.bone)} size={92} />
        <Card text="ONLY HARD PART" top={1452} color={GOLD} rot={-3} s={popIn(t, T.hard - 0.04, 0.28) * (1 - seg(t, S4 - 0.12, S4))} size={68} />
        <Card text="A BIG ONE" top={1452} color="#FFFFFF" rot={3} s={popIn(t, T.big - 0.04, 0.26) * (1 - seg(t, LEM - 0.1, LEM))} size={80} />
        <Card text="SIZE OF A LEMON" top={1452} color={LEMON_C} rot={-3} s={popIn(t, LEM, 0.28) * (1 - seg(t, S5 - 0.12, S5)) * pulse(t, T.lemon)} size={70} />
        <Card text="FLOP" top={1452} color={RED} fg="#fff" rot={-3} s={popIn(t, T.flop - 0.04, 0.26) * (1 - seg(t, S6 - 0.12, S6)) * pulse(t, FL1)} size={100} />
        <Card text="BACK HE GOES" top={1452} color={GOLD} rot={3} s={popIn(t, T.goes - 0.04, 0.26) * (1 - seg(t, PUSH - 0.12, PUSH))} size={80} />
      </>}
      <OctoXRay t={t} s={popIn(t, S3 + 0.02, 0.35) * (1 - seg(t, S4 - 0.12, S4)) * (t >= S3 ? 1 : 0)} />
      <YouXRay t={t} s={popIn(t, S5 + 0.02, 0.35) * (1 - seg(t, S5B - 0.12, S5B)) * (t >= S5 ? 1 : 0)} />
      {thumb ? null : <>
        <Card text="X-RAY: OCTOPUS" top={XR_Y - XR_R - 26} size={50} rot={-2} s={popIn(t, S3 + 0.06, 0.3) * (1 - seg(t, S4 - 0.12, S4))} />
        <Counter left={830} top={XR_Y + 240} value="0" label="BONES" rot={5} red s={popIn(t, T.bones - 0.04, 0.3) * (1 - seg(t, S4 - 0.12, S4)) * pulse(t, T.bones)} />
        <Card text="BEAK" top={XR_Y + 190} left={260} color={GOLD} rot={-6} s={popIn(t, T.beak - 0.02, 0.26) * (1 - seg(t, S4 - 0.12, S4))} size={60} />
        <Card text="X-RAY: YOU" top={XR_Y - XR_R - 26} size={50} rot={-2} s={popIn(t, S5 + 0.06, 0.3) * (1 - seg(t, S5B - 0.12, S5B))} />
        <Counter left={830} top={XR_Y + 240} value={`${Math.round(206 * (1 - BONES.filter((b) => t > b.at + 0.06).length / BONES.length))}`} label="BONES" rot={5} red={t > B1 - 0.05}
          s={popIn(t, S5 + 0.15, 0.3) * (1 - seg(t, S5B - 0.12, S5B)) * pulse(t, B1)} />
        <CommentBubble t={t} text="what if you could squeeze like an octopus??" handle="@noodle_arms_doodle" likes="3.4K" y={400} />
        <CallToAction t={t} at={T.cta} y={250} />
        <CommentAsk t={t} at={T.so} until={PUSH - 0.4} text="Where would you squeeze through first?" y={280} />
      </>}
    </AbsoluteFill>
  );
};

export const SqueezeVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const pops: Cue[] = BONES.filter((_, i) => i % 2 === 0).map((b) => ({f: 'pop.wav', at: b.at, db: -29}));
  const cues: Cue[] = [
    // frame 0: squelch + stretch as he pours out of the keyhole; the last bit POPs out
    {f: 'squelch.wav', at: 0, db: -6}, {f: 'stretch.wav', at: 0, db: -12, to: 1.2}, {f: 'whoosh.wav', at: 0, db: -22, from: 0.12}, {f: 'squelch.wav', at: 0.7, db: -14},
    {f: 'pop.wav', at: POPOUT, db: -9}, {f: 'confetti.wav', at: POPOUT + 0.1, db: -24},
    // he collapses: SPLORCH
    {f: 'whoosh.wav', at: S2 - 0.03, db: -30}, {f: 'squelch.wav', at: COLL1 - 0.04, db: -5}, {f: 'thud.wav', at: COLL1, db: -13}, {f: 'pop.wav', at: T.bone - 0.04, db: -20},
    {f: 'crowd_laugh.wav', at: COLL1 + 0.2, db: -26, to: 0.8},
    // X-RAY: OCTOPUS
    {f: 'zap.wav', at: S3, db: -23}, {f: 'scribble.wav', at: SCAN0, db: -24}, {f: 'beep.wav', at: SCAN1 - 0.05, db: -22}, {f: 'pop.wav', at: T.bones - 0.04, db: -21},
    {f: 'ding.mp3', at: T.beak - 0.02, db: -19}, {f: 'clack.wav', at: T.beak + 0.2, db: -22}, {f: 'pop.wav', at: T.hard - 0.04, db: -22},
    // the fish tank: the pour, the lemon
    {f: 'whoosh.wav', at: S4 - 0.03, db: -30}, {f: 'bubbles.wav', at: S4, db: -24}, {f: 'pop.wav', at: T.big - 0.04, db: -22},
    {f: 'squelch.wav', at: POUR0 + 0.05, db: -10}, {f: 'stretch.wav', at: POUR0 + 0.1, db: -14, to: 1.0}, {f: 'squelch.wav', at: POUR1 - 0.25, db: -12}, {f: 'pop.wav', at: POUR1, db: -16},
    {f: 'ding.mp3', at: LEM, db: -18},
    ...ctaCues(T.cta),
    // X-RAY: YOU - bones vanish
    {f: 'whoosh.wav', at: S5 - 0.03, db: -30}, {f: 'zap.wav', at: S5, db: -23}, ...pops, {f: 'beep.wav', at: B1, db: -15},
    // he flops, the octopus pokes
    {f: 'whoosh.wav', at: S5B - 0.03, db: -30}, {f: 'boing.wav', at: WOB0, db: -22}, {f: 'squelch.wav', at: FL1 - 0.04, db: -5}, {f: 'thud.wav', at: FL1, db: -12},
    {f: 'pop.wav', at: T.flop - 0.04, db: -20}, {f: 'boing.wav', at: POKE, db: -12}, {f: 'crowd_laugh.wav', at: POKE + 0.1, db: -21, to: 1.1},
    // back through the keyhole
    {f: 'whoosh.wav', at: S6 - 0.03, db: -30}, {f: 'squelch.wav', at: SUCK0 + 0.25, db: -12}, {f: 'stretch.wav', at: SUCK0 + 0.3, db: -15, to: 1.2},
    {f: 'squelch.wav', at: SUCK0 + 1.15, db: -13}, {f: 'pop.wav', at: T.goes - 0.04, db: -21}, {f: 'whoosh.wav', at: PUSH - 0.05, db: -22},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<SqueezeScene t={0} />}>
        <SqueezeScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="squeeze/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const SqueezeWide: React.FC = () => <WideFit.Provider value={0.72}><SqueezeVideo /></WideFit.Provider>;
