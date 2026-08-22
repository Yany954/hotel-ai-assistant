import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AdminPage } from "./pages/AdminPage"
import { ChatPage } from "./pages/ChatPage"
import { ProfilePage } from "./pages/ProfilePage"
import { RequireAuth } from './components/Login/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { Header } from './components/Layout/Header'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Header />
      <div className="p-4">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<Navigate to="/chatpage" replace />} />
          <Route path="/admin" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
          <Route path="/chatpage" element={<RequireAuth><ChatPage /></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
)