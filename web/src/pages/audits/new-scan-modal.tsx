import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Shield, Laptop, Search, Loader2, CheckCircle2, AlertCircle, ChevronRight } from "lucide-react"
import auditService from "@/services/audits"
import assetService from "@/services/assets"
import benchmarkService from "@/services/benchmarks"
import type { HostResponse } from "@/types/assets"
import type { BenchmarkResponse } from "@/types/benchmarks"

interface NewScanModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function NewScanModal({ isOpen, onClose, onSuccess }: NewScanModalProps) {
  const [step, setStep] = useState(1)
  const [selectedAsset, setSelectedAsset] = useState<HostResponse | null>(null)
  const [selectedBenchmark, setSelectedBenchmark] = useState<BenchmarkResponse | null>(null)

  const [assets, setAssets] = useState<HostResponse[]>([])
  const [benchmarks, setBenchmarks] = useState<BenchmarkResponse[]>([])

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          setLoading(true)
          const [assetsData, benchmarksData] = await Promise.all([
            assetService.listHosts(),
            benchmarkService.listBenchmarks()
          ])
          setAssets(assetsData.items)
          setBenchmarks(benchmarksData)
        } catch (err) {
          setError("Failed to load targets or benchmarks.")
        } finally {
          setLoading(false)
        }
      }
      fetchData()
    }
  }, [isOpen])

  const handleInitiateScan = async () => {
    if (!selectedAsset || !selectedBenchmark) return

    try {
      setSubmitting(true)
      setError(null)
      await auditService.createAudit({
        benchmark_id: selectedBenchmark.id,
        asset_id: selectedAsset.id
      })
      setSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to initiate scan operation.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setStep(1)
    setSelectedAsset(null)
    setSelectedBenchmark(null)
    setError(null)
    setSuccess(false)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101]">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-2xl p-0 rounded-3xl shadow-2xl relative overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Initialize New Scan</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Configure parameters for the infrastructure audit.</p>
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8">
                {success ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-20 w-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white uppercase tracking-wider">Operation Enqueued</h3>
                      <p className="text-sm text-slate-400 mt-2 font-medium">Scan task has been dispatched to active workers.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* Progress indicator */}
                    <div className="flex items-center gap-4 px-2">
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>1</div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 1 ? 'text-white' : 'text-slate-500'}`}>Target Selection</span>
                      </div>
                      <div className="h-px w-8 bg-slate-800" />
                      <div className="flex items-center gap-2">
                        <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-500'}`}>2</div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${step >= 2 ? 'text-white' : 'text-slate-500'}`}>Benchmark Mapping</span>
                      </div>
                    </div>

                    <div className="min-h-[350px]">
                      {loading ? (
                        <div className="h-full py-20 flex flex-col items-center justify-center space-y-4">
                          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Synchronizing Resources...</p>
                        </div>
                      ) : (
                        <AnimatePresence mode="wait">
                          {step === 1 ? (
                            <motion.div
                              key="step1"
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="space-y-4"
                            >
                              <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                  type="text"
                                  placeholder="Search hosts, IP addresses, or tags..."
                                  className="w-full bg-slate-950/50 border border-slate-800 text-sm py-3.5 pl-12 pr-4 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all text-slate-300 placeholder:text-slate-600 shadow-inner"
                                />
                              </div>
                              <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {assets.map((asset) => (
                                  <button
                                    key={asset.id}
                                    onClick={() => setSelectedAsset(asset)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${selectedAsset?.id === asset.id
                                      ? 'bg-indigo-600/10 border-indigo-500/50'
                                      : 'bg-slate-950/30 border-slate-800/40 hover:border-slate-700'
                                      }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${selectedAsset?.id === asset.id ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-900 text-slate-500 group-hover:text-slate-400'}`}>
                                        <Laptop className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-white tracking-tight">{asset.hostname}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter bg-slate-950 px-1.5 py-0.5 rounded">{asset.os || 'Linux'}</span>
                                          <span className="text-[10px] font-mono text-slate-600">{asset.ip_address}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {selectedAsset?.id === asset.id && (
                                      <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          ) : (
                            <motion.div
                              key="step2"
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -20 }}
                              className="space-y-4"
                            >
                              <div className="grid grid-cols-1 gap-2 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {benchmarks.map((bm) => (
                                  <button
                                    key={bm.id}
                                    onClick={() => setSelectedBenchmark(bm)}
                                    className={`flex items-center justify-between p-4 rounded-xl border transition-all text-left group ${selectedBenchmark?.id === bm.id
                                      ? 'bg-indigo-600/10 border-indigo-500/50'
                                      : 'bg-slate-950/30 border-slate-800/40 hover:border-slate-700'
                                      }`}
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${selectedBenchmark?.id === bm.id ? 'bg-indigo-600/20 text-indigo-400' : 'bg-slate-900 text-slate-500 group-hover:text-slate-400'}`}>
                                        <Shield className="h-5 w-5" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-bold text-white tracking-tight leading-tight">{bm.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter bg-indigo-500/10 px-1.5 py-0.5 rounded">{bm.version}</span>
                                        </div>
                                      </div>
                                    </div>
                                    {selectedBenchmark?.id === bm.id && (
                                      <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                        <CheckCircle2 className="h-3 w-3 text-white" />
                                      </div>
                                    )}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 flex items-center gap-2 text-rose-400 text-xs font-medium px-4 py-3 bg-rose-500/5 border border-rose-500/10 rounded-xl">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              {!success && (
                <div className="flex items-center justify-between gap-3 p-6 border-t border-slate-800/50 bg-slate-950/50">
                  <button
                    onClick={handleClose}
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <div className="flex items-center gap-3">
                    {step === 2 && (
                      <button
                        onClick={() => setStep(1)}
                        disabled={submitting}
                        className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
                      >
                        Back
                      </button>
                    )}
                    {step === 1 ? (
                      <button
                        onClick={() => setStep(2)}
                        disabled={!selectedAsset || loading}
                        className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-2.5 rounded-xl font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-2 group"
                      >
                        Next: Choose Benchmark
                        <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    ) : (
                      <button
                        onClick={handleInitiateScan}
                        disabled={!selectedBenchmark || submitting}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl font-bold text-xs shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Initializing...
                          </>
                        ) : (
                          <>
                            <Play className="h-3.5 w-3.5 fill-current" />
                            Initiate Scan
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
