import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { portfolioService } from '../services/portfolioService';
import { useToast } from '../context/ToastContext';
import {
  Globe, User, Award, ExternalLink, Sparkles, CheckCircle2,
  Code, Briefcase, Download, ArrowRight, ShieldCheck, Mail,
  Phone, MapPin, GraduationCap, Github, Linkedin, Copy, Printer,
  Layers, Database, Cpu, Wrench, BookmarkCheck, Share2
} from 'lucide-react';

const CATEGORY_META = {
  Frontend: { label: 'Frontend & UI', icon: Code, color: 'var(--accent-cyan)' },
  Backend: { label: 'Backend & APIs', icon: Layers, color: 'var(--accent-indigo)' },
  Database: { label: 'Databases & Storage', icon: Database, color: 'var(--accent-emerald)' },
  'AI/ML': { label: 'AI, ML & NLP', icon: Cpu, color: 'var(--accent-purple, #a855f7)' },
  Tools: { label: 'Cloud, DevOps & Tools', icon: Wrench, color: 'var(--accent-amber)' },
  Other: { label: 'Other Competencies', icon: BookmarkCheck, color: 'var(--text-secondary)' }
};

const PortfolioPage = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState(null);
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL');

  useEffect(() => {
    portfolioService.getPortfolioData()
      .then(res => {
        if (res.success && res.data) {
          setPortfolio(res.data);
        }
      })
      .catch(err => {
        console.error('Failed to load portfolio:', err);
        toast.error('Unable to load portfolio data.');
      })
      .finally(() => setLoading(false));
  }, []);

  const profile = portfolio?.profile || {};
  const projects = portfolio?.projects || [];
  const skills = portfolio?.skills?.technical || [];
  const softSkills = portfolio?.skills?.soft || [];
  const categorizedSkills = portfolio?.skills?.categorized || {};
  const experience = portfolio?.experience || [];
  const education = portfolio?.education || [];
  const achievements = portfolio?.achievements || [];
  const certifications = portfolio?.certifications || [];
  const targetCompany = profile.targetCompany || '';
  const targetRole = profile.title || profile.targetRole || '';

  const studentSlug = profile.fullName
    ? profile.fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    : 'candidate';
  const publicUrl = `https://${studentSlug}.skillbridge.ai`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(publicUrl);
    toast.success('Public portfolio link copied to clipboard!');
  };

  const handlePrint = () => {
    window.print();
  };

  const hasData = Boolean(
    profile.fullName ||
    skills.length > 0 ||
    projects.length > 0 ||
    experience.length > 0 ||
    education.length > 0
  );

  const getInitials = (name) => {
    if (!name) return 'SB';
    return name
      .split(' ')
      .filter(Boolean)
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner text="Synthesizing verified portfolio showcase..." />
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
          {/* TOP PAGE HEADER & ACTION CONTROLS */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Globe size={12} /> Live Candidate Showcase
                </span>
                <span className="badge badge-emerald" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                  <ShieldCheck size={12} /> Verified Credential Data
                </span>
              </div>
              <h1 style={{ fontSize: '2.25rem', color: 'var(--text-heading)', fontWeight: 800 }}>Student Portfolio & Project Hub</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Live public-ready portfolio webpage compiled directly from your verified resume, profile skills, and project highlights.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
              <button onClick={handleCopyLink} className="btn btn-secondary btn-sm" title="Copy public share URL">
                <Share2 size={14} /> Share Link
              </button>
              <button onClick={handlePrint} className="btn btn-secondary btn-sm" title="Print or save as PDF">
                <Printer size={14} /> Print / PDF
              </button>
              <Link to="/profile" className="btn btn-primary btn-sm">
                <User size={14} /> Edit Profile Data
              </Link>
            </div>
          </div>

          {!hasData ? (
            <div className="card-static" style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <EmptyState
                icon={Globe}
                title="Profile Data Not Configured"
                description="Upload a resume or populate your skills and projects in Profile to generate your personal portfolio showcase."
              />
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <Link to="/profile" className="btn btn-primary btn-sm">
                  Go to Profile Editor
                </Link>
                <Link to="/resume" className="btn btn-secondary btn-sm">
                  Upload Resume
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* PUBLIC HOST BANNER */}
              <div className="card-static" style={{ padding: '1rem 1.75rem', background: 'var(--bg-tint)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)', boxShadow: '0 0 10px var(--accent-emerald)' }} />
                  <div>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Verified Webpage URL
                    </span>
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {publicUrl}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {profile.matchScore !== null && profile.matchScore !== undefined && (
                    <span className="badge badge-cyan" style={{ fontSize: '0.78rem' }}>
                      Target Match: {profile.matchScore}%
                    </span>
                  )}
                  {targetCompany && (
                    <span className="badge badge-indigo" style={{ fontSize: '0.78rem' }}>
                      Targeting: {targetCompany}
                    </span>
                  )}
                  <button onClick={handleCopyLink} className="btn btn-secondary btn-sm" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}>
                    <Copy size={12} /> Copy
                  </button>
                </div>
              </div>

              {/* CANDIDATE HERO SHOWCASE CARD */}
              <div className="card-static" style={{ padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>
                <div style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  width: '240px',
                  height: '240px',
                  background: 'radial-gradient(circle, rgba(155, 93, 126, 0.12) 0%, rgba(125, 74, 104, 0.05) 50%, transparent 70%)',
                  borderRadius: '50%',
                  pointerEvents: 'none'
                }} />

                <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  {/* Monogram Avatar */}
                  <div style={{
                    width: '92px',
                    height: '92px',
                    borderRadius: '24px',
                    background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-indigo))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.2rem',
                    fontWeight: 800,
                    color: 'var(--text-heading)',
                    boxShadow: '0 8px 30px rgba(155, 93, 126, 0.3)',
                    flexShrink: 0
                  }}>
                    {getInitials(profile.fullName)}
                  </div>

                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {targetRole || 'MCA Engineering Candidate'}
                      </span>
                      {profile.university && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          • {profile.university}
                        </span>
                      )}
                    </div>

                    <h2 style={{ fontSize: '2.4rem', color: 'var(--text-heading)', fontWeight: 800, marginBottom: '0.85rem' }}>
                      {profile.fullName || 'Student Candidate'}
                    </h2>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.65, maxWidth: '800px', marginBottom: '1.5rem' }}>
                      {profile.bio || portfolio?.about || `MCA student focusing on building resilient, scalable software systems and actively preparing for technical engineering roles at ${targetCompany || 'top tech organizations'}.`}
                    </p>

                    {/* Contact & Professional Link Pills */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                      {profile.email && (
                        <a
                          href={`mailto:${profile.email}`}
                          className="badge badge-secondary"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                        >
                          <Mail size={13} style={{ color: 'var(--accent-cyan)' }} /> {profile.email}
                        </a>
                      )}
                      {profile.phone && (
                        <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
                          <Phone size={13} style={{ color: 'var(--accent-emerald)' }} /> {profile.phone}
                        </span>
                      )}
                      {profile.location && (
                        <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
                          <MapPin size={13} style={{ color: 'var(--accent-amber)' }} /> {profile.location}
                        </span>
                      )}
                      {profile.university && (
                        <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
                          <GraduationCap size={13} style={{ color: 'var(--accent-indigo)' }} /> {profile.university}
                        </span>
                      )}
                      {Array.isArray(profile.links) && profile.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.startsWith('http') ? link : `https://${link}`}
                          target="_blank"
                          rel="noreferrer"
                          className="badge badge-secondary"
                          style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                        >
                          {link.toLowerCase().includes('github') ? <Github size={13} /> : link.toLowerCase().includes('linkedin') ? <Linkedin size={13} /> : <ExternalLink size={13} />}
                          {link.replace(/^https?:\/\/(www\.)?/, '').slice(0, 24)}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Metrics Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginTop: '2rem', paddingTop: '1.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-tint)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Verified Skills</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>{skills.length}</div>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-tint)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Featured Projects</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-indigo)' }}>{projects.length}</div>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-tint)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Alignment</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      {profile.matchScore !== null && profile.matchScore !== undefined ? `${profile.matchScore}%` : 'Analyzed'}
                    </div>
                  </div>
                  <div style={{ padding: '0.75rem 1rem', background: 'var(--bg-tint)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Work / Academic History</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-amber)' }}>
                      {experience.length + education.length} Records
                    </div>
                  </div>
                </div>
              </div>

              {/* TECHNICAL COMPETENCIES CATEGORIZED */}
              {skills.length > 0 && (
                <div className="card-static" style={{ padding: '2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                        <Code size={20} style={{ color: 'var(--accent-cyan)' }} /> Technical Competencies & Toolchain
                      </h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                        Domain-categorized skills verified from resume parsing and student profile.
                      </p>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {['ALL', ...Object.keys(categorizedSkills).filter(cat => categorizedSkills[cat]?.length > 0)].map(cat => (
                        <button
                          key={cat}
                          onClick={() => setActiveCategoryTab(cat)}
                          className={activeCategoryTab === cat ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                          style={{ padding: '0.25rem 0.65rem', fontSize: '0.75rem' }}
                        >
                          {cat} {cat === 'ALL' ? `(${skills.length})` : `(${categorizedSkills[cat]?.length || 0})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skills Grid */}
                  {activeCategoryTab === 'ALL' ? (
                    <div className="grid-3" style={{ gap: '1.25rem' }}>
                      {Object.entries(categorizedSkills).map(([catKey, catSkills]) => {
                        if (!catSkills || catSkills.length === 0) return null;
                        const meta = CATEGORY_META[catKey] || CATEGORY_META.Other;
                        const CatIcon = meta.icon;

                        return (
                          <div
                            key={catKey}
                            style={{
                              background: 'var(--bg-tint)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)',
                              padding: '1.25rem'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.85rem' }}>
                              <CatIcon size={16} style={{ color: meta.color }} />
                              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                                {meta.label}
                              </span>
                              <span className="badge badge-secondary" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                                {catSkills.length}
                              </span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                              {catSkills.map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="badge badge-cyan"
                                  style={{ fontSize: '0.75rem', textTransform: 'none', padding: '0.25rem 0.6rem' }}
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '1rem', background: 'var(--bg-tint)', borderRadius: 'var(--radius-sm)' }}>
                      {(categorizedSkills[activeCategoryTab] || []).map((sk, idx) => (
                        <span
                          key={idx}
                          className="badge badge-cyan"
                          style={{ fontSize: '0.82rem', textTransform: 'none', padding: '0.35rem 0.75rem' }}
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Soft Skills */}
                  {softSkills.length > 0 && (
                    <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Professional & Interpersonal Attributes:
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {softSkills.map((ss, i) => (
                          <span key={i} className="badge badge-secondary" style={{ fontSize: '0.75rem', textTransform: 'none' }}>
                            {ss}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* FEATURED PROJECTS SHOWCASE */}
              <div className="card-static" style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                      <Briefcase size={20} style={{ color: 'var(--accent-indigo)' }} /> Featured Engineering Projects
                    </h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.2rem 0 0 0' }}>
                      Academic capstone, open source contributions, and personal development work.
                    </p>
                  </div>
                  <span className="badge badge-indigo" style={{ fontSize: '0.8rem' }}>
                    {projects.length} Showcased
                  </span>
                </div>

                {projects.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--bg-tint)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    No projects recorded yet. Populate your project portfolio in the <Link to="/profile" style={{ color: 'var(--accent-cyan)' }}>Profile Editor</Link>.
                  </div>
                ) : (
                  <div className="grid-2" style={{ gap: '1.5rem' }}>
                    {projects.map((proj, idx) => (
                      <div
                        key={idx}
                        style={{
                          background: 'var(--bg-tint)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '1.75rem',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          position: 'relative'
                        }}
                      >
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                              Project 0{idx + 1}
                            </span>
                            {proj.role && (
                              <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                                {proj.role}
                              </span>
                            )}
                          </div>

                          <h4 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', fontWeight: 700, marginBottom: '0.75rem' }}>
                            {proj.name}
                          </h4>

                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                            {proj.description}
                          </p>
                        </div>

                        <div>
                          {proj.technologies && proj.technologies.length > 0 && (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: proj.link ? '1rem' : '0' }}>
                              {proj.technologies.map((t, ti) => (
                                <span
                                  key={ti}
                                  style={{
                                    fontSize: '0.72rem',
                                    fontFamily: 'var(--font-mono)',
                                    background: 'rgba(155, 93, 126, 0.08)',
                                    border: '1px solid rgba(155, 93, 126, 0.2)',
                                    color: 'var(--accent-cyan)',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: 'var(--radius-sm)'
                                  }}
                                >
                                  {t}
                                </span>
                              ))}
                            </div>
                          )}

                          {proj.link && (
                            <a
                              href={proj.link.startsWith('http') ? proj.link : `https://${proj.link}`}
                              target="_blank"
                              rel="noreferrer"
                              className="btn btn-secondary btn-sm"
                              style={{ width: '100%', justifyContent: 'center', fontSize: '0.78rem' }}
                            >
                              <ExternalLink size={12} /> View Project Demo / Code
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* DUAL COLUMN: EXPERIENCE & EDUCATION */}
              <div className="grid-2" style={{ gap: '2rem' }}>
                {/* EXPERIENCE SECTION */}
                <div className="card-static" style={{ padding: '2rem' }}>
                  <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <Briefcase size={18} style={{ color: 'var(--accent-emerald)' }} /> Practical & Work Experience
                  </h3>

                  {experience.length === 0 ? (
                    <div style={{ padding: '1.5rem', background: 'var(--bg-tint)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No prior work experience listed. Add internships or academic responsibilities in Profile.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      {experience.map((exp, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: '1.25rem',
                            background: 'var(--bg-tint)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            borderLeft: '3px solid var(--accent-emerald)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                              {exp.position || 'Engineering Intern'}
                            </div>
                            {exp.duration && (
                              <span className="badge badge-secondary" style={{ fontSize: '0.72rem' }}>
                                {exp.duration}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600, marginBottom: '0.65rem' }}>
                            {exp.organization || exp.company || 'Technology Organization'}
                          </div>
                          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                            {exp.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* EDUCATION & ACHIEVEMENTS */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Education */}
                  <div className="card-static" style={{ padding: '2rem' }}>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <GraduationCap size={18} style={{ color: 'var(--accent-cyan)' }} /> Academic Credentials
                    </h3>

                    {education.length === 0 ? (
                      <div style={{ padding: '1.5rem', background: 'var(--bg-tint)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Education records from user profile or resume appear here.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {education.map((edu, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '1.25rem',
                              background: 'var(--bg-tint)',
                              border: '1px solid var(--border-color)',
                              borderRadius: 'var(--radius-sm)',
                              borderLeft: '3px solid var(--accent-cyan)'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                              <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-heading)' }}>
                                {edu.degree || 'Master of Computer Applications (MCA)'}
                              </div>
                              {edu.year && (
                                <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                                  {edu.year}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
                              {edu.institution || profile.university || 'University Department of Computer Science'}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Certifications & Achievements */}
                  {(certifications.length > 0 || achievements.length > 0) && (
                    <div className="card-static" style={{ padding: '2rem' }}>
                      <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                        <Award size={18} style={{ color: 'var(--accent-amber)' }} /> Honors & Certifications
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {certifications.map((cert, idx) => (
                          <div key={`cert-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem 1rem', background: 'var(--bg-tint)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <CheckCircle2 size={16} style={{ color: 'var(--accent-emerald)', flexShrink: 0 }} />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-heading)', fontWeight: 600 }}>
                              {cert.name || cert}
                            </div>
                            {cert.issuer && (
                              <span className="badge badge-secondary" style={{ marginLeft: 'auto', fontSize: '0.7rem' }}>
                                {cert.issuer}
                              </span>
                            )}
                          </div>
                        ))}

                        {achievements.map((ach, idx) => (
                          <div key={`ach-${idx}`} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.75rem 1rem', background: 'var(--bg-tint)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                            <Sparkles size={16} style={{ color: 'var(--accent-amber)', flexShrink: 0 }} />
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                              {ach}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FOOTER CALL-TO-ACTION */}
              <div className="card-static" style={{ padding: '2rem', textAlign: 'center', background: 'linear-gradient(180deg, var(--bg-tint), var(--bg-card))' }}>
                <h4 style={{ fontSize: '1.2rem', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                  Ready to present your portfolio to recruiters?
                </h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
                  Ensure your skills and experience are continuously aligned with your target company by revisiting your analysis.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link to="/target" className="btn btn-primary btn-sm">
                    Review Target Alignment <ArrowRight size={14} />
                  </Link>
                  <Link to="/interview" className="btn btn-secondary btn-sm">
                    Practice Interview Questions
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PortfolioPage;
