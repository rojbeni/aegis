import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, FileCode, Loader2, CheckCircle2, AlertCircle } from "lucide-react"
import benchmarkService from "@/services/benchmarks"

interface ImportBenchmarkModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function ImportBenchmarkModal({ isOpen, onClose, onSuccess }: ImportBenchmarkModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".audit")) {
        setError("Only .audit files are supported")
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsImporting(true)
    setError(null)
    try {
      await benchmarkService.importBenchmark(file)
      setIsSuccess(true)
      setTimeout(() => {
        onSuccess?.()
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to import benchmark")
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setError(null)
    setIsImporting(false)
    setIsSuccess(false)
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
              className="bg-slate-900 border border-slate-800 w-full max-w-xl p-0 rounded-2xl shadow-2xl relative overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800/50">
                <h2 className="text-xl font-bold text-white tracking-tight">Import New Benchmark</h2>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-8 space-y-6">
                {isSuccess ? (
                  <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">Import Successful</h3>
                      <p className="text-sm text-slate-400 mt-1">Found and indexed all audit items correctly.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".audit"
                        className="hidden"
                      />
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-3 transition-all group cursor-pointer ${file
                          ? "border-emerald-500/30 bg-emerald-500/5"
                          : error
                            ? "border-red-500/30 bg-red-500/5"
                            : "border-slate-800 bg-slate-950/20 hover:bg-slate-950/40 hover:border-indigo-500/30"
                          }`}
                      >
                        <div className={`h-12 w-12 rounded-xl border flex items-center justify-center transition-all ${file
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : "bg-slate-900 border-slate-800 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20"
                          }`}>
                          <FileCode className={`h-6 w-6 transition-colors ${file ? "text-emerald-400" : "text-slate-500 group-hover:text-indigo-400"
                            }`} />
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-bold transition-colors ${file ? "text-emerald-400" : "text-slate-300 group-hover:text-white"
                            }`}>
                            {file ? file.name : "Upload .audit File"}
                          </p>
                          <p className="text-xs text-slate-600 mt-1 font-medium">
                            {file ? `${(file.size / 1024).toFixed(1)} KB` : "Drag and drop your benchmark definition here"}
                          </p>
                        </div>
                      </div>

                      {error && (
                        <div className="flex items-center gap-2 text-red-400 text-xs font-medium px-2 py-2 bg-red-500/5 border border-red-500/10 rounded-lg">
                          <AlertCircle className="h-3.5 w-3.5" />
                          {error}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {!isSuccess && (
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-800/50 bg-slate-900/50">
                  <button
                    onClick={handleClose}
                    disabled={isImporting}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={!file || isImporting}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-2.5 rounded-xl font-bold text-xs shadow-[0_0_15px_rgba(79,70,229,0.3)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      "Import Benchmark"
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
