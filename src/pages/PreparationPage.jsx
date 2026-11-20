import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';
import { preparationService } from '../services/preparationService';
import {
  CheckCircle2, Circle, Clock, ChevronRight, BookOpen,
  Zap, Target, Code, Users, TrendingUp, RefreshCw, ArrowRight, Award
} from 'lucide-react';

const STATUS_CYCLE = {
  not_started: 'in_progress',
  in_progress: 'completed',
  completed: 'not_started'
};

const STATUS_META = {
  not_started: { label: 'Not Started', color: 'var(--text-muted)', bg: 'var(--track)', borderColor: 'var(--border-color)', Icon: Circle },
  in_progress: { label: 'In Progress', color: 'var(--accent-amber)', bg: 'rgba(208, 145, 58,0.1)', borderColor: 'rgba(208, 145, 58,0.3)', Icon: Clock },
  completed: { label: 'Completed', color: 'var(--accent-emerald)', bg: 'rgba(90, 154, 110,0.1)', borderColor: 'rgba(90, 154, 110,0.3)', Icon: CheckCircle2 }
};

const CATEGORY_ICONS = {
  'Technical Skills': Code,
  'DSA': TrendingUp,
  'System Design': Zap,
  'Projects': BookOpen,
  'Behavioral/HR': Users
};

function groupByCategory(items) {
  const groups = {};
  for (const item of items) {
    const cat = item.category || 'Technical Skills';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(item);
  }
  return groups;
}

const PreparationPage = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState(null);
  const [target, setTarget] = useState({ company: 'Target Company', role: 'Software Engineer' });
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      setLoading(true);
      const res = await preparationService.getPlan();
      if (res.success && res.data) {
        setPlan(res.data);
        if (res.target) setTarget(res.target);
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load preparation roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (item) => {
    const nextStatus = STATUS_CYCLE[item.status] || 'in_progress';
    setUpdatingItemId(item.itemId);

    try {
      const res = await preparationService.updateItemStatus(item.itemId, nextStatus);
      if (res.success) {
        setPlan(prev => {
          if (!prev) return prev;
          const updatedItems = prev.items.map(i =>
            i.itemId === item.itemId ? { ...i, status: nextStatus } : i
          );
          return {
            ...prev,
            items: updatedItems,
            readinessScore: res.readinessScore
          };
        });
        toast.success(`"${item.title.substring(0, 30)}..." marked as ${STATUS_META[nextStatus].label}`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    } finally {
      setUpdatingItemId(null);
    }
  };

  const items = plan?.items || [];
  const completedCount = items.filter(i => i.status === 'completed').length;
  const inProgressCount = items.filter(i => i.status === 'in_progress').length;
  const readiness = plan?.readinessScore || 0;
  const grouped = groupByCategory(items);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner text="Synthesizing personalized preparation roadmap..." />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container">
          {/* HEADER */}
          <div style={{ marginBottom: '2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-cyan">Preparation Roadmap</span>
                <span className="badge badge-indigo">{target.company} • {target.role}</span>
              </div>
              <h1 style={{ fontSize: '2.25rem', color: 'var(--text-heading)' }}>Skill Gap Remediation Plan</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Personalized study items derived from your resume gaps and target role. Click any item icon to update its progress.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/interview" className="btn btn-primary btn-sm">
                Practice Mock Interview <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* READINESS METRIC BANNER */}
          <div className="card-static" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Target Preparation Readiness
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
                  <span style={{ fontSize: '2.75rem', fontWeight: 800, color: readiness > 0 ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
                    {readiness > 0 ? `${readiness}%` : 'Not Started'}
                  </span>
                  <span style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    ({completedCount} of {items.length} items completed)
                  </span>
                </div>

                <div style={{ width: '320px', maxWidth: '100%', height: '8px', background: 'var(--track)', borderRadius: '4px', overflow: 'hidden', marginTop: '0.75rem' }}>
                  <div style={{ width: `${readiness}%`, height: '100%', background: 'var(--gradient-primary)', transition: 'width 0.4s ease' }} />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Readiness calculated strictly from verified completed items ({completedCount} ÷ {items.length || 1} × 100).
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-tint)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {items.length - completedCount - inProgressCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Not Started</div>
                </div>
                <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-tint)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-amber)' }}>
                    {inProgressCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>In Progress</div>
                </div>
                <div style={{ padding: '0.75rem 1.25rem', background: 'var(--bg-tint)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                    {completedCount}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Completed</div>
                </div>
              </div>
            </div>
          </div>

          {/* CHECKLIST ITEMS BY CATEGORY */}
          {items.length === 0 ? (
            <div className="card-static" style={{ textAlign: 'center', padding: '3rem' }}>
              <Target size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
              <h3 style={{ color: 'var(--text-heading)', marginBottom: '0.5rem' }}>No preparation items generated yet</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '440px', margin: '0 auto 1.5rem auto' }}>
                Please ensure you have configured your target role and uploaded a resume to generate tailored study items.
              </p>
              <Link to="/target" className="btn btn-primary btn-sm">
                Configure Target Role
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {Object.entries(grouped).map(([category, catItems]) => {
                const CatIcon = CATEGORY_ICONS[category] || Code;
                return (
                  <div key={category} className="card-static" style={{ padding: '1.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                      <div style={{ padding: '0.4rem', borderRadius: 'var(--radius-sm)', background: 'rgba(155, 93, 126, 0.1)', color: 'var(--accent-cyan)' }}>
                        <CatIcon size={20} />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)' }}>{category}</h3>
                      <span className="badge badge-secondary" style={{ fontSize: '0.75rem', marginLeft: 'auto' }}>
                        {catItems.filter(i => i.status === 'completed').length}/{catItems.length} Done
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {catItems.map((item) => {
                        const meta = STATUS_META[item.status] || STATUS_META.not_started;
                        const StatusIcon = meta.Icon;
                        const isUpdating = updatingItemId === item.itemId;

                        return (
                          <div
                            key={item.itemId}
                            onClick={() => handleToggleStatus(item)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '1rem 1.25rem',
                              borderRadius: 'var(--radius-sm)',
                              background: item.status === 'completed' ? 'rgba(90, 154, 110, 0.05)' : 'var(--bg-tint)',
                              border: `1px solid ${item.status === 'completed' ? 'rgba(90, 154, 110, 0.2)' : 'var(--border-color)'}`,
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                              <button
                                type="button"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: meta.color,
                                  cursor: 'pointer',
                                  padding: 0,
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                              >
                                <StatusIcon size={22} />
                              </button>

                              <div>
                                <div style={{
                                  fontSize: '0.95rem',
                                  fontWeight: 600,
                                  color: item.status === 'completed' ? 'var(--text-muted)' : '#ffffff',
                                  textDecoration: item.status === 'completed' ? 'line-through' : 'none'
                                }}>
                                  {item.title}
                                </div>
                                {item.isGapRemediation && (
                                  <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', marginTop: '0.2rem' }}>
                                    🎯 Gap Remediation for {item.relatedSkill || target.company}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <span
                                className="badge"
                                style={{
                                  background: meta.bg,
                                  color: meta.color,
                                  border: `1px solid ${meta.borderColor}`,
                                  fontSize: '0.75rem'
                                }}
                              >
                                {isUpdating ? 'Saving...' : meta.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PreparationPage;
