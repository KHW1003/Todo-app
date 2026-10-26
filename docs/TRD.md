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

| 기술 | 역할 | 고른 이유 (한 줄) |
|------|------|------------------|
| Next.js 15 (App Router) | 화면 + API 서버 | 화면과 API를 한 프로젝트 안에서 같이 만들 수 있어서, 서버를 따로 세우지 않아도 된다 |
| React 19 (Next.js에 포함) | 화면 구성 | 체크박스를 누르면 화면이 바로 바뀌는 것처럼, 데이터가 바뀌면 화면을 자동으로 다시 그려 준다 |
| TypeScript (strict) | 개발 언어 | 변수에 "이건 문자열, 이건 true/false" 같은 타입을 적어 두면 실수를 실행 전에 잡아 준다 |
| Tailwind CSS | 화면 꾸미기 | CSS 파일을 따로 만들지 않고 `class="text-red-500"`처럼 클래스 이름만으로 꾸밀 수 있다 |
| Zod | 입력값 검증 | "제목은 1~100자 문자열" 같은 규칙을 한 곳에 적어 두고, 서버와 화면이 같은 규칙을 쓸 수 있다 |
| MySQL 8 | 데이터 영구 저장 | 서버를 껐다 켜도 데이터가 남는다. 가장 널리 쓰이는 DB 중 하나라 자료와 질문 답변을 찾기 쉽다 |
| Drizzle ORM (+ mysql2) | DB 다루기 | SQL 문장을 직접 쓰는 대신 TypeScript 코드로 DB를 다루고, 타입 검사도 받을 수 있다. mysql2는 Node가 MySQL에 접속하게 해 주는 연결 도구다 |
| Jest | 테스트 실행 | "이 함수에 이걸 넣으면 이게 나와야 한다"를 코드로 적어 두고 자동으로 확인할 수 있다 |
| React Testing Library | 화면 테스트 | 사용자가 실제로 하는 것처럼 "입력하고 버튼 누르기"를 흉내 내서 화면을 검사할 수 있다 |

## 3. 폴더 구조와 역할

| 폴더 / 파일 | 역할 | 시작 버전 |
|-------------|------|----------|
| app/page.tsx | 첫 화면 (할 일 목록 페이지) | v0.1 |
| app/api/todos/route.ts | `GET`, `POST /api/todos` | v0.2 |
| app/api/todos/[id]/route.ts | `PATCH`, `DELETE /api/todos/:id` | v0.2 |
| src/components/ | 화면 조각 (입력 폼, 목록, 항목) | v0.1 |
| src/lib/validation.ts | Zod 검증 규칙 (서버·화면 공용) | v0.1 |
| src/lib/ | 서버 로직, DB 연결 | v0.2 |
| src/lib/db/schema.ts | Drizzle 테이블 정의 | v0.3 |
| src/types/ | 공유 타입 (예: `Todo`) | v0.1 |
| docs/ | 명세 문서 | - |

## 4. 전체 구조

```
[브라우저]                        [Next.js 서버]                     [DB (MySQL)]
React 컴포넌트   ──fetch 요청──▶  app/api/todos (API 라우트)  ──Drizzle──▶  todos 테이블
(src/components) ◀──JSON 응답──   Zod 검증 → src/lib         ◀──결과────
```

- 화면은 DB를 직접 건드리지 않는다. 반드시 API 라우트를 거친다.
- 서버는 받은 데이터를 **Zod로 검증한 뒤에만** DB에 저장한다.

## 5. 버전별 저장 방식 (PRD F-05)

| 버전 | 데이터 위치 | 화면이 데이터를 다루는 방법 |
|------|-------------|---------------------------|
| v0.1 | 브라우저 localStorage | 컴포넌트가 localStorage를 직접 읽고 쓴다 |
| v0.2 | 서버 메모리 (src/lib의 배열) | 컴포넌트가 API를 호출한다. 서버를 재시작하면 사라진다 |
| v0.3 | MySQL | API는 v0.2와 **똑같다**. src/lib 안의 저장 부분만 바뀐다 |

- v0.3에서 API를 그대로 두는 이유: 화면 코드를 고치지 않고 저장 방식만 바꿀 수 있다.
- v0.2 주의: 개발 중 코드를 저장하면 서버가 다시 불러오면서 메모리 데이터가 사라질 수 있다. 정상이다.

## 6. 데이터 모델 (요약, 자세한 건 DATA_MODEL.md)

테이블: `todos`

| 컬럼 | MySQL 타입 | 설명 |
|------|-----------|------|
| id | CHAR(36), 기본키 | 할 일 번호 (UUID). 서버가 `crypto.randomUUID()`로 만든다 |
| title | VARCHAR(400), NOT NULL | 제목. 앞뒤 공백을 지운 뒤 1~100자 (보이는 글자 기준) |
| done | BOOLEAN, NOT NULL, 기본값 FALSE | 완료 여부 |
| created_at | DATETIME(3), NOT NULL | 만든 시각 (UTC). 서버가 만든다. 목록 정렬 기준 |

공유 타입 (src/types):
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

## 8. 검증 규칙 (Zod)

| 대상 | 규칙 | 어디서 |
|------|------|--------|
| title | 문자열, 앞뒤 공백 제거 후 보이는 글자 1~100자 | 서버 (필수), 화면은 같은 규칙으로 안내만 |
| title | 내부 길이 400 이하 (DB 칸 크기) | 서버 |
| done | true 또는 false (문자열 "true", 숫자 1은 안 됨) | 서버 |
| 요청 본문 | 정해진 필드 말고 다른 필드가 있으면 400 | 서버 |
| id | 존재하는 할 일 | 서버 (없거나 UUID 모양이 아니면 404) |

- 보이는 글자 수는 `Intl.Segmenter`로 센다 (이모지 👍 = 1자). `"👍".length`는 2라서 쓰지 않는다
- 제목 가운데 공백은 그대로 두고, 같은 제목도 허용한다 (PRD Q-01, Q-03)
- 규칙은 `src/lib/validation.ts` 한 곳에만 적고 서버와 화면이 같이 가져다 쓴다.
- 서버에서 반드시 검증하는 이유: 화면 검사는 브라우저 개발자 도구 등으로 쉽게 건너뛸 수 있다. 서버가 마지막 문지기다.

## 9. 흐름: "추가" 버튼을 누른 뒤 DB에 저장되기까지 (v0.3 기준)

예시: 입력칸에 "  장보기  "를 적고 추가 버튼을 누른다.

1. **[화면] 버튼 클릭 감지**
   입력 폼 컴포넌트의 `onSubmit` 함수가 실행된다.
2. **[화면] 입력값 읽기**
   React state에 들어 있던 "  장보기  "를 가져온다.
3. **[화면] 안내용 검사**
   Zod 규칙으로 미리 검사한다. 틀리면 서버에 보내지 않고 안내 문구만 보여주고 끝낸다.
   (사용자 편의용이다. 진짜 검사는 5번에서 서버가 한다.)
4. **[화면 → 서버] 요청 보내기**
   `fetch("/api/todos", { method: "POST", body: ... })` 로 `{ "title": "  장보기  " }`를 보낸다.
5. **[서버] 검증**
   `app/api/todos/route.ts`의 `POST` 함수가 요청을 받는다.
   Zod로 검사하면서 앞뒤 공백을 지운다 → "장보기".
   규칙을 어기면 400 + `{ "error": { "code": "...", "message": "..." } }`를 보내고 끝낸다.
6. **[서버 → DB] 저장**
   서버가 `id`(`crypto.randomUUID()`)와 `createdAt`(지금 시각)을 만든 뒤 Drizzle로 저장한다:
   `db.insert(todos).values({ id, title: "장보기", createdAt })`
   Drizzle이 이 코드를 SQL로 바꾸고, 값은 따로 넣어 보낸다 (SQL 인젝션 방지).
   MySQL은 저장한 줄을 바로 돌려주는 기능(RETURNING)이 없다. 그래도 id와 createdAt을 서버가 직접 만들었으므로, 8번 응답은 서버가 가진 값으로 만든다.
7. **[DB] 기록**
   DB가 한 줄을 추가한다. `id`(UUID)와 `created_at`(지금)은 6번에서 서버가 만들어 넣고, `done`은 기본값 false로 채워진다.
8. **[서버 → 화면] 응답**
   저장된 할 일을 201로 돌려준다.
   `{ "id": "3f2b8c1e-…", "title": "장보기", "done": false, "createdAt": "2026-10-23T05:30:00.000Z" }` (UTC 05:30 = 한국 14:30)
9. **[화면] 결과 반영**
   - 성공(201): 할 일 목록 state 맨 앞에 새 할 일을 넣는다 → React가 화면을 다시 그린다. 입력칸을 비운다.
   - 실패(400): 서버가 보낸 `error.message`를 보여준다.
   - 서버 연결 실패: "서버에 연결할 수 없습니다" 같은 안내를 보여준다.

완료 전환과 삭제도 같은 순서다. 4번 요청과 6번 Drizzle 코드만 다르다.

| 기능 | 4번 요청 | 6번 Drizzle |
|------|---------|-------------|
| 완료 전환 | `PATCH /api/todos/3f2b…` + `{ "done": true }` | `db.update(todos).set({ done }).where(eq(todos.id, id))` |
| 삭제 | `DELETE /api/todos/3f2b…` | `db.delete(todos).where(eq(todos.id, id))` |

## 10. 테스트

| 종류 | 도구 | 대상 | 예시 |
|------|------|------|------|
| 단위 테스트 | Jest | Zod 검증 규칙 | 공백만 → 실패, 100자 → 통과, 101자 → 실패, 👍 100개 → 통과, "장  보기" → 가운데 공백 유지 |
| 화면 테스트 | Jest + React Testing Library | 컴포넌트 | "장보기" 입력 후 버튼 클릭 → 목록에 보임 |
| API 테스트 | Jest | API 라우트 함수 | 없는 id 삭제 → 404, UUID 아닌 id → 404, PATCH에 title → 400 |

- 실행: `npm test`
- 기준: PRD "8. 성공 기준"의 F-01 ~ F-05. 자세한 목록은 docs/TEST_CASES.md
- 테스트는 실제 DB를 쓰지 않는다 (실제 데이터를 지우지 않도록)

## 11. 환경 변수와 기타

- DB 연결 정보는 `.env.local`의 `DATABASE_URL`에 둔다 (v0.3부터)
  예: `mysql://사용자:비밀번호@localhost:3306/todo_app`
- DB와 테이블 문자셋은 `utf8mb4` (한글과 이모지가 깨지지 않게)
- 날짜는 UTC로 저장한다. 화면에는 날짜를 보여주지 않는다 (PRD F-02, 정렬에만 씀). mysql2 연결 설정에 `timezone: "Z"`를 넣는다 (DATA_MODEL "시간대")
- 인덱스: `created_at`에 하나 둔다 (목록 최신순 정렬용, DATA_MODEL "인덱스")
- `.env.local`은 git에 올리지 않는다 (비밀번호가 들어 있다)
- 개발 서버: `npm run dev` → http://localhost:3000

## 12. 아직 정하지 않은 것

| # | 질문 | 언제까지 | 관련 |
|---|------|----------|------|
| T-01 | 개발용 MySQL을 어디서 실행할지 | v0.3 전 | 아래 비교 |
| T-02 | 배포 위치 (앱과 MySQL을 각각 어디에 둘지) | v1.0 전 | PRD Q-11 |
| T-03 | 접근 제한 (로그인 없이 배포하면 누구나 보고 바꿀 수 있음) | v1.0 전 | PRD Q-12 |
| T-04 | 테스트에서 DB 대신 무엇을 쓸지 (가짜 함수 / 테스트용 DB) | v0.2 전 | 10. 테스트 |

### 결정됨 (2026-10-23)
- DB 종류: **MySQL 8**
- id: UUID, 서버가 만든다 (v0.1은 화면)
- 완료 필드 이름: `done`
- 날짜: UTC로 저장, mysql2 `timezone: "Z"`
- PATCH는 완료 전환만 (제목 수정 없음)
- 실패 응답: `{ "error": { "code", "message" } }`, 화면은 message를 그대로 보여줌
- UUID 모양이 아닌 id: 404

### T-01 개발용 MySQL 실행 위치 비교

| | 내 PC에 설치 | Docker | 클라우드 MySQL |
|---|---|---|---|
| 준비 | MySQL 설치 프로그램 실행 | Docker 설치 후 명령 한 줄 | 가입 후 연결 주소 받기 |
| 인터넷 없이 개발 | 됨 | 됨 | 안 됨 |
| 지우고 다시 시작 | 번거로움 | 쉬움 | 서비스마다 다름 |
| 배포 때 | 따로 준비해야 함 | 따로 준비해야 함 | 그대로 쓸 수도 있음 |
