import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0e2413',
              color: '#f6f1e6',
              borderRadius: '1rem',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#c6a15b', secondary: '#f6f1e6' } },
          }}
        />
      </AuthProvider>
    </HelmetProvider>
  </StrictMode>,
)
