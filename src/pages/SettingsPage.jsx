import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { profileService } from '../services/profileService';
import { Settings, User, Mail, GraduationCap, Briefcase, Save, ShieldCheck } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('');
  const [careerPreferences, setCareerPreferences] = useState({
    preferredRole: '',
    preferredIndustry: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      if (res.data) {
        const info = res.data.personalInformation || {};
        const edu = (res.data.education && res.data.education[0]) || {};
        setName(info.fullName || user?.name || '');
        setEmail(info.email || user?.email || '');
        setUniversity(info.university || edu.university || '');
        setCareerPreferences({
          preferredRole: res.data.careerPreferences?.preferredRole || '',
          preferredIndustry: res.data.careerPreferences?.preferredIndustry || ''
        });
      }
    } catch (err) {
      console.error('Failed to load profile settings:', err);
      toast.error('Unable to connect to the SkillBridge server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const updatedPayload = {
        personalInformation: {
          fullName: name.trim(),
          email: email.trim(),
          university: university.trim()
        },
        careerPreferences: {
          preferredRole: careerPreferences.preferredRole.trim(),
          preferredIndustry: careerPreferences.preferredIndustry.trim()
        }
      };

      const res = await profileService.updateProfile(updatedPayload);
      if (res.success) {
        toast.success('Account settings saved successfully!');
      } else {
        toast.error(res.message || 'Failed to update preferences.');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      toast.error('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container" style={{ maxWidth: '800px' }}>
          {/* HEADER */}
          <div style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-cyan">Account Preferences</span>
              <span className="badge badge-emerald">Persisted in MongoDB</span>
            </div>
            <h1 style={{ fontSize: '2.25rem', color: 'var(--text-heading)' }}>Settings & Configuration</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Manage your student profile preferences, university details, and target role defaults.
            </p>
          </div>

          <div className="card-static" style={{ padding: '2.5rem' }}>
            {loading ? (
              <div style={{ padding: '3rem 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <LoadingSpinner text="Loading preferences..." />
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <User size={18} style={{ color: 'var(--accent-cyan)' }} />
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Personal Information</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="form-control"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="form-control"
                    required
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem', display: 'block' }}>
                    Email is associated with your authenticated session and login.
                  </span>
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <GraduationCap size={16} style={{ color: 'var(--accent-indigo)' }} /> University / College
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    placeholder="e.g. Master of Computer Applications, University Institute"
                    className="form-control"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '2rem 0 1.25rem 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                  <Briefcase size={18} style={{ color: 'var(--accent-emerald)' }} />
                  <h3 style={{ fontSize: '1.15rem', color: 'var(--text-heading)' }}>Placement Preferences</h3>
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Role Target</label>
                  <input
                    type="text"
                    value={careerPreferences.preferredRole}
                    onChange={(e) => setCareerPreferences(prev => ({ ...prev, preferredRole: e.target.value }))}
                    placeholder="e.g. Backend Engineer, Full Stack Developer, Data Engineer"
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Preferred Industry Domain</label>
                  <input
                    type="text"
                    value={careerPreferences.preferredIndustry}
                    onChange={(e) => setCareerPreferences(prev => ({ ...prev, preferredIndustry: e.target.value }))}
                    placeholder="e.g. Enterprise Software, Cloud Platforms, Fintech"
                    className="form-control"
                  />
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn btn-primary"
                  >
                    {saving ? 'Saving Preferences...' : <><Save size={16} /> Save Changes</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SettingsPage;
