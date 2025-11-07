import React from 'react'

const LoadingSpinner = ({ message = 'Loading...', size = 'md', fullPage = false }) => {
  const sizeClasses = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg'
  }

  const content = (
    <div className={`text-center ${fullPage ? 'position-fixed top-50 start-50 translate-middle' : 'my-5'}`} style={{ zIndex: fullPage ? 9999 : 1 }}>
      <div className={`spinner-border text-primary ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <div className="mt-3 text-muted">
        <i className="fas fa-circle-notch fa-spin me-2"></i>
        {message}
      </div>
    </div>
  )

  if (fullPage) {
    return (
      <>
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-white opacity-75" style={{ zIndex: 9998 }}></div>
        {content}
      </>
    )
  }

  return content
}

export default LoadingSpinner
