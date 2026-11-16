// Thumbnails for "What if you had a frog's eyes?" - the guy mid-gulp with his frog eyes sinking into his head, the
// smug frog beside him, text that adds to the title.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {FrogScene} from './Frog';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 0.05;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><FrogScene t={tb} thumb camK={{x: -20, y: -230, k: 2.75}} /></Boil>
    <Title size={150} lines={['EYES', 'IN MOUTH']} style={{left: 0, right: 0, top: 200, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><FrogScene t={tb} thumb camK={{x: -60, y: -250, k: 2.9}} /></Boil>
    <Title size={96} lines={['EYES', 'IN MOUTH']} style={{left: 40, top: 40, textAlign: 'left'}} />
  </AbsoluteFill>
);
