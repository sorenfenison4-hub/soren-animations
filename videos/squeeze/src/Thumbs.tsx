// Thumbnails for "What if you could squeeze like an octopus?" - the text adds the twist: 0 BONES (he is a puddle).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil, WideFit} from './lib/kit';
import {SqueezeScene} from './Squeeze';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
// him melted into a puddle in front of the door, the smug octopus beside him
const TB = 3.0;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><SqueezeScene t={TB} thumb uid="th" camK={{x: 40, y: -150, k: 3.0}} /></Boil>
    <Title size={170} lines={['0', 'BONES']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <WideFit.Provider value={0.8}><Boil t={0}><SqueezeScene t={TB} thumb uid="tw" camK={{x: 150, y: -130, k: 2.6}} /></Boil></WideFit.Provider>
    <Title size={150} lines={['0 BONES']} style={{right: 40, top: 60, textAlign: 'right'}} />
  </AbsoluteFill>
);
