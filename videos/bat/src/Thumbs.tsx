// Thumbnails for "What if you had a bat's ears?" - the guy screaming with huge bat ears, sonar rings, the smug bat.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {BatScene} from './Bat';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 0.35;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BatScene t={tb} thumb camK={{x: -10, y: -290, k: 2.55}} /></Boil>
    <Title size={130} lines={["SCREAM", "TO SEE"]} style={{left: 0, right: 0, top: 90, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BatScene t={tb} thumb camK={{x: 40, y: -330, k: 2.4}} /></Boil>
    <Title size={92} lines={['SCREAM', 'TO SEE']} style={{right: 50, top: 40, textAlign: 'right'}} />
  </AbsoluteFill>
);
