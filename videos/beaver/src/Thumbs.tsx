// Thumbnails for "What if you had a beaver's teeth?" - the text adds the twist to the title: they never stop growing.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil, WideFit} from './lib/kit';
import {BeaverScene} from './Beaver';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
// close-up: his teeth have curled back into his chin, the stump behind him
const TB = 2.7;
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><BeaverScene t={TB} thumb uid="th" camK={{x: 50, y: -218, k: 2.95}} /></Boil>
    <Title size={150} lines={['NEVER', 'STOPS']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <WideFit.Provider value={0.8}><Boil t={0}><BeaverScene t={TB} thumb uid="tw" camK={{x: 190, y: -205, k: 3.0}} /></Boil></WideFit.Provider>
    <Title size={130} lines={['NEVER', 'STOPS']} style={{right: 36, top: 200, textAlign: 'right'}} />
  </AbsoluteFill>
);
