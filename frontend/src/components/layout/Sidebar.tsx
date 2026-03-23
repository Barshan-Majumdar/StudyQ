import { Link, useLocation } from "react-router-dom"
import { Home, FolderOpen, UploadCloud, BarChart2, Settings, ChevronLeft, ChevronRight, X, BookOpen, Shield } from "lucide-react"
import { useStore } from "../../store/useStore"

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Home, roles: ["student", "teacher", "admin"] },
  { label: "Materials", path: "/materials", icon: FolderOpen, roles: ["student", "teacher", "admin"] },
  { label: "Upload", path: "/upload", icon: UploadCloud, roles: ["teacher", "admin"] },
  { label: "Analytics", path: "/analytics", icon: BarChart2, roles: ["student", "teacher", "admin"] },
  { label: "Admin Panel", path: "/admin", icon: Shield, roles: ["admin"] },
]

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const location = useLocation()
  const collapsed = useStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useStore((s) => s.toggleSidebar)
  const user = useStore((s) => s.user)

  // Filter nav items by user role
  const filteredItems = navItems.filter((item) => {
    if (!user) return false
    return item.roles.includes(user.role)
  })

  const sidebarContent = (
    <>
      {/* Header */}
      <div className={`h-16 flex items-center border-b px-4 ${collapsed ? "justify-center" : "justify-between"}`}>
        {!collapsed && (
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-primary">StudyQ</span>
          </div>
        )}
        {collapsed && <BookOpen className="w-6 h-6 text-primary" />}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/")
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-lg transition-colors ${
                collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
              } ${
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-accent/10 hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t">
        <button
          onClick={onMobileClose}
          className={`flex items-center gap-3 w-full rounded-lg text-muted-foreground hover:bg-accent/10 hover:text-foreground transition-colors ${
            collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5"
          }`}
        >
          <Settings className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="font-medium text-sm">Settings</span>}
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-card border-r h-full transition-all duration-200 relative ${
          collapsed ? "w-16" : "w-60"
        }`}
      >
        {sidebarContent}
        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-20 w-6 h-6 bg-card border rounded-full flex items-center justify-center shadow-sm hover:bg-accent/10 transition-colors z-10"
        >
          {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-60 bg-card shadow-2xl flex flex-col">
            <button
              onClick={onMobileClose}
              className="absolute right-3 top-4 p-1 rounded-md hover:bg-accent/10"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
