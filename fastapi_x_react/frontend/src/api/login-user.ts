import type {LoginFormData} from "../entities/user.ts";
import {apiUrl} from "./config.ts";

export async function loginUser(data: LoginFormData){
    const formData = new URLSearchParams();
    formData.append("username", data.email)
    formData.append("password", data.password)

    const response = await fetch(apiUrl("/auth/login"), {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        credentials: "include",
        body: formData.toString(),
    });

    if (!response.ok) {
        throw new Error("Registration failed");
    }
    return await response.json();
}
