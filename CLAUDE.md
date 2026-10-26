# CLAUDE.md - Todo App

## 프로젝트 개요
혼자 쓰는 간단한 할 일 목록 웹 앱 (초보자 학습용)

## MVP 범위
- 할 일 추가 (제목 필수, 앞뒤 공백 제거 후 보이는 글자 1~100자, 가운데 공백 유지, 같은 제목 허용)
- 할 일 목록 보기 (최신순, created_at 기준)
- 완료/미완료 전환 (체크박스)
- 할 일 삭제
- 새로고침해도 데이터 유지
- 지금은 빼는 것: 로그인, 공유, 알림, 마감일, 카테고리

## 기술 스택
- Next.js 15 (App Router), React 19, TypeScript (strict)
- Tailwind CSS
- DB: MySQL 8 + Drizzle ORM (드라이버 mysql2), 문자셋 utf8mb4
- 검증: Zod
- 테스트: Jest + React Testing Library
- package-lock.json 은 커밋해서 의존성 버전을 고정

## 버전 로드맵
- v0.1 화면만, 데이터는 localStorage
- v0.2 API 라우트 연결 (서버 메모리, 재시작하면 데이터 사라짐)
- v0.3 DB 저장 (API는 그대로)
- v1.0 배포

## API (v0.2부터)
- GET    /api/todos      : 목록 (최신순)
- POST   /api/todos      : 추가
- PATCH  /api/todos/:id  : 완료 전환
- DELETE /api/todos/:id  : 삭제
- 테이블: todos(id, title, done, created_at)

## 주요 결정 (자세한 건 docs/TRD.md 12장)
- id는 UUID (`crypto.randomUUID()`), 서버가 만든다. v0.1은 화면이 만든다
- 완료 필드 이름은 `done`
- 날짜는 UTC로 저장 (mysql2 `timezone: "Z"`), API에는 ISO 문자열로
- 실패 응답은 `{ "error": { "code": "TITLE_TOO_LONG", "message": "한국어 문구" } }`, 코드 목록은 docs/API_SPEC.md 8장
- 요청에 정해진 것 말고 다른 필드가 오면 400, 없는 id·UUID 아닌 id는 404
- v0.1의 localStorage 데이터는 v0.2로 옮기지 않는다

## 폴더 구조
- app/             : 페이지와 API 라우트
- src/components/  : 화면 컴포넌트
- src/lib/         : 서버 로직, DB
- src/types/       : 공유 타입
- docs/            : 명세 문서

## 반드시 참고할 문서
- docs/IDEA.md, docs/PRD.md, docs/TRD.md
- docs/DATA_MODEL.md, docs/API_SPEC.md
- docs/COMPONENT_SPEC.md
- docs/TEST_CASES.md

## 규칙
- 명세에 없는 기능을 임의로 추가하지 말 것
- any 타입 금지
- 제목 검증은 서버에서 반드시 하고(Zod), 화면은 안내만 할 것
- 한 번에 한 기능만 작업하고, 끝나면 무엇을 바꿨는지 요약할 것
- 기능은 docs/TEST_CASES.md의 정상·에러 케이스가 모두 통과해야 완료. 정상만 통과하면 미완료
- 테스트를 삭제하거나 skip하지 말 것
- 테스트가 실패하면 테스트가 아닌 구현을 고칠 것
- console.log는 디버깅 후 제거할 것
- 초보자가 이해할 수 있게 주석은 한국어로 짧게

## 아직 정하지 않은 것
- 개발용 MySQL 실행 위치 (v0.3 전에): 내 PC 설치 / Docker / 클라우드
- 배포 위치 (v1.0 전에)
- 접근 제한 (v1.0 전에): 로그인 없이 배포하면 누구나 데이터를 보고 바꿀 수 있음

## 자주 쓰는 명령 (package.json 생성 후)
- 개발 서버: npm run dev
- 테스트: npm test
