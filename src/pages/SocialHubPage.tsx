import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  MessageSquare,
  Trophy,
  Heart,
  Share2,
  Send,
  Sparkles,
  PlusCircle,
  ShieldAlert,
  Flag,
  CheckCircle2,
  Filter,
  UserPlus,
  BookOpen,
  X,
} from 'lucide-react';
import { StudyGroup, SocialPost } from '../types';
import { playSuccessSound } from '../utils/sound';

export const SocialHubPage: React.FC = () => {
  const { user, soundEnabled } = useAuth();
  const [groups, setGroups] = useState<StudyGroup[]>([]);
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'achievements' | 'discussions'>('all');
  const [loading, setLoading] = useState(true);

  // New Post Modal State
  const [createPostModalOpen, setCreatePostModalOpen] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('Discussion, Learning');

  // Reported feedback
  const [reportedId, setReportedId] = useState<string | null>(null);

  useEffect(() => {
    fetchHubData();
  }, []);

  const fetchHubData = async () => {
    try {
      const [gRes, pRes] = await Promise.all([
        fetch('/api/social/groups'),
        fetch('/api/social/posts'),
      ]);

      if (gRes.ok) {
        const gData = await gRes.json();
        setGroups(gData.groups || []);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setPosts(pData.posts || []);
      }
    } catch (err) {
      console.error('Failed to load social hub data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    try {
      const res = await fetch(`/api/social/groups/${groupId}/join`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        playSuccessSound(soundEnabled);
        setGroups(prev => prev.map(g => (g.id === groupId ? data.group : g)));
      }
    } catch (err) {
      console.error('Failed to join group:', err);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const res = await fetch(`/api/social/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setPosts(prev => prev.map(p => (p.id === postId ? data.post : p)));
      }
    } catch (err) {
      console.error('Failed to like post:', err);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim()) return;

    try {
      const tags = postTags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/social/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent,
          tags,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        playSuccessSound(soundEnabled);
        setPosts(prev => [data.post, ...prev]);
        setPostContent('');
        setCreatePostModalOpen(false);
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const handleReportPost = (postId: string) => {
    setReportedId(postId);
    setTimeout(() => setReportedId(null), 3000);
  };

  const filteredPosts = posts.filter(p => {
    if (activeFilter === 'achievements') return Boolean(p.badgeEarned);
    if (activeFilter === 'discussions') return !p.badgeEarned;
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-400 font-extrabold text-xs uppercase tracking-widest">
            <Users className="w-3.5 h-3.5" />
            <span>Community Nexus & Collaborative Guilds</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Social Learning Hub
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Collaborate with fellow explorers across the learning universe. Join specialized study guilds, debate architecture decisions, and celebrate achievements.
          </p>
        </div>

        <button
          onClick={() => setCreatePostModalOpen(true)}
          className="px-6 py-3 rounded-2xl font-extrabold text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-300 hover:from-cyan-300 hover:to-sky-200 shadow-lg shadow-cyan-400/30 flex items-center gap-2 text-xs transition-all shrink-0 hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Discussion or Update</span>
        </button>
      </div>

      {/* Study Groups / Guilds Shelf */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-extrabold text-white">Active Study Guilds</h3>
            <p className="text-xs text-slate-400">Join domain squads to collaborate on peer missions and code reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {groups.map(group => (
            <div
              key={group.id}
              className="p-5 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-32 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={group.banner}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-950/90 text-cyan-300 border border-cyan-500/30">
                    {group.memberCount} Explorers
                  </span>
                </div>

                <h4 className="text-base font-extrabold text-white mb-1">
                  {group.name}
                </h4>
                <p className="text-xs text-cyan-400 font-semibold mb-2">
                  {group.tagline}
                </p>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                  {group.description}
                </p>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-[11px] text-slate-300 mb-4">
                  <span className="text-slate-500 block text-[9px] uppercase font-bold">Active Guild Mission:</span>
                  <span className="font-semibold text-white">{group.activeMission}</span>
                </div>
              </div>

              <button
                onClick={() => handleJoinGroup(group.id)}
                className={`w-full py-2.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  group.joined
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                }`}
              >
                {group.joined ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Guild Member</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Join Guild</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Community Feed with Filter Tabs */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Activity' },
              { id: 'discussions', label: 'Discussions & Questions' },
              { id: 'achievements', label: 'Achievement Celebrations' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeFilter === tab.id
                    ? 'bg-cyan-500 text-slate-950 font-extrabold shadow-md'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500">
            Filtered: {filteredPosts.length} posts
          </span>
        </div>

        {/* Post Items */}
        <div className="space-y-4">
          {filteredPosts.map(post => (
            <div
              key={post.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-lg space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={post.userAvatar}
                    alt={post.userName}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-cyan-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-white">{post.userName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700 font-bold">
                        {post.userRank}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500">{post.createdAt}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleReportPost(post.id)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg text-xs"
                    title="Report post for moderation"
                  >
                    <Flag className="w-3.5 h-3.5" />
                  </button>
                  {reportedId === post.id && (
                    <span className="text-[10px] text-rose-400 font-bold">Flagged for review</span>
                  )}
                </div>
              </div>

              {/* Achievement Badge Banner if milestone */}
              {post.badgeEarned && (
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-transparent border border-amber-500/30 flex items-center gap-3 text-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Achievement Unlocked</span>
                    <span className="font-extrabold text-amber-400">{post.badgeEarned}</span>
                  </div>
                </div>
              )}

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {post.content}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {post.tags.map(t => (
                    <span
                      key={t}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-cyan-400 font-mono"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <button
                  onClick={() => handleLikePost(post.id)}
                  className={`flex items-center gap-1.5 font-bold transition-colors ${
                    post.likedByMe ? 'text-rose-400' : 'hover:text-rose-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.likedByMe ? 'fill-current text-rose-400' : ''}`} />
                  <span>{post.likes} Likes</span>
                </button>

                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.repliesCount} Replies</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Post Modal */}
      {createPostModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-2xl space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-white">Share with the Universe</h3>
              <button
                onClick={() => setCreatePostModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePost} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Your Message or Question</label>
                <textarea
                  rows={4}
                  required
                  value={postContent}
                  onChange={e => setPostContent(e.target.value)}
                  placeholder="Share a milestone, post an architectural query, or discuss a quest stage..."
                  className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={postTags}
                  onChange={e => setPostTags(e.target.value)}
                  placeholder="e.g. AI, Architecture, VectorDB"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreatePostModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-400/30"
                >
                  Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
