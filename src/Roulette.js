import React, { useState, useEffect, useRef } from 'react';
import './Roulette.css';
import { 
  getActivePrizes, 
  getTodayWinnersCount, 
  getAdminSettings,
  addWinner,
  checkParticipation,
  isDatabaseReady
} from './utils/simpleDatabase'; // 수정됨: simpleDatabase 사용

// 기본 경품 (데이터베이스 초기화 전 또는 오류 시 사용)
const defaultPrizes = [
  { id: 1, name: '아메리카노 무료 쿠폰', probability: 0.2, is_active: 1 },
  { id: 2, name: '케이크 50% 할인', probability: 0.1, is_active: 1 },
  { id: 3, name: '음료 사이즈업', probability: 0.3, is_active: 1 },
  { id: 4, name: '다음 기회에', probability: 0.4, is_active: 1 }
];

const Roulette = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [prizes, setPrizes] = useState(defaultPrizes);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [canPlay, setCanPlay] = useState(true);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dbReady, setDbReady] = useState(false);
  const rouletteRef = useRef(null);
  const spinDegrees = useRef(0);

  // 초기 데이터 로드
  useEffect(() => {
    loadData();

    // 1초마다 데이터베이스 상태 확인 (최대 5번)
    let attempts = 0;
    const checkInterval = setInterval(() => {
      if (isDatabaseReady() || attempts >= 5) {
        clearInterval(checkInterval);
        setDbReady(isDatabaseReady());
        loadData();
      }
      attempts++;
    }, 1000);

    return () => clearInterval(checkInterval);
  }, []);

  const loadData = () => {
    try {
      // 활성화된 경품 가져오기
      const activePrizes = getActivePrizes();
      if (Array.isArray(activePrizes) && activePrizes.length > 0) {
        setPrizes(activePrizes);
      }

      // 오늘 당첨자 수 확인
      const winnersCount = getTodayWinnersCount();
      
      // 관리자 설정 가져오기
      const settings = getAdminSettings();
      
      // 당첨자 수가 최대치에 도달했는지 확인
      const maxWinners = settings && typeof settings.maxWinnersPerDay === 'number' 
        ? settings.maxWinnersPerDay 
        : 3;
        
      if (winnersCount >= maxWinners) {
        setCanPlay(false);
        setErrorMessage('오늘의 모든 당첨 기회가 소진되었습니다. 내일 다시 도전해주세요!');
      }
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      // 오류 발생 시 기본 데이터 사용
      setPrizes(defaultPrizes);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // 입력값 검증
    if (!phoneNumber || !orderNumber || !adminCode) {
      alert('모든 정보를 입력해주세요.');
      return;
    }

    if (phoneNumber.length < 10) {
      alert('유효한 전화번호를 입력해주세요.');
      return;
    }

    // 관리자 코드 검증 (기본값 1234)
    if (adminCode !== '1234') {
      alert('관리자 코드가 일치하지 않습니다.');
      return;
    }

    // 이미 참여했는지 확인
    if (checkParticipation(phoneNumber, orderNumber)) {
      alert('이미 오늘 참여하셨습니다.');
      return;
    }

    // 참여 가능 여부 확인
    if (!canPlay) {
      alert('오늘의 모든 당첨 기회가 소진되었습니다.');
      return;
    }

    setFormSubmitted(true);
    alert('룰렛을 돌려주세요!');
  };

  const spinRoulette = () => {
    if (!formSubmitted || spinning || !canPlay) return;

    setSpinning(true);
    setResult(null);

    // 가중치에 따른 랜덤 선택
    const activePrizes = prizes.filter(prize => prize.is_active === 1);
    const totalProbability = activePrizes.reduce((sum, prize) => sum + parseFloat(prize.probability), 0);
    
    let random = Math.random() * totalProbability;
    let cumulativeProbability = 0;
    let selectedPrize = null;

    for (const prize of activePrizes) {
      cumulativeProbability += parseFloat(prize.probability);
      if (random <= cumulativeProbability) {
        selectedPrize = prize;
        break;
      }
    }

    if (!selectedPrize) {
      selectedPrize = activePrizes[activePrizes.length - 1];
    }

    // 룰렛 회전 각도 계산 (선택된 아이템에 맞게)
    const segmentAngle = 360 / prizes.length;
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2);
    
    // 추가 회전 (최소 5바퀴)
    spinDegrees.current = 1800 + targetAngle;
    
    // 룰렛 회전 애니메이션 적용
    if (rouletteRef.current) {
      rouletteRef.current.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.12, 0.99)';
      rouletteRef.current.style.transform = `rotate(${spinDegrees.current}deg)`;
    }

    // 회전 완료 후 결과 표시
    setTimeout(() => {
      setSpinning(false);
      setResult(selectedPrize);
      
      // 당첨자 정보 저장
      addWinner(phoneNumber, orderNumber, selectedPrize.id, selectedPrize.name);
      
      // 폼 초기화
      setPhoneNumber('');
      setOrderNumber('');
      setAdminCode('');
      setFormSubmitted(false);
      
      // 데이터 다시 로드 (당첨자 수 갱신)
      loadData();
    }, 5000);
  };

  const resetForm = () => {
    setPhoneNumber('');
    setOrderNumber('');
    setAdminCode('');
    setFormSubmitted(false);
    setResult(null);
  };

  return (
    <div className="roulette-container card fade-in">
      <h2 className="component-title">
        <span role="img" aria-label="roulette">🎯</span> 행운의 룰렛
      </h2>
      
      {!canPlay && (
        <div className="error-message">
          {errorMessage}
        </div>
      )}
      
      {!formSubmitted ? (
        <form onSubmit={handleSubmit} className="roulette-form">
          <div className="form-group">
            <label htmlFor="phoneNumber">전화번호</label>
            <input
              type="tel"
              id="phoneNumber"
              className="input"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="전화번호를 입력하세요"
              required
              disabled={!canPlay}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="orderNumber">주문번호</label>
            <input
              type="text"
              id="orderNumber"
              className="input"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="주문번호를 입력하세요"
              required
              disabled={!canPlay}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="adminCode">관리자 코드</label>
            <input
              type="password"
              id="adminCode"
              className="input"
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="관리자 코드를 입력하세요"
              required
              disabled={!canPlay}
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={!canPlay}
          >
            참여하기
          </button>
        </form>
      ) : (
        <div className="roulette-game">
          <div className="roulette-wheel-container">
            <div className="roulette-pointer"></div>
            <div 
              className="roulette-wheel" 
              ref={rouletteRef}
              onClick={!spinning ? spinRoulette : undefined}
            >
              {prizes.map((prize, index) => {
                const angle = (index * 360) / prizes.length;
                return (
                  <div
                    key={prize.id}
                    className="roulette-segment"
                    style={{
                      transform: `rotate(${angle}deg) skewY(${90 - 360 / prizes.length}deg)`,
                      backgroundColor: index % 2 === 0 ? '#d4a574' : '#6b4226',
                    }}
                  >
                    <span
                      className="segment-text"
                      style={{
                        transform: `skewY(${-90 + 360 / prizes.length}deg) rotate(${180 / prizes.length}deg)`,
                        color: index % 2 === 0 ? '#333' : '#fff',
                      }}
                    >
                      {prize.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {!spinning && !result && (
            <div className="spin-instruction">
              <p>클릭하여 룰렛을 돌려주세요!</p>
              <button className="btn btn-primary" onClick={spinRoulette}>
                룰렛 돌리기
              </button>
            </div>
          )}
          
          {spinning && (
            <div className="spinning-message">
              <p>룰렛이 돌아가는 중...</p>
            </div>
          )}
          
          {result && (
            <div className="result-message">
              <h3 className="result-title">결과</h3>
              <p className="result-content">
                {result.name === '다음 기회에' ? (
                  <span>아쉽게도 당첨되지 않았습니다. 다음에 다시 도전해보세요!</span>
                ) : (
                  <span>축하합니다! <strong>{result.name}</strong>에 당첨되셨습니다!</span>
                )}
              </p>
              <button className="btn btn-secondary" onClick={resetForm}>
                다시 참여하기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Roulette;
