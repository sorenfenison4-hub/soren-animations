// Thumbnails for "Why has Roman concrete lasted 2,000 years?" - built from the video's own pieces: the Roman concrete
// block (laurel wreath, smug face) with its crack healing white and sparkling, the guy pointing at it, yellow +
// black-outlined Inter 900 text.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Guy, FACE0, Star, Boil, Pose} from './lib/kit';
import {RomanBlock, CRACK_A, SAND} from './Concrete';

const Title: React.FC<{size: number; style: React.CSSProperties}> = ({size, style}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 1.0, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    IT HEALS<br />ITSELF
  </div>
);
const Scaled: React.FC<{x: number; y: number; s: number; children: React.ReactNode}> = ({x, y, s, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${s})`}}>{children}</div>
);
const Paper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#FBF7EC', overflow: 'hidden'}}><Boil t={0}><AbsoluteFill>{children}</AbsoluteFill></Boil></AbsoluteFill>
);
const GroundBand: React.FC<{y: number}> = ({y}) => (
  <div style={{position: 'absolute', left: -100, right: -100, top: y, bottom: -100, background: SAND, borderTop: `7px solid ${INK}`}} />
);
const smug = {...FACE0, lid: 0.38, mouth: 'smile' as const, brow: -6, lx: -0.45};
/** the block with its crack half healed (white filling it from the top) and sparkles; origin = centre of its base */
const HealingBlock: React.FC = () => (
  <>
    <div style={{position: 'absolute', left: -215, top: -13, width: 430, height: 26, borderRadius: '50%', background: 'rgba(72,54,42,0.26)', filter: 'blur(3px)'}} />
    <RomanBlock x={0} t={0} f={smug} cracks={[{pts: CRACK_A, p: 1, lime: 0.62}]} />
    {([[0, -40, -14, 0.8], [3, 30, 0, 0.7], [6, 34, 4, 0.85]] as const).map(([k, dx, dy, s], i) =>
      <Star key={i} x={CRACK_A[k][0] + dx} y={CRACK_A[k][1] + dy} s={s} rot={i * 25} />)}
  </>
);
const GuyAt: React.FC<{x: number; feet: number; s: number; pose: Pose}> = ({x, feet, s, pose}) => (
  <Scaled x={x} y={feet} s={s}>
    <div style={{position: 'absolute', left: -60, top: -13, width: 120, height: 26, borderRadius: '50%', background: 'rgba(72,54,42,0.26)', filter: 'blur(3px)'}} />
    <Guy pose={pose} x={0} y={0} t={0} breathe={false} />
  </Scaled>
);

// Shorts cover: text in the top band, faces inside the top three quarters (the shelf covers the bottom)
export const ThumbTall: React.FC = () => (
  <Paper>
    <GroundBand y={1352} />
    <Scaled x={650} y={1400} s={1.78}><HealingBlock /></Scaled>
    <GuyAt x={185} feet={1430} s={1.55} pose="point_right" />
    <Title size={205} style={{left: 0, right: 0, top: 70, textAlign: 'center'}} />
  </Paper>
);
// wide: title top left, the guy under it pointing right, the block big on the right (clear of the hole punches)
export const ThumbWide: React.FC = () => (
  <Paper>
    <GroundBand y={662} />
    <Scaled x={935} y={688} s={1.16}><HealingBlock /></Scaled>
    <GuyAt x={310} feet={700} s={1.22} pose="point_right" />
    <Title size={112} style={{left: 120, top: 34, textAlign: 'left'}} />
  </Paper>
);
