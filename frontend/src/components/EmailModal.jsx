import { useState, useEffect } from 'react'
import axios from 'axios'
import { X, Loader2, Send, Sparkles } from 'lucide-react'
import MatchScore from './MatchScore'
import { useToast } from './Toast'

/**
 * EmailModal — Send AI-generated introduction to a match
 * Features auto-generated intro text that can be edited
 */
export default function EmailModal({ match, user, onClose }) {
  const [introText, setIntroText] = useState('')
  const [introLoading, setIntroLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const { addToast } = useToast()

  const profile = match?.profile
  const score = match?.score
  const matchId = profile?.id || profile?.name

  // Fetch AI-generated intro on mount
  useEffect(() => {
    const fetchIntro = async () => {
      try {
        const res = await axios.post('/api/ai/intro', {
          user_id: user?.id || user?.user_id,
          match_id: matchId
        })
        setIntroText(res.data.intro || res.data.intro_message || 'Hi! I found your profile really interesting and would love to connect.')
      } catch {
        setIntroText(
          `Hi ${profile?.name || 'there'}!\n\nI came across your profile and was really impressed. I'd love to get to know you better. Would you be open to chatting sometime?\n\nLooking forward to hearing from you!`
        )
      } finally {
        setIntroLoading(false)
      }
    }
    fetchIntro()
  }, [user?.id, matchId, profile?.name])

  const handleSend = async () => {
    setSendLoading(true)
    try {
      await axios.post('/api/email/send', {
          user_id: user?.id || user?.user_id,
        match_id: matchId,
        message: introText
      })
      addToast(`Introduction sent to ${profile?.name}! 💌`, 'success')
      onClose()
    } catch {
      addToast('Failed to send email. Please try again.', 'error')
    } finally {
      setSendLoading(false)
    }
  }

const regenerateIntro = async () => {
  setRegenerating(true)

  try {
    const res = await axios.post(
      "/api/ai/intro",
      {
        user_id: user?.id || user?.user_id,
        match_id: matchId,
      }
    )

    setIntroText(
      res.data.intro ||
      res.data.intro_message ||
      introText
    )
  } catch {
    addToast(
      "Unable to regenerate intro",
      "error"
    )
  } finally {
    setRegenerating(false)
  }
}

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content glass-card-static"
        style={{
          padding: "28px",
          width: "700px",
          maxWidth: "90vw",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
          }}
        >
          <h2
            className="font-heading"
            style={{ fontSize: "1.15rem", fontWeight: 700 }}
          >
            Send Introduction
          </h2>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Match Summary */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            padding: "14px",
            background: "var(--bg-glass)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-subtle)",
            marginBottom: "20px",
          }}
        >
          <div className="photo-ring">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || "user")}`}
              alt={profile?.name}
              style={{ width: "44px", height: "44px" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <p
              className="font-heading"
              style={{ fontWeight: 600, fontSize: "0.95rem" }}
            >
              {profile?.name || "Unknown"}
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              {profile?.age || "—"} • {profile?.city || "—"}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <MatchScore score={score?.overall_score || 0} size={44} />

            <span
              style={{
                fontSize: ".7rem",
                color: "#22c55e",
                fontWeight: 600,
              }}
            >
              High Response Chance
            </span>
          </div>
        </div>

        <div
          style={{
            padding: "14px",
            marginBottom: "18px",
            background: "rgba(167,139,250,.05)",
            border: "1px solid rgba(167,139,250,.1)",
            borderRadius: "12px",
          }}
        >
          <div
            style={{
              fontSize: ".8rem",
              fontWeight: 600,
              color: "var(--lavender)",
              marginBottom: "8px",
            }}
          >
            Matchmaker Assistant
          </div>

          <ul
            style={{
              margin: 0,
              paddingLeft: "18px",
              fontSize: ".8rem",
              color: "var(--text-secondary)",
              lineHeight: 1.6,
            }}
          >
            <li>Strong family compatibility</li>
            <li>High acceptance probability</li>
            <li>Similar long-term goals</li>
          </ul>
        </div>
        {/* AI Intro Section */}
        <div style={{ marginBottom: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "10px",
            }}
          >
            <Sparkles size={16} color="var(--lavender)" />
            <button
              className="btn-glass"
              onClick={regenerateIntro}
              disabled={regenerating}
              style={{
                marginLeft: "auto",
                fontSize: ".75rem",
              }}
            >
              {regenerating ? "Generating..." : "Regenerate"}
            </button>
            <span className="badge badge-ai">✨ AI-Generated</span>
          </div>

          {introLoading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                padding: "30px",
                color: "var(--lavender)",
                fontSize: "0.9rem",
              }}
            >
              <Loader2 size={20} className="animate-spin" />
              Generating personalized intro...
            </div>
          ) : (
            <textarea
              className="input-glass"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              rows={5}
              style={{ width: "100%", resize: "vertical" }}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={sendLoading || introLoading}
            style={{ flex: 1 }}
          >
            {sendLoading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                <Send size={16} />
                Send Introduction
              </>
            )}
          </button>
          <button className="btn-glass" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
