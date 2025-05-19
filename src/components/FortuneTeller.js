import React, { useState } from 'react';
import './FortuneTeller.css';

const FortuneTeller = () => {
  const [fortune, setFortune] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const fortunes = [
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
  
  const tellFortune = () => {
    setIsLoading(true);
    
    // 랜덤 운세 선택 (로딩 효과를 위해 setTimeout 사용)
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * fortunes.length);
      setFortune(fortunes[randomIndex]);
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="fortune-teller card fade-in">
      <h2 className="component-title">
        <span role="img" aria-label="coffee">☕</span> 오늘의 커피 운세
      </h2>
      <p className="component-desc">
        당신의 오늘 하루를 위한 특별한 운세를 알려드립니다. 
        아래 버튼을 눌러 오늘의 운세를 확인해보세요.
      </p>
      
      {fortune && !isLoading && (
        <div className="fortune-result slide-up">
          <p>{fortune}</p>
        </div>
      )}
      
      {isLoading && (
        <div className="fortune-loading">
          <div className="spinner"></div>
          <p>운세를 확인하는 중...</p>
        </div>
      )}
      
      <button 
        className="fortune-button btn btn-primary" 
        onClick={tellFortune}
        disabled={isLoading}
      >
        {isLoading ? '운세 읽는 중...' : '운세 보기'}
      </button>
    </div>
  );
};

export default FortuneTeller;
