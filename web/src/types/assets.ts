export interface HostBase {
  hostname: string
  ip_address?: string
  os?: string
  description?: string
  auto_scan?: boolean
  active?: boolean
}

export interface HostCreate extends HostBase { }

export interface HostResponse extends HostBase {
  id: number
  last_seen_at?: string
  created_at: string
  updated_at?: string
}

export interface HostPaginatedResponse {
  items: HostResponse[]
  total: number
}
