import api from "./api"
import type { TokenResponse, User } from "../types/auth"

export const authService = {
  async login(username: string, password: string): Promise<TokenResponse> {
    const params = new URLSearchParams()
    params.append("username", username)
    params.append("password", password)
    const response = await api.post<TokenResponse>("/api/auth/login", params, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    return response.data
  },

  setToken(token: string) {
    localStorage.setItem("aegis_token", token)
  },

  getToken(): string | null {
    return localStorage.getItem("aegis_token")
  },

  removeToken() {
    localStorage.removeItem("aegis_token")
  },

  isAuthenticated(): boolean {
    return !!this.getToken()
  },

  decodeToken(token: string): User | null {
    const payload = JSON.parse(atob(token.split(".")[1]))
    return {
      id: payload.sub,
      username: payload.username,
      display_name: payload.display_name,
      email: payload.email,
      role: payload.role,
      permissions: payload.permissions,
    }
  },

  getUser(): User | null {
    const token = this.getToken()
    if (!token) return null
    return this.decodeToken(token)
  },
}

export default authService
