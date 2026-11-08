import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Guy, Ball, ObjectFace, FACE0, Face, Star, W, Pose} from './lib/kit';
import {Brain} from './Tickle';

const rays = Array.from({length: 24}).map((_, k) => {
  const a = (Math.PI * 2 * k) / 24, b = a + Math.PI / 24, cx = 1280, cy = 720, R = 2600;
  return `M ${cx} ${cy} L ${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R} L ${cx + Math.cos(b) * R} ${cy + Math.sin(b) * R} Z`;
});
const G = 1.33; // world -> px for characters (guy ~ 425 px tall)
const Char: React.FC<{pose: Pose; x: number; feet: number; flip?: boolean}> = ({pose, x, feet, flip}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${feet}px) scale(${G})`}}>
    <div style={{position: 'absolute', left: -60, top: -13, width: 120, height: 26, borderRadius: '50%', background: 'rgba(120,80,0,0.22)', filter: 'blur(3px)'}} />
    <Guy pose={pose} x={0} y={0} t={0} breathe={false} flip={flip} />
  </div>
);
const smug: Face = {...FACE0, lid: 0.45, mouth: 'grin', brow: 8, lx: 0.4, ly: 0.3};
const rockF: Face = {...FACE0, mouth: 'o', brow: -10, lx: -0.6, ly: -0.4};
const robotF: Face = {...FACE0, lid: 0.2, mouth: 'smile', lx: -1, ly: 0};

export const Banner: React.FC<{text?: boolean}> = ({text = true}) => (
  <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 50%, #FFE45C 0%, #FFC72C 55%, #FFB020 100%)', overflow: 'hidden'}}>
    <svg width={2560} height={1440} style={{position: 'absolute'}}>{rays.map((d, i) => <path key={i} d={d} fill="rgba(255,255,255,0.16)" />)}</svg>
    {/* hills along the bottom (desktop / TV only) */}
    <div style={{position: 'absolute', left: 0, top: 0}}>
      <Ball x={140} y={1460} r={330} fill="#9CCB7A" shade="#86B866" seed={9} />
      <Ball x={2440} y={1480} r={380} fill="#9CCB7A" shade="#86B866" seed={11} />
      <Ball x={980} y={1640} r={300} fill="#9CCB7A" shade="#86B866" seed={13} />
      {/* extras outside the mobile safe area */}
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: 'translate(300px, 470px) scale(1.25)'}}>
        <Brain x={0} y={0} s={1} f={smug} t={0.3} />
      </div>
      <Ball x={2300} y={420} r={88} fill="#A39A90" shade="#8A8178" wobble={0.12} seed={4} />
      <ObjectFace x={2300} y={420} r={88} f={rockF} t={0} lidColor="#A39A90" />
      <Star x={190} y={170} s={1.3} rot={12} /><Star x={2390} y={1010} s={1.1} rot={-8} />
      <Star x={560} y={1150} s={0.9} rot={30} /><Star x={2050} y={180} s={1.0} rot={20} />
    </div>
    {/* mobile-safe centre strip: x 507..2053, y 508..931 */}
    <Char pose="surprised" x={655} feet={926} />
    <Char pose={text ? 'point_right' : 'front_wave'} x={1915} feet={926} flip={text} />
    {text ? (
      <div style={{position: 'absolute', left: 0, right: 0, top: 528, textAlign: 'center', fontFamily: FONT, fontWeight: 900, letterSpacing: -2}}>
        <div style={{fontSize: 178, lineHeight: 0.95, color: '#fff', WebkitTextStroke: `18px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 11px 0 ${INK}`}}>SOREN</div>
        <div style={{fontSize: 112, lineHeight: 1.0, color: '#FFD43B', WebkitTextStroke: `14px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 8px 0 ${INK}`, marginTop: 4}}>ANIMATIONS</div>
        <div style={{display: 'inline-block', marginTop: 18, fontSize: 40, fontWeight: 800, letterSpacing: 0, color: INK, background: '#fff', border: `6px solid ${INK}`,
          borderRadius: 40, padding: '6px 30px'}}>Weird questions. Quick answers.</div>
      </div>
    ) : <Char pose="laugh" x={1280} feet={928} />}
  </AbsoluteFill>
);
export const BannerPlain: React.FC = () => <Banner text={false} />;
