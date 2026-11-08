// "Why don't birds on power lines get shocked?" - built from the kit: library poses for the guy,
// the bird, pole, wires, current, tags and the zap all drawn in code in the same flat outlined style.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, C, Layer, camAt, Sky, Ground, Guy, swap, ContactShadow, Ball, ObjectFace, FACE0, Face, Puffs,
  SoundLayer, Cue, W, seg, popIn, spring, shake, hit, lerp, eio, clamp, rnd, WideFit, Pose} from './lib/kit';

// beat times = voice word times (checked against the loudness envelope) + 0.1 s voice offset
export const T = {
  thousands: 2.5, volts: 3.16, why: 4.48, fried: 5.1, glide: 5.5, feet: 6.68, same1: 7.3, same2: 9.06, voltage: 9.3,
  difference: 10.44, no2: 11.24, current: 11.46, electricity: 12.4, wire3: 13.94,
  but: 14.84, wing: 15.34, another: 15.98, realise: 16.95, zap: 17.32, frz: 17.62, land: 18.95,
};
export const DURATION = 19.2;

// ---------- world layout (Z = 1000 layer, ground at y = 0) ----------
const GX = -130;   // the guy's feet
const PX = 250;    // power pole
const BX = 50;     // the bird (midpoint between its feet)
type Span = {x0: number; x1: number; y: number; S: number};
const span = (x0: number, x1: number, y: number): Span => ({x0, x1, y, S: 45});
const HY = -654, GY = -834; // wire heights at the pole
const HOT = [span(PX - 60 - 1700, PX - 60, HY), span(PX + 60, PX + 60 + 1700, HY)]; // 7,200 V wire (on the insulators)
const GND = [span(PX - 1700, PX, GY), span(PX, PX + 1700, GY)];                     // grounded top wire (0 V)
const spanY = (s: Span, x: number) => { const u = (x - s.x0) / (s.x1 - s.x0); return s.y + 4 * s.S * u * (1 - u); };
const spanSlope = (s: Span, x: number) => { const u = (x - s.x0) / (s.x1 - s.x0); return (4 * s.S * (1 - 2 * u)) / (s.x1 - s.x0); };
/** part of a sagging wire as one quadratic curve (exact for the parabola) */
const spanD = (s: Span, a = s.x0, b = s.x1) =>
  `M ${a} ${spanY(s, a)} Q ${(a + b) / 2} ${spanY(s, a) + (spanSlope(s, a) * (b - a)) / 2} ${b} ${spanY(s, b)}`;
const hotY = (x: number) => spanY(HOT[0], x);
const gndY = (x: number) => spanY(GND[0], x);
const BY = hotY(BX);
const HOT_W = 8, GND_W = 6;
const CX = BX + 66, CY = gndY(CX) + GND_W / 2 + 4; // where the wing tip touches the top wire

// ---------- colours ----------
const WOOD = '#B9844F', WOOD_D = '#9A6A3E', GLASS = '#CFE8DE', WIRE = '#4A5260', ZAPY = '#FFE45C';
const RED = '#FF6A4B', RED_D = '#E8533A', RED_W = '#D64430', BELLY = '#FFD2C2', BEAK = '#FFC93C', BEAK_D = '#E9A21C', LEG = '#F6A13B';
const SOOT = '#A04D40', SOOT_D = '#843D33', SOOT_W = '#70352D', BELLY_S = '#C99282';
const XRAY = '#22335A', BONE = '#F2F6FF';

// ---------- small shapes ----------
const ellD = (cx: number, cy: number, rx: number, ry: number) => `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;
/** leaf / feather shape from (bx, by) pointing at angle ang (0 = up, degrees) */
const leafD = (bx: number, by: number, ang: number, l: number, w: number) => {
  const a = (ang * Math.PI) / 180, dx = Math.sin(a), dy = -Math.cos(a), px = -dy, py = dx;
  const mx = bx + dx * l * 0.5, my = by + dy * l * 0.5;
  return `M ${bx} ${by} Q ${mx + px * w} ${my + py * w} ${bx + dx * l} ${by + dy * l} Q ${mx - px * w} ${my - py * w} ${bx} ${by} Z`;
};
const spikyD = (cx: number, cy: number, rx: number, ry: number, n: number, amt: number, seed: number) => {
  const p: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const a = (i / (n * 2)) * Math.PI * 2, k = i % 2 ? 1 + amt * (0.6 + 0.8 * rnd(seed + i)) : 0.96;
    p.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`);
  }
  return 'M ' + p.join(' L ') + ' Z';
};
/** jagged lightning through the given points; seed changes the jags */
const boltD = (pts: number[][], seed: number, jag: number) => {
  const out: string[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 16)), len = Math.hypot(x1 - x0, y1 - y0) || 1;
    for (let j = 0; j < n; j++) {
      const u = j / n, o = j === 0 ? 0 : (rnd(seed + i * 31 + j * 7) - 0.5) * 2 * jag;
      out.push(`${(x0 + (x1 - x0) * u - ((y1 - y0) / len) * o).toFixed(1)} ${(y0 + (y1 - y0) * u + ((x1 - x0) / len) * o).toFixed(1)}`);
    }
  }
  const e = pts[pts.length - 1];
  return 'M ' + out.join(' L ') + ` L ${e[0]} ${e[1]}`;
};
const Bolt: React.FC<{d: string; w?: number}> = ({d, w = 1}) => (
  <g>
    <path d={d} stroke={INK} strokeWidth={13 * w} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    <path d={d} stroke={ZAPY} strokeWidth={7 * w} fill="none" strokeLinejoin="round" strokeLinecap="round" />
    <path d={d} stroke="#FFFBE0" strokeWidth={2.5 * w} fill="none" strokeLinejoin="round" strokeLinecap="round" />
  </g>
);

// ---------- set: pole, wires, current ----------
const Insulator: React.FC<{x: number; yb: number; yt: number}> = ({x, yb, yt}) => {
  const h = yb - yt;
  return <g>
    <rect x={x - 6} y={yt} width={12} height={h} fill={GLASS} stroke={INK} strokeWidth={5} />
    {[0.22, 0.55, 0.88].map((q) => <rect key={q} x={x - 15} y={yt + h * q - 4} width={30} height={8} rx={4} fill={GLASS} stroke={INK} strokeWidth={5} />)}
  </g>;
};
const Pole: React.FC = () => {
  const ca = HY + 30, top = GY + 14; // crossarm top, pole top
  const braces = `M ${PX - 62} ${ca + 20} L ${PX - 8} ${ca + 78} M ${PX + 62} ${ca + 20} L ${PX + 8} ${ca + 78}`;
  return <W>
    <path d={braces} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <path d={braces} stroke={WOOD_D} strokeWidth={6} strokeLinecap="round" />
    <rect x={PX - 17} y={top} width={34} height={10 - top} rx={9} fill={WOOD} />
    <rect x={PX + 5} y={top + 14} width={12} height={-4 - top} fill={WOOD_D} />
    <rect x={PX - 17} y={top} width={34} height={10 - top} rx={9} fill="none" stroke={INK} strokeWidth={7} />
    <rect x={PX - 92} y={ca} width={184} height={24} rx={6} fill={WOOD} stroke={INK} strokeWidth={6} />
    <Insulator x={PX - 60} yb={ca} yt={HY} />
    <Insulator x={PX + 60} yb={ca} yt={HY} />
    <rect x={PX - 10} y={GY - 6} width={20} height={22} rx={5} fill="#9AA4AE" stroke={INK} strokeWidth={5} />
  </W>;
};
const WireLine: React.FC<{s: Span; w: number; flash?: number}> = ({s, w, flash = 0}) => (
  <W>
    <path d={spanD(s)} stroke={INK} strokeWidth={w + 8} fill="none" strokeLinecap="round" />
    <path d={spanD(s)} stroke={WIRE} strokeWidth={w} fill="none" strokeLinecap="round" />
    {flash > 0.01 ? <path d={spanD(s)} stroke="#FFF3A6" strokeOpacity={flash} strokeWidth={w + 2} fill="none" strokeLinecap="round" /> : null}
  </W>
);
// ---------- current: power over time + distance travelled ----------
// The dashes move by the distance travelled (the integral of speed), never time x speed, so speed changes never make them jump.
// Each surge adds a whole number of dash periods, so outside the surges the dashes sit exactly where a steady flow puts them.
const P0 = 0.22, V0 = lerp(230, 780, P0), PERIOD = lerp(14, 44, P0) + lerp(90, 74, P0);
const bumpV = (t: number) => 0.5 * seg(t, T.volts - 0.1, T.volts + 0.1) * (1 - seg(t, T.volts + 0.5, T.volts + 1.0));
const bumpE = (t: number) => Math.max(0, eio(seg(t, T.electricity, T.electricity + 0.3)) * (1 - eio(seg(t, 14.3, 14.7))) - P0);
const powerAt = (t: number) => P0 + Math.max(bumpV(t), bumpE(t));
const integ = (f: (x: number) => number, a: number, b: number) => {
  const n = Math.max(1, Math.ceil((b - a) * 2400)), h = (b - a) / n; let sum = 0;
  for (let i = 0; i < n; i++) sum += f(a + (i + 0.5) * h);
  return sum * h;
};
const WV = [T.volts - 0.1, T.volts + 1.0], WE = [T.electricity, 14.7];
const IV = integ(bumpV, WV[0], WV[1]), IE = integ(bumpE, WE[0], WE[1]);
const KV = (Math.round((550 * IV) / PERIOD) * PERIOD) / IV, KE = (Math.round((550 * IE) / PERIOD) * PERIOD) / IE;
const travelled = (t: number) => V0 * t + KV * integ(bumpV, WV[0], clamp(t, WV[0], WV[1])) + KE * integ(bumpE, WE[0], clamp(t, WE[0], WE[1]));
/** current = yellow dashes sliding along the wire; p 0..1 = small/slow .. big/fast */
const Current: React.FC<{s: Span; t: number; p: number}> = ({s, t, p}) => {
  const dash = lerp(14, 44, p), gap = PERIOD - dash, off = -(travelled(t) % PERIOD), d = spanD(s);
  return <W>
    {p > 0.3 ? <path d={d} stroke="#FFF4B0" strokeOpacity={0.55 * seg(p, 0.3, 1)} strokeWidth={HOT_W + 16} fill="none" strokeLinecap="round"
      strokeDasharray={`${dash + 12} ${gap - 12}`} strokeDashoffset={off + 6} /> : null}
    <path d={d} stroke={ZAPY} strokeWidth={lerp(4, 6.5, p)} fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${gap}`} strokeDashoffset={off} />
  </W>;
};

// ---------- tags ----------
const Tag: React.FC<{x: number; y: number; ax: number; ay: number; text: string; s: number; fill?: string; fs?: number}> =
  ({x, y, ax, ay, text, s, fill = C.yellow, fs = 30}) => {
    if (s < 0.01) return null;
    const w = text.length * fs * 0.62 + fs * 0.9, h = fs * 1.5;
    const bx = clamp(ax, x - w / 2 + 16, x + w / 2 - 16), by = ay < y ? y - h / 2 + 2 : y + h / 2 - 2;
    const tail = `M ${bx - 11} ${by} L ${ax} ${ay} L ${bx + 11} ${by} Z`;
    const box = {x: x - w / 2, y: y - h / 2, width: w, height: h, rx: h * 0.32};
    return <W><g transform={`translate(${ax} ${ay}) scale(${s}) translate(${-ax} ${-ay})`}>
      <path d={tail} fill={INK} stroke={INK} strokeWidth={12} strokeLinejoin="round" />
      <rect {...box} fill={INK} stroke={INK} strokeWidth={12} />
      <path d={tail} fill={fill} />
      <rect {...box} fill={fill} />
      <text x={x} y={y + fs * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={fs} fill={INK}>{text}</text>
    </g></W>;
  };
const Equals: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => s < 0.01 ? null : (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-7, 7].map((dy) => <rect key={dy} x={-15} y={dy - 4.5} width={30} height={9} rx={4.5} fill="#fff" stroke={INK} strokeWidth={5} />)}
  </g></W>
);
const NoSign: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => s < 0.01 ? null : (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={23} fill={INK} />
    <circle r={18.5} fill="#fff" />
    <circle r={14.5} fill="none" stroke="#E8382B" strokeWidth={7} />
    <line x1={-10} y1={-10} x2={10} y2={10} stroke="#E8382B" strokeWidth={7} strokeLinecap="round" />
  </g></W>
);

// ---------- the bird ----------
type Wing = {a: number; L: number}; // a: degrees away from hanging down (outward), L: length
type BirdS = {face: Face; beak: number; wl: Wing; wr: Wing; frz: boolean; xray: boolean; sy: number; lean: number; glow: number};
const SH = {x: 40, y: -74};           // right shoulder (left one mirrored)
const WING0: Wing = {a: 12, L: 50};   // folded
const wingD = (L: number) => {
  const w = 13 + 0.08 * L;
  return `M ${-w * 0.6} 0 C ${-w * 1.3} ${L * 0.32} ${-w * 0.95} ${L * 0.8} ${-w * 0.25} ${L} Q 0 ${L * 1.06} ${w * 0.25} ${L} C ${w * 0.95} ${L * 0.8} ${w * 1.3} ${L * 0.32} ${w * 0.6} 0 Z`;
};
const rad = (d: number) => (d * Math.PI) / 180;
const toWorld = (lx: number, ly: number, lean: number) => ({x: BX + lx * Math.cos(rad(lean)) - ly * Math.sin(rad(lean)), y: BY + lx * Math.sin(rad(lean)) + ly * Math.cos(rad(lean))});
/** wing angle + length so the (right) wing tip lands on world point (wx, wy) */
const wingTo = (wx: number, wy: number, lean: number): Wing => {
  const dx0 = wx - BX, dy0 = wy - BY, r = rad(-lean);
  const lx = dx0 * Math.cos(r) - dy0 * Math.sin(r), ly = dx0 * Math.sin(r) + dy0 * Math.cos(r);
  const dx = lx - SH.x, dy = ly - SH.y;
  return {a: (Math.atan2(dx, dy) * 180) / Math.PI, L: Math.hypot(dx, dy) / 1.03};
};
const wingTf = (side: number, w: Wing) => `translate(${side * SH.x} ${SH.y}) rotate(${-side * w.a})`;
const TAIL = 'M -14 -30 L 14 -30 L 16 30 Q 10 41 5 32 Q 0 45 -5 32 Q -10 41 -16 30 Z';
const BODY = ellD(0, -68, 52, 48);
const FRZ_BODY = spikyD(0, -68, 52, 48, 13, 0.2, 21);

/** tail hangs behind the wire, so it is drawn before the wires */
const BirdBack: React.FC<{s: BirdS}> = ({s}) => (
  <W><g transform={`translate(${BX} ${BY}) rotate(${s.lean * 0.4})`}>
    <path d={TAIL} fill={s.xray ? XRAY : s.frz ? SOOT_W : RED_W} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g></W>
);
const Beak: React.FC<{open: number}> = ({open}) => (
  <g>
    {open > 0.02 ? <ellipse cx={0} cy={-63 + 4 * open} rx={11} ry={3 + 9 * open} fill="#5A2328" stroke={INK} strokeWidth={4} /> : null}
    <path d={`M -12 ${-66 + 6 * open} L 12 ${-66 + 6 * open} L 0 ${-55 + 10 * open} Z`} fill={BEAK_D} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d={`M -12 ${-66 - 3 * open} Q 0 ${-77 - 3 * open} 12 ${-66 - 3 * open} Z`} fill={BEAK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);
const Legs: React.FC<{s: BirdS; bone?: boolean}> = ({s, bone}) => (
  <g>
    {[-1, 1].map((side) => {
      const fx = side * 16, fy = hotY(BX + fx) - BY;
      const hip = toWorld(side * 11, -24, s.lean); const hx = hip.x - BX, hy = hip.y - BY;
      const leg = `M ${hx} ${hy} L ${fx} ${fy - 6}`;
      const toes = [-7, 0, 7].map((o) => `M ${fx + o * 0.5} ${fy - 6} Q ${fx + o} ${fy - 3} ${fx + o * 1.3} ${fy + 5}`).join(' ');
      return <g key={side}>
        <path d={leg + ' ' + toes} stroke={INK} strokeWidth={bone ? 9 : 11} fill="none" strokeLinecap="round" />
        <path d={leg + ' ' + toes} stroke={bone ? BONE : LEG} strokeWidth={bone ? 4 : 5.5} fill="none" strokeLinecap="round" />
      </g>;
    })}
  </g>
);
/** the bird in front of the wire: legs, body, wings, tuft, face, beak (or its x-ray skeleton) */
const BirdFront: React.FC<{t: number; s: BirdS}> = ({t, s}) => {
  const frz = s.frz;
  const fill = frz ? SOOT : RED, shade = frz ? SOOT_D : RED_D, wingC = frz ? SOOT_W : RED_W, belly = frz ? BELLY_S : BELLY;
  const body = frz ? FRZ_BODY : BODY;
  const squash = `translate(0 -20) scale(${2 - s.sy} ${s.sy}) translate(0 20)`;
  const tuft = frz ? [leafD(-8, -108, -18, 34, 4), leafD(0, -110, 0, 40, 4), leafD(8, -108, 18, 32, 4)]
    : [leafD(-3, -108, -30, 24, 7), leafD(0, -110, 0, 28, 7), leafD(3, -108, 30, 22, 6)];
  const wings = (bone: boolean) => [-1, 1].map((side) => {
    const w = side < 0 ? s.wl : s.wr;
    return <g key={side} transform={wingTf(side, w)}>
      <path d={wingD(w.L)} fill={bone ? XRAY : wingC} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {bone ? <g>
        <path d={`M 0 4 L ${side * 3} ${w.L * 0.45} L 0 ${w.L * 0.82}`} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d={`M 0 4 L ${side * 3} ${w.L * 0.45} L 0 ${w.L * 0.82}`} stroke={BONE} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {[4, w.L * 0.45, w.L * 0.82].map((yy, i) => <circle key={i} cx={i === 1 ? side * 3 : 0} cy={yy} r={4.5} fill={BONE} stroke={INK} strokeWidth={2.5} />)}
      </g> : <path d={`M ${-4} ${w.L * 0.55} Q 0 ${w.L * 0.8} ${4} ${w.L * 0.92}`} stroke={frz ? SOOT_D : '#B8382A'} strokeWidth={4} fill="none" strokeLinecap="round" />}
    </g>;
  });
  if (s.xray) {
    return <W><g transform={`translate(${BX} ${BY})`}>
      <Legs s={s} bone />
      <g transform={`rotate(${s.lean})`}>
        <g transform={squash}>
          {tuft.map((d, i) => <path key={i} d={d} fill={XRAY} stroke={INK} strokeWidth={5} />)}
          <path d={BODY} fill={XRAY} stroke={INK} strokeWidth={7} />
          {/* ribs + spine */}
          {[-56, -47, -38].map((y) => [-1, 1].map((sd) => <g key={`${y}${sd}`}>
            <path d={`M 0 ${y} Q ${sd * 18} ${y - 7} ${sd * 27} ${y + 6}`} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
            <path d={`M 0 ${y} Q ${sd * 18} ${y - 7} ${sd * 27} ${y + 6}`} stroke={BONE} strokeWidth={4.5} fill="none" strokeLinecap="round" />
          </g>))}
          <path d="M 0 -64 Q 4 -46 0 -26" stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
          <path d="M 0 -64 Q 4 -46 0 -26" stroke={BONE} strokeWidth={6} fill="none" strokeLinecap="round" />
          {wings(true)}
          {/* skull */}
          <circle cx={0} cy={-88} r={25} fill={BONE} stroke={INK} strokeWidth={4} />
          {[-1, 1].map((sd) => <circle key={sd} cx={sd * 10} cy={-91} r={7} fill={XRAY} />)}
          <path d="M -9 -70 L 9 -70 L 0 -57 Z" fill={BONE} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
        </g>
      </g>
    </g></W>;
  }
  return <W><g transform={`translate(${BX} ${BY})`}>
    <Legs s={s} />
    <g transform={`rotate(${s.lean})`}>
      <g transform={squash}>
        {s.glow > 0.01 ? <path d={ellD(0, -68, 70, 66)} fill="#FFF1A0" opacity={0.75 * s.glow} /> : null}
        {tuft.map((d, i) => <path key={i} d={d} fill={frz ? SOOT_W : RED_W} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
        <clipPath id="birdclip"><path d={body} /></clipPath>
        <path d={body} fill={fill} />
        <g clipPath="url(#birdclip)">
          <circle cx={19} cy={-50} r={50} fill={shade} />
          <circle cx={-6} cy={-74} r={49} fill={fill} />
          <ellipse cx={0} cy={-44} rx={31} ry={23} fill={belly} />
          {frz ? <g opacity={0.55}><ellipse cx={-20} cy={-52} rx={11} ry={7} fill="#4E3B37" /><ellipse cx={22} cy={-90} rx={8} ry={5} fill="#4E3B37" /></g> : null}
        </g>
        <path d={body} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        {wings(false)}
        {frz ? <g>
          {[-1, 1].map((sd) => <g key={sd}>
            <ellipse cx={sd * 19} cy={-88} rx={11.5} ry={13.5} fill="#fff" stroke={INK} strokeWidth={4.5} />
            <circle cx={sd * 19 + (sd < 0 ? 4.5 : -4)} cy={-88 + (sd < 0 ? -5 : 5)} r={4.8} fill={INK} />
          </g>)}
        </g> : <ObjectFace x={0} y={-82} r={56} f={s.face} t={t} lidColor={fill} />}
        <Beak open={s.beak} />
      </g>
    </g>
  </g></W>;
};

// ---------- the bird's acting ----------
const birdFace = (t: number): Face => {
  const f: Face = {...FACE0, mouth: 'none', lx: -0.7, ly: 0.7};
  if (t > T.thousands - 0.1) { f.lx = -1; f.ly = 0.5; }
  if (t > T.volts + 0.15) { f.lid = 0.42; f.brow = -6; }                     // unbothered
  if (t > 4.0) { f.lid = 0; f.brow = 0; f.lx = -0.7; f.ly = 0.8; }
  if (t > T.fried) { f.lx = 0; f.ly = 0; f.brow = -12; }                     // shrugs at the camera
  if (t > 6.1) { f.brow = 0; f.lx = 0; f.ly = 1; }                           // looks at its feet
  if (t > T.same2 - 0.05) { f.lx = -0.8; f.ly = 1; }
  if (t > T.voltage - 0.05) { f.lx = 0.8; f.ly = 1; }
  if (t > 9.95) { f.lx = 0; f.ly = 0.1; f.lid = 0.42; f.brow = -6; }        // smug at the camera
  if (t > T.electricity) { f.lid = 0.15; f.brow = 0; f.ly = 0.95; f.lx = Math.sin(2 * Math.PI * 1.1 * (t - T.electricity) - 1.2); }
  if (t > 14.45) { f.lid = 0; f.lx = 0; f.ly = 0; }
  if (t > 15.0 && t < 16.62) f.squeeze = 1;                                  // yawn
  if (t > 16.62) { f.lx = 0.8; f.ly = -1; }                                  // looks up at its wing
  if (t > T.realise) { f.open = 1 + 0.25 * popIn(t, T.realise, 0.25); f.brow = -14; f.sweat = 1; }
  if (t > T.zap) { f.squeeze = 1; f.sweat = 0; f.brow = 12; f.open = 1; }
  for (const b of [1.25, 3.95, 7.9, 12.05]) if (t > b && t < b + 0.12) f.lid = 1; // blinks
  return f;
};
const birdAt = (t: number): BirdS => {
  const s: BirdS = {face: birdFace(t), beak: 0, wl: {...WING0}, wr: {...WING0}, frz: t >= T.frz,
    xray: (t >= T.zap + 0.02 && t < T.zap + 0.12) || (t >= T.zap + 0.2 && t < T.zap + 0.28),
    sy: 1 + 0.012 * Math.sin(2 * Math.PI * 0.8 * t) + spring(t, T.volts, 0.05, 3, 6), lean: 0, glow: 0};
  // shrug on "fried"
  const sk = popIn(t, T.fried, 0.25) * (1 - eio(seg(t, 5.8, 6.05)));
  if (sk > 0) { s.wl.a = s.wr.a = 12 + 62 * sk; s.beak = 0.3 * sk; }
  // yawn + stretch: the right wing rises to the top wire, hovers, then touches it on "zap"
  s.beak = Math.max(s.beak, eio(seg(t, 14.95, 15.3)) * (1 - eio(seg(t, 16.35, 16.6))));
  if (t >= T.wing && t < T.frz) {
    s.sy = 1;
    s.lean = 5 * eio(seg(t, T.wing, 16.45)) + (t > T.zap ? 1.5 * Math.sin(2 * Math.PI * 23 * t) : 0);
    const wob = 2 * Math.sin(2 * Math.PI * 2 * t) * seg(t, 16.45, 16.7) * (1 - seg(t, 17.05, 17.2));
    const hover = wingTo(CX, CY + 14 + wob, s.lean), touch = wingTo(CX, CY, s.lean);
    const r = eio(seg(t, T.wing, 16.45)), r2 = eio(seg(t, 17.2, T.zap));
    s.wr = {a: lerp(lerp(WING0.a, hover.a, r), touch.a, r2), L: lerp(lerp(WING0.L, hover.L, r), touch.L, r2)};
  }
  if (t >= T.zap && t < T.frz) { s.glow = 1; s.beak = 1; }
  if (s.frz) { // frazzled: the wing snaps down, a stiff wobble
    const k = spring(t, T.frz, 1, 3, 7);
    s.wr = {a: 22 + 14 * k, L: 50}; s.wl = {a: 22 - 8 * k, L: 50}; s.lean = 0; s.sy = 1 + 0.06 * k; s.beak = 0.3;
  }
  return s;
};

// ---------- background pieces ----------
const Cloud: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  const cs = [[-70, 10, 42], [-20, -22, 58], [45, -8, 50], [90, 16, 34], [10, 20, 44]];
  return <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    {cs.map(([cx, cy, r], i) => <circle key={'i' + i} cx={cx} cy={cy} r={r + 7} fill={INK} />)}
    {cs.map(([cx, cy, r], i) => <circle key={'f' + i} cx={cx} cy={cy} r={r} fill="#fff" />)}
  </g></W>;
};
const House: React.FC<{x: number; w: number; h: number; wall: string; roof: string}> = ({x, w, h, wall, roof}) => (
  <W>
    <rect x={x - w / 2} y={-h} width={w} height={h} fill={wall} stroke={INK} strokeWidth={9} />
    <path d={`M ${x - w / 2 - 24} ${-h + 4} L ${x} ${-h - w * 0.42} L ${x + w / 2 + 24} ${-h + 4} Z`} fill={roof} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <rect x={x - w * 0.12} y={-h * 0.52} width={w * 0.24} height={h * 0.52} fill="#B9835A" stroke={INK} strokeWidth={7} />
    {[-0.32, 0.32].map((q) => <rect key={q} x={x + q * w - w * 0.09} y={-h * 0.76} width={w * 0.18} height={w * 0.16} fill="#BFE3FF" stroke={INK} strokeWidth={7} />)}
  </W>
);
const Tree: React.FC<{x: number; s?: number}> = ({x, s = 1}) => (
  <>
    <W><rect x={x - 14 * s} y={-150 * s} width={28 * s} height={150 * s} fill="#9A6A3E" stroke={INK} strokeWidth={8} /></W>
    <Ball x={x} y={-200 * s} r={95 * s} fill="#8CC56E" shade="#76AE5A" wobble={0.1} seed={17} />
  </>
);

// ---------- the scene ----------
export const Birds: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cam = camAt([
    {t: 0, x: 60, y: -335, k: 1.74}, {t: T.glide, x: 60, y: -335, k: 1.74},
    {t: 6.6, x: 50, y: -664, k: 3.35}, {t: 9.85, x: 50, y: -664, k: 3.35},
    {t: 10.9, x: 50, y: -652, k: 3.45}, {t: 12.25, x: 50, y: -652, k: 3.45},
    {t: 13.3, x: 30, y: -659, k: 3.0}, {t: 14.45, x: 30, y: -659, k: 3.0},
    {t: 15.5, x: 60, y: -709, k: 2.55}, {t: 17.7, x: 60, y: -709, k: 2.55},
    {t: 18.75, x: 60, y: -335, k: 1.74}, {t: DURATION, x: 60, y: -335, k: 1.74},
  ], t);
  const camK = 1000 / (1000 - cam.z);
  const close = clamp((camK - 1.74) / (3.35 - 1.74));
  const sh = shake(t, hit(t, T.zap + 0.02, 16, 6) + hit(t, T.volts, 2.5));
  const b = birdAt(t);

  // the guy: looks up -> shrugs on "why" -> scared after the zap (off screen), trembles until the feather lands
  let g = swap(t, T.why, 'lookup', 'shrug');
  if (t >= 17.5) g = swap(t, 17.5, 'shrug', 'scared');
  const pose: Pose = g.pose;

  // current in the hot wire: always flowing, a bump on "volts", big and fast on "stays in the wire"
  const power = powerAt(t);
  const wflash = t > T.zap ? 0.9 * Math.exp(-4 * (t - T.zap)) : 0;

  // explanation overlays
  const out = 1 - eio(seg(t, 12.22, 12.42));
  const rings = [0, 1].map((i) => popIn(t, T.feet + 0.12 * i, 0.3) * (1 - eio(seg(t, 8.1, 8.3))));
  const same = popIn(t, T.same1, 0.35) * (1 - eio(seg(t, 8.1, 8.3)));
  const pathRev = eio(seg(t, T.no2, T.no2 + 0.22)) * out;
  const pathD = `M ${BX - 16} ${hotY(BX - 16) - 6} Q ${BX} ${BY - 78} ${BX + 16} ${hotY(BX + 16) - 6}`;

  // zap: current path foot -> body -> wing -> top wire, sparks around the bird
  const zapping = t >= T.zap && t < T.frz;
  const zseed = Math.floor(t * 15) * 13;
  const shW = toWorld(SH.x, SH.y, b.lean);
  const zpts = [[BX - 16, hotY(BX - 16)], [BX - 6, BY - 30], [BX + 8, BY - 60], [shW.x, shW.y], [CX, CY - 4]];

  // the feather that falls onto the guy's head
  const fu = seg(t, T.frz + 0.02, T.land);
  const breathe = 1 + 0.009 * Math.sin(2 * Math.PI * 0.6 * t);
  const fx = t < T.land ? lerp(BX + 34, GX + 4, fu) + 34 * Math.sin(2 * Math.PI * 1.3 * (t - T.frz)) * (1 - fu) : GX + 4;
  const fy = t < T.land ? lerp(BY - 60, -312, 0.25 * fu * fu + 0.75 * fu) : -302 * breathe - 10;
  const frot = t < T.land ? 28 * Math.sin(2 * Math.PI * 1.3 * (t - T.frz) + 0.6) : -12 + spring(t, T.land, 10, 3, 7);

  const cues: Cue[] = [
    {f: 'hum.wav', at: 0, db: -34, keys: [[0, -34], [5.6, -34], [6.6, -29], [14.5, -29], [16.3, -25], [17.3, -23], [17.62, -60]]},
    {f: 'pop.wav', at: T.thousands, db: -20},
    {f: 'zap.wav', at: T.volts, db: -27, from: 0, to: 0.4, keys: [[T.volts, -27], [T.volts + 0.28, -27], [T.volts + 0.4, -55]]},
    {f: 'whoosh.wav', at: T.why - 0.25, db: -31},
    {f: 'chirp.wav', at: 5.58, db: -15},
    {f: 'whoosh.wav', at: T.glide - 0.1, db: -27},
    {f: 'pop.wav', at: T.feet, db: -24}, {f: 'pop.wav', at: T.feet + 0.12, db: -26},
    {f: 'pop.wav', at: T.same2, db: -20}, {f: 'pop.wav', at: T.voltage, db: -21},
    {f: 'ding.mp3', at: T.difference, db: -21},
    {f: 'pop.wav', at: T.current, db: -18},
    {f: 'whir.mp3', at: T.electricity, db: -27},
    {f: 'whoosh.wav', at: 14.45, db: -31},
    {f: 'strain.mp3', at: T.wing, db: -27},
    {f: 'pop.wav', at: T.another + 0.02, db: -20},
    {f: 'pop.wav', at: T.realise, db: -26},
    {f: 'zap.wav', at: T.zap + 0.02, db: -10},
    {f: 'pop.wav', at: T.frz + 0.02, db: -25},
    {f: 'whoosh.wav', at: 17.75, db: -31},
    {f: 'pop.wav', at: T.land, db: -30},
  ];

  return (
    <AbsoluteFill style={{background: C.skyMid, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.012)`}}>
        <Sky />
        <Layer cam={cam} z={3000} blur={3 * close}>
          <Cloud x={-1000} y={-1900} s={1.6} />
          <Cloud x={950} y={-2300} s={1.3} />
          <Ball x={-760} y={-40} r={300} fill="#9CCB7A" shade="#86B866" seed={9} />
          <Ball x={880} y={-30} r={380} fill="#9CCB7A" shade="#86B866" seed={11} />
          <Ground y={0} color="#C9E3A8" />
        </Layer>
        <Layer cam={cam} z={2000} blur={2.2 * close}>
          <Tree x={-250} s={0.9} />
          <House x={-620} w={250} h={180} wall="#F6E7C8" roof="#E86B5A" />
          <House x={660} w={230} h={170} wall="#E3D6F2" roof="#6F8FD1" />
          <Ground y={0} line={false} color="#C9E3A8" />
        </Layer>
        <Layer cam={cam} z={1000}>
          <Ground y={0} line={false} color="#C9E3A8" />
          <ContactShadow x={GX} y={0} />
          <Guy pose={pose} x={GX} y={0} t={t} sx={g.sx} sy={g.sy} tremble={t > 17.6 && t < T.land ? 1 : 0} />
          <Pole />
          <BirdBack s={b} />
          {GND.map((s, i) => <WireLine key={'g' + i} s={s} w={GND_W} flash={wflash} />)}
          {same > 0.01 ? <W><path d={spanD(HOT[0], BX - 70, BX + 70)} stroke={ZAPY} strokeOpacity={0.8} strokeWidth={(HOT_W + 22) * same} fill="none" strokeLinecap="round" /></W> : null}
          {HOT.map((s, i) => <WireLine key={'h' + i} s={s} w={HOT_W} flash={wflash} />)}
          {HOT.map((s, i) => <Current key={'c' + i} s={s} t={t} p={power} />)}
          <W>{rings.map((r, i) => r > 0.01 ? <g key={i}>
            <circle cx={BX + (i ? 16 : -16)} cy={hotY(BX + (i ? 16 : -16))} r={21 * r} fill="none" stroke={INK} strokeWidth={10} />
            <circle cx={BX + (i ? 16 : -16)} cy={hotY(BX + (i ? 16 : -16))} r={21 * r} fill="none" stroke={C.blue} strokeWidth={5} />
          </g> : null)}</W>
          <BirdFront t={t} s={b} />
          {zapping ? <W>
            <Bolt d={boltD(zpts, zseed, 9)} w={1.15} />
            {[0, 1, 2, 3, 4].map((i) => {
              const a = (i / 5) * Math.PI * 2 + rnd(zseed + i) * 0.9, r0 = 62, r1 = 110 + 40 * rnd(zseed + i * 5);
              const cx = BX + 6, cy = BY - 70;
              return <Bolt key={i} d={boltD([[cx + Math.cos(a) * r0, cy + Math.sin(a) * r0], [cx + Math.cos(a) * r1, cy + Math.sin(a) * r1]], zseed + i * 17, 9)} w={0.8} />;
            })}
          </W> : null}
          {/* "no current" path through the bird + the no sign */}
          {pathRev > 0.01 ? <W>
            <path d={pathD} stroke={INK} strokeWidth={12} fill="none" strokeLinecap="round" pathLength={100} strokeDasharray={`${pathRev * 100} 100`} />
            <path d={pathD} stroke={ZAPY} strokeWidth={6} fill="none" strokeLinecap="round" pathLength={100} strokeDasharray={`${pathRev * 100} 100`} />
          </W> : null}
          <NoSign x={BX} y={BY - 40} s={popIn(t, T.current, 0.3) * out} />
          {/* foot tags: same voltage */}
          <Tag x={BX - 74} y={BY + 66} ax={BX - 16} ay={hotY(BX - 16) + 9} text="7,200 V" fs={22} s={popIn(t, T.same2, 0.3) * out} />
          <Tag x={BX + 74} y={BY + 66} ax={BX + 16} ay={hotY(BX + 16) + 9} text="7,200 V" fs={22} s={popIn(t, T.voltage, 0.3) * out} />
          <Equals x={BX} y={BY + 66} s={popIn(t, T.difference, 0.3) * out} />
          {/* wire tags */}
          <Tag x={-110} y={-540} ax={-110} ay={hotY(-110) + 9} text="7,200 V" fs={34} s={popIn(t, T.thousands, 0.35) * (1 - eio(seg(t, 5.25, 5.45)))} />
          <Tag x={-50} y={-884} ax={-50} ay={gndY(-50) - 8} text="0 V" fs={30} fill="#DDE7F0" s={popIn(t, T.another + 0.02, 0.35) * (1 - eio(seg(t, 17.66, 17.82)))} />
          {/* after the zap: smoke, a cough, the falling feather */}
          <Puffs t={t} born={T.frz} x={BX + 4} y={BY - 125} n={8} life={1.3} size={22} vy={-110} color="#9AA0A6" seed={3} />
          <Puffs t={t} born={18.15} x={BX + 8} y={BY - 58} n={3} life={0.7} size={13} vx={40} vy={-50} color="#B4B9BE" seed={12} />
          {t >= T.frz ? <W><g transform={`translate(${fx} ${fy}) rotate(${frot})`}>
            <path d="M 24 0 C 10 -12 -18 -14 -30 -2 C -18 10 10 10 24 0 Z" fill="#E35A43" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d="M 28 0 L -26 -2" stroke={RED_W} strokeWidth={3.5} strokeLinecap="round" />
          </g></W> : null}
        </Layer>
        {t >= T.zap && t < T.zap + 0.3 ? <AbsoluteFill style={{background: '#fff', opacity: 0.45 * Math.exp(-(t - T.zap) / 0.05)}} /> : null}
      </AbsoluteFill>
      <SoundLayer voice="birds/vo/take1.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const BirdsWide: React.FC = () => <WideFit.Provider value={0.72}><Birds /></WideFit.Provider>;
