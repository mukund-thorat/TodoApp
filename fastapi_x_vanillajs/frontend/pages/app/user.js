import { logout } from "/static/utils/utils.js";

const logoutBtn = document.getElementById("logout-btn");

logoutBtn.addEventListener("click", async () => {
    await logout();
})
