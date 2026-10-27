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
- 화면: Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS
- 화면 입력 안내: Zod
- 화면 테스트: Jest + React Testing Library
- 서버: Python 3.12 + FastAPI (실행: Uvicorn), 검증: Pydantic v2
- DB: PostgreSQL 16 + SQLAlchemy 2.0 (드라이버 psycopg 3), 인코딩 UTF8
- 서버 테스트: pytest + FastAPI TestClient
- 화면과 서버 연결: Next.js rewrites가 `/api/*`를 FastAPI(:8000)로 넘김
- package-lock.json, backend/requirements.txt 는 커밋해서 의존성 버전을 고정

## 버전 로드맵
- v0.1 화면만, 데이터는 localStorage
- v0.2 FastAPI 연결 (서버 메모리, 재시작하면 데이터 사라짐)
- v0.3 PostgreSQL 저장 (API는 그대로)
- v1.0 배포

## API (v0.2부터)
- GET    /api/todos      : 목록 (최신순)
- POST   /api/todos      : 추가
- PATCH  /api/todos/:id  : 완료 전환
- DELETE /api/todos/:id  : 삭제
- 테이블: todos(id, title, done, created_at)

## 주요 결정 (자세한 건 docs/TRD.md 12장)
- id는 UUID, 서버가 `uuid.uuid4()`로 만든다. v0.1은 화면이 `crypto.randomUUID()`로 만든다
- 완료 필드 이름은 `done`
- 날짜는 `TIMESTAMPTZ`로 저장 (세션 시간대 UTC), API에는 `Z`로 끝나는 ISO 문자열로 (밀리초 3자리)
- FastAPI 기본 실패 응답(422, `detail`)은 쓰지 않고 아래 모양으로 바꾼다 (TRD 7장)
- 실패 응답은 `{ "error": { "code": "TITLE_TOO_LONG", "message": "한국어 문구" } }`, 코드 목록은 docs/API_SPEC.md 8장
- 요청에 정해진 것 말고 다른 필드가 오면 400, 없는 id·UUID 아닌 id는 404
- v0.1의 localStorage 데이터는 v0.2로 옮기지 않는다

## 폴더 구조
- app/             : 페이지 (Next.js)
- src/components/  : 화면 컴포넌트
- src/lib/         : 화면 로직 (검증 안내, 에러 문구, API 호출)
- src/types/       : 화면 공유 타입
- backend/app/     : FastAPI 서버 (API, 검증, 저장, DB)
- backend/tests/   : 서버 테스트
- docs/            : 명세 문서

## 반드시 참고할 문서
- docs/IDEA.md, docs/PRD.md, docs/TRD.md
- docs/DATA_MODEL.md, docs/API_SPEC.md
- docs/COMPONENT_SPEC.md
- docs/TEST_CASES.md

## 규칙
- 명세에 없는 기능을 임의로 추가하지 말 것
- any 타입 금지 (파이썬도 타입 힌트를 달고 `Any` 금지)
- 제목 검증은 서버에서 반드시 하고(Pydantic), 화면은 안내만 할 것(Zod)
- 화면과 서버의 제목 규칙·에러 문구는 따로 적혀 있으므로 바꿀 때 양쪽을 같이 바꿀 것
- 한 번에 한 기능만 작업하고, 끝나면 무엇을 바꿨는지 요약할 것
- 기능은 docs/TEST_CASES.md의 정상·에러 케이스가 모두 통과해야 완료. 정상만 통과하면 미완료
- 테스트를 삭제하거나 skip하지 말 것
- 테스트가 실패하면 테스트가 아닌 구현을 고칠 것
- console.log, print는 디버깅 후 제거할 것
- 초보자가 이해할 수 있게 주석은 한국어로 짧게

## 아직 정하지 않은 것
- 개발용 PostgreSQL 실행 위치 (v0.3 전에): 내 PC 설치 / Docker / 클라우드
- 테이블 만드는 방법 (v0.3 전에): create_all / Alembic
- 서버 테스트에서 DB 대신 쓸 것 (v0.3 전에)
- 배포 위치 (v1.0 전에): 화면, FastAPI, PostgreSQL 각각
- 접근 제한 (v1.0 전에): 로그인 없이 배포하면 누구나 데이터를 보고 바꿀 수 있음

## 자주 쓰는 명령
- 화면 개발 서버: npm run dev (http://localhost:3000)
- 화면 테스트: npm test
- 서버 개발 서버 (v0.2부터, backend 폴더에서): uvicorn app.main:app --reload --port 8000
- 서버 테스트 (backend 폴더에서): pytest
