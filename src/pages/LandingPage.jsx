import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Zap, Target, Video, Bot, Globe, Layers,
  Mail, LogIn, Compass
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const SectionHeading = ({ id, title }) => (
  <div className="section-heading" id={id}>
    <h2>{title}</h2>
    <div className="section-divider" aria-hidden="true"><span /></div>
  </div>
);

const modules = [
  { icon: FileText, label: 'RESUME' },
  { icon: Zap, label: 'GAP' },
  { icon: Target, label: 'TARGET' },
  { icon: Layers, label: 'PLAN' },
  { icon: Video, label: 'MOCK' },
  { icon: Bot, label: 'AI' },
  { icon: Globe, label: 'SITE' }
];

const features = [
  { icon: FileText, title: 'Resume Scanner & OCR', description: 'PDF, DOCX and scanned resume extraction with Tesseract OCR for instant skill identification.' },
  { icon: Zap, title: 'Target Gap Analysis', description: 'Deterministic TF-IDF similarity and keyword matching against your target company requirements.' },
  { icon: Target, title: 'Company-Specific Preparation', description: 'Student-controlled goals for top tech companies and job roles.' },
  { icon: Video, title: 'Mock Interview Practice', description: 'Technical, HR and project-based mock interviews with answer evaluation and scoring.' },
  { icon: Bot, title: 'AI Career Assistant', description: 'Context-aware placement advisor with personalized roadmaps and technical guidance.' },
  { icon: Globe, title: 'Personal Portfolio', description: 'Turn verified profile data into a shareable personal web page preview.' }
];

const steps = [
  'Upload your resume', 'Choose a target role', 'Understand skill gaps',
  'Improve preparation', 'Practice interviews', 'Build your web presence'
];

const PER_PAGE = 3;

const LandingPage = () => {
  const [page, setPage] = useState(0);
  const pages = Math.ceil(features.length / PER_PAGE);
  const visible = features.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  return (
    <div className="page-wrapper">
      <Navbar overlay />

      <main>
        {/* HERO */}
        <section className="hero">
          <div>
            <h1>
              Hi there! Welcome to SkillBridge AI, your path to <em>career-ready</em> placements
            </h1>
            <p>
              A career platform for MCA and Computer Science students: scan your resume,
              pick a target role, close your skill gaps and practice interviews.
            </p>
            <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
          </div>
        </section>

        {/* ABOUT */}
        <section className="container landing-section" id="about">
          <SectionHeading title="About us" />
          <p style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
            SkillBridge AI bridges the gap between college education and top-tier tech placements.
            You choose the target company and role, and the platform analyzes your resume against it,
            builds a persistent preparation roadmap, and lets you rehearse with mock interviews.
            You stay in control of every target.
          </p>
        </section>

        {/* MODULES */}
        <section className="container landing-section" id="modules">
          <SectionHeading title="Our modules" />
          <div className="skill-circles">
            {modules.map(({ icon: Icon, label }) => (
              <div className="skill-circle" key={label}>
                <Icon size={22} aria-hidden="true" />
                {label}
              </div>
            ))}
          </div>
        </section>

        {/* FEATURES CAROUSEL */}
        <section className="container landing-section" id="features">
          <SectionHeading title="Features" />
          <div className="carousel-row">
            {visible.map(({ icon: Icon, title, description }) => (
              <div key={title} className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 190 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(155, 93, 126, 0.12)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={22} aria-hidden="true" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{description}</p>
              </div>
            ))}
          </div>
          <div className="carousel-dots" role="tablist" aria-label="Feature pages">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === page}
                aria-label={`Show features page ${i + 1}`}
                className={`carousel-dot${i === page ? ' active' : ''}`}
                onClick={() => setPage(i)}
              />
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="container landing-section" id="how-it-works">
          <SectionHeading title="How it works" />
          <div className="grid-3">
            {steps.map((step, idx) => (
              <div key={step} className="card-static" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-violet)', marginBottom: '0.35rem' }}>
                  {String(idx + 1).padStart(2, '0')}
                </div>
                <div style={{ fontWeight: 500 }}>{step}</div>
              </div>
            ))}
          </div>
        </section>

        {/* GET STARTED (template "Contacts" row) */}
        <section className="container landing-section" id="get-started" style={{ paddingBottom: '4.5rem' }}>
          <SectionHeading title="Get started" />
          <div className="contact-cols">
            <div className="contact-col">
              <div className="contact-title"><Mail size={20} aria-hidden="true" /> New here?</div>
              <Link to="/register" className="nav-link" style={{ paddingLeft: 0 }}>Create a student account</Link>
            </div>
            <div className="contact-col">
              <div className="contact-title"><LogIn size={20} aria-hidden="true" /> Returning?</div>
              <Link to="/login" className="nav-link">Log in to your dashboard</Link>
            </div>
            <div className="contact-col">
              <div className="contact-title"><Compass size={20} aria-hidden="true" /> Just looking?</div>
              <a href="#modules" className="nav-link" style={{ paddingRight: 0 }}>Explore the modules</a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;
