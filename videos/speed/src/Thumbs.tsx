// Thumbnails for "What if you could run as fast as these animals?" - the top rung: tiger-beetle legs spinning into a wheel,
// his face screaming at 750 km/h, an airliner with a face beside him, the savanna smeared into streaks. Text adds the number
// to the title: 750 KM/H.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Boil} from './lib/kit';
import {SpeedScene, Streaks, Xof} from './Speed';

const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l, i) => <div key={i}>{l}</div>)}
  </div>
);
const TB = 10.36;          // top speed, the jet beside him, just before the blur and the tree
const X = Xof(TB);
const TT = 10.05;          // the tall cover: a moment earlier, so the jet's face sits above him
const XT2 = Xof(TT);
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}>
      <SpeedScene t={TT} thumb uid="th" camK={{x: XT2 + 23, y: -260, k: 2.6}} />
      <Streaks t={TT} s={0.9} />
    </Boil>
    <Title size={190} lines={['750 KM/H']} style={{left: 0, right: 0, top: 150, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{overflow: 'hidden'}}>
    <Boil t={0}>
      <SpeedScene t={TB} thumb uid="tw" camK={{x: X + 60, y: -260, k: 2.6}} />
    </Boil>
    <Title size={130} lines={['750', 'KM/H']} style={{left: 46, top: 60}} />
  </AbsoluteFill>
);
