// Thumbnails for "Why is he building a tower to the Moon?" - built from the video's own pieces: the night sky, the guy
// on his door-high tower looking up at the smiling Moon, yellow + black-outlined Inter 900 text.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Guy, Star, Boil, FACE0, paperFilter, rnd, Pose} from './lib/kit';
import {Tower, Moon, House, N, SH, TX, MX, MR, NAVY} from './Tower';

const Title: React.FC<{size: number; style: React.CSSProperties}> = ({size, style}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.92, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    60 YEARS
  </div>
);
/** world group drawn at screen (x, y) = world (0, 0), scale s, as cut paper */
const World: React.FC<{x: number; y: number; s: number; paper?: boolean; children: React.ReactNode}> = ({x, y, s, paper = true, children}) => (
  <AbsoluteFill style={{filter: paper ? paperFilter() : undefined}}>
    <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${s})`}}>{children}</div>
  </AbsoluteFill>
);
const Sky: React.FC<{w: number; h: number; n: number}> = ({w, h, n}) => (
  <AbsoluteFill style={{background: NAVY}}>
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: n * 2}, (_, i) => <circle key={i} cx={rnd(i * 17 + 5) * w} cy={rnd(i * 19 + 6) * h * 0.8} r={2.5 + rnd(i * 23) * 3} fill="#FFF3C4" opacity={0.75} />)}
    </svg>
  </AbsoluteFill>
);
const Stars: React.FC<{w: number; h: number; n: number; s: number}> = ({w, h, n, s}) => (
  <World x={0} y={0} s={1}>
    {Array.from({length: n}, (_, i) => <Star key={i} x={rnd(i * 3 + 1) * w} y={rnd(i * 5 + 2) * h * 0.75} s={s * (0.7 + rnd(i * 11 + 4) * 0.6)} rot={i * 23} />)}
  </World>
);
const happy = {...FACE0, lx: -0.6, ly: 0.6, lid: 0.25};
const Scene: React.FC<{gx: number; gy: number; G: number; mx: number; my: number; M: number; pose?: Pose}> = ({gx, gy, G, mx, my, M, pose = 'lookup'}) => {
  // the line between the two friends: his head top -> the Moon's lower left edge
  const hx = gx + TX * G, hy = gy + (-N * SH - 318) * G, bx = mx - 0.5 * MR * M, by = my + 0.84 * MR * M;
  return (
    <>
      <World x={gx} y={gy} s={G}>
        <div style={{position: 'absolute', left: -6000, top: 0, width: 12000, height: 4000, background: '#2B4A40', borderTop: `8px solid ${INK}`}} />
        <House />
        <Tower n={N} />
        <Guy pose={pose} x={TX} y={-N * SH} t={0} breathe={false} />
      </World>
      <World x={mx - MX * M} y={my} s={M}><Moon x={MX} y={0} t={0} f={happy} blush={0.6} /></World>
      <AbsoluteFill>
        <svg width="100%" height="100%" style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <path d={`M ${hx + 0.12 * (bx - hx)} ${hy + 0.12 * (by - hy)} L ${bx - 0.03 * (bx - hx)} ${by - 0.03 * (by - hy)}`} stroke="#FFF6D6"
            strokeWidth={9 * Math.max(G, M)} strokeDasharray={`${26 * G} ${20 * G}`} strokeLinecap="round" />
        </svg>
      </AbsoluteFill>
    </>
  );
};

// Shorts cover: text at the top, faces in the top three quarters (the Shorts shelf covers the bottom)
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
    <Boil t={0}>
      <AbsoluteFill>
        <Sky w={1080} h={1920} n={40} />
        <Stars w={1080} h={1920} n={14} s={1.4} />
        <Scene gx={300} gy={1700} G={1.25} mx={790} my={575} M={1.5} />
      </AbsoluteFill>
    </Boil>
    <Title size={200} style={{left: 0, right: 0, top: 120, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{background: NAVY, overflow: 'hidden'}}>
    <Boil t={0}>
      <AbsoluteFill>
        <Sky w={1280} h={720} n={30} />
        <Stars w={1280} h={720} n={10} s={0.9} />
        <Scene gx={530} gy={765} G={0.75} mx={1045} my={250} M={1.25} />
      </AbsoluteFill>
    </Boil>
    <Title size={150} style={{left: 50, top: 50}} />
  </AbsoluteFill>
);
