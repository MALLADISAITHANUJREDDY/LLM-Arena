import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Flame, 
  Activity, 
  Terminal, 
  AlertTriangle, 
  Layers, 
  Brain,
  Unlock,
  FileSearch,
  DatabaseZap,
  BrainCircuit
} from 'lucide-react';

interface TeamPanelProps {
  side: 'red' | 'blue';
  health: number;
  shield: number;
  modelName: string;
  parameters: string;
  vectors: string[];
  activeAction?: string;
  logsCount: number;
  onSelectAttack?: (attackName: string) => void;
  onSendBlueMessage?: (message: string) => void;
  onConnectNode?: (apiLink: string, chatbotLink: string, apiKey: string) => void;
  onConnectionStatusChange?: (status: 'CONNECTED' | 'DISCONNECTED' | 'CONNECTING') => void;
  isIdle?: boolean;
}

const attackCards = [
  {
    name: 'Prompt Injection',
    severity: 'high' as const,
    icon: Terminal,
    description: 'Bypass context filters using instructions overrides'
  },
  {
    name: 'Jailbreak',
    severity: 'critical' as const,
    icon: Unlock,
    description: 'Force the model to bypass safety alignments'
  },
  {
    name: 'System Prompt Extraction',
    severity: 'high' as const,
    icon: FileSearch,
    description: 'Retrieve underlying system templates'
  },
  {
    name: 'Data Leakage',
    severity: 'critical' as const,
    icon: DatabaseZap,
    description: 'Siphon training credentials and database tokens'
  },
  {
    name: 'Hallucination',
    severity: 'medium' as const,
    icon: BrainCircuit,
    description: 'Induce factual divergence using false contexts'
  }
];

const getSeverityStyle = (severity: 'medium' | 'high' | 'critical', isActive: boolean) => {
  switch (severity) {
    case 'critical':
      return {
        border: isActive 
          ? 'border-red-500 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
          : 'border-slate-800 hover:border-red-500/60 bg-slate-950/70 hover:shadow-[0_0_8px_rgba(239,68,68,0.2)]',
        color: 'text-red-400 font-bold',
        tagBg: 'bg-red-500/25 text-red-200 border border-red-500/40'
      };
    case 'high':
      return {
        border: isActive 
          ? 'border-amber-500 bg-amber-950/40 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
          : 'border-slate-800 hover:border-amber-500/60 bg-slate-950/70 hover:shadow-[0_0_8px_rgba(245,158,11,0.2)]',
        color: 'text-amber-400 font-bold',
        tagBg: 'bg-amber-500/25 text-amber-200 border border-amber-500/40'
      };
    case 'medium':
    default:
      return {
        border: isActive 
          ? 'border-yellow-500 bg-yellow-950/40 shadow-[0_0_15px_rgba(234,179,8,0.5)]' 
          : 'border-slate-800 hover:border-yellow-500/60 bg-slate-950/70 hover:shadow-[0_0_8px_rgba(234,179,8,0.2)]',
        color: 'text-yellow-400 font-bold',
        tagBg: 'bg-yellow-500/25 text-yellow-200 border border-yellow-500/40'
      };
  }
};

export const TeamPanel: React.FC<TeamPanelProps> = ({
  side,
  health,
  shield,
  modelName,
  parameters,
  vectors,
  activeAction,
  logsCount,
  onSelectAttack,
  onSendBlueMessage,
  onConnectNode,
  onConnectionStatusChange,
  isIdle = false,
}) => {
  const isRed = side === 'red';
  const accentColor = isRed ? 'text-cyber-red' : 'text-cyber-blue';
  const accentBg = isRed ? 'bg-cyber-red/15' : 'bg-cyber-blue/15';
  const accentBorder = isRed ? 'border-cyber-red/40' : 'border-cyber-blue/40';
  const panelClass = isRed ? 'cyber-panel-red' : 'cyber-panel-blue';

  // Blue Chatbot & Connector state
  const [activeTab, setActiveTab] = useState<'schemas' | 'chat'>('chat');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant' | 'system', text: string }>>([
    { sender: 'system', text: 'Sentinel Core Online (claude-3-5.v1)' },
    { sender: 'assistant', text: 'Defender chatbot initialized. Send a prompt to check safety evaluation.' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [apiLink, setApiLink] = useState('https://api.sentinel-defense.ai/v1/chat/completions');
  const [chatbotLink, setChatbotLink] = useState('https://widget.security.ai/sentinel-bot-v1');
  const [apiKey, setApiKey] = useState('sk-ant-defense-node-18f92z');
  const [connectionStatus, setConnectionStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('CONNECTED');
  const [validationError, setValidationError] = useState<string | null>(null);
  const chatConsoleRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat window container only (does not scroll page)
  useEffect(() => {
    if (!isRed && chatConsoleRef.current) {
      chatConsoleRef.current.scrollTop = chatConsoleRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab, isRed]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    const userText = inputValue;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setInputValue('');

    // Trigger parent callback to populate battle logs
    if (onSendBlueMessage) {
      onSendBlueMessage(userText);
    }

    // Set interactive delay responses
    setTimeout(() => {
      let reply = "Security scan complete. Prompt verified as safe. No injection vectors detected.";
      const lowerText = userText.toLowerCase();
      if (lowerText.includes('ignore') || lowerText.includes('override') || lowerText.includes('jailbreak') || lowerText.includes('system prompt')) {
        reply = "ALERT: Prompt injection / instruction override anomaly blocked! Filter scrubbed input context.";
      } else if (lowerText.includes('leak') || lowerText.includes('credentials') || lowerText.includes('database') || lowerText.includes('password')) {
        reply = "ALERT: Threat signature matched exfiltration attempt. Access keys and variables redacted.";
      }
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
    }, 900);
  };

  const handleTestConnection = () => {
    setValidationError(null);
    setConnectionStatus('CONNECTING');
    if (onConnectionStatusChange) {
      onConnectionStatusChange('CONNECTING');
    }

    setTimeout(() => {
      // 1. Validate API Link URL
      if (!apiLink.trim() || (!apiLink.startsWith('http://') && !apiLink.startsWith('https://'))) {
        setConnectionStatus('DISCONNECTED');
        setValidationError('CONNECTION ERROR: Invalid API Link format. Must begin with http:// or https://');
        if (onConnectionStatusChange) {
          onConnectionStatusChange('DISCONNECTED');
        }
        return;
      }

      // 2. Validate Chatbot Link URL
      if (!chatbotLink.trim() || (!chatbotLink.startsWith('http://') && !chatbotLink.startsWith('https://'))) {
        setConnectionStatus('DISCONNECTED');
        setValidationError('CONNECTOR ERROR: Invalid Chatbot Widget URL. Must begin with http:// or https://');
        if (onConnectionStatusChange) {
          onConnectionStatusChange('DISCONNECTED');
        }
        return;
      }

      // 3. Validate API Key
      const keyTrim = apiKey.trim().toLowerCase();
      if (!keyTrim || keyTrim.length < 5) {
        setConnectionStatus('DISCONNECTED');
        setValidationError('AUTHENTICATION ERROR: Secret key too short (min 5 characters required).');
        if (onConnectionStatusChange) {
          onConnectionStatusChange('DISCONNECTED');
        }
        return;
      }
      if (keyTrim.includes('wrong') || keyTrim === '1234' || keyTrim === 'error') {
        setConnectionStatus('DISCONNECTED');
        setValidationError('ACCESS DENIED: API Secret Key signature is invalid or has expired.');
        if (onConnectionStatusChange) {
          onConnectionStatusChange('DISCONNECTED');
        }
        return;
      }

      // If all valid, set to CONNECTED and notify parent
      setConnectionStatus('CONNECTED');
      if (onConnectionStatusChange) {
        onConnectionStatusChange('CONNECTED');
      }
      if (onConnectNode) {
        onConnectNode(apiLink, chatbotLink, apiKey);
      }
    }, 1200);
  };

  return (
    <div className={`flex flex-col h-full p-5 gap-5 ${panelClass}`}>
      {/* Title Header with Side Label */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 font-mono-cyber">
        <div className="flex items-center gap-2.5">
          {isRed ? (
            <Flame className="w-5 h-5 text-cyber-red animate-pulse" />
          ) : (
            <Shield className="w-5 h-5 text-cyber-blue" />
          )}
          <div>
            <h2 className={`text-base font-black tracking-widest uppercase ${isRed ? 'text-cyber-red text-glow-red' : 'text-cyber-blue text-glow-blue'}`}>
              {isRed ? 'RED TEAM // ATTACKER' : 'BLUE TEAM // DEFENDER'}
            </h2>
            <p className="text-[11px] text-slate-400 uppercase tracking-wider">
              AI Security Simulation node
            </p>
          </div>
        </div>
        <div className={`px-2 py-0.5 rounded text-[11px] font-bold border ${isRed ? 'bg-cyber-red/20 text-cyber-red border-cyber-red/40' : 'bg-cyber-blue/20 text-cyber-blue border-cyber-blue/40'}`}>
          {isRed ? 'ATTACK' : 'DEFEND'}
        </div>
      </div>

      {/* Model Spec Details */}
      <div className="p-3 rounded bg-slate-950/80 border border-slate-800/85 relative overflow-hidden">
        <div className="flex items-center gap-3 font-mono-cyber">
          <div className={`p-2.5 rounded bg-slate-900 border ${accentBorder} flex items-center justify-center`}>
            <Brain className={`w-5 h-5 ${accentColor}`} />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-100 uppercase tracking-wide">{modelName}</h3>
            <div className="flex gap-2.5 text-[11px] text-slate-400 font-bold">
              <span>PARAMS: <strong className="text-slate-200">{parameters}</strong></span>
              <span>•</span>
              <span>NODE ID: <strong className="text-slate-200">#00{isRed ? '8A' : '9F'}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Red Team Attack Cards or Blue Team Stats Section */}
      {isRed ? (
        <div className="flex-1 flex flex-col gap-2.5 font-mono-cyber">
          <div className="flex items-center justify-between text-xs text-slate-300 border-b border-slate-900 pb-1.5 uppercase font-bold">
            <span>SELECT ATTACK VECTOR</span>
            <span className="text-[10px] text-slate-400 font-normal">ONE ACTIVE</span>
          </div>
          <div className="flex flex-col gap-2">
            {attackCards.map((card) => {
              const isActive = activeAction === card.name;
              const styles = getSeverityStyle(card.severity, isActive);
              const CardIcon = card.icon;

              return (
                <motion.button
                  key={card.name}
                  onClick={() => onSelectAttack && onSelectAttack(card.name)}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.985 }}
                  className={`w-full text-left p-2.5 rounded border transition-all flex flex-col gap-1.5 cursor-pointer ${styles.border}`}
                >
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-2">
                      <CardIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? styles.color : 'text-slate-400'}`} />
                      <h4 className={`text-xs font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-200'}`}>
                        {card.name}
                      </h4>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-[2px] text-[8px] font-bold uppercase tracking-wider ${styles.tagBg}`}>
                      {card.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 leading-tight font-sans">
                    {card.description}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Blue Team health/shield stats section */
        <div className="space-y-4 font-mono-cyber">
          {/* Animated Health Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Integrity
              </span>
              <span className="font-bold text-cyber-blue text-sm">
                {health}%
              </span>
            </div>
            <div className="h-4.5 w-full bg-slate-950/90 border border-slate-800 rounded-sm p-[2px] overflow-hidden relative">
              <motion.div
                className="h-full rounded-sm bg-gradient-to-r from-cyan-600 to-cyber-blue shadow-[0_0_12px_rgba(0,240,255,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${health}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              />
              {health <= 30 && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-red-400 animate-pulse bg-red-950/40 uppercase tracking-widest">
                  CRITICAL WARNING
                </span>
              )}
            </div>
          </div>

          {/* Animated Shield Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold uppercase flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> Defense Shield
              </span>
              <span className="font-bold text-cyber-blue text-sm">
                {shield}%
              </span>
            </div>
            <div className="h-3.5 w-full bg-slate-950/90 border border-slate-800 rounded-sm p-[2px] overflow-hidden">
              <motion.div
                className="h-full rounded-sm bg-cyan-900/60 shadow-[0_0_6px_rgba(0,240,255,0.3)]"
                initial={{ width: 0 }}
                animate={{ width: `${shield}%` }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Capabilities/Defensive Schemas or AI Chat Bot (Blue Only) */}
      {!isRed && (
        isIdle ? (
          /* API & CHATBOT CONNECTOR CONFIG CARD */
          <div className="flex-1 flex flex-col gap-3 font-mono-cyber min-h-0 bg-slate-950/80 border border-slate-900 rounded p-4 relative overflow-hidden justify-between">
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyber-blue" />
            
            <div className="border-b border-slate-900 pb-1.5 shrink-0">
              <h3 className="text-sm font-black uppercase text-cyber-blue text-glow-blue flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> API & CHATBOT CONNECTOR
              </h3>
              <p className="text-[10px] text-slate-400 uppercase mt-0.5 leading-none">
                Configure defensive endpoint before combat
              </p>
            </div>

            <div className="flex-1 flex flex-col gap-2 overflow-y-auto pr-1">
              {/* API Link input */}
              <div className="space-y-0.5">
                <label className="text-[9px] text-slate-350 uppercase font-bold block">
                  API Endpoint URL
                </label>
                <input
                  type="text"
                  value={apiLink}
                  onChange={(e) => setApiLink(e.target.value)}
                  placeholder="https://api.your-llm.com/v1"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:border-cyber-blue outline-none transition-colors"
                />
              </div>

              {/* API Key Input */}
              <div className="space-y-0.5">
                <label className="text-[9px] text-slate-350 uppercase font-bold block">
                  API Secret Key (sk-...)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:border-cyber-blue outline-none transition-colors font-sans"
                />
              </div>

              {/* Chatbot link input */}
              <div className="space-y-0.5">
                <label className="text-[9px] text-slate-350 uppercase font-bold block">
                  Chatbot Widget Link
                </label>
                <input
                  type="text"
                  value={chatbotLink}
                  onChange={(e) => setChatbotLink(e.target.value)}
                  placeholder="https://widget.chatbot-url.com/model"
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 focus:border-cyber-blue outline-none transition-colors font-sans"
                />
              </div>

              {/* Connection Status & Error Block */}
              <div className="flex flex-col gap-1 bg-slate-900/60 border border-slate-900 rounded p-1.5 mt-1 shrink-0">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-400 uppercase font-bold text-[9px]">STATE:</span>
                  <span className={`flex items-center gap-1.5 font-bold ${
                    connectionStatus === 'CONNECTED' 
                      ? 'text-emerald-500 font-black' 
                      : connectionStatus === 'CONNECTING' 
                        ? 'text-amber-500 animate-pulse' 
                        : 'text-cyber-red font-black text-glow-red'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      connectionStatus === 'CONNECTED' 
                        ? 'bg-emerald-500 animate-pulse' 
                        : connectionStatus === 'CONNECTING' 
                          ? 'bg-amber-500' 
                          : 'bg-cyber-red animate-pulse'
                    }`} />
                    {connectionStatus}
                  </span>
                </div>
                
                {/* Red Error Message View */}
                <AnimatePresence>
                  {validationError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="text-[9px] text-cyber-red border-t border-cyber-red/25 pt-1 mt-1 font-bold flex items-start gap-1 leading-snug font-mono-cyber text-glow-red"
                    >
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-cyber-red" />
                      <span>{validationError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Test & Initialize button */}
            <button
              onClick={handleTestConnection}
              disabled={connectionStatus === 'CONNECTING'}
              className="w-full py-1.5 rounded bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/40 hover:bg-cyber-blue/30 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all active:scale-98 disabled:opacity-50 shrink-0"
            >
              {connectionStatus === 'CONNECTING' ? 'PROBING HANDSHAKE...' : 'TEST & INITIALIZE NODE'}
            </button>
          </div>
        ) : (
          /* Normal Chat/Schemas Tab layout */
          <div className="flex-1 flex flex-col gap-2 font-mono-cyber min-h-0">
            <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 shrink-0">
              {/* Tabs */}
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`text-xs font-bold uppercase pb-1 transition-all cursor-pointer ${
                    activeTab === 'chat' 
                      ? 'text-cyber-blue border-b-2 border-cyber-blue' 
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  AI Chat Bot
                </button>
                <button
                  onClick={() => setActiveTab('schemas')}
                  className={`text-xs font-bold uppercase pb-1 transition-all cursor-pointer ${
                    activeTab === 'schemas' 
                      ? 'text-cyber-blue border-b-2 border-cyber-blue' 
                      : 'text-slate-500 hover:text-slate-350'
                  }`}
                >
                  Schemas
                </button>
              </div>
              {/* Active Connection URL display */}
              <span 
                className="text-[9px] text-slate-400 truncate max-w-[120px] font-sans hover:text-cyber-blue cursor-help"
                title={`Active API: ${apiLink}`}
              >
                {apiLink.replace('https://', '').replace('http://', '')}
              </span>
            </div>

            {activeTab === 'schemas' ? (
              /* Defensive Schemas List */
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {vectors.map((vec, idx) => {
                  const isActive = activeAction && activeAction.toLowerCase().includes(vec.toLowerCase());
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded border transition-all duration-300 flex items-center justify-between ${
                        isActive
                          ? `${accentBg} border-cyber-blue shadow-[0_0_10px_rgba(0,240,255,0.3)] text-white`
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-350 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 uppercase font-bold shrink-0">#{idx + 1}</span>
                        <span className="font-bold">{vec}</span>
                      </div>
                      {isActive && (
                        <span className="w-2 h-2 rounded-full animate-ping bg-cyber-blue shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Interactive Chatbot Panel */
              <div className="flex-1 flex flex-col bg-slate-950/80 border border-slate-900/60 rounded p-2 min-h-0 justify-between gap-2.5">
                {/* Messages display area */}
                <div ref={chatConsoleRef} className="flex-1 overflow-y-auto space-y-2 pr-1 text-[11px] max-h-[145px]">
                  {chatMessages.map((msg, idx) => {
                    const isSys = msg.sender === 'system';
                    const isUser = msg.sender === 'user';
                    if (isSys) {
                      return (
                        <div key={idx} className="text-center text-[9px] text-slate-500 uppercase tracking-wider py-0.5 border-b border-slate-900/50">
                          {msg.text}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={idx}
                        className={`flex flex-col max-w-[85%] rounded p-2 leading-tight ${
                          isUser 
                            ? 'bg-cyber-blue/20 border border-cyber-blue/40 text-cyan-150 self-end ml-auto' 
                            : 'bg-slate-900 border border-slate-800/80 text-slate-200 self-start mr-auto'
                        }`}
                      >
                        <span className="text-[8px] text-slate-500 uppercase font-bold mb-0.5">
                          {isUser ? 'USER PROMPT' : 'DEFENDER AI'}
                        </span>
                        <div className="break-words font-sans">{msg.text}</div>
                      </div>
                    );
                  })}
                </div>

                {/* Input section */}
                <div className="flex gap-1.5 border-t border-slate-900 pt-2 shrink-0">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Test defender prompt..."
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-250 placeholder-slate-600 outline-none focus:border-cyber-blue transition-colors font-sans"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-2.5 py-1 rounded bg-cyber-blue/20 text-cyber-blue hover:bg-cyber-blue/30 border border-cyber-blue/40 text-[10px] font-bold uppercase tracking-wider cursor-pointer shrink-0"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Active Action Display */}
      <div className={`p-3 rounded border font-mono-cyber transition-all bg-slate-950/80 ${accentBorder}`}>
        <div className="flex justify-between items-center mb-1">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">ACTIVE STATE</span>
          <span className={`flex items-center gap-1 text-[10px] font-bold ${isRed ? 'text-cyber-red animate-pulse' : 'text-cyber-blue'}`}>
            <Activity className="w-3.5 h-3.5" /> ONLINE
          </span>
        </div>
        <div className="h-6 flex items-center font-bold">
          <AnimatePresence mode="wait">
            {activeAction ? (
              <motion.div
                key={activeAction}
                initial={{ opacity: 0, x: isRed ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRed ? 10 : -10 }}
                className="text-xs text-white flex items-center gap-1.5 animate-pulse"
              >
                {isRed ? <AlertTriangle className="w-3.5 h-3.5 text-cyber-red shrink-0" /> : <Terminal className="w-3.5 h-3.5 text-cyber-blue shrink-0" />}
                {activeAction}
              </motion.div>
            ) : (
              <span className="text-xs text-slate-400 italic">SYSTEM IDLE // STANDBY</span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer Metrics */}
      <div className="flex justify-between items-center text-[11px] font-mono-cyber text-slate-400 border-t border-slate-900 pt-3">
        <span>LOGS: <strong className="text-slate-200">{logsCount}</strong></span>
        <span>NODE: <strong className="text-slate-200">ACTIVE</strong></span>
      </div>
    </div>
  );
};
