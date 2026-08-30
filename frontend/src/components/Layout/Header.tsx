import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Sparkles, MessageSquare, ShieldCheck, UserCircle2, Menu, X, Sun, Moon } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

export function Header() {
  const { user, role } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user) return null;

  const linkCls = (path: string) =>
    `flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path
        ? "bg-violet-50 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
        : "text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
    }`;

  const navLinks = (
    <>
      {role === "admin" && (
        <Link to="/admin" className={linkCls("/admin")} onClick={() => setMobileOpen(false)}>
          <ShieldCheck size={15} /> Admin
        </Link>
      )}
      <Link to="/chatpage" className={linkCls("/chatpage")} onClick={() => setMobileOpen(false)}>
        <MessageSquare size={15} /> Chat
      </Link>
      <Link to="/profile" className={linkCls("/profile")} onClick={() => setMobileOpen(false)}>
        <UserCircle2 size={15} /> Profile
      </Link>
    </>
  );

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
            <Sparkles className="text-white" size={18} />
          </div>
          <span className="font-semibold text-slate-900 dark:text-slate-100 text-sm">Front Desk AI</span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-1">{navLinks}</nav>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <Link
            to="/profile"
            className="hidden sm:flex w-8 h-8 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 items-center justify-center text-xs font-semibold shrink-0"
          >
            {(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
          </Link>
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="sm:hidden w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {mobileOpen && (
        <nav className="sm:hidden flex flex-col gap-1 px-4 pb-3 border-t border-slate-100 dark:border-slate-800 pt-3">
          {navLinks}
          <Link
            to="/profile"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-500 dark:text-slate-400"
          >
            <span className="w-5 h-5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300 flex items-center justify-center text-[10px] font-semibold">
              {(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
            </span>
            {user.email}
          </Link>
        </nav>
      )}
    </header>
  );
}
