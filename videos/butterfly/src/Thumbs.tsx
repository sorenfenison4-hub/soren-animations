// Thumbnails for "What if you could turn into a butterfly?" - the text adds the twist to the title: SOUP FIRST.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {BflyScene} from './Butterfly';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
// him flying on monarch wings (frame 0), the smug monarch beside him
const TB = 0.0;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BflyScene t={TB} thumb uid="th" camK={{x: 572, y: -268, k: 2.55}} /></Boil>
    <Title size={170} lines={['SOUP', 'FIRST']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BflyScene t={TB} thumb uid="tw" camK={{x: 680, y: -290, k: 3.3}} /></Boil>
    <Title size={120} lines={['SOUP', 'FIRST']} style={{right: 60, top: 60, textAlign: 'center'}} />
  </AbsoluteFill>
);
