import React, { useState } from 'react';
import { addFeedback } from '../utils/feedbackDatabase';
import { toast } from 'react-toastify';
import './FeedbackForm.css';

const FeedbackForm = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!name.trim()) {
      toast.error('이름을 입력해주세요.');
      return;
    }
    
    if (!message.trim()) {
      toast.error('피드백 내용을 입력해주세요.');
      return;
    }
    
    if (rating === 0) {
      toast.error('별점을 선택해주세요.');
      return;
    }
    
    // 제출 중 상태로 변경
    setIsSubmitting(true);
    
    // 피드백 저장
    const result = addFeedback(name, email, message, rating);
    
    if (result.success) {
      setSubmitted(true);
      toast.success('피드백이 성공적으로 제출되었습니다. 감사합니다!');
      
      // 3초 후 창 닫기
      setTimeout(() => {
        onClose();
      }, 3000);
    } else {
      toast.error('피드백 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
      setIsSubmitting(false);
    }
  };

  // 별점 렌더링 함수
  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
          onClick={() => handleStarClick(i)}
        >
          ★
        </span>
      );
    }
    return stars;
  };

  return (
    <div className="feedback-form-container">
      <div className="feedback-form-header">
        <h2>카페에 대한 피드백을 남겨주세요</h2>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      
      {submitted ? (
        <div className="feedback-success">
          <h3>피드백을 보내주셔서 감사합니다!</h3>
          <p>소중한 의견은 서비스 개선에 큰 도움이 됩니다.</p>
        </div>
      ) : (
        <form className="feedback-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">이름 *</label>
            <input
              type="text"
              id="name"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">이메일 (선택사항)</label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="이메일을 입력하세요 (선택사항)"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="rating">별점 *</label>
            <div className="rating-stars">
              {renderStars()}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="message">피드백 내용 *</label>
            <textarea
              id="message"
              className="form-textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="카페에 대한 의견이나 개선점을 알려주세요"
              rows={5}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? '제출 중...' : '피드백 제출하기'}
          </button>
        </form>
      )}
    </div>
  );
};

export default FeedbackForm;