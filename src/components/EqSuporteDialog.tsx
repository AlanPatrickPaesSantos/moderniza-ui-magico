import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Headphones, Plus, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { API_BASE } from "../lib/api-config";

interface EqSuporteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  readOnly?: boolean;
}

export const EqSuporteDialog = ({ open, onOpenChange, readOnly }: EqSuporteDialogProps) => {
  const [equips, setEquips] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [id, setId] = useState<string | number>("");
  const [equipamento, setEquipamento] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEquips = useCallback(async (query = "") => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const authHeaders: any = {};
      if (token) authHeaders['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/eqsuporte/list${query ? `?q=${query}` : ''}`, {
        headers: authHeaders
      });

      if (!res.ok) throw new Error("Erro ao carregar equipamentos");

      const data = await res.json();
      setEquips(data);
      if (data.length > 0) {
        setCurrentIndex(0);
        loadRecordToState(data[0]);
      } else {
        clearForm(true);
      }
    } catch (err) {
      toast.error("Falha ao carregar os equipamentos");
      setEquips([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchEquips();
    }
  }, [open, fetchEquips]);

  const loadRecordToState = (record: any) => {
    setId(record.ID_EQUIP);
    setEquipamento(record.EQUIPAMENTO);
  };

  const clearForm = async (keepLoadingNextId = false) => {
    setEquipamento("");
    if (!keepLoadingNextId) {
      try {
        const token = localStorage.getItem('token');
        const authHeaders: any = {};
        if (token) authHeaders['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE}/eqsuporte/next-id`, {
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
    setSearchTerm("");
    fetchEquips("").then(() => clearForm(false));
  };

  const handleSave = async () => {
    if (!equipamento.trim()) {
      toast.error("O nome do equipamento é obrigatório");
      return;
    }

    setIsSaving(true);
    const token = localStorage.getItem('token');
    const authHeaders: any = { 'Content-Type': 'application/json' };
    if (token) authHeaders['Authorization'] = `Bearer ${token}`;

    try {
      const isExisting = equips.some(e => e.ID_EQUIP === id);
      const method = isExisting ? 'PUT' : 'POST';
      const url = isExisting
        ? `${API_BASE}/eqsuporte/${id}`
        : `${API_BASE}/eqsuporte`;

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify({ EQUIPAMENTO: equipamento })
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Erro ao salvar equipamento");
      }

      toast.success("Equipamento salvo com sucesso!");
      await fetchEquips(searchTerm);

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !equips.some(e => e.ID_EQUIP === id)) {
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
      const res = await fetch(`${API_BASE}/eqsuporte/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erro ao excluir");

      toast.success("Equipamento excluído!");

      if (equips.length <= 1 && searchTerm) {
        setSearchTerm("");
        await fetchEquips("");
      } else {
        await fetchEquips(searchTerm);
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSearch = () => {
    fetchEquips(searchTerm);
  };

  const goToFirst = () => {
    if (equips.length > 0) {
      setCurrentIndex(0);
      loadRecordToState(equips[0]);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      loadRecordToState(equips[newIndex]);
    }
  };

  const goToNext = () => {
    if (currentIndex < equips.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      loadRecordToState(equips[newIndex]);
    }
  };

  const goToLast = () => {
    if (equips.length > 0) {
      const newIndex = equips.length - 1;
      setCurrentIndex(newIndex);
      loadRecordToState(equips[newIndex]);
    }
  };

  const totalRecords = equips.length;
  const currentDisplayRecord = totalRecords === 0 ? 0 : currentIndex + 1;
  const isNewRecord = !equips.some(e => e.ID_EQUIP === id);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950 sm:max-w-[500px] w-[92vw] rounded-3xl max-h-[95vh] flex flex-col [&>button]:hidden">
          {/* CABEÇALHO PREMIUM */}
          <div className="relative bg-[#004e9a] p-4 md:p-6 overflow-hidden shrink-0">
            {/* Botão Fechar de Alta Precisão */}
            <button 
              onClick={() => onOpenChange(false)}
              className="absolute top-2 right-2 z-50 h-10 w-10 flex items-center justify-center bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-full text-white transition-all active:scale-90"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" strokeWidth={3} />
            </button>

            {/* Efeitos de Fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-600/20 rounded-full blur-2xl -ml-10 -mb-10" />
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-xl">
                  <Headphones className="h-5 w-5 md:h-6 md:h-6 text-white" strokeWidth={2.5} />
                </div>
                <div>
                  <DialogTitle className="text-lg md:text-xl font-black text-white uppercase tracking-tight leading-tight">
                    Suporte {readOnly && " (Visualização)"}
                  </DialogTitle>
                  <p className="text-[8px] text-blue-100/80 font-black uppercase tracking-[0.2em] mt-0.5">
                    Gestão Institucional PMPA
                  </p>
                </div>
              </div>
              
              {!readOnly && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleNovo}
                    className="h-9 md:h-10 px-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold uppercase text-[8px] md:text-[9px] tracking-widest rounded-xl backdrop-blur-md transition-all"
                  >
                    <Plus className="h-3 w-3 mr-1.5 md:mr-2" strokeWidth={3} /> Novo
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-9 md:h-10 px-5 flex-1 md:flex-none bg-blue-500 hover:bg-blue-400 text-white font-black uppercase text-[8px] md:text-[9px] tracking-widest rounded-xl shadow-lg transition-all"
                  >
                    {isSaving ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : <Save className="h-3 w-3 mr-2" strokeWidth={3} />}
                    Salvar
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-950">
            {/* CORPO DO FORMULÁRIO */}
            <div className="p-4 md:p-6 space-y-4 md:space-y-6 bg-white dark:bg-slate-950/50">
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
                  Equipamento / Descrição
                </Label>
                <div className="relative group">
                  <Input
                    autoFocus
                    disabled={readOnly}
                    value={equipamento}
                    onChange={(e) => setEquipamento(e.target.value.toUpperCase())}
                    placeholder="EX: NOBREAK INTELBRAS"
                    className="h-14 pl-12 pr-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-[#004e9a] dark:focus:border-blue-500 rounded-2xl text-lg font-black text-slate-800 dark:text-white transition-all shadow-sm group-hover:shadow-md uppercase disabled:opacity-70"
                  />
                  <Headphones className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300 group-focus-within:text-[#004e9a] transition-colors" />
                </div>
              </div>
            </div>

            {/* CONTROLES DE NAVEGAÇÃO E BUSCA */}
            <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
              <div className="flex flex-col gap-8">
                {/* Navegador */}
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm">
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
                      placeholder="PESQUISAR EQUIPAMENTO..."
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
              {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting || isNewRecord}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest rounded-lg h-8"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Excluir Registro
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
               <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-full border border-slate-200/50 dark:border-slate-700 shadow-sm">
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">
                    {isLoading ? 'Sincronizando...' : 'Banco Conectado'}
                  </span>
               </div>
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
              Você está prestes a excluir o equipamento <strong className="text-slate-800">"{equipamento}"</strong>.
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
