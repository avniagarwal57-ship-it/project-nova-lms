import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Globe,
  Compass,
  Cpu,
  Terminal,
  Palette,
  Briefcase,
  Atom,
  Sparkles,
  Search,
  Filter,
  PlusCircle,
  Star,
  Clock,
  ArrowRight,
  BookOpen,
  Award,
  Users,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';
import { LearningWorld, Course } from '../types';

interface WorldsPageProps {
  onSelectCourse: (courseId: string) => void;
  onOpenCreateCourse?: () => void;
}

export const WorldsPage: React.FC<WorldsPageProps> = ({ onSelectCourse, onOpenCreateCourse }) => {
  const { user } = useAuth();
  const [worlds, setWorlds] = useState<LearningWorld[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedWorldId, setSelectedWorldId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [loading, setLoading] = useState(true);

  // Create World Modal
  const [createWorldModalOpen, setCreateWorldModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newColor, setNewColor] = useState('#38bdf8');
  const [newBanner, setNewBanner] = useState('');
  const [newDifficulty, setNewDifficulty] = useState('All Levels');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchWorldsAndCourses();
  }, []);

  const fetchWorldsAndCourses = async () => {
    try {
      const [wRes, cRes] = await Promise.all([
        fetch('/api/worlds'),
        fetch('/api/courses'),
      ]);

      if (wRes.ok) {
        const wData = await wRes.json();
        setWorlds(wData.worlds || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setCourses(cData.courses || []);
      }
    } catch (err) {
      console.error('Failed to load worlds:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorld = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/worlds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          color: newColor,
          bannerImage: newBanner || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
          difficultyTier: newDifficulty,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setWorlds(prev => [...prev, data.world]);
        setCreateWorldModalOpen(false);
        setNewTitle('');
        setNewDesc('');
      }
    } catch (err) {
      console.error('Failed to create world:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter courses based on active world, search, level
  const filteredCourses = courses.filter(c => {
    const matchesWorld = selectedWorldId === 'all' || c.worldId === selectedWorldId || c.category.toLowerCase() === selectedWorldId.toLowerCase();
    const matchesLevel = selectedLevel === 'All' || c.level === selectedLevel;
    const matchesSearch =
      searchQuery === '' ||
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesWorld && matchesLevel && matchesSearch;
  });

  const getWorldIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Palette': return <Palette className="w-5 h-5" />;
      case 'Briefcase': return <Briefcase className="w-5 h-5" />;
      case 'Atom': return <Atom className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Worlds Sector Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-widest mb-1">
            <Globe className="w-3.5 h-3.5" />
            <span>Planetary Sector Map</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            The Learning Worlds
          </h1>
          <p className="mt-2 text-sm text-slate-400 max-w-2xl">
            Choose your world of conquest. Each planetary world holds dedicated skill branches, quest-based learning tracks, and mastery badges.
          </p>
        </div>

        {/* Admin/Instructor Action to create worlds */}
        {(user?.role === 'instructor' || user?.role === 'admin') && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCreateWorldModalOpen(true)}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-cyan-600/30 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create New World</span>
            </button>
            {onOpenCreateCourse && (
              <button
                onClick={onOpenCreateCourse}
                className="px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-purple-400" />
                <span>Create Quest</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* World Hologram Cards Carousel / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* "All Worlds" Selector Card */}
        <div
          onClick={() => setSelectedWorldId('all')}
          className={`p-5 rounded-3xl cursor-pointer transition-all border backdrop-blur-md flex flex-col justify-between ${
            selectedWorldId === 'all'
              ? 'bg-gradient-to-br from-cyan-950/80 to-slate-900 border-cyan-500 shadow-xl shadow-cyan-500/20'
              : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-white mb-1">Omni-Verse</h3>
            <p className="text-xs text-slate-400 line-clamp-2">
              Survey every expedition, skill node, and quest across all planetary domains.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-bold">
            <span>{courses.length} Total Quests</span>
            <span>View All →</span>
          </div>
        </div>

        {/* Individual Worlds */}
        {worlds.map(world => {
          const isSelected = selectedWorldId === world.id;
          return (
            <div
              key={world.id}
              onClick={() => setSelectedWorldId(world.id)}
              className={`p-5 rounded-3xl cursor-pointer transition-all border backdrop-blur-md flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? 'border-cyan-400 bg-slate-900/90 shadow-xl shadow-cyan-500/20'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              {/* Subtle World Glow Accent */}
              <div
                className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: world.color }}
              />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center border shadow-md"
                    style={{
                      backgroundColor: `${world.color}18`,
                      borderColor: `${world.color}40`,
                      color: world.color,
                    }}
                  >
                    {getWorldIcon(world.icon)}
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700">
                    {world.difficultyTier}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                  {world.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {world.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 font-semibold">
                  <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                  {world.coursesCount} Quests
                </span>
                <span className="flex items-center gap-1 font-semibold text-cyan-400">
                  <Users className="w-3.5 h-3.5" />
                  {world.learnersCount} Explorers
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search & Level Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search missions, topics, keywords..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider hidden sm:inline">
            Tier:
          </span>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map(lvl => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedLevel === lvl
                  ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Courses & Quests Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
            <span>Quests in Sector</span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              {filteredCourses.length} Available
            </span>
          </h2>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-16 p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Compass className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">No quests found matching your coordinates</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try modifying your search term or select another Learning World from the sector map above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div
                key={course.id}
                onClick={() => onSelectCourse(course.id)}
                className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/50 shadow-lg hover:shadow-2xl transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 rounded-2xl overflow-hidden mb-4">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                    
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-slate-950/85 backdrop-blur-md text-cyan-300 border border-cyan-500/30">
                      {course.level}
                    </span>
                    <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-slate-950/85 text-amber-400 flex items-center gap-1 border border-amber-500/20">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {course.rating}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-cyan-400 mb-1">
                    <span>{course.category}</span>
                    <span className="text-amber-400">+{course.xpRewardTotal || 500} XP</span>
                  </div>

                  <h3 className="text-base font-extrabold text-white line-clamp-1 mb-2 group-hover:text-cyan-400 transition-colors">
                    {course.title}
                  </h3>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {course.shortDescription}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {course.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700/50"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.durationMinutes} mins
                  </span>
                  <span className="font-bold text-cyan-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Enter Quest <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create World Modal */}
      {createWorldModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <Globe className="w-4 h-4" />
                <span>Planetary Architect Studio</span>
              </div>
              <button
                onClick={() => setCreateWorldModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">Create New Learning World</h3>
              <p className="text-xs text-slate-400 mt-1">
                Establish a new planetary category for courses, learning paths, and skill trees.
              </p>
            </div>

            <form onSubmit={handleCreateWorld} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">World Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Robotics & Hardware World"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Description</label>
                <textarea
                  required
                  rows={3}
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="Outline the domain topics and skills learners will develop..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={newColor}
                      onChange={e => setNewColor(e.target.value)}
                      className="w-10 h-10 rounded-xl bg-transparent cursor-pointer border border-slate-700"
                    />
                    <span className="text-slate-400 font-mono text-[11px]">{newColor}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Difficulty Tier</label>
                  <select
                    value={newDifficulty}
                    onChange={e => setNewDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="All Levels">All Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced to Expert">Advanced to Expert</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateWorldModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-400/30 transition-all"
                >
                  {isSubmitting ? 'Architecting...' : 'Establish World'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
