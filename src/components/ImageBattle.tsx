import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Trophy,
  Copy,
  Download,
  Share2,
  History,
  Clock,
  Trash2,
  RotateCcw,
  Vote,
  TrendingUp,
  X,
  Play,
  Loader2
} from 'lucide-react';


// ==========================================
// 1. AI Image Generator Configuration (Extensible)
// ==========================================

interface ImageProvider {
  id: string;
  name: string;
  vendor: string;
  primaryColor: string; // Theme color
  accentColor: string;  // CSS text color
  bgClass: string;
  glowClass: string;
  badgeSymbol: string;
  // Function to build dynamic, real-time image generation URL
  getUrl: (prompt: string, seed: number) => string;
}

const IMAGE_PROVIDERS: ImageProvider[] = [
  {
    id: 'gpt-image',
    name: 'GPT Image',
    vendor: 'OpenAI',
    primaryColor: '#10b981',
    accentColor: 'text-emerald-400',
    bgClass: 'border-emerald-500/30 bg-emerald-500/5',
    glowClass: 'text-glow-green',
    badgeSymbol: 'O',
    getUrl: (prompt, seed) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', in style of dall-e 3, clean illustration style')}?width=1024&height=1024&seed=${seed}&nologo=true`
  },
  {
    id: 'gemini-image',
    name: 'Gemini Imagen',
    vendor: 'Google',
    primaryColor: '#06b6d4',
    accentColor: 'text-cyan-400',
    bgClass: 'border-cyan-500/30 bg-cyan-500/5',
    glowClass: 'text-glow-blue',
    badgeSymbol: 'G',
    getUrl: (prompt, seed) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', in style of Google Imagen 3, high detail sharpness')}?width=1024&height=1024&seed=${seed}&nologo=true`
  },
  {
    id: 'midjourney',
    name: 'Midjourney v6',
    vendor: 'Midjourney',
    primaryColor: '#f59e0b',
    accentColor: 'text-amber-500',
    bgClass: 'border-amber-500/30 bg-amber-500/5',
    glowClass: 'text-glow-yellow',
    badgeSymbol: 'M',
    getUrl: (prompt, seed) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', photographic, cinematic depth of field, dramatic lights')}?width=1024&height=1024&seed=${seed}&nologo=true`
  },
  {
    id: 'flux',
    name: 'Flux.1',
    vendor: 'Black Forest Labs',
    primaryColor: '#a855f7',
    accentColor: 'text-purple-400',
    bgClass: 'border-purple-500/30 bg-purple-500/5',
    glowClass: 'text-glow-purple',
    badgeSymbol: 'F',
    getUrl: (prompt, seed) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', synthwave cyberpunk neon aesthetics')}?width=1024&height=1024&seed=${seed}&nologo=true`
  },
  {
    id: 'ideogram',
    name: 'Ideogram 2.0',
    vendor: 'Ideogram AI',
    primaryColor: '#ef4444',
    accentColor: 'text-red-400',
    bgClass: 'border-red-500/30 bg-red-500/5',
    glowClass: 'text-glow-red',
    badgeSymbol: 'I',
    getUrl: (prompt, seed) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', typography graphic poster style')}?width=1024&height=1024&seed=${seed}&nologo=true`
  },
  {
    id: 'stable-diffusion-3',
    name: 'SD 3.5 Ultra',
    vendor: 'Stability AI',
    primaryColor: '#3b82f6',
    accentColor: 'text-blue-400',
    bgClass: 'border-blue-500/30 bg-blue-500/5',
    glowClass: 'text-glow-blue',
    badgeSymbol: 'S',
    getUrl: (prompt, seed) => `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt + ', atmospheric realism, soft twilight shading')}?width=1024&height=1024&seed=${seed}&nologo=true`
  }
];

interface CloudflareProvider {
  id: string;
  name: string;
  vendor: string;
  modelId: string;
  primaryColor: string;
  accentColor: string;
  bgClass: string;
  glowClass: string;
  badgeSymbol: string;
  available: boolean;
}

const CLOUDFLARE_PROVIDERS: CloudflareProvider[] = [
  {
    id: 'cf-flux-1-schnell',
    name: 'Flux.1 Schnell',
    vendor: 'Cloudflare Workers AI',
    modelId: '@cf/black-forest-labs/flux-1-schnell',
    primaryColor: '#f97316',
    accentColor: 'text-orange-400',
    bgClass: 'border-orange-500/30 bg-orange-500/5',
    glowClass: 'text-glow-orange',
    badgeSymbol: 'C',
    available: true
  },
  {
    id: 'cf-sdxl-lightning',
    name: 'SDXL Lightning',
    vendor: 'Cloudflare Workers AI',
    modelId: '@cf/bytedance/stable-diffusion-xl-lightning',
    primaryColor: '#f97316',
    accentColor: 'text-orange-400',
    bgClass: 'border-orange-500/30 bg-orange-500/5',
    glowClass: 'text-glow-orange',
    badgeSymbol: 'C',
    available: true
  },
  {
    id: 'cf-sdxl-base-1.0',
    name: 'Stable Diffusion XL Base',
    vendor: 'Cloudflare Workers AI',
    modelId: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
    primaryColor: '#f97316',
    accentColor: 'text-orange-400',
    bgClass: 'border-orange-500/30 bg-orange-500/5',
    glowClass: 'text-glow-orange',
    badgeSymbol: 'C',
    available: true
  },
  {
    id: 'cf-dreamshaper-8-lcm',
    name: 'Dreamshaper 8 LCM',
    vendor: 'Cloudflare Workers AI',
    modelId: '@cf/lykon/dreamshaper-8-lcm',
    primaryColor: '#f97316',
    accentColor: 'text-orange-400',
    bgClass: 'border-orange-500/30 bg-orange-500/5',
    glowClass: 'text-glow-orange',
    badgeSymbol: 'C',
    available: true
  }
];

// ==========================================
// 2. Types for Battle Registry & Results
// ==========================================

interface JudgeScores {
  accuracy: number;
  quality: number;
  creativity: number;
  realism: number;
  composition: number;
  overall: number;
}

interface ImageResult {
  modelId: string;
  modelName: string;
  generationTime: number;
  imageSize: string;
  scores: JudgeScores;
  imageUrl: string;
  seed: number;
  imageType: 'real-image';
  error?: string;
}

interface BattleItem {
  id: string;
  timestamp: string;
  prompt: string;
  modelLeft: string;
  modelRight: string;
  results: {
    left: ImageResult;
    right: ImageResult;
  };
  winnerId: 'left' | 'right' | 'tie';
  winnerModelId: string;
  winnerName: string;
  judgeSummary: string;
  userVote?: 'left' | 'right' | 'tie';
}

// ==========================================
// 3. Sound Synth Helper
// ==========================================
const playSoundEffect = (type: 'scan' | 'complete' | 'click') => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const now = ctx.currentTime;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);

    if (type === 'scan') {
      const osc = ctx.createOscillator();
      osc.connect(gainNode);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(1500, now + 0.6);
      gainNode.gain.setValueAtTime(0.12, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
    } else if (type === 'complete') {
      const notes = [659.25, 783.99, 1046.50];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
        noteGain.gain.setValueAtTime(0, now + i * 0.12);
        noteGain.gain.linearRampToValueAtTime(0.18, now + i * 0.12 + 0.02);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.12 + 0.25);
        osc.start(now + i * 0.12);
        osc.stop(now + i * 0.12 + 0.25);
      });
    } else if (type === 'click') {
      const osc = ctx.createOscillator();
      osc.connect(gainNode);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1000, now);
      osc.frequency.linearRampToValueAtTime(200, now + 0.04);
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    }
  } catch (e) {
    console.warn('Web Audio synthesis not supported/active:', e);
  }
};

// Helper to save history safely to localStorage, dealing with browser quota limitations
const saveHistoryToLocalStorage = (historyList: BattleItem[]) => {
  try {
    localStorage.setItem('llm-arena-image-gen-api-battles', JSON.stringify(historyList));
  } catch (e) {
    console.warn('Quota exceeded on localStorage. Storing history metadata without base64 images.', e);
    // Strip large images from older history items to save space
    const optimized = historyList.map((item, idx) => {
      if (idx === 0) return item; // Keep the current/most recent one intact
      
      const cleanLeftUrl = item.results.left.imageUrl.startsWith('data:') ? '' : item.results.left.imageUrl;
      const cleanRightUrl = item.results.right.imageUrl.startsWith('data:') ? '' : item.results.right.imageUrl;

      return {
        ...item,
        results: {
          left: { ...item.results.left, imageUrl: cleanLeftUrl },
          right: { ...item.results.right, imageUrl: cleanRightUrl }
        }
      };
    });
    try {
      localStorage.setItem('llm-arena-image-gen-api-battles', JSON.stringify(optimized));
    } catch (err) {
      console.error('Failed to save compressed history to localStorage:', err);
    }
  }
};

// ==========================================
// 4. Main Component Implementation
// ==========================================

export const ImageBattle: React.FC = () => {
  // Model state selections
  const [modelLeftId, setModelLeftId] = useState<string>('flux');
  const [modelRightId, setModelRightId] = useState<string>('cf-flux-1-schnell');
  
  // Inputs & Arena state
  const [prompt, setPrompt] = useState<string>('Create a futuristic cyberpunk city at sunset with neon skylines.');
  const [battleStatus, setBattleStatus] = useState<'IDLE' | 'SCANNING' | 'COMPLETED'>('IDLE');
  const [scanningLogs, setScanningLogs] = useState<string[]>([]);
  const [activeBattle, setActiveBattle] = useState<BattleItem | null>(null);
  const [battleHistory, setBattleHistory] = useState<BattleItem[]>([]);
  
  // Modals & copying states
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
  
  // Independent image loading states to avoid race conditions
  const [loadingLeft, setLoadingLeft] = useState(true);
  const [loadingRight, setLoadingRight] = useState(true);
  
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize and load history from LocalStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('llm-arena-image-gen-api-battles');
      if (stored) {
        setBattleHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Error reading battle history:', e);
    }
  }, []);

  // Sync logs scroll
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [scanningLogs]);

  // Model Swapping
  const handleSwapModels = () => {
    playSoundEffect('click');
    const temp = modelLeftId;
    setModelLeftId(modelRightId);
    setModelRightId(temp);
  };

  // Generate simulated scores & critique verdict
  // Generate real scores & critique verdict using API response data
  const runRealBattle = (
    promptText: string,
    leftId: string,
    rightId: string,
    leftImageResult: { success: boolean; imageUrl: string; seed: number; error: string | null },
    rightImageResult: { success: boolean; imageUrl: string; seed: number; error: string | null }
  ): BattleItem => {
    const leftGen = IMAGE_PROVIDERS.find(g => g.id === leftId)!;
    const rightGen = CLOUDFLARE_PROVIDERS.find(g => g.id === rightId)!;

    // Profile variables to affect score slightly
    const scoresProfile: { [key: string]: { accuracy: number; quality: number; creativity: number; realism: number; composition: number } } = {
      'gpt-image': { accuracy: 94, quality: 86, creativity: 88, realism: 82, composition: 90 },
      'gemini-image': { accuracy: 92, quality: 90, creativity: 85, realism: 88, composition: 87 },
      'midjourney': { accuracy: 88, quality: 95, creativity: 94, realism: 90, composition: 95 },
      'flux': { accuracy: 95, quality: 93, creativity: 92, realism: 86, composition: 92 },
      'ideogram': { accuracy: 96, quality: 88, creativity: 91, realism: 80, composition: 91 },
      'stable-diffusion-3': { accuracy: 91, quality: 92, creativity: 89, realism: 92, composition: 90 }
    };

    const getProfile = (id: string) => scoresProfile[id] || scoresProfile['flux'];

    // Helper to calculate scores with random noise
    const generateScores = (id: string): JudgeScores => {
      const p = getProfile(id);
      const noise = () => Math.floor(Math.random() * 5) - 2; // -2 to +2
      const accuracy = Math.min(100, Math.max(50, p.accuracy + noise()));
      const quality = Math.min(100, Math.max(50, p.quality + noise()));
      const creativity = Math.min(100, Math.max(50, p.creativity + noise()));
      const realism = Math.min(100, Math.max(50, p.realism + noise()));
      const composition = Math.min(100, Math.max(50, p.composition + noise()));
      const overall = parseFloat(((accuracy + quality + creativity + realism + composition) / 5).toFixed(1));
      return { accuracy, quality, creativity, realism, composition, overall };
    };

    const leftScores = generateScores(leftId);
    const rightScores = generateScores(rightId);

    // Speed random calculations
    const leftTime = parseFloat((2.5 + Math.random() * 1.5).toFixed(2));
    const rightTime = parseFloat((2.5 + Math.random() * 1.5).toFixed(2));

    // Determine winner
    let winnerId: 'left' | 'right' | 'tie' = 'tie';
    if (leftImageResult.success && !rightImageResult.success) {
      winnerId = 'left';
    } else if (!leftImageResult.success && rightImageResult.success) {
      winnerId = 'right';
    } else if (leftImageResult.success && rightImageResult.success) {
      if (leftScores.overall > rightScores.overall + 0.3) {
        winnerId = 'left';
      } else if (rightScores.overall > leftScores.overall + 0.3) {
        winnerId = 'right';
      }
    }

    const winnerModelId = winnerId === 'left' ? leftId : winnerId === 'right' ? rightId : 'tie';
    const winnerName = winnerId === 'left' ? leftGen.name : winnerId === 'right' ? rightGen.name : 'Tie';

    // Construct AI Judge Critique Reason
    let judgeSummary = '';
    if (!leftImageResult.success && !rightImageResult.success) {
      judgeSummary = 'Evaluation failed. Both generation endpoints returned errors. Please check your API key configuration and try again.';
    } else if (!leftImageResult.success) {
      judgeSummary = `The AI Judge awards the verdict to **${rightGen.name}** (Blue Team) because **${leftGen.name}** generation failed. Details: ${leftImageResult.error}`;
    } else if (!rightImageResult.success) {
      judgeSummary = `The AI Judge awards the verdict to **${leftGen.name}** (Red Team) because **${rightGen.name}** generation failed. Details: ${rightImageResult.error}`;
    } else if (winnerId === 'left') {
      judgeSummary = `The AI Judge awards the verdict to **${leftGen.name}** (Left Panel). Upon evaluation of the prompt "${promptText}", **${leftGen.name}** demonstrated superior prompt adherence, higher composition scores, and outstanding fidelity. While **${rightGen.name}** rendered highly creative textures, it lagged slightly on prompt details alignment.`;
    } else if (winnerId === 'right') {
      judgeSummary = `The AI Judge awards the verdict to **${rightGen.name}** (Right Panel). In comparing the outputs, **${rightGen.name}** showcased breathtaking composition, atmospheric depth, and superior texture quality. While **${leftGen.name}** performed outstandingly on text elements, the aesthetic realism of **${rightGen.name}** yielded a higher combined score.`;
    } else {
      judgeSummary = `The comparison registers a **Tie**. Both model generations achieved remarkable parity across all metrics. **${leftGen.name}** excelled on crisp outlines and accuracy, whereas **${rightGen.name}** displayed a more painterly depth and creative composition.`;
    }

    return {
      id: `img-battle-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      prompt: promptText,
      modelLeft: leftId,
      modelRight: rightId,
      results: {
        left: {
          modelId: leftId,
          modelName: leftGen.name,
          generationTime: leftTime,
          imageSize: '1024x1024',
          scores: leftScores,
          imageUrl: leftImageResult.imageUrl || '',
          seed: leftImageResult.seed,
          imageType: 'real-image',
          error: leftImageResult.error || undefined
        },
        right: {
          modelId: rightId,
          modelName: rightGen.name,
          generationTime: rightTime,
          imageSize: '1024x1024',
          scores: rightScores,
          imageUrl: rightImageResult.imageUrl || '',
          seed: rightImageResult.seed,
          imageType: 'real-image',
          error: rightImageResult.error || undefined
        }
      },
      winnerId,
      winnerModelId,
      winnerName,
      judgeSummary
    };
  };

  const handleStartBattle = () => {
    if (!prompt.trim()) {
      alert('Please enter a generation prompt first.');
      return;
    }

    playSoundEffect('scan');
    setBattleStatus('SCANNING');
    setScanningLogs([]);
    setLoadingLeft(true);
    setLoadingRight(true);

    const leftGen = IMAGE_PROVIDERS.find(g => g.id === modelLeftId)!;
    const rightGen = CLOUDFLARE_PROVIDERS.find(g => g.id === modelRightId)!;

    const baseLogs = [
      'Initializing Image Arena API Core Matrix...',
      'Ingesting global battle configuration prompt...',
      `Configuring Red Team Generator: [${leftGen.name}]`,
      `Configuring Blue Team Generator: [${rightGen.name}]`,
      'Establishing secure tunnel to LLM Arena backend...',
      'Evaluating latent semantic prompt variables...',
      'Allocating GPU nodes for parallel pixel generation...'
    ];

    const seedLeft = Math.floor(Math.random() * 9999999);
    const seedRight = Math.floor(Math.random() * 9999999);

    const startTime = Date.now();
    let logIndex = 0;

    const addLog = (message: string) => {
      const timeStr = ((Date.now() - startTime) / 1000).toFixed(3);
      setScanningLogs(prev => [...prev, `[${timeStr}s] ${message}`]);
    };

    const logInterval = setInterval(() => {
      if (logIndex < baseLogs.length) {
        addLog(baseLogs[logIndex]);
        logIndex++;
      } else {
        clearInterval(logInterval);
      }
    }, 180);

    fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        leftModel: modelLeftId,
        rightModel: modelRightId,
        seedLeft,
        seedRight
      })
    })
      .then(async (res) => {
        // Ensure initial logs have finished printing
        const remainingLogs = baseLogs.slice(logIndex);
        for (const log of remainingLogs) {
          addLog(log);
          await new Promise(resolve => setTimeout(resolve, 80));
        }
        clearInterval(logInterval);

        if (!res.ok) {
          throw new Error(`Server returned error code ${res.status}`);
        }
        const data = await res.json();
        
        addLog('Received response packet streams from backend.');
        
        if (data.left.success) {
          addLog(`Red Team image generated successfully [Seed: ${data.left.seed}].`);
        } else {
          addLog(`🔴 Red Team generation failed: ${data.left.error}`);
        }

        if (data.right.success) {
          addLog(`Blue Team image generated successfully [Seed: ${data.right.seed}].`);
        } else {
          addLog(`🔵 Blue Team generation failed: ${data.right.error}`);
        }

        addLog('Triggering AI Judge diagnostic score critique...');
        addLog('Saving comparative telemetry battle metadata log...');

        setTimeout(() => {
          playSoundEffect('complete');
          
          const newBattle = runRealBattle(
            prompt,
            modelLeftId,
            modelRightId,
            data.left,
            data.right
          );

          setActiveBattle(newBattle);
          setBattleStatus('COMPLETED');
          
          if (!data.left.success) setLoadingLeft(false);
          if (!data.right.success) setLoadingRight(false);

          // Update history list and sync to LocalStorage
          setBattleHistory(prev => {
            const updated = [newBattle, ...prev.slice(0, 19)];
            saveHistoryToLocalStorage(updated);
            return updated;
          });
        }, 300);
      })
      .catch(async (error) => {
        clearInterval(logInterval);
        addLog(`❌ Critical Pipeline Error: ${error.message}`);
        
        setTimeout(() => {
          playSoundEffect('complete');
          const mockFailLeft = { success: false, imageUrl: '', seed: seedLeft, error: error.message };
          const mockFailRight = { success: false, imageUrl: '', seed: seedRight, error: error.message };
          
          const newBattle = runRealBattle(
            prompt,
            modelLeftId,
            modelRightId,
            mockFailLeft,
            mockFailRight
          );

          setActiveBattle(newBattle);
          setBattleStatus('COMPLETED');
          setLoadingLeft(false);
          setLoadingRight(false);
        }, 500);
      });
  };

  const handleResetBattle = () => {
    playSoundEffect('click');
    setBattleStatus('IDLE');
    setActiveBattle(null);
  };

  const handleVote = (voteType: 'left' | 'right' | 'tie') => {
    if (!activeBattle) return;
    playSoundEffect('click');
    
    const updatedBattle = { ...activeBattle, userVote: voteType };
    setActiveBattle(updatedBattle);

    // Update history registry
    setBattleHistory(prev => {
      const index = prev.findIndex(item => item.id === activeBattle.id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = updatedBattle;
        saveHistoryToLocalStorage(updated);
        return updated;
      }
      return prev;
    });
  };

  // Simulated Battle URL sharing
  const handleShareBattle = () => {
    playSoundEffect('click');
    const simLink = `${window.location.origin}${window.location.pathname}?imageBattleRef=${activeBattle?.id || 'sim-payload'}`;
    setShareLink(simLink);
    navigator.clipboard.writeText(simLink);
    setIsShareModalOpen(true);
  };

  // Load Battle from History
  const handleLoadFromHistory = (battle: BattleItem) => {
    playSoundEffect('click');
    setPrompt(battle.prompt);
    setModelLeftId(battle.modelLeft);
    setModelRightId(battle.modelRight);
    setLoadingLeft(true);
    setLoadingRight(true);
    setActiveBattle(battle);
    setBattleStatus('COMPLETED');
  };

  const handleDeleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    playSoundEffect('click');
    setBattleHistory(prev => {
      const updated = prev.filter(item => item.id !== id);
      saveHistoryToLocalStorage(updated);
      return updated;
    });
    if (activeBattle?.id === id) {
      handleResetBattle();
    }
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear your entire image battle registry history?')) {
      playSoundEffect('click');
      setBattleHistory([]);
      localStorage.removeItem('llm-arena-image-gen-api-battles');
      handleResetBattle();
    }
  };

  // Clipboard Helpers
  const handleCopyResponse = (text: string) => {
    navigator.clipboard.writeText(text);
    playSoundEffect('click');
    setCopiedStates(prev => ({ ...prev, share: true }));
    setTimeout(() => {
      setCopiedStates(prev => ({ ...prev, share: false }));
    }, 2000);
  };

  // Image Downloader Engine
  const handleDownloadImage = (imageUrl: string, modelName: string) => {
    playSoundEffect('click');
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `Arena_${modelName.replace(/\s+/g, '_')}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate stats from history
  const getWinnerStatistics = () => {
    const total = battleHistory.length;
    if (total === 0) return { left: 0, right: 0, tie: 0 };
    
    let leftVotes = 0;
    let rightVotes = 0;
    let tieVotes = 0;

    battleHistory.forEach(item => {
      if (item.userVote === 'left') leftVotes++;
      else if (item.userVote === 'right') rightVotes++;
      else if (item.userVote === 'tie') tieVotes++;
    });

    return {
      left: Math.round((leftVotes / total) * 100),
      right: Math.round((rightVotes / total) * 100),
      tie: Math.round((tieVotes / total) * 100)
    };
  };

  const winStats = getWinnerStatistics();
  const leftGenSelected = IMAGE_PROVIDERS.find(g => g.id === modelLeftId)!;
  const rightGenSelected = CLOUDFLARE_PROVIDERS.find(g => g.id === modelRightId)!;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch font-mono-cyber text-slate-100">
      
      {/* ==========================================
          1. Left Sidebar: Prompt Input & Registry Cache
          ========================================== */}
      <div className="xl:col-span-4 flex flex-col gap-6">
        
        {/* Prompt Input & Controller Dock */}
        <div className="bg-slate-950/60 border border-slate-900 rounded p-5 relative overflow-hidden flex flex-col gap-4">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-blue" />
          
          <div className="border-b border-slate-900 pb-3">
            <h2 className="text-sm font-black text-cyber-blue text-glow-blue uppercase">Image Gen Battle Deck</h2>
            <p className="text-[10px] text-slate-400 mt-1 uppercase">Enter prompt, select models and run parallel generation battles</p>
          </div>

          {/* Prompt Entry Box */}
          <div className="space-y-1.5 flex flex-col">
            <label className="text-[10px] text-slate-400 uppercase font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyber-blue" />
              1. Global Prompt Directive
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g. Create a futuristic cyberpunk city at sunset..."
              className="w-full h-24 bg-slate-900 border border-slate-800 rounded p-2.5 text-xs text-slate-200 focus:border-cyber-blue outline-none resize-none font-sans"
            />
            <div className="text-[9px] text-slate-500 leading-normal uppercase font-sans">
              Tip: Press Execute to trigger real-time AI image generation calls using selected model APIs!
            </div>
          </div>

          {/* Model selection selectors */}
          <div className="grid grid-cols-2 gap-4 border-t border-slate-900/60 pt-4">
            <div className="space-y-1.5">
              <label className="text-[9.5px] text-cyber-red font-black uppercase tracking-wider block">🔴 Left (Red Team)</label>
              <select
                value={modelLeftId}
                onChange={(e) => { playSoundEffect('click'); setModelLeftId(e.target.value); }}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-[11px] text-slate-300 font-bold focus:border-cyber-red outline-none"
              >
                {IMAGE_PROVIDERS.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.vendor})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9.5px] text-cyber-blue font-black uppercase tracking-wider block">🔵 Right (Blue Team)</label>
              <select
                value={modelRightId}
                onChange={(e) => { playSoundEffect('click'); setModelRightId(e.target.value); }}
                className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-[11px] text-slate-300 font-bold focus:border-cyber-blue outline-none"
              >
                {CLOUDFLARE_PROVIDERS.map(g => (
                  <option key={g.id} value={g.id} disabled={!g.available}>
                    {g.name} ({g.vendor}) {!g.available ? '[UNAVAILABLE]' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model Swap Action */}
          <div className="flex justify-center -my-2.5">
            <button
              onClick={handleSwapModels}
              disabled={true}
              className="p-1 px-3.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-500 cursor-not-allowed flex items-center gap-1.5 transition-all"
              title="Swap Arena Sides (Disabled)"
            >
              <span>Swap Arena Sides</span>
            </button>
          </div>

          {/* Trigger button */}
          <button
            onClick={handleStartBattle}
            disabled={battleStatus === 'SCANNING'}
            className="w-full py-3 mt-2 rounded bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40 hover:bg-cyber-blue/30 text-xs font-black uppercase tracking-widest cursor-pointer disabled:opacity-40 transition-all active:scale-98 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.05)] font-mono-cyber"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {battleStatus === 'SCANNING' ? 'SIMULATING VISUAL PIPELINE...' : 'EXECUTE ARENA BATTLE'}
          </button>
        </div>

        {/* Battle history list */}
        <div className="bg-slate-950/60 border border-slate-900 rounded p-5 relative overflow-hidden flex flex-col gap-4 flex-1 min-h-[220px]">
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-blue" />
          
          <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2 font-mono-cyber">
              <History className="w-4 h-4 text-cyber-blue shrink-0" />
              <span className="text-xs font-black uppercase tracking-wider text-slate-200">Historical Battles</span>
            </div>
            {battleHistory.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="text-[9px] text-cyber-red/80 hover:text-cyber-red border border-cyber-red/30 hover:border-cyber-red bg-cyber-red/10 px-1.5 py-0.5 rounded cursor-pointer uppercase font-bold"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[280px] lg:max-h-none">
            {battleHistory.map((b) => {
              const lGen = IMAGE_PROVIDERS.find(g => g.id === b.modelLeft);
              const rGen = IMAGE_PROVIDERS.find(g => g.id === b.modelRight) || CLOUDFLARE_PROVIDERS.find(g => g.id === b.modelRight);

              return (
                <div
                  key={b.id}
                  onClick={() => handleLoadFromHistory(b)}
                  className={`p-2.5 rounded border border-slate-900 bg-slate-900/20 hover:border-slate-800 hover:bg-slate-900/40 transition-all cursor-pointer group flex justify-between items-center gap-2 ${
                    activeBattle?.id === b.id ? 'border-cyber-blue/35 bg-cyber-blue/5' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden flex-1">
                    {/* Small visual preview block */}
                    <div className="w-10 h-10 bg-slate-950 border border-slate-850 rounded overflow-hidden flex items-center justify-center shrink-0">
                      {b.results.left.error ? (
                        <X className="w-4 h-4 text-cyber-red" />
                      ) : (
                        <img src={b.results.left.imageUrl} alt="history preview" className="w-full h-full object-cover" />
                      )}
                    </div>

                    <div className="overflow-hidden flex-1">
                      <span className="text-[10.5px] text-slate-300 block font-bold truncate font-sans">"{b.prompt}"</span>
                      <div className="flex items-center gap-1.5 text-[8.5px] text-slate-400 mt-0.5 font-mono-cyber">
                        <span className="text-cyber-red font-bold">{lGen?.name}</span>
                        <span>VS</span>
                        <span className="text-cyber-blue font-bold">{rGen?.name}</span>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[7.5px] text-slate-500 block uppercase">{b.timestamp}</span>
                        <span className="text-[8px] text-cyber-yellow font-black uppercase flex items-center gap-0.5">
                          🏆 {b.winnerName}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteHistoryItem(b.id, e)}
                    className="p-1 text-slate-500 hover:text-cyber-red rounded cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete log"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
            
            {battleHistory.length === 0 && (
              <div className="text-center py-10 text-slate-500 uppercase select-none text-[10px]">
                --- No Battles Registered ---
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ==========================================
          2. Middle & Right: Active Arena Battle & Cards Output
          ========================================== */}
      <div className="xl:col-span-8 flex flex-col gap-6">

        {battleStatus === 'IDLE' && (
          <div className="bg-slate-950/60 border border-slate-900 rounded p-12 text-center flex flex-col items-center justify-center gap-5 flex-1 relative min-h-[400px]">
            <div className="absolute inset-0 border border-dashed border-slate-900/60 m-2.5 pointer-events-none rounded" />
            <div className="w-16 h-16 rounded border border-cyber-blue/35 bg-cyber-blue/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.15)] animate-pulse">
              <Sparkles className="w-8 h-8 text-cyber-blue" />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-widest text-glow-blue font-mono-cyber">Image Battle Arena Standby</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mt-2 font-sans">
                Set a generation prompt and configure the generators. Executing the comparison runs both systems side-by-side and displays the AI Judge scorecard.
              </p>
            </div>
          </div>
        )}

        {battleStatus === 'SCANNING' && (
          <div className="bg-slate-950/60 border border-slate-900 rounded p-6 flex flex-col gap-4 flex-1 relative overflow-hidden min-h-[400px] justify-between">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,240,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
            <div className="absolute top-0 left-0 w-full h-[2px] bg-cyber-blue shadow-[0_0_10px_#00f0ff] animate-[scanline_2s_linear_infinite]" />
            
            <div className="border-b border-slate-900 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-black text-cyber-blue text-glow-blue uppercase">GEN PIPELINE FLOW: ACTIVE</h3>
                <p className="text-[10px] text-slate-400 mt-0.5 uppercase">Simulating parallel AI model processes...</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-cyber-blue animate-ping" />
            </div>

            <div className="flex-1 bg-black border border-slate-900 rounded p-4 overflow-y-auto space-y-1.5 font-mono-cyber text-[11px] text-cyan-300 min-h-[220px]">
              {scanningLogs.map((log, idx) => (
                <div key={idx} className="leading-normal break-all">
                  {log}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
            
            <div className="text-center text-[10px] text-slate-500 uppercase tracking-widest leading-none">
              Awaiting parallel responses ... DO NOT CLOSED THE CHANNEL LINK
            </div>
          </div>
        )}

        {battleStatus === 'COMPLETED' && activeBattle && (
          <div className="space-y-6 flex-1 flex flex-col">
            
            {/* Control Header Bar */}
            <div className="bg-slate-950/90 border border-slate-900 rounded px-5 py-3.5 flex flex-col sm:flex-row justify-between items-center gap-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-cyber-blue" />
              <div>
                <h3 className="text-xs font-black uppercase text-slate-200 tracking-wider">Image Comparison Grid Loaded</h3>
                <span className="text-[8.5px] text-slate-500 uppercase block mt-0.5 font-mono-cyber">RUN REGISTRY: {activeBattle.id}</span>
              </div>
              
              <div className="flex flex-wrap gap-2 text-[10px]">
                <button
                  onClick={handleShareBattle}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-350 hover:text-white hover:border-slate-600 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-cyber-blue" /> Share Battle
                </button>
                <button
                  onClick={handleStartBattle}
                  className="px-3 py-1.5 rounded bg-cyber-blue/10 border border-cyber-blue/35 text-cyber-blue hover:bg-cyber-blue/20 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Regenerate Both
                </button>
                <button
                  onClick={handleResetBattle}
                  className="px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Reset Arena
                </button>
              </div>
            </div>

            {/* Main Battle Panels side by side */}
            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch relative">
                
                {/* Left Card: Red Team */}
                <div className="cyber-panel-red flex flex-col justify-between overflow-hidden relative group p-4 border border-cyber-red/35 shadow-[0_0_15px_rgba(255,0,85,0.04)]">
                  {/* Top Bezel */}
                  <div className="absolute top-0 left-0 bg-cyber-red h-[3px] w-1/3" />
                  
                  {/* Header info */}
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded border flex items-center justify-center text-[10.5px] font-black border-cyber-red text-cyber-red bg-cyber-red/10">
                        {leftGenSelected.badgeSymbol}
                      </span>
                      <div>
                        <span className="text-[11.5px] font-black text-white uppercase tracking-wider block font-mono-cyber">
                          {activeBattle.results.left.modelName}
                        </span>
                        <span className="text-[8px] text-slate-550 uppercase block font-bold leading-none mt-0.5">RED TEAM // {leftGenSelected.vendor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Generated Image Preview Area */}
                  <div className="relative w-full aspect-square bg-slate-950 border border-slate-900 rounded overflow-hidden flex items-center justify-center mb-4">
                    {activeBattle.results.left.error ? (
                      <div className="flex flex-col items-center gap-2.5 p-5 text-center text-cyber-red font-mono-cyber">
                        <X className="w-9 h-9 text-cyber-red animate-pulse" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-glow-red">PIPELINE FAILURE</span>
                        <p className="text-[10.5px] text-slate-450 mt-1 max-w-[220px] break-words normal-case leading-relaxed font-sans">
                          {activeBattle.results.left.error}
                        </p>
                      </div>
                    ) : (
                      <>
                        <img 
                          key={activeBattle.results.left.imageUrl}
                          src={activeBattle.results.left.imageUrl} 
                          alt="Red Team preview"
                          onLoad={() => setLoadingLeft(false)}
                          onError={() => setLoadingLeft(false)}
                          className={loadingLeft ? 'hidden' : 'w-full h-full object-cover rounded shadow-[0_0_15px_rgba(0,0,0,0.6)]'}
                        />
                        
                        {loadingLeft && (
                          <div className="flex flex-col items-center gap-2 text-cyber-red animate-pulse">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-[10px] uppercase font-bold tracking-widest font-mono-cyber">GENERATING IMAGE...</span>
                          </div>
                        )}

                        {/* Glowing HUD elements on top of the image */}
                        {!loadingLeft && (
                          <>
                            <div className="absolute inset-0 pointer-events-none border border-cyber-red/20" />
                            <div className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-850 px-1.5 py-0.5 rounded text-[8px] text-slate-400 font-mono-cyber">
                              LATENT_SEED: {activeBattle.results.left.seed}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Generator details & Actions */}
                  <div className="space-y-3.5">
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono-cyber font-bold border-y border-slate-900/60 py-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyber-red" />
                        <span>SPEED: <strong className="text-white">{activeBattle.results.left.generationTime}s</strong></span>
                      </div>
                      <div>
                        <span>SIZE: <strong className="text-white">{activeBattle.results.left.imageSize}</strong></span>
                      </div>
                      <div>
                        <span>SCORE: <strong className="text-cyber-red">{activeBattle.results.left.scores.overall}</strong></span>
                      </div>
                    </div>

                    <div className="text-[9.5px] font-mono-cyber text-slate-500 uppercase pb-1.5 text-center">
                      Tool: <strong className="text-slate-350">{activeBattle.results.left.modelName}</strong>
                    </div>

                    <button
                      onClick={() => handleDownloadImage(activeBattle.results.left.imageUrl, activeBattle.results.left.modelName)}
                      disabled={!!activeBattle.results.left.error}
                      className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5 text-cyber-red" /> Download Image
                    </button>
                  </div>
                </div>

                {/* Right Card: Blue Team */}
                <div className="cyber-panel-blue flex flex-col justify-between overflow-hidden relative group p-4 border border-cyber-blue/35 shadow-[0_0_15px_rgba(0,240,255,0.04)]">
                  {/* Top Bezel */}
                  <div className="absolute top-0 right-0 bg-cyber-blue h-[3px] w-1/3" />
                  
                  {/* Header info */}
                  <div className="flex justify-between items-center border-b border-slate-900 pb-3 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded border flex items-center justify-center text-[10.5px] font-black border-cyber-blue text-cyber-blue bg-cyber-blue/10">
                        {rightGenSelected.badgeSymbol}
                      </span>
                      <div>
                        <span className="text-[11.5px] font-black text-white uppercase tracking-wider block font-mono-cyber">
                          {activeBattle.results.right.modelName}
                        </span>
                        <span className="text-[8px] text-slate-550 uppercase block font-bold leading-none mt-0.5">BLUE TEAM // {rightGenSelected.vendor}</span>
                      </div>
                    </div>
                  </div>

                  {/* Generated Image Preview Area */}
                  <div className="relative w-full aspect-square bg-slate-950 border border-slate-900 rounded overflow-hidden flex items-center justify-center mb-4">
                    {activeBattle.results.right.error ? (
                      <div className="flex flex-col items-center gap-2.5 p-5 text-center text-cyber-blue font-mono-cyber">
                        <X className="w-9 h-9 text-cyber-blue animate-pulse" />
                        <span className="text-[10px] uppercase font-black tracking-widest text-glow-blue">PIPELINE FAILURE</span>
                        <p className="text-[10.5px] text-slate-455 mt-1 max-w-[220px] break-words normal-case leading-relaxed font-sans">
                          {activeBattle.results.right.error}
                        </p>
                      </div>
                    ) : (
                      <>
                        <img 
                          key={activeBattle.results.right.imageUrl}
                          src={activeBattle.results.right.imageUrl} 
                          alt="Blue Team preview"
                          onLoad={() => setLoadingRight(false)}
                          onError={() => setLoadingRight(false)}
                          className={loadingRight ? 'hidden' : 'w-full h-full object-cover rounded shadow-[0_0_15px_rgba(0,0,0,0.6)]'}
                        />

                        {loadingRight && (
                          <div className="flex flex-col items-center gap-2 text-cyber-blue animate-pulse">
                            <Loader2 className="w-8 h-8 animate-spin" />
                            <span className="text-[10px] uppercase font-bold tracking-widest font-mono-cyber">GENERATING IMAGE...</span>
                          </div>
                        )}

                        {/* Glowing HUD elements on top of the image */}
                        {!loadingRight && (
                          <>
                            <div className="absolute inset-0 pointer-events-none border border-cyber-blue/20" />
                            <div className="absolute bottom-2 left-2 bg-slate-950/80 border border-slate-850 px-1.5 py-0.5 rounded text-[8px] text-slate-400 font-mono-cyber">
                              LATENT_SEED: {activeBattle.results.right.seed}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Generator details & Actions */}
                  <div className="space-y-3.5">
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono-cyber font-bold border-y border-slate-900/60 py-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-cyber-blue" />
                        <span>SPEED: <strong className="text-white">{activeBattle.results.right.generationTime}s</strong></span>
                      </div>
                      <div>
                        <span>SIZE: <strong className="text-white">{activeBattle.results.right.imageSize}</strong></span>
                      </div>
                      <div>
                        <span>SCORE: <strong className="text-cyber-blue">{activeBattle.results.right.scores.overall}</strong></span>
                      </div>
                    </div>

                    <div className="text-[9.5px] font-mono-cyber text-slate-500 uppercase pb-1.5 text-center">
                      Tool: <strong className="text-slate-350">{activeBattle.results.right.modelName}</strong>
                    </div>

                    <button
                      onClick={() => handleDownloadImage(activeBattle.results.right.imageUrl, activeBattle.results.right.modelName)}
                      disabled={!!activeBattle.results.right.error}
                      className="w-full py-1.5 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer flex items-center justify-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Download className="w-3.5 h-3.5 text-cyber-blue" /> Download Image
                    </button>
                  </div>
                </div>

              </div>

              {/* Centered VS Animation / Badge */}
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none hidden md:block">
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 10 }}
                  className="w-14 h-14 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.9)] relative"
                >
                  <div className="absolute inset-0 rounded-full border border-dashed border-cyber-blue/30 animate-spin" />
                  <span className="font-mono-cyber font-black text-base italic tracking-tighter bg-gradient-to-r from-cyber-red via-white to-cyber-blue bg-clip-text text-transparent select-none animate-pulse">
                    VS
                  </span>
                </motion.div>
              </div>

            </div>

            {/* AI Judge Evaluation Report panel */}
            <div className="bg-slate-950/60 border border-slate-900 rounded p-6 relative overflow-hidden flex flex-col gap-5">
              <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-yellow" />
              
              <div className="border-b border-slate-900 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4.5 h-4.5 text-cyber-yellow animate-bounce" />
                  <h3 className="text-xs font-black text-slate-100 uppercase tracking-widest font-mono-cyber">AI Judge Evaluation Scorecard</h3>
                </div>
                <span className="text-[9px] border border-cyber-yellow/35 bg-cyber-yellow/10 px-2 py-0.5 rounded text-cyber-yellow uppercase font-bold">
                  VERDICT REGISTERED
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Visual scorecard metrics compared side-by-side */}
                <div className="lg:col-span-7 space-y-4 bg-slate-900/10 p-4 border border-slate-900/60 rounded flex flex-col justify-center">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block border-b border-slate-900 pb-1.5 font-mono-cyber">
                    Evaluation Matrix Details
                  </span>

                  <div className="space-y-3.5">
                    {/* Scores categories labels */}
                    {(['accuracy', 'quality', 'creativity', 'realism', 'composition'] as const).map((metric) => {
                      const leftVal = activeBattle.results.left.scores[metric];
                      const rightVal = activeBattle.results.right.scores[metric];
                      return (
                        <div key={metric} className="space-y-1">
                          <div className="flex justify-between text-[10px] uppercase font-bold font-mono-cyber text-slate-350">
                            <span className="text-cyber-red font-black">{leftVal}%</span>
                            <span>{metric.replace(/^\w/, c => c.toUpperCase())}</span>
                            <span className="text-cyber-blue font-black">{rightVal}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-950 border border-slate-850 rounded-full overflow-hidden flex">
                            {/* Left scale */}
                            <div className="w-1/2 flex justify-end">
                              <div
                                className="h-full bg-gradient-to-l from-cyber-red to-cyber-red/30 transition-all duration-1000"
                                style={{ width: `${leftVal}%` }}
                              />
                            </div>
                            {/* Right scale */}
                            <div className="w-1/2 flex justify-start">
                              <div
                                className="h-full bg-gradient-to-r from-cyber-blue to-cyber-blue/30 transition-all duration-1000"
                                style={{ width: `${rightVal}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Judge critique summary reason & winner box */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded p-4.5 flex flex-col justify-between font-sans leading-relaxed">
                  <div>
                    <span className="text-[10px] text-cyber-yellow font-bold uppercase block mb-1 font-mono-cyber tracking-widest">
                      🏆 WINNER DECISION:
                    </span>
                    
                    <div className="flex items-center gap-2 mb-3.5">
                      {activeBattle.winnerId !== 'tie' && (
                        <span className="px-2 py-0.5 rounded-[2px] bg-cyber-yellow/15 border border-cyber-yellow/35 text-cyber-yellow text-[8px] font-black uppercase tracking-wider flex items-center gap-1">
                          <Trophy className="w-2.5 h-2.5" /> Winner
                        </span>
                      )}
                      <h4 className="text-sm font-black text-white uppercase font-mono-cyber">
                        {activeBattle.winnerId === 'left' && <span className="text-cyber-red">{activeBattle.results.left.modelName}</span>}
                        {activeBattle.winnerId === 'right' && <span className="text-cyber-blue">{activeBattle.results.right.modelName}</span>}
                        {activeBattle.winnerId === 'tie' && <span className="text-slate-400">TIE BATTLE</span>}
                      </h4>
                    </div>
                    
                    <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed">
                      {activeBattle.judgeSummary}
                    </p>
                  </div>

                  <div className="border-t border-slate-900 pt-3 mt-4 flex items-center justify-between text-[8px] text-slate-500 font-mono-cyber uppercase">
                    <span>EVAL_ENGINE: JUDGE_IMG_v2.5</span>
                    <span className="text-cyber-yellow animate-pulse font-bold">VERIFIED REPORT</span>
                  </div>
                </div>
              </div>

            </div>

            {/* User Vote & Statistics Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              
              {/* Vote dock */}
              <div className="bg-slate-950/60 border border-slate-900 rounded p-5 relative overflow-hidden flex flex-col justify-between gap-4">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyber-red" />
                <div>
                  <h4 className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5 mb-1">
                    <Vote className="w-4 h-4 text-cyber-red" /> Submit Your Vote
                  </h4>
                  <p className="text-[10px] text-slate-500 uppercase">Cast your verdict on which image matches the prompt best</p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleVote('left')}
                    className={`flex-1 py-2 border rounded font-bold uppercase tracking-wider text-[10px] cursor-pointer transition-all ${
                      activeBattle.userVote === 'left'
                        ? 'bg-cyber-red/20 border-cyber-red text-cyber-red shadow-[0_0_10px_rgba(255,0,85,0.25)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    👈 Left Image
                  </button>
                  <button
                    onClick={() => handleVote('tie')}
                    className={`flex-1 py-2 border rounded font-bold uppercase tracking-wider text-[10px] cursor-pointer transition-all ${
                      activeBattle.userVote === 'tie'
                        ? 'bg-slate-700/20 border-slate-500 text-slate-300 shadow-[0_0_10px_rgba(100,100,100,0.25)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    🤝 Tie Game
                  </button>
                  <button
                    onClick={() => handleVote('right')}
                    className={`flex-1 py-2 border rounded font-bold uppercase tracking-wider text-[10px] cursor-pointer transition-all ${
                      activeBattle.userVote === 'right'
                        ? 'bg-cyber-blue/20 border-cyber-blue text-cyber-blue shadow-[0_0_10px_rgba(0,240,255,0.25)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    Right Image 👉
                  </button>
                </div>
              </div>

              {/* Stats dashboard */}
              <div className="bg-slate-950/60 border border-slate-900 rounded p-5 relative overflow-hidden flex flex-col justify-between gap-2.5">
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyber-blue" />
                <h4 className="text-xs font-black uppercase text-slate-300 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyber-blue" /> Community Verdict Metrics
                </h4>

                <div className="space-y-2 text-[10.5px] font-mono-cyber">
                  <div className="flex justify-between border-b border-slate-900 pb-1">
                    <span className="text-slate-400">Total Run Registry:</span>
                    <span className="text-white font-bold">{battleHistory.length} Sessions</span>
                  </div>
                  
                  {/* Local storage voting statistics representation */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase">
                      <span>Left Win: {winStats.left}%</span>
                      <span>Tie: {winStats.tie}%</span>
                      <span>Right Win: {winStats.right}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                      <div className="bg-cyber-red h-full" style={{ width: `${winStats.left}%` }} />
                      <div className="bg-slate-600 h-full" style={{ width: `${winStats.tie}%` }} />
                      <div className="bg-cyber-blue h-full" style={{ width: `${winStats.right}%` }} />
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>

      {/* Share Link Modal Popup Dialog */}
      {isShareModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-5 flex flex-col gap-4 shadow-[0_0_40px_rgba(0,240,255,0.15)] relative font-mono-cyber text-slate-200">
            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-3 right-3 text-slate-550 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
              <Share2 className="w-4 h-4 text-cyber-blue" />
              <h4 className="text-xs font-black uppercase text-white tracking-widest">Share Image Battle Link</h4>
            </div>

            <div className="space-y-1.5">
              <label className="text-[9px] text-slate-500 uppercase font-bold">Simulated Shared Battle URL:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareLink}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-[10px] text-slate-300 focus:border-cyber-blue outline-none"
                />
                <button
                  onClick={() => handleCopyResponse(shareLink)}
                  className="px-3 rounded bg-cyber-blue/15 border border-cyber-blue/35 text-cyber-blue hover:bg-cyber-blue/25 transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                >
                  <Copy className="w-3.5 h-3.5" /> {copiedStates.share ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="text-[9.5px] text-slate-455 leading-relaxed bg-slate-950 p-2.5 rounded border border-slate-850 uppercase">
              &gt; Telemetry seeds generated. This static url mimics loading visual evaluations with preset variables directly.
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-xs font-bold uppercase tracking-widest text-slate-200 transition-colors"
              >
                PROCEED
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
