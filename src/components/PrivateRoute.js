import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isLoggedIn, loading } = useContext(AuthContext);
  
  console.log('PrivateRoute - 로그인 상태:', isLoggedIn, '로딩 상태:', loading);
  
  // 로딩 중에는 아무것도 렌더링하지 않음
  if (loading) {
    console.log('PrivateRoute - 로딩 중...');
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>잠시만 기다려주세요...</p>
      </div>
    );
  }
  
  // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
  if (!isLoggedIn) {
    console.log('PrivateRoute - 로그인되지 않음, 로그인 페이지로 리디렉션');
    return <Navigate to="/login" replace />;
  }
  
  // 로그인된 경우 자식 컴포넌트 렌더링
  console.log('PrivateRoute - 로그인됨, 자식 컴포넌트 렌더링');
  return children;
};

export default PrivateRoute;
