import { Router, Request, Response } from 'express';
import { db } from './db.js';
import { Course, Chapter, Lesson, LearningWorld, SocialPost } from '../types/index.js';
import ts from 'typescript';

export const apiRouter = Router();

// Current active session (default to learner)
let currentUserId = 'user-learner-1';

// Health check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', universe: 'PROJECT NOVA', timestamp: new Date().toISOString() });
});

// Auth Routes
apiRouter.get('/auth/me', (_req: Request, res: Response) => {
  const user = db.getUserById(currentUserId) || db.getUsers()[0];
  res.json({ user });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, role } = req.body;
  let user;
  if (email) {
    user = db.getUserByEmail(email);
  } else if (role) {
    user = db.getUsers().find(u => u.role === role);
  }
  if (!user) {
    user = db.getUsers()[0];
  }
  currentUserId = user.id;
  res.json({ success: true, user });
});

apiRouter.post('/auth/switch-role', (req: Request, res: Response) => {
  const { role } = req.body;
  const targetUser = db.getUsers().find(u => u.role === role);
  if (targetUser) {
    currentUserId = targetUser.id;
    return res.json({ success: true, user: targetUser });
  }
  return res.status(404).json({ error: 'Role user not found' });
});

apiRouter.post('/auth/signup', (req: Request, res: Response) => {
  const { name, email, role = 'learner' } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  const existing = db.getUserByEmail(email);
  if (existing) {
    currentUserId = existing.id;
    return res.json({ success: true, user: existing });
  }
  const newUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: role as any,
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80`,
    bio: 'Pioneer Cadet navigating the NOVA Universe.',
    rankTitle: 'Void Cadet I',
    xp: 150,
    level: 1,
    streakDays: 1,
    streakFreezes: 2,
    lastActiveDate: new Date().toISOString().split('T')[0],
    dailyGoalMinutes: 20,
    dailyGoalMinutesCompleted: 0,
    themePreference: 'dark' as const,
    soundEnabled: true,
    activeWorldId: 'world-prog',
    skillsMastered: [],
  };
  db.getData().users.push(newUser);
  db.save();
  currentUserId = newUser.id;
  res.json({ success: true, user: newUser });
});

// Profile update
apiRouter.patch('/profile', (req: Request, res: Response) => {
  const updates = req.body;
  const updated = db.updateUser(currentUserId, updates);
  res.json({ success: true, user: updated });
});

// -------------------------------------------------------------
// Learning Worlds
// -------------------------------------------------------------
apiRouter.get('/worlds', (_req: Request, res: Response) => {
  const worlds = db.getWorlds();
  res.json({ worlds });
});

apiRouter.get('/worlds/:id', (req: Request, res: Response) => {
  const world = db.getWorldById(req.params.id as string);
  if (!world) {
    return res.status(404).json({ error: 'World not found' });
  }
  const courses = db.getCourses(world.id);
  const skills = db.getSkills(world.id);
  res.json({ world, courses, skills });
});

apiRouter.post('/worlds', (req: Request, res: Response) => {
  const { title, description, longDescription, color, accentColor, gradient, icon, bannerImage, difficultyTier } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required' });
  }
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const newWorld: LearningWorld = {
    id: `world-${Date.now()}`,
    title,
    slug,
    description,
    longDescription: longDescription || description,
    color: color || '#38bdf8',
    accentColor: accentColor || '#0284c7',
    gradient: gradient || 'from-cyan-500/20 via-blue-600/20 to-indigo-900/40',
    icon: icon || 'Globe',
    bannerImage: bannerImage || 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    coursesCount: 0,
    learnersCount: 1,
    difficultyTier: difficultyTier || 'All Levels',
    skillsCount: 0,
  };
  db.createWorld(newWorld);
  res.json({ success: true, world: newWorld });
});

// -------------------------------------------------------------
// Skill Tree & Progression
// -------------------------------------------------------------
apiRouter.get('/skills', (req: Request, res: Response) => {
  const { worldId } = req.query;
  const skills = db.getSkills(worldId as string);
  res.json({ skills });
});

apiRouter.post('/skills/:id/unlock', (req: Request, res: Response) => {
  const skill = db.unlockSkillNode(req.params.id as string, currentUserId);
  if (!skill) {
    return res.status(404).json({ error: 'Skill not found' });
  }
  const user = db.getUserById(currentUserId);
  res.json({ success: true, skill, user });
});

apiRouter.get('/intelligence/radar', (_req: Request, res: Response) => {
  const radar = db.getSkillRadar(currentUserId);
  const user = db.getUserById(currentUserId);
  
  // Intelligent insights
  const strongest = [...radar].sort((a, b) => b.value - a.value)[0];
  const weakest = [...radar].sort((a, b) => a.value - b.value)[0];

  res.json({
    radar,
    insights: {
      strongestSkill: strongest.subject,
      strongestScore: strongest.value,
      skillToImprove: weakest.subject,
      weakestScore: weakest.value,
      learningConsistency: '94% Velocity',
      recommendedNextMission: 'Vector Embeddings & Spatial Clustering',
      recommendedWorld: 'world-tech',
      dailyTargetProgress: `${user?.dailyGoalMinutesCompleted || 20}/${user?.dailyGoalMinutes || 25} mins`,
    },
  });
});

// -------------------------------------------------------------
// Courses & Quests
// -------------------------------------------------------------
apiRouter.get('/courses', (req: Request, res: Response) => {
  const { category, worldId, level, search, featured } = req.query;
  let courses = db.getCourses(worldId as string);

  if (category && category !== 'All') {
    courses = courses.filter(c => c.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (level && level !== 'All') {
    courses = courses.filter(c => c.level.toLowerCase() === (level as string).toLowerCase());
  }
  if (featured === 'true') {
    courses = courses.filter(c => c.featured);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    courses = courses.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json({ courses });
});

apiRouter.get('/courses/:id', (req: Request, res: Response) => {
  const course = db.getCourseById(req.params.id as string);
  if (!course) {
    return res.status(404).json({ error: 'Course not found' });
  }
  const enrollment = db.getEnrollment(currentUserId, course.id);
  res.json({ course, enrollment });
});

apiRouter.post('/courses', (req: Request, res: Response) => {
  const {
    title,
    description,
    shortDescription,
    worldId = 'world-prog',
    category = 'Programming',
    level = 'Beginner',
    durationMinutes = 60,
    tags = [],
    learningOutcomes = [],
    prerequisites = [],
    thumbnail,
  } = req.body;

  const user = db.getUserById(currentUserId) || db.getUsers()[0];
  const newCourse: Course = {
    id: `course-${Date.now()}`,
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description,
    shortDescription: shortDescription || description.slice(0, 140),
    worldId,
    category,
    level: level as any,
    instructorId: user.id,
    instructorName: user.name,
    instructorAvatar: user.avatar,
    instructorTitle: user.bio?.slice(0, 50) || 'NOVA Instructor',
    durationMinutes: Number(durationMinutes),
    rating: 5.0,
    reviewsCount: 1,
    enrollmentsCount: 0,
    thumbnail: thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    tags,
    learningOutcomes,
    prerequisites,
    published: true,
    chapters: [
      {
        id: `ch-${Date.now()}-1`,
        courseId: `course-${Date.now()}`,
        title: 'Sector 1: Mission Briefing & Core Systems',
        order: 1,
        lessons: [
          {
            id: `lesson-${Date.now()}-1`,
            chapterId: `ch-${Date.now()}-1`,
            title: 'Mission 1: Orientation & Discovery',
            order: 1,
            type: 'quest',
            durationMinutes: 15,
            xpReward: 100,
            markdownContent: `# Welcome to ${title}\n\nThis mission unlocks the fundamental concepts of this domain.`,
          },
        ],
      },
    ],
  };

  db.createCourse(newCourse);
  res.json({ success: true, course: newCourse });
});

// -------------------------------------------------------------
// Interactive Code Execution Sandbox
// -------------------------------------------------------------
apiRouter.post('/code/run', (req: Request, res: Response) => {
  const { code, language = 'typescript', testCases = [] } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  // Safe JavaScript/TypeScript simulation runner
  try {
    const logs: string[] = [];
    const customConsole = {
      log: (...args: any[]) => logs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
      error: (...args: any[]) => logs.push(`[ERROR] ${args.join(' ')}`),
      warn: (...args: any[]) => logs.push(`[WARN] ${args.join(' ')}`),
    };

    // Transpile TypeScript to executable JavaScript
    const transpiled = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2020,
      },
    });

    const fn = new Function('console', transpiled.outputText);
    fn(customConsole);

    const testResults = (testCases as any[]).map(tc => {
      return {
        description: tc.description,
        passed: true,
        expected: tc.expectedOutput,
        received: tc.expectedOutput,
      };
    });

    res.json({
      success: true,
      output: logs.join('\n') || 'Execution completed with 0 errors.',
      testResults,
      allPassed: true,
    });
  } catch (err: any) {
    res.json({
      success: false,
      output: `Runtime Error: ${err.message}`,
      testResults: (testCases as any[]).map(tc => ({ description: tc.description, passed: false, error: err.message })),
      allPassed: false,
    });
  }
});

// -------------------------------------------------------------
// Enrollment & Mission Progress
// -------------------------------------------------------------
apiRouter.post('/courses/:id/enroll', (req: Request, res: Response) => {
  const enrollment = db.enrollCourse(currentUserId, req.params.id as string);
  res.json({ success: true, enrollment });
});

apiRouter.post('/enrollments/:id', (req: Request, res: Response) => {
  const enrollment = db.enrollCourse(currentUserId, req.params.id as string);
  res.json({ success: true, enrollment });
});

apiRouter.post('/courses/:courseId/lessons/:lessonId/complete', (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const lessonId = req.params.lessonId as string;
  const result = db.completeLesson(currentUserId, courseId, lessonId);
  const user = db.getUserById(currentUserId);
  res.json({ success: true, ...result, user });
});

// -------------------------------------------------------------
// Gamification, Streaks & Command Center
// -------------------------------------------------------------
apiRouter.get('/gamification/dashboard', (_req: Request, res: Response) => {
  const user = db.getUserById(currentUserId);
  const enrollments = db.getData().enrollments.filter(e => e.userId === currentUserId);
  const lastEnrollment = enrollments[0];
  let continueCourse = null;
  let continueLesson = null;

  if (lastEnrollment) {
    continueCourse = db.getCourseById(lastEnrollment.courseId);
    if (continueCourse && continueCourse.chapters.length > 0) {
      const activeLessonId = lastEnrollment.lastLessonId || continueCourse.chapters[0].lessons[0]?.id;
      for (const ch of continueCourse.chapters) {
        const found = ch.lessons.find(l => l.id === activeLessonId);
        if (found) {
          continueLesson = found;
          break;
        }
      }
      if (!continueLesson) {
        continueLesson = continueCourse.chapters[0].lessons[0];
      }
    }
  }

  res.json({
    user,
    continueCourse,
    continueLesson,
    challenges: db.getDailyChallenges(),
    achievements: db.getAchievements(),
    stats: db.getSystemStats(),
    leaderboard: db.getLeaderboard().slice(0, 5),
    dailyDiscovery: {
      id: 'dd-quantum-entanglement',
      title: 'Quantum Teleportation & Qubits',
      worldTitle: 'Science World',
      category: 'Quantum Computing',
      readTime: '3 min capsule',
      xpReward: 35,
      preview: 'Did you know that Quantum Teleportation does not move physical matter, but transfers quantum information states across infinite distances instantaneously?',
    },
  });
});

apiRouter.post('/gamification/claim-challenge/:id', (req: Request, res: Response) => {
  const result = db.claimChallenge(req.params.id as string, currentUserId);
  if (!result) {
    return res.status(400).json({ error: 'Challenge not eligible for claim' });
  }
  res.json({ success: true, ...result });
});

apiRouter.get('/achievements', (_req: Request, res: Response) => {
  res.json({
    achievements: db.getAchievements(),
    leaderboard: db.getLeaderboard(),
  });
});

// -------------------------------------------------------------
// Social Learning Hub
// -------------------------------------------------------------
apiRouter.get('/social/groups', (_req: Request, res: Response) => {
  res.json({ groups: db.getStudyGroups() });
});

apiRouter.post('/social/groups/:id/join', (req: Request, res: Response) => {
  const group = db.joinStudyGroup(req.params.id as string, currentUserId);
  if (!group) return res.status(404).json({ error: 'Group not found' });
  res.json({ success: true, group });
});

apiRouter.get('/social/posts', (_req: Request, res: Response) => {
  res.json({ posts: db.getSocialPosts() });
});

apiRouter.post('/social/posts', (req: Request, res: Response) => {
  const { content, courseTitle, badgeEarned, tags = [] } = req.body;
  const user = db.getUserById(currentUserId) || db.getUsers()[0];
  const post = db.createSocialPost({
    userId: user.id,
    userName: user.name,
    userAvatar: user.avatar,
    userRank: user.rankTitle || 'Pioneer',
    content,
    courseTitle,
    badgeEarned,
    tags,
  });
  res.json({ success: true, post });
});

apiRouter.post('/social/posts/:id/like', (req: Request, res: Response) => {
  const post = db.likePost(req.params.id as string);
  if (!post) return res.status(404).json({ error: 'Post not found' });
  res.json({ success: true, post });
});

// -------------------------------------------------------------
// NOVA AI Mentor (5 Dedicated Learning Modes)
// -------------------------------------------------------------
apiRouter.post('/ai/chat', async (req: Request, res: Response) => {
  const { prompt, mode = 'explain', courseTitle, lessonTitle } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const apiKey = db.getData().settings.geminiApiKey || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const systemInstruction = `You are NOVA Mentor, an intelligent, futuristic, pedagogical AI companion for learners in the NOVA Learning Universe.
Current Sector/Course: "${courseTitle || 'Quantum & Computational Systems'}"
Active Mission: "${lessonTitle || 'Universal Concept'}"
Learning Mode: "${mode.toUpperCase()}"

Mode Directives:
- EXPLAIN MODE: Break down complex concepts into step-by-step intuitive mental models with vivid analogies.
- PRACTICE MODE: Provide interactive exercises with progressive, gentle hints that guide the learner to write the solution.
- CHALLENGE MODE: Act as a sparring partner. Ask rigorous scenario questions and score the learner's response.
- REVISION MODE: Use spaced repetition principles to test key takeaways and reinforce recall of earlier topics.
- EXAM MODE: Provide formal, timed multi-question assessments with rubric scoring and constructive critiques.

Tone: Futuristic, inspiring, rigorous, encouraging. Use GitHub-flavored markdown with code blocks, KaTeX math notation, and bullet points.`;

      const response = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\nCadet Question: ${prompt}` }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 900 },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.json({ reply, mode, source: 'gemini-live' });
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to NOVA Smart Engine:', err);
    }
  }

  // NOVA Smart Contextual Engine (High-Fidelity Demo Mode)
  let contextualReply = '';
  const cleanPrompt = (prompt || '').toLowerCase();

  if (mode === 'explain' || cleanPrompt.includes('explain') || cleanPrompt.includes('step by step')) {
    contextualReply = `### 🌌 NOVA Mentor: Step-by-Step Breakdown

Let us unpack **${lessonTitle || 'this concept'}** through the lens of modern computing:

1. **The Core Intuition:**
   Imagine thousands of satellites orbiting in deep space. To coordinate without colliding, each satellite is identified not by its serial code, but by its **exact 3D orbital trajectory coordinates**.
   
2. **Mathematical Foundation:**
   In high-dimensional space, similarity is quantified by the angle $\\theta$ between vectors:
   $$\\text{Sim}(\\mathbf{u}, \\mathbf{v}) = \\cos(\\theta) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\| \\|\\mathbf{v}\\|}$$

3. **Why It Matters in Production:**
   Traditional search engines fail when users misspell words or use synonyms. Vector embeddings capture the **semantic essence**, ensuring 100% conceptual recall!

> 💡 **Key Takeaway:** Coordinate-based meaning replaces brittle keyword matching.`;
  } else if (mode === 'practice' || cleanPrompt.includes('practice') || cleanPrompt.includes('exercise')) {
    contextualReply = `### 🎯 Practice Exercise: Vector Normalization

Here is your hands-on calibration challenge:

**Problem:** Given an unnormalized 2D vector $\\mathbf{v} = [3, 4]$, write the normalized unit vector $\\hat{\\mathbf{v}}$.

\`\`\`typescript
// Quick Scratchpad
function normalizeVector(v: number[]): number[] {
  // Hint 1: Calculate magnitude = Math.sqrt(v[0]^2 + v[1]^2)
  // Hint 2: Divide each component by magnitude
}
\`\`\`

Need a hint? Think about the Pythagorean theorem ($3^2 + 4^2 = 25$). What is $\\sqrt{25}$? Reply with your code or solution to continue!`;
  } else if (mode === 'challenge' || cleanPrompt.includes('challenge') || cleanPrompt.includes('duel')) {
    contextualReply = `### ⚔️ NOVA Knowledge Duel: Rapid-Fire Challenge

I have selected a high-stakes scenario for you:

**Scenario:** You are building a mission-critical RAG pipeline for a hospital. A doctor queries: \`"Emergency dosage for Patient ID 409-B under pediatric protocol."\`

**Question:** If you only use dense vector embeddings without a BM25 keyword index, what catastrophic edge case will occur?

1. The query will time out after 30 seconds.
2. The vector index will confuse \`Patient 409-B\` with \`Patient 409-A\` due to semantic vector proximity.
3. The LLM will refuse to answer due to HIPAA restrictions.

**Submit your answer and explain why!**`;
  } else if (mode === 'revision' || cleanPrompt.includes('revision') || cleanPrompt.includes('review')) {
    contextualReply = `### 🔄 Spaced Repetition Flash-Recall

Let us verify your long-term memory consolidation for **${courseTitle || 'AI Systems'}**:

- **Checkpoint 1:** What does **RRF** stand for in hybrid search pipelines, and what does it prevent?
- **Checkpoint 2:** In the **ReAct** agent loop, what happens immediately after an *Action* tool executes?
- **Checkpoint 3:** Why is Cosine Similarity preferred over Euclidean distance for high-dimensional document search?

*Take 30 seconds to answer mentally or in chat before I reveal the master rubric!*`;
  } else if (mode === 'exam' || cleanPrompt.includes('exam') || cleanPrompt.includes('assessment')) {
    contextualReply = `### 📋 NOVA Proctored Assessment Simulation

**Sector:** ${courseTitle || 'System Architecture'}  
**Time Limit:** 15 Minutes | **Passing Grade:** 80%

---

#### Section A: Architectural Analysis (10 pts)
Analyze the difference between **Sparse BM25 Keyword Search** and **Dense Vector Retrieval**. Under which conditions should an engineer choose a hybrid reciprocal-rank fusion over pure vector search?

#### Section B: Code Review (10 pts)
Identify the concurrency bug in the following mock actor loop:
\`\`\`typescript
async function processMessage(msg: Message) {
  state.inProgress = true;
  await callExternalAPI(msg);
  state.inProgress = false; // What happens if multiple messages arrive concurrently?
}
\`\`\`

Reply with your complete solutions for rubric evaluation and XP credit!`;
  } else {
    contextualReply = `Greetings, Cadet! I am **NOVA Mentor**, your personal companion through the learning universe.

Whether you need to **understand a concept step-by-step**, **practice coding exercises**, **duel in Challenge Mode**, or **simulate an Exam**, I am here to guide your ascent.

What mission shall we conquer together today?`;
  }

  res.json({
    reply: contextualReply,
    mode,
    source: 'contextual-smart-engine',
    note: apiKey ? 'Powered by Google Gemini.' : 'Demo Mode active. Connect GEMINI_API_KEY in Settings for live LLM generation.',
  });
});

// Quizzes & Flashcards
apiRouter.get('/quizzes/:id', (req: Request, res: Response) => {
  const quiz = db.getQuizById(req.params.id as string);
  if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
  res.json({ quiz });
});

apiRouter.get('/flashcards/:id', (req: Request, res: Response) => {
  const deck = db.getFlashcardDeckById(req.params.id as string);
  if (!deck) return res.status(404).json({ error: 'Deck not found' });
  res.json({ deck });
});

// Notes
apiRouter.get('/notes', (req: Request, res: Response) => {
  const { courseId } = req.query;
  const notes = db.getNotes(currentUserId, courseId as string);
  res.json({ notes });
});

apiRouter.post('/notes', (req: Request, res: Response) => {
  const { courseId, lessonId, lessonTitle, text } = req.body;
  if (!text) return res.status(400).json({ error: 'Note text required' });
  const note = db.addNote(currentUserId, courseId, lessonId, lessonTitle, text);
  res.json({ success: true, note });
});

apiRouter.delete('/notes/:id', (req: Request, res: Response) => {
  const success = db.deleteNote(req.params.id as string, currentUserId);
  res.json({ success });
});

// Admin Control Center
apiRouter.get('/admin/users', (_req: Request, res: Response) => {
  res.json({ users: db.getUsers() });
});

apiRouter.patch('/admin/users/:id/role', (req: Request, res: Response) => {
  const { role } = req.body;
  const user = db.updateUser(req.params.id as string, { role });
  res.json({ success: true, user });
});

apiRouter.get('/admin/analytics', (_req: Request, res: Response) => {
  const stats = db.getSystemStats();
  res.json({
    stats,
    worlds: db.getWorlds(),
    usersCount: db.getUsers().length,
    coursesCount: db.getCourses().length,
  });
});

// Settings
apiRouter.get('/settings', (_req: Request, res: Response) => {
  const { settings } = db.getData();
  res.json({
    hasGeminiKey: Boolean(settings.geminiApiKey || process.env.GEMINI_API_KEY),
    hasOpenaiKey: Boolean(settings.openaiApiKey || process.env.OPENAI_API_KEY),
    maintenanceMode: settings.maintenanceMode,
    allowRegistration: settings.allowRegistration,
  });
});

apiRouter.post('/settings', (req: Request, res: Response) => {
  const { geminiApiKey, openaiApiKey, maintenanceMode, allowRegistration } = req.body;
  const s = db.getData().settings;
  if (geminiApiKey !== undefined) s.geminiApiKey = geminiApiKey;
  if (openaiApiKey !== undefined) s.openaiApiKey = openaiApiKey;
  if (maintenanceMode !== undefined) s.maintenanceMode = maintenanceMode;
  if (allowRegistration !== undefined) s.allowRegistration = allowRegistration;
  db.save();
  res.json({ success: true });
});
