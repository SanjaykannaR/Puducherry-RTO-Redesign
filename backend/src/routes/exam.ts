// ── Driving exam routes: theory test (quiz) flow ──
// Authenticated users can take a mock driving theory exam
// Exam flow: start → get questions (without answers) → submit answers → score
// Passing threshold: 60% (aligns with Indian RTO theory test standards)
// In Phase 3 this will connect to the real exam scheduling system

import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

// Static question bank for the driving theory test
// Each question has an `answer` index that is stripped from the client response
const questions = [
  { id: 1, q: 'What is the minimum age for obtaining a driving license in India?', options: ['16', '18', '21', '25'], answer: 1 },
  { id: 2, q: 'What does a red traffic light mean?', options: ['Go', 'Slow down', 'Stop', 'Yield'], answer: 2 },
  { id: 3, q: 'What is the maximum speed limit in residential areas?', options: ['30 km/h', '50 km/h', '60 km/h', '80 km/h'], answer: 1 },
  { id: 4, q: 'Which side of the road should you drive on in India?', options: ['Left', 'Right', 'Center', 'Any'], answer: 0 },
  { id: 5, q: 'What is the legal blood alcohol limit for driving?', options: ['0.00%', '0.03%', '0.05%', '0.08%'], answer: 1 },
];

// In-memory exam sessions keyed by userId: tracks answers and completion state
// Prevents resubmission after the exam is completed
const examSessions: Record<string, { startedAt: string; answers: Record<number, number>; completed: boolean }> = {};

// ── POST /api/exam/start ──
// Begins a new exam session for the user
// Returns the questions with answers stripped (so client cannot cheat)
router.post('/start', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  examSessions[userId] = { startedAt: new Date().toISOString(), answers: {}, completed: false };
  res.json({ questions: questions.map(({ answer, ...q }) => q), totalQuestions: questions.length });
});

// ── POST /api/exam/submit ──
// Subends completed answers, scores the exam against the answer key
// Passing is 60%+ correct. Session is marked completed to prevent re-submission.
router.post('/submit', authenticate, (req: AuthRequest, res: Response) => {
  const userId = req.user!.userId;
  const { answers } = req.body;
  const session = examSessions[userId];
  if (!session || session.completed) {
    res.status(400).json({ error: 'No active exam session' });
    return;
  }
  let score = 0;
  for (const q of questions) {
    if (answers[q.id] === q.answer) score++;
  }
  session.completed = true;
  const passed = score >= Math.ceil(questions.length * 0.6);
  res.json({ score, total: questions.length, passed });
});

export default router;
