import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  User,
  Course,
  Enrollment,
  Achievement,
  DailyChallenge,
  LearningPath,
  Note,
  Submission,
  SystemStats,
  LeaderboardEntry,
  Quiz,
  FlashcardDeck,
  LearningWorld,
  SkillNode,
  SkillRadarItem,
  StudyGroup,
  SocialPost,
  Bookmark,
} from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.VERCEL ? path.join('/tmp', 'nova-data') : path.resolve(__dirname, '../../data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DatabaseSchema {
  users: User[];
  worlds: LearningWorld[];
  skills: SkillNode[];
  courses: Course[];
  quizzes: Quiz[];
  flashcardDecks: FlashcardDeck[];
  enrollments: Enrollment[];
  achievements: Achievement[];
  dailyChallenges: DailyChallenge[];
  learningPaths: LearningPath[];
  notes: Note[];
  bookmarks: Bookmark[];
  submissions: Submission[];
  leaderboard: LeaderboardEntry[];
  studyGroups: StudyGroup[];
  socialPosts: SocialPost[];
  settings: {
    geminiApiKey?: string;
    openaiApiKey?: string;
    maintenanceMode: boolean;
    allowRegistration: boolean;
  };
}

const DEFAULT_USERS: User[] = [
  {
    id: 'user-learner-1',
    name: 'Alex Rivers',
    email: 'alex@nova.universe',
    role: 'learner',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    bio: 'Pioneer Cadet navigating Autonomous AI Systems and Full-Stack Orbital Architectures.',
    rankTitle: 'Void Navigator III',
    xp: 1420,
    level: 4,
    streakDays: 7,
    streakFreezes: 2,
    lastActiveDate: new Date().toISOString().split('T')[0],
    dailyGoalMinutes: 25,
    dailyGoalMinutesCompleted: 20,
    themePreference: 'dark',
    soundEnabled: true,
    activeWorldId: 'world-prog',
    skillsMastered: ['skill-1', 'skill-2', 'skill-3', 'skill-tech-1', 'skill-des-1'],
  },
  {
    id: 'user-instructor-1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@nova.universe',
    role: 'instructor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    bio: 'Staff AI Architect & Quantum Computing Scholar. Lead Commander of the AI Systems Guild.',
    rankTitle: 'Master Architect',
    xp: 5800,
    level: 9,
    streakDays: 28,
    streakFreezes: 5,
    lastActiveDate: new Date().toISOString().split('T')[0],
    dailyGoalMinutes: 45,
    dailyGoalMinutesCompleted: 45,
    themePreference: 'dark',
    soundEnabled: true,
    activeWorldId: 'world-tech',
    skillsMastered: ['skill-1', 'skill-2', 'skill-3', 'skill-4', 'skill-5', 'skill-tech-1', 'skill-tech-2'],
  },
  {
    id: 'user-admin-1',
    name: 'Marcus Vance',
    email: 'admin@nova.universe',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    bio: 'NOVA Universe Overseer & Chief Learning Ecosystem Architect.',
    rankTitle: 'Universe Commander',
    xp: 9999,
    level: 12,
    streakDays: 60,
    streakFreezes: 10,
    lastActiveDate: new Date().toISOString().split('T')[0],
    dailyGoalMinutes: 60,
    dailyGoalMinutesCompleted: 60,
    themePreference: 'dark',
    soundEnabled: true,
    activeWorldId: 'world-tech',
    skillsMastered: ['skill-1', 'skill-2', 'skill-3', 'skill-4', 'skill-5', 'skill-6', 'skill-7'],
  },
];

const DEFAULT_WORLDS: LearningWorld[] = [
  {
    id: 'world-prog',
    title: 'Programming World',
    slug: 'programming-world',
    description: 'Master core computational foundations, distributed algorithms, TypeScript, Rust, and systems architecture.',
    longDescription: 'Enter the algorithmic reactor. Here, code is woven into high-performance software systems. Move from elemental syntax to distributed topologies, metaprogramming, and reactive architectures.',
    color: '#38bdf8',
    accentColor: '#0284c7',
    gradient: 'from-cyan-500/20 via-blue-600/20 to-indigo-900/40',
    icon: 'Terminal',
    bannerImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    coursesCount: 8,
    learnersCount: 3840,
    difficultyTier: 'All Levels',
    skillsCount: 14,
    featuredCourseId: 'course-ai-agentic',
  },
  {
    id: 'world-tech',
    title: 'Technology World',
    slug: 'technology-world',
    description: 'Explore the frontiers of Autonomous AI, Cloud Fabrics, Quantum Information, and Cyber Defense.',
    longDescription: 'The nerve center of futuristic infrastructure. Command LLMs as reasoning engines, deploy resilient Kubernetes fabrics, and explore quantum circuit simulation.',
    color: '#818cf8',
    accentColor: '#4f46e5',
    gradient: 'from-indigo-500/20 via-purple-600/20 to-slate-900/40',
    icon: 'Cpu',
    bannerImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    coursesCount: 6,
    learnersCount: 2950,
    difficultyTier: 'Intermediate to Expert',
    skillsCount: 12,
    featuredCourseId: 'course-cloud-scale',
  },
  {
    id: 'world-design',
    title: 'Design World',
    slug: 'design-world',
    description: 'Craft immersive spatial interfaces, generative UI systems, fluid motion physics, and accessible design tokens.',
    longDescription: 'Where aesthetics fuse with precision engineering. Construct futuristic dashboards, holographic spatial palettes, and high-performance design component systems.',
    color: '#f43f5e',
    accentColor: '#e11d48',
    gradient: 'from-rose-500/20 via-pink-600/20 to-purple-900/40',
    icon: 'Palette',
    bannerImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    coursesCount: 5,
    learnersCount: 2180,
    difficultyTier: 'Beginner to Advanced',
    skillsCount: 10,
    featuredCourseId: 'course-design-systems',
  },
  {
    id: 'world-biz',
    title: 'Business World',
    slug: 'business-world',
    description: 'Architect venture scalability, master algorithmic finance, product-market velocity, and exponential growth.',
    longDescription: 'Turn technical breakthroughs into enduring planetary institutions. Learn venture modeling, unit economics, defensible moats, and product strategy.',
    color: '#10b981',
    accentColor: '#059669',
    gradient: 'from-emerald-500/20 via-teal-600/20 to-slate-900/40',
    icon: 'Briefcase',
    bannerImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    coursesCount: 4,
    learnersCount: 1890,
    difficultyTier: 'Intermediate',
    skillsCount: 9,
    featuredCourseId: 'course-venture-arch',
  },
  {
    id: 'world-sci',
    title: 'Science World',
    slug: 'science-world',
    description: 'Delve into theoretical astrophysics, neuro-computation, synthetic biology, and complex dynamical systems.',
    longDescription: 'Probe the deepest laws of reality. Model celestial orbital mechanics, neural connectomes, and cellular gene regulatory networks.',
    color: '#a855f7',
    accentColor: '#9333ea',
    gradient: 'from-purple-500/20 via-violet-600/20 to-indigo-950/40',
    icon: 'Atom',
    bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    coursesCount: 4,
    learnersCount: 1640,
    difficultyTier: 'Advanced to Expert',
    skillsCount: 8,
    featuredCourseId: 'course-neuro-cog',
  },
  {
    id: 'world-mind',
    title: 'Personal Development World',
    slug: 'personal-development-world',
    description: 'Supercharge focus latency, enter deep cognitive flow states, master mental models, and lifelong habits.',
    longDescription: 'Upgrade your organic CPU. Implement circadian optimization, deliberate practice protocols, second-brain synthesis, and stoic mental resilience.',
    color: '#f59e0b',
    accentColor: '#d97706',
    gradient: 'from-amber-500/20 via-orange-600/20 to-slate-900/40',
    icon: 'Sparkles',
    bannerImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    coursesCount: 5,
    learnersCount: 2750,
    difficultyTier: 'All Levels',
    skillsCount: 8,
    featuredCourseId: 'course-flow-mastery',
  },
  {
    id: 'world-lang',
    title: 'Language World',
    slug: 'language-world',
    description: 'Master global languages, computational linguistics, neural translation protocols, and high-stakes negotiation.',
    longDescription: 'Bridge minds across civilizations. Understand polyglot phonology, natural language semantics, cultural rhetoric, and real-time translation pipelines.',
    color: '#06b6d4',
    accentColor: '#0891b2',
    gradient: 'from-cyan-500/20 via-sky-600/20 to-slate-900/40',
    icon: 'Globe',
    bannerImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    coursesCount: 3,
    learnersCount: 1420,
    difficultyTier: 'Beginner to Intermediate',
    skillsCount: 7,
    featuredCourseId: 'course-polyglot-ai',
  },
];

const DEFAULT_SKILLS: SkillNode[] = [
  // Programming Tree Nodes
  {
    id: 'skill-1',
    worldId: 'world-prog',
    name: 'Computational Fundamentals',
    category: 'Programming',
    level: 1,
    xpRequired: 100,
    status: 'mastered',
    prerequisites: [],
    nextSkills: ['skill-2'],
    description: 'Binary logic, memory addressing, CPU cycles, and fundamental execution models.',
    icon: 'Cpu',
    masteryPercentage: 100,
    relatedCourseId: 'course-ai-agentic',
  },
  {
    id: 'skill-2',
    worldId: 'world-prog',
    name: 'Variables & Memory Types',
    category: 'Programming',
    level: 1,
    xpRequired: 200,
    status: 'mastered',
    prerequisites: ['skill-1'],
    nextSkills: ['skill-3'],
    description: 'Stack vs heap allocation, primitives, references, and static type checking.',
    icon: 'Box',
    masteryPercentage: 100,
    relatedCourseId: 'course-ai-agentic',
  },
  {
    id: 'skill-3',
    worldId: 'world-prog',
    name: 'Logic Loops & Control Flow',
    category: 'Programming',
    level: 2,
    xpRequired: 350,
    status: 'mastered',
    prerequisites: ['skill-2'],
    nextSkills: ['skill-4'],
    description: 'Conditionals, deterministic iteration, recursion, and branch prediction patterns.',
    icon: 'Repeat',
    masteryPercentage: 100,
    relatedCourseId: 'course-ai-agentic',
  },
  {
    id: 'skill-4',
    worldId: 'world-prog',
    name: 'Modular Functions & Scopes',
    category: 'Programming',
    level: 2,
    xpRequired: 500,
    status: 'in_progress',
    prerequisites: ['skill-3'],
    nextSkills: ['skill-5'],
    description: 'Pure functions, closures, higher-order functions, and functional composition.',
    icon: 'Code2',
    masteryPercentage: 65,
    relatedCourseId: 'course-ai-agentic',
  },
  {
    id: 'skill-5',
    worldId: 'world-prog',
    name: 'Data Structures & Trees',
    category: 'Programming',
    level: 3,
    xpRequired: 750,
    status: 'in_progress',
    prerequisites: ['skill-4'],
    nextSkills: ['skill-6'],
    description: 'Hash tables, binary search trees, graph representations, and memory locality.',
    icon: 'Network',
    masteryPercentage: 40,
    relatedCourseId: 'course-ai-agentic',
  },
  {
    id: 'skill-6',
    worldId: 'world-prog',
    name: 'Algorithms & Complexity',
    category: 'Programming',
    level: 3,
    xpRequired: 1100,
    status: 'available',
    prerequisites: ['skill-5'],
    nextSkills: ['skill-7'],
    description: 'Big-O asymptotic bounds, dynamic programming, divide-and-conquer, and graph traversal.',
    icon: 'Activity',
    masteryPercentage: 0,
    relatedCourseId: 'course-ai-agentic',
  },
  {
    id: 'skill-7',
    worldId: 'world-prog',
    name: 'Distributed Systems & Concurrency',
    category: 'Programming',
    level: 4,
    xpRequired: 1600,
    status: 'locked',
    prerequisites: ['skill-6'],
    nextSkills: [],
    description: 'Raft consensus, actor patterns, event-sourcing, and high-throughput pipelines.',
    icon: 'Share2',
    masteryPercentage: 0,
    relatedCourseId: 'course-cloud-scale',
  },

  // Tech / AI Tree Nodes
  {
    id: 'skill-tech-1',
    worldId: 'world-tech',
    name: 'Vector Embeddings & Geometry',
    category: 'Technology',
    level: 1,
    xpRequired: 250,
    status: 'mastered',
    prerequisites: ['skill-2'],
    nextSkills: ['skill-tech-2'],
    description: 'High-dimensional vector spaces, cosine distance, semantic clustering, and dense projections.',
    icon: 'Layers',
    masteryPercentage: 100,
    relatedCourseId: 'course-ai-agentic',
  },
  {
    id: 'skill-tech-2',
    worldId: 'world-tech',
    name: 'Retrieval Augmented Generation (RAG)',
    category: 'Technology',
    level: 2,
    xpRequired: 600,
    status: 'in_progress',
    prerequisites: ['skill-tech-1'],
    nextSkills: ['skill-tech-3'],
    description: 'Hybrid sparse/dense search, reciprocal rank fusion, chunking windows, and re-ranking models.',
    icon: 'Database',
    masteryPercentage: 75,
    relatedCourseId: 'course-ai-agentic',
  },
  {
    id: 'skill-tech-3',
    worldId: 'world-tech',
    name: 'Autonomous Agentic Swarms',
    category: 'Technology',
    level: 3,
    xpRequired: 1200,
    status: 'available',
    prerequisites: ['skill-tech-2'],
    nextSkills: ['skill-tech-4'],
    description: 'ReAct loops, dynamic tool calling, self-critique loops, and multi-agent coordination.',
    icon: 'Bot',
    masteryPercentage: 20,
    relatedCourseId: 'course-ai-agentic',
  },
  {
    id: 'skill-tech-4',
    worldId: 'world-tech',
    name: 'Quantum Quantum Circuits',
    category: 'Technology',
    level: 4,
    xpRequired: 2000,
    status: 'locked',
    prerequisites: ['skill-tech-3'],
    nextSkills: [],
    description: 'Qubits, quantum superposition, entanglement, and Shor/Grover algorithm simulation.',
    icon: 'Radio',
    masteryPercentage: 0,
  },

  // Design Tree Nodes
  {
    id: 'skill-des-1',
    worldId: 'world-design',
    name: 'Design Tokens & Visual Systems',
    category: 'Design',
    level: 1,
    xpRequired: 200,
    status: 'mastered',
    prerequisites: [],
    nextSkills: ['skill-des-2'],
    description: 'Atomic color palettes, typographic scales, spacing rhythm, and accessibility contrast.',
    icon: 'Sliders',
    masteryPercentage: 100,
    relatedCourseId: 'course-design-systems',
  },
  {
    id: 'skill-des-2',
    worldId: 'world-design',
    name: 'Spatial UI & Micro-interactions',
    category: 'Design',
    level: 2,
    xpRequired: 550,
    status: 'in_progress',
    prerequisites: ['skill-des-1'],
    nextSkills: ['skill-des-3'],
    description: 'Spring physics, glassmorphism depth, gesture kinematics, and tactile audio feedback.',
    icon: 'Sparkles',
    masteryPercentage: 50,
    relatedCourseId: 'course-design-systems',
  },
  {
    id: 'skill-des-3',
    worldId: 'world-design',
    name: 'Generative UI & Dynamic Layouts',
    category: 'Design',
    level: 3,
    xpRequired: 1000,
    status: 'locked',
    prerequisites: ['skill-des-2'],
    nextSkills: [],
    description: 'Adaptive components synthesized by LLMs in real-time based on user intent.',
    icon: 'Layout',
    masteryPercentage: 0,
    relatedCourseId: 'course-design-systems',
  },
];

const DEFAULT_QUIZZES: Quiz[] = [
  {
    id: 'quiz-ai-1',
    lessonId: 'lesson-ai-3',
    title: 'Mission Evaluation: LLM Fundamentals & Embeddings',
    passingScore: 70,
    questions: [
      {
        id: 'q1',
        quizId: 'quiz-ai-1',
        questionText: 'What is the primary function of a vector embedding in modern AI systems?',
        options: [
          'To compress video files for faster streaming',
          'To convert text, images, or audio into dense mathematical vectors capturing semantic meaning',
          'To encrypt user passwords using symmetric hashing algorithms',
          'To store relational tables in SQL format',
        ],
        correctOptionIndex: 1,
        explanation: 'Embeddings map high-dimensional semantic relationships into vector space, allowing similar concepts to cluster together.',
        hint: 'Think about how search engines find synonyms without exact word matches.',
      },
      {
        id: 'q2',
        quizId: 'quiz-ai-1',
        questionText: 'Which similarity metric is most commonly used for measuring similarity between normalized vector embeddings?',
        options: [
          'Cosine Similarity',
          'Levenshtein Distance',
          'MD5 Checksum Comparison',
          'Binary XOR Distance',
        ],
        correctOptionIndex: 0,
        explanation: 'Cosine similarity measures the cosine of the angle between two vectors, ranging from -1 to 1, regardless of vector magnitude.',
        hint: 'It measures the angle between vectors.',
      },
      {
        id: 'q3',
        quizId: 'quiz-ai-1',
        questionText: 'In Retrieval-Augmented Generation (RAG), what is the role of the Retrieval step?',
        options: [
          'Fine-tuning the LLM weights permanently on disk',
          'Fetching relevant domain chunks from a vector database and injecting them into the prompt context',
          'Generating the final synthesized response directly to the user',
          'Compressing tokens into a zip archive',
        ],
        correctOptionIndex: 1,
        explanation: 'Retrieval queries your knowledge base for relevant chunks and injects them into the context window, grounding the LLM.',
        hint: 'It fetches context before the LLM generates the answer.',
      },
    ],
  },
  {
    id: 'quiz-ux-1',
    lessonId: 'lesson-ux-3',
    title: 'Checkpoint: Design Systems & Kinetic Ergonomics',
    passingScore: 75,
    questions: [
      {
        id: 'qux1',
        quizId: 'quiz-ux-1',
        questionText: 'According to WCAG 2.1 AA guidelines, what is the minimum contrast ratio required for standard body text against its background?',
        options: ['3:1', '4.5:1', '7:1', '2.5:1'],
        correctOptionIndex: 1,
        explanation: 'WCAG AA requires at least 4.5:1 for standard body text and 3:1 for large text.',
        hint: 'Four and a half to one.',
      },
      {
        id: 'qux2',
        quizId: 'quiz-ux-1',
        questionText: 'What is a "Design Token" in modern UI engineering?',
        options: [
          'A cryptocurrency used to buy Figma plugins',
          'An atomic visual design decision stored as reusable data (e.g., color, spacing, typography)',
          'An authentication JWT token stored in browser cookies',
          'A visual watermark placed on wireframes',
        ],
        correctOptionIndex: 1,
        explanation: 'Design tokens are platform-agnostic variables representing foundational styling choices across web, iOS, and Android.',
        hint: 'It stores values like colors, font-sizes, and border-radii.',
      },
    ],
  },
];

const DEFAULT_FLASHCARDS: FlashcardDeck[] = [
  {
    id: 'deck-ai-1',
    lessonId: 'lesson-ai-4',
    title: 'Core AI & Autonomous Agent Terminology',
    cards: [
      {
        id: 'fc1',
        front: 'What is Hallucination in Large Language Models?',
        back: 'When an AI model generates factually incorrect, nonsensical, or fabricated information with high semantic confidence.',
        tag: 'Reliability',
        hint: 'It sounds confident but is factually wrong.',
      },
      {
        id: 'fc2',
        front: 'What is Zero-Shot Prompting?',
        back: 'Providing a prompt to an AI model without giving any prior examples or demonstration pairs.',
        tag: 'Prompt Engineering',
        hint: 'No training examples in the prompt.',
      },
      {
        id: 'fc3',
        front: 'What is the ReAct Pattern in Autonomous Agents?',
        back: 'A prompting framework combining "Reasoning" (Thought) and "Acting" (Tool execution) in an iterative loop to solve multi-step problems.',
        tag: 'Agents',
        hint: 'Reason + Act loop.',
      },
      {
        id: 'fc4',
        front: 'What is Quantization (e.g., INT8, FP4)?',
        back: 'Reducing the numerical precision of model weights from 16/32-bit floats to smaller bit representations to save VRAM and speed up inference.',
        tag: 'Optimization',
        hint: 'Low-bit representations.',
      },
    ],
  },
];

const DEFAULT_COURSES: Course[] = [
  {
    id: 'course-ai-agentic',
    title: 'Full-Stack AI Engineering: From RAG to Autonomous Agents',
    slug: 'full-stack-ai-engineering',
    worldId: 'world-tech',
    worldTitle: 'Technology World',
    category: 'Technology',
    level: 'Intermediate',
    instructorId: 'user-instructor-1',
    instructorName: 'Dr. Sarah Chen',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    instructorTitle: 'Staff AI Researcher & Stanford Fellow',
    durationMinutes: 180,
    rating: 4.95,
    reviewsCount: 412,
    enrollmentsCount: 1680,
    thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=1200&q=80',
    tags: ['Artificial Intelligence', 'LLM', 'Vector DB', 'RAG', 'Agents', 'Python', 'TypeScript'],
    learningOutcomes: [
      'Understand transformer embeddings, chunking strategies, and vector distance metrics',
      'Build resilient RAG pipelines with hybrid keyword and semantic retrieval',
      'Design autonomous agents using the ReAct loop and function/tool calling',
      'Deploy low-latency AI backends with streaming responses and guardrails',
    ],
    prerequisites: ['Basic JavaScript or Python knowledge', 'Understanding of REST APIs'],
    published: true,
    featured: true,
    xpRewardTotal: 650,
    badgeReward: 'Nebula Agent Architect',
    shortDescription: 'Master modern AI architectures: vector search, hybrid retrieval, agent tool-calling, and production deployment.',
    description: `Dive deep into the new wave of software engineering where LLMs act as reasoning engines. This hands-on quest takes you from fundamental embedding mechanics and hybrid vector retrieval to crafting production-grade multi-agent swarms that execute complex tasks autonomously.

Through interactive missions, live code sandboxes, visual architecture diagrams, quizzes, and project assignments, you will understand how to eliminate hallucinations, architect scalable RAG pipelines, and build resilient AI workflows.`,
    chapters: [
      {
        id: 'ch-ai-1',
        courseId: 'course-ai-agentic',
        title: 'Mission Sector 1: Vector Geometry & Embeddings',
        order: 1,
        lessons: [
          {
            id: 'lesson-ai-1',
            chapterId: 'ch-ai-1',
            title: 'Mission 1: The Geometry of Meaning — Vector Embeddings',
            order: 1,
            type: 'quest',
            durationMinutes: 18,
            xpReward: 90,
            videoUrl: 'https://www.youtube-nocookie.com/embed/aircAruvnKk',
            stages: {
              stage1Concept: `Welcome to the frontier of AI intelligence. In traditional software, databases query exact strings. But human language is nuanced, poetic, and synonymous.

Vector Embeddings transform text, code, audio, and images into high-dimensional numerical coordinates (e.g. 1536 floating-point values in OpenAI text-embedding-3-small). Concepts that share semantic meaning cluster tightly in geometric vector space.`,
              stage2VisualDiagram: {
                id: 'diag-vector',
                title: 'High-Dimensional Vector Projection',
                description: 'Interactive visualization of semantic distance clustering in 3D coordinate projection.',
                nodes: [
                  { id: 'n1', label: 'Query: "Cute Puppy"', sublabel: 'Vector: [0.82, 0.14, 0.91]', color: '#38bdf8', icon: 'Sparkles' },
                  { id: 'n2', label: 'Match: "Golden Retriever"', sublabel: 'Cosine Sim: 0.94', color: '#10b981', icon: 'CheckCircle' },
                  { id: 'n3', label: 'Match: "Canine Play"', sublabel: 'Cosine Sim: 0.88', color: '#10b981', icon: 'CheckCircle' },
                  { id: 'n4', label: 'Distant: "Quantum Mechanics"', sublabel: 'Cosine Sim: 0.12', color: '#f43f5e', icon: 'XCircle' },
                ],
                connections: [
                  { from: 'n1', to: 'n2', label: 'Near match' },
                  { from: 'n1', to: 'n3', label: 'Semantic cluster' },
                  { from: 'n1', to: 'n4', label: 'Orthogonal / Distant' },
                ],
              },
              stage3Content: `### Why Vector Geometry Dominates Modern AI

When we say two concepts are "similar," what does that mean mathematically?

1. **Euclidean Distance ($L_2$ Norm)**: Measures the straight-line physical distance between coordinates.
2. **Dot Product**: Multiplies corresponding vector values and sums them. Favors vectors with larger magnitudes.
3. **Cosine Similarity**: Normalizes vectors to unit length and measures the angle $\\theta$ between them:
   $$\\text{Cosine Similarity} = \\frac{\\mathbf{A} \\cdot \\mathbf{B}}{\\|\\mathbf{A}\\| \\|\\mathbf{B}\\|}$$

Because modern embedding models normalize vectors before returning them, Cosine Similarity directly correlates to semantic similarity, with values bounded between \`-1.0\` and \`1.0\`.`,
              stage4Exercise: {
                id: 'code-vector-sim',
                title: 'Implement Cosine Similarity in TypeScript',
                instructions: 'Complete the computeCosineSimilarity function so that it returns the cosine similarity between two numeric arrays. Ensure you handle zero magnitudes safely.',
                language: 'typescript',
                starterCode: `function computeCosineSimilarity(a: number[], b: number[]): number {
  // Your mission: Calculate dot product and vector magnitudes
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  
  return dotProduct / denominator;
}

// Test vectors
const v1 = [1, 2, 3];
const v2 = [1, 2, 3];
console.log("Similarity:", computeCosineSimilarity(v1, v2));`,
                solutionCode: `function computeCosineSimilarity(a: number[], b: number[]): number {
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
}`,
                testCases: [
                  { input: '[1, 0], [1, 0]', expectedOutput: '1.00', description: 'Identical vectors score 1.0' },
                  { input: '[1, 0], [0, 1]', expectedOutput: '0.00', description: 'Orthogonal vectors score 0.0' },
                  { input: '[1, 1], [-1, -1]', expectedOutput: '-1.00', description: 'Opposite vectors score -1.0' },
                ],
                hints: ['Iterate through both arrays in a loop to compute dotProduct += a[i] * b[i]', 'Use Math.sqrt(normA) * Math.sqrt(normB)'],
              },
              stage5QuizId: 'quiz-ai-1',
            },
            markdownContent: `### Executive Mission Briefing

In this mission, you unlocked the foundational primitive of Artificial Intelligence: **Vector Geometry**.

#### Core Takeaways:
- Embeddings translate arbitrary symbolic tokens into geometric coordinates.
- Cosine similarity measures angular orientation, independent of token length.
- Vector search is the foundation for semantic memory in autonomous agents.`,
            quizId: 'quiz-ai-1',
          },
          {
            id: 'lesson-ai-2',
            chapterId: 'ch-ai-1',
            title: 'Mission 2: Hybrid RAG — Balancing Keywords & Meaning',
            order: 2,
            type: 'text',
            durationMinutes: 20,
            xpReward: 100,
            markdownContent: `### The Limits of Pure Vector Search

Vector search is brilliant at understanding conceptual synonyms (e.g. "laptop won't turn on" matches "MacBook black screen"). 

However, pure vector search often struggles with:
- Exact part numbers (\`SKU-9924-X\`)
- Specific legal statute citations (\`Article 14-B\`)
- Rare acronyms or unique user identifiers

**Hybrid Search** solves this by running BM25 keyword matching and dense vector search in parallel, merging their rank scores using **Reciprocal Rank Fusion (RRF)**:

$$RRF(d) = \\sum_{m \\in M} \\frac{1}{60 + r_m(d)}$$

This guarantees zero loss of exact technical specificity while preserving semantic discovery!`,
          },
          {
            id: 'lesson-ai-3',
            chapterId: 'ch-ai-1',
            title: 'Knowledge Challenge: Vector & RAG Master Checkpoint',
            order: 3,
            type: 'quiz',
            durationMinutes: 12,
            xpReward: 80,
            quizId: 'quiz-ai-1',
          },
          {
            id: 'lesson-ai-4',
            chapterId: 'ch-ai-1',
            title: 'Mission 4: Autonomous Flashcard Drill',
            order: 4,
            type: 'flashcards',
            durationMinutes: 10,
            xpReward: 60,
            flashcardDeckId: 'deck-ai-1',
          },
        ],
      },
      {
        id: 'ch-ai-2',
        courseId: 'course-ai-agentic',
        title: 'Mission Sector 2: Building Autonomous Multi-Agent Swarms',
        order: 2,
        lessons: [
          {
            id: 'lesson-ai-5',
            chapterId: 'ch-ai-2',
            title: 'Mission 5: The ReAct Loop — Reasoning Meets Execution',
            order: 1,
            type: 'text',
            durationMinutes: 22,
            xpReward: 110,
            markdownContent: `### The ReAct Pattern in Autonomous Agents

Single-turn prompt-response systems are passive. To create agents that execute real-world missions, we use the **ReAct (Reason + Act)** pattern.

In each cycle, the agent performs:
1. **Thought:** Analyzes current state and plans the next step.
2. **Action:** Selects an executable tool (e.g. \`search_web\`, \`run_sql\`, \`call_api\`) with typed parameters.
3. **Observation:** Receives tool execution results and updates working memory.
4. **Conclusion:** Once the termination criteria are satisfied, formulates the final answer.`,
          },
        ],
      },
    ],
  },
  {
    id: 'course-cloud-scale',
    title: 'Distributed Cloud Fabrics & Kubernetes Orchestration',
    slug: 'distributed-cloud-fabrics',
    worldId: 'world-tech',
    worldTitle: 'Technology World',
    category: 'Technology',
    level: 'Advanced',
    instructorId: 'user-admin-1',
    instructorName: 'Marcus Vance',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    instructorTitle: 'Universe Commander & Infrastructure Lead',
    durationMinutes: 210,
    rating: 4.88,
    reviewsCount: 289,
    enrollmentsCount: 1120,
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    tags: ['Kubernetes', 'Cloud', 'DevOps', 'Distributed Systems', 'Go', 'Docker'],
    learningOutcomes: [
      'Architect multi-region zero-downtime microservice meshes',
      'Implement custom Kubernetes Operators with Go and client-go',
      'Deploy automatic horizontal pod autoscaling based on custom Prometheus metrics',
    ],
    prerequisites: ['Docker foundations', 'Basic networking'],
    published: true,
    featured: true,
    xpRewardTotal: 700,
    badgeReward: 'Orbital Fabric Engineer',
    shortDescription: 'Master modern cloud orchestration, service meshes, eBPF telemetry, and resilient distributed clusters.',
    description: 'Learn how hyperscale tech companies run fault-tolerant global software fleets. Construct declarative Kubernetes manifests, orchestrate ingress controllers, configure mutual TLS, and automate self-healing deployments.',
    chapters: [
      {
        id: 'ch-cloud-1',
        courseId: 'course-cloud-scale',
        title: 'Sector 1: Control Plane Mechanics & Ingress',
        order: 1,
        lessons: [
          {
            id: 'lesson-cloud-1',
            chapterId: 'ch-cloud-1',
            title: 'Mission 1: The Kubernetes Reconciliation Loop',
            order: 1,
            type: 'text',
            durationMinutes: 25,
            xpReward: 95,
            markdownContent: `### The Declarative Magic of Kubernetes

Kubernetes is built around a single, beautiful paradigm: **The Control Loop**.

\`\`\`
Current State  ───►  Observe  ───►  Analyze Diff  ───►  Actuate  ───►  Desired State
\`\`\`

You declare what your cluster *should* look like (3 replicas of Service X), and the controller continually works to make reality match your specification.`,
          },
        ],
      },
    ],
  },
  {
    id: 'course-design-systems',
    title: 'Futuristic Design Systems & Kinetic Micro-Interactions',
    slug: 'futuristic-design-systems',
    worldId: 'world-design',
    worldTitle: 'Design World',
    category: 'Design',
    level: 'Beginner',
    instructorId: 'user-instructor-1',
    instructorName: 'Dr. Sarah Chen',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    instructorTitle: 'Staff AI Researcher & Stanford Fellow',
    durationMinutes: 140,
    rating: 4.92,
    reviewsCount: 310,
    enrollmentsCount: 1350,
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
    tags: ['UI/UX', 'Figma', 'CSS', 'Tailwind', 'Design Systems', 'Animation'],
    learningOutcomes: [
      'Build scalable multi-brand design tokens using modern CSS variables',
      'Implement physics-based spring animations for natural user feedback',
      'Design accessible dark-first cyberpunk and glassmorphism interfaces',
    ],
    prerequisites: ['Basic HTML/CSS'],
    published: true,
    featured: true,
    xpRewardTotal: 550,
    badgeReward: 'Spatial Aesthetic Master',
    shortDescription: 'Construct glowing dark-mode interfaces, spring animations, glassmorphism, and accessible token architectures.',
    description: 'Transform boring corporate software into an otherworldly aesthetic experience. Master typography hierarchy, contrast ratios, glowing neon accents, and spring physics.',
    chapters: [
      {
        id: 'ch-des-1',
        courseId: 'course-design-systems',
        title: 'Sector 1: Foundations of Futuristic Ergonomics',
        order: 1,
        lessons: [
          {
            id: 'lesson-ux-1',
            chapterId: 'ch-des-1',
            title: 'Mission 1: The Dark-First Philosophy & Light Emission',
            order: 1,
            type: 'text',
            durationMinutes: 15,
            xpReward: 80,
            markdownContent: `### Designing for the Void

In futuristic interfaces, dark backgrounds are not just an inverted color scheme. They represent deep cosmic canvas space, allowing selective points of electric blue, violet, and amber to guide the learner's attention like stars in an astronomical chart.`,
          },
          {
            id: 'lesson-ux-3',
            chapterId: 'ch-des-1',
            title: 'Mission 2: Design Token Verification Challenge',
            order: 2,
            type: 'quiz',
            durationMinutes: 10,
            xpReward: 70,
            quizId: 'quiz-ux-1',
          },
        ],
      },
    ],
  },
  {
    id: 'course-venture-arch',
    title: 'Venture Architecture: Bootstrapping to Global Scale',
    slug: 'venture-architecture',
    worldId: 'world-biz',
    worldTitle: 'Business World',
    category: 'Business',
    level: 'Intermediate',
    instructorId: 'user-admin-1',
    instructorName: 'Marcus Vance',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
    instructorTitle: 'Universe Commander',
    durationMinutes: 160,
    rating: 4.85,
    reviewsCount: 195,
    enrollmentsCount: 890,
    thumbnail: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    tags: ['Venture Capital', 'Startups', 'Strategy', 'Unit Economics', 'Growth'],
    learningOutcomes: [
      'Model SaaS unit economics (CAC, LTV, Net Retention Rate)',
      'Construct investor-grade financial models and data rooms',
      'Design viral product-led growth loops that self-compound',
    ],
    prerequisites: ['Basic business interest'],
    published: true,
    featured: false,
    xpRewardTotal: 600,
    badgeReward: 'Titan Venture Architect',
    shortDescription: 'Master financial modeling, defensible moats, product-led growth loops, and venture fundraising.',
    description: 'Learn how visionary founders turn code into self-sustaining technological empires. Master unit economics, pitch strategy, capitalization tables, and governance.',
    chapters: [],
  },
  {
    id: 'course-neuro-cog',
    title: 'Neuro-Computation & Deep Flow State Engineering',
    slug: 'neuro-computation-flow',
    worldId: 'world-sci',
    worldTitle: 'Science World',
    category: 'Science',
    level: 'Advanced',
    instructorId: 'user-instructor-1',
    instructorName: 'Dr. Sarah Chen',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    instructorTitle: 'Staff AI Researcher',
    durationMinutes: 150,
    rating: 4.96,
    reviewsCount: 220,
    enrollmentsCount: 940,
    thumbnail: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    tags: ['Neuroscience', 'Cognition', 'Flow State', 'Mental Models', 'Focus'],
    learningOutcomes: [
      'Harness dopamine circuits for sustainable intrinsic motivation',
      'Engineer 90-minute ultradian flow sessions with zero context switching',
      'Implement spaced repetition algorithms based on Ebbinghaus forgetting curves',
    ],
    prerequisites: ['Curiosity about biology and cognition'],
    published: true,
    featured: false,
    xpRewardTotal: 580,
    badgeReward: 'Synaptic Navigator',
    shortDescription: 'Upgrade human cognition with dopamine neurochemistry, ultradian flow states, and mental stamina.',
    description: 'Unlock maximum mental focus through science. Explore the neural mechanisms of attention, memory encoding, and cognitive endurance.',
    chapters: [],
  },
  {
    id: 'course-polyglot-ai',
    title: 'Neural Linguistics & Multilingual AI Translation',
    slug: 'neural-linguistics-multilingual',
    worldId: 'world-lang',
    worldTitle: 'Language World',
    category: 'Language',
    level: 'Beginner',
    instructorId: 'user-instructor-1',
    instructorName: 'Dr. Sarah Chen',
    instructorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    instructorTitle: 'Staff AI Researcher',
    durationMinutes: 120,
    rating: 4.89,
    reviewsCount: 160,
    enrollmentsCount: 780,
    thumbnail: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80',
    tags: ['Linguistics', 'Polyglot', 'Translation', 'Natural Language', 'Semantics'],
    learningOutcomes: [
      'Understand comparative grammar structures across major language families',
      'Build real-time audio neural speech-to-speech translation pipelines',
      'Develop intuitive rapid vocabulary retention through etymological roots',
    ],
    prerequisites: ['Basic linguistic interest'],
    published: true,
    featured: false,
    xpRewardTotal: 500,
    badgeReward: 'Polyglot Vanguard',
    shortDescription: 'Master universal grammar, rapid language acquisition protocols, and real-time neural translation.',
    description: 'Explore the fascinating bridge between human polyglot fluency and modern computational linguistics.',
    chapters: [],
  },
];

const DEFAULT_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-1',
    userId: 'user-learner-1',
    courseId: 'course-ai-agentic',
    enrolledAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    progressPercentage: 50,
    completedLessonIds: ['lesson-ai-1', 'lesson-ai-2'],
    lastLessonId: 'lesson-ai-1',
    lastAccessedAt: new Date().toISOString(),
  },
  {
    id: 'enr-2',
    userId: 'user-learner-1',
    courseId: 'course-design-systems',
    enrolledAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    progressPercentage: 25,
    completedLessonIds: ['lesson-ux-1'],
    lastLessonId: 'lesson-ux-1',
    lastAccessedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
  },
];

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-step',
    title: 'First Steps in the Cosmos',
    description: 'Complete your first learning mission in any world.',
    icon: 'Sparkles',
    xpReward: 100,
    category: 'special',
    unlockedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    progress: 1,
    maxProgress: 1,
  },
  {
    id: 'ach-knowledge-seeker',
    title: 'Knowledge Seeker',
    description: 'Complete five full learning missions across the universe.',
    icon: 'Compass',
    xpReward: 250,
    category: 'courses',
    unlockedAt: undefined,
    progress: 3,
    maxProgress: 5,
  },
  {
    id: 'ach-consistency-master',
    title: 'Consistency Master',
    description: 'Maintain an unbroken learning streak for 7 consecutive days.',
    icon: 'Flame',
    xpReward: 350,
    category: 'streak',
    unlockedAt: new Date().toISOString(),
    progress: 7,
    maxProgress: 7,
  },
  {
    id: 'ach-problem-solver',
    title: 'Problem Solver',
    description: 'Conquer 10 interactive coding sandboxes and practice challenges.',
    icon: 'Cpu',
    xpReward: 400,
    category: 'quizzes',
    unlockedAt: undefined,
    progress: 6,
    maxProgress: 10,
  },
  {
    id: 'ach-skill-explorer',
    title: 'Skill Tree Explorer',
    description: 'Master at least three connected nodes in the interactive skill tree.',
    icon: 'Network',
    xpReward: 500,
    category: 'skills',
    unlockedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    progress: 3,
    maxProgress: 3,
  },
  {
    id: 'ach-nebula-pioneer',
    title: 'Nebula Pioneer',
    description: 'Earn over 1,000 XP in total exploration rewards.',
    icon: 'Trophy',
    xpReward: 600,
    category: 'xp',
    unlockedAt: new Date().toISOString(),
    progress: 1420,
    maxProgress: 1000,
  },
];

const DEFAULT_DAILY_CHALLENGES: DailyChallenge[] = [
  {
    id: 'dc-1',
    title: 'Orbital Focus',
    description: 'Complete at least 1 learning mission today.',
    xpReward: 60,
    goal: 1,
    current: 1,
    completed: true,
    claimed: false,
    icon: 'CheckCircle2',
    type: 'lessons',
  },
  {
    id: 'dc-2',
    title: 'Vector Calibration',
    description: 'Score 80%+ on an interactive Knowledge Challenge.',
    xpReward: 80,
    goal: 1,
    current: 1,
    completed: true,
    claimed: false,
    icon: 'Zap',
    type: 'quiz',
  },
  {
    id: 'dc-3',
    title: 'Temporal Velocity',
    description: 'Spend 20 focused minutes inside the Learning Studio.',
    xpReward: 70,
    goal: 20,
    current: 20,
    completed: true,
    claimed: false,
    icon: 'Clock',
    type: 'minutes',
  },
  {
    id: 'dc-4',
    title: 'Skill Node Awakening',
    description: 'Advance a skill node in the Programming or Tech skill tree.',
    xpReward: 100,
    goal: 1,
    current: 0,
    completed: false,
    claimed: false,
    icon: 'Network',
    type: 'skill',
  },
];

const DEFAULT_STUDY_GROUPS: StudyGroup[] = [
  {
    id: 'group-ai-swarms',
    name: 'AI Swarm Architects',
    tagline: 'Engineering production multi-agent systems and reasoning loops.',
    description: 'A global guild of autonomous agent engineers collaborating on open-source vector pipelines, tool schemas, and self-evaluating agents.',
    worldId: 'world-tech',
    memberCount: 842,
    banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    activeMission: 'Collaborative Vector Distance Benchmark',
    joined: true,
  },
  {
    id: 'group-fullstack-orbital',
    name: 'Orbital Full-Stack Guild',
    tagline: 'TypeScript metaprogramming, Rust systems, and low-latency servers.',
    description: 'Deep-dive code reviews, architecture RFCs, and high-performance frontend state machines.',
    worldId: 'world-prog',
    memberCount: 1250,
    banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    activeMission: 'Zero-Copy Serialization in TypeScript',
    joined: false,
  },
  {
    id: 'group-quantum-nebula',
    name: 'Quantum & Physics Collective',
    tagline: 'Simulating quantum logic gates and computational neuroscience.',
    description: 'Bridging quantum mechanics, linear algebra, and synthetic biology into actionable algorithms.',
    worldId: 'world-sci',
    memberCount: 460,
    banner: 'https://images.unsplash.com/photo-1507499739999-097706ad8914?auto=format&fit=crop&w=800&q=80',
    activeMission: 'Bloch Sphere State Simulation',
    joined: false,
  },
];

const DEFAULT_SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    userId: 'user-instructor-1',
    userName: 'Dr. Sarah Chen',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80',
    userRank: 'Master Architect',
    content: 'Just deployed the new 6-stage interactive quest for Vector Embeddings! Check out Stage 4 for the live TypeScript Cosine Similarity sandbox. Let me know your best benchmark times!',
    courseTitle: 'Full-Stack AI Engineering',
    likes: 48,
    likedByMe: true,
    repliesCount: 12,
    createdAt: '2 hours ago',
    tags: ['AI', 'VectorSearch', 'Challenge'],
  },
  {
    id: 'post-2',
    userId: 'user-learner-1',
    userName: 'Alex Rivers',
    userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    userRank: 'Void Navigator III',
    content: 'Just unlocked the "Skill Tree Explorer" achievement! Mastered 3 connected nodes in the Programming Tree. The visual dependency graph made prerequisite gaps immediately obvious.',
    badgeEarned: 'Skill Tree Explorer',
    likes: 31,
    likedByMe: false,
    repliesCount: 5,
    createdAt: '5 hours ago',
    tags: ['Achievement', 'SkillTree', 'Milestone'],
  },
];

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, userId: 'user-admin-1', name: 'Marcus Vance', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80', xp: 9999, streakDays: 60, tier: 'Diamond', activeWorld: 'Technology World' },
  { rank: 2, userId: 'user-instructor-1', name: 'Dr. Sarah Chen', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=250&q=80', xp: 5800, streakDays: 28, tier: 'Diamond', activeWorld: 'Technology World' },
  { rank: 3, userId: 'user-top-3', name: 'Elena Rostov', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80', xp: 3200, streakDays: 19, tier: 'Gold', activeWorld: 'Programming World' },
  { rank: 4, userId: 'user-learner-1', name: 'Alex Rivers', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80', xp: 1420, streakDays: 7, tier: 'Gold', isCurrentUser: true, activeWorld: 'Programming World' },
  { rank: 5, userId: 'user-top-5', name: 'Kenji Sato', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80', xp: 1180, streakDays: 5, tier: 'Silver', activeWorld: 'Design World' },
  { rank: 6, userId: 'user-top-6', name: 'Zoe Morales', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80', xp: 950, streakDays: 4, tier: 'Silver', activeWorld: 'Business World' },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): DatabaseSchema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        // Ensure new arrays exist
        if (!parsed.worlds || parsed.worlds.length === 0) parsed.worlds = DEFAULT_WORLDS;
        if (!parsed.skills || parsed.skills.length === 0) parsed.skills = DEFAULT_SKILLS;
        if (!parsed.studyGroups) parsed.studyGroups = DEFAULT_STUDY_GROUPS;
        if (!parsed.socialPosts) parsed.socialPosts = DEFAULT_SOCIAL_POSTS;
        if (!parsed.bookmarks) parsed.bookmarks = [];
        return parsed;
      }
    } catch (err) {
      console.warn('Could not read existing db.json, generating default NOVA universe store:', err);
    }

    const initial: DatabaseSchema = {
      users: DEFAULT_USERS,
      worlds: DEFAULT_WORLDS,
      skills: DEFAULT_SKILLS,
      courses: DEFAULT_COURSES,
      quizzes: DEFAULT_QUIZZES,
      flashcardDecks: DEFAULT_FLASHCARDS,
      enrollments: DEFAULT_ENROLLMENTS,
      achievements: DEFAULT_ACHIEVEMENTS,
      dailyChallenges: DEFAULT_DAILY_CHALLENGES,
      learningPaths: [],
      notes: [],
      bookmarks: [],
      submissions: [],
      leaderboard: DEFAULT_LEADERBOARD,
      studyGroups: DEFAULT_STUDY_GROUPS,
      socialPosts: DEFAULT_SOCIAL_POSTS,
      settings: {
        geminiApiKey: process.env.GEMINI_API_KEY || '',
        openaiApiKey: process.env.OPENAI_API_KEY || '',
        maintenanceMode: false,
        allowRegistration: true,
      },
    };

    this.saveData(initial);
    return initial;
  }

  private saveData(dataToSave: DatabaseSchema) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(dataToSave, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Unable to persist db.json to disk (read-only environment):', err);
    }
  }

  public save() {
    this.saveData(this.data);
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // Users
  public getUsers() { return this.data.users; }
  public getUserById(id: string) { return this.data.users.find(u => u.id === id); }
  public getUserByEmail(email: string) { return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase()); }
  public updateUser(id: string, updates: Partial<User>) {
    const user = this.getUserById(id);
    if (!user) return null;
    Object.assign(user, updates);
    this.save();
    return user;
  }

  // XP & Levels
  public addXp(userId: string, xpAmount: number) {
    const user = this.getUserById(userId);
    if (!user) return { user: null, leveledUp: false, oldLevel: 1, newLevel: 1 };

    const oldLevel = user.level;
    user.xp += xpAmount;

    // Level formula: Level = floor(xp / 300) + 1
    const newLevel = Math.max(1, Math.floor(user.xp / 300) + 1);
    const leveledUp = newLevel > oldLevel;
    user.level = newLevel;

    // Update leaderboard entry
    const lb = this.data.leaderboard.find(l => l.userId === userId);
    if (lb) {
      lb.xp = user.xp;
    }

    this.save();
    return { user, leveledUp, oldLevel, newLevel };
  }

  // Worlds
  public getWorlds() { return this.data.worlds; }
  public getWorldById(id: string) { return this.data.worlds.find(w => w.id === id || w.slug === id); }
  public createWorld(world: LearningWorld) {
    this.data.worlds.push(world);
    this.save();
    return world;
  }

  // Skills
  public getSkills(worldId?: string) {
    if (worldId && worldId !== 'all') {
      return this.data.skills.filter(s => s.worldId === worldId);
    }
    return this.data.skills;
  }
  public getSkillById(id: string) { return this.data.skills.find(s => s.id === id); }
  public unlockSkillNode(skillId: string, userId: string) {
    const skill = this.getSkillById(skillId);
    if (!skill) return null;

    skill.status = 'mastered';
    skill.masteryPercentage = 100;

    // Check next skills
    skill.nextSkills.forEach(nextId => {
      const nextSkill = this.getSkillById(nextId);
      if (nextSkill && nextSkill.status === 'locked') {
        nextSkill.status = 'available';
      }
    });

    const user = this.getUserById(userId);
    if (user) {
      if (!user.skillsMastered) user.skillsMastered = [];
      if (!user.skillsMastered.includes(skillId)) {
        user.skillsMastered.push(skillId);
      }
      this.addXp(userId, skill.xpRequired);
    }

    this.save();
    return skill;
  }

  // Skill Radar
  public getSkillRadar(userId: string): SkillRadarItem[] {
    const user = this.getUserById(userId);
    const mastered = user?.skillsMastered || [];

    return [
      { subject: 'Programming Core', value: mastered.includes('skill-3') ? 92 : 65, fullMark: 100, growth: '+14%' },
      { subject: 'AI & Vector Systems', value: mastered.includes('skill-tech-1') ? 88 : 50, fullMark: 100, growth: '+22%' },
      { subject: 'Cloud & Infrastructure', value: 74, fullMark: 100, growth: '+8%' },
      { subject: 'Spatial & UX Design', value: mastered.includes('skill-des-1') ? 82 : 45, fullMark: 100, growth: '+11%' },
      { subject: 'Algorithmic Systems', value: 68, fullMark: 100, growth: '+15%' },
      { subject: 'Cognitive Velocity', value: 85, fullMark: 100, growth: '+18%' },
    ];
  }

  // Courses
  public getCourses(filterWorld?: string) {
    if (filterWorld && filterWorld !== 'All') {
      return this.data.courses.filter(c => c.worldId === filterWorld || c.category.toLowerCase() === filterWorld.toLowerCase());
    }
    return this.data.courses;
  }
  public getCourseById(id: string) {
    return this.data.courses.find(c => c.id === id || c.slug === id);
  }
  public createCourse(course: Course) {
    this.data.courses.push(course);
    // Increment world course count
    const world = this.getWorldById(course.worldId);
    if (world) {
      world.coursesCount = (world.coursesCount || 0) + 1;
    }
    this.save();
    return course;
  }
  public updateCourse(id: string, updates: Partial<Course>) {
    const course = this.getCourseById(id);
    if (!course) return null;
    Object.assign(course, updates);
    this.save();
    return course;
  }

  // Enrollments
  public getEnrollment(userId: string, courseId: string) {
    return this.data.enrollments.find(e => e.userId === userId && e.courseId === courseId);
  }
  public enrollCourse(userId: string, courseId: string) {
    let enrollment = this.getEnrollment(userId, courseId);
    if (!enrollment) {
      const course = this.getCourseById(courseId);
      const firstLessonId = course?.chapters?.[0]?.lessons?.[0]?.id;

      enrollment = {
        id: `enr-${Date.now()}`,
        userId,
        courseId,
        enrolledAt: new Date().toISOString(),
        progressPercentage: 0,
        completedLessonIds: [],
        lastLessonId: firstLessonId,
        lastAccessedAt: new Date().toISOString(),
      };
      this.data.enrollments.push(enrollment);

      if (course) {
        course.enrollmentsCount = (course.enrollmentsCount || 0) + 1;
      }

      this.save();
    }
    return enrollment;
  }

  public completeLesson(userId: string, courseId: string, lessonId: string) {
    let enrollment = this.getEnrollment(userId, courseId);
    if (!enrollment) {
      enrollment = this.enrollCourse(userId, courseId);
    }

    const course = this.getCourseById(courseId);
    let xpAdded = 0;

    if (course) {
      for (const ch of course.chapters) {
        const les = ch.lessons.find(l => l.id === lessonId);
        if (les) {
          xpAdded = les.xpReward || 50;
          break;
        }
      }
    }
    if (xpAdded === 0) xpAdded = 50;

    if (!enrollment.completedLessonIds.includes(lessonId)) {
      enrollment.completedLessonIds.push(lessonId);

      const totalLessons = course ? course.chapters.reduce((sum, c) => sum + c.lessons.length, 0) : 1;
      enrollment.progressPercentage = Math.min(100, Math.round((enrollment.completedLessonIds.length / totalLessons) * 100));

      this.addXp(userId, xpAdded);
    }

    enrollment.lastLessonId = lessonId;
    enrollment.lastAccessedAt = new Date().toISOString();

    if (enrollment.progressPercentage >= 100) {
      enrollment.certificateIssued = true;
    }

    this.save();
    return { enrollment, xpAdded };
  }

  // Quizzes & Flashcards
  public getQuizById(id: string) { return this.data.quizzes.find(q => q.id === id); }
  public getFlashcardDeckById(id: string) { return this.data.flashcardDecks.find(d => d.id === id); }

  // Achievements
  public getAchievements() { return this.data.achievements; }
  public unlockAchievement(achievementId: string) {
    const ach = this.data.achievements.find(a => a.id === achievementId);
    if (ach && !ach.unlockedAt) {
      ach.unlockedAt = new Date().toISOString();
      ach.progress = ach.maxProgress || 1;
      this.save();
      return ach;
    }
    return null;
  }

  // Daily Challenges
  public getDailyChallenges() { return this.data.dailyChallenges; }
  public claimChallenge(id: string, userId: string) {
    const challenge = this.data.dailyChallenges.find(c => c.id === id);
    if (challenge && challenge.completed && !challenge.claimed) {
      challenge.claimed = true;
      const result = this.addXp(userId, challenge.xpReward);
      this.save();
      return { challenge, xpAdded: challenge.xpReward, user: result.user };
    }
    return null;
  }

  // Study Groups
  public getStudyGroups() { return this.data.studyGroups; }
  public joinStudyGroup(groupId: string, userId: string) {
    const group = this.data.studyGroups.find(g => g.id === groupId);
    if (group) {
      group.joined = !group.joined;
      group.memberCount += group.joined ? 1 : -1;
      this.save();
      return group;
    }
    return null;
  }

  // Social Posts
  public getSocialPosts() { return this.data.socialPosts; }
  public createSocialPost(post: Omit<SocialPost, 'id' | 'createdAt' | 'likes' | 'repliesCount'>) {
    const newPost: SocialPost = {
      ...post,
      id: `post-${Date.now()}`,
      createdAt: 'Just now',
      likes: 0,
      repliesCount: 0,
    };
    this.data.socialPosts.unshift(newPost);
    this.save();
    return newPost;
  }
  public likePost(postId: string) {
    const post = this.data.socialPosts.find(p => p.id === postId);
    if (post) {
      post.likedByMe = !post.likedByMe;
      post.likes += post.likedByMe ? 1 : -1;
      this.save();
      return post;
    }
    return null;
  }

  // Notes & Bookmarks
  public getNotes(userId: string, courseId?: string) {
    return this.data.notes.filter(n => n.userId === userId && (!courseId || n.courseId === courseId));
  }
  public addNote(userId: string, courseId: string, lessonId: string, lessonTitle: string, text: string) {
    const note: Note = {
      id: `note-${Date.now()}`,
      userId,
      courseId,
      lessonId,
      lessonTitle,
      text,
      createdAt: new Date().toISOString(),
    };
    this.data.notes.unshift(note);
    this.save();
    return note;
  }
  public deleteNote(id: string, userId: string) {
    const idx = this.data.notes.findIndex(n => n.id === id && n.userId === userId);
    if (idx !== -1) {
      this.data.notes.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // Leaderboard
  public getLeaderboard() { return this.data.leaderboard; }

  // System Stats
  public getSystemStats(): SystemStats {
    const totalUsers = this.data.users.length;
    const totalCourses = this.data.courses.length;
    const totalWorlds = this.data.worlds.length;
    const totalEnrollments = this.data.enrollments.length;
    const completedEnrollments = this.data.enrollments.filter(e => e.progressPercentage >= 100).length;
    const platformCompletionRate = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;
    const totalXpAwarded = this.data.users.reduce((sum, u) => sum + u.xp, 0);

    return {
      totalUsers,
      activeToday: Math.max(1, Math.round(totalUsers * 0.8)),
      totalCourses,
      totalWorlds,
      totalEnrollments,
      platformCompletionRate,
      totalXpAwarded,
      weeklyActivity: [
        { day: 'Mon', hours: 2.4, xp: 180 },
        { day: 'Tue', hours: 3.1, xp: 240 },
        { day: 'Wed', hours: 1.8, xp: 140 },
        { day: 'Thu', hours: 4.2, xp: 320 },
        { day: 'Fri', hours: 2.9, xp: 210 },
        { day: 'Sat', hours: 4.8, xp: 380 },
        { day: 'Sun', hours: 3.5, xp: 290 },
      ],
    };
  }
}

export const db = new Database();
