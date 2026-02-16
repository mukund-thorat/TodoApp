import { loadTodos } from "/static/pages/app/todo.js";
import { fetchWithAuth } from "/static/utils/utils.js";

const todosContainer = document.getElementById("todos-box");
const active_btn = document.getElementById("active-tab-btn");
const completed_btn = document.getElementById("completed-tab-btn");

export let currentTab = "active";
export let inactive_todos_list = []

export function setInactiveTodos(list) {
    inactive_todos_list.length = 0;
    inactive_todos_list.push(...list);
}

export function getInactiveTodos() {
    return inactive_todos_list;
}

active_btn.addEventListener("click", async () => {
    await loadTodos();
    currentTab = "active";
    active_btn.classList.add("selected-tab");
    completed_btn.classList.remove("selected-tab");
});

completed_btn.addEventListener("click", async () => {
    completed_btn.classList.add("selected-tab");
    currentTab = "inactive";
    active_btn.classList.remove("selected-tab");
    await loadInActiveTodos();
});

async function loadInActiveTodos() {
    const response = await fetchWithAuth("/todos/inactive", {
        method: "GET",
    });

    const data = await response.json();
    setInactiveTodos(data);
    
    let todo_item_html = "";

    if (response.status === 200) {
        if (inactive_todos_list.length === 0) {
            todosContainer.innerHTML = `<h3 class="no-todos-msg">No active todos. Add some!</h3>`;
            return;
        }
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
                    <button class="edit-todo-btn"><img src="/static/assets/edit.svg" alt="Edit"></button>
                    <button class="delete-todo-btn"><img src="/static/assets/trash.svg" alt="Delete"></button>
                </div>
            </div>`;
        });

        todosContainer.innerHTML = todo_item_html;
    }
}

