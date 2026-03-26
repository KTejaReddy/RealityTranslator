import { useAuth } from "../auth/AuthContext";
import { Users, Building2, ShieldCheck, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminDashboard() {
  const { session, logout } = useAuth();

  return (
    <div className="min-h-screen bg-[#05070e] font-body text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-accent" />
            <h1 className="font-display font-semibold text-lg">Admin Control Center</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50">{session?.email}</span>
            <button 
              onClick={logout}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white/80 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Active Users</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">1,248</div>
              <p className="text-xs text-white/40">+12% from last month</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Gov Agencies</CardTitle>
              <Building2 className="w-4 h-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">14</div>
              <p className="text-xs text-white/40">3 pending approval</p>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-white/80">Simulations Run</CardTitle>
              <Activity className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">45.2K</div>
              <p className="text-xs text-white/40">+2.4K today</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Table */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg text-white">System Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { actor: "user_491", action: "Ran Pandemic Scenario", time: "2 mins ago" },
                { actor: "gov_agency_x", action: "Exported Economy Data", time: "15 mins ago" },
                { actor: "admin_core", action: "Updated Auth Schema", time: "1 hour ago" },
                { actor: "user_882", action: "Created Cyber Simulation", time: "2 hours ago" },
              ].map((log, i) => (
                <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-white/40" />
                    <div>
                      <p className="text-sm text-white/80">{log.action}</p>
                      <p className="text-xs text-white/40">{log.actor}</p>
                    </div>
                  </div>
                  <div className="text-xs text-white/40">{log.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
