import React, { useState, useEffect } from 'react'

const EditCollegeModal = ({ show, onHide, college, onSuccess }) => {
  const [formData, setFormData] = useState({
    working: '',
    deputation: '',
    deputationToCollegeCode: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (college) {
      setFormData({
        working: college.working || '',
        deputation: college.deputation || '',
        deputationToCollegeCode: college.deputationToCollegeCode || ''
      })
    }
  }, [college])

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
      await window.api.put(`/colleges/${college.collegeCode}`, {
        working: parseInt(formData.working),
        deputation: parseInt(formData.deputation),
        deputationToCollegeCode: formData.deputationToCollegeCode
      })

      onSuccess()
    } catch (error) {
      console.error('Error updating college:', error)
      alert('Error updating college: ' + error.message)
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
