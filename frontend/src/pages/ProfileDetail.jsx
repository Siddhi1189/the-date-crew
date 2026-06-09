import { API_URL } from '../config'
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Briefcase,
  GraduationCap,
  Building2,
  Heart,
  Utensils,
  Home,
  PawPrint,
  Baby,
  Cigarette,
  Wine,
  Globe,
  Users,
  Sparkles,
  Loader2,
  ShieldCheck,
  BadgeCheck,
  Phone,
  Calendar,
  Ruler,
  IndianRupee,
  Languages,
  BookOpen,
  User,
  MessageSquare,
  Star,
  FileText,
  Zap,
} from "lucide-react";
import Navbar from "../components/Navbar";
import MatchScore from "../components/MatchScore";
import EmailModal from "../components/EmailModal";
import { useToast } from "../components/Toast";

/**
 * ProfileDetail — Full tabbed profile view for a single match
 * Tabs: Overview, Family, Preferences, Notes, Matches
 */

const TABS = [
  { id: "overview", label: "Overview", icon: <User size={16} /> },
  { id: "family", label: "Family", icon: <Users size={16} /> },
  { id: "preferences", label: "Preferences", icon: <Heart size={16} /> },
  { id: "notes", label: "Notes", icon: <FileText size={16} /> },
  { id: "compatibility", label: "Match Analysis", icon: <Zap size={16} /> },
  {
    id: "activity",
    label: "Activity",
    icon: <Calendar size={16} />,
  },
];

export default function ProfileDetail({ user, token, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(true);
  const [emailModal, setEmailModal] = useState(false);
  const [showBrief, setShowBrief] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState("");
  const [savedNotes, setSavedNotes] = useState(() => {
    const stored = localStorage.getItem(`notes-${id}`);
    return stored ? JSON.parse(stored) : [];
  });
  const [activityLog, setActivityLog] = useState(() => {
    const stored = localStorage.getItem(`activity-${id}`);

    return stored
      ? JSON.parse(stored)
      : [
          {
            type: "review",
            text: "Profile reviewed",
            time: "2 days ago",
          },
          {
            type: "match",
            text: "Match generated",
            time: "1 day ago",
          },
        ];
  });
  // Fetch match detail
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/match/${id}`);
        setData(res.data);
      } catch (err) {
        addToast("Failed to load profile. Please try again.", "error");
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch AI insight after profile loads
  useEffect(() => {
    if (!data) return;
    const fetchInsight = async () => {
      try {
        const res = await axios.post(`${API_URL}/api/ai/insight`, {
          user_id: user?.id || user?.user_id,
          match_id: id,
        });
        setInsight(res.data.insight || "");
      } catch {
        setInsight(
          "A promising match with interesting compatibility across multiple dimensions. Explore shared interests and values to discover a deeper connection.",
        );
      } finally {
        setInsightLoading(false);
      }
    };
    fetchInsight();
  }, [data, user, id]);

  if (loading) {
    return (
      <div
        className="page-enter"
        style={{ minHeight: "100vh", background: "var(--bg-primary)" }}
      >
        <Navbar user={user} onLogout={onLogout} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "80vh",
            gap: "12px",
            color: "var(--lavender)",
          }}
        >
          <Loader2 size={28} className="animate-spin" />
          <span
            style={{ fontSize: "1.1rem", fontFamily: "var(--font-heading)" }}
          >
            Loading profile...
          </span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const profile = data.match_profile;
  const score = data.score;
  const overall = score?.overall_score || 0;
  const breakdown = score?.breakdown || {};
  const category = score?.category || "Unknown";
  const matchReasons = score?.match_reasons || [];

  // Category badge class
  const getBadgeClass = () => {
    if (overall >= 90) return "badge-soulmate";
    if (overall >= 75) return "badge-high";
    if (overall >= 60) return "badge-good";
    return "badge-moderate";
  };

  // Score bar color
  const getBarColor = (val) => {
    if (val >= 85) return "var(--gold)";
    if (val >= 70) return "var(--rose-secondary)";
    if (val >= 50) return "var(--coral)";
    return "var(--text-muted)";
  };

  // Breakdown dimensions
  const dimensions = [
    { key: "values", label: "Values & Beliefs", icon: "🙏" },
    { key: "family", label: "Family Fit", icon: "👨‍👩‍👧" },
    { key: "age", label: "Age Compatibility", icon: "🎂" },
    { key: "location", label: "Location", icon: "📍" },
    { key: "lifestyle", label: "Lifestyle", icon: "🏃" },
    { key: "professional", label: "Professional", icon: "💼" },
    { key: "compatibility", label: "Future Goals", icon: "🎯" },
    { key: "income", label: "Income Balance", icon: "💰" },
    { key: "height", label: "Height", icon: "📏" },
  ];

  const handleSaveNote = () => {
    if (!notes.trim()) return;

    const updatedNotes = [
      {
        type: "Review",
        text: notes,
        timestamp: new Date().toLocaleString(),
        author: user?.name || "You",
      },
      ...savedNotes,
    ];

    setSavedNotes(updatedNotes);

    localStorage.setItem(`notes-${id}`, JSON.stringify(updatedNotes));

    const updatedActivity = [
      {
        type: "note",
        text: "New note added",
        time: "Just now",
      },
      ...activityLog,
    ];

    setActivityLog(updatedActivity);

    localStorage.setItem(`activity-${id}`, JSON.stringify(updatedActivity));

    setNotes("");

    addToast("Note saved successfully! 📝", "success");
  };

  // =============================================
  // TAB CONTENT RENDERERS
  // =============================================

  const renderOverview = () => (
    <div className="animate-fadeInUp">
      {/* About */}
      {profile?.about && (
        <div
          className="glass-card-static"
          style={{ padding: "24px", marginBottom: "20px" }}
        >
          <h3
            className="font-heading"
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              marginBottom: "12px",
            }}
          >
            ✨ About
          </h3>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.92rem",
              lineHeight: 1.8,
              fontStyle: "italic",
            }}
          >
            "{profile.about}"
          </p>
        </div>
      )}

      {/* Personal Details */}
      <div
        className="glass-card-static"
        style={{ padding: "24px", marginBottom: "20px" }}
      >
        <h3
          className="font-heading"
          style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px" }}
        >
          👤 Personal Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              icon: <User size={18} />,
              label: "Full Name",
              value: profile?.name,
            },
            {
              icon: <Calendar size={18} />,
              label: "Date of Birth",
              value: profile?.date_of_birth,
            },
            {
              icon: <User size={18} />,
              label: "Age",
              value: profile?.age ? `${profile.age} years` : "—",
            },
            {
              icon: <Ruler size={18} />,
              label: "Height",
              value: profile?.height_cm ? `${profile.height_cm} cm` : "—",
            },
            { icon: <MapPin size={18} />, label: "City", value: profile?.city },
            {
              icon: <Phone size={18} />,
              label: "Phone",
              value: profile?.phone || "—",
            },
            {
              icon: <Heart size={18} />,
              label: "Marital Status",
              value: profile?.marital_status || "Never Married",
            },
            {
              icon: <Globe size={18} />,
              label: "Country",
              value: profile?.country || "India",
            },
          ].map((item, i) => (
            <div key={i} className="detail-item">
              <span className="detail-icon">{item.icon}</span>
              <div>
                <div className="detail-label">{item.label}</div>
                <div className="detail-value">{item.value || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Professional Details */}
      <div
        className="glass-card-static"
        style={{ padding: "24px", marginBottom: "20px" }}
      >
        <h3
          className="font-heading"
          style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px" }}
        >
          💼 Professional Details
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              icon: <Briefcase size={18} />,
              label: "Profession",
              value: profile?.profession,
            },
            {
              icon: <Building2 size={18} />,
              label: "Company",
              value: profile?.company || "—",
            },
            {
              icon: <User size={18} />,
              label: "Designation",
              value: profile?.designation || "—",
            },
            {
              icon: <IndianRupee size={18} />,
              label: "Income",
              value: profile?.income_lpa ? `₹${profile.income_lpa} LPA` : "—",
            },
            {
              icon: <GraduationCap size={18} />,
              label: "Degree",
              value: profile?.education || "—",
            },
            {
              icon: <BookOpen size={18} />,
              label: "College",
              value: profile?.college || "—",
            },
          ].map((item, i) => (
            <div key={i} className="detail-item">
              <span className="detail-icon">{item.icon}</span>
              <div>
                <div className="detail-label">{item.label}</div>
                <div className="detail-value">{item.value || "—"}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Verification Badges */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "16px",
            flexWrap: "wrap",
          }}
        >
          {profile?.photo_verified && (
            <span className="verification-badge verification-badge-verified">
              <ShieldCheck size={14} /> Photo Verified
            </span>
          )}
          {profile?.income_verified && (
            <span className="verification-badge verification-badge-verified">
              <BadgeCheck size={14} /> Income Verified
            </span>
          )}
          {!profile?.photo_verified && (
            <span className="verification-badge verification-badge-pending">
              Photo Not Verified
            </span>
          )}
          {!profile?.income_verified && (
            <span className="verification-badge verification-badge-pending">
              Income Not Verified
            </span>
          )}
        </div>
      </div>

      {/* Cultural & Languages */}
      <div
        className="glass-card-static"
        style={{ padding: "24px", marginBottom: "20px" }}
      >
        <h3
          className="font-heading"
          style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px" }}
        >
          🙏 Cultural Profile
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              icon: <Globe size={18} />,
              label: "Religion",
              value: profile?.religion,
            },
            {
              icon: <Users size={18} />,
              label: "Caste",
              value: profile?.caste,
            },
            {
              icon: <Utensils size={18} />,
              label: "Diet",
              value: profile?.diet,
            },
            {
              icon: <Globe size={18} />,
              label: "Mother Tongue",
              value: profile?.mother_tongue,
            },
          ].map((item, i) => (
            <div key={i} className="detail-item">
              <span className="detail-icon">{item.icon}</span>
              <div>
                <div className="detail-label">{item.label}</div>
                <div className="detail-value">{item.value || "—"}</div>
              </div>
            </div>
          ))}
        </div>
        {profile?.languages?.length > 0 && (
          <div style={{ marginTop: "14px" }}>
            <div className="detail-label" style={{ marginBottom: "8px" }}>
              Languages Known
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {profile.languages.map((lang, i) => (
                <span
                  key={i}
                  className="info-pill"
                  style={{ padding: "4px 12px", fontSize: "0.82rem" }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Hobbies */}
      {profile?.hobbies?.length > 0 && (
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3
            className="font-heading"
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            🎯 Hobbies & Interests
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {profile.hobbies.map((hobby, i) => (
              <span
                key={i}
                className="info-pill"
                style={{
                  fontSize: "0.85rem",
                  padding: "6px 14px",
                  background:
                    i % 3 === 0
                      ? "rgba(225, 29, 72, 0.08)"
                      : i % 3 === 1
                        ? "rgba(167, 139, 250, 0.08)"
                        : "rgba(245, 158, 11, 0.08)",
                  borderColor:
                    i % 3 === 0
                      ? "rgba(225, 29, 72, 0.2)"
                      : i % 3 === 1
                        ? "rgba(167, 139, 250, 0.2)"
                        : "rgba(245, 158, 11, 0.2)",
                }}
              >
                {hobby}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderFamily = () => (
    <div className="animate-fadeInUp">
      <div
        className="glass-card-static"
        style={{ padding: "24px", marginBottom: "20px" }}
      >
        <h3
          className="font-heading"
          style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px" }}
        >
          👨‍👩‍👧 Family Information
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              icon: <Home size={18} />,
              label: "Family Type",
              value: profile?.family_type || "—",
            },
            {
              icon: <Star size={18} />,
              label: "Family Status",
              value: profile?.family_status || "—",
            },
            {
              icon: <Heart size={18} />,
              label: "Family Values",
              value: profile?.family_values || "—",
            },
            {
              icon: <Users size={18} />,
              label: "Siblings",
              value: profile?.siblings || "—",
            },
            {
              icon: <Briefcase size={18} />,
              label: "Father's Occupation",
              value: profile?.father_occupation || "—",
            },
            {
              icon: <Briefcase size={18} />,
              label: "Mother's Occupation",
              value: profile?.mother_occupation || "—",
            },
          ].map((item, i) => (
            <div key={i} className="detail-item">
              <span className="detail-icon">{item.icon}</span>
              <div>
                <div className="detail-label">{item.label}</div>
                <div className="detail-value">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Family Compatibility Indicator */}
      {breakdown?.family !== undefined && (
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3
            className="font-heading"
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            🤝 Family Compatibility
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              marginBottom: "12px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div className="score-bar" style={{ height: "10px" }}>
                <div
                  className="score-bar-fill"
                  style={{
                    width: `${breakdown.family}%`,
                    background: `linear-gradient(90deg, ${getBarColor(breakdown.family)}, ${getBarColor(breakdown.family)}88)`,
                    height: "10px",
                    borderRadius: "5px",
                  }}
                />
              </div>
            </div>
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: getBarColor(breakdown.family),
              }}
            >
              {breakdown.family}%
            </span>
          </div>
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.88rem",
              lineHeight: 1.6,
            }}
          >
            {breakdown.family >= 80
              ? `Excellent family alignment — your families share ${profile?.family_values?.toLowerCase()} values and similar backgrounds.`
              : breakdown.family >= 60
                ? `Good family compatibility — some differences in background but strong alignment on core values.`
                : `Different family backgrounds — but differences can complement each other in a relationship.`}
          </p>
        </div>
      )}
    </div>
  );

  const renderPreferences = () => (
    <div className="animate-fadeInUp">
      <div
        className="glass-card-static"
        style={{ padding: "24px", marginBottom: "20px" }}
      >
        <h3
          className="font-heading"
          style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px" }}
        >
          ⚙️ Lifestyle & Preferences
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: "12px",
          }}
        >
          {[
            {
              icon: <Cigarette size={18} />,
              label: "Smoking",
              value: profile?.smoking,
            },
            {
              icon: <Wine size={18} />,
              label: "Drinking",
              value: profile?.drinking,
            },
            {
              icon: <Home size={18} />,
              label: "Open to Relocate",
              value: profile?.open_to_relocate,
            },
            {
              icon: <MapPin size={18} />,
              label: "Location Flexibility",
              value: profile?.location_flexibility || "—",
            },
            {
              icon: <PawPrint size={18} />,
              label: "Open to Pets",
              value: profile?.open_to_pets,
            },
            {
              icon: <Baby size={18} />,
              label: "Wants Children",
              value: profile?.wants_children,
            },
          ].map((item, i) => (
            <div key={i} className="detail-item">
              <span className="detail-icon">{item.icon}</span>
              <div>
                <div className="detail-label">{item.label}</div>
                <div className="detail-value">{item.value || "—"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison with you */}
      <div className="glass-card-static" style={{ padding: "24px" }}>
        <h3
          className="font-heading"
          style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "16px" }}
        >
          🔄 Preference Comparison
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {[
            { label: "Diet", you: user?.diet, them: profile?.diet },
            { label: "Smoking", you: user?.smoking, them: profile?.smoking },
            { label: "Drinking", you: user?.drinking, them: profile?.drinking },
            {
              label: "Children",
              you: user?.wants_children,
              them: profile?.wants_children,
            },
            {
              label: "Relocate",
              you: user?.open_to_relocate,
              them: profile?.open_to_relocate,
            },
            {
              label: "Pets",
              you: user?.open_to_pets,
              them: profile?.open_to_pets,
            },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 40px 1fr",
                gap: "8px",
                alignItems: "center",
                padding: "8px 12px",
                background:
                  item.you === item.them
                    ? "rgba(34, 197, 94, 0.05)"
                    : "rgba(245, 158, 11, 0.03)",
                borderRadius: "var(--radius-sm)",
                border: `1px solid ${item.you === item.them ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.1)"}`,
              }}
            >
              <span
                style={{
                  fontSize: "0.8rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                }}
              >
                {item.label}
              </span>
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "var(--text-primary)",
                  textAlign: "right",
                }}
              >
                {item.you || "—"}
              </span>
              <span
                style={{
                  textAlign: "center",
                  fontSize: "0.7rem",
                  color: item.you === item.them ? "#22c55e" : "var(--gold)",
                }}
              >
                {item.you === item.them ? "✅" : "🔸"}
              </span>
              <span
                style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}
              >
                {item.them || "—"}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 40px 1fr",
              gap: "8px",
              padding: "4px 12px",
            }}
          >
            <span
              style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}
            ></span>
            <span
              style={{
                fontSize: "0.7rem",
                color: "var(--text-muted)",
                textAlign: "right",
              }}
            >
              You
            </span>
            <span></span>
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
              {profile?.name?.split(" ")[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotes = () => (
    <div className="animate-fadeInUp">
      <div
        className="glass-card-static"
        style={{ padding: "24px", marginBottom: "20px" }}
      >
        <h3
          className="font-heading"
          style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "14px" }}
        >
          📝 Add a Note
        </h3>
        <textarea
          className="input-glass"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={`Write notes about ${profile?.name?.split(" ")[0]}... e.g., "Spoke on phone, very friendly. Interested in a second conversation."`}
          rows={4}
          style={{ width: "100%", resize: "vertical", marginBottom: "12px" }}
        />
        <button
          className="btn-primary"
          onClick={handleSaveNote}
          disabled={!notes.trim()}
        >
          <FileText size={16} />
          Save Note
        </button>
      </div>

      {savedNotes.length > 0 ? (
        <div className="glass-card-static" style={{ padding: "24px" }}>
          <h3
            className="font-heading"
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              marginBottom: "16px",
            }}
          >
            📋 Previous Notes
          </h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {savedNotes.map((note, idx) => (
              <div
                key={idx}
                className="glass-card-static"
                style={{
                  padding: "16px",
                  borderLeft: "3px solid var(--rose-primary)",
                }}
              >
                <div
                  style={{
                    fontSize: ".75rem",
                    color: "var(--text-muted)",
                  }}
                >
                  <span
                    className="badge"
                    style={{
                      marginBottom: "8px",
                      display: "inline-flex",
                    }}
                  >
                    {note.type || "Review"}
                  </span>
                  {note.timestamp}
                </div>

                <div
                  style={{
                    marginTop: "8px",
                  }}
                >
                  {note.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div
          className="glass-card-static"
          style={{ padding: "40px", textAlign: "center" }}
        >
          <MessageSquare
            size={32}
            color="var(--text-muted)"
            style={{ marginBottom: "12px" }}
          />
          <p style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            No notes yet. Add your first note about{" "}
            {profile?.name?.split(" ")[0]}.
          </p>
        </div>
      )}
    </div>
  );

  const renderActivity = () => (
    <div className="animate-fadeInUp">
      <div
        className="glass-card-static"
        style={{
          padding: "24px",
        }}
      >
        <h3
          className="font-heading"
          style={{
            marginBottom: "20px",
          }}
        >
          Activity Timeline
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {activityLog.map((item, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: "14px",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--rose-primary)",
                  marginTop: "7px",
                }}
              />

              <div>
                <div
                  style={{
                    fontWeight: 600,
                  }}
                >
                  {item.text}
                </div>

                <div
                  style={{
                    fontSize: ".8rem",
                    color: "var(--text-muted)",
                  }}
                >
                  {item.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const risks = [];

  if ((breakdown.location || 0) < 60)
    risks.push("Location preferences may require discussion");

  if ((breakdown.family || 0) < 60)
    risks.push("Family expectations should be aligned early");

  if ((breakdown.professional || 0) < 60)
    risks.push("Career priorities may affect long-term planning");

  if (risks.length === 0)
    risks.push("No major compatibility concerns detected");

  const renderCompatibility = () => (
    <div className="animate-fadeInUp">
      {/* Match Reasons — WHY this match works */}
      {matchReasons.length > 0 && (
        <div
          className="glass-card-static insight-card"
          style={{ padding: "24px", marginBottom: "20px" }}
        >
          <h3
            className="font-heading"
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              marginBottom: "14px",
            }}
          >
            💡 Why This Match Works
          </h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {matchReasons.map((reason, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px 14px",
                  background: "rgba(34, 197, 94, 0.04)",
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid rgba(34, 197, 94, 0.12)",
                }}
              >
                <span
                  style={{
                    color: "#22c55e",
                    fontSize: "0.85rem",
                    marginTop: "1px",
                  }}
                >
                  ✓
                </span>
                <span
                  style={{
                    color: "var(--text-secondary)",
                    fontSize: "0.88rem",
                    lineHeight: 1.5,
                  }}
                >
                  {reason}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insight */}
      <div
        className="glass-card-static insight-card"
        style={{ padding: "24px", marginBottom: "20px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "14px",
          }}
        >
          <Sparkles size={20} color="var(--lavender)" />
          <h3
            className="font-heading"
            style={{ fontSize: "1.05rem", fontWeight: 700 }}
          >
            AI Compatibility Insight
          </h3>
          <span className="badge badge-ai">✨ AI-Powered</span>
        </div>
        {insightLoading ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              color: "var(--lavender)",
              padding: "12px 0",
            }}
          >
            <Loader2 size={18} className="animate-spin" />
            <span style={{ fontSize: "0.9rem" }}>
              Analyzing compatibility...
            </span>
          </div>
        ) : (
          <p
            style={{
              color: "var(--text-secondary)",
              fontSize: "0.92rem",
              lineHeight: 1.8,
            }}
          >
            {insight}
          </p>
        )}
      </div>
      <div
        className="glass-card-static"
        style={{
          padding: "24px",
          marginBottom: "20px",
        }}
      >
        <h3
          className="font-heading"
          style={{
            marginBottom: "16px",
          }}
        >
          ⚠ Compatibility Risks
        </h3>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {risks.map((risk, idx) => (
            <div key={idx} className="detail-item">
              {risk}
            </div>
          ))}
        </div>
      </div>

      {/* Score Breakdown Bars */}
      <div className="glass-card-static" style={{ padding: "24px" }}>
        <h3
          className="font-heading"
          style={{ fontSize: "1.05rem", fontWeight: 700, marginBottom: "20px" }}
        >
          📊 Compatibility Breakdown
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {dimensions.map((dim) => {
            const val = breakdown[dim.key] || 0;
            if (val === 0 && !breakdown[dim.key] && dim.key !== "height")
              return null;
            return (
              <div key={dim.key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {dim.icon} {dim.label}
                  </span>
                  <span
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: getBarColor(val),
                      fontFamily: "var(--font-heading)",
                    }}
                  >
                    {val}%
                  </span>
                </div>
                <div className="score-bar">
                  <div
                    className="score-bar-fill"
                    style={{
                      width: `${val}%`,
                      background: `linear-gradient(90deg, ${getBarColor(val)}, ${getBarColor(val)}88)`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "family":
        return renderFamily();
      case "preferences":
        return renderPreferences();
      case "notes":
        return renderNotes();
      case "compatibility":
        return renderCompatibility();
      case "activity":
        return renderActivity();
      default:
        return renderOverview();
    }
  };

  return (
    <div
      className="page-enter"
      style={{ minHeight: "100vh", background: "var(--bg-primary)" }}
    >
      <Navbar user={user} onLogout={onLogout} />

      <main
        style={{
          maxWidth: "960px",
          margin: "0 auto",
          padding: "88px 24px 60px",
        }}
      >
        {/* Back Button */}
        <button
          className="btn-glass"
          onClick={() => navigate("/dashboard")}
          style={{ marginBottom: "20px" }}
        >
          <ArrowLeft size={18} /> Back to Matches
        </button>

        {/* Hero Section */}
        <div
          className="glass-card-static animate-fadeInUp"
          style={{
            padding: "32px",
            display: "flex",
            gap: "28px",
            alignItems: "flex-start",
            flexWrap: "wrap",
            marginBottom: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Status badges in top-right */}
          <div
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              display: "flex",
              gap: "8px",
            }}
          >
            {profile?.status_tag && (
              <span
                className={`badge badge-status badge-status-${profile.status_tag?.toLowerCase()}`}
              >
                {profile.status_tag}
              </span>
            )}
            {profile?.stage && (
              <span
                className="badge"
                style={{
                  background: "rgba(167, 139, 250, 0.1)",
                  color: "var(--lavender)",
                  border: "1px solid rgba(167, 139, 250, 0.2)",
                }}
              >
                Stage: {profile.stage}
              </span>
            )}
            <span
              className="badge"
              style={{
                background: "rgba(34,197,94,.08)",
                color: "#22c55e",
                border: "1px solid rgba(34,197,94,.15)",
              }}
            >
              Next Action: Send Intro
            </span>
          </div>

          {/* Photo */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div style={{ position: "relative" }}>
              <div className="photo-ring photo-ring-lg">
                <img
                  src={
                    profile?.photo_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.name || "user")}`
                  }
                  alt={profile?.name}
                  style={{ width: "120px", height: "120px" }}
                />
              </div>
              {profile?.photo_verified && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "4px",
                    right: "4px",
                    background: "#22c55e",
                    borderRadius: "50%",
                    padding: "4px",
                    display: "flex",
                    border: "2px solid var(--bg-primary)",
                  }}
                >
                  <ShieldCheck size={14} color="white" />
                </div>
              )}
            </div>
            <MatchScore score={overall} size={72} />
            <span className={`badge ${getBadgeClass()}`}>{category}</span>
          </div>

          {/* Key Info */}
          <div style={{ flex: 1, minWidth: "240px" }}>
            <h1
              className="font-heading"
              style={{
                fontSize: "1.8rem",
                fontWeight: 800,
                marginBottom: "4px",
                letterSpacing: "-0.02em",
              }}
            >
              {profile?.name || "Unknown"}
            </h1>
            <p
              style={{
                color: "var(--text-secondary)",
                fontSize: "1rem",
                marginBottom: "12px",
              }}
            >
              {profile?.age} years • {profile?.city} •{" "}
              {profile?.marital_status || "Never Married"}
            </p>
            <p
              style={{
                color: "var(--lavender)",
                fontSize: "0.92rem",
                marginBottom: "8px",
                fontWeight: 500,
              }}
            >
              {profile?.designation || profile?.profession}{" "}
              {profile?.company && profile.company !== "Self-Employed"
                ? `at ${profile.company}`
                : ""}
            </p>

            {/* Quick Pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                marginBottom: "16px",
              }}
            >
              <span className="info-pill">
                <Globe size={12} />
                {profile?.religion}
              </span>

              <span className="info-pill">
                <Utensils size={12} />
                {profile?.diet}
              </span>

              <span className="info-pill">
                <Languages size={12} />
                {profile?.mother_tongue}
              </span>

              <span className="info-pill">
                <GraduationCap size={12} />
                {profile?.education}
              </span>
              {profile?.photo_verified && (
                <span
                  className="verification-badge verification-badge-verified"
                  style={{ padding: "4px 10px", fontSize: "0.73rem" }}
                >
                  <ShieldCheck size={12} /> Verified
                </span>
              )}
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                className="btn-primary"
                onClick={() => setEmailModal(true)}
              >
                <Mail size={16} /> Send Introduction
              </button>
              <button className="btn-secondary">
                <Heart size={16} /> Save
              </button>
              <button className="btn-glass" onClick={() => setShowBrief(true)}>
                <Sparkles size={16} />
                Match Brief
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div
          className="tab-nav"
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: "24px",
            padding: "12px 0",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {renderTabContent()}

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", padding: "24px", marginTop: "8px" }}>
          <button
            className="btn-primary"
            onClick={() => setEmailModal(true)}
            style={{ padding: "14px 36px", fontSize: "1rem" }}
          >
            <Mail size={20} /> Send Introduction to{" "}
            {profile?.name?.split(" ")[0]} 💌
          </button>
        </div>
      </main>

      {showBrief && (
        <div className="modal-overlay" onClick={() => setShowBrief(false)}>
          <div
            className="modal-content glass-card-static"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "700px",
              maxWidth: "90vw",
              padding: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "20px",
              }}
            >
              <h2 className="font-heading">AI Match Brief</h2>

              <button className="btn-icon" onClick={() => setShowBrief(false)}>
                ×
              </button>
            </div>

            <div className="glass-card-static">
              <h3>Overall Match</h3>

              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--gold)",
                }}
              >
                {overall}%
              </p>
            </div>

            <div style={{ marginTop: "20px" }}>
              <h3>Strengths</h3>

              <ul>
                {matchReasons.slice(0, 3).map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>

            <div style={{ marginTop: "20px" }}>
              <h3>Potential Risks</h3>

              <ul>
                <li>Relocation preferences may differ</li>
                <li>Career priorities require discussion</li>
              </ul>
            </div>

            <div style={{ marginTop: "20px" }}>
              <h3>Recommendation</h3>

              <p>Proceed with introduction.</p>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <EmailModal
          match={{ profile, score }}
          user={user}
          onClose={() => setEmailModal(false)}
        />
      )}
    </div>
  );
}
