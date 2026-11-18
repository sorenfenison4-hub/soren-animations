// Thumbnails for "What if you had an octopus's arms?" - the guy with eight arms grabbing everything, the smug octopus.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {OctopusScene} from './Octopus';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 0.9;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><OctopusScene t={tb} thumb camK={{x: 5, y: -300, k: 2.5}} /></Boil>
    <Title size={130} lines={['8 ARMS', '8 BOSSES']} style={{left: 0, right: 0, top: 90, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><OctopusScene t={tb} thumb camK={{x: 60, y: -215, k: 2.2}} /></Boil>
    <Title size={80} lines={['8 ARMS', '8 BOSSES']} style={{left: 36, top: 26}} />
  </AbsoluteFill>
);
