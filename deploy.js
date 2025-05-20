const ghpages = require('gh-pages');

// gh-pages 캐시 비우기
ghpages.clean();

console.log('이전 gh-pages 캐시를 정리했습니다.');
console.log('배포를 시작합니다...');

// 배포 옵션 설정
const options = {
  branch: 'gh-pages',
  message: 'Auto-deploy: [skip ci]',
  force: true,
  add: true, // 기존 파일을 덮어쓰지 않고 새 파일 추가 (중요: 기존 콘텐츠 유지)
  repo: 'git@github.com:namyeoungchan/cafe-contents.git', // SSH URL 사용
  silent: false,
  git: 'git',
  user: {
    name: 'namyeoungchan',
    email: 'skadudcks321@gmail.com'
  }
};

// 빌드 폴더 배포
ghpages.publish('build', options, function(err) {
  if (err) {
    console.error('배포 중 오류가 발생했습니다:', err);
    process.exit(1);
  } else {
    console.log('배포가 성공적으로 완료되었습니다!');
    console.log('GitHub Pages에 변경사항이 적용되는데 몇 분 정도 소요될 수 있습니다.');
  }
});
