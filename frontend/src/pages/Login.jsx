import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, currentUser } = useAuth()

  // Redirect if already logged in
  React.useEffect(() => {
    if (currentUser) {
      window.location.href = currentUser.role === 'admin' ? '/admin' : '/college'
    }
  }, [currentUser])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(credentials.username, credentials.password)
      // Redirect will happen via useEffect above
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="container mt-4">
      <div className="login-container">
        <div className="text-center mb-4">
          <i className="fas fa-university fa-3x text-primary mb-3"></i>
          <h2 className="fw-bold">Multi-College Data System</h2>
          <p className="text-muted">Secure Login Portal</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="username" className="form-label fw-semibold">
              <i className="fas fa-user me-2"></i>Username
            </label>
            <input
              type="text"
              className="form-control form-control-lg"
              id="username"
              name="username"
              placeholder="Enter your username"
              value={credentials.username}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label fw-semibold">
              <i className="fas fa-lock me-2"></i>Password
            </label>
            <input
              type="password"
              className="form-control form-control-lg"
              id="password"
              name="password"
              placeholder="Enter your password"
              value={credentials.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Logging in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Login
                </>
              )}
            </button>
          </div>

          <div className="text-center">
            <small className="text-muted">
              <i className="fas fa-info-circle me-1"></i>
              Demo Credentials: <strong>admin / admin123</strong>
            </small>
          </div>
        </form>

        {error && (
          <div className="alert alert-danger mt-3">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
