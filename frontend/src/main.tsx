import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import './index.css'
import App from './pages/App.tsx'
import LogInScreen from './pages/LogIn.tsx'
import SignUpScreen from './pages/SignUp.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<App />} />
        <Route path="login" element={<LogInScreen />} />
        <Route path="signup" element={<SignUpScreen />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
