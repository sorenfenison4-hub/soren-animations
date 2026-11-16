// Thumbnails for "What if you had an eel's shock or an axolotl's healing?" - the frame-0 picture: him with 860 V
// crackling between his hands, her with axolotl gills and a freshly regrown leg; "WHO WINS?" on top.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {EelScene} from './EelAxo';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 0.7;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><EelScene t={tb} thumb camK={{x: -5, y: -215, k: 2.2}} /></Boil>
    <Title size={150} lines={['WHO', 'WINS?']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><EelScene t={tb} thumb camK={{x: -185, y: -175, k: 2.75}} /></Boil>
    <Title size={104} lines={['WHO', 'WINS?']} style={{left: 50, top: 60, textAlign: 'left'}} />
  </AbsoluteFill>
);
