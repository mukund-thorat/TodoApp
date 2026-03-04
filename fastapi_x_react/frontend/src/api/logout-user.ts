import {apiUrl} from "./config.ts";

export async function logoutUser(){
    const response = await fetch(apiUrl("/auth/logout"), {
        method: "GET",
        credentials: "include"
    })


    if (!response.ok) {
        throw new Error("Registration failed");
    }
    return await response.json();
}