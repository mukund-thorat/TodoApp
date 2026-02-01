import { loadTodos } from "/static/pages/app/todo.js";
import { fetchWithAuth } from "/static/utils/utils.js";

const todosContainer = document.getElementById("todos-box");

const active_btn = document.getElementById("active-tab-btn");
const completed_btn = document.getElementById("completed-tab-btn");

let inactive_todos_list = []

active_btn.addEventListener("click", async () => {
    await loadTodos();
    active_btn.classList.add("selected-tab");
    completed_btn.classList.remove("selected-tab");
});

completed_btn.addEventListener("click", async () => {
    await loadInActiveTodos();
    completed_btn.classList.add("selected-tab");
    active_btn.classList.remove("selected-tab");
});

async function loadInActiveTodos() {
    const response = await fetchWithAuth("/todos/inactive_todos", {
        method: "GET",
    });

    inactive_todos_list = await response.json();
    let todo_item_html = "";

    if (response?.ok) {
        inactive_todos_list.forEach(todo => {
            todo_item_html += `
            <div class="todo-item" data-id="${todo.id}">
                <div class="todo-data">
                    <label class="custom-radio">
                        <input type="radio" name="todo${todo.id}" checked>
                        <span class="radio-ui"></span>
                    </label>

                    <h3 class="todo-priority">P${todo.priority}</h3>
                    <h3 class="todo-title"><del>${todo.title}</del></h3>
                </div>
                <div class="action-btn">
                    <button class="edit-todo-btn"><img src="/static/static/edit.svg" alt="Edit"></button>
                    <button class="delete-todo-btn"><img src="/static/static/trash.svg" alt="Delete"></button>
                </div>
            </div>`;
        });

        todosContainer.innerHTML = todo_item_html;
    }
}

