import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { profileService } from '../services/profileService';
import { resumeService } from '../services/resumeService';
import { targetService } from '../services/targetService';
import { preparationService } from '../services/preparationService';
import {
  FileText, Target, Video, Bot, Globe, CheckCircle, Clock,
  ArrowRight, Upload, Sparkles, Award, User, Layers, ShieldCheck
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [activeResume, setActiveResume] = useState(null);
  const [target, setTarget] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [prepReadiness, setPrepReadiness] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        const [profileRes, resumesRes, targetRes, analysisRes, prepRes] = await Promise.allSettled([
          profileService.getProfile(),
          resumeService.getResumes(),
          targetService.getTarget(),
          resumeService.getLatestAnalysis(),
          preparationService.getPreparationPlan()
        ]);

        if (!isMounted) return;

        if (profileRes.status === 'fulfilled' && profileRes.value?.data) {
          setProfile(profileRes.value.data);
        }

        if (resumesRes.status === 'fulfilled' && resumesRes.value?.data) {
          const list = Array.isArray(resumesRes.value.data) ? resumesRes.value.data : [];
          const current = list.find((r) => r.isCurrent) || list[0];
          setActiveResume(current || null);
        }

        if (targetRes.status === 'fulfilled' && targetRes.value?.data) {
          setTarget(targetRes.value.data);
        }

        if (analysisRes.status === 'fulfilled' && analysisRes.value?.data) {
          setAnalysis(analysisRes.value.data);
        }

        if (prepRes.status === 'fulfilled' && prepRes.value?.data?.data) {
          const plan = prepRes.value.data.data;
          setPrepReadiness(typeof plan.readinessScore === 'number' ? plan.readinessScore : null);
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute profile completion percentage dynamically from real fields
  const computeCompletion = () => {
    if (!profile) return 20;
    let score = 20;
    if (profile.personalInformation?.phone) score += 15;
    if (profile.education && profile.education.length > 0) score += 20;
    if (profile.skills && (profile.skills.technical?.length > 0 || profile.skills.soft?.length > 0)) score += 20;
    if (profile.projects && profile.projects.length > 0) score += 15;
    if (profile.experience && profile.experience.length > 0) score += 10;
    return Math.min(score, 100);
  };

  const completionRate = computeCompletion();
  const techSkillCount = profile?.skills?.technical?.length || 0;

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner text="Loading student dashboard insights..." />
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
          {/* WELCOME BANNER */}
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-cyan">Student Dashboard</span>
                <span className="badge badge-indigo">MCA Placement Prep</span>
              </div>
              <h1 style={{ fontSize: '2.25rem', color: 'var(--text-heading)' }}>
                Welcome back, <span className="text-gradient">{user?.name || 'Student'}</span>!
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Track your career preparation metrics, manage your target job role, and build your technical portfolio.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/profile" className="btn btn-secondary btn-sm">
                <User size={16} /> Edit Profile
              </Link>
              <Link to="/target" className="btn btn-primary btn-sm">
                <Target size={16} /> {target ? 'View Target Role' : 'Set Target Role'}
              </Link>
            </div>
          </div>

          {/* SUMMARY CARDS METRICS */}
          <div className="grid-4" style={{ marginBottom: '2.5rem' }}>
            {/* Card 1: Resume Status */}
            <div className="card-static">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Resume Status</span>
                <FileText size={20} style={{ color: 'var(--accent-cyan)' }} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {activeResume ? activeResume.originalName : 'No Resume Uploaded'}
              </div>
              <div style={{ fontSize: '0.8rem', color: activeResume ? 'var(--accent-emerald)' : 'var(--accent-amber)' }}>
                {activeResume
                  ? `Active • ${activeResume.ocrStatus === 'completed' || activeResume.status === 'processed' ? 'OCR Parsed' : 'Uploaded'}`
                  : 'Upload PDF/DOCX/Scanned resume'}
              </div>
            </div>

            {/* Card 2: Profile Completion */}
            <div className="card-static">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Profile Completion</span>
                <CheckCircle size={20} style={{ color: 'var(--accent-emerald)' }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                {completionRate}%
              </div>
              <div style={{ width: '100%', height: '6px', background: 'var(--track)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${completionRate}%`, height: '100%', background: 'var(--gradient-accent)' }}></div>
              </div>
            </div>

            {/* Card 3: Target Role */}
            <div className="card-static">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Role</span>
                <Target size={20} style={{ color: 'var(--accent-indigo)' }} />
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                {target ? target.jobRole : 'Not Specified'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {target ? `Company: ${target.company}` : 'Set target company & role'}
              </div>
            </div>

            {/* Card 4: Resume Match Score */}
            <div className="card-static">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Target Match Score</span>
                <Award size={20} style={{ color: 'var(--accent-violet)' }} />
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                {analysis && typeof analysis.overallScore === 'number'
                  ? `${analysis.overallScore}%`
                  : activeResume && target
                  ? 'Analysis Pending'
                  : 'Pending Setup'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {analysis
                  ? `TF-IDF: ${analysis.semanticScore || analysis.keywordScore || 0}% • ${analysis.missingSkills?.length || 0} gaps`
                  : 'Run analysis in Resume tab'}
              </div>
            </div>
          </div>

          {/* DASHBOARD MODULE SECTIONS */}
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.25rem', color: 'var(--text-heading)' }}>Application Modules</h2>

          <div className="grid-2" style={{ gap: '1.75rem' }}>
            {/* MODULE 1: RESUME MANAGEMENT */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(155, 93, 126, 0.12)', color: 'var(--accent-cyan)' }}>
                  <FileText size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Resume Management & Analysis</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Upload, OCR scan, and evaluate skill match</p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tint)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', flex: 1 }}>
                {activeResume ? (
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                      Active: {activeResume.originalName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Uploaded: {new Date(activeResume.uploadDate || activeResume.createdAt).toLocaleDateString()} • Format: {activeResume.fileType?.toUpperCase() || 'Document'}
                    </div>
                    {analysis ? (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--accent-emerald)', background: 'rgba(90, 154, 110, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '4px' }}>
                        ✓ Matched: {analysis.matchedSkills?.length || 0} skills | Gaps: {analysis.missingSkills?.length || 0} skills
                      </div>
                    ) : (
                      <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--accent-amber)', background: 'rgba(208, 145, 58, 0.1)', padding: '0.4rem 0.75rem', borderRadius: '4px' }}>
                        Analysis pending — click Analyze Resume to evaluate match
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    No active resume uploaded. Upload a PDF, DOCX, or scanned resume to begin.
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/resume" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  <Upload size={14} /> Resume Workspace
                </Link>
              </div>
            </div>

            {/* MODULE 2: TARGET ROLE */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(125, 74, 104, 0.12)', color: 'var(--accent-indigo)' }}>
                  <Target size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Target Company & Role</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Student-controlled placement targeting</p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tint)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', flex: 1 }}>
                {target ? (
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)' }}>
                      {target.company} — {target.jobRole}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      {target.jobDescription ? target.jobDescription.substring(0, 90) + '...' : 'Using default role baseline requirements.'}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    No target company configured yet. You control your placement target.
                  </div>
                )}
                <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                  Student controls company and role requirements
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to="/target" className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                  <Target size={14} /> Configure Target Role
                </Link>
              </div>
            </div>

            {/* MODULE 3: PREPARATION ROADMAP */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(90, 154, 110, 0.12)', color: 'var(--accent-emerald)' }}>
                  <Layers size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Preparation Roadmap</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Skill gap remediation & study topics</p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tint)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                  Readiness: {prepReadiness !== null ? `${prepReadiness}%` : 'Not started'}
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Personalized preparation items generated from verified missing skills and core MCA technical requirements.
                </p>
              </div>

              <Link to="/preparation" className="btn btn-secondary btn-sm">
                View Preparation Plan <ArrowRight size={14} />
              </Link>
            </div>

            {/* MODULE 4: MOCK INTERVIEW */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(139, 92, 246, 0.12)', color: 'var(--accent-violet)' }}>
                  <Video size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Mock Interview Practice</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Interactive technical and HR interview sessions</p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tint)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                  Practice Under Real Conditions
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submit written answers to questions tailored to your target role and receive structured feedback.
                </p>
              </div>

              <Link to="/interview" className="btn btn-secondary btn-sm">
                Start Mock Interview <ArrowRight size={14} />
              </Link>
            </div>

            {/* MODULE 5: AI CAREER ASSISTANT */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(155, 93, 126, 0.12)', color: 'var(--accent-cyan)' }}>
                  <Bot size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Career Assistant</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Context-aware advisor synced with your profile</p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tint)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                  Ask Questions About Your Career Gap
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Ask questions like "What skills am I missing?" or "How should I structure my preparation?"
                </p>
              </div>

              <Link to="/assistant" className="btn btn-secondary btn-sm">
                Open Career Assistant <ArrowRight size={14} />
              </Link>
            </div>

            {/* MODULE 6: STUDENT PORTFOLIO */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-sm)', background: 'rgba(208, 145, 58, 0.12)', color: 'var(--accent-amber)' }}>
                  <Globe size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Personal Portfolio Webpage</h3>
                  <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>Auto-generate a personal portfolio from your verified data</p>
                </div>
              </div>

              <div style={{ background: 'var(--bg-tint)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', flex: 1 }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-heading)', marginBottom: '0.25rem' }}>
                  Live Webpage Preview
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Showcases your verified skills, projects, and target role directly from your profile.
                </p>
              </div>

              <Link to="/portfolio" className="btn btn-secondary btn-sm">
                View Webpage Preview <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardPage;
