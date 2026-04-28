export interface RuleResponse {
  id: number
  benchmark_id: number
  type: string
  index?: string
  description?: string
  solution?: string
  reg_key?: string
  reg_item?: string
  reg_option?: string
  audit_policy_subcategory?: string
  right_type?: string
  value_data?: string
  block_id?: string
  info?: string
  reference?: string[]
}

export interface BenchmarkResponse {
  id: number
  title: string
  version: string
  description: string
  name?: string
  profile?: string
  labels?: string[]
  benchmark_refs?: string[]
  rules: RuleResponse[]
  created_at?: string // Optional as it might be added by a mixin or handled separately
}

export interface ScanResultOut {
  rule_id: string
  passed: boolean
  details: string
}
