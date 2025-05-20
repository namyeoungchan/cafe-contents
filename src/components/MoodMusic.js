import React, { useState } from 'react';
import './MoodMusic.css';

const MoodMusic = () => {
  const [selectedMood, setSelectedMood] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  
  const moods = [
    { id: 'relaxed', name: '편안한', icon: '😌' },
    { id: 'energetic', name: '에너지 넘치는', icon: '⚡' },
    { id: 'romantic', name: '로맨틱한', icon: '💖' },
    { id: 'melancholy', name: '멜랑콜리한', icon: '😢' },
    { id: 'focused', name: '집중하는', icon: '🧠' },
    { id: 'happy', name: '행복한', icon: '😊' }
  ];
  
  const musicLibrary = {
    relaxed: [
      { title: 'Weightless', artist: 'Marconi Union', genre: '앰비언트' },
      { title: 'Claire de Lune', artist: 'Claude Debussy', genre: '클래식' },
      { title: 'Gymnopédie No.1', artist: 'Erik Satie', genre: '클래식' },
      { title: 'Pure Shores', artist: 'All Saints', genre: '팝' },
      { title: 'Strawberry Swing', artist: 'Coldplay', genre: '인디 록' }
    ],
    energetic: [
      { title: 'Uptown Funk', artist: 'Mark Ronson ft. Bruno Mars', genre: '펑크/팝' },
      { title: 'Can\'t Stop the Feeling', artist: 'Justin Timberlake', genre: '댄스 팝' },
      { title: 'Dynamite', artist: 'BTS', genre: '댄스 팝' },
      { title: 'Wake Me Up', artist: 'Avicii', genre: '일렉트로니카' },
      { title: 'Happy', artist: 'Pharrell Williams', genre: '팝' }
    ],
    romantic: [
      { title: 'At Last', artist: 'Etta James', genre: '재즈/블루스' },
      { title: 'Perfect', artist: 'Ed Sheeran', genre: '팝' },
      { title: 'La Vie En Rose', artist: 'Edith Piaf', genre: '샹송' },
      { title: 'My Love', artist: 'Sia', genre: '팝' },
      { title: 'Can\'t Help Falling in Love', artist: 'Elvis Presley', genre: '클래식 팝' }
    ],
    melancholy: [
      { title: 'Someone Like You', artist: 'Adele', genre: '팝' },
      { title: 'Fix You', artist: 'Coldplay', genre: '얼터너티브 록' },
      { title: 'Hurt', artist: 'Johnny Cash', genre: '컨트리' },
      { title: 'The Night We Met', artist: 'Lord Huron', genre: '인디 포크' },
      { title: 'Hallelujah', artist: 'Jeff Buckley', genre: '포크' }
    ],
    focused: [
      { title: '집중을 위한 알파파 음악', artist: 'Study Music Academy', genre: '집중 음악' },
      { title: 'Experience', artist: 'Ludovico Einaudi', genre: '현대 클래식' },
      { title: 'The Theory of Everything', artist: 'Johan Johansson', genre: '사운드트랙' },
      { title: 'Time', artist: 'Hans Zimmer', genre: '사운드트랙' },
      { title: 'A Thousand Years', artist: 'Max Richter', genre: '현대 클래식' }
    ],
    happy: [
      { title: 'Walking on Sunshine', artist: 'Katrina & The Waves', genre: '팝 록' },
      { title: 'Good as Hell', artist: 'Lizzo', genre: '팝' },
      { title: 'Shake It Off', artist: 'Taylor Swift', genre: '팝' },
      { title: 'I Got You (I Feel Good)', artist: 'James Brown', genre: '소울/펑크' },
      { title: 'Don\'t Stop Me Now', artist: 'Queen', genre: '록' }
    ]
  };
  
  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId);
    setRecommendations(musicLibrary[moodId]);
  };
  
  return (
    <div className="mood-music card fade-in">
      <h2 className="component-title">
        <span role="img" aria-label="music">🎵</span> 분위기별 음악 추천
      </h2>
      <p className="component-desc">
        지금 당신의 기분이나 분위기에 맞는 음악을 추천해드립니다.
        아래에서 원하는 분위기를 선택해보세요.
      </p>
      
      <div className="mood-selector">
        {moods.map((mood) => (
          <button
            key={mood.id}
            className={`mood-button ${selectedMood === mood.id ? 'active' : ''}`}
            onClick={() => handleMoodSelect(mood.id)}
          >
            <span className="mood-icon">{mood.icon}</span>
            <span className="mood-name">{mood.name}</span>
          </button>
        ))}
      </div>
      
      {recommendations.length > 0 && (
        <div className="music-recommendations fade-in">
          <h3 className="recommendation-title">
            <span>{moods.find(m => m.id === selectedMood).icon}</span> {moods.find(m => m.id === selectedMood).name} 분위기 음악 추천
          </h3>
          
          <div className="music-list">
            {recommendations.map((music, index) => (
              <div key={index} className="music-item">
                <div className="music-info">
                  <div className="music-title">{music.title}</div>
                  <div className="music-artist">{music.artist}</div>
                </div>
                <div className="music-genre">{music.genre}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodMusic;
