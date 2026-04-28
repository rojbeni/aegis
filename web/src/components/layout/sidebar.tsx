import { LayoutDashboard, ShieldCheck, Database, Scan, LogOut, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link, useLocation } from "react-router-dom"

const menuItems = [
  { icon: LayoutDashboard, label: "Command Center", href: "/" },
  { icon: ShieldCheck, label: "Asset Inventory", href: "/assets" },
  { icon: Scan, label: "Live Scans", href: "/audits" },
  { icon: Database, label: "Benchmark Library", href: "/benchmarks" },
]

export function Sidebar() {
  const location = useLocation()

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-950 text-slate-300 border-r border-slate-900 sticky top-0">
      <div className="flex h-20 items-center px-6 border-b border-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <ShieldCheck className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white uppercase">AEG<span className="text-indigo-500">is</span></span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-8">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.label}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-indigo-600/10 text-indigo-400 border border-indigo-600/20 shadow-[inset_0_0_10px_rgba(79,70,229,0.1)]"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                )}
              >
                <item.icon
                  className={cn(
                    "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-indigo-400"
                  )}
                />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-slate-900/50 p-4">
        <div className="mb-4 flex items-center gap-3 px-2 py-3 rounded-xl bg-slate-900/30 border border-slate-800/50">
          <div className="h-10 w-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
            <UserCircle className="h-8 w-8 text-slate-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate">Admin Operator</p>
            <p className="text-[10px] font-medium text-emerald-500 uppercase tracking-wider">Level 4 Clearance</p>
          </div>
        </div>
        <button className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-rose-500/10 hover:text-rose-400">
          <LogOut className="mr-3 h-4 w-4" />
          Terminal Exit
        </button>
      </div>
    </div>
  )
}
