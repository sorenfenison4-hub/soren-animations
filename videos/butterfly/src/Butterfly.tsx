// "What if you could turn into a butterfly?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// (1) frame 0: he flies on huge monarch wings over a meadow beside a smug monarch (wings spread, flapping from frame 0);
// (2) "and first": a chrysalis zips shut around him on a branch; close-up: his face melts into soup inside it (2.4 s), SOUP;
// (3) X-RAY: CHRYSALIS - a caterpillar fizzes and dissolves into soup (DIGESTS ITSELF);
// (4) glowing clumps of cells survive in the soup (WINGS / LEGS / EYES), DAYS 0 -> 14, they build a butterfly;
// (5) the dark chrysalis shows orange wings, CRACK, he pops out, his crumpled wings pump open: TA-DA;
// (6) close-up: his mouth is a coiled straw that BOINGs out (STRAW); (7) he tries a pizza slice - BOING off the coil,
//     YOUR TEETH 32 -> 0, NO CHEWING; (8) he tosses the pizza in a blender, WHIRR, slurps it through his straw and flies off
//     = frame 0. All drawn in code; the guy is the code-drawn front view (beetle / fly / lizard) on the small IK rig.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, spring, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Puffs} from './lib/kit';

// voice: tight.mp3 at 0.1 s (line 1 tightened at 1.2, the rest at 1.12; times are video time). Speech ends 17.28 s.
export const DURATION = 18.1;
export const T = {
  turn: 0.10, butterfly: 0.63, and: 1.35, first: 1.55, youd: 2.15, melt: 2.42, into: 2.62, soup: 2.95,   // "Turn into a butterfly, and first you'd melt into soup."
  inside: 3.65, chrysalis: 4.01, caterpillar: 4.90, digests: 5.76, own: 6.40, body: 6.79,             // "Inside the chrysalis, a caterpillar digests its own body."
  few: 7.40, tiny: 7.68, clumps: 8.04, cells: 8.47, survive: 8.86, build: 10.08, wings: 10.33,         // "A few tiny clumps of cells survive, and they build the wings."
  about: 11.06, two: 11.31, weeks: 11.49, later: 11.67, out: 12.35, come: 12.74,                       // "About two weeks later, out you come,"
  straw: 13.49, mouth: 14.20,                                                                          // "with a straw for a mouth."
  no: 14.63, more: 14.85, chewing: 15.06,                                                              // "No more chewing."
  so: 15.76, he: 16.26, drinks: 16.47, pizza: 16.90,                                                   // "So he drinks his pizza."
  cta: 11.0,
};
// beats (shot changes are hard cuts)
const S2 = 1.45, WRAP1 = 1.95, S2B = 2.15, MELT0 = 2.3, MELT1 = 3.15;            // the chrysalis zips shut; close-up: he melts
const S3 = 3.55, DIG0 = 5.72, DIG1 = 7.0;                                        // X-RAY: the caterpillar dissolves
const S4 = 7.15, S4B = 9.4, BUILD0 = 10.06, BUILD1 = 10.9;                       // zoom on the surviving clumps; wide: they build a butterfly
const DAY0 = 7.3, DAY1 = 11.6;
const S5 = 10.95, CRACK = 11.7, SPLIT = 12.35, PUMP0 = 12.42, PUMP1 = 12.72;     // the dark chrysalis cracks, he pops out, wings pump open
const S6 = 13.05, UNC0 = 13.46, UNC1 = 13.74, REC0 = 14.16, REC1 = 14.42;       // close-up: the straw mouth uncoils
const S7 = 14.55, PUSH0 = 14.62, BONK = 14.8, TEETH0 = 14.66, TEETH1 = 15.32;    // pizza: BOING off the coil
const S8 = 15.7, TOSS0 = 15.8, TOSS1 = 16.06, WHIR0 = 16.12, WHIR1 = 16.82, DIP0 = 16.44, DIP1 = 16.7, SLURP0 = 16.86, SLURP1 = 17.3, LIFT = 17.32;
const PUSH = DURATION - LOOP_DUR;

const GOLD = '#FFD43B', RED = '#E2453C', FACE_C = '#F1EFEA';
const ORANGE = '#F5902A', JADE = '#9FDDB5', JADE_DK = '#5FAF80', DOT = '#F2C230', MBODY = '#3A3A3A';
const SOUP = '#C9D35A', SOUP_DK = '#9DB03E', SOUP_HI = '#ECF2A8';
const GRASS = '#C3E5A4', GRASS_DK = '#97CB7B', HILL = '#D7EFBF', HILL_DK = '#BFE2A0', BARK = '#B98A5C', BARK_DK = '#8E653D', LEAF = '#8FCB5C', LEAF_DK = '#5F9C3B';
const TAN = '#E7BA5E', CHEESE = '#FFD45E', CRUST = '#E3A85A', PEPP = '#D9483B';
const XBODY = '#7193C6', YEL = '#FFD43B';
const FONT_W = 900;
const FLY_X = 560;                     // where he flies at frame 0 (away from the branch)
const CH_X = 0, CH_TOP = -470, CH_S = 1.08;    // the chrysalis hangs from the branch here
const IN_Y = -60;                      // his feet inside the chrysalis
const HOV_Y = -40;                     // his feet while he hovers after coming out
const STUMP_X = -150, STUMP_TOP = -64; // the blender's stump

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const rad = (d: number) => (d * Math.PI) / 180;
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const bez = (a: P2, b: P2, c: P2, d: P2, u: number): P2 => {
  const v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]];
};
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
const path = (pts: P2[]) => 'M ' + pts.map(P).join(' L ');

// ---------- monarch wings (right side; the left side is mirrored), root at 0,0 ----------
const FA: P2[] = [[150, -160], [172, -170], [192, -158], [190, -134]], FB: P2[] = [[190, -134], [186, -96], [168, -50], [132, -18]];
const HA: P2[] = [[146, 34], [166, 66], [150, 120], [108, 142]], HB: P2[] = [[108, 142], [70, 160], [22, 128], [6, 70]], H0: P2[] = [[0, 0], [50, -14], [120, -6], [146, 34]];
const FORE = 'M 0 0 C 18 -40 70 -125 150 -160 C 172 -170 192 -158 190 -134 C 186 -96 168 -50 132 -18 C 96 6 40 10 0 0 Z';
const HIND = 'M 0 0 C 50 -14 120 -6 146 34 C 166 66 150 120 108 142 C 70 160 22 128 6 70 C -2 40 -4 16 0 0 Z';
const APEX = 'M 116 -146 C 150 -176 198 -162 190 -128 C 188 -110 176 -98 160 -100 C 146 -112 132 -128 116 -146 Z';
const FORE_V = ['M 8 -4 Q 90 -70 180 -138', 'M 10 -2 Q 100 -50 186 -100', 'M 12 0 Q 100 -30 170 -58', 'M 12 2 Q 80 -4 138 -22', 'M 66 -62 Q 94 -50 110 -28'];
const HIND_V = ['M 4 2 Q 80 4 146 40', 'M 4 4 Q 80 40 150 96', 'M 4 6 Q 70 70 116 140', 'M 2 8 Q 40 80 66 150', 'M 0 8 Q 14 60 24 116', 'M 48 28 Q 70 48 66 76'];
const inset = (p: P2, c: P2, d: number): P2 => { const v: P2 = [c[0] - p[0], c[1] - p[1]], l = Math.hypot(v[0], v[1]) || 1; return [p[0] + (v[0] / l) * d, p[1] + (v[1] / l) * d]; };
const FORE_DOTS: P2[] = [...[0.14, 0.32, 0.5, 0.68, 0.86].map((u) => inset(bez(FB[0], FB[1], FB[2], FB[3], u), [100, -70], 11)), inset(bez(FA[0], FA[1], FA[2], FA[3], 0.85), [100, -70], 12)];
const HIND_DOTS: P2[] = [inset(bez(H0[0], H0[1], H0[2], H0[3], 0.82), [70, 60], 11), ...[0.2, 0.5, 0.8].map((u) => inset(bez(HA[0], HA[1], HA[2], HA[3], u), [70, 60], 11)),
  ...[0.18, 0.42, 0.66].map((u) => inset(bez(HB[0], HB[1], HB[2], HB[3], u), [70, 60], 11))];
const Wing: React.FC<{kind: 'fore' | 'hind'; id: string; crumple?: number}> = ({kind, id, crumple = 0}) => {
  const d = kind === 'fore' ? FORE : HIND;
  return <g>
    <clipPath id={id}><path d={d} /></clipPath>
    <path d={d} fill={ORANGE} />
    <g clipPath={`url(#${id})`}>
      <path d={kind === 'fore' ? 'M 30 -40 Q 80 -110 140 -140 L 120 -60 Z' : 'M 30 20 Q 90 30 120 80 L 60 90 Z'} fill="#FFB35C" opacity={0.55} />
      {(kind === 'fore' ? FORE_V : HIND_V).map((v, i) => <path key={i} d={v} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />)}
      <path d={d} fill="none" stroke={INK} strokeWidth={40} />
      {kind === 'fore' ? <path d={APEX} fill={INK} /> : null}
      {(kind === 'fore' ? FORE_DOTS : HIND_DOTS).map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 2 ? 3.8 : 5.2} fill="#FFFFFF" />)}
      {kind === 'fore' ? <g><circle cx={166} cy={-140} r={5} fill="#FFFFFF" /><circle cx={176} cy={-122} r={4} fill={ORANGE} /></g> : null}
      {crumple > 0.03 ? <path d={kind === 'fore' ? 'M 20 -20 L 50 -60 L 70 -30 L 100 -90 L 120 -50 L 150 -120' : 'M 20 20 L 50 60 L 70 30 L 100 100 L 120 60'}
        stroke={INK} strokeWidth={6} fill="none" strokeLinejoin="round" opacity={crumple} /> : null}
    </g>
    <path d={d} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g>;
};
/** both wings: flap 0 = spread (down), 1 = up over the back; crumple = fresh out of the chrysalis (small, wrinkled, drooping) */
const WingPair: React.FC<{root: P2; s: number; flap: number; crumple?: number; id: string}> = ({root, s, flap, crumple = 0, id}) => {
  const ang = 50 * flap - 18 * crumple, sx = 1 - 0.2 * flap, cs = s * (1 - 0.66 * crumple);
  if (cs < 0.01) return null;
  return <g transform={`translate(${P(root)})`}>
    {[-1, 1].map((sd) => <g key={sd} transform={`scale(${sd} 1) rotate(${(-ang).toFixed(2)}) scale(${(cs * sx).toFixed(3)} ${cs.toFixed(3)})`}>
      <Wing kind="hind" id={`${id}h${sd}`} crumple={crumple} />
      <Wing kind="fore" id={`${id}f${sd}`} crumple={crumple} />
    </g>)}
  </g>;
};

// ---------- the straw mouth (proboscis): head-local, starts at the mouth (0, 30) ----------
const STRAW_L = 236, STRAW_N = 46;
const coilAt = (s: number): P2 => {
  const s0 = 24;
  if (s < s0) return [0, 30 + s];
  const r0 = 24, r1 = 5, PHI = (STRAW_L - s0) / ((r0 + r1) / 2), u = (s - s0) / (STRAW_L - s0), phi = u * PHI;
  const r = lerp(r0, r1, u), th = Math.PI - phi, C: P2 = [r0, 30 + s0];
  return [C[0] + r * Math.cos(th), C[1] + r * Math.sin(th)];
};
const Straw: React.FC<{unc: number; target: [P2, P2]; wob?: number; sq?: number; t: number}> = ({unc, target, wob = 0, sq = 0, t}) => {
  const [c, e] = target;
  const pts: P2[] = Array.from({length: STRAW_N + 1}, (_, i) => {
    const u = i / STRAW_N, a = coilAt(u * STRAW_L), b = quad([0, 30], c, e, u);
    const sway = wob * Math.sin(t * 9 - u * 4) * 14 * u;
    const p = lp2(a, b, unc);
    // squash of the coil (a pizza pushes it): squeeze toward the mouth
    return [p[0] * (1 - 0.3 * sq) + sway, 30 + (p[1] - 30) * (1 - 0.45 * sq)];
  });
  const d = path(pts);
  const tip = pts[pts.length - 1];
  return <g>
    <path d={d} stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={TAN} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx={tip[0]} cy={tip[1]} r={5} fill={INK} />
    <ellipse cx={0} cy={30} rx={13} ry={9} fill={INK} />
  </g>;
};
/** the straw as a world-space target for a head at hw: control + end, head-local */
const strawTo = (hw: P2, c: P2, e: P2): [P2, P2] => [[c[0] - hw[0], c[1] - hw[1]], [e[0] - hw[0], e[1] - hw[1]]];
const STRAW_DOWN: [P2, P2] = [[40, 150], [150, 236]];

// ---------- the guy's face ----------
/** the head outline melting: the lower half sags into drips (d: 0 = round -> 1 = dripping) */
const DRIPS: [number, number, number][] = [[-44, 42, 15], [-12, 84, 15], [22, 60, 14], [50, 34, 11]];
const meltHeadD = (d: number) => {
  const R = HEAD_R + 1, pts: P2[] = [];
  for (let i = 0; i <= 20; i++) { const th = -Math.PI + (Math.PI * i) / 20; pts.push([R * Math.cos(th) * (1 + 0.1 * d), R * Math.sin(th)]); }
  for (let i = 1; i < 60; i++) {
    const th = (Math.PI * i) / 60, x = R * Math.cos(th) * (1 + 0.14 * d);
    let y = R * Math.sin(th) * (1 - 0.06 * d);
    for (const [xk, L, w] of DRIPS) { const u = (x - xk) / w; if (Math.abs(u) < 1) y += d * L * Math.pow(1 - u * u, 1.6); }
    pts.push([x, y]);
  }
  return 'M ' + pts.map(P).join(' L ') + ' Z';
};
type Mood = 'joy' | 'happy' | 'smug' | 'focus' | 'oof' | 'dizzy' | 'pop' | 'worry' | 'strain' | 'deadpan' | 'hope' | 'melt' | 'cross' | 'bliss';
const Mouth: React.FC<{mood: Mood; t: number}> = ({mood, t}) => {
  if (mood === 'joy') return <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  if (mood === 'happy' || mood === 'hope') return <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  if (mood === 'smug') return <path d="M -20 6 Q 0 16 22 -3" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'focus') return <path d="M -15 9 Q 0 5 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'deadpan') return <path d="M -16 8 L 16 8" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'oof' || mood === 'strain') return <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  if (mood === 'worry' || mood === 'dizzy' || mood === 'melt') return <path d={`M -18 10 q 6 ${mood === 'melt' ? -8 + 3 * Math.sin(t * 9) : -6} 12 0 t 12 0 t 12 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  return <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;   // pop
};
const Face: React.FC<{t: number; mood: Mood; uid: string; look?: number; lookY?: number; noMouth?: boolean; drip?: number}> = ({t, mood, uid, look = 0, lookY = 0, noMouth, drip = 0}) => {
  const eye = (sd: number) => {
    const ex = sd * 25, ey = -14;
    if (mood === 'joy' || mood === 'happy' || mood === 'bliss') return <path key={sd} d={`M ${ex - 13} ${ey + 4} Q ${ex} ${ey - 12} ${ex + 13} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'oof' || mood === 'strain') return <path key={sd} d={`M ${ex - sd * 12} ${ey - 10} L ${ex + sd * 10} ${ey} L ${ex - sd * 12} ${ey + 10}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = mood === 'pop' || mood === 'cross' ? 1.25 : 1;
    const lid = mood === 'smug' ? 0.45 : mood === 'focus' ? 0.38 : mood === 'deadpan' ? 0.52 : mood === 'melt' ? 0.5 : 0;
    const rx = 12 * big, ry = 15 * big;
    const px = mood === 'cross' ? -sd * 5 : look * 4, py = mood === 'cross' ? 6 : mood === 'melt' ? 5 : lookY * 4;
    return <g key={sd}>
      <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + px} cy={ey + 1 + lid * 6 + py + (mood === 'hope' ? -3 : 0)} r={6.3 * (big > 1 ? 0.85 : 1)} fill={INK} />
      <circle cx={ex + px - 1.5} cy={ey - 1 + lid * 6 + py + (mood === 'hope' ? -3 : 0)} r={2} fill="#fff" />
      {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
    </g>;
  };
  const brow = (sd: number) => {
    let d = `M ${sd * 12} -45 Q ${sd * 25} -53 ${sd * 38} -47`;
    if (mood === 'focus' || mood === 'strain' || mood === 'oof') d = `M ${sd * 10} -34 L ${sd * 37} -44`;
    else if (mood === 'worry' || mood === 'dizzy' || mood === 'hope' || mood === 'melt') d = `M ${sd * 10} -46 L ${sd * 36} -38`;
    else if (mood === 'smug') d = `M ${sd * 12} ${sd < 0 ? -40 : -46} L ${sd * 38} ${sd < 0 ? -44 : -50}`;
    else if (mood === 'pop' || mood === 'cross') d = `M ${sd * 12} -52 Q ${sd * 25} -62 ${sd * 38} -54`;
    else if (mood === 'deadpan') d = `M ${sd * 12} -38 L ${sd * 38} -38`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  return (
    <g>
      {drip > 0.01 ? <path d={meltHeadD(drip)} fill={`url(#bFace${uid})`} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        : <circle r={HEAD_R + 1} fill={`url(#bFace${uid})`} stroke={INK} strokeWidth={6.5} />}
      <g transform={drip > 0.01 ? `translate(0 ${(10 * drip).toFixed(1)}) scale(${(1 + 0.1 * drip).toFixed(3)} ${(1 + 0.25 * drip).toFixed(3)})` : undefined}>
        {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
        {noMouth ? null : <g transform="translate(0 28)"><Mouth mood={mood} t={t} /></g>}
      </g>
    </g>
  );
};

// ---------- props ----------
const Pizza: React.FC<{at: P2; a: number; s?: number}> = ({at, a, s = 1}) => (
  <g transform={`translate(${P(at)}) rotate(${a.toFixed(1)}) scale(${s})`}>
    <path d="M -122 0 L -10 -44 Q 4 0 -10 44 Z" fill={CHEESE} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    <path d="M -14 -46 Q 2 0 -14 46 L 4 52 Q 24 0 4 -52 Z" fill={CRUST} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    {[[-78, -6, 11], [-48, 16, 12], [-38, -20, 11]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={PEPP} stroke={INK} strokeWidth={4} />)}
    <path d="M -92 10 Q -88 20 -92 30" stroke="#F0B33C" strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// ---------- the guy: front view on the small IK rig (feet at 0) ----------
type GS = {x: number; y: number; rot: number; lean: number; hip: number; armA: P2; armB: P2; mood: Mood; look: number; lookY: number;
  sq: number; tilt: number; trem: number; wing: number; flap: number; crumple: number; straw: number; unc: number; target: [P2, P2];
  swob: number; coilSq: number; pizza: number; melt: number; dangle: number; hide: number};
const SHX = 38;
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; hand?: boolean}> = ({S, H, L, sd, w = 29, hand = true}) => {
  const E = ik(S, H, L, L, -sd * (H[1] < S[1] ? 1 : -1));
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
const headLocal = (g: GS): P2 => [0, -g.hip - 165];
const headWorld = (g: GS): P2 => [g.x + headLocal(g)[0], g.y + headLocal(g)[1]];
const handB = (g: GS): P2 => [g.x + SHX + g.armB[0], g.y - g.hip - 90 + g.armB[1]];
const handA = (g: GS): P2 => [g.x - SHX + g.armA[0], g.y - g.hip - 90 + g.armA[1]];
const GuyB: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  if (g.hide >= 1) return null;
  const hipY = -g.hip, shY = hipY - 112, tw = 47, headY = shY - 53;
  const jig = g.trem * 2.4 * Math.sin(t * 71);
  const SA: P2 = [-SHX, hipY - 90], SB: P2 = [SHX, hipY - 90];
  const dg = g.dangle, sw = dg * 5 * Math.sin(t * 4.4);
  const feet: P2[] = [[-27 + sw, -12 + dg * 8], [27 + sw * 0.7, -12 + dg * 4]];
  const drip = eout(clamp(g.melt / 0.5)), h = eio(clamp((g.melt - 0.5) / 0.5));      // the face drips, then the head sinks into the soup and flattens
  const headT = `translate(0 ${(headY + HEAD_R + 6 * h).toFixed(1)}) rotate(${g.tilt.toFixed(2)} 0 0) scale(${(1 + 0.12 * g.sq + 0.2 * h).toFixed(3)} ${(1 - 0.26 * g.sq - 0.48 * h).toFixed(3)}) translate(0 ${-HEAD_R})`;
  return (
    <W><g transform={`translate(${(g.x + jig).toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)})`} opacity={1 - g.hide}>
      <g transform={`rotate(${g.lean.toFixed(2)} 0 ${hipY})`}>
        {g.wing > 0.01 ? <WingPair root={[0, hipY - 92]} s={0.98 * g.wing} flap={g.flap} crumple={g.crumple} id={`gw${uid}`} /> : null}
      </g>
      {feet.map((f, i) => <Limb key={'l' + i} S={[(i ? 1 : -1) * 19, hipY + 4]} H={f} L={37} sd={i ? -1 : 1} w={30} hand={false} />)}
      {feet.map((f, i) => <ellipse key={'f' + i} cx={f[0] + (i ? 2 : -2)} cy={f[1] + 5} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} transform={dg > 0.2 ? `rotate(${(i ? 18 : -18) * dg} ${f[0]} ${f[1] + 5})` : undefined} />)}
      <g transform={`rotate(${g.lean.toFixed(2)} 0 ${hipY})`}>
        <path d={torsoD(tw, shY, hipY + 13)} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        <Limb S={SA} H={add(SA, g.armA)} L={77} sd={g.armA[1] > 0 ? 1 : -1} />
        <Limb S={SB} H={add(SB, g.armB)} L={77} sd={g.armB[1] > 0 ? -1 : 1} />
        {g.pizza === 1 ? <Pizza at={add(add(SB, g.armB), [-4, -2])} a={8} s={0.9} /> : null}
        {g.pizza === 2 ? <Pizza at={add(add(SA, g.armA), [4, -2])} a={150} s={0.9} /> : null}
        <g transform={headT}>
          <Face t={t} mood={g.mood} uid={uid} look={g.look} lookY={g.lookY} noMouth={g.straw > 0} drip={g.melt > 0 ? drip : 0} />
          {g.straw > 0 ? <Straw unc={g.unc} target={g.target} wob={g.swob} sq={g.coilSq} t={t} /> : null}
        </g>
      </g>
    </g></W>
  );
};

// ---------- the monarch (front view, wings spread), centre of the thorax at 0 ----------
type MMood = 'smug' | 'laugh' | 'look' | 'proud' | 'ew' | 'pop';
type MS = {x: number; y: number; s: number; flap: number; mood: MMood; tilt: number; shake: number; unc: number};
const Monarch: React.FC<{t: number; M: MS; uid: string}> = ({t, M, uid}) => {
  const jig = M.shake * 3 * Math.sin(t * 60);
  const ex = 12, ey = -50;
  const eyeL = (sd: number) => {
    const cx = sd * ex;
    if (M.mood === 'laugh' || M.mood === 'proud') return <path key={sd} d={`M ${cx - 8} ${ey + 3} Q ${cx} ${ey - 7} ${cx + 8} ${ey + 3}`} stroke="#FFFFFF" strokeWidth={4.5} fill="none" strokeLinecap="round" />;
    if (M.mood === 'ew') return <path key={sd} d={`M ${cx - sd * 8} ${ey - 6} L ${cx + sd * 6} ${ey} L ${cx - sd * 8} ${ey + 6}`} stroke="#FFFFFF" strokeWidth={4.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const lid = M.mood === 'smug' ? 0.48 : 0, r = M.mood === 'pop' ? 11 : 9.5;
    return <g key={sd}>
      <ellipse cx={cx} cy={ey} rx={r} ry={r * 1.15} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} />
      <circle cx={cx + (M.mood === 'look' ? -3.5 : 0)} cy={ey + 1 + lid * 5} r={4.6} fill={INK} />
      {lid ? <path d={lidPath(cx, ey, r + 0.5, r * 1.15 + 0.5, lid)} fill={MBODY} stroke={INK} strokeWidth={3} /> : null}
    </g>;
  };
  const mouth = M.mood === 'laugh' ? <path d="M -10 -32 Q 0 -30 10 -32 Q 8 -20 0 -19 Q -8 -20 -10 -32 Z" fill="#E4677A" stroke="#FFFFFF" strokeWidth={3} />
    : M.mood === 'ew' ? <path d="M -9 -28 q 3 -4 6 0 t 6 0 t 6 0" stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    : M.mood === 'pop' ? <ellipse cx={0} cy={-27} rx={5} ry={6} fill="#E4677A" stroke="#FFFFFF" strokeWidth={3} />
    : <path d="M -9 -29 Q 0 -24 10 -32" stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" />;
  // its own coiled straw under the head (unc > 0: it rolls out down-right)
  const spts: P2[] = Array.from({length: 25}, (_, i) => { const u = i / 24, s = u * 70;
    const a: P2 = s < 8 ? [0, -20 + s] : (() => { const k = (s - 8) / 62, r = lerp(9, 2, k), th = Math.PI - k * 9.5; return [9 + r * Math.cos(th), -12 + r * Math.sin(th)]; })();
    return lp2(a, quad([0, -20], [10, 20], [44, 50], u), M.unc); });
  return (
    <W><g transform={`translate(${(M.x + jig).toFixed(1)} ${M.y.toFixed(1)}) rotate(${M.tilt.toFixed(1)}) scale(${M.s})`}>
      <WingPair root={[0, -2]} s={1} flap={M.flap} id={`mw${uid}`} />
      <ellipse cx={0} cy={46} rx={13} ry={34} fill={MBODY} stroke={INK} strokeWidth={6} />
      <path d="M -10 34 H 10 M -11 50 H 11 M -9 66 H 9" stroke="#6A6A6A" strokeWidth={3} />
      <ellipse cx={0} cy={0} rx={18} ry={24} fill={MBODY} stroke={INK} strokeWidth={6} />
      {[[-7, -8], [7, -8], [-9, 6], [9, 6], [0, 14]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.6} fill="#FFFFFF" />)}
      {[-1, 1].map((sd) => <g key={sd}><path d={`M ${sd * 8} -72 Q ${sd * 16} -104 ${sd * 32} -122`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        <ellipse cx={sd * 33} cy={-124} rx={6} ry={5} fill={MBODY} stroke={INK} strokeWidth={3} /></g>)}
      <path d={path(spts)} stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(spts)} stroke={TAN} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={0} cy={-46} r={30} fill={MBODY} stroke={INK} strokeWidth={6} />
      {eyeL(-1)}{eyeL(1)}{mouth}
      <path d={M.mood === 'smug' ? 'M -20 -66 L -4 -63 M 4 -66 L 20 -70' : M.mood === 'ew' ? 'M -20 -64 L -5 -68 M 5 -68 L 20 -64' : 'M -20 -68 Q -12 -73 -4 -68 M 4 -68 Q 12 -73 20 -68'}
        stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" />
    </g></W>
  );
};

// ---------- the chrysalis (top = where its stalk meets the branch) ----------
const CHRY = 'M -60 30 C -110 40 -125 120 -122 180 C -118 280 -80 380 0 392 C 80 380 118 280 122 180 C 125 120 110 40 60 30 Z';
const CROWN: P2[] = Array.from({length: 9}, (_, i) => { const x = -96 + i * 24; return [x, 100 - 12 * (1 - (x / 96) ** 2)]; });
/** soup inside the chrysalis up to `level` (world y), clipped to its inside */
const ChrysSoup: React.FC<{t: number; level: number; uid: string; eyes?: number}> = ({t, level, uid, eyes = 0}) => {
  const lv = (level - CH_TOP) / CH_S;   // chrysalis-local
  if (lv > 392) return null;
  const wave = Array.from({length: 25}, (_, i) => { const x = -130 + i * (260 / 24); return [x, lv + 5 * Math.sin(t * 5 + i * 0.9)] as P2; });
  const top = 'M -130 400 L ' + wave.map(P).join(' L ') + ' L 130 400 Z';
  return <W><g transform={`translate(${CH_X} ${CH_TOP}) scale(${CH_S})`}>
    <clipPath id={`cs${uid}`}><path d={CHRY} /></clipPath>
    <g clipPath={`url(#cs${uid})`}>
      <path d={top} fill={SOUP} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${-90 + i * 50} ${lv + 40 + i * 50} q 30 ${-18 + 6 * Math.sin(t * 3 + i)} 60 0 t 60 0`} stroke={SOUP_DK} strokeWidth={6} fill="none" strokeLinecap="round" />)}
      <path d={'M ' + wave.map(P).join(' L ')} stroke={SOUP_HI} strokeWidth={6} fill="none" />
      <path d={'M ' + wave.map(P).join(' L ')} stroke={INK} strokeWidth={4} fill="none" transform="translate(0 -4)" />
      {[0, 1, 2, 3].map((i) => { const u = ((t * 0.9 + i * 0.27) % 1); const x = -70 + i * 45; return <circle key={'b' + i} cx={x} cy={lv + 60 - 50 * u} r={4 + 5 * u} fill="none" stroke={SOUP_HI} strokeWidth={3} opacity={1 - u} />; })}
    </g>
    {eyes > 0.01 ? [-1, 1].map((sd) => { const bob = 3 * Math.sin(t * 3 + sd), blink = (t % 2.1) < 0.12 ? 0.15 : 1;
      return <g key={sd} transform={`translate(${sd * 24} ${lv - 6 + bob}) scale(${eyes})`}>
        <ellipse cx={0} cy={0} rx={13} ry={15 * blink} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        {blink > 0.5 ? <circle cx={-sd * 2} cy={3} r={6} fill={INK} /> : null}
      </g>; }) : null}
  </g></W>;
};
const ChrysShell: React.FC<{t: number; close: number; dark: number; crack: number; split: number; uid: string}> = ({t, close, dark, crack, split, uid}) => {
  if (close < 0.01) return null;
  const yTop = 400 - close * 420;
  const fall = Math.max(0, split - 0.1);
  const half = (sd: number) => {
    const ang = sd * 40 * eout(clamp(split / 0.15)) + sd * 90 * fall, dy = 2600 * fall * fall, dx = sd * 420 * fall;
    return <g key={sd} transform={`translate(${dx.toFixed(1)} ${dy.toFixed(1)}) rotate(${ang.toFixed(1)} 0 30)`} opacity={1 - clamp(fall * 4)}>
      <clipPath id={`ch${uid}${sd}`}><rect x={sd < 0 ? -140 : 0} y={-40} width={140} height={460} /></clipPath>
      <g clipPath={`url(#ch${uid}${sd})`}>{body}</g>
    </g>;
  };
  const shellFill = dark > 0.01 ? `rgba(${Math.round(lerp(159, 52, dark))},${Math.round(lerp(221, 60, dark))},${Math.round(lerp(181, 55, dark))},${lerp(0.36, 0.62, dark).toFixed(2)})` : 'rgba(159,221,181,0.36)';
  const body = <g>
    <path d={CHRY} fill={shellFill} />
    {dark > 0.01 && split < 0.001 ? <g opacity={dark}>
      {[-1, 1].map((sd) => <g key={sd} transform={`translate(${sd * 6} 96) scale(${sd} 1) rotate(102) scale(1.02 0.86)`}><path d={FORE} fill={ORANGE} opacity={0.85} />
        {FORE_V.slice(0, 4).map((v, i) => <path key={i} d={v} stroke={INK} strokeWidth={9} fill="none" opacity={0.7} />)}
        <path d={FORE} fill="none" stroke={INK} strokeWidth={14} opacity={0.6} /></g>)}
    </g> : null}
    <path d="M -86 70 Q -104 160 -90 250" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.7} />
    <path d={`M -112 ${CROWN[0][1] + 6} Q 0 ${CROWN[4][1] - 26} 112 ${CROWN[8][1] + 6}`} stroke={JADE_DK} strokeWidth={6} fill="none" opacity={1 - 0.6 * dark} />
    {CROWN.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill={DOT} stroke={INK} strokeWidth={3} />)}
    {[[-30, 344], [0, 356], [30, 344]].map(([x, y], i) => <circle key={'d' + i} cx={x} cy={y} r={6} fill={DOT} stroke={INK} strokeWidth={3} />)}
    <path d={CHRY} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {crack > 0.01 ? <path d="M 0 36 L -10 90 L 12 140 L -8 200 L 10 260 L -6 320 L 0 392" stroke="#FFFFFF" strokeWidth={8} fill="none" strokeLinejoin="round"
      strokeDasharray={`${(420 * crack).toFixed(0)} 999`} /> : null}
    {crack > 0.01 ? <path d="M 0 36 L -10 90 L 12 140 L -8 200 L 10 260 L -6 320 L 0 392" stroke={INK} strokeWidth={4} fill="none" strokeLinejoin="round"
      strokeDasharray={`${(420 * crack).toFixed(0)} 999`} /> : null}
  </g>;
  return <W><g transform={`translate(${CH_X} ${CH_TOP}) scale(${CH_S})`}>
    <path d="M 0 -14 L 0 34" stroke={INK} strokeWidth={10} strokeLinecap="round" />
    <clipPath id={`cc${uid}`}><rect x={-160} y={yTop} width={320} height={460} /></clipPath>
    <g clipPath={`url(#cc${uid})`}>{split > 0.001 ? [half(-1), half(1)] : body}</g>
    {close < 0.999 ? <path d={`M -130 ${yTop} q 16 -10 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0 t 32 0`} stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" /> : null}
  </g></W>;
};

// ---------- the meadow ----------
const Daisy: React.FC<{x: number; h: number; s: number; pink?: boolean}> = ({x, h, s, pink}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d={`M 0 0 Q 6 ${-h / 2} 0 ${-h}`} stroke={INK} strokeWidth={11} fill="none" strokeLinecap="round" />
    <path d={`M 0 0 Q 6 ${-h / 2} 0 ${-h}`} stroke={LEAF} strokeWidth={5} fill="none" strokeLinecap="round" />
    <path d={`M 3 ${-h * 0.4} q 26 -18 34 -2 q -18 14 -34 2 Z`} fill={LEAF} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {pink ? <g transform={`translate(0 ${-h})`}>{[[-16, -6], [0, -16], [16, -6], [-9, 8], [9, 8], [0, -2]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={11} fill="#F59BC2" stroke={INK} strokeWidth={4} />)}</g>
      : <g transform={`translate(0 ${-h})`}>{Array.from({length: 8}, (_, i) => <ellipse key={i} cx={0} cy={-19} rx={8} ry={15} transform={`rotate(${i * 45})`} fill="#FFFFFF" stroke={INK} strokeWidth={4} />)}
        <circle r={12} fill={GOLD} stroke={INK} strokeWidth={4} /></g>}
  </g>
);
const FLOWERS: [number, number, number, boolean][] = Array.from({length: 34}, (_, i) => [-1300 + i * 92 + Math.round(rnd(i) * 40), 60 + Math.round(rnd(i + 9) * 110), 0.9 + rnd(i + 3) * 0.35, i % 3 === 1]);
const Branch: React.FC = () => (
  <g>
    <path d="M -1400 -540 C -900 -520 -400 -470 -60 -478 C 30 -480 90 -482 120 -488 L 122 -470 C 90 -462 30 -458 -60 -456 C -400 -448 -900 -496 -1400 -512 Z" fill={BARK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -700 -500 Q -500 -486 -320 -478" stroke={BARK_DK} strokeWidth={5} fill="none" strokeLinecap="round" />
    {[[-520, -484, -30], [-300, -470, 20], [-140, -470, -20], [70, -478, 25]].map(([x, y, a], i) =>
      <path key={i} d="M 0 0 q 30 -40 70 -36 q -10 40 -70 36 Z" transform={`translate(${x} ${y}) rotate(${a})`} fill={LEAF} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
  </g>
);
const Stump: React.FC = () => (
  <g>
    <path d={`M ${STUMP_X - 72} 2 L ${STUMP_X - 66} ${STUMP_TOP} L ${STUMP_X + 66} ${STUMP_TOP} L ${STUMP_X + 72} 2 Z`} fill={BARK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <ellipse cx={STUMP_X} cy={STUMP_TOP} rx={66} ry={16} fill="#E2C08E" stroke={INK} strokeWidth={6} />
    <ellipse cx={STUMP_X} cy={STUMP_TOP} rx={36} ry={8} fill="none" stroke={BARK_DK} strokeWidth={4} />
  </g>
);
/** the blender on the stump; fill = how full, mix = 0 clear -> 1 blended pizza, spin = whirr phase, shake */
const JUG_B = STUMP_TOP - 58, JUG_T = JUG_B - 150;
const Blender: React.FC<{t: number; fill: number; mix: number; spin: number; shake: number; uid: string}> = ({t, fill, mix, spin, shake: sk}) => {
  const jx = STUMP_X + sk * 3 * Math.sin(t * 70);
  const jug = `M ${jx - 44} ${JUG_B} L ${jx - 58} ${JUG_T} L ${jx + 58} ${JUG_T} L ${jx + 44} ${JUG_B} Z`;
  const lvl = lerp(JUG_B, JUG_T + 20, fill);
  const wl = (y: number) => 44 + (58 - 44) * ((JUG_B - y) / (JUG_B - JUG_T));
  const col = mix > 0.5 ? '#EE7A3C' : '#FFE9A8';
  return <g>
    <rect x={jx - 56} y={STUMP_TOP - 60} width={112} height={60} rx={14} fill="#AEB9C4" stroke={INK} strokeWidth={6} />
    <circle cx={jx} cy={STUMP_TOP - 30} r={12} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
    <path d={`M ${jx} ${STUMP_TOP - 30} L ${(jx + 9 * Math.cos(spin * 2)).toFixed(1)} ${(STUMP_TOP - 30 + 9 * Math.sin(spin * 2)).toFixed(1)}`} stroke={INK} strokeWidth={4} />
    <path d={jug} fill="#EAF6FF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {fill > 0.01 ? <path d={`M ${jx - 44} ${JUG_B - 3} L ${jx - wl(lvl) + 3} ${lvl} L ${jx + wl(lvl) - 3} ${lvl} L ${jx + 44} ${JUG_B - 3} Z`} fill={col} /> : null}
    {fill > 0.01 && mix > 0.5 && spin !== 0 ? [0, 1, 2].map((i) => <path key={i} d={`M ${jx - 30} ${lerp(lvl, JUG_B, 0.3 + i * 0.22)} q 30 ${12 * Math.sin(spin * 3 + i)} 60 0`} stroke="#C9552A" strokeWidth={5} fill="none" strokeLinecap="round" />) : null}
    <path d={`M ${jx + 30} ${JUG_T + 16} L ${jx + 20} ${JUG_B - 12}`} stroke="#FFFFFF" strokeWidth={8} strokeLinecap="round" opacity={0.8} />
    <path d={jug} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g>;
};

// ---------- screen-space panels ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 450}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: FONT_W, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
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
const Counter: React.FC<{left: number; top: number; value: number; label: string; s: number; red?: boolean; rot?: number}> = ({left, top, value, label, s, red, rot = 4}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s.toFixed(3)})`,
    background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 26px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: FONT_W, fontSize: 108, lineHeight: 1, color: red ? RED : INK}}>{fmt(value)}</div>
    <div style={{fontWeight: FONT_W, fontSize: 36}}>{label}</div>
  </div>
) : null;

// ---------- X-RAY: CHRYSALIS - a caterpillar dissolves into soup; a few clumps of cells survive and build a butterfly ----------
const XC = 'translate(0 -282) scale(1.42)';
const CAT_N = 12;
const catPt = (i: number): P2 => { const a = rad(lerp(206, 480, i / (CAT_N - 1))); return [118 * Math.cos(a) * 0.78, 34 + 118 * Math.sin(a)]; };
const DISCS: ['wing' | 'eye' | 'leg', number, number, number][] = [
  ['wing', -72, -46, 7.64], ['wing', 72, -46, 7.7], ['wing', -60, 66, 7.78], ['wing', 60, 66, 7.84],
  ['eye', -24, -154, 7.94], ['eye', 24, -154, 7.98], ['leg', -26, 8, 8.06], ['leg', 0, 34, 8.1], ['leg', 26, 8, 8.14]];
const ChrysXRay: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const k = seg(t, DIG0, DIG1), g = eio(seg(t, BUILD0, BUILD1));
  const level = t < BUILD0 ? lerp(300, -160, eout(k)) : lerp(-160, 120, g);
  const zoom = t >= S4 && t < S4B ? 1.24 : 1, zy = t >= S4 && t < S4B ? 14 : 0;
  const glow = 0.45 + 0.25 * Math.sin(t * 9);
  const bubbles = Array.from({length: 18}, (_, i) => {
    const t0 = DIG0 - 0.1 + rnd(i) * 1.45, u = (t - t0) / 0.55;
    if (u < 0 || u > 1) return null;
    const x = -110 + 220 * rnd(i + 7), y = 200 - 320 * rnd(i + 3) - 70 * u, r = 6 + 9 * rnd(i + 11);
    return <circle key={i} cx={x} cy={y} r={r * (0.6 + 0.4 * u)} fill="#FFFFFF" fillOpacity={0.5} stroke="#FFFFFF" strokeWidth={3} opacity={1 - u * u} />;
  });
  const wave = Array.from({length: 21}, (_, i) => [-180 + i * 18, level + 6 * Math.sin(t * 6 + i)] as P2);
  return (
    <div style={{position: 'absolute', left: 540, top: 1070, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s.toFixed(3)})`}}>
      <XFrame id={`xc${uid}`} R={340}>
        <g transform={`scale(${zoom}) translate(0 ${zy})`}>
          <clipPath id={`xi${uid}`}><path d={CHRY} transform={XC} /></clipPath>
          <path d={CHRY} transform={XC} fill={XBODY} opacity={0.3} />
          <g clipPath={`url(#xi${uid})`}>
            {/* the caterpillar (curled), segments dissolve one after another */}
            {k < 1 ? Array.from({length: CAT_N}, (_, i) => {
              const ki = clamp((k - (CAT_N - 1 - i) * 0.03) * 1.7), p = catPt(i), head = i === CAT_N - 1;
              const r = (head ? 38 : 31) * (1 - 0.55 * ki) * (1 + 0.07 * Math.sin(t * 30 + i) * (ki > 0 ? 1 : 0));
              const col = head ? INK : [YEL, INK, '#FFFFFF', INK][i % 4];
              return <g key={i} transform={`translate(${P([p[0], p[1] + 90 * ki])})`} opacity={1 - ki}>
                <circle r={r} fill={col} stroke={INK} strokeWidth={5} />
                {head ? <g><circle cx={-12} cy={-6} r={8} fill="#FFFFFF" /><circle cx={12} cy={-6} r={8} fill="#FFFFFF" /><circle cx={-11} cy={-5} r={4} fill={INK} /><circle cx={13} cy={-5} r={4} fill={INK} />
                  <path d={k > 0.05 ? 'M -8 14 q 4 -5 8 0 t 8 0' : 'M -8 12 Q 0 18 8 12'} stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" /></g> : null}
              </g>;
            }) : null}
            {/* soup */}
            <path d={'M -200 400 L ' + wave.map(P).join(' L ') + ' L 200 400 Z'} fill={SOUP} opacity={0.92} />
            {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-120 + (i % 2) * 60} ${level + 50 + i * 55} q 40 ${-16 + 8 * Math.sin(t * 3 + i)} 80 0 t 80 0`} stroke={SOUP_DK} strokeWidth={7} fill="none" strokeLinecap="round" />)}
            <path d={'M ' + wave.map(P).join(' L ')} stroke={SOUP_HI} strokeWidth={7} fill="none" />
            {bubbles}
            {/* the surviving clumps of cells */}
            {DISCS.map(([kind, x, y, at], i) => {
              const sp = popIn(t, at, 0.25) * (1 - g);
              if (sp < 0.01) return null;
              const r = kind === 'wing' ? 14 : 10;
              return <g key={'d' + i} transform={`translate(${x} ${y}) scale(${sp.toFixed(3)})`}>
                <circle r={r + 18} fill={GOLD} opacity={glow * 0.6} />
                <circle r={r} fill="#FFF4B8" stroke={INK} strokeWidth={4} />
              </g>;
            })}
            {/* they build a butterfly */}
            {g > 0.01 ? <g>
              <WingPair root={[0, -40]} s={lerp(0.06, 0.6, g)} flap={0.85} id={`xw${uid}`} />
              <ellipse cx={0} cy={-10} rx={16 * g} ry={lerp(10, 90, g)} fill={INK} />
              <circle cx={0} cy={-110} r={lerp(6, 30, g)} fill={INK} />
              {[-1, 1].map((sd) => <circle key={sd} cx={sd * 12 * g} cy={-114} r={7 * g} fill="#FFFFFF" />)}
              {[-1, 1].map((sd) => [0, 1, 2].map((j) => <path key={`${sd}${j}`} d={`M ${sd * 12} ${-30 + j * 26} l ${sd * 40 * g} ${18 * g}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />))}
            </g> : null}
          </g>
          <path d={CHRY} transform={XC} fill="none" stroke="#DCE9FA" strokeWidth={4} />
        </g>
      </XFrame>
      <Card text="X-RAY: CHRYSALIS" top={86} size={48} rot={-2} />
      <Card text="DIGESTS ITSELF" top={790} left={450} color={RED} fg="#fff" rot={3} s={popIn(t, T.digests, 0.28) * (1 - seg(t, S4 - 0.12, S4))} size={52} />
      <Card text="WINGS" top={430} left={760} color={GOLD} rot={5} s={popIn(t, 8.42, 0.26) * (1 - seg(t, S4B - 0.12, S4B))} size={50} />
      <Card text="LEGS" top={560} left={150} color={GOLD} rot={-5} s={popIn(t, 8.62, 0.26) * (1 - seg(t, S4B - 0.12, S4B))} size={50} />
      <Card text="EYES" top={200} left={250} color={GOLD} rot={-4} s={popIn(t, 8.82, 0.26) * (1 - seg(t, S4B - 0.12, S4B))} size={50} />
      <Card text="SURVIVORS" top={790} left={450} color="#fff" rot={-3} s={popIn(t, T.survive, 0.28) * (1 - seg(t, S4B - 0.12, S4B))} size={52} />
      <Card text="NEW WINGS" top={790} left={450} color={GOLD} rot={3} s={popIn(t, T.wings - 0.05, 0.28)} size={52} />
    </div>
  );
};

// ---------- the story over time ----------
const base = (): GS => ({x: CH_X, y: IN_Y, rot: 0, lean: 0, hip: 70, armA: [-24, 132], armB: [24, 132], mood: 'smug', look: 0, lookY: 0,
  sq: 0, tilt: 0, trem: 0, wing: 0, flap: 0, crumple: 0, straw: 0, unc: 0, target: STRAW_DOWN, swob: 0, coilSq: 0, pizza: 0, melt: 0, dangle: 0, hide: 0});
const flapAt = (t: number, hz: number, lo = 0, hi = 1) => lerp(lo, hi, 0.5 - 0.5 * Math.cos(2 * Math.PI * hz * t));
const guyAt = (t: number): GS => {
  const g = base();
  if (t < S2) {   // frame 0: flying on monarch wings, arms out, joy
    g.x = FLY_X; g.y = -112 + 9 * Math.sin(t * 2 * Math.PI * 0.8); g.wing = 1; g.flap = flapAt(t, 2.3); g.dangle = 1;
    g.armA = [-118, 18 + 14 * Math.sin(t * 2 * Math.PI * 2.3)]; g.armB = [118, 18 + 14 * Math.sin(t * 2 * Math.PI * 2.3)];
    g.mood = t < 0.9 ? 'joy' : 'happy'; g.lean = 3 * Math.sin(t * 3);
    return g;
  }
  if (t < S2B) {   // the chrysalis zips up around him: wings fold away, arms pressed in
    g.wing = 1 - eio(seg(t, S2, S2 + 0.32)); g.flap = 0.9;
    const k = eout(seg(t, S2, S2 + 0.2)); g.armA = lp2([-60, 0], [-12, 128], k); g.armB = lp2([60, 0], [12, 128], k);
    g.mood = t < 1.72 ? 'pop' : 'worry'; g.look = t > 1.8 ? 1 : 0;
    return g;
  }
  if (t < S3) {   // close-up: he melts into the soup
    g.armA = [-12, 128]; g.armB = [12, 128];
    g.melt = eio(seg(t, MELT0, MELT1)); g.mood = t < MELT0 + 0.05 ? 'worry' : 'melt'; g.trem = t < MELT0 ? 0.4 : 0;
    g.hide = seg(t, MELT1, MELT1 + 0.25);
    return g;
  }
  if (t < S5) { g.hide = 1; return g; }   // behind the X-ray: only the soup + his floating eyes show
  if (t < S6) {   // the dark chrysalis cracks; he pops out; his crumpled wings pump open: TA-DA
    if (t < SPLIT) { g.hide = 1; return g; }
    const u = t - SPLIT;
    g.y = lerp(IN_Y, HOV_Y, eout(clamp(u / 0.2))); g.sq = Math.max(0, Math.exp(-7 * u) * Math.cos(u * 24)) * 0.7; g.wing = 1;
    g.crumple = 1 - eio(seg(t, PUMP0, PUMP1)); g.flap = t < PUMP1 ? 0.75 : flapAt(t - PUMP1, 2.2, 0.15, 0.7); g.dangle = 0.6;
    if (t < PUMP0) { g.mood = 'pop'; g.armA = [-40, 90]; g.armB = [40, 90]; }
    else if (t < PUMP1) { g.mood = 'strain'; g.trem = 0.6; g.armA = [-34, 100]; g.armB = [34, 100]; }
    else { const k = eout(seg(t, PUMP1, PUMP1 + 0.14)); g.mood = 'joy'; g.armA = lp2([-34, 100], [-84, -70], k); g.armB = lp2([34, 100], [84, -70], k); }
    return g;
  }
  // from here on: hovering, wings half up, the straw mouth
  g.y = HOV_Y + 6 * Math.sin(t * 2 * Math.PI * 0.7); g.wing = 1; g.flap = flapAt(t, 1.6, 0.2, 0.65); g.dangle = 0.6; g.straw = 1;
  if (t < S7) {   // close-up: the straw BOINGs out and rolls back in
    g.unc = t < REC0 ? eout(seg(t, UNC0, UNC1)) : 1 - eio(seg(t, REC0, REC1)); g.swob = t > UNC1 && t < REC0 ? Math.exp(-3 * (t - UNC1)) : 0;
    g.mood = t < UNC0 ? 'hope' : t < UNC1 + 0.1 ? 'pop' : 'cross'; g.armA = [-26, 128]; g.armB = [26, 128];
    return g;
  }
  if (t < S8) {   // a pizza slice: BOING off the coiled straw
    g.pizza = 1;
    const k = t < BONK ? eio(seg(t, PUSH0, BONK)) : Math.max(0, 1 - eout(seg(t, BONK, BONK + 0.2)) * 0.7 - 0.3 * seg(t, BONK + 0.2, BONK + 0.5));
    g.armB = lp2([132, 2], [104, -12], k); g.armA = [-26, 128];
    g.coilSq = t > BONK - 0.05 ? Math.max(0, Math.exp(-6 * (t - BONK)) * Math.cos((t - BONK) * 30)) * 0.8 : 0;
    g.mood = t < BONK ? 'hope' : t < BONK + 0.25 ? 'pop' : 'deadpan'; g.tilt = t > BONK ? -6 * Math.exp(-4 * (t - BONK)) : 0;
    return g;
  }
  // tosses the pizza into the blender, slurps it through the straw, flies off
  g.x = 70;
  if (t < TOSS1) { const k = eout(seg(t, TOSS0, TOSS1)); g.armA = lp2([-50, 40], [-86, -60], k); g.pizza = t < TOSS0 ? 2 : 0; g.mood = 'focus'; }
  else { g.armA = lp2([-86, -60], [-26, 128], eout(seg(t, TOSS1, TOSS1 + 0.3))); g.mood = 'hope'; }
  const hw = headWorld(g);
  g.target = strawTo(hw, [hw[0] - 120, JUG_T - 120], [STUMP_X + 6, JUG_B - 40]);
  g.unc = eout(seg(t, DIP0, DIP1)); g.lean = -6 * g.unc;
  if (t > SLURP0) { g.mood = 'bliss'; g.swob = 0.15; }
  if (t > LIFT) { const u = t - LIFT; g.unc = 1 - eout(clamp(u / 0.2)); g.y -= 900 * u * u + 120 * u; g.flap = flapAt(u, 3.6); g.mood = 'joy'; g.lean = 0; }
  return g;
};
const monAt = (t: number): MS => {
  const M: MS = {x: FLY_X + 128, y: -198, s: 0.56, flap: flapAt(t + 0.15, 3.1), mood: 'smug', tilt: -8, shake: 0, unc: 0};
  M.y += 10 * Math.sin(t * 2 * Math.PI * 1.1);
  if (t < S2) return M;
  if (t < S2B) { M.x = 150; M.y = -330 + 8 * Math.sin(t * 7); M.mood = t < 1.75 ? 'look' : 'pop'; M.tilt = -4; return M; }
  if (t < S3) { M.x = 128; M.y = -140; M.s = 0.6; M.mood = t > MELT0 + 0.2 ? 'laugh' : 'look'; M.shake = t > MELT0 + 0.2 ? 1 : 0; M.tilt = -12; return M; }
  if (t < S5) { M.x = 230; M.y = -560; M.mood = t > DIG0 && t < S4 ? 'ew' : 'smug'; return M; }
  if (t < S6) { M.x = 160; M.y = -360; M.mood = t > PUMP1 ? 'proud' : 'look'; return M; }
  if (t < S7) { M.x = 132; M.y = -372; M.s = 0.5; M.unc = t < REC0 ? eout(seg(t, UNC0 + 0.05, UNC1 + 0.05)) : 1 - eio(seg(t, REC0, REC1)); M.mood = 'smug'; M.tilt = -10; return M; }
  if (t < S8) { M.x = 150; M.y = -400; M.mood = t > BONK + 0.05 ? 'laugh' : 'look'; M.shake = t > BONK + 0.05 ? 1 : 0; return M; }
  M.x = STUMP_X + 20; M.y = -470; M.mood = t > SLURP0 ? 'laugh' : 'look'; M.shake = t > SLURP0 ? 1 : 0;
  return M;
};

// ---------- camera (piecewise, hard cuts) ----------
const CAM0 = {x: FLY_X + 10, y: -292, k: 2.62};
const camFor = (t: number): {x: number; y: number; k: number} => {
  if (t < S2) { const u = eio(seg(t, 0, S2)); return {x: lerp(CAM0.x, FLY_X + 14, u), y: lerp(CAM0.y, -300, u), k: lerp(CAM0.k, 2.8, u)}; }
  if (t < S2B) { const u = eio(seg(t, S2, S2B)); return {x: lerp(14, 10, u), y: lerp(-262, -270, u), k: lerp(2.35, 2.45, u)}; }
  if (t < S3) { const u = eio(seg(t, S2B, S3)); return {x: lerp(8, 6, u), y: lerp(-292, -286, u), k: lerp(3.74, 3.88, u)}; }
  if (t < S5) { const u = seg(t, S3, S5); return {x: lerp(40, 60, u), y: -262, k: 2.2}; }
  if (t < S6) { const u = eio(seg(t, S5, S6)); return {x: lerp(14, 10, u), y: lerp(-262, -258, u), k: lerp(2.4, 2.52, u)}; }
  if (t < S7) { const u = eio(seg(t, S6, S7)); return {x: lerp(44, 40, u), y: lerp(-236, -232, u), k: lerp(3.35, 3.45, u)}; }
  if (t < S8) { const u = eio(seg(t, S7, S8)); return {x: lerp(34, 30, u), y: lerp(-272, -268, u), k: lerp(3.05, 3.12, u)}; }
  const u = eio(seg(t, S8, PUSH));
  return {x: lerp(-24, -20, u), y: lerp(-212, -230, u), k: lerp(2.42, 2.36, u)};
};

export const BflyScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t), M = monAt(t);
  if (thumb) { g.flap = 0; g.mood = 'joy'; M.flap = 0.1; M.mood = 'smug'; M.x += 40; M.y += 52; }   // thumbnails: the monarch clear of his face
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 4, 7) + hit(t, MELT0 + 0.12, 9, 6) + hit(t, CRACK, 5, 8) + hit(t, SPLIT, 10, 6) + hit(t, BONK, 9, 6) + hit(t, WHIR0, 3, 2) + hit(t, LIFT, 5, 5));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  // the chrysalis: zips shut (S2), soup + melt (S2B - S5), dark with wings inside (S5), cracks, splits
  const close = t < S2 ? 0 : t < S5 ? eout(seg(t, S2, S2 + 0.42)) : t < SPLIT + 1.2 ? 1 : 0;
  const dark = t >= S5 ? 1 : 0, crack = t >= S5 ? eout(seg(t, CRACK - 0.05, CRACK + 0.18)) : 0, split = t >= SPLIT ? seg(t, SPLIT, SPLIT + 0.55) : 0;
  const soupLv = t < S2B ? 99 : t < S5 ? (t < 2.74 ? lerp(IN_Y - 10, -200, eout(seg(t, S2B + 0.05, 2.74))) : lerp(-200, -262, eio(seg(t, 2.74, MELT1)))) : 99;
  // the tossed pizza (S8)
  const pz = t >= TOSS0 && t < TOSS1 + 0.02 ? (() => { const u = seg(t, TOSS0, TOSS1), a = handA({...g, armA: [-50, 40]}), b: P2 = [STUMP_X, JUG_T + 10];
    return {p: [lerp(a[0], b[0], u), lerp(a[1], b[1], u) - 160 * Math.sin(Math.PI * u)] as P2, a: 196 + 400 * u}; })() : null;
  const bl = {fill: t < TOSS1 ? 0.3 : t < SLURP0 ? 0.62 : lerp(0.62, 0.08, eio(seg(t, SLURP0, SLURP1))), mix: t > WHIR0 + 0.2 ? 1 : 0,
    spin: t > WHIR0 && t < WHIR1 ? (t - WHIR0) * 40 : 0, shake: t > WHIR0 && t < WHIR1 ? 1 : 0};
  const hw = headWorld(g);
  const st = {
    zip: popIn(t, S2 + 0.1, 0.22) * (1 - seg(t, S2B - 0.1, S2B)),
    splorch: popIn(t, MELT0 + 0.14, 0.22) * (1 - seg(t, 3.0, 3.12)),
    crack: popIn(t, CRACK, 0.2) * (1 - seg(t, SPLIT - 0.1, SPLIT)),
    tada: popIn(t, PUMP1 + 0.02, 0.24) * (1 - seg(t, S6 - 0.12, S6)),
    boing: popIn(t, UNC0 + 0.04, 0.2) * (1 - seg(t, 13.95, 14.08)),
    bonk: popIn(t, BONK, 0.2) * (1 - seg(t, BONK + 0.45, BONK + 0.58)),
    whirr: popIn(t, WHIR0 + 0.04, 0.22) * (1 - seg(t, WHIR1 - 0.1, WHIR1)),
    slurp: popIn(t, SLURP0, 0.22) * (1 - seg(t, PUSH - 0.15, PUSH)),
  };
  const showGuy = !(t >= S3 && t < S5);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`bFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Sky />
      <Layer cam={cam} z={2600}><W><g>
        {[-1700, -500, 700, 1900, 3100].map((x, i) => <path key={i} d={`M ${x - 760} -8 Q ${x} ${-380 - (i % 2) * 90} ${x + 760} -8 Z`} fill={i % 2 ? HILL_DK : HILL} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}
        <circle cx={980} cy={-640} r={86} fill="#FFE8A0" stroke={INK} strokeWidth={6} />
        <rect x={-6000} y={-10} width={12000} height={4000} fill={GRASS} />
        <path d="M -6000 -10 H 6000" stroke={INK} strokeWidth={6} />
      </g></W></Layer>
      <Layer cam={cam} z={1000}><W><g>
        <rect x={-4000} y={0} width={8000} height={3000} fill={GRASS} />
        <path d="M -4000 0 H 4000" stroke={INK} strokeWidth={6} />
        {Array.from({length: 30}, (_, i) => { const x = -1400 + i * 100 + ((i * 47) % 60); return <path key={i} d={`M ${x} ${36 + (i % 3) * 24} l 8 -20 l 6 16 l 8 -22 l 6 24`} stroke={GRASS_DK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />; })}
        {FLOWERS.map(([x, h, s, pink], i) => <Daisy key={i} x={x} h={h} s={s} pink={pink} />)}
        <Branch />
        {t >= S8 ? <Stump /> : null}
      </g></W></Layer>
      <Layer cam={cam} z={1000}>
        {t >= S8 ? <W><Blender t={t} fill={bl.fill} mix={bl.mix} spin={bl.spin} shake={bl.shake} uid={uid} /></W> : null}
        {showGuy ? <GuyB t={t} g={g} uid={uid} /> : null}
        {pz ? <W><Pizza at={pz.p} a={pz.a} s={0.9} /></W> : null}
        {t > TOSS1 && t < TOSS1 + 0.6 ? <Puffs t={t} born={TOSS1} x={STUMP_X} y={JUG_T - 10} n={5} life={0.45} size={16} vy={-90} color="#FFE9A8" seed={5} /> : null}
        {t > SPLIT && t < SPLIT + 0.7 ? <Puffs t={t} born={SPLIT} x={CH_X} y={-120} n={6} life={0.36} size={26} vy={-60} color="#FFFFFF" seed={3} /> : null}
      </Layer>
      {/* see-through things: soup + the chrysalis shell (no paper edge) */}
      <Layer cam={cam} z={1000} paper={false}>
        {t >= S2B && t < S5 ? <ChrysSoup t={t} level={soupLv} uid={uid} eyes={t > MELT1 - 0.1 ? popIn(t, MELT1 - 0.1, 0.3) : 0} /> : null}
        <ChrysShell t={t} close={close} dark={dark} crack={crack} split={split} uid={uid} />
      </Layer>
      <Layer cam={cam} z={1000}><Monarch t={t} M={M} uid={uid} /></Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={CH_X + 110} y={-470 + 60} s={st.zip} text="ZIP" size={46} rot={8} fill={GOLD} />
        <Txt x={CH_X - 66} y={-388} s={st.splorch} text="SPLORCH" size={30} rot={-8} fill="#FFFFFF" />
        <Txt x={CH_X + 120} y={-420} s={st.crack} text="CRACK" size={46} rot={8} fill="#FFFFFF" />
        <Txt x={CH_X - 60} y={-420} s={st.tada} text="TA-DA" size={60} rot={-8} fill={GOLD} />
        <Txt x={hw[0] + 96} y={hw[1] + 40} s={st.boing} text="BOING" size={36} rot={8} fill="#FFFFFF" />
        <Txt x={hw[0] + 70} y={hw[1] - 90} s={st.bonk} text="BOING" size={40} rot={-8} fill="#FFFFFF" />
        <Txt x={STUMP_X - 10} y={JUG_T - 70} s={st.whirr} text="WHIRR" size={40} rot={-6} fill={GOLD} />
        <Txt x={STUMP_X + 120} y={JUG_T - 150} s={st.slurp} text="SLURP" size={44} rot={7} fill="#FFFFFF" />
      </Layer>}
      {thumb ? null : <>
        <Card text="SOUP" top={1430} left={540} color={RED} fg="#fff" rot={-4} s={popIn(t, T.soup - 0.03, 0.3) * (1 - seg(t, S3 - 0.14, S3)) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - T.soup - 0.2) * 6))} size={96} />
        <Card text="STRAW" top={1400} left={300} color={GOLD} rot={4} s={popIn(t, T.straw, 0.28) * (1 - seg(t, S7 - 0.14, S7))} size={84} />
        <Card text="NO CHEWING" top={1440} left={500} color={RED} fg="#fff" rot={-3} s={popIn(t, T.chewing - 0.03, 0.3) * (1 - seg(t, S8 - 0.14, S8))} size={72} />
        <Counter left={850} top={1390} value={Math.floor(seg(t, DAY0, DAY1) * 14 + 0.0001)} label="DAYS" rot={4}
          s={popIn(t, DAY0 - 0.15, 0.3) * (1 - seg(t, 12.15, 12.3)) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - DAY1) * 5))} />
        <Counter left={250} top={560} value={32 - Math.floor(seg(t, TEETH0, TEETH1) * 32 + 0.0001)} label="YOUR TEETH" rot={-4} red={t > TEETH1 - 0.02}
          s={popIn(t, TEETH0 - 0.12, 0.28) * (1 - seg(t, S8 - 0.14, S8)) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - TEETH1) * 5))} />
      </>}
      <ChrysXRay t={t} s={popIn(t, S3 + 0.03, 0.35) * (1 - seg(t, S5 - 0.14, S5)) * (t >= S3 ? 1 : 0)} uid={uid} />
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you could turn into a butterfly??" handle="@flutter_doodle" likes="3.1K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.chewing - 0.05} until={PUSH - 0.4} text="Would you still do it?" />
      </>}
    </AbsoluteFill>
  );
};

export const BflyVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const flaps = (t0: number, t1: number, hz: number, db: number): Cue[] => { const out: Cue[] = []; for (let x = t0; x < t1; x += 1 / hz) out.push({f: 'flap.wav', at: x, db}); return out; };
  const cues: Cue[] = [
    // frame 0: flying - whoosh + wing flaps
    {f: 'whoosh.wav', at: 0, db: -15, from: 0.12}, ...flaps(0, S2 - 0.1, 2.3, -17), {f: 'whisper_whoosh.wav', at: 0.05, db: -26},
    // the chrysalis zips shut
    {f: 'whoosh.wav', at: S2 - 0.03, db: -24}, {f: 'stretch.wav', at: S2 + 0.02, db: -15, to: 0.6}, {f: 'pop.wav', at: WRAP1, db: -19},
    // close-up: SPLORCH - he melts
    {f: 'squelch.wav', at: MELT0 + 0.1, db: -3}, {f: 'thud.wav', at: MELT0 + 0.1, db: -13}, {f: 'bubbles.wav', at: MELT0 + 0.35, db: -14},
    {f: 'bubbles.wav', at: 2.95, db: -18}, {f: 'giggle.mp3', at: MELT0 + 0.3, db: -26, to: 0.7}, {f: 'pop.wav', at: T.soup, db: -20}, {f: 'crowd_laugh.wav', at: 2.75, db: -30, to: 0.8},
    // X-RAY: the caterpillar dissolves
    {f: 'zap.wav', at: S3, db: -24}, {f: 'pop.wav', at: S3 + 0.05, db: -24},
    {f: 'bubbles.wav', at: DIG0, db: -15}, {f: 'bubbles.wav', at: DIG0 + 0.45, db: -17}, {f: 'squelch.wav', at: DIG0 + 0.7, db: -19}, {f: 'bubbles.wav', at: DIG0 + 0.95, db: -18},
    {f: 'pop.wav', at: T.digests, db: -22},
    // the surviving clumps, the days, the new wings
    {f: 'whoosh.wav', at: S4 - 0.02, db: -30}, {f: 'shimmer.wav', at: 7.62, db: -19}, {f: 'pop.wav', at: 8.42, db: -24}, {f: 'pop.wav', at: 8.62, db: -24}, {f: 'pop.wav', at: 8.82, db: -24},
    {f: 'pop.wav', at: T.survive, db: -22}, ...ticks(DAY0, DAY1, 14, -31), {f: 'ding.mp3', at: DAY1 + 0.02, db: -20},
    {f: 'whoosh.wav', at: S4B - 0.02, db: -30}, {f: 'stretch.wav', at: BUILD0, db: -18, to: 0.8}, {f: 'shimmer.wav', at: T.wings, db: -22},
    ...ctaCues(T.cta),
    // out of the chrysalis
    {f: 'whoosh.wav', at: S5 - 0.02, db: -28}, {f: 'crack.wav', at: CRACK - 0.3, db: -12}, {f: 'crack.wav', at: SPLIT - 0.3, db: -16},
    {f: 'pop.wav', at: SPLIT, db: -8}, {f: 'whoosh.wav', at: SPLIT, db: -20}, {f: 'stretch.wav', at: PUMP0, db: -14, to: 0.5}, {f: 'flap.wav', at: PUMP1, db: -12}, {f: 'ding.mp3', at: PUMP1 + 0.02, db: -22},
    // the straw mouth
    {f: 'whoosh.wav', at: S6 - 0.02, db: -30}, {f: 'twang.mp3', at: UNC0, db: -10, to: 0.6}, {f: 'pop.wav', at: T.straw, db: -22}, {f: 'twang.mp3', at: REC0, db: -22, to: 0.35},
    {f: 'giggle.mp3', at: UNC1 + 0.1, db: -31, to: 0.5},
    // the pizza: BOING
    {f: 'whoosh.wav', at: S7 - 0.02, db: -30}, {f: 'twang.mp3', at: BONK, db: -9, to: 0.6}, {f: 'bonk.wav', at: BONK, db: -14}, {f: 'crowd_laugh.wav', at: BONK + 0.12, db: -26, to: 1.0},
    ...ticks(TEETH0, TEETH1, 12, -31), {f: 'pop.wav', at: T.chewing, db: -21},
    // so he drinks his pizza
    {f: 'whoosh.wav', at: S8 - 0.02, db: -30}, {f: 'whoosh.wav', at: TOSS0, db: -20}, {f: 'splash.wav', at: TOSS1, db: -12},
    {f: 'whir.mp3', at: WHIR0, db: -13, to: WHIR1 - WHIR0}, {f: 'twang.mp3', at: DIP0, db: -22, to: 0.35},
    {f: 'gulp.wav', at: SLURP0, db: -10}, {f: 'glug.wav', at: SLURP0 + 0.1, db: -20, to: 0.5}, {f: 'crowd_laugh.wav', at: SLURP0 + 0.15, db: -26, to: 0.9},
    {f: 'flap.wav', at: LIFT, db: -13}, {f: 'flap.wav', at: LIFT + 0.28, db: -16}, {f: 'whoosh.wav', at: PUSH - 0.05, db: -22},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<BflyScene t={0} />}>
        <BflyScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="butterfly/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const BflyWide: React.FC = () => <WideFit.Provider value={0.72}><BflyVideo /></WideFit.Provider>;
