import api from "./api"
import type { BenchmarkResponse, AuditItemResponse } from "@/types/benchmarks"

const benchmarkService = {
  listBenchmarks: async (): Promise<BenchmarkResponse[]> => {
    const response = await api.get<BenchmarkResponse[]>("/benchmarks/")
    return response.data
  },

  getBenchmark: async (id: string): Promise<BenchmarkResponse> => {
    const response = await api.get<BenchmarkResponse>(`/benchmarks/${id}`)
    return response.data
  },

  getBenchmarkItems: async (id: string): Promise<AuditItemResponse[]> => {
    const response = await api.get<AuditItemResponse[]>(`/benchmarks/${id}/items`)
    return response.data
  },

  importBenchmark: async (file: File): Promise<BenchmarkResponse> => {
    const formData = new FormData()
    formData.append("file", file)
    const response = await api.post<BenchmarkResponse>("/benchmarks/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  }
}

export default benchmarkService
