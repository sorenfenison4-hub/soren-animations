// "Is today my lucky day?" - a yes / no wheel Short. The guy has just spun a doodle prize wheel (it has a face on its
// hub); it slows down, stalls against the last peg on NO, strains, and clicks over to YES. Confetti, a YES sticker,
// a stamp on the question card. Everything is drawn in code (no new pictures); the ticks come from the wheel's motion.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, Sky, Ground, Guy, swap, ContactShadow, ObjectFace, FACE0, Face, Star, W,
  SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, clamp, rnd, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle,
  AskBanner, Pose} from './lib/kit';

// voice at 0.1 s, last word ends 11.36 s; the tail lets the confetti fall and the like / subscribe doodle finish
export const DURATION = 13.2;
// beats (video time) from the take's pauses
export const T = {card: 1.85, think: 1.75, okay: 3.86, worried: 6.62, rock: 7.4, wait: 8.24, yes: 9.12, cta: 9.95, point: 10.1,
  yes2: 10.9};

// ---------- the wheel (world units = screen px of the opening shot) ----------
export const WX = 620, WY = 900, R = 320;
const RING = 44, PEG_R = R - 24, PIVOT_Y = WY - R - 24;
export const FLOOR_Y = 1345, GX = 230;
const deg = Math.PI / 180;
const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;
/** damped wobble that starts at 0 (no jump on its first frame) */
const wob = (t: number, t0: number, amp: number, f = 3, d = 6) => (t < t0 ? 0 : amp * Math.exp(-d * (t - t0)) * Math.sin(2 * Math.PI * f * (t - t0)));

// wedge k is centred at 45k degrees clockwise from the top: even = YES, odd = NO. Pegs sit on the boundaries.
const PEGS = Array.from({length: 8}, (_, j) => 22.5 + 45 * j);
const W0 = 720;                  // deg/s at frame 0 (he has just spun it)
const TS = 7.25;                 // it runs out of speed with the last peg pressing the flapper
const TH_S = 360 * 8 - 26.5;     // there the NO/YES peg is 4 deg short of the flapper: NO is under the pointer
/** wheel angle in degrees (clockwise) at time t */
export const wheelAngle = (t: number) => {
  if (t <= TS) return TH_S - ((W0 * TS) / 2) * (1 - t / TS) ** 2;      // friction: speed falls linearly to 0
  const back = 3 * eio(seg(t, T.rock, T.rock + 0.32)) + wob(t, T.rock + 0.32, 0.5, 3, 8);     // the flapper pushes it back
  const push = 7 * Math.pow(seg(t, T.wait + 0.06, T.yes), 1.7);                               // ...it strains forward
  const strain = t > T.wait + 0.06 && t < T.yes ? 0.4 * Math.sin((t - T.wait) * 2 * Math.PI * 13) * seg(t, T.wait + 0.06, T.wait + 0.3) : 0;
  const snap = 11 * eout(seg(t, T.yes, T.yes + 0.3)) + wob(t, T.yes + 0.3, -1.2, 2.6, 6);    // ...and slips past onto YES
  return TH_S - back + push + strain + snap;
};
const speedAt = (t: number) => (t < TS ? W0 * (1 - t / TS) : 0);
/** times at which a peg passes the flapper (one tick each) */
export const PASSES: number[] = (() => {
  const out: number[] = [];
  const dt = 1 / 2000;
  let prev = PEGS.map((p) => wrap(p + wheelAngle(-0.4)));
  for (let i = 1; -0.4 + i * dt <= DURATION; i++) {
    const t = -0.4 + i * dt, th = wheelAngle(t);
    const cur = PEGS.map((p) => wrap(p + th));
    cur.forEach((a, j) => { if (prev[j] < 0 && a >= 0 && a < 90) out.push(t); });
    prev = cur;
  }
  return out;
})();
const C_CONTACT = 9, BEND = 28;
/** flapper bend in degrees (+ = tip pushed to the right by a peg), then a damped swing back after each pass */
export const flapBend = (t: number) => {
  const th = wheelAngle(t);
  let push = 0;
  for (const p of PEGS) { const a = wrap(p + th); if (a > -C_CONTACT && a <= 0) push = Math.max(push, (BEND * (a + C_CONTACT)) / C_CONTACT); }
  let last = -99;
  for (const p of PASSES) { if (p <= t) last = p; else break; }
  const tau = t - last;
  const swing = tau < 2 ? BEND * Math.exp(-10 * tau) * Math.cos(2 * Math.PI * 7 * tau) : 0;
  return push > 0 ? Math.max(push, swing) : swing;
};

const YES_C = '#8FDB6E', NO_C = '#FF7B66', FRAME_C = '#FFD43B';
const wedge = (k: number, r = R) => {
  const a0 = (45 * k - 22.5) * deg, a1 = (45 * k + 22.5) * deg;
  return `M 0 0 L ${r * Math.sin(a0)} ${-r * Math.cos(a0)} A ${r} ${r} 0 0 1 ${r * Math.sin(a1)} ${-r * Math.cos(a1)} Z`;
};
const bulbOn = (i: number, t: number) => (t >= T.yes ? Math.floor((t - T.yes) * 7) % 2 === i % 2 : (Math.floor(t * 9) + i) % 4 < 2);

/** the wheel: fixed frame ring with bulbs, the turning disc (wedges, labels, pegs), the fixed hub with a face */
export const Wheel: React.FC<{t: number; th: number; f: Face; win?: number; jx?: number}> = ({t, th, f, win = 0, jx = 0}) => (
  <div style={{position: 'absolute', left: 0, top: 0, transform: `translateX(${jx}px)`}}>
    <W>
      <g transform={`translate(${WX} ${WY})`}>
        <circle r={R + RING} fill={FRAME_C} stroke={INK} strokeWidth={9} />
        {Array.from({length: 16}).map((_, i) => {
          const a = i * 22.5 * deg, rr = R + RING / 2 + 2;
          return i === 0 ? null : <circle key={i} cx={rr * Math.sin(a)} cy={-rr * Math.cos(a)} r={10} fill={bulbOn(i, t) ? '#FFF8D6' : '#D7A42A'}
            stroke={INK} strokeWidth={4} />;
        })}
        <g transform={`rotate(${th})`}>
          {PEGS.map((_, k) => <path key={k} d={wedge(k)} fill={k % 2 ? NO_C : YES_C} />)}
          {PEGS.map((p, k) => <line key={'l' + k} x1={0} y1={0} x2={R * Math.sin(p * deg)} y2={-R * Math.cos(p * deg)} stroke={INK} strokeWidth={6} />)}
          {win > 0 ? <path d={wedge(0, R - 6)} fill="#FFFFFF" fillOpacity={0.28 * win} stroke="#FFFDF6" strokeWidth={14} strokeOpacity={win}
            strokeLinejoin="round" /> : null}
          {PEGS.map((_, k) => <g key={'t' + k} transform={`rotate(${45 * k})`}>
            <text x={0} y={-R * 0.64} textAnchor="middle" dominantBaseline="central" fontFamily={FONT} fontWeight={900} fontSize={k % 2 ? 74 : 66}
              fill="#fff" stroke={INK} strokeWidth={11} strokeLinejoin="round" paintOrder="stroke" letterSpacing={-1}>{k % 2 ? 'NO' : 'YES'}</text>
          </g>)}
          {PEGS.map((p, j) => <circle key={'p' + j} cx={PEG_R * Math.sin(p * deg)} cy={-PEG_R * Math.cos(p * deg)} r={11} fill="#FFFDF6" stroke={INK} strokeWidth={5} />)}
          <circle r={R} fill="none" stroke={INK} strokeWidth={10} />
        </g>
        <circle r={92} fill="#FFFDF6" stroke={INK} strokeWidth={9} />
      </g>
    </W>
    <ObjectFace x={WX} y={WY + 6} r={84} f={f} t={t} lidColor="#FFFDF6" />
  </div>
);

/** the red flapper on top of the frame; bend + = tip pushed to the right */
export const Flapper: React.FC<{bend: number; jx?: number}> = ({bend, jx = 0}) => (
  <W><g transform={`translate(${WX + jx} ${PIVOT_Y}) rotate(${-bend})`}>
    <path d="M -25 -4 Q -27 40 0 104 Q 27 40 25 -4 Q 0 -24 -25 -4 Z" fill="#E5534B" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -11 8 Q -13 38 -3 66" stroke="#fff" strokeOpacity={0.8} strokeWidth={6} fill="none" strokeLinecap="round" />
    <circle cx={0} cy={0} r={12} fill={FRAME_C} stroke={INK} strokeWidth={5} />
  </g></W>
);

export const Stand: React.FC = () => (
  <W>
    <rect x={WX - 26} y={WY} width={52} height={FLOOR_Y - WY - 40} fill="#A8B4C2" stroke={INK} strokeWidth={8} />
    <path d={`M ${WX - 150} ${FLOOR_Y + 4} L ${WX - 96} ${FLOOR_Y - 60} H ${WX + 96} L ${WX + 150} ${FLOOR_Y + 4} Z`} fill="#9B7BF0" stroke={INK}
      strokeWidth={8} strokeLinejoin="round" />
    <path d={`M ${WX - 92} ${FLOOR_Y - 40} H ${WX + 40}`} stroke="#fff" strokeOpacity={0.55} strokeWidth={7} strokeLinecap="round" />
  </W>
);

/** doodle speed arcs outside the frame while the wheel is fast */
const SpeedLines: React.FC<{t: number; w: number}> = ({t, w}) => {
  const o = clamp((w - 140) / 320);
  if (o < 0.03) return null;
  const arcs: [number, number, number][] = [[18, 62, 60], [26, 50, 96], [198, 242, 60], [206, 230, 96]];
  return <W><g transform={`translate(${WX} ${WY})`}>
    {arcs.map(([a0, a1, dr], i) => {
      const r = R + RING + dr, flick = 1 + 0.08 * Math.sin(t * 40 + i * 2);
      const b0 = a0 * deg, b1 = lerp(a0, a1, o * flick > 1 ? 1 : o * flick) * deg;
      return <path key={i} d={`M ${r * Math.sin(b0)} ${-r * Math.cos(b0)} A ${r} ${r} 0 0 1 ${r * Math.sin(b1)} ${-r * Math.cos(b1)}`}
        stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" />;
    })}
  </g></W>;
};

/** pale game-show rays behind the wheel (flat, turning slowly) */
export const SUN = {x: 660, y: 898};
const mix = (a: string, b: string, u: number) => '#' + [1, 3, 5].map((i) => Math.round(lerp(parseInt(a.slice(i, i + 2), 16), parseInt(b.slice(i, i + 2), 16), clamp(u)))
  .toString(16).padStart(2, '0')).join('');
export const Sunburst: React.FC<{t: number; glow: number}> = ({t, glow}) => (
  <W><g transform={`translate(${SUN.x} ${SUN.y}) rotate(${t * 5})`}>
    {Array.from({length: 18}).map((_, i) => {
      const a0 = i * 20 * deg, a1 = (i * 20 + 10) * deg, r = 2600;
      return <path key={i} d={`M 0 0 L ${r * Math.sin(a0)} ${-r * Math.cos(a0)} L ${r * Math.sin(a1)} ${-r * Math.cos(a1)} Z`}
        fill={mix('#FFF0C4', '#FFE59A', glow)} />;
    })}
  </g></W>
);

export const Clover: React.FC<{x: number; y: number; s: number; rot?: number; fill?: string; sw?: number}> = ({x, y, s, rot = 0, fill = '#7CCB5B', sw = 5}) => (
  s > 0.01 ? <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M 0 6 Q 4 22 14 30" stroke={INK} strokeWidth={sw + 1} fill="none" strokeLinecap="round" />
    {[0, 90, 180, 270].map((a) => <path key={a} transform={`rotate(${a})`} d="M 0 0 C -4 -10 -18 -14 -15 -24 C -12 -31 -3 -29 0 -22 C 3 -29 12 -31 15 -24 C 18 -14 4 -10 0 0 Z"
      fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" />)}
  </g> : null
);

// ---------- characters ----------
const guyPose = (t: number) => {
  let g = {pose: 'present' as Pose, sx: 1, sy: 1};
  const steps: [number, Pose, Pose][] = [[T.think, 'present', 'think'], [T.okay, 'think', 'point_right'], [T.worried, 'point_right', 'front_worried'],
    [T.rock, 'front_worried', 'scared'], [T.wait, 'scared', 'surprised'], [T.yes + 0.03, 'surprised', 'laugh'], [T.point, 'laugh', 'point_right']];
  for (const [at, a, b] of steps) if (t >= at - 0.12) g = swap(t, at, a, b);
  return g;
};
const wheelFace = (t: number): Face => {
  const blink = [5.0, 11.9].some((b) => t > b && t < b + 0.12) ? 1 : 0;
  let f: Face = {...FACE0, squeeze: 1, mouth: 'grin', brow: -6};                                   // wheee
  if (t > T.okay - 0.1) f = {...FACE0, lx: 0.15, ly: -0.95, mouth: 'smile', brow: -4};              // watching the flapper
  if (t > T.worried) f = {...FACE0, lx: 0.15, ly: -0.95, mouth: 'o', brow: -12};                    // uh oh, slowing down
  if (t > T.rock) f = {...FACE0, lx: -0.85, ly: 0.15, mouth: 'frown', brow: -14, sweat: 1};         // it's a no... sorry
  if (t > T.wait + 0.05) f = {...FACE0, squeeze: 1, mouth: 'grit', brow: 16, sweat: 1};              // hnnng
  if (t > T.yes) f = {...FACE0, squeeze: 1, mouth: 'grin', brow: -8};                               // yes
  if (t > T.yes + 1.0) f = {...FACE0, lx: -0.85, ly: 0.2, mouth: 'grin', brow: -6, lid: 0.25};       // pleased with itself
  return {...f, lid: Math.max(f.lid, blink)};
};

// ---------- stickers (screen space, inside the scene so they boil and slide out with the loop) ----------
const burstD = (n: number, r0: number, r1: number) => {
  const p: string[] = [];
  for (let i = 0; i < 2 * n; i++) { const a = (i / (2 * n)) * Math.PI * 2, r = i % 2 ? r1 : r0; p.push(`${(r * Math.sin(a)).toFixed(1)} ${(-r * Math.cos(a)).toFixed(1)}`); }
  return 'M ' + p.join(' L ') + ' Z';
};
export const YesSticker: React.FC<{t: number; at: number; x?: number; y?: number; size?: number}> = ({t, at, x = 848, y = 520, size = 1}) => {
  const u = t - at;
  const s = popIn(t, at, 0.38);
  if (s < 0.01) return null;
  const bob = 1 + 0.03 * Math.sin(u * 2 * Math.PI * 1.3);
  const rot = -8 + 7 * Math.exp(-4 * u) * Math.sin(u * 2 * Math.PI * 3);
  return <svg width={10} height={10} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s * bob * size})`}>
      <path d={burstD(13, 188, 146)} fill={FRAME_C} stroke={INK} strokeWidth={9} strokeLinejoin="round" />
      <text y={10} textAnchor="middle" dominantBaseline="central" fontFamily={FONT} fontWeight={900} fontSize={132} fill="#fff" stroke={INK}
        strokeWidth={17} strokeLinejoin="round" paintOrder="stroke" letterSpacing={-3}>YES</text>
      <g transform="translate(0 -160) rotate(5)">
        <rect x={-152} y={-31} width={304} height={62} rx={20} fill="#fff" stroke={INK} strokeWidth={6} />
        <text y={2} textAnchor="middle" dominantBaseline="central" fontFamily={FONT} fontWeight={900} fontSize={34} fill={INK} letterSpacing={-0.5}>THE WHEEL SAYS</text>
      </g>
    </g>
  </svg>;
};
/** the viewer-style question card: pops in as the hook title leaves, parks in the lower band, gets a YES stamp */
export const QuestionCard: React.FC<{t: number; at: number; stampAt?: number; y?: number}> = ({t, at, stampAt = 1e9, y = 1530}) => {
  const s = popIn(t, at, 0.36);
  if (s < 0.01) return null;
  const st = seg(t, stampAt, stampAt + 0.16), stS = st > 0 ? lerp(1.9, 1, eout(st)) + (t > stampAt + 0.16 ? spring(t, stampAt + 0.16, -0.06, 3, 8) : 0) : 0;
  return (
    <div style={{position: 'absolute', left: 540, top: y, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s})`, background: '#fff',
      border: `7px solid ${INK}`, borderRadius: 30, boxShadow: `0 9px 0 ${INK}`, padding: '16px 36px 20px 30px', fontFamily: FONT, whiteSpace: 'nowrap'}}>
      <div style={{position: 'absolute', left: -26, top: -24, width: 128, height: 44, background: 'rgba(255,230,150,0.92)', transform: 'rotate(-13deg)',
        boxShadow: '0 2px 0 rgba(20,20,20,0.18)'}} />
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 28, fontWeight: 800, color: '#8A8070', letterSpacing: 1.5}}>
        <svg width={44} height={44} viewBox="-34 -34 68 68"><Clover x={0} y={-2} s={0.95} sw={5} /></svg>
        QUESTION FOR THE WHEEL
      </div>
      <div style={{fontSize: 58, fontWeight: 900, color: INK, letterSpacing: -1, marginTop: 2}}>Is today my lucky day?</div>
      {st > 0 ? <div style={{position: 'absolute', right: 34, top: -44, transform: `rotate(-12deg) scale(${stS})`, border: '7px solid #2E9B4E',
        borderRadius: 18, padding: '2px 18px', fontSize: 54, fontWeight: 900, color: '#2E9B4E', background: 'rgba(255,255,255,0.88)', letterSpacing: 1}}>YES</div> : null}
    </div>
  );
};

const COLS = ['#FFD43B', '#FF6A4B', '#2F80ED', '#8FDB6E', '#FF8FC8', '#A98BFF'];
const CONF = Array.from({length: 76}, (_, i) => {
  const side = i % 2 ? 1 : -1;
  return {side, vx: -side * (520 + 1300 * rnd(i * 3 + 1)), vy: -(1500 + 1300 * rnd(i * 5 + 2)), spin: (rnd(i * 7 + 3) - 0.5) * 900,
    kind: [0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 3][Math.floor(rnd(i * 11 + 4) * 11)], col: COLS[Math.floor(rnd(i * 13 + 5) * COLS.length)], s: 0.85 + 0.6 * rnd(i * 17 + 6),
    d: 0.09 * rnd(i * 19 + 7), ph: rnd(i * 23 + 8) * 6.28, fl: 3 + 5 * rnd(i * 29 + 9)};
});
/** paper confetti (strips, dots, stars, four-leaf clovers) fired from both lower corners at `at` */
const Confetti: React.FC<{t: number; at: number}> = ({t, at}) => {
  const items = CONF.map((c, i) => {
    const tau = t - at - c.d;
    if (tau <= 0) return null;
    const k = 3.2, g = 1100, x0 = c.side < 0 ? 30 : 1050, y0 = 1430;
    const x = x0 + (c.vx / k) * (1 - Math.exp(-k * tau)) + 28 * Math.sin(tau * 5 + c.ph) * Math.min(1, tau * 2);
    const y = y0 + (g / k) * tau + ((c.vy - g / k) / k) * (1 - Math.exp(-k * tau));
    if (y > 2000) return null;
    const rot = c.spin * tau + c.ph * 50, flip = Math.cos(tau * c.fl * 2 + c.ph);
    const tf = `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${c.s.toFixed(2)})`;
    if (c.kind === 3) return <g key={i} transform={tf}><Clover x={0} y={0} s={0.62} sw={4} /></g>;
    if (c.kind === 2) return <path key={i} transform={tf} d="M 0 -15 Q 3 -3 15 0 Q 3 3 0 15 Q -3 3 -15 0 Q -3 -3 0 -15 Z" fill={c.col} stroke={INK} strokeWidth={3} />;
    if (c.kind === 1) return <ellipse key={i} transform={tf} rx={10 * Math.max(0.2, Math.abs(flip))} ry={10} fill={c.col} stroke={INK} strokeWidth={3} />;
    return <rect key={i} transform={`${tf} scale(1 ${Math.max(0.15, Math.abs(flip)).toFixed(2)})`} x={-7} y={-14} width={14} height={28} rx={3} fill={c.col} stroke={INK} strokeWidth={3} />;
  });
  return <svg width={10} height={10} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>{items}</svg>;
};

// opening shot framing; background doodles (z 1700) are placed by their screen position in it
const OPEN = {x: 545, y: 905, k: 1.08};
const toWorld = (xs: number, ys: number, z: number) => {
  const ks = 1000 / (z - (1000 - 1000 / OPEN.k));
  return [OPEN.x + (xs - 540) / ks, OPEN.y + (ys - 960) / ks];
};
const DOODLES: [number, number, number][] = [[175, 590, 0], [960, 470, 1], [110, 1180, 1], [985, 1230, 0], [300, 470, 2], [880, 1400, 2]];

// ---------- the scene ----------
export const WheelScene: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([
    {t: 0, ...OPEN}, {t: 3.7, x: 545, y: 898, k: 1.11},
    {t: 6.5, x: 432, y: 860, k: 1.4}, {t: 9.08, x: 425, y: 851, k: 1.49},
    {t: 9.85, ...OPEN, e: 'out'}, {t: DURATION, ...OPEN},
  ], t);
  const th = wheelAngle(t), w = speedAt(t);
  const g = guyPose(t);
  const hopU = seg(t, T.yes + 0.05, T.yes + 0.5), hop = 80 * 4 * hopU * (1 - hopU);
  const land = 1 + (t > T.yes + 0.5 ? spring(t, T.yes + 0.5, -0.05, 3, 8) : 0);
  const lean = 6 * Math.exp(-3.2 * t) * Math.cos(2 * Math.PI * 1.1 * t);   // follow-through of the spin he just gave it
  const jx = t > T.wait + 0.05 && t < T.yes ? 2.2 * Math.sin(t * 2 * Math.PI * 17) * seg(t, T.wait, T.wait + 0.3) : 0;
  const win = t > T.yes ? 0.6 + 0.4 * Math.sin((t - T.yes) * 2 * Math.PI * 2.2) : 0;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Sky />
      <Layer cam={cam} z={1500} paper={false}><Sunburst t={t} glow={t > T.yes ? seg(t, T.yes, T.yes + 0.15) * (0.55 + 0.45 * Math.cos((t - T.yes) * 2 * Math.PI * 1.6)) : 0} /></Layer>
      <Layer cam={cam} z={1700}>
        <W>{DOODLES.map(([xs, ys, kind], i) => {
          const [x, y] = toWorld(xs, ys, 1700), tw = 1 + 0.12 * Math.sin(t * 3 + i * 1.7);
          return kind === 1 ? <Clover key={i} x={x} y={y} s={1.5 * tw} rot={i * 25} /> : null;
        })}</W>
        {DOODLES.map(([xs, ys, kind], i) => { const [x, y] = toWorld(xs, ys, 1700); return kind === 1 ? null : <Star key={i} x={x} y={y} s={(kind ? 1.3 : 1.7) * (1 + 0.15 * Math.sin(t * 3 + i))} rot={i * 20 + t * 15} />; })}
      </Layer>
      <Layer cam={cam} z={1000}>
        <Ground y={FLOOR_Y} color="#F2DFBF" />
        <Stand />
        <SpeedLines t={t} w={w} />
        <Wheel t={t} th={th} f={wheelFace(t)} win={win} jx={jx} />
        <Flapper bend={flapBend(t)} jx={jx} />
        {[0, 1, 2].map((i) => <Star key={i} x={WX - 200 + i * 200} y={WY - R - 150 - (i % 2) * 50}
          s={1.1 * popIn(t, T.yes + 0.1 + i * 0.07, 0.25) * (1 - seg(t, T.yes + 1.4, T.yes + 1.7))} rot={t * 120} />)}
      </Layer>
      <Layer cam={cam} z={985}>
        <ContactShadow x={GX} y={FLOOR_Y} w={160 * (1 - hop / 200)} />
        <Guy pose={g.pose} x={GX} y={FLOOR_Y - hop} t={t} size={1.5} sx={g.sx} sy={g.sy * land} rot={lean}
          tremble={t > T.rock && t < T.wait ? 1 : 0} />
      </Layer>
      <Confetti t={t} at={T.yes + 0.03} />
      <YesSticker t={t} at={T.yes + 0.08} />
      <QuestionCard t={t} at={T.card} stampAt={T.yes2} />
      {/* every video: hook text from frame 0, the like / subscribe doodle once after the answer */}
      <HookTitle t={t} text="IS TODAY MY LUCKY DAY?" hi="LUCKY" y={345} />
      <CallToAction t={t} at={T.cta} />
    </AbsoluteFill>
  );
};

const tickCues: Cue[] = PASSES.filter((p) => p >= 0 && p < DURATION - 0.6).map((p, i) => ({
  f: i % 2 ? 'tick2.wav' : 'tick.wav', at: p, db: p > T.yes - 0.05 ? -12 : -24 + 10 * clamp(1 - speedAt(p) / W0) ** 2,
}));

export const WheelVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    ...tickCues,
    {f: 'pop.wav', at: T.card, db: -22},
    {f: 'strain.mp3', at: T.wait + 0.06, db: -27, to: 0.9},
    {f: 'twang.mp3', at: T.yes, db: -23}, {f: 'ding.mp3', at: T.yes + 0.02, db: -20},
    {f: 'confetti.wav', at: T.yes + 0.03, db: -21}, {f: 'pop.wav', at: T.yes + 0.08, db: -21},
    {f: 'pop.wav', at: T.yes2, db: -17},
    ...ctaCues(T.cta),
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{background: '#FBF7EC', overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<WheelScene t={0} />}>
        <WheelScene t={t} />
      </LoopOut>
      <AskBanner />
      <Look />
      <SoundLayer voice="wheel/vo/take1.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
