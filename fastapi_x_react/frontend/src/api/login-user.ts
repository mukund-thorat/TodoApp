import type {LoginFormData} from "../entities/user.ts";

export async function loginUser(data: LoginFormData){
    const formData = new URLSearchParams();
    formData.append("username", data.email)
    formData.append("password", data.password)

    const response = await fetch("http://localhost:8000/auth/login", {
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
