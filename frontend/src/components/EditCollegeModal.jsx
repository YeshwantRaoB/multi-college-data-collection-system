import React, { useState, useEffect } from 'react'

const EditCollegeModal = ({ show, onHide, college, onSuccess }) => {
  const [formData, setFormData] = useState({
    working: '',
    vacant: '',
    deputation: '',
    deputationToCollegeCode: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (college) {
      setFormData({
        working: college.working || '',
        vacant: college.vacant || '',
        deputation: college.deputation || '',
        deputationToCollegeCode: college.deputationToCollegeCode || ''
      })
    }
  }, [college])

  // Calculate vacant automatically if not manually entered
  const calculateVacant = () => {
    if (!college) return 0
    // If vacant is manually set, use it
    if (formData.vacant !== '' && formData.vacant !== null && formData.vacant !== undefined) {
      return parseInt(formData.vacant) || 0
    }
    const sanctioned = parseInt(college.sanctioned) || 0
    const working = parseInt(formData.working) || 0
    const deputation = parseInt(formData.deputation) || 0
    return Math.max(0, sanctioned - working - deputation)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let processedValue = value
    
    // Auto-uppercase for text fields
    if (name === 'deputationToCollegeCode') {
      processedValue = value.toUpperCase()
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validate numeric fields
    const working = parseInt(formData.working)
    const deputation = parseInt(formData.deputation)
    const vacant = parseInt(formData.vacant)
    
    if (isNaN(working) || working < 0) {
      alert('Working must be a valid number (0 or greater)')
      return
    }
    
    if (isNaN(deputation) || deputation < 0) {
      alert('Deputation must be a valid number (0 or greater)')
      return
    }
    
    if (isNaN(vacant) || vacant < 0) {
      alert('Vacant must be a valid number (0 or greater)')
      return
    }
    
    setLoading(true)

    try {
      await window.api.put(`/colleges/${college.collegeCode}`, {
        working: working,
        vacant: vacant,
        deputation: deputation,
        deputationToCollegeCode: formData.deputationToCollegeCode
      })

      onSuccess()
      alert('College updated successfully!')
    } catch (error) {
      console.error('Error updating college:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred'
      alert('Error updating college: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!show || !college) return null

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Edit College Data</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editCollegeCode" className="form-label">College Code</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editCollegeCode"
                      value={college.collegeCode}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editCollegeName" className="form-label">College Name</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editCollegeName"
                      value={college.collegeName}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editDistrict" className="form-label">District</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editDistrict"
                      value={college.district}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editTaluk" className="form-label">Taluk</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editTaluk"
                      value={college.taluk}
                      readOnly
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label htmlFor="editDesignation" className="form-label">Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editDesignation"
                      value={college.designation}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editGroup" className="form-label">Group</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editGroup"
                      value={college.group}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editBranch" className="form-label">Branch</label>
                    <input
                      type="text"
                      className="form-control"
                      id="editBranch"
                      value={college.branch}
                      readOnly
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="editSanctioned" className="form-label">Sanctioned</label>
                    <input
                      type="number"
                      className="form-control"
                      id="editSanctioned"
                      value={college.sanctioned}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="working" className="form-label">Working</label>
                    <input
                      type="number"
                      className="form-control"
                      id="working"
                      name="working"
                      value={formData.working}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="deputation" className="form-label">Deputation</label>
                    <input
                      type="number"
                      className="form-control"
                      id="deputation"
                      name="deputation"
                      value={formData.deputation}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="mb-3">
                    <label htmlFor="vacant" className="form-label">
                      Vacant <span className="badge bg-warning text-dark">Editable</span>
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="vacant"
                      name="vacant"
                      value={formData.vacant === '' ? calculateVacant() : formData.vacant}
                      onChange={handleChange}
                      required
                      min="0"
                      style={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                    />
                    <small className="form-text text-muted">
                      {formData.vacant === '' ? `Auto: ${college?.sanctioned || 0} - ${formData.working || 0} - ${formData.deputation || 0}` : 'Manual override active'}
                    </small>
                  </div>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="deputationToCollegeCode" className="form-label">Deputation To College Code</label>
                <input
                  type="text"
                  className="form-control"
                  id="deputationToCollegeCode"
                  name="deputationToCollegeCode"
                  value={formData.deputationToCollegeCode}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editRemarks" className="form-label">Remarks</label>
                <textarea
                  className="form-control"
                  id="editRemarks"
                  rows="3"
                  value={college.remarks || ''}
                  readOnly
                />
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
              {loading ? 'Updating...' : 'Update College'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditCollegeModal
