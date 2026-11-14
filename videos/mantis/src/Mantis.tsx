// "What if you had a mantis shrimp's punch?" - a what-if Short about YOU. Frame 0: the guy underwater, his fist
// smashing a snail shell, the water around his fist boiling into bubbles. Then the real peacock mantis shrimp
// (code-drawn) hits at ~80 km/h, faster than a blink; a slow-motion close-up shows the bubble that forms and bursts
// (the second hit). His knuckles crack on the first punch; the shrimp's club is built in spiral layers that stop
// cracks, so it is ready to punch again - and the loop goes back to his punch at frame 0.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Star, Sweat, Badge, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd, clamp,
  shake, hit, swap, pen, ObjectFace, FACE0, Face, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle, CommentAsk} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py; times below are video time). Last word ends ~20.6 s; + 0.8 s for the loop push.
export const DURATION = 21.4;
export const T = {
  punch: 0.1, fist: 2.97, boil: 3.57,                                // "Punch like a mantis shrimp, and the water around your fist would boil."
  club: 4.55, hits: 4.82, eighty: 5.46, faster: 7.04, blink: 7.72,  // "Its club hits at about eighty kilometers an hour, faster than a blink."
  water: 8.59, keep: 8.97, bubbles: 9.95, burst: 11.16, second: 11.95, // "The water can't keep up, so bubbles form and burst... a second hit."
  knuckles: 13.1, crack: 13.7, first: 14.35,                         // "But your knuckles would crack on the first one."
  shrimps: 15.1, spiral: 16.46, layers: 16.99, stop: 17.59, cracks: 17.97, // "The shrimp's club is built in spiral layers that stop cracks..."
  ready: 19.5, punch2: 19.84,                                        // "...so it's ready to punch again."
  cta: 12.55,
};
// guy punches (impact times; frame 0 is an impact) and shrimp strikes
const GUY_HITS = [0, 1.9, 3.57];
const KNUCKLE_HIT = T.crack;
const SHRIMP_HITS = [5.0, 7.62, 19.86];
// shots
const S4 = 12.55, S5 = 14.95;

const GOLD = '#FFD43B', RED = '#E2453C';
const SAND = '#F2DBA2', SAND2 = '#E2C485';
const W_TOP = '#86D2E6', W_BOT = '#3F95C6';

const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));

// ---------- bubbles ----------
const Bub: React.FC<{x: number; y: number; r: number; sw?: number}> = ({x, y, r, sw = 3.5}) => r > 0.4 ? (
  <g>
    <circle cx={x} cy={y} r={r} fill="#E6F8FF" stroke={INK} strokeWidth={Math.min(sw, r * 0.5)} />
    {r > 3 ? <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.28} fill="#FFFFFF" /> : null}
  </g>) : null;
/** a burst of cavitation bubbles at (x, y) born at t0: shoot out, rise, grow, then pop (shrink) */
const Burst: React.FC<{t: number; t0: number; x: number; y: number; n?: number; seed?: number; power?: number; dir?: number}> =
  ({t, t0, x, y, n = 22, seed = 1, power = 1, dir = 1}) => {
    const u0 = t - t0; if (u0 < 0 || u0 > 1.6) return null;
    return <W>{Array.from({length: n}, (_, i) => {
      const life = 0.6 + 0.9 * rnd(seed + i * 5), u = u0 - 0.04 * rnd(seed + i * 9);
      if (u < 0 || u > life) return null;
      const a = (rnd(seed + i) - 0.5) * Math.PI * 1.5 + (dir > 0 ? 0 : Math.PI), v = (90 + 160 * rnd(seed + i * 3)) * power;
      const k = 1 - Math.exp(-5 * u);
      const bx = x + (Math.cos(a) * v * k) / 5, by = y + (Math.sin(a) * v * k) / 5 - 70 * u * u * power;
      const r = (3 + 9 * rnd(seed + i * 7)) * power * Math.sin(Math.PI * Math.min(1, u / life) ** 0.6);
      return <Bub key={i} x={bx} y={by} r={r} />;
    })}</W>;
  };
/** a steady stream of small bubbles rising from (x, y) */
const Stream: React.FC<{t: number; x: number; y: number; n?: number; h?: number; seed?: number; sp?: number}> = ({t, x, y, n = 6, h = 600, seed = 3, sp = 90}) => (
  <W>{Array.from({length: n}, (_, i) => {
    const ph = ((t * sp) / h + rnd(seed + i)) % 1;
    const r = 3 + 5 * rnd(seed + i * 3);
    return <Bub key={i} x={x + 14 * Math.sin(t * 2.5 + i * 2) + (rnd(seed + i * 5) - 0.5) * 30} y={y - ph * h} r={r * Math.min(1, ph * 8, (1 - ph) * 8)} sw={3} />;
  })}</W>
);

// ---------- snail shell with a face ----------
const Shell: React.FC<{x: number; y: number; r: number; t: number; f: Face; cracks: number; sq?: number; seed?: number; tone?: string}> =
  ({x, y, r, t, f, cracks, sq = 1, seed = 1, tone = '#F6C97E'}) => {
    const spiral: string[] = [];
    for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 3.6, rr = r * 0.82 * (1 - i / 66); spiral.push(`${(Math.cos(a + 0.6) * rr).toFixed(1)} ${(Math.sin(a + 0.6) * rr).toFixed(1)}`); }
    const crackPaths = [
      `M ${-0.1 * r} ${-0.98 * r} L ${-0.25 * r} ${-0.6 * r} L ${-0.05 * r} ${-0.42 * r} L ${-0.3 * r} ${-0.15 * r}`,
      `M ${-0.95 * r} ${0.2 * r} L ${-0.6 * r} ${0.12 * r} L ${-0.5 * r} ${0.35 * r} L ${-0.2 * r} ${0.3 * r}`,
      `M ${0.6 * r} ${-0.78 * r} L ${0.42 * r} ${-0.45 * r} L ${0.62 * r} ${-0.3 * r}`,
      `M ${-0.7 * r} ${-0.66 * r} L ${-0.45 * r} ${-0.4 * r} L ${-0.62 * r} ${-0.2 * r}`,
    ];
    return (
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${x}px ${y + r}px`, transform: `scale(${2 - sq}, ${sq})`}}>
        <W>
          <g transform={`translate(${x} ${y})`}>
            {/* snail foot peeking out under the shell */}
            <path d={`M ${-0.9 * r} ${0.85 * r} Q ${-1.25 * r} ${0.95 * r} ${-1.2 * r} ${r} L ${0.9 * r} ${r} Q ${1.0 * r} ${0.8 * r} ${0.7 * r} ${0.75 * r} Z`} fill="#F4A9A0" stroke={INK} strokeWidth={r * 0.09} strokeLinejoin="round" />
            <circle r={r} fill={tone} />
            <path d={`M 0 0 m ${r * 0.1} ${r * 0.1} A ${r * 0.9} ${r * 0.9} 0 0 0 ${r * 0.8} ${r * 0.4} A ${r} ${r} 0 0 1 ${-r * 0.2} ${r} Z`} fill="#E3A95C" opacity={0.7} />
            <path d={'M ' + spiral.join(' L ')} fill="none" stroke="#B9783A" strokeWidth={r * 0.1} strokeLinecap="round" />
            <circle r={r} fill="none" stroke={INK} strokeWidth={r * 0.1} />
            {crackPaths.slice(0, cracks).map((d, i) => <path key={i} d={d} fill="none" stroke={INK} strokeWidth={r * 0.07} strokeLinejoin="round" strokeLinecap="round" />)}
          </g>
        </W>
        <ObjectFace x={x + 0.08 * r} y={y + 0.12 * r} r={r * 0.8} f={f} t={t} lidColor={tone} />
      </div>
    );
  };

// ---------- the peacock mantis shrimp (faces left; origin = on the sand under its middle) ----------
const SH = {green: '#4FB676', green2: '#3A9660', blue: '#3D7FD1', orange: '#FF8A3D', club: '#F05A78', club2: '#C93E5C', leg: '#FF7B4A'};
const ARM_PIVOT = [-82, -40], ARM_L = 36, CLUB_R = 15;
/** club position for an arm angle (degrees; 20 = folded under the head, 170 = struck forward) */
const armTip = (a: number) => [ARM_PIVOT[0] + ARM_L * Math.cos((a * Math.PI) / 180), ARM_PIVOT[1] + ARM_L * Math.sin((a * Math.PI) / 180)];
const Shrimp: React.FC<{x: number; y: number; s: number; t: number; arm: number; look?: number; blink?: number; wound?: number}> = ({x, y, s, t, arm, look = -1, blink = 0, wound = 0}) => {
  const [tx, ty] = armTip(arm);
  const breathe = 1 + 0.02 * Math.sin(t * 2 * Math.PI * 0.7);
  const ant = 6 * Math.sin(t * 2 * Math.PI * 0.9);
  const segs = [0, 1, 2, 3, 4, 5];
  const eye = (ex: number, ey: number, i: number) => {
    const lid = Math.max(blink, 0);
    return <g key={i}>
      <path d={`M -78 -66 Q ${(ex - 78) / 2 - 4} ${ey + 10} ${ex} ${ey + 4}`} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" />
      <path d={`M -78 -66 Q ${(ex - 78) / 2 - 4} ${ey + 10} ${ex} ${ey + 4}`} stroke={SH.green2} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={ex} cy={ey} rx={15} ry={17} fill="#fff" stroke={INK} strokeWidth={5} />
      <circle cx={ex + look * 5} cy={ey + 1} r={7} fill={INK} />
      <circle cx={ex + look * 5 - 2.5} cy={ey - 2} r={2.4} fill="#fff" />
      {lid > 0.02 ? <g>
        <clipPath id={`slid${i}`}><ellipse cx={ex} cy={ey} rx={15} ry={17} /></clipPath>
        <rect x={ex - 16} y={ey - 18} width={32} height={34 * lid} fill={SH.green} clipPath={`url(#slid${i})`} />
        <line x1={ex - 14} y1={ey - 17 + 34 * lid} x2={ex + 14} y2={ey - 17 + 34 * lid} stroke={INK} strokeWidth={4} strokeLinecap="round" />
        <ellipse cx={ex} cy={ey} rx={15} ry={17} fill="none" stroke={INK} strokeWidth={5} />
      </g> : null}
      {/* angry little brow */}
      <line x1={ex - 13} y1={ey - 24 - 3 * wound} x2={ex + 11} y2={ey - 20 + 3 * wound} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    </g>;
  };
  return (
    <W>
      <g transform={`translate(${x} ${y}) scale(${s})`}>
        {/* walking legs */}
        {[10, 34, 58].map((lx, i) => <path key={i} d={`M ${lx} -30 Q ${lx - 6} -12 ${lx - 14 + 3 * Math.sin(t * 6 + i)} 0`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />)}
        {[10, 34, 58].map((lx, i) => <path key={'l' + i} d={`M ${lx} -30 Q ${lx - 6} -12 ${lx - 14 + 3 * Math.sin(t * 6 + i)} 0`} stroke={SH.leg} strokeWidth={5} fill="none" strokeLinecap="round" />)}
        {/* tail fan */}
        <g transform={`translate(186 -40) rotate(${3 * Math.sin(t * 3)})`}>
          <path d="M 0 0 Q 30 -40 52 -26 Q 40 -6 54 6 Q 40 20 52 34 Q 26 44 0 8 Z" fill={SH.blue} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M 10 2 Q 30 -14 42 -14 M 10 6 Q 30 18 42 24" stroke="#F2C94C" strokeWidth={5} fill="none" strokeLinecap="round" />
        </g>
        {/* abdomen segments (back to front so the front overlaps) */}
        <g transform={`scale(1 ${breathe})`} style={{transformOrigin: '0px -40px'}}>
          {segs.slice().reverse().map((i) => {
            const cx = 170 - i * 30, h = 58 - (5 - i) * 0; const hh = 44 + i * 3;
            return <g key={i}>
              <rect x={cx - 22} y={-40 - hh / 2 - 2} width={44} height={hh} rx={18} fill={i % 2 ? SH.green : '#58C07F'} stroke={INK} strokeWidth={6} />
              <circle cx={cx} cy={-40 - hh / 2 + 10} r={4} fill="#F2C94C" />
              {h ? null : null}
            </g>;
          })}
        </g>
        {/* antennae + orange antennal scales (paddles) */}
        <path d={`M -102 -54 Q -150 ${-110 + ant} -190 ${-150 + ant}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M -100 -50 Q -160 ${-80 - ant} -205 ${-96 - ant}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        <g transform={`translate(-104 -48) rotate(${-20 + ant})`}>
          <ellipse cx={-26} cy={0} rx={26} ry={11} fill={SH.orange} stroke={INK} strokeWidth={5} />
        </g>
        {/* head / carapace */}
        <path d="M -112 -48 Q -110 -86 -60 -86 Q 0 -88 20 -66 Q 30 -40 20 -18 Q -20 -10 -70 -14 Q -112 -18 -112 -48 Z" fill={SH.green} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -70 -20 Q -20 -16 16 -24" stroke={SH.green2} strokeWidth={6} fill="none" strokeLinecap="round" />
        {[[-40, -70], [-12, -60], [-62, -56]].map(([sx, sy], i) => <circle key={i} cx={sx} cy={sy} r={5} fill={SH.blue} />)}
        {/* stalk eyes */}
        {eye(-104, -112, 0)}{eye(-72, -122, 1)}
        {/* the raptorial arm with the club (the punch) */}
        <path d={`M ${ARM_PIVOT[0]} ${ARM_PIVOT[1]} L ${tx} ${ty}`} stroke={INK} strokeWidth={22} strokeLinecap="round" />
        <path d={`M ${ARM_PIVOT[0]} ${ARM_PIVOT[1]} L ${tx} ${ty}`} stroke={SH.club} strokeWidth={11} strokeLinecap="round" />
        <circle cx={tx} cy={ty} r={CLUB_R} fill={SH.club} stroke={INK} strokeWidth={6} />
        <path d={`M ${tx - 8} ${ty - 6} Q ${tx} ${ty - 12} ${tx + 8} ${ty - 6}`} stroke="#FFC1CC" strokeWidth={4} fill="none" strokeLinecap="round" />
        <circle cx={ARM_PIVOT[0]} cy={ARM_PIVOT[1]} r={9} fill={SH.club2} stroke={INK} strokeWidth={5} />
      </g>
    </W>
  );
};

// ---------- underwater world ----------
const Backdrop: React.FC<{t: number}> = ({t}) => (
  <W>
    <defs>
      <linearGradient id="mWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={W_TOP} /><stop offset="1" stopColor={W_BOT} /></linearGradient>
    </defs>
    <rect x={-6000} y={-5000} width={14000} height={9000} fill="url(#mWater)" />
  </W>
);
const Rays: React.FC<{t: number}> = ({t}) => (
  <W>{[-900, -300, 400, 1100, 1800, 2500].map((x, i) => {
    const sw = 60 * Math.sin(t * 0.6 + i * 1.7);
    return <path key={i} d={`M ${x - 60} -2600 L ${x + 80} -2600 L ${x + 380 + sw} 600 L ${x + 120 + sw} 600 Z`} fill="#FFFFFF" opacity={0.13} />;
  })}</W>
);
const Reef: React.FC<{t: number}> = ({t}) => (
  <W>
    <path d="M -4000 60 Q -3000 -180 -1800 -90 Q -900 -260 0 -110 Q 900 -240 1900 -120 Q 2900 -260 5000 60 Z" fill="#6FAFC4" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[[-1500, -150, 1], [-400, -170, 0.8], [700, -160, 1.1], [1900, -150, 0.9], [3000, -160, 1]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x} ${y}) scale(${s})`}>
        {/* coral fans */}
        <path d="M 0 0 Q -10 -120 -80 -200 M 0 -60 Q 40 -140 90 -190 M -4 -110 Q 20 -200 10 -260" stroke="#F08A7E" strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d="M 0 0 Q -10 -120 -80 -200 M 0 -60 Q 40 -140 90 -190 M -4 -110 Q 20 -200 10 -260" stroke="#F8B0A3" strokeWidth={10} fill="none" strokeLinecap="round" />
      </g>))}
  </W>
);
const Weed: React.FC<{t: number; x: number; h: number; seed: number}> = ({t, x, h, seed}) => {
  const sw = 18 * Math.sin(t * 1.6 + seed);
  const d = `M ${x} 6 Q ${x - 20 + sw * 0.4} ${-h * 0.35} ${x + sw * 0.7} ${-h * 0.6} Q ${x + 24 + sw} ${-h * 0.85} ${x + sw * 1.2} ${-h}`;
  return <g><path d={d} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" /><path d={d} stroke="#5DBB63" strokeWidth={18} fill="none" strokeLinecap="round" /></g>;
};
const Floor: React.FC<{t: number}> = ({t}) => (
  <W>
    {[-520, -380, 640, 980, 1820, 1990].map((x, i) => <Weed key={i} t={t} x={x} h={180 + 90 * rnd(i * 3)} seed={i} />)}
    <path d="M -5000 0 Q -2500 -14 0 0 Q 2500 14 6000 0 L 6000 3000 L -5000 3000 Z" fill={SAND} />
    <path d="M -5000 0 Q -2500 -14 0 0 Q 2500 14 6000 0" stroke={INK} strokeWidth={8} fill="none" />
    {Array.from({length: 70}, (_, i) => <ellipse key={i} cx={-1800 + rnd(i * 3) * 4400} cy={30 + rnd(i * 7) * 600} rx={10} ry={4} fill={SAND2} />)}
    {/* the guy's rock (a shell sits on top of it) */}
    <path d="M 120 6 L 132 -150 Q 180 -164 230 -150 L 246 6 Z" fill="#9AA7B3" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M 200 -140 L 214 0" stroke="#7F8C98" strokeWidth={10} strokeLinecap="round" />
    {/* starfish */}
    <g transform={`translate(-300 40) rotate(${10 + 3 * Math.sin(t)})`}>
      <path d="M 0 -34 L 10 -10 L 34 -8 L 14 8 L 22 32 L 0 18 L -22 32 L -14 8 L -34 -8 L -10 -10 Z" fill="#FF9F6B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    </g>
  </W>
);

// ---------- motion ----------
/** the guy's punch offset (x) around each impact: wind back, snap forward, recoil */
const punchX = (t: number, hits: number[]) => {
  let v = 0;
  for (const h of hits) {
    if (t >= h - 0.36 && t < h - 0.05) v = -22 * eio(seg(t, h - 0.36, h - 0.12));
    else if (t >= h - 0.05 && t < h) v = lerp(-22, 8, seg(t, h - 0.05, h));
    else if (t >= h && t < h + 0.6) v = 8 * (1 - eout(seg(t, h, h + 0.6))) + spring(t, h, 3, 4, 7);
  }
  return v;
};
/** the shrimp's arm angle: folded 60, cock back 40, strike to 170 in 2 frames, hold, fold back */
const armAngle = (t: number, hits: number[]) => {
  let a = 20;
  for (const h of hits) {
    if (t >= h - 0.25 && t < h - 0.034) a = lerp(20, -8, eout(seg(t, h - 0.25, h - 0.08)));
    else if (t >= h - 0.034 && t < h) a = lerp(-8, 170, seg(t, h - 0.034, h));
    else if (t >= h && t < h + 0.7) a = t < h + 0.3 ? 170 + spring(t, h, -4, 5, 8) : lerp(170, 20, eio(seg(t, h + 0.3, h + 0.7)));
  }
  return a;
};

// layout
const GX = 0;                       // guy feet
const FIST = {dx: 112, dy: -176};   // pointing hand of point_right, relative to the feet (covered by a code fist)
const GSHELL = {x: 180, y: -186, r: 34};
const SX = 1500, SS = 1.3;          // shrimp
const SSHELL = {x: SX - 146 * SS, y: -26 * SS, r: 22 * SS};

const Fist: React.FC<{x: number; y: number; t: number; cracked: number}> = ({x, y, t, cracked}) => (
  <W><g transform={`translate(${x} ${y})`}>
    <path d="M -24 -22 Q 4 -30 22 -20 Q 34 -8 30 10 Q 24 26 2 26 Q -20 26 -26 12 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 24 -12 Q 14 -10 14 -2 M 26 4 Q 16 6 14 12" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    <path d="M -6 -6 Q 6 -10 14 -2" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    {cracked > 0.01 ? <g opacity={1}>
      <path d={`M 28 -16 L 18 -6 L 24 2 L 14 10`} stroke={RED} strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" style={pen(cracked)} />
      <path d={`M 10 -24 L 6 -12 L 12 -8`} stroke={RED} strokeWidth={4} fill="none" strokeLinejoin="round" strokeLinecap="round" style={pen(cracked)} />
    </g> : null}
  </g></W>
);

// ---------- the spiral-layers card (screen space) ----------
const LayersCard: React.FC<{t: number}> = ({t}) => {
  const s = popIn(t, 16.15, 0.4) * (1 - eio(seg(t, 18.55, 18.8)));
  if (s < 0.01) return null;
  const N = 7, cx = 380, top = 130, dy = 60, rx = 230, ry = 54;
  // the crack: comes down from the top, twists sideways at every layer, stops halfway down
  const cu = seg(t, T.stop - 0.25, T.cracks + 0.1);
  const cpts: [number, number][] = [[cx + 40, top - 70]];
  for (let i = 0; i < 4; i++) { const yy = top + i * dy; cpts.push([cx + 40 - i * 34, yy - 8], [cx + 40 - i * 34 - 30, yy + 14]); }
  const crackD = 'M ' + cpts.map((p) => p.join(' ')).join(' L ');
  const stopS = popIn(t, T.cracks, 0.3);
  return (
    <div style={{position: 'absolute', left: 540, top: 1180, width: 760, height: 690, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`,
      background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 44, boxShadow: `0 12px 0 ${INK}`}}>
      <svg width={760} height={690} viewBox="0 0 760 690" style={{position: 'absolute', left: -9, top: -9}}>
        <text x={380} y={84} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={INK} letterSpacing={-1}>INSIDE THE CLUB</text>
        {Array.from({length: N}, (_, k) => {
          const i = N - 1 - k;                           // draw bottom layers first
          const ls = popIn(t, T.spiral + i * 0.09, 0.3);
          if (ls < 0.01) return null;
          const cy = top + 120 + i * dy, ang = i * 26 + 10 * Math.sin(t * 1.2);
          return <g key={i} transform={`translate(${cx} ${cy}) scale(${ls})`}>
            <clipPath id={`lay${i}`}><ellipse cx={0} cy={0} rx={rx} ry={ry} /></clipPath>
            <ellipse cx={0} cy={10} rx={rx} ry={ry} fill="#C93E5C" stroke={INK} strokeWidth={6} />
            <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={i % 2 ? '#F7A3B4' : '#F58BA0'} />
            <g clipPath={`url(#lay${i})`}>
              <g transform={`scale(1 ${ry / rx}) rotate(${ang})`}>
                {Array.from({length: 13}, (_, j) => <line key={j} x1={-260} y1={-240 + j * 40} x2={260} y2={-240 + j * 40} stroke="#B8324F" strokeWidth={9} strokeLinecap="round" />)}
              </g>
            </g>
            <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={6} />
          </g>;
        })}
        {/* the crack */}
        {cu > 0 ? <g transform={`translate(0 ${120})`}>
          <path d={crackD} stroke={INK} strokeWidth={24} fill="none" strokeLinejoin="round" strokeLinecap="round" style={pen(cu)} />
          <path d={crackD} stroke="#FFE066" strokeWidth={11} fill="none" strokeLinejoin="round" strokeLinecap="round" style={pen(cu)} />
        </g> : null}
        {stopS > 0.01 ? <g transform={`translate(${cx - 150} ${top + 120 + 3 * dy + 40}) rotate(-8) scale(${stopS})`}>
          <rect x={-120} y={-44} width={240} height={88} rx={22} fill={RED} stroke={INK} strokeWidth={8} />
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={62} fill="#fff" letterSpacing={-1}>STOP</text>
        </g> : null}
      </svg>
    </div>
  );
};

// ---------- "faster than a blink": an eye doodle that only starts closing when the hit is already done ----------
const BlinkEye: React.FC<{t: number}> = ({t}) => {
  const s = popIn(t, T.faster, 0.3) * (1 - eio(seg(t, 8.15, 8.35)));
  if (s < 0.01) return null;
  const lid = eio(seg(t, SHRIMP_HITS[1] + 0.02, SHRIMP_HITS[1] + 0.32)) * (1 - eio(seg(t, SHRIMP_HITS[1] + 0.42, SHRIMP_HITS[1] + 0.6)));
  return (
    <div style={{position: 'absolute', left: 790, top: 560, transform: `translate(-50%,-50%) rotate(4deg) scale(${s})`}}>
      <svg width={300} height={230} viewBox="-150 -115 300 230" style={{overflow: 'visible'}}>
        <rect x={-140} y={-105} width={280} height={210} rx={36} fill="#fff" stroke={INK} strokeWidth={8} />
        <clipPath id="beye"><path d="M -100 0 Q 0 -80 100 0 Q 0 80 -100 0 Z" /></clipPath>
        <path d="M -100 0 Q 0 -80 100 0 Q 0 80 -100 0 Z" fill="#fff" />
        <circle cx={0} cy={0} r={30} fill="#3D7FD1" clipPath="url(#beye)" /><circle cx={0} cy={0} r={15} fill={INK} /><circle cx={-8} cy={-8} r={6} fill="#fff" />
        <rect x={-110} y={-60} width={220} height={120 * lid} fill="#F1E2CF" clipPath="url(#beye)" />
        <path d={`M -100 0 Q 0 ${-80 + 160 * lid} 100 0`} stroke={INK} strokeWidth={7} fill="none" />
        <path d="M -100 0 Q 0 -80 100 0 Q 0 80 -100 0 Z" fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <text x={0} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>YOUR BLINK</text>
      </svg>
    </div>
  );
};

// the whole picture as a function of time, so LoopOut can draw the opening shot (t = 0) at the end
export const MantisScene: React.FC<{t: number; thumb?: boolean}> = ({t, thumb}) => {
  const cam = camAt([
    {t: 0, x: 70, y: -180, k: 2.95}, {t: 3.95, x: 70, y: -180, k: 3.1},
    {t: 4.85, x: 1390, y: -86, k: 2.25}, {t: 8.15, x: 1390, y: -86, k: 2.35},
    {t: 8.75, x: SSHELL.x + 55, y: -75, k: 3.7}, {t: S4 - 0.001, x: SSHELL.x + 55, y: -75, k: 3.8},
    {t: S4, x: 70, y: -180, k: 3.15}, {t: S5 - 0.001, x: 70, y: -180, k: 3.3},
    {t: S5, x: 1420, y: 30, k: 3.3}, {t: 18.6, x: 1420, y: 20, k: 3.45},
    {t: 19.3, x: 1390, y: -86, k: 2.35}, {t: DURATION, x: 1390, y: -86, k: 2.4},
  ], t);

  // --- the guy: punching (point_right + a code fist), then scared after his knuckles crack ---
  const hits = t < S4 ? GUY_HITS : [KNUCKLE_HIT];
  const px = punchX(t, hits);
  const scaredAt = KNUCKLE_HIT + 0.42;
  const g = t >= S4 ? swap(t, scaredAt, 'point_right', 'scared') : {pose: 'point_right' as const, sx: 1, sy: 1};
  const gx = GX + px, lean = px * 0.12;
  const fistX = gx + FIST.dx, fistY = FIST.dy;
  const cracked = t >= S4 ? seg(t, KNUCKLE_HIT, KNUCKLE_HIT + 0.18) : 0;
  const ouch = t >= KNUCKLE_HIT && t < S5;

  // guy's shell: hit by each punch
  const lastG = [...hits].reverse().find((h) => t >= h);
  const gsq = 1 + (lastG !== undefined ? spring(t, lastG, -0.16, 3, 7) : 0);
  const gFace: Face = {...FACE0, mouth: 'o', squeeze: 0, lx: -1, brow: -8, sweat: 0.8};
  if (lastG !== undefined && t - lastG < 0.45 && t < S4) { gFace.squeeze = 1; gFace.mouth = 'grit'; }
  if (t >= S4) { gFace.sweat = 0; gFace.brow = -6; gFace.mouth = 'smile'; gFace.lid = 0.45; gFace.lx = -1; if (t > KNUCKLE_HIT) { gFace.mouth = 'grin'; gFace.lid = 0.5; } }
  const gCracks = t < S4 ? 1 + GUY_HITS.filter((h) => t >= h && h > 0).length : 0;

  // --- the shrimp ---
  const slow = t >= 8.15 && t < S4;               // slow-motion close-up
  let arm = armAngle(t, SHRIMP_HITS);
  if (slow) {
    arm = t < 8.3 ? 20 : t < T.keep ? lerp(20, 170, eio(seg(t, 8.3, T.keep))) : t < T.bubbles - 0.2 ? 170 : lerp(170, 150, eout(seg(t, T.bubbles - 0.2, T.bubbles + 0.3)));
    if (t > T.burst) arm = lerp(150, 168, eout(seg(t, T.burst, T.burst + 0.1)));
  }
  if (t >= S5 && t < 19.2) arm = 20;
  const sHits = [...SHRIMP_HITS.filter((h) => h < 8), ...(t >= T.keep ? [T.keep] : []), ...(t >= T.burst ? [T.burst] : []), ...SHRIMP_HITS.filter((h) => h > 8)];
  const lastS = [...sHits].reverse().find((h) => t >= h);
  const ssq = 1 + (lastS !== undefined ? spring(t, lastS, -0.18, 3, 7) : 0);
  const sCracks = Math.min(4, sHits.filter((h) => t >= h).length);
  const sFace: Face = {...FACE0, mouth: 'flat', lx: 1, brow: -4};
  if (lastS !== undefined && t - lastS < 0.5) { sFace.squeeze = 1; sFace.mouth = 'grit'; }
  if (t > 4.2 && t < 5.0 - 0.25) { sFace.mouth = 'o'; sFace.sweat = 1; }
  const sBlink = t > 2 && (t % 3.3) < 0.12 ? 1 - Math.abs((t % 3.3) - 0.06) / 0.06 : 0;
  const [atx, aty] = armTip(arm);
  const clubX = SX + atx * SS, clubY = aty * SS;

  // slow-motion cavitation bubble between club and shell
  const gapX = (clubX + CLUB_R * SS + SSHELL.x - SSHELL.r) / 2 + 2;
  const bubR = slow ? (t < T.bubbles ? 0 : t < T.burst ? 19 * eout(seg(t, T.bubbles, T.burst - 0.15)) : 19 * (1 - seg(t, T.burst, T.burst + 0.07))) : 0;
  const flash = slow ? popIn(t, T.burst + 0.05, 0.18) * (1 - seg(t, T.burst + 0.3, T.burst + 0.55)) : 0;
  const ring = slow ? seg(t, T.burst + 0.05, T.burst + 0.5) : 0;

  const sh = shake(t, hit(t, 0, 10) + hit(t, GUY_HITS[1], 8) + hit(t, GUY_HITS[2], 14) + hit(t, SHRIMP_HITS[0], 9) + hit(t, SHRIMP_HITS[1], 9)
    + (slow ? hit(t, T.burst, 12) : 0) + hit(t, KNUCKLE_HIT, 14) + hit(t, SHRIMP_HITS[2], 9));
  const dof = t < 4.0 || (t >= S4 && t < S5) ? 2.6 : t >= 8.4 && t < S4 ? 3.4 : 1.6;

  return (
    <AbsoluteFill style={{background: W_BOT, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.012)`}}>
        <Layer cam={cam} z={3200} paper={false}><Backdrop t={t} /></Layer>
        <Layer cam={cam} z={2400} paper={false}><Rays t={t} /></Layer>
        <Layer cam={cam} z={2200} blur={dof}>
          <Reef t={t} />
          <Stream t={t} x={-700} y={-60} n={5} h={900} seed={11} sp={70} />
          <Stream t={t} x={2300} y={-60} n={5} h={900} seed={21} sp={80} />
        </Layer>
        <Layer cam={cam} z={1000}>
          <Floor t={t} />
          <Stream t={t} x={-200} y={-10} n={7} h={520} seed={3} />
          <Stream t={t} x={1700} y={-10} n={6} h={520} seed={7} />
          {/* the guy */}
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${gx}px 0px`, transform: `rotate(${lean}deg)`}}>
            <Guy pose={g.pose} x={gx} y={0} t={t} sx={g.sx} sy={g.sy} tremble={ouch && t > scaredAt ? 1 : 0} />
            {g.pose === 'point_right' ? <Fist x={fistX} y={fistY} t={t} cracked={cracked} /> : null}
            {/* speed lines behind the fist on each punch */}
            {hits.map((h, i) => {
              const v = seg(t, h - 0.06, h + 0.18); if (v <= 0 || v >= 1 || g.pose !== 'point_right') return null;
              return <W key={i}>{[-16, 0, 16].map((o, j) => <line key={j} x1={fistX - 40 - 90 * (1 - v)} y1={fistY + o} x2={fistX - 34} y2={fistY + o}
                stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={1 - v} />)}</W>;
            })}
          </div>
          <Shell x={GSHELL.x} y={GSHELL.y} r={GSHELL.r} t={t} f={gFace} cracks={gCracks} sq={gsq} seed={2} />
          {/* boiling water around his fist: cavitation bubbles on every fast punch */}
          {GUY_HITS.map((h, i) => <Burst key={i} t={t} t0={h} x={fistX + 24} y={fistY} n={i === 2 ? 44 : 30} seed={10 + i * 17} power={i === 2 ? 1.4 : 1.15} />)}
          <Burst t={t} t0={GUY_HITS[0] - 0.45} x={GX + FIST.dx + 30} y={FIST.dy} n={34} seed={99} power={1.3} />
          <Burst t={t} t0={GUY_HITS[0] - 0.2} x={GX + FIST.dx + 26} y={FIST.dy + 10} n={20} seed={123} power={1.1} />
          {t < S4 ? <Burst t={t} t0={T.fist} x={fistX + 10} y={fistY} n={14} seed={77} power={0.8} /> : null}
          <Burst t={t} t0={KNUCKLE_HIT} x={GX + FIST.dx + 32} y={FIST.dy} n={22} seed={55} />
          {/* ouch: stars and sweat after the knuckles crack */}
          {ouch ? [0, 1, 2].map((i) => {
            const a = t * 5 + (i * Math.PI * 2) / 3;
            return <Star key={i} x={GX + 4 + 70 * Math.cos(a)} y={-330 + 18 * Math.sin(a)} s={0.9 * popIn(t, scaredAt + i * 0.06, 0.25)} rot={t * 120} />;
          }) : null}
          {ouch ? <Sweat x={GX + 70} y={-300 + 20 * seg(t, scaredAt, scaredAt + 1.2)} s={popIn(t, scaredAt + 0.2, 0.25)} /> : null}
          <Txt x={GX + 120} y={-300} s={pulse(t, KNUCKLE_HIT + 0.05, 0.9)} text="CRACK" size={46} rot={-8} fill={RED} />

          {/* the shrimp and its snail */}
          <Shrimp x={SX} y={0} s={SS} t={t} arm={arm} look={-1} blink={sBlink} wound={0} />
          <Shell x={SSHELL.x} y={SSHELL.y} r={SSHELL.r} t={t} f={sFace} cracks={sCracks} sq={ssq} seed={5} tone="#F3D08C" />
          {SHRIMP_HITS.map((h, i) => <Burst key={i} t={t} t0={h} x={SSHELL.x - SSHELL.r - 4} y={SSHELL.y} n={18} seed={40 + i * 13} power={0.7} dir={-1} />)}
          {SHRIMP_HITS.map((h, i) => {
            const v = seg(t, h - 0.05, h + 0.16); if (v <= 0 || v >= 1) return null;
            return <W key={'sl' + i}>{[0, 1, 2].map((j) => <path key={j} d={`M ${SX - 40 + j * 14} ${-90 + j * 22} Q ${SX - 110} ${-60 + j * 18} ${clubX + 26} ${clubY - 20 + j * 16}`}
              stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" opacity={1 - v} />)}</W>;
          })}
          {/* slow motion: the bubble that forms in the gap, then bursts (the second hit) */}
          {slow && bubR > 0.3 ? <W><circle cx={gapX} cy={clubY} r={bubR} fill="#E6F8FF" stroke={INK} strokeWidth={2.5} />
            <circle cx={gapX - bubR * 0.35} cy={clubY - bubR * 0.35} r={bubR * 0.25} fill="#fff" /></W> : null}
          {slow && flash > 0.01 ? <W><g transform={`translate(${gapX} ${clubY}) scale(${flash})`}>
            <path d="M 0 -26 L 6 -8 L 24 -12 L 10 2 L 20 18 L 2 10 L -8 26 L -8 8 L -26 6 L -12 -4 L -20 -20 L -4 -10 Z" fill="#FFE066" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          </g></W> : null}
          {slow && ring > 0 && ring < 1 ? <W><circle cx={gapX} cy={clubY} r={6 + 40 * eout(ring)} fill="none" stroke="#FFFFFF" strokeWidth={4 * (1 - ring)} /></W> : null}
          {slow ? <Txt x={SSHELL.x - 4} y={SSHELL.y - 46} s={pulse(t, T.keep, 2.0)} text="HIT 1" size={26} rot={-6} fill={GOLD} /> : null}
          {slow ? <Txt x={gapX + 4} y={SSHELL.y - 46} s={pulse(t, T.second - 0.05, 0.5)} text="HIT 2" size={28} rot={5} fill={GOLD} /> : null}
          {slow ? <Txt x={gapX} y={clubY + 42} s={pulse(t, T.bubbles, 1.1) * (t < T.burst ? 1 : 0)} text="BUBBLE" size={16} fill="#FFFFFF" /> : null}
          {/* slow-motion tag */}
          {slow ? <Txt x={SSHELL.x + 30} y={-200} s={pulse(t, 8.6, 3.3)} text="SLOW MOTION" size={20} fill="#FFFFFF" /> : null}
        </Layer>
      </AbsoluteFill>
      {!thumb ? <>
        <Badge text="80 KM/H" s={pulse(t, T.eighty - 0.05, 1.45)} y={540} color={RED} />
        <BlinkEye t={t} />
        <LayersCard t={t} />
        <HookTitle t={t} text="HIS PUNCH BOILS WATER" hi="BOILS" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={19.0} until={20.5} text="Which animal power is next?" />
      </> : null}
    </AbsoluteFill>
  );
};

export const MantisVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    // frame 0: the punch lands - a real hit on frame 0
    {f: 'crack.wav', at: 0, db: -13, from: 0.3}, {f: 'bubbles.wav', at: 0, db: -16}, {f: 'splash.wav', at: 0, db: -20},
    {f: 'whoosh.wav', at: GUY_HITS[1] - 0.3, db: -27}, {f: 'crack.wav', at: GUY_HITS[1], db: -18, from: 0.3}, {f: 'bubbles.wav', at: GUY_HITS[1], db: -19},
    {f: 'whoosh.wav', at: GUY_HITS[2] - 0.3, db: -26}, {f: 'crack.wav', at: GUY_HITS[2], db: -15, from: 0.3}, {f: 'bubbles.wav', at: GUY_HITS[2], db: -16},
    {f: 'hiss.wav', at: GUY_HITS[2] + 0.05, db: -30},
    {f: 'whoosh.wav', at: 4.0, db: -29},
    {f: 'crack.wav', at: SHRIMP_HITS[0], db: -16, from: 0.3}, {f: 'bubbles.wav', at: SHRIMP_HITS[0], db: -21},
    {f: 'pop.wav', at: T.eighty, db: -20},
    {f: 'pop.wav', at: T.faster, db: -24}, {f: 'crack.wav', at: SHRIMP_HITS[1], db: -16, from: 0.3}, {f: 'bubbles.wav', at: SHRIMP_HITS[1], db: -21},
    {f: 'whoosh.wav', at: 8.25, db: -28},
    {f: 'crack.wav', at: T.keep, db: -19, from: 0.3}, {f: 'bubbles.wav', at: T.bubbles, db: -22},
    {f: 'pop.wav', at: T.burst, db: -13}, {f: 'zap.wav', at: T.burst, db: -27}, {f: 'pop.wav', at: T.second - 0.05, db: -22},
    {f: 'whoosh.wav', at: KNUCKLE_HIT - 0.3, db: -26}, {f: 'crack.wav', at: KNUCKLE_HIT, db: -12, from: 0.3}, {f: 'bubbles.wav', at: KNUCKLE_HIT, db: -20},
    {f: 'twang.mp3', at: KNUCKLE_HIT + 0.42, db: -22},
    {f: 'pop.wav', at: 16.15, db: -24},
    ...Array.from({length: 7}, (_, i) => ({f: 'pop.wav', at: T.spiral + i * 0.09, db: -31})),
    {f: 'crack.wav', at: T.stop - 0.25, db: -24}, {f: 'ding.mp3', at: T.cracks, db: -22},
    {f: 'whoosh.wav', at: 18.6, db: -29},
    {f: 'crack.wav', at: SHRIMP_HITS[2], db: -16, from: 0.3}, {f: 'bubbles.wav', at: SHRIMP_HITS[2], db: -21},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26}, // the loop push back to the opening shot
  ];
  return (
    <AbsoluteFill style={{background: W_BOT, overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<MantisScene t={0} />}>
        <MantisScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="mantis/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const MantisWide: React.FC = () => <WideFit.Provider value={0.72}><MantisVideo /></WideFit.Provider>;
