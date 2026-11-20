// "What if you had a bat's wings?" - shark formula (the user's example; CLAUDE.md, Growth), niche: animal powers.
// The wish everyone has (to fly) breaks on the bat's secret: its wing IS a hand - the arm plus four very long fingers
// with skin stretched between them, only the thumb is free. (1) frame 0: he flies, wings up, grinning, a smug bat hanging
// from the branch beside him; (2) at 1.98 s his wing-hands slap the branch and can't grip, 2.55 s THUD close-up;
// (3) X-RAY: BAT WING (four fingers counted, the skin stretches); (4) the comedy hit comes from the power itself (he
// scratches his nose with his thumb claw and slaps his own face with the whole wing); (5) X-RAY: YOUR HAND (spread your
// fingers, same bones, then they stretch into a wing); (6) counter FREE FINGERS 10 -> 2; (7) three daily-life gags (the
// phone bounces off his wing, pizza in the face, a high five that swats the bat round the branch); (8) he texts with his
// feet, then flaps off = frame 0. Comment bubble opener + CommentAsk on screen (no either/or ending). All drawn in code;
// the guy is the camel's code-drawn front view with bat-wing arms.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Puffs, Arrow, Key} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.12; times are video time). Last word ends ~18.2 s; + 0.9 s for the push.
export const DURATION = 19.1;
export const T = {
  get: 0.10, wings: 0.81, lose: 1.67, hands: 1.96,                           // "Get a bat's wings, and you'd lose your hands."
  a2: 2.62, wing: 3.23, hand: 3.69,                                          // "A bat's wing is a hand."
  four: 4.26, long: 4.62, fingers: 4.97, skin: 5.76, stretched: 6.19, them: 6.94,  // "Four long fingers, with skin stretched between them."
  only: 7.37, thumb: 7.69, sticks: 7.97, out: 8.33,                           // "Only the thumb sticks out."
  spread: 8.76, fingers2: 9.26, same: 9.81, bones: 10.03, just: 10.67, shorter: 10.89,  // "Spread your fingers. Same bones, just shorter."
  so: 11.51, keep: 11.80, two: 12.08, ten: 12.69, fingers3: 12.87,            // "So you'd keep two of your ten fingers."
  phone: 13.80, pizza: 14.65, high: 15.55, fives: 15.76,                     // "No phone. No pizza. No high fives."
  now: 16.46, does: 16.96, all: 17.35, feet: 17.89,                          // "Now he does it all with his feet."
  cta: 11.55,
};
// shots (hard cuts) and beats
const S2 = 1.5, S3 = 2.52, S4 = 3.38, X1_IN = 3.56, X1_OUT = 7.2, S5 = 7.28, X2_IN = 8.68, X2_OUT = 11.36, S6 = 11.44;
const S7 = 13.52, S8 = 14.44, S9 = 15.36, S10 = 16.38;
const SLAP = 1.98;      // his wing-hands slap the branch (on "hands") - no grip
const LETGO = 2.28;     // they slide off, he drops
const LAND = 2.55;      // THUD
const SMACK = 8.17;     // his own wing slaps his face
const BOUNCE = 13.84;   // the phone bounces off his wing
const CRACK = 14.3;     // ... and cracks on the ground
const SPLAT = 14.86;    // pizza in the face
const WHAP = 15.86;     // the high five swats the bat round the branch
const LIFT = 18.22;     // he flaps off again (into frame 0)
const CNT1 = [4.26, 4.44, 4.62, 4.8];      // fingers counted on the bat X-ray
const CNT2 = [9.81, 9.9, 9.99, 10.08];     // ... and on your hand

const GOLD = '#FFD43B', RED = '#E2453C';
const MEM = '#5D4B78', MEM2 = '#4A3B63';                 // his wing skin
const FUR = '#8C7AA8', FUR2 = '#6C5A88', BWING = '#4A3D60', BBONE = '#2C2340', PINK = '#EFA3B6';
const GRASS = '#B9E09A', GRASS2 = '#93C873', HILL = '#D3EBC0', BARK = '#9A6B45', BARK2 = '#7A5234', LEAF = '#7CC36A', LEAF2 = '#5A9E4C';
const MOON = '#FFF1A6', MOON2 = '#F1DD82';
const FACE_C = '#F1EFEA';
const GX = -40;              // his x (flying and on the ground)
const FLY_Y = -150;          // his feet while flying (frame 0)
const REACH_Y = -255;        // his feet when he reaches for the branch
const BAT_X = 190;           // the bat hangs from the branch here
const FLAP_HZ = 2.4;
const brY = (x: number) => -640 + (x + 570) * 0.0316;   // branch centre line
const BAT_Y = brY(BAT_X);

// ---------- helpers ----------
type P2 = [number, number];
const D2R = Math.PI / 180;
const pt = (o: P2, a: number, L: number): P2 => [o[0] + L * Math.cos(a * D2R), o[1] + L * Math.sin(a * D2R)];
const mid = (a: P2, b: P2): P2 => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
const toward = (a: P2, b: P2, u: number): P2 => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${(ex - w).toFixed(1)} ${y.toFixed(1)} A ${rx} ${ry} 0 ${h > 0.5 ? 1 : 0} 1 ${(ex + w).toFixed(1)} ${y.toFixed(1)} Z`;
};

// ---------- bat-wing geometry: shoulder -> elbow -> wrist, four long fingers fanning from the wrist, a free thumb ----------
// angles in degrees for the RIGHT wing (0 = out to the right, 90 = down); the left wing is the mirror image.
type WP = {as: number; ae: number; ah: number; sp: number; fl?: number; th?: number};
type WD = {S: P2; LU: number; LF: number; L: number[]; LT: number; B: P2};
const WD_GUY: WD = {S: [38, -150], LU: 52, LF: 66, L: [100, 140, 115, 95], LT: 28, B: [40, -64]};
const WD_BAT: WD = {S: [26, 104], LU: 26, LF: 40, L: [52, 76, 62, 52], LT: 12, B: [14, 14]};
const lerpWP = (a: WP, b: WP, u: number): WP => ({as: lerp(a.as, b.as, u), ae: lerp(a.ae, b.ae, u), ah: lerp(a.ah, b.ah, u), sp: lerp(a.sp, b.sp, u),
  fl: lerp(a.fl ?? 1, b.fl ?? 1, u), th: lerp(a.th ?? 0, b.th ?? 0, u)});
const addF = (w: WP, f: number): WP => ({...w, as: w.as + f, ae: w.ae + f, ah: w.ah + f});
type WG = {S: P2; E: P2; Wr: P2; tips: P2[]; TH: P2; B: P2; thA: number};
const fingerAngles = (w: WP) => [w.ah - 22 * w.sp - 8, w.ah, w.ah + 34 * w.sp + 6, w.ah + 66 * w.sp + 12];
const wingGeom = (w: WP, d: WD, sd: number): WG => {
  const fl = w.fl ?? 1;
  const E = pt(d.S, w.as, d.LU), Wr = pt(E, w.ae, d.LF);
  const tips = fingerAngles(w).map((a, i) => pt(Wr, a, d.L[i] * fl));
  const thA = w.ae - 70 + (w.th ?? 0);
  const TH = pt(Wr, thA, d.LT);
  const m = (p: P2): P2 => [sd * p[0], p[1]];
  return {S: m(d.S), E: m(E), Wr: m(Wr), tips: tips.map(m), TH: m(TH), B: m(d.B), thA: sd > 0 ? thA : 180 - thA};
};
const scal = (a: P2, b: P2, c: P2, k: number) => toward(mid(a, b), c, k);
const memPath = (g: WG, depth = 0.3) => {
  const [t2, t3, t4, t5] = g.tips;
  return `M ${P(g.S)} L ${P(g.E)} L ${P(g.Wr)} L ${P(t2)} L ${P(t3)} Q ${P(scal(t3, t4, g.Wr, depth))} ${P(t4)} Q ${P(scal(t4, t5, g.Wr, depth))} ${P(t5)}`
    + ` Q ${P(scal(t5, g.B, g.E, depth * 0.8))} ${P(g.B)} Z`;
};
const Claw: React.FC<{at: P2; a: number; s?: number}> = ({at, a, s = 1}) => (
  <path transform={`translate(${P(at)}) rotate(${a.toFixed(1)}) scale(${s})`} d="M -3 -6 Q 9 -7 15 3 Q 6 0 -3 6 Z" fill={INK} stroke={INK} strokeWidth={2} strokeLinejoin="round" />
);

// his wing: purple skin, his own white arm and finger bones, a little thumb with a claw
const GuyWing: React.FC<{g: WG}> = ({g}) => {
  const arm = `M ${P(g.S)} L ${P(g.E)} L ${P(g.Wr)}`;
  const fingers = g.tips.map((tp) => `M ${P(g.Wr)} L ${P(tp)}`).join(' ');
  const thumb = `M ${P(g.Wr)} L ${P(g.TH)}`;
  return (
    <g>
      <path d={memPath(g)} fill={MEM} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${P(g.Wr)} L ${P(g.tips[1])} L ${P(g.tips[2])} Z`} fill={MEM2} opacity={0.55} />
      <path d={fingers} stroke={INK} strokeWidth={14} strokeLinecap="round" fill="none" />
      <path d={arm} stroke={INK} strokeWidth={27} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={thumb} stroke={INK} strokeWidth={15} strokeLinecap="round" fill="none" />
      <path d={fingers} stroke="#FFFFFF" strokeWidth={6.5} strokeLinecap="round" fill="none" />
      <path d={arm} stroke="#FFFFFF" strokeWidth={16} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={thumb} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" fill="none" />
      <Claw at={g.TH} a={g.thA} s={1.35} />
      <circle cx={g.Wr[0]} cy={g.Wr[1]} r={10} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
    </g>
  );
};
// the bat's wing: dark skin, darker bones
const BatWing: React.FC<{g: WG}> = ({g}) => {
  const bones = `M ${P(g.S)} L ${P(g.E)} L ${P(g.Wr)} ` + g.tips.map((tp) => `M ${P(g.Wr)} L ${P(tp)}`).join(' ');
  return (
    <g>
      <path d={memPath(g, 0.32)} fill={BWING} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
      <path d={bones} stroke={BBONE} strokeWidth={4.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M ${P(g.Wr)} L ${P(g.TH)}`} stroke={BBONE} strokeWidth={6} strokeLinecap="round" />
      <Claw at={g.TH} a={g.thA} s={0.7} />
    </g>
  );
};

// ---------- the guy (code-drawn front view; arms = bat wings) ----------
type Mood = 'joy' | 'focus' | 'shock' | 'oof' | 'worry' | 'dizzy' | 'meh' | 'sad' | 'gape' | 'oops' | 'happy' | 'look';
const Head: React.FC<{t: number; mood: Mood; look: P2; sauce: number; uid: string}> = ({t, mood, look, sauce, uid}) => {
  const R = HEAD_R;
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (mood === 'happy') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'oof') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === 'dizzy') return <path key={sd} d={`M ${ex} ${ey} m -2 0 a 3 3 0 1 1 4 2 a 7 7 0 1 1 -9 -6 a 11 11 0 1 1 15 10`} transform={`rotate(${t * 600 * sd} ${ex} ${ey})`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
    const big = mood === 'shock' || mood === 'gape' || mood === 'oops' ? 1.22 : 1;
    const rx = 12 * big, ry = 15 * big;
    const px = ex + look[0] * 4.5, py = ey + look[1] * 4.5;
    const pr = big > 1 ? 4.6 : 6.5;
    const lid = mood === 'meh' ? 0.5 : 0;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={px} cy={py + lid * 6} r={pr} fill={INK} />
        <circle cx={px - 1.5} cy={py - 2 + lid * 6} r={2} fill="#fff" />
        {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brow = (sd: number) => {
    let d = '';
    if (mood === 'joy' || mood === 'gape') d = `M ${sd * 12} -44 Q ${sd * 24} -52 ${sd * 37} -46`;
    else if (mood === 'shock' || mood === 'oops') d = `M ${sd * 12} -47 L ${sd * 37} -53`;
    else if (mood === 'focus') d = `M ${sd * 10} -33 L ${sd * 37} -43`;
    else if (mood === 'worry' || mood === 'sad' || mood === 'dizzy') d = `M ${sd * 12} -43 L ${sd * 36} -34`;
    else if (mood === 'meh') d = `M ${sd * 12} -36 L ${sd * 36} -36`;
    else if (mood === 'oof') d = `M ${sd * 10} -38 L ${sd * 36} -30`;
    return d ? <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null;
  };
  let mouth: React.ReactNode = null;
  if (mood === 'joy') mouth = <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  else if (mood === 'focus') mouth = <ellipse cx={4} cy={8} rx={8} ry={9} fill="#5A2328" stroke={INK} strokeWidth={4.5} />;
  else if (mood === 'shock') mouth = <ellipse cx={0} cy={9} rx={14} ry={18} fill="#5A2328" stroke={INK} strokeWidth={4.5} />;
  else if (mood === 'oof') mouth = <g><path d="M -26 -2 Q 0 -10 26 -2 Q 22 28 0 30 Q -22 28 -26 -2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -21 0 Q 0 -6 21 0 L 19 6 Q 0 2 -19 6 Z" fill="#fff" /></g>;
  else if (mood === 'worry' || mood === 'dizzy') mouth = <path d={`M -18 10 q 6 ${mood === 'dizzy' ? -6 + 3 * Math.sin(t * 14) : -6} 12 0 t 12 0 t 12 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (mood === 'meh' || mood === 'look') mouth = <path d="M -13 10 L 13 10" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
  else if (mood === 'sad') mouth = <path d="M -17 15 Q 0 3 17 15" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'gape') mouth = <g><circle cx={0} cy={10} r={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={22} rx={11} ry={6} fill="#E4677A" /></g>;
  else if (mood === 'oops') mouth = <g><rect x={-24} y={0} width={48} height={20} rx={8} fill="#fff" stroke={INK} strokeWidth={4.5} /><path d="M -23 10 H 23 M -8 1 V 19 M 8 1 V 19" stroke={INK} strokeWidth={3} /></g>;
  else if (mood === 'happy') mouth = <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  return (
    <g>
      <circle r={R + 1} fill={`url(#bwFace${uid})`} stroke={INK} strokeWidth={6.5} />
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)">{mouth}</g>
      {sauce > 0.01 ? <g opacity={sauce}>
        <ellipse cx={-38} cy={14} rx={11} ry={8} fill="#D9483B" stroke={INK} strokeWidth={3} transform="rotate(-20 -38 14)" />
        <ellipse cx={34} cy={-36} rx={8} ry={6} fill="#D9483B" stroke={INK} strokeWidth={3} />
        <circle cx={18} cy={48} r={6} fill="#FFD66B" stroke={INK} strokeWidth={3} />
      </g> : null}
    </g>
  );
};

const BODY_D = 'M -28 -182 C -42 -176 -47 -164 -47 -148 L -46 -74 L -42 -16 Q -42 0 -26 0 L -12 0 Q -4 0 -4 -10 L -3 -50 Q 0 -56 3 -50 L 4 -10 Q 4 0 12 0 L 26 0 Q 42 0 42 -16 L 46 -74 L 47 -148 C 47 -164 42 -176 28 -182 Z';
const BODY_SIT_D = 'M -28 -182 C -42 -176 -47 -164 -47 -148 L -46 -74 Q -48 0 0 0 Q 48 0 46 -74 L 47 -148 C 47 -164 42 -176 28 -182 Z';
type Legs = 'stand' | 'dangle' | 'sit';
type GuyS = {x: number; y: number; rot: number; sx: number; sy: number; wl: WP; wr: WP; mood: Mood; look: P2; legs: Legs; frontR: boolean;
  hr: number; hdx: number; hdy: number; sauce: number; phone: boolean; type: number};
const Phone: React.FC<{cracked: boolean; lit?: boolean}> = ({cracked, lit = true}) => (
  <g>
    <rect x={-22} y={-40} width={44} height={80} rx={9} fill="#3B4252" stroke={INK} strokeWidth={5} />
    <rect x={-16} y={-32} width={32} height={60} rx={4} fill={lit ? '#8FD3FF' : '#2B3550'} />
    {lit ? <path d="M -10 -22 H 8 M -10 -12 H 10 M -10 -2 H 4" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" /> : null}
    {cracked ? <path d="M 6 -30 L -2 -12 L 8 -4 L -6 14 L 2 26 M -2 -12 L -14 -6 M -6 14 L -15 20" stroke="#FFFFFF" strokeWidth={2.6} fill="none" strokeLinejoin="round" /> : null}
  </g>
);
const GuyBW: React.FC<{t: number; g: GuyS; uid: string}> = ({t, g, uid}) => {
  const gl = wingGeom(g.wl, WD_GUY, -1), gr = wingGeom(g.wr, WD_GUY, 1);
  const breathe = 1 + 0.008 * Math.sin(2 * Math.PI * 0.6 * t);
  const dangle = g.legs === 'dangle';
  let body: React.ReactNode;
  if (g.legs === 'sit') {
    // sitting on the grass, knees up, the phone held between his feet (toe typing: the feet take turns)
    const tap = (sd: number) => g.type * 6 * Math.max(0, Math.sin(t * 2 * Math.PI * 3.2 + (sd > 0 ? 0 : Math.PI)));
    const leg = (sd: number) => {
      const hip: P2 = [sd * 22, -18], knee: P2 = [sd * 66, -84], foot: P2 = [sd * 34, -118 - tap(sd)];
      const d = `M ${P(hip)} Q ${P(knee)} ${P(foot)}`;
      return <g key={sd}>
        <path d={d} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
        <path d={d} stroke="#FFFFFF" strokeWidth={19} fill="none" strokeLinecap="round" />
      </g>;
    };
    const foot = (sd: number) => <ellipse key={'f' + sd} cx={sd * 31} cy={-120 - tap(sd)} rx={11} ry={22} fill="#fff" stroke={INK} strokeWidth={6} transform={`rotate(${sd * -14} ${sd * 31} ${-120 - tap(sd)})`} />;
    body = <g>
      <path d={BODY_SIT_D} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {leg(-1)}{leg(1)}
      {g.phone ? <g transform={`translate(0 ${-120 - 2 * Math.sin(t * 9)}) rotate(-4)`}><Phone cracked /></g> : null}
      {foot(-1)}{foot(1)}
    </g>;
  } else {
    body = <g>
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 24} cy={dangle ? -2 : -6} rx={dangle ? 14 : 23} ry={dangle ? 16 : 9.5} fill="#fff" stroke={INK} strokeWidth={6}
        transform={dangle ? `rotate(${sd * 18} ${sd * 24} -2)` : undefined} />)}
      <path d={BODY_D} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
    </g>;
  }
  return (
    <W><g transform={`translate(${g.x} ${g.y}) rotate(${g.rot}) scale(${g.sx} ${g.sy * breathe})`}>
      <GuyWing g={gl} />
      {g.frontR ? null : <GuyWing g={gr} />}
      {body}
      <g transform={`translate(${g.hdx} ${-235 + g.hdy}) rotate(${g.hr})`}><Head t={t} mood={g.mood} look={g.look} sauce={g.sauce} uid={uid} /></g>
      {g.frontR ? <GuyWing g={gr} /> : null}
    </g></W>
  );
};

// his wing poses (right wing; the left mirrors it)
const FLY: WP = {as: -18, ae: -8, ah: 8, sp: 1};                        // + a flap rotation
const REACH: WP = {as: -60, ae: -80, ah: -75, sp: 0.5};
const UP2: WP = {as: -80, ae: -95, ah: -95, sp: 0.6};                    // straight up over the branch
const DRAPE: WP = {as: -80, ae: -92, ah: -45, sp: 0.95};                 // flopped onto the branch
const SLIP: WP = {as: -62, ae: -70, ah: 45, sp: 0.8};
const FLAIL: WP = {as: -40, ae: -70, ah: -80, sp: 0.6};
const REST: WP = {as: 52, ae: 78, ah: 40, sp: 0.5, fl: 0.62};             // standing: wings hang at his sides
const HOLD: WP = {as: -12, ae: -88, ah: -78, sp: 0.45, fl: 0.8};          // forearm up: the thumb points at his face
const NOSE: WP = {as: -100, ae: -140, ah: -150, sp: 0.9, fl: 0.9};       // the thumb on his nose = the whole wing on his face
const TRAMP: WP = {as: -15, ae: -5, ah: 5, sp: 1};                       // held out flat (the phone bounces off it)
const CATCH: WP = {as: -30, ae: -100, ah: -100, sp: 0.7, fl: 0.85};
const SWAT: WP = {as: -50, ae: -62, ah: -55, sp: 0.9};                   // the high five
const SITW: WP = {as: 40, ae: 20, ah: 70, sp: 0.6, fl: 0.55};            // sitting: wings resting on the grass
const flapPh = (t: number) => -22 - 38 * Math.cos(2 * Math.PI * FLAP_HZ * t);   // -60 = wings up (frame 0), +16 = down
const bobY = (t: number) => 9 * Math.cos(2 * Math.PI * FLAP_HZ * t);

// ---------- the bat: hangs upside down from the branch by its feet (face drawn upright) ----------
type BatMood = 'smug' | 'laugh' | 'grin' | 'dizzy' | 'wow';
type BatS = {mood: BatMood; spin: number; openR: number; reach: number};
const BAT_FOLD: WP = {as: 70, ae: -100, ah: -95, sp: 0.15, fl: 0.6};
const BAT_OPEN: WP = {as: 15, ae: -20, ah: 5, sp: 1};
const BAT_REACH: WP = {as: 60, ae: 70, ah: 65, sp: 0.6};
const Bat: React.FC<{t: number; b: BatS; uid: string}> = ({t, b, uid}) => {
  const laugh = b.mood === 'laugh';
  const sway = 3 * Math.sin(t * 1.6) + (laugh ? 4 * Math.sin(t * 30) : 0);
  const wR = wingGeom(lerpWP(BAT_FOLD, BAT_OPEN, eio(clamp(b.openR))), WD_BAT, 1);
  const wL = wingGeom(lerpWP(BAT_FOLD, BAT_REACH, eio(clamp(b.reach))), WD_BAT, -1);
  const hx = 0, hy = 132;
  const eye = (sd: number) => {
    const ex = hx + sd * 16, ey = hy - 8;
    if (laugh) return <path key={sd} d={`M ${ex - 10} ${ey + 3} Q ${ex} ${ey - 8} ${ex + 10} ${ey + 3}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (b.mood === 'dizzy') return <path key={sd} d={`M ${ex} ${ey} m -2 0 a 3 3 0 1 1 4 2 a 6 6 0 1 1 -8 -5 a 9 9 0 1 1 12 8`} transform={`rotate(${t * 700 * sd} ${ex} ${ey})`} stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />;
    const big = b.mood === 'wow' ? 1.2 : 1;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={11 * big} ry={13 * big} fill="#fff" stroke={INK} strokeWidth={4.5} />
        <circle cx={ex - 2} cy={ey + 2} r={b.mood === 'wow' ? 4 : 5.5} fill={INK} />
        {b.mood === 'smug' ? <path d={lidPath(ex, ey, 11.5, 13.5, 0.48)} fill={FUR} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  let mouth: React.ReactNode;
  if (b.mood === 'smug') mouth = <g><path d={`M ${hx - 12} ${hy + 20} Q ${hx + 2} ${hy + 29} ${hx + 14} ${hy + 15}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    <path d={`M ${hx - 6} ${hy + 23} l 3 7 l 3 -6`} fill="#fff" stroke={INK} strokeWidth={2.5} strokeLinejoin="round" /></g>;
  else if (laugh || b.mood === 'grin') mouth = <g><path d={`M ${hx - 15} ${hy + 15} Q ${hx} ${hy + 40} ${hx + 15} ${hy + 15} Z`} fill="#7A2A36" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d={`M ${hx - 9} ${hy + 16} l 3 7 l 3 -7 M ${hx + 3} ${hy + 16} l 3 7 l 3 -7`} fill="#fff" stroke={INK} strokeWidth={2} strokeLinejoin="round" /></g>;
  else if (b.mood === 'wow') mouth = <ellipse cx={hx} cy={hy + 24} rx={7} ry={9} fill="#5A2328" stroke={INK} strokeWidth={4} />;
  else mouth = <path d={`M ${hx - 12} ${hy + 24} q 4 -5 8 0 t 8 0 t 8 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
  return (
    <W><g transform={`translate(${BAT_X} ${BAT_Y}) rotate(${b.spin + sway})`}>
      <BatWing g={wL} />
      <BatWing g={wR} />
      {/* legs + toes hooked over the branch */}
      {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 13} 28 L ${sd * 11} 0 M ${sd * 11} 0 l ${-8 * sd} -10 M ${sd * 11} 0 l ${4 * sd} -12`} stroke={INK} strokeWidth={6} strokeLinecap="round" fill="none" />)}
      <ellipse cx={0} cy={66} rx={40} ry={54} fill={`url(#bwFur${uid})`} stroke={INK} strokeWidth={7} />
      <path d="M -18 40 q 18 10 36 0 M -15 68 q 15 9 30 0" stroke={FUR2} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* ears point down (it hangs upside down) */}
      {[-1, 1].map((sd) => (
        <g key={sd} transform={`translate(${hx + sd * 25} ${hy + 18}) rotate(${sd * -32})`}>
          <path d="M -17 -8 Q -19 38 0 74 Q 19 38 17 -8 Z" fill={`url(#bwFur${uid})`} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -8 -2 Q -9 30 0 54 Q 9 30 8 -2 Z" fill={PINK} />
        </g>
      ))}
      <circle cx={hx} cy={hy} r={44} fill={`url(#bwFur${uid})`} stroke={INK} strokeWidth={7} />
      <ellipse cx={hx} cy={hy + 12} rx={28} ry={22} fill="#AE9CC8" />
      {eye(-1)}{eye(1)}
      <path d={`M ${hx - 6} ${hy + 6} L ${hx + 6} ${hy + 6} L ${hx} ${hy + 12} Z`} fill={INK} />
      {mouth}
    </g></W>
  );
};

// ---------- the world: notebook night - a big moon, hills, a tree with a long branch, grass ----------
const Moon: React.FC = () => (
  <W><g>
    <circle cx={-431} cy={-331} r={452} fill={MOON} stroke={INK} strokeWidth={9} />
    {[[-560, -470, 70], [-300, -180, 46], [-250, -520, 34], [-610, -160, 40], [-420, -360, 26]].map(([x, y, r], i) =>
      <circle key={i} cx={x} cy={y} r={r} fill={MOON2} stroke="#E0C766" strokeWidth={5} />)}
    {[[400, -900], [700, -600], [-1100, -700], [180, -1250], [900, -1150], [-900, -1250]].map(([x, y], i) => {
      const r = 26 + (i % 3) * 8;
      const d = Array.from({length: 10}, (_, k) => { const a = -Math.PI / 2 + (k * Math.PI) / 5, rr = k % 2 ? r * 0.45 : r; return `${(x + rr * Math.cos(a)).toFixed(1)} ${(y + rr * Math.sin(a)).toFixed(1)}`; }).join(' L ');
      return <path key={'s' + i} d={`M ${d} Z`} fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
    })}
  </g></W>
);
const Hills: React.FC = () => (
  <W><g>
    <path d="M -3000 -120 Q -2300 -380 -1600 -150 Q -1000 -420 -300 -170 Q 300 -400 900 -160 Q 1500 -380 2200 -150 Q 2700 -300 3200 -140 L 3200 3000 L -3000 3000 Z"
      fill={HILL} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </g></W>
);
const Ground: React.FC = () => (
  <W><g>
    <rect x={-4000} y={0} width={8000} height={4000} fill={GRASS} />
    <path d="M -4000 0 H 4000" stroke={INK} strokeWidth={8} />
    {Array.from({length: 26}, (_, i) => {
      const x = -1300 + i * 110 + rnd(i * 3) * 60, y = 30 + rnd(i * 7) * 220;
      return <path key={i} d={`M ${x - 14} ${y} l 6 -20 l 6 16 l 6 -24 l 6 22`} stroke={GRASS2} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    })}
    {[[-260, 6], [150, 4], [420, 8], [-520, 5]].map(([x, s], i) => (
      <g key={'fl' + i} transform={`translate(${x} ${-4})`}>
        <path d="M 0 0 V -26" stroke={LEAF2} strokeWidth={5} />
        {[0, 72, 144, 216, 288].map((a) => <circle key={a} cx={9 * Math.cos(a * D2R)} cy={-30 + 9 * Math.sin(a * D2R)} r={s + 3} fill="#FFFFFF" stroke={INK} strokeWidth={3} />)}
        <circle cx={0} cy={-30} r={5} fill={GOLD} stroke={INK} strokeWidth={3} />
      </g>
    ))}
  </g></W>
);
/** the middle of the branch drawn again over him while he grabs it, so his fingertips tuck behind it */
const BranchFront: React.FC = () => {
  const x0 = -230, x1 = 150, xm = (x0 + x1) / 2;
  const d = `M ${x0} ${brY(x0) - 6} Q ${xm} ${brY(xm) - 16} ${x1} ${brY(x1) - 8}`;
  return <W><g>
    <path d={d} stroke={INK} strokeWidth={42} fill="none" strokeLinecap="butt" />
    <path d={d} stroke={BARK} strokeWidth={28} fill="none" strokeLinecap="butt" />
    <path d={`M ${x0} ${brY(x0) - 12} Q ${xm} ${brY(xm) - 22} ${x1} ${brY(x1) - 14}`} stroke="#B98A5E" strokeWidth={6} fill="none" />
  </g></W>;
};
const TX = -600;
const Tree: React.FC<{t: number}> = ({t}) => {
  const bx0 = TX + 30, bx1 = 430;
  const branch = `M ${bx0} ${brY(bx0) + 6} Q ${(bx0 + bx1) / 2} ${brY((bx0 + bx1) / 2) - 18} ${bx1} ${brY(bx1)}`;
  return (
    <W><g>
      <path d={`M ${TX - 60} 4 Q ${TX - 40} -400 ${TX - 44} -820 L ${TX + 44} -820 Q ${TX + 40} -400 ${TX + 60} 4 Z`} fill={BARK} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d={`M ${TX - 10} -120 q 12 -40 0 -80 M ${TX + 18} -380 q -10 -30 4 -60`} stroke={BARK2} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={branch} stroke={INK} strokeWidth={42} fill="none" strokeLinecap="round" />
      <path d={branch} stroke={BARK} strokeWidth={28} fill="none" strokeLinecap="round" />
      <path d={`M ${bx0 + 80} ${brY(bx0 + 80) - 4} Q ${(bx0 + bx1) / 2} ${brY((bx0 + bx1) / 2) - 24} ${bx1 - 60} ${brY(bx1 - 60) - 8}`} stroke="#B98A5E" strokeWidth={6} fill="none" strokeLinecap="round" />
      {/* leaves on the branch */}
      {[-380, -160, 40, 330, 420].map((x, i) => {
        const y = brY(x) - 12, a = (i % 2 ? -1 : 1) * (30 + 8 * Math.sin(t * 1.5 + i));
        return <path key={i} transform={`translate(${x} ${y}) rotate(${-90 + a})`} d="M 0 0 Q 22 -16 52 0 Q 22 16 0 0 Z" fill={i % 2 ? LEAF2 : LEAF} stroke={INK} strokeWidth={5} strokeLinejoin="round" />;
      })}
      {/* crown */}
      {[[-210, -60, 180], [-20, -150, 170], [170, -40, 150], [60, 70, 130], [-160, 80, 120], [-330, 20, 120]].map(([dx, dy, r], i) => (
        <circle key={'c' + i} cx={TX + dx + 3 * Math.sin(t * 1.2 + i)} cy={-900 + dy} r={r} fill={i % 2 ? LEAF2 : LEAF} stroke={INK} strokeWidth={8} />
      ))}
    </g></W>
  );
};

// ---------- props ----------
const Pizza: React.FC = () => (
  <g>
    <path d="M -46 -30 Q 0 -44 46 -30 L 0 60 Z" fill="#FFD66B" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -48 -30 Q 0 -48 48 -30 Q 50 -42 40 -46 Q 0 -60 -40 -46 Q -50 -42 -48 -30 Z" fill="#E7B064" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[[-16, -16], [14, -12], [0, 18]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill="#D9483B" stroke={INK} strokeWidth={4} />)}
    <path d="M 24 -2 q 4 16 -2 26" stroke="#FFD66B" strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);

// ---------- screen inserts ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const XFrame: React.FC<{id: string; R: number; t: number; children: React.ReactNode}> = ({id, R, t, children}) => (
  <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
    <clipPath id={id}><circle r={R} /></clipPath>
    <circle r={R + 18} fill={INK} />
    <g clipPath={`url(#${id})`}>
      <rect x={-450} y={-450} width={900} height={900} fill="#16223A" />
      {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
      {children}
      <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
    </g>
    <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
  </svg>
);
const BONE = '#F4F2EA';
/** a finger / arm bone chain from a to b: segments split at `cuts` (fractions) with knuckles; p = how much is drawn */
const BoneChain: React.FC<{a: P2; b: P2; w: number; cuts?: number[]; p?: number; glow?: number}> = ({a, b, w, cuts = [], p = 1, glow = 0}) => {
  if (p <= 0.002) return null;
  const fr = [0, ...cuts, 1];
  const segs: [P2, P2][] = [];
  for (let i = 0; i < fr.length - 1; i++) {
    const u0 = fr[i] + (i ? 0.012 : 0), u1 = Math.min(fr[i + 1] - (i < fr.length - 2 ? 0.012 : 0), p);
    if (u1 > u0) segs.push([toward(a, b, u0), toward(a, b, u1)]);
  }
  const d = segs.map(([s, e]) => `M ${P(s)} L ${P(e)}`).join(' ');
  return (
    <g>
      {glow > 0.01 ? <path d={d} stroke={GOLD} strokeWidth={w + 20} strokeLinecap="round" opacity={glow} /> : null}
      <path d={d} stroke={INK} strokeWidth={w + 8} strokeLinecap="round" />
      <path d={d} stroke={BONE} strokeWidth={w} strokeLinecap="round" />
      {cuts.filter((c) => c < p).map((c, i) => { const k = toward(a, b, c); return <circle key={i} cx={k[0]} cy={k[1]} r={w * 0.62} fill={BONE} stroke={INK} strokeWidth={3.5} />; })}
    </g>
  );
};
const Badge: React.FC<{at: P2; n: number | string; s: number}> = ({at, n, s}) => s > 0.01 ? (
  <g transform={`translate(${P(at)}) scale(${s})`}>
    <circle r={27} fill={GOLD} stroke={INK} strokeWidth={5} />
    <text x={0} y={2} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={INK}>{n}</text>
  </g>
) : null;

/** X-RAY: BAT WING - the arm and four long finger bones with skin between them, the thumb free; fingers counted 1-4 */
const X1_D: WD = {S: [-300, 10], LU: 110, LF: 160, L: [240, 330, 280, 235], LT: 48, B: [-250, 230]};
const BatXRay: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const sp = lerp(0.72, 1.05, eio(seg(t, 5.7, 6.45)));
  const g = wingGeom({as: 30, ae: -28, ah: 6, sp}, X1_D, 1);
  const p = eio(seg(t, X1_IN + 0.05, X1_IN + 0.45));
  const skin = 0.3 + 0.25 * eio(seg(t, 5.7, 6.45)) + 0.12 * Math.max(0, Math.sin((t - 5.7) * 9)) * (t > 5.7 && t < 6.6 ? 1 : 0);
  return (
    <div style={{position: 'absolute', left: 540, top: 1210, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s * 0.94})`}}>
      <XFrame id={`bx${uid}`} R={330} t={t}>
        {/* the body (fur) at the left edge */}
        <ellipse cx={-400} cy={110} rx={120} ry={200} fill="#4B4170" stroke="#7C6AA8" strokeWidth={6} />
        <path d={memPath(g, 0.3)} fill="#B9A3E6" fillOpacity={skin} stroke="#D9C9FF" strokeWidth={5} strokeLinejoin="round" />
        <BoneChain a={g.S} b={g.E} w={30} p={p} />
        <BoneChain a={g.E} b={g.Wr} w={24} p={p} />
        {g.tips.map((tp, i) => <BoneChain key={i} a={g.Wr} b={tp} w={18} cuts={[0.42, 0.72]} p={p} glow={t > CNT1[i] ? Math.max(0.35, 1 - (t - CNT1[i]) * 2) : 0} />)}
        <BoneChain a={g.Wr} b={g.TH} w={13} p={p} />
        {p > 0.95 ? <Claw at={g.TH} a={g.thA} s={2.2} /> : null}
        <circle cx={g.Wr[0]} cy={g.Wr[1]} r={18} fill={BONE} stroke={INK} strokeWidth={5} opacity={p} />
        {g.tips.map((tp, i) => {
          const dir = Math.atan2(tp[1] - g.Wr[1], tp[0] - g.Wr[0]);
          return <Badge key={'n' + i} at={[tp[0] - 36 * Math.cos(dir) + 30 * Math.sin(dir), tp[1] - 36 * Math.sin(dir) - 30 * Math.cos(dir)]} n={i + 1} s={popIn(t, CNT1[i], 0.25)} />;
        })}
      </XFrame>
      <Card text="X-RAY: BAT WING" top={815} size={48} rot={2} />
      <Card text="IT'S A HAND" top={110} left={430} color={RED} fg="#fff" rot={-4} s={popIn(t, 3.72, 0.3)} size={56} />
      <Card text="4 FINGERS" top={250} left={760} color={GOLD} rot={6} s={popIn(t, T.fingers, 0.3)} size={48} />
      <Card text="SKIN" top={650} left={250} color={PINK} rot={-6} s={popIn(t, T.skin + 0.02, 0.3)} size={52} />
      <Card text="2 LAYERS THIN" top={720} left={600} rot={3} s={popIn(t, 6.6, 0.3)} size={36} />
    </div>
  );
};

/** X-RAY: YOUR HAND - spread your fingers (same bones: 1-4 + the thumb), then they stretch into a bat wing */
const HW: P2 = [-40, 230];                         // your wrist
const F_CLOSED = [-100, -90, -80, -72], F_SPREAD = [-114, -90, -67, -46], F_WING = [-120, -86, -52, -18];
const F_LEN = [260, 280, 260, 215];
const HandXRay: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const spr = eio(seg(t, 8.82, 9.32)), wing = eio(seg(t, 10.7, 11.15));
  const dirs = F_CLOSED.map((c, i) => lerp(lerp(c, F_SPREAD[i], spr), F_WING[i], wing));
  const tips = dirs.map((a, i) => pt(HW, a, F_LEN[i] * (1 + 0.46 * wing)));
  const thA = lerp(-138, -158, spr), TH = pt(HW, thA, 166);
  const skinD = `M ${P(HW)} L ${P(tips[0])} L ${P(tips[1])} Q ${P(scal(tips[1], tips[2], HW, 0.3))} ${P(tips[2])} Q ${P(scal(tips[2], tips[3], HW, 0.3))} ${P(tips[3])} Q ${P(scal(tips[3], [-110, 420], HW, 0.25))} -110 420 L -250 430 Z`;
  return (
    <div style={{position: 'absolute', left: 540, top: 1000, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s * 0.96})`}}>
      <XFrame id={`hx${uid}`} R={330} t={t}>
        {/* soft hand outline */}
        {wing < 0.98 ? <g opacity={0.5 * (1 - wing)}>
          {tips.map((tp, i) => <path key={i} d={`M ${P(HW)} L ${P(tp)}`} stroke="#5D7AA6" strokeWidth={74} strokeLinecap="round" />)}
          <path d={`M ${P(HW)} L ${P(TH)}`} stroke="#5D7AA6" strokeWidth={70} strokeLinecap="round" />
          <circle cx={HW[0] + 26} cy={HW[1] - 56} r={122} fill="#5D7AA6" />
          <path d="M -230 470 L -20 220 L 90 300 L -100 480 Z" fill="#5D7AA6" />
        </g> : null}
        {wing > 0.01 ? <path d={skinD} fill="#B9A3E6" fillOpacity={0.5 * wing} stroke="#D9C9FF" strokeWidth={5} strokeLinejoin="round" opacity={Math.min(1, wing * 2)} /> : null}
        {/* forearm: two bones */}
        <BoneChain a={[-230, 420]} b={[-66, 262]} w={30} />
        <BoneChain a={[-170, 450]} b={[-14, 274]} w={26} />
        {/* wrist bones */}
        {[[-66, 236], [-34, 220], [-2, 232], [-52, 266], [-18, 258], [14, 258], [-84, 258]].map(([x, y], i) =>
          <rect key={i} x={x - 16} y={y - 13} width={32} height={26} rx={11} fill={BONE} stroke={INK} strokeWidth={4} />)}
        {tips.map((tp, i) => <BoneChain key={i} a={HW} b={tp} w={21} cuts={[0.45, 0.72, 0.87]} glow={t > CNT2[i] ? Math.max(0.35, 1 - (t - CNT2[i]) * 2) : 0} />)}
        <BoneChain a={HW} b={TH} w={22} cuts={[0.42, 0.74]} glow={t > CNT2[0] ? 0.5 : 0} />
        {tips.map((tp, i) => {
          const dir = Math.atan2(tp[1] - HW[1], tp[0] - HW[0]);
          return <Badge key={'n' + i} at={[tp[0] + 34 * Math.cos(dir), tp[1] + 34 * Math.sin(dir)]} n={i + 1} s={popIn(t, CNT2[i], 0.25) * (1 - seg(t, 10.62, 10.72))} />;
        })}
      </XFrame>
      <Card text="YOUR HAND" top={92} />
      <Card text="TRY IT" top={220} left={770} color={GOLD} rot={7} s={pulse(t, 8.86, 0.85)} size={50} />
      <Card text="= BAT WING" top={790} left={600} rot={-3} s={popIn(t, T.bones, 0.3) * (1 - seg(t, 11.02, 11.12))} size={48} />
      <Card text="BYE, HANDS" top={790} left={600} color={RED} fg="#fff" rot={-3} s={popIn(t, 11.12, 0.3)} size={54} />
    </div>
  );
};

/** FREE FINGERS 10 -> 2: ten little fingers, the eight non-thumbs go grey */
const Counter: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const v = Math.max(2, 10 - Math.floor(8 * seg(t, 11.62, T.two)));
  const done = t >= T.two;
  const bump = done ? 1 + 0.1 * Math.max(0, 1 - (t - T.two) * 4) : 1;
  const finger = (k: number, x: number, thumb: boolean) => {
    const on = thumb || k < v - 2;
    return <rect key={k} x={x - 9} y={thumb ? 24 : 0} width={18} height={thumb ? 34 : 58} rx={9} fill={on ? (thumb && done ? GOLD : '#FFFFFF') : '#C9C2B4'}
      stroke={INK} strokeWidth={5} transform={thumb ? `rotate(${x < 0 ? -30 : 30} ${x} 58)` : undefined} />;
  };
  // eight fingers (left hand x -98..-26, right hand 26..98) + two thumbs
  const xs = [-98, -74, -50, -26, 26, 50, 74, 98];
  return (
    <div style={{position: 'absolute', left: 540, top: 1480, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s * bump})`,
      background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '8px 30px 12px', fontFamily: FONT, color: INK,
      display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap'}}>
      <svg width={250} height={110} viewBox="-125 -20 250 110">
        {xs.map((x, k) => finger(k, x, false))}
        {finger(8, -120, true)}{finger(9, 120, true)}
      </svg>
      <div>
        <div style={{fontWeight: 900, fontSize: 116, lineHeight: 1, color: done ? RED : INK}}>{v}</div>
        <div style={{fontWeight: 900, fontSize: 38}}>FREE FINGERS</div>
        <div style={{fontWeight: 800, fontSize: 30, color: '#7A5A2A', opacity: seg(t, 12.85, 12.95)}}>THUMBS ONLY</div>
      </div>
    </div>
  );
};

// ---------- the story over time ----------
const G0 = (): GuyS => ({x: GX, y: 0, rot: 0, sx: 1, sy: 1, wl: REST, wr: REST, mood: 'look', look: [0, 0], legs: 'stand', frontR: false,
  hr: 0, hdx: 0, hdy: 0, sauce: 0, phone: false, type: 0});
const flyWP = (t: number) => addF(FLY, flapPh(t));
const guyAt = (t: number): GuyS => {
  const g = G0();
  if (t >= SPLAT) g.sauce = 1;
  if (t < S2) {                                  // frame 0: flying, wings up, grinning
    g.y = FLY_Y + bobY(t); g.legs = 'dangle';
    g.wl = g.wr = flyWP(t); g.mood = 'joy'; g.look = [0.7, -0.5]; g.rot = 2 * Math.sin(t * 2.4);
    return g;
  }
  if (t < SLAP) {                                // up to the branch: hands up to grab it
    const u = eio(seg(t, S2, 1.84)), v = eio(seg(t, 1.84, SLAP));
    g.y = lerp(FLY_Y + bobY(t), REACH_Y, u); g.legs = 'dangle';
    g.wl = g.wr = lerpWP(lerpWP(flyWP(t), REACH, u), UP2, v);
    g.mood = 'focus'; g.look = [0.2, -1];
    return g;
  }
  if (t < LETGO) {                               // SLAP: the wings flop onto the branch - nothing to close round it
    const u = eout(seg(t, SLAP, SLAP + 0.07)), v = eio(seg(t, 2.18, LETGO));
    const grab = t < 2.18 ? 0.4 * Math.abs(Math.sin((t - SLAP) * 24)) : 0;   // the fingers try to close: bunch, spread, bunch
    g.y = REACH_Y + 6 * seg(t, SLAP, 2.18) + 16 * v; g.legs = 'dangle';
    const w = lerpWP(lerpWP(UP2, DRAPE, u), SLIP, v);
    g.wl = g.wr = {...w, sp: w.sp - grab};
    g.mood = t < 2.12 ? 'focus' : 'shock'; g.look = [0, -1]; g.rot = 3 * Math.sin((t - SLAP) * 30) * (1 - v);
    return g;
  }
  if (t < LAND) {                                // falling
    const tau = t - LETGO;
    g.y = Math.min(0, REACH_Y + 22 + 0.5 * 6400 * tau * tau); g.legs = 'dangle';
    const fl = 12 * Math.sin(t * 2 * Math.PI * 6);
    g.wl = g.wr = addF(lerpWP(SLIP, FLAIL, eio(seg(t, LETGO, LETGO + 0.12))), fl);
    g.mood = 'shock'; g.look = [0, 1];
    return g;
  }
  if (t < S4) {                                  // THUD (close-up): squash, then he stares at his wings
    const sq = hit(t, LAND, 0.3, 6) * Math.cos((t - LAND) * 20);
    g.sy = 1 - sq; g.sx = 1 + 0.55 * sq;
    g.wl = g.wr = lerpWP(FLAIL, REST, eout(seg(t, LAND - 0.02, LAND + 0.12)));
    g.wr = {...g.wr, th: t > 2.9 ? 18 * Math.sin(t * 34) : 0};
    g.wl = {...g.wl, th: t > 2.95 ? 18 * Math.sin(t * 31 + 1) : 0};
    g.mood = t < LAND ? 'shock' : t < 2.86 ? 'oof' : 'shock'; g.look = t < 2.86 ? [0, 0] : [0.9, 0.8];
    return g;
  }
  if (t < S5) {                                  // off camera while the bat shows its wing
    g.x = GX - 2000; g.mood = 'worry'; g.look = [0.8, -0.6];
    return g;
  }
  if (t < X2_IN + 0.05) {                        // the thumb: he scratches his nose and slaps himself with the whole wing
    const up = eio(seg(t, 7.42, 7.66)), sw = eio(seg(t, 7.96, SMACK)), back = eio(seg(t, 8.3, 8.62));
    let w = lerpWP(REST, HOLD, up);
    if (t > 7.69 && t < 7.96) w = {...w, th: 20 * Math.sin((t - 7.69) * 36)};
    w = lerpWP(w, NOSE, sw);
    w = lerpWP(w, REST, back);
    g.wr = w; g.frontR = t > 7.9 && t < 8.48;
    const jolt = hit(t, SMACK, 1, 7);
    g.hr = -14 * jolt; g.hdx = -10 * jolt; g.rot = -3 * jolt;
    g.mood = t < 7.45 ? 'worry' : t < 7.96 ? 'look' : t < SMACK ? 'focus' : t < SMACK + 0.12 ? 'oof' : 'dizzy';
    g.look = t < 7.96 ? [1, -0.6] : [0.4, 0.2];
    return g;
  }
  if (t < S6) {                                  // behind YOUR HAND: still a bit dizzy
    g.mood = t < 9.4 ? 'dizzy' : 'meh'; g.look = [0, 0];
    return g;
  }
  if (t < S7) {                                  // two thumbs up - all he has left
    const up = eio(seg(t, S6, S6 + 0.28));
    const th = t > S6 + 0.3 ? 16 * Math.sin(t * 26) : 0;
    g.wl = {...lerpWP(REST, HOLD, up), th}; g.wr = {...lerpWP(REST, HOLD, up), th: 16 * Math.sin(t * 26 + 1.3) * (t > S6 + 0.3 ? 1 : 0)};
    g.mood = t < T.two ? 'look' : t < 12.85 ? 'meh' : 'sad'; g.look = t < T.two ? [0.9, -0.7] : [0, 0.4];
    return g;
  }
  if (t < S8) {                                  // no phone: it bounces off his wing and cracks
    const up = eio(seg(t, S7, S7 + 0.22)), dip = hit(t, BOUNCE, 1, 8) * Math.cos((t - BOUNCE) * 26);
    g.wr = addF(lerpWP(REST, TRAMP, up), 12 * dip);
    g.mood = t < BOUNCE ? 'focus' : t < CRACK ? 'shock' : 'oops';
    g.look = t < BOUNCE ? [0.9, -0.9] : t < CRACK ? [-0.8, 0.2] : [-0.9, 0.9];
    return g;
  }
  if (t < S9) {                                  // no pizza: it lands on his face
    const up = eio(seg(t, 14.58, 14.8)), down = eio(seg(t, 15.0, 15.3));
    g.wl = g.wr = lerpWP(lerpWP(REST, CATCH, up), REST, down);
    const jolt = hit(t, SPLAT, 1, 8);
    g.hdy = 8 * jolt; g.hr = 4 * jolt;
    g.mood = t < SPLAT ? 'gape' : t < 15.14 ? 'oof' : 'meh'; g.look = t < SPLAT ? [-0.7, -0.8] : [0, 0.3];
    return g;
  }
  if (t < S10) {                                 // no high fives: his wing swats the bat round the branch
    const up = eio(seg(t, 15.62, WHAP)), down = eio(seg(t, 16.05, 16.3));
    g.wr = lerpWP(lerpWP(REST, SWAT, up), REST, down);
    g.mood = t < 15.6 ? 'joy' : t < WHAP ? 'focus' : 'oops'; g.look = t < WHAP ? [0.8, -1] : [0.9, -0.9];
    return g;
  }
  // he does it all with his feet: sits, texts with his toes; then flaps off (= frame 0)
  if (t < LIFT) {
    g.legs = 'sit'; g.phone = true; g.type = t > 16.85 && t < 17.95 ? 1 : 0;
    g.wl = g.wr = SITW; g.mood = 'happy'; g.look = [0, 1];
    const pre = seg(t, LIFT - 0.1, LIFT);
    g.sy = 1 - 0.07 * pre; g.sx = 1 + 0.04 * pre;
    return g;
  }
  const u = t - LIFT;
  g.legs = 'dangle'; g.y = -150 * eio(seg(t, LIFT, DURATION)) + bobY(u) - 9;
  g.wl = g.wr = lerpWP(SITW, flyWP(u), eout(seg(t, LIFT, LIFT + 0.12)));
  g.sy = 1 + spring(t, LIFT, 0.06, 3, 6); g.mood = 'joy'; g.look = [0.7, -0.5];
  return g;
};
const batAt = (t: number): BatS => {
  const b: BatS = {mood: 'smug', spin: 0, openR: 0, reach: 0};
  if (t > 2.0 && t < 3.3) b.mood = t < 2.3 ? 'grin' : 'laugh';
  if (t >= S4 && t < S5) { b.openR = seg(t, 3.42, 3.66) * (1 - seg(t, 7.1, 7.28)); b.mood = t < 3.9 ? 'grin' : 'smug'; }
  if (t > SMACK && t < 8.9) b.mood = 'laugh';
  if (t > CRACK - 0.05 && t < 14.44) b.mood = 'grin';
  if (t > SPLAT && t < 15.36) b.mood = 'laugh';
  if (t >= S9 && t < S10) {
    b.reach = eio(seg(t, 15.4, 15.62)) * (1 - eio(seg(t, WHAP + 0.05, WHAP + 0.3)));
    b.mood = t < WHAP ? 'grin' : 'wow';
    b.spin = 360 * eout(seg(t, WHAP, WHAP + 0.5));
  }
  if (t >= S10) { b.mood = t < 16.9 ? 'dizzy' : t < 18.0 ? 'smug' : 'grin'; }
  return b;
};

// phone and pizza flights
const phoneAt = (t: number) => {
  if (t < BOUNCE) { const tau = t - S7 - 0.03; return {x: lerp(250, GX + 120, seg(t, S7 + 0.03, BOUNCE)), y: -540 + 511 * tau + 2400 * tau * tau, a: 400 * tau}; }
  if (t < CRACK) { const tau = t - BOUNCE; return {x: GX + 120 - 391 * tau, y: -170 - 734 * tau + 2400 * tau * tau, a: 120 - 900 * tau}; }
  return {x: GX + 120 - 391 * (CRACK - BOUNCE), y: -26, a: 90};
};
const pizzaAt = (t: number) => {
  if (t < SPLAT) { const u = seg(t, S8 + 0.06, SPLAT); return {x: lerp(-330, GX, u), y: lerp(-560, -246, u) - 160 * Math.sin(Math.PI * u), a: lerp(-120, 0, u), on: u > 0}; }
  if (t < 15.12) return {x: GX + 2, y: -240, a: 0, on: true};
  const u = seg(t, 15.12, 15.36);
  return {x: GX + 6, y: -240 + 80 * u + 260 * u * u, a: 14 * u, on: u < 1};
};

export const BatScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const keys: Key[] = [
    {t: 0, x: 40, y: -410, k: 2.75}, {t: S2 - 0.001, x: 40, y: -420, k: 2.85},              // frame 0: he flies, the bat hangs beside him
    {t: S2, x: 55, y: -470, k: 2.3}, {t: 1.95, x: 45, y: -530, k: 2.55}, {t: S3 - 0.001, x: 40, y: -520, k: 2.62},  // up to the branch: SLAP, no grip, drop
    {t: S3, x: GX, y: -214, k: 3.6}, {t: S4 - 0.001, x: GX, y: -214, k: 3.75},               // THUD close-up
    {t: S4, x: BAT_X + 10, y: -330, k: 2.7}, {t: S5 - 0.001, x: BAT_X + 10, y: -330, k: 2.8}, // the bat opens its wing, X-RAY
    {t: S5, x: GX - 20, y: -255, k: 3.05}, {t: X2_IN, x: GX - 20, y: -255, k: 3.2},          // the thumb, the slap
    {t: X2_IN + 0.001, x: GX - 30, y: -250, k: 2.6}, {t: S6 - 0.001, x: GX - 30, y: -250, k: 2.68},  // behind YOUR HAND
    {t: S6, x: 30, y: -330, k: 2.3}, {t: S7 - 0.001, x: 30, y: -330, k: 2.4},                // two thumbs left, counter
    {t: S7, x: 40, y: -290, k: 2.75}, {t: S8 - 0.001, x: 40, y: -280, k: 2.85},              // phone
    {t: S8, x: GX, y: -250, k: 3.35}, {t: S9 - 0.001, x: GX, y: -250, k: 3.5},               // pizza
    {t: S9, x: 70, y: -400, k: 2.3}, {t: S10 - 0.001, x: 70, y: -405, k: 2.38},              // high five
    {t: S10, x: 40, y: -330, k: 2.2}, {t: LIFT, x: 40, y: -334, k: 2.26},                     // texting with his feet
    {t: DURATION, x: 40, y: -390, k: 2.3},
  ];
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt(keys, t);
  const sh = shake(t, hit(t, 0, 5, 7) + hit(t, SLAP, 5, 7) + hit(t, LAND, 12, 6) + hit(t, SMACK, 8, 6) + hit(t, CRACK, 6, 7) + hit(t, SPLAT, 7, 7) + hit(t, WHAP, 7, 6));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t), b = batAt(t);
  const ph = phoneAt(t), pz = pizzaAt(t);
  const x1S = popIn(t, X1_IN, 0.35) * (1 - seg(t, X1_OUT - 0.12, X1_OUT));
  const x2S = popIn(t, X2_IN, 0.35) * (1 - seg(t, X2_OUT - 0.12, X2_OUT));
  const cntS = popIn(t, 11.5, 0.3) * (1 - seg(t, S7 - 0.14, S7 - 0.02));
  // stickers (each ends before its cut)
  const noGrip = pulse(t, SLAP + 0.02, 0.3), thud = pulse(t, LAND, 0.4), noHands = popIn(t, 2.86, 0.3) * (1 - seg(t, 3.18, 3.36));
  const thumbS = pulse(t, T.thumb, 0.3), slapS = pulse(t, SMACK, 0.32);
  const boing = pulse(t, BOUNCE, 0.3), crack = popIn(t, CRACK, 0.25) * (1 - seg(t, 14.3, 14.42));
  const splat = popIn(t, SPLAT, 0.25) * (1 - seg(t, 15.2, 15.34)), whap = popIn(t, WHAP, 0.25) * (1 - seg(t, 16.22, 16.36));
  const toes = popIn(t, 17.0, 0.3) * (1 - seg(t, 18.05, 18.2));
  const stars = (t > LAND && t < 3.3) || (t > SMACK && t < 8.75) ? 1 : 0;
  const hx = g.x + g.hdx, hy = g.y - 235 * g.sy + g.hdy;
  const batStars = t > WHAP + 0.4 && t < 16.95 ? 1 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <W><defs>
        <radialGradient id={`bwFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
        <radialGradient id={`bwFur${uid}`} cx="0.35" cy="0.3" r="0.85"><stop offset="0" stopColor="#A794C4" /><stop offset="1" stopColor={FUR2} /></radialGradient>
      </defs></W>
      <Sky />
      <Layer cam={cam} z={2600} paper={false}><Moon /></Layer>
      <Layer cam={cam} z={1700}><Hills /></Layer>
      <Layer cam={cam} z={1000}>
        <Ground />
        <Tree t={t} />
        <Bat t={t} b={b} uid={uid} />
        <GuyBW t={t} g={g} uid={uid} />
        {t >= SLAP + 0.02 && t < LETGO - 0.04 ? <BranchFront /> : null}
        {t >= S7 && t < S8 + 0.001 ? <W><g transform={`translate(${ph.x} ${ph.y}) rotate(${ph.a})`}><Phone cracked={t >= CRACK} lit={t < CRACK} /></g></W> : null}
        {t >= S10 - 0.001 && t >= LIFT ? <W><g transform={`translate(${GX} ${Math.min(-30, -120 + 0.5 * 3000 * (t - LIFT) * (t - LIFT))})`}><Phone cracked /></g></W> : null}
        {t >= S8 && t < S9 && pz.on ? <W><g transform={`translate(${pz.x} ${pz.y}) rotate(${pz.a})`}><Pizza /></g></W> : null}
        {t > LAND && t < S4 ? <Puffs t={t} born={LAND} x={GX} y={-6} n={7} life={0.6} size={22} vx={0} vy={-40} color="#EDE6D8" seed={3} /> : null}
      </Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={hx + Math.cos(a) * 92} y={hy - 92 + Math.sin(a) * 16} s={stars * 0.5} rot={t * 200} />;
        })}
        {[0, 1, 2].map((i) => {
          const a = t * 7 + (i * 2 * Math.PI) / 3;
          return <Star key={'b' + i} x={BAT_X + Math.cos(a) * 64} y={BAT_Y + 120 + Math.sin(a) * 12} s={batStars * 0.36} rot={t * 220} />;
        })}
        {thumb ? null : <>
          <Txt x={GX + 60} y={-730} s={noGrip} text="NO GRIP" size={60} rot={-6} fill={RED} />
          <Txt x={GX + 60} y={-330} s={thud} text="THUD" size={50} rot={8} fill={GOLD} />
          <Txt x={GX + 10} y={-86} s={noHands} text="NO HANDS" size={40} rot={-5} fill={RED} />
          <Txt x={GX + 80} y={-340} s={thumbS} text="THUMB" size={44} rot={-8} fill={GOLD} />
          <Arrow x={GX + 76} y={-292} s={thumbS * 0.5} color={GOLD} />
          <Txt x={GX - 60} y={-350} s={slapS} text="SLAP" size={56} rot={-10} fill="#FFFFFF" />
          <Txt x={GX + 160} y={-320} s={boing} text="BOING" size={50} rot={6} fill="#FFFFFF" />
          <Txt x={GX - 30} y={-80} s={crack} text="CRACK" size={52} rot={-6} fill={RED} />
          <Txt x={GX + 60} y={-360} s={splat} text="SPLAT" size={50} rot={8} fill={RED} />
          <Txt x={20} y={-480} s={whap} text="WHAP" size={56} rot={-8} fill="#FFFFFF" />
          <Txt x={GX + 185} y={-175} s={toes} text="TOE TYPING" size={38} rot={-5} fill={GOLD} />
        </>}
      </Layer>
      <BatXRay t={t} s={x1S} uid={uid} />
      <HandXRay t={t} s={x2S} uid={uid} />
      {thumb ? null : <>
        <Counter t={t} s={cntS} />
        <CommentBubble t={t} text="what if you had a bat's wings??" handle="@moonlit_doodle" likes="3.4K" y={300} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.now - 0.04} until={DURATION - LOOP_DUR - 0.4} text="Would you trade your hands to fly?" />
      </>}
    </AbsoluteFill>
  );
};

export const BatWingsVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -24): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -18 : db}));
  const flaps = (a: number, b: number, db: number, t0 = 0): Cue[] => {
    const out: Cue[] = [];
    for (let k = Math.ceil((a - t0) * FLAP_HZ); t0 + k / FLAP_HZ < b; k++) out.push({f: 'flap.wav', at: t0 + k / FLAP_HZ + 0.02, db});
    return out;
  };
  const night: Cue[] = Array.from({length: 10}, (_, i) => ({f: 'crickets.mp3', at: i * 1.9, db: -37, to: Math.min(2.0, DURATION - i * 1.9)}));
  const cues: Cue[] = [
    ...night,
    // frame 0: flying - a big flap and a whoosh
    {f: 'flap.wav', at: 0, db: -8}, {f: 'whoosh.wav', at: 0, db: -13}, ...flaps(0.3, 1.8, -17),
    // up to the branch: SLAP, nothing to grip, he drops
    {f: 'whoosh.wav', at: S2 - 0.02, db: -28}, {f: 'slap.wav', at: SLAP, db: -11}, {f: 'squeak.wav', at: 2.06, db: -23}, {f: 'squeak.wav', at: 2.2, db: -21},
    {f: 'whoosh.wav', at: LETGO - 0.02, db: -20},
    // THUD
    {f: 'thud.wav', at: LAND, db: -5}, {f: 'bonk.wav', at: LAND, db: -15}, {f: 'crowd_laugh.wav', at: 2.75, db: -31, to: 0.75},
    {f: 'pop.wav', at: 2.86, db: -24},
    // the bat shows its wing: X-RAY
    {f: 'whoosh.wav', at: S4 - 0.03, db: -28}, {f: 'flap.wav', at: 3.44, db: -16}, {f: 'zap.wav', at: X1_IN, db: -26}, {f: 'pop.wav', at: 3.72, db: -21},
    ...CNT1.map((at, i): Cue => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at, db: i === 3 ? -16 : -20})), {f: 'ding.mp3', at: T.fingers, db: -22},
    {f: 'stretch.wav', at: 5.68, db: -19, to: 0.9}, {f: 'pop.wav', at: T.skin + 0.02, db: -23}, {f: 'pop.wav', at: 6.6, db: -26},
    // the thumb: SLAP
    {f: 'whoosh.wav', at: S5 - 0.03, db: -28}, {f: 'squeak.wav', at: T.thumb, db: -22}, {f: 'whoosh.wav', at: 7.94, db: -22},
    {f: 'slap.wav', at: SMACK, db: -6}, {f: 'twang.mp3', at: SMACK + 0.03, db: -22, to: 0.5}, {f: 'crowd_laugh.wav', at: SMACK + 0.1, db: -26, to: 1.2},
    {f: 'giggle.mp3', at: 8.42, db: -31, to: 0.6},
    // X-RAY: your hand
    {f: 'zap.wav', at: X2_IN, db: -26}, {f: 'whoosh.wav', at: 8.8, db: -29}, {f: 'pop.wav', at: 8.86, db: -23},
    ...CNT2.map((at, i): Cue => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at, db: -21})), {f: 'ding.mp3', at: T.bones, db: -22},
    {f: 'stretch.wav', at: 10.66, db: -17, to: 0.7}, {f: 'pop.wav', at: 11.12, db: -20},
    // two thumbs left: FREE FINGERS 10 -> 2
    {f: 'whoosh.wav', at: S6 - 0.03, db: -28}, ...ticks(11.62, T.two, 8), {f: 'ding.mp3', at: T.two + 0.01, db: -19}, {f: 'pop.wav', at: 12.86, db: -25},
    ...ctaCues(T.cta),
    // no phone
    {f: 'whoosh.wav', at: S7 - 0.03, db: -28}, {f: 'whoosh.wav', at: 13.58, db: -27}, {f: 'twang.mp3', at: BOUNCE, db: -15, to: 0.45},
    {f: 'crack.wav', at: CRACK - 0.31, db: -11},
    // no pizza
    {f: 'whoosh.wav', at: S8 - 0.03, db: -28}, {f: 'whoosh.wav', at: 14.52, db: -26}, {f: 'squelch.wav', at: SPLAT, db: -8},
    {f: 'crowd_laugh.wav', at: SPLAT + 0.12, db: -29, to: 0.8},
    // no high fives
    {f: 'whoosh.wav', at: S9 - 0.03, db: -28}, {f: 'squeak.wav', at: 15.44, db: -27}, {f: 'whoosh.wav', at: 15.66, db: -24},
    {f: 'slap.wav', at: WHAP, db: -7}, {f: 'whir.mp3', at: WHAP + 0.02, db: -27, to: 0.5}, {f: 'crowd_laugh.wav', at: WHAP + 0.12, db: -25, to: 1.3},
    // texting with his feet, then flap off into frame 0
    {f: 'whoosh.wav', at: S10 - 0.03, db: -28}, ...Array.from({length: 7}, (_, i): Cue => ({f: 'click.wav', at: 16.9 + i * 0.156, db: -25})),
    {f: 'pop.wav', at: 17.0, db: -26}, {f: 'ding.mp3', at: 17.98, db: -27},
    {f: 'flap.wav', at: LIFT, db: -12}, {f: 'flap.wav', at: LIFT + 1 / FLAP_HZ, db: -15},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -22},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<BatScene t={0} uid="s" />}>
        <BatScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="batwings/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const BatWingsWide: React.FC = () => <WideFit.Provider value={0.72}><BatWingsVideo /></WideFit.Provider>;
