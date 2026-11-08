// "Why can't you tickle yourself?" - built from the kit (library poses + code-drawn props).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, C, Layer, camAt, Sky, Ground, Guy, swap, ContactShadow, Ball, Box, Rope, ObjectFace, FACE0, Face,
  Star, Badge, SoundLayer, Cue, W, seg, popIn, spring, shake, hit, lerp, eio, WideFit, Pose} from './lib/kit';

// beat times = voice word times + 0.1 s
const T = {
  nothing: 1.92, right: 2.42, thats: 3.26, brain: 4.02, exactly: 4.62, fingers: 5.82, going: 6.38,
  basically: 7.64, predicts: 8.32, turns: 9.52, down: 10.34, cut: 11.25,
  study: 11.88, people: 12.64, robot: 14.2, added: 15.74, split: 16.28, delay: 16.94, tickle: 17.98, back: 18.46,
};
export const DURATION = 19.7;

// ---------- code-drawn props ----------
const BRAIN = '#FF9EBB', BRAIN_D = '#E9789C';
export const Brain: React.FC<{x: number; y: number; s: number; f: Face; t: number}> = ({x, y, s, f, t}) => s < 0.01 ? null : (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${x}px ${y}px`, transform: `scale(${s})`}}>
    <W>
      <path d={`M ${x - 112} ${y + 10} C ${x - 130} ${y - 70} ${x - 50} ${y - 98} ${x} ${y - 80} C ${x + 50} ${y - 100} ${x + 132} ${y - 70} ${x + 112} ${y + 12}
        C ${x + 118} ${y + 70} ${x + 40} ${y + 88} ${x} ${y + 70} C ${x - 40} ${y + 90} ${x - 118} ${y + 70} ${x - 112} ${y + 10} Z`} fill={BRAIN} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      {[[`M ${x - 80} ${y - 40} q 20 -16 36 0`], [`M ${x + 46} ${y - 52} q 20 -10 34 6`], [`M ${x - 92} ${y + 30} q 14 14 32 4`], [`M ${x + 62} ${y + 40} q 18 4 30 -12`], [`M ${x} ${y - 78} v 26`]]
        .map(([d], i) => <path key={i} d={d} stroke={BRAIN_D} strokeWidth={7} fill="none" strokeLinecap="round" />)}
    </W>
    <ObjectFace x={x} y={y + 2} r={78} f={f} t={t} lidColor={BRAIN} />
  </div>
);
const Meter: React.FC<{x: number; y: number; s: number; level: number}> = ({x, y, s, level}) => s < 0.01 ? null : (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${x}px ${y}px`, transform: `scale(${s})`}}>
    <W>
      <rect x={x - 40} y={y - 120} width={80} height={240} rx={18} fill="#fff" stroke={INK} strokeWidth={8} />
      <rect x={x - 26} y={y + 106 - 212 * level} width={52} height={212 * level} rx={10} fill={level > 0.4 ? C.red : '#9FD36B'} />
      <rect x={x - 40} y={y - 120} width={80} height={240} rx={18} fill="none" stroke={INK} strokeWidth={8} />
      <text x={x} y={y - 140} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>TICKLE</text>
    </W>
  </div>
);
const Bubble: React.FC<{x: number; y: number; s: number; t: number}> = ({x, y, s, t}) => s < 0.01 ? null : (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -80 -50 H 80 Q 100 -50 100 -30 V 20 Q 100 40 80 40 H -30 L -60 70 L -50 40 H -80 Q -100 40 -100 20 V -30 Q -100 -50 -80 -50 Z" fill="#fff" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    {[-40, 0, 40].map((dx, i) => <circle key={i} cx={dx} cy={-5} r={10 * (0.7 + 0.3 * Math.abs(Math.sin(t * 5 - i)))} fill={INK} />)}
  </g></W>
);
const Tumbleweed: React.FC<{x: number; y: number; r: number; rot: number}> = ({x, y, r, rot}) => (
  <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <circle r={r} fill="#E2C48B" stroke={INK} strokeWidth={7} />
    {[0, 45, 90, 135].map((a) => <ellipse key={a} rx={r * 0.92} ry={r * 0.35} transform={`rotate(${a})`} fill="none" stroke="#A9834A" strokeWidth={5} />)}
    <circle r={r} fill="none" stroke={INK} strokeWidth={7} />
  </g></W>
);
const Feather: React.FC<{x: number; y: number; rot: number}> = ({x, y, rot}) => (
  <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d="M 0 0 C -30 -34 -92 -38 -128 -6 C -92 22 -34 24 0 0 Z" fill="#FFF1B8" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 4 0 L -122 -6" stroke="#D8B85A" strokeWidth={5} strokeLinecap="round" />
    {[-30, -60, -90].map((px) => <path key={px} d={`M ${px} -3 l -14 -16 M ${px} -3 l -14 14`} stroke="#E6CB7A" strokeWidth={4} strokeLinecap="round" />)}
  </g></W>
);

// ---------- faces over time ----------
const brainFace = (t: number): Face => {
  const f: Face = {...FACE0, open: popIn(t, T.brain + 0.08), mouth: 'smile', ly: -0.2};
  if (t > T.exactly) { f.ly = 1; f.lx = 0; f.mouth = 'flat'; f.brow = 8; }
  if (t > T.going + 0.2) { f.lid = 0.45; f.mouth = 'smile'; f.brow = -4; f.ly = 0.5; }
  if (t > T.basically) { f.lx = 1; f.ly = 0.2; f.lid = 0.45; }
  if (t > T.predicts && t < T.predicts + 0.15) f.lid = 0.95; // wink-blink on "predicts"
  if (t > T.turns) { f.mouth = 'grin'; f.lid = 0.5; f.lx = 1; f.ly = 0.6; }
  return f;
};
const robotFace = (t: number): Face => {
  if (t < T.robot) return {...FACE0, open: 0, mouth: 'none'};
  const f: Face = {...FACE0, open: popIn(t, T.robot), lx: -1, ly: 0.4, mouth: 'flat'};
  if (t > T.added) { f.lid = 0.45; f.mouth = 'smile'; f.brow = 10; }
  if (t > T.tickle) { f.lid = 0; f.mouth = 'grin'; f.brow = -6; f.lx = -1; }
  return f;
};

// ---------- scene 1: the guy tries to tickle himself ----------
const SceneOne: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([
    {t: 0, x: 0, y: -175, k: 2.15}, {t: T.nothing - 0.1, x: 0, y: -175, k: 2.15},
    {t: T.right + 0.3, x: 0, y: -210, k: 1.7}, {t: T.thats - 0.15, x: 0, y: -215, k: 1.68},
    {t: T.brain - 0.1, x: 0, y: -360, k: 1.25}, {t: T.basically - 0.1, x: 0, y: -360, k: 1.25},
    {t: T.basically + 0.6, x: 70, y: -380, k: 1.22}, {t: T.cut, x: 70, y: -385, k: 1.24},
  ], t);
  let g = swap(t, T.right, 'tickle_self', 'shrug');
  if (t >= T.thats + 0.1) g = swap(t, T.thats + 0.1, 'shrug', 'tickle_self');
  const tickling = g.pose === 'tickle_self';
  const shimmy = tickling ? 1.6 * Math.sin(2 * Math.PI * 5 * t) : 0;
  const dof = 2.8;
  // tumbleweed rolls through the awkward silence
  const tw = seg(t, 1.3, 3.4); const twx = lerp(-700, 700, tw); const twy = -46 - Math.abs(Math.sin(tw * Math.PI * 4)) * 50;
  const brainS = popIn(t, T.brain, 0.4);
  const brainY = lerp(-300, -540, eio(seg(t, T.brain, T.brain + 0.35)));
  // prediction paths from brain to both hands
  const reveal = eio(seg(t, T.exactly, T.going + 0.1));
  const level = 1 - 0.9 * eio(seg(t, T.turns, T.down + 0.35));
  const paths = [-1, 1].map((s) => `M ${s * 45} ${brainY + 70} C ${s * 170} ${brainY + 180} ${s * 150} -260 ${s * 44} -158`);
  return (
    <>
      <Sky />
      <Layer cam={cam} z={3000} blur={dof}>
        <Ball x={-760} y={-40} r={280} fill="#9CCB7A" shade="#86B866" seed={9} />
        <Ball x={820} y={-30} r={360} fill="#9CCB7A" shade="#86B866" seed={11} />
        <Ground y={0} color="#C9E3A8" />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Ground y={0} line={false} color="#C9E3A8" />
        {tw > 0 && tw < 1 ? <Tumbleweed x={twx} y={twy} r={42} rot={twx * 0.9} /> : null}
        <ContactShadow x={0} y={0} />
        <Guy pose={g.pose} x={0} y={0} t={t} sx={g.sx} sy={g.sy} rot={shimmy} breathe={!tickling} />
        <Bubble x={150} y={-370} s={popIn(t, T.nothing, 0.3) * (1 - seg(t, T.thats - 0.25, T.thats))} t={t} />
        {/* thought dots from the head up to the brain */}
        {[0, 1, 2].map((i) => <W key={i}><circle cx={18 * (i % 2 ? 1 : -1) * 0.4} cy={-330 - i * 38} r={(9 + i * 4) * popIn(t, T.brain + 0.05 * i, 0.25)} fill={BRAIN} stroke={INK} strokeWidth={5} /></W>)}
        {reveal > 0 ? <W>{paths.map((d, i) => <path key={i} d={d} stroke={C.blue} strokeWidth={9} fill="none" strokeDasharray="22 18" strokeLinecap="round"
          pathLength={1000} style={{strokeDasharray: `${reveal * 1000} 1000`}} />)}</W> : null}
        {reveal > 0 ? <W>{paths.map((d, i) => <path key={'d' + i} d={d} stroke="#fff" strokeWidth={4} fill="none" strokeDasharray="14 26" />)}</W> : null}
        {[-1, 1].map((s, i) => { const k = popIn(t, (i ? T.going : T.fingers), 0.3); return k > 0.01 ?
          <W key={'r' + s}><circle cx={s * 44} cy={-158} r={34 * k} fill="none" stroke={C.blue} strokeWidth={8} /><circle cx={s * 44} cy={-158} r={10 * k} fill={C.blue} /></W> : null; })}
        <Brain x={0} y={brainY} s={brainS} f={brainFace(t)} t={t} />
        <Meter x={250} y={-560} s={popIn(t, T.basically, 0.35)} level={level} />
      </Layer>
    </>
  );
};

// ---------- scene 2: the robot ----------
const SceneTwo: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([
    {t: T.cut, x: 40, y: -190, k: 1.42}, {t: T.robot + 0.2, x: 40, y: -195, k: 1.5},
    {t: T.tickle - 0.05, x: 40, y: -195, k: 1.5}, {t: T.tickle + 0.8, x: -60, y: -205, k: 1.85, e: 'out'}, {t: DURATION, x: -62, y: -206, k: 1.87},
  ], t);
  const laughing = t >= T.tickle;
  const g: {pose: Pose; sx: number; sy: number} = laughing ? swap(t, T.tickle, 'present', 'laugh') : swap(t, T.tickle, 'present', 'laugh');
  const GX = -90;
  // the lever wiggles; the feather copies it, first instantly, then 0.2 s late
  const lev = (tt: number) => Math.sin(2 * Math.PI * 2.6 * tt);
  const delay = 0.2 * seg(t, T.split, T.delay);
  const working = t > T.people;
  const fRot = working ? 14 * lev(t - delay) : 0;
  const lx = GX - 108, ly = -150; // lever top sits under the guy's open hand (guy is mirrored)
  const sh = hit(t, T.tickle, 6);
  const giggle = laughing ? 3 * Math.sin(2 * Math.PI * 7 * t) * Math.exp(-0.6 * (t - T.tickle)) : 0;
  return (
    <>
      <AbsoluteFill style={{background: C.wall}} />
      <Layer cam={cam} z={2200} blur={1.6}>
        {[-900, -300, 300, 900].map((x) => <div key={x} style={{position: 'absolute', left: x - 6, top: -3000, width: 12, height: 3000, background: '#E5D4B6'}} />)}
        <Ground y={0} color="#CFC8BD" />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Ground y={0} color="#CFC8BD" />
        {/* control box on a stand */}
        <Rope x0={lx} y0={-80} x1={lx} y1={0} w={10} fill="#7E8792" />
        <Box x={lx} y={-100} w={86} h={52} fill={C.yellow} shade="#E5B92E" r={12} />
        <Rope x0={lx} y0={-120} x1={lx + (working ? 10 * lev(t) : 0)} y1={ly + 4} w={8} fill="#7E8792" />
        <Ball x={lx + (working ? 10 * lev(t) : 0)} y={ly} r={14} fill={C.red} seed={2} />
        <ContactShadow x={GX} y={0} />
        <Guy pose={g.pose} x={GX} y={0} t={t} sx={g.sx} sy={g.sy} rot={giggle} flip={!laughing} />
        {/* robot: base, arm, head with a face */}
        <Rope x0={250} y0={-150} x1={130} y1={-50} w={20} fill="#9AA4AE" />
        <Rope x0={130} y0={-50} x1={70} y1={-112} w={18} fill="#9AA4AE" />
        <Ball x={130} y={-50} r={20} fill="#7E8792" seed={6} />
        <Feather x={70} y={-112} rot={10 + fRot} />
        <Box x={280} y={-80} w={210} h={150} fill="#B7C0C9" shade="#9AA4AE" r={22} />
        <Box x={280} y={-235} w={170} h={130} fill="#B7C0C9" shade="#9AA4AE" r={26} />
        <Rope x0={280} y0={-300} x1={280} y1={-350} w={8} fill="#7E8792" />
        <Ball x={280} y={-362} r={16} fill={C.red} seed={7} />
        <ObjectFace x={280} y={-232} r={70} f={robotFace(t)} t={t} lidColor="#B7C0C9" />
        {[0, 1, 2].map((i) => <Star key={i} x={GX - 120 + i * 120} y={-380 + (i % 2) * 50} s={popIn(t, T.tickle + 0.1 + i * 0.08, 0.25)} rot={t * 120} />)}
      </Layer>
      <Badge text="+0.2 s delay" s={popIn(t, T.split, 0.3)} />
      <AbsoluteFill style={{transform: `translate(${shake(t, sh).x}px, 0)`, pointerEvents: 'none'}} />
    </>
  );
};

export const Tickle: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const sh = shake(t, hit(t, T.tickle, 7) + hit(t, T.brain, 3));
  const cues: Cue[] = [
    {f: 'crickets.mp3', at: 1.35, db: -24}, {f: 'pop.wav', at: T.nothing, db: -25}, {f: 'whoosh.wav', at: 1.6, db: -31},
    {f: 'pop.wav', at: T.right, db: -27}, {f: 'whoosh.wav', at: T.thats - 0.2, db: -30}, {f: 'pop.wav', at: T.brain, db: -18},
    {f: 'pop.wav', at: T.fingers, db: -26}, {f: 'pop.wav', at: T.going, db: -26}, {f: 'pop.wav', at: T.basically, db: -22},
    {f: 'whir.mp3', at: T.turns, db: -28}, {f: 'whoosh.wav', at: T.cut - 0.1, db: -28}, {f: 'whir.mp3', at: T.people, db: -31},
    {f: 'pop.wav', at: T.robot, db: -20}, {f: 'ding.mp3', at: T.split, db: -22}, {f: 'giggle.mp3', at: T.tickle - 0.04, db: -14},
    {f: 'twang.mp3', at: T.tickle, db: -27},
  ];
  return (
    <AbsoluteFill style={{background: C.wall, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.012)`}}>
        {t < T.cut ? <SceneOne t={t} /> : <SceneTwo t={t} />}
      </AbsoluteFill>
      <SoundLayer voice="tickle/vo/take1.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const TickleWide: React.FC = () => <WideFit.Provider value={0.72}><Tickle /></WideFit.Provider>;
