import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Settings } from "lucide-react";

export const RelatoriosSection = () => {
  return (
    <Card className="p-6 shadow-[var(--shadow-card)] border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
          <FileText className="h-5 w-5 text-accent" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Relatórios</h2>
      </div>

      <div className="space-y-3">
        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-auto py-4 hover:bg-accent/5 hover:text-accent hover:border-accent transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Calendar className="h-5 w-5 text-accent" />
          </div>
          <div className="text-left">
            <p className="font-medium">Rel_data_Ser</p>
            <p className="text-xs text-muted-foreground">Relatório por data de serviço</p>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="w-full justify-start gap-3 h-auto py-4 hover:bg-accent/5 hover:text-accent hover:border-accent transition-all"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
            <Settings className="h-5 w-5 text-accent" />
          </div>
          <div className="text-left">
            <p className="font-medium">RelServico</p>
            <p className="text-xs text-muted-foreground">Relatório de serviços</p>
          </div>
        </Button>

        <div className="pt-4 border-t border-border">
          <div className="p-4 rounded-lg bg-muted/50">
            <p className="text-xs font-medium text-foreground mb-2">Baterias</p>
            <div className="h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">75% em operação</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
