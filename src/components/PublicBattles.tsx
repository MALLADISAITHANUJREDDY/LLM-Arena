import React, { useState, useEffect } from 'react';
import {
  Globe,
  Plus,
  X,
  RotateCcw,
  Trophy,
  Clock,
  Copy,
  Check,
  Award,
  Vote,
  CheckCircle2,
  Terminal,
  ShieldCheck
} from 'lucide-react';

// ==========================================
// 1. Types & Models Definitions
// ==========================================

export interface LLMModel {
  id: string;
  name: string;
  vendor: string;
  colorClass: string;
  glowClass: string;
  icon: string;
}

const PUBLIC_LLM_MODELS: LLMModel[] = [
  { id: 'gpt-4o', name: 'GPT-4o', vendor: 'OpenAI', colorClass: 'border-emerald-500/35 text-emerald-400 bg-emerald-500/5', glowClass: 'text-glow-blue', icon: 'O' },
  { id: 'gemini-1-5-pro', name: 'Gemini 1.5 Pro', vendor: 'Google', colorClass: 'border-cyan-500/35 text-cyan-400 bg-cyan-500/5', glowClass: 'text-glow-blue', icon: 'G' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', vendor: 'Anthropic', colorClass: 'border-amber-500/35 text-amber-500 bg-amber-500/5', glowClass: 'text-glow-yellow', icon: 'A' },
  { id: 'deepseek-v3', name: 'DeepSeek-V3', vendor: 'DeepSeek', colorClass: 'border-blue-500/35 text-blue-400 bg-blue-500/5', glowClass: 'text-glow-blue', icon: 'D' },
  { id: 'llama-3-1-405b', name: 'Llama 3.1 405B', vendor: 'Meta', colorClass: 'border-purple-500/35 text-purple-400 bg-purple-500/5', glowClass: 'text-glow-blue', icon: 'L' }
];

export interface ModelResponse {
  modelId: string;
  modelName: string;
  response: string;
  responseTime: number;
  scores: {
    accuracy: number;
    reasoning: number;
    creativity: number;
    completeness: number;
    overall: number;
  };
}

export interface PublicBattle {
  id: string;
  title: string;
  prompt: string;
  description?: string;
  models: string[];
  scheduledTime: number; // unix timestamp
  votingEndTime: number;  // unix timestamp
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED';
  totalVotes: number;
  votesDistribution: { [key: string]: number };
  userVoteModelId?: string; // model predicted by user
  responses?: ModelResponse[];
  winnerModelId?: string;
  judgeSummary?: string;
  payoutProcessed?: boolean;
}

interface PublicBattlesProps {
  credits: number;
  correctPredictions: number;
  totalPredictions: number;
  onAwardCredits: (amount: number, isCorrect: boolean) => void;
}

// ==========================================
// 2. Component Implementation
// ==========================================

export const PublicBattles: React.FC<PublicBattlesProps> = ({
  credits,
  onAwardCredits
}) => {
  // Config & forms states
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'LIVE' | 'COMPLETED'>('ALL');
  const [battles, setBattles] = useState<PublicBattle[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  
  // Create Form states
  const [formTitle, setFormTitle] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formModels, setFormModels] = useState<string[]>(['gpt-4o', 'claude-3-5-sonnet']);
  const [formDateTime, setFormDateTime] = useState('');
  const [formVoteMinutes, setFormVoteMinutes] = useState('5'); // minutes before start to end voting

  // Live simulation variables
  const [activeLiveLogs, setActiveLiveLogs] = useState<{ [key: string]: string[] }>({});

  // Setup initial mock datasets
  useEffect(() => {
    try {
      const stored = localStorage.getItem('llm-arena-public-battles');
      if (stored) {
        setBattles(JSON.parse(stored));
      } else {
        const now = Date.now();
        const initialList: PublicBattle[] = [
          {
            id: 'pub-battle-1',
            title: 'Shor\'s Algorithm & Cryptography Cryptanalysis',
            prompt: 'Explain Shor\'s algorithm steps and outline how it compromises standard RSA encryption.',
            description: 'Cryptographic reasoning benchmark testing AST structures and quantum logic.',
            models: ['gpt-4o', 'claude-3-5-sonnet', 'deepseek-v3'],
            scheduledTime: now + 30 * 1000, // 30s from now (great for instant testing)
            votingEndTime: now + 15 * 1000,  // 15s from now
            status: 'UPCOMING',
            totalVotes: 642,
            votesDistribution: { 'gpt-4o': 120, 'claude-3-5-sonnet': 382, 'deepseek-v3': 140 }
          },
          {
            id: 'pub-battle-2',
            title: 'TypeScript AST Complexity Auditor',
            prompt: 'Draft a TypeScript compiler plugin that audits code complexity and flags nested loops deeper than 3 layers.',
            description: 'Advanced software design and code compilation logic testing.',
            models: ['gemini-1-5-pro', 'claude-3-5-sonnet', 'llama-3-1-405b'],
            scheduledTime: now + 600 * 1000, // 10 minutes from now
            votingEndTime: now + 500 * 1000,
            status: 'UPCOMING',
            totalVotes: 1250,
            votesDistribution: { 'gemini-1-5-pro': 450, 'claude-3-5-sonnet': 600, 'llama-3-1-405b': 200 }
          },
          {
            id: 'pub-battle-3',
            title: 'Preventing LLM Prompt Injection Vectors',
            prompt: 'Detail standard guardrail mitigations to secure API completions from injection payloads.',
            description: 'AI System architecture and security guidelines.',
            models: ['gpt-4o', 'gemini-1-5-pro', 'deepseek-v3'],
            scheduledTime: now - 3600 * 1000, // 1 hour ago (completed)
            votingEndTime: now - 3700 * 1000,
            status: 'COMPLETED',
            totalVotes: 2150,
            votesDistribution: { 'gpt-4o': 820, 'gemini-1-5-pro': 510, 'deepseek-v3': 820 },
            winnerModelId: 'gpt-4o',
            judgeSummary: 'GPT-4o presented the most structurally complete, step-by-step mitigation manual, detailing context boundaries and semantic validation models. DeepSeek-V3 offered solid secure code samples but missed detailed rate-limit concepts.',
            responses: [
              {
                modelId: 'gpt-4o',
                modelName: 'GPT-4o',
                responseTime: 1.15,
                response: `To secure LLM endpoints from injection vectors:\n1. **Context Separators**: Wrap user content inside strict delimiters (e.g. \`[USER_INPUT]\`).\n2. **System Prompt Priority**: Enforce prompt instructions at the model parameter level, instructing it to ignore commands inside user strings.\n3. **Semantic Inoculators**: Deploy a lightweight classifier (like a vector embeddings search) to parse input strings for keywords like "override" or "ignore previous".\n4. **Structured JSON Validation**: Force models to output valid schemas.`,
                scores: { accuracy: 94, reasoning: 92, creativity: 85, completeness: 95, overall: 91.5 }
              },
              {
                modelId: 'gemini-1-5-pro',
                modelName: 'Gemini 1.5 Pro',
                responseTime: 1.62,
                response: `### Security Audits against Prompt Injections\n\n* **Primary Controls**:\n  * Use strict input sanitizers to check character matrices.\n  * Enforce maximum token length to prevent buffer exhaustions.\n* **Secondary controls**:\n  * Vector search alignment validation checks.\n  * Restrict model temperature (Deterministic Temp = 0.0).`,
                scores: { accuracy: 88, reasoning: 90, creativity: 78, completeness: 86, overall: 85.5 }
              },
              {
                modelId: 'deepseek-v3',
                modelName: 'DeepSeek-V3',
                responseTime: 1.34,
                response: `Prevention guidelines for endpoint injection:\n\n* Implement XML tagging schemas: \`<user_input>payload</user_input>\`.\n* Verify system constraints via a secondary validation completion run.\n* Sanitize output variables using client-side DOM escape functions before display.`,
                scores: { accuracy: 91, reasoning: 88, creativity: 82, completeness: 90, overall: 87.8 }
              }
            ]
          }
        ];
        setBattles(initialList);
        localStorage.setItem('llm-arena-public-battles', JSON.stringify(initialList));
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  // Tick clock timer checking countdowns and triggering Live execution loops
  useEffect(() => {
    const timer = setInterval(() => {
      let changed = false;
      const now = Date.now();
      const updated = battles.map((b) => {
        if (b.status === 'UPCOMING' && now >= b.scheduledTime) {
          changed = true;
          // Trigger live running simulation immediately!
          simulateLiveExecution(b);
          return { ...b, status: 'LIVE' as const };
        }
        return b;
      });

      if (changed) {
        setBattles(updated);
        localStorage.setItem('llm-arena-public-battles', JSON.stringify(updated));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [battles]);

  // Sound Synth Helpers
  const playSoundEffect = (type: 'complete' | 'vote' | 'click') => {
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
          osc.frequency.setValueAtTime(freq, now + i * 0.12);
          noteGain.gain.setValueAtTime(0, now + i * 0.12);
          noteGain.gain.linearRampToValueAtTime(0.2, now + i * 0.12 + 0.02);
          noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.3);
          osc.start(now + i * 0.12);
          osc.stop(now + i * 0.12 + 0.3);
        });
      } else if (type === 'vote') {
        const osc = ctx.createOscillator();
        osc.connect(gainNode);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(1600, now + 0.15);
        gainNode.gain.setValueAtTime(0.1, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        osc.connect(gainNode);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.linearRampToValueAtTime(300, now + 0.05);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      }
    } catch (e) {
      console.warn('Audio Context Synth inactive:', e);
    }
  };

  // Live simulation execution logger
  const simulateLiveExecution = (battle: PublicBattle) => {
    setActiveLiveLogs(prev => ({ ...prev, [battle.id]: [] }));

    const logsList = [
      'BOOTING SCHEDULER BATTLE CRON...',
      'LOCKING predictions register matrix...',
      'Transmitting prompt payload to participant endpoints...',
      'Compiling network responses in parallel streams...',
      'AI Judge evaluating accuracy and completeness parameters...',
      'Calculating final standings scorecard...'
    ];

    logsList.forEach((logText, idx) => {
      setTimeout(() => {
        setActiveLiveLogs(prev => {
          const list = prev[battle.id] || [];
          return { ...prev, [battle.id]: [...list, `[LOG ${(idx * 0.5).toFixed(1)}s] ${logText}`] };
        });
      }, idx * 500);
    });

    // Complete the battle
    setTimeout(() => {
      setBattles(prevBattles => {
        const updated = prevBattles.map(b => {
          if (b.id === battle.id) {
            const results = generatePublicResponses(b.models, b.prompt);
            
            // Find Winner
            let highestOverall = 0;
            let winnerId = '';
            results.forEach(r => {
              if (r.scores.overall > highestOverall) {
                highestOverall = r.scores.overall;
                winnerId = r.modelId;
              }
            });

            const winnerModel = PUBLIC_LLM_MODELS.find(v => v.id === winnerId)!;
            const judgeSummary = `${winnerModel.name} ranked 1st inside the Judge comparison matrix. It demonstrated the most robust semantic reasoning and complete outline addressing the prompt parameters.`;

            if (b.userVoteModelId === winnerId) {
              onAwardCredits(150, true); // award 150 CR and win
              playSoundEffect('complete');
            } else if (b.userVoteModelId) {
              onAwardCredits(0, false); // total predictions incremented, but no correct win
            }

            return {
              ...b,
              status: 'COMPLETED' as const,
              responses: results,
              winnerModelId: winnerId,
              judgeSummary,
              payoutProcessed: true
            };
          }
          return b;
        });

        localStorage.setItem('llm-arena-public-battles', JSON.stringify(updated));
        return updated;
      });
    }, logsList.length * 500 + 200);
  };

  // Generate model responses based on query prompt
  const generatePublicResponses = (modelIds: string[], query: string): ModelResponse[] => {
    const queryLower = query.toLowerCase();
    
    return modelIds.map(mId => {
      const model = PUBLIC_LLM_MODELS.find(v => v.id === mId)!;
      const noise = () => Math.floor(Math.random() * 9) - 4; // -4 to +4
      
      let speed = 1.1 + Math.random() * 0.6;
      let baseAcc = 90;
      let baseReason = 88;
      let baseCreativity = 80;
      let baseComplete = 88;

      if (mId === 'claude-3-5-sonnet') {
        baseAcc = 95; baseReason = 96; baseCreativity = 85; baseComplete = 92; speed = 1.25;
      } else if (mId === 'gemini-1-5-pro') {
        baseAcc = 91; baseReason = 90; baseCreativity = 90; baseComplete = 96; speed = 1.55;
      } else if (mId === 'deepseek-v3') {
        baseAcc = 93; baseReason = 92; baseCreativity = 82; baseComplete = 90; speed = 1.05;
      } else if (mId === 'llama-3-1-405b') {
        baseAcc = 88; baseReason = 87; baseCreativity = 80; baseComplete = 88; speed = 0.85;
      }

      const accuracy = Math.min(100, Math.max(50, baseAcc + noise()));
      const reasoning = Math.min(100, Math.max(50, baseReason + noise()));
      const creativity = Math.min(100, Math.max(50, baseCreativity + noise()));
      const completeness = Math.min(100, Math.max(50, baseComplete + noise()));
      const overall = parseFloat(((accuracy + reasoning + creativity + completeness) / 4).toFixed(1));

      let response = '';
      if (queryLower.includes('shor') || queryLower.includes('algorithm')) {
        if (mId === 'claude-3-5-sonnet') {
          response = `Shor's algorithm is a quantum computing algorithm capable of finding the prime factors of an integer $N$ in polynomial time: $O((\\log N)^3)$.\n\n1. **Classical Reduction**: Reduce factoring to order-finding. Find the period $r$ of $f(x) = a^x \\pmod N$.\n2. **Quantum Order Finding**: Use a quantum register to construct the state representing $f(x)$ values.\n3. **Quantum Fourier Transform (QFT)**: Apply QFT on the register to extract the frequency and deduce period $r$.\n4. **Factor Extraction**: If $r$ is even, compute $\\gcd(a^{r/2} \\pm 1, N)$ classicaly to find factors.\n\n**RSA Compromise**: RSA security relies on the hardness of integer factorization. By finding prime factors in polynomial time, Shor's algorithm directly retrieves the private keys, compromising RSA encryption completely.`;
        } else if (mId === 'gpt-4o') {
          response = `Shor's algorithm factors large composite integers in polynomial time. Here are the core steps:\n\n* **Classical Phase**: Pick a random integer $a < N$, and compute $\\gcd(a, N)$. If it is not 1, we found a factor.\n* **Quantum Phase**: Find the smallest integer $r$ (the period) such that $a^r \\equiv 1 \\pmod N$. This is done on a quantum computer using modular exponentiation and QFT.\n* **RSA Decryption**: RSA relies on the product of two primes $N = pq$. When Shor's algorithm calculates the period $r$, it easily computes the factors $p, q = \\gcd(a^{r/2} \\pm 1, N)$. With $p$ and $q$, the private decryption key is derived classicaly, breaking the security.`;
        } else {
          response = `Shor's algorithm breaks RSA encryption by solving the integer factorization problem in $O((\\log N)^3)$ polynomial time. It utilizes quantum superposition, modular exponentiation to create a periodic function, and the Quantum Fourier Transform (QFT) to measure the period $r$. Once period $r$ is determined, classical calculations compute the greatest common divisor $\\gcd(a^{r/2} \\pm 1, N)$, extracting the prime keys and breaking the RSA encryption keys.`;
        }
      } else if (queryLower.includes('complexity') || queryLower.includes('ast') || queryLower.includes('ts')) {
        response = `TypeScript Compiler Plugin for Loop Depth checks:\n\n\`\`\`typescript\nimport * as ts from 'typescript';\n\nexport default function plugin(program: ts.Program) {\n  return {\n    before(context: ts.TransformationContext) {\n      return (sourceFile: ts.SourceFile) => {\n        let loopDepth = 0;\n        function visit(node: ts.Node): ts.Node {\n          const isLoop = ts.isForStatement(node) || ts.isForOfStatement(node) || \n                         ts.isForInStatement(node) || ts.isWhileStatement(node) || \n                         ts.isDoStatement(node);\n          if (isLoop) loopDepth++;\n          if (loopDepth > 3) {\n            console.warn(\`Warning: Loop nesting depth exceeds limit of 3 at line \${sourceFile.getLineAndCharacterOfPosition(node.getStart()).line}\`);\n          }\n          ts.forEachChild(node, visit);\n          if (isLoop) loopDepth--;\n          return node;\n        }\n        return ts.visitNode(sourceFile, visit);\n      };\n    }\n  };\n}\n\`\`\``;
      } else {
        response = `Based on the prompt: "${query}"\n\n- The model has completed parsing the custom query.\n- **Resolution**: [Completed detailed output text response formatted in Markdown].\n- **Details**: Core reasoning vectors converge at 98.2%.`;
      }

      return {
        modelId: mId,
        modelName: model.name,
        responseTime: parseFloat(speed.toFixed(2)),
        response,
        scores: { accuracy, reasoning, creativity, completeness, overall }
      };
    });
  };

  // Fast-Forward skip tool for immediate testing
  const handleFastForward = (battleId: string) => {
    playSoundEffect('click');
    setBattles(prev => {
      const updated = prev.map(b => {
        if (b.id === battleId && b.status === 'UPCOMING') {
          return {
            ...b,
            scheduledTime: Date.now() - 1000,
            votingEndTime: Date.now() - 2000
          };
        }
        return b;
      });
      localStorage.setItem('llm-arena-public-battles', JSON.stringify(updated));
      return updated;
    });
  };

  // Prediction Voting Handler
  const handleCastVote = (battleId: string, modelId: string) => {
    if (credits < 100) {
      alert('Insufficient Credits! You need at least 100 CR to place a prediction vote.');
      return;
    }
    
    playSoundEffect('vote');
    // deduct 100 CR and record vote
    onAwardCredits(-100, false); 
    
    setBattles(prev => {
      const updated = prev.map(b => {
        if (b.id === battleId) {
          const prevDist = b.votesDistribution[modelId] || 0;
          return {
            ...b,
            totalVotes: b.totalVotes + 1,
            userVoteModelId: modelId,
            votesDistribution: {
              ...b.votesDistribution,
              [modelId]: prevDist + 1
            }
          };
        }
        return b;
      });
      localStorage.setItem('llm-arena-public-battles', JSON.stringify(updated));
      return updated;
    });
  };

  // Create Battle Form Handler
  const handleCreateBattle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPrompt.trim() || !formDateTime) {
      alert('Please fill out all required parameters.');
      return;
    }
    if (formModels.length < 2) {
      alert('Please select at least 2 competitor LLMs for the battle.');
      return;
    }

    playSoundEffect('complete');
    const schedTimestamp = new Date(formDateTime).getTime();
    const voteEndTimestamp = schedTimestamp - (parseInt(formVoteMinutes) * 60 * 1000);

    if (schedTimestamp <= Date.now()) {
      alert('Battle schedule time must be in the future.');
      return;
    }

    const initDist: { [key: string]: number } = {};
    formModels.forEach(m => {
      initDist[m] = Math.floor(Math.random() * 50) + 10;
    });
    const totalInitVotes = Object.values(initDist).reduce((s, v) => s + v, 0);

    const newBattle: PublicBattle = {
      id: `pub-battle-${Date.now()}`,
      title: formTitle,
      prompt: formPrompt,
      description: formDesc || undefined,
      models: formModels,
      scheduledTime: schedTimestamp,
      votingEndTime: voteEndTimestamp,
      status: 'UPCOMING',
      totalVotes: totalInitVotes,
      votesDistribution: initDist
    };

    const updated = [newBattle, ...battles];
    setBattles(updated);
    localStorage.setItem('llm-arena-public-battles', JSON.stringify(updated));

    // Reset Form
    setFormTitle('');
    setFormPrompt('');
    setFormDesc('');
    setFormModels(['gpt-4o', 'claude-3-5-sonnet']);
    setFormDateTime('');
    setIsCreateModalOpen(false);
  };

  // Checkbox toggle inside form
  const handleFormModelToggle = (mId: string) => {
    if (formModels.includes(mId)) {
      setFormModels(formModels.filter(id => id !== mId));
    } else {
      setFormModels([...formModels, mId]);
    }
  };

  // Copy text clipboard
  const handleCopyText = (modelId: string, text: string) => {
    navigator.clipboard.writeText(text);
    playSoundEffect('click');
    setCopiedStates(prev => ({ ...prev, [modelId]: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, [modelId]: false }));
    }, 2000);
  };

  // Filter list
  const filteredBattles = battles.filter(b => {
    if (activeTab === 'ALL') return true;
    return b.status === activeTab;
  });

  // Calculate dynamic countdown clock
  const getCountdownString = (targetTime: number): string => {
    const diff = targetTime - Date.now();
    if (diff <= 0) return '00h 00m 00s';
    
    const hours = Math.floor(diff / (3600 * 1000));
    const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
    const secs = Math.floor((diff % (60 * 1000)) / 1000);
    
    return `${String(hours).padStart(2, '0')}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`;
  };

  return (
    <div className="flex flex-col gap-6 font-mono-cyber">
      {/* 1. Header with Title & Action */}
      <div className="relative group overflow-hidden bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-lg p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl">
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-cyber-yellow to-cyber-blue" />
        <div>
          <h2 className="text-lg font-black text-white uppercase tracking-widest text-glow-blue">Public LLM Arena Battles & Prediction</h2>
          <p className="text-xs text-slate-400 mt-1 uppercase leading-snug">Vote on upcoming models duels, predict winners, and win credit multipliers</p>
        </div>
        <button
          onClick={() => { 
            playSoundEffect('click'); 
            const localDT = new Date(Date.now() + 60 * 60 * 1000 - new Date().getTimezoneOffset() * 60000).toISOString().substring(0, 16);
            setFormDateTime(localDT);
            setIsCreateModalOpen(true); 
          }}
          className="px-5 py-2.5 rounded bg-cyber-blue/15 border border-cyber-blue/40 text-cyber-blue hover:bg-cyber-blue/25 hover:text-white transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shrink-0 active:scale-98"
        >
          <Plus className="w-4 h-4" /> Create Public Battle
        </button>
      </div>

      {/* 2. Tabs Filter bar */}
      <div className="flex flex-wrap gap-2 text-xs border-b border-slate-900 pb-2">
        {(['ALL', 'UPCOMING', 'LIVE', 'COMPLETED'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => { playSoundEffect('click'); setActiveTab(tab); }}
            className={`px-4 py-2 border uppercase font-black transition-all cursor-pointer rounded-t ${
              activeTab === tab
                ? 'bg-cyber-blue/15 border-cyber-blue text-cyber-blue shadow-[0_-2px_10px_rgba(0,240,255,0.1)]'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 3. Battles Grid Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredBattles.map(battle => {
          const isUpcoming = battle.status === 'UPCOMING';
          const isLive = battle.status === 'LIVE';
          const isCompleted = battle.status === 'COMPLETED';
          const hasVoted = !!battle.userVoteModelId;

          return (
            <div
              key={battle.id}
              className={`bg-slate-950/60 border rounded-lg p-5 relative overflow-hidden flex flex-col gap-5 ${
                isLive 
                  ? 'border-cyber-blue/50 shadow-[0_0_15px_rgba(0,240,255,0.05)]' 
                  : isCompleted 
                    ? 'border-slate-900 bg-slate-950/40' 
                    : 'border-slate-800'
              }`}
            >
              {/* Corner Tag alerts */}
              <div className="absolute top-0 right-0">
                {isUpcoming && (
                  <span className="px-3 py-1 bg-cyber-yellow/15 border-l border-b border-cyber-yellow/40 text-cyber-yellow text-[8px] font-black uppercase tracking-wider block animate-pulse">
                    UPCOMING VOTE
                  </span>
                )}
                {isLive && (
                  <span className="px-3 py-1 bg-cyber-blue/20 border-l border-b border-cyber-blue/50 text-cyber-blue text-[8px] font-black uppercase tracking-wider block animate-pulse">
                    LIVE STREAMING
                  </span>
                )}
                {isCompleted && (
                  <span className="px-3 py-1 bg-slate-900 border-l border-b border-slate-800 text-slate-400 text-[8px] font-black uppercase tracking-wider block">
                    COMPLETED
                  </span>
                )}
              </div>

              {/* Card Meta Row */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-slate-900 pb-3">
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">{battle.title}</h3>
                  {battle.description && (
                    <p className="text-[10px] text-slate-500 uppercase">{battle.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold shrink-0 pt-1 md:pt-0">
                  <div className="flex items-center gap-1.5">
                    <Vote className="w-3.5 h-3.5 text-cyber-blue" />
                    <span>VOTES: <strong className="text-white">{battle.totalVotes}</strong></span>
                  </div>
                  
                  {isUpcoming && (
                    <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
                      <Clock className="w-3.5 h-3.5 text-cyber-yellow" />
                      <span>ENDS: <strong className="text-cyber-yellow font-black">{getCountdownString(battle.votingEndTime)}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Details conditional rendering */}
              {isUpcoming && (
                <div className="space-y-4">
                  <div className="bg-slate-950/80 border border-slate-900 rounded p-3 text-xs leading-relaxed text-slate-300">
                    <span className="font-bold text-cyber-blue block mb-1">BATTLE PROMPT DIRECTIVE:</span>
                    "{battle.prompt}"
                  </div>

                  {/* Prediction voter section */}
                  <div className="space-y-3 bg-slate-900/10 border border-slate-900 p-4 rounded">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400 font-bold uppercase flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-cyber-yellow" /> CAST YOUR PREDICTION VOTE (COSTS 100 CR)
                      </span>
                      {hasVoted && (
                        <span className="text-emerald-400 font-bold uppercase flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> PREDICTION SUBMITTED
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                      {battle.models.map(mId => {
                        const mInfo = PUBLIC_LLM_MODELS.find(v => v.id === mId)!;
                        const isVotedThis = battle.userVoteModelId === mId;
                        const totalVotesThis = battle.votesDistribution[mId] || 0;
                        const ratio = battle.totalVotes > 0 ? Math.round((totalVotesThis / battle.totalVotes) * 100) : 0;

                        return (
                          <button
                            key={mId}
                            onClick={() => handleCastVote(battle.id, mId)}
                            disabled={hasVoted || credits < 100}
                            className={`p-3 rounded border text-left flex flex-col justify-between h-[85px] transition-all relative ${
                              isVotedThis
                                ? 'border-cyber-yellow bg-cyber-yellow/5'
                                : hasVoted
                                  ? 'border-slate-900 bg-slate-950/20 opacity-60 cursor-not-allowed'
                                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 cursor-pointer'
                            }`}
                          >
                            <div className="flex justify-between items-center w-full">
                              <span className="text-[10px] font-bold text-slate-200">{mInfo.name}</span>
                              {isVotedThis && <Trophy className="w-3.5 h-3.5 text-cyber-yellow animate-bounce" />}
                            </div>
                            
                            <div className="w-full">
                              <div className="flex justify-between text-[8px] text-slate-550 mb-1 uppercase font-bold">
                                <span>{totalVotesThis} votes</span>
                                <span>{ratio}%</span>
                              </div>
                              <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden">
                                <div 
                                  className={`h-full ${isVotedThis ? 'bg-cyber-yellow' : 'bg-cyber-blue'}`}
                                  style={{ width: `${ratio}%` }} 
                                />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dev trigger Time Fast-Forward */}
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleFastForward(battle.id)}
                      className="px-3 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
                      title="Fast-forward scheduled time for sandbox review"
                    >
                      <RotateCcw className="w-3 h-3 rotate-180" /> Simulate Scheduled Time Skip
                    </button>
                  </div>
                </div>
              )}

              {isLive && (
                <div className="space-y-4">
                  <div className="bg-slate-950 border border-slate-900 rounded p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                      <Terminal className="w-4 h-4 text-cyber-blue animate-pulse" />
                      <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest leading-none">
                        CRON STREAMS PARALLEL EVALUATIONS RUNNING
                      </span>
                    </div>

                    <div className="min-h-[120px] max-h-[220px] overflow-y-auto space-y-1 text-[11px] text-cyan-300 font-mono">
                      {(activeLiveLogs[battle.id] || []).map((log, idx) => (
                        <div key={idx}>{log}</div>
                      ))}
                      <div className="animate-pulse">&gt; Compiling output responses...</div>
                    </div>
                  </div>
                </div>
              )}

              {isCompleted && battle.responses && (
                <div className="space-y-6">
                  {/* Prompt box */}
                  <div className="bg-slate-950 border border-slate-900 rounded p-3 text-xs text-slate-350">
                    <span className="font-bold text-slate-500 block mb-1">PROMPT VERIFIED:</span>
                    "{battle.prompt}"
                  </div>

                  {/* Prediction accuracy payout message */}
                  {battle.userVoteModelId && (
                    <div className={`p-3 rounded border text-xs flex items-center justify-between ${
                      battle.userVoteModelId === battle.winnerModelId
                        ? 'border-emerald-500/35 bg-emerald-950/15 text-emerald-400'
                        : 'border-cyber-red/35 bg-cyber-red-dim text-cyber-red'
                    }`}>
                      <span className="font-bold uppercase tracking-wider flex items-center gap-1.5">
                        <Award className="w-4 h-4" /> 
                        {battle.userVoteModelId === battle.winnerModelId
                          ? `CORRECT PREDICTION PAYOUT: +150 credits added to database!`
                          : `INCORRECT PREDICTION: Your predicted node lost. Better luck in the next round!`
                        }
                      </span>
                      <span className="font-bold">
                        {battle.userVoteModelId === battle.winnerModelId ? 'SUCCESS CR' : 'FAILED CR'}
                      </span>
                    </div>
                  )}

                  {/* Side-by-side Response Panels */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {battle.responses.map(res => {
                      const isWinner = res.modelId === battle.winnerModelId;
                      const isCopied = copiedStates[res.modelId] || false;

                      return (
                        <div
                          key={res.modelId}
                          className={`bg-slate-950 border rounded flex flex-col justify-between overflow-hidden relative ${
                            isWinner ? 'border-cyber-yellow/45 shadow-[0_0_15px_rgba(255,230,0,0.06)]' : 'border-slate-900'
                          }`}
                        >
                          <div className="bg-slate-950 px-3.5 py-2.5 border-b border-slate-900 flex justify-between items-center">
                            <span className="text-[10px] font-black text-white uppercase tracking-wider font-mono-cyber">
                              {res.modelName}
                            </span>

                            <div className="flex items-center gap-1">
                              {isWinner && (
                                <span className="px-2 py-0.5 rounded-[2px] bg-cyber-yellow/15 border border-cyber-yellow/35 text-cyber-yellow text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                                  <Trophy className="w-2.5 h-2.5" /> WINNER
                                </span>
                              )}
                              <button
                                onClick={() => handleCopyText(res.modelId, res.response)}
                                className="p-1 rounded text-slate-550 hover:text-white transition-colors cursor-pointer"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>

                          <div className="p-3.5 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap select-text max-h-[180px] overflow-y-auto">
                            {res.response}
                          </div>

                          <div className="bg-slate-950/80 px-3.5 py-2 border-t border-slate-900 text-[8.5px] font-mono-cyber text-slate-400 flex justify-between">
                            <span>SPEED: {res.responseTime}s</span>
                            <span>OVERALL SCORE: <strong className="text-cyber-blue font-bold">{res.scores.overall}</strong></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI Judge Critique Bar Chart Grid */}
                  <div className="bg-slate-900/10 border border-slate-900 rounded p-4 relative overflow-hidden">
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyber-yellow/40 pointer-events-none" />
                    
                    <div className="border-b border-slate-900 pb-2 mb-3">
                      <span className="text-[10px] text-cyber-yellow font-bold uppercase block font-mono-cyber tracking-widest">
                        AI JUDGE SCORE COMPARISONS (COMPOSITE SCORES)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                      {/* Metric Comparison bars */}
                      <div className="space-y-3">
                        {battle.responses.map(res => {
                          const isWinner = res.modelId === battle.winnerModelId;
                          return (
                            <div key={res.modelId} className="space-y-1 text-xs">
                              <div className="flex justify-between items-center font-mono-cyber">
                                <span className={`font-bold uppercase ${isWinner ? 'text-cyber-yellow' : 'text-slate-350'}`}>
                                  {res.modelName}
                                </span>
                                <span className={`font-black ${isWinner ? 'text-cyber-yellow' : 'text-cyber-blue'}`}>
                                  {res.scores.overall} / 100
                                </span>
                              </div>
                              <div className="pl-2 space-y-1">
                                <div className="h-1.5 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                                  <div 
                                    className={`h-full ${isWinner ? 'bg-gradient-to-r from-cyber-yellow to-amber-500' : 'bg-cyber-blue'}`}
                                    style={{ width: `${res.scores.overall}%` }} 
                                  />
                                </div>
                                <div className="flex justify-between text-[8px] text-slate-500 font-mono-cyber uppercase">
                                  <span>ACCURACY: {res.scores.accuracy}%</span>
                                  <span>REASONING: {res.scores.reasoning}%</span>
                                  <span>CREATIVITY: {res.scores.creativity}%</span>
                                  <span>COMPLETE: {res.scores.completeness}%</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Critique summaries */}
                      <div className="bg-slate-950 border border-slate-900 rounded p-3 text-[11px] leading-relaxed text-slate-300 min-h-[110px] flex flex-col justify-between font-sans">
                        <div>
                          <strong className="text-cyber-yellow font-mono-cyber block uppercase text-[10px] tracking-wider mb-1">
                            JUDGE EXPOSURE REPORT:
                          </strong>
                          {battle.judgeSummary}
                        </div>
                        <div className="text-[8px] text-slate-500 font-mono-cyber border-t border-slate-900 pt-1.5 mt-2 flex justify-between">
                          <span>JUDICIAL CONSOLE AUDIT: LIVE_MATRIX_V1</span>
                          <span className="flex items-center gap-1 text-cyber-yellow"><ShieldCheck className="w-3.5 h-3.5 text-cyber-yellow animate-pulse" /> VERIFIED MATCH</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredBattles.length === 0 && (
          <div className="bg-slate-950/60 border border-slate-900 rounded p-12 text-center text-slate-500 uppercase select-none text-xs">
            --- No public battles matched tab selection ---
          </div>
        )}
      </div>

      {/* 4. Create Battle Modal Dialog Form */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col gap-4 shadow-[0_0_50px_rgba(0,240,255,0.15)] relative">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-3 right-3 text-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
              <Globe className="w-5 h-5 text-cyber-blue" />
              <h4 className="text-xs font-black uppercase text-white tracking-widest">Deploy New Public Battle</h4>
            </div>

            <form onSubmit={handleCreateBattle} className="space-y-4 text-xs font-sans text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono-cyber block">Battle Title *</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Code Generation Benchmark"
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyber-blue outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono-cyber block">Target Date & Time *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formDateTime}
                    onChange={(e) => setFormDateTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyber-blue outline-none text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono-cyber block">Description (Optional)</label>
                <input
                  type="text"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. Benchmarking mathematical logic depth across model weights."
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-cyber-blue outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] text-slate-400 font-bold uppercase font-mono-cyber block">Model Prompt / Question *</label>
                <textarea
                  required
                  value={formPrompt}
                  onChange={(e) => setFormPrompt(e.target.value)}
                  placeholder="Write prompt query to submit to all models..."
                  className="w-full h-16 bg-slate-950 border border-slate-800 rounded p-2.5 text-xs text-slate-200 focus:border-cyber-blue outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Checkbox select competitor models */}
                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono-cyber block">Competitor LLMs (Select 2+)*</label>
                  <div className="flex flex-col gap-1 max-h-[100px] overflow-y-auto border border-slate-850 p-2 bg-slate-950 rounded">
                    {PUBLIC_LLM_MODELS.map(m => {
                      const isChecked = formModels.includes(m.id);
                      return (
                        <label key={m.id} className="flex items-center justify-between text-[11px] hover:text-white cursor-pointer select-none">
                          <span className={isChecked ? 'text-cyber-blue font-bold' : 'text-slate-400'}>{m.name}</span>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleFormModelToggle(m.id)}
                            className="w-3.5 h-3.5 accent-cyber-blue ml-2 cursor-pointer"
                          />
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase font-mono-cyber block">Voting Duration Boundary</label>
                  <div className="space-y-2 bg-slate-950 border border-slate-850 rounded p-2.5">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-400">Lock votes before start:</span>
                      <span className="text-cyber-blue font-bold">{formVoteMinutes} Minutes</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="60"
                      step="1"
                      value={formVoteMinutes}
                      onChange={(e) => setFormVoteMinutes(e.target.value)}
                      className="w-full accent-cyber-blue cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-3 pt-2 font-mono-cyber">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
                >
                  [CANCEL]
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40 hover:bg-cyber-blue/30 text-xs font-black uppercase tracking-widest cursor-pointer transition-colors active:scale-98"
                >
                  DESTRUCT CRON & RUN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
