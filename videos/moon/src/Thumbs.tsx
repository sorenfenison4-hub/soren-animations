// Thumbnails for "Why is the Moon drifting away from Earth?" - built from the video's own pieces:
// the Moon with its face drifting off, the guy waving bye from the top of his little Earth, yellow + black Inter 900 text.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, FACE0, Arrow, Star, Boil, W} from './lib/kit';
import {Earth, Moon} from './Moon';

const Title: React.FC<{size: number; style: React.CSSProperties}> = ({size, style}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 1.04, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    BYE<br />MOON?
  </div>
);
const Scaled: React.FC<{x: number; y: number; s: number; children: React.ReactNode}> = ({x, y, s, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${s})`}}>{children}</div>
);
const wave = {pose: 'front_wave' as const, sx: 1, sy: 1};
const face = {...FACE0, lx: -0.7, ly: 0.6, mouth: 'grin' as const, brow: -8};
const Dashes: React.FC<{d: string}> = ({d}) => <W><path d={d} stroke={INK} strokeWidth={8} strokeDasharray="24 24" fill="none" strokeLinecap="round" strokeOpacity={0.6} /></W>;
const Paper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#FBF7EC', overflow: 'hidden'}}><Boil t={0}><AbsoluteFill>{children}</AbsoluteFill></Boil></AbsoluteFill>
);

// Shorts cover: text in the top band, faces inside the top three quarters (the shelf covers the bottom)
export const ThumbTall: React.FC = () => (
  <Paper>
    <Scaled x={0} y={0} s={1}>{[[90, 560], [990, 420], [140, 1000], [960, 1150], [520, 470]].map(([x, y], i) => <Star key={i} x={x} y={y} s={0.9} rot={i * 25} />)}</Scaled>
    {/* Earth: top of the planet at y ~1390, the guy waving on it */}
    <Scaled x={430} y={1390 + 520 * 1.5} s={1.5}><Earth t={0.3} spin={0} bulge={0.25} axis={60} pose={wave} /></Scaled>
    <Scaled x={0} y={0} s={1}><Dashes d="M 560 1180 Q 700 1000 760 860" /></Scaled>
    <Scaled x={720 - 720 * 1.45} y={760 - 760 * 1.45} s={1.45}><Moon x={720} y={760} t={0} f={face} /></Scaled>
    <Scaled x={0} y={0} s={1}><Arrow x={990} y={520} s={1.6} rot={-150} /></Scaled>
    <Title size={230} style={{left: 0, right: 0, top: 70, textAlign: 'center'}} />
  </Paper>
);
export const ThumbWide: React.FC = () => (
  <Paper>
    <Scaled x={0} y={0} s={1}>{[[620, 90], [1200, 640], [560, 650], [80, 80]].map(([x, y], i) => <Star key={i} x={x} y={y} s={0.6} rot={i * 25} />)}</Scaled>
    <Scaled x={250} y={590 + 520 * 0.95} s={0.95}><Earth t={0.3} spin={0} bulge={0.25} axis={60} pose={wave} /></Scaled>
    <Scaled x={0} y={0} s={1}><Dashes d="M 360 430 Q 480 300 560 260" /></Scaled>
    <Scaled x={690 - 690 * 1.05} y={250 - 250 * 1.05} s={1.05}><Moon x={690} y={250} t={0} f={face} /></Scaled>
    <Scaled x={0} y={0} s={1}><Arrow x={880} y={140} s={1.1} rot={-120} /></Scaled>
    <Title size={150} style={{right: 40, top: 340, textAlign: 'right'}} />
  </Paper>
);
