import api from "./api"
import type { HostCreate, HostResponse, HostPaginatedResponse } from "@/types/assets"



const assetService = {

  createHost: async (host: HostCreate): Promise<HostResponse> => {
    const response = await api.post<HostResponse>("/assets/", host)
    return response.data
  },

  listHosts: async (skip = 0, limit = 100): Promise<HostPaginatedResponse> => {
    const response = await api.get<any>("/assets/", {
      params: { skip, limit }
    })
    
    // Handle both paginated response and direct list
    if (Array.isArray(response.data)) {
      return {
        items: response.data,
        total: response.data.length
      }
    }
    
    return response.data || { items: [], total: 0 }
  }
}

export default assetService
