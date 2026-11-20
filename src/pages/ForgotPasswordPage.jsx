import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';
import { Sparkles, Mail, ArrowRight, ArrowLeft, KeyRound, AlertTriangle } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState('');
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      setSubmitted(true);
      if (res.devResetUrl) {
        setDevResetUrl(res.devResetUrl);
      }
      toast.success('Password reset link generated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to process password reset request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ justifyContent: 'center', alignItems: 'center', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" className="nav-brand" style={{ justifyContent: 'center', marginBottom: '1rem' }}>
            <div className="nav-brand-logo">
              <Sparkles size={22} />
            </div>
            <span>SkillBridge <span className="text-gradient">AI</span></span>
          </Link>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem' }}>
            Enter your account email to generate a secure reset link
          </p>
        </div>

        <div className="card-static" style={{ padding: '2.25rem 2rem', border: '1px solid var(--border-color)' }}>
          {submitted ? (
            <div>
              <div style={{
                background: 'rgba(155, 93, 126, 0.1)',
                border: '1px solid rgba(155, 93, 126, 0.3)',
                borderRadius: 'var(--radius-sm)',
                padding: '1.25rem',
                marginBottom: '1.5rem',
                textAlign: 'center'
              }}>
                <KeyRound size={32} style={{ color: 'var(--accent-cyan)', margin: '0 auto 0.75rem auto' }} />
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-heading)' }}>Reset Request Processed</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  If an account exists for <strong style={{ color: 'var(--text-heading)' }}>{email}</strong>, a password reset token has been registered.
                </p>
              </div>

              {devResetUrl && (
                <div style={{
                  background: 'rgba(208, 145, 58, 0.1)',
                  border: '1px solid rgba(208, 145, 58, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.85rem'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-amber)', fontWeight: 600, marginBottom: '0.5rem' }}>
                    <AlertTriangle size={16} />
                    <span>Development Mode Notice</span>
                  </div>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: '0.75rem', fontSize: '0.8rem' }}>
                    Email service is not configured. Use this direct reset link for testing:
                  </p>
                  <Link
                    to={devResetUrl.replace('http://localhost:5173', '')}
                    className="btn btn-outline btn-sm"
                    style={{ width: '100%', wordBreak: 'break-all', textAlign: 'center' }}
                  >
                    Open Reset Password Form →
                  </Link>
                </div>
              )}

              <Link to="/login" className="btn btn-secondary" style={{ width: '100%' }}>
                <ArrowLeft size={16} /> Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="form-control"
                    style={{ paddingLeft: '2.4rem' }}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', marginBottom: '1.25rem' }}
              >
                {loading ? 'Generating Link...' : 'Generate Reset Link'}
              </button>

              <div style={{ textAlign: 'center' }}>
                <Link to="/login" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
