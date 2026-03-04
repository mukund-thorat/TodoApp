import {type todoModel, todoObject} from "../entities/todo.ts";
import {fetchWithAuth} from "./protected-request.ts";
import {apiUrl} from "./config.ts";

export async function getActiveTodos(): Promise<todoModel[]> {
    const response = await fetchWithAuth("http://localhost:8000/todos/active", {
        method: "GET",
    })

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    const data: unknown = await response.json();
    if (!Array.isArray(data)) {
        throw new Error("Invalid todos response");
    }

    return data.map((item) => todoObject.parse(item));
}

export async function setTodoStatus(todoId: string, status: boolean){
    const response = await fetchWithAuth(apiUrl(`/todos/update_status/${todoId}?status=${status}`), {
        method: "PUT",
    })

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

export async function setTodo(todo: todoModel){
    const response = await fetchWithAuth(apiUrl("/todos/bulk_update"), {
        method: "PUT",
        body: JSON.stringify(todo),
        headers: {
            "Content-Type": "application/json",
        }
    })

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

export async function remTodo(todoId: string){
    const response = await fetchWithAuth(apiUrl(`/todos/remove/${todoId}`), {
        method: "DELETE",
    })

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}

export async function createTodo(todo: Omit<todoModel, "id">){
    const response = await fetchWithAuth(apiUrl("/todos/create"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo)
    })

    if (!response.ok) {
        throw new Error(response.statusText);
    }

    return await response.json();
}
