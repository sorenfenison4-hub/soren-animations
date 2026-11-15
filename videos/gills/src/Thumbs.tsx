// Thumbnails for "What if you had a fish's gills?" - the guy big underwater with red gills flapping, gasping, the smug
// fish beside him.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {GillsScene} from './Gills';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 0.3;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><GillsScene t={tb} thumb camK={{x: 15, y: -175, k: 3.0}} /></Boil>
    <Title size={150} lines={['STILL', 'DROWNS']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><GillsScene t={tb} thumb camK={{x: -95, y: -250, k: 3.3}} /></Boil>
    <Title size={120} lines={['STILL', 'DROWNS']} style={{left: 40, top: 230, textAlign: 'left'}} />
  </AbsoluteFill>
);
