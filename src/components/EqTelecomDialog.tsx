import { useState } from "react"; // Final stabilization v33.3
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Phone, Filter, X } from "lucide-react";
import { toast } from "sonner";

interface EqTelecomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EqTelecomDialog = ({ open, onOpenChange }: EqTelecomDialogProps) => {
  const [currentRecord, setCurrentRecord] = useState(1);
  const [totalRecords] = useState(28);
  const [id, setId] = useState("1");
  const [municipalRu, setMunicipalRu] = useState("TV");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  const handleSave = () => {
    toast.success("Dados de Telecomunicações salvos com sucesso.");
  };

  const handleDelete = () => {
    toast.error("Registro de Telecom removido do sistema.");
  };

  const handleSearch = () => {
    if (!searchTerm) return;
    toast.info(`Buscando em Telecom: ${searchTerm}...`);
  };

  const toggleFilter = () => {
    setFilterActive(!filterActive);
    toast(filterActive ? "Filtros desativados" : "Filtros de telecom ativados");
  };

  const goToFirst = () => setCurrentRecord(1);
  const goToPrevious = () => setCurrentRecord(Math.max(1, currentRecord - 1));
  const goToNext = () => setCurrentRecord(Math.min(totalRecords, currentRecord + 1));
  const goToLast = () => setCurrentRecord(totalRecords);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[700px] p-0 overflow-hidden border-slate-200/50 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] backdrop-blur-3xl bg-white/95 dark:bg-slate-900/95 rounded-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#004e9a] to-[#002f5c] p-4 md:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden shadow-inner gap-4">
          <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-end items-center opacity-[0.05]">
             <img src="/logo-pmpa.png" alt="watermark" className="w-64 h-auto scale-150 rotate-12 grayscale" />
          </div>
          <div className="flex items-center gap-3 md:gap-4 relative z-10">
            <div className="p-2 bg-white/10 rounded-lg">
              <Phone className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-lg md:text-xl font-black tracking-tight uppercase">
                Registros de Telecom
              </DialogTitle>
              <p className="text-[9px] md:text-[10px] opacity-70 font-bold uppercase tracking-widest">
                Gestão de Infraestrutura Ditel
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 relative z-10 w-full md:w-auto">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSave}
              className="flex-1 md:flex-none h-9 md:h-10 px-3 md:px-5 font-bold uppercase text-[10px] md:text-[11px] tracking-wider gap-2 shadow-sm bg-blue-500 hover:bg-blue-400 text-white border-blue-400/50 hover:-translate-y-0.5 transition-all rounded-xl"
            >
              <Save className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.5} />
              Salvar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="flex-1 md:flex-none h-9 md:h-10 px-3 md:px-5 font-bold uppercase text-[10px] md:text-[11px] tracking-wider gap-2 shadow-sm rounded-xl transition-all bg-red-500 hover:bg-red-400 hover:-translate-y-0.5 border-red-400/50"
            >
              <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.5} />
              Excluir
            </Button>
            <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors md:hidden"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
          </div>
        </div>

        <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
            <div className="md:col-span-1 space-y-2">
              <Label htmlFor="id" className="text-[10px] md:text-[11px] font-black uppercase text-[#004e9a] dark:text-blue-400 opacity-80 tracking-wider">
                ID_
              </Label>
              <Input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="h-12 md:h-14 font-black text-center bg-slate-100 border-slate-200 text-lg md:text-xl text-slate-500 rounded-xl"
                readOnly
              />
            </div>

            <div className="md:col-span-5 space-y-2">
              <Label htmlFor="municipal" className="text-[10px] md:text-[11px] font-black uppercase text-[#004e9a] dark:text-blue-400 opacity-80 tracking-wider">
                Municipal RU
              </Label>
              <Input
                id="municipal"
                autoFocus
                value={municipalRu}
                onChange={(e) => setMunicipalRu(e.target.value)}
                className="h-12 md:h-14 font-black bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-base md:text-lg text-slate-800 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-[#004e9a]/50 focus-visible:border-[#004e9a] uppercase shadow-inner rounded-xl transition-all"
                placeholder="Identificação Municipal"
              />
            </div>
          </div>

          {/* Navegação e Toolbar de Pesquisa */}
          <div className="pt-4 border-t border-border/50">
            <div className="flex flex-col items-center justify-between gap-6">
              {/* Paginação Estilizada */}
              <div className="flex items-center gap-3 w-full justify-center">
                <div className="flex items-center p-1 bg-muted rounded-xl border border-border/40 shadow-sm w-fit mx-auto md:w-auto justify-center md:justify-start gap-1 md:gap-0">
                  <Button size="icon" variant="ghost" onClick={goToFirst} disabled={currentRecord === 1} className="h-9 w-9 shrink-0 hover:bg-white rounded-lg">
                    <ChevronsLeft className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={goToPrevious} disabled={currentRecord === 1} className="h-9 w-9 shrink-0 hover:bg-white rounded-lg">
                    <ChevronLeft className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                  
                  <div className="px-1.5 md:px-6 flex items-center gap-2 border-x border-border/30 mx-0.5 md:mx-1 shrink-0">
                    <span className="text-sm font-black text-pmpa-navy">{currentRecord}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">de</span>
                    <span className="text-sm font-black text-pmpa-navy opacity-70">{totalRecords}</span>
                  </div>

                  <Button size="icon" variant="ghost" onClick={goToNext} disabled={currentRecord === totalRecords} className="h-9 w-9 shrink-0 hover:bg-white rounded-lg">
                    <ChevronRight className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={goToLast} disabled={currentRecord === totalRecords} className="h-9 w-9 shrink-0 hover:bg-white rounded-lg">
                    <ChevronsRight className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                </div>
              </div>

              {/* Busca e Filtro Corporativo */}
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                    size="sm"
                    variant={filterActive ? "default" : "outline"}
                    onClick={toggleFilter}
                    className={`h-11 px-4 gap-2 font-bold uppercase text-[10px] tracking-widest transition-all rounded-xl shadow-sm ${filterActive ? 'bg-pmpa-navy text-white' : 'border-pmpa-navy/20'}`}
                    >
                    <Filter className="h-3.5 w-3.5" />
                    {filterActive ? "Filtro On" : "Filtro"}
                    </Button>
                    
                    <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 text-sm bg-muted/30 border-border/40 focus:bg-white transition-all rounded-xl"
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                    </div>
                    <Button
                    onClick={handleSearch}
                    className="h-11 bg-pmpa-navy hover:bg-pmpa-navy/90 text-white px-5 font-bold uppercase text-[11px] tracking-widest transition-all shadow-md rounded-xl"
                    >
                    OK
                    </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 px-4 md:px-6 py-4 border-t border-border/50 flex flex-col md:flex-row gap-3 justify-between items-center">
          <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center md:text-left">
            Sistema de Telecomunicações - PMPA / Ditel
          </p>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mt-0.5" />
            <span className="text-[10px] font-bold text-blue-600 uppercase">Rede Ativa</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
