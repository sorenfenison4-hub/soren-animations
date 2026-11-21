// "What if you had a fly's eyes?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// (1) frame 0: he has huge red fly eyes and leans out of the way of a fly swatter in slow motion while the smug fly
//     swings it (SLOW-MO); it slams the ground beside him; (2) he struts toward us and BONKs face first into the screen
//     (2.22 s) and slides down the glass: ALMOST BLIND; (3) the fly lands on his head, a giant hand (YOU) swings a swatter in
//     slow motion while the fly rubs its legs and yawns (x4 FASTER), it hops off: SMACK on his head; (4) ZOOM: FLY EYE -
//     the little eyes are counted 0 -> 3,400 PER EYE, then each one flips to a single dot: the mosaic of his face (FLY
//     VISION) beside the sharp YOU SEE inset; (5) his eyes swell to a meter wide (tape: 1 METER), the weight tips him over
//     (THUD); (6) POOF - his own eyes; the fly comes back with a swatter, POOF - fly eyes on (FLY FIGHT) = frame 0.
// All drawn in code; the guy is the code-drawn front view (beetle) on a small IK rig with a lean, his head with fly eyes.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, spring,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Poof, Puffs} from './lib/kit';

// voice: tight.mp3 at 0.1 s (line 1 is its own take, tightened at 1.18; the rest at 1.12; times are video time).
// Last word ends 18.38 s; + 0.82 s for the push.
export const DURATION = 19.2;
export const T = {
  with: 0.10, flys: 0.37, eyes: 0.88, dodge: 1.42, anything: 1.73,                    // "With a fly's eyes, you'd dodge anything,"
  but: 2.54, almost: 3.18, blind: 3.59,                                                 // "but you'd be almost blind."
  a: 4.06, sees: 4.56, four: 5.13, times: 5.41, faster: 5.84, you: 6.48,                // "A fly sees about four times faster than you."
  thats: 6.88, cant: 7.38, swat: 7.59, one: 7.95,                                       // "That's why you can't swat one."
  but2: 8.31, eye: 8.81, over: 9.38, three: 9.59, thousand: 10.02, tiny: 10.59, eyes2: 10.95,   // "But each eye is over three thousand tiny eyes,"
  each2: 11.63, seeing: 11.81, one2: 12.31, dot: 12.52,                                 // "each seeing one dot."
  to: 13.04, sharp: 13.57, you2: 13.89, theyd: 14.48, meter: 15.16, wide: 15.59,        // "To see as sharp as you do, they'd have to be a meter wide."
  so: 16.23, only: 16.73, wears: 16.95, fly2: 17.45, fights: 17.73,                    // "So he only wears them for fly fights."
  cta: 12.98,
};
// beats (shot changes are hard cuts)
const SNAP = 1.52, SMASH = 1.62;                                // slow motion ends: the swatter slams the ground beside him
const UP = 1.72, BONK = 2.22;                                   // he springs up, struts at us, face first into the screen
const SLIDE0 = 2.80, SLIDE1 = 3.95;                             // slides down the glass
const S3 = 4.00, LAND = 4.32;                                   // medium shot: the fly lands on his head
const HAND0 = 4.40, WIND = 4.92, SW0 = 5.08, SNAP2 = 7.40, SMACK = 7.59;   // YOU: a giant hand swings a swatter (slow motion)
const RUB0 = 5.25, RUB1 = 6.12, YAWN0 = 6.16, YAWN1 = 6.86, HOP = 7.16;
const S4 = 8.22, ZOOM0 = 8.92, ZOOM1 = 9.5, CNT0 = 9.38, CNT1 = 11.0, MOS0 = 11.55, MOS1 = 12.3, X_OUT = 12.95;
const S5 = 12.95, SQUINT = 13.5, INF0 = 14.45, INF1 = 15.2, TAPE0 = 15.08, TIP0 = 15.64, THUD = 15.98;
const POOF1 = 16.2, UP1 = 16.36, UP2 = 16.66, FLYOUT = 16.25, FLYIN0 = 16.62, FLYIN1 = 17.22, POOF2 = 17.42, SWING2 = 17.72, END = 18.62;

const GOLD = '#FFD43B', RED = '#E2453C', FACE_C = '#F1EFEA';
const EYE = '#C3372D', EYE_DK = '#7C1D17';
const FLY_HEAD = '#5A5F68', FLY_TH = '#767B85', FLY_ST = '#2E3137', FLY_AB = '#A6A083', FLY_AB2 = '#78725A', FLY_LEG = '#26282D';
const WING = '#E6F0F7', WING_V = '#9FB8CA';
const SWAT = '#4C8FE0', SWAT_DK = '#2C69B3', HANDLE = '#F2C84B';
const GRASS = '#DCE5AE', GRASS2 = '#C3D18E', HILL = '#E4ECC4', TREE = '#BCD889', TRUNK = '#B98A5B', PATH = '#EDE2C8';
const GX = 40;                        // his feet
const F0: [number, number] = [153, -398];   // the fly hovering at frame 0
const FS0 = 0.9, FSW = 0.6;          // its size and its swatter's size
const SW_LEN = 342;                   // grip -> centre of the swatter head (scale 1)
const FONT_W = 900;

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
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
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const rad = (d: number) => (d * Math.PI) / 180;
/** where the head of a swatter held at grip g, pointing at ang degrees (0 = up, clockwise), is */
const swatHead = (g: P2, ang: number, sc: number): P2 => [g[0] + SW_LEN * sc * Math.sin(rad(ang)), g[1] - SW_LEN * sc * Math.cos(rad(ang))];

// ---------- compound eyes ----------
const meshPath = (r: number, R: number) => {
  const dx = Math.sqrt(3) * r, dy = 1.5 * r; let d = '';
  const n = Math.ceil(R / dy) + 1, m = Math.ceil(R / dx) + 1;
  for (let j = -n; j <= n; j++) for (let i = -m; i <= m; i++) {
    const cx = i * dx + (j & 1 ? dx / 2 : 0), cy = j * dy;
    if (Math.hypot(cx, cy) > R + r) continue;
    for (let k = 0; k < 6; k++) { const a = (Math.PI / 3) * k - Math.PI / 6; d += `${k ? 'L' : 'M'}${(cx + r * Math.cos(a)).toFixed(3)} ${(cy + r * Math.sin(a)).toFixed(3)}`; }
    d += 'Z';
  }
  return d;
};
const MESH = meshPath(0.125, 1.05);        // ~70 little eyes on a unit dome
const MESH_FINE = meshPath(0.07, 1.05);    // for the swollen (meter-wide) eyes
/** one compound-eye dome: red, a darker lower-right crescent, the hexagon mesh, a glint */
const Dome: React.FC<{cx: number; cy: number; rx: number; ry: number; id: string; lw?: number; fine?: boolean}> = ({cx, cy, rx, ry, id, lw = 5, fine = false}) => (
  <g>
    <clipPath id={id}><ellipse cx={cx} cy={cy} rx={rx} ry={ry} /></clipPath>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={EYE_DK} />
    <g clipPath={`url(#${id})`}>
      <ellipse cx={cx - rx * 0.07} cy={cy - ry * 0.08} rx={rx * 0.93} ry={ry * 0.9} fill={EYE} />
      <g transform={`translate(${cx.toFixed(1)} ${cy.toFixed(1)}) scale(${rx.toFixed(2)} ${ry.toFixed(2)})`}>
        <path d={fine ? MESH_FINE : MESH} stroke={EYE_DK} strokeWidth={Math.max(1.4, lw * 0.34)} fill="none" vectorEffect="non-scaling-stroke" />
      </g>
      <ellipse cx={cx - rx * 0.36} cy={cy - ry * 0.44} rx={rx * 0.3} ry={ry * 0.17} fill="#FFFFFF" opacity={0.72}
        transform={`rotate(-28 ${(cx - rx * 0.36).toFixed(1)} ${(cy - ry * 0.44).toFixed(1)})`} />
    </g>
    <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={lw} />
  </g>
);

// ---------- the guy's head ----------
type Mood = 'joy' | 'happy' | 'smug' | 'focus' | 'oof' | 'dizzy' | 'pop' | 'worry' | 'smush';
const SPIRAL = 'M 0 0 m -2 0 a 3 3 0 1 1 4 2 a 7 7 0 1 1 -9 -6 a 11 11 0 1 1 15 10 a 15 15 0 1 1 -21 -14';
const domeGeo = (E: number, smush: number) => ({
  rx: 31 * E * (1 + 0.3 * smush), ry: 38 * E * (1 - 0.12 * smush),
  cx: 2 + 31 * E * (1 + 0.24 * smush), cy: -16 - (E - 1) * 26,
});
const Mouth: React.FC<{mood: Mood; t: number}> = ({mood, t}) => {
  if (mood === 'joy') return <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  if (mood === 'happy') return <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  if (mood === 'smug') return <path d="M -20 6 Q 0 16 22 -3" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'focus') return <path d="M -15 9 Q 0 5 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  if (mood === 'oof') return <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  if (mood === 'worry' || mood === 'dizzy') return <path d={`M -18 10 q 6 ${mood === 'dizzy' ? -6 + 3 * Math.sin(t * 14) : -6} 12 0 t 12 0 t 12 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  if (mood === 'pop') return <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;
  // smush: squashed on the glass, teeth showing
  return <g><rect x={-40} y={0} width={80} height={17} rx={8} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
    <path d="M -38 8.5 H 38 M -24 1 V 16 M -10 1 V 16 M 4 1 V 16 M 18 1 V 16" stroke={INK} strokeWidth={3} /></g>;
};
/** his head with fly eyes. E = eye size (1 = normal fly eyes, ~3.2 = a meter wide), smush = pressed flat on the glass */
const FlyFace: React.FC<{t: number; mood: Mood; E: number; smush: number; uid: string}> = ({t, mood, E, smush, uid}) => {
  const d = domeGeo(E, smush);
  const k = (mood === 'pop' ? 1.12 : 1), rx = d.rx * k, ry = d.ry * k * (mood === 'oof' ? 0.8 : 1);
  const lid = mood === 'smug' ? 0.2 : mood === 'focus' ? 0.34 : 0;
  const hs = 1 + 0.22 * smush;
  const by = d.cy - ry - 8;
  const brow = (sd: number) => {
    const c = sd * d.cx; let p = '';
    if (mood === 'joy' || mood === 'happy') p = `M ${c - sd * 18} ${by + 2} Q ${c} ${by - 9} ${c + sd * 18} ${by + 2}`;
    else if (mood === 'smug') p = `M ${c - sd * 17} ${by + 3} L ${c + sd * 17} ${by - 1}`;
    else if (mood === 'focus' || mood === 'oof') p = `M ${c - sd * 18} ${by + 7} L ${c + sd * 16} ${by - 5}`;
    else if (mood === 'worry' || mood === 'dizzy') p = `M ${c - sd * 16} ${by - 5} L ${c + sd * 16} ${by + 5}`;
    else if (mood === 'pop') p = `M ${c - sd * 18} ${by - 6} Q ${c} ${by - 16} ${c + sd * 18} ${by - 6}`;
    return p ? <path key={'b' + sd} d={p} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null;
  };
  return (
    <g>
      <ellipse rx={(HEAD_R + 1) * hs} ry={(HEAD_R + 1) * (1 - 0.06 * smush)} fill={`url(#fFace${uid})`} stroke={INK} strokeWidth={6.5} />
      {[-1, 1].map((sd) => <g key={sd}>
        <Dome cx={sd * d.cx} cy={d.cy} rx={rx} ry={ry} id={`fd${uid}${sd}`} lw={5 + (E - 1) * 1.2} fine={E > 1.7} />
        {lid ? <path d={lidPath(sd * d.cx, d.cy, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}
        {mood === 'oof' ? <path d={`M ${sd * (d.cx + rx + 5)} ${d.cy - 13} l ${sd * 10} -6 M ${sd * (d.cx + rx + 6)} ${d.cy} l ${sd * 12} 0 M ${sd * (d.cx + rx + 5)} ${d.cy + 13} l ${sd * 10} 6`}
          stroke={INK} strokeWidth={4} strokeLinecap="round" /> : null}
        {mood === 'dizzy' ? <path d={SPIRAL} transform={`translate(${sd * d.cx} ${d.cy}) rotate(${(t * 520 * sd).toFixed(1)}) scale(${(rx / 24).toFixed(2)})`}
          stroke="#FFE066" strokeWidth={4} fill="none" strokeLinecap="round" vectorEffect="non-scaling-stroke" /> : null}
        {smush > 0.3 ? <ellipse cx={sd * d.cx} cy={d.cy} rx={rx * 0.62} ry={ry * 0.55} fill="#FFFFFF" opacity={0.22 * smush} /> : null}
      </g>)}
      {brow(-1)}{brow(1)}
      <g transform={`translate(0 ${36 + (E - 1) * 2}) scale(${1 + 0.25 * smush} 1)`}><Mouth mood={mood} t={t} /></g>
    </g>
  );
};
/** his own (human) eyes - used after the POOF near the end */
const HumanFace: React.FC<{t: number; mood: Mood; uid: string}> = ({t, mood, uid}) => {
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (mood === 'joy' || mood === 'happy') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    const lid = mood === 'focus' || mood === 'smug' ? 0.4 : 0;
    return <g key={sd}>
      <ellipse cx={ex} cy={ey} rx={12} ry={15} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex - 2} cy={ey + 1 + lid * 6} r={6.3} fill={INK} />
      <circle cx={ex - 3.5} cy={ey - 1 + lid * 6} r={2} fill="#fff" />
      {lid ? <path d={lidPath(ex, ey, 12.5, 15.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
    </g>;
  };
  const brow = (sd: number) => {
    const d = mood === 'focus' ? `M ${sd * 10} -33 L ${sd * 37} -43` : `M ${sd * 12} -44 Q ${sd * 24} -52 ${sd * 37} -46`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  return (
    <g>
      <circle r={HEAD_R + 1} fill={`url(#fFace${uid})`} stroke={INK} strokeWidth={6.5} />
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)"><Mouth mood={mood} t={t} /></g>
    </g>
  );
};

// ---------- the guy: front view on a small IK rig (feet at 0), upper body leans around the hip ----------
type GS = {x: number; y: number; rot: number; app: number; lean: number; hip: number; knee: number; armL: P2; armR: P2; step: number;
  mood: Mood; human: boolean; E: number; smush: number; sq: number; trem: number};
const torsoD = (tw: number, top: number, bot: number) => {
  const h = bot - top, r1 = Math.min(34, h * 0.3), r2 = Math.min(29, h * 0.26), sw = tw * 0.6;
  return `M ${-sw} ${top} C ${-tw + 5} ${top + r1 * 0.18} ${-tw} ${top + r1 * 0.5} ${-tw} ${top + r1} L ${-tw + 1} ${bot - r2} Q ${-tw + 1} ${bot} ${-tw + r2} ${bot} ` +
    `L ${tw - r2} ${bot} Q ${tw - 1} ${bot} ${tw - 1} ${bot - r2} L ${tw} ${top + r1} C ${tw} ${top + r1 * 0.5} ${tw - 5} ${top + r1 * 0.18} ${sw} ${top} Z`;
};
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; hand?: boolean; palm?: number}> = ({S, H, L, sd, w = 29, hand = true, palm = 0}) => {
  const E = ik(S, H, L, L, -sd * (H[1] < S[1] ? 1 : -1));
  const C: P2 = [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2];
  const d = `M ${P(S)} Q ${P(C)} ${P(H)}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#FFFFFF" strokeWidth={w - 11} fill="none" strokeLinecap="round" />
      {hand ? <circle cx={H[0]} cy={H[1]} r={13 + 9 * palm} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} /> : null}
      {hand && palm > 0.5 ? <path d={`M ${H[0] - 11} ${H[1] - 8} v -10 M ${H[0] - 2} ${H[1] - 11} v -11 M ${H[0] + 7} ${H[1] - 9} v -10 M ${H[0] + 14} ${H[1] - 4} v -8`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" /> : null}
    </g>
  );
};
/** head centre in the guy's own coords (before rot / app) */
const headLocal = (g: GS): P2 => { const a = rad(g.lean); return [165 * Math.sin(a), -g.hip - 165 * Math.cos(a)]; };
/** head centre in world coords */
const headWorld = (g: GS): P2 => {
  const h = headLocal(g), a = rad(g.rot);
  return [g.x + h[0] * Math.cos(a) - h[1] * Math.sin(a), g.y + h[0] * Math.sin(a) + h[1] * Math.cos(a)];
};
const GuyF: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  const hipY = -g.hip, shY = hipY - 112, tw = 47, shX = 38, headY = shY - 53;
  const footX = 27 + g.knee * 0.25;
  const jig = g.trem * 2.4 * Math.sin(t * 71);
  const hd = headLocal(g);
  const S: [P2, P2] = [[-shX, shY + 22], [shX, shY + 22]];
  const lift = (sd: number) => 16 * Math.max(0, sd * g.step);
  return (
    <W><g transform={`translate(${(g.x + jig).toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)}) translate(${hd[0].toFixed(1)} ${hd[1].toFixed(1)}) scale(${g.app.toFixed(4)}) translate(${(-hd[0]).toFixed(1)} ${(-hd[1]).toFixed(1)})`}>
      {[-1, 1].map((sd) => <Limb key={'l' + sd} S={[sd * 19, hipY + 4]} H={[sd * footX, -12 - lift(sd)]} L={37} sd={-sd} w={30} hand={false} />)}
      {[-1, 1].map((sd) => <ellipse key={'f' + sd} cx={sd * (footX + 2)} cy={-7 - lift(sd)} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />)}
      <g transform={`rotate(${g.lean.toFixed(2)} 0 ${hipY})`}>
        <path d={torsoD(tw, shY, hipY + 13)} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        <Limb S={S[0]} H={[S[0][0] + g.armL[0], S[0][1] + g.armL[1]]} L={77} sd={g.armL[1] > 0 ? 1 : -1} palm={g.smush} />
        <Limb S={S[1]} H={[S[1][0] + g.armR[0], S[1][1] + g.armR[1]]} L={77} sd={g.armR[1] > 0 ? -1 : 1} palm={g.smush} />
        <g transform={`translate(0 ${headY + HEAD_R}) scale(${(1 + 0.12 * g.sq).toFixed(3)} ${(1 - 0.26 * g.sq).toFixed(3)}) translate(0 ${-HEAD_R})`}>
          {g.human ? <HumanFace t={t} mood={g.mood} uid={uid} /> : <FlyFace t={t} mood={g.mood} E={g.E} smush={g.smush} uid={uid} />}
        </g>
      </g>
    </g></W>
  );
};

// ---------- the fly (front view, big cartoon housefly) ----------
type FMood = 'smug' | 'laugh' | 'yawn' | 'angry' | 'calm' | 'look';
type FS = {x: number; y: number; s: number; rot: number; mood: FMood; flap: number; legs: 'hover' | 'sit' | 'rub' | 'hold'; grip: P2; rub: number; shake: number};
const FLeg: React.FC<{A: P2; F: P2; sd: number; L1?: number; L2?: number}> = ({A, F, sd, L1 = 44, L2 = 50}) => {
  const K = ik(A, F, L1, L2, sd);
  const d = `M ${P(A)} L ${P(K)} L ${P(F)}`;
  const tick = (a: P2, b: P2, u: number) => { const p = lp2(a, b, u), dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    return `M ${P(p)} l ${(-dy / l * 7 * sd).toFixed(1)} ${(dx / l * 7 * sd).toFixed(1)}`; };
  return <g>
    <path d={d} stroke={INK} strokeWidth={13} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={FLY_LEG} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={[tick(A, K, 0.45), tick(K, F, 0.35), tick(K, F, 0.7)].join(' ')} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />
  </g>;
};
const FlyBug: React.FC<{t: number; f: FS; uid: string}> = ({t, f, uid}) => {
  const k = f.s;
  const toL = (p: P2): P2 => [(p[0] - f.x) / k, (p[1] - f.y) / k];
  const wa = f.flap > 0 ? 30 * Math.sin(2 * Math.PI * f.flap * t) : 4;
  const jig = f.shake * 3.5 * Math.sin(t * 58);
  // feet per leg mode (local coords; front, mid, hind)
  const rubU = Math.sin(t * 2 * Math.PI * 3.2);
  let front: [P2, P2];
  if (f.legs === 'hold') { const g = toL(f.grip); front = [[g[0] - 6, g[1] + 4], [g[0] + 6, g[1] - 2]]; }
  else if (f.legs === 'rub') front = [[-6 + 9 * rubU, -6 - 4 * rubU], [6 + 9 * rubU, -6 + 4 * rubU]];
  else if (f.legs === 'sit') front = [[-46, 66], [46, 66]];
  else front = [[-46, 64 + 4 * Math.sin(t * 3)], [46, 64 + 4 * Math.sin(t * 3 + 1)]];
  const sitting = f.legs === 'sit' || f.legs === 'rub';
  const mid: [P2, P2] = sitting ? [[-90, 66], [90, 66]] : [[-86, 74], [86, 74]];
  const hind: [P2, P2] = sitting ? [[-66, 68], [66, 68]] : [[-58, 108], [58, 108]];
  const lid = f.mood === 'smug' ? 0.46 : f.mood === 'yawn' ? 0.62 : f.mood === 'angry' ? 0.26 : f.mood === 'laugh' ? 0.58 : 0;
  const ex = 31, ey = -76, erx = 33, ery = 39;
  const brow = (sd: number) => {
    const c = sd * ex, y = ey - ery - 7; let p = '';
    if (f.mood === 'angry') p = `M ${c - sd * 20} ${y + 9} L ${c + sd * 16} ${y - 5}`;
    else if (f.mood === 'smug') p = `M ${c - sd * 18} ${y + 3} L ${c + sd * 18} ${y - 2}`;
    else if (f.mood === 'yawn') p = `M ${c - sd * 16} ${y - 4} L ${c + sd * 16} ${y + 3}`;
    else if (f.mood === 'look') p = `M ${c - sd * 18} ${y - 4} Q ${c} ${y - 14} ${c + sd * 18} ${y - 4}`;
    else if (f.mood === 'laugh') p = `M ${c - sd * 18} ${y + 2} Q ${c} ${y - 10} ${c + sd * 18} ${y + 2}`;
    return p ? <path key={'b' + sd} d={p} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /> : null;
  };
  let mouth: React.ReactNode;
  if (f.mood === 'laugh') mouth = <g><path d="M -20 -2 Q 0 -6 20 -2 Q 17 22 0 24 Q -17 22 -20 -2 Z" fill="#5A2328" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /><ellipse cx={0} cy={15} rx={8} ry={5} fill="#E4677A" /></g>;
  else if (f.mood === 'yawn') mouth = <g><ellipse cx={0} cy={8} rx={13} ry={18} fill="#5A2328" stroke={INK} strokeWidth={4.5} /><ellipse cx={0} cy={18} rx={7} ry={5} fill="#E4677A" /></g>;
  else if (f.mood === 'angry') mouth = <path d="M -14 8 Q 0 1 14 8" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (f.mood === 'look') mouth = <ellipse cx={0} cy={6} rx={6} ry={8} fill="#5A2328" stroke={INK} strokeWidth={4} />;
  else if (f.mood === 'smug') mouth = <path d="M -14 4 Q 2 13 17 -2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else mouth = <path d="M -12 2 Q 0 11 12 2" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  return (
    <W><g transform={`translate(${(f.x + jig).toFixed(1)} ${f.y.toFixed(1)}) rotate(${f.rot.toFixed(2)}) scale(${k.toFixed(3)})`}>
      {/* wings behind */}
      {[-1, 1].map((sd) => <g key={'w' + sd} transform={`translate(${sd * 24} -26) rotate(${(sd * (50 + wa)).toFixed(1)})`}>
        <path d="M 0 0 C -30 -30 -34 -110 0 -132 C 34 -110 30 -30 0 0 Z" fill={WING} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M 0 -6 L 0 -118 M 0 -40 L -16 -72 M 0 -62 L 15 -98 M 0 -30 L 14 -52" stroke={WING_V} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g>)}
      {f.flap > 8 ? [-1, 1].map((sd) => <path key={'m' + sd} d={`M ${sd * 70} -150 Q ${sd * 120} -100 ${sd * 120} -40`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.5} />) : null}
      {/* hind + middle legs */}
      {[-1, 1].map((sd) => <FLeg key={'h' + sd} A={[sd * 30, 30]} F={hind[sd < 0 ? 0 : 1]} sd={sd} />)}
      {[-1, 1].map((sd) => <FLeg key={'m' + sd} A={[sd * 42, 12]} F={mid[sd < 0 ? 0 : 1]} sd={sd} />)}
      {/* abdomen */}
      <ellipse cx={0} cy={52} rx={44} ry={50} fill={FLY_AB} stroke={INK} strokeWidth={6.5} />
      <path d="M -40 40 Q 0 54 40 40 M -36 68 Q 0 80 36 68" stroke={FLY_AB2} strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d="M 0 16 L 0 96" stroke={FLY_AB2} strokeWidth={8} strokeLinecap="round" />
      {/* thorax with the four dark stripes */}
      <ellipse cx={0} cy={0} rx={50} ry={44} fill={FLY_TH} />
      {[-24, -9, 9, 24].map((x) => <rect key={x} x={x - 3.5} y={-34} width={7} height={60} rx={3.5} fill={FLY_ST} />)}
      <ellipse cx={0} cy={0} rx={50} ry={44} fill="none" stroke={INK} strokeWidth={6.5} />
      {/* front legs */}
      {[-1, 1].map((sd) => <FLeg key={'f' + sd} A={[sd * 32, -16]} F={front[sd < 0 ? 0 : 1]} sd={-sd} L1={40} L2={46} />)}
      {/* head */}
      <ellipse cx={0} cy={-62} rx={50} ry={44} fill={FLY_HEAD} stroke={INK} strokeWidth={6.5} />
      <path d="M -6 -108 q -6 -12 -14 -14 M 6 -108 q 6 -12 14 -14" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      {[-1, 1].map((sd) => <g key={'e' + sd}>
        <Dome cx={sd * ex} cy={ey} rx={erx} ry={ery} id={`fe${uid}${sd}`} lw={5.5} />
        {lid ? <path d={lidPath(sd * ex, ey, erx + 0.5, ery + 0.5, lid)} fill={FLY_HEAD} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}
        {f.mood === 'laugh' ? <path d={`M ${sd * ex - 14} ${ey + ery * 0.25} Q ${sd * ex} ${ey + ery * 0.25 - 12} ${sd * ex + 14} ${ey + ery * 0.25}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
      </g>)}
      {brow(-1)}{brow(1)}
      <g transform="translate(0 -36)">{mouth}</g>
    </g></W>
  );
};
const flyGrip = (f: FS): P2 => [f.x - 44 * f.s, f.y + 6 * f.s];

// ---------- the swatter and the giant hand ----------
const Swatter: React.FC<{g: P2; ang: number; sc: number}> = ({g, ang, sc}) => (
  <g transform={`translate(${g[0].toFixed(1)} ${g[1].toFixed(1)}) rotate(${ang.toFixed(2)}) scale(${sc})`}>
    <rect x={-9} y={-276} width={18} height={292} rx={9} fill={HANDLE} stroke={INK} strokeWidth={6} />
    <path d="M -14 -270 L 14 -270 L 24 -292 L -24 -292 Z" fill={SWAT_DK} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <rect x={-62} y={-404} width={124} height={124} rx={24} fill={SWAT} />
    <path d={Array.from({length: 7}, (_, i) => `M ${-42 + i * 14} -398 V -286 M -56 ${-390 + i * 16} H 56`).join(' ')} stroke={SWAT_DK} strokeWidth={3.5} />
    <rect x={-62} y={-404} width={124} height={124} rx={24} fill="none" stroke={INK} strokeWidth={7} />
  </g>
);
/** the viewer's hand ("YOU") holding the swatter grip: arm goes out along +y in the swatter's frame */
const BigHand: React.FC<{g: P2; ang: number}> = ({g, ang}) => (
  <g transform={`translate(${g[0].toFixed(1)} ${g[1].toFixed(1)}) rotate(${ang.toFixed(2)})`}>
    <path d="M -54 8 L -66 760 L 82 760 L 66 8 Z" fill="#FFFFFF" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <path d="M -60 250 L -68 760 L 84 760 L 76 250 Z" fill="#5B8DEF" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
    <text x={8} y={330} textAnchor="middle" dominantBaseline="middle" transform={`rotate(${-ang + 0} 8 330)`} fontFamily={FONT} fontWeight={FONT_W} fontSize={52}
      fill="#FFFFFF" stroke={INK} strokeWidth={9} style={{paintOrder: 'stroke'}}>YOU</text>
    <circle cx={4} cy={0} r={64} fill="#FFFFFF" stroke={INK} strokeWidth={8} />
    <path d="M -40 -22 Q -12 -30 18 -20 M -44 4 Q -12 -4 22 6 M -38 28 Q -10 22 18 32" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
  </g>
);

// ---------- the park ----------
const Tree: React.FC<{x: number; s: number}> = ({x, s}) => {
  const balls: [number, number, number][] = [[0, -178, 78], [-52, -132, 50], [52, -138, 54], [-18, -110, 44], [26, -112, 44]];
  return <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -15 0 L -10 -122 L 10 -122 L 15 0 Z" fill={TRUNK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {balls.map(([cx, cy, r], i) => <circle key={'o' + i} cx={cx} cy={cy} r={r + 6} fill={INK} />)}
    {balls.map(([cx, cy, r], i) => <circle key={'f' + i} cx={cx} cy={cy} r={r} fill={TREE} />)}
    <path d="M -40 -200 Q -10 -232 28 -214" stroke="#D6EBB0" strokeWidth={10} fill="none" strokeLinecap="round" />
  </g>;
};

// ---------- screen-space panels (from videos/beetle) ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 450}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: FONT_W, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const Counter: React.FC<{s: number; pulseK: number; value: string; label: string; red?: boolean; icon: React.ReactNode; left?: number; top?: number; size?: number; lsize?: number; rot?: number}> =
  ({s, pulseK, value, label, red, icon, left = 540, top = 1460, size = 112, lsize = 38, rot = -2}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${(s * (1 + 0.08 * pulseK)).toFixed(3)})`,
    background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '8px 28px 12px', fontFamily: FONT, color: INK,
    display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap'}}>
    {icon}
    <div>
      <div style={{fontWeight: FONT_W, fontSize: size, lineHeight: 1, color: red ? RED : INK}}>{value}</div>
      <div style={{fontWeight: FONT_W, fontSize: lsize}}>{label}</div>
    </div>
  </div>
) : null;
const FlyIcon = () => (
  <svg width={104} height={100} viewBox="-60 -62 120 116">
    <path d="M -10 -14 C -40 -40 -56 -60 -40 -66 C -24 -70 -14 -40 -6 -20 Z M 10 -14 C 40 -40 56 -60 40 -66 C 24 -70 14 -40 6 -20 Z" fill={WING} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={0} cy={18} rx={22} ry={26} fill={FLY_TH} stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={-14} rx={26} ry={20} fill={FLY_HEAD} stroke={INK} strokeWidth={5} />
    <ellipse cx={-13} cy={-18} rx={14} ry={16} fill={EYE} stroke={INK} strokeWidth={4} />
    <ellipse cx={13} cy={-18} rx={14} ry={16} fill={EYE} stroke={INK} strokeWidth={4} />
    <ellipse cx={-17} cy={-24} rx={4} ry={3} fill="#fff" opacity={0.8} /><ellipse cx={9} cy={-24} rx={4} ry={3} fill="#fff" opacity={0.8} />
  </svg>
);
const EyeIcon = () => (
  <svg width={100} height={100} viewBox="-50 -50 100 100">
    <ellipse cx={0} cy={0} rx={40} ry={44} fill={EYE} stroke={INK} strokeWidth={5} />
    <g transform="scale(40 44)"><path d={MESH} stroke={EYE_DK} strokeWidth={2} fill="none" vectorEffect="non-scaling-stroke" /></g>
    <ellipse cx={0} cy={0} rx={40} ry={44} fill="none" stroke={INK} strokeWidth={5} />
  </svg>
);
const XFrame: React.FC<{id: string; R: number; t: number; children: React.ReactNode}> = ({id, R, t, children}) => (
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

// ---------- ZOOM: FLY EYE - count the little eyes, then each one turns into one dot ----------
const HEX_R = 10, ZMAX = 3;
const DOME_C: P2 = [104, -8], DOME_RX = 124, DOME_RY = 146;
/** what the mosaic shows (panel coords, radius 340): his face with the fly eyes, as each little eye sees one dot of it */
const faceColor = (x: number, y: number) => {
  let c = y > 238 ? GRASS : '#F3EFE3';
  if (Math.abs(x) < 158 && y > 178) c = '#FFFFFF';
  const d = Math.hypot(x, y + 24);
  if (d < 214) c = d > 196 ? '#3B3B3B' : '#FFFFFF';
  for (const sd of [-1, 1]) {
    const u = (x - sd * 96) / 88, v = (y + 74) / 104;
    if (u * u + v * v < 1) c = u * u + v * v > 0.86 ? '#5B1612' : (u < -0.15 && v < -0.2 ? '#EE7C70' : EYE);
  }
  if ((x / 54) ** 2 + ((y - 96) / 24) ** 2 < 1 && y > 92) c = '#5A2328';
  return c;
};
type Hex = {p: P2; q: P2; d: number; col: string};
const HEXES: Hex[] = (() => {
  const dx = Math.sqrt(3) * HEX_R, dy = 1.5 * HEX_R, out: Hex[] = [];
  for (let j = -18; j <= 18; j++) for (let i = -16; i <= 16; i++) {
    const p: P2 = [DOME_C[0] + i * dx + (j & 1 ? dx / 2 : 0), DOME_C[1] + j * dy];
    if (((p[0] - DOME_C[0]) / DOME_RX) ** 2 + ((p[1] - DOME_C[1]) / DOME_RY) ** 2 > 1) continue;
    const q: P2 = [(p[0] - DOME_C[0]) * ZMAX, (p[1] - DOME_C[1]) * ZMAX];
    out.push({p, q, d: Math.hypot(q[0], q[1]), col: faceColor(q[0], q[1])});
  }
  return out;
})();
const VIS = HEXES.filter((h) => h.d < 372).sort((a, b) => a.d - b.d);
const LIT_RANK = new Map(VIS.map((h, i) => [h, i]));
const hexD = (cx: number, cy: number, r: number, sx = 1) => {
  let s = '';
  for (let k = 0; k < 6; k++) { const a = (Math.PI / 3) * k - Math.PI / 6; s += `${k ? 'L' : 'M'}${(cx + r * sx * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`; }
  return s + 'Z';
};
const EyeZoom: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const z = eio(seg(t, ZOOM0, ZOOM1));
  const Z = Math.exp(lerp(0, Math.log(ZMAX), z));
  const C: P2 = [DOME_C[0] * z, DOME_C[1] * z];
  const lit = Math.floor(seg(t, CNT0, CNT1) * VIS.length);
  const count = Math.round(3400 * seg(t, CNT0, CNT1));
  const mosaic = t > MOS0;
  const flipOf = (h: Hex) => { const t0 = MOS0 + ((h.q[0] + 340) / 680) * 0.42 + ((h.q[1] + 340) / 680) * 0.12; return seg(t, t0, t0 + 0.16); };
  const lw = 1 / Z;
  const insetS = popIn(t, MOS1 - 0.05, 0.3);
  return (
    <div style={{position: 'absolute', left: 540, top: 1000, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s.toFixed(3)})`}}>
      <XFrame id={`xz${uid}`} R={340} t={t}>
        <g transform={`scale(${Z.toFixed(4)}) translate(${(-C[0]).toFixed(2)} ${(-C[1]).toFixed(2)})`}>
          {/* the fly's head, close up */}
          <ellipse cx={0} cy={70} rx={190} ry={160} fill={FLY_HEAD} stroke={INK} strokeWidth={8 * lw} />
          <path d="M -60 -150 q -20 -40 -60 -50 M 60 -150 q 20 -40 60 -50" stroke={INK} strokeWidth={12 * lw} fill="none" strokeLinecap="round" />
          <Dome cx={-DOME_C[0]} cy={DOME_C[1]} rx={DOME_RX} ry={DOME_RY} id={`xzl${uid}`} lw={9 * lw} />
          <ellipse cx={DOME_C[0]} cy={DOME_C[1]} rx={DOME_RX} ry={DOME_RY} fill={EYE_DK} />
          {HEXES.map((h, i) => {
            const vis = LIT_RANK.get(h);
            const u = mosaic ? flipOf(h) : 0;
            const sx = mosaic ? Math.max(0.04, Math.abs(Math.cos(Math.PI * u))) : 1;
            const fill = u >= 0.5 ? h.col : EYE;
            const on = !mosaic && vis !== undefined && vis < lit;
            return <path key={i} d={hexD(h.p[0], h.p[1], HEX_R * (mosaic && u >= 0.5 ? 1.02 : 0.9), sx)} fill={fill}
              stroke={on ? GOLD : EYE_DK} strokeWidth={(on ? 4 : 2.2) * lw} strokeLinejoin="round" />;
          })}
          {!mosaic || t < MOS0 + 0.1 ? <ellipse cx={DOME_C[0] - DOME_RX * 0.36} cy={DOME_C[1] - DOME_RY * 0.44} rx={DOME_RX * 0.26} ry={DOME_RY * 0.14} fill="#FFFFFF" opacity={0.55 * (1 - z * 0.7)}
            transform={`rotate(-28 ${DOME_C[0] - DOME_RX * 0.36} ${DOME_C[1] - DOME_RY * 0.44})`} /> : null}
          <ellipse cx={DOME_C[0]} cy={DOME_C[1]} rx={DOME_RX} ry={DOME_RY} fill="none" stroke={INK} strokeWidth={9 * lw} />
          <path d="M -40 150 Q 0 176 46 140" stroke={INK} strokeWidth={10 * lw} fill="none" strokeLinecap="round" />
        </g>
      </XFrame>
      <Card text={t < MOS1 ? 'ZOOM: FLY EYE' : 'FLY VISION'} top={86} size={50} color={t < MOS1 ? '#fff' : GOLD} s={t < MOS1 ? 1 : 1 + 0.15 * Math.max(0, 1 - (t - MOS1) * 5)} />
      {/* little-eye counter */}
      <div style={{position: 'absolute', left: 770, top: 250, transform: `translate(-50%,-50%) rotate(6deg) scale(${(popIn(t, CNT0 - 0.12, 0.3) * (1 - seg(t, MOS1 + 0.15, MOS1 + 0.3)) * (1 + 0.1 * Math.max(0, 1 - (t - CNT1) * 4) * (t > CNT1 ? 1 : 0))).toFixed(3)})`,
        background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 24px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{fontWeight: FONT_W, fontSize: 96, lineHeight: 1}}>{fmt(count)}</div>
        <div style={{fontWeight: FONT_W, fontSize: 32}}>TINY EYES</div>
        <div style={{fontWeight: 800, fontSize: 26, color: '#6B6B6B'}}>PER EYE</div>
      </div>
      <Card text="ONE DOT EACH" top={830} left={420} rot={-4} s={popIn(t, T.one2 - 0.02, 0.28) * (1 - seg(t, X_OUT - 0.3, X_OUT - 0.15))} size={50} />
      {/* the sharp picture you see, for comparison */}
      {insetS > 0.01 ? <div style={{position: 'absolute', left: 770, top: 700, transform: `translate(-50%,-50%) rotate(4deg) scale(${insetS.toFixed(3)})`}}>
        <svg width={250} height={250} viewBox="-125 -125 250 250" style={{overflow: 'visible'}}>
          <clipPath id={`ins${uid}`}><circle r={110} /></clipPath>
          <circle r={122} fill={INK} />
          <g clipPath={`url(#ins${uid})`}>
            <rect x={-130} y={-130} width={260} height={260} fill="#F3EFE3" />
            <rect x={-130} y={76} width={260} height={60} fill={GRASS} />
            <path d="M -60 140 L -56 74 Q 0 60 56 74 L 60 140 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} />
            <g transform="translate(0 -6) scale(1.1)"><FlyFace t={t} mood="smug" E={1} smush={0} uid={`i${uid}`} /></g>
          </g>
          <circle r={110} fill="none" stroke="#3E6FB0" strokeWidth={10} />
        </svg>
        <div style={{position: 'absolute', left: 125, top: 262, transform: 'translate(-50%,-50%) rotate(-3deg)', background: '#fff', border: `6px solid ${INK}`, borderRadius: 18,
          padding: '2px 16px', fontFamily: FONT, fontWeight: FONT_W, fontSize: 32, whiteSpace: 'nowrap', boxShadow: `0 5px 0 ${INK}`}}>YOU SEE</div>
      </div> : null}
    </div>
  );
};

// ---------- tape measure across a swollen eye ----------
const Tape: React.FC<{x0: number; x1: number; y: number; p: number}> = ({x0, x1, y, p}) => {
  if (p < 0.01) return null;
  const xe = lerp(x0, x1, p);
  return <W><g>
    <rect x={x0 - 46} y={y - 34} width={56} height={68} rx={14} fill="#B8C1CC" stroke={INK} strokeWidth={6} />
    <circle cx={x0 - 18} cy={y} r={14} fill="#8C97A4" stroke={INK} strokeWidth={5} />
    <rect x={x0} y={y - 13} width={xe - x0} height={26} fill={GOLD} stroke={INK} strokeWidth={5} />
    {Array.from({length: Math.floor((xe - x0) / 17)}, (_, i) => <path key={i} d={`M ${x0 + 17 * (i + 1)} ${y - 13} v ${i % 5 === 4 ? 16 : 9}`} stroke={INK} strokeWidth={3} />)}
    <rect x={xe - 6} y={y - 20} width={12} height={40} rx={3} fill="#8C97A4" stroke={INK} strokeWidth={4} />
  </g></W>;
};

// ---------- the story over time ----------
const REST_L: P2 = [-22, 134], REST_R: P2 = [22, 134];
const base = (): GS => ({x: GX, y: 0, rot: 0, app: 1, lean: 0, hip: 70, knee: 0, armL: REST_L, armR: REST_R, step: 0, mood: 'smug', human: false, E: 1, smush: 0, sq: 0, trem: 0});
/** frame 0 (and the end): he leans out of the swatter's way in slow motion, smug */
const dodge = (t: number, g: GS, k = 1) => {
  g.lean = lerp(g.lean, -40 - 3 * Math.sin(t * 2.2), k); g.knee = lerp(g.knee, 30, k); g.hip = lerp(g.hip, 64, k);
  g.armL = lp2(g.armL, [-108 + 8 * Math.sin(t * 1.7), -52 + 10 * Math.sin(t * 1.3)], k);
  g.armR = lp2(g.armR, [72 + 6 * Math.sin(t * 1.5), -114 + 6 * Math.sin(t * 1.1)], k);
};
const guyAt = (t: number): GS => {
  const g = base();
  if (t < SMASH) { dodge(t, g); g.mood = 'smug'; return g; }
  if (t < UP) {   // the swatter slams down beside him; he springs upright
    const u = eout(seg(t, SMASH, UP));
    dodge(t, g, 1 - u); g.lean += 6 * Math.sin(Math.PI * u) * (1 - u); g.mood = 'joy';
    return g;
  }
  if (t < BONK) {   // struts at us (grows around his head), proud
    const u = seg(t, UP, BONK), ph = Math.sin(u * Math.PI * 2.5);
    g.app = lerp(1, 1.85, Math.pow(u, 2.2)); g.step = ph; g.armL = [-14 - 24 * ph, 132]; g.armR = [14 - 24 * ph, 132]; g.mood = 'joy';
    g.y = -6 * Math.abs(ph);
    return g;
  }
  if (t < S3) {   // flat on the glass, then slides down it
    const k = t - BONK;
    g.app = 1.85; g.smush = clamp(1 - 0.12 * Math.exp(-9 * k) * Math.cos(k * 40)); g.mood = t < 3.3 ? 'smush' : 'dizzy';
    g.armL = [-78, -104]; g.armR = [78, -104]; g.y = 230 * eio(seg(t, SLIDE0, SLIDE1));
    return g;
  }
  if (t < S5) {   // dazed; the fly sits on his head; the swatter smacks it
    g.mood = t < 4.6 ? 'dizzy' : t < SMACK ? 'worry' : t < 8.15 ? 'pop' : 'dizzy';
    if (t > SMACK) { const k = t - SMACK; g.sq = Math.max(0, Math.exp(-5 * k) * (k < 0.08 ? k / 0.08 : Math.cos((k - 0.08) * 26))); g.trem = 0.4 * Math.exp(-3 * k); }
    g.armL = [-24, 132]; g.armR = [24, 132];
    return g;
  }
  if (t < POOF1) {   // squints, the eyes swell to a meter wide, the weight tips him over
    g.mood = t < SQUINT ? 'worry' : t < INF0 ? 'focus' : t < TIP0 ? 'pop' : t < THUD ? 'worry' : 'dizzy';
    const u = seg(t, INF0, INF1);
    g.E = 1 + 2.25 * eout(u) + (t > INF1 ? 0.12 * Math.exp(-6 * (t - INF1)) * Math.sin((t - INF1) * 22) : 0);
    if (t > INF1) g.trem = 0.5;
    if (t > TIP0) {
      const v = seg(t, TIP0, THUD);
      g.rot = -86 * v * v + (t > THUD ? 5 * Math.exp(-7 * (t - THUD)) * Math.sin((t - THUD) * 24) : 0);
      g.armL = [-96, -40]; g.armR = [96, -60];
    }
    return g;
  }
  // POOF - his own eyes; up again; the fly comes back with a swatter; POOF - fly eyes on; slow-motion dodge = frame 0
  if (t < UP2) {
    const v = eout(seg(t, UP1, UP2));
    g.rot = -86 * (1 - v); g.human = true; g.mood = 'happy'; g.y = -40 * Math.sin(Math.PI * v);
    g.armL = [-96 + 80 * v, -40 + 170 * v]; g.armR = [96 - 80 * v, -60 + 190 * v];
    return g;
  }
  if (t < POOF2 + 0.12) { g.human = true; g.mood = t < 16.95 ? 'happy' : 'focus'; return g; }
  g.mood = 'smug';
  if (t < SWING2) return g;
  dodge(t, g, eout(seg(t, SWING2, SWING2 + 0.5)));
  return g;
};
type SwS = {on: boolean; g: P2; ang: number; sc: number; by: 'fly' | 'hand'; ghost: number};
type FlyAll = {f: FS; sw: SwS};
const flyAt = (t: number): FlyAll => {
  const hover = (x: number, y: number, mood: FMood, flap = 22): FS => ({x, y: y + 6 * Math.sin(t * 5), s: 1, rot: 0, mood, flap, legs: 'hover', grip: [0, 0], rub: 0, shake: 0});
  const off: SwS = {on: false, g: [0, 0], ang: 0, sc: 0.8, by: 'fly', ghost: 0};
  if (t < S3) {
    // frame 0: the swatter head sweeps at his face in slow motion, then slams the ground beside him (full speed)
    let head: P2, ang: number;
    if (t < SNAP) { const u = seg(t, 0, SNAP); head = lp2([118, -196], [53, -199], u); ang = lerp(168, 196, u); }
    else if (t < SMASH + 0.22) { const u = Math.pow(seg(t, SNAP, SMASH), 2); head = lp2([53, -199], [112, -40], u); ang = lerp(196, 186, u); }
    else { const u = eio(seg(t, SMASH + 0.22, 2.1)); ang = lerp(186, 25, u); head = [0, 0]; }
    if (t < SMASH + 0.22) {
      const grip: P2 = [head[0] - SW_LEN * FSW * Math.sin(rad(ang)), head[1] + SW_LEN * FSW * Math.cos(rad(ang))];
      const f = hover(grip[0] + 44 * FS0, grip[1] - 6 * FS0, t < SNAP ? 'angry' : 'look', t < SNAP ? 2.6 : 22);
      f.y = grip[1] - 6 * FS0; f.s = FS0; f.legs = 'hold'; f.grip = grip;
      return {f, sw: {on: true, g: grip, ang, sc: FSW, by: 'fly', ghost: t < SNAP ? 1 : 0}};
    }
    // it lifts the swatter like a trophy and laughs while he walks into the screen
    const r = eio(seg(t, SMASH + 0.22, 2.1));
    const f = hover(lerp(173, 205, eout(Math.min(1, r * 1.6))), lerp(-249, -478, r), t < BONK ? 'look' : 'laugh', 22); f.s = FS0; f.legs = 'hold';
    if (t > BONK) f.shake = 1;
    f.grip = flyGrip(f);
    return {f, sw: {on: true, g: f.grip, ang: ang + (t > BONK ? 5 * Math.sin(t * 9) : 0), sc: FSW, by: 'fly', ghost: 0}};
  }
  if (t < S5) {
    // shot 3: lands on his head, rubs its legs, yawns, hops off right before the smack
    const headTop: P2 = [GX, -300];
    const seat: P2 = [headTop[0] + 6, headTop[1] - 66];
    let f: FS;
    if (t < LAND) { const u = eio(seg(t, S3, LAND)); f = hover(lerp(-150, seat[0], u), lerp(-470, seat[1], u) - 30 * Math.sin(Math.PI * u), 'calm'); }
    else if (t < HOP) {
      f = {x: seat[0], y: seat[1], s: 1, rot: 0, mood: 'smug', flap: 0, legs: 'sit', grip: [0, 0], rub: 0, shake: 0};
      if (t > RUB0 && t < RUB1) f.legs = 'rub';
      if (t > YAWN0 && t < YAWN1) f.mood = 'yawn';
      if (t > YAWN1 && t < HOP) f.mood = 'look';
    } else {
      const u = eout(seg(t, HOP, HOP + 0.3));
      f = hover(lerp(seat[0], -80, u), lerp(seat[1], -470, u), t < SMACK + 0.05 ? 'smug' : 'laugh');
      if (t > SMACK + 0.05 && t < S4 + 0.4) f.shake = 1;
      if (t > S4 + 0.4) f.mood = 'smug';
    }
    // the giant hand's swatter
    let sw: SwS = off;
    if (t > HAND0 && t < S4) {
      const rise = eout(seg(t, HAND0, WIND));
      let g: P2 = lp2([470, 200], [318, -250], rise), ang = lerp(320, 350, rise);
      if (t > SW0) ang = lerp(350, 300, seg(t, SW0, SNAP2));
      if (t > SNAP2) ang = lerp(300, 287, Math.pow(seg(t, SNAP2, SMACK), 2));
      if (t > SMACK) { ang = 287 + 12 * eout(seg(t, SMACK, SMACK + 0.25)); g = lp2(g, [620, -120], eio(seg(t, 7.95, S4))); }
      sw = {on: true, g, ang, sc: 0.85, by: 'hand', ghost: t > SW0 && t < SNAP2 ? 1 : 0};
    }
    return {f, sw};
  }
  if (t < POOF1) {   // shot 5: lands on top of his swelling eye, smug; takes off when he tips over and laughs
    const eyeTop = (tt: number): P2 => { const g = guyAt(tt), hw = headWorld(g), d = domeGeo(g.E, 0); return [hw[0] - d.cx, hw[1] + d.cy - d.ry - 53]; };
    if (t < TIP0) {
      const seat = eyeTop(t), u = eout(seg(t, INF0 + 0.1, INF1 + 0.15));
      const f = hover(lerp(-600, seat[0], u), lerp(-720, seat[1], u) - 40 * Math.sin(Math.PI * u), 'smug'); f.s = 0.8;
      if (u >= 1) { f.legs = 'sit'; f.flap = 0; f.y = seat[1]; }
      return {f, sw: off};
    }
    const s0 = eyeTop(TIP0 - 0.001), u = eout(seg(t, TIP0, TIP0 + 0.35));
    const f = hover(lerp(s0[0], -150, u), lerp(s0[1], -640, u), t < THUD ? 'look' : 'laugh'); f.s = 0.8; if (t > THUD) f.shake = 1;
    return {f, sw: off};
  }
  // shot 6: zips off to fetch a swatter, comes back with it, swings = frame 0
  if (t < FLYIN0) { const u = eio(seg(t, FLYOUT, FLYIN0)); const f = hover(lerp(-150, -680, u), lerp(-640, -660, u), 'laugh'); f.s = 0.8; return {f, sw: off}; }
  if (t < SWING2) {
    const u = eout(seg(t, FLYIN0, FLYIN1));
    const f = hover(lerp(-560, F0[0], u), lerp(-600, F0[1], u), 'angry'); f.legs = 'hold'; f.s = FS0; f.grip = flyGrip(f);
    return {f, sw: {on: true, g: f.grip, ang: 112 + 6 * Math.sin(t * 7), sc: FSW, by: 'fly', ghost: 0}};
  }
  // swing into the frame-0 sweep (same path and speed as frame 0 from END on)
  const ang = t < END ? lerp(112, 168, eout(seg(t, SWING2, END))) : lerp(168, 196, (t - END) / SNAP);
  const head: P2 = t < END ? [0, 0] : lp2([118, -196], [53, -199], (t - END) / SNAP);
  const f = hover(F0[0], F0[1], 'angry', lerp(22, 2.6, seg(t, SWING2 + 0.3, END))); f.s = FS0; f.legs = 'hold';
  if (t >= END) { f.x = head[0] - SW_LEN * FSW * Math.sin(rad(ang)) + 44 * FS0; f.y = head[1] + SW_LEN * FSW * Math.cos(rad(ang)) - 6 * FS0; }
  f.grip = flyGrip(f);
  return {f, sw: {on: true, g: f.grip, ang, sc: FSW, by: 'fly', ghost: seg(t, END - 0.6, END - 0.2)}};
};

// ---------- camera (piecewise, hard cuts) ----------
const CAM0 = {x: 25, y: -347, k: 2.7};
const camFor = (t: number): {x: number; y: number; k: number} => {
  if (t < S3) {
    if (t < UP) { const u = eio(seg(t, 0, UP)); return {x: lerp(CAM0.x, 42, u), y: lerp(CAM0.y, -335, u), k: lerp(CAM0.k, 2.78, u)}; }
    const u = eio(seg(t, UP, BONK - 0.04)); return {x: lerp(42, 40, u), y: lerp(-335, -215, u), k: lerp(2.78, 2.6, u)};
  }
  if (t < S4) { const push = eout(seg(t, SMACK, SMACK + 0.22)); return {x: lerp(90, 70, push), y: lerp(-330, -305, push), k: lerp(2.14, 2.36, push) + 0.06 * seg(t, S3, SMACK)}; }
  if (t < S5) return {x: 60, y: -320, k: 2.2};
  const fall = eio(seg(t, TIP0 - 0.05, THUD + 0.1)) * (1 - eio(seg(t, UP1, UP2 + 0.1)));
  if (t < POOF1) { const u = eio(seg(t, INF0 - 0.1, INF1 + 0.25)); return {x: lerp(40, 20, u) - 80 * fall, y: lerp(-270, -300, u) + 20 * fall, k: Math.exp(lerp(Math.log(2.45), Math.log(1.7), u)) - 0.2 * fall}; }
  const u = eio(seg(t, 16.8, END - 0.1));
  return {x: lerp(20, CAM0.x, u) - 80 * fall, y: lerp(-300, CAM0.y, u) + 20 * fall, k: Math.exp(lerp(Math.log(1.7), Math.log(CAM0.k), u)) - 0.2 * fall};
};

export const FlyScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t), {f, sw} = flyAt(t);
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 4, 7) + hit(t, SMASH, 9, 7) + hit(t, BONK, 17, 6) + hit(t, SMACK, 13, 6) + hit(t, THUD, 10, 6) + hit(t, S4, 3, 8));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const hw = headWorld(g);
  const swH = sw.on ? swatHead(sw.g, sw.ang, sw.sc) : ([0, 0] as P2);
  // stickers (each ends before its cut)
  const st = {
    slow: (t < SNAP ? 1 : 1 - seg(t, SNAP, SNAP + 0.12)), dodge: popIn(t, T.dodge, 0.25) * (1 - seg(t, UP + 0.05, UP + 0.2)),
    smack1: popIn(t, SMASH, 0.2) * (1 - seg(t, 1.95, 2.1)), bonk: popIn(t, BONK, 0.22) * (1 - seg(t, 2.98, 3.13)),
    slow2: popIn(t, SW0 + 0.12, 0.3) * (1 - seg(t, SNAP2, SNAP2 + 0.1)), yawn: popIn(t, YAWN0 + 0.1, 0.25) * (1 - seg(t, YAWN1, YAWN1 + 0.12)),
    rub: popIn(t, RUB0 + 0.15, 0.25) * (1 - seg(t, RUB1 - 0.1, RUB1)),
    you: sw.by === 'hand' && sw.on ? popIn(t, HAND0 + 0.3, 0.25) * (1 - seg(t, SW0 + 0.6, SW0 + 0.75)) : 0,
    smack2: popIn(t, SMACK, 0.2) * (1 - seg(t, 8.0, 8.15)), miss: popIn(t, SMACK + 0.1, 0.25) * (1 - seg(t, S4 - 0.12, S4)),
    thud: popIn(t, THUD, 0.2) * (1 - seg(t, 16.0 + 0.0, POOF1 - 0.02)), poof1: popIn(t, POOF1, 0.22) * (1 - seg(t, 16.55, 16.7)),
    fight: popIn(t, POOF2 + 0.04, 0.3) * (1 - seg(t, 18.3, 18.45)), poof2: popIn(t, POOF2, 0.22) * (1 - seg(t, 17.72, 17.85)),
  };
  const stars = (t > BONK + 0.15 && t < S3) || (t > SMACK + 0.15 && t < S5) || (t > THUD + 0.05 && t < POOF1) ? 1 : 0;
  const glass = t >= BONK && t < S3 ? 1 : 0;
  const cnt4 = seg(t, T.four, T.four + 0.45);
  const c4S = popIn(t, T.four - 0.06, 0.3) * (1 - seg(t, SMACK - 0.12, SMACK)) * (t >= S3 ? 1 : 0);
  // the meter-wide eye + tape
  const d = domeGeo(g.E, 0);
  const tapeP = eio(seg(t, TAPE0, TAPE0 + 0.32)) * (1 - eio(seg(t, TIP0 - 0.14, TIP0)));
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`fFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
        <radialGradient id={`fFacei${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      <Sky />
      <Layer cam={cam} z={2600}><W><g>
        {[-1700, -500, 700, 1900].map((x, i) => <ellipse key={i} cx={x} cy={-20} rx={720} ry={220} fill={HILL} stroke={INK} strokeWidth={6} />)}
        <Tree x={-760} s={1.5} /><Tree x={-120} s={1.15} /><Tree x={820} s={1.35} /><Tree x={1650} s={1.5} />
        <rect x={-6000} y={-4} width={12000} height={4000} fill={GRASS} />
        <path d="M -6000 -4 H 6000" stroke={INK} strokeWidth={6} />
      </g></W></Layer>
      <Layer cam={cam} z={1000}><W><g>
        <rect x={-4000} y={0} width={8000} height={3000} fill={GRASS} />
        <path d="M -4000 0 H 4000" stroke={INK} strokeWidth={6} />
        <ellipse cx={GX + 10} cy={18} rx={260} ry={26} fill={PATH} />
        {Array.from({length: 26}, (_, i) => { const x = -1400 + i * 120 + ((i * 53) % 50); return <path key={i} d={`M ${x} 34 l 8 -22 l 6 22 l 8 -16 l 4 16`} stroke={GRASS2} strokeWidth={5} fill="none" strokeLinejoin="round" />; })}
      </g></W></Layer>
      {/* slow-motion ghosts of the swatter + air ripples (see-through: own layer without the paper edge) */}
      {sw.on && sw.ghost > 0.01 ? <Layer cam={cam} z={1000} paper={false}><W><g>
        {[3, 2, 1].map((i) => {
          const dA = (sw.by === 'fly' ? -6 : 7) * i;
          return <g key={i} opacity={(0.3 - i * 0.075) * sw.ghost}><Swatter g={sw.g} ang={sw.ang + dA} sc={sw.sc} /></g>;
        })}
        {[0, 1].map((i) => { const ph = ((t * 0.55 + i * 0.5) % 1); return <circle key={'r' + i} cx={swH[0]} cy={swH[1]} r={70 * sw.sc + 120 * ph} fill="none" stroke="#FFFFFF" strokeWidth={6} opacity={0.75 * (1 - ph) * sw.ghost} />; })}
      </g></W></Layer> : null}
      <Layer cam={cam} z={1000}>
        {/* the swatter behind him when the hand holds it (it comes over his head) */}
        <GuyF t={t} g={g} uid={uid} />
        {sw.on ? <W><Swatter g={sw.g} ang={sw.ang} sc={sw.sc} /></W> : null}
        <FlyBug t={t} f={f} uid={uid} />
        {sw.on && sw.by === 'hand' ? <W><BigHand g={sw.g} ang={sw.ang} /></W> : null}
        {t > S5 && t < TIP0 + 0.02 ? <Tape x0={hw[0] + d.cx - d.rx * 1.0} x1={hw[0] + d.cx + d.rx * 1.0} y={hw[1] + d.cy + 6} p={tapeP} /> : null}
        <Poof t={t} at={POOF1} x={hw[0]} y={hw[1]} s={1.1} />
        <Poof t={t} at={POOF2} x={hw[0]} y={hw[1]} s={0.9} />
        {t > SMASH && t < BONK ? <Puffs t={t} born={SMASH} x={swatHead(sw.g, sw.ang, sw.sc)[0]} y={-10} n={6} life={0.5} size={26} vy={-60} color="#F3EBD6" seed={5} /> : null}
        {[0, 1, 2].map((i) => { const a = t * 6 + (i * 2 * Math.PI) / 3; const r = 64 * g.app;
          return <Star key={i} x={hw[0] + Math.cos(a) * 1.45 * r} y={hw[1] - 1.4 * r + Math.sin(a) * 0.25 * r} s={stars * 0.5 * g.app} rot={t * 200} />; })}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={-22} y={-318} s={st.slow} text="SLOW-MO" size={46} rot={-6} fill={GOLD} />
        <Txt x={-24} y={-392} s={st.dodge} text="DODGE" size={46} rot={-7} fill="#FFFFFF" />
        <Txt x={150} y={-112} s={st.smack1} text="SMACK" size={40} rot={8} fill="#FFFFFF" />
        <Txt x={GX - 10} y={-420} s={st.bonk} text="BONK" size={84} rot={-6} fill="#FFFFFF" />
        <Txt x={240} y={-560} s={st.slow2} text="SLOW-MO" size={46} rot={6} fill={GOLD} />
        <Txt x={-50} y={-488} s={st.rub} text="RUB RUB" size={36} rot={-6} fill="#FFFFFF" />
        <Txt x={-55} y={-470} s={st.yawn} text="YAWN" size={46} rot={-8} fill="#FFFFFF" />
        <Txt x={GX + 160} y={-420} s={st.smack2} text="SMACK" size={58} rot={8} fill={RED} />
        <Txt x={-40} y={-605} s={st.miss} text="MISS" size={52} rot={-8} fill={GOLD} />
        <Txt x={-210} y={-170} s={st.thud} text="THUD" size={70} rot={-8} fill="#FFFFFF" />
        <Txt x={hw[0] + 130} y={hw[1] - 120} s={st.poof1} text="POOF" size={50} rot={8} fill="#FFFFFF" />
        <Txt x={-5} y={-470} s={st.fight} text="FLY FIGHT" size={38} rot={-6} fill={GOLD} />
        <Txt x={sw.g[0] - 70} y={sw.g[1] + 95} s={st.you} text="YOU" size={44} rot={-8} fill="#FFFFFF" />
        <Txt x={GX - 160} y={-330} s={st.poof2} text="POOF" size={46} rot={-8} fill="#FFFFFF" />
      </Layer>}
      {/* the glass of your screen: a tint, glare streaks, the smudge his face leaves and the trails as he slides down */}
      {glass && !thumb ? (() => {
        const k = 1000 / (1000 - cam.z), hy = 960 + (hw[1] - cam.y) * k, hx = 540 + (hw[0] - cam.x) * k, y0 = 908, gp = popIn(t, BONK, 0.15);
        return <AbsoluteFill style={{pointerEvents: 'none'}}>
          <svg width="100%" height="100%" viewBox="0 0 1080 1920" preserveAspectRatio="none" style={{position: 'absolute', inset: 0}}>
            <rect width={1080} height={1920} fill="#CFE6F5" opacity={0.16 * gp} />
            {t > SLIDE0 ? [-1, 1].map((sd) => <rect key={sd} x={hx + sd * 150 - 55} y={y0} width={110} height={Math.max(0, hy - y0)} rx={55} fill="#FFFFFF" opacity={0.22} />) : null}
            <ellipse cx={540} cy={y0} rx={330} ry={280} fill="#FFFFFF" opacity={0.16 * gp} />
            {[-1, 1].map((sd) => <ellipse key={sd} cx={540 + sd * 150} cy={y0 - 60} rx={120} ry={130} fill="#FFFFFF" opacity={0.2 * gp} />)}
            {[[120, 0.42, 80], [300, 0.26, 36], [780, 0.34, 64], [960, 0.22, 28]].map(([x, o, w], i) =>
              <path key={i} d={`M ${x} -40 L ${x + w} -40 L ${x + w - 520} 1960 L ${x - 520} 1960 Z`} fill="#FFFFFF" opacity={o * gp} />)}
          </svg>
        </AbsoluteFill>;
      })() : null}
      {thumb ? null : <>
        <Card text="ALMOST BLIND" top={600} left={540} color={RED} fg="#fff" rot={-4} s={popIn(t, T.almost - 0.03, 0.3) * (1 - seg(t, S3 - 0.14, S3)) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - T.blind) * 6))} size={70} />
        <Counter s={c4S} pulseK={t > T.four + 0.45 ? Math.max(0, 1 - (t - T.four - 0.45) * 4) : 0} value={`x${Math.max(1, Math.round(1 + 3 * cnt4))}`} label="SEES FASTER" icon={<FlyIcon />} top={1440} size={104} />
      </>}
      <EyeZoom t={t} s={popIn(t, S4 + 0.02, 0.35) * (1 - seg(t, X_OUT - 0.14, X_OUT)) * (t >= S4 ? 1 : 0)} uid={uid} />
      {thumb ? null : <MeterCard t={t} g={g} cam={cam} />}
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you had a fly's eyes??" handle="@buzz_doodle" likes="3.1K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so - 0.05} until={DURATION - LOOP_DUR - 0.4} text="Would you want fly eyes?" />
      </>}
    </AbsoluteFill>
  );
};
/** "1 METER" card that sits above the swollen eye (screen space, follows the eye) */
const MeterCard: React.FC<{t: number; g: GS; cam: {x: number; y: number; z: number}}> = ({t, g, cam}) => {
  const s = popIn(t, TAPE0 + 0.2, 0.3) * (1 - seg(t, TIP0 + 0.1, TIP0 + 0.25));
  if (s < 0.01) return null;
  const hw = headWorld(g), d = domeGeo(g.E, 0), k = 1000 / (1000 - cam.z);
  const x = 540 + (hw[0] + d.cx - cam.x) * k, y = 960 + (hw[1] + d.cy - d.ry - 40 - cam.y) * k;
  return <Card text="1 METER" top={y} left={x} color={GOLD} rot={5} s={s} size={64} />;
};

export const FlyVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const cues: Cue[] = [
    // frame 0: slow-motion swing (deep whoosh + slow wing beats)
    {f: 'whoosh_slow.wav', at: 0, db: -11, from: 0.42}, {f: 'flybuzz_slow.wav', at: 0, db: -15},
    {f: 'whoosh.wav', at: SNAP - 0.3, db: -19}, {f: 'flyby.wav', at: SNAP - 0.05, db: -21},
    {f: 'slap.wav', at: SMASH, db: -12}, {f: 'thud.wav', at: SMASH, db: -16}, {f: 'pop.wav', at: T.dodge, db: -26},
    // struts at us - BONK on the glass - slides down it
    {f: 'whoosh.wav', at: BONK - 0.32, db: -27},
    {f: 'bonk.wav', at: BONK, db: -5}, {f: 'thud.wav', at: BONK, db: -12}, {f: 'crowd_laugh.wav', at: BONK + 0.3, db: -30, to: 0.9},
    {f: 'squeak.wav', at: SLIDE0 + 0.05, db: -22}, {f: 'squeak.wav', at: SLIDE0 + 0.55, db: -24}, {f: 'pop.wav', at: T.blind, db: -23},
    {f: 'giggle.mp3', at: 2.6, db: -31, to: 0.6},
    // the fly lands on his head; YOU swing a swatter (slow motion); SMACK
    {f: 'whoosh.wav', at: S3 - 0.02, db: -30}, {f: 'flyby.wav', at: S3, db: -19}, {f: 'pop.wav', at: LAND, db: -27},
    {f: 'whoosh.wav', at: HAND0 + 0.05, db: -25},
    {f: 'whoosh_slow.wav', at: SW0, db: -19}, {f: 'whoosh_slow.wav', at: SW0 + 1.4, db: -21},
    ...ticks(T.four, T.four + 0.45, 3, -26), {f: 'ding.mp3', at: T.four + 0.47, db: -20},
    {f: 'tick.wav', at: RUB0 + 0.2, db: -29}, {f: 'tick2.wav', at: RUB0 + 0.36, db: -29}, {f: 'tick.wav', at: RUB0 + 0.52, db: -29}, {f: 'tick2.wav', at: RUB0 + 0.68, db: -29},
    {f: 'flyby.wav', at: HOP - 0.02, db: -21},
    {f: 'whoosh.wav', at: SNAP2 - 0.2, db: -19}, {f: 'slap.wav', at: SMACK, db: -6}, {f: 'bonk.wav', at: SMACK + 0.01, db: -13},
    {f: 'twang.mp3', at: SMACK + 0.08, db: -17, to: 0.6}, {f: 'crowd_laugh.wav', at: SMACK + 0.15, db: -26, to: 1.2},
    // ZOOM: FLY EYE - count, then the mosaic
    {f: 'zap.wav', at: S4, db: -26}, {f: 'pop.wav', at: S4 + 0.06, db: -24}, {f: 'whisper_whoosh.wav', at: ZOOM0 - 0.6, db: -25},
    ...ticks(CNT0, CNT1, 16, -31), {f: 'ding.mp3', at: CNT1 + 0.02, db: -21},
    {f: 'shimmer.wav', at: MOS0, db: -20}, {f: 'pop.wav', at: T.one2, db: -24}, {f: 'pop.wav', at: MOS1, db: -25},
    // the eyes swell to a meter wide, he tips over
    {f: 'whoosh.wav', at: S5 - 0.02, db: -30},
    {f: 'stretch.wav', at: INF0 - 0.1, db: -13}, {f: 'whir.mp3', at: TAPE0, db: -24, to: 0.4}, {f: 'pop.wav', at: TAPE0 + 0.2, db: -22},
    {f: 'whoosh.wav', at: TIP0 + 0.05, db: -22}, {f: 'thud.wav', at: THUD, db: -5}, {f: 'crowd_laugh.wav', at: THUD + 0.1, db: -27, to: 1.0},
    ...ctaCues(T.cta),
    // POOF - his own eyes; the fly comes back armed; POOF - fly eyes on; slow-motion swing = frame 0
    {f: 'pop.wav', at: POOF1, db: -15}, {f: 'pfft.wav', at: POOF1 + 0.02, db: -21}, {f: 'twang.mp3', at: UP1, db: -19, to: 0.5},
    {f: 'flyby.wav', at: FLYOUT, db: -20}, {f: 'flyby.wav', at: FLYIN0, db: -16}, {f: 'flybuzz.wav', at: FLYIN1 - 0.1, db: -24, to: 0.8},
    {f: 'pop.wav', at: POOF2, db: -15}, {f: 'shimmer.wav', at: POOF2 + 0.02, db: -24},
    {f: 'whoosh_slow.wav', at: END - 0.55, db: -19},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -25},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<FlyScene t={0} />}>
        <FlyScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="flyeyes/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const FlyWide: React.FC = () => <WideFit.Provider value={0.72}><FlyVideo /></WideFit.Provider>;
