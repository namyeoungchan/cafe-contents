import React, { useState, useEffect } from 'react';
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

// 데이터베이스 초기화 (SQL.js 대신 localStorage 사용)
import { initDatabase } from './utils/simpleDatabase';

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

  // Protected 라우트 컴포넌트
  const ProtectedRoute = ({ children }) => {
    if (!isAdminAuthenticated()) {
      return <Navigate to="/admin" replace />;
    }
    
    return children;
  };

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        <Route
            path="/user"
            element={
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
            }
        />
        {/* 관리자 라우트 */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* 메인 앱 라우트 */}
      </Routes>
    </Router>
  );
}

export default App;
