import { useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ToastProvider } from './components/Toast'
import LoginPage from './components/LoginPage'
import Dashboard from './pages/Dashboard'
import ProfileDetail from './pages/ProfileDetail'
import MyProfile from './pages/MyProfile'

/**
 * The Date Crew — Root Application Component
 * Manages authentication state and routing
 */
function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  const handleLogin = (userData, tokenData) => {
    setUser(userData)
    setToken(tokenData)
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
  }

  return (
    <ToastProvider>
      <div className="min-h-screen">
        <Routes>
          <Route
            path="/login"
            element={
              user ? <Navigate to="/dashboard" replace /> : <LoginPage onLogin={handleLogin} />
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} token={token} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/profile/:id"
            element={
              user ? (
                <ProfileDetail user={user} token={token} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/my-profile"
            element={
              user ? (
                <MyProfile user={user} token={token} onLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </ToastProvider>
  )
}

export default App
