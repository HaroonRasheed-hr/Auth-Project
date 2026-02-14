import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import SignupForm from './components/SignupForm'
import LoginForm from './components/LoginForm'
import Dashboard from './components/Dashboard'
import ForgotPassword from './components/ForgotPassword'
import ResetPassword from './components/ResetPassword'

function App() {
  const [isLogin, setIsLogin] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [refreshAuth, setRefreshAuth] = useState(0)

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    setIsAuthenticated(!!token)
  }, [refreshAuth])

  const toggleForm = () => {
    setIsLogin(!isLogin)
  }

  const handleAuthSuccess = () => {
    setIsAuthenticated(true)
    setRefreshAuth(prev => prev + 1)
  }

  const handleLogout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_username')
    setIsAuthenticated(false)
    setIsLogin(false)
  }, [])

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="container">
                {isLogin ? (
                  <LoginForm onToggle={toggleForm} onAuthSuccess={handleAuthSuccess} />
                ) : (
                  <SignupForm onToggle={toggleForm} onAuthSuccess={handleAuthSuccess} />
                )}
              </div>
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1>Settings Page</h1>
                <p>Settings page coming soon...</p>
              </div>
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/forgot-password"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="container">
                <ForgotPassword onToggle={toggleForm} />
              </div>
            )
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <div className="container">
                <ResetPassword />
              </div>
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
