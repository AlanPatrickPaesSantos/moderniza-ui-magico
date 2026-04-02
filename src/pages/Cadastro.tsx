import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/lib/api-config";
import { CadastroForm } from "@/components/CadastroForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Loader2, FileText, ChevronLeft, ChevronRight, Printer } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { LaudoPrint } from "@/components/LaudoPrint";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const Cadastro = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [hasPrev, setHasPrev] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [searchParams] = useSearchParams();
  const [printType, setPrintType] = useState<'laudo' | 'saida'>('laudo');
  const [isNavLoading, setIsNavLoading] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Busca automática via URL (ex: Dashboard)
  useEffect(() => {
    const statusParam = searchParams.get("status");
    const startDateParam = searchParams.get("startDate");

    if (statusParam || startDateParam) {
      const autoFetch = async () => {
        setIsLoading(true);
        try {
          // Usando window.location.origin para garantir que a URL seja absoluta e funcione no Render
          const url = new URL(`${API_BASE}/servicos`, window.location.origin);
          if (statusParam) url.searchParams.append("status", statusParam);
          if (startDateParam) url.searchParams.append("startDate", startDateParam);
          
          const response = await fetch(url.toString());
          const data = await response.json();
          setResults(data);
          if (data.length > 0) {
            toast.info(`🛒 Exibindo ${data.length} equipamentos encontrados.`);
          }
        } catch (error) {
          console.error("Erro na busca automática:", error);
        } finally {
          setIsLoading(false);
        }
      };
      autoFetch();
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim().length === 0) {
        // Só limpa se não houver filtro automático do Dashboard ativo
        if (!searchParams.get("status") && !searchParams.get("startDate")) {
          setResults([]);
        }
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
    if (!selectedRecord || isNavLoading) return;
    setIsNavLoading(true);
    try {
      const res = await fetch(`${API_BASE}/servicos/${selectedRecord.Id_cod}/${direction}`);
      if (!res.ok) throw new Error("Registro não encontrado");
      
      const record = await res.json();
      if (!record || !record.Id_cod) throw new Error("Dados inválidos");

      const [prevRes, nextRes] = await Promise.all([
        fetch(`${API_BASE}/servicos/${record.Id_cod}/prev`),
        fetch(`${API_BASE}/servicos/${record.Id_cod}/next`),
      ]);

      setSelectedRecord(record);
      setHasPrev(prevRes.ok);
      setHasNext(nextRes.ok);
    } catch (err) {
      console.error("Erro ao navegar:", err);
      toast.error("Não há mais registros nesta direção.");
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
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col container mx-auto px-4 py-4">
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

          {/* Dropdown de Resultados ou Lista Fixa se filtrado */}
          {Array.isArray(results) && results.length > 0 && (
            <div className={`mt-1 rounded-xl border-2 border-primary/20 bg-card shadow-2xl overflow-hidden divide-y divide-border/20 max-h-[400px] overflow-y-auto mb-4 ${searchParams.get("status") ? "relative border-pmpa-red/30" : "absolute z-50 left-0 right-0 top-full"}`}>
              <div className="bg-muted/30 px-4 py-2 flex justify-between items-center sticky top-0 z-10 backdrop-blur-sm border-b">
                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground">
                  {searchParams.get("status") ? "OS Pendentes Encontradas" : "Resultados da Pesquisa"} ({results.length})
                </span>
                {searchParams.get("status") && (
                   <Button variant="ghost" size="sm" onClick={() => setResults([])} className="h-6 text-[10px] font-bold text-pmpa-red hover:bg-pmpa-red/10">LIMPAR</Button>
                )}
              </div>
              {results.map((item) => (
                <button
                  key={item._id}
                  onClick={async () => { await loadRecord(item); }}
                  className="w-full text-left px-4 py-4 hover:bg-primary/5 transition-all group flex items-center justify-between border-l-4 border-transparent hover:border-primary"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-black text-pmpa-navy dark:text-white flex items-center gap-2">
                       <span className="bg-pmpa-navy/10 px-2 py-0.5 rounded text-[10px]">OS #{item.Id_cod}</span>
                       {item.T_EquipSuporte || item.T_EquipTelecom}
                    </p>
                    <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wide">
                      {item.Unidade} <span className="mx-1 opacity-20">|</span> Série: {item.Nº_Serie} <span className="mx-1 opacity-20">|</span> Técnico: {item.Tecnico || 'N/A'}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <FileText className="h-5 w-5 text-pmpa-navy/30 group-hover:text-primary transition-all" />
                     <span className="text-[9px] font-black text-pmpa-red">ABRIR FICHA</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formulário de Novo Cadastro */}
        <div className="bg-card rounded-lg shadow-[var(--shadow-card)] border border-border p-4 mb-4">
          <div className="mb-4">
            <CadastroForm
              id="novo-form"
              onSubmit={handleSubmit}
              onCancel={() => navigate("/")}
            />
          </div>

          <div className="pt-4 border-t bg-muted/5 flex flex-col sm:flex-row justify-end gap-3">
            <Button variant="outline" onClick={() => navigate("/")} className="h-12 sm:h-11 px-6 font-bold w-full sm:w-auto">
              Cancelar
            </Button>
            <Button
              type="submit"
              form="novo-form"
              className="bg-pmpa-navy hover:bg-pmpa-navy/90 text-white h-12 sm:h-11 px-12 font-bold shadow-lg uppercase w-full sm:w-auto"
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
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[92vh] overflow-hidden flex flex-col p-0 border-pmpa-navy/20">
          <DialogHeader className="p-4 md:p-6 pb-2 border-b border-border/50 bg-pmpa-navy/5">
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-pmpa-navy/10 text-pmpa-navy text-[10px] font-bold uppercase tracking-wider">
                Detalhamento de Registro
              </span>
            </div>
            <DialogTitle className="text-xl md:text-2xl font-bold text-pmpa-navy leading-tight">
              Equipamento #{selectedRecord ? String(selectedRecord.Id_cod) : ""}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Visualizando dados do sistema PMPA / DITEL.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
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
                    toast.success(`✅ OS nº ${selectedRecord ? String(selectedRecord.Id_cod) : ""} atualizada com sucesso!`);
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
          <div className="p-3 md:p-4 border-t bg-muted/20 shrink-0 shadow-inner">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4">
              <Button
                variant="outline"
                onClick={() => navigateTo('prev')}
                disabled={!hasPrev || isNavLoading}
                className="h-12 md:h-14 gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold"
              >
                <ChevronLeft className="h-5 w-5 md:h-7 md:w-7" />
                <span className="text-xs md:text-lg">Anterior</span>
              </Button>

              <Button
                type="submit"
                form="editar-consulta-form"
                className="col-span-2 md:col-span-1 h-12 md:h-14 bg-pmpa-navy hover:bg-pmpa-navy/90 text-white font-black text-lg md:text-xl shadow-lg border-2 border-white/10 uppercase tracking-tight order-first md:order-none"
              >
                SALVAR
              </Button>

              <Button
                variant="outline"
                onClick={() => { setPrintType('laudo'); setTimeout(() => window.print(), 100); }}
                className="h-12 md:h-14 gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold text-[10px] md:text-[13px]"
                title="Gerar Laudo Técnico para Impressão"
              >
                <Printer className="h-4 w-4 md:h-6 md:w-6" />
                <span className="inline text-[9px] md:text-[13px]">LAUDO</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => { setPrintType('saida'); setTimeout(() => window.print(), 100); }}
                className="h-12 md:h-14 gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold text-[10px] md:text-[13px]"
                title="Gerar Relatório de Saída"
              >
                <Printer className="h-4 w-4 md:h-6 md:w-6" />
                <span className="inline text-[9px] md:text-[13px]">SAÍDA</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => navigateTo('next')}
                disabled={!hasNext || isNavLoading}
                className="h-12 md:h-14 gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold"
              >
                <span className="text-xs md:text-lg">Próximo</span>
                <ChevronRight className="h-5 w-5 md:h-7 md:w-7" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cadastro;
