import { useState, useEffect } from "react"
import { useLocation } from "react-router-dom"
import { useLogin, useRegister } from "@/features/auth/hooks/useAuth"
import { BookOpen, Mail, Lock, User, ArrowRight, GraduationCap, FileText, Users, Sparkles } from "lucide-react"

interface AuthPageProps {
  initialMode?: "signin" | "signup"
}

export function AuthPage({ initialMode }: AuthPageProps) {
  const location = useLocation()
  const loginMutation = useLogin()
  const registerMutation = useRegister()

  const [isSignUp, setIsSignUp] = useState(initialMode === "signup" || location.pathname === "/register")

  // State for sign-in form
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  // State for sign-up form
  const [regName, setRegName] = useState("")
  const [regEmail, setRegEmail] = useState("")
  const [regPassword, setRegPassword] = useState("")
  const [regError, setRegError] = useState("")

  // Sync URL with mode
  useEffect(() => {
    const path = isSignUp ? "/register" : "/login"
    if (location.pathname !== path) {
      window.history.replaceState(null, "", path)
    }
  }, [isSignUp, location.pathname])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    loginMutation.mutate(
      { email: loginEmail, password: loginPassword },
      {
        onError: (error: any) => {
          setLoginError(error.response?.data?.message || "Login failed")
        },
      }
    )
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError("")
    registerMutation.mutate(
      { name: regName, email: regEmail, password: regPassword },
      {
        onError: (error: any) => {
          setRegError(error.response?.data?.message || "Registration failed")
        },
      }
    )
  }

  const loginLoading = loginMutation.isPending
  const regLoading = registerMutation.isPending

  return (
    <div className="auth-page">
      {/* Floating background decorations */}
      <div className="auth-bg-orb auth-bg-orb--1" />
      <div className="auth-bg-orb auth-bg-orb--2" />
      <div className="auth-bg-orb auth-bg-orb--3" />

      <div className={`auth-container${isSignUp ? " s--signup" : ""}`}>
        {/* ══════ SIGN IN FORM ══════ */}
        <div className="auth-form auth-form--signin">
          <div className="auth-form__inner">
            <div className="auth-form__logo">
              <BookOpen className="auth-form__logo-icon" />
              <span>StudyQ</span>
            </div>
            <h2 className="auth-form__title">Welcome Back</h2>
            <p className="auth-form__subtitle">Sign in to continue your learning journey</p>

            <form onSubmit={handleLogin}>
              {loginError && <div className="auth-error">{loginError}</div>}

              <div className="auth-field">
                <Mail className="auth-field__icon" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <div className="auth-field__line" />
              </div>

              <div className="auth-field">
                <Lock className="auth-field__icon" />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <div className="auth-field__line" />
              </div>

              <button type="submit" className="auth-btn" disabled={loginLoading}>
                {loginLoading ? (
                  <span className="auth-btn__loading">
                    <span className="auth-spinner" />
                    Signing in...
                  </span>
                ) : (
                  <span className="auth-btn__content">
                    Sign In <ArrowRight className="auth-btn__arrow" />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* ══════ OVERLAY PANEL ══════ */}
        <div className="auth-overlay">
          <div className="auth-overlay__panel">
            {/* Image background */}
            <div className="auth-overlay__img auth-overlay__img--signin">
              <img src="/students-studying.png" alt="Students studying" />
            </div>
            <div className="auth-overlay__img auth-overlay__img--signup">
              <img src="/books-education.png" alt="Books and education" />
            </div>

            {/* Gradient overlay */}
            <div className="auth-overlay__gradient" />

            {/* Sign-up prompt (visible when on sign-in) */}
            <div className="auth-overlay__text auth-overlay__text--signup">
              <Sparkles className="auth-overlay__sparkle" />
              <h3>New Here?</h3>
              <p>Create an account and unlock access to study materials, analytics, and more.</p>
              <div className="auth-overlay__stats">
                <div className="auth-overlay__stat">
                  <FileText className="auth-overlay__stat-icon" />
                  <span>500+ Materials</span>
                </div>
                <div className="auth-overlay__stat">
                  <Users className="auth-overlay__stat-icon" />
                  <span>2000+ Students</span>
                </div>
                <div className="auth-overlay__stat">
                  <GraduationCap className="auth-overlay__stat-icon" />
                  <span>50+ Teachers</span>
                </div>
              </div>
            </div>

            {/* Sign-in prompt (visible when on sign-up) */}
            <div className="auth-overlay__text auth-overlay__text--signin">
              <BookOpen className="auth-overlay__sparkle" />
              <h3>Welcome Back!</h3>
              <p>Already have an account? Sign in to access your personalized dashboard.</p>
              <div className="auth-overlay__stats">
                <div className="auth-overlay__stat">
                  <Lock className="auth-overlay__stat-icon" />
                  <span>Secure Login</span>
                </div>
                <div className="auth-overlay__stat">
                  <Sparkles className="auth-overlay__stat-icon" />
                  <span>Turn effort into results</span>
                </div>
              </div>
            </div>

            {/* Toggle button */}
            <div className="auth-overlay__toggle">
              <button
                className="auth-overlay__btn"
                onClick={() => setIsSignUp(!isSignUp)}
                type="button"
              >
                <span className="auth-overlay__btn-text auth-overlay__btn-text--signup">
                  Sign Up
                </span>
                <span className="auth-overlay__btn-text auth-overlay__btn-text--signin">
                  Sign In
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* ══════ SIGN UP FORM ══════ */}
        <div className="auth-form auth-form--signup">
          <div className="auth-form__inner">
            <div className="auth-form__logo">
              <BookOpen className="auth-form__logo-icon" />
              <span>StudyQ</span>
            </div>
            <h2 className="auth-form__title">Create Account</h2>
            <p className="auth-form__subtitle">Join as a student and start learning today</p>

            <form onSubmit={handleRegister}>
              {regError && <div className="auth-error">{regError}</div>}

              <div className="auth-field">
                <User className="auth-field__icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
                <div className="auth-field__line" />
              </div>

              <div className="auth-field">
                <Mail className="auth-field__icon" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                <div className="auth-field__line" />
              </div>

              <div className="auth-field">
                <Lock className="auth-field__icon" />
                <input
                  type="password"
                  placeholder="Password (8+ chars, upper, lower, digit)"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <div className="auth-field__line" />
              </div>

              <button type="submit" className="auth-btn" disabled={regLoading}>
                {regLoading ? (
                  <span className="auth-btn__loading">
                    <span className="auth-spinner" />
                    Creating Account...
                  </span>
                ) : (
                  <span className="auth-btn__content">
                    Create Account <ArrowRight className="auth-btn__arrow" />
                  </span>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile toggle (visible only on small screens) */}
      <div className="auth-mobile-toggle">
        <button onClick={() => setIsSignUp(!isSignUp)} type="button">
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  )
}
