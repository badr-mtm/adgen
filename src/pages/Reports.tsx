import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const performanceData = [
  { name: "Mon", views: 4000, clicks: 2400, conversions: 240 },
  { name: "Tue", views: 3000, clicks: 1398, conversions: 139 },
  { name: "Wed", views: 2000, clicks: 9800, conversions: 980 },
  { name: "Thu", views: 2780, clicks: 3908, conversions: 390 },
  { name: "Fri", views: 1890, clicks: 4800, conversions: 480 },
  { name: "Sat", views: 2390, clicks: 3800, conversions: 380 },
  { name: "Sun", views: 3490, clicks: 4300, conversions: 430 },
];

const audienceData = [
  { name: "18-24", value: 25, color: "hsl(85, 45%, 65%)" },
  { name: "25-34", value: 35, color: "hsl(85, 45%, 55%)" },
  { name: "35-44", value: 20, color: "hsl(85, 45%, 45%)" },
  { name: "45-54", value: 12, color: "hsl(120, 10%, 40%)" },
  { name: "55+", value: 8, color: "hsl(120, 10%, 30%)" },
];

const campaignPerformance = [
  { name: "Summer Sale", ctr: 4.2, engagement: 12.5, conversions: 342 },
  { name: "Product Launch", ctr: 3.8, engagement: 10.2, conversions: 256 },
  { name: "Brand Awareness", ctr: 2.9, engagement: 8.7, conversions: 189 },
  { name: "Holiday Special", ctr: 5.1, engagement: 15.3, conversions: 423 },
];

const Reports = () => {
  const [dateRange, setDateRange] = useState("7d");

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports</h1>
            <p className="text-muted-foreground">
              Track and analyze your campaign performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns">Campaign Reports</TabsTrigger>
            <TabsTrigger value="audience">Audience Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Impressions
                  </CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">1.2M</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                    <span className="text-primary">+18.2%</span> from last period
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Clicks
                  </CardTitle>
                  <MousePointerClick className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">45.2K</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                    <span className="text-primary">+12.5%</span> from last period
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Average CTR
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">3.76%</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ArrowDownRight className="h-3 w-3 text-destructive" />
                    <span className="text-destructive">-0.3%</span> from last period
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Conversions
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">3,039</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <ArrowUpRight className="h-3 w-3 text-primary" />
                    <span className="text-primary">+24.1%</span> from last period
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Performance Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 10%, 20%)" />
                      <XAxis dataKey="name" stroke="hsl(120, 5%, 60%)" />
                      <YAxis stroke="hsl(120, 5%, 60%)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(120, 10%, 12%)",
                          border: "1px solid hsl(120, 10%, 20%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(85, 45%, 65%)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="clicks"
                        stroke="hsl(200, 70%, 50%)"
                        strokeWidth={2}
                      />
                      <Line
                        type="monotone"
                        dataKey="conversions"
                        stroke="hsl(45, 90%, 60%)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Performance Table */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaignPerformance.map((campaign) => (
                    <div
                      key={campaign.name}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                    >
                      <div>
                        <p className="font-medium text-foreground">{campaign.name}</p>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">CTR</p>
                          <p className="font-semibold text-foreground">{campaign.ctr}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Engagement</p>
                          <p className="font-semibold text-foreground">{campaign.engagement}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Conversions</p>
                          <p className="font-semibold text-foreground">{campaign.conversions}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audience" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Age Distribution */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Age Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={audienceData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {audienceData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(120, 10%, 12%)",
                            border: "1px solid hsl(120, 10%, 20%)",
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {audienceData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name}: {item.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Engagement by Platform */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Engagement by Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { platform: "Instagram", engagement: 15.2 },
                          { platform: "Facebook", engagement: 12.8 },
                          { platform: "TikTok", engagement: 18.5 },
                          { platform: "YouTube", engagement: 10.3 },
                          { platform: "Twitter", engagement: 8.7 },
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(120, 10%, 20%)" />
                        <XAxis dataKey="platform" stroke="hsl(120, 5%, 60%)" />
                        <YAxis stroke="hsl(120, 5%, 60%)" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(120, 10%, 12%)",
                            border: "1px solid hsl(120, 10%, 20%)",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar dataKey="engagement" fill="hsl(85, 45%, 65%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Top Performing Audiences */}
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Top Performing Audience Segments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { segment: "Tech Enthusiasts, 25-34", reach: "245K", ctr: "4.8%", conversion: "3.2%" },
                    { segment: "Fashion Forward, 18-24", reach: "189K", ctr: "4.2%", conversion: "2.8%" },
                    { segment: "Business Professionals, 35-44", reach: "156K", ctr: "3.9%", conversion: "3.5%" },
                    { segment: "Health & Fitness, 25-34", reach: "134K", ctr: "3.6%", conversion: "2.4%" },
                  ].map((audience, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/30"
                    >
                      <div>
                        <p className="font-medium text-foreground">{audience.segment}</p>
                        <p className="text-sm text-muted-foreground">Reach: {audience.reach}</p>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">CTR</p>
                          <p className="font-semibold text-foreground">{audience.ctr}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Conversion</p>
                          <p className="font-semibold text-foreground">{audience.conversion}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
