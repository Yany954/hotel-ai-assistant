import { Plus} from "lucide-react";
function PrimaryButton({ children, onClick, icon: Icon }: { children: React.ReactNode; onClick: () => void; icon?: typeof Plus }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-sm w-full sm:w-auto"
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}
export default PrimaryButton;
