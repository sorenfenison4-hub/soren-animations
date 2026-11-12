// "Why can't he sleep?" - a story Short at night. The guy lies wide awake in a perfect hotel bed: it's his first night
// there, and every little sound wakes him (fridge, footsteps, the ice machine). It's not the bed, it's his brain: on the
// first night somewhere new, the left half of the brain sleeps lighter and keeps listening, like a night guard
// (dolphins sleep with half the brain at a time). By night two he sleeps fine... except tomorrow he moves to a new
// hotel, and the loop drops him back at 3:07 AM, wide awake. Everything is drawn in code, lit by moonlight.
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {FPS, INK, FONT, Layer, camAt, W, Star, Badge, SoundLayer, Cue, seg, popIn, spring, lerp, eio, eout, rnd, shake, hit,
  WideFit, LoopOut, LOOP_DUR, Look, CallToAction, ctaCues, HookTitle, CTA_DUR} from './lib/kit';

// voice take1-trim.mp3 at 0.1 s: video time = Scribe time + 0.07. Last word ends 35.32 s; + 0.8 s for the loop push.
export const DURATION = 36.1;
export const T = {
  blink: 0.1, flip: 0.25,                          // opening: he blinks, the clock flips to 3:08
  bed: 2.87, perfect: 3.51,                        // "...and the bed is perfect."
  first: 5.31, hotel: 6.07,                        // "It's his first night in this hotel,"
  every: 7.11, wakes: 8.19,                        // "and every little sound wakes him up."
  fridge: 9.67, steps: 10.71, ice: 12.0,           // "The fridge. Footsteps. The ice machine."
  so: 13.51, notbed: 14.47, brain: 15.75,          // "So, it's not the bed. It's his brain."
  newp: 17.6, left: 19.83, lighter: 21.0,          // "On your first night somewhere new, the left half of your brain sleeps lighter,"
  listen: 22.39, guard: 23.43,                     // "and keeps listening, like a night guard."
  dolphins: 24.67, further: 25.75, half: 27.51, time: 28.79, // "Dolphins go even further. They sleep with half their brain at a time."
  night2: 30.0, fine: 31.31,                       // "So by the second night, he sleeps fine."
  except: 32.71, moves: 33.99, newHotel: 34.63,    // "Except tomorrow, he moves to a new hotel."
  cta: 29.75,
};

// ---------- palette (night, moonlight from the window on the right) ----------
const WALL = '#2B3158', WALL2 = '#323A66', TRIM = '#232849', FLOOR = '#3A2D48', FLOOR2 = '#33273F';
const WOOD = '#6B4F3A', WOOD2 = '#55402F', SHEET = '#C9D3F2', BLANKET = '#7F8FCB', BLANKET2 = '#6676B3';
const MOON = '#DCE8FF', WARM = '#FFC56B', GOLD = '#FFD43B', CLOCK = '#FF5A47';
const HX = -300, HY = -440, HR = 82;              // his head on the pillow
const WIN = {x0: 300, x1: 700, y0: -1260, y1: -740};
const DOOR = {x0: 900, x1: 1190, y0: -700};
const PAINT = {x: -60, y: -930, w: 440, h: 280};

// ---------- small helpers ----------
const Txt: React.FC<{x: number; y: number; s: number; text: string; size?: number; rot?: number; fill?: string}> = ({x, y, s, text, size = 80, rot = 0, fill = '#FFFFFF'}) => s > 0.01 ? (
  <W><text x={0} y={0} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`} textAnchor="middle" dominantBaseline="middle"
    fontFamily={FONT} fontWeight={900} fontSize={size} fill={fill} stroke={INK} strokeWidth={size * 0.17} strokeLinejoin="round"
    style={{paintOrder: 'stroke'}} letterSpacing={-1}>{text}</text></W>) : null;
const pulse = (t: number, a: number, d: number) => popIn(t, a, 0.3) * (1 - seg(t, a + d, a + d + 0.25));
/** a soft light pool (see-through: lives in a paper={false} layer) */
const Glow: React.FC<{x: number; y: number; r: number; color: string; a: number}> = ({x, y, r, color, a}) => a > 0.005 ? (
  <div style={{position: 'absolute', left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: '50%', opacity: a,
    background: `radial-gradient(circle, ${color} 0%, ${color}88 30%, ${color}00 68%)`}} />) : null;

// ---------- gradients (shading) ----------
const Defs: React.FC = () => (
  <W><defs>
    <radialGradient id="hHead" cx="0.62" cy="0.32" r="0.8"><stop offset="0" stopColor="#FFFFFF" /><stop offset="0.55" stopColor="#E8ECF7" /><stop offset="1" stopColor="#A8B0CF" /></radialGradient>
    <linearGradient id="hBlanket" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9DAAE0" /><stop offset="0.6" stopColor={BLANKET} /><stop offset="1" stopColor="#56639E" /></linearGradient>
    <linearGradient id="hPillow" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#EEF2FF" /><stop offset="1" stopColor="#A9B3D6" /></linearGradient>
    <linearGradient id="hWood" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#82634B" /><stop offset="1" stopColor={WOOD2} /></linearGradient>
    <linearGradient id="hCurtain" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6E2F45" /><stop offset="0.5" stopColor="#8E3D58" /><stop offset="1" stopColor="#5A2538" /></linearGradient>
    <linearGradient id="hSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0E1430" /><stop offset="1" stopColor="#24305E" /></linearGradient>
    <linearGradient id="hSea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4C8FC9" /><stop offset="1" stopColor="#1F4F86" /></linearGradient>
    <linearGradient id="hBeam" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor={MOON} stopOpacity={0.42} /><stop offset="1" stopColor={MOON} stopOpacity={0.05} /></linearGradient>
    <linearGradient id="hSpill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={WARM} stopOpacity={0.55} /><stop offset="1" stopColor={WARM} stopOpacity={0} /></linearGradient>
    <linearGradient id="hFridge" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#D8DCE8" /><stop offset="1" stopColor="#8E95AE" /></linearGradient>
    <radialGradient id="hBrainA" cx="0.55" cy="0.4" r="0.7"><stop offset="0" stopColor="#FFC4D3" /><stop offset="1" stopColor="#F27D9C" /></radialGradient>
    <radialGradient id="hBrainS" cx="0.5" cy="0.4" r="0.7"><stop offset="0" stopColor="#A99BCB" /><stop offset="1" stopColor="#6D6496" /></radialGradient>
    <filter id="hBlur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9" /></filter>
  </defs></W>
);

// ---------- the room (wall with a window hole, floor) ----------
const Room: React.FC = () => {
  const hole = `M ${WIN.x0} ${WIN.y0} H ${WIN.x1} V ${WIN.y1} H ${WIN.x0} Z`;
  return (
    <W>
      <path d={`M -3000 -3200 H 3000 V 0 H -3000 Z ${hole}`} fill={WALL} fillRule="evenodd" />
      {/* wallpaper stripes, clipped around the window */}
      {Array.from({length: 40}, (_, i) => {
        const x = -2500 + i * 130;
        if (x + 40 > WIN.x0 && x < WIN.x1) return <g key={i}>
          <rect x={x} y={-3200} width={40} height={3200 + WIN.y0} fill={WALL2} />
          <rect x={x} y={WIN.y1} width={40} height={-WIN.y1 - 300} fill={WALL2} /></g>;
        return <rect key={i} x={x} y={-3200} width={40} height={2900} fill={WALL2} />;
      })}
      {/* wainscot + skirting */}
      <rect x={-3000} y={-300} width={6000} height={300} fill={TRIM} />
      <rect x={-3000} y={-312} width={6000} height={16} fill="#3A4170" stroke={INK} strokeWidth={5} />
      {Array.from({length: 24}, (_, i) => <rect key={i} x={-2400 + i * 220} y={-260} width={170} height={210} rx={10} fill="none" stroke="#1B2040" strokeWidth={7} />)}
      <rect x={-3000} y={-30} width={6000} height={30} fill="#1E2342" />
      {/* carpet */}
      <rect x={-3000} y={0} width={6000} height={2400} fill={FLOOR} />
      {Array.from({length: 22}, (_, i) => <path key={i} d={`M -3000 ${60 + i * 110} ${Array.from({length: 40}, (_, k) => `Q ${-3000 + k * 150 + 37} ${60 + i * 110 + 18} ${-3000 + k * 150 + 75} ${60 + i * 110} T ${-3000 + (k + 1) * 150} ${60 + i * 110}`).join(' ')}`}
        stroke={FLOOR2} strokeWidth={8} fill="none" />)}
      <path d="M -3000 0 H 3000" stroke={INK} strokeWidth={8} />
    </W>
  );
};
/** night outside the window (far layer): gradient sky, stars, a crescent Moon, a city skyline */
const Outside: React.FC<{t: number; moonX: number}> = ({t, moonX}) => (
  <W>
    <rect x={-800} y={-2600} width={3200} height={2600} fill="url(#hSky)" />
    {Array.from({length: 40}, (_, i) => <circle key={i} cx={-300 + rnd(i * 3 + 1) * 2200} cy={-2200 + rnd(i * 5 + 2) * 1500} r={3 + rnd(i) * 4}
      fill="#FFF3C4" opacity={0.45 + 0.4 * Math.sin(t * 2.2 + i * 1.7)} />)}
    <g transform={`translate(${moonX} -1260)`}>
      <circle r={110} fill="#FFF6D6" opacity={0.18} />
      <path d="M 40 -62 A 72 72 0 1 0 40 62 A 56 56 0 1 1 40 -62 Z" fill="#FFF3C4" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    </g>
    {/* skyline */}
    <path d="M -600 -700 V -880 H -480 V -960 H -380 V -840 H -260 V -1010 H -120 V -900 H 0 V -980 H 130 V -860 H 260 V -940 H 380 V -820 H 520 V -1000 H 640 V -880 H 800 V -950 H 940 V -830 H 1100 V -980 H 1250 V -700 Z"
      fill="#151B3A" stroke={INK} strokeWidth={6} />
    {Array.from({length: 26}, (_, i) => <rect key={i} x={-540 + rnd(i * 7) * 1700} y={-960 + rnd(i * 11) * 220} width={16} height={22} fill={WARM}
      opacity={rnd(i * 13) > 0.5 ? 0.8 : 0.25} />)}
  </W>
);
/** window frame, sill and curtains (on the wall layer, over the hole) */
const Window: React.FC = () => {
  const {x0, x1, y0, y1} = WIN, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  return (
    <W>
      <rect x={x0 - 14} y={y0 - 14} width={x1 - x0 + 28} height={y1 - y0 + 28} fill="none" stroke="#DCD3C0" strokeWidth={22} />
      <rect x={x0 - 26} y={y0 - 26} width={x1 - x0 + 52} height={y1 - y0 + 52} fill="none" stroke={INK} strokeWidth={7} />
      <path d={`M ${mx} ${y0} V ${y1} M ${x0} ${my} H ${x1}`} stroke="#DCD3C0" strokeWidth={16} />
      <path d={`M ${mx} ${y0} V ${y1} M ${x0} ${my} H ${x1}`} stroke={INK} strokeWidth={4} strokeOpacity={0.4} />
      <rect x={x0 - 60} y={y1 + 12} width={x1 - x0 + 120} height={30} rx={6} fill="#DCD3C0" stroke={INK} strokeWidth={7} />
      {/* curtains */}
      <path d={`M ${x0 - 150} ${y0 - 70} H ${x0 + 30} Q ${x0 - 10} ${my} ${x0 + 40} ${y1 + 140} H ${x0 - 170} Q ${x0 - 130} ${my} ${x0 - 150} ${y0 - 70} Z`}
        fill="url(#hCurtain)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      <path d={`M ${x1 + 150} ${y0 - 70} H ${x1 - 30} Q ${x1 + 10} ${my} ${x1 - 40} ${y1 + 140} H ${x1 + 170} Q ${x1 + 130} ${my} ${x1 + 150} ${y0 - 70} Z`}
        fill="url(#hCurtain)" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {[x0 - 100, x0 - 40, x1 + 40, x1 + 100].map((x, i) => <path key={i} d={`M ${x} ${y0 - 50} Q ${x + 14} ${my} ${x + (i < 2 ? 10 : -10)} ${y1 + 120}`} stroke="#4A1D2D" strokeWidth={6} fill="none" />)}
      <rect x={x0 - 200} y={y0 - 92} width={x1 - x0 + 400} height={26} rx={13} fill="#B9A27A" stroke={INK} strokeWidth={7} />
    </W>
  );
};
/** the door to the hallway: warm light leaks under it; feet shadows cross the strip */
const Door: React.FC<{t: number}> = ({t}) => {
  const {x0, x1, y0} = DOOR;
  return (
    <W>
      <rect x={x0 - 22} y={y0 - 22} width={x1 - x0 + 44} height={-y0 + 22} fill="#DCD3C0" stroke={INK} strokeWidth={7} />
      <rect x={x0} y={y0} width={x1 - x0} height={-y0 - 12} fill="url(#hWood)" stroke={INK} strokeWidth={7} />
      <rect x={x0 + 40} y={y0 + 50} width={x1 - x0 - 80} height={240} rx={8} fill="none" stroke={WOOD2} strokeWidth={8} />
      <rect x={x0 + 40} y={y0 + 340} width={x1 - x0 - 80} height={250} rx={8} fill="none" stroke={WOOD2} strokeWidth={8} />
      <circle cx={x0 + 40} cy={y0 / 2 + 10} r={16} fill={GOLD} stroke={INK} strokeWidth={6} />
      {/* do-not-disturb hanger */}
      <g transform={`translate(${x0 + 40} ${y0 / 2 + 10}) rotate(${4 * Math.sin(t * 1.3)})`}>
        <rect x={-34} y={22} width={68} height={130} rx={10} fill="#F0E6C8" stroke={INK} strokeWidth={5} />
        <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={INK}>DO</text>
        <text x={0} y={96} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={22} fill={INK}>NOT</text>
        <text x={0} y={122} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={13} fill={INK}>DISTURB</text>
      </g>
      {/* gap under the door */}
      <rect x={x0} y={-12} width={x1 - x0} height={12} fill={WARM} />
      {[0, 1].map((k) => {
        const u = seg(t, T.steps + k * 0.18, T.steps + 1.5 + k * 0.18);
        if (u <= 0 || u >= 1) return null;
        const fx = lerp(x1 + 40, x0 - 80, u) + (k ? 30 : 0);
        const down = Math.sin(u * Math.PI * 4 + k * Math.PI) > 0;
        return down ? <rect key={k} x={fx} y={-12} width={60} height={12} fill="#3A2A20" /> : null;
      })}
    </W>
  );
};
/** minibar fridge under a little desk, with a green power light */
const Fridge: React.FC<{t: number}> = ({t}) => {
  const hum = t > T.fridge && t < T.fridge + 1.2 || (t > T.night2 + 0.4 && t < T.night2 + 1.6);
  const j = hum ? 2.5 * Math.sin(t * 2 * Math.PI * 22) : 0;
  return (
    <W>
      <rect x={-1130} y={-420} width={420} height={34} rx={6} fill="url(#hWood)" stroke={INK} strokeWidth={7} />
      <rect x={-1110} y={-386} width={24} height={386} fill={WOOD2} stroke={INK} strokeWidth={6} />
      <rect x={-754} y={-386} width={24} height={386} fill={WOOD2} stroke={INK} strokeWidth={6} />
      <g transform={`translate(${j} 0)`}>
        <rect x={-1040} y={-290} width={230} height={290} rx={16} fill="url(#hFridge)" stroke={INK} strokeWidth={7} />
        <rect x={-830} y={-250} width={12} height={90} rx={6} fill="#6C7390" stroke={INK} strokeWidth={4} />
        <circle cx={-1010} cy={-262} r={8} fill="#7CFF8A" />
        <text x={-925} y={-120} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill="#5D6482">MINIBAR</text>
      </g>
    </W>
  );
};
/** hum lines around the fridge */
const HumLines: React.FC<{t: number; a: number}> = ({t, a}) => {
  const s = pulse(t, a, 1.0); if (s < 0.01) return null;
  return <W><g transform={`translate(-925 -150) scale(${s})`}>
    {[0, 1, 2].map((i) => <path key={i} d={`M ${170 + i * 40} ${-60 + i * 10} q 14 20 0 40 q -14 20 0 40 q 14 20 0 40`} stroke={MOON} strokeWidth={8} fill="none" strokeLinecap="round"
      opacity={0.5 + 0.5 * Math.sin(t * 20 + i)} />)}
    {[0, 1, 2].map((i) => <path key={i} d={`M ${-170 - i * 40} ${-60 + i * 10} q -14 20 0 40 q 14 20 0 40 q -14 20 0 40`} stroke={MOON} strokeWidth={8} fill="none" strokeLinecap="round"
      opacity={0.5 + 0.5 * Math.sin(t * 20 + i)} />)}
  </g></W>;
};
/** bedside table, lamp (off), alarm clock and phone */
const Nightstand: React.FC<{t: number; time: string; phone: number}> = ({t, time, phone}) => {
  const buzz = phone > 0 ? 3 * Math.sin(t * 2 * Math.PI * 25) * (Math.sin(t * 9) > 0.2 ? 1 : 0) : 0;
  return (
    <W>
      <rect x={-680} y={-330} width={210} height={330} rx={10} fill="url(#hWood)" stroke={INK} strokeWidth={7} />
      <rect x={-662} y={-250} width={174} height={90} rx={6} fill="none" stroke={WOOD2} strokeWidth={6} />
      <circle cx={-575} cy={-205} r={9} fill={GOLD} stroke={INK} strokeWidth={4} />
      {/* lamp */}
      <rect x={-650} y={-350} width={60} height={22} rx={6} fill="#5B5F7E" stroke={INK} strokeWidth={6} />
      <rect x={-626} y={-470} width={12} height={124} fill="#5B5F7E" stroke={INK} strokeWidth={5} />
      <path d="M -690 -470 L -660 -580 L -580 -580 L -550 -470 Z" fill="#B7A98C" stroke={INK} strokeWidth={7} strokeLinejoin="round" />
      {/* clock */}
      <rect x={-580} y={-392} width={102} height={62} rx={12} fill="#1A1D2E" stroke={INK} strokeWidth={6} />
      <text x={-529} y={-350} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={CLOCK} filter="url(#hBlur)" opacity={0.9}>{time}</text>
      <text x={-529} y={-350} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={34} fill={CLOCK}>{time}</text>
      {/* phone lying on the table, beside the clock */}
      <g transform={`translate(${-640 + buzz} -336)`}>
        <rect x={-34} y={-10} width={72} height={12} rx={4} fill="#2A2D3D" stroke={INK} strokeWidth={5} />
        {phone > 0 ? <rect x={-28} y={-12} width={60} height={4} rx={2} fill="#BFE3FF" opacity={phone} /> : null}
      </g>
    </W>
  );
};
/** the bed (side view): headboard on the left, footboard on the right */
const Bed: React.FC = () => (
  <W>
    <rect x={-470} y={-760} width={70} height={760} rx={26} fill="url(#hWood)" stroke={INK} strokeWidth={8} />
    <rect x={-455} y={-700} width={40} height={300} rx={14} fill="none" stroke={WOOD2} strokeWidth={6} />
    <rect x={430} y={-430} width={60} height={430} rx={22} fill="url(#hWood)" stroke={INK} strokeWidth={8} />
    <rect x={-410} y={-200} width={850} height={80} rx={10} fill="url(#hWood)" stroke={INK} strokeWidth={8} />
    <rect x={-390} y={-120} width={36} height={120} fill={WOOD2} stroke={INK} strokeWidth={6} />
    <rect x={380} y={-120} width={36} height={120} fill={WOOD2} stroke={INK} strokeWidth={6} />
    {/* mattress + sheet */}
    <rect x={-405} y={-330} width={840} height={135} rx={26} fill={SHEET} stroke={INK} strokeWidth={8} />
    <path d="M -380 -250 H 410" stroke="#A9B4D8" strokeWidth={6} strokeDasharray="20 16" />
    {/* pillow */}
    <path d="M -400 -330 Q -410 -420 -330 -420 L -190 -416 Q -150 -400 -160 -330 Z" fill="url(#hPillow)" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
  </W>
);
/** the blanket over his body: rises and falls as he breathes */
const Blanket: React.FC<{t: number; asleep: number; flinch: number}> = ({t, asleep, flinch}) => {
  const b = (asleep ? 9 : 4) * Math.sin(2 * Math.PI * (asleep ? 0.33 : 0.5) * t) - flinch * 30;
  const d = `M -235 -330 Q -240 ${-430 - b} -120 ${-440 - b} Q 40 ${-450 - b} 150 ${-410 - b * 0.6} Q 240 -400 320 -440 Q 380 -460 400 -400 L 445 -230 Q 450 -190 400 -190 H -230 Z`;
  return (
    <W>
      <path d={d} fill="url(#hBlanket)" stroke={INK} strokeWidth={8} strokeLinejoin="round" />
      <path d={`M -235 -330 Q -240 ${-430 - b} -120 ${-440 - b}`} stroke="#E8ECFA" strokeWidth={34} fill="none" strokeLinecap="round" />
      <path d={`M -235 -330 Q -240 ${-430 - b} -120 ${-440 - b}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" transform="translate(-17 6)" opacity={0.5} />
      {[[-60, -330], [110, -320], [280, -310]].map(([x, y], i) => <path key={i} d={`M ${x - 22} ${y - 22} L ${x + 22} ${y + 22} M ${x + 22} ${y - 22} L ${x - 22} ${y + 22}`} stroke={BLANKET2} strokeWidth={6} strokeLinecap="round" />)}
      <path d="M -230 -205 H 420" stroke={BLANKET2} strokeWidth={8} strokeLinecap="round" />
    </W>
  );
};

// ---------- his face (drawn in code so the eyes can act: wide awake, darting, asleep) ----------
type HF = {open: number; wide: number; lx: number; ly: number; mouth: 'flat' | 'o' | 'snore' | 'smile' | 'wavy'; tired: number; xray: number};
const Head: React.FC<{f: HF; dy: number; t: number}> = ({f, dy, t}) => {
  const r = HR, s = r / 64;
  const ex = 22 * s, ey = -6 * s, px = f.lx * 5 * s, py = f.ly * 5 * s;
  const eh = 13 * s * f.wide, ew = 9 * s * f.wide;
  const eye = (cx: number) => f.open > 0.08 ? (
    <g>
      <ellipse cx={cx + px} cy={ey + py} rx={ew} ry={eh * f.open} fill={INK} />
      <circle cx={cx + px + 3 * s} cy={ey + py - 4 * s * f.open} r={2.6 * s} fill="#fff" />
    </g>) : <path d={`M ${cx - 10 * s} ${ey} Q ${cx} ${ey + 7 * s} ${cx + 10 * s} ${ey}`} stroke={INK} strokeWidth={4 * s} fill="none" strokeLinecap="round" />;
  const mouth = {
    flat: <path d={`M ${-9 * s} ${24 * s} H ${9 * s}`} stroke={INK} strokeWidth={4 * s} strokeLinecap="round" />,
    wavy: <path d={`M ${-12 * s} ${25 * s} q ${4 * s} ${-5 * s} ${8 * s} 0 t ${8 * s} 0 t ${8 * s} 0`} stroke={INK} strokeWidth={3.6 * s} fill="none" strokeLinecap="round" />,
    smile: <path d={`M ${-12 * s} ${22 * s} Q 0 ${32 * s} ${12 * s} ${22 * s}`} stroke={INK} strokeWidth={4 * s} fill="none" strokeLinecap="round" />,
    o: <ellipse cx={0} cy={26 * s} rx={7 * s} ry={9 * s} fill={INK} />,
    snore: <ellipse cx={0} cy={26 * s} rx={6 * s} ry={(4 + 4 * (0.5 + 0.5 * Math.sin(2 * Math.PI * 0.4 * t))) * s} fill={INK} />,
  }[f.mouth];
  return (
    <W><g transform={`translate(${HX} ${HY + dy}) rotate(-6)`}>
      <circle r={r} fill="url(#hHead)" stroke={INK} strokeWidth={8} />
      {/* moonlight rim on the window side */}
      <path d={`M ${r * 0.55} ${-r * 0.7} A ${r * 0.92} ${r * 0.92} 0 0 1 ${r * 0.8} ${r * 0.35}`} stroke="#FFFFFF" strokeWidth={7} fill="none" strokeLinecap="round" opacity={0.9} />
      <g opacity={1 - f.xray}>
        {eye(-ex)}{eye(ex)}
        {/* tired bags under the eyes */}
        {f.tired > 0.01 ? [-ex, ex].map((x, i) => <path key={i} d={`M ${x - 9 * s} ${ey + 16 * s} Q ${x} ${ey + 21 * s} ${x + 9 * s} ${ey + 16 * s}`} stroke="#8E8AB0"
          strokeWidth={3 * s} fill="none" strokeLinecap="round" opacity={f.tired} />) : null}
        {mouth}
      </g>
    </g></W>
  );
};
/** the x-ray brain inside his head: the right half (viewer's left) asleep, the left half (viewer's right) on watch */
const Brain: React.FC<{t: number; s: number}> = ({t, s}) => {
  if (s < 0.01) return null;
  const awake = 0.5 + 0.5 * Math.sin(t * 5);
  const look = Math.sin(t * 2.3) * 4;
  const beamS = popIn(t, T.guard, 0.35);
  const ang = -20 + 28 * Math.sin((t - T.guard) * 2.2);
  const waves = seg(t, T.listen - 0.1, T.listen + 0.2);
  const half = (side: -1 | 1) => `M ${side * 3} -44 Q ${side * 30} -58 ${side * 52} -36 Q ${side * 70} -14 ${side * 62} 12 Q ${side * 58} 40 ${side * 30} 42 Q ${side * 12} 46 ${side * 3} 34 Z`;
  return (
    <W><g transform={`translate(${HX} ${HY - 6}) rotate(-6) scale(${s})`}>
      {/* dark x-ray inside the head */}
      <circle r={HR - 6} fill="#1B1F3B" opacity={0.85} />
      {/* flashlight beam from the awake half */}
      {beamS > 0.01 ? <path d={`M 40 -6 L ${40 + 220 * Math.cos((ang - 12) * Math.PI / 180)} ${-6 + 220 * Math.sin((ang - 12) * Math.PI / 180)} L ${40 + 220 * Math.cos((ang + 12) * Math.PI / 180)} ${-6 + 220 * Math.sin((ang + 12) * Math.PI / 180)} Z`}
        fill="#FFF3B0" opacity={0.35 * beamS} /> : null}
      <path d={half(-1)} fill="url(#hBrainS)" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      <path d={half(1)} fill="url(#hBrainA)" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
      {[-1, 1].map((sd) => <path key={sd} d={`M ${sd * 14} -38 q ${sd * 10} 10 0 18 q ${sd * -8} 8 ${sd * 6} 16 M ${sd * 34} -40 q ${sd * 8} 14 ${sd * -2} 24 M ${sd * 50} -8 q ${sd * -12} 6 ${sd * -4} 18 M ${sd * 20} 20 q ${sd * 14} -2 ${sd * 22} 12`}
        stroke={sd < 0 ? '#5B527F' : '#C9566F'} strokeWidth={2.4} fill="none" strokeLinecap="round" />)}
      {/* sleeping half: closed eye + floating z */}
      <path d="M -40 2 Q -32 8 -24 2" stroke={INK} strokeWidth={2.6} fill="none" strokeLinecap="round" />
      {[0, 1, 2].map((i) => {
        const u = ((t * 0.5 + i / 3) % 1);
        return <text key={i} x={-38 - u * 30} y={-50 - u * 40} fontFamily={FONT} fontWeight={900} fontSize={10 + u * 8} fill="#CFC6F0" opacity={1 - u}
          textAnchor="middle">z</text>;
      })}
      {/* awake half: open eye looking around */}
      <ellipse cx={32} cy={0} rx={10} ry={8 + awake * 0.6} fill="#fff" stroke={INK} strokeWidth={2.6} />
      <circle cx={32 + look} cy={0} r={4.2} fill={INK} />
      {/* sound waves coming in from the right */}
      {waves > 0 ? [0, 1, 2].map((i) => {
        const u = ((t * 1.1 + i / 3) % 1);
        return <path key={i} d={`M ${120 - u * 48} -16 q 8 16 0 32`} stroke={GOLD} strokeWidth={4} fill="none" strokeLinecap="round" opacity={(1 - u) * waves} />;
      }) : null}
    </g></W>
  );
};
/** the wall painting: a dolphin that sleeps with one eye, then turns to show the other eye open */
const Painting: React.FC<{t: number}> = ({t}) => {
  const {x, y, w, h} = PAINT;
  const alive = t > T.dolphins - 0.2 && t < T.night2;
  const turn = seg(t, T.half - 0.55, T.half - 0.2);
  const dir = alive ? (turn < 0.5 ? 1 : -1) * Math.abs(Math.cos(turn * Math.PI)) : 1;
  const dx = alive ? 60 * Math.sin((t - T.dolphins) * 1.6) : 0;
  const dy = alive ? 12 * Math.sin((t - T.dolphins) * 3.2) : 0;
  const eyeOpen = alive && turn >= 0.5;
  return (
    <W>
      <clipPath id="hPaintClip"><rect x={x - w / 2} y={y - h / 2} width={w} height={h} /></clipPath>
      <rect x={x - w / 2 - 26} y={y - h / 2 - 26} width={w + 52} height={h + 52} rx={6} fill="#B48A3E" stroke={INK} strokeWidth={8} />
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} fill="url(#hSea)" stroke={INK} strokeWidth={6} />
      <g clipPath="url(#hPaintClip)">
        {Array.from({length: 6}, (_, i) => <path key={i} d={`M ${x - w / 2 - 40 + ((i * 97 + t * 30) % (w + 80))} ${y - h / 2 + 40 + (i % 3) * 70} l 40 0`} stroke="#CFE6FF" strokeWidth={6} strokeLinecap="round" opacity={0.6} />)}
        <path d={`M ${x - w / 2} ${y + h / 2 - 40} Q ${x} ${y + h / 2 - 70} ${x + w / 2} ${y + h / 2 - 30} V ${y + h / 2} H ${x - w / 2} Z`} fill="#E3C98E" stroke={INK} strokeWidth={5} />
        <g transform={`translate(${x + dx} ${y + dy}) scale(${dir * 0.95} 0.95) rotate(${alive ? 5 * Math.sin((t - T.dolphins) * 3.2) : -4})`}>
          <path d="M -168 30 L -150 2 L -168 -28 Q -150 -10 -126 -4 Z" fill="#8FA7BF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -10 -42 Q -2 -84 -34 -90 Q -26 -62 -44 -40 Z" fill="#8FA7BF" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -130 0 Q -60 -50 40 -42 Q 92 -36 112 -14 L 142 -8 Q 150 0 138 6 L 108 8 Q 60 38 -20 32 Q -80 28 -130 6 Z" fill="#A9C0D6" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -100 10 Q -20 28 100 8" stroke="#E4EEF7" strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M 18 22 Q 8 52 -12 54 Q -2 38 -2 24" fill="#8FA7BF" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
          {eyeOpen ? <><ellipse cx={80} cy={-14} rx={7} ry={9} fill={INK} /><circle cx={82} cy={-17} r={2.4} fill="#fff" /></>
            : <path d="M 72 -14 Q 80 -8 88 -14" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />}
          <path d="M 108 2 Q 118 6 128 2" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
        </g>
        {alive && !eyeOpen ? [0, 1].map((i) => {
          const u = ((t * 0.6 + i / 2) % 1);
          return <text key={i} x={x + dx + 60 + u * 30} y={y + dy - 60 - u * 50} fontFamily={FONT} fontWeight={900} fontSize={26 + u * 14} fill="#fff" opacity={1 - u} textAnchor="middle">z</text>;
        }) : null}
      </g>
    </W>
  );
};
/** a sticker "!" that pops over his head */
const Bang: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s}) rotate(8)`}>
    <path d="M -14 -70 L 14 -70 L 8 -6 L -8 -6 Z" fill={GOLD} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
    <circle cx={0} cy={18} r={12} fill={GOLD} stroke={INK} strokeWidth={7} />
  </g></W>) : null;
/** floating Zzz while he sleeps */
const Zs: React.FC<{t: number; a: number}> = ({t, a}) => a < 0.01 ? null : (
  <W>{[0, 1, 2].map((i) => {
    const u = ((t * 0.55 + i / 3) % 1);
    return <text key={i} x={HX + 70 + u * 90} y={HY - 90 - u * 150} fontFamily={FONT} fontWeight={900} fontSize={44 + u * 34} fill="#E9EEFF" stroke={INK}
      strokeWidth={8} style={{paintOrder: 'stroke'}} opacity={a * (1 - u * u)} textAnchor="middle">Z</text>;
  })}</W>
);
/** rolling suitcase */
const Suitcase: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <rect x={-20} y={-330} width={14} height={110} fill="#8A8FA8" stroke={INK} strokeWidth={5} />
    <rect x={-60} y={-344} width={120} height={22} rx={10} fill="#8A8FA8" stroke={INK} strokeWidth={6} />
    <rect x={-110} y={-230} width={220} height={210} rx={22} fill="#E2574C" stroke={INK} strokeWidth={8} />
    <path d="M -70 -220 V -32 M 0 -220 V -32 M 70 -220 V -32" stroke="#B83F36" strokeWidth={8} />
    <rect x={30} y={-200} width={70} height={46} rx={6} fill="#F7EBC8" stroke={INK} strokeWidth={5} transform="rotate(8 65 -177)" />
    <circle cx={-70} cy={-10} r={16} fill="#2A2D3D" stroke={INK} strokeWidth={5} />
    <circle cx={70} cy={-10} r={16} fill="#2A2D3D" stroke={INK} strokeWidth={5} />
  </g></W>) : null;

// ---------- story over time ----------
const SOUNDS = [T.fridge, T.steps, T.ice];
const faceAt = (t: number): HF => {
  const f: HF = {open: 1, wide: 1.15, lx: 0.2, ly: -0.6, mouth: 'flat', tired: 0.9, xray: seg(t, T.brain + 0.2, T.brain + 0.8) * (1 - seg(t, T.dolphins - 0.4, T.dolphins - 0.1))};
  // opening blink, then a look at the clock
  if (t < 0.3) f.open = 1 - Math.sin(Math.PI * seg(t, T.blink, T.blink + 0.16));
  if (t >= 0.3 && t < 1.8) { f.lx = -1; f.ly = 0.4; }
  if (t >= T.bed && t < T.first) { f.lx = 0.6; f.ly = 0.6; f.mouth = 'wavy'; }
  if (t >= T.first && t < T.fridge) { f.lx = 0; f.ly = -0.8; f.open = 0.75; }
  if (t >= T.every && t < T.fridge) { f.open = 0.55; f.mouth = 'flat'; }
  // every sound: eyes snap wide and look toward it
  const dirs = [[-1, 0.2], [1, 0.5], [1, -0.6]];
  SOUNDS.forEach((a, i) => { if (t >= a && t < a + 1.0) { f.open = 1; f.wide = 1.15 + 0.4 * Math.exp(-6 * (t - a)) + 0.12; f.lx = dirs[i][0]; f.ly = dirs[i][1]; f.mouth = i === 2 ? 'o' : 'flat'; } });
  if (t >= T.ice + 1.0 && t < T.night2) { f.lx = 0; f.ly = -0.3; f.open = 0.7; f.mouth = 'wavy'; }
  // night two: fast asleep, snoring through every sound
  if (t >= T.night2 && t < T.newHotel + 0.05) { f.open = 0; f.mouth = 'snore'; f.tired = 0; }
  // new hotel: eyes snap open again (the opening look)
  if (t >= T.newHotel + 0.05) { f.open = 1; f.wide = 1.15 + 0.35 * Math.exp(-6 * (t - T.newHotel)); f.lx = 0.2; f.ly = -0.6; f.mouth = 'flat'; }
  return f;
};
const clockAt = (t: number) => {
  if (t < T.night2 - 0.3) { const m = 7 + (t < T.flip ? 0 : 1) + Math.floor(Math.max(0, t - T.flip) / 5); return `3:${String(m).padStart(2, '0')}`; }
  if (t < T.except) { const mins = Math.floor(lerp(23 * 60, 30 * 60 + 59, seg(t, T.night2 - 0.3, T.except - 0.2))) % (24 * 60); const h = Math.floor(mins / 60) % 12 || 12; return `${h}:${String(mins % 60).padStart(2, '0')}`; }
  if (t < T.newHotel + 0.05) return '7:00';
  return '3:07';
};

export const HotelScene: React.FC<{t: number; camK?: {x: number; y: number; k: number}}> = ({t, camK}) => {
  const cam0 = camK ? camAt([{t: 0, ...camK}], 0) : camAt([
    {t: 0, x: -400, y: -480, k: 1.62}, {t: 2.75, x: -395, y: -480, k: 1.72},              // wide awake, 3 AM
    {t: 3.3, x: -180, y: -560, k: 1.02}, {t: 4.9, x: -170, y: -560, k: 1.05},              // the perfect bed
    {t: 5.6, x: 180, y: -620, k: 0.62}, {t: 9.25, x: 180, y: -610, k: 0.64},               // the whole room, first night
    {t: 9.7, x: -660, y: -440, k: 0.95}, {t: 10.45, x: -650, y: -440, k: 0.97},            // the fridge
    {t: 10.85, x: 380, y: -420, k: 0.66}, {t: 11.8, x: 390, y: -420, k: 0.67},             // footsteps at the door
    {t: 12.15, x: 260, y: -560, k: 0.72}, {t: 13.3, x: 250, y: -560, k: 0.74},             // the ice machine through the wall
    {t: 13.9, x: -220, y: -520, k: 1.12}, {t: 15.6, x: -230, y: -510, k: 1.18},            // it's not the bed
    {t: 17.3, x: HX + 40, y: HY - 40, k: 3.5}, {t: 24.2, x: HX + 44, y: HY - 40, k: 3.65},  // into his head
    {t: 25.0, x: PAINT.x, y: PAINT.y + 30, k: 1.75}, {t: 29.55, x: PAINT.x, y: PAINT.y + 30, k: 1.82}, // the dolphin painting
    {t: 30.2, x: -230, y: -600, k: 1.0}, {t: 32.5, x: -230, y: -590, k: 1.04},             // night two
    {t: 33.1, x: -60, y: -560, k: 0.86}, {t: 34.5, x: -70, y: -560, k: 0.9},               // the suitcase: tomorrow, a new hotel
    {t: 35.3, x: -400, y: -480, k: 1.62},                                                  // back to the opening framing
  ], t);
  const sh = shake(t, hit(t, T.ice, 12, 4) + hit(t, T.fine, 7, 5));
  const cam = {...cam0, x: cam0.x + sh.x, y: cam0.y + sh.y};
  const f = faceAt(t);
  const flinch = SOUNDS.reduce((a, s) => a + spring(t, s, 0.6, 3, 7) * (t >= s ? 1 : 0), 0) + (t >= T.newHotel ? spring(t, T.newHotel + 0.05, 0.6, 3, 7) : 0);
  const asleep = t >= T.night2 && t < T.newHotel ? 1 : 0;
  const headDy = -18 * flinch + (asleep ? 2 * Math.sin(2 * Math.PI * 0.33 * t) : 0);
  const brainS = popIn(t, T.brain + 0.35, 0.4) * (1 - seg(t, T.dolphins - 0.45, T.dolphins - 0.15));
  const ctaOn = t >= T.cta && t < T.cta + CTA_DUR;
  const phone = ctaOn ? 1 : 0;
  // world labels
  const starsS = pulse(t, T.perfect, 1.4) + pulse(t, T.notbed - 0.1, 0.9);
  const n1S = pulse(t, T.first, 3.2);
  const fridgeS = pulse(t, T.fridge, 0.85), stepsS = pulse(t, T.steps, 1.0), iceS = pulse(t, T.ice, 1.2);
  const bangs = SOUNDS.map((a) => pulse(t, a + 0.05, 0.75));
  const leftS = pulse(t, T.left, T.dolphins - T.left - 0.6), lightS = pulse(t, T.lighter, T.dolphins - T.lighter - 0.6);
  const guardS = pulse(t, T.guard, T.dolphins - T.guard - 0.5);
  const asleepS = pulse(t, T.further + 0.2, T.half - T.further - 0.9), awakeS = pulse(t, T.half, T.night2 - T.half - 0.5);
  const n2S = pulse(t, T.night2, 1.9);
  const zS = asleep * seg(t, T.night2 + 0.3, T.night2 + 0.7);
  const fineS = pulse(t, T.fine + 0.05, 1.0);
  const suitS = popIn(t, T.except, 0.35) * (1 - seg(t, 35.4, 35.5));
  const newS = pulse(t, T.moves + 0.1, 35.35 - T.moves - 0.1);
  const moonX = lerp(560, 360, seg(t, T.night2 - 0.3, T.except));
  return (
    <AbsoluteFill style={{overflow: 'hidden', background: '#141831'}}>
      <Defs />
      {/* outside the window (far: real parallax through the glass) */}
      <Layer cam={cam} z={2400} paper={false}>
        <Outside t={t} moonX={moonX} />
      </Layer>
      <Layer cam={cam} z={1000} paper={false}>
        <Room />
      </Layer>
      {/* soft shadows on the wall behind the furniture (moonlight comes from the upper right) */}
      <Layer cam={cam} z={1000} paper={false}>
        <W>
          <g filter="url(#hBlur)" opacity={0.45}>
            <rect x={-560} y={-800} width={80} height={800} rx={30} fill="#0B0E22" />
            <path d="M -560 -460 Q -540 -540 -400 -560 L 330 -520 L 360 -200 H -560 Z" fill="#0B0E22" />
            <rect x={-830} y={-620} width={220} height={620} rx={10} fill="#0B0E22" />
            <path d={`M ${PAINT.x - PAINT.w / 2 - 70} ${PAINT.y - PAINT.h / 2 - 6} h ${PAINT.w + 10} v ${PAINT.h + 70} h ${-PAINT.w - 10} Z`} fill="#0B0E22" />
          </g>
          {/* floor contact shadows */}
          <ellipse cx={20} cy={8} rx={520} ry={34} fill="#120C1C" opacity={0.6} />
          <ellipse cx={-575} cy={6} rx={140} ry={22} fill="#120C1C" opacity={0.6} />
          <ellipse cx={-920} cy={6} rx={240} ry={24} fill="#120C1C" opacity={0.6} />
        </W>
      </Layer>
      <Layer cam={cam} z={1000}>
        <Window />
        <Door t={t} />
        <Painting t={t} />
        <Fridge t={t} />
        <Nightstand t={t} time={clockAt(t)} phone={phone} />
        <Bed />
        <Head f={f} dy={headDy} t={t} />
        <Blanket t={t} asleep={asleep} flinch={Math.max(0, flinch) * 0.4} />
        <Suitcase x={300} y={70} s={suitS} />
      </Layer>
      {/* light: the moonbeam through the window (with the window bars), warm light under the door, the clock and phone glow */}
      <Layer cam={cam} z={1000} paper={false}>
        <W>
          <g style={{mixBlendMode: 'screen'}}>
            <path d={`M ${WIN.x0} ${WIN.y0} L ${WIN.x1} ${WIN.y0} L ${WIN.x1 - 520} -190 L ${WIN.x0 - 820} -190 Z`} fill="url(#hBeam)" />
            {/* the window's light patch on the blanket and floor */}
            <path d="M -160 -440 L 260 -430 L 300 -190 L -260 -190 Z" fill={MOON} opacity={0.16} />
            <path d="M 50 -436 L 30 -190 M -210 -310 L 290 -300" stroke="#1A1E3A" strokeWidth={20} opacity={0.5} />
          </g>
          {/* dust in the moonbeam */}
          {Array.from({length: 26}, (_, i) => {
            const u = (rnd(i * 3) + t * 0.03 * (0.5 + rnd(i))) % 1;
            const bx = lerp(WIN.x0 - 100, -200, u) + rnd(i * 9) * 380, by = lerp(WIN.y0 + 80, -260, u) + 30 * Math.sin(t * 0.8 + i);
            return <circle key={i} cx={bx} cy={by} r={3 + rnd(i * 5) * 3} fill="#FFFFFF" opacity={0.35 + 0.35 * Math.sin(t * 1.5 + i)} />;
          })}
          <path d={`M ${DOOR.x0} 0 L ${DOOR.x1} 0 L ${DOOR.x1 + 120} 160 L ${DOOR.x0 - 160} 160 Z`} fill="url(#hSpill)" />
        </W>
        <Glow x={-529} y={-362} r={150} color={CLOCK} a={0.35} />
        <Glow x={-630} y={-345} r={260} color="#9FD3FF" a={phone * (0.55 + 0.15 * Math.sin(t * 9))} />
        <Glow x={-925} y={-262} r={40} color="#7CFF8A" a={0.6} />
      </Layer>
      {/* labels, gags, the brain */}
      <Layer cam={cam} z={1000}>
        <Brain t={t} s={brainS} />
        {[-160, -80, 0, 80, 160].map((dx, i) => <Star key={i} x={-20 + dx} y={-620 - (i === 2 ? 20 : 0)} s={Math.max(0, starsS) * popIn(t, (t < T.so ? T.perfect : T.notbed - 0.1) + i * 0.06, 0.3) * 0.8} rot={i * 12} />)}
        <HumLines t={t} a={T.fridge} />
        <HumLines t={t} a={T.night2 + 0.4} />
        <Txt x={-925} y={-520} s={fridgeS} text="HMMMMM" size={70} rot={-5} fill="#CFE0FF" />
        <Txt x={990} y={-800} s={stepsS} text="TAP TAP" size={62} rot={4} fill={WARM} />
        <Txt x={720} y={-500} s={iceS} text="CLUNK" size={140} rot={-8} fill={GOLD} />
        <Txt x={720} y={-390} s={iceS} text="ICE MACHINE" size={50} rot={-8} />
        {[0, 1, 2, 3].map((i) => <W key={i}><rect x={560 + i * 70 + (iceS > 0 ? 20 * Math.sin(i * 2 + t * 3) : 0)} y={-680 - 40 * eout(seg(t, T.ice, T.ice + 0.5)) - i % 2 * 30} width={46} height={46} rx={8}
          fill="#DDF3FF" stroke={INK} strokeWidth={6} transform={`rotate(${i * 20 + t * 40} ${583 + i * 70} -657)`} opacity={iceS > 0.05 ? 1 : 0} /></W>)}
        {bangs.map((s, i) => <Bang key={i} x={HX + (i === 0 ? -110 : 110)} y={HY - 120} s={s} />)}
        <Txt x={HX + 50} y={HY - 125} s={leftS} text="LEFT HALF" size={24} rot={-6} fill={GOLD} />
        <Txt x={HX + 30} y={HY + 100} s={lightS * (1 - seg(t, T.guard - 0.2, T.guard))} text="SLEEPS LIGHTER" size={19} rot={-4} />
        <Txt x={HX + 30} y={HY + 100} s={guardS} text="NIGHT GUARD" size={24} rot={-4} fill={GOLD} />
        <Txt x={PAINT.x} y={PAINT.y - PAINT.h / 2 - 90} s={asleepS} text="HALF ASLEEP" size={58} rot={-3} />
        <Txt x={PAINT.x} y={PAINT.y + PAINT.h / 2 + 85} s={awakeS} text="HALF ON WATCH" size={58} rot={-3} fill={GOLD} />
        <Zs t={t} a={zS} />
        <Txt x={HX + 260} y={HY - 210} s={fineS} text="CLUNK" size={60} rot={-8} fill={GOLD} />
        <Txt x={HX + 260} y={HY - 150} s={fineS} text="...STILL ASLEEP" size={34} rot={-8} />
        <Txt x={300} y={-450} s={newS} text="NEW HOTEL" size={66} rot={-5} fill={GOLD} />
      </Layer>
      {/* own darker vignette for the night (the kit Look adds the paper grain on top) */}
      <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 65% at 50% 48%, transparent 55%, rgba(5,6,20,0.45) 100%)', pointerEvents: 'none'}} />
      <Badge text="NIGHT 1" s={n1S} y={560} color="#3A4170" />
      <Badge text="NIGHT 2" s={n2S} y={560} color="#3A4170" />
      <HookTitle t={t} text="WHY CAN'T HE SLEEP?" hi="SLEEP" />
      <CallToAction t={t} at={T.cta} />
      <CommentAsk t={t} at={T.except} until={35.35} />
    </AbsoluteFill>
  );
};

/** a question sticker that invites comments (top band, before the loop push) */
const CommentAsk: React.FC<{t: number; at: number; until: number}> = ({t, at, until}) => {
  const s = popIn(t, at, 0.35) * (1 - eio(seg(t, until - 0.25, until)));
  if (s < 0.01) return null;
  const wob = 1 + 0.02 * Math.sin((t - at) * 2 * Math.PI * 1.2);
  return (
    <div style={{position: 'absolute', left: 540, top: 270, transform: `translate(-50%,-50%) rotate(-2deg) scale(${s * wob})`, display: 'flex', alignItems: 'center', gap: 16,
      background: '#FFF3B0', border: `7px solid ${INK}`, borderRadius: 30, padding: '14px 30px 14px 20px', boxShadow: `0 8px 0 ${INK}`, fontFamily: FONT,
      fontWeight: 900, fontSize: 46, color: INK, whiteSpace: 'nowrap', letterSpacing: -0.5}}>
      <svg width={64} height={64} viewBox="0 0 64 64">
        <path d="M 11 10 H 53 Q 60 10 60 17 V 40 Q 60 47 53 47 H 30 L 17 57 L 20 47 H 11 Q 4 47 4 40 V 17 Q 4 10 11 10 Z" fill="#fff" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        <circle cx={20} cy={29} r={4} fill={INK} /><circle cx={32} cy={29} r={4} fill={INK} /><circle cx={44} cy={29} r={4} fill={INK} />
      </svg>
      <div style={{lineHeight: 1.05}}>Same for you?<div style={{fontSize: 32, fontWeight: 800}}>Tell us in the comments</div></div>
    </div>
  );
};

export const HotelVideo: React.FC = () => {
  const t = useCurrentFrame() / FPS;
  const cues: Cue[] = [
    {f: 'tick.wav', at: T.flip, db: -26},
    {f: 'pop.wav', at: T.perfect, db: -24}, ...[0, 1, 2, 3, 4].map((i) => ({f: 'tick2.wav', at: T.perfect + i * 0.06, db: -30})),
    {f: 'pop.wav', at: T.first, db: -24},
    {f: 'hum.wav', at: T.fridge - 0.05, db: -20, from: 2, to: 3.3},
    {f: 'footsteps.mp3', at: T.steps, db: 4},
    {f: 'icemachine.mp3', at: T.ice - 0.02, db: -6},
    {f: 'pop.wav', at: T.fridge + 0.05, db: -27}, {f: 'pop.wav', at: T.steps + 0.05, db: -27}, {f: 'pop.wav', at: T.ice + 0.05, db: -27},
    {f: 'pop.wav', at: T.notbed - 0.1, db: -26},
    {f: 'whoosh.wav', at: T.brain + 0.05, db: -24}, {f: 'zap.wav', at: T.brain + 0.4, db: -30},
    {f: 'pop.wav', at: T.left, db: -24}, {f: 'pop.wav', at: T.lighter, db: -26},
    {f: 'whir.mp3', at: T.listen, db: -34, to: 1.0}, {f: 'pop.wav', at: T.guard, db: -24},
    {f: 'whoosh.wav', at: 24.3, db: -27}, {f: 'bubbles.wav', at: T.dolphins, db: -30, to: 1.6},
    {f: 'pop.wav', at: T.further + 0.2, db: -26}, {f: 'squeak.wav', at: T.half - 0.4, db: -30}, {f: 'pop.wav', at: T.half, db: -24},
    {f: 'whoosh.wav', at: T.night2 - 0.25, db: -28}, {f: 'pop.wav', at: T.night2, db: -25},
    ...ctaCues(T.cta),
    {f: 'snore.mp3', at: T.night2 + 0.5, db: -14}, {f: 'hum.wav', at: T.night2 + 0.4, db: -26, from: 4, to: 5.2},
    {f: 'icemachine.mp3', at: T.fine, db: -12}, {f: 'snore.mp3', at: T.fine + 0.9, db: -15, to: 1.5},
    {f: 'pop.wav', at: T.except, db: -20}, {f: 'tick2.wav', at: T.except + 0.3, db: -26},
    {f: 'pop.wav', at: T.moves + 0.1, db: -24},
    {f: 'ding.mp3', at: T.newHotel + 0.05, db: -26}, {f: 'pop.wav', at: T.newHotel + 0.05, db: -18},
    {f: 'whoosh.wav', at: DURATION - LOOP_DUR - 0.05, db: -26},
  ];
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <LoopOut t={t} total={DURATION} start={<HotelScene t={0} />}>
        <HotelScene t={t} />
      </LoopOut>
      <Look />
      <SoundLayer voice="hotel/vo/take1-trim.mp3" voiceAt={0.1} cues={cues} />
    </AbsoluteFill>
  );
};
export const HotelWide: React.FC = () => <WideFit.Provider value={0.72}><HotelVideo /></WideFit.Provider>;
