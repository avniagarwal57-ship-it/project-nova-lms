import React from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Globe,
  Network,
  Bot,
  Zap,
  Trophy,
  Users,
  User,
  PlusCircle,
  FileCheck2,
  ShieldAlert,
  Settings,
  Sparkles,
  BookOpen,
  X,
  Code2,
} from 'lucide-react';
import { playClickSound } from '../../utils/sound';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen, onClose }) => {
  const { user, soundEnabled } = useAuth();

  const handleNav = (tab: string) => {
    playClickSound(soundEnabled);
    setActiveTab(tab);
    onClose();
  };

  const navItemClass = (tab: string) => `
    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all group
    ${activeTab === tab
      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/25'
      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
    }
  `;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fadeIn"
        />
      )}

      {/* Sidebar aside */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-40 h-screen w-64 p-4 flex flex-col justify-between
          glass border-r border-slate-200/80 dark:border-slate-800/80 transition-transform duration-200 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col gap-5">
          {/* Top Brand Header */}
          <div className="flex items-center justify-between px-2 pt-2">
            <button
              onClick={() => handleNav('landing')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  NOVA<span className="text-cyan-500 dark:text-cyan-400"> Universe</span>
                </span>
              </div>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white md:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-210px)] pr-1">
            {/* Core Universe Navigation */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Command & Worlds
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNav('dashboard')}
                  className={navItemClass('dashboard')}
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-500" />
                  <span>Command Center</span>
                </button>
                <button
                  onClick={() => handleNav('worlds')}
                  className={navItemClass('worlds')}
                >
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>Learning Worlds</span>
                </button>
                <button
                  onClick={() => handleNav('skill-tree')}
                  className={navItemClass('skill-tree')}
                >
                  <Network className="w-4 h-4 text-emerald-400" />
                  <span>Skill Tree</span>
                </button>
                <button
                  onClick={() => handleNav('lesson-player')}
                  className={navItemClass('lesson-player')}
                >
                  <Code2 className="w-4 h-4 text-purple-400" />
                  <span>Learning Studio</span>
                </button>
              </nav>
            </div>

            {/* AI & Intelligence */}
            <div>
              <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500">
                Intelligence & Quests
              </div>
              <nav className="space-y-1">
                <button
                  onClick={() => handleNav('ai-mentor')}
                  className={`
                    flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${activeTab === 'ai-mentor'
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Bot className="w-4 h-4 text-violet-400" />
                    <span>NOVA AI Mentor</span>
                  </div>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400">
                    5 Modes
                  </span>
                </button>
                <button
                  onClick={() => handleNav('daily-challenges')}
                  className={navItemClass('daily-challenges')}
                >
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Daily Quests</span>
                </button>
                <button
                  onClick={() => handleNav('achievements')}
                  className={navItemClass('achievements')}
                >
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span>Achievements</span>
                </button>
                <button
                  onClick={() => handleNav('social-hub')}
                  className={navItemClass('social-hub')}
                >
                  <Users className="w-4 h-4 text-sky-400" />
                  <span>Social Hub</span>
                </button>
              </nav>
            </div>

            {/* Instructor / Admin Section */}
            {(user?.role === 'instructor' || user?.role === 'admin') && (
              <div>
                <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>Instructor Studio</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold uppercase">
                    Creator
                  </span>
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => handleNav('instructor')}
                    className={navItemClass('instructor')}
                  >
                    <FileCheck2 className="w-4 h-4 text-purple-400" />
                    <span>Instructor Control</span>
                  </button>
                  <button
                    onClick={() => handleNav('course-creator')}
                    className={navItemClass('course-creator')}
                  >
                    <PlusCircle className="w-4 h-4 text-pink-400" />
                    <span>Quest Builder</span>
                  </button>
                </nav>
              </div>
            )}

            {/* Admin Center */}
            {user?.role === 'admin' && (
              <div>
                <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 flex items-center justify-between">
                  <span>Universe Admin</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold uppercase">
                    Overseer
                  </span>
                </div>
                <nav className="space-y-1">
                  <button
                    onClick={() => handleNav('admin')}
                    className={navItemClass('admin')}
                  >
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span>Admin Control Center</span>
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Preferences & User Card */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <button
            onClick={() => handleNav('settings')}
            className={navItemClass('settings')}
          >
            <Settings className="w-4 h-4 text-slate-400" />
            <span>Settings & AI Keys</span>
          </button>

          {user && (
            <div
              onClick={() => handleNav('profile')}
              className="flex items-center gap-3 p-2 rounded-xl bg-slate-100/70 dark:bg-slate-800/40 hover:bg-slate-200/70 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-cyan-500/30"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user.name}
                </div>
                <div className="text-[10px] text-cyan-600 dark:text-cyan-400 font-semibold truncate">
                  {user.rankTitle || 'Cadet'} • LVL {user.level}
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
