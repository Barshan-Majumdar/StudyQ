import { useEffect, useState, useCallback } from "react"
import { Search, Eye, Download, FolderOpen } from "lucide-react"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import api from "../lib/api"

const API_HOST = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api$/, '')

interface MaterialItem {
  _id: string;
  title: string;
  subject: string;
  semester: number;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  downloadCount: number;
  createdAt: string;
  uploadedBy?: { name: string };
}

export function Materials() {
  const [materials, setMaterials] = useState<MaterialItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [semester, setSemester] = useState("")
  const [subject, setSubject] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchMaterials = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { page: String(page), limit: "15" }
      if (search) params.search = search
      if (semester) params.semester = semester
      if (subject) params.subject = subject

      const res = await api.get("/materials", { params })
      setMaterials(res.data.data.materials)
      setTotalPages(res.data.data.totalPages)
    } catch {
      // Silently fail — empty state will show
    } finally {
      setLoading(false)
    }
  }, [search, semester, subject, page])

  useEffect(() => {
    const timer = setTimeout(fetchMaterials, 300) // debounce
    return () => clearTimeout(timer)
  }, [fetchMaterials])

  const handleDownload = async (id: string) => {
    try {
      const res = await api.post(`/materials/${id}/download`)
      const url = res.data.data.fileUrl
      window.open(`${API_HOST}${url}`, "_blank")
    } catch {}
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold tracking-tight">Materials</h2>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search materials..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          value={semester}
          onChange={(e) => { setSemester(e.target.value); setPage(1) }}
          className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Semesters</option>
          {[1,2,3,4,5,6,7,8].map((s) => (
            <option key={s} value={s}>Semester {s}</option>
          ))}
        </select>
        <Input
          placeholder="Filter by subject"
          className="max-w-[180px]"
          value={subject}
          onChange={(e) => { setSubject(e.target.value); setPage(1) }}
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1,2,3,4].map((i) => <div key={i} className="h-10 bg-muted animate-pulse rounded" />)}
          </div>
        ) : materials.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <FolderOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-medium">No materials found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Subject</TableHead>
                <TableHead className="hidden sm:table-cell">Semester</TableHead>
                <TableHead className="hidden lg:table-cell">Size</TableHead>
                <TableHead className="hidden lg:table-cell">Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {materials.map((m) => (
                <TableRow key={m._id}>
                  <TableCell className="font-medium">{m.title}</TableCell>
                  <TableCell className="hidden md:table-cell">{m.subject}</TableCell>
                  <TableCell className="hidden sm:table-cell">Sem {m.semester}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{formatSize(m.fileSize)}</TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">{formatDate(m.createdAt)}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button variant="ghost" size="icon" title="View" onClick={() => window.open(`${API_HOST}${m.fileUrl}`, "_blank")}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" title="Download" onClick={() => handleDownload(m._id)}>
                      <Download className="w-4 h-4" />
                    </Button>
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
    </div>
  )
}
