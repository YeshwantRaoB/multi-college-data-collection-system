import React, { useState, useEffect } from 'react'
import AddCollegeModal from './AddCollegeModal'
import EditCollegeModal from './EditCollegeModal'

const CollegesTab = () => {
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCollege, setEditingCollege] = useState(null)

  useEffect(() => {
    loadColleges()
  }, [])

  const loadColleges = async () => {
    try {
      setLoading(true)
      const response = await window.api.get('/colleges?limit=1000') // Get all colleges for admin view
      // Handle paginated response
      const colleges = response.data.data || response.data
      setColleges(colleges)
    } catch (error) {
      console.error('Error loading colleges:', error)
      alert('Error loading colleges: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (college) => {
    setEditingCollege(college)
    setShowEditModal(true)
  }

  const handleDelete = async (collegeCode) => {
    if (window.confirm('Are you sure you want to delete this college? This action cannot be undone.')) {
      try {
        await window.api.delete(`/colleges/${collegeCode}`)
        await loadColleges()
        alert('College deleted successfully!')
      } catch (error) {
        console.error('Error deleting college:', error)
        alert('Error deleting college: ' + error.message)
      }
    }
  }

  const handleAddSuccess = () => {
    setShowAddModal(false)
    loadColleges()
  }

  const handleEditSuccess = () => {
    setShowEditModal(false)
    setEditingCollege(null)
    loadColleges()
  }

  if (loading) {
    return <div className="text-center">Loading colleges...</div>
  }

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h4>College Management</h4>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-1"></i> Add College
        </button>
      </div>

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges.map((college) => (
              <tr key={college.collegeCode}>
                <td>{college.collegeCode}</td>
                <td>{college.collegeName}</td>
                <td>{college.district}</td>
                <td>{college.taluk}</td>
                <td>{college.designation}</td>
                <td>{college.group}</td>
                <td>{college.branch}</td>
                <td>{college.sanctioned}</td>
                <td>{college.working}</td>
                <td>{college.vacant}</td>
                <td>{college.deputation}</td>
                <td>{college.deputationToCollegeCode || ''}</td>
                <td>{college.remarks || ''}</td>
                <td>
                  <button
                    className="btn btn-sm btn-primary action-btn"
                    onClick={() => handleEdit(college)}
                  >
                    <i className="fas fa-edit"></i>
                  </button>
                  <button
                    className="btn btn-sm btn-danger action-btn"
                    onClick={() => handleDelete(college.collegeCode)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddCollegeModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <EditCollegeModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        college={editingCollege}
        onSuccess={handleEditSuccess}
      />
    </>
  )
}

export default CollegesTab
