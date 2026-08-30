export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{label}</span>
      {children}
    </label>
  );
}
export const inputCls = "w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800 focus:border-violet-400 dark:focus:border-violet-600";

export function classNames(...xs: Array<string | false | undefined>): string {
  return xs.filter(Boolean).join(" ");
}
