// Thumbnails for "What if you could land like a cat?" - the text adds the catch to the title: CHIN FIRST.
// The picture: the backfire close-up - his face flat on the pavement with cracks round his chin, the smug cat looking down.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil, WideFit} from './lib/kit';
import {CatScene} from './CatLand';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const TB = 2.5;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><CatScene t={TB} thumb camK={{x: -45, y: -128, k: 3.3}} /></Boil>
    <Title size={190} lines={['CHIN', 'FIRST']} style={{left: 0, right: 0, top: 120, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <WideFit.Provider value={0.9}><Boil t={0}><CatScene t={TB} thumb camK={{x: -130, y: -96, k: 2.9}} /></Boil></WideFit.Provider>
    <Title size={150} lines={['CHIN', 'FIRST']} style={{left: 40, top: 60, textAlign: 'left'}} />
  </AbsoluteFill>
);
