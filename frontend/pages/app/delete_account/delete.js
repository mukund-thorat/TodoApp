import { fetchWithAuth } from "/static/utils/utils.js";

const form = document.getElementById('delete-form');

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.email.value;
    const password = form.password.value;
    const submitBtn = document.getElementById("submit-btn");
    submitBtn.disabled = true;
    const spinner = submitBtn.querySelector(".spinner");
    const btnText = submitBtn.querySelector(".btn-text");
    btnText.textContent = "Generating OTP";
    spinner.classList.remove("hide");
    const response = await fetchWithAuth('/auth/delete/verify_password', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (response.ok && result === true) {
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
        <button type="submit" class="primary-btn">Verify & Delete</button>
    </div>
</form>
<script src="/static/pages/otp/inputs.js" defer></script>
`;

        const otpForm = document.getElementById("otp-form");
        const inputs = document.querySelectorAll('.otp-input');

        inputs.forEach((input, index) => {
            // Handle input
            input.addEventListener('input', (e) => {
                // Check if input is a number
                if (!/^[0-9]$/.test(e.data) && e.inputType !== 'deleteContentBackward') {
                    input.value = ''; // clear invalid input
                    return;
                }

                if (e.data && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            // Handle backspace/navigation
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace') {
                    if (input.value === '' && index > 0) {
                        inputs[index - 1].focus();
                    }
                } else if (e.key === 'ArrowLeft' && index > 0) {
                    inputs[index - 1].focus();
                } else if (e.key === 'ArrowRight' && index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            });

            // Handle paste
            input.addEventListener('paste', (e) => {
                e.preventDefault();
                const pasteData = e.clipboardData.getData('text').replace(/[^0-9]/g, ''); // only numbers

                if (pasteData) {
                    const chars = pasteData.split('');
                    let currentIndex = index;

                    chars.forEach(char => {
                        if (currentIndex < inputs.length) {
                            inputs[currentIndex].value = char;
                            currentIndex++;
                        }
                    });

                    // Focus the next empty input or the last one
                    if (currentIndex < inputs.length) {
                        inputs[currentIndex].focus();
                    } else {
                        inputs[inputs.length - 1].focus();
                    }
                }
            });
        });
        otpForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const otpInputs = document.querySelectorAll('.otp-input');
            let otp = "";

            otpInputs.forEach(input => otp += input.value);

            if (otp.length !== 6) {
                alert("Enter full 6-digit OTP");
                return;
            }

            const response = await fetchWithAuth('/auth/delete/verify_otp', {
                method: 'POST',
                body: JSON.stringify({ email, otp }),
            });

            const result = await response.json();

            if (response.ok && result === true) {
                document.querySelector(".primary-btn").remove()
                const fields = document.querySelector(".fields");
                fields.innerHTML = `<p id="msg">Your <span style="color: #19B240 !important">${email}</span> account has been successfully deleted.</p>`;
            } else {
                alert("OTP verification failed!");
            }
        });
    }
});
