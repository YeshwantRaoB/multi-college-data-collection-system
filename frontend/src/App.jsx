import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import AdminDashboard from './pages/AdminDashboard'
import CollegeDashboard from './pages/CollegeDashboard'
import { AuthProvider } from './context/AuthContext'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/college" element={<CollegeDashboard />} />
        </Routes>
      </div>
    </AuthProvider>
  )
}

export default App
