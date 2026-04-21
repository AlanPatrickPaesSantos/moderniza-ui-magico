import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Building, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "../lib/api-config";

interface EqUnidadeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EqUnidadeDialog = ({ open, onOpenChange }: EqUnidadeDialogProps) => {
  const [unidades, setUnidades] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const [id, setId] = useState<string | number>("");
  const [sigla, setSigla] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const fetchUnidades = useCallback(async (query = "") => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const authHeaders: any = {};
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(`${API_BASE}/unidades/list${query ? `?q=${query}` : ''}`, {
        headers: authHeaders
      });
      
      if (!res.ok) throw new Error("Erro ao carregar unidades");
      
      const data = await res.json();
      setUnidades(data);
      if (data.length > 0) {
        setCurrentIndex(0);
        loadRecordToState(data[0]);
      } else {
        clearForm(true);
      }
    } catch (err) {
      toast.error("Falha ao carregar as unidades");
      setUnidades([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchUnidades();
    }
  }, [open, fetchUnidades]);

  const loadRecordToState = (record: any) => {
    setId(record.ID_UNID_SEÇÃO);
    setSigla(record.UNIDADE);
  };

  const clearForm = async (keepLoadingNextId = false) => {
    setSigla("");
    if (!keepLoadingNextId) {
      try {
        const token = localStorage.getItem('token');
        const authHeaders: any = {};
        if (token) authHeaders['Authorization'] = `Bearer ${token}`;
        
        const res = await fetch(`${API_BASE}/unidades/next-id`, {
          headers: authHeaders
        });
        const data = await res.json();
        setId(data.nextId);
      } catch (e) {
        setId("");
      }
    } else {
      setId("");
    }
  };

  const handleNovo = () => {
    setSearchTerm(""); // Limpa a busca ao criar novo para evitar confusão
    fetchUnidades("").then(() => clearForm(false));
  };

  const handleSave = async () => {
    if (!sigla.trim()) {
      toast.error("A sigla da unidade é obrigatória");
      return;
    }
    
    setIsSaving(true);
    const token = localStorage.getItem('token');
    const authHeaders: any = { 'Content-Type': 'application/json' };
    if (token) authHeaders['Authorization'] = `Bearer ${token}`;
    
    try {
      const isExisting = unidades.some(u => u.ID_UNID_SEÇÃO === id);
      const method = isExisting ? 'PUT' : 'POST';
      const url = isExisting 
        ? `${API_BASE}/unidades/${id}`
        : `${API_BASE}/unidades`;

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify({ UNIDADE: sigla })
      });
      
      const result = await res.json();
      
      if (!res.ok) {
        throw new Error(result.error || "Erro ao salvar unidade");
      }
      
      toast.success("Unidade salva com sucesso!");
      await fetchUnidades(searchTerm);
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !unidades.some(u => u.ID_UNID_SEÇÃO === id)) {
      toast.error("Este é um novo registro, ainda não foi salvo.");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    setConfirmOpen(false);
    setIsDeleting(true);
    const token = localStorage.getItem('token');
    const authHeaders: any = {};
    if (token) authHeaders['Authorization'] = `Bearer ${token}`;
    
    try {
      const res = await fetch(`${API_BASE}/unidades/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao excluir");
      
      toast.success("Unidade excluída!");
      
      // Se não sobrou nenhum registro na busca atual, recarrega tudo
      if (unidades.length <= 1 && searchTerm) {
        setSearchTerm("");
        await fetchUnidades("");
      } else {
        await fetchUnidades(searchTerm);
      }
      
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = () => {
    fetchUnidades(searchTerm);
  };

  const goToFirst = () => {
    if (unidades.length > 0) {
      setCurrentIndex(0);
      loadRecordToState(unidades[0]);
    }
  };
  
  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      loadRecordToState(unidades[newIndex]);
    }
  };
  
  const goToNext = () => {
    if (currentIndex < unidades.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      loadRecordToState(unidades[newIndex]);
    }
  };
  
  const goToLast = () => {
    if (unidades.length > 0) {
      const newIndex = unidades.length - 1;
      setCurrentIndex(newIndex);
      loadRecordToState(unidades[newIndex]);
    }
  };

  const totalRecords = unidades.length;
  const currentDisplayRecord = totalRecords === 0 ? 0 : currentIndex + 1;
  const isNewRecord = !unidades.some(u => u.ID_UNID_SEÇÃO === id);

  return (
    <>
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden border-none shadow-[0_0_50px_rgba(0,0,0,0.3)] bg-white dark:bg-slate-950 sm:max-w-[700px] w-[95vw] rounded-3xl">
        {/* CABEÇALHO PREMIUM */}
        <div className="relative bg-[#004e9a] p-6 md:p-8 overflow-hidden">
          {/* Efeitos de Fundo */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/20 rounded-full blur-2xl -ml-10 -mb-10" />
          <img 
            src="/logo-pmpa.png" 
            alt="PMPA" 
            className="absolute right-[-20px] top-1/2 -translate-y-1/2 h-[150%] opacity-[0.07] pointer-events-none grayscale brightness-200 rotate-12" 
          />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-500">
                <Building className="h-7 w-7 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight leading-tight">
                  Unidades
                </DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-[10px] text-blue-100/80 font-black uppercase tracking-[0.2em]">
                    Gestão Institucional PMPA
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:mr-8">
              <Button
                onClick={handleNovo}
                className="h-11 px-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase text-[10px] tracking-widest rounded-xl backdrop-blur-md transition-all active:scale-95"
              >
                <Plus className="h-4 w-4 mr-2" strokeWidth={3} /> Novo
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-11 px-6 bg-blue-500 hover:bg-blue-400 text-white font-black uppercase text-[10px] tracking-widest rounded-xl shadow-[0_4px_15px_rgba(59,130,246,0.4)] transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" strokeWidth={3} />}
                Salvar
              </Button>
            </div>
          </div>
        </div>

        {/* CORPO DO FORMULÁRIO */}
        <div className="p-6 md:p-8 space-y-8 bg-slate-50/50 dark:bg-slate-950/50">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            <div className="md:col-span-4 space-y-3">
              <Label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.1em] ml-1">
                ID do Registro
              </Label>
              <div className="h-14 px-4 flex items-center justify-center bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
                <span className="text-xl font-black text-[#004e9a] dark:text-blue-400">#{id}</span>
              </div>
            </div>

            <div className="md:col-span-8 space-y-3">
              <Label className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.1em] ml-1">
                Sigla / Identificação da Unidade
              </Label>
              <div className="relative group">
                <Input
                  autoFocus
                  value={sigla}
                  onChange={(e) => setSigla(e.target.value.toUpperCase())}
                  placeholder="EX: BPCHOQUE"
                  className="h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-[#004e9a] dark:focus:border-blue-500 rounded-2xl text-lg font-black text-slate-800 dark:text-white transition-all shadow-sm group-hover:shadow-md uppercase"
                />
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#004e9a] transition-colors" />
              </div>
            </div>
          </div>

          {/* CONTROLES DE NAVEGAÇÃO E BUSCA */}
          <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
            <div className="flex flex-col gap-8">
              {/* Navegador */}
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center p-1.5 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/50 dark:border-slate-800 shadow-inner">
                  <Button size="icon" variant="ghost" onClick={goToFirst} disabled={currentIndex === 0 || isLoading} className="h-10 w-10 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                    <ChevronsLeft className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={goToPrevious} disabled={currentIndex === 0 || isLoading} className="h-10 w-10 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                    <ChevronLeft className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                  </Button>
                  
                  <div className="px-6 flex flex-col items-center border-x border-slate-200 dark:border-slate-800 mx-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-[#004e9a] dark:text-blue-400">{currentDisplayRecord}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">de</span>
                      <span className="text-sm font-black text-slate-400">{totalRecords}</span>
                    </div>
                  </div>

                  <Button size="icon" variant="ghost" onClick={goToNext} disabled={currentIndex >= totalRecords - 1 || isLoading} className="h-10 w-10 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                    <ChevronRight className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={goToLast} disabled={currentIndex >= totalRecords - 1 || isLoading} className="h-10 w-10 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all active:scale-90">
                    <ChevronsRight className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                  </Button>
                </div>
              </div>

              {/* Barra de Busca */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 group">
                  <Input
                    placeholder="PESQUISAR UNIDADE..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-12 pl-12 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl text-sm font-bold uppercase transition-all focus:ring-0"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-[#004e9a]" />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-12 px-8 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-black uppercase text-[11px] tracking-widest rounded-xl transition-all active:scale-95"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pesquisar"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ STATUS */}
        <div className="bg-slate-100/50 dark:bg-slate-900/50 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting || isNewRecord}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest rounded-lg h-8"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Excluir Unidade
            </Button>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200/50 dark:border-slate-700 shadow-sm">
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                  {isLoading ? 'Sincronizando...' : 'Banco Conectado'}
                </span>
             </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
      <AlertDialogContent className="rounded-2xl border-red-200/50 shadow-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-black text-slate-800 uppercase tracking-tight">
            ⚠️ Confirmar Exclusão
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-600 text-sm leading-relaxed">
            Você está prestes a excluir a unidade <strong className="text-slate-800">"{sigla}"</strong>.
            <br />Esta ação <strong className="text-red-600">não pode ser desfeita</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-xl font-bold">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmDelete}
            className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold gap-2"
          >
            <Trash2 className="h-4 w-4" /> Excluir Permanentemente
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
};
