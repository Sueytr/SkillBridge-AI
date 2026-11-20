import React from 'react';
import { Info, Sparkles } from 'lucide-react';

const PhaseNotice = ({ title = 'Phase 1 Active Foundation', description, phaseTag = 'Phase 1 Core Infrastructure' }) => {
  return (
    <div className="phase-banner">
      <div className="phase-banner-icon">
        <Sparkles size={20} />
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <strong style={{ color: 'var(--text-heading)', fontSize: '0.95rem' }}>{title}</strong>
          <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{phaseTag}</span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: '1.5' }}>
          {description || 'This module provides a production-grade UI and REST service foundation. Python AI microservices (OCR, spaCy NLP, Gemini LLM, ChromaDB RAG) will plug into this service layer in upcoming project phases.'}
        </p>
      </div>
    </div>
  );
};

export default PhaseNotice;
