// Thumbnails for "What if you had a shark's teeth?" - the guy yanking back from the apple, his shark teeth stuck in it, the smug shark.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {SharkScene} from './Shark';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 2.95;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><SharkScene t={tb} thumb camK={{x: -38, y: -215, k: 2.62}} /></Boil>
    <Title size={130} lines={['ONE BITE', '= GONE']} style={{left: 0, right: 0, top: 90, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><SharkScene t={tb} thumb camK={{x: 20, y: -250, k: 2.3}} /></Boil>
    <Title size={92} lines={['ONE BITE', '= GONE']} style={{right: 40, top: 40, textAlign: 'right'}} />
  </AbsoluteFill>
);
