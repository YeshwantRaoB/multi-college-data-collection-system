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

  // Update footer year on component mount
  React.useEffect(() => {
    updateFooterYear()
  }, [])

  const updateFooterYear = () => {
    const currentYear = new Date().getFullYear()
    const yearElement = document.getElementById('currentYear')
    if (yearElement) {
      yearElement.textContent = currentYear
    }
  }

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
    <>
      {/* Enhanced Login Page Container */}
      <div className="login-page-wrapper">
        {/* Hero Section with Gradient Background */}
        <div className="login-hero-section">
          <div className="container-fluid h-100 d-flex align-items-center justify-content-center">
            <div className="row w-100 justify-content-center align-items-center">
              <div className="col-lg-6 col-md-8 col-sm-10 col-12">
                <div className="login-card animate-scale-in">
                  <div className="login-card-header">
                    <div className="text-center">
                      <div className="login-logo-container animate-fade-in-up">
                        <i className="fas fa-university fa-4x text-primary animate-pulse"></i>
                      </div>
                      <h1 className="login-title animate-fade-in delay-100">
                        Multi-College Data System
                      </h1>
                      <p className="login-subtitle animate-fade-in delay-200">
                        Secure Login Portal
                      </p>
                      <div className="login-divider animate-fade-in delay-300"></div>
                    </div>
                  </div>

                  <div className="login-card-body">
                    <form onSubmit={handleSubmit} className="login-form animate-slide-in-right delay-400">
                      <div className="form-group-modern">
                        <label htmlFor="username" className="form-label-modern">
                          <i className="fas fa-user-circle me-2"></i>Username
                        </label>
                        <div className="input-group-modern">
                          <input
                            type="text"
                            className="form-control-modern"
                            id="username"
                            name="username"
                            placeholder="Enter your username"
                            value={credentials.username}
                            onChange={handleChange}
                            required
                            autoComplete="username"
                          />
                          <div className="input-icon">
                            <i className="fas fa-user"></i>
                          </div>
                        </div>
                      </div>

                      <div className="form-group-modern">
                        <label htmlFor="password" className="form-label-modern">
                          <i className="fas fa-shield-alt me-2"></i>Password
                        </label>
                        <div className="input-group-modern">
                          <input
                            type="password"
                            className="form-control-modern"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                            value={credentials.password}
                            onChange={handleChange}
                            required
                            autoComplete="current-password"
                          />
                          <div className="input-icon">
                            <i className="fas fa-lock"></i>
                          </div>
                        </div>
                      </div>

                      <div className="login-actions animate-fade-in delay-500">
                        <button
                          type="submit"
                          className="btn-login-primary"
                          disabled={loading}
                        >
                          {loading ? (
                            <>
                              <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                              Authenticating...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-sign-in-alt me-2"></i>
                              Access System
                            </>
                          )}
                        </button>
                      </div>
                    </form>

                    {error && (
                      <div className="alert-login-error animate-fade-in">
                        <i className="fas fa-exclamation-triangle me-2"></i>
                        {error}
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Badge */}
                <div className="security-badge animate-fade-in delay-600">
                  <i className="fas fa-shield-alt me-2"></i>
                  <span>Secure & Encrypted Connection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Same as Dashboard */}
      <footer className="footer-enhanced mt-5">
        <div className="footer-content-enhanced">
          <div className="container">
            <div className="row g-4 py-4">
              {/* Left Box - System Info */}
              <div className="col-lg-4 col-md-12">
                <div className="footer-box footer-box-left" data-aos="fade-up" data-aos-delay="100">
                  <div className="footer-box-icon">
                    <i className="fas fa-university"></i>
                  </div>
                  <div className="footer-box-content">
                    <h5 className="footer-box-title">Multi-College Data</h5>
                    <h5 className="footer-box-title">Collection System</h5>
                    <p className="footer-box-subtitle">Data Management Excellence</p>
                  </div>
                  <div className="footer-box-glow"></div>
                </div>
              </div>

              {/* Center Box - Developer Info */}
              <div className="col-lg-4 col-md-12">
                <div className="footer-box footer-box-center" data-aos="fade-up" data-aos-delay="200">
                  <div className="footer-box-icon">
                    <i className="fas fa-code"></i>
                  </div>
                  <div className="footer-box-content">
                    <h6 className="footer-box-label">Designed & Developed by:</h6>
                    <a href="https://yrb-portfolio.netlify.app/" target="_blank" rel="noopener noreferrer" className="footer-box-name">
                      Mr. Yeshwant Rao
                    </a>
                    <div className="footer-box-divider"></div>
                    <a href="https://gpt.karnataka.gov.in/kptmangalore/public/en" target="_blank" rel="noopener noreferrer" className="footer-box-college">
                      <i className="fas fa-building me-2"></i>
                      Karnataka Govt. Polytechnic, Mangalore
                    </a>
                  </div>
                  <div className="footer-box-glow"></div>
                </div>
              </div>

              {/* Right Box - Guidance Info */}
              <div className="col-lg-4 col-md-12">
                <div className="footer-box footer-box-right" data-aos="fade-up" data-aos-delay="300">
                  <div className="footer-box-icon">
                    <i className="fas fa-user-tie"></i>
                  </div>
                  <div className="footer-box-content">
                    <h6 className="footer-box-label">Guided by:</h6>
                    <p className="footer-box-name mb-1">Mr. Sathish S</p>
                    <p className="footer-box-designation">Lecturer</p>
                    <p className="footer-box-department">Department of Computer Science & Engineering</p>
                  </div>
                  <div className="footer-box-glow"></div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="footer-bottom-enhanced text-center py-3">
              <div className="footer-wave"></div>
              <p className="mb-0 footer-copyright">
                <i className="fas fa-copyright me-2"></i>
                <span id="currentYear"></span> All Rights Reserved
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}

export default Login
