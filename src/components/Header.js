import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Header.css';

const Header = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  return (
    <header className="header">
      <div className="container header-container">
        <div className="header-left">
          <h1 className="title">카페 즐길거리</h1>
          <p className="subtitle">당신의 카페 시간을 더 즐겁게</p>
        </div>
        
        {user && (
          <div className="user-menu">
            <div className="user-info">
              <span className="user-greeting">
                {user.email ? user.email : (user.nickname || '회원')}
              </span>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              로그아웃
            </button>
          </div>
        )}
      </div>
      
      <nav className="nav">
        <div className="container">
          <ul className="tabs">
            <li>
              <button 
                className={`tab-btn ${activeTab === 'fortune' ? 'active' : ''}`}
                onClick={() => onTabChange('fortune')}
              >
                오늘의 운세
              </button>
            </li>
            <li>
              <button 
                className={`tab-btn ${activeTab === 'wordgame' ? 'active' : ''}`}
                onClick={() => onTabChange('wordgame')}
              >
                단어 게임
              </button>
            </li>
            <li>
              <button 
                className={`tab-btn ${activeTab === 'quiz' ? 'active' : ''}`}
                onClick={() => onTabChange('quiz')}
              >
                피드백
              </button>
            </li>
            <li>
              <button 
                className={`tab-btn ${activeTab === 'mood' ? 'active' : ''}`}
                onClick={() => onTabChange('mood')}
              >
                음악 추천
              </button>
            </li>
            <li>
              <button 
                className={`tab-btn ${activeTab === 'roulette' ? 'active' : ''}`}
                onClick={() => onTabChange('roulette')}
              >
                룰렛 이벤트
              </button>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
