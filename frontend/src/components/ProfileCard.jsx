import { useState } from 'react'
import {
  Heart,
  Mail,
  Eye,
  ShieldCheck,
  GraduationCap,
  Languages,
  Landmark,
  UtensilsCrossed
} from 'lucide-react'
import MatchScore from './MatchScore'

/**
 * ProfileCard — Glassmorphic card for each match in the grid
 * Features animated entrance, match score, verification badges, status tags, and action buttons
 */
export default function ProfileCard({ match, index = 0, onViewProfile, onSendEmail, user }) {
  const [liked, setLiked] = useState(false)
  const { profile, score } = match
  const totalScore = score?.overall_score || 0
  const matchReasons = score?.match_reasons || []

  // Determine match category
 const getCategory = () => {
   if (totalScore >= 90)
     return {
       label: "Recommended",
       className: "badge-soulmate",
     };

   if (totalScore >= 75)
     return {
       label: "Strong Match",
       className: "badge-high",
     };

   if (totalScore >= 60)
     return {
       label: "Good Match",
       className: "badge-good",
     };

   return {
     label: "Review",
     className: "badge-moderate",
   };
 };

  const category = getCategory()
  const dietEmoji = profile?.diet?.toLowerCase()?.includes('veg') ? '🥗' : '🍖'

  return (
    <div
      className="glass-card"
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
        animation: `fadeInUp 0.5s ease ${index * 0.05}s both`,
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "3px",
          background:
            "linear-gradient(90deg,var(--rose-primary),var(--lavender))",
        }}
      />
      <div
        style={{
          width: "100%",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--gold)",
                lineHeight: 1,
              }}
            >
              {totalScore}%
            </div>

            <div
              style={{
                fontSize: ".75rem",
                color: "var(--text-muted)",
              }}
            >
              Compatibility Score
            </div>
          </div>

          <span className={`badge ${category.className}`}>
            {category.label}
          </span>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          marginTop: "6px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
            fontSize: ".75rem",
          }}
        >
          <span>Acceptance Probability</span>

          <span>{Math.min(95, Math.round(totalScore * 0.9))}%</span>
        </div>

        <div className="score-bar">
          <div
            className="score-bar-fill"
            style={{
              width: `${Math.min(95, Math.round(totalScore * 0.9))}%`,
              background: "linear-gradient(90deg,#22c55e,#4ade80)",
            }}
          />
        </div>
      </div>

      {/* Status Tag — Top Left */}
      {profile?.status_tag && (
        <div
          style={{
            alignSelf: "flex-start",
            marginTop: "8px",
          }}
        >
          <span
            className={`badge badge-status badge-status-${profile.status_tag?.toLowerCase()}`}
            style={{
              fontSize: "0.7rem",
              padding: "4px 10px",
            }}
          >
            {profile.status_tag}
          </span>
        </div>
      )}
      {/* Profile Photo with verification badge */}
      <div style={{ position: "relative", marginTop: "8px" }}>
        <div className="photo-ring">
          <img
            src={
              profile?.photo_url ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || "user")}`
            }
            alt={profile?.name}
            style={{ width: "76px", height: "76px" }}
          />
        </div>
        {profile?.photo_verified && (
          <div
            style={{
              position: "absolute",
              bottom: "0",
              right: "-2px",
              background: "#22c55e",
              borderRadius: "50%",
              padding: "3px",
              display: "flex",
              border: "2px solid var(--bg-primary)",
            }}
          >
            <ShieldCheck size={10} color="white" />
          </div>
        )}
      </div>

      {/* Name, Age, City */}
      <div style={{ textAlign: "center" }}>
        <h3
          className="font-heading"
          style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "2px" }}
        >
          {profile?.name || "Unknown"}
        </h3>
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>
          {profile?.age || "—"} • {profile?.city || "—"}
        </p>
      </div>

      {/* Profession + Company */}
      <div
        style={{
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: ".72rem",
            color: "var(--text-muted)",
            marginBottom: "8px",
          }}
        >
          <span>Last Active: 2d ago</span>

          <span>Stage: {profile?.status_tag || "Review"}</span>
        </div>

        <p
          style={{
            fontSize: "0.78rem",
            color: "var(--lavender)",
            textAlign: "center",
            fontWeight: 500,
            margin: 0,
          }}
        >
          {profile?.profession || ""}
          {profile?.company &&
          profile.company !== "Self-Employed" &&
          profile.company !== "Freelancer"
            ? ` • ${profile.company}`
            : ""}
        </p>
      </div>

      {/* Top Match Reason (key differentiator) */}
      {matchReasons.length > 0 && (
        <div
          style={{
            width: "100%",
            padding: "12px",
            borderLeft: "3px solid #22c55e",
            background: "rgba(255,255,255,.03)",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              color: "#22c55e",
              fontWeight: 600,
              marginBottom: "6px",
              fontSize: ".78rem",
            }}
          >
            Why Recommended
          </div>

          <div
            style={{
              fontSize: ".75rem",
              color: "var(--text-secondary)",
            }}
          >
            {matchReasons[0]}
          </div>
        </div>
      )}

      <div
        style={{
          width: "100%",
          padding: "12px",
          background: "rgba(167,139,250,.04)",
          border: "1px solid rgba(167,139,250,.08)",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            color: "var(--lavender)",
            fontSize: ".75rem",
            fontWeight: 600,
            marginBottom: "8px",
          }}
        >
          Matchmaker Assistant
        </div>

        <ul
          style={{
            fontSize: ".75rem",
            color: "var(--text-secondary)",
            paddingLeft: "16px",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          <li>Strong family value alignment</li>
          <li>Compatible lifestyle preferences</li>
          <li>High response likelihood</li>
        </ul>
      </div>

      {/* Quick Info Pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
          justifyContent: "center",
        }}
      >
        {profile?.diet && (
          <span
            className="info-pill"
            style={{ fontSize: "0.7rem", padding: "3px 8px" }}
          >
            <UtensilsCrossed size={12} /> {profile.diet}
          </span>
        )}
        {profile?.religion && (
          <span
            className="info-pill"
            style={{ fontSize: "0.7rem", padding: "3px 8px" }}
          >
            <Landmark size={12} /> {profile.religion}
          </span>
        )}
        {profile?.mother_tongue && (
          <span
            className="info-pill"
            style={{ fontSize: "0.7rem", padding: "3px 8px" }}
          >
            <Languages size={12} /> {profile.mother_tongue}
          </span>
        )}
        {profile?.education && (
          <span
            className="info-pill"
            style={{ fontSize: "0.7rem", padding: "3px 8px" }}
          >
            <GraduationCap size={12} /> {profile.education}
          </span>
        )}
      </div>

      {/* Verification row */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {profile?.photo_verified && (
          <span
            className="verification-badge verification-badge-verified"
            style={{ fontSize: "0.65rem", padding: "2px 8px" }}
          >
            <ShieldCheck size={10} /> Photo ✓
          </span>
        )}
        {profile?.income_verified && (
          <span
            className="verification-badge verification-badge-verified"
            style={{ fontSize: "0.65rem", padding: "2px 8px" }}
          >
            💰 Income ✓
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
        <button
          className="btn-icon"
          onClick={() => setLiked(!liked)}
          title="Like"
          style={{
            color: liked ? "#e11d48" : "var(--text-secondary)",
            borderColor: liked
              ? "rgba(225, 29, 72, 0.4)"
              : "var(--border-subtle)",
          }}
        >
          <Heart size={16} fill={liked ? "#e11d48" : "none"} />
        </button>
        <button
          className="btn-icon"
          onClick={() => onSendEmail && onSendEmail(match)}
          title="Send Email"
        >
          <Mail size={16} />
        </button>
        <button
          className="btn-icon"
          onClick={() =>
            onViewProfile && onViewProfile(profile?.id || profile?.name)
          }
          title="View Profile"
          style={{
            color: "var(--lavender)",
            borderColor: "rgba(167, 139, 250, 0.3)",
          }}
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
}
