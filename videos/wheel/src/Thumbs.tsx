// Thumbnails for "Is today my lucky day?" - built from the video's own pieces: the wheel stuck on the last peg between
// NO and YES (flapper bent, hub face sweating), the guy panicking beside it, yellow + black-outlined Inter 900 text.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Guy, FACE0, Face, Star, Boil, paperFilter} from './lib/kit';
import {Wheel, Flapper, Stand, Sunburst, Clover, SUN, WX, WY, wheelAngle, flapBend} from './Wheel';

const Title: React.FC<{size: number; style: React.CSSProperties}> = ({size, style}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    SO<br />CLOSE
  </div>
);
const Scaled: React.FC<{x: number; y: number; s: number; paper?: boolean; children: React.ReactNode}> = ({x, y, s, paper, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${s})`,
    filter: paper ? paperFilter() : undefined}}>{children}</div>
);
const Paper: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: '#FBF7EC', overflow: 'hidden'}}><Boil t={0}><AbsoluteFill>{children}</AbsoluteFill></Boil></AbsoluteFill>
);
// the stuck moment: the NO/YES peg pressing the flapper, the hub face sweating
const STUCK = 9.0;
const face: Face = {...FACE0, lx: 0.1, ly: -0.95, mouth: 'o', brow: -14, sweat: 1};
/** the wheel with its stand, centre on screen (cx, cy) at scale s, with the rays behind it */
const WheelAt: React.FC<{cx: number; cy: number; s: number}> = ({cx, cy, s}) => (
  <>
    <Scaled x={cx - SUN.x * s * 0.9} y={cy - SUN.y * s * 0.9} s={s * 0.9}><Sunburst t={0} glow={0} /></Scaled>
    <Scaled x={cx - WX * s} y={cy - WY * s} s={s} paper>
      <Stand />
      <Wheel t={0.4} th={wheelAngle(STUCK)} f={face} />
      <Flapper bend={flapBend(STUCK)} />
    </Scaled>
  </>
);
const GuyAt: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => (
  <Scaled x={x} y={y} s={s} paper><Guy pose="scared" x={0} y={0} t={0} size={1.5} breathe={false} /></Scaled>
);

// Shorts cover: text in the top band, faces inside the top three quarters (the shelf covers the bottom)
export const ThumbTall: React.FC = () => (
  <Paper>
    <WheelAt cx={600} cy={1040} s={1.18} />
    <Scaled x={0} y={0} s={1}><svg width={1080} height={1920} style={{position: 'absolute', overflow: 'visible'}}>
      {[[95, 640, 0], [990, 600, 1], [70, 1000, 1], [1010, 1530, 0]].map(([x, y, k], i) => k
        ? <Clover key={i} x={x} y={y} s={1.5} rot={i * 30} /> : null)}
    </svg></Scaled>
    {[[105, 640], [1000, 1560]].map(([x, y], i) => <Scaled key={i} x={0} y={0} s={1}><Star x={x} y={y} s={1.4} rot={i * 25} /></Scaled>)}
    <GuyAt x={232} y={1740} s={1.5} />
    <Title size={225} style={{left: 0, right: 0, top: 60, textAlign: 'center'}} />
  </Paper>
);
export const ThumbWide: React.FC = () => (
  <Paper>
    <WheelAt cx={930} cy={385} s={0.82} />
    <svg width={1280} height={720} style={{position: 'absolute', overflow: 'visible'}}>
      <Clover x={560} y={70} s={1.0} rot={20} /><Clover x={1230} y={660} s={0.9} rot={-15} />
    </svg>
    <Star x={60} y={655} s={0.9} rot={15} />
    <GuyAt x={478} y={770} s={0.98} />
    <Title size={142} style={{left: 142, top: 44, textAlign: 'left'}} />
  </Paper>
);
