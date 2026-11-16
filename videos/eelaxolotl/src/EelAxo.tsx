// "Eel shock or axolotl healing?" - two people, two animal powers, one life each, no downsides (the user's idea).
// He gets an electric eel's shock (sparking hands, 860 V), she gets an axolotl's healing (pink axolotl gills, regrows
// legs). Their life in quick shots: frame 0 both powers on at once -> his volts (X-ray: stacked battery cells, live
// counter 0 -> 860) -> she breaks a leg skating and grows a new one (X-ray time-lapse) -> he jump-starts a car with a
// face -> she jumps off a building, no cast -> the comedy hit: their high five blasts her black, she heals in a second
// -> at 90: he lights his 90 candles and a lamp with his fingers ($0 power bill), she hurdles a bench on brand-new knees
// -> the comment ask over the frame-0 picture. Everything code-drawn over library poses.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, Cam, W, Guy, Pose, HEAD_R, Star, Puffs, ObjectFace, FACE0, Face, SoundLayer, Cue, seg, popIn, spring, lerp,
  eio, eout, rnd, clamp, shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, HookTitle, Sky} from './lib/kit';

// voice: tight.mp3 (tighten.py --tempo 1.12) at 0.1 s; times are video time. Last word ends ~21.3 s.
export const DURATION = 22.1;
export const T = {
  eels: 1.10, shock: 1.46, she: 2.08, axo: 2.69, healing: 3.26, who: 3.80, wins: 3.94,       // "He got an electric eel's shock, she got an axolotl's healing. Who wins?"
  his: 4.53, hands: 4.74, spark: 5.21, eight: 5.46, sixty: 6.17, volts: 6.60,               // "His hands spark eight hundred sixty volts."
  she2: 7.21, breaks: 7.42, leg: 7.78, and: 8.31, grows: 8.49, nw: 8.78, one: 8.99,         // "She breaks a leg, and grows a new one."
  he3: 9.37, jump: 9.58, cars: 10.15,                                                       // "He jump-starts cars."
  shes: 10.89, stunt: 11.31, no: 12.17, casts: 12.46, ever: 13.28,                          // "She's a stuntwoman. No casts, ever."
  their: 13.71, high: 13.92, fives: 14.14, messy: 14.78,                                    // "Their high fives get messy."
  at: 15.39, ninety: 15.60, nop: 16.24, power: 16.46, bills: 16.74, brand: 17.31, knees: 17.89, // "At ninety, no power bills, and brand-new knees."
  eel: 18.49, axo2: 19.35, comment: 20.47, below: 20.76,                                    // "Eel shock or axolotl healing? Comment below."
  cta: 15.45,
};

const GOLD = '#FFD43B', RED = '#E2453C', ZAP = '#FFE45C', ZAP2 = '#7FD8FF', HEALG = '#7BE08A';
const PINK = '#F7A8C4', PINK2 = '#E2789F', PINK3 = '#FFD3E2';
const EEL1 = '#5B6B7A', EEL2 = '#3F4C59', EELB = '#F2C14E';
const D2R = Math.PI / 180;
// sets along the world x axis (one world, hard camera cuts between them)
const HOME = 0, STREET = 3200, GARAGE = 6400, CITY = 9600, PARK = 12800;
const HIM = -115, HER = 135;           // frame-0 places
const ROOF = -1500;                    // building roof height

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = GOLD}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
const within = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);
type V = {x: number; y: number};
const headOf = (pose: Pose, flip = false) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s * (flip ? -1 : 1), hy: (m.head[1] - m.feet[1]) * s};
};
const rotP = (p: V, deg: number): V => { const a = deg * D2R; return {x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a)}; };

/** a jagged lightning bolt from a to b; the zigzag re-rolls 15x a second (seeded) */
const Bolt: React.FC<{a: V; b: V; t: number; seed?: number; w?: number; n?: number; jit?: number; color?: string}> = ({a, b, t, seed = 1, w = 10, n = 7, jit = 26, color = ZAP}) => {
  const k = Math.floor(t * 15) + seed * 31;
  const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n, j = i === 0 || i === n ? 0 : (rnd(k + i * 7.3) - 0.5) * 2 * jit;
    pts.push(`${(a.x + dx * u + nx * j).toFixed(1)} ${(a.y + dy * u + ny * j).toFixed(1)}`);
  }
  const d = 'M ' + pts.join(' L ');
  return <g>
    <path d={d} stroke={INK} strokeWidth={w + 8} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    <path d={d} stroke="#FFFFFF" strokeWidth={w * 0.3} fill="none" strokeLinejoin="round" strokeLinecap="round" />
  </g>;
};
/** small sparks crackling around a hand */
const Sparks: React.FC<{x: number; y: number; t: number; s?: number; seed?: number}> = ({x, y, t, s = 1, seed = 1}) => {
  if (s < 0.01) return null;
  const k = Math.floor(t * 15);
  return <g>
    <circle cx={x} cy={y} r={34 * s} fill={ZAP} opacity={0.35 + 0.15 * Math.sin(t * 40)} />
    {Array.from({length: 4}, (_, i) => {
      const a = (rnd(k * 3 + i + seed * 11) * 360) * D2R, r = (46 + 26 * rnd(k + i * 5 + seed)) * s;
      return <Bolt key={i} a={{x, y}} b={{x: x + Math.cos(a) * r, y: y + Math.sin(a) * r}} t={t} seed={seed * 10 + i} w={6 * s} n={3} jit={10 * s} />;
    })}
  </g>;
};
/** green healing sparkles (little plus signs) rising around a point */
const Heal: React.FC<{x: number; y: number; t: number; s?: number; spread?: number; seed?: number}> = ({x, y, t, s = 1, spread = 70, seed = 1}) => {
  if (s < 0.01) return null;
  return <g>
    {Array.from({length: 7}, (_, i) => {
      const ph = (t * 0.9 + rnd(i + seed * 7)) % 1;
      const px = x + (rnd(i * 3 + seed) - 0.5) * 2 * spread, py = y + 40 - ph * 150;
      const k = s * Math.sin(Math.PI * ph) * (0.7 + 0.5 * rnd(i * 9 + seed));
      return <path key={i} transform={`translate(${px} ${py}) scale(${k})`} d="M -6 -18 H 6 V -6 H 18 V 6 H 6 V 18 H -6 V 6 H -18 V -6 H -6 Z" fill={HEALG} stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
    })}
  </g>;
};
/** a cartoon leg (thigh to foot), pointing down from (0,0) */
const LEG_D = 'M -24 0 Q -28 60 -22 118 Q -46 124 -50 140 Q -50 154 -30 154 L 22 154 Q 30 152 26 120 Q 30 60 26 0 Z';
const LegDoodle: React.FC<{x: number; y: number; rot?: number; s?: number; fill?: string}> = ({x, y, rot = 0, s = 1, fill = '#FFFFFF'}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d={LEG_D} fill={fill} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M 14 10 Q 18 60 14 110" stroke="#D8D4CE" strokeWidth={8} fill="none" strokeLinecap="round" />
  </g>
);

// ---------- the characters ----------
/** her axolotl gills: three feathery pink fronds on each side of the head + a pink bow on top */
const Gills: React.FC<{x: number; y: number; t: number; rot?: number; frizz?: number; soot?: number}> = ({x, y, t, rot = 0, frizz = 0, soot = 0}) => {
  const R = HEAD_R;
  const fronds = [-38, -8, 22];
  return <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
    {[-1, 1].map((sd) => fronds.map((a0, i) => {
      const sway = 6 * Math.sin(t * 3 + i + sd) * (1 - frizz);
      const a = (a0 + sway) * (1 - frizz * 0.6) - frizz * 25;   // frizz: straight out and up like a shock
      const len = 56 + (i === 1 ? 12 : 0) + frizz * 20;
      return <g key={sd * 10 + i} transform={`scale(${sd} 1) translate(${R * 0.86} ${-8 + i * 22}) rotate(${a})`}>
        <path d={`M 0 0 Q ${len * 0.5} -12 ${len} -4`} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
        <path d={`M 0 0 Q ${len * 0.5} -12 ${len} -4`} stroke={soot > 0.5 ? '#3B3236' : PINK2} strokeWidth={13} fill="none" strokeLinecap="round" />
        {[0.3, 0.5, 0.7, 0.9].map((u) => <path key={u} d={`M ${len * u} ${-8 * Math.sin(Math.PI * u)} l ${frizz ? 4 : 8} ${frizz ? -22 : -18} M ${len * u} ${-8 * Math.sin(Math.PI * u)} l ${frizz ? 4 : 8} ${frizz ? 22 : 16}`}
          stroke={soot > 0.5 ? '#3B3236' : PINK2} strokeWidth={6} strokeLinecap="round" />)}
      </g>;
    }))}
    {/* bow */}
    <g transform={`translate(${-18} ${-R + 4}) rotate(-18)`}>
      <path d="M 0 0 L -30 -18 Q -38 0 -30 18 Z M 0 0 L 30 -18 Q 38 0 30 18 Z" fill={soot > 0.5 ? '#3B3236' : PINK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <circle r={9} fill={soot > 0.5 ? '#3B3236' : PINK2} stroke={INK} strokeWidth={5} />
    </g>
  </g></W>;
};
type Who = {pose: Pose; x: number; y?: number; flip?: boolean; rot?: number; sx?: number; sy?: number};
/** her: a library pose + axolotl gills (+ soot after the high five) */
const Her: React.FC<{w: Who; t: number; frizz?: number; soot?: number; glowLeg?: number}> = ({w, t, frizz = 0, soot = 0, glowLeg = 0}) => {
  const h = headOf(w.pose, w.flip), y = w.y ?? 0, rot = w.rot ?? 0, sy = w.sy ?? 1, sx = w.sx ?? 1;
  const hp = rotP({x: h.hx * sx, y: h.hy * sy}, rot);
  return <>
    {glowLeg > 0.01 ? <W><g opacity={glowLeg}>
      <ellipse cx={w.x + 30 * (w.flip ? -1 : 1)} cy={y - 70} rx={50} ry={85} fill={HEALG} opacity={0.45} />
    </g></W> : null}
    <Guy pose={w.pose} x={w.x} y={y} t={t} flip={w.flip} rot={rot} sx={sx} sy={sy} />
    <Gills x={w.x + hp.x} y={y + hp.y} t={t} rot={rot} frizz={frizz} soot={soot} />
    {soot > 0.01 ? <Soot x={w.x + hp.x} y={y + hp.y} s={soot} t={t} /> : null}
    {glowLeg > 0.01 ? <W><Heal x={w.x + 30 * (w.flip ? -1 : 1)} y={y - 60} t={t} s={glowLeg} spread={50} seed={4} /></W> : null}
  </>;
};
/** soot blotches over a head after the zap; they shrink away as she heals */
const Soot: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => (
  <W><g transform={`translate(${x} ${y})`}>
    {[[0, 0, 66], [-30, 34, 40], [34, 30, 38], [0, -40, 40], [-44, -10, 30], [44, -14, 30]].map(([dx, dy, r], i) =>
      <circle key={i} cx={dx * s} cy={dy * s} r={r * s} fill="#3B3236" />)}
    {s > 0.5 ? <>
      <circle cx={-22} cy={-4} r={11} fill="#fff" /><circle cx={22} cy={-4} r={11} fill="#fff" />
      <circle cx={-20} cy={-2} r={5} fill={INK} /><circle cx={24} cy={-2} r={5} fill={INK} />
    </> : null}
    {s > 0.3 ? [0, 1, 2].map((i) => { const ph = (t * 1.2 + i / 3) % 1; return <circle key={i} cx={-20 + i * 20 + 10 * Math.sin(t * 5 + i)} cy={-70 - ph * 90} r={14 * Math.sin(Math.PI * ph) * s} fill="#8D8790" stroke={INK} strokeWidth={4} />; }) : null}
  </g></W>
);

/** the electric eel co-star: a long wavy body, yellow belly, smug face, sparks on its tail */
const Eel: React.FC<{x: number; y: number; t: number; s?: number; mood?: 'smug' | 'grin'}> = ({x, y, t, s = 1, mood = 'smug'}) => {
  const pts: string[] = [], N = 14, L = 300;
  for (let i = 0; i <= N; i++) { const u = i / N; pts.push(`${(u * L).toFixed(1)} ${(18 * Math.sin(u * 7 - t * 6) * u).toFixed(1)}`); }
  const d = 'M ' + pts.join(' L ');
  const tail = {x: L, y: 18 * Math.sin(7 - t * 6)};
  return <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d={d} stroke={INK} strokeWidth={64} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={EEL1} strokeWidth={50} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={EELB} strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" transform="translate(0 14)" opacity={0.95} />
    <path d={d} stroke={EEL2} strokeWidth={8} fill="none" strokeLinecap="round" strokeDasharray="4 22" transform="translate(0 -10)" />
    <Sparks x={tail.x + 20} y={tail.y} t={t} s={0.7} seed={9} />
    {/* head */}
    <ellipse cx={-6} cy={0} rx={52} ry={40} fill={EEL1} stroke={INK} strokeWidth={7} />
    <ellipse cx={-6} cy={20} rx={40} ry={14} fill={EELB} />
    <circle cx={-22} cy={-12} r={13} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={-25} cy={-11} r={6} fill={INK} />
    <circle cx={8} cy={-12} r={13} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={5} cy={-11} r={6} fill={INK} />
    {mood === 'smug' ? <path d="M -36 -22 L -10 -18 M -4 -18 L 22 -22" stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
    <path d={mood === 'grin' ? 'M -40 10 Q -20 30 6 12' : 'M -40 12 Q -20 20 4 10 q 6 -2 8 -8'} stroke={INK} strokeWidth={5} fill={mood === 'grin' ? '#5A2328' : 'none'} strokeLinecap="round" />
  </g></W>;
};
/** the axolotl co-star: pink, wide head, three gills a side, permanent smile */
const Axolotl: React.FC<{x: number; y: number; t: number; s?: number; flip?: boolean; wave?: boolean}> = ({x, y, t, s = 1, flip, wave}) => {
  const bob = 4 * Math.sin(t * 3);
  return <W><g transform={`translate(${x} ${y + bob}) scale(${(flip ? -1 : 1) * s} ${s})`}>
    {/* tail + body */}
    <path d="M 40 -40 Q 140 -60 190 -20 Q 140 -10 60 -10 Z" fill={PINK} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <ellipse cx={30} cy={-40} rx={80} ry={40} fill={PINK} stroke={INK} strokeWidth={7} />
    {[[-10, 0], [70, 0]].map(([lx], i) => <path key={i} d={`M ${lx} -16 L ${lx - 6} 2 M ${lx - 20} 4 L ${lx + 8} 4`} stroke={INK} strokeWidth={14} strokeLinecap="round" />)}
    {[[-10, 0], [70, 0]].map(([lx], i) => <path key={'p' + i} d={`M ${lx} -16 L ${lx - 6} 2`} stroke={PINK} strokeWidth={7} strokeLinecap="round" />)}
    {/* waving front arm */}
    {wave ? <path d={`M -30 -50 Q -60 -90 ${-70 + 10 * Math.sin(t * 12)} -120`} stroke={INK} strokeWidth={16} fill="none" strokeLinecap="round" /> : null}
    {wave ? <path d={`M -30 -50 Q -60 -90 ${-70 + 10 * Math.sin(t * 12)} -120`} stroke={PINK} strokeWidth={8} fill="none" strokeLinecap="round" /> : null}
    {/* head */}
    <g transform="translate(-60 -70)">
      {[-1, 1].map((sd) => [-30, 0, 30].map((a, i) => (
        <g key={sd * 10 + i} transform={`translate(${sd * 56} ${-6 + i * 12}) rotate(${sd * (a - 20 + 6 * Math.sin(t * 3 + i))}) scale(${sd} 1)`}>
          <path d="M 0 0 Q 26 -8 52 -2" stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d="M 0 0 Q 26 -8 52 -2" stroke={PINK2} strokeWidth={10} fill="none" strokeLinecap="round" />
        </g>)))}
      <ellipse rx={64} ry={48} fill={PINK} stroke={INK} strokeWidth={7} />
      <ellipse cx={0} cy={16} rx={44} ry={18} fill={PINK3} />
      <circle cx={-26} cy={-6} r={8} fill={INK} /><circle cx={26} cy={-6} r={8} fill={INK} />
      <circle cx={-28} cy={-9} r={2.5} fill="#fff" /><circle cx={24} cy={-9} r={2.5} fill="#fff" />
      <path d="M -26 14 Q 0 32 26 14" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      <ellipse cx={-42} cy={10} rx={9} ry={5} fill={PINK2} opacity={0.6} /><ellipse cx={42} cy={10} rx={9} ry={5} fill={PINK2} opacity={0.6} />
    </g>
  </g></W>;
};

// ---------- sets ----------
const Grass: React.FC<{x0: number; x1: number; color?: string}> = ({x0, x1, color = '#A9D98A'}) => (
  <W>
    <rect x={x0} y={0} width={x1 - x0} height={3000} fill={color} />
    <path d={`M ${x0} 0 H ${x1}`} stroke={INK} strokeWidth={8} />
    {Array.from({length: Math.floor((x1 - x0) / 120)}, (_, i) => {
      const x = x0 + i * 120 + rnd(i + x0) * 80, y = 30 + rnd(i * 7 + x0) * 500;
      return <path key={i} d={`M ${x - 12} ${y} l 7 -22 l 6 19 l 7 -26 l 6 29`} stroke="#5F9B4A" strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
  </W>
);
const Cloud: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -200 40 Q -230 -30 -150 -50 Q -120 -130 -30 -110 Q 30 -170 110 -110 Q 200 -120 200 -40 Q 250 20 190 50 Z" fill="#FFFFFF" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
  </g>
);
const Far: React.FC<{t: number}> = ({t}) => (
  <W>
    {Array.from({length: 22}, (_, i) => <Cloud key={i} x={-1500 + i * 700 + 40 * Math.sin(t * 0.3 + i)} y={-900 - (i % 3) * 260} s={0.8 + 0.3 * rnd(i)} />)}
    <path d={`M -2000 0 ${Array.from({length: 40}, (_, i) => `Q ${-1800 + i * 400} ${-260 - 120 * rnd(i * 5)} ${-1600 + i * 400} 0`).join(' ')} V 400 H -2000 Z`} fill="#CDE8B6" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </W>
);
const Road: React.FC<{x0: number; x1: number}> = ({x0, x1}) => (
  <W>
    <rect x={x0} y={0} width={x1 - x0} height={3000} fill="#B9B4AC" />
    <path d={`M ${x0} 0 H ${x1}`} stroke={INK} strokeWidth={8} />
    {Array.from({length: Math.floor((x1 - x0) / 220)}, (_, i) => <rect key={i} x={x0 + i * 220} y={150} width={120} height={18} rx={9} fill="#FFFFFF" stroke={INK} strokeWidth={4} />)}
  </W>
);
const Rock: React.FC<{x: number}> = ({x}) => (
  <W><path d={`M ${x - 40} 4 Q ${x - 36} -40 ${x} -46 Q ${x + 40} -44 ${x + 44} 4 Z`} fill="#A39A90" stroke={INK} strokeWidth={7} strokeLinejoin="round" /></W>
);
const Skateboard: React.FC<{x: number; y: number; rot?: number}> = ({x, y, rot = 0}) => (
  <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M -90 -24 Q -100 -40 -84 -40 H 84 Q 100 -40 90 -24 Z" fill="#E86A4A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={-56} cy={-12} r={13} fill="#FFE07A" stroke={INK} strokeWidth={5} /><circle cx={56} cy={-12} r={13} fill="#FFE07A" stroke={INK} strokeWidth={5} />
  </g></W>
);
/** the car with a face (dead battery -> zapped awake) */
const Car: React.FC<{x: number; t: number; awake: number}> = ({x, t, awake}) => {
  const shakeY = awake > 0 ? 3 * Math.sin(t * 60) * (1 - seg(t, T.cars + 0.6, T.cars + 1.2)) : 0;
  const f: Face = awake > 0
    ? {...FACE0, open: popIn(t, T.jump + 0.2, 0.3), lx: -0.8, mouth: 'grin', squeeze: 0}
    : {...FACE0, open: 1, lid: 0.7, lx: -0.5, mouth: 'frown', brow: -8, sweat: 0.6};
  return <W><g transform={`translate(${x} ${shakeY})`}>
    <path d="M -230 -40 Q -230 -120 -170 -124 L -120 -126 Q -80 -210 20 -212 Q 120 -210 160 -130 L 210 -124 Q 240 -118 240 -60 L 240 -40 Z" fill="#5AA9E6" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -100 -130 Q -70 -190 10 -192 L 10 -130 Z M 30 -192 Q 110 -190 140 -130 L 30 -130 Z" fill="#DDF1FF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-140, 150].map((wx) => <g key={wx}><circle cx={wx} cy={-30} r={44} fill="#3A3A3E" stroke={INK} strokeWidth={7} /><circle cx={wx} cy={-30} r={16} fill="#C9C9CF" stroke={INK} strokeWidth={5} /></g>)}
    {/* headlight at the front (left), on when awake */}
    {awake > 0 ? <path d="M -232 -90 L -420 -150 L -420 -20 Z" fill="#FFF3A0" opacity={0.55 * awake} /> : null}
    <ellipse cx={-222} cy={-88} rx={14} ry={20} fill={awake > 0 ? '#FFF3A0' : '#E8E4D8'} stroke={INK} strokeWidth={5} />
    <ObjectFace x={-10} y={-80} r={120} f={f} t={t} lidColor="#5AA9E6" />
    {/* battery icon on the door */}
    <g transform="translate(110 -86)">
      <rect x={-34} y={-18} width={64} height={36} rx={6} fill="#fff" stroke={INK} strokeWidth={5} /><rect x={30} y={-8} width={8} height={16} fill={INK} />
      <rect x={-28} y={-12} width={awake > 0 ? 52 * eout(seg(t, T.jump + 0.2, T.cars)) + 4 : 8} height={24} rx={3} fill={awake > 0 ? '#5BC05B' : RED} />
    </g>
  </g></W>;
};
const Building: React.FC<{x: number}> = ({x}) => (
  <W>
    <rect x={x - 80} y={ROOF} width={560} height={-ROOF} fill="#E9C9A0" stroke={INK} strokeWidth={9} />
    {Array.from({length: 9}, (_, r) => [0, 1, 2].map((c) => <rect key={r * 3 + c} x={x - 10 + c * 160} y={ROOF + 80 + r * 150} width={90} height={90} rx={6} fill="#BFE3FF" stroke={INK} strokeWidth={6} />))}
    <rect x={x - 100} y={ROOF - 24} width={600} height={30} fill="#C79E70" stroke={INK} strokeWidth={8} />
    {/* stunt crash mat? none - she lands on the pavement, no cast needed */}
  </W>
);
const Cake: React.FC<{x: number; t: number; lit: number}> = ({x, t, lit}) => (
  <W><g transform={`translate(${x} 0)`}>
    <rect x={-120} y={-150} width={240} height={150} fill="#B9845A" stroke={INK} strokeWidth={8} />
    <rect x={-140} y={-170} width={280} height={30} rx={10} fill="#F2E5CF" stroke={INK} strokeWidth={7} />
    <rect x={-100} y={-250} width={200} height={84} rx={10} fill="#FFF4F7" stroke={INK} strokeWidth={7} />
    <path d="M -100 -230 Q -80 -205 -60 -230 Q -40 -205 -20 -230 Q 0 -205 20 -230 Q 40 -205 60 -230 Q 80 -205 100 -230" stroke={PINK2} strokeWidth={8} fill="none" />
    {[-30, 30].map((cx, i) => <g key={cx} transform={`translate(${cx} -250)`}>
      <text x={0} y={-30} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={84} fill={i ? '#7FD8FF' : GOLD} stroke={INK} strokeWidth={7} style={{paintOrder: 'stroke'}}>{i ? '0' : '9'}</text>
      {lit > 0.01 ? <path transform={`translate(0 -104) scale(${lit * (1 + 0.1 * Math.sin(t * 30 + i))})`} d="M 0 -30 Q 16 -8 0 6 Q -16 -8 0 -30 Z" fill="#FFB347" stroke={INK} strokeWidth={4} /> : null}
    </g>)}
  </g></W>
);
const Lamp: React.FC<{x: number; on: number; t: number}> = ({x, on, t}) => (
  <W><g transform={`translate(${x} 0)`}>
    {on > 0.01 ? <circle cx={0} cy={-300} r={150} fill="#FFF3A0" opacity={0.5 * on} /> : null}
    <path d="M 0 0 V -260" stroke={INK} strokeWidth={14} /><ellipse cx={0} cy={-4} rx={50} ry={12} fill="#6B6B70" stroke={INK} strokeWidth={6} />
    <path d="M -70 -250 L -44 -340 L 44 -340 L 70 -250 Z" fill={on > 0.5 ? '#FFE98A' : '#F2E3C4'} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  </g></W>
);
const Bench: React.FC<{x: number}> = ({x}) => (
  <W><g transform={`translate(${x} 0)`}>
    {[-110, 110].map((lx) => <rect key={lx} x={lx - 10} y={-80} width={20} height={80} fill="#8A6A48" stroke={INK} strokeWidth={6} />)}
    <rect x={-150} y={-100} width={300} height={28} rx={8} fill="#B98B5E" stroke={INK} strokeWidth={7} />
    <rect x={-150} y={-170} width={300} height={26} rx={8} fill="#B98B5E" stroke={INK} strokeWidth={7} />
    {[-110, 110].map((lx) => <rect key={'b' + lx} x={lx - 8} y={-170} width={16} height={74} fill="#8A6A48" stroke={INK} strokeWidth={5} />)}
  </g></W>
);

// ---------- screen inserts ----------
const Label: React.FC<{text: string; top: number; s?: number; bg?: string; color?: string; size?: number; rot?: number}> = ({text, top, s = 1, bg = '#fff', color = INK, size = 56, rot = -3}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: '50%', top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: bg, color, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>) : null;
const XFrame: React.FC<{s: number; top: number; children: React.ReactNode; id: string; rot?: number}> = ({s, top, children, id, rot = 0}) => (
  <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`}}>
    <svg width={760} height={760} viewBox="-380 -380 760 760" style={{overflow: 'visible'}}>
      <clipPath id={id}><circle r={320} /></clipPath>
      <circle r={338} fill={INK} />
      <g clipPath={`url(#${id})`}>
        <rect x={-380} y={-380} width={760} height={760} fill="#16223A" />
        {Array.from({length: 11}, (_, i) => <path key={i} d={`M ${-380 + i * 76} -380 V 380 M -380 ${-380 + i * 76} H 380`} stroke="#2A3A5C" strokeWidth={3} />)}
        {children}
      </g>
      <circle r={320} fill="none" stroke="#3E6FB0" strokeWidth={18} />
    </svg>
  </div>
);
/** X-RAY of his arm: a stack of battery cells that light up one by one while the counter climbs to 860 V */
const BatteryXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const u = eio(seg(t, T.spark, T.volts + 0.1));
  const volts = Math.round(860 * u), N = 10, lit = Math.round(N * u);
  const vS = popIn(t, T.volts, 0.3);
  return <>
    <XFrame s={s} top={1390} id="bxr" rot={1.5}>
      {/* arm outline across the panel */}
      <path d="M -380 -70 Q -100 -96 170 -70 Q 250 -64 270 -20 Q 280 20 250 50 Q 230 76 170 70 Q -100 92 -380 80 Z" fill="#EAF4FF" fillOpacity={0.1} stroke="#EAF4FF" strokeWidth={6} />
      {/* cells */}
      {Array.from({length: N}, (_, i) => {
        const x = -300 + i * 50, on = i < lit;
        return <g key={i}>
          <rect x={x} y={-46} width={40} height={92} rx={8} fill={on ? ZAP : '#2C3D60'} stroke="#EAF4FF" strokeWidth={5} />
          <path d={`M ${x + 20} -32 V -16 M ${x + 12} -24 H ${x + 28} M ${x + 12} 26 H ${x + 28}`} stroke={on ? INK : '#EAF4FF'} strokeWidth={4} strokeLinecap="round" />
        </g>;
      })}
      {/* bolt out of the fingertips */}
      {lit >= N - 1 ? <Bolt a={{x: 230, y: 0}} b={{x: 370, y: -20}} t={t} seed={3} w={10} jit={18} /> : null}
      <text x={0} y={-170} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={38} fill="#EAF4FF">BATTERY CELLS</text>
      <text x={0} y={200} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={128} fill={ZAP} stroke={INK} strokeWidth={8} style={{paintOrder: 'stroke'}}
        transform={`translate(0 200) scale(${1 + 0.25 * vS * (1 - seg(t, T.volts, T.volts + 0.4))}) translate(0 -200)`}>{volts} V</text>
      <rect x={-380} y={((t * 520) % 760) - 380} width={760} height={14} fill="#9FD3FF" opacity={0.22} />
    </XFrame>
    <div style={{position: 'absolute', left: 540, top: 1390, transform: `translate(-50%,-50%) scale(${s})`, width: 760, height: 760}}>
      <Label text="X-RAY" top={52} />
    </div>
  </>;
};
/** X-RAY time-lapse: the leg grows back from the knee down, bone first, then skin */
const LegXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const g = eio(seg(t, T.grows - 0.05, T.one + 0.25));
  const newS = popIn(t, T.nw, 0.3);
  return <>
    <XFrame s={s} top={1380} id="lxr" rot={-1.5}>
      {/* thigh coming in from the top */}
      <path d="M -60 -380 L -56 -120 Q 0 -100 56 -120 L 60 -380 Z" fill="#EAF4FF" fillOpacity={0.15} stroke="#EAF4FF" strokeWidth={6} />
      <path d="M 0 -380 V -130" stroke="#FFFFFF" strokeWidth={22} strokeLinecap="round" />
      <circle cx={0} cy={-122} r={20} fill="#FFFFFF" />
      {/* growing part, clipped from the knee down */}
      <clipPath id="grow"><rect x={-200} y={-125} width={400} height={20 + 300 * g} /></clipPath>
      <g clipPath="url(#grow)">
        <path d="M -52 -124 Q -58 40 -46 120 Q -110 130 -112 160 Q -110 190 -60 190 L 50 190 Q 62 180 52 120 Q 58 40 52 -124 Z" fill={HEALG} fillOpacity={0.25} stroke={HEALG} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 0 -110 V 130 M -80 160 H 30" stroke="#FFFFFF" strokeWidth={18} strokeLinecap="round" />
      </g>
      {g > 0.02 && g < 0.98 ? <ellipse cx={0} cy={-125 + 300 * g + 10} rx={70} ry={18} fill={HEALG} opacity={0.7} /> : null}
      <Heal x={0} y={-60 + 220 * g} t={t} s={1.6 * (g > 0.02 ? 1 : 0)} spread={150} seed={2} />
      {/* clock: the time-lapse */}
      <g transform="translate(230 -200)">
        <circle r={48} fill="#fff" stroke={INK} strokeWidth={6} />
        <path d={`M 0 0 L ${30 * Math.sin(t * 25)} ${-30 * Math.cos(t * 25)}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d={`M 0 0 L ${20 * Math.sin(t * 3)} ${-20 * Math.cos(t * 3)}`} stroke={RED} strokeWidth={7} strokeLinecap="round" />
      </g>
      <rect x={-380} y={((t * 520) % 760) - 380} width={760} height={14} fill="#9FD3FF" opacity={0.22} />
    </XFrame>
    <div style={{position: 'absolute', left: 540, top: 1380, transform: `translate(-50%,-50%) scale(${s})`, width: 760, height: 760}}>
      <Label text="REGROWING" top={52} />
      <Label text="NEW LEG" top={712} s={newS} bg={HEALG} rot={2} size={64} />
    </div>
  </>;
};
/** the power bill: $0, stamped */
const Bill: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const st = popIn(t, T.bills, 0.25);
  return <div style={{position: 'absolute', left: 540, top: 1440, transform: `translate(-50%,-50%) rotate(4deg) scale(${s})`, width: 520, background: '#FFFDF6', border: `9px solid ${INK}`,
    borderRadius: 18, boxShadow: `0 10px 0 ${INK}`, padding: '24px 34px', fontFamily: FONT, color: INK}}>
    <div style={{fontWeight: 900, fontSize: 52}}>POWER BILL</div>
    <div style={{height: 10, background: '#DDD7CB', borderRadius: 5, margin: '14px 0'}} /><div style={{height: 10, width: '70%', background: '#DDD7CB', borderRadius: 5}} />
    <div style={{fontWeight: 900, fontSize: 120, marginTop: 10}}>$0.00</div>
    {st > 0.01 ? <div style={{position: 'absolute', right: 26, top: 110, transform: `rotate(-14deg) scale(${2 - st})`, opacity: st, border: `8px solid ${RED}`, color: RED, borderRadius: 14,
      padding: '2px 18px', fontWeight: 900, fontSize: 64}}>PAID</div> : null}
  </div>;
};

// ---------- the shots ----------
type Shot = {a: number; x: number; y: number; k: number; x2?: number; y2?: number; k2?: number};
const SHOTS: Shot[] = [
  {a: 0, x: HOME - 5, y: -205, k: 2.25, k2: 2.35},                          // frame 0: both powers on
  {a: 1.95, x: HER + 40, y: -225, k: 3.0, k2: 3.15},                       // her + the axolotl
  {a: 3.72, x: 0, y: -200, k: 2.05, k2: 2.15},                              // who wins? VS
  {a: 4.45, x: HIM + 70, y: -215, k: 2.75, k2: 2.85},                        // his volts (X-ray below)
  {a: 7.1, x: STREET - 80, y: -230, k: 1.55, x2: STREET + 150, k2: 1.6},     // skate crash
  {a: 9.35, x: GARAGE + 40, y: -190, k: 1.75, k2: 1.85},                    // jump-start
  {a: 10.85, x: CITY + 40, y: ROOF - 160, k: 2.0},                          // stunt (camera follows the fall: see camOf)
  {a: 13.65, x: 0, y: -210, k: 2.35, k2: 2.5},                              // high five
  {a: 15.35, x: PARK - 20, y: -230, k: 1.6, k2: 1.66},                     // at ninety: candles + lamp
  {a: 17.2, x: PARK + 900, y: -240, k: 1.9, x2: PARK + 1000, k2: 1.95},    // new knees
  {a: 18.4, x: HOME - 5, y: -205, k: 2.25, k2: 2.3},                        // comment ask (frame-0 picture)
];
const shotOf = (t: number) => { let i = 0; while (i < SHOTS.length - 1 && t >= SHOTS[i + 1].a) i++; return i; };
// her stunt fall
const FALL0 = 11.42, FALL1 = 12.08;
const fallY = (t: number) => t < FALL0 ? 0 : t < FALL1 ? -ROOF * ((t - FALL0) / (FALL1 - FALL0)) ** 2 : -ROOF;
const camOf = (t: number): {x: number; y: number; k: number} => {
  const i = shotOf(t), s = SHOTS[i], b = i < SHOTS.length - 1 ? SHOTS[i + 1].a : DURATION;
  if (i === 6) {
    // roof -> follow her down -> ground
    const herY = ROOF + fallY(t);
    const y = t < FALL0 ? ROOF - 160 : t < FALL1 + 0.05 ? herY - 160 : lerp(-160 - 0, -210, eio(seg(t, FALL1, FALL1 + 0.5)));
    const k = t < FALL0 ? 2.0 : t < FALL1 ? lerp(2.0, 1.7, seg(t, FALL0, FALL1)) : lerp(1.7, 2.1, eio(seg(t, FALL1 + 0.1, b)));
    return {x: s.x, y, k};
  }
  const u = eio(seg(t, s.a, b));
  return {x: lerp(s.x, s.x2 ?? s.x, u), y: lerp(s.y, s.y2 ?? s.y, u), k: Math.exp(lerp(Math.log(s.k), Math.log(s.k2 ?? s.k), u))};
};

// ---------- the scene ----------
export const EelScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const c0 = camK ?? camOf(t);
  const sh = shake(t, hit(t, T.leg, 8, 6) + hit(t, FALL1, 14, 6) + hit(t, T.fives, 12, 6) + hit(t, T.jump + 0.2, 5, 7));
  const cam: Cam = {x: c0.x + sh.x, y: c0.y + sh.y, z: 1000 - 1000 / c0.k};
  const shot = camK ? 0 : shotOf(t);
  const st = (n: number) => shot === n;

  // ----- home: frame 0 / VS / ending -----
  const homeBoth = st(0) || st(1) || st(2) || st(3) || st(10);
  const himPose: Pose = st(2) ? 'point_right' : 'shrug';
  const herPose: Pose = st(2) ? 'front_wave' : 'front_wave';
  const zapOn = st(0) || st(3) || st(10) ? 1 : st(2) ? 0.7 : 0.6;
  const himHandL = {x: HIM - 108, y: -180}, himHandR = {x: HIM + 108, y: -180};
  // ----- high five -----
  const hfIn = eio(seg(t, 13.7, T.fives));
  const himHF = lerp(-300, -100, hfIn), herHF = lerp(300, 100, hfIn);
  const blast = t >= T.fives ? 1 : 0;
  const soot = t < T.fives ? 0 : 1 - eio(seg(t, T.messy + 0.15, T.messy + 0.55));
  // ----- street -----
  const skX = t < T.leg ? lerp(STREET - 700, STREET - 70, seg(t, 7.1, T.leg)) : STREET - 70;
  const tumble = seg(t, T.leg, T.leg + 0.4);
  const herSk: Who = t < T.leg ? {pose: 'walk', x: skX, y: -40}
    : t < T.leg + 0.4 ? {pose: 'scared', x: lerp(STREET - 40, STREET + 230, tumble), y: -40 - 260 * Math.sin(Math.PI * tumble) + 40 * tumble, rot: 360 * eout(tumble)}
    : t < 8.65 ? {pose: 'scared', x: STREET + 230, y: 0, rot: 0, sy: 1 - 0.25 * Math.exp(-8 * (t - T.leg - 0.4))}
    : {pose: 'front_wave', x: STREET + 230, y: 0, sy: 1 + spring(t, 8.65, 0.05, 3, 6)};
  const legFly = seg(t, T.leg, T.leg + 0.55);
  const boardX = t < T.leg ? skX : STREET - 20 + 360 * eout(seg(t, T.leg, T.leg + 0.8));
  // ----- garage -----
  const carAwake = t >= T.jump + 0.2 ? 1 : 0;
  // ----- stunt -----
  const herRoofX = CITY + 40;
  const landed = t >= FALL1;
  const herSt: Who = t < FALL0 ? {pose: 'front_wave', x: herRoofX, y: ROOF - 24, flip: true}
    : !landed ? {pose: 'scared', x: herRoofX, y: ROOF - 24 + fallY(t), rot: 20 * Math.sin((t - FALL0) * 9)}
    : t < T.no ? {pose: 'scared', x: herRoofX, y: 0, sy: 0.45, sx: 1.3}
    : {pose: 'front_wave', x: herRoofX, y: 0, flip: true, sy: 1 + spring(t, T.no, 0.12, 3, 5), sx: 1 - spring(t, T.no, 0.06, 3, 5)};
  // ----- park -----
  const candles = t >= T.ninety + 0.15 ? popIn(t, T.ninety + 0.15, 0.25) : 0;
  const lampOn = t >= T.nop + 0.05 ? 1 : 0;
  const hop = seg(t, T.brand - 0.1, T.knees + 0.15);
  const herPk: Who = {pose: hop > 0 && hop < 1 ? 'walk' : 'front_wave', x: lerp(PARK + 620, PARK + 1260, eio(hop)), y: -320 * Math.sin(Math.PI * hop)};

  // stickers
  const vsS = pulse(t, T.who - 0.05, 0.6);
  const healS = pulse(t, T.healing, 0.42);
  const zapS = pulse(t, T.shock - 0.1, 0.42);
  const sparkS = pulse(t, T.spark, 0.9);
  const snapS = pulse(t, T.leg, 0.5);
  const jumpS = pulse(t, T.jump + 0.2, 0.9);
  const stuntS = pulse(t, T.stunt, 0.6);
  const splatS = pulse(t, FALL1, 0.3);
  const noCastS = popIn(t, T.casts - 0.05, 0.3) * (1 - seg(t, 13.4, 13.62));
  const zapHF = pulse(t, T.fives, 0.55);
  const age = popIn(t, 15.42, 0.3) * (1 - seg(t, 17.0, 17.18));
  const kneeS = pulse(t, T.knees - 0.1, 0.75);
  const xBat = popIn(t, 4.9, 0.35) * (1 - seg(t, 6.9, 7.08));
  const xLeg = popIn(t, T.and - 0.05, 0.35) * (1 - seg(t, 9.15, 9.33));
  const billS = popIn(t, T.power - 0.1, 0.3) * (1 - seg(t, 17.0, 17.18));
  const frizz = st(7) && t >= T.fives ? 1 - eio(seg(t, T.messy + 0.15, T.messy + 0.55)) : 0;

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <Layer cam={cam} z={2600} paper={false}><Far t={t} /></Layer>
      <Layer cam={cam} z={1000}>
        {/* ground per set */}
        <Grass x0={-2000} x1={1600} />
        <Road x0={1600} x1={4800} />
        <Grass x0={4800} x1={8000} color="#C8C2B6" />
        <Road x0={8000} x1={11200} />
        <Grass x0={11200} x1={15000} />
        {/* street set */}
        <Rock x={STREET - 20} />
        {/* garage + city + park props */}
        <Car x={GARAGE + 200} t={t} awake={carAwake} />
        <Building x={CITY - 40} />
        <Cake x={PARK - 240} t={t} lit={candles} />
        <Lamp x={PARK + 235} on={lampOn} t={t} />
        <Bench x={PARK + 940} />

        {/* ---- home ---- */}
        {homeBoth ? <>
          {st(1) ? <Axolotl x={HER + 175} y={0} t={t} s={0.62} wave /> : null}
          {st(3) ? <Eel x={HIM + 150} y={-350} t={t} s={0.7} mood={t > T.volts ? 'grin' : 'smug'} /> : null}
          <Guy pose={himPose} x={HIM} y={0} t={t} />
          <Her w={{pose: herPose, x: HER}} t={t} glowLeg={st(1) || st(2) ? 0 : 1} />
          {himPose === 'shrug' ? <W>
            <Sparks x={himHandL.x} y={himHandL.y} t={t} s={zapOn} seed={1} />
            <Sparks x={himHandR.x} y={himHandR.y} t={t} s={zapOn} seed={2} />
            <Bolt a={himHandL} b={himHandR} t={t} seed={5} w={9} n={9} jit={30} />
          </W> : <W><Sparks x={HIM + 126} y={-187} t={t} s={0.7} seed={3} /></W>}
          {st(0) || st(10) ? <W><LegDoodle x={HER - 60} y={-22} rot={-90} s={0.8} /></W> : null}
        </> : null}
        {/* ---- street ---- */}
        {st(4) ? <>
          <Skateboard x={boardX} y={t < T.leg ? 0 : -4} rot={t < T.leg ? 0 : 40 * Math.sin(seg(t, T.leg, T.leg + 0.8) * Math.PI)} />
          <Her w={herSk} t={t} glowLeg={t > T.and ? 1 - seg(t, 9.1, 9.35) : 0} />
          {t > T.leg ? <W><LegDoodle x={lerp(STREET + 100, STREET + 520, legFly)} y={-30 - 300 * Math.sin(Math.PI * legFly) + 30 * legFly} rot={-80 + 500 * legFly} s={0.9} /></W> : null}
          <Puffs t={t} born={T.leg + 0.38} x={STREET + 230} y={-20} n={6} life={0.8} size={40} vx={0} vy={-60} color="#EDE6DA" seed={3} />
        </> : null}
        {/* ---- garage ---- */}
        {st(5) ? <>
          <Guy pose="point_right" x={GARAGE - 230} y={0} t={t} />
          <W>
            <Sparks x={GARAGE - 230 + 126} y={-187} t={t} s={1} seed={4} />
            {t > T.jump - 0.05 && t < T.jump + 0.55 ? <Bolt a={{x: GARAGE - 100, y: -187}} b={{x: GARAGE - 10, y: -120}} t={t} seed={6} w={12} jit={22} /> : null}
          </W>
          <Puffs t={t} born={T.jump + 0.3} x={GARAGE + 450} y={-50} n={6} life={1.0} size={34} vx={140} vy={-40} color="#D9D4CC" seed={7} />
        </> : null}
        {/* ---- stunt ---- */}
        {st(6) ? <>
          <Her w={herSt} t={t} glowLeg={t > T.no ? 1 - seg(t, 13.3, 13.6) : 0} />
          <Puffs t={t} born={FALL1} x={herRoofX - 90} y={-14} n={5} life={0.7} size={36} vx={-200} vy={-50} color="#EDE6DA" seed={5} />
          <Puffs t={t} born={FALL1} x={herRoofX + 90} y={-14} n={5} life={0.7} size={36} vx={200} vy={-50} color="#EDE6DA" seed={8} />
          {landed && t < T.no ? [0, 1, 2].map((i) => { const a = t * 6 + i * 2.1; return <Star key={i} x={herRoofX + Math.cos(a) * 90} y={-170 + Math.sin(a) * 18} s={0.5} rot={t * 200} />; }) : null}
        </> : null}
        {/* ---- high five ---- */}
        {st(7) ? <>
          <Guy pose="front_wave" x={himHF} y={0} t={t} />
          <Her w={{pose: 'front_wave', x: herHF, flip: true}} t={t} frizz={frizz} soot={soot} glowLeg={soot > 0 && soot < 1 ? 1 : 0} />
          {blast ? <W>
            {t < T.fives + 0.25 ? <circle cx={0} cy={-235} r={240 * eout(seg(t, T.fives, T.fives + 0.25))} fill="#FFFFFF" stroke={ZAP} strokeWidth={20} opacity={1 - seg(t, T.fives + 0.1, T.fives + 0.25)} /> : null}
            {t < T.messy + 0.2 ? <>
              <Bolt a={{x: 0, y: -240}} b={{x: herHF + 10, y: -255}} t={t} seed={7} w={10} n={6} jit={22} />
              <Bolt a={{x: herHF, y: -255}} b={{x: herHF + 60, y: -60}} t={t} seed={8} w={8} n={6} jit={22} />
            </> : null}
            <Sparks x={himHF + 110} y={-240} t={t} s={1 - seg(t, T.messy, T.messy + 0.3)} seed={6} />
            {soot > 0 ? <Heal x={herHF} y={-255} t={t} s={t > T.messy ? 1.2 : 0} spread={80} seed={6} /> : null}
          </W> : null}
        </> : null}
        {/* ---- park ---- */}
        {st(8) ? <>
          <Guy pose="present" x={PARK - 60} y={0} t={t} />
          <W>
            {/* cord from his fingers to the lamp */}
            <path d={`M ${PARK + 48} -172 Q ${PARK + 140} 40 ${PARK + 235} -4`} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
            <Sparks x={PARK + 48} y={-172} t={t} s={t > T.nop ? 0.8 : 0} seed={8} />
            {t > T.ninety && t < T.ninety + 0.35 ? <Bolt a={{x: PARK - 140, y: -240}} b={{x: PARK - 240, y: -350}} t={t} seed={9} w={10} jit={20} /> : null}
          </W>
        </> : null}
        {st(9) ? <>
          <Her w={herPk} t={t} glowLeg={0} />
          <W><Heal x={herPk.x} y={(herPk.y ?? 0) - 110} t={t} s={hop > 0 ? 1.1 : 0} spread={60} seed={9} /></W>
        </> : null}

        {/* stickers (world) */}
        <Txt x={HIM} y={-420} s={zapS} text="ZAP" size={82} rot={-8} />
        <Txt x={HER + 40} y={-450} s={healS} text="HEAL" size={86} rot={6} fill={HEALG} />
        <Txt x={0} y={-70} s={vsS} text="VS" size={130} rot={-6} />
        <Txt x={HIM + 20} y={-420} s={sparkS} text="SPARK" size={70} rot={-5} />
        <Txt x={STREET + 90} y={-420} s={snapS} text="SNAP" size={110} rot={-8} />
        <Txt x={GARAGE + 120} y={-390} s={jumpS} text="VROOM" size={96} rot={-6} />
        <Txt x={herRoofX} y={ROOF - 440} s={stuntS} text="STUNT" size={80} rot={6} />
        <Txt x={herRoofX} y={-330} s={splatS} text="SPLAT" size={96} rot={-8} />
        <Txt x={herRoofX} y={-420} s={noCastS} text="NO CASTS" size={84} rot={-4} fill={HEALG} />
        <Txt x={0} y={-470} s={zapHF} text="ZAP" size={120} rot={-6} />
        <Txt x={PARK - 130} y={-470} s={age} text="AGE 90" size={84} rot={-5} />
        <Txt x={herPk.x} y={-560} s={kneeS} text="NEW KNEES" size={78} rot={-4} fill={HEALG} />
      </Layer>
      {/* inserts */}
      <BatteryXRay t={t} s={xBat} />
      <LegXRay t={t} s={xLeg} />
      <Bill t={t} s={billS} />
      {thumb ? null : <>
        <HookTitle t={t} text="860 VOLTS VS NEW LEGS" hi="VOLTS" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.eel - 0.05} until={21.15} text="Eel shock or axolotl healing?" />
      </>}
    </AbsoluteFill>
  );
};

export const EelVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks: Cue[] = [];
  for (let i = 1; i <= 16; i++) ticks.push({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(T.spark, T.volts + 0.1, i / 16), db: -29});
  const cues: Cue[] = [
    {f: 'zap.wav', at: 0, db: -14}, {f: 'whoosh.wav', at: 0, db: -20}, {f: 'hum.wav', at: 0, db: -34, to: 1.95},
    {f: 'zap.wav', at: T.shock - 0.1, db: -22}, {f: 'whoosh.wav', at: 1.9, db: -28}, {f: 'pop.wav', at: T.healing, db: -22}, {f: 'chirp.wav', at: 2.4, db: -30},
    {f: 'whoosh.wav', at: 3.68, db: -28}, {f: 'pop.wav', at: T.who - 0.05, db: -18},
    {f: 'whoosh.wav', at: 4.4, db: -28}, {f: 'hum.wav', at: 4.45, db: -32, to: 2.65}, {f: 'zap.wav', at: 4.9, db: -24}, ...ticks, {f: 'zap.wav', at: T.volts, db: -18}, {f: 'ding.mp3', at: T.volts + 0.05, db: -24},
    {f: 'whoosh.wav', at: 7.05, db: -28}, {f: 'whir.mp3', at: 7.1, db: -32, to: 0.65}, {f: 'crack.wav', at: T.leg - 0.3, db: -16}, {f: 'twang.mp3', at: T.leg, db: -22},
    {f: 'whoosh.wav', at: T.leg + 0.05, db: -24}, {f: 'pop.wav', at: T.leg + 0.42, db: -18},
    {f: 'zap.wav', at: T.and - 0.05, db: -30}, {f: 'squeak.wav', at: T.grows, db: -30}, {f: 'pop.wav', at: T.nw, db: -20}, {f: 'ding.mp3', at: T.one + 0.2, db: -26},
    {f: 'whoosh.wav', at: 9.3, db: -28}, {f: 'zap.wav', at: T.jump - 0.05, db: -16}, {f: 'whir.mp3', at: T.jump + 0.25, db: -26, to: 0.9}, {f: 'horn.wav', at: T.cars + 0.15, db: -28, to: 0.45},
    {f: 'whoosh.wav', at: 10.8, db: -28}, {f: 'pop.wav', at: T.stunt, db: -24}, {f: 'whisper_whoosh.wav', at: FALL0, db: -20},
    {f: 'crack.wav', at: FALL1 - 0.3, db: -18}, {f: 'twang.mp3', at: FALL1, db: -18}, {f: 'chirp.wav', at: FALL1 + 0.1, db: -30},
    {f: 'pop.wav', at: T.no, db: -18}, {f: 'pop.wav', at: T.casts, db: -22}, {f: 'ding.mp3', at: T.ever, db: -28},
    {f: 'whoosh.wav', at: 13.6, db: -28}, {f: 'zap.wav', at: T.fives, db: -10}, {f: 'twang.mp3', at: T.fives + 0.05, db: -20}, {f: 'crowd_laugh.wav', at: T.fives + 0.25, db: -31, to: 1.2},
    {f: 'ding.mp3', at: T.messy + 0.25, db: -26},
    {f: 'whoosh.wav', at: 15.3, db: -28}, {f: 'zap.wav', at: T.ninety, db: -22}, {f: 'pop.wav', at: T.ninety + 0.15, db: -24}, {f: 'zap.wav', at: T.nop, db: -26},
    {f: 'pop.wav', at: T.power - 0.1, db: -26}, {f: 'pop.wav', at: T.bills, db: -18},
    {f: 'whoosh.wav', at: 17.15, db: -28}, {f: 'whoosh.wav', at: T.brand, db: -24}, {f: 'pop.wav', at: T.knees + 0.15, db: -22},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: 18.35, db: -28}, {f: 'pop.wav', at: T.eel - 0.05, db: -26},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<EelScene t={0} />}>
        <EelScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="eel/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const EelWide: React.FC = () => <WideFit.Provider value={0.72}><EelVideo /></WideFit.Provider>;
