import React from 'react';
import { exportDatabase, importDatabase } from '../utils/simpleDatabase'; // 수정됨: simpleDatabase 사용
import { toast } from 'react-toastify';
import './ExportImportSection.css';

const ExportImportSection = () => {
  const handleExport = async () => {
    const result = await exportDatabase();
    if (result.error) {
      toast.error(`내보내기 오류: ${result.error}`);
    } else {
      toast.success('데이터베이스가 성공적으로 내보내졌습니다.');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (window.confirm('현재 데이터베이스가 이 파일로 덮어씌워집니다. 계속하시겠습니까?')) {
      const result = await importDatabase(file);
      if (result.error) {
        toast.error(`가져오기 오류: ${result.error}`);
      } else {
        toast.success('데이터베이스가 성공적으로 가져왔습니다. 페이지를 새로고침해 주세요.');
        window.location.reload();
      }
    }
  };

  return (
    <div className="admin-panel-content">
      <h2 className="admin-panel-title">데이터 관리</h2>
      
      <div className="export-import-container">
        <div className="card-section">
          <h3 className="section-title">데이터 내보내기</h3>
          <p className="section-desc">
            현재 데이터베이스 상태(관리자 설정, 경품 목록, 당첨자 기록 등)를 파일로 저장합니다.
            GitHub Pages와 같은 정적 호스팅에서는 서버 데이터베이스를 사용할 수 없으므로,
            이 기능을 통해 데이터를 백업하고 여러 기기에서 동일한 데이터를 사용할 수 있습니다.
          </p>
          <button 
            className="admin-btn export-btn"
            onClick={handleExport}
          >
            데이터베이스 내보내기
          </button>
        </div>
        
        <div className="card-section">
          <h3 className="section-title">데이터 가져오기</h3>
          <p className="section-desc">
            이전에 내보낸 데이터베이스 파일을 가져옵니다. 
            <strong className="warning-text">주의: 가져오기를 하면 현재 데이터베이스가 덮어씌워집니다.</strong>
          </p>
          <label className="admin-btn import-btn">
            <span>데이터베이스 파일 선택</span>
            <input 
              type="file" 
              accept=".json"
              onChange={handleImport}
              className="hidden-input"
            />
          </label>
        </div>
        
        <div className="card-section">
          <h3 className="section-title">GitHub Pages 배포 정보</h3>
          <p className="section-desc">
            GitHub Pages로 배포 시 다음 사항에 주의하세요:
          </p>
          <ul className="info-list">
            <li>GitHub Pages는 정적 웹 호스팅으로, 서버 데이터베이스를 사용할 수 없습니다.</li>
            <li>대신 브라우저의 localStorage를 활용하여 데이터를 관리합니다.</li>
            <li>데이터는 방문자의 브라우저에 저장되므로, 다른 기기나 브라우저에서는 데이터가 공유되지 않습니다.</li>
            <li>기기를 변경하거나 브라우저 데이터를 삭제하면 데이터가 초기화됩니다.</li>
            <li>중요한 데이터는 주기적으로 '데이터 내보내기' 기능을 통해 백업하세요.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExportImportSection;
