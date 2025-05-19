import React from 'react';
import './Header.css';

const Header = ({ activeTab, onTabChange }) => {
  return (
    <header className="header">
      <div className="container">
        <h1 className="title">test</h1>
        <p className="subtitle"></p>
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
