import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { interviewService } from '../services/interviewService';
import {
  Video, Target, Code, MessageSquare, Play, Sparkles, Send,
  RefreshCw, CheckCircle2, ChevronRight, ChevronLeft, Trophy,
  AlertCircle, TrendingUp, BookOpen, Zap, Clock, Settings, ArrowRight,
  RotateCcw
} from 'lucide-react';

const SourceBadge = ({ source }) => {
  const isAi = source === 'gemini';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
      padding: '0.25rem 0.65rem', borderRadius: '99px', fontSize: '0.7rem',
      fontWeight: 700, letterSpacing: '0.04em',
      background: isAi ? 'rgba(125, 74, 104,0.15)' : 'rgba(208, 145, 58,0.12)',
      color: isAi ? '#818CF8' : '#F59E0B',
      border: `1px solid ${isAi ? 'rgba(125, 74, 104,0.3)' : 'rgba(208, 145, 58,0.25)'}`
    }}>
      {isAi ? <><Sparkles size={10} /> AI Generated (Gemini)</> : <><Zap size={10} /> Fallback Question Bank</>}
    </span>
  );
};

const ScoreRing = ({ score, size = 80 }) => {
  const color = score >= 70 ? 'var(--accent-emerald)' : score >= 45 ? 'var(--accent-amber)' : 'var(--accent-rose)';
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--track)" strokeWidth={6} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" />
      <text x={size / 2} y={size / 2 + 1} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize={size * 0.22} fontWeight={700}
        style={{ transform: `rotate(90deg) translate(0px, -${size}px)`, transformOrigin: 'center' }}>
        {score}
      </text>
    </svg>
  );
};

const DimBar = ({ label, value }) => {
  const color = value >= 70 ? 'var(--accent-emerald)' : value >= 45 ? 'var(--accent-amber)' : 'var(--accent-rose)';
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
        <span>{label}</span><span style={{ color, fontWeight: 700 }}>{value}/100</span>
      </div>
      <div style={{ height: '4px', background: 'var(--track)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${value}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
};

const VIEWS = { CONFIGURE: 'configure', SESSION: 'session', SUMMARY: 'summary', HISTORY: 'history' };

const InterviewPage = () => {
  const toast = useToast();

  const [view, setView] = useState(VIEWS.CONFIGURE);
  const [interviewType, setInterviewType] = useState('Technical');
  const [difficulty, setDifficulty] = useState('Medium');
  const [questionCount, setQuestionCount] = useState(5);
  const [starting, setStarting] = useState(false);

  const [session, setSession] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [showEval, setShowEval] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [targetInfo, setTargetInfo] = useState({ company: '—', role: '—' });

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await interviewService.listSessions();
      if (res.success) {
        setHistory(res.data || []);
        if (res.target) setTargetInfo(res.target);
      }
    } catch {
      // Non-blocking
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStartInterview = async () => {
    setStarting(true);
    try {
      const res = await interviewService.createSession({
        interviewType,
        difficulty,
        questionCount
      });
      if (res.success && res.data) {
        setSession(res.data);
        setCurrentQIndex(0);
        setAnswerText('');
        setLastEvaluation(null);
        setShowEval(false);
        setView(VIEWS.SESSION);
        toast.success(`Mock interview session started (${res.data.questions?.length || 0} questions)`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to start interview session');
    } finally {
      setStarting(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answerText.trim()) {
      toast.error('Please type your answer before submitting.');
      return;
    }
    const currentQ = session?.questions?.[currentQIndex];
    if (!currentQ) return;

    setSubmitting(true);
    try {
      const res = await interviewService.submitAnswer(session._id, {
        questionId: currentQ.questionId,
        userAnswer: answerText.trim()
      });
      if (res.success) {
        const evalData = res.data?.evaluation || res.data;
        setLastEvaluation(evalData);
        setShowEval(true);

        const updatedAnswers = [...(session.answers || []).filter(a => a.questionId !== currentQ.questionId), {
          questionId: currentQ.questionId,
          userAnswer: answerText.trim(),
          evaluation: evalData
        }];
        setSession(prev => ({ ...prev, answers: updatedAnswers }));
        toast.success(`Answer evaluated! Score: ${evalData.score ?? '—'}/100`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to evaluate answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = currentQIndex + 1;
    if (nextIdx < (session?.questions?.length || 0)) {
      setCurrentQIndex(nextIdx);
      const existing = session.answers?.find(a => a.questionId === session.questions[nextIdx]?.questionId);
      setAnswerText(existing?.userAnswer || '');
      setLastEvaluation(existing?.evaluation || null);
      setShowEval(Boolean(existing?.evaluation));
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      setCurrentQIndex(prevIdx);
      const existing = session.answers?.find(a => a.questionId === session.questions[prevIdx]?.questionId);
      setAnswerText(existing?.userAnswer || '');
      setLastEvaluation(existing?.evaluation || null);
      setShowEval(Boolean(existing?.evaluation));
    }
  };

  const handleCompleteSession = async () => {
    setCompleting(true);
    try {
      const res = await interviewService.completeSession(session._id);
      if (res.success && res.data) {
        setSummary(res.data);
        setView(VIEWS.SUMMARY);
        loadHistory();
        const score = res.data.overallSummary?.overallScore ?? res.data.overallSummary?.averageScore ?? res.summary?.averageScore ?? 0;
        toast.success(`Interview complete! Overall Score: ${score}/100`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to finalize interview session');
    } finally {
      setCompleting(false);
    }
  };

  const handleViewPastSession = async (sessionId) => {
    try {
      const res = await interviewService.getSession(sessionId);
      if (res.success && res.data) {
        setSession(res.data);
        if (res.data.status === 'completed') {
          setSummary(res.data);
          setView(VIEWS.SUMMARY);
        } else {
          setCurrentQIndex(0);
          setView(VIEWS.SESSION);
        }
      }
    } catch {
      toast.error('Failed to load past session');
    }
  };

  const currentQuestion = session?.questions?.[currentQIndex];
  const answeredCount = session?.answers?.length || 0;
  const totalQuestions = session?.questions?.length || 0;
  const isLastQuestion = currentQIndex >= totalQuestions - 1;

  // ─── CONFIGURE VIEW ──────────────────────────────────────────────────────────
  if (view === VIEWS.CONFIGURE) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content">
          <div className="container">
            <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span className="badge badge-cyan">Mock Interview Module</span>
                  {targetInfo.company !== '—' && (
                    <span className="badge badge-indigo">{targetInfo.company} • {targetInfo.role}</span>
                  )}
                </div>
                <h1 style={{ fontSize: '2.25rem', color: 'var(--text-heading)' }}>Mock Interview Practice</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Simulate technical, HR, and project interviews tailored to your target company. Practice answering and receive dimensional feedback.
                </p>
              </div>

              {history.length > 0 && (
                <button onClick={() => setView(VIEWS.HISTORY)} className="btn btn-secondary btn-sm">
                  View Past Sessions ({history.length})
                </button>
              )}
            </div>

            <div className="grid-3" style={{ gap: '2rem', alignItems: 'flex-start' }}>
              {/* Configuration Form */}
              <div style={{ gridColumn: 'span 2' }}>
                <div className="card-static" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Settings size={18} style={{ color: 'var(--accent-cyan)' }} /> Session Setup
                  </h3>

                  <div className="form-group">
                    <label className="form-label">Interview Type</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
                      {['Technical', 'Behavioral/HR', 'Project-based', 'Mixed'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setInterviewType(type)}
                          className={interviewType === type ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                          style={{ justifyContent: 'center' }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Difficulty Level</label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {['Easy', 'Medium', 'Hard'].map(diff => (
                        <button
                          key={diff}
                          type="button"
                          onClick={() => setDifficulty(diff)}
                          className={difficulty === diff ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Question Count</label>
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      {[3, 5, 8].map(cnt => (
                        <button
                          key={cnt}
                          type="button"
                          onClick={() => setQuestionCount(cnt)}
                          className={questionCount === cnt ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                          style={{ flex: 1, justifyContent: 'center' }}
                        >
                          {cnt} Questions
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '2rem' }}>
                    <button
                      onClick={handleStartInterview}
                      disabled={starting}
                      className="btn btn-primary btn-lg"
                      style={{ width: '100%' }}
                    >
                      {starting ? (
                        'Generating Tailored Questions...'
                      ) : (
                        <>
                          <Play size={18} /> Start Interview Session
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Target Role & Guidelines Card */}
              <div>
                <div className="card-static" style={{ padding: '1.75rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Target size={16} style={{ color: 'var(--accent-indigo)' }} /> Target Alignment
                  </h4>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    <div>Company: <strong style={{ color: 'var(--text-heading)' }}>{targetInfo.company}</strong></div>
                    <div>Role: <strong style={{ color: 'var(--text-heading)' }}>{targetInfo.role}</strong></div>
                  </div>
                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Questions will prioritize topics derived from your resume gaps and specific role requirements.
                  </div>
                </div>

                <div className="card-static" style={{ padding: '1.75rem' }}>
                  <h4 style={{ fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <MessageSquare size={16} style={{ color: 'var(--accent-cyan)' }} /> Presentation Tip
                  </h4>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    Use the STAR methodology (Situation, Task, Action, Result) for behavioral questions, and explain time/space complexities for technical questions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── SESSION VIEW ────────────────────────────────────────────────────────────
  if (view === VIEWS.SESSION) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content">
          <div className="container">
            {/* Session Top Bar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span className="badge badge-cyan">Question {currentQIndex + 1} of {totalQuestions}</span>
                <span className="badge badge-indigo">{session?.interviewType || interviewType}</span>
                <SourceBadge source={session?.questionSource} />
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    if (window.confirm('Leave this interview session? Your answered questions are saved.')) {
                      setView(VIEWS.CONFIGURE);
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  Exit Session
                </button>
              </div>
            </div>

            {/* Question Card */}
            <div className="card-static" style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                <span className="badge badge-amber" style={{ fontSize: '0.75rem' }}>
                  {currentQuestion?.category || 'Technical'} • {currentQuestion?.difficulty || 'Medium'}
                </span>
                {currentQuestion?.relatedSkill && (
                  <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                    Skill: {currentQuestion.relatedSkill}
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.35rem', color: 'var(--text-heading)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {currentQuestion?.questionText}
              </h2>

              {/* Answer Text Area */}
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Your Answer:</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{answerText.length} characters</span>
                </label>
                <textarea
                  rows={8}
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="Type your structured answer here. For code or algorithms, outline your approach and complexity. For behavioral, describe the context and your specific impact."
                  className="form-control"
                  style={{ resize: 'vertical', lineHeight: 1.6 }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={handlePrevQuestion}
                    disabled={currentQIndex === 0}
                    className="btn btn-secondary btn-sm"
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={isLastQuestion}
                    className="btn btn-secondary btn-sm"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={submitting || !answerText.trim()}
                    className="btn btn-primary btn-sm"
                  >
                    {submitting ? 'Evaluating with Rubric...' : <><Send size={14} /> Submit & Evaluate</>}
                  </button>

                  {isLastQuestion && answeredCount > 0 && (
                    <button
                      onClick={handleCompleteSession}
                      disabled={completing}
                      className="btn btn-primary btn-sm"
                      style={{ background: 'var(--accent-emerald)', borderColor: 'var(--accent-emerald)' }}
                    >
                      {completing ? 'Finalizing...' : <><Trophy size={14} /> Complete Session</>}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Feedback / Evaluation Section */}
            {showEval && lastEvaluation && (
              <div className="card-static" style={{ padding: '2rem', border: '1px solid rgba(155, 93, 126, 0.3)', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ScoreRing score={lastEvaluation.score ?? 0} size={70} />
                    <div>
                      <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Evaluation Feedback</h3>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Dimensional evaluation of your submitted answer
                      </div>
                    </div>
                  </div>

                  <SourceBadge source={lastEvaluation.evaluatedBy || session?.questionSource} />
                </div>

                {/* Dimensional Breakdown */}
                {lastEvaluation.dimensions && (
                  <div className="grid-3" style={{ gap: '1rem', marginBottom: '1.5rem', background: 'var(--bg-tint)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                    <DimBar label="Technical Accuracy" value={lastEvaluation.dimensions.technicalAccuracy ?? 0} />
                    <DimBar label="Relevance to Question" value={lastEvaluation.dimensions.relevance ?? 0} />
                    <DimBar label="Clarity & Communication" value={lastEvaluation.dimensions.clarity ?? 0} />
                  </div>
                )}

                <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '1.5rem' }}>
                  {/* Strengths */}
                  <div style={{ background: 'rgba(90, 154, 110, 0.05)', border: '1px solid rgba(90, 154, 110, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <CheckCircle2 size={16} /> Strengths
                    </div>
                    <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                      {(lastEvaluation.strengths || ['Good attempt at addressing the core topic.']).map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div style={{ background: 'rgba(196, 69, 94, 0.05)', border: '1px solid rgba(196, 69, 94, 0.2)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <AlertCircle size={16} /> Areas for Improvement
                    </div>
                    <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                      {(lastEvaluation.weaknesses || ['Provide more concrete architectural examples.']).map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Stronger Model Answer */}
                {lastEvaluation.exampleAnswer && (
                  <div style={{ background: 'var(--bg-tint)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-cyan)', marginBottom: '0.5rem' }}>
                      💡 Exemplary Model Answer:
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic' }}>
                      "{lastEvaluation.exampleAnswer}"
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── SUMMARY VIEW ────────────────────────────────────────────────────────────
  if (view === VIEWS.SUMMARY) {
    const summaryData = summary?.overallSummary || summary?.summary || {};
    const overallScore = summaryData.overallScore ?? summaryData.averageScore ?? 0;
    const strongAreas = summaryData.strongAreas || [];
    const weakAreas = summaryData.weakAreas || [];
    const recommendedTopics = summaryData.recommendedTopics || [];
    const company = summary?.company || summary?.targetCompany || targetInfo.company;
    const role = summary?.jobRole || summary?.targetRole || targetInfo.role;
    const evalSource = summary?.generationSource === 'gemini' ? 'Gemini AI' : 'Deterministic Rubric';

    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content">
          <div className="container" style={{ maxWidth: '840px' }}>
            <div className="card-static" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(90, 154, 110, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
                color: 'var(--accent-emerald)'
              }}>
                <Trophy size={32} />
              </div>

              <h2 style={{ fontSize: '2rem', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>Interview Completed!</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
                Summary for <strong>{role}</strong> at <strong>{company}</strong>
              </p>

              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem' }}>
                <ScoreRing score={overallScore} size={110} />
              </div>

              <div className="grid-3" style={{ gap: '1rem', marginBottom: '2rem', textAlign: 'left' }}>
                <div style={{ padding: '1rem', background: 'var(--bg-tint)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Questions Answered</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                    {summary?.answers?.length || 0} / {summary?.questions?.length || 0}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-tint)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Interview Type</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-cyan)' }}>
                    {summary?.interviewType || 'Technical'}
                  </div>
                </div>
                <div style={{ padding: '1rem', background: 'var(--bg-tint)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Evaluation Engine</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '0.25rem' }}>
                    {evalSource}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses Breakdown */}
              {(strongAreas.length > 0 || weakAreas.length > 0) && (
                <div className="grid-2" style={{ gap: '1.5rem', marginBottom: '2rem', textAlign: 'left' }}>
                  {strongAreas.length > 0 && (
                    <div style={{ padding: '1.25rem', background: 'rgba(90, 154, 110, 0.05)', border: '1px solid rgba(90, 154, 110, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={16} /> Strong Domain Areas
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {strongAreas.map((area, i) => (
                          <span key={i} className="badge badge-emerald" style={{ fontSize: '0.75rem' }}>
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {weakAreas.length > 0 && (
                    <div style={{ padding: '1.25rem', background: 'rgba(196, 69, 94, 0.05)', border: '1px solid rgba(196, 69, 94, 0.2)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-rose)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertCircle size={16} /> Focus Areas to Revisit
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {weakAreas.map((area, i) => (
                          <span key={i} className="badge badge-rose" style={{ fontSize: '0.75rem' }}>
                            {area}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Recommended Focus Topics */}
              {recommendedTopics.length > 0 && (
                <div style={{ padding: '1.25rem', background: 'rgba(125, 74, 104, 0.05)', border: '1px solid rgba(125, 74, 104, 0.2)', borderRadius: 'var(--radius-sm)', marginBottom: '2rem', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-indigo)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Sparkles size={16} /> Preparation Recommendations
                  </div>
                  <ul style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.6, margin: 0 }}>
                    {recommendedTopics.map((topic, i) => (
                      <li key={i}>{topic}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button onClick={() => setView(VIEWS.CONFIGURE)} className="btn btn-primary">
                  <RotateCcw size={16} /> Start Another Session
                </button>
                <Link to="/preparation" className="btn btn-secondary">
                  Back to Preparation Roadmap →
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ─── HISTORY VIEW ────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', color: 'var(--text-heading)' }}>Past Interview Sessions</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Review past mock interview evaluations and question history
              </p>
            </div>
            <button onClick={() => setView(VIEWS.CONFIGURE)} className="btn btn-primary btn-sm">
              <Play size={14} /> New Interview
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {history.map((sess) => (
              <div
                key={sess._id}
                onClick={() => handleViewPastSession(sess._id)}
                className="card-static"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.25rem 1.5rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-heading)', fontSize: '1rem' }}>
                      {sess.interviewType} Mock Interview
                    </span>
                    <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                      {sess.difficulty}
                    </span>
                    <SourceBadge source={sess.questionSource} />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Target: {sess.targetCompany} • {new Date(sess.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {sess.summary?.overallScore !== undefined ? (
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>
                        {sess.summary.overallScore}%
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Overall Score</div>
                    </div>
                  ) : (
                    <span className="badge badge-amber">Incomplete</span>
                  )}
                  <ChevronRight size={18} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InterviewPage;
