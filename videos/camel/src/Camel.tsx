// "What if you could drink like a camel?" - owl formula (CLAUDE.md, Growth), animal-powers series, word-by-word captions.
// (1) the power is ON HIM at frame 0: he chugs a water-cooler jug like a camel, belly ballooning, empty jugs around him,
// the camel next to him with its head in the trough; (2) the backfire hits his body in close-up by ~2.3 s: the jug drops,
// his head swells and throbs (BWOMP); (3) the camel's trick: 20 days in the desert (DAYS 0 -> 20, the hump is fat, not
// water), then 110 litres in 10 minutes (LITRES 0 -> 110) and a big burp (comedy hit); (4) two X-rays: CAMEL BLOOD (an oval
// camel cell balloons to 240 % and holds, an ordinary round cell pops at 150 %), then YOUR BRAIN (water floods the cells,
// the brain swells against the skull, DANGER); (5) silent daily-life gag: your kidneys clear ~1 litre an hour, so he is
// stuck in a desert outhouse while the sun and moon whizz past (HOURS 0 -> 110 = 4 1/2 days); (6) ending: he sips from a
// teacup, the slow way, while the camel chugs = back to frame 0.
// Everything is drawn in code.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import WORDS0 from './data/words.json';
import {FPS, INK, FONT, Layer, camAt, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, shake, hit, spring,
  WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Ground, Captions, CapWord, Sweat, rnd, Puffs, Arrow} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.12; times are video time). Last word ends ~19.06 s; + 0.85 s for the push.
export const DURATION = 19.9;
export const T = {
  drink: 0.10, camel: 0.74, your: 1.53, brain: 1.67, would: 2.06, swell: 2.24,                 // "Drink like a camel, and your brain would swell."
  camel2: 2.89, twenty: 3.60, days: 4.10, without: 4.46, water: 4.74,                         // "A camel can go twenty days without water,
  then: 5.35, gulp: 5.53, hundred: 5.81, litres: 6.67, ten: 7.39, minutes: 7.60,             //  then gulp a hundred and ten litres in ten minutes."
  its: 8.33, cells: 8.72, stretch: 9.12, two: 9.58, percent: 10.51, without2: 11.15, bursting: 11.44, // "Its blood cells stretch to 240 percent without bursting."
  your2: 12.05, kidneys: 12.22, clear: 12.69, litre: 13.22, hour: 13.65,                      // "Your kidneys clear about a litre an hour."
  rest: 14.49, floods: 14.81, cells2: 15.31, brain2: 16.10, swells: 16.53,                    // "The rest floods your cells, and your brain swells."
  so: 17.39, he: 17.78, drinks: 17.96, slow: 18.42, way: 18.71,                               // "So he drinks the slow way."
  cta: 11.5,
};
// captions: numbers read faster as digits ("a hundred and ten" -> 110, "two hundred and forty percent" -> 240%)
type RawW = {w: string; s: number; e: number};
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const findSeq = (ws: RawW[], seq: string[]) => ws.findIndex((_, i) => seq.every((q, j) => ws[i + j] && norm(ws[i + j].w) === q));
const merge = (ws: RawW[], seq: string[], text: string) => {
  const i = findSeq(ws, seq); if (i < 0) return ws;
  const last = ws[i + seq.length - 1], punct = (last.w.match(/[.,?!]+$/) || [''])[0];
  return [...ws.slice(0, i), {w: text + punct, s: ws[i].s, e: last.e}, ...ws.slice(i + seq.length)];
};
const WORDS: CapWord[] = merge(merge(WORDS0 as RawW[], ['a', 'hundred', 'and', 'ten'], '110'), ['two', 'hundred', 'and', 'forty', 'percent'], '240%')
  .map((w) => ({...w, w: w.w.replace(/^twenty/i, '20').replace(/^ten$/i, '10')}));

// shots (cuts sit in the voice's pauses)
const S2 = 1.50, S3 = 2.70, S4 = 5.24, S5 = 8.17, S6 = 11.88, S7 = 14.15, S8 = 17.18;
const DROP = 1.86;            // he lowers the jug, it falls away
const SWELL = 2.2;            // his head balloons (BWOMP on "swell")
const BURP = 7.84;            // the camel's burp
const POP = 10.02;            // the ordinary blood cell pops at 150 %

const GOLD = '#FFD43B', RED = '#E2453C', WATER = '#5BB4F0', WATER_LT = '#CFEFFF', BLOOD = '#D93A4A', BLOOD_RIM = '#8E1426';
const SAND = '#F2D79E', SAND2 = '#EBC985', SAND_FAR = '#F8E6B8';
const FACE_C = '#F1EFEA';
const GX = -85;               // his feet
const CX = 370;               // the camel (ground under its body)
const TX0 = 62, TX1 = 242, TT = -104;   // the trough
const WX = 1900;              // where the camel walks through the desert (shot 3)
const OX = -1000;             // the outhouse (shot 6)

// ---------- helpers ----------
type P2 = [number, number];
const lp = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
const easeIn = (u: number) => u * u * u;
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${(ex - w).toFixed(1)} ${y.toFixed(1)} A ${rx} ${ry} 0 ${h > 0.5 ? 1 : 0} 1 ${(ex + w).toFixed(1)} ${y.toFixed(1)} Z`;
};
const qpt = (a: P2, c: P2, b: P2, u: number): P2 => [(1 - u) * (1 - u) * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];

// ---------- the guy, drawn in code (front view) ----------
type Mood = 'smug' | 'shock' | 'worry' | 'strain' | 'chug' | 'bulge' | 'sip' | 'bored' | 'woozy';
const Head: React.FC<{t: number; mood: Mood; look?: number; lookY?: number; flush?: number}> = ({t, mood, look = 0, lookY = 0, flush = 0}) => {
  const R = HEAD_R;
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (mood === 'chug') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'strain') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = mood === 'shock' ? 1.22 : mood === 'bulge' ? 1.45 : 1;
    const rx = 12 * big, ry = 15 * big;
    let px = ex + look * 4 + (mood === 'smug' ? 2 : 0), py = ey + lookY * 4 + (mood === 'smug' ? 3 : 1);
    let pr = mood === 'shock' ? 4.5 : mood === 'bulge' ? 3.4 : 6.5;
    if (mood === 'woozy') { px = ex + 4 * Math.sin(t * 6 + sd * 1.9); py = ey - 5 + 3 * Math.cos(t * 5.1 + sd); pr = 5; }
    if (mood === 'bulge') { px = ex + 1.5 * Math.sin(t * 40 + sd); py = ey + 1.5 * Math.cos(t * 37); }
    const lid = mood === 'smug' || mood === 'woozy' ? 0.48 : mood === 'bored' ? 0.55 : mood === 'sip' ? 0.62 : 0;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={px} cy={py + (lid > 0.5 ? 4 : 0)} r={pr} fill={INK} />
        <circle cx={px - 1.5} cy={py - 2 + (lid > 0.5 ? 4 : 0)} r={2} fill="#fff" />
        {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brow = (sd: number) => {
    let d = '';
    if (mood === 'smug') d = sd < 0 ? 'M -38 -38 L -12 -38' : 'M 12 -44 L 38 -52';
    else if (mood === 'shock') d = `M ${sd * 12} -46 L ${sd * 37} -52`;
    else if (mood === 'bulge') d = `M ${sd * 10} -56 Q ${sd * 24} -66 ${sd * 38} -58`;
    else if (mood === 'worry' || mood === 'woozy') d = `M ${sd * 12} -42 L ${sd * 36} -33`;
    else if (mood === 'strain') d = `M ${sd * 9} -36 L ${sd * 36} -44`;
    else if (mood === 'bored') d = `M ${sd * 12} -36 L ${sd * 36} -36`;
    else if (mood === 'sip') d = `M ${sd * 14} -38 Q ${sd * 25} -43 ${sd * 36} -38`;
    else if (mood === 'chug') d = `M ${sd * 12} -40 Q ${sd * 24} -46 ${sd * 36} -40`;
    return d ? <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null;
  };
  let mouth: React.ReactNode = null;
  if (mood === 'smug') mouth = <g><path d="M -24 4 Q 4 18 26 -8" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /><path d="M 22 -12 Q 30 -6 28 2" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /></g>;
  else if (mood === 'shock') mouth = <ellipse cx={0} cy={8} rx={13} ry={17} fill="#5A2328" stroke={INK} strokeWidth={4.5} />;
  else if (mood === 'worry') mouth = <path d="M -16 10 q 5 -5 10 0 t 10 0 t 10 0" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'woozy') mouth = <path d={`M -20 10 Q -10 ${3 + 5 * Math.sin(t * 13)} 0 10 T 20 10`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (mood === 'strain') mouth = <path d="M -22 6 q 7 -7 14 0 t 14 0 t 14 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  else if (mood === 'chug') mouth = <ellipse cx={8} cy={4} rx={11} ry={10} fill="#5A2328" stroke={INK} strokeWidth={4.5} />;
  else if (mood === 'bulge') mouth = <g><rect x={-22} y={0} width={44} height={20} rx={8} fill="#fff" stroke={INK} strokeWidth={4.5} /><path d="M -21 10 H 21 M -7 1 V 19 M 7 1 V 19" stroke={INK} strokeWidth={3} /></g>;
  else if (mood === 'sip') mouth = <ellipse cx={10} cy={6} rx={6} ry={6} fill="#5A2328" stroke={INK} strokeWidth={4} />;
  else if (mood === 'bored') mouth = <path d="M -14 10 L 14 10" stroke={INK} strokeWidth={5} strokeLinecap="round" />;
  return (
    <g>
      <circle r={R + 1} fill="url(#cmFace)" stroke={INK} strokeWidth={6.5} />
      {flush > 0.01 ? <circle r={R - 2.5} fill="#F59AA6" opacity={0.45 * flush} /> : null}
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)">{mouth}</g>
    </g>
  );
};

type ArmP = {e: P2; h: P2};
type ArmsP = {l: ArmP; r: ArmP; front: number};
const mir = (a: ArmP): ArmP => ({e: [-a.e[0], a.e[1]], h: [-a.h[0], a.h[1]]});
const sym = (r: ArmP, front = 0): ArmsP => ({l: mir(r), r, front});
const ARM = {
  down: sym({e: [52, -114], h: [56, -78]}),
  jug: {r: {e: [98, -150], h: [102, -209]}, l: {e: [-68, -128], h: [-36, -118]}, front: 1} as ArmsP,   // left hand pats his full belly
  hips: sym({e: [98, -146], h: [78, -106]}, 1),
  cup: {r: {e: [72, -128], h: [30, -200]}, l: {e: [-52, -114], h: [-56, -78]}, front: 1} as ArmsP,
  shrug: sym({e: [80, -150], h: [92, -190]}),
};
const headArms = (hs: number): ArmsP => sym({e: [102, -196], h: [HEAD_R * hs + 4, -232]}, 1);
const blendArms = (a: ArmsP, b: ArmsP, u: number): ArmsP => ({
  l: {e: lp(a.l.e, b.l.e, u), h: lp(a.l.h, b.l.h, u)}, r: {e: lp(a.r.e, b.r.e, u), h: lp(a.r.h, b.r.h, u)}, front: u < 0.5 ? a.front : b.front});
const Arm: React.FC<{sd: number; a: ArmP}> = ({sd, a}) => {
  const S: P2 = [sd * 38, -152];
  const C: P2 = [2 * a.e[0] - (S[0] + a.h[0]) / 2, 2 * a.e[1] - (S[1] + a.h[1]) / 2];
  const d = `M ${S[0]} ${S[1]} Q ${C[0]} ${C[1]} ${a.h[0]} ${a.h[1]}`;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={29} fill="none" strokeLinecap="round" />
      <path d={d} stroke="#FFFFFF" strokeWidth={18} fill="none" strokeLinecap="round" />
      <circle cx={a.h[0]} cy={a.h[1]} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} />
    </g>
  );
};
const BODY_D = 'M -28 -182 C -42 -176 -47 -164 -47 -148 L -46 -74 L -42 -16 Q -42 0 -26 0 L -12 0 Q -4 0 -4 -10 L -3 -50 Q 0 -56 3 -50 L 4 -10 Q 4 0 12 0 L 26 0 Q 42 0 42 -16 L 46 -74 L 47 -148 C 47 -164 42 -176 28 -182 Z';
/** throbbing-head lines: "((  ))" either side of the head */
const Throb: React.FC<{t: number; r: number; s: number}> = ({t, r, s}) => {
  const p = 1 + 0.12 * Math.max(0, Math.sin(t * 2 * Math.PI * 3.2));
  return <g transform={`translate(0 -235) scale(${s * p})`}>{[-1, 1].map((sd) => [0, 1].map((k) => {
    const rr = r + 16 + k * 16, a0 = (-38 + k * 4) * Math.PI / 180, a1 = (-8 - k * 4) * Math.PI / 180;
    const x0 = sd * rr * Math.cos(a0), y0 = rr * Math.sin(a0), x1 = sd * rr * Math.cos(a1), y1 = rr * Math.sin(a1);
    return <path key={`${sd}${k}`} d={`M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${rr} ${rr} 0 0 ${sd > 0 ? 1 : 0} ${x1.toFixed(1)} ${y1.toFixed(1)}`} stroke={RED} strokeWidth={7} fill="none" strokeLinecap="round" />;
  }))}</g>;
};
type GuyS = {mood: Mood; arms: ArmsP; belly: number; slosh: number; hs: number; throb: number; dx: number; dy: number; rot: number; sx: number; sy: number;
  look: number; lookY: number; sweat: number; flush: number};
const G0: GuyS = {mood: 'chug', arms: ARM.jug, belly: 0, slosh: 0, hs: 1, throb: 0, dx: 0, dy: 0, rot: 0, sx: 1, sy: 1, look: 0, lookY: 0, sweat: 0, flush: 0};
const Guy: React.FC<{t: number; g: GuyS; x: number; children?: React.ReactNode}> = ({t, g, x, children}) => {
  const breathe = 1 + 0.008 * Math.sin(2 * Math.PI * 0.6 * t);
  const armsEl = <><Arm sd={-1} a={g.arms.l} /><Arm sd={1} a={g.arms.r} /></>;
  const b = g.belly, wob = g.slosh * Math.sin(t * 2 * Math.PI * 3.1);
  const brx = 47 + 36 * b + 3 * wob, bry = 50 + 28 * b - 3 * wob, bcy = -96 + 6 * b;
  return (
    <W><g transform={`translate(${x + g.dx} ${g.dy}) rotate(${g.rot}) scale(${g.sx} ${g.sy * breathe})`}>
      {g.arms.front ? null : armsEl}
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 24} cy={-6} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />)}
      <path d={BODY_D} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {b > 0.02 ? <g>
        <ellipse cx={0} cy={bcy} rx={brx} ry={bry} fill="#fff" stroke={INK} strokeWidth={6.5} />
        <path d={`M ${(-brx * 0.66).toFixed(1)} ${(bcy - bry * 0.36).toFixed(1)} Q ${(-brx * 0.52).toFixed(1)} ${(bcy - bry * 0.74).toFixed(1)} ${(-brx * 0.16).toFixed(1)} ${(bcy - bry * 0.84).toFixed(1)}`}
          stroke="#D9D4CB" strokeWidth={7} fill="none" strokeLinecap="round" />
        <path d={`M -8 ${(bcy + bry * 0.3).toFixed(1)} Q 0 ${(bcy + bry * 0.4).toFixed(1)} 8 ${(bcy + bry * 0.3).toFixed(1)}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      </g> : null}
      {g.arms.front ? armsEl : null}
      <g transform={`translate(0 -235) scale(${g.hs})`}><Head t={t} mood={g.mood} look={g.look} lookY={g.lookY} flush={g.flush} /></g>
      {children}
      {g.throb > 0.01 ? <Throb t={t} r={HEAD_R * g.hs} s={g.throb} /> : null}
      {g.sweat > 0.01 ? <Sweat x={HEAD_R * g.hs - 6} y={-280 + 26 * ((t * 0.9) % 1)} s={0.9 * g.sweat} raw /> : null}
    </g></W>
  );
};

// ---------- props: water-cooler jug, teacup, trough ----------
// jug local frame: spout tip at (0,0), the body along +y (it is held upside down / tipped, so the water sits at the spout end)
const JUG_D = 'M -13 0 L 13 0 L 13 30 C 13 40 44 46 44 62 L 44 146 Q 44 160 30 160 L -30 160 Q -44 160 -44 146 L -44 62 C -44 46 -13 40 -13 30 Z';
const Jug: React.FC<{t: number; level: number; glug: number; uid: string; empty?: boolean}> = ({t, level, glug, uid, empty}) => {
  const wy = 6 + 150 * clamp(level);
  return (
    <g>
      <clipPath id={`jug${uid}`}><path d={JUG_D} /></clipPath>
      <path d={JUG_D} fill={WATER_LT} />
      {!empty && level > 0.01 ? <g clipPath={`url(#jug${uid})`}>
        <rect x={-50} y={-2} width={100} height={wy + 2} fill={WATER} />
        <path d={`M -50 ${wy} Q -25 ${wy + 5 * Math.sin(t * 9)} 0 ${wy} T 50 ${wy}`} stroke="#2F86C8" strokeWidth={4} fill="none" />
        {glug > 0.01 ? Array.from({length: 6}, (_, i) => {
          const u = (t * 1.6 + i / 6) % 1, y = lerp(18, wy - 6, u), x = 6 * Math.sin(u * 9 + i * 2) + (i % 2 ? 8 : -8);
          return <circle key={i} cx={x} cy={y} r={(4 + 7 * u) * glug} fill="#E8F7FF" stroke="#2F86C8" strokeWidth={2.5} />;
        }) : null}
      </g> : null}
      <path d="M -44 92 L 44 92 M -44 120 L 44 120" stroke="#9ED3F5" strokeWidth={5} />
      <path d="M -30 70 L -30 146" stroke="#FFFFFF" strokeWidth={7} strokeLinecap="round" opacity={0.9} />
      <path d={JUG_D} fill="none" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <rect x={-17} y={-3} width={34} height={14} rx={4} fill="#3E8FD8" stroke={INK} strokeWidth={5} />
    </g>
  );
};
const JUG_ANG = 235;                 // tipped 35 degrees above horizontal, base up and to the right
const SPOUT: P2 = [8, -204];         // at his mouth (guy-local)
const Teacup: React.FC = () => (
  <g>
    <path d="M -16 -14 L 16 -14 L 12 6 Q 0 12 -12 6 Z" fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 15 -9 Q 26 -9 22 1 Q 19 5 13 3" stroke={INK} strokeWidth={4} fill="none" />
    <path d="M -10 -6 Q 0 -3 10 -6" stroke="#E07A9B" strokeWidth={3} fill="none" />
    <ellipse cx={0} cy={10} rx={20} ry={4.5} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} />
  </g>
);
const TroughBack: React.FC<{t: number; level: number}> = ({t, level}) => {
  const top = TT - 8 * level + 6;     // the water peeks over the rim when full, sinks out of sight when drunk
  return (
    <W><g>
      <path d={`M ${TX0 + 6} ${top} Q ${TX0 + 50} ${top - 4 * Math.sin(t * 7)} ${(TX0 + TX1) / 2} ${top} T ${TX1 - 6} ${top} L ${TX1 - 6} ${TT + 30} L ${TX0 + 6} ${TT + 30} Z`}
        fill={WATER} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    </g></W>
  );
};
const TroughFront: React.FC<{t: number; slurp: number}> = ({t, slurp}) => (
  <W><g>
    {[TX0 + 26, TX1 - 26].map((x) => <rect key={x} x={x - 9} y={TT + 56} width={18} height={-TT - 56} fill="#A86F3D" stroke={INK} strokeWidth={6} />)}
    <rect x={TX0} y={TT} width={TX1 - TX0} height={66} rx={8} fill="#C48A52" stroke={INK} strokeWidth={7} />
    <path d={`M ${TX0 + 8} ${TT + 22} H ${TX1 - 8} M ${TX0 + 8} ${TT + 44} H ${TX1 - 8}`} stroke="#9C6634" strokeWidth={5} />
    {[TX0 + 40, TX1 - 50].map((x) => <circle key={x} cx={x} cy={TT + 11} r={4} fill={INK} />)}
    {slurp > 0.01 ? [0, 1, 2].map((i) => {
      const u = (t * 2.2 + i / 3) % 1;
      return <ellipse key={i} cx={(TX0 + TX1) / 2 - 38} cy={TT - 4} rx={18 + 50 * u} ry={4 + 6 * u} fill="none" stroke="#FFFFFF" strokeWidth={5 * (1 - u) * slurp} />;
    }) : null}
  </g></W>
);

// ---------- the camel (side view, facing left towards him) ----------
const CAM = '#E6B56A', CAM_SH = '#CB984C', CAM_LT = '#F4D7A2', CAM_DK = '#9C6A2E';
type CMood = 'smug' | 'gulp' | 'burp' | 'laugh' | 'wink';
type CamelS = {x: number; hx: number; hy: number; ha: number; nc: P2; mood: CMood; look: number; plump: number; walk: number; chew: number; gulp: number; burp: number; bob: number};
const NR: P2 = [-128, -300];
const C_BODY = 'M -150 -292 C -152 -330 -116 -346 -82 -346 C -62 -346 -50 -362 -40 -392 C -24 -444 62 -448 80 -398 C 92 -364 118 -348 150 -342 C 186 -336 202 -302 197 -266 C 194 -232 172 -214 142 -212 C 80 -196 -40 -194 -100 -206 C -134 -210 -150 -244 -150 -292 Z';
const C_HEAD = 'M 20 -8 C 22 -42 -6 -58 -38 -55 C -64 -52 -88 -42 -102 -24 C -114 -12 -118 4 -112 16 C -106 27 -94 31 -82 29 C -72 41 -52 46 -38 36 C -20 32 -4 28 8 20 C 18 12 20 2 20 -8 Z';
const C_EAR = 'M -4 -44 C -2 -64 12 -72 18 -62 C 21 -55 14 -46 6 -40 Z';
const HEAD_DRINK = {hx: -215, hy: -185, ha: -50, nc: [-205, -290] as P2};
const HEAD_UP = {hx: -250, hy: -430, ha: 6, nc: [-218, -300] as P2};
const CLeg: React.FC<{x: number; ang: number; far: boolean}> = ({x, ang, far}) => (
  <g transform={`rotate(${ang.toFixed(2)} ${x} -230)`}>
    <path d={`M ${x} -236 L ${x} -22`} stroke={INK} strokeWidth={36} strokeLinecap="round" />
    <path d={`M ${x} -236 L ${x} -22`} stroke={far ? CAM_SH : CAM} strokeWidth={23} strokeLinecap="round" />
    <circle cx={x} cy={-104} r={16} fill={far ? CAM_SH : CAM} stroke={INK} strokeWidth={6} />
    <path d={`M ${x - 11} -104 L ${x + 11} -104`} stroke={far ? CAM_SH : CAM} strokeWidth={14} />
    <ellipse cx={x - 7} cy={-9} rx={24} ry={10} fill={CAM_DK} stroke={INK} strokeWidth={6} />
  </g>
);
const CamelHead: React.FC<{t: number; c: CamelS}> = ({t, c}) => {
  const ex = -54, ey = -30;
  const closed = c.mood === 'gulp' || c.mood === 'laugh' || c.mood === 'wink';
  const open = c.mood === 'burp' || c.mood === 'laugh';
  const chew = c.chew * 4 * Math.sin(t * 2 * Math.PI * 2.2);
  return (
    <g transform={`translate(${c.hx} ${c.hy}) rotate(${c.ha})`}>
      <path d={C_EAR} fill={CAM} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={C_HEAD} fill={CAM} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M -100 -18 C -110 -6 -112 8 -106 18" stroke={CAM_LT} strokeWidth={9} fill="none" strokeLinecap="round" />
      <path d="M -108 -8 Q -101 -13 -96 -5" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      {open ? <g>
        <path d="M -113 13 C -106 44 -74 50 -60 26 C -78 31 -98 27 -113 13 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <path d="M -104 17 L -103 26 L -94 27 L -95 20 Z M -92 21 L -91 29 L -82 29 L -83 23 Z" fill="#FFFBEA" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      </g> : <g transform={`translate(${chew} 0)`}>
        <path d="M -112 15 C -101 22 -88 22 -76 18" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        {c.mood === 'smug' || c.mood === 'wink' ? <path d="M -78 18 Q -70 15 -66 10" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
        {c.mood === 'gulp' ? <path d="M -70 30 Q -56 42 -40 30" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
      </g>}
      {closed ? <g>
        <path d={`M ${ex - 14} ${ey + 2} Q ${ex} ${ey - 12} ${ex + 14} ${ey + 2}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
        {[-10, -4, 2].map((d, i) => <path key={i} d={`M ${ex + d} ${ey - 6} l ${-4 + i} -8`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />)}
      </g> : <g>
        <ellipse cx={ex} cy={ey} rx={14} ry={13} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={ex - 3 + c.look * 5} cy={ey + 4} r={6} fill={INK} />
        <circle cx={ex - 5 + c.look * 5} cy={ey + 2} r={2} fill="#fff" />
        <path d={lidPath(ex, ey, 14.5, 13.5, 0.5)} fill={CAM} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        {[-12, -5, 2].map((d, i) => <path key={i} d={`M ${ex + d} ${ey} l ${-5 + i * 1.5} -9`} stroke={INK} strokeWidth={3.5} strokeLinecap="round" />)}
      </g>}
      <path d={c.mood === 'laugh' ? `M ${ex - 14} ${ey - 26} Q ${ex} ${ey - 34} ${ex + 14} ${ey - 26}` : `M ${ex - 15} ${ey - 20} Q ${ex} ${ey - 25} ${ex + 15} ${ey - 19}`}
        stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    </g>
  );
};
const Camel: React.FC<{t: number; c: CamelS}> = ({t, c}) => {
  const near = 15 * Math.sin(c.walk), far = -near;
  const bob = c.bob - 5 * Math.abs(Math.sin(c.walk)) * (c.walk ? 1 : 0);
  const head: P2 = [c.hx, c.hy];
  const gb = c.gulp > 0 && c.gulp < 1 ? Math.sin(Math.PI * c.gulp) : 0;
  const gp = qpt(NR, c.nc, head, 1 - c.gulp * 0.85);
  const neckD = `M ${NR[0]} ${NR[1]} Q ${c.nc[0]} ${c.nc[1]} ${c.hx} ${c.hy}`;
  return (
    <W><g transform={`translate(${c.x} ${bob.toFixed(2)})`}>
      <CLeg x={-80} ang={far} far /><CLeg x={122} ang={far} far />
      <CLeg x={-108} ang={near} far={false} /><CLeg x={150} ang={near} far={false} />
      <path d="M 194 -282 C 214 -250 214 -214 206 -184" stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" />
      <path d="M 194 -282 C 214 -250 214 -214 206 -184" stroke={CAM_SH} strokeWidth={6} fill="none" strokeLinecap="round" />
      <ellipse cx={206} cy={-176} rx={9} ry={16} fill={CAM_DK} stroke={INK} strokeWidth={5} />
      <path d={neckD} stroke={INK} strokeWidth={76} fill="none" strokeLinecap="round" />
      {gb > 0.01 ? <circle cx={gp[0]} cy={gp[1]} r={30 + 12 * gb} fill={INK} /> : null}
      <path d={neckD} stroke={CAM} strokeWidth={62} fill="none" strokeLinecap="round" />
      {gb > 0.01 ? <circle cx={gp[0]} cy={gp[1]} r={23 + 12 * gb} fill={CAM} /> : null}
      <g transform={`translate(20 -300) scale(${1 + 0.035 * c.plump} ${1 + 0.07 * c.plump}) translate(-20 300)`}>
        <path d={C_BODY} fill={CAM} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
        <path d="M -30 -402 C -14 -438 48 -442 66 -404" stroke={CAM_LT} strokeWidth={12} fill="none" strokeLinecap="round" />
        <path d="M -92 -216 C -40 -206 80 -206 134 -222" stroke={CAM_SH} strokeWidth={12} fill="none" strokeLinecap="round" />
      </g>
      <CamelHead t={t} c={c} />
    </g></W>
  );
};

// ---------- the set: desert ----------
const DUNES_FAR = (() => {
  let d = 'M -3000 40 L -3000 0';
  const hs: [number, number][] = [[-2400, 150], [-1700, 230], [-1000, 170], [-300, 260], [400, 190], [1100, 280], [1800, 210], [2500, 250], [3200, 170]];
  let x0 = -3000;
  hs.forEach(([cx, h]) => { const x1 = cx + (cx - x0); d += ` C ${x0 + (cx - x0) * 0.45} 0 ${cx - (cx - x0) * 0.45} ${-h} ${cx} ${-h} C ${cx + (x1 - cx) * 0.45} ${-h} ${x1 - (x1 - cx) * 0.45} 0 ${x1} 0`; x0 = x1; });
  return d + ` L ${x0} 40 Z`;
})();
const Sun: React.FC<{t: number; x: number; y: number; r: number}> = ({t, x, y, r}) => (
  <g transform={`translate(${x} ${y})`}>
    <g transform={`rotate(${t * 12})`}>{Array.from({length: 12}, (_, i) => <path key={i} transform={`rotate(${i * 30})`} d={`M ${-r * 0.16} ${-r * 1.18} L 0 ${-r * 1.6} L ${r * 0.16} ${-r * 1.18} Z`}
      fill={GOLD} stroke={INK} strokeWidth={6} strokeLinejoin="round" />)}</g>
    <circle r={r} fill={GOLD} stroke={INK} strokeWidth={7} />
    <circle cx={-r * 0.3} cy={-r * 0.3} r={r * 0.32} fill="#FFE98A" />
  </g>
);
const FarDesert: React.FC<{t: number}> = ({t}) => (
  <W><g>
    <Sun t={t} x={1350} y={-1330} r={150} />
    <path d={DUNES_FAR} fill={SAND_FAR} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  </g></W>
);
const Palm: React.FC<{x: number; s: number; lean: number}> = ({x, s, lean}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d={`M 0 0 Q ${lean * 0.3} -160 ${lean} -320`} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />
    <path d={`M 0 0 Q ${lean * 0.3} -160 ${lean} -320`} stroke="#B98450" strokeWidth={18} fill="none" strokeLinecap="round" />
    {[0.2, 0.4, 0.6, 0.8].map((u) => { const px = 2 * (1 - u) * u * lean * 0.3 + u * u * lean, py = -320 * u; return <path key={u} d={`M ${px - 9} ${py} l 18 -6`} stroke="#8E5F33" strokeWidth={4} />; })}
    {[-150, -110, -40, 10, 60].map((a, i) => <g key={i} transform={`translate(${lean} -320) rotate(${a})`}>
      <path d="M 0 0 C 30 -40 90 -46 130 -10 C 90 -22 40 -18 0 0 Z" fill="#7CC35A" stroke={INK} strokeWidth={6} strokeLinejoin="round" /></g>)}
    <circle cx={lean - 10} cy={-306} r={11} fill="#8E5F33" stroke={INK} strokeWidth={5} /><circle cx={lean + 10} cy={-302} r={11} fill="#8E5F33" stroke={INK} strokeWidth={5} />
  </g>
);
const MidDesert: React.FC = () => (
  <W><g>
    <path d="M -2600 0 C -2300 -90 -2000 -120 -1700 -40 C -1400 -130 -1100 -110 -800 -20 C -500 -100 -200 -90 100 -30 C 400 -120 700 -130 1000 -40 C 1300 -110 1600 -120 1900 -30 C 2200 -100 2500 -90 2800 0 Z"
      fill={SAND2} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <Palm x={-560} s={1.0} lean={30} /><Palm x={-420} s={0.8} lean={-26} /><Palm x={760} s={0.95} lean={-30} /><Palm x={2350} s={0.9} lean={24} />
  </g></W>
);
const SandBits: React.FC = () => (
  <W><g>{Array.from({length: 40}, (_, i) => {
    const x = -1400 + i * 97 + 40 * rnd(i), y = 18 + 70 * rnd(i * 3.3);
    return <path key={i} d={`M ${x} ${y} q 14 -8 28 0`} stroke="#D9B66F" strokeWidth={5} fill="none" strokeLinecap="round" />;
  })}</g></W>
);
/** the desert outhouse: a shed with a crescent-moon door; his head shows above the door */
const OuthouseBack: React.FC = () => (
  <W><g transform={`translate(${OX} 0)`}>
    <path d="M -100 0 L -100 -372 L 100 -386 L 100 0 Z" fill="#C98E55" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    {[-60, -20, 20, 60].map((x) => <path key={x} d={`M ${x} -10 L ${x} ${-370 - (x + 100) * 0.07}`} stroke="#A8703C" strokeWidth={5} />)}
    <rect x={-70} y={-346} width={140} height={346} fill="#4A2F1C" stroke={INK} strokeWidth={6} />
  </g></W>
);
const OuthouseFront: React.FC = () => (
  <W><g transform={`translate(${OX} 0)`}>
    <rect x={-66} y={-232} width={132} height={232} fill="#D9A066" stroke={INK} strokeWidth={7} />
    <path d="M -56 -200 L 56 -40 M -56 -200 H 56 M -56 -40 H 56" stroke="#A8703C" strokeWidth={8} strokeLinecap="round" />
    <path d="M 8 -178 A 22 22 0 1 0 8 -134 A 17 17 0 1 1 8 -178 Z" fill="#4A2F1C" stroke={INK} strokeWidth={4} />
    <circle cx={46} cy={-112} r={7} fill={INK} />
    <path d="M -126 -364 L 126 -394 L 126 -420 L -126 -390 Z" fill="#8E5A2E" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  </g></W>
);
/** sun and moon whizzing over the outhouse: about one day every 0.48 s */
const DAY = 0.48;
const SkyClock: React.FC<{t: number}> = ({t}) => {
  if (t < S6 || t >= S7) return null;
  const u = (t - S6 - 0.12) / DAY;
  if (u < 0) return null;
  const ph = u % 1, isSun = ph < 0.5, a = Math.PI * (1 - (isSun ? ph : ph - 0.5) / 0.5);
  const x = OX + 360 * Math.cos(a), y = -110 - 370 * Math.sin(a);
  return <W>{isSun ? <Sun t={t} x={x} y={y} r={50} /> :
    <g transform={`translate(${x} ${y})`}><path d="M 10 -40 A 40 40 0 1 0 10 40 A 31 31 0 1 1 10 -40 Z" fill="#FFF3B0" stroke={INK} strokeWidth={6} /></g>}</W>;
};

// ---------- inserts (screen space) ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 450}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const XR = 290, XCY = 700;
const XFrame: React.FC<{id: string; children: React.ReactNode}> = ({id, children}) => (
  <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
    <clipPath id={id}><circle r={XR} /></clipPath>
    <circle r={XR + 18} fill={INK} />
    <g clipPath={`url(#${id})`}>
      <rect x={-450} y={-450} width={900} height={900} fill="#16223A" />
      {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
      {children}
    </g>
    <circle r={XR} fill="none" stroke="#3E6FB0" strokeWidth={20} />
  </svg>
);
const Scan: React.FC<{t: number}> = ({t}) => <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.2} />;
const Counter: React.FC<{t: number; s: number; value: string | number; label: string; sub?: string; red?: boolean; bumpAt: number; left: number; top: number; rot?: number}> =
  ({t, s, value, label, sub, red = false, bumpAt, left, top, rot = 6}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s * (1 + 0.1 * Math.max(0, 1 - (t - bumpAt) * 4) * (t > bumpAt ? 1 : 0))})`,
    background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 24px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: 900, fontSize: 96, lineHeight: 1, color: red ? RED : INK}}>{value}</div>
    <div style={{fontWeight: 900, fontSize: 32}}>{label}</div>
    {sub ? <div style={{fontWeight: 800, fontSize: 25}}>{sub}</div> : null}
  </div>
) : null;
const Cell: React.FC<{x: number; y: number; rx: number; ry: number; rot?: number}> = ({x, y, rx, ry, rot = 0}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})`}>
    <ellipse rx={rx} ry={ry} fill={BLOOD} stroke={BLOOD_RIM} strokeWidth={Math.max(1.5, rx * 0.12)} />
    <ellipse rx={rx * 0.45} ry={ry * 0.32} fill="#B8243A" />
  </g>
);

/** X-RAY 1: camel blood. An oval camel red cell balloons to 240 % and holds; an ordinary round cell pops at 150 %. */
const camelPct = (t: number) => Math.round(100 + 140 * eio(seg(t, T.stretch, 10.95)));
const otherPct = (t: number) => Math.round(100 + 50 * seg(t, T.stretch, POP));
const CamelXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const cp = camelPct(t), op = otherPct(t), popped = t >= POP;
  const ca = Math.sqrt(cp / 100), oa = Math.sqrt(op / 100);     // area grows with the volume %
  const wob = (k: number) => 1 + 0.02 * Math.sin(t * 17 + k);
  const pu = seg(t, POP, POP + 0.5);
  return (
    <div style={{position: 'absolute', left: 540, top: XCY, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id="cxr">
        {/* a vessel with small oval camel cells drifting by */}
        <rect x={-450} y={-210} width={900} height={400} fill="#F07C92" opacity={0.16} />
        <path d="M -450 -210 H 450 M -450 190 H 450" stroke="#F07C92" strokeWidth={10} opacity={0.6} />
        {Array.from({length: 9}, (_, i) => {
          const x = -470 + ((i * 117 + t * 90) % 940), y = (i % 2 ? -160 : 150) + 10 * Math.sin(t * 2 + i);
          return <Cell key={i} x={x} y={y} rx={20} ry={12} rot={i * 13} />;
        })}
        {/* water drops streaming into both big cells */}
        {t > T.stretch && t < 10.95 ? Array.from({length: 10}, (_, i) => {
          const u = (t * 1.8 + i / 10) % 1, tx = i % 2 ? -118 : 150;
          return popped && tx > 0 ? null : <circle key={'w' + i} cx={tx + 60 * Math.sin(i * 2.1) * (1 - u)} cy={lerp(-260, -20, u)} r={9 * (1 - 0.5 * u)} fill={WATER} stroke="#D6F0FF" strokeWidth={2.5} />;
        }) : null}
        {/* the camel cell: oval, stretches and holds */}
        <g transform={`translate(-118 -14) scale(${ca * wob(1)} ${ca * wob(2)})`}>
          <ellipse rx={88} ry={54} fill={BLOOD} stroke="#FFC2CC" strokeWidth={5} />
          <ellipse rx={42} ry={21} fill="#B8243A" opacity={1 - 0.6 * seg(t, T.stretch, 10.9)} />
          <path d="M -58 -27 Q -36 -44 -8 -46" stroke="#FFD9E0" strokeWidth={8} fill="none" strokeLinecap="round" />
        </g>
        {/* the ordinary cell: round, pops at 150 % */}
        {!popped ? <g transform={`translate(150 -14) scale(${oa * wob(3)})`}>
          <circle r={60} fill={BLOOD} stroke="#FFC2CC" strokeWidth={5} />
          <circle r={26} fill="#B8243A" opacity={1 - 0.6 * seg(t, T.stretch, POP)} />
          <text x={0} y={2} textAnchor="middle" dominantBaseline="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#FFFFFF"
            stroke={INK} strokeWidth={6} style={{paintOrder: 'stroke'}}>{op}%</text>
        </g> : <g transform="translate(150 -14)" opacity={1 - seg(pu, 0.6, 1)}>
          {Array.from({length: 8}, (_, i) => {
            const a = (i / 8) * Math.PI * 2 + 0.3, d = 40 + 120 * eout(pu);
            return <path key={i} transform={`translate(${(Math.cos(a) * d).toFixed(1)} ${(Math.sin(a) * d).toFixed(1)}) rotate(${(a * 57 + pu * 200).toFixed(0)})`} d="M -14 -6 Q 0 -14 14 -6 Q 4 4 -12 6 Z" fill={BLOOD} stroke="#FFC2CC" strokeWidth={3} />;
          })}
          <g transform={`scale(${0.6 + 0.8 * eout(seg(pu, 0, 0.3))})`} opacity={1 - seg(pu, 0.3, 0.6)}>
            <polygon points={Array.from({length: 16}, (_, i) => { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 26 : 62; return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ')}
              fill="#FFF6C9" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          </g>
        </g>}
        <Scan t={t} />
      </XFrame>
      <Card text="X-RAY: CAMEL BLOOD" top={110} size={44} />
      <Card text="CAMEL" top={612} left={332} size={38} rot={-4} color="#FFE7A8" />
      <Card text={popped ? 'POP' : 'OTHER ANIMALS'} top={612} left={600} size={popped ? 48 : 30} rot={4} color={popped ? RED : '#FFFFFF'} fg={popped ? '#fff' : INK}
        s={popped ? popIn(t, POP, 0.25) : 1} />
      <Card text="STRETCH" top={760} color={GOLD} rot={3} s={pulse(t, T.stretch - 0.04, 0.75)} size={54} />
      <Card text="NO POP" top={760} color="#9BE37A" rot={-3} s={popIn(t, T.bursting - 0.04, 0.3)} size={58} />
      <Counter t={t} s={popIn(t, T.stretch - 0.12, 0.3)} value={`${cp}%`} label="CAMEL CELL" sub="SIZE" bumpAt={10.95} left={790} top={290} />
    </div>
  );
};

/** X-RAY 2: your brain. Water floods in from the neck, the cells swell, the brain swells against the skull, DANGER. */
const BRAIN_D = 'M -118 -60 C -136 -132 -80 -190 -20 -182 C 10 -206 80 -196 104 -160 C 150 -140 158 -76 132 -40 C 144 0 104 34 60 24 C 26 44 -30 44 -56 26 C -104 34 -140 4 -118 -60 Z';
const BRAIN_CELLS: P2[] = [[-70, -110], [-20, -140], [40, -140], [88, -104], [-96, -40], [-30, -70], [30, -82], [96, -40], [-50, -6], [10, -20], [64, 2]];
const YouXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const flood = seg(t, T.floods - 0.1, 16.3), sw = eio(seg(t, 15.75, T.swells + 0.05));
  const bs = 1 + 0.16 * sw + 0.012 * sw * Math.sin(t * 2 * Math.PI * 3.2);
  const press = seg(t, 16.25, 16.5);
  const brain = sw > 0 ? `rgb(${Math.round(lerp(244, 226, sw))},${Math.round(lerp(160, 82, sw))},${Math.round(lerp(190, 98, sw))})` : '#F4A0BE';
  const skullR = 238;
  const jx = 4 * press * Math.sin(t * 50);
  return (
    <div style={{position: 'absolute', left: 540, top: XCY, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s})`}}>
      <XFrame id="yxr">
        <g transform={`translate(${jx} 30)`}>
          {/* neck vessels with water streaming up */}
          {[-46, 46].map((x) => <path key={x} d={`M ${x} 330 C ${x} 250 ${x * 0.6} 200 ${x * 0.5} 120`} stroke="#F07C92" strokeWidth={22} fill="none" opacity={0.55} />)}
          {flood > 0 ? Array.from({length: 14}, (_, i) => {
            const u = (t * 1.3 + i / 14) % 1, x = (i % 2 ? 46 : -46) * (1 - 0.5 * u), y = lerp(330, 60, u);
            return <circle key={i} cx={x + 6 * Math.sin(i + t * 4)} cy={y} r={11} fill={WATER} stroke="#D6F0FF" strokeWidth={3} opacity={Math.min(1, flood * 3)} />;
          }) : null}
          {/* skull */}
          <circle cx={0} cy={-70} r={skullR} fill="none" stroke="#EFE7D2" strokeWidth={14} />
          <path d="M -150 120 Q 0 200 150 120" stroke="#EFE7D2" strokeWidth={12} fill="none" opacity={0.7} />
          {/* brain */}
          <g transform={`translate(0 -70) scale(${bs}) translate(0 70)`}>
            <path d={BRAIN_D} fill={brain} stroke="#16223A" strokeWidth={6} />
            <path d="M -80 -140 C -60 -110 -90 -80 -50 -60 M 0 -176 C -14 -130 24 -110 4 -70 M 70 -160 C 50 -130 90 -100 60 -60" stroke="#16223A" strokeWidth={6} fill="none" opacity={0.4} strokeLinecap="round" />
            {BRAIN_CELLS.map(([x, y], i) => {
              const r = 10 + 9 * eio(seg(t, 15.2 + i * 0.05, 16.3 + i * 0.03));
              return <g key={i}><circle cx={x} cy={y} r={r} fill="#FFFFFF" fillOpacity={0.35} stroke="#FFFFFF" strokeWidth={3} />
                {flood > 0.3 ? <circle cx={x} cy={y} r={r * 0.55 * seg(t, 15.0 + i * 0.06, 15.8 + i * 0.06)} fill={WATER} /> : null}</g>;
            })}
          </g>
          {/* pressure where the brain hits the skull */}
          {press > 0 ? [-60, -20, 20, 60, 160, 200].map((a, i) => {
            const ar = (a - 90) * Math.PI / 180, r = skullR - 4;
            const p = 0.6 + 0.4 * Math.abs(Math.sin(t * 14 + i));
            return <path key={i} transform={`translate(${(Math.cos(ar) * r).toFixed(1)} ${(-70 + Math.sin(ar) * r).toFixed(1)}) rotate(${a})`}
              d="M -26 0 L -10 -12 L 0 4 L 10 -12 L 26 0" stroke={RED} strokeWidth={9 * p * press} fill="none" strokeLinejoin="round" strokeLinecap="round" />;
          }) : null}
        </g>
        <Scan t={t} />
      </XFrame>
      <Card text="X-RAY: YOUR BRAIN" top={110} size={44} />
      <Card text="FLOOD" top={700} color="#BFE6FF" rot={-3} s={pulse(t, T.floods - 0.04, 0.85)} size={58} />
      <Card text="SWELLING" top={700} color={GOLD} rot={3} s={pulse(t, T.brain2 - 0.08, 0.4)} size={54} />
      <Card text="DANGER" top={700} color={RED} fg="#fff" rot={-3} s={popIn(t, T.swells + 0.02, 0.3)} size={60} />
    </div>
  );
};

// ---------- the story over time ----------
const jugLevel = (t: number) => (t < DROP ? 0.82 - 0.3 * (t / DROP) : 0.4);
const guyAt = (t: number): GuyS => {
  const g: GuyS = {...G0};
  if (t < S3) {
    // chugging: belly ballooning, a nod with every glug; then the jug drops and his head balloons
    g.belly = 0.55 + 0.4 * seg(t, 0, DROP);
    g.slosh = 0.4;
    g.dy = -3 * Math.abs(Math.sin(t * Math.PI / 0.47));
    if (t < DROP) return g;
    g.mood = t < 2.0 ? 'shock' : 'bulge';
    const up = eio(seg(t, DROP + 0.04, 2.12));
    g.hs = 1 + 0.32 * popIn(t, SWELL, 0.32) + 0.035 * Math.sin((t - SWELL) * 2 * Math.PI * 3.2) * (t > SWELL + 0.3 ? 1 : 0);
    g.arms = blendArms(ARM.jug, headArms(g.hs), up);
    g.throb = popIn(t, SWELL + 0.12, 0.25);
    g.flush = seg(t, SWELL, SWELL + 0.3);
    g.sweat = seg(t, 2.3, 2.45);
    g.sx = 1 - spring(t, SWELL, 0.04, 3, 6); g.sy = 1 + spring(t, SWELL, 0.05, 3, 6);
    return g;
  }
  if (t < S7) {
    // the outhouse shots use his head only (see OuthouseHead); keep him calm here
    g.mood = 'bored'; g.arms = ARM.down; g.belly = 0.3;
    if (t < S6) g.dx = -1500;   // he is not in the camel's shots
    return g;
  }
  if (t < S8) {
    // under YOUR X-ray: worried, then the headache comes back as the brain swells
    g.belly = 0.75; g.slosh = 0.3;
    g.mood = t < T.floods ? 'worry' : t < 16.0 ? 'shock' : 'bulge';
    const up = eio(seg(t, 15.6, 15.95));
    g.hs = 1 + 0.16 * popIn(t, 16.05, 0.4) + 0.025 * Math.sin((t - 16.05) * 2 * Math.PI * 3.2) * (t > 16.4 ? 1 : 0);
    g.arms = blendArms(ARM.down, headArms(g.hs), up);
    g.throb = popIn(t, T.swells, 0.25);
    g.flush = seg(t, 16.0, 16.5);
    g.sweat = seg(t, 15.0, 15.2);
    g.look = 0; g.lookY = t < T.floods ? -1 : 0;
    return g;
  }
  // the slow way: a teacup, pinky out, one sip at a time
  g.belly = 0.15; g.arms = ARM.cup;
  const sip = (t > 17.92 && t < 18.5) || (t > 18.95 && t < 19.4);
  g.mood = sip ? 'sip' : 'smug';
  g.look = sip ? 0 : 1;
  return g;
};
const camelAt = (t: number): CamelS => {
  const base: CamelS = {x: CX, ...HEAD_DRINK, mood: 'gulp', look: -1, plump: 0, walk: 0, chew: 0, gulp: (t * 1.9) % 1, burp: 0, bob: 0};
  if (t < S3) return {...base, mood: 'smug', look: -1, gulp: (t * 2.1) % 1};
  if (t < S4) {
    // twenty days through the desert, unbothered
    const u = seg(t, S3, S4);
    return {...base, x: lerp(WX + 70, WX - 70, u), ...HEAD_UP, mood: 'smug', look: 1, walk: (t - S3) * 2 * Math.PI * 1.15, chew: 1, gulp: 0, bob: 0};
  }
  if (t < S5 + 0.6) {
    // 110 litres in 10 minutes, then a big burp
    const headUp = eio(seg(t, BURP - 0.32, BURP - 0.05));
    const hx = lerp(HEAD_DRINK.hx, HEAD_UP.hx, headUp), hy = lerp(HEAD_DRINK.hy, HEAD_UP.hy, headUp), ha = lerp(HEAD_DRINK.ha, HEAD_UP.ha, headUp);
    const nc = lp(HEAD_DRINK.nc, HEAD_UP.nc, headUp);
    const mood: CMood = t < BURP - 0.3 ? 'gulp' : t < BURP + 0.62 ? 'burp' : 'smug';
    return {...base, hx, hy, ha, nc, mood, look: -1, plump: eio(seg(t, 5.5, 7.7)), gulp: t < BURP - 0.35 ? (t * 2.6) % 1 : 0,
      burp: t > BURP ? 1 : 0, bob: spring(t, BURP, 6, 3, 6)};
  }
  if (t < S6) {
    // under its X-ray: head up, chewing, smug; a wink on "without bursting"
    return {...base, ...HEAD_UP, mood: t > T.bursting && t < T.bursting + 0.45 ? 'wink' : 'smug', look: 0, plump: 1 - seg(t, 9, 11), gulp: 0, chew: 1};
  }
  // back at the trough (the ending): chugging, side-eye at him
  return {...base, mood: t > 18.1 && t < 18.8 ? 'smug' : 'gulp', look: -1, gulp: (t * 2.1) % 1};
};

/** his head in the outhouse window: bored, eyes following the sun and moon */
const OuthouseHead: React.FC<{t: number}> = ({t}) => {
  const u = (t - S6 - 0.12) / DAY, ph = ((u % 1) + 1) % 1;
  const look = -Math.cos(Math.PI * (ph < 0.5 ? ph / 0.5 : (ph - 0.5) / 0.5));
  const mood: Mood = t < 12.25 ? 'shock' : t < 13.25 ? 'bored' : 'strain';
  return <W><g transform={`translate(${OX} ${-262 + 2 * Math.sin(t * 3)})`}><Head t={t} mood={mood} look={look * 1.2} lookY={-1} /></g></W>;
};

/** caption band per shot (screen y): below faces and the X-rays */
const capY = (t: number) => (t >= S2 && t < S3 ? 1500 : t >= S5 && t < S6 ? 1490 : 1480);

export const CamelScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: 30, y: -232, k: 2.75}, {t: S2 - 0.001, x: 30, y: -234, k: 2.84},                     // frame 0: he chugs, the camel drinks
    {t: S2, x: GX + 6, y: -250, k: 3.3}, {t: 2.15, x: GX + 6, y: -252, k: 3.35}, {t: S3 - 0.001, x: GX + 6, y: -258, k: 3.6},  // close-up: his head swells
    ...Array.from({length: 26}, (_, i) => { const tt = S3 + (i / 25) * (S4 - 0.001 - S3); return {t: tt, x: lerp(WX + 70, WX - 70, seg(tt, S3, S4)) - 110, y: -330, k: lerp(1.72, 1.8, i / 25), e: 'lin' as const}; }),
    {t: S4, x: CX - 150, y: -272, k: 2.0}, {t: S5 - 0.001, x: CX - 160, y: -282, k: 2.1},        // the camel drinks 110 L, burps
    {t: S5, x: CX - 300, y: -547, k: 2.4}, {t: S6 - 0.001, x: CX - 300, y: -547, k: 2.48},       // the camel under its X-ray
    {t: S6, x: OX, y: -250, k: 2.15}, {t: S7 - 0.001, x: OX, y: -250, k: 2.25},                  // the outhouse: 110 hours
    {t: S7, x: GX, y: -312, k: 2.4}, {t: S8 - 0.001, x: GX, y: -312, k: 2.48},                   // him under YOUR X-ray
    {t: S8, x: 100, y: -250, k: 1.95}, {t: DURATION, x: 100, y: -252, k: 2.02},                  // the slow way
  ], t);
  const sh = shake(t, hit(t, 0, 5, 7) + hit(t, SWELL, 9, 6) + hit(t, BURP, 8, 6) + hit(t, T.swells, 6, 6));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t), c = camelAt(t);
  // inserts
  const cxS = popIn(t, S5 + 0.04, 0.35) * (1 - seg(t, S6 - 0.14, S6 - 0.02));
  const yxS = popIn(t, S7 + 0.04, 0.35) * (1 - seg(t, S8 - 0.14, S8 - 0.02));
  // his jug: at his mouth, then dropped
  const dropU = Math.max(0, t - DROP);
  const jugX = GX + SPOUT[0] + 160 * dropU, jugY = SPOUT[1] + 0.5 * 2600 * dropU * dropU - 120 * dropU, jugRot = JUG_ANG + 260 * dropU;
  const showJug = t < S3 && jugY < (thumb ? -250 : 400);   // thumbnails: no falling jug
  // counters
  const days = Math.min(20, Math.floor(20 * seg(t, 3.5, T.water)));
  const litres = Math.round(110 * eio(seg(t, 5.62, 7.45)));
  const hours = Math.round(110 * seg(t, S6 + 0.15, 13.62));
  // stickers (stickers end before their cut)
  const glug0 = t < 0.5 ? 1 : 1 - seg(t, 0.5, 0.65), glug2 = pulse(t, 0.95, 0.45);
  const bwomp = pulse(t, SWELL + 0.02, 0.36);
  const fat = pulse(t, 4.42, 0.58), gulpS = pulse(t, T.gulp, 0.6), burp = pulse(t, BURP + 0.02, 0.24);
  const slow = popIn(t, T.slow - 0.04, 0.3) * (1 - seg(t, DURATION - LOOP_DUR - 0.25, DURATION - LOOP_DUR - 0.05));
  const tenMin = pulse(t, T.ten - 0.05, 0.62);
  const poisoning = pulse(t, SWELL + 0.06, 0.3);
  const cupOn = t >= S8;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <W><defs>
        <radialGradient id="cmFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></W>
      <Sky />
      <Layer cam={cam} z={2600} paper={false}>
        <FarDesert t={t} />
        <Ground y={0} color={SAND_FAR} line={false} />
      </Layer>
      <Layer cam={cam} z={1600}>
        <MidDesert />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Ground y={0} line color={SAND} />
        <SandBits />
        <SkyClock t={t} />
        <OuthouseBack />
        <OuthouseHead t={t} />
        <OuthouseFront />
        <TroughBack t={t} level={t < S4 ? 1 : t < S5 ? 1 - seg(t, 5.6, 7.6) : t < S8 ? 0 : 0.7} />
        {/* empty jugs he already drank */}
        <W><g transform={`translate(${GX - 150} -42) rotate(-90)`}><Jug t={t} level={0} glug={0} uid={`e1${uid}`} empty /></g></W>
        <W><g transform={`translate(${GX - 128} -124) rotate(-70)`}><Jug t={t} level={0} glug={0} uid={`e2${uid}`} empty /></g></W>
        <Camel t={t} c={c} />
        <TroughFront t={t} slurp={c.mood === 'gulp' && c.hy > -200 ? 1 : 0} />
        <Guy t={t} g={g} x={GX}>
          {cupOn ? <g transform={`translate(${g.arms.r.h[0] - 4} ${g.arms.r.h[1] + 2}) scale(1.45)`}><Teacup /></g> : null}
        </Guy>
        {showJug ? <W><g transform={`translate(${jugX} ${jugY}) rotate(${jugRot})`}><Jug t={t} level={jugLevel(t)} glug={t < DROP ? 1 : 0} uid={`j${uid}`} /></g></W> : null}
        {c.burp ? <Puffs t={t} born={BURP} x={CX - 350} y={-408} n={6} life={0.8} size={24} vx={-260} vy={-40} color="#DDEFC9" seed={4} /> : null}
        <W>{[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3, on = t > SWELL + 0.25 && t < S3 ? 1 : 0;
          return <Star key={i} x={GX + Math.cos(a) * 110} y={-235 - 60 + Math.sin(a) * 18} s={on * 0.5} rot={t * 200} />;
        })}</W>
        {thumb ? null : <>
          <Txt x={GX + 150} y={-330} s={glug0} text="GLUG" size={46} rot={-8} fill={GOLD} />
          <Txt x={GX + 160} y={-340} s={glug2} text="GLUG" size={42} rot={7} fill={GOLD} />
          <Txt x={GX + 2} y={-372} s={bwomp} text="BWOMP" size={44} rot={-5} fill={RED} />
          <Txt x={CX - 300} y={-300} s={gulpS} text="GULP" size={46} rot={-7} fill={GOLD} />
          <Txt x={CX - 250} y={-590} s={burp} text="BUUURP" size={50} rot={-8} fill="#9BE37A" />
          <Txt x={c.x + 20} y={-592} s={fat} text="FAT, NOT WATER" size={40} rot={-4} fill={GOLD} />
          <Arrow x={c.x + 20} y={-512} s={fat * 0.6} color={GOLD} />
          <Txt x={GX + 150} y={-380} s={slow} text="THE SLOW WAY" size={38} rot={-4} fill={GOLD} />
        </>}
      </Layer>
      <CamelXRay t={t} s={cxS} />
      <YouXRay t={t} s={yxS} />
      {thumb ? null : <>
        <Card text="WATER POISONING" top={330} left={540} color={RED} fg="#fff" rot={-3} s={poisoning} size={60} />
        <Counter t={t} s={popIn(t, 3.42, 0.3) * (1 - seg(t, S4 - 0.16, S4 - 0.04))} value={days} label="DAYS" sub="NO WATER" bumpAt={T.water} left={820} top={330} />
        <Counter t={t} s={popIn(t, 5.5, 0.3) * (1 - seg(t, S5 - 0.16, S5 - 0.04))} value={litres} label="LITRES" sub="IN 10 MINUTES" bumpAt={7.45} left={820} top={330} />
        <Card text="10 MIN" top={560} left={820} color="#FFFFFF" rot={-6} s={tenMin} size={52} />
        <Counter t={t} s={popIn(t, S6 + 0.08, 0.3) * (1 - seg(t, S7 - 0.16, S7 - 0.04))} value={hours} label="HOURS" sub={hours >= 110 ? '= 4½ DAYS' : 'TO GET IT OUT'}
          red={hours >= 110} bumpAt={13.62} left={830} top={720} />
        <Captions t={t} words={WORDS} y={capY(t)} size={78} />
        <CommentBubble t={t} text="what if you could drink like a camel??" handle="@sip_doodle" likes="3.6K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so + 0.05} until={DURATION - LOOP_DUR - 0.4} text="How much water do you drink a day?" />
      </>}
    </AbsoluteFill>
  );
};

export const CamelVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -29): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -18 : db}));
  const cues: Cue[] = [
    // frame 0: he chugs (GLUG), the camel slurps
    {f: 'glug.wav', at: 0, db: -11}, {f: 'splash.wav', at: 0.02, db: -20}, {f: 'gulp.wav', at: 0.3, db: -22},
    {f: 'glug.wav', at: 0.95, db: -14}, {f: 'gulp.wav', at: 1.25, db: -25},
    // close-up: the jug drops, his head balloons (BWOMP)
    {f: 'whoosh.wav', at: S2 - 0.02, db: -30}, {f: 'whoosh.wav', at: DROP, db: -27}, {f: 'gasp.wav', at: 1.95, db: -25},
    {f: 'stretch.wav', at: SWELL - 0.12, db: -14, to: 0.75}, {f: 'bonk.wav', at: SWELL, db: -7}, {f: 'twang.mp3', at: SWELL + 0.05, db: -22, to: 0.5},
    // twenty days in the desert
    {f: 'whoosh.wav', at: S3 - 0.04, db: -28}, ...ticks(3.5, T.water, 20, -31), {f: 'pop.wav', at: 4.42, db: -22},
    // 110 litres in 10 minutes, then the burp
    {f: 'whoosh.wav', at: S4 - 0.04, db: -28}, {f: 'splash.wav', at: 5.4, db: -16},
    {f: 'gulp.wav', at: 5.6, db: -15}, {f: 'gulp.wav', at: 6.0, db: -17}, {f: 'gulp.wav', at: 6.4, db: -16}, {f: 'gulp.wav', at: 6.8, db: -18}, {f: 'gulp.wav', at: 7.2, db: -17},
    ...ticks(5.65, 7.45, 22, -32), {f: 'ding.mp3', at: 7.46, db: -22}, {f: 'pop.wav', at: T.ten - 0.05, db: -23},
    {f: 'burp.wav', at: BURP, db: -6}, {f: 'crowd_laugh.wav', at: BURP + 0.3, db: -28, to: 1.3},
    // X-ray: camel blood
    {f: 'whoosh.wav', at: S5 - 0.04, db: -28}, {f: 'zap.wav', at: S5 + 0.04, db: -27},
    {f: 'stretch.wav', at: T.stretch, db: -19}, {f: 'stretch.wav', at: 10.05, db: -21, to: 0.9},
    {f: 'pop.wav', at: POP, db: -9}, {f: 'squelch.wav', at: POP + 0.02, db: -22}, {f: 'ding.mp3', at: T.bursting - 0.03, db: -20},
    // the outhouse: 110 hours
    {f: 'whoosh.wav', at: S6 - 0.04, db: -28}, {f: 'click.wav', at: S6 + 0.04, db: -13}, ...ticks(S6 + 0.2, 13.6, 26, -31),
    {f: 'crowd_laugh.wav', at: 12.9, db: -27, to: 1.2}, {f: 'ding.mp3', at: 13.63, db: -22},
    ...ctaCues(T.cta),
    // X-ray: your brain
    {f: 'whoosh.wav', at: S7 - 0.04, db: -28}, {f: 'zap.wav', at: S7 + 0.04, db: -27}, {f: 'bubbles.wav', at: T.floods - 0.05, db: -22}, {f: 'bubbles.wav', at: 15.3, db: -25},
    {f: 'stretch.wav', at: 15.85, db: -18, to: 0.8}, {f: 'bonk.wav', at: T.swells + 0.02, db: -12}, {f: 'gasp.wav', at: T.swells + 0.1, db: -24},
    // the slow way
    {f: 'whoosh.wav', at: S8 - 0.04, db: -28}, {f: 'bubbles.wav', at: 17.95, db: -30, to: 0.3}, {f: 'gulp.wav', at: 18.25, db: -26}, {f: 'pop.wav', at: T.slow - 0.04, db: -24},
    {f: 'bubbles.wav', at: 18.98, db: -31, to: 0.3},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<CamelScene t={0} uid="s" />}>
        <CamelScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="camel/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const CamelWide: React.FC = () => <WideFit.Provider value={0.72}><CamelVideo /></WideFit.Provider>;
