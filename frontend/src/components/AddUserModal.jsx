import React, { useState } from 'react'

const AddUserModal = ({ show, onHide, colleges, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    collegeCode: ''
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await window.api.post('/users', {
        username: formData.username,
        password: formData.password,
        collegeCode: formData.collegeCode || null
      })

      onSuccess()
      setFormData({
        username: '',
        password: '',
        collegeCode: ''
      })
    } catch (error) {
      console.error('Error adding user:', error)
      alert('Error adding user: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add New User</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Username</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="collegeCode" className="form-label">College</label>
                <select
                  className="form-select"
                  id="collegeCode"
                  name="collegeCode"
                  value={formData.collegeCode}
                  onChange={handleChange}
                >
                  <option value="">Select College</option>
                  {colleges.map((college) => (
                    <option key={college.collegeCode} value={college.collegeCode}>
                      {college.collegeCode} - {college.collegeName}
                    </option>
                  ))}
                </select>
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AddUserModal
