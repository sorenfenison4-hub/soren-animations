// TEMPLATE: copy this file for each new video. It shows every kit piece in an 8-second gag:
// a rock falls next to the guy, he gets scared, the rock opens its eyes, looks smug, and they both laugh.
// Replace T, the camera keys, the scene and the cues; drop the voice in public/<short>/vo/take1.mp3.
// Every video ends with LoopOut: the last frame is the opening frame again, so the Short loops seamlessly.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, Layer, camAt, Sky, Ground, Guy, swap, ContactShadow, Ball, ObjectFace, FACE0, Face, Puffs, Star, Badge,
  SoundLayer, Cue, arcY, seg, popIn, spring, shake, hit, lerp, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle, CommentAsk} from './lib/kit';

// with a voice: DURATION = voice end + LOOP_DUR + ~0.3 s, so the loop push starts after the last word
export const DURATION = 8;
// every beat as a constant (from the voice's word times)
// hook: something already moves in the first 0.3 s and the voice starts at 0.1 s (first word by 0.2 s)
const T = {fall: 0.3, land: 1.0, eyes: 1.7, smug: 2.5, wow: 2.6, pull: 3.5, laugh: 4.3, cta: 4.85};

const rockFace = (t: number): Face => {
  if (t < T.eyes) return {...FACE0, open: 0, mouth: 'none'};
  const f: Face = {...FACE0, open: popIn(t, T.eyes), lx: -1, mouth: 'flat'};
  if (t > T.smug) { f.lid = 0.45; f.mouth = 'smile'; f.brow = -6; }
  if (t > T.laugh) { f.lid = 0; f.mouth = 'grin'; f.squeeze = 1; }
  return f;
};

// the whole picture as a function of time, so LoopOut can draw the opening shot (t = 0) at the end
export const TemplateScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([
    {t: 0, x: 0, y: -260, k: 1.5}, {t: T.pull, x: 0, y: -260, k: 1.5},
    {t: T.pull + 1.2, x: 120, y: -320, k: 0.95}, {t: DURATION, x: 120, y: -330, k: 0.92},
  ], t);
  // guy: calm -> scared on the landing -> surprised -> laughing
  let g = swap(t, T.land + 0.05, 'front_calm', 'scared');
  if (t >= T.wow) g = swap(t, T.wow, 'scared', 'surprised');
  if (t >= T.laugh) g = swap(t, T.laugh, 'surprised', 'laugh');
  // rock: gravity arc from the sky to the ground, then a squash on landing
  const R = 90, X0 = 380, X1 = 190;
  const fy = arcY(-2600, -R, T.land - T.fall, 0.01);
  const tau = clamp01(t - T.fall);
  const rx = t < T.land ? lerp(X0, X1, (t - T.fall) / (T.land - T.fall)) : X1;
  const ry = t < T.fall ? -5000 : t < T.land ? fy(tau) : -R;
  const sq = 1 + spring(t, T.land, -0.18, 3, 7);
  const sh = shake(t, hit(t, T.land, 12));
  const dof = 2.8 * (1 - seg(t, T.pull, T.pull + 0.8));
  return (
    <AbsoluteFill style={{background: '#B7E0FF', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.012)`}}>
        <Sky />
        <Layer cam={cam} z={3000} blur={dof}>
          <Ball x={-700} y={-60} r={260} fill="#9CCB7A" shade="#86B866" seed={9} />
          <Ball x={900} y={-40} r={340} fill="#9CCB7A" shade="#86B866" seed={11} />
          <Ground y={0} color="#C9E3A8" />
        </Layer>
        <Layer cam={cam} z={1000}>
          <Ground y={0} line={false} color="#C9E3A8" />
          <ContactShadow x={-60} y={0} />
          <Guy pose={g.pose} x={-60} y={0} t={t} sx={g.sx} sy={g.sy} tremble={t > T.land && t < T.wow ? 1 : 0} />
          {/* landing dust: two small puffs kicked out to the sides, drawn behind the rock */}
          <Puffs t={t} born={T.land} x={X1 - R * 0.8} y={-16} n={4} life={0.7} size={24} vx={-170} vy={-50} color="#EDE6DA" seed={5} />
          <Puffs t={t} born={T.land} x={X1 + R * 0.8} y={-16} n={4} life={0.7} size={24} vx={170} vy={-50} color="#EDE6DA" seed={8} />
          <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: `${rx}px ${ry + R}px`, transform: `scale(${2 - sq}, ${sq})`}}>
            <Ball x={rx} y={ry} r={R} fill="#A39A90" shade="#8A8178" wobble={0.12} rot={t < T.land ? t * 400 : 0} seed={4} />
            <ObjectFace x={rx} y={ry} r={R} f={rockFace(t)} t={t} lidColor="#A39A90" />
          </div>
          {[0, 1, 2].map((i) => <Star key={i} x={X1 - 120 + i * 120} y={-300 - (i % 2) * 60} s={popIn(t, T.laugh + i * 0.08, 0.25) * (1 - seg(t, T.laugh + 1.2, T.laugh + 1.5))} rot={t * 90} />)}
        </Layer>
        <Badge text="TEMPLATE" s={popIn(t, T.pull + 0.6) * (1 - seg(t, DURATION - LOOP_DUR - 0.35, DURATION - LOOP_DUR - 0.1))} />
      </AbsoluteFill>
      {/* every video: big hook text, on screen at frame 0, gone by ~2 s (sound-off viewers read the question) */}
      <HookTitle t={t} text="WHAT IF A ROCK HAD EYES?" hi="EYES" />
      {/* every video: like / subscribe / comment once, after the answer lands, gone before the loop push */}
      <CallToAction t={t} at={T.cta} y={430} />
      <CommentAsk t={t} at={6.6} until={7.4} text="What should the rock do next?" />
    </AbsoluteFill>
  );
};

export const Template: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    {f: 'whoosh.wav', at: T.fall, db: -24}, {f: 'pop.wav', at: T.land, db: -12}, {f: 'twang.mp3', at: T.land, db: -22},
    {f: 'pop.wav', at: T.eyes, db: -20}, {f: 'ding.mp3', at: T.laugh, db: -20},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26}, // the loop push back to the opening shot
  ];
  return (
    <AbsoluteFill style={{background: '#B7E0FF', overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<TemplateScene t={0} />}>
        <TemplateScene t={t} />
      </LoopOut>
      {/* every video: "comment your question" sticker for the whole video, outside LoopOut so it never moves */}
      <Look />
      <SoundLayer cues={cues} />
    </AbsoluteFill>
  );
};
const clamp01 = (v: number) => Math.max(0, Math.min(10, v));
export const TemplateWide: React.FC = () => <WideFit.Provider value={0.72}><Template /></WideFit.Provider>;
