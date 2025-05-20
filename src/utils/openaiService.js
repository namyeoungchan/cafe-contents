// OpenAI API 관련 서비스 함수
// 실제 프로덕션 환경에서는 API 키를 클라이언트에 노출하지 않는 것이 좋습니다.
// 서버 측에서 API 요청을 처리하는 것이 안전합니다.

// API 호출 함수
export const getZodiacFortune = async (zodiacSign) => {
  try {
    // 실제 OpenAI API 키는 환경변수나 서버에서 관리하는 것이 좋습니다
    const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!OPENAI_API_KEY) {
      console.error('OpenAI API 키가 설정되지 않았습니다. 환경변수를 확인하세요.');
      return {
        error: '설정 오류',
        message: 'OpenAI API 키가 설정되지 않았습니다.'
      };
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: '당신은 친절한 커피 전문가이자 운세 상담가입니다. 띠 별 오늘의 운세와 함께 어울리는 커피를 추천해주세요.'
          },
          {
            role: 'user',
            content: `${zodiacSign}띠인 사람의 오늘 운세와 어울리는 커피를 알려주세요. 운세는 긍정적이고 구체적으로, 커피 추천은 이유와 함께 설명해주세요. 200자 이내로 간결하게 알려주세요.`
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message || '알 수 없는 오류가 발생했습니다.');
    }
    
    return {
      fortune: data.choices[0].message.content.trim()
    };
  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    return {
      error: '서비스 오류',
      message: error.message || '운세를 가져오는 중 오류가 발생했습니다.'
    };
  }
};

// 생년월일로 띠 계산하기
export const getZodiacSign = (birthYear) => {
  const zodiacSigns = [
    '원숭이', '닭', '개', '돼지', '쥐', '소', '호랑이', '토끼', '용', '뱀', '말', '양'
  ];
  
  // 1900년 기준으로 계산 (1900년은 쥐띠)
  const index = (birthYear - 1900) % 12;
  return zodiacSigns[index >= 0 ? index : index + 12]; // 음수 인덱스 처리
};

// 로컬 스토리지에 캐싱된 결과 저장하기
export const cacheZodiacFortune = (zodiacSign, fortune) => {
  try {
    const now = new Date();
    const cacheData = {
      fortune,
      timestamp: now.getTime(),
      date: now.toISOString().split('T')[0]
    };
    
    localStorage.setItem(`zodiac_fortune_${zodiacSign}`, JSON.stringify(cacheData));
    return true;
  } catch (error) {
    console.error('운세 캐싱 중 오류 발생:', error);
    return false;
  }
};

// 캐싱된 운세 확인하기 (하루에 한 번만 API 호출하도록)
export const getCachedZodiacFortune = (zodiacSign) => {
  try {
    const cached = localStorage.getItem(`zodiac_fortune_${zodiacSign}`);
    
    if (!cached) return null;
    
    const parsedCache = JSON.parse(cached);
    const today = new Date().toISOString().split('T')[0];
    
    // 오늘 날짜의 데이터인지 확인
    if (parsedCache.date === today) {
      return parsedCache.fortune;
    }
    
    return null;
  } catch (error) {
    console.error('캐시된 운세 확인 중 오류 발생:', error);
    return null;
  }
};
