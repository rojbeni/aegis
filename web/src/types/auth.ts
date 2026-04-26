export interface User {
  id: string
  username: string
  display_name: string | null
  email: string | null
  role: string
  permissions: string[]
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  permissions: string[]
  user?: User
}
