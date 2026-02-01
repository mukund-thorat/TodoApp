import { fetchWithAuth } from "/static/utils/utils.js";

const add_button = document.getElementById("add-todo-btn");
const popup = document.getElementById("todo-add-popup");
const popupBox = document.querySelector(".todo-add-box");
const addForm = document.getElementById("todo-add-form");

add_button.addEventListener("click", () => {
    popup.style.display = "flex";
})

popup.addEventListener("click", (e) => {
    if (!popupBox.contains(e.target)) {
        popup.style.display = "none";
    }
});

addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const response = await fetchWithAuth("/todos/create", {
    method: "POST",
    body: JSON.stringify({
      title: addForm.title.value,
      dueDate: addForm.dueDate.value,
      priority: Number.parseInt(addForm.priority.value),
      isActive: true,
    }),
  });

  if (response?.ok) {
    popup.style.display = "none";
    addForm.reset();
  } else {
    console.error("Failed to add todo");
  }
});