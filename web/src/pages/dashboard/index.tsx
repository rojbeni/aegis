import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Zap, Verified, AlertTriangle, Activity } from "lucide-react"
import { motion } from "framer-motion"

const stats = [
  { 
    title: "Total Assets", 
    value: "14,284", 
    change: "+2.4%", 
    isPositive: true,
    icon: Shield, 
    color: "bg-blue-500/10 text-blue-500",
    description: "Monitored endpoints"
  },
  { 
    title: "Active Scans", 
    value: "82", 
    change: "+12%", 
    isPositive: true,
    icon: Zap, 
    color: "bg-yellow-500/10 text-yellow-500",
    description: "Deep Packet Inspection: ON"
  },
  { 
    title: "Compliance", 
    value: "Grade A+", 
    change: "9 Nodes", 
    isPositive: false,
    icon: Verified, 
    color: "bg-emerald-500/10 text-emerald-500",
    description: "9 Nodes Non-Compliant"
  },
  { 
    title: "Critical Findings", 
    value: "12", 
    change: "Immediate", 
    isPositive: false,
    icon: AlertTriangle, 
    color: "bg-rose-500/10 text-rose-500",
    description: "Action Required"
  },
]

const intelligence = [
  {
    type: "Unauthorized SSH Attempt",
    details: "Node US-EAST-01 blocked source IP 192.168.1.45",
    time: "2 minutes ago",
    status: "blocked"
  },
  {
    type: "Policy Sync Complete",
    details: "New CIS Benchmarks applied to 424 Linux nodes",
    time: "14 minutes ago",
    status: "success"
  },
  {
    type: "SSL Certificate Expiry",
    details: "api.aegis.io expires in 72 hours",
    time: "1 hour ago",
    status: "warning"
  },
  {
    type: "Compliance Scan Finished",
    details: "European Region: 0 critical issues found",
    time: "2 hours ago",
    status: "success"
  }
]

export default function DashboardPage() {
  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2">
        <motion.h1 
          className="text-4xl font-bold tracking-tight text-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Cyber Command Center
        </motion.h1>
        <motion.p 
          className="text-slate-400 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Real-time threat monitoring and fleet status
        </motion.p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1, duration: 0.4 }}
          >
            <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm hover:border-indigo-500/30 transition-colors group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400 uppercase tracking-wider">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold text-white tracking-tight">{stat.value}</div>
                  <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${stat.isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {stat.change}
                  </div>
                </div>
                <p className="mt-2 text-xs text-slate-500 font-medium">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-slate-900/40 border-slate-800/60 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-white">Fleet Health Status</CardTitle>
              <p className="text-sm text-slate-500">Host compliance consistency over last 7 days</p>
            </div>
            <Activity className="h-5 w-5 text-indigo-500" />
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {/* Mock Chart Area */}
            <div className="relative w-full h-full flex items-end justify-between px-4 pb-8 pt-10">
              {[65, 78, 90, 85, 95, 88, 92].map((height, i) => (
                <motion.div 
                  key={i}
                  className="w-full mx-2 bg-indigo-500/20 border-t-2 border-indigo-500/50 rounded-t-sm relative group"
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "easeOut" }}
                >
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] text-white px-2 py-1 rounded border border-slate-700 z-10 whitespace-nowrap">
                    Day {i+1}: {height}%
                  </div>
                </motion.div>
              ))}
              <div className="absolute inset-x-0 bottom-0 h-[1px] bg-slate-800/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/40 border-slate-800/60 backdrop-blur-sm overflow-hidden flex flex-col">
          <CardHeader className="border-b border-slate-900/50 bg-slate-900/20">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Intelligence Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <div className="divide-y divide-slate-900/50">
              {intelligence.map((item, idx) => (
                <motion.div 
                  key={idx}
                  className="p-4 hover:bg-slate-800/30 transition-colors flex gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + idx * 0.1 }}
                >
                  <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
                    item.status === 'blocked' ? 'bg-rose-500' : 
                    item.status === 'warning' ? 'bg-yellow-500' : 'bg-emerald-500'
                  } shadow-[0_0_8px_rgba(0,0,0,0.5)]`} />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-200">{item.type}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.details}</p>
                    <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">{item.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
          <button className="w-full py-3 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/5 transition-all uppercase tracking-[0.2em] border-t border-slate-900/50 bg-slate-900/20">
            Link Satellite Uplink
          </button>
        </Card>
      </div>
    </div>
  )
}
