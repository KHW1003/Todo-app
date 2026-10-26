"use client";

import { useState, type FormEvent } from "react";
import { ERROR_MESSAGES } from "@/lib/errors";
import { validateTitle } from "@/lib/validation";

type TodoFormProps = {
  // 성공하면 그냥 끝나고, 실패하면 Error(message)를 던진다
  onAdd: (title: string) => Promise<void>;
};

// 입력창 + 추가 버튼 + 입력 안내 문구
export default function TodoForm({ onAdd }: TodoFormProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  // 버튼 클릭과 엔터 모두 여기로 온다
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // 안내용 검사. 진짜 검사는 저장하는 쪽에서 한다
    const result = validateTitle(title);
    if (!result.ok) {
      setMessage(ERROR_MESSAGES[result.code]);
      return;
    }

    try {
      await onAdd(title); // 입력한 그대로 넘긴다
      setTitle("");
      setMessage(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : ERROR_MESSAGES.INTERNAL_ERROR);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mb-4">
      <div className="flex gap-2">
        <label htmlFor="todo-title" className="sr-only">
          할 일
        </label>
        <input
          id="todo-title"
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="할 일을 입력하세요"
          className="min-w-0 flex-1 rounded border border-gray-300 px-3 py-2"
        />
        <button type="submit" className="shrink-0 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
          추가
        </button>
      </div>
      {message && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {message}
        </p>
      )}
    </form>
  );
}
