// Thumbnails for "What if you had a rabbit's eyes?" - the text adds the twist: a BLIND SPOT (pie in the face, ball caught behind).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil, WideFit} from './lib/kit';
import {RabbitScene} from './Rabbit';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const TB = 2.86;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><RabbitScene t={TB} thumb uid="th" camK={{x: 80, y: -200, k: 2.7}} /></Boil>
    <Title size={170} lines={['BLIND', 'SPOT']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <WideFit.Provider value={0.8}><Boil t={0}><RabbitScene t={TB} thumb uid="tw" camK={{x: 30, y: -200, k: 2.8}} /></Boil></WideFit.Provider>
    <Title size={140} lines={['BLIND', 'SPOT']} style={{right: 40, top: 140, textAlign: 'right'}} />
  </AbsoluteFill>
);
