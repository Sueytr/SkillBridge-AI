import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { targetService } from '../services/targetService';
import { Target, Building, Briefcase, FileText, Save, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';

const TargetPage = () => {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    company: '',
    jobRole: '',
    jobDescription: ''
  });

  useEffect(() => {
    fetchTarget();
  }, []);

  const fetchTarget = async () => {
    try {
      setLoading(true);
      const res = await targetService.getTarget();
      if (res.data) {
        setFormData({
          company: res.data.company || '',
          jobRole: res.data.jobRole || '',
          jobDescription: res.data.jobDescription || ''
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Could not load target company details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.jobRole.trim()) {
      toast.error('Company name and Job Role are required fields!');
      return;
    }

    setSaving(true);
    try {
      const res = await targetService.saveTarget({
        company: formData.company.trim(),
        jobRole: formData.jobRole.trim(),
        jobDescription: formData.jobDescription.trim()
      });
      toast.success(res.message || 'Target company and role saved successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save target company selection.');
    } finally {
      setSaving(false);
    }
  };

  const presetCompanies = [
    { company: 'Google', role: 'Software Engineer' },
    { company: 'Microsoft', role: 'SDE-1' },
    { company: 'Amazon', role: 'Software Development Engineer' },
    { company: 'Meta', role: 'Full Stack Engineer' },
    { company: 'TCS Digital', role: 'Systems Engineer' },
    { company: 'Infosys Specialist', role: 'Power Programmer' }
  ];

  const handleQuickPreset = (item) => {
    setFormData((prev) => ({
      ...prev,
      company: item.company,
      jobRole: item.role
    }));
    toast.info(`Selected preset: ${item.company} — ${item.role}`);
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner text="Loading target configurations..." />
        </main>
        <Footer />
      </div>
    );
  }

  const isRoleBaseline = !formData.jobDescription.trim();

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container">
          {/* HEADER */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-cyan">Student-Controlled Target</span>
              <span className="badge badge-emerald">Persisted in MongoDB</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', color: 'var(--text-heading)' }}>Target Company & Role</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              You choose the company and role. SkillBridge AI analyzes the specific skill gap against your choices.
            </p>
          </div>

          <div className="grid-3" style={{ gap: '2rem', alignItems: 'flex-start' }}>
            {/* LEFT 2 COLUMNS: CONFIGURATION FORM */}
            <div style={{ gridColumn: 'span 2' }}>
              <div className="card-static" style={{ padding: '2rem' }}>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Building size={16} style={{ color: 'var(--accent-cyan)' }} /> Target Company *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. Google, Microsoft, Amazon, Infosys"
                      className="form-control"
                      required
                    />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'block' }}>
                      The student chooses the company. Automated company redirection is disabled.
                    </span>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Briefcase size={16} style={{ color: 'var(--accent-indigo)' }} /> Target Job Role *
                    </label>
                    <input
                      type="text"
                      name="jobRole"
                      value={formData.jobRole}
                      onChange={handleChange}
                      placeholder="e.g. Software Engineer, Backend Developer, Full Stack Developer"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 0 }}>
                        <FileText size={16} style={{ color: 'var(--accent-emerald)' }} /> Specific Job Description (Optional)
                      </label>
                      <span className={`badge ${isRoleBaseline ? 'badge-amber' : 'badge-emerald'}`} style={{ fontSize: '0.7rem' }}>
                        {isRoleBaseline ? 'Role Baseline Mode' : 'Custom JD Active'}
                      </span>
                    </div>
                    <textarea
                      name="jobDescription"
                      rows={6}
                      value={formData.jobDescription}
                      onChange={handleChange}
                      placeholder="Paste the official job description here (skills, qualifications, responsibilities). If left blank, SkillBridge will apply our curated Role Baseline requirements for your chosen role."
                      className="form-control"
                      style={{ resize: 'vertical' }}
                    />
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: isRoleBaseline ? 'var(--accent-amber)' : 'var(--accent-emerald)' }}>
                      {isRoleBaseline ? (
                        <span>ℹ️ <strong>Role Baseline:</strong> Because no custom JD is pasted, generic industry baseline requirements for "{formData.jobRole || 'Software Engineer'}" will be used.</span>
                      ) : (
                        <span>✓ <strong>Custom Job Description:</strong> SkillBridge will perform exact keyword and TF-IDF similarity against your pasted requirements.</span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn btn-primary"
                    >
                      {saving ? (
                        'Saving Target...'
                      ) : (
                        <>
                          <Save size={16} /> Save Target Settings
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN: PRESETS & GUIDELINES */}
            <div>
              <div className="card-static" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles size={18} style={{ color: 'var(--accent-cyan)' }} /> Quick Presets
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Click any target to populate the company and role fields:
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {presetCompanies.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleQuickPreset(item)}
                      className="btn btn-secondary btn-sm"
                      style={{
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        padding: '0.6rem 0.85rem',
                        fontSize: '0.85rem',
                        background: 'var(--bg-tint)'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-heading)' }}>{item.company}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.role}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="card-static" style={{ padding: '1.5rem' }}>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={16} style={{ color: 'var(--accent-emerald)' }} /> Architecture Guarantee
                </h4>
                <ul style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', paddingLeft: '1.2rem', lineHeight: 1.6 }}>
                  <li>Your target is securely saved to your student account in MongoDB.</li>
                  <li>Data persists across browser refreshes and sessions.</li>
                  <li>Other students cannot see or modify your target settings.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TargetPage;
