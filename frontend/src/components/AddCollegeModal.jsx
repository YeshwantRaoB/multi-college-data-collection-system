import React, { useState } from 'react'
import Modal from './Modal'

const AddCollegeModal = ({ show, onHide, onSuccess }) => {
  const [formData, setFormData] = useState({
    collegeCode: '',
    collegeName: '',
    district: '',
    taluk: '',
    designation: '',
    group: '',
    branch: '',
    sanctioned: '',
    working: '',
    deputation: '0', // Default to 0
    deputationToCollegeCode: '',
    remarks: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.collegeCode.trim()) {
      newErrors.collegeCode = 'College code is required'
    } else if (formData.collegeCode.length < 3) {
      newErrors.collegeCode = 'College code must be at least 3 characters'
    }

    if (!formData.collegeName.trim()) {
      newErrors.collegeName = 'College name is required'
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required'
    }

    if (!formData.taluk.trim()) {
      newErrors.taluk = 'Taluk is required'
    }

    if (!formData.designation.trim()) {
      newErrors.designation = 'Designation is required'
    }

    if (!formData.group.trim()) {
      newErrors.group = 'Group is required'
    }

    if (!formData.branch.trim()) {
      newErrors.branch = 'Branch is required'
    }

    if (formData.sanctioned === '' || formData.sanctioned === null || formData.sanctioned === undefined) {
      newErrors.sanctioned = 'Sanctioned is required'
    } else if (parseInt(formData.sanctioned) < 0 || isNaN(parseInt(formData.sanctioned))) {
      newErrors.sanctioned = 'Sanctioned must be 0 or greater'
    }

    if (formData.working === '' || formData.working === null || formData.working === undefined) {
      newErrors.working = 'Working is required'
    } else if (parseInt(formData.working) < 0 || isNaN(parseInt(formData.working))) {
      newErrors.working = 'Working must be 0 or greater'
    }

    // Deputation is optional - default to 0 if empty
    const deputationValue = formData.deputation === '' ? '0' : formData.deputation
    if (parseInt(deputationValue) < 0 || isNaN(parseInt(deputationValue))) {
      newErrors.deputation = 'Deputation must be 0 or greater'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Calculate vacant automatically
  const calculateVacant = () => {
    const sanctioned = parseInt(formData.sanctioned) || 0
    const working = parseInt(formData.working) || 0
    const deputation = parseInt(formData.deputation) || 0
    return Math.max(0, sanctioned - working - deputation)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      // Default deputation to 0 if empty
      const deputationValue = formData.deputation === '' ? 0 : parseInt(formData.deputation)
      
      await window.api.post('/colleges', {
        ...formData,
        sanctioned: parseInt(formData.sanctioned),
        working: parseInt(formData.working),
        deputation: deputationValue
      })

      onSuccess()
      setFormData({
        collegeCode: '',
        collegeName: '',
        district: '',
        taluk: '',
        designation: '',
        group: '',
        branch: '',
        sanctioned: '',
        working: '',
        deputation: '0', // Reset to default 0
        deputationToCollegeCode: '',
        remarks: ''
      })
      setErrors({})
    } catch (error) {
      console.error('Error adding college:', error)
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred'
      alert('Error adding college: ' + errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const footer = (
    <>
      <button type="button" className="btn btn-secondary" onClick={onHide}>
        Cancel
      </button>
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? 'Saving...' : 'Save College'}
      </button>
    </>
  )

  return (
    <Modal show={show} onHide={onHide} title="Add New College" size="lg" footer={footer}>
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="collegeCode" className="form-label">College Code <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.collegeCode ? 'is-invalid' : ''}`}
                id="collegeCode"
                name="collegeCode"
                value={formData.collegeCode}
                onChange={handleChange}
                placeholder="e.g., KPT001"
              />
              {errors.collegeCode && <div className="invalid-feedback">{errors.collegeCode}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="collegeName" className="form-label">College Name <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.collegeName ? 'is-invalid' : ''}`}
                id="collegeName"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                placeholder="e.g., Karnataka Polytechnic"
              />
              {errors.collegeName && <div className="invalid-feedback">{errors.collegeName}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="district" className="form-label">District <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.district ? 'is-invalid' : ''}`}
                id="district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="e.g., Dakshina Kannada"
              />
              {errors.district && <div className="invalid-feedback">{errors.district}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="taluk" className="form-label">Taluk <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.taluk ? 'is-invalid' : ''}`}
                id="taluk"
                name="taluk"
                value={formData.taluk}
                onChange={handleChange}
                placeholder="e.g., Mangalore"
              />
              {errors.taluk && <div className="invalid-feedback">{errors.taluk}</div>}
            </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
              <label htmlFor="designation" className="form-label">Designation <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.designation ? 'is-invalid' : ''}`}
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g., Principal"
              />
              {errors.designation && <div className="invalid-feedback">{errors.designation}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="group" className="form-label">Group <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.group ? 'is-invalid' : ''}`}
                id="group"
                name="group"
                value={formData.group}
                onChange={handleChange}
                placeholder="e.g., A"
              />
              {errors.group && <div className="invalid-feedback">{errors.group}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="branch" className="form-label">Branch <span className="text-danger">*</span></label>
              <input
                type="text"
                className={`form-control ${errors.branch ? 'is-invalid' : ''}`}
                id="branch"
                name="branch"
                value={formData.branch}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
              />
              {errors.branch && <div className="invalid-feedback">{errors.branch}</div>}
            </div>
            <div className="mb-3">
              <label htmlFor="sanctioned" className="form-label">Sanctioned <span className="text-danger">*</span></label>
              <input
                type="number"
                className={`form-control ${errors.sanctioned ? 'is-invalid' : ''}`}
                id="sanctioned"
                name="sanctioned"
                value={formData.sanctioned}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 60"
              />
              {errors.sanctioned && <div className="invalid-feedback">{errors.sanctioned}</div>}
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-md-4">
            <div className="mb-3">
              <label htmlFor="working" className="form-label">Working <span className="text-danger">*</span></label>
              <input
                type="number"
                className={`form-control ${errors.working ? 'is-invalid' : ''}`}
                id="working"
                name="working"
                value={formData.working}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 55"
              />
              {errors.working && <div className="invalid-feedback">{errors.working}</div>}
            </div>
          </div>
          <div className="col-md-4">
            <div className="mb-3">
              <label htmlFor="deputation" className="form-label">Deputation <span className="text-muted">(Optional, default: 0)</span></label>
              <input
                type="number"
                className={`form-control ${errors.deputation ? 'is-invalid' : ''}`}
                id="deputation"
                name="deputation"
                value={formData.deputation}
                onChange={handleChange}
                min="0"
                placeholder="0"
              />
              {errors.deputation && <div className="invalid-feedback">{errors.deputation}</div>}
              <small className="form-text text-muted">Leave as 0 if no staff on deputation</small>
            </div>
          </div>
          <div className="col-md-4">
            <div className="mb-3">
              <label htmlFor="vacant" className="form-label">
                Vacant <span className="badge bg-info">Auto-calculated</span>
              </label>
              <input
                type="number"
                className="form-control bg-light"
                id="vacant"
                name="vacant"
                value={calculateVacant()}
                readOnly
                disabled
                style={{ fontWeight: 'bold', fontSize: '1.1rem' }}
              />
              <small className="form-text text-muted">
                Formula: Sanctioned - Working - Deputation
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
            placeholder="e.g., KPT002 (optional)"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="remarks" className="form-label">Remarks</label>
          <textarea
            className="form-control"
            id="remarks"
            name="remarks"
            rows="3"
            value={formData.remarks}
            onChange={handleChange}
            placeholder="Additional notes or comments (optional)"
          />
        </div>
      </form>
    </Modal>
  )
}

export default AddCollegeModal
