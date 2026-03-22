import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { BarChart2 } from "lucide-react"
import { axiosClient as api } from "@/lib/axiosClient"

export function Analytics() {
  const [downloadTrend, setDownloadTrend] = useState<{ name: string; downloads: number }[]>([])
  const [subjectData, setSubjectData] = useState<{ name: string; files: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get("/analytics/downloads").then((r) => setDownloadTrend(r.data.data)).catch(() => {}),
      api.get("/analytics/subjects").then((r) => setSubjectData(r.data.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-36 bg-muted animate-pulse rounded" />
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="h-[380px] bg-muted animate-pulse rounded-xl" />)}
        </div>
      </div>
    )
  }

  const hasData = downloadTrend.some((d) => d.downloads > 0) || subjectData.length > 0

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>

      {!hasData ? (
        <div className="py-20 text-center text-muted-foreground">
          <BarChart2 className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-medium">No analytics data yet</p>
          <p className="text-sm mt-1">Upload and share materials to see trends here.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Download Trends</CardTitle>
              <CardDescription>Downloads over the last 7 days</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={downloadTrend} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradDown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs" tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Area type="monotone" dataKey="downloads" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#gradDown)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Materials by Subject</CardTitle>
              <CardDescription>Distribution of files across subjects</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-border" />
                  <XAxis dataKey="name" className="text-xs" tickLine={false} axisLine={false} />
                  <YAxis className="text-xs" tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "transparent" }} contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }} />
                  <Bar dataKey="files" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
