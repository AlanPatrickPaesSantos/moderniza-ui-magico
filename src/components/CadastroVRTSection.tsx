import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, Plus } from "lucide-react";

export const CadastroVRTSection = () => {
  const navigate = useNavigate();

  return (
    <>
      <Card className="p-6 shadow-[var(--shadow-card)] border-border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Truck className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-xl font-semibold text-foreground">Cadastro VRT</h2>
          </div>
          <Button 
            size="sm" 
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            onClick={() => navigate("/cadastro")}
          >
            <Plus className="h-4 w-4" />
            Novo
          </Button>
        </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-background border border-border">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">VTRs</p>
            <p className="text-xs text-muted-foreground">Gerenciar veículos</p>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-hidden bg-muted/30">
          <div className="aspect-video bg-gradient-to-br from-muted to-background flex items-center justify-center">
            <div className="text-center p-8">
              <Truck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-sm text-muted-foreground">Imagem do veículo</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Selecione ou adicione um veículo para visualizar detalhes
        </p>
      </div>
    </Card>
    </>
  );
};
