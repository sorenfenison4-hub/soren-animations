// Thumbnails for "What if you had a polar bear's fur?" - the text adds the twist to the title: TOO HOT.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil, WideFit} from './lib/kit';
import {PolarScene} from './PolarBear';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
// him in the fur, red-hot and steaming, the smug polar bear beside him
const TB = 2.62;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><PolarScene t={TB} thumb uid="th" camK={{x: 30, y: -256, k: 3.05}} /></Boil>
    <Title size={170} lines={['TOO', 'HOT']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <WideFit.Provider value={0.8}><Boil t={0}><PolarScene t={TB} thumb uid="tw" camK={{x: 96, y: -258, k: 3.3}} /></Boil></WideFit.Provider>
    <Title size={150} lines={['TOO HOT']} style={{right: 40, bottom: 34, textAlign: 'right'}} />
  </AbsoluteFill>
);
