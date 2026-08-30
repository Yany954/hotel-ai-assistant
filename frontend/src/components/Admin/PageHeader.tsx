function PageHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100">{title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
export default PageHeader;
