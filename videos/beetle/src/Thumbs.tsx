// Thumbnails for "What if you had a dung beetle's strength?" - the CRUNCH moment: a tower of elephants on his hands, his
// spine shows through in an X-ray flash (cracks), the dung beetle laughs beside him with its ball held up. Text adds the
// scale to the title: 13 ELEPHANTS.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {BeetleScene} from './Beetle';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 2.3;   // just after the crunch: X-ray flash, the beetle laughing
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BeetleScene t={tb} thumb uid="th" camK={{x: -40, y: -330, k: 1.62}} /></Boil>
    <Title size={150} lines={['13', 'ELEPHANTS']} style={{left: 0, right: 0, top: 120, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BeetleScene t={tb} thumb uid="tw" camK={{x: 255, y: -300, k: 2.0}} /></Boil>
    <Title size={100} lines={['13', 'ELEPHANTS']} style={{right: 40, top: 170, textAlign: 'center'}} />
  </AbsoluteFill>
);
