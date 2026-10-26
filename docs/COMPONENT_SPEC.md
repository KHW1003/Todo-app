# COMPONENT_SPEC - Todo 앱 (초안)

> 바탕 문서: docs/PRD.md, docs/API_SPEC.md, docs/TRD.md
> 화면이 어떤 부품(컴포넌트)으로 이루어지는지, 각 부품이 무엇을 받고(Props) 어떻게 동작하는지 정한 문서다.

## 1. 컴포넌트 트리

```
TodoPage              (app/page.tsx)                  : 데이터를 들고 있는 페이지
├─ TodoForm           (src/components/TodoForm.tsx)   : 입력창 + 추가 버튼 + 입력 안내 문구
├─ 페이지 안내 문구                                    : 불러오기·완료 전환·삭제 실패 안내
└─ TodoList           (src/components/TodoList.tsx)   : 목록 또는 빈 목록 문구
   └─ TodoItem        (src/components/TodoItem.tsx)   : 체크박스 + 제목 + 삭제 버튼
```

- **데이터는 TodoPage만 가진다.** 아래 부품들은 받은 값을 보여주고, 사용자가 무언가를 누르면 TodoPage에 알리기만 한다.
- 그래서 v0.1 → v0.2로 갈 때 TodoPage만 바뀌고, 나머지 세 부품은 그대로다 (6장).

## 2. 화면 문구

테스트는 이 문구로 화면을 찾는다. 바꾸려면 이 표부터 고친다.

| 위치 | 문구 | 관련 |
|------|------|------|
| 페이지 제목 | 할 일 목록 | - |
| 입력창 이름(라벨) | 할 일 | F-01 |
| 입력창 안내(placeholder) | 할 일을 입력하세요 | F-01 |
| 추가 버튼 | 추가 | F-01 |
| 빈 목록 | 할 일이 없습니다 | F-02, PRD Q-06 |
| 불러오는 중 | 불러오는 중... | F-02 |
| 삭제 버튼 | 삭제 | F-04 |
| 서버 연결 실패 | 서버에 연결할 수 없습니다 | API_SPEC 8장 (화면 전용) |
| 제목 오류 등 | API_SPEC 8장의 `message` 그대로 | PRD Q-05 |

## 3. 공유 타입

```ts
// src/types/todo.ts (DATA_MODEL 4장)
export type Todo = { id: string; title: string; done: boolean; createdAt: string };
```

## 4. 컴포넌트 상세

### 4-1. TodoPage (app/page.tsx)

**하는 일**: 할 일 목록을 불러오고, 추가·완료 전환·삭제를 실제로 처리한다.

**Props**: 없음 (페이지라서)

**가진 상태 (useState)**

| 이름 | 타입 | 뜻 |
|------|------|----|
| todos | `Todo[]` | 할 일 목록 (최신순) |
| loading | `boolean` | 처음 목록을 불러오는 중인지 |
| error | `string \| null` | 페이지 안내 문구 (불러오기·완료 전환·삭제 실패) |

**동작**

| 언제 | 하는 일 | 성공 | 실패 |
|------|---------|------|------|
| 화면이 처음 열릴 때 | 목록 불러오기 | `todos`에 넣고 `loading` 끝 | `error`에 문구, 목록은 빈 채로 |
| TodoForm이 `onAdd` 부름 | 추가 | 새 할 일을 `todos` **맨 앞**에 넣음 | 오류를 던져서 TodoForm이 문구를 보여주게 함 |
| TodoItem이 `onToggle` 부름 | 완료 전환 | 받은 할 일로 그 항목만 바꿈 (순서 유지, PRD F-03) | `error`에 문구, 항목은 그대로 |
| TodoItem이 `onDelete` 부름 | 삭제 | 그 항목을 `todos`에서 뺌 | `error`에 문구, 항목은 그대로 |

- 실패 문구는 서버가 보낸 `error.message`를 그대로 쓰고, 서버에 연결 자체가 안 되면 "서버에 연결할 수 없습니다"를 쓴다 (API_SPEC 7장).

**화면 상태**

| 상태 | 보이는 것 |
|------|----------|
| 불러오는 중 | 입력 폼 + "불러오는 중..." |
| 불러오기 실패 | 입력 폼 + 안내 문구 (예: "서버에 연결할 수 없습니다") |
| 할 일 0개 | 입력 폼 + "할 일이 없습니다" |
| 할 일 1개 이상 | 입력 폼 + 목록 |

### 4-2. TodoForm (src/components/TodoForm.tsx)

**하는 일**: 제목을 입력받아 TodoPage에 넘긴다. 규칙에 어긋나면 안내만 한다.

**Props**

```ts
type TodoFormProps = {
  // 성공하면 그냥 끝나고, 실패하면 Error(message)를 던진다
  onAdd: (title: string) => Promise<void>;
};
```

**가진 상태**: 입력값(`string`), 안내 문구(`string | null`)

**동작**

| 사용자 동작 | 결과 |
|------------|------|
| 제목 입력 후 "추가" 클릭 | 화면 검사 통과 → `onAdd(입력값)` 호출 |
| 제목 입력 후 엔터 | 클릭과 똑같다 (PRD Q-04). `<form>`의 submit으로 처리 |
| 빈 칸 / 공백만 입력 후 추가 | `onAdd`를 부르지 않고 "제목을 입력해 주세요" 표시 |
| 보이는 글자 101자 이상 입력 후 추가 | `onAdd`를 부르지 않고 "제목은 100자 이하로 입력해 주세요" 표시 |
| `onAdd` 성공 | 입력창을 비우고 안내 문구를 지운다 |
| `onAdd` 실패 | 던진 오류의 `message`를 입력창 아래에 표시 |

- 화면 검사는 `src/lib/validation.ts`의 Zod 규칙을 그대로 쓴다 (TRD 8장). 안내용일 뿐이고 진짜 검사는 서버가 한다.
- `onAdd`에는 **입력한 그대로** 넘긴다 ("  장보기  "). 앞뒤 공백 제거는 Zod 규칙이 한다 (TRD 9장 4번).
- 안내 문구는 입력창 바로 아래, 빨간 글자, `role="alert"` (화면 낭독기가 읽어 주게).

### 4-3. TodoList (src/components/TodoList.tsx)

**하는 일**: 받은 목록을 받은 순서대로 보여준다. 비었으면 빈 목록 문구를 보여준다.

**Props**

```ts
type TodoListProps = {
  todos: Todo[]; // 이미 최신순으로 정렬된 목록
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
};
```

**동작**

| 상황 | 결과 |
|------|------|
| `todos`가 빈 배열 | "할 일이 없습니다" 표시 |
| `todos`가 1개 이상 | `<ul>` 안에 TodoItem을 순서대로 표시. `key`는 `todo.id` |

- 정렬은 하지 않는다. 받은 순서가 곧 화면 순서다 (정렬은 서버, v0.1은 TodoPage가 맨 앞에 넣는 것으로 지킴).
- `onToggle`, `onDelete`는 TodoItem에 그대로 넘긴다.

### 4-4. TodoItem (src/components/TodoItem.tsx)

**하는 일**: 할 일 하나를 보여준다.

**Props**

```ts
type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string, done: boolean) => void; // done: 바뀔 값
  onDelete: (id: string) => void;
};
```

**보이는 것**: 체크박스, 제목, "삭제" 버튼 (PRD F-02). 날짜는 보여주지 않는다.

**동작**

| 사용자 동작 | 결과 |
|------------|------|
| 미완료 항목의 체크박스 클릭 | `onToggle(todo.id, true)` |
| 완료 항목의 체크박스 클릭 | `onToggle(todo.id, false)` |
| 제목 글자 클릭 | 체크박스 클릭과 같다 (`<label>`로 묶음) |
| "삭제" 클릭 | 확인 없이 `onDelete(todo.id)` (PRD Q-08) |

**모양**

| 상태 | 체크박스 | 제목 |
|------|---------|------|
| 미완료 (`done: false`) | 빈 칸 | 보통 글자 |
| 완료 (`done: true`) | 체크됨 | 취소선 + 회색 (PRD Q-07, Tailwind `line-through text-gray-400`) |

- 체크박스의 이름은 제목이다 (`<label>`). 테스트에서 `getByRole("checkbox", { name: "장보기" })`로 찾는다.
- 삭제 버튼에는 `aria-label="장보기 삭제"`처럼 제목을 붙인다. 버튼이 여러 개라도 어떤 할 일의 버튼인지 구분된다.

## 5. 휴대폰 화면 (PRD Q-10)

PC와 휴대폰 모두 한 줄짜리 세로 목록이라 같은 화면을 쓴다.

- 가운데 한 줄: 최대 너비 `max-w-md`, 양옆 여백 `px-4`
- 입력창은 남는 너비를 다 쓰고, "추가" 버튼은 오른쪽 옆
- 확인: 개발자 도구의 모바일 보기(폭 375px)에서 가로 스크롤이 생기지 않는다

## 6. 버전별 차이

컴포넌트 3개(TodoForm, TodoList, TodoItem)는 모든 버전에서 같다. TodoPage가 데이터를 어디서 가져오는지만 바뀐다.

| 버전 | TodoPage가 쓰는 것 | 실패 문구 출처 |
|------|-------------------|---------------|
| v0.1 | localStorage (키: `"todos"`, 값: `Todo[]`의 JSON) | 화면이 Zod로 검사하고 API_SPEC 8장과 같은 문구를 씀 (`src/lib/errors.ts`) |
| v0.2 ~ | `src/lib/todoApi.ts`의 함수 (fetch로 API 호출) | 서버 응답의 `error.message` |

- v0.1: localStorage는 화면이 처음 그려진 뒤(`useEffect` 안에서) 읽는다. Next.js는 서버에서 먼저 화면을 그리는데, 서버에는 localStorage가 없기 때문이다. 그래서 v0.1에서도 아주 잠깐 "불러오는 중..."이 보일 수 있다.
- v0.1: id는 `crypto.randomUUID()`, createdAt은 `new Date().toISOString()`으로 화면이 만든다 (DATA_MODEL 2장).

## 7. 테스트로 확인할 것 (TEST_CASES.md의 바탕)

| 대상 | 확인할 것 | PRD |
|------|----------|-----|
| TodoForm | 제목 입력 후 클릭 → `onAdd` 호출, 입력창 비움 | F-01 |
| TodoForm | 엔터로도 추가됨 | F-01 |
| TodoForm | 빈 칸·공백만 → `onAdd` 안 부름, "제목을 입력해 주세요" | F-01 |
| TodoForm | 101자 → `onAdd` 안 부름, "제목은 100자 이하로 입력해 주세요" | F-01 |
| TodoForm | 👍 100개 → `onAdd` 호출 | F-01 |
| TodoForm | `onAdd` 실패 → 오류 문구 표시 | F-01 |
| TodoList | 0개 → "할 일이 없습니다" | F-02 |
| TodoList | 받은 순서대로 표시 | F-02 |
| TodoItem | 체크박스 클릭 → `onToggle(id, !done)` | F-03 |
| TodoItem | 완료면 제목에 취소선 | F-03 |
| TodoItem | 삭제 클릭 → `onDelete(id)` | F-04 |
| TodoPage | 추가한 할 일이 맨 위에, 새로고침 뒤에도 남음 | F-01, F-05 |
| TodoPage | 완료 전환·삭제 실패 → 안내 문구, 항목 그대로 | F-03, F-04 |

## 8. 넣지 않은 것

| 것 | 이유 |
|----|------|
| 제목 수정 (더블클릭 등) | PRD에 없음, PATCH는 완료 전환만 (API_SPEC 1장) |
| 필터 (전체/진행 중/완료) | PRD에 없음 (가이드의 v0.4는 로드맵에서 뺌) |
| 만든 날짜 표시 | PRD F-02의 "보이는 것"에 없음 |
| 삭제 확인창, 되살리기 | PRD Q-08 바로 삭제, F-04 되살릴 수 없음 |
| 남은 개수 표시 | PRD에 없음 |
