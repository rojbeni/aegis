import { Bell, ChevronRight, UserCircle } from "lucide-react"
import { useLocation, Link } from "react-router-dom"
import { useEffect, useState } from "react"
import authService from "@/services/auth"
import type { User } from "@/types/auth"

export function Header() {
  const location = useLocation()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(authService.getUser())
  }, [])

  // Basic breadcrumb logic
  const pathnames = location.pathname.split("/").filter((x) => x)

  const getBreadcrumbLabel = (path: string) => {
    switch (path) {
      case "assets": return "Asset Inventory"
      case "benchmarks": return "Benchmark Library"
      case "scans": return "Scan Operations"
      default: return path.charAt(0).toUpperCase() + path.slice(1)
    }
  }

  return (
    <header className="h-16 border-b border-slate-900/50 bg-slate-950/20 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
        <Link to="/" className="hover:text-indigo-400 transition-colors">Library</Link>
        {pathnames.length > 0 && <ChevronRight className="h-3 w-3" />}
        {pathnames.map((value, index) => {
          const last = index === pathnames.length - 1
          const to = `/${pathnames.slice(0, index + 1).join("/")}`

          return (
            <div key={to} className="flex items-center gap-2">
              {last ? (
                <span className="text-indigo-400">{getBreadcrumbLabel(value)}</span>
              ) : (
                <>
                  <Link to={to} className="hover:text-indigo-400 transition-colors">
                    {getBreadcrumbLabel(value)}
                  </Link>
                  <ChevronRight className="h-3 w-3" />
                </>
              )}
            </div>
          )
        })}
      </nav>

      {/* Right side actions */}
      <div className="flex items-center gap-6">
        <button className="relative p-2 text-slate-400 hover:text-white transition-colors group">
          <Bell className="h-5 w-5" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-indigo-500 rounded-full border-2 border-slate-950 group-hover:scale-110 transition-transform" />
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-slate-900">
          <div className="text-right flex flex-col items-end">
            <span className="text-sm font-bold text-slate-200">
              {user?.display_name || user?.username}
            </span>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
              {user?.role || user?.email}
            </span>
          </div>
          <div className="h-10 w-10 rounded-full border border-slate-800 bg-slate-900 flex items-center justify-center overflow-hidden">
            <UserCircle className="h-8 w-8 text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  )
}
