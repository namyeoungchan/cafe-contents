import React, { useState, useEffect } from 'react';
import { 
  getAllFeedback, 
  getTotalFeedbackCount, 
  updateFeedbackStatus,
  addResponseToFeedback,
  deleteFeedback,
  initFeedbackData
} from '../utils/feedbackDatabase';
import { toast } from 'react-toastify';
import './FeedbackManager.css';

const FeedbackManager = () => {
  const [feedback, setFeedback] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'new', 'read', 'responded'
  
  const feedbackPerPage = 10;

  useEffect(() => {
    // 피드백 데이터 초기화 및 로드
    const initialize = async () => {
      setIsLoading(true);
      await initFeedbackData();
      loadFeedback();
      setIsLoading(false);
    };
    
    initialize();
  }, [currentPage, filterStatus]);

  // 피드백 데이터 로드
  const loadFeedback = () => {
    const offset = (currentPage - 1) * feedbackPerPage;
    const feedbackData = getAllFeedback(feedbackPerPage, offset);
    
    // 상태 필터링 적용
    const filteredFeedback = filterStatus === 'all' 
      ? feedbackData 
      : feedbackData.filter(item => item.status === filterStatus);
    
    setFeedback(filteredFeedback);
    
    const totalCount = getTotalFeedbackCount();
    setTotalPages(Math.ceil(totalCount / feedbackPerPage));
  };

  // 피드백 상태 변경 처리
  const handleStatusChange = (feedbackId, newStatus) => {
    const result = updateFeedbackStatus(feedbackId, newStatus);
    
    if (result.success) {
      toast.success('피드백 상태가 업데이트되었습니다.');
      loadFeedback();
      
      // 현재 선택된 피드백인 경우 해당 피드백도 업데이트
      if (selectedFeedback && selectedFeedback.id === feedbackId) {
        setSelectedFeedback({
          ...selectedFeedback,
          status: newStatus
        });
      }
    } else {
      toast.error(`상태 변경 실패: ${result.error}`);
    }
  };

  // 피드백 상세보기
  const handleViewFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setResponseText(feedback.response || '');
    
    // 새 피드백이면 자동으로 '읽음' 상태로 변경
    if (feedback.status === 'new') {
      handleStatusChange(feedback.id, 'read');
    }
  };

  // 피드백 응답 제출
  const handleSubmitResponse = () => {
    if (!selectedFeedback) return;
    
    if (!responseText.trim()) {
      toast.error('응답 내용을 입력해주세요.');
      return;
    }
    
    const result = addResponseToFeedback(selectedFeedback.id, responseText);
    
    if (result.success) {
      toast.success('응답이 성공적으로 저장되었습니다.');
      loadFeedback();
      setSelectedFeedback({
        ...selectedFeedback,
        response: responseText,
        responseDate: new Date().toISOString(),
        status: 'responded'
      });
    } else {
      toast.error(`응답 저장 실패: ${result.error}`);
    }
  };

  // 피드백 삭제 처리
  const handleDeleteFeedback = (feedbackId) => {
    if (window.confirm('정말로 이 피드백을 삭제하시겠습니까?')) {
      const result = deleteFeedback(feedbackId);
      
      if (result.success) {
        toast.success('피드백이 삭제되었습니다.');
        loadFeedback();
        
        // 삭제된 피드백이 현재 선택된 피드백이면 선택 해제
        if (selectedFeedback && selectedFeedback.id === feedbackId) {
          setSelectedFeedback(null);
        }
      } else {
        toast.error(`삭제 실패: ${result.error}`);
      }
    }
  };

  // 필터 변경 처리
  const handleFilterChange = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // 페이지 리셋
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // 별점 렌더링 함수
  const renderRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`star ${i <= rating ? 'filled' : 'empty'}`}
        >
          ★
        </span>
      );
    }
    return <div className="rating-stars">{stars}</div>;
  };

  // 상태에 따른 라벨 클래스 반환
  const getStatusClass = (status) => {
    switch (status) {
      case 'new': return 'status-new';
      case 'read': return 'status-read';
      case 'responded': return 'status-responded';
      default: return '';
    }
  };

  // 상태에 따른 한글 라벨 반환
  const getStatusLabel = (status) => {
    switch (status) {
      case 'new': return '새 피드백';
      case 'read': return '읽음';
      case 'responded': return '응답 완료';
      default: return '';
    }
  };

  if (isLoading) {
    return (
      <div className="admin-panel-content">
        <h2 className="admin-panel-title">사용자 피드백 관리</h2>
        <div className="admin-loading">데이터 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel-content">
      <h2 className="admin-panel-title">사용자 피드백 관리</h2>
      
      <div className="feedback-container">
        {/* 필터 */}
        <div className="feedback-filter">
          <button 
            className={`filter-btn ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => handleFilterChange('all')}
          >
            전체
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'new' ? 'active' : ''}`}
            onClick={() => handleFilterChange('new')}
          >
            새 피드백
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'read' ? 'active' : ''}`}
            onClick={() => handleFilterChange('read')}
          >
            읽음
          </button>
          <button 
            className={`filter-btn ${filterStatus === 'responded' ? 'active' : ''}`}
            onClick={() => handleFilterChange('responded')}
          >
            응답 완료
          </button>
        </div>
        
        <div className="feedback-main">
          {/* 피드백 목록 */}
          <div className="feedback-list">
            {feedback.length > 0 ? (
              feedback.map(item => (
                <div 
                  key={item.id} 
                  className={`feedback-item ${selectedFeedback && selectedFeedback.id === item.id ? 'selected' : ''} ${item.status === 'new' ? 'unread' : ''}`}
                  onClick={() => handleViewFeedback(item)}
                >
                  <div className="feedback-item-header">
                    <span className={`feedback-status ${getStatusClass(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                    <span className="feedback-date">{formatDate(item.date)}</span>
                  </div>
                  
                  <div className="feedback-item-body">
                    <div className="feedback-author">{item.name}</div>
                    <div className="feedback-preview">
                      {item.message.length > 70 
                        ? `${item.message.substring(0, 70)}...` 
                        : item.message}
                    </div>
                  </div>
                  
                  <div className="feedback-item-footer">
                    {renderRating(item.rating)}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-feedback-message">
                {filterStatus === 'all' 
                  ? '아직 피드백이 없습니다.' 
                  : `${getStatusLabel(filterStatus)} 상태의 피드백이 없습니다.`}
              </div>
            )}
            
            {/* 페이지네이션 */}
            {totalPages > 1 && (
              <div className="feedback-pagination">
                <button 
                  className="pagination-btn"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  이전
                </button>
                <span className="pagination-info">
                  {currentPage} / {totalPages}
                </span>
                <button 
                  className="pagination-btn"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  다음
                </button>
              </div>
            )}
          </div>
          
          {/* 피드백 상세 */}
          <div className="feedback-detail">
            {selectedFeedback ? (
              <>
                <div className="feedback-detail-header">
                  <h3 className="feedback-detail-title">피드백 상세 정보</h3>
                  <div className="feedback-actions">
                    <div className="status-selector">
                      <label>상태:</label>
                      <select 
                        value={selectedFeedback.status}
                        onChange={(e) => handleStatusChange(selectedFeedback.id, e.target.value)}
                      >
                        <option value="new">새 피드백</option>
                        <option value="read">읽음</option>
                        <option value="responded">응답 완료</option>
                      </select>
                    </div>
                    <button 
                      className="delete-btn"
                      onClick={() => handleDeleteFeedback(selectedFeedback.id)}
                    >
                      삭제
                    </button>
                  </div>
                </div>
                
                <div className="feedback-detail-content">
                  <div className="feedback-info">
                    <p><strong>작성자:</strong> {selectedFeedback.name}</p>
                    <p><strong>이메일:</strong> {selectedFeedback.email || '없음'}</p>
                    <p><strong>날짜:</strong> {formatDate(selectedFeedback.date)}</p>
                    <p><strong>별점:</strong> {renderRating(selectedFeedback.rating)}</p>
                  </div>
                  
                  <div className="feedback-message">
                    <h4>피드백 내용</h4>
                    <div className="message-content">
                      {selectedFeedback.message}
                    </div>
                  </div>
                  
                  <div className="feedback-response">
                    <h4>답변</h4>
                    <textarea 
                      className="response-textarea"
                      value={responseText}
                      onChange={(e) => setResponseText(e.target.value)}
                      placeholder="사용자 피드백에 대한 답변을 작성하세요..."
                      rows={6}
                    ></textarea>
                    
                    <div className="response-actions">
                      <button 
                        className="submit-btn"
                        onClick={handleSubmitResponse}
                      >
                        답변 저장
                      </button>
                    </div>
                    
                    {selectedFeedback.responseDate && (
                      <div className="response-info">
                        <p>응답 날짜: {formatDate(selectedFeedback.responseDate)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-selection-message">
                피드백을 선택하면 상세 정보가 여기에 표시됩니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackManager;