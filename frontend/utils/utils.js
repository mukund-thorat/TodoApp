export async function fetchWithAuth(url, options = {}, callback = null) {
  let accessToken = sessionStorage.getItem("access_token");

  options.headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json"
  };

  if (!accessToken) {
    const refreshed = await refresh_request(options);
    if (!refreshed) return;
    accessToken = sessionStorage.getItem("access_token");
  }

  options.headers["Authorization"] = `Bearer ${accessToken}`;

  let res = await fetch(url, options);

  if (res.status === 401) {
    const refreshed = await refresh_request(options);
    if (!refreshed) return;

    const newToken = sessionStorage.getItem("access_token");
    options.headers["Authorization"] = `Bearer ${newToken}`;
    res = await fetch(url, options);
  }

  if (callback) callback(res);
  return res;
}

export async function refresh_request(options = {}) {
  const refreshRes = await fetch("/auth/refresh", {
    method: "GET",
    credentials: "include"
  });

  if (refreshRes.ok) {
    const data = await refreshRes.json();
    sessionStorage.setItem("access_token", data['access_token']);

    options.headers = {
      ...(options.headers || {}),
      "Authorization": `Bearer ${data['access_token']}`,
      "Content-Type": "application/json"
    };

    return true;
  } else {
    window.location.href = "/login";
    return false;
  }
}


export async function logout() {
    const response = await fetchWithAuth("auth/logout", {
        method: "GET",
    })

    const result = await response.json();

    if (response.status === 200 && result) {
        sessionStorage.removeItem("access_token")
        window.location.href = "/login";
    }
}

function warning_widget(message) {
    return `
    <div class="alert alert-warning">
        <p>${message}</p>
    </div>
    `;
}

function error_widget(message) {
    return `
    <div class="alert alert-danger">
        <p>${message}</p>
    </div>
    `;
}

function success_widget(message) {
    return `
    <div class="alert alert-success">
        <p>${message}</p>
    </div>
    `;
}

export { warning_widget, error_widget, success_widget };