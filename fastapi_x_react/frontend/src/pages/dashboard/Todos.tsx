import Todo from "../../components/Todo.tsx";
import {useMutation, useQuery} from "@tanstack/react-query";
import {createTodo, getActiveTodos} from "../../api/active-todos.ts";
import Popup from "../../components/Popup.tsx";
import {useState} from "react";
import TextInput from "../../components/TextInput.tsx";
import Button from "../../components/Button.tsx";
import {type todoModel, todoObject} from "../../entities/todo.ts";


function Todos(){
    const {data, isError, isLoading, refetch} = useQuery({
        queryKey: ["todos"],
        queryFn: getActiveTodos,
        select: (todos) => [...todos].sort((a, b) => {
            const priorityA = Math.min(4, Math.max(1, a.priority));
            const priorityB = Math.min(4, Math.max(1, b.priority));

            if (priorityA !== priorityB) return priorityA - priorityB;

            const dueA = new Date(a.dueDate).getTime();
            const dueB = new Date(b.dueDate).getTime();
            return dueA - dueB;
        }),
        staleTime: Infinity,
        refetchOnWindowFocus: false
    });

    const [isOpen, setIsOpen] = useState<boolean>(false);

    if (isLoading)
        return <div>Loading...</div>;

    if (isError)
        return <div>Something went wrong.</div>;

    return (
        <div className="mt-25 flex flex-col gap-10 items-center justify-center">
            <div className="flex flex-col gap-2 items-center justify-center">
                {data?.map((todo, index) => (
                    <Todo
                        id={todo.id}
                        checked={todo.isActive}
                        key={`${todo.title}-${index}`}
                        priority={Math.min(4, Math.max(1, Math.round(todo.priority))) as 1 | 2 | 3 | 4}
                        dueDate={todo.dueDate}
                        title={todo.title}
                    />
                ))}
            </div>
            <button
                onClick={() => setIsOpen(true)}
                className="p-2 hover:text-tertiary cursor-pointer font-semibold rounded"
            >+ Add Task</button>
            <CreatePopup isOpen={isOpen} setIsOpen={setIsOpen} refetch={refetch} />
        </div>
    )
}

interface CreatePopupProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    refetch: () => void;
}

function toInputDate(date: Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function CreatePopup({isOpen, setIsOpen, refetch}: CreatePopupProps) {
    const {mutateAsync} = useMutation({
        mutationFn: (todo: Omit<todoModel, "id">) => createTodo(todo)
    })

    const [task, setTask] = useState<string>("");
    const [dueDate, setDueDate] = useState<string>(() => toInputDate(new Date()));
    const [priority, setPriority] = useState(4);

    return (
        <Popup isOpen={isOpen}>
            <h1 className="text-xl font-semibold">Create Todo</h1>
            <div className="flex flex-col gap-3 items-center">
                <TextInput
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Task name"
                />
                <div className="flex gap-2">
                    <div className="flex items-center gap-2 text-[#404040] p-2 rounded-md border border-quaternary">
                        <input
                            className="bg-transparent outline-0"
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 text-[#404040] p-2 rounded-md border border-quaternary">
                        <img width="20px" src="src/assets/images/priority.svg" alt="priority"/>
                        <select
                            className="bg-transparent outline-0"
                            value={priority}
                            onChange={(e) => setPriority(Number(e.target.value))}
                        >
                            <option value={1}>P1</option>
                            <option value={2}>P2</option>
                            <option value={3}>P3</option>
                            <option value={4}>P4</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="flex gap-2">
                <Button className="w-25" size="s" variant="secondary" onClick={() => {setIsOpen(false)}} children="Cancel"/>
                <Button className="w-25" size="s" onClick={async ()=> {
                    const rawModel = {
                        title: task,
                        dueDate: dueDate,
                        priority: priority,
                        isActive: true,
                    }

                    const todo = todoObject.omit({id: true}).parse(rawModel);
                    await mutateAsync(todo)
                    setTask("");
                    setPriority(4);
                    setDueDate(toInputDate(new Date()));
                    setIsOpen(false);
                    refetch();
                }} children="Create"/>
            </div>
        </Popup>
    )
}

export default Todos;
