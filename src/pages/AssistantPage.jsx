import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { assistantService } from '../services/assistantService';
import { useToast } from '../context/ToastContext';
import {
  Bot, User, Send, Sparkles, HelpCircle, MessageSquare,
  Trash2, RefreshCw, Zap, ShieldCheck, Target
} from 'lucide-react';

const AssistantPage = () => {
  const toast = useToast();

  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [targetContext, setTargetContext] = useState({ company: '', role: '' });
  const [aiProvider, setAiProvider] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await assistantService.getHistory();
      if (res.success && res.data) {
        setMessages(
          res.data.map(m => ({
            id: m.id || m._id || Math.random(),
            role: m.sender === 'user' ? 'user' : 'assistant',
            content: m.text || m.message,
            timestamp: new Date(m.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
        );
      }
      if (res.suggestedQuestions) {
        setSuggestedQuestions(res.suggestedQuestions);
      }
      if (res.aiProviderConfig) {
        setAiProvider(res.aiProviderConfig);
      }
      if (res.targetCompany) {
        setTargetContext({ company: res.targetCompany, role: res.targetRole });
      }
    } catch (err) {
      console.error('Failed to load chat history:', err);
      toast.error('Unable to retrieve assistant chat history.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (clearing) return;
    if (!window.confirm('Are you sure you want to clear your conversation history?')) return;

    try {
      setClearing(true);
      await assistantService.clearHistory();
      setMessages([]);
      toast.success('Conversation history cleared.');
      fetchHistory();
    } catch {
      toast.error('Failed to clear conversation.');
    } finally {
      setClearing(false);
    }
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend || query).trim();
    if (!text || sending) return;

    setQuery('');

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setSending(true);

    try {
      const res = await assistantService.sendMessage(text);
      if (res.success && res.data) {
        if (res.data.aiProvider) setAiProvider(res.data.aiProvider);
        const aiMsg = {
          id: res.data.id || `ai-${Date.now()}`,
          role: 'assistant',
          content: res.data.text,
          timestamp: new Date(res.data.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          aiProvider: res.data.aiProvider
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Assistant error:', err);
      toast.error(err.response?.data?.message || 'Failed to generate assistant response.');
      const errorMsg = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: 'I encountered an error connecting to the career service. Please verify server connectivity or try again shortly.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const defaultSuggestions = [
    'What skills am I missing for my target role?',
    'How should I structure my preparation for my target role?',
    'What should I improve in my resume?',
    'Give me 3 technical interview questions for this role'
  ];

  const activeSuggestions = suggestedQuestions.length > 0 ? suggestedQuestions : defaultSuggestions;

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner text="Connecting to SkillBridge Career Intelligence Assistant..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container" style={{ maxWidth: '960px' }}>
          {/* HEADER */}
          <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-cyan">AI Career Assistant</span>
                {targetContext.company && (
                  <span className="badge badge-indigo">
                    Target: {targetContext.company} • {targetContext.role}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: '2.25rem', color: 'var(--text-heading)' }}>Placement Career Assistant</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Context-aware guidance directly synced with your resume, missing skills, and target placement goals.
              </p>
            </div>

            <button
              onClick={handleClearHistory}
              disabled={clearing || messages.length === 0}
              className="btn btn-secondary btn-sm"
              title="Clear Conversation"
            >
              <Trash2 size={14} /> Clear History
            </button>
          </div>

          {/* CHAT CONTAINER */}
          <div className="card-static" style={{ display: 'flex', flexDirection: 'column', height: '620px', padding: 0, overflow: 'hidden' }}>
            {/* Context Notice Bar */}
            <div style={{
              padding: '0.75rem 1.25rem',
              background: 'var(--bg-tint)',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={14} style={{ color: 'var(--accent-emerald)' }} />
                <span>Student Data Isolation Active • Answers tailored to your verified profile</span>
              </div>
              <div>
                {aiProvider === 'gemini' ? (
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>Gemini 1.5 Active</span>
                ) : (
                  <span className="badge badge-secondary" style={{ fontSize: '0.65rem' }}>Deterministic Context Engine</span>
                )}
              </div>
            </div>

            {/* Messages Thread */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem'
            }}>
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      alignSelf: isUser ? 'flex-end' : 'flex-start',
                      maxWidth: '85%'
                    }}
                  >
                    {!isUser && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(155, 93, 126, 0.15)',
                        border: '1px solid rgba(155, 93, 126, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-cyan)',
                        flexShrink: 0
                      }}>
                        <Bot size={16} />
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        padding: '1rem 1.25rem',
                        borderRadius: 'var(--radius-md)',
                        background: isUser ? 'var(--gradient-primary)' : 'var(--bg-card)',
                        border: isUser ? 'none' : '1px solid var(--border-color)',
                        color: isUser ? '#ffffff' : 'var(--text-heading)',
                        fontSize: '0.925rem',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        boxShadow: isUser ? '0 4px 15px rgba(155, 93, 126, 0.25)' : 'none'
                      }}>
                        {m.content}
                      </div>

                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', padding: '0 0.25rem' }}>
                        {m.timestamp}
                      </span>
                    </div>

                    {isUser && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(125, 74, 104, 0.2)',
                        border: '1px solid rgba(125, 74, 104, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-indigo)',
                        flexShrink: 0
                      }}>
                        <User size={16} />
                      </div>
                    )}
                  </div>
                );
              })}

              {sending && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', alignSelf: 'flex-start' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'rgba(155, 93, 126, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--accent-cyan)'
                  }}>
                    <Bot size={16} />
                  </div>
                  <div style={{ padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    Formulating response from your career profile...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Prompt Pills */}
            <div style={{
              padding: '0.75rem 1.25rem',
              background: 'var(--bg-tint)',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto'
            }}>
              {activeSuggestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(q)}
                  disabled={sending}
                  style={{
                    background: 'var(--track)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-secondary)',
                    borderRadius: 'var(--radius-full)',
                    padding: '0.35rem 0.85rem',
                    fontSize: '0.78rem',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                    e.currentTarget.style.color = 'var(--text-heading)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(11, 15, 25, 0.9)' }}>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                style={{ display: 'flex', gap: '0.75rem' }}
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask a question about your skills, resume gaps, or interview preparation..."
                  className="form-control"
                  style={{ flex: 1 }}
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !query.trim()}
                  className="btn btn-primary"
                  style={{ padding: '0.75rem 1.25rem' }}
                >
                  <Send size={16} /> Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AssistantPage;
