function getAccessToken() {
  return sessionStorage.getItem("access_token");
}

async function fetchProtected(url, options = {}) {
  const token = getAccessToken();

  if (!token) {
    window.location.href = "/login";
    return;
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return fetchProtected(url, options);
    }
    window.location.href = "/login";
  }

  return response;
}

document.addEventListener("DOMContentLoaded", async () => {
  const res = await fetchProtected("/auth/me");
  const user = await res.json();
  console.log("Logged in user:", user);
});