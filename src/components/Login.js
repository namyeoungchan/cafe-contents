import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  
  // 이미 로그인된 사용자라면 /user로 리디렉션
  useEffect(() => {
    if (isLoggedIn) {
      console.log('이미 로그인된 사용자입니다. /user로 리디렉션합니다.');
      navigate('/user', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // 카카오 SDK 스크립트 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    script.onload = () => initializeKakao();
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // 카카오 SDK 초기화
  const initializeKakao = () => {
    if (window.Kakao) {
      // 카카오 JavaScript 앱 키
      const KAKAO_JS_APP_KEY = 'ee621aea12da922c84b4253cf69098ce'; 
      window.Kakao.init(KAKAO_JS_APP_KEY);
      console.log('Kakao SDK initialized:', window.Kakao.isInitialized());
    }
  };

  // 카카오 로그인 처리
  const handleKakaoLogin = () => {
    if (window.Kakao) {
      window.Kakao.Auth.login({
        // 이메일만 선택 동의 항목으로 요청
        scope: 'account_email',
        success: (authObj) => {
          console.log('카카오 로그인 성공:', authObj);
          fetchUserInfo();
        },
        fail: (error) => {
          console.error('카카오 로그인 실패:', error);
          alert('로그인에 실패했습니다: ' + error.message);
        },
      });
    } else {
      console.error('Kakao SDK가 초기화되지 않았습니다.');
      alert('카카오 로그인을 위한 준비가 완료되지 않았습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 사용자 정보 가져오기
  const fetchUserInfo = () => {
    if (window.Kakao) {
      window.Kakao.API.request({
        url: '/v2/user/me',
        success: (response) => {
          console.log('사용자 정보 가져오기 성공:', response);
          const kakaoAccount = response.kakao_account || {};
          
          // 이메일 동의 여부 확인
          if (!kakaoAccount.email || !kakaoAccount.has_email) {
            // 로그아웃 처리
            if (window.Kakao.Auth.getAccessToken()) {
              window.Kakao.Auth.logout(() => {
                console.log('카카오 로그아웃 성공');
                
                // 알림창 표시 후 다시 로그인 시도 유도
                if (window.confirm('이메일 정보 제공에 동의해주셔야 서비스를 이용하실 수 있습니다. 다시 로그인하시겠습니까?')) {
                  // 다시 로그인 시도
                  handleKakaoLogin();
                }
              });
            }
            return;
          }
          
          // 필요한 정보가 있는지 확인하고 안전하게 접근
          const user = {
            id: response.id,
            nickname: kakaoAccount.profile?.nickname || '카카오 사용자',
            profileImage: kakaoAccount.profile?.profile_image_url || '',
            email: kakaoAccount.email,
            phoneNumber: kakaoAccount.phone_number || ''
          };
          
          console.log('생성된 사용자 정보:', user);
          
          // 전역 상태에 사용자 정보 저장 (AuthContext의 login 함수 호출)
          login(user);
          
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
        },
        fail: (error) => {
          console.error('사용자 정보 가져오기 실패:', error);
          alert('사용자 정보를 가져오는데 실패했습니다. 다시 시도해주세요.');
        },
      });
    }
  };

  // 카카오 로그아웃 처리는 이제 AuthContext에서 처리하므로 함수를 제거합니다

  return (
    <div className="login-container card fade-in">
      <h2 className="component-title">
        <span role="img" aria-label="login">🔐</span> 카페 로그인
      </h2>
      
      <div className="login-options">
        <p className="login-description">
          카카오톡 계정으로 간편하게 로그인하고 서비스를 이용해보세요.
        </p>
        
        <button 
          onClick={handleKakaoLogin} 
          className="kakao-login-btn"
        >
          <img 
            src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png" 
            alt="카카오 로그인"
            className="kakao-icon"
          />
          카카오로 시작하기
        </button>
      </div>
    </div>
  );
};

export default Login;
