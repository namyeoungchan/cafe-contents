const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 명령어 실행 함수
function runCommand(command, options = {}) {
  try {
    console.log(`실행: ${command}`);
    execSync(command, { stdio: 'inherit', ...options });
    return true;
  } catch (error) {
    console.error(`명령어 실행 중 오류 발생: ${command}`);
    console.error(error.message);
    return false;
  }
}

// 배포 프로세스
async function deploy() {
  // 빌드 폴더 경로
  const buildDir = path.join(process.cwd(), 'build');

  console.log('빌드 시작...');
  if (!runCommand('npm run build')) {
    return;
  }

  // .nojekyll 파일 생성
  console.log('.nojekyll 파일 생성...');
  fs.writeFileSync(path.join(buildDir, '.nojekyll'), '');

  console.log('빌드 디렉토리로 이동...');
  process.chdir(buildDir);

  console.log('Git 저장소 초기화...');
  if (!runCommand('git init')) return;

  console.log('Git 사용자 구성...');
  if (!runCommand('git config user.name "GitHub Actions"')) return;
  if (!runCommand('git config user.email "actions@github.com"')) return;

  console.log('모든 파일 Git에 추가...');
  if (!runCommand('git add .')) return;

  console.log('변경사항 커밋...');
  if (!runCommand('git commit -m "Deploy to GitHub Pages"')) return;

  console.log('원격 저장소 설정...');
  if (!runCommand('git remote add origin git@github.com:namyeoungchan/cafe-contents.git')) {
    // 이미 존재하는 경우 URL 변경
    if (!runCommand('git remote set-url origin git@github.com:namyeoungchan/cafe-contents.git')) return;
  }

  console.log('GitHub Pages 브랜치로 강제 푸시...');
  if (!runCommand('git push -f origin master:gh-pages')) return;

  console.log('원래 디렉토리로 돌아가기...');
  process.chdir('..');

  console.log('배포가 성공적으로 완료되었습니다!');
  console.log('GitHub Pages에 변경사항이 적용되는데 몇 분 정도 소요될 수 있습니다.');
}

// 배포 실행
deploy().catch(error => {
  console.error('배포 중 예상치 못한 오류가 발생했습니다:', error);
  process.exit(1);
});
