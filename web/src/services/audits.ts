import api from "./api"
import type { ScanResponse, AuditItemOut } from "@/types/audits"

const auditService = {
  listAudits: async (skip: number = 0, limit: number = 10, state?: string): Promise<ScanResponse[]> => {
    const response = await api.get<ScanResponse[]>("/audits/", {
      params: { skip, limit, state }
    })
    return response.data
  },

  getAudit: async (id: string): Promise<ScanResponse> => {
    const response = await api.get<ScanResponse>(`/audits/${id}`)
    return response.data
  },

  createAudit: async (payload: { benchmark_id: number; asset_id: number }): Promise<string> => {
    const response = await api.post<string>("/audits/", payload)
    return response.data
  },
  
  getAuditItems: async (auditId: number): Promise<AuditItemOut[]> => {
    const response = await api.get<AuditItemOut[]>(`/audits/${auditId}/items`)
    return response.data
  }
}

export default auditService
