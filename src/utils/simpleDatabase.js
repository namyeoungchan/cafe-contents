// localStorage를 사용한 간단한 데이터베이스 API
// SQL.js 대신 localStorage를 사용하여 데이터 저장

// 기본 데이터
const defaultData = {
  // 관리자 설정
  adminSettings: {
    maxWinnersPerDay: 3,
    username: 'admin',
    password: 'admin123'
  },
  
  // 경품 목록
  prizes: [
    { id: 1, name: '아메리카노 무료 쿠폰', probability: 0.2, is_active: 1 },
    { id: 2, name: '케이크 50% 할인', probability: 0.1, is_active: 1 },
    { id: 3, name: '음료 사이즈업', probability: 0.3, is_active: 1 },
    { id: 4, name: '다음 기회에', probability: 0.4, is_active: 1 }
  ],
  
  // 당첨자 기록
  winners: []
};

// 데이터베이스 초기화
export const initDatabase = async () => {
  try {
    // localStorage에서 데이터 가져오기
    const savedData = localStorage.getItem('cafeAppData');
    
    if (!savedData) {
      // 저장된 데이터가 없으면 기본 데이터로 초기화
      localStorage.setItem('cafeAppData', JSON.stringify(defaultData));
    }
    
    return true;
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    return false;
  }
};

// 데이터베이스에서 데이터 가져오기
const getData = () => {
  try {
    const data = localStorage.getItem('cafeAppData');
    return data ? JSON.parse(data) : defaultData;
  } catch (error) {
    console.error('데이터 로드 오류:', error);
    return defaultData;
  }
};

// 데이터베이스에 데이터 저장하기
const saveData = (data) => {
  try {
    localStorage.setItem('cafeAppData', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('데이터 저장 오류:', error);
    return false;
  }
};

// 관리자 설정 가져오기
export const getAdminSettings = () => {
  return getData().adminSettings;
};

// 관리자 설정 업데이트
export const updateAdminSettings = (maxWinnersPerDay, username, password) => {
  try {
    const data = getData();
    data.adminSettings = {
      maxWinnersPerDay,
      username,
      password: password || data.adminSettings.password // 비밀번호가 비어있으면 기존 비밀번호 유지
    };
    saveData(data);
    return { success: true };
  } catch (error) {
    console.error('관리자 설정 업데이트 오류:', error);
    return { error: error.message };
  }
};

// 관리자 로그인 확인
export const verifyAdminLogin = (username, password) => {
  try {
    const { username: storedUsername, password: storedPassword } = getAdminSettings();
    return { success: username === storedUsername && password === storedPassword };
  } catch (error) {
    console.error('로그인 확인 오류:', error);
    return { error: error.message };
  }
};

// 모든 경품 목록 가져오기
export const getAllPrizes = () => {
  return getData().prizes;
};

// 활성화된 경품 목록 가져오기
export const getActivePrizes = () => {
  return getData().prizes.filter(prize => prize.is_active === 1);
};

// 경품 추가
export const addPrize = (name, probability) => {
  try {
    const data = getData();
    const maxId = data.prizes.reduce((max, prize) => Math.max(max, prize.id), 0);
    data.prizes.push({
      id: maxId + 1,
      name,
      probability: parseFloat(probability),
      is_active: 1
    });
    saveData(data);
    return { success: true };
  } catch (error) {
    console.error('경품 추가 오류:', error);
    return { error: error.message };
  }
};

// 경품 업데이트
export const updatePrize = (id, name, probability, isActive) => {
  try {
    const data = getData();
    const index = data.prizes.findIndex(prize => prize.id === id);
    
    if (index === -1) {
      return { error: '경품을 찾을 수 없습니다.' };
    }
    
    data.prizes[index] = {
      id,
      name,
      probability: parseFloat(probability),
      is_active: isActive ? 1 : 0
    };
    
    saveData(data);
    return { success: true };
  } catch (error) {
    console.error('경품 업데이트 오류:', error);
    return { error: error.message };
  }
};

// 경품 삭제
export const deletePrize = (id) => {
  try {
    const data = getData();
    data.prizes = data.prizes.filter(prize => prize.id !== id);
    saveData(data);
    return { success: true };
  } catch (error) {
    console.error('경품 삭제 오류:', error);
    return { error: error.message };
  }
};

// 오늘의 당첨자 수 확인
export const getTodayWinnersCount = () => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const winners = getData().winners;
    
    // 오늘 날짜로 시작하는 win_date를 가진 당첨자 수 계산
    return winners.filter(winner => winner.win_date.startsWith(today)).length;
  } catch (error) {
    console.error('당첨자 수 확인 오류:', error);
    return 0;
  }
};

// 모든 당첨자 목록 가져오기 (페이지네이션)
export const getAllWinners = (limit = 10, offset = 0) => {
  try {
    const winners = getData().winners;
    // 날짜 내림차순 정렬
    winners.sort((a, b) => new Date(b.win_date) - new Date(a.win_date));
    
    // 페이지네이션 적용
    return winners.slice(offset, offset + limit);
  } catch (error) {
    console.error('당첨자 목록 가져오기 오류:', error);
    return [];
  }
};

// 당첨자 총 수 가져오기
export const getTotalWinnersCount = () => {
  try {
    return getData().winners.length;
  } catch (error) {
    console.error('총 당첨자 수 가져오기 오류:', error);
    return 0;
  }
};

// 당첨자 추가
export const addWinner = (phoneNumber, orderNumber, prizeId, prizeName) => {
  try {
    const data = getData();
    const winDate = new Date().toISOString();
    
    data.winners.push({
      id: data.winners.length + 1,
      phone_number: phoneNumber,
      order_number: orderNumber,
      prize_id: prizeId,
      prize_name: prizeName,
      win_date: winDate
    });
    
    saveData(data);
    return { success: true };
  } catch (error) {
    console.error('당첨자 추가 오류:', error);
    return { error: error.message };
  }
};

// 특정 전화번호와 주문번호로 이미 참여했는지 확인
export const checkParticipation = (phoneNumber, orderNumber) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD 형식
    const winners = getData().winners;
    
    // 오늘 날짜에 같은 전화번호와 주문번호로 참여한 기록이 있는지 확인
    return winners.some(winner => 
      winner.phone_number === phoneNumber && 
      winner.order_number === orderNumber && 
      winner.win_date.startsWith(today)
    );
  } catch (error) {
    console.error('참여 확인 오류:', error);
    return false;
  }
};

// GitHub Pages 배포를 위한 데이터 내보내기
export const exportDatabase = async () => {
  try {
    const data = getData();
    const jsonString = JSON.stringify(data, null, 2);
    
    // Blob 객체 생성 및 다운로드 링크 생성
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cafe_app_data.json';
    a.click();
    
    // 리소스 해제
    URL.revokeObjectURL(url);
    
    return { success: true };
  } catch (error) {
    console.error('데이터베이스 내보내기 오류:', error);
    return { error: error.message };
  }
};

// GitHub Pages 배포를 위한 데이터 가져오기
export const importDatabase = async (file) => {
  try {
    const jsonString = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
    
    const data = JSON.parse(jsonString);
    
    // 데이터 유효성 검사
    if (!data.adminSettings || !data.prizes || !data.winners) {
      throw new Error('유효하지 않은 데이터 형식입니다.');
    }
    
    // 데이터 저장
    saveData(data);
    return { success: true };
  } catch (error) {
    console.error('데이터베이스 가져오기 오류:', error);
    return { error: error.message };
  }
};

// 데이터베이스가 사용 가능한지 확인
export const isDatabaseReady = () => {
  try {
    return localStorage.getItem('cafeAppData') !== null;
  } catch (error) {
    return false;
  }
};

// 초기화 실행
initDatabase().catch(error => {
  console.error('데이터베이스 초기화 실패:', error);
});
