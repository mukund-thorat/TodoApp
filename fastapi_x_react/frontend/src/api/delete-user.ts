import {fetchWithAuth} from "./protected-request.ts";
import {apiUrl} from "./config.ts";

export async function deleteUser(password: string){
    const response = await fetchWithAuth(apiUrl("/user/delete_account/verify_password"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ password })
    })


    if (!response.ok) {
        throw new Error("Registration failed");
    }
    return await response.json();
}

export async function verifyOTP(otp: string){
    const response = await fetchWithAuth(apiUrl("/user/delete_account/otp/verify"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ otp })
    })


    if (!response.ok) {
        throw new Error("Registration failed");
    }
    return await response.json();
}
