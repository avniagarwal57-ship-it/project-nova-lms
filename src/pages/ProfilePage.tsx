import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Flame,
  Zap,
  Award,
  Clock,
  Sparkles,
  Edit3,
  Check,
  TrendingUp,
  Brain,
  ShieldCheck,
  BookOpen,
  Target,
  Trophy,
  Compass,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { playSuccessSound } from '../utils/sound';
import { SkillRadarChart } from '../components/common/SkillRadarChart';
import { SkillRadarItem, Achievement } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, soundEnabled, refreshUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [dailyGoalMinutes, setDailyGoalMinutes] = useState(user?.dailyGoalMinutes || 25);
  const [saving, setSaving] = useState(false);
  const [radarData, setRadarData] = useState<SkillRadarItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [rRes, aRes] = await Promise.all([
        fetch('/api/intelligence/radar'),
        fetch('/api/achievements'),
      ]);

      if (rRes.ok) {
        const rData = await rRes.json();
        setRadarData(rData.radar || []);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        setAchievements(aData.achievements || []);
      }
    } catch (err) {
      console.error('Failed to load profile intelligence:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, dailyGoalMinutes: Number(dailyGoalMinutes) }),
      });
      if (res.ok) {
        await refreshUser();
        setIsEditing(false);
        playSuccessSound(soundEnabled);
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Command Dossier Header Card */}
      <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-cyan-500/30 shadow-2xl"
            />
            <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-950 border border-cyan-400 text-cyan-400 shadow-md">
              LVL {user?.level || 1}
            </span>
          </div>

          <div className="space-y-2 max-w-lg">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-sm font-bold text-white w-full"
                  placeholder="Your Name"
                />
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  rows={2}
                  className="px-3.5 py-2 rounded-xl border border-slate-700 bg-slate-800 text-xs text-slate-300 w-full"
                  placeholder="Brief Bio / Goal"
                />
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>Daily Study Target:</span>
                  <input
                    type="number"
                    value={dailyGoalMinutes}
                    onChange={e => setDailyGoalMinutes(Number(e.target.value))}
                    className="w-16 px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 text-xs text-white"
                  />
                  <span>minutes/day</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 justify-center sm:justify-start">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {user?.name}
                  </h1>
                  <span className="px-2.5 py-0.5 text-xs font-extrabold uppercase rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                    {user?.rankTitle || 'Cadet'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {user?.bio || 'Pioneer Cadet navigating the NOVA Universe.'}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Edit Button */}
        <div>
          {isEditing ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{saving ? 'Updating...' : 'Save Dossier'}</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Dossier</span>
            </button>
          )}
        </div>
      </div>

      {/* Core Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6 fill-orange-500" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Streak Record</div>
            <div className="text-2xl font-extrabold text-white">
              {user?.streakDays || 1} Days
            </div>
            <div className="text-[10px] text-orange-400 font-bold">Top 5% Consistency</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Zap className="w-6 h-6 fill-amber-500" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Experience</div>
            <div className="text-2xl font-extrabold text-white">
              {user?.xp || 0} XP
            </div>
            <div className="text-[10px] text-amber-400 font-bold">Level {user?.level || 1} Explorer</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Quests Completed</div>
            <div className="text-2xl font-extrabold text-white">
              5 Missions
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">100% Pass Rate</div>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-violet-500/10 text-violet-400 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-semibold">Exploration Time</div>
            <div className="text-2xl font-extrabold text-white">
              22.7 hrs
            </div>
            <div className="text-[10px] text-violet-400 font-bold">Past 30 Days</div>
          </div>
        </div>
      </div>

      {/* Skill Radar & Achievements Shelf */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Visual Skill Radar */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-cyan-400" />
              <span>Competency Skill Radar</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Multi-axis evaluation across Programming, AI, Systems Architecture, and Design.
            </p>
          </div>

          <div className="py-4 flex justify-center">
            <SkillRadarChart data={radarData} size={300} />
          </div>
        </div>

        {/* Unlocked Achievements Collection */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span>Achievement Collection</span>
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Trophies earned across your learning universe journey.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400">
              {achievements.filter(a => a.unlockedAt).length} / {achievements.length} Unlocked
            </span>
          </div>

          <div className="space-y-3">
            {achievements.map(ach => {
              const isUnlocked = Boolean(ach.unlockedAt);
              return (
                <div
                  key={ach.id}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isUnlocked
                      ? 'bg-slate-800/80 border-amber-500/30'
                      : 'bg-slate-900/40 border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isUnlocked
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-slate-800 text-slate-600'
                      }`}
                    >
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-extrabold text-white">{ach.title}</h4>
                      <p className="text-[11px] text-slate-400">{ach.description}</p>
                    </div>
                  </div>

                  <span className="text-xs font-extrabold text-amber-400 shrink-0">
                    +{ach.xpReward} XP
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
