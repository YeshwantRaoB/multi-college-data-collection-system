import React, { useState, useEffect } from 'react'

const LogsTab = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLogs()
  }, [])

  const loadLogs = async () => {
    try {
      setLoading(true)
      const response = await window.api.get('/logs?limit=50')
      setLogs(response.data.logs || response.data)
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center">Loading logs...</div>
  }

  return (
    <>
      <h4>Update History</h4>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Date & Time</th>
              <th>User</th>
              <th>College</th>
              <th>Field Changed</th>
              <th>Old Value</th>
              <th>New Value</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{new Date(log.createdAt || log.dateTime).toLocaleString()}</td>
                <td>{log.user?.username || log.user}</td>
                <td>{log.collegeCode}</td>
                <td>{log.fieldChanged}</td>
                <td>{log.oldValue}</td>
                <td>{log.newValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default LogsTab
