import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Flame, Cpu, Trash2 } from 'lucide-react';

export interface LogItem {
  id: string;
  timestamp: string;
  sender: 'red' | 'blue' | 'system';
  category: string;
  message: string;
  details?: string;
}

interface BattleLogProps {
  logs: LogItem[];
  onClearLogs: () => void;
}

export const BattleLog: React.FC<BattleLogProps> = ({ logs, onClearLogs }) => {
  const [filter, setFilter] = useState<'all' | 'red' | 'blue' | 'system'>('all');
  const logConsoleRef = useRef<HTMLDivElement>(null);

  // Automatically scroll to bottom when new logs arrive (without scrolling parent window)
  useEffect(() => {
    if (logConsoleRef.current) {
      logConsoleRef.current.scrollTop = logConsoleRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    return log.sender === filter;
  });

  return (
    <div className="flex flex-col h-full bg-slate-950/60 border border-slate-800/80 rounded overflow-hidden">
      {/* Log Header & Filters */}
      <div className="flex flex-col border-b border-slate-900 bg-slate-950/90 px-4 py-3 gap-2.5">
        {/* Title and Clear Button */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 font-mono-cyber">
            <Terminal className="w-4 h-4 text-cyber-blue shrink-0" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-200">
              TERMINAL LOGS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyber-blue animate-pulse shrink-0" />
          </div>
          <button
            onClick={onClearLogs}
            className="flex items-center justify-center p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all cursor-pointer active:scale-95 shrink-0"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filters Container */}
        <div className="flex flex-wrap gap-1 bg-slate-900 border border-slate-800/80 rounded p-1 w-full justify-between">
          {(['all', 'red', 'blue', 'system'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`flex-1 min-w-[45px] text-center py-1 rounded text-[9px] font-mono-cyber font-bold uppercase transition-all cursor-pointer ${
                filter === cat
                  ? cat === 'red'
                    ? 'bg-cyber-red/20 text-cyber-red border border-cyber-red/40'
                    : cat === 'blue'
                      ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40'
                      : cat === 'system'
                        ? 'bg-cyber-yellow/20 text-cyber-yellow border border-cyber-yellow/40'
                        : 'bg-slate-700/60 text-slate-100 border border-slate-500/40'
                  : 'text-slate-400 hover:text-slate-200 border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Console Pane */}
      <div ref={logConsoleRef} className="flex-1 p-3.5 font-mono-cyber text-xs space-y-3 overflow-y-auto bg-slate-950/80">
        <div className="text-[10px] text-slate-400 border-b border-slate-900 pb-1.5 uppercase font-bold">
          LOG INITIATED - COLD-BOOT ACTIVE
        </div>

        <AnimatePresence initial={false}>
          {filteredLogs.map((log) => {
            const isRed = log.sender === 'red';
            const isBlue = log.sender === 'blue';
            const isSys = log.sender === 'system';

            let logColor = 'text-slate-200';
            let icon = <Cpu className="w-3.5 h-3.5 text-slate-400" />;
            let tagBg = 'bg-slate-900 border-slate-800 text-slate-400';

            if (isRed) {
              logColor = 'text-red-200';
              icon = <Flame className="w-3.5 h-3.5 text-cyber-red shrink-0" />;
              tagBg = 'bg-cyber-red/15 border-cyber-red/40 text-cyber-red font-bold';
            } else if (isBlue) {
              logColor = 'text-cyan-200';
              icon = <Shield className="w-3.5 h-3.5 text-cyber-blue shrink-0" />;
              tagBg = 'bg-cyber-blue/15 border-cyber-blue/40 text-cyber-blue font-bold';
            } else if (isSys) {
              logColor = 'text-amber-200';
              tagBg = 'bg-cyber-yellow/15 border-cyber-yellow/40 text-cyber-yellow font-bold';
            }

            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 8, x: -3 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1.5 p-2 bg-slate-900/40 border border-slate-900/60 hover:bg-slate-900/70 hover:border-slate-800 rounded transition-all group"
              >
                <div className="flex justify-between items-center w-full">
                  <span className="text-slate-500 text-[10px] select-none">{log.timestamp}</span>
                  <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] uppercase border shrink-0 tracking-wider ${tagBg}`}>
                    {log.category}
                  </span>
                </div>

                <div className="flex items-start gap-2">
                  <div className="mt-0.5 shrink-0">{icon}</div>
                  <div className="flex-1 space-y-1">
                    <div className={`leading-snug font-medium break-all ${logColor}`}>{log.message}</div>
                    {log.details && (
                      <div className="text-[10px] text-slate-400 border-l border-slate-800 pl-2 py-0.5 mt-1 leading-normal font-sans">
                        {log.details}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-slate-500 uppercase select-none font-bold">
            --- NO PACKETS RECORDED ---
          </div>
        )}
      </div>

      {/* Simulated Console Prompt */}
      <div className="flex items-center px-3 py-2 border-t border-slate-900 bg-slate-950 font-mono-cyber text-xs gap-2 shrink-0">
        <span className="text-cyber-blue font-bold select-none">&gt;</span>
        <input
          type="text"
          placeholder="Shell read-only..."
          disabled
          className="flex-1 bg-transparent border-none outline-none text-slate-400 placeholder-slate-600 cursor-not-allowed select-none text-[10px]"
        />
        <span className="text-[9px] text-slate-400 uppercase tracking-widest bg-slate-900 px-1.5 py-0.5 border border-slate-800 rounded shrink-0 font-bold">
          SYS
        </span>
      </div>
    </div>
  );
};
