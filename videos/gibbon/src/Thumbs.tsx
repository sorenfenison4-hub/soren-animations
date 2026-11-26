// Thumbnails for "What if you could swing like a gibbon?" - the text adds the catch to the title: BONES SNAP.
// The picture: frame 0's swing - him grinning on long furry gibbon arms under the bough, the smug gibbon swinging beside him.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {GibbonScene} from './Gibbon';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const TB = 0.55, BRY = -1150;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><GibbonScene t={TB} thumb camK={{x: -150, y: BRY + 150, k: 2.75}} thumbG={{mood: 'joy', look: [0.6, -0.4]}} thumbC={{mood: 'smug', look: [-1, 0.2]}} /></Boil>
    <Title size={178} lines={['BONES', 'SNAP']} style={{left: 0, right: 0, top: 96, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><GibbonScene t={TB} thumb camK={{x: -322, y: BRY + 98, k: 3.2}} thumbG={{mood: 'joy', look: [0.6, -0.4]}} thumbC={{mood: 'smug', look: [-1, 0.2]}} /></Boil>
    <Title size={128} lines={['BONES', 'SNAP']} style={{left: 46, top: 200, textAlign: 'left'}} />
  </AbsoluteFill>
);
