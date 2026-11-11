// Thumbnails for "Why should you never whisper in a round room?" - built from the video's own pieces: the advisor
// whispering into the wall, his dotted whisper arcing over the dome into the shocked king's ear (wooden crown,
// woodpecker), the guy listening, yellow + black-outlined Inter 900 text "WALLS HAVE EARS".
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {INK, FONT, Boil, paperFilter, HEAD_R} from './lib/kit';
import CAST from './cast.json';

type CM = {w: number; h: number; head: number[]; feet: number[] | null};
const STONE = '#E6D6BA', STONE2 = '#D6C3A2', PURPLE = '#7B4FC9';
/** a cut-out with its head centre at (hx, hy) and head radius r (screen px) */
const Cut: React.FC<{name: keyof typeof CAST; hx: number; hy: number; r: number; flip?: boolean}> = ({name, hx, hy, r, flip}) => {
  const m = (CAST as any)[name] as CM, s = r / m.head[2];
  return <div style={{position: 'absolute', left: hx - m.head[0] * s, top: hy - m.head[1] * s, width: m.w * s, height: m.h * s,
    transformOrigin: `${m.head[0] * s}px ${m.head[1] * s}px`, transform: flip ? 'scaleX(-1)' : undefined}}>
    <Img src={staticFile(`whisper/char/${name}.png`)} style={{width: '100%', height: '100%'}} />
  </div>;
};
/** the wooden crown + woodpecker on a head (screen px) */
const WoodCrown: React.FC<{hx: number; hy: number; r: number}> = ({hx, hy, r}) => {
  const k = r / 64, w = 60;
  return <svg width={4000} height={4000} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <g transform={`translate(${hx} ${hy - 0.9 * r}) scale(${k})`}>
      <path d={`M ${-w} 10 L ${-w} -26 L ${-w * 0.62} -6 L ${-w * 0.32} -40 L 0 -10 L ${w * 0.32} -40 L ${w * 0.62} -6 L ${w} -26 L ${w} 10 Z`} fill="#E2B648" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <rect x={-w} y={-4} width={2 * w} height={18} rx={5} fill="#D4A33C" stroke={INK} strokeWidth={7} />
      <path d="M 12 -4 L 34 -4 L 40 10 L 16 13 Z" fill="#A8713E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      {[0, 1, 2].map((i) => <ellipse key={i} cx={-26 + i * 11} cy={-14 + (i % 2) * 7} rx={4} ry={5} fill="#5A3A20" />)}
      <g transform="translate(16 -26) scale(0.6)">
        <ellipse cx={-6} cy={-34} rx={30} ry={24} fill="#1F1F1F" stroke={INK} strokeWidth={5} />
        <ellipse cx={-2} cy={-28} rx={14} ry={14} fill="#F2F0EA" />
        <g transform="translate(6 -54) rotate(12)">
          <circle r={17} fill="#F2F0EA" stroke={INK} strokeWidth={5} />
          <path d="M -10 -14 Q -2 -32 12 -20 Q 6 -12 -10 -14 Z" fill="#E5484D" stroke={INK} strokeWidth={4} />
          <circle cx={5} cy={-2} r={3.5} fill={INK} /><path d="M 14 0 L 38 4 L 14 9 Z" fill="#7C7C7C" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      </g>
    </g>
  </svg>;
};
const Wall: React.FC<{w: number; h: number; arc: string}> = ({w, h, arc}) => (
  <AbsoluteFill style={{background: STONE}}>
    <svg width={w} height={h} style={{position: 'absolute', inset: 0}}>
      {Array.from({length: Math.ceil(h / 120) + 1}, (_, r) => <g key={r}><path d={`M 0 ${r * 120} H ${w}`} stroke={STONE2} strokeWidth={7} />
        {Array.from({length: Math.ceil(w / 220) + 1}, (_, c) => <path key={c} d={`M ${c * 220 + (r % 2) * 110} ${r * 120} v 120`} stroke={STONE2} strokeWidth={7} />)}</g>)}
      <path d={arc} stroke="#BCA585" strokeWidth={90} fill="none" />
      <path d={arc} stroke={INK} strokeWidth={8} fill="none" transform="translate(0 -45)" />
      <path d={arc} stroke={INK} strokeWidth={8} fill="none" transform="translate(0 45)" />
    </svg>
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 75% 65% at 50% 48%, transparent 45%, rgba(60,35,15,0.35) 100%)'}} />
  </AbsoluteFill>
);
const Trail: React.FC<{d: string; w: number; hx: number; hy: number}> = ({d, w, hx, hy}) => (
  <svg width={4000} height={4000} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <path d={d} stroke={INK} strokeWidth={w * 2} strokeDasharray={`${w * 3} ${w * 2.3}`} strokeLinecap="round" fill="none" />
    <path d={d} stroke={PURPLE} strokeWidth={w} strokeDasharray={`${w * 3} ${w * 2.3}`} strokeLinecap="round" fill="none" />
    <g transform={`translate(${hx} ${hy})`}>
      <circle r={w * 2.6} fill="#fff" stroke={INK} strokeWidth={w * 0.6} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${(-0.5 + i * 0.9) * w} ${-1.4 * w} Q ${(0.2 + i * 0.9) * w} 0 ${(-0.5 + i * 0.9) * w} ${1.4 * w}`} stroke={PURPLE} strokeWidth={w * 0.45} fill="none" strokeLinecap="round" />)}
    </g>
  </svg>
);
const Title: React.FC<{size: number; style: React.CSSProperties; lines: string[]}> = ({size, style, lines}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.95, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    {lines.map((l) => <div key={l}>{l}</div>)}
  </div>
);
const Guy: React.FC<{hx: number; hy: number; r: number}> = ({hx, hy, r}) => <Cut name="guy_listen" hx={hx} hy={hy} r={r} />;

// Shorts cover: text at the top, faces in the top three quarters (the Shorts shelf covers the bottom)
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{background: STONE, overflow: 'hidden'}}>
    <Boil t={0}>
      <AbsoluteFill>
        <Wall w={1080} h={1920} arc="M -60 1900 C -60 620 1140 620 1140 1900" />
        <AbsoluteFill style={{filter: paperFilter(7, 1.4)}}>
          <Cut name="adv_whisper" hx={250} hy={980} r={150} />
          <Cut name="king_shock" hx={790} hy={1060} r={185} />
          <WoodCrown hx={790} hy={1060} r={185} />
          <Guy hx={520} hy={1420} r={95} />
        </AbsoluteFill>
        <Trail d="M 78 975 C 20 850 30 640 70 520 C 160 380 920 380 1010 520 C 1060 640 1050 900 1000 1040" w={14} hx={1000} hy={1045} />
      </AbsoluteFill>
    </Boil>
    <Title size={150} lines={['WALLS HAVE', 'EARS']} style={{left: 0, right: 0, top: 70, textAlign: 'center'}} />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{background: STONE, overflow: 'hidden'}}>
    <Boil t={0}>
      <AbsoluteFill>
        <Wall w={1280} h={720} arc="M 150 800 C 150 150 1130 150 1130 800" />
        <AbsoluteFill style={{filter: paperFilter(6, 1.2)}}>
          <Cut name="adv_whisper" hx={330} hy={430} r={88} />
          <Cut name="king_shock" hx={1010} hy={430} r={120} />
          <WoodCrown hx={1010} hy={430} r={120} />
          <Guy hx={680} hy={560} r={62} />
        </AbsoluteFill>
        <Trail d="M 228 440 C 175 400 160 300 200 200 C 280 140 800 130 870 230 C 900 290 890 360 882 410" w={9} hx={880} hy={418} />
      </AbsoluteFill>
    </Boil>
    <Title size={92} lines={['WALLS HAVE EARS']} style={{left: 40, top: 26}} />
  </AbsoluteFill>
);
