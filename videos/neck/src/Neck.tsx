// "What if you woke up with a giraffe's neck?" - a what-if Short about YOU. Frame 0: the guy lying in the grass with a
// neck almost 2 m long, waking up. He stands up and passes out; an x-ray shows blood from his heart can't climb that
// high, while the giraffe's heart pumps at about double the pressure. A whole new heart... or just lie down, which is
// exactly where the loop begins. The long neck is built from the library poses: body cut below the head, a drawn neck,
// the head moved to the top.
import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import LIB from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle, CommentAsk} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py). Last word ends 17.91 s; + 0.8 s for the loop push.
export const DURATION = 18.7;
export const T = {
  neck: 1.91, stand: 2.85, pass: 4.01, out: 4.31,                // "What if you woke up with a giraffe's neck? You'd stand up... and pass out."
  head: 5.1, two: 6.08, meters: 6.35, heart: 7.33,                            // "Your head would be almost two meters above your heart,"
  heart2: 8.14, strong: 8.97, push: 9.72, high: 10.4,            // "and your heart just isn't strong enough to push blood that high."
  giraffe: 10.87, pumps: 11.82, double: 12.72, pressure: 13.33,  // "A giraffe's heart pumps at about double your blood pressure."
  so: 14.12, whole: 15.1, newHeart: 15.48,                       // "So you'd need a whole new heart."
  or: 16.1, lie: 17.08, down: 17.31,                             // "Or you could just lie down."
  cta: 13.45,
};

const GOLD = '#FFD43B', RED = '#E2453C', BLOOD = '#D8323A';
const GX = 300;                  // the guy's feet
const NECK = 300;                // extra neck: ~1.75 m on top of his own ~0.1 m (300 units = his height = 1.75 m)
const JX = 800;                  // giraffe feet centre

const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.25));
const HEART_D = 'M 0 12 C -30 -8 -22 -34 0 -20 C 22 -34 30 -8 0 12 Z';
const Heart: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={HEART_D} fill={RED} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -12 -18 Q -18 -12 -16 -6" stroke="#FFB3AE" strokeWidth={3} fill="none" strokeLinecap="round" />
  </g></W>) : null;

// ---------- savanna, afternoon sun from the upper left ----------
const Defs: React.FC = () => (
  <W><defs>
    <linearGradient id="nSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7EC6EC" /><stop offset="0.7" stopColor="#CFEAF4" /><stop offset="1" stopColor="#FBE7B8" /></linearGradient>
    <linearGradient id="nGrass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D9C46A" /><stop offset="1" stopColor="#B99E45" /></linearGradient>
    <radialGradient id="nSun" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#FFF6C8" stopOpacity={0.9} /><stop offset="0.4" stopColor="#FFE58A" stopOpacity={0.35} /><stop offset="1" stopColor="#FFE58A" stopOpacity={0} /></radialGradient>
    <linearGradient id="nGir" x1="0" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#FBD68A" /><stop offset="0.6" stopColor="#EDBB62" /><stop offset="1" stopColor="#C9923F" /></linearGradient>
    <linearGradient id="nNeck" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.65" stopColor="#F4F5F8" /><stop offset="1" stopColor="#C9CDD8" /></linearGradient>
  </defs></W>
);
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <W>
    <rect x={-5000} y={-5000} width={12000} height={5000} fill="url(#nSky)" />
    <g transform="translate(-900 -1900)">
      <circle r={460} fill="url(#nSun)" />
      <g transform={`rotate(${t * 8})`}>{Array.from({length: 12}, (_, i) => <path key={i} transform={`rotate(${i * 30})`} d="M -14 -150 L 0 -196 L 14 -150 Z" fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}</g>
      <circle r={120} fill={GOLD} stroke={INK} strokeWidth={8} />
    </g>
    {[[-300, -1500, 1], [1300, -1700, 0.8], [2400, -1400, 1]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x + 20 * Math.sin(t * 0.2 + i)} ${y}) scale(${s})`}>
        <path d="M -170 40 Q -180 -20 -110 -20 Q -90 -90 -10 -70 Q 40 -120 100 -60 Q 180 -60 170 40 Z" fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      </g>))}
  </W>
);
const FarLand: React.FC = () => (
  <W>
    <path d="M -4000 40 Q -2600 -260 -1200 -120 Q 0 -300 1400 -110 Q 2800 -280 5000 40 Z" fill="#C9B36A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[[-1500, -150, 1.1], [-200, -220, 0.8], [1700, -160, 1.2], [2900, -200, 0.9]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        <path d="M -10 0 L -6 -150 Q -30 -190 -70 -200 M -4 -150 Q 30 -200 80 -205" stroke="#6B4A2E" strokeWidth={18} fill="none" strokeLinecap="round" />
        <path d="M -200 -200 Q -180 -280 -60 -270 Q 0 -320 80 -275 Q 200 -285 210 -205 Q 100 -180 0 -190 Q -100 -180 -200 -200 Z" fill="#7FA34A" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      </g>))}
  </W>
);
const Ground: React.FC = () => (
  <W>
    <rect x={-5000} y={0} width={12000} height={3000} fill="url(#nGrass)" />
    <path d="M -5000 0 H 7000" stroke={INK} strokeWidth={8} />
    {Array.from({length: 80}, (_, i) => {
      const x = -2600 + rnd(i * 3) * 6000, y = 30 + rnd(i * 7) * 900;
      return <path key={i} d={`M ${x - 14} ${y} l 8 -30 l 6 26 l 8 -34 l 6 38`} stroke="#A88C3A" strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
  </W>
);

// ---------- the guy with a long neck ----------
type LG = {pose: Pose; rot: number; lift: number; bend: number; headRot: number; blood: number; heartS: number; woozy: number; extra?: number};
const LongGuy: React.FC<{g: LG; t: number}> = ({g, t}) => {
  const m = (LIB as any)[g.pose], s = HEAD_R / m.head[2];
  const [fx, fy] = m.feet, [hcx, hcy, hr] = m.head;
  const cut = hcy + hr * 1.04;                     // image y just under the head outline
  const x = GX, y = -g.lift;
  const bx = x + (hcx - fx) * s, by = y + (cut - fy) * s;
  const neck = NECK + (g.extra ?? 0);
  const hx = bx + g.bend, hy = y + (hcy - fy) * s - neck;
  const cpx = bx + g.bend * 0.15, cpy = (by + hy) / 2 + Math.abs(g.bend) * 0.25;
  const neckD = `M ${bx} ${by + 14} Q ${cpx} ${cpy} ${hx} ${hy + hr * s * 0.7}`;
  const breathe = 1 + 0.008 * Math.sin(2 * Math.PI * 0.6 * t);
  const img = staticFile(`library/char/${g.pose}.png`);
  const heartY = by + 46;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${x}px ${y}px`, transform: `rotate(${g.rot}deg)`}}>
      {/* neck: ink, white tube with a shaded side, x-ray blood */}
      <W>
        <path d={neckD} stroke={INK} strokeWidth={44} fill="none" strokeLinecap="round" />
        <path d={neckD} stroke="#F7F8FB" strokeWidth={30} fill="none" strokeLinecap="round" />
        <path d={neckD} stroke="#C9CDD8" strokeWidth={6} fill="none" strokeLinecap="round" transform="translate(9 0)" opacity={0.7} />
        {g.blood > 0.005 ? <><path d={neckD} stroke="#5E1A1E" strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.25} />
          <path d={neckD} stroke={BLOOD} strokeWidth={11} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={`${Math.min(1, g.blood)} 2`} /></> : null}
      </W>
      {/* body below the head */}
      <div style={{position: 'absolute', left: x - fx * s, top: y - fy * s, width: m.w * s, height: m.h * s, clipPath: `inset(${cut * s}px 0 0 0)`,
        transformOrigin: `${fx * s}px ${fy * s}px`, transform: `scaleY(${breathe})`}}>
        <Img src={img} style={{position: 'absolute', left: 0, top: 0, width: m.w * s, height: m.h * s}} />
      </div>
      <W>
        {/* collar where the neck meets the shoulders */}
        <path d={`M ${bx - 30} ${by + 10} Q ${bx} ${by - 12} ${bx + 30} ${by + 10}`} fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinecap="round" />
        <path d={`M ${bx - 22} ${by + 13} H ${bx + 22}`} stroke="#FFFFFF" strokeWidth={10} />
        <Heart x={bx} y={heartY} s={g.heartS * (1 + 0.12 * Math.max(0, Math.sin(t * 2 * Math.PI * 1.3)))} />
      </W>
      {/* head moved to the top of the neck */}
      <div style={{position: 'absolute', left: hx - hcx * s, top: hy - hcy * s, width: m.w * s, height: m.h * s,
        clipPath: `circle(${(hr + 26) * s}px at ${hcx * s}px ${hcy * s}px)`, transformOrigin: `${hcx * s}px ${hcy * s}px`, transform: `rotate(${g.headRot}deg)`}}>
        <Img src={img} style={{position: 'absolute', left: 0, top: 0, width: m.w * s, height: m.h * s}} />
      </div>
      <W>
        {g.woozy > 0.01 ? [0, 1, 2, 3].map((i) => {
          const a = t * 5 + (i * Math.PI) / 2;
          return <g key={i} transform={`translate(${hx + Math.cos(a) * 80} ${hy - 70 + Math.sin(a) * 18}) scale(${0.5 * g.woozy})`}>
            <path d="M 0 -14 L 4 -4 L 14 -4 L 6 3 L 9 13 L 0 7 L -9 13 L -6 3 L -14 -4 L -4 -4 Z" fill={GOLD} stroke={INK} strokeWidth={3} />
          </g>;
        }) : null}
      </W>
    </div>
  );
};
/** world position of the guy's heart and head top when standing (for labels) */
const STAND = (() => {
  const m = (LIB as any).front_calm, s = HEAD_R / m.head[2];
  const by = (m.head[1] + m.head[2] * 1.04 - m.feet[1]) * s;
  return {heartY: by + 46, headY: (m.head[1] - m.feet[1]) * s - NECK, headX: GX + (m.head[0] - m.feet[0]) * s};
})();

// ---------- the giraffe (side view facing left) ----------
const Giraffe: React.FC<{t: number; xray: number; blood: number; bigHeart: number}> = ({t, xray, blood, bigHeart}) => {
  const chew = Math.sin(t * 6) * 3;
  const legs = [-120, -70, 110, 160].map((lx, i) => `M ${lx - 16} -420 L ${lx - 14} -12 Q ${lx} 2 ${lx + 16} -12 L ${lx + 18} -420 Z`).join(' ');
  const body = 'M -170 -560 Q -175 -640 -100 -650 L 150 -620 Q 215 -610 215 -540 L 205 -440 Q 195 -400 150 -400 L -140 -410 Q -180 -420 -175 -480 Z';
  const neckP = 'M -150 -620 L -265 -1050 Q -275 -1085 -240 -1095 L -205 -1095 Q -175 -1085 -180 -1050 L -85 -640 Z';
  const head = 'M -300 -1080 Q -330 -1140 -270 -1150 L -220 -1145 Q -185 -1130 -200 -1090 L -260 -1050 Q -300 -1040 -300 -1080 Z';
  const full = `${body} ${neckP} ${legs} ${head}`;
  const neckLine = 'M -118 -640 L -222 -1060';
  return (
    <W><g transform={`translate(${JX} 0)`}>
      <clipPath id="nGclip"><path d={full} /></clipPath>
      <path d={`M 210 -560 Q 260 -500 250 -420`} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" />
      <path d={full} fill="url(#nGir)" />
      <g clipPath="url(#nGclip)">
        {Array.from({length: 26}, (_, i) => {
          const px = -320 + (i % 6) * 95 + (Math.floor(i / 6) % 2) * 45, py = -1120 + Math.floor(i / 6) * 150 + (i % 6) * 70;
          return <path key={i} d={`M ${px} ${py} q 30 -18 52 4 q 14 30 -10 44 q -34 10 -46 -14 q -6 -20 4 -34 Z`} fill="#B5743A" opacity={0.9} />;
        })}
        {Array.from({length: 10}, (_, i) => <path key={`b${i}`} d={`M ${-150 + i * 40} -630 q 30 -18 52 4 q 14 30 -10 44 q -34 10 -46 -14 q -6 -20 4 -34 Z`} fill="#B5743A" transform={`translate(0 ${(i % 3) * 70})`} />)}
        <rect x={-400} y={-1200} width={700} height={1200} fill="#000" opacity={0.12 * xray} />
      </g>
      <path d={full} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {/* ossicones, ear, eye, mouth */}
      <path d="M -245 -1145 L -250 -1185 M -225 -1145 L -222 -1188" stroke={INK} strokeWidth={9} strokeLinecap="round" />
      <circle cx={-250} cy={-1192} r={10} fill="#6B4A2E" stroke={INK} strokeWidth={5} /><circle cx={-222} cy={-1195} r={10} fill="#6B4A2E" stroke={INK} strokeWidth={5} />
      <path d="M -200 -1130 Q -160 -1150 -168 -1118 Z" fill="#EDBB62" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <ellipse cx={-250} cy={-1118} rx={7} ry={9} fill={INK} /><circle cx={-252} cy={-1121} r={2.5} fill="#fff" />
      <path d={`M -296 ${-1068 + chew * 0.3} Q -285 ${-1060 + chew} -268 -1062`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* x-ray: the big heart and blood all the way up */}
      {xray > 0.01 ? <g opacity={xray}>
        <path d={neckLine} stroke="#5E1A1E" strokeWidth={18} strokeLinecap="round" opacity={0.25} />
        <path d={neckLine} stroke={BLOOD} strokeWidth={12} strokeLinecap="round" pathLength={1} strokeDasharray={`${blood} 2`} />
        <Heart x={-110} y={-560} s={(1.9 + 0.9 * bigHeart) * (1 + 0.14 * Math.max(0, Math.sin(t * 2 * Math.PI * 1.1)))} />
      </g> : null}
    </g></W>
  );
};

/** vertical double arrow from y0 to y1 at x */
const VArrow: React.FC<{x: number; y0: number; y1: number; p: number}> = ({x, y0, y1, p}) => {
  if (p <= 0.002) return null;
  const m = (y0 + y1) / 2, a = lerp(m, y0, p), b = lerp(m, y1, p);
  return <W>{[[INK, 20], [GOLD, 9]].map(([c, w], i) => <g key={i}>
    <path d={`M ${x} ${a} L ${x} ${b}`} stroke={c as string} strokeWidth={w as number} strokeLinecap="round" />
    {p > 0.9 ? <path d={`M ${x - 22} ${y0 - 24} L ${x} ${y0} L ${x + 22} ${y0 - 24} M ${x - 22} ${y1 + 24} L ${x} ${y1} L ${x + 22} ${y1 + 24}`} stroke={c as string} strokeWidth={w as number} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
  </g>)}</W>;
};

// ---------- story over time ----------
const guyAt = (t: number): LG => {
  // lying -> stand -> faint (fall back) -> stand again -> woozy -> grin with new heart -> lie down
  const standU = (a: number, d = 0.45) => eio(seg(t, a, a + d));
  let rot = -90, pose: Pose = 'front_calm';
  if (t >= T.stand - 0.1) rot = lerp(-90, 0, standU(T.stand - 0.1, 0.5));
  if (t >= T.out) rot = lerp(0, -90, eout(seg(t, T.out, T.out + 0.35)) ** 1.6);
  if (t >= T.head - 0.25) rot = lerp(-90, 0, standU(T.head - 0.25, 0.45));
  if (t >= T.or + 0.2) rot = lerp(0, -90, standU(T.or + 0.2, 0.7));
  rot += t >= T.out && t < T.out + 0.6 ? 6 * Math.exp(-6 * (t - T.out - 0.35)) * Math.sin((t - T.out) * 30) * (t > T.out + 0.35 ? 1 : 0) : 0;
  const lying = Math.abs(rot) / 90;
  if (t >= T.pass - 0.1 && t < T.head) pose = 'front_worried';
  if (t >= T.two - 0.1 && t < T.strong) pose = 'surprised';
  if (t >= T.strong && t < T.so) pose = 'front_worried';
  if (t >= T.newHeart - 0.1 && t < T.or + 0.2) pose = 'laugh';
  // woozy sway while blood can't reach the head
  const sway = t >= T.pass - 0.1 && t < T.out ? 1 : t >= T.high - 0.3 && t < T.so ? 0.7 : 0;
  const bend = sway * 70 * Math.sin((t - T.pass) * 4.2) + (t < T.stand ? 18 * Math.sin(t * 2.3) : 0);
  const headRot = sway * 14 * Math.sin((t - T.pass) * 4.2 + 0.6) + (t < T.stand ? 6 * Math.sin(t * 2.3 + 1) : 0);
  // blood: climbs most of the way and stalls (standing); flows all the way when lying down
  let blood = 0;
  if (t >= T.heart2 && t < T.so) blood = 0.78 * eout(seg(t, T.heart2, T.push + 0.3)) + 0.02 * Math.sin(t * 6);
  if (t >= T.or + 0.6) blood = eout(seg(t, T.lie, T.down + 0.5));
  if (t >= T.so && t < T.or + 0.2) blood = seg(t, T.newHeart, T.newHeart + 0.6);
  const heartS = t >= T.heart - 0.1 && t < DURATION ? popIn(t, T.heart - 0.1, 0.3) * (t >= T.newHeart ? 1 + 1.3 * popIn(t, T.newHeart, 0.4) * (1 - seg(t, T.or + 0.2, T.or + 0.6)) : 1) * (1 - seg(t, 17.85, 18.05)) : 0;
  return {pose, rot, lift: 34 * lying, bend, headRot, blood, heartS, woozy: sway * (t < T.out ? seg(t, T.pass, T.pass + 0.2) : 1)};
};

export const NeckScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}}> = ({t, camK}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: 40, y: -170, k: 1.5}, {t: 2.5, x: 40, y: -175, k: 1.56},                // lying in the grass, waking up
    {t: 3.25, x: 300, y: -440, k: 1.05}, {t: 4.6, x: 290, y: -420, k: 1.0},           // stands... passes out
    {t: 5.3, x: 330, y: -430, k: 1.12}, {t: 10.5, x: 340, y: -440, k: 1.18},          // the x-ray: 2 m of neck
    {t: 11.2, x: 560, y: -560, k: 0.92}, {t: 13.9, x: 570, y: -560, k: 0.95},         // next to the giraffe
    {t: 14.5, x: 320, y: -260, k: 1.55}, {t: 15.9, x: 320, y: -270, k: 1.6},          // a whole new heart
    {t: 17.0, x: 40, y: -170, k: 1.5},
  ], t);
  const sh = shake(t, hit(t, T.out + 0.35, 12, 6) + hit(t, T.newHeart, 6, 6));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t);
  const xray = seg(t, T.giraffe - 0.2, T.giraffe + 0.3) * (1 - seg(t, T.so, T.so + 0.3));
  const gBlood = eout(seg(t, T.pumps - 0.2, T.pumps + 0.5));
  const twoP = eout(seg(t, T.two - 0.1, T.two + 0.4)) * (1 - seg(t, T.giraffe - 0.3, T.giraffe));
  const twoS = popIn(t, T.meters, 0.3) * (1 - seg(t, T.giraffe - 0.3, T.giraffe));
  const notS = pulse(t, T.strong, T.giraffe - T.strong - 0.3);
  const oneX = pulse(t, T.double, T.so - T.double - 0.1), twoX = pulse(t, T.double + 0.15, T.so - T.double - 0.25);
  const newS = pulse(t, T.newHeart, T.or - T.newHeart);
  const ahhS = pulse(t, T.down + 0.2, 0.45);
  const thud = popIn(t, T.out + 0.35, 0.3) * (1 - seg(t, T.out + 0.9, T.out + 1.1));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#7EC6EC'}}>
      <Defs />
      <Layer cam={cam} z={3400} paper={false}><Backdrop t={t} /></Layer>
      <Layer cam={cam} z={1900}><FarLand /></Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Ground />
        {/* cast shadows lean right (sun upper left) */}
        <W><ellipse cx={JX + 60} cy={8} rx={300} ry={30} fill="#6B5420" opacity={0.3} />
          <ellipse cx={GX + 30 - 300 * Math.abs(g.rot) / 90} cy={8} rx={60 + 300 * Math.abs(g.rot) / 90} ry={22} fill="#6B5420" opacity={0.3} /></W>
      </Layer>
      <Layer cam={cam} z={1000}>
        <Giraffe t={t} xray={xray} blood={gBlood} bigHeart={popIn(t, T.double + 0.15, 0.35) * (1 - seg(t, T.so, T.so + 0.3))} />
        <LongGuy g={g} t={t} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <VArrow x={GX - 120} y0={STAND.headY} y1={STAND.heartY} p={twoP} />
        <Txt x={GX - 210} y={(STAND.headY + STAND.heartY) / 2} s={twoS} text="~2 M" size={70} rot={-90} fill={GOLD} />
        <Txt x={GX + 200} y={STAND.headY + 140} s={notS} text="NOT ENOUGH" size={58} rot={-6} />
        <Txt x={GX + 10} y={STAND.headY - 150} s={oneX} text="YOU: 1X" size={66} rot={-4} />
        <Txt x={JX - 240} y={-1290} s={twoX} text="GIRAFFE: 2X" size={70} rot={-4} fill={GOLD} />
        <Txt x={GX + 60} y={-470} s={newS} text="NEW HEART" size={60} rot={-6} fill={GOLD} />
        <Txt x={GX - 380} y={-150} s={ahhS} text="AHH" size={70} rot={-6} />
        <Txt x={GX - 120} y={-120} s={thud} text="THUD" size={84} rot={8} fill={GOLD} />
        {[0, 1, 2].map((i) => <Star key={i} x={GX - 330 + i * 80} y={-200 - (i % 2) * 30} s={pulse(t, T.out + 0.35 + i * 0.05, 0.5) * 0.7} rot={i * 20} />)}
      </Layer>
      <HookTitle t={t} text="YOU'D PASS OUT INSTANTLY" hi="INSTANTLY" />
      <CallToAction t={t} at={T.cta} />
      <CommentAsk t={t} at={T.lie - 0.3} until={18.15} text="What animal part should you get next?" />
    </AbsoluteFill>
  );
};

export const NeckVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    {f: 'chirp.wav', at: 0.0, db: -26}, {f: 'squeak.wav', at: 0.3, db: -32},
    {f: 'whoosh.wav', at: T.stand - 0.1, db: -26}, {f: 'strain.mp3', at: T.stand, db: -32, to: 0.8},
    {f: 'whir.mp3', at: T.pass - 0.1, db: -32, to: 0.6}, {f: 'twang.mp3', at: T.out + 0.33, db: -18}, {f: 'pop.wav', at: T.out + 0.35, db: -18},
    {f: 'whoosh.wav', at: T.head - 0.25, db: -28},
    {f: 'pop.wav', at: T.heart - 0.1, db: -24}, {f: 'tick.wav', at: T.two, db: -26}, {f: 'pop.wav', at: T.meters, db: -22},
    {f: 'bubbles.wav', at: T.heart2, db: -28, to: 1.6}, {f: 'pop.wav', at: T.strong, db: -24},
    {f: 'whoosh.wav', at: T.giraffe - 0.3, db: -28}, {f: 'zap.wav', at: T.giraffe, db: -32}, {f: 'bubbles.wav', at: T.pumps - 0.2, db: -26, to: 0.8},
    {f: 'pop.wav', at: T.double, db: -22}, {f: 'ding.mp3', at: T.double + 0.15, db: -24},
    ...ctaCues(T.cta),
    {f: 'pop.wav', at: T.newHeart, db: -18}, {f: 'crowd_laugh.wav', at: T.newHeart + 0.2, db: -36, to: 1.2},
    {f: 'whoosh.wav', at: T.or + 0.2, db: -28}, {f: 'pop.wav', at: T.down + 0.2, db: -26},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<NeckScene t={0} />}>
        <NeckScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="neck/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const NeckWide: React.FC = () => <WideFit.Provider value={0.72}><NeckVideo /></WideFit.Provider>;
