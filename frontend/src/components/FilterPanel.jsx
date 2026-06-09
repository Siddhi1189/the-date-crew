import { useState } from 'react'
import { SlidersHorizontal, Filter, X } from 'lucide-react'

/**
 * FilterPanel — Collapsible sidebar with match filters
 * Glassmorphic design with custom-styled dropdowns
 */
export default function FilterPanel({ filters, setFilters, onApply, onReset }) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const filterFields = [
    {
      key: 'religion',
      label: 'Religion',
      options: ['', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist'],
      labels: ['All', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Jain', 'Buddhist']
    },
    {
      key: 'diet',
      label: 'Diet',
      options: ['', 'Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'],
      labels: ['All', 'Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan']
    },
    {
      key: 'city',
      label: 'City',
      options: ['', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Lucknow', 'Chandigarh', 'Kochi', 'Indore', 'Nagpur', 'Vadodara'],
      labels: ['All', 'Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Pune', 'Chennai', 'Kolkata', 'Jaipur', 'Ahmedabad', 'Lucknow', 'Chandigarh', 'Kochi', 'Indore', 'Nagpur', 'Vadodara']
    },
    {
      key: 'statusTag',
      label: 'Status',
      options: ['', 'New', 'Active', 'Premium', 'Verified'],
      labels: ['All', '🆕 New', '🟢 Active', '⭐ Premium', '✅ Verified']
    },
    {
      key: 'stage',
      label: 'Stage',
      options: ['', 'New Lead', 'In Conversation', 'Meeting Scheduled', 'Decision Pending', 'Matched'],
      labels: ['All', 'New Lead', 'In Conversation', 'Meeting Scheduled', 'Decision Pending', 'Matched']
    },
    {
      key: 'openToRelocate',
      label: 'Open to Relocate',
      options: ['', 'Yes', 'No', 'Maybe'],
      labels: ['All', 'Yes', 'No', 'Maybe']
    },
    {
      key: 'openToPets',
      label: 'Open to Pets',
      options: ['', 'Yes', 'No', 'Maybe'],
      labels: ['All', 'Yes', 'No', 'Maybe']
    },
    {
      key: 'wantsChildren',
      label: 'Wants Children',
      options: ['', 'Yes', 'No', 'Maybe'],
      labels: ['All', 'Yes', 'No', 'Maybe']
    }
  ]

  const panelContent = (
    <div
      className="glass-card-static"
      style={{
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SlidersHorizontal size={18} color="var(--rose-secondary)" />
          <h3
            className="font-heading"
            style={{ fontSize: '1.1rem', fontWeight: 700 }}
          >
            Filters
          </h3>
        </div>
        {/* Mobile close button */}
        <button
          className="btn-icon"
          onClick={() => setMobileOpen(false)}
          style={{ display: 'none' }}
          id="filter-close-mobile"
        >
          <X size={18} />
        </button>
      </div>

      {/* Age Range */}
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
          Age Range
        </label>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="number"
            className="input-glass"
            style={{ width: '50%', padding: '10px 12px' }}
            value={filters.ageMin}
            onChange={e => handleChange('ageMin', e.target.value)}
            min="18"
            max="80"
            placeholder="Min"
          />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>to</span>
          <input
            type="number"
            className="input-glass"
            style={{ width: '50%', padding: '10px 12px' }}
            value={filters.ageMax}
            onChange={e => handleChange('ageMax', e.target.value)}
            min="18"
            max="80"
            placeholder="Max"
          />
        </div>
      </div>

      {/* Dropdown Filters */}
      {filterFields.map(field => (
        <div key={field.key}>
          <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 500 }}>
            {field.label}
          </label>
          <select
            className="input-glass"
            value={filters[field.key]}
            onChange={e => handleChange(field.key, e.target.value)}
          >
            {field.options.map((opt, i) => (
              <option key={opt} value={opt}>{field.labels[i]}</option>
            ))}
          </select>
        </div>
      ))}

      {/* Action Buttons */}
      <button
        className="btn-primary"
        style={{ width: '100%', marginTop: '8px' }}
        onClick={onApply}
      >
        Apply Filters
      </button>
      <button
        onClick={onReset}
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          fontSize: '0.85rem',
          textAlign: 'center',
          textDecoration: 'underline',
          fontFamily: 'var(--font-body)',
          transition: 'color 0.2s ease'
        }}
        onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
        onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
      >
        Reset Filters
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="btn-glass"
        onClick={() => setMobileOpen(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 40,
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          padding: 0,
          display: 'none'
        }}
        id="filter-toggle-mobile"
      >
        <Filter size={20} />
      </button>

      {/* Desktop Sidebar */}
      <aside
        style={{
          width: '280px',
          flexShrink: 0,
          position: 'sticky',
          top: '80px',
          height: 'fit-content',
          maxHeight: 'calc(100vh - 96px)',
          overflowY: 'auto'
        }}
        className="filter-desktop"
      >
        {panelContent}
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="modal-overlay"
          onClick={() => setMobileOpen(false)}
          style={{ zIndex: 45 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="animate-slideIn"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: 0,
              width: '300px',
              overflowY: 'auto',
              padding: '20px',
              background: 'var(--bg-primary)'
            }}
          >
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn-icon" onClick={() => setMobileOpen(false)}>
                <X size={18} />
              </button>
            </div>
            {panelContent}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .filter-desktop { display: none !important; }
          #filter-toggle-mobile { display: flex !important; }
        }
      `}</style>
    </>
  )
}
