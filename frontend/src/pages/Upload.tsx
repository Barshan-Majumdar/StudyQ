import { useState } from "react"
import { UploadCloud, File as FileIcon, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Label } from "../components/ui/label"
import { Input } from "../components/ui/input"
import api from "../lib/api"

export function Upload() {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [subject, setSubject] = useState("")
  const [semester, setSemester] = useState("")
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear().toString())
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files?.length) setFile(e.dataTransfer.files[0])
  }

  const handleUpload = async () => {
    if (!file || !title || !subject || !semester) return
    setUploading(true)
    setProgress(0)
    setStatus("idle")
    setErrorMsg("")

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("description", description)
    formData.append("subject", subject)
    formData.append("semester", semester)
    formData.append("academicYear", academicYear)

    try {
      await api.post("/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100))
        },
      })
      setStatus("success")
      setFile(null)
      setTitle("")
      setDescription("")
      setSubject("")
      setSemester("")
    } catch (err: any) {
      setStatus("error")
      setErrorMsg(err.response?.data?.message || "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setFile(null)
    setTitle("")
    setDescription("")
    setSubject("")
    setSemester("")
    setStatus("idle")
    setProgress(0)
    setErrorMsg("")
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">Upload Material</h2>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">File Details</CardTitle>
          <CardDescription>Upload a file and provide metadata.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Drop zone */}
          <div
            className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            <input
              id="file-upload"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
            />
            {file ? (
              <div className="text-center">
                <FileIcon className="w-10 h-10 text-primary mx-auto mb-3" />
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                <Button variant="ghost" size="sm" className="mt-2" onClick={(e) => { e.stopPropagation(); setFile(null) }}>
                  Remove
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <UploadCloud className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Drag & drop or click to browse</p>
                <p className="text-sm text-muted-foreground mt-1">PDF, DOCX, PPTX up to 50MB</p>
              </div>
            )}
          </div>

          {/* Progress */}
          {uploading && (
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-muted-foreground text-right">{progress}%</p>
            </div>
          )}

          {/* Status */}
          {status === "success" && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-400 text-sm">
              <CheckCircle className="w-4 h-4" /> Material uploaded successfully!
            </div>
          )}
          {status === "error" && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" /> {errorMsg}
            </div>
          )}

          {/* Metadata */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Data Structures Midterm Review" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Computer Science" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="semester">Semester *</Label>
              <select
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select semester</option>
                {[1,2,3,4,5,6,7,8].map((s) => <option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Academic Year</Label>
              <Input id="year" type="number" value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <Button variant="outline" onClick={resetForm} disabled={uploading}>Cancel</Button>
          <Button onClick={handleUpload} disabled={!file || !title || !subject || !semester || uploading}>
            {uploading ? "Uploading..." : "Upload Material"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
