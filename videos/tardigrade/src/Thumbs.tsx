// Thumbnails for "What if you were as tough as a tardigrade?" - the text adds the catch to the title: DRIED UP.
// The picture: mid-shrivel in open space - water spraying out of him as he wrinkles purple, a worried face - beside the big
// smug tardigrade, the Earth below.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {TardiScene, TS} from './Tardi';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const TB = 2.785;
const TGT: Partial<TS> = {x: 62, y: -72, s: 0.8, mood: 'smug', look: [-1, 0], wig: 0.35};
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><TardiScene t={TB} thumb uid="th" camK={{x: -40, y: -84, k: 2.8}} thumbTg={TGT} /></Boil>
    <Title size={190} lines={['DRIED', 'UP']} style={{left: 0, right: 0, top: 96, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><TardiScene t={TB} thumb uid="tw" camK={{x: -110, y: -76, k: 3.9}} thumbTg={TGT} /></Boil>
    <Title size={130} lines={['DRIED', 'UP']} style={{left: 56, top: 190, textAlign: 'left'}} />
  </AbsoluteFill>
);
