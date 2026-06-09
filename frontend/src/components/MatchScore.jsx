import { useState, useEffect } from 'react'

/**
 * MatchScore — Animated circular SVG progress ring
 * Displays compatibility score with color-coded ring
 */
export default function MatchScore({ score = 0, size = 60 }) {
  const [animatedOffset, setAnimatedOffset] = useState(null)
  const strokeWidth = size > 80 ? 6 : 4
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const targetOffset = circumference - (score / 100) * circumference

  // Determine color based on score
  const getColor = () => {
    if (score >= 90) return '#f59e0b' // Gold
    if (score >= 75) return '#e11d48' // Rose
    if (score >= 60) return '#f97316' // Coral/Orange
    return '#6b7280'                  // Gray
  }

  useEffect(() => {
    // Start with full offset (empty ring), then animate to target
    setAnimatedOffset(circumference)
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset)
    }, 100)
    return () => clearTimeout(timer)
  }, [score, circumference, targetOffset])

  const fontSize = size > 80 ? '1.25rem' : size > 50 ? '0.85rem' : '0.7rem'

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset !== null ? animatedOffset : circumference}
          style={{
            transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
            filter: `drop-shadow(0 0 6px ${getColor()}40)`
          }}
        />
      </svg>
      {/* Center score text */}
      <span
        style={{
          position: 'absolute',
          fontSize,
          fontWeight: 700,
          fontFamily: 'var(--font-heading)',
          color: getColor()
        }}
      >
        {score}
      </span>
    </div>
  )
}
