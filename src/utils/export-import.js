import { exportDatabase, importDatabase } from './database';

// GitHub Pages에서 사용할 수 있도록 데이터베이스 내보내기 컴포넌트
export const ExportImportDatabase = () => {
  const handleExport = async () => {
    const result = await exportDatabase();
    if (result.error) {
      alert(`내보내기 오류: ${result.error}`);
    } else {
      alert('데이터베이스가 성공적으로 내보내졌습니다. 내보낸 파일을 저장하세요.');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const result = await importDatabase(file);
    if (result.error) {
      alert(`가져오기 오류: ${result.error}`);
    } else {
      alert('데이터베이스가 성공적으로 가져왔습니다. 페이지를 새로고침해 주세요.');
      window.location.reload();
    }
  };

  return (
    <div className="export-import-container">
      <div className="export-section">
        <button className="export-btn" onClick={handleExport}>
          데이터베이스 내보내기
        </button>
        <p className="help-text">
          현재 데이터베이스 상태를 파일로 저장합니다. 다른 기기에서도 같은 설정과 데이터를 유지하려면 이 파일을 사용하세요.
        </p>
      </div>
      
      <div className="import-section">
        <label className="import-label">
          <span>데이터베이스 가져오기</span>
          <input 
            type="file" 
            accept=".sqlite"
            onChange={handleImport}
            className="import-input"
          />
        </label>
        <p className="help-text">
          주의: 가져오기를 하면 현재 데이터베이스가 덮어씌워집니다.
        </p>
      </div>
    </div>
  );
};
