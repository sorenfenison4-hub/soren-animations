// "What if you had a polar bear's fur?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// (1) frame 0: a blizzard; he stands big in thick polar-bear fur beside a smug polar bear, a snowball WHUMPs into his
//     chest and he doesn't even blink (NOT COLD); (2) "one jog": he jogs toward the camera, steam starts to rise;
// (3) close-up (2.2 s): his face goes red, steam blasts out of his fur with a kettle whistle - COOKED - he keels over;
// (4) X-RAY: POLAR BEAR FUR - clear hollow hairs (a light ray scatters off one: CLEAR; zoom: HOLLOW), the skin turns black
//     (BLACK SKIN), fat grows under it (0 -> 10 CM), heat arrows bounce back in (TRAPS HEAT);
// (5) the bear on a treadmill in the snow: SPEED bars up, BEAR TEMP up, it goes red and pants (EVEN THE BEAR, TOO HOT)
//     and the belt flings it off into a snowbank (comedy hit); (6) YOUR BODY 37 -> 40 C (104 F): HEAT STROKE;
// (7) "So he never runs": he just stands there while snowballs WHUMP into him = frame 0.
// All drawn in code; the guy is the code-drawn front view on the small IK rig (beetle / fly / lizard / butterfly), furred.
// For this video only (the user, 2026-11-22): a fixed "Subscribe to @Koolkid7898pogo" box at the top (SubscribeBox).
import React from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, spring, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Puffs, Sweat} from './lib/kit';

// voice: tight.mp3 at 0.1 s (line 1 tightened at 1.22, the rest at 1.12; times are video time). Speech ends 15.72 s.
export const DURATION = 16.6;
export const T = {
  get: 0.10, fur: 1.02, and: 1.43, one: 1.69, jog: 1.95, cook: 2.41, you: 2.67,                       // "Get a polar bear's fur, and one jog would cook you."
  its: 3.09, hairs: 3.24, clear: 3.88, hollow: 4.24, tubes: 4.59, black: 5.27, skin: 5.63,             // "Its hairs are clear, hollow tubes over black skin,"
  fat: 6.49, ten: 7.17, cm: 7.42, thick: 8.06, under: 8.41,                                            // "with fat up to ten centimeters thick underneath."
  traps: 9.18, heat: 10.11, even: 10.72, bear: 11.33, overheats: 11.61, walks: 12.33, fast: 12.61,     // "It traps so much heat that even a polar bear overheats if it walks fast."
  youd: 13.24, heat2: 13.59, stroke: 13.88,                                                            // "You'd get heat stroke."
  so: 14.56, never: 15.20, runs: 15.38,                                                                // "So he never runs."
  cta: 10.0,
};
// beats (shot changes are hard cuts)
const S2 = 1.42;                                         // he jogs toward the camera
const S3 = 2.18, RED0 = 2.2, BLAST = 2.32, FALL = 2.8;   // close-up: red face, steam blast, he keels over
const S4 = 3.05, HAIR0 = 3.18, HAIR1 = 3.6, RAY0 = 3.74, RAY1 = 4.1, Z0 = 4.2, Z1 = 5.05, BLK0 = 5.2, BLK1 = 5.55;
const FAT0 = 6.42, FAT1 = 7.45, CM0 = 6.75, ARR0 = 8.45;  // X-RAY: hairs, light, hollow, black skin, fat, heat bounces back
const S5 = 10.0, S5B = 11.3, S5C = 12.5, FLING = 12.62, LANDB = 12.9;   // the bear on the treadmill, close on its face, the fling
const S6 = 13.05, TH0 = 13.28, TH1 = 13.85;              // YOUR BODY 37 -> 40 C
const S7 = 14.45;                                        // so he never runs
const PUSH = DURATION - LOOP_DUR;
const HITS = [0, 14.86, 15.42];                          // snowballs that WHUMP into his chest (0 = frame 0)
const THROW_T = 0.36;                                    // flight time of a snowball

const GOLD = '#FFD43B', RED = '#E2453C', FACE_C = '#F1EFEA';
const FUR = '#FFF3D9', FUR_SH = '#E6D2A6', FUR_LT = '#FFFBEF';
const BEAR = '#FFF1CF', BEAR_SH = '#E8D1A0', BEAR_LT = '#FFFAEA', NOSE = '#1E1E1E';
const SNOW = '#FFFFFF', SNOW_SH = '#D2E2F0', SNOW_DK = '#B5CBE0', ICE = '#CFE3F3', SKY = '#DCE8F1';
const HOT = '#FF6B5B';
const FONT_W = 900;
const BEAR_X = 168, BEAR_S = 0.88;      // the bear beside him (behind his right side)
const TM_X = 1500, TM_Y = -92;          // the treadmill (its belt) in the snow, far to the right
const BANK_X = TM_X + 90;               // the snowbank behind the treadmill

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const quad = (a: P2, c: P2, b: P2, u: number): P2 => [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]];
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={FONT_W} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${(ex - w).toFixed(1)} ${y.toFixed(1)} A ${rx} ${ry} 0 ${h > 0.5 ? 1 : 0} 1 ${(ex + w).toFixed(1)} ${y.toFixed(1)} Z`;
};
/** two-segment IK: the joint between A and F; bend = +1 / -1 picks the side */
const ik = (A: P2, F: P2, L1: number, L2: number, bend: number): P2 => {
  const dx = F[0] - A[0], dy = F[1] - A[1], D = Math.hypot(dx, dy) || 1;
  const d = Math.min(D, L1 + L2 - 0.01);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / D, uy = dy / D;
  return [A[0] + ux * a - uy * h * bend, A[1] + uy * a + ux * h * bend];
};
/** closed polygon (clockwise on screen) -> outline of outward bumps: the fur edge */
const scallop = (pts: P2[], bulge: number) => {
  let d = `M ${P(pts[0])}`;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    d += ` Q ${P([(a[0] + b[0]) / 2 + (-dy / L) * -bulge, (a[1] + b[1]) / 2 + (dx / L) * -bulge])} ${P(b)}`;
  }
  return d + ' Z';
};
/** superellipse points, clockwise from the top */
const blob = (cx: number, cy: number, a: number, b: number, n: number, e = 2.6): P2[] => Array.from({length: n}, (_, i) => {
  const th = -Math.PI / 2 + (2 * Math.PI * i) / n, c = Math.cos(th), s = Math.sin(th);
  return [cx + a * Math.sign(c) * Math.pow(Math.abs(c), 2 / e), cy + b * Math.sign(s) * Math.pow(Math.abs(s), 2 / e)];
});
/** a furry limb: a row of puffs with one merged outline (all ink circles first, then the fills) */
const puffRow = (S: P2, C: P2, H: P2, n: number, r0: number, r1: number) => Array.from({length: n}, (_, i) => {
  const u = i / (n - 1); const p = quad(S, C, H, u); return {p, r: lerp(r0, r1, u)};
});
const limbCtl = (S: P2, H: P2, L: number, sd: number): P2 => {
  const E = ik(S, H, L, L, sd);
  return [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2];
};
const PuffInk: React.FC<{row: {p: P2; r: number}[]; w?: number}> = ({row, w = 5.5}) => <>{row.map((c, i) => <circle key={i} cx={c.p[0]} cy={c.p[1]} r={c.r + w} fill={INK} />)}</>;
const PuffFill: React.FC<{row: {p: P2; r: number}[]; fill: string}> = ({row, fill}) => <>{row.map((c, i) => <circle key={i} cx={c.p[0]} cy={c.p[1]} r={c.r} fill={fill} />)}</>;

// ---------- the guy's face (moods from the butterfly, plus spiral eyes and a panting tongue) ----------
type Mood = 'joy' | 'happy' | 'smug' | 'focus' | 'oof' | 'dizzy' | 'pop' | 'worry' | 'deadpan' | 'bliss' | 'hot';
const spiral = (cx: number, cy: number, r: number, a0: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 26; i++) { const u = i / 26, a = a0 + u * Math.PI * 4, rr = r * u; pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`); }
  return 'M ' + pts.join(' L ');
};
const Mouth: React.FC<{mood: Mood; t: number}> = ({mood, t}) => {
  if (mood === 'joy') return <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  if (mood === 'happy' || mood === 'bliss') return <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  if (mood === 'smug') return <path d="M -20 6 Q 0 16 22 -3" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'focus') return <path d="M -15 9 Q 0 5 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'deadpan') return <path d="M -16 8 L 16 8" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'oof') return <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  if (mood === 'hot') {   // panting: open mouth, tongue hanging out and bobbing
    const b = 3 * Math.sin(t * 22);
    return <g><path d="M -24 -2 Q 0 -8 24 -2 Q 20 22 0 24 Q -20 22 -24 -2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M -13 10 Q -14 ${36 + b} 0 ${38 + b} Q 14 ${36 + b} 13 10 Z`} fill="#F07A8C" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <path d={`M 0 14 L 0 ${30 + b}`} stroke="#C9566A" strokeWidth={3} strokeLinecap="round" /></g>;
  }
  if (mood === 'worry' || mood === 'dizzy') return <path d="M -18 10 q 6 -6 12 0 t 12 0 t 12 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  return <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;   // pop
};
const Face: React.FC<{t: number; mood: Mood; uid: string; look?: number; lookY?: number; heat?: number}> = ({t, mood, uid, look = 0, lookY = 0, heat = 0}) => {
  const eye = (sd: number) => {
    const ex = sd * 25, ey = -14;
    if (mood === 'joy' || mood === 'happy' || mood === 'bliss') return <path key={sd} d={`M ${ex - 13} ${ey + 4} Q ${ex} ${ey - 12} ${ex + 13} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'oof' || mood === 'hot') return <path key={sd} d={`M ${ex - sd * 12} ${ey - 10} L ${ex + sd * 10} ${ey} L ${ex - sd * 12} ${ey + 10}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === 'dizzy') return <g key={sd}><ellipse cx={ex} cy={ey} rx={13} ry={15} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <path d={spiral(ex, ey, 10, t * 9 * sd)} stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" /></g>;
    const big = mood === 'pop' ? 1.25 : 1;
    const lid = mood === 'smug' ? 0.45 : mood === 'focus' ? 0.38 : mood === 'deadpan' ? 0.52 : 0;
    const rx = 12 * big, ry = 15 * big;
    const px = look * 4, py = lookY * 4;
    return <g key={sd}>
      <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + px} cy={ey + 1 + lid * 6 + py} r={6.3 * (big > 1 ? 0.85 : 1)} fill={INK} />
      <circle cx={ex + px - 1.5} cy={ey - 1 + lid * 6 + py} r={2} fill="#fff" />
      {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
    </g>;
  };
  const brow = (sd: number) => {
    let d = `M ${sd * 12} -45 Q ${sd * 25} -53 ${sd * 38} -47`;
    if (mood === 'focus' || mood === 'oof' || mood === 'hot') d = `M ${sd * 10} -34 L ${sd * 37} -44`;
    else if (mood === 'worry' || mood === 'dizzy') d = `M ${sd * 10} -46 L ${sd * 36} -38`;
    else if (mood === 'smug') d = `M ${sd * 12} ${sd < 0 ? -40 : -46} L ${sd * 38} ${sd < 0 ? -44 : -50}`;
    else if (mood === 'pop') d = `M ${sd * 12} -52 Q ${sd * 25} -62 ${sd * 38} -54`;
    else if (mood === 'deadpan') d = `M ${sd * 12} -38 L ${sd * 38} -38`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  return (
    <g>
      <circle r={HEAD_R + 1} fill={`url(#pFace${uid})`} />
      {heat > 0.01 ? <g><clipPath id={`ph${uid}`}><circle r={HEAD_R} /></clipPath>
        <rect x={-HEAD_R - 2} y={HEAD_R - 2 * HEAD_R * Math.min(1, heat * 1.08)} width={2 * HEAD_R + 4} height={2 * HEAD_R + 4} fill={HOT} opacity={0.8} clipPath={`url(#ph${uid})`} /></g> : null}
      <circle r={HEAD_R + 1} fill="none" stroke={INK} strokeWidth={6.5} />
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)"><Mouth mood={mood} t={t} /></g>
      {heat > 0.5 ? [-1, 1].map((sd) => <path key={'h' + sd} d={`M ${sd * 38} 12 l ${sd * 10} -6 M ${sd * 34} 22 l ${sd * 12} -4`} stroke="#B8332A" strokeWidth={3.5} strokeLinecap="round" opacity={(heat - 0.5) * 2} />) : null}
    </g>
  );
};

// ---------- the guy in polar-bear fur: front view on the small IK rig (feet at 0) ----------
type GF = {x: number; y: number; rot: number; lean: number; armA: P2; armB: P2; footA: P2; footB: P2; mood: Mood; look: number; lookY: number;
  heat: number; sq: number; tilt: number; trem: number; hide: number; glow: number};
const SHX = 44, HIP = 70;
const TORSO_PTS = blob(0, -118, 62, 74, 28);
const TORSO_D = scallop(TORSO_PTS, 7);
const RUFF = Array.from({length: 15}, (_, i) => { const a = (2 * Math.PI * i) / 15 - Math.PI / 2; return {p: [Math.cos(a) * (HEAD_R + 9), Math.sin(a) * (HEAD_R + 9)] as P2, r: 21 + 3 * Math.cos(a * 2)}; });
const headWorld = (g: GF): P2 => [g.x, g.y - HIP - 165];
const chestWorld = (g: GF): P2 => [g.x + 8, g.y - HIP - 84];
const GuyF: React.FC<{t: number; g: GF; uid: string}> = ({t, g, uid}) => {
  if (g.hide >= 1) return null;
  const hipY = -HIP, shY = hipY - 92, headY = hipY - 165;
  const jig = g.trem * 2.4 * Math.sin(t * 71);
  const SA: P2 = [-SHX, shY], SB: P2 = [SHX, shY];
  const HA = add(SA, g.armA), HB = add(SB, g.armB);
  const legs = [g.footA, g.footB].map((f, i) => { const S: P2 = [(i ? 1 : -1) * 22, hipY + 4]; return puffRow(S, limbCtl(S, f, 37, i ? -1 : 1), f, 5, 21, 19); });
  const arms = [[SA, HA, 1], [SB, HB, -1]].map(([S, H, sd]) => { const s = S as P2, h = H as P2; return puffRow(s, limbCtl(s, h, 76, (sd as number) * (h[1] > s[1] ? 1 : -1)), h, 7, 20, 14); });
  const headT = `translate(0 ${headY.toFixed(1)}) rotate(${g.tilt.toFixed(2)}) scale(${(1 + 0.12 * g.sq).toFixed(3)} ${(1 - 0.2 * g.sq).toFixed(3)})`;
  return (
    <W><g transform={`translate(${(g.x + jig).toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)})`}>
      {g.glow > 0.01 ? <circle cx={0} cy={-150} r={190} fill={HOT} opacity={0.22 * g.glow} /> : null}
      {legs.map((row, i) => <PuffInk key={'li' + i} row={row} />)}
      {legs.map((row, i) => <PuffFill key={'lf' + i} row={row} fill={FUR} />)}
      {[g.footA, g.footB].map((f, i) => <g key={'f' + i}>
        <ellipse cx={f[0] + (i ? 4 : -4)} cy={f[1] + 6} rx={27} ry={12} fill={FUR} stroke={INK} strokeWidth={5.5} />
        <path d={`M ${f[0] + (i ? 4 : -4) - 9} ${f[1] + 12} v -6 M ${f[0] + (i ? 4 : -4) + 2} ${f[1] + 13} v -6 M ${f[0] + (i ? 4 : -4) + 13} ${f[1] + 12} v -6`} stroke={INK} strokeWidth={3} strokeLinecap="round" />
      </g>)}
      <g transform={`rotate(${g.lean.toFixed(2)} 0 ${hipY})`}>
        <path d={TORSO_D} fill={FUR} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 24 -168 Q 52 -130 40 -66" stroke={FUR_SH} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.7} />
        {[[-26, -140], [10, -112], [-14, -86], [28, -150], [-36, -104]].map(([x, y], i) => <path key={i} d={`M ${x - 8} ${y} q 8 -10 16 0`} stroke={FUR_SH} strokeWidth={4} fill="none" strokeLinecap="round" />)}
        {arms.map((row, i) => <PuffInk key={'ai' + i} row={row} />)}
        {arms.map((row, i) => <PuffFill key={'af' + i} row={row} fill={FUR} />)}
        {[HA, HB].map((h, i) => <g key={'h' + i}><circle cx={h[0]} cy={h[1]} r={19} fill={FUR_LT} stroke={INK} strokeWidth={5.5} />
          <path d={`M ${h[0] - 8} ${h[1] + 9} v 6 M ${h[0]} ${h[1] + 11} v 6 M ${h[0] + 8} ${h[1] + 9} v 6`} stroke={INK} strokeWidth={3} strokeLinecap="round" /></g>)}
        <g transform={headT}>
          {RUFF.map((c, i) => <circle key={'ri' + i} cx={c.p[0]} cy={c.p[1]} r={c.r + 5.5} fill={INK} />)}
          {RUFF.map((c, i) => <circle key={'rf' + i} cx={c.p[0]} cy={c.p[1]} r={c.r} fill={FUR} />)}
          <Face t={t} mood={g.mood} uid={uid} look={g.look} lookY={g.lookY} heat={g.heat} />
        </g>
      </g>
    </g></W>
  );
};

// ---------- the polar bear: front view, standing, feet at 0 ----------
type BMood = 'smug' | 'look' | 'laugh' | 'focus' | 'hot' | 'pop' | 'deadpan';
type BS = {x: number; y: number; s: number; mood: BMood; pawL: P2; pawR: P2; heat: number; tilt: number; walk: number; ph: number; rot: number;
  lookX: number; lookY: number; shake: number; sq: number; hide: number};
const BODY_D = 'M -92 -40 C -152 -100 -148 -252 -98 -320 C -66 -358 66 -358 98 -320 C 148 -252 152 -100 92 -40 Q 0 -8 -92 -40 Z';
const HEAD_D = 'M -84 -394 C -86 -456 -42 -482 0 -482 C 42 -482 86 -456 84 -394 C 82 -342 46 -314 0 -314 C -46 -314 -82 -342 -84 -394 Z';
const bearHead = (B: BS): P2 => [B.x, B.y - 396 * B.s];
const PolarBear: React.FC<{t: number; B: BS; uid: string}> = ({t, B, uid}) => {
  if (B.hide >= 1) return null;
  const jig = B.shake * 3 * Math.sin(t * 60);
  const sL = Math.sin(B.ph), bob = -7 * B.walk * Math.abs(sL);
  const feet: P2[] = [[-54, -12 - 30 * B.walk * Math.max(0, sL)], [54, -12 - 30 * B.walk * Math.max(0, -sL)]];
  const legs = feet.map((f, i) => puffRow([(i ? 1 : -1) * 50, -70 + bob], [(i ? 1 : -1) * 56, -40], f, 4, 36, 32));
  const SL: P2 = [-94, -292 + bob], SR: P2 = [94, -292 + bob];
  const arms = [[SL, B.pawL, 1], [SR, B.pawR, -1]].map(([S, H, sd]) => { const s = S as P2, h = add(H as P2, [0, bob]); return puffRow(s, limbCtl(s, h, 92, (sd as number)), h, 6, 33, 29); });
  const eyes = (sd: number) => {
    const cx = sd * 31 + B.lookX * 3, cy = -414 + B.lookY * 3;
    if (B.mood === 'laugh') return <path key={sd} d={`M ${cx - 11} ${cy + 4} Q ${cx} ${cy - 9} ${cx + 11} ${cy + 4}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />;
    if (B.mood === 'hot') return <path key={sd} d={`M ${cx - sd * 11} ${cy - 9} L ${cx + sd * 9} ${cy} L ${cx - sd * 11} ${cy + 9}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (B.mood === 'pop') return <g key={sd}><ellipse cx={cx} cy={cy} rx={14} ry={16} fill="#FFFFFF" stroke={INK} strokeWidth={5} /><circle cx={cx} cy={cy + 2} r={6.5} fill={INK} /></g>;
    const lid = B.mood === 'smug' ? 0.5 : B.mood === 'focus' ? 0.4 : B.mood === 'deadpan' ? 0.55 : 0;
    return <g key={sd}>
      <ellipse cx={cx} cy={cy} rx={10} ry={12} fill={INK} />
      <circle cx={cx - 3} cy={cy - 4} r={3.2} fill="#FFFFFF" />
      {lid ? <path d={lidPath(cx, cy, 11.5, 13.5, lid)} fill={BEAR} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}
    </g>;
  };
  const brows = B.mood === 'smug' ? 'M -46 -438 L -18 -432 M 18 -436 L 46 -446' : B.mood === 'focus' || B.mood === 'hot' ? 'M -46 -440 L -18 -430 M 18 -430 L 46 -440'
    : B.mood === 'pop' ? 'M -46 -448 Q -32 -456 -18 -448 M 18 -448 Q 32 -456 46 -448' : 'M -46 -440 Q -32 -446 -18 -440 M 18 -440 Q 32 -446 46 -440';
  const tb = 3 * Math.sin(t * 22);
  const mouth = B.mood === 'laugh' ? <g><path d="M -26 -350 Q 0 -358 26 -350 Q 20 -318 0 -316 Q -20 -318 -26 -350 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <ellipse cx={0} cy={-326} rx={12} ry={6} fill="#E4677A" /></g>
    : B.mood === 'hot' ? <g><path d="M -22 -352 Q 0 -358 22 -352 Q 18 -330 0 -328 Q -18 -330 -22 -352 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      <path d={`M -13 -340 Q -15 ${-300 + tb} 0 ${-297 + tb} Q 15 ${-300 + tb} 13 -340 Z`} fill="#F07A8C" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /></g>
    : B.mood === 'pop' ? <ellipse cx={0} cy={-340} rx={12} ry={14} fill="#5A2328" stroke={INK} strokeWidth={5} />
    : B.mood === 'smug' ? <path d="M 0 -364 V -354 M -22 -350 Q -10 -342 0 -354 Q 12 -340 30 -356" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    : B.mood === 'deadpan' ? <path d="M 0 -364 V -354 M -18 -348 L 18 -348" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    : <path d="M 0 -364 V -354 M -18 -350 Q -8 -342 0 -354 Q 8 -342 18 -350" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  return (
    <W><g transform={`translate(${(B.x + jig).toFixed(1)} ${B.y.toFixed(1)}) rotate(${B.rot.toFixed(1)} 0 -200) scale(${(B.s * (1 + 0.1 * B.sq)).toFixed(3)} ${(B.s * (1 - 0.12 * B.sq)).toFixed(3)})`}>
      {legs.map((row, i) => <PuffInk key={'li' + i} row={row} w={6.5} />)}
      {legs.map((row, i) => <PuffFill key={'lf' + i} row={row} fill={BEAR} />)}
      {feet.map((f, i) => <g key={'f' + i}><ellipse cx={f[0] + (i ? 6 : -6)} cy={f[1] + 4} rx={48} ry={20} fill={BEAR} stroke={INK} strokeWidth={6.5} />
        <path d={`M ${f[0] + (i ? 6 : -6) - 18} ${f[1] + 14} v -8 M ${f[0] + (i ? 6 : -6)} ${f[1] + 16} v -8 M ${f[0] + (i ? 6 : -6) + 18} ${f[1] + 14} v -8`} stroke={INK} strokeWidth={4} strokeLinecap="round" /></g>)}
      <g transform={`translate(0 ${bob.toFixed(1)})`}>
        <path d={BODY_D} fill={BEAR} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <ellipse cx={0} cy={-170} rx={74} ry={94} fill={BEAR_LT} />
        <path d="M 70 -300 Q 120 -220 98 -80" stroke={BEAR_SH} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.75} />
        {[[-50, -210], [30, -120], [-20, -90], [52, -230]].map(([x, y], i) => <path key={i} d={`M ${x - 10} ${y} q 10 -12 20 0`} stroke={BEAR_SH} strokeWidth={5} fill="none" strokeLinecap="round" />)}
      </g>
      {arms.map((row, i) => <PuffInk key={'ai' + i} row={row} w={6.5} />)}
      {arms.map((row, i) => <PuffFill key={'af' + i} row={row} fill={BEAR} />)}
      <g transform={`translate(0 ${bob.toFixed(1)}) rotate(${B.tilt.toFixed(1)} 0 -330)`}>
        {[-1, 1].map((sd) => <g key={sd}><circle cx={sd * 60} cy={-458} r={25} fill={BEAR} stroke={INK} strokeWidth={6.5} /><circle cx={sd * 60} cy={-456} r={12} fill={BEAR_SH} /></g>)}
        <path d={HEAD_D} fill={BEAR} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        {B.heat > 0.01 ? <g><clipPath id={`bh${uid}`}><path d={HEAD_D} /></clipPath>
          <rect x={-90} y={-314 - 170 * Math.min(1, B.heat * 1.1)} width={180} height={200} fill={HOT} opacity={0.72} clipPath={`url(#bh${uid})`} />
          <path d={HEAD_D} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" /></g> : null}
        <ellipse cx={0} cy={-360} rx={46} ry={34} fill={BEAR_LT} stroke={INK} strokeWidth={5} />
        <path d="M -18 -384 Q 0 -395 18 -384 Q 15 -367 0 -363 Q -15 -367 -18 -384 Z" fill={NOSE} />
        <ellipse cx={-6} cy={-386} rx={5} ry={2.6} fill="#8A8A8A" />
        {mouth}
        {eyes(-1)}{eyes(1)}
        <path d={brows} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      </g>
    </g></W>
  );
};
/** its legs sticking up out of the snowbank after the fling (feet at the top) */
const BearLegsUp: React.FC<{t: number; x: number; y: number; s: number; kick: number}> = ({t, x, y, s, kick}) => (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    {[-1, 1].map((sd) => { const k = kick * 10 * Math.sin(t * 16 + sd); return <g key={sd} transform={`rotate(${(sd * 12 + k).toFixed(1)} ${sd * 40} 40)`}>
      <path d={`M ${sd * 40 - 30} 50 L ${sd * 40 - 26} -60 Q ${sd * 40} -80 ${sd * 40 + 26} -60 L ${sd * 40 + 30} 50 Z`} fill={BEAR} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <ellipse cx={sd * 40} cy={-66} rx={40} ry={20} fill={BEAR} stroke={INK} strokeWidth={6.5} />
      {[-16, 0, 16].map((dx) => <circle key={dx} cx={sd * 40 + dx} cy={-74} r={6} fill={NOSE} />)}
      <ellipse cx={sd * 40} cy={-60} rx={15} ry={8} fill={NOSE} />
    </g>; })}
  </g></W>
);

// ---------- snow ----------
const Snowball: React.FC<{p: P2; r?: number}> = ({p, r = 24}) => (
  <g transform={`translate(${P(p)})`}>
    <circle r={r} fill={SNOW} stroke={INK} strokeWidth={5.5} />
    <path d={`M ${(-r * 0.25).toFixed(1)} ${(r * 0.7).toFixed(1)} A ${r * 0.74} ${r * 0.74} 0 0 0 ${(r * 0.72).toFixed(1)} ${(-r * 0.12).toFixed(1)}`} stroke={SNOW_SH} strokeWidth={6} fill="none" strokeLinecap="round" />
  </g>
);
const SPLAT: P2[] = Array.from({length: 12}, (_, i) => { const a = (2 * Math.PI * i) / 12; const r = i % 2 ? 22 : 38 + 8 * rnd(i); return [Math.cos(a) * r, Math.sin(a) * r * 0.8]; });
/** a snowball hitting at `at` on p: a white splat that shrinks + chunks thrown out (gravity) */
const SnowBurst: React.FC<{t: number; at: number; p: P2; s?: number}> = ({t, at, p, s = 1}) => {
  const u = t - at;
  if (u < 0 || u > 0.75) return null;
  const k = 1 - eio(seg(u, 0.12, 0.42));
  const chunks = Array.from({length: 10}, (_, i) => {
    const a = -Math.PI * (0.05 + 0.9 * (i / 9)) + (rnd(i + 3) - 0.5) * 0.4, v = 260 + 260 * rnd(i + 7);
    const x = Math.cos(a) * v * u * 0.9 + 60 * u, y = Math.sin(a) * v * u + 900 * u * u, r = (7 + 7 * rnd(i + 1)) * (1 - seg(u, 0.5, 0.75));
    return {x, y, r};
  });
  return <g transform={`translate(${P(p)}) scale(${s})`}>
    {k > 0.02 ? <path d={'M ' + SPLAT.map(([x, y]) => `${(x * (0.7 + 0.5 * k)).toFixed(1)} ${(y * (0.7 + 0.5 * k)).toFixed(1)}`).join(' L ') + ' Z'}
      fill={SNOW} stroke={INK} strokeWidth={5} strokeLinejoin="round" opacity={k} /> : null}
    {u > 0.04 && chunks.map((c, i) => c.r > 0.5 ? <circle key={i} cx={c.x} cy={c.y} r={c.r} fill={SNOW} stroke={INK} strokeWidth={4} /> : null)}
  </g>;
};
/** where a thrown snowball is (it flies in from off-screen right, a flat arc), null if not in the air */
const ballAt = (t: number, hitT: number, target: P2): P2 | null => {
  const u = (t - (hitT - THROW_T)) / THROW_T;
  if (u < 0 || u >= 1) return null;
  const from: P2 = [target[0] + 760, target[1] - 260];
  return [lerp(from[0], target[0], u), lerp(from[1], target[1], u) - 150 * Math.sin(Math.PI * u)];
};
/** falling snow in screen space, blown down-left by the wind */
const Flakes: React.FC<{t: number; n?: number}> = ({t, n = 64}) => {
  const {width, height} = useVideoConfig();
  return <AbsoluteFill style={{pointerEvents: 'none'}}><svg width={width} height={height}>
    {Array.from({length: n}, (_, i) => {
      const sp = 0.6 + rnd(i * 3.1) * 0.8, r = 4 + rnd(i * 5.7) * 7, W2 = width + 260, H2 = height + 200;
      const x = ((((rnd(i) * W2 - t * 300 * sp) % W2) + W2) % W2) - 130;
      const y = ((rnd(i * 1.7) * H2 + t * 430 * sp) % H2) - 100;
      return <circle key={i} cx={x + 14 * Math.sin(t * 2.2 + i)} cy={y} r={r} fill="#FFFFFF" stroke="#93A9BE" strokeWidth={2.2} />;
    })}
  </svg></AbsoluteFill>;
};
const DRIFT = (x0: number, x1: number, y: number, amp: number, len: number, ph: number) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 30) pts.push(`${x} ${(y - amp * Math.abs(Math.sin((x / len) * Math.PI + ph))).toFixed(1)}`);
  return pts;
};

// ---------- the treadmill (front view, the belt at TM_Y) ----------
const Treadmill: React.FC<{belt: number}> = ({belt}) => (
  <g transform={`translate(${TM_X} 0)`}>
    <ellipse cx={0} cy={6} rx={210} ry={22} fill="rgba(60,80,110,0.18)" />
    {[-1, 1].map((sd) => <g key={sd}>
      <path d={`M ${sd * 172} -40 L ${sd * 172} -238 L ${sd * 130} -258`} stroke={INK} strokeWidth={20} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${sd * 172} -40 L ${sd * 172} -238 L ${sd * 130} -258`} stroke="#A9B4BF" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>)}
    <path d="M -172 -46 L 172 -46 L 134 -132 L -134 -132 Z" fill="#2E353C" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {Array.from({length: 6}, (_, k) => {
      const v = (((belt * 0.9 + k / 6) % 1) + 1) % 1, y = lerp(-50, -128, v), hw = lerp(166, 130, v);
      return <path key={k} d={`M ${-hw} ${y.toFixed(1)} H ${hw}`} stroke="#5E6A76" strokeWidth={lerp(5, 2.5, v)} />;
    })}
    <rect x={-182} y={-48} width={364} height={48} rx={12} fill="#5B6673" stroke={INK} strokeWidth={6} />
    <rect x={-150} y={-36} width={60} height={22} rx={6} fill="#47515C" />
  </g>
);
/** a sign on a post: SPEED bars (level 0..5) */
const SpeedSign: React.FC<{x: number; level: number; t: number}> = ({x, level, t}) => (
  <g transform={`translate(${x} -72) scale(0.72)`}>
    <rect x={-96} y={-372} width={192} height={128} rx={18} fill="#3A424A" stroke={INK} strokeWidth={6} />
    <text x={0} y={-342} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#FFFFFF">SPEED</text>
    {Array.from({length: 5}, (_, i) => { const on = i < level; const h = 18 + i * 9;
      return <rect key={i} x={-78 + i * 32} y={-262 - h} width={24} height={h} rx={4} fill={on ? (i < 2 ? '#7CE36B' : i < 4 ? GOLD : '#FF5A4E') : '#525C66'}
        opacity={on && i === level - 1 ? 0.75 + 0.25 * Math.sin(t * 20) : 1} />; })}
  </g>
);
/** a thermometer on a stick (level 0..1) */
const Thermo: React.FC<{x: number; y: number; s: number; level: number; label?: string; t: number}> = ({x, y, s, level, label, t}) => {
  const top = -300, bot = -40, ly = lerp(bot, top + 10, clamp(level));
  return <g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-26} y={top - 26} width={52} height={bot - top + 40} rx={26} fill="#FFFFFF" stroke={INK} strokeWidth={7} />
    <rect x={-12} y={ly} width={24} height={bot - ly + 10} rx={6} fill={level > 0.85 ? '#FF3B2E' : '#FF5A4E'} />
    <circle cx={0} cy={0} r={44} fill="#FF5A4E" stroke={INK} strokeWidth={7} />
    <circle cx={-14} cy={-12} r={10} fill="#FFB2A8" />
    {[0.2, 0.4, 0.6, 0.8].map((u) => <path key={u} d={`M 14 ${lerp(bot, top, u)} h 14`} stroke={INK} strokeWidth={4} strokeLinecap="round" />)}
    {level > 0.9 ? <path d={`M 0 ${top - 40} l ${-12 + 4 * Math.sin(t * 30)} -26 M 22 ${top - 30} l 18 -16 M -22 ${top - 30} l -18 -16`} stroke={RED} strokeWidth={6} strokeLinecap="round" /> : null}
    {label ? <text x={0} y={86} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={INK} stroke="#FFFFFF" strokeWidth={8} style={{paintOrder: 'stroke'}}>{label}</text> : null}
  </g>;
};

// ---------- screen-space panels ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: FONT_W, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const Counter: React.FC<{left: number; top: number; value: string; label: string; s: number; red?: boolean; rot?: number; sub?: string}> = ({left, top, value, label, s, red, rot = 4, sub}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s.toFixed(3)})`,
    background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 26px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: FONT_W, fontSize: 108, lineHeight: 1, color: red ? RED : INK}}>{value}</div>
    <div style={{fontWeight: FONT_W, fontSize: 36}}>{label}</div>
    {sub ? <div style={{fontWeight: 800, fontSize: 30, color: '#6B6B6B'}}>{sub}</div> : null}
  </div>
) : null;
/** the user's shout-out for this video: a fixed box at the top for the whole video (outside LoopOut, never moves) */
export const SubscribeBox: React.FC = () => {
  const {width, height} = useVideoConfig(); const wide = width > height, fs = wide ? 30 : 40;
  return <div style={{position: 'absolute', left: width / 2, top: wide ? 48 : 176, transform: 'translate(-50%,-50%) rotate(-1deg)', display: 'flex', alignItems: 'center', gap: 14,
    background: '#FFFFFF', border: `6px solid ${INK}`, borderRadius: 22, padding: '8px 24px 8px 12px', boxShadow: `0 7px 0 ${INK}`, fontFamily: FONT, fontWeight: 900, fontSize: fs,
    color: INK, whiteSpace: 'nowrap', letterSpacing: -0.5, pointerEvents: 'none'}}>
    <div style={{width: fs * 1.45, height: fs * 1.45, borderRadius: 14, background: '#E5534B', border: `4px solid ${INK}`, boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <svg width={fs * 1.0} height={fs * 1.0} viewBox="0 0 64 64"><path d="M 32 8 Q 35 8 35 12 Q 47 15 47 31 V 41 L 52 47 H 12 L 17 41 V 31 Q 17 15 29 12 Q 29 8 32 8 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
        <circle cx={32} cy={53} r={5} fill="#FFFFFF" stroke={INK} strokeWidth={4} /></svg>
    </div>
    <span>Subscribe to <span style={{color: '#D23B30'}}>@Koolkid7898pogo</span></span>
  </div>;
};
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

// ---------- X-RAY: POLAR BEAR FUR (a slice through the coat: hairs, skin, fat, body) ----------
const XR_Y = 1012, XR_R = 330;
const HAIRS = [-236, -150, -64, 22, 108, 194, 270].map((x, i) => ({x, h: 250 + 50 * rnd(i + 4), lean: (rnd(i + 9) - 0.5) * 50, w: 0.9 + 0.2 * rnd(i)}));
const SKIN_Y = 24, SKIN_H = 36, FAT_MAX = 150;
const hairD = (h: {x: number; h: number; lean: number}, grow: number) => {
  const top = SKIN_Y - h.h * grow;
  return `M ${h.x} ${SKIN_Y + 6} C ${h.x - 8} ${SKIN_Y - h.h * 0.35 * grow} ${h.x + h.lean} ${SKIN_Y - h.h * 0.7 * grow} ${h.x + h.lean * 1.3} ${top}`;
};
const FurXRay: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const grow = eout(seg(t, HAIR0, HAIR1));
  const zoomK = t >= Z0 && t < Z1 ? 2.1 : 1, zc: P2 = [HAIRS[3].x + HAIRS[3].lean * 1.1, SKIN_Y - HAIRS[3].h * 0.78];
  const blk = eio(seg(t, BLK0, BLK1));
  const skinCol = `rgb(${Math.round(lerp(232, 22, blk))},${Math.round(lerp(176, 22, blk))},${Math.round(lerp(160, 24, blk))})`;
  const fatH = FAT_MAX * eout(seg(t, FAT0, FAT1));
  const fatTop = SKIN_Y + SKIN_H, bodyTop = fatTop + fatH;
  const ray = seg(t, RAY0, RAY0 + 0.2), sc = seg(t, RAY0 + 0.18, RAY1), rayHit: P2 = [HAIRS[2].x + HAIRS[2].lean * 0.8, SKIN_Y - HAIRS[2].h * 0.62];
  const rayOn = t >= RAY0 && t < Z0;
  const heatOn = t >= ARR0;
  return (
    <div style={{position: 'absolute', left: 540, top: XR_Y, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s.toFixed(3)})`}}>
      <XFrame id={`xr${uid}`} R={XR_R}>
        <g transform={zoomK > 1 ? `translate(${(-zc[0] * zoomK).toFixed(1)} ${(-zc[1] * zoomK).toFixed(1)}) scale(${zoomK})` : undefined}>
          {/* body (muscle) under everything */}
          <rect x={-450} y={bodyTop} width={900} height={500} fill="#B84F59" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M -450 ${bodyTop + 30 + i * 46} q 120 -14 240 0 t 240 0 t 240 0 t 240 0`} stroke="#9A3D47" strokeWidth={6} fill="none" />)}
          {heatOn ? <rect x={-450} y={bodyTop} width={900} height={500} fill="#FF7A3C" opacity={0.25 + 0.2 * Math.sin(t * 9)} /> : null}
          {/* fat */}
          {fatH > 1 ? <g>
            <rect x={-450} y={fatTop} width={900} height={fatH} fill="#FFD66B" />
            <clipPath id={`xf${uid}`}><rect x={-450} y={fatTop} width={900} height={fatH} /></clipPath>
            <g clipPath={`url(#xf${uid})`}>{Array.from({length: 26}, (_, i) => <circle key={i} cx={-420 + (i % 13) * 68 + (i > 12 ? 34 : 0)} cy={fatTop + 26 + (i > 12 ? 62 : 0) + (i % 3) * 8} r={22} fill="#FFE59C" stroke="#E2AE3E" strokeWidth={4} />)}</g>
            <path d={`M -450 ${bodyTop} H 450`} stroke="#FFFFFF" strokeWidth={4} opacity={0.6} />
          </g> : null}
          {/* skin */}
          <rect x={-450} y={SKIN_Y} width={900} height={SKIN_H} fill={skinCol} />
          <path d={`M -450 ${SKIN_Y} H 450`} stroke="#DCE9FA" strokeWidth={4} />
          {/* hairs: clear hollow tubes */}
          {grow > 0.01 ? HAIRS.map((h, i) => { const d = hairD(h, grow); return <g key={i}>
            <path d={d} stroke="#EAF4FF" strokeWidth={34 * h.w} fill="none" strokeLinecap="round" />
            <path d={d} stroke="#2E466E" strokeWidth={24 * h.w} fill="none" strokeLinecap="round" />
            <path d={d} stroke="#0E1628" strokeWidth={9 * h.w} fill="none" strokeLinecap="round" />
            <path d={d} stroke="#FFFFFF" strokeWidth={3} fill="none" strokeLinecap="round" opacity={0.5} transform="translate(-9 0)" />
          </g>; }) : null}
          {/* light: a ray comes in and scatters off a hair into white */}
          {rayOn ? <g>
            <path d={`M -250 -250 L ${P(rayHit)}`} stroke={GOLD} strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray={`${ray} 2`} />
            {sc > 0 ? [-150, -100, -40, 20, 80, 140].map((a, i) => { const rr = 150 * eout(sc), aa = (a * Math.PI) / 180;
              return <path key={i} d={`M ${P(rayHit)} L ${P([rayHit[0] + Math.cos(aa) * rr, rayHit[1] + Math.sin(aa) * rr])}`} stroke="#FFFFFF" strokeWidth={9} strokeLinecap="round" opacity={1 - 0.5 * sc} />; }) : null}
            {sc > 0 ? <circle cx={rayHit[0]} cy={rayHit[1]} r={34 * (1 - 0.4 * sc)} fill="#FFFFFF" opacity={0.85 * (1 - sc)} /> : null}
          </g> : null}
          {/* zoom: the hollow core with air in it */}
          {zoomK > 1 ? Array.from({length: 5}, (_, i) => { const u = ((t * 0.7 + i / 5) % 1); const h = HAIRS[3];
            const p: P2 = [h.x + h.lean * (0.55 + 0.6 * u), SKIN_Y - h.h * (0.5 + 0.45 * u)];
            return <circle key={i} cx={p[0]} cy={p[1]} r={3.4} fill="#BFD9FF" opacity={0.9} />; }) : null}
          {/* heat arrows: up from the body, they bounce back off the fat */}
          {heatOn ? [-210, -70, 70, 210].map((x, i) => {
            const u = ((t - ARR0) * 1.25 + i * 0.22) % 1, yb = bodyTop + 16;
            const y = u < 0.5 ? lerp(330, yb, eout(u / 0.5)) : lerp(yb, 330, eio((u - 0.5) / 0.5)), up = u < 0.5;
            return <g key={i} transform={`translate(${x} ${y.toFixed(1)}) rotate(${up ? 0 : 180}) scale(1.7)`} opacity={u > 0.92 ? (1 - u) / 0.08 : 1}>
              <path d="M -10 34 L -10 0 L -24 0 L 0 -28 L 24 0 L 10 0 L 10 34 Z" fill="#FF5A2E" stroke="#FFFFFF" strokeWidth={4} strokeLinejoin="round" />
            </g>;
          }) : null}
        </g>
        {/* the 10 cm ruler next to the fat */}
        {fatH > 1 && zoomK === 1 ? <g>
          <path d={`M 236 ${fatTop} V ${fatTop + fatH}`} stroke="#FFFFFF" strokeWidth={6} />
          {Array.from({length: 11}, (_, i) => i * (FAT_MAX / 10) <= fatH + 0.5 ? <path key={i} d={`M 236 ${fatTop + i * (FAT_MAX / 10)} h ${i % 5 ? 14 : 26}`} stroke="#FFFFFF" strokeWidth={4} /> : null)}
        </g> : null}
      </XFrame>
    </div>
  );
};

// ---------- the story over time ----------
const baseG = (): GF => ({x: 0, y: 0, rot: 0, lean: 0, armA: [-30, 128], armB: [30, 128], footA: [-27, -12], footB: [27, -12],
  mood: 'bliss', look: 0, lookY: 0, heat: 0, sq: 0, tilt: 0, trem: 0, hide: 0, glow: 0});
const jog = (g: GF, t: number, hz: number, amp = 1) => {
  const s = Math.sin(2 * Math.PI * hz * t);
  g.footA = [-27, -12 - 34 * amp * Math.max(0, s)]; g.footB = [27, -12 - 34 * amp * Math.max(0, -s)];
  g.armA = [-50, 62 - 48 * amp * s]; g.armB = [50, 62 + 48 * amp * s];
  g.y = -10 * amp * Math.abs(s); g.lean = 2.5 * s * amp;
};
const hitSq = (t: number) => HITS.reduce((a, h) => a + (t >= h ? Math.max(0, Math.exp(-7 * (t - h)) * Math.cos((t - h) * 26)) * 0.5 : 0), 0);
const guyAt = (t: number): GF => {
  const g = baseG();
  if (t < S2) {   // frame 0: cozy in the blizzard; the snowball WHUMPs in, he doesn't blink
    g.sq = hitSq(t); g.mood = t < 0.62 ? 'smug' : 'bliss'; g.armA = [-34, 120]; g.armB = [34, 120];
    g.lean = 1.5 * Math.sin(t * 2.2);
    if (t > 1.18) { const k = eout(seg(t, 1.18, 1.4)); g.armA = lp2([-34, 120], [-50, 62], k); g.armB = lp2([34, 120], [50, 62], k); g.mood = 'focus'; }
    return g;
  }
  if (t < S3) {   // one jog: toward the camera, steam starts, he gets pink
    jog(g, t - S2, 2.7); g.mood = t < 1.92 ? 'focus' : 'worry'; g.heat = 0.42 * seg(t, 1.72, S3);
    return g;
  }
  if (t < S4) {   // close-up: red, steam blast, he keels over
    jog(g, t - S2, 2.7, 1 - seg(t, S3, 2.36)); g.heat = lerp(0.42, 1, eout(seg(t, RED0, 2.46)));
    g.mood = t < BLAST ? 'worry' : 'hot'; g.trem = t > BLAST && t < FALL ? 0.7 : 0;
    g.sq = t > BLAST ? Math.max(0, Math.exp(-6 * (t - BLAST)) * Math.cos((t - BLAST) * 24)) * 0.35 : 0;
    if (t > FALL) { g.rot = -96 * eio(seg(t, FALL, FALL + 0.24)); g.mood = 'dizzy'; }
    return g;
  }
  if (t < S6) { g.hide = 1; return g; }
  if (t < S7) {   // YOUR BODY: he jogs in place, gets hotter and dizzy
    if (t < TH1) { jog(g, t - S6, 1.8, 0.55); g.mood = 'hot'; }
    else { g.mood = 'dizzy'; g.tilt = 8 * Math.sin((t - TH1) * 5); g.lean = 5 * Math.sin((t - TH1) * 4); g.armA = [-70, 90]; g.armB = [70, 90]; g.trem = 0.4; }
    g.heat = lerp(0.55, 1, eio(seg(t, S6, TH1))); g.glow = eio(seg(t, S6, TH1));
    return g;
  }
  // so he never runs: he just stands there, cozy, and the snowballs WHUMP in
  g.sq = hitSq(t); g.mood = t > HITS[1] && t < HITS[1] + 0.3 ? 'smug' : 'bliss'; g.armA = [-34, 120]; g.armB = [34, 120];
  g.lean = 1.5 * Math.sin(t * 2.2);
  return g;
};
// the treadmill's speed: belt distance and the bear's step phase (integrated numerically)
const speedAt = (t: number) => lerp(0.9, 4.6, eio(seg(t, 10.1, 12.4)));
const integ = (t: number, f: (x: number) => number) => { let a = 0; for (let x = S5; x < t; x += 0.02) a += f(Math.min(x + 0.01, t)) * Math.min(0.02, t - x); return a; };
const baseB = (): BS => ({x: BEAR_X, y: 0, s: BEAR_S, mood: 'smug', pawL: [-118, -186], pawR: [118, -186], heat: 0, tilt: 0, walk: 0, ph: 0, rot: 0,
  lookX: -1, lookY: 0, shake: 0, sq: 0, hide: 0});
const bearAt = (t: number): BS => {
  const B = baseB();
  if (t < S2) { B.tilt = -3 + 2 * Math.sin(t * 2); return B; }
  if (t < S4) { B.mood = 'look'; B.lookX = -1; return B; }
  if (t < S5) { B.mood = t > BLK0 && t < FAT0 ? 'pop' : 'smug'; B.lookY = 1; B.lookX = 0; B.tilt = 4; return B; }
  if (t < S6) {   // on the treadmill
    B.x = TM_X; B.y = TM_Y; B.s = 0.9; B.lookX = 0;
    B.walk = 1; B.ph = 2 * Math.PI * integ(t, (x) => lerp(1.1, 3.4, eio(seg(x, 10.1, 12.4))));
    B.heat = eio(seg(t, 10.6, 11.7)); B.mood = t < 10.5 ? 'smug' : t < 11.35 ? 'focus' : 'hot';
    const sw = Math.sin(B.ph); B.pawL = [-120, -170 - 50 * sw]; B.pawR = [120, -170 + 50 * sw];
    if (t > FLING) {   // flung off the back: up and away, upside down, into the snowbank
      const u = seg(t, FLING, LANDB);
      B.x = lerp(TM_X, BANK_X, u); B.y = lerp(TM_Y, -230, u) - 230 * Math.sin(Math.PI * u) * (1 - 0.3 * u);
      B.rot = 190 * eout(u); B.s = lerp(0.9, 0.72, u); B.mood = 'pop'; B.walk = 0; B.pawL = [-150, -380]; B.pawR = [150, -380];
      if (t >= LANDB) B.hide = 1;
    }
    return B;
  }
  if (t < S7) { B.hide = 1; return B; }
  B.mood = t > HITS[1] + 0.05 && t < HITS[1] + 0.45 ? 'laugh' : 'smug'; B.shake = B.mood === 'laugh' ? 1 : 0; B.tilt = -3 + 2 * Math.sin(t * 2);
  return B;
};

// ---------- camera (piecewise, hard cuts) ----------
const CAM0 = {x: 62, y: -236, k: 2.58};
const camFor = (t: number): {x: number; y: number; k: number} => {
  if (t < S2) { const u = eio(seg(t, 0, S2)); return {x: lerp(CAM0.x, 52, u), y: lerp(CAM0.y, -238, u), k: lerp(CAM0.k, 2.72, u)}; }
  if (t < S3) { const u = eio(seg(t, S2, S3)); return {x: lerp(20, 8, u), y: lerp(-205, -228, u), k: lerp(2.7, 3.35, u)}; }
  if (t < S4) { const u = eio(seg(t, S3, S4)); return {x: lerp(4, 0, u), y: lerp(-226, -232, u), k: lerp(3.78, 3.92, u)}; }
  if (t < S5) { const u = seg(t, S4, S5); return {x: lerp(BEAR_X - 10, BEAR_X + 10, u), y: -150, k: 2.25}; }
  if (t < S5B) { const u = eio(seg(t, S5, S5B)); return {x: lerp(TM_X - 10, TM_X + 10, u), y: lerp(-262, -270, u), k: lerp(1.95, 2.05, u)}; }
  if (t < S5C) { const u = eio(seg(t, S5B, S5C)); return {x: TM_X, y: lerp(-400, -405, u), k: lerp(3.0, 3.15, u)}; }
  if (t < S6) { const u = eio(seg(t, S5C, S6)); return {x: lerp(TM_X + 40, TM_X + 50, u), y: lerp(-300, -296, u), k: lerp(1.86, 1.82, u)}; }
  if (t < S7) { const u = eio(seg(t, S6, S7)); return {x: lerp(-20, -24, u), y: lerp(-222, -226, u), k: lerp(3.0, 3.12, u)}; }
  const u = eio(seg(t, S7, PUSH));
  return {x: lerp(70, CAM0.x, u), y: lerp(-228, CAM0.y, u), k: lerp(2.32, CAM0.k, u)};
};

export const PolarScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t), B = bearAt(t);
  if (thumb) { g.heat = 0.95; g.mood = 'hot'; g.trem = 0; g.sq = 0; g.armA = [-60, 40]; g.armB = [60, 40]; B.mood = 'smug'; B.x = 132; }
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 5, 7) + hit(t, BLAST, 9, 6) + hit(t, FALL + 0.24, 8, 6) + hit(t, LANDB, 10, 6) + hit(t, HITS[1], 5, 7) + hit(t, HITS[2], 5, 7) + (t > 11.6 && t < FLING ? 1.5 : 0));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const hw = headWorld(g), chest = chestWorld({...g, y: 0, x: 0});
  const belt = t >= S5 && t < S6 ? integ(t, speedAt) : 0;
  const level = t >= S5 ? 1 + Math.floor(4 * eio(seg(t, 10.1, 12.4)) + 0.001) : 1;
  const thermoLv = t >= S5 ? lerp(0.22, 1, eio(seg(t, 10.3, 12.2))) : 0.22;
  const showGuy = !(t >= S4 && t < S6);
  const balls = HITS.slice(1).map((h) => ballAt(t, h, chest)).concat([ballAt(t, PUSH + THROW_T + 0.04, chest)]);
  const st = {
    whump0: (1 - seg(t, 0.55, 0.68)) * (t < S2 ? 1 : 0) * (1 + 0.08 * Math.sin(t * 14)),
    tsss: popIn(t, BLAST + 0.02, 0.2) * (1 - seg(t, FALL, FALL + 0.12)),
    sproing: popIn(t, FLING, 0.18) * (1 - seg(t, LANDB - 0.08, LANDB)),
    pomf: popIn(t, LANDB, 0.2) * (1 - seg(t, S6 - 0.12, S6)),
    whump1: popIn(t, HITS[1], 0.2) * (1 - seg(t, HITS[1] + 0.42, HITS[1] + 0.54)),
    whump2: popIn(t, HITS[2], 0.2) * (1 - seg(t, HITS[2] + 0.42, HITS[2] + 0.54)),
  };
  const steamBorn = [1.86, 2.0, BLAST - 0.02, BLAST + 0.12, BLAST + 0.26, 2.62, 13.3, 13.62, 13.95, 14.2];
  const bearSteam = [11.45, 11.75, 12.05, 12.32, LANDB + 0.05, LANDB + 0.35];
  const bh = bearHead(B);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`pFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <AbsoluteFill style={{background: SKY}} />
      {/* far: icy ridges */}
      <Layer cam={cam} z={2600}><W><g>
        {[-2300, -1150, 0, 1150, 2300, 3450].map((x, i) => <path key={i} d={`M ${x - 700} -6 L ${x - 260} ${-300 - (i % 2) * 120} L ${x - 120} ${-250 - (i % 2) * 110} L ${x + 120} ${-420 - (i % 3) * 40} L ${x + 700} -6 Z`}
          fill={i % 2 ? ICE : '#E4EFF8'} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
        {[-2300, -1150, 0, 1150, 2300, 3450].map((x, i) => <path key={'c' + i} d={`M ${x - 210} ${-260 - (i % 2) * 110} L ${x - 120} ${-250 - (i % 2) * 110} L ${x + 120} ${-420 - (i % 3) * 40} L ${x + 200} ${-330 - (i % 3) * 30} Q ${x} ${-300} ${x - 210} ${-260 - (i % 2) * 110} Z`} fill="#FFFFFF" />)}
        <rect x={-6000} y={-10} width={12000} height={4000} fill={SNOW_SH} />
        <path d="M -6000 -10 H 6000" stroke={INK} strokeWidth={6} />
      </g></W></Layer>
      {/* near: snow ground with drifts */}
      <Layer cam={cam} z={1000}><W><g>
        <path d={'M -3000 0 L ' + DRIFT(-3000, 3600, 0, 26, 520, 0.6).join(' L ') + ' L 3600 3000 L -3000 3000 Z'} fill={SNOW} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {Array.from({length: 26}, (_, i) => { const x = -1500 + i * 190 + ((i * 53) % 70); return <path key={i} d={`M ${x} ${60 + (i % 3) * 40} q 40 -16 80 0`} stroke={SNOW_SH} strokeWidth={6} fill="none" strokeLinecap="round" />; })}
        {[[-420, 30, 1.1], [520, 18, 0.9], [-760, 80, 1.3], [880, 70, 1.2]].map(([x, y, s2], i) => <path key={'m' + i}
          d={`M ${x - 90 * s2} ${y} Q ${x - 60 * s2} ${y - 60 * s2} ${x} ${y - 66 * s2} Q ${x + 70 * s2} ${y - 60 * s2} ${x + 100 * s2} ${y} Z`} fill={SNOW} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
        {/* the snowbank behind the treadmill */}
        <path d={`M ${BANK_X - 330} -60 Q ${BANK_X - 250} -300 ${BANK_X - 40} -312 Q ${BANK_X + 200} -320 ${BANK_X + 330} -60 Z`} fill={SNOW} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d={`M ${BANK_X - 180} -200 q 60 -30 120 -10`} stroke={SNOW_SH} strokeWidth={7} fill="none" strokeLinecap="round" />
        {t >= LANDB && t < S6 ? <BearLegsUp t={t} x={BANK_X - 10} y={-292} s={0.9} kick={1} /> : null}
        <SpeedSign x={TM_X - 172} level={level} t={t} />
        <Treadmill belt={belt} />
        <Thermo x={TM_X + 214} y={-150} s={0.62} level={thermoLv} t={t} />
      </g></W></Layer>
      {/* characters */}
      <Layer cam={cam} z={1000}>
        <PolarBear t={t} B={B} uid={uid} />
        {showGuy ? <GuyF t={t} g={g} uid={uid} /> : null}
        <W>
          {HITS.map((h, i) => <SnowBurst key={i} t={t} at={h} p={chest} />)}
          {balls.map((b, i) => b ? <Snowball key={i} p={b} /> : null)}
        </W>
        {(thumb ? steamBorn.filter((b) => b > 2.2 && b < 2.7) : steamBorn).map((b, i) => (t > b && t < b + 1.1 && showGuy ? <Puffs key={'s' + i} t={t} born={b} x={hw[0] + (i % 2 ? 40 : -40)} y={hw[1] - 40} n={5} life={0.9} size={i > 5 ? 24 : i > 1 ? 24 : 30} vy={-240} vx={i % 2 ? 60 : -60} color="#FFFFFF" seed={i * 3 + 1} /> : null))}
        {t >= S5 ? bearSteam.map((b, i) => (t > b && t < b + 1.0 ? <Puffs key={'b' + i} t={t} born={b} x={i < 4 ? bh[0] : BANK_X - 10} y={i < 4 ? bh[1] - 70 : -330} n={5} life={0.85} size={26} vy={-240} color="#FFFFFF" seed={i * 5 + 2} /> : null)) : null}
        {t > LANDB && t < LANDB + 0.6 ? <Puffs t={t} born={LANDB} x={BANK_X - 10} y={-290} n={8} life={0.5} size={40} vy={-80} color="#FFFFFF" seed={9} /> : null}
        {g.heat > 0.5 && showGuy ? [0, 1].map((i) => { const ph = (t * 1.3 + i * 0.5) % 1; return <Sweat key={'sw' + i} x={hw[0] + (i ? 80 : -80) + (i ? 30 : -30) * ph} y={hw[1] - 30 + 90 * ph * ph} s={0.9 * (1 - ph)} />; }) : null}
        {B.heat > 0.4 && t < FLING ? [0, 1].map((i) => { const ph = (t * 1.4 + i * 0.5) % 1; return <Sweat key={'bs' + i} x={bh[0] + (i ? 95 : -95) + (i ? 25 : -25) * ph} y={bh[1] - 20 + 80 * ph * ph} s={1.0 * (1 - ph)} />; }) : null}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={chest[0] + 150} y={chest[1] - 110} s={st.whump0} text="WHUMP" size={44} rot={-8} fill="#FFFFFF" />
        <Txt x={hw[0] - 66} y={hw[1] - 100} s={st.tsss} text="TSSSS" size={30} rot={-10} fill="#FFFFFF" />
        <Txt x={TM_X - 80} y={-560} s={st.sproing} text="SPROING" size={56} rot={-8} fill={GOLD} />
        <Txt x={BANK_X + 150} y={-470} s={st.pomf} text="POMF" size={64} rot={6} fill="#FFFFFF" />
        <Txt x={chest[0] + 150} y={chest[1] - 110} s={st.whump1} text="WHUMP" size={44} rot={-8} fill="#FFFFFF" />
        <Txt x={chest[0] + 160} y={chest[1] - 60} s={st.whump2} text="WHUMP" size={44} rot={7} fill="#FFFFFF" />
      </Layer>}
      <Flakes t={t} />
      {thumb ? null : <>
        <Card text="NOT COLD" top={1452} color="#FFFFFF" rot={-4} s={popIn(t, T.fur - 0.06, 0.28) * (1 - seg(t, S2 - 0.12, S2))} size={84} />
        <Card text="ONE JOG" top={1452} color={GOLD} rot={4} s={popIn(t, T.jog - 0.06, 0.26) * (1 - seg(t, S3 - 0.1, S3))} size={84} />
        <Card text="COOKED" top={1452} color={RED} fg="#fff" rot={-4} s={popIn(t, T.cook + 0.01, 0.3) * (1 - seg(t, S4 - 0.12, S4)) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - T.cook - 0.2) * 6))} size={104} />
        <Card text="EVEN THE BEAR" top={1452} color="#FFFFFF" rot={-3} s={popIn(t, T.even - 0.04, 0.28) * (1 - seg(t, T.overheats - 0.1, T.overheats))} size={72} />
        <Card text="TOO HOT" top={1452} color={RED} fg="#fff" rot={3} s={popIn(t, T.overheats, 0.28) * (1 - seg(t, S5C - 0.1, S5C))} size={84} />
        <Card text="HEAT STROKE" top={1452} color={RED} fg="#fff" rot={-3} s={popIn(t, T.stroke - 0.03, 0.3) * (1 - seg(t, S7 - 0.12, S7)) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - T.stroke - 0.2) * 6))} size={84} />
        <Card text="NEVER RUNS" top={1452} color={GOLD} rot={3} s={popIn(t, T.never - 0.02, 0.28) * (1 - seg(t, PUSH - 0.12, PUSH))} size={84} />
        <Counter left={820} top={720} value={`${37 + Math.floor(seg(t, TH0, TH1) * 3 + 0.0001)}°C`} label="YOUR BODY" sub="40 °C = 104 °F" rot={4} red={t > TH1 - 0.02}
          s={popIn(t, S6 + 0.05, 0.3) * (1 - seg(t, S7 - 0.12, S7)) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - TH1) * 5))} />
      </>}
      <FurXRay t={t} s={popIn(t, S4 + 0.02, 0.35) * (1 - seg(t, S5 - 0.12, S5)) * (t >= S4 ? 1 : 0)} uid={uid} />
      {thumb ? null : <>
        <Card text="X-RAY: POLAR BEAR FUR" top={XR_Y - XR_R - 26} size={46} rot={-2} s={popIn(t, S4 + 0.06, 0.3) * (1 - seg(t, S5 - 0.12, S5))} />
        <Card text="CLEAR" top={XR_Y - 120} left={300} color="#FFFFFF" rot={-5} s={popIn(t, T.clear, 0.26) * (1 - seg(t, Z0 - 0.08, Z0))} size={60} />
        <Card text="HOLLOW" top={XR_Y + 200} left={540} color={GOLD} rot={4} s={popIn(t, T.hollow + 0.02, 0.26) * (1 - seg(t, Z1 - 0.1, Z1))} size={64} />
        <Card text="BLACK SKIN" top={XR_Y + 190} left={540} color={INK} fg="#FFFFFF" rot={-3} s={popIn(t, T.black + 0.06, 0.26) * (1 - seg(t, FAT0 - 0.1, FAT0))} size={60} />
        <Counter left={300} top={1430} value={`${Math.floor(seg(t, CM0, FAT1) * 10 + 0.0001)} CM`} label="OF FAT" rot={-4}
          s={popIn(t, FAT0 - 0.05, 0.3) * (1 - seg(t, S5 - 0.14, S5)) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - FAT1) * 5))} />
        <Card text="TRAPS HEAT" top={1430} left={760} color={RED} fg="#fff" rot={4} s={popIn(t, T.traps, 0.28) * (1 - seg(t, S5 - 0.12, S5))} size={56} />
        <CommentBubble t={t} text="what if you had a polar bear's fur??" handle="@snowday_doodle" likes="3.1K" y={400} />
        <CallToAction t={t} at={T.cta} y={300} />
        <CommentAsk t={t} at={T.so} until={PUSH - 0.4} text="Worth it for winter?" y={310} />
      </>}
    </AbsoluteFill>
  );
};

export const PolarVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const wind: Cue[] = [0, 3.6, 7.2, 10.8, 14.4].map((at) => ({f: 'wind.wav', at, db: at === 0 ? -27 : -31}));
  const cues: Cue[] = [
    // frame 0: WHUMP + a gust; the blizzard bed under everything
    {f: 'snowball.wav', at: 0, db: -8}, {f: 'whoosh.wav', at: 0, db: -19, from: 0.12}, ...wind,
    {f: 'pop.wav', at: T.fur - 0.06, db: -22},
    // one jog
    {f: 'whoosh.wav', at: S2 - 0.03, db: -30}, {f: 'footsteps.mp3', at: S2, db: -15, to: 0.95}, {f: 'pop.wav', at: T.jog - 0.06, db: -22},
    // cooked: steam blast + kettle whistle, he keels over
    {f: 'gasp.wav', at: RED0, db: -20}, {f: 'hiss.wav', at: BLAST - 0.04, db: -10, to: 1.0}, {f: 'kettle.wav', at: BLAST, db: -13},
    {f: 'pop.wav', at: T.cook + 0.01, db: -18}, {f: 'whoosh.wav', at: FALL, db: -24}, {f: 'thud.wav', at: FALL + 0.24, db: -8}, {f: 'hiss.wav', at: FALL + 0.26, db: -17, to: 0.7},
    {f: 'crowd_laugh.wav', at: FALL + 0.3, db: -30, to: 0.7},
    // X-RAY: the fur
    {f: 'zap.wav', at: S4, db: -24}, {f: 'pop.wav', at: S4 + 0.05, db: -24}, {f: 'stretch.wav', at: HAIR0, db: -20, to: 0.45},
    {f: 'shimmer.wav', at: RAY0 + 0.1, db: -18}, {f: 'pop.wav', at: T.clear, db: -22},
    {f: 'whoosh.wav', at: Z0 - 0.02, db: -30}, {f: 'pop.wav', at: T.hollow + 0.02, db: -22}, {f: 'bubbles.wav', at: Z0 + 0.15, db: -26}, {f: 'whoosh.wav', at: Z1 - 0.02, db: -32},
    {f: 'squelch.wav', at: BLK0, db: -18}, {f: 'pop.wav', at: T.black + 0.06, db: -22},
    {f: 'stretch.wav', at: FAT0, db: -15, to: 1.0}, ...ticks(CM0, FAT1, 10, -31), {f: 'ding.mp3', at: FAT1 + 0.02, db: -20},
    {f: 'twang.mp3', at: ARR0 + 0.4, db: -26, to: 0.3}, {f: 'twang.mp3', at: ARR0 + 0.62, db: -27, to: 0.3}, {f: 'pop.wav', at: T.traps, db: -21},
    ...ctaCues(T.cta),
    // the bear on the treadmill
    {f: 'whoosh.wav', at: S5 - 0.03, db: -30}, {f: 'whir.mp3', at: S5, db: -21}, {f: 'whir.mp3', at: S5 + 1.9, db: -17, to: FLING - S5 - 1.9},
    {f: 'footsteps.mp3', at: 10.1, db: -24, to: 0.9}, {f: 'footsteps.mp3', at: 10.95, db: -22, to: 0.8}, {f: 'footsteps.mp3', at: 11.7, db: -20, to: 0.9},
    {f: 'pop.wav', at: T.even - 0.04, db: -22}, {f: 'gasp.wav', at: 11.4, db: -21}, {f: 'gasp.wav', at: 11.85, db: -20}, {f: 'gasp.wav', at: 12.25, db: -19},
    {f: 'hiss.wav', at: 11.5, db: -20, to: 1.0}, {f: 'kettle.wav', at: T.overheats, db: -21, to: 0.7}, {f: 'pop.wav', at: T.overheats, db: -20},
    {f: 'whoosh.wav', at: S5C - 0.03, db: -30}, {f: 'twang.mp3', at: FLING, db: -10, to: 0.6}, {f: 'whoosh.wav', at: FLING, db: -15},
    {f: 'snowball.wav', at: LANDB, db: -5}, {f: 'thud.wav', at: LANDB, db: -9}, {f: 'hiss.wav', at: LANDB + 0.08, db: -18, to: 0.8}, {f: 'crowd_laugh.wav', at: LANDB + 0.06, db: -24, to: 1.2},
    // YOUR BODY: heat stroke
    {f: 'whoosh.wav', at: S6 - 0.03, db: -30}, {f: 'gasp.wav', at: S6 + 0.12, db: -21}, {f: 'kettle.wav', at: 13.4, db: -25, to: 0.8},
    ...ticks(TH0, TH1, 3, -26), {f: 'beep.wav', at: T.stroke - 0.02, db: -15}, {f: 'pop.wav', at: T.stroke, db: -20},
    // so he never runs
    {f: 'whoosh.wav', at: S7 - 0.03, db: -30}, {f: 'whoosh.wav', at: HITS[1] - THROW_T, db: -27}, {f: 'snowball.wav', at: HITS[1], db: -6},
    {f: 'whoosh.wav', at: HITS[2] - THROW_T, db: -27}, {f: 'snowball.wav', at: HITS[2], db: -6}, {f: 'pop.wav', at: T.never - 0.02, db: -21},
    {f: 'giggle.mp3', at: HITS[1] + 0.1, db: -30, to: 0.6}, {f: 'whoosh.wav', at: PUSH - 0.05, db: -22},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<PolarScene t={0} />}>
        <PolarScene t={t} />
      </LoopOut>
      <SubscribeBox />
      <Look />
      <SoundLayer voice="polarbear/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const PolarWide: React.FC = () => <WideFit.Provider value={0.72}><PolarVideo /></WideFit.Provider>;
