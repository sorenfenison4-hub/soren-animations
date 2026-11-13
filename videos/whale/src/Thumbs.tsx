// Thumbnails for "What if a whale swallowed you like Jonah?" - the frame-0 picture: the guy stuck in the humpback's
// clamping jaws, splash at the waterline.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {WhaleScene} from './Whale';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><WhaleScene t={0.25} thumb /></Boil>
    <Title size={150} lines={['NOW', 'WHAT?']} style={{left: 0, right: 0, top: 110, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><WhaleScene t={0.25} thumb /></Boil>
    <Title size={120} lines={['NOW', 'WHAT?']} style={{left: 60, top: 70}} />
  </AbsoluteFill>
);
