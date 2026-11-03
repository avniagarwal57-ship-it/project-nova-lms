import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Flame,
  Zap,
  Award,
  Globe,
  ArrowRight,
  CheckCircle2,
  Bot,
  Layers,
  Network,
  Star,
  Compass,
  Play,
  Cpu,
  Terminal,
  Palette,
  Briefcase,
  Atom,
} from 'lucide-react';
import { playSuccessSound } from '../utils/sound';

interface LandingPageProps {
  setActiveTab: (tab: string) => void;
  onExploreCourse: (courseId: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ setActiveTab, onExploreCourse }) => {
  const { user, soundEnabled } = useAuth();

  const handleStart = () => {
    playSuccessSound(soundEnabled);
    if (user) {
      setActiveTab('dashboard');
    } else {
      setActiveTab('auth');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-hidden selection:bg-cyan-500 selection:text-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-24 md:pb-32">
        {/* Ambient Cosmic Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-tr from-cyan-500/15 via-indigo-600/20 to-violet-500/15 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute -left-40 top-1/3 w-[500px] h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Futuristic Pill Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/40 text-cyan-400 text-xs font-extrabold uppercase tracking-widest shadow-lg shadow-cyan-500/10 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>PROJECT NOVA • Next-Generation Learning Universe</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Where Learning is an Adventure, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400">
              and Knowledge is Planetary Power.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Enter an intelligent, gamified learning cosmos. Conquer multi-stage quests, unlock connected skill trees, spar with your personal AI mentor, and advance from beginner cadet to universe master.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto pt-2">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 hover:scale-105 shadow-xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 group text-base"
            >
              <span>{user ? 'Enter Command Center' : 'Launch Your Odyssey'}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setActiveTab('worlds')}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 shadow-sm transition-all text-base flex items-center justify-center gap-2"
            >
              <Globe className="w-5 h-5 text-cyan-400" />
              <span>Explore 7 Worlds</span>
            </button>
          </div>

          {/* Planetary Telemetry Counters */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-400 font-bold">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" />
              <span>7 Planetary Worlds</span>
            </div>
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-400" />
              <span>Interactive Skill Trees</span>
            </div>
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Celestial Streaks</span>
            </div>
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-violet-400" />
              <span>5 AI Mentor Modes</span>
            </div>
          </div>
        </div>
      </section>

      {/* The 7 Learning Worlds Showcase */}
      <section className="py-20 relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
            Celestial Categories
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            The Seven Learning Worlds
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Not ordinary course categories. Each world has its own identity, skill progression trees, and rewards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[
            { title: 'Programming World', icon: Terminal, color: '#38bdf8', desc: 'Algorithms, TypeScript, Rust, and systems architecture.' },
            { title: 'Technology World', icon: Cpu, color: '#818cf8', desc: 'Autonomous AI, cloud fabrics, vector DBs, and cyber defense.' },
            { title: 'Design World', icon: Palette, color: '#f43f5e', desc: 'Spatial UI, generative interfaces, and fluid micro-interactions.' },
            { title: 'Business World', icon: Briefcase, color: '#10b981', desc: 'Venture architecture, unit economics, and exponential growth.' },
            { title: 'Science World', icon: Atom, color: '#a855f7', desc: 'Astrophysics, neuro-computation, and synthetic biology.' },
            { title: 'Personal Development World', icon: Sparkles, color: '#f59e0b', desc: 'Peak cognitive flow states, mental models, and deep focus.' },
            { title: 'Language World', icon: Globe, color: '#06b6d4', desc: 'Neural linguistics, polyglot protocols, and global fluency.' },
          ].map((w, i) => {
            const Icon = w.icon;
            return (
              <div
                key={i}
                onClick={() => setActiveTab('worlds')}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/50 backdrop-blur-md shadow-lg transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border"
                    style={{ backgroundColor: `${w.color}20`, borderColor: `${w.color}40`, color: w.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-extrabold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {w.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {w.desc}
                  </p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-800 text-xs font-bold text-cyan-400 flex items-center justify-between">
                  <span>Enter World</span>
                  <span>→</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pillars of NOVA: Skill Trees, AI Mentors, Quests */}
      <section className="py-16 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-violet-400">
              Ecosystem Architecture
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Built Different. Never a Boring Dashboard.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Network className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">Interactive Skill Trees</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Track mastery visually across connected nodes. Identify prerequisite gaps before launching complex missions.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 text-violet-400 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">NOVA AI Mentor (5 Modes)</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Explain Mode, Practice Mode, Challenge Mode, Revision Mode, and Exam Mode with intelligent pedagogical reasoning.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <Terminal className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-extrabold text-white">6-Stage Quest Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                From concept discovery and visual diagrams to live coding sandboxes and adaptive evaluation duels.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="py-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="p-10 sm:p-14 rounded-3xl bg-gradient-to-r from-cyan-950 via-slate-900 to-indigo-950 border border-cyan-500/40 shadow-2xl relative overflow-hidden space-y-6">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Begin Your Cosmic Ascent?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join thousands of visionary learners exploring the next generation of knowledge.
          </p>
          <button
            onClick={handleStart}
            className="px-8 py-4 rounded-2xl font-extrabold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl shadow-cyan-400/40 transition-all text-sm inline-flex items-center gap-2 hover:scale-105"
          >
            <span>Enter the Universe Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
