// "What if you had a chameleon's eyes?" - owl part 2, built on the owl formula (CLAUDE.md, Growth): the power is ON HIM at
// frame 0 (two green turret eyes on his round head, each chasing a different fly), the animal co-star beside him doing it
// with ease (a smug chameleon on a branch, its eyes swivelling apart), two X-rays (the chameleon's coiled "phone cord"
// optic nerve, then YOUR brain merging two pictures -> DOUBLE VISION), two live counters (a 360 dial on the chameleon,
// VIEW 360 vs 200), a comedy hit made by the power itself (he lunges at the wrong fly of two and bonks a post), the
// chameleon's payoff (both eyes forward, tongue strike), and his dumb-but-funny fix (he shuts one eye) that pops open
// again into frame 0. Series opener: a doodle comment bubble instead of HookTitle.
// Everything drawn in code; the guy's body is the library sprite, his head is drawn in code over it.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.1; times below are video time). Last word ends ~22.33 s; + 0.87 s for the push.
export const DURATION = 23.2;
export const T = {
  eyes: 1.05, double: 2.14, day: 3.01,                                       // "Get a chameleon's eyes, and you'd see double all day."
  each: 3.52, spins: 4.10, alone: 4.61, nerves: 5.30, coiled: 5.70, phone: 6.43, cord: 6.72, // "Each eye spins alone, on nerves coiled like a phone cord."
  it: 7.23, nearly: 7.66, sixty: 8.83, degrees: 9.41,                        // "It sees nearly three hundred sixty degrees."
  you: 10.03, two: 10.54, hundred: 10.75,                                    // "You see two hundred."
  brain: 11.72, merges: 11.97, both: 12.48,                                  // "Your brain merges both eyes."
  split: 13.35, twoOf: 14.66, everything: 15.10,                             // "Split them, and you get two of everything."
  cham: 15.94, points: 16.59, forward: 17.14, strike: 17.72,                 // "The chameleon points both forward to strike."
  so: 18.37, shuts: 18.99, one: 19.25,                                       // "So he shuts one."
  eagle: 19.66, cat: 20.68, comment: 21.46, below: 21.75,                    // "Eagle eyes or cat eyes? Comment below."
  cta: 16.95,
};

const GOLD = '#FFD43B', RED = '#E2453C';
const G1 = '#7CC74F', G2 = '#3F8F35', G3 = '#B9E26A', GTIP = '#F2D15A';
const CX = 290, CY = -175;      // chameleon's feet on the branch
const GX = 0;                   // guy's feet
const POSTX = -292;             // the post he bonks into

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
const D2R = Math.PI / 180;
const keysAt = (k: [number, number][], t: number, ease = eio) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) if (t <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], ease(seg(t, k[i][0], k[i + 1][0])));
  return k[k.length - 1][1];
};
type V = {x: number; y: number};
const dirTo = (from: V, to: V): V => { const dx = to.x - from.x, dy = to.y - from.y, m = Math.hypot(dx, dy) || 1; return {x: dx / m, y: dy / m}; };
const ang = (a: number): V => ({x: Math.cos(a), y: Math.sin(a)});
const mixV = (a: V, b: V, u: number): V => ({x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u)});

const Defs: React.FC = () => (
  <W><defs>
    <linearGradient id="cSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FD0F2" /><stop offset="0.6" stopColor="#C6E9F7" /><stop offset="1" stopColor="#F3F7DA" /></linearGradient>
    <linearGradient id="cGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8CC665" /><stop offset="1" stopColor="#6AA64F" /></linearGradient>
    <radialGradient id="cSun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF6C4" stopOpacity={0.9} /><stop offset="0.5" stopColor="#FFE98A" stopOpacity={0.35} /><stop offset="1" stopColor="#FFE98A" stopOpacity={0} /></radialGradient>
    <linearGradient id="cBody" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stopColor="#97D965" /><stop offset="0.6" stopColor={G1} /><stop offset="1" stopColor="#5AA843" /></linearGradient>
    <radialGradient id="cTur" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor="#A6E06E" /><stop offset="0.7" stopColor={G1} /><stop offset="1" stopColor={G2} /></radialGradient>
    <linearGradient id="cBark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#A9794A" /><stop offset="1" stopColor="#7A5430" /></linearGradient>
    <radialGradient id="cFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
  </defs></W>
);

// ---------- the sunny garden ----------
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-4000} y={-5000} width={9000} height={5000} fill="url(#cSky)" />
    <g transform="translate(-650 -1350)">
      <circle r={480} fill="url(#cSun)" />
      <circle r={150} fill="#FFE46B" stroke={INK} strokeWidth={9} />
      {Array.from({length: 10}, (_, i) => { const a = i * 36 + t * 12; return <path key={i} transform={`rotate(${a}) translate(0 -205)`} d="M -14 0 L 0 -46 L 14 0 Z" fill="#FFE46B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />; })}
    </g>
    {[[-1500, -1900, 1.2], [900, -2200, 1], [2000, -1700, 0.8], [-200, -2500, 0.9]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x + 30 * Math.sin(t * 0.3 + i)} ${y}) scale(${s})`}>
        <path d="M -200 40 Q -230 -30 -150 -50 Q -120 -130 -30 -110 Q 30 -170 110 -110 Q 200 -120 200 -40 Q 250 20 190 50 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      </g>))}
  </W>
);
const Hills: React.FC = () => (
  <W>
    <path d="M -3000 60 Q -2200 -420 -1300 -180 Q -700 -470 100 -230 Q 900 -500 1700 -210 Q 2500 -460 3300 -200 Q 4100 -430 5000 60 Z" fill="#9CCB7E" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {Array.from({length: 14}, (_, i) => {
      const x = -2400 + i * 380 + rnd(i) * 120, h = 240 + rnd(i * 3) * 160;
      return <g key={i} transform={`translate(${x} -60)`}>
        <rect x={-14} y={-h * 0.4} width={28} height={h * 0.4 + 40} fill="#8A6A48" stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={-h * 0.62} rx={h * 0.32} ry={h * 0.4} fill="#6FAE58" stroke={INK} strokeWidth={7} />
      </g>;
    })}
    <path d="M -3000 60 Q -1800 -200 -600 -90 Q 600 -240 1900 -80 Q 3200 -240 5000 60 Z" fill="#86BD66" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-3000} y={55} width={8000} height={3000} fill="#86BD66" />
  </W>
);
const Ground: React.FC = () => (
  <W>
    <rect x={-4000} y={0} width={9000} height={3000} fill="url(#cGrass)" />
    <path d="M -4000 0 H 5000" stroke={INK} strokeWidth={8} />
    {Array.from({length: 70}, (_, i) => {
      const x = -2000 + rnd(i * 3) * 4400, y = 30 + rnd(i * 7) * 700;
      return <path key={i} d={`M ${x - 14} ${y} l 8 -26 l 6 22 l 8 -30 l 6 34`} stroke="#4F8A3F" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
    {Array.from({length: 12}, (_, i) => {
      const x = -1500 + rnd(i * 11) * 3000, y = 60 + rnd(i * 13) * 500;
      return <g key={'f' + i} transform={`translate(${x} ${y})`}>
        {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={14 * Math.cos(a * D2R)} cy={14 * Math.sin(a * D2R)} r={10} fill={i % 2 ? '#FFFFFF' : '#FF9EC2'} stroke={INK} strokeWidth={4} />)}
        <circle r={8} fill={GOLD} stroke={INK} strokeWidth={4} />
      </g>;
    })}
  </W>
);
/** a little tree on the right: trunk + one branch reaching left where the chameleon sits */
const Tree: React.FC = () => (
  <W>
    <path d={`M 560 10 L 590 10 Q 575 -300 600 -700 L 520 -700 Q 520 -300 520 10 Z`} fill="url(#cBark)" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d={`M 535 -230 Q 420 ${CY - 30} ${CX - 170} ${CY - 6} Q ${CX - 190} ${CY + 2} ${CX - 172} ${CY + 14} Q 420 ${CY + 18} 540 -170 Z`} fill="url(#cBark)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {[[CX - 150, CY - 20, -30], [CX + 120, CY - 40, 20], [CX + 200, CY - 60, -10]].map(([x, y, r], i) => (
      <path key={i} transform={`translate(${x} ${y}) rotate(${r})`} d="M 0 0 Q 22 -30 0 -60 Q -22 -30 0 0 Z" fill="#5FAE4A" stroke={INK} strokeWidth={5} />))}
    <ellipse cx={560} cy={-820} rx={260} ry={200} fill="#5FAE4A" stroke={INK} strokeWidth={9} />
  </W>
);
/** the wooden post he bonks into */
const Post: React.FC = () => (
  <W><g transform={`translate(${POSTX} 0)`}>
    <rect x={-22} y={-400} width={44} height={410} fill="url(#cBark)" stroke={INK} strokeWidth={7} />
    <g transform="translate(0 -390) rotate(-4)">
      <rect x={-120} y={-56} width={240} height={86} rx={12} fill="#F4E3BE" stroke={INK} strokeWidth={7} />
      <text x={0} y={2} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>NO FLIES</text>
    </g>
  </g></W>
);
const CastShadow: React.FC<{x: number; w: number}> = ({x, w}) => <W><ellipse cx={x - w * 0.12} cy={6} rx={w * 0.6} ry={22} fill="#2F5A20" opacity={0.3} /></W>;

// ---------- a chameleon turret eye ----------
/** A scaly cone eye seen from the front: base disc, rings stepping toward the gaze, a small tip with the pupil.
 *  g = gaze direction (unit-ish), shut = 0..1 the lid closes over the tip. */
const Turret: React.FC<{x: number; y: number; r: number; g: V; shut?: number; dizzy?: number; t: number}> = ({x, y, r, g, shut = 0, dizzy = 0, t}) => {
  const m = Math.hypot(g.x, g.y), ux = m > 1 ? g.x / m : g.x, uy = m > 1 ? g.y / m : g.y;
  const tip = {x: ux * r * 0.56, y: uy * r * 0.56};
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={r} fill="url(#cTur)" stroke={INK} strokeWidth={r * 0.17} />
      <circle cx={ux * r * 0.2} cy={uy * r * 0.2} r={r * 0.74} fill="none" stroke={G2} strokeWidth={r * 0.08} opacity={0.8} />
      <circle cx={ux * r * 0.38} cy={uy * r * 0.38} r={r * 0.52} fill={G1} stroke={INK} strokeWidth={r * 0.1} />
      {Array.from({length: 6}, (_, i) => { const a = i * 60 * D2R; return <circle key={i} cx={ux * r * 0.2 + r * 0.6 * Math.cos(a)} cy={uy * r * 0.2 + r * 0.6 * Math.sin(a)} r={r * 0.06} fill={G3} />; })}
      <circle cx={tip.x} cy={tip.y} r={r * 0.32} fill={GTIP} stroke={INK} strokeWidth={r * 0.1} />
      {dizzy > 0.5
        ? <path transform={`translate(${tip.x} ${tip.y}) rotate(${t * 900})`} d={`M 0 0 m ${-r * 0.16} 0 a ${r * 0.16} ${r * 0.16} 0 1 1 ${r * 0.16} ${r * 0.16}`} stroke={INK} strokeWidth={r * 0.09} fill="none" strokeLinecap="round" />
        : <><circle cx={tip.x + ux * r * 0.06} cy={tip.y + uy * r * 0.06} r={r * 0.2} fill={INK} /><circle cx={tip.x + ux * r * 0.06 - r * 0.07} cy={tip.y + uy * r * 0.06 - r * 0.08} r={r * 0.06} fill="#fff" /></>}
      {shut > 0.01 ? <g>
        <circle cx={tip.x} cy={tip.y} r={r * 0.34 * shut} fill={G1} stroke={INK} strokeWidth={r * 0.1} />
        {shut > 0.9 ? <path d={`M ${tip.x - r * 0.24} ${tip.y} Q ${tip.x} ${tip.y + r * 0.16} ${tip.x + r * 0.24} ${tip.y}`} stroke={INK} strokeWidth={r * 0.09} fill="none" strokeLinecap="round" /> : null}
      </g> : null}
    </g>
  );
};

// ---------- the guy's head, drawn in code ----------
type HeadMood = 'calm' | 'worried' | 'dizzy' | 'happy' | 'squint';
const EYE_DX = 33, EYE_DY = -4, EYE_R = 29;
const GuyHead: React.FC<{x: number; y: number; gl: V; gr: V; shutR?: number; mood?: HeadMood; t: number; rot?: number}> = ({x, y, gl, gr, shutR = 0, mood = 'calm', t, rot = 0}) => {
  const R = HEAD_R, dz = mood === 'dizzy' ? 1 : 0;
  const tiltL = mood === 'worried' ? 16 : mood === 'squint' ? -10 : 0;
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <circle r={R + 1} fill="url(#cFace)" stroke={INK} strokeWidth={6.5} />
      <path d={`M ${R * 0.35} ${-R} A ${R} ${R} 0 0 1 ${R * 0.35} ${R} A ${R * 1.1} ${R * 1.1} 0 0 0 ${R * 0.35} ${-R} Z`} fill="#C9C5BF" opacity={0.35} />
      {[-1, 1].map((s) => <path key={s} transform={`translate(${s * EYE_DX} -42) rotate(${s * -tiltL + (s === 1 && shutR > 0.5 && mood === 'happy' ? -8 : 0)})`} d="M -15 2 Q 0 -8 15 2" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />)}
      <Turret x={-EYE_DX} y={EYE_DY} r={EYE_R} g={gl} dizzy={dz} t={t} />
      <Turret x={EYE_DX} y={EYE_DY} r={EYE_R} g={gr} dizzy={dz} shut={shutR} t={t} />
      <g transform="translate(0 38)">
        {mood === 'calm' ? <path d="M -14 -2 Q 0 9 14 -2" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'happy' ? <path d="M -17 -4 Q 0 15 17 -4 Z" fill="#E4677A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
        {mood === 'worried' ? <ellipse cx={0} cy={1} rx={9} ry={11} fill="#5A2328" stroke={INK} strokeWidth={5} /> : null}
        {mood === 'squint' ? <path d="M -14 0 H 14" stroke={INK} strokeWidth={5.5} strokeLinecap="round" /> : null}
        {mood === 'dizzy' ? <path d="M -16 2 Q -8 -6 0 2 Q 8 10 16 2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      </g>
    </g></W>
  );
};
const headOf = (pose: Pose) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s, hy: (m.head[1] - m.feet[1]) * s};
};

// ---------- the chameleon (faces left) ----------
type ChamMood = 'smug' | 'wide' | 'chew';
const HEAD_OFF = {x: -100, y: -72};       // head centre from the feet
const NEAR = {x: -14, y: -10}, FAR = {x: 6, y: -50};   // eyes from the head centre
const MOUTH = {x: -80, y: 8};
export const chamEye = (which: 'near' | 'far') => { const e = which === 'near' ? NEAR : FAR; return {x: CX + HEAD_OFF.x + e.x, y: CY + HEAD_OFF.y + e.y}; };
const Chameleon: React.FC<{t: number; gn: V; gf: V; mood?: ChamMood; tongue?: V | null}> = ({t, gn, gf, mood = 'smug', tongue}) => {
  const breathe = 1 + 0.015 * Math.sin(t * 2.4);
  const mx = CX + HEAD_OFF.x + MOUTH.x, my = CY + HEAD_OFF.y + MOUTH.y;
  const chew = mood === 'chew' ? 3 * Math.abs(Math.sin(t * 14)) : 0;
  return (
    <W>
      {/* tongue under everything at the mouth */}
      {tongue ? <g>
        <path d={`M ${mx} ${my} L ${tongue.x} ${tongue.y}`} stroke={INK} strokeWidth={20} strokeLinecap="round" />
        <path d={`M ${mx} ${my} L ${tongue.x} ${tongue.y}`} stroke="#F07C9A" strokeWidth={11} strokeLinecap="round" />
        <circle cx={tongue.x} cy={tongue.y} r={17} fill="#F07C9A" stroke={INK} strokeWidth={6} />
      </g> : null}
      <g transform={`translate(${CX} ${CY})`}>
        {/* curled tail */}
        <path d="M 80 -50 Q 160 -50 158 8 Q 156 56 112 56 Q 78 54 82 22 Q 86 -2 112 4 Q 130 10 122 28" stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
        <path d="M 80 -50 Q 160 -50 158 8 Q 156 56 112 56 Q 78 54 82 22 Q 86 -2 112 4 Q 130 10 122 28" stroke={G1} strokeWidth={18} fill="none" strokeLinecap="round" />
        {/* far legs */}
        {[-40, 50].map((lx) => <path key={lx} d={`M ${lx + 12} -40 L ${lx + 22} -2`} stroke={INK} strokeWidth={20} strokeLinecap="round" />)}
        {[-40, 50].map((lx) => <path key={'g' + lx} d={`M ${lx + 12} -40 L ${lx + 22} -2`} stroke={G2} strokeWidth={10} strokeLinecap="round" />)}
        {/* body */}
        <g transform={`translate(0 -58) scale(1 ${breathe}) translate(0 58)`}>
          <path d="M -88 -60 Q -60 -118 10 -112 Q 80 -108 96 -56 Q 104 -18 70 -14 Q 0 -6 -60 -18 Q -96 -28 -88 -60 Z" fill="url(#cBody)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <path d="M -70 -24 Q 0 -12 74 -20" stroke={G3} strokeWidth={9} fill="none" strokeLinecap="round" />
          {[-40, 0, 40].map((sx) => <path key={sx} d={`M ${sx} -106 Q ${sx + 10} -70 ${sx - 4} -30`} stroke="#E6D35A" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.9} />)}
          <path d={`M -70 -92 ${Array.from({length: 9}, (_, i) => `L ${-60 + i * 18} ${i % 2 ? -118 : -108}`).join(' ')} L 92 -70`} stroke={INK} strokeWidth={5} fill="none" strokeLinejoin="round" />
        </g>
        {/* near legs gripping the branch */}
        {[-40, 50].map((lx) => <g key={'n' + lx}>
          <path d={`M ${lx} -40 L ${lx - 8} -2`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
          <path d={`M ${lx} -40 L ${lx - 8} -2`} stroke={G1} strokeWidth={12} strokeLinecap="round" />
          <path d={`M ${lx - 24} 4 Q ${lx - 8} -10 ${lx + 8} 4`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>)}
        {/* head */}
        <g transform={`translate(${HEAD_OFF.x} ${HEAD_OFF.y})`}>
          {/* far eye peeks over the top of the head */}
          <Turret x={FAR.x} y={FAR.y} r={20} g={gf} t={t} />
          <path d="M 52 -28 Q 30 -74 -10 -70 Q -52 -58 -76 -16 Q -90 10 -70 24 Q -20 40 40 26 Q 64 8 52 -28 Z" fill="url(#cBody)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <path d="M -6 -68 Q 30 -84 50 -30" stroke={G2} strokeWidth={5} fill="none" strokeLinecap="round" />
          {/* mouth: a long smug line */}
          {tongue ? <path d={`M ${MOUTH.x + 2} ${MOUTH.y - 6} Q -40 ${MOUTH.y + 4} 18 14 M ${MOUTH.x + 2} ${MOUTH.y + 6} Q -40 ${MOUTH.y + 14} 10 20`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
            : <path d={`M ${MOUTH.x + 4} ${MOUTH.y} Q -40 ${MOUTH.y + 12 + chew} 14 ${mood === 'smug' || mood === 'chew' ? 8 : 16} ${mood === 'smug' || mood === 'chew' ? 'q 8 -2 10 -10' : ''}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />}
          <circle cx={-70} cy={-4} r={2.5} fill={INK} />
          <Turret x={NEAR.x} y={NEAR.y} r={30} g={gn} t={t} />
          {/* smug half-lid brow over the near eye */}
          {mood !== 'wide' ? <path d={`M ${NEAR.x - 30} ${NEAR.y - 22} Q ${NEAR.x} ${NEAR.y - 36} ${NEAR.x + 30} ${NEAR.y - 26}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
        </g>
      </g>
    </W>
  );
};

// ---------- the flies ----------
const Fly: React.FC<{x: number; y: number; t: number; s?: number; rot?: number}> = ({x, y, t, s = 1, rot = 0}) => {
  const up = Math.floor(t * 60) % 2 === 0;
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={-4} cy={up ? -14 : -6} rx={14} ry={7} fill="#E8F4FF" opacity={0.85} stroke={INK} strokeWidth={2.5} transform={`rotate(${up ? -30 : 10} -4 -8)`} />
      <ellipse cx={-14} cy={0} rx={13} ry={9} fill="#2C2C30" stroke={INK} strokeWidth={3} />
      <circle cx={4} cy={-1} r={9} fill="#2C2C30" stroke={INK} strokeWidth={3} />
      <circle cx={9} cy={-3} r={5} fill="#D9443A" />
      <path d="M 4 4 L 16 12" stroke={INK} strokeWidth={2.5} strokeLinecap="round" /><circle cx={10} cy={-5} r={1.6} fill="#fff" />
    </g></W>
  );
};
const fa = (t: number): V => ({x: -128 + 66 * Math.sin(2 * Math.PI * t / 1.4), y: -368 + 34 * Math.cos(2 * Math.PI * t / 0.95)});
const fb0 = (t: number): V => ({x: 108 + 34 * Math.sin(2 * Math.PI * t / 1.15 + 1), y: -336 + 38 * Math.sin(2 * Math.PI * t / 0.85)});
/** fly B: eaten at the strike, flies back in from the right for the loop */
const fbAt = (t: number): V | null => {
  if (t < T.strike) return fb0(t);
  if (t < 21.1) return null;
  const u = eout(seg(t, 21.1, 21.75)), p = fb0(t);
  return {x: lerp(560, p.x, u), y: lerp(-420, p.y, u)};
};

// ---------- inserts (screen space) ----------
/** X-RAY of the chameleon's eye: the optic nerve coiled like a phone cord, stretching as the eye spins */
const NerveXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 350, a = 70 * Math.sin((t - 5.1) * 3.4);
  const stretch = 0.5 + 0.5 * Math.sin((t - 5.1) * 3.4);
  const cordS = popIn(t, T.coiled - 0.1, 0.35), labelS = popIn(t, T.phone, 0.3);
  const ex = -170, bx = 230;
  const pts: string[] = [];
  const x0 = ex + 70, x1 = bx - 80, n = 8;
  for (let i = 0; i <= 160; i++) {
    const u = i / 160, th = 2 * Math.PI * n * u;
    const x = lerp(x0, x1 + 30 * stretch, u) + 20 * (1 - 0.5 * stretch) * Math.cos(th) - 20 * (1 - 0.5 * stretch);
    const y = 46 * (1 - 0.35 * stretch) * Math.sin(th) + 18 * Math.sin(a * D2R) * (1 - u);
    pts.push(`${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  const cord = pts.join(' ');
  const eg = ang(Math.PI + a * D2R);
  return (
    <div style={{position: 'absolute', left: 540, top: 1080, transform: `translate(-50%,-50%) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <clipPath id="nxr"><circle r={R} /></clipPath>
        <circle r={R + 18} fill={INK} />
        <g clipPath="url(#nxr)">
          <rect x={-450} y={-450} width={900} height={900} fill="#16223A" />
          {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
          {/* brain on the right */}
          <ellipse cx={bx + 20} cy={0} rx={110} ry={86} fill="#EAF4FF" fillOpacity={0.12} stroke="#EAF4FF" strokeWidth={6} />
          <text x={bx + 20} y={8} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#EAF4FF">BRAIN</text>
          {/* the coiled nerve */}
          <g opacity={Math.min(1, 0.25 + cordS)}>
            <path d={cord} stroke={INK} strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d={cord} stroke={GOLD} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* the eye, spinning */}
          <g transform={`translate(${ex} 0)`}>
            <circle r={120} fill="none" stroke="#EAF4FF" strokeWidth={6} strokeDasharray="22 14" transform={`rotate(${t * 60})`} />
            <svg x={-100} y={-100} width={200} height={200} viewBox="-100 -100 200 200" style={{overflow: 'visible'}}>
              <Turret x={0} y={0} r={88} g={eg} t={t} />
            </svg>
            {/* spin arrows */}
            {[0, 180].map((r0) => <path key={r0} transform={`rotate(${r0 + t * 120})`} d="M 0 -140 A 140 140 0 0 1 99 -99" stroke={GOLD} strokeWidth={10} fill="none" strokeLinecap="round" />)}
          </g>
          <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.25} />
        </g>
        <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
      </svg>
      <div style={{position: 'absolute', left: '50%', top: 70, transform: 'translate(-50%,-50%) rotate(-3deg)', background: '#fff', border: `8px solid ${INK}`, borderRadius: 26,
        padding: '8px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 56, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>X-RAY</div>
      {labelS > 0.01 ? <div style={{position: 'absolute', left: '50%', top: 840, transform: `translate(-50%,-50%) rotate(2deg) scale(${labelS})`, background: GOLD, border: `8px solid ${INK}`, borderRadius: 26,
        padding: '8px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 60, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>PHONE-CORD NERVES</div> : null}
    </div>
  );
};

/** the 360 dial round the chameleon's head (world) */
const Dial: React.FC<{x: number; y: number; deg: number; s: number}> = ({x, y, deg, s}) => {
  if (s < 0.01) return null;
  const r = 150, a1 = 180 + deg;
  const large = deg > 180 ? 1 : 0;
  const ex = r * Math.cos(a1 * D2R), ey = r * Math.sin(a1 * D2R);
  const wedge = null;
  return (
    <W><g transform={`translate(${x} ${y}) scale(${s})`}>
      {wedge}
      <circle r={r} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeDasharray="10 12" opacity={0.85} />
      {deg > 1 ? (deg >= 359.5 ? <circle r={r} fill="none" stroke={GOLD} strokeWidth={18} /> : <path d={`M ${-r} 0 A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`} stroke={GOLD} strokeWidth={18} fill="none" strokeLinecap="round" />) : null}
      <g transform={`translate(${ex} ${ey}) rotate(${a1 + 90})`}><path d="M -16 -14 L 16 0 L -16 14 Z" fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>
    </g></W>
  );
};

/** VIEW: chameleon 360 vs you 200, as two pies */
const ViewPanel: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const youDeg = Math.round(200 * seg(t, T.you - 0.05, T.hundred + 0.2));
  const pie = (cx: number, deg: number, color: string) => {
    const r = 150, a1 = -90 + deg, large = deg > 180 ? 1 : 0;
    const ex = cx + r * Math.cos(a1 * D2R), ey = r * Math.sin(a1 * D2R);
    return <g>
      <circle cx={cx} cy={0} r={r} fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeDasharray="14 10" />
      {deg >= 359.5 ? <circle cx={cx} cy={0} r={r} fill={color} stroke={INK} strokeWidth={7} />
        : deg > 1 ? <path d={`M ${cx} 0 L ${cx} ${-r} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`} fill={color} stroke={INK} strokeWidth={7} strokeLinejoin="round" /> : null}
      <circle cx={cx} cy={0} r={18} fill={INK} />
    </g>;
  };
  return (
    <div style={{position: 'absolute', left: 540, top: 1040, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={880} height={760} viewBox="-440 -380 880 760" style={{overflow: 'visible'}}>
        <rect x={-420} y={-360} width={840} height={720} rx={46} fill="#FFFDF6" stroke={INK} strokeWidth={10} />
        <text x={0} y={-280} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={INK}>HOW FAR YOU SEE</text>
        <path d="M 0 -230 V 330" stroke={INK} strokeWidth={5} strokeDasharray="18 14" />
        <g transform="translate(0 0)">{pie(-210, 360, G1)}{pie(210, youDeg, '#FFFFFF')}{youDeg > 1 && youDeg < 359 ? null : null}</g>
        {youDeg > 1 ? <path d={`M 210 0 L 210 -150 A 150 150 0 ${youDeg > 180 ? 1 : 0} 1 ${210 + 150 * Math.cos((-90 + youDeg) * D2R)} ${150 * Math.sin((-90 + youDeg) * D2R)} Z`} fill="#9FD3FF" stroke={INK} strokeWidth={7} strokeLinejoin="round" /> : null}
        <text x={-210} y={270} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={G1} stroke={INK} strokeWidth={5} style={{paintOrder: 'stroke'}}>360°</text>
        <text x={210} y={270} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={96} fill={INK}>{youDeg}°</text>
        <text x={-210} y={-185} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={INK}>CHAMELEON</text>
        <text x={210} y={-185} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={48} fill={INK}>YOU</text>
      </svg>
    </div>
  );
};

/** YOUR BRAIN: two eye pictures go in, one picture comes out; after the split the pictures don't match -> double */
const BrainPanel: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const split = t > T.split;
  const sp = popIn(t, T.split, 0.3);
  const outS = popIn(t, T.merges, 0.35);
  const flyDoodle = (x: number, y: number, k = 1, key?: string) => (
    <g key={key} transform={`translate(${x} ${y}) scale(${k})`}>
      <ellipse cx={-4} cy={-14} rx={14} ry={7} fill="#E8F4FF" stroke={INK} strokeWidth={3} transform="rotate(-25 -4 -8)" />
      <ellipse cx={-12} cy={0} rx={13} ry={9} fill="#2C2C30" stroke={INK} strokeWidth={3} />
      <circle cx={5} cy={-1} r={9} fill="#2C2C30" stroke={INK} strokeWidth={3} /><circle cx={10} cy={-3} r={5} fill="#D9443A" />
    </g>);
  const flower = (x: number, y: number, k = 1) => (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <path d="M 0 10 V 40" stroke="#4F8A3F" strokeWidth={6} />
      {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={14 * Math.cos(a * D2R)} cy={14 * Math.sin(a * D2R)} r={11} fill="#FF9EC2" stroke={INK} strokeWidth={4} />)}
      <circle r={9} fill={GOLD} stroke={INK} strokeWidth={4} />
    </g>);
  const box = (x: number, y: number, w: number, h: number, stroke: string, kids: React.ReactNode) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={18} fill="#FFFDF6" stroke={stroke} strokeWidth={8} />
      {kids}
    </g>);
  const j = split ? 4 * Math.sin(t * 40) : 0;
  return (
    <div style={{position: 'absolute', left: 540, top: 1370, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s})`}}>
      <svg width={800} height={800} viewBox="-400 -400 800 800" style={{overflow: 'visible'}}>
        <clipPath id="bxr"><circle r={330} /></clipPath>
        <circle r={346} fill={INK} />
        <g clipPath="url(#bxr)">
          <rect x={-400} y={-400} width={800} height={800} fill="#16223A" />
          {Array.from({length: 11}, (_, i) => <path key={i} d={`M ${-400 + i * 80} -400 V 400 M -400 ${-400 + i * 80} H 400`} stroke="#2A3A5C" strokeWidth={3} />)}
          <text x={-150} y={-232} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#EAF4FF">LEFT EYE</text>
          <text x={150} y={-232} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={30} fill="#EAF4FF">RIGHT EYE</text>
          {box(-150, -160, 180, 110, INK, flyDoodle(0, 0, 1.6))}
          {box(150, -160, 180, 110, split ? RED : INK, split ? <g transform={`scale(${0.5 + 0.5 * sp})`}>{flower(0, -10, 1.4)}</g> : flyDoodle(0, 0, 1.6))}
          {/* arrows into the brain */}
          {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 150} -98 Q ${sd * 120} -40 ${sd * 60} -10`} stroke="#EAF4FF" strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="16 12" strokeDashoffset={-t * 80} />)}
          <g transform={`translate(0 20) scale(${1 + (split ? 0.06 * Math.sin(t * 30) : 0.02 * Math.sin(t * 6))})`}>
            <path d="M -70 14 Q -92 -26 -56 -48 Q -48 -84 -8 -74 Q 20 -96 48 -68 Q 86 -66 80 -24 Q 100 8 70 34 Q 64 62 26 58 Q 0 76 -28 58 Q -66 60 -70 14 Z" fill="#F6A6B8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <path d="M -40 -26 Q -22 -40 -6 -24 M 14 -50 Q 20 -24 42 -28 M -30 20 Q -8 6 12 22 M 34 8 Q 50 24 62 8" stroke="#C9627C" strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
          <path d="M 0 82 V 120" stroke="#EAF4FF" strokeWidth={8} strokeLinecap="round" strokeDasharray="12 10" strokeDashoffset={-t * 80} />
          {outS > 0.01 ? <g transform={`translate(0 200) scale(${outS})`}>
            {box(0, 0, 230, 130, split ? RED : '#3FAE5A', split
              ? <g><g opacity={0.65} transform={`translate(${-28 + j} 0)`}>{flyDoodle(0, 0, 1.7)}</g><g opacity={0.65} transform={`translate(${30 - j} 0)`}>{flower(0, -8, 1.4)}</g></g>
              : flyDoodle(0, 0, 1.8))}
          </g> : null}
          <rect x={-400} y={((t * 520) % 800) - 400} width={800} height={14} fill="#9FD3FF" opacity={0.22} />
        </g>
        <circle r={330} fill="none" stroke="#3E6FB0" strokeWidth={18} />
      </svg>
      <div style={{position: 'absolute', left: '50%', top: 54, transform: 'translate(-50%,-50%) rotate(-3deg)', background: '#fff', border: `8px solid ${INK}`, borderRadius: 26,
        padding: '6px 24px', fontFamily: FONT, fontWeight: 900, fontSize: 50, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>YOUR BRAIN</div>
      {outS > 0.01 ? <div style={{position: 'absolute', left: '50%', top: 740, transform: `translate(-50%,-50%) rotate(2deg) scale(${outS})`, background: split ? RED : GOLD, color: split ? '#fff' : INK,
        border: `8px solid ${INK}`, borderRadius: 26, padding: '6px 28px', fontFamily: FONT, fontWeight: 900, fontSize: 54, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{split ? 'DOUBLE VISION' : 'ONE PICTURE'}</div> : null}
    </div>
  );
};

// ---------- the story over time ----------
type GuyState = {x: number; rot: number; gl: V; gr: V; shutR: number; mood: HeadMood; pose: Pose};
const eyeL = (gx: number, hy: number): V => ({x: gx - EYE_DX, y: hy + EYE_DY});
const eyeR = (gx: number, hy: number): V => ({x: gx + EYE_DX, y: hy + EYE_DY});
const guyAt = (t: number): GuyState => {
  const hy = headOf('front_calm').hy;
  const A = fa(t), B = fbAt(t) ?? fb0(t);
  const track = (x: number): {gl: V; gr: V} => ({gl: dirTo(eyeL(x, hy), A), gr: dirTo(eyeR(x, hy), B)});
  const base: GuyState = {x: GX, rot: 0, ...track(GX), shutR: 0, mood: 'worried', pose: 'front_calm'};
  if (t < 11.35) return base;                                            // each eye chases its own fly
  if (t < T.split) {                                                    // brain: both eyes on fly A -> one picture
    const both = dirTo(eyeR(GX, hy), A), u = eio(seg(t, 11.35, 11.75));
    return {...base, gr: mixV(track(GX).gr, both, u), mood: t > T.merges ? 'calm' : 'worried'};
  }
  if (t < 14.5) {                                                       // split: the right eye snaps to fly B
    const both = dirTo(eyeR(GX, hy), A), u = eout(seg(t, T.split, T.split + 0.15));
    return {...base, gr: mixV(both, track(GX).gr, u), mood: 'worried'};
  }
  if (t < 15.85) {                                                      // lunges at the wrong fly of two: BONK, dizzy
    const x = keysAt([[14.5, 0], [14.98, -196], [15.12, -150], [15.85, -30]], t, (u) => u);
    const rot = keysAt([[14.5, 0], [14.95, -14], [15.1, 8], [15.5, -4], [15.85, 0]], t);
    const dizzy = t > 15.0;
    const tr = track(x);
    return {...base, x, rot, gl: dizzy ? ang(t * 9) : tr.gl, gr: dizzy ? ang(-t * 9) : dirTo(eyeR(x, hy), {x: A.x - 60, y: A.y + 10}), mood: dizzy ? 'dizzy' : 'worried'};
  }
  if (t < T.so) return {...base, mood: t > T.strike ? 'worried' : 'calm'};
  if (t < 21.25) {                                                      // shuts one eye: happy, the other follows fly A
    const sh = eout(seg(t, T.shuts - 0.12, T.shuts + 0.05));
    return {...base, shutR: sh, mood: t > T.shuts ? 'happy' : 'squint', gr: dirTo(eyeR(GX, hy), A)};
  }
  // fly B is back: the shut eye pops open and chases it -> frame 0
  const op = 1 - eout(seg(t, 21.25, 21.4));
  return {...base, shutR: op, mood: t > 21.35 ? 'worried' : 'happy'};
};
const chamAt = (t: number): {gn: V; gf: V; mood: ChamMood; tongue: V | null} => {
  const N = chamEye('near'), F = chamEye('far');
  const A = fa(t), B = fbAt(t);
  const trackN = B ? dirTo(N, B) : ang(Math.PI + 0.3 * Math.sin(t * 2)), trackF = dirTo(F, A);
  let gn = trackN, gf = trackF, mood: ChamMood = 'smug', tongue: V | null = null;
  if (t > 3.45 && t < 7.15) {                                           // spins each eye its own way
    const u = eio(seg(t, 3.45, 3.8)) * (1 - eio(seg(t, 6.9, 7.15)));
    gn = mixV(trackN, ang(2 * Math.PI * (t - 3.45) / 1.1 + Math.PI), u);
    gf = mixV(trackF, ang(-2 * Math.PI * (t - 3.45) / 0.85 + Math.PI), u);
  }
  if (t > 7.15 && t < 10.0) {                                           // sweeps all round: one down-back, one up-back
    const k = eio(seg(t, T.nearly, T.degrees)), u = eio(seg(t, 7.15, 7.5)) * (1 - eio(seg(t, 9.7, 10.0)));
    gn = mixV(trackN, ang(Math.PI - k * Math.PI), u);
    gf = mixV(trackF, ang(Math.PI + k * Math.PI), u);
  }
  if (t > T.points - 0.1 && t < 18.2 && B) {                            // both eyes lock forward on fly B
    const u = eout(seg(t, T.points - 0.1, T.points + 0.15));
    gn = mixV(trackN, dirTo(N, B), u); gf = mixV(trackF, dirTo(F, B), u);
    mood = 'wide';
  }
  if (t > T.points - 0.1 && t < 18.2 && !B) { gn = ang(Math.PI * 0.85); gf = ang(Math.PI * 0.8); }
  // tongue: shoots out at "strike", grabs fly B, back in by 17.98
  if (t > T.strike - 0.08 && t < 17.98) {
    const p = fb0(T.strike), mx = CX + HEAD_OFF.x + MOUTH.x, my = CY + HEAD_OFF.y + MOUTH.y;
    const u = t < T.strike ? eout(seg(t, T.strike - 0.08, T.strike)) : 1 - eio(seg(t, T.strike + 0.06, 17.98));
    tongue = {x: lerp(mx, p.x, u), y: lerp(my, p.y, u)};
  }
  if (t > 17.98 && t < 18.9) mood = 'chew';
  return {gn, gf, mood, tongue};
};

export const ChamScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; ghost?: boolean}> = ({t, camK, thumb, ghost}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: 128, y: -258, k: 2.55}, {t: 3.3, x: 126, y: -258, k: 2.65},          // both big: his split eyes + the chameleon's
    {t: 3.45, x: CX - 95, y: -250, k: 3.1}, {t: 7.1, x: CX - 95, y: -250, k: 3.35},  // the chameleon spins its eyes (X-ray over)
    {t: 7.2, x: CX - 70, y: -270, k: 2.45}, {t: 9.85, x: CX - 70, y: -270, k: 2.6},  // the 360 dial
    {t: 10.0, x: 120, y: -250, k: 2.0}, {t: 11.3, x: 120, y: -250, k: 2.05},        // (behind the VIEW panel)
    {t: 11.4, x: 0, y: -100, k: 2.9}, {t: 14.4, x: 0, y: -100, k: 3.05},            // his face over YOUR BRAIN
    {t: 14.5, x: -115, y: -250, k: 2.1}, {t: 15.75, x: -120, y: -250, k: 2.2},      // the bonk
    {t: 15.85, x: CX - 120, y: -275, k: 2.7}, {t: 18.25, x: CX - 120, y: -275, k: 2.85}, // the strike
    {t: 18.4, x: 30, y: -255, k: 2.8}, {t: 19.6, x: 30, y: -255, k: 2.9},           // he shuts one eye
    {t: 19.75, x: 128, y: -258, k: 2.55},                                            // back to the frame-0 shot
  ], t);
  const sh = shake(t, hit(t, 15.0, 10, 6) + hit(t, T.split, 4, 8) + hit(t, T.strike, 4, 8));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t);
  const h = headOf(g.pose);
  const r = g.rot * D2R;
  const headX = g.x + h.hx * Math.cos(r) - h.hy * Math.sin(r), headY = h.hx * Math.sin(r) + h.hy * Math.cos(r);
  const c = chamAt(t);
  const A = fa(t), B = fbAt(t);
  // inserts
  const nerveS = popIn(t, 5.12, 0.35) * (1 - seg(t, 6.95, 7.18));
  const dialS = popIn(t, T.it, 0.3) * (1 - seg(t, 9.75, 9.98));
  const dialDeg = 360 * eio(seg(t, T.nearly, T.degrees));
  const viewS = popIn(t, 9.98, 0.35) * (1 - seg(t, 11.15, 11.38));
  const brainS = popIn(t, 11.38, 0.35) * (1 - seg(t, 14.28, 14.5));
  // stickers
  const doubleS = pulse(t, T.double, 0.95);
  const spinS = pulse(t, T.spins, 0.85);
  const degS = popIn(t, T.nearly, 0.3) * (1 - seg(t, 9.75, 9.95));
  const x2S = pulse(t, T.twoOf, 0.3);
  const bonkS = pulse(t, 15.0, 0.6);
  const lockS = pulse(t, T.points, 0.95);
  const snapS = pulse(t, T.strike, 0.55);
  const oneS = pulse(t, T.shuts, 0.6);
  const stars = t > 15.0 && t < 15.85 ? 1 - seg(t, 15.6, 15.85) : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: ghost ? 'transparent' : '#BFE3F3'}}>
      <Defs />
      {ghost ? null : <>
        <Layer cam={cam} z={3200} paper={false}><Backdrop t={t} /></Layer>
        <Layer cam={cam} z={1900}><Hills /></Layer>
        <Layer cam={cam} z={1000} paper={false}>
          <Ground />
          <CastShadow x={g.x} w={150} />
        </Layer>
      </>}
      <Layer cam={cam} z={1000}>
        {ghost ? null : <><Post /><Tree /></>}
        <Chameleon t={t} gn={c.gn} gf={c.gf} mood={c.mood} tongue={c.tongue} />
        <Guy pose={g.pose} x={g.x} y={0} t={t} rot={g.rot} breathe={false} />
        <GuyHead x={headX} y={headY} gl={g.gl} gr={g.gr} shutR={g.shutR} mood={g.mood} t={t} rot={g.rot} />
        <Fly x={A.x} y={A.y} t={t} s={1.5} rot={8 * Math.sin(t * 9)} />
        {B ? <Fly x={B.x} y={B.y} t={t + 0.3} s={1.5} rot={-8 * Math.sin(t * 8)} /> : null}
        {c.tongue && t >= T.strike && t < 17.98 ? <Fly x={c.tongue.x} y={c.tongue.y} t={t} s={1.3} rot={30} /> : null}
      </Layer>
      {ghost ? null : <>
        <Layer cam={cam} z={1000}>
          <Dial x={CX + HEAD_OFF.x} y={CY + HEAD_OFF.y - 10} deg={dialDeg} s={dialS} />
          {[0, 1, 2].map((i) => {
            const a = t * 5 + (i * 2 * Math.PI) / 3;
            return <Star key={i} x={headX + Math.cos(a) * 82} y={headY - 80 + Math.sin(a) * 16} s={stars * 0.55} rot={t * 200} />;
          })}
          <Txt x={cam0.x} y={headY - 128} s={doubleS} text="DOUBLE" size={74} rot={-6} fill={GOLD} />
          <Txt x={cam0.x} y={-395} s={spinS} text="SPIN" size={70} rot={-6} fill={GOLD} />
          <Txt x={cam0.x} y={CY + HEAD_OFF.y - 205} s={degS} text={`${Math.round(dialDeg)}°`} size={84} rot={-4} fill={GOLD} />
          <Txt x={cam0.x} y={-420} s={x2S} text="x2" size={90} rot={-8} fill={GOLD} />
          <Txt x={POSTX + 150} y={headY - 120} s={bonkS} text="BONK" size={86} rot={-10} fill={GOLD} />
          <Txt x={cam0.x} y={-430} s={lockS} text="LOCKED ON" size={58} rot={-5} fill={GOLD} />
          <Txt x={(c.tongue?.x ?? 100) - 10} y={-420} s={snapS} text="SNAP" size={80} rot={8} fill={GOLD} />
          <Txt x={cam0.x} y={headY - 122} s={oneS} text="ONE EYE" size={60} rot={-5} fill={GOLD} />
        </Layer>
        <NerveXRay t={t} s={nerveS} />
        <ViewPanel t={t} s={viewS} />
        <BrainPanel t={t} s={brainS} />
        {thumb ? null : <>
          <CommentBubble t={t} text="what if you had a chameleon's eyes??" />
          <CallToAction t={t} at={T.cta} />
          <CommentAsk t={t} at={T.eagle} until={22.3} text="Eagle eyes or cat eyes?" />
        </>}
      </>}
    </AbsoluteFill>
  );
};

/** his double vision: a ghost copy of the characters, offset sideways (on "see double" and "two of everything") */
const ghostAt = (t: number) => {
  const a = seg(t, T.double, T.double + 0.15) * (1 - seg(t, 3.15, 3.35));
  const b = seg(t, T.twoOf - 0.05, T.twoOf + 0.1) * (1 - seg(t, 14.95, 15.0));
  return Math.max(a, b);
};

export const ChamVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const gh = ghostAt(t);
  const dial: Cue[] = [];
  for (let i = 1; i <= 14; i++) dial.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.nearly, T.degrees, i / 14), db: -30});
  const you: Cue[] = [];
  for (let i = 1; i <= 8; i++) you.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.you, T.hundred + 0.2, i / 8), db: -27});
  const cues: Cue[] = [
    {f: 'whoosh.wav', at: 0, db: -16}, {f: 'twang.mp3', at: 0, db: -20, to: 0.4}, {f: 'whir.mp3', at: 0, db: -32, to: 3.3},
    {f: 'whoosh.wav', at: 0.8, db: -26}, {f: 'pop.wav', at: T.double, db: -20}, {f: 'zap.wav', at: T.double, db: -30},
    {f: 'whoosh.wav', at: 3.4, db: -28}, {f: 'squeak.wav', at: T.spins, db: -28}, {f: 'squeak.wav', at: T.spins + 0.45, db: -30}, {f: 'squeak.wav', at: T.alone, db: -28},
    {f: 'zap.wav', at: 5.12, db: -26}, {f: 'twang.mp3', at: T.coiled, db: -32, to: 0.4}, {f: 'pop.wav', at: T.phone, db: -22}, {f: 'twang.mp3', at: T.cord + 0.1, db: -30, to: 0.4},
    {f: 'whoosh.wav', at: 7.12, db: -28}, {f: 'pop.wav', at: T.it, db: -26}, ...dial, {f: 'ding.mp3', at: T.degrees + 0.05, db: -22},
    {f: 'pop.wav', at: 9.98, db: -24}, ...you, {f: 'ding.mp3', at: T.hundred + 0.25, db: -26},
    {f: 'whoosh.wav', at: 11.3, db: -28}, {f: 'zap.wav', at: 11.38, db: -28}, {f: 'pop.wav', at: T.merges, db: -22},
    {f: 'zap.wav', at: T.split, db: -20}, {f: 'twang.mp3', at: T.split, db: -26, to: 0.4},
    {f: 'whoosh.wav', at: 14.45, db: -26}, {f: 'pop.wav', at: T.twoOf, db: -24}, {f: 'whoosh.wav', at: 14.75, db: -16},
    {f: 'crack.wav', at: 14.7, db: -22}, {f: 'twang.mp3', at: 15.0, db: -16}, {f: 'chirp.wav', at: 15.2, db: -30}, {f: 'crowd_laugh.wav', at: 15.05, db: -33, to: 1.1},
    {f: 'whoosh.wav', at: 15.8, db: -28}, {f: 'tick.wav', at: T.points, db: -16}, {f: 'tick2.wav', at: T.points + 0.08, db: -16},
    {f: 'whoosh.wav', at: T.strike - 0.1, db: -18}, {f: 'pop.wav', at: T.strike, db: -16}, {f: 'gulp.wav', at: 18.0, db: -24},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: 18.35, db: -28}, {f: 'pop.wav', at: T.shuts, db: -24},
    {f: 'whoosh.wav', at: 19.7, db: -28}, {f: 'whir.mp3', at: 21.1, db: -32, to: 1.4}, {f: 'pop.wav', at: 21.27, db: -24},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<ChamScene t={0} />}>
        <ChamScene t={t} />
        {gh > 0.01 ? <AbsoluteFill style={{opacity: 0.42 * gh, transform: `translateX(${46 * gh}px)`, pointerEvents: 'none'}}><ChamScene t={t} ghost /></AbsoluteFill> : null}
      </LoopOut>
      <Look />
      <SoundLayer voice="chameleon/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const ChamWide: React.FC = () => <WideFit.Provider value={0.72}><ChamVideo /></WideFit.Provider>;
