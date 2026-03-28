import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Settings, ChevronRight } from "lucide-react";

export const RelatoriosSection = () => {
  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)] border-border/60 hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300">
      <div className="h-1 bg-gradient-to-r from-primary via-gold to-primary" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-bold text-foreground tracking-tight">Relatórios</h2>
        </div>

        <div className="space-y-3">
          {[
            { icon: Calendar, title: "Rel_data_Ser", desc: "Relatório por data de serviço" },
            { icon: Settings, title: "RelServico", desc: "Relatório de serviços" },
          ].map((item) => (
            <Button 
              key={item.title}
              variant="outline" 
              className="w-full justify-start gap-3 h-auto py-3.5 border-border/60 hover:bg-primary/5 hover:border-primary/20 transition-all group"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="text-left flex-1">
                <p className="font-semibold text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          ))}

          <div className="pt-3 border-t border-border/40">
            <div className="p-4 rounded-xl bg-muted/40">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-foreground">Baterias</p>
                <span className="text-xs font-bold text-primary">75%</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-gradient-to-r from-primary to-gold rounded-full transition-all duration-1000" />
              </div>
              <p className="text-[11px] text-muted-foreground mt-2">75% em operação</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
