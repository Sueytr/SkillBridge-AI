import React from 'react';
import { ChevronUp } from 'lucide-react';

const Footer = () => {
  const backToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="container footer-bottom">
        <div>
          Copyright &copy; {new Date().getFullYear()} <span className="footer-brand">SkillBridge AI</span>
          {' '}&middot; MCA Major Project
        </div>
        <button type="button" className="back-to-top" onClick={backToTop}>
          BACK TO TOP <ChevronUp size={16} />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
