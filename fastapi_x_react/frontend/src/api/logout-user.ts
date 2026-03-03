export async function logoutUser(){
    const response = await fetch("http://localhost:8000/auth/logout", {
        method: "GET",
        credentials: "include"
    })


    if (!response.ok) {
        throw new Error("Registration failed");
    }
    return await response.json();
}