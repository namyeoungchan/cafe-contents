import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getUserWinningHistory } from '../utils/simpleDatabase';
import './WinningHistory.css';

const WinningHistory = ({ onClose }) => {
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.id) {
      loadWinningHistory();
    }
  }, [user]);

  const loadWinningHistory = () => {
    setLoading(true);
    
    // 사용자 ID 또는 이메일을 사용하여 당첨 내역 조회
    const userId = user.id.toString();
    const result = getUserWinningHistory(userId);
    
    if (result.error) {
      setError(result.error);
    } else {
      setHistory(result.history);
    }
    
    setLoading(false);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="winning-history-loading">
        <div className="loading-spinner"></div>
        <p>당첨 내역을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="winning-history-error">
        <p>오류가 발생했습니다: {error}</p>
        <button className="btn btn-primary" onClick={loadWinningHistory}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="winning-history">
      <h3 className="winning-history-title">나의 당첨 내역</h3>
      
      {history.length === 0 ? (
        <div className="winning-history-empty">
          <p>아직 당첨 내역이 없습니다.</p>
          <p>룰렛을 돌려 행운을 시험해보세요!</p>
        </div>
      ) : (
        <div className="winning-history-list">
          {history.map((item, index) => (
            <div key={index} className="winning-history-item">
              <div className="winning-prize">
                <span className={`prize-badge ${item.prize_name === '다음 기회에' ? 'no-prize' : ''}`}>
                  {item.prize_name}
                </span>
              </div>
              <div className="winning-details">
                <div className="winning-date">{formatDate(item.win_date)}</div>
                <div className="winning-order">주문번호: {item.order_number}</div>
                <div className="winning-status">
                  <span className={`status-badge ${item.is_used ? 'used' : 'unused'}`}>
                    {item.is_used ? '사용 완료' : '미사용'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WinningHistory;
