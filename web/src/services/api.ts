import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("aegis_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network/Connection Error
      window.dispatchEvent(
        new CustomEvent("aegis:connection_error", {
          detail: {
            code: error.code || "ERR_NETWORK_FAILURE",
            message: error.message || "Failed to establish secure connection to core services.",
            timestamp: new Date().toISOString().replace("T", " ").split(".")[0] + " UTC",
          },
        })
      )
    } else if (error.response.status === 401 || error.response.status === 403) {
      // Auth Error - Only trigger if not on login page
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("aegis_token")
        window.dispatchEvent(new CustomEvent("aegis:auth_error"))
      }
    }
    return Promise.reject(error)
  }
)

export default api
