import { fetchWithAuth } from "/static/utils/utils.js";
import { currentTab, getInactiveTodos, setInactiveTodos } from "/static/pages/app/tabs.js";

const todosContainer = document.getElementById("todos-box");
export let todos_list = []

document.addEventListener("DOMContentLoaded", async (e) => {
    e.preventDefault();
    await loadTodos();
})

export async function loadTodos() {
    const response = await fetchWithAuth("/todos/active", {
        method: "GET",
    });

    todos_list = await response.json();
    let todo_item_html = "";

    if (response.status === 200) {
        if (todos_list.length === 0) {
            todosContainer.innerHTML = `<h3 class="no-todos-msg">No active todos. Add some!</h3>`;
            return;
        }
        todos_list.forEach(todo => {
            todo_item_html += `
<div class="todo-item" data-id="${todo.id}">
    <div class="todo-data">
        <label class="custom-radio">
            <input type="radio" name="todo${todo.id}">
            <span class="radio-ui"></span>
        </label>

        <h3 class="todo-priority">P${todo.priority}</h3>
        <h3 class="todo-title" contenteditable="false">${todo.title}</h3>
    </div>
    <div class="action-btn">
        <button class="edit-todo-btn"><img src="/static/assets/edit.svg" alt="Edit"></button>
        <button class="delete-todo-btn"><img src="/static/assets/trash.svg" alt="Delete"></button>
    </div>
</div>`;

        });

        todosContainer.innerHTML = todo_item_html;
    }
}

todosContainer.addEventListener("click", async (e) => {
    const deleteBtn = e.target.closest(".delete-todo-btn");
    if (!deleteBtn) return;

    const todoItem = deleteBtn.closest(".todo-item");
    const todoId = todoItem.dataset.id;

    await delete_todo(todoId);
});

async function delete_todo(id) {
    const response = await fetchWithAuth(`/todos/remove/${id}`, {
        method: "DELETE",
    });

    if (response.status === 200) {
        document.querySelector(`.todo-item[data-id="${id}"]`).remove();

        if (currentTab === "active") {
            todos_list = todos_list.filter(todo => todo.id !== id);
            if (todos_list.length === 0) {
                todosContainer.innerHTML = `<h3 class="no-todos-msg">No active todos. Add some!</h3>`;
            }
        } else {
            const updated = getInactiveTodos().filter(todo => todo.id !== id);
            setInactiveTodos(updated);
            if (updated.length === 0) {
                todosContainer.innerHTML = `<h3 class="no-todos-msg">No completed todos.</h3>`;
            }
        }
    }
}

todosContainer.addEventListener("click", async (e) => {
    const editBtn = e.target.closest(".edit-todo-btn");
    if (!editBtn) return;

    const todoItem = editBtn.closest(".todo-item");
    const todoId = todoItem.dataset.id;
    const titleEl = todoItem.querySelector(".todo-title");

    titleEl.contentEditable = "true";
    titleEl.focus();

    document.execCommand("selectAll", false, null);
    document.getSelection().collapseToEnd();

    const originalTitle = titleEl.textContent;

    function saveIfChanged() {
        titleEl.contentEditable = "false";
        const updatedTitle = titleEl.textContent.trim();

        if (updatedTitle && updatedTitle !== originalTitle) {
            update_title(todoId, updatedTitle);
        } else {
            titleEl.textContent = originalTitle;
        }

        titleEl.removeEventListener("blur", saveIfChanged);
        titleEl.removeEventListener("keydown", keyHandler);
    }

    function keyHandler(ev) {
        if (ev.key === "Enter") {
            ev.preventDefault();
            titleEl.blur();
        }
        if (ev.key === "Escape") {
            titleEl.textContent = originalTitle;
            titleEl.blur();
        }
    }

    titleEl.addEventListener("blur", saveIfChanged);
    titleEl.addEventListener("keydown", keyHandler);
});


async function update_title(id, updated_title) {
    const response = await fetchWithAuth(`/todos/update_title/${id}?updated_title=${encodeURIComponent(updated_title)}`, {
        method: "PUT",
    });

    if (response.status === 200) {
        let todo;
        if (currentTab === "active") {
            todo = todos_list.find(t => t.id === id);
        } else {
            todo = getInactiveTodos().find(t => t.id === id);
        }
        if (todo) todo.title = updated_title;
    }
}

async function todo_marker(id, mark) {
    const response = await fetchWithAuth(`/todos/update_status/${id}?status=${mark}`, {
        method: "PUT",
    });

    if (response.status === 200) {
        document.querySelector(`.todo-item[data-id="${id}"]`).remove();
        if (currentTab === "active") {
            todos_list = todos_list.filter(todo => todo.id !== id);
            if (todos_list.length === 0) {
                todosContainer.innerHTML = `<h3 class="no-todos-msg">No active todos. Add some!</h3>`;
            }
        } else {
            const updated = getInactiveTodos().filter(todo => todo.id !== id);
            setInactiveTodos(updated);
            if (updated.length === 0) {
                todosContainer.innerHTML = `<h3 class="no-todos-msg">No completed todos.</h3>`;
            }
        }
    }
}

todosContainer.addEventListener("change", async (e) => {
    const radio = e.target;
    if (!radio.matches('input[type="radio"]')) return;

    const todoItem = radio.closest(".todo-item");
    const todoId = todoItem.dataset.id;
    const mark = radio.checked;
    await todo_marker(todoId, !mark);
});
