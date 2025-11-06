import React, { useState } from 'react'
import * as XLSX from 'xlsx'

const BulkUploadTab = () => {
  const [collegeFile, setCollegeFile] = useState(null)
  const [userFile, setUserFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadResults, setUploadResults] = useState(null)

  const handleCollegeFileChange = (e) => {
    setCollegeFile(e.target.files[0])
  }

  const handleUserFileChange = (e) => {
    setUserFile(e.target.files[0])
  }

  const uploadColleges = async () => {
    if (!collegeFile) {
      alert('Please select a college file to upload.')
      return
    }

    setUploading(true)
    setUploadResults(null)

    try {
      const formData = new FormData()
      formData.append('file', collegeFile)

      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_BASE_URL}/upload/colleges`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()
      setUploadResults(result)

      if (result.results.errors.length > 0) {
        alert(`Upload completed with ${result.results.errors.length} errors. Check console for details.`)
        console.log('Upload errors:', result.results.errors)
      } else {
        alert('Colleges uploaded successfully!')
      }

      setCollegeFile(null)
      // Reset file input
      document.getElementById('collegeUpload').value = ''
    } catch (error) {
      console.error('Error uploading colleges:', error)
      alert('Error uploading colleges: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const downloadCollegeTemplate = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_BASE_URL}/upload/template/colleges`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download template')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'colleges_template.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Error downloading template: ' + error.message)
    }
  }

  const downloadUserTemplate = async () => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_BASE_URL}/upload/template/users`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to download template')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'users_template.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error downloading template:', error)
      alert('Error downloading template: ' + error.message)
    }
  }

  const uploadUsers = async () => {
    if (!userFile) {
      alert('Please select a user file to upload.')
      return
    }

    setUploading(true)
    setUploadResults(null)

    try {
      const formData = new FormData()
      formData.append('file', userFile)

      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_BASE_URL}/upload/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Upload failed')
      }

      const result = await response.json()
      setUploadResults(result)

      if (result.results.errors.length > 0) {
        alert(`Upload completed with ${result.results.errors.length} errors. Check console for details.`)
        console.log('Upload errors:', result.results.errors)
      } else {
        alert('Users uploaded successfully!')
      }

      setUserFile(null)
      // Reset file input
      document.getElementById('userUpload').value = ''
    } catch (error) {
      console.error('Error uploading users:', error)
      alert('Error uploading users: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h4>Bulk Upload</h4>

      {uploadResults && (
        <div className="alert alert-info mb-4">
          <h5>Upload Results:</h5>
          <p>✅ Successfully uploaded: {uploadResults.results.success} records</p>
          {uploadResults.results.errors.length > 0 && (
            <p>❌ Errors: {uploadResults.results.errors.length} records</p>
          )}
        </div>
      )}

      <div className="row">
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Upload Colleges</h5>
            </div>
            <div className="card-body">
              <p>Upload Excel file with the following columns:</p>
              <ul>
                <li>College Code</li>
                <li>College Name</li>
                <li>District</li>
                <li>Taluk</li>
                <li>Designation</li>
                <li>Group</li>
                <li>Branch</li>
                <li>Sanctioned</li>
                <li>Working</li>
                <li>Vacant</li>
                <li>Deputation</li>
                <li>Deputation to College Code</li>
                <li>Remarks</li>
              </ul>

              <div className="mb-3">
                <input
                  type="file"
                  className="form-control"
                  id="collegeUpload"
                  accept=".xlsx, .xls"
                  onChange={handleCollegeFileChange}
                />
                {collegeFile && (
                  <small className="text-muted">
                    Selected: {collegeFile.name} ({(collegeFile.size / 1024).toFixed(1)} KB)
                  </small>
                )}
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-success"
                  onClick={uploadColleges}
                  disabled={uploading || !collegeFile}
                >
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-1"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-1"></i>
                      Upload Colleges
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={downloadCollegeTemplate}
                  disabled={uploading}
                >
                  <i className="fas fa-download me-1"></i>
                  Download Template
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Upload Users</h5>
            </div>
            <div className="card-body">
              <p>Upload Excel file with the following columns:</p>
              <ul>
                <li>Username</li>
                <li>Password</li>
                <li>College Code</li>
              </ul>

              <div className="mb-3">
                <input
                  type="file"
                  className="form-control"
                  id="userUpload"
                  accept=".xlsx, .xls"
                  onChange={handleUserFileChange}
                />
                {userFile && (
                  <small className="text-muted">
                    Selected: {userFile.name} ({(userFile.size / 1024).toFixed(1)} KB)
                  </small>
                )}
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-success"
                  onClick={uploadUsers}
                  disabled={uploading || !userFile}
                >
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin me-1"></i>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload me-1"></i>
                      Upload Users
                    </>
                  )}
                </button>
                <button
                  className="btn btn-outline-primary"
                  onClick={downloadUserTemplate}
                  disabled={uploading}
                >
                  <i className="fas fa-download me-1"></i>
                  Download Template
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BulkUploadTab
