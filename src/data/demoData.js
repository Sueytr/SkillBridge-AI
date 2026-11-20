export const demoData = {
  student: {
    name: "Supatry Dhar",
    email: "supatry.dhar@example.com",
    role: "MCA Student / Computer Science Graduate",
    university: "State Technological University",
    graduationYear: 2026,
  },

  target: {
    company: "Google",
    role: "Software Engineer",
    department: "Core Infrastructure & Web Platform",
    location: "Bengaluru / Mountain View",
    principle: "YOU CHOOSE THE TARGET. SKILLBRIDGE ANALYZES THE GAP.",
  },

  metrics: {
    resumeMatch: 78,
    profileStrength: 81,
    preparationScore: 64,
    matchDelta: 12,
    lastUpdateDate: "12 Sep 2026",
    activePriorityCount: 3,
  },

  skills: {
    strong: [
      { name: "Python", level: 88, status: "STRONG" },
      { name: "React.js", level: 84, status: "STRONG" },
      { name: "MongoDB", level: 80, status: "STRONG" },
      { name: "Machine Learning", level: 76, status: "STRONG" },
    ],
    needsWork: [
      { name: "Data Structures & Algorithms", level: 54, status: "NEEDS WORK", targetRequirement: "High Focus" },
      { name: "System Design", level: 48, status: "NEEDS WORK", targetRequirement: "High Focus" },
      { name: "Testing & QA (Jest/PyTest)", level: 58, status: "NEEDS WORK", targetRequirement: "Medium Focus" },
      { name: "Cloud Fundamentals (AWS/GCP)", level: 45, status: "NEEDS WORK", targetRequirement: "Medium Focus" },
    ],
  },

  resume: {
    fileName: "Supatry_Dhar_SoftwareEngineer_Resume.pdf",
    fileSize: "1.2 MB",
    fileType: "PDF Document (OCR Scanned)",
    uploadedAt: "12 Sep 2026, 09:42 AM",
    status: "Parsed & Analyzed",
    scannedResumeSupported: true,
    categoryScores: {
      skills: "Strong",
      experience: "Moderate",
      projects: "Strong",
      education: "Strong",
    },
    attentionAreas: [
      "No distributed system design project listed on resume.",
      "Algorithmic complexity (Big-O) metrics missing from project descriptions.",
      "Target company (Google) expects 2+ backend or systems-level projects.",
    ],
    extractedTextPreview: `SUPATRY DHAR
Computer Science / MCA Candidate | supatry.dhar@example.com

SUMMARY
Motivated software engineer candidate with hands-on expertise in full-stack web application development, React.js frontend architecture, Python backend integrations, and Machine Learning models. Seeking Software Engineer position at Google.

TECHNICAL SKILLS
- Languages: Python, JavaScript (ES6+), C++, HTML5, CSS3, SQL
- Frameworks & Libraries: React.js, Express.js, Node.js, PyTorch, Scikit-Learn
- Databases & Tools: MongoDB, PostgreSQL, Git, Docker, RESTful APIs

PROJECTS
1. SkillBridge AI — Career Intelligence & Gap Analysis Platform
   - Designed responsive single-page architecture using React.js and Express.js REST API.
   - Built custom resume ingestion pipeline and OCR text extractor interface.
   
2. Predictive Student Analytics Model
   - Developed machine learning model in Python to analyze academic performance trajectories.

EDUCATION
- Master of Computer Applications (MCA) — State Tech University (2024 - 2026)
- B.Sc. Computer Science — State College (2021 - 2024)`
  },

  ocrPipeline: {
    steps: [
      { id: "uploading", label: "Uploading document...", desc: "Ingesting raw PDF/image payload into secure staging" },
      { id: "reading", label: "Reading document layout...", desc: "Scanning font metrics, page coordinates, and image layers" },
      { id: "ocr", label: "OCR processing (Tesseract)...", desc: "Extracting optical text vectors from scanned PDF layers" },
      { id: "parsed", label: "Text extracted & structured...", desc: "Segmenting skills, experience, projects, and education" },
      { id: "ready", label: "Ready for target gap analysis", desc: "Mapped against Google Software Engineer requirements" },
    ],
  },

  insights: [
    {
      id: 1,
      type: "STRATEGIC GAP",
      quote: "Your resume demonstrates strong frontend experience, but your target role (Google — Software Engineer) places greater emphasis on data structures and system design.",
      actionLabel: "SEE WHAT TO PREPARE →",
      actionLink: "/preparation",
    },
    {
      id: 2,
      type: "RESUME OPTIMIZATION",
      quote: "Adding quantifiable complexity metrics (e.g. throughput, algorithm optimization) to your Machine Learning project will increase your Resume Match by +8%.",
      actionLabel: "OPTIMIZE RESUME →",
      actionLink: "/resumes",
    },
    {
      id: 3,
      type: "PORTFOLIO RECOMMENDATION",
      quote: "Google hiring committees look for distributed systems or cloud deployments. Generate a specialized project showcase in your Portfolio.",
      actionLabel: "BUILD PORTFOLIO →",
      actionLink: "/portfolio",
    }
  ]
};
