// "What if you could turn see-through like a glass frog?" - owl formula (CLAUDE.md, Growth), animal-powers series.
// Word-by-word captions (second test video after turtle).
// (1) the power is ON HIM at frame 0: his body is see-through (heart + mirror liver showing) and a toucan flies straight
// into his chest - BONK, it can't see him; (2) the co-star: a smug glass frog on a leaf next to him; (3) the backfire hits
// his body in close-up by ~3 s: his face drains, his eyes roll, he slumps out of the frame (THUD); (4) two X-rays: GLASS
// FROG (red cells stream into the liver, 0 -> 89 % hidden, a mirror covers them), then YOU (red cells carry oxygen to
// the brain; hide them and OXYGEN 100 -> 11 %, the brain goes dark, DANGER); (5) the screen goes dark with only his eyes
// blinking (a lights-out gag on "dark"); (6) he vanishes again and his own cells pack into his liver -> CLOT; (7) comedy
// hit: the frog shrugs "???", he keels over like a plank at its feet (THUD, stars, laugh); (8) the frog yawns and only
// vanishes asleep; (9) ending: he now vanishes only in his sleep, the toucan BONKs into him again = frame 0.
// Everything is drawn in code: his see-through body is his normal drawing through an SVG colour matrix (white -> clear
// glass, ink stays ink) in a paper={false} layer; his head stays solid so his face always reads.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import WORDS0 from './data/words.json';
import {FPS, INK, FONT, Layer, camAt, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, shake, hit, spring,
  WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky, Ground, Captions, CapWord, Sweat, rnd} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.12; times are video time). Last word ends 19.76 s; + 0.8 s for the push.
export const DURATION = 20.6;
export const T = {
  turn: 0.10, see: 0.53, glass: 1.24, frog: 1.67, youd: 2.42, pass: 2.74, out: 2.96,         // "Turn see-through like a glass frog, and you'd pass out."
  the: 3.40, hides: 3.90, nine: 4.26, ten: 4.80, red: 5.30, cells: 5.76, liver: 6.40,          // "The frog hides nine in ten of its red blood cells in its liver,
  behind: 6.97, mirror: 7.33,                                                                  //  behind a mirror."
  yours: 7.87, carry: 8.30, oxygen: 8.72,                                                      // "Yours carry your oxygen."
  hide: 9.53, them: 9.71, brain: 10.56, goes: 10.74, dark: 11.17,                              // "Hide them, and your brain goes dark."
  pack: 11.67, tight: 12.28, theyd: 12.85, clot: 13.06,                                        // "Pack them that tight, and they'd clot."
  nobody: 13.69, knows: 14.05, why: 14.37, frogs: 14.69, dont: 15.12,                          // "Nobody knows why the frog's don't."
  it: 15.56, only: 15.78, asleep: 16.42,                                                       // "It only does it asleep."
  so: 17.12, now: 17.26, vanishes: 18.26, his: 19.08, sleep: 19.37,                            // "So now he only vanishes in his sleep."
  cta: 13.65,
};
// captions: "nine in ten" reads faster as numbers
const WORDS: CapWord[] = (WORDS0 as {w: string; s: number; e: number}[]).map((w) => ({...w, w: w.w.replace(/^nine$/i, '9').replace(/^ten$/i, '10')}));

// shots
const S2 = 1.62, S3 = 3.38, S4 = 7.80, S5 = 11.12, S6 = 11.62, S7 = 13.62, S8 = 15.50, S9 = 17.10;
const FAINT1 = 3.10;           // he slumps out of the close-up (THUD)
const VANISH = 11.64;          // he goes see-through again (wipe)
const FAINT2 = 15.14;          // plank fall at the frog's feet (THUD)
const BIRD2 = T.vanishes;      // the toucan's second BONK (the first one is frame 0)

const GOLD = '#FFD43B', RED = '#E2453C';
const FROG = '#8DDB4E', FROG2 = '#67BC33', FROG_HI = '#C9F59A', FROG_LID = '#7ACF3F', FROG_DOT = '#F4F8B8';
const BLOOD = '#D93A4A', BLOOD_RIM = '#8E1426';
const SILVER = '#E4ECF3', SILVER2 = '#A9BCCB';
const FACE_C = '#F1EFEA';
const GX = -80;                // his feet
const FX = 145, FY = -158;     // the frog's base, sitting on its leaf

// ---------- helpers ----------
type P2 = [number, number];
const lp = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
const easeIn = (u: number) => u * u * u;
const HEART_D = 'M 0 9 C -14 0 -16 -10 -9 -14 C -4 -17 0 -13 0 -9 C 0 -13 4 -17 9 -14 C 16 -10 14 0 0 9 Z';
const beat = (t: number, hz = 1.4) => 1 + 0.13 * Math.pow(Math.max(0, Math.sin(2 * Math.PI * hz * t)), 6);

// closed smooth loops for blood cells to run along
type Loop = {pts: P2[]; cum: number[]; len: number};
const mkLoop = (ctrl: P2[], n = 140): Loop => {
  const m = ctrl.length, pts: P2[] = [];
  for (let k = 0; k < n; k++) {
    const u = (k / n) * m, i = Math.floor(u), f = u - i;
    const p0 = ctrl[(i - 1 + m) % m], p1 = ctrl[i % m], p2 = ctrl[(i + 1) % m], p3 = ctrl[(i + 2) % m];
    const cr = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * f + (2 * a - 5 * b + 4 * c - d) * f * f + (-a + 3 * b - 3 * c + d) * f * f * f);
    pts.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]);
  }
  const cum = [0];
  for (let i = 1; i <= pts.length; i++) { const a = pts[i - 1], b = pts[i % pts.length]; cum.push(cum[i - 1] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
  return {pts, cum, len: cum[cum.length - 1]};
};
const along = (L: Loop, u: number): P2 => {
  const d = (((u % 1) + 1) % 1) * L.len;
  let i = 1; while (i < L.cum.length - 1 && L.cum[i] < d) i++;
  const a = L.pts[i - 1], b = L.pts[i % L.pts.length], f = (d - L.cum[i - 1]) / (L.cum[i] - L.cum[i - 1] || 1);
  return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)];
};
const loopD = (L: Loop) => 'M ' + L.pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z';
/** grid points inside a few ellipses (liver lobes), nearest to the middle first: where packed cells sit */
const slotsIn = (lobes: [number, number, number, number][], step: number, n: number): P2[] => {
  const out: {p: P2; d: number}[] = [];
  const [mx, my] = [lobes.reduce((s, l) => s + l[0], 0) / lobes.length, lobes.reduce((s, l) => s + l[1], 0) / lobes.length];
  for (let y = -400; y < 400; y += step) for (let x = -400; x < 400; x += step) {
    const xx = x + ((y / step) % 2 ? step / 2 : 0);
    if (lobes.some(([cx, cy, rx, ry]) => ((xx - cx) / (rx * 0.86)) ** 2 + ((y - cy) / (ry * 0.82)) ** 2 < 1)) out.push({p: [xx, y], d: Math.hypot(xx - mx, (y - my) * 1.3)});
  }
  return out.sort((a, b) => a.d - b.d).slice(0, n).map((o) => o.p);
};
const Cell: React.FC<{p: P2; r?: number; rot?: number}> = ({p, r = 9, rot = 0}) => (
  <g transform={`translate(${p[0].toFixed(1)} ${p[1].toFixed(1)}) rotate(${rot.toFixed(0)})`}>
    <ellipse rx={r} ry={r * 0.72} fill={BLOOD} stroke={BLOOD_RIM} strokeWidth={r * 0.26} />
    <ellipse rx={r * 0.42} ry={r * 0.26} fill="#B8243A" />
  </g>
);

// ---------- the guy, drawn in code (front view): round head, small body, stubby arms and legs ----------
type Mood = 'smug' | 'shock' | 'worry' | 'woozy' | 'faint' | 'strain' | 'sad' | 'sleep';
const Head: React.FC<{t: number; mood: Mood; pale?: number; look?: number}> = ({t, mood, pale = 0, look = 0}) => {
  const R = HEAD_R;
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (mood === 'faint') return <path key={sd} d={`M ${ex - 9} ${ey - 9} L ${ex + 9} ${ey + 9} M ${ex + 9} ${ey - 9} L ${ex - 9} ${ey + 9}`} stroke={INK} strokeWidth={5.5} strokeLinecap="round" />;
    if (mood === 'sleep') return <path key={sd} d={`M ${ex - 12} ${ey - 1} Q ${ex} ${ey + 9} ${ex + 12} ${ey - 1}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    if (mood === 'strain') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = mood === 'shock' ? 1.22 : 1;
    const rx = 12 * big, ry = 15 * big;
    let px = ex + look * 4 + (mood === 'smug' ? 2 : 0), py = ey + (mood === 'sad' ? 5 : mood === 'smug' ? 3 : 1);
    let pr = mood === 'shock' ? 4.5 : 6.5;
    if (mood === 'woozy') { px = ex + 4 * Math.sin(t * 6 + sd * 1.9); py = ey - 5 + 3 * Math.cos(t * 5.1 + sd); pr = 5; }
    const lid = mood === 'smug' || mood === 'woozy';
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={px} cy={py} r={pr} fill={INK} />
        <circle cx={px - 1.5} cy={py - 2} r={2} fill="#fff" />
        {lid ? <path d={`M ${ex - rx - 1} ${ey - 1} A ${rx + 1} ${ry + 1} 0 0 1 ${ex + rx + 1} ${ey - 1} Z`} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brow = (sd: number) => {
    let d = '';
    if (mood === 'smug') d = sd < 0 ? 'M -38 -38 L -12 -38' : 'M 12 -44 L 38 -52';
    else if (mood === 'shock') d = `M ${sd * 12} -46 L ${sd * 37} -52`;
    else if (mood === 'sad' || mood === 'worry' || mood === 'woozy') d = `M ${sd * 12} -42 L ${sd * 36} -33`;
    else if (mood === 'strain') d = `M ${sd * 9} -36 L ${sd * 36} -44`;
    else if (mood === 'sleep') d = `M ${sd * 14} -38 Q ${sd * 25} -42 ${sd * 36} -38`;
    return d ? <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null;
  };
  let mouth: React.ReactNode = null;
  if (mood === 'smug') mouth = <g><path d="M -24 4 Q 4 18 26 -8" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" /><path d="M 22 -12 Q 30 -6 28 2" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /></g>;
  else if (mood === 'shock') mouth = <ellipse cx={0} cy={8} rx={13} ry={17} fill="#5A2328" stroke={INK} strokeWidth={4.5} />;
  else if (mood === 'worry') mouth = <path d="M -16 10 q 5 -5 10 0 t 10 0 t 10 0" stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'woozy') mouth = <path d={`M -20 10 Q -10 ${3 + 5 * Math.sin(t * 13)} 0 10 T 20 10`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (mood === 'faint') mouth = <g><ellipse cx={0} cy={10} rx={15} ry={12} fill="#5A2328" stroke={INK} strokeWidth={4.5} /><path d="M -6 14 Q 0 30 9 18" fill="#E4677A" stroke={INK} strokeWidth={3.5} /></g>;
  else if (mood === 'strain') mouth = <path d="M -22 6 q 7 -7 14 0 t 14 0 t 14 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
  else if (mood === 'sad') mouth = <path d="M -18 14 Q 0 0 18 14" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (mood === 'sleep') { const o = 0.6 + 0.4 * Math.sin(t * 2 * Math.PI * 0.55); mouth = <ellipse cx={0} cy={10} rx={8 * o + 3} ry={9 * o + 3} fill="#5A2328" stroke={INK} strokeWidth={4} />; }
  return (
    <g>
      <circle r={R + 1} fill="url(#gfFace)" stroke={INK} strokeWidth={6.5} />
      {pale > 0.01 ? <circle r={R - 2.5} fill="#A7C3DC" opacity={0.62 * pale} /> : null}
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
  limp: sym({e: [50, -112], h: [46, -74]}),
  cross: {r: {e: [46, -110], h: [-22, -118]}, l: {e: [-46, -114], h: [24, -130]}, front: 1} as ArmsP,
  up: sym({e: [70, -176], h: [74, -214]}),
};
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
/** his body without the head, in the normal white-and-ink look (the glass version is this drawing through #glassify) */
const BodyDraw: React.FC<{arms: ArmsP}> = ({arms}) => {
  const armsEl = <><Arm sd={-1} a={arms.l} /><Arm sd={1} a={arms.r} /></>;
  return (
    <g>
      {arms.front ? null : armsEl}
      {[-1, 1].map((sd) => <ellipse key={sd} cx={sd * 24} cy={-6} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />)}
      <path d={BODY_D} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {arms.front ? armsEl : null}
    </g>
  );
};
const LIVER_D = 'M -40 -104 C -40 -116 -24 -120 -12 -116 C -2 -122 12 -118 12 -108 C 14 -96 2 -88 -10 -90 C -22 -86 -40 -90 -40 -104 Z';
const VESSELS: P2[][] = [
  [[-56, -80], [-50, -112], [-38, -146], [-26, -128], [-18, -106]],
  [[56, -80], [50, -112], [38, -146], [14, -140], [-2, -112]],
  [[-24, -8], [-26, -40], [-24, -70], [-20, -96]],
  [[24, -8], [24, -40], [16, -72], [-4, -98]],
  [[0, -182], [6, -160], [12, -140], [-8, -112]],
];
const vesselD = (v: P2[]) => 'M ' + v.map(([x, y]) => `${x} ${y}`).join(' L ');
const alongPoly = (v: P2[], u: number): P2 => {
  const segs = v.slice(1).map((p, i) => Math.hypot(p[0] - v[i][0], p[1] - v[i][1])); const tot = segs.reduce((a, b) => a + b, 0);
  let d = clamp(u) * tot, i = 0; while (i < segs.length - 1 && d > segs[i]) { d -= segs[i]; i++; }
  return lp(v[i], v[i + 1], segs[i] ? d / segs[i] : 0);
};
const LIVER_SLOTS = slotsIn([[-25, -104, 17, 13], [0, -105, 14, 12]], 5, 30);

type GuyS = {mood: Mood; arms: ArmsP; glass: number; pale: number; dx: number; dy: number; rot: number; pivot: P2; sx: number; sy: number;
  headRot: number; look: number; sweat: number; pack: number; clot: number; stream: number; zzz: number};
const guyTf = (t: number, g: GuyS) => {
  const breathe = 1 + 0.008 * Math.sin(2 * Math.PI * 0.6 * t);
  return `translate(${GX + g.dx} ${g.dy}) rotate(${g.rot} ${g.pivot[0]} ${g.pivot[1]}) scale(${g.sx} ${g.sy * breathe})`;
};
const wipeY = (g: GuyS) => lerp(-196, 8, g.glass);

/** the see-through part (paper={false} layer): his body through the glass filter, heart, mirror liver, packing cells */
const GuyGlass: React.FC<{t: number; g: GuyS; uid: string}> = ({t, g, uid}) => {
  if (g.glass < 0.01) return null;
  const wy = wipeY(g);
  const liverS = 1 + 0.22 * g.pack + 0.04 * Math.sin(t * 30) * g.clot;
  const liverFill = g.pack > 0.02 ? (g.clot > 0.5 ? '#6E0F1E' : '#C93245') : SILVER;
  const streams = g.stream > 0 && g.stream < 1;
  return (
    <W><g transform={guyTf(t, g)}>
      <clipPath id={`gwG${uid}`}><rect x={-300} y={-420} width={600} height={wy + 420} /></clipPath>
      <g clipPath={`url(#gwG${uid})`}>
        <g filter="url(#glassify)"><BodyDraw arms={g.arms} /></g>
        {/* vessels: faint when the blood is hidden */}
        {VESSELS.map((v, i) => <path key={i} d={vesselD(v)} stroke="#F3A9B5" strokeWidth={3} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.55} />)}
        {/* heart */}
        <g transform={`translate(12 -142) scale(${1.25 * beat(t, 1.6)})`}><path d={HEART_D} fill="#F06A7E" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /></g>
        {/* liver: silver (mirror) with the hidden cells behind it; swells red when he packs them in, dark when it clots */}
        <g transform={`translate(-14 -104) scale(${liverS}) translate(14 104)`}>
          <path d={LIVER_D} fill={liverFill} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
          {g.pack > 0.02 ? LIVER_SLOTS.slice(0, Math.round(LIVER_SLOTS.length * g.pack)).map((p, i) => <ellipse key={i} cx={p[0]} cy={p[1]} rx={4.2} ry={3}
            fill={g.clot > 0.5 ? '#4A0A14' : BLOOD} stroke={g.clot > 0.5 ? '#2A050B' : BLOOD_RIM} strokeWidth={1.2} />) : null}
          {g.pack < 0.02 ? <path d="M -34 -110 L -26 -100 M -18 -114 L -8 -100 M 0 -114 L 8 -104" stroke="#FFFFFF" strokeWidth={3.5} strokeLinecap="round" opacity={0.95} /> : null}
          {g.clot > 0.01 ? <path d={LIVER_D} fill="none" stroke={RED} strokeWidth={4 + 3 * Math.abs(Math.sin(t * 12))} opacity={g.clot} transform="translate(-14 -104) scale(1.18) translate(14 104)" /> : null}
        </g>
        {/* cells streaming in from arms, legs and head while he packs them */}
        {streams ? VESSELS.map((v, i) => Array.from({length: 4}, (_, k) => {
          const u = (g.stream * 2.2 + k * 0.25 + i * 0.07) % 1;
          return <ellipse key={`${i}${k}`} cx={alongPoly(v, u)[0]} cy={alongPoly(v, u)[1]} rx={4.5} ry={3.2} fill={BLOOD} stroke={BLOOD_RIM} strokeWidth={1.2} />;
        })) : null}
        {/* glass shine */}
        <path d="M -37 -150 Q -41 -116 -37 -86" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
        <path d="M -33 -56 L -32 -26" stroke="#FFFFFF" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.9} />
        <path d="M 34 -160 L 38 -150" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
      </g>
      {/* shimmer along the wipe line while he vanishes */}
      {g.glass > 0.02 && g.glass < 0.98 ? Array.from({length: 7}, (_, i) => {
        const x = -54 + i * 18 + 6 * Math.sin(t * 20 + i), s = 0.5 + 0.5 * Math.abs(Math.sin(t * 25 + i * 1.7));
        return <path key={i} d={`M ${x} ${wy - 10 * s} L ${x + 3 * s} ${wy - 3 * s} L ${x + 10 * s} ${wy} L ${x + 3 * s} ${wy + 3 * s} L ${x} ${wy + 10 * s} L ${x - 3 * s} ${wy + 3 * s} L ${x - 10 * s} ${wy} L ${x - 3 * s} ${wy - 3 * s} Z`}
          fill="#FFFFFF" stroke="#7FD3FF" strokeWidth={2} />;
      }) : null}
    </g></W>
  );
};
/** the solid part (paper layer): his body while it is not glass, then always his head */
const GuySolid: React.FC<{t: number; g: GuyS; uid: string}> = ({t, g, uid}) => {
  const wy = wipeY(g);
  return (
    <W><g transform={guyTf(t, g)}>
      {g.glass < 0.99 ? <>
        <clipPath id={`gwO${uid}`}><rect x={-300} y={wy} width={600} height={420} /></clipPath>
        <g clipPath={`url(#gwO${uid})`}><BodyDraw arms={g.arms} /></g>
      </> : null}
      <g transform={`translate(0 -235) rotate(${g.headRot})`}><Head t={t} mood={g.mood} pale={g.pale} look={g.look} /></g>
      {g.sweat > 0.01 ? <Sweat x={58} y={-280 + 30 * ((t * 0.9) % 1)} s={0.9 * g.sweat} raw /> : null}
      {g.zzz > 0.01 ? <Zzz t={t} x={52} y={-300} s={g.zzz} /> : null}
    </g></W>
  );
};
const Zzz: React.FC<{t: number; x: number; y: number; s: number}> = ({t, x, y, s}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {[0, 1, 2].map((i) => {
      const u = ((t * 0.55 + i / 3) % 1);
      return <text key={i} x={18 * u + i * 4} y={-70 * u} fontFamily={FONT} fontWeight={900} fontSize={22 + 16 * u} fill="#FFFFFF" stroke={INK} strokeWidth={5}
        style={{paintOrder: 'stroke'}} opacity={u < 0.85 ? 1 : (1 - u) / 0.15} textAnchor="middle">Z</text>;
    })}
  </g>
);

// ---------- the glass frog co-star (side view, facing left towards him) ----------
const FB = 'M -90 -34 C -94 -66 -74 -96 -40 -103 C -4 -110 44 -106 70 -86 C 96 -66 98 -26 80 -8 C 68 4 42 2 12 2 L -56 2 C -78 2 -88 -14 -90 -34 Z';
const F_BACK = 'M -130 -44 C -80 -56 -26 -62 30 -56 C 70 -52 96 -48 130 -62 L 130 -150 L -130 -150 Z';
const F_BELLY = 'M -130 -44 C -80 -56 -26 -62 30 -56 C 70 -52 96 -48 130 -62 L 130 30 L -130 30 Z';
type FrogS = {mood: 'smug' | 'laugh' | 'yawn' | 'sleep' | 'shrug'; blood: number; mirror: number; look: number; shrug: number; yawn: number; zzz: number; bob: number};
const FrogBack: React.FC<{t: number; f: FrogS; uid: string}> = ({f, uid}) => (
  <W><g transform={`translate(${FX} ${FY + f.bob})`}>
    <clipPath id={`fbk${uid}`}><path d={F_BACK} /></clipPath>
    <g clipPath={`url(#fbk${uid})`}>
      <path d={FB} fill={FROG} />
      <path d="M -60 -92 C -30 -102 20 -102 50 -86" stroke={FROG_HI} strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
      {[[-10, -84, 5], [18, -90, 4], [40, -76, 5], [6, -70, 4], [60, -66, 4], [-30, -76, 3.5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={FROG_DOT} />)}
    </g>
  </g></W>
);
const FrogGlass: React.FC<{t: number; f: FrogS; uid: string}> = ({t, f, uid}) => {
  const legFill = 'rgba(196,246,170,0.55)';
  const frontRot = -72 * f.shrug;
  return (
    <W><g transform={`translate(${FX} ${FY + f.bob})`}>
      {/* back leg: thigh + foot (see-through) */}
      <path d="M 82 -30 C 92 -4 60 6 20 3" stroke={INK} strokeWidth={19} fill="none" strokeLinecap="round" />
      <path d="M 82 -30 C 92 -4 60 6 20 3" stroke="#D9F7C8" strokeWidth={10} fill="none" strokeLinecap="round" />
      {[8, 19, 30].map((x) => <ellipse key={x} cx={x} cy={4} rx={6} ry={4.5} fill="#F2FBE9" stroke={INK} strokeWidth={3} />)}
      <clipPath id={`fbl${uid}`}><path d={F_BELLY} /></clipPath>
      <g clipPath={`url(#fbl${uid})`}>
        <path d={FB} fill="rgba(190,244,165,0.42)" />
        {f.blood > 0.01 ? <path d={FB} fill="#F07C92" opacity={0.28 * f.blood} /> : null}
        {/* gut, liver, heart */}
        <path d="M 14 -22 C 24 -40 44 -36 40 -22 C 36 -10 22 -12 26 -22 C 30 -30 40 -26 52 -20" stroke="#E9C979" strokeWidth={6} fill="none" strokeLinecap="round" />
        <g transform="translate(-14 -24)">
          <ellipse cx={-6} cy={0} rx={19} ry={11} fill={f.mirror > 0.5 ? SILVER : '#C9435A'} stroke={INK} strokeWidth={3} />
          <ellipse cx={14} cy={3} rx={13} ry={9} fill={f.mirror > 0.5 ? SILVER : '#C9435A'} stroke={INK} strokeWidth={3} />
          {f.mirror > 0.5 ? <path d="M -16 -6 L -10 4 M -2 -7 L 4 3 M 10 -3 L 16 6" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" /> : null}
        </g>
        <g transform={`translate(-52 -26) scale(${0.85 * beat(t, 2.2)})`}><path d={HEART_D} fill="#F05A70" stroke={INK} strokeWidth={3} strokeLinejoin="round" /></g>
        {f.blood > 0.01 ? <path d="M -52 -20 C -40 -6 0 -6 40 -12 M -52 -30 C -30 -46 20 -50 60 -40" stroke={BLOOD} strokeWidth={3} fill="none" opacity={0.8 * f.blood} /> : null}
      </g>
      <path d={FB} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M -126 -44 C -80 -56 -26 -62 30 -56 C 70 -52 96 -48 130 -62" fill="none" stroke={FROG2} strokeWidth={3} opacity={0.0} />
      {/* front leg (lifts for the shrug) */}
      <g transform={`rotate(${frontRot} -58 -30)`}>
        <path d="M -58 -30 C -66 -18 -72 -8 -76 0" stroke={INK} strokeWidth={17} fill="none" strokeLinecap="round" />
        <path d="M -58 -30 C -66 -18 -72 -8 -76 0" stroke="#D9F7C8" strokeWidth={8} fill="none" strokeLinecap="round" />
        {[-90, -79, -68].map((x, i) => <ellipse key={x} cx={x} cy={2 + (i === 1 ? 2 : 0)} rx={6} ry={4.5} fill="#F2FBE9" stroke={INK} strokeWidth={3} />)}
      </g>
    </g></W>
  );
};
const FrogEye: React.FC<{cx: number; cy: number; r: number; lid: number; look: number; happy: boolean}> = ({cx, cy, r, lid, look, happy}) => {
  if (happy) return <g><circle cx={cx} cy={cy} r={r} fill={FROG} stroke={INK} strokeWidth={5} /><path d={`M ${cx - r * 0.6} ${cy + r * 0.15} Q ${cx} ${cy - r * 0.6} ${cx + r * 0.6} ${cy + r * 0.15}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /></g>;
  const id = `fe${Math.round(cx)}_${Math.round(cy)}`;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={FROG} stroke={INK} strokeWidth={5} />
      <circle cx={cx} cy={cy} r={r * 0.78} fill="#F0D982" stroke={INK} strokeWidth={3} />
      <ellipse cx={cx + look * r * 0.22} cy={cy + r * 0.04} rx={r * 0.45} ry={r * 0.28} fill={INK} />
      <circle cx={cx + look * r * 0.22 - r * 0.2} cy={cy - r * 0.1} r={r * 0.12} fill="#fff" />
      {lid > 0.01 ? <g>
        <clipPath id={id}><circle cx={cx} cy={cy} r={r * 0.8} /></clipPath>
        <rect x={cx - r} y={cy - r} width={2 * r} height={1.6 * r * lid + 1} fill={FROG_LID} clipPath={`url(#${id})`} />
        <path d={`M ${cx - r * 0.8} ${cy - r + 1.6 * r * lid} L ${cx + r * 0.8} ${cy - r + 1.6 * r * lid}`} stroke={INK} strokeWidth={4} clipPath={`url(#${id})`} />
      </g> : null}
    </g>
  );
};
const FrogFace: React.FC<{t: number; f: FrogS}> = ({t, f}) => {
  const lid = f.mood === 'sleep' ? 1 : f.mood === 'yawn' ? 0.55 + 0.4 * f.yawn : f.mood === 'shrug' ? 0.15 : 0.42;
  const happy = f.mood === 'laugh';
  const shakeY = happy ? 2.5 * Math.sin(t * 30) : 0;
  let mouth: React.ReactNode;
  if (f.mood === 'laugh') mouth = <g><path d="M -92 -44 Q -66 -38 -42 -46 Q -50 -16 -70 -16 Q -90 -22 -92 -44 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={-66} cy={-24} rx={11} ry={5} fill="#E4677A" /></g>;
  else if (f.mood === 'yawn') mouth = <ellipse cx={-70} cy={-38} rx={20 + 4 * f.yawn} ry={3 + 19 * f.yawn} fill="#5A2328" stroke={INK} strokeWidth={5} />;
  else if (f.mood === 'sleep') mouth = <path d="M -90 -40 Q -70 -32 -48 -40" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else mouth = <path d="M -91 -42 Q -72 -28 -48 -38 Q -42 -41 -40 -48" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  const browUp = f.mood === 'shrug' ? -8 : 0;
  return (
    <W><g transform={`translate(${FX} ${FY + f.bob + shakeY})`}>
      <FrogEye cx={-24} cy={-110} r={17} lid={lid} look={f.look} happy={happy} />
      <FrogEye cx={-58} cy={-102} r={22} lid={lid} look={f.look} happy={happy} />
      {f.mood === 'shrug' || f.mood === 'smug' ? <>
        <path d={`M -74 ${-132 + browUp} Q -60 ${-140 + browUp} -46 ${-134 + browUp}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        <path d={`M -34 ${-136 + browUp} Q -22 ${-142 + browUp} -12 ${-136 + browUp * 1.3}`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      </> : null}
      {/* nostrils */}
      <circle cx={-86} cy={-62} r={2.6} fill={INK} /><circle cx={-78} cy={-66} r={2.6} fill={INK} />
      {mouth}
      {f.zzz > 0.01 ? <Zzz t={t} x={-10} y={-136} s={f.zzz} /> : null}
    </g></W>
  );
};

// ---------- the toucan (flies in from the left, can't see him, BONK) ----------
const Toucan: React.FC<{x: number; y: number; s: number; rot: number; flap: number; sq: number; dizzy: boolean; t: number}> = ({x, y, s, rot, flap, sq, dizzy, t}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * (1 - 0.3 * sq)} ${s * (1 + 0.22 * sq)})`}>
    <path d="M -38 2 L -86 16 L -80 32 L -32 18 Z" fill="#262626" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <g transform={`rotate(${-flap * 0.8} -4 -14)`}><path d="M -4 -14 C -36 -62 -74 -46 -48 -12 Z" fill="#1A1A1A" stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>
    <ellipse cx={0} cy={0} rx={44} ry={31} fill="#262626" stroke={INK} strokeWidth={6} />
    <path d="M 12 -24 C 40 -22 46 12 26 26 C 10 32 0 12 4 -8 Z" fill="#FFF3C4" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 28 -22 C 64 -42 116 -30 136 -2 C 112 14 64 14 30 8 Z" fill="#FFA41B" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M 40 -24 C 70 -36 104 -28 122 -14" stroke="#FFDA4D" strokeWidth={8} fill="none" strokeLinecap="round" />
    <path d="M 120 -16 C 130 -10 136 -4 136 -2 C 130 4 124 6 116 6 Z" fill={RED} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 32 -4 C 70 -4 104 -4 134 -3" stroke={INK} strokeWidth={3.5} fill="none" />
    <circle cx={20} cy={-12} r={11} fill="#4CC9F0" stroke={INK} strokeWidth={4} />
    {dizzy ? <path d={`M 20 -12 m -2 0 a 3 3 0 1 1 4 2 a 6 6 0 1 1 -8 -5`} transform={`rotate(${t * 700} 20 -12)`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
      : <><circle cx={20} cy={-12} r={6.5} fill="#fff" /><circle cx={22} cy={-12} r={3.8} fill={INK} /></>}
    <g transform={`rotate(${flap} -10 -10)`}><path d="M -10 -10 C -46 -54 -88 -30 -58 -4 C -42 6 -22 4 -10 -10 Z" fill="#262626" stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>
  </g>
);
const BS = 0.64;                                    // toucan size
const IMPACT: P2 = [GX - 112, -150];               // toucan centre when its beak (30 deg down) hits his belly
const TIP: P2 = [IMPACT[0] + 76, IMPACT[1] + 42];  // the beak tip at that moment
const birdAt = (t: number, tb: number) => {
  const u = t - tb;
  if (u < -0.4 || u > 1.1) return null;
  if (u < 0) {
    const p = (u + 0.4) / 0.4;
    return {x: lerp(IMPACT[0] - 300, IMPACT[0], p), y: lerp(IMPACT[1] - 190, IMPACT[1], p), rot: 30, flap: 34 * Math.sin(t * 2 * Math.PI * 7), sq: 0, dizzy: false};
  }
  return {x: IMPACT[0] - 400 * u, y: IMPACT[1] - 260 * u + 0.5 * 1700 * u * u, rot: 30 - 420 * u, flap: 20 * Math.sin(t * 40), sq: Math.max(0, 1 - u / 0.09), dizzy: u > 0.06};
};
const Feathers: React.FC<{t: number; tb: number}> = ({t, tb}) => {
  const u = t - tb;
  if (u < 0 || u > 1.3) return null;
  return <g>{Array.from({length: 6}, (_, i) => {
    const a = -Math.PI * (0.25 + 0.7 * rnd(i * 3.1 + tb)), v = 160 + 140 * rnd(i * 5.7 + tb);
    const x = IMPACT[0] + 30 + Math.cos(a) * v * u + 14 * Math.sin(u * 7 + i), y = IMPACT[1] + 10 + Math.sin(a) * v * u + 140 * u * u;
    const s = 1 - seg(u, 0.9, 1.3);
    return <g key={i} transform={`translate(${x} ${y}) rotate(${u * 300 * (i % 2 ? 1 : -1) + i * 60}) scale(${s})`}>
      <path d="M 0 -11 Q 7 0 0 13 Q -7 0 0 -11 Z" fill="#262626" stroke={INK} strokeWidth={2.5} /><path d="M 0 -9 L 0 12" stroke="#5A5A5A" strokeWidth={1.5} />
    </g>;
  })}</g>;
};
const Burst: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  if (s < 0.02) return null;
  const pts = Array.from({length: 16}, (_, i) => { const a = (i / 16) * Math.PI * 2, r = i % 2 ? 22 : 50; return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`; }).join(' ');
  return <g transform={`translate(${x} ${y}) scale(${s})`}><polygon points={pts} fill="#FFF6C9" stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>;
};
const Bird: React.FC<{t: number}> = ({t}) => (
  <W>{[0, BIRD2].map((tb) => {
    const b = birdAt(t, tb); if (!b) return null;
    const bs = t >= tb ? 1 - seg(t, tb + 0.06, tb + 0.2) : 0;
    return <g key={tb}><Toucan {...b} s={BS} t={t} /><Burst x={TIP[0] + 4} y={TIP[1]} s={bs * 0.8} /><Feathers t={t} tb={tb} /></g>;
  })}</W>
);

// ---------- the set: rainforest doodles ----------
const LeafShape: React.FC<{x: number; y: number; s: number; rot: number; fill?: string; vein?: string; sw?: number}> = ({x, y, s, rot, fill = '#9BD27A', vein = '#6FA853', sw = 6}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 0 C 30 -44 96 -50 150 0 C 96 50 30 44 0 0 Z" fill={fill} stroke={INK} strokeWidth={sw / s} strokeLinejoin="round" />
    <path d="M 6 0 L 140 0" stroke={vein} strokeWidth={4 / s} />
    {[34, 66, 98].map((vx) => <path key={vx} d={`M ${vx} 0 L ${vx + 20} -20 M ${vx} 0 L ${vx + 20} 20`} stroke={vein} strokeWidth={3.5 / s} />)}
  </g>
);
const FarJungle: React.FC = () => (
  <W><g>
    {[-1300, -600, 200, 1000].map((x, i) => <ellipse key={i} cx={x} cy={-20} rx={460} ry={150} fill="#CDE8B4" stroke={INK} strokeWidth={6} />)}
    {[[-980, -620, 2.6, 20], [-760, -330, 2.2, -30], [-420, -690, 2.4, 160], [520, -640, 2.5, 30], [760, -300, 2.2, 200], [260, -420, 1.8, -40],
      [-520, -140, 2.0, -60], [380, -120, 2.1, 240]].map(([x, y, s, r], i) => <LeafShape key={i} x={x} y={y} s={s} rot={r} fill={i % 2 ? '#A9D98A' : '#B9E39C'} vein="#7DB862" sw={6} />)}
    {[-700, -150, 420].map((x, i) => <path key={'v' + i} d={`M ${x} -1200 C ${x + 60} -900 ${x - 60} -700 ${x + 30} -420`} stroke="#6FA853" strokeWidth={14} fill="none" strokeLinecap="round" />)}
  </g></W>
);
/** big leaves right behind him, so they show through his glass body */
const MidLeaves: React.FC = () => (
  <W><g>
    {[[-420, -170, 1.4, -20], [-250, -34, 1.45, -8], [-238, 34, 1.3, 14], [-60, -250, 1.2, -150], [-470, -300, 1.3, -40]].map(([x, y, s, r], i) => <LeafShape key={i} x={x} y={y} s={s} rot={r} fill={i % 2 ? '#8CCB6B' : '#7FC25F'} vein="#4F8F3A" sw={6} />)}
  </g></W>
);
/** the frog's plant: a stem from the ground and the big leaf it sits on */
const FrogPlant: React.FC = () => (
  <W><g>
    <g transform={`translate(${FX - 150} 0)`}>
    <path d="M 330 0 C 318 -60 312 -110 286 -150" stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
    <path d="M 330 0 C 318 -60 312 -110 286 -150" stroke="#5E9A4C" strokeWidth={12} fill="none" strokeLinecap="round" />
    <path d="M 8 -150 C 80 -176 220 -180 312 -152 C 220 -130 80 -128 8 -150 Z" fill="#79BF5A" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M 20 -151 C 110 -158 220 -158 300 -152" stroke="#4F8F3A" strokeWidth={4} fill="none" />
    </g>
  </g></W>
);

// ---------- inserts (screen space) ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 450}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const XR = 290, XCY = 730;   // X-ray panels: radius and centre (screen); his / the frog's face shows below them, captions under that
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
const Counter: React.FC<{t: number; s: number; value: string | number; label: string; sub?: string; red: boolean; bumpAt: number; left: number; top: number; rot?: number}> =
  ({t, s, value, label, sub, red, bumpAt, left, top, rot = 6}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s * (1 + 0.1 * Math.max(0, 1 - (t - bumpAt) * 4) * (t > bumpAt ? 1 : 0))})`,
    background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '6px 24px 10px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
    <div style={{fontWeight: 900, fontSize: 96, lineHeight: 1, color: red ? RED : INK}}>{value}</div>
    <div style={{fontWeight: 900, fontSize: 32}}>{label}</div>
    {sub ? <div style={{fontWeight: 800, fontSize: 25}}>{sub}</div> : null}
  </div>
) : null;

/** X-RAY 1: the glass frog from below. Red cells run round its body; from "hides" 40 of 45 leave and pack into the liver
 *  (HIDDEN 0 -> 89 %), its body clears, then a mirror covers the liver. */
const FX_A = mkLoop([[0, -96], [-62, -76], [-108, -10], [-104, 80], [-58, 146], [-6, 120], [-14, 30], [-10, -60]]);
const FX_B = mkLoop([[0, -96], [62, -76], [108, -10], [104, 80], [58, 146], [6, 120], [14, 30], [10, -60]]);
const FX_C = mkLoop([[0, -100], [-56, -150], [-30, -206], [30, -206], [56, -150]]);
const FX_LOOPS = [FX_A, FX_B, FX_C];
const FX_LIVER: [number, number, number, number][] = [[-34, 8, 58, 40], [40, 16, 46, 34]];
const FX_SLOTS = slotsIn(FX_LIVER, 14, 40);
const N1 = 45, H1 = 40;
const hide1 = (i: number) => lerp(3.95, 6.3, i / H1) + (rnd(i * 3.3) - 0.5) * 0.08;
const cell1 = (i: number, t: number): {p: P2; packed: boolean} => {
  const L = FX_LOOPS[i % 3], ph = rnd(i * 7.1), sp = 0.2 + 0.05 * rnd(i * 1.9);
  const pos = (tt: number) => along(L, ph + sp * tt);
  if (i >= H1 || t < hide1(i)) return {p: pos(t), packed: false};
  const th = hide1(i), u = eio(seg(t, th, th + 0.38));
  return {p: lp(pos(th), FX_SLOTS[i % FX_SLOTS.length], u), packed: u >= 1};
};
const FrogXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const cells = Array.from({length: N1}, (_, i) => cell1(i, t));
  const hidden = cells.filter((c) => c.packed).length;
  const pct = Math.round((100 * hidden) / N1);
  const blood = 1 - hidden / N1;
  const mir = seg(t, T.mirror - 0.05, T.mirror + 0.25);
  const shineX = lerp(-160, 160, seg(t, T.mirror + 0.05, T.mirror + 0.6));
  const BODY = 'M 0 -236 C 108 -236 150 -150 150 -40 C 150 90 100 190 0 200 C -100 190 -150 90 -150 -40 C -150 -150 -108 -236 0 -236 Z';
  return (
    <div style={{position: 'absolute', left: 540, top: XCY, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id="fxr">
        <g transform="translate(0 6) scale(1.02)">
          {/* legs */}
          {[-1, 1].map((sd) => <g key={sd}>
            <path d={`M ${sd * 118} -86 L ${sd * 210} -160 L ${sd * 240} -150`} stroke="#9DE07A" strokeWidth={26} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
            <path d={`M ${sd * 120} 132 L ${sd * 236} 196 L ${sd * 160} 262`} stroke="#9DE07A" strokeWidth={30} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
          </g>)}
          {/* eyes bulge out at the sides */}
          {[-1, 1].map((sd) => <g key={'e' + sd}><circle cx={sd * 108} cy={-196} r={42} fill="#2C4A2C" stroke="#9DE07A" strokeWidth={5} /><circle cx={sd * 108} cy={-196} r={26} fill="#D9C46A" /><ellipse cx={sd * 108} cy={-196} rx={14} ry={8} fill={INK} /></g>)}
          <path d={BODY} fill="#A6E487" fillOpacity={0.2} stroke="#C4F5AA" strokeWidth={8} />
          <path d={BODY} fill="#F07C92" opacity={0.3 * blood} />
          {/* vessels */}
          {FX_LOOPS.map((L, i) => <path key={i} d={loopD(L)} stroke="#F07C92" strokeWidth={6} fill="none" opacity={0.15 + 0.55 * blood} />)}
          {/* gut */}
          <path d="M -40 112 C -20 80 30 84 26 110 C 22 132 -14 130 -8 110 C -2 94 30 96 56 118" stroke="#E9C979" strokeWidth={12} fill="none" strokeLinecap="round" opacity={0.85} />
          {/* liver */}
          {FX_LIVER.map(([cx, cy, rx, ry], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#E8D7CB" opacity={0.25} stroke="#F2E6DE" strokeWidth={5} />)}
          {cells.map((c, i) => c.packed ? <Cell key={i} p={c.p} r={9} rot={rnd(i) * 180} /> : null)}
          {mir > 0.01 ? <g opacity={mir}>
            <clipPath id="fxrLiver">{FX_LIVER.map(([cx, cy, rx, ry], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} />)}</clipPath>
            {FX_LIVER.map(([cx, cy, rx, ry], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill={SILVER} stroke={SILVER2} strokeWidth={5} />)}
            <g clipPath="url(#fxrLiver)"><path d={`M ${shineX - 30} -60 L ${shineX + 10} -60 L ${shineX - 50} 80 L ${shineX - 90} 80 Z`} fill="#FFFFFF" />
              <path d={`M ${shineX + 26} -60 L ${shineX + 40} -60 L ${shineX - 20} 80 L ${shineX - 34} 80 Z`} fill="#FFFFFF" /></g>
          </g> : null}
          {/* heart */}
          <g transform={`translate(0 -100) scale(${2.6 * beat(t, 1.8)})`}><path d={HEART_D} fill="#F05A70" stroke="#FFC2CC" strokeWidth={1.6} strokeLinejoin="round" /></g>
          {cells.map((c, i) => c.packed ? null : <Cell key={'m' + i} p={c.p} r={9} rot={t * 90 + i * 40} />)}
        </g>
        <Scan t={t} />
      </XFrame>
      <Card text="X-RAY: GLASS FROG" top={110} size={46} />
      <Card text="9 IN 10" top={742} color={GOLD} rot={3} s={pulse(t, T.nine - 0.05, 0.95)} size={56} />
      <Card text="INTO THE LIVER" top={742} color={GOLD} rot={-3} s={pulse(t, T.liver - 0.06, 0.5)} size={50} />
      <Card text="MIRROR" top={742} color="#E8F1F8" rot={3} s={popIn(t, T.mirror - 0.03, 0.3)} size={56} />
      <Counter t={t} s={popIn(t, T.nine - 0.15, 0.3)} value={`${pct}%`} label="BLOOD CELLS" sub="HIDDEN" red={false} bumpAt={6.4} left={790} top={290} />
    </div>
  );
};

/** X-RAY 2: you. Red cells carry oxygen (white dots) up to your brain; "hide them" -> 32 of 36 go into your liver,
 *  OXYGEN 100 -> 11 %, the brain greys and goes dark, DANGER. */
const YX_LOOP = mkLoop([[-30, 70], [-58, -20], [-88, -118], [-64, -214], [0, -246], [64, -214], [88, -118], [58, -20], [8, 64]]);
const YX_LIVER: [number, number, number, number][] = [[40, 196, 64, 36], [104, 204, 38, 28]];
const YX_SLOTS = slotsIn(YX_LIVER, 13, 32);
const N2 = 36, H2 = 32;
const hide2 = (i: number) => lerp(9.62, 10.55, i / H2) + (rnd(i * 4.4) - 0.5) * 0.06;
const cell2 = (i: number, t: number): {p: P2; packed: boolean; f: number} => {
  const ph = i / N2 + 0.01 * rnd(i), sp = 0.24;
  const f = (ph + sp * t) % 1;
  if (i >= H2 || t < hide2(i)) return {p: along(YX_LOOP, f), packed: false, f};
  const th = hide2(i), u = eio(seg(t, th, th + 0.34));
  return {p: lp(along(YX_LOOP, (ph + sp * th) % 1), YX_SLOTS[i % YX_SLOTS.length], u), packed: u >= 1, f: -1};
};
const mixHex = (a: string, b: string, u: number) => {
  const pa = [1, 3, 5].map((k) => parseInt(a.slice(k, k + 2), 16)), pb = [1, 3, 5].map((k) => parseInt(b.slice(k, k + 2), 16));
  return '#' + pa.map((v, k) => Math.round(lerp(v, pb[k], clamp(u))).toString(16).padStart(2, '0')).join('');
};
const YouXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const cells = Array.from({length: N2}, (_, i) => cell2(i, t));
  const hidden = cells.filter((c) => c.packed).length;
  const oxy = 100 - Math.round((100 * hidden) / N2);
  const dark = seg(t, T.goes, T.dark + 0.1);
  const brain = dark > 0 ? mixHex('#8A8FA3', '#232A45', dark) : mixHex('#F49AB9', '#8A8FA3', 1 - oxy / 100);
  const glow = oxy / 100 * (0.5 + 0.5 * Math.sin(t * 9));
  const BRAIN = 'M -96 -150 C -110 -200 -70 -250 -20 -244 C 0 -262 50 -258 70 -236 C 110 -226 118 -170 96 -140 C 104 -110 70 -92 40 -100 C 10 -86 -30 -88 -50 -102 C -84 -96 -110 -118 -96 -150 Z';
  return (
    <div style={{position: 'absolute', left: 540, top: XCY, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s})`}}>
      <XFrame id="yxr">
        <g transform="translate(0 30) scale(0.98)">
          {/* outline of you */}
          <circle cx={0} cy={-176} r={128} fill="none" stroke="#EFE7D2" strokeWidth={6} opacity={0.6} />
          <path d="M -48 -54 L -46 -20 C -150 -6 -232 30 -246 120 L -250 330 M 48 -54 L 46 -20 C 150 -6 232 30 246 120 L 250 330" stroke="#EFE7D2" strokeWidth={6} fill="none" opacity={0.6} />
          {/* brain */}
          {glow > 0.02 ? <path d={BRAIN} fill="#FFD1E0" opacity={0.35 * glow} transform="scale(1.12) translate(0 18)" /> : null}
          <path d={BRAIN} fill={brain} stroke="#16223A" strokeWidth={5} />
          <path d="M -60 -190 C -40 -170 -60 -150 -30 -136 M 0 -236 C -10 -200 20 -180 4 -150 M 50 -214 C 36 -190 70 -170 50 -140" stroke="#16223A" strokeWidth={5} fill="none" opacity={0.45} strokeLinecap="round" />
          {/* vessel loop, liver, heart */}
          <path d={loopD(YX_LOOP)} stroke="#F07C92" strokeWidth={8} fill="none" opacity={0.5} />
          {YX_LIVER.map(([cx, cy, rx, ry], i) => <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={ry} fill="#C98A7A" opacity={0.45} stroke="#E8C2B6" strokeWidth={5} />)}
          <path d="M 0 70 C 20 120 30 150 34 170" stroke="#F07C92" strokeWidth={8} fill="none" opacity={0.5} />
          {cells.map((c, i) => c.packed ? <Cell key={i} p={c.p} r={9} rot={rnd(i) * 180} /> : null)}
          <g transform={`translate(-28 70) scale(${3.0 * beat(t, 1.5)})`}><path d={HEART_D} fill="#F05A70" stroke="#FFC2CC" strokeWidth={1.4} strokeLinejoin="round" /></g>
          {cells.map((c, i) => c.packed ? null : <g key={'m' + i}>
            <Cell p={c.p} r={9} rot={t * 80 + i * 30} />
            {c.f >= 0 && c.f < 0.47 ? <circle cx={c.p[0] + 7} cy={c.p[1] - 9} r={6.5} fill="#FFFFFF" stroke="#16223A" strokeWidth={2} /> : null}
          </g>)}
        </g>
        <Scan t={t} />
      </XFrame>
      <Card text="X-RAY: YOU" top={110} size={46} />
      <Card text="OXYGEN" top={742} color="#FFFFFF" rot={-3} s={pulse(t, T.oxygen - 0.05, 0.75)} size={54} />
      <Card text="HIDE THEM" top={742} color={GOLD} rot={3} s={pulse(t, T.hide - 0.05, 0.85)} size={54} />
      <Card text="DANGER" top={742} color={RED} fg="#fff" rot={-3} s={popIn(t, T.goes + 0.05, 0.3)} size={58} />
      <Counter t={t} s={popIn(t, T.oxygen - 0.12, 0.3)} value={`${oxy}%`} label="OXYGEN" sub="TO YOUR BRAIN" red={oxy < 50} bumpAt={10.6} left={790} top={290} />
    </div>
  );
};

/** "your brain goes dark": the whole screen goes dark, only his eyes blink, then the light clicks back on */
const Blackout: React.FC<{t: number}> = ({t}) => {
  if (t < S5 || t >= S6) return null;
  const u = t - S5;
  const open = u > 0.2 && u < 0.27 ? 0.12 : 1;
  const lx = 9 * Math.sin(u * 10);
  return (
    <AbsoluteFill style={{background: '#0E1424'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[-1, 1].map((sd) => <g key={sd} transform={`translate(${540 + sd * 72} 880)`}>
          <ellipse rx={34} ry={44 * open} fill="#FFFFFF" />
          {open > 0.5 ? <circle cx={lx} cy={4} r={15} fill="#0E1424" /> : null}
        </g>)}
      </svg>
    </AbsoluteFill>
  );
};

// ---------- the story over time ----------
const G0: GuyS = {mood: 'smug', arms: ARM.cross, glass: 1, pale: 0, dx: 0, dy: 0, rot: 0, pivot: [0, 0], sx: 1, sy: 1, headRot: 0, look: 0,
  sweat: 0, pack: 0, clot: 0, stream: 0, zzz: 0};
const guyAt = (t: number): GuyS => {
  const g: GuyS = {...G0};
  g.dx = spring(t, 0, 7, 3, 7);                                   // the toucan nudges him at frame 0
  if (t < S2) return g;
  if (t < S4) {
    // the close-up: smug -> his face drains -> eyes roll -> he slumps out of the frame
    g.mood = t < T.youd ? 'smug' : t < 2.84 ? 'shock' : t < 2.98 ? 'woozy' : 'faint';
    g.pale = seg(t, T.youd, 2.9);
    g.arms = blendArms(ARM.cross, ARM.limp, eio(seg(t, 2.6, 2.95)));
    const fall = easeIn(seg(t, 2.96, FAINT1));
    g.dy = 150 * fall - (t > FAINT1 ? spring(t, FAINT1, 10, 3, 8) : 0);
    g.rot = -16 * fall + (t < 2.96 ? 3 * Math.sin((t - 2.6) * 14) * seg(t, 2.6, 2.75) : 0);
    g.pivot = [0, -120];
    g.headRot = -10 * fall;
    return g;
  }
  if (t < S6) {
    // standing again behind YOUR X-ray: blood back, solid, worried; pale as the oxygen drops
    g.glass = 0; g.arms = ARM.down;
    g.mood = t < T.hide ? 'worry' : t < T.goes ? 'shock' : 'woozy';
    g.pale = seg(t, 9.7, 10.9);
    g.look = 0;
    return g;
  }
  if (t < S7) {
    // he vanishes again; his own cells pack into his liver -> CLOT
    g.arms = ARM.down;
    g.glass = eio(seg(t, VANISH, VANISH + 0.3));
    g.mood = t < 12.3 ? 'smug' : t < T.clot ? 'worry' : 'strain';
    g.stream = seg(t, 11.9, 12.95);
    g.pack = seg(t, 12.0, 12.95);
    g.clot = seg(t, T.clot, T.clot + 0.15);
    g.pale = 0.75 * seg(t, T.clot, T.clot + 0.3);
    g.sweat = seg(t, T.clot + 0.1, T.clot + 0.3);
    g.sy = 1 - spring(t, T.clot, 0.025, 4, 6);
    return g;
  }
  if (t < S9) {
    // woozy at the frog's leaf, then he keels over like a plank at its feet
    g.arms = ARM.limp; g.mood = t < 14.98 ? 'woozy' : 'faint'; g.pale = 0.8;
    const fall = easeIn(seg(t, 14.86, FAINT2));
    g.pivot = [30, 0];
    g.rot = 84 * fall - (t > FAINT2 ? spring(t, FAINT2, 5, 3, 7) : 0) + (t < 14.86 ? 4 * Math.sin((t - S7) * 5) : 0);
    return g;
  }
  // he vanishes only in his sleep now: standing, arms crossed, asleep; the toucan BONKs into him again
  g.mood = 'sleep'; g.zzz = popIn(t, S9 + 0.15, 0.4);
  g.dx = spring(t, BIRD2, 7, 3, 7);
  g.headRot = 4 * Math.sin((t - S9) * 1.6);
  return g;
};
const frogAt = (t: number): FrogS => {
  const f: FrogS = {mood: 'smug', blood: 0.8, mirror: 0, look: -1, shrug: 0, yawn: 0, zzz: 0, bob: 0};
  if (t < S3) return f;
  if (t < S4) {   // under its X-ray: it dozes off while its blood hides
    f.mood = t < 6.1 ? 'smug' : 'sleep';
    f.blood = 1 - seg(t, T.hides, T.liver);
    f.mirror = t > T.mirror ? 1 : 0;
    f.zzz = popIn(t, 6.2, 0.4);
    return f;
  }
  if (t < S8) {   // awake again: smug, then "???" shrug, then it laughs at him
    f.mood = t > FAINT2 + 0.06 ? 'laugh' : t > T.why - 0.1 ? 'shrug' : 'smug';
    f.shrug = t > FAINT2 + 0.06 ? 0 : eio(seg(t, T.why - 0.1, T.why + 0.15)) * (1 - eio(seg(t, 14.95, 15.1)));
    f.bob = f.mood === 'shrug' ? -4 * f.shrug : 0;
    return f;
  }
  if (t < S9) {   // "It only does it asleep": yawn, lids drop, the blood hides, a mirror shines
    f.yawn = Math.sin(Math.PI * seg(t, 15.56, 16.08));
    f.mood = t < 15.56 ? 'smug' : t < 16.08 ? 'yawn' : 'sleep';
    f.blood = 0.8 * (1 - seg(t, 16.15, 16.6));
    f.mirror = t > 16.5 ? 1 : 0;
    f.zzz = popIn(t, T.asleep, 0.4);
    f.bob = 2 * Math.sin(t * 2.4) * (t > 16.08 ? 1 : 0);
    return f;
  }
  return {...f, mood: 'sleep', blood: 0, mirror: 1, zzz: 1, bob: 2 * Math.sin(t * 2.4)};
};

/** caption band per shot (screen y): below faces and the X-rays */
const capY = (t: number) => (t >= S5 && t < S6 ? 1395 : t >= S7 && t < S8 ? 1440 : t >= S8 && t < S9 ? 1420 : 1480);

export const GlassScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: -40, y: -172, k: 2.95}, {t: 1.6, x: -40, y: -174, k: 3.06},                 // frame 0: see-through him, the toucan BONKs, the frog
    {t: S2, x: GX, y: -226, k: 3.72}, {t: 2.9, x: GX, y: -228, k: 3.88}, {t: S3 - 0.02, x: GX, y: -226, k: 3.88}, // close-up: he passes out
    {t: S3, x: FX - 5, y: -322, k: 2.6}, {t: S4 - 0.02, x: FX - 5, y: -320, k: 2.74},       // the frog, under its X-ray
    {t: S4, x: GX, y: -356, k: 2.4}, {t: S5 - 0.02, x: GX, y: -352, k: 2.5},                // him, under YOUR X-ray
    {t: S6, x: GX + 35, y: -160, k: 3.55}, {t: S7 - 0.02, x: GX + 35, y: -150, k: 3.8},      // he vanishes again -> CLOT
    {t: S7, x: 25, y: -150, k: 2.55}, {t: S8 - 0.02, x: 30, y: -146, k: 2.62},              // two-shot: ??? and the plank fall
    {t: S8, x: FX - 25, y: -205, k: 3.7}, {t: S9 - 0.02, x: FX - 25, y: -205, k: 3.88},      // the frog falls asleep
    {t: S9, x: -40, y: -172, k: 2.85}, {t: DURATION, x: -40, y: -172, k: 3.0},              // he vanishes in his sleep = frame 0
  ], t);
  const sh = shake(t, hit(t, 0, 8, 7) + hit(t, FAINT1, 10, 6) + hit(t, T.clot, 5, 7) + hit(t, FAINT2, 10, 6) + hit(t, BIRD2, 6, 7));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const g = guyAt(t), f = frogAt(t);
  // inserts
  const fxS = popIn(t, S3 + 0.04, 0.35) * (1 - seg(t, S4 - 0.14, S4 - 0.02));
  const yxS = popIn(t, S4 + 0.04, 0.35) * (1 - seg(t, S5 - 0.12, S5 - 0.01));
  // stickers
  const bonk0 = t < 0.45 ? 1 : 1 - seg(t, 0.45, 0.6);
  const lights = pulse(t, FAINT1 - 0.02, 0.26), packed = pulse(t, T.tight - 0.04, 0.55), clot = pulse(t, T.clot, 0.45);
  const huh = pulse(t, T.why - 0.05, 0.75), thud = pulse(t, FAINT2, 0.3), asleep = pulse(t, T.asleep - 0.04, 0.5), bonk2 = pulse(t, BIRD2, 0.45);
  const stars = (t > FAINT1 + 0.02 && t < S3) || (t > FAINT2 + 0.02 && t < S9) ? 1 : 0;
  const starC: P2 = t < S4 ? [GX + 26, -232 + 150 - 46] : [GX + 30 + 228, -62 - 40];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <W><defs>
        <radialGradient id="gfFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
        <filter id="glassify" x="-30%" y="-30%" width="160%" height="160%" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values="0.21 0.413 0.077 0 0.08  0.252 0.4956 0.0924 0 0.08  0.276 0.5428 0.1012 0 0.08  -0.225 -0.4425 -0.0825 1 0" />
        </filter>
      </defs></W>
      <Sky />
      <Layer cam={cam} z={2600} paper={false}>
        <FarJungle />
        <Ground y={0} color="#DDEFC7" line={false} />
      </Layer>
      <Layer cam={cam} z={1500}>
        <MidLeaves />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Ground y={0} line color="#CDE5B0" />
        <FrogPlant />
        <FrogBack t={t} f={f} uid={uid} />
      </Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <FrogGlass t={t} f={f} uid={uid} />
        <GuyGlass t={t} g={g} uid={uid} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <FrogFace t={t} f={f} />
        <GuySolid t={t} g={g} uid={uid} />
        <Bird t={t} />
        <W>{[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={starC[0] + Math.cos(a) * 86} y={starC[1] + Math.sin(a) * 16} s={stars * 0.5} rot={t * 200} />;
        })}</W>
        {thumb ? null : <>
          <Txt x={GX - 80} y={-40} s={bonk0} text="BONK" size={42} rot={-9} fill={GOLD} />
          <Txt x={GX + 4} y={-330} s={lights} text="LIGHTS OUT" size={40} rot={-5} fill="#FFFFFF" />
          <Txt x={GX + 108} y={-118} s={packed} text="PACKED" size={32} rot={7} fill={GOLD} />
          <Txt x={GX + 104} y={-118} s={clot} text="CLOT" size={44} rot={-6} fill={RED} />
          <Txt x={FX - 40} y={-318} s={huh} text="???" size={56} rot={8} fill={GOLD} />
          <Txt x={GX + 250} y={-150} s={thud} text="THUD" size={44} rot={-7} fill="#FFFFFF" />
          <Txt x={FX + 40} y={-300} s={asleep} text="ASLEEP" size={36} rot={6} fill={GOLD} />
          <Txt x={GX - 80} y={-40} s={bonk2} text="BONK" size={42} rot={8} fill={GOLD} />
        </>}
      </Layer>
      <FrogXRay t={t} s={fxS} />
      <YouXRay t={t} s={yxS} />
      <Blackout t={t} />
      {thumb ? null : <>
        <Captions t={t} words={WORDS} y={capY(t)} size={78} />
        <CommentBubble t={t} text="what if you could turn invisible like a glass frog??" handle="@peekaboo_doodle" likes="4.2K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so + 0.05} until={DURATION - LOOP_DUR - 0.4} text="What would you do see-through?" />
      </>}
    </AbsoluteFill>
  );
};

export const GlassFrogVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -29): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -18 : db}));
  const bonk = (tb: number, db = -9): Cue[] => [{f: 'bonk.wav', at: tb, db}, {f: 'chirp.wav', at: tb + 0.06, db: -20}, {f: 'pop.wav', at: tb + 0.02, db: -26}];
  const cues: Cue[] = [
    // frame 0: the toucan flies straight into his see-through chest
    ...bonk(0), {f: 'whoosh.wav', at: 0.02, db: -26},
    // close-up: he passes out
    {f: 'whoosh.wav', at: S2 - 0.02, db: -30}, {f: 'gasp.wav', at: T.youd + 0.02, db: -26}, {f: 'twang.mp3', at: 2.84, db: -27, to: 0.4},
    {f: 'thud.wav', at: FAINT1 - 0.01, db: -6}, {f: 'pop.wav', at: FAINT1 + 0.03, db: -24},
    // X-ray 1: the glass frog hides 9 in 10 red cells in its liver, behind a mirror
    {f: 'whoosh.wav', at: S3 - 0.04, db: -28}, {f: 'zap.wav', at: S3 + 0.04, db: -27}, {f: 'whir.mp3', at: T.hides, db: -33, to: 2.4},
    ...ticks(4.1, 6.25, 18), {f: 'pop.wav', at: T.nine - 0.05, db: -23}, {f: 'pop.wav', at: T.liver - 0.05, db: -24},
    {f: 'ding.mp3', at: T.mirror - 0.03, db: -23}, {f: 'shimmer.wav', at: T.mirror - 0.12, db: -28}, {f: 'snore.mp3', at: 6.3, db: -36, to: 1.3},
    // X-ray 2: your red cells carry oxygen; hide them -> OXYGEN 100 -> 11, the brain goes dark
    {f: 'whoosh.wav', at: S4 - 0.04, db: -28}, {f: 'zap.wav', at: S4 + 0.04, db: -27}, {f: 'bubbles.wav', at: T.oxygen, db: -27},
    {f: 'pop.wav', at: T.hide - 0.05, db: -23}, ...ticks(9.75, 10.6, 10, -28), {f: 'pop.wav', at: T.goes + 0.05, db: -22},
    // lights out: click off, click on
    {f: 'click.wav', at: S5, db: -12}, {f: 'click.wav', at: S6 - 0.06, db: -14},
    // he vanishes again; his cells pack in -> CLOT
    {f: 'shimmer.wav', at: VANISH - 0.12, db: -18}, {f: 'whir.mp3', at: 11.9, db: -32, to: 1.0}, {f: 'pop.wav', at: T.tight - 0.04, db: -24},
    {f: 'squelch.wav', at: T.clot, db: -11}, {f: 'gasp.wav', at: T.clot + 0.08, db: -24},
    // two-shot: ??? and the plank fall
    {f: 'whoosh.wav', at: S7 - 0.04, db: -28}, {f: 'squeak.wav', at: T.why - 0.08, db: -24}, {f: 'pop.wav', at: T.why - 0.05, db: -23},
    {f: 'whoosh.wav', at: 14.9, db: -26}, {f: 'thud.wav', at: FAINT2 - 0.01, db: -6}, {f: 'twang.mp3', at: FAINT2 + 0.04, db: -26, to: 0.5},
    {f: 'crowd_laugh.wav', at: FAINT2 + 0.1, db: -27, to: 1.2}, {f: 'giggle.mp3', at: FAINT2 + 0.3, db: -33, to: 0.6},
    ...ctaCues(T.cta),
    // the frog yawns, falls asleep, the blood hides
    {f: 'whoosh.wav', at: S8 - 0.04, db: -28}, {f: 'shimmer.wav', at: 16.12, db: -26}, {f: 'snore.mp3', at: T.asleep, db: -30, to: 0.7},
    // he vanishes in his sleep; the toucan BONKs into him again
    {f: 'whoosh.wav', at: S9 - 0.04, db: -28}, {f: 'snore.mp3', at: S9 + 0.3, db: -28, to: 1.4},
    {f: 'whoosh.wav', at: BIRD2 - 0.32, db: -26}, ...bonk(BIRD2, -11), {f: 'snore.mp3', at: BIRD2 + 0.5, db: -29, to: 1.2},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<GlassScene t={0} uid="s" />}>
        <GlassScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="glassfrog/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const GlassFrogWide: React.FC = () => <WideFit.Provider value={0.72}><GlassFrogVideo /></WideFit.Provider>;
