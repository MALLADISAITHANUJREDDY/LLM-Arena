import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, HelpCircle } from 'lucide-react';

interface ArenaProps {
  activeAttack: {
    type: string;
    sender: 'red' | 'blue';
    timestamp: number;
  } | null;
  queriesCount: number;
  blockedCount: number;
  onSimulateAttack: () => void;
  speed?: number;
}

// ── Sparkle particle (a 4-pointed star shape) ──────────────────────────────
const StarShape = ({ size }: { size: number }) => (
  <polygon
    points={`0,${-size} ${size * 0.3},${-size * 0.3} ${size},0 ${size * 0.3},${size * 0.3} 0,${size} ${-size * 0.3},${size * 0.3} ${-size},0 ${-size * 0.3},${-size * 0.3}`}
    fill="#ff2244"
  />
);

// ── Individual sparkle flying left→right ────────────────────────────────────
const Sparkle = ({
  startX, startY, endX, endY, arcY, delay, size, duration,
}: {
  startX: number; startY: number; endX: number; endY: number;
  arcY: number; delay: number; size: number; duration: number;
}) => {
  // We animate the cx/cy ourselves via keyframes using motion.g
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 1, 1, 1, 0],
        x: [startX, (startX + endX) / 2, endX],
        y: [startY, arcY, endY],
        rotate: [0, 180, 360],
        scale: [0.5, 1.2, 0.8],
      }}
      transition={{
        duration,
        delay,
        ease: 'easeInOut',
        times: [0, 0.1, 0.5, 0.85, 1],
      }}
    >
      <StarShape size={size} />
      {/* Electric glow ring */}
      <circle r={size * 1.8} fill="none" stroke="#ff0033" strokeWidth="0.6" opacity="0.45" />
    </motion.g>
  );
};

// ── Individual water bubble rising and popping ───────────────────────────────
const Bubble = ({
  cx, cy, startY, endY, delay, r, duration,
}: {
  cx: number; cy: number; startY: number; endY: number;
  delay: number; r: number; duration: number;
}) => {
  return (
    <motion.g
      initial={{ opacity: 0, y: 0 }}
      animate={{
        opacity: [0, 0.9, 0.9, 0],
        y: [startY - cy, endY - cy, endY - cy - 4, endY - cy - 10],
        scale: [0.3, 1, 1.3, 0.1],
      }}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {/* Bubble body */}
      <circle cx={cx} cy={cy} r={r} fill="rgba(0,220,255,0.12)" stroke="#00e5ff" strokeWidth="1.2" />
      {/* Highlight glint */}
      <circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.25} fill="rgba(255,255,255,0.5)" />
      {/* Pop ripple */}
      <motion.circle
        cx={cx} cy={cy} r={r}
        fill="none" stroke="#00d4ff" strokeWidth="0.8"
        initial={{ scale: 1, opacity: 0.6 }}
        animate={{ scale: 2.5, opacity: 0 }}
        transition={{ duration: duration * 0.4, delay: delay + duration * 0.6 }}
      />
    </motion.g>
  );
};

export const Arena: React.FC<ArenaProps> = ({
  activeAttack,
  queriesCount,
  blockedCount,
  onSimulateAttack,
  speed = 1,
}) => {
  const successRate = queriesCount > 0 ? Math.round(((queriesCount - blockedCount) / queriesCount) * 100) : 100;

  // Pulse animation clock for organic shape vibration
  const [pulseTime, setPulseTime] = React.useState(0);
  React.useEffect(() => {
    let animId: number;
    const tick = () => {
      setPulseTime((t) => t + 0.05);
      animId = requestAnimationFrame(tick);
    };
    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Geometry configuration
  const R = 64;
  const CX = 100;
  const CY = 100;

  const angles = [
    -Math.PI / 2,
    -Math.PI / 2 + Math.PI / 3,
    -Math.PI / 2 + 2 * Math.PI / 3,
    -Math.PI / 2 + Math.PI,
    -Math.PI / 2 + 4 * Math.PI / 3,
    -Math.PI / 2 + 5 * Math.PI / 3,
  ];

  const baseRed = [0.72, 0.48, 0.38, 0.82, 0.76, 0.86];
  const baseBlue = [0.55, 0.84, 0.88, 0.46, 0.58, 0.38];

  const getDynamicRed = () => {
    const values = [...baseRed];
    if (activeAttack) {
      if (activeAttack.sender === 'red') {
        values[0] = 0.94; values[3] = 0.92; values[4] = 0.90; values[5] = 0.96;
        values[1] = 0.30; values[2] = 0.28;
      } else {
        values[0] = 0.40; values[3] = 0.45; values[5] = 0.35;
      }
    }
    return values.map((val, idx) => Math.max(0.15, Math.min(0.98, val + Math.sin(pulseTime + idx) * 0.02)));
  };

  const getDynamicBlue = () => {
    const values = [...baseBlue];
    if (activeAttack) {
      if (activeAttack.sender === 'blue') {
        values[1] = 0.96; values[2] = 0.94; values[0] = 0.75;
        values[3] = 0.28; values[4] = 0.30; values[5] = 0.20;
      } else {
        values[1] = 0.35; values[2] = 0.40; values[0] = 0.38;
      }
    }
    return values.map((val, idx) => Math.max(0.15, Math.min(0.98, val + Math.cos(pulseTime * 1.2 + idx) * 0.02)));
  };

  const redValues = getDynamicRed();
  const blueValues = getDynamicBlue();

  // Animation durations scaled to simulation speed
  const animDuration = speed === 5 ? 0.22 : speed === 2 ? 0.50 : 0.90;

  // Sparkle definitions – 8 particles in staggered arcs
  const sparkles = [
    { id: 's1', startX: -15, startY: 78,  endX: 215, endY: 82,  arcY: 65,  delay: 0.00, size: 3.5 },
    { id: 's2', startX: -15, startY: 92,  endX: 215, endY: 98,  arcY: 108, delay: 0.06, size: 2.8 },
    { id: 's3', startX: -15, startY: 100, endX: 215, endY: 104, arcY: 88,  delay: 0.03, size: 4.5 },
    { id: 's4', startX: -15, startY: 112, endX: 215, endY: 118, arcY: 124, delay: 0.10, size: 2.2 },
    { id: 's5', startX: -15, startY: 86,  endX: 215, endY: 90,  arcY: 75,  delay: 0.15, size: 3.0 },
    { id: 's6', startX: -15, startY: 118, endX: 215, endY: 110, arcY: 130, delay: 0.08, size: 2.5 },
    { id: 's7', startX: -15, startY: 96,  endX: 215, endY: 100, arcY: 84,  delay: 0.18, size: 3.8 },
    { id: 's8', startX: -15, startY: 104, endX: 215, endY: 108, arcY: 116, delay: 0.13, size: 2.0 },
  ];

  // Bubble definitions – scattered around center
  const bubbles = [
    { id: 'b1', cx: 88,  cy: 100, startY: 130, endY: 78,  delay: 0.00, r: 7   },
    { id: 'b2', cx: 100, cy: 100, startY: 135, endY: 68,  delay: 0.08, r: 10  },
    { id: 'b3', cx: 112, cy: 100, startY: 128, endY: 80,  delay: 0.04, r: 6   },
    { id: 'b4', cx: 80,  cy: 100, startY: 132, endY: 85,  delay: 0.14, r: 8   },
    { id: 'b5', cx: 120, cy: 100, startY: 136, endY: 72,  delay: 0.20, r: 9   },
    { id: 'b6', cx: 94,  cy: 100, startY: 140, endY: 62,  delay: 0.11, r: 12  },
    { id: 'b7', cx: 106, cy: 100, startY: 130, endY: 76,  delay: 0.17, r: 5.5 },
  ];

  const getPointsString = (values: number[]) => {
    return values.map((val, i) => {
      const r = val * R;
      const x = CX + r * Math.cos(angles[i]);
      const y = CY + r * Math.sin(angles[i]);
      return `${x},${y}`;
    }).join(' ');
  };

  const redPoints = getPointsString(redValues);
  const bluePoints = getPointsString(blueValues);

  const nodeLabels: {
    text: string; color: string; textClass: string;
    anchor: 'end' | 'middle' | 'start'; dx: number; dy: number;
  }[] = [
    { text: 'ATTACK TEAM', color: '#ff0055', textClass: 'fill-rose-400 font-bold', anchor: 'middle', dx: 0, dy: -18 },
    { text: 'BLUE TEAM',   color: '#00f0ff', textClass: 'fill-blue-400 font-bold', anchor: 'start',  dx: 16, dy: -4 },
    { text: 'DEFENSE',     color: '#00f0ff', textClass: 'fill-blue-400 font-bold', anchor: 'start',  dx: 16, dy: 10 },
    { text: 'ATCK VECTORS',color: '#10b981', textClass: 'fill-emerald-400 font-bold', anchor: 'middle', dx: 0, dy: 24 },
    { text: 'MED VECTORS', color: '#10b981', textClass: 'fill-emerald-400 font-bold', anchor: 'end',  dx: -16, dy: 10 },
    { text: 'ATTACK',      color: '#ff0055', textClass: 'fill-rose-400 font-bold', anchor: 'end',    dx: -16, dy: -4 },
  ];

  const isRedAttack  = activeAttack?.sender === 'red';
  const isBlueDefend = activeAttack?.sender === 'blue';

  return (
    <div className="relative flex flex-col h-full bg-slate-950/60 border border-slate-800/80 rounded p-6 overflow-hidden min-h-[400px] justify-between">
      {/* Abstract Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,48,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,48,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />

      {/* Corner Brackets */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-slate-700/60 pointer-events-none" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-slate-700/60 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-slate-700/60 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-slate-700/60 pointer-events-none" />

      {/* Top Telemetry Panel */}
      <div className="grid grid-cols-3 gap-2 border-b border-slate-800 pb-4 relative z-10">
        <div className="text-center font-mono-cyber">
          <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">TOTAL PACKETS</span>
          <span className="text-base font-black text-white tracking-widest">{queriesCount}</span>
        </div>
        <div className="text-center font-mono-cyber border-l border-r border-slate-800">
          <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">BLOCKED REQS</span>
          <span className="text-base font-black text-cyber-red tracking-widest text-glow-red">{blockedCount}</span>
        </div>
        <div className="text-center font-mono-cyber">
          <span className="text-xs text-slate-400 block uppercase font-bold tracking-wider">BYPASS RATE</span>
          <span className="text-base font-black text-cyber-blue tracking-widest text-glow-blue">{100 - successRate}%</span>
        </div>
      </div>

      {/* ── Center Visualization ── */}
      <div className="relative flex-1 flex items-center justify-center my-4 min-h-[260px]">

        <svg className="w-full max-w-[280px] aspect-square overflow-visible z-0" viewBox="0 0 200 200">
          <defs>
            {/* Red laser / sparkle glow */}
            <filter id="sparkle-glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Cyan bubble glow */}
            <filter id="bubble-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Radial gradient for background flash */}
            <radialGradient id="red-flash" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ff0033" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#ff0033" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="blue-flash" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#00d4ff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#00d4ff" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* 1. Concentric Helper Hexagons */}
          {[0.2, 0.4, 0.6, 0.8, 1.0].map((scale) => (
            <polygon
              key={`grid-${scale}`}
              points={angles.map(angle => `${CX + R * scale * Math.cos(angle)},${CY + R * scale * Math.sin(angle)}`).join(' ')}
              fill="none"
              stroke="rgba(30, 41, 59, 0.85)"
              strokeWidth="0.8"
            />
          ))}

          {/* 2. Axis lines */}
          {angles.map((angle, i) => (
            <line
              key={`axis-${i}`}
              x1={CX} y1={CY}
              x2={CX + R * Math.cos(angle)}
              y2={CY + R * Math.sin(angle)}
              stroke="rgba(30, 41, 59, 0.7)"
              strokeWidth="0.75"
              strokeDasharray="2,2"
            />
          ))}

          {/* 3. Team polygons */}
          <motion.polygon
            points={redPoints}
            fill="rgba(239, 68, 68, 0.12)"
            stroke="#ff0055"
            strokeWidth="1.5"
            className="drop-shadow-[0_0_6px_rgba(255,0,85,0.4)]"
            animate={{ points: redPoints }}
            transition={{ type: 'spring', stiffness: 85, damping: 15 }}
          />
          <motion.polygon
            points={bluePoints}
            fill="rgba(6, 182, 212, 0.12)"
            stroke="#00f0ff"
            strokeWidth="1.5"
            className="drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]"
            animate={{ points: bluePoints }}
            transition={{ type: 'spring', stiffness: 85, damping: 15 }}
          />

          {/* ══ 4. RED ATTACK: Electric Sparkle Storm ════════════════════════ */}
          <AnimatePresence>
            {isRedAttack && (
              <g key={`sparkle-burst-${activeAttack!.timestamp}`} filter="url(#sparkle-glow)">
                {/* Background red flash */}
                <motion.rect
                  x="-20" y="-20" width="240" height="240"
                  fill="url(#red-flash)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: animDuration * 0.6, ease: 'easeOut' }}
                />

                {/* Horizontal laser beam */}
                <motion.line
                  x1="-20" y1="100" x2="220" y2="100"
                  stroke="#ff0033"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: [0, 0.8, 0], scaleX: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ originX: '0px', originY: '0px' }}
                  transition={{ duration: animDuration, ease: 'easeOut' }}
                />

                {/* Sparkle particles */}
                {sparkles.map((s) => (
                  <Sparkle
                    key={s.id}
                    startX={s.startX}
                    startY={s.startY}
                    endX={s.endX}
                    endY={s.endY}
                    arcY={s.arcY}
                    delay={s.delay * (animDuration / 0.9)}
                    size={s.size}
                    duration={animDuration * 0.85}
                  />
                ))}

                {/* Impact explosion at right side */}
                <motion.circle
                  cx="195" cy="100" r="14"
                  fill="none" stroke="#ff2244" strokeWidth="2"
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: [0.2, 1.4], opacity: [0.9, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: animDuration * 0.7, delay: animDuration * 0.5, ease: 'easeOut' }}
                />
                <motion.circle
                  cx="195" cy="100" r="8"
                  fill="#ff0033" opacity="0.3"
                  initial={{ scale: 0.2, opacity: 0.7 }}
                  animate={{ scale: [0.2, 1.8], opacity: [0.7, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: animDuration * 0.9, delay: animDuration * 0.55, ease: 'easeOut' }}
                />
              </g>
            )}
          </AnimatePresence>

          {/* ══ 5. BLUE DEFENSE: Water Bubble Shield ══════════════════════════ */}
          <AnimatePresence>
            {isBlueDefend && (
              <g key={`bubble-shield-${activeAttack!.timestamp}`} filter="url(#bubble-glow)">
                {/* Background cyan flash */}
                <motion.rect
                  x="-20" y="-20" width="240" height="240"
                  fill="url(#blue-flash)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: animDuration * 0.6, ease: 'easeOut' }}
                />

                {/* Rising bubbles */}
                {bubbles.map((b) => (
                  <Bubble
                    key={b.id}
                    cx={b.cx}
                    cy={b.cy}
                    startY={b.startY}
                    endY={b.endY}
                    delay={b.delay * (animDuration / 0.9)}
                    r={b.r}
                    duration={animDuration}
                  />
                ))}

                {/* Shield dome outline */}
                <motion.ellipse
                  cx={CX} cy={CY}
                  rx="55" ry="38"
                  fill="rgba(0,212,255,0.05)"
                  stroke="#00d4ff"
                  strokeWidth="1.5"
                  strokeDasharray="4 3"
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: [0.3, 1.1, 1.0], opacity: [0, 0.8, 0.4, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: animDuration, ease: 'easeOut' }}
                />

                {/* Expanding ring waves x3 */}
                {[0, 0.15, 0.30].map((delay, idx) => (
                  <motion.circle
                    key={`ring-${idx}`}
                    cx={CX} cy={CY} r={R}
                    fill="none" stroke="#00e5ff"
                    strokeWidth={1.5 - idx * 0.35}
                    initial={{ scale: 0.1, opacity: 0.85 }}
                    animate={{ scale: [0.1, 1.5], opacity: [0.85, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: animDuration * 0.85,
                      delay: delay * (animDuration / 0.9),
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </g>
            )}
          </AnimatePresence>

          {/* 6. Vertex Nodes & Labels */}
          {angles.map((angle, i) => {
            const x = CX + R * Math.cos(angle);
            const y = CY + R * Math.sin(angle);
            const nl = nodeLabels[i];
            return (
              <g key={`node-${i}`} className="select-none font-mono-cyber">
                <circle cx={x} cy={y} r="8" fill={`${nl.color}15`} stroke={`${nl.color}40`} strokeWidth="1" />
                <circle cx={x} cy={y} r="3" fill={nl.color} />
                <text
                  x={x} y={y}
                  dx={nl.dx} dy={nl.dy}
                  textAnchor={nl.anchor}
                  fontSize="6.8"
                  fontWeight="950"
                  letterSpacing="0.4"
                  className={`${nl.textClass} tracking-widest`}
                >
                  {nl.text}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Telemetry Badge */}
        <AnimatePresence>
          {activeAttack && (
            <motion.div
              key={activeAttack.timestamp}
              initial={{ opacity: 0, scale: 0.8, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 6 }}
              className="absolute px-3 py-1.5 bg-slate-950/90 border border-slate-800 rounded shadow-2xl font-mono-cyber text-[10px] z-10 flex items-center gap-2"
              style={{ bottom: '5%' }}
            >
              <span className={`w-2 h-2 rounded-full inline-block ${isRedAttack ? 'bg-cyber-red animate-pulse' : 'bg-cyber-blue animate-pulse'}`} />
              <span className="text-slate-400">PROPAGATING:</span>
              <strong className={isRedAttack ? 'text-cyber-red' : 'text-cyber-blue'}>
                {activeAttack.type.toUpperCase()}
              </strong>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Interface */}
      <div className="flex flex-col items-center gap-3 relative z-10 border-t border-slate-800 pt-4">
        <button
          onClick={onSimulateAttack}
          className="group relative flex items-center gap-2.5 px-6 py-2.5 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 font-mono-cyber text-xs font-bold uppercase tracking-widest text-slate-100 hover:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.6)] hover:bg-slate-800 cursor-pointer active:scale-98"
        >
          <span className="absolute top-0 left-0 w-2.5 h-[2px] bg-cyber-red" />
          <span className="absolute bottom-0 right-0 w-2.5 h-[2px] bg-cyber-blue" />
          <Crosshair className="w-4 h-4 text-cyber-red group-hover:rotate-90 transition-transform duration-300" />
          Trigger Rapid Attack Step
        </button>
        <p className="text-xs text-slate-400 font-mono-cyber uppercase flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" /> Force-trigger a mock offensive-defensive step
        </p>
      </div>
    </div>
  );
};
