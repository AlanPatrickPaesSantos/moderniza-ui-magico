import { LucideIcon } from "lucide-react";

interface NavigationCardProps {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
}

export const NavigationCard = ({ icon: Icon, title, onClick }: NavigationCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/60 dark:border-white/10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_15px_35px_rgba(0,78,154,0.15)] hover:-translate-y-1.5 hover:border-[#004e9a]/30 outline-none focus-visible:ring-2 focus-visible:ring-[#004e9a]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#004e9a]/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#004e9a] to-[#002f5c] opacity-0 group-hover:opacity-100 transition-all duration-500 transform origin-left scale-x-0 group-hover:scale-x-100" />

      <div className="relative flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 dark:bg-white/5 text-[#004e9a] dark:text-blue-400 transition-all duration-500 group-hover:bg-[#004e9a] group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_8px_20px_rgba(0,78,154,0.3)]">
          <Icon className="h-7 w-7" strokeWidth={2} />
        </div>
        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#004e9a] dark:group-hover:text-blue-400 transition-colors tracking-wide">{title}</span>
      </div>
    </button>
  );
};
