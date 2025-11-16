import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import Header from './components/Header.tsx'
import AppRoutes from './components/AppRoutes.tsx'
import { AuthProvider } from './contexts/AuthContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
