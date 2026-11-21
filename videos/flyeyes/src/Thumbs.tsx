// Thumbnails for "What if you had a fly's eyes?" - the swollen-eye moment: his fly eyes blown up to a meter wide each,
// the tape measure across one, the smug fly perched on the other. Text adds the twist to the title: 1 METER WIDE.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {FlyScene} from './Fly';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 15.42;   // eyes at full size, tape across the right eye, the fly sitting on the left eye
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><FlyScene t={tb} thumb uid="th" camK={{x: 40, y: -330, k: 2.15}} /></Boil>
    <Title size={150} lines={['1 METER', 'WIDE']} style={{left: 0, right: 0, top: 110, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><FlyScene t={tb} thumb uid="tw" camK={{x: 190, y: -345, k: 2.4}} /></Boil>
    <Title size={112} lines={["1 METER", "WIDE"]} style={{right: 60, top: 220, textAlign: "center"}} />
  </AbsoluteFill>
);
