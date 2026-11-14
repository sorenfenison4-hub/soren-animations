// Thumbnails for "What if you woke up with wings?" - the frame-0 picture: wings spread, bonked into the ceiling,
// birds watching through the window.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil, WideFit} from './lib/kit';
import {WingsScene} from './Wings';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><WingsScene t={0.03} thumb /></Boil>
    <Title size={170} lines={['OUCH']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <WideFit.Provider value={0.46}><Boil t={0}><WingsScene t={0.03} thumb dy={-70} /></Boil></WideFit.Provider>
    <Title size={140} lines={['OUCH']} style={{left: 100, top: 470}} />
  </AbsoluteFill>
);
