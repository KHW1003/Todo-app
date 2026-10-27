// 에러 코드와 한국어 문구 (API_SPEC.md 8장). 서버 backend/app/errors.py와 똑같이 맞춘다
export const ERROR_MESSAGES = {
  TITLE_REQUIRED: "제목을 입력해 주세요",
  TITLE_TOO_LONG: "제목은 100자 이하로 입력해 주세요",
  INVALID_DONE: "완료 여부(done)는 true 또는 false여야 합니다",
  INVALID_REQUEST: "요청 형식이 올바르지 않습니다",
  TODO_NOT_FOUND: "할 일을 찾을 수 없습니다",
  INTERNAL_ERROR: "서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요",
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

// 화면 전용: 서버에 연결 자체가 안 될 때
export const NETWORK_ERROR_MESSAGE = "서버에 연결할 수 없습니다";
