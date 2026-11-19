// Thumbnails for "What if you could turn see-through like a glass frog?" - see-through him (heart + mirror liver), the
// toucan BONKing into his chest, the smug glass frog.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {GlassScene} from './GlassFrog';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 2.66;   // see-through, pale, eyes wide: just before he passes out
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><GlassScene t={tb} thumb uid="th" camK={{x: 5, y: -200, k: 3.25}} /></Boil>
    <Title size={150} lines={["YOU'D", 'FAINT']} style={{left: 0, right: 0, top: 110, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><GlassScene t={tb} thumb uid="tw" camK={{x: -40, y: -200, k: 3.6}} /></Boil>
    <Title size={100} lines={["YOU'D", 'FAINT']} style={{left: 44, top: 190}} />
  </AbsoluteFill>
);
