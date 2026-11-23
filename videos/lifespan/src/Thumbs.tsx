// Thumbnails for "What if you lived as long as these animals?" - him ancient with a beard to the floor, the jellyfish bell on his head.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil, WideFit} from './lib/kit';
import {LifeScene} from './Lifespan';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const TB = 12.6;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><LifeScene t={TB} thumb uid="th" camK={{x: 105, y: -250, k: 2.15}} /></Boil>
    <Title size={170} lines={['AGE', '∞']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <WideFit.Provider value={0.8}><Boil t={0}><LifeScene t={TB} thumb uid="tw" camK={{x: 70, y: -300, k: 2.1}} /></Boil></WideFit.Provider>
    <Title size={150} lines={['AGE ∞']} style={{right: 40, bottom: 40, textAlign: 'right'}} />
  </AbsoluteFill>
);
