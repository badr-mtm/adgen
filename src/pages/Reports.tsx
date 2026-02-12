import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  MousePointerClick,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Tv,
  Globe,
  Zap } from
"lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area } from
"recharts";

const Reports = () => {
  const [dateRange, setDateRange] = useState("7d");

  // Mock Data
  const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
    hour: `${i}:00`,
    viewers: Math.floor(Math.random() * 5000) + 1000,
    engagement: Math.floor(Math.random() * 100)
  }));

  const regionData = [
  { region: "North America", reach: 85, lift: 4.2 },
  { region: "Europe", reach: 65, lift: 3.8 },
  { region: "Asia Pacific", reach: 45, lift: 2.9 }];


  return (
    <DashboardLayout>
      <div className="min-h-screen bg-background p-6 space-y-8 max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-primary/80">
              <Activity className="h-4 w-4 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest">Live Feed</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight lg:text-4xl text-secondary-foreground"> Campaigns Analytics</h1>
            <p className="text-muted-foreground">Real-time performance across global TV networks.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-card/50 border border-white/10 rounded-lg p-1">
              {['24h', '7d', '30d'].map((d) =>
              <button key={d} className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${dateRange === d ? 'bg-primary text-white shadow-lg' : 'text-muted-foreground hover:text-white'}`} onClick={() => setDateRange(d)}>
                  {d.toUpperCase()}
                </button>
              )}
            </div>
            <Button variant="outline" className="gap-2 border-border hover:border-primary text-foreground">
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>
        </div>

        {/* Hero Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Impressions" value="4.2M" trend="+12%" icon={<Eye className="text-blue-400" />} />
          <StatCard title="Household Reach" value="1.8M" trend="+8.4%" icon={<Tv className="text-purple-400" />} />
          <StatCard title="Avg. Attention" value="18.2s" trend="-2%" icon={<Zap className="text-yellow-400" />} negative />
          <StatCard title="Brand Lift" value="+14.5%" trend="+5.1%" icon={<TrendingUp className="text-green-400" />} />
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Chart Area */}
          <Card className="lg:col-span-2 bg-card/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Prime Time Performance</CardTitle>
              <CardDescription>Viewership volume by hour (Local Time)</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorViewers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} interval={3} />
                  <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#09090b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }} />

                  <Area type="monotone" dataKey="viewers" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorViewers)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Regional Performance Sidebar */}
          <Card className="bg-card/40 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Globe className="h-5 w-5 text-indigo-400" /> Regional Impact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {regionData.map((region, i) =>
              <div key={region.region} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-medium text-white">{region.region}</span>
                    <span className="text-green-400 font-bold">+{region.lift}% Lift</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${region.reach}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Reach Saturation</span>
                    <span>{region.reach}% (High)</span>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-white/10 mt-6">
                <h4 className="text-xs font-bold uppercase text-muted-foreground mb-4">Top Networks</h4>
                <div className="flex flex-wrap gap-2">
                  {['Hulu', 'Roku', 'ESPN', 'Discovery'].map((net) =>
                  <Badge key={net} variant="secondary" className="bg-white/5 hover:bg-white/10 border-white/10 px-3 py-1 cursor-default text-primary">
                      {net}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Detailed Metrics Table Placeholder (could be expanded) */}

      </div>
    </DashboardLayout>);

};

// Sub-components
const StatCard = ({ title, value, trend, icon, negative }: any) =>
<Card className="bg-card/40 border-white/10 backdrop-blur-sm relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    <CardContent className="p-6 relative">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-3xl font-black mt-1 tracking-tight text-secondary-foreground">{value}</h3>
        </div>
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 shadow-inner">
          {icon}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className={`border-0 ${negative ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
          {trend}
        </Badge>
        <span className="text-xs text-muted-foreground">vs previous period</span>
      </div>
    </CardContent>
  </Card>;


export default Reports;