import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ServicoInternoExternoForm } from "@/components/ServicoInternoExternoForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search, Loader2, Target, Printer } from "lucide-react";
import { MissaoPrint } from "@/components/MissaoPrint";
import { toast } from "sonner";
import { API_BASE } from "@/lib/api-config";

const ServicoInternoExterno = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [resetKey, setResetKey] = useState(0);

  // Busca e carrega a missão pela Lupa
  const handleSearch = async () => {
    if (!query.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/missoes/${query.trim()}`);
      if (!res.ok) {
        toast.error(`Missão OS ${query} não encontrada no banco isolado.`);
        setSelectedRecord(null);
      } else {
        const data = await res.json();
        setSelectedRecord(data);
        toast.success(`Missão OS ${data.os} encontrada!`);
      }
    } catch {
      toast.error("Erro ao buscar a missão.");
    } finally {
      setIsLoading(false);
      setQuery("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleSubmit = async (data: any) => {
    try {
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
        setResetKey(prev => prev + 1); // Força reinício do formulário
      } else {
        toast.error("Erro ao salvar missão: " + (result.error || "Tente novamente."));
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      toast.error("Erro de conexão com o servidor.");
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
          
          <div className="flex items-center gap-3">
            <div className="bg-emerald-100 p-2 rounded-full hidden sm:block">
              <Target className="h-5 w-5 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-pmpa-navy tracking-tight uppercase leading-tight">Gestão de Missões</h1>
              <p className="text-[10px] md:text-sm text-slate-500 font-bold uppercase tracking-widest leading-none">Serviços Internos e Externos</p>
            </div>
          </div>

          <div className="w-full md:flex-1 md:min-w-[300px] md:ml-auto">
            <div className="relative w-full md:max-w-md md:ml-auto flex items-center shadow-sm">
              <div className="absolute left-3 text-pmpa-navy">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </div>
              <Input
                placeholder="Nº da O.S..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-9 h-11 border-pmpa-navy/20 focus-visible:ring-pmpa-navy text-lg font-bold w-full"
              />
              <Button onClick={handleSearch} disabled={isLoading} className="absolute right-1 h-9 rounded bg-pmpa-navy hover:bg-pmpa-navy/90 px-4 font-bold tracking-wider text-white">
                BUSCAR
              </Button>
            </div>
          </div>
        </div>

        {/* Informer Box */}
        {selectedRecord && (
          <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-md flex justify-between items-center text-emerald-800 animate-in slide-in-from-top-2">
            <div className="font-medium text-sm">
              Editando Missão Isolada <b>OS #{selectedRecord.os}</b>.
            </div>
            <Button variant="outline" size="sm" onClick={() => setSelectedRecord(null)} className="h-8 border-emerald-300 hover:bg-emerald-100 font-bold">
              Cancelar / Inserir Nova
            </Button>
          </div>
        )}

        {/* Form Container: Now wrapping content naturally */}
        <div className="bg-card rounded-lg shadow-[var(--shadow-card)] border border-border p-4 md:p-6 mb-8">
          <ServicoInternoExternoForm 
            key={selectedRecord ? `edit-${selectedRecord.os}` : `new-${resetKey}`}
            id="missao-form"
            initialData={selectedRecord}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/")}
            onPrint={handlePrint}
            isEditMode={!!selectedRecord}
          />
        </div>

        {/* Componente de Impressão (Invisível na UI, aparece no Print) */}
        {selectedRecord && <MissaoPrint data={selectedRecord} />}

      </div>
    </div>
  );
};

export default ServicoInternoExterno;
