import type { Todo } from "@/types/todo";

type TodoItemProps = {
  todo: Todo;
  onToggle: (id: string, done: boolean) => void; // done: 바뀔 값
  onDelete: (id: string) => void;
};

// 할 일 하나: 체크박스 + 제목 + 삭제 버튼
export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="flex items-center gap-2 py-2">
      {/* label로 묶어서 제목을 눌러도 체크된다 */}
      <label className="flex flex-1 items-center gap-2 break-all">
        <input
          type="checkbox"
          checked={todo.done}
          onChange={() => onToggle(todo.id, !todo.done)}
          className="h-4 w-4 shrink-0"
        />
        <span className={todo.done ? "line-through text-gray-400" : ""}>{todo.title}</span>
      </label>
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        aria-label={`${todo.title} 삭제`}
        className="shrink-0 rounded px-2 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        삭제
      </button>
    </li>
  );
}
