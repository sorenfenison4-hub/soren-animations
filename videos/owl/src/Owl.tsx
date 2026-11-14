// "What if you had an owl's eyes?" - a what-if Short about YOU, built on what made the zebra Short work: the guy DOES
// something (chases a fly with his head), an animal co-star with a face and a mood (a smug owl on a post), a comedy hit
// mid-video (head whip -> dizzy stars + laugh), a POV / inside insert (X-RAY of his tube eyes), a versus counter
// (NECK BONES 14 vs 7), a sticker word every ~1.5 s, a funny ending that loops (he turns his whole body the slow way,
// ending on the frame-0 head whip), and a comment question that invites suggestions.
// Frame 0: the guy big and upright with huge owl eyes, his head already whipping after a fly, the owl beside him with
// its head turned backwards. Everything drawn in code; the guy's body is the library sprite, his head is drawn in code
// so it can turn (features slide around the round head).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Guy, swap, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle, CommentAsk} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py; times below are video time). Last word ends ~21.4 s; + 0.85 s for the loop push.
export const DURATION = 22.25;
export const T = {
  eyes: 0.93, never: 1.99, move: 2.29, again: 2.82,                         // "Get an owl's eyes, and you'd never move them again."
  tubes: 3.53, locked: 4.33, skull: 5.01,                                   // "They're tubes, locked in your skull."
  so: 5.68, fly: 6.29, swing: 7.31, head: 8.06,                             // "So to watch a fly, you'd swing your whole head."
  owl: 8.70, turns: 9.08, two: 9.53, degrees: 10.59,                        // "An owl turns two hundred and seventy degrees,"
  with: 11.46, fourteen: 11.65, bones: 12.67, you: 13.19, seven: 13.76,     // "with fourteen neck bones. You have seven."
  twist: 14.23, far: 14.80, tear: 15.63, artery: 16.08, brain: 16.99,      // "Twist that far, and you could tear an artery to your brain."
  owls: 17.48, arteries: 18.04, room: 18.65, spare: 18.99,                  // "The owl's arteries have room to spare."
  so2: 19.63, turns2: 20.01, slow: 20.76, way: 21.06,                       // "So he turns the slow way."
  cta: 16.95,
};

const GOLD = '#FFD43B', RED = '#E2453C', IRIS = '#FFC23A', IRIS2 = '#F08A1C';
const OWL = '#8C6A4B', OWL2 = '#6B4E35', OWL_L = '#E9D8BC', OWL_DISK = '#D9C09A';
const PX = 235, PY = -112;      // owl's feet on top of the post
const GX = 0;                   // guy's feet

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
const D2R = Math.PI / 180;
/** piecewise keys [t, v] with ease in-out between them */
const keysAt = (k: [number, number][], t: number, ease = eio) => {
  if (t <= k[0][0]) return k[0][1];
  for (let i = 0; i < k.length - 1; i++) if (t <= k[i + 1][0]) return lerp(k[i][1], k[i + 1][1], ease(seg(t, k[i][0], k[i + 1][0])));
  return k[k.length - 1][1];
};

const Defs: React.FC = () => (
  <W><defs>
    <linearGradient id="oSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7E86C9" /><stop offset="0.55" stopColor="#C9A6CF" /><stop offset="1" stopColor="#FFD3A8" /></linearGradient>
    <linearGradient id="oGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7DAE63" /><stop offset="1" stopColor="#5E8E4C" /></linearGradient>
    <radialGradient id="oMoon" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF8DC" stopOpacity={0.85} /><stop offset="0.45" stopColor="#FFF1B8" stopOpacity={0.3} /><stop offset="1" stopColor="#FFF1B8" stopOpacity={0} /></radialGradient>
    <linearGradient id="oBody" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#A07D5B" /><stop offset="0.6" stopColor={OWL} /><stop offset="1" stopColor={OWL2} /></linearGradient>
    <linearGradient id="oHead" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#A9845F" /><stop offset="1" stopColor={OWL2} /></linearGradient>
    <linearGradient id="oPost" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C29462" /><stop offset="1" stopColor="#8F6639" /></linearGradient>
    <radialGradient id="oFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <radialGradient id="oIris" cx="0.5" cy="0.5" r="0.5"><stop offset="0.35" stopColor={IRIS} /><stop offset="1" stopColor={IRIS2} /></radialGradient>
  </defs></W>
);

// ---------- the evening field ----------
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-4000} y={-5000} width={9000} height={5000} fill="url(#oSky)" />
    <g transform="translate(700 -1450)">
      <circle r={520} fill="url(#oMoon)" />
      <circle r={190} fill="#FFF4C9" stroke={INK} strokeWidth={9} />
      <circle cx={-50} cy={-40} r={34} fill="#F1E2A6" /><circle cx={60} cy={30} r={24} fill="#F1E2A6" /><circle cx={-10} cy={80} r={18} fill="#F1E2A6" />
    </g>
    {Array.from({length: 18}, (_, i) => {
      const x = -1800 + rnd(i * 5) * 3600, y = -2300 + rnd(i * 9) * 1100, s = 0.5 + 0.5 * Math.sin(t * 2 + i);
      return <path key={i} transform={`translate(${x} ${y}) scale(${0.6 + 0.4 * s})`} d="M 0 -18 Q 4 -4 18 0 Q 4 4 0 18 Q -4 4 -18 0 Q -4 -4 0 -18 Z" fill="#FFF6D0" stroke={INK} strokeWidth={4} />;
    })}
  </W>
);
const Hills: React.FC = () => (
  <W>
    <path d="M -3000 60 Q -2200 -420 -1300 -180 Q -700 -470 100 -230 Q 900 -500 1700 -210 Q 2500 -460 3300 -200 Q 4100 -430 5000 60 Z" fill="#7C8FB0" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {/* a far tree line */}
    {Array.from({length: 14}, (_, i) => {
      const x = -2400 + i * 380 + rnd(i) * 120, h = 260 + rnd(i * 3) * 160;
      return <g key={i} transform={`translate(${x} -60)`}>
        <rect x={-14} y={-h * 0.4} width={28} height={h * 0.4 + 40} fill="#4F5C78" stroke={INK} strokeWidth={6} />
        <ellipse cx={0} cy={-h * 0.62} rx={h * 0.32} ry={h * 0.4} fill="#5E6F92" stroke={INK} strokeWidth={7} />
      </g>;
    })}
    <path d="M -3000 60 Q -1800 -200 -600 -90 Q 600 -240 1900 -80 Q 3200 -240 5000 60 Z" fill="#6E8C6A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <rect x={-3000} y={55} width={8000} height={3000} fill="#6E8C6A" />
  </W>
);
const Ground: React.FC = () => (
  <W>
    <rect x={-4000} y={0} width={9000} height={3000} fill="url(#oGrass)" />
    <path d="M -4000 0 H 5000" stroke={INK} strokeWidth={8} />
    {Array.from({length: 70}, (_, i) => {
      const x = -2000 + rnd(i * 3) * 4400, y = 30 + rnd(i * 7) * 700;
      return <path key={i} d={`M ${x - 14} ${y} l 8 -26 l 6 22 l 8 -30 l 6 34`} stroke="#4F7A3F" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
  </W>
);
const Post: React.FC = () => (
  <W><g transform={`translate(${PX} 0)`}>
    <rect x={-30} y={PY} width={60} height={-PY + 10} fill="url(#oPost)" stroke={INK} strokeWidth={7} />
    <ellipse cx={0} cy={PY} rx={30} ry={9} fill="#D9B07E" stroke={INK} strokeWidth={6} />
    <path d="M -12 -60 Q -6 -40 -14 -20" stroke="#7A5530" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g></W>
);
const CastShadow: React.FC<{x: number; w: number}> = ({x, w}) => <W><ellipse cx={x - w * 0.12} cy={6} rx={w * 0.6} ry={22} fill="#24401A" opacity={0.3} /></W>;

// ---------- the guy's head, drawn in code so it can turn ----------
/** a feature at angle phi on the round head, for head yaw a (deg): x on screen and its width scale; null when it is round the back */
const onHead = (a: number, phi: number, R: number) => {
  const ang = a * D2R + phi, c = Math.cos(ang);
  if (c < 0.05) return null;
  return {x: R * Math.sin(ang), w: Math.max(0.25, c)};
};
type HeadMood = 'calm' | 'strain' | 'worried' | 'dizzy' | 'happy';
/** The guy's round head with owl eyes. yaw: 0 = facing us, +90 = facing screen right, 180 = back of the head. */
const GuyHead: React.FC<{x: number; y: number; yaw: number; roll?: number; mood?: HeadMood; t: number; sx?: number; sy?: number; nose?: number}> =
  ({x, y, yaw, roll = 0, mood = 'calm', t, sx = 1, sy = 1, nose = 0}) => {
    const R = HEAD_R;
    const eyes = [-0.44, 0.44].map((phi, i) => {
      const p = onHead(yaw, phi, R); if (!p) return null;
      const er = 23;
      return <g key={i} transform={`translate(${p.x} -6) scale(${p.w} 1)`}>
        <circle r={er + 6} fill="#EDE6DA" stroke={INK} strokeWidth={4} />
        <circle r={er} fill="url(#oIris)" stroke={INK} strokeWidth={5} />
        {mood === 'dizzy'
          ? <path d={`M 0 0 m -9 0 a 9 9 0 1 1 9 9 a 5 5 0 1 1 -4 -5`} transform={`rotate(${t * 900})`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
          : <><circle r={13} fill={INK} /><circle cx={-5} cy={-6} r={4.5} fill="#fff" /></>}
        {mood === 'strain' ? <path d={`M ${-er - 4} -4 L ${er + 4} -4`} stroke={INK} strokeWidth={0} /> : null}
      </g>;
    });
    const brows = [-0.44, 0.44].map((phi, i) => {
      const p = onHead(yaw, phi, R); if (!p) return null;
      const side = i ? 1 : -1;
      const tilt = mood === 'strain' ? 14 * side : mood === 'worried' ? -16 * side : 0;
      return <path key={i} transform={`translate(${p.x} -40) scale(${p.w} 1) rotate(${tilt})`} d="M -16 2 Q 0 -8 16 2" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    });
    const m = onHead(yaw, 0, R);
    const mouth = m ? <g transform={`translate(${m.x} 32) scale(${m.w} 1)`}>
      {mood === 'calm' ? <path d="M -16 -2 Q 0 10 16 -2" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /> : null}
      {mood === 'happy' ? <path d="M -18 -4 Q 0 16 18 -4 Z" fill="#E4677A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
      {mood === 'strain' ? <g><rect x={-18} y={-7} width={36} height={14} rx={5} fill="#fff" stroke={INK} strokeWidth={4.5} /><path d="M -18 0 H 18 M -6 -7 V 7 M 6 -7 V 7" stroke={INK} strokeWidth={3} /></g> : null}
      {mood === 'worried' ? <ellipse cx={0} cy={2} rx={10} ry={12} fill="#5A2328" stroke={INK} strokeWidth={5} /> : null}
      {mood === 'dizzy' ? <path d="M -16 2 Q -8 -6 0 2 Q 8 10 16 2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
    </g> : null;
    // back of the head: two little crease lines so a turned head still reads as turned
    const back = onHead(yaw, Math.PI, R);
    return (
      <W><g transform={`translate(${x} ${y}) rotate(${roll}) scale(${sx} ${sy})`}>
        <clipPath id="ghClip"><circle r={R} /></clipPath>
        <circle r={R + 1} fill="url(#oFace)" stroke={INK} strokeWidth={6.5} />
        <g clipPath="url(#ghClip)">
          <path d={`M ${R * 0.35} ${-R} A ${R} ${R} 0 0 1 ${R * 0.35} ${R} A ${R * 1.1} ${R * 1.1} 0 0 0 ${R * 0.35} ${-R} Z`} fill="#C9C5BF" opacity={0.35} />
          {back ? <g transform={`translate(${back.x} 30) scale(${back.w} 1)`} opacity={0.6}>
            <path d="M -12 -4 Q 0 4 12 -4" stroke="#9A958D" strokeWidth={4} fill="none" strokeLinecap="round" />
          </g> : null}
          {brows}{eyes}{mouth}
          {nose > 0.01 ? null : null}
        </g>
      </g></W>
    );
  };

/** where the head sits for a pose (feet at 0,0) */
const headOf = (pose: Pose, flip?: boolean) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s * (flip ? -1 : 1), hy: (m.head[1] - m.feet[1]) * s};
};

// ---------- the owl ----------
type OwlMood = 'calm' | 'smug' | 'wide';
/** owl standing with its feet at (x, y). yaw = head turn in degrees (0 = facing us; it goes to 270). */
const Owl: React.FC<{x: number; y: number; yaw: number; t: number; mood?: OwlMood; xray?: number; spin?: number}> = ({x, y, yaw, t, mood = 'calm', xray = 0}) => {
  const R = 60, HY = -178;
  const blink = (t % 3.7) > 3.58;
  const feats: React.ReactNode[] = [];
  // ear tufts (drawn behind the head outline when round the back)
  const tufts = [-0.62, 0.62].map((phi, i) => {
    const p = onHead(yaw, phi, R * 0.9);
    const ang = yaw * D2R + phi, tx = R * 0.9 * Math.sin(ang), front = Math.cos(ang) > -0.2;
    return <path key={i} transform={`translate(${tx} ${-R * 0.78}) scale(${Math.max(0.35, Math.abs(Math.cos(ang)) * 0.6 + 0.4) * (i ? 1 : -1)} 1)`}
      d="M -14 10 L 6 -46 L 18 6 Z" fill={front ? OWL2 : '#5A412B'} stroke={INK} strokeWidth={6} strokeLinejoin="round" opacity={p || !front ? 1 : 1} />;
  });
  // facial disk + eyes
  [-0.4, 0.4].forEach((phi, i) => {
    const p = onHead(yaw, phi, R); if (!p) return;
    feats.push(<g key={`d${i}`} transform={`translate(${p.x} -4) scale(${p.w} 1)`}>
      <circle r={27} fill={OWL_DISK} stroke={INK} strokeWidth={4} />
      {blink || mood === 'smug' ? <><circle r={17} fill={IRIS} stroke={INK} strokeWidth={5} /><path d={blink ? 'M -17 0 A 17 17 0 0 1 17 0 Z' : 'M -17 -1 A 17 17 0 0 1 17 -1 Z'} fill={OWL2} stroke={INK} strokeWidth={5} strokeLinejoin="round" /><circle cy={6} r={7} fill={INK} /></>
        : <><circle r={mood === 'wide' ? 20 : 17} fill="url(#oIris)" stroke={INK} strokeWidth={5} /><circle r={mood === 'wide' ? 11 : 9} fill={INK} /><circle cx={-4} cy={-5} r={3.5} fill="#fff" /></>}
    </g>);
  });
  const b = onHead(yaw, 0, R);
  if (b) feats.push(<g key="beak" transform={`translate(${b.x} 22) scale(${b.w} 1)`}><path d="M -9 -6 L 9 -6 L 0 16 Z" fill="#E6B34A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>);
  // feather chevrons on the back of the head
  [Math.PI - 0.35, Math.PI, Math.PI + 0.35].forEach((phi, i) => {
    const p = onHead(yaw, phi, R); if (!p) return;
    feats.push(<g key={`c${i}`} transform={`translate(${p.x} ${10 + (i === 1 ? 12 : 0)}) scale(${p.w} 1)`}><path d="M -10 -6 L 0 4 L 10 -6" stroke="#4A3524" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>);
  });
  const sway = 2 * Math.sin(t * 1.3);
  return (
    <W><g transform={`translate(${x} ${y})`}>
      {/* talons */}
      {[-18, 18].map((fx) => <path key={fx} d={`M ${fx - 12} 0 Q ${fx - 10} -12 ${fx} -12 Q ${fx + 10} -12 ${fx + 12} 0`} fill="#E6B34A" stroke={INK} strokeWidth={5} />)}
      {/* body */}
      <ellipse cx={0} cy={-78} rx={62} ry={84} fill="url(#oBody)" stroke={INK} strokeWidth={7} />
      <ellipse cx={0} cy={-62} rx={40} ry={58} fill={OWL_L} stroke={INK} strokeWidth={5} />
      {Array.from({length: 9}, (_, i) => {
        const cx = -22 + (i % 3) * 22, cy = -96 + Math.floor(i / 3) * 28;
        return <path key={i} d={`M ${cx - 6} ${cy} L ${cx} ${cy + 6} L ${cx + 6} ${cy}`} stroke="#9B7A55" strokeWidth={4} fill="none" strokeLinecap="round" />;
      })}
      {/* wings */}
      {[-1, 1].map((s) => <path key={s} transform={`scale(${s} 1)`} d="M 44 -140 Q 78 -90 66 -20 Q 50 -6 40 -24 Q 50 -80 44 -140 Z" fill={OWL2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
      {/* neck X-ray: roomy bone tunnels and a wavy artery with slack */}
      {xray > 0.01 ? <g transform={`translate(0 -132) scale(${xray})`}>
        <rect x={-34} y={-46} width={68} height={92} rx={22} fill="#1E2A44" stroke={INK} strokeWidth={6} />
        {[-30, -10, 10, 30].map((vy) => <g key={vy}><rect x={-22} y={vy - 7} width={44} height={14} rx={6} fill="#F4F1EA" stroke={INK} strokeWidth={3} /><ellipse cx={12} cy={vy} rx={8} ry={5.5} fill="#1E2A44" /></g>)}
        <path d={`M 12 -44 ${Array.from({length: 8}, (_, i) => `Q ${12 + (i % 2 ? 9 : -9) + 2 * Math.sin(t * 6 + i)} ${-38 + i * 11} 12 ${-33 + i * 11}`).join(' ')}`} stroke={RED} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g> : null}
      {/* head */}
      <g transform={`translate(0 ${HY}) rotate(${sway})`}>
        <clipPath id="owlClip"><circle r={R} /></clipPath>
        {tufts}
        <circle r={R} fill="url(#oHead)" stroke={INK} strokeWidth={7} />
        <g clipPath="url(#owlClip)">{feats}</g>
      </g>
    </g></W>
  );
};

// ---------- the fly (from the zebra Short) ----------
const Fly: React.FC<{x: number; y: number; t: number; s?: number; rot?: number; dizzy?: number}> = ({x, y, t, s = 1, rot = 0, dizzy = 0}) => {
  const up = Math.floor(t * 60) % 2 === 0;
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <ellipse cx={-4} cy={up ? -14 : -6} rx={14} ry={7} fill="#E8F4FF" opacity={0.85} stroke={INK} strokeWidth={2.5} transform={`rotate(${up ? -30 : 10} -4 -8)`} />
      <ellipse cx={-14} cy={0} rx={13} ry={9} fill="#2C2C30" stroke={INK} strokeWidth={3} />
      <circle cx={4} cy={-1} r={9} fill="#2C2C30" stroke={INK} strokeWidth={3} />
      <circle cx={9} cy={-3} r={5} fill="#D9443A" />
      <path d="M 4 4 L 16 12" stroke={INK} strokeWidth={2.5} strokeLinecap="round" /><circle cx={10} cy={-5} r={1.6} fill="#fff" />
      {dizzy > 0.01 ? null : null}
    </g></W>
  );
};

// ---------- inserts (screen space) ----------
/** X-RAY of his head from above: two long tube eyes held by rings of bone plates, padlocked in place */
const XRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const R = 360, tubeS = popIn(t, T.tubes, 0.35), lockS = popIn(t, T.locked, 0.3);
  const tube = (side: number) => {
    const ox = side * 92;
    return <g transform={`translate(${ox} -40) rotate(${side * 16})`}>
      {/* trumpet-shaped eye: wide cornea end at the front (top), narrow at the back */}
      <path d="M -70 -150 Q -78 -160 -60 -168 L 60 -168 Q 78 -160 70 -150 L 34 40 Q 30 70 0 70 Q -30 70 -34 40 Z" fill="#D7E9FF" fillOpacity={0.22} stroke="#EAF4FF" strokeWidth={7} strokeLinejoin="round" />
      <ellipse cx={0} cy={-170} rx={58} ry={18} fill="#9FD3FF" fillOpacity={0.5} stroke="#EAF4FF" strokeWidth={6} />
      {/* the ring of little bone plates */}
      {Array.from({length: 7}, (_, i) => <rect key={i} x={-64 + i * 3} y={-138 + i * 22} width={22} height={16} rx={4} transform={`rotate(-10 ${-64 + i * 3} ${-138 + i * 22})`} fill="#FFFFFF" stroke={INK} strokeWidth={3} />)}
      {Array.from({length: 7}, (_, i) => <rect key={'r' + i} x={42 - i * 3} y={-138 + i * 22} width={22} height={16} rx={4} transform={`rotate(10 ${42 - i * 3} ${-138 + i * 22})`} fill="#FFFFFF" stroke={INK} strokeWidth={3} />)}
      {lockS > 0.01 ? <g transform={`translate(0 -40) scale(${lockS})`}>
        <path d="M -20 -10 V -30 Q -20 -50 0 -50 Q 20 -50 20 -30 V -10" stroke={INK} strokeWidth={9} fill="none" />
        <path d="M -20 -10 V -30 Q -20 -50 0 -50 Q 20 -50 20 -30 V -10" stroke="#C9CFD8" strokeWidth={4} fill="none" />
        <rect x={-30} y={-12} width={60} height={46} rx={8} fill={GOLD} stroke={INK} strokeWidth={6} />
        <circle cx={0} cy={6} r={6} fill={INK} /><rect x={-3} y={6} width={6} height={14} fill={INK} />
      </g> : null}
    </g>;
  };
  return (
    <div style={{position: 'absolute', left: 540, top: 1060, transform: `translate(-50%,-50%) scale(${s})`}}>
      <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
        <clipPath id="xr"><circle r={R} /></clipPath>
        <circle r={R + 18} fill={INK} />
        <g clipPath="url(#xr)">
          <rect x={-450} y={-450} width={900} height={900} fill="#16223A" />
          {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
          {/* skull seen from above */}
          <circle cx={0} cy={30} r={250} fill="none" stroke="#EAF4FF" strokeWidth={10} strokeDasharray="30 14" />
          <ellipse cx={0} cy={150} rx={110} ry={80} fill="#EAF4FF" fillOpacity={0.12} stroke="#EAF4FF" strokeWidth={5} />
          <text x={0} y={162} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#EAF4FF">BRAIN</text>
          <g transform={`scale(${0.6 + 0.4 * tubeS})`} opacity={Math.min(1, 0.3 + tubeS)}>{tube(-1)}{tube(1)}</g>
          {/* scan line */}
          <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.25} />
        </g>
        <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
      </svg>
      <div style={{position: 'absolute', left: '50%', top: 60, transform: 'translate(-50%,-50%) rotate(-3deg)', background: '#fff', border: `8px solid ${INK}`, borderRadius: 26,
        padding: '8px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 56, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>X-RAY</div>
      {tubeS > 0.01 ? <div style={{position: 'absolute', left: '50%', top: 850, transform: `translate(-50%,-50%) rotate(2deg) scale(${tubeS})`, background: GOLD, border: `8px solid ${INK}`, borderRadius: 26,
        padding: '8px 30px', fontFamily: FONT, fontWeight: 900, fontSize: 60, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>TUBES, NOT BALLS</div> : null}
    </div>
  );
};

/** NECK BONES: owl 14 vs you 7, stacking up one by one */
const NeckPanel: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const owlN = Math.min(14, Math.floor(14 * seg(t, T.fourteen - 0.05, T.bones + 0.1) + 0.001));
  const youN = Math.min(7, Math.floor(7 * seg(t, T.you - 0.05, T.seven + 0.15) + 0.001));
  const col = (n: number, total: number, cx: number, color: string) => (
    <g>
      {Array.from({length: total}, (_, i) => {
        const on = i < n, y = 300 - i * 34;
        const pop = on ? 1 : 0;
        return pop ? <g key={i} transform={`translate(${cx} ${y})`}>
          <rect x={-70} y={-14} width={140} height={28} rx={11} fill={color} stroke={INK} strokeWidth={5} />
          <path d="M -70 0 L -92 -8 M 70 0 L 92 -8" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        </g> : null;
      })}
    </g>
  );
  return (
    <div style={{position: 'absolute', left: 540, top: 1040, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={880} height={980} viewBox="-440 -490 880 980" style={{overflow: 'visible'}}>
        <rect x={-420} y={-470} width={840} height={940} rx={46} fill="#FFFDF6" stroke={INK} strokeWidth={10} />
        <text x={0} y={-385} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={76} fill={INK}>NECK BONES</text>
        <path d="M 0 -330 V 420" stroke={INK} strokeWidth={5} strokeDasharray="18 14" />
        {col(owlN, 14, -200, '#E8D2AE')}
        {col(youN, 7, 200, '#FFFFFF')}
        <text x={-200} y={400} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={owlN === 14 ? '#E08A1E' : INK} stroke={INK} strokeWidth={owlN === 14 ? 5 : 0} style={{paintOrder: 'stroke'}}>{owlN}</text>
        <text x={200} y={400} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill={INK}>{youN}</text>
        <text x={-200} y={-300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>OWL</text>
        <text x={200} y={-300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={INK}>YOU</text>
      </svg>
    </div>
  );
};

/** the degree arc behind the owl's head while it turns */
const Dial: React.FC<{x: number; y: number; deg: number; s: number}> = ({x, y, deg, s}) => {
  if (s < 0.01) return null;
  const r = 105, a1 = -90 + deg;
  const large = deg > 180 ? 1 : 0;
  const ex = r * Math.cos(a1 * D2R), ey = r * Math.sin(a1 * D2R);
  return (
    <W><g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={r} fill="none" stroke="#FFFFFF" strokeWidth={6} strokeDasharray="10 12" opacity={0.7} />
      {deg > 1 ? <path d={`M 0 ${-r} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`} stroke={GOLD} strokeWidth={20} fill="none" strokeLinecap="round" /> : null}
      {deg > 1 ? <path d={`M 0 ${-r} A ${r} ${r} 0 ${large} 1 ${ex} ${ey}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.0} /> : null}
      <g transform={`translate(${ex} ${ey}) rotate(${a1 + 90})`}><path d="M -16 -14 L 16 0 L -16 14 Z" fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>
    </g></W>
  );
};

/** X-ray of HIS neck while he twists: the artery winds tighter round the bones, then tears */
const NeckXRay: React.FC<{t: number; s: number; twist: number; torn: boolean}> = ({t, s, twist, torn}) => {
  if (s < 0.01) return null;
  const R = 250;
  const pts = (y0: number, y1: number) => {
    const out: string[] = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40, y = lerp(y0, y1, u);
      const x = 70 * Math.sin(u * Math.PI * (1 + 5 * twist)) * (0.5 + 0.5 * (1 - twist * 0.6));
      out.push(`${i ? 'L' : 'M'} ${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    return out.join(' ');
  };
  const tearS = torn ? popIn(t, T.tear, 0.3) : 0;
  return (
    <div style={{position: 'absolute', left: 540, top: 1470, transform: `translate(-50%,-50%) rotate(2deg) scale(${s})`}}>
      <svg width={620} height={620} viewBox="-310 -310 620 620" style={{overflow: 'visible'}}>
        <clipPath id="nx"><circle r={R} /></clipPath>
        <circle r={R + 16} fill={INK} />
        <g clipPath="url(#nx)">
          <rect x={-310} y={-310} width={620} height={620} fill="#16223A" />
          {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${-310 + i * 78} -310 V 310 M -310 ${-310 + i * 78} H 310`} stroke="#2A3A5C" strokeWidth={3} />)}
          {/* 7 neck bones, twisting */}
          {Array.from({length: 7}, (_, i) => <rect key={i} x={-60} y={-205 + i * 60} width={120} height={40} rx={14} transform={`rotate(${(3 - i) * 4 * twist} 0 ${-185 + i * 60})`} fill="#F4F1EA" stroke={INK} strokeWidth={5} />)}
          {torn ? <>
            <path d={pts(-260, 260).split(' L ').slice(0, 19).join(' L ')} stroke={RED} strokeWidth={16} fill="none" strokeLinecap="round" />
            <path d={'M' + pts(-260, 260).split(' L ').slice(23).join(' L ')} stroke={RED} strokeWidth={16} fill="none" strokeLinecap="round" />
            <g transform={`translate(${70 * Math.sin(0.525 * Math.PI * (1 + 5 * twist)) * 0.5} 10) scale(${tearS})`}>
              <path d="M 0 -50 L 14 -16 L 50 -14 L 20 8 L 32 44 L 0 22 L -32 44 L -20 8 L -50 -14 L -14 -16 Z" fill={RED} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            </g>
          </> : <path d={pts(-260, 260)} stroke={RED} strokeWidth={16} fill="none" strokeLinecap="round" />}
        </g>
        <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={16} />
      </svg>
      <div style={{position: 'absolute', left: '50%', top: 40, transform: 'translate(-50%,-50%) rotate(-3deg)', background: '#fff', border: `7px solid ${INK}`, borderRadius: 24,
        padding: '6px 22px', fontFamily: FONT, fontWeight: 900, fontSize: 46, boxShadow: `0 7px 0 ${INK}`, whiteSpace: 'nowrap'}}>YOUR ARTERY</div>
    </div>
  );
};

/** a pink brain sticker with a warning */
const Brain: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s * (1 + 0.05 * Math.sin(t * 18))})`}>
    <path d="M -50 10 Q -66 -20 -40 -36 Q -34 -62 -6 -54 Q 14 -70 34 -50 Q 62 -48 58 -18 Q 72 6 50 24 Q 46 46 18 42 Q 0 56 -20 42 Q -48 44 -50 10 Z" fill="#F6A6B8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -30 -20 Q -16 -30 -4 -18 M 10 -36 Q 14 -18 30 -20 M -22 14 Q -6 4 8 16 M 24 6 Q 36 18 46 6" stroke="#C9627C" strokeWidth={5} fill="none" strokeLinecap="round" />
    <circle cx={46} cy={-46} r={22} fill={RED} stroke={INK} strokeWidth={5} />
    <text x={46} y={-45} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#fff">!</text>
  </g></W>) : null;

// ---------- the story over time ----------
/** fly position (world) and whether it is in front of the guy */
const flyAt = (t: number): {x: number; y: number; front: boolean; s: number} | null => {
  if (t < 3.0) {                                       // opening: zips left and right in front of his face
    const u = t < 2.75 ? Math.cos(2 * Math.PI * t / 1.6) : lerp(Math.cos(2 * Math.PI * 2.75 / 1.6), 0, eout(seg(t, 2.75, 3.0)));
    const land = seg(t, 2.75, 3.0);
    return {x: GX + 170 * u, y: lerp(-312 + 22 * Math.sin(t * 7.3), -205, land), front: true, s: 1.5};
  }
  if (t < 5.6) return {x: GX + 2, y: -205 + 1.5 * Math.sin(t * 40), front: true, s: 1.5};   // sits on his face during the X-ray
  if (t < 8.6) {                                       // circles his head (in front, right, behind, left, front)
    const th = 2 * Math.PI * seg(t, T.so, 8.25);
    return {x: GX + 165 * Math.sin(th), y: -255 + 20 * Math.sin(t * 6), front: Math.cos(th) > 0, s: 1.5 * (1 + 0.15 * Math.cos(th))};
  }
  if (t < T.so2 - 0.2) return null;
  // ending: it circles his whole body and he turns after it, then it zips past his face like frame 0
  const th = 2 * Math.PI * seg(t, T.so2 - 0.2, 21.25);
  if (t < 21.25) return {x: GX + 190 * Math.sin(th), y: -262 + 18 * Math.sin(t * 6), front: Math.cos(th) > 0, s: 1.5 * (1 + 0.15 * Math.cos(th))};
  const u = Math.cos(2 * Math.PI * (t - 21.25) / 1.6);
  return {x: GX + 170 * u * seg(t, 21.25, 21.45), y: -312 + 22 * Math.sin(t * 7.3), front: true, s: 1.5};
};
/** frame-0 whip: the head chases the fly back and forth with fixed eyes */
const whip = (t: number) => 46 * Math.tanh(2.6 * Math.cos(2 * Math.PI * (t - 0.12) / 1.6)) / Math.tanh(2.6);

type GuyState = {pose: Pose; flip: boolean; sx: number; sy: number; yaw: number; roll: number; mood: HeadMood; hop: number; tremble: number};
const guyAt = (t: number): GuyState => {
  const base: GuyState = {pose: 'front_calm', flip: false, sx: 1, sy: 1, yaw: 0, roll: 0, mood: 'calm', hop: 0, tremble: 0};
  if (t < 3.3) {                                         // whips after the fly, settles when it lands on his face
    const y = t < 2.7 ? whip(t) : lerp(whip(2.7), 0, eio(seg(t, 2.7, 3.15)));
    return {...base, yaw: y, roll: -0.12 * y, mood: t > 2.95 ? 'worried' : 'calm'};
  }
  if (t < T.so) return {...base, mood: 'worried'};
  if (t < 8.6) {                                         // follows the fly round; stuck at ~85 deg, whips back on "swing", dizzy
    const y = keysAt([[T.so, 0], [6.35, 72], [6.95, 86], [7.22, 88], [7.42, -82]], t);
    const settle = t > 7.42 ? lerp(-82, 0, eout(seg(t, 7.42, 8.3))) + spring(t, 7.42, 18, 2.5, 4) : y;
    const strain = t > 6.7 && t < 7.25;
    return {...base, yaw: settle, roll: t > 7.42 ? 8 * Math.sin((t - 7.42) * 9) * (1 - seg(t, 7.42, 8.4)) : -0.1 * settle,
      mood: t > 7.42 && t < 8.35 ? 'dizzy' : strain ? 'strain' : 'calm', tremble: strain ? 1 : 0};
  }
  if (t < T.twist) return {...base, yaw: keysAt([[8.6, 0], [9.0, 38]], t), mood: t > T.two ? 'worried' : 'calm'};
  if (t < 17.3) {                                        // tries to twist like the owl: stuck, then the danger
    const y = keysAt([[T.twist, 38], [T.twist + 0.15, 20], [T.far - 0.05, 86], [T.tear, 92], [T.tear + 0.12, 70], [16.4, 0]], t);
    const strain = t < T.tear;
    let st: GuyState = {...base, yaw: y, roll: strain ? -6 : 0, mood: strain ? 'strain' : 'worried', tremble: strain && t > T.far - 0.3 ? 1.2 : 0};
    if (t >= T.tear - 0.12) { const g = swap(t, T.tear, 'front_calm', 'front_worried'); st = {...st, pose: g.pose, sx: g.sx, sy: g.sy}; }
    return st;
  }
  if (t < T.so2) return {...base, yaw: keysAt([[17.3, 0], [17.7, 34]], t), mood: t > T.room ? 'happy' : 'calm'};
  // the slow way: hop-turn the whole body after the fly (front -> side -> back -> other side -> front), then the frame-0 whip
  const steps: [number, Pose, boolean, number][] = [[20.0, 'side_stand', false, 90], [20.4, 'front_calm', false, 180], [20.8, 'side_stand', true, 270], [21.2, 'front_calm', false, 360]];
  let pose: Pose = 'front_calm', flip = false, yaw = keysAt([[T.so2, 34], [19.95, 70]], t), sx = 1, sy = 1, hop = 0;
  for (const [ts, p, f, y] of steps) {
    if (t >= ts - 0.09) {
      const prev = pose; const g = swap(t, ts, prev, p, 'turn');
      if (t >= ts) { pose = p; flip = f; yaw = y; }
      sx = g.sx; sy = g.sy;
    }
    hop = Math.max(hop, Math.sin(Math.PI * seg(t, ts - 0.14, ts + 0.12)));
  }
  if (t > 21.2) yaw = 360 + whip(t - 21.25) * eio(seg(t, 21.2, 21.5));
  return {...base, pose, flip, sx, sy, yaw: ((yaw % 360) + 540) % 360 - 180, hop: hop * 22, mood: 'calm'};
};
const owlYawAt = (t: number) => {
  // frame 0: head turned right round to the back (180) and swinging, then back to the front
  if (t < 3.3) { const w = 100 * Math.tanh(2.6 * Math.cos(2 * Math.PI * (t - 0.05) / 1.6)) / Math.tanh(2.6); return t < 2.6 ? w : lerp(100 * Math.tanh(2.6 * Math.cos(2 * Math.PI * 2.55 / 1.6)) / Math.tanh(2.6), 0, eio(seg(t, 2.6, 3.1))); }
  if (t < T.turns) return keysAt([[5.6, 0], [6.6, -30], [7.6, 25], [8.6, 0]], t);
  if (t < 12.2) return keysAt([[T.turns, 0], [10.75, 270], [11.6, 270], [12.2, 0]], t);
  if (t < T.owls) return keysAt([[12.2, 0], [14.3, 0], [14.8, 30], [16.4, 30], [17.0, 0]], t);
  if (t < T.so2) return keysAt([[T.owls, 0], [18.7, -270], [19.3, -270], [19.7, -360]], t);
  if (t < 21.25) return keysAt([[T.so2, 0], [21.0, 20], [21.25, 0]], t);
  return 100 * Math.tanh(2.6 * Math.cos(2 * Math.PI * (t - 21.25 - 0.05) / 1.6)) / Math.tanh(2.6) * eio(seg(t, 21.25, 21.5));
};

export const OwlScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: 117, y: -275, k: 2.75}, {t: 2.9, x: 105, y: -270, k: 2.85},          // both heads big: his whipping head, the owl's backwards head
    {t: 3.3, x: 20, y: -240, k: 2.9}, {t: 5.55, x: 20, y: -240, k: 3.0},          // push in on his face behind the X-ray
    {t: 5.9, x: 40, y: -250, k: 2.2}, {t: 8.3, x: 40, y: -250, k: 2.3},           // the fly circles his head
    {t: 8.75, x: PX + 55, y: -300, k: 2.5}, {t: 11.1, x: PX + 55, y: -300, k: 2.6}, // the owl turns 270
    {t: 11.5, x: 115, y: -230, k: 1.9}, {t: 14.0, x: 115, y: -230, k: 1.9},       // (behind the neck-bone panel)
    {t: 14.4, x: 20, y: -225, k: 2.6}, {t: 17.2, x: 20, y: -230, k: 2.75},        // he twists, the danger
    {t: 17.6, x: PX + 55, y: -280, k: 2.4}, {t: 19.45, x: PX + 55, y: -280, k: 2.5},// the owl's arteries
    {t: 19.85, x: 60, y: -250, k: 2.0}, {t: 21.2, x: 70, y: -250, k: 2.05},       // he turns the slow way
    {t: 21.75, x: 117, y: -275, k: 2.75},
  ], t);
  const sh = shake(t, hit(t, 7.42, 6, 6) + hit(t, T.tear, 10, 6) + (t > T.far - 0.3 && t < T.tear ? 1.5 : 0));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t);
  const h = headOf(g.pose, g.flip);
  const trem = g.tremble * 1.6 * Math.sin(t * 2 * Math.PI * 17);
  const gy = -g.hop;
  const headX = GX + h.hx * g.sx + trem, headY = gy + h.hy * g.sy;
  const fly = flyAt(t);
  const flyNode = fly ? <Fly x={fly.x} y={fly.y} t={t} s={fly.s} rot={8 * Math.sin(t * 9)} /> : null;
  const owlYaw = owlYawAt(t);
  const owlMood: OwlMood = (t > T.two && t < 12.2) || (t > T.room && t < T.so2) || (t > T.seven && t < 14.3) ? 'smug' : t > T.tear && t < 17 ? 'wide' : 'calm';
  // inserts
  const xrayS = popIn(t, 3.27, 0.35) * (1 - seg(t, 5.45, 5.68));
  const neckS = popIn(t, T.with - 0.05, 0.35) * (1 - seg(t, 14.05, 14.28));
  const dialS = popIn(t, T.turns, 0.3) * (1 - seg(t, 11.3, 11.55));
  const degNow = Math.round(clamp(owlYaw, 0, 270));
  const owlXray = popIn(t, T.arteries - 0.1, 0.35) * (1 - seg(t, 19.4, 19.6));
  // labels
  const lockedS = pulse(t, T.never, 0.95);
  const whipS = pulse(t, T.swing, 0.75);
  const degS = popIn(t, T.two, 0.3) * (1 - seg(t, 11.3, 11.5));
  const dangerS = pulse(t, T.tear, 1.2);
  const brainS = pulse(t, T.brain - 0.05, 0.45);
  const roomS = pulse(t, T.room, 0.75);
  const slowS = pulse(t, T.slow, 0.7);
  const stuckS = pulse(t, T.far, T.tear - T.far - 0.1);
  // artery overlay on the guy while he twists
  const artS = popIn(t, T.twist + 0.2, 0.3) * (1 - seg(t, 16.9, 17.15));
  const twistK = clamp(g.yaw / 90, 0, 1.1);
  const torn = t > T.tear;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#9C93C9'}}>
      <Defs />
      <Layer cam={cam} z={3200} paper={false}><Backdrop t={t} /></Layer>
      <Layer cam={cam} z={1900}><Hills /></Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Ground />
        <CastShadow x={GX} w={150} /><CastShadow x={PX} w={90} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Post />
        <Owl x={PX} y={PY} yaw={owlYaw} t={t} mood={owlMood} xray={owlXray} />
        <Dial x={PX} y={PY - 178} deg={clamp(owlYaw, 0, 270)} s={dialS} />
        {fly && !fly.front ? flyNode : null}
        <Guy pose={g.pose} x={GX + trem} y={gy} t={t} sx={g.sx} sy={g.sy} flip={g.flip} breathe={false} />
        <GuyHead x={headX} y={headY} yaw={g.yaw} roll={g.roll} mood={g.mood} t={t} sx={g.sx} sy={g.sy} />
        {fly && fly.front ? flyNode : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 5 + (i * 2 * Math.PI) / 3, on = t > 7.42 && t < 8.35 ? 1 - seg(t, 8.1, 8.35) : 0;
          return <Star key={i} x={headX + Math.cos(a) * 80} y={headY - 78 + Math.sin(a) * 16} s={on * 0.55} rot={t * 200} />;
        })}
        <Brain x={headX - 120} y={headY - 120} s={brainS} t={t} />
        <Txt x={cam0.x} y={headY - 125} s={lockedS} text="LOCKED" size={58} rot={-5} fill={GOLD} />
        <Txt x={cam0.x} y={headY - 125} s={whipS} text="WHIP" size={78} rot={-8} fill={GOLD} />
        <Txt x={cam0.x} y={PY - 340} s={degS} text={`${degNow}°`} size={84} rot={-4} fill={GOLD} />
        <Txt x={cam0.x} y={headY - 118} s={stuckS} text="STUCK" size={62} rot={6} />
        <Txt x={cam0.x} y={headY - 120} s={dangerS} text="DANGER" size={70} rot={-5} fill={RED} />
        <Txt x={cam0.x} y={PY - 330} s={roomS} text="ROOM TO SPARE" size={46} rot={-4} fill={GOLD} />
        <Txt x={cam0.x} y={headY - 118} s={slowS} text="THE SLOW WAY" size={48} rot={-4} fill={GOLD} />
      </Layer>
      <XRay t={t} s={xrayS} />
      <NeckXRay t={t} s={artS} twist={twistK} torn={torn} />
      <NeckPanel t={t} s={neckS} />
      {thumb ? null : <>
        <HookTitle t={t} text="HIS EYES ARE STUCK" hi="STUCK" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so2 + 0.05} until={21.4} text="Which animal's eyes next?" />
      </>}
    </AbsoluteFill>
  );
};

export const OwlVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const whips: Cue[] = [0.0, 0.8, 1.6, 2.4].map((a, i) => ({f: 'whoosh.wav', at: a, db: i ? -24 : -16}));
  const deg: Cue[] = [];
  for (let i = 1; i <= 14; i++) deg.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.turns + 0.05, 10.7, i / 14), db: -30});
  const bones: Cue[] = [];
  for (let i = 1; i <= 14; i++) bones.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.fourteen - 0.05, T.bones + 0.1, i / 14), db: -27});
  for (let i = 1; i <= 7; i++) bones.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.you - 0.05, T.seven + 0.15, i / 7), db: -25});
  const cues: Cue[] = [
    ...whips, {f: 'twang.mp3', at: 0.0, db: -24, to: 0.4}, {f: 'whir.mp3', at: 0, db: -32, to: 3.0},
    {f: 'pop.wav', at: T.never, db: -22}, {f: 'peck.wav', at: 2.98, db: -26, to: 0.25},
    {f: 'zap.wav', at: 3.27, db: -26}, {f: 'pop.wav', at: T.tubes, db: -22}, {f: 'tick.wav', at: T.locked, db: -14}, {f: 'tick2.wav', at: T.locked + 0.08, db: -14},
    {f: 'whoosh.wav', at: 5.5, db: -28}, {f: 'whir.mp3', at: 5.6, db: -30, to: 2.9},
    {f: 'strain.mp3', at: 6.75, db: -26, to: 0.6}, {f: 'whoosh.wav', at: 7.25, db: -15}, {f: 'twang.mp3', at: 7.42, db: -20},
    {f: 'chirp.wav', at: 7.6, db: -30}, {f: 'crowd_laugh.wav', at: 7.55, db: -34, to: 1.3},
    {f: 'whoosh.wav', at: 8.5, db: -28}, {f: 'squeak.wav', at: T.turns, db: -28}, ...deg, {f: 'ding.mp3', at: 10.75, db: -22},
    {f: 'pop.wav', at: T.with - 0.05, db: -24}, ...bones, {f: 'ding.mp3', at: T.bones + 0.1, db: -24}, {f: 'pop.wav', at: T.seven + 0.15, db: -20},
    {f: 'whoosh.wav', at: 14.1, db: -28}, {f: 'strain.mp3', at: T.twist + 0.1, db: -22}, {f: 'crack.wav', at: T.far - 0.3, db: -20},
    {f: 'zap.wav', at: T.tear, db: -20}, {f: 'twang.mp3', at: T.tear, db: -24, to: 0.4}, {f: 'pop.wav', at: T.brain, db: -22},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: 17.45, db: -28}, {f: 'squeak.wav', at: T.owls + 0.2, db: -30}, {f: 'squeak.wav', at: 18.2, db: -30}, {f: 'ding.mp3', at: T.room, db: -24},
    {f: 'whoosh.wav', at: 19.6, db: -28}, {f: 'whir.mp3', at: 19.5, db: -32, to: 2.4},
    ...[20.0, 20.4, 20.8, 21.2].map((a) => ({f: 'squeak.wav', at: a - 0.04, db: -24} as Cue)), {f: 'pop.wav', at: T.slow, db: -24},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<OwlScene t={0} />}>
        <OwlScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="owl/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const OwlWide: React.FC = () => <WideFit.Provider value={0.72}><OwlVideo /></WideFit.Provider>;
