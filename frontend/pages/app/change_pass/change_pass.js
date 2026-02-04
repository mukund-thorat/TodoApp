import { fetchWithAuth, initOtpInputs, logout, readOtp, setButtonLoading } from "/static/utils/utils.js";

const form = document.getElementById('change-pass-form');

async function getEmail() {
    const response = await fetchWithAuth('/user/email', {
        method: 'GET',
    });
    const result = await response.json();
    if (response.ok) {
        return result.email;
    } else {
        alert("Failed to fetch user email");
        throw new Error("Failed to fetch user email");
    }
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = await getEmail();
    const oldPassword = form['old-password'].value;
    const newPassword = form['password'].value;
    const confirmPassword = form['confirm-password'].value;

    if (newPassword!== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const submitBtn = document.getElementById("submit-btn");
    setButtonLoading(submitBtn, "Generating OTP");
    const response = await fetchWithAuth('/user/change_password/verify_password', {
        method: 'POST',
        body: JSON.stringify({ email: email, password: oldPassword}),
    });

    const result = await response.json();
    console.log(result);
    if (response.status === 201 && result.code === "Created") {
        document.body.innerHTML = `
<form id="otp-form">
    <div class="shadow-box">
        <h1>Change Password</h1>
        <section class="fields">
            <div class="otp-field">
                <p id="msg">OTP sent to ${email}</p>
                <div class="otp-container">
                    <input type="text" maxlength="1" class="otp-input" inputmode="numeric" required>
                    <input type="text" maxlength="1" class="otp-input" inputmode="numeric" required>
                    <input type="text" maxlength="1" class="otp-input" inputmode="numeric" required>
                    <input type="text" maxlength="1" class="otp-input" inputmode="numeric" required>
                    <input type="text" maxlength="1" class="otp-input" inputmode="numeric" required>
                    <input type="text" maxlength="1" class="otp-input" inputmode="numeric" required>
                </div>
            </div>
        </section>
        <button id="submit-btn" type="submit" class="primary-btn">Verify & change</button>
    </div>
</form>
`;

        const otpForm = document.getElementById("otp-form");
        initOtpInputs();
        otpForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const otp = readOtp();

            if (otp.length !== 6) {
                alert("Enter full 6-digit OTP");
                return;
            }

            const response = await fetchWithAuth('/user/change_password/otp/verify', {
                method: 'POST',
                body: JSON.stringify({ newPassword: newPassword, otp: otp }),
            });

            const result = await response.json();

            if (response.status === 200 && result.code === "Updated") {
                const button = document.getElementById("submit-btn");
                button.remove()
                const fields = document.querySelector(".fields");
                fields.innerHTML = `<p id="msg">Your Password has been successfully changed.</p>
                <button class="nav-btn"><a class="url" href="/app">Goto App</a></button>
                <button class="nav-btn" id="logout-btn"><a class="url">Re-Login</a></button>`;
            } else {
                alert("OTP verification failed!");
            }
        });

        const logoutBtn = document.getElementById("logout-btn");
        logoutBtn.addEventListener("click", async () => {
            await logout();
        });
    }
});
