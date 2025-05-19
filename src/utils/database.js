import initSqlJs from 'sql.js';
import localforage from 'localforage';

// SQL.js 파일 로드 및 초기화
let SQL;
let db;
let dbInitialized = false;

// 모의 데이터 (데이터베이스 초기화 전 사용)
const mockPrizes = [
  { id: 1, name: '아메리카노 무료 쿠폰', probability: 0.2, is_active: 1 },
  { id: 2, name: '케이크 50% 할인', probability: 0.1, is_active: 1 },
  { id: 3, name: '음료 사이즈업', probability: 0.3, is_active: 1 },
  { id: 4, name: '다음 기회에', probability: 0.4, is_active: 1 }
];

// 데이터베이스 초기화 함수
export const initDatabase = async () => {
  // 이미 초기화되었으면 중복 실행 방지
  if (dbInitialized) return true;
  
  try {
    // SQL.js 초기화 (WebAssembly 파일을 public 폴더에 직접 복사)
    SQL = await initSqlJs({
      // 웹팩 번들링 문제로 인해 직접 wasm 파일 경로 지정
      locateFile: file => `${process.env.PUBLIC_URL}/sql-wasm.wasm`
    });

    // 이전에 저장된 데이터베이스가 있는지 확인
    const savedDbData = await localforage.getItem('cafeRouletteDb');
    
    if (savedDbData) {
      // 기존 데이터베이스 로드
      db = new SQL.Database(new Uint8Array(savedDbData));
    } else {
      // 새 데이터베이스 생성
      db = new SQL.Database();
      
      // 테이블 생성
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_settings (
          id INTEGER PRIMARY KEY,
          max_winners_per_day INTEGER DEFAULT 3,
          login_username TEXT DEFAULT 'admin',
          login_password TEXT DEFAULT 'admin123'
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS prizes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          probability REAL NOT NULL,
          is_active INTEGER DEFAULT 1
        )
      `);

      db.run(`
        CREATE TABLE IF NOT EXISTS winners (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          phone_number TEXT NOT NULL,
          order_number TEXT NOT NULL,
          prize_id INTEGER NOT NULL,
          prize_name TEXT NOT NULL,
          win_date TEXT NOT NULL,
          FOREIGN KEY (prize_id) REFERENCES prizes(id)
        )
      `);

      // 기본 관리자 계정 설정
      db.run(`
        INSERT INTO admin_settings (id, max_winners_per_day, login_username, login_password) 
        VALUES (1, 3, 'admin', 'admin123')
      `);

      // 기본 경품 설정
      db.run(`
        INSERT INTO prizes (name, probability) VALUES 
        ('아메리카노 무료 쿠폰', 0.2),
        ('케이크 50% 할인', 0.1),
        ('음료 사이즈업', 0.3),
        ('다음 기회에', 0.4)
      `);

      // 데이터베이스 저장
      await saveDatabase();
    }
    
    dbInitialized = true;
    console.log('데이터베이스 초기화 성공');
    return true;
  } catch (error) {
    console.error('데이터베이스 초기화 오류:', error);
    return false;
  }
};

// 데이터베이스 저장 함수
export const saveDatabase = async () => {
  if (!db) return false;
  
  try {
    const data = db.export();
    const buffer = new Uint8Array(data);
    await localforage.setItem('cafeRouletteDb', buffer);
    return true;
  } catch (error) {
    console.error('데이터베이스 저장 오류:', error);
    return false;
  }
};

// 쿼리 실행 함수
export const runQuery = (query, params = []) => {
  if (!db) return { error: '데이터베이스가 초기화되지 않았습니다.' };
  
  try {
    const result = db.exec(query, params);
    return { result };
  } catch (error) {
    console.error('쿼리 실행 오류:', error);
    return { error: error.message };
  }
};

// 추가, 수정, 삭제 쿼리 실행 함수
export const executeQuery = (query, params = []) => {
  if (!db) return { error: '데이터베이스가 초기화되지 않았습니다.' };
  
  try {
    db.run(query, params);
    saveDatabase(); // 데이터베이스 상태 저장
    return { success: true };
  } catch (error) {
    console.error('쿼리 실행 오류:', error);
    return { error: error.message };
  }
};

// 관리자 설정 가져오기
export const getAdminSettings = () => {
  if (!dbInitialized || !db) {
    // 데이터베이스가 아직 초기화되지 않았으면 기본값 반환
    return {
      maxWinnersPerDay: 3,
      username: 'admin',
      password: 'admin123'
    };
  }
  
  try {
    const result = runQuery('SELECT * FROM admin_settings WHERE id = 1');
    if (result.error) return { error: result.error };
    
    if (result.result && result.result.length > 0 && result.result[0].values.length > 0) {
      const row = result.result[0].values[0];
      return {
        maxWinnersPerDay: row[1],
        username: row[2],
        password: row[3]
      };
    }
  } catch (error) {
    console.error('관리자 설정 가져오기 오류:', error);
  }
  
  // 오류 발생 시 기본값 사용
  return {
    maxWinnersPerDay: 3,
    username: 'admin',
    password: 'admin123'
  };
};

// 관리자 설정 업데이트
export const updateAdminSettings = (maxWinnersPerDay, username, password) => {
  if (!dbInitialized || !db) return { error: '데이터베이스가 초기화되지 않았습니다.' };
  
  return executeQuery(
    'UPDATE admin_settings SET max_winners_per_day = ?, login_username = ?, login_password = ? WHERE id = 1',
    [maxWinnersPerDay, username, password]
  );
};

// 관리자 로그인 확인
export const verifyAdminLogin = (username, password) => {
  if (!dbInitialized || !db) {
    // 데이터베이스가 아직 초기화되지 않았으면 기본 관리자 계정 사용
    return { 
      success: username === 'admin' && password === 'admin123' 
    };
  }
  
  try {
    const result = runQuery(
      'SELECT COUNT(*) as count FROM admin_settings WHERE login_username = ? AND login_password = ?',
      [username, password]
    );
    
    if (result.error) return { error: result.error };
    
    if (result.result && result.result.length > 0) {
      const count = result.result[0].values[0][0];
      return { success: count > 0 };
    }
  } catch (error) {
    console.error('로그인 확인 오류:', error);
  }
  
  return { error: '로그인 확인 실패' };
};

// 모든 경품 목록 가져오기
export const getAllPrizes = () => {
  if (!dbInitialized || !db) {
    // 데이터베이스가 아직 초기화되지 않았으면 기본 경품 목록 반환
    return mockPrizes;
  }
  
  try {
    const result = runQuery('SELECT * FROM prizes ORDER BY probability DESC');
    if (result.error) return mockPrizes;
    
    if (result.result && result.result.length > 0) {
      const columns = result.result[0].columns;
      const values = result.result[0].values;
      
      return values.map(row => {
        const prize = {};
        columns.forEach((col, index) => {
          prize[col] = row[index];
        });
        return prize;
      });
    }
  } catch (error) {
    console.error('경품 목록 가져오기 오류:', error);
  }
  
  // 오류 발생 시 기본 목록 사용
  return mockPrizes;
};

// 활성화된 경품 목록 가져오기
export const getActivePrizes = () => {
  if (!dbInitialized || !db) {
    // 데이터베이스가 아직 초기화되지 않았으면 기본 경품 목록 반환
    return mockPrizes;
  }
  
  try {
    const result = runQuery('SELECT * FROM prizes WHERE is_active = 1 ORDER BY probability DESC');
    if (result.error) return mockPrizes;
    
    if (result.result && result.result.length > 0) {
      const columns = result.result[0].columns;
      const values = result.result[0].values;
      
      return values.map(row => {
        const prize = {};
        columns.forEach((col, index) => {
          prize[col] = row[index];
        });
        return prize;
      });
    }
  } catch (error) {
    console.error('활성화된 경품 목록 가져오기 오류:', error);
  }
  
  // 오류 발생 시 기본 목록 사용
  return mockPrizes;
};

// 경품 추가
export const addPrize = (name, probability) => {
  if (!dbInitialized || !db) return { error: '데이터베이스가 초기화되지 않았습니다.' };
  
  return executeQuery(
    'INSERT INTO prizes (name, probability) VALUES (?, ?)',
    [name, probability]
  );
};

// 경품 업데이트
export const updatePrize = (id, name, probability, isActive) => {
  if (!dbInitialized || !db) return { error: '데이터베이스가 초기화되지 않았습니다.' };
  
  return executeQuery(
    'UPDATE prizes SET name = ?, probability = ?, is_active = ? WHERE id = ?',
    [name, probability, isActive ? 1 : 0, id]
  );
};

// 경품 삭제
export const deletePrize = (id) => {
  if (!dbInitialized || !db) return { error: '데이터베이스가 초기화되지 않았습니다.' };
  
  return executeQuery('DELETE FROM prizes WHERE id = ?', [id]);
};

// 오늘의 당첨자 수 확인
export const getTodayWinnersCount = () => {
  if (!dbInitialized || !db) return 0;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = runQuery(
      "SELECT COUNT(*) as count FROM winners WHERE win_date LIKE ?",
      [`${today}%`]
    );
    
    if (result.error) return 0;
    
    if (result.result && result.result.length > 0) {
      return result.result[0].values[0][0];
    }
  } catch (error) {
    console.error('당첨자 수 확인 오류:', error);
  }
  
  return 0;
};

// 모든 당첨자 목록 가져오기 (페이지네이션)
export const getAllWinners = (limit = 10, offset = 0) => {
  if (!dbInitialized || !db) return [];
  
  try {
    const result = runQuery(
      'SELECT * FROM winners ORDER BY win_date DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    if (result.error) return [];
    
    if (result.result && result.result.length > 0) {
      const columns = result.result[0].columns;
      const values = result.result[0].values;
      
      return values.map(row => {
        const winner = {};
        columns.forEach((col, index) => {
          winner[col] = row[index];
        });
        return winner;
      });
    }
  } catch (error) {
    console.error('당첨자 목록 가져오기 오류:', error);
  }
  
  return [];
};

// 당첨자 총 수 가져오기
export const getTotalWinnersCount = () => {
  if (!dbInitialized || !db) return 0;
  
  try {
    const result = runQuery('SELECT COUNT(*) as count FROM winners');
    
    if (result.error) return 0;
    
    if (result.result && result.result.length > 0) {
      return result.result[0].values[0][0];
    }
  } catch (error) {
    console.error('총 당첨자 수 가져오기 오류:', error);
  }
  
  return 0;
};

// 당첨자 추가
export const addWinner = (phoneNumber, orderNumber, prizeId, prizeName) => {
  if (!dbInitialized || !db) return { error: '데이터베이스가 초기화되지 않았습니다.' };
  
  const winDate = new Date().toISOString();
  
  return executeQuery(
    'INSERT INTO winners (phone_number, order_number, prize_id, prize_name, win_date) VALUES (?, ?, ?, ?, ?)',
    [phoneNumber, orderNumber, prizeId, prizeName, winDate]
  );
};

// 특정 전화번호와 주문번호로 이미 참여했는지 확인
export const checkParticipation = (phoneNumber, orderNumber) => {
  if (!dbInitialized || !db) return false;
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = runQuery(
      "SELECT COUNT(*) as count FROM winners WHERE phone_number = ? AND order_number = ? AND win_date LIKE ?",
      [phoneNumber, orderNumber, `${today}%`]
    );
    
    if (result.error) return false;
    
    if (result.result && result.result.length > 0) {
      return result.result[0].values[0][0] > 0;
    }
  } catch (error) {
    console.error('참여 확인 오류:', error);
  }
  
  return false;
};

// GitHub Pages 배포를 위한 데이터 내보내기
export const exportDatabase = async () => {
  if (!dbInitialized || !db) return { error: '데이터베이스가 초기화되지 않았습니다.' };
  
  try {
    const data = db.export();
    const buffer = new Uint8Array(data);
    
    // Blob 객체 생성 및 다운로드 링크 생성
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'cafe_roulette_db.sqlite';
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
    if (!SQL) {
      // 아직 SQL.js가 초기화되지 않았으면 초기화
      SQL = await initSqlJs({
        locateFile: file => `${process.env.PUBLIC_URL}/sql-wasm.wasm`
      });
    }
    
    const buffer = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(new Uint8Array(reader.result));
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
    
    // 새 데이터베이스 인스턴스 생성
    db = new SQL.Database(buffer);
    await saveDatabase();
    dbInitialized = true;
    return { success: true };
  } catch (error) {
    console.error('데이터베이스 가져오기 오류:', error);
    return { error: error.message };
  }
};

// 데이터베이스가 사용 가능한지 확인
export const isDatabaseReady = () => {
  return dbInitialized && db !== undefined;
};

// 초기화 실행 - 앱 시작 시 자동으로 실행
// 에러를 무시하고 항상 기본 기능이 작동하도록 처리
initDatabase().catch(error => {
  console.error('데이터베이스 초기화 실패:', error);
  console.log('기본 모의 데이터로 작동합니다.');
});
