// "What if you had an octopus's arms?" - owl formula (CLAUDE.md, Growth), niche: animal powers.
// (1) the power is ON HIM at frame 0: eight orange octopus arms, each grabbing something on its own (donut, phone,
// cup, a fish out of the tank) while he panics; (2) the co-star (a smug octopus in its tank) sips tea with ease;
// (3) two circle panels: X-RAY OCTOPUS (2/3 of its brain cells in the arms, pie counter 0 -> 67 % = 2/3) and a SUCKER
// CLOSE-UP (taste cells fire on the trash); (4) a versus counter GRABS ITSELF: OCTOPUS 0 vs HIM 0 -> 8; (5) comedy hit
// from the power itself: his arms grab each other, knot, he tips over BOING + dizzy; (6) a sticker word every ~1.5 s,
// a cut every 2-3 s; (7) ending: he gives every arm a job (= frame 0, all arms busy); (8) comment bubble opener +
// CommentAsk on screen (no either/or ending). Everything is drawn in code (his body too, so the arms can move).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, W, HEAD_R, Star, SoundLayer, Cue, seg, popIn, lerp, eio, eout, rnd, clamp,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Sky} from './lib/kit';

// voice: tight.mp3 at 0.1 s (tighten.py --tempo 1.12; times are video time). Last word ends ~18.25 s; + 0.85 s for the push.
export const DURATION = 19.1;
export const T = {
  arms: 0.96, stop: 2.10, you: 3.10,                                   // "Get an octopus's arms, and they'd stop taking orders from you."
  two: 3.51, thirds: 3.73, brain: 4.94, cells: 5.15, inArms: 6.01,     // "Two thirds of an octopus's brain cells are in its arms."
  each: 6.71, decides: 7.39, own: 8.06,                                // "Each arm decides on its own."
  sucker: 9.23, tastes: 9.65, touches: 10.51,                          // "And every sucker tastes what it touches."
  never: 11.78, grabs: 12.06, itself: 12.42,                           // "An octopus never grabs itself."
  skin: 13.28, stops: 13.78, suckers: 14.28,                           // "Its skin stops the suckers."
  his: 14.94, know: 15.58, that: 15.72,                                // "His arms don't know that."
  so: 16.17, gives: 16.74, every: 17.03, job: 17.74,                   // "So he gives every arm a job."
  cta: 11.05,
};

const GOLD = '#FFD43B', RED = '#E2453C', GREEN = '#7CC36A';
const OCT = '#F2885A', OCT2 = '#D4693D', SUCK = '#FCD9C2';
const GX = -90;                    // guy's feet
const TX = 205;                    // octopus tank centre
const GRAB = 2.38;                 // his arm grabs the cactus
const FALL = 15.75;                // the knot tips him over
const JOBS = 16.55;                // the items pop into his arms

// ---------- helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.22));
type P = {x: number; y: number};

// ---------- a tentacle: tapered bezier from base b to tip, wiggling, suckers on one side ----------
const Tentacle: React.FC<{b: P; tip: P; t: number; ph: number; w0?: number; bend?: number; amp?: number; fill?: string; edge?: number; suck?: boolean; light?: string}> =
  ({b, tip, t, ph, w0 = 16, bend = 0.3, amp = 9, fill = OCT, edge = 5.5, suck = true, light = SUCK}) => {
  const dx = tip.x - b.x, dy = tip.y - b.y, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  const p1 = {x: b.x + dx * 0.3 + nx * bend * L, y: b.y + dy * 0.3 + ny * bend * L};
  const p2 = {x: b.x + dx * 0.72 - nx * bend * 0.45 * L, y: b.y + dy * 0.72 - ny * bend * 0.45 * L};
  const N = 24;
  const pts: P[] = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N, u = 1 - s;
    const w = amp * Math.sin(s * 5.2 - t * 5 + ph) * s;
    pts.push({
      x: u * u * u * b.x + 3 * u * u * s * p1.x + 3 * u * s * s * p2.x + s * s * s * tip.x + nx * w,
      y: u * u * u * b.y + 3 * u * u * s * p1.y + 3 * u * s * s * p2.y + s * s * s * tip.y + ny * w,
    });
  }
  const L1: P[] = [], R1: P[] = [], nn: P[] = [];
  pts.forEach((p, i) => {
    const a = pts[Math.max(0, i - 1)], c = pts[Math.min(N, i + 1)];
    const tx = c.x - a.x, ty = c.y - a.y, l = Math.hypot(tx, ty) || 1;
    const n = {x: -ty / l, y: tx / l}; nn.push(n);
    const w = lerp(w0, 3.5, Math.pow(i / N, 0.85));
    L1.push({x: p.x + n.x * w, y: p.y + n.y * w}); R1.push({x: p.x - n.x * w, y: p.y - n.y * w});
  });
  const f = (q: P) => `${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
  const d = `M ${f(L1[0])} ` + L1.slice(1).map((q) => `L ${f(q)}`).join(' ') + ` A 3.5 3.5 0 0 1 ${f(R1[N])} ` + R1.slice(0, N).reverse().map((q) => `L ${f(q)}`).join(' ') + ' Z';
  const sk: React.ReactNode[] = [];
  if (suck) for (let i = 3; i < N - 2; i += 2) {
    const w = lerp(w0, 3.5, Math.pow(i / N, 0.85));
    sk.push(<circle key={i} cx={pts[i].x - nn[i].x * w * 0.48} cy={pts[i].y - nn[i].y * w * 0.48} r={w * 0.42} fill={light} stroke={INK} strokeWidth={2} />);
  }
  return <g><path d={d} fill={fill} stroke={INK} strokeWidth={edge} strokeLinejoin="round" />{sk}</g>;
};

// ---------- small props ----------
type Item = 'donut' | 'phone' | 'cup' | 'fish' | 'fork' | 'can' | 'book' | 'remote' | 'tea';
const ItemPic: React.FC<{k: Item; x: number; y: number; s?: number; rot?: number}> = ({k, x, y, s = 1, rot = 0}) => {
  if (s < 0.01) return null;
  const st = {stroke: INK, strokeWidth: 4.5, strokeLinejoin: 'round' as const};
  let g: React.ReactNode = null;
  if (k === 'donut') g = <g><circle r={24} fill="#E0A96D" {...st} /><path d="M -21 -6 Q -18 -22 0 -23 Q 18 -22 21 -6 Q 12 4 0 0 Q -12 4 -21 -6 Z" fill="#F59AC0" /><circle r={8} fill="#FBF7EC" {...st} />
    {[[-12, -12], [8, -15], [14, -4]].map(([a, c], i) => <rect key={i} x={a} y={c} width={6} height={3} rx={1.5} fill={i ? '#6FC3F0' : GOLD} />)}</g>;
  if (k === 'phone') g = <g><rect x={-15} y={-26} width={30} height={52} rx={6} fill="#2B2B33" {...st} /><rect x={-10} y={-20} width={20} height={36} rx={2} fill="#7FD0FF" /></g>;
  if (k === 'cup') g = <g><path d="M 14 -8 q 14 0 14 10 q 0 10 -14 10" fill="none" stroke={INK} strokeWidth={5} /><path d="M -16 -16 L 16 -16 L 13 18 Q 0 22 -13 18 Z" fill="#fff" {...st} /><ellipse cx={0} cy={-14} rx={14} ry={3} fill="#7A4B2A" /></g>;
  if (k === 'tea') g = <g><path d="M 13 -4 q 11 0 11 8 q 0 8 -11 8" fill="none" stroke={INK} strokeWidth={4} /><path d="M -15 -10 L 15 -10 Q 14 14 0 16 Q -14 14 -15 -10 Z" fill="#9FD8C8" {...st} /><path d="M -22 18 L 22 18" stroke={INK} strokeWidth={5} strokeLinecap="round" /></g>;
  if (k === 'fish') g = <g><path d="M 18 0 L 32 -12 L 32 12 Z" fill="#F6B73C" {...st} /><ellipse rx={22} ry={13} fill="#FFC94A" {...st} /><circle cx={-10} cy={-3} r={3} fill={INK} /></g>;
  if (k === 'fork') g = <g><path d="M 0 30 L 0 -6" stroke="#9AA3AE" strokeWidth={8} strokeLinecap="round" /><path d="M 0 30 L 0 -6" stroke={INK} strokeWidth={2} opacity={0} />
    <path d="M -10 -28 L -10 -8 Q 0 2 10 -8 L 10 -28 M 0 -28 L 0 -6" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /></g>;
  if (k === 'can') g = <g><path d="M 16 -4 L 38 -20" stroke={INK} strokeWidth={7} strokeLinecap="round" /><path d="M 16 -4 L 38 -20" stroke={GREEN} strokeWidth={3} strokeLinecap="round" />
    <rect x={-18} y={-14} width={36} height={30} rx={6} fill={GREEN} {...st} /><path d="M -10 -14 Q 0 -30 10 -14" fill="none" stroke={INK} strokeWidth={4} /></g>;
  if (k === 'book') g = <g><rect x={-20} y={-15} width={40} height={30} rx={3} fill={RED} {...st} /><path d="M 0 -15 V 15" stroke={INK} strokeWidth={3} /></g>;
  if (k === 'remote') g = <g><rect x={-10} y={-26} width={20} height={52} rx={6} fill="#4A4A55" {...st} /><circle cy={-14} r={4} fill={RED} /><circle cy={0} r={3} fill="#ddd" /><circle cy={10} r={3} fill="#ddd" /></g>;
  return <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>{g}</g>;
};

// ---------- the guy: body drawn in code, eight octopus arms, head with moods ----------
type HeadMood = 'worried' | 'ouch' | 'calm' | 'yuck' | 'dizzy' | 'happy' | 'strain';
const GuyHead: React.FC<{t: number; mood: HeadMood}> = ({t, mood}) => {
  const R = HEAD_R;
  const eye = (sd: number) => {
    const ex = sd * 24, ey = -12;
    if (mood === 'dizzy') return <path key={sd} d={`M ${ex} ${ey} m -2 0 a 3 3 0 1 1 4 2 a 7 7 0 1 1 -9 -6 a 11 11 0 1 1 15 10`} transform={`rotate(${t * 600 * sd} ${ex} ${ey})`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />;
    if (mood === 'ouch' || mood === 'strain' || mood === 'yuck') return <path key={sd} d={`M ${ex + 10 * sd} ${ey - 8} L ${ex - 8 * sd} ${ey} L ${ex + 10 * sd} ${ey + 8}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === 'happy') return <path key={sd} d={`M ${ex - 11} ${ey + 3} Q ${ex} ${ey - 9} ${ex + 11} ${ey + 3}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    const big = mood === 'worried' ? 1.12 : 1;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={12 * big} ry={15 * big} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
        <circle cx={ex + (mood === 'worried' ? 3 * Math.sin(t * 7 + sd) : 0)} cy={ey + 1} r={mood === 'worried' ? 5.5 : 6.5} fill={INK} />
        <circle cx={ex - 1} cy={ey - 3} r={2.2} fill="#fff" />
      </g>
    );
  };
  const brows = mood === 'worried' || mood === 'calm'
    ? [-1, 1].map((sd) => <path key={sd} d={mood === 'worried' ? `M ${sd * 12} -38 L ${sd * 36} -32` : `M ${sd * 14} -40 Q ${sd * 25} -45 ${sd * 36} -40`} stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none" />) : null;
  let mouth: React.ReactNode;
  if (mood === 'worried') mouth = <path d="M -16 8 Q 0 0 16 8" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (mood === 'ouch') mouth = <g><path d="M -22 -2 Q 0 -8 22 -2 Q 18 26 0 28 Q -18 26 -22 -2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={20} rx={9} ry={4} fill="#E4677A" /></g>;
  else if (mood === 'yuck') mouth = <g><path d="M -20 4 Q 0 -4 20 4" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /><path d="M -7 3 Q -8 24 0 26 Q 8 24 7 3 Z" fill="#E4677A" stroke={INK} strokeWidth={4} /></g>;
  else if (mood === 'strain') mouth = <g><rect x={-22} y={-4} width={44} height={14} rx={6} fill="#fff" stroke={INK} strokeWidth={4.5} /><path d="M -11 -4 V 10 M 0 -4 V 10 M 11 -4 V 10" stroke={INK} strokeWidth={3} /></g>;
  else if (mood === 'dizzy') mouth = <path d="M -16 6 q 8 -8 16 0 q 8 8 16 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else mouth = <path d="M -20 0 Q 0 18 20 0" stroke={INK} strokeWidth={5} fill={mood === 'happy' ? '#5A2328' : 'none'} strokeLinecap="round" />;
  const sick = mood === 'yuck';
  return (
    <g>
      <circle r={R + 1} fill={sick ? 'url(#oSick)' : 'url(#oFace)'} stroke={INK} strokeWidth={6.5} />
      {eye(-1)}{eye(1)}{brows}
      <g transform="translate(0 28)">{mouth}</g>
      {mood === 'ouch' || mood === 'strain' ? <path d="M 52 -40 q 8 10 0 18 q -8 -8 0 -18 Z" fill="#9FD3FF" stroke={INK} strokeWidth={3} /> : null}
    </g>
  );
};

const BodyPath = 'M -36 -170 C -46 -150 -48 -100 -44 -62 L -40 -14 Q -40 0 -22 0 Q -6 0 -6 -14 L -4 -50 L 4 -50 L 6 -14 Q 6 0 22 0 Q 40 0 40 -14 L 44 -62 C 48 -100 46 -150 36 -170 Q 0 -184 -36 -170 Z';
const armBase = (i: number): P => { const sd = i < 4 ? -1 : 1, j = i % 4; return {x: sd * (30 - j * 2), y: -164 + j * 15}; };

// where each of his arm tips is, per state (relative to his feet), and what it holds
type ArmState = 'chaos' | 'tug' | 'trash' | 'rest' | 'knot' | 'jobs';
const CHAOS: P[] = [{x: -150, y: -330}, {x: -150, y: -245}, {x: -178, y: -150}, {x: -150, y: -50}, {x: 145, y: -330}, {x: 205, y: -228}, {x: 168, y: -140}, {x: 132, y: -42}];
const JOBSP: P[] = [{x: -140, y: -318}, {x: -172, y: -238}, {x: -182, y: -150}, {x: -142, y: -60}, {x: 140, y: -318}, {x: 188, y: -240}, {x: 182, y: -150}, {x: 140, y: -60}];
const CHAOS_ITEMS: (Item | null)[] = ['donut', null, 'phone', null, 'cup', 'fish', null, 'fork'];
const JOB_ITEMS: Item[] = ['donut', 'can', 'phone', 'book', 'cup', 'fish', 'remote', 'fork'];
const tipFor = (st: ArmState, i: number, t: number): P => {
  const sd = i < 4 ? -1 : 1, j = i % 4;
  const w = (a: number, f: number) => a * Math.sin(t * f + i * 1.7);
  if (st === 'chaos') {
    const c = CHAOS[i];
    let p = {x: c.x + w(22, 4.3), y: c.y + w(20, 3.7) * Math.cos(i)};
    if (i === 1) {   // reaches for the cactus, grabs it, yanks back
      const g = eout(seg(t, 1.9, GRAB)), back = eio(seg(t, GRAB + 0.18, GRAB + 0.45));
      p = {x: lerp(lerp(-140, -186, g), -120, back) + w(6, 5), y: lerp(lerp(-235, -262, g), -300, back)};
    }
    return p;
  }
  if (st === 'tug') return {x: sd * (215 + 14 * Math.sin(t * 13 + j)), y: -230 + j * 48 + w(6, 9)};
  if (st === 'trash' && i === 3) {
    const dive = eio(seg(t, 8.6, 9.0));
    return {x: lerp(-120, -168, dive) + w(4, 8), y: lerp(-60, -40, dive)};
  }
  if (st === 'knot') return {x: sd * (8 + 10 * Math.sin(t * 9 + i)) + (j - 1.5) * 6, y: -150 + j * 18 + 6 * Math.cos(t * 8 + i)};
  if (st === 'jobs') { const c = JOBSP[i]; return {x: c.x + w(5, 2.2), y: c.y + w(5, 1.8)}; }
  // rest: arms curl out to the sides and sway
  return {x: sd * (95 + j * 20) + w(14, 2.6), y: -210 + j * 50 + w(12, 2.1)};
};
const STATES: [number, ArmState][] = [[0, 'chaos'], [3.45, 'rest'], [7.5, 'tug'], [8.45, 'trash'], [10.95, 'rest'], [14.9, 'knot'], [16.15, 'rest'], [16.45, 'jobs']];
const armTip = (i: number, t: number): P => {
  let k = 0;
  for (let n = 0; n < STATES.length; n++) if (t >= STATES[n][0]) k = n;
  const cur = tipFor(STATES[k][1], i, t);
  if (k === 0) return cur;
  const prev = tipFor(STATES[k - 1][1], i, t), u = eio(seg(t, STATES[k][0], STATES[k][0] + 0.28));
  return {x: lerp(prev.x, cur.x, u), y: lerp(prev.y, cur.y, u)};
};

type GuyState = {mood: HeadMood; rot: number; dx: number; fall: number};
const guyAt = (t: number): GuyState => {
  const b: GuyState = {mood: 'worried', rot: 0, dx: 0, fall: 0};
  if (t < GRAB) return {...b, rot: 3 * Math.sin(t * 6)};
  if (t < 3.45) return {...b, mood: 'ouch', rot: -6 * Math.exp(-4 * (t - GRAB)) * Math.cos(14 * (t - GRAB))};
  if (t < 7.5) return {...b, mood: 'worried'};
  if (t < 8.45) return {...b, mood: 'strain', dx: 14 * Math.sin(t * 13), rot: 4 * Math.sin(t * 13)};
  if (t < T.tastes) return {...b, mood: 'worried'};
  if (t < 10.95) return {...b, mood: 'yuck', rot: 2 * Math.sin(t * 20) * Math.exp(-2 * (t - T.tastes))};
  if (t < 14.9) return {...b, mood: 'calm'};
  if (t < FALL) return {...b, mood: 'strain', rot: 3 * Math.sin(t * 18)};
  if (t < 16.15) { const u = seg(t, FALL, FALL + 0.22); return {...b, mood: 'dizzy', fall: eout(u) + 0.06 * Math.exp(-6 * (t - FALL - 0.22)) * Math.sin(20 * (t - FALL)) * (u >= 1 ? 1 : 0)}; }
  if (t < 16.45) return {...b, mood: 'worried', fall: 1 - eio(seg(t, 16.15, 16.45))};
  return {...b, mood: 'happy', rot: 2 * Math.sin(t * 3)};
};

const itemScale = (t: number, i: number) => {
  if (t < 3.45) return CHAOS_ITEMS[i] ? 1 : 0;
  if (t >= JOBS) return popIn(t, JOBS + i * 0.1, 0.28);
  return 0;
};
const GuyRig: React.FC<{t: number; thumb?: boolean}> = ({t}) => {
  const g = guyAt(t);
  const tips = Array.from({length: 8}, (_, i) => armTip(i, t));
  const drawArm = (i: number) => {
    const b = armBase(i), tip = tips[i], sd = i < 4 ? -1 : 1;
    const jobs = t >= JOBS, chaos = t < 3.45;
    const item = jobs ? JOB_ITEMS[i] : chaos ? CHAOS_ITEMS[i] : null;
    return (
      <g key={i}>
        <Tentacle b={b} tip={tip} t={t} ph={i * 1.3} bend={sd * (i % 2 ? 0.28 : -0.22)} amp={t > 14.9 && t < 16.15 ? 3 : 8} />
        {item ? <ItemPic k={item} x={tip.x} y={tip.y - 6} s={itemScale(t, i)} rot={8 * Math.sin(t * 3 + i)} /> : null}
      </g>
    );
  };
  // fall: tips over to his right (rotate about the feet)
  return (
    <W><g transform={`translate(${GX + g.dx} 0) rotate(${g.rot + 82 * g.fall})`}>
      <ellipse cx={0} cy={2} rx={70} ry={10} fill="rgba(72,54,42,0.22)" />
      {[5, 6, 1, 2].map(drawArm)}
      <path d={BodyPath} fill="url(#oBody)" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
      {[0, 3, 4, 7].map(drawArm)}
      {t > 15.25 && t < 16.2 ? <g>
        {[0, 1, 2].map((k) => <ellipse key={k} cx={0} cy={-130 + k * 6} rx={52 - k * 10} ry={26 - k * 4} fill="none" stroke={INK} strokeWidth={15} transform={`rotate(${k * 40 - 30} 0 -125)`} />)}
        {[0, 1, 2].map((k) => <ellipse key={'o' + k} cx={0} cy={-130 + k * 6} rx={52 - k * 10} ry={26 - k * 4} fill="none" stroke={OCT} strokeWidth={8} transform={`rotate(${k * 40 - 30} 0 -125)`} />)}
      </g> : null}
      <g transform="translate(0 -235)"><GuyHead t={t} mood={g.mood} /></g>
    </g></W>
  );
};

// ---------- the octopus in its tank ----------
type OctMood = 'smug' | 'laugh' | 'proud';
const OCT_C = {x: TX, y: -292};
const octTip = (i: number, t: number): P => {
  const sd = i < 4 ? -1 : 1, j = i % 4;
  let p = {x: TX + sd * (30 + j * 30) + 8 * Math.sin(t * 2 + i), y: -150 - j * 4 + 6 * Math.sin(t * 2.4 + i * 2)};
  if (i === 1) p = {x: TX - 95 + 4 * Math.sin(t * 2), y: -262 + 4 * Math.sin(t * 1.7)};                 // the tea cup, always calm
  const each = seg(t, 6.6, 6.85) * (1 - seg(t, 8.3, 8.6));
  if (each > 0) {                                                                                       // every arm busy with its own thing
    if (i === 5) p = {x: lerp(p.x, TX + 100, each), y: lerp(p.y, -250, each)};                          // book
    if (i === 6) p = {x: lerp(p.x, TX + 112 + 14 * Math.sin(t * 9), each), y: lerp(p.y, -340, each)};   // waves
    if (i === 2) p = {x: lerp(p.x, TX - 70 + 10 * Math.sin(t * 7), each), y: lerp(p.y, -160, each)};    // stacks a shell
  }
  // touches its own head twice; suckers spring off
  const touch = (a: number) => Math.sin(Math.PI * seg(t, a, a + 0.7));
  if (i === 3 || i === 4) { const u = touch(T.grabs - 0.15); p = {x: lerp(p.x, TX + (i === 3 ? 26 : -26), u), y: lerp(p.y, -352, u)}; }
  if (i === 0 || i === 7) { const u = touch(T.stops - 0.35); p = {x: lerp(p.x, TX + (i === 0 ? 34 : -34), u), y: lerp(p.y, -372, u)}; }
  return p;
};
const Octopus: React.FC<{t: number; mood: OctMood}> = ({t, mood}) => {
  const laugh = mood === 'laugh';
  const bob = 5 * Math.sin(t * 1.9) + (laugh ? 4 * Math.sin(t * 26) : 0);
  const arms = Array.from({length: 8}, (_, i) => {
    const sd = i < 4 ? -1 : 1, j = i % 4;
    return <Tentacle key={i} b={{x: TX + sd * (14 + j * 8), y: -240 + bob}} tip={octTip(i, t)} t={t} ph={i} w0={13} bend={sd * 0.25} amp={6} />;
  });
  const each = seg(t, 6.6, 6.85) * (1 - seg(t, 8.3, 8.6));
  const eye = (sd: number) => {
    const ex = TX + sd * 26, ey = -300 + bob;
    if (laugh) return <path key={sd} d={`M ${ex - 11} ${ey + 2} Q ${ex} ${ey - 10} ${ex + 11} ${ey + 2}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
    return (
      <g key={sd}>
        <ellipse cx={ex} cy={ey} rx={12} ry={14} fill="#fff" stroke={INK} strokeWidth={4.5} />
        <rect x={ex - 6} y={ey - 1} width={12} height={6} rx={3} fill={INK} />
        {mood === 'smug' ? <path d={`M ${ex - 12} ${ey - 2} A 12 14 0 0 1 ${ex + 12} ${ey - 2} Z`} fill={OCT2} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" /> : null}
        {mood === 'proud' ? <path d={`M ${ex - 13 * sd} ${ey - 22} L ${ex + 10 * sd} ${ey - 26}`} stroke={INK} strokeWidth={4.5} strokeLinecap="round" /> : null}
      </g>
    );
  };
  const no = (a: number) => pulse(t, a, 0.45);
  return (
    <W><g>
      {arms.slice(0, 8)}
      <path d={`M ${TX - 58} ${-238 + bob} C ${TX - 74} ${-330 + bob} ${TX - 50} ${-392 + bob} ${TX} ${-394 + bob} C ${TX + 50} ${-392 + bob} ${TX + 74} ${-330 + bob} ${TX + 58} ${-238 + bob} Q ${TX} ${-222 + bob} ${TX - 58} ${-238 + bob} Z`}
        fill="url(#oOct)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {[[-24, -360], [20, -372], [36, -340], [-40, -334]].map(([a, c], i) => <circle key={i} cx={TX + a} cy={c + bob} r={5 + i % 2 * 2} fill={OCT2} />)}
      {eye(-1)}{eye(1)}
      <path d={laugh ? `M ${TX - 16} ${-272 + bob} Q ${TX} ${-252 + bob} ${TX + 16} ${-272 + bob} Z` : `M ${TX - 12} ${-270 + bob} Q ${TX + 4} ${-262 + bob} ${TX + 16} ${-274 + bob}`}
        stroke={INK} strokeWidth={4.5} fill={laugh ? '#5A2328' : 'none'} strokeLinecap="round" />
      <ItemPic k="tea" x={octTip(1, t).x} y={octTip(1, t).y - 8} rot={-6 + 4 * Math.sin(t * 1.5)} />
      <ItemPic k="book" x={octTip(5, t).x} y={octTip(5, t).y - 10} s={each} rot={-8} />
      <g transform={`translate(${octTip(2, t).x} ${octTip(2, t).y - 12}) scale(${each})`}><path d="M -16 8 Q -18 -14 0 -16 Q 18 -14 16 8 Z" fill="#F7E1C8" stroke={INK} strokeWidth={4} /></g>
      {/* "no" badges where its suckers touch its own skin */}
      {[[TX + 26, -340, no(T.itself - 0.1)], [TX - 26, -340, no(T.itself - 0.05)], [TX + 34, -362, no(T.stops - 0.05)], [TX - 34, -362, no(T.stops)]].map(([x, y, s], k) => s > 0.01 ? (
        <g key={k} transform={`translate(${x} ${y + bob - 22}) scale(${s})`}><circle r={15} fill="#fff" stroke={RED} strokeWidth={6} /><path d="M -10 10 L 10 -10" stroke={RED} strokeWidth={6} /></g>) : null)}
    </g></W>
  );
};

// ---------- the room: wall, shelf + cactus, trash can, tank ----------
const Room: React.FC<{t: number}> = ({t}) => {
  const cx = GX - 196, grabbed = t > GRAB && t < GRAB + 0.4 ? 1 : 0;
  const jig = grabbed * 6 * Math.sin(t * 60);
  const lid = eio(seg(t, 8.5, 8.75)) * (1 - seg(t, 10.9, 11.0));
  return (
    <W><g>
      <rect x={-2000} y={0} width={4000} height={600} fill="#E9D7B8" stroke={INK} strokeWidth={7} />
      {[-1400, -1100, -800, -500, -200, 100, 400, 700, 1000].map((x) => <path key={x} d={`M ${x} 6 L ${x - 120} 600`} stroke="#D6BF98" strokeWidth={5} />)}
      {/* shelf + cactus */}
      <rect x={cx - 70} y={-218} width={140} height={16} rx={4} fill="#C08A5A" stroke={INK} strokeWidth={6} />
      <g transform={`translate(${cx + jig} -218)`}>
        <path d="M -24 0 L -20 -34 L 20 -34 L 24 0 Z" fill="#D9774A" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
        <path d="M -12 -34 Q -14 -96 0 -100 Q 14 -96 12 -34 Z" fill={GREEN} stroke={INK} strokeWidth={5.5} />
        <path d="M -12 -60 Q -30 -60 -30 -78 L -22 -80 Q -22 -68 -12 -68 Z M 12 -54 Q 28 -54 28 -72 L 20 -74 Q 20 -62 12 -62 Z" fill={GREEN} stroke={INK} strokeWidth={4.5} />
        {[[-8, -84], [6, -76], [-4, -60], [8, -48], [-30, -82], [28, -76]].map(([a, c], i) => <path key={i} d={`M ${a} ${c} l ${i % 2 ? 7 : -7} -4`} stroke={INK} strokeWidth={2.5} />)}
      </g>
      {/* trash can */}
      <g transform={`translate(${GX - 172} 0)`}>
        <path d="M -40 0 L -46 -96 L 46 -96 L 40 0 Z" fill="#A7B0BA" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        {[-24, 0, 24].map((x) => <path key={x} d={`M ${x} -10 L ${x * 1.08} -86`} stroke="#7E8892" strokeWidth={5} />)}
        <g transform={`translate(${-60 * lid} ${-96 - 30 * lid}) rotate(${-50 * lid})`}><rect x={-52} y={-12} width={104} height={14} rx={6} fill="#C5CCD3" stroke={INK} strokeWidth={6} /><path d="M -12 -12 Q 0 -26 12 -12" fill="none" stroke={INK} strokeWidth={5} /></g>
        {lid > 0.5 ? [0, 1, 2].map((k) => <path key={k} d={`M ${-20 + k * 20} -110 q 10 -14 0 -28 q -10 -14 0 -28`} stroke="#86A84C" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.8} transform={`translate(0 ${-8 * Math.sin(t * 4 + k)})`} />) : null}
        {lid > 0.5 ? <g><path d="M -26 -96 Q -20 -118 -6 -104 Q 4 -122 18 -100" fill="#F2D24B" stroke={INK} strokeWidth={4} /><path d="M 10 -96 l 18 -18 l 6 8" fill="none" stroke={INK} strokeWidth={4} /></g> : null}
      </g>
      {/* tank stand */}
      <rect x={TX - 125} y={-118} width={250} height={118} rx={6} fill="#8A6040" stroke={INK} strokeWidth={6.5} />
      <rect x={TX - 105} y={-100} width={95} height={80} rx={4} fill="#7A5236" stroke={INK} strokeWidth={4} />
      <rect x={TX + 10} y={-100} width={95} height={80} rx={4} fill="#7A5236" stroke={INK} strokeWidth={4} />
      {/* tank floor: sand + pebbles */}
      <path d={`M ${TX - 138} -122 L ${TX - 138} -140 Q ${TX} -156 ${TX + 138} -138 L ${TX + 138} -122 Z`} fill="#F1DCA7" stroke={INK} strokeWidth={4} />
      {[-90, -40, 60, 100].map((x, i) => <ellipse key={x} cx={TX + x} cy={-140} rx={12 + i * 2} ry={8} fill={i % 2 ? '#B9C3CC' : '#E4A07A'} stroke={INK} strokeWidth={3.5} />)}
    </g></W>
  );
};
const TankGlass: React.FC<{t: number}> = ({t}) => (
  <W><g>
    <rect x={TX - 140} y={-410} width={280} height={290} fill="#8FD0EA" opacity={0.28} />
    <path d={`M ${TX - 140} -380 Q ${TX - 70} ${-386 + 4 * Math.sin(t * 3)} ${TX} -380 Q ${TX + 70} ${-374 - 4 * Math.sin(t * 3)} ${TX + 140} -380`} stroke="#5FB4DA" strokeWidth={5} fill="none" />
    {[0, 1, 2, 3].map((k) => { const y = -150 - (((t * 60 + k * 70) % 230)); return <circle key={k} cx={TX + 100 - k * 8 + 4 * Math.sin(t * 4 + k)} cy={y} r={5 + (k % 2) * 3} fill="none" stroke="#fff" strokeWidth={3} />; })}
    <rect x={TX - 140} y={-410} width={280} height={290} rx={8} fill="none" stroke={INK} strokeWidth={7} />
    <path d={`M ${TX - 120} -390 L ${TX - 120} -320`} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={0.7} />
  </g></W>
);

const Defs: React.FC = () => (
  <W><defs>
    <radialGradient id="oFace" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <radialGradient id="oSick" cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#E6F4C8" /><stop offset="0.7" stopColor="#C6E29A" /><stop offset="1" stopColor="#9CC46E" /></radialGradient>
    <radialGradient id="oBody" cx="0.38" cy="0.3" r="0.9"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.75" stopColor="#F1EFEA" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
    <radialGradient id="oOct" cx="0.38" cy="0.3" r="0.85"><stop offset="0" stopColor="#F9A87E" /><stop offset="1" stopColor={OCT2} /></radialGradient>
  </defs></W>
);

// ---------- inserts (screen space) ----------
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const XFrame: React.FC<{id: string; R: number; children: React.ReactNode; bg?: string}> = ({id, R, children, bg = '#16223A'}) => (
  <svg width={900} height={900} viewBox="-450 -450 900 900" style={{overflow: 'visible'}}>
    <clipPath id={id}><circle r={R} /></clipPath>
    <circle r={R + 18} fill={INK} />
    <g clipPath={`url(#${id})`}>
      <rect x={-450} y={-450} width={900} height={900} fill={bg} />
      {Array.from({length: 13}, (_, i) => <path key={i} d={`M ${-450 + i * 75} -450 V 450 M -450 ${-450 + i * 75} H 450`} stroke="#2A3A5C" strokeWidth={3} />)}
      {children}
    </g>
    <circle r={R} fill="none" stroke="#3E6FB0" strokeWidth={20} />
  </svg>
);

/** X-RAY: the octopus. A small brain between the eyes, a nerve cord with knots of nerve cells down every arm; the
 *  arm cords light up and a pie counter fills to 2/3. */
const OctXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const lit = seg(t, 4.1, 6.0);
  const arms = Array.from({length: 8}, (_, i) => {
    const a = Math.PI * (0.12 + (i / 7) * 0.76);
    const tip = {x: Math.cos(a) * -330, y: 40 + Math.sin(a) * 330};
    return {tip, ph: i};
  });
  const frac = (2 / 3) * eout(seg(t, 4.1, 6.0));
  const pie = (f: number) => { const a = f * 2 * Math.PI; return `M 0 0 L 0 -64 A 64 64 0 ${a > Math.PI ? 1 : 0} 1 ${64 * Math.sin(a)} ${-64 * Math.cos(a)} Z`; };
  const done = t > T.inArms;
  return (
    <div style={{position: 'absolute', left: 540, top: 930, transform: `translate(-50%,-50%) rotate(-1.5deg) scale(${s})`}}>
      <XFrame id="oxr" R={340}>
        {arms.map(({tip, ph}, i) => <Tentacle key={i} b={{x: (i - 3.5) * 14, y: 20}} tip={tip} t={t} ph={ph} w0={30} bend={(i < 4 ? -1 : 1) * 0.15} amp={10} fill="#2E4A70" edge={5} light="#41618E" />)}
        {/* nerve cords: dots run down every arm and light up */}
        {arms.map(({tip}, i) => Array.from({length: 9}, (_, k) => {
          const u = (k + 1) / 10, on = lit * 10 > k + (i % 3) * 0.3;
          const x = lerp((i - 3.5) * 14, tip.x, u), y = lerp(20, tip.y, u) + 18 * Math.sin(u * 3);
          return <circle key={i * 20 + k} cx={x} cy={y} r={on ? 9 - u * 4 : 5} fill={on ? GOLD : '#5E7EA8'} stroke={on ? INK : 'none'} strokeWidth={2} />;
        }))}
        <ellipse cx={0} cy={-150} rx={130} ry={160} fill="#2E4A70" stroke="#A9C0E0" strokeWidth={6} />
        {[-1, 1].map((sd) => <circle key={sd} cx={sd * 52} cy={-40} r={22} fill="#41618E" stroke="#A9C0E0" strokeWidth={4} />)}
        <path d="M -40 -40 Q -44 -80 0 -82 Q 44 -80 40 -40 Q 30 -14 0 -18 Q -30 -14 -40 -40 Z" fill="#F59AC0" stroke={INK} strokeWidth={5} />
        <rect x={-450} y={((t * 520) % 900) - 450} width={900} height={14} fill="#9FD3FF" opacity={0.22} />
      </XFrame>
      <Card text="X-RAY: OCTOPUS" top={90} size={50} />
      <Card text="BRAIN" top={330} left={300} color="#F59AC0" rot={-7} s={popIn(t, T.brain - 0.1, 0.3)} size={46} />
      <Card text="ARMS" top={760} left={620} color={GOLD} rot={5} s={popIn(t, T.inArms - 0.08, 0.3)} size={56} />
      {/* pie counter */}
      <div style={{position: 'absolute', left: 450, top: 940, transform: `translate(-50%,-50%) rotate(2deg) scale(${popIn(t, 3.7, 0.3) * (done ? 1 + 0.1 * Math.max(0, 1 - (t - T.inArms) * 4) : 1)})`,
        background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '10px 30px 12px', fontFamily: FONT, color: INK,
        display: 'flex', alignItems: 'center', gap: 22, whiteSpace: 'nowrap'}}>
        <svg width={150} height={150} viewBox="-75 -75 150 150">
          <circle r={64} fill="#F59AC0" stroke={INK} strokeWidth={7} />
          {frac > 0.005 ? <path d={pie(frac)} fill={GOLD} stroke={INK} strokeWidth={5} strokeLinejoin="round" /> : null}
          <circle r={64} fill="none" stroke={INK} strokeWidth={7} />
        </svg>
        <div>
          <div style={{fontWeight: 900, fontSize: 110, lineHeight: 1, color: done ? RED : INK}}>{done ? '2/3' : `${Math.round(frac * 100)}%`}</div>
          <div style={{fontWeight: 900, fontSize: 38}}>BRAIN CELLS IN ARMS</div>
        </div>
      </div>
    </div>
  );
};

/** SUCKER CLOSE-UP: taste cells on the rim fire when it touches the trash */
const SuckerXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const fire = seg(t, T.tastes - 0.1, T.tastes + 0.3);
  return (
    <div style={{position: 'absolute', left: 780, top: 1560, transform: `translate(-50%,-50%) rotate(3deg) scale(${s * 0.62})`}}>
      <XFrame id="sxr" R={330} bg="#3A2A22">
        {/* banana peel + crumbs under the sucker */}
        <path d="M -300 260 Q -100 120 60 220 Q 200 300 320 200 L 400 450 L -400 450 Z" fill="#F2D24B" stroke={INK} strokeWidth={8} />
        {[[-200, 330], [120, 360], [260, 300]].map(([a, b], i) => <circle key={i} cx={a} cy={b} r={16} fill="#8A6A3A" stroke={INK} strokeWidth={5} />)}
        <circle cx={0} cy={-20} r={230} fill={OCT} stroke={INK} strokeWidth={9} />
        <circle cx={0} cy={-20} r={170} fill={SUCK} stroke={INK} strokeWidth={8} />
        <circle cx={0} cy={-20} r={80} fill="#E8B69A" stroke={INK} strokeWidth={7} />
        {Array.from({length: 18}, (_, k) => {
          const a = (k / 18) * 2 * Math.PI, on = fire > 0 && 0.5 + 0.5 * Math.sin(t * 22 + k * 1.3) > 0.35;
          return <circle key={k} cx={125 * Math.cos(a)} cy={-20 + 125 * Math.sin(a)} r={on ? 17 : 12} fill={on ? GOLD : '#E7A989'} stroke={INK} strokeWidth={4} />;
        })}
        {fire > 0 ? [0, 1, 2].map((k) => <path key={k} d={`M ${-60 + k * 60} -260 l 14 -24 l -14 -12 l 14 -24`} stroke={GOLD} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`translate(0 ${-10 * ((t * 3 + k * 0.3) % 1)})`} />) : null}
      </XFrame>
      <Card text="SUCKER CLOSE-UP" top={90} size={54} />
      <Card text="TASTE CELLS" top={780} color={GOLD} rot={-3} s={popIn(t, T.tastes, 0.3)} size={66} />
    </div>
  );
};

/** versus counter: GRABS ITSELF - octopus 0 vs him 0 -> 8 */
const Versus: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const n = Math.round(8 * seg(t, 15.0, 15.55));
  const box = (label: string, v: number | string, red: boolean) => (
    <div style={{textAlign: 'center', minWidth: 200}}>
      <div style={{fontWeight: 900, fontSize: 120, lineHeight: 1, color: red ? RED : INK}}>{v}</div>
      <div style={{fontWeight: 900, fontSize: 36}}>{label}</div>
    </div>
  );
  return (
    <div style={{position: 'absolute', left: 540, top: 1520, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s * (n >= 8 ? 1 + 0.08 * Math.max(0, 1 - (t - 15.55) * 4) : 1)})`,
      background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '8px 30px 14px', fontFamily: FONT, color: INK, whiteSpace: 'nowrap'}}>
      <div style={{fontWeight: 900, fontSize: 44, textAlign: 'center'}}>GRABS ITSELF</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 20}}>
        {box('OCTOPUS', 0, false)}<div style={{fontWeight: 900, fontSize: 54}}>vs</div>{box('HIM', n, n >= 8)}
      </div>
    </div>
  );
};

// ---------- the story over time ----------
const octMood = (t: number): OctMood => {
  if (t > GRAB + 0.1 && t < 3.45) return 'laugh';
  if (t > 6.6 && t < 7.5) return 'proud';
  if (t > T.itself && t < 12.9) return 'proud';
  if (t > FALL && t < 16.3) return 'laugh';
  return 'smug';
};

export const OctopusScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean}> = ({t, camK, thumb}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: 18, y: -200, k: 2.2}, {t: 1.6, x: 18, y: -200, k: 2.3},                     // both: his eight arms grab everything, smug octopus
    {t: 1.63, x: GX - 70, y: -230, k: 2.9}, {t: 3.45, x: GX - 70, y: -230, k: 3.1},         // the cactus: OUCH
    {t: 3.48, x: TX - 40, y: -230, k: 2.0}, {t: 6.6, x: TX - 40, y: -230, k: 2.1},          // behind the octopus X-ray
    {t: 6.63, x: TX, y: -265, k: 3.0}, {t: 7.48, x: TX, y: -265, k: 3.2},                   // each arm its own job
    {t: 7.51, x: GX, y: -190, k: 2.35}, {t: 8.43, x: GX, y: -190, k: 2.45},                 // tug of war
    {t: 8.46, x: GX - 80, y: -170, k: 2.75}, {t: 10.93, x: GX - 70, y: -175, k: 2.95},      // the trash can: TASTES TRASH
    {t: 10.96, x: TX - 10, y: -250, k: 2.5}, {t: 12.85, x: TX - 10, y: -250, k: 2.65},      // the octopus never grabs itself (CTA above)
    {t: 12.88, x: TX, y: -290, k: 3.3}, {t: 14.85, x: TX, y: -290, k: 3.5},                 // its skin stops the suckers
    {t: 14.88, x: GX + 30, y: -150, k: 2.4}, {t: FALL, x: GX + 40, y: -150, k: 2.5}, {t: FALL + 0.25, x: GX + 110, y: -120, k: 2.4, e: 'out'}, {t: 16.12, x: GX + 110, y: -120, k: 2.45},      // knot -> BOING
    {t: 16.15, x: 0, y: -195, k: 2.2}, {t: 18.5, x: 5, y: -192, k: 2.1},                    // every arm a job
    {t: 18.6, x: 18, y: -200, k: 2.2},                                                     // = the frame-0 shot
  ], t);
  const sh = shake(t, hit(t, 0, 6, 7) + hit(t, GRAB, 7, 6) + hit(t, T.tastes, 4, 6) + hit(t, FALL + 0.2, 10, 5));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  // inserts
  const oxS = popIn(t, 3.48, 0.35) * (1 - seg(t, 6.45, 6.6));
  const suS = popIn(t, 9.35, 0.3) * (1 - seg(t, 10.8, 10.93));
  const vsS = popIn(t, 14.95, 0.3) * (1 - seg(t, 16.0, 16.12));
  // stickers
  const grab0 = 1 - seg(t, 1.3, 1.5);
  const ouch = pulse(t, GRAB + 0.05, 0.8), noOrd = pulse(t, T.stop, 0.9);
  const ownS = pulse(t, T.decides - 0.25, 0.45), tug = pulse(t, 7.6, 0.75);
  const yank = pulse(t, 8.7, 0.6), trash = pulse(t, T.tastes, 1.0), bleh = pulse(t, T.touches - 0.1, 0.4);
  const never = pulse(t, T.never - 0.05, 0.9), noStick = pulse(t, T.stops - 0.05, 0.9);
  const knot = pulse(t, 15.3, 0.4), boing = pulse(t, FALL + 0.2, 0.55);
  const jobS = pulse(t, T.every - 0.05, 1.1);
  const g = guyAt(t);
  const headPos = {x: GX + g.dx + Math.sin((g.rot + 82 * g.fall) * Math.PI / 180) * 235, y: -Math.cos((g.rot + 82 * g.fall) * Math.PI / 180) * 235};
  const stars = t > FALL + 0.2 && t < 16.15 ? 1 : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Defs />
      <Sky />
      <Layer cam={cam} z={2600} paper={false}>
        <W><g>
          {/* window on the far wall */}
          <rect x={-520} y={-760} width={300} height={260} rx={10} fill="#CFE9F6" stroke={INK} strokeWidth={7} />
          <path d="M -370 -760 V -500 M -520 -630 H -220" stroke={INK} strokeWidth={6} />
          <circle cx={-300} cy={-700} r={30} fill="#FFE27A" stroke={INK} strokeWidth={5} />
          <rect x={300} y={-720} width={220} height={150} rx={8} fill="#FFF3D6" stroke={INK} strokeWidth={6} />
          <path d={`M 330 -600 Q 380 -690 410 -640 Q 440 -700 490 -600`} fill="none" stroke={OCT} strokeWidth={8} />
        </g></W>
      </Layer>
      <Layer cam={cam} z={1000}><Room t={t} /></Layer>
      <Layer cam={cam} z={1000}><Octopus t={t} mood={octMood(t)} /></Layer>
      <Layer cam={cam} z={1000} paper={false}><TankGlass t={t} /></Layer>
      <Layer cam={cam} z={1000}><GuyRig t={t} /></Layer>
      <Layer cam={cam} z={1000}>
        {[0, 1, 2].map((i) => {
          const a = t * 6 + (i * 2 * Math.PI) / 3;
          return <Star key={i} x={headPos.x + Math.cos(a) * 80} y={headPos.y - 40 + Math.sin(a) * 16} s={stars * 0.5} rot={t * 200} />;
        })}
        {thumb ? null : <>
        <Txt x={GX + 30} y={-128} s={grab0} text="GRAB GRAB" size={40} rot={-5} fill={GOLD} />
        <Txt x={GX - 150} y={-345} s={ouch} text="OUCH" size={66} rot={-8} fill={RED} />
        <Txt x={GX + 60} y={-360} s={noOrd} text="NOT ME" size={42} rot={6} fill="#FFFFFF" />
        <Txt x={TX} y={-440} s={ownS} text="ON ITS OWN" size={46} rot={-4} fill={GOLD} />
        <Txt x={GX} y={-390} s={tug} text="TUG OF WAR" size={52} rot={4} fill={GOLD} />
        <Txt x={GX - 150} y={-170} s={yank} text="DIVE" size={44} rot={-6} fill="#FFFFFF" />
        <Txt x={GX - 75} y={-370} s={trash} text="TASTES TRASH" size={46} rot={-5} fill={GREEN} />
        <Txt x={GX + 80} y={-250} s={bleh} text="BLEH" size={44} rot={8} fill="#FFFFFF" />
        <Txt x={TX} y={-445} s={never} text="NEVER ITSELF" size={44} rot={-4} fill={GOLD} />
        <Txt x={TX} y={-440} s={noStick} text="SKIN SAYS NO" size={40} rot={4} fill="#FFFFFF" />
        <Txt x={GX + 30} y={-350} s={knot} text="KNOT" size={60} rot={-6} fill={GOLD} />
        <Txt x={GX + 150} y={-190} s={boing} text="BOING" size={60} rot={8} fill="#FFFFFF" />
        <Txt x={0} y={-430} s={jobS} text="ONE JOB EACH" size={46} rot={-4} fill={GOLD} />
        </>}
      </Layer>
      <OctXRay t={t} s={oxS} />
      <SuckerXRay t={t} s={suS} />
      {thumb ? null : <>
        <Versus t={t} s={vsS} />
        <CommentBubble t={t} text="what if you had an octopus's arms??" handle="@inky_doodles" likes="3.1K" />
        <CallToAction t={t} at={T.cta} />
        <CommentAsk t={t} at={T.so - 0.05} until={DURATION - LOOP_DUR - 0.4} text="What job would you give yours?" />
      </>}
    </AbsoluteFill>
  );
};

export const OctopusVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -28): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -18 : db}));
  const cues: Cue[] = [
    {f: 'bubbles.wav', at: 0, db: -36, to: 19.1},
    // frame 0: eight arms already grabbing everything
    {f: 'whoosh.wav', at: 0, db: -16}, {f: 'squeak.wav', at: 0, db: -18}, {f: 'pop.wav', at: 0.05, db: -20}, {f: 'squeak.wav', at: 0.6, db: -26},
    {f: 'squeak.wav', at: 1.2, db: -26},
    {f: 'whoosh.wav', at: 1.6, db: -28}, {f: 'zap.wav', at: GRAB, db: -18}, {f: 'crack.wav', at: GRAB + 0.02, db: -20}, {f: 'pop.wav', at: GRAB + 0.05, db: -20},
    {f: 'crowd_laugh.wav', at: 2.6, db: -32, to: 0.8}, {f: 'pop.wav', at: T.stop, db: -24},
    {f: 'zap.wav', at: 3.48, db: -26}, {f: 'pop.wav', at: 3.7, db: -24}, ...ticks(4.1, 6.0, 12), {f: 'pop.wav', at: T.brain - 0.1, db: -24},
    {f: 'ding.mp3', at: T.inArms, db: -20},
    {f: 'whoosh.wav', at: 6.61, db: -28}, {f: 'pop.wav', at: 6.75, db: -24}, {f: 'pop.wav', at: T.decides - 0.1, db: -24},
    {f: 'whoosh.wav', at: 7.49, db: -28}, {f: 'strain.mp3', at: 7.55, db: -24, to: 0.85}, {f: 'pop.wav', at: 7.6, db: -24},
    {f: 'whoosh.wav', at: 8.44, db: -28}, {f: 'crack.wav', at: 8.55, db: -26}, {f: 'splash.wav', at: 8.95, db: -30, to: 0.5},
    {f: 'zap.wav', at: 9.35, db: -28}, {f: 'gulp.wav', at: T.tastes, db: -20}, {f: 'horn.wav', at: T.tastes + 0.1, db: -34, to: 0.5}, {f: 'squeak.wav', at: T.touches - 0.1, db: -24},
    {f: 'whoosh.wav', at: 10.94, db: -28}, ...ctaCues(T.cta),
    {f: 'pop.wav', at: T.itself - 0.1, db: -22}, {f: 'pop.wav', at: T.itself - 0.05, db: -24},
    {f: 'whoosh.wav', at: 12.86, db: -28}, {f: 'pop.wav', at: T.stops - 0.05, db: -22}, {f: 'pop.wav', at: T.stops, db: -24},
    {f: 'whoosh.wav', at: 14.86, db: -28}, {f: 'strain.mp3', at: 14.95, db: -22, to: 0.8}, ...ticks(15.0, 15.55, 8, -26),
    {f: 'twang.mp3', at: FALL + 0.2, db: -14, to: 0.6}, {f: 'crack.wav', at: FALL + 0.2, db: -20}, {f: 'crowd_laugh.wav', at: FALL + 0.25, db: -27, to: 1.2}, {f: 'giggle.mp3', at: 16.0, db: -32, to: 0.5},
    {f: 'whoosh.wav', at: 16.13, db: -28},
    ...Array.from({length: 8}, (_, i): Cue => ({f: 'pop.wav', at: JOBS + i * 0.1, db: -26})), {f: 'ding.mp3', at: T.job, db: -20},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<OctopusScene t={0} />}>
        <OctopusScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="octopus/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const OctopusWide: React.FC = () => <WideFit.Provider value={0.72}><OctopusVideo /></WideFit.Provider>;
