const form = document.getElementById('otp-form');
const otp_inputs = document.querySelectorAll('.otp-input');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = sessionStorage.getItem('email');
    let otp = ""
    let avatar_url = sessionStorage.getItem("picked_avatar");

    if (!avatar_url) {
        alert("Exception occurred with avatar");
    }

    otp_inputs.forEach(input => {
        otp += input.value;
    })

    if (otp.length === 6){
        const response = await fetch("auth/otp/verify", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({email: email, otp: otp, avatar: avatar_url})
        });

        const result = await response.json();
        if (result && response.ok){
            if (!result['loginToken']){
                alert("Exception occurred with login token");
                return;
            }
            await token_login(result['loginToken']);
        } else {
            alert("Otp verification failed!");
        }
    }
})


async function token_login(token) {
    const response = await fetch("auth/token_login", {
        method: 'POST',
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Bearer ${token}`,
        },
        credentials: 'include',
    })

    const result = await response.json();
    if (result && response.status === 202){
        let access_token = result['access_token'];
        await access_app(access_token);
    }
}

async function access_app(access_token) {
  sessionStorage.setItem("access_token", access_token);
  window.location.href = "/app";
}
