import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Search,
  Plus,
  Download,
  Server,
  Activity,
  ChevronRight,
  Filter,
  MoreHorizontal,
  Loader2,
  ChevronLeft,
  Cpu
} from "lucide-react"
import { motion } from "framer-motion"
import { AddHostModal } from "@/pages/assets/add-host-modal"
import assetService from "@/services/assets"
import type { HostResponse } from "@/types/assets"

const WindowsLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M0 3.449L9.75 2.1V11.7H0V3.449zM0 12.3h9.75v9.6L0 20.551V12.3zM10.55 1.988L24 0v11.7H10.55V1.988zM10.55 12.3H24v11.7l-13.45-1.988V12.3z" />
  </svg>
)

const AppleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.057 12.721c.018 3.094 2.684 4.12 2.71 4.133-.021.077-.425 1.458-1.411 2.895-1.144 1.666-2.33 3.321-4.223 3.321-1.893 0-2.336-1.129-4.524-1.129-2.188 0-2.73 1.129-4.524 1.129-1.893 0-3.155-1.782-4.299-3.448-2.336-3.407-4.12-9.613-1.693-13.842 1.205-2.099 3.361-3.428 5.71-3.46 1.833-.034 3.488 1.144 4.542 1.144 1.054 0 2.91-1.393 5.09-1.393.905.004 3.45.328 5.084 2.728-.13.08-3.033 1.764-3.002 5.419zm-3.04-10.421c-.96.012-2.126.791-2.946 1.768-.82.977-1.42 2.37-1.288 3.655l.132.01c1.03 0 2.228-.797 3.014-1.768.785-.97 1.341-2.308 1.088-3.665z" />
  </svg>
)

const LinuxLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.97 0C9.643 0 7.82.253 6.643.76c-.468.201-.842.449-1.119.744-.277.294-.467.625-.568.995-.1.37-.116.78-.051 1.229.065.449.213.931.442 1.439l8.604 18.833 8.604-18.833c.229-.508.377-.99.442-1.439.065-.449.049-.859-.051-1.229-.101-.37-.291-.701-.568-.995-.277-.295-.651-.543-1.119-.744C20.12.253 18.297 0 15.97 0h-4z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
)

const getOSIcon = (os_family?: string) => {
  const family = os_family?.toLowerCase()
  const iconClass = "h-5 w-5 text-indigo-400"
  if (family?.includes("windows")) return <WindowsLogo className={iconClass} />
  if (family?.includes("linux")) return <LinuxLogo className={iconClass} />
  if (family?.includes("mac") || family?.includes("darwin")) return <AppleLogo className={iconClass} />
  if (family?.includes("other")) return <Cpu className={iconClass} />
  return <Server className={iconClass} />
}

export default function AssetsPage() {
  const [filter, setFilter] = useState("All")
  const [isAddHostOpen, setIsAddHostOpen] = useState(false)
  const [assets, setAssets] = useState<HostResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalAssets, setTotalAssets] = useState(0)
  const pageSize = 10

  const fetchAssets = async () => {
    try {
      setLoading(true)
      const skip = (currentPage - 1) * pageSize
      const data = await assetService.listHosts(skip, pageSize)
      setAssets(data.items || [])
      setTotalAssets(data.total || 0)
    } catch (error) {
      console.error("Failed to fetch assets:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAssets()
  }, [currentPage])

  const filteredAssets = (assets || []).filter(asset => {
    if (filter === "All" || filter === "All Assets") return true
    if (filter === "Online") return asset.active
    if (filter === "Offline") return !asset.active
    return true
  })

  const totalPages = Math.ceil(totalAssets / pageSize)
  const startIdx = (currentPage - 1) * pageSize + 1
  const endIdx = Math.min(currentPage * pageSize, totalAssets)

  return (
    <div className="space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-4xl font-bold tracking-tight text-white flex items-center gap-3"
            >
              Asset Inventory
              <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded uppercase tracking-widest">
                Mission Active
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-slate-400 font-medium"
            >
              Monitor and maintain your network endpoint security
            </motion.p>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-4 py-2.5 rounded-xl border border-white/5 transition-all text-sm font-bold flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, translateY: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsAddHostOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] border border-indigo-400/20 transition-all text-sm font-bold flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Host
            </motion.button>
          </div>
        </div>

        {/* Tactical Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/40 p-2 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex p-1 bg-slate-950/50 rounded-xl border border-white/5">
            {["All Assets", "Online", "Offline"].map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${(item === "All Assets" && filter === "All") || filter === item
                  ? "bg-indigo-600 text-white shadow-lg"
                  : "text-slate-500 hover:text-slate-300"
                  }`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="flex flex-1 max-w-md gap-3">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
              <input
                type="text"
                placeholder="Search by Hostname, IP, or OS..."
                className="w-full bg-slate-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <button className="p-2 bg-slate-950 border border-white/5 rounded-xl text-slate-500 hover:text-indigo-400 transition-colors">
              <Filter className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <Card className="bg-slate-900/20 border-white/5 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/40">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">HOSTNAME</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">STATUS</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">IP ADDRESS</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">OS</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 text-center">AUTO SCAN</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5">LAST SCANNED</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-white/5 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Scanning Neural Net...</p>
                      </div>
                    </td>
                  </tr>
                ) : filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Server className="h-8 w-8 text-slate-700" />
                        <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">No assets registered in this sector.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset, idx) => (
                    <motion.tr
                      key={asset.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="group hover:bg-indigo-500/5 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            {getOSIcon(asset.os)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{asset.hostname}</span>
                            <span className="text-[10px] text-slate-500 font-mono">NODE_UID: {String(asset.id).split('-')[0].toUpperCase()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.2)] ${asset.active ? "bg-emerald-500 shadow-emerald-500/50 animate-pulse" : "bg-slate-600"
                            }`} />
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${asset.active ? "text-emerald-500" : "text-slate-500"
                            }`}>
                            {asset.active ? "Online" : "Offline"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-mono text-slate-400 bg-slate-950/50 px-2 py-1 rounded border border-white/5">
                          {asset.ip_address || "UNASSIGNED"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm">
                        <div className="flex flex-col">
                          <span className="text-slate-300 font-medium">{asset.os || "Unknown"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${asset.auto_scan
                            ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                            : "bg-slate-500/10 text-slate-500 border-slate-500/20"
                          }`}>
                          {asset.auto_scan ? "ENABLED" : "DISABLED"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-medium text-slate-400">{asset.last_seen_at ? new Date(asset.last_seen_at).toLocaleTimeString() : "Never"}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1, color: "#818cf8" }}
                            className="p-2 text-slate-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                          >
                            <Activity className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1, color: "#818cf8" }}
                            className="p-2 text-slate-500 hover:bg-indigo-500/10 rounded-lg transition-all"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        {/* Footer */}
        <div className="bg-slate-950/40 border-t border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            <span>Showing {startIdx}-{endIdx} of {totalAssets} assets</span>
            <div className="h-1 w-1 rounded-full bg-slate-800" />
            <span>Sector: AEGIS_PRIMARY_GRID</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/5 text-slate-500 hover:text-white hover:border-white/10 transition-all bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3 w-3" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`h-8 w-8 rounded-lg text-[10px] font-bold border transition-all ${p === currentPage ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg' : 'bg-slate-950 border-white/5 text-slate-500 hover:text-white hover:border-white/10'}`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="h-8 w-8 flex items-center justify-center rounded-lg border border-white/5 text-slate-500 hover:text-white hover:border-white/10 transition-all bg-slate-950 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </Card>

      {/* HUD Info */}
      <div className="flex items-center justify-between px-2 pt-4 border-t border-white/[0.02]">
        <div className="flex gap-6">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">Data Feed</p>
            <p className="text-[9px] font-bold text-slate-500">Live Telemetry Linked</p>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-700 uppercase tracking-[0.2em]">Encryption</p>
            <p className="text-[9px] font-bold text-slate-500">AES-256 Quantum Shield</p>
          </div>
        </div>
        <p className="text-[9px] font-bold text-slate-700 italic">
          © 2026 AEGIS STRATEGIC DEFENSE. AUTHORIZED PERSONNEL ONLY.
        </p>
      </div>

      <AddHostModal
        isOpen={isAddHostOpen}
        onClose={() => setIsAddHostOpen(false)}
        onSuccess={fetchAssets}
      />
    </div>
  )
}
