import { API_URL } from '../config'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Users, Frown, Loader2, Clock, Eye, Mail, Sparkles, LogIn } from 'lucide-react'
import Navbar from '../components/Navbar'
import FilterPanel from '../components/FilterPanel'
import ProfileCard from '../components/ProfileCard'
import EmailModal from '../components/EmailModal'
import { useToast } from '../components/Toast'
import { generateCopilotInsights } from '../utils/copilot';

/**
 * Dashboard — Main matches page
 * Features filter sidebar, recent activity, responsive match grid, and email modal
*/
const DEFAULT_FILTERS = {
  ageMin: 21,
  ageMax: 40,
  religion: '',
  diet: '',
  city: '',
  openToRelocate: '',
  openToPets: '',
  wantsChildren: '',
  statusTag: '',
  stage: '',
}

export default function Dashboard({ user, token, onLogout }) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS })
  const [sortBy, setSortBy] = useState('score')
  const [emailModal, setEmailModal] = useState({ open: false, match: null })
  const [activities, setActivities] = useState([])
  const [showActivity, setShowActivity] = useState(true)
  const navigate = useNavigate()
  const { addToast } = useToast()
  const insights = generateCopilotInsights(matches);
  
  const fetchMatches = useCallback(async () => {
    setLoading(true)
    try {
      const params = { user_id: user?.id || user?.user_id }
      // Add non-empty filter values
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== undefined) {
          // Map camelCase to snake_case for backend
          const paramKey = key === 'statusTag' ? 'status_tag' : key
          params[paramKey] = value
        }
      })

      const res = await axios.get(`${API_URL}/api/matches`, { params })
      setMatches(res.data.matches || [])
    } catch (err) {
      addToast('Failed to load matches. Please try again.', 'error')
      setMatches([])
    } finally {
      setLoading(false)
    }
  }, [filters, user?.id, user?.user_id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch recent activity
 const fetchActivity = useCallback(() => {
  try {
    const savedActivities = JSON.parse(
      localStorage.getItem("activity-log") || "[]"
    )

    setActivities(savedActivities)
  } catch {
    setActivities([])
  }
}, [])

  // Fetch on mount
  useEffect(() => {
    fetchMatches()
    fetchActivity()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sort matches
  const sortedMatches = useMemo(() => {
    const sorted = [...matches]
    switch (sortBy) {
      case 'score':
        return sorted.sort((a, b) => (b.score?.overall_score || 0) - (a.score?.overall_score || 0))
      case 'age':
        return sorted.sort((a, b) => (a.profile?.age || 0) - (b.profile?.age || 0))
      case 'name':
        return sorted.sort((a, b) => (a.profile?.name || '').localeCompare(b.profile?.name || ''))
      default:
        return sorted
    }
  }, [matches, sortBy])

  const handleReset = () => {
    setFilters({ ...DEFAULT_FILTERS })
    setTimeout(() => fetchMatches(), 0)
  }

  // Activity icon mapper
  const getActivityIcon = (action) => {
    switch (action) {
      case 'login': return <LogIn size={14} />
      case 'viewed_profile': return <Eye size={14} />
      case 'sent_intro': return <Mail size={14} />
      case 'ai_insight': return <Sparkles size={14} />
      default: return <Clock size={14} />
    }
  }

  const getActivityColor = (action) => {
    switch (action) {
      case 'login': return 'var(--lavender)'
      case 'viewed_profile': return 'var(--coral)'
      case 'sent_intro': return '#22c55e'
      case 'ai_insight': return 'var(--gold)'
      default: return 'var(--text-muted)'
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return ''
    try {
      const d = new Date(timestamp)
      const now = new Date()
      const diffMs = now - d
      const diffMin = Math.floor(diffMs / 60000)
      if (diffMin < 1) return 'Just now'
      if (diffMin < 60) return `${diffMin}m ago`
      const diffHr = Math.floor(diffMin / 60)
      if (diffHr < 24) return `${diffHr}h ago`
      return d.toLocaleDateString()
    } catch {
      return ''
    }
  }

  return (
    <div
      className="page-enter"
      style={{ minHeight: "100vh", background: "var(--bg-primary)" }}
    >
      <Navbar user={user} onLogout={onLogout} />

      <main
        style={{
          paddingTop: "80px",
          paddingLeft: "24px",
          paddingRight: "24px",
          paddingBottom: "40px",
          maxWidth: "1400px",
          margin: "0 auto",
          display: "flex",
          gap: "24px",
        }}
      >
        {/* Filter Sidebar */}
        <FilterPanel
          filters={filters}
          setFilters={setFilters}
          onApply={fetchMatches}
          onReset={handleReset}
        />

        {/* Main Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* KPI CARDS */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "16px",
              marginBottom: "24px",
            }}
          >
            <div className="glass-card-static" style={{ padding: "20px" }}>
              <div style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>
                Total Clients
              </div>

              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  marginTop: "8px",
                }}
              >
                100
              </div>
            </div>

            <div className="glass-card-static" style={{ padding: "20px" }}>
              <div style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>
                High Potential Matches
              </div>

              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--gold)",
                  marginTop: "8px",
                }}
              >
                {
                  matches.filter((m) => (m.score?.overall_score || 0) >= 80)
                    .length
                }
              </div>
            </div>

            <div className="glass-card-static" style={{ padding: "20px" }}>
              <div style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>
                Intros Sent
              </div>

              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "#22c55e",
                  marginTop: "8px",
                }}
              >
                {activities.filter((a) => a.action === "sent_intro").length}
              </div>
            </div>

            <div className="glass-card-static" style={{ padding: "20px" }}>
              <div style={{ color: "var(--text-muted)", fontSize: ".8rem" }}>
                AI Insights Generated
              </div>

              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--lavender)",
                  marginTop: "8px",
                }}
              >
                {activities.filter((a) => a.action === "ai_insight").length}
              </div>
            </div>
          </div>

          <div
            className="glass-card-static"
            style={{
              padding: "20px",
              marginBottom: "24px",
            }}
          >
            <h3
              className="font-heading"
              style={{
                marginBottom: "12px",
                color: "var(--lavender)",
              }}
            >
              AI Matchmaker Copilot
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
                gap: "16px",
              }}
            >
              <div className="copilot-card">
                <div className="copilot-title">Recommended Today</div>

                <div className="copilot-text">Zara Pillai</div>

                <div className="copilot-reason">Strong family alignment</div>
              </div>

              <div className="copilot-card">
                <div className="copilot-title">Needs Review</div>

                <div className="copilot-text">4 profiles</div>

                <div className="copilot-reason">Compatibility below 60%</div>
              </div>

              <div className="copilot-card">
                <div className="copilot-title">Suggested Action</div>

                <div className="copilot-text">Send Introduction</div>

                <div className="copilot-reason">High response likelihood</div>
              </div>
            </div>
          </div>
          {/* Today's Priorities */}

          <div
            className="glass-card-static"
            style={{
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "18px",
              }}
            >
              <h3
                className="font-heading"
                style={{
                  margin: 0,
                }}
              >
                Today's Priorities
              </h3>

              <span
                style={{
                  fontSize: ".8rem",
                  color: "var(--text-muted)",
                }}
              >
                Matchmaker Workspace
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
                gap: "16px",
              }}
            >
              <div className="priority-card">
                <div className="priority-number">
                  {
                    matches.filter((m) => (m.score?.overall_score || 0) >= 80)
                      .length
                  }
                </div>

                <div className="priority-label">High Potential Matches</div>
              </div>

              <div className="priority-card">
                <div className="priority-number">7</div>

                <div className="priority-label">Profiles Need Review</div>
              </div>

              <div className="priority-card">
                <div className="priority-number">3</div>

                <div className="priority-label">Introductions Pending</div>
              </div>

              <div className="priority-card">
                <div className="priority-number">2</div>

                <div className="priority-label">Follow Ups Due</div>
              </div>
            </div>
          </div>

          {/* Pipeline*/}
          <div
            className="glass-card-static"
            style={{
              padding: "24px",
              marginBottom: "24px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h3 className="font-heading">Matchmaking Pipeline</h3>

              <span
                style={{
                  color: "var(--text-muted)",
                  fontSize: ".85rem",
                }}
              >
                Customer Journey
              </span>
            </div>

            <div className="pipeline-container">
              <div className="pipeline-stage">
                <div className="pipeline-count">12</div>
                <div>New Leads</div>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-stage">
                <div className="pipeline-count">8</div>
                <div>Review</div>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-stage">
                <div className="pipeline-count">15</div>
                <div>Matching</div>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-stage">
                <div className="pipeline-count">6</div>
                <div>Intro Sent</div>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-stage">
                <div className="pipeline-count">4</div>
                <div>Discussion</div>
              </div>

              <div className="pipeline-arrow">→</div>

              <div className="pipeline-stage">
                <div className="pipeline-count">2</div>
                <div>Meeting</div>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          {activities.length > 0 && showActivity && (
            <div
              className="glass-card-static animate-fadeInUp"
              style={{ padding: "18px", marginBottom: "20px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <Clock size={16} color="var(--lavender)" />
                  <h3
                    className="font-heading"
                    style={{ fontSize: "0.95rem", fontWeight: 700 }}
                  >
                    Recent Activity
                  </h3>
                </div>
                <button
                  onClick={() => setShowActivity(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--text-muted)",
                    cursor: "pointer",
                    fontSize: "0.75rem",
                  }}
                >
                  Hide
                </button>
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  overflowX: "auto",
                  paddingBottom: "4px",
                }}
              >
                {activities.slice(0, 8).map((act, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 12px",
                      background: "rgba(167, 139, 250, 0.04)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid rgba(167, 139, 250, 0.08)",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                      fontSize: "0.78rem",
                    }}
                  >
                    <span style={{ color: getActivityColor(act.action) }}>
                      {getActivityIcon(act.action)}
                    </span>
                    <span style={{ color: "var(--text-secondary)" }}>
                      {act.details}
                    </span>
                    <span
                      style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}
                    >
                      {formatTime(act.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Users size={20} color="var(--rose-secondary)" />
              <h2
                className="font-heading"
                style={{ fontSize: "1.3rem", fontWeight: 700 }}
              >
                {loading
                  ? "Finding Matches..."
                  : `${sortedMatches.length} Matches Found`}
              </h2>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Sort by:
              </label>
              <select
                className="input-glass"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: "auto",
                  padding: "8px 36px 8px 12px",
                  fontSize: "0.85rem",
                }}
              >
                <option value="score">Score</option>
                <option value="age">Age</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading && (
            <div className="match-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton glass-card-static"
                  style={{
                    height: "380px",
                    animation: `fadeInUp 0.3s ease ${i * 0.1}s both`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!loading && sortedMatches.length === 0 && (
            <div
              className="animate-fadeInUp"
              style={{ textAlign: "center", padding: "80px 20px" }}
            >
              <Frown
                size={64}
                color="var(--text-muted)"
                style={{ marginBottom: "16px", opacity: 0.5 }}
              />
              <h3
                className="font-heading"
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 600,
                  marginBottom: "8px",
                }}
              >
                No matches found
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
                Try adjusting your filters to discover more profiles
              </p>
            </div>
          )}

          {/* Match Grid */}
          {!loading && sortedMatches.length > 0 && (
            <div className="match-grid">
              {sortedMatches.map((match, index) => (
                <ProfileCard
                  key={match.profile?.id || match.profile?.name || index}
                  match={match}
                  index={index}
                  onViewProfile={(id) => navigate(`/profile/${id}`)}
                  onSendEmail={(m) => setEmailModal({ open: true, match: m })}
                  user={user}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Email Modal */}
      {emailModal.open && emailModal.match && (
        <EmailModal
          match={emailModal.match}
          user={user}
          onClose={() => setEmailModal({ open: false, match: null })}
        />
      )}
    </div>
  );
}
