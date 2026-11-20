// Thumbnails for "What if you could drink like a camel?" - his head ballooning (water poisoning), belly full of water,
// hands on his head, the smug camel drinking next to him. Text adds to the title: BRAIN SWELLS.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {CamelScene} from './Camel';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 2.5;   // head ballooned, eyes bulging, hands on his head
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><CamelScene t={tb} thumb uid="th" camK={{x: -30, y: -183, k: 3.1}} /></Boil>
    <Title size={150} lines={['BRAIN', 'SWELLS']} style={{left: 0, right: 0, top: 120, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><CamelScene t={tb} thumb uid="tw" camK={{x: -140, y: -185, k: 3.4}} /></Boil>
    <Title size={104} lines={['BRAIN', 'SWELLS']} style={{left: 40, top: 190}} />
  </AbsoluteFill>
);
