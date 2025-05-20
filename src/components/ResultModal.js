import React from 'react';
import Modal from './Modal';
import './ResultModal.css';

const ResultModal = ({ isOpen, onClose, result }) => {
  if (!result) return null;

  const isWinner = result.name !== '다음 기회에';

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="룰렛 결과"
    >
      <div className="result-modal-content">
        <div className={`result-icon ${isWinner ? 'winner' : 'loser'}`}>
          <span role="img" aria-label={isWinner ? "당첨" : "꽝"}>
            {isWinner ? '🎉' : '😢'}
          </span>
        </div>
        
        <h3 className={`result-title ${isWinner ? 'winner' : 'loser'}`}>
          {isWinner ? '축하합니다!' : '아쉽게도...'}
        </h3>
        
        <div className="result-prize">
          {isWinner ? (
            <>
              <p className="prize-name">{result.name}</p>
              <p className="prize-desc">에 당첨되셨습니다!</p>
            </>
          ) : (
            <p className="prize-desc">다음 기회에 도전해보세요!</p>
          )}
        </div>
        
        <div className="result-actions">
          <button className="btn btn-primary" onClick={onClose}>
            확인
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ResultModal;
