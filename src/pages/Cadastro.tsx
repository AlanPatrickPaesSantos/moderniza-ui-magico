import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "@/lib/api-config";
import { CadastroForm } from "@/components/CadastroForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Loader2, FileText, ChevronLeft, ChevronRight, Printer } from "lucide-react";
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
  const [novoFormKey, setNovoFormKey] = useState(0);

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
      if (!res.ok) throw new Error("Falha ao carregar registro");
      
      const data = await res.json();
      if (!data || !data.record) throw new Error("Dados inválidos");

      setSelectedRecord(data.record);
      setHasPrev(data.hasPrev);
      setHasNext(data.hasNext);
    } catch (err) {
      console.error("Erro ao carregar:", err);
      setSelectedRecord(item);
      setHasPrev(false);
      setHasNext(false);
    }
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
      
      const data = await res.json();
      if (!data || !data.record) throw new Error("Dados inválidos");

      setSelectedRecord(data.record);
      setHasPrev(data.hasPrev);
      setHasNext(data.hasNext);
    } catch (err) {
      console.error("Erro ao navegar:", err);
      toast.error("Não há mais registros nesta direção.");
    } finally {
      setIsNavLoading(false);
    }
  };

  // Salva NOVO equipamento ou ATUALIZA existente
  const handleSubmit = async (data: any) => {
    const isEditing = !!selectedRecord;
    const url = isEditing ? `${API_BASE}/servicos/${selectedRecord.Id_cod}` : `${API_BASE}/servicos`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success(isEditing ? `✅ OS nº ${selectedRecord.Id_cod} atualizada!` : `✅ Equipamento cadastrado! OS nº ${result.os}`);
        if (!isEditing) {
          setNovoFormKey(prev => prev + 1);
          setSelectedRecord(null);
        } else {
          setSelectedRecord(result.record);
        }
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
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 mb-3 shrink-0">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-foreground leading-tight">Equipamentos</h1>
          </div>

          {/* Botões de Navegação Direta */}
          <div className="flex items-center gap-2 bg-muted/30 p-1 rounded-lg border border-border/40">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('prev')}
              disabled={!hasPrev || isNavLoading}
              className="h-8 gap-1 text-pmpa-navy hover:bg-pmpa-navy/10 px-2"
              title="Registro Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="font-bold text-[10px] uppercase">Anterior</span>
            </Button>
            
            <div className="w-px h-4 bg-border/60 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('next')}
              disabled={!hasNext || isNavLoading}
              className="h-8 gap-1 text-pmpa-navy hover:bg-pmpa-navy/10 px-2"
              title="Próximo Registro"
            >
              <span className="font-bold text-[10px] uppercase">Próximo</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <div className="shrink-0 mb-3 relative">
          <div className="flex items-center gap-2">
            <Button 
               variant={!selectedRecord ? "secondary" : "ghost"}
               size="sm"
               onClick={() => {
                 setSelectedRecord(null);
                 setNovoFormKey(prev => prev + 1);
                 setHasPrev(false);
                 setHasNext(false);
               }}
               className="h-8 gap-1 font-bold text-[10px] uppercase border"
            >
              Novo
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por ID, Série ou RP..."
                className="pl-10 pr-10 bg-card border-border/60 shadow-sm focus:border-primary/40 transition-colors h-11"
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-primary" />
              )}
            </div>
          </div>

          {/* Dropdown de Resultados */}
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

        {/* Formulário Principal */}
        <div className="bg-card rounded-lg shadow-[var(--shadow-card)] border border-border p-4 mb-4">
          <div className="mb-4">
            <CadastroForm
              key={selectedRecord ? `edit-${selectedRecord.Id_cod}` : `new-${novoFormKey}`}
              id="novo-form"
              initialData={selectedRecord}
              onSubmit={handleSubmit}
              onCancel={() => navigate("/")}
              onPrint={(type) => { setPrintType(type); setTimeout(() => window.print(), 100); }}
              onNavigate={navigateTo}
              hasPrev={hasPrev}
              hasNext={hasNext}
              isEditMode={!!selectedRecord}
            />
          </div>
        </div>

        {/* Renderização do Laudo para Impressão */}
        {selectedRecord && <div className="hidden"><LaudoPrint data={selectedRecord} type={printType} /></div>}
      </div>
    </div>
  );
};

export default Cadastro;
