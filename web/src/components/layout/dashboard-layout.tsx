import { useState, useEffect } from "react"
import { Sidebar } from "./sidebar"
import { Header } from "./header"
import { Outlet, useNavigate } from "react-router-dom"
import { ConnectionErrorModal } from "../shared/error-modal"

export function DashboardLayout() {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false)
  const [errorDetails, setErrorDetails] = useState<{ code: string; message: string; timestamp: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    const handleConnectionError = (event: Event) => {
      const customEvent = event as CustomEvent
      if (customEvent.detail) {
        setErrorDetails(customEvent.detail)
      }
      setIsErrorModalOpen(true)
    }
    const handleAuthError = () => navigate("/login")

    window.addEventListener("aegis:connection_error", handleConnectionError)
    window.addEventListener("aegis:auth_error", handleAuthError)

    return () => {
      window.removeEventListener("aegis:connection_error", handleConnectionError)
      window.removeEventListener("aegis:auth_error", handleAuthError)
    }
  }, [navigate])

  return (
    <div className="flex min-h-screen w-full bg-slate-950 text-slate-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto relative bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-slate-950 to-slate-950">
          <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>

      <ConnectionErrorModal
        isOpen={isErrorModalOpen}
        onClose={() => setIsErrorModalOpen(false)}
        errorDetails={errorDetails}
        onRetry={() => {
          console.log("Retrying connection...")
          setIsErrorModalOpen(false)
        }}
      />
    </div>
  )
}
