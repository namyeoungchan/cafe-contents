import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const KakaoCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // URL에서 인증 코드 추출
    const code = new URLSearchParams(location.search).get('code');
    
    if (code) {
      // 백엔드가 있을 경우, 백엔드에 인증 코드 전송
      // 여기서는 프론트엔드에서만 처리하는 예시
      handleKakaoLogin(code);
    } else {
      setError('인증 코드가 없습니다.');
      setLoading(false);
    }
  }, [location]);

  const handleKakaoLogin = async (code) => {
    try {
      setLoading(true);
      console.log('인증 코드 처리 중:', code);

      // 여기에서 인증 코드를 사용하여 사용자 정보를 가져오는 로직을 구현합니다.
      // 실제로는 이 코드를 서버로 전송하여 처리하는 것이 좋습니다.
      
      // 임시 사용자 정보 생성
      const tempUser = {
        id: 'temp_' + Math.random().toString(36).substr(2, 9),
        nickname: '카카오 사용자',
        email: 'user@example.com'
      };
      
      // AuthContext의 login 함수 호출
      login(tempUser);
      
      // 로그인 후 메인 페이지로 이동
      console.log('로그인 성공, /user로 이동 시도');
      navigate('/user', { replace: true });

      // 문제 해결을 위한 추가 조치
      setTimeout(() => {
        if (window.location.pathname !== '/user') {
          console.log('리디렉션 재시도...');
          window.location.href = '/user';
        }
      }, 500);
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      setError('로그인 처리 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="callback-container">
        <div className="callback-loading">
          <h2>로그인 처리 중...</h2>
          <p>잠시만 기다려주세요.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="callback-container">
        <div className="callback-error">
          <h2>로그인 오류</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/login')} 
            className="btn btn-primary"
          >
            로그인 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default KakaoCallback;
