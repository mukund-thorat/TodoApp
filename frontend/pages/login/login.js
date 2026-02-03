import { warning_widget, error_widget } from "/static/utils/utils.js";
const loginForm = document.getElementById("login-form")

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch("/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString()
    })

    const result = await response.json();
    console.log(response);
    console.log(result);
    if (response.ok && result) {
        if (!result['access_token']) {
            const submitBtn = document.getElementById("submit-btn");
            submitBtn.insertAdjacentHTML(
                "beforebegin",
                error_widget("Login failed: No access token received")
            );
            return;
        }

        sessionStorage.setItem("access_token", result['access_token']);
        window.location.href = "/app";
    } else {
        const submitBtn = document.getElementById("submit-btn");
        submitBtn.insertAdjacentHTML(
            "beforebegin",
            error_widget("Login failed: " + (result.detail || "Unknown error"))
        );
    }
})