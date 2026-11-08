// Thumbnails for "Why don't birds on power lines get shocked?" - built from the video's own pieces:
// the smug bird on its glowing 7,200 V wire, the guy looking up, yellow + black-outlined Inter 900 text.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Guy, FACE0, Ball, W, Pose} from './lib/kit';
import {BirdBack, BirdFront, BirdS, WireLine, Current, HOT, BX, BY, WING0, Cloud, hotY} from './Birds';

const BG = 'radial-gradient(circle at 50% 40%, #D6EEFF 0%, #A9D8FF 45%, #6FB6F5 100%)';
const Title: React.FC<{size: number; style: React.CSSProperties}> = ({size, style}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.92, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    7,200<br />VOLTS
  </div>
);
const smug: BirdS = {face: {...FACE0, mouth: 'none', lid: 0.42, brow: -6, lx: 0.15, ly: 0.05}, beak: 0, wl: {...WING0}, wr: {...WING0},
  frz: false, xray: false, sy: 1, lean: 0, glow: 0};
/** classic lightning-bolt icon (world units, ~68 tall at s = 1) */
const ZapIcon: React.FC<{x: number; y: number; s: number; rot: number}> = ({x, y, s, rot}) => (
  <W><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 4 -34 L -14 4 L -2 4 L -8 34 L 14 -6 L 2 -6 L 10 -34 Z" fill="#FFE45C" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g></W>
);

const Scaled: React.FC<{x: number; y: number; s: number; children: React.ReactNode}> = ({x, y, s, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${s})`}}>{children}</div>
);
/** world group: the bird's body centre (BX, BY - 62) lands on screen (cx, cy); the wire is drawn from world x0 to x1 */
const BirdOnWire: React.FC<{cx: number; cy: number; G: number; x0: number; x1: number; sparks: number[]}> = ({cx, cy, G, x0, x1, sparks}) => (
  <Scaled x={cx - BX * G} y={cy - (BY - 62) * G} s={G}>
    <BirdBack s={smug} />
    <WireLine s={HOT[0]} w={8} a={x0} b={x1} />
    <Current s={HOT[0]} t={0.37} p={1} a={x0} b={x1} />
    {sparks.map((dx) => <ZapIcon key={dx} x={BX + dx} y={hotY(BX + dx) - 34} s={0.55} rot={dx < 0 ? -14 : 14} />)}
    <BirdFront t={0.3} s={smug} />
  </Scaled>
);
const GuyAt: React.FC<{x: number; feet: number; s: number; pose?: Pose; flip?: boolean}> = ({x, feet, s, pose = 'lookup', flip}) => (
  <Scaled x={x} y={feet} s={s}>
    <div style={{position: 'absolute', left: -60, top: -13, width: 120, height: 26, borderRadius: '50%', background: 'rgba(72,54,42,0.26)', filter: 'blur(3px)'}} />
    <Guy pose={pose} x={0} y={0} t={0} breathe={false} flip={flip} />
  </Scaled>
);
const GroundBand: React.FC<{y: number}> = ({y}) => (
  <div style={{position: 'absolute', left: -100, right: -100, top: y, bottom: -100, background: '#C9E3A8', borderTop: `7px solid ${INK}`}} />
);

// Shorts cover: text at the top (the Shorts shelf covers the bottom with the video title)
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
    <Scaled x={0} y={0} s={1}><Cloud x={150} y={700} s={0.9} /><Cloud x={960} y={610} s={0.75} /></Scaled>
    <Scaled x={0} y={0} s={1}><Ball x={880} y={1850} r={260} fill="#9CCB7A" shade="#86B866" seed={11} /></Scaled>
    <GroundBand y={1770} />
    <GuyAt x={250} feet={1785} s={1.55} />
    <BirdOnWire cx={560} cy={905} G={3.3} x0={-140} x1={250} sparks={[-108, 122]} />
    <Title size={250} style={{left: 0, right: 0, top: 90, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{background: BG, overflow: 'hidden'}}>
    <Scaled x={0} y={0} s={1}><Cloud x={110} y={110} s={0.6} /></Scaled>
    <BirdOnWire cx={420} cy={330} G={2.15} x0={-160} x1={480} sparks={[-100, 120]} />
    <GuyAt x={1040} feet={1015} s={1.6} flip />
    <Title size={140} style={{right: 50, top: 40, textAlign: 'right'}} />
  </AbsoluteFill>
);
