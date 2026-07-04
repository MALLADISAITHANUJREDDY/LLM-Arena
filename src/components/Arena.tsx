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
}

export const Arena: React.FC<ArenaProps> = ({
  activeAttack,
  queriesCount,
  blockedCount,
  onSimulateAttack,
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
  const R = 64; // Max radius within 200x200 canvas
  const CX = 100;
  const CY = 100;

  // Concentric angles for the 6 vertices (Top, Top-Right, Bottom-Right, Bottom, Bottom-Left, Top-Left)
  const angles = [
    -Math.PI / 2,                  // 0 (Top, ATACK TEAM)
    -Math.PI / 2 + Math.PI / 3,    // 1 (Top-Right, BLUE TEAM)
    -Math.PI / 2 + 2 * Math.PI / 3, // 2 (Bottom-Right, DEFENSE)
    -Math.PI / 2 + Math.PI,        // 3 (Bottom, ATTACEK VECTORS)
    -Math.PI / 2 + 4 * Math.PI / 3, // 4 (Bottom-Left, MEEDUAL VECTORS)
    -Math.PI / 2 + 5 * Math.PI / 3  // 5 (Top-Left, ATTACK)
  ];

  // Base state profiles for red and blue polygons
  const baseRed = [0.72, 0.48, 0.38, 0.82, 0.76, 0.86];
  const baseBlue = [0.55, 0.84, 0.88, 0.46, 0.58, 0.38];

  // Calculate dynamic vectors based on active attack state
  const getDynamicRed = () => {
    const values = [...baseRed];
    if (activeAttack) {
      if (activeAttack.sender === 'red') {
        // Boost attacker axes
        values[0] = 0.94;
        values[3] = 0.92;
        values[4] = 0.90;
        values[5] = 0.96;
        // Suppress defense
        values[1] = 0.30;
        values[2] = 0.28;
      } else {
        // Under counter-attack
        values[0] = 0.40;
        values[3] = 0.45;
        values[5] = 0.35;
      }
    }
    // Add subtle organic sine noise
    return values.map((val, idx) => Math.max(0.15, Math.min(0.98, val + Math.sin(pulseTime + idx) * 0.02)));
  };

  const getDynamicBlue = () => {
    const values = [...baseBlue];
    if (activeAttack) {
      if (activeAttack.sender === 'blue') {
        // Boost defender axes
        values[1] = 0.96;
        values[2] = 0.94;
        values[0] = 0.75;
        // Suppress attacker
        values[3] = 0.28;
        values[4] = 0.30;
        values[5] = 0.20;
      } else {
        // Under attack
        values[1] = 0.35;
        values[2] = 0.40;
        values[0] = 0.38;
      }
    }
    // Add subtle organic cosine noise
    return values.map((val, idx) => Math.max(0.15, Math.min(0.98, val + Math.cos(pulseTime * 1.2 + idx) * 0.02)));
  };

  const redValues = getDynamicRed();
  const blueValues = getDynamicBlue();

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
    text: string;
    color: string;
    textClass: string;
    anchor: 'end' | 'middle' | 'start';
    dx: number;
    dy: number;
  }[] = [
    { text: 'ATACK TEAM', color: '#ff0055', textClass: 'fill-rose-350 font-bold', anchor: 'middle', dx: 0, dy: -18 },
    { text: 'BLUE TEAM', color: '#00f0ff', textClass: 'fill-blue-400 font-bold', anchor: 'start', dx: 16, dy: -4 },
    { text: 'DEFENSE', color: '#00f0ff', textClass: 'fill-blue-400 font-bold', anchor: 'start', dx: 16, dy: 10 },
    { text: 'ATTACEK VECTORS', color: '#10b981', textClass: 'fill-emerald-400 font-bold', anchor: 'middle', dx: 0, dy: 24 },
    { text: 'MEEDUAL VECTORS', color: '#10b981', textClass: 'fill-emerald-400 font-bold', anchor: 'end', dx: -16, dy: 10 },
    { text: 'ATTACK', color: '#ff0055', textClass: 'fill-rose-350 font-bold', anchor: 'end', dx: -16, dy: -4 }
  ];

  return (
    <div className="relative flex flex-col h-full bg-slate-950/60 border border-slate-800/80 rounded p-6 overflow-hidden min-h-[400px] justify-between">
      {/* Abstract Cyber Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,24,48,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(18,24,48,0.1)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      {/* Corner Brackets decoration */}
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

      {/* Center Visualization: Hexagonal Radar Web Grid */}
      <div className="relative flex-1 flex items-center justify-center my-4 min-h-[260px]">
        
        <svg className="w-full max-w-[280px] aspect-square overflow-visible z-0" viewBox="0 0 200 200">
          {/* Glowing Filter Definitions */}
          <defs>
            <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="radar-glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
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

          {/* 2. Axis lines connecting center to vertices */}
          {angles.map((angle, i) => (
            <line
              key={`axis-${i}`}
              x1={CX}
              y1={CY}
              x2={CX + R * Math.cos(angle)}
              y2={CY + R * Math.sin(angle)}
              stroke="rgba(30, 41, 59, 0.7)"
              strokeWidth="0.75"
              strokeDasharray="2,2"
            />
          ))}

          {/* 3. Animating team polygons */}
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

          {/* 4. Active Red Attack Laser Beam */}
          <AnimatePresence>
            {activeAttack && activeAttack.sender === 'red' && (
              <motion.line
                x1="-30"
                y1="82"
                x2="230"
                y2="118"
                stroke="#ff0055"
                strokeWidth="2.5"
                filter="url(#laser-glow)"
                initial={{ opacity: 0, pathLength: 0 }}
                animate={{ opacity: [0, 1, 1, 0], pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          {/* 5. Active Blue Defense Expanding Ring Wave */}
          <AnimatePresence>
            {activeAttack && activeAttack.sender === 'blue' && (
              <motion.circle
                cx={CX}
                cy={CY}
                r={R}
                fill="none"
                stroke="#00f0ff"
                strokeWidth="2"
                filter="url(#radar-glow-cyan)"
                initial={{ scale: 0.1, opacity: 0.9 }}
                animate={{ scale: [0.1, 1.25], opacity: [0.9, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          {/* 6. Nodes & Text Labels for Vertices */}
          {angles.map((angle, i) => {
            const x = CX + R * Math.cos(angle);
            const y = CY + R * Math.sin(angle);
            const nl = nodeLabels[i];
            return (
              <g key={`node-${i}`} className="select-none font-mono-cyber">
                {/* Outer pulsing ring halo */}
                <circle cx={x} cy={y} r="8" fill={`${nl.color}15`} stroke={`${nl.color}40`} strokeWidth="1" />
                {/* Solid core indicator */}
                <circle cx={x} cy={y} r="3" fill={nl.color} />
                {/* Vertex Label Text */}
                <text
                  x={x}
                  y={y}
                  dx={nl.dx}
                  dy={nl.dy}
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

        {/* Floating Telemetry Badge Overlay */}
        <AnimatePresence>
          {activeAttack && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute px-3 py-1.5 bg-slate-950/90 border border-slate-800 rounded shadow-2xl font-mono-cyber text-[10px] z-10 flex items-center gap-2"
              style={{ bottom: '5%' }}
            >
              <span className={`w-2 h-2 rounded-full inline-block ${activeAttack.sender === 'red' ? 'bg-cyber-red animate-pulse' : 'bg-cyber-blue animate-pulse'}`} />
              <span className="text-slate-400">PROPAGATING:</span>
              <strong className={activeAttack.sender === 'red' ? 'text-cyber-red' : 'text-cyber-blue'}>
                {activeAttack.type.toUpperCase()}
              </strong>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Interface Interactions */}
      <div className="flex flex-col items-center gap-3 relative z-10 border-t border-slate-800 pt-4">
        <button
          onClick={onSimulateAttack}
          className="group relative flex items-center gap-2.5 px-6 py-2.5 rounded bg-slate-900 border border-slate-700 hover:border-slate-500 font-mono-cyber text-xs font-bold uppercase tracking-widest text-slate-100 hover:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.6)] hover:bg-slate-800 cursor-pointer active:scale-98"
        >
          {/* Cyber accents inside button */}
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
