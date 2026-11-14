// Thumbnails for "What if you had a mantis shrimp's punch?" - the frame-0 picture: his fist smashing the snail shell,
// the water around it boiling into bubbles.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {MantisScene} from './Mantis';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><MantisScene t={3.72} thumb /></Boil>
    <Title size={150} lines={['BOILING', 'FIST']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><MantisScene t={3.72} thumb /></Boil>
    <Title size={120} lines={['BOILING', 'FIST']} style={{left: 60, top: 70}} />
  </AbsoluteFill>
);
