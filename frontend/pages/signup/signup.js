const registerForm = document.getElementById('sign-up-form');

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstname = document.getElementById("firstname").value.trim();
    const lastname = document.getElementById("lastname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const cpassword = document.getElementById("cpassword").value.trim();


    if (password !== cpassword) {
        alert("Passwords do not match!");
        return;
    }

    localStorage.setItem("signupData", JSON.stringify({
        firstname,
        lastname,
        email,
        password
    }));

    window.location.href = "/pick_avatar";
});
