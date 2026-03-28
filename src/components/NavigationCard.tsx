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
      className="group relative overflow-hidden rounded-xl border border-border/60 bg-card p-5 shadow-[var(--shadow-card)] transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] hover:-translate-y-1 hover:border-primary/20 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] to-gold/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-gold to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <div className="relative flex flex-col items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary/20">
          <Icon className="h-6 w-6" />
        </div>
        <span className="text-sm font-semibold text-foreground">{title}</span>
      </div>
    </button>
  );
};
