import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoItem from "./TodoItem";
import type { Todo } from "@/types/todo";

const ID = "3f2b8c1e-9a4d-4e7b-b5c2-1d0e6f8a9b3c";

function makeTodo(done: boolean): Todo {
  return { id: ID, title: "장보기", done, createdAt: "2026-10-23T05:30:00.000Z" };
}

// TEST_CASES.md 2장 - TodoItem
describe("TodoItem", () => {
  test("UI-10 미완료 할 일: 체크박스 비어 있음, 제목·삭제 버튼 보임", () => {
    render(<TodoItem todo={makeTodo(false)} onToggle={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByRole("checkbox", { name: "장보기" })).not.toBeChecked();
    expect(screen.getByText("장보기")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "장보기 삭제" })).toHaveTextContent("삭제");
  });

  test("UI-11 미완료 할 일 체크 → onToggle(id, true)", async () => {
    const onToggle = jest.fn();
    render(<TodoItem todo={makeTodo(false)} onToggle={onToggle} onDelete={jest.fn()} />);

    await userEvent.click(screen.getByRole("checkbox", { name: "장보기" }));

    expect(onToggle).toHaveBeenCalledWith(ID, true);
  });

  test("UI-12 완료 할 일 체크 → onToggle(id, false)", async () => {
    const onToggle = jest.fn();
    render(<TodoItem todo={makeTodo(true)} onToggle={onToggle} onDelete={jest.fn()} />);

    await userEvent.click(screen.getByRole("checkbox", { name: "장보기" }));

    expect(onToggle).toHaveBeenCalledWith(ID, false);
  });

  test("UI-13 완료 할 일: 체크박스 체크됨, 제목에 취소선", () => {
    render(<TodoItem todo={makeTodo(true)} onToggle={jest.fn()} onDelete={jest.fn()} />);

    expect(screen.getByRole("checkbox", { name: "장보기" })).toBeChecked();
    expect(screen.getByText("장보기")).toHaveClass("line-through");
  });

  test("UI-14 삭제 클릭 → 확인창 없이 onDelete(id)", async () => {
    const onDelete = jest.fn();
    const confirmSpy = jest.spyOn(window, "confirm");
    render(<TodoItem todo={makeTodo(false)} onToggle={jest.fn()} onDelete={onDelete} />);

    await userEvent.click(screen.getByRole("button", { name: "장보기 삭제" }));

    expect(onDelete).toHaveBeenCalledWith(ID);
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});
