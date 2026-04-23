import React, { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { 
  Building, 
  Database, 
  FileText, 
  Home, 
  Plus, 
  Search, 
  Wrench,
  Activity,
  LogOut,
  User,
  Settings,
  Loader2,
  Headphones
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE } from "@/lib/api-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { CadastroForm } from "./CadastroForm";
import { toast } from "sonner";
import { LaudoPrint } from "./LaudoPrint";
import { EqSuporteDialog } from "./EqSuporteDialog";
import { EqUnidadeDialog } from "./EqUnidadeDialog";

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // States for the details popup
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [printType, setPrintType] = useState<'laudo' | 'saida' | 'entrada'>('laudo');

  // States for Catalog Dialogs
  const [isSuporteOpen, setIsSuporteOpen] = useState(false);
  const [isUnidadeOpen, setIsUnidadeOpen] = useState(false);

   const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isViewer = user?.papel === 'visualizador';

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Search logic (Debounced)
  useEffect(() => {
    if (search.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("ditel_token");
        const res = await fetch(`${API_BASE}/servicos?q=${encodeURIComponent(search)}&limit=5`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setResults(Array.isArray(data) ? data : []);
        } else {
          setResults([]);
        }
      } catch (error) {
        console.error("Command Search Error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchRecordDetails = async (id: number) => {
    setOpen(false); // Close command menu
    setIsLoadingDetails(true);
    try {
      const token = localStorage.getItem("ditel_token");
      const res = await fetch(`${API_BASE}/servicos/${id}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Erro ao carregar");
      const data = await res.json();
      if (data && data.record) {
        setSelectedRecord(data.record);
        setIsDetailsOpen(true);
      }
    } catch (err) {
      toast.error("Não foi possível carregar os detalhes do equipamento.");
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleUpdateRecord = async (data: any) => {
    if (!selectedRecord) return;
    try {
      const token = localStorage.getItem("ditel_token");
      const res = await fetch(`${API_BASE}/servicos/${selectedRecord.Id_cod}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("✅ Registro atualizado com sucesso!");
        setSelectedRecord(result.record);
      } else {
        toast.error("Erro ao salvar alterações.");
      }
    } catch (err) {
      toast.error("Erro de conexão ao salvar.");
    }
  };

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <>
      <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
        <CommandInput 
          placeholder="O que você está procurando? (Busque ID, RP, Unidade...)" 
          value={search}
          onValueChange={setSearch}
        />
        <CommandList className="max-h-[400px]">
          {isLoading && (
            <div className="p-4 text-center text-sm text-muted-foreground animate-pulse font-bold uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50">
              Buscando dados no servidor...
            </div>
          )}
          <CommandEmpty>
            {!isLoading && "Nenhum resultado encontrado."}
          </CommandEmpty>

          {results.length > 0 && (
            <CommandGroup heading="Equipamentos Encontrados">
              {results.map((item) => (
                <CommandItem
                  key={item.Id_cod}
                  onSelect={() => fetchRecordDetails(item.Id_cod)}
                  className="flex items-center gap-3 py-3"
                >
                  <Database className="h-4 w-4 text-[#004e9a]" />
                  <div className="flex flex-col">
                    <span className="font-bold">OS #{item.Id_cod} - {item.T_EquipSuporte || "Equipamento"}</span>
                    <span className="text-[10px] uppercase text-muted-foreground font-semibold">
                      {item.Unidade} | RP: {item.RP || "N/A"}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          <CommandGroup heading="Atalhos Rápidos">
            <CommandItem onSelect={() => runCommand(() => navigate("/"))}>
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard Principal</span>
              <span className="ml-auto text-[10px] text-muted-foreground">⌘H</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/cadastro"))}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Novo Cadastro de Equipamento</span>
              <span className="ml-auto text-[10px] text-muted-foreground">⌘N</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate("/servico-interno-externo"))}>
              <Activity className="mr-2 h-4 w-4" />
              <span>Gestão de Missões</span>
              <span className="ml-auto text-[10px] text-muted-foreground">⌘M</span>
            </CommandItem>
            {user?.papel === 'admin' && (
              <CommandItem onSelect={() => runCommand(() => navigate("/admin"))}>
                <Shield className="mr-2 h-4 w-4 text-red-500" />
                <span>Administração de Usuários</span>
                <span className="ml-auto text-[10px] text-muted-foreground">⌘A</span>
              </CommandItem>
            )}
            <CommandItem onSelect={() => runCommand(() => setIsSuporteOpen(true))}>
              <Headphones className="mr-2 h-4 w-4" />
              <span>Gerenciar Itens de Suporte</span>
              <span className="ml-auto text-[10px] text-muted-foreground">⌘S</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => setIsUnidadeOpen(true))}>
              <Building className="mr-2 h-4 w-4" />
              <span>Gerenciar Unidades / Siglas</span>
              <span className="ml-auto text-[10px] text-muted-foreground">⌘U</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Sistema">
            <CommandItem onSelect={() => runCommand(() => { logout(); navigate("/login"); })}>
              <LogOut className="mr-2 h-4 w-4 text-red-500" />
              <span>Sair do Sistema</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
        
        <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/20 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
          <span>Ditel / PMPA</span>
          <div className="flex items-center gap-3">
            <span>Esc p/ fechar</span>
            <span>↵ p/ selecionar</span>
          </div>
        </div>
      </CommandDialog>

      {/* Pop-up de Detalhes do Equipamento */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[95vw] md:max-w-4xl p-0 h-[90vh] md:h-auto md:max-h-[95vh] overflow-hidden flex flex-col border-pmpa-navy/20">
          <DialogHeader className="p-4 md:p-6 border-b bg-muted/30 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl md:text-2xl font-black text-pmpa-navy uppercase tracking-tight">
                  Consulta Rápida: OS #{selectedRecord?.Id_cod}
                </DialogTitle>
                <DialogDescription className="text-xs uppercase font-bold tracking-widest text-muted-foreground">
                  Visualização e Edição de Registro via Centro de Comando
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-1 md:p-6 bg-card">
            {selectedRecord && (
              <CadastroForm
                initialData={selectedRecord}
                onSubmit={handleUpdateRecord}
                onCancel={() => setIsDetailsOpen(false)}
                onPrint={(type) => {
                  setPrintType(type);
                  setTimeout(() => window.print(), 100);
                }}
                isEditMode={true}
                readOnly={isViewer}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Impressão Oculta */}
      {selectedRecord && (
        <div className="hidden">
          <LaudoPrint data={selectedRecord} type={printType} />
        </div>
      )}

      {/* Overlay de carregamento ao buscar detalhes */}
      {isLoadingDetails && (
        <div className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 border border-slate-200 dark:border-slate-800">
            <Loader2 className="h-10 w-10 animate-spin text-[#004e9a]" />
            <p className="font-bold text-sm uppercase tracking-widest text-slate-600 dark:text-slate-400">Carregando Ficha...</p>
          </div>
        </div>
      )}

      {/* Catálogos de Equipamentos e Unidades (Renderização condicional para poupar recursos) */}
      {isSuporteOpen && <EqSuporteDialog open={isSuporteOpen} onOpenChange={setIsSuporteOpen} readOnly={isViewer} />}
      {isUnidadeOpen && <EqUnidadeDialog open={isUnidadeOpen} onOpenChange={setIsUnidadeOpen} readOnly={isViewer} />}
    </>
  );
}

