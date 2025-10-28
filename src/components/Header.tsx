import { Building2, User } from "lucide-react";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
            <Building2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">PMPA</h1>
            <p className="text-xs text-muted-foreground">Suporte e Telecom</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Banco de dados</span>
          </div>
        </div>
      </div>
    </header>
  );
};
