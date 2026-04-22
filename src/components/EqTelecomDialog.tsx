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
      <DialogContent className="p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950 sm:max-w-[700px] w-[95vw] rounded-3xl max-h-[95vh] flex flex-col">
        {/* CABEÇALHO PREMIUM */}
        <div className="relative bg-[#004e9a] p-5 md:p-8 overflow-hidden shrink-0">
          {/* Botão Fechar Customizado */}
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all active:scale-90"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Efeitos de Fundo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/20 rounded-full blur-2xl -ml-10 -mb-10" />
          
          <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 md:h-14 md:w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                <Phone className="h-6 w-6 md:h-7 md:h-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <DialogTitle className="text-xl md:text-2xl font-black text-white uppercase tracking-tight leading-tight">
                  Telecom
                </DialogTitle>
                <p className="text-[9px] text-blue-100/80 font-black uppercase tracking-[0.2em] mt-0.5">
                  Infraestrutura Ditel
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSave}
                className="h-10 md:h-11 px-6 flex-1 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase text-[9px] md:text-[10px] tracking-widest rounded-xl shadow-lg transition-all active:scale-95"
              >
                <Save className="h-4 w-4 mr-2" strokeWidth={3} />
                Salvar
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* CORPO DO FORMULÁRIO */}
          <div className="p-5 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-4 space-y-3">
              <Label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.1em] ml-1">
                ID do Registro
              </Label>
              <div className="h-14 px-4 flex items-center justify-center bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <span className="text-xl font-black text-[#004e9a] dark:text-blue-400">#{id}</span>
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <Label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.1em] ml-1">
                Municipal RU / Identificação
              </Label>
              <div className="relative group">
                <Input
                  autoFocus
                  value={municipalRu}
                  onChange={(e) => setMunicipalRu(e.target.value)}
                  placeholder="IDENTIFICAÇÃO MUNICIPAL"
                  className="h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-[#004e9a] dark:focus:border-blue-500 rounded-2xl text-lg font-black text-slate-800 dark:text-white transition-all shadow-sm group-hover:shadow-md uppercase"
                />
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#004e9a] transition-colors" />
              </div>
            </div>
          </div>

          {/* CONTROLES DE NAVEGAÇÃO E BUSCA */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-8">
              {/* Navegador */}
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-inner">
                  <Button size="icon" variant="ghost" onClick={goToFirst} disabled={currentRecord === 1} className="h-10 w-10 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                    <ChevronsLeft className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={goToPrevious} disabled={currentRecord === 1} className="h-10 w-10 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                    <ChevronLeft className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                  </Button>
                  
                  <div className="px-6 flex flex-col items-center border-x border-slate-200 dark:border-slate-800 mx-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-[#004e9a] dark:text-blue-400">{currentRecord}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">de</span>
                      <span className="text-sm font-black text-slate-400">{totalRecords}</span>
                    </div>
                  </div>

                  <Button size="icon" variant="ghost" onClick={goToNext} disabled={currentRecord === totalRecords} className="h-10 w-10 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                    <ChevronRight className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={goToLast} disabled={currentRecord === totalRecords} className="h-10 w-10 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                    <ChevronsRight className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                  </Button>
                </div>
              </div>

              {/* Barra de Busca */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Input
                    placeholder="BUSCAR EM TELECOM..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-12 pl-12 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold uppercase transition-all focus:ring-0"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#004e9a]" />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filterActive ? "default" : "outline"}
                        onClick={toggleFilter}
                        className={`h-12 px-4 gap-2 font-bold uppercase text-[10px] tracking-widest transition-all rounded-xl shadow-sm ${filterActive ? 'bg-pmpa-navy text-white' : 'border-slate-200'}`}
                    >
                        <Filter className="h-4 w-4" />
                    </Button>
                    <Button
                    onClick={handleSearch}
                    className="h-12 px-8 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black uppercase text-[11px] tracking-widest rounded-xl transition-all active:scale-95"
                    >
                    Pesquisar
                    </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ STATUS */}
        <div className="bg-slate-100/50 dark:bg-slate-900/50 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest rounded-lg h-8"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Excluir Registro
            </Button>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200/50 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  Rede Ativa
                </span>
             </div>
          </div>
           </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
