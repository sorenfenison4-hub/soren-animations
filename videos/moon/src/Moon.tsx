// "Why is the Moon drifting away from Earth?" - the guy stands on a little Earth, the Moon (with a face) pulls the
// oceans into a bulge, Earth spins him around, the bulge runs ahead and tugs the Moon forward, it slings farther out,
// about as fast as a fingernail grows. Everything is drawn in code (no new pictures).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, Sky, Guy, swap, Ball, ObjectFace, FACE0, Face, Star, Arrow, Badge, W, pen,
  SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle, AskBanner, Pose} from './lib/kit';

// voice at 0.1 s, ends 18.86 s; + ~0.8 s so the loop push starts after the last word
export const DURATION = 19.7;
// beats from the voice's pauses (video time)
export const T = {leaving: 0.8, four: 2.1, so: 4.1, gravity: 5.3, bulge: 6.0, bulgeWord: 7.6, spins: 8.7, spinEnd: 11.2,
  slow: 10.1, runs: 11.9, tugs: 13.3, cta: 14.62, slings: 15.15, out: 15.8, cam2: 17.15, nails: 17.75, grow: 18.3};

export const R = 520;          // solid Earth radius (world units)
const SEA = 556;               // ocean radius before the bulge
export const MR = 150;         // Moon radius
export const LAND = '#B5D98E', LAND2 = '#97C474', SEA_C = '#8FD0F5', MOON_C = '#CFCAC1', MOON_S = '#B8B1A6';

const deg = Math.PI / 180;
export const moonAngle = (t: number) => 68 + 1.1 * t + 8 * eout(seg(t, T.tugs, T.tugs + 0.7)) + 6 * seg(t, T.slings, T.slings + 1.5);
const moonDist = (t: number) => 1300 + 120 * eout(seg(t, T.slings, T.slings + 1.3));
const spinAt = (t: number) => -360 * eio(seg(t, T.spins, T.spinEnd));

const moonFace = (t: number): Face => {
  const blink = [3.0, 9.9, 17.0].some((b) => t > b && t < b + 0.12) ? 1 : 0;
  let f: Face = {...FACE0, lx: -0.6, ly: 0.55, mouth: 'flat', brow: -8};                          // "sorry, I'm leaving"
  if (t > T.gravity) f = {...FACE0, lx: -0.7, ly: 0.45, mouth: 'grit', brow: 10};                  // pulling the oceans
  if (t > T.bulgeWord + 0.4) f = {...FACE0, lx: -0.7, ly: 0.5, mouth: 'smile', brow: -4, lid: 0.35}; // proud of the bulge
  if (t > T.spins) f = {...FACE0, lx: -0.7 + 0.5 * Math.sin((t - T.spins) * 5), ly: 0.6, mouth: 'o', brow: -10};
  if (t > T.tugs) f = {...FACE0, open: 1 + spring(t, T.tugs, 0.25, 3, 6), lx: -0.4, ly: 0.6, mouth: 'o', brow: -14};
  if (t > T.slings) f = {...FACE0, squeeze: 1, mouth: 'grin', brow: -6};                           // wheee
  if (t > T.out + 0.6) f = {...FACE0, lx: -0.6, ly: 0.6, mouth: 'smile', brow: -6};
  return {...f, lid: Math.max(f.lid, blink)};
};

const guyPose = (t: number) => {
  let g = swap(t, T.leaving, 'lookup', 'point_right');
  const steps: [number, Pose, Pose][] = [[T.so, 'point_right', 'front_calm'], [T.gravity + 0.4, 'front_calm', 'lookup'],
    [T.spins, 'lookup', 'scared'], [T.spinEnd + 0.1, 'scared', 'front_worried'], [T.tugs, 'front_worried', 'surprised'],
    [T.slings + 0.2, 'surprised', 'front_wave'], [T.nails, 'front_wave', 'present']];
  for (const [at, a, b] of steps) if (t >= at - 0.12) g = swap(t, at, a, b);
  return g;
};

/** a self-drawing curved arrow along a circle around (0,0): from angle a0 to a1 (degrees, counterclockwise) */
const ArcArrow: React.FC<{r: number; a0: number; a1: number; p: number; color?: string; w?: number}> = ({r, a0, a1, p, color = INK, w = 14}) => {
  if (p <= 0.002) return null;
  const P = (a: number) => [r * Math.cos(a * deg), -r * Math.sin(a * deg)];
  const [x0, y0] = P(a0), [x1, y1] = P(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0, sweep = a1 > a0 ? 0 : 1;
  const ae = lerp(a0, a1, p), [hx, hy] = P(ae);
  const dir = Math.sign(a1 - a0), tx = -Math.sin(ae * deg) * dir, ty = -Math.cos(ae * deg) * dir; // tangent (screen)
  const nx = -ty, ny = tx, L = 54;
  return <W>
    <path d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} ${sweep} ${x1} ${y1}`} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" {...pen(p)} />
    {p > 0.15 ? <path d={`M ${hx - L * tx + 0.7 * L * nx} ${hy - L * ty + 0.7 * L * ny} L ${hx + 0.25 * L * tx} ${hy + 0.25 * L * ty} L ${hx - L * tx - 0.7 * L * nx} ${hy - L * ty - 0.7 * L * ny}`}
      stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
  </W>;
};
const Label: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number}> = ({x, y, s, text, size = 92, rot = 0}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={INK} letterSpacing={-1}>{text}</text></W>) : null;

/** the solid Earth (rotates with spin) + the ocean shell (stretched into a bulge along `axis`) */
export const Earth: React.FC<{t: number; spin: number; bulge: number; axis: number; pose?: {pose: Pose; sx: number; sy: number}; tremble?: number}> =
  ({t, spin, bulge, axis, pose, tremble = 0}) => {
    const a = SEA + 140 * bulge, b = SEA - 8 * bulge;
    return <>
      <W>
        <ellipse cx={0} cy={0} rx={a} ry={b} transform={`rotate(${-axis})`} fill={SEA_C} stroke={INK} strokeWidth={10} />
        {[0.82, 0.9].map((q, i) => <ellipse key={i} cx={0} cy={0} rx={a * q + 30} ry={b * q + 30} transform={`rotate(${-axis})`} fill="none"
          stroke="#fff" strokeOpacity={0.7} strokeWidth={6} strokeDasharray={`${60 + i * 30} ${180 + i * 50}`} strokeDashoffset={-t * 60} />)}
      </W>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `rotate(${spin}deg)`}}>
        <W>
          <circle cx={0} cy={0} r={R} fill={LAND} stroke={INK} strokeWidth={10} />
          <path d="M -300 -260 Q -180 -360 -60 -300 Q 40 -250 -40 -170 Q -150 -120 -250 -160 Q -340 -200 -300 -260 Z" fill={LAND2} />
          <path d="M 120 60 Q 260 0 340 90 Q 380 200 270 250 Q 150 280 110 190 Q 80 120 120 60 Z" fill={LAND2} />
          <path d="M -330 140 Q -240 100 -190 170 Q -170 250 -260 280 Q -350 270 -330 140 Z" fill="#D8C48E" />
          <path d="M 60 -380 Q 160 -420 230 -350 Q 230 -290 150 -290 Q 70 -300 60 -380 Z" fill="#D8C48E" />
        </W>
        {pose ? <>
          <div style={{position: 'absolute', left: -60, top: -R - 13, width: 120, height: 26, borderRadius: '50%', background: 'rgba(72,54,42,0.26)', filter: 'blur(3px)'}} />
          <Guy pose={pose.pose} x={0} y={-R + 4} t={t} sx={pose.sx} sy={pose.sy} tremble={tremble} />
        </> : null}
      </div>
    </>;
  };

export const Moon: React.FC<{x: number; y: number; t: number; f: Face; s?: number}> = ({x, y, t, f, s = 1}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${x}px ${y}px`, transform: `scale(${s})`}}>
    <Ball x={x} y={y} r={MR} fill={MOON_C} shade={MOON_S} wobble={0.05} seed={21} />
    <W>{[[-95, -70, 26], [92, -60, 20], [-70, 85, 18], [100, 70, 24], [10, -112, 14]].map(([dx, dy, r], i) =>
      <circle key={i} cx={x + dx} cy={y + dy} r={r} fill={MOON_S} stroke={INK} strokeWidth={5} />)}</W>
    <ObjectFace x={x} y={y + 6} r={MR * 0.92} f={f} t={t} lidColor={MOON_C} />
  </div>
);

/** a finger seen from the back, the nail's white tip growing by g (0..1); centre (x, y), world units */
export const Finger: React.FC<{x: number; y: number; s: number; g: number}> = ({x, y, s, g}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-90} y={-250} width={180} height={560} rx={90} fill="#F6D2B3" stroke={INK} strokeWidth={10} />
    <path d="M -50 40 Q 0 58 50 40 M -44 70 Q 0 86 44 70" stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />
    <path d={`M -58 -150 Q -58 ${-214 - 34 * g} 0 ${-222 - 40 * g} Q 58 ${-214 - 34 * g} 58 -150 Z`} fill="#FFFDF6" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <rect x={-58} y={-190} width={116} height={170} rx={40} fill="#F9C7CF" stroke={INK} strokeWidth={7} />
    <path d="M -40 -150 Q 0 -165 40 -150" stroke="#fff" strokeWidth={8} fill="none" strokeLinecap="round" />
  </g></W>) : null;

const STARS: [number, number, number][] = [[-900, -1500, 1], [700, -1800, 0.8], [-520, -2100, 0.7], [1150, -700, 0.9], [-1250, -300, 0.8],
  [-1050, 700, 1], [1000, 900, 0.7], [-300, 1500, 0.8], [800, 1600, 1], [-1300, -1100, 0.6], [300, -2300, 0.9], [1300, 300, 0.6]];

export const MoonScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([
    {t: 0, x: 200, y: -800, k: 0.9}, {t: T.so, x: 215, y: -830, k: 0.87},
    {t: T.so + 1.4, x: 0, y: -280, k: 0.48}, {t: T.cam2, x: 0, y: -280, k: 0.48}, {t: T.cam2 + 0.8, x: 40, y: -840, k: 0.9},
  ], t);
  const th = moonAngle(t), D = moonDist(t);
  const mx = D * Math.cos(th * deg), my = -D * Math.sin(th * deg);
  const bulge = eio(seg(t, T.bulge, T.bulgeWord + 0.2));
  const lead = 25 * eio(seg(t, T.runs, T.runs + 0.9));
  const axis = th + lead;
  const g = guyPose(t);
  // pull lines (the Moon's gravity) from the Moon toward the near ocean
  const pull = seg(t, T.gravity, T.gravity + 0.5) * (1 - seg(t, T.spins - 0.4, T.spins));
  const ux = -Math.cos(th * deg), uy = Math.sin(th * deg);           // Moon -> Earth (screen)
  const tug = seg(t, T.tugs - 0.15, T.tugs + 0.35) * (1 - seg(t, T.slings + 0.3, T.slings + 0.6));
  const tipX = (SEA + 140) * Math.cos(axis * deg), tipY = -(SEA + 140) * Math.sin(axis * deg);
  const fwd = Math.atan2(-Math.cos(th * deg), -Math.sin(th * deg)) / deg - 90; // Arrow rotation along the orbit
  const arrowsOff = 1 - seg(t, T.slings - 0.2, T.slings + 0.1);
  const spinP = seg(t, T.spins + 0.1, T.spins + 0.8) * (1 - seg(t, T.slings - 0.3, T.slings));
  const slowP = seg(t, T.slow, T.slow + 0.6) * (1 - seg(t, T.slings - 0.3, T.slings));
  const orbit0 = seg(t, T.so + 1.0, T.so + 2.2), orbit1 = seg(t, T.out, T.out + 0.9);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <Layer cam={cam} z={2600}>
        {STARS.map(([x, y, s], i) => <Star key={i} x={x} y={y} s={s * (1 + 0.12 * Math.sin(t * 3 + i))} rot={i * 20} />)}
      </Layer>
      <Layer cam={cam} z={1000}>
        {/* orbit doodles: the old orbit, then the new one after the sling */}
        <W>
          <circle cx={0} cy={0} r={1300} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="22 26" strokeOpacity={0.55}
            transform="rotate(-160)" {...(orbit0 > 0 ? {} : {visibility: 'hidden'})} style={{opacity: orbit0}} />
          {orbit1 > 0 ? <circle cx={0} cy={0} r={1420} fill="none" stroke="#E5534B" strokeWidth={7} strokeDasharray="22 26" style={{opacity: orbit1}} /> : null}
        </W>
        <Earth t={t} spin={spinAt(t)} bulge={bulge} axis={axis} pose={g} tremble={t > T.spins && t < T.spinEnd ? 1 : 0} />
        <Label x={-SEA - 90 - 120 * bulge} y={150} s={popIn(t, T.bulgeWord) * (1 - seg(t, T.spins - 0.3, T.spins))} text="BULGE" rot={-8}
          size={130} />
        {/* gravity: dashed pull lines from the Moon to the ocean */}
        {pull > 0 ? <W>{[-80, 0, 80].map((o, i) => {
          const px = -uy * o, py = ux * o;                       // sideways offset
          const x0 = mx + ux * (MR + 30) + px, y0 = my + uy * (MR + 30) + py;
          const len = (D - MR - 30 - 760) * pull;
          const x1 = x0 + ux * len, y1 = y0 + uy * len;
          return <g key={i}>
            <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="#E5534B" strokeWidth={14} strokeLinecap="round" strokeDasharray="30 30" strokeDashoffset={t * 120} />
            <path d={`M ${x1 + ux * 30 - uy * 34} ${y1 + uy * 30 + ux * 34} L ${x1 + ux * 60} ${y1 + uy * 60} L ${x1 + ux * 30 + uy * 34} ${y1 + uy * 30 - ux * 34}`}
              stroke="#E5534B" strokeWidth={14} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>;
        })}</W> : null}
        {/* Earth spins fast, the Moon goes around slowly */}
        <ArcArrow r={760} a0={205} a1={335} p={spinP} w={18} />
        <Label x={0} y={860} s={popIn(t, T.spins + 0.6) * (1 - seg(t, T.slings - 0.3, T.slings))} text="FAST" size={130} />
        <ArcArrow r={D} a0={th + 14} a1={th + 34} p={slowP} w={18} />
        <Label x={(D + 210) * Math.cos((th + 26) * deg)} y={-(D + 210) * Math.sin((th + 26) * deg)}
          s={popIn(t, T.slow + 0.4) * (1 - seg(t, T.slings - 0.3, T.slings))} text="SLOW" size={130} rot={-(th + 26 - 90)} />
        {/* the bulge tugs the Moon forward */}
        {tug > 0 ? <W>
          <path d={`M ${tipX} ${tipY} L ${mx} ${my}`} stroke="#E5534B" strokeWidth={14} strokeLinecap="round" strokeDasharray="30 30"
            strokeDashoffset={-t * 120} {...pen(Math.min(1, tug * 1.4))} />
        </W> : null}
        <Moon x={mx} y={my} t={t} f={moonFace(t)} s={1 + spring(t, T.tugs, 0.06, 3, 6) + spring(t, T.slings, -0.08, 3, 6)} />
        <Arrow x={mx - Math.sin(th * deg) * (MR + 120)} y={my - Math.cos(th * deg) * (MR + 120)} s={1.8 * popIn(t, T.tugs + 0.1) * arrowsOff} rot={fwd} />
        {/* about as fast as your fingernails grow */}
        <Finger x={300} y={-790} s={0.55 * popIn(t, T.nails)} g={eio(seg(t, T.grow - 0.2, T.grow + 0.5))} />
        <Label x={290} y={-1130} s={popIn(t, T.grow)} text="SAME" size={80} rot={-6} />
        <Label x={290} y={-1050} s={popIn(t, T.grow + 0.08)} text="SPEED" size={80} rot={-6} />
      </Layer>
      <Badge text="4 CM A YEAR" s={popIn(t, T.four) * (1 - seg(t, T.so - 0.3, T.so - 0.05))} />
      <HookTitle t={t} text="THE MOON IS LEAVING US" hi="LEAVING" />
      <CallToAction t={t} at={T.cta} y={262} />
    </AbsoluteFill>
  );
};

export const MoonVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    {f: 'pop.wav', at: T.leaving, db: -24}, {f: 'pop.wav', at: T.four, db: -18},
    {f: 'whoosh.wav', at: T.so, db: -26},
    {f: 'strain.mp3', at: T.gravity, db: -28, to: 2.2}, {f: 'waves.wav', at: T.bulge, db: -29, to: 2.4},
    {f: 'pop.wav', at: T.bulgeWord, db: -22},
    {f: 'whir.mp3', at: T.spins, db: -27, to: 2.5}, {f: 'pop.wav', at: T.spins + 0.6, db: -26}, {f: 'pop.wav', at: T.slow + 0.4, db: -26},
    {f: 'twang.mp3', at: T.tugs, db: -21},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: T.slings, db: -22}, {f: 'giggle.mp3', at: T.slings + 0.15, db: -30, to: 1.0},
    {f: 'pop.wav', at: T.nails, db: -20}, {f: 'pop.wav', at: T.grow, db: -24},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{background: '#FBF7EC', overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<MoonScene t={0} />}>
        <MoonScene t={t} />
      </LoopOut>
      <AskBanner />
      <Look />
      <SoundLayer voice="moon/vo/take1.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const MoonWide: React.FC = () => <WideFit.Provider value={0.72}><MoonVideo /></WideFit.Provider>;
