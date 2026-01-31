document.addEventListener('DOMContentLoaded', async () => {
    let signup_data;
    let avatar_url;
    try {
        signup_data = JSON.parse(localStorage.getItem("signupData"))
        avatar_url = localStorage.getItem("picked_avatar")
    } catch (error) {
        prompt('Unauthorized access');
    }

    if (signup_data === null || signup_data === undefined || avatar_url === null || avatar_url === undefined) {
        prompt('Unauthorized access');
    }

    const {firstname, lastname, email, password} = signup_data;
    const avatar = avatar_url;

    try{
        const response = await fetch("/auth/otp/request", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                firstName: firstname,
                lastName: lastname,
                email: email,
                avatar: avatar,
                password: password,
            })
        })

        const result = await response.json();
        if (response.ok || result.status === "SUCCESS") {
            const otp_msg = document.getElementById("otp-info")
            otp_msg.innerHTML = `Successfully sent OTP to ${email}`;
            const otp_form = document.getElementById("otp-form");
            otp_form.style.display = "flex";
        }
    } catch (error) {
        console.error(error);
    }
})
