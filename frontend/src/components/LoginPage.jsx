import { API_URL } from '../config'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Heart, ArrowRight, Loader2 } from 'lucide-react'
import { useToast } from './Toast'

/**
 * LoginPage — Stunning entry point for The Date Crew
 * Features animated gradient background, floating hearts,
 * Google OAuth mock, and email/password login
 */
export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('demo@thedatecrew.com')
  const [password, setPassword] = useState('password')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const navigate = useNavigate()
  const { addToast } = useToast()

  // Generate floating heart elements
  const hearts = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 10}s`,
    duration: `${8 + Math.random() * 12}s`,
    size: `${14 + Math.random() * 18}px`,
    emoji: ['💕', '❤️', '💗', '✨', '💖', '💘'][Math.floor(Math.random() * 6)]
  }))

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      onLogin(res.data.user, res.data.token)
      addToast('Welcome to The Date Crew! 💕', 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.response?.data?.detail || 'Login failed. Please try again.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setGoogleLoading(true)
    try {
      const res = await axios.post(`${API_URL}/auth/google`, { token: 'mock' })
      onLogin(res.data.user, res.data.token)
      addToast('Welcome to The Date Crew! 💕', 'success')
      navigate('/dashboard')
    } catch (err) {
      addToast(err.response?.data?.detail || 'Google login failed. Please try again.', 'error')
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      {/* Floating Hearts Background */}
      <div className="floating-hearts">
        {hearts.map(heart => (
          <span
            key={heart.id}
            style={{
              left: heart.left,
              animationDelay: heart.delay,
              animationDuration: heart.duration,
              fontSize: heart.size
            }}
          >
            {heart.emoji}
          </span>
        ))}
      </div>

      {/* Login Card */}
      <div
        className="glass-card-static animate-fadeInUp"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px',
          position: 'relative',
          zIndex: 10
        }}
      >
        {/* Logo & Branding */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-block' }} className="animate-heartbeat">
            <Heart size={48} fill="#e11d48" color="#e11d48" />
          </div>
          <h1
            className="font-heading glow-text-rose"
            style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              marginTop: '12px',
              letterSpacing: '-0.02em'
            }}
          >
            The Date Crew
          </h1>
          <p style={{ color: 'var(--lavender)', fontStyle: 'italic', marginTop: '8px', fontSize: '0.95rem' }}>
            Where Tradition Meets Technology
          </p>
        </div>

        {/* Google OAuth Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={googleLoading}
          style={{
            width: '100%',
            padding: '12px',
            background: '#ffffff',
            color: '#333',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.95rem',
            fontWeight: 600,
            fontFamily: 'var(--font-body)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            transition: 'all 0.3s ease',
            opacity: googleLoading ? 0.7 : 1
          }}
          onMouseEnter={e => e.target.style.boxShadow = '0 4px 20px rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.target.style.boxShadow = 'none'}
        >
          {googleLoading ? (
            <Loader2 size={20} className="animate-spin" color="#333" />
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          Continue with Google
        </button>

        {/* OR Divider */}
        <div className="divider" style={{ margin: '24px 0' }}>OR</div>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Email
            </label>
            <input
              type="email"
              className="input-glass"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 500 }}>
              Password
            </label>
            <input
              type="password"
              className="input-glass"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Made with ❤️ for modern matchmaking
        </p>
      </div>
    </div>
  )
}
