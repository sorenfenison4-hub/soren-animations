// Thumbnails for "What if you had a gecko's feet?" - the guy sliding down the wall on green gecko pads, the smug gecko beside him.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {GeckoScene} from './Gecko';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 1.2;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><GeckoScene t={tb} thumb camK={{x: 120, y: -800, k: 2.05}} /></Boil>
    <Title size={170} lines={['TOO', 'HEAVY']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><GeckoScene t={tb} thumb camK={{x: 290, y: -820, k: 2.15}} /></Boil>
    <Title size={120} lines={['TOO', 'HEAVY']} style={{right: 60, top: 220, textAlign: 'right'}} />
  </AbsoluteFill>
);
