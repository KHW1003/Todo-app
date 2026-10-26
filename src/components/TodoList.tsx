import type { Todo } from "@/types/todo";
import TodoItem from "./TodoItem";

type TodoListProps = {
  todos: Todo[]; // 이미 최신순으로 정렬된 목록
  onToggle: (id: string, done: boolean) => void;
  onDelete: (id: string) => void;
};

// 받은 순서대로 목록을 보여준다. 정렬은 하지 않는다
export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <p className="py-4 text-center text-gray-500">할 일이 없습니다</p>;
  }

  return (
    <ul className="divide-y divide-gray-200">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
