import React, { useState } from "react"
import { motion } from "framer-motion"
import { AtSign, Lock, Eye, EyeOff, Key, ShieldCheck, HelpCircle, FileText, Loader2, AlertCircle } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import authService from "@/services/auth"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await authService.login(email, password)
      authService.setToken(response.access_token)
      navigate("/")
    } catch (err: any) {
      console.error("Login failed:", err)
      if (err.response) {
        if (err.response.status === 401 || err.response.status === 403) {
          setError("Invalid enterprise credentials. Please check your email and password.")
        } else {
          setError("Authentication service returned an error. Please try again later.")
        }
      } else if (!err.request) {
        setError("An unexpected error occurred. Please try again.")
      }
      // Note: err.request (connection errors) are now handled globally
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#0a051a] text-slate-300 relative overflow-hidden font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1a3a_1px,transparent_1px),linear-gradient(to_bottom,#1f1a3a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20" />
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(79,70,229,0.1),transparent_50%)]" />
      </div>

      {/* Top Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-12 py-8">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] border border-indigo-400/20">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white uppercase">AEG<span className="text-indigo-500">is</span> <span className="text-slate-500 font-medium text-xs tracking-[0.3em] ml-2">PLATFORM</span></span>
        </div>
        <div className="flex items-center gap-8">
          <Link to="#" className="text-[10px] font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors">Documentation</Link>
          <Link to="#" className="text-[10px] font-bold uppercase tracking-widest hover:text-indigo-400 transition-colors">Support</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 flex flex-col items-center justify-center pt-12 pb-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[480px]"
        >
          {/* Login Card */}
          <div className="bg-[#140e2e]/80 backdrop-blur-2xl border border-white/5 rounded-[32px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />

            <div className="p-12 space-y-8">
              <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
                <p className="text-sm font-medium text-slate-500">Access your enterprise security dashboard</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 ml-1">Enterprise Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <AtSign className="h-4 w-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full bg-[#0a051a]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-white placeholder:text-slate-700"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Password</label>
                    <Link to="#" className="text-[10px] font-bold text-indigo-400/80 hover:text-indigo-400 uppercase tracking-widest transition-colors">Forgot password?</Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="************"
                      className="w-full bg-[#0a051a]/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-4 focus:ring-indigo-500/10 transition-all text-white placeholder:text-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="flex items-center gap-2 p-4 rounded-xl bg-red-400/10 border border-red-500/20 text-red-500 text-xs font-medium"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Submit Action */}
                <motion.button
                  whileHover={{ scale: 1.01, translateY: -2 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-sm shadow-[0_15px_30px_rgba(79,70,229,0.3)] border border-indigo-400/20 transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Sign in to AEGIS"
                  )}
                </motion.button>

                {/* Separator */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5"></div></div>
                  <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                    <span className="bg-[#140e2e] px-4 text-slate-600">Corporate Access</span>
                  </div>
                </div>

                {/* SSO Button */}
                <button
                  type="button"
                  className="w-full bg-slate-900/50 hover:bg-slate-900 border border-white/5 text-slate-300 py-4 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 group"
                >
                  <Key className="h-4 w-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                  Single Sign-On (SSO)
                </button>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 pt-4">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80">Secure Encrypted Connection</span>
                </div>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Footer Navigation */}
        <div className="mt-16 space-y-8 text-center">
          <div className="flex items-center justify-center gap-8">
            <Link to="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors">Privacy Policy</Link>
            <Link to="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors">Terms of Service</Link>
            <Link to="#" className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-slate-400 transition-colors">Security Audit</Link>
          </div>

          <div className="flex items-center justify-center gap-12 opacity-30 grayscale hover:opacity-60 grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-slate-400" />
              <span className="text-[8px] font-black tracking-tighter uppercase">ISO 27001</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <FileText className="h-8 w-8 text-slate-400" />
              <span className="text-[8px] font-black tracking-tighter uppercase">SOC2 Type II</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <HelpCircle className="h-8 w-8 text-slate-400" />
              <span className="text-[8px] font-black tracking-tighter uppercase">GDPR Compliant</span>
            </div>
          </div>
        </div>
      </main>

      {/* Decorative Text */}
      <div className="absolute left-8 bottom-8 hidden lg:block space-y-1">
        <p className="text-[8px] font-bold text-slate-800 uppercase tracking-widest">System Engine: v4.28.alpha</p>
        <p className="text-[8px] font-bold text-slate-800 uppercase tracking-widest">Hardware: Aegis Core Cluster</p>
        <p className="text-[8px] font-bold text-slate-800 uppercase tracking-widest">Status: Ready</p>
      </div>
    </div>
  )
}
