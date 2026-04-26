import type { RuleResponse } from "./benchmarks"

export interface AuditItemOut {
  id: number
  rule: RuleResponse
  passed: boolean | null
  actual_value: string | null
}

export interface ScanResponse {
  id: number
  task_id: string
  benchmark_id: number
  asset_id: number
  asset_ip: string | null
  created_at: string
  state: string
  score: number | null
  items: AuditItemOut[]
}
