// Thumbnails for "What if you had an owl's eyes?" - the guy with huge owl eyes, head whipping after the fly, the owl
// beside him with its head turned right round.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {OwlScene} from './Owl';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 0.45;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><OwlScene t={tb} thumb camK={{x: 118, y: -215, k: 2.75}} /></Boil>
    <Title size={150} lines={['NO', 'EYEBALLS']} style={{left: 0, right: 0, top: 170, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><OwlScene t={tb} thumb camK={{x: -45, y: -262, k: 2.95}} /></Boil>
    <Title size={104} lines={['NO', 'EYE-', 'BALLS']} style={{left: 50, top: 150, textAlign: 'left'}} />
  </AbsoluteFill>
);
