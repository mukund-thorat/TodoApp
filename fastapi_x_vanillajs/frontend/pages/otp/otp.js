document.addEventListener('DOMContentLoaded', async () => {
    let email;

    try {
        email = sessionStorage.getItem('email');
    } catch (error) {
        prompt('Unauthorized access');
    }

    if (email === null || email === undefined) {
        prompt('Unauthorized access');
    }

    try{
        const response = await fetch(`/auth/otp/request?email=${email}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
        })

        const result = await response.json();
        if (response.ok || result.code === "Created") {
            const otp_msg = document.getElementById("otp-info")
            otp_msg.innerHTML = `Successfully sent OTP to ${email}`;
            const otp_form = document.getElementById("otp-form");
            otp_form.style.display = "flex";
        }
    } catch (error) {
        console.error(error);
    }
})
