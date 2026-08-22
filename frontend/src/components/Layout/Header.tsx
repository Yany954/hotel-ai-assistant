import { Link, useLocation } from "react-router-dom";
import { Sparkles, MessageSquare, ShieldCheck, UserCircle2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export function Header() {
  const { user, role } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const linkCls = (path: string) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
      location.pathname === path ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50"
    }`;

  return (
    <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <Sparkles className="text-white" size={18} />
        </div>
        <span className="font-semibold text-slate-900 text-sm">Front Desk AI</span>
      </div>

      <nav className="flex items-center gap-1">
        {role === "admin" && (
          <Link to="/admin" className={linkCls("/admin")}>
            <ShieldCheck size={15} /> Admin
          </Link>
        )}
        <Link to="/chatpage" className={linkCls("/chatpage")}>
          <MessageSquare size={15} /> Chat
        </Link>
        <Link to="/profile" className={linkCls("/profile")}>
          <UserCircle2 size={15} /> Profile
        </Link>
      </nav>

      <Link
        to="/profile"
        className="w-8 h-8 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-semibold"
      >
        {(user.displayName ?? user.email ?? "?").charAt(0).toUpperCase()}
      </Link>
    </header>
  );
}