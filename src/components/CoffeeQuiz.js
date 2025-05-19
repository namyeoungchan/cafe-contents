import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import FeedbackForm from './FeedbackForm';
import { initFeedbackData } from '../utils/feedbackDatabase';
import './Footer.css';

const Footer = () => {
  const [showFeedback, setShowFeedback] = useState(false);
  
  const handleFeedbackClick = () => {
    // 피드백 데이터 초기화 (필요한 경우)
    initFeedbackData();
    setShowFeedback(true);
  };
  
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <p className="copyright">© 2025 블랙오브커피. 모든 권리 보유.</p>
          <div className="footer-links">
            <button 
              className="feedback-btn"
              onClick={handleFeedbackClick}
            >
              피드백 남기기
            </button>
            <Link to="/admin" className="admin-link">관리자</Link>
          </div>
        </div>
      </div>
      
      {/* 피드백 모달 */}
      {showFeedback && (
        <div className="feedback-modal-overlay">
          <div className="feedback-modal">
            <FeedbackForm onClose={() => setShowFeedback(false)} />
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;