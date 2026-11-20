import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import { resumeService } from '../services/resumeService';
import { targetService } from '../services/targetService';
import {
  FileText, Upload, Trash2, CheckCircle2, AlertCircle,
  Eye, FileCode, Clock, ShieldCheck, Sparkles, Edit3, Save,
  Check, X, Award, BarChart2, Zap, Target
} from 'lucide-react';

const ResumePage = () => {
  const toast = useToast();

  const [resumes, setResumes] = useState([]);
  const [activeResume, setActiveResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Extracted text editing
  const [isEditingText, setIsEditingText] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [savingText, setSavingText] = useState(false);

  // Gap analysis state
  const [target, setTarget] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resumesRes, targetRes] = await Promise.allSettled([
        resumeService.getResumes(),
        targetService.getTarget()
      ]);

      if (targetRes.status === 'fulfilled' && targetRes.value?.data) {
        setTarget(targetRes.value.data);
      }

      if (resumesRes.status === 'fulfilled' && resumesRes.value?.data) {
        const list = Array.isArray(resumesRes.value.data) ? resumesRes.value.data : [];
        setResumes(list);
        const current = list.find((r) => r.isCurrent) || list[0] || null;
        setActiveResume(current);
        if (current) {
          setEditedText(current.extractedText || '');
          fetchAnalysis(current._id);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load resume workspace');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalysis = async (resumeId) => {
    try {
      const res = await resumeService.getResumeAnalysis(resumeId);
      if (res.success && res.data) {
        setAnalysisData(res.data);
      } else {
        setAnalysisData(null);
      }
    } catch {
      setAnalysisData(null);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.doc')) {
      toast.error('Legacy .doc format is not supported. Please save or export your document as .docx or .pdf before uploading.');
      return;
    }

    const allowedExts = ['.pdf', '.docx', '.jpg', '.jpeg', '.png'];
    const isAllowed = allowedExts.some(ext => fileName.endsWith(ext));

    if (!isAllowed) {
      toast.error('Unsupported resume format. Please upload PDF, DOCX, JPG, JPEG, or PNG.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size exceeds the 5MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', file);

    setUploading(true);
    try {
      const res = await resumeService.uploadResume(formData);
      toast.success(res.message || 'Resume uploaded and processed successfully!');
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Resume upload failed.';
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSetActive = async (id) => {
    try {
      const res = await resumeService.setActiveResume(id);
      toast.success(res.message || 'Active resume updated');
      const updatedList = resumes.map(r => ({ ...r, isCurrent: r._id === id }));
      setResumes(updatedList);
      const curr = updatedList.find(r => r._id === id);
      setActiveResume(curr);
      setEditedText(curr?.extractedText || '');
      setIsEditingText(false);
      fetchAnalysis(id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to set active resume');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      const res = await resumeService.deleteResume(id);
      toast.info(res.message || 'Resume deleted');
      await fetchInitialData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete resume');
    }
  };

  const handleSaveTextCorrections = async () => {
    if (!activeResume) return;
    setSavingText(true);
    try {
      const res = await resumeService.updateResumeText(activeResume._id, editedText);
      toast.success('Resume text updated successfully!');
      setIsEditingText(false);
      if (res.data) {
        setActiveResume(res.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to save text corrections.');
    } finally {
      setSavingText(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!activeResume) {
      toast.error('Please upload or select an active resume first.');
      return;
    }
    if (!target || !target.company || !target.jobRole) {
      toast.error('Target company and role must be configured before running analysis.');
      return;
    }

    setAnalyzing(true);
    try {
      const res = await resumeService.analyzeResume(activeResume._id);
      if (res.success && res.data) {
        setAnalysisData(res.data);
        toast.success(`Analysis complete: ${res.data.overallScore}% match against ${res.data.targetCompany}!`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to complete resume analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner text="Loading resume intelligence workspace..." />
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
                <span className="badge badge-cyan">Document Intelligence</span>
                <span className="badge badge-indigo">Tesseract OCR & NLP</span>
              </div>
              <h1 style={{ fontSize: '2.25rem', color: 'var(--text-heading)' }}>Resume Workspace</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Upload your resume in PDF, DOCX, JPG, or PNG format. Extract text, verify OCR quality, and analyze target fit.
              </p>
            </div>

            {activeResume && (
              <button
                onClick={handleRunAnalysis}
                disabled={analyzing}
                className="btn btn-primary"
              >
                {analyzing ? (
                  'Analyzing Match...'
                ) : (
                  <>
                    <Zap size={16} /> Run Gap Analysis
                  </>
                )}
              </button>
            )}
          </div>

          {/* TOP SECTION: UPLOAD DROPZONE */}
          <div className="card-static" style={{ marginBottom: '2rem', padding: '2rem' }}>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${dragActive ? 'var(--accent-cyan)' : 'var(--track)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragActive ? 'rgba(155, 93, 126, 0.05)' : 'var(--bg-tint)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e.target.files?.[0])}
                style={{ display: 'none' }}
              />

              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(155, 93, 126, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1rem auto',
                color: 'var(--accent-cyan)'
              }}>
                <Upload size={26} />
              </div>

              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)', marginBottom: '0.5rem' }}>
                {uploading ? 'Processing Document with OCR...' : 'Click to Upload or Drag & Drop Resume'}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', maxWidth: '480px', margin: '0 auto' }}>
                Supports standard <strong>PDF</strong>, scanned multi-page <strong>PDF</strong> (via Tesseract OCR), <strong>DOCX</strong>, and image resumes (<strong>JPG/PNG</strong>). Max 5MB.
              </p>
            </div>
          </div>

          {/* ACTIVE RESUME & TEXT VIEWER */}
          {activeResume ? (
            <div className="grid-3" style={{ gap: '2rem', marginBottom: '2.5rem' }}>
              {/* LEFT 2 COLUMNS: DOCUMENT PREVIEW & EXTRACTED TEXT */}
              <div style={{ gridColumn: 'span 2' }}>
                <div className="card-static" style={{ padding: '1.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={18} style={{ color: 'var(--accent-cyan)' }} />
                        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-heading)' }}>{activeResume.originalName}</h3>
                        <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>Active Resume</span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Method: {activeResume.processingMethod === 'ocr' ? 'Tesseract OCR' : 'Direct Text Extraction'}
                        {activeResume.ocrConfidence ? ` • Confidence: ${activeResume.ocrConfidence}%` : ''}
                        {activeResume.pageCount ? ` • Pages: ${activeResume.pageCount}` : ''}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {isEditingText ? (
                        <>
                          <button
                            onClick={handleSaveTextCorrections}
                            disabled={savingText}
                            className="btn btn-primary btn-sm"
                          >
                            <Save size={14} /> {savingText ? 'Saving...' : 'Save Text'}
                          </button>
                          <button
                            onClick={() => {
                              setEditedText(activeResume.extractedText || '');
                              setIsEditingText(false);
                            }}
                            className="btn btn-secondary btn-sm"
                          >
                            <X size={14} /> Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setIsEditingText(true)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Edit3 size={14} /> Edit Text
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Extracted Text Content */}
                  {isEditingText ? (
                    <div>
                      <textarea
                        rows={16}
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        className="form-control"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', lineHeight: 1.5 }}
                      />
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
                        Correct any OCR typos or add missing keywords. Changes will persist and update analysis results.
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      background: 'var(--bg-tint)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '1.25rem',
                      maxHeight: '380px',
                      overflowY: 'auto',
                      border: '1px solid var(--border-color)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5
                    }}>
                      {activeResume.extractedText || 'No text extracted from document.'}
                    </div>
                  )}

                  {/* Detected Skills Chips */}
                  {activeResume.extractedSkills && activeResume.extractedSkills.length > 0 && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                        Skills Extracted from Document ({activeResume.extractedSkills.length}):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {activeResume.extractedSkills.map((skill, i) => (
                          <span key={i} className="badge badge-cyan" style={{ fontSize: '0.75rem', textTransform: 'none' }}>
                            {skill.name || skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: RESUME FILES LIST */}
              <div>
                <div className="card-static" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-heading)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileCode size={16} style={{ color: 'var(--accent-indigo)' }} /> Uploaded Resumes ({resumes.length})
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {resumes.map((r) => {
                      const isCurr = r._id === activeResume._id;
                      return (
                        <div
                          key={r._id}
                          style={{
                            padding: '0.85rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            background: isCurr ? 'rgba(155, 93, 126, 0.08)' : 'var(--bg-tint)',
                            border: `1px solid ${isCurr ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                            transition: 'all var(--transition-fast)'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-heading)', wordBreak: 'break-all' }}>
                              {r.originalName}
                            </div>
                            {isCurr ? (
                              <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Active</span>
                            ) : (
                              <button
                                onClick={() => handleSetActive(r._id)}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                              >
                                Set Active
                              </button>
                            )}
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            <span>{new Date(r.uploadDate || r.createdAt).toLocaleDateString()}</span>
                            <button
                              onClick={() => handleDelete(r._id)}
                              style={{ background: 'none', border: 'none', color: 'var(--accent-rose)', cursor: 'pointer', padding: '2px' }}
                              title="Delete Resume"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card-static" style={{ padding: '3rem', textAlign: 'center', marginBottom: '2.5rem' }}>
              <EmptyState
                icon={FileText}
                title="No Resumes Uploaded Yet"
                description="Upload your resume above to extract technical skills and compare against target roles."
              />
            </div>
          )}

          {/* RESUME ANALYSIS RESULTS SECTION */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', color: 'var(--text-heading)' }}>Target Gap Analysis</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {target ? (
                    <>Evaluated against: <strong>{target.company}</strong> — <strong>{target.jobRole}</strong></>
                  ) : (
                    'No target role configured. Please set your target in the Target tab.'
                  )}
                </p>
              </div>

              {!target && (
                <Link to="/target" className="btn btn-secondary btn-sm">
                  <Target size={14} /> Configure Target
                </Link>
              )}
            </div>

            {!activeResume ? (
              <div className="card-static" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Upload a resume to begin analysis.
              </div>
            ) : !target ? (
              <div className="card-static" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                Target analysis unavailable — please configure your target.
              </div>
            ) : !analysisData ? (
              <div className="card-static" style={{ padding: '2rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Analysis pending. Click below to analyze your resume against {target.company}'s requirements.
                </p>
                <button
                  onClick={handleRunAnalysis}
                  disabled={analyzing}
                  className="btn btn-primary btn-sm"
                >
                  <Zap size={14} /> {analyzing ? 'Analyzing...' : 'Run Gap Analysis'}
                </button>
              </div>
            ) : (
              <div className="grid-3" style={{ gap: '1.5rem' }}>
                {/* Metric Card 1: Overall Match */}
                <div className="card-static" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Overall Target Match</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                    {analysisData.overallScore}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Weighted Skill & Vocabulary Alignment
                  </div>
                </div>

                {/* Metric Card 2: TF-IDF Similarity */}
                <div className="card-static" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>TF-IDF Similarity</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-indigo)', marginBottom: '0.25rem' }}>
                    {analysisData.semanticScore || analysisData.keywordScore || 0}%
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Term Frequency Cosine Similarity
                  </div>
                </div>

                {/* Metric Card 3: Skills Matched vs Gap */}
                <div className="card-static" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Skill Breakdown</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-emerald)', marginBottom: '0.25rem' }}>
                    {analysisData.matchedSkills?.length || 0} / {(analysisData.matchedSkills?.length || 0) + (analysisData.missingSkills?.length || 0)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {analysisData.missingSkills?.length || 0} skill gaps identified
                  </div>
                </div>

                {/* Matched Skills List */}
                <div className="card-static" style={{ gridColumn: 'span 3', padding: '1.75rem' }}>
                  <div className="grid-2" style={{ gap: '2rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1rem', color: 'var(--accent-emerald)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={16} /> Matched Skills ({analysisData.matchedSkills?.length || 0})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {analysisData.matchedSkills && analysisData.matchedSkills.length > 0 ? (
                          analysisData.matchedSkills.map((s, idx) => (
                            <span key={idx} className="badge badge-emerald" style={{ fontSize: '0.8rem', textTransform: 'none' }}>
                              ✓ {s.name || s}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No direct skill matches detected.</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '1rem', color: 'var(--accent-rose)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertCircle size={16} /> Missing Skills / Gaps ({analysisData.missingSkills?.length || 0})
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                        {analysisData.missingSkills && analysisData.missingSkills.length > 0 ? (
                          analysisData.missingSkills.map((s, idx) => (
                            <span key={idx} className="badge" style={{ background: 'rgba(196, 69, 94, 0.15)', color: '#fecdd3', border: '1px solid rgba(196, 69, 94, 0.3)', fontSize: '0.8rem', textTransform: 'none' }}>
                              ✗ {s.name || s}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No critical missing skills. Strong alignment!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Ready to close these skill gaps? Check your personalized roadmap.
                    </div>
                    <Link to="/preparation" className="btn btn-secondary btn-sm">
                      Go to Preparation Plan →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ResumePage;
