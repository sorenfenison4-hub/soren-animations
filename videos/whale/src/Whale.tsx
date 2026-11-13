// "What if a whale swallowed you like Jonah?" - a what-if Short about YOU. Frame 0: a humpback lunging out of the sea
// with the guy standing in its open mouth, the jaws already closing on him. He gets stuck (a blue whale's throat is
// about as wide as a grapefruit); only a giant sperm whale (18 m) could fit you down; inside: no air, and the first of
// four stomachs squeezes. The twist: a real humpback grabbed a diver in 2021 and spat him back out - he flies out of
// the jaws, and the loop puts him right back in the mouth at frame 0. Every whale is drawn in code.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Pose, Sky, Sea, Star, Sweat, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd,
  shake, hit, swap, pen, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle, CommentAsk} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py; times below are video time). Last word ends ~21.5 s; + 0.8 s for the loop push.
export const DURATION = 22.3;
export const T = {
  get: 0.1, whale: 1.16, jonah: 1.76, stuck: 2.97, throat: 3.57,           // "Get swallowed by a whale like Jonah, and you'd get stuck in its throat."
  blue: 4.42, throat2: 5.1, wide: 6.04, grape: 6.57,                       // "A blue whale's throat is about as wide as a grapefruit."
  only: 7.44, sperm: 8.5, eighteen: 9.63, long: 10.46, fit: 11.14, down: 11.44, // "Only a giant sperm whale, eighteen meters long, could fit you down."
  inside: 12.04, noAir: 13.21, air: 13.4, first: 14.23, four: 14.84, squeeze: 15.67, // "Inside, there's no air, and the first of its four stomachs squeezes."
  y2021: 17.12, hump: 17.99, grab: 18.52, diver: 19.12,                    // "In twenty twenty-one, a humpback grabbed a diver..."
  spat: 20.01, out: 21.06,                                                 // "...and spat him right back out."
  cta: 12.25,
};
// shots (hard cuts just before each line)
const S2 = 4.08, S3 = 7.3, S4 = 11.9, S5 = 16.5;

const GOLD = '#FFD43B';
const WB = '#4F7FAE', WB2 = '#3F6A96', WBELLY = '#E8EDF1', MOUTH = '#B4485C', TONGUE = '#E58796';

const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));

// ---------- the humpback lunging up out of the sea (shots 1 and 5) ----------
// Jaws hinge at H; each jaw is drawn with its inner (mouth) edge on x = 0 and rotated open by `open` degrees.
const HY = -300, JAW = 900;
const UPPER = `M 0 40 L 0 ${-JAW} Q -30 ${-JAW - 60} -120 ${-JAW - 34} Q -230 -700 -268 -300 Q -282 -60 -232 40 Z`;
const LOWER = `M 0 40 L 0 ${-JAW + 20} Q 40 ${-JAW - 40} 130 ${-JAW - 10} Q 240 -680 276 -300 Q 290 -60 236 40 Z`;
type WEye = {look: number; lid: number; squint: number};
const Humpback: React.FC<{t: number; open: number; eye: WEye; front: React.ReactNode}> = ({t, open, eye, front}) => {
  const a = open;
  const tipU = [-JAW * Math.sin((a * Math.PI) / 180), HY - JAW * Math.cos((a * Math.PI) / 180)];
  const tipL = [JAW * Math.sin((a * Math.PI) / 180), HY - JAW * Math.cos((a * Math.PI) / 180)];
  const fin = 4 * Math.sin(t * 2.2);
  return (
    <>
      <W>
        {/* long white flipper behind the body (humpback) */}
        <g transform={`translate(-250 -170) rotate(${fin})`}>
          <path d="M 0 0 Q -220 40 -430 250 Q -455 285 -415 290 Q -200 170 30 70 Z" fill={WBELLY} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          {[0, 1, 2].map((i) => <circle key={i} cx={-150 - i * 95} cy={70 + i * 70} r={10} fill="#C9D3DB" stroke={INK} strokeWidth={4} />)}
        </g>
        {/* inside of the mouth */}
        <path d={`M 0 ${HY + 20} L ${tipU[0] * 0.98} ${tipU[1] + 40} Q 0 ${HY - JAW - 60} ${tipL[0] * 0.98} ${tipL[1] + 40} Z`} fill={MOUTH} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        <path d={`M ${-JAW * 0.3 * Math.sin((a * Math.PI) / 180)} ${HY - 120} Q 0 ${HY - 260} ${JAW * 0.3 * Math.sin((a * Math.PI) / 180)} ${HY - 120} L 0 ${HY + 10} Z`} fill={TONGUE} />
      </W>
      {front}
    </>
  );
};
const HumpbackJaws: React.FC<{t: number; open: number; eye: WEye}> = ({t, open, eye}) => (
  <W>
    {/* lower jaw + throat pleats (rotates right) */}
    <g transform={`translate(0 ${HY}) rotate(${open})`}>
      <clipPath id="hpLow"><path d={LOWER} /></clipPath>
      <path d={LOWER} fill={WBELLY} />
      <g clipPath="url(#hpLow)">
        {[44, 92, 140, 188, 236].map((x, i) => <path key={i} d={`M ${x * 0.35} ${-JAW + 40} Q ${x} -500 ${x} 60`} stroke="#B9C4CE" strokeWidth={7} fill="none" />)}
        <path d="M 160 -900 Q 290 -600 300 60 L 400 60 L 400 -900 Z" fill={WB2} />
      </g>
      <path d={LOWER} fill="none" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    </g>
    {/* upper jaw with baleen comb and knobs (rotates left) */}
    <g transform={`translate(0 ${HY}) rotate(${-open})`}>
      <clipPath id="hpUp"><path d={UPPER} /></clipPath>
      <path d={UPPER} fill={WB} />
      <g clipPath="url(#hpUp)">
        <path d="M -200 -860 Q -300 -500 -300 60 L -400 60 L -400 -900 Z" fill={WB2} />
        <rect x={-30} y={-JAW + 30} width={30} height={JAW - 60} fill="#4A4A52" />
        {Array.from({length: 26}, (_, i) => <path key={i} d={`M -30 ${-JAW + 40 + i * 32} H 0`} stroke="#8A8A94" strokeWidth={5} />)}
      </g>
      <path d={UPPER} fill="none" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      {[[-110, -820], [-150, -690], [-120, -560], [-190, -480], [-150, -380]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={15} fill={WB2} stroke={INK} strokeWidth={5} />)}
      {/* eye near the mouth corner */}
      <g transform="translate(-175 -150)">
        <ellipse rx={36} ry={30 * (1 - 0.75 * eye.squint)} fill="#fff" stroke={INK} strokeWidth={6} />
        {eye.squint < 0.6 ? <circle cx={12 * eye.look} cy={-2} r={13} fill={INK} /> : null}
        {eye.lid > 0.02 ? <path d={`M -40 ${-34} H 40 V ${-34 + 60 * eye.lid} H -40 Z`} fill={WB2} stroke={INK} strokeWidth={5} clipPath="url(#hpUp)" /> : null}
        <path d={`M -44 ${-44 + 10 * eye.squint} Q 0 ${-62 + 16 * eye.squint} 44 ${-40 - 8 * eye.squint}`} stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round" />
      </g>
    </g>
    {/* body below the hinge, covering the jaw roots */}
    <path d={`M -330 160 Q -340 -260 -170 ${HY + 10} Q 0 ${HY - 40} 170 ${HY + 10} Q 340 -260 330 160 Z`} fill={WB} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
    <path d={`M 60 ${HY + 30} Q 250 -250 300 160 L 150 160 Q 120 -100 40 ${HY + 40} Z`} fill={WBELLY} />
    {[90, 140, 190].map((x, i) => <path key={i} d={`M ${x - 40} ${HY + 50} Q ${x + 30} -120 ${x + 10} 160`} stroke="#B9C4CE" strokeWidth={6} fill="none" />)}
    <path d={`M -330 160 Q -340 -260 -170 ${HY + 10} Q 0 ${HY - 40} 170 ${HY + 10} Q 340 -260 330 160`} fill="none" stroke={INK} strokeWidth={9} strokeLinejoin="round" />
  </W>
);

/** drops thrown up around the whale where it breaks the surface */
const Splash: React.FC<{t: number; born: number; n?: number; seed?: number; spread?: number; x?: number}> = ({t, born, n = 14, seed = 1, spread = 420, x = 0}) => {
  const u = t - born;
  if (u < 0 || u > 1.4) return null;
  return <W>{Array.from({length: n}, (_, i) => {
    const side = i % 2 ? 1 : -1, vx = side * (120 + rnd(seed + i) * 380), vy = -(700 + rnd(seed + i * 3) * 700);
    const px = x + side * (spread * (0.6 + 0.4 * rnd(seed + i * 7))) + vx * u, py = vy * u + 0.5 * 2600 * u * u;
    const r = (16 + rnd(seed + i * 5) * 22) * (1 - seg(u, 0.9, 1.4));
    return py < 40 && r > 1 ? <circle key={i} cx={px} cy={py} r={r} fill="#CFE9F7" stroke={INK} strokeWidth={5} /> : null;
  })}</W>;
};

// shot 1 (t 0..S2) and shot 5 (t S5..end): the humpback scene; `k` picks the story
const humpState = (t: number) => {
  // returns jaw opening (deg), guy {pose, x, y, sx, sy, rot, show}, eye
  if (t < S2) {
    // frame 0: jaws already swinging shut on him; two gulps; slam on "stuck"
    let open = lerp(30, 16, eout(seg(t, 0, 0.4)));
    open = lerp(open, 22, eio(seg(t, 0.9, 1.4)));
    if (t > 1.5) open = lerp(22, 13, eout(seg(t, 1.5, 1.8)));
    if (t > T.stuck - 0.25) open = lerp(13, 7.5, eout(seg(t, T.stuck - 0.25, T.stuck - 0.05))) + spring(t, T.stuck - 0.05, 1.6, 4, 7);
    const sq = seg(t, T.stuck - 0.25, T.stuck - 0.05);
    const wig = t > T.stuck ? Math.sin(t * 22) * 5 * (1 - seg(t, T.throat + 0.4, S2)) : 0;
    const g = swap(t, 0.0001, 'scared', 'scared');
    return {open, pose: 'scared' as Pose, gx: wig * 0.6, gy: -590 + 20 * sq, sx: g.sx * lerp(1, 0.72, sq), sy: g.sy * lerp(1, 1.08, sq), rot: wig, show: 1, tremble: 1,
      eye: {look: 1, lid: 0.15 + 0.3 * sq, squint: sq * (t < T.throat + 0.3 ? 1 : 0.6)} as WEye};
  }
  // shot 5: surfacing with the diver in its open mouth -> grabs him (jaws shut) -> spits him out
  const u = t - S5;
  let open = lerp(26, 20, seg(u, 0, 1.6));
  if (t > T.grab - 0.15) open = lerp(20, 0, eout(seg(t, T.grab - 0.15, T.grab + 0.05))) + spring(t, T.grab + 0.05, 1.2, 4, 7);
  if (t > T.spat - 0.1) open = lerp(0, 34, eout(seg(t, T.spat - 0.1, T.spat + 0.12))) - spring(t, T.spat + 0.12, 3, 3, 5);
  if (t > T.out + 0.2) open = lerp(open, 30, seg(t, T.out + 0.2, T.out + 0.6));
  const eye: WEye = {look: t < T.spat ? 1 : -1, lid: t > T.grab && t < T.spat ? 0.45 : t > T.spat + 0.3 ? 0.35 : 0.1, squint: t > T.spat - 0.1 && t < T.spat + 0.3 ? 1 : 0};
  // the diver: inside -> hidden by the shut jaws -> launched up and out to the right, spinning
  const fl = t - T.spat;
  if (t < T.spat) {
    return {open, pose: (t < T.grab ? 'surprised' : 'scared') as Pose, gx: 0, gy: -590, sx: 1, sy: 1, rot: 0, show: t < T.grab + 0.02 ? 1 : 0, tremble: 0, eye};
  }
  const gx = 700 * fl, gy = -590 - 2000 * fl + 0.5 * 2200 * fl * fl, rot = 300 * fl;
  return {open, pose: 'scared' as Pose, gx, gy, sx: 1, sy: 1, rot, show: 1, tremble: 0, eye};
};

const SeaScene: React.FC<{t: number}> = ({t}) => {
  const isS5 = t >= S5;
  const u = isS5 ? t - S5 : t;
  const h = humpState(t);
  // whale rises a little and bobs
  const rise = isS5 ? lerp(260, 0, eout(seg(u, 0, 0.6))) : 0;
  const bob = 10 * Math.sin(t * 2.4);
  const cam0 = isS5
    ? camAt([{t: S5, x: 0, y: -640, k: 1.0}, {t: T.grab, x: 0, y: -660, k: 1.15}, {t: T.spat - 0.1, x: 0, y: -660, k: 1.18},
        {t: T.spat + 0.6, x: 120, y: -760, k: 0.95}, {t: DURATION, x: 120, y: -760, k: 0.95}], t)
    : camAt([{t: 0, x: 0, y: -700, k: 1.6}, {t: T.stuck - 0.2, x: 0, y: -720, k: 1.66}, {t: T.stuck + 0.3, x: 0, y: -790, k: 1.85}, {t: S2, x: 0, y: -790, k: 1.9}], t);
  const sh = shake(t, hit(t, 0, 7, 5) + hit(t, T.stuck - 0.05, 9, 6) + hit(t, T.grab + 0.05, 8, 6) + hit(t, T.spat, 10, 6));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const gulpS = pulse(t, 0.0, 1.0) * (isS5 ? 0 : 1);
  const stuckS = isS5 ? 0 : pulse(t, T.stuck, S2 - T.stuck - 0.3);
  const badge = isS5 ? popIn(t, T.y2021, 0.35) * (1 - seg(t, T.spat - 0.3, T.spat)) : 0;
  const ptoo = isS5 ? pulse(t, T.spat, 0.9) : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <Layer cam={cam} z={2600}>
        {/* far sea and a few gulls' worth of horizon waves */}
        <W><rect x={-6000} y={40} width={12000} height={4000} fill="#8FC6E6" />
          <path d="M -6000 40 H 6000" stroke={INK} strokeWidth={8} />
          {[[-900, -900], [1100, -1200]].map(([x, y], i) => <path key={i} transform={`translate(${x + 20 * Math.sin(t * 0.3 + i)} ${y})`}
            d="M -170 40 Q -180 -20 -110 -20 Q -90 -90 -10 -70 Q 40 -120 100 -60 Q 180 -60 170 40 Z" fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />)}</W>
      </Layer>
      <Layer cam={cam} z={1000}>
        <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(0px, ${rise + bob}px)`}}>
          <Humpback t={t} open={h.open} eye={h.eye} front={
            h.show && h.gy > -1500 && !(isS5 && t >= T.spat) ? <Guy pose={h.pose} x={h.gx} y={h.gy} t={t} size={1.25} sx={h.sx} sy={h.sy} rot={h.rot} tremble={h.tremble} /> : null} />
          <HumpbackJaws t={t} open={h.open} eye={h.eye} />
          {/* stuck: his face peeks through the gap above the clamping jaws */}
        </div>
      </Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Sea t={t} x0={-3000} x1={3000} fill="#7DB9DE" op={0.92} amp={10} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Splash t={t} born={isS5 ? S5 : -0.35} seed={isS5 ? 7 : 3} />
        {isS5 && t >= T.spat ? <Guy pose="scared" x={h.gx} y={h.gy + rise + bob} t={t} size={1.25} rot={h.rot} /> : null}
        <Txt x={190} y={-870} s={gulpS} text="GULP" size={90} rot={8} fill={GOLD} />
        <Txt x={0} y={-1180} s={stuckS} text="STUCK" size={110} rot={-5} fill={GOLD} />
        {[0, 1, 2].map((i) => <Star key={i} x={-150 + i * 150} y={-1000 - (i % 2) * 50} s={pulse(t, T.stuck - 0.05 + i * 0.05, 0.5) * 0.8 * (isS5 ? 0 : 1)} rot={i * 25} />)}
        <Txt x={-260} y={-1320} s={badge} text="2021" size={130} rot={-6} fill={GOLD} />
        <Txt x={-200} y={-1200} s={badge * seg(t, T.hump - 0.1, T.hump + 0.1)} text="HUMPBACK" size={80} rot={-6} />
        <Txt x={-150} y={-1200} s={ptoo} text="PTOO" size={120} rot={-8} fill={GOLD} />
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- shot 2: the blue whale's throat vs a grapefruit ----------
const Grapefruit: React.FC<{x: number; y: number; r: number; s: number}> = ({x, y, r, s}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={r} fill="#FF9E7A" stroke={INK} strokeWidth={7} />
    <circle r={r * 0.8} fill="#FFC2AC" />
    {Array.from({length: 8}, (_, i) => <path key={i} d={`M 0 0 L ${Math.cos((i * Math.PI) / 4) * r * 0.8} ${Math.sin((i * Math.PI) / 4) * r * 0.8}`} stroke="#FFE3D8" strokeWidth={4} />)}
    <circle r={r} fill="none" stroke={INK} strokeWidth={7} />
  </g></W>) : null;
const ThroatScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([{t: S2, x: 30, y: -250, k: 2.15}, {t: S3, x: 30, y: -260, k: 2.3}], t);
  const ringS = popIn(t, S2 + 0.05, 0.35);
  const R = 40;                                   // throat radius vs his head (r 64): a grapefruit is ~0.6 of a head
  // he leans his head toward the ring and bonks on it
  const lean = eio(seg(t, T.throat2 + 0.1, T.throat2 + 0.5)) * (1 - eio(seg(t, T.wide + 0.1, T.wide + 0.4)));
  const bonk = hit(t, T.throat2 + 0.5, 1, 7);
  let g = swap(t, T.throat2 + 0.5, 'front_worried', 'surprised');
  if (t >= T.grape + 0.15) g = swap(t, T.grape + 0.15, 'surprised', 'shrug');
  const blueIcon = popIn(t, T.blue - 0.05, 0.35);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <Layer cam={cam} z={1000}>
        <Guy pose={g.pose} x={-120 + 30 * lean - 10 * bonk} y={0} t={t} sx={g.sx} sy={g.sy} rot={10 * lean - 4 * bonk} />
        {/* the throat: a pink ring of whale muscle */}
        <W><g transform={`translate(150 -250) scale(${ringS})`}>
          <circle r={R + 26} fill={MOUTH} stroke={INK} strokeWidth={7} />
          <circle r={R} fill="#3A1820" stroke={INK} strokeWidth={6} />
        </g></W>
        <Grapefruit x={150} y={-250} r={R - 3} s={popIn(t, T.grape, 0.35)} />
        {/* width arrow on "wide" */}
        <W>{[[INK, 12], [GOLD, 5]].map(([c, w], i) => <path key={i} {...pen(eout(seg(t, T.wide - 0.05, T.wide + 0.3)))}
          d={`M ${150 - R} -170 L ${150 + R} -170`} stroke={c as string} strokeWidth={w as number} strokeLinecap="round" />)}</W>
        <Txt x={150} y={-130} s={popIn(t, T.grape + 0.1, 0.3)} text="GRAPEFRUIT" size={30} fill={GOLD} />
        <Txt x={60} y={-430} s={popIn(t, T.throat2, 0.3)} text="BLUE WHALE THROAT" size={34} rot={-3} />
        {/* a little blue whale icon */}
        <W><g transform={`translate(-60 -510) scale(${blueIcon * 0.42})`}>
          <path d="M -260 10 Q -250 -70 -120 -80 Q 80 -90 200 -30 Q 250 -10 290 -50 Q 300 -5 280 20 Q 300 50 290 80 Q 250 40 200 40 Q 60 80 -120 70 Q -255 65 -260 10 Z" fill={WB} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          <path d="M -255 25 Q -100 60 120 45" stroke={INK} strokeWidth={6} fill="none" />
          <circle cx={-170} cy={-10} r={9} fill={INK} />
        </g></W>
        {[0, 1].map((i) => <Star key={i} x={100 + i * 60} y={-330 - i * 30} s={pulse(t, T.throat2 + 0.5 + i * 0.05, 0.4) * 0.45} rot={i * 30} />)}
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- shot 3: a giant sperm whale diving head-down (to scale: ~10x his height) ----------
const SW = '#737B8A', SW2 = '#5E6573';
const SpermWhale: React.FC<{t: number; jaw: number}> = ({t, jaw}) => {
  const sway = 6 * Math.sin(t * 1.6);
  const body = 'M -270 -40 Q -290 -600 -265 -1150 Q -240 -1900 -110 -2600 Q -90 -2700 -60 -2760 L 60 -2760 Q 90 -2700 110 -2600 Q 240 -1900 265 -1150 Q 290 -600 270 -40 Q 260 10 200 14 L -200 14 Q -262 10 -270 -40 Z';
  return (
    <W><g transform={`rotate(${sway * 0.3})`}>
      {/* flukes */}
      <g transform={`translate(0 -2760) rotate(${sway})`}>
        <path d="M 0 0 Q -160 -60 -420 -150 Q -360 -40 -120 40 Z M 0 0 Q 160 -60 420 -150 Q 360 -40 120 40 Z" fill={SW} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      </g>
      <clipPath id="swC"><path d={body} /></clipPath>
      <path d={body} fill={SW} />
      <g clipPath="url(#swC)">
        <path d="M 150 -2700 Q 320 -1500 300 60 L 400 60 L 400 -2700 Z" fill={SW2} />
        {Array.from({length: 14}, (_, i) => <path key={i} d={`M ${-200 + (i % 3) * 120} ${-1300 - i * 95} q 40 -18 80 0 q 40 18 80 0`} stroke={SW2} strokeWidth={8} fill="none" strokeLinecap="round" />)}
      </g>
      <path d={body} fill="none" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
      {/* blowhole line + eye near the jaw corner */}
      <ellipse cx={170} cy={-820} rx={20} ry={16} fill="#fff" stroke={INK} strokeWidth={6} /><circle cx={162} cy={-818} r={8} fill={INK} />
      {/* narrow lower jaw with teeth on the right side, hinged near the eye */}
      <g transform={`translate(230 -700) rotate(${jaw})`}>
        <path d="M -40 0 L -55 640 Q -40 690 0 680 L 30 20 Z" fill="#E6E2DA" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
        {Array.from({length: 9}, (_, i) => <path key={i} d={`M -48 ${90 + i * 62} l -30 14 l 30 12`} fill="#fff" stroke={INK} strokeWidth={4} strokeLinejoin="round" />)}
      </g>
    </g></W>
  );
};
const DeepScene: React.FC<{t: number}> = ({t}) => {
  const dive = lerp(-1900, 0, eout(seg(t, S3, S3 + 0.9)));   // whale slides down into frame
  const yOff = dive + 40 * (t - S3);
  const cam = camAt([{t: S3, x: 120, y: -1300, k: 0.56}, {t: T.long + 0.2, x: 120, y: -1260, k: 0.58},
    {t: T.fit - 0.1, x: 300, y: -60, k: 1.05}, {t: S4, x: 300, y: -40, k: 1.12}], t);
  // jaw drops on "fit", he gets sucked in, jaw snaps shut on "down"
  const jaw = 32 * eout(seg(t, T.fit - 0.35, T.fit - 0.1)) * (1 - eout(seg(t, T.down + 0.05, T.down + 0.2))) + spring(t, T.down + 0.2, 2, 4, 7);
  const suck = eio(seg(t, T.fit - 0.05, T.down + 0.05));
  const gx = lerp(470, 300, suck), gy = lerp(260, -200, suck) + 12 * Math.sin(t * 2.2);
  const arrowP = eout(seg(t, T.eighteen - 0.1, T.eighteen + 0.5)) * (1 - seg(t, T.fit - 0.4, T.fit - 0.2));
  const label = popIn(t, T.eighteen + 0.35, 0.35) * (1 - seg(t, T.fit - 0.4, T.fit - 0.2));
  const sh = shake(t, hit(t, T.down + 0.2, 8, 6));
  const camS = {...cam, x: cam.x + sh.x, y: cam.y + sh.y};
  const ax = -420, a0 = yOff, a1 = yOff - 2900, am = (a0 + a1) / 2;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#2E6F9E'}}>
      <AbsoluteFill style={{background: 'linear-gradient(#7CC0E4, #3D82B4 55%, #245C88)'}} />
      <Layer cam={camS} z={2400} paper={false}>
        {/* light rays + far bubbles */}
        <W>{[-1600, -700, 300, 1300].map((x, i) => <path key={i} d={`M ${x} -4000 L ${x + 300} -4000 L ${x + 700} 2000 L ${x + 500} 2000 Z`} fill="#FFFFFF" opacity={0.08} />)}
          {Array.from({length: 20}, (_, i) => <circle key={i} cx={-1500 + rnd(i) * 3200} cy={1200 - ((t * 90 + rnd(i * 3) * 4200) % 4200)} r={10 + rnd(i * 5) * 16} fill="none" stroke="#CFEAF7" strokeWidth={5} />)}</W>
      </Layer>
      <Layer cam={camS} z={1000}>
        {suck < 0.98 ? <Guy pose={t < T.fit - 0.3 ? 'scared' : 'surprised'} x={gx} y={gy} t={t} sx={lerp(1, 0.6, suck)} sy={lerp(1, 0.6, suck)} rot={-25 * suck + 6 * Math.sin(t * 2)} tremble={1} /> : null}
        <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(0px, ${yOff}px)`}}><SpermWhale t={t} jaw={jaw} /></div>
        {/* 18 m dimension arrow */}
        {arrowP > 0.002 ? <W>{[[INK, 26], [GOLD, 12]].map(([c, w], i) => <g key={i}>
          <path d={`M ${ax} ${lerp(am, a0, arrowP)} L ${ax} ${lerp(am, a1, arrowP)}`} stroke={c as string} strokeWidth={w as number} strokeLinecap="round" />
          {arrowP > 0.9 ? <path d={`M ${ax - 34} ${a0 - 40} L ${ax} ${a0} L ${ax + 34} ${a0 - 40} M ${ax - 34} ${a1 + 40} L ${ax} ${a1} L ${ax + 34} ${a1 + 40}`} stroke={c as string} strokeWidth={w as number} fill="none" strokeLinecap="round" strokeLinejoin="round" /> : null}
        </g>)}</W> : null}
        <Txt x={ax - 150} y={am} s={label} text="18 M" size={170} rot={-90} fill={GOLD} />
        <Txt x={520} y={-500} s={popIn(t, T.sperm, 0.35) * (1 - seg(t, T.fit - 0.4, T.fit - 0.2))} text="SPERM WHALE" size={95} rot={-90} />
        <Txt x={520} y={-260} s={pulse(t, T.down + 0.15, 0.4)} text="GULP" size={90} rot={8} fill={GOLD} />
      </Layer>
    </AbsoluteFill>
  );
};

// ---------- shot 4: inside - no air, and the first of four stomachs squeezes ----------
const blobD = (R: number, t: number, seed: number) => {
  const n = 28, pts: number[][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, r = R * (1 + 0.05 * Math.sin(a * 3 + seed) + 0.025 * Math.sin(a * 5 + t * 2.5 + seed));
    pts.push([Math.cos(a) * r, Math.sin(a) * r * 0.92]);
  }
  let d = `M ${((pts[0][0] + pts[n - 1][0]) / 2).toFixed(1)} ${((pts[0][1] + pts[n - 1][1]) / 2).toFixed(1)}`;
  for (let i = 0; i < n; i++) { const p = pts[i], q = pts[(i + 1) % n]; d += ` Q ${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2).toFixed(1)}`; }
  return d + ' Z';
};
const StomachScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([{t: S4, x: 0, y: 40, k: 1.25}, {t: T.squeeze, x: 0, y: 40, k: 1.32}, {t: S5, x: 0, y: 40, k: 1.4}], t);
  // the wall squeezes in pulses on "squeezes"
  const sq = t < T.squeeze - 0.1 ? 0 : eout(seg(t, T.squeeze - 0.1, T.squeeze + 0.2)) * (0.75 + 0.25 * Math.cos((t - T.squeeze - 0.2) * 7));
  const R = lerp(480, 300, sq) * (1 + 0.012 * Math.sin(t * 3));
  const floor = R * 0.92 * 0.97;
  let g = swap(t, T.noAir, 'front_worried', 'scared');
  if (t >= T.squeeze) g = {pose: 'scared', sx: lerp(1, 0.7, sq), sy: lerp(1, 0.86, sq)};
  const bubble = popIn(t, T.inside + 0.3, 0.35) * (t < T.air ? 1 : 0);
  const by = -120 - 160 * seg(t, T.inside + 0.3, T.air);
  const four = [0, 1, 2, 3].map((i) => popIn(t, T.four + i * 0.1, 0.3));
  const sh = shake(t, 5 * sq);
  const camS = {...cam, x: cam.x + sh.x, y: cam.y + sh.y};
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#9E3446'}}>
      <Layer cam={camS} z={1000} paper={false}>
        <W>
          <rect x={-3000} y={-3000} width={6000} height={6000} fill="#A83A4E" />
          {Array.from({length: 18}, (_, i) => <path key={i} transform={`rotate(${i * 20 + 4 * Math.sin(t + i)})`} d={`M ${R + 60} 0 q 120 -30 260 10 q 140 30 300 -10`} stroke="#8C2C3E" strokeWidth={14} fill="none" strokeLinecap="round" />)}
        </W>
      </Layer>
      <Layer cam={camS} z={1000}>
        <W>
          <path d={blobD(R, t, 1)} fill="#F2A3AE" stroke={INK} strokeWidth={10} strokeLinejoin="round" />
          {Array.from({length: 7}, (_, i) => <path key={i} d={`M ${-R * 0.7 + i * R * 0.23} ${R * 0.55} q 20 -${R * 0.12} 40 0`} stroke="#E07F8E" strokeWidth={8} fill="none" strokeLinecap="round" />)}
        </W>
        <Guy pose={g.pose} x={0} y={Math.min(floor - 10, 230)} t={t} sx={g.sx} sy={g.sy} tremble={t > T.noAir ? 1 : 0} />
        {/* his last air bubble floats up and pops on "air" */}
        {bubble > 0.01 ? <W><g transform={`translate(${90 + 10 * Math.sin(t * 4)} ${by}) scale(${bubble})`}>
          <circle r={58} fill="#DDF2FB" fillOpacity={0.85} stroke={INK} strokeWidth={6} />
          <text x={0} y={4} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>O2</text>
          <path d="M -30 -30 q 10 -12 24 -14" stroke="#fff" strokeWidth={7} fill="none" strokeLinecap="round" />
        </g></W> : null}
        {[0, 1, 2, 3, 4].map((i) => <Star key={i} x={90 + Math.cos(i * 1.26) * 70 * seg(t, T.air, T.air + 0.3)} y={-280 + Math.sin(i * 1.26) * 70 * seg(t, T.air, T.air + 0.3)} s={pulse(t, T.air, 0.25) * 0.35} rot={i * 40} />)}
        <Sweat x={70} y={-20} s={popIn(t, T.squeeze, 0.3) * (1 - seg(t, S5 - 0.3, S5 - 0.1))} />
      </Layer>
      <Layer cam={camS} z={1000}>
        <Txt x={-60} y={-300} s={pulse(t, T.air, T.first - T.air - 0.1)} text="NO AIR" size={110} rot={-4} fill={GOLD} />
        {/* the four stomach chambers, #1 doing the squeezing */}
        {four.map((s, i) => <W key={i}><g transform={`translate(${-300 + i * 200} 520) scale(${s * (i === 0 ? 1 + 0.15 * sq : 0.85)})`}>
          <path d={blobD(70, t, i * 2)} fill={i === 0 ? GOLD : '#F2A3AE'} stroke={INK} strokeWidth={8} />
          <text x={0} y={6} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={70} fill={INK}>{i + 1}</text>
        </g></W>)}
        <Txt x={0} y={-400} s={pulse(t, T.squeeze, S5 - T.squeeze - 0.35)} text="SQUEEZE" size={120} rot={4} fill={GOLD} />
      </Layer>
    </AbsoluteFill>
  );
};

export const WhaleScene: React.FC<{t: number; thumb?: boolean}> = ({t, thumb}) => {
  const shot = t < S2 ? <SeaScene t={t} /> : t < S3 ? <ThroatScene t={t} /> : t < S4 ? <DeepScene t={t} /> : t < S5 ? <StomachScene t={t} /> : <SeaScene t={t} />;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#FBF7EC'}}>
      {shot}
      {thumb ? null : <>
        <HookTitle t={t} text="TOO BIG TO SWALLOW" hi="SWALLOW" y={300} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.diver + 0.2} until={DURATION - LOOP_DUR - 0.4} text="What should swallow him next?" />
      </>}
    </AbsoluteFill>
  );
};

export const WhaleVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    {f: 'gulp.wav', at: 0.0, db: -10}, {f: 'splash.wav', at: 0.0, db: -16}, {f: 'waves.wav', at: 0.0, db: -30, to: 3.0},
    {f: 'gulp.wav', at: 1.5, db: -20}, {f: 'strain.mp3', at: T.stuck - 0.2, db: -22}, {f: 'squeak.wav', at: T.stuck + 0.1, db: -24},
    {f: 'whoosh.wav', at: S2 - 0.25, db: -28}, {f: 'pop.wav', at: S2 + 0.05, db: -22}, {f: 'twang.mp3', at: T.throat2 + 0.5, db: -24},
    {f: 'tick.wav', at: T.wide, db: -26}, {f: 'pop.wav', at: T.grape, db: -18}, {f: 'ding.mp3', at: T.grape + 0.1, db: -26},
    {f: 'whoosh.wav', at: S3 - 0.2, db: -26}, {f: 'bubbles.wav', at: S3 + 0.2, db: -28}, {f: 'tick.wav', at: T.eighteen, db: -26}, {f: 'pop.wav', at: T.eighteen + 0.35, db: -22},
    {f: 'whir.mp3', at: T.fit - 0.1, db: -30, to: 0.4}, {f: 'gulp.wav', at: T.down + 0.05, db: -14},
    {f: 'bubbles.wav', at: S4 + 0.1, db: -30}, {f: 'pop.wav', at: T.air, db: -16},
    ...ctaCues(T.cta),
    {f: 'strain.mp3', at: T.squeeze - 0.1, db: -24}, {f: 'squeak.wav', at: T.squeeze + 0.15, db: -26},
    {f: 'splash.wav', at: S5, db: -18}, {f: 'waves.wav', at: S5, db: -32, to: 3.0}, {f: 'pop.wav', at: T.y2021, db: -22},
    {f: 'gulp.wav', at: T.grab - 0.1, db: -16},
    {f: 'twang.mp3', at: T.spat - 0.05, db: -18}, {f: 'whoosh.wav', at: T.spat - 0.1, db: -24}, {f: 'splash.wav', at: T.spat, db: -22},
    {f: 'crowd_laugh.wav', at: T.out, db: -36, to: 1.0},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<WhaleScene t={0} />}>
        <WhaleScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="whale/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const WhaleWide: React.FC = () => <WideFit.Provider value={0.72}><WhaleVideo /></WideFit.Provider>;
