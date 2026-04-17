import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Loader2, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CadastroForm } from "./CadastroForm";
import { LaudoPrint } from "./LaudoPrint";
import { toast } from "sonner";
import { API_BASE } from "../lib/api-config";

export const ConsultasSection = () => {
  const [query, setQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [isNavLoading, setIsNavLoading] = useState(false);
  const [printType, setPrintType] = useState<'laudo' | 'saida' | 'entrada'>('laudo');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchResults = async () => {
    if (query.trim().length === 0) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/servicos?q=${encodeURIComponent(query)}&filterType=${filterType}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchResults();
    }
  };

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
    <div className="space-y-6">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-full p-2 border border-slate-200/80 dark:border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] mb-8 transition-all hover:shadow-[0_15px_40px_rgba(0,78,154,0.08)] group focus-within:ring-4 focus-within:ring-[#004e9a]/10">
        <div className="flex flex-col md:flex-row gap-2 relative">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px] h-12 md:h-[52px] border-none font-bold text-[#004e9a] dark:text-blue-400 bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 focus:ring-0 uppercase text-[10px] md:text-xs tracking-widest shrink-0 rounded-full transition-all px-6">
              <SelectValue placeholder="Filtrar por..." />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-slate-200 shadow-2xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 p-2">
              <SelectItem value="all" className="font-bold text-[11px] py-3 px-4 uppercase text-slate-700 dark:text-slate-300 focus:bg-[#004e9a] focus:text-white rounded-xl cursor-pointer transition-colors"><span className="mr-3">🌐</span> TUDO</SelectItem>
              <SelectItem value="os" className="font-bold text-[11px] py-3 px-4 uppercase text-slate-700 dark:text-slate-300 focus:bg-[#004e9a] focus:text-white rounded-xl cursor-pointer transition-colors mt-1"><span className="mr-3">🔢</span> NÚMERO DA OS</SelectItem>
              <SelectItem value="serie" className="font-bold text-[11px] py-3 px-4 uppercase text-slate-700 dark:text-slate-300 focus:bg-[#004e9a] focus:text-white rounded-xl cursor-pointer transition-colors mt-1"><span className="mr-3">🔤</span> Nº DE SÉRIE</SelectItem>
              <SelectItem value="rp" className="font-bold text-[11px] py-3 px-4 uppercase text-slate-700 dark:text-slate-300 focus:bg-[#004e9a] focus:text-white rounded-xl cursor-pointer transition-colors mt-1"><span className="mr-3">🏷️</span> NÚMERO DE RP</SelectItem>
              <SelectItem value="unidade" className="font-bold text-[11px] py-3 px-4 uppercase text-slate-700 dark:text-slate-300 focus:bg-[#004e9a] focus:text-white rounded-xl cursor-pointer transition-colors mt-1"><span className="mr-3">🏢</span> UNIDADE / SIGLA</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 absolute left-[185px] top-1/2 -translate-y-1/2 hidden md:block" />

          <div className="relative flex-1 group/input flex items-center">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 transition-colors group-focus-within/input:text-[#004e9a]" />
            <Input
              placeholder={filterType === 'all' ? "Digite para buscar no sistema..." : "Digite o termo para buscar..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-12 pr-32 h-12 md:h-[52px] text-sm font-medium border-none focus-visible:ring-0 w-full rounded-full bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            />
            <div className="absolute right-1 top-1 bottom-1">
              <Button 
                onClick={fetchResults}
                className="h-full rounded-full bg-gradient-to-r from-[#004e9a] to-[#002f5c] hover:from-blue-600 hover:to-[#004e9a] text-white px-6 font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                Pesquisar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full py-12 flex flex-col items-center justify-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="font-bold">Buscando dados no sistema...</p>
          </div>
        ) : results.length > 0 ? (
          results.map((record) => (
            <Card
              key={record.Id_cod}
              className="group p-5 bg-white border border-slate-200/60 rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_15px_35px_rgba(0,78,154,0.12)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer overflow-hidden relative"
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
