'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Camera, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
const AI_URL = process.env.NEXT_PUBLIC_AI_URL || 'http://localhost:8000';
const VIOLATION_LIMIT = 5;
const CAPTURE_INTERVAL = 3000;
interface Question {
  id: number; q: string; options: string[];
}
export default function ExamPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [examStarted, setExamStarted] = useState(false);
  const [examDone, setExamDone] = useState(false);
  const [examResult, setExamResult] = useState<{ score: number; total: number; passed: boolean } | null>(null);
  const [violations, setViolations] = useState(0);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [faceDetected, setFaceDetected] = useState(true);
  const [consecutiveNoFace, setConsecutiveNoFace] = useState(0);
  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);
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
  useEffect(() => {
    if (!examStarted || !cameraOn) return;
    intervalRef.current = window.setInterval(captureFrame, CAPTURE_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [examStarted, cameraOn, captureFrame]);
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
  function answer(qId: number, optIdx: number) {
    setAnswers((prev) => ({ ...prev, [qId]: optIdx }));
  }
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
  if (loading) return null;
  if (!examStarted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">AI-Proctored Exam</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              This exam uses AI proctoring. Violation limit: {VIOLATION_LIMIT}.
            </p>
            {cameraError && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded">
                {cameraError}
              </div>
            )}
            <Button size="lg" onClick={startExam}>Start Exam</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  const q = questions[currentQ];
  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4 p-3 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-3">
          <Camera className={'h-5 w-5 ' + (cameraOn ? 'text-green-500' : 'text-destructive')} />
          <span className="text-sm">{faceDetected ? 'Face detected' : 'No face detected'}</span>
          <video ref={videoRef} autoPlay muted playsInline className="w-16 h-12 rounded border" />
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
      {violations >= VIOLATION_LIMIT ? (
        <Card className="border-destructive">
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
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              Question {currentQ + 1} of {questions.length}
            </span>
            <span className="text-sm text-muted-foreground">
              Answered: {Object.keys(answers).length}/{questions.length}
            </span>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{q.q}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {q.options.map((opt, idx) => (
                <label key={idx}
                  className={'flex items-center gap-3 p-3 rounded border cursor-pointer transition-colors ' +
                    (answers[q.id] === idx ? 'border-primary bg-primary/5' : 'hover:bg-muted/50')}
                >
                  <input type="radio" name={'q-' + q.id}
                    checked={answers[q.id] === idx}
                    onChange={() => answer(q.id, idx)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </CardContent>
          </Card>
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
  );
}
