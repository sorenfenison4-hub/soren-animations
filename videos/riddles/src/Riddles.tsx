// "Which animals gave him these powers?" - riddle format (the user, 2026-11-17), niche: animal powers. Three animal
// powers on the guy, each with the animal beside him as a black silhouette with a "?"; viewers comment their guesses
// during a 3-2-1 countdown, then a quiz board flips all three cards: octopus, butterfly, wombat.
// Owl/zebra recipe points kept: the power is ON HIM at frame 0 (X-ray lens on his chest: three hearts pumping blue
// blood), the co-star beside him, he DOES things (stands in spaghetti and tastes it with his feet, hops into mud,
// cubes stack up), one comedy hit (the last cube lands on his head: BOING, dizzy, laugh), a sticker every ~1.5 s, a cut
// every 2-3 s, a comment bubble opener, a seamless loop. Everything drawn in code; the body is the library sprite.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Pose, HEAD_R, Star, Arrow, SoundLayer, Cue, seg, popIn, lerp, eio, eout, backOut, clamp,
  shake, hit, spring, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble} from './lib/kit';

// voice: vo/final-trim.mp3 at 0.1 s = intro take ("Three animal riddles. Comment which ones you get right.") + the main
// take (trim + tighten.py --tempo 1.06 --keep 0.3) with 3 s think gaps after each "What am I?", a 2.4 s countdown gap
// after "reveal" and small gaps around the answers. Times below are video time (RMS silences + Scribe words). Last word ends ~55.18 s.
export const DURATION = 56.0;
export const T = {
  comment: 1.64,                                                    // intro: "Three animal riddles. Comment which ones you get right."
  r1: 3.4, hearts: 5.09, blue: 6.68, what1: 7.38,                   // "Riddle one. I have three hearts, and my blood is blue. What am I?"
  r2: 11.26, taste: 12.34, feet: 13.74,                             // "Riddle two. I taste my food with my feet. What am I?"
  r3: 18.22, poop: 19.47, cubes: 20.83,                             // "Riddle three. My poop comes out shaped like cubes. What am I?"
  put: 25.52, comments: 26.85,                                      // "Put your three answers in the comments before the reveal."
  c3: 28.4, c2: 29.15, c1: 29.9,                                    // countdown (silence)
  num1: 30.62, octopus: 31.54, body: 34.69, gills: 36.22, copper: 37.16, blue2: 38.29,
  num2: 39.16, butterfly: 40.08, sensors: 42.11, feet2: 42.87, lands: 43.62, taste2: 44.6,
  num3: 45.52, wombat: 46.5, squeezes: 48.39, cubes2: 49.59, rocks: 51.03, turf: 51.9,
  how: 52.88,                                                       // "How many did you get? Tell me in the comments."
  cta: 41.6,
};
// shots
const R1 = 3.35, R2 = 11.26, R3 = 18.22, CMT = 25.45, EX1 = 33.02, EX2 = 41.46, EX3 = 47.8, ROCK = 50.85, END = 52.8;
const THINK: [number, number][] = [[7.98, 11.2], [14.94, 18.16], [22.26, 25.42]];
const BOARD_WIN: [number, number][] = [[0, R1], [CMT, EX1], [T.num2 - 0.02, EX2], [T.num3 - 0.05, EX3], [END, 999]];

const GOLD = '#FFD43B', RED = '#E2453C', BLUEB = '#3E7BE0';
const OCTO = '#EE7A5B', OCTO2 = '#C9563D', WING = '#F59A2E', WING2 = '#D9741A', WOMB = '#9A7454', WOMB2 = '#7A5A3E';
const GX = -85;           // guy's feet
const AX = 100;           // the animal's pedestal
const PED = 40;           // pedestal height

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 40, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
/** sticker that is fully on at frame 0 (no pop-in) and pops out at `out` */
const held = (t: number, out: number) => 1 - seg(t, out, out + 0.2);

const Defs: React.FC = () => (
  <W><defs>
    <filter id="sil" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0 0 0 0 0.09  0 0 0 0 0.09  0 0 0 0 0.11  0 0 0 1 0" />
    </filter>
    <radialGradient id="rFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <linearGradient id="rGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E9DCC0" /><stop offset="1" stopColor="#D9C9A8" /></linearGradient>
  </defs></W>
);

// ---------- set: a stage in the notebook (curtains + floor) ----------
const Stage: React.FC<{t: number}> = ({t}) => (
  <W>
    {/* curtains */}
    {[-1, 1].map((sd) => (
      <g key={sd} transform={`translate(${sd * 330} 0) scale(${sd} 1)`}>
        <path d={`M 0 -700 Q ${-30 + 6 * Math.sin(t * 1.3)} -350 20 -40 L 20 40 L 400 40 L 400 -700 Z`} fill="#D9473F" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {[80, 160, 240, 320].map((x) => <path key={x} d={`M ${x} -690 Q ${x - 14} -350 ${x + 10} 30`} stroke="#B5352F" strokeWidth={10} fill="none" strokeLinecap="round" />)}
        <path d="M 20 -330 Q 70 -300 120 -330" stroke={GOLD} strokeWidth={12} fill="none" strokeLinecap="round" />
      </g>))}
    {/* top valance with "?" */}
    <path d="M -800 -720 H 800 V -620 Q 700 -580 600 -620 Q 500 -580 400 -620 Q 300 -580 200 -620 Q 100 -580 0 -620 Q -100 -580 -200 -620 Q -300 -580 -400 -620 Q -500 -580 -600 -620 Q -700 -580 -800 -620 Z" fill="#B5352F" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[-600, -300, 0, 300, 600].map((x, i) => <text key={x} x={x} y={-640} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={GOLD} stroke={INK} strokeWidth={8} style={{paintOrder: 'stroke'}} transform={`rotate(${8 * Math.sin(t * 2 + i)} ${x} -660)`}>?</text>)}
  </W>
);
const Floor: React.FC = () => (
  <W>
    <rect x={-1200} y={0} width={2400} height={1400} fill="url(#rGrass)" />
    <path d="M -1200 0 H 1200" stroke={INK} strokeWidth={8} />
    {Array.from({length: 14}, (_, i) => <path key={i} d={`M ${-1100 + i * 170} 0 L ${-1500 + i * 230} 1400`} stroke="#C9B48E" strokeWidth={5} />)}
  </W>
);
const Shadow: React.FC<{x: number; w: number; y?: number}> = ({x, w, y = 4}) => <W><ellipse cx={x} cy={y} rx={w * 0.55} ry={12} fill="#5A4428" opacity={0.25} /></W>;
const Pedestal: React.FC<{t: number}> = ({t}) => (
  <W><g transform={`translate(${AX} 0)`}>
    <path d={`M -64 0 L -58 ${-PED} H 58 L 64 0 Z`} fill="#8C6FD1" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d={`M -64 ${-PED} H 64 V ${-PED - 10} H -64 Z`} fill="#A98DEA" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <text x={0} y={-8} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={GOLD} stroke={INK} strokeWidth={5} style={{paintOrder: 'stroke'}}>? ? ?</text>
  </g></W>
);

// ---------- the three animals (local frame: base at 0,0, ~140 units tall, facing left toward the guy) ----------
type AMood = 'smug' | 'happy';
const Eyes: React.FC<{x: number; y: number; r: number; gap: number; mood: AMood; t: number}> = ({x, y, r, gap, mood, t}) => {
  const blink = (t % 3.1) > 3.0;
  return <g>{[-1, 1].map((sd) => (
    <g key={sd} transform={`translate(${x + sd * gap} ${y})`}>
      <ellipse rx={r} ry={r * 1.15} fill="#fff" stroke={INK} strokeWidth={4} />
      {blink ? <path d={`M ${-r} 0 H ${r}`} stroke={INK} strokeWidth={4} /> : <>
        <circle cx={-r * 0.3} cy={r * 0.15} r={r * 0.55} fill={INK} /><circle cx={-r * 0.45} cy={-r * 0.1} r={r * 0.18} fill="#fff" />
        {mood === 'smug' ? <path d={`M ${-r - 2} ${-r * 0.05} A ${r} ${r * 1.15} 0 0 1 ${r + 2} ${-r * 0.05} Z`} fill="#D8CFC4" stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </>}
    </g>))}</g>;
};
const Octopus: React.FC<{t: number; mood?: AMood}> = ({t, mood = 'smug'}) => {
  const arms = [-62, -44, -26, -9, 9, 26, 44, 62];
  return (
    <g>
      {arms.map((x0, i) => {
        const w = 10 * Math.sin(t * 3 + i * 0.9);
        const x1 = x0 * 1.55 + w, d = `M ${x0 * 0.45} -48 Q ${x0 * 1.1} ${-20 + w * 0.5} ${x1} -6 Q ${x1 + Math.sign(x0 || 1) * 18} 4 ${x1 + Math.sign(x0 || 1) * 10} -14`;
        return <g key={i}><path d={d} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" /><path d={d} stroke={i % 2 ? OCTO : OCTO2} strokeWidth={13} fill="none" strokeLinecap="round" /></g>;
      })}
      <path d="M -50 -46 Q -58 -150 0 -152 Q 58 -150 50 -46 Q 0 -30 -50 -46 Z" fill={OCTO} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <circle cx={18} cy={-122} r={8} fill={OCTO2} opacity={0.7} /><circle cx={30} cy={-100} r={5} fill={OCTO2} opacity={0.7} />
      <Eyes x={-6} y={-78} r={12} gap={17} mood={mood} t={t} />
      <path d={mood === 'happy' ? 'M -18 -56 Q -6 -44 6 -56 Z' : 'M -16 -54 Q -6 -50 4 -56'} fill={mood === 'happy' ? '#7A2A36' : 'none'} stroke={INK} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
const Butterfly: React.FC<{t: number; mood?: AMood}> = ({t, mood = 'smug'}) => {
  const flap = 0.45 + 0.55 * Math.abs(Math.cos(t * 2 * Math.PI * 2.2));
  const bob = 6 * Math.sin(t * 2 * Math.PI * 1.1);
  const wing = (sd: number) => (
    <g transform={`scale(${sd * flap} 1)`}>
      <path d="M 4 -100 Q 40 -170 92 -150 Q 110 -110 70 -84 Q 40 -74 4 -84 Z" fill={WING} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 4 -80 Q 60 -80 72 -46 Q 60 -18 30 -26 Q 10 -40 4 -66 Z" fill={WING2} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 14 -96 Q 50 -120 80 -134 M 14 -90 Q 50 -96 86 -108 M 12 -72 Q 40 -60 56 -42" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      {[[84, -142], [96, -124], [64, -40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4.5} fill="#fff" stroke={INK} strokeWidth={2} />)}
    </g>
  );
  return (
    <g transform={`translate(0 ${bob - 20})`}>
      {wing(-1)}{wing(1)}
      <rect x={-9} y={-112} width={18} height={84} rx={9} fill="#3A3030" stroke={INK} strokeWidth={5} />
      <circle cx={0} cy={-128} r={20} fill="#3A3030" stroke={INK} strokeWidth={5} />
      <path d="M -6 -146 Q -18 -176 -30 -182 M 6 -146 Q 12 -176 24 -184" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      <circle cx={-30} cy={-182} r={5} fill={INK} /><circle cx={24} cy={-184} r={5} fill={INK} />
      <Eyes x={-3} y={-131} r={7} gap={9} mood={mood} t={t + 0.7} />
      <path d={mood === 'happy' ? 'M -9 -118 Q -2 -110 5 -118 Z' : 'M -8 -117 Q -2 -114 4 -118'} fill={mood === 'happy' ? '#7A2A36' : 'none'} stroke="#fff" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};
const Cube: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -17 -17 H 17 V 17 H -17 Z" fill="#8A5E3B" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -17 -17 L -9 -24 H 25 L 17 -17 Z M 17 -17 L 25 -24 V 10 L 17 17 Z" fill="#6E4A2C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);
const Wombat: React.FC<{t: number; mood?: AMood; cubes?: boolean}> = ({t, mood = 'smug', cubes}) => {
  const br = 1 + 0.015 * Math.sin(t * 2 * Math.PI * 0.7);
  return (
    <g transform={`scale(1 ${br})`}>
      {cubes ? <><Cube x={52} y={-17} s={0.7} /><Cube x={70} y={-17} s={0.7} /><Cube x={61} y={-39} s={0.7} /></> : null}
      {[-38, 20].map((x) => <rect key={x} x={x - 12} y={-30} width={26} height={30} rx={10} fill={WOMB2} stroke={INK} strokeWidth={6} />)}
      <ellipse cx={8} cy={-56} rx={64} ry={42} fill={WOMB} stroke={INK} strokeWidth={7} />
      <path d="M 30 -90 Q 60 -80 66 -54" stroke={WOMB2} strokeWidth={8} fill="none" strokeLinecap="round" />
      <circle cx={-42} cy={-80} r={36} fill={WOMB} stroke={INK} strokeWidth={7} />
      {[-64, -26].map((x) => <circle key={x} cx={x} cy={-112} r={11} fill={WOMB} stroke={INK} strokeWidth={6} />)}
      <ellipse cx={-70} cy={-68} rx={16} ry={12} fill="#3A2E2A" stroke={INK} strokeWidth={4} />
      <circle cx={-74} cy={-72} r={3.5} fill="#fff" />
      <Eyes x={-44} y={-90} r={8} gap={12} mood={mood} t={t + 1.4} />
      <path d={mood === 'happy' ? 'M -62 -52 Q -50 -42 -38 -52 Z' : 'M -60 -52 Q -50 -48 -40 -53'} fill={mood === 'happy' ? '#7A2A36' : 'none'} stroke={INK} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
};
type AName = 'octopus' | 'butterfly' | 'wombat';
const Animal: React.FC<{name: AName; t: number; mood?: AMood; cubes?: boolean}> = ({name, t, mood, cubes}) =>
  name === 'octopus' ? <Octopus t={t} mood={mood} /> : name === 'butterfly' ? <Butterfly t={t} mood={mood} /> : <Wombat t={t} mood={mood} cubes={cubes} />;
/** the animal as a black silhouette with a bobbing white "?" on it */
const Mystery: React.FC<{name: AName; t: number; qs?: number; cubes?: boolean}> = ({name, t, qs = 1, cubes}) => (
  <g>
    <g filter="url(#sil)"><Animal name={name} t={t} cubes={cubes} /></g>
    <text x={name === 'wombat' ? -10 : 0} y={name === 'butterfly' ? -96 : -78} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900}
      fontSize={64} fill="#fff" stroke={INK} strokeWidth={6} style={{paintOrder: 'stroke'}}
      transform={`translate(0 ${4 * Math.sin(t * 5)}) rotate(${6 * Math.sin(t * 3)}) scale(${qs})`}
      transform-origin={`0 ${name === 'butterfly' ? -96 : -78}`}>?</text>
  </g>
);

// ---------- the guy's head, drawn in code over the library body ----------
type HeadMood = 'proud' | 'think' | 'yum' | 'bleh' | 'wow' | 'dizzy' | 'happy' | 'grin';
const GuyHead: React.FC<{x: number; y: number; mood: HeadMood; t: number; rot?: number; look?: number}> = ({x, y, mood, t, rot = 0, look = 0}) => {
  const R = HEAD_R;
  const blink = (mood === 'proud' || mood === 'think' || mood === 'happy') && (t % 2.9) > 2.8;
  const eye = (sd: number) => {
    const ex = sd * 22, ey = -8;
    if (mood === 'dizzy') return <path key={sd} d={`M ${ex} ${ey} m -6 0 a 6 6 0 1 1 6 6 a 10 10 0 1 1 -10 -10`} transform={`rotate(${t * 900} ${ex} ${ey})`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    if (mood === 'yum') return <path key={sd} d={`M ${ex - 10} ${ey + 2} Q ${ex} ${ey - 10} ${ex + 10} ${ey + 2}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'bleh') return <path key={sd} d={`M ${ex - 9 * sd} ${ey - 9} L ${ex + 7 * sd} ${ey} L ${ex - 9 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (blink) return <path key={sd} d={`M ${ex - 9} ${ey} H ${ex + 9}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />;
    const big = mood === 'wow' ? 1.25 : 1;
    const lx = look * 4, ly = mood === 'think' ? -5 : 0;
    return <g key={sd}><ellipse cx={ex + lx} cy={ey + ly} rx={8 * big} ry={11 * big} fill={INK} /><circle cx={ex + lx - 3} cy={ey + ly - 4} r={2.8 * big} fill="#fff" /></g>;
  };
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <circle r={R + 1} fill="url(#rFace)" stroke={INK} strokeWidth={6.5} />
      {mood === 'bleh' ? <circle r={R - 4} fill="#9BD47A" opacity={0.35} /> : null}
      {mood === 'yum' || mood === 'happy' || mood === 'grin' ? <><circle cx={-36} cy={16} r={11} fill="#F6B3BE" opacity={0.7} /><circle cx={36} cy={16} r={11} fill="#F6B3BE" opacity={0.7} /></> : null}
      {eye(-1)}{eye(1)}
      {mood === 'think' ? <path d="M -30 -32 Q -20 -38 -10 -33 M 12 -36 Q 22 -40 32 -34" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
      <g transform="translate(0 24)">
        {mood === 'proud' ? <path d="M -18 -3 Q 0 10 18 -3" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'grin' ? <path d="M -22 -6 Q 0 14 22 -6 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
        {mood === 'think' ? <path d="M -10 2 H 12" stroke={INK} strokeWidth={5.5} strokeLinecap="round" /> : null}
        {mood === 'happy' ? <path d="M -20 -4 Q 0 18 20 -4 Z" fill="#E4677A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
        {mood === 'wow' ? <ellipse cx={0} cy={4} rx={10} ry={13} fill="#5A2328" stroke={INK} strokeWidth={5} /> : null}
        {mood === 'dizzy' ? <path d="M -16 2 Q -8 -6 0 2 Q 8 10 16 2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'yum' ? <><path d="M -18 -4 Q 0 12 18 -4" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />
          <path d={`M ${2 + 6 * Math.sin(t * 14)} 2 q 6 12 14 2`} fill="#F27C93" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></> : null}
        {mood === 'bleh' ? <><path d="M -16 -2 Q 0 -8 16 -2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          <path d="M -6 -3 Q -8 20 2 20 Q 12 20 8 -3 Z" fill="#F27C93" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></> : null}
      </g>
    </g></W>
  );
};
const headOf = (pose: Pose) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s, hy: (m.head[1] - m.feet[1]) * s};
};
const HEAD = headOf('front_calm');

// ---------- riddle 1: X-ray lens on his chest (three hearts, blue blood) ----------
const LENS = {x: GX, y: -112, r: 60};
const beatAt = (t: number, ph = 0) => { const u = ((t + ph) % 0.7) / 0.7; return Math.max(0, Math.sin(u * Math.PI * 2.4)) * (u < 0.42 ? 1 : 0); };
const Heart: React.FC<{x: number; y: number; s: number; b: number}> = ({x, y, s, b}) => (
  <g transform={`translate(${x} ${y}) scale(${s * (1 + 0.18 * b)})`}>
    <path d="M 0 14 C -26 -2 -22 -26 -7 -24 C 0 -23 0 -17 0 -15 C 0 -17 0 -23 7 -24 C 22 -26 26 -2 0 14 Z" fill="#E8505B" stroke="#FFC2C7" strokeWidth={2.8} strokeLinejoin="round" />
  </g>
);
const XLens: React.FC<{t: number}> = ({t}) => {
  const {x, y, r} = LENS;
  const b0 = beatAt(t), b1 = beatAt(t, 0.12);
  const flow = -t * 60;
  const vessels = ['M -40 30 Q -20 0 -16 -14', 'M 40 30 Q 20 0 16 -14', 'M 0 18 Q -10 40 -30 52', 'M 0 18 Q 10 40 30 52', 'M -16 -14 Q 0 -40 16 -14', 'M 0 -2 V -50'];
  return (
    <W><g transform={`translate(${x} ${y})`}>
      <clipPath id="lensc"><circle r={r} /></clipPath>
      <circle r={r + 7} fill={INK} />
      <g clipPath="url(#lensc)">
        <rect x={-r} y={-r} width={r * 2} height={r * 2} fill="#16223A" />
        {Array.from({length: 7}, (_, i) => <path key={i} d={`M ${-r + i * 20} ${-r} V ${r} M ${-r} ${-r + i * 20} H ${r}`} stroke="#2A3A5C" strokeWidth={1.6} />)}
        {/* ribs */}
        {[-30, -12, 6, 24].map((yy) => <path key={yy} d={`M -60 ${yy + 10} Q 0 ${yy - 12} 60 ${yy + 10}`} stroke="#EAF4FF" strokeOpacity={0.35} strokeWidth={4} fill="none" />)}
        {/* blue blood flowing */}
        {vessels.map((d, i) => <g key={i}><path d={d} stroke="#1E4FA8" strokeWidth={7} fill="none" strokeLinecap="round" />
          <path d={d} stroke="#6FB6FF" strokeWidth={4} fill="none" strokeLinecap="round" strokeDasharray="6 10" strokeDashoffset={flow} /></g>)}
        {/* one main heart + two smaller ones (octopus anatomy: one for the body, two for the gills) */}
        <Heart x={0} y={8} s={1.05} b={b0} />
        <Heart x={-26} y={-12} s={0.62} b={b1} />
        <Heart x={26} y={-12} s={0.62} b={b1} />
        <rect x={-r} y={((t * 90) % (r * 2)) - r} width={r * 2} height={4} fill="#9FD3FF" opacity={0.25} />
      </g>
      <circle r={r} fill="none" stroke={BLUEB} strokeWidth={8} />
      <g transform={`translate(0 ${-r - 2})`}>
        <rect x={-30} y={-12} width={60} height={22} rx={8} fill="#fff" stroke={INK} strokeWidth={4} />
        <text x={0} y={4} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={15} fill={INK}>X-RAY</text>
      </g>
    </g></W>
  );
};

// ---------- riddle 2: spaghetti plate + mud ----------
const Plate: React.FC<{x: number; front: boolean; t: number}> = ({x, front, t}) => (
  <W><g transform={`translate(${x} 4)`}>
    {front ? <>
      {/* noodles over his shoes */}
      {Array.from({length: 9}, (_, i) => {
        const a = -48 + i * 12, w = 3 * Math.sin(t * 6 + i);
        return <path key={i} d={`M ${a} 0 Q ${a + 10 + w} -22 ${a + 22} -6 Q ${a + 30} -26 ${a + 40 + w} 2`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />;
      })}
      {Array.from({length: 9}, (_, i) => {
        const a = -48 + i * 12, w = 3 * Math.sin(t * 6 + i);
        return <path key={'f' + i} d={`M ${a} 0 Q ${a + 10 + w} -22 ${a + 22} -6 Q ${a + 30} -26 ${a + 40 + w} 2`} stroke="#F4D06F" strokeWidth={4} fill="none" strokeLinecap="round" />;
      })}
      <circle cx={-34} cy={-10} r={10} fill="#8C3B2A" stroke={INK} strokeWidth={4} />
      <circle cx={30} cy={-8} r={9} fill="#8C3B2A" stroke={INK} strokeWidth={4} />
      <path d="M -20 -4 q 8 -10 18 -2 q 8 -8 16 0" fill="#D9473F" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      {/* front rim of the plate */}
      <path d="M -82 0 Q 0 30 82 0 Q 0 18 -82 0 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </> : <ellipse cx={0} cy={0} rx={82} ry={18} fill="#fff" stroke={INK} strokeWidth={5} />}
  </g></W>
);
const MUDX = GX - 60;
const Mud: React.FC<{s: number}> = ({s}) => s > 0.01 ? (
  <W><g transform={`translate(${MUDX} 6) scale(${s})`}>
    <path d="M -70 0 Q -74 -14 -40 -14 Q -20 -22 10 -15 Q 50 -20 70 -6 Q 76 10 40 12 Q 0 18 -40 12 Q -70 10 -70 0 Z" fill="#6B4A2E" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={-30} cy={-4} rx={12} ry={3.5} fill="#8E6A48" />
  </g></W>
) : null;

// ---------- riddle 3: cubes ----------
const STACK = [{x: GX - 92, y: -17}, {x: GX - 92 + 36, y: -17}, {x: GX - 92 + 18, y: -53}];
const CUBE_T = [19.45, 19.85, 20.25];
const cubeAt = (t: number, i: number) => {   // from behind his back (hidden), arcs out to the stack
  const t0 = CUBE_T[i], u = seg(t, t0, t0 + 0.32);
  if (t < t0) return null;
  const sx = GX - 20, sy = -80, {x, y} = STACK[i];
  const yy = lerp(sy, y, u) - 70 * Math.sin(Math.PI * u);
  const land = t > t0 + 0.32 ? spring(t, t0 + 0.32, 0.12, 3, 8) : 0;
  return {x: lerp(sx, x, u), y: yy, rot: (1 - u) * -200, sq: land, u};
};
const HEADCUBE_T = 23.1;
const headCubeAt = (t: number) => {          // the 4th cube: up out of sight, then down onto his head (BOING)
  if (t < HEADCUBE_T) return null;
  const top = {x: GX + HEAD.hx, y: HEAD.hy - HEAD_R - 14};
  const u = seg(t, HEADCUBE_T, HEADCUBE_T + 0.24);
  if (u < 1) return {x: lerp(GX - 20, top.x, u), y: lerp(-80, top.y, u) - 160 * Math.sin(Math.PI * u * 0.92), rot: (1 - u) * 300};
  return {x: top.x, y: top.y + 6 * Math.exp(-6 * (t - HEADCUBE_T - 0.24)) * Math.sin((t - HEADCUBE_T) * 30), rot: 0};
};

// ---------- extra world props for the answers ----------
const LeafPot: React.FC<{t: number}> = ({t}) => (
  <W><g transform={`translate(${AX} ${-PED - 10})`}>
    <path d="M -26 0 L -30 -40 H 30 L 26 0 Z" fill="#D9774A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 0 -40 Q -4 -90 6 -120" stroke="#4F8A3F" strokeWidth={8} fill="none" strokeLinecap="round" />
    <g transform={`rotate(${3 * Math.sin(t * 1.7)} 0 -40)`}>
      <path d="M 2 -80 Q -60 -90 -70 -60 Q -30 -50 2 -80 Z" fill="#7DC25A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 6 -118 Q 50 -150 84 -126 Q 50 -96 6 -118 Z" fill="#7DC25A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 10 -118 Q 46 -126 76 -126" stroke="#4F8A3F" strokeWidth={3} fill="none" />
    </g>
  </g></W>
);
const LEAF_TOP = {x: AX + 48, y: -PED - 10 - 128};
const ROCKX = AX + 118;
const Rock: React.FC<{t: number}> = ({t}) => (
  <W><g transform={`translate(${ROCKX} 0)`}>
    <path d="M -64 6 Q -70 -40 -36 -62 Q 0 -78 36 -62 Q 70 -40 64 6 Z" fill="#B9B4A8" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -30 -40 Q -16 -48 -2 -42" stroke="#8D877B" strokeWidth={5} fill="none" strokeLinecap="round" />
    {[0, 1, 2].map((i) => { const at = T.rocks + 0.08 + i * 0.25, s = popIn(t, at, 0.25); return s > 0.01 ? <Cube key={i} x={-22 + i * 24} y={-82} s={0.75 * s} /> : null; })}
  </g></W>
);

// ---------- screen-space pieces ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const RIDDLES = [
  {a: R1, b: R2, lines: ['I have 3 hearts and', 'my blood is blue.']},
  {a: R2, b: R3, lines: ['I taste my food', 'with my feet.']},
  {a: R3, b: CMT, lines: ['My poop comes out', 'shaped like cubes.']},
];
/** the riddle itself on a notebook card in the top band: "RIDDLE 1 OF 3 ... WHAT AM I?" */
const RiddleCard: React.FC<{t: number}> = ({t}) => {
  const i = RIDDLES.findIndex((r) => t >= r.a && t < r.b);
  if (i < 0) return null;
  const r = RIDDLES[i];
  const s = popIn(t, r.a, 0.35) * (1 - seg(t, r.b - 0.18, r.b));
  const q = popIn(t, [T.what1, 14.39, 21.65][i] - 0.05, 0.3);
  return (
    <div style={{position: 'absolute', left: 540, top: 330, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`, width: 900, boxSizing: 'border-box',
      background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 38, boxShadow: `0 10px 0 ${INK}`, padding: '58px 30px 24px', fontFamily: FONT, color: INK, textAlign: 'center'}}>
      <div style={{position: 'absolute', left: '50%', top: -34, transform: 'translateX(-50%) rotate(2deg)', background: GOLD, border: `7px solid ${INK}`, borderRadius: 24,
        padding: '4px 26px', fontWeight: 900, fontSize: 50, whiteSpace: 'nowrap', boxShadow: `0 6px 0 ${INK}`}}>RIDDLE {i + 1} OF 3</div>
      {r.lines.map((l, k) => <div key={k} style={{fontWeight: 900, fontSize: 66, lineHeight: 1.08, letterSpacing: -1}}>{l}</div>)}
      <div style={{fontWeight: 900, fontSize: 70, color: RED, marginTop: 6, transform: `scale(${q})`, height: 80}}>WHAT AM I?</div>
    </div>
  );
};
/** 3-second thinking timer at the bottom after each riddle */
const ThinkTimer: React.FC<{t: number}> = ({t}) => {
  const w = THINK.find(([a, b]) => t >= a && t < b + 0.2);
  if (!w) return null;
  const [a, b] = w;
  const s = popIn(t, a, 0.3) * (1 - seg(t, b, b + 0.2));
  const u = seg(t, a + 0.1, b - 0.1);
  const left = Math.max(1, 3 - Math.floor((t - a - 0.1) / ((b - a - 0.2) / 3)));
  return (
    <div style={{position: 'absolute', left: 540, top: 1540, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s})`, display: 'flex', alignItems: 'center', gap: 22,
      background: '#fff', border: `8px solid ${INK}`, borderRadius: 34, padding: '10px 34px 10px 14px', boxShadow: `0 8px 0 ${INK}`, fontFamily: FONT, fontWeight: 900, color: INK}}>
      <svg width={120} height={120} viewBox="-60 -60 120 120">
        <circle r={50} fill={GOLD} stroke={INK} strokeWidth={8} />
        <circle r={25} fill="none" stroke="#fff" strokeWidth={50} pathLength={1} strokeDasharray={`${u} 1`} transform="rotate(-90)" />
        <circle r={50} fill="none" stroke={INK} strokeWidth={8} />
        <text y={4} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={56} fill={INK}>{left}</text>
      </svg>
      <div style={{fontSize: 64, letterSpacing: -1}}>THINK{'.'.repeat(1 + (Math.floor(t * 3) % 3))}</div>
    </div>
  );
};
const NAMES: {n: AName; label: string; fact: string; at: number}[] = [
  {n: 'octopus', label: 'OCTOPUS', fact: '3 HEARTS', at: T.octopus},
  {n: 'butterfly', label: 'BUTTERFLY', fact: 'TASTES W/ FEET', at: T.butterfly},
  {n: 'wombat', label: 'WOMBAT', fact: 'CUBE POOP', at: T.wombat},
];
const boardS = (t: number) => {
  for (const [a, b] of BOARD_WIN) if (t >= a && t < b) return (a === 0 ? 1 : popIn(t, a, 0.35)) * (1 - seg(t, b - 0.18, b));
  return 0;
};
const Board: React.FC<{t: number}> = ({t}) => {
  const s = boardS(t);
  if (s < 0.01) return null;
  const punch = 1 + NAMES.reduce((a, c) => a + (t > c.at ? spring(t, c.at, 0.04, 3, 7) : 0), 0);
  return (
    <div style={{position: 'absolute', left: 540, top: 905, transform: `translate(-50%,-50%) rotate(-1deg) scale(${s * punch})`, width: 1000, height: 580,
      background: '#FFFDF6', border: `10px solid ${INK}`, borderRadius: 44, boxShadow: `0 12px 0 ${INK}`, fontFamily: FONT, color: INK}}>
      <div style={{position: 'absolute', left: '50%', top: -52, transform: 'translateX(-50%) rotate(-2deg)', background: GOLD, border: `9px solid ${INK}`, borderRadius: 32,
        padding: '6px 34px', fontWeight: 900, fontSize: 78, letterSpacing: -1.5, whiteSpace: 'nowrap', boxShadow: `0 8px 0 ${INK}`}}>3 ANIMAL RIDDLES</div>
      {NAMES.map((c, i) => {
        const fl = seg(t, c.at - 0.12, c.at + 0.12), shown = t >= c.at;
        const sx = Math.abs(Math.cos(Math.PI * fl)) + (fl >= 1 ? spring(t, c.at + 0.12, 0.08, 3, 7) : 0);
        const lab = popIn(t, c.at + 0.1, 0.3);
        return (
          <div key={i} style={{position: 'absolute', left: 30 + i * 320, top: 110, width: 300, height: 440, transform: `scaleX(${Math.max(0.02, sx)})`,
            background: shown ? '#FFF3B0' : '#E3E7F2', border: `8px solid ${INK}`, borderRadius: 30, boxSizing: 'border-box'}}>
            <div style={{position: 'absolute', left: 14, top: 12, width: 58, height: 58, borderRadius: 29, background: GOLD, border: `5px solid ${INK}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 40}}>{i + 1}</div>
            <svg width={284} height={300} viewBox="-120 -215 240 254" style={{position: 'absolute', left: 0, top: 34}}>
              {shown ? <Animal name={c.n} t={t + i} mood="happy" cubes={c.n === 'wombat'} /> : <Mystery name={c.n} t={t + i} cubes={c.n === 'wombat'} />}
            </svg>
            {shown ? <div style={{position: 'absolute', left: '50%', top: 362, transform: `translate(-50%,-50%) scale(${lab})`, textAlign: 'center', whiteSpace: 'nowrap'}}>
              <div style={{fontWeight: 900, fontSize: c.label.length > 7 ? 44 : 50, lineHeight: 1}}>{c.label}</div>
              <div style={{fontWeight: 800, fontSize: 26, marginTop: 6, color: '#6B4A2E'}}>{c.fact}</div>
            </div> : <div style={{position: 'absolute', left: 0, right: 0, top: 336, textAlign: 'center', fontWeight: 900, fontSize: 64, color: '#7C86A2'}}>?</div>}
          </div>
        );
      })}
    </div>
  );
};
/** intro chip, "PUT YOUR ANSWERS IN THE COMMENTS" -> 3, 2, 1 -> (reveal) ... -> "YOUR SCORE ?/3" */
const BoardChips: React.FC<{t: number}> = ({t}) => {
  const intro = t >= T.comment - 0.05 && t < R1 ? popIn(t, T.comment - 0.05, 0.3) * (1 - seg(t, R1 - 0.18, R1)) : 0;
  const cmt = t >= CMT ? popIn(t, CMT + 0.15, 0.35) * (1 - seg(t, T.c3 - 0.15, T.c3)) : 0;
  const nums: [number, string][] = [[T.c3, '3'], [T.c2, '2'], [T.c1, '1']];
  const cur = nums.filter(([a]) => t >= a).pop();
  const numS = cur && t < T.num1 ? popIn(t, cur[0], 0.22) * (1 - seg(t, T.num1 - 0.15, T.num1)) : 0;
  const ring = cur ? seg(t, T.c3, T.num1 - 0.15) : 0;
  const score = t >= END ? popIn(t, END + 0.2, 0.35) : 0;
  const chip = (s: number, lines: string[], color = GOLD) => s > 0.01 ? (
    <div style={{position: 'absolute', left: 640, top: 1420, transform: `translate(-50%,-50%) rotate(2deg) scale(${s * (1 + 0.03 * Math.sin(t * 8))})`,
      background: color, border: `8px solid ${INK}`, borderRadius: 30, boxShadow: `0 8px 0 ${INK}`, padding: '10px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 54,
      textAlign: 'center', lineHeight: 1.05, color: INK, whiteSpace: 'nowrap'}}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div>) : null;
  return (
    <>
      {chip(intro, ['COMMENT WHICH', 'ONES YOU GET RIGHT'])}
      {chip(cmt, ['PUT YOUR ANSWERS', 'IN THE COMMENTS'])}
      {numS > 0.01 ? <div style={{position: 'absolute', left: 660, top: 1420, transform: `translate(-50%,-50%) scale(${numS})`}}>
        <svg width={300} height={300} viewBox="-150 -150 300 300">
          <circle r={128} fill="#fff" stroke={INK} strokeWidth={12} />
          <circle r={108} fill="none" stroke={RED} strokeWidth={18} pathLength={1} strokeDasharray={`${1 - ring} 1`} transform="rotate(-90)" strokeLinecap="round" />
          <text y={8} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={170} fill={INK}>{cur![1]}</text>
        </svg>
      </div> : null}
      {score > 0.01 ? <div style={{position: 'absolute', left: 660, top: 1430, transform: `translate(-50%,-50%) rotate(-2deg) scale(${score})`, background: '#fff', border: `8px solid ${INK}`,
        borderRadius: 30, boxShadow: `0 8px 0 ${INK}`, padding: '8px 30px 12px', fontFamily: FONT, fontWeight: 900, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{fontSize: 40}}>YOUR SCORE</div>
        <div style={{fontSize: 110, lineHeight: 1}}><span style={{display: 'inline-block', color: RED, transform: `rotate(${10 * Math.sin(t * 6)}deg)`}}>?</span>/3</div>
      </div> : null}
    </>
  );
};

// ---------- answer inserts (screen space circles) ----------
const IX = 540, IY = 1400, IR = 260;
const Insert: React.FC<{s: number; title: string; id: string; rot?: number; children: React.ReactNode; extra?: React.ReactNode}> = ({s, title, id, rot = -1.5, children, extra}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: IX, top: IY, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`}}>
    <svg width={680} height={680} viewBox="-340 -340 680 680" style={{overflow: 'visible'}}>
      <clipPath id={id}><circle r={IR} /></clipPath>
      <circle r={IR + 16} fill={INK} />
      <g clipPath={`url(#${id})`}>{children}</g>
      <circle r={IR} fill="none" stroke="#3E6FB0" strokeWidth={18} />
    </svg>
    <Card text={title} top={80} size={46} />
    {extra}
  </div>
) : null;
const Grid: React.FC<{bg?: string; line?: string}> = ({bg = '#16223A', line = '#2A3A5C'}) => (
  <><rect x={-340} y={-340} width={680} height={680} fill={bg} />
    {Array.from({length: 10}, (_, i) => <path key={i} d={`M ${-340 + i * 75} -340 V 340 M -340 ${-340 + i * 75} H 340`} stroke={line} strokeWidth={3} />)}</>
);
const mixHex = (a: string, b: string, u: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], u)).toString(16).padStart(2, '0')).join('');
};
/** octopus X-ray: one heart for the body, two for the gills, copper -> blue blood */
const OctoXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  const bodyOn = seg(t, T.body - 0.1, T.body + 0.3), gillOn = seg(t, T.gills - 0.1, T.gills + 0.3), blue = seg(t, T.copper + 0.2, T.blue2);
  const blood = mixHex('#8A93A6', '#4FA3FF', blue);
  const b0 = beatAt(t), b1 = beatAt(t, 0.15);
  const flow = -t * 120;
  const bodyV = ['M 0 40 Q -60 120 -150 170', 'M 0 40 Q -20 140 -50 200', 'M 0 40 Q 20 140 50 200', 'M 0 40 Q 60 120 150 170'];
  const gillV = ['M -110 -30 Q -150 -40 -175 -10', 'M 110 -30 Q 150 -40 175 -10', 'M -110 -30 Q -60 0 -20 20', 'M 110 -30 Q 60 0 20 20'];
  return (
    <Insert s={s} title="X-RAY: OCTOPUS" id="oxr" extra={<>
      <Card text="BODY" top={590} left={340} color={GOLD} rot={-6} s={popIn(t, T.body, 0.3)} size={46} />
      <Card text="GILLS" top={280} left={110} color="#9FD3FF" rot={-10} s={popIn(t, T.gills, 0.3)} size={44} />
      <Card text="GILLS" top={280} left={570} color="#9FD3FF" rot={10} s={popIn(t, T.gills + 0.08, 0.3)} size={44} />
      <Card text="COPPER = BLUE" top={590} left={340} color="#4FA3FF" fg="#fff" rot={3} s={popIn(t, T.copper, 0.3)} size={50} />
    </>}>
      <Grid />
      {/* mantle + arms outline */}
      <path d="M -150 20 Q -170 -230 0 -240 Q 170 -230 150 20 Q 0 60 -150 20 Z" fill="#EAF4FF" fillOpacity={0.07} stroke="#9FD3FF" strokeWidth={5} strokeDasharray="16 12" />
      {[-160, -90, -30, 30, 90, 160].map((x) => <path key={x} d={`M ${x * 0.5} 40 Q ${x} 140 ${x * 1.3} 330`} stroke="#9FD3FF" strokeWidth={5} strokeDasharray="14 12" fill="none" />)}
      {/* gills */}
      {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 190} -20)`}>
        <ellipse rx={34} ry={60} fill="#9FD3FF" fillOpacity={0.12 + 0.25 * gillOn} stroke="#9FD3FF" strokeWidth={5} />
        {[-36, -12, 12, 36].map((y) => <path key={y} d={`M -26 ${y} H 26`} stroke="#9FD3FF" strokeWidth={3} />)}
      </g>)}
      {[...bodyV.map((d) => ({d, on: bodyOn})), ...gillV.map((d) => ({d, on: gillOn}))].map(({d, on}, i) => <g key={i} opacity={0.3 + 0.7 * on}>
        <path d={d} stroke={mixHex('#3A4A6C', '#1E4FA8', blue)} strokeWidth={16} fill="none" strokeLinecap="round" />
        <path d={d} stroke={blood} strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="12 16" strokeDashoffset={flow} />
      </g>)}
      <g opacity={0.45 + 0.55 * bodyOn}><Heart x={0} y={40} s={2.6} b={b0} /></g>
      <g opacity={0.45 + 0.55 * gillOn}><Heart x={-110} y={-30} s={1.6} b={b1} /><Heart x={110} y={-30} s={1.6} b={b1} /></g>
      {blue > 0.01 ? <g transform={`translate(0 -150) scale(${popIn(t, T.copper, 0.3)})`}>
        <circle r={42} fill="#C87533" stroke="#FFD8B0" strokeWidth={6} />
        <text y={4} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#fff">Cu</text>
      </g> : null}
      <rect x={-340} y={((t * 520) % 680) - 340} width={680} height={14} fill="#9FD3FF" opacity={0.2} />
    </Insert>
  );
};
/** butterfly foot close-up: taste sensors light up, the foot lands on the leaf, taste test */
const FootZoom: React.FC<{t: number; s: number}> = ({t, s}) => {
  const lit = seg(t, T.sensors - 0.1, T.sensors + 0.3);
  const down = eio(seg(t, T.lands - 0.2, T.lands + 0.2));
  const tasted = t > T.lands + 0.15;
  const fy = lerp(-60, 60, down);
  return (
    <Insert s={s} title="ZOOM: BUTTERFLY FOOT" id="fz" rot={1.5} extra={<>
      <Card text="TASTE SENSORS" top={160} left={540} color={GOLD} rot={6} s={popIn(t, T.sensors, 0.3)} size={42} />
      <Card text="TASTE TEST" top={590} left={300} color="#9BD47A" rot={-4} s={pulse(t, T.lands + 0.15, 0.75)} size={50} />
      <Card text="YUM, GOOD LEAF" top={590} left={340} color="#9BD47A" rot={3} s={popIn(t, T.taste2, 0.3)} size={48} />
    </>}>
      <rect x={-340} y={-340} width={680} height={680} fill="#CFEAF6" />
      {/* the leaf */}
      <path d="M -340 150 Q -100 60 340 110 L 340 340 L -340 340 Z" fill="#7DC25A" stroke={INK} strokeWidth={8} />
      <path d="M -340 210 Q 0 150 340 190" stroke="#4F8A3F" strokeWidth={8} fill="none" />
      {[-200, -60, 80, 220].map((x) => <path key={x} d={`M ${x} ${190 - x * 0.05} q 40 30 90 40`} stroke="#4F8A3F" strokeWidth={5} fill="none" />)}
      {/* the leg: segments down to the foot */}
      <g transform={`translate(0 ${fy})`}>
        <path d="M -40 -360 L -10 -150 L 20 30" stroke={INK} strokeWidth={46} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M -40 -360 L -10 -150 L 20 30" stroke="#3A3030" strokeWidth={32} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={-10} cy={-150} r={20} fill="#3A3030" stroke={INK} strokeWidth={6} />
        <path d="M 20 30 L -20 70 M 20 30 L 60 70" stroke={INK} strokeWidth={16} strokeLinecap="round" />
        {/* sensor hairs */}
        {Array.from({length: 7}, (_, i) => { const y = -100 + i * 18, x = -4 + i * 3.6; const on = lit * (0.6 + 0.4 * Math.sin(t * 9 + i));
          return <g key={i}><path d={`M ${x + 12} ${y} l 22 -8`} stroke={on > 0.1 ? GOLD : '#7A7070'} strokeWidth={5} strokeLinecap="round" />
            {on > 0.1 ? <circle cx={x + 36} cy={y - 9} r={6 * on} fill={GOLD} /> : null}</g>; })}
      </g>
      {/* taste sparkles where the foot touches */}
      {tasted ? [0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 + t * 2, r = 80 + 20 * Math.sin(t * 6 + i), sc = 0.9 * popIn(t, T.lands + 0.15 + i * 0.04, 0.25);
        return <path key={'s' + i} transform={`translate(${20 + Math.cos(a) * r} ${110 + Math.sin(a) * r * 0.5}) rotate(${t * 120}) scale(${sc})`} d="M 0 -30 Q 6 -6 30 0 Q 6 6 0 30 Q -6 6 -30 0 Q -6 -6 0 -30 Z" fill="#FFE066" stroke={INK} strokeWidth={5} strokeLinejoin="round" />; }) : null}
    </Insert>
  );
};
/** wombat gut X-ray: a soft blob travels through the gut and comes out a cube */
const GutXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  const u = seg(t, EX3 + 0.15, T.cubes2);
  const path = (v: number) => ({x: lerp(-300, 300, v), y: 40 * Math.sin(v * Math.PI * 3)});
  const p = path(u);
  const sq = eio(seg(t, T.squeezes - 0.2, T.cubes2));
  const out = t > T.cubes2 ? eout(seg(t, T.cubes2, T.cubes2 + 0.4)) : 0;
  const size = 70;
  const tube = Array.from({length: 61}, (_, i) => { const q = path(i / 60); return `${i ? 'L' : 'M'} ${q.x} ${q.y}`; }).join(' ');
  return (
    <Insert s={s} title="X-RAY: WOMBAT GUT" id="gx" extra={<>
      <Card text="SQUEEZE" top={150} left={240} color={GOLD} rot={-8} s={pulse(t, T.squeezes, 1.0)} size={46} />
      <Card text="CUBE" top={590} left={430} color={GOLD} rot={4} s={popIn(t, T.cubes2, 0.3)} size={58} />
    </>}>
      <Grid />
      <path d={tube} stroke="#6B3A2A" strokeOpacity={0.6} strokeWidth={140} fill="none" strokeLinecap="round" />
      {/* stiff + stretchy wall bands */}
      <path d={tube} stroke="#F6A6B8" strokeWidth={150} fill="none" strokeDasharray="60 60" strokeOpacity={0.35} />
      <path d={tube} stroke="#16223A" strokeWidth={100} fill="none" strokeLinecap="round" />
      {/* squeeze arrows on the blob */}
      {t > T.squeezes - 0.1 && t < T.cubes2 ? [0, 90, 180, 270].map((a) => <path key={a} transform={`translate(${p.x} ${p.y}) rotate(${a}) translate(0 ${-78 - 6 * Math.sin(t * 14)})`} d="M -14 -16 L 0 2 L 14 -16" stroke={GOLD} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />) : null}
      {out < 0.01 ? <rect x={p.x - size / 2} y={p.y - size / 2} width={size} height={size} rx={lerp(size / 2, 6, sq)} fill="#8A5E3B" stroke="#E8C9A8" strokeWidth={6} /> : null}
      {out > 0.01 ? <g transform={`translate(${lerp(300, 200, out)} ${lerp(0, 180, out)}) rotate(${out * -90})`}>
        <rect x={-size / 2} y={-size / 2} width={size} height={size} rx={6} fill="#8A5E3B" stroke="#E8C9A8" strokeWidth={6} />
      </g> : null}
      <rect x={-340} y={((t * 520) % 680) - 340} width={680} height={14} fill="#9FD3FF" opacity={0.2} />
    </Insert>
  );
};

// ---------- the story over time ----------
const inThink = (t: number) => THINK.some(([a, b]) => t >= a && t < b);
const moodAt = (t: number): HeadMood => {
  if (t < R1) return 'think';
  if (t < R2) return t < T.what1 ? 'proud' : 'think';
  if (t < R3) {
    if (t < T.taste) return 'proud';
    if (t < 15.6) return 'yum';
    if (t < 15.9) return 'wow';
    if (t < 17.0) return 'bleh';
    return 'think';
  }
  if (t < CMT) {
    if (t < T.poop) return 'proud';
    if (t < T.cubes) return 'wow';
    if (t < 22.4) return 'grin';
    if (t < HEADCUBE_T + 0.24) return 'think';
    return 'dizzy';
  }
  if (t < T.num1) return 'think';
  if (t < EX1) return 'wow';
  if (t < T.num2) return t < T.blue2 ? 'wow' : 'happy';
  if (t < EX2) return 'wow';
  if (t < T.num3) return t < T.taste2 ? 'wow' : 'happy';
  if (t < EX3) return 'wow';
  if (t < END) return t < T.cubes2 ? 'wow' : 'grin';
  return 'happy';
};
const HOP = 15.7;
const guyPos = (t: number) => {
  if (t >= R2 && t < R3) {                     // the hop off the plate into the mud
    const u = seg(t, HOP, HOP + 0.2);
    const x = lerp(GX, MUDX, eio(u)), y = -40 * Math.sin(Math.PI * u);
    const land = t > HOP + 0.2 ? spring(t, HOP + 0.2, 0.08, 3, 7) : 0;
    const pre = t < HOP ? seg(t, HOP - 0.1, HOP) : 0;
    return {x, y, sx: 1 + land * 0.6 + 0.04 * pre, sy: 1 - land - 0.06 * pre};
  }
  return {x: GX, y: 0, sx: 1, sy: 1};
};
const BCAM = {x: 60, y: -390, k: 2.3};

export const RiddlesScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, ...BCAM}, {t: R1 - 0.02, ...BCAM, k: 2.36},                                       // intro: the board
    {t: R1, x: 8, y: -150, k: 3.1}, {t: 5.9, x: 10, y: -150, k: 3.25},                       // riddle 1: him + lens + silhouette
    {t: 5.93, x: GX + 5, y: -125, k: 3.55}, {t: 7.35, x: GX + 5, y: -122, k: 3.7},            // the lens close
    {t: 7.38, x: AX - 10, y: -120, k: 3.5}, {t: 7.95, x: AX - 10, y: -120, k: 3.6},          // "what am I?" - the silhouette
    {t: 7.98, x: 5, y: -140, k: 2.9}, {t: R2 - 0.02, x: 5, y: -140, k: 3.1},                 // think
    {t: R2, x: 0, y: -125, k: 2.75}, {t: 13.7, x: -10, y: -118, k: 2.95},                    // riddle 2: spaghetti
    {t: 13.72, x: GX, y: -70, k: 3.5}, {t: 14.9, x: GX, y: -72, k: 3.65},                     // the feet
    {t: 14.94, x: -30, y: -125, k: 2.8}, {t: R3 - 0.02, x: -30, y: -125, k: 3.0},            // think (+ mud hop)
    {t: R3, x: -20, y: -135, k: 2.7}, {t: 20.8, x: -24, y: -138, k: 2.9},                    // riddle 3: cubes
    {t: 20.82, x: GX - 55, y: -70, k: 3.45}, {t: 22.22, x: GX - 55, y: -72, k: 3.6},          // the stack
    {t: 22.26, x: -20, y: -150, k: 2.7}, {t: CMT - 0.02, x: -20, y: -150, k: 2.9},           // think (+ head cube)
    {t: CMT, ...BCAM}, {t: EX1 - 0.02, ...BCAM, k: 2.36},                                     // board: comment, countdown, octopus
    {t: EX1, x: 8, y: -75, k: 2.5}, {t: T.num2 - 0.04, x: 8, y: -80, k: 2.65},                // octopus explained
    {t: T.num2 - 0.02, ...BCAM}, {t: EX2 - 0.02, ...BCAM, k: 2.34},
    {t: EX2, x: 8, y: -75, k: 2.5}, {t: T.num3 - 0.07, x: 8, y: -80, k: 2.65},                // butterfly explained
    {t: T.num3 - 0.05, ...BCAM}, {t: EX3 - 0.02, ...BCAM, k: 2.34},
    {t: EX3, x: 8, y: -75, k: 2.5}, {t: ROCK - 0.02, x: 8, y: -78, k: 2.6},                   // wombat gut
    {t: ROCK, x: AX + 55, y: -95, k: 3.0}, {t: END - 0.02, x: AX + 55, y: -95, k: 3.15},     // cubes on the rock
    {t: END, ...BCAM}, {t: DURATION, ...BCAM, k: 2.36},                                       // = frame 0
  ], t);
  const sh = shake(t, hit(t, 0, 6, 7) + hit(t, HEADCUBE_T + 0.24, 7, 6) + hit(t, HOP + 0.2, 4, 7) + hit(t, R1, 4, 8));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyPos(t);
  const mood = moodAt(t);
  const dizzy = mood === 'dizzy';
  const hRot = dizzy ? 6 * Math.sin((t - HEADCUBE_T) * 9) : mood === 'yum' ? 4 * Math.sin(t * 7) : 0;
  const headX = g.x + HEAD.hx, headY = g.y + HEAD.hy * g.sy;
  const riddle: AName | null = t >= R1 && t < R2 ? 'octopus' : t >= R2 && t < R3 ? 'butterfly' : t >= R3 && t < CMT ? 'wombat' : null;
  const answer: AName | null = t >= EX1 && t < T.num2 - 0.02 ? 'octopus' : t >= EX2 && t < T.num3 - 0.05 ? 'butterfly' : t >= EX3 && t < ROCK ? 'wombat' : null;
  const rock = t >= ROCK && t < END;
  const r1 = t >= R1 && t < R2, r2 = t >= R2 && t < R3, r3 = t >= R3 && t < CMT;
  const ped = riddle || answer;
  const qs = 1 + (t > T.what1 && r1 ? spring(t, T.what1, 0.35, 3, 6) : 0) + (inThink(t) ? 0.08 * Math.sin(t * 8) : 0);
  const hc = r3 ? headCubeAt(t) : null;
  // butterfly in its answer shot: hovers, then lands on the leaf on "lands"
  const land = eio(seg(t, T.lands - 0.35, T.lands + 0.1));
  const bfly = {x: lerp(AX - 10, LEAF_TOP.x, land), y: lerp(-PED - 150, LEAF_TOP.y + 18, land) + (1 - land) * 10 * Math.sin(t * 3)};
  const thinkQ = inThink(t);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#FBF7EC'}}>
      <Defs />
      <Layer cam={cam} z={1700}><Stage t={t} /></Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Floor />
        <Shadow x={g.x} w={150} />
        {ped ? <Shadow x={AX} w={140} /> : null}
        {rock ? <><Shadow x={AX} w={150} /><Shadow x={ROCKX} w={140} /></> : null}
        {r2 ? <Mud s={1} /> : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        {ped ? <Pedestal t={t} /> : null}
        {riddle ? <W><g transform={`translate(${AX} ${-PED - 10}) scale(${riddle === 'wombat' ? 0.95 : 0.9})`}><Mystery name={riddle} t={t} qs={qs} cubes={riddle === 'wombat' && t > 20.3} /></g></W> : null}
        {answer === 'octopus' ? <W><g transform={`translate(${AX} ${-PED - 10}) scale(0.95)`}><Octopus t={t} mood={t > T.blue2 ? 'happy' : 'smug'} /></g></W> : null}
        {answer === 'butterfly' ? <><LeafPot t={t} /><W><g transform={`translate(${bfly.x} ${bfly.y + 130}) scale(0.8)`}><Butterfly t={land > 0.99 ? t * 0.3 : t} mood={t > T.taste2 ? 'happy' : 'smug'} /></g></W></> : null}
        {answer === 'wombat' ? <W><g transform={`translate(${AX} ${-PED - 10}) scale(0.95)`}><Wombat t={t} mood={t > T.cubes2 ? 'happy' : 'smug'} /></g></W> : null}
        {rock ? <><Rock t={t} /><W><g transform={`translate(${AX} 0)`}><Wombat t={t} mood="happy" /></g></W></> : null}
        {r2 ? <Plate x={GX} front={false} t={t} /> : null}
        {r3 ? <W>{[0, 1, 2].map((i) => { const c = cubeAt(t, i); return c ? <g key={i} transform={`translate(0 ${c.sq * 10})`}><Cube x={c.x} y={c.y} rot={c.rot} s={1 + c.sq} /></g> : null; })}</W> : null}
        <Guy pose="front_calm" x={g.x} y={g.y} t={t} sx={g.sx} sy={g.sy} rot={hRot * 0.3} />
        <GuyHead x={headX} y={headY} mood={mood} t={t} rot={hRot} look={r2 ? 0 : 0.6} />
        {r2 ? <Plate x={GX} front t={t} /> : null}
        {hc ? <W><Cube x={hc.x} y={hc.y} rot={hc.rot} s={0.95} /></W> : null}
        {r1 ? <XLens t={t} /> : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        <Txt x={GX} y={-22} s={r1 ? popIn(t, R1, 0.3) * (1 - seg(t, T.blue - 0.1, T.blue + 0.1)) : 0} text="3 HEARTS" size={30} rot={-6} fill={GOLD} />
        <Txt x={GX + 4} y={-22} s={r1 && t > T.blue - 0.1 ? popIn(t, T.blue - 0.05, 0.3) * (1 - seg(t, 7.9, 8.1)) : 0} text="BLUE BLOOD" size={28} rot={5} fill="#8FC3FF" />
        <Txt x={AX + 12} y={-210} s={r1 ? pulse(t, T.what1, 0.5) : 0} text="WHO?" size={34} rot={8} fill={GOLD} />
        <Txt x={GX + 70} y={-260} s={pulse(t, T.taste + 0.05, 0.9)} text="YUM" size={36} rot={10} fill={GOLD} />
        {[-1, 1].map((sd) => <Arrow key={sd} x={GX + sd * 62} y={-50} s={pulse(t, T.feet - 0.05, 0.9) * 0.45} rot={sd * 40} color={GOLD} />)}
        <Txt x={GX + 2} y={-118} s={pulse(t, T.feet - 0.05, 0.9)} text="FEET TASTE" size={28} rot={-5} fill={GOLD} />
        <Txt x={MUDX + 20} y={-275} s={r2 ? pulse(t, HOP + 0.2, 0.8) : 0} text="BLEH" size={38} rot={-8} fill="#9BD47A" />
        <Txt x={MUDX + 30} y={-28} s={r2 ? pulse(t, HOP + 0.3, 0.7) : 0} text="MUD" size={26} rot={6} fill="#C99B6B" />
        {CUBE_T.map((c, i) => <Txt key={i} x={STACK[i].x - 6} y={STACK[i].y - 46 - i * 6} s={r3 ? pulse(t, c + 0.3, 0.3) : 0} text="PLOP" size={24} rot={i % 2 ? 8 : -8} fill={GOLD} />)}
        <Txt x={GX - 74} y={-120} s={r3 ? pulse(t, T.cubes, 1.0) : 0} text="CUBES" size={34} rot={-6} fill={GOLD} />
        <Txt x={headX + 78} y={headY - 70} s={r3 ? pulse(t, HEADCUBE_T + 0.24, 0.5) : 0} text="BOING" size={32} rot={10} fill={GOLD} />
        <Txt x={ROCKX} y={-150} s={rock ? popIn(t, T.turf - 0.1, 0.3) : 0} text="MY TURF" size={30} rot={-6} fill={GOLD} />
        {/* "?" floating around his head while thinking */}
        {thinkQ && !thumb ? [0, 1, 2].map((i) => { const a = t * 1.6 + i * 2.1; return <Txt key={i} x={headX + Math.cos(a) * 95} y={headY - 40 + Math.sin(a) * 50} s={0.8 + 0.15 * Math.sin(t * 5 + i)} text="?" size={36} rot={10 * Math.sin(t * 3 + i)} fill={GOLD} />; }) : null}
        {dizzy && t < CMT + 0.1 ? [0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={headX + Math.cos(a) * 80} y={headY - 100 + Math.sin(a) * 14} s={0.5} rot={t * 200} />;
        }) : null}
      </Layer>
      {thumb ? null : <><RiddleCard t={t} /><ThinkTimer t={t} /></>}
      <Board t={t} />
      <BoardChips t={t} />
      <OctoXRay t={t} s={t >= EX1 && t < T.num2 ? popIn(t, EX1 + 0.05, 0.35) * (1 - seg(t, T.num2 - 0.22, T.num2 - 0.04)) : 0} />
      <FootZoom t={t} s={t >= EX2 && t < T.num3 ? popIn(t, EX2 + 0.05, 0.35) * (1 - seg(t, T.num3 - 0.25, T.num3 - 0.07)) : 0} />
      <GutXRay t={t} s={t >= EX3 && t < ROCK ? popIn(t, EX3 + 0.05, 0.35) * (1 - seg(t, ROCK - 0.2, ROCK - 0.02)) : 0} />
      {thumb ? null : <>
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.how - 0.05} until={DURATION - LOOP_DUR - 0.15} text="Which ones did you get right?" sub="Comment your score: 0, 1, 2 or 3" />
      </>}
    </AbsoluteFill>
  );
};

export const RiddlesVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const beats: Cue[] = [];
  for (let b = R1; b < 8.0; b += 0.7) beats.push({f: 'pop.wav', at: b, db: -26}, {f: 'pop.wav', at: b + 0.17, db: -30});
  const ticks: Cue[] = THINK.flatMap(([a, b]): Cue[] => [0, 1, 2].map((i) => ({f: i % 2 ? 'tick2.wav' : 'tick.wav', at: a + 0.1 + i * (b - a - 0.2) / 3, db: -20}))
    .concat([{f: 'pop.wav', at: a, db: -24}, {f: 'ding.mp3', at: b - 0.05, db: -26}]));
  const cues: Cue[] = [
    {f: 'whoosh.wav', at: 0, db: -16}, {f: 'pop.wav', at: 0, db: -10}, {f: 'confetti.wav', at: 0.02, db: -22}, {f: 'pop.wav', at: T.comment - 0.05, db: -22},
    {f: 'whoosh.wav', at: R1 - 0.04, db: -22}, {f: 'pop.wav', at: R1, db: -18}, ...beats, {f: 'zap.wav', at: R1, db: -30, to: 0.4},
    {f: 'whoosh.wav', at: 5.9, db: -28}, {f: 'whoosh.wav', at: T.what1 - 0.04, db: -28}, {f: 'twang.mp3', at: T.what1 + 0.02, db: -28, to: 0.4},
    ...ticks,
    {f: 'whoosh.wav', at: R2 - 0.04, db: -22}, {f: 'pop.wav', at: R2, db: -20},
    {f: 'bubbles.wav', at: T.taste, db: -24, to: 0.6}, {f: 'gulp.wav', at: 12.94, db: -24},
    {f: 'whoosh.wav', at: 13.7, db: -28}, {f: 'pop.wav', at: T.feet - 0.05, db: -22},
    {f: 'whoosh.wav', at: HOP - 0.05, db: -26}, {f: 'splash.wav', at: HOP + 0.18, db: -16}, {f: 'giggle.mp3', at: HOP + 0.3, db: -30, to: 0.8},
    {f: 'whoosh.wav', at: R3 - 0.04, db: -22}, {f: 'pop.wav', at: R3, db: -20},
    ...CUBE_T.flatMap((c): Cue[] => [{f: 'pop.wav', at: c, db: -20}, {f: 'squeak.wav', at: c + 0.3, db: -22}]),
    {f: 'whoosh.wav', at: 20.8, db: -28},
    {f: 'whoosh.wav', at: HEADCUBE_T, db: -24}, {f: 'twang.mp3', at: HEADCUBE_T + 0.24, db: -13, to: 0.6}, {f: 'crowd_laugh.wav', at: HEADCUBE_T + 0.3, db: -28, to: 1.2},
    {f: 'whoosh.wav', at: CMT - 0.04, db: -22}, {f: 'pop.wav', at: CMT + 0.05, db: -20}, {f: 'pop.wav', at: CMT + 0.15, db: -24},
    {f: 'tick.wav', at: T.c3, db: -16}, {f: 'tick2.wav', at: T.c2, db: -15}, {f: 'tick.wav', at: T.c1, db: -14},
    ...[T.c3, T.c2, T.c1].map((c): Cue => ({f: 'tick2.wav', at: c + 0.37, db: -26})),
    ...NAMES.flatMap((c): Cue[] => [{f: 'whoosh.wav', at: c.at - 0.14, db: -28}, {f: 'ding.mp3', at: c.at, db: -19}, {f: 'confetti.wav', at: c.at + 0.02, db: -26}]),
    {f: 'whoosh.wav', at: T.num2 - 0.06, db: -26}, {f: 'whoosh.wav', at: T.num3 - 0.08, db: -26},
    // answer shots
    {f: 'whoosh.wav', at: EX1 - 0.04, db: -24}, {f: 'zap.wav', at: EX1 + 0.05, db: -28}, {f: 'pop.wav', at: T.body, db: -22}, {f: 'pop.wav', at: T.gills, db: -22}, {f: 'pop.wav', at: T.gills + 0.08, db: -24},
    {f: 'ding.mp3', at: T.copper, db: -24}, {f: 'bubbles.wav', at: T.blue2 - 0.6, db: -28, to: 0.6},
    {f: 'whoosh.wav', at: EX2 - 0.04, db: -24}, {f: 'pop.wav', at: EX2 + 0.05, db: -24}, ...ctaCues(T.cta), {f: 'pop.wav', at: T.sensors, db: -22},
    {f: 'squeak.wav', at: T.lands, db: -24}, {f: 'chirp.wav', at: T.lands + 0.15, db: -28, to: 0.6}, {f: 'gulp.wav', at: T.taste2, db: -26},
    {f: 'whoosh.wav', at: EX3 - 0.04, db: -24}, {f: 'zap.wav', at: EX3 + 0.05, db: -28}, {f: 'strain.mp3', at: T.squeezes, db: -26, to: 1.0}, {f: 'pop.wav', at: T.cubes2, db: -16},
    {f: 'whoosh.wav', at: ROCK - 0.04, db: -26}, ...[0, 1, 2].map((i): Cue => ({f: 'pop.wav', at: T.rocks + 0.08 + i * 0.25, db: -22})), {f: 'ding.mp3', at: T.turf - 0.1, db: -26},
    {f: 'whoosh.wav', at: END - 0.04, db: -24}, {f: 'pop.wav', at: END + 0.2, db: -22},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -24},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<RiddlesScene t={0} />}>
        <RiddlesScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="riddles/vo/final-trim.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const RiddlesWide: React.FC = () => <WideFit.Provider value={0.72}><RiddlesVideo /></WideFit.Provider>;
