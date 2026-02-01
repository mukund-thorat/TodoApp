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

    if (response.ok && result) {
        console.log(result);
        if (!result['access_token']) {
            alert("Exception occurred with login token");
            return;
        }

        sessionStorage.setItem("access_token", result['access_token']);
        window.location.href = "/app";
    }
})