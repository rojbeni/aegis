import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Clock, Radar, Activity, Lightbulb, Zap, Loader2, AlertCircle } from "lucide-react"
import { motion } from "framer-motion"
import auditService from "@/services/audits"
import benchmarkService from "@/services/benchmarks"
import type { ScanResponse } from "@/types/audits"
import type { BenchmarkResponse } from "@/types/benchmarks"

import { ChevronLeft, ChevronRight, Filter, AlertCircle as AlertIcon } from "lucide-react"
import { NewScanModal } from "./new-scan-modal"
import { ScanAnalysisView } from "./scan-analysis-view"

const getStatusDetails = (audit: ScanResponse) => {
  const score = audit.score ? Math.round(audit.score) : 0

  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-emerald-400"
    if (s >= 70) return "text-amber-400"
    return "text-rose-400"
  }

  const getScoreBarColor = (s: number) => {
    if (s >= 90) return "bg-emerald-500/30"
    if (s >= 70) return "bg-amber-500/30"
    return "bg-rose-500/30"
  }

  const getScoreIndicatorColor = (s: number) => {
    if (s >= 90) return "bg-emerald-500"
    if (s >= 70) return "bg-amber-500"
    return "bg-rose-500"
  }

  switch (audit.state) {
    case "RUNNING":
      return {
        label: "Analyzing Payload",
        color: "text-indigo-400",
        barColor: "bg-indigo-500/30",
        indicatorColor: "bg-indigo-500",
        animate: true
      }
    case "SUCCESS":
      return {
        score: score,
        label: "Scan Complete",
        color: getScoreColor(score),
        barColor: getScoreBarColor(score),
        indicatorColor: getScoreIndicatorColor(score),
        animate: false
      }
    case "ERROR":
      return {
        label: "Scan Failed",
        color: "text-rose-600",
        barColor: "bg-rose-600/30",
        indicatorColor: "bg-rose-600",
        animate: false
      }
    default:
      return {
        label: audit.state,
        color: "text-slate-500",
        barColor: "bg-slate-800/60",
        indicatorColor: "bg-slate-800",
        animate: false
      }
  }
}

export default function AuditsPage() {
  const [scans, setScans] = useState<ScanResponse[]>([])
  const [benchmarks, setBenchmarks] = useState<Record<string, BenchmarkResponse>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Results View State
  const [viewingScan, setViewingScan] = useState<ScanResponse | null>(null)

  // Pagination & Filter State
  const [page, setPage] = useState(0)
  const [stateFilter, setStateFilter] = useState<string | undefined>(undefined)
  const pageSize = 5

  const fetchData = async () => {
    try {
      setLoading(true)
      const [scansData, benchmarksData] = await Promise.all([
        auditService.listAudits(page * pageSize, pageSize, stateFilter),
        benchmarkService.listBenchmarks()
      ])

      const benchmarkMap = benchmarksData.reduce((acc, bm) => {
        acc[bm.id] = bm
        return acc
      }, {} as Record<string, BenchmarkResponse>)

      setScans(scansData)
      setBenchmarks(benchmarkMap)
    } catch (err) {
      console.error("Failed to fetch scans:", err)
      setError("Failed to load scan operations data.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, stateFilter])

  const handleViewResults = async (scan: ScanResponse) => {
    setViewingScan(scan)
  }

  return (
    <div className="space-y-8 pb-12">
      <NewScanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            {viewingScan && (
              <button
                onClick={() => setViewingScan(null)}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors border border-slate-800"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            <motion.h1
              className="text-4xl font-bold tracking-tight text-white font-sans uppercase"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              {viewingScan ? 'Scan Analysis' : 'Scan Operations'}
            </motion.h1>
          </div>
          <motion.p
            className="text-slate-400 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            {viewingScan
              ? `Reviewing results for audit against ${viewingScan.asset_ip || viewingScan.asset_id}`
              : 'Monitor and manage security vulnerability assessments across your infrastructure'}
          </motion.p>
        </div>

        {!viewingScan && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all flex items-center gap-2 group"
          >
            <div className="bg-white/10 rounded-lg p-1.5 group-hover:bg-white/20 transition-colors">
              <Play className="h-4 w-4 fill-current" />
            </div>
            Initiate New Audit
          </motion.button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-1">
        <div className="lg:col-span-2 space-y-6">
          {!viewingScan && (
            <div className="flex items-center justify-between px-2 mb-2">
              <div className="flex items-center gap-2">
                <Radar className="h-5 w-5 text-indigo-500" />
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Active Operations</h2>
              </div>
              <div className="flex items-center gap-1 bg-slate-950/50 p-1 rounded-xl border border-slate-800 backdrop-blur-md">
                {['ALL', 'RUNNING', 'SUCCESS', 'FAILURE'].map((state) => (
                  <button
                    key={state}
                    onClick={() => {
                      setStateFilter(state === 'ALL' ? undefined : state)
                      setPage(0)
                    }}
                    className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all uppercase tracking-[0.1em] ${
                      (state === 'ALL' ? !stateFilter : stateFilter === state)
                        ? 'bg-indigo-600 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    {state}
                  </button>
                ))}
              </div>
            </div>
          )}

          {viewingScan && (
            <div className="flex items-center gap-2 px-2">
              <Radar className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-white uppercase tracking-wider">Audit Item Findings</h2>
            </div>
          )}

          <div className="grid gap-4">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                <p className="text-sm font-medium text-slate-500">Retrieving operational data...</p>
              </div>
            ) : error ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-800 rounded-xl">
                <AlertIcon className="h-8 w-8 text-rose-500" />
                <p className="text-sm font-medium text-slate-400 text-center px-6">{error}</p>
                <button onClick={fetchData} className="text-xs font-bold text-indigo-400 uppercase tracking-widest hover:text-indigo-300">Retry Fetch</button>
              </div>
            ) : viewingScan ? (
              <ScanAnalysisView scan={viewingScan} />
            ) : scans.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-800 rounded-xl">
                <Radar className="h-8 w-8 text-slate-700" />
                <p className="text-sm font-medium text-slate-500">No scan operations detected.</p>
              </div>
            ) : (
              scans.map((scan, idx) => {
                const statusInfo = getStatusDetails(scan)
                const benchmark = scan.benchmark_id ? benchmarks[scan.benchmark_id] : null
                const title = benchmark?.title || "Unknown Benchmark"

                return (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm hover:border-indigo-500/30 transition-all overflow-hidden relative group">
                      <div className={`absolute top-0 left-0 h-1 ${statusInfo.barColor} w-full`} />
                      <motion.div
                        className={`absolute top-0 left-0 h-1 ${statusInfo.indicatorColor}`}
                        initial={false}
                        animate={scan.state === 'RUNNING' ? {
                          left: ['-20%', '100%'],
                          width: ['20%', '20%'],
                        } : {
                          width: `${statusInfo.score || 0}%`,
                          left: '0%'
                        }}
                        transition={scan.state === 'RUNNING' ? {
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear"
                        } : { duration: 0.8, ease: "easeOut" }}
                      />
                      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                            <Activity className={`h-5 w-5 ${statusInfo.color} ${statusInfo.animate ? 'animate-pulse' : ''}`} />
                            <div className="absolute inset-0 bg-indigo-500/5 transition-colors group-hover:bg-indigo-500/10" />
                          </div>
                          <div>
                            <CardTitle className="text-lg font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase">{title}</CardTitle>
                            <p className="text-xs text-slate-500 font-mono tracking-tighter">{scan.asset_ip || `Asset ID: ${scan.asset_id}`}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {statusInfo.score !== undefined && (
                            <span className={`text-lg font-bold ${statusInfo.color}`} >{statusInfo.score}%</span>
                          )}
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{statusInfo.label}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase">
                            <Clock className="h-3 w-3" />
                            Started {new Date(scan.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {scan.state === 'SUCCESS' && (
                            <button
                              onClick={() => handleViewResults(scan)}
                              className="h-8 px-4 border border-indigo-500/30 bg-indigo-500/10 text-[10px] font-bold text-indigo-400 hover:text-white hover:bg-indigo-600 transition-all uppercase tracking-widest rounded-lg"
                            >
                              View Results
                            </button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })
            )}

            {!viewingScan && scans.length > 0 && (
              <div className="flex items-center justify-between px-2 py-4 border-t border-slate-800/50 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Page {page + 1}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="h-8 w-8 flex items-center justify-center border border-slate-800 bg-slate-950/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={scans.length < pageSize}
                    className="h-8 w-8 flex items-center justify-center border border-slate-800 bg-slate-950/50 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
