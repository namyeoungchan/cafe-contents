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
  winners: [
    {
      id: 1,
      phone_number: '010-1234-5678',
      order_number: 'A1001',
      prize_id: 1,
      prize_name: '아메리카노 무료 쿠폰',
      win_date: new Date().toISOString(),
      is_used: 0
    },
    {
      id: 2,
      phone_number: '010-9876-5432',
      order_number: 'A1002',
      prize_id: 2,
      prize_name: '케이크 50% 할인',
      win_date: new Date(Date.now() - 86400000).toISOString(), // 하루 전
      is_used: 1
    },
    {
      id: 3,
      phone_number: '010-5555-1234',
      order_number: 'A1003',
      prize_id: 3,
      prize_name: '음료 사이즈업',
      win_date: new Date(Date.now() - 172800000).toISOString(), // 이틀 전
      is_used: 0
    }
  ]
};

  // 데이터베이스 초기화
export const initDatabase = async () => {
  try {
    // localStorage에서 데이터 가져오기
    const savedData = localStorage.getItem('cafeAppData');
    
    if (!savedData) {
      // 저장된 데이터가 없으면 기본 데이터로 초기화
      localStorage.setItem('cafeAppData', JSON.stringify(defaultData));
      console.log('데이터베이스가 기본 데이터로 초기화되었습니다.');
    } else {
      // 기존 데이터가 있으면 마이그레이션 실행
      const data = JSON.parse(savedData);
      let needsUpdate = false;
      
      // is_used 필드 마이그레이션
      if (data.winners && data.winners.length > 0) {
        data.winners.forEach(winner => {
          // is_used 필드 마이그레이션
          if (winner.is_used === undefined) {
            winner.is_used = 0; // 기본값은 미사용 상태
            needsUpdate = true;
          }
          
          // counts_as_win 필드 마이그레이션
          if (winner.counts_as_win === undefined) {
            // '다음 기회에'는 당첨 횟수에 포함하지 않음
            winner.counts_as_win = (winner.prize_name === '다음 기회에') ? 0 : 1;
            needsUpdate = true;
          }
        });
      }
      
      // winners 배열이 없으면 추가
      if (!data.winners) {
        data.winners = defaultData.winners;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        localStorage.setItem('cafeAppData', JSON.stringify(data));
        console.log('데이터베이스가 업데이트되었습니다.');
      }
    }
    
    return true;
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    return false;
  }
};

// 데이터베이스 강제 초기화 (디버깅용)
export const resetDatabase = () => {
  try {
    localStorage.setItem('cafeAppData', JSON.stringify(defaultData));
    console.log('데이터베이스가 강제로 초기화되었습니다.');
    return { success: true };
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    return { error: error.message };
  }
};

// 데이터베이스에서 데이터 가져오기
export const getData = () => {
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
    
    // 오늘 날짜로 시작하는 win_date를 가진 실제 당첨자 수 계산
    // counts_as_win 필드가 없는 이전 데이터는 기본적으로 1로 취급
    return winners.filter(winner => 
      winner.win_date.startsWith(today) && 
      (winner.counts_as_win === undefined || winner.counts_as_win === 1)
    ).length;
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

// 당첨자 사용 여부 업데이트
export const updateWinnerUsage = (winnerId, isUsed) => {
  try {
    const data = getData();
    const index = data.winners.findIndex(winner => winner.id === winnerId);
    
    if (index === -1) {
      return { error: '당첨자를 찾을 수 없습니다.' };
    }
    
    data.winners[index].is_used = isUsed ? 1 : 0;
    
    saveData(data);
    return { success: true };
  } catch (error) {
    console.error('당첨자 사용 여부 업데이트 오류:', error);
    return { error: error.message };
  }
};

// 당첨자 필터링 (경품, 날짜 범위, 사용 여부)
export const getFilteredWinners = (filters = {}, limit = 10, offset = 0) => {
  try {
    const data = getData();
    
    // winners 배열이 없거나 비어있는 경우 확인
    if (!data.winners || !Array.isArray(data.winners)) {
      console.error('winners 배열이 유효하지 않습니다:', data.winners);
      return { winners: [], totalCount: 0 };
    }
    
    console.log('필터 적용 전 전체 당첨자 수:', data.winners.length);
    
    let winners = [...data.winners]; // 복사본 생성
    
    // 경품 ID로 필터링
    if (filters.prizeId) {
      const prizeIdToFilter = Number(filters.prizeId);
      winners = winners.filter(winner => {
        const winnerId = typeof winner.prize_id === 'string' ? parseInt(winner.prize_id) : winner.prize_id;
        return winnerId === prizeIdToFilter;
      });
      console.log(`경품 ID ${filters.prizeId} 필터 후 당첨자 수:`, winners.length);
    }
    
    // 경품 이름으로 필터링
    if (filters.prizeName) {
      winners = winners.filter(winner => 
        winner.prize_name && winner.prize_name.toLowerCase().includes(filters.prizeName.toLowerCase())
      );
      console.log(`경품 이름 '${filters.prizeName}' 필터 후 당첨자 수:`, winners.length);
    }
    
    // 사용 여부로 필터링
    if (filters.isUsed !== '' && filters.isUsed !== undefined) {
      const isUsedValue = Number(filters.isUsed);
      winners = winners.filter(winner => winner.is_used === isUsedValue);
      console.log(`사용 여부(${filters.isUsed}) 필터 후 당첨자 수:`, winners.length);
    }
    
    // 시작 날짜로 필터링
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      winners = winners.filter(winner => new Date(winner.win_date) >= startDate);
      console.log(`시작 날짜(${filters.startDate}) 필터 후 당첨자 수:`, winners.length);
    }
    
    // 종료 날짜로 필터링
    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // 해당 날짜의 마지막 시간으로 설정
      winners = winners.filter(winner => new Date(winner.win_date) <= endDate);
      console.log(`종료 날짜(${filters.endDate}) 필터 후 당첨자 수:`, winners.length);
    }
    
    // 전화번호로 검색
    if (filters.phoneNumber) {
      winners = winners.filter(winner => 
        winner.phone_number && winner.phone_number.includes(filters.phoneNumber)
      );
      console.log(`전화번호(${filters.phoneNumber}) 필터 후 당첨자 수:`, winners.length);
    }
    
    // 날짜 내림차순 정렬
    winners.sort((a, b) => new Date(b.win_date) - new Date(a.win_date));
    
    // 필터링된 총 결과 수 계산
    const totalCount = winners.length;
    
    // 페이지네이션 적용
    const paginatedWinners = winners.slice(offset, offset + limit);
    console.log('페이지네이션 후 표시될 당첨자 수:', paginatedWinners.length);
    
    return {
      winners: paginatedWinners,
      totalCount: totalCount
    };
  } catch (error) {
    console.error('필터링된 당첨자 목록 가져오기 오류:', error);
    return { winners: [], totalCount: 0 };
  }
};

// 당첨자 추가
export const addWinner = (phoneNumber, orderNumber, prizeId, prizeName) => {
  try {
    // '다음 기회에'인 경우 당첨 내역에는 추가하되, 당첨 횟수에는 포함하지 않음
    const isRealPrize = prizeName !== '다음 기회에';
    
    const data = getData();
    const winDate = new Date().toISOString();
    
    // 새 당첨자 객체 생성
    const newWinner = {
      id: data.winners ? data.winners.length + 1 : 1,
      phone_number: phoneNumber,
      order_number: orderNumber,
      prize_id: prizeId,
      prize_name: prizeName,
      win_date: winDate,
      is_used: 0, // 초기값은 미사용 상태(0)
      counts_as_win: isRealPrize ? 1 : 0 // 실제 당첨 여부 (다음 기회에는 0)
    };
    
    // winners 배열이 없으면 생성
    if (!data.winners) {
      data.winners = [];
    }
    
    // 새 당첨자 추가
    data.winners.push(newWinner);
    
    // 디버깅용 로그
    console.log('저장할 당첨자 데이터:', newWinner);
    console.log('전체 당첨자 목록 (저장 전):', data.winners);
    
    // 데이터 저장
    const saveResult = saveData(data);
    
    // 저장 후 다시 확인
    const updatedData = getData();
    console.log('저장 후 전체 당첨자 목록:', updatedData.winners);
    
    return { success: saveResult, counts_as_win: isRealPrize };
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

// 특정 사용자의 당첨 내역 조회
export const getUserWinningHistory = (userId) => {
  try {
    const data = getData();
    
    if (!data.winners || !Array.isArray(data.winners)) {
      return { history: [], error: '당첨 내역이 없습니다.' };
    }
    
    // userId로 필터링 (전화번호 또는 ID)
    const userWinnings = data.winners.filter(winner => 
      winner.phone_number === userId || winner.phone_number === userId.toString()
    );
    
    // 날짜 내림차순 정렬 (최신순)
    userWinnings.sort((a, b) => new Date(b.win_date) - new Date(a.win_date));
    
    return { history: userWinnings };
  } catch (error) {
    console.error('사용자 당첨 내역 조회 오류:', error);
    return { history: [], error: error.message };
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
