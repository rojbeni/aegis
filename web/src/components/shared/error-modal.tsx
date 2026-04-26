import { motion, AnimatePresence } from "framer-motion"
import { Zap, RefreshCcw, X } from "lucide-react"

interface ConnectionErrorModalProps {
  isOpen: boolean
  onClose: () => void
  onRetry: () => void
  errorDetails?: {
    code: string
    message: string
    timestamp: string
  }
}

export function ConnectionErrorModal({ isOpen, onClose, onRetry, errorDetails }: ConnectionErrorModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#140e2e] border border-red-500/20 rounded-[32px] overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.15)]"
          >
            {/* Red Glow Header */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

            <div className="p-8 flex flex-col items-center text-center space-y-6">
              {/* Error Icon */}
              <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 relative">
                <div className="absolute inset-0 rounded-full bg-red-500/10 animate-ping" />
                <Zap className="h-8 w-8 text-red-500 fill-red-500/20" />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-white tracking-tight">Connection Error</h2>
                <p className="text-sm text-slate-400 leading-relaxed px-4">
                  We're unable to communicate with the AEGIS Neural Net backend. This might be due to a transient network issue or server maintenance.
                </p>
              </div>

              {/* Error Log Box */}
              <div className="w-full bg-slate-900/50 rounded-2xl border border-white/5 p-4 text-left font-mono text-[10px] space-y-1 relative group hover:border-red-500/20 transition-colors">
                <div className="text-indigo-400 font-bold mb-2 tracking-widest uppercase">ERROR LOG</div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Status:</span>
                  <span className="text-red-500 font-bold">FAIL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Code:</span>
                  <span className="text-red-500 font-bold">{errorDetails?.code || "ERR_UNKNOWN_0x0"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 uppercase">Timestamp:</span>
                  <span className="text-slate-600">{errorDetails?.timestamp || "N/A"}</span>
                </div>
                <div className="flex flex-col mt-2 pt-2 border-t border-white/5">
                  <span className="text-slate-500 uppercase text-[8px] mb-1">Message:</span>
                  <span className="text-slate-400 break-words line-clamp-2">{errorDetails?.message || "Communication failure detected."}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col w-full gap-3 pt-2">
                <motion.button
                  whileHover={{ scale: 1.02, translateY: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRetry}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold text-sm shadow-[0_10px_20px_rgba(79,70,229,0.3)] border border-indigo-400/20 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Retry Connection
                </motion.button>
                <button
                  onClick={onClose}
                  className="w-full bg-slate-900/50 hover:bg-slate-900 text-slate-300 py-4 rounded-2xl font-bold text-sm border border-white/5 transition-all flex items-center justify-center gap-2"
                >
                  Dismiss
                </button>
              </div>
            </div>

            {/* Corner Close Button */}
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
