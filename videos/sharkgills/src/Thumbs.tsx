// Thumbnails for "What if you could breathe like a shark?" - the text adds the catch to the title: NEVER STOP.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {GillScene} from './SharkGills';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
// the choke close-up: blue face, puffed cheeks, gills fluttering, hands on his throat - the smug great white right below him
const TB = 3.05;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><GillScene t={TB} thumb uid="th" camK={{x: 33, y: -58, k: 3.0}} thumbShark={[-29, 34]} /></Boil>
    <Title size={170} lines={['NEVER', 'STOP']} style={{left: 0, right: 0, top: 120, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><GillScene t={TB} thumb uid="tw" camK={{x: -69, y: -140, k: 3.1}} thumbShark={[80, 10]} /></Boil>
    <Title size={130} lines={['NEVER', 'STOP']} style={{left: 60, top: 170, textAlign: 'left'}} />
  </AbsoluteFill>
);
