import { initOtpInputs, readOtp, setButtonLoading } from "/static/utils/utils.js";

const form = document.getElementById("pass-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value;
    const submitBtn = document.getElementById("submit-btn");
    setButtonLoading(submitBtn, "Generating OTP");
    
    const response = await fetch(`/auth/recovery/otp/request?email=${encodeURIComponent(email)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    const result = await response.json();

    if (response.status === 201 && result.code === 'Created') {
        document.body.innerHTML = `
    <form id="otp-form">
        <div class="shadow-box">
            <h1>Recover Password</h1>
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
            <button type="submit" class="primary-btn">Verify & Delete</button>
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

            const response = await fetch('/auth/recovery/otp/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: email, otp: otp }),
            });

            const result = await response.json();

            if (response.status === 200 && result.recoveryToken) {
                document.body.innerHTML = `
    <form id="new-pass-form">
        <div class="shadow-box">
            <h1>Recover Password</h1>
            <section class="fields">
                <div class="field">
                    <label for="password">New Password</label>
                    <input type="password" name="password" id="password" placeholder="Enter your new password">
                </div>
            </section>
            <button id="submit-btn" type="submit" class="primary-btn">Change Password</button>
        </div>
    </form>
    `;
                const newPassForm = document.getElementById("new-pass-form");
                newPassForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const newPassword = document.getElementById("password").value;
                    const recoveryToken = result['recovery_token'];
                    const response = await fetch('/auth/recovery/change_password', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ recoveryToken: recoveryToken, newPassword: newPassword }),
                    });
                    const result = await response.json();
                    if (response.status === 202 && result.code === 'Updated') {
                        const button = document.getElementById("submit-btn");
                        button.remove()
                        const fields = document.querySelector(".fields");
                        fields.innerHTML = `<p id="msg">Successfully changed password for <span style="color: #19B240 !important">${email}</span> account.</p>`;
                    }
                });
            } else {
                alert("OTP verification failed!");
            }
        });
    }
})
