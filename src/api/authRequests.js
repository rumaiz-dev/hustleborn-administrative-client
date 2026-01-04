import api from "../utils/api";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

if (!backendUrl) {
  throw new Error("Missing VITE_BACKEND_URL environment variable");
}

export const login = async (username, password) => {
  try {
    const response = await api.post(
      `${backendUrl}/auth/v2/login`,
      {
        username,
        password,
        loginType: "ADMIN"
      },
      {
        withCredentials: true,
      },
    );

    return response.data.accessToken;
  } catch (err) {
    throw new Error("Login failed: " + err.message);
  }
};

export const logout = async () => {
  try {
    const response = await api.post(
      `${backendUrl}/auth/v2/logout?loginType=ADMIN`,
      {},
      { withCredentials: true },
    );
    sessionStorage.clear();
    localStorage.clear();
    return response.data;
  } catch (err) {
    console.error("Logout failed:", err);
    throw err;
  }
};

export const fetchUserPermissions = async (resourceType) => {
  try {
    const response = await api.get(
      `${backendUrl}/api/v1/permissions/user-permissions?resourceType=${resourceType}`,
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching permissions:", error);
    throw error;
  }
};

export const checkLoginStatus = async () => {
  try {
    const response = await api.get(`${backendUrl}/auth/v2/check-login?loginType=ADMIN`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error checking login status:", error);
    throw error;
  }
}



