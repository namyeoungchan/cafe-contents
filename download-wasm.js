// SQL.js의 WebAssembly 파일을 다운로드하는 스크립트
const https = require('https');
const fs = require('fs');
const path = require('path');

// 다운로드할 wasm 파일 URL
const wasmUrl = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.wasm';
const outputPath = path.join(__dirname, 'sql-wasm.wasm');

console.log(`Downloading sql-wasm.wasm from ${wasmUrl} to ${outputPath}...`);

// 파일 다운로드 함수
const download = (url, dest) => {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Download completed: ${dest}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // 오류 발생 시 파일 삭제
      console.error(`Download failed: ${err.message}`);
      reject(err);
    });
  });
};

// 다운로드 실행
download(wasmUrl, outputPath)
  .then(() => console.log('WASM file downloaded successfully!'))
  .catch(err => console.error('Error downloading WASM file:', err));
