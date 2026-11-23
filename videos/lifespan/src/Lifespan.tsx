// "What if you lived as long as these animals?" - LADDER format (second test, after videos/jump): one question, many animals,
// one number climbing, the top rung hits his body. Niche: animal powers.
// (1) frame 0: on a beach, a tortoise shell on his back, his beard growing as the AGE counter spins past 120 toward 190, a smug old
//     tortoise beside him (DING 190); (2) POOF: a shark fin, deep sea, a smug Greenland shark: AGE -> 400; (3) POOF: sitting in a clam
//     shell on the sea floor: AGE -> 507; (4) POOF: a jellyfish bell on his head: the digits spin and turn into the infinity sign
//     (NEVER DIES OF OLD AGE); he gets older and older (beard to the floor, a cane);
// (5) the top rung hits his body: he melts into a blob on the sea floor (BLOB), POOF - he's a baby (AGE 0);
// (6) "Then start all over again": the baby grows up on the beach and the counter climbs again = frame 0.
// The rungs are ranked in a list under the counter. All drawn in code; the guy is the code-drawn front view (butterfly rig).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, W, HEAD_R, SoundLayer, Cue, seg, popIn, lerp, eio, eout, clamp, rnd,
  shake, hit, WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, CommentAsk, CommentBubble, Poof} from './lib/kit';

// voice: tight.mp3 at 0.1 s (line 1 at 1.18, the rest at 1.12; video time). Speech ends 17.48 s.
export const DURATION = 18.3;
export const T = {
  live: 0.10, tortoise: 0.56, n190: 1.98,                         // "Live like a tortoise, and you'd make it to 190."
  like2: 2.98, shark: 3.62, about: 4.34, n400: 4.55,              // "Like a Greenland shark, about 400."
  like3: 5.33, clam: 6.04, n507: 6.64,                            // "Like one old clam, 507."
  but: 7.81, immortal: 8.52, jellyfish: 9.09, never: 10.38, die: 10.73, age: 11.23,   // "But live like the immortal jellyfish, and you'd never die of old age."
  when: 11.80, old: 12.22, melt: 13.08, blob: 13.80, turn: 14.40, baby: 15.08,       // "When you got old, you'd melt into a blob and turn back into a baby."
  then: 15.80, start: 16.19, again: 16.91,                        // "Then start all over again."
  cta: 11.6,
};
const R2 = 2.88, R3 = 5.2, R4 = 7.72, R5 = 11.55, R6 = 15.62;      // rung starts (hard cuts, a POOF on each)
const DING1 = 2.2, DING2 = 4.95, DING3 = 6.95, INF = 10.42;       // the counter lands
const MELT0 = 13.05, MELT1 = 13.7, POLYP = 14.42, BABY = 14.6;    // the melt, the blob, the baby
const PUSH = DURATION - LOOP_DUR;

const GOLD = '#FFD43B', RED = '#E2453C', FACE_C = '#F1EFEA';
const SAND = '#F2DFAE', SAND_DK = '#DEC488', SEA = '#8FD0E6', DEEP = '#2E5C8A', DEEP2 = '#3B6E9E', SEAFL = '#5FA9C4', OPEN = '#A9DDF0';
const SHELL = '#8FA35A', SHELL_DK = '#6E8240', SKIN = '#C9B27C', SKIN_DK = '#A38E5A';
const SHARK = '#7C746C', SHARK_DK = '#5E5750', SHARK_LT = '#A39A90';
const CLAM = '#E2CDB0', CLAM_DK = '#BFA584', JELLY = '#F7A6C8', JELLY_DK = '#E27BA8', BEARD = '#D3CFC7', BEARD_SH = '#BBB6AC';
const FONT_W = 900;
const AX = 238;                       // the animal of each rung, right of him

// ---------- helpers ----------
type P2 = [number, number];
const P = (p: P2) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
const lp2 = (a: P2, b: P2, u: number): P2 => [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
const add = (a: P2, b: P2): P2 => [a[0] + b[0], a[1] + b[1]];
const rad = (d: number) => (d * Math.PI) / 180;
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
const Card: React.FC<{text: string; top: number; color?: string; fg?: string; s?: number; rot?: number; size?: number; left?: number}> = ({text, top, color = '#fff', fg = INK, s = 1, rot = -3, size = 54, left = 540}) => s > 0.01 ? (
  <div style={{position: 'absolute', left, top, transform: `translate(-50%,-50%) rotate(${rot}deg) scale(${s})`, background: color, color: fg, border: `8px solid ${INK}`, borderRadius: 26,
    padding: '6px 26px', fontFamily: FONT, fontWeight: FONT_W, fontSize: size, boxShadow: `0 8px 0 ${INK}`, whiteSpace: 'nowrap'}}>{text}</div>
) : null;
const pulse = (t: number, at: number, w = 6) => 1 + 0.14 * Math.max(0, 1 - Math.abs(t - at - 0.12) * w);

// ---------- the guy (front view) with an age: beard, wrinkles, cane; rung accessories ----------
type Mood = 'joy' | 'happy' | 'smug' | 'focus' | 'pop' | 'worry' | 'dizzy' | 'deadpan' | 'old' | 'melt' | 'baby';
const Face: React.FC<{t: number; mood: Mood; uid: string; look?: number; lookY?: number; age: number}> = ({t, mood, uid, look = 0, lookY = 0, age}) => {
  const eye = (sd: number) => {
    const ex = sd * 25, ey = -14;
    if (mood === 'joy' || mood === 'happy' || mood === 'baby') return <path key={sd} d={`M ${ex - 13} ${ey + 4} Q ${ex} ${ey - 12} ${ex + 13} ${ey + 4}`} stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
    const big = mood === 'pop' ? 1.25 : 1;
    const lid = mood === 'smug' ? 0.45 : mood === 'focus' ? 0.38 : mood === 'deadpan' ? 0.52 : mood === 'old' ? 0.6 : mood === 'melt' ? 0.4 : 0;
    const rx = 12 * big, ry = 15 * big, px = look * 4, py = lookY * 4;
    return <g key={sd}>
      <ellipse cx={ex} cy={ey} rx={rx} ry={ry} fill="#FFFFFF" stroke={INK} strokeWidth={4.5} />
      <circle cx={ex + px} cy={ey + 1 + lid * 6 + py} r={6.3 * (big > 1 ? 0.85 : 1)} fill={INK} />
      <circle cx={ex + px - 1.5} cy={ey - 1 + lid * 6 + py} r={2} fill="#fff" />
      {lid ? <path d={lidPath(ex, ey, rx + 0.5, ry + 0.5, lid)} fill={FACE_C} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> : null}
      {age > 300 ? <path d={`M ${ex - 11} ${ey + 20} q 11 7 22 0`} stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" /> : null}
    </g>;
  };
  const brow = (sd: number) => {
    let d = `M ${sd * 12} -45 Q ${sd * 25} -53 ${sd * 38} -47`;
    if (mood === 'worry' || mood === 'dizzy' || mood === 'melt') d = `M ${sd * 10} -46 L ${sd * 36} -38`;
    else if (mood === 'smug') d = `M ${sd * 12} ${sd < 0 ? -40 : -46} L ${sd * 38} ${sd < 0 ? -44 : -50}`;
    else if (mood === 'pop') d = `M ${sd * 12} -52 Q ${sd * 25} -62 ${sd * 38} -54`;
    else if (mood === 'deadpan' || mood === 'old') d = `M ${sd * 12} -38 L ${sd * 38} -38`;
    return <path key={'b' + sd} d={d} stroke={age > 150 ? '#BDB8B0' : INK} strokeWidth={age > 150 ? 8 : 5} fill="none" strokeLinecap="round" />;
  };
  let mouth: React.ReactNode;
  if (mood === 'joy') mouth = <g><path d="M -30 -4 Q 0 -9 30 -4 Q 26 30 0 33 Q -26 30 -30 -4 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={22} rx={13} ry={7} fill="#E4677A" /></g>;
  else if (mood === 'happy') mouth = <g><path d="M -22 2 Q 0 26 22 2 Z" fill="#5A2328" stroke={INK} strokeWidth={5} strokeLinejoin="round" /><ellipse cx={0} cy={13} rx={9} ry={4} fill="#E4677A" /></g>;
  else if (mood === 'smug') mouth = <path d="M -20 6 Q 0 16 22 -3" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'focus' || mood === 'old') mouth = <path d="M -15 9 Q 0 5 15 9" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'deadpan') mouth = <path d="M -16 8 L 16 8" stroke={INK} strokeWidth={5.5} fill="none" strokeLinecap="round" />;
  else if (mood === 'worry' || mood === 'dizzy' || mood === 'melt') mouth = <path d="M -18 10 q 6 -6 12 0 t 12 0 t 12 0" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />;
  else if (mood === 'baby') mouth = <g><circle cx={0} cy={8} r={15} fill="#F28CA0" stroke={INK} strokeWidth={4.5} /><circle cx={0} cy={8} r={6} fill="#FFFFFF" stroke={INK} strokeWidth={3} /><path d="M -22 8 Q 0 -4 22 8" stroke={INK} strokeWidth={4} fill="#F7B6C3" /></g>;
  else mouth = <g><ellipse cx={0} cy={12} rx={17} ry={21} fill="#5A2328" stroke={INK} strokeWidth={5} /><ellipse cx={0} cy={23} rx={9} ry={6} fill="#E4677A" /></g>;
  return <g>
    <circle r={HEAD_R + 1} fill={`url(#lFace${uid})`} stroke={INK} strokeWidth={6.5} />
    {age > 150 ? [0, 1, 2].map((i) => <path key={'w' + i} d={`M ${-30 + i * 4} ${-60 + i * 7} q 30 -6 ${56 - i * 8} 0`} stroke="#B9B4AA" strokeWidth={3.5} fill="none" strokeLinecap="round" opacity={clamp((age - 150) / 100)} />) : null}
    {eye(-1)}{eye(1)}{brow(-1)}{brow(1)}
    <g transform="translate(0 28)">{mouth}</g>
  </g>;
};
/** beard: a column of puffs from the chin, length L (world units); past the floor it piles up */
const beardPuffs = (L: number, floorY: number): {p: P2; r: number}[] => {
  const out: {p: P2; r: number}[] = [];
  const reach = Math.min(L, floorY - 56), n = Math.max(3, Math.ceil(reach / 20));
  for (let i = 0; i < n; i++) {
    const s = (reach * i) / (n - 1);
    out.push({p: [8 * Math.sin(s * 0.05), 40 + s], r: lerp(36, 22, Math.min(1, s / 260)) * (L < 30 ? 0.7 : 1)});
  }
  const over = L - reach;
  if (over > 4) {            // the heap on the floor: a dome of puffs that widens with the extra length
    const w = Math.min(250, 40 + over * 0.45), h = Math.min(80, 22 + over * 0.12), m = 9;
    for (let i = 0; i < m; i++) { const u = i / (m - 1), x = lerp(-w, w, u); out.push({p: [x, floorY - 18 - h * Math.sin(Math.PI * u) * 0.8], r: 24 + 10 * Math.sin(Math.PI * u)}); }
    out.push({p: [0, floorY - 22 - h], r: 30});
  }
  return out;
};
type GS = {x: number; y: number; rot: number; lean: number; hip: number; armA: P2; armB: P2; feet: [P2, P2]; mood: Mood; look: number; lookY: number;
  sq: number; tilt: number; trem: number; age: number; beard: number; cane: number; acc: 'shell' | 'fin' | 'clam' | 'jelly' | null; s: number; melt: number; hide: number; float: number};
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
const HexShell: React.FC<{rx: number; ry: number; cy: number}> = ({rx, ry, cy}) => (
  <g>
    <ellipse cx={0} cy={cy} rx={rx} ry={ry} fill={SHELL} stroke={INK} strokeWidth={6} />
    {[[-0.45, -0.35], [0.45, -0.35], [0, -0.55], [-0.5, 0.2], [0.5, 0.2], [0, 0.05], [0, 0.6]].map(([u, v], i) =>
      <path key={i} d={`M ${u * rx - 18} ${cy + v * ry} l 9 -15 h 18 l 9 15 l -9 15 h -18 Z`} fill={SHELL_DK} stroke={INK} strokeWidth={3.5} strokeLinejoin="round" />)}
  </g>
);
const GuyL: React.FC<{t: number; g: GS; uid: string}> = ({t, g, uid}) => {
  if (g.hide >= 1) return null;
  const hipY = -g.hip, shY = hipY - 112, headY = shY - 53;
  const jig = g.trem * 2.4 * Math.sin(t * 71);
  const SA: P2 = [-SHX, hipY - 90], SB: P2 = [SHX, hipY - 90];
  const HA = add(SA, g.armA), HB = add(SB, g.armB);
  const fl = g.float * 10 * Math.sin(t * 2.2);
  const beard = g.beard > 2 ? beardPuffs(g.beard, -headY + 0 - g.y) : [];
  const m = clamp(g.melt);
  const bodyT = `translate(0 ${(hipY * m * 0.0).toFixed(1)}) scale(${(1 + 0.6 * m).toFixed(3)} ${(1 - 0.7 * m).toFixed(3)})`;
  return (
    <W><g transform={`translate(${(g.x + jig).toFixed(1)} ${(g.y + fl).toFixed(1)}) rotate(${g.rot.toFixed(2)}) scale(${g.s.toFixed(3)})`}>
      <g transform={bodyT}>
        {g.acc === 'shell' ? <g transform={`translate(0 ${hipY - 60})`}><HexShell rx={92} ry={104} cy={0} /></g> : null}
        {g.acc === 'clam' ? <g transform={`translate(0 ${hipY - 40})`}>
          <path d="M -170 -10 Q -170 -200 0 -230 Q 170 -200 170 -10 Z" fill={CLAM} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {[-120, -70, -24, 24, 70, 120].map((x, i) => <path key={i} d={`M 0 -10 L ${x} ${-180 + Math.abs(x) * 0.5}`} stroke={CLAM_DK} strokeWidth={5} strokeLinecap="round" />)}
        </g> : null}
        {g.acc === 'fin' ? <path d={`M -30 ${headY - 30} Q 20 ${headY - 150} 70 ${headY - 170} Q 50 ${headY - 90} 50 ${headY - 20} Z`} fill={SHARK} stroke={INK} strokeWidth={6} strokeLinejoin="round" /> : null}
        {[0, 1].map((i) => <Limb key={'l' + i} S={[(i ? 1 : -1) * 19, hipY + 4]} H={g.feet[i]} L={37} sd={i ? -1 : 1} w={30} hand={false} />)}
        {g.feet.map((f, i) => <ellipse key={'f' + i} cx={f[0] + (i ? 2 : -2)} cy={f[1] + 5} rx={23} ry={9.5} fill="#fff" stroke={INK} strokeWidth={6} />)}
        <g transform={`rotate(${g.lean.toFixed(2)} 0 ${hipY})`}>
          <path d={torsoD(47, shY, hipY + 13)} fill="#fff" stroke={INK} strokeWidth={6.5} strokeLinejoin="round" />
          {g.cane > 0.01 ? <g transform={`translate(${P(HB)}) scale(${g.cane})`}><path d={`M 0 -10 L 6 ${-hipY - 8 - HB[1] + hipY}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
            <path d={`M 0 -10 L 6 ${-hipY - 8 - HB[1] + hipY}`} stroke="#9B6B3E" strokeWidth={7} strokeLinecap="round" />
            <path d="M 0 -10 Q -4 -34 -26 -30" stroke={INK} strokeWidth={14} fill="none" strokeLinecap="round" /><path d="M 0 -10 Q -4 -34 -26 -30" stroke="#9B6B3E" strokeWidth={7} fill="none" strokeLinecap="round" /></g> : null}
          <Limb S={SA} H={HA} L={77} sd={g.armA[1] > 0 ? 1 : -1} />
          <Limb S={SB} H={HB} L={77} sd={g.armB[1] > 0 ? -1 : 1} />
          <g transform={`translate(0 ${headY}) rotate(${g.tilt.toFixed(2)}) scale(${(1 + 0.1 * g.sq).toFixed(3)} ${(1 - 0.16 * g.sq).toFixed(3)})`}>
            {beard.length ? <g>{beard.map((c, i) => <circle key={'bi' + i} cx={c.p[0]} cy={c.p[1]} r={c.r + 5.5} fill={INK} />)}{beard.map((c, i) => <circle key={'bf' + i} cx={c.p[0]} cy={c.p[1]} r={c.r} fill={i % 3 === 1 ? BEARD_SH : BEARD} />)}</g> : null}
            {g.acc === 'jelly' ? [-80, -66, 66, 80].map((x, i) => { const ph = t * 3 + i; return <path key={'tn' + i} d={`M ${x} -40 q ${8 * Math.sin(ph)} 50 ${x > 0 ? 8 : -8} 100 t ${-6 * Math.sin(ph)} 90`} stroke={JELLY_DK} strokeWidth={6} fill="none" strokeLinecap="round" />; }) : null}
            <Face t={t} mood={g.mood} uid={uid} look={g.look} lookY={g.lookY} age={g.age} />
            {beard.length ? <path d="M -30 34 Q 0 24 30 34" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /> : null}
            {g.acc === 'jelly' ? <g>
              <path d="M -86 -40 Q -86 -140 0 -144 Q 86 -140 86 -40 Q 64 -30 43 -40 Q 22 -30 0 -40 Q -22 -30 -43 -40 Q -64 -30 -86 -40 Z" fill={JELLY} stroke={INK} strokeWidth={6} strokeLinejoin="round" opacity={0.92} />
              <path d="M -50 -100 Q -30 -126 10 -128" stroke="#FFFFFF" strokeWidth={9} fill="none" strokeLinecap="round" opacity={0.8} />
            </g> : null}
            {g.acc === 'clam' ? <g transform="translate(0 -40)"><path d="M -110 30 Q -120 -110 0 -124 Q 120 -110 110 30" fill="none" stroke={INK} strokeWidth={0} /></g> : null}
          </g>
        </g>
        {g.acc === 'clam' ? <g transform={`translate(0 ${hipY + 30})`}>
          <path d="M -180 -20 Q 0 90 180 -20 Q 120 40 0 46 Q -120 40 -180 -20 Z" fill={CLAM} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          {[-110, -50, 0, 50, 110].map((x, i) => <path key={i} d={`M ${x * 0.8} 20 L ${x} 0`} stroke={CLAM_DK} strokeWidth={5} strokeLinecap="round" />)}
        </g> : null}
      </g>
    </g></W>
  );
};
/** the blob (a melted guy on the sea floor), and the baby */
const Blob: React.FC<{t: number; x: number; s: number; uid: string}> = ({t, x, s, uid}) => {
  const w = 1 + 0.06 * Math.sin(t * 7);
  return <W><g transform={`translate(${x} 0) scale(${(s * w).toFixed(3)} ${(s / w).toFixed(3)})`}>
    <path d="M -150 0 C -150 -60 -90 -110 0 -112 C 90 -110 150 -60 150 0 Z" fill="#FFFFFF" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <path d="M -100 -6 Q 0 8 100 -6" stroke="#E4E1DA" strokeWidth={10} fill="none" strokeLinecap="round" />
    <g transform="translate(0 -58) scale(1 0.8)"><Face t={t} mood="melt" uid={uid} age={0} /></g>
  </g></W>;
};
const Baby: React.FC<{t: number; x: number; s: number; uid: string; mood: Mood}> = ({t, x, s, uid, mood}) => {
  const b = 3 * Math.sin(t * 9);
  return <W><g transform={`translate(${x} 0) scale(${s})`}>
    {[-1, 1].map((sd) => <g key={sd}><path d={`M ${sd * 18} -60 L ${sd * 24} -14`} stroke={INK} strokeWidth={28} strokeLinecap="round" /><path d={`M ${sd * 18} -60 L ${sd * 24} -14`} stroke="#FFF" strokeWidth={17} strokeLinecap="round" />
      <ellipse cx={sd * 26} cy={-8} rx={20} ry={9} fill="#FFF" stroke={INK} strokeWidth={5.5} /></g>)}
    <path d="M -46 -150 Q -48 -60 -30 -46 L 30 -46 Q 48 -60 46 -150 Z" fill="#FFF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -48 -84 Q 0 -96 48 -84 L 44 -40 Q 0 -18 -44 -40 Z" fill="#FFFFFF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <circle cx={-34} cy={-72} r={6} fill="#8FD3F5" stroke={INK} strokeWidth={3} /><circle cx={34} cy={-72} r={6} fill="#8FD3F5" stroke={INK} strokeWidth={3} />
    {[-1, 1].map((sd) => <g key={'a' + sd}><path d={`M ${sd * 40} -138 Q ${sd * 70} ${-118 + b} ${sd * 66} ${-96 + b}`} stroke={INK} strokeWidth={26} fill="none" strokeLinecap="round" />
      <path d={`M ${sd * 40} -138 Q ${sd * 70} ${-118 + b} ${sd * 66} ${-96 + b}`} stroke="#FFF" strokeWidth={15} fill="none" strokeLinecap="round" /></g>)}
    <g transform="translate(0 -214)"><Face t={t} mood={mood} uid={uid} age={0} /><path d="M -8 -62 Q 0 -80 10 -64" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" /></g>
  </g></W>;
};

// ---------- the animals ----------
type AM = 'smug' | 'laugh' | 'look' | 'pop';
const eyeA = (cx: number, cy: number, r: number, mood: AM, lidC: string, key: string) => mood === 'laugh'
  ? <path key={key} d={`M ${cx - r} ${cy + 3} Q ${cx} ${cy - r} ${cx + r} ${cy + 3}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />
  : <g key={key}><ellipse cx={cx} cy={cy} rx={r} ry={r * 1.15} fill="#FFFFFF" stroke={INK} strokeWidth={5} /><circle cx={cx - 2} cy={cy + 2 + (mood === 'smug' ? 4 : 0)} r={r * 0.45} fill={INK} />
    {mood === 'smug' ? <path d={lidPath(cx, cy, r + 0.5, r * 1.15 + 0.5, 0.5)} fill={lidC} stroke={INK} strokeWidth={4.5} strokeLinejoin="round" /> : null}</g>;
// tortoise, side view facing -x, feet at 0
const Tortoise: React.FC<{t: number; x: number; mood: AM; s?: number}> = ({t, x, mood, s = 1}) => {
  const nb = 4 * Math.sin(t * 1.6);
  return <W><g transform={`translate(${x} 0) scale(${s})`}>
    {[-80, -20, 40, 90].map((fx, i) => <path key={i} d={`M ${fx - 20} -40 L ${fx - 24} -4 Q ${fx - 4} 4 ${fx + 18} -4 L ${fx + 16} -40 Z`} fill={SKIN} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />)}
    <path d={`M -100 -70 Q -150 ${-90 + nb} -168 ${-130 + nb}`} stroke={INK} strokeWidth={50} fill="none" strokeLinecap="round" />
    <path d={`M -100 -70 Q -150 ${-90 + nb} -168 ${-130 + nb}`} stroke={SKIN} strokeWidth={38} fill="none" strokeLinecap="round" />
    {[0, 1, 2].map((i) => <path key={'n' + i} d={`M ${-118 - i * 14} ${-72 - i * 12 + nb * 0.4} q 8 10 0 18`} stroke={SKIN_DK} strokeWidth={4} fill="none" />)}
    <ellipse cx={-188} cy={-140 + nb} rx={48} ry={36} fill={SKIN} stroke={INK} strokeWidth={6} />
    {eyeA(-196, -150 + nb, 13, mood, SKIN, 'e')}
    <circle cx={-196} cy={-150 + nb} r={19} fill="none" stroke={INK} strokeWidth={4} />
    <path d={`M -222 ${-124 + nb} Q -204 ${-116 + nb} -188 ${-126 + nb}`} stroke={INK} strokeWidth={4.5} fill="none" strokeLinecap="round" />
    <path d="M -130 -40 Q -130 -230 10 -236 Q 150 -230 150 -40 Z" fill={SHELL} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[[-80, -110], [-10, -160], [60, -110], [-40, -60], [30, -60], [100, -64]].map(([cx, cy], i) =>
      <path key={'h' + i} d={`M ${cx - 26} ${cy} l 13 -22 h 26 l 13 22 l -13 22 h -26 Z`} fill={SHELL_DK} stroke={INK} strokeWidth={4} strokeLinejoin="round" />)}
    <path d="M -140 -40 H 160" stroke={INK} strokeWidth={8} strokeLinecap="round" />
  </g></W>;
};
// Greenland shark, side view facing -x, centre at (x, y)
const GShark: React.FC<{t: number; x: number; y: number; mood: AM; s?: number}> = ({t, x, y, mood, s = 1}) => {
  const sw = 6 * Math.sin(t * 2);
  return <W><g transform={`translate(${x} ${y + sw}) scale(${s})`}>
    <path d={`M 260 0 L 360 ${-60 + sw} L 340 0 L 360 ${60 + sw} Z`} fill={SHARK_DK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -230 0 C -230 -70 -120 -96 40 -90 C 180 -84 270 -40 300 0 C 270 40 180 80 40 84 C -120 88 -230 64 -230 0 Z" fill={SHARK} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    <path d="M -200 20 C -120 60 60 70 260 20" stroke={SHARK_LT} strokeWidth={16} fill="none" strokeLinecap="round" />
    <path d="M 0 -86 L 40 -140 L 70 -84 Z" fill={SHARK_DK} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    <path d="M -40 60 L -80 120 L 10 70 Z" fill={SHARK_DK} stroke={INK} strokeWidth={5.5} strokeLinejoin="round" />
    {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${-104 + i * 14} -24 q -6 20 0 40`} stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />)}
    {eyeA(-168, -26, 12, mood, SHARK, 'e')}
    <path d="M -224 20 Q -190 34 -150 24" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />
    {[[-60, -40], [40, -50], [120, -20], [-20, 20], [80, 30]].map(([px, py], i) => <circle key={'sp' + i} cx={px} cy={py} r={6} fill={SHARK_DK} opacity={0.7} />)}
  </g></W>;
};
const Clam: React.FC<{t: number; x: number; mood: AM; s?: number}> = ({t, x, mood, s = 1}) => {
  const o = 10 + 6 * Math.sin(t * 1.5);
  return <W><g transform={`translate(${x} 0) scale(${s})`}>
    <path d={`M -130 -40 Q -140 ${-150 - o} 0 ${-170 - o} Q 140 ${-150 - o} 130 -40 Z`} fill={CLAM} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-90, -45, 0, 45, 90].map((dx, i) => <path key={i} d={`M 0 -40 L ${dx} ${-150 - o + Math.abs(dx) * 0.3}`} stroke={CLAM_DK} strokeWidth={5} strokeLinecap="round" />)}
    <rect x={-120} y={-52} width={240} height={24} fill="#4A3A40" />
    {eyeA(-30, -40, 12, mood, CLAM, 'a')}{eyeA(30, -40, 12, mood, CLAM, 'b')}
    <path d="M -130 -40 Q 0 30 130 -40 Q 120 -4 0 6 Q -120 -4 -130 -40 Z" fill={CLAM} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
    {[-80, -40, 0, 40, 80].map((dx, i) => <path key={'l' + i} d={`M ${dx * 0.6} -2 L ${dx} -30`} stroke={CLAM_DK} strokeWidth={4} strokeLinecap="round" />)}
    <path d="M -58 -60 q 28 -14 56 0 M 2 -60 q 28 -14 56 0" stroke={INK} strokeWidth={4} fill="none" />
  </g></W>;
};
const Jelly: React.FC<{t: number; x: number; y: number; mood: AM; s?: number}> = ({t, x, y, mood, s = 1}) => {
  const bob = 10 * Math.sin(t * 2.4), sq = 0.05 * Math.sin(t * 4.8);
  return <W><g transform={`translate(${x} ${y + bob}) scale(${(s * (1 + sq)).toFixed(3)} ${(s * (1 - sq)).toFixed(3)})`}>
    {Array.from({length: 9}, (_, i) => { const tx = -64 + i * 16, ph = t * 3 + i * 0.9; return <path key={i} d={`M ${tx} 0 q ${10 * Math.sin(ph)} 60 0 120 t ${-8 * Math.sin(ph)} 110`} stroke={JELLY_DK} strokeWidth={5} fill="none" strokeLinecap="round" />; })}
    {[-30, 0, 30].map((tx, i) => <path key={'o' + i} d={`M ${tx} 0 q ${-16} 40 ${tx * 0.2} 90 q 14 30 -6 70`} stroke={JELLY} strokeWidth={14} fill="none" strokeLinecap="round" opacity={0.9} />)}
    <path d="M -90 0 Q -96 -120 0 -126 Q 96 -120 90 0 Q 68 12 45 0 Q 22 12 0 0 Q -22 12 -45 0 Q -68 12 -90 0 Z" fill={JELLY} stroke={INK} strokeWidth={6} strokeLinejoin="round" opacity={0.95} />
    <path d="M -56 -80 Q -30 -108 14 -110" stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.8} />
    {eyeA(-26, -56, 11, mood, JELLY, 'a')}{eyeA(26, -56, 11, mood, JELLY, 'b')}
    {mood === 'laugh' ? <path d="M -16 -30 Q 0 -16 16 -30 Q 10 -14 0 -12 Q -10 -14 -16 -30 Z" fill="#5A2328" stroke={INK} strokeWidth={4} /> : <path d="M -14 -30 Q 2 -22 16 -34" stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />}
  </g></W>;
};
const Palm: React.FC<{x: number; s: number}> = ({x, s}) => (
  <g transform={`translate(${x} 0) scale(${s})`}>
    <path d="M -10 0 Q -20 -200 30 -400" stroke={INK} strokeWidth={40} fill="none" strokeLinecap="round" />
    <path d="M -10 0 Q -20 -200 30 -400" stroke="#C89A5E" strokeWidth={28} fill="none" strokeLinecap="round" />
    {[-160, -110, -50, 10, 70, 130].map((a, i) => <path key={i} d={`M 30 -400 q ${120 * Math.cos(rad(a))} ${120 * Math.sin(rad(a)) - 20} ${200 * Math.cos(rad(a))} ${200 * Math.sin(rad(a)) + 40}`} stroke={INK} strokeWidth={30} fill="none" strokeLinecap="round" />)}
    {[-160, -110, -50, 10, 70, 130].map((a, i) => <path key={'f' + i} d={`M 30 -400 q ${120 * Math.cos(rad(a))} ${120 * Math.sin(rad(a)) - 20} ${200 * Math.cos(rad(a))} ${200 * Math.sin(rad(a)) + 40}`} stroke={i % 2 ? '#7CC45A' : '#5FA746'} strokeWidth={18} fill="none" strokeLinecap="round" />)}
  </g>
);

// ---------- the story over time ----------
const AGE0 = 118;                          // the counter's value at frame 0 (and where the loop's climb ends)
const ageAt = (t: number): number => {
  if (t < R2) return lerp(AGE0, 190, eout(seg(t, 0, DING1)));
  if (t < R3) return lerp(190, 400, eio(seg(t, R2 + 0.15, DING2)));
  if (t < R4) return lerp(400, 507, eio(seg(t, R3 + 0.15, DING3)));
  if (t < BABY) return t < INF ? lerp(507, 999, seg(t, R4 + 0.2, INF)) : Infinity;
  if (t < R6) return 0;
  return lerp(0, AGE0, eio(seg(t, R6 + 0.2, PUSH)));
};
const beardFor = (age: number) => (age === Infinity ? 900 : clamp((age - 60) * 0.9, 0, 900));
const baseG = (): GS => ({x: 0, y: 0, rot: 0, lean: 0, hip: 70, armA: [-30, 112], armB: [30, 112], feet: [[-27, -12], [27, -12]], mood: 'smug', look: 0, lookY: 0,
  sq: 0, tilt: 0, trem: 0, age: 0, beard: 0, cane: 0, acc: null, s: 1, melt: 0, hide: 0, float: 0});
const guyAt = (t: number): GS => {
  const g = baseG();
  const age = ageAt(t); g.age = age === Infinity ? 999 : age; g.beard = beardFor(age);
  g.look = 1; g.mood = 'smug';
  if (t >= R6) { g.x = -40; g.acc = 'shell'; g.armA = [-50, 96]; g.armB = [56, 70]; g.hide = t < PUSH - 0.2 ? 1 : 0; return g; }
  if (t < R2) { g.x = -40; g.acc = 'shell'; g.armA = [-50, 96]; g.armB = [56, 70]; g.mood = t > DING1 ? 'joy' : 'smug'; return g; }
  if (t < R3) { g.acc = 'fin'; g.y = -120; g.float = 1; g.armA = [-70, 60]; g.armB = [70, 60]; g.feet = [[-34, -6], [30, -18]]; g.mood = t > DING2 ? 'joy' : 'smug'; return g; }
  if (t < R4) { g.acc = 'clam'; g.y = -30; g.mood = t > DING3 ? 'joy' : 'smug'; g.armA = [-60, 60]; g.armB = [60, 60]; g.feet = [[-30, -40], [30, -40]]; return g; }
  if (t < R5) {             // the immortal jellyfish: older and older
    g.acc = 'jelly'; g.y = -90; g.float = 1; g.mood = t < INF ? 'pop' : 'joy'; g.armA = [-64, 40]; g.armB = [64, 40];
    if (t > INF + 0.35) { g.mood = 'happy'; g.armA = [-60, -96]; g.armB = [60, -96]; }
    return g;
  }
  // older and older, then the melt on the sea floor
  g.acc = 'jelly'; g.y = -20 * (1 - seg(t, R5, R5 + 0.4)); g.mood = 'old'; g.cane = eout(seg(t, R5 + 0.1, R5 + 0.4)); g.armB = [52, 44]; g.armA = [-34, 106];
  g.lean = 6 * seg(t, R5, T.old + 0.2); g.tilt = 5 * seg(t, R5, T.old + 0.2); g.trem = 0.5;
  g.beard = 900;
  if (t > MELT0) { g.melt = eio(seg(t, MELT0, MELT1)); g.mood = 'melt'; g.cane = 1 - seg(t, MELT0, MELT0 + 0.2); }
  if (t > MELT1) g.hide = 1;
  return g;
};

// ---------- camera (piecewise, hard cuts) ----------
const CAM0 = {x: 92, y: -232, k: 2.3};
const camFor = (t: number): {x: number; y: number; k: number} => {
  if (t < R2) { const u = eio(seg(t, 0, R2)); return {x: lerp(CAM0.x, 100, u), y: lerp(CAM0.y, -236, u), k: lerp(CAM0.k, 2.42, u)}; }
  if (t < R3) { const u = eio(seg(t, R2, R3)); return {x: lerp(120, 132, u), y: lerp(-330, -336, u), k: lerp(2.15, 2.25, u)}; }
  if (t < R4) { const u = eio(seg(t, R3, R4)); return {x: lerp(104, 110, u), y: lerp(-236, -240, u), k: lerp(2.3, 2.42, u)}; }
  if (t < R5) { const u = eio(seg(t, R4, R5)); return {x: lerp(110, 116, u), y: lerp(-330, -320, u), k: lerp(2.05, 2.2, u)}; }
  if (t < R6) { const u = eio(seg(t, R5, R6)); return {x: lerp(40, 36, u), y: lerp(-200, -150, u), k: lerp(2.6, 2.9, u)}; }
  const u = eio(seg(t, R6, PUSH));
  return {x: lerp(70, CAM0.x, u), y: lerp(-200, CAM0.y, u), k: lerp(2.6, CAM0.k, u)};
};
const rungOf = (t: number) => (t < R2 || t >= R6 ? 0 : t < R3 ? 1 : t < R4 ? 2 : 3);

export const LifeScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}; thumb?: boolean; uid?: string}> = ({t, camK, thumb, uid = 'm'}) => {
  const g = guyAt(t);
  const c0 = camK ?? camFor(t);
  const sh = shake(t, hit(t, 0, 4, 7) + hit(t, MELT1, 7, 6) + hit(t, BABY, 5, 7) + hit(t, R2, 3, 8) + hit(t, R3, 3, 8) + hit(t, R4, 3, 8));
  const cam = {x: c0.x + sh.x / c0.k, y: c0.y + sh.y / c0.k, z: 1000 - 1000 / c0.k};
  const rung = rungOf(t);
  const amood = (ding: number): AM => (t > ding && t < ding + 0.6 ? 'laugh' : 'smug');
  const age = ageAt(t);
  const bg = rung === 0 ? null : rung === 1 ? DEEP : rung === 2 ? SEAFL : OPEN;
  const st = {
    melt: popIn(t, T.melt, 0.18) * (1 - seg(t, T.blob - 0.1, T.blob)),
    splorch: popIn(t, MELT1, 0.18) * (1 - seg(t, POLYP - 0.1, POLYP)),
    waa: popIn(t, BABY + 0.2, 0.2) * (1 - seg(t, R6 - 0.1, R6)),
  };
  const blobS = t < MELT1 || t >= BABY ? 0 : 1 - eio(seg(t, POLYP - 0.15, POLYP + 0.05)) * 0.6;
  const babyS = t < BABY ? 0 : t < R6 ? 0.62 : lerp(0.62, 1, eio(seg(t, R6 + 0.2, PUSH - 0.25)));
  const showBaby = t >= BABY && t < PUSH - 0.2;
  if (showBaby) g.hide = 1;
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <svg width={0} height={0} style={{position: 'absolute'}}><defs>
        <radialGradient id={`lFace${uid}`} cx="0.38" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.7" stopColor="#F4F2EE" /><stop offset="1" stopColor="#D5D2CC" /></radialGradient>
      </defs></svg>
      {bg ? <AbsoluteFill style={{background: bg}} /> : null}
      {bg ? <AbsoluteFill>{Array.from({length: 5}, (_, i) => <div key={i} style={{position: 'absolute', left: 80 + i * 230, top: -100, width: 70, height: 2200, background: 'rgba(255,255,255,0.10)', transform: 'rotate(14deg)'}} />)}</AbsoluteFill> : null}
      <Layer cam={cam} z={1000}><W><g>
        {rung === 0 ? <g>
          <rect x={-3000} y={-300} width={6000} height={260} fill={SEA} />
          <path d="M -3000 -40 Q -2600 -60 -2200 -40 T -1400 -40 T -600 -40 T 200 -40 T 1000 -40 T 1800 -40 T 2600 -40" stroke="#FFFFFF" strokeWidth={10} fill="none" />
          <path d="M -3000 -300 H 3000" stroke={INK} strokeWidth={6} />
          <rect x={-3000} y={-40} width={6000} height={3000} fill={SAND} />
          <path d="M -3000 -40 H 3000" stroke={INK} strokeWidth={6} />
          <Palm x={-520} s={1.05} /><Palm x={560} s={0.9} />
          {Array.from({length: 14}, (_, i) => <circle key={i} cx={-900 + i * 140 + (i % 3) * 30} cy={30 + (i % 4) * 30} r={7} fill={SAND_DK} />)}
        </g> : <g>
          <rect x={-3000} y={0} width={6000} height={3000} fill={rung === 3 ? '#D9C99A' : '#CBB98A'} />
          <path d="M -3000 0 Q -2600 -20 -2200 0 T -1400 0 T -600 0 T 200 0 T 1000 0 T 1800 0 T 2600 0" stroke={INK} strokeWidth={6} fill="none" />
          {[-420, -300, 420, 600].map((x, i) => <path key={i} d={`M ${x} 0 C ${x - 30} -120 ${x + 40} -200 ${x + 10} ${-300 - 10 * Math.sin(t * 2 + i)} C ${x + 60} -200 ${x + 20} -120 ${x + 26} 0 Z`} fill={i % 2 ? '#7CC47A' : '#4F9A55'} stroke={INK} strokeWidth={5} strokeLinejoin="round" />)}
          {Array.from({length: 8}, (_, i) => { const ph = (t * 0.5 + i * 0.17) % 1; return <circle key={'b' + i} cx={-380 + i * 110 + 14 * Math.sin(t * 3 + i)} cy={-40 - ph * 800} r={7 + (i % 3) * 4} fill="none" stroke="#FFFFFF" strokeWidth={4} opacity={1 - ph * 0.6} />; })}
        </g>}
      </g></W></Layer>
      <Layer cam={cam} z={1000}>
        {rung === 0 && t < R2 ? <Tortoise t={t} x={AX + 70} mood={amood(DING1)} s={0.9} /> : null}
        {rung === 0 && t >= R6 ? <Tortoise t={t} x={AX + 70} mood="smug" s={0.9} /> : null}
        {rung === 1 ? <GShark t={t} x={AX + 150} y={-300} mood={amood(DING2)} s={0.85} /> : null}
        {rung === 2 ? <Clam t={t} x={AX + 20} mood={amood(DING3)} s={0.9} /> : null}
        {rung === 3 && t < R6 ? <Jelly t={t} x={AX + 40} y={t < R5 ? -400 : -330} mood={t > BABY && t < R6 ? 'laugh' : t > MELT1 ? 'look' : 'smug'} s={0.85} /> : null}
        <GuyL t={t} g={g} uid={uid} />
        {blobS > 0.01 ? <Blob t={t} x={0} s={blobS} uid={uid} /> : null}
        {t > POLYP - 0.05 && t < BABY + 0.1 ? <W><g transform={`translate(0 ${-50 * blobS})`}>
          <path d="M 0 0 L 0 -60" stroke={INK} strokeWidth={14} /><path d="M 0 0 L 0 -60" stroke="#FFF" strokeWidth={6} />
          {[-40, -20, 0, 20, 40].map((a, i) => <path key={i} d={`M 0 -60 l ${30 * Math.sin(rad(a))} ${-30 * Math.cos(rad(a))}`} stroke={INK} strokeWidth={6} strokeLinecap="round" />)}</g></W> : null}
        {showBaby ? <Baby t={t} x={t < R6 ? 0 : lerp(0, -40, seg(t, R6, R6 + 0.5))} s={babyS} uid={uid} mood="baby" /> : null}
        <Poof t={t} at={R2 - 0.12} x={0} y={-230} s={1.4} />
        <Poof t={t} at={R3 - 0.12} x={0} y={-230} s={1.4} />
        <Poof t={t} at={R4 - 0.12} x={0} y={-300} s={1.4} />
        <Poof t={t} at={BABY - 0.12} x={0} y={-80} s={1.3} />
        <Poof t={t} at={PUSH - 0.32} x={-40} y={-200} s={1.3} />
      </Layer>
      {thumb ? null : <Layer cam={cam} z={1000}>
        <Txt x={110} y={-330} s={st.melt} text="DRIP" size={44} rot={-6} fill="#FFFFFF" />
        <Txt x={140} y={-200} s={st.splorch} text="BLOB" size={60} rot={6} fill="#FFFFFF" />
        <Txt x={120} y={-230} s={st.waa} text="WAAH" size={52} rot={-6} fill={GOLD} />
      </Layer>}
      {thumb ? null : <>
        <AgeBoard t={t} age={age} />
        <Card text="TORTOISE" top={1452} color="#FFFFFF" rot={-3} s={1 - seg(t, R2 - 0.12, R2)} size={84} />
        <Card text="GREENLAND SHARK" top={1452} color="#FFFFFF" rot={3} s={popIn(t, T.shark - 0.2, 0.26) * (1 - seg(t, R3 - 0.1, R3))} size={68} />
        <Card text="AN OLD CLAM" top={1452} color="#FFFFFF" rot={-3} s={popIn(t, T.clam - 0.2, 0.26) * (1 - seg(t, R4 - 0.1, R4))} size={80} />
        <Card text="IMMORTAL JELLYFISH" top={1452} color={GOLD} rot={3} s={popIn(t, T.immortal - 0.04, 0.28) * (1 - seg(t, T.never - 0.1, T.never))} size={64} />
        <Card text="NEVER DIES OF OLD AGE" top={1452} color="#FFFFFF" rot={-3} s={popIn(t, T.never - 0.04, 0.28) * (1 - seg(t, R5 - 0.1, R5))} size={58} />
        <Card text="MELTS INTO A BLOB" top={1452} color={RED} fg="#fff" rot={3} s={popIn(t, T.melt - 0.04, 0.28) * (1 - seg(t, BABY - 0.1, BABY)) * pulse(t, MELT1)} size={66} />
        <Card text="BACK TO A BABY" top={1452} color={RED} fg="#fff" rot={-3} s={popIn(t, BABY, 0.28) * (1 - seg(t, R6 - 0.1, R6)) * pulse(t, BABY)} size={74} />
        <Card text="AGAIN AND AGAIN" top={1452} color={GOLD} rot={3} s={popIn(t, T.start - 0.04, 0.28) * (1 - seg(t, PUSH - 0.12, PUSH))} size={70} />
        <CommentBubble t={t} text="what if you lived as long as animals??" handle="@oldtimer_doodle" likes="3.6K" y={400} />
        <CallToAction t={t} at={T.cta} y={250} />
        <CommentAsk t={t} at={T.then} until={PUSH - 0.4} text="Would you want to live forever?" y={280} />
      </>}
    </AbsoluteFill>
  );
};
/** the AGE counter with the rungs ranked under it */
const RUNGS: {label: string; v: string; at: number}[] = [
  {label: 'TORTOISE', v: '190', at: DING1}, {label: 'GREENLAND SHARK', v: '~400', at: DING2}, {label: 'OLD CLAM', v: '507', at: DING3}, {label: 'IMMORTAL JELLYFISH', v: '∞', at: INF},
];
const AgeBoard: React.FC<{t: number; age: number}> = ({t, age}) => {
  const spin = t > R4 + 0.2 && t < INF;
  const val = age === Infinity ? '∞' : spin ? String(Math.floor(507 + rnd(Math.floor(t * 20)) * 9000)) : String(Math.round(age));
  const ding = [DING1, DING2, DING3, INF, BABY].reduce((a, d) => a + Math.max(0, 1 - Math.abs(t - d - 0.1) * 6), 0);
  const top = t < 1.9 ? 690 : 560;
  const shown = RUNGS.filter((r) => t > r.at && t < BABY + 0.1 || (t >= R6 && false));
  const red = t >= BABY && t < R6;
  return <div style={{position: 'absolute', left: 540, top, transform: `translate(-50%,-50%) rotate(-2deg) scale(${(1 + 0.12 * ding).toFixed(3)})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
    <div style={{background: '#FFFDF6', border: `9px solid ${INK}`, borderRadius: 28, boxShadow: `0 9px 0 ${INK}`, padding: '4px 34px 8px', fontFamily: FONT, color: INK, textAlign: 'center', whiteSpace: 'nowrap'}}>
      <div style={{fontWeight: FONT_W, fontSize: 34, letterSpacing: 2}}>YOUR AGE</div>
      <div style={{fontWeight: FONT_W, fontSize: age === Infinity ? 150 : 120, lineHeight: 1, color: red ? RED : INK, minWidth: 260}}>{val}</div>
    </div>
    {shown.length ? <div style={{display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch'}}>
      {shown.map((r, i) => <div key={r.label} style={{display: 'flex', justifyContent: 'space-between', gap: 22, background: i === shown.length - 1 ? GOLD : '#FFFFFF', border: `6px solid ${INK}`, borderRadius: 16,
        padding: '2px 16px', fontFamily: FONT, fontWeight: FONT_W, fontSize: 30, color: INK, transform: `scale(${popIn(t, r.at, 0.25).toFixed(3)})`, transformOrigin: 'left center'}}>
        <span>{r.label}</span><span>{r.v}</span></div>)}
    </div> : null}
  </div>;
};

export const LifeVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const ticks = (a: number, b: number, n: number, db = -30): Cue[] => Array.from({length: n}, (_, i) => ({f: i % 2 ? 'tick.wav' : 'tick2.wav', at: lerp(a, b, (i + 1) / n), db: i === n - 1 ? -20 : db}));
  const cues: Cue[] = [
    // frame 0: the counter is already racing (rewind whirr + ticks), DING at 190
    {f: 'rewind.wav', at: 0, db: -10}, {f: 'whoosh.wav', at: 0, db: -20, from: 0.12}, ...ticks(0.05, DING1 - 0.1, 12, -27), {f: 'ding.mp3', at: DING1, db: -14}, {f: 'confetti.wav', at: DING1 + 0.02, db: -22},
    // shark
    {f: 'pop.wav', at: R2 - 0.12, db: -12}, {f: 'bubbles.wav', at: R2, db: -20}, ...ticks(R2 + 0.2, DING2 - 0.1, 14, -28), {f: 'ding.mp3', at: DING2, db: -14},
    // clam
    {f: 'pop.wav', at: R3 - 0.12, db: -12}, {f: 'bubbles.wav', at: R3, db: -22}, ...ticks(R3 + 0.2, DING3 - 0.1, 10, -28), {f: 'ding.mp3', at: DING3, db: -14}, {f: 'clack.wav', at: DING3 + 0.3, db: -22},
    // the immortal jellyfish: digits spin, infinity
    {f: 'pop.wav', at: R4 - 0.12, db: -12}, {f: 'shimmer.wav', at: R4 + 0.1, db: -19}, {f: 'whir.mp3', at: R4 + 0.3, db: -20, to: INF - R4 - 0.3}, ...ticks(R4 + 0.3, INF - 0.1, 18, -29),
    {f: 'ding.mp3', at: INF, db: -12}, {f: 'confetti.wav', at: INF + 0.02, db: -20}, {f: 'pop.wav', at: T.never - 0.04, db: -21},
    ...ctaCues(T.cta),
    // older and older, the melt, the blob, the baby
    {f: 'whoosh.wav', at: R5 - 0.03, db: -30}, {f: 'squeak.wav', at: R5 + 0.3, db: -24}, {f: 'stretch.wav', at: MELT0, db: -12, to: 0.7}, {f: 'squelch.wav', at: MELT1 - 0.05, db: -6},
    {f: 'thud.wav', at: MELT1, db: -14}, {f: 'pop.wav', at: T.melt - 0.04, db: -20}, {f: 'bubbles.wav', at: MELT1 + 0.1, db: -22},
    {f: 'pop.wav', at: BABY - 0.12, db: -10}, {f: 'squeak.wav', at: BABY + 0.15, db: -16}, {f: 'crowd_laugh.wav', at: BABY + 0.2, db: -21, to: 1.1}, {f: 'giggle.mp3', at: BABY + 0.3, db: -24, to: 0.7},
    // start all over again
    {f: 'whoosh.wav', at: R6 - 0.03, db: -30}, ...ticks(R6 + 0.25, PUSH - 0.1, 12, -29), {f: 'pop.wav', at: T.start - 0.04, db: -21}, {f: 'pop.wav', at: PUSH - 0.32, db: -14},
    {f: 'whoosh.wav', at: PUSH - 0.05, db: -22},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<LifeScene t={0} />}>
        <LifeScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="lifespan/vo/tight.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const LifeWide: React.FC = () => <WideFit.Provider value={0.72}><LifeVideo /></WideFit.Provider>;
