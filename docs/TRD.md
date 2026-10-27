# TRD - Todo 앱 (초안)

> TRD(기술 요구사항)는 PRD의 기능을 "어떤 기술로, 어떤 구조로" 만들지 정한 문서다.

## 1. 관련 문서
- 아이디어: docs/IDEA.md
- 제품 요구사항: docs/PRD.md
- 작업 규칙: CLAUDE.md
- 데이터 모델: docs/DATA_MODEL.md
- API 명세: docs/API_SPEC.md
- 화면 컴포넌트: docs/COMPONENT_SPEC.md
- 테스트 목록: docs/TEST_CASES.md

## 2. 기술 스택과 선택 이유

프로젝트는 **화면(프론트엔드)** 과 **서버(백엔드)** 두 부분으로 나뉜다. 화면은 TypeScript, 서버는 Python으로 만든다.

### 화면 (프론트엔드)

| 기술 | 역할 | 고른 이유 (한 줄) |
|------|------|------------------|
| Next.js 15 (App Router) | 화면 띄우기 | 페이지 파일만 만들면 주소가 생기고, 서버로 가는 요청을 FastAPI에 넘겨주는 설정(rewrites)도 한 줄로 된다 |
| React 19 (Next.js에 포함) | 화면 구성 | 체크박스를 누르면 화면이 바로 바뀌는 것처럼, 데이터가 바뀌면 화면을 자동으로 다시 그려 준다 |
| TypeScript (strict) | 화면 개발 언어 | 변수에 "이건 문자열, 이건 true/false" 같은 타입을 적어 두면 실수를 실행 전에 잡아 준다 |
| Tailwind CSS | 화면 꾸미기 | CSS 파일을 따로 만들지 않고 `class="text-red-500"`처럼 클래스 이름만으로 꾸밀 수 있다 |
| Zod | 화면 입력 안내 | "제목은 1~100자" 규칙으로 서버에 보내기 전에 미리 안내한다. 진짜 검사는 서버가 한다 |
| Jest + React Testing Library | 화면 테스트 | 사용자가 실제로 하는 것처럼 "입력하고 버튼 누르기"를 흉내 내서 화면을 검사할 수 있다 |

### 서버 (백엔드)

| 기술 | 역할 | 고른 이유 (한 줄) |
|------|------|------------------|
| Python 3.12 | 서버 개발 언어 | 문법이 짧고 읽기 쉬워서 초보자가 배우기 좋다 |
| FastAPI | API 서버 | 함수 하나에 `@app.get("/api/todos")`만 붙이면 API가 되고, 타입 힌트로 요청 모양을 자동 검사해 준다 |
| Uvicorn | 서버 실행기 | FastAPI 앱을 실제로 켜서 요청을 받게 해 주는 프로그램 |
| Pydantic v2 (FastAPI에 포함) | 입력값 검증 | "title은 문자열, 다른 필드는 금지" 같은 규칙을 클래스로 적어 두면 FastAPI가 알아서 검사한다 |
| regex | 보이는 글자 세기 | 파이썬 기본 `len("👍")`은 1이지만 `len("👨‍👩‍👧")`은 5다. `regex`의 `\X`로 보이는 글자를 정확히 센다 |
| PostgreSQL 16 | 데이터 영구 저장 | 서버를 껐다 켜도 데이터가 남는다. UUID와 시간대 있는 날짜 타입을 기본으로 지원한다 |
| SQLAlchemy 2.0 (+ psycopg 3) | DB 다루기 | SQL 문장을 직접 쓰는 대신 파이썬 코드로 DB를 다룬다. psycopg는 파이썬이 PostgreSQL에 접속하게 해 주는 연결 도구다 |
| pytest (+ FastAPI TestClient) | 서버 테스트 | 서버를 실제로 켜지 않고도 "이 요청을 보내면 이 응답이 와야 한다"를 자동으로 확인할 수 있다 |

## 3. 폴더 구조와 역할

| 폴더 / 파일 | 역할 | 시작 버전 |
|-------------|------|----------|
| app/page.tsx | 첫 화면 (할 일 목록 페이지) | v0.1 |
| src/components/ | 화면 조각 (입력 폼, 목록, 항목) | v0.1 |
| src/lib/validation.ts | 화면용 제목 규칙 (Zod, 안내용) | v0.1 |
| src/lib/errors.ts | 에러 코드와 한국어 문구 (화면용) | v0.1 |
| src/lib/todoApi.ts | 화면이 서버를 부르는 함수 (fetch) | v0.2 |
| src/types/ | 화면 공유 타입 (예: `Todo`) | v0.1 |
| next.config.ts | `/api/*` 요청을 FastAPI로 넘기는 설정 (rewrites) | v0.2 |
| backend/app/main.py | FastAPI 앱, 4개 API, 에러 응답 모양 맞추기 | v0.2 |
| backend/app/schemas.py | 요청·응답 모양 (Pydantic) | v0.2 |
| backend/app/validation.py | 서버용 제목 규칙 (최종 검사) | v0.2 |
| backend/app/errors.py | 에러 코드와 한국어 문구 (서버용) | v0.2 |
| backend/app/storage.py | 저장 담당. v0.2는 메모리 목록, v0.3은 DB | v0.2 |
| backend/app/db.py | DB 연결 (SQLAlchemy) | v0.3 |
| backend/app/models.py | todos 테이블 정의 (SQLAlchemy) | v0.3 |
| backend/tests/ | 서버 테스트 (pytest) | v0.2 |
| backend/requirements.txt | 파이썬 패키지 목록 (버전 고정) | v0.2 |
| docs/ | 명세 문서 | - |

## 4. 전체 구조

```
[브라우저]                [Next.js :3000]              [FastAPI :8000]                 [PostgreSQL]
React 컴포넌트  ──fetch──▶  /api/* 를 그대로  ──────▶   backend/app/main.py  ──SQLAlchemy──▶  todos 테이블
(src/components) ◀─JSON──   FastAPI로 넘김   ◀──────   Pydantic 검증 → storage  ◀──결과────
```

- 화면은 DB를 직접 건드리지 않는다. 반드시 FastAPI를 거친다.
- 서버는 받은 데이터를 **Pydantic으로 검증한 뒤에만** 저장한다.
- 화면은 `fetch("/api/todos")`처럼 **자기 주소(3000)로** 요청하고, Next.js가 FastAPI(8000)로 넘겨 준다.
  그래서 브라우저 입장에서는 같은 주소라 CORS(다른 주소 요청 허용) 설정이 필요 없다.

```ts
// next.config.ts (v0.2)
async rewrites() {
  return [{ source: "/api/:path*", destination: "http://localhost:8000/api/:path*" }];
}
```

## 5. 버전별 저장 방식 (PRD F-05)

| 버전 | 데이터 위치 | 화면이 데이터를 다루는 방법 |
|------|-------------|---------------------------|
| v0.1 | 브라우저 localStorage | 컴포넌트가 localStorage를 직접 읽고 쓴다. 서버 없음 |
| v0.2 | FastAPI 서버 메모리 (storage.py의 리스트) | 컴포넌트가 API를 호출한다. 서버를 재시작하면 사라진다 |
| v0.3 | PostgreSQL | API는 v0.2와 **똑같다**. storage.py 안의 저장 부분만 바뀐다 |

- v0.3에서 API를 그대로 두는 이유: 화면 코드를 고치지 않고 저장 방식만 바꿀 수 있다.
- v0.2 주의: `uvicorn --reload`로 켜면 서버 코드를 저장할 때마다 서버가 다시 시작되면서 메모리 데이터가 사라진다. 정상이다.

## 6. 데이터 모델 (요약, 자세한 건 DATA_MODEL.md)

테이블: `todos`

| 컬럼 | PostgreSQL 타입 | 설명 |
|------|-----------|------|
| id | UUID, 기본키 | 할 일 번호. 서버가 `uuid.uuid4()`로 만든다 |
| title | VARCHAR(400), NOT NULL | 제목. 앞뒤 공백을 지운 뒤 1~100자 (보이는 글자 기준) |
| done | BOOLEAN, NOT NULL, 기본값 FALSE | 완료 여부 |
| created_at | TIMESTAMPTZ(3), NOT NULL | 만든 시각. 서버가 만든다. 목록 정렬 기준 |

공유 타입 (화면 src/types):
```ts
type Todo = { id: string; title: string; done: boolean; createdAt: string };
```

## 7. API (요약, 자세한 건 API_SPEC.md)

| 요청 | 하는 일 | 보내는 데이터 | 성공 | 실패 |
|------|---------|--------------|------|------|
| GET /api/todos | 목록 (최신순) | 없음 | 200 + 배열 | 500 서버 오류 |
| POST /api/todos | 추가 (F-01) | `{ "title": "장보기" }` | 201 + 만든 할 일 | 400 제목 규칙 위반·모르는 필드 |
| PATCH /api/todos/:id | 완료 전환 (F-03) | `{ "done": true }` | 200 + 바뀐 할 일 | 400 잘못된 값·모르는 필드, 404 없는 id |
| DELETE /api/todos/:id | 삭제 (F-04) | 없음 | 204 | 404 없는 id |

- 없는 id와 UUID 모양이 아닌 id는 둘 다 404

- 실패 응답 모양: `{ "error": { "code": "TITLE_TOO_LONG", "message": "한국어 문구" } }`. 화면은 `message`를 그대로 보여주고, 코드는 `code`로 오류 종류를 구분한다
- 자세한 요청·응답·오류 문구는 docs/API_SPEC.md
- 상태 코드 뜻: 200 성공, 201 새로 만듦, 204 성공했고 돌려줄 내용 없음, 400 요청이 잘못됨, 404 찾을 수 없음, 500 서버 오류

### FastAPI 기본 동작과 다른 점 (꼭 맞춰야 함)

FastAPI는 기본으로 검증 실패에 **422**와 `{ "detail": [...] }`를 돌려준다. 이 프로젝트는 API_SPEC대로 바꾼다.

| FastAPI 기본 | 이 프로젝트 | 어떻게 |
|-------------|------------|--------|
| 검증 실패 → 422 `{ "detail": … }` | 400 `{ "error": { code, message } }` | `RequestValidationError` 처리기를 등록해서 바꾼다 |
| JSON이 깨진 본문 → 422 | 400 `INVALID_REQUEST` | 위 처리기에서 같이 처리 |
| `HTTPException(404)` → `{ "detail": … }` | 404 `{ "error": … }` | 직접 만든 오류 클래스 + 처리기 |
| 예상 못한 오류 → 500 글자 | 500 `INTERNAL_ERROR` | `Exception` 처리기 |
| 모르는 필드는 무시 | 400 `INVALID_REQUEST` | Pydantic 모델에 `extra="forbid"` |
| `"true"`, `1`을 true로 바꿔 줌 | 400 `INVALID_DONE` | `done: StrictBool` |
| 주소의 id가 UUID가 아니면 422 | 404 `TODO_NOT_FOUND` | id를 `str`로 받고 직접 UUID로 바꿔 본다 |

## 8. 검증 규칙

| 대상 | 규칙 | 어디서 |
|------|------|--------|
| title | 문자열, 앞뒤 공백 제거 후 보이는 글자 1~100자 | 서버 (필수, Pydantic), 화면은 같은 규칙으로 안내만 (Zod) |
| title | 내부 길이 400 이하 (DB 칸 크기) | 서버 |
| done | true 또는 false (문자열 "true", 숫자 1은 안 됨) | 서버 |
| 요청 본문 | 정해진 필드 말고 다른 필드가 있으면 400 | 서버 |
| id | 존재하는 할 일 | 서버 (없거나 UUID 모양이 아니면 404) |

- 보이는 글자 수 세기: 화면은 `Intl.Segmenter`, 서버는 `regex.findall(r"\X", 제목)` (이모지 👍 = 1자)
- 제목 가운데 공백은 그대로 두고, 같은 제목도 허용한다 (PRD Q-01, Q-03)
- 화면(TypeScript)과 서버(Python)는 언어가 달라서 규칙 파일을 함께 쓸 수 없다. 그래서 **같은 규칙을 두 곳에 적고**, TEST_CASES의 VAL 테스트를 양쪽에서 똑같이 돌려서 어긋나지 않게 한다.
  - 화면: `src/lib/validation.ts` (Zod)
  - 서버: `backend/app/validation.py` (Pydantic)
- 서버에서 반드시 검증하는 이유: 화면 검사는 브라우저 개발자 도구 등으로 쉽게 건너뛸 수 있다. 서버가 마지막 문지기다.

## 9. 흐름: "추가" 버튼을 누른 뒤 DB에 저장되기까지 (v0.3 기준)

예시: 입력칸에 "  장보기  "를 적고 추가 버튼을 누른다.

1. **[화면] 버튼 클릭 감지**
   입력 폼 컴포넌트의 `onSubmit` 함수가 실행된다.
2. **[화면] 입력값 읽기**
   React state에 들어 있던 "  장보기  "를 가져온다.
3. **[화면] 안내용 검사**
   Zod 규칙으로 미리 검사한다. 틀리면 서버에 보내지 않고 안내 문구만 보여주고 끝낸다.
   (사용자 편의용이다. 진짜 검사는 6번에서 서버가 한다.)
4. **[화면 → Next.js] 요청 보내기**
   `fetch("/api/todos", { method: "POST", body: ... })` 로 `{ "title": "  장보기  " }`를 보낸다.
5. **[Next.js → FastAPI] 넘겨주기**
   Next.js가 rewrites 설정에 따라 같은 요청을 `http://localhost:8000/api/todos`로 넘긴다.
6. **[서버] 검증**
   `backend/app/main.py`의 추가 함수가 요청을 받는다.
   Pydantic이 검사하면서 앞뒤 공백을 지운다 → "장보기".
   규칙을 어기면 400 + `{ "error": { "code": "...", "message": "..." } }`를 보내고 끝낸다.
7. **[서버 → DB] 저장**
   서버가 `id`(`uuid.uuid4()`)와 `created_at`(지금 UTC 시각)을 만든 뒤 SQLAlchemy로 저장한다:
   `insert(Todo).values(id=id, title="장보기", created_at=now).returning(Todo)`
   SQLAlchemy가 이 코드를 SQL로 바꾸고, 값은 따로 넣어 보낸다 (SQL 인젝션 방지).
   PostgreSQL은 저장한 줄을 바로 돌려주는 기능(`RETURNING`)이 있어서, 저장된 값 그대로 응답을 만든다.
8. **[DB] 기록**
   DB가 한 줄을 추가한다. `done`은 기본값 false로 채워진다.
9. **[서버 → 화면] 응답**
   저장된 할 일을 201로 돌려준다 (FastAPI → Next.js → 브라우저).
   `{ "id": "3f2b8c1e-…", "title": "장보기", "done": false, "createdAt": "2026-10-23T05:30:00.000Z" }` (UTC 05:30 = 한국 14:30)
10. **[화면] 결과 반영**
    - 성공(201): 할 일 목록 state 맨 앞에 새 할 일을 넣는다 → React가 화면을 다시 그린다. 입력칸을 비운다.
    - 실패(400): 서버가 보낸 `error.message`를 보여준다.
    - 서버 연결 실패: "서버에 연결할 수 없습니다" 같은 안내를 보여준다.

완료 전환과 삭제도 같은 순서다. 4번 요청과 7번 SQLAlchemy 코드만 다르다.

| 기능 | 4번 요청 | 7번 SQLAlchemy |
|------|---------|-------------|
| 완료 전환 | `PATCH /api/todos/3f2b…` + `{ "done": true }` | `update(Todo).where(Todo.id == id).values(done=done).returning(Todo)` |
| 삭제 | `DELETE /api/todos/3f2b…` | `delete(Todo).where(Todo.id == id)` |

- 바뀐 줄이 0개면 없는 id라는 뜻이므로 404를 돌려준다.

## 10. 테스트

| 종류 | 도구 | 대상 | 예시 |
|------|------|------|------|
| 단위 테스트 (화면) | Jest | Zod 제목 규칙 | 공백만 → 실패, 100자 → 통과, 101자 → 실패, 👍 100개 → 통과 |
| 단위 테스트 (서버) | pytest | Pydantic 제목 규칙 | 위와 같은 VAL 케이스 |
| 화면 테스트 | Jest + React Testing Library | 컴포넌트 | "장보기" 입력 후 버튼 클릭 → 목록에 보임 |
| API 테스트 | pytest + FastAPI TestClient | API 함수 | 없는 id 삭제 → 404, UUID 아닌 id → 404, PATCH에 title → 400 |

- 실행: 화면은 `npm test`, 서버는 `backend` 폴더에서 `pytest`
- 기준: PRD "8. 성공 기준"의 F-01 ~ F-05. 자세한 목록은 docs/TEST_CASES.md
- 테스트는 실제 DB를 쓰지 않는다 (실제 데이터를 지우지 않도록)

## 11. 환경 변수와 기타

- DB 연결 정보는 `backend/.env`의 `DATABASE_URL`에 둔다 (v0.3부터)
  예: `postgresql+psycopg://사용자:비밀번호@localhost:5432/todo_app`
- DB 인코딩은 `UTF8` (한글과 이모지가 깨지지 않게. PostgreSQL 기본값)
- 날짜는 `TIMESTAMPTZ`(시간대 있는 날짜)로 저장한다. DB는 내부적으로 UTC로 바꿔 보관한다. 연결할 때 세션 시간대를 UTC로 맞춘다 (DATA_MODEL "시간대")
- 화면에는 날짜를 보여주지 않는다 (PRD F-02, 정렬에만 씀)
- 인덱스: `created_at`에 하나 둔다 (목록 최신순 정렬용, DATA_MODEL "인덱스")
- `.env`, `.env.local`은 git에 올리지 않는다 (비밀번호가 들어 있다)
- 파이썬 가상환경(`backend/.venv/`)과 캐시(`__pycache__/`, `.pytest_cache/`)도 git에 올리지 않는다 (v0.2 시작 때 .gitignore에 추가)
- 파이썬 패키지 버전은 `backend/requirements.txt`에 `fastapi==0.x.y`처럼 고정한다 (package-lock.json과 같은 이유)
- 개발 서버 (터미널 2개):
  - 화면: `npm run dev` → http://localhost:3000
  - 서버: `backend` 폴더에서 `uvicorn app.main:app --reload --port 8000` (v0.2부터)

## 12. 아직 정하지 않은 것

| # | 질문 | 언제까지 | 관련 |
|---|------|----------|------|
| T-01 | 개발용 PostgreSQL을 어디서 실행할지 | v0.3 전 | 아래 비교 |
| T-02 | 배포 위치 (화면, FastAPI 서버, PostgreSQL을 각각 어디에 둘지) | v1.0 전 | PRD Q-11 |
| T-03 | 접근 제한 (로그인 없이 배포하면 누구나 보고 바꿀 수 있음) | v1.0 전 | PRD Q-12 |
| T-04 | 서버 테스트에서 DB 대신 무엇을 쓸지 (가짜 저장소 / 테스트용 DB) | v0.3 전 | 10. 테스트 |
| T-05 | 테이블을 만드는 방법 (시작할 때 자동 생성 `create_all` / 마이그레이션 도구 Alembic) | v0.3 전 | DATA_MODEL |

- 배포하면 FastAPI 주소가 `localhost:8000`이 아니게 되므로, rewrites의 주소를 환경 변수로 바꿔야 한다 (T-02와 같이 정함).

### 결정됨 (2026-10-23)
- id: UUID, 서버가 만든다 (v0.1은 화면)
- 완료 필드 이름: `done`
- PATCH는 완료 전환만 (제목 수정 없음)
- 실패 응답: `{ "error": { "code", "message" } }`, 화면은 message를 그대로 보여줌
- UUID 모양이 아닌 id: 404

### 결정됨 (2026-10-27)
- 서버: **FastAPI (Python)**. Next.js API 라우트는 쓰지 않는다
- DB: **PostgreSQL** (MySQL에서 바꿈)
- 서버 검증: Pydantic, DB 다루기: SQLAlchemy 2.0 + psycopg 3, 서버 테스트: pytest
- 화면과 서버 연결: Next.js rewrites로 `/api/*`를 FastAPI에 넘김 (API 주소는 그대로)
- 날짜: `TIMESTAMPTZ`로 저장, API에는 `Z`로 끝나는 ISO 문자열 (밀리초 3자리)

### T-01 개발용 PostgreSQL 실행 위치 비교

| | 내 PC에 설치 | Docker | 클라우드 PostgreSQL (Neon, Supabase 등) |
|---|---|---|---|
| 준비 | PostgreSQL 설치 프로그램 실행 | Docker 설치 후 명령 한 줄 | 가입 후 연결 주소 받기 |
| 인터넷 없이 개발 | 됨 | 됨 | 안 됨 |
| 지우고 다시 시작 | 번거로움 | 쉬움 | 서비스마다 다름 |
| 배포 때 | 따로 준비해야 함 | 따로 준비해야 함 | 그대로 쓸 수도 있음 |
