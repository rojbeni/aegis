import { motion } from "framer-motion"
import {
  Search,
  Filter,
  FileDown,
  Play,
  ShieldCheck,
  Clock,
  ChevronRight,
  AlertTriangle,
  Network,
  Cpu,
  Settings,
  Book,
  Activity,
  ChevronLeft,
  Loader2,
  Terminal
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useState, useEffect, useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import benchmarkService from "@/services/benchmarks"
import type { BenchmarkResponse, RuleResponse } from "@/types/benchmarks"
import { AuditItemDetailModal } from "./detail-modal"

interface GroupedSection {
  id: string
  title: string
  count: number
  icon: any
  controls: {
    id: string
    title: string
    category: string
    severity: string
    severityColor: string
    severityBg: string
    raw: RuleResponse
  }[]
}

export default function BenchmarkDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const [benchmark, setBenchmark] = useState<BenchmarkResponse | null>(null)
  const [items, setItems] = useState<RuleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItem, setSelectedItem] = useState<RuleResponse | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return
      try {
        setLoading(true)
        const bmData = await benchmarkService.getBenchmark(id)
        setBenchmark(bmData)
        setItems(bmData.rules || [])

        // Auto-expand first section if available
        if (bmData.rules && bmData.rules.length > 0) {
          const firstIdx = bmData.rules[0].index || ""
          const match = firstIdx.match(/^(\d+)/)
          if (match) setExpandedSections([match[1]])
          else setExpandedSections(["Other"])
        }
      } catch (err) {
        console.error("Failed to fetch benchmark details:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  const groupedSections = useMemo(() => {
    const sections: Record<string, GroupedSection> = {}

    items
      .filter(item => {
        if (!searchQuery) return true
        return (
          item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.index?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.type?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })
      .forEach(item => {
        const sectionId = item.type || "OTHER"

        if (!sections[sectionId]) {
          let title = sectionId.replace(/_/g, " ")
          let icon = Book

          if (sectionId.includes("REGISTRY")) icon = Settings
          else if (sectionId.includes("SERVICE")) icon = Cpu
          else if (sectionId.includes("NETWORK")) icon = Network
          else if (sectionId.includes("POLICY")) icon = Activity
          else if (sectionId.includes("PASSWORD") || sectionId.includes("AUTH")) icon = ShieldCheck

          sections[sectionId] = {
            id: sectionId,
            title: title,
            count: 0,
            icon: icon,
            controls: []
          }
        }

        const index = item.index || ""
        const controlId = index || "???"
        const controlTitle = item.description || "No description"

        // Infer risk from description or category
        let severity = "LOW RISK"
        let color = "text-blue-500"
        let bg = "bg-blue-500/10"

        if (controlTitle.toLowerCase().includes("critical") || controlTitle.toLowerCase().includes("high")) {
          severity = "HIGH RISK"; color = "text-rose-500"; bg = "bg-rose-500/10"
        } else if (controlTitle.toLowerCase().includes("medium") || controlTitle.toLowerCase().includes("ensure")) {
          severity = "MEDIUM RISK"; color = "text-amber-500"; bg = "bg-amber-500/10"
        }

        sections[sectionId].controls.push({
          id: controlId,
          title: controlTitle,
          category: item.type.replace(/_/g, " "),
          severity: severity,
          severityColor: color,
          severityBg: bg,
          raw: item
        })
        sections[sectionId].count++
      })

    return Object.values(sections).sort((a, b) => a.title.localeCompare(b.title))
  }, [items, searchQuery])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(s => s !== sectionId)
        : [...prev, sectionId]
    )
  }

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Decrypting Audit Data...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <Link to="/benchmarks" className="flex items-center gap-2 text-slate-500 hover:text-indigo-400 transition-colors w-fit group">
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Back to Library</span>
      </Link>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full w-1 bg-indigo-500" />
          <CardContent className="p-8">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-start gap-6">
                <div className="h-20 w-20 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                  <div className="h-12 w-12 rounded-full bg-indigo-500/20 flex items-center justify-center">
                    <ShieldCheck className="h-8 w-8 text-indigo-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-white tracking-tight">{benchmark?.title}</h1>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 uppercase tracking-widest">
                      {benchmark?.name || "Official"} Benchmark
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 max-w-2xl font-medium leading-relaxed">
                    {benchmark?.description}
                  </p>
                  <div className="flex items-center gap-6 pt-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Clock className="h-3.5 w-3.5" />
                      Version {benchmark?.version || "1.0.0"} • Profile {benchmark?.profile || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button className="flex items-center gap-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 px-5 py-2.5 rounded-xl font-bold text-xs transition-all">
                  <FileDown className="h-4 w-4" />
                  Export
                </button>
                <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all">
                  <Play className="h-4 w-4 fill-current" />
                  Run Audit
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search audit controls (e.g. '1.1.1' or 'SSH')..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 text-sm py-3 pl-12 pr-4 rounded-xl focus:outline-none focus:border-indigo-500/50 transition-all text-slate-300 placeholder:text-slate-600"
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-400 transition-all">
            <Filter className="h-3.5 w-3.5" />
            Category
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-slate-900/50 hover:bg-slate-800 border border-slate-800 px-4 py-2.5 rounded-lg text-xs font-bold text-slate-400 transition-all">
            <AlertTriangle className="h-3.5 w-3.5" />
            Severity
          </button>
        </div>
      </div>

      {/* Audit Sections */}
      <div className="space-y-4">
        {groupedSections.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[32px]">
            <Search className="h-10 w-10 text-slate-800 mx-auto mb-4" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No matching controls found in this sectors.</p>
          </div>
        ) : (
          groupedSections.map((section, idx) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div
                className="group flex items-center justify-between p-4 cursor-pointer hover:bg-slate-900/30 rounded-xl transition-all"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center group-hover:border-indigo-500/30 transition-colors">
                    <section.icon className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">{section.title}</h3>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{section.count} Controls</p>
                  </div>
                </div>
                <ChevronRight className={`h-5 w-5 text-slate-600 transition-transform ${expandedSections.includes(section.id) ? 'rotate-90' : ''}`} />
              </div>

              {expandedSections.includes(section.id) && section.controls.length > 0 && (
                <div className="mt-2 ml-14 space-y-2">
                  {section.controls.map((control) => (
                    <motion.div
                      key={control.raw.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => setSelectedItem(control.raw)}
                    >
                      <Card className="bg-slate-950/30 border-slate-900 hover:border-indigo-500/30 transition-all cursor-pointer group hover:shadow-[0_0_20px_rgba(79,70,229,0.05)]">
                        <CardContent className="p-4 py-3">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <span className="text-[10px] font-bold text-indigo-400/80 w-12 shrink-0">{control.id}</span>
                              <div>
                                <p className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">{control.title}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{control.category}</span>
                                  {control.raw.reg_key && (
                                    <>
                                      <div className="h-1 w-1 rounded-full bg-slate-800" />
                                      <span className="text-[9px] text-slate-600 font-bold uppercase tracking-tighter">Reg: {control.raw.reg_key.split('\\').pop()}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`${control.severityBg} ${control.severityColor} px-2 py-0.5 rounded text-[8px] font-black tracking-tighter uppercase`}>
                                {control.severity}
                              </span>
                              <ChevronRight className="h-4 w-4 text-slate-700 opacity-0 group-hover:opacity-100 transition-all" />
                            </div>
                          </div>

                          {control.raw.solution && (
                            <div className="mt-3 pl-16 pr-8">
                              <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5">
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                                  <Terminal className="h-3 w-3 text-indigo-400" />
                                  Suggested Remediation
                                </p>
                                <p className="text-xs text-slate-400 font-mono line-clamp-2 leading-relaxed">
                                  {control.raw.solution}
                                </p>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>

      <AuditItemDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  )
}
