// Thumbnails for "What if you could jump like a flea?" - him at the top of the flea jump over the 30-floor tower, flea legs,
// looking down (uh oh, sweat), the smug flea beside him, the roof far below. Text adds to the title: 30 FLOORS UP.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {JumpScene, APEX_ROOT, AX} from './Jump';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const tb = 10.75;   // the top of the flea jump: he looks down
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><JumpScene t={tb} thumb uid="th" camK={{x: AX + 20, y: APEX_ROOT - 60, k: 2.3}} /></Boil>
    <Title size={170} lines={['30 FLOORS', 'UP']} style={{left: 0, right: 0, top: 110, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}><JumpScene t={tb} thumb uid="tw" camK={{x: AX - 260, y: APEX_ROOT - 40, k: 1.9}} /></Boil>
    <Title size={120} lines={['30 FLOORS', 'UP']} style={{left: 50, top: 170}} />
  </AbsoluteFill>
);
