import {X} from "lucide-react";
import { classNames } from "./Field";

function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className={classNames(
        "bg-white dark:bg-slate-900 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-h-[90vh] sm:max-h-[85vh] overflow-y-auto",
        wide ? "sm:max-w-2xl" : "sm:max-w-md"
      )}>
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 rounded-t-2xl">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
export default Modal;
