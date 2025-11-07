import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import CollegesTab from '../components/CollegesTab'
import UsersTab from '../components/UsersTab'
import BulkUploadTab from '../components/BulkUploadTab'
import ReportsTab from '../components/ReportsTab'
import LogsTab from '../components/LogsTab'
import ChangePasswordModal from '../components/ChangePasswordModal'

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('colleges')
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false)
  const [dashboardData, setDashboardData] = useState({
    collegeCount: 0,
    userCount: 0,
    updateCount: 0
  })

  useEffect(() => {
    loadDashboardData()
    updateFooterYear()
  }, [])

  const updateFooterYear = () => {
    const currentYear = new Date().getFullYear()
    const yearElement = document.getElementById('currentYear')
    if (yearElement) {
      yearElement.textContent = currentYear
    }
  }

  const loadDashboardData = async () => {
    try {
      const [collegesRes, usersRes, logsRes] = await Promise.all([
        window.api.get('/colleges'),
        window.api.get('/users'),
        window.api.get('/logs/recent/activity')
      ])

      // Handle paginated college response
      const colleges = collegesRes.data.data || collegesRes.data
      const users = usersRes.data
      const logs = logsRes.data

      setDashboardData({
        collegeCount: collegesRes.data.meta?.total || colleges.length,
        userCount: users.length,
        updateCount: logs.length
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const handleLogout = () => {
    logout()
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleChangePassword = (e) => {
    e.preventDefault()
    setShowChangePasswordModal(true)
  }

  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ background: 'linear-gradient(135deg, var(--primary-color) 0%, #34495e 100%)' }}>
        <div className="container">
          <a className="navbar-brand fw-bold" href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }} style={{ cursor: 'pointer' }}>
            <i className="fas fa-university me-2"></i>Multi-College Data System
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={(e) => { e.preventDefault(); scrollToTop(); }}>Dashboard</a>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                  <i className="fas fa-user me-1"></i> {currentUser?.username}
                </a>
                <ul className="dropdown-menu">
                  <li><a className="dropdown-item" href="#" onClick={handleChangePassword}><i className="fas fa-key me-2"></i>Change Password</a></li>
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
        <h2 className="mb-4 animate-slide-in-right">Admin Dashboard</h2>

        {/* Dashboard Cards */}
        <div className="row">
          <div className="col-md-3">
            <div className="card dashboard-card card-modern text-center animate-fade-in-up">
              <div className="card-body">
                <i className="fas fa-university card-icon"></i>
                <h5 className="card-title">Colleges</h5>
                <h3 className="card-text">{dashboardData.collegeCount}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card card-modern text-center animate-fade-in-up delay-100">
              <div className="card-body">
                <i className="fas fa-users card-icon"></i>
                <h5 className="card-title">Users</h5>
                <h3 className="card-text">{dashboardData.userCount}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card card-modern text-center animate-fade-in-up delay-200">
              <div className="card-body">
                <i className="fas fa-file-excel card-icon"></i>
                <h5 className="card-title">Reports</h5>
                <h3 className="card-text">12</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card dashboard-card card-modern text-center animate-fade-in-up delay-300">
              <div className="card-body">
                <i className="fas fa-history card-icon"></i>
                <h5 className="card-title">Updates</h5>
                <h3 className="card-text">{dashboardData.updateCount}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs mt-4 animate-fade-in delay-300" role="tablist">
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'colleges' ? 'active' : ''}`}
              onClick={() => setActiveTab('colleges')}
            >
              Colleges
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'bulk' ? 'active' : ''}`}
              onClick={() => setActiveTab('bulk')}
            >
              Bulk Upload
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveTab('reports')}
            >
              Reports
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <button
              className={`nav-link ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              Update Logs
            </button>
          </li>
        </ul>

        {/* Tab Content */}
        <div className="tab-content mt-3">
          {activeTab === 'colleges' && <CollegesTab />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'bulk' && <BulkUploadTab />}
          {activeTab === 'reports' && <ReportsTab />}
          {activeTab === 'logs' && <LogsTab />}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer-modern mt-5">
        <div className="footer-content">
          <div className="container">
            <div className="row align-items-center py-4">
              <div className="col-md-4 text-center text-md-start mb-3 mb-md-0">
                <h5 className="footer-title mb-2">
                  <i className="fas fa-university me-2"></i>
                  Multi-College Data Collection System
                </h5>
                <p className="footer-subtitle mb-0">Data Management Excellence</p>
              </div>
              <div className="col-md-4 text-center mb-3 mb-md-0">
                <div className="footer-guidance">
                  <i className="fas fa-user-tie me-2"></i>
                  <strong>Guided by:</strong> Mr. Sathish S<br/>
                  <small>Lecturer, Department of Computer Science & Engineering</small>
                </div>
              </div>
              <div className="col-md-4 text-center text-md-end">
                <p className="footer-info mb-2">
                  <i className="fas fa-code me-2"></i>
                  <strong>Designed & Developed by:</strong>
                  <a href="https://yrb-portfolio.netlify.app/" target="_blank" rel="noopener noreferrer" className="developer-link-modern ms-1">
                    Mr. Yeshwant Rao B
                  </a>
                </p>
                <p className="footer-college mb-0">
                  <i className="fas fa-building me-2"></i>
                  <a href="https://gpt.karnataka.gov.in/kptmangalore/public/en" target="_blank" rel="noopener noreferrer" className="college-link-modern">
                    Karnataka Govt. Polytechnic, Mangalore
                  </a>
                </p>
              </div>
            </div>
            <div className="footer-bottom text-center py-3">
              <p className="mb-0">
                <i className="fas fa-copyright me-1"></i>
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

export default AdminDashboard
