import { render, screen } from "@testing-library/react";
import TodoList from "./TodoList";
import type { Todo } from "@/types/todo";

function makeTodo(id: string, title: string): Todo {
  return { id, title, done: false, createdAt: "2026-10-23T05:30:00.000Z" };
}

// TEST_CASES.md 2장 - TodoList
describe("TodoList", () => {
  test("UI-08 빈 배열 → '할 일이 없습니다'", () => {
    render(<TodoList todos={[]} onToggle={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByText("할 일이 없습니다")).toBeInTheDocument();
  });

  test("UI-09 3개 → 받은 순서대로 표시, 빈 목록 문구 없음", () => {
    const todos = [makeTodo("id-3", "셋"), makeTodo("id-2", "둘"), makeTodo("id-1", "하나")];
    render(<TodoList todos={todos} onToggle={jest.fn()} onDelete={jest.fn()} />);

    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.textContent?.replace("삭제", ""))).toEqual(["셋", "둘", "하나"]);
    expect(screen.queryByText("할 일이 없습니다")).not.toBeInTheDocument();
  });
});
