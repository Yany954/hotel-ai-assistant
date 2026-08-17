import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom"
import { AdminPage } from "./pages/AdminPage"
import { ChatPage } from "./pages/ChatPage"

function TopNav() {
  const location = useLocation();
  const linkCls = (path: string) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium ${location.pathname === path ? "bg-violet-100 text-violet-700" : "text-slate-500 hover:bg-slate-100"}`;
  return (
    <div className="flex gap-2 p-3 bg-white border-b border-slate-200">
      <Link to="/admin" className={linkCls("/admin")}>Admin</Link>
      <Link to="/chatpage" className={linkCls("/chatpage")}>Chat</Link>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <TopNav />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/chatpage" element={<ChatPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  </React.StrictMode>
)