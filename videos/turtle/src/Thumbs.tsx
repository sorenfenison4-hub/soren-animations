// Thumbnails for "What if you had a turtle's shell?" - him in the shell, padlocked chest, purple face; the smug tortoise.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {TurtleScene} from './Turtle';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 3.0;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><TurtleScene t={tb} thumb camK={{x: -12, y: -160, k: 3.4}} /></Boil>
    <Title size={150} lines={["CAN'T", 'BREATHE']} style={{left: 0, right: 0, top: 110, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><TurtleScene t={tb} thumb camK={{x: -166, y: -165, k: 3.9}} /></Boil>
    <Title size={104} lines={["CAN'T", 'BREATHE']} style={{left: 44, top: 200}} />
  </AbsoluteFill>
);
