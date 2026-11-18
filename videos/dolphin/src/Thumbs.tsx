// Thumbnails for "What if you had a dolphin's blowhole?" - the guy blasting a geyser out of the blowhole on his head,
// the smug half-asleep dolphin beside him, text that adds to the title.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {DolphinScene} from './Dolphin';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 0.12;   // geyser at full height
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><DolphinScene t={tb} thumb camK={{x: -20, y: -288, k: 2.4}} /></Boil>
    <Title size={130} lines={['NEVER', 'SLEEP']} style={{left: 0, right: 0, top: 110, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><DolphinScene t={0.4} thumb camK={{x: -30, y: -327, k: 2.5}} /></Boil>
    <Title size={92} lines={['NEVER', 'SLEEP']} style={{right: 60, top: 30, textAlign: 'right'}} />
  </AbsoluteFill>
);
