import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Zap,
  Award,
  Clock,
  Play,
  CheckCircle2,
  Gift,
  ArrowRight,
  TrendingUp,
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Star,
  Compass,
  Radio,
  Target,
  Layers,
  Cpu,
  Bot,
} from 'lucide-react';
import { Course, Lesson, DailyChallenge, Achievement, SystemStats, SkillRadarItem } from '../types';
import { playSuccessSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';
import { SkillRadarChart } from '../components/common/SkillRadarChart';

interface DashboardPageProps {
  setActiveTab: (tab: string) => void;
  onSelectCourse: (courseId: string) => void;
  onStartLesson: (courseId: string, lessonId: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  setActiveTab,
  onSelectCourse,
  onStartLesson,
}) => {
  const { user, soundEnabled, updateUserXpLocally } = useAuth();
  const [loading, setLoading] = useState(true);
  const [continueCourse, setContinueCourse] = useState<Course | null>(null);
  const [continueLesson, setContinueLesson] = useState<Lesson | null>(null);
  const [dailyChallenges, setDailyChallenges] = useState<DailyChallenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([]);
  const [radarData, setRadarData] = useState<SkillRadarItem[]>([]);
  const [radarInsights, setRadarInsights] = useState<any>(null);
  const [dailyDiscovery, setDailyDiscovery] = useState<any>(null);
  const [claimedDiscovery, setClaimedDiscovery] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, coursesRes, radarRes] = await Promise.all([
        fetch('/api/gamification/dashboard'),
        fetch('/api/courses'),
        fetch('/api/intelligence/radar'),
      ]);

      if (dashRes.ok) {
        const data = await dashRes.json();
        setContinueCourse(data.continueCourse);
        setContinueLesson(data.continueLesson);
        setDailyChallenges(data.challenges || []);
        setAchievements(data.achievements || []);
        setStats(data.stats);
        setDailyDiscovery(data.dailyDiscovery);
      }

      if (coursesRes.ok) {
        const coursesData = await coursesRes.json();
        setRecommendedCourses(coursesData.courses || []);
      }

      if (radarRes.ok) {
        const rData = await radarRes.json();
        setRadarData(rData.radar || []);
        setRadarInsights(rData.insights || null);
      }
    } catch (err) {
      console.error('Failed to load command center:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimChallenge = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/gamification/claim-challenge/${challengeId}`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        playSuccessSound(soundEnabled);
        triggerConfetti();

        setDailyChallenges(prev =>
          prev.map(c => (c.id === challengeId ? { ...c, claimed: true } : c))
        );

        if (data.user) {
          updateUserXpLocally(data.xpAdded, false, data.user.level);
        }
      }
    } catch (err) {
      console.error('Failed to claim challenge:', err);
    }
  };

  const handleClaimDiscovery = () => {
    if (claimedDiscovery) return;
    setClaimedDiscovery(true);
    playSuccessSound(soundEnabled);
    triggerConfetti();
    updateUserXpLocally(35, false, user?.level || 1);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning, Commander';
    if (hour < 18) return 'Good Afternoon, Commander';
    return 'Good Evening, Commander';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  // Level & XP math
  const currentLvl = user?.level || 1;
  const currentXp = user?.xp || 0;
  const nextLvlXp = currentLvl * 300;
  const prevLvlXp = (currentLvl - 1) * 300;
  const levelProgress = Math.min(
    100,
    Math.round(((currentXp - prevLvlXp) / (nextLvlXp - prevLvlXp)) * 100)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* ======================================================== */}
      {/* 1. WELCOME SECTION & COMMAND HEADER                      */}
      {/* ======================================================== */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900/90 via-indigo-950/60 to-cyan-950/50 border border-cyan-500/30 backdrop-blur-xl relative overflow-hidden shadow-2xl shadow-cyan-950/20">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-40 -top-20 w-60 h-60 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-start gap-4 sm:gap-6">
          <div className="relative">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-cyan-500/60 shadow-lg"
            />
            <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-slate-950/90 border border-cyan-500 text-[10px] font-extrabold text-cyan-400">
              LVL {currentLvl}
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-widest">
              <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Learner Command Center • {user?.rankTitle || 'Void Navigator III'}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {getGreeting()} {user?.name.split(' ')[0] || 'Cadet'}!
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Orbiting <span className="text-cyan-400 font-bold">Programming World</span>. You are on an active{' '}
              <strong className="text-orange-400">{user?.streakDays || 1}-day streak</strong>! Complete today's missions to earn{' '}
              <span className="text-amber-400 font-extrabold">+150 XP bonus</span>.
            </p>
          </div>
        </div>

        {/* Quick Launch Buttons */}
        <div className="relative z-10 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('worlds')}
            className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-600/25 transition-all flex items-center gap-2"
          >
            <Compass className="w-4 h-4 text-white" />
            <span>Explore Worlds</span>
          </button>
          <button
            onClick={() => setActiveTab('skill-tree')}
            className="px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 transition-all flex items-center gap-2"
          >
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Skill Tree</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. LIVE TELEMETRY CARDS (Streak, XP, Daily Goal, League) */}
      {/* ======================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Streak Card */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-orange-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-500 animate-pulse-subtle" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Celestial Streak</div>
            <div className="text-2xl font-extrabold text-white">
              {user?.streakDays || 1} Days
            </div>
            <div className="text-[11px] text-orange-400 font-medium">
              🛡️ {user?.streakFreezes || 2} Freezes Active
            </div>
          </div>
        </div>

        {/* Total XP & Progress */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-slate-400">Total Experience</span>
            </div>
            <span className="text-xs font-extrabold text-cyan-400">LVL {currentLvl}</span>
          </div>
          <div className="text-2xl font-extrabold text-white mb-2">
            {currentXp} XP
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.max(8, levelProgress)}%` }}
            />
          </div>
          <div className="mt-1 text-[10px] text-slate-400 text-right">
            {nextLvlXp - currentXp > 0 ? `${nextLvlXp - currentXp} XP to Level ${currentLvl + 1}` : 'Max Tier'}
          </div>
        </div>

        {/* Daily Study Objective */}
        <div className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-400">Daily Study Target</div>
            <div className="text-2xl font-extrabold text-white">
              {user?.dailyGoalMinutesCompleted || 20} / {user?.dailyGoalMinutes || 25}m
            </div>
            <div className="text-[11px] text-emerald-400 font-semibold">
              80% Completed Today
            </div>
          </div>
        </div>

        {/* Global League Rank */}
        <div
          onClick={() => setActiveTab('achievements')}
          className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 backdrop-blur-md shadow-lg flex items-center justify-between cursor-pointer group transition-all"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400">Orbital League</div>
              <div className="text-2xl font-extrabold text-white">
                Gold Tier
              </div>
              <div className="text-[11px] text-cyan-400 font-bold group-hover:underline">
                Rank #4 • Top 5% Global
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MISSION CONTROL: ACTIVE LEARNING QUEST HERO           */}
      {/* ======================================================== */}
      {continueCourse && continueLesson && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-cyan-950/70 via-indigo-950/80 to-purple-950/70 text-white shadow-2xl shadow-cyan-950/30 border border-cyan-500/30 relative overflow-hidden group">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>Active Mission in Progress</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {continueCourse.title}
              </h2>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Mission: {continueLesson.title}
                </span>
                <span>•</span>
                <span className="text-amber-400 font-bold">+{continueLesson.xpReward} XP Reward</span>
                <span>•</span>
                <span>{continueLesson.durationMinutes} Mins Est.</span>
              </div>
            </div>

            <button
              onClick={() => onStartLesson(continueCourse.id, continueLesson.id)}
              className="px-8 py-4 rounded-2xl font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 shadow-xl shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 shrink-0 group-hover:scale-105"
            >
              <Play className="w-5 h-5 fill-slate-950 text-slate-950" />
              <span>Continue Mission</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. SKILL RADAR & PERSONAL INTELLIGENCE SECTION           */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Visual Skill Radar */}
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4" />
                <span>Personal Skill Radar</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">Competency Multi-Axis</h3>
            </div>
            <button
              onClick={() => setActiveTab('skill-tree')}
              className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>Inspect Skill Tree</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="py-4 flex justify-center">
            <SkillRadarChart data={radarData} size={320} />
          </div>

          {/* Radar Insights Footer */}
          {radarInsights && (
            <div className="pt-4 border-t border-slate-800 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Strongest Domain</span>
                <span className="font-extrabold text-emerald-400">{radarInsights.strongestSkill}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Growth Area</span>
                <span className="font-extrabold text-amber-400">{radarInsights.skillToImprove}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Learning Velocity</span>
                <span className="font-extrabold text-cyan-400">{radarInsights.learningConsistency}</span>
              </div>
            </div>
          )}
        </div>

        {/* Daily Discovery & AI Mentor Quick Sparring */}
        <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
          {/* Daily Discovery Capsule */}
          {dailyDiscovery && (
            <div className="p-6 rounded-3xl bg-gradient-to-br from-violet-950/60 via-slate-900/80 to-slate-900 border border-violet-500/30 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-violet-400 font-extrabold text-xs uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                  <span>Daily Discovery Capsule</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-300">
                  {dailyDiscovery.readTime}
                </span>
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-white mb-1">
                  {dailyDiscovery.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {dailyDiscovery.preview}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">+{dailyDiscovery.xpReward} XP Reward</span>
                {claimedDiscovery ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Discovery Unlocked
                  </span>
                ) : (
                  <button
                    onClick={handleClaimDiscovery}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/30 transition-all flex items-center gap-1.5"
                  >
                    <span>Read & Claim +{dailyDiscovery.xpReward} XP</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Quick AI Sparring Hook */}
          <div
            onClick={() => setActiveTab('ai-mentor')}
            className="p-6 rounded-3xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/30 backdrop-blur-md shadow-xl cursor-pointer hover:border-cyan-400 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <span>NOVA AI Mentor</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20">Ready</span>
                </div>
                <h4 className="text-sm font-extrabold text-white">
                  Got stuck or need a step-by-step breakdown?
                </h4>
                <p className="text-xs text-slate-400">
                  Switch to Explain, Practice, or Challenge Mode with your personal tutor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. DAILY CHALLENGES & WEEKLY ACTIVITY GRAPH             */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Daily Challenges Column */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Gift className="w-5 h-5 text-cyan-400" />
              <span>Daily Quests</span>
            </h3>
            <span className="text-xs text-slate-400">Resets in 7h 40m</span>
          </div>

          <div className="space-y-3">
            {dailyChallenges.map(challenge => (
              <div
                key={challenge.id}
                className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {challenge.title}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {challenge.description}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 shrink-0">
                    +{challenge.xpReward} XP
                  </span>
                </div>

                {/* Progress bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-400">
                    <span>Progress</span>
                    <span>
                      {challenge.current} / {challenge.goal}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        challenge.completed ? 'bg-emerald-400' : 'bg-cyan-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((challenge.current / challenge.goal) * 100))}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Action button */}
                {challenge.completed ? (
                  challenge.claimed ? (
                    <div className="w-full py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Reward Claimed</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleClaimChallenge(challenge.id)}
                      className="w-full py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 text-xs font-extrabold shadow-md transition-all flex items-center justify-center gap-1.5 animate-pulse-subtle"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Claim +{challenge.xpReward} XP Reward!</span>
                    </button>
                  )
                ) : (
                  <div className="text-[11px] text-slate-500 italic">In progress...</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Activity & Study Analytics */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              <span>Weekly Learning Velocity</span>
            </h3>
            <span className="text-xs text-cyan-400 font-semibold">
              This Week: 22.7 Active Hours
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 shadow-sm space-y-6">
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6">
              {stats?.weeklyActivity?.map(item => {
                const maxHours = 5;
                const heightPercent = Math.min(100, Math.round((item.hours / maxHours) * 100));
                return (
                  <div key={item.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.hours}h
                    </div>
                    <div className="w-full max-w-[40px] bg-slate-800 rounded-xl overflow-hidden h-32 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-cyan-600 via-indigo-600 to-violet-500 rounded-xl transition-all duration-500 group-hover:from-cyan-400 group-hover:to-pink-500"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-400">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="w-3 h-3 rounded bg-cyan-500 inline-block" />
                <span>Active Study Time (hours per day)</span>
              </div>
              <div className="text-emerald-400 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+28% higher velocity than platform average</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. RECOMMENDED MISSIONS ACROSS WORLDS                   */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-white">
              Recommended Expeditions
            </h3>
            <p className="text-xs text-slate-400">
              Curated quests based on your current skill radar and trajectory
            </p>
          </div>
          <button
            onClick={() => setActiveTab('worlds')}
            className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>View All Worlds</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recommendedCourses.slice(0, 3).map(course => (
            <div
              key={course.id}
              onClick={() => onSelectCourse(course.id)}
              className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 shadow-sm hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="relative h-36 rounded-2xl overflow-hidden mb-3">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-2 left-2 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-950/85 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                    {course.level}
                  </span>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-950/85 text-amber-400 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    {course.rating}
                  </span>
                </div>
                <div className="text-[11px] font-bold text-cyan-400 mb-1">
                  {course.category}
                </div>
                <h4 className="text-sm font-extrabold text-white line-clamp-1 mb-1 group-hover:text-cyan-400 transition-colors">
                  {course.title}
                </h4>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {course.shortDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{course.durationMinutes} mins</span>
                <span className="font-bold text-cyan-400 flex items-center gap-1">
                  Launch Quest <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
