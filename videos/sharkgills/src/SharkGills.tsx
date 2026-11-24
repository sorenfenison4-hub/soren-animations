// "What if you could breathe like a shark?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// Frame 0: he swims beside a smug great white, breathing underwater through gill slits on his neck (bubbles streaming).
// 1.3 s he stops to wave; 2.15 close-up: no water flows, he turns blue, cheeks puff, eyes bulge (GLUG, OXYGEN 100 -> 12 %),
// he bolts. Then the shark: X-RAY: SHARK GILLS (NO PUMP, GILLS, KEEP SWIMMING, MOUTH OPEN, water arrows). Comedy hit: a fish
// is sucked into his open mouth and FWOOPs out of his gill. The map: 20,000 KM in 9 MONTHS. The bed gag (no naps), and the
// ending: he holds the shark's fin and sleeps while it tows him (FREE RIDE) = frame 0 (they swim side by side).
// Everything is drawn in code (the guy on a small IK rig, the head drawn upright on the swimming body).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, Key, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble} from './lib/kit';

// voice: tight.mp3 at 0.1 s (scripts/vsplice.py: line 1 at 1.22, the rest at 1.12). Last word ends 17.38 s; + 0.8 s for the push.
export const DURATION = 18.2;
export const T = {
  shark: 0.66, stop: 1.78, swimming: 2.02, youd: 2.76, suff: 2.98,            // "Breathe like a shark, and if you ever stop swimming, you'd suffocate."
  great: 3.90, white: 4.18, cant: 4.46, pump: 4.74, gills: 5.72,              // "A great white can't pump water over its gills."
  keep: 6.96, mouth: 7.78, open: 8.05, water: 8.64, rushes: 9.04, through: 9.37, // "It has to keep swimming with its mouth open, so water rushes through."
  one: 10.20, twenty: 10.91, km: 11.70, nine: 12.70, months: 13.13,           // "One swam twenty thousand kilometers in nine months."
  you: 13.74, stop2: 14.24, sleep: 14.73,                                     // "You couldn't even stop to sleep."
  so: 15.44, he: 15.98, sharkEnd: 16.43, swim3: 16.87,                        // "So he lets the shark do the swimming."
  cta: 10.5,
};
const S2 = 1.3, S3 = 2.15, S4 = 3.7, XR = 4.3, S5 = 8.18, S6 = 10.05, S7 = 13.6, S8 = 15.35;
const PUSH = DURATION - LOOP_DUR;
const BOLT = 3.3;                  // he bolts out of the close-up
const GULP = 8.64, FWOOP = 9.07;   // the fish goes in his mouth / out of his gill
const KM0 = 10.4, KM_AUS = 11.95, KM_BACK = 12.05, KM1 = 13.1;
const BED_X = 2400, SAND_Y = 330;
const WAKE = 14.78, ROCKET = 14.98;
const GRAB = 16.12;
const SX0 = -23, SY0 = 157;    // the shark at frame 0 and in the tow at the end (same framing)
const HOLD = 0.75;             // where on the dorsal fin he holds on (0 = base front, 1 = tip)

const GOLD = '#FFD43B', RED = '#E2453C';
const WATER = '#A9DDEF', WATER_DK = '#86C9E0', WATER_DEEP = '#7DBFD9';
const SAND = '#F2DEA8', SAND_DK = '#DEC585', WEED = '#72C17A', WEED_DK = '#4E9E57', ROCK = '#A3B5C2', ROCK_DK = '#82978F';
const SHARK = '#8E9DAD', SHARK_DK = '#6F7F90', BELLY = '#FFFFFF';
const BLUE_FACE = '#A9C4F0';
const FISH = '#FF9A3C', FISH_DK = '#E0761B';
const LAND = '#F3D58A', OCEAN = '#8FD3EC';

type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const rot2 = (p: P2, deg: number): P2 => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.26) * (1 - seg(t, a + d, a + d + 0.12));

// ---------- stickers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;

// ---------- the guy: front view on a small IK rig, hip at (0, 0), rotated as a whole; the head stays upright ----------
const ik = (A: P2, F: P2, L1: number, L2: number, bend: number): P2 => {
  const dx = F[0] - A[0], dy = F[1] - A[1], D = Math.hypot(dx, dy) || 1;
  const d = Math.min(D, L1 + L2 - 0.01);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / D, uy = dy / D;
  return [A[0] + ux * a - uy * h * bend, A[1] + uy * a + ux * h * bend];
};
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; hand?: boolean}> = ({S, H, L, sd, w = 29, hand = true}) => {
  const E = ik(S, H, L, L, sd);
  const C: P2 = [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2];
  const d = `M ${P(S)} Q ${P(C)} ${P(H)}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#FFFFFF" strokeWidth={w - 11} fill="none" strokeLinecap="round" />
      {hand ? <circle cx={H[0]} cy={H[1]} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} /> : null}
    </g>
  );
};
const torsoD = (tw: number, top: number, bot: number) => {
  const h = bot - top, r1 = Math.min(34, h * 0.3), r2 = Math.min(29, h * 0.26), sw = tw * 0.6;
  return `M ${-sw} ${top} C ${-tw + 5} ${top + r1 * 0.18} ${-tw} ${top + r1 * 0.5} ${-tw} ${top + r1} L ${-tw + 1} ${bot - r2} Q ${-tw + 1} ${bot} ${-tw + r2} ${bot} ` +
    `L ${tw - r2} ${bot} Q ${tw - 1} ${bot} ${tw - 1} ${bot - r2} L ${tw} ${top + r1} C ${tw} ${top + r1 * 0.5} ${tw - 5} ${top + r1 * 0.18} ${sw} ${top} Z`;
};
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${ex - rx} ${ey} A ${rx} ${ry} 0 0 1 ${ex + rx} ${ey} L ${ex + w} ${y} L ${ex - w} ${y} Z`;
};

type Mood = 'swim' | 'happy' | 'worry' | 'choke' | 'pop' | 'gape' | 'cheek' | 'relief' | 'yawn' | 'sleep' | 'sleepy' | 'hope' | 'grin';
type GS = {x: number; y: number; rot: number; tilt: number; mood: Mood; blue: number; puff: number; flow: number; gasp: number; mask: number;
  bulge: number; armA: P2; armB: P2; footA: P2; footB: P2; look: number; lookY: number; sq: number; show: number};
const SHX = 38, SH_Y = -90, NECK = -165;
const headLocal: P2 = [0, NECK];
const headWorld = (g: GS): P2 => add([g.x, g.y], rot2(headLocal, g.rot));
const handWorld = (g: GS, b: boolean): P2 => add([g.x, g.y], rot2(add([b ? SHX : -SHX, SH_Y], b ? g.armB : g.armA), g.rot));

const Mouth: React.FC<{mood: Mood; t: number}> = ({mood, t}) => {
  if (mood === 'swim' || mood === 'relief') return <g><ellipse cx={0} cy={10} rx={mood === 'relief' ? 20 : 17} ry={mood === 'relief' ? 15 : 19} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={21} rx={9} ry={5} fill="#E4677A" /></g>;
  if (mood === 'grin') return <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  if (mood === 'happy' || mood === 'hope') return <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  if (mood === 'worry') return <path d="M -18 10 q 6 -6 12 0 t 12 0 t 12 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  if (mood === 'choke' || mood === 'cheek') return <path d={`M -11 ${8 + 1.5 * Math.sin(t * 30)} q 4 -4 7 0 t 7 0 t 7 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  if (mood === 'sleep') return <ellipse cx={0} cy={10} rx={6 + 1.5 * Math.sin(t * 5)} ry={7 + 2 * Math.sin(t * 5)} fill="#5A2328" stroke={INK} strokeWidth={4} />;
  if (mood === 'sleepy') return <path d="M -12 10 Q 0 13 12 10" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  if (mood === 'yawn') return <g><ellipse cx={0} cy={14} rx={18} ry={25} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={28} rx={10} ry={7} fill="#E4677A" /></g>;
  if (mood === 'gape') return <g><ellipse cx={0} cy={14} rx={24} ry={26} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={28} rx={12} ry={7} fill="#E4677A" /></g>;
  return <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;   // pop
};

/** gill slits on both cheeks: open = water flowing (pulses), flutter = gasping (fast, no water) */
const Gills: React.FC<{t: number; open: number; flutter: number}> = ({t, open, flutter}) => (
  <g>
    {[-1, 1].map((sd) => [0, 1, 2].map((i) => {
      const x = sd * (35 + i * 8.5), y0 = 2 + i * 2, h = 34 - i * 6;
      const o = clamp(open * (0.6 + 0.4 * Math.sin(t * 16 + i * 0.9)) + flutter * (0.45 + 0.45 * Math.sin(t * 44 + i * 1.7 + sd)));
      const w = 1.4 + 7 * o;
      const d = `M ${x} ${y0} Q ${x + sd * (2 + w)} ${y0 + h / 2} ${x + sd * 4} ${y0 + h} Q ${x + sd * (2 - w * 0.55)} ${y0 + h / 2} ${x} ${y0} Z`;
      return <g key={sd + '_' + i}>
        <path d={d} fill={o > 0.08 ? '#7A1E2B' : 'none'} stroke={INK} strokeWidth={3.6} strokeLinejoin="round" />
        {o > 0.35 ? <path d={`M ${x + sd * 1.5} ${y0 + 5} Q ${x + sd * (2 + w * 0.4)} ${y0 + h / 2} ${x + sd * 3.5} ${y0 + h - 5}`} stroke="#E46A72" strokeWidth={2.5} fill="none" strokeLinecap="round" /> : null}
      </g>;
    }))}
  </g>
);

const Head: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  const m = g.mood, R = HEAD_R;
  const rx = R * (1 + 0.13 * g.puff), ry = R * (1 + 0.02 * g.puff);
  const eye = (sd: number) => {
    const ex = sd * 25, ey = -14;
    if (m === 'swim' || m === 'relief' || m === 'grin' || m === 'yawn') return <path key={sd} d={`M ${ex - 13} ${ey + 4} Q ${ex} ${ey - 12} ${ex + 13} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (m === 'sleep') return <path key={sd} d={`M ${ex - 12} ${ey} Q ${ex} ${ey + 8} ${ex + 12} ${ey}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    const big = m === 'choke' ? 1.38 : m === 'pop' || m === 'gape' ? 1.25 : m === 'cheek' ? 1.15 : 1;
    const lid = m === 'sleepy' ? 0.55 : 0;
    const erx = 12 * big, ery = 15 * big;
    const pr = m === 'choke' ? 4.2 : m === 'pop' || m === 'gape' ? 5.2 : 6.3;
    const px = g.look * 4, py = g.lookY * 4 + (m === 'hope' ? -3 : 0);
    return <g key={sd}>
      <ellipse cx={ex} cy={ey} rx={erx} ry={ery} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + px} cy={ey + 1 + lid * 7 + py} r={pr} fill={INK} />
      <circle cx={ex + px - 1.5} cy={ey - 1 + lid * 7 + py} r={1.8} fill="#fff" />
      {lid ? <path d={lidPath(ex, ey, erx + 0.5, ery + 0.5, lid)} fill="#F1EFEA" stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
    </g>;
  };
  const brow = (sd: number) => {
    let d = `M ${sd * 12} -45 Q ${sd * 25} -53 ${sd * 38} -47`;
    if (m === 'worry' || m === 'choke' || m === 'cheek') d = `M ${sd * 10} -50 L ${sd * 38} -42`;
    else if (m === 'pop' || m === 'gape' || m === 'hope') d = `M ${sd * 12} -55 Q ${sd * 25} -65 ${sd * 38} -57`;
    else if (m === 'sleepy' || m === 'sleep') d = `M ${sd * 12} -40 L ${sd * 38} -40`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  const sweat = m === 'choke' ? [0, 1].map((i) => {
    const ph = (t * 1.1 + i * 0.5) % 1, sd = i ? 1 : -1;
    return <path key={'sw' + i} transform={`translate(${sd * 58} ${-34 + ph * 30}) scale(${0.55 * Math.sin(Math.PI * ph)})`} d="M 0 -26 C 10 -10 16 0 16 8 A 16 16 0 0 1 -16 8 C -16 0 -10 -10 0 -26 Z" fill="#8ED3FF" stroke={INK} strokeWidth={5} />;
  }) : null;
  return (
    <g transform={`scale(${(1 + 0.1 * g.sq).toFixed(3)} ${(1 - 0.12 * g.sq).toFixed(3)})`}>
      <ellipse rx={rx + 1} ry={ry + 1} fill={`url(#gFace${uid})`} stroke={INK} strokeWidth={6.5} />
      {g.blue > 0.01 ? <ellipse rx={rx - 2.5} ry={ry - 2.5} fill={BLUE_FACE} opacity={0.92 * g.blue} /> : null}
      {g.bulge > 0.01 ? <g>
        <circle cx={-44} cy={22} r={26 * g.bulge} fill={g.blue > 0.5 ? BLUE_FACE : '#F4F2EE'} />
        <path d={`M ${-44 - 26 * g.bulge} 22 A ${26 * g.bulge} ${26 * g.bulge} 0 0 1 ${-44 + 8 * g.bulge} ${22 - 25 * g.bulge}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      </g> : null}
      <Gills t={t} open={g.flow} flutter={g.gasp} />
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)"><Mouth mood={m} t={t} /></g>
      {g.puff > 0.05 ? [-1, 1].map((sd) => <path key={'pf' + sd} d={`M ${sd * 30} ${18} Q ${sd * (44 + 8 * g.puff)} ${30} ${sd * 32} ${46}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" opacity={g.puff} />) : null}
      {sweat}
      {g.mask > 0.01 ? <g opacity={clamp(g.mask * 3)} transform={`translate(0 ${-40 * (1 - g.mask)})`}>
        <path d={`M ${-rx} -30 Q 0 -40 ${rx} -30`} stroke={INK} strokeWidth={9} fill="none" />
        <path d="M -50 -30 Q -50 -42 -32 -42 L 32 -42 Q 50 -42 50 -30 L 50 -6 Q 50 4 32 4 Q 0 -6 -32 4 Q -50 4 -50 -6 Z" fill="#3E5BA8" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 34} -18 q ${sd * -8} 6 ${sd * -16} 0`} stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" />)}
      </g> : null}
    </g>
  );
};

const Guy: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  if (g.show < 0.5) return null;
  const SA: P2 = [-SHX, SH_Y], SB: P2 = [SHX, SH_Y];
  return (
    <W><g transform={`translate(${g.x.toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)})`}>
      {[g.footA, g.footB].map((f, i) => <Limb key={'l' + i} S={[(i ? 1 : -1) * 19, 4]} H={f} L={37} sd={i ? -1 : 1} w={30} hand={false} />)}
      {[g.footA, g.footB].map((f, i) => <ellipse key={'f' + i} cx={f[0] + (i ? 2 : -2)} cy={f[1] + 5} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />)}
      <path d={torsoD(47, -112, 13)} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <Limb S={SA} H={add(SA, g.armA)} L={77} sd={g.armA[1] > 0 ? 1 : -1} />
      <Limb S={SB} H={add(SB, g.armB)} L={77} sd={g.armB[1] > 0 ? -1 : 1} />
      <g transform={`translate(0 ${NECK}) rotate(${(-g.rot + g.tilt).toFixed(2)})`}><Head t={t} g={g} uid={uid} /></g>
    </g></W>
  );
};

/** bubbles streaming out of his gills while water flows: left side backward over his shoulder, right side up behind his head */
const GillBubbles: React.FC<{t: number; at: (tt: number) => {hx: number; hy: number; flow: number}; front: boolean}> = ({t, at, front}) => {
  const out: React.ReactNode[] = [];
  const N = 24, LIFE = 0.85;
  for (let k = 0; k < N; k++) {
    const a = ((t / LIFE) + k / N) % 1, tb = t - a * LIFE;
    const src = at(Math.max(0, tb));
    if (src.flow < 0.3) continue;
    const sd = k % 2 ? 1 : -1;
    if ((sd < 0) !== front) continue;
    const cur = at(t);
    const j = rnd(k * 7.3 + Math.floor(t / LIFE + k / N) * 3.1);
    const vx = sd < 0 ? -230 - 80 * j : -70 - 40 * j, vy = sd < 0 ? -50 - 60 * j : -170 - 50 * j;
    const x = cur.hx + sd * 54 + vx * a * LIFE, y = cur.hy + 22 + vy * a * LIFE + 8 * Math.sin(a * 9 + k);
    const r = (7 + 9 * j) * (0.6 + 0.7 * a) * Math.min(1, src.flow) * (a > 0.85 ? (1 - a) / 0.15 : 1);
    out.push(<circle key={k} cx={x} cy={y} r={r} fill="#E9F7FF" fillOpacity={0.75} stroke={INK} strokeWidth={3} />);
  }
  return <W>{out}</W>;
};

// ---------- the great white (side view, facing right, origin mid-body) ----------
type SMood = 'smug' | 'grin' | 'laugh' | 'annoyed' | 'roll';
type SS = {x: number; y: number; s: number; mood: SMood; mouth: number; show: number; shake: number};
const BODY_D = 'M 430 -8 C 420 -60 330 -112 230 -122 C 120 -134 20 -140 -60 -132 C -180 -118 -300 -72 -380 -34 L -418 -22 L -418 22 ' +
  'C -330 52 -200 100 -60 112 C 80 122 220 110 320 70 C 380 46 418 24 430 -8 Z';
const BELLY_D = 'M 440 2 L 380 18 L 340 24 L 300 20 L 262 34 L 222 30 L 180 42 L 120 38 L 60 50 L 0 44 L -60 52 L -130 42 L -200 38 L -270 24 L -340 16 L -430 6 L -430 220 L 440 220 Z';
const DORSAL_D = 'M 122 -128 Q 92 -262 -16 -332 Q -26 -232 -86 -130 Z';
const PEC_D = 'M 214 62 Q 168 168 46 252 Q 104 160 122 90 Z';
const TAIL_D = 'M -405 -28 C -450 -92 -500 -172 -556 -232 C -540 -140 -520 -62 -496 -4 C -515 40 -530 92 -542 134 C -490 92 -442 52 -405 26 Z';
const SHARK_EYE: P2 = [302, -52];
const Shark: React.FC<{t: number; S: SS; uid: string}> = ({t, S, uid}) => {
  if (S.show < 0.5) return null;
  const sway = 9 * Math.sin(t * 2 * Math.PI * 1.1);
  const laugh = S.mood === 'laugh';
  const jig = laugh ? 4 * Math.sin(t * 40) : S.shake * 3 * Math.sin(t * 50);
  const m = clamp(S.mouth + (laugh ? 0.35 + 0.15 * Math.sin(t * 30) : 0), 0, 1.2);
  // jaws: hinge H, upper line A -> H, lower line rotates down by m * 26 degrees about H
  const H: P2 = [262, 66], A: P2 = [416, 30];
  const LA = add(H, rot2([A[0] - H[0] - 4, A[1] - H[1] + 6], m * 26));
  const teeth = (p0: P2, p1: P2, n: number, dir: number, h: number) => {
    let d = '';
    for (let i = 0; i < n; i++) {
      const u0 = (i + 0.15) / n, u1 = (i + 0.85) / n, um = (i + 0.5) / n;
      const a = lp2(p0, p1, u0), b = lp2(p0, p1, u1), c = lp2(p0, p1, um);
      d += `M ${P(a)} L ${P([c[0], c[1] + dir * h])} L ${P(b)} Z `;
    }
    return <path d={d} fill="#FFFFFF" stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
  };
  const eye = () => {
    const [ex, ey] = SHARK_EYE;
    if (laugh) return <path d={`M ${ex - 16} ${ey + 4} Q ${ex} ${ey - 12} ${ex + 16} ${ey + 4}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    const lid = S.mood === 'smug' ? 0.46 : S.mood === 'annoyed' || S.mood === 'roll' ? 0.5 : 0;
    const py = S.mood === 'roll' ? -9 : 2, px = S.mood === 'roll' ? 2 : -2;
    return <g>
      <ellipse cx={ex} cy={ey} rx={17} ry={19} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
      <circle cx={ex + px} cy={ey + py + lid * 5} r={8} fill={INK} />
      <circle cx={ex + px - 2.5} cy={ey + py + lid * 5 - 3} r={2.4} fill="#fff" />
      {lid ? <path d={lidPath(ex, ey, 17.5, 19.5, lid)} fill={SHARK_DK} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      {S.mood === 'annoyed' || S.mood === 'roll' ? <path d={`M ${ex - 22} ${ey - 26} L ${ex + 20} ${ey - 30}`} stroke={INK} strokeWidth={5.5} strokeLinecap="round" />
        : S.mood === 'smug' ? <path d={`M ${ex - 20} ${ey - 30} Q ${ex} ${ey - 36} ${ex + 20} ${ey - 26}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /> : null}
    </g>;
  };
  return (
    <W><g transform={`translate(${(S.x + jig).toFixed(1)} ${S.y.toFixed(1)}) scale(${S.s})`}>
      <defs><clipPath id={`sb${uid}`}><path d={BODY_D} /></clipPath></defs>
      {/* far pectoral fin, tail */}
      <path d="M 196 70 Q 150 150 70 214 Q 110 150 120 96 Z" fill={SHARK_DK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <g transform={`rotate(${sway.toFixed(2)} -400 0)`}><path d={TAIL_D} fill={SHARK} stroke={INK} strokeWidth={7} strokeLinejoin="round" /></g>
      <path d={DORSAL_D} fill={SHARK} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -296 -62 L -336 -104 L -330 -48 Z M -300 66 L -334 104 L -326 52 Z" fill={SHARK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      {/* body + belly */}
      <path d={BODY_D} fill={SHARK} />
      <g clipPath={`url(#sb${uid})`}>
        <path d={BELLY_D} fill={BELLY} />
        <path d="M 330 -96 Q 120 -128 -120 -112" stroke="#A8B6C4" strokeWidth={10} fill="none" strokeLinecap="round" />
        {/* mouth: dark wedge between the jaws, teeth on both */}
        <path d={`M ${P(A)} Q 330 40 ${P(H)} L ${P(LA)} Z`} fill="#5A2328" />
        {m > 0.15 ? <ellipse cx={(H[0] + LA[0]) / 2 + 10} cy={(H[1] + LA[1]) / 2 + 10 * m} rx={36} ry={10 * m} fill="#E4677A" /> : null}
        {teeth(A, H, 7, 1, 13 + 4 * Math.min(1, m))}
        {m > 0.05 ? teeth(H, LA, 6, -1, 11 * Math.min(1, m)) : null}
      </g>
      <path d={BODY_D} fill="none" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d={`M ${P(A)} Q 330 40 ${P(H)}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
      {m > 0.05 ? <path d={`M ${P(H)} L ${P(LA)}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
      <path d={`M ${P(H)} q -12 -16 -2 -28`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* gill slits, nostril, eye, near fins */}
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${190 + i * 19} ${-58 + i * 3} Q ${200 + i * 19} ${-8} ${188 + i * 19} ${44 - i * 4}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />)}
      <path d="M 392 -26 q 8 -5 16 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      {eye()}
      <path d={PEC_D} fill={SHARK} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -160 104 Q -196 150 -246 162 Q -214 124 -206 100 Z" fill={SHARK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g></W>
  );
};
const sharkEyeWorld = (S: SS): P2 => [S.x + SHARK_EYE[0] * S.s, S.y + SHARK_EYE[1] * S.s];
const finWorld = (S: SS, u: number): P2 => [S.x + lerp(122, -16, u) * S.s, S.y + lerp(-128, -332, u) * S.s];

// ---------- a little fish (side view, facing right) ----------
const Fish: React.FC<{x: number; y: number; s: number; rot?: number; dizzy?: boolean; t: number; flip?: boolean}> = ({x, y, s, rot = 0, dizzy, t, flip}) => (
  <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${(flip ? -s : s).toFixed(3)} ${s.toFixed(3)})`}>
    <path d={`M -30 0 L -58 ${-20 + 4 * Math.sin(t * 20)} L -54 0 L -58 ${20 + 4 * Math.sin(t * 20)} Z`} fill={FISH_DK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={0} rx={36} ry={23} fill={FISH} stroke={INK} strokeWidth={5.5} />
    <path d="M -6 -22 Q 4 -36 18 -20" fill={FISH_DK} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -10 -18 Q -2 0 -10 18" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" />
    {dizzy ? <path d="M 16 -6 m -2 0 a 3 3 0 1 1 4 2 a 6 6 0 1 1 -8 -5" transform={`rotate(${t * 700} 16 -6)`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      : <g><circle cx={16} cy={-6} r={7} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} /><circle cx={18} cy={-6} r={3.4} fill={INK} /></g>}
    <path d="M 28 8 q 4 3 8 0" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
  </g></W>
);

// ---------- the sea: far reef, sand with weeds and rocks, light rays, drifting bubbles ----------
/** distance travelled (world units): the backdrop scrolls left by this while they swim */
const vAt = (t: number) => {
  if (t < S2) return 300;
  if (t < S3) return 300 * (1 - seg(t, S2, S2 + 0.32));
  if (t < S4) return 0;
  if (t < S5) return 240;
  if (t < S6) return 300;
  if (t < S7) return 60;
  if (t < S8) return 0;
  return 300;
};
const SCROLL: number[] = (() => { const a: number[] = [0]; for (let i = 1; i <= Math.ceil(DURATION * 120) + 2; i++) a.push(a[i - 1] + vAt((i - 0.5) / 120) / 120); return a; })();
const scrollAt = (t: number) => { const f = clamp(t, 0, DURATION) * 120, i = Math.floor(f); return lerp(SCROLL[i], SCROLL[Math.min(i + 1, SCROLL.length - 1)], f - i); };
const TILE = 1800;
const Weed: React.FC<{x: number; h: number; t: number; seed: number}> = ({x, h, t, seed}) => {
  const sw = 14 * Math.sin(t * 1.6 + seed);
  return <g>
    {[0, 1].map((j) => {
      const dx = (j ? 22 : -8), hh = h * (j ? 0.75 : 1), s = sw * (j ? 1.2 : 1);
      const d = `M ${x + dx} ${SAND_Y + 4} C ${x + dx + s * 0.4 - 18} ${SAND_Y - hh * 0.35} ${x + dx + s + 20} ${SAND_Y - hh * 0.65} ${x + dx + s * 1.3} ${SAND_Y - hh}`;
      return <g key={j}><path d={d} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" /><path d={d} stroke={j ? WEED_DK : WEED} strokeWidth={11} fill="none" strokeLinecap="round" /></g>;
    })}
  </g>;
};
const Seabed: React.FC<{t: number; off: number}> = ({t, off}) => {
  const o = off % TILE;
  return (
    <W><g>
      <rect x={-3000} y={SAND_Y} width={9000} height={2000} fill={SAND} />
      <path d={`M -3000 ${SAND_Y} ` + Array.from({length: 46}, (_, i) => `Q ${-3000 + i * 200 + 100 - o % 200} ${SAND_Y - 14} ${-3000 + (i + 1) * 200 - o % 200} ${SAND_Y}`).join(' ')} fill={SAND} stroke={INK} strokeWidth={7} />
      {[-2, -1, 0, 1, 2, 3, 4].map((c) => {
        const bx = c * TILE - o;
        return <g key={c}>
          {[[120, 150, 1], [520, 110, 2], [860, 170, 3], [1300, 130, 4], [1560, 95, 5]].map(([x, h, sd]) => <Weed key={x} x={bx + x} h={h} t={t} seed={sd} />)}
          {[[330, 46], [1080, 62]].map(([x, r]) => <g key={'r' + x}>
            <path d={`M ${bx + x - r * 1.5} ${SAND_Y + 6} Q ${bx + x - r * 1.3} ${SAND_Y - r} ${bx + x} ${SAND_Y - r * 1.1} Q ${bx + x + r * 1.4} ${SAND_Y - r} ${bx + x + r * 1.6} ${SAND_Y + 6} Z`} fill={ROCK} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
            <path d={`M ${bx + x - r * 0.6} ${SAND_Y - r * 0.55} q ${r * 0.3} ${-r * 0.25} ${r * 0.7} ${-r * 0.2}`} stroke="#C4D3DC" strokeWidth={7} fill="none" strokeLinecap="round" />
          </g>)}
          {[[700, 20], [1420, 34]].map(([x, dy]) => <path key={'s' + x} d={`M ${bx + x - 18} ${SAND_Y + dy} Q ${bx + x} ${SAND_Y + dy - 30} ${bx + x + 18} ${SAND_Y + dy} Z`} fill="#FFB3A1" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />)}
        </g>;
      })}
    </g></W>
  );
};
const FarReef: React.FC<{off: number}> = ({off}) => {
  const o = (off * 0.45) % 2200;
  return <W><g>
    {[-2, -1, 0, 1, 2, 3].map((c) => {
      const bx = c * 2200 - o;
      return <g key={c}>
        {[[0, 260, 180], [420, 200, 120], [760, 300, 200], [1200, 230, 140], [1620, 280, 170], [1950, 210, 110]].map(([x, w, h], i) => (
          <path key={i} d={`M ${bx + x - w / 2} 700 Q ${bx + x - w * 0.4} ${560 - h} ${bx + x} ${540 - h} Q ${bx + x + w * 0.45} ${560 - h} ${bx + x + w / 2} 700 Z`} fill={WATER_DEEP} />
        ))}
      </g>;
    })}
    <rect x={-6000} y={680} width={14000} height={2000} fill={WATER_DEEP} />
  </g></W>;
};
const Rays: React.FC<{t: number}> = ({t}) => (
  <W><g opacity={0.2}>
    {[-700, -320, 60, 420, 800, 1300, 1800, 2300, 2700].map((x, i) => {
      const sw = 30 * Math.sin(t * 0.7 + i);
      return <path key={i} d={`M ${x - 40} -900 L ${x + 40} -900 L ${x + 260 + sw} 600 L ${x + 90 + sw} 600 Z`} fill="#FFFFFF" />;
    })}
  </g></W>
);
const Drift: React.FC<{t: number; off: number}> = ({t, off}) => (
  <W><g>
    {Array.from({length: 40}, (_, i) => {
      const x0 = -1400 + rnd(i * 3.3) * 4600, sp = 40 + rnd(i * 5.1) * 50;
      const y = 500 - (((t * sp + rnd(i * 9.7) * 1500) % 1500));
      const x = ((x0 - off * 0.9) % 4600 + 4600) % 4600 - 1400 + 18 * Math.sin(t * 1.3 + i);
      const r = 4 + rnd(i * 1.7) * 8;
      return <circle key={i} cx={x} cy={y} r={r} fill="#EAF8FF" fillOpacity={0.6} stroke={INK} strokeWidth={2.5} />;
    })}
  </g></W>
);
/** speed lines in the water while they swim */
const Streaks: React.FC<{t: number; v: number; cx: number; cy: number}> = ({t, v, cx, cy}) => v < 20 ? null : (
  <W><g opacity={Math.min(1, v / 200) * 0.8}>
    {Array.from({length: 14}, (_, i) => {
      const y = cy - 380 + rnd(i * 4.1) * 760, len = 50 + rnd(i * 2.3) * 70;
      const x = cx + 300 - (((t * v * 2.2 + rnd(i * 7.7) * 800) % 800));
      return <path key={i} d={`M ${x} ${y} l ${len} 0`} stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" />;
    })}
  </g></W>
);

// ---------- the bed on the sea floor ----------
const Bed: React.FC<{t: number; blanket: number}> = ({t, blanket}) => {
  const bx = BED_X, top = 250;
  const fly = seg(t, ROCKET, ROCKET + 0.4);
  return (
    <W><g>
      <rect x={bx - 210} y={top - 120} width={26} height={150 + SAND_Y - top - 30} rx={10} fill="#C08A5A" stroke={INK} strokeWidth={6} />
      <rect x={bx + 170} y={top - 50} width={24} height={80 + SAND_Y - top - 30} rx={10} fill="#C08A5A" stroke={INK} strokeWidth={6} />
      <rect x={bx - 196} y={top} width={378} height={42} rx={16} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
      <rect x={bx - 196} y={top + 38} width={378} height={26} rx={8} fill="#C08A5A" stroke={INK} strokeWidth={6} />
      <ellipse cx={bx - 140} cy={top - 8} rx={56} ry={24} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
      {blanket > 0.01 ? <g transform={`translate(${30 * fly} ${-760 * fly * fly}) rotate(${-25 * fly} ${bx + 40} ${top - 20})`}>
        <path d={`M ${bx - 96} ${top - 34} Q ${bx + 40} ${top - 58} ${bx + 182} ${top - 30} L ${bx + 186} ${top + 30} L ${bx - 100} ${top + 30} Z`} fill="#7FB0F0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${bx - 50 + i * 60} ${top - 44 + Math.abs(i - 1.5) * 4} L ${bx - 50 + i * 60} ${top + 28}`} stroke="#FFFFFF" strokeWidth={8} />)}
        <path d={`M ${bx - 96} ${top - 34} Q ${bx + 40} ${top - 58} ${bx + 182} ${top - 30} L ${bx + 186} ${top + 30} L ${bx - 100} ${top + 30} Z`} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </g> : null}
    </g></W>
  );
};

// ---------- inserts (screen space) ----------
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
/** X-RAY: the great white's head in a side cut - jaws, five gill arches with red filaments. While it is still nothing flows
 *  (NO PUMP); once it swims with its mouth open, water arrows rush in through the mouth and out through the gill slits. */
const GX = [70, 18, -34, -86, -138];
const XRAY_SWIM = T.keep - 0.15, XRAY_OPEN = T.mouth - 0.3;
const SharkXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const swim = seg(t, XRAY_SWIM, XRAY_SWIM + 0.4);
  const m = eout(seg(t, XRAY_OPEN, XRAY_OPEN + 0.35));
  const flow = m;
  const ofs = Math.max(0, t - XRAY_SWIM) * 260;
  const hinge: P2 = [150, 96];
  const lowJaw = rot2([170, -16], m * 22);
  const chevron = (p: P2, ang: number, op: number, k: string) => <path key={k} transform={`translate(${P(p)}) rotate(${ang})`} d="M -12 -14 L 6 0 L -12 14" stroke="#7FE3FF" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={op} />;
  const arrows: React.ReactNode[] = [];
  if (flow > 0.05) {
    for (let k = 0; k < 4; k++) {               // into the mouth
      const u = ((t - XRAY_OPEN) * 1.6 + k / 4) % 1;
      arrows.push(chevron([lerp(380, 150, u), lerp(120, 100, u)], 180, flow * Math.sin(Math.PI * u), 'm' + k));
    }
    GX.forEach((gx, i) => {                     // over each arch and out of its slit
      for (let k = 0; k < 2; k++) {
        const u = ((t - XRAY_OPEN) * 1.6 + k / 2 + i * 0.13) % 1;
        const p0: P2 = [gx + 34, 90], p1: P2 = [gx - 16, 250];
        arrows.push(chevron(lp2(p0, p1, u), 108, flow * Math.sin(Math.PI * u), `g${i}_${k}`));
      }
    });
  }
  const pumpX = t > T.cant - 0.1 && t < T.keep - 0.05 ? 1 : 0;
  const crossed = popIn(t, T.pump - 0.12, 0.25);
  return (
    <div style={{position: 'absolute', left: 540, top: 1085, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id="xr" R={320}>
        {/* water specks streaming past once it swims */}
        {Array.from({length: 18}, (_, i) => {
          const x = 400 - (((ofs * (1 + rnd(i) * 0.6)) + rnd(i * 3.1) * 800) % 800), y = -300 + rnd(i * 7.7) * 600;
          return <circle key={i} cx={x} cy={y} r={4 + rnd(i * 2.2) * 5} fill="#3D5A86" />;
        })}
        {swim > 0.05 ? Array.from({length: 7}, (_, i) => {
          const x = 380 - ((ofs * 1.8 + rnd(i * 5.5) * 760) % 760), y = -260 + rnd(i * 9.1) * 520;
          return <path key={'l' + i} d={`M ${x} ${y} l 70 0`} stroke="#5B7FB2" strokeWidth={6} strokeLinecap="round" opacity={swim} />;
        }) : null}
        {/* head outline (skin) */}
        <path d="M 450 40 C 430 -40 330 -150 160 -186 C 40 -210 -200 -210 -460 -190 L -460 330 C -200 300 0 250 120 220 C 260 186 380 120 450 40 Z" fill="#7FA7D6" fillOpacity={0.22} stroke="#BFD9F5" strokeWidth={7} />
        <circle cx={250} cy={-60} r={22} fill="#0E1626" stroke="#BFD9F5" strokeWidth={5} />
        {/* skull / upper jaw cartilage */}
        <path d="M 400 50 Q 300 30 170 70 Q 40 40 -60 -40" stroke="#CFE3FA" strokeWidth={16} fill="none" strokeLinecap="round" opacity={0.85} />
        {/* mouth opening + lower jaw (rotates open) */}
        <path d={`M 410 64 Q 300 70 ${P(hinge)} L ${P(add(hinge, lowJaw))} Z`} fill="#0B111D" />
        <path d={`M ${P(hinge)} L ${P(add(hinge, lowJaw))}`} stroke="#CFE3FA" strokeWidth={16} strokeLinecap="round" />
        {[0, 1, 2, 3, 4].map((i) => { const p = lp2([400, 60], [180, 82], (i + 0.5) / 5); return <path key={i} d={`M ${p[0] - 12} ${p[1]} L ${p[0]} ${p[1] + 22} L ${p[0] + 12} ${p[1]} Z`} fill="#FFFFFF" />; })}
        {/* throat channel */}
        <path d="M 170 92 Q 60 120 -180 120" stroke="#2C3F63" strokeWidth={40} fill="none" strokeLinecap="round" />
        {/* gill arches: cartilage bar + red filaments on the back side, slits in the skin */}
        {GX.map((gx, i) => <g key={i}>
          <path d={`M ${gx + 6} 0 Q ${gx + 26} 120 ${gx - 4} 240`} stroke="#CFE3FA" strokeWidth={10} fill="none" strokeLinecap="round" />
          {Array.from({length: 9}, (_, j) => { const u = (j + 0.5) / 9, y = lerp(16, 226, u), x = gx + 6 + 20 * Math.sin(Math.PI * u) - 4 * u;
            return <path key={j} d={`M ${x - 4} ${y} l -26 ${4 + 3 * Math.sin(t * 6 + j)}`} stroke="#F05A66" strokeWidth={6} strokeLinecap="round" />; })}
          <path d={`M ${gx - 8} 236 q -6 26 -20 40`} stroke="#0B111D" strokeWidth={9} strokeLinecap="round" />
        </g>)}
        {arrows}
        {/* the pump it does not have */}
        {pumpX ? <g transform={`translate(-60 -110) scale(${popIn(t, T.cant - 0.1, 0.25)})`}>
          <rect x={-26} y={-60} width={52} height={110} rx={10} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
          <path d="M 0 -60 V -96 M -40 -96 H 40" stroke="#FFFFFF" strokeWidth={14} strokeLinecap="round" />
          <path d="M 0 -60 V -96 M -40 -96 H 40" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          <path d="M 26 30 Q 70 40 60 90" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" />
          {crossed > 0.01 ? <g transform={`scale(${crossed})`}><path d="M -70 -110 L 70 70 M 70 -110 L -70 70" stroke={RED} strokeWidth={26} strokeLinecap="round" /><path d="M -70 -110 L 70 70 M 70 -110 L -70 70" stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={0.0} /></g> : null}
        </g> : null}
        <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
      </XFrame>
      <Card text="X-RAY: SHARK GILLS" top={112} size={50} />
      <Card text="NO PUMP" top={300} left={190} color={RED} fg="#fff" rot={-8} s={popIn(t, T.pump - 0.05, 0.28) * (1 - seg(t, T.keep - 0.3, T.keep - 0.15))} size={52} />
      <Card text="GILLS" top={760} left={330} color={GOLD} rot={-4} s={popIn(t, T.gills - 0.05, 0.28) * (1 - seg(t, T.keep - 0.3, T.keep - 0.15))} size={54} />
      <Card text="KEEP SWIMMING" top={760} left={450} color="#fff" rot={3} s={popIn(t, T.keep, 0.28) * (1 - seg(t, T.mouth - 0.25, T.mouth - 0.1))} size={52} />
      <Card text="MOUTH OPEN" top={300} left={690} color={GOLD} rot={6} s={popIn(t, T.mouth - 0.05, 0.28)} size={52} />
    </div>
  );
};

/** the oxygen meter (screen): a bar that drains, number turns red */
const O2: React.FC<{t: number; s: number; v: number; top?: number}> = ({t, s, v, top = 1470}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s})`, background: '#FFFDF6', border: `9px solid ${INK}`,
    borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '10px 30px 14px', fontFamily: FONT, color: INK, display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap'}}>
    <div>
      <div style={{fontWeight: 900, fontSize: 40, lineHeight: 1}}>OXYGEN</div>
      <div style={{marginTop: 10, width: 300, height: 40, border: `7px solid ${INK}`, borderRadius: 14, background: '#fff', overflow: 'hidden'}}>
        <div style={{width: `${clamp(v / 100) * 100}%`, height: '100%', background: v < 35 ? RED : v < 65 ? GOLD : '#5CC46B'}} />
      </div>
    </div>
    <div style={{fontWeight: 900, fontSize: 104, lineHeight: 1, color: v < 35 ? RED : INK, minWidth: 210, textAlign: 'right', opacity: v < 35 && Math.sin(t * 30) > 0.3 ? 0.55 : 1}}>{Math.round(v)}%</div>
  </div>
) : null;

/** the map: South Africa -> Australia and back, a little shark on a dotted line, a KM counter */
const AFRICA = 'M 120 40 L 300 26 L 368 96 L 420 196 L 486 236 L 410 336 L 360 456 L 300 566 L 236 628 L 196 566 L 176 436 L 156 336 L 92 262 L 40 186 L 66 96 Z';
const AUSTRALIA = 'M 640 384 L 716 334 L 790 352 L 846 330 L 900 398 L 926 470 L 888 562 L 806 604 L 726 572 L 652 524 L 624 452 Z';
const bezQ = (a: P2, c: P2, b: P2, u: number): P2 => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
const CAPE: P2 = [240, 620], PERTH: P2 = [656, 520];
const OUT_C: P2 = [440, 760], BACK_C: P2 = [450, 650];
const mapPos = (t: number): {p: P2; ang: number; out: number; back: number} => {
  const out = seg(t, KM0, KM_AUS), back = seg(t, KM_BACK, KM1);
  const along = (a: P2, c: P2, b: P2, u: number) => { const p = bezQ(a, c, b, u), q = bezQ(a, c, b, Math.min(1, u + 0.01)), r = bezQ(a, c, b, Math.max(0, u - 0.01)); return {p, ang: (Math.atan2(q[1] - r[1], q[0] - r[0]) * 180) / Math.PI}; };
  if (t < KM_BACK) { const a = along(CAPE, OUT_C, PERTH, out); return {...a, out, back}; }
  const a = along(PERTH, BACK_C, CAPE, back); return {...a, out, back};
};
const MapCard: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const mp = mapPos(t);
  const dashes = (a: P2, c: P2, b: P2, u: number, k: string) => Array.from({length: 26}, (_, i) => {
    const u0 = i / 26, u1 = (i + 0.55) / 26;
    if (u0 > u) return null;
    const p = bezQ(a, c, b, u0), q = bezQ(a, c, b, Math.min(u, u1));
    return <path key={k + i} d={`M ${P(p)} L ${P(q)}`} stroke={RED} strokeWidth={9} strokeLinecap="round" />;
  });
  const flip = mp.ang > 90 || mp.ang < -90;
  return (
    <div style={{position: 'absolute', left: 540, top: 905, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <svg width={960} height={720} viewBox="0 0 1000 750" style={{overflow: 'visible'}}>
        <rect x={6} y={6} width={988} height={738} rx={34} fill={OCEAN} stroke={INK} strokeWidth={10} />
        {Array.from({length: 7}, (_, i) => <path key={i} d={`M ${60 + (i % 3) * 300 + (i > 3 ? 120 : 0)} ${120 + i * 90} q 18 -10 36 0 t 36 0`} stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} />)}
        <path d={AFRICA} fill={LAND} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <ellipse cx={452} cy={470} rx={18} ry={48} transform="rotate(20 452 470)" fill={LAND} stroke={INK} strokeWidth={6} />
        <path d={AUSTRALIA} fill={LAND} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <text x={250} y={300} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK}>AFRICA</text>
        <text x={776} y={478} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill={INK}>AUSTRALIA</text>
        {dashes(CAPE, OUT_C, PERTH, mp.out, 'o')}
        {dashes(PERTH, BACK_C, CAPE, mp.back, 'b')}
        <g transform={`translate(${P(mp.p)}) rotate(${mp.ang}) scale(${flip ? 0.62 : 0.62} ${flip ? -0.62 : 0.62})`}>
          <path d="M 60 0 C 40 -26 0 -30 -40 -18 L -70 -40 L -62 -6 L -72 26 L -40 12 C 0 26 40 22 60 0 Z" fill={SHARK} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          <path d="M 8 -24 L -6 -58 L -22 -22 Z" fill={SHARK} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
          <circle cx={34} cy={-6} r={5} fill={INK} />
        </g>
      </svg>
    </div>
  );
};
const KmCounter: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const u = seg(t, KM0, KM1), v = Math.round((20000 * u) / 100) * 100, done = t >= KM1;
  return (
    <div style={{position: 'absolute', left: 540, top: 1440, transform: `translate(-50%,-50%) rotate(2deg) scale(${s * (done ? 1 + 0.1 * Math.max(0, 1 - (t - KM1) * 4) : 1)})`,
      background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '6px 36px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
      <div style={{fontWeight: 900, fontSize: 116, lineHeight: 1, color: done ? RED : INK}}>{fmt(v)} KM</div>
      <div style={{fontWeight: 900, fontSize: 38}}>{t < KM_BACK ? 'TO AUSTRALIA...' : 'AND BACK'}</div>
    </div>
  );
};

// ---------- the story over time ----------
const BASE: GS = {x: 0, y: 0, rot: 0, tilt: 0, mood: 'happy', blue: 0, puff: 0, flow: 0, gasp: 0, mask: 0, bulge: 0,
  armA: [-62, 52], armB: [62, 52], footA: [-26, 68], footB: [26, 68], look: 0, lookY: 0, sq: 0, show: 1};
/** crawl stroke: each hand circles forward over the head and pulls back past the hip; B is half a stroke behind */
const swimArms = (ph: number): [P2, P2] => {
  const arm = (p: number, sd: number): P2 => [sd * (36 + 50 * Math.sin(p)), -36 - 104 * Math.cos(p)];
  return [arm(ph, -1), arm(ph + Math.PI, 1)];
};
const swimLegs = (ph: number, k = 1): [P2, P2] => [[-20 + 9 * k * Math.sin(ph * 2), 71], [20 - 9 * k * Math.sin(ph * 2), 71]];
const floatArms = (t: number): [P2, P2] => [[-64 + 6 * Math.sin(t * 2.2), 46 + 6 * Math.sin(t * 1.7)], [64 - 6 * Math.sin(t * 2.2), 46 + 6 * Math.sin(t * 1.9)]];
const swimmer = (t: number, ph: number, g: Partial<GS>, kick = 1): GS => {
  const [a, b] = swimArms(ph), [fa, fb] = swimLegs(ph, kick);
  return {...BASE, armA: a, armB: b, footA: fa, footB: fb, flow: 1, ...g};
};
const PH = (t: number) => t * 2 * Math.PI * 1.25;

const guyAt = (t: number): GS => {
  if (t < S2) return swimmer(t, PH(t), {x: -20, y: -55 + 6 * Math.sin(t * 2.6), rot: 80 + 3 * Math.sin(t * 2.2), mood: 'swim'});
  if (t < S3) {
    const u = eio(seg(t, S2, S2 + 0.28)), f = 1 - seg(t, S2, S2 + 0.3);
    const [sa, sb] = swimArms(PH(t)), [fa, fb] = floatArms(t), [la, lb] = swimLegs(PH(t), 1 - u);
    const w = seg(t, S2 + 0.22, S2 + 0.34) * (1 - seg(t, 2.0, 2.12));
    const wave: P2 = [70 + 16 * Math.sin(t * 15), -118];
    return {...BASE, x: 0, y: 40 + 4 * Math.sin(t * 2), rot: 70 * (1 - u), flow: f, armA: lp2(sa, fa, u), armB: lp2(lp2(sb, fb, u), wave, w),
      footA: lp2(la, [-26, 70], u), footB: lp2(lb, [26, 70], u), mood: t < 1.98 ? 'happy' : 'worry', gasp: 0.5 * seg(t, 2.0, 2.15)};
  }
  if (t < S4) {
    if (t < BOLT) {
      const c = eout(seg(t, 2.36, 2.6)), th = eout(seg(t, 2.36, 2.52));
      const [fa, fb] = floatArms(t);
      return {...BASE, x: 0, y: 40, mood: t < 2.38 ? 'worry' : 'choke', blue: eout(seg(t, 2.38, 2.85)), puff: c * (1 + 0.05 * Math.sin(t * 34)),
        gasp: t < 2.38 ? 0.5 : 1, armA: lp2(fa, [24, -10], th), armB: lp2(fb, [-24, -10], th), sq: hit(t, 2.72, 1, 10), look: 0, lookY: 0};
    }
    const u = seg(t, BOLT + 0.04, 3.66);
    return swimmer(t, PH(t) * 3.2, {x: 470 * u * u, y: 40 - 30 * u, rot: 38 * eout(seg(t, BOLT, BOLT + 0.12)), mood: 'pop',
      blue: 1 - seg(t, BOLT, BOLT + 0.2), puff: 1 - seg(t, BOLT, BOLT + 0.1), tilt: -6}, 1.6);
  }
  if (t < S5) return {...BASE, show: 0};
  if (t < S6) {
    const gulped = t >= GULP && t < FWOOP;
    const mood: Mood = t < GULP ? 'gape' : t < FWOOP ? 'cheek' : t < FWOOP + 0.45 ? 'pop' : 'grin';
    return swimmer(t, PH(t), {x: -150, y: 6 * Math.sin(t * 2.4), rot: 82 + 2 * Math.sin(t * 2), mood, bulge: gulped ? eout(seg(t, GULP, GULP + 0.12)) * (1 - seg(t, FWOOP - 0.08, FWOOP)) : 0,
      flow: t < FWOOP + 0.05 ? 1 : 1, sq: hit(t, FWOOP, 0.8, 9), look: t > FWOOP + 0.1 && t < FWOOP + 0.45 ? -1 : 0});
  }
  if (t < S7) return {...BASE, show: 0};
  if (t < S8) {
    // lying in bed (head left), yawns, sleeps, chokes awake, rockets up out of bed
    const up = eio(seg(t, ROCKET, ROCKET + 0.36));
    const mood: Mood = t < 13.72 ? 'sleepy' : t < 14.12 ? 'yawn' : t < WAKE ? 'sleep' : t < ROCKET ? 'choke' : 'pop';
    const lie: [P2, P2] = [[-6, 148], [6, 148]];
    if (t < ROCKET) return {...BASE, x: BED_X + 6, y: 236, rot: -90, mood, armA: lie[0], armB: t > 13.72 && t < 14.12 ? lp2(lie[1], [-24, -10], Math.sin(Math.PI * seg(t, 13.72, 14.12))) : lie[1],
      footA: [-19, 77], footB: [19, 77], blue: eout(seg(t, WAKE, WAKE + 0.14)), puff: eout(seg(t, WAKE, WAKE + 0.12)), gasp: t > WAKE ? 1 : 0, sq: hit(t, WAKE, 0.8, 10)};
    return swimmer(t, PH(t) * 3.4, {x: BED_X + 6, y: 236 - 980 * up, rot: -90 + 90 * eout(seg(t, ROCKET, ROCKET + 0.12)), mood: 'pop', blue: 1 - seg(t, ROCKET + 0.05, ROCKET + 0.3)}, 1.5);
  }
  // the tow: he swims above the shark, reaches down, grabs the dorsal fin (16.12) and dozes off under a sleep mask while it swims for him
  const S = sharkAt(t);
  const hold = finWorld(S, HOLD);
  const ROT = 84, hip: P2 = [hold[0] - 90, hold[1] - 115];
  const reach = (rt: number): P2 => { const sb = rot2([SHX, SH_Y], rt); return rot2([hold[0] - hip[0] - sb[0], hold[1] - hip[1] - sb[1]], -rt); };
  if (t < GRAB) {
    const u = eio(seg(t, S8, GRAB));
    const g = swimmer(t, PH(t) * 0.7, {x: hip[0] - 50 * (1 - u), y: hip[1] - 14 * (1 - u) + 5 * Math.sin(t * 2.4), rot: ROT, mood: t < 15.62 ? 'sleepy' : 'hope', lookY: t < 15.62 ? 0 : 1, flow: 1}, 0.7);
    if (t > 15.86) g.armB = lp2(g.armB, reach(ROT), eio(seg(t, 15.86, GRAB)));
    return g;
  }
  const bob = 4 * Math.sin(t * 3.1);
  return {...BASE, x: hip[0], y: hip[1] + bob, rot: ROT, armB: reach(ROT), armA: [-30, 86 + 6 * Math.sin(t * 2)],
    footA: [-18 + 6 * Math.sin(t * 4), 70], footB: [18 - 6 * Math.sin(t * 4), 70], flow: 1, mood: t < 16.5 ? 'hope' : 'sleep', lookY: 1, mask: eout(seg(t, 16.42, 16.62)), sq: hit(t, GRAB, 0.5, 10)};
};
/** gill positions for the bubbles */
const headAt = (t: number) => { const g = guyAt(t); const h = headWorld(g); return {hx: h[0], hy: h[1], flow: g.show > 0.5 ? g.flow : 0}; };

const sharkAt = (t: number): SS => {
  const base: SS = {x: 0, y: 0, s: 0.62, mood: 'smug', mouth: 0.3, show: 1, shake: 0};
  if (t < S2) return {...base, x: SX0, y: SY0, s: 0.56, mouth: 0.32 + 0.06 * Math.sin(t * 3)};
  if (t < S3) return {...base, x: lerp(-260, 700, eio(seg(t, S2, S3 + 0.2))), y: 210, s: 0.6, mood: t > 1.7 ? 'grin' : 'smug', mouth: 0.4};
  if (t < S4) return {...base, show: 0};
  if (t < S5) return {...base, x: -60, y: 60, s: 0.8, mood: 'smug', mouth: lerp(0.22, 0.75, eout(seg(t, XRAY_OPEN, XRAY_OPEN + 0.35)))};
  if (t < S6) return {...base, x: -170, y: 175, s: 0.6, mood: t > FWOOP + 0.05 && t < 9.95 ? 'laugh' : 'smug', mouth: 0.35};
  if (t < S7) return {...base, show: 0};
  if (t < S8) return {...base, show: 0};
  return {...base, x: SX0, y: SY0, s: 0.56, mood: t < GRAB ? 'smug' : t < 16.9 ? 'annoyed' : 'roll', mouth: t < GRAB ? 0.3 : 0.08, shake: hit(t, GRAB, 1, 8)};
};

const fishAt = (t: number, g: GS): {x: number; y: number; rot: number; dizzy: boolean; show: boolean; flip: boolean} => {
  if (t < S5 || t >= S6) return {x: 0, y: 0, rot: 0, dizzy: false, show: false, flip: false};
  const h = headWorld(g);
  const mouth: P2 = [h[0] + 4, h[1] + 40];
  if (t < GULP) { const u = eio(seg(t, S5, GULP)); return {x: lerp(h[0] + 168, mouth[0] + 20, u), y: lerp(h[1] - 30, mouth[1], u) + 10 * Math.sin(t * 9), rot: 0, dizzy: false, show: true, flip: true}; }
  if (t < FWOOP) return {x: 0, y: 0, rot: 0, dizzy: false, show: false, flip: true};
  const u = seg(t, FWOOP, FWOOP + 0.55), e = eout(u);
  const gill: P2 = [h[0] - 52, h[1] + 22];
  return {x: gill[0] - 120 * e, y: gill[1] - 200 * e + 30 * Math.max(0, t - FWOOP - 0.55), rot: -720 * e - 40 * Math.max(0, t - FWOOP - 0.55), dizzy: true, show: true, flip: false};
};

const camFor = (t: number) => camAt([
  {t: 0, x: 40, y: 10, k: 2.45}, {t: S2 - 0.001, x: 40, y: 10, k: 2.55},                  // frame 0: side by side, swimming
  {t: S2, x: 0, y: -50, k: 2.35}, {t: S3 - 0.001, x: 0, y: -50, k: 2.42},                // he stops and waves; the shark keeps going
  {t: S3, x: 0, y: -112, k: 3.62}, {t: S4 - 0.001, x: 0, y: -112, k: 3.78},             // close-up: blue, puffed, GLUG; he bolts
  {t: S4, x: 170, y: 200, k: 2.5}, {t: S5 - 0.001, x: 170, y: 200, k: 2.62},            // the shark above the X-ray
  {t: S5, x: -30, y: 10, k: 2.9}, {t: S6 - 0.001, x: -30, y: 10, k: 3.0},              // fish in, FWOOP out of his gill
  {t: S6, x: 1500, y: -60, k: 2.2}, {t: S7 - 0.001, x: 1500, y: -60, k: 2.26},          // open water behind the map
  {t: S7, x: BED_X - 90, y: 120, k: 2.55}, {t: S8 - 0.001, x: BED_X - 90, y: 120, k: 2.66}, // the bed on the sea floor
  {t: S8, x: 40, y: 10, k: 2.45}, {t: PUSH, x: 40, y: 10, k: 2.5},                   // he hitches a ride
] as Key[], t);

export const GillScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string; thumbShark?: [number, number]}> = ({t, camK, thumb, uid = 'm', thumbShark}) => {
  const c0 = camK ? {x: camK.x, y: camK.y, k: camK.k} : (() => { const c = camFor(t); return {x: c.x, y: c.y, k: 1000 / (1000 - c.z)}; })();
  const sh = shake(t, hit(t, 0, 4, 6) + hit(t, 2.72, 10, 6) + hit(t, BOLT, 6, 6) + hit(t, FWOOP, 9, 6) + hit(t, WAKE, 8, 7) + hit(t, GRAB, 4, 8));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const g = guyAt(t), fish = fishAt(t, g);
  // thumbnails: the smug shark right under his blue, puffed face (in the video it has already swum off at this point)
  const S: SS = thumb && t >= S3 && t < S4 ? {x: thumbShark?.[0] ?? -87, y: thumbShark?.[1] ?? 145, s: 0.56, mood: 'smug', mouth: 0.35, show: 1, shake: 0} : sharkAt(t);
  const off = scrollAt(t), v = vAt(t);
  const h = headWorld(g);
  // screen-space inserts
  const xrS = popIn(t, XR, 0.35) * (1 - seg(t, S5 - 0.14, S5)) * (t >= XR ? 1 : 0);
  const mapS = popIn(t, S6 + 0.02, 0.35) * (1 - seg(t, S7 - 0.14, S7)) * (t >= S6 ? 1 : 0);
  const kmS = popIn(t, KM0 - 0.1, 0.3) * (1 - seg(t, S7 - 0.14, S7)) * (t >= S6 ? 1 : 0);
  const o2a = popIn(t, 2.44, 0.28) * (1 - seg(t, S4 - 0.14, S4)) * (t >= S3 ? 1 : 0);
  const o2b = popIn(t, WAKE + 0.02, 0.24) * (1 - seg(t, S8 - 0.16, S8)) * (t >= S7 ? 1 : 0);
  const o2v = t < S4 ? (t < BOLT ? lerp(100, 12, seg(t, 2.45, 3.2)) : lerp(12, 100, seg(t, BOLT, BOLT + 0.3))) : lerp(100, 34, seg(t, WAKE, ROCKET + 0.05));
  // stickers (world)
  const stk = {
    stop: pulse(t, T.stop - 0.02, 0.3) * (t < S3 ? 1 : 0), glug: pulse(t, 2.72, 0.5) * (t < BOLT ? 1 : 0), go: popIn(t, BOLT + 0.04, 0.2) * (1 - seg(t, S4 - 0.12, S4)) * (t < S4 ? 1 : 0),
    gw: popIn(t, T.great - 0.08, 0.26) * (1 - seg(t, XR + 0.5, XR + 0.65)) * (t >= S4 && t < S5 ? 1 : 0),
    gulp: pulse(t, GULP + 0.02, 0.3) * (t < S6 ? 1 : 0), fwoop: popIn(t, FWOOP, 0.2) * (1 - seg(t, S6 - 0.14, S6)) * (t >= FWOOP && t < S6 ? 1 : 0),
    nap: popIn(t, T.you, 0.26) * (1 - seg(t, WAKE - 0.12, WAKE)) * (t >= S7 ? 1 : 0), nope: popIn(t, ROCKET - 0.04, 0.2) * (1 - seg(t, S8 - 0.12, S8)) * (t >= S7 && t < S8 ? 1 : 0),
    ride: popIn(t, 16.44, 0.26) * (1 - seg(t, PUSH - 0.12, PUSH)) * (t >= S8 ? 1 : 0), zz: popIn(t, 16.88, 0.22) * (1 - seg(t, PUSH - 0.12, PUSH)) * (t >= S8 ? 1 : 0),
  };
  const fe = sharkEyeWorld(S);
  const dizzyFish = fish.show && fish.dizzy && t > FWOOP + 0.5;
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: WATER}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`gFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Layer cam={cam} z={2600} paper={false}><FarReef off={off} /></Layer>
      <Layer cam={cam} z={1800} paper={false}><Rays t={t} /></Layer>
      <Layer cam={cam} z={1000}><Seabed t={t} off={off} /></Layer>
      <Layer cam={cam} z={1000} paper={false}><Drift t={t} off={off} /><Streaks t={t} v={v} cx={cam.x} cy={cam.y} /></Layer>
      <Layer cam={cam} z={1000}>
        {t >= S7 && t < S8 ? <Bed t={t} blanket={1} /> : null}
        <Shark t={t} S={S} uid={uid} />
        {fish.show && !fish.dizzy ? <Fish t={t} x={fish.x} y={fish.y} s={0.9} rot={fish.rot} flip={fish.flip} /> : null}
      </Layer>
      <Layer cam={cam} z={1000} paper={false}><GillBubbles t={t} at={headAt} front={false} /></Layer>
      <Layer cam={cam} z={1000}>
        <Guy t={t} g={g} uid={uid} />
        {t >= S7 && t < ROCKET ? <W><g>
          {/* the blanket over him while he lies there */}
          <path d={`M ${BED_X - 96} 216 Q ${BED_X + 40} 192 ${BED_X + 182} 220 L ${BED_X + 186} 280 L ${BED_X - 100} 280 Z`} fill="#7FB0F0" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${BED_X - 50 + i * 60} ${206 + Math.abs(i - 1.5) * 4} L ${BED_X - 50 + i * 60} ${278}`} stroke="#FFFFFF" strokeWidth={8} />)}
          <path d={`M ${BED_X - 96} 216 Q ${BED_X + 40} 192 ${BED_X + 182} 220 L ${BED_X + 186} 280 L ${BED_X - 100} 280 Z`} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        </g></W> : null}
        {t >= ROCKET && t < S8 ? <Bed t={t} blanket={0} /> : null}
        {fish.show && fish.dizzy ? <Fish t={t} x={fish.x} y={fish.y} s={0.9} rot={fish.rot} dizzy flip={fish.flip} /> : null}
      </Layer>
      <Layer cam={cam} z={1000} paper={false}><GillBubbles t={t} at={headAt} front /></Layer>
      <Layer cam={cam} z={1000}>
        {dizzyFish ? [0, 1, 2].map((j) => { const a = t * 6 + (j * 2 * Math.PI) / 3; return <Star key={j} x={fish.x + Math.cos(a) * 46} y={fish.y - 40 + Math.sin(a) * 12} s={0.32} rot={t * 200} />; }) : null}
        {/* zzz bubbles while he sleeps */}
        {(t > 14.2 && t < WAKE) || (t > 16.7 && t < PUSH) ? [0, 1, 2].map((j) => {
          const a = ((t * 0.9 + j / 3) % 1), base = t < S8 ? [h[0] + 40, h[1] - 60] : [h[0] + 30, h[1] - 70];
          return <Txt key={j} x={base[0] + 50 * a + 10 * Math.sin(a * 8)} y={base[1] - 120 * a} s={Math.sin(Math.PI * a) * 0.9} text="Z" size={44} rot={-10} fill="#FFFFFF" />;
        }) : null}
        {thumb ? null : <>
          <Txt x={h[0] + 110} y={h[1] - 120} s={stk.stop} text="STOP" size={56} rot={8} fill={RED} />
          <Txt x={h[0] + 78} y={h[1] + 78} s={stk.glug} text="GLUG" size={40} rot={-8} fill="#FFFFFF" />
          <Txt x={0} y={-252} s={stk.go} text="GO GO GO" size={42} rot={-6} fill={GOLD} />
          <Txt x={fe[0] - 40} y={fe[1] - 150} s={stk.gw} text="GREAT WHITE" size={52} rot={-4} fill={GOLD} />
          <Txt x={h[0] + 70} y={h[1] - 104} s={stk.gulp} text="GULP" size={44} rot={6} fill="#FFFFFF" />
          <Txt x={h[0] + 20} y={h[1] - 128} s={stk.fwoop} text="FWOOP" size={58} rot={-8} fill={GOLD} />
          <Txt x={BED_X - 40} y={40} s={stk.nap} text="NAP TIME" size={46} rot={-5} fill="#FFFFFF" />
          <Txt x={BED_X - 20} y={20} s={stk.nope} text="NOPE" size={60} rot={7} fill={RED} />
          <Txt x={h[0] + 70} y={h[1] + 110} s={stk.ride} text="FREE RIDE" size={46} rot={5} fill={GOLD} />
        </>}
      </Layer>
      {thumb ? null : <>
        <Card text="NO AIR" top={560} left={540} color={RED} fg="#fff" rot={-4} size={78} s={popIn(t, T.suff, 0.24) * (1 - seg(t, S4 - 0.14, S4)) * (t >= S3 && t < S4 ? 1 : 0)} />
        <O2 t={t} s={Math.max(o2a, o2b)} v={o2v} top={t < S4 ? 1478 : 1440} />
        <MapCard t={t} s={mapS} />
        <KmCounter t={t} s={kmS} />
        <Card text="9 MONTHS" top={560} left={760} color={GOLD} rot={6} size={60} s={popIn(t, T.nine - 0.05, 0.26) * (1 - seg(t, S7 - 0.14, S7)) * (t >= S6 ? 1 : 0)} />
        <Card text="NONSTOP" top={560} left={320} color="#fff" rot={-5} size={56} s={popIn(t, KM1 + 0.05, 0.24) * (1 - seg(t, S7 - 0.12, S7)) * (t >= S6 ? 1 : 0)} />
      </>}
      <SharkXRay t={t} s={xrS} />
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you could breathe like a shark??" handle="@gill_doodle" likes="2.9K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so} until={PUSH - 0.4} text="How long can you hold your breath?" />
      </>}
    </AbsoluteFill>
  );
};

export const GillVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const bed: Cue[] = Array.from({length: 5}, (_, i) => ({f: 'underwater.wav', at: i * 3.8, db: -23}));
  const cues: Cue[] = [
    ...bed,
    // frame 0: swimming side by side - whoosh + splash + a stream of bubbles out of his gills
    {f: 'whoosh.wav', at: 0, db: -12}, {f: 'splash.wav', at: 0, db: -13}, {f: 'bubblestream.wav', at: 0.02, db: -17},
    // he stops; the shark keeps going
    {f: 'whoosh.wav', at: S2 - 0.02, db: -30}, {f: 'whoosh.wav', at: 1.45, db: -26}, {f: 'pop.wav', at: T.stop, db: -22},
    // close-up: cheeks puff, GLUG, gasping, oxygen beeps; he bolts
    {f: 'whoosh.wav', at: S3 - 0.02, db: -30}, {f: 'stretch.wav', at: 2.36, db: -19, to: 0.4}, {f: 'gulp.wav', at: 2.52, db: -15},
    {f: 'glug.wav', at: 2.7, db: -11, to: 0.5}, {f: 'gasp.wav', at: 2.86, db: -16}, {f: 'beep.wav', at: 2.6, db: -24},
    {f: 'whoosh.wav', at: BOLT, db: -14}, {f: 'bubblestream.wav', at: BOLT + 0.02, db: -15}, {f: 'splash.wav', at: BOLT + 0.04, db: -20},
    // the shark + X-RAY: no pump, gills, keep swimming, mouth open, water rushes
    {f: 'whoosh.wav', at: S4 - 0.02, db: -30}, {f: 'pop.wav', at: T.great - 0.06, db: -24},
    {f: 'zap.wav', at: XR, db: -24}, {f: 'pop.wav', at: XR + 0.05, db: -24}, {f: 'pop.wav', at: T.cant - 0.08, db: -24}, {f: 'clack.wav', at: T.pump - 0.1, db: -18}, {f: 'pop.wav', at: T.pump - 0.04, db: -22},
    {f: 'ding.mp3', at: T.gills - 0.04, db: -24}, {f: 'pop.wav', at: T.keep, db: -24}, {f: 'whir.mp3', at: XRAY_SWIM, db: -31, to: 1.6},
    {f: 'pop.wav', at: T.mouth - 0.04, db: -22}, {f: 'bubblestream.wav', at: XRAY_OPEN + 0.1, db: -21},
    // fish in, FWOOP out of the gill, laughs
    {f: 'whoosh.wav', at: S5 - 0.02, db: -30}, {f: 'bubblestream.wav', at: S5 + 0.05, db: -24}, {f: 'gulp.wav', at: GULP, db: -15},
    {f: 'fwoop.wav', at: FWOOP, db: -7}, {f: 'boing.wav', at: FWOOP + 0.04, db: -19}, {f: 'crowd_laugh.wav', at: FWOOP + 0.12, db: -25, to: 1.0}, {f: 'giggle.mp3', at: FWOOP + 0.2, db: -29, to: 0.7},
    // the map: 20,000 KM in 9 months
    {f: 'whoosh.wav', at: S6 - 0.02, db: -30}, {f: 'pop.wav', at: S6 + 0.05, db: -22}, {f: 'pop.wav', at: KM0 - 0.08, db: -24},
    ...ticks(KM0, KM1, 20, -31), {f: 'ding.mp3', at: KM_AUS, db: -26}, {f: 'pop.wav', at: T.nine - 0.04, db: -22}, {f: 'ding.mp3', at: KM1, db: -19}, {f: 'pop.wav', at: KM1 + 0.06, db: -23},
    ...ctaCues(T.cta),
    // the bed: yawn, zzz, chokes awake, rockets up
    {f: 'whoosh.wav', at: S7 - 0.02, db: -30}, {f: 'pop.wav', at: T.you, db: -25}, {f: 'squeak.wav', at: 13.9, db: -26}, {f: 'snore.mp3', at: 14.25, db: -23, to: 0.5},
    {f: 'gasp.wav', at: WAKE, db: -13}, {f: 'beep.wav', at: WAKE + 0.04, db: -24}, {f: 'whoosh.wav', at: ROCKET, db: -14}, {f: 'bubblestream.wav', at: ROCKET + 0.02, db: -18}, {f: 'pop.wav', at: ROCKET, db: -21},
    // he hitches a ride
    {f: 'whoosh.wav', at: S8 - 0.02, db: -30}, {f: 'ding.mp3', at: 15.62, db: -26}, {f: 'slap.wav', at: GRAB, db: -15}, {f: 'whoosh.wav', at: GRAB + 0.04, db: -24},
    {f: 'bubblestream.wav', at: 16.2, db: -23}, {f: 'pop.wav', at: 16.44, db: -24}, {f: 'snore.mp3', at: 16.75, db: -23, to: 0.9}, {f: 'pfft.wav', at: 16.95, db: -24},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<GillScene t={0} />}>
        <GillScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="sharkgills/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const GillWide: React.FC = () => <WideFit.Provider value={0.72}><GillVideo /></WideFit.Provider>;
