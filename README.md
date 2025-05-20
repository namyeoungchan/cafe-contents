# 카페 컨텐츠 앱 (Cafe Content App)

카페에서 손님들이 모바일로 즐길 수 있는 간단한 웹 컨텐츠입니다. 카페 방문객들이 휴대폰으로 즐길 수 있는 다양한 미니 게임과 컨텐츠를 제공합니다.

## 기능

- **오늘의 운세**: 커피와 함께 즐기는 랜덤 운세
- **끝말잇기 게임**: 친구들과 함께 즐기는 단어 게임
- **커피 퀴즈**: 커피에 관한 지식을 테스트하는 미니 퀴즈
- **분위기별 음악 추천**: 현재 기분에 맞는 음악 추천
- **룰렛 이벤트**: 고객 참여형 룰렛 이벤트 (전화번호, 주문번호, 관리자 코드 필요)

## 관리자 기능

- `/admin` 경로에서 관리자 로그인
- 룰렛 당첨 확률 및 경품 관리
- 하루 최대 당첨자 수 설정
- 당첨자 기록 관리
- 데이터 내보내기/가져오기 (GitHub Pages 배포용)

## 설치 및 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start

# 빌드
npm run build
```

## GitHub Pages 배포 방법

이 앱은 서버 없이 GitHub Pages에 배포할 수 있습니다. 배포 방법은 다음과 같습니다:

1. 이 저장소를 fork하거나 새 저장소를 만들어 코드를 업로드합니다.
2. `package.json` 파일에서 `homepage` 필드를 본인의 GitHub Pages URL로 수정합니다.
   ```json
   "homepage": "https://yourusername.github.io/cafe-content-app"
   ```
3. gh-pages 패키지 설치 (이미 package.json에 포함되어 있음)
   ```bash
   npm install --save-dev gh-pages
   ```
4. npm 명령어로 배포
   ```bash
   npm run deploy
   ```
5. GitHub 저장소 설정에서 GitHub Pages 소스를 `gh-pages` 브랜치로 설정합니다.

## 데이터 관리

GitHub Pages는 정적 호스팅 서비스로, 서버 데이터베이스를 사용할 수 없습니다. 이 앱은 다음과 같은 방식으로 데이터를 관리합니다:

- **브라우저 저장소**: localStorage와 IndexedDB를 활용하여 사용자 브라우저에 데이터 저장
- **데이터 내보내기/가져오기**: 관리자 패널에서 데이터를 파일로 내보내고 가져올 수 있음
- **초기 설정**: 앱 처음 실행 시 기본 설정이 자동으로 생성됨

### 주의사항

- 데이터는 사용자의 브라우저에 저장되므로, 다른 기기에서는 데이터가 공유되지 않습니다.
- 브라우저 데이터를 삭제하면 앱 데이터도 초기화됩니다.
- 중요한 데이터는 주기적으로 관리자 패널의 '데이터 내보내기' 기능을 통해 백업하세요.

## 기본 관리자 계정

- **아이디**: admin
- **비밀번호**: admin123
- **관리자 코드** (룰렛 참여용): 1234

## 기술 스택

- React (Create React App)
- React Router
- SQL.js (클라이언트 사이드 SQLite)
- LocalForage (IndexedDB 관리)
- React-Toastify (알림 메시지)
- CSS (반응형 디자인)

## 라이센스

MIT 라이센스로 배포됩니다.
# black-coffee
