// Thumbnails for "Why can't you sleep the first night in a hotel?" - from the video's own scene: the guy wide awake in the
// moonlit hotel bed at 3 AM, eyes snapped open by the ice machine, the clock glowing next to him.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {HotelScene, T} from './Hotel';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = T.ice + 0.35;   // eyes snapped wide, '!' over his head
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><HotelScene t={tb} camK={{x: -390, y: -470, k: 2.0}} /></Boil>
    <Title size={150} lines={['3 AM.', 'AGAIN.']} style={{left: 0, right: 0, top: 170, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><HotelScene t={tb} camK={{x: -330, y: -470, k: 1.55}} /></Boil>
    <Title size={120} lines={['3 AM.', 'AGAIN.']} style={{right: 50, top: 70, textAlign: 'right'}} />
  </AbsoluteFill>
);
