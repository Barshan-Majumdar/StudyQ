import { useEffect, useState } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card"
import { Users, FileText, Download, Activity, UploadCloud, BookOpen, Shield, Clock } from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { useStore } from "../store/useStore"
import api from "../lib/api"

// ─── Helpers ───────────────────────────────────────────────────
const formatTimeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

interface KPI {
  title: string
  value: number | string
  icon: React.ElementType
}

function KPICards({ kpis }: { kpis: KPI[] }) {
  return (
    <div className={`grid gap-4 ${kpis.length === 4 ? "md:grid-cols-4" : "md:grid-cols-3"}`}>
      {kpis.map((kpi, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            <kpi.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-muted animate-pulse rounded" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
      <div className="h-64 bg-muted animate-pulse rounded-xl" />
    </div>
  )
}

// ─── Student Dashboard ─────────────────────────────────────────
function StudentDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/analytics/stats")
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />

  const kpis: KPI[] = [
    { title: "Materials Available", value: data?.materialCount ?? 0, icon: FileText },
    { title: "My Downloads", value: data?.myDownloadCount ?? 0, icon: Download },
    { title: "Subjects Available", value: data?.subjectCount ?? 0, icon: BookOpen },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">My Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Welcome back! Here's what's available for you.</p>
      </div>

      <KPICards kpis={kpis} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">My Recent Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentDownloads && data.recentDownloads.length > 0 ? (
              <div className="space-y-4">
                {data.recentDownloads.map((d: any) => (
                  <div key={d._id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{d.materialId?.title || "Untitled"}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.materialId?.subject} · Sem {d.materialId?.semester}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimeAgo(d.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <Download className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                No downloads yet. Browse materials to start learning.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/materials">
              <Button className="w-full">Browse Materials</Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="w-full">View Analytics</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Teacher Dashboard ─────────────────────────────────────────
function TeacherDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/analytics/stats")
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />

  const kpis: KPI[] = [
    { title: "My Uploads", value: data?.myUploadCount ?? 0, icon: UploadCloud },
    { title: "Total Downloads on My Materials", value: data?.myDownloadTotal ?? 0, icon: Download },
    { title: "Active Students", value: data?.activeStudents ?? 0, icon: Users },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Teacher Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">Manage and track your uploaded materials.</p>
      </div>

      <KPICards kpis={kpis} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">My Recent Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            {data?.recentUploads && data.recentUploads.length > 0 ? (
              <div className="space-y-4">
                {data.recentUploads.map((m: any) => (
                  <div key={m._id} className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {m.subject} · Sem {m.semester} · {m.downloadCount} downloads
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(m.createdAt)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground text-sm">
                <UploadCloud className="w-10 h-10 mx-auto mb-2 text-muted-foreground/40" />
                No uploads yet. Share your first material with students.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/upload">
              <Button className="w-full">Upload Material</Button>
            </Link>
            <Link to="/materials">
              <Button variant="outline" className="w-full">Browse Materials</Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="w-full">View Analytics</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Admin Dashboard ───────────────────────────────────────────
function AdminDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get("/analytics/stats")
      .then((r) => setData(r.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />

  const kpis: KPI[] = [
    { title: "Total Users", value: data?.totalUsers ?? 0, icon: Users },
    { title: "Total Materials", value: data?.totalMaterials ?? 0, icon: FileText },
    { title: "Total Downloads", value: data?.totalDownloads ?? 0, icon: Download },
    { title: "Active Students", value: data?.activeStudents ?? 0, icon: Users },
  ]

  const roleColors: Record<string, string> = {
    student: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    teacher: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-1">System overview and management tools.</p>
      </div>

      <KPICards kpis={kpis} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* User Breakdown + Recent Admin Actions */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-base">System Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Role Breakdown */}
            <div>
              <p className="text-sm font-medium mb-3">Users by Role</p>
              <div className="flex gap-3 flex-wrap">
                {["student", "teacher", "admin"].map((role) => (
                  <div key={role} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${roleColors[role]}`}>
                    <span className="text-lg font-bold">{data?.usersByRole?.[role] ?? 0}</span>
                    <span className="text-sm capitalize">{role}s</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Admin Actions */}
            <div>
              <p className="text-sm font-medium mb-3">Recent Admin Actions</p>
              {data?.recentAdminActions && data.recentAdminActions.length > 0 ? (
                <div className="space-y-3">
                  {data.recentAdminActions.map((a: any) => (
                    <div key={a._id} className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{a.action.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground truncate">{a.details || "—"}</p>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimeAgo(a.createdAt)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  No admin actions yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/admin">
              <Button className="w-full gap-2">
                <Shield className="w-4 h-4" /> Manage Users
              </Button>
            </Link>
            <Link to="/upload">
              <Button variant="outline" className="w-full">Upload Material</Button>
            </Link>
            <Link to="/materials">
              <Button variant="outline" className="w-full">Browse Materials</Button>
            </Link>
            <Link to="/analytics">
              <Button variant="outline" className="w-full">View Analytics</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Main Dashboard Router ─────────────────────────────────────
export function Dashboard() {
  const role = useStore((s) => s.user?.role)

  if (role === "admin") return <AdminDashboard />
  if (role === "teacher") return <TeacherDashboard />
  return <StudentDashboard />
}
