// Thumbnails for "What if you could regrow your arm like a lizard?" - the text adds the twist to the title: 0 BONES.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {LizScene} from './Lizard';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
// the new arm raised (smug), the old one lying on the sand, the lizard beside him
const TB = 1.38;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><LizScene t={TB} thumb uid="th" camK={{x: 32, y: -178, k: 2.5}} /></Boil>
    <Title size={176} lines={['0 BONES']} style={{left: 0, right: 0, top: 200, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><LizScene t={TB} thumb uid="tw" camK={{x: 30, y: -150, k: 2.85}} /></Boil>
    <Title size={118} lines={['0 BONES']} style={{right: 56, top: 52, textAlign: 'center'}} />
  </AbsoluteFill>
);
