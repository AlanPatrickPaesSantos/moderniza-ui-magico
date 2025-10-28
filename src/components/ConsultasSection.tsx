import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Radio, Clipboard } from "lucide-react";

export const ConsultasSection = () => {
  return (
    <Card className="p-6 shadow-[var(--shadow-card)] border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Search className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Consultas</h2>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar equipamentos..." 
            className="pl-10 bg-background border-border"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="justify-start gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary transition-all">
            <FileText className="h-4 w-4" />
            Garantia
          </Button>
          <Button variant="outline" className="justify-start gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary transition-all">
            <Radio className="h-4 w-4" />
            Cons_Rádios
          </Button>
          <Button variant="outline" className="justify-start gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary transition-all">
            <Clipboard className="h-4 w-4" />
            Pesquisa
          </Button>
          <Button variant="outline" className="justify-start gap-2 hover:bg-primary/5 hover:text-primary hover:border-primary transition-all">
            <Radio className="h-4 w-4" />
            Cons_rádio_unidade
          </Button>
        </div>

        <div className="pt-4 border-t border-border">
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" variant="secondary" className="hover:bg-secondary/80">ConstsRF</Button>
            <Button size="sm" variant="secondary" className="hover:bg-secondary/80">ConstsOS</Button>
            <Button size="sm" variant="secondary" className="hover:bg-secondary/80">Rel Geral</Button>
            <Button size="sm" variant="secondary" className="hover:bg-secondary/80">Unidade</Button>
            <Button size="sm" variant="secondary" className="hover:bg-secondary/80">Serviços</Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
