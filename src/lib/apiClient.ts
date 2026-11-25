import axios from "axios";

const apiClient = axios.create({
  withCredentials: true, // sends HTTP-only cookie on every request automatically
  headers: {
    "Content-Type": "application/json",
  },
});

// Global 401 interceptor — session expired → kick to login
apiClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      window.location.href = "/auth/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;