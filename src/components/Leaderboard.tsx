import React, { useState } from 'react';
import {
  Trophy,
  Coins,
  CheckCircle2,
  Terminal
} from 'lucide-react';

interface LeaderboardProps {
  credits: number;
  correctPredictions: number;
  totalPredictions: number;
  onAwardCredits: (amount: number, isCorrect: boolean) => void;
}

interface Competitor {
  username: string;
  credits: number;
  correct: number;
  total: number;
  isUser?: boolean;
}

const MOCK_COMPETITORS: Competitor[] = [
  { username: 'prompt_assassin', credits: 2450, correct: 18, total: 20 },
  { username: 'weight_decay_bot', credits: 1900, correct: 12, total: 15 },
  { username: 'sentinel_sec', credits: 1650, correct: 10, total: 12 },
  { username: 'overfitting_ninja', credits: 950, correct: 6, total: 10 },
  { username: 'gradient_descent', credits: 350, correct: 2, total: 8 },
  { username: 'exploit_vector', credits: 150, correct: 1, total: 9 }
];

export const Leaderboard: React.FC<LeaderboardProps> = ({
  credits,
  correctPredictions,
  totalPredictions,
  onAwardCredits
}) => {
  // Refill tasks states
  const [activeRefillTask, setActiveRefillTask] = useState<string | null>(null);
  const [taskLogs, setTaskLogs] = useState<string[]>([]);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Sound Synth Helpers
  const playSoundEffect = (type: 'complete' | 'task' | 'click') => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      const gainNode = ctx.createGain();
      gainNode.connect(ctx.destination);

      if (type === 'complete') {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.connect(noteGain);
          noteGain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          noteGain.gain.setValueAtTime(0, now + i * 0.1);
          noteGain.gain.linearRampToValueAtTime(0.18, now + i * 0.1 + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.25);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.25);
        });
      } else if (type === 'task') {
        const osc = ctx.createOscillator();
        osc.connect(gainNode);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.linearRampToValueAtTime(880, now + 0.3);
        gainNode.gain.setValueAtTime(0.08, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        osc.connect(gainNode);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.05);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.warn('Audio Context Synth inactive:', e);
    }
  };

  // Compile full sorted lists including user's live credits
  const userRow: Competitor = {
    username: 'User_1 (You)',
    credits,
    correct: correctPredictions,
    total: totalPredictions,
    isUser: true
  };

  const fullList = [...MOCK_COMPETITORS, userRow].sort((a, b) => b.credits - a.credits);

  // Secure audits task lists for refilling credits
  const refillTasks = [
    { id: 'task-1', title: 'Audit Sandbox Firewall Rules', desc: 'Scan local Sentinel guardrail endpoints for open port leakage.', reward: 50 },
    { id: 'task-2', title: 'Sanitize Inbound User Payloads', desc: 'Verify regex boundaries against SQL and base64 override injections.', reward: 50 },
    { id: 'task-3', title: 'Evaluate Threat Vector Weights', desc: 'Recalculate safety compliance margins on the adversary.gpt node.', reward: 50 }
  ];

  const handleRunTask = (taskId: string, reward: number) => {
    playSoundEffect('task');
    setActiveRefillTask(taskId);
    setTaskLogs([]);

    const steps = [
      `Establishing connection to audit sub-node ${taskId.toUpperCase()}...`,
      'Running validation scanners on telemetry ports...',
      'Sanitizing context boundaries & compliance checksums...',
      `Mitigation complete! Credits payout initialized...`
    ];

    steps.forEach((text, idx) => {
      setTimeout(() => {
        setTaskLogs(prev => [...prev, `[Task] ${text}`]);
      }, idx * 350);
    });

    // Complete the task and add credits
    setTimeout(() => {
      playSoundEffect('complete');
      onAwardCredits(reward, false); // Add credits, do not increment predictions
      setCompletedTasks(prev => [...prev, taskId]);
      setActiveRefillTask(null);
    }, steps.length * 350 + 150);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch font-mono-cyber">
      {/* 1. Left Section: Rank Scoreboard Table */}
      <div className="xl:col-span-8 flex flex-col gap-6">
        <div className="bg-slate-950/60 border border-slate-900 rounded p-5 relative overflow-hidden flex flex-col gap-4">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-blue" />
          
          <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4.5 h-4.5 text-cyber-yellow animate-bounce" />
              <h2 className="text-sm font-black text-white uppercase tracking-widest text-glow-blue">GLOBAL LEADERBOARD RANKINGS</h2>
            </div>
            <span className="text-[10px] text-slate-455 font-bold uppercase">NODE_RANK_SCORE_S1</span>
          </div>

          {/* Leaderboard Rankings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-900 text-slate-500 uppercase font-black tracking-wider bg-slate-950 text-[10px]">
                  <th className="py-2.5 px-4 font-mono-cyber">Rank</th>
                  <th className="py-2.5 px-4 font-mono-cyber">Username</th>
                  <th className="py-2.5 px-4 font-mono-cyber">Credits</th>
                  <th className="py-2.5 px-4 font-mono-cyber text-center">Correct predictions</th>
                  <th className="py-2.5 px-4 font-mono-cyber text-right">Accuracy Rate</th>
                </tr>
              </thead>
              <tbody>
                {fullList.map((competitor, idx) => {
                  const rank = idx + 1;
                  const isUser = competitor.isUser;
                  const accuracy = competitor.total > 0 ? Math.round((competitor.correct / competitor.total) * 100) : 0;

                  return (
                    <tr
                      key={competitor.username}
                      className={`border-b border-slate-900/60 transition-colors ${
                        isUser 
                          ? 'bg-cyber-blue/10 border-y border-cyber-blue/35 text-white font-bold' 
                          : 'hover:bg-slate-900/20 text-slate-300'
                      }`}
                    >
                      <td className="py-3 px-4 flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-[2px] border flex items-center justify-center text-[10px] font-black shrink-0 ${
                          rank === 1
                            ? 'border-cyber-yellow text-cyber-yellow bg-cyber-yellow/10'
                            : rank === 2
                              ? 'border-slate-300 text-slate-200 bg-slate-100/10'
                              : rank === 3
                                ? 'border-amber-600 text-amber-500 bg-amber-700/10'
                                : isUser 
                                  ? 'border-cyber-blue text-cyber-blue bg-cyber-blue/10 animate-pulse'
                                  : 'border-slate-850 text-slate-500 bg-slate-950'
                        }`}>
                          {rank}
                        </span>
                        {rank === 1 && <Trophy className="w-3.5 h-3.5 text-cyber-yellow" />}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {competitor.username}
                      </td>
                      <td className="py-3 px-4 font-black text-cyber-yellow flex items-center gap-1 leading-none mt-1">
                        <Coins className="w-3.5 h-3.5" /> {competitor.credits} CR
                      </td>
                      <td className="py-3 px-4 text-center">
                        {competitor.correct} / {competitor.total}
                      </td>
                      <td className={`py-3 px-4 text-right font-black ${
                        accuracy >= 80 ? 'text-emerald-400 text-glow-blue' : accuracy >= 60 ? 'text-cyber-blue' : 'text-slate-400'
                      }`}>
                        {accuracy}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 2. Right Section: Credit refills and secure tasks */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* Credits Refill container */}
        <div className="bg-slate-950/60 border border-slate-900 rounded p-5 relative overflow-hidden flex flex-col gap-4">
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-yellow" />
          
          <div className="border-b border-slate-900 pb-3 flex items-center gap-2">
            <Coins className="w-4 h-4 text-cyber-yellow animate-pulse" />
            <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">REFILL ARENA CREDITS</h3>
          </div>

          <p className="text-[11px] text-slate-400 leading-normal font-sans">
            Place prediction votes on upcoming scheduled battles. If you run out of credits, run these virtual guardrail security audits to receive immediate refills of **+50 CR** each.
          </p>

          {/* Refill Task execution loading */}
          {activeRefillTask && (
            <div className="bg-slate-950 border border-slate-900 rounded p-3 space-y-2">
              <div className="flex justify-between items-center text-[9px] text-cyan-300">
                <span className="font-bold flex items-center gap-1"><Terminal className="w-3.5 h-3.5 animate-pulse" /> EXECUTING AUDIT TASK...</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <div className="text-[10px] text-cyan-400/90 font-mono space-y-0.5 leading-snug">
                {taskLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}

          {/* Task list items */}
          <div className="space-y-3.5">
            {refillTasks.map(task => {
              const isCompleted = completedTasks.includes(task.id);
              const isRunning = activeRefillTask === task.id;

              return (
                <div
                  key={task.id}
                  className={`p-3 rounded border flex justify-between items-center gap-3 transition-all ${
                    isCompleted
                      ? 'border-emerald-500/25 bg-emerald-950/5 opacity-80'
                      : isRunning
                        ? 'border-cyber-blue bg-cyber-blue/5 animate-pulse'
                        : 'border-slate-900 bg-slate-900/35 hover:border-slate-800'
                  }`}
                >
                  <div className="space-y-0.5 max-w-[70%] text-left">
                    <span className={`text-[10px] font-bold block ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                      {task.title}
                    </span>
                    <span className="text-[8.5px] text-slate-500 block leading-tight uppercase">{task.desc}</span>
                  </div>

                  <button
                    onClick={() => handleRunTask(task.id, task.reward)}
                    disabled={isCompleted || !!activeRefillTask}
                    className={`px-3 py-1.5 rounded text-[9px] font-black uppercase tracking-wider cursor-pointer transition-all active:scale-95 flex items-center gap-1 ${
                      isCompleted
                        ? 'bg-slate-900 border border-slate-800 text-emerald-500/70 font-bold cursor-not-allowed'
                        : isRunning
                          ? 'bg-cyber-blue/10 border border-cyber-blue/35 text-cyber-blue font-bold cursor-not-allowed'
                          : 'bg-cyber-yellow/10 hover:bg-cyber-yellow border border-cyber-yellow/35 text-cyber-yellow hover:text-black font-bold'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Done
                      </>
                    ) : isRunning ? (
                      'Auditing...'
                    ) : (
                      `+${task.reward} CR`
                    )}
                  </button>
                </div>
              );
            })}

            {/* Quick reset refills if they complete all tasks */}
            {completedTasks.length === refillTasks.length && (
              <button
                onClick={() => { playSoundEffect('click'); setCompletedTasks([]); }}
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-colors"
              >
                Reset Task Checklist
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Ranks stats overview */}
        <div className="bg-slate-950/60 border border-slate-900 rounded p-5 relative overflow-hidden flex flex-col gap-3 font-sans">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-blue" />
          
          <span className="text-[10px] text-cyber-blue font-mono-cyber font-black tracking-widest block uppercase border-b border-slate-900 pb-1">
            YOUR PERFORMANCE MATRIX
          </span>

          <div className="grid grid-cols-2 gap-3 text-[10.5px] text-slate-300 font-mono-cyber mt-2">
            <div className="bg-slate-900/30 p-2 border border-slate-900 rounded flex flex-col justify-between h-[50px]">
              <span className="text-slate-500 text-[8.5px] uppercase block font-bold leading-none">Leaderboard Rank</span>
              <span className="text-white font-black text-sm">
                #{fullList.findIndex(c => c.isUser) + 1} / {fullList.length}
              </span>
            </div>
            <div className="bg-slate-900/30 p-2 border border-slate-900 rounded flex flex-col justify-between h-[50px]">
              <span className="text-slate-500 text-[8.5px] uppercase block font-bold leading-none">Accuracy Index</span>
              <span className="text-emerald-400 font-black text-sm">
                {totalPredictions > 0 ? Math.round((correctPredictions / totalPredictions) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
