"use client";

import { useEffect, useState } from "react";
import TodoForm from "@/components/TodoForm";
import TodoList from "@/components/TodoList";
import { ERROR_MESSAGES } from "@/lib/errors";
import { validateTitle } from "@/lib/validation";
import type { Todo } from "@/types/todo";

// v0.1: 데이터는 브라우저 localStorage에 저장한다
const STORAGE_KEY = "todos";

function loadTodos(): Todo[] {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved) as Todo[];
  } catch {
    return []; // 저장된 글자가 깨졌으면 빈 목록으로 시작
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 할 일 목록 페이지. 데이터는 이 페이지만 가진다
export default function TodoPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage는 브라우저에만 있으므로 화면이 그려진 뒤에 읽는다
  useEffect(() => {
    setTodos(loadTodos());
    setLoading(false);
  }, []);

  // 바뀐 목록을 화면과 localStorage에 함께 반영
  function update(next: Todo[]) {
    setTodos(next);
    saveTodos(next);
  }

  async function handleAdd(title: string) {
    const result = validateTitle(title);
    if (!result.ok) {
      throw new Error(ERROR_MESSAGES[result.code]);
    }
    const todo: Todo = {
      id: crypto.randomUUID(),
      title: result.value, // 앞뒤 공백을 지운 제목
      done: false,
      createdAt: new Date().toISOString(),
    };
    update([todo, ...todos]); // 최신순이므로 맨 앞에 넣는다
    setError(null);
  }

  function handleToggle(id: string, done: boolean) {
    if (!todos.some((todo) => todo.id === id)) {
      setError(ERROR_MESSAGES.TODO_NOT_FOUND);
      return;
    }
    // 그 항목만 바꾸고 순서는 그대로 둔다
    update(todos.map((todo) => (todo.id === id ? { ...todo, done } : todo)));
    setError(null);
  }

  function handleDelete(id: string) {
    if (!todos.some((todo) => todo.id === id)) {
      setError(ERROR_MESSAGES.TODO_NOT_FOUND);
      return;
    }
    update(todos.filter((todo) => todo.id !== id));
    setError(null);
  }

  return (
    <main className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold">할 일 목록</h1>
      <TodoForm onAdd={handleAdd} />
      {error && (
        <p role="alert" className="mb-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {loading ? (
        <p className="py-4 text-center text-gray-500">불러오는 중...</p>
      ) : (
        <TodoList todos={todos} onToggle={handleToggle} onDelete={handleDelete} />
      )}
    </main>
  );
}
