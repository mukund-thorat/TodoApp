import {apiUrl} from "./config.ts";

interface SignupOtpVerifyResponse {
    loginToken: string;
}

export async function requestSignupOtp(email: string) {
    const response = await fetch(apiUrl(`/auth/otp/request?email=${encodeURIComponent(email)}`), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("OTP request failed");
    }

    return response.json();
}

export async function verifySignupOtp(email: string, otp: string, avatar: string | null): Promise<SignupOtpVerifyResponse> {
    const response = await fetch(apiUrl("/auth/otp/verify"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({email, otp, avatar}),
    });

    if (!response.ok) {
        throw new Error("OTP verification failed");
    }

    return response.json();
}

export async function signupTokenLogin(token: string) {
    const response = await fetch(apiUrl("/auth/token_login"), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${token}`,
        },
        credentials: "include",
    });

    if (!response.ok) {
        throw new Error("Token login failed");
    }

    return response.json();
}
