import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AdminPage } from "./pages/AdminPage"
import { ChatPage } from "./pages/ChatPage"
import { ProfilePage } from "./pages/ProfilePage"
import { RequireAuth } from './components/Login/RequireAuth'
import { LoginPage } from './pages/LoginPage'
import { Header } from './components/Layout/Header'
import { SetPasswordPage } from "./pages/SetPassword";
import { useViewportHeight } from "./hooks/useViewportHeight";
import { AuthActionPage } from "./pages/AuthActionPage";

function App() {
  useViewportHeight();
  return (
    <BrowserRouter>
      <div className="h-[var(--app-height,100dvh)] flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
        <Header />
        <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/chatpage" replace />} />
            <Route path="/admin" element={<RequireAuth role="admin"><AdminPage /></RequireAuth>} />
            <Route path="/chatpage" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/set-password" element={<SetPasswordPage />} />
            <Route path="/auth-action" element={<AuthActionPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)