// Thumbnails for "What if you had a piranha's teeth?" - the text adds the catch to the title: HALF GONE.
// The picture: the backfire at 2.2 s - his shocked face, every tooth on the left side falling out as one piece, the
// coconut halves on the table, the smug piranha in its bowl beside him.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {PiranhaScene} from './Piranha';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const TB = 2.27;
const P_SMUG = {mood: 'smug' as const, look: [-1, 0] as [number, number]};
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><PiranhaScene t={TB} thumb camK={{x: -80, y: -104, k: 3.1}} thumbP={P_SMUG} /></Boil>
    <Title size={200} lines={['HALF', 'GONE']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><PiranhaScene t={TB} thumb camK={{x: -205, y: -60, k: 3.4}} thumbP={P_SMUG} /></Boil>
    <Title size={150} lines={['HALF', 'GONE']} style={{left: 50, top: 170, textAlign: 'left'}} />
  </AbsoluteFill>
);
