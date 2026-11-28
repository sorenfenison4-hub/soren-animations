// Thumbnails for "What if you had a crab's claws?" - the text adds the catch to the title: SOFT CLAWS.
// The picture: the backfire at 2.36 s - his shocked face, the pale soft claw just out of the cracked red shell
// (still in the air above it), the smug coconut crab beside him.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {CrabScene} from './Crab';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const TB = 2.36;
const G = {sxB: 1, syB: 1, dB: 0.3, mood: 'pop' as const, look: [0.9, -0.4] as [number, number]};
const C = {mood: 'smug' as const, look: [-1, -0.4] as [number, number]};
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><CrabScene t={TB} thumb camK={{x: 36, y: -266, k: 2.6}} thumbG={G} thumbC={C} /></Boil>
    <Title size={190} lines={['SOFT', 'CLAWS']} style={{left: 0, right: 0, top: 120, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><CrabScene t={TB} thumb camK={{x: -10, y: -240, k: 2.4}} thumbG={G} thumbC={C} /></Boil>
    <Title size={110} lines={['SOFT', 'CLAWS']} style={{left: 30, top: 26, textAlign: 'left'}} />
  </AbsoluteFill>
);
