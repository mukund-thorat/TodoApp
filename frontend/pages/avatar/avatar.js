const avatars = document.querySelectorAll(".avatar");
let selectedAvatar = null;

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

    console.log("Selected avatar:", selectedAvatar);


    localStorage.setItem("picked_avatar", selectedAvatar);

    window.location.href = "/verify_otp";
});
