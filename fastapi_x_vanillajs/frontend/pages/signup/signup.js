const registerForm = document.getElementById('sign-up-form');

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const cPassword = document.getElementById("c_password").value.trim();


    if (password !== cPassword) {
        alert("Passwords do not match!");
        return;
    }

    const response = await fetch("/auth/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            firstName: firstname,
            lastName: lastname,
            email: email,
            password: password,
            avatar: null
        })
    })

    const result = await response.json();

    if (response.status === 202 && result) {
        sessionStorage.setItem("email", email);
        window.location.href = "/pick_avatar";
    } else {
        alert("Something went wrong!");
    }
});
