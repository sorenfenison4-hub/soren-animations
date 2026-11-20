// Thumbnails for "What if you had a bat's wings?" - him flying with huge bat wings (his own white finger bones in them),
// grinning, the smug bat hanging beside him, a big moon. Text adds to the title: NO HANDS.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {BatScene} from './BatWings';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 0;   // frame 0: wings up, grinning
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BatScene t={tb} thumb uid="th" camK={{x: 30, y: -448, k: 2.45}} /></Boil>
    <Title size={170} lines={['NO', 'HANDS']} style={{left: 0, right: 0, top: 110, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BatScene t={tb} thumb uid="tw" camK={{x: -10, y: -400, k: 2.6}} /></Boil>
    <Title size={120} lines={['NO', 'HANDS']} style={{left: 50, top: 170}} />
  </AbsoluteFill>
);
