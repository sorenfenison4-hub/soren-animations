// "What if you had a gecko's feet?" - owl formula (CLAUDE.md, Growth): the power is ON him at frame 0 (green gecko toe
// pads on his hands and feet, spread flat on a tall wall, already sliding down with green skid marks), the co-star does
// it with ease next to him (a smug gecko stuck to the same wall), GECKO TOE X-RAY (pad -> ridges -> 6,500,000 hairs,
// live counter), the gecko dangling an ON PAPER weight that counts up to 130 kg, the comedy hit made by the power itself
// (his pads peel, he drops, BOING, dizzy + laugh), a STICKY SKIN NEEDED body map filling to 40 % (= YOUR WHOLE FRONT),
// and the dumb-but-funny ending (he covers his whole front in pads, SPLAT, stuck high up - getting down is the problem)
// that slides back into frame 0. The guy is drawn fully in code here (spread on the wall, no library pose fits).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle, CommentAsk, Sweat} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.1; times below are video time). Last word ends ~19.6 s.
export const DURATION = 20.5;
export const T = {
  feet: 0.90, still: 1.85, slide: 2.06, wall: 2.86,                                  // "Get a gecko's feet, and you'd still slide right off the wall."
  gecko: 3.45, toes: 3.88, six: 4.68, million: 5.63, tiny: 6.14, hairs: 6.50,       // "A gecko's toes carry six and a half million tiny hairs."
  paper: 7.37, hold: 8.32, hundred: 8.65, kilos: 9.48,                              // "On paper, they could hold a hundred and thirty kilos."
  but: 10.37, heavy: 10.95, pads: 11.39, small: 12.01,                              // "But you're too heavy for pads that small."
  need: 12.70, sticky: 12.95, forty: 13.75, percent: 14.12, body: 14.77,            // "You'd need sticky pads on forty percent of your body."
  whole: 15.61, front: 15.86,                                                       // "Your whole front."
  so: 16.48, did: 17.21,                                                            // "So he did it."
  now: 17.70, getting: 17.99, down: 18.35, problem: 18.94,                          // "Now getting down is the problem."
  cta: 12.85,
};
const DROP = 11.2, LAND = 11.68;      // his pads let go / he hits the ground
const SPLAT = 16.62;                  // whole-front pads slap onto the wall

const GOLD = '#FFD43B', RED = '#E2453C';
const GK = '#86C95A', GK2 = '#5E9E3E', GK_D = '#3F7A2A', GK_L = '#C9EBA6';   // gecko greens
const PAD = '#9BD46A';
const GX = 0;                          // guy's torso x on the wall
const KX = 250;                        // gecko x on the wall

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
const Sticker: React.FC<{text: string; s: number; x: number | string; y: number; rot?: number; bg?: string; size?: number; color?: string}> = ({text, s, x, y, rot = 0, bg = '#fff', size = 54, color = INK}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: bg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 24px', fontFamily: FONT, fontWeight: 900, fontSize: size, color, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>) : null;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

const Defs: React.FC = () => (
  <W><defs>
    <radialGradient id="gFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <linearGradient id="gSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FCBEA" /><stop offset="1" stopColor="#DDF1F7" /></linearGradient>
    <pattern id="gBricks" width="120" height="60" patternUnits="userSpaceOnUse">
      <rect width="120" height="60" fill="#F1DDBD" />
      <path d="M 0 0 H 120 M 0 30 H 120 M 30 0 V 30 M 90 30 V 60" stroke="#D8BB92" strokeWidth={4} />
    </pattern>
  </defs></W>
);

// ---------- the tall wall ----------
const WALL_TOP = -2300;
const Wall: React.FC = () => (
  <W>
    <rect x={-4000} y={-6000} width={9000} height={6000} fill="url(#gSky)" />
    <rect x={-1400} y={WALL_TOP} width={2900} height={-WALL_TOP} fill="url(#gBricks)" />
    {/* roof edge */}
    <rect x={-1460} y={WALL_TOP - 60} width={3020} height={70} rx={10} fill="#C8664A" stroke={INK} strokeWidth={9} />
    <path d={`M -1400 ${WALL_TOP} V 0 M 1500 ${WALL_TOP} V 0`} stroke={INK} strokeWidth={9} />
    {/* windows */}
    {[[-560, -1650], [560, -1650], [-560, -1050], [600, -380], [-620, -420]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        <rect x={-110} y={-140} width={220} height={280} rx={10} fill="#BFE3F2" stroke={INK} strokeWidth={9} />
        <path d="M 0 -140 V 140 M -110 0 H 110" stroke={INK} strokeWidth={8} />
        <path d="M -80 -110 L -30 -110 M -80 -90 L -55 -90" stroke="#fff" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
        <rect x={-130} y={140} width={260} height={24} rx={6} fill="#E8D2AC" stroke={INK} strokeWidth={7} />
      </g>))}
    {/* grass */}
    <rect x={-4000} y={0} width={9000} height={3000} fill="#9CCB7A" />
    <path d="M -4000 0 H 5000" stroke={INK} strokeWidth={9} />
    {Array.from({length: 40}, (_, i) => {
      const x = -1600 + rnd(i * 3) * 3200, y = 30 + rnd(i * 7) * 500;
      return <path key={i} d={`M ${x - 14} ${y} l 8 -26 l 6 22 l 8 -30 l 6 34`} stroke="#5A8A43" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
  </W>
);

// ---------- gecko toe pads (on his hands and feet) ----------
/** a fan of 4 toes with round green pads at (x, y) pointing at angle ang (deg). curl 0..1 = toes peeling off. */
const Toes = (x: number, y: number, ang: number, curl: number, big = 1, key = '') => {
  const toes = [-42, -14, 14, 42].map((d, i) => {
    const a = (ang + d) * Math.PI / 180, L = (30 - 14 * curl) * big;
    return {x2: x + Math.cos(a) * L, y2: y + Math.sin(a) * L, i};
  });
  return (
    <g key={key}>
      {toes.map((p) => <path key={'o' + p.i} d={`M ${x} ${y} L ${p.x2} ${p.y2}`} stroke={INK} strokeWidth={17 * big} strokeLinecap="round" />)}
      <circle cx={x} cy={y} r={18 * big} fill={INK} />
      {toes.map((p) => <path key={'f' + p.i} d={`M ${x} ${y} L ${p.x2} ${p.y2}`} stroke="#FFFFFF" strokeWidth={8 * big} strokeLinecap="round" />)}
      <circle cx={x} cy={y} r={12 * big} fill="#FFFFFF" />
      {toes.map((p) => <ellipse key={'p' + p.i} cx={p.x2} cy={p.y2} rx={(11 - 4 * curl) * big} ry={(9 - 3 * curl) * big} fill={PAD} stroke={INK} strokeWidth={4.5}
        transform={`rotate(${ang + [-42, -14, 14, 42][p.i]} ${p.x2} ${p.y2})`} />)}
    </g>
  );
};

// ---------- the guy, drawn in code (spread flat on the wall) ----------
type Mood = 'worried' | 'gasp' | 'dizzy' | 'calm' | 'happy' | 'strain' | 'proud';
type Limbs = {lh: number[]; rh: number[]; lf: number[]; rf: number[]};     // hand / foot positions relative to the torso centre
const SPREAD: Limbs = {lh: [-125, -150], rh: [125, -150], lf: [-80, 165], rf: [80, 165]};
const DOWN: Limbs = {lh: [-78, 70], rh: [78, 70], lf: [-34, 168], rf: [34, 168]};
const mixL = (a: Limbs, b: Limbs, u: number): Limbs => ({
  lh: [lerp(a.lh[0], b.lh[0], u), lerp(a.lh[1], b.lh[1], u)], rh: [lerp(a.rh[0], b.rh[0], u), lerp(a.rh[1], b.rh[1], u)],
  lf: [lerp(a.lf[0], b.lf[0], u), lerp(a.lf[1], b.lf[1], u)], rf: [lerp(a.rf[0], b.rf[0], u), lerp(a.rf[1], b.rf[1], u)]});

const Head: React.FC<{t: number; mood: Mood; roll?: number}> = ({t, mood, roll = 0}) => {
  const R = HEAD_R, eyeY = -10;
  const eye = (side: number) => {
    const ex = side * 30;
    if (mood === 'dizzy') return <path key={side} d="M 0 0 m -9 0 a 9 9 0 1 1 9 9 a 5 5 0 1 1 -4 -5" transform={`translate(${ex} ${eyeY}) rotate(${t * 900})`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (mood === 'happy' || mood === 'proud') return <path key={side} d={`M ${ex - 11} ${eyeY + 3} Q ${ex} ${eyeY - 10} ${ex + 11} ${eyeY + 3}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (mood === 'gasp' || mood === 'worried') return <g key={side} transform={`translate(${ex} ${eyeY})`}>
      <circle r={mood === 'gasp' ? 19 : 16} fill="#fff" stroke={INK} strokeWidth={5} />
      <circle cx={1.5 * Math.sin(t * 31)} cy={mood === 'worried' ? 5 : 1} r={6.5} fill={INK} />
    </g>;
    if (mood === 'strain') return <path key={side} d={`M ${ex - 12} ${eyeY - 4} L ${ex + 8 * side * -1 + 0} ${eyeY} L ${ex - 12} ${eyeY + 4}`} transform={side < 0 ? `scale(-1 1) translate(${-2 * ex} 0)` : undefined} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    return <ellipse key={side} cx={ex} cy={eyeY} rx={8.5} ry={13} fill={INK} />;
  };
  const brow = (side: number) => {
    const lift = mood === 'gasp' ? -14 : mood === 'worried' ? -8 : 0;
    const tilt = mood === 'worried' || mood === 'strain' ? side * -16 : 0;
    return <path key={side} transform={`translate(${side * 30} ${eyeY - 25 + lift}) rotate(${tilt})`} d="M -14 3 Q 0 -6 14 3" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
  };
  let mouth: React.ReactNode = <path d="M -16 26 Q 0 36 16 26" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'happy' || mood === 'proud') mouth = <path d="M -20 20 Q 0 44 20 20 Z" fill="#E4677A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
  if (mood === 'worried') mouth = <path d="M -18 32 Q -9 24 0 32 Q 9 40 18 32" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  if (mood === 'dizzy') mouth = <path d="M -16 30 Q -8 22 0 30 Q 8 38 16 30" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  if (mood === 'gasp') mouth = <ellipse cx={0} cy={34} rx={18} ry={22} fill="#5A2328" stroke={INK} strokeWidth={5} />;
  if (mood === 'strain') mouth = <g><rect x={-22} y={22} width={44} height={18} rx={8} fill="#fff" stroke={INK} strokeWidth={5} /><path d="M -22 31 H 22" stroke={INK} strokeWidth={3} /></g>;
  return (
    <g transform={`rotate(${roll})`}>
      <circle r={R + 6.5} fill={INK} />
      <circle r={R} fill="url(#gFace)" />
      <path d={`M ${R * 0.35} ${-R * 0.94} A ${R} ${R} 0 0 1 ${R * 0.35} ${R * 0.94} A ${R * 1.1} ${R * 1.1} 0 0 0 ${R * 0.35} ${-R * 0.94} Z`} fill="#C9C5BF" opacity={0.3} />
      {[-1, 1].map(brow)}{[-1, 1].map(eye)}
      {mouth}
    </g>
  );
};

/** the whole guy, torso centre at (0, 0) (draw inside a translated <g>). curl: toe peel 0..1; front: 0..1 green pads over his whole front. */
const GuyBody: React.FC<{t: number; limbs: Limbs; mood: Mood; curl?: number; front?: number; sx?: number; sy?: number; roll?: number; headRoll?: number; padBig?: number}> =
  ({t, limbs, mood, curl = 0, front = 0, sx = 1, sy = 1, roll = 0, headRoll = 0, padBig = 1}) => {
    const sh = [[-44, -48], [44, -48], [-26, 62], [26, 62]];
    const ends = [limbs.lh, limbs.rh, limbs.lf, limbs.rf];
    const path = (i: number) => {
      const [x0, y0] = sh[i], [x1, y1] = ends[i];
      const mx = (x0 + x1) / 2 + (i < 2 ? (x0 < 0 ? -14 : 14) : 0), my = (y0 + y1) / 2 + (i < 2 ? 10 : 0);
      return `M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`;
    };
    const torso = 'M 0 -86 C 56 -86 66 -30 64 20 C 62 72 40 96 0 96 C -40 96 -62 72 -64 20 C -66 -30 -56 -86 0 -86 Z';
    const ang = (i: number) => { const [x0, y0] = sh[i], [x1, y1] = ends[i]; return Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI; };
    return (
      <g transform={`rotate(${roll}) scale(${sx} ${sy})`}>
        {[0, 1, 2, 3].map((i) => <path key={'o' + i} d={path(i)} stroke={INK} strokeWidth={i < 2 ? 40 : 46} fill="none" strokeLinecap="round" />)}
        <path d={torso} fill={INK} stroke={INK} strokeWidth={14} strokeLinejoin="round" />
        {[0, 1, 2, 3].map((i) => <path key={'f' + i} d={path(i)} stroke="#FFFFFF" strokeWidth={i < 2 ? 27 : 33} fill="none" strokeLinecap="round" />)}
        <path d={torso} fill="#FFFFFF" />
        <path d="M 30 -80 C 60 -60 66 20 50 80 C 64 40 66 -40 30 -80 Z" fill="#D9D5CF" opacity={0.5} />
        {front > 0.01 ? <g opacity={front}>
          {[0, 1, 2, 3].map((i) => <path key={'g' + i} d={path(i)} stroke={PAD} strokeWidth={i < 2 ? 15 : 19} fill="none" strokeLinecap="round" />)}
          <path d="M 0 -72 C 46 -72 52 -26 50 18 C 48 64 32 82 0 82 C -32 82 -48 64 -50 18 C -52 -26 -46 -72 0 -72 Z" fill={PAD} stroke={INK} strokeWidth={5} />
          {Array.from({length: 7}, (_, j) => <path key={j} d={`M -40 ${-52 + j * 20} Q 0 ${-40 + j * 20} 40 ${-52 + j * 20}`} stroke={GK2} strokeWidth={5} fill="none" strokeLinecap="round" />)}
        </g> : null}
        {[0, 1, 2, 3].map((i) => Toes(ends[i][0], ends[i][1], ang(i), curl, (i < 2 ? 1 : 1.1) * padBig, 't' + i))}
        <g transform="translate(0 -142)"><Head t={t} mood={mood} roll={headRoll} /></g>
      </g>
    );
  };

// ---------- the gecko (seen from above, head up, stuck to the wall) ----------
type GMood = 'smug' | 'calm' | 'wide' | 'proud';
const Gecko: React.FC<{x: number; y: number; t: number; s?: number; rot?: number; mood?: GMood; step?: number; tongue?: number; lift?: number}> =
  ({x, y, t, s = 1, rot = 0, mood = 'smug', step = 0, tongue = 0, lift = 0}) => {
    const tw = 18 * Math.sin(t * 3.2);
    const tail = `M 0 60 C ${-30 + tw} 140 ${40 + tw * 2} 200 ${-10 + tw * 3} 290`;
    const leg = (side: number, front: boolean) => {
      const ph = front ? (side < 0 ? 0 : Math.PI) : (side < 0 ? Math.PI : 0);
      const sw = 14 * Math.sin(step * Math.PI * 2 + ph);
      const hx = side * 26, hy = front ? -40 : 46;
      const kx = side * 70, ky = (front ? -58 : 34) + sw;
      const fx = side * 82, fy = (front ? -100 : 92) + sw;
      const lifted = side > 0 && front ? lift : 0;
      return {d: `M ${hx} ${hy} Q ${kx} ${ky} ${fx} ${fy - lifted * 30}`, fx, fy: fy - lifted * 30, ang: front ? -90 + side * 35 : 90 - side * 35, lifted};
    };
    const legs = [leg(-1, true), leg(1, true), leg(-1, false), leg(1, false)];
    const lid = mood === 'smug' ? 0.5 : mood === 'proud' ? 0.6 : 0;
    const eye = (side: number) => (
      <g key={side} transform={`translate(${side * 30} -118)`}>
        <circle r={mood === 'wide' ? 22 : 19} fill="#F3D35A" stroke={INK} strokeWidth={5} />
        <ellipse rx={3.5} ry={mood === 'wide' ? 15 : 12} fill={INK} />
        {lid > 0 ? <path d={`M -20 ${-20 + 40 * lid - 20} A 20 20 0 0 1 20 ${-20 + 40 * lid - 20} Z`} fill={GK2} stroke={INK} strokeWidth={4} /> : null}
        {lid > 0 ? <path d={`M -21 ${-1} L 21 ${-1 + side * -3}`} stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
      </g>);
    return (
      <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
        <path d={tail} stroke={INK} strokeWidth={46} fill="none" strokeLinecap="round" />
        <path d={tail} stroke={GK} strokeWidth={33} fill="none" strokeLinecap="round" />
        {legs.map((l, i) => <path key={'lo' + i} d={l.d} stroke={INK} strokeWidth={28} fill="none" strokeLinecap="round" />)}
        {legs.map((l, i) => <path key={'lf' + i} d={l.d} stroke={GK} strokeWidth={16} fill="none" strokeLinecap="round" />)}
        {legs.map((l, i) => <g key={'ft' + i}>{[-40, -13, 13, 40].map((d, j) => {
          const a = (l.ang + d) * Math.PI / 180, px = l.fx + Math.cos(a) * 22, py = l.fy + Math.sin(a) * 22;
          return <g key={j}><path d={`M ${l.fx} ${l.fy} L ${px} ${py}`} stroke={INK} strokeWidth={12} strokeLinecap="round" />
            <path d={`M ${l.fx} ${l.fy} L ${px} ${py}`} stroke={GK} strokeWidth={5} strokeLinecap="round" />
            <circle cx={px} cy={py} r={9} fill={GK_L} stroke={INK} strokeWidth={4} /></g>;
        })}</g>)}
        <ellipse cx={0} cy={0} rx={44} ry={92} fill={GK} stroke={INK} strokeWidth={7} />
        {[[-14, -40], [16, -10], [-10, 26], [14, 56], [0, -66]].map(([sx2, sy2], i) => <ellipse key={i} cx={sx2} cy={sy2} rx={9} ry={7} fill={GK2} opacity={0.8} />)}
        <path d="M 22 -70 C 38 -30 38 30 24 70" stroke={GK_L} strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.7} />
        {/* head */}
        <ellipse cx={0} cy={-112} rx={50} ry={46} fill={GK} stroke={INK} strokeWidth={7} />
        {[-1, 1].map(eye)}
        {tongue > 0.01 ? <path d={`M 0 -156 L 0 ${-156 - 40 * tongue} m -8 -10 l 8 10 l 8 -10`} stroke={RED} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        <path d={mood === 'wide' ? 'M -18 -146 Q 0 -138 18 -146' : 'M -24 -150 Q 4 -138 26 -156'} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        <circle cx={-10} cy={-152} r={2.5} fill={INK} /><circle cx={10} cy={-152} r={2.5} fill={INK} />
      </g></W>
    );
  };

// ---------- inserts (screen space) ----------
const Panel: React.FC<{x: number; y: number; s: number; r?: number; label: string; rot?: number; children: React.ReactNode; size?: number}> = ({x, y, s, r = 340, label, rot = -1.5, children, size = 900}) => {
  if (s < 0.01) return null;
  return (
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`}}>
      <svg width={size} height={size} viewBox={`${-size / 2} ${-size / 2} ${size} ${size}`} style={{overflow: 'visible'}}>
        <clipPath id={`p${label.length}${r}`}><circle r={r} /></clipPath>
        <circle r={r + 18} fill={INK} />
        <g clipPath={`url(#p${label.length}${r})`}>
          <rect x={-size / 2} y={-size / 2} width={size} height={size} fill="#16223A" />
          {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-size / 2 + i * 75} ${-size / 2} V ${size / 2} M ${-size / 2} ${-size / 2 + i * 75} H ${size / 2}`} stroke="#2A3A5C" strokeWidth={3} />)}
          {children}
        </g>
        <circle r={r} fill="none" stroke="#3E6FB0" strokeWidth={20} />
      </svg>
      <Sticker text={label} s={1} x="50%" y={size / 2 - r - 10} rot={-3} />
    </div>
  );
};
const XB = '#EAF4FF';

/** GECKO TOE X-RAY: the toe pad -> zoom into its ridges -> a forest of tiny branching hairs, counter to 6,500,000 */
const ToeXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  const zoom = eio(seg(t, T.toes + 0.3, T.six + 0.2));                  // 0 = whole toe, 1 = the hairs
  const n = 6500000 * eout(seg(t, T.six - 0.05, T.hairs + 0.15));
  const hairs = Array.from({length: 22}, (_, i) => {
    const x = -300 + i * 28.5, h = 150 + rnd(i) * 30, sway = 6 * Math.sin(t * 4 + i * 0.7);
    return <g key={i} transform={`translate(${x} 150)`}>
      <path d={`M 0 0 Q ${sway} ${-h * 0.5} ${sway * 1.6} ${-h}`} stroke={XB} strokeWidth={6} fill="none" strokeLinecap="round" />
      {[-1, 0, 1].map((k) => <path key={k} d={`M ${sway * 1.6} ${-h} l ${k * 10} -22`} stroke="#9FE07A" strokeWidth={4} strokeLinecap="round" />)}
    </g>;
  });
  return (
    <Panel x={540} y={1010} s={s} label="GECKO TOE X-RAY">
      {/* whole toe (fades out as we zoom) */}
      <g opacity={1 - zoom} transform={`scale(${1 + 2.5 * zoom})`}>
        <path d="M -60 260 L -60 -40 Q -60 -200 0 -210 Q 60 -200 60 -40 L 60 260" fill="none" stroke={XB} strokeWidth={8} />
        <path d="M -60 -40 Q -110 -180 0 -250 Q 110 -180 60 -40" fill="#9FE07A" fillOpacity={0.25} stroke="#9FE07A" strokeWidth={8} />
        {Array.from({length: 6}, (_, i) => <path key={i} d={`M -70 ${-200 + i * 30} Q 0 ${-185 + i * 30} 70 ${-200 + i * 30}`} stroke="#9FE07A" strokeWidth={6} fill="none" />)}
        <circle cx={0} cy={-140} r={60} fill="none" stroke={GOLD} strokeWidth={7} strokeDasharray="16 10" transform={`rotate(${t * 60} 0 -140)`} />
      </g>
      {/* the hairs */}
      <g opacity={zoom}>
        <rect x={-330} y={150} width={660} height={200} fill="#9FE07A" fillOpacity={0.25} />
        <path d="M -330 150 H 330" stroke="#9FE07A" strokeWidth={8} />
        {hairs}
        <rect x={-330} y={-250} width={660} height={60} fill="#B9D6F2" fillOpacity={0.35} />
        <text x={0} y={-212} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={XB}>WALL</text>
      </g>
      <g opacity={seg(t, T.six - 0.2, T.six)}>
        <rect x={-250} y={205} width={500} height={92} rx={20} fill={INK} stroke={GOLD} strokeWidth={6} />
        <text x={0} y={268} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={GOLD}>{fmt(n)}</text>
      </g>
      <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
    </Panel>
  );
};

/** STICKY SKIN NEEDED: his outline fills with green up to 40 %, then the whole front goes green */
const BodyPanel: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const pct = Math.round(40 * eout(seg(t, T.forty - 0.1, T.body + 0.2)));
  const fill = pct / 100;
  const frontOn = seg(t, T.whole - 0.05, T.front + 0.2);
  return (
    <div style={{position: 'absolute', left: 540, top: 1050, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={880} height={1000} viewBox="-440 -500 880 1000" style={{overflow: 'visible'}}>
        <rect x={-420} y={-480} width={840} height={960} rx={46} fill="#FFFDF6" stroke={INK} strokeWidth={10} />
        <text x={0} y={-395} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={66} fill={INK}>STICKY SKIN NEEDED</text>
        <clipPath id="bpClip"><rect x={-400} y={300 - 620 * fill} width={800} height={620 * fill} /></clipPath>
        <g transform="translate(-130 40) scale(1.2)">
          <GuyBody t={t} limbs={DOWN} mood={frontOn > 0.5 ? 'gasp' : 'worried'} padBig={0.7} />
        </g>
        {/* the fill line rising */}
        <g clipPath="url(#bpClip)" opacity={0.75 * (1 - frontOn)}>
          <rect x={-300} y={-330} width={340} height={640} fill={PAD} />
        </g>
        {fill > 0.01 && frontOn < 1 ? <path d={`M -300 ${300 - 620 * fill} H 40`} stroke={GK_D} strokeWidth={7} strokeDasharray="20 12" opacity={1 - frontOn} /> : null}
        {frontOn > 0.01 ? <g transform="translate(-130 40) scale(1.2)" opacity={frontOn}><GuyBody t={t} limbs={DOWN} mood="gasp" front={1} padBig={0.7} /></g> : null}
        <text x={210} y={-60} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={150} fill={pct === 40 ? GK : INK} stroke={INK} strokeWidth={pct === 40 ? 7 : 0} style={{paintOrder: 'stroke'}}>{pct}%</text>
        <text x={210} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>OF YOUR BODY</text>
        {/* the gecko's share: just its toes */}
        <g transform="translate(210 230) scale(0.55)" opacity={seg(t, T.sticky, T.sticky + 0.3)}>
          <rect x={-250} y={-150} width={500} height={300} rx={30} fill="#EEF7E4" stroke={INK} strokeWidth={8} />
          <text x={0} y={-80} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>GECKO:</text>
          <text x={0} y={10} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>JUST ITS</text>
          <text x={0} y={95} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={GK_D}>TOES</text>
        </g>
      </svg>
    </div>
  );
};

// ---------- the story over time ----------
type GuyState = {x: number; y: number; limbs: Limbs; mood: Mood; curl: number; front: number; sx: number; sy: number; roll: number; tremble: number; headRoll: number};
const SLIDE0 = -800;
const guyAt = (t: number): GuyState => {
  const base: GuyState = {x: GX, y: SLIDE0, limbs: SPREAD, mood: 'worried', curl: 0, front: 0, sx: 1, sy: 1, roll: 0, tremble: 0, headRoll: 0};
  if (t < 3.3) {                          // sliding down the wall, hands stretched up, squeaking
    const u = t / 3.3;
    const y = SLIDE0 + 170 * (u * 0.85 + 0.15 * Math.sin(u * Math.PI / 2)) + 6 * Math.sin(t * 9);
    const reach = 0.15 + 0.1 * Math.sin(t * 6);
    return {...base, y, limbs: {...SPREAD, lh: [-115, -150 - 30 * reach], rh: [115, -150 - 30 * (0.25 - reach)]}, mood: t < 1.5 ? 'gasp' : 'worried', tremble: 1, headRoll: 5 * Math.sin(t * 5)};
  }
  const yHold = SLIDE0 + 170;
  if (t < T.but) return {...base, y: yHold, mood: 'strain', tremble: 0.7, headRoll: 3 * Math.sin(t * 3)};
  if (t < DROP) {                         // the pads peel off
    const p = seg(t, T.but, DROP);
    return {...base, y: yHold + 20 * p, mood: p > 0.5 ? 'gasp' : 'strain', curl: p, tremble: 1.5 * p + 0.7};
  }
  if (t < LAND) {                         // falls
    const u = seg(t, DROP, LAND);
    return {...base, y: lerp(yHold + 20, -260, u * u), limbs: mixL(SPREAD, {lh: [-140, -190], rh: [140, -190], lf: [-60, 170], rf: [60, 170]}, u), mood: 'gasp', curl: 1};
  }
  if (t < SPLAT - 0.3) {                  // on the ground, squash, dizzy, then calm while the panel explains
    const sq = spring(t, LAND, 0.28, 2.5, 6);
    const calm = t > T.need + 0.3;
    return {...base, y: -265 * (1 - sq * 0.25), limbs: DOWN, mood: calm ? (t > T.whole ? 'worried' : 'calm') : 'dizzy', curl: 0.3, sx: 1 + sq, sy: 1 - sq,
      roll: calm ? 0 : 6 * Math.sin((t - LAND) * 7) * (1 - seg(t, LAND, T.need)), headRoll: calm ? 0 : 8 * Math.sin((t - LAND) * 5)};
  }
  // whole front in pads: jumps and SPLATs high on the wall, proud; then tries to get down - stuck
  const yHigh = -1180;
  if (t < SPLAT) {
    const u = seg(t, SPLAT - 0.3, SPLAT);
    return {...base, y: lerp(-265, yHigh, eout(u)), limbs: mixL(DOWN, SPREAD, u), mood: 'happy', front: 1};
  }
  const sq = spring(t, SPLAT, 0.22, 3, 7);
  if (t < T.now) return {...base, y: yHigh, limbs: SPREAD, mood: 'proud', front: 1, sx: 1 + sq, sy: 1 - sq * 0.6};
  // tries to pull his right hand free: it stretches and snaps back
  const pull = Math.max(0, Math.sin(Math.PI * seg(t, T.getting - 0.1, T.down + 0.35)));
  const pull2 = Math.max(0, Math.sin(Math.PI * seg(t, 18.72, T.problem + 0.6)));
  return {...base, y: yHigh, limbs: {...SPREAD, rh: [125 + 30 * pull + 20 * pull2, -150 + 50 * pull]}, mood: t < T.getting ? 'proud' : 'strain', front: 1,
    tremble: pull + pull2, headRoll: -6 * pull + 5 * pull2};
};

const geckoAt = (t: number) => {
  // stuck next to him, then walks down the wall in the ending
  let y = -860, mood: GMood = 'smug', step = 0, tongue = 0, rot = 0, lift = 0;
  if (t < 3.3) { y = -860; mood = 'smug'; tongue = Math.max(0, Math.sin((t - 1.0) * 10)) * (t > 1.0 && t < 1.6 ? 1 : 0); }
  else if (t < 7.2) { mood = 'calm'; }
  else if (t < 10.2) { mood = t > T.kilos ? 'proud' : 'calm'; lift = 0; }
  else if (t < SPLAT) { mood = t > LAND ? 'smug' : 'wide'; tongue = t > LAND + 0.4 && t < LAND + 1.0 ? Math.max(0, Math.sin((t - LAND - 0.4) * 10)) : 0; }
  else {
    // runs up next to him, then strolls down the wall past him
    const up = seg(t, SPLAT - 0.4, SPLAT + 0.2), down = seg(t, T.getting, 20.0);
    y = lerp(-860, -1150, eout(up)) + 800 * down;
    rot = down > 0.001 ? 180 : 0;
    step = down > 0 ? (t - T.getting) * 2.2 : up * 1.5;
    mood = 'smug';
    tongue = t > T.problem && t < T.problem + 0.5 ? Math.max(0, Math.sin((t - T.problem) * 12)) : 0;
  }
  return {y, mood, step, tongue, rot, lift};
};

export const GeckoScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: 95, y: -860, k: 2.1}, {t: 3.25, x: 95, y: -790, k: 2.2},              // him sliding, the gecko beside him
    {t: 3.3, x: KX, y: -830, k: 3.0}, {t: 7.15, x: KX, y: -830, k: 3.15},          // the gecko (behind the toe X-ray)
    {t: 7.2, x: KX - 40, y: -700, k: 2.0}, {t: 10.15, x: KX - 40, y: -700, k: 2.1}, // the gecko holds the weight
    {t: 10.2, x: GX, y: -660, k: 2.6}, {t: DROP, x: GX, y: -660, k: 2.7},          // his pads peel
    {t: LAND, x: GX + 40, y: -330, k: 2.1, e: 'out'}, {t: 12.6, x: GX + 40, y: -330, k: 2.2}, // BOING on the grass
    {t: 12.9, x: GX + 60, y: -360, k: 1.8}, {t: SPLAT - 0.35, x: GX + 60, y: -360, k: 1.85}, // calm under the body panel
    {t: SPLAT - 0.05, x: GX + 80, y: -1080, k: 2.3}, {t: T.now - 0.1, x: GX + 80, y: -1080, k: 2.4}, // SPLAT high up
    {t: T.getting + 0.4, x: GX + 80, y: -900, k: 1.0}, {t: DURATION, x: GX + 80, y: -890, k: 0.98}, // pull back: the long way down
  ], t);
  const sh = shake(t, hit(t, LAND, 14, 6) + hit(t, SPLAT, 9, 7) + (t > T.but && t < DROP ? 1.2 : 0));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t);
  const trem = g.tremble * 1.6 * Math.sin(t * 2 * Math.PI * 17);
  const k = geckoAt(t);
  // green skid marks above his hands while he slides
  const skid = t < 3.3 ? seg(t, 0, 3.3) : t < DROP ? 1 : 0;
  // the ON PAPER weight hanging from the gecko
  const wS = popIn(t, T.paper - 0.05, 0.35) * (1 - seg(t, 10.1, 10.25));
  const kg = Math.round(130 * eout(seg(t, T.hundred - 0.1, T.kilos + 0.25)));
  const wy = k.y + 330 + 40 * eout(seg(t, T.hundred - 0.1, T.kilos + 0.25)) + 4 * Math.sin(t * 5);
  // inserts
  const toeS = popIn(t, 3.35, 0.35) * (1 - seg(t, 7.0, 7.2));
  const bodyS = popIn(t, T.need - 0.1, 0.35) * (1 - seg(t, SPLAT - 0.45, SPLAT - 0.25));
  // labels
  const slideS = pulse(t, T.slide, 0.75);
  const sixS = pulse(t, T.hairs + 0.05, 0.45);
  const paperS = pulse(t, T.paper, 0.85);
  const heavyS = pulse(t, T.heavy, 0.5);
  const boingS = pulse(t, LAND + 0.02, 0.55);
  const tinyS = pulse(t, T.small - 0.05, 0.55);
  const splatS = pulse(t, SPLAT, 0.5);
  const stuckS = pulse(t, T.did, 0.45);
  const downS = popIn(t, T.down, 0.3);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#A9D7EE'}}>
      <Defs />
      <Layer cam={cam} z={1000} paper={false}><Wall /></Layer>
      <Layer cam={cam} z={1000} paper={false}>
        {skid > 0.01 ? <W>{[-1, 1].map((s) => [0, 1, 2, 3].map((j) => (
          <path key={s + '' + j} d={`M ${GX + s * (100 + j * 9)} ${SLIDE0 - 165} V ${SLIDE0 - 165 + 170 * Math.min(1, skid * 1.05)}`}
            stroke={PAD} strokeWidth={7} strokeLinecap="round" opacity={0.55} />)))}</W> : null}
        {/* shadow of him on the wall */}
        <W><ellipse cx={g.x + 18} cy={g.y + 24} rx={150} ry={230} fill="#7A5A3A" opacity={g.y < -400 ? 0.13 : 0} /></W>
        <W><ellipse cx={g.x} cy={-6} rx={120} ry={18} fill="#2E5020" opacity={g.y > -420 ? 0.3 : 0.12} /></W>
      </Layer>
      <Layer cam={cam} z={1000}>
        <Gecko x={KX} y={k.y} t={t} mood={k.mood} step={k.step} tongue={k.tongue} rot={k.rot} lift={k.lift} />
        {wS > 0.01 ? <W><g>
          <path d={`M ${KX + 80} ${k.y + 90} Q ${KX + 90} ${(k.y + wy) / 2} ${KX + 60} ${wy - 70}`} stroke={INK} strokeWidth={6} fill="none" />
          <g transform={`translate(${KX + 60} ${wy}) scale(${wS * (0.7 + 0.5 * kg / 130)})`}>
            <path d="M -70 -60 L 70 -60 L 100 70 L -100 70 Z" fill="#5B6879" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
            <rect x={-26} y={-92} width={52} height={36} rx={14} fill="none" stroke={INK} strokeWidth={10} />
            <text x={0} y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill="#fff">{kg} kg</text>
          </g>
        </g></W> : null}
        <W><g transform={`translate(${g.x + trem} ${g.y})`}>
          <GuyBody t={t} limbs={g.limbs} mood={g.mood} curl={g.curl} front={g.front} sx={g.sx} sy={g.sy} roll={g.roll} headRoll={g.headRoll} />
        </g></W>
      </Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 5 + (i * 2 * Math.PI) / 3, on = t > LAND + 0.1 && t < T.need + 0.2 ? 1 - seg(t, T.need - 0.1, T.need + 0.2) : 0;
          return <Star key={i} x={g.x + Math.cos(a) * 80} y={g.y - 220 + Math.sin(a) * 16} s={on * 0.55} rot={t * 200} />;
        })}
        <Sweat x={g.x + 70} y={g.y - 190} s={(t < 3.3 || (t > T.but && t < DROP) || t > T.getting) ? 0.9 : 0} />
        <Txt x={cam0.x} y={g.y + 290} s={slideS} text="SLIDING" size={74} rot={-5} fill={RED} />
        <Txt x={KX} y={k.y - 260} s={sixS} text="6.5 MILLION" size={58} rot={-4} fill={GOLD} />
        <Txt x={KX - 40} y={k.y - 250} s={paperS} text="ON PAPER" size={70} rot={-5} fill={GOLD} />
        <Txt x={GX} y={-400} s={heavyS} text="TOO HEAVY" size={64} rot={-5} fill={RED} />
        <Txt x={GX + 40} y={-560} s={boingS} text="BOING" size={88} rot={-8} fill={GOLD} />
        <Txt x={GX + 40} y={-590} s={tinyS} text="TINY PADS" size={66} rot={4} fill={GOLD} />
        <Txt x={GX + 80} y={g.y - 280} s={splatS} text="SPLAT" size={86} rot={-6} fill={PAD} />
        <Txt x={GX + 80} y={g.y + 280} s={stuckS} text="STUCK" size={74} rot={5} fill={GOLD} />
        <Txt x={GX + 80} y={-180} s={downS} text="WAY DOWN THERE" size={64} rot={-3} />
      </Layer>
      <ToeXRay t={t} s={toeS} />
      <BodyPanel t={t} s={bodyS} />
      <Sticker text="YOUR WHOLE FRONT" s={popIn(t, T.whole, 0.3) * bodyS} x={540} y={1640} rot={2} bg={GOLD} size={60} />
      {thumb ? null : <>
        <HookTitle t={t} text="GECKO FEET WON'T HOLD YOU" hi="WON'T" y={300} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.now} until={19.95} text="Which animal's feet next?" />
      </>}
    </AbsoluteFill>
  );
};

export const GeckoVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks: Cue[] = [];
  for (let i = 1; i <= 14; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.six - 0.05, T.hairs + 0.15, Math.pow(i / 14, 0.6)), db: -27});
  for (let i = 1; i <= 10; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.hundred - 0.1, T.kilos + 0.25, Math.pow(i / 10, 0.6)), db: -26});
  for (let i = 1; i <= 8; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.forty - 0.1, T.body + 0.2, Math.pow(i / 8, 0.6)), db: -26});
  const cues: Cue[] = [
    {f: 'whoosh.wav', at: 0.0, db: -12}, {f: 'squeak.wav', at: 0.0, db: -16}, {f: 'strain.mp3', at: 0.2, db: -26, to: 2.6},
    {f: 'squeak.wav', at: 1.1, db: -22}, {f: 'squeak.wav', at: 2.2, db: -20}, {f: 'zap.wav', at: T.slide, db: -26},
    {f: 'whoosh.wav', at: 3.25, db: -26}, {f: 'zap.wav', at: 3.35, db: -26}, {f: 'whir.mp3', at: T.toes + 0.3, db: -28, to: 1.0},
    ...ticks, {f: 'ding.mp3', at: T.hairs + 0.15, db: -22},
    {f: 'whoosh.wav', at: 7.15, db: -26}, {f: 'pop.wav', at: T.paper, db: -22}, {f: 'strain.mp3', at: T.hold, db: -26, to: 1.0}, {f: 'ding.mp3', at: T.kilos + 0.25, db: -22},
    {f: 'whoosh.wav', at: 10.15, db: -26}, {f: 'strain.mp3', at: T.but, db: -20, to: 0.8}, {f: 'squeak.wav', at: T.heavy, db: -18}, {f: 'pop.wav', at: T.heavy, db: -24},
    {f: 'whoosh.wav', at: DROP, db: -14}, {f: 'twang.mp3', at: LAND, db: -13}, {f: 'pop.wav', at: LAND, db: -14}, {f: 'chirp.wav', at: LAND + 0.3, db: -28},
    {f: 'crowd_laugh.wav', at: LAND + 0.2, db: -32, to: 1.3}, {f: 'pop.wav', at: T.small - 0.05, db: -24},
    {f: 'zap.wav', at: T.need - 0.1, db: -26}, {f: 'ding.mp3', at: T.body + 0.2, db: -22}, {f: 'pop.wav', at: T.whole, db: -20},
    {f: 'whoosh.wav', at: SPLAT - 0.35, db: -18}, {f: 'splash.wav', at: SPLAT, db: -18, to: 0.5}, {f: 'pop.wav', at: SPLAT, db: -16},
    {f: 'pop.wav', at: T.did, db: -24},
    {f: 'whoosh.wav', at: T.getting - 0.1, db: -24}, {f: 'strain.mp3', at: T.getting, db: -22, to: 0.6}, {f: 'squeak.wav', at: T.down + 0.2, db: -20},
    {f: 'twang.mp3', at: T.down + 0.38, db: -20, to: 0.4}, {f: 'pop.wav', at: T.down, db: -24}, {f: 'squeak.wav', at: 19.3, db: -22},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<GeckoScene t={0} />}>
        <GeckoScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="gecko/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const GeckoWide: React.FC = () => <WideFit.Provider value={0.72}><GeckoVideo /></WideFit.Provider>;
