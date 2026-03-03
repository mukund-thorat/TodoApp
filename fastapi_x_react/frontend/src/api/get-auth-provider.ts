import {fetchWithAuth} from "./protected-request.ts";
import {type authProviderModel, authProviderObject} from "../entities/auth-service-provider.ts";

export async function getAuthProvider(): Promise<authProviderModel> {
    const response = await fetchWithAuth("http://localhost:8000/user/authProvider", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        }
    })

    if (!response.ok) {
        throw new Error("Registration failed");
    }

    const result = await response.json();
    return authProviderObject.parse(result);
}