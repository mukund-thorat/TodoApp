import { clearButtonLoading, error_widget, fetchWithAuth, initOtpInputs, readOtp, setButtonLoading } from "/static/utils/utils.js";

const form = document.getElementById('delete-form');

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;
    const submitBtn = document.getElementById("submit-btn");
    setButtonLoading(submitBtn, "Generating OTP");
    const response = await fetchWithAuth('/user/delete_account/verify_password', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    if (!response.ok) {
        clearButtonLoading(submitBtn, "Verify & Generate OTP");
        submitBtn.insertAdjacentHTML(
            "beforebegin",
            error_widget("Login failed: " + (result.message || "Unknown error"))
        );
        return;
    }
    if (response.status === 201 && result.code === "Created") {
        document.body.innerHTML = `
<form id="otp-form">
    <div class="shadow-box">
        <h1>Delete Account</h1>
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
        <button id="submit-btn" type="submit" class="primary-btn">Verify & Delete</button>
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

            const response = await fetchWithAuth('/user/delete_account/otp/verify', {
                method: 'POST',
                body: JSON.stringify({ otp }),
            });

            const result = await response.json();

            if (response.status === 200 && result.code === "Acknowledged") {
                sessionStorage.removeItem("access_token")
                const button = document.getElementById("submit-btn");
                button.remove()
                const fields = document.querySelector(".fields");
                fields.innerHTML = `<p id="msg">Your <span style="color: #19B240 !important">${email}</span> account has been successfully deleted.</p>
                <a href="/login">Login Here!</a>`;
            } else {
                alert("OTP verification failed!");
            }
        });
    }
});
