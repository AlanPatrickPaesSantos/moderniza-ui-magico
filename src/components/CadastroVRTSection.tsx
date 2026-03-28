import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus, ChevronRight } from "lucide-react";

export const CadastroVRTSection = () => {
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden shadow-[var(--shadow-card)] border-border/60 hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300">
      <div className="h-1 bg-gradient-to-r from-gold to-gold-light" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15">
              <Truck className="h-5 w-5 text-gold-dark" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Cadastro VRT</h2>
          </div>
          <Button 
            size="sm" 
            className="gap-1.5 bg-primary hover:bg-primary/90 shadow-sm shadow-primary/20 transition-all"
            onClick={() => navigate("/cadastro-vrt")}
          >
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>

        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/70 border border-transparent hover:border-border/40 transition-all group">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-card border border-border/60 shadow-sm">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-foreground">VTRs</p>
              <p className="text-xs text-muted-foreground">Gerenciar veículos</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>

          <div className="rounded-xl border border-border/40 overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-muted/50 to-muted/20 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="mx-auto mb-3 h-14 w-14 rounded-full bg-primary/5 flex items-center justify-center">
                  <Truck className="h-7 w-7 text-muted-foreground/50" />
                </div>
                <p className="text-xs text-muted-foreground font-medium">Imagem do veículo</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center pt-1">
            Selecione ou adicione um veículo para visualizar detalhes
          </p>
        </div>
      </div>
    </Card>
  );
};
