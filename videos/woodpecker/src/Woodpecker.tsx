// "What if you had a woodpecker's head?" - owl formula (CLAUDE.md, Growth), niche: animal powers. The power is ON HIM at
// frame 0 (a beak + red crest on his round head, mid-peck into a tree trunk: BONK), the animal co-star on the other side
// of the same trunk drumming with ease and a smug face, a live counter (PECKS / SECOND 0 -> 20), two X-rays (the
// woodpecker's skull: NO SPRING, a STIFF HAMMER; then YOUR BRAIN slamming the skull: CONCUSSION), a brain-size versus
// card (TINY vs big, the small one barely moves on a hit), the comedy hit from the power itself (first peck -> dizzy ->
// he keels over stiff, K.O.), and his dumb-but-funny fix (he pecks a pillow taped to the tree) - the pillow slips off
// and his next peck hits bare wood = frame 0. Series opener: a doodle comment bubble instead of HookTitle.
// Everything drawn in code; the guy's body is the library sprite, his head is drawn in code over it.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Puffs} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.1; times below are video time). Last word ends ~19.3 s; + 0.9 s for the push.
export const DURATION = 20.2;
export const T = {
  head: 1.12, first: 1.77, peck: 2.06, knock: 2.57, out: 3.01,            // "Get a woodpecker's head, and your first peck would knock you out."
  it: 3.52, twenty: 4.21, second: 5.08,                                   // "It pecks up to twenty times a second."
  no: 5.81, absorber: 6.25, skull: 7.23, stiff: 8.03, hammer: 8.32,       // "No shock absorber... its skull is a stiff hammer."
  each: 8.97, concussion: 10.06,                                          // "Each hit would give you a concussion."
  trick: 11.06, tiny: 11.66, brain: 12.10,                                // "Its trick? A tiny brain."
  small: 12.79, feel: 13.52, less: 14.03,                                 // "Small brains feel the hit less."
  so: 14.74, pecks: 15.32, pillow: 15.68,                                 // "So he pecks a pillow."
  shark: 16.17, octopus: 17.23, comment: 18.59,                           // "Shark teeth or octopus arms next? Comment below."
  cta: 12.35,
};

const GOLD = '#FFD43B', RED = '#E2453C', CREST = '#E0352B', BEAK = '#4E535B', BEAK2 = '#7C838D';
const GX = -205;                // guy's feet
const TX = 0, TW = 78;          // trunk centre, half width
const WPY = -250;               // woodpecker's grip height (feet on the bark)

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
/** one peck at t0: snaps in over 0.05 s (hits at t0), eases back over 0.2 s. Returns 0..1 forward. */
const peckAt = (t: number, t0: number) => t < t0 - 0.06 || t > t0 + 0.24 ? 0 : t < t0 ? eout(seg(t, t0 - 0.06, t0)) : 1 - eio(seg(t, t0, t0 + 0.24));
const pecks = (t: number, times: number[]) => times.reduce((m, p) => Math.max(m, peckAt(t, p)), 0);
const lastHit = (t: number, times: number[]) => times.filter((p) => p <= t).pop() ?? -9;

const Defs: React.FC = () => (
  <W><defs>
    <linearGradient id="wSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9AD3EE" /><stop offset="0.6" stopColor="#CBEAF4" /><stop offset="1" stopColor="#EEF6DA" /></linearGradient>
    <linearGradient id="wGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#86C063" /><stop offset="1" stopColor="#62A04C" /></linearGradient>
    <linearGradient id="wBark" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#B4844F" /><stop offset="0.55" stopColor="#99693D" /><stop offset="1" stopColor="#6E4A2A" /></linearGradient>
    <radialGradient id="wFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <radialGradient id="wSun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF6C4" stopOpacity={0.9} /><stop offset="0.5" stopColor="#FFE98A" stopOpacity={0.35} /><stop offset="1" stopColor="#FFE98A" stopOpacity={0} /></radialGradient>
    <linearGradient id="wPillow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#FFFFFF" /><stop offset="1" stopColor="#CFE0F5" /></linearGradient>
  </defs></W>
);

// ---------- the forest ----------
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-4000} y={-5000} width={9000} height={5000} fill="url(#wSky)" />
    <g transform="translate(-700 -1400)">
      <circle r={480} fill="url(#wSun)" />
      <circle r={150} fill="#FFE46B" stroke={INK} strokeWidth={9} />
      {Array.from({length: 10}, (_, i) => { const a = i * 36 + t * 12; return <path key={i} transform={`rotate(${a}) translate(0 -205)`} d="M -14 0 L 0 -46 L 14 0 Z" fill="#FFE46B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />; })}
    </g>
    {[[-1500, -1900, 1.2], [900, -2200, 1], [2000, -1700, 0.8], [-200, -2500, 0.9]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x + 30 * Math.sin(t * 0.3 + i)} ${y}) scale(${s})`}>
        <path d="M -200 40 Q -230 -30 -150 -50 Q -120 -130 -30 -110 Q 30 -170 110 -110 Q 200 -120 200 -40 Q 250 20 190 50 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      </g>))}
  </W>
);
const Forest: React.FC = () => (
  <W>
    <path d="M -3000 60 Q -2200 -420 -1300 -180 Q -700 -470 100 -230 Q 900 -500 1700 -210 Q 2500 -460 3300 -200 Q 4100 -430 5000 60 Z" fill="#9CCB7E" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {Array.from({length: 16}, (_, i) => {
      const x = -2600 + i * 360 + rnd(i) * 120, h = 420 + rnd(i * 3) * 260;
      return <g key={i} transform={`translate(${x} -40)`}>
        <rect x={-20} y={-h * 0.55} width={40} height={h * 0.55 + 40} fill="#8A6A48" stroke={INK} strokeWidth={6} />
        <path d={`M 0 ${-h} L ${h * 0.26} ${-h * 0.45} L ${-h * 0.26} ${-h * 0.45} Z`} fill="#5E9E4E" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d={`M 0 ${-h * 0.8} L ${h * 0.32} ${-h * 0.3} L ${-h * 0.32} ${-h * 0.3} Z`} fill="#6FAE58" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      </g>;
    })}
    <rect x={-3000} y={55} width={8000} height={3000} fill="#86BD66" />
  </W>
);
const Ground: React.FC = () => (
  <W>
    <rect x={-4000} y={0} width={9000} height={3000} fill="url(#wGrass)" />
    <path d="M -4000 0 H 5000" stroke={INK} strokeWidth={8} />
    {Array.from({length: 70}, (_, i) => {
      const x = -2000 + rnd(i * 3) * 4400, y = 30 + rnd(i * 7) * 700;
      return <path key={i} d={`M ${x - 14} ${y} l 8 -26 l 6 22 l 8 -30 l 6 34`} stroke="#4F8A3F" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
    {Array.from({length: 10}, (_, i) => {
      const x = -1500 + rnd(i * 11) * 3000, y = 60 + rnd(i * 13) * 500;
      return <g key={'f' + i} transform={`translate(${x} ${y})`}>
        {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={14 * Math.cos(a * D2R)} cy={14 * Math.sin(a * D2R)} r={10} fill={i % 2 ? '#FFFFFF' : '#FF9EC2'} stroke={INK} strokeWidth={4} />)}
        <circle r={8} fill={GOLD} stroke={INK} strokeWidth={4} />
      </g>;
    })}
  </W>
);
/** the big trunk between them, with peck holes on the guy's side (dents) and the woodpecker's side */
const Trunk: React.FC<{dents: number}> = ({dents}) => (
  <W>
    <path d={`M ${TX - TW - 18} 12 Q ${TX - TW} -400 ${TX - TW + 4} -1400 L ${TX + TW - 4} -1400 Q ${TX + TW} -400 ${TX + TW + 22} 12 Z`} fill="url(#wBark)" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${TX - 40 + (i % 3) * 36} ${-80 - i * 120} q 8 -50 -2 -96`} stroke="#6E4A2A" strokeWidth={6} fill="none" strokeLinecap="round" />)}
    {/* the woodpecker's neat holes */}
    {[[-330, 0], [-300, 1], [-372, 2], [-286, 3]].map(([y, i]) => <ellipse key={i} cx={TX + TW - 10 - (i % 2) * 8} cy={y} rx={9} ry={7} fill="#3A2614" />)}
    {/* his dents: appear as he pecks */}
    {dents > 0 ? <ellipse cx={TX - TW + 10} cy={-238} rx={12} ry={9} fill="#3A2614" opacity={Math.min(1, dents)} /> : null}
    <path d={`M ${TX - TW - 60} -820 Q ${TX - TW - 160} -880 ${TX - TW - 260} -870`} stroke={INK} strokeWidth={30} strokeLinecap="round" fill="none" />
    <path d={`M ${TX - TW - 60} -820 Q ${TX - TW - 160} -880 ${TX - TW - 260} -870`} stroke="#99693D" strokeWidth={18} strokeLinecap="round" fill="none" />
    <ellipse cx={TX - TW - 280} cy={-900} rx={110} ry={70} fill="#5FAE4A" stroke={INK} strokeWidth={8} />
  </W>
);
/** the pillow taped to the trunk (his fix). drop = 0..1 slides off at the end. */
const Pillow: React.FC<{s: number; squish: number; drop: number}> = ({s, squish, drop}) => s > 0.01 ? (
  <W><g transform={`translate(${TX - TW - 4 - 30 * drop} ${-238 + 260 * drop * drop}) rotate(${-14 * drop}) scale(${s * (1 - 0.25 * squish)} ${s * (1 + 0.08 * squish)})`}>
    <path d="M -26 -82 Q -40 0 -26 82 Q 0 92 18 82 Q 30 0 18 -82 Q 0 -92 -26 -82 Z" fill="url(#wPillow)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -14 -60 Q -20 0 -14 60" stroke="#B9CCE6" strokeWidth={5} fill="none" strokeLinecap="round" />
    {drop < 0.05 ? <><rect x={-6} y={-96} width={40} height={20} rx={3} fill="#E9D9A6" stroke={INK} strokeWidth={4} transform="rotate(-8)" />
      <rect x={-6} y={74} width={40} height={20} rx={3} fill="#E9D9A6" stroke={INK} strokeWidth={4} transform="rotate(6)" /></> : null}
  </g></W>
) : null;
const CastShadow: React.FC<{x: number; w: number}> = ({x, w}) => <W><ellipse cx={x - w * 0.12} cy={6} rx={w * 0.6} ry={22} fill="#2F5A20" opacity={0.3} /></W>;

// ---------- the guy's head, drawn in code: beak + red crest ----------
type HeadMood = 'calm' | 'worried' | 'dizzy' | 'happy' | 'ko' | 'wince';
const GuyHead: React.FC<{x: number; y: number; mood?: HeadMood; t: number; rot?: number; beakS?: number}> = ({x, y, mood = 'calm', t, rot = 0, beakS = 1}) => {
  const R = HEAD_R;
  const eye = (ex: number, ey: number, r: number) => {
    if (mood === 'dizzy') return <path key={ex} transform={`translate(${ex} ${ey}) rotate(${t * 900 + ex * 10})`} d={`M 0 0 m -8 0 a 8 8 0 1 1 8 8 a 12 12 0 1 1 -12 -12`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    if (mood === 'ko') return <path key={ex} transform={`translate(${ex} ${ey})`} d="M -9 -9 L 9 9 M 9 -9 L -9 9" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
    if (mood === 'happy') return <path key={ex} transform={`translate(${ex} ${ey})`} d="M -10 4 Q 0 -8 10 4" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'wince') return <path key={ex} transform={`translate(${ex} ${ey})`} d="M -10 -6 L 8 0 L -10 6" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    return <g key={ex}><ellipse cx={ex} cy={ey} rx={r * 0.8} ry={r} fill="#fff" stroke={INK} strokeWidth={4.5} /><circle cx={ex + 3} cy={ey + 1} r={r * 0.48} fill={INK} /><circle cx={ex + 1} cy={ey - 2} r={2} fill="#fff" /></g>;
  };
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
      {/* red crest: a cap over the back of the head + a tuft */}
      <path d={`M ${-R * 0.95} ${-R * 0.25} A ${R} ${R} 0 0 1 ${R * 0.35} ${-R * 0.94} Q ${-R * 0.1} ${-R * 1.45} ${-R * 0.75} ${-R * 1.12} Q ${-R * 0.95} ${-R * 0.95} ${-R * 1.15} ${-R * 0.9} Q ${-R * 1.05} ${-R * 0.6} ${-R * 0.95} ${-R * 0.25} Z`} fill={CREST} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <circle r={R + 1} fill="url(#wFace)" stroke={INK} strokeWidth={6.5} />
      <path d={`M ${-R * 0.98} ${-R * 0.2} A ${R} ${R} 0 0 1 ${R * 0.3} ${-R * 0.95} Q ${-R * 0.2} ${-R * 0.55} ${-R * 0.98} ${-R * 0.2} Z`} fill={CREST} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* beak, pointing right */}
      <g transform={`translate(${R * 0.82} 10) scale(${beakS})`}>
        <path d="M -6 -22 L 78 2 L -6 20 Q -14 0 -6 -22 Z" fill={BEAK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -4 -18 L 74 1 L -4 -2 Z" fill={BEAK2} />
        <path d="M -8 0 L 72 2" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      </g>
      {/* brows + eyes, shifted toward the beak (3/4 view) */}
      {mood === 'worried' || mood === 'wince' ? <><path d="M 2 -42 L 24 -34" stroke={INK} strokeWidth={5.5} strokeLinecap="round" /><path d="M 36 -34 L 56 -42" stroke={INK} strokeWidth={5.5} strokeLinecap="round" /></> : null}
      {mood === 'calm' || mood === 'happy' ? <><path d="M 2 -38 Q 14 -46 26 -38" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /><path d="M 34 -38 Q 46 -46 58 -38" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /></> : null}
      {eye(13, -14, 14)}{eye(46, -14, 12)}
      {/* mouth under the beak */}
      <g transform="translate(22 42)">
        {mood === 'calm' ? <path d="M -12 -2 Q 0 7 12 -2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'happy' ? <path d="M -15 -4 Q 0 14 15 -4 Z" fill="#E4677A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
        {mood === 'worried' ? <ellipse cx={0} cy={1} rx={8} ry={10} fill="#5A2328" stroke={INK} strokeWidth={5} /> : null}
        {mood === 'wince' ? <path d="M -13 0 L -6 -4 L 0 2 L 6 -4 L 13 0" stroke={INK} strokeWidth={4.5} fill="none" strokeLinejoin="round" strokeLinecap="round" /> : null}
        {mood === 'dizzy' || mood === 'ko' ? <path d="M -14 2 Q -7 -6 0 2 Q 7 10 14 2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      </g>
    </g></W>
  );
};
const headOf = (pose: Pose) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s, hy: (m.head[1] - m.feet[1]) * s};
};

// ---------- the woodpecker (clings to the right side of the trunk, faces left) ----------
type BirdMood = 'smug' | 'wide' | 'laugh' | 'side';
const Woodpecker: React.FC<{t: number; peck: number; mood?: BirdMood; s?: number; x?: number; y?: number}> = ({t, peck, mood = 'smug', s = 1, x = TX + TW + 6, y = WPY}) => {
  const lean = -26 * peck;                       // whole head + neck swing into the bark
  const bob = mood === 'laugh' ? 4 * Math.sin(t * 40) : 0;
  return (
    <W><g transform={`translate(${x} ${y + bob}) scale(${s})`}>
      {/* stiff tail propped on the bark */}
      <path d="M 18 40 L 4 128 L 24 132 L 40 46 Z" fill="#1E1E22" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* feet gripping */}
      <path d="M 4 34 l -14 -4 M 4 34 l -14 8 M 8 54 l -14 -2 M 8 54 l -12 10" stroke={INK} strokeWidth={5} strokeLinecap="round" />
      {/* body */}
      <path d="M 6 -70 Q 70 -60 66 10 Q 62 60 22 64 Q -4 60 2 10 Z" fill="#1E1E22" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 8 -40 Q 30 0 12 58" stroke="#F5F2EA" strokeWidth={18} fill="none" strokeLinecap="round" />
      {[[-34, 40], [-10, 46], [14, 44]].map(([yy, xx], i) => <circle key={i} cx={xx} cy={yy} r={7} fill="#F5F2EA" />)}
      {/* head, pivoting at the neck */}
      <g transform={`translate(18 -66) rotate(${lean})`}>
        <circle cx={0} cy={-26} r={36} fill="#1E1E22" stroke={INK} strokeWidth={7} />
        <path d="M -20 -10 Q -4 4 22 -6 Q 10 -20 -20 -10 Z" fill="#F5F2EA" />
        <path d="M -22 -40 Q 0 -54 30 -40" stroke="#F5F2EA" strokeWidth={9} fill="none" strokeLinecap="round" />
        {/* red crest tuft */}
        <path d="M -6 -60 Q 22 -86 46 -50 Q 36 -40 18 -46 Q 6 -48 -6 -60 Z" fill={CREST} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {/* beak to the left */}
        <path d="M -30 -34 L -92 -24 L -30 -14 Z" fill={BEAK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -30 -24 L -90 -24" stroke={INK} strokeWidth={3.5} />
        {/* eye */}
        {mood === 'laugh'
          ? <path d="M -16 -32 Q -8 -40 0 -32" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" />
          : <><circle cx={-8} cy={-32} r={11} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={mood === 'side' ? -3 : -11} cy={-31} r={5.5} fill={INK} /></>}
        {mood === 'smug' || mood === 'side' ? <path d="M -22 -46 Q -8 -40 6 -44" stroke="#fff" strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'laugh' ? <path d="M -30 -18 Q -20 -6 -8 -12" stroke="#fff" strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
      </g>
    </g></W>
  );
};
/** the woodpecker's drumming: fast peck rate (drawn at 10 Hz so each hit reads at 60 fps) */
const drumAt = (t: number, on: boolean) => on ? Math.max(0, Math.sin(t * 2 * Math.PI * 10)) : 0;

// ---------- inserts (screen space) ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: '50%', top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const XGrid: React.FC<{r: number}> = ({r}) => (
  <>{Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
    <rect x={-450} y={-450} width={900} height={900} fill="none" />{r}</>
);

/** X-RAY of the woodpecker's skull: the spring people imagine gets a red X, then the skull reads as a hammer */
const SkullXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 350;
  const beat = drumAt(t, true);
  const xS = popIn(t, T.no + 0.05, 0.3), hamS = popIn(t, T.stiff, 0.35);
  const sx = -10 * beat;
  return (
    <div style={{position: 'absolute', left: 540, top: 1060, transform: `translate(-50%,-50%) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <clipPath id="sxr"><circle r={R} /></clipPath>
        <circle r={R + 18} fill={INK} />
        <g clipPath="url(#sxr)">
          <rect x={-450} y={-450} width={900} height={900} fill="#16223A" />
          <XGrid r={0} />
          {/* bark on the left */}
          <rect x={-450} y={-450} width={150} height={900} fill="#5B4126" opacity={0.6} />
          <path d="M -300 -450 V 450" stroke="#EAF4FF" strokeWidth={6} />
          {/* the skull, hammering left */}
          <g transform={`translate(${60 + sx * 4} 20)`}>
            {/* the hammer ghost behind the skull */}
            {hamS > 0.01 ? <g opacity={0.9 * Math.min(1, hamS)} transform={`scale(${hamS})`}>
              <rect x={20} y={40} width={34} height={260} rx={10} fill={GOLD} fillOpacity={0.25} stroke={GOLD} strokeWidth={8} />
              <rect x={-120} y={-80} width={250} height={120} rx={18} fill={GOLD} fillOpacity={0.18} stroke={GOLD} strokeWidth={8} />
            </g> : null}
            <circle cx={40} cy={-20} r={110} fill="#EAF4FF" fillOpacity={0.12} stroke="#EAF4FF" strokeWidth={7} />
            <path d="M -60 -60 L -320 -14 L -60 30" fill="#EAF4FF" fillOpacity={0.12} stroke="#EAF4FF" strokeWidth={7} strokeLinejoin="round" />
            <circle cx={-10} cy={-30} r={26} fill="none" stroke="#EAF4FF" strokeWidth={6} />
            {/* the tiny brain */}
            <path d="M 50 -60 Q 90 -78 112 -40 Q 124 -6 96 8 Q 62 18 44 -6 Q 30 -40 50 -60 Z" fill="#F6A6B8" stroke={INK} strokeWidth={5} />
            {/* the imagined spring between beak and brain, crossed out */}
            <path d={`M -60 -16 ${Array.from({length: 8}, (_, i) => `L ${-50 + i * 12} ${i % 2 ? -36 : 4}`).join(' ')} L 46 -16`} stroke="#9FD3FF" strokeWidth={7} fill="none" strokeLinejoin="round" opacity={0.85} />
            {xS > 0.01 ? <g transform={`translate(-6 -16) scale(${xS})`}><path d="M -60 -60 L 60 60 M 60 -60 L -60 60" stroke={RED} strokeWidth={22} strokeLinecap="round" /></g> : null}
          </g>
          {/* impact flash on each hit */}
          {beat > 0.8 ? <g transform="translate(-300 6)">{[0, 40, -40, 80, -80].map((a) => <path key={a} transform={`rotate(${a})`} d="M 10 0 L 60 0" stroke={GOLD} strokeWidth={8} strokeLinecap="round" />)}</g> : null}
          <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.25} />
        </g>
        <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
      </svg>
      <Card text="X-RAY" top={70} />
      <Card text={hamS > 0.01 ? 'STIFF HAMMER' : 'NO SHOCK ABSORBER'} top={830} color={hamS > 0.01 ? GOLD : RED} fg={hamS > 0.01 ? INK : '#fff'} rot={2} s={Math.max(xS, hamS)} size={56} />
    </div>
  );
};

/** YOUR BRAIN: a human head hits the bark; the big brain lags and slams the front of the skull */
const BrainXRay: React.FC<{t: number; s: number; hits: number[]}> = ({t, s, hits}) => {
  if (s < 0.01) return null;
  const R = 330;
  const p = pecks(t, hits), lh = lastHit(t, hits), since = t - lh;
  const slosh = since >= 0 && since < 0.6 ? Math.sin(since * 22) * Math.exp(-since * 6) : 0;
  const flash = since >= 0 && since < 0.25 ? 1 - since / 0.25 : 0;
  const concS = popIn(t, T.concussion, 0.3);
  return (
    <div style={{position: 'absolute', left: 540, top: 1060, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s})`}}>
      <svg width={800} height={800} viewBox="-400 -400 800 800" style={{overflow: 'visible'}}>
        <clipPath id="bxr"><circle r={R} /></clipPath>
        <circle r={R + 16} fill={INK} />
        <g clipPath="url(#bxr)">
          <rect x={-400} y={-400} width={800} height={800} fill="#16223A" />
          {Array.from({length: 11}, (_, i) => <path key={i} d={`M ${-400 + i * 80} -400 V 400 M -400 ${-400 + i * 80} H 400`} stroke="#2A3A5C" strokeWidth={3} />)}
          <rect x={240} y={-400} width={160} height={800} fill="#5B4126" opacity={0.6} />
          <path d="M 240 -400 V 400" stroke="#EAF4FF" strokeWidth={6} />
          <g transform={`translate(${-20 + 36 * p} 10)`}>
            {/* skull outline (side view, facing right) with the beak */}
            <circle cx={0} cy={0} r={190} fill="#EAF4FF" fillOpacity={0.1} stroke="#EAF4FF" strokeWidth={8} />
            <path d="M 170 40 L 262 62 L 166 90" fill="#EAF4FF" fillOpacity={0.12} stroke="#EAF4FF" strokeWidth={7} strokeLinejoin="round" />
            {/* the big brain, lagging behind then slamming forward */}
            <g transform={`translate(${-40 * p + 48 * slosh} 0)`}>
              <path d="M -150 30 Q -176 -40 -120 -92 Q -100 -150 -30 -138 Q 20 -170 78 -128 Q 150 -120 150 -50 Q 176 10 132 60 Q 116 118 50 110 Q 0 138 -50 110 Q -130 116 -150 30 Z" fill="#F6A6B8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
              <path d="M -90 -40 Q -60 -66 -30 -40 M 10 -96 Q 20 -50 64 -56 M -70 40 Q -30 14 6 42 M 60 20 Q 90 50 116 18" stroke="#C9627C" strokeWidth={6} fill="none" strokeLinecap="round" />
            </g>
            {flash > 0.01 ? <circle cx={150} cy={0} r={70 + 60 * (1 - flash)} fill="none" stroke={RED} strokeWidth={14 * flash + 2} opacity={flash} /> : null}
          </g>
          <rect x={-400} y={((t * 520) % 800) - 400} width={800} height={14} fill="#9FD3FF" opacity={0.22} />
        </g>
        <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={18} />
      </svg>
      <Card text="YOUR BRAIN" top={54} size={50} />
      <Card text="CONCUSSION" top={740} color={RED} fg="#fff" rot={2} s={concS} size={58} />
    </div>
  );
};

/** BRAIN SIZE: woodpecker vs you; both take a hit, the tiny one barely moves, the big one sloshes */
const SizePanel: React.FC<{t: number; s: number; hits: number[]}> = ({t, s, hits}) => {
  if (s < 0.01) return null;
  const tinyS = popIn(t, T.tiny, 0.35);
  const lh = lastHit(t, hits), since = t - lh, p = pecks(t, hits);
  const slosh = since >= 0 && since < 0.7 ? Math.sin(since * 20) * Math.exp(-since * 5) : 0;
  const ouch = t > T.small ? pulse(t, lh, 0.4) : 0;
  const okS = popIn(t, T.feel, 0.3);
  return (
    <div style={{position: 'absolute', left: 540, top: 1080, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={880} height={760} viewBox="-440 -380 880 760" style={{overflow: 'visible'}}>
        <rect x={-420} y={-360} width={840} height={720} rx={46} fill="#FFFDF6" stroke={INK} strokeWidth={10} />
        <text x={0} y={-280} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={80} fill={INK}>BRAIN SIZE</text>
        <path d="M 0 -230 V 330" stroke={INK} strokeWidth={5} strokeDasharray="18 14" />
        <text x={-210} y={-185} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>WOODPECKER</text>
        <text x={210} y={-185} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={46} fill={INK}>YOU</text>
        {/* woodpecker head: small skull, tiny brain */}
        <g transform={`translate(${-190 - 14 * p} 20)`}>
          <circle r={90} fill="#EEE9DF" stroke={INK} strokeWidth={7} />
          <path d="M -80 -10 L -170 4 L -80 22" fill={BEAK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <g transform={`scale(${0.4 + 0.6 * Math.min(1, tinyS)})`}><path d="M 0 -26 Q 30 -30 34 0 Q 32 26 4 26 Q -24 26 -26 2 Q -26 -24 0 -26 Z" fill="#F6A6B8" stroke={INK} strokeWidth={5} /></g>
        </g>
        {/* your head: big brain, sloshes on the hit */}
        <g transform={`translate(${210 + 14 * p} 20)`}>
          <circle r={130} fill="#EEE9DF" stroke={INK} strokeWidth={7} />
          <g transform={`translate(${-30 * slosh} 0)`}>
            <path d="M -104 20 Q -120 -30 -84 -64 Q -70 -104 -20 -96 Q 14 -118 54 -90 Q 104 -84 104 -34 Q 122 6 92 42 Q 80 82 34 76 Q 0 96 -34 76 Q -90 80 -104 20 Z" fill="#F6A6B8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
            <path d="M -60 -26 Q -40 -44 -20 -26 M 8 -66 Q 14 -34 44 -38 M -48 28 Q -20 10 4 30" stroke="#C9627C" strokeWidth={5} fill="none" strokeLinecap="round" />
          </g>
        </g>
        {/* hit marks */}
        {p > 0.6 ? <><path d="M -380 20 l 40 -14 M -380 20 l 40 14" stroke={GOLD} strokeWidth={9} strokeLinecap="round" /><path d="M 380 20 l -40 -14 M 380 20 l -40 14" stroke={GOLD} strokeWidth={9} strokeLinecap="round" /></> : null}
        {okS > 0.01 ? <g transform={`translate(-210 250) scale(${okS})`}><circle r={46} fill="#3FAE5A" stroke={INK} strokeWidth={7} /><path d="M -20 0 L -4 16 L 22 -16" stroke="#fff" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g> : null}
        {okS > 0.01 ? <g transform={`translate(210 250) scale(${okS})`}><circle r={46} fill={RED} stroke={INK} strokeWidth={7} /><path d="M -16 -16 L 16 16 M 16 -16 L -16 16" stroke="#fff" strokeWidth={10} strokeLinecap="round" /></g> : null}
        {ouch > 0.01 ? <text x={300} y={-110} transform={`rotate(10 300 -110)`} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60 * ouch} fill={RED} stroke={INK} strokeWidth={6} style={{paintOrder: 'stroke'}}>OUCH</text> : null}
      </svg>
      <Card text="TINY" top={210} color={GOLD} rot={-6} s={pulse(t, T.tiny, 0.9)} size={60} />
    </div>
  );
};

/** live counter on the woodpecker: PECKS / SECOND 0 -> 20 */
const Counter: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const n = Math.round(20 * seg(t, T.twenty - 0.05, T.twenty + 1.0));
  const done = n >= 20;
  return (
    <div style={{position: 'absolute', left: 540, top: 1420, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s * (done ? 1 + 0.06 * Math.max(0, 1 - (t - T.twenty - 1.0) * 4) : 1)})`,
      background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 34, padding: '10px 34px 14px', boxShadow: `0 10px 0 ${INK}`, textAlign: 'center', fontFamily: FONT, color: INK}}>
      <div style={{fontWeight: 900, fontSize: 132, lineHeight: 1, color: done ? RED : INK}}>{n}</div>
      <div style={{fontWeight: 900, fontSize: 44, letterSpacing: 1}}>PECKS A SECOND</div>
    </div>
  );
};

// ---------- the story over time ----------
// his pecks into the trunk (pillow from 15.3 on); frame 0 is the first one, the loop's next peck hits bare wood again
const PILLOW_PECKS = [T.pecks, 15.95, 16.6, 17.25, 17.9, 18.55];
const BRAIN_HITS = [9.25, 9.75, 10.25, 10.75];
const SIZE_HITS = [12.85, 13.45, 14.05];
type GuyState = {x: number; rot: number; fwd: number; mood: HeadMood; tremble: number};
const guyAt = (t: number): GuyState => {
  const base: GuyState = {x: GX, rot: 0, fwd: 0, mood: 'calm', tremble: 0};
  if (t < 0.32) return {...base, fwd: 1 - eio(seg(t, 0.12, 0.32)), mood: 'wince'};          // frame 0: beak in the bark
  if (t < 2.55) return {...base, rot: 6 * Math.sin((t - 0.3) * 5), mood: 'dizzy'};           // dizzy wobble
  if (t < 3.5) {                                                                              // keels over backwards, stiff
    const u = seg(t, 2.55, 3.05);
    return {...base, rot: -92 * (u * u), mood: t > 2.9 ? 'ko' : 'dizzy'};
  }
  if (t < 8.9) return {...base, mood: 'worried'};
  if (t < 10.9) return {...base, fwd: pecks(t, BRAIN_HITS), mood: t > 9.3 ? 'wince' : 'worried'};
  if (t < T.so) return {...base, mood: t > T.small ? 'worried' : 'calm'};
  const p = pecks(t, PILLOW_PECKS);
  if (t < 19.3) return {...base, fwd: p, mood: t > T.pecks ? 'happy' : 'calm'};
  // the pillow slipped: the next peck (into the loop push) lands on bare wood = frame 0
  return {...base, fwd: eout(seg(t, 19.55, 19.7)), mood: 'calm'};
};
const birdAt = (t: number): {peck: number; mood: BirdMood} => {
  if (t < 2.55) return {peck: drumAt(t, true), mood: 'smug'};
  if (t < 3.5) return {peck: 0, mood: 'laugh'};
  if (t < 5.75) return {peck: drumAt(t, t > T.it), mood: 'smug'};
  if (t < T.so) return {peck: drumAt(t, true), mood: 'smug'};
  if (t < 19.3) return {peck: t > 15.0 && t < 16.0 ? 0 : drumAt(t, true), mood: t < 16.0 ? 'side' : 'smug'};
  return {peck: drumAt(t, true), mood: 'smug'};
};

export const WoodScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: -70, y: -230, k: 2.6}, {t: 2.5, x: -78, y: -232, k: 2.7},          // both big: his beak in the bark + the woodpecker
    {t: 2.55, x: -250, y: -190, k: 2.0}, {t: 3.45, x: -265, y: -185, k: 2.05},    // he keels over
    {t: 3.5, x: TX + 120, y: -300, k: 3.3}, {t: 5.75, x: TX + 120, y: -300, k: 3.55}, // the woodpecker drums (counter)
    {t: 5.8, x: TX + 100, y: -320, k: 2.4}, {t: 8.9, x: TX + 100, y: -320, k: 2.5},  // behind the skull X-ray
    {t: 8.95, x: GX + 40, y: -250, k: 2.9}, {t: 10.85, x: GX + 40, y: -250, k: 3.05}, // his face, behind YOUR BRAIN
    {t: 10.9, x: -60, y: -270, k: 2.0}, {t: 14.65, x: -60, y: -270, k: 2.08},      // behind BRAIN SIZE
    {t: 14.7, x: GX + 100, y: -250, k: 3.0}, {t: 16.1, x: GX + 100, y: -250, k: 3.1}, // he pecks the pillow
    {t: 16.15, x: -68, y: -236, k: 2.5}, {t: 19.6, x: -70, y: -230, k: 2.6},      // back to the frame-0 shot
  ], t);
  const sh = shake(t, hit(t, 0, 9, 7) + hit(t, 3.05, 8, 6) + hit(t, 19.7, 9, 7));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t);
  const pose: Pose = 'front_calm';
  const h = headOf(pose);
  const r = g.rot * D2R;
  const lean = 7 * g.fwd;                                           // head leans into each peck
  const headX = GX + h.hx * Math.cos(r) - h.hy * Math.sin(r) + 22 * g.fwd, headY = h.hx * Math.sin(r) + h.hy * Math.cos(r) + 4 * g.fwd;
  const b = birdAt(t);
  // inserts
  const counterS = popIn(t, T.twenty - 0.15, 0.3) * (1 - seg(t, 5.55, 5.75));
  const skullS = popIn(t, 5.8, 0.35) * (1 - seg(t, 8.7, 8.92));
  const brainS = popIn(t, 8.95, 0.35) * (1 - seg(t, 10.7, 10.9));
  const sizeS = popIn(t, 10.9, 0.35) * (1 - seg(t, 14.45, 14.68));
  // pillow
  const pillowS = popIn(t, T.so + 0.05, 0.3);
  const pillowDrop = seg(t, 19.3, 19.62);
  const pillowSquish = pecks(t, PILLOW_PECKS);
  const pillowOn = t > T.so && t < 19.66;
  // stickers
  const bonkS = t < 0.9 ? 1 - seg(t, 0.62, 0.85) : pulse(t, 19.7, 0.6);
  const koS = pulse(t, 3.0, 0.4);
  const flumpS = pulse(t, T.pecks, 0.55);
  const stars = t < 2.55 ? 1 : 0;
  const lastP = lastHit(t, PILLOW_PECKS);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#BFE3F3'}}>
      <Defs />
      <Layer cam={cam} z={3200} paper={false}><Backdrop t={t} /></Layer>
      <Layer cam={cam} z={1900}><Forest /></Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Ground />
        <CastShadow x={GX} w={150} />
        <CastShadow x={TX} w={200} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Trunk dents={t > 0 ? 1 : 0} />
        <Woodpecker t={t} peck={b.peck} mood={b.mood} />
        <Guy pose={pose} x={GX} y={0} t={t} rot={g.rot} breathe={false} tremble={g.tremble} />
        <GuyHead x={headX} y={headY} mood={g.mood} t={t} rot={g.rot + lean} />
        {pillowOn ? <Pillow s={pillowS} squish={pillowSquish} drop={pillowDrop} /> : null}
      </Layer>
      <Layer cam={cam} z={1000} paper={false}>
        {/* wood chips flying off the frame-0 hit (and the loop hit) */}
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const t0 = t > 19.6 ? 19.7 : 0, a = t - t0;
          if (a < 0 || a > 0.8) return null;
          const vx = -120 - 260 * rnd(i * 5), vy = -380 - 300 * rnd(i * 9);
          const x = TX - TW + vx * a, y = -238 + vy * a + 900 * a * a;
          return <W key={i}><rect x={x - 9} y={y - 5} width={18} height={10} rx={3} fill="#C9965E" stroke={INK} strokeWidth={4} transform={`rotate(${a * 700 + i * 50} ${x} ${y})`} /></W>;
        })}
        {pillowOn ? <Puffs t={t} born={lastP} x={TX - TW - 20} y={-240} n={6} life={0.9} size={18} vx={-60} vy={-120} seed={Math.round(lastP * 10)} /> : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 5 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={headX + Math.cos(a) * 82} y={headY - 82 + Math.sin(a) * 16} s={stars * 0.55} rot={t * 200} />;
        })}
        <Txt x={TX - 30} y={-110} s={bonkS} text="BONK" size={88} rot={-10} fill={GOLD} />
        <Txt x={-330} y={-170} s={koS} text="K.O." size={92} rot={-6} fill={GOLD} />
        <Txt x={TX - TW - 60} y={-380} s={flumpS} text="FLUMP" size={70} rot={-8} fill={GOLD} />
        {/* the woodpecker's speed lines while it drums */}
        {b.peck > 0.5 ? <W><path d={`M ${TX + TW + 14} -340 l -24 -16 M ${TX + TW + 14} -300 l -28 0 M ${TX + TW + 14} -262 l -24 16`} stroke={INK} strokeWidth={6} strokeLinecap="round" /></W> : null}
      </Layer>
      <Counter t={t} s={counterS} />
      <SkullXRay t={t} s={skullS} />
      <BrainXRay t={t} s={brainS} hits={BRAIN_HITS} />
      <SizePanel t={t} s={sizeS} hits={SIZE_HITS} />
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you had a woodpecker's head??" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.shark} until={19.3} text="Shark teeth or octopus arms?" />
      </>}
    </AbsoluteFill>
  );
};

export const WoodVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const count: Cue[] = [];
  for (let i = 1; i <= 20; i++) count.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.twenty - 0.05, T.twenty + 1.0, i / 20), db: -29});
  // the woodpecker's drumming: soft taps in bursts where it is on screen and drumming
  const drum: Cue[] = [];
  const burst = (a: number, b: number, db: number) => { for (let x = a; x < b; x += 0.1) drum.push({f: 'peck.wav', at: x, db}); };
  burst(0.05, 1.2, -30); burst(3.55, 5.5, -24); burst(6.0, 8.6, -34);
  const cues: Cue[] = [
    {f: 'crack.wav', at: 0, db: -14}, {f: 'twang.mp3', at: 0, db: -18, to: 0.5}, {f: 'whoosh.wav', at: 0, db: -22},
    {f: 'chirp.wav', at: 0.6, db: -30}, {f: 'chirp.wav', at: 1.5, db: -32},
    {f: 'whoosh.wav', at: 2.6, db: -22}, {f: 'crack.wav', at: 3.05, db: -18}, {f: 'pop.wav', at: 3.0, db: -22}, {f: 'crowd_laugh.wav', at: 3.1, db: -32, to: 1.2},
    ...drum, {f: 'pop.wav', at: T.twenty - 0.15, db: -24}, ...count, {f: 'ding.mp3', at: T.twenty + 1.02, db: -22},
    {f: 'zap.wav', at: 5.8, db: -26}, {f: 'pop.wav', at: T.no + 0.05, db: -20}, {f: 'pop.wav', at: T.stiff, db: -20}, {f: 'twang.mp3', at: T.stiff, db: -30, to: 0.4},
    {f: 'zap.wav', at: 8.95, db: -26}, ...BRAIN_HITS.map((x): Cue => ({f: 'crack.wav', at: x, db: -24})), {f: 'horn.wav', at: T.concussion, db: -30, to: 0.6},
    {f: 'whoosh.wav', at: 10.88, db: -28}, {f: 'pop.wav', at: T.tiny, db: -20}, ...SIZE_HITS.map((x): Cue => ({f: 'crack.wav', at: x, db: -28})), {f: 'ding.mp3', at: T.feel, db: -26},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: 14.68, db: -28}, {f: 'pop.wav', at: T.so + 0.05, db: -24},
    ...PILLOW_PECKS.map((x, i): Cue => ({f: 'pop.wav', at: x, db: i ? -32 : -24})), {f: 'giggle.mp3', at: 15.5, db: -32, to: 1.0},
    {f: 'whoosh.wav', at: 16.1, db: -30}, {f: 'whoosh.wav', at: 19.32, db: -30},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<WoodScene t={0} />}>
        <WoodScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="woodpecker/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const WoodWide: React.FC = () => <WideFit.Provider value={0.72}><WoodVideo /></WideFit.Provider>;
