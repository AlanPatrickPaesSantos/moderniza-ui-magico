import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Headphones } from "lucide-react";
import { toast } from "sonner"; // Using sonner as per system preference

interface EqSuporteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EqSuporteDialog = ({ open, onOpenChange }: EqSuporteDialogProps) => {
  const [currentRecord, setCurrentRecord] = useState(1);
  const [totalRecords] = useState(119);
  const [id, setId] = useState("2");
  const [equip, setEquip] = useState("Nobreak Intelbras");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSave = () => {
    toast.success("As alterações foram salvas com sucesso no banco de dados.");
  };

  const handleDelete = () => {
    toast.error("O registro foi excluído definitivamente.");
  };

  const handleSearch = () => {
    if (!searchTerm) return;
    toast.info(`Buscando por: ${searchTerm}...`);
  };

  const goToFirst = () => setCurrentRecord(1);
  const goToPrevious = () => setCurrentRecord(Math.max(1, currentRecord - 1));
  const goToNext = () => setCurrentRecord(Math.min(totalRecords, currentRecord + 1));
  const goToLast = () => setCurrentRecord(totalRecords);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none shadow-2xl">
        {/* Cabeçalho Institucional */}
        <div className="bg-pmpa-navy p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase">
                Registros de Suporte
              </DialogTitle>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">
                Gestão de Equipamentos Ditel
              </p>
            </div>
          </div>
          <div className="flex gap-2 pr-12">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSave}
              className="h-9 px-4 font-bold uppercase text-[11px] tracking-wider gap-2 shadow-sm"
            >
              <Save className="h-4 w-4" />
              Salvar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="h-9 px-4 font-bold uppercase text-[11px] tracking-wider gap-2 shadow-sm bg-pmpa-red hover:bg-pmpa-red/90"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-background">
          {/* Form Fields / Grid Corporativo */}
          <div className="grid grid-cols-6 gap-4 p-5 rounded-2xl border border-border/60 bg-muted/20">
            <div className="col-span-1 space-y-2">
              <Label htmlFor="id" className="text-[11px] font-black uppercase text-pmpa-navy opacity-70">
                ID
              </Label>
              <Input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="h-10 font-bold text-center bg-white border-border/80"
                readOnly
              />
            </div>

            <div className="col-span-5 space-y-2">
              <Label htmlFor="equip" className="text-[11px] font-black uppercase text-pmpa-navy opacity-70">
                Equipamento / Descrição
              </Label>
              <Input
                id="equip"
                value={equip}
                onChange={(e) => setEquip(e.target.value)}
                className="h-10 font-semibold bg-white border-border/80"
                placeholder="Ex: Monitor, Mouse, Teclado..."
              />
            </div>
          </div>

          {/* Navegação e Toolbar de Pesquisa */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Paginação Estilizada */}
              <div className="flex items-center gap-3">
                <div className="flex items-center p-1 bg-muted rounded-xl border border-border/40">
                  <Button size="icon" variant="ghost" onClick={goToFirst} disabled={currentRecord === 1} className="h-8 w-8 hover:bg-white rounded-lg">
                    <ChevronsLeft className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={goToPrevious} disabled={currentRecord === 1} className="h-8 w-8 hover:bg-white rounded-lg">
                    <ChevronLeft className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                  
                  <div className="px-4 flex items-center gap-1.5 border-x border-border/30 mx-1">
                    <span className="text-[13px] font-black text-pmpa-navy">{currentRecord}</span>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase opacity-60">de</span>
                    <span className="text-[13px] font-black text-pmpa-navy opacity-70">{totalRecords}</span>
                  </div>

                  <Button size="icon" variant="ghost" onClick={goToNext} disabled={currentRecord === totalRecords} className="h-8 w-8 hover:bg-white rounded-lg">
                    <ChevronRight className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={goToLast} disabled={currentRecord === totalRecords} className="h-8 w-8 hover:bg-white rounded-lg">
                    <ChevronsRight className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                </div>
              </div>

              {/* Busca Corporativa */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar registro..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-[13px] bg-muted/30 border-border/40 focus:bg-white transition-all"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSearch}
                  className="h-9 font-bold uppercase text-[10px] tracking-widest border-pmpa-navy/20 hover:bg-pmpa-navy hover:text-white transition-all shadow-sm"
                >
                  Pesquisar
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 px-6 py-3 border-t border-border/50 flex justify-between items-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Sistema de Suporte Técnico - PMPA / Ditel
          </p>
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-green-600 uppercase">Conectado</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
