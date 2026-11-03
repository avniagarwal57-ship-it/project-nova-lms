import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Network,
  Lock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Zap,
  BookOpen,
  Info,
  ChevronRight,
  Terminal,
  Cpu,
  Layers,
  Palette,
  X,
  Play,
} from 'lucide-react';
import { SkillNode } from '../types';
import { playSuccessSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface SkillTreePageProps {
  onStartQuest?: (courseId: string) => void;
}

export const SkillTreePage: React.FC<SkillTreePageProps> = ({ onStartQuest }) => {
  const { user, soundEnabled, updateUserXpLocally } = useAuth();
  const [skills, setSkills] = useState<SkillNode[]>([]);
  const [selectedWorld, setSelectedWorld] = useState<string>('world-prog');
  const [selectedSkill, setSelectedSkill] = useState<SkillNode | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, [selectedWorld]);

  const fetchSkills = async () => {
    try {
      const res = await fetch(`/api/skills?worldId=${selectedWorld}`);
      if (res.ok) {
        const data = await res.json();
        setSkills(data.skills || []);
        if (data.skills?.length > 0 && !selectedSkill) {
          setSelectedSkill(data.skills[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load skill tree:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockSkill = async (skillId: string) => {
    try {
      const res = await fetch(`/api/skills/${skillId}/unlock`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        playSuccessSound(soundEnabled);
        triggerConfetti();

        // Update local state
        setSkills(prev =>
          prev.map(s => (s.id === skillId ? { ...s, status: 'mastered', masteryPercentage: 100 } : s))
        );
        setSelectedSkill(prev => (prev?.id === skillId ? { ...prev, status: 'mastered', masteryPercentage: 100 } : prev));

        if (data.user) {
          updateUserXpLocally(selectedSkill?.xpRequired || 150, false, data.user.level);
        }
      }
    } catch (err) {
      console.error('Failed to unlock skill:', err);
    }
  };

  const masteredCount = skills.filter(s => s.status === 'mastered').length;
  const inProgressCount = skills.filter(s => s.status === 'in_progress').length;
  const totalCount = skills.length;
  const overallMastery = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Header & Stats Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-widest">
            <Network className="w-3.5 h-3.5" />
            <span>Interactive Neural Progression</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Skill Tree & Mastery
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Visualize your interconnected competencies. Master foundational prerequisites to unlock advanced system architectures.
          </p>
        </div>

        {/* Tree Progress Stats */}
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Mastered</span>
            <span className="text-2xl font-extrabold text-emerald-400">{masteredCount}</span>
            <span className="text-[10px] text-slate-500 block">Nodes</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">In Progress</span>
            <span className="text-2xl font-extrabold text-cyan-400">{inProgressCount}</span>
            <span className="text-[10px] text-slate-500 block">Nodes</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-center min-w-[100px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Mastery</span>
            <span className="text-2xl font-extrabold text-amber-400">{overallMastery}%</span>
            <span className="text-[10px] text-slate-500 block">Complete</span>
          </div>
        </div>
      </div>

      {/* World Selector Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {[
          { id: 'world-prog', title: 'Programming Tree', icon: Terminal, color: 'text-cyan-400' },
          { id: 'world-tech', title: 'Technology & AI Tree', icon: Cpu, color: 'text-indigo-400' },
          { id: 'world-design', title: 'Design & Spatial Tree', icon: Palette, color: 'text-rose-400' },
        ].map(w => {
          const Icon = w.icon;
          const isSelected = selectedWorld === w.id;
          return (
            <button
              key={w.id}
              onClick={() => {
                setSelectedWorld(w.id);
                setSelectedSkill(null);
              }}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shrink-0 ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-900/70 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${w.color}`} />
              <span>{w.title}</span>
            </button>
          );
        })}
      </div>

      {/* Main Grid: Interactive Connected Node Tree + Inspection Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Node Graph Visualization Canvas */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl relative min-h-[540px] flex flex-col justify-between overflow-x-auto">
          {/* Subtle cosmic grid background */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none rounded-3xl" />

          <div className="relative z-10 flex items-center justify-between mb-8">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
              Node Dependency Trajectory
            </span>
            <div className="flex items-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Mastered
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> In Progress
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600" /> Locked
              </span>
            </div>
          </div>

          {/* Sequential Node Map with Vertical Connecting Traces */}
          <div className="relative z-10 space-y-6 max-w-xl mx-auto py-4">
            {skills.map((skill, index) => {
              const isSelected = selectedSkill?.id === skill.id;
              const isMastered = skill.status === 'mastered';
              const isInProgress = skill.status === 'in_progress';
              const isLocked = skill.status === 'locked';

              return (
                <div key={skill.id} className="relative flex items-center gap-6 group">
                  {/* Vertical Connector Line to next node */}
                  {index < skills.length - 1 && (
                    <div
                      className={`absolute left-6 top-12 w-0.5 h-12 transition-colors ${
                        isMastered ? 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-700/60'
                      }`}
                    />
                  )}

                  {/* Node Hexagon / Circle Indicator */}
                  <button
                    onClick={() => setSelectedSkill(skill)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 relative ${
                      isMastered
                        ? 'bg-emerald-500/20 border-2 border-emerald-400 text-emerald-400 shadow-lg shadow-emerald-500/30'
                        : isInProgress
                        ? 'bg-cyan-500/20 border-2 border-cyan-400 text-cyan-400 shadow-lg shadow-cyan-500/30 animate-pulse-subtle'
                        : isLocked
                        ? 'bg-slate-800/80 border border-slate-700 text-slate-500'
                        : 'bg-indigo-500/20 border-2 border-indigo-400 text-indigo-400'
                    } ${isSelected ? 'scale-110 ring-4 ring-cyan-500/40' : 'hover:scale-105'}`}
                  >
                    {isMastered ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : isLocked ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </button>

                  {/* Node Label Card */}
                  <div
                    onClick={() => setSelectedSkill(skill)}
                    className={`flex-1 p-4 rounded-2xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-slate-800/95 border-cyan-500 shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-800/50 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                        Level {skill.level} • {skill.category}
                      </span>
                      <span className="text-[11px] font-extrabold text-amber-400">
                        +{skill.xpRequired} XP
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-white">
                      {skill.name}
                    </h4>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                      {skill.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="relative z-10 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Click any node to inspect prerequisites and launch domain missions</span>
            <span>NOVA Neural Tree Engine v2.4</span>
          </div>
        </div>

        {/* Selected Skill Details & Actions Dossier */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl flex flex-col justify-between space-y-6">
          {selectedSkill ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  {selectedSkill.status.toUpperCase()}
                </span>
                <span className="text-xs font-extrabold text-amber-400 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  {selectedSkill.xpRequired} XP Reward
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white mb-2">
                  {selectedSkill.name}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedSkill.description}
                </p>
              </div>

              {/* Mastery Level Bar */}
              <div className="space-y-1.5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Demonstrated Mastery</span>
                  <span className="text-cyan-400">{selectedSkill.masteryPercentage}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedSkill.masteryPercentage}%` }}
                  />
                </div>
              </div>

              {/* Prerequisites Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Required Prerequisites
                </span>
                {selectedSkill.prerequisites.length === 0 ? (
                  <div className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No prerequisites required (Foundational Node)</span>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {selectedSkill.prerequisites.map(prereqId => {
                      const pSkill = skills.find(s => s.id === prereqId);
                      const isMet = pSkill?.status === 'mastered';
                      return (
                        <div
                          key={prereqId}
                          className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-white">
                            {pSkill ? pSkill.name : prereqId}
                          </span>
                          {isMet ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Met
                            </span>
                          ) : (
                            <span className="text-amber-400 font-bold flex items-center gap-1 text-[11px]">
                              <Lock className="w-3.5 h-3.5" /> Missing
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                {selectedSkill.status === 'mastered' ? (
                  <div className="w-full py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Skill Mastered & Certified</span>
                  </div>
                ) : selectedSkill.status === 'locked' ? (
                  <div className="w-full py-3 rounded-2xl bg-slate-800 text-slate-500 text-xs font-bold text-center flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4" />
                    <span>Prerequisites Required to Unlock</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleUnlockSkill(selectedSkill.id)}
                    className="w-full py-3.5 rounded-2xl font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Master Skill & Claim +{selectedSkill.xpRequired} XP</span>
                  </button>
                )}

                {selectedSkill.relatedCourseId && onStartQuest && (
                  <button
                    onClick={() => onStartQuest(selectedSkill.relatedCourseId!)}
                    className="w-full py-2.5 rounded-2xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center gap-2 transition-all"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Launch Related Mission Course</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20 text-slate-500 text-xs">
              Select a node in the tree to inspect details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
