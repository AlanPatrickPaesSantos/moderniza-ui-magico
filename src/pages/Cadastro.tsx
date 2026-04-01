import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/lib/api-config";
import { CadastroForm } from "@/components/CadastroForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Loader2, FileText, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LaudoPrint } from "@/components/LaudoPrint";
import { toast } from "sonner";

const Cadastro = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [hasPrev, setHasPrev] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [printType, setPrintType] = useState<'laudo' | 'saida'>('laudo');
  const [isNavLoading, setIsNavLoading] = useState(false);
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
        console.error("Erro ao buscar:", error);
      } finally {
        setIsLoading(false);
      }
    };
    const timer = setTimeout(fetchResults, 400);
    return () => clearTimeout(timer);
  }, [query]);

  // Carrega um registro e verifica adjacentes
  const loadRecord = async (item: any) => {
    try {
      const res = await fetch(`${API_BASE}/servicos/${item.Id_cod}`);
      const fresh = await res.json();
      setSelectedRecord(fresh);
      const [prevRes, nextRes] = await Promise.all([
        fetch(`${API_BASE}/servicos/${fresh.Id_cod}/prev`),
        fetch(`${API_BASE}/servicos/${fresh.Id_cod}/next`),
      ]);
      setHasPrev(prevRes.ok);
      setHasNext(nextRes.ok);
    } catch {
      setSelectedRecord(item);
      setHasPrev(false);
      setHasNext(false);
    }
    setIsDetailsOpen(true);
    setQuery("");
    setResults([]);
  };

  // Navega para OS anterior ou próxima
  const navigateTo = async (direction: "prev" | "next") => {
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
      console.error("Erro ao navegar:", err);
    } finally {
      setIsNavLoading(false);
    }
  };

  // Salva NOVO equipamento
  const handleSubmit = async (data: any) => {
    try {
      const res = await fetch(`${API_BASE}/servicos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`✅ Equipamento cadastrado! OS nº ${result.os}`);
        navigate("/");
      } else {
        toast.error("Erro ao salvar: " + (result.error || "Tente novamente."));
      }
    } catch (err) {
      toast.error("Erro de conexão com o servidor.");
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-background">
      <div className="flex-1 flex flex-col container mx-auto px-1 py-4 min-h-0">
        {/* Cabeçalho com botão Voltar */}
        <div className="flex items-center gap-4 mb-3 shrink-0">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground leading-tight">Cadastro de Equipamento</h1>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="shrink-0 mb-3 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar cadastro existente por ID, Série ou RP..."
              className="pl-10 pr-10 bg-card border-border/60 shadow-sm focus:border-primary/40 transition-colors h-11"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
            )}
          </div>

          {/* Dropdown de Resultados */}
          {/* Lista de Resultados Rápidos */}
          {Array.isArray(results) && results.length > 0 && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-lg border border-border/40 bg-card shadow-lg overflow-hidden divide-y divide-border/20 max-h-[280px] overflow-y-auto">
              {results.map((item) => (
                <button
                  key={item._id}
                  onClick={async () => { await loadRecord(item); }}
                  className="w-full text-left px-4 py-3 hover:bg-primary/5 transition-colors group flex items-center justify-between"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">
                      ID: {item.Id_cod} — {item.T_EquipSuporte || item.T_EquipTelecom}
                    </p>
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      {item.Unidade} | Série: {item.Nº_Serie}
                    </p>
                  </div>
                  <FileText className="h-4 w-4 text-muted-foreground group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formulário de Novo Cadastro */}
        <div className="bg-card rounded-lg shadow-[var(--shadow-card)] border border-border p-3 flex-1 min-h-0 flex flex-col relative">
          <div className="flex-1 overflow-hidden">
            <CadastroForm
              id="novo-form"
              onSubmit={handleSubmit}
              onCancel={() => navigate("/")}
            />
          </div>

          {/* Botão de Salvar para Novo Cadastro (Fixo na Base do Card) */}
          <div className="mt-2 p-3 border-t bg-muted/5 flex justify-end gap-3 shrink-0">
            <Button variant="outline" onClick={() => navigate("/")} className="h-11 px-6 font-bold">
              Cancelar
            </Button>
            <Button
              type="submit"
              form="novo-form"
              className="bg-pmpa-navy hover:bg-pmpa-navy/90 text-white h-11 px-12 font-bold shadow-lg uppercase"
            >
              Finalizar Novo Cadastro
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Registro Buscado */}
      <Dialog open={isDetailsOpen} onOpenChange={(open) => {
        setIsDetailsOpen(open);
        if (!open) setTimeout(() => setSelectedRecord(null), 300);
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-pmpa-navy/20">
          <DialogHeader className="p-6 pb-2 border-b border-border/50 bg-pmpa-navy/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-pmpa-navy/10 text-pmpa-navy text-[10px] font-bold uppercase tracking-wider">
                Detalhamento de Registro
              </span>
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
              variant="outline"
              onClick={() => navigateTo('prev')}
              disabled={!hasPrev || isNavLoading}
              className="flex-1 h-14 gap-3 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold text-lg"
            >
              <ChevronLeft className="h-7 w-7" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>

            <Button
              type="submit"
              form="editar-form"
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
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="h-7 w-7" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cadastro;
