import { Link, useLocation } from 'react-router-dom'
import { Heart, LogOut, User, Users } from 'lucide-react'

/**
 * Navbar — Fixed top navigation with glassmorphic styling
 * Shows branding, nav links, and user info when logged in
 */
export default function Navbar({ user, onLogout }) {
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav
      className="glass-navbar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}
    >
      {/* Left — Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
          <Heart
            size={24}
            fill="#e11d48"
            color="#e11d48"
            className="animate-heartbeat"
          />
          <span
            className="font-heading"
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              letterSpacing: '-0.01em'
            }}
          >
            The Date Crew
          </span>
        </Link>

        {/* Nav Links */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Link
              to="/dashboard"
              className="btn-glass"
              style={{
                textDecoration: 'none',
                borderColor: isActive('/dashboard') ? 'var(--rose-primary)' : 'var(--border-subtle)',
                color: isActive('/dashboard') ? 'var(--rose-light)' : 'var(--text-secondary)',
                background: isActive('/dashboard') ? 'rgba(225, 29, 72, 0.08)' : 'var(--bg-glass)',
              }}
            >
              <Users size={15} />
              Matches
            </Link>
            <Link
              to="/my-profile"
              className="btn-glass"
              style={{
                textDecoration: 'none',
                borderColor: isActive('/my-profile') ? 'var(--lavender)' : 'var(--border-subtle)',
                color: isActive('/my-profile') ? 'var(--lavender)' : 'var(--text-secondary)',
                background: isActive('/my-profile') ? 'rgba(167, 139, 250, 0.08)' : 'var(--bg-glass)',
              }}
            >
              <User size={15} />
              My Profile
            </Link>
          </div>
        )}
      </div>

      {/* Right — User Info */}
      {user && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img
            src={user.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name || 'User')}`}
            alt={user.name}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: '2px solid var(--rose-primary)',
              background: 'var(--bg-secondary)'
            }}
          />
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {user.name || 'User'}
          </span>
          <button
            onClick={onLogout}
            className="btn-icon"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      )}
    </nav>
  )
}

