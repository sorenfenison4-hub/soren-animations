// Thumbnails for "What if you could clone yourself like a starfish?" - the text adds the catch to the title: TORN IN HALF.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {StarScene} from './Starfish';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
// his two halves just after the POP (one eye, half a mouth each), the smug starfish on its rock beside them
const TB = 3.1;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><StarScene t={TB} thumb uid="th" camK={{x: -40, y: -174, k: 2.6}} /></Boil>
    <Title size={170} lines={['TORN', 'IN HALF']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><StarScene t={TB} thumb uid="tw" camK={{x: -159, y: -205, k: 3.0}} /></Boil>
    <Title size={118} lines={['TORN', 'IN HALF']} style={{left: 56, top: 190, textAlign: 'left'}} />
  </AbsoluteFill>
);
