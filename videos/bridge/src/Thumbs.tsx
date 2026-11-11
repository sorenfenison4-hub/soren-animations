// Thumbnails for "Why does his bridge get longer every year?" - built from the video's own scene: the guy and his
// neighbour (red bobble hat) clinking coffee mugs in the middle of the tiny bridge over the crack between the plates.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {BridgeScene, T} from './Bridge';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tc = T.coffee + 0.6;   // mugs up, clinking
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BridgeScene t={tc} camK={{x: 0, y: -150, k: 2.3}} /></Boil>
    <Title size={140} lines={['TWO', 'CONTINENTS']} style={{left: 0, right: 0, top: 130, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BridgeScene t={tc} camK={{x: -390, y: -190, k: 1.75}} /></Boil>
    <Title size={112} lines={['TWO', 'CONTINENTS']} style={{left: 40, top: 70}} />
  </AbsoluteFill>
);
