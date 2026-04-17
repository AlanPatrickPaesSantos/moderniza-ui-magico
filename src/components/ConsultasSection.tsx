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

  useEffect(() => {
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

    const debounceTimer = setTimeout(fetchResults, 400);
    return () => clearTimeout(debounceTimer);
  }, [query, filterType]);

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
      <div className="bg-card rounded-lg p-3 md:p-4 border border-border/50 shadow-sm mb-4">
        <div className="flex flex-col md:flex-row gap-2 relative">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-[180px] h-10 md:h-12 border-pmpa-navy/20 font-bold text-pmpa-navy bg-muted/20 focus:ring-pmpa-navy uppercase text-[11px] md:text-xs tracking-wider shrink-0">
              <SelectValue placeholder="Filtro" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-semibold text-xs">🌐 TODAS AS CATEGORIAS</SelectItem>
              <SelectItem value="os" className="font-semibold text-xs">🔢 NÚMERO DA OS</SelectItem>
              <SelectItem value="serie" className="font-semibold text-xs">🔤 Nº DE SÉRIE</SelectItem>
              <SelectItem value="rp" className="font-semibold text-xs">🏷️ NÚMERO DE RP</SelectItem>
              <SelectItem value="unidade" className="font-semibold text-xs">🏢 UNIDADE / SIGLA</SelectItem>
            </SelectContent>
          </Select>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder={filterType === 'all' ? "Buscar por ID, Série, RP, Unidade..." : "Digite o termo para buscar no filtro..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-10 md:h-12 text-base font-medium border-pmpa-navy/20 focus-visible:ring-pmpa-navy shadow-inner w-full"
            />
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
              className="group p-4 hover:shadow-md transition-all cursor-pointer border-l-4 border-l-pmpa-navy hover:bg-muted/30"
              onClick={() => loadRecord(record)}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-black text-pmpa-navy bg-pmpa-navy/5 px-2 py-0.5 rounded">
                  OS #{record.Id_cod}
                </span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  {new Date(record.Data_Ent).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-bold text-foreground mb-1 group-hover:text-pmpa-navy transition-colors truncate">
                {record.T_EquipSuporte || record.T_EquipTelecom}
              </h3>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold uppercase">
                  RP: {record.RP || "-"}
                </span>
                <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-bold uppercase">
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
