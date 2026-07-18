// ── ExamPage: AI-proctored driving exam with a 3-state state machine:
//     1. INTRO (examStarted=false) — shows rules, camera permission prompt, and Start button.
//     2. PROCTORING (examStarted=true, examDone=false) — runs the quiz with live face detection,
//        tab-switch/fullscreen monitoring, and a violation counter that terminates at the limit.
//     3. RESULT (examDone=true) — displays pass/fail with score.
//     The proctoring loop captures frames every 3s, sends them to an AI service for face/confidence
//     checks, and accumulates violations for no-face, multiple-faces, tab switches, or fullscreen exit. ──
'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PageHero from '@/components/ui/page-hero';
import RequireAuth from '@/components/auth/RequireAuth';
import { AlertTriangle, Camera, XCircle, Shield, Monitor } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
// ── AI Proctoring Config: endpoint for face-detection service, max violations before auto-fail,
//     and how often (ms) a frame is captured and analysed ──
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
const VIOLATION_LIMIT = 5;
const CAPTURE_INTERVAL = 3000;
// ── Question Shape: each question has an id, the question text (q), and an array of options ──
interface Question {
  id: number; q: string; options: string[];
}
export default function ExamPage() {
  // ── Auth & Router ──
  const { user, loading } = useAuth();
  const router = useRouter();
  // ── Camera Refs: video element for preview, MediaStream for cleanup, interval for capture loop ──
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  // ── Exam State Machine: questions list, current index, answers map, and phase flags ──
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [examStarted, setExamStarted] = useState(false);
  const [examDone, setExamDone] = useState(false);
  const [examResult, setExamResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  // ── Proctoring State: violations counter, camera status, face-detection flags ──
  const [violations, setViolations] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [faceDetected, setFaceDetected] = useState(true);
  const [consecutiveNoFace, setConsecutiveNoFace] = useState(0);
  // ── Auth Guard Effect: redirect to login if the user is not authenticated ──
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);
  // ── startCamera: requests webcam access via getUserMedia. Stores the stream for later cleanup.
  //     On failure, sets cameraError so the UI can show a permission warning. ──
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
      setCameraError('');
    } catch {
      setCameraError('Camera access denied.');
    }
  }, []);
  // ── captureFrame: draws the current video frame to a canvas, converts to JPEG, and sends it
  //     to the AI face-detection service. If no face or low confidence is detected for 3+ consecutive
  //     frames, a +2 violation is recorded. Multiple faces in frame adds a +3 violation.
  //     All violations are capped at VIOLATION_LIMIT. ──
  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !streamRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const formData = new FormData();
      formData.append('file', blob, 'frame.jpg');
      try {
        const res = await fetch(AI_URL + '/api/detect-face', { method: 'POST', body: formData });
        const data = await res.json();
        setFaceDetected(data.face_detected && data.confidence >= 0.6);
        if (!data.face_detected || data.confidence < 0.6) {
          setConsecutiveNoFace((prev) => {
            const next = prev + 1;
            if (next >= 3) {
              setViolations((v) => Math.min(v + 2, VIOLATION_LIMIT));
              setStatusMsg('No face detected - violation +2');
              return 0;
            }
            return next;
          });
        } else {
          setConsecutiveNoFace(0);
        }
        if (data.multiple_faces) {
          setViolations((v) => Math.min(v + 3, VIOLATION_LIMIT));
          setStatusMsg('Multiple faces detected - violation +3');
        }
      } catch {}
    }, 'image/jpeg', 0.8);
  }, []);
  // ── Capture Interval Effect: starts a periodic timer (every 3s) that runs captureFrame.
  //     Only active when the exam is running and the camera is on. Cleans up on unmount or stop. ──
  useEffect(() => {
    if (!examStarted || !cameraOn) return;
    intervalRef.current = window.setInterval(captureFrame, CAPTURE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [examStarted, cameraOn, captureFrame]);
  // ── Security Monitoring Effect: listens for tab switches (visibilitychange) and fullscreen
  //     exits. Each event adds +3 violations as a deterrent against cheating.
  //     Only active while the exam is in progress. ──
  useEffect(() => {
    if (!examStarted) return;
    function onVisibility() {
      if (document.hidden) {
        setViolations((prev) => {
          const next = prev + 3;
          setStatusMsg('Tab switch - violation +3');
          return Math.min(next, VIOLATION_LIMIT);
        });
      }
    }
    function onFullscreen() {
      if (!document.fullscreenElement) {
        setViolations((prev) => {
          const next = prev + 3;
          setStatusMsg('Fullscreen exit - violation +3');
          return Math.min(next, VIOLATION_LIMIT);
        });
      }
    }
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
    };
  }, [examStarted]);
  // ── startExam: initialises camera, fetches questions from the API, then enters fullscreen.
  //     Sets examStarted=true which triggers the interval and security effects. ──
  async function startExam() {
    await startCamera();
    try {
      const data = await api.post<{ questions: Question[] }>('/exam/start', {});
      setQuestions(data.questions);
      setExamStarted(true);
      try { await document.documentElement.requestFullscreen(); } catch {}
    } catch {
      setStatusMsg('Failed to start exam');
    }
  }
  // ── answer: records the selected option index for a given question ID ──
  function answer(qId: number, optIdx: number) {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  }
  // ── submitExam: stops camera + interval, exits fullscreen, sends answers to the API,
  //     and transitions to the RESULT state (examDone=true). ──
  async function submitExam() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    try { document.exitFullscreen(); } catch {}
    try {
      const result = await api.post<{ score: number; total: number; passed: boolean }>('/exam/submit', { answers });
      setExamResult(result);
      setExamDone(true);
    } catch {
      setStatusMsg('Failed to submit exam');
    }
  }
  // ── Loading state: don't render anything while auth status is being determined ──
  if (loading) return null;

  // ── STATE 3: RESULT — shows final score (pass/fail) with a green or red card.
  //     Score display, PASSED/FAILED badge, and a button to go back to dashboard. ──
  if (examDone) {
    return (
      <RequireAuth>
        <>
          <PageHero title={examResult?.passed ? 'Exam Passed' : 'Exam Completed'} subtitle={examResult?.passed ? 'Congratulations!' : 'Better luck next time'} />
        <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-md mx-auto px-4 py-12">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className={`h-2 bg-gradient-to-r ${examResult?.passed ? 'from-green-400 to-emerald-500' : 'from-red-400 to-rose-500'}`} />
              <CardContent className="text-center py-8">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${examResult?.passed ? 'bg-green-50' : 'bg-red-50'}`}>
                  <span className={`text-3xl ${examResult?.passed ? 'text-green-500' : 'text-red-500'}`}>
                    {examResult?.passed ? '✓' : '✗'}
                  </span>
                </div>
                <p className="text-2xl font-bold mb-2">
                  Score: {examResult?.score}/{examResult?.total}
                </p>
                <Badge className={examResult?.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {examResult?.passed ? 'PASSED' : 'FAILED'}
                </Badge>
                <Button className="mt-6 w-full" onClick={() => router.push('/dashboard')}>
                  Back to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
        </>
      </RequireAuth>
    );
  }

  // ── STATE 1: INTRO — shows exam rules, camera permission check, and a Start button.
  //     If camera permission was denied, an error banner is displayed. ──
  if (!examStarted) {
    return (
      <RequireAuth>
        <>
          <PageHero title="AI-Proctored Exam" subtitle="This exam uses AI proctoring. Ensure your camera is working." />
          <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
          <div className="max-w-lg mx-auto px-4 py-12">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
              <CardContent className="text-center py-8 space-y-5">
                <div className="w-16 h-16 rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                  <Monitor className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    This exam uses AI proctoring to ensure integrity.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800 text-left space-y-1">
                    <p className="font-medium">Important Rules:</p>
                    <p>• Maximum violations: {VIOLATION_LIMIT}</p>
                    <p>• Do not switch tabs or exit fullscreen</p>
                    <p>• Keep your face visible in camera</p>
                    <p>• No other person allowed in frame</p>
                  </div>
                </div>
                {cameraError && (
                  <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg border border-destructive/20">
                    {cameraError}
                  </div>
                )}
                <Button size="lg" onClick={startExam} className="w-full">
                  <Shield className="w-4 h-4 mr-2" />
                  Start Exam
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
        </>
      </RequireAuth>
    );
  }
  // ── STATE 2: PROCTORING — the live exam. Shows a top bar with camera preview, face-detection
  //     status, violation count, and live status messages. If violations hit the limit, the exam
  //     is terminated and a failure card is shown. Otherwise the question card renders with radio
  //     options, Previous/Next navigation, and a Submit button on the last question.
  //     All questions must be answered before submission is allowed. ──
  const q = questions[currentQ];
  return (
    <RequireAuth>
      <>
        <section style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}>
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* ── Proctoring Bar: camera feed thumbnail, face-detection indicator, violation badge ── */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 p-3 bg-white rounded-xl shadow-sm border">
            <div className="flex items-center gap-3">
              <Camera className={'h-5 w-5 shrink-0 ' + (cameraOn ? 'text-green-500' : 'text-destructive')} />
              <span className="text-sm">{faceDetected ? 'Face detected' : 'No face detected'}</span>
              <video ref={videoRef} autoPlay muted playsInline className="w-16 h-12 rounded-lg border hidden sm:block" />
            </div>
            <div className="flex items-center gap-3">
              {statusMsg && <span className="text-xs text-muted-foreground">{statusMsg}</span>}
              {violations > 0 && (
                <Badge variant={violations >= VIOLATION_LIMIT ? 'destructive' : 'secondary'}>
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {violations}/{VIOLATION_LIMIT}
                </Badge>
              )}
            </div>
          </div>

          {/* ── Violation Limit Reached: exam terminated card ── */}
          {violations >= VIOLATION_LIMIT ? (
            <Card className="border-0 shadow-xl overflow-hidden border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Exam Terminated</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Maximum violation limit ({VIOLATION_LIMIT}) reached.
                </p>
                <Button className="mt-4" onClick={() => router.push('/dashboard')}>Back to Dashboard</Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* ── Progress Bar: current question number and count of answered questions ── */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  Question {currentQ + 1} of {questions.length}
                </span>
                <span className="text-sm text-muted-foreground bg-white px-3 py-1.5 rounded-lg shadow-sm">
                  Answered: {Object.keys(answers).length}/{questions.length}
                </span>
              </div>
              {/* ── Question Card: displays the current question text and radio-button options.
                   Selected option gets highlighted with a primary border/background. ── */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary via-primary-light to-primary-dark" />
                <CardHeader>
                  <CardTitle className="text-lg">{q.q}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {q.options.map((opt, idx) => (
                    <label key={idx}
                      className={'flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ' +
                        (answers[q.id] === idx ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-primary/5')}
                    >
                      <input type="radio" name={'q-' + q.id}
                        checked={answers[q.id] === idx}
                        onChange={() => answer(q.id, idx)}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-sm">{opt}</span>
                    </label>
                  ))}
                </CardContent>
              </Card>
              {/* ── Navigation: Previous/Next buttons to move between questions.
                   Next is disabled until an answer is selected for the current question.
                   On the last question, "Submit Exam" appears instead of "Next". ── */}
              <div className="flex items-center justify-between mt-6">
                <Button variant="outline" disabled={currentQ === 0}
                  onClick={() => setCurrentQ((p) => p - 1)}>Previous</Button>
                {currentQ < questions.length - 1 ? (
                  <Button onClick={() => setCurrentQ((p) => p + 1)}
                    disabled={answers[q.id] === undefined}>Next</Button>
                ) : (
                  <Button onClick={submitExam}
                    disabled={Object.keys(answers).length < questions.length}>Submit Exam</Button>
                )}
              </div>
            </>
          )}
        </div>
      </section>
      </>
    </RequireAuth>
  );
}
