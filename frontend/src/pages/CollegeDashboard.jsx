import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import ChangePasswordModal from '../components/ChangePasswordModal'

const CollegeDashboard = () => {
  const { currentUser, logout } = useAuth()
  const [collegeData, setCollegeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)

  useEffect(() => {
    loadCollegeData()
    updateFooterYear()
  }, [])

  const updateFooterYear = () => {
    const currentYear = new Date().getFullYear()
    const yearElement = document.getElementById('currentYear')
    if (yearElement) {
      yearElement.textContent = currentYear
    }
  }

  const loadCollegeData = async () => {
    try {
      setLoading(true)
      const response = await window.api.get('/colleges/user/current')
      setCollegeData(response.data)
    } catch (error) {
      console.error('Error loading college data:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateField = (fieldName, newValue) => {
    // Auto-uppercase for text fields
    let processedValue = newValue
    if (fieldName === 'deputationToCollegeCode') {
      processedValue = newValue.toUpperCase()
    }
    
    // Update local state immediately for responsive UI
    const updatedData = {
      ...collegeData,
      [fieldName]: processedValue
    }
    
    // Auto-calculate vacant when working, deputation, or vacant itself changes
    if (['working', 'deputation', 'vacant'].includes(fieldName)) {
      const sanctioned = parseInt(updatedData.sanctioned) || 0
      const working = parseInt(updatedData.working) || 0
      const deputation = parseInt(updatedData.deputation) || 0
      const vacant = parseInt(updatedData.vacant) || 0
      
      // If vacant is being directly edited, adjust working to match
      if (fieldName === 'vacant') {
        updatedData.working = Math.max(0, sanctioned - deputation - vacant)
      } else {
        // Auto-calculate vacant
        updatedData.vacant = Math.max(0, sanctioned - working - deputation)
      }
    }
    
    setCollegeData(updatedData)
  }

  const handleSaveChanges = async () => {
    try {
      // Validate numeric fields
      const working = parseInt(collegeData.working)
      const deputation = parseInt(collegeData.deputation)
      
      if (isNaN(working) || working < 0) {
        alert('Working must be a valid number (0 or greater)')
        return
      }
      
      if (isNaN(deputation) || deputation < 0) {
        alert('Deputation must be a valid number (0 or greater)')
        return
      }

      const vacant = parseInt(collegeData.vacant)
      
      if (isNaN(vacant) || vacant < 0) {
        alert('Vacant must be a valid number (0 or greater)')
        return
      }
      
      const updateData = { 
        working: working,
        deputation: deputation,
        vacant: vacant,
        deputationToCollegeCode: collegeData.deputationToCollegeCode || ''
      }
      
      await window.api.put(`/colleges/${collegeData.collegeCode}`, updateData)

      // Reload data to get updated vacant value
      await loadCollegeData()
      alert('Data updated successfully!')
    } catch (error) {
      console.error('Error updating data:', error)
      alert('Error updating data: ' + (error.response?.data?.message || error.message))
      // Reload data to reset to server state
      await loadCollegeData()
    }
  }

  const handleLogout = () => {
    logout()
  }

  if (loading) {
    return (
      <div className="loading-indicator">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="loading-message">Loading college data...</div>
      </div>
    )
  }

  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #34495e 100%)' }}>
        <div className="container">
          <a className="navbar-brand fw-bold" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ cursor: 'pointer' }}>
            <i className="fas fa-university me-2"></i>Multi-College Data System
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Dashboard</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i className="fas fa-user me-1"></i> {currentUser?.username}
                </a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); setShowChangePasswordModal(true); }}><i className="fas fa-key me-2"></i>Change Password</a></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li><a className="dropdown-item" href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}><i className="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mt-4 animate-fade-in">
        <h2 className="mb-4 animate-slide-in-right">{currentUser?.collegeCode} Dashboard</h2>

        <div className="alert alert-info alert-modern animate-fade-in-up delay-100">
          <i className="fas fa-info-circle me-2"></i>
          You can edit the "Working", "Vacant", "Deputation", and "Deputation To" fields. Other fields are view-only.
          <br/>
          <small className="mt-2 d-block">
            <i className="fas fa-calculator me-1"></i>
            <strong>Note:</strong> Vacant can be manually edited or auto-calculated. When editing Working or Deputation, Vacant auto-adjusts. When editing Vacant directly, Working auto-adjusts.
          </small>
        </div>

        {collegeData && (
          <div className="table-responsive animate-fade-in-up delay-200">
            <table className="table table-striped table-hover table-modern">
              <thead>
                <tr>
                  <th>College Code</th>
                  <th>College Name</th>
                  <th>District</th>
                  <th>Taluk</th>
                  <th>Designation</th>
                  <th>Group</th>
                  <th>Branch</th>
                  <th>Sanctioned</th>
                  <th>Working</th>
                  <th>Vacant</th>
                  <th>Deputation</th>
                  <th>Deputation To</th>
                  <th>Remarks</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{collegeData.collegeCode}</td>
                  <td>{collegeData.collegeName}</td>
                  <td>{collegeData.district}</td>
                  <td>{collegeData.taluk}</td>
                  <td>{collegeData.designation}</td>
                  <td>{collegeData.group}</td>
                  <td>{collegeData.branch}</td>
                  <td>{collegeData.sanctioned}</td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={collegeData.working}
                      onChange={(e) => updateField('working', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={collegeData.vacant}
                      onChange={(e) => updateField('vacant', e.target.value)}
                      title="Edit vacant positions (will auto-adjust working)"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={collegeData.deputation}
                      onChange={(e) => updateField('deputation', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      value={collegeData.deputationToCollegeCode || ''}
                      onChange={(e) => updateField('deputationToCollegeCode', e.target.value)}
                    />
                  </td>
                  <td>{collegeData.remarks || ''}</td>
                  <td>{new Date(collegeData.lastUpdated).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        {collegeData && (
          <div className="mt-3 d-flex justify-content-end">
            <button 
              className="btn btn-primary btn-lg"
              onClick={handleSaveChanges}
            >
              <i className="fas fa-save me-2"></i>
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
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

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal 
          show={showChangePasswordModal}
          onHide={() => setShowChangePasswordModal(false)}
        />
      )}
    </>
  )
}

export default CollegeDashboard
