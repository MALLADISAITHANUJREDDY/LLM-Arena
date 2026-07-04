import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, HelpCircle, Activity } from 'lucide-react';

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

  // Render mock network nodes
  const nodes = [
    { id: 1, x: 20, y: 30, type: 'input' },
    { id: 2, x: 20, y: 70, type: 'input' },
    { id: 3, x: 45, y: 20, type: 'core' },
    { id: 4, x: 45, y: 50, type: 'core' },
    { id: 5, x: 45, y: 80, type: 'core' },
    { id: 6, x: 80, y: 30, type: 'output' },
    { id: 7, x: 80, y: 70, type: 'output' },
  ];

  // Tight vertical clash offset (keeps the fight exactly on the central VS badge)
  const clashOffset = activeAttack ? (activeAttack.timestamp % 3) : 0;
  const clashTop = clashOffset === 1 ? '48%' : clashOffset === 2 ? '52%' : '50%';
  const clashTopVal = clashOffset === 1 ? 48 : clashOffset === 2 ? 52 : 50;

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

      {/* Center Visualization: Nodes and Animations */}
      <div className="relative flex-1 flex items-center justify-center my-4 min-h-[220px]">
        {/* Network connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Static gray connections */}
          <path d="M 20 30 L 45 20 M 20 30 L 45 50 M 20 70 L 45 50 M 20 70 L 45 80 M 45 20 L 80 30 M 45 50 L 80 30 M 45 50 L 80 70 M 45 80 L 80 70" stroke="rgba(51,65,85,0.6)" strokeWidth="0.75" fill="none" />

          {/* Active attack vector laser simulation converging in the center */}
          <AnimatePresence>
            {activeAttack && activeAttack.sender === 'red' && (
              <motion.path
                key="attack-laser"
                d={`M 20 30 L 45 ${clashTopVal} L 50 ${clashTopVal}`}
                stroke="url(#red-glow-gradient)"
                strokeWidth="2.5"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
            {activeAttack && activeAttack.sender === 'blue' && (
              <motion.path
                key="defend-pulse"
                d={`M 80 30 L 45 ${clashTopVal} L 50 ${clashTopVal}`}
                stroke="url(#blue-glow-gradient)"
                strokeWidth="2.5"
                fill="none"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              />
            )}
          </AnimatePresence>

          <defs>
            <linearGradient id="red-glow-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff0055" stopOpacity="1" />
              <stop offset="100%" stopColor="#ff0055" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="blue-glow-gradient" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* 1. Red Firing & Red Rockets/Fire Bullets Animation targeting the center */}
        <AnimatePresence>
          {activeAttack && activeAttack.sender === 'red' && (
            <>
              {/* Swarm of 7 Firing Fire Bullets */}
              <motion.div
                key="bullet-1"
                className="absolute w-4 h-1.5 bg-gradient-to-r from-transparent to-cyber-red rounded-full z-15"
                style={{ left: '20%', top: '35%', boxShadow: '0 0 8px #ff0055' }}
                initial={{ left: '20%', top: '35%', opacity: 1, scale: 0.8 }}
                animate={{ left: '50%', top: clashTop, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeIn" }}
              />
              <motion.div
                key="bullet-2"
                className="absolute w-4 h-1.5 bg-gradient-to-r from-transparent to-cyber-red rounded-full z-15"
                style={{ left: '20%', top: '45%', boxShadow: '0 0 8px #ff0055' }}
                initial={{ left: '20%', top: '45%', opacity: 1, scale: 0.8 }}
                animate={{ left: '50%', top: clashTop, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, delay: 0.05, ease: "easeIn" }}
              />
              <motion.div
                key="bullet-3"
                className="absolute w-4 h-1.5 bg-gradient-to-r from-transparent to-cyber-red rounded-full z-15"
                style={{ left: '20%', top: '55%', boxShadow: '0 0 8px #ff0055' }}
                initial={{ left: '20%', top: '55%', opacity: 1, scale: 0.8 }}
                animate={{ left: '50%', top: clashTop, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.38, delay: 0.1, ease: "easeIn" }}
              />
              <motion.div
                key="bullet-4"
                className="absolute w-4 h-1.5 bg-gradient-to-r from-transparent to-cyber-red rounded-full z-15"
                style={{ left: '20%', top: '65%', boxShadow: '0 0 8px #ff0055' }}
                initial={{ left: '20%', top: '65%', opacity: 1, scale: 0.8 }}
                animate={{ left: '50%', top: clashTop, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.42, delay: 0.15, ease: "easeIn" }}
              />
              <motion.div
                key="bullet-5"
                className="absolute w-4 h-1.5 bg-gradient-to-r from-transparent to-cyber-red rounded-full z-15"
                style={{ left: '20%', top: '40%', boxShadow: '0 0 8px #ff0055' }}
                initial={{ left: '20%', top: '40%', opacity: 1, scale: 0.8 }}
                animate={{ left: '50%', top: clashTop, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, delay: 0.2, ease: "easeIn" }}
              />
              <motion.div
                key="bullet-6"
                className="absolute w-4 h-1.5 bg-gradient-to-r from-transparent to-cyber-red rounded-full z-15"
                style={{ left: '20%', top: '60%', boxShadow: '0 0 8px #ff0055' }}
                initial={{ left: '20%', top: '60%', opacity: 1, scale: 0.8 }}
                animate={{ left: '50%', top: clashTop, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.25, ease: "easeIn" }}
              />
              <motion.div
                key="bullet-7"
                className="absolute w-4 h-1.5 bg-gradient-to-r from-transparent to-cyber-red rounded-full z-15"
                style={{ left: '20%', top: '50%', boxShadow: '0 0 8px #ff0055' }}
                initial={{ left: '20%', top: '50%', opacity: 1, scale: 0.8 }}
                animate={{ left: '50%', top: clashTop, opacity: [1, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, delay: 0.3, ease: "easeIn" }}
              />

              {/* Red Bomb 1 (Main Blast) */}
              <motion.div
                key="bomb-blast-1"
                className="absolute w-20 h-20 rounded-full bg-gradient-radial from-cyber-red/90 via-red-600/25 to-transparent z-25 pointer-events-none"
                style={{ 
                  left: '50%', 
                  top: clashTop, 
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 45px rgba(255, 0, 85, 0.9), inset 0 0 20px rgba(255, 0, 85, 0.5)'
                }}
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ scale: [0.1, 2.5, 3.2], opacity: [0, 1, 0.8, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
              />

              {/* Red Bomb 2 (Staggered upper blast) */}
              <motion.div
                key="bomb-blast-2"
                className="absolute w-14 h-14 rounded-full bg-gradient-radial from-cyber-red/80 via-red-700/20 to-transparent z-25 pointer-events-none"
                style={{ 
                  left: '49%', 
                  top: `calc(${clashTop} - 10px)`, 
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 35px rgba(255, 0, 85, 0.8)'
                }}
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ scale: [0.1, 2.2, 2.8], opacity: [0, 1, 0.6, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.42, ease: "easeOut" }}
              />

              {/* Red Bomb 3 (Staggered lower blast) */}
              <motion.div
                key="bomb-blast-3"
                className="absolute w-14 h-14 rounded-full bg-gradient-radial from-cyber-red/85 via-red-700/20 to-transparent z-25 pointer-events-none"
                style={{ 
                  left: '51%', 
                  top: `calc(${clashTop} + 10px)`, 
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '0 0 35px rgba(255, 0, 85, 0.8)'
                }}
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ scale: [0.1, 2.2, 2.8], opacity: [0, 1, 0.6, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.48, ease: "easeOut" }}
              />

              {/* Expanding shockwave rings from center */}
              <motion.div
                key="shockwave-ring-1"
                className="absolute w-12 h-12 border-2 border-cyber-red/60 rounded-full z-20 pointer-events-none"
                style={{ left: '50%', top: clashTop, transform: 'translate(-50%, -50%)' }}
                initial={{ scale: 0.2, opacity: 0 }}
                animate={{ scale: 3.8, opacity: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, delay: 0.38, ease: "easeOut" }}
              />
            </>
          )}
        </AnimatePresence>

        {/* 2. Blue Team Shield & Sprinkle Animation in the center Clash Point */}
        <AnimatePresence>
          {activeAttack && activeAttack.sender === 'blue' && (
            <>
              {/* Blue glowing crescent shield deflecting in the center */}
              <motion.div
                key="defender-shield-center"
                className="absolute w-24 h-24 rounded-full border-r-4 border-cyber-blue z-25 pointer-events-none"
                style={{ 
                  left: '50%', 
                  top: clashTop, 
                  transform: 'translate(-50%, -50%)',
                  boxShadow: '10px 0 25px rgba(0, 240, 255, 0.85), inset -4px 0 10px rgba(0, 240, 255, 0.4)',
                  filter: 'drop-shadow(0 0 12px rgba(0, 240, 255, 0.6))'
                }}
                initial={{ opacity: 0, scale: 0.5, rotate: -45 }}
                animate={{ 
                  opacity: [0, 1, 0.9, 1, 0], 
                  scale: [0.5, 1.15, 1, 1.1, 0.5],
                  rotate: [-45, 0, 0, 0, -45]
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
              />

              {/* Central diagnostic ripple expanding from center */}
              <motion.div
                key="defense-ripple-center"
                className="absolute w-16 h-16 border border-cyber-blue/50 rounded-full z-5 pointer-events-none"
                style={{ left: '50%', top: clashTop, transform: 'translate(-50%, -50%)' }}
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 2.2, opacity: [0, 0.6, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />

              {/* Blue Sprinkle/Sparks shooting leftwards from center clash */}
              <motion.div
                key="sprinkle-1"
                className="absolute w-2 h-1 bg-cyber-blue rounded-full z-20 pointer-events-none"
                style={{ left: '48%', top: `${clashTopVal - 8}%`, boxShadow: '0 0 8px #00f0ff' }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: -100, y: -45, opacity: 0, rotate: 25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
              />
              <motion.div
                key="sprinkle-2"
                className="absolute w-2.5 h-1 bg-cyber-blue rounded-full z-20 pointer-events-none"
                style={{ left: '46%', top: clashTop, boxShadow: '0 0 8px #00f0ff' }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: -120, y: 5, opacity: 0, rotate: -5 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
              />
              <motion.div
                key="sprinkle-3"
                className="absolute w-2 h-1 bg-cyber-blue rounded-full z-20 pointer-events-none"
                style={{ left: '48%', top: `${clashTopVal + 8}%`, boxShadow: '0 0 8px #00f0ff' }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: -100, y: 45, opacity: 0, rotate: -25 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, delay: 0.1, ease: "easeOut" }}
              />
              <motion.div
                key="sprinkle-4"
                className="absolute w-2 h-2 bg-cyan-400 rounded-full z-20 pointer-events-none"
                style={{ left: '47%', top: `${clashTopVal - 4}%`, boxShadow: '0 0 8px #00f0ff' }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: -80, y: -20, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
              />
              <motion.div
                key="sprinkle-5"
                className="absolute w-2 h-2 bg-cyan-400 rounded-full z-20 pointer-events-none"
                style={{ left: '47%', top: `${clashTopVal + 4}%`, boxShadow: '0 0 8px #00f0ff' }}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ x: -80, y: 20, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.05, ease: "easeOut" }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Network Nodes */}
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {nodes.map((node) => {
            const isTargeted = activeAttack && (
              (activeAttack.sender === 'red' && node.type === 'output') ||
              (activeAttack.sender === 'blue' && node.type === 'input')
            );
            return (
              <div
                key={node.id}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
              >
                <div
                  className={`w-4 h-4 rounded-full border transition-all duration-300 ${
                    isTargeted
                      ? activeAttack.sender === 'red'
                        ? 'bg-cyber-red border-white shadow-[0_0_18px_#ff0055] scale-125'
                        : 'bg-cyber-blue border-white shadow-[0_0_18px_#00f0ff] scale-125'
                      : 'bg-slate-900 border-slate-600'
                  }`}
                />
                <div className={`w-2.5 h-2.5 rounded-full mt-1 ${isTargeted ? 'bg-white animate-ping' : 'bg-transparent'}`} />
              </div>
            );
          })}
        </div>

        {/* VS Shield / Badge */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative w-28 h-28 flex items-center justify-center" style={{ top: clashOffset === 1 ? '-6px' : clashOffset === 2 ? '6px' : '0px', transition: 'top 0.3s ease' }}>
            {/* Pulsing neon rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border border-dashed border-slate-700"
            />
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-2 rounded-full border border-double border-slate-600 bg-slate-950 shadow-[0_0_20px_rgba(0,0,0,0.9)]"
            />
            <div className="absolute inset-0 rounded-full bg-gradient-radial from-slate-900/10 via-transparent to-transparent pointer-events-none" />

            {/* Glowing red & blue boundary splits */}
            <div className="absolute top-0 bottom-0 left-[50%] w-[1px] bg-gradient-to-b from-cyber-red/35 via-transparent to-cyber-blue/35" />

            {/* VS text with interactive glows */}
            <div className="relative flex flex-col items-center justify-center font-mono-cyber">
              <span className="text-[10px] text-slate-400 tracking-widest uppercase font-bold">NODE STATE</span>
              <h2 className="text-3xl font-black italic tracking-tighter text-white font-mono-cyber leading-none select-none flex">
                <span className="text-cyber-red text-glow-red pr-0.5">V</span>
                <span className="text-cyber-blue text-glow-blue">S</span>
              </h2>
              <span className="text-[9px] text-slate-300 mt-1 uppercase font-bold tracking-wider px-1 bg-slate-900 border border-slate-800 rounded">
                SIM_ACTIVE
              </span>
            </div>
          </div>
        </div>

        {/* Live Attack Beam Alerts */}
        <AnimatePresence>
          {activeAttack && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="absolute flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded shadow-2xl font-mono-cyber text-xs z-20"
              style={{ top: clashOffset === 1 ? '70%' : clashOffset === 2 ? '30%' : '66%', left: '50%', transform: 'translateX(-50%)', transition: 'top 0.3s ease' }}
            >
              <Activity className={`w-3.5 h-3.5 ${activeAttack.sender === 'red' ? 'text-cyber-red animate-pulse' : 'text-cyber-blue animate-pulse'}`} />
              <span className="text-slate-300 font-bold">PROPAGATING:</span>
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
