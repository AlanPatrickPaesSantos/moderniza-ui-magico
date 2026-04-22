import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Loader2, ChevronLeft, ChevronRight, Printer, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CadastroForm } from "./CadastroForm";
import { LaudoPrint } from "./LaudoPrint";
import { UnidadeCombobox } from "./UnidadeCombobox";
import { toast } from "sonner";
import { API_BASE } from "../lib/api-config";

export const ConsultasSection = () => {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedUnidade, setSelectedUnidade] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [isNavLoading, setIsNavLoading] = useState(false);
  const [printType, setPrintType] = useState<'laudo' | 'saida' | 'entrada'>('laudo');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0 && !selectedUnidade) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/servicos?q=${encodeURIComponent(query)}&filterType=${filterType}&unidade=${encodeURIComponent(selectedUnidade)}`);
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchResults, 400);
    return () => clearTimeout(debounceTimer);
  }, [query, filterType, selectedUnidade]);

  const loadRecord = async (record: any) => {
    try {
      const res = await fetch(`${API_BASE}/servicos/${record.Id_cod}`);
      if (!res.ok) throw new Error("Erro ao carregar");
      
      const data = await res.json();
      if (!data || !data.record) throw new Error("Dados inválidos");

      setSelectedRecord(data.record);
      setHasPrev(data.hasPrev);
      setHasNext(data.hasNext);
    } catch (err) {
      console.error("Erro ao carregar:", err);
      setSelectedRecord(record);
      setHasPrev(false);
      setHasNext(false);
    }
    setIsDetailsOpen(true);
  };

  const navigateTo = async (direction: 'prev' | 'next') => {
    if (!selectedRecord || isNavLoading) return;
    setIsNavLoading(true);
    try {
      const res = await fetch(`${API_BASE}/servicos/${selectedRecord.Id_cod}/${direction}`);
      if (!res.ok) throw new Error('Registro não encontrado');
      
      const data = await res.json();
      if (data && data.record) {
        setSelectedRecord(data.record);
        setHasPrev(data.hasPrev);
        setHasNext(data.hasNext);
      }
    } catch (err) {
      toast.error("Erro ao navegar");
    } finally {
      setIsNavLoading(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="relative group/input">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within/input:text-[#004e9a]" />
          <Input
            id="consultas-search-input"
            placeholder={filterType === 'all' ? "Buscar por ID, Série, RP, Solicitante..." : "Digite o termo para buscar..."}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-12 pr-16 h-12 text-base border-none shadow-inner w-full rounded-xl bg-slate-50 dark:bg-slate-800 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-[#004e9a]/10"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 p-0 flex items-center justify-center border-none bg-transparent hover:bg-slate-200 dark:hover:bg-slate-700/50 focus:ring-0 shadow-none transition-colors rounded-lg">
              <div className="flex items-center justify-center w-full h-full text-slate-400 hover:text-[#004e9a]">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl backdrop-blur-xl bg-white/95 z-[100] mt-1 mr-2">
              <SelectItem value="all" className="font-bold text-xs py-3 uppercase text-slate-700 focus:bg-blue-50 focus:text-[#004e9a] cursor-pointer"><span className="mr-2 opacity-70">🌐</span> TODAS AS CATEGORIAS</SelectItem>
              <SelectItem value="os" className="font-bold text-xs py-3 uppercase text-slate-700 focus:bg-blue-50 focus:text-[#004e9a] cursor-pointer"><span className="mr-2 opacity-70">🔢</span> NÚMERO DA OS</SelectItem>
              <SelectItem value="serie" className="font-bold text-xs py-3 uppercase text-slate-700 focus:bg-blue-50 focus:text-[#004e9a] cursor-pointer"><span className="mr-2 opacity-70">🔤</span> Nº DE SÉRIE</SelectItem>
              <SelectItem value="rp" className="font-bold text-xs py-3 uppercase text-slate-700 focus:bg-blue-50 focus:text-[#004e9a] cursor-pointer"><span className="mr-2 opacity-70">🏷️</span> NÚMERO DE RP</SelectItem>
              <SelectItem value="unidade" className="font-bold text-xs py-3 uppercase text-slate-700 focus:bg-blue-50 focus:text-[#004e9a] cursor-pointer"><span className="mr-2 opacity-70">🏢</span> UNIDADE / SIGLA</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-5 bg-white/50 dark:bg-slate-900/50 border border-slate-200/40 rounded-2xl animate-pulse">
                <div className="flex justify-between mb-4">
                  <div className="h-6 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
                  <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800/60 rounded" />
                </div>
                <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mb-4" />
                <div className="flex gap-2">
                  <div className="h-4 w-16 bg-slate-100 dark:bg-slate-800 rounded" />
                  <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          results.map((record) => (
            <Card
              key={record.Id_cod}
              className="group p-5 bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden relative"
              onClick={() => loadRecord(record)}
            >
              <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-[#004e9a] to-[#002f5c] opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="flex justify-between items-start mb-3 pl-2">
                <span className="text-[13px] font-black text-white bg-[#004e9a] px-3 py-1 rounded-md shadow-sm tracking-wider">
                  OS #{record.Id_cod}
                </span>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md">
                  {new Date(record.Data_Ent).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-slate-800 text-base mb-3 group-hover:text-[#004e9a] transition-colors truncate pl-2">
                {record.T_EquipSuporte || record.T_EquipTelecom || "Equipamento Indefinido"}
              </h3>
              <div className="flex flex-wrap gap-2 pl-2">
                <span className="text-[11px] bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded-lg font-bold uppercase shadow-sm">
                  RP: {record.RP || "-"}
                </span>
                <span className="text-[11px] bg-blue-50 text-[#004e9a] border border-blue-100 px-2.5 py-1 rounded-lg font-bold uppercase shadow-sm">
                  Unidade: {record.Unidade || "-"}
                </span>
              </div>
            </Card>
          ))
        ) : query.length > 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            <p className="font-bold">Nenhum equipamento encontrado com a busca "{query}"</p>
          </div>
        ) : null}
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 h-[90vh] md:h-auto md:max-h-[95vh] overflow-hidden flex flex-col border-pmpa-navy/20">
          <DialogHeader className="p-3 md:p-6 border-b bg-muted/30 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <DialogTitle className="text-xl md:text-2xl font-black text-pmpa-navy uppercase tracking-tight">
                  Consulta de OS #{selectedRecord?.Id_cod}
                </DialogTitle>
                <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                  Visualização e Edição de Registro
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-1 md:p-6 bg-card">
            {selectedRecord && (
              <CadastroForm
                key={`details-${selectedRecord.Id_cod}`}
                initialData={selectedRecord}
                onSubmit={async (data) => {
                  try {
                    const res = await fetch(`${API_BASE}/servicos/${selectedRecord.Id_cod}`, {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    });
                    const result = await res.json();
                    if (result.success) {
                      toast.success("✅ Registro atualizado!");
                      setSelectedRecord(result.record);
                    } else {
                      toast.error("Erro ao salvar.");
                    }
                  } catch (err) {
                    toast.error("Erro de conexão.");
                  }
                }}
                onCancel={() => setIsDetailsOpen(false)}
                onPrint={(type) => {
                  setPrintType(type);
                  setTimeout(() => window.print(), 100);
                }}
                onNavigate={navigateTo}
                hasPrev={hasPrev}
                hasNext={hasNext}
                isEditMode={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {selectedRecord && (
        <div className="hidden">
          <LaudoPrint data={selectedRecord} type={printType} />
        </div>
      )}
    </div>
  );
};
