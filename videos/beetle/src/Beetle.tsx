// "What if you had a dung beetle's strength?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// (1) frame 0: he holds a tower of 13 elephants over his head with a grin (EASY), the smug dung beetle beside him holds
// its dung ball up the same way; (2) 2.12 s CRUNCH: his spine gives - close-up, an X-ray flash of his spine, he squashes;
// (3) the beetle pulls its dung ball on a rope while the ball swells and the counter races 0 -> 1,141 x ITS WEIGHT;
// (4) zoom out to the whole tower: numbers pop on the elephants, 80,000 KG, the 13th drops on top, he squishes flatter,
// eyes BOING (crowd laugh); (5) POOF - the beetle at its real size (1 CM ruler, TINY), still tugging the giant ball;
// (6) X-RAY: YOUR SPINE - 24 little bones counted, an elephant foot (80,000 KG) stomps, CRACK, DANGER; (7) he pops back
// (BOING), squats and lifts with his legs = frame 0. Comment bubble opener, CTA, CommentAsk (no either/or ending).
// All drawn in code; the guy is the code-drawn front view (camel / bat wings / jump) with arms and legs on a small IK rig.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Sweat, Poof} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.12; times are video time). Last word ends 16.46 s; + 0.84 s for the push.
export const DURATION = 17.3;
export const T = {
  get: 0.10, dung: 0.46, strength: 1.28, crush: 2.10, spine: 2.81,                    // "Get a dung beetle's strength, and you'd crush your own spine."
  this: 3.56, beetle: 3.78, pull: 4.31, thousand: 4.99, times: 5.56, weight: 6.06,      // "This beetle can pull over a thousand times its weight."
  forYou: 6.46, you: 6.60, eighty: 7.46, tonnes: 7.74,                               // "For you, that's eighty tonnes."
  thirteen: 8.62, elephants: 9.26,                                                   // "Thirteen elephants."
  gets: 10.19, because: 10.90, tiny: 11.51,                                          // "It gets away with it because it's tiny."
  your: 12.05, spine2: 12.22, stack: 13.15, little: 13.44, bones: 13.65,             // "Your spine is just a stack of little bones."
  so: 14.42, now: 14.74, lifts: 15.28, legs: 15.74,                                  // "So now he lifts with his legs."
  cta: 11.62,
};
// beats (shot changes are hard cuts)
const PRESS0 = 0.18, STRAIN = 1.55;                                     // frame 0: one easy press, then the stack creaks
const S2 = 1.95, CRUNCH = 2.12;                                         // close-up: his spine gives
const S3 = 3.50, CNT0 = 4.45;                                           // the beetle pulls its ball: 0 -> 1,141 x its weight
const S4 = 6.40, ZOOM0 = 6.74, ZOOM1 = 7.50, NUM0 = 7.30, NUM_DT = 0.095;   // the whole tower, 80,000 KG
const DROP13 = 8.62, LAND13 = 8.86;                                     // the 13th elephant drops on top
const S4B = 9.12, SQUISH = 9.16;                                        // close-up: he squishes flatter, eyes BOING
const S5 = 10.05, SHRINK = 10.30, TUG = 10.95;                          // POOF - the beetle at its real size
const S6 = 11.95, COUNT0 = 12.45, COUNT1 = 13.55, STOMP = 13.72, X_OUT = 14.33;   // X-RAY: YOUR SPINE
const S7 = 14.35, RECOVER = 14.44, SQUAT0 = 14.72, SQUAT1 = 15.16, DRIVE = 15.28, TOP = 15.72;   // lifts with his legs

const GOLD = '#FFD43B', RED = '#E2453C', FACE_C = '#F1EFEA';
const ELE = '#A9B3BF', ELE2 = '#8D99A7', ELE_LT = '#C9D0D8', EAR_IN = '#E8B4BE';
const BEET = '#2C2523', BEET_LEG = '#3B302C', BEET_HI = '#6C7FA0';
const DUNG = '#8B5B2F', DUNG2 = '#6B4321', DUNG_LT = '#B07D45', STRAW = '#E9C76B';
const GRASS = '#DCE5AE', GRASS2 = '#C3D18E', DIRT = '#E6D8B8';
const GX = 40;          // his feet
const BX = -190;        // the beetle standing beside him (frame 0)
const FONT_W = 900;

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.2));
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={FONT_W} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${(ex - w).toFixed(1)} ${y.toFixed(1)} A ${rx} ${ry} 0 ${h > 0.5 ? 1 : 0} 1 ${(ex + w).toFixed(1)} ${y.toFixed(1)} Z`;
};
const cbez = (a: P2, c1: P2, c2: P2, b: P2, n = 16): P2[] => Array.from({length: n + 1}, (_, i) => {
  const u = i / n, v = 1 - u;
  return [v * v * v * a[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * b[0],
    v * v * v * a[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * b[1]] as P2;
});
/** a ribbon along pts tapering from w0 to w1 with a round tip (the trunk) */
const taper = (pts: P2[], w0: number, w1: number) => {
  const n = pts.length, L: P2[] = [], R: P2[] = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len, w = lerp(w0, w1, i / (n - 1)) / 2;
    L.push([pts[i][0] + nx * w, pts[i][1] + ny * w]); R.push([pts[i][0] - nx * w, pts[i][1] - ny * w]);
  }
  return `M ${P(L[0])} ${L.slice(1).map((p) => 'L ' + P(p)).join(' ')} A ${w1 / 2} ${w1 / 2} 0 0 1 ${P(R[n - 1])} ${R.slice(0, n - 1).reverse().map((p) => 'L ' + P(p)).join(' ')} Z`;
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

// ---------- the guy's head (from videos/jump, + grit / pop) ----------
type Mood = 'joy' | 'happy' | 'focus' | 'grit' | 'worry' | 'oof' | 'pop' | 'dizzy';
const Head: React.FC<{t: number; mood: Mood; look: P2; uid: string}> = ({t, mood, look, uid}) => {
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (mood === 'joy' || mood === 'happy') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'oof') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === 'dizzy') return <path key={sd} d={`M ${ex} ${ey} m -2 0 a 3 3 0 1 1 4 2 a 7 7 0 1 1 -9 -6 a 11 11 0 1 1 15 10`} transform={`rotate(${t * 600 * sd} ${ex} ${ey})`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
    if (mood === 'pop') {
      // eyes popped out on springs, wobbling
      const k = Math.max(0, t - SQUISH);
      const b = 1.7 + 0.25 * Math.exp(-3.5 * k) * Math.sin(k * 26);
      const ox = ex + sd * 16, oy = ey - 30;
      return (
        <g key={sd}>
          <path d={`M ${ex} ${ey + 2} q ${-6 * sd} -6 ${4 * sd} -10 q ${10 * sd} -4 ${2 * sd} -10 q ${-8 * sd} -6 ${6 * sd} -10`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
          <ellipse cx={ox} cy={oy} rx={12 * b} ry={14 * b} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
          <circle cx={ox + 1} cy={oy + 2} r={5} fill={INK} />
          <circle cx={ox - 1} cy={oy} r={1.8} fill="#fff" />
        </g>
      );
    }
    const big = mood === 'worry' ? 1.12 : 1;
    const rx = 12 * big, ry = 15 * big;
    const px = ex + look[0] * 4.5, py = ey + look[1] * 5;
    const lid = mood === 'focus' || mood === 'grit' ? 0.36 : 0;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={px} cy={py + lid * 6} r={mood === 'worry' ? 5.2 : 6.3} fill={INK} />
        <circle cx={px - 1.5} cy={py - 2 + lid * 6} r={2} fill="#fff" />
        {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brow = (sd: number) => {
    let d = '';
    if (mood === 'joy' || mood === 'happy') d = `M ${sd * 12} -44 Q ${sd * 24} -52 ${sd * 37} -46`;
    else if (mood === 'focus') d = `M ${sd * 10} -33 L ${sd * 37} -43`;
    else if (mood === 'grit') d = `M ${sd * 9} -31 L ${sd * 37} -44`;
    else if (mood === 'worry' || mood === 'dizzy') d = `M ${sd * 12} -43 L ${sd * 36} -34`;
    else if (mood === 'oof') d = `M ${sd * 8} -32 L ${sd * 36} -44`;
    else if (mood === 'pop') d = `M ${sd * 14} -64 L ${sd * 40} -72`;
    return d ? <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null;
  };
  let mouth: React.ReactNode = null;
  if (mood === 'joy') mouth = <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  else if (mood === 'happy') mouth = <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  else if (mood === 'focus') mouth = <path d="M -15 9 Q 0 5 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'grit') mouth = <g><rect x={-24} y={0} width={48} height={20} rx={7} fill="#FFFFFF" stroke={INK} strokeWidth={5} />
    <path d="M -22 10 H 22 M -10 1 V 19 M 2 1 V 19 M 14 1 V 19" stroke={INK} strokeWidth={3} /></g>;
  else if (mood === 'worry' || mood === 'dizzy') mouth = <path d={`M -18 10 q 6 ${mood === 'dizzy' ? -6 + 3 * Math.sin(t * 14) : -6} 12 0 t 12 0 t 12 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (mood === 'oof') mouth = <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (mood === 'pop') mouth = <g><ellipse cx={0} cy={12} rx={20} ry={24} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={24} rx={11} ry={7} fill="#E4677A" /></g>;
  return (
    <g>
      <circle r={HEAD_R + 1} fill={`url(#bFace${uid})`} stroke={INK} strokeWidth={6.5} />
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)">{mouth}</g>
    </g>
  );
};

// ---------- the guy: front view on a small IK rig (feet at 0) ----------
type GS = {x: number; sq: number; wide: number; hip: number; knee: number; ext: number; mood: Mood; look: P2;
  sweat: number; xray: number; crack: number; trem: number};
type Rig = {hipY: number; shY: number; tw: number; headY: number; shX: number; handX: number; handY: number};
const rig = (g: GS): Rig => {
  const hipY = -g.hip, shY = hipY - 112 * g.sq, tw = 47 * g.wide;
  const headY = shY - lerp(30, 53, clamp((g.sq - 0.36) / 0.64));
  return {hipY, shY, tw, headY, shX: tw - 9, handX: 56 + (g.wide - 1) * 34, handY: shY + 22 - g.ext};
};
const torsoD = (tw: number, top: number, bot: number) => {
  const h = bot - top, r1 = Math.min(34, h * 0.3), r2 = Math.min(29, h * 0.26), sw = tw * 0.6;
  return `M ${-sw} ${top} C ${-tw + 5} ${top + r1 * 0.18} ${-tw} ${top + r1 * 0.5} ${-tw} ${top + r1} L ${-tw + 1} ${bot - r2} Q ${-tw + 1} ${bot} ${-tw + r2} ${bot} ` +
    `L ${tw - r2} ${bot} Q ${tw - 1} ${bot} ${tw - 1} ${bot - r2} L ${tw} ${top + r1} C ${tw} ${top + r1 * 0.5} ${tw - 5} ${top + r1 * 0.18} ${sw} ${top} Z`;
};
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
const GuyB: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  const r = rig(g);
  const jig = g.trem * 2.4 * Math.sin(t * 71);
  const bot = r.hipY + 13;
  const footX = 27 + g.knee * 0.25;
  // the spine stack inside the torso (shown in the X-ray flash)
  const nV = 8, span = bot - 8 - (r.shY + 12);
  return (
    <W><g transform={`translate(${(g.x + jig).toFixed(1)} 0)`}>
      {/* legs + feet */}
      {[-1, 1].map((sd) => <Limb key={'l' + sd} S={[sd * 19, r.hipY + 4]} H={[sd * footX, -12]} L={37} sd={-sd} w={30} hand={false} />)}
      {[-1, 1].map((sd) => <ellipse key={'f' + sd} cx={sd * (footX + 2)} cy={-7} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />)}
      {/* torso */}
      <path d={torsoD(r.tw, r.shY, bot)} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {g.xray > 0.01 ? <g opacity={g.xray}>
        <path d={torsoD(r.tw - 3, r.shY + 3, bot - 3)} fill="#1C2C4C" />
        {Array.from({length: nV}, (_, i) => {
          const y = r.shY + 12 + (span / nV) * i, h = (span / nV) * 0.68, w = 30 - i * 0.6 + (g.sq < 0.8 ? 6 : 0);
          return <g key={i}>
            <rect x={-w / 2} y={y} width={w} height={h} rx={h * 0.35} fill="#F4F1E6" stroke="#9FC3F0" strokeWidth={2.5} />
            {g.crack > 0 && i > 2 ? <path d={`M ${-w / 2 + 2} ${y + h * 0.5} l 7 -4 l 6 6 l 7 -6 l 6 5`} stroke={RED} strokeWidth={2.5} fill="none" /> : null}
          </g>;
        })}
      </g> : null}
      {/* squash folds */}
      {g.sq < 0.9 ? [-1, 1].map((sd) => <g key={'z' + sd}>
        {[0.3, 0.62].map((f) => <path key={f} d={`M ${sd * (r.tw - 2)} ${r.shY + (bot - r.shY) * f - 7} l ${-sd * 10} 7 l ${sd * 10} 7`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />)}
      </g>) : null}
      {/* arms up to the load */}
      {[-1, 1].map((sd) => <Limb key={'a' + sd} S={[sd * r.shX, r.shY + 22]} H={[sd * r.handX, r.handY]} L={77} sd={sd} />)}
      <g transform={`translate(0 ${r.headY.toFixed(1)}) rotate(${(g.trem * 1.6 * Math.sin(t * 53)).toFixed(2)})`}><Head t={t} mood={g.mood} look={g.look} uid={uid} /></g>
      {g.sweat > 0.01 ? <Sweat x={HEAD_R - 4} y={r.headY - 46 + 24 * ((t * 0.9) % 1)} s={0.85 * g.sweat} raw /> : null}
    </g></W>
  );
};

// ---------- elephants ----------
type EFace = 'calm' | 'worry' | 'smile' | 'sleep' | 'whee' | 'smug' | 'scared';
/** a chunky cartoon elephant, side view facing right (dir -1 = left), feet at (0,0); dangle = held up by the belly */
const Elephant: React.FC<{t: number; face: EFace; dir: number; dangle?: boolean; trunk?: number; seed: number; sy?: number}> = ({t, face, dir, dangle = false, trunk = 0, seed, sy = 1}) => {
  const flap = 1 - 0.13 * Math.sin(t * 5.2 + seed * 1.7);
  const leg = (x: number, far: boolean, sd: number) => (
    <g key={x} transform={dangle ? `rotate(${(sd * 9 + 4 * Math.sin(t * 6.5 + seed + sd)).toFixed(2)} ${x} -84)` : undefined}>
      <path d={`M ${x - 27} -96 L ${x - 27} -9 Q ${x - 27} 0 ${x - 18} 0 L ${x + 18} 0 Q ${x + 27} 0 ${x + 27} -9 L ${x + 27} -96 Z`} fill={far ? ELE2 : ELE} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {!far ? [-13, 0, 13].map((dx) => <path key={dx} d={`M ${x + dx - 6} -1 Q ${x + dx} -11 ${x + dx + 6} -1`} fill="#F6F1E8" stroke={INK} strokeWidth={3.5} />) : null}
    </g>
  );
  const tr = (a: P2, b: P2): P2 => lp2(a, b, trunk);
  const pts = cbez(tr([180, -146], [182, -158]), tr([214, -118], [226, -184]), tr([212, -62], [248, -226]), tr([236, -46], [226, -272]), 14);
  const ex = 148, ey = -180;
  let eye: React.ReactNode;
  if (face === 'smile' || face === 'sleep') eye = <path d={face === 'sleep' ? `M ${ex - 11} ${ey + 1} Q ${ex} ${ey + 8} ${ex + 11} ${ey + 1}` : `M ${ex - 11} ${ey + 3} Q ${ex} ${ey - 9} ${ex + 11} ${ey + 3}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else {
    const big = face === 'scared' || face === 'whee' ? 1.25 : 1;
    eye = <g>
      <ellipse cx={ex} cy={ey} rx={11 * big} ry={13 * big} fill="#fff" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + 2} cy={ey + 1} r={face === 'scared' ? 4 : 5.5} fill={INK} />
      {face === 'smug' ? <path d={lidPath(ex, ey, 11.5, 13.5, 0.46)} fill={ELE} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
    </g>;
  }
  const brow = face === 'worry' || face === 'scared' ? `M ${ex - 14} ${ey - 26} L ${ex + 12} ${ey - 18}` : face === 'whee' ? `M ${ex - 14} ${ey - 26} Q ${ex} ${ey - 34} ${ex + 14} ${ey - 26}` : '';
  const mouthOpen = face === 'whee' || face === 'scared';
  return (
    <g transform={`scale(${dir} ${sy.toFixed(3)})`}>
      {leg(-72, true, -1)}{leg(98, true, 1)}
      <path d="M -160 -150 Q -194 -116 -182 -74" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />
      <path d="M -160 -150 Q -194 -116 -182 -74" stroke={ELE2} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M -191 -82 L -182 -54 L -171 -80 Z" fill={INK} />
      <ellipse cx={-14} cy={-130} rx={152} ry={96} fill="url(#bEle)" stroke={INK} strokeWidth={8} />
      <path d="M -118 -192 Q -40 -224 58 -202" stroke={ELE_LT} strokeWidth={11} fill="none" strokeLinecap="round" opacity={0.75} />
      {leg(-112, false, -1)}{leg(62, false, 1)}
      <circle cx={122} cy={-152} r={78} fill={ELE} stroke={INK} strokeWidth={8} />
      <path d={taper(pts, 42, 18)} fill={ELE} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {[4, 7, 10].map((i) => { const p = pts[i], q = pts[i + 1]; const a = Math.atan2(q[1] - p[1], q[0] - p[0]); const w = lerp(42, 18, i / 14) * 0.36;
        return <path key={i} d={`M ${P([p[0] - Math.sin(a) * w, p[1] + Math.cos(a) * w])} L ${P([p[0] + Math.sin(a) * w * 0.5, p[1] - Math.cos(a) * w * 0.5])}`} stroke={ELE2} strokeWidth={4} strokeLinecap="round" />; })}
      <path d="M 166 -116 Q 188 -94 212 -104 Q 192 -110 178 -126 Z" fill="#FFFDF4" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
      <g transform={`translate(106 0) scale(${flap.toFixed(3)} 1) translate(-106 0)`}>
        <path d="M 102 -214 C 40 -228 18 -150 38 -102 C 54 -70 98 -80 110 -112 Z" fill={ELE} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d="M 95 -197 C 54 -205 40 -152 53 -117 C 63 -96 90 -100 99 -122 Z" fill={EAR_IN} opacity={0.85} />
      </g>
      {eye}
      {brow ? <path d={brow} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
      {mouthOpen ? <ellipse cx={160} cy={-110} rx={9} ry={11} fill="#5A2328" stroke={INK} strokeWidth={4} />
        : <path d={face === 'worry' ? 'M 150 -108 q 6 -5 12 0' : 'M 148 -112 Q 156 -104 166 -110'} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />}
      <circle cx={132} cy={-150} r={9} fill="#F0A9B6" opacity={0.5} />
    </g>
  );
};
const LEVEL = 214;
const ES = (k: number) => Math.pow(0.965, k);
const EFACES: EFace[] = ['scared', 'calm', 'smile', 'sleep', 'worry', 'smug', 'smile', 'calm', 'sleep', 'worry', 'smile', 'calm', 'whee'];
type TowerS = {x: number; base: number; sway: number; n13: number; land: number; nums: number[]};
const towerTopY = (base: number) => { let y = base + 30; for (let k = 1; k < 13; k++) y -= LEVEL * ES(k - 1); return y; };
const Tower: React.FC<{t: number; s: TowerS}> = ({t, s}) => {
  const items: React.ReactNode[] = [];
  let y = s.base + 30;
  for (let k = 0; k < 13; k++) {
    if (k > 0) y -= LEVEL * ES(k - 1);
    const sc = ES(k), dir = k % 2 ? -1 : 1;
    const lean = s.sway * Math.pow(k / 12, 1.3) * Math.sin(t * 2 * Math.PI * 0.8 + k * 0.33);
    const x = s.x + lean + (k ? (rnd(k * 3.7) - 0.5) * 30 : 14);
    let dy = 0, sy = 1;
    if (k === 12) {
      if (s.n13 <= 0) continue;
      if (s.n13 < 1) dy = -1500 * (1 - s.n13 * s.n13);
      else sy = 1 - 0.16 * Math.exp(-7 * s.land) * Math.cos(s.land * 18);
    }
    const ns = s.nums[k] ?? 0;
    items.push(
      <g key={k} transform={`translate(${x.toFixed(1)} ${(y + dy).toFixed(1)}) scale(${sc.toFixed(4)})`}>
        <Elephant t={t} face={EFACES[k]} dir={dir} dangle={k === 0} trunk={k === 12 ? 1 : 0} seed={k} sy={sy} />
        {ns > 0.01 ? <g transform={`translate(${-14 * dir} -128) scale(${ns.toFixed(3)})`}>
          <circle r={50} fill="#FFFFFF" stroke={INK} strokeWidth={9} />
          <text y={4} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={FONT_W} fontSize={k === 12 ? 64 : 62} fill={k === 12 ? RED : INK}>{k + 1}</text>
        </g> : null}
      </g>,
    );
  }
  return <W><g>{items}</g></W>;
};

// ---------- the dung beetle (bull-headed dung beetle: shiny black, two curved horns) ----------
type BS = {x: number; s: number; pose: 'lift' | 'pull'; mood: 'smug' | 'laugh' | 'proud'; walk: number; toss: number;
  ballR: number; ballX: number; ballRot: number; wave: number};
const BugLeg: React.FC<{A: P2; F: P2; L1: number; L2: number; bend: number; far?: boolean; teeth?: boolean}> = ({A, F, L1, L2, bend, far, teeth}) => {
  const K = ik(A, F, L1, L2, bend);
  const col = far ? '#1E1918' : BEET_LEG;
  const a = Math.atan2(F[1] - K[1], F[0] - K[0]);
  return (
    <g>
      <path d={`M ${P(A)} L ${P(K)} L ${P(F)}`} stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={`M ${P(A)} L ${P(K)}`} stroke={col} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d={`M ${P(K)} L ${P(F)}`} stroke={col} strokeWidth={7} fill="none" strokeLinecap="round" />
      {teeth ? [0.3, 0.55, 0.8].map((f) => { const p = lp2(K, F, f); return <path key={f} d={`M ${P(p)} l ${(Math.cos(a - 1.9) * 10).toFixed(1)} ${(Math.sin(a - 1.9) * 10).toFixed(1)}`} stroke={INK} strokeWidth={5} strokeLinecap="round" />; }) : null}
      <path d={`M ${P(F)} l ${(Math.cos(a + 0.7) * 9).toFixed(1)} ${(Math.sin(a + 0.7) * 9).toFixed(1)} M ${P(F)} l ${(Math.cos(a - 0.7) * 9).toFixed(1)} ${(Math.sin(a - 0.7) * 9).toFixed(1)}`} stroke={INK} strokeWidth={4} strokeLinecap="round" />
    </g>
  );
};
const BugEyes: React.FC<{mood: BS['mood']; t: number; x: number; y: number; gap: number}> = ({mood, t, x, y, gap}) => (
  <g>
    {[-1, 1].map((sd) => {
      const ex = x + sd * gap, ey = y;
      if (mood === 'laugh') return <path key={sd} d={`M ${ex - 10} ${ey + 2} Q ${ex} ${ey - 9} ${ex + 10} ${ey + 2}`} stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" />;
      return <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={11} ry={13} fill="#FFFFFF" stroke={INK} strokeWidth={4} />
        <circle cx={ex + 1.5} cy={ey + 2} r={5.2} fill={INK} />
        {mood === 'smug' ? <path d={lidPath(ex, ey, 11.5, 13.5, 0.48)} fill={BEET} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /> : null}
      </g>;
    })}
    {mood === 'laugh' ? <path d={`M ${x - 14} ${y + 18} Q ${x} ${y + 34 + 3 * Math.sin(t * 30)} ${x + 14} ${y + 18} Z`} fill="#5A2328" stroke="#FFFFFF" strokeWidth={3} strokeLinejoin="round" />
      : <path d={mood === 'proud' ? `M ${x - 12} ${y + 20} Q ${x} ${y + 30} ${x + 12} ${y + 20}` : `M ${x - 12} ${y + 22} Q ${x + 2} ${y + 30} ${x + 14} ${y + 17}`} stroke="#FFFFFF" strokeWidth={4.5} fill="none" strokeLinecap="round" />}
  </g>
);
const DungBall: React.FC<{r: number; rot: number; t: number; flies?: boolean}> = ({r, rot, t, flies = true}) => (
  <g>
    <circle r={r} fill="url(#bDung)" stroke={INK} strokeWidth={6 + r * 0.012} />
    <g transform={`rotate(${rot.toFixed(1)})`}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => { const a = i * 0.9 + 0.3, d = r * (0.25 + 0.4 * rnd(i * 2.3)); return <circle key={i} cx={Math.cos(a) * d} cy={Math.sin(a) * d} r={r * (0.1 + 0.07 * rnd(i))} fill={DUNG2} opacity={0.55} />; })}
      {[0, 1, 2, 3, 4].map((i) => { const a = i * 1.27 + 0.8, d = r * (0.2 + 0.5 * rnd(i * 5.1)), L = r * 0.16; return <path key={'s' + i} d={`M ${Math.cos(a) * d} ${Math.sin(a) * d} l ${Math.cos(a + 1.2) * L} ${Math.sin(a + 1.2) * L}`} stroke={STRAW} strokeWidth={Math.max(3, r * 0.035)} strokeLinecap="round" />; })}
    </g>
    <path d={`M ${-r * 0.62} ${-r * 0.38} A ${r * 0.72} ${r * 0.72} 0 0 1 ${-r * 0.1} ${-r * 0.7}`} stroke={DUNG_LT} strokeWidth={Math.max(5, r * 0.07)} fill="none" strokeLinecap="round" />
    {flies ? [0, 1].map((i) => {
      const a = t * (2.6 + i) + i * 3, R = r + 34;
      const fx = Math.cos(a) * R, fy = -r * 0.3 + Math.sin(a * 1.3) * (r * 0.45 + 16);
      const wf = Math.sin(t * 80 + i) > 0 ? 1 : 0.6;
      return <g key={'f' + i} transform={`translate(${fx.toFixed(1)} ${fy.toFixed(1)})`}>
        <ellipse cx={-5} cy={-7} rx={7} ry={4 * wf} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} transform="rotate(-30 -5 -7)" />
        <ellipse cx={5} cy={-7} rx={7} ry={4 * wf} fill="#FFFFFF" stroke={INK} strokeWidth={2.5} transform="rotate(30 5 -7)" />
        <ellipse rx={7} ry={5} fill={INK} />
      </g>;
    }) : null}
  </g>
);
const Horns: React.FC<{x: number; y: number; sd: number; far?: boolean}> = ({x, y, sd, far}) => (
  <path d={`M ${x} ${y} C ${x + sd * 8} ${y - 26} ${x + sd * 26} ${y - 46} ${x + sd * 50} ${y - 52} C ${x + sd * 34} ${y - 40} ${x + sd * 22} ${y - 22} ${x + sd * 16} ${y + 2} Z`}
    fill={far ? '#1A1514' : BEET} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
);
/** standing up on its hind legs, front legs holding its dung ball over its head (it does what he does, smugly) */
const BeetleLift: React.FC<{t: number; b: BS}> = ({t, b}) => {
  const ballY = -312 - b.ballR - b.toss;
  return (
    <g>
      {[-1, 1].map((sd) => <BugLeg key={'h' + sd} A={[sd * 30, -62]} F={[sd * 50, 0]} L1={38} L2={40} bend={sd} />)}
      <ellipse cx={0} cy={-118} rx={64} ry={82} fill="url(#bShell)" stroke={INK} strokeWidth={7} />
      <path d="M 0 -196 V -40" stroke={INK} strokeWidth={4} />
      <path d="M -40 -160 Q -50 -120 -38 -76" stroke={BEET_HI} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
      {[-1, 1].map((sd) => <BugLeg key={'m' + sd} A={[sd * 52, -150]} F={[sd * 60, -104]} L1={34} L2={30} bend={sd} />)}
      <ellipse cx={0} cy={-206} rx={54} ry={32} fill={BEET} stroke={INK} strokeWidth={7} />
      <path d="M -30 -220 Q 0 -230 30 -220" stroke={BEET_HI} strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.7} />
      {[-1, 1].map((sd) => <BugLeg key={'fr' + sd} A={[sd * 40, -214]} F={[sd * (b.ballR * 0.62), ballY + b.ballR * 0.72]} L1={44} L2={44} bend={-sd} teeth />)}
      <Horns x={-20} y={-252} sd={-1} />
      <Horns x={20} y={-252} sd={1} />
      <ellipse cx={0} cy={-246} rx={38} ry={28} fill={BEET} stroke={INK} strokeWidth={6} />
      <BugEyes mood={b.mood} t={t} x={0} y={-252} gap={15} />
      <g transform={`translate(0 ${ballY.toFixed(1)})`}><DungBall r={b.ballR} rot={b.toss * 2} t={t} /></g>
    </g>
  );
};
/** walking on six legs, facing right, pulling a rope over its shoulder (the rope is drawn by the scene) */
const BeetleWalk: React.FC<{t: number; b: BS}> = ({t, b}) => {
  const ph = b.walk;
  const foot = (bx: number, off: number, stride: number): P2 => {
    const u = ((ph + off) % 1 + 1) % 1;
    if (u < 0.5) return [bx + stride * (0.5 - 2 * u), 0];
    const v = (u - 0.5) * 2;
    return [bx + stride * (-0.5 + v), -16 * Math.sin(Math.PI * v)];
  };
  const moving = b.walk !== 0;
  const st = moving ? 46 : 0;
  const bob = moving ? 3 * Math.sin(ph * 4 * Math.PI) : 0;
  const waveF: P2 = [150, -150 - 10 * Math.sin(t * 14)];
  return (
    <g transform={`translate(0 ${bob.toFixed(1)})`}>
      {/* far legs */}
      <BugLeg A={[70, -62]} F={foot(122, 0.5, st)} L1={40} L2={44} bend={1} far />
      <BugLeg A={[22, -54]} F={foot(36, 0, st)} L1={40} L2={44} bend={1} far />
      <BugLeg A={[-30, -56]} F={foot(-62, 0.5, st)} L1={40} L2={44} bend={-1} far />
      {/* shell (elytra) + pronotum + head */}
      <ellipse cx={-24} cy={-86} rx={98} ry={62} fill="url(#bShell)" stroke={INK} strokeWidth={7} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${-100 + i * 4} ${-76 - i * 18} Q -30 ${-116 - i * 22} ${50 - i * 8} ${-100 - i * 10}`} stroke="#463A36" strokeWidth={3} fill="none" opacity={0.8} />)}
      <path d="M -88 -112 Q -40 -146 20 -138" stroke={BEET_HI} strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.85} />
      <ellipse cx={58} cy={-86} rx={42} ry={44} fill={BEET} stroke={INK} strokeWidth={7} />
      <Horns x={86} y={-92} sd={-1} far />
      <ellipse cx={100} cy={-66} rx={32} ry={27} fill={BEET} stroke={INK} strokeWidth={6} />
      <Horns x={96} y={-86} sd={-1} />
      <path d="M 126 -62 l 14 -10 M 140 -72 l 4 -8 M 140 -72 l 8 -3 M 140 -72 l 7 4" stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <BugEyes mood={b.mood} t={t} x={108} y={-72} gap={12} />
      {/* near legs */}
      <BugLeg A={[74, -58]} F={b.wave > 0 ? waveF : foot(132, 0, st)} L1={42} L2={46} bend={b.wave > 0 ? -1 : 1} teeth />
      <BugLeg A={[26, -50]} F={foot(44, 0.5, st)} L1={42} L2={46} bend={1} />
      <BugLeg A={[-28, -52]} F={foot(-70, 0, st)} L1={42} L2={46} bend={-1} />
    </g>
  );
};

// ---------- props, set ----------
const Acacia: React.FC<{x: number; s: number}> = ({x, s}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -10 0 L -6 -150 Q -30 -200 -70 -214 M -6 -150 Q 20 -190 60 -206" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M -10 0 L -6 -150 Q -30 -200 -70 -214 M -6 -150 Q 20 -190 60 -206" stroke="#9A7650" strokeWidth={11} fill="none" strokeLinecap="round" />
    <path d="M -170 -214 Q -150 -262 -60 -266 Q 0 -290 70 -268 Q 160 -262 180 -218 Q 100 -200 0 -206 Q -100 -198 -170 -214 Z" fill="#9CBF6A" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </g>
);
const Ruler: React.FC<{x: number; s: number}> = ({x, s}) => s > 0.01 ? (
  <g transform={`translate(${x} -2) scale(${s.toFixed(3)})`}>
    <rect x={-22} y={-10} width={44} height={10} rx={2} fill={GOLD} stroke={INK} strokeWidth={2.5} />
    {Array.from({length: 11}, (_, i) => <path key={i} d={`M ${-20 + i * 4} -10 v ${i % 5 === 0 ? 6 : 3.5}`} stroke={INK} strokeWidth={1.4} />)}
    <text x={0} y={-22} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={FONT_W} fontSize={15} fill="#FFFFFF" stroke={INK} strokeWidth={3.4} style={{paintOrder: 'stroke'}}>1 CM</text>
  </g>
) : null;

// ---------- screen-space bits ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 450}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: FONT_W, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const Counter: React.FC<{s: number; pulseK: number; value: string; label: string; red: boolean; icon: React.ReactNode; left?: number; top?: number; size?: number; lsize?: number}> = ({s, pulseK, value, label, red, icon, left = 540, top = 1460, size = 112, lsize = 38}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(-2deg) scale(${(s * (1 + 0.08 * pulseK)).toFixed(3)})`,
    background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '8px 28px 12px', fontFamily: FONT, color: INK,
    display: 'flex', alignItems: 'center', gap: 20, whiteSpace: 'nowrap'}}>
    {icon}
    <div>
      <div style={{fontWeight: FONT_W, fontSize: size, lineHeight: 1, color: red ? RED : INK}}>{value}</div>
      <div style={{fontWeight: FONT_W, fontSize: lsize}}>{label}</div>
    </div>
  </div>
) : null;
const BugIcon = () => (
  <svg width={110} height={100} viewBox="-60 -55 120 100">
    {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 22} -6 l ${sd * 26} -10 M ${sd * 24} 10 l ${sd * 26} 6 M ${sd * 18} 24 l ${sd * 18} 16`} stroke={INK} strokeWidth={6} strokeLinecap="round" />)}
    <ellipse cx={0} cy={12} rx={30} ry={30} fill={BEET} stroke={INK} strokeWidth={5} />
    <ellipse cx={0} cy={-24} rx={20} ry={13} fill={BEET} stroke={INK} strokeWidth={5} />
    <path d="M -12 -32 q -8 -14 -22 -18 M 12 -32 q 8 -14 22 -18" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    <path d="M -14 0 Q -18 14 -12 28" stroke={BEET_HI} strokeWidth={5} fill="none" strokeLinecap="round" />
  </svg>
);
const EleIcon = () => (
  <svg width={110} height={100} viewBox="-60 -55 120 100">
    <ellipse cx={-8} cy={2} rx={36} ry={34} fill={ELE} stroke={INK} strokeWidth={5} />
    <path d="M -38 -18 C -64 -22 -64 24 -40 26 Z" fill={EAR_IN} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 20 10 Q 40 18 36 40 L 26 40 Q 28 26 14 22 Z" fill={ELE} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <circle cx={4} cy={-8} r={5} fill={INK} />
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
      <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
    </g>
    <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
  </svg>
);
// 24 movable vertebrae, top to bottom: 7 neck, 12 chest, 5 lower back
const VERT = Array.from({length: 24}, (_, i) => ({h: i < 7 ? 12 : i < 19 ? 15.5 : 22, w: i < 7 ? 38 : i < 19 ? 46 : 58}));
const SPINE_BOT = 330;
/** X-RAY: YOUR SPINE - the stack is counted bone by bone, then an elephant foot (80,000 KG) stomps: it crunches */
const SpineXRay: React.FC<{t: number; s: number; uid: string}> = ({t, s, uid}) => {
  if (s < 0.01) return null;
  const cnt = Math.floor(24 * seg(t, COUNT0, COUNT1) + 0.0001);
  const press = eout(seg(t, STOMP, STOMP + 0.14));
  const squish = 1 - 0.36 * press;
  const gap = 5.5 * (1 - 0.75 * press);
  // stack from the bottom up so the pelvis stays put
  const rows: {y: number; h: number; w: number; i: number}[] = [];
  let y = SPINE_BOT;
  for (let i = 23; i >= 0; i--) { const h = VERT[i].h * squish; y -= h; rows.push({y, h, w: VERT[i].w * (1 + 0.12 * press), i}); y -= gap; }
  const topY = y;
  const sx = (yy: number) => 16 * Math.sin(((yy - topY) / (SPINE_BOT - topY)) * Math.PI * 2 + 0.4);
  const flash = t > STOMP && t < STOMP + 0.5 ? 0.45 * (1 - seg(t, STOMP, STOMP + 0.5)) : 0;
  const HR = 78, headRy = HR * (1 - 0.2 * press);
  const headY = topY - 8 - headRy;
  const footY = t < STOMP - 0.14 ? -900 : lerp(-900, headY - headRy + 4, eio(seg(t, STOMP - 0.14, STOMP)));
  return (
    <div style={{position: 'absolute', left: 540, top: 1000, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s.toFixed(3)})`}}>
      <XFrame id={`sx${uid}`} R={340} t={t}>
        {/* your outline from the side: round head, body */}
        <ellipse cx={0} cy={headY} rx={HR * (1 + 0.12 * press)} ry={headRy} fill="#2B4A78" stroke="#6E9BD6" strokeWidth={6} />
        <path d={`M -96 ${topY + 6} Q -120 ${topY + 200} -100 450 L 120 450 Q 140 ${topY + 200} 104 ${topY + 6} Z`} fill="#24406A" stroke="#6E9BD6" strokeWidth={6} />
        {press > 0.2 ? <ellipse cx={0} cy={SPINE_BOT - 120} rx={150} ry={170} fill={RED} opacity={0.22 * press} /> : null}
        {rows.map(({y: yy, h, w, i}) => {
          const x = sx(yy + h / 2), lit = cnt > i && press < 0.05;
          return <g key={i}>
            <path d={`M ${x - w / 2 - 2} ${yy + h * 0.3} l ${-w * 0.42} ${h * 0.55} l 6 ${h * 0.35} l ${w * 0.4} ${-h * 0.45} Z`} fill="#D9D4C6" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
            <rect x={x - w / 2} y={yy} width={w} height={h} rx={Math.min(7, h * 0.4)} fill="#F4F1E6" stroke={lit ? GOLD : INK} strokeWidth={lit ? 5 : 3.5} />
            {press > 0.3 && i > 9 ? <path d={`M ${x - w / 2 + 3} ${yy + h * 0.55} l ${w * 0.18} ${-h * 0.4} l ${w * 0.16} ${h * 0.5} l ${w * 0.18} ${-h * 0.45} l ${w * 0.2} ${h * 0.4}`} stroke={RED} strokeWidth={3} fill="none" strokeLinejoin="round" /> : null}
          </g>;
        })}
        {/* the elephant foot */}
        <g transform={`translate(0 ${footY.toFixed(1)})`}>
          <path d="M -120 -470 L -120 -18 Q -120 0 -100 0 L 100 0 Q 120 0 120 -18 L 120 -470 Z" fill={ELE} stroke={INK} strokeWidth={8} strokeLinejoin="round" />
          {[-60, 0, 60].map((dx) => <path key={dx} d={`M ${dx - 22} -2 Q ${dx} -30 ${dx + 22} -2`} fill="#F6F1E8" stroke={INK} strokeWidth={5} />)}
          <path d="M -90 -120 Q 0 -104 90 -120 M -90 -180 Q 0 -164 90 -180" stroke={ELE2} strokeWidth={6} fill="none" strokeLinecap="round" />
          <text x={0} y={-70} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={FONT_W} fontSize={46} fill="#FFFFFF" stroke={INK} strokeWidth={9} style={{paintOrder: 'stroke'}}>80,000 KG</text>
        </g>
        {flash > 0 ? <rect x={-450} y={-450} width={900} height={900} fill="#FFFFFF" opacity={flash} /> : null}
      </XFrame>
      <Card text="X-RAY: YOUR SPINE" top={90} size={50} />
      {/* bone counter */}
      <div style={{position: 'absolute', left: 790, top: 360, transform: `translate(-50%,-50%) rotate(6deg) scale(${(popIn(t, COUNT0 - 0.15, 0.3) * (1 + 0.1 * Math.max(0, 1 - (t - COUNT1) * 4) * (t > COUNT1 ? 1 : 0))).toFixed(3)})`,
        background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 24px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
        <div style={{fontWeight: FONT_W, fontSize: 110, lineHeight: 1, color: t > STOMP ? RED : INK}}>{cnt}</div>
        <div style={{fontWeight: FONT_W, fontSize: 34}}>LITTLE BONES</div>
      </div>
      <Card text="CRACK" top={560} left={150} color={RED} fg="#fff" rot={-8} s={popIn(t, STOMP + 0.02, 0.25)} size={56} />
      <Card text="DANGER" top={780} left={450} color={RED} fg="#fff" rot={3} s={popIn(t, STOMP + 0.2, 0.3)} size={54} />
    </div>
  );
};

// ---------- the story over time ----------
const SQ1 = 0.58, W1 = 1.22, SQ2 = 0.38, W2 = 1.42;
const base = (): GS => ({x: GX, sq: 1, wide: 1, hip: 70, knee: 0, ext: 148, mood: 'joy', look: [0, 0], sweat: 0, xray: 0, crack: 0, trem: 0});
const guyAt = (t: number): GS => {
  const g = base();
  if (t < CRUNCH) {
    // frame 0: the tower has just landed in his hands; one easy press; then it creaks
    const pr = Math.sin(Math.PI * seg(t, PRESS0, PRESS0 + 0.62));
    g.ext = 148 - 18 * pr; g.hip = 70 - 5 * pr;
    if (t > STRAIN) { g.mood = 'grit'; g.trem = seg(t, STRAIN, CRUNCH); g.ext = 148 - 7 * seg(t, STRAIN, CRUNCH); g.look = [0, -1]; }
    return g;
  }
  if (t < SQUISH) {
    const k = t - CRUNCH, u = eout(seg(t, CRUNCH, CRUNCH + 0.09));
    g.sq = lerp(1, SQ1, u) + 0.05 * Math.exp(-8 * k) * Math.sin(k * 30);
    g.wide = lerp(1, W1, u); g.hip = lerp(70, 61, u); g.knee = 12 * u; g.ext = lerp(141, 118, u);
    g.xray = k < 0.34 ? 1 - seg(k, 0.22, 0.34) : 0;
    g.crack = 1; g.mood = k < 0.42 ? 'oof' : 'worry'; g.trem = 0.6; g.sweat = seg(t, CRUNCH, CRUNCH + 0.15); g.look = [0, -1];
    return g;
  }
  if (t < RECOVER) {
    const k = t - SQUISH, u = eout(seg(t, SQUISH, SQUISH + 0.08));
    g.sq = lerp(SQ1, SQ2, u) + 0.05 * Math.exp(-8 * k) * Math.sin(k * 30);
    g.wide = lerp(W1, W2, u); g.hip = lerp(61, 50, u); g.knee = lerp(12, 24, u); g.ext = lerp(118, 102, u);
    g.crack = 1; g.mood = k < 0.75 ? 'pop' : t < 13.2 ? 'dizzy' : 'worry'; g.trem = 0.5; g.sweat = 1;
    return g;
  }
  // "So now he lifts with his legs": BOING back up, a careful squat, drive up = frame 0
  const k = t - RECOVER, rb = eout(Math.min(1, k / 0.18));
  g.sq = lerp(SQ2, 1, rb) * (1 + 0.1 * Math.exp(-6 * k) * Math.sin(k * 24));
  g.wide = lerp(W2, 1, rb);
  const dn = eio(seg(t, SQUAT0, SQUAT1)), up = eout(seg(t, DRIVE, TOP)), sq = dn * (1 - up);
  g.hip = 70 - 36 * sq; g.knee = 44 * sq; g.ext = 148 - 8 * sq;
  g.mood = t < SQUAT0 ? 'happy' : t < DRIVE ? 'focus' : 'joy';
  return g;
};
const BALL0 = 50;                 // its dung ball at frame 0
const BALL_X0 = -300;             // where it starts pulling
const countU = (t: number) => eio(seg(t, CNT0, T.weight));
const beetleAt = (t: number): BS => {
  if (t < S3 || t >= S7) {
    const toss = 36 * Math.sin(Math.PI * seg(t, 0.3, 0.8));
    return {x: BX, s: 0.74, pose: 'lift', mood: t > CRUNCH + 0.15 && t < S3 ? 'laugh' : 'smug', walk: 0, toss, ballR: BALL0, ballX: 0, ballRot: 0, wave: 0};
  }
  const cu = countU(t);
  const walkU = seg(t, T.pull, T.weight);
  const x = lerp(BALL_X0, -228, eio(walkU));
  const ballR = lerp(56, 300, cu);
  let ballX = lerp(BALL_X0, -228, eio(walkU)) - 92 - ballR, ballRot = 140 * eio(walkU);
  if (t > TUG) { const u = eout(seg(t, TUG, TUG + 0.45)); ballX += 22 * u; ballRot += (22 * u / 300) * 57.3; }
  const s = t < SHRINK ? 0.85 : lerp(0.85, 0.25, eout(seg(t, SHRINK, SHRINK + 0.12)));
  const walking = t > T.pull && t < T.weight;
  const mood: BS['mood'] = t > SHRINK + 0.3 ? 'proud' : 'smug';
  return {x, s, pose: 'pull', mood, walk: walking ? (t - T.pull) * 2.1 : 0, toss: 0, ballR, ballX, ballRot, wave: t > T.tiny - 0.05 && t < S6 ? 1 : 0};
};
const towerAt = (t: number, r: Rig, g: GS): TowerS => {
  const sway = 12 + 70 * hit(t, CRUNCH, 1, 2.6) + 90 * hit(t, LAND13, 1, 2.2) + 50 * hit(t, SQUISH, 1, 3) + 40 * hit(t, RECOVER, 1, 3) + 26 * hit(t, TOP, 1, 3);
  const n13 = t < S4 || t >= LAND13 ? 1 : t >= DROP13 ? seg(t, DROP13, LAND13) : 0;
  const nums = Array.from({length: 13}, (_, k) => t < S4 || t >= S4B ? 0 : k < 12 ? popIn(t, NUM0 + k * NUM_DT, 0.25) : popIn(t, LAND13 + 0.04, 0.25));
  return {x: g.x + 2.4 * g.trem * Math.sin(t * 71), base: r.handY - 6, sway, n13, land: Math.max(0, t - LAND13), nums};
};

// ---------- camera (piecewise, hard cuts) ----------
const CAM0 = {x: 0, y: -338, k: 1.85};
const camFor = (t: number): {x: number; y: number; k: number} => {
  if (t < S2) { const u = eio(seg(t, 0, S2)); return {x: lerp(CAM0.x, 6, u), y: lerp(CAM0.y, -334, u), k: lerp(CAM0.k, 1.94, u)}; }
  if (t < S3) { const u = eout(seg(t, CRUNCH, CRUNCH + 0.16)); return {x: GX, y: lerp(-252, -188, u), k: lerp(3.35, 3.55, seg(t, S2, S3))}; }
  if (t < S4) { const u = countU(t); return {x: lerp(-292, -520, u), y: lerp(-118, -350, u), k: Math.exp(lerp(Math.log(2.6), Math.log(1.2), u))}; }
  if (t < S4B) {
    const u = eio(seg(t, ZOOM0, ZOOM1));
    return {x: lerp(GX, GX + 267, u), y: lerp(-245, -1300, u), k: Math.exp(lerp(Math.log(1.7), Math.log(0.6), u))};
  }
  if (t < S5) return {x: GX, y: -142, k: lerp(3.3, 3.4, seg(t, S4B, S5))};
  if (t < S6) { const u = eio(seg(t, SHRINK + 0.05, 11.25)); return {x: lerp(-300, -214, u), y: lerp(-150, -40, u), k: Math.exp(lerp(Math.log(2.2), Math.log(3.8), u))}; }
  if (t < S7) return {x: GX, y: -255, k: lerp(1.8, 1.86, seg(t, S6, S7))};
  const u = eio(seg(t, 15.25, 16.3));
  return {x: lerp(GX, CAM0.x, u), y: lerp(-300, CAM0.y, u), k: Math.exp(lerp(Math.log(2.0), Math.log(CAM0.k), u))};
};

export const BeetleScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t), r = rig(g), b = beetleAt(t), tw = towerAt(t, r, g);
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 6, 7) + hit(t, CRUNCH, 15, 6) + hit(t, LAND13, 10, 6) + hit(t, SQUISH, 11, 7) + hit(t, RECOVER, 4, 8) + hit(t, TOP, 4, 8));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const headX = g.x, headY = r.headY;
  const topY = towerTopY(tw.base);
  // the rope from its shoulder to the ball (pull pose)
  const shoulder: P2 = [b.x + 40 * b.s, -118 * b.s];
  const ballC: P2 = [b.ballX, -b.ballR];
  // stickers (each ends before its cut)
  const st = {
    easy: t < 1.25 ? 1 : 1 - seg(t, 1.25, 1.45), creak: popIn(t, STRAIN + 0.05, 0.25) * (1 - seg(t, S2 - 0.12, S2)),
    crunch: popIn(t, CRUNCH, 0.22) * (1 - seg(t, 2.95, 3.15)), ouch: popIn(t, T.spine + 0.02, 0.25) * (1 - seg(t, S3 - 0.14, S3)),
    strong: popIn(t, 3.6, 0.3) * (1 - seg(t, 4.25, 4.42)), pull: popIn(t, T.pull, 0.25) * (1 - seg(t, 4.95, 5.12)),
    forYou: popIn(t, T.you, 0.25) * (1 - seg(t, ZOOM0 + 0.2, ZOOM0 + 0.35)), thud: pulse(t, LAND13, 0.12),
    thirteen: popIn(t, LAND13 + 0.06, 0.3) * (1 - seg(t, S4B - 0.12, S4B)),
    squish: popIn(t, SQUISH, 0.22) * (1 - seg(t, 9.85, S5 - 0.02)), boing: popIn(t, SQUISH + 0.12, 0.25) * (1 - seg(t, 9.8, 9.98)),
    poof: popIn(t, SHRINK, 0.25) * (1 - seg(t, 10.75, 10.92)), tiny: popIn(t, T.tiny, 0.25) * (1 - seg(t, S6 - 0.12, S6)),
    boing2: popIn(t, RECOVER, 0.25) * (1 - seg(t, 14.95, 15.1)), hup: popIn(t, DRIVE + 0.04, 0.22) * (1 - seg(t, 15.75, 15.9)),
    legs: popIn(t, T.legs, 0.28) * (1 - seg(t, 16.6, 16.75)),
  };
  const stars = (t > SQUISH + 0.7 && t < S5) ? 1 : 0;
  // counters
  const cnt = countU(t);
  const c1S = popIn(t, CNT0 - 0.08, 0.3) * (1 - seg(t, S4 - 0.12, S4)) * (t >= S3 ? 1 : 0);
  const numsShown = t < NUM0 ? 0 : Math.min(12, Math.floor((t - NUM0) / NUM_DT) + 1) + (t >= LAND13 ? 1 : 0);
  const c2S = popIn(t, NUM0 - 0.1, 0.3) * (1 - seg(t, S4B - 0.12, S4B)) * (t >= S4 ? 1 : 0);
  const kg = t >= LAND13 ? 80000 : numsShown * 6154;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`bFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
        <radialGradient id="bEle" cx="0.4" cy="0.3" r="0.8"><stop offset="0" stopColor="#BCC5CF" /><stop offset="1" stopColor={ELE2} /></radialGradient>
        <radialGradient id="bShell" cx="0.35" cy="0.28" r="0.85"><stop offset="0" stopColor="#4A4442" /><stop offset="0.55" stopColor={BEET} /><stop offset="1" stopColor="#120F0E" /></radialGradient>
        <radialGradient id="bDung" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#A06C3A" /><stop offset="1" stopColor={DUNG2} /></radialGradient>
      </defs></svg>
      <Sky />
      <Layer cam={cam} z={2600}><W><g>
        {[-1500, -400, 800, 2000].map((x, i) => <ellipse key={i} cx={x} cy={-30} rx={700} ry={210} fill="#E3EBC0" stroke={INK} strokeWidth={6} />)}
        <Acacia x={-700} s={1.6} /><Acacia x={950} s={1.25} /><Acacia x={2100} s={1.5} />
        <rect x={-6000} y={-4} width={12000} height={4000} fill={GRASS} />
        <path d="M -6000 -4 H 6000" stroke={INK} strokeWidth={6} />
      </g></W></Layer>
      <Layer cam={cam} z={1000}><W><g>
        <rect x={-4000} y={0} width={8000} height={3000} fill={GRASS} />
        <path d="M -4000 0 H 4000" stroke={INK} strokeWidth={6} />
        <ellipse cx={GX} cy={14} rx={170} ry={22} fill={DIRT} />
        {Array.from({length: 26}, (_, i) => { const x = -1400 + i * 120 + rnd(i) * 50; return <path key={i} d={`M ${x} 30 l 8 -22 l 6 22 l 8 -16 l 4 16`} stroke={GRASS2} strokeWidth={5} fill="none" strokeLinejoin="round" />; })}
        {/* the beetle + its ball */}
        {b.pose === 'pull' ? <g>
          <path d={`M ${P(shoulder)} L ${P([ballC[0] + b.ballR * 0.3, ballC[1]])}`} stroke={INK} strokeWidth={9} strokeLinecap="round" />
          <path d={`M ${P(shoulder)} L ${P([ballC[0] + b.ballR * 0.3, ballC[1]])}`} stroke="#D9B26B" strokeWidth={4} strokeLinecap="round" />
          <g transform={`translate(${ballC[0].toFixed(1)} ${ballC[1].toFixed(1)})`}>
            <DungBall r={b.ballR} rot={b.ballRot} t={t} />
            <ellipse cx={b.ballR * 0.3} cy={0} rx={b.ballR * 0.16} ry={b.ballR * 0.98} fill="none" stroke={INK} strokeWidth={9} />
            <ellipse cx={b.ballR * 0.3} cy={0} rx={b.ballR * 0.16} ry={b.ballR * 0.98} fill="none" stroke="#D9B26B" strokeWidth={4} />
          </g>
          <g transform={`translate(${b.x.toFixed(1)} 0) scale(${b.s.toFixed(3)})`}><BeetleWalk t={t} b={b} /></g>
          <Ruler x={b.x + 50} s={1.4 * popIn(t, 11.25, 0.3) * (t < S6 ? 1 : 0)} />
        </g> : <g transform={`translate(${b.x} 0) scale(${b.s})`}><BeetleLift t={t} b={b} /></g>}
        {/* the tower + him */}
        <Tower t={t} s={tw} />
        <GuyB t={t} g={g} uid={uid} />
        <Poof t={t} at={SHRINK} x={b.x} y={-60} s={0.8} />
        {[0, 1, 2].map((i) => { const a = t * 6 + (i * 2 * Math.PI) / 3; return <Star key={i} x={headX + Math.cos(a) * 90} y={headY - 86 + Math.sin(a) * 15} s={stars * 0.5} rot={t * 200} />; })}
      </g></W></Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={GX + 150} y={-125} s={st.easy} text="EASY" size={64} rot={-8} fill={GOLD} />
        <Txt x={GX - 175} y={-330} s={st.creak} text="CREAK" size={44} rot={-6} fill="#FFFFFF" />
        <Txt x={GX - 34} y={-300} s={st.crunch} text="CRUNCH" size={56} rot={-6} fill={RED} />
        <Txt x={GX + 92} y={-286} s={st.ouch} text="OUCH" size={40} rot={8} fill={GOLD} />
        <Txt x={-292} y={-300} s={st.strong} text="STRONGEST INSECT" size={36} rot={-4} fill={GOLD} />
        <Txt x={-170} y={-230} s={st.pull} text="PULL" size={48} rot={7} fill="#FFFFFF" />
        <Txt x={GX + 150} y={-330} s={st.forYou} text="FOR YOU" size={48} rot={-6} fill="#FFFFFF" />
        <Txt x={GX - 330} y={topY + 40} s={st.thud} text="THUD" size={120} rot={-8} fill="#FFFFFF" />
        <Txt x={GX + 270} y={topY - 60} s={st.thirteen} text="13" size={300} rot={-6} fill={GOLD} />
        <Txt x={GX + 34} y={-46} s={st.squish} text="SQUISH" size={50} rot={-7} fill={RED} />
        <Txt x={GX - 40} y={-246} s={st.boing} text="BOING" size={44} rot={8} fill="#FFFFFF" />
        <Txt x={b.x + 50} y={-185} s={st.poof} text="POOF" size={46} rot={8} fill="#FFFFFF" />
        <Txt x={-214} y={-108} s={st.tiny} text="TINY" size={40} rot={-6} fill={GOLD} />
        <Txt x={GX + 165} y={-330} s={st.boing2} text="BOING" size={50} rot={8} fill="#FFFFFF" />
        <Txt x={GX + 160} y={-200} s={st.hup} text="HUP" size={54} rot={-8} fill="#FFFFFF" />
        <Txt x={GX + 158} y={-70} s={st.legs} text="LEGS" size={60} rot={-7} fill={GOLD} />
      </Layer>}
      {thumb ? null : <>
        <Counter s={c1S} pulseK={t > T.weight ? Math.max(0, 1 - (t - T.weight) * 4) : 0} value={fmt(1141 * cnt)} label="x ITS WEIGHT" red={t > T.weight} icon={<BugIcon />} />
        <Counter s={c2S} pulseK={t > LAND13 ? Math.max(0, 1 - (t - LAND13) * 4) : 0} value={fmt(kg)} label={t >= LAND13 ? 'KG = 13 ELEPHANTS' : 'KG'} red={t >= LAND13} icon={<EleIcon />} left={800} top={1010} size={88} lsize={30} />
      </>}
      <SpineXRay t={t} s={popIn(t, S6 + 0.02, 0.35) * (1 - seg(t, X_OUT - 0.14, X_OUT)) * (t >= S6 ? 1 : 0)} uid={uid} />
      {thumb ? null : <>
        <CommentBubble t={t} text="what if you had a dung beetle's strength??" handle="@bug_doodles" likes="2.9K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so - 0.05} until={DURATION - LOOP_DUR - 0.4} text="What would you lift first?" />
      </>}
    </AbsoluteFill>
  );
};

export const BeetleVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const cues: Cue[] = [
    // frame 0: the tower lands in his hands
    {f: 'thud.wav', at: 0, db: -7}, {f: 'whoosh.wav', at: 0, db: -19}, {f: 'trumpet.wav', at: 0.34, db: -21},
    {f: 'pop.wav', at: 0.32, db: -28}, {f: 'pop.wav', at: 0.8, db: -30},
    {f: 'strain.mp3', at: STRAIN, db: -21, to: 0.55},
    // CRUNCH
    {f: 'whoosh.wav', at: S2 - 0.02, db: -30},
    {f: 'crack.wav', at: CRUNCH - 0.3, db: -8}, {f: 'thud.wav', at: CRUNCH, db: -8}, {f: 'squelch.wav', at: CRUNCH + 0.01, db: -22},
    {f: 'crowd_laugh.wav', at: CRUNCH + 0.4, db: -31, to: 0.9}, {f: 'pop.wav', at: T.spine + 0.02, db: -24},
    // the beetle pulls: 1,141 x its weight
    {f: 'whoosh.wav', at: S3 - 0.02, db: -28}, {f: 'pop.wav', at: 3.62, db: -24}, {f: 'pop.wav', at: T.pull, db: -24},
    {f: 'strain.mp3', at: T.pull + 0.1, db: -31, to: 1.5},
    ...ticks(CNT0 + 0.05, T.weight, 16, -31), {f: 'ding.mp3', at: T.weight, db: -18},
    // the whole tower: 80,000 KG
    {f: 'whoosh.wav', at: S4 - 0.02, db: -28}, {f: 'pop.wav', at: T.you, db: -26},
    {f: 'whisper_whoosh.wav', at: ZOOM0, db: -24},
    ...Array.from({length: 12}, (_, k): Cue => ({f: k % 2 ? 'tick.wav' : 'tick2.wav', at: NUM0 + k * NUM_DT + 0.03, db: -26})),
    {f: 'whoosh.wav', at: DROP13 - 0.02, db: -19},
    {f: 'thud.wav', at: LAND13, db: -5}, {f: 'trumpet.wav', at: LAND13 + 0.06, db: -16}, {f: 'ding.mp3', at: LAND13 + 0.1, db: -22},
    // SQUISH + BOING
    {f: 'whoosh.wav', at: S4B - 0.02, db: -30},
    {f: 'crack.wav', at: SQUISH - 0.3, db: -12}, {f: 'squelch.wav', at: SQUISH, db: -13}, {f: 'twang.mp3', at: SQUISH + 0.08, db: -14, to: 0.6},
    {f: 'crowd_laugh.wav', at: SQUISH + 0.14, db: -26, to: 1.25}, {f: 'giggle.mp3', at: 9.72, db: -32, to: 0.55},
    // POOF: tiny
    {f: 'whoosh.wav', at: S5 - 0.02, db: -30}, {f: 'pop.wav', at: SHRINK, db: -15}, {f: 'pfft.wav', at: SHRINK + 0.02, db: -21},
    {f: 'squeak.wav', at: TUG, db: -26}, {f: 'pop.wav', at: 11.27, db: -27}, {f: 'pop.wav', at: T.tiny, db: -22},
    // X-RAY: YOUR SPINE
    {f: 'zap.wav', at: S6, db: -26}, {f: 'pop.wav', at: S6 + 0.06, db: -24},
    ...ticks(COUNT0, COUNT1, 12, -31), {f: 'ding.mp3', at: COUNT1 + 0.03, db: -22},
    {f: 'whoosh.wav', at: STOMP - 0.14, db: -22}, {f: 'crack.wav', at: STOMP - 0.29, db: -11}, {f: 'thud.wav', at: STOMP, db: -8},
    {f: 'horn.wav', at: STOMP + 0.16, db: -33, to: 0.6},
    ...ctaCues(T.cta),
    // lifts with his legs = frame 0
    {f: 'whoosh.wav', at: S7 - 0.02, db: -30}, {f: 'twang.mp3', at: RECOVER, db: -15, to: 0.6}, {f: 'pop.wav', at: RECOVER + 0.02, db: -23},
    {f: 'strain.mp3', at: SQUAT0 + 0.08, db: -28, to: 0.5}, {f: 'whoosh.wav', at: DRIVE, db: -20}, {f: 'thud.wav', at: TOP, db: -17}, {f: 'pop.wav', at: T.legs, db: -22},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -25},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<BeetleScene t={0} />}>
        <BeetleScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="beetle/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const BeetleWide: React.FC = () => <WideFit.Provider value={0.72}><BeetleVideo /></WideFit.Provider>;
