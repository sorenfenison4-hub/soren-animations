// Thumbnails for "Why do zebras have stripes?" - from the video's own scene: the guy with his brush next to the cow he
// just painted like a zebra, flies circling it.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {ZebraScene, T} from './Zebra';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 2.4;   // last stripe going on, flies circling
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><ZebraScene t={tb} camK={{x: -40, y: -400, k: 1.3}} /></Boil>
    <Title size={150} lines={['FLY', 'PROOF']} style={{left: 0, right: 0, top: 160, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><ZebraScene t={tb} camK={{x: 60, y: -360, k: 1.15}} /></Boil>
    <Title size={120} lines={['FLY', 'PROOF']} style={{right: 50, top: 60, textAlign: 'right'}} />
  </AbsoluteFill>
);
