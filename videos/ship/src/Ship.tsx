// "Why does a steel ship float?" - notebook-doodle house style, built from the kit.
// The guy (library poses) tosses a steel block off a pier and it sinks. A cargo ship (drawn in code) floats, opens up
// to show its hollow hull, settles into the water, and a pen-doodle balance scale weighs the ship against the water it
// pushed aside. The last line puts the block on the scale against its own (much lighter) water; the loop push brings
// the block back into the guy's hand.
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {FPS, INK, FONT, C, Layer, camAt, Cam, Sky, Guy, swap, ContactShadow, ObjectFace, FACE0, Face, Arrow,
  SoundLayer, Cue, W, seg, popIn, spring, lerp, eio, eout, clamp, rnd, arcY, WideFit, LoopOut, LOOP_DUR, Look, Pose,
  CallToAction, ctaCues} from './lib/kit';

// beat times = ElevenLabs Scribe word starts + 0.1 s voice offset (word ends checked against the loudness pauses)
export const T = {
  steel: 1.22, toss: 1.32, splash: 1.74, right: 2.26, bed: 2.95,
  but: 3.06, steel2: 3.46, ship: 3.78, floats: 4.26,
  its: 5.3, shape: 5.62,
  hollow: 6.74, hull: 7.14, lift: 7.3, settles: 7.54, pushes1: 9.02, aside1: 9.5, weighs: 9.94, much1: 10.5, ship2: 10.98,
  cta: 11.95, then: 11.94, pushes2: 12.74, up: 13.18, just: 13.42, hard: 13.86,
  solid: 14.98, block2: 15.22, cant: 15.7, push3: 16.1, much3: 16.9, water3: 17.14, so: 17.78,
};
export const DURATION = 19.0;

// ---------- world (near layer Z = 1000: pier, guy, block, sea bed; ship layer Z_SHIP; horizon Z_FAR) ----------
const Z_SHIP = 2150, Z_FAR = 6000;
const DOCK_Y = -60, GX = -560, DOCK_X1 = GX + 45;   // pier deck top, the guy's feet, the pier's end
export const BED = 520;                              // sea bed (near layer)
export const BW = 80, BH = 76;                       // the steel block
const HOLD = {x: GX + 95, y: DOCK_Y - 182 - BH / 2}; // block centre resting on the 'present' palm
const SINK_X = GX + 150, BED_Y = BED - BH / 2 + 4;
export const SX = 98;                               // ship centre (ship layer)

// ---------- colours ----------
export const SEA = '#62B6E6', SEA_D = '#2F86C4', SEA_L = '#A9DAF4', SEA_FAR = '#9FD4F1';
const SAND = '#EAD9A6', SAND_D = '#D3BC80', WEED = '#4FAE6A', WEED_D = '#3B8F55';
export const WOOD = '#C08A55', WOOD_D = '#9C6B3D';
export const STEEL = '#A9B2BC', STEEL_D = '#8C96A2';
export const HULL = '#2F4A66', HULL_RED = '#D9544A', CABIN = '#F7F3EA', FUNNEL = '#FFD43B', PAPER = '#FBF7EC';
const BOX_COLS = ['#F28C38', '#3D8FD6', '#56B870', '#E5534B', '#F2C94C', '#8E6CD1', '#2BB3A3', '#F28C38', '#3D8FD6'];

// ---------- helpers ----------
const useFit = () => {
  const {width, height} = useVideoConfig(); const wf = React.useContext(WideFit);
  return {cx: width / 2, cy: height / 2, kf: width > height ? wf : 1, wide: width > height, width, height};
};
type Fit = ReturnType<typeof useFit>;
/** where a world point of a layer at depth z lands on screen (same maths as kit Layer) */
const toScreen = (fit: Fit, cam: Cam, z: number, x: number, y: number) => {
  const k = (1000 / (z - cam.z)) * fit.kf;
  return {x: fit.cx + k * (x - cam.x), y: fit.cy + k * (y - cam.y), k};
};
const out = (t: number, a: number, d = 0.25) => 1 - eio(seg(t, a, a + d));
/** pen stroke that draws itself: p 0..1 */
const pen = (p: number) => ({pathLength: 1, strokeDasharray: `${p} 2`, visibility: (p > 0.002 ? 'visible' : 'hidden') as 'visible' | 'hidden'});

// ---------- sea, sea bed, pier ----------
const waveD = (x0: number, x1: number, y: number, t: number, amp: number, len: number, phase: number) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 40) pts.push(`${x} ${(y + amp * Math.sin((x / len) * 2 * Math.PI + t * 1.7 + phase)).toFixed(1)}`);
  return 'M ' + pts.join(' L ');
};
export const Sea: React.FC<{t: number; x0: number; x1: number; fill: string; op: number; amp?: number; len?: number; phase?: number; line?: number; shine?: boolean;
  hole?: {d: string; tf: string; id: string}}> =
  ({t, x0, x1, fill, op, amp = 7, len = 420, phase = 0, line = 7, shine = true, hole}) => {
    const top = waveD(x0, x1, 0, t, amp, len, phase);
    const m = hole ? `url(#${hole.id})` : undefined;
    return (
      <W>
        {hole ? <mask id={hole.id} maskUnits="userSpaceOnUse" x={-9000} y={-9000} width={18000} height={18000}>
          <rect x={-9000} y={-9000} width={18000} height={18000} fill="#fff" /><path d={hole.d} transform={hole.tf} fill="#000" />
        </mask> : null}
        <g mask={m}>
        <path d={`${top} L ${x1} 6000 L ${x0} 6000 Z`} fill={fill} fillOpacity={op} />
        {shine ? Array.from({length: 14}).map((_, i) => {
          const x = x0 + ((i * 397 + t * 22) % (x1 - x0)), y = 26 + (i % 3) * 22;
          return <path key={i} d={`M ${x} ${y} l ${46 + (i % 4) * 14} 0`} stroke="#fff" strokeOpacity={0.75} strokeWidth={6} strokeLinecap="round" />;
        }) : null}
        <path d={top} stroke={INK} strokeWidth={line} fill="none" strokeLinejoin="round" />
        </g>
      </W>
    );
  };
const bedD = (() => {
  const pts: string[] = [];
  for (let x = -3200; x <= 3200; x += 160) pts.push(`${x} ${(BED + 14 * Math.sin(x / 230) + 10 * (rnd(x) - 0.5)).toFixed(1)}`);
  return 'M ' + pts.join(' L ');
})();
const Weed: React.FC<{x: number; t: number; h: number; seed: number}> = ({x, t, h, seed}) => (
  <g>{[-1, 0, 1].map((i) => {
    const hh = h * (0.7 + 0.35 * rnd(seed + i)), sw = 16 * Math.sin(t * 1.6 + seed + i * 1.3);
    const d = `M ${x + i * 18} ${BED + 6} Q ${x + i * 18 + sw - 20} ${BED - hh * 0.5} ${x + i * 26 + sw} ${BED - hh}`;
    return <g key={i}><path d={d} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
      <path d={d} stroke={i ? WEED : WEED_D} strokeWidth={11} fill="none" strokeLinecap="round" /></g>;
  })}</g>
);
const Seabed: React.FC<{t: number}> = ({t}) => (
  <W>
    <path d={`${bedD} L 3200 4000 L -3200 4000 Z`} fill={SAND} />
    {[-1500, -1180, -760, -260, 140, 520, 980, 1400].map((x, i) =>
      <ellipse key={x} cx={x} cy={BED + 26 + 12 * rnd(i)} rx={22 + 12 * rnd(i + 9)} ry={12 + 5 * rnd(i + 4)} fill={SAND_D} />)}
    <path d={bedD} stroke={INK} strokeWidth={8} fill="none" strokeLinejoin="round" />
    <Weed x={-860} t={t} h={190} seed={1} />
    <Weed x={-80} t={t} h={150} seed={5} />
    <Weed x={760} t={t} h={210} seed={9} />
  </W>
);
const Fish: React.FC<{t: number}> = ({t}) => {
  const x = -560 + 70 * t, y = 300 + 18 * Math.sin(t * 2.1), wag = 10 * Math.sin(t * 9);
  return <W><g transform={`translate(${x} ${y})`}>
    <path d={`M -30 0 L -62 ${-20 + wag} L -62 ${20 + wag} Z`} fill="#F59A3E" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={0} cy={0} rx={38} ry={22} fill="#F7B04F" stroke={INK} strokeWidth={6} />
    <circle cx={18} cy={-5} r={5} fill={INK} />
  </g></W>;
};
const POSTS = [DOCK_X1 - 40, DOCK_X1 - 360, DOCK_X1 - 680, DOCK_X1 - 1000, DOCK_X1 - 1320];
const DockPosts: React.FC = () => (
  <W>{POSTS.map((x) => <rect key={x} x={x - 19} y={DOCK_Y + 12} width={38} height={BED - DOCK_Y + 10} rx={6} fill={WOOD_D} stroke={INK} strokeWidth={7} />)}</W>
);
const DockDeck: React.FC = () => (
  <W>
    <rect x={-2600} y={DOCK_Y} width={DOCK_X1 + 2600} height={30} rx={7} fill={WOOD} stroke={INK} strokeWidth={8} />
    {Array.from({length: 18}).map((_, i) => <line key={i} x1={DOCK_X1 - 90 - i * 120} y1={DOCK_Y + 6} x2={DOCK_X1 - 90 - i * 120} y2={DOCK_Y + 24} stroke={WOOD_D} strokeWidth={5} />)}
  </W>
);

// ---------- the steel block ----------
export const BlockArt: React.FC<{w: number; h: number; sw?: number}> = ({w, h, sw = 7}) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={9} fill={STEEL} />
    <path d={`M ${w / 2 - w * 0.24} ${-h / 2} H ${w / 2 - 9} Q ${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + 9} V ${h / 2 - 9} Q ${w / 2} ${h / 2} ${w / 2 - 9} ${h / 2} H ${w / 2 - w * 0.24} Z`} fill={STEEL_D} />
    <path d={`M ${-w / 2 + 12} ${-h / 2 + 12} l ${w * 0.32} 0`} stroke="#fff" strokeOpacity={0.8} strokeWidth={sw * 0.8} strokeLinecap="round" />
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([a, b], i) => <circle key={i} cx={a * (w / 2 - 11)} cy={b * (h / 2 - 11)} r={sw * 0.5} fill={STEEL_D} />)}
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={9} fill="none" stroke={INK} strokeWidth={sw} />
  </g>
);
const RealBlock: React.FC<{x: number; y: number; rot: number; f: Face; t: number}> = ({x, y, rot, f, t}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${x}px ${y}px`, transform: `rotate(${rot}deg)`}}>
    <W><g transform={`translate(${x} ${y})`}><BlockArt w={BW} h={BH} /></g></W>
    <ObjectFace x={x - 3} y={y + 4} r={40} f={f} t={t} lidColor={STEEL} />
  </div>
);

// ---------- the ship (local coords: design waterline y = 0, bow on the left) ----------
export const HULL_P = 'M 750 -170 L -735 -170 L -790 -205 Q -760 10 -600 150 L 600 150 Q 715 150 738 40 Z';
const INNER_P = 'M 722 -150 L -728 -150 Q -735 0 -590 128 L 588 128 Q 690 128 712 30 Z';
const BOXES = [
  ...Array.from({length: 9}).map((_, i) => ({x: -680 + i * 120, y: -250, c: BOX_COLS[i]})),
  ...Array.from({length: 6}).map((_, i) => ({x: -440 + i * 120, y: -330, c: BOX_COLS[(i + 4) % 9]})),
];
/** id: unique per instance (clip paths) · xray 0..1 cut-away showing the empty hull · wl: water level in local coords
 *  (tint + hatch below it) · tint: front-water tint · hatch: "water pushed aside" · hl: highlighter trace 0..1 */
export const ShipArt: React.FC<{id: string; xray?: number; wl?: number; tint?: number; hatch?: number; hl?: number; sw?: number}> =
  ({id, xray = 0, wl = 0, tint = 0, hatch = 0, hl = 0, sw = 9}) => (
    <g>
      <defs>
        <clipPath id={`${id}-hull`}><path d={HULL_P} /></clipPath>
        <clipPath id={`${id}-inner`}><path d={INNER_P} /></clipPath>
        <pattern id={`${id}-hatch`} width={30} height={30} patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
          <rect width={30} height={30} fill={SEA_L} /><line x1={0} y1={0} x2={0} y2={30} stroke={SEA} strokeWidth={13} />
        </pattern>
      </defs>
      {/* deck cargo, bridge and funnel */}
      {BOXES.map((b, i) => <g key={i}>
        <rect x={b.x} y={b.y} width={120} height={80} rx={6} fill={b.c} stroke={INK} strokeWidth={sw * 0.7} />
        {[30, 60, 90].map((dx) => <line key={dx} x1={b.x + dx} y1={b.y + 12} x2={b.x + dx} y2={b.y + 68} stroke="rgba(0,0,0,0.2)" strokeWidth={5} />)}
      </g>)}
      <path d="M 650 -500 L 630 -615 L 520 -615 L 505 -500 Z" fill={FUNNEL} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M 632 -606 L 518 -606" stroke={INK} strokeWidth={26} />
      <rect x={440} y={-475} width={250} height={310} rx={10} fill={CABIN} stroke={INK} strokeWidth={sw} />
      <rect x={415} y={-505} width={300} height={46} rx={9} fill={CABIN} stroke={INK} strokeWidth={sw} />
      {[0, 1, 2, 3, 4].map((i) => <rect key={i} x={428 + i * 56} y={-496} width={40} height={26} rx={6} fill="#2E3C4F" />)}
      {[-420, -350, -280].map((y) => [480, 535, 590, 645].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r={13} fill="#BFE3F7" stroke={INK} strokeWidth={5} />))}
      {/* hull: navy above the design waterline, red anti-fouling below */}
      <path d={HULL_P} fill={HULL} />
      <rect x={-900} y={0} width={1800} height={300} fill={HULL_RED} clipPath={`url(#${id}-hull)`} />
      <rect x={-900} y={-14} width={1800} height={14} fill="#F2EEE4" clipPath={`url(#${id}-hull)`} />
      {/* cut-away: the hull is mostly air inside */}
      {xray > 0.01 ? <g opacity={xray}>
        <path d={INNER_P} fill={PAPER} />
        {[-520, -390, -260, -130, 0, 130, 260, 390, 520].map((x) => <line key={x} x1={x} y1={-160} x2={x} y2={140} stroke="#D6CFBF" strokeWidth={8} clipPath={`url(#${id}-inner)`} />)}
        <path d={INNER_P} fill="none" stroke={INK} strokeWidth={sw * 0.7} strokeDasharray="22 14" />
        {[[-330, -40], [330, -30], [-60, 70]].map(([x, y], i) =>
          <path key={i} d={`M ${x - 60} ${y} q 20 -26 40 0 t 40 0 t 40 0`} stroke="#8CC8EE" strokeWidth={10} fill="none" strokeLinecap="round" />)}
        <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={110} fill="#8CC8EE">AIR</text>
      </g> : null}
      {/* the water this hull pushes aside (below the water level) */}
      {hatch > 0.01 ? <g opacity={hatch} clipPath={`url(#${id}-hull)`}>
        <rect x={-900} y={wl} width={1800} height={400} fill={`url(#${id}-hatch)`} />
      </g> : null}
      {tint > 0.01 ? <rect x={-900} y={wl} width={1800} height={400} fill={SEA} fillOpacity={tint} clipPath={`url(#${id}-hull)`} /> : null}
      {tint > 0 || xray > 0.01 ? <path d={`M -900 ${wl} L 900 ${wl}`} stroke={SEA_D} strokeWidth={sw * 0.9} clipPath={`url(#${id}-hull)`} /> : null}
      <path d={HULL_P} fill="none" stroke={INK} strokeWidth={sw} strokeLinejoin="round" />
      {hatch > 0.01 ? <g opacity={hatch}>
        <clipPath id={`${id}-below`}><rect x={-900} y={wl} width={1800} height={400} /></clipPath>
        <path d={HULL_P} fill="none" stroke={SEA_D} strokeWidth={sw * 1.1} strokeDasharray="26 16" clipPath={`url(#${id}-below)`} />
      </g> : null}
      {hl > 0.01 ? <path d={HULL_P} fill="none" stroke="#FFE14D" strokeOpacity={0.75} strokeWidth={46} strokeLinejoin="round" {...pen(hl)} /> : null}
    </g>
  );
/** the water a hull pushes aside at its design waterline, as a blob (for the scale) */
export const WaterBlob: React.FC<{id: string; sw?: number}> = ({id, sw = 9}) => (
  <g>
    <clipPath id={`${id}-wb`}><rect x={-900} y={0} width={1800} height={400} /></clipPath>
    <path d={HULL_P} fill={SEA} stroke={INK} strokeWidth={sw * 2} clipPath={`url(#${id}-wb)`} />
    <path d="M -560 30 l 220 0 M -200 34 l 120 0" stroke="#fff" strokeOpacity={0.8} strokeWidth={sw * 1.4} strokeLinecap="round" />
    <path d={`M -722 ${sw / 2} L 738 ${sw / 2}`} stroke={INK} strokeWidth={sw * 1.2} strokeLinecap="round" />
  </g>
);
const MiniFace: React.FC<{x: number; y: number; s: number; mood?: 'smile' | 'o' | 'worried'}> = ({x, y, s, mood = 'smile'}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((d) => <g key={d}><ellipse cx={d * 16} cy={-4} rx={8} ry={11} fill="#fff" stroke={INK} strokeWidth={4} /><circle cx={d * 16} cy={-2} r={4} fill={INK} /></g>)}
    {mood === 'smile' ? <path d="M -12 14 Q 0 22 12 14" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
    {mood === 'o' ? <ellipse cx={0} cy={17} rx={4.5} ry={6} fill="#5A2328" stroke={INK} strokeWidth={3} /> : null}
    {mood === 'worried' ? <>
      <path d="M -10 18 Q 0 12 10 18" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      <path d="M -24 -22 L -10 -18 M 24 -22 L 10 -18" stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
    </> : null}
  </g>
);

/** screen-space label with a pointer line to (ax, ay) */
const Tag: React.FC<{x: number; y: number; ax: number; ay: number; text: string; s: number; fs?: number}> = ({x, y, ax, ay, text, s, fs = 42}) => s > 0.01 ? (
  <>
    <W><path d={`M ${x} ${y} L ${ax} ${ay}`} stroke={INK} strokeWidth={6} strokeLinecap="round" {...pen(clamp(s))} /></W>
    <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, background: '#fff', border: `6px solid ${INK}`,
      borderRadius: 18, padding: '4px 18px', fontFamily: FONT, fontWeight: 900, fontSize: fs, color: INK, whiteSpace: 'nowrap', boxShadow: `0 6px 0 ${INK}`}}>{text}</div>
  </>
) : null;

// ---------- faces over time ----------
const shipFace = (t: number): Face => {
  const f: Face = {...FACE0, lx: -0.5, ly: 0.1, lid: 0.15};
  if (t > T.floats) { f.lid = 0.45; f.brow = -6; f.lx = -0.2; }
  if (t > T.shape) { f.lid = 0.3; f.brow = -9; f.ly = -0.3; f.lx = 0; }
  if (t > T.hollow) { f.lid = 0; f.brow = 0; f.lx = 0.6; f.ly = 1; f.mouth = 'smile'; }
  if (t > T.lift) { f.open = 1 + 0.15 * popIn(t, T.lift, 0.2); f.mouth = 'o'; f.lx = 0; f.ly = 0; f.brow = -10; }
  if (t > 8.05) { f.open = 1; f.mouth = 'smile'; f.brow = 0; f.lid = 0.2; f.ly = 0.6; f.lx = 0.2; }
  if (t > T.weighs) { f.lid = 0; f.lx = 0.5; f.ly = -1; }
  if (t > T.ship2 && t < T.ship2 + 0.7) { f.squeeze = 1; f.mouth = 'grin'; }
  if (t > T.ship2 + 0.7) { f.mouth = 'smile'; f.lid = 0.4; f.brow = -6; f.lx = 0; f.ly = 0; }
  if (t > T.pushes2) { f.squeeze = 1; f.mouth = 'grin'; }
  if (t > T.hard + 0.35) { f.squeeze = 0; f.mouth = 'smile'; f.lid = 0.45; f.brow = -6; }
  if (t > T.solid) { f.lx = -1; f.ly = 0.9; f.lid = 0.45; f.brow = -8; f.mouth = 'smile'; }
  return f;
};
const blockFace = (t: number): Face => {
  const f: Face = {...FACE0, lx: 0.1, ly: -0.2};
  if (t > T.toss) { f.open = 1 + 0.2 * popIn(t, T.toss, 0.18); f.mouth = 'o'; f.brow = -12; f.ly = 0.6; }
  if (t > T.splash) { f.ly = -1; f.lx = 0; f.open = 1.1; }
  if (t > T.bed && t < T.bed + 0.3) { f.squeeze = 1; f.mouth = 'grit'; }
  if (t > T.bed + 0.3) { f.squeeze = 0; f.open = 1; f.mouth = 'frown'; f.brow = -12; f.lx = 0.8; f.ly = -0.7; }
  if (t > T.weighs) { f.ly = -1; f.lx = 0.4; }
  if (t > T.solid) { f.lx = 0; f.ly = 0; f.mouth = 'flat'; f.brow = -12; }
  if (t > T.cant) f.sweat = seg(t, T.cant, T.cant + 0.3);
  if (t > T.so) { f.ly = -1; f.lx = 0.5; f.mouth = 'frown'; }
  return f;
};

// ---------- the doodle scale (screen space, pen on the notebook page) ----------
type ScaleS = {draw: number; ang: number; left: 'ship' | 'block' | null; leftS: number; right: 'blob' | 'cube' | null; rightS: number; eq: number};
const scaleAt = (t: number): ScaleS => {
  const draw = seg(t, 9.25, 9.9);
  let ang = 0;
  // the ship lands on the left pan: tips left; the water lands on the right: back to level with a wobble
  ang += 13 * eout(seg(t, T.weighs + 0.05, T.weighs + 0.35)) + spring(t, T.weighs + 0.35, 2.5, 2.2, 5);
  ang -= 13 * eout(seg(t, 10.72, 10.98)) - spring(t, 10.98, -3, 2.4, 4.5);
  // last line: everything off, then the block lands (tips hard left) and its small cube of water barely moves it
  const off = seg(t, T.solid, T.solid + 0.22);
  ang *= 1 - off;
  ang += 19 * eout(seg(t, T.block2 + 0.12, T.block2 + 0.4)) + spring(t, T.block2 + 0.4, 3, 2.5, 5);
  ang += -2.5 * seg(t, T.push3 + 0.25, T.push3 + 0.4) + spring(t, T.push3 + 0.4, 1.2, 3, 6) + spring(t, T.water3, 1.6, 3, 6);
  const left = t < T.solid + 0.22 ? (t >= T.weighs ? 'ship' : null) : t >= T.block2 ? 'block' : null;
  const leftS = left === 'ship' ? popIn(t, T.weighs, 0.3) * (1 - eio(off)) : left === 'block' ? 1 : 0;
  const right = t < T.solid + 0.22 ? (t >= 10.72 ? 'blob' : null) : t >= T.push3 + 0.2 ? 'cube' : null;
  const rightS = right === 'blob' ? 1 - eio(off) : right === 'cube' ? popIn(t, T.push3 + 0.2, 0.3) : 0;
  const eq = popIn(t, T.ship2 + 0.05, 0.3) * (1 - eio(off));
  return {draw, ang, left, leftS, right, rightS, eq};
};
const scaleGeo = (fit: Fit) => fit.wide
  ? {px: fit.width * 0.76, py: 250, s: 0.62}
  : {px: fit.width / 2, py: 430, s: 1};
const L_BEAM = 230, STRING = 118;
const panPos = (fit: Fit, ang: number, side: -1 | 1) => {
  const g = scaleGeo(fit), a = (ang * Math.PI) / 180;
  const ex = g.px + side * L_BEAM * g.s * Math.cos(a), ey = g.py - side * L_BEAM * g.s * Math.sin(a);
  return {ex, ey, x: ex, y: ey + STRING * g.s, s: g.s};
};
const DoodleScale: React.FC<{t: number; st: ScaleS; fit: Fit}> = ({t, st, fit}) => {
  if (st.draw <= 0) return null;
  const g = scaleGeo(fit), a = (st.ang * Math.PI) / 180, s = g.s;
  const L = panPos(fit, st.ang, -1), R = panPos(fit, st.ang, 1);
  const p1 = seg(st.draw, 0, 0.45), p2 = seg(st.draw, 0.3, 0.7), p3 = seg(st.draw, 0.6, 1);
  const ink = {stroke: INK, strokeWidth: 8 * s, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const bx = (Math.cos(a) * L_BEAM + 14) * s, by = Math.sin(a) * L_BEAM * s;
  const pan = (P: {x: number; y: number; ex: number; ey: number}) => <g>
    <path d={`M ${P.ex} ${P.ey} L ${P.x - 92 * s} ${P.y} M ${P.ex} ${P.ey} L ${P.x + 92 * s} ${P.y}`} {...ink} strokeWidth={5 * s} {...pen(p3)} />
    <path d={`M ${P.x - 100 * s} ${P.y} Q ${P.x} ${P.y + 62 * s} ${P.x + 100 * s} ${P.y} Z`} {...ink} fill={p3 > 0.95 ? PAPER : 'none'} {...pen(p3)} />
  </g>;
  return (
    <svg width={fit.width} height={fit.height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {/* stand */}
      <path d={`M ${g.px} ${g.py} L ${g.px} ${g.py + 300 * s} M ${g.px - 110 * s} ${g.py + 318 * s} L ${g.px + 110 * s} ${g.py + 318 * s} M ${g.px - 70 * s} ${g.py + 318 * s} Q ${g.px} ${g.py + 270 * s} ${g.px + 70 * s} ${g.py + 318 * s}`} {...ink} {...pen(p1)} />
      {/* beam */}
      <path d={`M ${g.px - bx} ${g.py + by} L ${g.px + bx} ${g.py - by}`} {...ink} strokeWidth={10 * s} {...pen(p2)} />
      {p2 > 0.2 ? <circle cx={g.px} cy={g.py} r={13 * s} fill={FUNNEL} stroke={INK} strokeWidth={6 * s} /> : null}
      {pan(L)}{pan(R)}
      {/* left pan: the ship, later the block */}
      {st.left === 'ship' && st.leftS > 0.01 ? <g transform={`translate(${L.x} ${L.y - 2 * s}) scale(${0.13 * s * st.leftS}) translate(0 -150)`}>
        <ShipArt id="mini" sw={34} />
        <MiniFace x={-560} y={-88} s={3.6} mood="smile" />
      </g> : null}
      {st.left === 'block' && st.leftS > 0.01 ? <g transform={`translate(${L.x} ${L.y - 2 * s - 37 * s}) scale(${s})`}>
        <BlockArt w={80} h={74} sw={6} />
        <MiniFace x={-3} y={4} s={1.05} mood="worried" />
      </g> : null}
      {/* right pan: the water the hull pushed aside, later the block's own water */}
      {st.right === 'blob' && st.rightS > 0.01 ? <g transform={`translate(${R.x} ${R.y - 2 * s}) scale(${0.13 * s * st.rightS}) translate(-8 -150)`}>
        <WaterBlob id="pan" sw={34} />
      </g> : null}
      {st.right === 'cube' && st.rightS > 0.01 ? <g transform={`translate(${R.x} ${R.y - 2 * s - 37 * s * st.rightS}) scale(${s * st.rightS})`}>
        <rect x={-40} y={-37} width={80} height={74} rx={10} fill={SEA} stroke={INK} strokeWidth={6} />
        <path d="M -26 -22 l 26 0" stroke="#fff" strokeOpacity={0.85} strokeWidth={6} strokeLinecap="round" />
      </g> : null}
      {/* "=" when it balances */}
      {st.eq > 0.01 ? <g transform={`translate(${g.px} ${g.py - 78 * s}) scale(${st.eq * s})`}>
        <path d="M -34 -12 L 34 -12 M -34 12 L 34 12" stroke="#2E9E58" strokeWidth={13} strokeLinecap="round" />
      </g> : null}
    </svg>
  );
};

// ---------- the scene as a function of time ----------
const ShipScene: React.FC<{t: number}> = ({t}) => {
  const fit = useFit();
  const cam = camAt([
    {t: 0, x: -332, y: -150, k: 1.45}, {t: 1.5, x: -332, y: -150, k: 1.45},
    {t: 3.05, x: -127, y: -120, k: 0.9},
    {t: 14.5, x: -120, y: -118, k: 0.92},
    {t: 15.6, x: -200, y: -40, k: 1.0},
    {t: DURATION, x: -205, y: -36, k: 1.01},
  ], t);

  // --- guy: holds the block out, tosses it, shrugs, points at the ship, watches the explanation ---
  let g: {pose: Pose; sx: number; sy: number} = {pose: 'present', sx: 1, sy: 1};
  const chain: [number, Pose][] = [[T.right, 'shrug'], [T.but, 'point_right'], [T.hollow, 'think'], [T.weighs, 'lookup'],
    [T.ship2, 'surprised'], [T.pushes2, 'present'], [T.solid, 'front_worried'], [T.so, 'shrug']];
  let prev: Pose = 'present';
  for (const [ts, p] of chain) { if (t >= ts - 0.13) g = swap(t, ts, prev, p); prev = p; }
  const toss = spring(t, T.toss, 0.035, 3, 7);
  const breathe = 1 + 0.009 * Math.sin(2 * Math.PI * 0.6 * t);

  // --- block: on the palm -> tossed -> splash -> sinks -> sits on the sea bed ---
  let bx = HOLD.x, by = HOLD.y + (HOLD.y - DOCK_Y) * (breathe - 1), brot = 0;
  if (t >= T.toss) {
    const fly = arcY(HOLD.y, 0, T.splash - T.toss, 0.13);
    const u = seg(t, T.toss, T.splash);
    bx = lerp(HOLD.x, SINK_X, u); by = t < T.splash ? fly(t - T.toss) : 0; brot = 24 * u;
  }
  if (t >= T.splash) {
    const u = seg(t, T.splash, T.bed), e = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
    bx = SINK_X; by = lerp(0, BED_Y, e); brot = 24 * (1 - u) + 7 * Math.sin(u * 9) * (1 - u);
  }
  const bsq = t >= T.bed ? 1 + spring(t, T.bed, -0.12, 3.5, 8) : 1;

  // --- ship: bobs; pops up out of the water on "settles", then sinks back to where it pushes aside its own weight ---
  const bob = 6 * Math.sin(2 * Math.PI * 0.32 * t), rot = 0.7 * Math.sin(2 * Math.PI * 0.32 * t + 1.2);
  const liftU = eout(seg(t, T.lift, T.lift + 0.22));
  const settleU = seg(t, T.settles + 0.05, 8.5);
  const lift = -160 * liftU * (1 - eio(settleU)) + spring(t, 8.5, 14, 1.4, 3.2);
  const dy = bob + lift;
  const xray = popIn(t, T.hollow, 0.3) * out(t, 8.3, 0.3);
  const hatch = seg(t, 8.45, 8.75) * (t < T.weighs + 0.25 ? 1 : 0);
  const hl = seg(t, T.shape - 0.05, T.shape + 0.45) * out(t, 6.55, 0.2);
  const sf = shipFace(t);

  // --- the water pushed aside flies from the hull to the scale's right pan ---
  const st = scaleAt(t);
  const flyU = seg(t, T.weighs + 0.25, 10.72);
  let blob: React.ReactNode = null;
  if (flyU > 0 && flyU < 1) {
    const A = toScreen(fit, cam, Z_SHIP, SX + 8, dy + 75);
    const P = panPos(fit, st.ang, 1), sP = 0.13 * P.s;
    const B = {x: P.x - 8 * sP, y: P.y - 2 * P.s - 75 * sP};
    const e = eio(flyU), x = lerp(A.x, B.x, e), y = lerp(A.y, B.y, e) - 220 * Math.sin(Math.PI * e) * fit.kf;
    const s = Math.exp(lerp(Math.log(A.k), Math.log(sP), e));
    blob = <svg width={fit.width} height={fit.height} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <g transform={`translate(${x} ${y}) scale(${s}) translate(-8 -75)`}><WaterBlob id="fly" sw={9 / Math.max(0.3, s / A.k)} /></g>
    </svg>;
  }

  // --- arrows: water pushes up, the ship's weight pushes down, same size ---
  const upS = popIn(t, T.pushes2, 0.3) * out(t, 14.6, 0.25), downS = popIn(t, T.just, 0.3) * out(t, 14.6, 0.25);
  const pulse = 1 + 0.05 * Math.sin((t - T.hard) * 2 * Math.PI * 1.6) * seg(t, T.hard, T.hard + 0.2);
  // --- pushed-aside arrows at the waterline ---
  const sideS = popIn(t, T.pushes1, 0.3) * out(t, 9.95, 0.25);
  const tagS = popIn(t, T.steel2, 0.3) * out(t, 5.15, 0.2);

  // bubbles from the sinking block (seeded)
  const bubbles = Array.from({length: 16}).map((_, i) => {
    const t0 = T.splash + 0.05 + i * 0.075, age = t - t0;
    if (age <= 0 || age > 1.3) return null;
    const u = seg(t0, T.splash, T.bed), e = u * u * (3 - 2 * u) * 0.35 + u * 0.65;
    const y0 = lerp(0, BED_Y, e) - BH / 2, y = y0 - 260 * age;
    if (y < 8) return null;
    return {x: SINK_X + (rnd(i) - 0.5) * 40 + 12 * Math.sin(age * 9 + i), y, r: 7 + 7 * rnd(i + 30)};
  }).filter(Boolean) as {x: number; y: number; r: number}[];
  // splash drops + rings
  const drops = Array.from({length: 8}).map((_, i) => {
    const age = t - T.splash; if (age <= 0 || age > 0.75) return null;
    const a = (-150 + (i / 7) * 120 + (rnd(i) - 0.5) * 14) * Math.PI / 180, v = 360 + 220 * rnd(i + 5);
    return {x: SINK_X + Math.cos(a) * v * age, y: Math.sin(a) * v * age + 0.5 * 1900 * age * age, r: (11 + 6 * rnd(i + 8)) * (1 - age / 0.75)};
  }).filter((d) => d && d.y < 6) as {x: number; y: number; r: number}[];
  const ringU = seg(t, T.splash, T.splash + 0.9);

  // landing puff on the sea bed
  const puffU = seg(t, T.bed, T.bed + 0.6);

  return (
    <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
      <Sky />
      {/* horizon */}
      <Layer cam={cam} z={Z_FAR}>
        <W>
          {[[-2700, -2500, 1.2], [2600, -2900, 1.0], [400, -3600, 0.8]].map(([x, y, s], i) => <g key={i} transform={`translate(${x} ${y}) scale(${s * 3})`}>
            <path d="M -110 30 Q -120 -10 -80 -14 Q -70 -52 -26 -44 Q 0 -78 40 -50 Q 86 -58 92 -16 Q 128 -6 112 30 Z" fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          </g>)}
        </W>
        <Sea t={t} x0={-8000} x1={8000} fill={SEA_FAR} op={1} amp={0} line={14} shine={false} />
      </Layer>
      {/* ship layer: back water, the ship, front water */}
      <Layer cam={cam} z={Z_SHIP}>
        <Sea t={t} x0={-4000} x1={4000} fill={SEA_L} op={1} amp={5} len={380} phase={2} line={0} shine={false} />
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${SX}px 0px`, transform: `translate(0px, ${dy}px) rotate(${rot}deg)`}}>
          <W><g transform={`translate(${SX} 0)`}>
            <ShipArt id="ship" xray={xray} wl={-dy} tint={0.25 * (1 - xray)} hatch={hatch} hl={hl} />
          </g></W>
          <ObjectFace x={SX - 560} y={-88} r={125} f={sf} t={t} lidColor={HULL} />
        </div>
        {/* "pushes aside" arrows on the water at both ends of the hull */}
        {sideS > 0.01 ? <>
          <Arrow x={SX - 880} y={-30} s={1.25 * sideS} rot={90} color={SEA_L} />
          <Arrow x={SX + 860} y={-30} s={1.25 * sideS} rot={-90} color={SEA_L} />
        </> : null}
        <Sea t={t} x0={-4000} x1={4000} fill={SEA} op={0.42} amp={6} len={380} phase={2} line={8}
          hole={{d: HULL_P, tf: `translate(${SX} ${dy}) rotate(${rot})`, id: 'shiphole'}} />
        {/* up: the water's push · down: the ship's weight */}
        <Arrow x={SX + 60} y={dy - 425} s={2.0 * downS * pulse} rot={0} color={C.red} />
      </Layer>
      {/* near layer: sea bed, block, pier, guy, front water */}
      <Layer cam={cam} z={1000}>
        <Seabed t={t} />
        <Fish t={t} />
        <DockPosts />
        {puffU > 0 && puffU < 1 ? <W>{[-1, 1].map((d) => [0, 1, 2].map((i) => {
          const r = (16 - i * 3) * Math.sin(Math.PI * puffU);
          return <circle key={`${d}${i}`} cx={SINK_X + d * (BW / 2 + 10 + i * 26 + 60 * puffU)} cy={BED - 8 - i * 6 - 20 * puffU} r={r} fill="#F3E7C4" stroke={INK} strokeWidth={4} />;
        }))}</W> : null}
        <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${bx}px ${by + BH / 2}px`, transform: `scale(${2 - bsq}, ${bsq})`}}>
          <RealBlock x={bx} y={by} rot={brot} f={blockFace(t)} t={t} />
        </div>
        <W>{bubbles.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#DDF2FC" fillOpacity={0.9} stroke={INK} strokeWidth={4} />)}</W>
      </Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Sea t={t} x0={-3200} x1={3200} fill={SEA} op={0.3} amp={7} len={430} line={8} />
        {ringU > 0 && ringU < 1 ? <W>{[0, 1].map((i) => {
          const u = clamp(ringU * 1.3 - i * 0.3);
          return u > 0 && u < 1 ? <ellipse key={i} cx={SINK_X} cy={4} rx={50 + 170 * u} ry={10 + 22 * u} fill="none" stroke={INK} strokeWidth={7 * (1 - u)} /> : null;
        })}</W> : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        <W>{drops.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={d.r} fill={SEA_L} stroke={INK} strokeWidth={4} />)}</W>
        <DockDeck />
        <ContactShadow x={GX} y={DOCK_Y} />
        <Guy pose={g.pose} x={GX} y={DOCK_Y} t={t} sx={g.sx} sy={g.sy * (1 + toss)} />
      </Layer>
      {/* screen space: the water's push (kept crisp above the near water), the STEEL tags, the flying water, the scale */}
      <AbsoluteFill>
        {upS > 0.01 ? (() => {
          const K = toScreen(fit, cam, Z_SHIP, SX + 60, dy + 156);
          return <Arrow x={K.x} y={K.y + 45 * 2.0 * K.k * pulse} s={2.0 * K.k * upS * pulse} rot={180} color="#5DB3EA" />;
        })() : null}
        {tagS > 0.01 ? (() => {
          const B = toScreen(fit, cam, 1000, SINK_X, BED_Y), K = toScreen(fit, cam, Z_SHIP, SX - 150, dy + 150);
          return <>
            <Tag x={B.x + 20} y={B.y - 150 * B.k} ax={B.x} ay={B.y - 46 * B.k} text="STEEL" s={tagS} />
            <Tag x={K.x} y={K.y + 120} ax={K.x} ay={K.y + 6} text="STEEL" s={popIn(t, T.steel2 + 0.1, 0.3) * out(t, 5.15, 0.2)} />
          </>;
        })() : null}
      </AbsoluteFill>
      {blob}
      <DoodleScale t={t} st={st} fit={fit} />
      {/* like / subscribe / comment: once the answer has landed (the scale balanced), gone before the last line */}
      <CallToAction t={t} at={T.cta} />
    </AbsoluteFill>
  );
};

export const Ship: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const waves: Cue[] = [0, 2.7, 5.4, 8.1, 10.8, 13.5, 16.2].map((at) => ({f: 'waves.wav', at, db: -31}));
  const cues: Cue[] = [
    ...waves,
    {f: 'whoosh.wav', at: T.toss - 0.05, db: -31},
    {f: 'splash.wav', at: T.splash - 0.02, db: -9},
    {f: 'bubbles.wav', at: T.splash + 0.15, db: -19}, {f: 'bubbles.wav', at: T.splash + 0.6, db: -23},
    {f: 'pop.wav', at: T.bed, db: -19},
    {f: 'horn.wav', at: T.floats + 0.02, db: -17, keys: [[T.floats, -17], [4.95, -17], [5.25, -45]]},
    {f: 'pop.wav', at: T.shape, db: -25},
    {f: 'pop.wav', at: T.hollow, db: -20},
    {f: 'whoosh.wav', at: T.lift - 0.08, db: -28},
    {f: 'splash.wav', at: 7.78, db: -21}, {f: 'bubbles.wav', at: 7.9, db: -27},
    {f: 'whoosh.wav', at: T.pushes1 - 0.1, db: -31},
    {f: 'pop.wav', at: T.weighs, db: -18},
    {f: 'whoosh.wav', at: T.weighs + 0.25, db: -30},
    {f: 'splash.wav', at: 10.7, db: -22},
    {f: 'ding.mp3', at: T.ship2, db: -19},
    {f: 'pop.wav', at: T.pushes2, db: -18}, {f: 'pop.wav', at: T.just, db: -20},
    {f: 'pop.wav', at: T.solid, db: -24},
    {f: 'pop.wav', at: T.block2 + 0.1, db: -14}, {f: 'twang.mp3', at: T.block2 + 0.14, db: -24},
    {f: 'pop.wav', at: T.push3 + 0.2, db: -22},
    ...ctaCues(T.cta),
    {f: 'crickets.mp3', at: T.so + 0.1, db: -30, to: 0.6, keys: [[T.so + 0.1, -30], [T.so + 0.5, -30], [T.so + 0.7, -50]]},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26}, // the loop push back to the opening shot
  ];
  return (
    <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<ShipScene t={0} />}>
        <ShipScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="ship/vo/take1.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const ShipWide: React.FC = () => <WideFit.Provider value={0.72}><Ship /></WideFit.Provider>;
