import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ServicoInternoExternoForm } from "@/components/ServicoInternoExternoForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Loader2, Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { MissaoPrint } from "@/components/MissaoPrint";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api-config";

const ServicoInternoExterno = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [hasPrev, setHasPrev] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const [isNavLoading, setIsNavLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  // Busca e carrega a missão pela Lupa ou OS Direta
  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/missoes/${query.trim()}`);
      if (!res.ok) {
        toast.error(`Missão OS ${query} não encontrada.`);
        setSelectedRecord(null);
      } else {
        const data = await res.json();
        // O backend agora retorna { record, hasPrev, hasNext }
        setSelectedRecord(data.record || data);
        setHasPrev(data.hasPrev || false);
        setHasNext(data.hasNext || false);
        toast.success(`Missão OS ${data.record?.os || data.os} encontrada!`);
      }
    } catch {
      toast.error("Erro ao buscar a missão.");
    } finally {
      setIsLoading(false);
      setQuery("");
    }
  };

  // Navega para OS anterior ou próxima (Missões)
  const navigateTo = async (direction: "prev" | "next") => {
    if (!selectedRecord || isNavLoading) return;
    setIsNavLoading(true);
    try {
      const currentOs = selectedRecord.os;
      const res = await fetch(`${API_BASE}/missoes/${currentOs}/${direction}`);
      if (!res.ok) throw new Error("Fim dos registros");
      
      const data = await res.json();
      setSelectedRecord(data.record);
      setHasPrev(data.hasPrev);
      setHasNext(data.hasNext);
    } catch (err) {
      toast.error("Não há mais missões nesta direção.");
    } finally {
      setIsNavLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      let res;
      if (selectedRecord) {
        res = await fetch(`${API_BASE}/missoes/${selectedRecord.os}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } else {
        res = await fetch(`${API_BASE}/missoes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }
      
      const result = await res.json();
      if (res.ok && result.success && result.missao) {
        toast.success(selectedRecord ? `✅ Missão OS ${result.missao.os} atualizada!` : `✅ Missão OS ${result.missao.os} criada com sucesso!`);
        setSelectedRecord(null);
        setHasPrev(false);
        setHasNext(false);
        setResetKey(prev => prev + 1); 
      } else {
        toast.error("Erro ao salvar: " + (result.error || "Tente novamente."));
      }
    } catch (err) {
      toast.error("Erro de conexão.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="flex-1 flex flex-col container mx-auto px-4 py-4 relative">
        
        <div className="flex flex-col md:flex-row items-center gap-4 mb-4 shrink-0">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 -ml-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          
          <div className="flex-1 flex items-center gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-pmpa-navy tracking-tight uppercase leading-tight">Gestão de Missões</h1>
                
                {/* Botões de Navegação Direta no Cabeçalho */}
                <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-border/40 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigateTo('prev')}
                    disabled={!hasPrev || isNavLoading}
                    className="h-8 gap-1 text-pmpa-navy hover:bg-pmpa-navy/10 px-2"
                    title="Registro Anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="font-bold text-[10px] uppercase hidden md:inline">Anterior</span>
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
                    <span className="font-bold text-[10px] uppercase hidden md:inline">Próximo</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-[10px] md:text-sm text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Serviços Internos e Externos</p>
            </div>
          </div>

          <div className="w-full md:w-auto md:min-w-[300px]">
            <div className="relative w-full md:max-w-md md:ml-auto flex items-center shadow-sm">
              <div className="absolute left-3 text-pmpa-navy">
                {isLoading || isNavLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </div>
              <Input
                placeholder="Nº da O.S..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 h-11 border-pmpa-navy/20 focus-visible:ring-pmpa-navy text-lg font-bold w-full"
              />
              <Button onClick={handleSearch} disabled={isLoading || isNavLoading} className="absolute right-1 h-9 rounded bg-pmpa-navy hover:bg-pmpa-navy/90 px-4 font-bold tracking-wider text-white">
                BUSCAR
              </Button>
            </div>
          </div>
        </div>

        {selectedRecord && (
          <div className="mb-3 p-3 bg-blue-50/80 border border-[#004e9a]/20 rounded-xl flex justify-between items-center text-[#004e9a] animate-in slide-in-from-top-2 shadow-sm">
            <div className="font-medium text-sm">
              Editando Missão <strong className="font-black text-pmpa-navy">OS #{selectedRecord.os}</strong>.
            </div>
            <Button variant="outline" size="sm" onClick={() => { setSelectedRecord(null); setHasPrev(false); setHasNext(false); }} className="h-8 border-[#004e9a]/30 hover:bg-[#004e9a]/10 hover:text-pmpa-navy font-bold text-xs">
              Cancelar / Inserir Nova
            </Button>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200/60 dark:border-white/10 p-5 md:p-8 mb-8 transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <ServicoInternoExternoForm 
            key={selectedRecord ? `edit-${selectedRecord.os}` : `new-${resetKey}`}
            id="missao-form"
            initialData={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={() => { navigate("/"); setSelectedRecord(null); }}
            onPrint={handlePrint}
            onNavigate={navigateTo}
            hasPrev={hasPrev}
            hasNext={hasNext}
            isEditMode={!!selectedRecord}
          />
        </div>

        {/* Componente de Impressão */}
        {selectedRecord && <MissaoPrint data={selectedRecord} />}

      </div>
    </div>
  );
};

export default ServicoInternoExterno;
