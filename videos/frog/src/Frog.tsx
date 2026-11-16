// "What if you had a frog's eyes?" - owl formula (CLAUDE.md, Growth), niche: animal powers. What the owl did and this
// copies: (1) the power is ON HIM at frame 0 and readable at a glance - big bulging frog eyes on his round head, caught
// mid-gulp (half sunk into his head), (2) the co-star (a smug frog on a rock) does the same trick with ease beside him,
// (3) two X-rays - the frog's secret (its eyes drop into its mouth and PUSH the bug down; GULPS PER BUG 2.3 vs 4), then
// YOUR body breaking (press your eyes in -> the nerve to your heart lights up, the heart monitor slows: DANGER),
// (4) two live counters (a stopwatch to 0.07 s on the tongue, the slowing heart monitor) + a versus chip,
// (5) a running little character (the fly) that drives the action and comes back for the loop, (6) the comedy hit is
// made by the power itself (his own tongue THWIP -> eyes sink -> BOING back up spinning, dizzy, crowd laugh), (7) short
// lines with one fact each, a sticker word every ~1.5 s and a cut every 2-3 s, (8) his dumb-but-funny fix (he only
// drinks smoothies through a giant straw) runs into frame 0: a fly slides up the straw, GULP, eyes sink, (9) the comment
// bubble opener + the either/or comment ask. Everything drawn in code; the guy's body is the library sprite.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, backOut, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, pen} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.1; times below are video time). Last word ends ~18.1 s; + 0.85 s for the push.
export const DURATION = 18.95;
export const T = {
  eyes: 0.90, swallow: 1.81, eyeballs: 2.57,                              // "Get a frog's eyes, and you'd swallow with your eyeballs."
  tongue: 3.70, fly: 4.57, tenth: 5.41, second: 5.92,                     // "Its tongue grabs a fly in under a tenth of a second."
  then: 6.61, sink: 7.85, mouth: 8.65, push: 9.12, down: 9.66,            // "Then its eyes sink into its mouth to push the bug down."
  press: 10.30, eyes2: 10.74, heart: 12.01, slows: 12.30, down2: 12.59,   // "Press your eyes in like that, and your heart slows down."
  so: 13.17, drinks: 14.01, smoothies: 14.37,                             // "So he only drinks smoothies."
  bat: 15.30, nose: 16.61, comment: 17.39,                                // "Bat ears or a shark's nose? Comment below."
  cta: 12.6,
};

const GOLD = '#FFD43B', RED = '#E2453C', IRIS = '#F2C23A', IRIS2 = '#D8902A';
const FROG = '#6CC24A', FROG2 = '#4E9A35', FROG_L = '#D9F0A8', PINK = '#F27C93', PINK2 = '#D9566F';
const GX = -150;                 // guy's feet
const FX = 112, FY = -100;       // frog's seat on top of the rock
const FS = 0.85;                 // frog scale
const CUPX = -22;                // the giant smoothie cup (ground)

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
/** eyes sink: down fast at t0 (0.12 s) to depth, hold, then pop back up with an overshoot (BOING) */
const sinkPulse = (t: number, t0: number, depth: number, hold: number) => {
  if (t < t0) return 0;
  if (t < t0 + 0.12) return depth * eout(seg(t, t0, t0 + 0.12));
  if (t < t0 + 0.12 + hold) return depth;
  return depth * (1 - backOut(seg(t, t0 + 0.12 + hold, t0 + 0.42 + hold)));
};
/** tongue out and back: out in 0.06 s, back in 0.12 s */
const tongueAt = (t: number, t0: number) => t < t0 || t > t0 + 0.2 ? 0 : t < t0 + 0.06 ? eout(seg(t, t0, t0 + 0.06)) : 1 - eio(seg(t, t0 + 0.08, t0 + 0.2));
const sinkStart = (t: number) => 0.4 * (1 - backOut(seg(t, 0.1, 0.38)));   // frame 0: both mid-gulp, eyes pop up by 0.38 s

const Defs: React.FC = () => (
  <W><defs>
    <linearGradient id="fSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9AD3EE" /><stop offset="0.6" stopColor="#CBEAF4" /><stop offset="1" stopColor="#EEF6DA" /></linearGradient>
    <linearGradient id="fGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#86C063" /><stop offset="1" stopColor="#62A04C" /></linearGradient>
    <radialGradient id="fFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <radialGradient id="fSun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF6C4" stopOpacity={0.9} /><stop offset="0.5" stopColor="#FFE98A" stopOpacity={0.35} /><stop offset="1" stopColor="#FFE98A" stopOpacity={0} /></radialGradient>
    <radialGradient id="fIris" cx="0.5" cy="0.45" r="0.55"><stop offset="0.3" stopColor={IRIS} /><stop offset="1" stopColor={IRIS2} /></radialGradient>
    <linearGradient id="fFrog" x1="0" y1="0" x2="0.6" y2="1"><stop offset="0" stopColor="#82D35E" /><stop offset="1" stopColor={FROG2} /></linearGradient>
    <linearGradient id="fRock" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stopColor="#B9B4A8" /><stop offset="1" stopColor="#8D877B" /></linearGradient>
    <linearGradient id="fWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7FC8E8" /><stop offset="1" stopColor="#4E9CC6" /></linearGradient>
    <linearGradient id="fCup" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" stopOpacity={0.9} /><stop offset="1" stopColor="#D8ECF6" stopOpacity={0.9} /></linearGradient>
  </defs></W>
);

// ---------- the pond ----------
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-4000} y={-5000} width={9000} height={5000} fill="url(#fSky)" />
    <g transform="translate(750 -1350)">
      <circle r={480} fill="url(#fSun)" />
      <circle r={150} fill="#FFE46B" stroke={INK} strokeWidth={9} />
      {Array.from({length: 10}, (_, i) => { const a = i * 36 + t * 12; return <path key={i} transform={`rotate(${a}) translate(0 -205)`} d="M -14 0 L 0 -46 L 14 0 Z" fill="#FFE46B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />; })}
    </g>
    {[[-1500, -1900, 1.2], [900, -2300, 1], [2100, -1700, 0.8], [-300, -2500, 0.9]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x + 30 * Math.sin(t * 0.3 + i)} ${y}) scale(${s})`}>
        <path d="M -200 40 Q -230 -30 -150 -50 Q -120 -130 -30 -110 Q 30 -170 110 -110 Q 200 -120 200 -40 Q 250 20 190 50 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      </g>))}
  </W>
);
const Pond: React.FC<{t: number}> = ({t}) => (
  <W>
    <path d="M -3000 60 Q -2200 -420 -1300 -180 Q -700 -470 100 -230 Q 900 -500 1700 -210 Q 2500 -460 3300 -200 Q 4100 -430 5000 60 Z" fill="#9CCB7E" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {Array.from({length: 12}, (_, i) => {
      const x = -2600 + i * 470 + rnd(i) * 140, h = 300 + rnd(i * 3) * 200;
      return <g key={i} transform={`translate(${x} -40)`}>
        <rect x={-18} y={-h * 0.45} width={36} height={h * 0.45 + 40} fill="#8A6A48" stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={-h * 0.6} rx={h * 0.34} ry={h * 0.38} fill="#6FAE58" stroke={INK} strokeWidth={7} />
      </g>;
    })}
    <rect x={-3000} y={50} width={8000} height={3000} fill="#86BD66" />
    {/* the pond behind them */}
    <ellipse cx={200} cy={150} rx={1500} ry={150} fill="url(#fWater)" stroke={INK} strokeWidth={8} />
    {Array.from({length: 6}, (_, i) => <path key={i} d={`M ${-900 + i * 380 + 30 * Math.sin(t * 1.3 + i)} ${110 + (i % 3) * 40} q 30 -10 60 0`} stroke="#DDF2FB" strokeWidth={6} fill="none" strokeLinecap="round" />)}
    {[[-700, 160], [600, 110], [1100, 190]].map(([x, y], i) => <path key={i} d={`M ${x} ${y} a 70 26 0 1 1 20 -24 L ${x} ${y - 4} Z`} fill="#5FAE4A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
    {/* cattails */}
    {[[-1050, 1], [-980, 0.8], [1300, 1.1], [1380, 0.9]].map(([x, s], i) => <g key={'c' + i} transform={`translate(${x} 60) scale(${s}) rotate(${3 * Math.sin(t * 1.5 + i)})`}>
      <path d="M 0 0 V -320" stroke="#4F8A3F" strokeWidth={10} strokeLinecap="round" />
      <rect x={-14} y={-300} width={28} height={90} rx={14} fill="#8A5A34" stroke={INK} strokeWidth={6} />
      <path d="M 0 0 Q -60 -120 -40 -220" stroke="#5E9E4E" strokeWidth={12} fill="none" strokeLinecap="round" />
    </g>)}
  </W>
);
const Ground: React.FC = () => (
  <W>
    <rect x={-4000} y={0} width={9000} height={3000} fill="url(#fGrass)" />
    <path d="M -4000 0 H 5000" stroke={INK} strokeWidth={8} />
    {Array.from({length: 70}, (_, i) => {
      const x = -2000 + rnd(i * 3) * 4400, y = 30 + rnd(i * 7) * 700;
      return <path key={i} d={`M ${x - 14} ${y} l 8 -26 l 6 22 l 8 -30 l 6 34`} stroke="#4F8A3F" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
  </W>
);
const Rock: React.FC = () => (
  <W><g transform={`translate(${FX} 0)`}>
    <path d={`M -140 8 Q -150 -60 -110 ${FY + 6} Q -40 ${FY - 14} 40 ${FY - 6} Q 130 ${FY + 4} 150 -40 Q 160 0 150 8 Z`} fill="url(#fRock)" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -80 -50 Q -60 -60 -40 -52 M 50 -70 Q 70 -76 90 -66" stroke="#7A7468" strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d={`M -110 ${FY + 10} Q -60 ${FY - 6} -20 ${FY + 2}`} stroke="#7DBA5A" strokeWidth={12} fill="none" strokeLinecap="round" />
  </g></W>
);
const CastShadow: React.FC<{x: number; w: number}> = ({x, w}) => <W><ellipse cx={x - w * 0.12} cy={6} rx={w * 0.6} ry={22} fill="#2F5A20" opacity={0.3} /></W>;

// ---------- a frog eye on a dome that can sink into the head (clipped at its base line) ----------
const EyeDome: React.FC<{x: number; base: number; r: number; sink: number; skin: string; lid: string; look?: number; mood?: 'open' | 'smug' | 'dizzy' | 'wide'; t: number; id: string; up?: number; socket?: string}> =
  ({x, base, r, sink, skin, lid, look = 0, mood = 'open', t, id, up = 0.55, socket = '#BDB6AA'}) => {
    const cy = base - r * up + sink * r * 2.1;          // dome centre: up = how far it pokes above the base line
    const ir = r * 0.76;
    const blink = mood !== 'dizzy' && (t % 3.3) > 3.2;
    return (
      <g>
        <clipPath id={id}><rect x={x - r * 2} y={base - r * 4} width={r * 4} height={r * 4} /></clipPath>
        {/* the socket hole the eye drops into */}
        {sink > 0.05 ? <ellipse cx={x} cy={base} rx={r * 0.95 * Math.min(1, sink * 2.5)} ry={r * 0.2} fill={socket} stroke={INK} strokeWidth={3.5} /> : null}
        <g clipPath={`url(#${id})`}>
          <g transform={`translate(${x} ${cy})`}>
            <circle r={r} fill={skin} stroke={INK} strokeWidth={6} />
            <circle r={ir * (mood === 'wide' ? 1.06 : 1)} fill="url(#fIris)" stroke={INK} strokeWidth={4.5} />
            {mood === 'dizzy'
              ? <path d={`M 0 0 m -8 0 a 8 8 0 1 1 8 8 a 13 13 0 1 1 -13 -13`} transform={`rotate(${t * 900})`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
              : <><ellipse cx={look * ir * 0.3} cy={2} rx={ir * 0.62} ry={ir * 0.3} fill={INK} /><circle cx={look * ir * 0.3 - ir * 0.3} cy={-ir * 0.3} r={ir * 0.17} fill="#fff" /></>}
            {mood === 'smug' || blink ? <path d={`M ${-r} ${blink ? r * 0.25 : -r * 0.05} A ${r} ${r} 0 0 1 ${r} ${blink ? r * 0.25 : -r * 0.05} Z`} fill={lid} stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
          </g>
        </g>
        {/* the base line where dome meets head: drawn over so the sinking reads */}
        {sink > 0.05 ? <path d={`M ${x - r * 0.95} ${base} Q ${x} ${base + r * 0.18} ${x + r * 0.95} ${base}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
      </g>
    );
  };

// ---------- the guy's head, drawn in code: frog eyes on top ----------
type HeadMood = 'calm' | 'gulp' | 'tongue' | 'woozy' | 'dizzy' | 'happy' | 'worried' | 'slurp';
const GuyHead: React.FC<{x: number; y: number; mood?: HeadMood; t: number; sink: number; rot?: number; look?: number; gulp?: number}> = ({x, y, mood = 'calm', t, sink, rot = 0, look = 0, gulp = 0}) => {
  const R = HEAD_R;
  const eyeMood = mood === 'dizzy' ? 'dizzy' : mood === 'woozy' ? 'open' : mood === 'worried' ? 'wide' : 'open';
  const pale = mood === 'woozy' ? 1 : 0;
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <circle r={R + 1} fill="url(#fFace)" stroke={INK} strokeWidth={6.5} />
      {pale ? <circle r={R - 4} fill="#B7E39A" opacity={0.25} /> : null}
      {/* cheeks puff on a gulp */}
      {mood === 'gulp' ? <><circle cx={-34} cy={22} r={15} fill="#F6B3BE" opacity={0.75} /><circle cx={34} cy={22} r={15} fill="#F6B3BE" opacity={0.75} /></> : null}
      {[-1, 1].map((side) => (
        <EyeDome key={side} id={`ge${side}`} x={side * 31} base={-R * 0.62} r={29} sink={sink} skin="#F4F2EE" lid="#D9D5CE" look={look} mood={eyeMood} t={t} up={0.62} />
      ))}
      {/* mouth */}
      <g transform="translate(0 26)">
        {mood === 'calm' ? <path d="M -18 -2 Q 0 10 18 -2" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'happy' ? <path d="M -20 -4 Q 0 18 20 -4 Z" fill="#E4677A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
        {mood === 'gulp' || mood === 'woozy' ? <path d="M -16 0 Q 0 -5 16 0" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
        {mood === 'tongue' ? <ellipse cx={0} cy={2} rx={17} ry={14} fill="#5A2328" stroke={INK} strokeWidth={5} /> : null}
        {mood === 'worried' ? <ellipse cx={0} cy={4} rx={10} ry={12} fill="#5A2328" stroke={INK} strokeWidth={5} /> : null}
        {mood === 'slurp' ? <ellipse cx={0} cy={2} rx={8} ry={7} fill="#5A2328" stroke={INK} strokeWidth={4.5} /> : null}
        {mood === 'dizzy' ? <path d="M -16 2 Q -8 -6 0 2 Q 8 10 16 2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      </g>
      {/* the gulp travelling down the throat */}
      {gulp > 0.01 && gulp < 0.99 ? <circle cx={0} cy={R - 4 + gulp * 40} r={13 * Math.sin(Math.PI * gulp)} fill="#F4F2EE" stroke={INK} strokeWidth={4} /> : null}
    </g></W>
  );
};
const headOf = (pose: Pose) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s, hy: (m.head[1] - m.feet[1]) * s};
};
const HEAD = headOf('front_calm');
const MOUTH = {x: GX + HEAD.hx, y: HEAD.hy + 28};

// ---------- the frog (sits on the rock, faces left toward the guy) ----------
type FrogMood = 'smug' | 'open' | 'wide' | 'laugh';
/** local frame: feet at (0,0), mouth corner at (-128, -104) */
const FROG_MOUTH = {x: FX - 128 * FS, y: FY - 104 * FS};
const Frog: React.FC<{t: number; sink: number; mood?: FrogMood; tongueOpen?: number; gulp?: number; look?: number}> = ({t, sink, mood = 'smug', tongueOpen = 0, gulp = 0, look = -1}) => {
  const bob = mood === 'laugh' ? 4 * Math.sin(t * 40) : 1.5 * Math.sin(t * 2 * Math.PI * 0.6);
  const throat = 1 + 0.28 * Math.sin(Math.PI * clamp(gulp)) + 0.04 * Math.sin(t * 2 * Math.PI * 1.8);
  const eyeMood = mood === 'smug' ? 'smug' : mood === 'wide' ? 'wide' : 'open';
  return (
    <W><g transform={`translate(${FX} ${FY + bob}) scale(${FS})`}>
      {/* back leg + body */}
      <ellipse cx={70} cy={-34} rx={58} ry={42} fill={FROG2} stroke={INK} strokeWidth={7} />
      <path d="M 40 -6 Q 100 4 130 -4" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
      <ellipse cx={20} cy={-62} rx={100} ry={62} fill="url(#fFrog)" stroke={INK} strokeWidth={7} />
      {[[40, -80, 11], [70, -55, 8], [5, -96, 7]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={FROG2} opacity={0.7} />)}
      {/* front leg + toes (under the head) */}
      <path d="M -20 -50 Q -50 -30 -62 -6" stroke={INK} strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d="M -20 -50 Q -50 -30 -62 -6" stroke={FROG} strokeWidth={22} fill="none" strokeLinecap="round" />
      {[-90, -70, -50].map((x, i) => <circle key={i} cx={x} cy={-3} r={10} fill={FROG} stroke={INK} strokeWidth={4} />)}
      {/* eyes on top of the head (sink into it) */}
      <EyeDome id="fe0" x={-86} base={-150} r={28} sink={sink} skin={FROG} lid={FROG2} socket={FROG2} look={look} mood={eyeMood} t={t + 1.1} />
      <EyeDome id="fe1" x={-22} base={-156} r={28} sink={sink} skin={FROG} lid={FROG2} socket={FROG2} look={look} mood={eyeMood} t={t + 1.1} />
      {/* head */}
      <path d="M -132 -108 Q -136 -158 -70 -160 Q 0 -168 30 -140 Q 54 -112 30 -84 Q -40 -70 -120 -86 Q -134 -94 -132 -108 Z" fill="url(#fFrog)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {/* throat pouch */}
      <ellipse cx={-62} cy={-80} rx={52 * throat} ry={20 * throat} fill={FROG_L} stroke={INK} strokeWidth={5} />
      {/* mouth */}
      {tongueOpen > 0.01
        ? <path d="M -132 -104 L -40 -100 Q 0 -100 22 -108 L -40 -90 Q -100 -84 -132 -96 Z" fill="#7A2A36" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        : <path d={mood === 'laugh' ? 'M -132 -104 Q -60 -76 22 -106 Q -60 -90 -132 -104 Z' : 'M -132 -104 Q -60 -84 22 -106'} fill={mood === 'laugh' ? '#7A2A36' : 'none'} stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />}
      {/* smug corner */}
      {mood === 'smug' ? <path d="M 22 -106 q 8 -6 4 -16" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      <circle cx={-122} cy={-128} r={3.5} fill={INK} /><circle cx={-108} cy={-131} r={3.5} fill={INK} />
    </g></W>
  );
};

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
/** a sticky pink tongue from (x0,y0) toward (x1,y1), extended e (0..1) */
const Tongue: React.FC<{x0: number; y0: number; x1: number; y1: number; e: number; w?: number}> = ({x0, y0, x1, y1, e, w = 14}) => {
  if (e < 0.01) return null;
  const x = lerp(x0, x1, e), y = lerp(y0, y1, e), mx = (x0 + x) / 2, my = Math.min(y0, y) - 14 * e;
  const d = `M ${x0} ${y0} Q ${mx} ${my} ${x} ${y}`;
  return (
    <W>
      <path d={d} stroke={INK} strokeWidth={w + 9} fill="none" strokeLinecap="round" />
      <path d={d} stroke={PINK} strokeWidth={w} fill="none" strokeLinecap="round" />
      <circle cx={x} cy={y} r={w * 0.95} fill={PINK} stroke={INK} strokeWidth={4.5} />
      <path d={d} stroke={PINK2} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.6} />
    </W>
  );
};
/** the giant smoothie cup with a long bendy straw to his mouth. level = how full (0..1). */
const STRAW = `M ${CUPX + 18} -60 L ${CUPX + 18} ${MOUTH.y - 24} Q ${CUPX + 18} ${MOUTH.y} ${CUPX - 6} ${MOUTH.y} L ${MOUTH.x + 12} ${MOUTH.y}`;
const Cup: React.FC<{s: number; level: number; t: number}> = ({s, level, t}) => s > 0.01 ? (
  <W><g transform={`translate(${CUPX} 4) scale(${s}) translate(${-CUPX} -4)`}>
    <path d={`M ${CUPX - 62} -190 L ${CUPX + 62} -190 L ${CUPX + 46} 4 L ${CUPX - 46} 4 Z`} fill="url(#fCup)" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {/* smoothie */}
    <path d={`M ${CUPX - 60 + 14 * (1 - level)} ${-184 + 180 * (1 - level)} Q ${CUPX} ${-178 + 180 * (1 - level) + 6 * Math.sin(t * 4)} ${CUPX + 60 - 14 * (1 - level)} ${-184 + 180 * (1 - level)} L ${CUPX + 44} -2 L ${CUPX - 44} -2 Z`} fill="#F28AB0" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={CUPX - 22} cy={-120 + 60 * (1 - level)} r={7} fill="#FFFFFF" opacity={0.6} />
    <path d={`M ${CUPX - 40} -170 L ${CUPX - 30} -30`} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
    {/* a strawberry on the rim */}
    <g transform={`translate(${CUPX - 52} -196) rotate(-20)`}><path d="M -18 -6 Q 0 -14 18 -6 Q 14 22 0 28 Q -14 22 -18 -6 Z" fill="#E2453C" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d="M -12 -8 L 0 -18 L 12 -8" fill="#4F9A35" stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>
  </g></W>
) : null;

const Straw: React.FC<{s: number}> = ({s}) => s > 0.01 ? (
  <W><g transform={`translate(${CUPX} 4) scale(${s}) translate(${-CUPX} -4)`}>
    <path d={STRAW} stroke={INK} strokeWidth={22} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    <path d={STRAW} stroke="#FFFFFF" strokeWidth={12} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    <path d={STRAW} stroke={RED} strokeWidth={12} fill="none" strokeDasharray="14 18" strokeLinejoin="round" />
  </g></W>
) : null;

// ---------- inserts (screen space) ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const XBg: React.FC<{R: number; id: string}> = ({R, id}) => (
  <>
    <clipPath id={id}><circle r={R} /></clipPath>
    <circle r={R + 18} fill={INK} />
  </>
);

/** X-RAY of the frog's head (side view, facing left): the eye drops through its open socket into the mouth and pushes the fly to the throat */
const FrogXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 350;
  const down = eio(seg(t, T.sink - 0.12, T.sink + 0.3));          // eye drops into the mouth
  const push = eio(seg(t, T.push - 0.12, T.push + 0.55));         // and shoves back toward the throat
  const ex = -60 + 120 * push, ey = -150 + 135 * down - 10 * push;
  const fx = -70 + 330 * push, fy = 70 + 20 * push;
  const sinkS = pulse(t, T.sink, 0.9), pushS = pulse(t, T.push, 0.75);
  const vsS = popIn(t, 9.35, 0.3);
  const a = Math.min(2.3, 2.3 * seg(t, 9.4, 9.9)), b = Math.min(4, 4 * seg(t, 9.45, 10.0));
  return (
    <div style={{position: 'absolute', left: 540, top: 1040, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <XBg R={R} id="fxr" />
        <g clipPath="url(#fxr)">
          <rect x={-450} y={-450} width={900} height={900} fill="#16223A" />
          {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
          {/* head outline (soft) */}
          <path d="M -330 20 Q -330 -170 -120 -230 Q 120 -270 300 -160 Q 450 -60 450 120 Q 300 240 -60 220 Q -300 200 -330 20 Z" fill="#EAF4FF" fillOpacity={0.07} stroke="#9FD3FF" strokeWidth={5} strokeDasharray="16 12" />
          {/* skull bones: jaw lines and the open eye socket (bone ring with NO floor) */}
          <path d="M -320 10 L 250 30" stroke="#EAF4FF" strokeWidth={8} strokeLinecap="round" />
          <path d="M -310 150 Q -40 200 260 150" stroke="#EAF4FF" strokeWidth={8} strokeLinecap="round" fill="none" />
          <path d="M -150 -40 A 92 92 0 1 1 30 -40" stroke="#EAF4FF" strokeWidth={8} fill="none" strokeLinecap="round" />
          {/* mouth cavity */}
          <path d="M -300 26 Q -40 40 250 34 L 450 70 L 450 110 L 250 120 Q -40 170 -300 130 Z" fill="#6B2B3A" fillOpacity={0.55} stroke="#F6A6B8" strokeWidth={5} />
          <text x={380} y={150} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill="#9FD3FF">THROAT</text>
          {/* the fly in the mouth, pushed back */}
          {fx < 430 ? <g transform={`translate(${fx} ${fy}) scale(2.4)`} opacity={0.95}>
            <ellipse cx={-10} cy={0} rx={12} ry={8} fill="#EAF4FF" fillOpacity={0.35} stroke="#EAF4FF" strokeWidth={2.5} />
            <circle cx={6} cy={-1} r={8} fill="#EAF4FF" fillOpacity={0.35} stroke="#EAF4FF" strokeWidth={2.5} />
            <ellipse cx={-4} cy={-12} rx={11} ry={5} fill="none" stroke="#EAF4FF" strokeWidth={2} />
          </g> : null}
          {/* the eyeball (glowing) */}
          <g transform={`translate(${ex} ${ey})`}>
            <circle r={78} fill="#FFE9A8" fillOpacity={0.25} stroke="#FFE9A8" strokeWidth={8} />
            <ellipse cx={-30} cy={0} rx={22} ry={12} fill="#FFE9A8" fillOpacity={0.7} />
          </g>
          {down > 0.05 && push < 0.95 ? <path d={`M ${ex + 110} ${ey - 40} v 60 m -16 -18 l 16 18 l 16 -18`} stroke={GOLD} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
          {push > 0.05 && push < 0.98 ? <path d={`M ${ex + 100} ${ey + 60} h 70 m -18 -16 l 18 16 l -18 16`} stroke={GOLD} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
          <text x={ex} y={ey - 92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#FFE9A8">EYE</text>
          <text x={-200} y={110} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill="#F6A6B8">MOUTH</text>
          <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
        </g>
        <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
      </svg>
      <Card text="X-RAY: FROG" top={80} />
      <Card text="EYES SINK" top={690} left={200} color={GOLD} rot={-8} s={sinkS} size={58} />
      <Card text="PUSH" top={560} left={720} color={GOLD} rot={6} s={pushS} size={66} />
      {vsS > 0.01 ? <div style={{position: 'absolute', left: 450, top: 860, transform: `translate(-50%,-50%) rotate(2deg) scale(${vsS})`, background: '#FFFDF6', border: `8px solid ${INK}`, borderRadius: 28,
        boxShadow: `0 8px 0 ${INK}`, padding: '8px 26px 12px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{fontWeight: 900, fontSize: 36}}>GULPS PER BUG</div>
        <div style={{display: 'flex', gap: 26, alignItems: 'center', justifyContent: 'center', fontWeight: 900}}>
          <div><div style={{fontSize: 76, lineHeight: 1, color: '#2E8B3E'}}>{a.toFixed(1)}</div><div style={{fontSize: 28}}>WITH EYES</div></div>
          <div style={{fontSize: 40}}>vs</div>
          <div><div style={{fontSize: 76, lineHeight: 1, color: RED}}>{b.toFixed(1)}</div><div style={{fontSize: 28}}>EYES STUCK</div></div>
        </div>
      </div> : null}
    </div>
  );
};

/** YOUR HEAD: pressing the eye in lights the nerve to the heart; the heart monitor slows */
const BEATS = [11.86, 12.3, 12.86, 13.6, 14.6];
const HeartXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 340;
  const press = eio(seg(t, 11.75, 11.95));
  const nerve = seg(t, 11.85, T.heart + 0.15);
  const lb = BEATS.filter((b) => b <= t).pop() ?? -9, since = t - lb;
  const beat = since >= 0 && since < 0.3 ? Math.sin(Math.PI * since / 0.3) : 0;
  const slowS = popIn(t, T.slows, 0.3), dangerS = popIn(t, T.down2, 0.3);
  // ECG trace: the last 1.8 s, spikes at the beats
  const pts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = -300 + i * 5, tt = t - 1.8 + (i / 120) * 1.8;
    let y = 0;
    for (const b of BEATS) { const d = tt - b; if (d > -0.03 && d < 0.09) y = d < 0 ? 12 * (d + 0.03) / 0.03 : d < 0.03 ? -70 * (1 - Math.abs(d) / 0.03) : 20 * (1 - (d - 0.03) / 0.06); }
    if (tt < 11.75) y = 0;
    pts.push(`${i ? 'L' : 'M'} ${x} ${y}`);
  }
  return (
    <div style={{position: 'absolute', left: 540, top: 1040, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s})`}}>
      <svg width={860} height={860} viewBox="-430 -430 860 860" style={{overflow: 'visible'}}>
        <XBg R={R} id="hxr" />
        <g clipPath="url(#hxr)">
          <rect x={-430} y={-430} width={860} height={860} fill="#16223A" />
          {Array.from({length: 12}, (_, i) => <path key={i} d={`M ${-430 + i * 80} -430 V 430 M -430 ${-430 + i * 80} H 430`} stroke="#2A3A5C" strokeWidth={3} />)}
          {/* head (side view, facing left) + neck + chest */}
          <circle cx={10} cy={-170} r={150} fill="#EAF4FF" fillOpacity={0.08} stroke="#EAF4FF" strokeWidth={7} />
          <path d="M -40 -30 L -50 40 Q -200 70 -260 200 L -260 430 M 70 -30 L 80 40 Q 230 70 290 200 L 290 430" stroke="#EAF4FF" strokeWidth={6} fill="none" strokeOpacity={0.7} />
          {/* eye socket + the eye pressed in */}
          <circle cx={-100} cy={-190} r={46} fill="none" stroke="#EAF4FF" strokeWidth={6} />
          <g transform={`translate(${-100 + 18 * press} -190)`}><circle r={34} fill="#FFE9A8" fillOpacity={0.3} stroke="#FFE9A8" strokeWidth={6} /></g>
          {/* the pressing finger / arrow */}
          <path d={`M ${-260 + 40 * press} -190 h 80 m -22 -20 l 22 20 l -22 20`} stroke={GOLD} strokeWidth={12} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* nerve: eye -> brainstem -> heart, lighting up */}
          <path d="M -70 -180 Q 0 -150 20 -90 Q 30 0 20 80 Q 10 150 30 190" stroke="#3A4A6C" strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M -70 -180 Q 0 -150 20 -90 Q 30 0 20 80 Q 10 150 30 190" stroke={GOLD} strokeWidth={10} fill="none" strokeLinecap="round" {...pen(nerve)} />
          {/* the heart */}
          <g transform={`translate(30 210) scale(${1 + 0.16 * beat})`}>
            <path d="M 0 40 C -90 -10 -70 -90 -20 -80 C 0 -76 0 -60 0 -54 C 0 -60 0 -76 20 -80 C 70 -90 90 -10 0 40 Z" transform="scale(1.3)" fill={RED} fillOpacity={0.85} stroke="#FFB3B3" strokeWidth={6} strokeLinejoin="round" />
          </g>
          {/* monitor trace */}
          <g transform="translate(0 330)"><path d={pts.join(' ')} stroke="#6CF59A" strokeWidth={6} fill="none" strokeLinejoin="round" /></g>
          <rect x={-430} y={((t * 520) % 860) - 430} width={860} height={14} fill="#9FD3FF" opacity={0.22} />
        </g>
        <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
      </svg>
      <Card text="YOUR HEART" top={70} />
      <Card text="SLOWS DOWN" top={790} color={RED} fg="#fff" rot={2} s={slowS} size={62} />
      <Card text="DANGER" top={430} left={140} color={GOLD} rot={-12} s={dangerS} size={56} />
    </div>
  );
};

/** stopwatch on the tongue: 0.00 -> 0.07 s (shown in slow motion) + "5x FASTER THAN A BLINK" */
const Stopwatch: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const v = 0.07 * seg(t, T.fly - 0.02, T.fly + 0.55);
  const done = t > T.fly + 0.55;
  const fastS = popIn(t, T.second - 0.05, 0.3);
  return (
    <>
      <div style={{position: 'absolute', left: 540, top: 1480, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s * (done ? 1 + 0.06 * Math.max(0, 1 - (t - T.fly - 0.55) * 4) : 1)})`,
        background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 34, padding: '10px 34px 14px', boxShadow: `0 10px 0 ${INK}`, textAlign: 'center', fontFamily: FONT, color: INK}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 18, justifyContent: 'center'}}>
          <svg width={92} height={92} viewBox="-50 -50 100 100"><circle cy={4} r={40} fill="#fff" stroke={INK} strokeWidth={8} /><rect x={-9} y={-50} width={18} height={12} fill={INK} />
            <path d={`M 0 4 L ${30 * Math.sin(v / 0.07 * 2 * Math.PI)} ${4 - 30 * Math.cos(v / 0.07 * 2 * Math.PI)}`} stroke={RED} strokeWidth={7} strokeLinecap="round" /></svg>
          <div style={{fontWeight: 900, fontSize: 132, lineHeight: 1, color: done ? RED : INK}}>{v.toFixed(2)}</div>
        </div>
        <div style={{fontWeight: 900, fontSize: 44, letterSpacing: 1}}>SECONDS</div>
      </div>
      <Card text="5x FASTER THAN A BLINK" top={1690} color={GOLD} rot={2} s={fastS * s} size={52} />
    </>
  );
};

// ---------- the story over time ----------
type GuyState = {sink: number; mood: HeadMood; rot: number; look: number; gulp: number};
const guyAt = (t: number): GuyState => {
  const base: GuyState = {sink: 0, mood: 'calm', rot: 0, look: 0.6 * Math.sin(t * 2.2), gulp: 0};
  if (t < 0.4) return {...base, sink: sinkStart(t), mood: t < 0.2 ? 'gulp' : 'calm', gulp: seg(t, 0, 0.45)};
  if (t < 3.35) {
    const s = sinkPulse(t, T.eyeballs, 1, 0.3);
    return {...base, sink: s, mood: t > T.eyeballs - 0.05 && t < T.eyeballs + 0.5 ? 'gulp' : 'calm', gulp: seg(t, T.eyeballs, T.eyeballs + 0.5)};
  }
  if (t < 10.1) return {...base, mood: 'calm'};
  if (t < 11.75) {                                                     // the comedy hit: his own tongue, then his eyes sink and BOING back up
    const tg = tongueAt(t, 10.36);
    const sink = t < 10.62 ? 0 : t < 11.3 ? 0.5 * eout(seg(t, 10.62, 10.74)) : 0.5 - 0.7 * backOut(seg(t, 11.3, 11.55)) * 1.0;
    const mood: HeadMood = t < 10.6 ? (tg > 0 ? 'tongue' : 'calm') : t < 11.3 ? 'woozy' : 'dizzy';
    return {...base, sink: Math.max(-0.2, sink), mood, rot: t > 10.75 && t < 11.3 ? 5 * Math.sin((t - 10.75) * 6) : t >= 11.3 ? 6 * Math.sin((t - 11.3) * 9) : 0,
      look: 0.8, gulp: seg(t, 10.62, 11.1)};
  }
  if (t < 13.35) return {...base, mood: 'worried', look: 0};
  if (t < 18.1) {
    const sip = (t > T.smoothies - 0.1 && t < T.smoothies + 0.7) || (t > 17.45 && t < 18.1);
    return {...base, mood: sip ? 'slurp' : 'happy', look: t > 16.2 && t < 17.5 ? 0.9 : 0.4};
  }
  // the fly came up the straw: GULP, eyes sink = frame 0
  return {...base, sink: 0.4 * eout(seg(t, 18.12, 18.3)), mood: 'gulp', gulp: seg(t, 18.12, 18.6)};
};
type FrogState = {sink: number; mood: FrogMood; tongue: number; gulp: number; look: number};
const frogAt = (t: number): FrogState => {
  const base: FrogState = {sink: 0, mood: 'smug', tongue: 0, gulp: 0, look: -1};
  if (t < 0.4) return {...base, sink: sinkStart(t), mood: 'open', gulp: 1 - seg(t, 0, 0.3)};
  if (t < 3.35) return {...base, sink: sinkPulse(t, T.eyeballs + 0.08, 1, 0.3), gulp: seg(t, T.eyeballs + 0.08, T.eyeballs + 0.6)};
  if (t < 6.55) {
    const tg = tongueAt(t, T.fly);
    return {...base, mood: t < T.fly ? 'wide' : 'smug', tongue: tg, sink: sinkPulse(t, T.fly + 0.4, 1, 0.45), gulp: seg(t, T.fly + 0.4, T.fly + 1.0), look: -1};
  }
  if (t < 10.1) return {...base, sink: t > T.sink ? sinkPulse(t, T.sink - 0.12, 1, 1.6) : 0, gulp: seg(t, T.push, T.push + 0.6)};
  if (t < 11.75) return {...base, mood: t > 11.3 ? 'laugh' : 'smug', look: -1};
  if (t < 18.1) return {...base, mood: 'smug', look: -1};
  return {...base, sink: 0.4 * eout(seg(t, 18.16, 18.34)), mood: 'open', gulp: seg(t, 18.16, 18.5)};
};
/** fly positions: fly 1 (0-4.65, eaten by the frog), fly 2 (9.9-10.45, his tongue), fly 3 (15.4-18.1, up his straw) */
const flyAt = (t: number): {x: number; y: number} | null => {
  const hover = (x: number, y: number) => ({x: x + 14 * Math.sin(t * 9), y: y + 10 * Math.sin(t * 13)});
  if (t < 3.35) return hover(-10 + 90 * Math.cos(t * 2.2), -360 + 40 * Math.sin(t * 3.1));
  if (t < T.fly + 0.06) return hover(lerp(-130, -70, eio(seg(t, 3.35, 4.3))), lerp(-340, -305, eio(seg(t, 3.35, 4.3))));
  if (t < T.fly + 0.2) {                                              // stuck on the tongue tip on the way back
    const e = tongueAt(t, T.fly);
    return {x: lerp(FROG_MOUTH.x, -70, e), y: lerp(FROG_MOUTH.y, -305, e)};
  }
  if (t > 9.9 && t < 10.42) return hover(MOUTH.x + 150, MOUTH.y - 70);
  if (t >= 10.42 && t < 10.56) { const e = tongueAt(t, 10.36); return {x: lerp(MOUTH.x, MOUTH.x + 150, e), y: lerp(MOUTH.y, MOUTH.y - 70, e)}; }
  if (t > 15.3 && t < 16.8) { const u = seg(t, 15.3, 16.8); return hover(lerp(260, CUPX + 30, eio(u)) + 60 * Math.sin(u * 7), lerp(-420, -200, eio(u))); }
  if (t >= 16.8 && t < 17.6) return {x: CUPX + 26, y: -196 + 2 * Math.sin(t * 20)};   // sits on the rim
  if (t >= 17.6 && t < 18.12) {                                        // slurped up the straw
    const u = eio(seg(t, 17.6, 18.12));
    const path = [[CUPX + 18, -150], [CUPX + 18, MOUTH.y - 10], [CUPX - 10, MOUTH.y - 4], [MOUTH.x + 12, MOUTH.y - 4]];
    const f = u * (path.length - 1), i = Math.min(path.length - 2, Math.floor(f)), v = f - i;
    return {x: lerp(path[i][0], path[i + 1][0], v), y: lerp(path[i][1], path[i + 1][1], v)};
  }
  return null;
};

export const FrogScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: -18, y: -245, k: 2.4}, {t: 3.3, x: -20, y: -248, k: 2.55},          // both big, mid-gulp
    {t: 3.35, x: 38, y: -255, k: 3.1}, {t: 6.5, x: 42, y: -250, k: 3.3},           // the frog's tongue (stopwatch)
    {t: 6.55, x: 70, y: -230, k: 2.1}, {t: 10.1, x: 70, y: -230, k: 2.2},         // behind the frog X-ray
    {t: 10.15, x: GX + 70, y: -265, k: 3.3}, {t: 11.7, x: GX + 70, y: -265, k: 3.55}, // his tongue -> eyes sink -> BOING
    {t: 11.75, x: GX + 40, y: -240, k: 2.4}, {t: 13.3, x: GX + 40, y: -240, k: 2.5},  // behind YOUR HEART
    {t: 13.35, x: -25, y: -240, k: 2.3}, {t: 17.4, x: -20, y: -244, k: 2.36},        // smoothie
    {t: 18.2, x: -18, y: -245, k: 2.4},                                             // = the frame-0 shot
  ], t);
  const sh = shake(t, hit(t, 0, 7, 7) + hit(t, 11.3, 7, 6) + hit(t, 18.15, 6, 7));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t), f = frogAt(t);
  const fly = flyAt(t);
  const headX = GX + HEAD.hx, headY = HEAD.hy;
  // inserts
  const watchS = popIn(t, T.fly - 0.2, 0.3) * (1 - seg(t, 6.3, 6.5));
  const frogXS = popIn(t, 6.6, 0.35) * (1 - seg(t, 9.9, 10.1));
  const heartS = popIn(t, 11.78, 0.35) * (1 - seg(t, 13.1, 13.33));
  const cupS = popIn(t, 13.4, 0.35);
  const level = 1 - 0.25 * seg(t, T.smoothies, T.smoothies + 0.7) - 0.25 * seg(t, 17.45, 18.1);
  // stickers
  const gulp0 = t < 0.9 ? 1 - seg(t, 0.62, 0.85) : 0;
  const boing0 = pulse(t, 0.28, 0.6);
  const gulp1 = pulse(t, T.eyeballs + 0.05, 0.55);
  const thwip = pulse(t, T.fly, 0.5);
  const thwip2 = pulse(t, 10.36, 0.4), gulp2 = pulse(t, 10.66, 0.45), boing2 = pulse(t, 11.3, 0.45);
  const slurp = pulse(t, T.smoothies, 0.7), slurp2 = pulse(t, 17.6, 0.5), gulp3 = t > 18.1 ? popIn(t, 18.15, 0.25) : 0;
  const stars = t > 11.3 && t < 11.75 ? 1 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#BFE3F3'}}>
      <Defs />
      <Layer cam={cam} z={3200} paper={false}><Backdrop t={t} /></Layer>
      <Layer cam={cam} z={1900}><Pond t={t} /></Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Ground />
        <CastShadow x={GX} w={150} />
        <CastShadow x={FX + 10} w={260} />
        {cupS > 0.01 ? <CastShadow x={CUPX} w={110} /> : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        <Rock />
        <Frog t={t} sink={f.sink} mood={f.mood} tongueOpen={f.tongue} gulp={f.gulp} look={f.look} />
        <Guy pose="front_calm" x={GX} y={0} t={t} rot={g.rot * 0.3} breathe={!(t > 11.3 && t < 11.75)} />
        <Cup s={cupS} level={level} t={t} />
        <GuyHead x={headX} y={headY} mood={g.mood} t={t} sink={g.sink} rot={g.rot} look={g.look} gulp={g.gulp} />
        <Straw s={cupS} />
      </Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Tongue x0={FROG_MOUTH.x} y0={FROG_MOUTH.y} x1={-70} y1={-305} e={f.tongue} />
        <Tongue x0={MOUTH.x} y0={MOUTH.y} x1={MOUTH.x + 150} y1={MOUTH.y - 70} e={tongueAt(t, 10.36)} w={12} />
        {fly ? <Fly x={fly.x} y={fly.y} t={t} rot={8 * Math.sin(t * 9)} /> : null}
        {/* motion lines on the sinking eyes at frame 0 / the loop */}
        {t < 0.3 || t > 18.12 ? <W>{[-1, 1].map((sd) => <path key={sd} d={`M ${headX + sd * 76} ${headY - 70} v 30 m -10 -10 l 10 10 l 10 -10`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}</W> : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={headX + Math.cos(a) * 86} y={headY - 96 + Math.sin(a) * 16} s={stars * 0.55} rot={t * 200} />;
        })}
        <Txt x={headX + 95} y={headY + 125} s={gulp0} text="GULP" size={84} rot={-8} fill={GOLD} />
        <Txt x={FX - 20} y={-310} s={boing0} text="BOING" size={70} rot={8} fill={GOLD} />
        <Txt x={-20} y={-150} s={gulp1} text="GULP" size={80} rot={-6} fill={GOLD} />
        <Txt x={-30} y={-370} s={thwip} text="THWIP" size={56} rot={-10} fill={GOLD} />
        <Txt x={MOUTH.x + 120} y={MOUTH.y - 150} s={thwip2} text="THWIP" size={50} rot={-8} fill={GOLD} />
        <Txt x={headX + 70} y={headY + 112} s={gulp2} text="GULP" size={60} rot={6} fill={GOLD} />
        <Txt x={headX + 120} y={headY - 120} s={boing2} text="BOING" size={60} rot={10} fill={GOLD} />
        <Txt x={CUPX + 30} y={-370} s={slurp} text="SLURP" size={64} rot={6} fill={GOLD} />
        <Txt x={CUPX + 60} y={-330} s={slurp2} text="SLURP" size={60} rot={-6} fill={GOLD} />
        <Txt x={headX + 95} y={headY + 125} s={gulp3} text="GULP" size={84} rot={-8} fill={GOLD} />
      </Layer>
      <Stopwatch t={t} s={watchS} />
      <FrogXRay t={t} s={frogXS} />
      <HeartXRay t={t} s={heartS} />
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you had a frog's eyes??" handle="@lilypad_larry" likes="3.1K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.bat - 0.05} until={18.3} text="Bat ears or a shark's nose?" />
      </>}
    </AbsoluteFill>
  );
};

export const FrogVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks: Cue[] = [];
  for (let i = 1; i <= 7; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.fly - 0.02, T.fly + 0.55, i / 7), db: -27});
  const cues: Cue[] = [
    {f: 'gulp.wav', at: 0, db: -12}, {f: 'twang.mp3', at: 0.0, db: -16, to: 0.6}, {f: 'whoosh.wav', at: 0, db: -22},
    {f: 'gulp.wav', at: T.eyeballs, db: -18}, {f: 'twang.mp3', at: T.eyeballs + 0.45, db: -26, to: 0.4},
    {f: 'whoosh.wav', at: 3.3, db: -26}, {f: 'squeak.wav', at: T.fly, db: -22}, {f: 'whoosh.wav', at: T.fly - 0.02, db: -20}, {f: 'pop.wav', at: T.fly - 0.2, db: -24},
    ...ticks, {f: 'ding.mp3', at: T.fly + 0.57, db: -22}, {f: 'gulp.wav', at: T.fly + 0.4, db: -20}, {f: 'pop.wav', at: T.second - 0.05, db: -22},
    {f: 'zap.wav', at: 6.6, db: -26}, {f: 'pop.wav', at: T.sink, db: -20}, {f: 'gulp.wav', at: T.sink, db: -24}, {f: 'pop.wav', at: T.push, db: -20}, {f: 'gulp.wav', at: T.push + 0.3, db: -24},
    {f: 'pop.wav', at: 9.35, db: -24}, ...[9.6, 9.75, 9.9].map((x): Cue => ({f: 'tick.wav', at: x, db: -28})),
    {f: 'whoosh.wav', at: 10.12, db: -26}, {f: 'squeak.wav', at: 10.36, db: -22}, {f: 'whoosh.wav', at: 10.34, db: -22}, {f: 'gulp.wav', at: 10.62, db: -16},
    {f: 'twang.mp3', at: 11.3, db: -14, to: 0.6}, {f: 'crowd_laugh.wav', at: 11.35, db: -30, to: 1.1},
    {f: 'zap.wav', at: 11.78, db: -26}, ...BEATS.filter((b) => b < 13.3).map((b): Cue => ({f: 'pop.wav', at: b, db: -18})), {f: 'horn.wav', at: T.down2, db: -30, to: 0.6},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: 13.33, db: -28}, {f: 'pop.wav', at: 13.4, db: -24}, {f: 'bubbles.wav', at: T.smoothies, db: -26, to: 0.7}, {f: 'giggle.mp3', at: 15.0, db: -32, to: 0.9},
    {f: 'bubbles.wav', at: 17.6, db: -24, to: 0.5}, {f: 'gulp.wav', at: 18.12, db: -14},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<FrogScene t={0} />}>
        <FrogScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="frog/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const FrogWide: React.FC = () => <WideFit.Provider value={0.72}><FrogVideo /></WideFit.Provider>;
