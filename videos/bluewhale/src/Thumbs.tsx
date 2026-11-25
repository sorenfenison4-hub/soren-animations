// Thumbnails for "What if you were as big as a blue whale?" - the text adds the catch to the title: LEGS SNAP.
// The picture: the second step on the beach - an X-ray flash shows both leg bones cracking (red), his face OUCH, the tiny
// beach town at his feet, and the smug blue whale standing up out of the sea beside him at the same height.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {WhaleScene} from './Whale';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const TB = 2.18;
const WHALE = {x: 10, y: -153, rot: -90, mood: 'smug' as const, fin: -40, mouth: 0};
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><WhaleScene t={TB} thumb uid="th" camK={{x: 100, y: -128, k: 2.75}} thumbWhale={WHALE} /></Boil>
    <Title size={170} lines={['LEGS', 'SNAP']} style={{left: 0, right: 0, top: 110, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><WhaleScene t={TB} thumb uid="tw" camK={{x: -60, y: -150, k: 3.1}} thumbWhale={WHALE} /></Boil>
    <Title size={130} lines={['LEGS', 'SNAP']} style={{left: 56, top: 190, textAlign: 'left'}} />
  </AbsoluteFill>
);
