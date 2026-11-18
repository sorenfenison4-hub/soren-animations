// "What if you had a shark's teeth?" - owl formula (CLAUDE.md, Growth), niche: animal powers.
// (1) the power is ON HIM at frame 0: a mouth full of shark teeth, chomping into an apple that hangs from a tree on the
// pier; (2) the co-star (a smug lemon shark in the water next to him) does it with ease; (3) two X-rays: the SHARK JAW
// (teeth sit in the gum, spare rows roll forward like a conveyor belt), then YOUR JAW (roots locked in bone, 2 sets,
// a lost tooth = GONE FOR GOOD); (4) live counters (DAYS 0 -> 14 = new row, SETS OF TEETH 1 -> 2); (5) the comedy hit
// comes from the power itself (toothless, he gnaws the apple with his gums, it swings away and back BOING into his
// face); (6) a sticker word every ~1.5 s, a cut every 2-3 s; (7) the ending: his next row rolls in and he bites again
// = frame 0; (8) comment bubble opener + CommentAsk on screen (no either/or ending).
// Everything is drawn in code; the guy's body is the library sprite, his head is drawn here so the teeth can move.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import LIB_M from './lib/library.json';
import {FPS, INK, FONT, Layer, camAt, W, Guy, Pose, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Sea} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.12; times are video time). Last word ends ~17.5 s; + 0.9 s for the push.
export const DURATION = 18.4;
export const T = {
  teeth: 0.74, bite: 1.74, apple: 2.24, rips: 2.60, out: 3.39,            // "Get a shark's teeth, and one bite of an apple rips them right out."
  shark: 3.83, locked: 4.62, bone: 5.05, sit: 6.08, gum: 6.44,             // "Shark teeth aren't locked in bone. They just sit in the gum."
  behind: 6.97, spare: 7.76, roll: 8.55, conveyor: 9.55, belt: 9.97,       // "Behind them, spare rows roll forward like a conveyor belt."
  young: 10.65, lemon: 10.87, newRow: 11.72, every: 12.51, weeks: 12.94,   // "A young lemon shark gets a new row about every two weeks."
  you: 13.60, two: 13.96, sets: 14.17, thats: 14.83,                       // "You get two sets. That's it."
  good: 15.39, next: 15.96, rolling: 16.96, inn: 17.17,                    // "Good thing his next row is already rolling in."
  cta: 10.9,
};

const GOLD = '#FFD43B', RED = '#E2453C', GUM = '#E98FA0', GUM2 = '#C9667A', TOOTH = '#FFFFFF';
const LEMON = '#D9C97E', LEMON2 = '#B8A65A', BELLY = '#FFF7E0';
const APPLE = '#E2453C', APPLE2 = '#B52F2A', LEAF = '#7CC36A', LEAF2 = '#5A9E4C', BARK = '#9A6B45';
const GX = -110;                   // guy's feet (on the pier)
const SX = 135;                    // shark's centre line (in the water)
const SWAP = 12.96;                // the shark's new row snaps up
const BOING = 9.95;                // the apple swings back into his face

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));

const headOf = (pose: Pose) => {
  const m = (LIB_M as any)[pose], s = HEAD_R / m.head[2];
  return {hx: (m.head[0] - m.feet[0]) * s, hy: (m.head[1] - m.feet[1]) * s};
};
const HEADS: Record<string, {hx: number; hy: number}> = {};
const headAt = (pose: Pose) => (HEADS[pose] ??= headOf(pose));
const H0 = headAt('front_calm');
const HX = GX + H0.hx, HY = H0.hy;
// the apple hangs from a branch on his left; bite = his head leans into it
const ANCHOR = {x: HX - 100, y: HY - 62};
const ALEN = 96, AR = 42;
const BITE_DX = -44;

/** a row of triangle teeth along y = 0, pointing down (dir 1) or up (dir -1); h scales the height (0 = in the gum) */
const TeethRow: React.FC<{x0: number; x1: number; n: number; h: number; dir: 1 | -1; fill?: string; sw?: number; y?: number}> = ({x0, x1, n, h, dir, fill = TOOTH, sw = 3, y = 0}) => {
  if (h < 0.02) return null;
  const w = (x1 - x0) / n;
  let d = '';
  for (let i = 0; i < n; i++) { const a = x0 + i * w; d += `M ${a} ${y} L ${a + w / 2} ${y + dir * h} L ${a + w} ${y} Z `; }
  return <path d={d} fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />;
};

// ---------- the apple ----------
const appleAngle = (t: number) => {
  let a = 0.07 * Math.sin(t * 4.2);
  if (t > T.rips) a += 0.5 * Math.exp(-2.6 * (t - T.rips)) * Math.sin(9 * (t - T.rips));   // yanked, swings
  if (t > 9.55 && t < BOING) {                                                              // pushed away by his gums, swings back
    const u = seg(t, 9.55, BOING);
    a = u < 0.45 ? -0.65 * eout(u / 0.45) : lerp(-0.65, 0.42, eio((u - 0.45) / 0.55));
  } else if (t >= BOING) a += 0.42 * Math.exp(-3 * (t - BOING)) * Math.cos(8 * (t - BOING));
  return a;
};
const appleAt = (t: number) => {
  const a = appleAngle(t);
  return {x: ANCHOR.x + ALEN * Math.sin(a), y: ANCHOR.y + ALEN * Math.cos(a), a};
};
const Apple: React.FC<{t: number}> = ({t}) => {
  const p = appleAt(t);
  const stuck = t > T.rips + 0.02 && t < DURATION - LOOP_DUR;   // his teeth stay in the apple
  return (
    <W><g>
      <path d={`M ${ANCHOR.x} ${ANCHOR.y} L ${p.x} ${p.y - AR + 4}`} stroke={BARK} strokeWidth={7} strokeLinecap="round" />
      <g transform={`translate(${p.x} ${p.y}) rotate(${(-p.a * 180) / Math.PI})`}>
        <path d={`M 0 ${-AR + 6} C ${AR * 1.1} ${-AR - 14} ${AR * 1.25} ${AR * 0.7} 0 ${AR} C ${-AR * 1.25} ${AR * 0.7} ${-AR * 1.1} ${-AR - 14} 0 ${-AR + 6} Z`}
          fill={APPLE} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        <path d={`M ${-AR * 0.55} ${-AR * 0.35} Q ${-AR * 0.7} 0 ${-AR * 0.45} ${AR * 0.35}`} stroke="#FF8A7E" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M 4 ${-AR + 4} q 14 -18 30 -10 q -14 14 -30 10`} fill={LEAF} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        {stuck ? <g>
          {/* bite mark on his side + his teeth stuck in it */}
          <path d={`M ${AR * 0.72} ${-AR * 0.5} Q ${AR * 0.25} 0 ${AR * 0.72} ${AR * 0.5}`} fill="#FFF2D6" stroke={INK} strokeWidth={4} />
          {Array.from({length: 4}, (_, i) => {
            const y = -AR * 0.38 + i * AR * 0.25;
            return <path key={i} d={`M ${AR * 0.55} ${y - 7} L ${AR * 0.98} ${y} L ${AR * 0.55} ${y + 7} Z`} fill={TOOTH} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
          })}
        </g> : null}
      </g>
    </g></W>
  );
};

// ---------- the world: tree, pier, sea ----------
const Tree: React.FC<{t: number}> = ({t}) => {
  const tx = HX - 330;
  return (
    <W><g>
      <path d={`M ${tx - 34} 4 Q ${tx - 20} ${HY - 40} ${tx - 26} ${HY - 160} L ${tx + 26} ${HY - 160} Q ${tx + 22} ${HY - 40} ${tx + 34} 4 Z`} fill={BARK} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M ${tx + 10} ${HY - 120} Q ${tx + 140} ${HY - 100} ${ANCHOR.x + 40} ${ANCHOR.y - 8}`} stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d={`M ${tx + 10} ${HY - 120} Q ${tx + 140} ${HY - 100} ${ANCHOR.x + 40} ${ANCHOR.y - 8}`} stroke={BARK} strokeWidth={13} fill="none" strokeLinecap="round" />
      {[[-150, -230, 150], [-10, -300, 140], [130, -220, 120], [70, -120, 90], [-110, -110, 95], [210, -140, 80]].map(([dx, dy, r], i) => (
        <circle key={i} cx={tx + dx + 3 * Math.sin(t * 1.3 + i)} cy={HY + dy - 60} r={r} fill={i % 2 ? LEAF2 : LEAF} stroke={INK} strokeWidth={7} />
      ))}
      {[[-90, -300], [60, -350], [150, -250]].map(([dx, dy], i) => <circle key={i} cx={tx + dx} cy={HY + dy - 30} r={20} fill={APPLE} stroke={INK} strokeWidth={5} />)}
    </g></W>
  );
};
const Pier: React.FC = () => (
  <W><g>
    {[-560, -360, -160, 20].map((x) => <rect key={x} x={x - 16} y={10} width={32} height={260} fill="#8A6040" stroke={INK} strokeWidth={6} />)}
    <rect x={-1200} y={0} width={1250} height={34} rx={6} fill="#C08A5A" stroke={INK} strokeWidth={7} />
    {[-1000, -820, -640, -460, -280, -100].map((x) => <path key={x} d={`M ${x} 2 V 32`} stroke={INK} strokeWidth={4} />)}
  </g></W>
);

// ---------- the guy's head, drawn in code: a mouth full of shark teeth ----------
type HeadMood = 'chomp' | 'strain' | 'shock' | 'sad' | 'gnaw' | 'dizzy' | 'hope' | 'happy';
const GuyHead: React.FC<{t: number; x: number; y: number; mood: HeadMood; teeth: number; rot?: number}> = ({t, x, y, mood, teeth, rot = 0}) => {
  const R = HEAD_R;
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (mood === 'dizzy') return <path key={sd} d={`M ${ex} ${ey} m -2 0 a 3 3 0 1 1 4 2 a 7 7 0 1 1 -9 -6 a 11 11 0 1 1 15 10`} transform={`rotate(${t * 600 * sd} ${ex} ${ey})`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
    if (mood === 'strain' || mood === 'gnaw') return <path key={sd} d={`M ${ex + 10 * sd} ${ey - 8} L ${ex - 8 * sd} ${ey} L ${ex + 10 * sd} ${ey + 8}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === 'chomp' || mood === 'happy') return <path key={sd} d={`M ${ex - 11} ${ey + 3} Q ${ex} ${ey - 9} ${ex + 11} ${ey + 3}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    const big = mood === 'shock' ? 1.22 : 1;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={12 * big} ry={15 * big} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={ex + (mood === 'shock' ? 0 : -3)} cy={ey + (mood === 'hope' ? -3 : 2)} r={mood === 'shock' ? 5 : 6.5} fill={INK} />
        <circle cx={ex - 1} cy={ey - 2} r={2.2} fill="#fff" />
      </g>
    );
  };
  const brows = mood === 'shock' || mood === 'sad' || mood === 'hope'
    ? [-1, 1].map((sd) => <path key={sd} d={mood === 'shock' ? `M ${sd * 12} -40 L ${sd * 36} -46` : `M ${sd * 12} -36 L ${sd * 36} -30`} stroke={INK} strokeWidth={5} strokeLinecap="round" />) : null;
  // mouth: open D (teeth or bare gums) or clenched zigzag
  const open = mood === 'shock' ? 1.15 : mood === 'sad' ? 0.6 : mood === 'gnaw' ? 0.5 + 0.4 * Math.abs(Math.sin(t * 22)) : mood === 'dizzy' ? 0.55 : mood === 'hope' ? 0.85 : 1;
  const mw = mood === 'shock' ? 26 : 36;
  const mouth = mood === 'chomp' || mood === 'strain' ? (
    <g>
      <rect x={-36} y={-8} width={72} height={20} rx={8} fill="#5A2328" stroke={INK} strokeWidth={5} />
      <TeethRow x0={-33} x1={33} n={7} h={9 * teeth} dir={1} y={-7} sw={2.5} />
      <TeethRow x0={-30} x1={30} n={6} h={9 * teeth} dir={-1} y={11} sw={2.5} />
    </g>
  ) : (
    <g>
      <path d={`M ${-mw} -6 Q 0 ${-10} ${mw} -6 Q ${mw * 0.9} ${36 * open} 0 ${40 * open} Q ${-mw * 0.9} ${36 * open} ${-mw} -6 Z`} fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M ${-mw + 4} -5 Q 0 -8 ${mw - 4} -5 L ${mw - 6} 1 Q 0 -2 ${-mw + 6} 1 Z`} fill={GUM} />
      <ellipse cx={0} cy={30 * open} rx={mw * 0.45} ry={6 * open} fill="#E4677A" />
      <TeethRow x0={-mw + 5} x1={mw - 5} n={mood === 'shock' ? 5 : 7} h={13 * teeth} dir={1} y={-4} />
      {teeth > 0.6 ? <TeethRow x0={-mw + 10} x1={mw - 10} n={6} h={8 * teeth} dir={1} y={6} fill="#E8E2D6" sw={2} /> : null}
      <TeethRow x0={-mw * 0.75} x1={mw * 0.75} n={5} h={11 * teeth * open} dir={-1} y={36 * open - 2} />
    </g>
  );
  return (
    <W><g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <circle r={R + 1} fill="url(#sFace)" stroke={INK} strokeWidth={6.5} />
      {eye(-1)}{eye(1)}{brows}
      <g transform="translate(0 28)">{mouth}</g>
    </g></W>
  );
};

// ---------- the lemon shark: rises out of the water next to the pier ----------
type SharkMood = 'smug' | 'laugh' | 'grin' | 'proud';
const Shark: React.FC<{t: number; mood: SharkMood; pop: number; swap: number; bob: number}> = ({t, mood, pop, swap, bob}) => {
  const laugh = mood === 'laugh';
  const y0 = bob + (laugh ? 6 * Math.sin(t * 28) : 0);
  const md = laugh ? 62 + 6 * Math.sin(t * 28) : mood === 'smug' ? 34 : 46;
  const my = -205;
  // old front row falls away while the new one snaps up (swap 0..1); in between both
  const oldH = 1 - clamp(swap * 1.6), newH = clamp((swap - 0.25) / 0.75);
  const eye = (sd: number) => {
    const ex = sd * 40, ey = -282;
    if (laugh) return <path key={sd} d={`M ${ex - 13} ${ey + 2} Q ${ex} ${ey - 11} ${ex + 13} ${ey + 2}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={14} ry={17} fill="#fff" stroke={INK} strokeWidth={5} />
        <circle cx={ex - 4} cy={ey + 3} r={7} fill={INK} />
        {mood === 'smug' ? <path d={`M ${ex - 14} ${ey - 2} A 14 17 0 0 1 ${ex + 14} ${ey - 2} Z`} fill={LEMON2} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
        {mood === 'proud' ? <path d={`M ${ex - 16 * sd} ${ey - 26} L ${ex + 12 * sd} ${ey - 30}`} stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
      </g>
    );
  };
  return (
    <W><g transform={`translate(${SX} ${y0})`}>
      {/* dorsal fin + side fins */}
      <path d="M 70 -190 L 170 -290 Q 150 -190 100 -120 Z" fill={LEMON2} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 95} -40 Q ${sd * 170} -10 ${sd * 190} 30 Q ${sd * 130} 20 ${sd * 90} 0 Z`} fill={LEMON2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
      {/* body */}
      <path d="M -112 60 C -124 -140 -78 -340 0 -372 C 78 -340 124 -140 112 60 Z" fill="url(#sLemon)" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d="M -84 60 C -92 -40 -70 -130 -6 -150 C 58 -130 80 -40 76 60 Z" fill={BELLY} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${82 + i * 9} ${-230 + i * 26} q 10 14 0 26`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />)}
      {eye(-1)}{eye(1)}
      <path d="M -10 -318 q 10 -6 20 0" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* mouth: a wide grin with rows of teeth */}
      <g transform={`translate(-4 ${my})`}>
        <path d={`M -84 -10 Q 0 6 84 -10 Q 70 ${md} 0 ${md + 6} Q -70 ${md} -84 -10 Z`} fill="#5A2328" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -78 -8 Q 0 6 78 -8 L 74 0 Q 0 12 -74 0 Z" fill={GUM} />
        {/* the rows behind (smaller, grey-white) */}
        <TeethRow x0={-62} x1={62} n={9} h={12} dir={1} y={9} fill="#E6DFCF" sw={2} />
        <TeethRow x0={-48} x1={48} n={8} h={9} dir={1} y={18} fill="#D2CABA" sw={2} />
        {/* the front row: old one drops on a swap, new one snaps up */}
        {oldH > 0.01 ? <g transform={`translate(0 ${30 * swap})`} opacity={oldH}><TeethRow x0={-76} x1={76} n={pop > 0 ? 9 : 10} h={20} dir={1} y={-2} /></g> : null}
        {newH > 0.01 ? <TeethRow x0={-76} x1={76} n={10} h={20 * eout(newH)} dir={1} y={-2} /> : null}
        <TeethRow x0={-56} x1={56} n={8} h={14 * Math.min(1, md / 40)} dir={-1} y={md + 2} />
      </g>
      {/* a tooth popping off (pop 0..1): flies out of his mouth, he does not care */}
      {pop > 0 && pop < 1 ? <path transform={`translate(${-60 - 160 * pop} ${my + 10 - 220 * pop + 320 * pop * pop}) rotate(${pop * 540}) scale(2.4)`} d="M -10 -10 L 10 -10 L 0 16 Z" fill={TOOTH} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /> : null}
    </g></W>
  );
};

const Defs: React.FC = () => (
  <W><defs>
    <radialGradient id="sFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <radialGradient id="sLemon" cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor="#E9DC9C" /><stop offset="1" stopColor={LEMON2} /></radialGradient>
  </defs></W>
);

// ---------- inserts (screen space) ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;

const Counter: React.FC<{t: number; s: number; value: number | string; label: string; done: boolean; icon: React.ReactNode; top?: number; doneAt: number}> = ({t, s, value, label, done, icon, top = 1460, doneAt}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s * (done ? 1 + 0.08 * Math.max(0, 1 - (t - doneAt) * 4) : 1)})`,
    background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '8px 32px 12px', fontFamily: FONT, color: INK,
    display: 'flex', alignItems: 'center', gap: 24, whiteSpace: 'nowrap'}}>
    {icon}
    <div>
      <div style={{fontWeight: 900, fontSize: 120, lineHeight: 1, color: done ? RED : INK}}>{value}</div>
      <div style={{fontWeight: 900, fontSize: 40}}>{label}</div>
    </div>
  </div>
) : null;
const CalIcon: React.FC<{flip: number}> = ({flip}) => (
  <svg width={120} height={120} viewBox="-60 -60 120 120">
    <rect x={-48} y={-40} width={96} height={92} rx={12} fill="#fff" stroke={INK} strokeWidth={7} />
    <rect x={-48} y={-40} width={96} height={26} rx={10} fill={RED} stroke={INK} strokeWidth={7} />
    {[-24, 24].map((x) => <path key={x} d={`M ${x} -52 V -30`} stroke={INK} strokeWidth={7} strokeLinecap="round" />)}
    {Array.from({length: 9}, (_, i) => <rect key={i} x={-34 + (i % 3) * 26} y={-4 + Math.floor(i / 3) * 18} width={16} height={10} rx={3} fill={i < flip ? GOLD : '#DDD6C8'} />)}
  </svg>
);
const ToothIcon = () => (
  <svg width={110} height={120} viewBox="-55 -60 110 120">
    <path d="M -38 -40 Q -40 -56 -18 -54 Q 0 -46 18 -54 Q 40 -56 38 -40 Q 36 -6 24 8 L 16 50 Q 8 56 2 44 L 0 20 L -2 44 Q -8 56 -16 50 L -24 8 Q -36 -6 -38 -40 Z" fill="#fff" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </svg>
);

const XFrame: React.FC<{id: string; R: number; children: React.ReactNode}> = ({id, R, children}) => (
  <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
    <clipPath id={id}><circle r={R} /></clipPath>
    <circle r={R + 18} fill={INK} />
    <g clipPath={`url(#${id})`}>
      <rect x={-450} y={-450} width={900} height={900} fill="#16223A" />
      {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
      {children}
    </g>
    <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
  </svg>
);
const XTooth: React.FC<{h?: number; fill?: string}> = ({h = 120, fill = '#F4F4F0'}) => (
  <path d={`M ${-h * 0.42} 0 L 0 ${-h} L ${h * 0.42} 0 Q ${h * 0.3} ${h * 0.16} 0 ${h * 0.18} Q ${-h * 0.3} ${h * 0.16} ${-h * 0.42} 0 Z`} fill={fill} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
);

/** X-RAY: the shark's jaw (side cut). Teeth sit in a band of gum on the jaw (no sockets); spare rows lie folded back
 *  inside and roll forward like a conveyor belt; the front tooth drops off. */
const beltAt = (t: number) => (t < 7.4 ? 0 : (t - 7.4) * 1.0);
const SharkXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const phi = beltAt(t);
  const gumY = -10;
  const teeth: React.ReactNode[] = [];
  for (let k = 0; k < 9; k++) {
    const p = k - phi;
    if (p < -1 || p > 4.8) continue;
    let x = -200 + p * 100, y = gumY + 14 + Math.max(0, p) * 26, rot = Math.min(Math.max(p, 0), 1.4) * 62, op = 1;
    if (p < 0) { const u = -p; x = -200 - 90 * u; y = gumY + 14 + 260 * u * u; rot = -80 * u; op = 1 - u; }
    const hgt = p > 0.5 ? lerp(185, 125, clamp((p - 0.5) / 3)) : 185;
    teeth.push(<g key={k} transform={`translate(${x} ${y}) rotate(${rot})`} opacity={op}><XTooth h={hgt} fill={p > 0.6 ? '#E2DED2' : '#FFFFFF'} /></g>);
  }
  const arrows = t > T.roll - 0.1 ? Array.from({length: 6}, (_, i) => {
    const x = 260 - (((t - T.roll) * 120 + i * 90) % 540);
    return <path key={i} d={`M ${x + 22} 150 L ${x} 165 L ${x + 22} 180`} stroke={GOLD} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  }) : null;
  const gumHi = t > T.gum - 0.1 && t < T.gum + 0.9 ? 0.5 + 0.5 * Math.sin((t - T.gum) * 18) : 0;
  return (
    <div style={{position: 'absolute', left: 540, top: 1000, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id="sxr" R={340}>
        {/* jaw (cartilage, no sockets) */}
        <path d="M -400 190 Q 0 120 400 190 L 400 450 L -400 450 Z" fill="#6F86A8" stroke="#A9C0E0" strokeWidth={6} />
        {/* gum band holding the teeth (drawn behind the folded teeth, the front is out) */}
        <path d={`M -400 ${gumY} Q -200 ${gumY - 14} 0 ${gumY} Q 200 ${gumY + 12} 400 ${gumY + 6} L 400 200 Q 0 130 -400 200 Z`} fill={GUM} fillOpacity={0.9} stroke="none" />
        {teeth}
        <path d={`M -400 ${gumY} Q -200 ${gumY - 14} 0 ${gumY} Q 200 ${gumY + 12} 400 ${gumY + 6} L 400 200 Q 0 130 -400 200 Z`} fill={GUM} fillOpacity={0.18} stroke={gumHi > 0 ? GOLD : GUM2} strokeWidth={6 + 8 * gumHi} />
        {arrows}
        <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
      </XFrame>
      <Card text="X-RAY: SHARK JAW" top={90} size={50} />
      <Card text="NO BONE" top={300} left={175} color={RED} fg="#fff" rot={-8} s={popIn(t, 5.55, 0.3)} size={54} />
      <Card text="JUST GUM" top={300} left={775} color={GOLD} rot={7} s={popIn(t, T.gum - 0.05, 0.3)} size={52} />
      <Card text="SPARE ROWS" top={700} left={720} color="#fff" rot={-5} s={pulse(t, T.spare - 0.05, 1.0)} size={48} />
      <Card text="CONVEYOR BELT" top={820} color={GOLD} rot={2} s={popIn(t, T.conveyor - 0.05, 0.3)} size={52} />
    </div>
  );
};

/** X-RAY: YOUR jaw. Roots locked in bone, 2 sets for life; at "That's it" the tooth is knocked out: GONE FOR GOOD */
const YourXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const k = T.thats;
  const out = eout(seg(t, k, k + 0.45));
  const sets = t > T.sets ? 2 : 1;
  return (
    <div style={{position: 'absolute', left: 540, top: 960, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s})`}}>
      <XFrame id="yxr" R={340}>
        {/* bone with spongy dots */}
        <rect x={-450} y={-40} width={900} height={500} fill="#CFC8B4" />
        {Array.from({length: 40}, (_, i) => <circle key={i} cx={-330 + rnd(i * 5) * 660} cy={0 + rnd(i * 9) * 320} r={6 + rnd(i) * 10} fill="#B5AD96" />)}
        {/* gum */}
        <path d="M -450 -60 Q 0 -90 450 -60 L 450 -10 Q 0 -40 -450 -10 Z" fill={GUM} stroke={GUM2} strokeWidth={6} />
        {/* empty socket */}
        <path d="M -70 -30 L -60 230 Q -40 260 -20 230 L 0 60 L 20 230 Q 40 260 60 230 L 70 -30 Z" fill="#5A3A3A" opacity={out} />
        {/* your tooth: crown + two long roots in the bone */}
        <g transform={`translate(${-260 * out} ${-420 * out + 300 * out * out}) rotate(${-120 * out})`}>
          <path d="M -80 -170 Q -86 -210 -40 -206 Q 0 -192 40 -206 Q 86 -210 80 -170 Q 78 -60 64 -30 L 56 220 Q 42 250 26 224 L 0 70 L -26 224 Q -42 250 -56 220 L -64 -30 Q -78 -60 -80 -170 Z" fill="#F4F4F0" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <path d="M -40 -30 L -36 180 M 40 -30 L 36 180" stroke="#E7A0A0" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
        </g>
        {/* neighbour teeth */}
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 200} -200 Q ${sd * 150} -200 ${sd * 150} -150 L ${sd * 160} 60 L ${sd * 200} 220 L ${sd * 300} 220 L ${sd * 300} -200 Z`} fill="#F4F4F0" stroke={INK} strokeWidth={7} strokeLinejoin="round" />)}
        <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
      </XFrame>
      <Card text="YOUR JAW" top={90} />
      <Card text="LOCKED IN BONE" top={760} left={450} color={GOLD} rot={-4} s={popIn(t, 13.45, 0.3) * (1 - seg(t, k, k + 0.15))} size={50} />
      <Card text="GONE FOR GOOD" top={760} left={450} color={RED} fg="#fff" rot={-4} s={popIn(t, k + 0.25, 0.3)} size={54} />
      <Card text="DANGER" top={300} left={160} color={RED} fg="#fff" rot={-9} s={popIn(t, k + 0.1, 0.3)} size={52} />
      {/* sets counter */}
      <div style={{position: 'absolute', left: 790, top: 330, transform: `translate(-50%,-50%) rotate(6deg) scale(${popIn(t, T.two - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - (t - T.sets) * 4) * (t > T.sets ? 1 : 0))})`,
        background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 26px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{fontWeight: 900, fontSize: 110, lineHeight: 1, color: t > k ? RED : INK}}>{sets}</div>
        <div style={{fontWeight: 900, fontSize: 34}}>SETS OF TEETH</div>
        <div style={{fontWeight: 800, fontSize: 28}}>SHARK: NO LIMIT</div>
      </div>
    </div>
  );
};

// ---------- the story over time ----------
type GuyState = {pose: Pose; mood: HeadMood; teeth: number; bite: number; rot: number; dy: number; dx: number};
const LUNGE = 17.45;               // he bites the apple again at the end (= frame 0)
const guyAt = (t: number): GuyState => {
  const base: GuyState = {pose: 'front_calm', mood: 'sad', teeth: 0, bite: 0, rot: 0, dy: 0, dx: 0};
  const chew = (tt: number) => 3 * Math.sin(tt * 24);
  if (t < 1.6) return {...base, mood: 'chomp', teeth: 1, bite: 1, rot: -8, dy: chew(t)};
  if (t < T.rips) return {...base, mood: 'strain', teeth: 1, bite: 1 + 0.08 * Math.sin(Math.PI * seg(t, 1.65, 1.95)), rot: -10, dy: 2 * Math.sin(t * 40)};
  if (t < T.rips + 0.25) { const u = eout(seg(t, T.rips, T.rips + 0.25)); return {...base, pose: 'surprised', mood: 'shock', teeth: 0, bite: lerp(1, -0.5, u), rot: lerp(-10, 8, u)}; }
  if (t < 3.8) return {...base, pose: 'surprised', mood: 'shock', bite: -0.5 + 0.5 * seg(t, 3.0, 3.7), rot: 8 * (1 - seg(t, 3.0, 3.7))};
  if (t < 9.3) return {...base, pose: 'front_worried', mood: 'sad'};
  if (t < 9.6) return {...base, mood: 'gnaw', bite: 0.9 * Math.sin(Math.PI * seg(t, 9.3, 9.6)), rot: -6};
  if (t < BOING) return {...base, mood: 'gnaw', rot: -3};
  if (t < 10.7) { const u = seg(t, BOING, 10.7); return {...base, pose: 'scared', mood: 'dizzy', rot: 12 * Math.sin(t * 16) * (1 - u) + 6, dx: 10 * (1 - u)}; }
  if (t < 15.9) return {...base, pose: 'front_worried', mood: 'sad'};
  if (t < T.inn) return {...base, mood: 'hope', teeth: eout(seg(t, 16.2, T.inn))};
  if (t < LUNGE) return {...base, pose: 'laugh', mood: 'happy', teeth: 1};
  const u = eio(seg(t, LUNGE, 17.85));
  return {...base, mood: 'chomp', teeth: 1, bite: u, rot: -8 * u, dy: u > 0.95 ? chew(t) : 0};
};
const sharkAt = (t: number): {mood: SharkMood; pop: number; swap: number} => {
  const pop = seg(t, 4.3, 5.0);
  const swap = seg(t, SWAP, SWAP + 0.4);
  if (t > 2.8 && t < 3.8) return {mood: 'laugh', pop: 0, swap: 0};
  if (t > BOING && t < 10.9) return {mood: 'laugh', pop, swap: 0};
  if (t > 3.8 && t < 5.6) return {mood: 'grin', pop, swap: 0};
  if (t > SWAP - 0.1 && t < 13.6) return {mood: 'proud', pop, swap};
  return {mood: 'smug', pop, swap};
};

export const SharkScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: -62, y: -250, k: 2.8}, {t: 1.5, x: -62, y: -250, k: 2.92},                 // both big: he chomps the apple, smug shark
    {t: 1.53, x: -150, y: -240, k: 3.5}, {t: 3.78, x: -150, y: -240, k: 3.75},             // his face + apple: CRUNCH, RIP, GONE
    {t: 3.81, x: SX - 10, y: -250, k: 3.2}, {t: 5.5, x: SX - 10, y: -250, k: 3.45},       // the shark: a tooth pops off, NO BONE
    {t: 5.53, x: -10, y: -250, k: 2.1}, {t: 9.28, x: -10, y: -250, k: 2.22},              // behind the shark X-ray
    {t: 9.31, x: -150, y: -240, k: 3.2}, {t: 10.6, x: -150, y: -240, k: 3.4},             // gums vs apple: BOING, dizzy
    {t: 10.63, x: SX - 20, y: -330, k: 2.5}, {t: 13.38, x: SX - 20, y: -330, k: 2.7},     // the shark + DAYS counter, new row
    {t: 13.41, x: -10, y: -250, k: 2.1}, {t: 15.35, x: -10, y: -250, k: 2.2},             // behind YOUR JAW
    {t: 15.38, x: -80, y: -255, k: 2.9}, {t: 17.3, x: -70, y: -255, k: 3.1},              // his next row rolls in
    {t: 17.33, x: -62, y: -250, k: 2.8},                                                  // = the frame-0 shot
  ], t);
  const sh = shake(t, hit(t, 0, 6, 7) + hit(t, T.bite, 5, 7) + hit(t, T.rips, 8, 6) + hit(t, BOING, 9, 5) + hit(t, SWAP, 4, 7));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t), sk = sharkAt(t);
  const hd = headAt(g.pose);
  const hx = GX + hd.hx + BITE_DX * g.bite + g.dx, hy = hd.hy + g.dy + 6 * g.bite;
  const bob = 6 * Math.sin(t * 2.1);
  const ap = appleAt(t);
  // inserts
  const sxS = popIn(t, 5.53, 0.35) * (1 - seg(t, 9.1, 9.28));
  const yxS = popIn(t, 13.41, 0.35) * (1 - seg(t, 15.2, 15.36));
  const dayS = popIn(t, 10.75, 0.3) * (1 - seg(t, 13.25, 13.38));
  const days = Math.round(14 * seg(t, 11.0, T.weeks));
  // stickers
  const chomp0 = t < 1.4 ? 1 - seg(t, 1.2, 1.4) : 0;
  const crunch = pulse(t, T.bite, 0.5), rip = pulse(t, T.rips, 0.55), gone = pulse(t, T.out - 0.05, 0.4);
  const ping = pulse(t, 4.35, 0.5), noBone = pulse(t, T.bone - 0.05, 0.4);
  const gummy = pulse(t, 9.35, 0.4), boing = pulse(t, BOING, 0.5);
  const lemonS = pulse(t, T.lemon - 0.05, 1.0), newRow = pulse(t, SWAP, 0.45);
  const nextS = pulse(t, T.next, 0.9), ding = pulse(t, T.inn, 0.3), chompEnd = t > 17.85 ? popIn(t, 17.85, 0.2) : 0;
  const stars = t > BOING && t < 10.7 ? 1 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Defs />
      <Sky />
      <Layer cam={cam} z={2600} paper={false}>
        <W><g>
          {[-900, -300, 500, 1100].map((x, i) => <ellipse key={i} cx={x} cy={-40} rx={420} ry={150} fill="#CFE6B8" stroke={INK} strokeWidth={6} />)}
        </g></W>
        <Sea t={t} x0={-3000} x1={4000} fill="#9DD3EA" op={1} amp={6} phase={1} />
      </Layer>
      <Layer cam={cam} z={1000}><Tree t={t} /></Layer>
      <Layer cam={cam} z={1000} paper={false}><W><g transform="translate(0 22)"><Sea t={t} x0={-3000} x1={4000} fill="#6FBCE0" op={1} amp={8} shine /></g></W></Layer>
      <Layer cam={cam} z={1000}>
        <Shark t={t} mood={sk.mood} pop={sk.pop} swap={sk.swap} bob={bob} />
      </Layer>
      <Layer cam={cam} z={1000} paper={false}><W><g transform="translate(0 46)"><Sea t={t} x0={60} x1={4000} fill="#6FBCE0" op={0.55} amp={7} phase={2.2} shine={false} line={6} /></g></W></Layer>
      <Layer cam={cam} z={1000}>
        <Pier />
        <Guy pose={g.pose} x={GX + g.dx + BITE_DX * g.bite} y={0} t={t} rot={g.rot * 0.2} />
        <GuyHead t={t} x={hx} y={hy} mood={g.mood} teeth={g.teeth} rot={g.rot} />
        <Apple t={t} />
      </Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={hx + Math.cos(a) * 90} y={hy - 95 + Math.sin(a) * 16} s={stars * 0.5} rot={t * 200} />;
        })}
        {thumb ? null : <>
        <Txt x={hx + 50} y={hy + 120} s={chomp0} text="CHOMP" size={60} rot={-7} fill={GOLD} />
        <Txt x={ap.x - 10} y={ap.y + 90} s={crunch} text="CRUNCH" size={50} rot={-6} fill="#FFFFFF" />
        <Txt x={hx + 30} y={hy - 110} s={rip} text="RIP" size={70} rot={8} fill={RED} />
        <Txt x={hx + 10} y={hy + 112} s={gone} text="GONE" size={58} rot={-5} fill={GOLD} />
        <Txt x={SX - 150} y={-420} s={ping} text="PING" size={50} rot={-10} fill="#FFFFFF" />
        <Txt x={SX - 10} y={-80} s={noBone} text="NO BONE" size={52} rot={5} fill={RED} />
        <Txt x={hx + 40} y={hy + 112} s={gummy} text="GUMMY" size={50} rot={6} fill={GOLD} />
        <Txt x={hx - 30} y={hy - 110} s={boing} text="BOING" size={60} rot={-8} fill="#FFFFFF" />
        <Txt x={SX - 10} y={-440} s={lemonS} text="LEMON SHARK" size={46} rot={-4} fill={GOLD} />
        <Txt x={SX - 10} y={-445} s={newRow} text="NEW ROW" size={50} rot={5} fill="#FFFFFF" />
        <Txt x={hx} y={hy - 112} s={nextS} text="NEXT ROW" size={44} rot={-5} fill={GOLD} />
        <Txt x={hx + 85} y={hy + 30} s={ding} text="DING" size={40} rot={10} fill="#FFFFFF" />
        <Txt x={hx + 50} y={hy + 120} s={chompEnd} text="CHOMP" size={60} rot={-7} fill={GOLD} />
        </>}
      </Layer>
      {thumb ? null : <>
        <Counter t={t} s={dayS} value={days} label={t > T.weeks ? 'DAYS = NEW ROW' : 'DAYS'} done={t > T.weeks} doneAt={T.weeks} icon={<CalIcon flip={Math.round(9 * days / 14)} />} />
      </>}
      <SharkXRay t={t} s={sxS} />
      <YourXRay t={t} s={yxS} />
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you had a shark's teeth??" handle="@fin_doodles" likes="2.7K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.good - 0.05} until={DURATION - LOOP_DUR - 0.4} text="Would you swap your teeth?" />
      </>}
    </AbsoluteFill>
  );
};

export const SharkVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -28): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -18 : db}));
  const cues: Cue[] = [
    {f: 'waves.wav', at: 0, db: -34, to: 18.4},
    // frame 0: he is already chomping the apple
    {f: 'crack.wav', at: 0, db: -14}, {f: 'whoosh.wav', at: 0, db: -18}, {f: 'pop.wav', at: 0.05, db: -24},
    {f: 'whoosh.wav', at: 1.5, db: -28}, {f: 'crack.wav', at: T.bite, db: -16}, {f: 'strain.mp3', at: 1.95, db: -26, to: 0.6},
    {f: 'twang.mp3', at: T.rips, db: -18, to: 0.5}, {f: 'pop.wav', at: T.rips + 0.02, db: -18}, {f: 'crowd_laugh.wav', at: 2.9, db: -32, to: 0.9},
    {f: 'pop.wav', at: T.out, db: -22},
    {f: 'whoosh.wav', at: 3.79, db: -28}, {f: 'pop.wav', at: 4.33, db: -20}, {f: 'tick.wav', at: 4.85, db: -22}, {f: 'pop.wav', at: T.bone, db: -22},
    {f: 'zap.wav', at: 5.53, db: -26}, {f: 'pop.wav', at: 5.6, db: -22}, {f: 'pop.wav', at: T.gum, db: -22},
    {f: 'whir.mp3', at: 7.4, db: -30, to: 1.9}, {f: 'pop.wav', at: T.spare, db: -24}, {f: 'tick2.wav', at: 8.4, db: -24}, {f: 'tick2.wav', at: 9.4, db: -24},
    {f: 'ding.mp3', at: T.conveyor, db: -24},
    {f: 'whoosh.wav', at: 9.29, db: -28}, {f: 'squeak.wav', at: 9.38, db: -24}, {f: 'whoosh.wav', at: 9.55, db: -26},
    {f: 'twang.mp3', at: BOING, db: -14, to: 0.6}, {f: 'pop.wav', at: BOING + 0.02, db: -18}, {f: 'crowd_laugh.wav', at: BOING + 0.05, db: -27, to: 1.2}, {f: 'giggle.mp3', at: 10.1, db: -32, to: 0.6},
    {f: 'whoosh.wav', at: 10.61, db: -28}, {f: 'pop.wav', at: 10.75, db: -24}, {f: 'pop.wav', at: T.lemon, db: -26},
    ...ticks(11.0, T.weeks, 14), {f: 'ding.mp3', at: SWAP, db: -18}, {f: 'pop.wav', at: SWAP + 0.05, db: -22},
    ...ctaCues(T.cta),
    {f: 'zap.wav', at: 13.41, db: -26}, {f: 'pop.wav', at: 13.45, db: -24}, {f: 'tick.wav', at: T.two - 0.1, db: -22}, {f: 'tick2.wav', at: T.sets, db: -20},
    {f: 'crack.wav', at: T.thats, db: -18}, {f: 'horn.wav', at: T.thats + 0.1, db: -32, to: 0.6}, {f: 'pop.wav', at: T.thats + 0.25, db: -22},
    {f: 'whoosh.wav', at: 15.36, db: -28}, {f: 'whir.mp3', at: 16.2, db: -30, to: 0.95}, {f: 'ding.mp3', at: T.inn, db: -20},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26}, {f: 'crack.wav', at: 17.85, db: -20},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<SharkScene t={0} />}>
        <SharkScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="shark/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const SharkWide: React.FC = () => <WideFit.Provider value={0.72}><SharkVideo /></WideFit.Provider>;
