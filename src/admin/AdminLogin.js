import React, { useState, useEffect } from 'react';
import { verifyAdminLogin, initDatabase } from '../utils/simpleDatabase'; // 수정됨: simpleDatabase 사용
import { useNavigate } from 'react-router-dom';
import './AdminLogin.css';
import { toast } from 'react-toastify';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const navigate = useNavigate();

  // 컴포넌트 마운트 시 데이터베이스 초기화 확인
  useEffect(() => {
    const initDb = async () => {
      try {
        const result = await initDatabase();
        setInitialized(true);
        console.log('데이터베이스 초기화 상태:', result);
      } catch (error) {
        console.error('데이터베이스 초기화 오류:', error);
        toast.error('관리자 페이지 로딩 중 오류가 발생했습니다. 새로고침을 시도해주세요.');
      }
    };
    
    initDb();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // 로그인 처리
    try {
      const result = verifyAdminLogin(username, password);
      
      if (result.error) {
        toast.error('로그인 확인 중 오류가 발생했습니다.');
        setLoading(false);
        return;
      }

      if (result.success) {
        // 세션 스토리지에 로그인 상태 저장
        sessionStorage.setItem('admin_logged_in', 'true');
        toast.success('로그인 성공!');
        navigate('/admin/dashboard');
      } else {
        toast.error('잘못된 아이디 또는 비밀번호입니다.');
      }
    } catch (error) {
      console.error('로그인 오류:', error);
      toast.error('로그인 처리 중 오류가 발생했습니다.');
    }

    setLoading(false);
  };

  // 데이터베이스 초기화 중 로딩 표시
  if (!initialized) {
    return (
      <div className="admin-login-container">
        <div className="admin-login-card">
          <h2 className="admin-login-title">관리자 페이지 로딩 중...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <h2 className="admin-login-title">관리자 로그인</h2>
        
        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="admin-form-group">
            <label htmlFor="username">아이디</label>
            <input
              type="text"
              id="username"
              className="admin-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="아이디를 입력하세요"
              required
              disabled={loading}
            />
          </div>
          
          <div className="admin-form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              type="password"
              id="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요"
              required
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            className="admin-submit-btn"
            disabled={loading}
          >
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>
        
        <div className="admin-login-footer">
          <p>카페 룰렛 관리자 페이지입니다.</p>
          <p className="admin-login-tip">기본 아이디: admin / 비밀번호: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;