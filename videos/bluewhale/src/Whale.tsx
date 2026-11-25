// "What if you were as big as a blue whale?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// Frame 0: he high-fives a blue whale that breaches straight up beside him - the same height - while he wades by a tiny beach
// town (a rowboat between them, seagulls). 1.62 s he steps out onto the beach (BOOM), 2.11 the second step CRACKs: an X-ray
// flash shows both leg bones snapping; close-up OUCH; he topples back into the sea (SPLASH, the rowboat flips, the whale
// laughs). Size card: 1.8 M vs 30 M (x17), 70 KG vs 350,000 KG (x5,000 - the bathroom scale bursts). X-RAY: YOUR LEG -
// WEIGHT x5,000 vs BONES x300, the thigh bone cracks. Comedy hit: he lies in traction, both casts hung on a crane rope; the
// smug whale floats under them; TWANG, the casts BONK its head. X-RAY: BLUE WHALE - the sea holds it up (arrows), the water
// drains, on the sand its own weight crushes its ribs, the water comes back. Ending: he floats on his back, a gull on his
// cast, the whale spouts behind him (STAYS IN) - frame 0 is him in the sea again. All drawn in code.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, Key, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd, spring,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky} from './lib/kit';

// voice: tight.mp3 at 0.1 s (scripts/vsplice.py: line 1 at 1.22, the rest at 1.12; word times refined against the loudness,
// src/data/words.json). Last word ends 18.11 s; + ~0.84 s for the loop push.
export const DURATION = 18.95;
export const T = {
  grow: 0.12, big: 0.61, blue: 0.98, whale: 1.23,                                  // "Grow as big as a blue whale,"
  and: 1.79, brk: 2.11, legs: 2.36, every: 2.79, step: 3.00,                       // "and you'd break your legs with every step."
  seventeen: 3.94, times1: 4.61, taller: 4.76, makes: 5.36, five: 5.81, thousand: 6.21, times2: 6.73, heavier: 6.78,
  but: 7.72, bones: 8.34, only: 8.68, three: 8.92, hundred: 9.04, times3: 9.45, stronger: 9.74,
  a: 10.65, blueW: 10.84, gets: 11.28, away: 11.53, because: 12.10, sea: 12.54, holds: 12.72, up: 13.10,
  on: 13.96, beach: 14.12, its: 14.85, weight: 15.32, crushes: 15.50,
  so: 16.69, he: 17.21, stays: 17.33, sea2: 17.87,
  cta: 13.62,
};
// shots (hard cuts)
const S2 = 1.62, S3 = 2.28, S3B = 3.05, S4 = 3.70, S5 = 7.55, S6 = 10.40, S7 = 12.02, S8 = 16.35;
const PUSH = DURATION - LOOP_DUR;
const STEP1 = 1.79, CRACK = 2.11;                                  // the two steps on the sand
const FALL0 = 3.06, SPLOOSH = 3.33;                                // he topples back into the sea
const TAPE0 = 3.94, TAPE1 = 4.9, KG0 = 5.81, KG1 = 6.95, BURST = 7.15;   // size card
const BONE0 = 8.92, BONE1 = 9.9, SNAP2 = 10.05;                    // leg X-ray
const CAST1 = 10.5, CAST2 = 10.62, SPOUT1 = 10.95, TWANG = 11.46, BONK = 11.64;   // traction gag
const DRAIN0 = 13.96, DRAIN1 = 14.4, PRESS = 15.3, CRUSH = 15.5, REFILL0 = 15.82, REFILL1 = 16.1;   // whale X-ray
const GULL_LAND = 16.95, SPOUT2 = 17.3;

const GOLD = '#FFD43B', RED = '#E2453C', BLUE = '#3D8FD6', FACE_C = '#F1EFEA';
const SEA = '#8CCFE8', SEA_DK = '#6DB8D8', SEA_FAR = '#BFE6F4', FOAM = '#FFFFFF';
const SAND = '#F2DEA8', SAND_DK = '#DEC585', SAND_WET = '#E2C98F';
const WH = '#7096C4', WH_DK = '#55779F', WH_LT = '#9DBBDD', WH_BELLY = '#CFE0F1', WH_SPOT = '#8FB0D6';
const HILL = '#B9D99A', HILL_DK = '#9CC47E';
const BONE_C = '#F4F1E6', XNAVY = '#1C2C4C';

type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P2, b: P2): P2 => [a[0] - b[0], a[1] - b[1]];
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const rot2 = (p: P2, deg: number): P2 => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const fmt = (n: number) => Math.round(n).toLocaleString('en-US');
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.26) * (1 - seg(t, a + d, a + d + 0.12));
const inS = (t: number, a: number, b: number) => (t >= a && t < b ? 1 : 0);

// ---------- stickers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;

// ---------- the guy: front view on a small IK rig, hip at (0, 0), rotated as a whole ----------
const ik = (A: P2, F: P2, L1: number, L2: number, bend: number): P2 => {
  const dx = F[0] - A[0], dy = F[1] - A[1], D = Math.hypot(dx, dy) || 1;
  const d = Math.min(D, L1 + L2 - 0.01);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / D, uy = dy / D;
  return [A[0] + ux * a - uy * h * bend, A[1] + uy * a + ux * h * bend];
};
const quadD = (S: P2, E: P2, H: P2) => { const C: P2 = [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2]; return `M ${P(S)} Q ${P(C)} ${P(H)}`; };
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; hand?: boolean}> = ({S, H, L, sd, w = 29, hand = true}) => {
  const d = quadD(S, ik(S, H, L, L, sd), H);
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

type Mood = 'joy' | 'happy' | 'focus' | 'oof' | 'cry' | 'pop' | 'worry' | 'content' | 'grin';
type GS = {x: number; y: number; rot: number; tilt: number; mood: Mood; armA: P2; armB: P2; footA: P2; footB: P2; look: P2;
  xray: number; crack: number; cast: number; castB: number; tears: number; sq: number; trem: number; show: number};
const SHX = 38, SH_Y = -90, NECK = -165, LEG = 40, SOLE = 86;
const BASE: GS = {x: 0, y: 0, rot: 0, tilt: 0, mood: 'happy', armA: [-58, 60], armB: [58, 60], footA: [-26, 70], footB: [26, 70], look: [0, 0],
  xray: 0, crack: 0, cast: 0, castB: 0, tears: 0, sq: 0, trem: 0, show: 1};
const LEG_S = (sd: number): P2 => [sd * 19, 4];
const toWorld = (g: GS, p: P2): P2 => add([g.x, g.y], rot2(p, g.rot));
const headWorld = (g: GS): P2 => toWorld(g, [0, NECK]);

const Head: React.FC<{t: number; g: GS}> = ({t, g}) => {
  const m = g.mood, look = g.look;
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (m === 'joy' || m === 'happy' || m === 'grin') return <path key={sd} d={`M ${ex - 12} ${ey + 4} Q ${ex} ${ey - 11} ${ex + 12} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (m === 'content') return <path key={sd} d={`M ${ex - 12} ${ey - 2} Q ${ex} ${ey + 8} ${ex + 12} ${ey - 2}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (m === 'oof' || m === 'cry') return <path key={sd} d={`M ${ex + 11 * sd} ${ey - 9} L ${ex - 8 * sd} ${ey} L ${ex + 11 * sd} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    const big = m === 'pop' ? 1.3 : m === 'worry' ? 1.1 : 1;
    const rx = 12 * big, ry = 15 * big;
    const lid = m === 'focus' ? 0.34 : 0;
    const px = ex + look[0] * 4.5, py = ey + look[1] * 5;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={px} cy={py + lid * 6} r={m === 'pop' ? 5 : 6.3} fill={INK} />
        <circle cx={px - 1.5} cy={py - 2 + lid * 6} r={2} fill="#fff" />
        {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      </g>
    );
  };
  const brow = (sd: number) => {
    let d = `M ${sd * 12} -44 Q ${sd * 24} -52 ${sd * 37} -46`;
    if (m === 'focus') d = `M ${sd * 10} -34 L ${sd * 37} -42`;
    else if (m === 'oof') d = `M ${sd * 8} -32 L ${sd * 36} -44`;
    else if (m === 'cry' || m === 'worry') d = `M ${sd * 10} -48 L ${sd * 36} -37`;
    else if (m === 'pop') d = `M ${sd * 12} -56 Q ${sd * 25} -66 ${sd * 38} -58`;
    else if (m === 'content') d = `M ${sd * 12} -42 Q ${sd * 24} -47 ${sd * 37} -43`;
    return <path key={'b' + sd} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  let mouth: React.ReactNode;
  if (m === 'joy') mouth = <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /><path d="M -25 -3 Q 0 -7 25 -3 L 23 4 Q 0 1 -23 4 Z" fill="#fff" /></g>;
  else if (m === 'happy') mouth = <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  else if (m === 'grin') mouth = <g><path d="M -28 0 Q 0 6 28 0 Q 24 22 0 24 Q -24 22 -28 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><path d="M -26 8 Q 0 13 26 8" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (m === 'content') mouth = <path d="M -16 6 Q 0 18 16 6" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (m === 'focus') mouth = <path d="M -15 9 Q 0 6 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (m === 'oof') mouth = <g><path d="M -31 2 Q -16 -6 0 0 Q 16 -6 31 2 L 29 18 Q 14 26 0 20 Q -14 26 -29 18 Z" fill="#FFFFFF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <path d="M -30 10 Q -15 4 0 10 Q 15 4 30 10 M -18 0 V 22 M -6 2 V 21 M 6 2 V 21 M 18 0 V 22" stroke={INK} strokeWidth={3} fill="none" /></g>;
  else if (m === 'cry') mouth = <g><path d={`M -27 -2 Q 0 -9 27 -2 L 19 ${27 + 2 * Math.sin(t * 24)} Q 0 ${33 + 2 * Math.sin(t * 24)} -19 ${27 + 2 * Math.sin(t * 24)} Z`} fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    <ellipse cx={0} cy={23} rx={11} ry={5} fill="#E4677A" /></g>;
  else if (m === 'pop') mouth = <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;
  else mouth = <path d="M -18 10 q 6 -6 12 0 t 12 0 t 12 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  // tears: streams squirting sideways out of squeezed eyes (cry), plus drops
  const tears = g.tears > 0.01 ? [-1, 1].map((sd) => (
    <g key={'t' + sd} opacity={clamp(g.tears * 2)}>
      {[0, 1, 2, 3].map((i) => {
        const ph = (t * 2.6 + i / 4) % 1, x = sd * (34 + ph * 70 * g.tears), y = -10 + ph * ph * 90 - 18 * ph;
        return <path key={i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${(0.5 * (1 - ph * 0.4)).toFixed(3)})`} d="M 0 -22 C 8 -8 14 0 14 7 A 14 14 0 0 1 -14 7 C -14 0 -8 -8 0 -22 Z" fill="#8ED3FF" stroke={INK} strokeWidth={5} />;
      })}
    </g>
  )) : null;
  return (
    <g transform={`scale(${(1 + 0.08 * g.sq).toFixed(3)} ${(1 - 0.1 * g.sq).toFixed(3)})`}>
      <circle r={HEAD_R + 1} fill="url(#wFace)" stroke={INK} strokeWidth={6.5} />
      {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
      <g transform="translate(0 28)">{mouth}</g>
      {tears}
    </g>
  );
};

/** the white plaster casts over his shins and feet */
const Cast: React.FC<{E: P2; H: P2; s: number; sd: number}> = ({E, H, s, sd}) => {
  if (s < 0.01) return null;
  const K = lp2(H, E, 0.12 + 0.88 * s);
  const d = `M ${P(K)} L ${P(H)}`;
  const a = Math.atan2(H[1] - E[1], H[0] - E[0]) * 180 / Math.PI;
  return (
    <g>
      <path d={d} stroke={INK} strokeWidth={48 * s} strokeLinecap="round" fill="none" />
      <path d={d} stroke="#FFFFFF" strokeWidth={36 * s} strokeLinecap="round" fill="none" />
      <g transform={`translate(${P(H)}) rotate(${a - 90}) scale(${s})`}>
        <ellipse cx={0} cy={6} rx={30} ry={19} fill="#FFFFFF" stroke={INK} strokeWidth={6} />
        {[-12, 0, 12].map((x) => <circle key={x} cx={x} cy={20} r={5.5} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} />)}
      </g>
      {sd < 0 ? <path transform={`translate(${P(lp2(E, H, 0.5))}) rotate(${a - 90}) scale(${s})`} d="M 0 6 C -10 -4 -10 -12 -4 -12 C -1 -12 0 -9 0 -7 C 0 -9 1 -12 4 -12 C 10 -12 10 -4 0 6 Z" fill={RED} stroke={INK} strokeWidth={2.5} />
        : <path transform={`translate(${P(lp2(E, H, 0.45))}) rotate(${a - 90}) scale(${s})`} d="M -9 -4 q 9 -8 18 0 M -7 6 q 7 5 14 0" stroke="#3E5BA8" strokeWidth={3} fill="none" strokeLinecap="round" />}
    </g>
  );
};

const Guy: React.FC<{t: number; g: GS}> = ({t, g}) => {
  if (g.show < 0.5) return null;
  const SA: P2 = [-SHX, SH_Y], SB: P2 = [SHX, SH_Y];
  const jig = g.trem * 2.2 * Math.sin(t * 71);
  const legs = [g.footA, g.footB].map((f, i) => { const sd = i ? -1 : 1, S = LEG_S(i ? 1 : -1); return {S, H: f, E: ik(S, f, LEG, LEG, sd), sd}; });
  return (
    <W><g transform={`translate(${(g.x + jig).toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)})`}>
      {legs.map((l, i) => <Limb key={'l' + i} S={l.S} H={l.H} L={LEG} sd={l.sd} w={30} hand={false} />)}
      {legs.map((l, i) => <ellipse key={'f' + i} cx={l.H[0] + (i ? 2 : -2)} cy={l.H[1] + 5} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />)}
      {g.xray > 0.01 ? <g opacity={g.xray}>
        <rect x={-45} y={-14} width={90} height={26} rx={12} fill={XNAVY} />
        {legs.map((l, i) => <g key={'x' + i}>
          <path d={quadD(l.S, l.E, l.H)} stroke={XNAVY} strokeWidth={24} fill="none" strokeLinecap="round" />
          <ellipse cx={l.H[0] + (i ? 2 : -2)} cy={l.H[1] + 5} rx={21} ry={8} fill={XNAVY} />
          <path d={`M ${P(l.S)} L ${P(l.E)} L ${P(l.H)}`} stroke={BONE_C} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {[l.S, l.E, l.H].map((p, j) => <circle key={j} cx={p[0]} cy={p[1]} r={7.5} fill={BONE_C} />)}
          {g.crack > 0.01 ? [lp2(l.S, l.E, 0.5), lp2(l.E, l.H, 0.55)].map((c, j) => (
            <path key={'c' + j} d={`M ${c[0] - 15} ${c[1] - 2} l 6 -8 l 6 12 l 6 -12 l 6 12 l 6 -8`} stroke={RED} strokeWidth={5.5} fill="none" strokeLinejoin="round" strokeLinecap="round" opacity={g.crack} />
          )) : null}
        </g>)}
      </g> : null}
      {legs.map((l, i) => <Cast key={'k' + i} E={l.E} H={l.H} s={i ? g.castB : g.cast} sd={i ? 1 : -1} />)}
      <path d={torsoD(47, -112, 13)} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      <Limb S={SA} H={add(SA, g.armA)} L={77} sd={g.armA[1] > 0 ? 1 : -1} />
      <Limb S={SB} H={add(SB, g.armB)} L={77} sd={g.armB[1] > 0 ? -1 : 1} />
      <g transform={`translate(0 ${NECK}) rotate(${(-g.rot + g.tilt + g.trem * 1.6 * Math.sin(t * 53)).toFixed(2)})`}><Head t={t} g={g} /></g>
    </g></W>
  );
};

// ---------- the blue whale (side view, facing right, origin mid-body, ~340 long with the flukes) ----------
type WMood = 'smug' | 'happy' | 'laugh' | 'annoyed' | 'dizzy' | 'pop';
type WS = {x: number; y: number; rot: number; s: number; dir: 1 | -1; mood: WMood; fin: number; mouth: number; sq: number; show: number};
const WBODY = 'M 150 -6 C 150 -28 136 -46 108 -53 C 84 -59 40 -59 0 -56 C -50 -52 -100 -37 -128 -21 C -138 -15 -144 -10 -148 -5 L -148 5 ' +
  'C -128 15 -100 28 -60 40 C -20 52 30 60 76 58 C 118 55 146 38 150 8 Z';
const WFLUKE = 'M -142 -6 C -156 -16 -172 -34 -198 -56 C -191 -31 -182 -12 -172 0 C -182 12 -191 31 -198 56 C -172 34 -156 16 -142 6 Z';
const WFIN = 'M 72 36 C 66 64 48 92 22 104 C 30 82 42 58 46 38 Z';
const WEYE: P2 = [86, -12], WBLOW: P2 = [100, -52], WFIN0: P2 = [59, 37];
const whalePt = (S: WS, p: P2): P2 => add([S.x, S.y], rot2([p[0] * S.s * S.dir, p[1] * S.s], S.rot));
const Whale: React.FC<{t: number; S: WS; uid: string}> = ({t, S, uid}) => {
  if (S.show < 0.5) return null;
  const laugh = S.mood === 'laugh';
  const m = clamp(S.mouth + (laugh ? 0.55 + 0.25 * Math.sin(t * 28) : 0), 0, 1.2);
  const [ex, ey] = WEYE;
  let eye: React.ReactNode;
  if (laugh || S.mood === 'happy') eye = <path d={`M ${ex - 13} ${ey + 4} Q ${ex} ${ey - 12} ${ex + 13} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (S.mood === 'dizzy') eye = <path d={`M ${ex} ${ey} m -2 0 a 3 3 0 1 1 4 2 a 6 6 0 1 1 -8 -5 a 10 10 0 1 1 13 9`} transform={`rotate(${t * 700} ${ex} ${ey})`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
  else {
    const big = S.mood === 'pop' ? 1.2 : 1, lid = S.mood === 'smug' ? 0.42 : S.mood === 'annoyed' ? 0.5 : 0;
    eye = <g>
      <ellipse cx={ex} cy={ey} rx={12 * big} ry={13.5 * big} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + 2} cy={ey + 1.5 + lid * 5} r={5.8} fill={INK} />
      <circle cx={ex + 0.2} cy={ey - 0.8 + lid * 5} r={2} fill="#fff" />
      {lid ? <path d={lidPath(ex, ey, 12.5, 14, lid)} fill={WH_DK} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      {S.mood === 'smug' ? <path d={`M ${ex - 15} ${ey - 22} Q ${ex} ${ey - 28} ${ex + 15} ${ey - 20}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
        : S.mood === 'annoyed' ? <path d={`M ${ex - 15} ${ey - 19} L ${ex + 15} ${ey - 24}`} stroke={INK} strokeWidth={4.5} strokeLinecap="round" />
        : S.mood === 'pop' ? <path d={`M ${ex - 15} ${ey - 26} Q ${ex} ${ey - 34} ${ex + 15} ${ey - 26}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" /> : null}
    </g>;
  }
  const sway = 6 * Math.sin(t * 2 * Math.PI * 0.9);
  return (
    <W><g transform={`translate(${S.x.toFixed(1)} ${S.y.toFixed(1)}) rotate(${S.rot.toFixed(2)}) scale(${(S.s * S.dir).toFixed(3)} ${(S.s * (1 - 0.22 * S.sq)).toFixed(3)})`}>
      <defs><clipPath id={`wb${uid}`}><path d={WBODY} /></clipPath></defs>
      <g transform={`rotate(${sway.toFixed(2)} -144 0)`}><path d={WFLUKE} fill={WH} stroke={INK} strokeWidth={6.5} strokeLinejoin="round" /></g>
      <path d="M -92 -36 Q -104 -52 -120 -57 Q -112 -43 -114 -30 Z" fill={WH} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
      <path d={WBODY} fill={WH} />
      <g clipPath={`url(#wb${uid})`}>
        <path d="M 170 14 Q 120 30 70 36 Q 0 42 -70 30 Q -120 18 -170 6 L -170 120 L 170 120 Z" fill={WH_BELLY} />
        {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M ${146 - i * 3} ${18 + i * 5} Q 80 ${44 + i * 3} ${4 - i * 14} ${52 + i * 1.2}`} stroke={WH_LT} strokeWidth={3} fill="none" />)}
        {[[30, -44, 10, 5], [-14, -46, 12, 5.5], [-56, -36, 9, 4.5], [8, -30, 6, 3.5], [-34, -24, 9, 4], [60, -36, 7, 3.5], [-90, -22, 7, 3.5], [104, -30, 5, 3]].map(([x, y, rx, ry], i) =>
          <ellipse key={'s' + i} cx={x} cy={y} rx={rx} ry={ry} fill={WH_SPOT} />)}
        <path d="M 120 -40 Q 40 -56 -60 -46" stroke={WH_LT} strokeWidth={8} fill="none" strokeLinecap="round" opacity={0.7} />
        {/* open mouth: a dark wedge under the mouth line */}
        {m > 0.04 ? <path d={`M 152 8 Q 126 14 90 22 Q 118 ${22 + 26 * m} 152 ${10 + 10 * m} Z`} fill="#5A2328" /> : null}
        {m > 0.3 ? <ellipse cx={128} cy={20 + 12 * m} rx={16} ry={5 * m} fill="#E4677A" /> : null}
      </g>
      <path d={WBODY} fill="none" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d="M 151 6 Q 126 14 90 22 q -8 2 -10 -5" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      {m > 0.04 ? <path d={`M 90 22 Q 118 ${22 + 26 * m} 152 ${10 + 10 * m}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /> : null}
      <path d="M 93 -53 q 6 -4 12 0 M 95 -48 q 6 -3 12 0" stroke={INK} strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <circle cx={70} cy={10} r={8} fill="#F0A9B6" opacity={0.45} />
      {eye}
      <g transform={`rotate(${S.fin.toFixed(2)} ${WFIN0[0]} ${WFIN0[1]})`}><path d={WFIN} fill={WH_LT} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" /></g>
    </g></W>
  );
};
/** the spout: a column of white puffs out of the blowhole (u = 0 -> 1 over its life) */
const Spout: React.FC<{x: number; y: number; u: number; h?: number}> = ({x, y, u, h = 95}) => {
  if (u <= 0 || u >= 1) return null;
  const rise = eout(seg(u, 0, 0.35)), fade = 1 - seg(u, 0.55, 1);
  const pts = Array.from({length: 11}, (_, i) => {
    const f = i / 10, yy = y - h * rise * f, r = (5 + 9 * f + 6 * f * f) * fade, xx = x + Math.sin(i * 1.7) * 4 * f + (f > 0.8 ? (i % 2 ? 9 : -9) * f : 0);
    return [xx, yy, r] as [number, number, number];
  });
  return <W><g>
    {pts.map(([xx, yy, r], i) => r > 0.5 ? <circle key={'i' + i} cx={xx} cy={yy} r={r + 4} fill={INK} /> : null)}
    {pts.map(([xx, yy, r], i) => r > 0.5 ? <circle key={'w' + i} cx={xx} cy={yy} r={r} fill="#FFFFFF" /> : null)}
  </g></W>;
};

// ---------- the beach, the sea, the town ----------
const SHORE = 130;
const sandY = (x: number) => x < 40 ? 34 + (40 - x) * 1.3 : x < SHORE ? lerp(34, 0, (x - 40) / (SHORE - 40)) : x < 300 ? lerp(0, -22, (x - SHORE) / 170) : -22;
const SAND_D = (() => {
  const xs = [-400, -200, 0, 40, 85, SHORE, 215, 300, 3000];
  return 'M ' + xs.map((x) => `${x} ${sandY(x).toFixed(1)}`).join(' L ') + ' L 3000 3000 L -400 3000 Z';
})();
const WATER_BODY = (() => {
  const xs = [SHORE, 85, 40, 0, -200, -400];
  return `M -4000 0 L ${SHORE} 0 ` + xs.map((x) => `L ${x} ${sandY(x).toFixed(1)}`).join(' ') + ' L -400 3000 L -4000 3000 Z';
})();
const waveD = (x0: number, x1: number, t: number, amp: number) => {
  const pts: string[] = [];
  for (let x = x0; x <= x1; x += 30) pts.push(`${x} ${(amp * Math.sin(x / 70 + t * 2.2)).toFixed(1)}`);
  return 'M ' + pts.join(' L ');
};
const BackSea: React.FC<{t: number}> = ({t}) => (
  <W><g>
    <path d={`${waveD(-1600, 1600, t, 3)} L 1600 3000 L -1600 3000 Z`} fill={SEA} />
    {Array.from({length: 16}, (_, i) => { const x = -1400 + ((i * 263 + t * 18) % 2800), y = 24 + (i % 4) * 30; return <path key={i} d={`M ${x} ${y} l ${30 + (i % 3) * 14} 0`} stroke="#FFFFFF" strokeOpacity={0.7} strokeWidth={4} strokeLinecap="round" />; })}
  </g></W>
);
const FrontSea: React.FC<{t: number}> = ({t}) => (
  <W><g>
    <defs><clipPath id="wbody"><path d={WATER_BODY} /></clipPath></defs>
    <g clipPath="url(#wbody)">
      <path d={`${waveD(-1600, SHORE + 40, t, 3)} L ${SHORE + 40} 3000 L -1600 3000 Z`} fill={SEA} fillOpacity={0.55} />
      <path d={waveD(-1600, SHORE + 40, t, 3)} stroke={INK} strokeWidth={5} fill="none" strokeLinejoin="round" />
      {Array.from({length: 10}, (_, i) => { const x = -1300 + ((i * 331 + t * 26) % 1500), y = 12 + (i % 3) * 16; return <path key={i} d={`M ${x} ${y} l ${22 + (i % 3) * 12} 0`} stroke="#FFFFFF" strokeOpacity={0.85} strokeWidth={4} strokeLinecap="round" />; })}
    </g>
    {/* foam along the shoreline */}
    <path d={`M ${SHORE - 70} ${(sandY(SHORE - 70)).toFixed(1)} Q ${SHORE - 30} ${-6 + 3 * Math.sin(t * 3)} ${SHORE + 6} ${-1 + 2 * Math.sin(t * 3)}`} stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" opacity={0.9} />
  </g></W>
);
const House: React.FC<{x: number; w: number; h: number; c: string; roof: string; seed: number}> = ({x, w, h, c, roof, seed}) => {
  const y = -22;
  const rows = Math.max(1, Math.round(h / 22)), cols = Math.max(1, Math.round(w / 16));
  return <g>
    <rect x={x - w / 2} y={y - h} width={w} height={h} fill={c} stroke={INK} strokeWidth={3.5} />
    <path d={`M ${x - w / 2 - 4} ${y - h} L ${x} ${y - h - w * 0.42} L ${x + w / 2 + 4} ${y - h} Z`} fill={roof} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    {Array.from({length: rows * cols}, (_, i) => { const r = Math.floor(i / cols), cc = i % cols;
      const wx = x - w / 2 + (cc + 0.5) * (w / cols), wy = y - h + (r + 0.5) * (h / rows);
      if (r === rows - 1 && cc === Math.floor(cols / 2)) return <rect key={i} x={wx - 3} y={wy - 4} width={6} height={h / rows / 2 + 4} fill="#8A5A3B" stroke={INK} strokeWidth={1.8} />;
      return <rect key={i} x={wx - 3} y={wy - 3.5} width={6} height={7} fill={rnd(seed + i) > 0.35 ? '#BFE3F5' : '#FFE79A'} stroke={INK} strokeWidth={1.8} />; })}
  </g>;
};
const Umbrella: React.FC<{x: number; c: string; hop: number}> = ({x, c, hop}) => {
  const y = sandY(x), yy = y - hop;
  return <g>
    <rect x={x - 12} y={y - 2} width={24} height={4} rx={2} fill="#FFFFFF" stroke={INK} strokeWidth={2} />
    <path d={`M ${x} ${yy} L ${x} ${yy - 24}`} stroke={INK} strokeWidth={2.6} />
    <path d={`M ${x - 15} ${yy - 22} Q ${x} ${yy - 36} ${x + 15} ${yy - 22} Z`} fill={c} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
    <path d={`M ${x - 5} ${yy - 22} Q ${x} ${yy - 34} ${x} ${yy - 30.5} M ${x + 5} ${yy - 22} Q ${x + 2} ${yy - 32} ${x} ${yy - 30.5}`} stroke="#FFFFFF" strokeWidth={2.5} fill="none" />
  </g>;
};
const Car: React.FC<{x: number; c: string; hop: number}> = ({x, c, hop}) => {
  const y = -22 - hop;
  return <g>
    <path d={`M ${x - 21} ${y - 4} L ${x - 21} ${y - 11} Q ${x - 14} ${y - 12} ${x - 10} ${y - 19} L ${x + 8} ${y - 19} Q ${x + 13} ${y - 12} ${x + 21} ${y - 11} L ${x + 21} ${y - 4} Z`} fill={c} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
    <path d={`M ${x - 8} ${y - 17} L ${x + 6} ${y - 17} L ${x + 9} ${y - 12} L ${x - 11} ${y - 12} Z`} fill="#BFE3F5" stroke={INK} strokeWidth={1.8} />
    {[-12, 12].map((dx) => <circle key={dx} cx={x + dx} cy={y - 3} r={4} fill="#3A3A3A" stroke={INK} strokeWidth={1.6} />)}
  </g>;
};
const Lighthouse: React.FC<{x: number}> = ({x}) => (
  <g>
    <path d={`M ${x - 46} 8 Q ${x - 40} -26 ${x - 6} -30 Q ${x + 30} -28 ${x + 48} 8 Z`} fill="#A3AEB8" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d={`M ${x - 15} -28 L ${x - 10} -170 L ${x + 10} -170 L ${x + 15} -28 Z`} fill="#FFFFFF" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {[0, 1, 2].map((i) => <path key={i} d={`M ${x - 14.4 + i * 1.3} ${-48 - i * 44} L ${x - 13.4 + i * 1.3} ${-70 - i * 44} L ${x + 13.4 - i * 1.3} ${-70 - i * 44} L ${x + 14.4 - i * 1.3} ${-48 - i * 44} Z`} fill={RED} />)}
    <path d={`M ${x - 15} -28 L ${x - 10} -170 L ${x + 10} -170 L ${x + 15} -28 Z`} fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={x - 16} y={-176} width={32} height={8} fill="#444" stroke={INK} strokeWidth={3} />
    <rect x={x - 10} y={-196} width={20} height={20} fill="#FFE79A" stroke={INK} strokeWidth={3.5} />
    <path d={`M ${x - 13} -196 L ${x} -210 L ${x + 13} -196 Z`} fill={RED} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
  </g>
);
const Rowboat: React.FC<{x: number; y: number; rot: number; t: number}> = ({x, y, rot, t}) => (
  <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})`}>
    <path d="M -1 -6 L 0 -64" stroke={INK} strokeWidth={4} />
    <path d={`M 2 -62 Q ${20 + 3 * Math.sin(t * 3)} -36 22 -10 L 2 -10 Z`} fill="#FFFFFF" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d={`M -2 -56 Q ${-14 + 2 * Math.sin(t * 3)} -34 -16 -12 L -2 -12 Z`} fill="#FFD9A8" stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -30 -8 L 30 -8 Q 24 8 0 9 Q -24 8 -30 -8 Z" fill="#C0603A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -27 -3 L 27 -3" stroke="#FFFFFF" strokeWidth={2.5} />
  </g></W>
);
const Gull: React.FC<{x: number; y: number; t: number; s?: number; sit?: boolean}> = ({x, y, t, s = 1, sit}) => {
  if (sit) return <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`}>
    <ellipse cx={0} cy={0} rx={9} ry={6} fill="#FFFFFF" stroke={INK} strokeWidth={2.4} />
    <circle cx={8} cy={-6} r={4.5} fill="#FFFFFF" stroke={INK} strokeWidth={2.4} />
    <path d="M 12 -6 L 17 -4.5 L 12 -3.5 Z" fill={GOLD} stroke={INK} strokeWidth={1.2} />
    <circle cx={9} cy={-7} r={1.1} fill={INK} />
    <path d="M -6 -2 Q -2 -6 5 -2" fill="#9AA6B2" stroke={INK} strokeWidth={1.6} />
    <path d="M -2 6 L -2 10 M 3 6 L 3 10" stroke={GOLD} strokeWidth={1.8} />
  </g></W>;
  const f = Math.sin(t * 2 * Math.PI * 3.2);
  return <W><g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s})`}>
    <path d={`M -14 ${-4 - 6 * f} Q -7 ${-9 - 4 * f} 0 0 Q 7 ${-9 - 4 * f} 14 ${-4 - 6 * f}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={`M -14 ${-4 - 6 * f} Q -7 ${-9 - 4 * f} 0 0 Q 7 ${-9 - 4 * f} 14 ${-4 - 6 * f}`} stroke="#FFFFFF" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </g></W>;
};
const Beach: React.FC<{t: number; hop: number; hop2: number}> = ({t, hop, hop2}) => (
  <W><g>
    <path d={SAND_D} fill={SAND} />
    <path d={`M ${SHORE - 70} ${sandY(SHORE - 70).toFixed(1)} L ${SHORE} 0 L ${SHORE + 36} ${sandY(SHORE + 36).toFixed(1)} L ${SHORE + 36} 3000 L ${SHORE - 400} 3000 Z`} fill={SAND_WET} />
    <path d={'M ' + [SHORE - 70, SHORE, 215, 300, 3000].map((x) => `${x} ${sandY(x).toFixed(1)}`).join(' L ')} stroke={INK} strokeWidth={5} fill="none" strokeLinejoin="round" />
    {[[175, 8], [255, 5], [340, 9], [420, 6]].map(([x, r], i) => <path key={i} d={`M ${x - r} ${sandY(x) + 10} q ${r} -5 ${r * 2} 0`} stroke={SAND_DK} strokeWidth={3} fill="none" strokeLinecap="round" />)}
    {/* the promenade and the town */}
    <rect x={300} y={-22} width={2700} height={8} fill="#D9D2C6" stroke={INK} strokeWidth={3} />
    <House x={350} w={34} h={30} c="#FFB7A1" roof="#C9583C" seed={1} />
    <House x={392} w={30} h={44} c="#FFF1B5" roof="#5C8FD1" seed={2} />
    <House x={432} w={38} h={26} c="#C9E8B9" roof="#C9583C" seed={3} />
    <House x={476} w={28} h={52} c="#BFD9F5" roof="#7A5DB0" seed={4} />
    <House x={516} w={36} h={34} c="#FFD2E6" roof="#5C8FD1" seed={5} />
    <House x={560} w={32} h={46} c="#FFE0A8" roof="#C9583C" seed={6} />
    <Car x={372} c="#E2453C" hop={hop} />
    <Car x={455} c="#3D8FD6" hop={hop2} />
    <Umbrella x={196} c="#E2453C" hop={hop} />
    <Umbrella x={262} c="#3D8FD6" hop={hop2} />
    <Umbrella x={232} c={GOLD} hop={hop * 0.6} />
  </g></W>
);
/** far layer: the sea to the horizon, a green coast with hills on the right, a few doodle clouds */
const Far: React.FC<{t: number}> = ({t}) => (
  <W><g>
    <rect x={-6000} y={-30} width={12000} height={4000} fill={SEA_FAR} />
    <path d="M 160 -30 Q 260 -120 420 -96 Q 560 -170 760 -110 Q 900 -150 1100 -90 L 1500 -60 L 1500 -30 Z" fill={HILL} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 300 -30 Q 420 -70 560 -56 Q 700 -90 860 -50 L 900 -30 Z" fill={HILL_DK} />
    {[[-520, -420, 1.1], [-120, -520, 0.8], [380, -460, 1.0], [820, -380, 0.9]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x + 10 * Math.sin(t * 0.3 + i)} ${y}) scale(${s})`}>
        {[[-40, 6, 26], [-10, -8, 34], [26, 2, 28], [52, 10, 18]].map(([cx, cy, r], j) => <circle key={'i' + j} cx={cx} cy={cy} r={r + 4} fill={INK} />)}
        {[[-40, 6, 26], [-10, -8, 34], [26, 2, 28], [52, 10, 18]].map(([cx, cy, r], j) => <circle key={'w' + j} cx={cx} cy={cy} r={r} fill="#FFFFFF" />)}
      </g>
    ))}
  </g></W>
);

/** a water splash at (x, 0): a crown of drops that rises and falls, plus flying drops (t0 = impact) */
const SPL = '#EAF8FF';
const Splash: React.FC<{t: number; t0: number; x: number; s: number; seed: number; y?: number}> = ({t, t0, x, s, seed, y = 0}) => {
  const u = t - t0;
  if (u < 0 || u > 1.15) return null;
  const rise = Math.sin(Math.PI * clamp(u / 0.85));
  const cols = Array.from({length: 7}, (_, i) => {
    const f = (i - 3) / 3, hgt = s * (55 + 85 * (1 - Math.abs(f)) + 30 * rnd(seed + i)) * rise;
    const bx = x + f * s * 58 * (1 + 0.6 * u), w = s * (18 - 5 * Math.abs(f)), lean = f * 34 * s * (0.4 + u);
    return {bx, w, hgt, lean};
  });
  const colD = cols.map(({bx, w, hgt, lean}) => hgt > 3 ? `M ${bx - w} ${y + 4} C ${bx - w * 0.8 + lean * 0.3} ${y - hgt * 0.5} ${bx - w * 0.5 + lean} ${y - hgt * 0.86} ${bx + lean} ${y - hgt} ` +
    `C ${bx + w * 0.5 + lean} ${y - hgt * 0.86} ${bx + w * 0.8 + lean * 0.3} ${y - hgt * 0.5} ${bx + w} ${y + 4} Z` : '').join(' ');
  const mw = s * 95 * (1 + 0.4 * u);
  const mound = rise > 0.05 ? `M ${x - mw} ${y + 4} Q ${x - mw * 0.5} ${y - s * 30 * rise} ${x} ${y - s * 42 * rise} Q ${x + mw * 0.5} ${y - s * 30 * rise} ${x + mw} ${y + 4} Z` : '';
  const all = colD + ' ' + mound;
  const tips = cols.map(({bx, w, hgt, lean}, i) => { const r = w * 0.7 * rise; return r > 1.2 && hgt > 10 ? <circle key={'d' + i} cx={bx + lean * 1.2} cy={y - hgt - r - 16 * s * u} r={r} fill={SPL} stroke={INK} strokeWidth={3.5} /> : null; });
  const drops = Array.from({length: 12}, (_, i) => {
    const a = -Math.PI / 2 + (rnd(seed * 3 + i) - 0.5) * 2.3, v = s * (240 + 220 * rnd(seed * 7 + i));
    const dx = Math.cos(a) * v * u, dy = Math.sin(a) * v * u + 520 * u * u;
    const r = s * (6 + 7 * rnd(seed * 11 + i)) * (1 - seg(u, 0.75, 1.15));
    return r > 0.6 && dy < 20 ? <circle key={i} cx={x + dx} cy={y + dy} r={r} fill={SPL} stroke={INK} strokeWidth={3} /> : null;
  });
  const ring = 1 - seg(u, 0.4, 1.05);
  return <W><g>
    {all.trim() ? <><path d={all} fill={INK} stroke={INK} strokeWidth={9} strokeLinejoin="round" /><path d={all} fill={SPL} /></> : null}
    {tips}
    {ring > 0.01 ? <ellipse cx={x} cy={y + 3} rx={s * (70 + 90 * u)} ry={s * (8 + 6 * u)} fill="none" stroke="#FFFFFF" strokeWidth={7 * ring} /> : null}
    {drops}
  </g></W>;
};
/** sand kicked up by a footstep */
const Dust: React.FC<{t: number; t0: number; x: number; y: number; s?: number}> = ({t, t0, x, y, s = 1}) => {
  const u = t - t0;
  if (u < 0 || u > 0.7) return null;
  return <W><g>
    {Array.from({length: 7}, (_, i) => {
      const sd = i % 2 ? 1 : -1, k = 0.5 + rnd(i * 3.3) * 0.8;
      const px = x + sd * (14 + 70 * k * eout(u / 0.7)) * s, py = y - (6 + 30 * k * Math.sin(Math.PI * Math.min(1, u / 0.6))) * s;
      const r = (6 + 7 * k) * s * (1 - u / 0.7);
      return <circle key={i} cx={px} cy={py} r={r} fill="#F3E5BF" stroke={INK} strokeWidth={2.5} />;
    })}
  </g></W>;
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

/** size card: 1.8 M him vs 30 M him on bathroom scales; the tape draws itself, the KG counter races, the scale bursts */
const SizeCard: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const tape = eio(seg(t, TAPE0, TAPE1)), kg = seg(t, KG0, KG1), burst = t >= BURST;
  const SC = 1.95, GROUND = 930, SCALE_H = 46;
  const bigSole = burst ? GROUND - 6 : GROUND - SCALE_H;
  const big: GS = {...BASE, mood: t < BURST ? (t > KG0 + 0.4 ? 'worry' : 'grin') : 'pop', look: t > KG0 && t < BURST ? [0, 1] : [0, 0], armA: [-60, 58], armB: [60, 58],
    sq: hit(t, BURST, 0.6, 8), trem: t > KG0 + 0.3 && t < BURST ? 0.6 : 0};
  const tiny: GS = {...BASE, mood: 'happy', armB: [40 + 10 * Math.sin(t * 14), -110]};
  const kgVal = 70 * Math.pow(5000, kg);
  const topY = bigSole - 305 * SC;
  const plate = burst ? eout(seg(t, BURST, BURST + 0.5)) : 0;
  return (
    <div style={{position: 'absolute', left: 540, top: 1010, transform: `translate(-50%,-50%) rotate(-1.2deg) scale(${s})`}}>
      <svg width={960} height={1150} viewBox="0 0 960 1150" style={{overflow: 'visible'}}>
        <rect x={8} y={8} width={944} height={1134} rx={36} fill="#FFFDF6" stroke={INK} strokeWidth={10} />
        {Array.from({length: 17}, (_, i) => <path key={i} d={`M 40 ${70 + i * 62} H 920`} stroke="#DCE8F3" strokeWidth={3} />)}
        <path d={`M 40 ${GROUND} H 920`} stroke={INK} strokeWidth={7} strokeLinecap="round" />
        {/* tiny him on a tiny scale */}
        <rect x={176} y={GROUND - 7} width={48} height={7} rx={3} fill="#E8EEF4" stroke={INK} strokeWidth={3} />
        <g transform={`translate(200 ${GROUND - 7 - SOLE * SC / 17}) scale(${SC / 17})`}><Guy t={t} g={tiny} /></g>
        <path d="M 200 830 L 200 868" stroke={INK} strokeWidth={6} strokeLinecap="round" />
        <path d="M 188 856 L 200 872 L 212 856" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x={200} y={812} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>1.8 M</text>
        {/* big him on the big scale */}
        {!burst ? <g>
          <rect x={410} y={GROUND - SCALE_H} width={300} height={SCALE_H} rx={16} fill="#E8EEF4" stroke={INK} strokeWidth={6} />
          <rect x={520} y={GROUND - SCALE_H + 10} width={80} height={26} rx={6} fill="#2B3A2B" />
          <path d={`M 560 ${GROUND - SCALE_H + 32} L ${560 + 22 * Math.sin(kg * 40)} ${GROUND - SCALE_H + 14}`} stroke="#9CFF9C" strokeWidth={4} strokeLinecap="round" />
        </g> : <g>
          <rect x={410} y={GROUND - 12} width={300} height={12} rx={5} fill="#E8EEF4" stroke={INK} strokeWidth={5} />
          <g transform={`translate(${560 + 260 * plate} ${GROUND - 40 - 380 * Math.sin(Math.PI * Math.min(1, plate * 0.9))}) rotate(${300 * plate})`}>
            <rect x={-150} y={-12} width={300} height={24} rx={10} fill="#E8EEF4" stroke={INK} strokeWidth={5} />
          </g>
          {[-1, 1].map((sd) => <path key={sd} transform={`translate(${560 + sd * (90 + 160 * plate)} ${GROUND - 20 - 300 * Math.sin(Math.PI * Math.min(1, plate)) * 0.8}) rotate(${sd * 200 * plate})`}
            d="M -10 20 Q 10 15 -10 10 Q 10 5 -10 0 Q 10 -5 -10 -10 Q 10 -15 -10 -20" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />)}
        </g>}
        <g transform={`translate(560 ${bigSole - SOLE * SC}) scale(${SC})`}><Guy t={t} g={big} /></g>
        {/* the tape measure */}
        <rect x={792} y={lerp(bigSole, topY, tape)} width={34} height={Math.max(0, (bigSole - topY) * tape)} fill={GOLD} stroke={INK} strokeWidth={5} />
        {Array.from({length: 13}, (_, i) => { const y = bigSole - (bigSole - topY) * (i / 12); return y >= lerp(bigSole, topY, tape) - 1 ? <path key={i} d={`M 792 ${y} h ${i % 2 ? 12 : 20}`} stroke={INK} strokeWidth={4} /> : null; })}
        <rect x={780} y={bigSole - 10} width={58} height={22} rx={6} fill="#C9583C" stroke={INK} strokeWidth={5} />
        {tape > 0.98 ? <text x={809} y={topY - 26} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={64} fill={INK}
          transform={`translate(809 ${topY - 26}) scale(${popIn(t, TAPE1 - 0.05, 0.25)}) translate(-809 ${-(topY - 26)})`}>30 M</text> : null}
        {/* weights */}
        {t > T.makes - 0.1 ? <g transform={`translate(200 1018) scale(${popIn(t, T.makes - 0.1, 0.25)})`}>
          <text x={0} y={18} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={50} fill={INK}>70 KG</text>
        </g> : null}
        {t > T.makes ? <g transform={`translate(560 1022) scale(${popIn(t, T.makes, 0.25) * (1 + 0.06 * hit(t, KG1, 1, 6))})`}>
          <text x={0} y={22} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={burst ? 74 : 70} fill={burst ? RED : kg >= 1 ? RED : INK}>
            {burst ? 'ERROR' : `${fmt(Math.round(kgVal / (kgVal > 1000 ? 100 : 1)) * (kgVal > 1000 ? 100 : 1))} KG`}</text>
        </g> : null}
      </svg>
      <Card text="x17 TALLER" top={92} left={320} color={RED} fg="#fff" rot={-5} size={60} s={popIn(t, T.times1 - 0.05, 0.26)} />
      <Card text="x5,000 HEAVIER" top={1150} left={500} color={RED} fg="#fff" rot={3} size={58} s={popIn(t, T.heavier - 0.05, 0.26)} />
    </div>
  );
};

/** X-RAY: YOUR LEG - the thigh bone under a WEIGHT x5,000 arrow; the bone grows only to x300 and cracks */
const LegXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const bones = eout(seg(t, BONE0, BONE1));
  const cracked = t >= SNAP2, cr = eout(seg(t, SNAP2, SNAP2 + 0.18));
  const press = 1 + 0.05 * Math.sin(t * 9) + hit(t, SNAP2, 0.25, 6);
  const w = 58 * (1 + 0.24 * bones), kr = 46 * (1 + 0.1 * bones);
  const arrowY = -206 + 10 * Math.sin(t * 9) + 22 * cr;
  const lower = cracked ? `translate(${16 * cr} ${22 * cr}) rotate(${8 * cr} 0 60)` : '';
  return (
    <div style={{position: 'absolute', left: 540, top: 980, transform: `translate(-50%,-50%) rotate(1.5deg) scale(${s})`}}>
      <XFrame id="legx" R={330}>
        {/* the leg: skin outline */}
        <path d="M -170 -460 C -190 -200 -150 100 -120 260 Q -110 330 -90 460 L 150 460 Q 140 320 130 250 C 150 80 180 -200 170 -460 Z" fill="#7FA7D6" fillOpacity={0.2} stroke="#BFD9F5" strokeWidth={7} />
        {/* the thigh bone: a classic cartoon bone, knobs at both ends */}
        {(() => {
          const top = (<g>
            <circle cx={-kr * 0.78} cy={-110} r={kr} fill={BONE_C} /><circle cx={kr * 0.78} cy={-110} r={kr} fill={BONE_C} />
            <rect x={-w / 2} y={-110} width={w} height={172} fill={BONE_C} />
          </g>);
          const bot = (<g>
            <circle cx={-kr * 0.78} cy={230} r={kr} fill={BONE_C} /><circle cx={kr * 0.78} cy={230} r={kr} fill={BONE_C} />
            <rect x={-w / 2} y={58} width={w} height={172} fill={BONE_C} />
          </g>);
          const outline = (n: React.ReactNode) => <g style={{filter: 'drop-shadow(5px 0 0 #9FC3F0) drop-shadow(-5px 0 0 #9FC3F0) drop-shadow(0 5px 0 #9FC3F0) drop-shadow(0 -5px 0 #9FC3F0)'}}>{n}</g>;
          return <g>
            {outline(top)}
            <g transform={lower}>{outline(bot)}</g>
            {cracked ? <path d={`M ${-w / 2 - 12} 58 l 14 -14 l 13 20 l 14 -20 l 13 20 l 14 -16 l ${w - 52} 10`} stroke={RED} strokeWidth={10} fill="none" strokeLinejoin="round" strokeLinecap="round" /> : null}
          </g>;
        })()}
        {/* the weight pressing down */}
        <g transform={`translate(0 ${arrowY}) scale(${press})`}>
          <path d="M -60 -190 L 60 -190 L 60 -60 L 130 -60 L 0 50 L -130 -60 L -60 -60 Z" fill={RED} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
          <text x={0} y={-14} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={36} fill="#FFFFFF">x5,000</text>
        </g>
        {cracked ? <circle r={330} fill="#FFFFFF" opacity={0.5 * (1 - seg(t, SNAP2, SNAP2 + 0.22))} /> : null}
        <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
      </XFrame>
      <Card text="X-RAY: YOUR LEG" top={112} size={50} />
      <Card text="BREAKS" top={560} left={680} color={RED} fg="#fff" rot={7} size={64} s={popIn(t, SNAP2, 0.24)} />
    </div>
  );
};
/** the versus counter under the leg X-ray: WEIGHT x5,000 vs BONES x1 -> x300 */
const VsCounter: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const v = Math.round(1 + 299 * eout(seg(t, BONE0, BONE1)));
  const box = (label: string, val: string, col: string, sc: number): React.ReactNode => (
    <div style={{background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '4px 26px 10px', textAlign: 'center', minWidth: 300, transform: `scale(${sc})`}}>
      <div style={{fontWeight: 900, fontSize: 40, lineHeight: 1.1}}>{label}</div>
      <div style={{fontWeight: 900, fontSize: 100, lineHeight: 1, color: col}}>{val}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 540, top: 1460, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`, display: 'flex', alignItems: 'center', gap: 22,
      fontFamily: FONT, color: INK, whiteSpace: 'nowrap'}}>
      {box('WEIGHT', 'x5,000', RED, 1 + 0.05 * Math.sin(t * 9))}
      <div style={{fontWeight: 900, fontSize: 56}}>VS</div>
      {box('BONES', `x${v}`, BLUE, 1 + 0.12 * hit(t, BONE1, 1, 6))}
    </div>
  );
};

/** X-RAY: BLUE WHALE - floating, the water holds it up; the water drains, it lies on the sand, its weight crushes its ribs */
const WhaleXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const drain = eio(seg(t, DRAIN0, DRAIN1)) * (1 - eio(seg(t, REFILL0, REFILL1)));
  const crush = eout(seg(t, CRUSH, CRUSH + 0.2)) * (1 - eio(seg(t, REFILL0 + 0.05, REFILL1)));
  const sandTop = lerp(380, 175, drain);
  const waterTop = lerp(-340, 400, drain);
  const SC = 1.72;
  const wy = lerp(0, sandTop - 58 * SC, drain) + 4 * Math.sin(t * 2.4) * (1 - drain);
  const sqy = 1 - 0.3 * crush;
  // the spine: a quadratic from the skull back to the tail
  const sp = (u: number): P2 => { const a: P2 = [56, -30], c: P2 = [-50, -46], b: P2 = [-170, -2]; return [(1 - u) * (1 - u) * a[0] + 2 * u * (1 - u) * c[0] + u * u * b[0], (1 - u) * (1 - u) * a[1] + 2 * u * (1 - u) * c[1] + u * u * b[1]]; };
  const verts = Array.from({length: 26}, (_, i) => { const u = i / 25, p = sp(u), q = sp(Math.min(1, u + 0.02)); const a = Math.atan2(q[1] - p[1], q[0] - p[0]) * 180 / Math.PI;
    const sz = lerp(1.2, 0.6, u); return <rect key={i} x={-4.5 * sz} y={-4 * sz} width={9 * sz} height={8 * sz} rx={2.4} transform={`translate(${P(p)}) rotate(${a})`} fill={BONE_C} />; });
  const ribs = Array.from({length: 11}, (_, i) => { const u = 0.05 + i * 0.036, p = sp(u), len = lerp(82, 48, i / 10);
    return <path key={i} d={`M ${P(p)} Q ${p[0] + 14} ${p[1] + len * 0.6} ${p[0] - 8} ${p[1] + len}`} stroke={BONE_C} strokeWidth={4} fill="none" strokeLinecap="round" />; });
  const ups = drain < 0.3 ? Array.from({length: 7}, (_, i) => {
    const x = -165 + i * 55, u = ((t - S7) * 1.4 + i * 0.13) % 1;
    return <path key={i} transform={`translate(${x} ${wy + 210 - 100 * u}) scale(1.4)`} d="M -16 10 L 0 -8 L 16 10" stroke="#7FE3FF" strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={(1 - drain / 0.3) * Math.sin(Math.PI * u) * seg(t, T.because - 0.1, T.because + 0.2)} />;
  }) : null;
  const downs = t > PRESS - 0.1 && t < REFILL0 + 0.1 ? Array.from({length: 6}, (_, i) => {
    const x = -140 + i * 56, u = ((t - PRESS) * 1.8 + i * 0.17) % 1;
    return <path key={i} transform={`translate(${x} ${wy - 200 + 80 * u}) scale(1.4)`} d="M -16 -10 L 0 8 L 16 -10" stroke={RED} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={Math.sin(Math.PI * u)} />;
  }) : null;
  return (
    <div style={{position: 'absolute', left: 540, top: 1030, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id="whx" R={330}>
        {/* water from waterTop down, sand from sandTop down */}
        <path d={`M -450 ${waterTop} ${Array.from({length: 19}, (_, i) => `L ${-450 + i * 50} ${(waterTop + 6 * Math.sin(i * 0.9 + t * 4)).toFixed(1)}`).join(' ')} L 450 450 L -450 450 Z`} fill="#2F5F9A" fillOpacity={0.55} />
        <path d={`M -450 ${sandTop} Q -200 ${sandTop - 16} 0 ${sandTop} Q 200 ${sandTop + 14} 450 ${sandTop - 6} L 450 450 L -450 450 Z`} fill="#8C7650" stroke="#D9C08A" strokeWidth={5} />
        {ups}
        <g transform={`translate(0 ${wy + 58 * SC * (1 - sqy)}) scale(${SC} ${SC * sqy})`}>
          <path d={WBODY} fill="#7FA7D6" fillOpacity={0.24} stroke="#BFD9F5" strokeWidth={4} />
          <path d={WFLUKE} fill="#7FA7D6" fillOpacity={0.24} stroke="#BFD9F5" strokeWidth={3.5} />
          {/* skull: rostrum, braincase, lower jaw */}
          <path d="M 58 -36 Q 104 -32 148 -8 Q 104 -18 62 -20 Z" fill={BONE_C} />
          <ellipse cx={58} cy={-28} rx={20} ry={14} fill={BONE_C} />
          <path d="M 66 22 Q 112 34 148 8" stroke={BONE_C} strokeWidth={6} fill="none" strokeLinecap="round" />
          {verts}
          <g>{ribs}</g>
          {/* flipper bones */}
          <path d="M 58 34 L 50 56 L 40 76 L 28 96" stroke={BONE_C} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {[[50, 56], [40, 76]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill={BONE_C} />)}
          {/* the eye */}
          {crush > 0.3 ? <path d={`M ${WEYE[0] + 9} ${WEYE[1] - 8} L ${WEYE[0] - 6} ${WEYE[1]} L ${WEYE[0] + 9} ${WEYE[1] + 8}`} stroke="#FFFFFF" strokeWidth={3.5} fill="none" strokeLinecap="round" />
            : <g><circle cx={WEYE[0]} cy={WEYE[1]} r={9} fill="#FFFFFF" /><circle cx={WEYE[0] + 1.5} cy={WEYE[1] + 1.5} r={4.4} fill={INK} />
              {drain < 0.5 ? <path d={lidPath(WEYE[0], WEYE[1], 9.5, 9.5, 0.45)} fill="#7FA7D6" /> : null}</g>}
          {crush > 0.2 ? [-50, -12, 26].map((x, i) => <path key={i} d={`M ${x - 10} ${10} l 5 -6 l 5 8 l 5 -8 l 5 6`} stroke={RED} strokeWidth={3.5} fill="none" opacity={crush} />) : null}
        </g>
        {downs}
        <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
      </XFrame>
      <Card text="X-RAY: BLUE WHALE" top={112} size={50} />
      <Card text="HELD UP" top={760} left={300} color={BLUE} fg="#fff" rot={-5} size={58} s={popIn(t, T.holds - 0.05, 0.26) * (1 - seg(t, DRAIN0 - 0.2, DRAIN0 - 0.05))} />
      <Card text="ON SAND" top={300} left={250} color={GOLD} rot={-6} size={54} s={popIn(t, T.beach - 0.02, 0.26) * (1 - seg(t, PRESS - 0.2, PRESS - 0.05))} />
      <Card text="ITS WEIGHT" top={300} left={660} color="#fff" rot={5} size={54} s={popIn(t, T.weight - 0.06, 0.26) * (1 - seg(t, REFILL0, REFILL0 + 0.15))} />
      <Card text="CRUSHED" top={760} left={600} color={RED} fg="#fff" rot={4} size={62} s={popIn(t, CRUSH, 0.24) * (1 - seg(t, REFILL0, REFILL0 + 0.12))} />
      <Card text="PHEW" top={300} left={260} color="#fff" rot={-6} size={58} s={popIn(t, REFILL0 + 0.06, 0.22)} />
    </div>
  );
};

// ---------- the story over time ----------
/** feet standing on the sand / sea floor at world x positions -> the guy's hip and foot offsets */
const stand = (xa: number, xb: number, liftA = 0, liftB = 0, drop = 0): {x: number; y: number; footA: P2; footB: P2} => {
  const ya = sandY(xa) - 14.5 - liftA, yb = sandY(xb) - 14.5 - liftB;
  const x = (xa + xb) / 2, y = (sandY(xa) + sandY(xb)) / 2 - 84 + drop;
  return {x, y, footA: [xa - x, ya - y], footB: [xb - x, yb - y]};
};
const G1X = 60;
const handA0: P2 = [-22, -246];      // the high five (world): his palm meets the whale's flipper tip
const guyAt = (t: number): GS => {
  if (t < S2) {
    const st = stand(G1X - 26, G1X + 26);
    const g: GS = {...BASE, ...st, mood: t < 1.1 ? 'joy' : 'happy', look: t > 1.15 ? [1, 0] : [0, 0]};
    const sa = toWorld(g, [-SHX, SH_Y]);
    const rel = sub(handA0, sa);
    const back = seg(t, 0.12, 0.6);
    const bounce = spring(t, 0, 10, 4, 7);
    g.armA = lp2([rel[0] - bounce, rel[1] + bounce * 0.6], [-56, 62], eio(back));
    const pump = Math.sin(Math.PI * seg(t, 0.25, 0.95));
    g.armB = lp2([58, 60], [44, -118], pump);
    g.y += -4 * pump;
    g.sq = hit(t, 0, 0.4, 9);
    return g;
  }
  if (t < S3B) {
    let st;
    if (t < STEP1) { const u = eio(seg(t, S2, STEP1)); const xb = lerp(122, 196, u); st = stand(72, xb, 0, 34 * Math.sin(Math.PI * u)); }
    else if (t < CRACK) { const u = eio(seg(t, STEP1, CRACK)); const xa = lerp(72, 150, u); st = stand(xa, 196, 38 * Math.sin(Math.PI * u), 0); }
    else st = stand(150, 196, 0, 0, 16 * eout(seg(t, CRACK, CRACK + 0.1)) + spring(t, CRACK + 0.1, 4, 4, 8));
    const cracked = t >= CRACK;
    const g: GS = {...BASE, ...st, mood: cracked ? (t < 2.62 ? 'oof' : 'cry') : 'focus', look: cracked ? [0, 0] : [1, 0.3],
      armA: cracked ? [-70, 14 + 10 * Math.sin(t * 40)] : [-50, 66], armB: cracked ? [70, 14 - 10 * Math.sin(t * 40)] : [56, 56],
      xray: cracked ? 1 - seg(t, 2.32, 2.5) : 0, crack: cracked ? 1 : 0, trem: cracked ? 1 : 0, tears: t > 2.62 ? seg(t, 2.62, 2.8) : 0,
      sq: hit(t, STEP1, 0.5, 9) + hit(t, CRACK, 1, 7)};
    return g;
  }
  if (t < S6) {
    // topple: rotate about the feet, head first into the sea; then he lies there
    const piv: P2 = [173, sandY(173) - 14];
    const u = seg(t, FALL0, SPLOOSH), r = -96 * u * u;
    const rr = t < SPLOOSH ? r : -96 + spring(t, SPLOOSH, 4, 3, 7);
    const hip = add(piv, rot2([0, -72], rr));
    return {...BASE, x: hip[0], y: hip[1], rot: rr, tilt: rr * 0.6, mood: t < SPLOOSH ? 'pop' : 'cry', tears: t > SPLOOSH + 0.1 ? 1 : 0,
      armA: [-80, -40 - 20 * u], armB: [80, -40 - 20 * u], footA: [-24, 72], footB: [24, 72], crack: 0};
  }
  if (t < S8) {
    // traction: lying in the shallow water, both casts hung on a crane rope; TWANG, they drop on the whale's head
    const drop = eio(seg(t, TWANG, BONK)), after = t >= BONK;
    const fa = lp2([58, 40], [50, 66], drop), fb = lp2([50, 58], [46, 80], drop);
    return {...BASE, x: -80, y: -24 + 2 * Math.sin(t * 2), rot: -90, tilt: -28, mood: t < TWANG ? 'cry' : after ? 'oof' : 'pop', tears: t < TWANG ? 0.8 : 0,
      armA: [-20, 66], armB: [24, 70], footA: [fa[0], fa[1] + (after ? spring(t, BONK, 3, 4, 8) : 0)], footB: fb,
      cast: popIn(t, CAST1, 0.22) * (t >= CAST1 ? 1 : 0), castB: popIn(t, CAST2, 0.22) * (t >= CAST2 ? 1 : 0), sq: hit(t, BONK, 0.4, 8)};
  }
  // the ending: he floats on his back, casts up, content
  return {...BASE, x: -185, y: -44 + 2.5 * Math.sin(t * 2.2), rot: 90, tilt: 26, mood: t > SPOUT2 + 0.25 ? 'joy' : 'content', cast: 1, castB: 1,
    armA: [26, 74], armB: [-30, 74], footA: [-8, 72], footB: [-24, 66]};
};

const WX0 = -112, WY0 = -139;    // the whale at frame 0: breaching straight up beside him
const whaleAt = (t: number): WS => {
  const base: WS = {x: 0, y: 0, rot: 0, s: 1, dir: 1, mood: 'smug', fin: 0, mouth: 0, sq: 0, show: 1};
  if (t < S2) {
    const u = Math.pow(seg(t, 0.14, 0.9), 2);
    return {...base, x: WX0 - 80 * u, y: WY0 + 300 * u, rot: -90 - 55 * u, mood: t < 0.45 ? 'smug' : 'laugh', mouth: 0,
      fin: lerp(-71, -10, eio(seg(t, 0.06, 0.45))) + spring(t, 0, 8, 4, 7), show: t < 1.15 ? 1 : 0};
  }
  if (t < S3B) return {...base, show: 0};
  if (t < S6) return {...base, show: 0};
  if (t < S8) {
    const bonked = t >= BONK;
    return {...base, x: 110, y: 2 + 2 * Math.sin(t * 2.1 + 1), dir: -1, mood: bonked ? 'dizzy' : t > SPOUT1 - 0.1 ? 'smug' : 'happy', sq: hit(t, BONK, 0.7, 7), mouth: bonked ? 0.35 : 0.2};
  }
  return {...base, x: 200, y: -6 + 2 * Math.sin(t * 2), dir: -1, mood: t > SPOUT2 ? 'happy' : 'smug', mouth: 0.2};
};

const camFor = (t: number) => camAt([
  {t: 0, x: -2, y: -165, k: 3.0}, {t: S2 - 0.001, x: 0, y: -166, k: 3.08},                       // frame 0: the high five
  {t: S2, x: 165, y: -122, k: 2.9}, {t: S3 - 0.001, x: 170, y: -120, k: 2.96},                   // the two steps on the sand
  {t: S3, x: 173, y: -226, k: 3.82}, {t: S3B - 0.001, x: 173, y: -224, k: 3.9},                  // close-up: OUCH
  {t: S3B, x: 0, y: -110, k: 2.05}, {t: S4 - 0.001, x: -10, y: -100, k: 2.1},                    // he topples back into the sea
  {t: S4, x: -10, y: -100, k: 2.1}, {t: S6 - 0.001, x: -16, y: -96, k: 2.2},                     // (behind the cards)
  {t: S6, x: -90, y: -90, k: 2.5}, {t: S7 - 0.001, x: -88, y: -88, k: 2.58},                     // traction + BONK
  {t: S7, x: -88, y: -88, k: 2.58}, {t: S8 - 0.001, x: -92, y: -86, k: 2.62},                    // (behind the X-ray)
  {t: S8, x: 46, y: -96, k: 2.62}, {t: PUSH, x: 46, y: -98, k: 2.7},                            // the ending: floating beside the whale
] as Key[], t);

export const WhaleScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string; thumbWhale?: Partial<WS>}> = ({t, camK, thumb, uid = 'm', thumbWhale}) => {
  const c0 = camK ? {x: camK.x, y: camK.y, k: camK.k} : (() => { const c = camFor(t); return {x: c.x, y: c.y, k: 1000 / (1000 - c.z)}; })();
  const sh = shake(t, hit(t, 0, 5, 7) + hit(t, 0.82, 5, 6) + hit(t, STEP1, 9, 7) + hit(t, CRACK, 16, 6) + hit(t, SPLOOSH, 12, 5) + hit(t, BONK, 8, 7));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const g = guyAt(t);
  const W0: WS = thumbWhale ? {x: 0, y: 0, rot: 0, s: 1, dir: 1, mood: 'smug', fin: 0, mouth: 0, sq: 0, show: 1, ...thumbWhale} : whaleAt(t);
  const h = headWorld(g);
  const hop = Math.max(0, 7 * Math.sin(Math.PI * seg(t, STEP1, STEP1 + 0.24)) + 9 * Math.sin(Math.PI * seg(t, CRACK, CRACK + 0.26)));
  const hop2 = Math.max(0, 5 * Math.sin(Math.PI * seg(t, STEP1 + 0.04, STEP1 + 0.26)) + 11 * Math.sin(Math.PI * seg(t, CRACK + 0.03, CRACK + 0.3)));
  // the rowboat between them; it flips when he splashes down
  const boatU = seg(t, SPLOOSH, SPLOOSH + 0.42);
  const boat = t < SPLOOSH ? {x: -6, y: 1.5 * Math.sin(t * 2.5), rot: 4 * Math.sin(t * 2)} :
    t < S4 + 0.4 ? {x: -6 - 110 * boatU, y: -170 * Math.sin(Math.PI * boatU) + (boatU >= 1 ? 2 : 0), rot: 190 * eout(boatU)} : {x: -116, y: 4, rot: 180};
  const showBoat = t < S6;
  const blow = whalePt(W0, WBLOW);
  // inserts
  const sizeS = popIn(t, S4 + 0.02, 0.32) * (1 - seg(t, S5 - 0.14, S5)) * inS(t, S4, S5);
  const legS = popIn(t, S5 + 0.02, 0.32) * (1 - seg(t, S6 - 0.14, S6)) * inS(t, S5, S6);
  const vsS = popIn(t, T.but - 0.05, 0.3) * (1 - seg(t, S6 - 0.14, S6)) * inS(t, S5, S6);
  const whxS = popIn(t, S7 + 0.02, 0.32) * (1 - seg(t, S8 - 0.14, S8)) * inS(t, S7, S8);
  // crane rope in the traction shot
  const ropeTop: P2 = [-34, -640];
  const sling = add(toWorld(g, g.footA), [6, -2]);
  const snapped = t >= TWANG;
  const ropeFly = seg(t, TWANG, TWANG + 0.35);
  // the gull lands on his head in the ending
  const perch = add(h, rot2([6, -HEAD_R - 6], g.tilt));
  const gullS8 = t < GULL_LAND ? lp2([-150, -330], perch, eio(seg(t, S8, GULL_LAND))) : perch;
  const stk = {
    boom: pulse(t, STEP1, 0.18) * inS(t, S2, S3), crack: popIn(t, CRACK, 0.2) * inS(t, CRACK, S3),
    snap: popIn(t, T.legs - 0.02, 0.22) * inS(t, S3, S3B), ouch: popIn(t, T.every - 0.04, 0.24) * inS(t, S3, S3B),
    sploosh: popIn(t, SPLOOSH, 0.22) * inS(t, SPLOOSH, S4),
    twang: pulse(t, TWANG, 0.3) * inS(t, S6, S7), bonk: popIn(t, BONK, 0.2) * inS(t, BONK, S7), easy: pulse(t, SPOUT1 + 0.05, 0.3) * inS(t, S6, S7),
    stays: popIn(t, T.stays - 0.04, 0.26) * (1 - seg(t, PUSH - 0.12, PUSH)) * inS(t, S8, DURATION),
  };
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id="wFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
        <clipPath id="above"><rect x={-4000} y={-4000} width={8000} height={4002} /></clipPath>
      </defs></svg>
      <Layer cam={cam} z={2600}><Far t={t} /></Layer>
      <Layer cam={cam} z={1000} paper={false}><BackSea t={t} /></Layer>
      <Layer cam={cam} z={1000}>
        <Beach t={t} hop={hop} hop2={hop2} />
        {thumb ? null : <W><g><Lighthouse x={-330} /></g></W>}
        {showBoat ? <Rowboat x={boat.x} y={boat.y} rot={boat.rot} t={t} /> : null}
        {(t < S6 || t >= S8) && !(thumbWhale && t >= S2 && t < S3B) ? <Whale t={t} S={W0} uid={uid} /> : null}
        {thumbWhale && t >= S2 && t < S3B ? <Whale t={t} S={W0} uid={uid} /> : null}
        <Guy t={t} g={g} />
        {t >= S6 && t < S8 ? <Whale t={t} S={W0} uid={uid} /> : null}
        {t >= S6 && t < S7 ? <Spout x={blow[0]} y={blow[1]} u={seg(t, SPOUT1, SPOUT1 + 0.9)} h={70} /> : null}
        {t >= S8 ? <Spout x={blow[0]} y={blow[1]} u={seg(t, SPOUT2, SPOUT2 + 1.15)} h={120} /> : null}
        {t >= S6 && t < S7 ? <W><g>
          {!snapped ? <path d={`M ${P(ropeTop)} L ${P(sling)}`} stroke={INK} strokeWidth={4} /> : <>
            <path d={`M ${P(ropeTop)} L ${ropeTop[0] + 6} ${lerp(sling[1], -700, ropeFly)}`} stroke={INK} strokeWidth={4} />
            <path d={`M ${P(sling)} q ${-20 * ropeFly} ${-30 + 20 * ropeFly} ${-10} ${-60 + 50 * ropeFly}`} stroke={INK} strokeWidth={4} fill="none" />
          </>}
          <path d={`M ${sling[0] - 16} ${sling[1] - 6} Q ${sling[0]} ${sling[1] + 10} ${sling[0] + 18} ${sling[1] - 4}`} stroke="#C0603A" strokeWidth={7} fill="none" strokeLinecap="round" />
          {!snapped ? <path d={`M ${sling[0]} ${sling[1] - 18} q 8 -4 4 -12 q -5 -6 -9 0`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
        </g></W> : null}
        {t >= S8 ? <Gull x={gullS8[0]} y={gullS8[1]} t={t} sit={t >= GULL_LAND} /> : null}
      </Layer>
      <Layer cam={cam} z={1000} paper={false}><FrontSea t={t} /></Layer>
      <Layer cam={cam} z={1000}>
        <Splash t={t} t0={-0.16} x={-112} s={0.55} seed={2} y={2} />
        <Splash t={t} t0={0.78} x={-175} s={1.15} seed={5} />
        <Splash t={t} t0={SPLOOSH} x={-40} s={1.3} seed={9} />
        <Splash t={t} t0={BONK + 0.02} x={20} s={0.6} seed={13} y={-2} />
        {thumb ? null : <><Dust t={t} t0={STEP1} x={196} y={sandY(196)} /><Dust t={t} t0={CRACK} x={150} y={sandY(150)} s={1.3} /></>}
        {/* high-five burst at frame 0 */}
        {t < 0.3 ? <W><g transform={`translate(${handA0[0] - 8} ${handA0[1] - 4}) scale(${1 - seg(t, 0, 0.3)})`}>
          {Array.from({length: 8}, (_, i) => { const a = (i / 8) * Math.PI * 2; return <path key={i} d={`M ${Math.cos(a) * 20} ${Math.sin(a) * 20} L ${Math.cos(a) * 44} ${Math.sin(a) * 44}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />; })}
        </g></W> : null}
        {t >= BONK && t < S7 ? [0, 1, 2].map((j) => { const a = t * 6 + (j * 2 * Math.PI) / 3; const c = whalePt(W0, [96, -60]); return <Star key={j} x={c[0] + Math.cos(a) * 40} y={c[1] - 22 + Math.sin(a) * 10} s={0.3} rot={t * 200} />; }) : null}
        {thumb ? null : <>
          <Txt x={262} y={-48} s={stk.boom} text="BOOM" size={42} rot={-6} fill={GOLD} />
          <Txt x={62} y={-70} s={stk.crack} text="CRACK" size={50} rot={-7} fill={RED} />
          <Txt x={h[0] + 62} y={h[1] - 108} s={stk.snap} text="SNAP" size={40} rot={8} fill={RED} />
          <Txt x={h[0] - 66} y={h[1] + 104} s={stk.ouch} text="OUCH" size={40} rot={-8} fill="#FFFFFF" />
          <Txt x={-40} y={-230} s={stk.sploosh} text="SPLOOSH" size={58} rot={-5} fill="#FFFFFF" />
          <Txt x={30} y={-300} s={stk.twang} text="TWANG" size={46} rot={-6} fill={GOLD} />
          <Txt x={44} y={-150} s={stk.bonk} text="BONK" size={52} rot={8} fill={GOLD} />
          <Txt x={24} y={-150} s={stk.easy} text="EASY" size={42} rot={-5} fill="#FFFFFF" />
          <Txt x={30} y={-215} s={stk.stays} text="STAYS IN" size={50} rot={-4} fill={GOLD} />
        </>}
      </Layer>
      {thumb ? null : <>
        <SizeCard t={t} s={sizeS} />
        <LegXRay t={t} s={legS} />
        <VsCounter t={t} s={vsS} />
        <WhaleXRay t={t} s={whxS} />
        <CommentBubble t={t} text="what if you were as big as a blue whale??" handle="@splashy_doodle" likes="3.3K" out={1.4} />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so} until={PUSH - 0.4} text="What would you do as a giant?" />
      </>}
    </AbsoluteFill>
  );
};

export const WhaleVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const bed: Cue[] = Array.from({length: 7}, (_, i) => ({f: 'waves.wav', at: i * 2.7, db: -31}));
  const cues: Cue[] = [
    ...bed, {f: 'seagulls.wav', at: 0.05, db: -26, to: 1.6},
    // frame 0: the high five with the breaching whale
    {f: 'slap.wav', at: 0, db: -6}, {f: 'whoosh.wav', at: 0, db: -15}, {f: 'splash.wav', at: 0.02, db: -18},
    {f: 'whoosh.wav', at: 0.3, db: -24}, {f: 'splash.wav', at: 0.78, db: -13}, {f: 'splash.wav', at: 0.82, db: -18},
    // the two steps: BOOM, CRACK
    {f: 'whoosh.wav', at: S2 - 0.02, db: -30}, {f: 'thud.wav', at: STEP1, db: -9}, {f: 'crack.wav', at: CRACK - 0.32, db: -8}, {f: 'thud.wav', at: CRACK, db: -12},
    {f: 'gasp.wav', at: 2.34, db: -15}, {f: 'whoosh.wav', at: S3 - 0.02, db: -30},
    // he topples into the sea; the boat flips; the whale laughs
    {f: 'slide_down.wav', at: FALL0 - 0.04, db: -20}, {f: 'whoosh.wav', at: FALL0 + 0.05, db: -18}, {f: 'splash.wav', at: SPLOOSH, db: -8}, {f: 'splash.wav', at: SPLOOSH + 0.05, db: -14},
    {f: 'boing.wav', at: SPLOOSH + 0.12, db: -20}, {f: 'crowd_ooh.wav', at: SPLOOSH + 0.05, db: -27, to: 1.0},
    // size card: x17 taller, the KG counter, the scale bursts
    {f: 'page_flip.wav', at: S4 - 0.38, db: -18}, {f: 'pop.wav', at: S4 + 0.04, db: -22}, {f: 'whir.mp3', at: TAPE0, db: -27, to: 0.95},
    {f: 'pop.wav', at: T.times1 - 0.05, db: -20}, {f: 'ding.mp3', at: TAPE1, db: -24}, {f: 'pop.wav', at: T.makes - 0.1, db: -24}, {f: 'pop.wav', at: T.makes, db: -24},
    ...ticks(KG0, KG1, 18, -31), {f: 'pop.wav', at: T.heavier - 0.05, db: -20}, {f: 'strain.mp3', at: KG1 - 0.35, db: -24, to: 0.5},
    {f: 'boing.wav', at: BURST, db: -12}, {f: 'twang.mp3', at: BURST + 0.03, db: -20}, {f: 'crowd_laugh.wav', at: BURST + 0.1, db: -26, to: 1.0},
    // X-RAY: YOUR LEG - weight vs bones, the bone breaks
    {f: 'zap.wav', at: S5 + 0.02, db: -23}, {f: 'pop.wav', at: S5 + 0.06, db: -24}, {f: 'pop.wav', at: T.but - 0.05, db: -24},
    ...ticks(BONE0, BONE1, 12, -31), {f: 'crack.wav', at: SNAP2 - 0.32, db: -9}, {f: 'thud.wav', at: SNAP2, db: -14},
    // traction: the casts pop on, the whale spouts, TWANG, BONK
    {f: 'whoosh.wav', at: S6 - 0.02, db: -30}, {f: 'pop.wav', at: CAST1, db: -18}, {f: 'pop.wav', at: CAST2, db: -18},
    {f: 'whale_song.wav', at: 10.9, db: -22, from: 0.4, to: 1.3}, {f: 'hiss.wav', at: SPOUT1, db: -22, to: 0.7},
    {f: 'twang.mp3', at: TWANG, db: -12}, {f: 'whistle.wav', at: TWANG + 0.02, db: -24, from: 1.0}, {f: 'bonk.wav', at: BONK, db: -7}, {f: 'splash.wav', at: BONK + 0.02, db: -18},
    {f: 'dizzy_birds.wav', at: BONK + 0.08, db: -24, to: 0.9}, {f: 'crowd_laugh.wav', at: BONK + 0.1, db: -21, to: 1.3},
    // X-RAY: BLUE WHALE - held up, drained, crushed, phew
    {f: 'zap.wav', at: S7 + 0.02, db: -23}, {f: 'pop.wav', at: S7 + 0.06, db: -24}, {f: 'bubbles.wav', at: T.because, db: -22}, {f: 'pop.wav', at: T.holds - 0.05, db: -22},
    {f: 'slide_down.wav', at: DRAIN0, db: -22}, {f: 'thud.wav', at: DRAIN1 - 0.02, db: -16}, {f: 'pop.wav', at: T.beach - 0.02, db: -24},
    {f: 'pop.wav', at: T.weight - 0.06, db: -23}, {f: 'crack.wav', at: CRUSH - 0.32, db: -14}, {f: 'squelch.wav', at: CRUSH, db: -16},
    {f: 'splash.wav', at: REFILL0, db: -16}, {f: 'bubbles.wav', at: REFILL0 + 0.05, db: -20}, {f: 'pop.wav', at: REFILL1 - 0.1, db: -24},
    ...ctaCues(T.cta),
    // the ending: he floats, a gull lands, the whale spouts
    {f: 'whoosh.wav', at: S8 - 0.02, db: -30}, {f: 'seagulls.wav', at: S8 + 0.1, db: -25, to: 1.8}, {f: 'pop.wav', at: GULL_LAND, db: -24},
    {f: 'hiss.wav', at: SPOUT2, db: -21, to: 0.9}, {f: 'pop.wav', at: T.stays - 0.04, db: -24},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -25},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<WhaleScene t={0} />}>
        <WhaleScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="bluewhale/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const WhaleWide: React.FC = () => <WideFit.Provider value={0.72}><WhaleVideo /></WideFit.Provider>;
