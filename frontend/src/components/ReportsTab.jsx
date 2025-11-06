import React, { useState, useEffect } from 'react'

const ReportsTab = () => {
  const [colleges, setColleges] = useState([])
  const [filteredColleges, setFilteredColleges] = useState([])
  const [filters, setFilters] = useState({
    district: '',
    taluk: '',
    designation: '',
    group: ''
  })
  const [filterOptions, setFilterOptions] = useState({
    districts: [],
    taluks: [],
    designations: [],
    groups: []
  })
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [colleges, filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [collegesRes, filtersRes] = await Promise.all([
        window.api.get('/colleges?limit=1000'),
        window.api.get('/reports/filters')
      ])

      // Handle paginated response
      const colleges = collegesRes.data.data || collegesRes.data
      setColleges(colleges)
      setFilterOptions(filtersRes.data)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading reports data: ' + (error.response?.data?.message || error.message))
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...colleges]

    if (filters.district) {
      filtered = filtered.filter(college => college.district === filters.district)
    }
    if (filters.taluk) {
      filtered = filtered.filter(college => college.taluk === filters.taluk)
    }
    if (filters.designation) {
      filtered = filtered.filter(college => college.designation === filters.designation)
    }
    if (filters.group) {
      filtered = filtered.filter(college => college.group === filters.group)
    }

    setFilteredColleges(filtered)
  }

  const handleFilterChange = (filterType, value) => {
    setFilters({
      ...filters,
      [filterType]: value
    })
  }

  const exportToExcel = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (filters.district) params.append('district', filters.district)
      if (filters.taluk) params.append('taluk', filters.taluk)
      if (filters.designation) params.append('designation', filters.designation)
      if (filters.group) params.append('group', filters.group)

      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_BASE_URL}/reports/export/excel?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Export error response:', errorText)
        throw new Error('Export failed. Please try again.')
      }

      const blob = await response.blob()
      
      // Verify blob is valid
      if (blob.size === 0) {
        throw new Error('Generated file is empty')
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `colleges_report_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert('Excel report generated successfully!')
    } catch (error) {
      console.error('Error generating Excel report:', error)
      alert('Error generating Excel report: ' + error.message)
    } finally {
      setExporting(false)
    }
  }

  const exportToPdf = async () => {
    setExporting(true)
    try {
      const params = new URLSearchParams()
      if (filters.district) params.append('district', filters.district)
      if (filters.taluk) params.append('taluk', filters.taluk)
      if (filters.designation) params.append('designation', filters.designation)
      if (filters.group) params.append('group', filters.group)

      const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
      const response = await fetch(`${API_BASE_URL}/reports/export/pdf?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Export error response:', errorText)
        throw new Error('Export failed. Please try again.')
      }

      const blob = await response.blob()
      
      // Verify blob is valid
      if (blob.size === 0) {
        throw new Error('Generated file is empty')
      }
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `colleges_report_${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert('PDF report generated successfully!')
    } catch (error) {
      console.error('Error generating PDF report:', error)
      alert('Error generating PDF report: ' + error.message)
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <div className="mt-2">Loading reports data...</div>
      </div>
    )
  }

  return (
    <>
      <h4>Generate Reports</h4>

      <div className="row mb-4">
        <div className="col-md-3">
          <label htmlFor="districtFilter" className="form-label">District</label>
          <select
            className="form-select"
            id="districtFilter"
            value={filters.district}
            onChange={(e) => handleFilterChange('district', e.target.value)}
          >
            <option value="">All Districts</option>
            {filterOptions.districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="talukFilter" className="form-label">Taluk</label>
          <select
            className="form-select"
            id="talukFilter"
            value={filters.taluk}
            onChange={(e) => handleFilterChange('taluk', e.target.value)}
          >
            <option value="">All Taluks</option>
            {filterOptions.taluks.map(taluk => (
              <option key={taluk} value={taluk}>{taluk}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="designationFilter" className="form-label">Designation</label>
          <select
            className="form-select"
            id="designationFilter"
            value={filters.designation}
            onChange={(e) => handleFilterChange('designation', e.target.value)}
          >
            <option value="">All Designations</option>
            {filterOptions.designations.map(designation => (
              <option key={designation} value={designation}>{designation}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label htmlFor="groupFilter" className="form-label">Group</label>
          <select
            className="form-select"
            id="groupFilter"
            value={filters.group}
            onChange={(e) => handleFilterChange('group', e.target.value)}
          >
            <option value="">All Groups</option>
            {filterOptions.groups.map(group => (
              <option key={group} value={group}>{group}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="d-grid gap-2 d-md-flex justify-content-md-end mb-3">
        <button
          className="btn btn-success me-md-2"
          onClick={exportToExcel}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <i className="fas fa-spinner fa-spin me-1"></i>
              Generating...
            </>
          ) : (
            <>
              <i className="fas fa-file-excel me-1"></i>
              Export Excel
            </>
          )}
        </button>
        <button
          className="btn btn-danger"
          onClick={exportToPdf}
          disabled={exporting}
        >
          {exporting ? (
            <>
              <i className="fas fa-spinner fa-spin me-1"></i>
              Generating...
            </>
          ) : (
            <>
              <i className="fas fa-file-pdf me-1"></i>
              Export PDF
            </>
          )}
        </button>
      </div>

      <div className="alert alert-info">
        <i className="fas fa-info-circle me-2"></i>
        Showing {filteredColleges.length} of {colleges.length} colleges
        {filters.district || filters.taluk || filters.designation || filters.group ?
          ' (filtered)' : ' (all)'}
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
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
            </tr>
          </thead>
          <tbody>
            {filteredColleges.map((college) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredColleges.length === 0 && (
        <div className="text-center py-4 text-muted">
          No colleges match the selected filters.
        </div>
      )}
    </>
  )
}

export default ReportsTab
