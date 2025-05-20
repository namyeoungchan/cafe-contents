import React, { useState, useEffect } from 'react';
import './FortuneTeller.css';
import { getZodiacSign, getZodiacFortune, cacheZodiacFortune, getCachedZodiacFortune } from '../utils/openaiService';

const FortuneTeller = () => {
  const [fortune, setFortune] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [zodiacSign, setZodiacSign] = useState('');
  const [hasSubmittedBirthday, setHasSubmittedBirthday] = useState(false);
  const [fortuneMode, setFortuneMode] = useState('random'); // 'random' 또는 'zodiac'
  
  // 기존 랜덤 운세 목록
  const randomFortunes = [
    "오늘은 특별한 만남이 있을 것입니다. 카페에서 새로운 친구를 만나보세요.",
    "창의적인 아이디어가 떠오르는 날이에요. 노트북을 꺼내 기록해보세요.",
    "오래된 친구에게 연락이 올 것 같네요. 따뜻한 대화를 나눠보세요.",
    "작은 행운이 찾아올 거예요. 복권을 사보는 건 어떨까요?",
    "커피 한 잔으로 에너지를 충전하세요. 남은 하루가 활기차질 거예요.",
    "계획했던 일이 순조롭게 진행될 것입니다. 자신감을 가지세요.",
    "오늘은 휴식이 필요한 날이에요. 여유로운 시간을 가져보세요.",
    "좋은 소식이 찾아올 것 같아요. 기대해도 좋을 거예요.",
    "주변 사람들에게 감사함을 표현해보세요. 행복이 두 배가 될 거예요.",
    "새로운 도전을 시작하기 좋은 날입니다. 용기를 내보세요."
  ];

  // 띠 운세를 위한 기본 메시지 (API 오류 시 대체용)
  const fallbackZodiacFortunes = {
    '쥐': "오늘은 지혜로운 당신의 날! 상쾌한 아메리카노처럼 깔끔한 처리가 중요합니다.",
    '소': "묵묵히 나아가는 당신, 오늘은 라떼처럼 부드러움이 필요한 날입니다.",
    '호랑이': "강인한 리더십이 빛나는 날! 에스프레소처럼 강한 에너지로 주변을 이끌어보세요.",
    '토끼': "직감이 예민해지는 날입니다. 카페 모카처럼 달콤한 기회를 놓치지 마세요.",
    '용': "당신의 카리스마가 빛나는 날! 강렬한 더치커피로 특별한 인상을 남겨보세요.",
    '뱀': "지혜로운 통찰력이 필요한 날입니다. 깊고 진한 다크 로스트 커피가 어울려요.",
    '말': "자유로운 에너지가 넘치는 날! 캐러멜 마키아토처럼 달콤한 성취가 기다립니다.",
    '양': "창의력이 돋보이는 날입니다. 바닐라 라떼처럼 부드러운 아이디어가 떠오를 거예요.",
    '원숭이': "재치 있는 대응이 필요한 날! 다양한 맛이 조화로운 플랫 화이트처럼 균형을 유지하세요.",
    '닭': "세심한 관찰력이 빛나는 날입니다. 꼼꼼하게 추출한 핸드드립 커피가 어울려요.",
    '개': "충성심과 의리가 중요한 날! 변함없이 좋은 하우스 블렌드처럼 신뢰를 지키세요.",
    '돼지': "풍요와 행운이 따르는 날입니다. 풍미가 가득한 카푸치노처럼 즐거움이 가득할 거예요."
  };
  
  // 생년월일로 띠 계산
  const calculateZodiac = () => {
    if (!birthYear || birthYear.length !== 4 || isNaN(parseInt(birthYear))) {
      setErrorMessage('유효한 출생년도를 입력해주세요 (예: 1990)');
      return false;
    }
    
    // 월과 일은 선택적으로 검증
    if (birthMonth && (isNaN(parseInt(birthMonth)) || parseInt(birthMonth) < 1 || parseInt(birthMonth) > 12)) {
      setErrorMessage('유효한 월을 입력해주세요 (1-12)');
      return false;
    }
    
    if (birthDay && (isNaN(parseInt(birthDay)) || parseInt(birthDay) < 1 || parseInt(birthDay) > 31)) {
      setErrorMessage('유효한 일을 입력해주세요 (1-31)');
      return false;
    }
    
    const year = parseInt(birthYear);
    const sign = getZodiacSign(year);
    
    setZodiacSign(sign);
    setHasSubmittedBirthday(true);
    setErrorMessage('');
    return true;
  };
  
  // 랜덤 운세 보기
  const getRandomFortune = () => {
    setIsLoading(true);
    
    // 로딩 효과를 위한 딜레이
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * randomFortunes.length);
      setFortune(randomFortunes[randomIndex]);
      setIsLoading(false);
    }, 1500);
  };
  
  // 띠 운세 가져오기
  const getZodiacFortunePrediction = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // 캐시된 운세 확인
      const cachedFortune = getCachedZodiacFortune(zodiacSign);
      
      if (cachedFortune) {
        setFortune(cachedFortune);
        setIsLoading(false);
        return;
      }
      
      // OpenAI API 호출
      const response = await getZodiacFortune(zodiacSign);
      
      if (response.error) {
        throw new Error(response.message || '운세를 가져오는데 실패했습니다.');
      }
      
      // 운세 설정 및 캐싱
      setFortune(response.fortune);
      cacheZodiacFortune(zodiacSign, response.fortune);
    } catch (error) {
      console.error('운세 가져오기 오류:', error);
      
      // API 오류 시 대체 운세 사용
      if (fallbackZodiacFortunes[zodiacSign]) {
        setFortune(fallbackZodiacFortunes[zodiacSign]);
      } else {
        setErrorMessage('운세를 가져오는데 문제가 발생했습니다. 나중에 다시 시도해주세요.');
        setFortune('');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // 운세 보기 버튼 클릭 처리
  const handleFortuneTelling = () => {
    if (fortuneMode === 'random') {
      getRandomFortune();
    } else if (fortuneMode === 'zodiac') {
      if (!hasSubmittedBirthday) {
        if (calculateZodiac()) {
          // 유효한 생년월일 입력 시 다음 로직 실행
          getZodiacFortunePrediction();
        }
      } else {
        // 이미 생년월일을 제출한 경우
        getZodiacFortunePrediction();
      }
    }
  };
  
  // 모드 변경 시 상태 초기화
  useEffect(() => {
    setFortune('');
    setErrorMessage('');
    
    if (fortuneMode === 'random') {
      setHasSubmittedBirthday(false);
    }
  }, [fortuneMode]);
  
  return (
    <div className="fortune-teller card fade-in">
      <h2 className="component-title">
        <span role="img" aria-label="coffee">☕</span> 오늘의 커피 운세
      </h2>
      
      <div className="fortune-mode-selector">
        <button 
          className={`mode-button ${fortuneMode === 'random' ? 'active' : ''}`}
          onClick={() => setFortuneMode('random')}
        >
          일일 운세
        </button>
        <button 
          className={`mode-button ${fortuneMode === 'zodiac' ? 'active' : ''}`}
          onClick={() => setFortuneMode('zodiac')}
        >
          띠별 운세
        </button>
      </div>
      
      <p className="component-desc">
        {fortuneMode === 'random'
          ? '당신의 오늘 하루를 위한 특별한 운세를 알려드립니다. 아래 버튼을 눌러 확인해보세요.'
          : '생년월일을 입력하면 당신의 띠에 맞는 특별한 운세와 커피를 추천해드립니다.'}
      </p>
      
      {/* 생년월일 입력 폼 (띠별 운세 모드일 때만 표시) */}
      {fortuneMode === 'zodiac' && !hasSubmittedBirthday && (
        <div className="birthday-form">
          <div className="birthday-inputs">
            <div className="input-group">
              <label htmlFor="birthYear">년도</label>
              <input 
                type="text" 
                id="birthYear"
                className="input"
                value={birthYear} 
                onChange={(e) => setBirthYear(e.target.value)}
                placeholder="YYYY"
                maxLength="4"
              />
            </div>
            <div className="input-group">
              <label htmlFor="birthMonth">월</label>
              <input 
                type="text" 
                id="birthMonth"
                className="input"
                value={birthMonth} 
                onChange={(e) => setBirthMonth(e.target.value)}
                placeholder="MM"
                maxLength="2"
              />
            </div>
            <div className="input-group">
              <label htmlFor="birthDay">일</label>
              <input 
                type="text" 
                id="birthDay"
                className="input"
                value={birthDay} 
                onChange={(e) => setBirthDay(e.target.value)}
                placeholder="DD"
                maxLength="2"
              />
            </div>
          </div>
          
          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}
        </div>
      )}
      
      {/* 띠 정보 표시 (생년월일 제출 후) */}
      {fortuneMode === 'zodiac' && hasSubmittedBirthday && (
        <div className="zodiac-info">
          <p>
            <strong>{birthYear}년생</strong> - <span className="zodiac-sign">{zodiacSign}띠</span>
          </p>
          <button 
            className="change-birthday-btn"
            onClick={() => setHasSubmittedBirthday(false)}
          >
            생년월일 변경하기
          </button>
        </div>
      )}
      
      {/* 운세 결과 표시 */}
      {fortune && !isLoading && (
        <div className="fortune-result slide-up">
          <p>{fortune}</p>
        </div>
      )}
      
      {/* 로딩 표시 */}
      {isLoading && (
        <div className="fortune-loading">
          <div className="spinner"></div>
          <p>운세를 확인하는 중...</p>
        </div>
      )}
      
      {/* 버튼 영역 */}
      <button 
        className="fortune-button btn btn-primary" 
        onClick={handleFortuneTelling}
        disabled={isLoading}
      >
        {isLoading 
          ? '운세 읽는 중...' 
          : fortuneMode === 'random'
            ? '오늘의 운세 보기'
            : hasSubmittedBirthday
              ? '띠별 운세 보기'
              : '생년월일 확인하기'
        }
      </button>
    </div>
  );
};

export default FortuneTeller;
