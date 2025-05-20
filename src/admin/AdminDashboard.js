import React, { useState, useEffect, useCallback} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminSettings,
  updateAdminSettings,
  getAllPrizes,
  addPrize,
  updatePrize,
  deletePrize,
  getAllWinners,
  getTotalWinnersCount,
  initDatabase,
  getFilteredWinners,
  updateWinnerUsage,
  getData,
  resetDatabase
} from '../utils/simpleDatabase'; // resetDatabase 함수 추가
import './AdminDashboard.css';
import { toast } from 'react-toastify';
import ExportImportSection from './ExportImportSection';
import StatsDashboard from './StatsDashboard';
import FeedbackManager from './FeedbackManager';

const AdminDashboard = () => {
  // 네비게이션 및 인증 상태
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('settings');

  // 관리자 설정 상태
  const [maxWinnersPerDay, setMaxWinnersPerDay] = useState(3);
  const [adminUsername, setAdminUsername] = useState('admin');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminPasswordConfirm, setAdminPasswordConfirm] = useState('');
  const [rouletteAdminCode, setRouletteAdminCode] = useState('1234');

  // 경품 관리 상태
  const [prizes, setPrizes] = useState([]);
  const [newPrizeName, setNewPrizeName] = useState('');
  const [newPrizeProbability, setNewPrizeProbability] = useState(0.1);
  const [editingPrize, setEditingPrize] = useState(null);

  // 당첨자 관리 상태
  const [winners, setWinners] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const winnersPerPage = 10;
  const [isLoading, setIsLoading] = useState(true);
  const [totalWinners, setTotalWinners] = useState(0);
  
  // 필터링 상태
  const [filters, setFilters] = useState({
    prizeId: '',
    prizeName: '',
    isUsed: '',
    startDate: '',
    endDate: '',
    phoneNumber: ''
  });
  
  // 필터 변경 핸들러
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // 사용 여부 필터 핸들러
  const handleUsageFilterChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({
      ...prev,
      isUsed: value === '' ? '' : parseInt(value)
    }));
  };
  
  // 필터 적용 핸들러
  const applyFilters = () => {
    setCurrentPage(1); // 필터 적용 시 첫 페이지로 이동
    loadFilteredWinners();
  };
  
  // 필터 초기화 핸들러
  const resetFilters = () => {
    setFilters({
      prizeId: '',
      prizeName: '',
      isUsed: '',
      startDate: '',
      endDate: '',
      phoneNumber: ''
    });
    setCurrentPage(1);
    // 필터 초기화 후 데이터 다시 로드
    setTimeout(() => {
      loadFilteredWinners();
    }, 0);
  };
  const loadData = useCallback(() => {
    const settings = getAdminSettings();
    if (!settings.error) {
      setMaxWinnersPerDay(settings.maxWinnersPerDay);
      setAdminUsername(settings.username);
      setRouletteAdminCode(settings.rouletteAdminCode || '1234'); // 룰렛 관리자 코드 설정
    } else {
      toast.error('관리자 설정을 불러오는데 실패했습니다.');
    }

    loadPrizes();
  }, []); // 의존성 배열 비워두기

  // 필터링된 당첨자 데이터 로드
  const loadFilteredWinners = useCallback(() => {
    try {
      const offset = (currentPage - 1) * winnersPerPage;
      
      // 데이터베이스 상태 확인
      const dbData = getData ? getData() : { winners: [] };
      console.log('현재 데이터베이스 상태:', dbData);
      
      const result = getFilteredWinners(filters, winnersPerPage, offset);
      console.log('필터링된 당첨자 결과:', result);
      
      if (result && result.winners) {
        setWinners(result.winners);
        setTotalWinners(result.totalCount);
        setTotalPages(Math.ceil(result.totalCount / winnersPerPage));
      } else {
        toast.error('당첨자 목록을 불러오는데 실패했습니다.');
      }
    } catch (error) {
      console.error('당첨자 목록 로드 오류:', error);
      toast.error('당첨자 데이터 로드 중 오류가 발생했습니다.');
    }
  }, [currentPage, filters, winnersPerPage]); // 의존성 추가
  
  // 호환성을 위해 기존 loadWinners 함수 유지
  const loadWinners = useCallback(() => {
    loadFilteredWinners();
  }, [loadFilteredWinners]);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    if (!isLoggedIn) {
      navigate('/admin');
      return;
    }

    const checkDatabase = async () => {
      setIsLoading(true);
      try {
        await initDatabase();
        loadData();
        // 당첨자 관리 탭이 활성화되어 있으면 바로 당첨자 목록 로드
        if (activeTab === 'winners') {
          loadWinners();
        }
      } catch (error) {
        console.error('데이터베이스 초기화 오류:', error);
        toast.error('다시 로그인해주세요.');
        sessionStorage.removeItem('admin_logged_in');
        navigate('/admin');
      } finally {
        setIsLoading(false);
      }
    };

    checkDatabase();
  }, [navigate, loadData, activeTab, loadWinners]);

  useEffect(() => {
    if (activeTab === 'winners') {
      loadPrizes(); // 당첨자 관리 탭에서도 경품 목록 로드
      loadWinners();
    } else if (activeTab === 'prizes') {
      loadPrizes();
    }
  }, [activeTab, currentPage, loadWinners]);

  // 경품 목록 로드
  const loadPrizes = useCallback(() => {
    const allPrizes = getAllPrizes();
    if (!allPrizes.error) {
      setPrizes(allPrizes);
    } else {
      toast.error('경품 목록을 불러오는데 실패했습니다.');
    }
  }, []);

  // 관리자 설정 저장
  const handleSaveSettings = () => {
    if (adminPassword && adminPassword !== adminPasswordConfirm) {
      toast.error('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호가 입력되지 않았다면 기존 비밀번호 유지
    const currentSettings = getAdminSettings();
    const passwordToSave = adminPassword || currentSettings.password;

    const result = updateAdminSettings(
      maxWinnersPerDay, 
      adminUsername, 
      passwordToSave,
      rouletteAdminCode
    );

    if (!result.error) {
      toast.success('설정이 저장되었습니다.');
      setAdminPassword('');
      setAdminPasswordConfirm('');
    } else {
      toast.error('설정 저장에 실패했습니다.');
    }
  };

  // 새 경품 추가
  const handleAddPrize = () => {
    if (!newPrizeName) {
      toast.error('경품 이름을 입력해주세요.');
      return;
    }

    if (newPrizeProbability <= 0 || newPrizeProbability > 1) {
      toast.error('확률은 0보다 크고 1 이하여야 합니다.');
      return;
    }

    const result = addPrize(newPrizeName, newPrizeProbability);

    if (!result.error) {
      toast.success('새 경품이 추가되었습니다.');
      setNewPrizeName('');
      setNewPrizeProbability(0.1);
      loadPrizes();
    } else {
      toast.error('경품 추가에 실패했습니다.');
    }
  };

  // 경품 편집 모드 시작
  const handleEditPrize = (prize) => {
    setEditingPrize({
      ...prize,
      newName: prize.name,
      newProbability: prize.probability
    });
  };

  // 경품 업데이트
  const handleUpdatePrize = () => {
    if (!editingPrize) return;

    if (!editingPrize.newName) {
      toast.error('경품 이름을 입력해주세요.');
      return;
    }

    if (editingPrize.newProbability <= 0 || editingPrize.newProbability > 1) {
      toast.error('확률은 0보다 크고 1 이하여야 합니다.');
      return;
    }

    const result = updatePrize(
        editingPrize.id,
        editingPrize.newName,
        editingPrize.newProbability,
        editingPrize.is_active
    );

    if (!result.error) {
      toast.success('경품이 업데이트되었습니다.');
      setEditingPrize(null);
      loadPrizes();
    } else {
      toast.error('경품 업데이트에 실패했습니다.');
    }
  };

  // 경품 활성화 상태 토글
  const handleTogglePrizeActive = (prize) => {
    const result = updatePrize(
        prize.id,
        prize.name,
        prize.probability,
        prize.is_active === 1 ? 0 : 1
    );

    if (!result.error) {
      toast.success(`경품이 ${prize.is_active === 1 ? '비활성화' : '활성화'}되었습니다.`);
      loadPrizes();
    } else {
      toast.error('경품 상태 변경에 실패했습니다.');
    }
  };

  // 경품 삭제
  const handleDeletePrize = (prizeId) => {
    if (window.confirm('정말로 이 경품을 삭제하시겠습니까?')) {
      const result = deletePrize(prizeId);

      if (!result.error) {
        toast.success('경품이 삭제되었습니다.');
        loadPrizes();
      } else {
        toast.error('경품 삭제에 실패했습니다.');
      }
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    navigate('/admin');
  };

  // 확률 합계 계산
  const calculateTotalProbability = () => {
    const activePrizes = prizes.filter(prize => prize.is_active === 1);
    return activePrizes.reduce((sum, prize) => sum + parseFloat(prize.probability), 0);
  };

  // 로딩 화면 표시
  if (isLoading) {
    return (
        <div className="admin-dashboard">
          <div className="admin-loading">
            <h2>데이터 로딩 중...</h2>
            <p>잠시만 기다려주세요.</p>
          </div>
        </div>
    );
  }

  return (
      <div className="admin-dashboard">
        <header className="admin-header">
          <h1>카페 룰렛 관리자</h1>
          <button className="admin-logout-btn" onClick={handleLogout}>로그아웃</button>
        </header>

        <div className="admin-content">
          <nav className="admin-nav">
            <button
                className={`admin-nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
            >
              기본 설정
            </button>
            <button
                className={`admin-nav-btn ${activeTab === 'prizes' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('prizes');
                  loadPrizes();
                }}
            >
              경품 관리
            </button>
            <button
                className={`admin-nav-btn ${activeTab === 'winners' ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab('winners');
                  // 필터 초기화
                  setFilters({
                    prizeId: '',
                    prizeName: '',
                    isUsed: '',
                    startDate: '',
                    endDate: '',
                    phoneNumber: ''
                  });
                  setCurrentPage(1);
                  
                  // 데이터 로드
                  setTimeout(() => {
                    loadPrizes();
                    loadWinners();
                  }, 0);
                }}
            >
              당첨자 관리
            </button>
            <button
                className={`admin-nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
                onClick={() => setActiveTab('stats')}
            >
              통계 대시보드
            </button>
            <button
                className={`admin-nav-btn ${activeTab === 'feedback' ? 'active' : ''}`}
                onClick={() => setActiveTab('feedback')}
            >
              사용자 피드백
            </button>
            <button
                className={`admin-nav-btn ${activeTab === 'data' ? 'active' : ''}`}
                onClick={() => setActiveTab('data')}
            >
              데이터 관리
            </button>
          </nav>

          <div className="admin-panel">
            {/* 기본 설정 탭 */}
            {activeTab === 'settings' && (
                <div className="admin-panel-content">
                  <h2 className="admin-panel-title">기본 설정</h2>

                  <div className="admin-settings-form">
                    <div className="admin-form-group">
                      <label>하루 최대 당첨자 수</label>
                      <input
                          type="number"
                          className="admin-input"
                          min="1"
                          max="100"
                          value={maxWinnersPerDay}
                          onChange={(e) => setMaxWinnersPerDay(parseInt(e.target.value))}
                      />
                      <p className="admin-input-help">하루에 나올 수 있는 최대 당첨자 수를 설정합니다.</p>
                    </div>

                    <div className="admin-form-group">
                      <label>관리자 아이디</label>
                      <input
                          type="text"
                          className="admin-input"
                          value={adminUsername}
                          onChange={(e) => setAdminUsername(e.target.value)}
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>관리자 비밀번호 변경 (변경하지 않으려면 비워두세요)</label>
                      <input
                          type="password"
                          className="admin-input"
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="새 비밀번호"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>비밀번호 확인</label>
                      <input
                          type="password"
                          className="admin-input"
                          value={adminPasswordConfirm}
                          onChange={(e) => setAdminPasswordConfirm(e.target.value)}
                          placeholder="새 비밀번호 확인"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>룰렛 관리자 코드</label>
                      <input
                          type="text"
                          className="admin-input"
                          value={rouletteAdminCode}
                          onChange={(e) => setRouletteAdminCode(e.target.value)}
                          placeholder="룰렛 사용 시 필요한 관리자 코드"
                      />
                      <p className="admin-input-help">룰렛 참여 시 필요한 관리자 코드를 설정합니다.</p>
                    </div>

                    <button
                        className="admin-save-btn"
                        onClick={handleSaveSettings}
                    >
                      설정 저장
                    </button>
                  </div>
                </div>
            )}

            {/* 경품 관리 탭 */}
            {activeTab === 'prizes' && (
                <div className="admin-panel-content">
                  <h2 className="admin-panel-title">경품 관리</h2>

                  <div className="admin-prizes-section">
                    <h3 className="admin-section-title">경품 목록</h3>

                    <div className="admin-probability-info">
                      <p>활성화된 경품 확률 합계: <strong>{calculateTotalProbability().toFixed(2)}</strong></p>
                      <p className={calculateTotalProbability() !== 1 ? 'admin-warning' : ''}>
                        {calculateTotalProbability() !== 1
                            ? '⚠️ 확률 합계가 1.0이 아닙니다. 확률 값을 조정하세요.'
                            : '✅ 확률 합계가 정확히 1.0입니다.'}
                      </p>
                    </div>

                    <div className="admin-prizes-list">
                      <div className="admin-prize-header">
                        <div className="admin-prize-name">경품 이름</div>
                        <div className="admin-prize-probability">확률</div>
                        <div className="admin-prize-status">상태</div>
                        <div className="admin-prize-actions">관리</div>
                      </div>

                      {prizes.length > 0 ? (
                          prizes.map(prize => (
                              <div
                                  key={prize.id}
                                  className={`admin-prize-item ${prize.is_active === 1 ? '' : 'inactive'}`}
                              >
                                {editingPrize && editingPrize.id === prize.id ? (
                                    // 편집 모드
                                    <>
                                      <div className="admin-prize-name">
                                        <input
                                            type="text"
                                            className="admin-input"
                                            value={editingPrize.newName}
                                            onChange={(e) => setEditingPrize({
                                              ...editingPrize,
                                              newName: e.target.value
                                            })}
                                        />
                                      </div>
                                      <div className="admin-prize-probability">
                                        <input
                                            type="number"
                                            className="admin-input"
                                            min="0"
                                            max="1"
                                            step="0.01"
                                            value={editingPrize.newProbability}
                                            onChange={(e) => setEditingPrize({
                                              ...editingPrize,
                                              newProbability: parseFloat(e.target.value)
                                            })}
                                        />
                                      </div>
                                      <div className="admin-prize-status">
                                        <label className="admin-switch">
                                          <input
                                              type="checkbox"
                                              checked={editingPrize.is_active === 1}
                                              onChange={(e) => setEditingPrize({
                                                ...editingPrize,
                                                is_active: e.target.checked ? 1 : 0
                                              })}
                                          />
                                          <span className="admin-slider"></span>
                                        </label>
                                      </div>
                                      <div className="admin-prize-actions">
                                        <button
                                            className="admin-action-btn save"
                                            onClick={handleUpdatePrize}
                                        >
                                          저장
                                        </button>
                                        <button
                                            className="admin-action-btn cancel"
                                            onClick={() => setEditingPrize(null)}
                                        >
                                          취소
                                        </button>
                                      </div>
                                    </>
                                ) : (
                                    // 보기 모드
                                    <>
                                      <div className="admin-prize-name">{prize.name}</div>
                                      <div className="admin-prize-probability">{prize.probability}</div>
                                      <div className="admin-prize-status">
                              <span className={`admin-status ${prize.is_active === 1 ? 'active' : 'inactive'}`}>
                                {prize.is_active === 1 ? '활성화' : '비활성화'}
                              </span>
                                        <button
                                            className="admin-toggle-btn"
                                            onClick={() => handleTogglePrizeActive(prize)}
                                        >
                                          {prize.is_active === 1 ? '비활성화' : '활성화'}
                                        </button>
                                      </div>
                                      <div className="admin-prize-actions">
                                        <button
                                            className="admin-action-btn edit"
                                            onClick={() => handleEditPrize(prize)}
                                        >
                                          편집
                                        </button>
                                        <button
                                            className="admin-action-btn delete"
                                            onClick={() => handleDeletePrize(prize.id)}
                                        >
                                          삭제
                                        </button>
                                      </div>
                                    </>
                                )}
                              </div>
                          ))
                      ) : (
                          <p className="admin-no-data">등록된 경품이 없습니다.</p>
                      )}
                    </div>
                  </div>

                  <div className="admin-new-prize-section">
                    <h3 className="admin-section-title">새 경품 추가</h3>

                    <div className="admin-new-prize-form">
                      <div className="admin-form-row">
                        <div className="admin-form-group">
                          <label>경품 이름</label>
                          <input
                              type="text"
                              className="admin-input"
                              value={newPrizeName}
                              onChange={(e) => setNewPrizeName(e.target.value)}
                              placeholder="경품 이름 입력"
                          />
                        </div>

                        <div className="admin-form-group">
                          <label>당첨 확률 (0~1)</label>
                          <input
                              type="number"
                              className="admin-input"
                              min="0"
                              max="1"
                              step="0.01"
                              value={newPrizeProbability}
                              onChange={(e) => setNewPrizeProbability(parseFloat(e.target.value))}
                          />
                          <p className="admin-input-help">0.3은 30% 확률을 의미합니다.</p>
                        </div>
                      </div>

                      <button
                          className="admin-add-btn"
                          onClick={handleAddPrize}
                      >
                        경품 추가
                      </button>
                    </div>
                  </div>
                </div>
            )}

            {/* 당첨자 관리 탭 */}
            {activeTab === 'winners' && (
                <div className="admin-panel-content">
                  <h2 className="admin-panel-title">당첨자 관리</h2>
                  
                  {/* 필터링 섹션 */}
                  <div className="admin-filter-section">
                    <h3 className="admin-section-title">검색 및 필터</h3>
                    <div className="admin-filter-form">
                      <div className="admin-filter-row">
                        <div className="admin-filter-group">
                          <label>전화번호 검색</label>
                          <input
                            type="text"
                            className="admin-input"
                            name="phoneNumber"
                            value={filters.phoneNumber}
                            onChange={handleFilterChange}
                            placeholder="전화번호 입력"
                          />
                        </div>
                        
                      <div className="admin-filter-group">
                          <label>경품 선택</label>
                          <select
                            className="admin-select"
                            name="prizeId"
                            value={filters.prizeId}
                            onChange={(e) => {
                              const selectedPrizeId = e.target.value;
                              
                              // 선택된 경품 ID에 따라 경품 이름 자동 설정
                              const selectedPrize = prizes.find(p => p.id.toString() === selectedPrizeId);
                              
                              setFilters(prev => ({
                                ...prev,
                                prizeId: selectedPrizeId,
                                prizeName: selectedPrize ? selectedPrize.name : ''
                              }));
                              
                              console.log('경품 필터 변경:', {
                                prizeId: selectedPrizeId,
                                prizeName: selectedPrize ? selectedPrize.name : '',
                                selectedPrize
                              });
                            }}
                          >
                            <option value="">모든 경품</option>
                            {prizes.map(prize => (
                              <option key={prize.id} value={prize.id}>
                                {prize.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div className="admin-filter-group">
                          <label>사용 여부</label>
                          <select
                            className="admin-select"
                            name="isUsed"
                            value={filters.isUsed}
                            onChange={handleUsageFilterChange}
                          >
                            <option value="">전체</option>
                            <option value="1">사용 완료</option>
                            <option value="0">미사용</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="admin-filter-row">
                        <div className="admin-filter-group">
                          <label>시작 날짜</label>
                          <input
                            type="date"
                            className="admin-input"
                            name="startDate"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        
                        <div className="admin-filter-group">
                          <label>종료 날짜</label>
                          <input
                            type="date"
                            className="admin-input"
                            name="endDate"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        
                        <div className="admin-filter-buttons">
                          <button
                            className="admin-filter-btn apply"
                            onClick={applyFilters}
                          >
                            필터 적용
                          </button>
                          <button
                            className="admin-filter-btn reset"
                            onClick={resetFilters}
                          >
                            필터 초기화
                          </button>
                          
                          {/* 개발자용 디버깅 버튼 */}
                          <button 
                            className="admin-filter-btn reset"
                            style={{ backgroundColor: '#f44336', color: 'white' }}
                            onClick={() => {
                              if (window.confirm('주의: 모든 데이터가 초기화됩니다. 계속하시겠습니까?')) {
                                resetDatabase();
                                toast.success('데이터베이스가 초기화되었습니다. 페이지를 새로고침해주세요.');
                                setTimeout(() => {
                                  window.location.reload();
                                }, 1500);
                              }
                            }}
                          >
                            DB 초기화
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="admin-winners-stats">
                    <p>총 {totalWinners}명의 당첨자 중 {winners.length}명이 표시됩니다.</p>
                  </div>

                  <div className="admin-winners-list">
                    <div className="admin-winner-header">
                      <div className="admin-winner-phone">전화번호</div>
                      <div className="admin-winner-order">주문번호</div>
                      <div className="admin-winner-prize">당첨 경품</div>
                      <div className="admin-winner-date">당첨 일시</div>
                      <div className="admin-winner-usage">사용 여부</div>
                      <div className="admin-winner-actions">관리</div>
                    </div>

                    {winners.length > 0 ? (
                        winners.map(winner => (
                            <div key={winner.id} className={`admin-winner-item ${winner.is_used === 1 ? 'used' : ''}`}>
                              <div className="admin-winner-phone">{winner.phone_number}</div>
                              <div className="admin-winner-order">{winner.order_number}</div>
                              <div className="admin-winner-prize">{winner.prize_name}</div>
                              <div className="admin-winner-date">
                                {new Date(winner.win_date).toLocaleString('ko-KR')}
                              </div>
                              <div className="admin-winner-usage">
                                <span className={`admin-usage-status ${winner.is_used === 1 ? 'used' : 'unused'}`}>
                                  {winner.is_used === 1 ? '사용 완료' : '미사용'}
                                </span>
                              </div>
                              <div className="admin-winner-actions">
                                <button
                                  className={`admin-action-btn ${winner.is_used === 1 ? 'mark-unused' : 'mark-used'}`}
                                  onClick={() => {
                                    const result = updateWinnerUsage(winner.id, winner.is_used === 0 ? 1 : 0);
                                    if (!result.error) {
                                      toast.success(`사용 상태가 변경되었습니다.`);
                                      loadWinners();
                                    } else {
                                      toast.error('상태 변경에 실패했습니다.');
                                    }
                                  }}
                                >
                                  {winner.is_used === 1 ? '미사용 처리' : '사용 처리'}
                                </button>
                              </div>
                            </div>
                        ))
                    ) : (
                        <p className="admin-no-data">당첨자 기록이 없습니다.</p>
                    )}
                  </div>

                  {/* 페이지네이션 */}
                  {totalPages > 1 && (
                      <div className="admin-pagination">
                        <button
                            className="admin-pagination-btn"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                        >
                          이전
                        </button>

                        <span className="admin-pagination-info">
                          {currentPage} / {totalPages} 페이지
                          (총 {totalWinners}명)
                        </span>

                        <button
                            className="admin-pagination-btn"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                        >
                          다음
                        </button>
                      </div>
                  )}
                </div>
            )}

            {/* 통계 대시보드 탭 */}
            {activeTab === 'stats' && <StatsDashboard />}

            {/* 사용자 피드백 탭 */}
            {activeTab === 'feedback' && <FeedbackManager />}

            {/* 데이터 관리 탭 */}
            {activeTab === 'data' && <ExportImportSection />}
          </div>
        </div>
      </div>
  );
};

export default AdminDashboard;