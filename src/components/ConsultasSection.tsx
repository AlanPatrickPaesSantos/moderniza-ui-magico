import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Radio, Clipboard } from "lucide-react";

export const ConsultasSection = () => {
  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)] border-border/60 hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300">
      <div className="h-1 bg-gradient-to-r from-primary to-primary/60" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Search className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Consultas</h2>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Buscar equipamentos..." 
              className="pl-10 bg-muted/30 border-border/60 focus:border-primary/40 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: FileText, label: "Garantia" },
              { icon: Radio, label: "Cons_Rádios" },
              { icon: Clipboard, label: "Pesquisa" },
              { icon: Radio, label: "Cons_rádio_unidade" },
            ].map((item) => (
              <Button 
                key={item.label}
                variant="outline" 
                className="justify-start gap-2 h-10 border-border/60 hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all text-sm"
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            ))}
          </div>

          <div className="pt-3 border-t border-border/40">
            <div className="flex gap-2 flex-wrap">
              {["ConstsRF", "ConstsOS", "Rel Geral", "Unidade", "Serviços"].map((label) => (
                <Button 
                  key={label} 
                  size="sm" 
                  variant="secondary" 
                  className="text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
