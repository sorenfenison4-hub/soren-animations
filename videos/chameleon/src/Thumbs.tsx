// Thumbnails for "What if you had a chameleon's eyes?" - the guy with two green turret eyes pointing apart, each on its
// own fly, the smug chameleon beside him doing the same.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {ChamScene} from './Chameleon';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 1.05;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><ChamScene t={tb} thumb camK={{x: 92, y: -228, k: 3.3}} /></Boil>
    <Title size={150} lines={['SEES', 'DOUBLE']} style={{left: 0, right: 0, top: 170, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><ChamScene t={tb} thumb camK={{x: 110, y: -255, k: 2.6}} /></Boil>
    <Title size={96} lines={["SEES", "DOUBLE"]} style={{left: 40, top: 40, textAlign: 'left'}} />
  </AbsoluteFill>
);
