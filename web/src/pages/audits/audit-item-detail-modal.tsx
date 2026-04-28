import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldAlert, ShieldCheck, AlertTriangle, BookOpen, Wrench, Terminal, ChevronLeft, ChevronRight } from "lucide-react"
import { useEffect } from "react"
import type { AuditItemOut } from "@/types/audits"
import type { RuleResponse } from "@/types/benchmarks"

interface AuditItemDetailModalProps {
  isOpen: boolean
  onClose: () => void
  result: AuditItemOut | null
  auditItem: RuleResponse | null
  currentIndex?: number
  totalCount?: number
  onNavigate?: (index: number) => void
  timestamp?: string
}

const getStatusConfig = (passed: boolean | null) => {
  if (passed === true) {
    return {
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      glow: "shadow-[0_0_20px_rgba(52,211,153,0.2)]",
      label: "Compliance Passed"
    }
  } else if (passed === false) {
    return {
      icon: ShieldAlert,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      glow: "shadow-[0_0_20px_rgba(251,113,133,0.2)]",
      label: "Compliance Violation"
    }
  } else {
    return {
      icon: AlertTriangle,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      glow: "shadow-[0_0_20px_rgba(251,191,36,0.2)]",
      label: "Unknown / Error"
    }
  }
}

export function AuditItemDetailModal({
  isOpen,
  onClose,
  result,
  auditItem,
  currentIndex = 0,
  totalCount = 0,
  onNavigate,
  timestamp
}: AuditItemDetailModalProps) {

  useEffect(() => {
    if (!isOpen || !onNavigate) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'l' && currentIndex < totalCount - 1) {
        onNavigate(currentIndex + 1)
      } else if (e.key.toLowerCase() === 'k' && currentIndex > 0) {
        onNavigate(currentIndex - 1)
      } else if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, currentIndex, totalCount, onNavigate, onClose])

  if (!result) return null

  const status = getStatusConfig(result.passed)
  const Icon = status.icon

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[200]"
          />
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[201] p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-900 border border-slate-800 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl relative overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-800/50 flex items-start justify-between bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10 transition-all">
                <div className="flex gap-5">
                  <div className={`h-14 w-14 rounded-2xl ${status.bg} border ${status.border} flex items-center justify-center shrink-0 shadow-lg ${status.glow} transition-all duration-500`}>
                    <Icon className={`h-7 w-7 ${status.color}`} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${status.bg} ${status.color} border ${status.border}`}>
                        {status.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">ID: {auditItem?.index || "N/A"}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                      {auditItem?.description || "Audit Item Details"}
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {onNavigate && totalCount > 1 && (
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl px-1 mr-2">
                      <button
                        disabled={currentIndex === 0}
                        onClick={() => onNavigate(currentIndex - 1)}
                        className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                        title="Previous (K)"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div className="px-2 text-[10px] font-mono font-bold text-slate-600 border-x border-slate-800">
                        {currentIndex + 1} <span className="text-slate-800">/</span> {totalCount}
                      </div>
                      <button
                        disabled={currentIndex === totalCount - 1}
                        onClick={() => onNavigate(currentIndex + 1)}
                        className="p-2 text-slate-500 hover:text-white disabled:opacity-20 transition-colors"
                        title="Next (L)"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 overflow-y-auto custom-scrollbar space-y-8 flex-1">
                {/* Scan Result Output */}
                <section className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Terminal className="h-4 w-4" />
                    <h3 className="text-xs font-bold uppercase tracking-widest">Evidence / Technical Detail</h3>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 font-mono text-xs leading-relaxed text-slate-300 shadow-inner group relative">
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] text-slate-600 bg-slate-900 px-2 py-1 rounded uppercase font-bold">Raw Output</span>
                    </div>
                    {result.actual_value || "No additional technical details captured during this check."}
                  </div>
                </section>

                <div className="grid md:grid-cols-2 gap-8">
                  {/* Rationale */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400">
                      <BookOpen className="h-4 w-4" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Rationale</h3>
                    </div>
                    <div className="text-sm text-slate-400 leading-relaxed bg-slate-900/30 p-1 rounded-lg">
                      {auditItem?.info || "Information detailing the rationale for this security control is not currently available for this benchmark item."}
                    </div>
                  </section>

                  {/* Remediation */}
                  <section className="space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Wrench className="h-4 w-4" />
                      <h3 className="text-xs font-bold uppercase tracking-widest">Remediation Steps</h3>
                    </div>
                    <div className="text-sm text-slate-400 leading-relaxed bg-slate-900/30 p-1 rounded-lg">
                      {auditItem?.solution ? (
                        <div className="space-y-2">
                          {auditItem.solution.split('\n').map((line: string, i: number) => (
                            <p key={i}>{line}</p>
                          ))}
                        </div>
                      ) : (
                        "Specific remediation steps for this vulnerability have not been defined in the current benchmark library."
                      )}
                    </div>
                  </section>
                </div>

                {/* Metadata & References */}
                <div className="pt-4 border-t border-slate-800/50 flex flex-wrap gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Reference Frameworks</span>
                    <div className="flex gap-2">
                      {auditItem?.reference && auditItem.reference.length > 0 ? (
                        auditItem.reference.map((ref: string, i: number) => (
                          <span key={i} className="text-[10px] font-bold text-indigo-400/80 bg-indigo-500/5 border border-indigo-500/10 px-2 py-0.5 rounded uppercase">
                            {ref}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-700 italic">No external references</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-6 border-t border-slate-800/50 bg-slate-950/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-slate-800" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    {timestamp ? (
                      <>Detected {new Date(timestamp).toLocaleDateString()} at {new Date(timestamp).toLocaleTimeString()}</>
                    ) : (
                      "Scan Timestamp Unavailable"
                    )}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    disabled
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Generate Ticket
                  </button>
                  <button
                    onClick={onClose}
                    className="px-8 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all border border-slate-700/50 shadow-lg"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
