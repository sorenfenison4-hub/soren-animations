// "What if you had a rabbit's eyes?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// (1) frame 0: in a park, side view: his eyes sit on the sides of his head (one big eye in the middle of his profile); a ball
//     flies at his back and he catches it behind his back without turning (SEES BEHIND) beside a smug rabbit;
// (2) close-up (2.45 s): a cream pie comes straight at his face from the front - he never sees it - SPLAT at 2.95 (NEVER SAW IT);
// (3) the rabbit's face: its eye on the side of its head (SIDES); (4) SEEN FROM ABOVE: the two eyes' fields sweep round, the
//     dial runs 0 -> 360 (NEARLY 360, YOU 180), then the wedge in front of its nose flashes red (BLIND SPOT);
// (5) the rabbit can't see the carrot under its nose: it sniffs and feels with its whiskers (SNIFF, WHISKERS, CRUNCH);
// (6) he tries to watch his phone: held in front, he can't see it (?), so he holds it against the side of his head (AH);
// (7) "So now he walks backwards": he walks backwards past the rabbit and catches the next ball behind his back = frame 0.
// All drawn in code. The guy is the code-drawn front-view body with a side-view head.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble} from './lib/kit';

// voice: tight.mp3 at 0.1 s (line 1 at 1.22, the rest at 1.12; video time). Speech ends 16.31 s.
export const DURATION = 17.1;
export const T = {
  get: 0.10, eyes: 0.74, see: 1.59, behind: 1.72, back: 2.28, but: 2.61, not: 2.77, front: 3.49, you: 3.82,   // "Get a rabbit's eyes, and you'd see behind your back, but not what's right in front of you."
  eyes2: 4.80, sit: 5.01, sides: 5.41, head: 5.94,                                                         // "A rabbit's eyes sit on the sides of its head."
  sees: 6.63, almost: 6.99, around: 8.06,                                                                  // "It sees almost all the way around."
  but2: 8.57, front2: 9.07, nose: 9.43, blind: 10.36, spot: 10.68,                                         // "But right in front of its nose, there's a blind spot."
  finds: 11.27, food: 11.56, sniffing: 12.13, feeling: 12.84, whiskers: 13.45,                             // "It finds food by sniffing and feeling with its whiskers."
  so: 14.48, now: 14.81, walks: 15.27, backwards: 15.56,                                                   // "So now he walks backwards."
  cta: 11.15,
};
const CATCH1 = 0.24, CATCH2 = 1.5;                       // balls caught behind his back
const S2 = 2.45, SPLAT = 2.95;                            // close-up: the pie
const S3 = 4.05;                                          // the rabbit's face, its eye on the side
const S4 = 6.35, CONE0 = 6.6, CONE1 = 8.0, BL0 = 8.62;    // SEEN FROM ABOVE: the fields sweep round; the blind spot
const S5 = 11.0, SNIFF0 = 11.9, FIND = 13.2;              // the carrot under its nose
const S6 = 13.62, PH0 = 13.75, PH1 = 14.12;               // the phone gag
const S7 = 14.42, CATCH3 = 16.05;                         // he walks backwards, catches the next ball
const PUSH = DURATION - LOOP_DUR;

const GOLD = '#FFD43B', RED = '#E2453C', FACE_C = '#F1EFEA';
const RAB = '#D9C7B2', RAB_DK = '#B39C84', RAB_LT = '#F2E8DB', EAR_IN = '#F2A9B7', NOSE_C = '#E77A90';
const GRASS = '#BFE3A0', GRASS_DK = '#93C976', HILL = '#D5EDBC', LEAF = '#8FCB5C', LEAF_DK = '#5F9C3B', BARK = '#B98A5C';
const BALL = '#E9554A', CREAM = '#FFFDF6', TIN = '#C9CED6', CARROT = '#F58A2E', CARROT_LF = '#62B54A';
const CONE_C = '#7CE3A0', XBG = '#16223A';
const FONT_W = 900;
const GX = 0;                    // where he stands
const RX = 205, RS = 0.8;        // the rabbit, facing him
const BALL_FROM: P2 = [-215, -400];

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const rad = (d: number) => (d * Math.PI) / 180;
const rot2 = (p: P2, a: number): P2 => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={FONT_W} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${(ex - w).toFixed(1)} ${y.toFixed(1)} A ${rx} ${ry} 0 ${h > 0.5 ? 1 : 0} 1 ${(ex + w).toFixed(1)} ${y.toFixed(1)} Z`;
};
const ik = (A: P2, F: P2, L1: number, L2: number, bend: number): P2 => {
  const dx = F[0] - A[0], dy = F[1] - A[1], D = Math.hypot(dx, dy) || 1;
  const d = Math.min(D, L1 + L2 - 0.01);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / D, uy = dy / D;
  return [A[0] + ux * a - uy * h * bend, A[1] + uy * a + ux * h * bend];
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

// ---------- the guy's side-view head with a rabbit eye in the middle (facing +x) ----------
type Mood = 'smug' | 'joy' | 'focus' | 'pop' | 'squint' | 'worry' | 'puzzled' | 'happy' | 'deadpan';
const RFace: React.FC<{t: number; mood: Mood; uid: string; lookX: number; lookY: number; cream: number; blink: number}> = ({t, mood, uid, lookX, lookY, cream, blink}) => {
  const ex = 2, ey = -6, rx = 22, ry = 26;
  const lid = Math.max(blink, mood === 'smug' ? 0.42 : mood === 'focus' ? 0.32 : mood === 'deadpan' ? 0.5 : mood === 'squint' ? 0.85 : 0);
  const big = mood === 'pop' ? 1.12 : 1;
  const eye = mood === 'joy' || mood === 'happy'
    ? <path d={`M ${ex - rx} ${ey + 4} Q ${ex} ${ey - 20} ${ex + rx} ${ey + 4}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    : <g>
      <ellipse cx={ex} cy={ey} rx={rx * big} ry={ry * big} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      <circle cx={ex + lookX * 9} cy={ey + lookY * 9 + lid * 8} r={10.5} fill={INK} />
      <circle cx={ex + lookX * 9 - 3} cy={ey + lookY * 9 - 3 + lid * 8} r={3.4} fill="#FFFFFF" />
      {lid > 0.02 ? <path d={lidPath(ex, ey, rx * big + 0.5, ry * big + 0.5, Math.min(1, lid))} fill={FACE_C} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}
    </g>;
  const brow = mood === 'smug' ? 'M -18 -42 L 24 -48' : mood === 'pop' ? 'M -18 -48 Q 4 -60 26 -50' : mood === 'worry' || mood === 'puzzled' ? 'M -16 -48 L 24 -40' : mood === 'focus' || mood === 'squint' ? 'M -16 -38 L 24 -44' : 'M -16 -44 Q 4 -52 24 -46';
  const mouth = mood === 'joy' ? <path d="M 30 22 Q 46 24 60 14 Q 58 36 42 38 Q 32 36 30 22 Z" fill="#5A2328" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    : mood === 'pop' ? <ellipse cx={50} cy={30} rx={9} ry={11} fill="#5A2328" stroke={INK} strokeWidth={4.5} />
      : mood === 'worry' || mood === 'puzzled' ? <path d="M 34 34 q 6 -6 12 0 t 12 -2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        : mood === 'smug' ? <path d="M 30 30 Q 46 36 60 22" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />
          : <path d="M 32 30 Q 46 34 58 26" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  // the cream pie on his face (front half), dripping
  const cr = clamp(cream), drip = 10 * Math.sin(t * 2) + 14;
  return (
    <g>
      <circle r={HEAD_R + 1} fill={`url(#rFace${uid})`} stroke={INK} strokeWidth={6.5} />
      {eye}
      <path d={brow} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      {mouth}
      {cr > 0.01 ? <g opacity={1}>
        <clipPath id={`rc${uid}`}><circle r={HEAD_R + 3} /></clipPath>
        <g clipPath={`url(#rc${uid})`}><path d={`M ${lerp(70, 28, cr)} -70 Q ${lerp(70, 6, cr)} -36 ${lerp(70, 20, cr)} -6 Q ${lerp(70, 10, cr)} 24 ${lerp(70, 26, cr)} 46 Q ${lerp(70, 30, cr)} 60 ${lerp(70, 36, cr)} 72 L 90 72 L 90 -70 Z`}
          fill={CREAM} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>
        {cr > 0.5 ? [[34, 56, 1], [50, 42, 0.8]].map(([x, y, k], i) => <path key={'d' + i} d={`M ${x - 7} ${y} Q ${x} ${y + drip * k * 1.4 + 6} ${x + 7} ${y} Z`} fill={CREAM} stroke={INK} strokeWidth={4} strokeLinejoin="round" />) : null}
        {[[44, -28, 7], [58, 6, 9], [40, 30, 6]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r * cr} fill="#F7E7C4" />)}
      </g> : null}
    </g>
  );
};

// ---------- the guy: front-view body (feet at 0), side-view head facing dir ----------
type GS = {x: number; y: number; rot: number; lean: number; dir: number; armA: P2; armB: P2; footA: P2; footB: P2; mood: Mood; lookX: number; lookY: number;
  sq: number; tilt: number; trem: number; cream: number; blink: number; hide: number; holdA: 'ball' | 'phone' | null; holdB: 'ball' | 'phone' | null};
const SHX = 38, HIPY = -70, SHY = -182, HEADY = -235;
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; hand?: boolean}> = ({S, H, L, sd, w = 29, hand = true}) => {
  const E = ik(S, H, L, L, -sd * (H[1] < S[1] ? 1 : -1));
  const C: P2 = [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2];
  const d = `M ${P(S)} Q ${P(C)} ${P(H)}`;
  return <g>
    <path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" />
    <path d={d} stroke="#FFFFFF" strokeWidth={w - 11} fill="none" strokeLinecap="round" />
    {hand ? <circle cx={H[0]} cy={H[1]} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} /> : null}
  </g>;
};
const torsoD = (tw: number, top: number, bot: number) => {
  const h = bot - top, r1 = Math.min(34, h * 0.3), r2 = Math.min(29, h * 0.26), sw = tw * 0.6;
  return `M ${-sw} ${top} C ${-tw + 5} ${top + r1 * 0.18} ${-tw} ${top + r1 * 0.5} ${-tw} ${top + r1} L ${-tw + 1} ${bot - r2} Q ${-tw + 1} ${bot} ${-tw + r2} ${bot} ` +
    `L ${tw - r2} ${bot} Q ${tw - 1} ${bot} ${tw - 1} ${bot - r2} L ${tw} ${top + r1} C ${tw} ${top + r1 * 0.5} ${tw - 5} ${top + r1 * 0.18} ${sw} ${top} Z`;
};
const Ball: React.FC<{p: P2; r?: number; spin?: number}> = ({p, r = 26, spin = 0}) => (
  <g transform={`translate(${P(p)}) rotate(${spin.toFixed(0)})`}>
    <circle r={r} fill={BALL} stroke={INK} strokeWidth={5} />
    <path d={`M ${-r} 0 Q 0 ${r * 0.5} ${r} 0`} stroke="#FFFFFF" strokeWidth={6} fill="none" />
    <circle cx={-r * 0.35} cy={-r * 0.4} r={r * 0.18} fill="#FFB3A8" />
  </g>
);
const Phone: React.FC<{p: P2; rot?: number; back?: boolean}> = ({p, rot = 0, back}) => (
  <g transform={`translate(${P(p)}) rotate(${rot})`}>
    <rect x={-24} y={-44} width={48} height={88} rx={10} fill={back ? '#5B6B8C' : '#2A2F3A'} stroke={INK} strokeWidth={5} />
    {back ? <circle cx={-10} cy={-30} r={6} fill="#2A2F3A" /> : <rect x={-18} y={-36} width={36} height={70} rx={4} fill="#8FD3F5" />}
  </g>
);
const handPos = (g: GS, sd: number): P2 => {
  const S: P2 = [sd * SHX, SHY + 22]; const H = add(S, sd < 0 ? g.armA : g.armB);
  const lean = rot2([H[0], H[1] - HIPY], g.lean); const r = rot2([lean[0], lean[1] + HIPY], g.rot);
  return [g.x + r[0], g.y + r[1]];
};
const headPos = (g: GS): P2 => { const lean = rot2([0, HEADY - HIPY], g.lean); const r = rot2([lean[0], lean[1] + HIPY], g.rot); return [g.x + r[0], g.y + r[1]]; };
const GuyR: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  if (g.hide >= 1) return null;
  const jig = g.trem * 2.4 * Math.sin(t * 71);
  const SA: P2 = [-SHX, SHY + 22], SB: P2 = [SHX, SHY + 22];
  const HA = add(SA, g.armA), HB = add(SB, g.armB);
  const headT = `translate(0 ${(HEADY + HEAD_R).toFixed(1)}) rotate(${g.tilt.toFixed(2)} 0 ${-HEAD_R}) scale(${(1 + 0.1 * g.sq).toFixed(3)} ${(1 - 0.16 * g.sq).toFixed(3)}) translate(0 ${-HEAD_R})`;
  const hold = (h: 'ball' | 'phone' | null, p: P2, sd: number) => h === 'ball' ? <Ball p={[p[0] + sd * 8, p[1] - 6]} r={24} /> : h === 'phone' ? <Phone p={[p[0], p[1] - 30]} rot={sd * 8} back={p[0] < 20} /> : null;
  return (
    <W><g transform={`translate(${(g.x + jig).toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)})`}>
      {[g.footA, g.footB].map((f, i) => <Limb key={'l' + i} S={[(i ? 1 : -1) * 19, HIPY + 4]} H={f} L={37} sd={i ? -1 : 1} w={30} hand={false} />)}
      {[g.footA, g.footB].map((f, i) => <ellipse key={'f' + i} cx={f[0] + g.dir * 8} cy={f[1] + 5} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />)}
      <g transform={`rotate(${g.lean.toFixed(2)} 0 ${HIPY})`}>
        <Limb S={SA} H={HA} L={77} sd={g.armA[1] > 0 ? 1 : -1} />
        {hold(g.holdA, HA, -1)}
        <path d={torsoD(47, SHY, HIPY + 13)} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        <g transform={headT}><g transform={`scale(${g.dir} 1)`}>
          <RFace t={t} mood={g.mood} uid={uid} lookX={g.lookX} lookY={g.lookY} cream={g.cream} blink={g.blink} />
        </g></g>
        <Limb S={SB} H={HB} L={77} sd={g.armB[1] > 0 ? -1 : 1} />
        {hold(g.holdB, HB, 1)}
      </g>
    </g></W>
  );
};

// ---------- the rabbit: side view facing +x (mirrored by dir), feet at 0 ----------
type BMood = 'smug' | 'look' | 'laugh' | 'pop' | 'sniff' | 'chew' | 'proud';
type BS = {x: number; y: number; s: number; dir: number; mood: BMood; lookX: number; ear: number; nose: number; tilt: number; shake: number; hide: number; sq: number; whisk: number};
const RHEAD: P2 = [62, -178];
const RabbitC: React.FC<{t: number; B: BS}> = ({t, B}) => {
  if (B.hide >= 1) return null;
  const jig = B.shake * 3 * Math.sin(t * 60);
  const tw = B.nose * Math.sin(t * 38) * 3;            // nose twitch
  const earA = -18 + 6 * Math.sin(t * 2.2) + B.ear * 14, earB = -4 + 5 * Math.sin(t * 2.6 + 1) + B.ear * 10;
  const eye = (() => {
    const ex = 70, ey = -190;
    if (B.mood === 'laugh') return <path d={`M ${ex - 14} ${ey + 4} Q ${ex} ${ey - 12} ${ex + 14} ${ey + 4}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    const lid = B.mood === 'smug' || B.mood === 'proud' ? 0.48 : B.mood === 'chew' ? 0.3 : 0, big = B.mood === 'pop' ? 1.15 : 1;
    return <g><ellipse cx={ex} cy={ey} rx={16 * big} ry={19 * big} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      <circle cx={ex + B.lookX * 6} cy={ey + 2 + lid * 6} r={8} fill={INK} /><circle cx={ex + B.lookX * 6 - 2.5} cy={ey - 1 + lid * 6} r={2.8} fill="#FFF" />
      {lid ? <path d={lidPath(ex, ey, 16.5 * big, 19.5 * big, lid)} fill={RAB} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}</g>;
  })();
  const brow = B.mood === 'smug' || B.mood === 'proud' ? 'M 52 -220 L 88 -224' : B.mood === 'pop' ? 'M 52 -224 Q 70 -236 88 -226' : 'M 52 -218 Q 70 -224 88 -220';
  const chew = B.mood === 'chew' ? 3 * Math.sin(t * 30) : 0;
  return (
    <W><g transform={`translate(${(B.x + jig).toFixed(1)} ${B.y.toFixed(1)}) scale(${(B.dir * B.s * (1 + 0.06 * B.sq)).toFixed(3)} ${(B.s * (1 - 0.1 * B.sq)).toFixed(3)}) rotate(${B.tilt.toFixed(1)} 0 -40)`}>
      {/* back ear */}
      <g transform={`rotate(${earA.toFixed(1)} 44 -222)`}><ellipse cx={44} cy={-300} rx={22} ry={70} fill={RAB_DK} stroke={INK} strokeWidth={5.5} /></g>
      {/* tail, haunch, body */}
      <circle cx={-92} cy={-78} r={24} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} />
      <ellipse cx={-22} cy={-62} rx={74} ry={62} fill={RAB} stroke={INK} strokeWidth={6} />
      <ellipse cx={14} cy={-92} rx={70} ry={66} fill={RAB} stroke={INK} strokeWidth={6} />
      <ellipse cx={40} cy={-80} rx={30} ry={44} fill={RAB_LT} />
      <ellipse cx={-30} cy={-8} rx={64} ry={14} fill={RAB} stroke={INK} strokeWidth={5.5} />
      <ellipse cx={64} cy={-14} rx={18} ry={14} fill={RAB} stroke={INK} strokeWidth={5} />
      <ellipse cx={86} cy={-16} rx={18} ry={14} fill={RAB} stroke={INK} strokeWidth={5} />
      {/* head */}
      <circle cx={RHEAD[0]} cy={RHEAD[1]} r={56} fill={RAB} stroke={INK} strokeWidth={6} />
      <circle cx={106} cy={-162} r={26} fill={RAB_LT} stroke={INK} strokeWidth={5} />
      <path d={`M ${120 + tw * 0.3} -176 q 8 -2 12 6 q -4 8 -12 6 Z`} fill={NOSE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d={`M 116 ${-152 + chew} q 6 6 12 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      {[[-8, -10], [0, 0], [8, 10]].map(([dy, da], i) => <path key={i} d={`M 120 ${-166 + dy * 0.4} l ${(44 + B.whisk * 22) * Math.cos(rad(da + tw))} ${(44 + B.whisk * 22) * Math.sin(rad(da + tw))}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />)}
      {eye}
      <path d={brow} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* front ear */}
      <g transform={`rotate(${earB.toFixed(1)} 64 -226)`}><ellipse cx={64} cy={-306} rx={24} ry={74} fill={RAB} stroke={INK} strokeWidth={6} /><ellipse cx={66} cy={-300} rx={11} ry={54} fill={EAR_IN} /></g>
    </g></W>
  );
};

// ---------- props and set ----------
const Pie: React.FC<{p: P2; s: number; rot?: number}> = ({p, s, rot = 0}) => (
  <g transform={`translate(${P(p)}) rotate(${rot}) scale(${s})`}>
    <path d="M -60 6 L -48 30 L 48 30 L 60 6 Z" fill={TIN} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -64 6 Q -60 -30 -30 -28 Q -20 -50 0 -44 Q 20 -52 32 -30 Q 62 -32 64 6 Z" fill={CREAM} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={0} cy={-46} r={10} fill="#E2453C" stroke={INK} strokeWidth={4} />
  </g>
);
const Carrot: React.FC<{p: P2; s?: number; rot?: number; bite?: number}> = ({p, s = 1, rot = 0, bite = 0}) => (
  <g transform={`translate(${P(p)}) rotate(${rot}) scale(${s})`}>
    {[-14, 0, 14].map((a, i) => <path key={i} d={`M -40 0 q -20 ${-12 + a} -40 ${-6 + a * 1.6}`} stroke={CARROT_LF} strokeWidth={9} fill="none" strokeLinecap="round" />)}
    <path d={`M -42 -15 Q ${lerp(60, 20, bite)} -8 ${lerp(70, 30, bite)} 0 Q ${lerp(60, 20, bite)} 8 -42 15 Z`} fill={CARROT} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {[-20, 0, 20].map((x, i) => x < lerp(60, 20, bite) - 10 ? <path key={'l' + i} d={`M ${x} -8 l 6 4`} stroke="#C8641A" strokeWidth={3} strokeLinecap="round" /> : null)}
  </g>
);
const BgTree: React.FC<{x: number; s: number}> = ({x, s}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <rect x={-20} y={-300} width={40} height={300} fill={BARK} stroke={INK} strokeWidth={6} />
    {[[-64, -340, 84], [56, -360, 90], [-6, -430, 104]].map(([dx, dy, r], i) => <circle key={'c' + i} cx={dx} cy={dy} r={r} fill={i % 2 ? LEAF : LEAF_DK} stroke={INK} strokeWidth={6} />)}
    {[[-64, -340, 84], [56, -360, 90], [-6, -430, 104]].map(([dx, dy, r], i) => <circle key={'f' + i} cx={dx} cy={dy} r={r - 3} fill={i % 2 ? LEAF : LEAF_DK} />)}
  </g>
);
const Tuft: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) =>
  <path d={`M ${x - 18 * s} ${y} q ${4 * s} ${-26 * s} ${10 * s} ${-34 * s} q ${2 * s} ${18 * s} ${6 * s} ${30 * s} q ${4 * s} ${-22 * s} ${14 * s} ${-28 * s} q ${-2 * s} ${16 * s} ${4 * s} ${28 * s} Z`} fill={GRASS_DK} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />;

// ---------- SEEN FROM ABOVE panel ----------
const XR_Y = 1000, XR_R = 330;
const XFrame: React.FC<{id: string; R: number; children: React.ReactNode}> = ({id, R, children}) => (
  <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
    <clipPath id={id}><circle r={R} /></clipPath>
    <circle r={R + 18} fill={INK} />
    <g clipPath={`url(#${id})`}>
      <rect x={-450} y={-450} width={900} height={900} fill={XBG} />
      {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
      {children}
    </g>
    <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
  </svg>
);
const XWrap: React.FC<{s: number; children: React.ReactNode}> = ({s, children}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540 - 450, top: XR_Y - 450, width: 900, height: 900, transform: `scale(${s.toFixed(3)})`}}>{children}</div>) : null;
const sector = (c: P2, r: number, a0: number, a1: number) => {
  const p0: P2 = [c[0] + r * Math.cos(rad(a0)), c[1] + r * Math.sin(rad(a0))], p1: P2 = [c[0] + r * Math.cos(rad(a1)), c[1] + r * Math.sin(rad(a1))];
  return `M ${P(c)} L ${P(p0)} A ${r} ${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} ${a1 > a0 ? 1 : 0} ${P(p1)} Z`;
};
const AbovePanel: React.FC<{t: number; s: number}> = ({t, s}) => {
  const grow = eio(seg(t, CONE0, CONE1));
  const blind = popIn(t, BL0, 0.3), fl = blind > 0.5 ? 0.6 + 0.4 * Math.sin(t * 14) : blind;
  // fields: left eye from -95 deg (just left of the nose) counter-clockwise; right eye from -85 deg clockwise (0 deg = right, -90 = up)
  const span = 178 * grow;
  return <XWrap s={s}><XFrame id="abv" R={XR_R}>
    <g transform="translate(0 70)">
      <path d={sector([-34, -50], 380, -97 - span, -97)} fill={CONE_C} opacity={0.42} />
      <path d={sector([34, -50], 380, -83, -83 + span)} fill={CONE_C} opacity={0.42} />
      {blind > 0.01 ? <path d={sector([0, -150], 400, -100, -80)} fill={RED} opacity={0.8 * fl} /> : null}
      {/* the rabbit's head seen from above: ears back, nose forward, eyes on the sides */}
      <g transform="scale(1.7)">
      <ellipse cx={-26} cy={80} rx={20} ry={70} fill={RAB_DK} stroke={INK} strokeWidth={5} transform="rotate(14 -26 30)" />
      <ellipse cx={26} cy={80} rx={20} ry={70} fill={RAB_DK} stroke={INK} strokeWidth={5} transform="rotate(-14 26 30)" />
      <ellipse cx={0} cy={0} rx={62} ry={84} fill={RAB} stroke={INK} strokeWidth={6} />
      <ellipse cx={0} cy={-72} rx={26} ry={20} fill={RAB_LT} stroke={INK} strokeWidth={5} />
      <ellipse cx={0} cy={-88} rx={10} ry={7} fill={NOSE_C} stroke={INK} strokeWidth={3.5} />
      {[-1, 1].map((sd) => <g key={sd}><ellipse cx={sd * 58} cy={-30} rx={14} ry={22} fill="#FFFFFF" stroke={INK} strokeWidth={5} /><ellipse cx={sd * 63} cy={-30} rx={6} ry={10} fill={INK} /></g>)}
      </g>
    </g>
  </XFrame></XWrap>;
};

// ---------- the story over time ----------
const baseG = (): GS => ({x: GX, y: 0, rot: 0, lean: 0, dir: 1, armA: [-30, 112], armB: [30, 112], footA: [-27, -12], footB: [27, -12], mood: 'smug', lookX: -1, lookY: 0,
  sq: 0, tilt: 0, trem: 0, cream: 0, blink: 0, hide: 0, holdA: null, holdB: null});
const BEHIND: P2 = [-128, 20];          // his left hand behind his back (offset from the left shoulder)
/** a ball thrown at his back, caught at `at` in his left hand: world position or null */
const ballFly = (t: number, at: number, hand: P2): P2 | null => {
  const T0 = at - 0.46; if (t < T0 || t >= at) return null;
  const u = (t - T0) / 0.46;
  return [lerp(BALL_FROM[0], hand[0], u), lerp(BALL_FROM[1], hand[1], u) - 120 * Math.sin(Math.PI * u)];
};
const guyAt = (t: number): GS => {
  const g = baseG();
  if (t < S2) {             // frame 0: he catches balls behind his back without turning
    g.armA = BEHIND; g.mood = 'smug'; g.lookX = -1; g.lookY = 0;
    g.holdA = t >= CATCH1 && t < 1.05 ? 'ball' : t >= CATCH2 ? 'ball' : null;
    if (t > 1.05 && t < CATCH2 - 0.3) g.armA = lp2(BEHIND, [-60, 90], Math.sin(Math.PI * seg(t, 1.05, CATCH2 - 0.3)));
    g.sq = hit(t, CATCH1, 0.25, 9) * Math.cos((t - CATCH1) * 30) + hit(t, CATCH2, 0.25, 9) * Math.cos((t - CATCH2) * 30);
    g.lean = -2 + 1.5 * Math.sin(t * 2.5);
    if (t > 2.05) { g.lookX = lerp(-1, 0.2, seg(t, 2.05, 2.3)); }
    return g;
  }
  if (t < S3) {             // the pie from the front
    g.armA = BEHIND; g.holdA = 'ball'; g.lookX = t < SPLAT ? 0.1 : -0.2; g.mood = t < SPLAT ? 'smug' : t < SPLAT + 0.3 ? 'squint' : 'deadpan';
    g.cream = t < SPLAT ? 0 : eout(seg(t, SPLAT, SPLAT + 0.12));
    g.sq = hit(t, SPLAT, 0.5, 6) * Math.cos((t - SPLAT) * 24); g.tilt = -8 * hit(t, SPLAT, 1, 5);
    g.blink = t > 3.5 && t < 3.62 ? 1 : 0;
    return g;
  }
  if (t < S6) { g.hide = 1; return g; }
  if (t < S7) {             // the phone: held in front he can't see it; against the side of his head he can
    g.cream = 0; g.holdB = 'phone';
    const k = eio(seg(t, PH0, PH1));
    g.armB = lp2([92, -46], [-22, -52], k); g.armA = [-34, 110];
    g.mood = t < PH0 ? 'puzzled' : t < PH1 + 0.05 ? 'puzzled' : 'happy'; g.lookX = t < PH1 ? 0.8 : 0;
    return g;
  }
  // he walks backwards (to the left) and catches the next ball behind his back
  const u = seg(t, S7, PUSH);
  g.x = lerp(220, 0, eout(u)); g.mood = 'smug'; g.lookX = -1;
  const ph = 2 * Math.PI * 1.9 * (t - S7), walking = t < CATCH3 - 0.2 ? 1 : 1 - seg(t, CATCH3 - 0.2, CATCH3);
  g.footA = [-27 - 10 * Math.sin(ph) * walking, -12 - 16 * Math.max(0, Math.sin(ph)) * walking];
  g.footB = [27 + 10 * Math.sin(ph) * walking, -12 - 16 * Math.max(0, -Math.sin(ph)) * walking];
  g.y = -6 * Math.abs(Math.sin(ph)) * walking;
  g.armA = lp2([-60, 80], BEHIND, eout(seg(t, CATCH3 - 0.5, CATCH3 - 0.25)));
  g.holdA = t >= CATCH3 ? 'ball' : null;
  g.sq = hit(t, CATCH3, 0.25, 9) * Math.cos((t - CATCH3) * 30);
  return g;
};
const baseB = (): BS => ({x: RX, y: 0, s: RS, dir: -1, mood: 'smug', lookX: 1, ear: 0, nose: 0.4, tilt: 0, shake: 0, hide: 0, sq: 0, whisk: 0});
const rabbitAt = (t: number): BS => {
  const B = baseB();
  if (t < S3) { B.mood = t > SPLAT + 0.05 ? 'laugh' : 'smug'; B.shake = B.mood === 'laugh' ? 1 : 0; return B; }
  if (t < S5) { B.x = 900; B.dir = 1; B.s = 1.0; B.mood = t < T.sides ? 'look' : 'smug'; B.lookX = t < T.sides ? -1 : 1; B.ear = 0.3; return B; }
  if (t < S6) {             // the carrot under its nose: it sniffs, the whiskers find it, it eats
    B.x = 900; B.dir = 1; B.s = 1.0; B.nose = t > SNIFF0 ? 1.6 : 0.6; B.lookX = Math.sin(t * 3) > 0 ? 1 : -1;
    B.mood = t < FIND ? 'look' : 'chew'; B.whisk = t > T.feeling - 0.1 && t < FIND + 0.1 ? Math.sin(Math.PI * seg(t, T.feeling - 0.1, FIND + 0.1)) : 0;
    return B;
  }
  if (t < S7) { B.mood = t > PH1 ? 'laugh' : 'look'; B.shake = t > PH1 ? 1 : 0; B.lookX = -1; return B; }
  B.mood = 'smug'; B.lookX = 1;
  return B;
};

// ---------- camera (piecewise, hard cuts) ----------
const CAM0 = {x: 0, y: -222, k: 2.4};
const camFor = (t: number): {x: number; y: number; k: number} => {
  if (t < S2) { const u = eio(seg(t, 0, S2)); return {x: lerp(CAM0.x, 16, u), y: lerp(CAM0.y, -220, u), k: lerp(CAM0.k, 2.5, u)}; }
  if (t < S3) { const u = eio(seg(t, S2, S3)); return {x: lerp(GX + 40, GX + 34, u), y: lerp(-226, -232, u), k: lerp(3.6, 3.82, u)}; }
  if (t < S4) { const u = eio(seg(t, S3, S4)); return {x: lerp(900 + 60, 900 + 70, u), y: lerp(-196, -200, u), k: lerp(3.1, 3.3, u)}; }
  if (t < S5) return {x: 900 + 30, y: -230, k: 2.2};
  if (t < S6) { const u = eio(seg(t, S5, S6)); return {x: lerp(900 + 120, 900 + 126, u), y: lerp(-196, -200, u), k: lerp(2.85, 2.95, u)}; }
  if (t < S7) { const u = eio(seg(t, S6, S7)); return {x: lerp(GX + 30, GX + 24, u), y: lerp(-220, -226, u), k: lerp(3.3, 3.45, u)}; }
  const u = eio(seg(t, S7, PUSH));
  return {x: lerp(90, CAM0.x, u), y: lerp(-206, CAM0.y, u), k: lerp(2.3, CAM0.k, u)};
};

export const RabbitScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t), B = rabbitAt(t);
  if (thumb) { g.cream = 0; g.mood = 'smug'; g.lookX = -1; g.sq = 0; g.tilt = 0; g.holdA = 'ball'; g.armA = BEHIND; B.mood = 'pop'; B.shake = 0; }
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 4, 7) + hit(t, CATCH1, 4, 8) + hit(t, SPLAT, 9, 6) + hit(t, CATCH2, 3, 8));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const hA = handPos({...g, armA: BEHIND}, -1);
  const balls = [CATCH1, CATCH2, CATCH3, PUSH + CATCH1].map((c) => {
    const hand: P2 = c === CATCH3 || c > PUSH ? handPos({...guyAt(Math.min(c, PUSH - 0.01)), armA: BEHIND}, -1) : hA;
    return ballFly(t, c, hand);
  });
  // the pie: from beyond the right edge straight into his face
  const head = headPos(g);
  const pieU = seg(t, 2.42, SPLAT);
  const pieP: P2 = [lerp(head[0] + 230, head[0] + 70, eio(pieU)), lerp(head[1] - 30, head[1] - 4, pieU)];
  const st = {
    catch1: popIn(t, CATCH1, 0.18) * (1 - seg(t, CATCH1 + 0.45, CATCH1 + 0.58)),
    catch2: popIn(t, CATCH2, 0.18) * (1 - seg(t, CATCH2 + 0.45, CATCH2 + 0.58)),
    splat: popIn(t, SPLAT, 0.18) * (1 - seg(t, S3 - 0.12, S3)),
    sniff: popIn(t, T.sniffing - 0.02, 0.2) * (1 - seg(t, T.feeling - 0.1, T.feeling)),
    crunch: popIn(t, FIND, 0.2) * (1 - seg(t, S6 - 0.1, S6)),
    q: popIn(t, PH0 - 0.1, 0.2) * (1 - seg(t, PH1 - 0.05, PH1)),
    ah: popIn(t, PH1, 0.2) * (1 - seg(t, S7 - 0.08, S7)),
    catch3: popIn(t, CATCH3, 0.18) * (1 - seg(t, PUSH - 0.1, PUSH)),
  };
  const carrotBite = eio(seg(t, FIND, S6 - 0.05));
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`rFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Layer cam={cam} z={2600}><W><g>
        {[-2600, -1300, 0, 1300, 2600].map((x, i) => <ellipse key={i} cx={x} cy={40} rx={900} ry={300 + (i % 3) * 60} fill={HILL} stroke={INK} strokeWidth={6} />)}
        {[-1900, -1100, -500, 400, 1200, 1900, 2600].map((x, i) => <BgTree key={'t' + i} x={x} s={0.9 + (i % 3) * 0.15} />)}
        <rect x={-6000} y={-10} width={12000} height={4000} fill={GRASS_DK} />
        <path d="M -6000 -10 H 6000" stroke={INK} strokeWidth={6} />
      </g></W></Layer>
      <Layer cam={cam} z={1000}><W><g>
        <rect x={-3000} y={0} width={6000} height={3000} fill={GRASS} />
        <path d="M -3000 0 H 3000" stroke={INK} strokeWidth={6} />
        {Array.from({length: 40}, (_, i) => { const x = -1600 + i * 110 + ((i * 37) % 50); return <Tuft key={i} x={x} y={14 + (i % 3) * 22} s={0.9 + (i % 4) * 0.1} />; })}
        {[[-260, 1], [520, 0.9], [1180, 1.1], [640, 0.8]].map(([x, s], i) => <g key={'fl' + i} transform={`translate(${x} 20) scale(${s})`}>
          <path d="M 0 0 V -40" stroke={LEAF_DK} strokeWidth={6} />{[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={14 * Math.cos(rad(a))} cy={-44 + 14 * Math.sin(rad(a))} r={9} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} />)}
          <circle cx={0} cy={-44} r={8} fill={GOLD} stroke={INK} strokeWidth={3.5} /></g>)}
      </g></W></Layer>
      <Layer cam={cam} z={1000}>
        <RabbitC t={t} B={B} />
        {t >= S5 && t < S6 ? <W><Carrot p={[lerp(900 + 262, 900 + 196, eio(seg(t, FIND - 0.05, FIND + 0.2))), -160]} s={0.8} rot={0} bite={carrotBite} /></W> : null}
        {(t < S2 || t >= S7) && !g.hide ? <W><path d={sector([head[0] + 2, head[1] - 6], 300, 136, 232)} fill={CONE_C} opacity={0.34 + 0.06 * Math.sin(t * 6)} />
          <path d={sector([head[0] + 2, head[1] - 6], 300, 136, 232)} fill="none" stroke="#3FB872" strokeWidth={4} strokeDasharray="14 10" opacity={0.8} /></W> : null}
        <GuyR t={t} g={g} uid={uid} />
        <W>{balls.map((b, i) => b ? <Ball key={i} p={b} spin={t * 500} /> : null)}</W>
        {t > 2.42 && t < SPLAT ? <W><Pie p={pieP} s={lerp(1.25, 0.95, pieU)} rot={-90} /></W> : null}
        {t >= SPLAT && t < SPLAT + 0.5 ? <W>{Array.from({length: 9}, (_, i) => { const a = rad(-80 + i * 22), u = seg(t, SPLAT, SPLAT + 0.5);
          return <circle key={i} cx={head[0] + 60 + Math.cos(a) * 90 * u} cy={head[1] + Math.sin(a) * 90 * u + 60 * u * u} r={9 * (1 - u)} fill={CREAM} stroke={INK} strokeWidth={3.5} />; })}</W> : null}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={hA[0] + 10} y={hA[1] - 130} s={st.catch1} text="CATCH" size={42} rot={-8} fill="#FFFFFF" />
        <Txt x={hA[0] + 20} y={hA[1] - 130} s={st.catch2} text="CATCH" size={42} rot={6} fill="#FFFFFF" />
        <Txt x={head[0] + 40} y={head[1] - 120} s={st.splat} text="SPLAT" size={54} rot={-6} fill="#FFFFFF" />
        <Txt x={900 + 150} y={-290} s={st.sniff} text="SNIFF SNIFF" size={34} rot={-6} fill="#FFFFFF" />
        <Txt x={900 + 150} y={-290} s={st.crunch} text="CRUNCH" size={42} rot={6} fill={GOLD} />
        <Txt x={head[0] + 110} y={head[1] - 100} s={st.q} text="?" size={80} rot={8} fill="#FFFFFF" />
        <Txt x={head[0] + 120} y={head[1] - 96} s={st.ah} text="AH" size={60} rot={-8} fill={GOLD} />
        <Txt x={hA[0] + 30} y={hA[1] - 130} s={st.catch3} text="CATCH" size={42} rot={-8} fill="#FFFFFF" />
      </Layer>}
      {thumb ? null : <>
        <Card text="SEES BEHIND" top={1452} color="#FFFFFF" rot={-3} s={1 - seg(t, S2 - 0.12, S2)} size={84} />
        <Card text="NEVER SAW IT" top={1452} color={RED} fg="#fff" rot={3} s={popIn(t, SPLAT, 0.28) * (1 - seg(t, S3 - 0.12, S3)) * pulse(t, SPLAT)} size={84} />
        <Card text="EYES ON THE SIDES" top={1452} color={GOLD} rot={-3} s={popIn(t, T.sides - 0.04, 0.28) * (1 - seg(t, S4 - 0.12, S4))} size={66} />
        <Card text="BLIND SPOT" top={1452} color={RED} fg="#fff" rot={-3} s={popIn(t, T.blind - 0.04, 0.28) * (1 - seg(t, S5 - 0.12, S5)) * pulse(t, T.blind)} size={92} />
        <Card text="WHISKERS" top={1452} color="#FFFFFF" rot={3} s={popIn(t, T.whiskers - 0.04, 0.26) * (1 - seg(t, S6 - 0.12, S6))} size={84} />
        <Card text="WALKS BACKWARDS" top={1452} color={GOLD} rot={-3} s={popIn(t, T.walks - 0.04, 0.28) * (1 - seg(t, PUSH - 0.12, PUSH))} size={70} />
      </>}
      <AbovePanel t={t} s={popIn(t, S4 + 0.02, 0.35) * (1 - seg(t, S5 - 0.12, S5)) * (t >= S4 ? 1 : 0)} />
      {thumb ? null : <>
        <Card text="SEEN FROM ABOVE" top={XR_Y - XR_R - 26} size={50} rot={-2} s={popIn(t, S4 + 0.06, 0.3) * (1 - seg(t, S5 - 0.12, S5))} />
        <Counter left={800} top={XR_Y + 250} value={`${Math.round(eio(seg(t, CONE0, CONE1)) * 36) * 10}°`} label="NEARLY ALL ROUND" sub="YOU: 180°" rot={5}
          s={popIn(t, CONE0 - 0.1, 0.3) * (1 - seg(t, S5 - 0.12, S5)) * pulse(t, CONE1)} />
        <CommentBubble t={t} text="what if you had a rabbit's eyes??" handle="@bunny_doodle" likes="2.9K" y={400} />
        <CallToAction t={t} at={T.cta} y={250} />
        <CommentAsk t={t} at={T.so} until={PUSH - 0.4} text="Would you swap your eyes?" y={280} />
      </>}
    </AbsoluteFill>
  );
};

export const RabbitVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const cues: Cue[] = [
    // frame 0: a ball whooshes at his back, THWACK into his hand behind his back
    {f: 'whoosh.wav', at: 0, db: -10, from: 0.1}, {f: 'slap.wav', at: CATCH1, db: -7}, {f: 'pop.wav', at: CATCH1, db: -20},
    {f: 'whoosh.wav', at: CATCH2 - 0.44, db: -16}, {f: 'slap.wav', at: CATCH2, db: -10},
    // the pie
    {f: 'whoosh.wav', at: S2 - 0.03, db: -30}, {f: 'whoosh_slow.wav', at: 2.45, db: -16}, {f: 'squelch.wav', at: SPLAT - 0.02, db: -5}, {f: 'splash.wav', at: SPLAT, db: -18},
    {f: 'pop.wav', at: SPLAT + 0.02, db: -20}, {f: 'crowd_laugh.wav', at: SPLAT + 0.15, db: -22, to: 1.0},
    // the rabbit's eye on the side
    {f: 'whoosh.wav', at: S3 - 0.03, db: -30}, {f: 'pop.wav', at: T.sides - 0.04, db: -21},
    // seen from above: the fields sweep round, the blind spot
    {f: 'zap.wav', at: S4, db: -23}, {f: 'shimmer.wav', at: CONE0, db: -20}, ...ticks(CONE0, CONE1, 12, -31), {f: 'ding.mp3', at: CONE1 + 0.02, db: -19},
    {f: 'beep.wav', at: BL0, db: -16}, {f: 'beep.wav', at: T.blind - 0.04, db: -16}, {f: 'pop.wav', at: T.blind - 0.04, db: -20},
    ...ctaCues(T.cta),
    // the carrot: sniff, whiskers, crunch
    {f: 'whoosh.wav', at: S5 - 0.03, db: -30}, {f: 'pfft.wav', at: SNIFF0, db: -20}, {f: 'pfft.wav', at: SNIFF0 + 0.3, db: -21}, {f: 'pfft.wav', at: SNIFF0 + 0.6, db: -21},
    {f: 'squeak.wav', at: T.feeling, db: -24}, {f: 'crack.wav', at: FIND - 0.32, db: -14}, {f: 'pop.wav', at: T.whiskers - 0.04, db: -21},
    // the phone
    {f: 'whoosh.wav', at: S6 - 0.03, db: -30}, {f: 'pop.wav', at: PH0 - 0.1, db: -22}, {f: 'whoosh.wav', at: PH0 + 0.05, db: -24}, {f: 'ding.mp3', at: PH1, db: -20},
    {f: 'giggle.mp3', at: PH1 + 0.05, db: -26, to: 0.6},
    // walking backwards, the next ball
    {f: 'whoosh.wav', at: S7 - 0.03, db: -30}, {f: 'footsteps.mp3', at: S7 + 0.05, db: -18, to: 1.4}, {f: 'pop.wav', at: T.walks - 0.04, db: -21},
    {f: 'whoosh.wav', at: CATCH3 - 0.46, db: -16}, {f: 'slap.wav', at: CATCH3, db: -9}, {f: 'whoosh.wav', at: PUSH - 0.05, db: -22},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<RabbitScene t={0} />}>
        <RabbitScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="rabbit/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const RabbitWide: React.FC = () => <WideFit.Provider value={0.72}><RabbitVideo /></WideFit.Provider>;
