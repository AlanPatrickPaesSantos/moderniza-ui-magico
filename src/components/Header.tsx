import { Shield } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-effect">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <img src="/pmpa-brasao.webp" alt="Brasão PMPA" className="h-11 w-11 object-contain" />
          <div>
            <h1 className="text-lg font-bold tracking-tight text-foreground">PMPA</h1>
            <p className="text-[11px] font-medium text-muted-foreground tracking-wide uppercase">Suporte & Telecom</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full bg-primary/5 border border-primary/10 px-4 py-2 transition-colors hover:bg-primary/10">
            <Shield className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Sistema</span>
          </div>
        </div>
      </div>
    </header>
  );
};
