import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles, GraduationCap, BookOpen, Shield, ArrowRight, UserPlus, LogIn, Check, Compass } from 'lucide-react';
import { playSuccessSound } from '../utils/sound';

interface AuthPageProps {
  setActiveTab: (tab: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ setActiveTab }) => {
  const { login, signup, soundEnabled } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'learner' | 'instructor' | 'admin'>('learner');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        if (!name.trim() || !email.trim()) {
          setError('Please provide your name and email');
          setLoading(false);
          return;
        }
        const success = await signup(name, email, role);
        if (success) {
          playSuccessSound(soundEnabled);
          setActiveTab('dashboard');
        } else {
          setError('Failed to create account. Please try again.');
        }
      } else {
        if (!email.trim()) {
          setError('Please enter your email');
          setLoading(false);
          return;
        }
        const success = await login(email);
        if (success) {
          playSuccessSound(soundEnabled);
          setActiveTab('dashboard');
        } else {
          setError('User not found. Try one of the demo quick-logins below!');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (targetRole: 'learner' | 'instructor' | 'admin') => {
    setLoading(true);
    await login(undefined, targetRole);
    playSuccessSound(soundEnabled);
    if (targetRole === 'instructor') {
      setActiveTab('instructor');
    } else if (targetRole === 'admin') {
      setActiveTab('admin');
    } else {
      setActiveTab('dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 animate-fadeIn">
        {/* Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-violet-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-cyan-500/30 mb-4">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-white">
            {isSignup ? 'Enlist in PROJECT NOVA' : 'Welcome to the Universe'}
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            {isSignup
              ? 'Join our gamified learning cosmos today'
              : 'Command Center access protocol'}
          </p>
        </div>

        {/* Demo Fast-Login Cards for Instant Access */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 backdrop-blur-md shadow-xl">
          <div className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 mb-3 text-center">
            ⚡ Instant Persona Access (1-Click Evaluation)
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('learner')}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-center transition-all group flex flex-col items-center"
            >
              <GraduationCap className="w-5 h-5 text-cyan-400 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Alex Rivers</div>
              <div className="text-[10px] text-cyan-400">Learner</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('instructor')}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-center transition-all group flex flex-col items-center"
            >
              <BookOpen className="w-5 h-5 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Dr. Sarah Chen</div>
              <div className="text-[10px] text-purple-400">Instructor</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-center transition-all group flex flex-col items-center"
            >
              <Shield className="w-5 h-5 text-rose-400 mb-1 group-hover:scale-110 transition-transform" />
              <div className="text-xs font-bold text-white">Marcus Vance</div>
              <div className="text-[10px] text-rose-400">Universe Admin</div>
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl backdrop-blur-md">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Explorer Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Commander Sarah Connor"
                  className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs sm:text-sm"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Terminal Identifier (Email)
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="cadet@nova.universe"
                className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs sm:text-sm"
              />
            </div>

            {isSignup && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Ecosystem Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('learner')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      role === 'learner'
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Learner / Cadet
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('instructor')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      role === 'instructor'
                        ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    Instructor / World Creator
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 px-4 rounded-xl font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 shadow-lg shadow-cyan-400/30 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
            >
              {loading ? (
                <span>Calibrating...</span>
              ) : (
                <>
                  {isSignup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                  <span>{isSignup ? 'Establish Neural ID' : 'Authenticate & Enter'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignup(!isSignup)}
              className="text-xs font-bold text-cyan-400 hover:underline"
            >
              {isSignup
                ? 'Already have an ID? Enter Command Center'
                : "Don't have an ID yet? Enlist in NOVA free"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
