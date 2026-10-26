import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TodoPage from "./page";

// 할 일 추가: 입력 후 "추가" 클릭. 입력창이 비워지면 추가가 끝난 것
async function addTodo(title: string) {
  const input = screen.getByRole("textbox", { name: "할 일" });
  await userEvent.type(input, title);
  await userEvent.click(screen.getByRole("button", { name: "추가" }));
  await waitFor(() => expect(input).toHaveValue(""));
}

// 화면에 보이는 제목을 위에서부터 차례로
function visibleTitles() {
  return screen.getAllByRole("listitem").map((li) => within(li).getByRole("checkbox").closest("label")?.textContent);
}

// 화면을 닫았다가 다시 연다 (새로고침 흉내)
async function reload(unmount: () => void) {
  unmount();
  render(<TodoPage />);
  await screen.findByRole("heading", { name: "할 일 목록" });
  await screen.findByRole("textbox", { name: "할 일" });
}

beforeEach(() => {
  localStorage.clear();
});

// TEST_CASES.md 2장 - TodoPage (v0.1, localStorage)
describe("TodoPage (v0.1)", () => {
  test("UI-15 localStorage 비어 있음 → '할 일이 없습니다'", async () => {
    render(<TodoPage />);

    expect(await screen.findByText("할 일이 없습니다")).toBeInTheDocument();
  });

  test("UI-16 '하나', '둘', '셋' 차례로 추가 → '셋'이 맨 위, 모두 미완료", async () => {
    render(<TodoPage />);
    await screen.findByText("할 일이 없습니다");

    await addTodo("하나");
    await addTodo("둘");
    await addTodo("셋");

    expect(visibleTitles()).toEqual(["셋", "둘", "하나"]);
    for (const checkbox of screen.getAllByRole("checkbox")) {
      expect(checkbox).not.toBeChecked();
    }
  });

  test("UI-17 같은 제목 두 번 추가 → 두 개 모두 보임", async () => {
    render(<TodoPage />);
    await screen.findByText("할 일이 없습니다");

    await addTodo("장보기");
    await addTodo("장보기");

    expect(screen.getAllByRole("checkbox", { name: "장보기" })).toHaveLength(2);
  });

  test("UI-18 추가 후 다시 그림 → 목록 그대로", async () => {
    const { unmount } = render(<TodoPage />);
    await screen.findByText("할 일이 없습니다");
    await addTodo("하나");
    await addTodo("둘");

    await reload(unmount);

    expect(await screen.findByRole("checkbox", { name: "둘" })).toBeInTheDocument();
    expect(visibleTitles()).toEqual(["둘", "하나"]);
  });

  test("UI-19 체크 후 다시 그림 → 완료 상태·순서 그대로", async () => {
    const { unmount } = render(<TodoPage />);
    await screen.findByText("할 일이 없습니다");
    await addTodo("하나");
    await addTodo("둘");
    await userEvent.click(screen.getByRole("checkbox", { name: "하나" }));

    await reload(unmount);

    expect(await screen.findByRole("checkbox", { name: "하나" })).toBeChecked();
    expect(screen.getByRole("checkbox", { name: "둘" })).not.toBeChecked();
    expect(visibleTitles()).toEqual(["둘", "하나"]);
  });

  test("UI-20 삭제 후 다시 그림 → 지운 할 일이 다시 나타나지 않음", async () => {
    const { unmount } = render(<TodoPage />);
    await screen.findByText("할 일이 없습니다");
    await addTodo("하나");
    await addTodo("둘");
    await userEvent.click(screen.getByRole("button", { name: "하나 삭제" }));

    await reload(unmount);

    expect(await screen.findByRole("checkbox", { name: "둘" })).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "하나" })).not.toBeInTheDocument();
  });
});
