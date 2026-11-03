import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Zap,
  Gift,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Shield,
  Calendar,
  Layers,
  ArrowRight,
  Star,
} from 'lucide-react';
import { DailyChallenge } from '../types';
import { playSuccessSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

export const DailyChallengesPage: React.FC = () => {
  const { user, soundEnabled, updateUserXpLocally } = useAuth();
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    try {
      const res = await fetch('/api/gamification/dashboard');
      if (res.ok) {
        const data = await res.json();
        setChallenges(data.challenges || []);
      }
    } catch (err) {
      console.error('Failed to load challenges:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id: string) => {
    try {
      const res = await fetch(`/api/gamification/claim-challenge/${id}`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        playSuccessSound(soundEnabled);
        triggerConfetti();

        setChallenges(prev =>
          prev.map(c => (c.id === id ? { ...c, claimed: true } : c))
        );

        if (data.user) {
          updateUserXpLocally(data.xpAdded, false, data.user.level);
        }
      }
    } catch (err) {
      console.error('Failed to claim:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400 font-extrabold text-xs uppercase tracking-widest">
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>Daily Quests & Weekly Milestones</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Expedition Objectives
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Complete high-velocity daily learning tasks to maintain your cosmic streak and supercharge your XP ascent.
          </p>
        </div>

        {/* Streak & Freeze Status */}
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center gap-3">
            <Flame className="w-8 h-8 fill-orange-500 text-orange-500 animate-pulse-subtle" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Streak Active</span>
              <span className="text-xl font-extrabold text-white">{user?.streakDays || 1} Days</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-3">
            <Shield className="w-8 h-8 text-cyan-400" />
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Streak Freezes</span>
              <span className="text-xl font-extrabold text-white">{user?.streakFreezes || 2} Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Challenges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {challenges.map(ch => (
          <div
            key={ch.id}
            className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="text-lg font-extrabold text-white">{ch.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{ch.description}</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                  +{ch.xpReward} XP
                </span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-slate-400 font-semibold">
                  <span>Objective Progress</span>
                  <span className="text-cyan-400">{ch.current} / {ch.goal}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      ch.completed ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-cyan-500'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.round((ch.current / ch.goal) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Action State */}
            <div className="pt-2">
              {ch.completed ? (
                ch.claimed ? (
                  <div className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Reward Claimed (+{ch.xpReward} XP)</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaim(ch.id)}
                    className="w-full py-3 rounded-xl font-extrabold text-slate-950 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/30 text-xs transition-all flex items-center justify-center gap-2 animate-pulse-subtle"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Claim +{ch.xpReward} XP Reward!</span>
                  </button>
                )
              ) : (
                <div className="text-xs text-slate-500 italic">In progress today...</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Weekly Boss Challenge Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-slate-900 to-indigo-950/70 border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Weekly Grand Milestone
            </span>
            <h2 className="text-2xl font-extrabold text-white">
              The Vector Synthesis Trial
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Complete 3 consecutive quest stages and achieve 90%+ on any 2 knowledge duels before Sunday 23:59 UTC to unlock the legendary <strong>Orbital Fabricator</strong> badge!
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-3xl font-extrabold text-amber-400 block">+500 Bonus XP</span>
            <span className="text-xs text-slate-400">Time Remaining: 3d 14h</span>
          </div>
        </div>
      </div>
    </div>
  );
};
