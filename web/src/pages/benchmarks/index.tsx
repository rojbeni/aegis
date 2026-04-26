import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Book, Globe, Cpu, Database, Plus, Sparkles, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { ImportBenchmarkModal } from "./import-modal"
import benchmarkService from "@/services/benchmarks"
import type { BenchmarkResponse } from "@/types/benchmarks"

const getBenchmarkIcon = (category?: string) => {
  const cat = category?.toLowerCase()
  if (cat?.includes("os") || cat?.includes("windows") || cat?.includes("linux")) return { icon: Shield, color: "text-blue-400" }
  if (cat?.includes("container") || cat?.includes("docker") || cat?.includes("k8s")) return { icon: Cpu, color: "text-indigo-400" }
  if (cat?.includes("cloud") || cat?.includes("aws") || cat?.includes("azure")) return { icon: Globe, color: "text-emerald-400" }
  if (cat?.includes("database") || cat?.includes("db")) return { icon: Database, color: "text-amber-400" }
  return { icon: Book, color: "text-slate-400" }
}

export default function BenchmarksPage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [benchmarks, setBenchmarks] = useState<BenchmarkResponse[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBenchmarks = async () => {
    try {
      setLoading(true)
      const data = await benchmarkService.listBenchmarks()
      setBenchmarks(data)
    } catch (err) {
      console.error("Failed to fetch benchmarks:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBenchmarks()
  }, [])

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col gap-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full w-fit mb-2"
          >
            <Sparkles className="h-3 w-3 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">Upgrade Pro</span>
          </motion.div>
          <motion.h1
            className="text-4xl font-bold tracking-tight text-white font-sans"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            Benchmark Library
          </motion.h1>
          <motion.p
            className="text-slate-400 font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Explore and manage security configuration benchmarks
          </motion.p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsImportModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all"
        >
          <Plus className="h-4 w-4" />
          Import Benchmark
        </motion.button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[280px] rounded-[32px] bg-slate-900/40 animate-pulse border border-slate-800/60" />
          ))
        ) : (
          benchmarks.map((bm, idx) => {
            const { icon: Icon, color } = getBenchmarkIcon(bm.name || bm.title)
            return (
              <motion.div
                key={bm.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Link to={`/benchmarks/${bm.id}`}>
                  <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm hover:border-indigo-500/40 transition-all cursor-pointer group flex flex-col h-full overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className="h-4 w-4 text-indigo-400" />
                    </div>
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors shadow-inner">
                        <Icon className={`h-6 w-6 ${color}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{bm.name || "Generic"}</span>
                        <div className="flex gap-1.5 mt-1">
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter bg-indigo-500/10 px-1.5 py-0.5 rounded w-fit">{bm.version || "v1.0.0"}</span>
                          {bm.profile && (
                            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tighter bg-emerald-500/10 px-1.5 py-0.5 rounded w-fit">{bm.profile}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors leading-tight">{bm.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-slate-400 leading-relaxed font-medium line-clamp-3">
                      {bm.description}
                    </p>
                  </CardContent>
                  <div className="p-4 border-t border-slate-900/50 bg-slate-950/20 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                    <span>Rules: {bm.rules?.length || 0}</span>
                    <span className="flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </div>
                </Card>
              </Link>
            </motion.div>
            )
          })
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: benchmarks.length * 0.1 }}
          className="h-full"
          onClick={() => setIsImportModalOpen(true)}
        >
          <Card className="bg-transparent border-2 border-dashed border-slate-800/50 hover:border-indigo-500/30 transition-all cursor-pointer group flex flex-col items-center justify-center p-8 h-full min-h-[250px]">
            <div className="h-12 w-12 rounded-full bg-slate-900/50 border border-slate-800 flex items-center justify-center mb-4 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/30 transition-all">
              <Plus className="h-6 w-6 text-slate-500 group-hover:text-indigo-400" />
            </div>
            <p className="text-sm font-bold text-slate-400 group-hover:text-slate-200">Add New Benchmark</p>
            <p className="text-xs text-slate-600 mt-1 text-center font-medium">Import from CIS or upload your own YAML definition</p>
          </Card>
        </motion.div>
      </div>

      <div className="flex items-center justify-center pt-8">
        <p className="text-xs font-bold text-slate-600 uppercase tracking-[0.3em]">
          Showing {benchmarks.length} benchmarks
        </p>
      </div>

      <ImportBenchmarkModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)} 
        onSuccess={fetchBenchmarks}
      />
    </div>
  )
}
