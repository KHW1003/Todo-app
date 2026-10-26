import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoForm from "./TodoForm";

// 입력창에 글자 넣기. 긴 글자와 이모지는 붙여넣기로 넣는다
async function fillTitle(text: string) {
  const input = screen.getByRole("textbox", { name: "할 일" });
  await userEvent.click(input);
  await userEvent.paste(text);
  return input;
}

// TEST_CASES.md 2장 - TodoForm
describe("TodoForm", () => {
  test("UI-01 '장보기' 입력 후 추가 클릭 → onAdd 호출, 입력창 비움", async () => {
    const onAdd = jest.fn().mockResolvedValue(undefined);
    render(<TodoForm onAdd={onAdd} />);

    const input = await fillTitle("장보기");
    await userEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(onAdd).toHaveBeenCalledWith("장보기");
    expect(input).toHaveValue("");
  });

  test("UI-02 '장보기' 입력 후 엔터 → onAdd 호출, 입력창 비움", async () => {
    const onAdd = jest.fn().mockResolvedValue(undefined);
    render(<TodoForm onAdd={onAdd} />);

    const input = await fillTitle("장보기");
    await userEvent.keyboard("{Enter}");

    expect(onAdd).toHaveBeenCalledWith("장보기");
    expect(input).toHaveValue("");
  });

  test("UI-03 빈 칸으로 추가 → onAdd 안 부름, '제목을 입력해 주세요'", async () => {
    const onAdd = jest.fn().mockResolvedValue(undefined);
    render(<TodoForm onAdd={onAdd} />);

    await userEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("제목을 입력해 주세요");
  });

  test("UI-04 공백만 입력 후 추가 → onAdd 안 부름, '제목을 입력해 주세요'", async () => {
    const onAdd = jest.fn().mockResolvedValue(undefined);
    render(<TodoForm onAdd={onAdd} />);

    await fillTitle("   ");
    await userEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("제목을 입력해 주세요");
  });

  test("UI-05 101자 입력 후 추가 → onAdd 안 부름, '제목은 100자 이하로 입력해 주세요'", async () => {
    const onAdd = jest.fn().mockResolvedValue(undefined);
    render(<TodoForm onAdd={onAdd} />);

    await fillTitle("가".repeat(101));
    await userEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(onAdd).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("제목은 100자 이하로 입력해 주세요");
  });

  test("UI-06 👍 100개 입력 후 추가 → onAdd 호출", async () => {
    const onAdd = jest.fn().mockResolvedValue(undefined);
    render(<TodoForm onAdd={onAdd} />);

    await fillTitle("👍".repeat(100));
    await userEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(onAdd).toHaveBeenCalledWith("👍".repeat(100));
  });

  test("UI-07 onAdd가 오류를 던짐 → 입력창 아래에 문구 표시", async () => {
    const onAdd = jest.fn().mockRejectedValue(new Error("서버에 연결할 수 없습니다"));
    render(<TodoForm onAdd={onAdd} />);

    await fillTitle("장보기");
    await userEvent.click(screen.getByRole("button", { name: "추가" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("서버에 연결할 수 없습니다");
  });
});
