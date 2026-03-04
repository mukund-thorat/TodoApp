import {fetchWithAuth} from "./protected-request.ts";
import {apiUrl} from "./config.ts";

export async function passVerify(password: string | null){
    const response = await fetchWithAuth(apiUrl("/user/change_password/verify_password"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ password: password ? password : "" })
    })

    if (!response.ok) {
        throw new Error("Registration failed");
    }
    return await response.json();
}

export async function otpVerify(otp: string, newPassword: string){
    const response = await fetchWithAuth(apiUrl("/user/change_password/otp/verify"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            otp: otp,
            newPassword: newPassword
        })
    })

    if (!response.ok) {
        throw new Error("Registration failed");
    }
    return await response.json();
}
