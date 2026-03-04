import {type recoveryTokenModel, recoveryTokenObject} from "../entities/recovery-token.ts";
import {apiUrl} from "./config.ts";

export async function forgetPass(email: string){
    const response = await fetch(apiUrl(`/auth/recovery/otp/request?email=${encodeURIComponent(email)}`), {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })

    if (!response.ok) {
        throw new Error("Unable to recover request");
    }
    return await response.json();
}

export async function verifyOtp(email: string, otp: string): Promise<recoveryTokenModel>{
    const response = await fetch(apiUrl("/auth/recovery/otp/verify"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            email: email,
            otp: otp
        })
    })

    if (!response.ok) {
        throw new Error("Unable to recover request");
    }
    const result = await response.json();
    return recoveryTokenObject.parse(result);
}

export async function changePassword(newPassword: string, recoveryToken: string){
    const response = await fetch(apiUrl("/auth/recovery/change_password"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            newPassword: newPassword,
            recoveryToken: recoveryToken
        })
    })

    if (!response.ok) {
        throw new Error("Unable to recover request");
    }
    return await response.json();
}