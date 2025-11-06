import React, { useState, useEffect } from 'react'
import AddUserModal from './AddUserModal'

const UsersTab = () => {
  const [users, setUsers] = useState([])
  const [colleges, setColleges] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [usersRes, collegesRes] = await Promise.all([
        window.api.get('/users'),
        window.api.get('/colleges?limit=1000')
      ])
      const users = usersRes.data
      const colleges = collegesRes.data.data || collegesRes.data
      
      setUsers(users.filter(user => user.role !== 'admin'))
      setColleges(colleges)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (username) => {
    const newPassword = prompt('Enter new password for ' + username + ':')
    if (!newPassword) return

    try {
      await window.api.post('/auth/reset-password', { username, newPassword })
      alert('Password reset successfully!')
    } catch (error) {
      console.error('Error resetting password:', error)
      alert('Error resetting password: ' + error.message)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await window.api.delete(`/users/${userId}`)
        await loadData()
        alert('User deleted successfully!')
      } catch (error) {
        console.error('Error deleting user:', error)
        alert('Error deleting user: ' + error.message)
      }
    }
  }

  const handleAddSuccess = () => {
    setShowAddModal(false)
    loadData()
  }

  if (loading) {
    return <div className="text-center">Loading users...</div>
  }

  return (
    <>
      <div className="d-flex justify-content-between mb-3">
        <h4>User Management</h4>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddModal(true)}
        >
          <i className="fas fa-plus me-1"></i> Add User
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Username</th>
              <th>College</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.collegeCode || 'N/A'}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning action-btn"
                    onClick={() => handleResetPassword(user.username)}
                  >
                    <i className="fas fa-key"></i> Reset Password
                  </button>
                  <button
                    className="btn btn-sm btn-danger action-btn"
                    onClick={() => handleDeleteUser(user._id)}
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddUserModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        colleges={colleges}
        onSuccess={handleAddSuccess}
      />
    </>
  )
}

export default UsersTab
