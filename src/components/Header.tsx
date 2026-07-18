import React from 'react';
import { Play, Pause, RotateCcw, Cpu, ShieldCheck, Zap, Coins, Trophy } from 'lucide-react';

interface HeaderProps {
  status: 'IDLE' | 'RUNNING' | 'PAUSED' | 'FINISHED';
  speed: number;
  onToggleStatus: () => void;
  onReset: () => void;
  onChangeSpeed: (speed: number) => void;
  credits?: number;
  correctPredictions?: number;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  speed,
  onToggleStatus,
  onReset,
  onChangeSpeed,
  credits = 500,
  correctPredictions = 0,
}) => {
  return (
    <header className="relative w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-10">
      {/* Decorative cyber grid accent lines */}
      <div className="absolute bottom-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-cyber-blue via-transparent to-transparent" />
      <div className="absolute bottom-0 right-0 w-1/3 h-[1px] bg-gradient-to-l from-cyber-red via-transparent to-transparent" />

      {/* Left section: Logo & App Status */}
      <div className="flex items-center gap-4">
        <div className="relative flex items-center justify-center p-2 rounded border border-cyber-blue-dim bg-slate-900/50 shadow-[0_0_10px_rgba(0,240,255,0.1)]">
          <Zap className="w-6 h-6 text-cyber-blue animate-pulse" />
          <div className="absolute inset-0 bg-cyber-blue/10 blur-sm rounded" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-white to-cyber-red font-mono-cyber">
            LLM // ARENA
          </h1>
          <p className="text-xs text-slate-500 font-mono-cyber uppercase flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full inline-block ${status === 'RUNNING' ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
            SYSTEM STATUS: {status}
          </p>
        </div>
      </div>

      {/* Middle section: System Stats Grid */}
      <div className="hidden lg:flex items-center gap-6 text-xs font-mono-cyber border-l border-r border-slate-800 px-6 py-1">
        {/* Credits Stat */}
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-850 px-2 py-0.5 rounded">
          <Coins className="w-3.5 h-3.5 text-cyber-yellow animate-pulse" />
          <div>
            <span className="text-slate-500 block text-[8px] uppercase leading-none">CREDITS</span>
            <span className="text-cyber-yellow font-black text-xs text-glow-yellow leading-tight">{credits} CR</span>
          </div>
        </div>
        {/* Predictions Stat */}
        <div className="flex items-center gap-2 bg-slate-900/60 border border-slate-850 px-2 py-0.5 rounded mr-2">
          <Trophy className="w-3.5 h-3.5 text-emerald-400" />
          <div>
            <span className="text-slate-500 block text-[8px] uppercase leading-none">PREDICTIONS</span>
            <span className="text-emerald-400 font-bold text-xs text-glow-blue leading-tight">{correctPredictions} WINS</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyber-blue" />
          <div>
            <span className="text-slate-500 block uppercase">SYSTEM LOAD</span>
            <span className="text-cyber-blue font-semibold text-glow-blue">24.8%</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <div>
            <span className="text-slate-500 block uppercase">FIREWALL DEPLOYED</span>
            <span className="text-emerald-500 font-semibold text-glow-blue">SECURE</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-4 h-4">
            <span className="absolute inset-0 w-full h-full bg-cyber-red/20 rounded-full animate-ping" />
            <span className="relative block w-3.5 h-3.5 bg-cyber-red rounded-full m-0.5" />
          </div>
          <div>
            <span className="text-slate-500 block uppercase">ALERT LEVEL</span>
            <span className="text-cyber-red font-bold text-glow-red">CRITICAL</span>
          </div>
        </div>
      </div>

      {/* Right section: Simulation Controls */}
      <div className="flex items-center gap-3">
        {/* Speed Controls */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded px-1.5 py-1">
          <span className="text-[10px] text-slate-500 font-mono-cyber mr-2 ml-1 uppercase">SPEED</span>
          {[1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-0.5 rounded text-xs font-mono-cyber font-bold transition-all ${
                speed === s
                  ? 'bg-cyber-blue/15 text-cyber-blue border border-cyber-blue/30 shadow-[0_0_8px_rgba(0,240,255,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>

        {/* Play/Pause Button */}
        <button
          onClick={onToggleStatus}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded font-mono-cyber text-sm font-semibold uppercase tracking-wider transition-all border ${
            status === 'RUNNING'
              ? 'bg-amber-500/10 text-amber-500 border-amber-500/30 hover:bg-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
              : 'bg-cyber-blue/10 text-cyber-blue border-cyber-blue/30 hover:bg-cyber-blue/20 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
          }`}
        >
          {status === 'RUNNING' ? (
            <>
              <Pause className="w-4 h-4" /> Pause Simulation
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" /> Run Simulation
            </>
          )}
        </button>

        {/* Reset Button */}
        <button
          onClick={onReset}
          className="flex items-center justify-center p-2 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all active:scale-95"
          title="Reset Battle"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
