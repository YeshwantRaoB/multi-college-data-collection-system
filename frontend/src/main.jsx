import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import './styles/animations.css'
import './services/api.js'
import * as serviceWorker from './utils/serviceWorker'

// Render the app
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

// Register service worker for PWA features and caching
serviceWorker.register()

// Preload critical resources
serviceWorker.preloadCriticalResources()
