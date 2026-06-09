import { API_URL } from '../config'
import { useState, useEffect } from 'react'
import axios from 'axios'
import {
  User, MapPin, Briefcase, GraduationCap, Building2,
  Heart, Utensils, Home, PawPrint, Baby, Cigarette, Wine,
  Globe, Phone, Calendar, Ruler, IndianRupee, Languages,
  Loader2, Edit3, Users, Sparkles, BookOpen
} from 'lucide-react'
import Navbar from '../components/Navbar'

/**
 * MyProfile — Full profile view of the currently logged-in user
 * Shows all personal, professional, cultural, and lifestyle details
 */
export default function MyProfile({ user, token, onLogout }) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/profiles/me`)
        setProfile(res.data)
      } catch {
        // Fallback to user data from auth
        setProfile(user)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [user])

  if (loading) {
    return (
      <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
        <Navbar user={user} onLogout={onLogout} />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          height: '80vh', gap: '12px', color: 'var(--lavender)'
        }}>
          <Loader2 size={28} className="animate-spin" />
          <span style={{ fontSize: '1.1rem', fontFamily: 'var(--font-heading)' }}>Loading your profile...</span>
        </div>
      </div>
    )
  }

  if (!profile) return null

  // Detail sections
  const personalDetails = [
    { icon: <User size={18} />, label: 'Full Name', value: profile.name },
    { icon: <Calendar size={18} />, label: 'Date of Birth', value: profile.date_of_birth || '—' },
    { icon: <User size={18} />, label: 'Age', value: profile.age ? `${profile.age} years` : '—' },
    { icon: <User size={18} />, label: 'Gender', value: profile.gender ? profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1) : '—' },
    { icon: <Ruler size={18} />, label: 'Height', value: profile.height_cm ? `${profile.height_cm} cm` : '—' },
    { icon: <MapPin size={18} />, label: 'City', value: profile.city },
    { icon: <Phone size={18} />, label: 'Phone', value: profile.phone || '—' },
    { icon: <Heart size={18} />, label: 'Marital Status', value: profile.marital_status || '—' },
  ]

  const professionalDetails = [
    { icon: <Briefcase size={18} />, label: 'Profession', value: profile.profession },
    { icon: <Building2 size={18} />, label: 'Company', value: profile.company || '—' },
    { icon: <User size={18} />, label: 'Designation', value: profile.designation || '—' },
    { icon: <IndianRupee size={18} />, label: 'Income', value: profile.income_lpa ? `₹${profile.income_lpa} LPA` : '—' },
    { icon: <GraduationCap size={18} />, label: 'Degree', value: profile.education || '—' },
    { icon: <BookOpen size={18} />, label: 'College', value: profile.college || '—' },
  ]

  const culturalDetails = [
    { icon: <Globe size={18} />, label: 'Religion', value: profile.religion },
    { icon: <Users size={18} />, label: 'Caste', value: profile.caste || '—' },
    { icon: <Utensils size={18} />, label: 'Diet', value: profile.diet },
    { icon: <Globe size={18} />, label: 'Mother Tongue', value: profile.mother_tongue || '—' },
    { icon: <Languages size={18} />, label: 'Languages', value: profile.languages?.join(', ') || '—' },
  ]

  const lifestyleDetails = [
    { icon: <Cigarette size={18} />, label: 'Smoking', value: profile.smoking },
    { icon: <Wine size={18} />, label: 'Drinking', value: profile.drinking },
    { icon: <Home size={18} />, label: 'Open to Relocate', value: profile.open_to_relocate },
    { icon: <PawPrint size={18} />, label: 'Open to Pets', value: profile.open_to_pets },
    { icon: <Baby size={18} />, label: 'Wants Children', value: profile.wants_children },
  ]

  const renderSection = (title, emoji, items) => (
    <div
      className="glass-card-static animate-fadeInUp"
      style={{ padding: '24px', marginBottom: '20px' }}
    >
      <h3
        className="font-heading"
        style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}
      >
        {emoji} {title}
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '12px'
      }}>
        {items.map((item, i) => (
          <div key={i} className="detail-item">
            <span className="detail-icon">{item.icon}</span>
            <div>
              <div className="detail-label">{item.label}</div>
              <div className="detail-value">{item.value || '—'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="page-enter" style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Navbar user={user} onLogout={onLogout} />

      <main style={{
        paddingTop: '88px',
        paddingBottom: '60px',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '88px 24px 60px'
      }}>
        {/* Hero Card */}
        <div
          className="glass-card-static animate-fadeInUp"
          style={{
            padding: '40px',
            marginBottom: '24px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Gradient accent */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, var(--rose-primary), var(--lavender), var(--coral))'
          }} />

          {/* Photo */}
          <div style={{ display: 'inline-block', marginBottom: '20px' }}>
            <div className="photo-ring photo-ring-lg">
              <img
                src={profile.photo_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.name || 'user')}`}
                alt={profile.name}
                style={{ width: '120px', height: '120px' }}
              />
            </div>
          </div>

          {/* Name & Tagline */}
          <h1
            className="font-heading"
            style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '6px', letterSpacing: '-0.02em' }}
          >
            {profile.name}
          </h1>
          <p style={{ color: 'var(--lavender)', fontSize: '1rem', marginBottom: '4px', fontWeight: 500 }}>
            {profile.profession} {profile.company && profile.company !== 'Self-Employed' ? `at ${profile.company}` : ''}
          </p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
            {profile.age} years • {profile.city} • {profile.marital_status || 'Never Married'}
          </p>

          {/* Quick Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
            <span className="info-pill" style={{ padding: '6px 14px' }}>
              🙏 {profile.religion}
            </span>
            <span className="info-pill" style={{ padding: '6px 14px' }}>
              {profile.diet?.includes('Veg') ? '🥗' : '🍖'} {profile.diet}
            </span>
            <span className="info-pill" style={{ padding: '6px 14px' }}>
              🗣️ {profile.mother_tongue || 'Hindi'}
            </span>
            <span className="info-pill" style={{ padding: '6px 14px' }}>
              📏 {profile.height_cm} cm
            </span>
          </div>

          {/* About */}
          {profile.about && (
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.92rem',
              lineHeight: 1.8,
              maxWidth: '600px',
              margin: '0 auto',
              fontStyle: 'italic'
            }}>
              "{profile.about}"
            </p>
          )}
        </div>

        {/* Sections */}
        {renderSection('Personal Information', '👤', personalDetails)}
        {renderSection('Professional Details', '💼', professionalDetails)}
        {renderSection('Cultural & Values', '🙏', culturalDetails)}
        {renderSection('Lifestyle Preferences', '🏃', lifestyleDetails)}

        {/* Hobbies */}
        {profile.hobbies && profile.hobbies.length > 0 && (
          <div
            className="glass-card-static animate-fadeInUp"
            style={{ padding: '24px', marginBottom: '20px' }}
          >
            <h3
              className="font-heading"
              style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}
            >
              🎯 Hobbies & Interests
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {profile.hobbies.map((hobby, i) => (
                <span
                  key={i}
                  className="info-pill"
                  style={{
                    fontSize: '0.85rem',
                    padding: '8px 16px',
                    background: i % 3 === 0 ? 'rgba(225, 29, 72, 0.08)' :
                               i % 3 === 1 ? 'rgba(167, 139, 250, 0.08)' :
                               'rgba(245, 158, 11, 0.08)',
                    borderColor: i % 3 === 0 ? 'rgba(225, 29, 72, 0.2)' :
                                 i % 3 === 1 ? 'rgba(167, 139, 250, 0.2)' :
                                 'rgba(245, 158, 11, 0.2)',
                  }}
                >
                  {hobby}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Languages */}
        {profile.languages && profile.languages.length > 0 && (
          <div
            className="glass-card-static animate-fadeInUp"
            style={{ padding: '24px', marginBottom: '20px' }}
          >
            <h3
              className="font-heading"
              style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '16px' }}
            >
              🗣️ Languages Known
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {profile.languages.map((lang, i) => (
                <span
                  key={i}
                  className="info-pill"
                  style={{ fontSize: '0.85rem', padding: '8px 16px' }}
                >
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
