import TodoRadioButton from "./RadioButton.tsx";
import {useMutation} from "@tanstack/react-query";
import {remTodo, setTodo} from "../api/active-todos.ts";
import {useState} from "react";
import Button from "./Button.tsx";
import {type todoModel, todoObject} from "../entities/todo.ts";

type Priority = 1 | 2 | 3 | 4;

interface TodoProps {
    id: string;
    title: string;
    checked: boolean;
    dueDate: Date;
    priority: Priority;
    refetch: () => void;
}

interface EditTodoProps {
    id: string;
    title: string;
    dueDate: Date;
    priority: Priority;
    checked: boolean;
    cancelCallback: () => void;
    refetch: () => void;
}

function toInputDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function EditableTodo({ id, title, dueDate, checked, priority, refetch, cancelCallback }: EditTodoProps) {
    const [input, setInput] = useState<string>(title);
    const [dueDateInput, setDueDateInput] = useState<string>(() => toInputDate(dueDate));
    const [priorityInput, setPriorityInput] = useState<Priority>(priority);

    const {mutateAsync} = useMutation({
        mutationFn: async (todo: todoModel) => setTodo(todo),
    });

    return (
        <div className="flex flex-col justify-between items-start gap-6 rounded-2xl border border-quaternary px-4 py-6 w-150">
            <div className="w-full flex flex-col gap-2 items-start">
                <input autoFocus={true} className="w-full p-2 text-xl font-semibold outline-0" value={input} type="text"
                    onChange={(e) => setInput(e.target.value)}
                />
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 text-[#404040] p-2 rounded-md border border-quaternary">
                        <input
                            className="bg-transparent outline-0"
                            type="date"
                            value={dueDateInput}
                            onChange={(e) => setDueDateInput(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-[#404040] p-2 rounded-md border border-quaternary">
                        <img width="20px" src="src/assets/images/priority.svg" alt="priority"/>
                        <select
                            className="bg-transparent outline-0"
                            value={priorityInput}
                            onChange={(e) => setPriorityInput(Number(e.target.value) as Priority)}
                        >
                            <option value={1}>P1</option>
                            <option value={2}>P2</option>
                            <option value={3}>P3</option>
                            <option value={4}>P4</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex justify-end gap-2 w-full">
                <Button
                    onClick={cancelCallback}
                    className="w-25" variant="secondary" size="s">Cancel</Button>
                <Button
                    onClick={async () => {
                        const rawTodo = {
                            id: id,
                            title: input,
                            priority: priorityInput,
                            isActive: checked,
                            dueDate: dueDateInput,
                        }
                        const todo = todoObject.parse(rawTodo);
                        await mutateAsync(todo)
                        refetch()
                        cancelCallback()
                    }}
                    className="w-25" size="s">Edit</Button>
            </div>
        </div>
    );
}

export default function Todo({ id, title, checked, dueDate, refetch, priority = 4 }: TodoProps){
    const remMutation = useMutation({
        mutationFn: async (todoId: string) => remTodo(todoId),
    });

    const [editable, setEditable] = useState<boolean>(false);
    const formattedDueDate = dueDate.toLocaleDateString();

    return editable ? (
        <EditableTodo
            id={id}
            title={title}
            priority={priority}
            checked={checked}
            dueDate={dueDate}
            refetch={refetch}
            cancelCallback={() => setEditable(false)}
        />
    ) : (
        <div className="group flex justify-between items-center gap-6 border-b border-quaternary px-4 py-6 w-150">
            <div className="flex items-center gap-6">
                <TodoRadioButton refetch={refetch} mark={!checked} priority={priority} todoId={id} />
                <div className="flex flex-col gap-2 items-start">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <div className="flex items-center gap-2 text-[#404040]">
                        <img width="24px" src="src/assets/images/calendar.svg" alt="calendar"/>
                        <p>{formattedDueDate}</p>
                    </div>
                </div>
            </div>
            <div className="hidden items-center gap-2 group-hover:flex">
                <img
                    onClick={async () => {
                        setEditable(true);
                    }}
                    className="p-2 hover:bg-secondary rounded-lg" src="src/assets/images/edit.svg" alt="edit"/>
                <img
                    onClick={async () => {
                        await remMutation.mutateAsync(id);
                        refetch();
                    }}
                    className="p-2 hover:bg-secondary rounded-lg" src="src/assets/images/trash.svg" alt="remove"/>
            </div>
        </div>
    );
}
