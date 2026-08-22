import { Phone, BedDouble, Users, Database, ClipboardList, Sparkles, Lock} from "lucide-react";
import { classNames } from "./Field";
import { NavKey } from "../../types/navigation";

function Sidebar({ active, onNavigate }: { active: NavKey; onNavigate: (k: NavKey) => void }) {
  const items: { key: NavKey; label: string; icon: typeof BedDouble; enabled: boolean }[] = [
    { key: "rooms", label: "Rooms", icon: BedDouble, enabled: true },
    { key: "contacts", label: "Contacts", icon: Phone, enabled: true },
    { key: "procedures", label: "Procedures", icon: ClipboardList, enabled: true },
    { key: "users", label: "Users and Permissions", icon: Users, enabled: true },
  ];
  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="px-5 py-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
          <Sparkles className="text-white" size={18} />
        </div>
        <div>
          <div className="font-semibold text-slate-900 text-sm leading-tight">Front Desk AI</div>
          <div className="text-[11px] text-slate-400 leading-tight">Administration panel</div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              disabled={!item.enabled}
              onClick={() => item.enabled && onNavigate(item.key)}
              className={classNames(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                isActive && "bg-violet-50 text-violet-700 font-medium",
                !isActive && item.enabled && "text-slate-600 hover:bg-slate-50",
                !item.enabled && "text-slate-300 cursor-not-allowed"
              )}
            >
              <Icon size={17} strokeWidth={2} />
              <span className="flex-1 text-left">{item.label}</span>
              {!item.enabled && <Lock size={12} className="text-slate-300" />}
            </button>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-slate-100">
        <div className="text-[11px] text-slate-400">Active pilot</div>
        <div className="text-xs text-slate-600 mt-0.5">Rooms + Contacts</div>
      </div>
    </aside>
  );
}
export default Sidebar;