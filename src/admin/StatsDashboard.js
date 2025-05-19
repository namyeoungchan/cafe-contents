import React, { useState, useEffect } from 'react';
import { 
  getAllWinners, 
  getAllPrizes, 
  getTotalWinnersCount 
} from '../utils/simpleDatabase';
import { toast } from 'react-toastify';
import './StatsDashboard.css';

const StatsDashboard = () => {
  const [prizeStats, setPrizeStats] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week', 'month', 'all'

  useEffect(() => {
    loadStats();
  }, [selectedPeriod]);

  const loadStats = () => {
    setIsLoading(true);
    try {
      // 모든 당첨자 데이터 로드
      const winners = getAllWinners(1000, 0); // 최대 1000개 로드
      const prizes = getAllPrizes();
      
      if (winners.length === 0) {
        setIsLoading(false);
        setPrizeStats([]);
        setDailyStats([]);
        return;
      }

      // 날짜 필터링 - 선택된 기간에 따라
      const filteredWinners = filterWinnersByPeriod(winners, selectedPeriod);
      
      // 경품별 통계 계산
      const prizeStatistics = calculatePrizeStats(filteredWinners, prizes);
      setPrizeStats(prizeStatistics);
      
      // 일별 통계 계산
      const dailyStatistics = calculateDailyStats(filteredWinners);
      setDailyStats(dailyStatistics);
      
    } catch (error) {
      console.error('통계 로드 오류:', error);
      toast.error('통계 데이터를 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 기간별 당첨자 필터링
  const filterWinnersByPeriod = (winners, period) => {
    const now = new Date();
    let cutoffDate;
    
    switch (period) {
      case 'week':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'all':
      default:
        return winners; // 전체 기간이면 필터링 없음
    }
    
    return winners.filter(winner => new Date(winner.win_date) >= cutoffDate);
  };

  // 경품별 통계 계산
  const calculatePrizeStats = (winners, allPrizes) => {
    // 경품별 당첨 횟수 계산
    const prizeCountMap = {};
    winners.forEach(winner => {
      prizeCountMap[winner.prize_id] = (prizeCountMap[winner.prize_id] || 0) + 1;
    });
    
    // 전체 경품 목록을 기준으로 통계 생성
    return allPrizes.map(prize => {
      const count = prizeCountMap[prize.id] || 0;
      const percentage = winners.length > 0 
        ? ((count / winners.length) * 100).toFixed(1) 
        : 0;
        
      return {
        id: prize.id,
        name: prize.name,
        count,
        percentage,
        isActive: prize.is_active === 1
      };
    });
  };

  // 일별 통계 계산
  const calculateDailyStats = (winners) => {
    const dailyMap = {};
    
    // 날짜별로 그룹화
    winners.forEach(winner => {
      const date = winner.win_date.split('T')[0]; // YYYY-MM-DD 형식
      if (!dailyMap[date]) {
        dailyMap[date] = {
          date,
          count: 0,
          prizes: {}
        };
      }
      
      dailyMap[date].count++;
      
      // 해당 날짜의 경품별 카운트
      if (!dailyMap[date].prizes[winner.prize_name]) {
        dailyMap[date].prizes[winner.prize_name] = 0;
      }
      dailyMap[date].prizes[winner.prize_name]++;
    });
    
    // 배열로 변환하고 날짜 기준 정렬
    return Object.values(dailyMap)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // 선택된 기간 변경 처리
  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  };

  if (isLoading) {
    return (
      <div className="admin-panel-content">
        <h2 className="admin-panel-title">통계 대시보드</h2>
        <div className="admin-loading">데이터 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="admin-panel-content">
      <h2 className="admin-panel-title">통계 대시보드</h2>
      
      <div className="stats-period-selector">
        <button 
          className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('week')}
        >
          최근 7일
        </button>
        <button 
          className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('month')}
        >
          최근 30일
        </button>
        <button 
          className={`period-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
          onClick={() => handlePeriodChange('all')}
        >
          전체 기간
        </button>
      </div>
      
      <div className="stats-container">
        <div className="stats-section prize-stats">
          <h3 className="section-title">경품별 당첨 현황</h3>
          
          {prizeStats.length > 0 ? (
            <div className="stats-table">
              <div className="stats-table-header">
                <div className="stats-cell">경품 이름</div>
                <div className="stats-cell">당첨 횟수</div>
                <div className="stats-cell">비율</div>
                <div className="stats-cell">현재 상태</div>
              </div>
              
              {prizeStats.map(stat => (
                <div key={stat.id} className="stats-table-row">
                  <div className="stats-cell">{stat.name}</div>
                  <div className="stats-cell">{stat.count}회</div>
                  <div className="stats-cell">{stat.percentage}%</div>
                  <div className="stats-cell">
                    <span className={`status-indicator ${stat.isActive ? 'active' : 'inactive'}`}>
                      {stat.isActive ? '활성화' : '비활성화'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-message">선택한 기간에 당첨 데이터가 없습니다.</p>
          )}
          
          <div className="stats-visualization">
            {prizeStats.length > 0 && (
              <div className="prize-distribution-chart">
                {prizeStats.map(stat => (
                  <div key={stat.id} className="chart-bar-container">
                    <div className="chart-label">{stat.name}</div>
                    <div className="chart-bar-wrapper">
                      <div 
                        className="chart-bar"
                        style={{ 
                          width: `${stat.percentage}%`,
                          backgroundColor: stat.isActive ? 'var(--primary-color)' : 'var(--light-gray)'
                        }}
                      ></div>
                      <span className="chart-value">{stat.count}회 ({stat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="stats-section daily-stats">
          <h3 className="section-title">일별 당첨 현황</h3>
          
          {dailyStats.length > 0 ? (
            <div className="stats-table">
              <div className="stats-table-header">
                <div className="stats-cell">날짜</div>
                <div className="stats-cell">총 당첨 수</div>
                <div className="stats-cell">경품 세부 현황</div>
              </div>
              
              {dailyStats.map(day => (
                <div key={day.date} className="stats-table-row">
                  <div className="stats-cell">{formatDate(day.date)}</div>
                  <div className="stats-cell">{day.count}회</div>
                  <div className="stats-cell prize-detail-cell">
                    {Object.entries(day.prizes).map(([prizeName, count]) => (
                      <div key={prizeName} className="prize-detail">
                        {prizeName}: {count}회
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data-message">선택한 기간에 당첨 데이터가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;