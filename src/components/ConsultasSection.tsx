import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileText, Loader2, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CadastroForm } from "./CadastroForm";
import { LaudoPrint } from "./LaudoPrint";
import { toast } from "sonner";
import { API_BASE } from "../lib/api-config";

export const ConsultasSection = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [isNavLoading, setIsNavLoading] = useState(false);
  const [printType, setPrintType] = useState<'laudo' | 'saida'>('laudo');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`${API_BASE}/servicos?q=${encodeURIComponent(query)}`);
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
  }, [query]);

  const loadRecord = async (record: any) => {
    try {
      const res = await fetch(`${API_BASE}/servicos/${record.Id_cod}`);
      const fresh = await res.json();
      setSelectedRecord(fresh);
      // Verifica se existem registros adjacentes
      const [prevRes, nextRes] = await Promise.all([
        fetch(`${API_BASE}/servicos/${fresh.Id_cod}/prev`),
        fetch(`${API_BASE}/servicos/${fresh.Id_cod}/next`),
      ]);
      setHasPrev(prevRes.ok);
      setHasNext(nextRes.ok);
    } catch {
      setSelectedRecord(record);
      setHasPrev(false);
      setHasPrev(false);
      setHasNext(false);
    }
    setIsDetailsOpen(true);
  };

  const navigateTo = async (direction: 'prev' | 'next') => {
    if (!selectedRecord) return;
    setIsNavLoading(true);
    try {
      const res = await fetch(`${API_BASE}/servicos/${selectedRecord.Id_cod}/${direction}`);
      if (!res.ok) return;
      const record = await res.json();
      const [prevRes, nextRes] = await Promise.all([
        fetch(`${API_BASE}/servicos/${record.Id_cod}/prev`),
        fetch(`${API_BASE}/servicos/${record.Id_cod}/next`),
      ]);
      setSelectedRecord(record);
      setHasPrev(prevRes.ok);
      setHasNext(nextRes.ok);
    } catch (err) {
      console.error('Erro ao navegar:', err);
    } finally {
      setIsNavLoading(false);
    }
  };

  const handleSelectRecord = async (record: any) => {
    await loadRecord(record);
  };

  return (
    <>
      <Card className="overflow-hidden shadow-[var(--shadow-card)] border-border/60 hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300">
        <div className="h-1 bg-primary" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Consultas</h2>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por ID, Série ou RP..."
                className="pl-10 bg-muted/30 border-border/60 focus:border-primary/40 transition-colors"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
              )}
            </div>

            {/* Lista de Resultados Rápidos */}
            {Array.isArray(results) && results.length > 0 && (
              <div className="rounded-lg border border-border/40 bg-card overflow-hidden divide-y divide-border/20 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300 max-h-[300px] overflow-y-auto custom-scrollbar">
                {results.map((item) => (
                  <button
                    key={item._id}
                    onClick={() => handleSelectRecord(item)}
                    className="w-full text-left p-3 hover:bg-primary/5 transition-colors group flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-foreground">
                        ID: {item.Id_cod} - {item.T_EquipSuporte || item.T_EquipTelecom}
                      </p>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                        {item.Unidade} | Série: {item.Nº_Serie}
                      </p>
                    </div>
                    <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modal de Detalhes Preenchido */}
      <Dialog open={isDetailsOpen} onOpenChange={(open) => {
        setIsDetailsOpen(open);
        if (!open) setTimeout(() => setSelectedRecord(null), 300);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-pmpa-navy/20">
          <DialogHeader className="p-6 pb-2 border-b border-border/50 bg-pmpa-navy/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-pmpa-navy/10 text-pmpa-navy text-[10px] font-bold uppercase tracking-wider">Detalhamento de Registro</span>
            </div>
            <DialogTitle className="text-2xl font-bold text-pmpa-navy leading-tight">
              Equipamento #{selectedRecord?.Id_cod}
            </DialogTitle>
            <DialogDescription>
              Visualizando dados do sistema PMPA / DITEL.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 flex-1 overflow-hidden">
            <CadastroForm
              id="editar-consulta-form"
              initialData={selectedRecord}
              onCancel={() => {
                setIsDetailsOpen(false);
                setTimeout(() => setSelectedRecord(null), 300);
              }}
              onSubmit={async (data) => {
                try {
                  const res = await fetch(
                    `${API_BASE}/servicos/${selectedRecord?.Id_cod}`,
                    {
                      method: "PUT",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(data),
                    }
                  );
                  const result = await res.json();
                  if (result.success) {
                    toast.success(`✅ OS nº ${selectedRecord?.Id_cod} atualizada com sucesso!`);
                    setSelectedRecord(result.record);
                    setResults(prev =>
                      Array.isArray(prev) ? prev.map(r => r.Id_cod === result.record.Id_cod ? result.record : r) : []
                    );
                    setIsDetailsOpen(false);
                    setTimeout(() => setSelectedRecord(null), 300);
                  } else {
                    toast.error("Erro ao salvar: " + (result.error || "Tente novamente."));
                  }
                } catch (err) {
                  toast.error("Erro de conexão com o servidor.");
                }
              }}
            />
            {selectedRecord && <LaudoPrint data={selectedRecord} type={printType} />}
          </div>

          {/* Navegação e Ações no Rodapé do Modal */}
          <div className="p-4 border-t bg-muted/20 flex items-center justify-between gap-4 shrink-0 shadow-inner">
            <Button
              type="submit"
              form="editar-consulta-form"
              className="flex-1 h-14 bg-pmpa-navy hover:bg-pmpa-navy/90 text-white font-black text-xl shadow-lg border-2 border-white/10 uppercase tracking-tight"
            >
              SALVAR OS
            </Button>

            <Button
              variant="outline"
              onClick={() => { setPrintType('laudo'); setTimeout(() => window.print(), 100); }}
              className="flex-1 h-14 gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold text-[13px]"
              title="Gerar Laudo Técnico para Impressão"
            >
              <Printer className="h-6 w-6" />
              <span className="hidden xl:inline">LAUDO TÉCNICO</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => { setPrintType('saida'); setTimeout(() => window.print(), 100); }}
              className="flex-1 h-14 gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold text-[13px]"
              title="Gerar Relatório de Saída"
            >
              <Printer className="h-6 w-6" />
              <span className="hidden xl:inline">SAÍDA EQUIPAM.</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigateTo('next')}
              disabled={!hasNext || isNavLoading}
              className="flex-1 h-14 gap-3 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold text-lg"
              title="Próxima OS"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="h-7 w-7" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
