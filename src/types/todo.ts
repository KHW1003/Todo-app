// 할 일 하나 (API가 돌려주는 모양)
export type Todo = {
  id: string; // UUID
  title: string;
  done: boolean;
  createdAt: string; // ISO 날짜 글자 (UTC), 예: "2026-10-23T05:30:00.000Z"
};

// 할 일 추가 요청 (POST /api/todos) - F-01
export type CreateTodoInput = {
  title: string;
};

// 완료 전환 요청 (PATCH /api/todos/:id) - F-03
export type UpdateTodoInput = {
  done: boolean;
};
