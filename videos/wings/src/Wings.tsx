// "What if you woke up with wings?" - a story Short (no facts). Frame 0: the guy, upright and big, with brown bird
// wings spread, just bonked into his bedroom ceiling (birds already watching through the window). He falls onto the
// bed, tries again, BONK. Outside he takes off: over the roofs, past the birds, above the clouds; the birds follow him
// in a V, land around him, sit on a power line with him and bow to their leader. "Tap like, and you'll get a bird too":
// a like-button thumb sprouts wings and turns into a blue bird on his head. "It'll be at your window in the morning":
// birds tap on his window at dawn, he shoots out of bed - and the loop puts him back at the ceiling (frame 0).
// Wings, birds and every set are drawn in code; the guy is the library poses.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Pose, Sky, Ground, Star, Puffs, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd,
  shake, hit, swap, WideFit, LoopOut, LOOP_DUR, Look, HookTitle, CommentAsk, Cam} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --keep 0.3 --tempo 1.03; times below are video time). Last word ends ~22.05 s.
export const DURATION = 22.9;
export const T = {
  wings: 1.03, and: 1.89, flew: 2.04, ceiling: 3.21,                     // "He woke up with wings... and flew straight into the ceiling."
  tried: 4.08, outside: 4.97,                                             // "He tried again outside."
  up: 5.6, roofs: 6.22, past: 6.99, birds: 7.3, higher: 8.16, clouds: 8.7, // "Up over the roofs, past the birds, higher than the clouds."
  then: 9.58, birds2: 10.27, following: 11.05,                            // "Then the birds started following him."
  landed: 12.18, they: 12.86, landed2: 13.09,                             // "He landed. They landed."
  sat: 13.96, line: 14.66, so: 15.32, they2: 15.71,                       // "He sat on a power line. So did they."
  now: 16.26, think: 16.76, leader: 17.34,                                // "Now they think he's their leader."
  tap: 18.04, like: 18.35, and2: 18.82, bird: 19.36, too: 19.67,          // "Tap like, and you'll get a bird too..."
  itll: 20.29, window: 21.07, morning: 21.54,                             // "...it'll be at your window in the morning."
};
// shots (hard cuts)
const S2 = 3.8, S3 = 9.42, S4 = 11.82, S5 = 13.62, S6 = 20.12;

const GOLD = '#FFD43B';
const FEATH = '#B07D4F', FEATH_D = '#8A5A33', COVERT = '#E9CFA6';
const THUMB_D = 'M 8 30 H 20 V 56 H 8 Z M 20 31 Q 29 28 31 18 Q 33 8 39 8 Q 46 9 44 21 L 42 28 H 53 Q 60 28 59 35 Q 58 38 55 39 Q 60 41 58 46 Q 57 49 53 49 Q 57 52 54 56 Q 52 58 48 58 H 30 Q 24 58 20 55 Z';
const CURSOR_D = 'M 0 0 L 0 36 L 9 28 L 16 43 L 23 40 L 16 25 L 28 25 Z';

const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
/** smooth path through [t, v] keys (Catmull-Rom; holds outside) */
const spline = (keys: [number, number][], t: number) => {
  if (t <= keys[0][0]) return keys[0][1];
  const n = keys.length;
  if (t >= keys[n - 1][0]) return keys[n - 1][1];
  let i = 0; while (t > keys[i + 1][0]) i++;
  const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
  const h = t1 - t0, u = (t - t0) / h;
  const m = (j: number) => (j <= 0 || j >= n - 1) ? 0 : (keys[j + 1][1] - keys[j - 1][1]) / (keys[j + 1][0] - keys[j - 1][0]);
  const m0 = m(i) * h, m1 = m(i + 1) * h;
  const u2 = u * u, u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * v0 + (u3 - 2 * u2 + u) * m0 + (-2 * u3 + 3 * u2) * v1 + (u3 - u2) * m1;
};

// ---------- the wings (drawn for the right side, root at 0,0, pointing +x; a = flap angle up, s = spread) ----------
const capsule = (L: number, w: number) => `M 0 ${-w / 2} L ${L - w / 2} ${-w / 2} A ${w / 2} ${w / 2} 0 0 1 ${L - w / 2} ${w / 2} L 0 ${w / 2} Z`;
const PRIM = [{th: -18, L: 150}, {th: 0, L: 162}, {th: 18, L: 152}, {th: 36, L: 136}];
const SEC = [{b: 0.15, th: 82, L: 92}, {b: 0.45, th: 68, L: 108}, {b: 0.75, th: 54, L: 120}];
const WRIST = {x: 112, y: -12};
const OneWing: React.FC<{s: number}> = ({s}) => {
  const L = lerp(0.72, 1, s);
  const feather = (bx: number, by: number, th: number, len: number, k: string) => (
    <g key={k} transform={`translate(${bx} ${by}) rotate(${th})`}>
      <path d={capsule(len, 40)} fill={FEATH} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M 10 0 L ${len - 26} 0`} stroke={FEATH_D} strokeWidth={5} strokeLinecap="round" />
    </g>);
  return (
    <g>
      {SEC.map((f, i) => feather(WRIST.x * f.b, WRIST.y * f.b + 8, lerp(14, f.th, s), f.L * L, 's' + i))}
      {[...PRIM].reverse().map((f, i) => feather(WRIST.x - 12, WRIST.y, lerp(4 + i * 3, f.th, s), f.L * L, 'p' + i))}
      {/* coverts: the soft shoulder of the wing */}
      <path d={`M -14 -26 Q 50 -46 ${WRIST.x + 8} ${WRIST.y - 22} Q ${WRIST.x + 30} ${WRIST.y + 4} ${WRIST.x + 4} ${WRIST.y + 26}
        Q ${WRIST.x - 12} ${WRIST.y + 46} ${WRIST.x - 30} ${WRIST.y + 30} Q ${WRIST.x - 48} ${WRIST.y + 54} ${WRIST.x - 66} ${WRIST.y + 34}
        Q ${WRIST.x - 86} ${WRIST.y + 58} ${WRIST.x - 104} ${WRIST.y + 38} Q -20 40 -14 -26 Z`}
        fill={COVERT} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  );
};
/** both wings, roots at shoulder (x, y), dx apart from the middle */
const WingPair: React.FC<{x: number; y: number; a: number; s: number; size?: number; dx?: number}> = ({x, y, a, s, size = 0.88, dx = 26}) => (
  <W>
    <g transform={`translate(${x + dx} ${y}) rotate(${-a}) scale(${size})`}><OneWing s={s} /></g>
    <g transform={`translate(${x - dx} ${y}) scale(-1 1) rotate(${-a}) scale(${size})`}><OneWing s={s} /></g>
  </W>
);
type WG = {pose: Pose; x: number; y: number; a: number; s: number; rot?: number; sx?: number; sy?: number; tremble?: number; hide?: boolean};
/** the guy with wings behind his back (shoulders 150 above the feet); squash / rotate about the feet */
const WingGuy: React.FC<{g: WG; t: number}> = ({g, t}) => g.hide ? null : (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${g.x}px ${g.y}px`,
    transform: `rotate(${g.rot ?? 0}deg) scale(${g.sx ?? 1}, ${g.sy ?? 1})`}}>
    <WingPair x={g.x} y={g.y - 150} a={g.a} s={g.s} />
    <Guy pose={g.pose} x={g.x} y={g.y} t={t} tremble={g.tremble} />
  </div>
);
const flap = (t: number, f = 5.5, base = 18, amp = 38) => base + amp * Math.sin(2 * Math.PI * f * t);

/** loose feathers that drift down and sway (born = when they burst off) */
const Feathers: React.FC<{t: number; born: number; x: number; y: number; n?: number; seed?: number}> = ({t, born, x, y, n = 6, seed = 1}) => {
  const u = t - born;
  if (u < 0 || u > 2.2) return null;
  return <W>{Array.from({length: n}, (_, i) => {
    const side = i % 2 ? 1 : -1, vx = side * (60 + rnd(seed + i) * 220), vy = -(120 + rnd(seed + i * 3) * 200);
    const k = Math.min(u, 0.35);
    const px = x + vx * k + side * 40 * u + 30 * Math.sin(u * 5 + i), py = y + vy * k + Math.max(0, u - 0.35) * 170;
    const sc = 1 - seg(u, 1.7, 2.2);
    return sc > 0.01 ? <g key={i} transform={`translate(${px} ${py}) rotate(${40 * Math.sin(u * 5 + i * 1.7) + i * 50}) scale(${sc})`}>
      <path d="M -26 0 Q -6 -12 26 0 Q -6 12 -26 0 Z" fill={i % 3 ? FEATH : COVERT} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      <path d="M -30 0 L 18 0" stroke={FEATH_D} strokeWidth={3} strokeLinecap="round" />
    </g> : null;
  })}</W>;
};

// ---------- birds ----------
const BIRD_COLS = [['#E5534B', '#FFD2C4'], ['#F4B63F', '#FFF0C2'], ['#7E8C9A', '#E3E8EE'], ['#B07D4F', '#F0D9BC'], ['#5DAF6E', '#D9F0C9']];
const BLUE = ['#3D8FD6', '#D6EAFA'];
type BirdP = {x: number; y: number; dir?: number; s?: number; col?: string[]; fly?: number; t: number; bow?: number; sq?: number; look?: number; thumb?: boolean};
/** side-view doodle bird, feet at (x, y). fly = 1 flapping (legs tucked); bow 0..1 tips forward; sq = landing squash */
const Bird: React.FC<BirdP> = ({x, y, dir = 1, s = 1, col = BIRD_COLS[0], fly = 0, t, bow = 0, sq = 1, look = 0, thumb}) => {
  const wa = fly ? 40 * Math.sin(2 * Math.PI * 7 * t + x) : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * s} ${s})`}>
      {fly ? null : <path d="M -6 -14 L -8 0 M 6 -14 L 7 0 M -14 0 H -2 M 1 0 H 13" stroke={INK} strokeWidth={5} strokeLinecap="round" />}
      <g transform={`translate(0 -14) rotate(${32 * bow}) scale(${2 - sq} ${sq}) translate(0 14)`}>
        <path d="M -28 -34 L -66 -50 L -62 -26 Z" fill={col[0]} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <ellipse cx={-2} cy={-34} rx={36} ry={25} fill={col[0]} stroke={INK} strokeWidth={6} />
        <ellipse cx={6} cy={-27} rx={22} ry={14} fill={col[1]} />
        <circle cx={26} cy={-58} r={21} fill={col[0]} stroke={INK} strokeWidth={6} />
        <path d="M 42 -64 L 64 -57 L 42 -49 Z" fill="#F7A32B" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <circle cx={32 + 2 * look} cy={-63} r={7.5} fill="#fff" stroke={INK} strokeWidth={3} />
        <circle cx={34.5 + 2.5 * look} cy={-63} r={3.8} fill={INK} />
        <g transform={`translate(-10 -40) rotate(${fly ? -wa - 20 : 0})`}>
          <path d="M 0 0 Q 18 -10 30 6 Q 10 26 -22 14 Q -18 2 0 0 Z" fill={col[0]} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        </g>
        {thumb ? <g transform="translate(-14 -50) scale(0.52)"><path d={THUMB_D} fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" /></g> : null}
      </g>
    </g>
  );
};
/** front-view bird flying toward the camera (wings out to both sides) */
const BirdFront: React.FC<{x: number; y: number; s: number; col: string[]; t: number; ph?: number}> = ({x, y, s, col, t, ph = 0}) => {
  const wa = 34 * Math.sin(2 * Math.PI * 6.5 * t + ph);
  const wing = (side: number) => <g transform={`translate(${side * 22} -6) scale(${side} 1) rotate(${-wa})`}>
    <path d="M 0 -8 Q 40 -36 82 -16 Q 60 6 0 12 Z" fill={col[0]} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>;
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {wing(-1)}{wing(1)}
    <ellipse cx={0} cy={0} rx={30} ry={33} fill={col[0]} stroke={INK} strokeWidth={6} />
    <ellipse cx={0} cy={12} rx={18} ry={16} fill={col[1]} />
    {[-1, 1].map((sd) => <g key={sd}><circle cx={sd * 11} cy={-11} r={7.5} fill="#fff" stroke={INK} strokeWidth={3} /><circle cx={sd * 11} cy={-10} r={3.8} fill={INK} /></g>)}
    <path d="M -9 -1 L 9 -1 L 0 14 Z" fill="#F7A32B" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>;
};

// ---------- the bedroom (shots 1 and 6): floor y 0, ceiling y -560 ----------
const CEIL = -560, BED_TOP = -110;
const WIN = {x0: 110, x1: 300, y0: -440, y1: -230};
const WINDOW_BIRDS = [{x: 140, c: BIRD_COLS[0]}, {x: 188, c: BLUE, thumb: true}, {x: 236, c: BIRD_COLS[1]}, {x: 282, c: BIRD_COLS[2]}];
const RoomBack: React.FC<{t: number; tapping: boolean}> = ({t, tapping}) => (
  <W>
    <rect x={-3000} y={CEIL} width={6000} height={-CEIL} fill="#F6E7CC" />
    {/* wallpaper dots */}
    {Array.from({length: 60}, (_, i) => <circle key={i} cx={-1200 + (i % 12) * 220 + (Math.floor(i / 12) % 2) * 110} cy={CEIL + 70 + Math.floor(i / 12) * 110} r={9} fill="#EBD6B2" />)}
    {/* window: dawn outside, birds on the sill */}
    <clipPath id="winClip"><rect x={WIN.x0} y={WIN.y0} width={WIN.x1 - WIN.x0} height={WIN.y1 - WIN.y0} /></clipPath>
    <rect x={WIN.x0} y={WIN.y0} width={WIN.x1 - WIN.x0} height={WIN.y1 - WIN.y0} fill="#FFD9A8" />
    <g clipPath="url(#winClip)">
      <circle cx={WIN.x1 - 30} cy={WIN.y1 - 20} r={60} fill="#FFB86B" stroke={INK} strokeWidth={5} />
      <rect x={WIN.x0} y={WIN.y1 - 22} width={WIN.x1 - WIN.x0} height={30} fill="#D7C2A3" stroke={INK} strokeWidth={5} />
      {WINDOW_BIRDS.map((b, i) => {
        const tp = tapping ? Math.max(0, Math.sin(2 * Math.PI * 3.2 * (t - i * 0.13))) : 0;
        return <Bird key={i} x={b.x} y={WIN.y1 - 22} dir={-1} s={0.62} col={b.c} t={t} bow={0.7 * tp} look={-1} thumb={b.thumb} />;
      })}
    </g>
    <path d={`M ${(WIN.x0 + WIN.x1) / 2} ${WIN.y0} V ${WIN.y1} M ${WIN.x0} ${(WIN.y0 + WIN.y1) / 2 - 20} H ${WIN.x1}`} stroke="#FFFFFF" strokeWidth={10} />
    <rect x={WIN.x0} y={WIN.y0} width={WIN.x1 - WIN.x0} height={WIN.y1 - WIN.y0} fill="none" stroke={INK} strokeWidth={7} />
    <path d={`M ${(WIN.x0 + WIN.x1) / 2} ${WIN.y0} V ${WIN.y1} M ${WIN.x0} ${(WIN.y0 + WIN.y1) / 2 - 20} H ${WIN.x1}`} stroke={INK} strokeWidth={3} />
    <rect x={WIN.x0 - 16} y={WIN.y1} width={WIN.x1 - WIN.x0 + 32} height={18} rx={6} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
    {/* dawn light on the wall */}
    <path d={`M ${WIN.x0} ${WIN.y1 + 18} L ${WIN.x1} ${WIN.y1 + 18} L ${WIN.x1 - 140} 0 L ${WIN.x0 - 320} 0 Z`} fill="#FFE2B0" opacity={0.45} />
    {/* ceiling slab with the dent he keeps making */}
    <rect x={-3000} y={CEIL - 600} width={6000} height={600} fill="#E9D9BE" />
    <path d={`M -3000 ${CEIL} H 3000`} stroke={INK} strokeWidth={8} />
    <path d={`M -40 ${CEIL} l 14 22 l 10 -10 l 16 26 M 24 ${CEIL} l -6 18 l 18 8`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {/* floor */}
    <rect x={-3000} y={0} width={6000} height={1500} fill="#C99A6B" />
    {Array.from({length: 30}, (_, i) => <path key={i} d={`M ${-3000 + i * 200} 0 V 1500`} stroke="#B3865A" strokeWidth={6} />)}
    <path d="M -3000 0 H 3000" stroke={INK} strokeWidth={8} />
    <rect x={-3000} y={-26} width={6000} height={26} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
  </W>
);
const BedBack: React.FC = () => (
  <W>
    <rect x={-240} y={-330} width={34} height={330} rx={12} fill="#9C6B43" stroke={INK} strokeWidth={7} />
    <rect x={208} y={-200} width={30} height={200} rx={12} fill="#9C6B43" stroke={INK} strokeWidth={7} />
    <rect x={-215} y={BED_TOP} width={430} height={70} rx={14} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <rect x={-215} y={BED_TOP + 60} width={430} height={36} rx={8} fill="#9C6B43" stroke={INK} strokeWidth={7} />
    <path d="M -200 -44 V 0 M 200 -44 V 0" stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <ellipse cx={-150} cy={BED_TOP - 14} rx={58} ry={26} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
  </W>
);
/** blanket: flat on the bed, or a sleeping lump (lump 1) with wing tips poking out; fly = thrown off (0..1+) */
const Blanket: React.FC<{t: number; lump: number; fly: number}> = ({t, lump, fly}) => {
  const br = 1 + 0.03 * Math.sin(2 * Math.PI * 0.5 * t);
  const h = 70 * lump * br;
  const d = `M -205 ${BED_TOP + 10} Q -120 ${BED_TOP - 4} -60 ${BED_TOP - h * 0.7} Q 20 ${BED_TOP - h * 1.25} 100 ${BED_TOP - h * 0.6} Q 160 ${BED_TOP - 4} 212 ${BED_TOP + 10} L 216 ${BED_TOP + 64} L -208 ${BED_TOP + 64} Z`;
  const fx = 420 * fly, fy = -380 * fly + 600 * fly * fly, fr = 40 * fly;
  return <W><g transform={`translate(${fx} ${fy}) rotate(${fr} 0 ${BED_TOP})`}>
    {lump > 0.5 && fly < 0.01 ? [-1, 1].map((sd) => <g key={sd} transform={`translate(${20 + sd * 110} ${BED_TOP - 40}) rotate(${sd * 35 - 90 + 6 * Math.sin(t * 3)}) scale(${sd} 1)`}>
      <path d={capsule(80, 34)} fill={FEATH} stroke={INK} strokeWidth={6} />
    </g>) : null}
    <path d={d} fill="#7FB2E5" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {[-130, -40, 50, 140].map((x, i) => <circle key={i} cx={x} cy={BED_TOP + 30} r={10} fill="#5E95CF" />)}
  </g></W>;
};

// shot 1: the bedroom bonks
const room1Guy = (t: number): WG => {
  if (t < 0.5) {                                   // frame 0: just hit the ceiling, now dropping onto the bed
    const y = (CEIL + 299) + 0.5 * 604 * t * t * 2;
    return {pose: 'scared', x: 0, y: Math.min(y, BED_TOP), a: flap(t, 7, 22, 34), s: 1, sx: 1 + spring(t, -0.05, 0.1, 3, 6), sy: 1 - spring(t, -0.05, 0.12, 3, 6), tremble: 1};
  }
  if (t < 1.95) {                                  // lands on the bed, dazed, looks up, shows off the wings
    let g = swap(t, 0.5, 'scared', 'surprised');
    if (t >= 1.1) g = swap(t, 1.1, 'surprised', 'lookup');
    const bounce = -24 * Math.abs(Math.sin(2 * Math.PI * 2.2 * (t - 0.5))) * Math.exp(-5 * (t - 0.5));
    const show = eio(seg(t, 1.15, 1.45)) * (1 - eio(seg(t, 1.6, 1.85)));
    const a = lerp(lerp(-45, -55, seg(t, 0.5, 0.9)), 24, show) + 4 * Math.sin(t * 9) * show;
    const pre = seg(t, 1.8, 1.95);
    return {pose: g.pose, x: 0, y: BED_TOP + bounce, a: lerp(a, -60, pre), s: lerp(0.6, 1, show), sx: g.sx * (1 + 0.05 * pre), sy: g.sy * (1 - 0.08 * pre)};
  }
  if (t < T.ceiling) {                              // flaps up, wobbly, then zooms into the ceiling
    const g = swap(t, 1.95, 'lookup', 'laugh');
    const hov = BED_TOP - 70 * eout(seg(t, 1.95, 2.5)) + 10 * Math.sin(t * 8);
    const y = lerp(hov, CEIL + 299, Math.pow(seg(t, 2.75, T.ceiling), 2));
    return {pose: g.pose, x: 6 * Math.sin(t * 5), y, a: flap(t, 6.5, 16, 40), s: 1, sx: g.sx, sy: g.sy, rot: 3 * Math.sin(t * 4)};
  }
  const g = swap(t, T.ceiling, 'laugh', 'scared');
  const drop = Math.max(0, t - 3.55);
  return {pose: g.pose, x: 0, y: CEIL + 299 + 0.5 * 1500 * drop * drop, a: 26 + 5 * Math.sin(t * 30) * (1 - seg(t, 3.2, 3.6)), s: 1,
    sx: 1 + spring(t, T.ceiling, 0.12, 3, 6), sy: 1 - spring(t, T.ceiling, 0.14, 3, 6), tremble: 1};
};
// shot 6: dawn, birds tapping, the lump in bed shoots up toward the ceiling
const room6Guy = (t: number): WG => {
  if (t < T.morning + 0.02) return {pose: 'scared', x: 0, y: 0, a: 0, s: 0, hide: true};
  const u = seg(t, T.morning, DURATION - LOOP_DUR - 0.05);
  const y = lerp(BED_TOP, CEIL + 330, eout(u));
  return {pose: 'scared', x: 0, y, a: flap(t, 7, 22, 34), s: 1, sx: 1 - spring(t, T.morning, 0.08, 3, 6), sy: 1 + spring(t, T.morning, 0.1, 3, 6), tremble: 1};
};
const RoomScene: React.FC<{t: number; thumb?: boolean; dy?: number}> = ({t, thumb, dy = 0}) => {
  const s6 = t >= S6;
  const g = s6 ? room6Guy(t) : room1Guy(t);
  const c0 = s6
    ? camAt([{t: S6, x: 110, y: -250, k: 1.42}, {t: T.window, x: 120, y: -270, k: 1.5}, {t: T.morning, x: 100, y: -270, k: 1.5},
        {t: DURATION - LOOP_DUR, x: 20, y: -390, k: 2.2}, {t: DURATION, x: 20, y: -390, k: 2.2}], t)
    : camAt([{t: 0, x: 20, y: -400, k: 2.35}, {t: 1.6, x: 20, y: -380, k: 2.3}, {t: S2, x: 20, y: -390, k: 2.4}], t);
  const sh = shake(t, s6 ? 0 : hit(t, -0.05, 9, 5) + hit(t, T.ceiling, 10, 5) + hit(t, 0.5, 4, 6));
  const cam: Cam = {...c0, x: c0.x + sh.x, y: c0.y + sh.y + dy};
  const headY = CEIL - 30;
  const stars = (t0: number) => [0, 1, 2, 3].map((i) => <Star key={i} x={Math.cos(i * 1.6 + t * 4) * 120} y={headY + Math.sin(i * 1.6 + t * 4) * 22}
    s={(t0 < 0 ? 1 - seg(t, 0.4, 0.6) : pulse(t, t0, 0.6)) * 0.8} rot={t * 120 + i * 40} />);
  const dizzy = !s6 && t > 0.5 && t < 1.1 ? [0, 1, 2].map((i) => <Star key={i} x={Math.cos(i * 2.1 + t * 7) * 80} y={BED_TOP - 300 + Math.sin(i * 2.1 + t * 7) * 20} s={0.5} rot={t * 200} />) : null;
  const zz = s6 && t < T.morning ? [0, 1, 2].map((i) => {
    const u = ((t - S6) * 0.9 + i / 3) % 1;
    return <Txt key={i} x={60 + 70 * u} y={BED_TOP - 120 - 180 * u} s={Math.sin(Math.PI * u) * 0.9} text="Z" size={60} fill="#FFFFFF" />;
  }) : null;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#F6E7CC'}}>
      <Layer cam={cam} z={1000} paper={false}><RoomBack t={t} tapping={s6} /></Layer>
      <Layer cam={cam} z={1000}><BedBack /></Layer>
      <Layer cam={cam} z={1000}>
        <WingGuy g={g} t={t} />
        <Blanket t={t} lump={s6 ? 1 : 0} fly={s6 ? 1.6 * seg(t, T.morning, T.morning + 0.9) : 0} />
        {s6 || thumb ? null : <>{stars(-1)}{stars(T.ceiling)}{dizzy}</>}
        {[-1, 1].map((sd) => <Feathers key={sd} t={t} born={-0.12} x={sd * 190} y={CEIL + 120} n={4} seed={3 + sd} />)}
        {[-1, 1].map((sd) => <Feathers key={sd} t={t} born={T.ceiling} x={sd * 190} y={CEIL + 120} n={4} seed={9 + sd} />)}
        {s6 ? <Feathers t={t} born={T.morning} x={0} y={BED_TOP - 60} seed={21} /> : null}
        {zz}
        <Txt x={0} y={CEIL - 110} s={!s6 ? pulse(t, T.ceiling, 0.45) : 0} text="BONK" size={100} rot={-6} fill={GOLD} />
        <Txt x={250} y={WIN.y0 - 50} s={s6 ? pulse(t, T.itll + 0.2, T.morning - T.itll - 0.3) : 0} text="TAP TAP" size={56} rot={6} fill={GOLD} />
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- shot 2: outside, straight up past roofs, birds and clouds ----------
const RISE: [number, number][] = [[T.outside, 0], [5.6, -160], [T.roofs, -760], [T.birds, -1950], [T.clouds, -3450], [S3, -3900]];
const riseY = (t: number) => spline(RISE, t);
const Cloud: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  const cs = [[-70, 10, 42], [-20, -22, 58], [45, -8, 50], [90, 16, 34], [10, 20, 44]];
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    {cs.map(([cx, cy, r], i) => <circle key={'i' + i} cx={cx} cy={cy} r={r + 7} fill={INK} />)}
    {cs.map(([cx, cy, r], i) => <circle key={'f' + i} cx={cx} cy={cy} r={r} fill="#fff" />)}
  </g>;
};
const House: React.FC<{x: number; w: number; h: number; wall: string; roof: string; win?: boolean}> = ({x, w, h, wall, roof, win = true}) => (
  <g>
    <rect x={x - w / 2} y={-h} width={w} height={h} fill={wall} stroke={INK} strokeWidth={8} />
    <path d={`M ${x - w / 2 - 40} ${-h + 4} L ${x} ${-h - w * 0.45} L ${x + w / 2 + 40} ${-h + 4} Z`} fill={roof} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {win ? [0, 1].map((r) => [-1, 1].map((c) => <rect key={`${r}${c}`} x={x + c * w * 0.22 - 40} y={-h + 70 + r * h * 0.45} width={80} height={80} fill="#FFD9A8" stroke={INK} strokeWidth={6} />)) : null}
    <rect x={x - 45} y={-140} width={90} height={140} fill="#9C6B43" stroke={INK} strokeWidth={6} />
  </g>
);
const UpScene: React.FC<{t: number}> = ({t}) => {
  const y = t < T.outside ? 0 : riseY(t);
  const vy = (riseY(t + 0.02) - riseY(t - 0.02)) / 0.04;
  const lead = t < T.outside ? 0 : Math.min(260, -vy * 0.16);
  const k = lerp(1.5, 1.22, eio(seg(t, T.outside, T.roofs)));
  const sh = shake(t, hit(t, T.outside, 5, 6));
  const cam: Cam = {x: sh.x, y: y - 190 - lead + sh.y, z: 1000 - 1000 / k};
  // pose: standing and flapping harder, takeoff, wow, joy
  let g = swap(t, S2 + 0.0001, 'front_calm', 'front_calm');
  if (t >= T.outside - 0.05) g = swap(t, T.outside - 0.05, 'front_calm', 'surprised');
  if (t >= T.birds + 0.25) g = swap(t, T.birds + 0.25, 'surprised', 'laugh');
  const build = seg(t, T.tried, T.outside);
  const a = t < T.tried ? lerp(-55, 10, seg(t, S2, S2 + 0.3)) : flap(t, lerp(2, 7, build), 16, lerp(18, 40, build));
  const pre = seg(t, T.outside - 0.2, T.outside - 0.05) * (t < T.outside ? 1 : 0);
  const guy: WG = {pose: g.pose, x: 10 * Math.sin(t * 3) * seg(t, T.outside, T.outside + 0.5), y, a, s: 1, sx: g.sx * (1 + 0.05 * pre), sy: g.sy * (1 - 0.08 * pre),
    rot: 2 * Math.sin(t * 5)};
  const sky = seg(t, T.roofs, T.clouds);
  const bg = `rgb(${lerp(251, 196, sky)}, ${lerp(247, 228, sky)}, ${lerp(236, 248, sky)})`;
  // a small flock crossing his path on "past the birds"
  const flock = [0, 1, 2].map((i) => {
    const bx = lerp(520, -520, seg(t, T.past - 0.7 + i * 0.12, T.birds + 1.0 + i * 0.12));
    const near = Math.abs(bx) < 120;
    return {x: bx + (i - 1) * 40, y: -1950 + (i - 1) * 90, dir: -1, look: near ? 1 : -1};
  });
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: bg}}>
      <Layer cam={cam} z={3200}><W>
        {[[-1300, -2100, 2.2], [1200, -2900, 2.6], [-600, -4300, 2.4], [900, -5200, 2.0]].map(([x, yy, s], i) => <Cloud key={i} x={x} y={yy} s={s} />)}
      </W></Layer>
      <Layer cam={cam} z={1800}>
        <W>{[-900, -380, 520, 1050].map((x, i) => <House key={i} x={x} w={300} h={260 + (i % 2) * 80} wall={['#F2C9A0', '#CFE3F2', '#E8D7F0', '#D9EFC9'][i]} roof={['#C65B4E', '#5E7FA8', '#8A5BA8', '#5DAF6E'][i]} />)}</W>
        <Ground y={0} color="#B9DCA0" />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Ground y={0} line={false} color="#A9D18E" />
        <W>
          <House x={-420} w={360} h={560} wall="#F6E7CC" roof="#C65B4E" />
          <House x={460} w={320} h={420} wall="#CFE3F2" roof="#5E7FA8" />
          <g transform="translate(-140 0)"><rect x={-14} y={-200} width={28} height={200} fill="#9C6B43" stroke={INK} strokeWidth={6} /><circle cx={0} cy={-240} r={80} fill="#7BBF6A" stroke={INK} strokeWidth={7} /></g>
          {flock.map((b, i) => <Bird key={i} x={b.x} y={b.y} dir={b.dir} s={1.1} col={BIRD_COLS[i]} fly={1} t={t} look={b.look} />)}
          {[[-260, -3450, 1.6], [250, -3420, 1.8], [0, -3330, 1.3], [-520, -3380, 1.5], [540, -3360, 1.4]].map(([x, yy, s], i) => <Cloud key={i} x={x} y={yy} s={s} />)}
        </W>
        <Puffs t={t} born={T.outside} x={-60} y={-10} n={4} life={0.7} size={28} vx={-200} vy={-40} color="#EDE6DA" seed={5} />
        <Puffs t={t} born={T.outside} x={60} y={-10} n={4} life={0.7} size={28} vx={200} vy={-40} color="#EDE6DA" seed={8} />
        <WingGuy g={guy} t={t} />
        <Feathers t={t} born={T.outside} x={0} y={-150} n={4} seed={13} />
        <Txt x={0} y={y - 420} s={pulse(t, T.birds - 0.05, 0.6)} text="EXCUSE ME" size={60} rot={-4} />
      </Layer>
      {/* a near cloud swooshing past the camera as he breaks through */}
      <Layer cam={cam} z={620}><W><Cloud x={-320} y={-3550} s={2.4} /><Cloud x={360} y={-3480} s={2.2} /></W></Layer>
    </AbsoluteFill>
  );
};

// ---------- shot 3: above the clouds, the birds join him in a V ----------
// placed by where they should land on screen (px from the centre) at the shot's camera (k 1.25, y -230): a V trailing up behind him
const V_SCR = [[235, -230], [335, -340], [415, -440], [475, -530]];
const V = V_SCR.flatMap(([sx, sy], j) => [-1, 1].map((side) => {
  const z = 1000 + 300 * (j + 1), sc = 1000 / (z - 200);
  return {i: j + 1, side, x: (side * sx) / sc, y: -230 + sy / sc, z};
}));
const VScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([{t: S3, x: 0, y: -230, k: 1.25}, {t: S4, x: 0, y: -250, k: 1.32}], t);
  let g = swap(t, S3 + 0.0001, 'laugh', 'laugh');
  if (t >= T.following + 0.1) g = swap(t, T.following + 0.1, 'laugh', 'surprised');
  const bobY = 14 * Math.sin(t * 3.2);
  const guy: WG = {pose: g.pose, x: 0, y: bobY, a: flap(t, 4.5, 16, 34), s: 1, sx: g.sx, sy: g.sy, rot: 3 * Math.sin(t * 2)};
  // clouds rushing past below (toward the camera)
  const clouds = Array.from({length: 7}, (_, i) => {
    const u = ((t - S3) * 0.55 + i / 7) % 1;
    return {z: lerp(5200, 520, u), x: (i % 2 ? 1 : -1) * (300 + 500 * rnd(i * 3)), y: 380 + 160 * rnd(i * 7), s: 1.6 + rnd(i) * 0.8};
  }).sort((a, b) => b.z - a.z);
  const birdIn = (j: number) => eout(seg(t, T.then + 0.05 + j * 0.16, T.then + 0.55 + j * 0.16));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#C4E4F8'}}>
      {clouds.map((c, i) => <Layer key={'c' + i} cam={cam} z={c.z} paper={false}><W><Cloud x={c.x} y={c.y} s={c.s} /></W></Layer>)}
      {[...V].reverse().map((b, j) => {
        const k = V.length - 1 - j, p = birdIn(k);
        return p > 0.01 ? <Layer key={'b' + k} cam={cam} z={b.z}><W>
          <BirdFront x={b.x + b.side * 900 * (1 - p)} y={b.y - 300 * (1 - p) + 10 * Math.sin(t * 3 + k)} s={1.5} col={BIRD_COLS[k % 5]} t={t} ph={k} />
        </W></Layer> : null;
      })}
      <Layer cam={cam} z={1000}>
        <WingGuy g={guy} t={t} />
        <Txt x={0} y={-470} s={pulse(t, T.following + 0.1, 0.55)} text="?!" size={110} rot={6} fill={GOLD} />
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- shot 4: he lands, they land ----------
const LANDERS = [-330, 330, -220, 220, -420, 420, -120, 130].map((x, i) => ({x, y: 30 + (i % 3) * 25, at: 12.92 + i * 0.075, col: BIRD_COLS[i % 5]}));
const LandScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([{t: S4, x: 0, y: -240, k: 1.36}, {t: S5, x: 0, y: -230, k: 1.4}], t);
  const sh = shake(t, hit(t, T.landed, 9, 6));
  const camS: Cam = {...cam, x: cam.x + sh.x, y: cam.y + sh.y};
  const fall = seg(t, S4, T.landed);
  const y = t < T.landed ? lerp(-1100, 0, fall * fall) : 0;
  let g = swap(t, T.landed, 'laugh', 'front_calm');
  if (t >= T.landed2 + 0.05) g = swap(t, T.landed2 + 0.05, 'front_calm', 'surprised');
  const land = spring(t, T.landed, 0.14, 3, 6);
  const a = t < T.landed ? flap(t, 3, 40, 12) : lerp(30, -58, eout(seg(t, T.landed, T.landed + 0.35)));
  const guy: WG = {pose: g.pose, x: 0, y, a, s: t < T.landed ? 1 : lerp(1, 0.4, seg(t, T.landed, T.landed + 0.35)), sx: g.sx * (1 + land), sy: g.sy * (1 - land)};
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <Layer cam={camS} z={2200}>
        <W>{[[-700, 0], [650, 0]].map(([x], i) => <g key={i} transform={`translate(${x} 0)`}><rect x={-20} y={-320} width={40} height={320} fill="#9C6B43" stroke={INK} strokeWidth={7} />
          <circle cx={0} cy={-380} r={140} fill="#7BBF6A" stroke={INK} strokeWidth={8} /></g>)}
          <Cloud x={-300} y={-900} s={1.4} /><Cloud x={500} y={-1050} s={1.1} /></W>
        <Ground y={0} color="#B9DCA0" />
      </Layer>
      <Layer cam={camS} z={1000}>
        <Ground y={0} line={false} color="#A9D18E" />
        <W>{Array.from({length: 14}, (_, i) => <path key={i} d={`M ${-650 + i * 100} ${60 + (i % 3) * 40} l 8 -22 l 8 22`} stroke="#6E9E58" strokeWidth={6} fill="none" strokeLinecap="round" />)}</W>
        <Puffs t={t} born={T.landed} x={-70} y={-10} n={5} life={0.8} size={30} vx={-220} vy={-40} color="#EDE6DA" seed={2} />
        <Puffs t={t} born={T.landed} x={70} y={-10} n={5} life={0.8} size={30} vx={220} vy={-40} color="#EDE6DA" seed={6} />
        <WingGuy g={guy} t={t} />
        <W>{LANDERS.map((b, i) => {
          if (t < b.at - 0.3) return null;
          const u = seg(t, b.at - 0.3, b.at);
          const by = lerp(b.y - 700, b.y, u * u), bx = b.x * lerp(1.5, 1, eout(u));
          const sq = t < b.at ? 1 : 1 - spring(t, b.at, 0.25, 3, 7);
          return <Bird key={i} x={bx} y={by} dir={b.x < 0 ? 1 : -1} s={1.05} col={b.col} t={t} fly={t < b.at ? 1 : 0} sq={sq} look={0.5} />;
        })}</W>
        <Txt x={0} y={-430} s={pulse(t, T.landed, 0.45)} text="THUD" size={90} rot={-6} fill={GOLD} />
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- shot 5: the power line, the bow, and the like-button bird ----------
const WIRE_Y = 0;
const PERCH = [-150, 150, -245, 245, -335, 335].map((x, i) => ({x, at: T.so - 0.05 + i * 0.09, col: BIRD_COLS[(i + 2) % 5]}));
const wireSag = (t: number, x: number) => {
  // the wire dips under each weight; a dip spreads out along the wire
  let y = WIRE_Y + 18 * (1 - (x / 900) ** 2) * (t > T.sat ? 1 : 0);
  const dip = (x0: number, t0: number, a: number) => t < t0 ? 0 : a * Math.exp(-((x - x0) ** 2) / 22000) * (1 + 1.4 * Math.exp(-4 * (t - t0)) * Math.cos(2 * Math.PI * 3 * (t - t0)));
  y += dip(0, T.sat, 26);
  for (const p of PERCH) y += dip(p.x, p.at, 7);
  return y;
};
const WireScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([{t: S5, x: 0, y: -170, k: 1.36}, {t: T.leader, x: 0, y: -170, k: 1.42}, {t: S6, x: 0, y: -150, k: 1.36}], t);
  const wy = (x: number) => wireSag(t, x);
  // guy drops onto the wire on "sat", balances, shrugs at the birds, laughs at "leader", looks up at the bird on his head
  const fall = seg(t, S5, T.sat);
  const gy = t < T.sat ? lerp(-700, wy(0), fall * fall) : wy(0);
  let g = swap(t, S5 + 0.0001, 'front_calm', 'front_calm');
  if (t >= T.now + 0.1) g = swap(t, T.now + 0.1, 'front_calm', 'shrug');
  if (t >= T.leader + 0.1) g = swap(t, T.leader + 0.1, 'shrug', 'laugh');
  if (t >= T.too - 0.05) g = swap(t, T.too - 0.05, 'laugh', 'lookup');
  const land = spring(t, T.sat, 0.12, 3, 6);
  const wob = t > T.sat ? 6 * Math.sin(t * 3.1) * (1 - 0.6 * seg(t, T.so, T.now)) : 0;
  const a = t < T.sat ? flap(t, 4, 30, 25) : lerp(20, -60, eout(seg(t, T.sat, T.sat + 0.4))) + (t > T.leader ? 18 * popIn(t, T.leader + 0.1, 0.3) * (1 - seg(t, T.leader + 0.9, T.leader + 1.2)) : 0);
  const guy: WG = {pose: g.pose, x: 0, y: gy, a, s: lerp(1, 0.35, seg(t, T.sat, T.sat + 0.4)), sx: g.sx * (1 + land), sy: g.sy * (1 - land), rot: wob};
  const bow = eio(seg(t, T.leader - 0.05, T.leader + 0.2)) * (1 - eio(seg(t, T.leader + 0.55, T.leader + 0.8)));
  // like button (world coords under the wire): pops in on "tap", cursor taps on "like", thumb sprouts wings on "and",
  // flies up and becomes a blue bird on "bird", lands on his head on "too"
  const LX = 0, LY = 330;
  const stS = popIn(t, T.tap, 0.3) * (1 - eio(seg(t, T.and2 + 0.15, T.and2 + 0.35)));
  const liked = t >= T.like;
  const fly = seg(t, T.and2 + 0.12, T.bird + 0.05);
  const headTop = gy - 299;
  const tx = lerp(LX - 70, 40, eio(fly)) + 60 * Math.sin(Math.PI * fly);
  const ty = lerp(LY, headTop - 120, eio(fly)) - 160 * Math.sin(Math.PI * fly);
  const thumbOn = t >= T.and2 && t < T.bird;
  const blueAt = T.bird, blueLand = T.bird + 0.28;
  const by = t < blueLand ? lerp(headTop - 120, headTop + 4, eio(seg(t, blueAt, blueLand))) : headTop + 4;
  const curK: [number, number, number][] = [[T.tap + 0.05, 330, 620], [T.like - 0.05, LX + 20, LY + 10], [T.like + 0.12, LX + 20, LY + 10], [T.and2, 360, 640]];
  let cur = {x: curK[0][1], y: curK[0][2]};
  for (let k = 0; k < curK.length - 1; k++) if (t >= curK[k][0]) { const e = eio(seg(t, curK[k][0], curK[k + 1][0])); cur = {x: lerp(curK[k][1], curK[k + 1][1], e), y: lerp(curK[k][2], curK[k + 1][2], e)}; }
  const press = Math.max(0, 1 - Math.abs(t - T.like) / 0.06);
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#D9EEF9'}}>
      <Layer cam={cam} z={3000}>
        <W>{[-1100, -500, 200, 900].map((x, i) => <House key={i} x={x} w={330} h={300} wall={['#F2C9A0', '#CFE3F2', '#E8D7F0', '#D9EFC9'][i]} roof={['#C65B4E', '#5E7FA8', '#8A5BA8', '#5DAF6E'][i]} />)}
          <Cloud x={-500} y={-1300} s={1.6} /><Cloud x={600} y={-1500} s={1.3} /></W>
        <Ground y={0} color="#B9DCA0" />
      </Layer>
      <Layer cam={cam} z={1000}>
        <W>
          {/* the wire, sagging under them */}
          {(() => { const pts = Array.from({length: 61}, (_, i) => { const x = -1500 + i * 50; return `${x} ${wy(x).toFixed(1)}`; }).join(' L ');
            return <><path d={'M ' + pts} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" /><path d={'M ' + pts} stroke="#4A4F57" strokeWidth={7} fill="none" /></>; })()}
        </W>
        <WingGuy g={guy} t={t} />
        <W>
          {PERCH.map((p, i) => {
            if (t < p.at - 0.28) return null;
            const u = seg(t, p.at - 0.28, p.at);
            const yy = t < p.at ? lerp(wy(p.x) - 600, wy(p.x), u * u) : wy(p.x);
            const sq = t < p.at ? 1 : 1 - spring(t, p.at, 0.22, 3, 7);
            return <Bird key={i} x={p.x} y={yy} dir={p.x < 0 ? 1 : -1} s={1.05} col={p.col} t={t} fly={t < p.at ? 1 : 0} sq={sq} bow={bow} look={0.6} />;
          })}
          {/* LEADER label with an arrow at him */}
          {(() => { const s = popIn(t, T.leader, 0.3) * (1 - seg(t, T.tap - 0.25, T.tap)); return s > 0.01 ? <g transform={`translate(-210 -560) scale(${s})`}>
            <path d="M 120 40 Q 170 70 180 120" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d="M 160 112 L 182 128 L 196 104" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" /></g> : null; })()}
        </W>
        <Txt x={-160} y={-560} s={popIn(t, T.leader, 0.3) * (1 - seg(t, T.tap - 0.25, T.tap))} text="LEADER" size={78} rot={-6} fill={GOLD} />
        {/* the like sticker + cursor */}
        <W>
          {stS > 0.01 ? <g transform={`translate(${LX} ${LY}) scale(${stS * (1 + spring(t, T.like, 0.1, 3, 7))})`}>
            <rect x={-150} y={-62} width={300} height={124} rx={34} fill="#fff" stroke={INK} strokeWidth={8} />
            <g transform="translate(-130 -42) scale(1.3)" opacity={thumbOn || t >= T.bird ? 0 : 1}><path d={THUMB_D} fill={liked ? '#3D8FD6' : '#fff'} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>
            <text x={52} y={6} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill={liked ? '#2F6FB5' : INK}>LIKE</text>
          </g> : null}
          {t > T.like && t < T.like + 0.35 ? <circle cx={LX - 70} cy={LY} r={20 + 70 * eout(seg(t, T.like, T.like + 0.35))} fill="none" stroke={INK} strokeWidth={9 * (1 - seg(t, T.like, T.like + 0.35))} /> : null}
          {t > T.tap + 0.05 && t < T.and2 ? <g transform={`translate(${cur.x} ${cur.y}) scale(${2.2 * (1 - 0.16 * press)})`}><path d={CURSOR_D} fill="#fff" stroke={INK} strokeWidth={3.4} strokeLinejoin="round" /></g> : null}
          {/* the thumb grows wings and flies */}
          {thumbOn ? <g transform={`translate(${tx} ${ty}) rotate(${-10 * Math.sin(t * 12)})`}>
            {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 34} -6) scale(${1.5 * sd * popIn(t, T.and2, 0.25)} ${1.5 * popIn(t, T.and2, 0.25)}) rotate(${-30 * Math.sin(2 * Math.PI * 8 * t)})`}>
              <path d="M 0 -8 Q 40 -40 76 -18 Q 56 6 0 12 Z" fill={COVERT} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>)}
            <g transform="translate(-64 -64) scale(2)"><path d={THUMB_D} fill="#3D8FD6" stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>
          </g> : null}
          {t >= blueAt ? <Bird x={36} y={by} dir={-1} s={0.95} col={BLUE} t={t} fly={t < blueLand ? 1 : 0} sq={t < blueLand ? 1 : 1 - spring(t, blueLand, 0.25, 3, 7)} look={-0.5} thumb /> : null}
        </W>
        <Puffs t={t} born={T.bird - 0.03} x={40} y={headTop - 150} n={6} life={0.5} size={36} vy={0} color="#FFFFFF" seed={31} />
        {[0, 1, 2].map((i) => <Star key={i} x={-60 + i * 100} y={headTop - 230 - (i % 2) * 40} s={pulse(t, T.bird + i * 0.05, 0.4) * 0.6} rot={i * 30} />)}
      </Layer>
    </AbsoluteFill>
  );
};

export const WingsScene: React.FC<{t: number; thumb?: boolean; dy?: number}> = ({t, thumb, dy}) => {
  const shot = t < S2 ? <RoomScene t={t} thumb={thumb} dy={dy} /> : t < S3 ? <UpScene t={t} /> : t < S4 ? <VScene t={t} /> : t < S5 ? <LandScene t={t} /> : t < S6 ? <WireScene t={t} /> : <RoomScene t={t} />;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#FBF7EC'}}>
      {shot}
      {thumb ? null : <>
        <HookTitle t={t} text="REAL WINGS. LOW CEILING." hi="WINGS" y={250} />
        <CommentAsk t={t} at={T.itll} until={DURATION - LOOP_DUR - 0.4} text="Where would you fly first?" y={250} />
      </>}
    </AbsoluteFill>
  );
};

export const WingsVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    // frame 0: the bonk is already happening
    {f: 'twang.mp3', at: 0.0, db: -12}, {f: 'pop.wav', at: 0.0, db: -12}, {f: 'whoosh.wav', at: 0.0, db: -26, to: 0.6},
    {f: 'squeak.wav', at: 0.5, db: -18}, {f: 'twang.mp3', at: 0.5, db: -26},
    {f: 'whisper_whoosh.wav', at: 1.2, db: -30, to: 0.6},
    {f: 'whir.mp3', at: 2.0, db: -30, to: 1.1}, {f: 'whoosh.wav', at: 2.8, db: -26},
    {f: 'twang.mp3', at: T.ceiling, db: -12}, {f: 'pop.wav', at: T.ceiling, db: -12}, {f: 'crack.wav', at: T.ceiling - 0.3, db: -22},
    // outside: liftoff, up past roofs / birds / clouds
    {f: 'whir.mp3', at: T.tried + 0.2, db: -32, to: 0.7}, {f: 'whoosh.wav', at: T.outside - 0.1, db: -18}, {f: 'pop.wav', at: T.outside, db: -22},
    {f: 'whisper_whoosh.wav', at: 5.7, db: -24}, {f: 'chirp.wav', at: T.birds - 0.1, db: -18}, {f: 'chirp.wav', at: T.birds + 0.25, db: -22},
    {f: 'whoosh.wav', at: T.clouds - 0.25, db: -20},
    // the V
    {f: 'chirp.wav', at: T.then + 0.2, db: -24}, {f: 'chirp.wav', at: T.birds2 + 0.2, db: -26}, {f: 'chirp.wav', at: 10.9, db: -24}, {f: 'pop.wav', at: T.following + 0.1, db: -22},
    // landings
    {f: 'whoosh.wav', at: S4, db: -26, to: 0.5}, {f: 'pop.wav', at: T.landed, db: -10}, {f: 'crack.wav', at: T.landed - 0.32, db: -26},
    ...LANDERS.map((b, i): Cue => ({f: 'pop.wav', at: b.at, db: -26 - (i % 2) * 2})), {f: 'chirp.wav', at: 13.2, db: -24},
    // the power line
    {f: 'twang.mp3', at: T.sat, db: -14}, ...PERCH.map((p, i): Cue => ({f: i % 2 ? 'pop.wav' : 'twang.mp3', at: p.at, db: -28})),
    {f: 'chirp.wav', at: T.think, db: -26}, {f: 'ding.mp3', at: T.leader, db: -22},
    // like -> bird
    {f: 'pop.wav', at: T.tap, db: -22}, {f: 'pop.wav', at: T.like, db: -14}, {f: 'ding.mp3', at: T.like + 0.03, db: -26},
    {f: 'whoosh.wav', at: T.and2 + 0.05, db: -26}, {f: 'confetti.wav', at: T.bird - 0.03, db: -24}, {f: 'pop.wav', at: T.bird + 0.28, db: -20},
    {f: 'chirp.wav', at: T.too, db: -20},
    // dawn: tapping, snoring, he shoots up
    {f: 'whoosh.wav', at: S6 - 0.05, db: -28, to: 0.5}, {f: 'snore.mp3', at: S6, db: -28},
    {f: 'peck.wav', at: T.itll, db: -22, to: 1.25}, {f: 'chirp.wav', at: T.window + 0.1, db: -24},
    {f: 'whoosh.wav', at: T.morning, db: -18}, {f: 'twang.mp3', at: T.morning, db: -26},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<WingsScene t={0} />}>
        <WingsScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="wings/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const WingsWide: React.FC = () => <WideFit.Provider value={0.72}><WingsVideo /></WideFit.Provider>;
