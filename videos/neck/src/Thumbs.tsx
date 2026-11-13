// Thumbnails for "What if you woke up with a giraffe's neck?" - from the video's own scene: the guy standing with his
// 2 m neck next to the giraffe, the x-ray showing his blood stalling halfway up.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {NeckScene, T} from './Neck';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = T.giraffe + 1.6;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><NeckScene t={tb} camK={{x: 520, y: -640, k: 1.0}} /></Boil>
    <Title size={140} lines={['LIGHTS', 'OUT']} style={{left: 0, right: 0, top: 120, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><NeckScene t={tb} camK={{x: 600, y: -640, k: 1.0}} /></Boil>
    <Title size={110} lines={['LIGHTS', 'OUT']} style={{left: 50, top: 60}} />
  </AbsoluteFill>
);
