import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PhaseNotice from '../components/PhaseNotice';
import LoadingSpinner from '../components/LoadingSpinner';
import { profileService } from '../services/profileService';
import { 
  User, Mail, Phone, MapPin, GraduationCap, Code, Briefcase, 
  Award, Plus, Trash2, Save, Sparkles, PlusCircle 
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  const [profile, setProfile] = useState({
    personalInformation: {
      fullName: '',
      email: '',
      phone: '',
      location: ''
    },
    education: [],
    skills: {
      technical: [],
      soft: []
    },
    projects: [],
    experience: [],
    certifications: [],
    careerPreferences: {
      preferredRole: '',
      preferredIndustry: ''
    }
  });

  const [newTechSkill, setNewTechSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await profileService.getProfile();
      if (res.data) {
        setProfile({
          personalInformation: {
            fullName: res.data.personalInformation?.fullName || user?.name || '',
            email: res.data.personalInformation?.email || user?.email || '',
            phone: res.data.personalInformation?.phone || '',
            location: res.data.personalInformation?.location || ''
          },
          education: res.data.education || [],
          skills: {
            technical: res.data.skills?.technical || [],
            soft: res.data.skills?.soft || []
          },
          projects: res.data.projects || [],
          experience: res.data.experience || [],
          certifications: res.data.certifications || [],
          careerPreferences: {
            preferredRole: res.data.careerPreferences?.preferredRole || '',
            preferredIndustry: res.data.careerPreferences?.preferredIndustry || ''
          }
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      showToast('Failed to load profile details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      personalInformation: {
        ...prev.personalInformation,
        [name]: value
      }
    }));
  };

  const handleCareerPrefChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      careerPreferences: {
        ...prev.careerPreferences,
        [name]: value
      }
    }));
  };

  // Education Helpers
  const addEducation = () => {
    setProfile((prev) => ({
      ...prev,
      education: [...prev.education, { degree: '', university: '', graduationYear: '' }]
    }));
  };

  const updateEducation = (index, field, value) => {
    const updated = [...profile.education];
    updated[index][field] = value;
    setProfile((prev) => ({ ...prev, education: updated }));
  };

  const removeEducation = (index) => {
    const updated = profile.education.filter((_, i) => i !== index);
    setProfile((prev) => ({ ...prev, education: updated }));
  };

  // Skills Helpers
  const addTechSkill = () => {
    if (!newTechSkill.trim()) return;
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: [...prev.skills.technical, newTechSkill.trim()]
      }
    }));
    setNewTechSkill('');
  };

  const removeTechSkill = (index) => {
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        technical: prev.skills.technical.filter((_, i) => i !== index)
      }
    }));
  };

  const addSoftSkill = () => {
    if (!newSoftSkill.trim()) return;
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        soft: [...prev.skills.soft, newSoftSkill.trim()]
      }
    }));
    setNewSoftSkill('');
  };

  const removeSoftSkill = (index) => {
    setProfile((prev) => ({
      ...prev,
      skills: {
        ...prev.skills,
        soft: prev.skills.soft.filter((_, i) => i !== index)
      }
    }));
  };

  // Project Helpers
  const addProject = () => {
    setProfile((prev) => ({
      ...prev,
      projects: [...prev.projects, { name: '', description: '', technologies: [] }]
    }));
  };

  const updateProject = (index, field, value) => {
    const updated = [...profile.projects];
    if (field === 'technologies') {
      updated[index].technologies = value.split(',').map((t) => t.trim()).filter(Boolean);
    } else {
      updated[index][field] = value;
    }
    setProfile((prev) => ({ ...prev, projects: updated }));
  };

  const removeProject = (index) => {
    setProfile((prev) => ({
      ...prev,
      projects: profile.projects.filter((_, i) => i !== index)
    }));
  };

  // Experience Helpers
  const addExperience = () => {
    setProfile((prev) => ({
      ...prev,
      experience: [...prev.experience, { organization: '', position: '', duration: '', description: '' }]
    }));
  };

  const updateExperience = (index, field, value) => {
    const updated = [...profile.experience];
    updated[index][field] = value;
    setProfile((prev) => ({ ...prev, experience: updated }));
  };

  const removeExperience = (index) => {
    setProfile((prev) => ({
      ...prev,
      experience: profile.experience.filter((_, i) => i !== index)
    }));
  };

  // Certifications Helpers
  const addCertification = () => {
    setProfile((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { name: '', issuingOrganization: '', date: '' }]
    }));
  };

  const updateCertification = (index, field, value) => {
    const updated = [...profile.certifications];
    updated[index][field] = value;
    setProfile((prev) => ({ ...prev, certifications: updated }));
  };

  const removeCertification = (index) => {
    setProfile((prev) => ({
      ...prev,
      certifications: profile.certifications.filter((_, i) => i !== index)
    }));
  };

  // Save Profile to Backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await profileService.updateProfile(profile);
      showToast(res.message || 'Profile saved successfully!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to save profile changes.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSpinner text="Loading student profile dataset..." />
        </main>
        <Footer />
      </div>
    );
  }

  const tabs = [
    { id: 'personal', label: 'Personal & Career', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills & Tech', icon: Code },
    { id: 'projects', label: 'Projects', icon: Sparkles },
    { id: 'experience', label: 'Work Experience', icon: Briefcase },
    { id: 'certifications', label: 'Certifications', icon: Award }
  ];

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="main-content">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <span className="badge badge-cyan">Student Profile</span>
                <span className="badge badge-indigo">AI Knowledge Base Ready</span>
              </div>
              <h1 style={{ fontSize: '2.25rem', color: 'var(--text-heading)' }}>Student Profile Management</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Structure your academic and technical profile to power future AI matching, resume building & interview analysis.
              </p>
            </div>

            <button onClick={handleSave} className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving Changes...' : <><Save size={18} /> Save Student Profile</>}
            </button>
          </div>

          <PhaseNotice
            title="Profile Structured Data Model"
            description="Your profile dataset is stored in MongoDB via express `/api/profile`. Future AI modules (spaCy NER, Gemini LLM & Portfolio Generator) will automatically consume this data."
          />

          {/* TAB NAVIGATION */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.75rem 1.25rem',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    borderRadius: 'var(--radius-sm)',
                    background: isCurrent ? 'rgba(155, 93, 126, 0.15)' : 'transparent',
                    color: isCurrent ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                    border: isCurrent ? '1px solid rgba(155, 93, 126, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <TabIcon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: PERSONAL & CAREER PREFERENCES */}
          {activeTab === 'personal' && (
            <div className="card-static">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User className="text-cyan-400" size={20} /> Personal Information
              </h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.personalInformation.fullName}
                    onChange={handlePersonalChange}
                    className="form-control"
                    placeholder="e.g. Alex Morgan"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.personalInformation.email}
                    onChange={handlePersonalChange}
                    className="form-control"
                    placeholder="alex@university.edu"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={profile.personalInformation.phone}
                    onChange={handlePersonalChange}
                    className="form-control"
                    placeholder="+1 (555) 234-5678"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Location</label>
                  <input
                    type="text"
                    name="location"
                    value={profile.personalInformation.location}
                    onChange={handlePersonalChange}
                    className="form-control"
                    placeholder="City, Country"
                  />
                </div>
              </div>

              <hr style={{ borderColor: 'var(--border-color)', margin: '2rem 0' }} />

              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase className="text-indigo-400" size={20} /> Career Preferences
              </h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Preferred Job Role</label>
                  <input
                    type="text"
                    name="preferredRole"
                    value={profile.careerPreferences.preferredRole}
                    onChange={handleCareerPrefChange}
                    className="form-control"
                    placeholder="e.g. Software Engineer, AI Developer"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Industry</label>
                  <input
                    type="text"
                    name="preferredIndustry"
                    value={profile.careerPreferences.preferredIndustry}
                    onChange={handleCareerPrefChange}
                    className="form-control"
                    placeholder="e.g. Information Technology, FinTech, AI/ML"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION */}
          {activeTab === 'education' && (
            <div className="card-static">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <GraduationCap className="text-cyan-400" size={20} /> Educational Qualifications
                </h3>
                <button onClick={addEducation} className="btn btn-secondary btn-sm">
                  <Plus size={14} /> Add Education
                </button>
              </div>

              {profile.education.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No education details added yet. Click "Add Education" to add your degree.
                </div>
              ) : (
                profile.education.map((edu, idx) => (
                  <div key={idx} className="card-static" style={{ marginBottom: '1.25rem', background: 'var(--bg-tint)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span className="badge badge-indigo">Education #{idx + 1}</span>
                      <button onClick={() => removeEducation(idx)} className="btn btn-danger btn-sm" title="Remove">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid-3">
                      <div className="form-group">
                        <label className="form-label">Degree / Program</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                          className="form-control"
                          placeholder="e.g. Master of Computer Applications (MCA)"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">University / College</label>
                        <input
                          type="text"
                          value={edu.university}
                          onChange={(e) => updateEducation(idx, 'university', e.target.value)}
                          className="form-control"
                          placeholder="e.g. State University"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Graduation Year</label>
                        <input
                          type="text"
                          value={edu.graduationYear}
                          onChange={(e) => updateEducation(idx, 'graduationYear', e.target.value)}
                          className="form-control"
                          placeholder="e.g. 2026"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: SKILLS */}
          {activeTab === 'skills' && (
            <div className="card-static">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code className="text-cyan-400" size={20} /> Technical & Soft Skills
              </h3>

              {/* Technical Skills */}
              <div style={{ marginBottom: '2rem' }}>
                <label className="form-label">Technical Skills (Languages, Frameworks, DBs)</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={newTechSkill}
                    onChange={(e) => setNewTechSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechSkill())}
                    className="form-control"
                    placeholder="e.g. Python, React.js, Node.js, MongoDB"
                  />
                  <button onClick={addTechSkill} type="button" className="btn btn-secondary">
                    Add Skill
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profile.skills.technical.map((skill, idx) => (
                    <span key={idx} className="badge badge-cyan" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', textTransform: 'none' }}>
                      {skill}
                      <button onClick={() => removeTechSkill(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', marginLeft: '0.4rem', cursor: 'pointer' }}>
                        ×
                      </button>
                    </span>
                  ))}
                  {profile.skills.technical.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No technical skills added yet.</span>}
                </div>
              </div>

              {/* Soft Skills */}
              <div>
                <label className="form-label">Soft Skills (Communication, Leadership, Problem Solving)</label>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <input
                    type="text"
                    value={newSoftSkill}
                    onChange={(e) => setNewSoftSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())}
                    className="form-control"
                    placeholder="e.g. Problem Solving, Team Leadership"
                  />
                  <button onClick={addSoftSkill} type="button" className="btn btn-secondary">
                    Add Skill
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {profile.skills.soft.map((skill, idx) => (
                    <span key={idx} className="badge badge-indigo" style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem', textTransform: 'none' }}>
                      {skill}
                      <button onClick={() => removeSoftSkill(idx)} style={{ background: 'none', border: 'none', color: 'var(--accent-indigo)', marginLeft: '0.4rem', cursor: 'pointer' }}>
                        ×
                      </button>
                    </span>
                  ))}
                  {profile.skills.soft.length === 0 && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No soft skills added yet.</span>}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PROJECTS */}
          {activeTab === 'projects' && (
            <div className="card-static">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Sparkles className="text-cyan-400" size={20} /> Academic & Technical Projects
                </h3>
                <button onClick={addProject} className="btn btn-secondary btn-sm">
                  <Plus size={14} /> Add Project
                </button>
              </div>

              {profile.projects.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No projects added yet. Click "Add Project" to showcase your key projects.
                </div>
              ) : (
                profile.projects.map((proj, idx) => (
                  <div key={idx} className="card-static" style={{ marginBottom: '1.25rem', background: 'var(--bg-tint)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span className="badge badge-cyan">Project #{idx + 1}</span>
                      <button onClick={() => removeProject(idx)} className="btn btn-danger btn-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Project Name</label>
                      <input
                        type="text"
                        value={proj.name}
                        onChange={(e) => updateProject(idx, 'name', e.target.value)}
                        className="form-control"
                        placeholder="e.g. SkillBridge AI Career Portal"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Description</label>
                      <textarea
                        value={proj.description}
                        onChange={(e) => updateProject(idx, 'description', e.target.value)}
                        className="form-control"
                        rows={3}
                        placeholder="Describe the problem, architecture, and outcomes of the project..."
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Technologies Used (comma separated)</label>
                      <input
                        type="text"
                        value={proj.technologies.join(', ')}
                        onChange={(e) => updateProject(idx, 'technologies', e.target.value)}
                        className="form-control"
                        placeholder="React.js, Node.js, Express, MongoDB"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 5: EXPERIENCE */}
          {activeTab === 'experience' && (
            <div className="card-static">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Briefcase className="text-cyan-400" size={20} /> Work & Internship Experience
                </h3>
                <button onClick={addExperience} className="btn btn-secondary btn-sm">
                  <Plus size={14} /> Add Experience
                </button>
              </div>

              {profile.experience.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No work experience entries added. Click "Add Experience" if you have completed internships.
                </div>
              ) : (
                profile.experience.map((exp, idx) => (
                  <div key={idx} className="card-static" style={{ marginBottom: '1.25rem', background: 'var(--bg-tint)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span className="badge badge-indigo">Experience #{idx + 1}</span>
                      <button onClick={() => removeExperience(idx)} className="btn btn-danger btn-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid-3">
                      <div className="form-group">
                        <label className="form-label">Organization / Company</label>
                        <input
                          type="text"
                          value={exp.organization}
                          onChange={(e) => updateExperience(idx, 'organization', e.target.value)}
                          className="form-control"
                          placeholder="e.g. Tech Solutions Inc."
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Position / Role</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(idx, 'position', e.target.value)}
                          className="form-control"
                          placeholder="e.g. Full Stack Intern"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Duration</label>
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => updateExperience(idx, 'duration', e.target.value)}
                          className="form-control"
                          placeholder="Jun 2025 - Aug 2025"
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Key Responsibilities / Achievements</label>
                      <textarea
                        value={exp.description}
                        onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                        className="form-control"
                        rows={2}
                        placeholder="Bullet points of key accomplishments..."
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 6: CERTIFICATIONS */}
          {activeTab === 'certifications' && (
            <div className="card-static">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', color: 'var(--text-heading)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award className="text-cyan-400" size={20} /> Professional Certifications
                </h3>
                <button onClick={addCertification} className="btn btn-secondary btn-sm">
                  <Plus size={14} /> Add Certification
                </button>
              </div>

              {profile.certifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                  No certifications added yet. Click "Add Certification" to display your credentials.
                </div>
              ) : (
                profile.certifications.map((cert, idx) => (
                  <div key={idx} className="card-static" style={{ marginBottom: '1.25rem', background: 'var(--bg-tint)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <span className="badge badge-emerald">Certification #{idx + 1}</span>
                      <button onClick={() => removeCertification(idx)} className="btn btn-danger btn-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="grid-3">
                      <div className="form-group">
                        <label className="form-label">Certification Name</label>
                        <input
                          type="text"
                          value={cert.name}
                          onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                          className="form-control"
                          placeholder="e.g. AWS Certified Cloud Practitioner"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Issuing Organisation</label>
                        <input
                          type="text"
                          value={cert.issuingOrganization}
                          onChange={(e) => updateCertification(idx, 'issuingOrganization', e.target.value)}
                          className="form-control"
                          placeholder="e.g. Amazon Web Services"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Date Issued</label>
                        <input
                          type="text"
                          value={cert.date}
                          onChange={(e) => updateCertification(idx, 'date', e.target.value)}
                          className="form-control"
                          placeholder="e.g. 2025"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleSave} className="btn btn-primary btn-lg" disabled={saving}>
              {saving ? 'Saving Student Profile...' : <><Save size={18} /> Save Student Profile</>}
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProfilePage;
