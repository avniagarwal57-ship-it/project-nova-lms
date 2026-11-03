import React, { useState, useEffect, useRef } from 'react';
import { Course, Lesson, Note, VisualDiagram, CodeExercise } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  CheckCircle2,
  Bot,
  Bookmark,
  FileText,
  Download,
  Share2,
  Sparkles,
  Zap,
  ChevronRight,
  ChevronLeft,
  Send,
  HelpCircle,
  Copy,
  Check,
  Award,
  Layers,
  BookOpen,
  MessageSquare,
  X,
  Code2,
  Terminal,
  Activity,
  Compass,
} from 'lucide-react';
import { playSuccessSound, playXpSound } from '../utils/sound';
import { triggerConfetti } from '../utils/confetti';

interface LessonPlayerPageProps {
  courseId: string;
  lessonId: string;
  onBack: () => void;
  onNavigateLesson: (newLessonId: string) => void;
  onOpenQuiz: (quizId: string) => void;
  onOpenFlashcards: (deckId: string) => void;
}

export const LessonPlayerPage: React.FC<LessonPlayerPageProps> = ({
  courseId,
  lessonId,
  onBack,
  onNavigateLesson,
  onOpenQuiz,
  onOpenFlashcards,
}) => {
  const { user, soundEnabled, updateUserXpLocally } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // 6-Stage Quest Engine State
  const [activeStage, setActiveStage] = useState<number>(1);
  const [completedStages, setCompletedStages] = useState<number[]>([1]);

  // Stage 2: Visual Diagram Interactive Node Selection
  const [selectedDiagNode, setSelectedDiagNode] = useState<string>('n1');

  // Stage 4: Live Code Sandbox State
  const [codeContent, setCodeContent] = useState<string>(`function computeCosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

console.log("Vector Similarity:", computeCosineSimilarity([1, 2, 3], [1, 2, 3]));`);

  const [codeOutput, setCodeOutput] = useState<string>('');
  const [codeRunning, setCodeRunning] = useState<boolean>(false);
  const [testResults, setTestResults] = useState<any[]>([]);

  // Stage 5: Mini Challenge State
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);

  // Video player state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoProgress, setVideoProgress] = useState(0);
  const [theaterMode, setTheaterMode] = useState(false);

  // Notes & Bookmarks
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [notesDrawerOpen, setNotesDrawerOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // AI Mentor sidebar
  const [aiSidebarOpen, setAiSidebarOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMode, setAiMode] = useState<'explain' | 'practice' | 'challenge' | 'revision' | 'exam'>('explain');
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'assistant'; text: string; mode?: string }>>([
    {
      role: 'assistant',
      text: `Greetings, Commander ${user?.name.split(' ')[0] || 'Cadet'}! I am **NOVA Mentor**, your learning companion. I can provide step-by-step explanations, guide your live code exercises, or duel in Challenge Mode!`,
    },
  ]);

  useEffect(() => {
    fetchCourseAndLesson();
  }, [courseId, lessonId]);

  const fetchCourseAndLesson = async () => {
    try {
      const [cRes, notesRes] = await Promise.all([
        fetch(`/api/courses/${courseId}`),
        fetch(`/api/notes?courseId=${courseId}`),
      ]);

      if (cRes.ok) {
        const cData = await cRes.json();
        setCourse(cData.course);
        setCompletedLessonIds(cData.enrollment?.completedLessonIds || []);

        // Find active lesson
        let foundLesson: Lesson | null = null;
        for (const ch of cData.course.chapters) {
          const l = ch.lessons.find((les: Lesson) => les.id === lessonId);
          if (l) {
            foundLesson = l;
            break;
          }
        }
        if (!foundLesson && cData.course.chapters[0]?.lessons[0]) {
          foundLesson = cData.course.chapters[0].lessons[0];
        }
        setCurrentLesson(foundLesson);

        if (foundLesson?.stages?.stage4Exercise?.starterCode) {
          setCodeContent(foundLesson.stages.stage4Exercise.starterCode);
        }
      }

      if (notesRes.ok) {
        const nData = await notesRes.json();
        setNotes(nData.notes || []);
      }
    } catch (err) {
      console.error('Failed to load lesson:', err);
    } finally {
      setLoading(false);
    }
  };

  // Video controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setVideoProgress(progress || 0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return;
    const time = (parseFloat(e.target.value) / 100) * videoRef.current.duration;
    videoRef.current.currentTime = time;
    setVideoProgress(parseFloat(e.target.value));
  };

  const changeSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
    }
  };

  // Run code sandbox
  const handleRunCode = async () => {
    setCodeRunning(true);
    try {
      const res = await fetch('/api/code/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: codeContent,
          language: 'typescript',
          testCases: currentLesson?.stages?.stage4Exercise?.testCases || [
            { input: '[1, 0], [1, 0]', expectedOutput: '1.00', description: 'Identical vectors score 1.0' },
            { input: '[1, 0], [0, 1]', expectedOutput: '0.00', description: 'Orthogonal vectors score 0.0' },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setCodeOutput(data.output);
        setTestResults(data.testResults || []);
        if (data.allPassed) {
          playSuccessSound(soundEnabled);
          if (!completedStages.includes(4)) {
            setCompletedStages(prev => [...prev, 4]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to run code sandbox:', err);
      setCodeOutput('Execution error.');
    } finally {
      setCodeRunning(false);
    }
  };

  // Advance Quest Stage
  const handleAdvanceStage = (nextStage: number) => {
    if (!completedStages.includes(activeStage)) {
      setCompletedStages(prev => [...prev, activeStage]);
    }
    setActiveStage(nextStage);
    playSuccessSound(soundEnabled);

    // If reaching Stage 6, trigger full quest completion
    if (nextStage === 6) {
      handleCompleteLesson();
    }
  };

  // Complete lesson / mission
  const handleCompleteLesson = async () => {
    if (!currentLesson || !course) return;
    try {
      const res = await fetch(`/api/courses/${course.id}/lessons/${currentLesson.id}/complete`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = await res.json();
        playSuccessSound(soundEnabled);
        triggerConfetti();

        if (!completedLessonIds.includes(currentLesson.id)) {
          setCompletedLessonIds(prev => [...prev, currentLesson.id]);
        }
        if (data.user) {
          updateUserXpLocally(data.xpAdded || currentLesson.xpReward, false, data.user.level);
        }
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  // Add note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !currentLesson) return;
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lessonId: currentLesson.id,
          lessonTitle: currentLesson.title,
          text: newNoteText,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [data.note, ...prev]);
        setNewNoteText('');
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    }
  };

  // Send AI Mentor prompt
  const handleSendAiPrompt = async (promptToSend?: string, modeOverride?: string) => {
    const text = promptToSend || aiPrompt;
    if (!text.trim()) return;
    const mode = (modeOverride || aiMode) as any;

    setAiChatHistory(prev => [...prev, { role: 'user', text, mode }]);
    setAiPrompt('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          mode,
          courseTitle: course?.title,
          lessonTitle: currentLesson?.title,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiChatHistory(prev => [...prev, { role: 'assistant', text: data.reply, mode: data.mode }]);
        playXpSound(soundEnabled);
      }
    } catch (err) {
      console.error('AI chat failed:', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Navigation helpers
  const allLessons = course?.chapters.flatMap(ch => ch.lessons) || [];
  const currentIndex = allLessons.findIndex(l => l.id === currentLesson?.id);
  const getPrevLesson = () => (currentIndex > 0 ? allLessons[currentIndex - 1] : null);
  const getNextLesson = () => (currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null);

  if (loading || !course || !currentLesson) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  const isCurrentLessonCompleted = completedLessonIds.includes(currentLesson.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      {/* Top Navigation & Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Studio to {course.title}</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Notes Toggle */}
          <button
            onClick={() => setNotesDrawerOpen(!notesDrawerOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors border border-slate-700"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Notes ({notes.length})</span>
          </button>

          {/* Bookmark Toggle */}
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-xl transition-colors border ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title="Bookmark Mission"
          >
            <Bookmark className="w-4 h-4 fill-current" />
          </button>

          {/* NOVA AI Mentor Toggle */}
          <button
            onClick={() => setAiSidebarOpen(!aiSidebarOpen)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-600/20 hover:scale-105 transition-all"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>NOVA Mentor</span>
          </button>

          <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            +{currentLesson.xpReward} XP
          </span>
        </div>
      </div>

      {/* 6-Stage Quest Stepper Navigation */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md overflow-x-auto shadow-lg">
        <div className="flex items-center justify-between min-w-[700px] gap-2">
          {[
            { num: 1, title: '1. Briefing' },
            { num: 2, title: '2. Visual Architecture' },
            { num: 3, title: '3. Deep Dive' },
            { num: 4, title: '4. Code Sandbox' },
            { num: 5, title: '5. Knowledge Duel' },
            { num: 6, title: '6. Quest Complete' },
          ].map(stage => {
            const isActive = activeStage === stage.num;
            const isDone = completedStages.includes(stage.num);

            return (
              <button
                key={stage.num}
                onClick={() => setActiveStage(stage.num)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-600/30'
                    : isDone
                    ? 'bg-slate-800/80 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800/40 text-slate-500 hover:text-slate-300'
                }`}
              >
                {isDone && !isActive ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-slate-700/60 text-[10px] flex items-center justify-center">
                    {stage.num}
                  </span>
                )}
                <span>{stage.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {/* STAGE 1: CONCEPT DISCOVERY BRIEFING */}
          {activeStage === 1 && (
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-cyan-400">
                <Compass className="w-4 h-4" />
                <span>Stage 1: Concept Discovery & Objectives</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
                {currentLesson.title}
              </h1>

              <div className="prose prose-invert text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {currentLesson.stages?.stage1Concept || currentLesson.markdownContent}
              </div>

              <div className="p-5 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 space-y-2">
                <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                  Mission Target Objectives
                </span>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                  <li>Understand dense vector coordinates in semantic representation</li>
                  <li>Calculate cosine distance between multi-dimensional queries</li>
                  <li>Implement TypeScript cosine similarity in the live code sandbox</li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => handleAdvanceStage(2)}
                  className="px-6 py-3 rounded-2xl font-extrabold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-400/25 flex items-center gap-2 text-xs transition-all"
                >
                  <span>Advance to Visual Architecture</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: INTERACTIVE VISUAL ARCHITECTURE DIAGRAM */}
          {activeStage === 2 && (
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-cyan-400">
                  <Activity className="w-4 h-4" />
                  <span>Stage 2: Visual System Architecture</span>
                </div>
                <span className="text-xs text-slate-400">Click any node to inspect data projection</span>
              </div>

              {/* Interactive SVG / Node Graph Representation */}
              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 relative min-h-[320px] flex items-center justify-center">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                  {[
                    { id: 'n1', title: 'Query: "Cute Puppy"', detail: 'Vector: [0.82, 0.14, 0.91]', color: '#38bdf8' },
                    { id: 'n2', title: 'Match: "Golden Retriever"', detail: 'Cosine Sim: 0.94 (Near match)', color: '#10b981' },
                    { id: 'n3', title: 'Match: "Canine Play"', detail: 'Cosine Sim: 0.88 (Semantic cluster)', color: '#10b981' },
                    { id: 'n4', title: 'Distant: "Quantum Mechanics"', detail: 'Cosine Sim: 0.12 (Orthogonal)', color: '#f43f5e' },
                  ].map(node => (
                    <div
                      key={node.id}
                      onClick={() => setSelectedDiagNode(node.id)}
                      className={`p-4 rounded-xl cursor-pointer border transition-all ${
                        selectedDiagNode === node.id
                          ? 'border-cyan-400 bg-slate-800 shadow-lg shadow-cyan-500/20 scale-105'
                          : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: node.color }} />
                        <h4 className="text-xs font-extrabold text-white">{node.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono">{node.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 leading-relaxed">
                💡 <strong>Architectural Insight:</strong> In high-dimensional vector space, concepts that share semantic context inhabit adjacent coordinate sectors, allowing instant nearest-neighbor lookup via HNSW indexes.
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-between">
                <button
                  onClick={() => setActiveStage(1)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white text-xs"
                >
                  ← Previous Briefing
                </button>
                <button
                  onClick={() => handleAdvanceStage(3)}
                  className="px-6 py-3 rounded-2xl font-extrabold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-400/25 flex items-center gap-2 text-xs transition-all"
                >
                  <span>Advance to Lesson Deep Dive</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: WATCH OR READ LESSON DEEP DIVE */}
          {activeStage === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Optional Video Player if videoUrl exists */}
              {currentLesson.videoUrl && (
                <div className="rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl relative group">
                  <iframe
                    src={currentLesson.videoUrl}
                    title={currentLesson.title}
                    className="w-full h-[320px] sm:h-[420px]"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}

              {/* Rich Text Lesson Content */}
              <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-cyan-400">
                  <BookOpen className="w-4 h-4" />
                  <span>Stage 3: Deep Computational Dive</span>
                </div>
                <div className="prose prose-invert text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                  {currentLesson.stages?.stage3Content || currentLesson.markdownContent}
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-between">
                  <button
                    onClick={() => setActiveStage(2)}
                    className="px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white text-xs"
                  >
                    ← Previous Stage
                  </button>
                  <button
                    onClick={() => handleAdvanceStage(4)}
                    className="px-6 py-3 rounded-2xl font-extrabold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-400/25 flex items-center gap-2 text-xs transition-all"
                  >
                    <span>Advance to Live Code Sandbox</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STAGE 4: INTERACTIVE CODE SANDBOX */}
          {activeStage === 4 && (
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-cyan-400">
                  <Terminal className="w-4 h-4" />
                  <span>Stage 4: Interactive Live Code Sandbox</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  TypeScript / Node Runtime
                </span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white mb-1">
                  Implement Cosine Similarity in TypeScript
                </h3>
                <p className="text-xs text-slate-400">
                  Calculate dot product and Euclidean vector magnitudes. Run code to execute test verification.
                </p>
              </div>

              {/* Code Editor Area */}
              <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-mono font-bold text-cyan-400">solution.ts</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRunCode}
                      disabled={codeRunning}
                      className="px-4 py-1.5 rounded-xl font-extrabold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-400/30 flex items-center gap-1.5 text-xs transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{codeRunning ? 'Executing...' : 'Run & Test'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  value={codeContent}
                  onChange={e => setCodeContent(e.target.value)}
                  rows={12}
                  className="w-full p-4 bg-slate-950 font-mono text-xs sm:text-sm text-cyan-300 focus:outline-none resize-y selection:bg-cyan-500 selection:text-black"
                  spellCheck={false}
                />
              </div>

              {/* Output Terminal & Test Results */}
              {codeOutput && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 font-mono text-xs">
                  <div className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    Terminal Output:
                  </div>
                  <pre className="text-emerald-400 whitespace-pre-wrap">{codeOutput}</pre>

                  {testResults.length > 0 && (
                    <div className="space-y-1.5 pt-2 border-t border-slate-800">
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Automated Test Verifications:
                      </div>
                      {testResults.map((tc, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{tc.description}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-between">
                <button
                  onClick={() => setActiveStage(3)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white text-xs"
                >
                  ← Previous Stage
                </button>
                <button
                  onClick={() => handleAdvanceStage(5)}
                  className="px-6 py-3 rounded-2xl font-extrabold text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-lg shadow-cyan-400/25 flex items-center gap-2 text-xs transition-all"
                >
                  <span>Advance to Knowledge Challenge</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 5: KNOWLEDGE DUEL / ADAPTIVE CHALLENGE */}
          {activeStage === 5 && (
            <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-widest text-cyan-400">
                  <Award className="w-4 h-4" />
                  <span>Stage 5: Knowledge Evaluation Checkpoint</span>
                </div>
                <span className="text-xs text-amber-400 font-bold">+50 XP Challenge</span>
              </div>

              <div>
                <h3 className="text-xl font-extrabold text-white mb-2">
                  What is the fundamental difference between Cosine Similarity and Euclidean Distance?
                </h3>
                <p className="text-xs text-slate-400">
                  Select the correct answer to complete this stage and claim your XP reward.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  'Cosine Similarity measures angle orientation regardless of magnitude; Euclidean measures straight-line distance.',
                  'Euclidean Distance can only be used on 2D coordinates; Cosine Similarity works only on text.',
                  'Cosine distance is always an integer between 0 and 100; Euclidean distance is negative.',
                  'There is no mathematical difference; they are exact aliases.',
                ].map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedOption(idx);
                      setIsAnswerSubmitted(true);
                      if (idx === 0) {
                        playSuccessSound(soundEnabled);
                      }
                    }}
                    className={`w-full p-4 rounded-2xl text-left text-xs sm:text-sm font-semibold transition-all border ${
                      isAnswerSubmitted
                        ? idx === 0
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : selectedOption === idx
                          ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                          : 'bg-slate-800/40 border-slate-700 text-slate-400'
                        : selectedOption === idx
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-700/60 text-xs flex items-center justify-center font-bold">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                  </button>
                ))}
              </div>

              {isAnswerSubmitted && (
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Evaluation Verified: Correct!</span>
                  </div>
                  <p className="text-slate-300">
                    Cosine similarity inspects the angular orientation between high-dimensional vectors, ignoring absolute vector length.
                  </p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-between">
                <button
                  onClick={() => setActiveStage(4)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-400 hover:text-white text-xs"
                >
                  ← Previous Stage
                </button>
                <button
                  disabled={!isAnswerSubmitted}
                  onClick={() => handleAdvanceStage(6)}
                  className={`px-6 py-3 rounded-2xl font-extrabold flex items-center gap-2 text-xs transition-all ${
                    isAnswerSubmitted
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 shadow-lg shadow-amber-500/30 hover:scale-105'
                      : 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Claim Rewards & Complete Quest</span>
                </button>
              </div>
            </div>
          )}

          {/* STAGE 6: QUEST COMPLETION CELEBRATION */}
          {activeStage === 6 && (
            <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-cyan-950/80 via-slate-900 to-purple-950/80 border border-cyan-500/40 text-center space-y-6 shadow-2xl shadow-cyan-500/20 animate-fadeIn">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 to-cyan-400 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-cyan-500/40 animate-bounce-subtle">
                <Award className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
                  Mission Accomplished
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
                  Quest Sector Fully Conquered!
                </h2>
                <p className="text-sm text-slate-300 max-w-md mx-auto">
                  You successfully mastered all 6 stages of <strong>{currentLesson.title}</strong> and advanced your skill mastery index.
                </p>
              </div>

              <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-lg">
                <Zap className="w-5 h-5 fill-amber-400" />
                <span>+{currentLesson.xpReward} XP Awarded</span>
              </div>

              <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={onBack}
                  className="px-6 py-3.5 rounded-2xl font-bold text-xs sm:text-sm text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
                >
                  Return to Syllabus
                </button>
                {getNextLesson() && (
                  <button
                    onClick={() => onNavigateLesson(getNextLesson()!.id)}
                    className="px-8 py-3.5 rounded-2xl font-extrabold text-xs sm:text-sm text-slate-950 bg-cyan-400 hover:bg-cyan-300 shadow-xl shadow-cyan-400/30 flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <span>Launch Next Mission</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Mission Syllabus & Curriculum Index */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Sector Syllabus</span>
              </h3>
              <span className="text-xs text-slate-400">
                {completedLessonIds.length} / {allLessons.length} Done
              </span>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
              {course.chapters.map(ch => (
                <div key={ch.id} className="space-y-2">
                  <span className="text-[11px] font-bold uppercase text-slate-400 tracking-wider block">
                    {ch.title}
                  </span>
                  <div className="space-y-1.5">
                    {ch.lessons.map(l => {
                      const isCurrent = l.id === currentLesson.id;
                      const isDone = completedLessonIds.includes(l.id);

                      return (
                        <button
                          key={l.id}
                          onClick={() => onNavigateLesson(l.id)}
                          className={`w-full p-3 rounded-2xl text-left text-xs font-semibold flex items-center justify-between transition-all border ${
                            isCurrent
                              ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300 font-bold shadow-md'
                              : isDone
                              ? 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800'
                              : 'bg-slate-900/40 border-transparent text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {isDone ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            ) : (
                              <Play className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            )}
                            <span className="truncate">{l.title}</span>
                          </div>
                          <span className="text-[10px] text-amber-400 font-bold shrink-0">
                            +{l.xpReward} XP
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notes Drawer Modal */}
      {notesDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 p-6 flex flex-col justify-between animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Mission Study Notes</span>
              </h3>
              <button onClick={() => setNotesDrawerOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {notes.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-10">No notes recorded for this course yet.</p>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1 text-xs">
                    <span className="text-[10px] text-cyan-400 font-bold block">{note.lessonTitle}</span>
                    <p className="text-slate-200 whitespace-pre-wrap">{note.text}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-slate-800">
              <textarea
                value={newNoteText}
                onChange={e => setNewNoteText(e.target.value)}
                placeholder="Write a personal observation or takeaway..."
                rows={3}
                className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300"
              >
                Save Note
              </button>
            </form>
          </div>
        </div>
      )}

      {/* NOVA AI Mentor Sliding Drawer */}
      {aiSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-slate-900 border-l border-violet-500/30 p-6 flex flex-col justify-between animate-fadeIn space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-violet-400" />
                <div>
                  <h3 className="text-base font-extrabold text-white">NOVA AI Mentor</h3>
                  <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
                    {aiMode.toUpperCase()} MODE ACTIVE
                  </span>
                </div>
              </div>
              <button onClick={() => setAiSidebarOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Mode Selector Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pb-2 border-b border-slate-800">
              {(['explain', 'practice', 'challenge', 'revision', 'exam'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setAiMode(m)}
                  className={`py-1.5 rounded-lg text-[10px] font-extrabold uppercase transition-all ${
                    aiMode === m
                      ? 'bg-violet-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {aiChatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-violet-950/60 border border-violet-500/30 text-white ml-6'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 mr-6'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                </div>
              ))}
              {aiLoading && (
                <div className="p-3 rounded-xl bg-slate-800 text-slate-400 text-xs italic flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                  <span>NOVA Mentor is synthesizing response...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-[11px]">
              <button
                onClick={() => handleSendAiPrompt('Explain this concept step-by-step with an analogy', 'explain')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
              >
                💡 Explain Step-by-Step
              </button>
              <button
                onClick={() => handleSendAiPrompt('Give me a practice exercise with hints', 'practice')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
              >
                🎯 Practice Challenge
              </button>
              <button
                onClick={() => handleSendAiPrompt('Test my knowledge with a duel question', 'challenge')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
              >
                ⚔️ Knowledge Duel
              </button>
            </div>

            {/* Input Form */}
            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <input
                type="text"
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendAiPrompt()}
                placeholder={`Ask in ${aiMode} mode...`}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-violet-500"
              />
              <button
                onClick={() => handleSendAiPrompt()}
                disabled={aiLoading}
                className="px-4 py-2.5 rounded-xl font-bold text-white bg-violet-600 hover:bg-violet-500 shadow-md transition-all text-xs flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
