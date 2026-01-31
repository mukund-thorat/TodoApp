const form = document.getElementById('otp-form');
const otp_inputs = document.querySelectorAll('.otp-input');

form.addEventListener('submit', async (e) => {
    const signupData = JSON.parse(localStorage.getItem('signupData'));
    const email = signupData.email;
    const password = signupData.password;
    e.preventDefault();
    let otp = ""

    otp_inputs.forEach(input => {
        otp += input.value;
    })

    if (otp.length === 6){
        const response = await fetch("auth/otp/verify_otp", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: email, otp: otp})
        });

        const result = await response.json();
        console.log(result);
        if (result === true && response.ok){
            console.log('Otp verification successful!');
            await login(email, password);
        } else {
            alert("Otp verification failed!");
        }
    }
})


async function login(email, password) {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    const response = await fetch("auth/login", {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: 'include',
        body: formData.toString()
    })

    const result = await response.json();
    console.log(result);
    if (result !== null && response.ok){
        console.log("result");
        let access_token = result['access_token'];
        await access_app(access_token);
    }
}

async function access_app(access_token) {
  sessionStorage.setItem("access_token", access_token);
  window.location.href = "/app";
}

async function refreshAccessToken() {
  const response = await fetch("/auth/refresh", {
    method: "POST",
    credentials: "include"
  });

  const result = await response.json();
  if (response.ok) {
    return result['access_token'];
  } else {
    throw new Error("Session expired");
  }
}


// TODO Don't store signup data in localstorage