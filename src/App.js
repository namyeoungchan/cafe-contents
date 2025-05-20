import React, { useState, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// 컴포넌트 임포트
import Header from './components/Header';
import Footer from './components/Footer';
import FortuneTeller from './components/FortuneTeller';
import WordGame from './components/WordGame';
import CoffeeQuiz from './components/CoffeeQuiz';
import MoodMusic from './components/MoodMusic';
import Roulette from './Roulette';
import AdminLogin from './admin/AdminLogin';
import AdminDashboard from './admin/AdminDashboard';
import Login from './components/Login';
import KakaoCallback from './components/KakaoCallback';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { ModalProvider } from './context/ModalContext';
import PrivateRoute from './components/PrivateRoute';

// 데이터베이스 초기화 (SQL.js 대신 localStorage 사용)
import { initDatabase } from './utils/simpleDatabase';

// 로그인 상태에 따라 리디렉션하는 컴포넌트
const AuthRedirect = () => {
  const { isLoggedIn, loading } = useContext(AuthContext);
  
  // 로딩 중일 때는 로딩 화면 표시
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>잠시만 기다려주세요...</p>
      </div>
    );
  }
  
  // 로그인 상태에 따라 리디렉션
  return isLoggedIn ? <Navigate to="/user" replace /> : <Navigate to="/login" replace />;
};

function App() {
  const [activeTab, setActiveTab] = useState(localStorage.getItem('activeTab') || 'fortune');

  // 데이터베이스 초기화
  useEffect(() => {
    const initDb = async () => {
      try {
        const result = await initDatabase();
        if (result) {
          console.log('데이터베이스 초기화 성공');
        } else {
          console.warn('데이터베이스 초기화 실패');
          toast.warning('일부 기능이 제한될 수 있습니다', {
            position: "bottom-right",
            autoClose: 3000
          });
        }
      } catch (error) {
        console.error('데이터베이스 초기화 오류:', error);
        toast.error('일부 기능이 제한될 수 있습니다', {
          position: "bottom-right",
          autoClose: 3000
        });
      }
    };
    
    initDb();
  }, []);

  // 활성 탭 저장
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // 관리자 인증 확인
  const isAdminAuthenticated = () => {
    return sessionStorage.getItem('admin_logged_in') === 'true';
  };

  // 관리자용 Protected 라우트 컴포넌트
  const AdminProtectedRoute = ({ children }) => {
    if (!isAdminAuthenticated()) {
      return <Navigate to="/admin" replace />;
    }
    
    return children;
  };

  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            {/* 홈 화면 - 로그인 여부에 따라 적절한 페이지로 리디렉션 */}
            <Route path="/" element={
              <AuthRedirect />
            } />
            
            {/* 로그인 관련 라우트 */}
            <Route path="/login" element={<Login />} />
            <Route path="/oauth/callback/kakao" element={<KakaoCallback />} />
            
            {/* 사용자 콘텐츠 라우트 - 로그인 필요 */}
            <Route
              path="/user"
              element={
                <PrivateRoute>
                  <div className="app">
                    <Header activeTab={activeTab} onTabChange={handleTabChange} />
                    <main className="main">
                      <div className="container">
                        {activeTab === 'fortune' && <FortuneTeller />}
                        {activeTab === 'wordgame' && <WordGame />}
                        {activeTab === 'quiz' && <CoffeeQuiz />}
                        {activeTab === 'mood' && <MoodMusic />}
                        {activeTab === 'roulette' && <Roulette />}
                      </div>
                    </main>
                    <Footer />
                  </div>
                </PrivateRoute>
              }
            />
            
            {/* 관리자 라우트 */}
            <Route path="/admin" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </ModalProvider>
    </AuthProvider>
  );
}

export default App;
