import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
// landscape frames show less height, so zoom out a little to keep the action in frame
const WideFit = React.createContext(0.5625); // how much of the vertical framing a landscape shot keeps (0.5625 = all of it)
const useFrameFit = () => { const {width, height} = useVideoConfig(); const wf = React.useContext(WideFit); return {cx: width / 2, cy: height / 2, kf: width > height ? wf : 1, wide: width > height}; };
import S from './sprites.json';

export const FPS = 60;
export const DURATION = 26.0;
const VO_AT = 0.1;

// ---------- beat times (composition seconds = voice time + 0.1) ----------
const T = {
  turn: 0.95, glide0: 1.15, glide1: 3.7,
  cut1: 4.75, rope: 6.06, car: 8.84, own: 9.8,
  past: 11.08, down1: 12.25, zoomTop0: 12.85, zoomTop1: 13.55,
  extra: [13.36, 13.66, 14.0, 14.3], strain: 14.6,
  cut2: 15.95, ride0: 16.35, ride1: 18.15, hop0: 18.35, hop1: 19.05, sign: 19.56, up0: 19.85, up1: 20.6,
  cut3: 20.65, lighter: 21.02, relief: 21.5, push0: 22.92, push1: 24.45, km: 24.54, final0: 25.25,
};

// ---------- helpers ----------
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const eio = (u: number) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
const eout = (u: number) => 1 - Math.pow(1 - u, 3);
const backOut = (u: number) => (u <= 0 ? 0 : u >= 1 ? 1 : 1 + 2.70158 * Math.pow(u - 1, 3) + 1.70158 * Math.pow(u - 1, 2));
const popIn = (t: number, t0: number, d = 0.32) => backOut(seg(t, t0, t0 + d));
const spring = (t: number, t0: number, amp: number, f = 3, damp = 6) =>
  t < t0 ? 0 : amp * Math.exp(-damp * (t - t0)) * Math.cos(2 * Math.PI * f * (t - t0));

type Cam = {x: number; y: number; z: number};
type Key = {t: number; x: number; y: number; k: number; e?: 'io' | 'out'};
// camera keys are given as screen scale k for the Z=1000 layer; converted to z
const camAt = (keys: Key[], t: number): Cam => {
  let c = keys[0];
  let res = {x: c.x, y: c.y, k: c.k};
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i], b = keys[i + 1];
    if (t >= a.t && t <= b.t) {
      const u0 = seg(t, a.t, b.t);
      const u = b.e === 'out' ? eout(u0) : eio(u0);
      res = {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), k: Math.exp(lerp(Math.log(a.k), Math.log(b.k), u))};
      break;
    }
    if (t > b.t) res = {x: b.x, y: b.y, k: b.k};
  }
  return {x: res.x, y: res.y, z: 1000 - 1000 / res.k};
};

const Layer: React.FC<{cam: Cam; z: number; blur?: number; children: React.ReactNode}> = ({cam, z, blur = 0, children}) => {
  const fit = useFrameFit();
  const d = z - cam.z;
  if (d < 250) return null;
  const k = (1000 / d) * fit.kf;
  return (
    <AbsoluteFill style={{filter: blur ? `blur(${blur}px)` : undefined}}>
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0',
        transform: `translate(${fit.cx}px, ${fit.cy}px) scale(${k}) translate(${-cam.x}px, ${-cam.y}px)`}}>{children}</div>
    </AbsoluteFill>
  );
};

// a sprite placed by an anchor point (sprite px) at world (x, y), scale s
type SN = keyof typeof S;
const Spr: React.FC<{n: SN; x: number; y: number; s: number; ax?: number; ay?: number; rot?: number; sx?: number; sy?: number; flip?: boolean; op?: number}> =
  ({n, x, y, s, ax, ay, rot = 0, sx = 1, sy = 1, flip = false, op = 1}) => {
    const m = S[n] as any;
    const axp = ax ?? m.w / 2, ayp = ay ?? m.h / 2;
    return (
      <Img src={staticFile(`elevator/${n}.png`)} style={{position: 'absolute', left: x - axp * s, top: y - ayp * s,
        width: m.w * s, height: m.h * s, opacity: op, transformOrigin: `${axp * s}px ${ayp * s}px`,
        transform: `rotate(${rot}deg) scale(${(flip ? -1 : 1) * sx}, ${sy})`}} />
    );
  };

// world-space SVG canvas (origin = world 0,0)
const W: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1} height={1}>{children}</svg>
);

const INK = '#141414';
const FONT = "'Inter', 'DejaVu Sans', sans-serif";

// ---------- the guy ----------
const HEAD_R = 64; // world head radius for every pose
const GUYS: SN[] = ['front_calm', 'front_worried', 'front_wave', 'lookup', 'walk'];
const gscale = (n: SN) => HEAD_R / (S[n] as any).head[2];
const Guy: React.FC<{n: SN; x: number; y: number; sx?: number; sy?: number; rot?: number; t: number; breathe?: boolean; flip?: boolean}> =
  ({n, x, y, sx = 1, sy = 1, rot = 0, t, breathe = true, flip}) => {
    const m = S[n] as any; const s = gscale(n);
    const b = breathe ? 1 + 0.009 * Math.sin(2 * Math.PI * 0.6 * t) : 1;
    return <Spr n={n} x={x} y={y} s={s} ax={m.feet[0]} ay={m.feet[1]} sx={sx} sy={sy * b} rot={rot} flip={flip} />;
  };

// ---------- elevator car ----------
const CS = 0.195;
const CAR = S.car_open as any;
const carGeo = (cx: number, top: number) => {
  const d = CAR.door;
  return {
    doorL: cx + (d[0] - CAR.top[0]) * CS, doorR: cx + (d[2] - CAR.top[0]) * CS,
    doorT: top + (d[1] - CAR.top[1]) * CS, doorB: top + (d[3] - CAR.top[1]) * CS,
    bottom: top + (CAR.body[3] - CAR.top[1]) * CS,
  };
};
const Car: React.FC<{cx: number; top: number; t: number; guy?: SN | null; guySx?: number; guySy?: number; doors?: number}> =
  ({cx, top, t, guy, guySx = 1, guySy = 1, doors = 0}) => {
    const g = carGeo(cx, top);
    const dw = g.doorR - g.doorL, dh = g.doorB - g.doorT;
    return (
      <>
        <Spr n="car_open" x={cx} y={top} s={CS} ax={CAR.top[0]} ay={CAR.top[1]} />
        {guy ? <Guy n={guy} x={cx} y={g.doorB - 6} t={t} sx={guySx} sy={guySy} /> : null}
        {doors > 0.001 ? (
          <div style={{position: 'absolute', left: g.doorL, top: g.doorT, width: dw, height: dh, overflow: 'hidden'}}>
            {[0, 1].map((i) => {
              const half = dw / 2; const off = (1 - doors) * half;
              const left = i === 0 ? -off : half + off;
              return <div key={i} style={{position: 'absolute', left, top: 0, width: half, height: dh, boxSizing: 'border-box',
                background: '#F2B634', border: `5px solid ${INK}`}}>
                <div style={{position: 'absolute', left: half * 0.22, right: half * 0.22, top: dh * 0.12, height: dh * 0.3,
                  borderRadius: 10, background: '#FFE7A8', border: `4px solid ${INK}`}} />
              </div>;
            })}
          </div>
        ) : null}
      </>
    );
  };

// ---------- cable(s) ----------
const Cables: React.FC<{x: number; y0: number; y1: number; n: number[]; wob?: number; carbon?: number}> = ({x, y0, y1, n, wob = 0, carbon = 0}) => {
  // n: list of widths (0..1) for cables at offsets 0, -24, 24, -48, 48
  const offs = [0, -30, 30, -60, 60];
  const path = (ox: number) => `M ${x + ox} ${y0} Q ${x + ox + wob} ${(y0 + y1) / 2} ${x + ox} ${y1}`;
  return (
    <W>
      {n.map((w, i) => w > 0.01 ? <path key={'o' + i} d={path(offs[i])} stroke={INK} strokeWidth={22 * w} fill="none" strokeLinecap="round" /> : null)}
      {n.map((w, i) => w > 0.01 ? <path key={'f' + i} d={path(offs[i])} stroke="#A9B4BF" strokeWidth={12 * w} fill="none" strokeLinecap="round" /> : null)}
      {n.map((w, i) => w > 0.01 ? <path key={'h' + i} d={path(offs[i] - 1.5)} stroke="#E4EAF0" strokeWidth={2.2 * w} fill="none" strokeLinecap="round" /> : null)}
      {carbon > 0.01 ? <>
        <path d={path(0)} stroke={INK} strokeWidth={14 * carbon} fill="none" strokeLinecap="round" />
        <path d={path(0)} stroke="#2E2F35" strokeWidth={7 * carbon} fill="none" strokeLinecap="round" />
        <path d={path(-1.5)} stroke="#7C8090" strokeWidth={1.8 * carbon} fill="none" strokeLinecap="round" />
      </> : null}
    </W>
  );
};

// ---------- the pulley with a face ----------
const PS = 0.147;
const PUL = S.pulley as any;
const WHEEL = {x: 110, y: -900, r: PUL.wheel[2] * PS};
type Face = {open: number; lx: number; ly: number; lid: number; brow: number; mouth: 'none' | 'smile' | 'flat' | 'grit' | 'o' | 'grin'; squeeze: number; sweat: number; shake: number};
const eyePts = (cx: number, cy: number, rx: number, ry: number, lidY: number) => {
  const pts: string[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2; const px = cx + rx * Math.cos(a); const py = Math.min(cy + ry * Math.sin(a), lidY);
    pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }
  return pts.join(' ');
};
const Pulley: React.FC<{f: Face; t: number; sy?: number}> = ({f, t, sy = 1}) => {
  const {x, y, r} = WHEEL;
  const sh = f.shake * (Math.sin(t * 2 * Math.PI * 13.3) * 2.2 + Math.sin(t * 2 * Math.PI * 7.1) * 1.6);
  const ex = 0.34 * r, ey = -0.1 * r, rx = 0.2 * r * f.open, ry = 0.25 * r * f.open;
  return (
    <div style={{position: 'absolute', left: 0, top: 0, transform: `translate(${sh}px,0) translate(${x}px,${y}px) scale(1,${sy}) translate(${-x}px,${-y}px)`, transformOrigin: '0 0'}}>
      <Spr n="pulley" x={x} y={y} s={PS} ax={PUL.wheel[0]} ay={PUL.wheel[1]} />
      <W>
        {f.squeeze > 0.5 ? (
          [-1, 1].map((s) => <path key={s} d={`M ${x + s * ex - s * 0.15 * r} ${y + ey - 0.12 * r} L ${x + s * ex + s * 0.1 * r} ${y + ey} L ${x + s * ex - s * 0.15 * r} ${y + ey + 0.12 * r}`}
            stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" strokeLinejoin="round" />)
        ) : f.open > 0.02 ? (
          [-1, 1].map((s) => {
            const cx = x + s * ex, cy = y + ey;
            const lidY = cy - ry + 2 * ry * f.lid;
            return (
              <g key={s}>
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth={6} />
                <circle cx={cx + f.lx * rx * 0.4} cy={cy + f.ly * ry * 0.45} r={0.4 * rx} fill={INK} />
                <circle cx={cx + f.lx * rx * 0.4 - 0.12 * rx} cy={cy + f.ly * ry * 0.45 - 0.14 * rx} r={0.12 * rx} fill="#fff" />
                {f.lid > 0.02 ? <polygon points={eyePts(cx, cy, rx + 1, ry + 1, lidY)} fill="#8E969F" /> : null}
                {f.lid > 0.02 ? <line x1={cx - rx * Math.sqrt(Math.max(0, 1 - ((lidY - cy) / ry) ** 2))} y1={lidY} x2={cx + rx * Math.sqrt(Math.max(0, 1 - ((lidY - cy) / ry) ** 2))} y2={lidY} stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
                <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={6} />
              </g>
            );
          })
        ) : null}
        {f.open > 0.02 || f.squeeze > 0.5 ? [-1, 1].map((s) => {
          const cx = x + s * ex, cy = y + ey - 0.42 * r; const a = (f.brow * Math.PI) / 180; const L = 0.17 * r;
          // positive brow = inner end down (strain/angry)
          return <line key={'b' + s} x1={cx - s * L * Math.cos(a)} y1={cy - L * Math.sin(a)} x2={cx + s * L * Math.cos(a)} y2={cy + L * Math.sin(a)}
            transform={`scale(1,1)`} stroke={INK} strokeWidth={9} strokeLinecap="round"
            style={{}} />;
        }) : null}
        {(() => {
          const mx = x, my = y + 0.36 * r, w = 0.24 * r;
          if (f.mouth === 'smile') return <path d={`M ${mx - w} ${my - 4} Q ${mx} ${my + 0.5 * w} ${mx + w} ${my - 4}`} stroke={INK} strokeWidth={7} fill="none" strokeLinecap="round" />;
          if (f.mouth === 'grin') return <path d={`M ${mx - w} ${my - 6} Q ${mx} ${my + 0.9 * w} ${mx + w} ${my - 6} Z`} stroke={INK} strokeWidth={6} fill="#5A2328" strokeLinejoin="round" />;
          if (f.mouth === 'flat') return <line x1={mx - 0.7 * w} y1={my} x2={mx + 0.7 * w} y2={my} stroke={INK} strokeWidth={7} strokeLinecap="round" />;
          if (f.mouth === 'o') return <ellipse cx={mx} cy={my} rx={0.32 * w} ry={0.42 * w} fill="#5A2328" stroke={INK} strokeWidth={6} />;
          if (f.mouth === 'grit') return <g>
            <rect x={mx - w} y={my - 0.32 * w} width={2 * w} height={0.64 * w} rx={0.25 * w} fill="#fff" stroke={INK} strokeWidth={6} />
            <line x1={mx - w} y1={my} x2={mx + w} y2={my} stroke={INK} strokeWidth={4} />
            {[-0.5, 0, 0.5].map((q) => <line key={q} x1={mx + q * w} y1={my - 0.32 * w} x2={mx + q * w} y2={my + 0.32 * w} stroke={INK} strokeWidth={4} />)}
          </g>;
          return null;
        })()}
        {f.sweat > 0.01 ? [0, 1].map((i) => {
          const ph = ((t * 0.9 + i * 0.5) % 1);
          const sx2 = x + (i ? 1 : -1) * 0.95 * r, sy2 = y - 0.5 * r + ph * 0.55 * r; const s2 = f.sweat * (ph < 0.15 ? ph / 0.15 : ph > 0.85 ? (1 - ph) / 0.15 : 1) * 1.0;
          return <g key={'s' + i} transform={`translate(${sx2} ${sy2}) scale(${s2})`}>
            <path d="M 0 -26 C 10 -10 16 0 16 8 A 16 16 0 0 1 -16 8 C -16 0 -10 -10 0 -26 Z" fill="#8ED3FF" stroke={INK} strokeWidth={5} />
            <ellipse cx={-6} cy={6} rx={4} ry={6} fill="#fff" />
          </g>;
        }) : null}
      </W>
    </div>
  );
};

// ---------- arrows, stars, badges ----------
const Arrow: React.FC<{x: number; y: number; s: number; color?: string}> = ({x, y, s, color = '#FF6A4B'}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) scale(${s})`}>
    <path d="M -18 -60 L 18 -60 L 18 -5 L 42 -5 L 0 45 L -42 -5 L -18 -5 Z" fill={color} stroke={INK} strokeWidth={7} strokeLinejoin="round" />
  </g></W>
) : null;
const Star: React.FC<{x: number; y: number; s: number; r?: number}> = ({x, y, s, r = 0}) => s > 0.01 ? (
  <W><g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
    <path d="M 0 -30 Q 6 -6 30 0 Q 6 6 0 30 Q -6 6 -30 0 Q -6 -6 0 -30 Z" fill="#FFE066" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
  </g></W>
) : null;
const Badge: React.FC<{text: string; s: number}> = ({text, s}) => { const fit = useFrameFit(); return s > 0.01 ? (
  <div style={{position: 'absolute', left: fit.wide ? fit.cx + 560 : fit.cx, top: fit.wide ? 170 : 250, transform: `translate(-50%,-50%) scale(${s})`, background: '#fff',
    border: `9px solid ${INK}`, borderRadius: 44, padding: '14px 46px', fontFamily: FONT, fontWeight: 900, fontSize: 104,
    color: INK, whiteSpace: 'nowrap', boxShadow: `0 10px 0 ${INK}`}}>{text}</div>
) : null; };

// ---------- backgrounds ----------
const Sky: React.FC = () => <AbsoluteFill style={{background: 'linear-gradient(#7FC2FA 0%, #B7E0FF 60%, #E2F3FF 100%)'}} />;
const Ground: React.FC<{y?: number; line?: boolean}> = ({y = 0, line = true}) => (
  <div style={{position: 'absolute', left: -20000, top: y, width: 40000, height: 30000, background: '#D8D1C4',
    borderTop: line ? `8px solid ${INK}` : 'none'}} />
);

// ---------- SCENE A: outside the tower ----------
const TW = 760 / (S.tower as any).w; // tower world scale
const towerH = (S.tower as any).h * TW;
const SceneA: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([
    {t: 0, x: 0, y: -330, k: 1.62},
    {t: T.glide0, x: 0, y: -330, k: 1.62},
    {t: T.glide1, x: 0, y: -5900, k: 0.6},
    {t: T.cut1, x: 0, y: -6050, k: 0.56},
  ], t);
  // turn: front_calm -> lookup with a squash on the narrowest frame
  const tu = seg(t, T.turn - 0.09, T.turn + 0.09);
  const sxTurn = 1 - 0.2 * Math.sin(Math.PI * tu);
  const n: SN = t < T.turn ? 'front_calm' : 'lookup';
  const bounce = spring(t, T.turn + 0.09, 0.03, 3, 7);
  const dof = 1 - seg(t, T.glide0, T.glide0 + 0.8);
  return (
    <>
      <Sky />
      <Layer cam={cam} z={5200} blur={3.2 * dof}>
        <Spr n="skyline" x={-600} y={0} s={1.0} ay={(S.skyline as any).h - 14} />
        <Spr n="skyline" x={2200} y={0} s={0.9} ay={(S.skyline as any).h - 14} flip />
        <Ground y={-4} />
      </Layer>
      <Layer cam={cam} z={2600}>
        <Spr n="clouds" x={-500} y={-8200} s={0.55} />
        <Spr n="clouds" x={700} y={-10600} s={0.45} />
        <Spr n="clouds" x={-200} y={-12400} s={0.5} />
      </Layer>
      <Layer cam={cam} z={1450} blur={1.4 * dof}>
        <Spr n="tower" x={0} y={0} s={TW} ay={(S.tower as any).h - 13} />
        <Ground y={0} line={false} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Ground y={0} line={false} />
        <div style={{position: 'absolute', left: -60, top: -14, width: 120, height: 26, borderRadius: '50%', background: 'rgba(72,54,42,0.26)', filter: 'blur(3px)'}} />
        <Guy n={n} x={0} y={0} t={t} sx={sxTurn} sy={(1 + 0.03 * Math.sin(Math.PI * tu)) * (1 + bounce)} />
      </Layer>
      <Layer cam={cam} z={1800}>
        <Spr n="clouds" x={900} y={-5300} s={0.4} />
      </Layer>
    </>
  );
};

// ---------- shaft world (scenes B and D) ----------
const SHAFT = {l: -230, r: 230, top: -1110};
const ShaftBack: React.FC<{y0: number; y1: number}> = ({y0, y1}) => {
  const floors: number[] = [];
  for (let y = 0; y < 14000; y += 420) floors.push(y);
  return (
    <>
      <div style={{position: 'absolute', left: -30000, top: -30000, width: 60000, height: 60000, background: '#F3E6CF'}} />
      <div style={{position: 'absolute', left: SHAFT.l, top: SHAFT.top, width: SHAFT.r - SHAFT.l, height: 16000, background: '#5B6879',
        borderLeft: `10px solid ${INK}`, borderRight: `10px solid ${INK}`, borderTop: `10px solid ${INK}`, boxSizing: 'border-box'}} />
      {[-168, 168].map((x) => <div key={x} style={{position: 'absolute', left: x - 7, top: SHAFT.top, width: 14, height: 16000, background: '#7D8A9B'}} />)}
      {floors.map((y) => (
        <React.Fragment key={y}>
          <div style={{position: 'absolute', left: SHAFT.r, top: y - 4, width: 40000, height: 8, background: '#D9C6A5'}} />
          <div style={{position: 'absolute', left: SHAFT.l - 40000, top: y - 4, width: 40000, height: 8, background: '#D9C6A5'}} />
        </React.Fragment>
      ))}
      {/* machine-room beam */}
      <div style={{position: 'absolute', left: -330, top: SHAFT.top - 40, width: 660, height: 46, background: '#7E8792', border: `8px solid ${INK}`, borderRadius: 10, boxSizing: 'border-box'}} />
    </>
  );
};

const steelN = (t: number, list: number[]) => [1, ...list.map((a) => popIn(t, a, 0.3))];

const faceB = (t: number): Face => {
  const f: Face = {open: 0, lx: 0, ly: 0, lid: 0, brow: 0, mouth: 'none', squeeze: 0, sweat: 0, shake: 0};
  if (t < T.rope) return f;
  f.open = popIn(t, T.rope, 0.3); f.mouth = 'o';
  if (t > T.rope + 0.6) f.mouth = 'flat';
  const blink = [7.6, 11.6].some((b) => t > b && t < b + 0.12);
  if (blink) f.lid = 0.95;
  if (t > T.car - 0.1) { f.ly = 1; f.lx = -0.5; f.brow = -10; }
  if (t > T.own) { f.lid = Math.max(f.lid, 0.3); f.brow = 18; f.mouth = 'grit'; f.ly = 0.6; f.lx = 0; }
  if (t > T.past && t < T.zoomTop1) { f.ly = 1; f.mouth = 'o'; f.brow = -12; f.lid = 0; }
  if (t > T.zoomTop1) { f.mouth = 'grit'; f.brow = 20; f.lid = 0.25 + 0.1 * T.extra.filter((a) => t > a).length; f.ly = 0.8; f.shake = 0.4; }
  if (t > T.strain) { f.squeeze = 1; f.sweat = popIn(t, T.strain, 0.3); f.shake = 1; f.brow = 22; }
  return f;
};

const SceneB: React.FC<{t: number}> = ({t}) => {
  const lt = t;
  const dip = spring(t, T.car, 16, 2.4, 4) * -1 + (t > T.car ? 10 * seg(t, T.car, T.car + 0.15) : 0);
  const desc = eio(seg(t, T.past - 0.05, T.down1));
  const carTop = lerp(-250, 4300, desc) + dip;
  const cam = camAt([
    {t: T.cut1, x: 0, y: -380, k: 1.32},
    {t: T.past - 0.1, x: 0, y: -360, k: 1.36},
    {t: T.down1 + 0.05, x: 0, y: 1900, k: 0.3},
    {t: T.zoomTop0, x: 0, y: 1900, k: 0.3},
    {t: T.zoomTop1, x: 40, y: -640, k: 1.02},
    {t: T.cut2, x: 40, y: -650, k: 1.08},
  ], t);
  const wob = spring(t, T.rope, 26, 8, 3.5);
  const cabX = WHEEL.x - WHEEL.r + 6;
  const n = steelN(t, T.extra);
  const len = Math.round(500 * clamp((carTop + 250) / 4550));
  const badgeS = t > T.past - 0.05 && t < T.zoomTop0 + 0.1 ? popIn(t, T.past - 0.05, 0.3) * (1 - seg(t, T.zoomTop0 - 0.1, T.zoomTop0 + 0.1)) : 0;
  const guyN: SN = t < T.car ? 'front_calm' : 'front_worried';
  const sq = 1 - 0.06 * Math.sin(Math.PI * seg(t, T.car - 0.08, T.car + 0.08));
  const f = faceB(t);
  const pulSy = t > T.strain ? 0.95 + 0.01 * Math.sin(t * 40) : 1;
  return (
    <>
      <Layer cam={cam} z={1000}>
        <ShaftBack y0={-2000} y1={6000} />
        <Cables x={cabX} y0={WHEEL.y} y1={carTop + 6} n={n} wob={wob} />
        <Car cx={cabX} top={carTop} t={lt} guy={guyN} guySy={sq} guySx={2 - sq} />
        <Arrow x={cabX} y={carGeo(cabX, carTop).bottom + 80} s={popIn(t, T.car, 0.3) * (1 - seg(t, T.past - 0.2, T.past))} />
        {[0, 1, 2, 3].map((i) => <Arrow key={i} x={cabX - 70} y={WHEEL.y + 170 + i * 150} s={0.55 * popIn(t, T.own + i * 0.15, 0.25) * (1 - seg(t, T.past - 0.2, T.past))} />)}
        <Pulley f={f} t={t} sy={pulSy} />
      </Layer>
      <Badge text={`${len} m`} s={badgeS} />
    </>
  );
};

// ---------- SCENE C: the sky lobby ----------
const LOB = -2000;
const SceneC: React.FC<{t: number}> = ({t}) => {
  const cam = camAt([
    {t: T.cut2, x: 0, y: -2150, k: 0.42},
    {t: T.ride0 + 0.05, x: 0, y: -2150, k: 0.42},
    {t: T.ride1 - 0.05, x: 0, y: -2250, k: 1.18},
    {t: T.up0, x: 0, y: -2250, k: 1.18},
    {t: T.up1, x: 0, y: -2520, k: 1.12},
    {t: T.cut3, x: 0, y: -2530, k: 1.12},
  ], t);
  const carH = (CAR.body[3] - CAR.top[1]) * CS;
  const doorFloor = (CAR.door[3] - CAR.top[1]) * CS;
  const top1 = lerp(-carH, LOB - doorFloor, eio(seg(t, T.ride0, T.ride1)));
  const top2 = lerp(LOB - doorFloor, -4100, eio(seg(t, T.up0, T.up1)));
  const d1 = seg(t, T.ride1 + 0.05, T.ride1 + 0.3) * (1 - seg(t, 18.9, 19.2));
  const d2 = seg(t, 18.55, 18.8) * (1 - seg(t, 19.45, 19.75));
  const hop = seg(t, T.hop0, T.hop1);
  const hx = lerp(-240, 240, eio(hop)); const hy = LOB - 6 - 130 * Math.sin(Math.PI * hop);
  const wsq = t > T.hop1 ? 1 - 0.06 * Math.exp(-8 * (t - T.hop1)) : 1;
  const sign = popIn(t, T.sign, 0.35);
  const floors: number[] = []; for (let y = -300; y > -4400; y -= 300) floors.push(y);
  return (
    <>
      <Sky />
      <Layer cam={cam} z={5200}>
        <Spr n="skyline" x={-1400} y={0} s={1.0} ay={(S.skyline as any).h - 14} />
        <Spr n="skyline" x={1600} y={0} s={1.0} ay={(S.skyline as any).h - 14} flip />
        <Ground y={-4} />
      </Layer>
      <Layer cam={cam} z={2400}>
        <Spr n="clouds" x={-1300} y={-4300} s={0.45} />
        <Spr n="clouds" x={1500} y={-6200} s={0.4} />
      </Layer>
      <Layer cam={cam} z={1000}>
        <Ground y={0} />
        {/* tower cut-away */}
        <div style={{position: 'absolute', left: -520, top: -4400, width: 1040, height: 4400, background: '#F3E6CF', border: `12px solid ${INK}`, boxSizing: 'border-box', borderBottom: 'none'}} />
        <div style={{position: 'absolute', left: -440, top: -4560, width: 880, height: 170, background: '#9BC4E8', border: `12px solid ${INK}`, borderRadius: '30px 30px 0 0', boxSizing: 'border-box'}} />
        {floors.map((y) => <div key={y} style={{position: 'absolute', left: -508, top: y - 3, width: 1016, height: 6, background: '#DCCAA9'}} />)}
        {/* lobby room */}
        <div style={{position: 'absolute', left: -508, top: LOB - 440, width: 1016, height: 440, background: '#FFF6E2'}} />
        <div style={{position: 'absolute', left: -520, top: LOB, width: 1040, height: 36, background: '#A7AFB9', border: `8px solid ${INK}`, boxSizing: 'border-box'}} />
        {/* shafts */}
        <div style={{position: 'absolute', left: -430, top: LOB - 440, width: 380, height: -LOB + 440, background: '#5B6879', border: `9px solid ${INK}`, boxSizing: 'border-box', borderBottom: 'none'}} />
        <div style={{position: 'absolute', left: 50, top: -4400, width: 380, height: 4400 + LOB, background: '#5B6879', border: `9px solid ${INK}`, boxSizing: 'border-box'}} />
        <Car cx={-240} top={top1} t={t} guy={t < T.hop0 ? 'front_calm' : null} doors={1 - d1} />
        <Car cx={240} top={top2} t={t} guy={t >= T.hop1 ? 'front_wave' : null} guySy={wsq} doors={1 - d2} />
        {t >= T.hop0 && t < T.hop1 ? <Guy n="walk" x={hx} y={hy} t={t} breathe={false} rot={6 * Math.sin(Math.PI * 2 * hop)} /> : null}
        {/* sign */}
        <div style={{position: 'absolute', left: -240, top: LOB - 760, transform: `translate(-50%,-50%) scale(${sign})`, background: '#2F80ED',
          color: '#fff', border: `8px solid ${INK}`, borderRadius: 22, padding: '6px 26px', fontFamily: FONT, fontWeight: 900, fontSize: 58, whiteSpace: 'nowrap'}}>SKY LOBBY</div>
      </Layer>
    </>
  );
};

// ---------- SCENE D: carbon fibre ----------
const faceD = (t: number): Face => {
  const f: Face = {open: 1, lx: 0, ly: 0.8, lid: 0.45, brow: 22, mouth: 'grit', squeeze: 1, sweat: 1, shake: 1};
  if (t > T.relief) {
    f.squeeze = 0; f.shake = 0; f.sweat = 1 - seg(t, T.relief, T.relief + 0.25);
    f.open = popIn(t, T.relief, 0.3); f.brow = -6; f.mouth = 'grin'; f.lid = 0; f.ly = 0.6;
  }
  if (t > T.relief + 0.7) { f.lid = 0.42; f.mouth = 'smile'; f.brow = -4; f.ly = 0.2; f.lx = 0.4; }
  if (t > T.push0) { f.lid = 0; f.ly = 1; f.mouth = 'grin'; }
  return f;
};
const SceneD: React.FC<{t: number}> = ({t}) => {
  const desc = eio(seg(t, T.push0, T.push1));
  const carTop = lerp(4300, 9300, desc) + (t > T.push1 ? spring(t, T.push1, -14, 2.6, 5) : 0);
  const cam = camAt([
    {t: T.cut3, x: 40, y: -640, k: 1.02},
    {t: T.push0 - 0.05, x: 40, y: -660, k: 1.06},
    {t: T.push1, x: 0, y: 4500, k: 0.17},
    {t: T.final0, x: 0, y: 4500, k: 0.17},
    {t: DURATION, x: 0, y: 9450, k: 0.62, e: 'out'},
  ], t);
  const cabX = WHEEL.x - WHEEL.r + 6;
  const shrink = 1 - seg(t, T.lighter, T.lighter + 0.3);
  const n = [1, 1, 1, 1, 1].map((v) => v * shrink);
  const carbon = popIn(t, T.lighter + 0.22, 0.3);
  const f = faceD(t);
  const meters = Math.round(lerp(500, 1000, desc));
  const badgeText = t >= T.km ? '1 km' : `${meters} m`;
  const badgeS = t > T.push0 ? popIn(t, T.push0, 0.3) * (t >= T.km ? 1 + 0.18 * Math.exp(-6 * (t - T.km)) * Math.sin(Math.min(1, (t - T.km) / 0.3) * Math.PI) : 1) : 0;
  const lim = popIn(t, T.push0 + 0.1, 0.3);
  const y500 = 4300 + (CAR.body[3] - CAR.top[1]) * CS;
  return (
    <>
      <Layer cam={cam} z={1000}>
        <ShaftBack y0={-2000} y1={11000} />
        {lim > 0.01 ? <>
          <div style={{position: 'absolute', left: SHAFT.l - 260, top: y500 - 9, width: SHAFT.r - SHAFT.l + 520, height: 18,
            backgroundImage: `repeating-linear-gradient(90deg, #E2412F 0 60px, transparent 60px 100px)`, opacity: lim}} />
          <div style={{position: 'absolute', left: SHAFT.r + 300, top: y500, transform: `translate(0,-50%) scale(${lim})`, transformOrigin: 'left center',
            background: '#fff', border: `16px solid ${INK}`, borderRadius: 60, padding: '10px 50px', fontFamily: FONT, fontWeight: 900, fontSize: 380, color: '#E2412F', whiteSpace: 'nowrap'}}>500 m</div>
        </> : null}
        <Cables x={cabX} y0={WHEEL.y} y1={carTop + 6} n={n} carbon={carbon} />
        <Car cx={cabX} top={carTop} t={t} guy="front_wave" />
        <Pulley f={f} t={t} />
        {[[-150, -980, 0], [190, -1050, 0.08], [-120, -620, 0.16], [150, -520, 0.24]].map(([x, y, d], i) =>
          <Star key={i} x={x + cabX} y={y} s={popIn(t, T.lighter + 0.3 + d, 0.25) * (1 - seg(t, T.lighter + 0.9 + d, T.lighter + 1.2 + d))} r={t * 90} />)}
      </Layer>
      <Badge text={badgeText} s={badgeS} />
    </>
  );
};

// ---------- sound ----------
type Cue = {f: string; at: number; db: number};
const CUES: Cue[] = [
  {f: 'whoosh.wav', at: T.glide0 + 0.2, db: -27},
  {f: 'twang.mp3', at: T.rope, db: -15},
  {f: 'pop.wav', at: T.rope + 0.02, db: -24},
  {f: 'pop.wav', at: T.car, db: -21},
  {f: 'strain.mp3', at: T.car + 0.05, db: -26},
  ...[0, 1, 2, 3].map((i) => ({f: 'pop.wav', at: T.own + i * 0.15, db: -25})),
  {f: 'whoosh.wav', at: T.past - 0.2, db: -26},
  {f: 'whir.mp3', at: T.past - 0.1, db: -30},
  {f: 'whoosh.wav', at: T.zoomTop0 - 0.1, db: -29},
  ...T.extra.map((a) => ({f: 'pop.wav', at: a, db: -22})),
  {f: 'strain.mp3', at: T.strain, db: -17},
  {f: 'strain.mp3', at: T.strain + 0.55, db: -20},
  {f: 'whir.mp3', at: T.ride0, db: -25},
  {f: 'ding.mp3', at: T.ride1, db: -16},
  {f: 'whoosh.wav', at: T.hop0, db: -29},
  {f: 'pop.wav', at: T.sign, db: -20},
  {f: 'whir.mp3', at: T.up0, db: -27},
  {f: 'pop.wav', at: T.lighter + 0.22, db: -18},
  {f: 'twang.mp3', at: T.lighter + 0.25, db: -24},
  {f: 'whoosh.wav', at: T.push0 - 0.1, db: -26},
  {f: 'whir.mp3', at: T.push0 + 0.1, db: -27},
  {f: 'ding.mp3', at: T.push1, db: -14},
];

const shakeAt = (t: number) => {
  const env = (t0: number, a: number, d = 5) => (t < t0 ? 0 : a * Math.exp(-d * (t - t0)));
  const rumble = t > T.strain && t < T.cut2 ? 3 * seg(t, T.strain, T.strain + 0.3) : 0;
  const a = env(T.car, 7) + env(T.ride1, 4) + env(T.push1, 9) + env(T.lighter + 0.22, 3) + rumble;
  return {x: a * (Math.sin(t * 2 * Math.PI * 13.3) * 0.7 + Math.sin(t * 2 * Math.PI * 7.1) * 0.3),
    y: a * (Math.sin(t * 2 * Math.PI * 11.7 + 1) * 0.6 + Math.sin(t * 2 * Math.PI * 5.3) * 0.4)};
};

export const ElevatorShort: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const sh = shakeAt(t);
  let scene: React.ReactNode;
  if (t < T.cut1) scene = <WideFit.Provider value={0.7}><SceneA t={t} /></WideFit.Provider>;
  else if (t < T.cut2) scene = <SceneB t={t} />;
  else if (t < T.cut3) scene = <WideFit.Provider value={0.72}><SceneC t={t} /></WideFit.Provider>;
  else scene = <SceneD t={t} />;
  return (
    <AbsoluteFill style={{background: '#F3E6CF', overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `translate(${sh.x}px, ${sh.y}px) scale(1.012)`}}>{scene}</AbsoluteFill>
      <Sequence from={Math.round(VO_AT * FPS)} layout="none"><Audio src={staticFile('elevator/vo/take1.mp3')} /></Sequence>
      {CUES.map((c, i) => (
        <Sequence key={i} from={Math.round(c.at * FPS)} layout="none">
          <Audio src={staticFile(`elevator/sfx/${c.f}`)} volume={10 ** (c.db / 20)} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// ---------- YouTube thumbnail (1280x720 still) ----------
export const Thumbnail: React.FC = () => {
  const G = 0.75;
  const cabX = WHEEL.x - WHEEL.r + 6;
  const ox = 455 - cabX * G, oy = 140 + 900 * G;
  const carTop = (330 - oy) / G;
  const f: Face = {open: 1, lx: 0, ly: 0.8, lid: 0, brow: 22, mouth: 'grit', squeeze: 1, sweat: 1, shake: 0};
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 45% 40%, #D6EEFF 0%, #A9D8FF 45%, #6FB6F5 100%)', overflow: 'hidden'}}>
      {/* the supertall tower behind */}
      <Spr n="tower" x={150} y={20} s={0.74} ax={(S.tower as any).w / 2} ay={13} />
      <Spr n="clouds" x={150} y={235} s={0.085} />
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${ox}px, ${oy}px) scale(${G})`}}>
        <Cables x={cabX} y0={WHEEL.y} y1={carTop + 6} n={[1, 1, 1, 1, 1]} />
        <Car cx={cabX} top={carTop} t={0.4} guy="front_worried" />
        <Arrow x={cabX - 150} y={-760} s={0.85} />
        <Arrow x={cabX - 150} y={-620} s={0.85} />
        <Pulley f={f} t={0.35} />
      </div>
      <div style={{position: 'absolute', right: 34, top: 180, textAlign: 'right', fontFamily: FONT, fontWeight: 900, lineHeight: 0.92,
        fontSize: 150, color: '#FFD43B', WebkitTextStroke: `16px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 10px 0 ${INK}`, letterSpacing: -2}}>
        TOO<br />HEAVY?
      </div>
    </AbsoluteFill>
  );
};

// ---------- vertical thumbnail (1080x1920 still) ----------
export const ThumbnailTall: React.FC = () => {
  const G = 1.2;
  const cabX = WHEEL.x - WHEEL.r + 6;
  const ox = 600 - cabX * G, oy = 760 + 900 * G;
  const carTop = (1150 - oy) / G;
  const f: Face = {open: 1, lx: 0, ly: 0.8, lid: 0, brow: 22, mouth: 'grit', squeeze: 1, sweat: 1, shake: 0};
  return (
    <AbsoluteFill style={{background: 'radial-gradient(circle at 55% 50%, #D6EEFF 0%, #A9D8FF 45%, #6FB6F5 100%)', overflow: 'hidden'}}>
      <Spr n="tower" x={150} y={560} s={1.05} ax={(S.tower as any).w / 2} ay={13} />
      <Spr n="clouds" x={170} y={860} s={0.12} />
      <Spr n="clouds" x={930} y={1560} s={0.1} />
      <div style={{position: 'absolute', left: 0, top: 0, transformOrigin: '0 0', transform: `translate(${ox}px, ${oy}px) scale(${G})`}}>
        <Cables x={cabX} y0={WHEEL.y} y1={carTop + 6} n={[1, 1, 1, 1, 1]} />
        <Car cx={cabX} top={carTop} t={0.4} guy="front_worried" />
        <Arrow x={cabX - 160} y={-760} s={0.95} />
        <Arrow x={cabX - 160} y={-600} s={0.95} />
        <Pulley f={f} t={0.35} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 110, textAlign: 'center', fontFamily: FONT, fontWeight: 900, lineHeight: 0.92,
        fontSize: 210, color: '#FFD43B', WebkitTextStroke: `20px ${INK}`, paintOrder: 'stroke fill', textShadow: `0 12px 0 ${INK}`, letterSpacing: -3}}>
        TOO<br />HEAVY?
      </div>
    </AbsoluteFill>
  );
};
