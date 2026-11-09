// "Why has Roman concrete lasted 2,000 years?" - a Roman concrete block (laurel wreath, face) cracks and heals itself
// next to the guy, the Pantheon behind them; quicklime drops into a mixing trough, gets hot and leaves white lumps of
// lime; rain gets into a new crack, the lime dissolves, hardens into new stone and seals it; then a modern block with a
// hard hat drops in, and its steel bars rust and crack it. Everything is drawn in code (no new pictures).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, Key, Sky, Ground, Guy, swap, ContactShadow, Ball, ObjectFace, FACE0, Face, Puffs, Star, Sweat,
  W, pen, SoundLayer, Cue, clamp, seg, popIn, spring, shake, hit, lerp, eio, eout, arcY, rnd, WideFit, LoopOut, LOOP_DUR, Look,
  CallToAction, ctaCues, HookTitle, AskBanner, Pose} from './lib/kit';

// voice at 0.1 s (first word heard at 0.17 s), last word ends 18.28 s; + ~0.9 s so the loop push starts after it
export const DURATION = 19.2;
// beats = word starts (ElevenLabs Scribe) + 0.1 s voice offset, checked against the loudness pauses
export const T = {heals: 1.14, cracks: 2.1, so: 3.22, quick: 5.06, hot: 6.42, white: 7.62, lumps: 7.94, lime: 8.42,
  water: 9.62, crack: 10.5, limeD: 11.54, dissolves: 11.86, hardens: 12.86, stone: 13.86, sealing: 14.58, cta: 15.2,
  and: 15.7, land: 16.0, steel: 16.34, rust: 17.46, crackIt: 17.82};

// world layout (z = 1000 plane, ground at y = 0)
const GX = -310;                 // the guy (gone after shot 2, off-screen)
export const RX = 110;           // Roman block (centre of its base)
const TX = -820;                 // mixing trough
const MX = -360;                 // modern block (drops where the guy stood)
export const BW = 400, BH = 420; // Roman block size
const MW = 340, MH = 380;        // modern block size

export const SAND = '#E9DCC0';
const RC = '#D6CDBD', RC_S = '#C1B6A3';
const MC = '#C5CACD', MC_S = '#AFB5B9';
const WATER = '#7CCBF4', MILK = '#BCE2F4', STEEL = '#A4B0BB', RUST = '#C9622B', RED = '#E5534B';
const LEAF = '#8DC56C', WOOD = '#C99766', WOOD_S = '#B07F50', MORTAR = '#C9C1B4';

const mix = (a: string, b: string, u: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16)), pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(lerp(v, pb[i], clamp(u))).toString(16).padStart(2, '0')).join('');
};
type Pt = [number, number];
const pathOf = (pts: Pt[]) => 'M ' + pts.map((q) => `${q[0]} ${q[1]}`).join(' L ');
/** angular chunk (aggregate stone) */
const chunkD = (x: number, y: number, r: number, seed: number, n = 6) =>
  'M ' + Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2 + rnd(seed) * 2, rr = r * (0.72 + 0.5 * rnd(seed + i * 7.3));
    return `${(x + Math.cos(a) * rr).toFixed(1)} ${(y + Math.sin(a) * rr).toFixed(1)}`;
  }).join(' L ') + ' Z';
/** smooth lumpy blob (lime lumps) */
const blobD = (x: number, y: number, r: number, seed: number, n = 9) => {
  const p = Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2, rr = r * (0.84 + 0.3 * rnd(seed + i * 3.7));
    return [x + Math.cos(a) * rr, y + Math.sin(a) * rr];
  });
  const m = (i: number) => { const a = p[i % n], b = p[(i + 1) % n]; return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; };
  let d = `M ${m(n - 1)[0].toFixed(1)} ${m(n - 1)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) d += ` Q ${p[i][0].toFixed(1)} ${p[i][1].toFixed(1)} ${m(i)[0].toFixed(1)} ${m(i)[1].toFixed(1)}`;
  return d + ' Z';
};
const round = {fill: 'none', strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

// ---------------- cracks ----------------
/** p: the crack draws itself · water: blue fill from the top · milk / lime: dissolved lime, then new stone, spreading from point li */
export type Crk = {pts: Pt[]; p: number; water?: number; milk?: number; lime?: number; li?: number; w?: number};
const CrackLine: React.FC<{c: Crk}> = ({c}) => {
  if (c.p <= 0.002) return null;
  const d = pathOf(c.pts), li = c.li ?? 0, w = c.w ?? 1;
  const parts = [li > 0 ? pathOf(c.pts.slice(0, li + 1).reverse() as Pt[]) : null, pathOf(c.pts.slice(li) as Pt[])].filter(Boolean) as string[];
  return <g>
    <path d={d} stroke={INK} strokeWidth={17 * w} {...round} {...pen(c.p)} />
    <path d={d} stroke="#4A3A2D" strokeWidth={6.5 * w} {...round} {...pen(c.p)} />
    {c.water ? <path d={d} stroke={WATER} strokeWidth={6.5 * w} {...round} {...pen(Math.min(c.water, c.p))} /> : null}
    {c.milk ? parts.map((dd, i) => <path key={'m' + i} d={dd} stroke={MILK} strokeWidth={6.5 * w} {...round} {...pen(c.milk!)} />) : null}
    {c.lime ? parts.map((dd, i) => <path key={'l' + i} d={dd} stroke="#FFFFFF" strokeWidth={7.5 * w} {...round} {...pen(c.lime!)} />) : null}
  </g>;
};
// block-local crack paths (origin = centre of the block's base)
export const CRACK_A: Pt[] = [[-150, -421], [-166, -386], [-144, -350], [-168, -312], [-147, -275], [-162, -240], [-140, -206], [-158, -176]];
export const CRACK_B: Pt[] = [[110, -421], [96, -386], [122, -352], [100, -316], [126, -280], [104, -244], [92, -206], [70, -178],
  [40, -152], [14, -138], [-10, -120], [-30, -96], [-58, -78], [-46, -50], [-74, -26], [-64, 2]];
const LI_B = 10;   // the big lime lump sits on this point of crack B

// ---------------- the Roman concrete block ----------------
const STONES: [number, number, number, number][] = [[-152, -122, 24, 0], [-96, -44, 20, 1], [30, -38, 22, 2], [108, -102, 25, 1], [160, -42, 17, 0],
  [-166, -300, 19, 2], [-150, -386, 15, 1], [112, -232, 17, 2], [168, -150, 15, 0], [60, -152, 13, 0], [-58, -82, 12, 2], [178, -380, 13, 0]];
const STONE_C = ['#B8A88F', '#C99173', '#A9A397'];
const LUMPS: [number, number, number][] = [[-130, -58, 12], [78, -62, 11], [-172, -205, 10], [96, -166, 10], [-38, -24, 9], [172, -96, 9],
  [-118, -160, 8], [150, -298, 8], [-178, -352, 8]];
const BIG: [number, number, number] = [-10, -120, 30];

/** laurel wreath round the top of the block: two leafy branches from the front centre out to the corners */
const Wreath: React.FC = () => {
  const leaves: React.ReactNode[] = [];
  for (const s of [-1, 1]) {
    const P0: Pt = [s * 14, -402], P1: Pt = [s * 116, -404], P2: Pt = [s * 206, -448];
    const at = (u: number): Pt => [(1 - u) ** 2 * P0[0] + 2 * (1 - u) * u * P1[0] + u * u * P2[0], (1 - u) ** 2 * P0[1] + 2 * (1 - u) * u * P1[1] + u * u * P2[1]];
    const tan = (u: number) => { const a = at(Math.max(0, u - 0.01)), b = at(Math.min(1, u + 0.01)); return Math.atan2(b[1] - a[1], b[0] - a[0]) * 180 / Math.PI; };
    leaves.push(<path key={'br' + s} d={`M ${P0[0]} ${P0[1]} Q ${P1[0]} ${P1[1]} ${P2[0]} ${P2[1]}`} stroke={INK} strokeWidth={9} {...round} />);
    [0.08, 0.22, 0.36, 0.5, 0.64, 0.78, 0.92].forEach((u, i) => {
      const [x, y] = at(u), a = tan(u);
      for (const side of [-1, 1]) leaves.push(<path key={`${s}${i}${side}`} d="M 0 0 Q 17 -11 44 0 Q 17 11 0 0 Z" fill={i % 2 ? LEAF : '#7DB95E'}
        stroke={INK} strokeWidth={4.5} strokeLinejoin="round" transform={`translate(${x} ${y}) rotate(${a + side * 36})`} />);
    });
    const [ex, ey] = at(1);
    leaves.push(<path key={'tip' + s} d="M 0 0 Q 17 -11 44 0 Q 17 11 0 0 Z" fill={LEAF} stroke={INK} strokeWidth={4.5} transform={`translate(${ex} ${ey}) rotate(${tan(1)})`} />);
  }
  return <g>{leaves}</g>;
};

export const RomanBlock: React.FC<{x: number; t: number; f: Face; cracks: Crk[]; big?: number; pulse?: number; sx?: number; sy?: number; crystals?: number}> =
  ({x, t, f, cracks, big = 1, pulse = 0, sx = 1, sy = 1, crystals = 0}) => (
    <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${x}px 0px`, transform: `scale(${sx}, ${sy})`}}>
      <W><g transform={`translate(${x} 0)`}>
        <rect x={-BW / 2} y={-BH} width={BW} height={BH} rx={30} fill={RC} />
        <path d={`M ${BW / 2 - 78} ${-BH} H ${BW / 2 - 30} Q ${BW / 2} ${-BH} ${BW / 2} ${-BH + 30} V -30 Q ${BW / 2} 0 ${BW / 2 - 30} 0 H ${BW / 2 - 78} Z`} fill={RC_S} />
        {STONES.map(([sx0, sy0, r, c], i) => <path key={'s' + i} d={chunkD(sx0, sy0, r, 11 + i)} fill={STONE_C[c]} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />)}
        {LUMPS.map(([lx, ly, r], i) => {
          const k = 1 + spring(t, 9.25 + i * 0.05, 0.35, 2.5, 6) * (pulse ? 1 : 0);
          return <path key={'l' + i} d={blobD(lx, ly, r * k, 40 + i)} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />;
        })}
        {big > 0.02 ? <path d={blobD(BIG[0], BIG[1], BIG[2] * big * (1 + (pulse ? spring(t, 9.3, 0.3, 2.5, 6) : 0)), 77)} fill="#FFFFFF" stroke={INK} strokeWidth={5} /> : null}
        {cracks.map((c, i) => <CrackLine key={'c' + i} c={c} />)}
        {/* "new stone": little calcite crystals that pop along crack B, from the lump outward */}
        {crystals > 0 ? CRACK_B.map(([cx, cy], i) => {
          if (i % 2 || i === LI_B) return null;
          const s = popIn(crystals, Math.abs(i - LI_B) * 0.07, 0.25) * 9;
          return s > 0.3 ? <path key={'x' + i} d={`M ${cx} ${cy - s * 1.5} L ${cx + s} ${cy} L ${cx} ${cy + s * 1.5} L ${cx - s} ${cy} Z`} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /> : null;
        }) : null}
        <rect x={-BW / 2} y={-BH} width={BW} height={BH} rx={30} fill="none" stroke={INK} strokeWidth={8} />
        <Wreath />
      </g></W>
      <ObjectFace x={x - 20} y={-268} r={150} f={f} t={t} lidColor={RC} />
    </div>
  );

// ---------------- the modern block (hard hat, steel bars inside) ----------------
const HardHat: React.FC<{y: number}> = ({y}) => (
  <g transform={`translate(0 ${y})`}>
    <path d="M -96 -8 Q -96 -100 0 -104 Q 96 -100 96 -8 Z" fill="#FFD43B" />
    <path d="M 40 -98 Q 96 -86 96 -8 L 60 -8 Q 64 -70 40 -98 Z" fill="#F2B807" />
    <path d="M -96 -8 Q -96 -100 0 -104 Q 96 -100 96 -8 Z" fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -22 -100 Q -26 -60 -22 -10 M 22 -100 Q 26 -60 22 -10" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    <rect x={-128} y={-14} width={256} height={24} rx={12} fill="#FFD43B" stroke={INK} strokeWidth={8} />
  </g>
);
const BARS = [-178, -125, -72];
const MCRACKS: Pt[][] = [[[-118, -206], [-138, -248], [-120, -290], [-150, -330], [-136, -380]], [[128, -206], [150, -240], [132, -268], [170, -300]],
  [[-140, -40], [-162, -24], [-158, 0]], [[60, -38], [80, -16], [72, 2]], [[140, -150], [170, -130]]];
export const ModernBlock: React.FC<{x: number; y?: number; t: number; f: Face; xray: number; rust: number; crk: number; sx?: number; sy?: number; hatY?: number}> =
  ({x, y = 0, t, f, xray, rust, crk, sx = 1, sy = 1, hatY = 0}) => {
    const sw = 18 + 9 * eio(rust), bar = mix(STEEL, RUST, rust);
    return (
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${x}px ${y}px`, transform: `scale(${sx}, ${sy})`}}>
        <W><g transform={`translate(${x} ${y})`}>
          <rect x={-MW / 2} y={-MH} width={MW} height={MH} rx={20} fill={MC} />
          <path d={`M ${MW / 2 - 64} ${-MH} H ${MW / 2 - 20} Q ${MW / 2} ${-MH} ${MW / 2} ${-MH + 20} V -20 Q ${MW / 2} 0 ${MW / 2 - 20} 0 H ${MW / 2 - 64} Z`} fill={MC_S} />
          {[[-120, -330], [-60, -300], [90, -350], [130, -250], [-140, -120], [100, -30], [-30, -20]].map(([px, py], i) =>
            <circle key={i} cx={px} cy={py} r={4} fill="#9DA3A8" />)}
          {/* x-ray cut-away: the steel bars inside */}
          {xray > 0.01 ? <g transform={`translate(0 -122) scale(${xray}) translate(0 122)`}>
            <clipPath id="xwin"><path d="M -146 -214 L -60 -222 L 40 -212 L 146 -218 L 152 -120 L 144 -30 L 40 -24 L -60 -32 L -150 -26 L -144 -120 Z" /></clipPath>
            <path d="M -146 -214 L -60 -222 L 40 -212 L 146 -218 L 152 -120 L 144 -30 L 40 -24 L -60 -32 L -150 -26 L -144 -120 Z" fill="#8F969B" />
            <g clipPath="url(#xwin)">
              {BARS.map((by, i) => <g key={i}>
                <rect x={-180} y={by - sw / 2} width={360} height={sw} rx={sw / 2} fill={bar} stroke={INK} strokeWidth={5} />
                {Array.from({length: 14}, (_, j) => <line key={j} x1={-160 + j * 24} y1={by - sw / 2 + 3} x2={-150 + j * 24} y2={by + sw / 2 - 3} stroke={INK} strokeWidth={3} strokeOpacity={0.55} />)}
                {rust > 0.2 ? Array.from({length: 9}, (_, j) => {
                  const fx = -140 + j * 34 + 10 * rnd(i * 9 + j), fy = by + (rnd(i * 13 + j) - 0.5) * (sw + 22), r = 4 + 4 * rnd(i * 5 + j * 3);
                  return <circle key={'r' + j} cx={fx} cy={fy} r={r * seg(rust, 0.2 + j * 0.05, 0.6 + j * 0.05)} fill="#B4521F" stroke={INK} strokeWidth={2} />;
                }) : null}
              </g>)}
            </g>
            <path d="M -146 -214 L -60 -222 L 40 -212 L 146 -218 L 152 -120 L 144 -30 L 40 -24 L -60 -32 L -150 -26 L -144 -120 Z" fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          </g> : null}
          {crk > 0 ? MCRACKS.map((c, i) => <path key={i} d={pathOf(c)} stroke={INK} strokeWidth={9} {...round} {...pen(clamp(crk * 1.6 - i * 0.12))} />) : null}
          <rect x={-MW / 2} y={-MH} width={MW} height={MH} rx={20} fill="none" stroke={INK} strokeWidth={8} />
          <HardHat y={-MH + 6 + hatY} />
        </g></W>
        <ObjectFace x={x} y={y - 292} r={118} f={f} t={t} lidColor={MC} />
      </div>
    );
  };

// ---------------- the mixing trough ----------------
const TLUMPS: [number, number, number][] = [[-150, -196, 13], [-70, -228, 16], [10, -206, 11], [80, -232, 14], [150, -192, 12], [-110, -176, 9], [40, -180, 10], [-20, -248, 9]];
const Trough: React.FC<{x: number; t: number; heat: number; lumps: number[]; rot: number}> = ({x, heat, lumps, rot}) => (
  <W><g transform={`translate(${x} 0) rotate(${rot} 0 0)`}>
    <path d="M -224 -150 Q -170 -238 -70 -246 Q 30 -276 120 -244 Q 200 -222 224 -150 Z" fill={mix(MORTAR, '#E9A27E', heat)} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {TLUMPS.map(([lx, ly, r], i) => lumps[i] > 0.02 ? <path key={i} d={blobD(lx, ly, r * lumps[i], 60 + i)} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} /> : null)}
  </g></W>
);
const TroughFront: React.FC<{x: number; rot: number}> = ({x, rot}) => (
  <W><g transform={`translate(${x} 0) rotate(${rot} 0 0)`}>
    <path d="M -238 -164 L 238 -164 L 208 0 L -208 0 Z" fill={WOOD} />
    <path d="M 160 -164 L 238 -164 L 208 0 L 140 0 Z" fill={WOOD_S} />
    <path d="M -229 -110 L 229 -110 M -219 -55 L 219 -55" stroke={INK} strokeWidth={5} strokeOpacity={0.7} />
    {[[-150, -138], [120, -82], [-60, -28]].map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={5} fill={INK} />)}
    <path d="M -238 -164 L 238 -164 L 208 0 L -208 0 Z" fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </g></W>
);

// ---------------- background: the Pantheon, an aqueduct, cypress trees ----------------
const COLS = [-472, -337, -202, -67, 67, 202, 337, 472];
export const Pantheon: React.FC = () => (
  <W>
    <rect x={-760} y={-860} width={1520} height={860} fill="#EAD7B4" stroke={INK} strokeWidth={18} />
    <path d="M -760 -610 H 760" stroke={INK} strokeWidth={10} />
    <rect x={-700} y={-930} width={1400} height={74} fill="#DDD8CF" stroke={INK} strokeWidth={16} />
    <rect x={-630} y={-992} width={1260} height={66} fill="#DDD8CF" stroke={INK} strokeWidth={16} />
    <clipPath id="dome"><path d="M -600 -988 A 600 330 0 0 1 600 -988 Z" /></clipPath>
    <path d="M -600 -988 A 600 330 0 0 1 600 -988 Z" fill="#BDB8AE" />
    <ellipse cx={-110} cy={-988} rx={600} ry={340} fill="#D4D0C7" clipPath="url(#dome)" />
    <path d="M -600 -988 A 600 330 0 0 1 600 -988 Z" fill="none" stroke={INK} strokeWidth={18} />
    <rect x={-590} y={-650} width={1180} height={610} fill="#D6C3A0" />
    <rect x={-84} y={-480} width={168} height={440} fill="#6D5A47" stroke={INK} strokeWidth={12} />
    {COLS.map((c) => <g key={c}>
      <rect x={c - 36} y={-610} width={72} height={560} fill="#F2E8D5" />
      <rect x={c + 14} y={-610} width={22} height={560} fill="#DDCFB5" />
      <rect x={c - 36} y={-610} width={72} height={560} fill="none" stroke={INK} strokeWidth={12} />
      <rect x={c - 52} y={-648} width={104} height={40} rx={8} fill="#F2E8D5" stroke={INK} strokeWidth={12} />
      <rect x={c - 48} y={-66} width={96} height={28} rx={6} fill="#F2E8D5" stroke={INK} strokeWidth={12} />
    </g>)}
    <rect x={-620} y={-770} width={1240} height={124} fill="#F4ECDC" stroke={INK} strokeWidth={16} />
    <text x={0} y={-692} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={58} letterSpacing={6} fill={INK}>M·AGRIPPA·L·F·COS·TERTIVM·FECIT</text>
    <path d="M -660 -770 L 0 -1010 L 660 -770 Z" fill="#F4ECDC" stroke={INK} strokeWidth={18} strokeLinejoin="round" />
    <path d="M -540 -792 L 0 -975 L 540 -792 Z" fill="#EADFC9" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <rect x={-660} y={-40} width={1320} height={44} fill="#E7DCC7" stroke={INK} strokeWidth={14} />
  </W>
);
const Cypress: React.FC<{x: number; h: number}> = ({x, h}) => (
  <W><g transform={`translate(${x} 0)`}>
    <rect x={-16} y={-70} width={32} height={74} fill="#9A6B45" stroke={INK} strokeWidth={12} />
    <path d={`M 0 ${-h} Q 82 ${-h * 0.55} 74 ${-h * 0.17} Q 64 -46 0 -50 Q -64 -46 -74 ${-h * 0.17} Q -82 ${-h * 0.55} 0 ${-h} Z`} fill="#79B05E" stroke={INK} strokeWidth={16} strokeLinejoin="round" />
    <path d={`M 34 ${-h * 0.6} Q 58 ${-h * 0.35} 46 ${-h * 0.14}`} stroke="#5F9548" strokeWidth={20} fill="none" strokeLinecap="round" />
  </g></W>
);
const Aqueduct: React.FC<{x0: number; n: number; h: number}> = ({x0, n, h}) => {
  const bay = 230, x1 = x0 + n * bay;
  let d = `M ${x0} 20 V ${-h} H ${x1} V 20 Z`;
  for (let i = 0; i < n; i++) { const a = x0 + i * bay + 44, b = a + bay - 88, top = -h + 150, r = (b - a) / 2; d += ` M ${a} 20 V ${top + r} A ${r} ${r} 0 0 1 ${b} ${top + r} V 20 Z`; }
  return <W>
    <path d={d} fill="#E2CDA6" fillRule="evenodd" stroke={INK} strokeWidth={16} strokeLinejoin="round" />
    <path d={`M ${x0} ${-h + 70} H ${x1}`} stroke={INK} strokeWidth={9} />
  </W>;
};

// ---------------- small helpers ----------------
/** world-space sticker label */
export const Tag: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; color?: string; bg?: string}> =
  ({x, y, s, text, size = 70, rot = 0, color = INK, bg = '#FFFFFF'}) => {
    if (s < 0.01) return null;
    const w = text.length * size * 0.7 + size * 0.9, h = size * 1.35;
    return <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
      <rect x={-w / 2} y={-h / 2 + 7} width={w} height={h} rx={h * 0.32} fill={INK} />
      <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.32} fill={bg} stroke={INK} strokeWidth={7} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={size} fill={color} letterSpacing={-1}>{text}</text>
    </g></W>;
  };
/** rubber stamp that slams down (s: 0..1) */
const Stamp: React.FC<{x: number; y: number; t: number; at: number; text: string; rot?: number}> = ({x, y, t, at, text, rot = -10}) => {
  if (t < at) return null;
  const u = seg(t, at, at + 0.14), sc = lerp(1.7, 1, eout(u)) + spring(t, at + 0.14, -0.06, 3, 8), op = u;
  const w = text.length * 42 + 56;
  return <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${sc})`} opacity={op}>
    <rect x={-w / 2} y={-42} width={w} height={84} rx={16} fill="#FFFFFFCC" stroke={RED} strokeWidth={10} />
    <text x={0} y={21} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={60} fill={RED} letterSpacing={2}>{text}</text>
  </g></W>;
};
/** rising wavy heat line */
const Heat: React.FC<{x: number; y: number; t: number; at: number}> = ({x, y, t, at}) => {
  const u = t - at; if (u < 0 || u > 1.1) return null;
  const p = eout(seg(u, 0, 0.45)), q = eio(seg(u, 0.7, 1.1)), dy = -90 * u;
  const d = `M ${x} ${y + dy} q 22 -30 0 -60 q -22 -30 0 -60 q 22 -30 0 -60`;
  if (p - q < 0.01) return null;
  return <W><path d={d} stroke={RED} strokeWidth={11} {...round} pathLength={1} strokeDasharray={`${p - q} 2`} strokeDashoffset={-q} /></W>;
};

// ---------------- faces and poses over time ----------------
const blinkAt = (t: number, list: number[]) => list.some((b) => t > b && t < b + 0.12) ? 1 : 0;
const romanFace = (t: number): Face => {
  let f: Face = {...FACE0, mouth: 'o', brow: -8, lx: -0.6, ly: -0.2};                                  // it's cracking
  if (t > 0.12) f = {...FACE0, squeeze: 1, mouth: 'grit', brow: 8};                                       // ouch
  if (t > T.heals - 0.05) f = {...FACE0, open: 1 + spring(t, T.heals, 0.2, 3, 6), lx: -0.8, ly: -0.1, mouth: 'o', brow: -10};
  if (t > T.cracks) f = {...FACE0, lid: 0.45, mouth: 'smile', brow: -6, lx: -0.6};                       // smug at the guy: healed
  if (t > 9.2) f = {...FACE0, lx: 0.55, ly: -0.85, mouth: 'flat', brow: -6};                               // rain on its head
  if (t > T.crack) f = {...FACE0, squeeze: 1, mouth: 'grit', brow: 10};                                   // crack
  if (t > T.crack + 0.55) f = {...FACE0, lx: 0.2, ly: 0.8, mouth: 'o', brow: -10};                        // looks down at the crack
  if (t > T.hardens) f = {...FACE0, lx: 0.1, ly: 0.75, mouth: 'smile', brow: -6};
  if (t > T.sealing) f = {...FACE0, squeeze: 1, mouth: 'grin', brow: -6};                                 // sealed
  if (t > 15.5) f = {...FACE0, lid: 0.45, mouth: 'smile', brow: -6, lx: -0.8};                            // smug at the modern block
  if (t > T.crackIt + 0.12) f = {...FACE0, squeeze: 1, mouth: 'grin', brow: -6};                          // laughs
  return {...f, lid: Math.max(f.lid, f.squeeze ? 0 : blinkAt(t, [4.6, 12.3, 16.9]))};
};
const modernFace = (t: number): Face => {
  let f: Face = {...FACE0, open: 1 + spring(t, T.land + 0.02, 0.25, 3, 6), mouth: 'o', brow: -8, lx: 0.6};   // just landed
  if (t > T.land + 0.14) f = {...FACE0, lid: 0.3, mouth: 'smile', brow: -4, lx: 0.7};                                // proud
  if (t > T.steel) f = {...FACE0, lx: 0.1, ly: 0.8, mouth: 'o', brow: -8};                                    // looks at its steel
  if (t > T.rust) f = {...FACE0, lx: 0, ly: 0.7, mouth: 'frown', brow: -14, sweat: 1};                        // rusting
  if (t > T.crackIt) f = {...FACE0, squeeze: 1, mouth: 'grit', brow: 12, sweat: 1};
  if (t > T.crackIt + 0.55) f = {...FACE0, lx: 0.6, ly: 0.2, mouth: 'frown', brow: -14, sweat: 1};
  return {...f, lid: Math.max(f.lid, f.squeeze ? 0 : blinkAt(t, [17.05]))};
};
const guyPose = (t: number) => {
  let g = swap(t, T.cracks - 0.1, 'surprised', 'present');
  const steps: [number, Pose, Pose, 'turn' | 'act'][] = [[T.so + 0.3, 'present', 'point_right', 'turn'], [T.hot + 0.04, 'point_right', 'scared', 'act'],
    [T.white, 'scared', 'surprised', 'act']];
  for (const [at, a, b, k] of steps) if (t >= at - 0.12) g = swap(t, at, a, b, k);
  return g;
};

// camera: z=1000 screen scale k; holds are still, glides >= 1 s
// ground sits at screen y ~1380 in the wide shots (subjects clear of the Shorts title overlay at the bottom and of the
// buttons on the right edge)
const KEYS: Key[] = [
  {t: 0, x: -17, y: -316, k: 1.33},
  {t: T.so, x: -19, y: -318, k: 1.37, e: 'out'},       // gentle push on the hook (moves from frame 0)
  {t: T.so + 1.15, x: -644, y: -339, k: 1.24},          // glide over to the mixing trough
  {t: 7.45, x: -644, y: -339, k: 1.24},
  {t: 8.25, x: TX, y: -196, k: 2.3},                     // into the mortar: the white lumps
  {t: 8.6, x: TX, y: -196, k: 2.3},
  {t: 9.6, x: RX, y: -190, k: 2.5},                      // whip over to the Roman block, close
  {t: 15.15, x: RX, y: -184, k: 2.6},                    // slow push while it heals
  {t: 16.15, x: -76, y: -389, k: 1.08},                  // pull back: the modern block next to it
  {t: DURATION, x: -76, y: -392, k: 1.07},
];
// rain: [block-local x, landing time]
const DROPS: [number, number][] = [[110, 9.45], [-60, 9.56], [170, 9.66], [-150, 9.74], [110, 9.86], [20, 9.98], [112, 10.62], [109, 10.8], [111, 10.98], [110, 11.16]];
const DROP_FALL = 0.36;

export const ConcreteScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt(KEYS, t);
  const dof = 3 * Math.max(seg(t, 7.5, 8.1) * (1 - seg(t, 8.6, 9.0)), seg(t, 9.0, 9.5) * (1 - seg(t, 15.15, 15.7)));
  const sh = shake(t, hit(t, T.crackIt + 0.02, 9, 6) + hit(t, T.land + 0.02, 5, 8));
  // ---- the hook crack (A) heals on "heals its own cracks"
  const crackA: Crk = {pts: CRACK_A, p: 0.3 + 0.7 * eout(seg(t, 0, 0.42)), lime: eio(seg(t, T.heals, T.heals + 0.75))};
  // ---- crack B: rain gets in, the lime dissolves, hardens into new stone, sealed
  const crackB: Crk = {pts: CRACK_B, li: LI_B, p: eout(seg(t, T.crack - 0.05, T.crack + 0.22)), water: eio(seg(t, T.crack + 0.12, T.crack + 0.95)),
    milk: eio(seg(t, T.limeD, T.dissolves + 0.55)), lime: eio(seg(t, T.hardens, T.stone + 0.45))};
  const big = 1 - 0.3 * eio(seg(t, T.limeD, T.dissolves + 0.5));
  const rb = {sy: 1 + spring(t, 0.02, -0.035, 3, 6) + spring(t, T.crack, -0.03, 3, 6) + spring(t, T.sealing, 0.03, 3, 6),
    sx: 1 - spring(t, 0.02, -0.025, 3, 6) - spring(t, T.crack, -0.02, 3, 6) - spring(t, T.sealing, 0.02, 3, 6)};
  // ---- guy
  const g = guyPose(t), hop = t < 0.34 ? -46 * Math.sin(Math.PI * (0.34 + t) / 0.68) : 0;   // frame 0: mid-hop in surprise
  const land = 1 + spring(t, 0.34, -0.05, 3, 7);
  // ---- trough
  const chunks: [number, number, number][] = [[-70, T.quick, 34], [10, T.quick + 0.14, 28], [86, T.quick + 0.28, 31]];
  const heat = 0.6 * seg(t, T.hot - 0.05, T.hot + 0.2) * (1 - seg(t, 7.3, 7.9));
  const tlumps = TLUMPS.map((_, i) => popIn(t, T.white + i * 0.06, 0.28));
  const trot = spring(t, T.hot, 1.6, 4, 4) + spring(t, T.quick, 0.8, 4, 6);
  // ---- modern block: drops in, steel shows, rusts, cracks
  const mFall = arcY(-1500, 0, 0.4, 0.0001);
  const my = t < T.land - 0.4 ? -3000 : t < T.land ? mFall(t - (T.land - 0.4)) : 0;
  const msq = 1 + spring(t, T.land, -0.14, 3, 7) + spring(t, T.crackIt, -0.05, 4, 7);
  const rust = eio(seg(t, T.rust - 0.05, T.rust + 0.55)), mcrk = eout(seg(t, T.crackIt, T.crackIt + 0.3));
  const chips: [number, number, number, number, number][] = [[-150, -360, -300, -520, 0], [160, -330, 200, -560, 1], [-160, -60, -280, -220, 2], [150, -20, 160, -260, 3]];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.012)`}}>
        <Sky />
        <Layer cam={cam} z={3000} blur={dof}>
          <Aqueduct x0={-3900} n={10} h={760} />
          <Pantheon />
          <Cypress x={-1320} h={1150} />
          <Cypress x={1240} h={1050} />
          <Cypress x={2050} h={1180} />
          <Ground y={0} color={SAND} />
        </Layer>
        <Layer cam={cam} z={1000}>
          <Ground y={0} line={false} color={SAND} />
          {/* ---- mixing trough: quicklime drops in, gets hot, leaves white lumps ---- */}
          <ContactShadow x={TX} y={0} w={440} />
          <Trough x={TX} t={t} heat={heat} lumps={tlumps} rot={trot} />
          {chunks.map(([dx, land, r], i) => {
            if (t < land - 0.45 || t > land + 1.2) return null;
            const fy = arcY(-1300, -232, 0.45, 0.0001);
            const y = t < land ? fy(t - (land - 0.45)) : -232 + 70 * eio(seg(t, land, land + 1.0));
            const s = 1 - eio(seg(t, land + 0.6, land + 1.2));
            return <Ball key={i} x={TX + dx} y={y} r={r * s} fill="#FBF8F0" shade="#E4DDCC" wobble={0.28} rot={t < land ? t * 300 : 0} seed={30 + i} />;
          })}
          {chunks.map(([dx, land], i) => <Puffs key={'sp' + i} t={t} born={land} x={TX + dx} y={-226} n={4} life={0.5} size={17} vx={i % 2 ? 90 : -90} vy={-130} color={MORTAR} seed={50 + i} />)}
          <TroughFront x={TX} rot={trot} />
          {[[-120, T.hot - 0.04], [-10, T.hot + 0.08], [110, T.hot + 0.16], [-60, T.hot + 0.34], [60, T.hot + 0.48], [-130, T.hot + 0.64], [130, T.hot + 0.8], [0, T.hot + 0.95]].map(([dx, b], i) =>
            <Puffs key={'st' + i} t={t} born={b} x={TX + dx} y={-250} n={6} life={1.25} size={48 + (i % 3) * 9} vx={(i % 2 ? 1 : -1) * 40} vy={-270} seed={70 + i * 9} />)}
          {[-110, 0, 110].map((dx, i) => <Heat key={'h' + i} x={TX + dx} y={-300} t={t} at={T.hot + 0.1 + i * 0.12} />)}
          <Tag x={TX + 90} y={-560} s={popIn(t, T.quick - 0.1) * (1 - seg(t, T.hot - 0.3, T.hot - 0.05))} text="QUICKLIME" rot={-4} />
          <Tag x={TX + 150} y={-520} s={popIn(t, T.hot + 0.04) * (1 - seg(t, 7.35, 7.6))} text="HOT" size={80} rot={6} color={RED} />
          <Tag x={TX + 10} y={-352} s={popIn(t, T.lime - 0.1) * (1 - seg(t, 8.75, 8.95))} text="LIME LUMPS" size={44} rot={-3} />
          {/* ---- the guy ---- */}
          {t < 10.2 ? <>
            <ContactShadow x={GX} y={0} w={130 - (hop ? 30 : 0)} />
            <Guy pose={g.pose} x={GX} y={hop} t={t} sx={g.sx * (2 - land)} sy={g.sy * land} flip={g.pose === 'point_right'} tremble={t > T.hot && t < T.white ? 1 : 0} />
          </> : null}
          <Sweat x={GX + 78} y={-300 + 40 * seg(t, T.hot + 0.1, T.white)} s={popIn(t, T.hot + 0.1, 0.25) * (1 - seg(t, T.white - 0.1, T.white + 0.1)) * 1.3} />
          {/* ---- the Roman block ---- */}
          <ContactShadow x={RX} y={0} w={BW + 30} />
          <RomanBlock x={RX} t={t} f={romanFace(t)} cracks={[crackA, crackB]} big={big} pulse={1} sx={rb.sx} sy={rb.sy}
            crystals={t > T.hardens ? t - T.hardens - 0.25 : 0} />
          {/* heal sparkles on the hook crack */}
          {[2, 4, 6].map((i, j) => <Star key={'ha' + i} x={RX + CRACK_A[i][0] - 40} y={CRACK_A[i][1]} s={0.7 * popIn(t, T.heals + 0.25 + j * 0.16, 0.25) * (1 - seg(t, 2.5, 2.8))} rot={t * 120} />)}
          {/* rain drops: fall onto the block, then into crack B */}
          {DROPS.map(([dx, land], i) => {
            const u = t - (land - DROP_FALL); if (u < 0 || u > DROP_FALL) return null;
            const y = -800 + 0.5 * (2 * (800 - 424) / (DROP_FALL * DROP_FALL)) * u * u;
            return <Sweat key={'d' + i} x={RX + dx} y={y} s={1.15} />;
          })}
          {DROPS.map(([dx, land], i) => <Puffs key={'ds' + i} t={t} born={land} x={RX + dx} y={-428} n={3} life={0.32} size={9} vx={0} vy={-60} color={WATER} seed={90 + i} />)}
          {/* sealed: sparkles + stamp */}
          {[3, 6, 9, 12, 14].map((i, j) => <Star key={'sb' + i} x={RX + CRACK_B[i][0] + (j % 2 ? 30 : -30)} y={CRACK_B[i][1]} s={0.55 * popIn(t, T.sealing + j * 0.06, 0.25) * (1 - seg(t, 15.2, 15.45))} rot={t * 140 + j * 30} />)}
          <Tag x={RX - 20} y={-46} s={popIn(t, T.stone) * (1 - seg(t, T.sealing - 0.15, T.sealing))} text="NEW STONE" size={40} rot={-4} />
          {t < 15.4 ? <Stamp x={RX - 20} y={-46} t={t} at={T.sealing + 0.02} text="SEALED" /> : null}
          {/* ---- the modern block ---- */}
          {t > T.land - 0.4 ? <>
            <ContactShadow x={MX} y={0} w={(MW + 30) * (my > -300 ? 1 : 0.5)} />
            <Puffs t={t} born={T.land} x={MX - MW / 2} y={-14} n={5} life={0.6} size={22} vx={-170} vy={-50} color="#EDE6DA" seed={7} />
            <Puffs t={t} born={T.land} x={MX + MW / 2} y={-14} n={5} life={0.6} size={22} vx={170} vy={-50} color="#EDE6DA" seed={13} />
            <ModernBlock x={MX} y={my} t={t} f={modernFace(t)} xray={popIn(t, T.steel - 0.04, 0.3)} rust={rust} crk={mcrk} sx={2 - msq} sy={msq}
              hatY={-70 * Math.max(0, Math.sin(Math.PI * seg(t, T.crackIt, T.crackIt + 0.42)))} />
            {chips.map(([cx, cy, vx, vy, i]) => {
              const u = t - T.crackIt - 0.04; if (u < 0 || u > 1.3) return null;
              return <Ball key={'ch' + i} x={MX + cx + vx * u} y={cy + vy * u + 0.5 * 2600 * u * u} r={18 + 4 * (i % 2)} fill={MC} shade={MC_S} wobble={0.35} rot={u * 400 * (vx > 0 ? 1 : -1)} seed={110 + i} />;
            })}
            <Puffs t={t} born={T.crackIt + 0.02} x={MX - 120} y={-250} n={6} life={0.7} size={26} vx={-140} vy={-60} color="#E2DDD6" seed={21} />
            <Puffs t={t} born={T.crackIt + 0.06} x={MX + 130} y={-200} n={6} life={0.7} size={26} vx={150} vy={-40} color="#E2DDD6" seed={27} />
            <Tag x={MX} y={-575} s={popIn(t, T.steel) * (1 - seg(t, T.rust - 0.2, T.rust))} text="STEEL" size={58} rot={-3} />
            <Tag x={MX} y={-575} s={popIn(t, T.rust)} text="RUST" size={58} rot={3} color={RUST} />
          </> : null}
          {/* the Roman block laughs */}
          {[0, 1, 2].map((i) => <Star key={'lf' + i} x={RX - 140 + i * 140} y={-520 - (i % 2) * 50} s={0.75 * popIn(t, T.crackIt + 0.2 + i * 0.08, 0.25)} rot={t * 90 + i * 40} />)}
        </Layer>
      </AbsoluteFill>
      {/* every video: big hook text at frame 0, gone by ~2 s */}
      <HookTitle t={t} text="ROMAN CONCRETE HEALS ITSELF" hi="HEALS" />
      {/* every video: like / subscribe / comment once, right after the answer lands ("sealing it") */}
      <CallToAction t={t} at={T.cta} y={262} />
    </AbsoluteFill>
  );
};

export const ConcreteVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    {f: 'crack.wav', at: 0, db: -21},
    {f: 'pop.wav', at: T.heals + 0.25, db: -27}, {f: 'pop.wav', at: T.heals + 0.41, db: -28}, {f: 'pop.wav', at: T.heals + 0.57, db: -28},
    {f: 'ding.mp3', at: T.cracks - 0.1, db: -25},
    {f: 'whoosh.wav', at: T.so - 0.15, db: -28},
    {f: 'splash.wav', at: T.quick, db: -22}, {f: 'splash.wav', at: T.quick + 0.14, db: -25}, {f: 'splash.wav', at: T.quick + 0.28, db: -24},
    {f: 'hiss.wav', at: T.hot - 0.06, db: -27},
    ...[0, 1, 2, 3, 4].map((i) => ({f: 'pop.wav', at: T.white + i * 0.12, db: -28 - (i % 2)})),
    {f: 'whoosh.wav', at: 8.65, db: -26},
    ...DROPS.slice(0, 6).map(([, land], i) => ({f: 'pop.wav', at: land, db: -31 - (i % 2) * 2})),
    {f: 'crack.wav', at: T.crack - 0.1, db: -17},
    {f: 'bubbles.wav', at: T.crack + 0.2, db: -27}, {f: 'bubbles.wav', at: T.limeD + 0.05, db: -25},
    {f: 'pop.wav', at: T.stone, db: -24},
    {f: 'ding.mp3', at: T.sealing, db: -21}, {f: 'pop.wav', at: T.sealing + 0.02, db: -18},
    {f: 'whoosh.wav', at: 15.05, db: -28},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: T.land - 0.42, db: -29}, {f: 'pop.wav', at: T.land, db: -15},
    {f: 'zap.wav', at: T.steel - 0.02, db: -33, to: 0.5}, {f: 'pop.wav', at: T.rust, db: -24},
    {f: 'strain.mp3', at: T.rust - 0.05, db: -27, to: 0.6},
    {f: 'crack.wav', at: T.crackIt - 0.3, db: -13}, {f: 'pop.wav', at: T.crackIt + 0.05, db: -20},
    {f: 'giggle.mp3', at: T.crackIt + 0.22, db: -30, to: 0.9},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26}, // the loop push back to the opening shot
  ];
  return (
    <AbsoluteFill style={{background: '#FBF7EC', overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<ConcreteScene t={0} />}>
        <ConcreteScene t={t} />
      </LoopOut>
      {/* every video: "comment your question" sticker for the whole video, outside LoopOut so it never moves */}
      <AskBanner />
      <Look />
      <SoundLayer voice="concrete/vo/take1.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const ConcreteWide: React.FC = () => <WideFit.Provider value={0.72}><ConcreteVideo /></WideFit.Provider>;
