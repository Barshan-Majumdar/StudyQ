import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { BookOpen, Upload, BarChart2, Shield, ArrowRight, Zap, Users, FileText, GraduationCap } from "lucide-react"
import { useEffect, useRef, useState } from "react"

// ── Animated Counter Hook ──────────────────────────────────────
function useCountUp(target: number, duration = 2000) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true
          const startTime = Date.now()
          const tick = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return { count, ref }
}

export function Landing() {
  const stats = [
    { label: "Active Students", target: 2000, suffix: "+", icon: Users },
    { label: "Study Materials", target: 500, suffix: "+", icon: FileText },
    { label: "Teachers", target: 50, suffix: "+", icon: GraduationCap },
    { label: "Uptime", target: 99, suffix: "%", icon: Zap },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* ────── Navbar ────── */}
      <header className="border-b bg-card/70 backdrop-blur-xl sticky top-0 z-50 animate-fade-in-down">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 group cursor-pointer">
            <BookOpen className="w-7 h-7 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-8deg]" />
            <span className="text-xl font-bold text-primary">StudyQ</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" className="font-medium hover:bg-primary/5 transition-all duration-200">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button className="font-medium shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-300">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ────── Hero ────── */}
      <section className="relative py-28 px-6 overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl animate-float top-[-100px] right-[-200px]" />
        <div className="absolute w-[400px] h-[400px] rounded-full bg-accent/5 blur-3xl animate-float-reverse bottom-[-100px] left-[-150px]" />
        <div className="absolute w-[200px] h-[200px] rounded-full bg-blue-400/5 blur-2xl animate-float top-[40%] left-[60%]" style={{ animationDelay: "2s" }} />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-8 animate-fade-in-up">
            <Zap className="w-3.5 h-3.5" />
            Built for Modern Academic Institutions
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] animate-fade-in-up animation-delay-100">
            The Academic Workspace{" "}
            <br className="hidden md:block" />
            for{" "}
            <span className="gradient-text">Organized Learning</span>
          </h1>

          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
            StudyQ helps teachers share study materials instantly and students access resources effortlessly.
            One platform, zero friction.
          </p>

          <div className="mt-12 flex items-center justify-center gap-4 flex-wrap animate-fade-in-up animation-delay-300">
            <Link to="/register">
              <Button
                size="lg"
                className="gap-2 h-13 px-8 text-base font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/25 hover:scale-[1.04] active:scale-[0.97]"
              >
                Start Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="h-13 px-8 text-base font-semibold transition-all duration-300 hover:bg-primary/5 hover:border-primary/30 hover:scale-[1.03]"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ────── Features ────── */}
      <section className="py-24 px-6 bg-muted/30 relative">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight animate-fade-in-up">
              Built for Academic Institutions
            </h2>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto animate-fade-in-up animation-delay-100">
              Everything you need to manage, distribute, and track study materials
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Upload,
                title: "Upload & Organize",
                desc: "Teachers upload materials tagged by subject, semester, and year. Students find exactly what they need.",
                color: "from-blue-500 to-blue-600",
                bg: "bg-blue-50 dark:bg-blue-950/30",
                iconColor: "text-blue-600 dark:text-blue-400",
              },
              {
                icon: BarChart2,
                title: "Track & Analyze",
                desc: "See download trends, popular subjects, and student engagement in real time.",
                color: "from-emerald-500 to-emerald-600",
                bg: "bg-emerald-50 dark:bg-emerald-950/30",
                iconColor: "text-emerald-600 dark:text-emerald-400",
              },
              {
                icon: Shield,
                title: "Secure & Role-Based",
                desc: "JWT authentication, role-based access, and full audit logging for institutional compliance.",
                color: "from-violet-500 to-violet-600",
                bg: "bg-violet-50 dark:bg-violet-950/30",
                iconColor: "text-violet-600 dark:text-violet-400",
              },
            ].map((f, i) => (
              <div
                key={i}
                className={`group p-7 bg-card rounded-2xl border shadow-sm hover-lift cursor-default animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                <div className={`w-14 h-14 rounded-xl ${f.bg} flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]`}>
                  <f.icon className={`w-7 h-7 ${f.iconColor}`} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── How It Works ────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight animate-fade-in-up">How It Works</h2>
            <p className="mt-4 text-muted-foreground text-lg animate-fade-in-up animation-delay-100">
              Three simple steps to get started
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-[52px] left-[20%] right-[20%] h-[2px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

            {[
              { step: "1", title: "Create Account", desc: "Register as a student in seconds. No approval needed.", emoji: "✨" },
              { step: "2", title: "Browse or Upload", desc: "Teachers upload materials. Students search and download.", emoji: "📖" },
              { step: "3", title: "Track Progress", desc: "Analytics dashboard shows usage, downloads, and trends.", emoji: "📈" },
            ].map((s, i) => (
              <div key={i} className="text-center relative animate-fade-in-up" style={{ animationDelay: `${i * 0.2}s` }}>
                <div className="relative inline-block mb-6">
                  <div className="w-[104px] h-[104px] rounded-full bg-primary/5 flex items-center justify-center mx-auto">
                    <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground font-bold text-2xl flex items-center justify-center shadow-lg shadow-primary/20 transition-transform duration-300 hover:scale-110">
                      {s.step}
                    </div>
                  </div>
                  <span className="absolute -top-1 -right-1 text-2xl">{s.emoji}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground max-w-xs mx-auto">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────── Stats ────── */}
      <section className="py-20 px-6 bg-foreground text-background">
        <div className="max-w-5xl mx-auto">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat, i) => {
              const { count, ref } = useCountUp(stat.target)
              return (
                <div key={i} ref={ref} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <stat.icon className="w-8 h-8 mx-auto mb-3 opacity-60" />
                  <div className="text-4xl md:text-5xl font-extrabold tabular-nums">
                    {count}{stat.suffix}
                  </div>
                  <p className="mt-2 text-sm opacity-60 font-medium">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ────── CTA ────── */}
      <section className="relative py-24 px-6 gradient-animated overflow-hidden">
        {/* Decorative orbs */}
        <div className="absolute w-80 h-80 rounded-full bg-white/5 blur-2xl animate-float top-[-60px] left-[-60px]" />
        <div className="absolute w-60 h-60 rounded-full bg-blue-400/10 blur-2xl animate-float-reverse bottom-[-30px] right-[-30px]" />

        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight animate-fade-in-up">
            Ready to modernize your{" "}
            <span className="text-blue-300">classroom</span>?
          </h2>
          <p className="text-white/70 text-lg mb-10 animate-fade-in-up animation-delay-100">
            Join institutions already using StudyQ to distribute study materials efficiently and securely.
          </p>
          <Link to="/register" className="animate-fade-in-up animation-delay-200 inline-block">
            <Button
              variant="secondary"
              size="lg"
              className="gap-2 h-14 px-10 text-base font-semibold rounded-xl shadow-xl transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl animate-glow"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* ────── Footer ────── */}
      <footer className="py-10 px-6 border-t bg-card/50">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="font-bold text-primary">StudyQ</span>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} StudyQ. Built for learners.</p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            {["Privacy", "Terms", "Support"].map((link) => (
              <a key={link} href="#" className="hover:text-foreground transition-colors duration-200 hover:underline underline-offset-4">
                {link}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
