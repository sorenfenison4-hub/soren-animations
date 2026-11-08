import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Guy, Ball, FACE0, Face, W} from './lib/kit';
import {Brain} from './Tickle';

const smug: Face = {...FACE0, open: 1, lid: 0.45, mouth: 'grin', brow: 10, lx: 0.2, ly: 1};
const BG = 'radial-gradient(circle at 50% 45%, #D6EEFF 0%, #A9D8FF 45%, #6FB6F5 100%)';
const Title: React.FC<{size: number; style: React.CSSProperties}> = ({size, style}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.92, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    BRAIN<br />SAYS NO
  </div>
);
// world group: scale G, guy feet at world (0,0)
const Scene: React.FC<{ox: number; oy: number; G: number; bx: number; by: number; bs: number; hillX?: number}> = ({ox, oy, G, bx, by, bs, hillX = 340}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${ox}px, ${oy}px) scale(${G})`}}>
    <Ball x={-330} y={40} r={170} fill="#9CCB7A" shade="#86B866" seed={9} />
    <Ball x={hillX} y={50} r={210} fill="#9CCB7A" shade="#86B866" seed={11} />
    <div style={{position: 'absolute', left: -3000, top: 0, width: 6000, height: 3000, background: '#C9E3A8', borderTop: `6px solid ${INK}`}} />
    <div style={{position: 'absolute', left: -60, top: -13, width: 120, height: 26, borderRadius: '50%', background: 'rgba(72,54,42,0.26)', filter: 'blur(3px)'}} />
    <Guy pose="tickle_self" x={0} y={0} t={0} breathe={false} />
    {[0, 1, 2].map((i) => <W key={i}><circle cx={bx * (0.25 + i * 0.22)} cy={-325 + (by + 330) * (0.2 + i * 0.25)} r={8 + i * 4} fill="#FF9EBB" stroke={INK} strokeWidth={4} /></W>)}
    <Brain x={bx} y={by} s={bs} f={smug} t={0.3} />
  </div>
);

export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
    <Scene ox={540} oy={1820} G={2.6} bx={0} by={-423} bs={0.85} />
    <Title size={200} style={{left: 0, right: 0, top: 90, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
    <Scene ox={250} oy={700} G={1.75} bx={170} by={-300} bs={0.62} hillX={760} />
    <Title size={132} style={{right: 40, top: 300, textAlign: 'right'}} />
  </AbsoluteFill>
);
