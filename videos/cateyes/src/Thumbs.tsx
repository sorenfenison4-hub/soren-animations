// Thumbnails for "What if you had a cat's eyes?" - the text adds the catch to the title: BLURRY BY DAY.
// The picture: the dark room close-up from frame 0 - his huge glowing cat eyes, grinning, the yarn ball in his hand,
// beside the smug cat with its own glowing eyes.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {CatScene} from './Cat';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const TB = 0.7;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><CatScene t={TB} thumb uid="th" camK={{x: 22, y: -140, k: 3.2}} thumbG={{mood: 'joy', look: [0.4, -0.2]}} thumbC={{mood: 'smug', look: [-0.8, 0]}} /></Boil>
    <Title size={176} lines={['BLURRY', 'BY DAY']} style={{left: 0, right: 0, top: 110, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><CatScene t={TB} thumb uid="tw" camK={{x: -70, y: -175, k: 3.9}} thumbG={{mood: 'joy', look: [0.4, -0.2]}} thumbC={{mood: 'smug', look: [-0.8, 0]}} /></Boil>
    <Title size={110} lines={['BLURRY', 'BY DAY']} style={{left: 40, top: 196, textAlign: 'left'}} />
  </AbsoluteFill>
);
