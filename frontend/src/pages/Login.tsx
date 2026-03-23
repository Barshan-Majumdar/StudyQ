import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useStore } from "../store/useStore"
import { BookOpen, Mail, Lock, ArrowRight } from "lucide-react"

export function Login() {
  const navigate = useNavigate()
  const login = useStore((s) => s.login)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const result = await login(email, password)
    if (result.success) {
      navigate("/dashboard")
    } else {
      setError(result.message || "Login failed")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel: Animated Gradient ── */}
      <div className="hidden lg:flex lg:w-1/2 gradient-animated relative overflow-hidden items-center justify-center">
        {/* Floating Orbs */}
        <div className="absolute w-64 h-64 rounded-full bg-white/5 blur-xl animate-float top-[15%] left-[10%]" />
        <div className="absolute w-48 h-48 rounded-full bg-blue-400/10 blur-xl animate-float-reverse top-[55%] right-[15%]" />
        <div className="absolute w-32 h-32 rounded-full bg-indigo-400/10 blur-xl animate-float top-[75%] left-[30%]" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 max-w-md text-center px-8">
          <div className="animate-fade-in-up">
            <BookOpen className="w-16 h-16 text-white/90 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
              Welcome Back to <span className="text-blue-300">StudyQ</span>
            </h1>
            <p className="text-white/70 text-lg leading-relaxed">
              Your academic workspace awaits. Access materials, track progress, and collaborate seamlessly.
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-4 animate-fade-in-up animation-delay-300">
            {[
              { label: "Secure JWT Authentication", icon: "🔒" },
              { label: "Role-Based Dashboards", icon: "📊" },
              { label: "Instant Material Access", icon: "📚" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-3 glass-card rounded-xl px-4 py-3 text-white/80 text-sm"
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Panel: Login Form ── */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50/50 via-transparent to-transparent dark:from-blue-950/20" />

        <div className="relative z-10 w-full max-w-md animate-scale-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8 animate-fade-in-down">
            <BookOpen className="w-8 h-8 text-primary" />
            <span className="text-2xl font-bold text-primary">StudyQ</span>
          </div>

          <div className="space-y-2 mb-8 animate-fade-in-up">
            <h2 className="text-3xl font-bold tracking-tight">Sign In</h2>
            <p className="text-muted-foreground">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600 dark:text-red-400 animate-fade-in-up">
                {error}
              </div>
            )}

            <div className="space-y-2 animate-fade-in-up animation-delay-100">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <div className="relative input-glow rounded-lg transition-all">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 rounded-lg border-muted-foreground/20 focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 animate-fade-in-up animation-delay-200">
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
              <div className="relative input-glow rounded-lg transition-all">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 h-12 rounded-lg border-muted-foreground/20 focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div className="animate-fade-in-up animation-delay-300">
              <Button
                className="w-full h-12 rounded-lg text-base font-semibold gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98]"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </Button>
            </div>

            <div className="text-center text-sm text-muted-foreground animate-fade-in-up animation-delay-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline underline-offset-4 transition-colors">
                Create Account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
