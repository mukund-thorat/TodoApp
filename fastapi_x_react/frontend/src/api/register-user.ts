import type {RegisterFormData} from "../entities/user.ts";
import {apiUrl} from "./config.ts";

export async function registerUser(formData: RegisterFormData){
    const response = await fetch(apiUrl("/auth/register"), {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            firstName: formData.firstName,
            lastName: formData.lastName,
            email: formData.email,
            password: formData.password,
            avatar: null
        })
    });
    if (!response.ok) {
        throw new Error("Registration failed");
    }
    return await response.json();
}
