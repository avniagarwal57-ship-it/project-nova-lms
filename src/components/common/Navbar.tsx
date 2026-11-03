import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Flame,
  Zap,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Shield,
  GraduationCap,
  Sparkles,
  Menu,
  Compass,
  Trophy,
  BookOpen,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, activeTab, setActiveTab }) => {
  const { user, theme, toggleTheme, soundEnabled, toggleSound, switchRole } = useAuth();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white md:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
                  NOVA<span className="text-cyan-500 dark:text-cyan-400">.</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-widest rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400">
                  Universe
                </span>
              </div>
            </div>
          </button>
        </div>

        {/* Center: Live Gamification Stats Bar */}
        {user && (
          <div className="hidden sm:flex items-center gap-3">
            {/* Streak Counter */}
            <div
              title="Current Daily Learning Streak! Keep the celestial flame burning."
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-xs font-bold shadow-sm"
            >
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse-subtle" />
              <span>{user.streakDays} Day Streak</span>
            </div>

            {/* Total XP Counter */}
            <div
              title="Total Experience Points earned through quests, coding sandboxes, and challenges."
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm"
            >
              <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>{user.xp} XP</span>
            </div>

            {/* Level Indicator */}
            <div
              title={`Level ${user.level} ${user.rankTitle || 'Cadet'}.`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold shadow-sm"
            >
              <Compass className="w-4 h-4 text-indigo-500" />
              <span>LVL {user.level} • {user.rankTitle || 'Cadet'}</span>
            </div>
          </div>
        )}

        {/* Right Controls: Role Switcher, Sound, Theme, User Avatar */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Persona Switcher for Quick Evaluator Role Toggle */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors"
              title="Switch demo persona (Learner, Instructor, Admin)"
            >
              {user?.role === 'admin' ? (
                <Shield className="w-3.5 h-3.5 text-rose-500" />
              ) : user?.role === 'instructor' ? (
                <BookOpen className="w-3.5 h-3.5 text-purple-500" />
              ) : (
                <GraduationCap className="w-3.5 h-3.5 text-cyan-500" />
              )}
              <span className="capitalize hidden md:inline">{user?.role || 'Role'}</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 py-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 text-xs animate-fadeIn">
                <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Switch Active Persona
                </div>
                <button
                  onClick={() => {
                    switchRole('learner');
                    setRoleMenuOpen(false);
                    setActiveTab('dashboard');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-cyan-50 dark:hover:bg-cyan-950/40 ${
                    user?.role === 'learner' ? 'text-cyan-600 dark:text-cyan-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <GraduationCap className="w-4 h-4 text-cyan-500" />
                  <div>
                    <div>Alex Rivers</div>
                    <div className="text-[10px] text-slate-400 font-normal">Learner / Void Navigator</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    switchRole('instructor');
                    setRoleMenuOpen(false);
                    setActiveTab('instructor');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-950/40 ${
                    user?.role === 'instructor' ? 'text-purple-600 dark:text-purple-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-purple-500" />
                  <div>
                    <div>Dr. Sarah Chen</div>
                    <div className="text-[10px] text-slate-400 font-normal">Instructor / World Architect</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    switchRole('admin');
                    setRoleMenuOpen(false);
                    setActiveTab('admin');
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 dark:hover:bg-rose-950/40 ${
                    user?.role === 'admin' ? 'text-rose-600 dark:text-rose-400 font-bold' : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Shield className="w-4 h-4 text-rose-500" />
                  <div>
                    <div>Marcus Vance</div>
                    <div className="text-[10px] text-slate-400 font-normal">NOVA Overseer & Admin</div>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Audio Effect Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute game sound effects' : 'Enable game sound effects'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={soundEnabled ? 'Mute audio cues' : 'Enable audio cues'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Dark / Light Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* User Profile Avatar */}
          {user ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-2 pl-1 group"
              title="Command Dossier & Profile"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-500/40 group-hover:ring-cyan-400 transition-all"
              />
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('auth')}
              className="px-3.5 py-1.5 text-xs font-bold text-white bg-cyan-600 hover:bg-cyan-500 rounded-xl transition-all shadow-md shadow-cyan-600/30"
            >
              Enter Universe
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
