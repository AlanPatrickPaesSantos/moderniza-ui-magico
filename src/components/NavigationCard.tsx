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
      className="group relative overflow-hidden rounded-xl border-[1.5px] border-border bg-card p-5 shadow-sm transition-all duration-500 hover:shadow-xl hover:-translate-y-1 hover:border-pmpa-gold/30 outline-none focus-visible:ring-2 focus-visible:ring-pmpa-gold focus-visible:ring-offset-2"
    >
      <div className="absolute inset-0 bg-pmpa-navy/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-pmpa-gold opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pmpa-navy/10 text-pmpa-navy transition-all duration-500 group-hover:bg-pmpa-navy group-hover:text-white group-hover:scale-110 group-hover:shadow-[0_8px_30px_rgb(0,31,61,0.2)]">
          <Icon className="h-7 w-7" />
        </div>
        <span className="text-sm font-bold text-foreground group-hover:text-pmpa-navy transition-colors">{title}</span>
      </div>
    </button>
  );
};
