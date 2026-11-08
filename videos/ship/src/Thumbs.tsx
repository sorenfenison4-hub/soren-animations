// Thumbnails for "Why does a steel ship float?" - built from the video's own pieces in the notebook-doodle style:
// the smug cargo ship floating, the worried steel block sinking under it, the guy shrugging on the pier,
// yellow + black-outlined Inter 900 text that adds to the title.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {INK, FONT, Guy, ObjectFace, FACE0, Face, W, Boil, Look, Pose, ContactShadow} from './lib/kit';
import {ShipArt, BlockArt, Sea, HULL_P, HULL, STEEL, SEA, SEA_L, WOOD, WOOD_D, PAPER} from './Ship';

const Title: React.FC<{size: number; style: React.CSSProperties}> = ({size, style}) => (
  <div style={{position: 'absolute', fontFamily: FONT, fontWeight: 900, lineHeight: 0.92, fontSize: size, color: '#FFD43B',
    WebkitTextStroke: `${size * 0.1}px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 ${size * 0.065}px 0 ${INK}`, letterSpacing: -2, ...style}}>
    SAME<br />STEEL
  </div>
);
const Scaled: React.FC<{x: number; y: number; s: number; children: React.ReactNode}> = ({x, y, s, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${x}px, ${y}px) scale(${s})`}}>{children}</div>
);
const smug: Face = {...FACE0, lid: 0.45, brow: -8, lx: -0.7, ly: 0.7, mouth: 'smile'};
const worried: Face = {...FACE0, open: 1.12, mouth: 'o', brow: -13, lx: 0.5, ly: -1};

/** the whole picture: water line at wy, ship centre sx at scale G, block at (bx, by) scale bs, guy on a pier at gx */
const Scene: React.FC<{w: number; h: number; wy: number; sx: number; G: number; bx: number; by: number; bs: number; gx: number; gs: number; pose: Pose}> =
  ({w, h, wy, sx, G, bx, by, bs, gx, gs, pose}) => (
    <>
      <Scaled x={0} y={wy} s={1}><Sea t={0.6} x0={-200} x1={w + 200} fill={SEA_L} op={1} amp={4} len={300} line={0} shine={false} /></Scaled>
      <Scaled x={sx} y={wy} s={G}>
        <W><ShipArt id="thumb" tint={0.25} wl={0} /></W>
        <ObjectFace x={-560} y={-88} r={125} f={smug} t={0} lidColor={HULL} />
      </Scaled>
      <Scaled x={0} y={wy} s={1}>
        <Sea t={0.6} x0={-200} x1={w + 200} fill={SEA} op={0.42} amp={5} len={300} line={7}
          hole={{d: HULL_P, tf: `translate(${sx} 0) scale(${G})`, id: `thumbhole${w}`}} />
      </Scaled>
      {/* the block sinking, bubbles rising off it */}
      <W>{[[-12, 0.22, 13], [14, 0.5, 10], [-4, 0.76, 8]].map(([dx, f, r], i) => {
        const top = by - 44 * bs, y = top - (top - wy) * f;
        return <circle key={i} cx={bx + dx * bs} cy={y} r={r * bs * 0.75} fill="#DDF2FC" stroke={INK} strokeWidth={4} />;
      })}</W>
      <Scaled x={bx} y={by} s={bs}>
        <div style={{position: 'absolute', left: 0, top: 0, transform: 'rotate(-12deg)', transformOrigin: '0 0'}}>
          <W><BlockArt w={80} h={76} /></W>
          <ObjectFace x={-3} y={4} r={40} f={worried} t={0} lidColor={STEEL} />
        </div>
      </Scaled>
      {/* pier + the guy */}
      <W>
        <rect x={gx - 26 * gs} y={wy - 30 * gs} width={44 * gs} height={h} fill={WOOD_D} stroke={INK} strokeWidth={6} />
        <rect x={-40} y={wy - 46 * gs} width={gx + 150 * gs} height={30 * gs} rx={6} fill={WOOD} stroke={INK} strokeWidth={7} />
      </W>
      <Scaled x={gx} y={wy - 46 * gs} s={gs}>
        <ContactShadow x={0} y={0} />
        <Guy pose={pose} x={0} y={0} t={0} breathe={false} />
      </Scaled>
    </>
  );

// Shorts cover: text at the top, every face in the top three quarters (the Shorts shelf covers the bottom)
export const ThumbTall: React.FC = () => (
  <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
    <Boil t={0}>
      <AbsoluteFill style={{background: PAPER}} />
      <Scene w={1080} h={1920} wy={1060} sx={700} G={0.56} bx={430} by={1320} bs={2.1} gx={210} gs={1.2} pose="shrug" />
      <Title size={235} style={{left: 0, right: 0, top: 95, textAlign: 'center'}} />
    </Boil>
    <Look />
  </AbsoluteFill>
);
export const ThumbWide: React.FC = () => (
  <AbsoluteFill style={{background: PAPER, overflow: 'hidden'}}>
    <Boil t={0}>
      <AbsoluteFill style={{background: PAPER}} />
      <Scene w={1280} h={720} wy={440} sx={600} G={0.34} bx={420} by={615} bs={1.35} gx={205} gs={0.95} pose="shrug" />
      <Title size={118} style={{right: 40, top: 36, textAlign: 'right'}} />
    </Boil>
    <Look />
  </AbsoluteFill>
);
