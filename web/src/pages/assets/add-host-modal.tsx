import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Monitor,
  Network,
  Settings,
  Plus,
  Shield,
  Loader2,
  AlertCircle,
  CheckCircle2
} from "lucide-react"
import { useState } from "react"
import assetService from "@/services/assets"

interface AddHostModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function AddHostModal({ isOpen, onClose, onSuccess }: AddHostModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    hostname: "",
    ip_address: "",
    os: "",
    auto_scan: true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await assetService.createHost(formData)
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setFormData({
          hostname: "",
          ip_address: "",
          os: "",
          auto_scan: true
        })
        onSuccess?.()
        onClose()
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to register mission asset.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!loading ? onClose : undefined}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-xl bg-[#140e2e] border border-white/5 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
          >
            {/* Header Glow */}
            <div className={`absolute top-0 left-0 w-full h-1 transition-colors duration-500 ${success ? "bg-emerald-500" : error ? "bg-rose-500" : "bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"
              }`} />

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Add New Host</h2>
                  <p className="text-sm text-slate-400">Register a new network endpoint to the AEGIS neural net.</p>
                </div>
                {!loading && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="p-2 text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-xl"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>

              {/* Status Message */}
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center gap-3 text-rose-500 text-sm font-bold"
                  >
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3 text-emerald-500 text-sm font-bold"
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    Host registered successfully. Synchronizing...
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hostname */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Monitor className="h-3 w-3" />
                    Hostname
                  </label>
                  <input
                    required
                    disabled={loading}
                    type="text"
                    placeholder="e.g. SRV-SCAN-01"
                    value={formData.hostname}
                    onChange={(e) => setFormData({ ...formData, hostname: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* IP Address */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Network className="h-3 w-3" />
                    IP Address
                  </label>
                  <input
                    disabled={loading}
                    type="text"
                    placeholder="192.168.1.XX"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                  />
                </div>

                {/* OS Version */}
                <div className="space-y-2 md:col-span-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <Settings className="h-3 w-3" />
                    OS
                  </label>
                  <input
                    disabled={loading}
                    type="text"
                    placeholder="e.g. Windows Server 2025"
                    value={formData.os}
                    onChange={(e) => setFormData({ ...formData, os: e.target.value })}
                    className="w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Auto-Scan Toggle */}
              <div className="flex items-center justify-between p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                <div className="flex gap-4">
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/20">
                    <Shield className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white uppercase tracking-tight">Enable Auto-Scan</span>
                    <span className="text-[10px] text-indigo-400/60 font-medium">Scheduled vulnerability scanning every 24h</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setFormData({ ...formData, auto_scan: !formData.auto_scan })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.auto_scan ? 'bg-indigo-600' : 'bg-slate-800'}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.auto_scan ? 'translate-x-6' : 'translate-x-1'}`}
                  />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={onClose}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 py-4 rounded-2xl font-bold text-sm border border-white/5 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.hostname}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-sm shadow-[0_10px_20px_rgba(79,70,229,0.3)] border border-indigo-400/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Add Host
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
