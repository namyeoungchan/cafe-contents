import React, { useState } from 'react';
import './WordGame.css';

const WordGame = () => {
  const [word, setWord] = useState('');
  const [lastChar, setLastChar] = useState('');
  const [userInput, setUserInput] = useState('');
  const [message, setMessage] = useState('');
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  
  const words = [
    "커피", "아메리카노", "라떼", "카페인", "원두",
    "모카", "카푸치노", "에스프레소", "디카페인", "바리스타",
    "케이크", "마카롱", "쿠키", "크로플", "빵",
    "티라미수", "청담동", "강남", "홍대", "연남동"
  ];
  
  const startGame = () => {
    const randomIndex = Math.floor(Math.random() * words.length);
    const selectedWord = words[randomIndex];
    setWord(selectedWord);
    setLastChar(selectedWord.charAt(selectedWord.length - 1));
    setGameStarted(true);
    setMessage(`'${selectedWord}'로 시작! 마지막 글자 '${selectedWord.charAt(selectedWord.length - 1)}'(으)로 시작하는 단어를 입력하세요.`);
  };
  
  const handleInputChange = (e) => {
    setUserInput(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!userInput) {
      setMessage("단어를 입력해주세요!");
      return;
    }
    
    if (userInput.charAt(0) !== lastChar) {
      setMessage(`'${lastChar}'(으)로 시작하는 단어를 입력해야 합니다!`);
      return;
    }
    
    // 성공 처리
    setScore(score + 1);
    setWord(userInput);
    setLastChar(userInput.charAt(userInput.length - 1));
    setMessage(`정답! '${userInput}'의 마지막 글자는 '${userInput.charAt(userInput.length - 1)}'입니다.`);
    setUserInput('');
  };
  
  const resetGame = () => {
    setWord('');
    setLastChar('');
    setUserInput('');
    setMessage('');
    setScore(0);
    setGameStarted(false);
  };
  
  return (
    <div className="word-game card fade-in">
      <h2 className="component-title">
        <span role="img" aria-label="game">🎮</span> 끝말잇기 게임
      </h2>
      <p className="component-desc">
        카페에서 친구들과 함께 즐길 수 있는 단어 이어가기 게임입니다.
        주어진 단어의 마지막 글자로 시작하는 새로운 단어를 입력하세요.
      </p>
      
      {!gameStarted ? (
        <div className="game-start">
          <button 
            className="btn btn-primary" 
            onClick={startGame}
          >
            게임 시작하기
          </button>
        </div>
      ) : (
        <div className="game-content">
          <div className="game-info">
            <div className="current-word">
              <span>현재 단어:</span> <strong>{word}</strong>
            </div>
            <div className="score">
              <span>점수:</span> <strong>{score}</strong>
            </div>
          </div>
          
          {message && (
            <div className={`game-message ${message.includes('정답') ? 'success' : 'warning'}`}>
              {message}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="game-form">
            <div className="input-group">
              <input
                type="text"
                className="input"
                value={userInput}
                onChange={handleInputChange}
                placeholder={`'${lastChar}'(으)로 시작하는 단어 입력...`}
                autoFocus
              />
              <button 
                type="submit" 
                className="btn btn-secondary"
              >
                제출
              </button>
            </div>
          </form>
          
          <div className="game-reset">
            <button 
              className="btn btn-outline" 
              onClick={resetGame}
            >
              게임 재설정
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordGame;
