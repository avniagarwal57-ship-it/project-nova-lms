import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Bot,
  Send,
  Sparkles,
  Zap,
  HelpCircle,
  BookOpen,
  Calendar,
  Layers,
  Code,
  ShieldAlert,
  Info,
  CheckCircle2,
  Copy,
  Check,
  Award,
  Terminal,
} from 'lucide-react';
import { playXpSound } from '../utils/sound';

interface Message {
  role: 'user' | 'assistant';
  text: string;
  source?: string;
  mode?: string;
}

export const AiTutorPage: React.FC = () => {
  const { user, soundEnabled } = useAuth();
  const [selectedMode, setSelectedMode] = useState<'explain' | 'practice' | 'challenge' | 'revision' | 'exam'>('explain');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: `Greetings Commander ${user?.name.split(' ')[0] || 'Cadet'}! I am **NOVA Mentor**, your personal learning companion across the universe.

I feature **5 dedicated intelligence modes**:
- 💡 **Explain Mode:** Understand any topic step-by-step with vivid analogies.
- 🎯 **Practice Mode:** Interactive exercises with guided, progressive hints.
- ⚔️ **Challenge Mode:** Real-time knowledge duel against me to test your limits.
- 🔄 **Revision Mode:** Spaced-repetition recall of earlier missions and formulas.
- 📋 **Exam Mode:** Proctored timed simulation with rubric scoring.

Select a mode above or ask me anything to begin!`,
      source: 'smart-engine',
      mode: 'explain',
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLiveGemini, setIsLiveGemini] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    checkSettings();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const checkSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        setIsLiveGemini(data.hasGeminiKey);
      }
    } catch (err) {
      console.error('Failed to check settings:', err);
    }
  };

  const handleSend = async (userPrompt?: string, modeOverride?: string) => {
    const textToSend = userPrompt || prompt;
    if (!textToSend.trim()) return;

    const mode = (modeOverride || selectedMode) as any;
    const newMsg: Message = { role: 'user', text: textToSend, mode };
    setMessages(prev => [...prev, newMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          mode,
          courseTitle: 'Full-Stack AI Engineering & Distributed Systems',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        playXpSound(soundEnabled);
        setMessages(prev => [
          ...prev,
          { role: 'assistant', text: data.reply, source: data.source, mode: data.mode },
        ]);
        if (data.source === 'gemini-live') {
          setIsLiveGemini(true);
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          text: 'Encountered a celestial transmission error. Please re-send your query!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Top Banner & Status Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-950/70 via-slate-900 to-indigo-950/70 border border-violet-500/30 backdrop-blur-xl shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-violet-500/30 shrink-0">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                NOVA AI Mentor
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Cognitive Companion
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Intelligent multi-mode tutor adapting explanations, generating practice challenges, and identifying knowledge gaps.
            </p>
          </div>
        </div>

        {/* Engine Status Pill */}
        <div className="shrink-0">
          {isLiveGemini ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Gemini Live Engine Active</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold shadow-sm" title="Configure GEMINI_API_KEY in Settings for live LLM API">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Smart Context Engine (Demo Mode)</span>
            </div>
          )}
        </div>
      </div>

      {/* 5 Learning Modes Selector Tabs */}
      <div className="p-2 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { id: 'explain', label: 'Explain Mode', icon: '💡', desc: 'Step-by-step breakdown' },
          { id: 'practice', label: 'Practice Mode', icon: '🎯', desc: 'Exercises with hints' },
          { id: 'challenge', label: 'Challenge Mode', icon: '⚔️', desc: 'Knowledge duel' },
          { id: 'revision', label: 'Revision Mode', icon: '🔄', desc: 'Spaced repetition' },
          { id: 'exam', label: 'Exam Mode', icon: '📋', desc: 'Simulated assessment' },
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setSelectedMode(mode.id as any)}
            className={`p-3 rounded-xl text-left transition-all ${
              selectedMode === mode.id
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-600/30 scale-[1.02]'
                : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs font-extrabold mb-0.5">
              <span>{mode.icon}</span>
              <span>{mode.label}</span>
            </div>
            <div className="text-[10px] opacity-80 truncate">{mode.desc}</div>
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl min-h-[440px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/30">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed space-y-2 relative group ${
                  isUser
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                    : 'bg-slate-800/90 border border-slate-700/80 text-slate-200 shadow-md'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-700/50 text-[10px] text-slate-400 font-mono">
                    <span className="uppercase font-bold text-violet-400">
                      NOVA Mentor • {msg.mode?.toUpperCase() || 'ASSISTANT'}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.text, index)}
                      className="p-1 hover:text-white"
                      title="Copy response"
                    >
                      {copiedIdx === index ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>
                )}

                <div className="whitespace-pre-line prose prose-invert max-w-none text-xs sm:text-sm">
                  {msg.text}
                </div>
              </div>

              {isUser && (
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-violet-500/40 shrink-0"
                />
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 justify-start items-center">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/30">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs italic flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
              <span>NOVA Mentor is processing coordinates and formulating explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Capability Prompt Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {[
          { label: '💡 Explain Vector Embeddings with an analogy', mode: 'explain' },
          { label: '🎯 Practice: Give me an interactive challenge with hints', mode: 'practice' },
          { label: '⚔️ Challenge me with an architectural knowledge duel', mode: 'challenge' },
          { label: '🔄 Revision: Test my retention of earlier concepts', mode: 'revision' },
          { label: '📋 Start a 15-minute simulated exam assessment', mode: 'exam' },
        ].map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip.label, chip.mode)}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/50 text-slate-300 hover:text-white shrink-0 text-[11px] font-semibold transition-all"
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="flex gap-3 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
        <input
          type="text"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={`Ask NOVA Mentor in ${selectedMode.toUpperCase()} mode...`}
          className="flex-1 px-4 py-3 bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !prompt.trim()}
          className={`px-6 py-3 rounded-xl font-extrabold text-white text-xs flex items-center gap-2 transition-all ${
            loading || !prompt.trim()
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-600/30 hover:scale-105'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Transmit</span>
        </button>
      </div>
    </div>
  );
};
