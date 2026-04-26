import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, FileText, CheckCircle2, XCircle, AlertCircle as AlertIcon, ChevronRight } from "lucide-react"
import auditService from "@/services/audits"
import type { AuditItemOut, ScanResponse } from "@/types/audits"
import { AuditItemDetailModal } from "./audit-item-detail-modal"

interface ScanAnalysisViewProps {
  scan: ScanResponse
}

export function ScanAnalysisView({ scan }: ScanAnalysisViewProps) {
  const [auditItems, setAuditItems] = useState<AuditItemOut[]>([])
  const [loadingResults, setLoadingResults] = useState(false)

  // Detail Modal State
  const [selectedResult, setSelectedResult] = useState<AuditItemOut | null>(null)
  const [selectedResultIndex, setSelectedResultIndex] = useState(0)
  const [isAuditDetailOpen, setIsAuditDetailOpen] = useState(false)

  useEffect(() => {
    const fetchAuditItems = async () => {
      try {
        setLoadingResults(true)
        const items = await auditService.getAuditItems(scan.id)
        setAuditItems(items)
      } catch (err) {
        console.error("Failed to fetch audit items:", err)
      } finally {
        setLoadingResults(false)
      }
    }
    fetchAuditItems()
  }, [scan.id])

  const handleOpenDetail = (result: AuditItemOut, index: number) => {
    setSelectedResult(result)
    setSelectedResultIndex(index)
    setIsAuditDetailOpen(true)
  }

  const handleNavigate = (index: number) => {
    if (index < 0 || index >= scan.items.length) return
    setSelectedResult(scan.items[index])
    setSelectedResultIndex(index)
  }

  return (
    <div className="space-y-4">
      <AuditItemDetailModal
        isOpen={isAuditDetailOpen}
        onClose={() => setIsAuditDetailOpen(false)}
        result={selectedResult}
        auditItem={selectedResult?.rule || null}
        currentIndex={selectedResultIndex}
        totalCount={auditItems.length || 0}
        onNavigate={handleNavigate}
        timestamp={scan.created_at}
      />

      {loadingResults ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">Analyzing Trace Evidence...</p>
        </div>
      ) : auditItems.length === 0 ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-4 border border-slate-800 rounded-2xl bg-slate-900/20">
          <FileText className="h-8 w-8 text-slate-700" />
          <p className="text-sm font-medium text-slate-500">No audit results available for this scan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {auditItems.map((res, i) => {
            const auditItem = res.rule
            const isPassed = res.passed === true
            const isFailed = res.passed === false

            return (
              <motion.button
                key={res.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => handleOpenDetail(res, i)}
                className="w-full text-left p-4 bg-slate-900/40 border border-slate-800/60 rounded-2xl hover:border-indigo-500/30 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isPassed ? 'bg-emerald-500/10 text-emerald-400' :
                    isFailed ? 'bg-rose-500/10 text-rose-400' :
                      'bg-amber-500/10 text-amber-400'
                    }`}>
                    {isPassed ? <CheckCircle2 className="h-5 w-5" /> :
                      isFailed ? <XCircle className="h-5 w-5" /> :
                        <AlertIcon className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white tracking-tight group-hover:text-indigo-400 transition-colors uppercase">
                      {auditItem?.description || `Audit Check ${res.id}`}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">{auditItem?.index || 'Unknown Rule'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isPassed ? 'text-emerald-500' :
                    isFailed ? 'text-rose-500' :
                      'text-amber-500'
                    }`}>
                    {isPassed ? 'PASS' : isFailed ? 'FAIL' : 'UNKNOWN'}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-indigo-500 transition-colors" />
                </div>
              </motion.button>
            )
          })}
        </div>
      )}
    </div>
  )
}
