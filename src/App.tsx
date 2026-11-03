import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { LevelUpModal } from './components/common/LevelUpModal';

// 15 Application Pages of PROJECT NOVA
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorldsPage } from './pages/WorldsPage';
import { CourseDetailsPage } from './pages/CourseDetailsPage';
import { LessonPlayerPage } from './pages/LessonPlayerPage';
import { SkillTreePage } from './pages/SkillTreePage';
import { AiTutorPage } from './pages/AiTutorPage';
import { DailyChallengesPage } from './pages/DailyChallengesPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { SocialHubPage } from './pages/SocialHubPage';
import { ProfilePage } from './pages/ProfilePage';
import { InstructorDashboardPage } from './pages/InstructorDashboardPage';
import { CourseCreatorPage } from './pages/CourseCreatorPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { SettingsPage } from './pages/SettingsPage';
import { QuizPage } from './pages/QuizPage';
import { FlashcardsPage } from './pages/FlashcardsPage';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Selected entities for drill-down views
  const [selectedCourseId, setSelectedCourseId] = useState<string>('course-ai-agentic');
  const [selectedLessonId, setSelectedLessonId] = useState<string>('lesson-ai-1');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('quiz-ai-1');
  const [selectedDeckId, setSelectedDeckId] = useState<string>('deck-ai-1');

  // Navigators
  const handleSelectCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    setActiveTab('course-details');
  };

  const handleStartLesson = (courseId: string, lessonId: string) => {
    setSelectedCourseId(courseId);
    setSelectedLessonId(lessonId);
    setActiveTab('lesson-player');
  };

  const handleOpenQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setActiveTab('quiz');
  };

  const handleOpenFlashcards = (deckId: string) => {
    setSelectedDeckId(deckId);
    setActiveTab('flashcards');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col transition-colors selection:bg-cyan-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <div className="flex-1 flex w-full">
        {/* Navigation Sidebar */}
        {activeTab !== 'landing' && activeTab !== 'auth' && (
          <Sidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 pb-16">
          {/* 1. NOVA Welcome Page */}
          {activeTab === 'landing' && (
            <LandingPage
              setActiveTab={setActiveTab}
              onExploreCourse={handleSelectCourse}
            />
          )}

          {/* 2. Authentication */}
          {activeTab === 'auth' && (
            <AuthPage setActiveTab={setActiveTab} />
          )}

          {/* 3. Learner Command Center */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              setActiveTab={setActiveTab}
              onSelectCourse={handleSelectCourse}
              onStartLesson={handleStartLesson}
            />
          )}

          {/* 4. The Learning Worlds */}
          {(activeTab === 'worlds' || activeTab === 'explore') && (
            <WorldsPage
              onSelectCourse={handleSelectCourse}
              onOpenCreateCourse={() => setActiveTab('course-creator')}
            />
          )}

          {/* 5. Course and Mission Details */}
          {activeTab === 'course-details' && (
            <CourseDetailsPage
              courseId={selectedCourseId}
              onBack={() => setActiveTab('worlds')}
              onStartLesson={handleStartLesson}
            />
          )}

          {/* 6. Interactive Learning Studio (6-Stage Quest Player) */}
          {activeTab === 'lesson-player' && (
            <LessonPlayerPage
              courseId={selectedCourseId}
              lessonId={selectedLessonId}
              onBack={() => setActiveTab('course-details')}
              onNavigateLesson={newId => setSelectedLessonId(newId)}
              onOpenQuiz={handleOpenQuiz}
              onOpenFlashcards={handleOpenFlashcards}
            />
          )}

          {/* 7. Skill Tree */}
          {activeTab === 'skill-tree' && (
            <SkillTreePage
              onStartQuest={handleSelectCourse}
            />
          )}

          {/* 8. NOVA AI Mentor */}
          {(activeTab === 'ai-mentor' || activeTab === 'ai-tutor') && (
            <AiTutorPage />
          )}

          {/* 9. Daily Challenges & Quests */}
          {activeTab === 'daily-challenges' && (
            <DailyChallengesPage />
          )}

          {/* 10. Achievement Center & Leaderboard */}
          {(activeTab === 'achievements' || activeTab === 'leaderboard') && (
            <AchievementsPage />
          )}

          {/* 11. Social Learning Hub */}
          {activeTab === 'social-hub' && (
            <SocialHubPage />
          )}

          {/* 12. Personal Learning Profile */}
          {activeTab === 'profile' && (
            <ProfilePage />
          )}

          {/* 13. Instructor Studio */}
          {activeTab === 'instructor' && (
            <InstructorDashboardPage
              onCreateCourse={() => setActiveTab('course-creator')}
              onSelectCourse={handleSelectCourse}
            />
          )}

          {/* Quest & Course Creator */}
          {activeTab === 'course-creator' && (
            <CourseCreatorPage
              onBack={() => setActiveTab('instructor')}
              onCourseCreated={newId => {
                setSelectedCourseId(newId);
                setActiveTab('course-details');
              }}
            />
          )}

          {/* 14. Admin Control Center */}
          {activeTab === 'admin' && (
            <AdminDashboardPage />
          )}

          {/* 15. Settings */}
          {activeTab === 'settings' && (
            <SettingsPage />
          )}

          {/* Sub-modes: Standalone Quiz & Flashcards */}
          {activeTab === 'quiz' && (
            <QuizPage
              quizId={selectedQuizId}
              onBack={() => setActiveTab('lesson-player')}
              onFinish={() => setActiveTab('lesson-player')}
            />
          )}

          {activeTab === 'flashcards' && (
            <FlashcardsPage
              deckId={selectedDeckId}
              onBack={() => setActiveTab('lesson-player')}
              onFinish={() => setActiveTab('lesson-player')}
            />
          )}
        </main>
      </div>

      {/* Level Up Celebratory Modal */}
      <LevelUpModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
