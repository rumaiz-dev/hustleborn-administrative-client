import api from "../utils/api";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

if (!backendUrl) {
  throw new Error("Missing VITE_BACKEND_URL environment variable");
}

export const login = async (username, password) => {
  try {
    const response = await api.post(
      `${backendUrl}/api/auth/login`,
      {
        username,
        password,
        loginType: "Admin"
      },
      {
        withCredentials: true,
      },
    );

    return response.data;
  } catch (err) {
    throw new Error("Login failed: " + err.message);
  }
};


export const fetchUserPermissions = async (resourceType) => {
  try {
    const response = await api.get(
      `${backendUrl}/api/permissions/user-permissions?resourceType=${resourceType}`,
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

export const refreshToken = async () => {
  try {
    const response = await api.post(
      `${backendUrl}/api/auth/refresh`,
      {},
      {
        withCredentials: true,
      },
    );
    return response.data;
  } catch (err) {
    throw new Error("Token refresh failed: " + err.message);
  }
};




