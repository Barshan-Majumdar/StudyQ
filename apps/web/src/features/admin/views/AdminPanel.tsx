import { useEffect, useState, useCallback } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Plus, Search, Edit2, UserX, UserCheck, X, Clock } from "lucide-react"
import { axiosClient as api } from "@/lib/axiosClient"

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

interface AuditItem {
  _id: string;
  action: string;
  details?: string;
  createdAt: string;
  performedBy?: { name: string; email: string };
  targetUserId?: { name: string; email: string };
}

export function AdminPanel() {
  // ── Users Tab ──────────────────────────────────────────────
  const [users, setUsers] = useState<UserItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // ── Add User Dialog ────────────────────────────────────────
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "student" })
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState("")

  // ── Edit User Dialog ───────────────────────────────────────
  const [editUser, setEditUser] = useState<UserItem | null>(null)
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "" })
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState("")

  // ── Audit Tab ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<"users" | "audit">("users")
  const [auditLogs, setAuditLogs] = useState<AuditItem[]>([])
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditPage, setAuditPage] = useState(1)
  const [auditTotalPages, setAuditTotalPages] = useState(1)

  // ── Fetch Users ────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params: Record<string, string> = { page: String(page), limit: "15" }
      if (search) params.search = search
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.status = statusFilter

      const res = await api.get("/admin/users", { params })
      setUsers(res.data.data.users)
      setTotal(res.data.data.total)
      setTotalPages(res.data.data.totalPages)
    } catch {
      setError("Failed to load users")
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, statusFilter, page])

  useEffect(() => {
    if (activeTab === "users") {
      const timer = setTimeout(fetchUsers, 300)
      return () => clearTimeout(timer)
    }
  }, [fetchUsers, activeTab])

  // ── Fetch Audit Logs ───────────────────────────────────────
  const fetchAudit = useCallback(async () => {
    setAuditLoading(true)
    try {
      const res = await api.get("/admin/audit-log", { params: { page: String(auditPage), limit: "20" } })
      setAuditLogs(res.data.data.logs)
      setAuditTotalPages(res.data.data.totalPages)
    } catch {
      // silent
    } finally {
      setAuditLoading(false)
    }
  }, [auditPage])

  useEffect(() => {
    if (activeTab === "audit") fetchAudit()
  }, [fetchAudit, activeTab])

  // ── Add User ───────────────────────────────────────────────
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError("")
    try {
      await api.post("/admin/users", addForm)
      setShowAddDialog(false)
      setAddForm({ name: "", email: "", password: "", role: "student" })
      fetchUsers()
    } catch (err: any) {
      setAddError(err.response?.data?.message || "Failed to create user")
    } finally {
      setAddLoading(false)
    }
  }

  // ── Edit User ──────────────────────────────────────────────
  const openEdit = (u: UserItem) => {
    setEditUser(u)
    setEditForm({ name: u.name, email: u.email, role: u.role })
    setEditError("")
  }

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editUser) return
    setEditLoading(true)
    setEditError("")
    try {
      await api.patch(`/admin/users/${editUser._id}`, editForm)
      setEditUser(null)
      fetchUsers()
    } catch (err: any) {
      setEditError(err.response?.data?.message || "Failed to update user")
    } finally {
      setEditLoading(false)
    }
  }

  // ── Toggle Active ──────────────────────────────────────────
  const toggleActive = async (u: UserItem) => {
    // Optimistic update
    setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isActive: !x.isActive } : x)))
    try {
      await api.patch(`/admin/users/${u._id}`, { isActive: !u.isActive })
    } catch {
      // Rollback
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isActive: u.isActive } : x)))
    }
  }

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  const formatTimeAgo = (d: string) => {
    const diff = Date.now() - new Date(d).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      teacher: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      student: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    }
    return (
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[role] || "bg-muted text-muted-foreground"}`}>
        {role}
      </span>
    )
  }

  const statusBadge = (active: boolean) => (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${active
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
    }`}>
      {active ? "Active" : "Inactive"}
    </span>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Admin Panel</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{total} users</span>
          <Button size="sm" onClick={() => { setShowAddDialog(true); setAddError("") }} className="gap-1">
            <Plus className="w-4 h-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "users" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Users className="w-4 h-4 inline mr-1.5 -mt-0.5" />Users
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "audit" ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Clock className="w-4 h-4 inline mr-1.5 -mt-0.5" />Audit Log
        </button>
      </div>

      {/* ────── Users Tab ────── */}
      {activeTab === "users" && (
        <>
          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap bg-card p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                className="pl-9"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => { setRoleFilter(e.target.value); setPage(1) }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Roles</option>
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4].map((i) => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
              </div>
            ) : users.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                <p className="font-medium">No users found</p>
                <p className="text-sm mt-1">Try adjusting your filters.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden lg:table-cell">Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u._id}>
                      <TableCell className="font-medium">{u.name}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">{u.email}</TableCell>
                      <TableCell>{roleBadge(u.role)}</TableCell>
                      <TableCell>{statusBadge(u.isActive)}</TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">{formatDate(u.createdAt)}</TableCell>
                      <TableCell className="text-right space-x-1">
                        {u.role !== "admin" && (
                          <>
                            <Button variant="ghost" size="icon" title="Edit" onClick={() => openEdit(u)}>
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              title={u.isActive ? "Deactivate" : "Activate"}
                              onClick={() => toggleActive(u)}
                            >
                              {u.isActive ? <UserX className="w-4 h-4 text-red-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button>
              <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button>
            </div>
          )}
        </>
      )}

      {/* ────── Audit Tab ────── */}
      {activeTab === "audit" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Admin Activity Log</CardTitle>
          </CardHeader>
          <CardContent>
            {auditLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted animate-pulse rounded" />)}
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No admin actions logged yet.</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log._id} className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{log.action.replace(/_/g, " ")}</p>
                      <p className="text-xs text-muted-foreground truncate">{log.details || "—"}</p>
                      {log.performedBy && (
                        <p className="text-xs text-muted-foreground">by {log.performedBy.name}</p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{formatTimeAgo(log.createdAt)}</span>
                  </div>
                ))}
              </div>
            )}
            {auditTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button variant="outline" size="sm" disabled={auditPage === 1} onClick={() => setAuditPage(auditPage - 1)}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {auditPage} of {auditTotalPages}</span>
                <Button variant="outline" size="sm" disabled={auditPage === auditTotalPages} onClick={() => setAuditPage(auditPage + 1)}>Next</Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ────── Add User Dialog ────── */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddDialog(false)} />
          <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Add New User</CardTitle>
              <button onClick={() => setShowAddDialog(false)} className="p-1 rounded-md hover:bg-accent/10">
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <form onSubmit={handleAddUser}>
              <CardContent className="space-y-4">
                {addError && (
                  <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    {addError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Jane Doe" required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="jane@college.edu" required />
                </div>
                <div className="space-y-2">
                  <Label>Password</Label>
                  <Input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} required minLength={8} />
                  <p className="text-xs text-muted-foreground">Min 8 chars, uppercase, lowercase, digit</p>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-6 pt-0">
                <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button type="submit" disabled={addLoading}>{addLoading ? "Creating..." : "Create User"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ────── Edit User Dialog ────── */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setEditUser(null)} />
          <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Edit User</CardTitle>
              <button onClick={() => setEditUser(null)} className="p-1 rounded-md hover:bg-accent/10">
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <form onSubmit={handleEditUser}>
              <CardContent className="space-y-4">
                {editError && (
                  <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400">
                    {editError}
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} required />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                  </select>
                </div>
              </CardContent>
              <div className="flex justify-end gap-2 p-6 pt-0">
                <Button type="button" variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
                <Button type="submit" disabled={editLoading}>{editLoading ? "Saving..." : "Save Changes"}</Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
