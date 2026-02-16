const avatars = document.querySelectorAll(".avatar");
let selectedAvatar = null;

const params = new URLSearchParams(window.location.search);
const emailFromQuery = params.get("email");

if (emailFromQuery) {
    sessionStorage.setItem("email", emailFromQuery);
}

avatars.forEach((avatar) => {
    avatar.addEventListener("click", () => {
        avatars.forEach(a => a.classList.remove("selected"));
        avatar.classList.add("selected");
        selectedAvatar = avatar.src;
    });
});

document.getElementById("doneBtn").addEventListener("click", () => {
    if (!selectedAvatar) {
        alert("Please select an avatar first!");
        return;
    }

    sessionStorage.setItem("picked_avatar", selectedAvatar);

    window.location.href = "/verify_otp";
});
