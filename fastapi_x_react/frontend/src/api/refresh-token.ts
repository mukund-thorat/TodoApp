import type {tokenModel} from "../entities/token.ts";
import {apiUrl} from "./config.ts";

export async function refreshAccessToken(): Promise<string> {
    const response = await fetch(apiUrl("/auth/refresh"), {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        localStorage.removeItem("access_token");
        throw new Error("Unable to refresh access token");
    }

    const data: tokenModel = await response.json();
    localStorage.setItem("access_token", data.access_token);
    return data.access_token;
}
