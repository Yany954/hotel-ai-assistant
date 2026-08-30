import { useState } from "react";
import { Phone, BedDouble, Users, ClipboardList, Sparkles, Lock, Menu, X } from "lucide-react";
import { classNames } from "./Field";
import { NavKey } from "../../types/navigation";

function Sidebar({ active, onNavigate }: { active: NavKey; onNavigate: (k: NavKey) => void }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const items: { key: NavKey; label: string; icon: typeof BedDouble; enabled: boolean }[] = [
    { key: "rooms", label: "Rooms", icon: BedDouble, enabled: true },
    { key: "contacts", label: "Contacts", icon: Phone, enabled: true },
    { key: "procedures", label: "Procedures", icon: ClipboardList, enabled: true },
    { key: "users", label: "Users and Permissions", icon: Users, enabled: true },
  ];

  function navigate(key: NavKey) {
    onNavigate(key);
    setMobileOpen(false);
  }

  const nav = (
    <nav className="flex-1 px-3 py-2 space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.key;
        return (
          <button
            key={item.key}
            disabled={!item.enabled}
            onClick={() => item.enabled && navigate(item.key)}
            className={classNames(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
              isActive && "bg-violet-50 text-violet-700 font-medium dark:bg-violet-500/15 dark:text-violet-300",
              !isActive && item.enabled && "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800",
              !item.enabled && "text-slate-300 cursor-not-allowed dark:text-slate-600"
            )}
          >
            <Icon size={17} strokeWidth={2} />
            <span className="flex-1 text-left">{item.label}</span>
            {!item.enabled && <Lock size={12} className="text-slate-300 dark:text-slate-600" />}
          </button>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="px-5 py-6 flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shrink-0">
        <Sparkles className="text-white" size={18} />
      </div>
      <div>
        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm leading-tight">Front Desk AI</div>
        <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">Administration panel</div>
      </div>
    </div>
  );

  const footer = (
    <div className="px-5 py-4 border-t border-slate-100 dark:border-slate-800">
      <div className="text-[11px] text-slate-400 dark:text-slate-500">Active pilot</div>
      <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">Rooms + Contacts + Procedures</div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar with menu toggle — the sidebar itself becomes a drawer below sm */}
      <div className="sm:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
            <Sparkles className="text-white" size={15} />
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {items.find((i) => i.key === active)?.label ?? "Admin"}
          </span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-slate-500 dark:text-slate-400 p-1">
          <Menu size={20} />
        </button>
      </div>

      {mobileOpen && (
        <div className="sm:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-slate-900/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 max-w-[80vw] bg-white dark:bg-slate-900 flex flex-col h-full">
            <div className="flex items-center justify-between pr-3">
              {brand}
              <button onClick={() => setMobileOpen(false)} className="text-slate-400"><X size={18} /></button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden sm:flex w-64 shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-full">
        {brand}
        {nav}
        {footer}
      </aside>
    </>
  );
}
export default Sidebar;
