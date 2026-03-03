import {useEffect, useState} from "react";
import {useMutation} from "@tanstack/react-query";
import {setTodoStatus} from "../api/active-todos.ts";

type Priority = 1 | 2 | 3 | 4;

interface TodoRadioProps {
    todoId: string;
    priority: Priority;
    refetch: () => void;
    name?: string;
    mark?: boolean;
}

interface SetTodoStatusVariables {
    todoId: string;
    status: boolean;
}

function TodoRadioButton({
    todoId,
    priority,
    refetch,
    mark = false,
    name,
}: TodoRadioProps) {
        const {mutateAsync} = useMutation({
        mutationFn: async ({todoId, status}: SetTodoStatusVariables) => await setTodoStatus(todoId, !status),
    });
    const [checked, setCheck] = useState<boolean>(mark);

    useEffect(() => {
        setCheck(mark);
    }, [mark]);

    const borderColorMap: Record<Priority, string> = {
        1: "border-radio-p1-p",
        2: "border-radio-p2-p",
        3: "border-radio-p3-p",
        4: "border-radio-p4-p",
    };
    const bgColorMap: Record<Priority, string> = {
        1: "bg-radio-p1-s",
        2: "bg-radio-p2-s",
        3: "bg-radio-p3-s",
        4: "bg-radio-p4-s",
    };

    const borderColor = borderColorMap[priority];
    const bgColor = bgColorMap[priority];

    return (
        <label className={`group flex items-center justify-center ${checked ? "cursor-not-allowed" : "cursor-pointer"}`}>
            <input
                className="peer sr-only"
                type="checkbox"
                name={name}
                disabled={checked}
                onChange={async (e) => {
                    await mutateAsync({todoId, status: e.target.checked});
                    refetch()
                }}
                checked={checked}
            />
            <span className={`w-8 h-8 border-4 ${borderColor} ${bgColor} rounded-full inline-block relative group-hover:[&>span]:opacity-100 peer-checked:[&>span]:opacity-100 ${checked ? "opacity-60" : ""}`}>
                <span className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-150">
                    <span className="mb-0.5 h-3 w-1.5 rotate-45 border-b-2 border-r-2 border-white"></span>
                </span>
            </span>
        </label>
    );
}

export default TodoRadioButton;
