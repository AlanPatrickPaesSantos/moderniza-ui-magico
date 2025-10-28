import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface NavigationCardProps {
  icon: LucideIcon;
  title: string;
  onClick?: () => void;
}

export const NavigationCard = ({ icon: Icon, title, onClick }: NavigationCardProps) => {
  return (
    <Card 
      className="group relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-[var(--shadow-elegant)] bg-card border-border"
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative p-6 flex flex-col items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-7 w-7 text-primary-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground text-center">{title}</h3>
      </div>
    </Card>
  );
};
