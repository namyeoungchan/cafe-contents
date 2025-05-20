// 피드백 관리를 위한 데이터베이스 유틸리티

// localStorage에서 데이터 가져오기
const getData = () => {
  try {
    const data = localStorage.getItem('cafeAppData');
    return data ? JSON.parse(data) : { feedback: [] };
  } catch (error) {
    console.error('데이터 로드 오류:', error);
    return { feedback: [] };
  }
};

// localStorage에 데이터 저장하기
const saveData = (data) => {
  try {
    localStorage.setItem('cafeAppData', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('데이터 저장 오류:', error);
    return false;
  }
};

// 피드백 목록 초기화 (없으면 생성)
export const initFeedbackData = () => {
  try {
    const data = getData();
    if (!data.feedback) {
      data.feedback = [];
      saveData(data);
    }
    return true;
  } catch (error) {
    console.error('피드백 데이터 초기화 오류:', error);
    return false;
  }
};

// 새 피드백 추가
export const addFeedback = (name, email, message, rating) => {
  try {
    const data = getData();
    
    // feedback 속성이 없으면 초기화
    if (!data.feedback) {
      data.feedback = [];
    }
    
    // 새 피드백 생성
    const newFeedback = {
      id: Date.now(), // 현재 시간을 ID로 사용
      name,
      email,
      message,
      rating,
      date: new Date().toISOString(),
      status: 'new' // 'new', 'read', 'responded'
    };
    
    // 피드백 목록에 추가
    data.feedback.unshift(newFeedback);
    saveData(data);
    
    return { success: true };
  } catch (error) {
    console.error('피드백 추가 오류:', error);
    return { error: error.message };
  }
};

// 모든 피드백 가져오기 (페이지네이션)
export const getAllFeedback = (limit = 10, offset = 0) => {
  try {
    const data = getData();
    
    // feedback 속성이 없으면 빈 배열 반환
    if (!data.feedback) {
      return [];
    }
    
    // 날짜 내림차순으로 정렬 (최신순)
    const sortedFeedback = [...data.feedback].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    
    // 페이지네이션 적용
    return sortedFeedback.slice(offset, offset + limit);
  } catch (error) {
    console.error('피드백 목록 가져오기 오류:', error);
    return [];
  }
};

// 피드백 총 개수 가져오기
export const getTotalFeedbackCount = () => {
  try {
    const data = getData();
    return data.feedback ? data.feedback.length : 0;
  } catch (error) {
    console.error('피드백 개수 가져오기 오류:', error);
    return 0;
  }
};

// 피드백 상태 업데이트
export const updateFeedbackStatus = (feedbackId, newStatus) => {
  try {
    const data = getData();
    
    if (!data.feedback) {
      return { error: '피드백 데이터가 존재하지 않습니다.' };
    }
    
    // 해당 ID의 피드백 찾기
    const feedbackIndex = data.feedback.findIndex(
      feedback => feedback.id === feedbackId
    );
    
    if (feedbackIndex === -1) {
      return { error: '해당 피드백을 찾을 수 없습니다.' };
    }
    
    // 상태 업데이트
    data.feedback[feedbackIndex].status = newStatus;
    
    // 응답 추가 (responded 상태일 경우)
    if (newStatus === 'responded' && !data.feedback[feedbackIndex].responseDate) {
      data.feedback[feedbackIndex].responseDate = new Date().toISOString();
    }
    
    saveData(data);
    return { success: true };
  } catch (error) {
    console.error('피드백 상태 업데이트 오류:', error);
    return { error: error.message };
  }
};

// 피드백에 응답 추가
export const addResponseToFeedback = (feedbackId, responseText) => {
  try {
    const data = getData();
    
    if (!data.feedback) {
      return { error: '피드백 데이터가 존재하지 않습니다.' };
    }
    
    // 해당 ID의 피드백 찾기
    const feedbackIndex = data.feedback.findIndex(
      feedback => feedback.id === feedbackId
    );
    
    if (feedbackIndex === -1) {
      return { error: '해당 피드백을 찾을 수 없습니다.' };
    }
    
    // 응답 추가
    data.feedback[feedbackIndex].response = responseText;
    data.feedback[feedbackIndex].responseDate = new Date().toISOString();
    data.feedback[feedbackIndex].status = 'responded';
    
    saveData(data);
    return { success: true };
  } catch (error) {
    console.error('피드백 응답 추가 오류:', error);
    return { error: error.message };
  }
};

// 피드백 삭제
export const deleteFeedback = (feedbackId) => {
  try {
    const data = getData();
    
    if (!data.feedback) {
      return { error: '피드백 데이터가 존재하지 않습니다.' };
    }
    
    // 해당 ID의 피드백 필터링
    data.feedback = data.feedback.filter(
      feedback => feedback.id !== feedbackId
    );
    
    saveData(data);
    return { success: true };
  } catch (error) {
    console.error('피드백 삭제 오류:', error);
    return { error: error.message };
  }
};