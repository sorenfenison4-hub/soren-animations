// Thumbnails for "3 animal riddles: can you guess all three?" - the guy with the X-ray lens (three hearts) and the
// octopus silhouette with its "?", text that adds to the title.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {RiddlesScene} from './Riddles';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 9.0;   // riddle 1 thinking: lens with three hearts, the octopus silhouette with its "?"
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><RiddlesScene t={tb} thumb camK={{x: 8, y: -150, k: 3.1}} /></Boil>
    <Title size={150} lines={['WHAT', 'AM I?']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><RiddlesScene t={tb} thumb camK={{x: 40, y: -135, k: 3.9}} /></Boil>
    <Title size={100} lines={['WHAT', 'AM I?']} style={{right: 40, top: 40, textAlign: 'right'}} />
  </AbsoluteFill>
);
