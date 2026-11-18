// "What if you had a dolphin's blowhole?" - owl formula (CLAUDE.md, Growth), niche: animal powers.
// (1) the power is ON HIM at frame 0: a blowhole on top of his round head, blasting a geyser (the dolphin just squirted
// him awake), (2) the co-star (a smug dolphin in the water beside him, one eye open, one eye asleep) does the trick with
// ease, (3) two X-rays: the dolphin's brain (one half awake, one half asleep; DAYS AWAKE 0 -> 15), then YOUR brain (both
// halves switch off, the blowhole shuts, OXYGEN drops: DANGER), (4) live counters (days, oxygen), (5) the comedy hit is
// made by the power itself (he copies the dolphin's neat puff and blasts a giant geyser that rains back down on him),
// (6) a sticker word every ~1.5 s and a cut every 2-3 s, (7) his workaround (the dolphin squirts him awake every time
// he nods off) runs straight into frame 0, (8) comment bubble opener + either/or comment ask.
// Everything is drawn in code; the guy's body is the library sprite, his head is drawn here so the blowhole can move.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, backOut, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.12; times are video time). Last word ends ~19.5 s; + 0.85 s for the push.
export const DURATION = 20.4;
export const T = {
  blowhole: 0.89, stop: 2.03, fall: 3.39, asleep: 3.60,                   // "Get a dolphin's blowhole, and you'd stop breathing the second you fall asleep."
  dolphin: 4.37, chooses: 4.90, breath: 5.83,                             // "A dolphin chooses every breath."
  so: 6.39, half: 7.64, brain: 8.14, one: 8.60, open: 9.14,               // "So it sleeps with half its brain, one eye open."
  alert: 10.47, fifteen: 11.01, days: 11.58,                              // "And it can stay alert for fifteen days."
  your: 12.35, both: 13.31, halves: 13.60,                                // "Your brain sleeps with both halves."
  so2: 14.21, keeps: 15.49, awake: 15.85,                                 // "So now the dolphin keeps him awake."
  bat: 16.55, octopus: 17.62, comment: 18.74,                             // "Bat ears or octopus arms? Comment below."
  cta: 12.45,
};

const GOLD = '#FFD43B', RED = '#E2453C', WATER = '#8FD3F4', WATER2 = '#4FA9DA';
const DOL = '#8DAFC6', DOL2 = '#6E93AD', BELLY = '#E8F0F4';
const GX = -150;                   // guy's feet
const DX = 95;                     // dolphin's centre line
const SHORE = -45;                 // the sea starts right of this x (foreground)

// jolts: the blowhole blasts a geyser (frame 0 is 0.25 s into one); squirts: the dolphin's stream reaches his face 0.24 s later
const JOLTS: [number, number][] = [[-0.25, 1], [6.0, 1.9], [15.62, 1], [19.62, 1]];
const SQUIRTS = [-0.49, 15.38, 19.38];
const SQ_FLY = 0.24;

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
/** geyser height 0..scale: frame-0 style blast - up in 0.12 s, then falls back over 0.95 s */
const geyserAt = (t: number) => {
  let g = 0;
  for (const [j, sc] of JOLTS) {
    const u = t - j;
    if (u < 0 || u > 1.1) continue;
    const e = u < 0.12 ? eout(u / 0.12) : Math.pow(Math.max(0, 1 - (u - 0.12) / 0.98), 1.4);
    g = Math.max(g, e * sc);
  }
  return g;
};

const headOf = (pose: Pose) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s, hy: (m.head[1] - m.feet[1]) * s};
};
const HEAD = headOf('front_calm');
const HX = GX + HEAD.hx, HY = HEAD.hy;
const FACE = {x: HX + 20, y: HY + 4};           // where the squirt hits

const Defs: React.FC = () => (
  <W><defs>
    <linearGradient id="dSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8FD0F0" /><stop offset="0.7" stopColor="#CDEBF6" /><stop offset="1" stopColor="#F3F7E6" /></linearGradient>
    <linearGradient id="dSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#5DB3DF" /><stop offset="1" stopColor="#3C8FC4" /></linearGradient>
    <linearGradient id="dSand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#F2DCA4" /><stop offset="1" stopColor="#E3C27E" /></linearGradient>
    <radialGradient id="dFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <radialGradient id="dBlue" cx="0.4" cy="0.35" r="0.8"><stop offset="0" stopColor="#B9D6FF" /><stop offset="1" stopColor="#6F98E0" /></radialGradient>
    <radialGradient id="dSun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF6C4" stopOpacity={0.9} /><stop offset="0.5" stopColor="#FFE98A" stopOpacity={0.35} /><stop offset="1" stopColor="#FFE98A" stopOpacity={0} /></radialGradient>
    <linearGradient id="dDol" x1="0" y1="0" x2="1" y2="0.4"><stop offset="0" stopColor="#A6C4D8" /><stop offset="1" stopColor={DOL2} /></linearGradient>
    <linearGradient id="dJet" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor={WATER2} /><stop offset="1" stopColor={WATER} /></linearGradient>
  </defs></W>
);

// ---------- the beach ----------
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-4000} y={-5000} width={9000} height={5000} fill="url(#dSky)" />
    <g transform="translate(-900 -1450)">
      <circle r={480} fill="url(#dSun)" />
      <circle r={150} fill="#FFE46B" stroke={INK} strokeWidth={9} />
      {Array.from({length: 10}, (_, i) => <path key={i} transform={`rotate(${i * 36 + t * 12}) translate(0 -205)`} d="M -14 0 L 0 -46 L 14 0 Z" fill="#FFE46B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
    </g>
    {[[-1700, -2000, 1.1], [700, -2300, 1], [2000, -1750, 0.8], [-200, -2600, 0.9]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x + 30 * Math.sin(t * 0.3 + i)} ${y}) scale(${s})`}>
        <path d="M -200 40 Q -230 -30 -150 -50 Q -120 -130 -30 -110 Q 30 -170 110 -110 Q 200 -120 200 -40 Q 250 20 190 50 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      </g>))}
  </W>
);
const FarSea: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-4000} y={-260} width={9000} height={3000} fill="url(#dSea)" />
    <path d="M -4000 -260 H 5000" stroke={INK} strokeWidth={8} />
    {Array.from({length: 14}, (_, i) => <path key={i} d={`M ${-2400 + i * 360 + 40 * Math.sin(t * 0.9 + i)} ${-180 + (i % 4) * 60} q 30 -14 60 0 q 30 14 60 0`} stroke="#CFEFFF" strokeWidth={6} fill="none" strokeLinecap="round" />)}
    {/* a little island with a palm */}
    <path d="M 1100 -258 Q 1250 -340 1420 -258 Z" fill="#E9CF8E" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 1260 -300 Q 1250 -420 1290 -500" stroke="#8A6A48" strokeWidth={14} fill="none" strokeLinecap="round" />
    {[-60, -10, 40, 100, 150].map((a, i) => <path key={i} d="M 0 0 q 50 -30 110 10" transform={`translate(1290 -500) rotate(${a})`} stroke="#4F9A35" strokeWidth={16} fill="none" strokeLinecap="round" />)}
  </W>
);
const Beach: React.FC = () => (
  <W>
    {/* sand on the left, wet sand edge, then the water (the water in front of the dolphin is drawn later) */}
    <path d={`M -4000 -10 L ${SHORE + 60} -10 Q ${SHORE - 10} 300 ${SHORE + 140} 3000 L -4000 3000 Z`} fill="url(#dSand)" />
    <path d={`M -4000 -10 L ${SHORE + 60} -10`} stroke={INK} strokeWidth={8} />
    <path d={`M ${SHORE + 60} -10 Q ${SHORE - 10} 300 ${SHORE + 140} 3000`} stroke={INK} strokeWidth={8} fill="none" />
    {Array.from({length: 40}, (_, i) => { const x = -1900 + rnd(i * 3) * 1800, y = 40 + rnd(i * 7) * 700; return <circle key={i} cx={x} cy={y} r={4 + rnd(i) * 4} fill="#C9A866" />; })}
    {/* a shell + starfish */}
    <path d="M -520 120 l 26 -40 l 26 40 z" fill="#F6B3BE" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -380 260 l 10 -30 l 10 30 l 30 2 l -24 18 l 10 30 l -26 -18 l -26 18 l 10 -30 l -24 -18 z" fill="#F29A4A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </W>
);
const NearWater: React.FC<{t: number}> = ({t}) => {
  const y0 = -10;
  const wave = (x: number) => y0 + 8 * Math.sin(x / 60 + t * 3);
  const pts: string[] = [];
  for (let x = SHORE + 60; x <= 2400; x += 40) pts.push(`L ${x} ${wave(x).toFixed(1)}`);
  return (
    <W>
      <path d={`M ${SHORE + 60} ${y0} ${pts.join(' ')} L 2400 3000 L ${SHORE + 140} 3000 Q ${SHORE - 10} 300 ${SHORE + 60} ${y0} Z`} fill="url(#dSea)" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {/* foam ring around the dolphin */}
      <ellipse cx={DX} cy={y0 + 8} rx={150 + 8 * Math.sin(t * 4)} ry={22} fill="#E6F7FF" stroke={INK} strokeWidth={6} />
      {Array.from({length: 6}, (_, i) => <path key={i} d={`M ${SHORE + 200 + i * 170 + 20 * Math.sin(t * 1.4 + i)} ${60 + (i % 3) * 70} q 24 -10 48 0`} stroke="#CFEFFF" strokeWidth={6} fill="none" strokeLinecap="round" />)}
    </W>
  );
};
const CastShadow: React.FC<{x: number; w: number}> = ({x, w}) => <W><ellipse cx={x - w * 0.12} cy={2} rx={w * 0.6} ry={20} fill="#8A6A3A" opacity={0.3} /></W>;

// ---------- water geyser out of a blowhole (x, y = the hole, pointing up) ----------
const Geyser: React.FC<{x: number; y: number; g: number; t: number; w?: number; seed?: number}> = ({x, y, g, t, w = 22, seed = 1}) => {
  if (g < 0.02) return null;
  const h = 230 * g, wob = 6 * Math.sin(t * 30);
  const top = y - h;
  const d = `M ${x - w * 0.45} ${y} Q ${x - w * 0.7 + wob} ${y - h * 0.5} ${x - w * 1.1} ${top + 20} L ${x + w * 1.1} ${top + 20} Q ${x + w * 0.7 - wob} ${y - h * 0.5} ${x + w * 0.45} ${y} Z`;
  return (
    <W><g>
      <path d={d} fill="url(#dJet)" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${x - w * 0.15} ${y - 6} Q ${x - w * 0.3 + wob} ${y - h * 0.5} ${x - w * 0.5} ${top + 30}`} stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.85} />
      {/* the spray crown: puffy blobs that spread */}
      {Array.from({length: 7}, (_, i) => {
        const a = -Math.PI / 2 + (i - 3) * 0.42, r = (26 + 30 * g) * (0.8 + 0.4 * rnd(i + seed));
        const cx = x + Math.cos(a) * r * 1.4, cy = top + 18 + Math.sin(a) * r * 0.6;
        return <circle key={'i' + i} cx={cx} cy={cy} r={r * 0.62 + 6} fill={INK} />;
      })}
      {Array.from({length: 7}, (_, i) => {
        const a = -Math.PI / 2 + (i - 3) * 0.42, r = (26 + 30 * g) * (0.8 + 0.4 * rnd(i + seed));
        const cx = x + Math.cos(a) * r * 1.4, cy = top + 18 + Math.sin(a) * r * 0.6;
        return <circle key={'f' + i} cx={cx} cy={cy} r={r * 0.62} fill={i % 2 ? WATER : '#C9ECFC'} />;
      })}
      {/* flying droplets */}
      {Array.from({length: 9}, (_, i) => {
        const a = -Math.PI / 2 + (rnd(i * 5 + seed) - 0.5) * 2.4, sp = 60 + 110 * rnd(i * 3 + seed);
        const ph = ((t * 1.6 + rnd(i + seed)) % 1);
        const px = x + Math.cos(a) * sp * ph * 1.6 * g, py = top + 10 + Math.sin(a) * sp * ph * g + 160 * ph * ph * g;
        return <ellipse key={'d' + i} cx={px} cy={py} rx={7} ry={10} fill={WATER} stroke={INK} strokeWidth={3.5} />;
      })}
    </g></W>
  );
};

// ---------- the dolphin's squirt: an arc of water from its blowhole to his face ----------
const DOL_HOLE = {x: DX + 18, y: -392};
const Squirt: React.FC<{t: number}> = ({t}) => {
  for (const s of SQUIRTS) {
    const u = t - s;
    if (u < 0 || u > SQ_FLY + 0.22) continue;
    const head = clamp(u / SQ_FLY), tail = clamp((u - 0.12) / (SQ_FLY + 0.1));
    const P = (v: number) => ({x: lerp(DOL_HOLE.x, FACE.x, v), y: lerp(DOL_HOLE.y, FACE.y, v) - 170 * Math.sin(Math.PI * v)});
    const pts: string[] = [];
    for (let i = 0; i <= 16; i++) { const p = P(lerp(tail, head, i / 16)); pts.push(`${i ? 'L' : 'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`); }
    const d = pts.join(' ');
    const end = P(head);
    return (
      <W><g>
        <path d={d} stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d={d} stroke={WATER} strokeWidth={15} fill="none" strokeLinecap="round" />
        <path d={d} stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
        {head >= 1 ? Array.from({length: 6}, (_, i) => {
          const a = Math.PI * (0.6 + i * 0.25), r = 30 + 40 * clamp((u - SQ_FLY) / 0.2);
          return <ellipse key={i} cx={end.x + Math.cos(a) * r} cy={end.y + Math.sin(a) * r * 0.8} rx={7} ry={10} fill={WATER} stroke={INK} strokeWidth={3.5} />;
        }) : null}
      </g></W>
    );
  }
  return null;
};

// ---------- the guy's head, drawn in code: a blowhole on top ----------
type HeadMood = 'calm' | 'wide' | 'drowsy' | 'puff' | 'happy' | 'wet' | 'worried';
const GuyHead: React.FC<{t: number; mood: HeadMood; lid: number; hole: number; blue: number; rot?: number; dy?: number}> = ({t, mood, lid, hole, blue, rot = 0, dy = 0}) => {
  const R = HEAD_R;
  const look = mood === 'drowsy' || mood === 'puff' ? 0 : 0.5;
  const eyeR = mood === 'wide' ? 15 : 12;
  return (
    <W><g transform={`translate(${HX} ${HY + dy}) rotate(${rot})`}>
      <circle r={R + 1} fill="url(#dFace)" stroke={INK} strokeWidth={6.5} />
      {blue > 0.01 ? <circle r={R - 3} fill="url(#dBlue)" opacity={0.75 * blue} /> : null}
      {/* blowhole on top: a crescent slit that opens */}
      <g transform={`translate(4 ${-R + 14})`}>
        <path d={`M -20 0 Q 0 ${-6 - 12 * hole} 20 0 Q 0 ${4 + 6 * hole} -20 0 Z`} fill="#3A2A2E" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <path d="M -24 4 Q 0 14 24 4" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.5} />
      </g>
      {/* eyes with lids */}
      {[-1, 1].map((sd) => {
        const ex = sd * 24, ey = -6;
        return (
          <g key={sd}>
            <clipPath id={`gl${sd}`}><ellipse cx={ex} cy={ey} rx={eyeR} ry={eyeR * 1.3} /></clipPath>
            <ellipse cx={ex} cy={ey} rx={eyeR} ry={eyeR * 1.3} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
            <circle cx={ex + look * 4} cy={ey + 2} r={eyeR * 0.55} fill={INK} />
            <circle cx={ex + look * 4 - 3} cy={ey - 2} r={2.6} fill="#fff" />
            {lid > 0.02 ? <g clipPath={`url(#gl${sd})`}>
              <rect x={ex - eyeR - 2} y={ey - eyeR * 1.3 - 2} width={eyeR * 2 + 4} height={(eyeR * 2.6 + 4) * lid} fill={blue > 0.3 ? '#A9C6F2' : '#E6E3DD'} />
              <path d={`M ${ex - eyeR} ${ey - eyeR * 1.3 + eyeR * 2.6 * lid} H ${ex + eyeR}`} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
            </g> : null}
            {lid > 0.95 ? <path d={`M ${ex - eyeR} ${ey + 2} Q ${ex} ${ey + 9} ${ex + eyeR} ${ey + 2}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
          </g>
        );
      })}
      {/* mouth */}
      <g transform="translate(0 28)">
        {mood === 'calm' ? <path d="M -16 -2 Q 0 9 16 -2" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'happy' ? <path d="M -20 -4 Q 0 18 20 -4 Z" fill="#E4677A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
        {mood === 'wide' ? <ellipse cx={0} cy={4} rx={13} ry={15} fill="#5A2328" stroke={INK} strokeWidth={5} /> : null}
        {mood === 'worried' ? <ellipse cx={0} cy={3} rx={9} ry={10} fill="#5A2328" stroke={INK} strokeWidth={5} /> : null}
        {mood === 'drowsy' ? <path d="M -10 2 Q 0 -2 10 2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'wet' ? <path d="M -16 4 Q -8 -4 0 4 Q 8 12 16 4" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
        {mood === 'puff' ? <path d="M -8 0 H 8" stroke={INK} strokeWidth={6} strokeLinecap="round" /> : null}
      </g>
      {/* puffed cheeks when holding his breath */}
      {mood === 'puff' ? <><circle cx={-38} cy={20} r={17} fill="#9DBBEA" stroke={INK} strokeWidth={4} /><circle cx={38} cy={20} r={17} fill="#9DBBEA" stroke={INK} strokeWidth={4} /></> : null}
      {/* dripping when wet */}
      {mood === 'wet' ? [0, 1, 2].map((i) => { const ph = (t * 1.4 + i * 0.33) % 1; return <ellipse key={i} cx={-50 + i * 50} cy={-30 + i * 20 + ph * 90} rx={6} ry={9} fill={WATER} stroke={INK} strokeWidth={3} opacity={1 - ph * 0.4} />; }) : null}
    </g></W>
  );
};

// ---------- the dolphin (upright in the water, beak pointing left at him; one eye open, one asleep) ----------
type DolMood = 'smug' | 'laugh' | 'squirt' | 'proud';
const Dolphin: React.FC<{t: number; mood: DolMood; hole: number}> = ({t, mood, hole}) => {
  const bob = mood === 'laugh' ? 5 * Math.sin(t * 38) : 6 * Math.sin(t * 2 * Math.PI * 0.5);
  const tilt = mood === 'squirt' ? -7 : mood === 'laugh' ? 4 * Math.sin(t * 20) : 2 * Math.sin(t * 1.4);
  return (
    <W><g transform={`translate(${DX} ${bob}) rotate(${tilt} 0 -150)`}>
      {/* dorsal fin behind */}
      <path d="M 40 -250 Q 110 -290 120 -340 Q 120 -270 80 -200 Z" fill={DOL2} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {/* body */}
      <path d="M -70 40 Q -95 -150 -80 -280 Q -70 -400 10 -410 Q 90 -405 92 -300 Q 98 -150 80 40 Z" fill="url(#dDol)" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {/* belly */}
      <path d="M -60 40 Q -78 -120 -66 -230 Q -30 -200 -6 -120 Q 10 -40 10 40 Z" fill={BELLY} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* flipper (waves when proud / laughing) */}
      <path d={`M -40 -170 Q -110 ${-150 + (mood === 'proud' || mood === 'laugh' ? 30 * Math.sin(t * 14) : 0)} -128 -110 Q -80 -120 -30 -130 Z`} fill={DOL2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* beak */}
      <path d="M -72 -300 Q -150 -300 -168 -282 Q -150 -262 -74 -262 Z" fill="url(#dDol)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {mood === 'laugh'
        ? <path d="M -160 -280 Q -120 -256 -74 -266 Q -110 -244 -160 -276 Z" fill="#7A2A36" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        : <path d="M -164 -281 Q -120 -270 -66 -276" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />}
      {mood === 'smug' || mood === 'proud' ? <path d="M -66 -276 q 10 -2 12 -14" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      {/* eyes: the near one OPEN (smug half lid), the far one ASLEEP */}
      <g transform="translate(-36 -330)">
        <ellipse rx={15} ry={18} fill="#fff" stroke={INK} strokeWidth={5} />
        <circle cx={-4} cy={3} r={8} fill={INK} /><circle cx={-7} cy={-1} r={2.5} fill="#fff" />
        {mood !== 'laugh' ? <path d="M -15 -4 A 15 18 0 0 1 15 -4 Z" fill={DOL2} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}
      </g>
      <g transform="translate(26 -334)">
        <path d="M -14 0 Q 0 10 14 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d="M -10 6 l -4 6 M 0 9 l 0 7 M 10 6 l 4 6" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
      </g>
      {/* little z's over the sleeping eye */}
      {mood !== 'laugh' ? [0, 1].map((i) => { const ph = (t * 0.7 + i * 0.5) % 1; return <text key={i} x={58 + ph * 30} y={-360 - ph * 60} fontFamily={FONT} fontWeight={900} fontSize={30 + 10 * i} fill="#fff" stroke={INK} strokeWidth={6} style={{paintOrder: 'stroke'}} opacity={1 - ph}>z</text>; }) : null}
      {/* its blowhole */}
      <path d={`M 2 -404 Q 18 ${-410 - 8 * hole} 34 -404 Q 18 ${-400 + 4 * hole} 2 -404 Z`} fill="#3A2A2E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    </g></W>
  );
};

// ---------- inserts (screen space) ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;

/** a brain seen from above: two halves, each lit (awake, gold) or dark (asleep, z's) */
const Brain: React.FC<{left: number; right: number; t: number}> = ({left, right, t}) => {
  const half = (sd: number, on: number) => {
    const x = sd * 92;
    const fill = on > 0.5 ? '#FFE07A' : '#2E3E66';
    return (
      <g>
        {on > 0.5 ? <ellipse cx={x} cy={0} rx={130} ry={170} fill="#FFE07A" opacity={0.25 + 0.1 * Math.sin(t * 8)} /> : null}
        <path d={`M ${sd * 8} -150 Q ${sd * 170} -170 ${sd * 180} -10 Q ${sd * 175} 150 ${sd * 8} 150 Z`} fill={fill} stroke={on > 0.5 ? '#FFF3C4' : '#7A8FC0'} strokeWidth={7} strokeLinejoin="round" />
        {[-90, -40, 10, 60, 105].map((y, i) => <path key={i} d={`M ${sd * 30} ${y} q ${sd * 40} -26 ${sd * 70} 0 q ${sd * 30} 22 ${sd * 60} -4`} stroke={on > 0.5 ? '#D9A93A' : '#4A5C8C'} strokeWidth={6} fill="none" strokeLinecap="round" />)}
        {on > 0.5 ? null : [0, 1, 2].map((i) => { const ph = (t * 0.8 + i * 0.33) % 1; return <text key={i} x={x + sd * 20 + ph * 30} y={-40 - ph * 120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill="#9FB4E8" opacity={1 - ph}>z</text>; })}
      </g>
    );
  };
  return <g>{half(-1, left)}{half(1, right)}</g>;
};
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

/** X-RAY: the dolphin's brain. One half asleep, the other awake (they take turns), then DAYS AWAKE 0 -> 15 */
const DolphinXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const swapped = t > 9.75;
  const L = swapped ? 0 : 1, Rr = swapped ? 1 : 0;
  const halfS = pulse(t, T.half, 1.1), eyeS = popIn(t, T.one, 0.3) * (1 - seg(t, 9.6, 9.8));
  const turnS = pulse(t, 9.75, 0.6);
  const daysS = popIn(t, 10.0, 0.3);
  const days = Math.floor(15 * seg(t, 10.2, T.days + 0.02) + 1e-6);
  const done = t > T.days;
  return (
    <div style={{position: 'absolute', left: 540, top: 1000, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id="dxr" R={340}>
        <g transform="translate(0 -10)"><Brain left={L} right={Rr} t={t} /></g>
        <text x={-160} y={230} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={L ? '#FFE07A' : '#9FB4E8'}>{L ? 'AWAKE' : 'ASLEEP'}</text>
        <text x={160} y={230} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={Rr ? '#FFE07A' : '#9FB4E8'}>{Rr ? 'AWAKE' : 'ASLEEP'}</text>
        <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
      </XFrame>
      <Card text="X-RAY: DOLPHIN BRAIN" top={90} size={48} />
      <Card text="HALF ASLEEP" top={640} left={250} color={GOLD} rot={-7} s={halfS} size={56} />
      <Card text="TAKES TURNS" top={640} left={650} color={GOLD} rot={5} s={turnS} size={52} />
      {eyeS > 0.01 ? <div style={{position: 'absolute', left: 690, top: 640, transform: `translate(-50%,-50%) rotate(4deg) scale(${eyeS})`, background: '#fff', border: `8px solid ${INK}`, borderRadius: 26,
        boxShadow: `0 8px 0 ${INK}`, padding: '6px 22px', display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONT, fontWeight: 900, fontSize: 48, whiteSpace: 'nowrap'}}>
        <svg width={64} height={40} viewBox="-32 -20 64 40"><ellipse rx={28} ry={16} fill="#fff" stroke={INK} strokeWidth={5} /><circle r={9} fill={INK} /></svg>ONE EYE OPEN
      </div> : null}
      {daysS > 0.01 ? <div style={{position: 'absolute', left: 450, top: 830, transform: `translate(-50%,-50%) rotate(2deg) scale(${daysS * (done ? 1 + 0.07 * Math.max(0, 1 - (t - T.days) * 4) : 1)})`,
        background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '8px 30px 12px', fontFamily: FONT, color: INK,
        display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap'}}>
        {/* tear-off calendar */}
        <svg width={96} height={104} viewBox="-48 -52 96 104">
          <rect x={-42} y={-38} width={84} height={84} rx={12} fill="#fff" stroke={INK} strokeWidth={7} />
          <rect x={-42} y={-38} width={84} height={26} rx={10} fill={RED} stroke={INK} strokeWidth={7} />
          <path d="M -22 -50 v 22 M 22 -50 v 22" stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <text y={30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>{days}</text>
        </svg>
        <div>
          <div style={{fontWeight: 900, fontSize: 112, lineHeight: 1, color: done ? RED : INK}}>{days}</div>
          <div style={{fontWeight: 900, fontSize: 38}}>DAYS AWAKE</div>
        </div>
      </div> : null}
    </div>
  );
};

/** X-RAY: YOUR brain. Both halves switch off, the blowhole shuts, OXYGEN drops */
const YourXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const L = t > T.both ? 0 : 1, Rr = t > T.halves ? 0 : 1;
  const shut = clamp(1 - seg(t, T.halves + 0.15, T.halves + 0.3));
  const ox = Math.round(100 - 45 * seg(t, T.halves + 0.3, 14.15));
  const bothS = popIn(t, T.halves, 0.3), dangerS = popIn(t, 13.85, 0.3);
  return (
    <div style={{position: 'absolute', left: 540, top: 1000, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s})`}}>
      <XFrame id="yxr" R={340}>
        <g transform="translate(0 -40) scale(0.85)"><Brain left={L} right={Rr} t={t} /></g>
        {/* the blowhole valve under it */}
        <g transform="translate(0 200)">
          <path d="M -90 0 H 90" stroke="#EAF4FF" strokeWidth={8} strokeLinecap="round" />
          <path d={`M -50 0 Q 0 ${-10 - 34 * shut} 50 0 Q 0 ${8 + 14 * shut} -50 0 Z`} fill={shut > 0.5 ? '#16223A' : '#2E3E66'} stroke={shut > 0.5 ? '#9FD3FF' : RED} strokeWidth={7} strokeLinejoin="round" />
          <text y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={38} fill={shut > 0.5 ? '#9FD3FF' : RED}>{shut > 0.5 ? 'BLOWHOLE OPEN' : 'BLOWHOLE SHUT'}</text>
        </g>
        <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
      </XFrame>
      <Card text="YOUR BRAIN" top={90} />
      <Card text="BOTH ASLEEP" top={330} left={140} color={GOLD} rot={-10} s={bothS} size={50} />
      <Card text="DANGER" top={330} left={770} color={RED} fg="#fff" rot={9} s={dangerS} size={56} />
      {/* oxygen meter */}
      <div style={{position: 'absolute', left: 450, top: 830, transform: 'translate(-50%,-50%) rotate(-2deg)', background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30,
        boxShadow: `0 9px 0 ${INK}`, padding: '10px 28px 14px', fontFamily: FONT, color: INK, whiteSpace: 'nowrap', textAlign: 'center'}}>
        <div style={{fontWeight: 900, fontSize: 38}}>OXYGEN</div>
        <div style={{display: 'flex', alignItems: 'center', gap: 18}}>
          <div style={{width: 300, height: 44, border: `7px solid ${INK}`, borderRadius: 22, overflow: 'hidden', background: '#fff'}}>
            <div style={{width: `${ox}%`, height: '100%', background: ox > 80 ? '#3FBF6A' : ox > 65 ? GOLD : RED}} />
          </div>
          <div style={{fontWeight: 900, fontSize: 76, lineHeight: 1, color: ox < 70 ? RED : INK, minWidth: 170}}>{ox}%</div>
        </div>
      </div>
    </div>
  );
};

// ---------- the story over time ----------
type GuyState = {mood: HeadMood; lid: number; hole: number; blue: number; rot: number; dy: number};
/** dozing off: lids close over [a, b], blowhole snaps shut at b, he turns blue until woken at w */
const doze = (t: number, a: number, b: number, w: number): GuyState | null => {
  if (t < a || t >= w) return null;
  const lid = lerp(0.12, 1, eio(seg(t, a, b)));
  const shut = t > b;
  const blue = shut ? seg(t, b + 0.05, b + Math.min(1.3, (w - b) * 0.8)) : 0;
  return {mood: shut && blue > 0.25 ? 'puff' : 'drowsy', lid, hole: shut ? 0 : 1 - seg(t, b - 0.05, b), blue, rot: -6 * eio(seg(t, a, b)) + (shut ? 1.5 * Math.sin(t * 3) : 0), dy: 4 * eio(seg(t, a, b))};
};
const guyAt = (t: number): GuyState => {
  const base: GuyState = {mood: 'calm', lid: 0.12, hole: 1, blue: 0, rot: 0, dy: 0};
  const z = doze(t, 2.85, T.asleep, 4.12) ?? doze(t, 14.35, 14.95, 15.62) ?? doze(t, 16.9, 18.2, 19.62);
  if (z) return z;
  for (const [j] of JOLTS) {                                            // woken: eyes wide, jump
    const u = t - j;
    if (u >= 0 && u < 0.75) return {...base, mood: j === 6.0 ? 'wide' : 'wide', lid: 0, blue: Math.max(0, 0.6 - u * 3) * (j === 6.0 ? 0 : 1), dy: -10 * Math.sin(Math.PI * clamp(u / 0.3)), rot: 3 * Math.sin(u * 20) * (1 - u)};
  }
  if (t > 6.6 && t < 7.4) return {...base, mood: 'wet', lid: 0.35};
  if (t > 9.5 && t < 14.35) return {...base, mood: t > 12.3 ? 'worried' : 'calm'};
  if (t > 15.62 && t < 16.9) return {...base, mood: 'happy'};
  return base;
};
const dolAt = (t: number): {mood: DolMood; hole: number} => {
  const puff = (a: number) => (t > a && t < a + 0.5 ? 1 : 0);
  for (const s of SQUIRTS) if (t > s - 0.15 && t < s + SQ_FLY + 0.2) return {mood: 'squirt', hole: 1};
  if (t > 6.45 && t < 7.4) return {mood: 'laugh', hole: 0};
  if (t > 4.6 && t < 6.3) return {mood: 'proud', hole: Math.max(puff(T.chooses - 0.05), puff(T.breath - 0.05))};
  return {mood: 'smug', hole: 0};
};
/** the dolphin's own little puffs (on purpose): neat, small */
const dolPuffAt = (t: number) => {
  let g = 0;
  for (const a of [T.chooses - 0.05, T.breath - 0.05, 13.0]) { const u = t - a; if (u > 0 && u < 0.6) g = Math.max(g, (u < 0.08 ? u / 0.08 : 1 - (u - 0.08) / 0.52) * 0.42); }
  return g;
};

export const DolphinScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: -20, y: -360, k: 2.25}, {t: 1.98, x: -20, y: -350, k: 2.4},              // both big, geyser
    {t: 2.0, x: HX + 20, y: HY - 10, k: 3.5}, {t: 4.1, x: HX + 20, y: HY - 10, k: 3.75}, // his face: drowsy, SNAP, blue
    {t: 4.12, x: DX - 40, y: -300, k: 3.2}, {t: 5.73, x: DX - 40, y: -300, k: 3.4},   // the dolphin: neat puffs on purpose
    {t: 5.75, x: 0, y: -380, k: 1.95}, {t: 6.95, x: 0, y: -360, k: 2.05},            // he copies: giant geyser, SPLASH
    {t: 7.0, x: 20, y: -260, k: 2.2}, {t: 12.2, x: 30, y: -260, k: 2.35},             // behind the dolphin X-ray
    {t: 12.25, x: GX + 60, y: -250, k: 2.5}, {t: 14.2, x: GX + 60, y: -250, k: 2.6},  // behind YOUR BRAIN
    {t: 14.25, x: HX + 40, y: HY - 20, k: 3.3}, {t: 15.3, x: HX + 40, y: HY - 20, k: 3.45}, // dozing again
    {t: 15.33, x: -20, y: -340, k: 2.2}, {t: 16.45, x: -20, y: -335, k: 2.26},         // SQUIRT, jolt
    {t: 16.5, x: HX + 60, y: HY - 30, k: 2.9}, {t: 19.0, x: HX + 70, y: HY - 30, k: 3.05},   // nodding off during the ask
    {t: 19.05, x: -20, y: -360, k: 2.25},                                             // = the frame-0 shot
  ], t);
  const sh = shake(t, hit(t, 0, 7, 7) + hit(t, 6.0, 10, 5) + hit(t, 6.45, 6, 6) + hit(t, 15.62, 7, 7) + hit(t, 19.62, 7, 7));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t), d = dolAt(t);
  const gy = geyserAt(t);
  const holeX = HX + 4, holeY = HY + g.dy - HEAD_R + 8;
  // rain from the giant geyser landing on him (6.25-6.7)
  const rain = t > 6.2 && t < 6.75;
  // inserts
  const dxS = popIn(t, 7.0, 0.35) * (1 - seg(t, 12.0, 12.2));
  const yxS = popIn(t, 12.25, 0.35) * (1 - seg(t, 14.0, 14.2));
  // stickers
  const pffsh0 = t < 0.9 ? 1 - seg(t, 0.62, 0.85) : 0;
  const snap = pulse(t, T.asleep, 0.45), noAir = pulse(t, 3.75, 0.3);
  const onPurpose = pulse(t, T.chooses, 0.9);
  const pff = pulse(t, T.breath, 0.35);
  const pffsh1 = pulse(t, 6.0, 0.35), splash = pulse(t, 6.42, 0.5);
  const zzz = pulse(t, 14.98, 0.55), squirt = pulse(t, 15.4, 0.3), pffsh2 = pulse(t, 15.62, 0.5);
  const zzz2 = pulse(t, 18.3, 0.9), squirt2 = pulse(t, 19.4, 0.3), pffsh3 = t > 19.6 ? popIn(t, 19.62, 0.25) : 0;
  const stars = t > 6.5 && t < 7.0 ? 1 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#BFE3F3'}}>
      <Defs />
      <Layer cam={cam} z={3200} paper={false}><Backdrop t={t} /></Layer>
      <Layer cam={cam} z={1900}><FarSea t={t} /></Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Beach />
        <CastShadow x={GX} w={150} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Dolphin t={t} mood={d.mood} hole={d.hole} />
        <Guy pose="front_calm" x={GX} y={0} t={t} rot={g.rot * 0.25} />
        <GuyHead t={t} mood={g.mood} lid={g.lid} hole={g.hole} blue={g.blue} rot={g.rot} dy={g.dy} />
      </Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <NearWater t={t} />
        <Geyser x={holeX} y={holeY} g={gy} t={t} seed={3} />
        <Geyser x={DX + 18} y={-400} g={dolPuffAt(t)} t={t} w={14} seed={9} />
        <Squirt t={t} />
        {rain ? Array.from({length: 12}, (_, i) => {
          const u = seg(t, 6.2, 6.7), x = HX - 90 + rnd(i * 7) * 180, y = HY - 260 - rnd(i * 3) * 140 + u * 330;
          return <ellipse key={i} cx={x} cy={y} rx={9} ry={14} fill={WATER} stroke={INK} strokeWidth={4} />;
        }) : null}
        {/* the puddle after the splash */}
        {t > 6.45 && t < 7.4 ? <W><ellipse cx={GX} cy={6} rx={130 * popIn(t, 6.45, 0.25)} ry={20} fill={WATER} stroke={INK} strokeWidth={5} /></W> : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={HX + Math.cos(a) * 86} y={HY - 96 + Math.sin(a) * 16} s={stars * 0.5} rot={t * 200} />;
        })}
        {thumb ? null : <>
        <Txt x={HX + 150} y={HY - 210} s={pffsh0} text="PFFSH" size={80} rot={8} fill={GOLD} />
        <Txt x={HX + 100} y={HY - 105} s={snap} text="SNAP" size={52} rot={10} fill={GOLD} />
        <Txt x={HX - 10} y={HY + 105} s={noAir} text="NO AIR" size={44} rot={-6} fill="#9DBBEA" />
        <Txt x={DX - 20} y={-500} s={onPurpose} text="ON PURPOSE" size={50} rot={-6} fill={GOLD} />
        <Txt x={DX + 100} y={-470} s={pff} text="pff" size={46} rot={10} fill="#FFFFFF" />
        <Txt x={HX + 170} y={HY - 330} s={pffsh1} text="PFFSH" size={90} rot={8} fill={GOLD} />
        <Txt x={HX + 30} y={HY + 150} s={splash} text="SPLASH" size={80} rot={-8} fill={WATER} />
        <Txt x={HX + 110} y={HY - 110} s={zzz} text="ZZZ" size={50} rot={10} fill="#FFFFFF" />
        <Txt x={(HX + DX) / 2 + 30} y={-520} s={squirt} text="SQUIRT" size={60} rot={-6} fill={WATER} />
        <Txt x={HX + 150} y={HY - 210} s={pffsh2} text="PFFSH" size={72} rot={8} fill={GOLD} />
        <Txt x={HX + 110} y={HY - 110} s={zzz2} text="ZZZ" size={50} rot={10} fill="#FFFFFF" />
        <Txt x={(HX + DX) / 2 + 30} y={-520} s={squirt2} text="SQUIRT" size={60} rot={-6} fill={WATER} />
        <Txt x={HX + 150} y={HY - 210} s={pffsh3} text="PFFSH" size={80} rot={8} fill={GOLD} />
        </>}
      </Layer>
      <DolphinXRay t={t} s={dxS} />
      <YourXRay t={t} s={yxS} />
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you had a dolphin's blowhole??" handle="@splashy_sketch" likes="2.7K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.bat - 0.05} until={DURATION - LOOP_DUR - 0.4} text="Bat ears or octopus arms?" />
      </>}
    </AbsoluteFill>
  );
};

export const DolphinVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks: Cue[] = [];
  for (let i = 1; i <= 15; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(10.2, T.days, i / 15), db: i === 15 ? -18 : -28});
  const waves: Cue[] = [];
  for (let a = 0; a < DURATION - 1; a += 2.7) waves.push({f: 'waves.wav', at: a, db: -33});
  const jolt = (at: number, db = -14): Cue[] => [{f: 'splash.wav', at, db}, {f: 'whoosh.wav', at, db: db - 6}, {f: 'hiss.wav', at, db: db - 12, to: 0.7}];
  const cues: Cue[] = [
    ...waves,
    {f: 'splash.wav', at: 0, db: -10}, {f: 'whoosh.wav', at: 0, db: -16}, {f: 'hiss.wav', at: 0, db: -26, to: 0.8},
    {f: 'whoosh.wav', at: 1.98, db: -28}, {f: 'snore.mp3', at: 3.0, db: -30, to: 0.6}, {f: 'pop.wav', at: T.asleep, db: -14}, {f: 'twang.mp3', at: T.asleep + 0.02, db: -26, to: 0.3},
    {f: 'whoosh.wav', at: 4.1, db: -28}, {f: 'pop.wav', at: T.chooses, db: -22}, {f: 'hiss.wav', at: T.chooses - 0.05, db: -32, to: 0.4}, {f: 'hiss.wav', at: T.breath - 0.05, db: -32, to: 0.4},
    {f: 'whoosh.wav', at: 5.73, db: -26},
    ...jolt(6.0, -11), {f: 'splash.wav', at: 6.42, db: -12}, {f: 'twang.mp3', at: 6.45, db: -20, to: 0.5}, {f: 'crowd_laugh.wav', at: 6.5, db: -29, to: 1.1},
    {f: 'zap.wav', at: 7.0, db: -26}, {f: 'pop.wav', at: T.half, db: -22}, {f: 'pop.wav', at: T.one, db: -22}, {f: 'pop.wav', at: 9.75, db: -22},
    {f: 'pop.wav', at: 10.0, db: -24}, ...ticks, {f: 'ding.mp3', at: T.days + 0.02, db: -20},
    {f: 'zap.wav', at: 12.25, db: -26}, {f: 'pop.wav', at: T.both, db: -22}, {f: 'pop.wav', at: T.halves, db: -20}, {f: 'horn.wav', at: 13.85, db: -30, to: 0.6},
    ...ctaCues(T.cta),
    {f: 'snore.mp3', at: 14.6, db: -28, to: 0.8}, {f: 'pop.wav', at: 14.95, db: -18},
    {f: 'whoosh.wav', at: 15.31, db: -26}, {f: 'squeak.wav', at: 15.38, db: -26}, ...jolt(15.62), {f: 'giggle.mp3', at: 16.0, db: -32, to: 0.9},
    {f: 'whoosh.wav', at: 16.48, db: -28}, {f: 'snore.mp3', at: 17.4, db: -30, to: 0.8}, {f: 'pop.wav', at: 18.2, db: -20},
    {f: 'whoosh.wav', at: 19.03, db: -28}, {f: 'squeak.wav', at: 19.38, db: -26}, ...jolt(19.62),
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<DolphinScene t={0} />}>
        <DolphinScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="dolphin/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const DolphinWide: React.FC = () => <WideFit.Provider value={0.72}><DolphinVideo /></WideFit.Provider>;
