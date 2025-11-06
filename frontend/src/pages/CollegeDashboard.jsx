import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const CollegeDashboard = () => {
  const { currentUser, logout } = useAuth()
  const [collegeData, setCollegeData] = useState(null)
  const [loading, setLoading] = useState(true)

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

  const updateField = async (fieldName, newValue) => {
    try {
      // Parse as integer for numeric fields, keep as string for text fields
      const updateData = { 
        [fieldName]: ['working', 'deputation'].includes(fieldName) 
          ? parseInt(newValue) 
          : newValue 
      }
      await window.api.put(`/colleges/${collegeData.collegeCode}`, updateData)

      // Reload data
      await loadCollegeData()
      alert('Data updated successfully!')
    } catch (error) {
      console.error('Error updating data:', error)
      alert('Error updating data: ' + (error.response?.data?.message || error.message))
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
          <a className="navbar-brand fw-bold" href="#">
            <i className="fas fa-university me-2"></i>Multi-College Data System
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#">Dashboard</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i className="fas fa-user me-1"></i> {currentUser?.username}
                </a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={handleLogout}>Logout</a></li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mt-4">
        <h2 className="mb-4">{currentUser?.collegeCode} Dashboard</h2>

        <div className="alert alert-info">
          <i className="fas fa-info-circle me-2"></i>
          You can only edit the "Working", "Deputation", and "Deputation To" fields. Other fields are view-only.
        </div>

        {collegeData && (
          <div className="table-responsive">
            <table className="table table-striped table-hover">
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
                  <td>{collegeData.vacant}</td>
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
      </div>

      {/* Footer */}
      <footer className="footer mt-5 py-3 bg-dark text-light">
        <div className="container text-center">
          <p className="mb-1">
            <strong>Multi-College Data Collection & Management System</strong> ©
            <span id="currentYear"></span>
          </p>
          <p className="mb-0">
            Designed & Developed by
            <a href="https://yrb-portfolio.netlify.app/" target="_blank" className="developer-link fw-bold ms-1">
              Yeshwant Rao B
            </a>
            |
            <a href="https://gpt.karnataka.gov.in/kptmangalore/public/en" target="_blank" className="college-link fw-bold ms-1">
              Karnataka (Govt.) Polytechnic, Mangalore
            </a>
          </p>
        </div>
      </footer>
    </>
  )
}

export default CollegeDashboard
