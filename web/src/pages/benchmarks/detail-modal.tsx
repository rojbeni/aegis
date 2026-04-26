import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  ShieldAlert,
  Info,
  Terminal,
  Copy,
  Check,
  ShieldQuestion,
  Settings
} from "lucide-react"
import { useState } from "react"
import type { AuditItemResponse } from "@/types/benchmarks"

interface AuditItemDetailModalProps {
  item: AuditItemResponse | null
  onClose: () => void
}

export function AuditItemDetailModal({ item, onClose }: AuditItemDetailModalProps) {
  const [copied, setCopied] = useState(false)

  if (!item) return null

  const handleCopy = () => {
    if (item.solution) {
      navigator.clipboard.writeText(item.solution)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Parse risk from description or type
  const getRiskLevel = () => {
    const desc = item.description?.toLowerCase() || ""
    if (desc.includes("critical") || desc.includes("high")) return { label: "High Risk", color: "text-rose-500", bg: "bg-rose-500/10" }
    if (desc.includes("medium") || desc.includes("ensure")) return { label: "Medium Risk", color: "text-amber-500", bg: "bg-amber-500/10" }
    return { label: "Low Risk", color: "text-blue-500", bg: "bg-blue-500/10" }
  }

  const risk = getRiskLevel()

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-900 border border-slate-800 rounded-[32px] shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-800 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shrink-0">
                <ShieldQuestion className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white tracking-tight">Audit Item Details</h2>
                  <span className={`${risk.bg} ${risk.color} px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter`}>
                    {risk.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  INDEX: <span className="text-indigo-400">{item.index || "N/A"}</span> • TYPE: {item.type.replace(/_/g, " ")}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-10 w-10 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Description */}
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em]">
                <Info className="h-3.5 w-3.5" />
                Description
              </div>
              <p className="text-slate-300 text-sm leading-relaxed font-medium bg-slate-950/30 p-4 rounded-2xl border border-slate-800/50">
                {item.description}
              </p>
            </section>

            {/* Registry Info */}
            {item.reg_key && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">
                  <Settings className="h-3.5 w-3.5" />
                  Registry Configuration
                </div>
                <div className="p-4 bg-amber-400/5 rounded-2xl border border-amber-400/10 font-mono text-[10px] space-y-1">
                  <p className="text-slate-300"><span className="text-slate-500">KEY:</span> {item.reg_key}</p>
                  {item.reg_item && <p className="text-slate-300"><span className="text-slate-500">ITEM:</span> {item.reg_item}</p>}
                  {item.reg_option && <p className="text-slate-300"><span className="text-slate-500">OPTION:</span> {item.reg_option}</p>}
                  {item.value_data && <p className="text-emerald-400"><span className="text-slate-500">EXPECTED:</span> {item.value_data}</p>}
                </div>
              </section>
            )}

            {/* Audit Policy Info */}
            {item.audit_policy_subcategory && (
              <section className="space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em]">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  Audit Policy
                </div>
                <div className="p-4 bg-rose-400/5 rounded-2xl border border-rose-400/10">
                  <p className="text-slate-300 text-sm font-medium">
                    Subcategory: <span className="text-white">{item.audit_policy_subcategory}</span>
                  </p>
                  {item.right_type && (
                    <p className="text-slate-400 text-xs mt-1">
                      Right Type: {item.right_type}
                    </p>
                  )}
                </div>
              </section>
            )}

            {/* Solution / Remediation */}
            {item.solution && (
              <section className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">
                  <Terminal className="h-3.5 w-3.5" />
                  Remediation Steps
                </div>
                <div className="relative group">
                  <div className="absolute top-4 right-4 z-10">
                    <button
                      onClick={handleCopy}
                      className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-white hover:border-indigo-500/50 transition-all opacity-0 group-hover:opacity-100"
                      title="Copy code"
                    >
                      {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                  <pre className="p-5 pt-12 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto font-mono text-xs text-indigo-300 leading-relaxed shadow-inner">
                    <div className="absolute top-4 left-5 flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                    </div>
                    {item.solution}
                  </pre>
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-slate-800 bg-slate-950/50 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
              >
                Dismiss
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-[0_0_20px_rgba(79,70,229,0.3)] transition-all"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Remediation"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
