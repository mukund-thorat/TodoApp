export async function fetchWithAuth(url, options = {}, callback = null) {
  let accessToken = sessionStorage.getItem("access_token");

  options.headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json"
  };

  if (!accessToken) {
    const refreshed = await refresh_request(options);
    if (!refreshed) return;
    accessToken = sessionStorage.getItem("access_token");
  }

  options.headers["Authorization"] = `Bearer ${accessToken}`;

  let res = await fetch(url, options);

  if (res.status === 401) {
    const refreshed = await refresh_request(options);
    if (!refreshed) return;

    const newToken = sessionStorage.getItem("access_token");
    options.headers["Authorization"] = `Bearer ${newToken}`;
    res = await fetch(url, options);
  }

  if (callback) callback(res);
  return res;
}

export async function refresh_request(options = {}) {
  const refreshRes = await fetch("/auth/refresh", {
    method: "GET",
    credentials: "include"
  });

  if (refreshRes.ok) {
    const data = await refreshRes.json();
    sessionStorage.setItem("access_token", data['access_token']);

    options.headers = {
      ...(options.headers || {}),
      "Authorization": `Bearer ${data['access_token']}`,
      "Content-Type": "application/json"
    };

    return true;
  } else {
    window.location.href = "/login";
    return false;
  }
}


export async function logout() {
    const response = await fetchWithAuth("auth/logout", {
        method: "GET",
    })

    const result = await response.json();

    if (response.status === 200 && result) {
        sessionStorage.removeItem("access_token")
        window.location.href = "/login";
    }
}

export function setButtonLoading(button, text) {
    if (!button) return;
    button.disabled = true;
    const spinner = button.querySelector(".spinner");
    const btnText = button.querySelector(".btn-text");
    if (btnText && text) btnText.textContent = text;
    if (spinner) spinner.classList.remove("hide");
}

export function clearButtonLoading(button, text) {
    if (!button) return;
    button.disabled = false;
    const spinner = button.querySelector(".spinner");
    const btnText = button.querySelector(".btn-text");
    if (btnText && text) btnText.textContent = text;
    if (spinner) spinner.classList.add("hide");
}

export function initOtpInputs(root = document) {
    const inputs = root.querySelectorAll(".otp-input");
    if (!inputs.length) return;

    inputs.forEach((input, index) => {
        input.addEventListener("input", (e) => {
            const isBackspace = e.inputType === "deleteContentBackward";
            if (!/^[0-9]$/.test(e.data) && !isBackspace) {
                input.value = "";
                return;
            }
            if (e.data && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener("keydown", (e) => {
            if (e.key === "Backspace") {
                if (input.value === "" && index > 0) {
                    inputs[index - 1].focus();
                }
            } else if (e.key === "ArrowLeft" && index > 0) {
                inputs[index - 1].focus();
            } else if (e.key === "ArrowRight" && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });

        input.addEventListener("paste", (e) => {
            e.preventDefault();
            const pasteData = e.clipboardData.getData("text").replace(/[^0-9]/g, "");
            if (!pasteData) return;

            const chars = pasteData.split("");
            let currentIndex = index;
            chars.forEach((char) => {
                if (currentIndex < inputs.length) {
                    inputs[currentIndex].value = char;
                    currentIndex++;
                }
            });

            if (currentIndex < inputs.length) {
                inputs[currentIndex].focus();
            } else {
                inputs[inputs.length - 1].focus();
            }
        });
    });
}

export function readOtp(root = document) {
    const inputs = root.querySelectorAll(".otp-input");
    let otp = "";
    inputs.forEach((input) => {
        otp += input.value;
    });
    return otp;
}

function warning_widget(message) {
    return `
    <div class="alert alert-warning">
        <p>${message}</p>
    </div>
    `;
}

function error_widget(message) {
    return `
    <div class="alert alert-danger">
        <p>${message}</p>
    </div>
    `;
}

function success_widget(message) {
    return `
    <div class="alert alert-success">
        <p>${message}</p>
    </div>
    `;
}

export { warning_widget, error_widget, success_widget };
