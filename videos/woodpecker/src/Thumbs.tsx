// Thumbnails for "What if you had a woodpecker's head?" - the guy with a beak and red crest slamming the trunk (BONK,
// dizzy stars), the smug woodpecker drumming on the other side.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {WoodScene} from './Woodpecker';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 0.05;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><WoodScene t={tb} thumb camK={{x: -45, y: -230, k: 2.75}} /></Boil>
    <Title size={150} lines={['ONE PECK', 'K.O.']} style={{left: 0, right: 0, top: 170, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><WoodScene t={tb} thumb camK={{x: -50, y: -250, k: 2.9}} /></Boil>
    <Title size={96} lines={['ONE PECK', 'K.O.']} style={{left: 40, top: 40, textAlign: 'left'}} />
  </AbsoluteFill>
);
