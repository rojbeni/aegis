import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import DashboardPage from "@/pages/dashboard"
import AssetsPage from "@/pages/assets"
import BenchmarksPage from "@/pages/benchmarks"
import BenchmarkDetailsPage from "@/pages/benchmarks/details"
import AuditsPage from "@/pages/audits"
import LoginPage from "@/pages/login"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/assets" element={<AssetsPage />} />
            <Route path="/benchmarks" element={<BenchmarksPage />} />
            <Route path="/benchmarks/:id" element={<BenchmarkDetailsPage />} />
            <Route path="/audits" element={<AuditsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
