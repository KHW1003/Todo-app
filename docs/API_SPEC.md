# API_SPEC - Todo 앱 (초안)

> 바탕 문서: docs/PRD.md, docs/TRD.md, docs/DATA_MODEL.md
> API 명세는 "화면과 서버가 주고받는 약속"이다. 이 문서대로만 요청하고 응답한다.

## 1. 전체 개요

이 API는 할 일 하나(`Todo`)를 **조회 · 추가 · 완료 전환 · 삭제** 하는 4개의 요청으로 이루어진다.
화면(React)은 DB를 직접 건드리지 않고, 반드시 이 4개 요청으로만 데이터를 다룬다.

| 메서드 | 주소 | 하는 일 | 성공 코드 | 기능 | 파일 |
|--------|------|---------|----------|------|------|
| GET | /api/todos | 목록 조회 (최신순) | 200 | F-02 | backend/app/main.py |
| POST | /api/todos | 추가 | 201 | F-01 | backend/app/main.py |
| PATCH | /api/todos/:id | 완료 전환 | 200 | F-03 | backend/app/main.py |
| DELETE | /api/todos/:id | 삭제 | 204 | F-04 | backend/app/main.py |

- 서버는 FastAPI(Python)다. 화면은 Next.js 주소(3000)로 요청하고, Next.js가 FastAPI(8000)로 넘긴다 (TRD 4장).
- F-05(데이터 유지)는 별도 API가 아니라 저장 위치(서버 메모리 → PostgreSQL)로 해결한다.
- 제목 수정 API는 없다. PATCH는 완료 전환만 한다 (PRD에 제목 수정 기능 없음).

### 한눈에 보는 규칙
- 주고받는 데이터는 모두 JSON
- 할 일 모양: `{ id, title, done, createdAt }` (2장)
- 실패하면 항상 `{ "error": { "code", "message" } }` (2장, 에러 코드 목록은 8장)
- 꼭 확인할 실패: 빈 제목 → 400 `TITLE_REQUIRED`, 101자 제목 → 400 `TITLE_TOO_LONG`, 없는 id → 404 `TODO_NOT_FOUND`

### 문서 순서
| 장 | 내용 |
|----|------|
| 2 | 공통 규칙 (주소, 형식, 할 일 모양, 실패 응답 모양, 상태 코드) |
| 3 ~ 6 | 엔드포인트별 상세 (요청, 성공 응답, 실패 응답) |
| 7 | 화면에서 부르는 예시 (fetch) |
| 8 | 에러 코드 모음과 꼭 확인할 에러 예시 |
| 9 | 버전별 차이 |

## 2. 공통 규칙

| 항목 | 내용 |
|------|------|
| 주소 | 화면에서는 `http://localhost:3000/api` (개발 서버 기준). 실제로 받는 곳은 FastAPI `http://localhost:8000/api` |
| 사용 버전 | v0.2부터 (v0.1은 API 없이 localStorage) |
| 주고받는 형식 | JSON. 요청에 본문이 있으면 헤더 `Content-Type: application/json` |
| 로그인 | 없음 (PRD 범위 밖) |
| 날짜 | ISO 8601 UTC 문자열. 예) `"2026-10-23T05:30:00.000Z"` |
| 목록 나눠 보기 | 없음. 목록은 항상 전체를 돌려준다 |

### 할 일(Todo) 모양
모든 응답의 할 일은 이 모양이다 (DATA_MODEL 4장 `Todo` 타입).

```json
{
  "id": "3f2b8c1e-9a4d-4e7b-b5c2-1d0e6f8a9b3c",
  "title": "장보기",
  "done": false,
  "createdAt": "2026-10-23T05:30:00.000Z"
}
```

### 실패 응답 모양
실패하면 항상 이 모양이다.

```json
{
  "error": {
    "code": "TITLE_TOO_LONG",
    "message": "제목은 100자 이하로 입력해 주세요"
  }
}
```

| 필드 | 뜻 | 누가 쓰나 |
|------|----|----------|
| `error.code` | 오류 종류를 나타내는 영어 대문자 이름. 바뀌지 않는다 | 코드 (화면이 오류 종류에 따라 다르게 처리할 때, 테스트) |
| `error.message` | 사용자에게 그대로 보여줘도 되는 한국어 문구 | 사람 (화면에 그대로 표시, PRD Q-05) |

- `code`와 `message`를 나누는 이유: 문구는 나중에 다듬을 수 있지만, 코드가 `message` 글자를 비교하고 있으면 문구를 바꿀 때마다 코드가 깨진다. 그래서 코드는 `code`만 본다.
- 전체 코드 목록은 8장.
- FastAPI의 기본 실패 응답(422, `{ "detail": … }`)은 쓰지 않는다. 모든 실패를 위 모양과 이 문서의 상태 코드로 바꿔 보낸다 (TRD 7장).

### 상태 코드

| 상태 코드 | 뜻 | 언제 |
|------|----|------|
| 200 | 성공 | 조회, 변경 성공 |
| 201 | 새로 만듦 | 추가 성공 |
| 204 | 성공, 돌려줄 내용 없음 | 삭제 성공 |
| 400 | 요청이 잘못됨 | 검증 실패, JSON이 깨짐 |
| 404 | 찾을 수 없음 | 없는 id, UUID 모양이 아닌 id |
| 500 | 서버 오류 | DB 연결 실패 등 예상 못한 문제 |

## 3. GET /api/todos — 목록 보기 (F-02)

### 요청
본문 없음.

### 성공 응답: 200
할 일 배열. `createdAt` 최신순 (가장 최근이 맨 앞).

```json
[
  { "id": "9c1e…", "title": "운동하기", "done": false, "createdAt": "2026-10-23T06:00:00.000Z" },
  { "id": "3f2b…", "title": "장보기", "done": true, "createdAt": "2026-10-23T05:30:00.000Z" }
]
```

할 일이 없으면 빈 배열 `[]`.

### 실패 응답

| 상태 | 언제 | code | message |
|------|------|------|---------|
| 500 | DB 연결 실패 등 | INTERNAL_ERROR | 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요 |

---

## 4. POST /api/todos — 할 일 추가 (F-01)

### 요청 본문

```json
{ "title": "  장보기  " }
```

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| title | 문자열 | 예 | 아래 "제목 검증 순서" 참고 |

- `title` 말고 다른 필드(예: `id`, `done`)를 보내면 400. id, done, createdAt은 서버가 정한다.

### 제목 검증 순서
1. 문자열이 아니면 → 400
2. 앞뒤 공백을 지운다 ("  장보기  " → "장보기"). 가운데 공백은 그대로 둔다 (PRD Q-03)
3. 보이는 글자 수를 센다 (이모지 👍 = 1자) (PRD Q-02)
4. 0자이거나 100자를 넘으면 → 400
5. 내부 길이가 400을 넘으면 → 400 (DB 칸 크기, DATA_MODEL 참고. 보통 입력에서는 일어나지 않음)
6. 같은 제목이 이미 있어도 추가한다 (PRD Q-01)

### 서버가 채우는 값

| 필드 | 값 |
|------|----|
| id | `uuid.uuid4()` |
| done | `false` |
| createdAt | 지금 시각 (UTC) |

### 성공 응답: 201
만든 할 일 하나.

```json
{ "id": "3f2b8c1e-…", "title": "장보기", "done": false, "createdAt": "2026-10-23T05:30:00.000Z" }
```

### 실패 응답

| 상태 | 언제 | code | message |
|------|------|------|---------|
| 400 | 본문이 JSON이 아님 | INVALID_REQUEST | 요청 형식이 올바르지 않습니다 |
| 400 | title이 없거나 문자열이 아님 | TITLE_REQUIRED | 제목을 입력해 주세요 |
| 400 | 공백 제거 후 0자 | TITLE_REQUIRED | 제목을 입력해 주세요 |
| 400 | 100자 초과, 또는 내부 길이 400 초과 | TITLE_TOO_LONG | 제목은 100자 이하로 입력해 주세요 |
| 400 | title 말고 다른 필드가 있음 | INVALID_REQUEST | 요청 형식이 올바르지 않습니다 |
| 500 | DB 오류 등 | INTERNAL_ERROR | 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요 |

---

## 5. PATCH /api/todos/:id — 완료/미완료 전환 (F-03)

### 요청
- 주소의 `:id` 자리에 할 일 id (UUID)
- 본문:

```json
{ "done": true }
```

| 필드 | 타입 | 필수 | 규칙 |
|------|------|------|------|
| done | 불리언 | 예 | `true` 또는 `false`만. `"true"`(문자열)나 `1`은 안 됨 |

- 제목은 이 API로 바꿀 수 없다. `title`을 보내면 400 (PRD에 제목 수정 기능 없음)
- 지금 상태와 같은 값을 보내도 성공한다 (이미 완료인데 `true`를 보내도 200)

### 성공 응답: 200
바뀐 할 일 하나.

```json
{ "id": "3f2b8c1e-…", "title": "장보기", "done": true, "createdAt": "2026-10-23T05:30:00.000Z" }
```

### 실패 응답

| 상태 | 언제 | code | message |
|------|------|------|---------|
| 400 | 본문이 JSON이 아님 | INVALID_REQUEST | 요청 형식이 올바르지 않습니다 |
| 400 | done이 없거나 불리언이 아님 | INVALID_DONE | 완료 여부(done)는 true 또는 false여야 합니다 |
| 400 | done 말고 다른 필드가 있음 | INVALID_REQUEST | 요청 형식이 올바르지 않습니다 |
| 404 | 없는 id, 또는 UUID 모양이 아닌 id | TODO_NOT_FOUND | 할 일을 찾을 수 없습니다 |
| 500 | DB 오류 등 | INTERNAL_ERROR | 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요 |

---

## 6. DELETE /api/todos/:id — 할 일 삭제 (F-04)

### 요청
- 주소의 `:id` 자리에 할 일 id (UUID)
- 본문 없음

### 성공 응답: 204
본문 없음.

### 실패 응답

| 상태 | 언제 | code | message |
|------|------|------|---------|
| 404 | 없는 id, UUID 모양이 아닌 id, 이미 지운 할 일 | TODO_NOT_FOUND | 할 일을 찾을 수 없습니다 |
| 500 | DB 오류 등 | INTERNAL_ERROR | 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요 |

---

## 7. 화면에서 부르는 예시 (fetch)

```ts
// 목록
const res = await fetch("/api/todos");
const todos: Todo[] = await res.json();

// 추가
const res = await fetch("/api/todos", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ title }),
});
if (!res.ok) {
  const { error } = await res.json();
  showMessage(error.message); // 사람에게는 message를 그대로 보여준다
  // 오류 종류로 나눌 때는 code를 본다. 예: if (error.code === "TODO_NOT_FOUND") ...
}

// 완료 전환
await fetch(`/api/todos/${id}`, {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ done: true }),
});

// 삭제
await fetch(`/api/todos/${id}`, { method: "DELETE" });
```

- `res.ok`는 상태 코드가 200~299일 때 true다.
- 204 응답은 본문이 없으므로 `res.json()`을 부르면 오류가 난다. 삭제 성공 때는 부르지 않는다.
- 서버에 연결 자체가 안 되면 `fetch`가 오류를 던진다. 이때 화면은 "서버에 연결할 수 없습니다"를 보여준다.

## 8. 에러 코드 모음

서버와 화면은 언어가 달라서 같은 표를 두 곳에 둔다: 서버 `backend/app/errors.py`, 화면 `src/lib/errors.ts`. 둘의 code와 message는 이 표와 똑같아야 한다.

| code | 상태 | message | 쓰는 곳 |
|------|------|---------|---------|
| TITLE_REQUIRED | 400 | 제목을 입력해 주세요 | POST: 제목 없음, 공백만 |
| TITLE_TOO_LONG | 400 | 제목은 100자 이하로 입력해 주세요 | POST: 100자 초과, 내부 길이 400 초과 |
| INVALID_DONE | 400 | 완료 여부(done)는 true 또는 false여야 합니다 | PATCH: done 없음, 불리언 아님 |
| INVALID_REQUEST | 400 | 요청 형식이 올바르지 않습니다 | 모든 요청: JSON 깨짐, 모르는 필드 |
| TODO_NOT_FOUND | 404 | 할 일을 찾을 수 없습니다 | PATCH, DELETE: 없는 id, UUID 아닌 id |
| INTERNAL_ERROR | 500 | 서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요 | 모든 요청: 예상 못한 오류 |

화면 전용 (서버 응답이 아님): `fetch` 자체가 실패하면 "서버에 연결할 수 없습니다"를 보여준다.

### 꼭 확인할 에러 예시

**빈 제목** — `POST /api/todos` + `{ "title": "   " }`
```json
400
{ "error": { "code": "TITLE_REQUIRED", "message": "제목을 입력해 주세요" } }
```

**101자 제목** — `POST /api/todos` + `{ "title": "가가가…(101자)" }`
```json
400
{ "error": { "code": "TITLE_TOO_LONG", "message": "제목은 100자 이하로 입력해 주세요" } }
```

**없는 id** — `PATCH /api/todos/00000000-0000-0000-0000-000000000000` + `{ "done": true }`
(`DELETE`도 같은 응답)
```json
404
{ "error": { "code": "TODO_NOT_FOUND", "message": "할 일을 찾을 수 없습니다" } }
```

## 9. 버전별 차이

| 버전 | API |
|------|-----|
| v0.1 | 없음. 화면이 localStorage를 직접 쓴다. 단, 데이터 모양(`Todo`)과 제목 규칙은 이 문서와 같게 한다 |
| v0.2 | 이 문서대로. FastAPI 서버, 저장은 서버 메모리 |
| v0.3 | 이 문서와 **똑같다**. 저장만 PostgreSQL로 바뀐다 |
