import { Bell, UserCircle, LogOut, Menu, Moon, Sun } from "lucide-react"
import { useStore } from "../../store/useStore"
import { useNavigate } from "react-router-dom"

interface NavbarProps {
  onMenuClick?: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const user = useStore((s) => s.user)
  const logout = useStore((s) => s.logout)
  const theme = useStore((s) => s.theme)
  const toggleTheme = useStore((s) => s.toggleTheme)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate("/login")
  }

  const roleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "text-red-600 dark:text-red-400",
      teacher: "text-blue-600 dark:text-blue-400",
      student: "text-green-600 dark:text-green-400",
    }
    return <span className={`text-xs capitalize ${colors[role] || "text-muted-foreground"}`}>{role}</span>
  }

  return (
    <header className="h-16 bg-card border-b flex items-center justify-between px-4 md:px-6 shadow-sm">
      {/* Mobile menu */}
      <button
        onClick={onMenuClick}
        className="p-2 text-muted-foreground hover:bg-accent/10 rounded-lg transition-colors md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      <div className="flex-1" />

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-muted-foreground hover:bg-accent/10 rounded-lg transition-colors"
          title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
          {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button className="p-2 text-muted-foreground hover:bg-accent/10 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User */}
        <div className="flex items-center gap-3 pl-3 ml-1 border-l">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
            <div className="mt-0.5">{roleBadge(user?.role || "—")}</div>
          </div>
          <UserCircle className="w-8 h-8 text-muted-foreground" />
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="p-2 text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
