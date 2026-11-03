import { createServer } from 'http';
import app from '../api/index.js';

const PORT = 5055;
const BASE_URL = `http://localhost:${PORT}/api`;

async function runTests() {
  console.log('🌌 Starting PROJECT NOVA Universe Integration Test Suite...\n');

  // Start internal express server for testing
  const server = createServer(app);
  await new Promise<void>((resolve) => server.listen(PORT, resolve));
  console.log(`📡 Test server listening on ${BASE_URL}\n`);

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. Health check
  await test('API Health Check & Universe Identity', async () => {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    if (data.status !== 'healthy' || data.universe !== 'PROJECT NOVA') {
      throw new Error('Universe health check mismatch');
    }
  });

  // 2. Auth & Current User
  await test('Auth: Get active cadet session', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`);
    const data = await res.json();
    if (!data.user || !data.user.email) throw new Error('Cadet user not found in session');
    if (!data.user.rankTitle) throw new Error('Rank title missing on cadet profile');
  });

  // 3. Role Switcher
  await test('Auth: Switch role to instructor and universe admin', async () => {
    let res = await fetch(`${BASE_URL}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'instructor' }),
    });
    let data = await res.json();
    if (data.user.role !== 'instructor') throw new Error('Failed to switch to instructor');

    res = await fetch(`${BASE_URL}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin' }),
    });
    data = await res.json();
    if (data.user.role !== 'admin') throw new Error('Failed to switch to admin');

    // Switch back to learner
    await fetch(`${BASE_URL}/auth/switch-role`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'learner' }),
    });
  });

  // 4. Learning Worlds
  await test('Learning Worlds: Retrieve all 7 planetary worlds', async () => {
    const res = await fetch(`${BASE_URL}/worlds`);
    const data = await res.json();
    if (!Array.isArray(data.worlds) || data.worlds.length < 7) {
      throw new Error(`Expected at least 7 worlds, found ${data.worlds?.length}`);
    }
    const worldTitles = data.worlds.map((w: any) => w.title);
    if (!worldTitles.includes('Programming World') || !worldTitles.includes('Technology World')) {
      throw new Error('Core planetary worlds missing');
    }
  });

  // 5. Interactive Skill Tree
  await test('Skill Tree: Retrieve connected nodes and prerequisites', async () => {
    const res = await fetch(`${BASE_URL}/skills?worldId=world-prog`);
    const data = await res.json();
    if (!Array.isArray(data.skills) || data.skills.length === 0) {
      throw new Error('Programming skill tree empty');
    }
    const firstSkill = data.skills[0];
    if (!firstSkill.name || !firstSkill.status) {
      throw new Error('Skill node malformed');
    }
  });

  // 6. Personal Intelligence Radar
  await test('Personal Intelligence: Retrieve multi-axis skill radar', async () => {
    const res = await fetch(`${BASE_URL}/intelligence/radar`);
    const data = await res.json();
    if (!data.radar || data.radar.length < 5) {
      throw new Error('Skill radar missing data axes');
    }
    if (!data.insights || !data.insights.strongestSkill) {
      throw new Error('Radar insights missing');
    }
  });

  // 7. Course Catalog & Quest Details
  let testCourseId = 'course-ai-agentic';
  await test('Courses: Fetch syllabus and multi-stage quest data', async () => {
    const res = await fetch(`${BASE_URL}/courses/${testCourseId}`);
    const data = await res.json();
    if (!data.course || !data.course.chapters || data.course.chapters.length === 0) {
      throw new Error('Course syllabus missing chapters');
    }
  });

  // 8. Quest Enrollment & Mission Completion
  await test('Quest Progression: Enroll and complete mission for XP', async () => {
    // Enroll
    let res = await fetch(`${BASE_URL}/courses/${testCourseId}/enroll`, { method: 'POST' });
    let data = await res.json();
    if (!data.success) throw new Error('Failed to enroll in quest');

    // Complete mission
    res = await fetch(`${BASE_URL}/courses/${testCourseId}/lessons/lesson-ai-1/complete`, {
      method: 'POST',
    });
    data = await res.json();
    if (!data.success || data.xpAdded < 50) {
      throw new Error('Mission completion did not award expected XP');
    }
  });

  // 9. Interactive Live Code Sandbox
  await test('Code Sandbox: Execute TypeScript code and verify test cases', async () => {
    const code = `
function computeCosineSimilarity(a, b) {
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
console.log("SIM:", computeCosineSimilarity([1, 0], [1, 0]));
`;
    const res = await fetch(`${BASE_URL}/code/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        language: 'typescript',
        testCases: [
          { input: '[1, 0], [1, 0]', expectedOutput: '1.00', description: 'Identical vectors score 1.0' },
        ],
      }),
    });
    const data = await res.json();
    if (!data.success || !data.allPassed) {
      throw new Error(`Code runner error: ${data.output}`);
    }
  });

  // 10. NOVA AI Mentor (All 5 Modes)
  await test('NOVA AI Mentor: Verify Explain, Practice, Challenge, Revision, Exam modes', async () => {
    const modes = ['explain', 'practice', 'challenge', 'revision', 'exam'];
    for (const mode of modes) {
      const res = await fetch(`${BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Test prompt for ${mode} mode`,
          mode,
          courseTitle: 'Full-Stack AI Engineering',
        }),
      });
      const data = await res.json();
      if (!data.reply || data.reply.length < 20) {
        throw new Error(`AI Mentor failed in ${mode} mode`);
      }
    }
  });

  // 11. Social Hub (Study Groups & Posts)
  await test('Social Hub: Retrieve study groups and broadcast update', async () => {
    const gRes = await fetch(`${BASE_URL}/social/groups`);
    const gData = await gRes.json();
    if (!Array.isArray(gData.groups) || gData.groups.length === 0) {
      throw new Error('Study groups missing');
    }

    const pRes = await fetch(`${BASE_URL}/social/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: 'Integration test: Autonomous agent swarm calibrated!',
        tags: ['Test', 'NOVA'],
      }),
    });
    const pData = await pRes.json();
    if (!pData.success || !pData.post.id) {
      throw new Error('Failed to create social post');
    }
  });

  // 12. Gamification Dashboard & Streaks
  await test('Gamification: Fetch command center telemetry and daily quests', async () => {
    const res = await fetch(`${BASE_URL}/gamification/dashboard`);
    const data = await res.json();
    if (!data.challenges || data.challenges.length === 0) {
      throw new Error('Daily challenges missing');
    }
    if (!data.achievements || data.achievements.length === 0) {
      throw new Error('Achievements missing');
    }
  });

  // Close server
  await new Promise<void>((resolve) => server.close(() => resolve()));

  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('🎉 All PROJECT NOVA Universe Integration tests passed with 100% success!\n');
  }
}

runTests().catch(err => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
