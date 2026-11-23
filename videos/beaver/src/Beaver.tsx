// "What if you had a beaver's teeth?" - shark formula (CLAUDE.md, Growth), niche: animal powers.
// (1) frame 0: he and a smug beaver gnaw the same birch from both sides, chips fly, CHOMP - the tree cracks and falls
//     behind the beaver (TIMBER), he throws his arms up; (2) close-up (1.45 s): his teeth shoot out (SHWING), curl down and
//     stab back into his own chin at 2.43 s (CRUNCH, INTO YOUR JAW);
// (3) X-RAY: BEAVER - the long curved incisors run deep into the skull, a glow runs from the roots (NEVER STOP GROWING), the
//     orange fronts (IRON); (4) the beaver gnaws through a thick branch while a stopwatch runs 0 -> 28 s, SNAP (UNDER 30 SECONDS);
// (5) his day: he feeds pencils into his teeth like a wood chipper, one a day (DAY 1, 2, 3 ... 365, EVERY DAY);
// (6) he stops, crosses his arms - X-RAY: YOUR TEETH, DAYS 0 -> 60, the upper incisor curls into the lower jaw (DANGER);
//     (7) he tries a burger: it BOINGs off his curled teeth (CAN'T EAT), the beaver laughs;
// (8) "So he never stops chewing": back at a new birch with the beaver = frame 0.
// All drawn in code; the guy is the code-drawn front-view body (butterfly / polar bear rig) with a 3/4 head so the teeth show.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Star} from './lib/kit';

// voice: tight.mp3 at 0.1 s (line 1 at 1.22, the rest at 1.12, sentence pauses 0.24 s; times are video time). Speech ends 17.05 s.
export const DURATION = 17.9;
export const T = {
  get: 0.10, teeth: 0.72, grow: 1.51, right: 1.84, into: 2.03, jaw: 2.43,                      // "Get a beaver's teeth, and they'd grow right into your jaw."
  front: 3.61, teeth2: 3.78, never: 4.36, stop: 4.64, growing: 4.93,                            // "A beaver's front teeth never stop growing."
  they: 5.56, cut: 5.83, thick: 6.33, branch: 6.61, under: 7.11, thirty: 7.47, seconds: 7.83,   // "They can cut through a thick branch in under thirty seconds."
  but: 8.60, gnaw: 9.35, every: 9.85, day: 10.17, wear: 10.60, down: 10.88,                    // "But it has to gnaw every day to wear them down."
  if: 11.47, stops: 11.69, grow2: 12.62, other: 13.26, jaw2: 13.47, cant: 14.19, eat: 14.55,    // "If it stops, they grow into its other jaw, and it can't eat."
  so: 15.09, never2: 15.91, stops2: 16.12, chewing: 16.48,                                      // "So he never stops chewing."
  cta: 9.0,
};
// beats (shot changes are hard cuts)
const FELL = 1.0;                                    // the birch cracks and falls behind the beaver
const S2 = 1.45, GROW0 = 1.55, GROW1 = 2.15, HOOK = 2.43;   // close-up: teeth shoot out, then curl into his chin
const S3 = 2.95;                                     // X-RAY: BEAVER
const S4 = 5.45, CHEW0 = 5.62, SNAP = 7.83;          // the beaver vs a thick branch
const S5 = 8.45;                                     // his day: a pencil a day
const S6 = 11.35, STOPT = 11.5, XR6 = 11.72, D0 = 12.0, D1 = 13.47;   // he stops: X-RAY: YOUR TEETH
const S6B = 14.0, BITE = 14.36;                      // the burger BOINGs off
const S7 = 15.0;                                     // back at a new birch
const PUSH = DURATION - LOOP_DUR;

const GOLD = '#FFD43B', RED = '#E2453C', FACE_C = '#F1EFEA';
const ORANGE = '#F3923A', ORANGE_DK = '#D46A1E', ORANGE_LT = '#FFC27E';
const FUR = '#A8754A', FUR_DK = '#7E5434', BELLY = '#D7A574', SNOUT = '#E9C59B', TAIL_C = '#5E4A3C', TAIL_LN = '#47372C';
const BIRCH = '#F5F2EA', BIRCH_SH = '#DCD6C8', WOOD = '#F1CF8E', WOOD_DK = '#D9AE62', BARK = '#8E7457', BARK_DK = '#6E5841';
const GRASS = '#BFE3A0', GRASS_DK = '#93C976', HILL = '#D5EDBC', LEAF = '#8FCB5C', LEAF_DK = '#5F9C3B', POND = '#9ED3E6', POND_DK = '#6FB6D2';
const XBODY = '#7193C6', BONE = '#E9F1FF', BONE_SH = '#B9CBEA';
const FONT_W = 900;
const TX = -40, TWD = 112;                 // the birch: centre x, width
const NY0 = -252, NY1 = -118, NYM = -185;  // the notch band (top, bottom, middle)
const GX = 112;                            // where he stands at the birch
const BX = -205, BSC = 0.9;                // the beaver at the birch
const PX = -1100;                          // the beaver's spot by the pond (the branch)
const DX = 1480, TBL_X = 1562, TBL_TOP = -128;   // the desk: him, the stump table, its top
const BDX = 1772;                          // the beaver beside the desk

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const rad = (d: number) => (d * Math.PI) / 180;
const rot2 = (p: P2, a: number): P2 => { const c = Math.cos(rad(a)), s = Math.sin(rad(a)); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; };
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={FONT_W} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const lidPath = (ex: number, ey: number, rx: number, ry: number, h: number) => {
  const y = ey - ry + 2 * ry * h, w = rx * Math.sqrt(Math.max(0, 1 - ((y - ey) / ry) ** 2));
  return `M ${(ex - w).toFixed(1)} ${y.toFixed(1)} A ${rx} ${ry} 0 ${h > 0.5 ? 1 : 0} 1 ${(ex + w).toFixed(1)} ${y.toFixed(1)} Z`;
};
const ik = (A: P2, F: P2, L1: number, L2: number, bend: number): P2 => {
  const dx = F[0] - A[0], dy = F[1] - A[1], D = Math.hypot(dx, dy) || 1;
  const d = Math.min(D, L1 + L2 - 0.01);
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
  const ux = dx / D, uy = dy / D;
  return [A[0] + ux * a - uy * h * bend, A[1] + uy * a + ux * h * bend];
};
const spiral = (cx: number, cy: number, r: number, a0: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 26; i++) { const u = i / 26, a = a0 + u * Math.PI * 4, rr = r * u; pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`); }
  return 'M ' + pts.join(' L ');
};
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
const pulse = (t: number, at: number, w = 6) => 1 + 0.12 * Math.max(0, 1 - Math.abs(t - at - 0.15) * w);

// ---------- the teeth: a thick curved bar that grows from the upper lip, straight first, then curling (clockwise) ----------
/** centreline of a tooth: start p0 heading h0 (deg, y down), straight for s0, then an arc of radius r turning clockwise */
const toothPts = (p0: P2, h0: number, s0: number, r: number, len: number, step = 3): P2[] => {
  const pts: P2[] = [p0];
  const n = Math.max(2, Math.ceil(len / step));
  for (let i = 1; i <= n; i++) {
    const s = (len * i) / n;
    if (s <= s0) pts.push([p0[0] + Math.cos(rad(h0)) * s, p0[1] + Math.sin(rad(h0)) * s]);
    else {
      const q: P2 = [p0[0] + Math.cos(rad(h0)) * s0, p0[1] + Math.sin(rad(h0)) * s0];
      const c: P2 = [q[0] + Math.cos(rad(h0 + 90)) * r, q[1] + Math.sin(rad(h0 + 90)) * r];
      const a = rad(h0 - 90) + (s - s0) / r;
      pts.push([c[0] + Math.cos(a) * r, c[1] + Math.sin(a) * r]);
    }
  }
  return pts;
};
const ptsD = (pts: P2[]) => 'M ' + pts.map(P).join(' L ');
const Tooth: React.FC<{pts: P2[]; w: number; dark?: boolean}> = ({pts, w, dark}) => {
  const d = ptsD(pts);
  return <g>
    <path d={d} stroke={INK} strokeWidth={w + 9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d={d} stroke={dark ? ORANGE_DK : ORANGE} strokeWidth={w} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    {dark ? null : <path d={d} stroke={ORANGE_LT} strokeWidth={w * 0.28} fill="none" strokeLinecap="round" strokeLinejoin="round" transform={`translate(${(-w * 0.22).toFixed(1)} 0)`} opacity={0.9} />}
  </g>;
};

// ---------- the guy's 3/4 head (facing +x; mirrored by dir) ----------
type Mood = 'joy' | 'happy' | 'smug' | 'focus' | 'pop' | 'ouch' | 'worry' | 'dizzy' | 'deadpan' | 'hope' | 'sad';
const HFX = 52, HFY = 27;                 // where the teeth leave the upper lip (head coords, facing +x)
// overgrown teeth = a J-hook: straight down past the chin, a half turn backwards, then straight up into the jaw
const J_LINE = 72, J_R = 20, J_UP = 42;
const TOOTH_N = 15, TOOTH_HOOK = J_LINE + Math.PI * J_R + J_UP;   // normal length; the length at which the tips are inside the jaw
const jPts = (p0: P2, h0: number, len: number): P2[] => {
  const pts: P2[] = [], n = Math.max(2, Math.ceil(len / 3)), h = rad(h0), dir: P2 = [Math.cos(h), Math.sin(h)];
  const q: P2 = [p0[0] + dir[0] * J_LINE, p0[1] + dir[1] * J_LINE];
  const c: P2 = [q[0] + Math.cos(h + Math.PI / 2) * J_R, q[1] + Math.sin(h + Math.PI / 2) * J_R];
  const e: P2 = [c[0] + Math.cos(h + Math.PI / 2) * J_R, c[1] + Math.sin(h + Math.PI / 2) * J_R];
  for (let i = 0; i <= n; i++) {
    const s = (len * i) / n;
    if (s <= J_LINE) pts.push([p0[0] + dir[0] * s, p0[1] + dir[1] * s]);
    else if (s <= J_LINE + Math.PI * J_R) { const a = h - Math.PI / 2 + (s - J_LINE) / J_R; pts.push([c[0] + Math.cos(a) * J_R, c[1] + Math.sin(a) * J_R]); }
    else { const s2 = s - J_LINE - Math.PI * J_R; pts.push([e[0] - dir[0] * s2, e[1] - dir[1] * s2]); }
  }
  return pts;
};
const headTeeth = (len: number): [P2[], P2[]] => [jPts([HFX - 8, HFY], 93, len), jPts([HFX, HFY], 91, len)];
const GFace: React.FC<{t: number; mood: Mood; uid: string; look?: number; lookY?: number; open?: number; tooth: number; blink?: number}> = ({t, mood, uid, look = 0, lookY = 0, open = 0, tooth, blink = 0}) => {
  const eye = (ex: number, rx: number, k: number) => {
    const ey = -12, ry = 15 * (rx / 12);
    if (mood === 'joy' || mood === 'happy') return <path key={k} d={`M ${ex - rx} ${ey + 4} Q ${ex} ${ey - 11} ${ex + rx} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    if (mood === 'ouch') return <path key={k} d={`M ${ex - rx} ${ey - 9} L ${ex + rx * 0.8} ${ey} L ${ex - rx} ${ey + 9}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    if (mood === 'dizzy') return <g key={k}><ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <path d={spiral(ex, ey, rx * 0.8, t * 9 * (k ? 1 : -1))} stroke={INK} strokeWidth={3.2} fill="none" strokeLinecap="round" /></g>;
    const big = mood === 'pop' ? 1.25 : 1;
    const lid = Math.max(blink, mood === 'smug' ? 0.45 : mood === 'focus' ? 0.36 : mood === 'deadpan' ? 0.52 : mood === 'sad' ? 0.3 : 0);
    const rxx = rx * big, ryy = ry * big;
    const px = 3 + look * 4, py = lookY * 4 + (mood === 'hope' ? -3 : 0);
    return <g key={k}>
      <ellipse cx={ex} cy={ey} rx={rxx} ry={ryy} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + px} cy={ey + 1 + lid * 6 + py} r={6.2 * (big > 1 ? 0.85 : 1) * (rx / 12)} fill={INK} />
      <circle cx={ex + px - 1.5} cy={ey - 1 + lid * 6 + py} r={2} fill="#fff" />
      {lid > 0.02 ? <path d={lidPath(ex, ey, rxx + 0.5, ryy + 0.5, Math.min(1, lid))} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
    </g>;
  };
  const brow = (bx: number, w: number, k: number) => {
    let d = `M ${bx - w} -44 Q ${bx} -52 ${bx + w} -46`;
    if (mood === 'focus' || mood === 'ouch') d = `M ${bx - w} -34 L ${bx + w} ${k ? -44 : -42}`;
    else if (mood === 'worry' || mood === 'dizzy' || mood === 'hope' || mood === 'sad') d = `M ${bx - w} -46 L ${bx + w} -37`;
    else if (mood === 'smug') d = `M ${bx - w} ${k ? -46 : -40} L ${bx + w} ${k ? -50 : -44}`;
    else if (mood === 'pop') d = `M ${bx - w} -52 Q ${bx} -62 ${bx + w} -54`;
    else if (mood === 'deadpan') d = `M ${bx - w} -38 L ${bx + w} -38`;
    return <path key={'b' + k} d={d} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  };
  // mouth: an opening under the upper lip line at the front of the face (open 0..1); the teeth hang from the lip
  const o = clamp(open), lipY = 26;
  const mouthOpen = mood === 'joy' || mood === 'pop' || mood === 'ouch' ? Math.max(o, mood === 'joy' ? 0.55 : 0.7) : o;
  const [tA, tB] = headTeeth(tooth);
  return (
    <g>
      <circle r={HEAD_R + 1} fill={`url(#bFace${uid})`} stroke={INK} strokeWidth={6.5} />
      {eye(4, 10, 0)}{eye(36, 12, 1)}{brow(4, 12, 0)}{brow(37, 13, 1)}
      {mouthOpen > 0.03
        ? <path d={`M 22 ${lipY} Q 40 ${lipY - 3} 62 ${lipY - 6} Q 58 ${lipY + 10 + 20 * mouthOpen} 40 ${lipY + 10 + 22 * mouthOpen} Q 26 ${lipY + 8 + 16 * mouthOpen} 22 ${lipY} Z`}
          fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        : mood === 'sad' || mood === 'worry' ? <path d={`M 24 ${lipY + 8} Q 40 ${lipY - 2} 58 ${lipY + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />
          : <path d={`M 22 ${lipY - 2} Q 40 ${lipY + 10} 61 ${lipY - 8}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />}
      <Tooth pts={tA} w={11} dark /><Tooth pts={tB} w={11} />
      {mood === 'ouch' ? [0, 1].map((i) => { const ph = (t * 1.6 + i * 0.5) % 1; return <path key={'tr' + i} d={`M ${50 + i * 4} ${-4 + 40 * ph} q 4 6 0 10 q -4 -4 0 -10 Z`} fill="#8FD3F5" stroke={INK} strokeWidth={2.5} opacity={1 - ph} />; }) : null}
    </g>
  );
};

// ---------- the guy: front-view body on the small IK rig (feet at 0), 3/4 head facing dir ----------
type GS = {x: number; y: number; rot: number; lean: number; dir: number; armA: P2; armB: P2; mood: Mood; look: number; lookY: number;
  sq: number; tilt: number; trem: number; open: number; tooth: number; blink: number; legs: boolean; hide: number;
  pencil: number; burger: P2 | null};
const SHX = 38;
const Limb: React.FC<{S: P2; H: P2; L: number; sd: number; w?: number; hand?: boolean}> = ({S, H, L, sd, w = 29, hand = true}) => {
  const E = ik(S, H, L, L, -sd * (H[1] < S[1] ? 1 : -1));
  const C: P2 = [2 * E[0] - (S[0] + H[0]) / 2, 2 * E[1] - (S[1] + H[1]) / 2];
  const d = `M ${P(S)} Q ${P(C)} ${P(H)}`;
  return <g>
    <path d={d} stroke={INK} strokeWidth={w} fill="none" strokeLinecap="round" />
    <path d={d} stroke="#FFFFFF" strokeWidth={w - 11} fill="none" strokeLinecap="round" />
    {hand ? <circle cx={H[0]} cy={H[1]} r={13} fill="#FFFFFF" stroke={INK} strokeWidth={5.5} /> : null}
  </g>;
};
const torsoD = (tw: number, top: number, bot: number) => {
  const h = bot - top, r1 = Math.min(34, h * 0.3), r2 = Math.min(29, h * 0.26), sw = tw * 0.6;
  return `M ${-sw} ${top} C ${-tw + 5} ${top + r1 * 0.18} ${-tw} ${top + r1 * 0.5} ${-tw} ${top + r1} L ${-tw + 1} ${bot - r2} Q ${-tw + 1} ${bot} ${-tw + r2} ${bot} ` +
    `L ${tw - r2} ${bot} Q ${tw - 1} ${bot} ${tw - 1} ${bot - r2} L ${tw} ${top + r1} C ${tw} ${top + r1 * 0.5} ${tw - 5} ${top + r1 * 0.18} ${sw} ${top} Z`;
};
const HIPY = -70, SHY = -182, HEADY = -235;
/** world position of a point given in his head coords (facing +x before the dir mirror) */
const headPt = (g: GS, p: P2): P2 => {
  const local: P2 = [g.dir * p[0], p[1]];
  const tilted = rot2(local, g.tilt);
  const inHead: P2 = [tilted[0], HEADY + tilted[1]];
  const leaned = rot2([inHead[0], inHead[1] - HIPY], g.lean);
  const body: P2 = [leaned[0], leaned[1] + HIPY];
  const r = rot2(body, g.rot);
  return [g.x + r[0], g.y + r[1]];
};
const handWorld = (g: GS, sd: number): P2 => {
  const S: P2 = [sd * SHX, SHY + 22]; const H = add(S, sd < 0 ? g.armA : g.armB);
  const leaned = rot2([H[0], H[1] - HIPY], g.lean); const r = rot2([leaned[0], leaned[1] + HIPY], g.rot);
  return [g.x + r[0], g.y + r[1]];
};
const Pencil: React.FC<{len: number; dir: number}> = ({len, dir}) => len < 1 ? null : (   // drawn from the eraser end (0,0) toward +x*dir
  <g transform={`scale(${dir} 1)`}>
    <rect x={0} y={-9} width={Math.max(0, len - 22)} height={18} fill="#FFD43B" stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />
    <path d={`M 0 -9 L 0 9`} stroke={INK} strokeWidth={4.5} />
    {len > 22 ? <path d={`M ${len - 22} -9 L ${len} 0 L ${len - 22} 9 Z`} fill={WOOD} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}
    {len > 22 ? <path d={`M ${len - 7} -3 L ${len} 0 L ${len - 7} 3 Z`} fill={INK} /> : null}
    <rect x={-16} y={-9} width={16} height={18} rx={4} fill="#F28CA0" stroke={INK} strokeWidth={4.5} />
  </g>
);
const Burger: React.FC<{p: P2; rot?: number; s?: number}> = ({p, rot = 0, s = 1}) => (
  <g transform={`translate(${P(p)}) rotate(${rot.toFixed(1)}) scale(${s})`}>
    <path d="M -40 -4 Q -40 -38 0 -40 Q 40 -38 40 -4 Z" fill="#E8A65A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
    {[[-18, -26], [2, -32], [18, -22], [-4, -18]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={3} ry={2} fill="#FFF3D6" />)}
    <path d="M -44 -2 Q -30 6 -18 -1 Q -4 7 8 -1 Q 22 7 34 -1 Q 42 4 46 -2 L 44 4 L -44 4 Z" fill="#7DC75A" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={-42} y={3} width={84} height={14} rx={7} fill="#8B4A2B" stroke={INK} strokeWidth={4.5} />
    <path d="M -40 17 Q -40 34 0 34 Q 40 34 40 17 Z" fill="#E8A65A" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g>
);
const GuyB: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  if (g.hide >= 1) return null;
  const jig = g.trem * 2.4 * Math.sin(t * 71);
  const SA: P2 = [-SHX, SHY + 22], SB: P2 = [SHX, SHY + 22];
  const feet: P2[] = [[-27, -12], [27, -12]];
  const headT = `translate(0 ${(HEADY + HEAD_R).toFixed(1)}) rotate(${g.tilt.toFixed(2)} 0 ${-HEAD_R}) scale(${(1 + 0.1 * g.sq).toFixed(3)} ${(1 - 0.16 * g.sq).toFixed(3)}) translate(0 ${-HEAD_R})`;
  const HB = add(SB, g.armB), HA = add(SA, g.armA);
  return (
    <W><g transform={`translate(${(g.x + jig).toFixed(1)} ${g.y.toFixed(1)}) rotate(${g.rot.toFixed(2)})`}>
      {g.legs ? feet.map((f, i) => <Limb key={'l' + i} S={[(i ? 1 : -1) * 19, HIPY + 4]} H={f} L={37} sd={i ? -1 : 1} w={30} hand={false} />) : null}
      {g.legs ? feet.map((f, i) => <ellipse key={'f' + i} cx={f[0] + (i ? 2 : -2) + g.dir * 6} cy={f[1] + 5} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />) : null}
      <g transform={`rotate(${g.lean.toFixed(2)} 0 ${HIPY})`}>
        <path d={torsoD(47, SHY, HIPY + 13)} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
        <Limb S={SA} H={HA} L={77} sd={g.armA[1] > 0 ? 1 : -1} />
        <g transform={headT}>
          <g transform={`scale(${g.dir} 1)`}>
            <GFace t={t} mood={g.mood} uid={uid} look={g.look} lookY={g.lookY} open={g.open} tooth={g.tooth} blink={g.blink} />
          </g>
        </g>
        {g.pencil > 0 ? <g transform={`translate(${P(HB)})`}><Pencil len={g.pencil} dir={-g.dir} /></g> : null}
        <Limb S={SB} H={HB} L={77} sd={g.armB[1] > 0 ? -1 : 1} />
        {g.burger ? <Burger p={g.burger} /> : null}
      </g>
    </g></W>
  );
};

// ---------- the beaver: side view facing +x (mirrored by dir), feet at 0 ----------
type BMood = 'smug' | 'chomp' | 'look' | 'laugh' | 'pop' | 'proud';
type BS = {x: number; y: number; s: number; dir: number; mood: BMood; open: number; handA: P2; handB: P2; sq: number; tilt: number; shake: number; hide: number; tailUp: number};
const BHEAD: P2 = [48, -200];
const beaverMouth = (B: BS): P2 => { const p: P2 = [B.dir * 106 * B.s, -164 * B.s]; return [B.x + p[0], B.y + p[1]]; };
const Beaver: React.FC<{t: number; B: BS}> = ({t, B}) => {
  if (B.hide >= 1) return null;
  const jig = B.shake * 3 * Math.sin(t * 60);
  const o = clamp(B.open);
  const lid = B.mood === 'smug' || B.mood === 'proud' ? 0.5 : B.mood === 'chomp' ? 0.32 : 0;
  const eye = B.mood === 'laugh'
    ? <path d="M 52 -220 Q 62 -232 72 -220" stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
    : B.mood === 'pop'
      ? <g><ellipse cx={62} cy={-222} rx={14} ry={16} fill="#FFFFFF" stroke={INK} strokeWidth={5} /><circle cx={66} cy={-220} r={6.5} fill={INK} /></g>
      : <g><ellipse cx={62} cy={-220} rx={10} ry={12} fill={INK} /><circle cx={59} cy={-224} r={3.4} fill="#FFFFFF" />
        {lid ? <path d={lidPath(62, -220, 11.5, 13.5, lid)} fill={FUR} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}</g>;
  const brow = B.mood === 'smug' || B.mood === 'proud' ? 'M 46 -244 L 76 -240' : B.mood === 'chomp' ? 'M 46 -238 L 76 -244' : B.mood === 'pop' ? 'M 46 -248 Q 62 -258 78 -248' : 'M 48 -244 Q 62 -250 76 -244';
  const sh: P2 = [42, -142];
  const tailRot = -6 - 30 * B.tailUp + 3 * Math.sin(t * 3);
  return (
    <W><g transform={`translate(${(B.x + jig).toFixed(1)} ${B.y.toFixed(1)}) scale(${(B.dir * B.s * (1 + 0.08 * B.sq)).toFixed(3)} ${(B.s * (1 - 0.14 * B.sq)).toFixed(3)}) rotate(${B.tilt.toFixed(2)} 0 0)`}>
      {/* tail (flat paddle, scaly) */}
      <g transform={`rotate(${tailRot.toFixed(1)} -40 -20)`}>
        <ellipse cx={-118} cy={-16} rx={74} ry={21} fill={TAIL_C} stroke={INK} strokeWidth={6} />
        <clipPath id="bvTail"><ellipse cx={-118} cy={-16} rx={71} ry={18} /></clipPath>
        <g clipPath="url(#bvTail)">{Array.from({length: 9}, (_, i) => <path key={i} d={`M ${-200 + i * 20} -40 l 30 50 M ${-170 + i * 20} -40 l -30 50`} stroke={TAIL_LN} strokeWidth={3} />)}</g>
      </g>
      {/* back foot */}
      <ellipse cx={-22} cy={-7} rx={30} ry={11} fill={FUR_DK} stroke={INK} strokeWidth={5.5} />
      {/* body */}
      <path d="M -72 -46 C -84 -126 -42 -186 18 -188 C 72 -190 94 -130 84 -62 C 78 -20 42 0 2 0 C -40 0 -68 -14 -72 -46 Z" fill={FUR} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d="M 40 -150 C 70 -130 74 -60 52 -22 C 38 -8 18 -6 10 -14 C 30 -50 34 -110 40 -150 Z" fill={BELLY} />
      <path d="M -40 -150 q 10 -16 24 -18 M -54 -100 q 10 -14 22 -14" stroke={FUR_DK} strokeWidth={4} fill="none" strokeLinecap="round" />
      {/* front foot */}
      <ellipse cx={26} cy={-7} rx={30} ry={11} fill={FUR_DK} stroke={INK} strokeWidth={5.5} />
      {/* head */}
      <circle cx={18} cy={-246} r={14} fill={FUR_DK} stroke={INK} strokeWidth={5} />
      <circle cx={BHEAD[0]} cy={BHEAD[1]} r={56} fill={FUR} stroke={INK} strokeWidth={6} />
      {/* lower jaw (drops when it chomps / laughs) */}
      <g transform={`rotate(${(14 * (B.mood === 'laugh' ? 0.8 : o)).toFixed(1)} 70 -176)`}>
        <path d="M 66 -176 Q 96 -160 112 -168 Q 104 -152 84 -150 Q 70 -152 66 -176 Z" fill={SNOUT} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </g>
      {/* snout, nose, teeth, whiskers */}
      <rect x={97} y={-176} width={11} height={24} rx={3} fill={ORANGE_DK} stroke={INK} strokeWidth={4} />
      <rect x={104} y={-176} width={11} height={25} rx={3} fill={ORANGE} stroke={INK} strokeWidth={4} />
      <ellipse cx={96} cy={-190} rx={32} ry={23} fill={SNOUT} stroke={INK} strokeWidth={5} />
      <ellipse cx={124} cy={-200} rx={11} ry={8.5} fill={INK} />
      <path d="M 100 -186 L 136 -194 M 100 -182 L 138 -182 M 100 -178 L 134 -170" stroke={INK} strokeWidth={2.5} strokeLinecap="round" />
      {eye}
      <path d={brow} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
      {/* arms */}
      {[B.handB, B.handA].map((h, i) => <g key={'a' + i}>
        <path d={`M ${P(sh)} Q ${P(lp2(sh, h, 0.5))} ${P(h)}`} stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d={`M ${P(sh)} Q ${P(lp2(sh, h, 0.5))} ${P(h)}`} stroke={i ? FUR : FUR_DK} strokeWidth={15} fill="none" strokeLinecap="round" />
        <circle cx={h[0]} cy={h[1]} r={11} fill={i ? FUR_DK : TAIL_C} stroke={INK} strokeWidth={4.5} />
      </g>)}
    </g></W>
  );
};

// ---------- the birch (gnawed into an hourglass; the top falls about the left notch edge) ----------
const notchIn = (y: number, depth: number) => {        // inset of each side at height y
  if (y < NY0 || y > NY1) return 0;
  const u = (y - NY0) / (NY1 - NY0), tri = 1 - Math.abs(2 * u - 1);
  return depth * (TWD * 0.47) * Math.pow(tri, 0.85);
};
const trunkSide = (y0: number, y1: number, depth: number, sd: number): P2[] => {
  const pts: P2[] = [];
  for (let i = 0; i <= 24; i++) { const y = lerp(y0, y1, i / 24); pts.push([TX + sd * (TWD / 2 - notchIn(y, depth)), y]); }
  return pts;
};
const BIRCH_MARKS: [number, number, number][] = Array.from({length: 30}, (_, i) => [(rnd(i + 3) - 0.5) * 70, -20 - i * 72 - rnd(i + 9) * 30, 14 + rnd(i + 5) * 22]);
const Marks: React.FC<{y0: number; y1: number}> = ({y0, y1}) => <>{BIRCH_MARKS.filter(([, y]) => y < y1 && y > y0).map(([x, y, w], i) =>
  <path key={i} d={`M ${TX + x - w / 2} ${y} q ${w / 2} -5 ${w} 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />)}</>;
const Birch: React.FC<{depth: number; fall: number}> = ({depth, fall}) => {
  const top = -2400;
  const lower = [...trunkSide(NYM, 0, depth, -1), ...trunkSide(NYM, 0, depth, 1).reverse()];
  const upper = [...trunkSide(top, NYM, depth, -1), ...trunkSide(top, NYM, depth, 1).reverse()];
  const hinge: P2 = [TX - (TWD / 2 - notchIn(NYM, depth)), NYM];
  const chew = (pts: P2[], k: number) => pts.filter((p) => p[1] > NY0 + 6 && p[1] < NY1 - 6 && notchIn(p[1], depth) > 6).filter((_, i) => i % 3 === k);
  return <g>
    <path d={'M ' + lower.map(P).join(' L ') + ' Z'} fill={BIRCH} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d={`M ${TX + 26} -10 L ${TX + 26} ${NY1 + 4}`} stroke={BIRCH_SH} strokeWidth={12} strokeLinecap="round" />
    {depth > 0.02 ? <path d={'M ' + trunkSide(NY0, NY1, depth, 1).filter((p) => p[1] >= NYM).map(P).join(' L ')} stroke={WOOD_DK} strokeWidth={0} fill="none" /> : null}
    {depth > 0.02 ? [-1, 1].map((sd) => { const pts = trunkSide(NYM, NY1, depth, sd); return <path key={'w' + sd} d={'M ' + pts.map(P).join(' L ') + ` L ${TX + sd * (TWD / 2)} ${NY1} L ${TX + sd * (TWD / 2)} ${NYM} Z`} fill={WOOD} stroke="none" />; }) : null}
    {depth > 0.02 ? [-1, 1].map((sd) => chew(trunkSide(NYM, NY1, depth, sd), 1).map((p, i) => <path key={sd + 'c' + i} d={`M ${p[0] - sd * 2} ${p[1] - 5} l ${sd * 14} 4`} stroke={WOOD_DK} strokeWidth={3} strokeLinecap="round" />)) : null}
    <Marks y0={NYM + 10} y1={-10} />
    <path d={'M ' + lower.map(P).join(' L ') + ' Z'} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <g transform={`rotate(${fall.toFixed(2)} ${P(hinge)})`}>
      <path d={'M ' + upper.map(P).join(' L ') + ' Z'} fill={BIRCH} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      <path d={`M ${TX + 26} ${top + 20} L ${TX + 26} ${NY0 - 4}`} stroke={BIRCH_SH} strokeWidth={12} strokeLinecap="round" />
      {depth > 0.02 ? [-1, 1].map((sd) => { const pts = trunkSide(NY0, NYM, depth, sd); return <path key={'u' + sd} d={'M ' + pts.map(P).join(' L ') + ` L ${TX + sd * (TWD / 2)} ${NYM} L ${TX + sd * (TWD / 2)} ${NY0} Z`} fill={WOOD} stroke="none" />; }) : null}
      {depth > 0.02 ? [-1, 1].map((sd) => chew(trunkSide(NY0, NYM, depth, sd), 2).map((p, i) => <path key={sd + 'd' + i} d={`M ${p[0] - sd * 2} ${p[1] - 5} l ${sd * 14} 4`} stroke={WOOD_DK} strokeWidth={3} strokeLinecap="round" />)) : null}
      <Marks y0={top} y1={NY0 - 10} />
      <path d={'M ' + upper.map(P).join(' L ') + ' Z'} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      {/* leaves high up (only seen as the tree falls) */}
      {[[-260, 0], [-120, -60], [40, -10], [-60, 90]].map(([dx, dy], i) => <circle key={'lf' + i} cx={TX + dx * 0.6 + 30} cy={top + 120 + dy} r={120 - i * 12} fill={i % 2 ? LEAF : LEAF_DK} stroke={INK} strokeWidth={6} />)}
    </g>
  </g>;
};
const Stump: React.FC = () => {
  const pts = trunkSide(NYM, 0, 1, -1), pr = trunkSide(NYM, 0, 1, 1).reverse();
  return <g>
    <path d={'M ' + [...pts, ...pr].map(P).join(' L ') + ' Z'} fill={BIRCH} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-1, 1].map((sd) => { const q = trunkSide(NYM, NY1, 1, sd); return <path key={sd} d={'M ' + q.map(P).join(' L ') + ` L ${TX + sd * (TWD / 2)} ${NY1} L ${TX + sd * (TWD / 2)} ${NYM} Z`} fill={WOOD} />; })}
    <Marks y0={NYM + 10} y1={-10} />
    <path d={'M ' + [...pts, ...pr].map(P).join(' L ') + ' Z'} fill="none" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
  </g>;
};

// ---------- flying wood chips (seeded, gravity, spin) ----------
type Src = {p: P2; t0: number; t1: number; rate: number; vx: number; seed: number; col?: string; size?: number};
const Chips: React.FC<{t: number; srcs: Src[]}> = ({t, srcs}) => {
  const out: React.ReactNode[] = [];
  srcs.forEach((s, si) => {
    const n = Math.floor((s.t1 - s.t0) * s.rate);
    for (let i = 0; i < n; i++) {
      const born = s.t0 + i / s.rate, tau = t - born;
      if (tau < 0 || tau > 0.62) continue;
      const r1 = rnd(s.seed + i * 3.1), r2 = rnd(s.seed + i * 5.7), r3 = rnd(s.seed + i * 1.3);
      const vx = s.vx * (0.5 + r1), vy = -260 - 260 * r2;
      const x = s.p[0] + vx * tau, y = s.p[1] + vy * tau + 0.5 * 1500 * tau * tau;
      const sz = (s.size ?? 1) * (7 + 6 * r3) * (1 - 0.4 * seg(tau, 0.4, 0.62));
      out.push(<g key={si + '_' + i} transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${(r1 * 360 + tau * 720 * (r2 - 0.5)).toFixed(0)})`}>
        <path d={`M ${-sz} ${-sz * 0.45} L ${sz * 0.9} ${-sz * 0.6} L ${sz} ${sz * 0.4} L ${-sz * 0.8} ${sz * 0.5} Z`} fill={s.col ?? WOOD} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />
      </g>);
    }
  });
  return <W>{out}</W>;
};

// ---------- the thick branch the beaver cuts (vertical, held at its middle) ----------
const BRW = 46;
const Branch: React.FC<{x: number; yTop: number; yBot: number; notch: number; snapT: number; t: number}> = ({x, yTop, yBot, notch, snapT, t}) => {
  const cy = -158, half = 34;
  const side = (y0: number, y1: number, sd: number): P2[] => Array.from({length: 13}, (_, i) => {
    const y = lerp(y0, y1, i / 12); const u = (y - (cy - half)) / (2 * half); const tri = u < 0 || u > 1 ? 0 : 1 - Math.abs(2 * u - 1);
    return [x + sd * (BRW / 2 - notch * BRW * 0.48 * tri), y] as P2;
  });
  const lowerPts = [...side(cy, yBot, -1), ...side(cy, yBot, 1).reverse()];
  const upperPts = [...side(yTop, cy, -1), ...side(yTop, cy, 1).reverse()];
  const u = clamp((t - snapT) / 0.55);
  const upT = t < snapT ? '' : `translate(${(120 * u).toFixed(1)} ${(-160 * u + 420 * u * u).toFixed(1)}) rotate(${(200 * u).toFixed(1)} ${x} ${cy})`;
  const bark = (pts: P2[], key: string) => <g key={key}>
    <path d={'M ' + pts.map(P).join(' L ') + ' Z'} fill={BARK} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    {[0.2, 0.45, 0.7].map((f, i) => <path key={i} d={`M ${x - 10} ${lerp(pts[0][1], pts[12][1], f)} q 8 -12 18 -6`} stroke={BARK_DK} strokeWidth={4} fill="none" strokeLinecap="round" />)}
  </g>;
  return <g>
    {bark(lowerPts, 'lo')}
    {notch > 0.03 ? <path d={'M ' + side(cy, cy + half, -1).map(P).join(' L ') + ' L ' + side(cy, cy + half, 1).reverse().map(P).join(' L ') + ' Z'} fill={WOOD} /> : null}
    <g transform={upT}>
      {bark(upperPts, 'up')}
      {notch > 0.03 ? <path d={'M ' + side(cy - half, cy, -1).map(P).join(' L ') + ' L ' + side(cy - half, cy, 1).reverse().map(P).join(' L ') + ' Z'} fill={WOOD} /> : null}
    </g>
  </g>;
};

// ---------- X-ray panels ----------
const XR_Y = 1000, XR_R = 330;
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
const XWrap: React.FC<{s: number; children: React.ReactNode}> = ({s, children}) => s > 0.01 ? (
  <div style={{position: 'absolute', left: 540 - 450, top: XR_Y - 450, width: 900, height: 900, transform: `scale(${s.toFixed(3)})`}}>{children}</div>) : null;
/** a glowing band that runs along a path (growth from the root) */
const GlowRun: React.FC<{d: string; u: number; w: number}> = ({d, u, w}) => u <= 0 || u >= 1 ? null :
  <path d={d} pathLength={1} stroke="#FFF2B8" strokeWidth={w} fill="none" strokeLinecap="round" strokeDasharray={`0.16 2`} strokeDashoffset={-(u * 1.1 - 0.16)} opacity={0.95} />;
// X-RAY: BEAVER (a side view of its skull; the incisors are long arcs rooted deep in the bone)
const BV_UP = 'M -2 -48 Q 150 -46 180 58', BV_LO = 'M -96 76 Q 120 110 168 50';
const BeaverXRay: React.FC<{t: number; s: number}> = ({t, s}) => {
  const draw = eout(seg(t, S3 + 0.12, S3 + 0.55));
  const glow1 = seg(t, 3.55, 4.25), glow2 = seg(t, 4.4, 5.1);
  const iron = popIn(t, 4.98, 0.25);
  return <XWrap s={s}><XFrame id="xrB" R={XR_R}>
    <g transform="translate(-36 -6) scale(1.22)" opacity={draw}>
      {/* the head's outline */}
      <path d="M -250 40 C -270 -110 -170 -190 -40 -190 C 80 -190 150 -140 210 -80 C 246 -46 262 -10 250 20 C 236 60 200 80 170 96 C 90 140 -120 160 -200 120 C -236 102 -246 76 -250 40 Z"
        fill="none" stroke={XBODY} strokeWidth={6} strokeDasharray="14 10" opacity={0.85} />
      {/* skull */}
      <path d="M -210 30 C -220 -80 -150 -150 -40 -150 C 60 -150 120 -110 170 -60 C 200 -30 214 -6 206 14 L 150 30 L 20 26 L -120 44 Z" fill={BONE} stroke={BONE_SH} strokeWidth={6} strokeLinejoin="round" opacity={0.95} />
      <circle cx={40} cy={-76} r={34} fill="#16223A" stroke={BONE_SH} strokeWidth={6} />
      <path d="M -40 -6 Q 30 -34 110 -6" stroke={BONE_SH} strokeWidth={10} fill="none" strokeLinecap="round" />
      {/* lower jaw */}
      <path d="M -170 40 C -180 90 -150 130 -80 128 L 150 98 C 176 92 184 70 170 58 L 120 62 L -60 66 Z" fill={BONE} stroke={BONE_SH} strokeWidth={6} strokeLinejoin="round" opacity={0.95} />
      {/* molars */}
      {[-20, 14, 48, 82].map((x, i) => <g key={i}><rect x={x} y={18} width={28} height={22} rx={5} fill="#FFFFFF" stroke={BONE_SH} strokeWidth={4} />
        <rect x={x} y={46} width={28} height={20} rx={5} fill="#FFFFFF" stroke={BONE_SH} strokeWidth={4} /></g>)}
      {/* incisors: long curved roots inside the bone, orange fronts outside */}
      {[BV_LO, BV_UP].map((d, i) => <g key={'in' + i}>
        <path d={d} stroke={INK} strokeWidth={36} fill="none" strokeLinecap="round" />
        <path d={d} stroke="#FBE7C6" strokeWidth={26} fill="none" strokeLinecap="round" />
        <path d={d} pathLength={1} strokeDasharray="0.34 2" strokeDashoffset={-0.66} stroke={ORANGE} strokeWidth={26} fill="none" strokeLinecap="round" />
      </g>)}
      <GlowRun d={BV_UP} u={glow1} w={16} /><GlowRun d={BV_LO} u={glow1} w={16} />
      <GlowRun d={BV_UP} u={glow2} w={16} /><GlowRun d={BV_LO} u={glow2} w={16} />
      {/* growth arrows at the roots */}
      {t > 3.5 ? [[-6, -48, 0], [-96, 76, 10]].map(([x, y, r], i) => <g key={'ar' + i} transform={`translate(${x} ${y}) rotate(${r})`} opacity={seg(t, 3.5, 3.7)}>
        <path d={`M ${-46 - 10 * Math.sin(t * 8)} 0 L ${-14 - 10 * Math.sin(t * 8)} 0`} stroke={GOLD} strokeWidth={9} strokeLinecap="round" />
        <path d={`M ${-22 - 10 * Math.sin(t * 8)} -12 L ${-8 - 10 * Math.sin(t * 8)} 0 L ${-22 - 10 * Math.sin(t * 8)} 12`} stroke={GOLD} strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>) : null}
      {iron > 0.01 ? <g transform={`translate(232 104) scale(${iron})`}><path d="M -40 -20 L -64 -36" stroke="#FFFFFF" strokeWidth={6} strokeLinecap="round" /></g> : null}
    </g>
  </XFrame></XWrap>;
};
// X-RAY: YOUR TEETH (his round skull from the side; the teeth curl as DAYS count up)
const YS = 2.6;                                             // head coords -> panel scale
const YourXRay: React.FC<{t: number; s: number; len: number; bad: number}> = ({t, s, len, bad}) => {
  const draw = eout(seg(t, XR6 + 0.1, XR6 + 0.5));
  const [tA, tB] = headTeeth(len);
  const tip = tB[tB.length - 1];
  const jawFill = bad > 0.01 ? `rgb(${lerp(233, 255, bad).toFixed(0)},${lerp(241, 140, bad).toFixed(0)},${lerp(255, 140, bad).toFixed(0)})` : BONE;
  return <XWrap s={s}><XFrame id="xrY" R={XR_R}>
    <g transform={`translate(-70 -110) scale(${YS})`} opacity={draw}>
      <circle cx={0} cy={0} r={HEAD_R} fill="none" stroke={XBODY} strokeWidth={2.4} strokeDasharray="6 4" opacity={0.85} />
      {/* skull: cranium + cheek, eye sockets */}
      <path d="M -50 30 C -60 -20 -34 -54 4 -55 C 40 -56 58 -28 58 6 C 58 16 56 22 50 24 L 20 26 Z" fill={BONE} stroke={BONE_SH} strokeWidth={2.4} strokeLinejoin="round" opacity={0.95} />
      <ellipse cx={36} cy={-12} rx={11} ry={13} fill="#16223A" stroke={BONE_SH} strokeWidth={2.4} />
      <ellipse cx={6} cy={-12} rx={8} ry={11} fill="#16223A" stroke={BONE_SH} strokeWidth={2.4} />
      {/* lower jaw */}
      <path d="M -40 34 C -42 52 -24 62 4 62 C 30 62 50 54 56 44 C 58 38 56 35 52 34 L 18 33 Z" fill={jawFill} stroke={BONE_SH} strokeWidth={2.4} strokeLinejoin="round" opacity={0.95} />
      {[-22, -10, 2, 14].map((x, i) => <g key={i}><rect x={x} y={24} width={10} height={7} rx={2} fill="#FFFFFF" stroke={BONE_SH} strokeWidth={1.6} />
        <rect x={x} y={34} width={10} height={6} rx={2} fill="#FFFFFF" stroke={BONE_SH} strokeWidth={1.6} /></g>)}
      <Tooth pts={tA} w={8} dark /><Tooth pts={tB} w={8} />
      {bad > 0.01 ? <g transform={`translate(${P(tip)})`} opacity={bad}>
        <circle r={13 + 3 * Math.sin(t * 20)} fill={RED} opacity={0.5} />
        {[0, 72, 144, 216, 288].map((a) => <path key={a} d={`M 0 0 L ${12 * Math.cos(rad(a))} ${12 * Math.sin(rad(a))} l ${4 * Math.cos(rad(a + 40))} ${4 * Math.sin(rad(a + 40))}`} stroke={RED} strokeWidth={2.2} fill="none" strokeLinecap="round" />)}
      </g> : null}
    </g>
  </XFrame></XWrap>;
};

// ---------- set ----------
const Tuft: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) =>
  <path d={`M ${x - 18 * s} ${y} q ${4 * s} ${-26 * s} ${10 * s} ${-34 * s} q ${2 * s} ${18 * s} ${6 * s} ${30 * s} q ${4 * s} ${-22 * s} ${14 * s} ${-28 * s} q ${-2 * s} ${16 * s} ${4 * s} ${28 * s} Z`} fill={GRASS_DK} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" />;
const BgTree: React.FC<{x: number; s: number; birch?: boolean}> = ({x, s, birch}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <rect x={-22} y={-330} width={44} height={330} fill={birch ? BIRCH : BARK} stroke={INK} strokeWidth={6} />
    {birch ? [[-6, -80], [8, -170], [-4, -260]].map(([dx, y], i) => <path key={i} d={`M ${dx - 10} ${y} q 10 -5 20 0`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />) : null}
    {[[-70, -360, 90], [60, -380, 96], [-10, -460, 110], [0, -330, 80]].map(([dx, dy, r], i) => <circle key={'c' + i} cx={dx} cy={dy} r={r} fill={i % 2 ? LEAF : LEAF_DK} stroke={INK} strokeWidth={6} />)}
    {[[-70, -360, 90], [60, -380, 96], [-10, -460, 110], [0, -330, 80]].map(([dx, dy, r], i) => <circle key={'f' + i} cx={dx} cy={dy} r={r - 3} fill={i % 2 ? LEAF : LEAF_DK} />)}
  </g>
);
const Lodge: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} 0)`}>
    <path d="M -240 0 Q -200 -210 0 -230 Q 200 -210 240 0 Z" fill="#9A7A57" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {Array.from({length: 14}, (_, i) => { const a = -170 + i * 12, r = 150 + (i % 3) * 30; return <path key={i} d={`M ${r * Math.cos(rad(a)) * 0.9} ${r * Math.sin(rad(a)) * 0.75} l ${40 + (i % 2) * 20} ${-14 + (i % 3) * 8}`} stroke="#6E5841" strokeWidth={9} strokeLinecap="round" />; })}
  </g>
);

// ---------- the story over time ----------
const baseG = (): GS => ({x: GX, y: 0, rot: 0, lean: 0, dir: -1, armA: [-30, 112], armB: [30, 112], mood: 'smug', look: 0, lookY: 0,
  sq: 0, tilt: 0, trem: 0, open: 0, tooth: TOOTH_N, blink: 0, legs: true, hide: 0, pencil: 0, burger: null});
const chompOpen = (t: number, hz = 6.2) => 0.5 + 0.5 * Math.sin(2 * Math.PI * hz * t);
const gnawAtTree = (g: GS, t: number) => {
  g.lean = -12 + 1.5 * Math.sin(t * 12.4); g.mood = 'focus'; g.open = chompOpen(t); g.tilt = -4 + 3 * Math.sin(2 * Math.PI * 6.2 * t);
  g.armA = [-60, 30]; g.armB = [-98, 74]; g.look = 1;
};
// pencils at the desk: [start, end] of each pencil (the hand reaches to the cup between them)
const PENCILS: [number, number][] = [[8.55, 9.35], [9.55, 10.15], [10.3, 10.75], [10.85, 11.22]];
const PEN_L = 150;
const guyAt = (t: number): GS => {
  const g = baseG();
  if (t < S2) {           // frame 0: gnawing the birch; it cracks, he throws his arms up
    gnawAtTree(g, t);
    if (t > FELL) {
      const u = eout(seg(t, FELL, FELL + 0.3));
      g.lean = lerp(-12, 0, u); g.tilt = lerp(-4, 0, u); g.open = 0; g.look = 0;
      g.mood = t < FELL + 0.14 ? 'pop' : 'joy';
      g.armA = lp2([-60, 30], [-62, -112], u); g.armB = lp2([-98, 74], [62, -112], u);
    }
    return g;
  }
  if (t < S3) {           // close-up: the teeth shoot out, then curl into his chin
    g.armA = [-62, -112]; g.armB = [62, -112];
    const k = eout(seg(t, S2, S2 + 0.35)); g.armA = lp2([-62, -112], [-34, 104], k); g.armB = lp2([62, -112], [34, 104], k);
    g.mood = t < GROW0 ? 'joy' : t < HOOK ? 'pop' : 'ouch'; g.lookY = t > GROW0 && t < HOOK ? 1 : 0; g.look = -0.3;
    g.tooth = lerp(TOOTH_N, J_LINE + 6, eout(seg(t, GROW0, GROW0 + 0.26))) + lerp(0, TOOTH_HOOK - J_LINE - 6, eio(seg(t, GROW1, HOOK)));
    g.trem = t > HOOK ? 0.8 : 0; g.sq = t > HOOK ? Math.max(0, Math.exp(-6 * (t - HOOK)) * Math.cos((t - HOOK) * 26)) * 0.5 : 0;
    g.tilt = t > HOOK ? 6 * Math.sin((t - HOOK) * 18) * Math.exp(-3 * (t - HOOK)) : 0;
    return g;
  }
  if (t < S5) { g.hide = 1; return g; }
  g.x = DX; g.dir = 1; g.legs = false; g.y = -34;
  if (t < S6) {           // his day: pencils into the wood chipper
    g.mood = 'focus'; g.look = 1;
    const tooth: P2 = [55, -247];                               // his teeth (world, relative to DX), roughly
    let pen = 0, reach = 0;
    for (const [a, b] of PENCILS) {
      if (t >= a && t < b) pen = lerp(PEN_L, 0, seg(t, a + 0.06, b - 0.04));
      if (t >= b && t < b + 0.2) reach = Math.sin(Math.PI * seg(t, b, b + 0.2));
    }
    g.pencil = pen; g.open = pen > 0 ? chompOpen(t, 7) : 0;
    const handNear: P2 = [tooth[0] + 18 + pen, tooth[1] - 2];
    const hb: P2 = [handNear[0] - SHX, handNear[1] - (SHY + 22)];
    g.armB = reach > 0 ? lp2([hb[0] + 10, hb[1]], [96, 40], reach) : hb;
    g.armA = [-34, 96];
    g.tilt = pen > 0 ? 2 * Math.sin(2 * Math.PI * 7 * t) : 0;
    if (t < PENCILS[0][0]) { g.armB = [hb[0], hb[1]]; g.pencil = PEN_L; g.open = 0; }
    return g;
  }
  if (t < S6B) {          // he stops: arms crossed, smug; his teeth grow
    const k = eout(seg(t, STOPT, STOPT + 0.3));
    g.armB = lp2([96, 40], [-44, 30], k); g.armA = lp2([-34, 96], [40, 18], k);
    g.mood = t < D1 ? (t < 12.4 ? 'smug' : 'worry') : 'ouch'; g.lookY = t > 12.4 && t < D1 ? 1 : 0;
    g.tooth = lerp(TOOTH_N, TOOTH_HOOK, eio(seg(t, D0, D1)));
    g.trem = t > D1 ? 0.7 : 0;
    return g;
  }
  if (t < S7) {           // the burger BOINGs off the curled teeth
    g.tooth = TOOTH_HOOK; g.armA = [-34, 96];
    const lift = eio(seg(t, S6B + 0.05, BITE));
    g.armB = lp2([60, 70], [70, -20], lift);
    g.mood = t < BITE ? 'hope' : t < BITE + 0.25 ? 'pop' : 'sad';
    if (t < BITE) { const hw = handWorld(g, 1); g.burger = [hw[0] - g.x + 6, hw[1] - 28]; }
    g.sq = t > BITE ? Math.max(0, Math.exp(-6 * (t - BITE)) * Math.cos((t - BITE) * 24)) * 0.35 : 0;
    if (t > BITE) g.armB = lp2([70, -20], [44, 96], eout(seg(t, BITE, BITE + 0.3)));
    return g;
  }
  // so he never stops chewing: back at a new birch
  g.x = GX; g.dir = -1; g.legs = true;
  gnawAtTree(g, t);
  return g;
};
const burgerFly = (t: number): {p: P2; rot: number} | null => {
  if (t < BITE || t > BITE + 0.7) return null;
  const u = t - BITE; const p0: P2 = [DX + 112, -289];
  return {p: [p0[0] + 520 * u, p0[1] - 620 * u + 1500 * u * u], rot: 540 * u};
};
const baseB = (): BS => ({x: BX, y: 0, s: BSC, dir: 1, mood: 'chomp', open: 0, handA: [96, -150], handB: [104, -132], sq: 0, tilt: 0, shake: 0, hide: 0, tailUp: 0});
const beaverAt = (t: number): BS => {
  const B = baseB();
  if (t < S3) {           // gnawing the birch; the tree falls behind it
    B.open = chompOpen(t + 0.07, 6.6); B.tilt = 2 * Math.sin(2 * Math.PI * 6.6 * t);
    if (t > FELL) { B.open = 0; B.mood = t < FELL + 0.45 ? 'pop' : 'smug'; B.sq = t < FELL + 0.5 ? 0.35 * Math.sin(Math.PI * seg(t, FELL, FELL + 0.5)) : 0; B.tilt = 0; B.tailUp = seg(t, FELL + 0.4, FELL + 0.7); }
    return B;
  }
  if (t < S5) {           // by the pond: the branch
    B.x = PX; B.s = 1.0; B.mood = t < CHEW0 ? 'smug' : t < SNAP ? 'chomp' : 'proud';
    B.handA = [112, -128]; B.handB = [118, -196];
    if (t >= CHEW0 && t < SNAP) { B.open = chompOpen(t, 6.8); B.tilt = 2.5 * Math.sin(2 * Math.PI * 6.8 * t); }
    if (t > SNAP) { B.tailUp = eout(seg(t, SNAP + 0.1, SNAP + 0.4)); B.handB = [150, -250]; }
    return B;
  }
  // beside the desk, facing him
  B.x = BDX; B.dir = -1; B.s = 0.78; B.mood = 'smug'; B.handA = [80, -120]; B.handB = [70, -110];
  if (t > S6 + 1.8 && t < S6B) B.mood = 'look';
  if (t >= S6B && t < S7) { B.mood = t > BITE + 0.05 ? 'laugh' : 'look'; B.shake = t > BITE + 0.05 ? 1 : 0; }
  if (t >= S7) { const b = baseB(); b.open = chompOpen(t + 0.07, 6.6); b.tilt = 2 * Math.sin(2 * Math.PI * 6.6 * t); return b; }
  return B;
};
const treeAt = (t: number) => {
  if (t < S2) return {depth: lerp(0.55, 1, seg(t, 0, FELL)), fall: t < FELL ? 0 : -96 * Math.pow(seg(t, FELL, FELL + 0.48), 2), stump: false};
  if (t < S7) return {depth: 1, fall: -96, stump: true};
  return {depth: lerp(0.0, 0.5, seg(t, S7, PUSH)), fall: 0, stump: false};
};
const branchAt = (t: number) => ({notch: t < CHEW0 ? 0 : t < SNAP ? lerp(0, 1, seg(t, CHEW0, SNAP)) : 1});

// ---------- camera (piecewise, hard cuts) ----------
const CAM0 = {x: -22, y: -205, k: 2.62};
const camFor = (t: number): {x: number; y: number; k: number} => {
  if (t < S2) { const u = eio(seg(t, 0, S2)); return {x: lerp(CAM0.x, -12, u), y: lerp(CAM0.y, -212, u), k: lerp(CAM0.k, 2.74, u)}; }
  if (t < S3) { const u = eio(seg(t, S2, S3)); return {x: lerp(GX, GX - 6, u), y: lerp(-196, -188, u), k: lerp(3.72, 3.88, u)}; }
  if (t < S4) { const u = seg(t, S3, S4); return {x: lerp(PX + 40, PX + 60, u), y: -230, k: 2.1}; }
  if (t < S5) { const u = eio(seg(t, S4, S5)); return {x: lerp(PX + 40, PX + 50, u), y: lerp(-186, -192, u), k: lerp(2.7, 2.82, u)}; }
  if (t < S6) { const u = eio(seg(t, S5, S6)); return {x: lerp(DX + 118, DX + 124, u), y: lerp(-212, -218, u), k: lerp(2.4, 2.5, u)}; }
  if (t < S6B) { const u = seg(t, S6, S6B); return {x: lerp(DX + 124, DX + 130, u), y: -230, k: 2.3}; }
  if (t < S7) { const u = eio(seg(t, S6B, S7)); return {x: lerp(DX + 76, DX + 70, u), y: lerp(-196, -200, u), k: lerp(3.05, 3.15, u)}; }
  const u = eio(seg(t, S7, PUSH));
  return {x: lerp(-14, CAM0.x, u), y: lerp(-198, CAM0.y, u), k: lerp(2.52, CAM0.k, u)};
};

export const BeaverScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t), B = beaverAt(t), tr = treeAt(t), br = branchAt(t);
  if (thumb) { g.mood = 'ouch'; g.tooth = TOOTH_HOOK; g.trem = 0; g.sq = 0; g.tilt = 0; B.x = -40; B.mood = 'smug'; B.open = 0; B.tilt = 0; B.sq = 0; B.tailUp = 0; }
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 4, 7) + hit(t, FELL + 0.48, 9, 6) + hit(t, HOOK, 9, 6) + hit(t, SNAP, 5, 7) + hit(t, D1, 7, 6) + hit(t, BITE, 6, 7));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const gBite = headPt(g, [HFX + 4, HFY + 10]);
  const bBite = beaverMouth(B);
  const chipSrc: Src[] = [
    {p: [TX + TWD / 2 - 8, -212], t0: 0 - 0.6, t1: FELL, rate: 9, vx: 300, seed: 11},
    {p: [TX - TWD / 2 + 8, -158], t0: 0 - 0.6, t1: FELL, rate: 8, vx: -300, seed: 21},
    {p: [TX + TWD / 2 - 8, -212], t0: S7, t1: DURATION + 0.6, rate: 9, vx: 300, seed: 31},
    {p: [TX - TWD / 2 + 8, -158], t0: S7, t1: DURATION + 0.6, rate: 8, vx: -300, seed: 41},
    {p: [PX + 128, -160], t0: CHEW0, t1: SNAP, rate: 9, vx: 260, seed: 51, col: '#EAD3A6'},
    ...PENCILS.map(([a, b], i) => ({p: [DX + 70, -248] as P2, t0: a + 0.05, t1: b - 0.02, rate: 12, vx: 240, seed: 61 + i * 10, col: '#FFE9A8', size: 0.75})),
  ];
  const bf = burgerFly(t);
  const fallTxt = popIn(t, FELL + 0.05, 0.25) * (1 - seg(t, S2 - 0.08, S2));
  const st = {
    chomp: (1 - seg(t, 0.5, 0.62)) * (t < S2 ? 1 : 0) * (1 + 0.06 * Math.sin(t * 40)),
    crunch: popIn(t, HOOK, 0.18) * (1 - seg(t, S3 - 0.1, S3)),
    snap: popIn(t, SNAP, 0.2) * (1 - seg(t, S5 - 0.1, S5)),
    boing: popIn(t, BITE, 0.18) * (1 - seg(t, S7 - 0.1, S7)),
  };
  const days = t < PENCILS[1][0] ? 1 : t < PENCILS[2][0] ? 2 : t < PENCILS[3][0] ? 3 : Math.round(lerp(4, 365, eio(seg(t, PENCILS[3][0], PENCILS[3][1] - 0.05))));
  const showG = !(t >= S3 && t < S5);
  const toothLenX = guyAt(Math.min(Math.max(t, S6), S6B - 0.01)).tooth;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`bFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      {/* far: hills, trees, the pond with the lodge */}
      <Layer cam={cam} z={2600}><W><g>
        {[-3600, -2200, -800, 600, 2000, 3400].map((x, i) => <ellipse key={i} cx={x} cy={40} rx={900} ry={300 + (i % 3) * 60} fill={HILL} stroke={INK} strokeWidth={6} />)}
        {[-2900, -2300, -1500, -400, 300, 900, 1700, 2500, 3200].map((x, i) => <BgTree key={'t' + i} x={x} s={0.9 + (i % 3) * 0.15} birch={i % 2 === 0} />)}
        <rect x={-6000} y={-10} width={12000} height={4000} fill={GRASS_DK} />
        <path d="M -6000 -10 H 6000" stroke={INK} strokeWidth={6} />
      </g></W></Layer>
      <Layer cam={cam} z={1700}><W><g>
        <path d="M -2200 -20 Q -1500 -70 -800 -20 Q -700 30 -1500 40 Q -2300 40 -2200 -20 Z" fill={POND} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <path d="M -1900 0 q 60 -12 120 0 M -1300 6 q 60 -12 120 0" stroke="#FFFFFF" strokeWidth={6} fill="none" strokeLinecap="round" />
        <Lodge x={-1560} />
      </g></W></Layer>
      {/* near: the grass, gnawed stumps, the desk */}
      <Layer cam={cam} z={1000}><W><g>
        <rect x={-4000} y={0} width={9000} height={3000} fill={GRASS} />
        <path d="M -4000 0 H 5000" stroke={INK} strokeWidth={6} />
        {Array.from({length: 40}, (_, i) => { const x = -2400 + i * 120 + ((i * 37) % 50); return <Tuft key={i} x={x} y={14 + (i % 3) * 22} s={0.9 + (i % 4) * 0.1} />; })}
        {[[-520, 0.8], [380, 0.7], [-1380, 0.9], [-760, 0.65], [1180, 0.75]].map(([x, s], i) => <g key={'s' + i} transform={`translate(${x} 0) scale(${s})`}>
          <path d="M -40 0 L -40 -70 L -10 -110 L 0 -88 L 12 -112 L 40 -70 L 40 0 Z" fill={BIRCH} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -40 -70 L -10 -110 L 0 -88 L 12 -112 L 40 -70 Z" fill={WOOD} stroke={INK} strokeWidth={5} strokeLinejoin="round" /></g>)}
        {/* chips on the ground near the birch */}
        {Array.from({length: 14}, (_, i) => <path key={'gc' + i} d={`M ${TX - 160 + i * 26 + rnd(i) * 10} ${10 + (i % 3) * 8} l 12 -4 l 4 8 l -12 3 Z`} fill={WOOD} stroke={INK} strokeWidth={3} />)}
        {/* the birch / stump */}
        {tr.stump ? <Stump /> : <Birch depth={tr.depth} fall={tr.fall} />}
        {/* the branch by the pond */}
        {t >= S3 && t < S5 ? <Branch x={PX + 132} yTop={-330} yBot={-40} notch={br.notch} snapT={SNAP} t={t} /> : null}
      </g></W></Layer>
      {/* characters */}
      <Layer cam={cam} z={1000}>
        <Beaver t={t} B={B} />
        {showG ? <GuyB t={t} g={g} uid={uid} /> : null}
        {/* the desk (in front of his legs) */}
        <W><g>
          <path d={`M ${TBL_X - 168} 0 L ${TBL_X - 150} ${TBL_TOP} L ${TBL_X + 150} ${TBL_TOP} L ${TBL_X + 168} 0 Z`} fill={BARK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={TBL_X} cy={TBL_TOP} rx={156} ry={24} fill={WOOD} stroke={INK} strokeWidth={6} />
          <ellipse cx={TBL_X} cy={TBL_TOP} rx={98} ry={14} fill="none" stroke={WOOD_DK} strokeWidth={4} />
          <ellipse cx={TBL_X} cy={TBL_TOP} rx={50} ry={7} fill="none" stroke={WOOD_DK} strokeWidth={4} />
          {/* the pencil cup */}
          <g transform={`translate(${TBL_X + 96} ${TBL_TOP - 6})`}>
            {[-14, 0, 14].map((dx, i) => <g key={i} transform={`translate(${dx} -74) rotate(${(i - 1) * 9})`}><rect x={-6} y={-40} width={12} height={60} fill="#FFD43B" stroke={INK} strokeWidth={4} /><path d="M -6 -40 L 0 -56 L 6 -40 Z" fill={WOOD} stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>)}
            <path d="M -30 -70 L -24 0 L 24 0 L 30 -70 Z" fill="#7FB6E8" stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
          </g>
          {/* shavings on the table */}
          {t > PENCILS[0][0] + 0.3 ? Array.from({length: Math.min(12, Math.floor((t - PENCILS[0][0]) * 5))}, (_, i) => <path key={'sv' + i}
            d={`M ${TBL_X - 110 + i * 14 + rnd(i + 4) * 8} ${TBL_TOP - 4 - (i % 2) * 5} q 6 -8 12 0`} stroke="#E3B85F" strokeWidth={5} fill="none" strokeLinecap="round" />) : null}
        </g></W>
        <Chips t={t} srcs={chipSrc} />
        {bf ? <W><Burger p={bf.p} rot={bf.rot} /></W> : null}
        {t > HOOK && t < S3 ? <Star x={headPt(g, [10, 58])[0]} y={headPt(g, [10, 58])[1]} s={popIn(t, HOOK, 0.15) * (1 - seg(t, HOOK + 0.35, HOOK + 0.5)) * 1.2} rot={t * 90} /> : null}
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={gBite[0] + 4} y={gBite[1] - 150} s={st.chomp} text="CHOMP" size={44} rot={8} fill="#FFFFFF" />
        <Txt x={20} y={-480} s={fallTxt} text="TIMBER" size={54} rot={-8} fill={GOLD} />
        <Txt x={headPt(g, [6, -98])[0]} y={headPt(g, [6, -98])[1]} s={st.crunch} text="CRUNCH" size={40} rot={-6} fill={RED} />
        <Txt x={PX + 150} y={-372} s={st.snap} text="SNAP" size={50} rot={10} fill="#FFFFFF" />
        <Txt x={DX + 110} y={-420} s={st.boing} text="BOING" size={50} rot={-8} fill={GOLD} />
        <Txt x={PX + 182} y={-108} s={popIn(t, T.thick - 0.02, 0.22) * (1 - seg(t, SNAP - 0.1, SNAP)) * (t >= S4 ? 1 : 0)} text="6 CM" size={30} rot={0} fill="#FFFFFF" />
      </Layer>}
      {thumb ? null : <>
        <Card text="CHEWS ANYTHING" top={1452} color="#FFFFFF" rot={-3} s={(t < 0.02 ? 1 : 1) * (1 - seg(t, S2 - 0.12, S2))} size={72} />
        <Card text="GROWING" top={1452} color={GOLD} rot={3} s={popIn(t, GROW0, 0.24) * (1 - seg(t, HOOK - 0.06, HOOK))} size={84} />
        <Card text="INTO YOUR JAW" top={1452} color={RED} fg="#fff" rot={-3} s={popIn(t, HOOK, 0.28) * (1 - seg(t, S3 - 0.12, S3)) * pulse(t, HOOK)} size={80} />
        <Card text="NEVER STOP GROWING" top={1452} color={GOLD} rot={-2} s={popIn(t, T.never - 0.04, 0.28) * (1 - seg(t, S4 - 0.12, S4))} size={64} />
        <Card text="UNDER 30 SECONDS" top={1452} color="#FFFFFF" rot={3} s={popIn(t, SNAP + 0.02, 0.28) * (1 - seg(t, S5 - 0.12, S5)) * pulse(t, SNAP)} size={68} />
        <Card text="EVERY DAY" top={1452} color={GOLD} rot={-3} s={popIn(t, T.every - 0.02, 0.26) * (1 - seg(t, T.wear - 0.1, T.wear))} size={84} />
        <Card text="TO WEAR THEM DOWN" top={1452} color="#FFFFFF" rot={2} s={popIn(t, T.wear - 0.02, 0.26) * (1 - seg(t, S6 - 0.1, S6))} size={62} />
        <Card text="HE STOPS" top={1452} color="#FFFFFF" rot={-3} s={popIn(t, T.stops - 0.04, 0.26) * (1 - seg(t, D1 - 0.08, D1))} size={80} />
        <Card text="DANGER" top={1452} color={RED} fg="#fff" rot={3} s={popIn(t, D1, 0.26) * (1 - seg(t, S6B - 0.08, S6B)) * pulse(t, D1)} size={92} />
        <Card text="CAN'T EAT" top={1452} color={RED} fg="#fff" rot={-3} s={popIn(t, T.cant - 0.02, 0.28) * (1 - seg(t, S7 - 0.12, S7)) * pulse(t, BITE)} size={92} />
        <Card text="NEVER STOPS" top={1452} color={GOLD} rot={3} s={popIn(t, T.never2 - 0.04, 0.28) * (1 - seg(t, PUSH - 0.12, PUSH))} size={84} />
        <Counter left={290} top={560} value={`0:${String(Math.min(28, Math.floor(seg(t, CHEW0 + 0.05, SNAP - 0.05) * 28 + 0.0001))).padStart(2, '0')}`} label="SECONDS" rot={4}
          s={popIn(t, S4 + 0.08, 0.3) * (1 - seg(t, S5 - 0.12, S5)) * pulse(t, SNAP)} />
        <Counter left={800} top={700} value={`DAY ${days}`} label="A PENCIL A DAY" rot={4} s={popIn(t, S5 + 0.1, 0.3) * (1 - seg(t, S6 - 0.12, S6)) * (days === 365 ? pulse(t, PENCILS[3][1] - 0.1) : 1)} />
      </>}
      <BeaverXRay t={t} s={popIn(t, S3 + 0.02, 0.35) * (1 - seg(t, S4 - 0.12, S4)) * (t >= S3 ? 1 : 0)} />
      <YourXRay t={t} s={popIn(t, XR6, 0.35) * (1 - seg(t, S6B - 0.12, S6B)) * (t >= S6 ? 1 : 0)} len={toothLenX} bad={popIn(t, D1, 0.2)} />
      {thumb ? null : <>
        <Card text="X-RAY: BEAVER" top={XR_Y - XR_R - 26} size={50} rot={-2} s={popIn(t, S3 + 0.06, 0.3) * (1 - seg(t, S4 - 0.12, S4))} />
        <Card text="IRON" top={XR_Y + 150} left={830} color={ORANGE} rot={6} s={popIn(t, 5.0, 0.24) * (1 - seg(t, S4 - 0.12, S4))} size={50} />
        <Card text="X-RAY: YOUR TEETH" top={XR_Y - XR_R - 26} size={50} rot={-2} s={popIn(t, XR6 + 0.04, 0.3) * (1 - seg(t, S6B - 0.12, S6B))} />
        <Counter left={820} top={XR_Y + 250} value={`${Math.floor(seg(t, D0, D1) * 60 + 0.0001)}`} label="DAYS" rot={5} red={t > D1 - 0.02}
          s={popIn(t, D0 - 0.1, 0.3) * (1 - seg(t, S6B - 0.12, S6B)) * pulse(t, D1)} />
        <CommentBubble t={t} text="what if you had a beaver's teeth??" handle="@woodchip_doodle" likes="2.7K" y={400} />
        <CallToAction t={t} at={T.cta} y={250} />
        <CommentAsk t={t} at={T.so} until={PUSH - 0.4} text="What would you chew first?" y={280} />
      </>}
    </AbsoluteFill>
  );
};

export const BeaverVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const cues: Cue[] = [
    // frame 0: CHOMP + gnawing from both sides; the birch creaks, cracks and falls
    {f: 'chomp.wav', at: 0, db: -5}, {f: 'gnaw.wav', at: 0, db: -13, to: FELL}, {f: 'whoosh.wav', at: 0, db: -22, from: 0.12},
    {f: 'chomp.wav', at: 0.34, db: -12}, {f: 'chomp.wav', at: 0.68, db: -12}, {f: 'creak.wav', at: 0.62, db: -12},
    {f: 'crack.wav', at: FELL - 0.32, db: -7}, {f: 'whoosh_slow.wav', at: FELL + 0.02, db: -16}, {f: 'thud.wav', at: FELL + 0.48, db: -6}, {f: 'pop.wav', at: FELL + 0.05, db: -22},
    // close-up: SHWING, then CRUNCH into his chin
    {f: 'whoosh.wav', at: S2 - 0.03, db: -30}, {f: 'shing.wav', at: GROW0, db: -9}, {f: 'pop.wav', at: GROW0, db: -22}, {f: 'stretch.wav', at: GROW1, db: -14, to: 0.35},
    {f: 'shing.wav', at: GROW1, db: -15}, {f: 'crack.wav', at: HOOK - 0.32, db: -9}, {f: 'bonk.wav', at: HOOK, db: -12}, {f: 'gasp.wav', at: HOOK + 0.06, db: -17}, {f: 'pop.wav', at: HOOK, db: -19},
    // X-RAY: BEAVER
    {f: 'zap.wav', at: S3, db: -23}, {f: 'pop.wav', at: S3 + 0.05, db: -24}, {f: 'shimmer.wav', at: 3.55, db: -22}, {f: 'shimmer.wav', at: 4.4, db: -22},
    {f: 'pop.wav', at: T.never - 0.04, db: -21}, {f: 'pop.wav', at: 5.0, db: -23},
    // the branch: gnaw + stopwatch, SNAP
    {f: 'whoosh.wav', at: S4 - 0.03, db: -30}, {f: 'gnaw.wav', at: CHEW0, db: -15}, {f: 'gnaw.wav', at: CHEW0 + 1.55, db: -15, to: SNAP - CHEW0 - 1.55},
    ...ticks(CHEW0 + 0.05, SNAP - 0.1, 14, -31), {f: 'pop.wav', at: T.thick - 0.02, db: -24},
    {f: 'crack.wav', at: SNAP - 0.32, db: -8}, {f: 'ding.mp3', at: SNAP + 0.02, db: -19}, {f: 'pop.wav', at: SNAP + 0.02, db: -21},
    // his day: pencils
    {f: 'whoosh.wav', at: S5 - 0.03, db: -30}, ...PENCILS.map(([a, b]) => ({f: 'gnaw.wav', at: a + 0.04, db: -15, to: b - a - 0.06} as Cue)),
    ...PENCILS.slice(0, 3).map(([, b]) => ({f: 'tick2.wav', at: b + 0.18, db: -22} as Cue)), ...ticks(PENCILS[3][0], PENCILS[3][1] - 0.05, 8, -28),
    {f: 'pop.wav', at: T.every - 0.02, db: -21}, {f: 'pop.wav', at: T.wear - 0.02, db: -22},
    ...ctaCues(T.cta),
    // he stops: X-RAY: YOUR TEETH, DAYS, DANGER
    {f: 'whoosh.wav', at: S6 - 0.03, db: -30}, {f: 'clack.wav', at: STOPT + 0.05, db: -22}, {f: 'pop.wav', at: T.stops - 0.04, db: -22},
    {f: 'zap.wav', at: XR6, db: -23}, {f: 'stretch.wav', at: D0, db: -15, to: 1.4}, ...ticks(D0, D1, 10, -30),
    {f: 'crack.wav', at: D1 - 0.32, db: -8}, {f: 'beep.wav', at: D1 + 0.02, db: -14}, {f: 'gasp.wav', at: D1 + 0.08, db: -18}, {f: 'pop.wav', at: D1, db: -20},
    // the burger
    {f: 'whoosh.wav', at: S6B - 0.03, db: -30}, {f: 'pop.wav', at: T.cant - 0.02, db: -21}, {f: 'boing.wav', at: BITE, db: -7}, {f: 'whoosh.wav', at: BITE + 0.04, db: -20},
    {f: 'crowd_laugh.wav', at: BITE + 0.12, db: -21, to: 1.1}, {f: 'giggle.mp3', at: BITE + 0.2, db: -26, to: 0.6},
    // so he never stops chewing
    {f: 'whoosh.wav', at: S7 - 0.03, db: -30}, {f: 'gnaw.wav', at: S7 + 0.02, db: -15}, {f: 'gnaw.wav', at: S7 + 1.6, db: -15, to: PUSH - S7 - 1.6},
    {f: 'chomp.wav', at: S7 + 0.05, db: -12}, {f: 'pop.wav', at: T.never2 - 0.04, db: -21}, {f: 'whoosh.wav', at: PUSH - 0.05, db: -22},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<BeaverScene t={0} />}>
        <BeaverScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="beaver/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const BeaverWide: React.FC = () => <WideFit.Provider value={0.72}><BeaverVideo /></WideFit.Provider>;
