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
}

export const EqSuporteDialog = ({ open, onOpenChange }: EqSuporteDialogProps) => {
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
        <DialogContent className="w-[95vw] sm:max-w-[700px] p-0 overflow-hidden border-slate-200/50 dark:border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.4)] backdrop-blur-3xl bg-white/95 dark:bg-slate-900/95 rounded-2xl max-h-[90vh] overflow-y-auto">
          <div className="bg-gradient-to-r from-[#004e9a] to-[#002f5c] p-4 md:p-6 text-white flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden shadow-inner gap-4">
            <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-end items-center opacity-[0.05]">
              <img src="/logo-pmpa.png" alt="watermark" className="w-64 h-auto scale-150 rotate-12 grayscale" />
            </div>
            <div className="flex items-center gap-3 md:gap-4 relative z-10">
              <div className="p-2 bg-white/10 rounded-lg">
                <Headphones className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg md:text-xl font-black tracking-tight uppercase">
                  Registros de Suporte
                </DialogTitle>
                <p className="text-[9px] md:text-[10px] opacity-70 font-bold uppercase tracking-widest">
                  Gestão Institucional PMPA
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 relative z-10 w-full md:w-auto">
              <Button
                size="sm"
                variant="outline"
                onClick={handleNovo}
                className="flex-1 md:flex-none h-9 md:h-10 px-3 md:px-5 font-bold uppercase text-[10px] md:text-[11px] tracking-wider gap-2 shadow-sm text-[#004e9a] border-white/20 bg-white/95 hover:bg-white hover:-translate-y-0.5 transition-all rounded-xl"
              >
                <Plus className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.5} />
                <span className="inline md:inline">Novo</span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 md:flex-none h-9 md:h-10 px-3 md:px-5 font-bold uppercase text-[10px] md:text-[11px] tracking-wider gap-2 shadow-sm bg-blue-500 hover:bg-blue-400 text-white border-blue-400/50 hover:-translate-y-0.5 transition-all rounded-xl"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" /> : <Save className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.5} />}
                Salvar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isNewRecord}
                className={`flex-1 md:flex-none h-9 md:h-10 px-3 md:px-5 font-bold uppercase text-[10px] md:text-[11px] tracking-wider gap-2 shadow-sm rounded-xl transition-all ${isNewRecord ? 'opacity-50' : 'bg-red-500 hover:bg-red-400 hover:-translate-y-0.5 border-red-400/50'}`}
              >
                {isDeleting ? <Loader2 className="h-3.5 w-3.5 md:h-4 md:w-4 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={2.5} />}
                Excluir
              </Button>
              <button
                onClick={() => onOpenChange(false)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors md:hidden"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4 md:p-8 space-y-6 md:space-y-8 bg-slate-50/50 dark:bg-slate-950/50 backdrop-blur-sm">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6 p-4 md:p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="id" className="text-[10px] md:text-[11px] font-black uppercase text-[#004e9a] dark:text-blue-400 opacity-80 tracking-wider">
                  ID do Equipamento
                </Label>
                <Input
                  id="id"
                  value={id}
                  className="h-12 md:h-14 font-black text-center bg-slate-100 border-slate-200 text-lg md:text-xl text-slate-500 rounded-xl"
                  readOnly
                />
              </div>

              <div className="md:col-span-4 space-y-2">
                <Label htmlFor="equipamento" className="text-[10px] md:text-[11px] font-black uppercase text-[#004e9a] dark:text-blue-400 opacity-80 tracking-wider">
                  Equipamento / Descrição
                </Label>
                <Input
                  id="equipamento"
                  autoFocus
                  value={equipamento}
                  onChange={(e) => setEquipamento(e.target.value)}
                  className="h-12 md:h-14 font-black bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-base md:text-lg text-slate-800 dark:text-slate-100 focus-visible:ring-2 focus-visible:ring-[#004e9a]/50 focus-visible:border-[#004e9a] uppercase shadow-inner rounded-xl transition-all"
                  placeholder="Ex: NOBREAK INTELBRAS"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-border/50">
              <div className="flex flex-col items-center justify-between gap-6">
                <div className="flex items-center gap-3 w-full justify-center">
                  <div className="flex items-center p-1 bg-muted rounded-xl border border-border/40 shadow-sm w-fit mx-auto md:w-auto justify-center md:justify-start gap-1 md:gap-0">
                    <Button size="icon" variant="ghost" onClick={goToFirst} disabled={currentIndex === 0 || isLoading} className="h-9 w-9 shrink-0 hover:bg-white rounded-lg">
                      <ChevronsLeft className="h-4 w-4 text-pmpa-navy" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={goToPrevious} disabled={currentIndex === 0 || isLoading} className="h-9 w-9 shrink-0 hover:bg-white rounded-lg">
                      <ChevronLeft className="h-4 w-4 text-pmpa-navy" />
                    </Button>

                    <div className="px-1.5 md:px-6 flex items-center gap-2 border-x border-border/30 mx-0.5 md:mx-1 shrink-0">
                      <span className="text-sm font-black text-pmpa-navy">{currentDisplayRecord}</span>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">de</span>
                      <span className="text-sm font-black text-pmpa-navy opacity-70">{totalRecords}</span>
                    </div>

                    <Button size="icon" variant="ghost" onClick={goToNext} disabled={currentIndex >= totalRecords - 1 || isLoading} className="h-9 w-9 shrink-0 hover:bg-white rounded-lg">
                      <ChevronRight className="h-4 w-4 text-pmpa-navy" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={goToLast} disabled={currentIndex >= totalRecords - 1 || isLoading} className="h-9 w-9 shrink-0 hover:bg-white rounded-lg">
                      <ChevronsRight className="h-4 w-4 text-pmpa-navy" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                  <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar equipamento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-11 text-sm bg-muted/30 border-border/40 text-slate-800 focus:bg-white transition-all uppercase rounded-xl"
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    disabled={isLoading}
                    className="w-full sm:w-32 h-11 bg-pmpa-navy hover:bg-pmpa-navy/90 text-white font-bold uppercase text-[11px] tracking-widest transition-all shadow-md rounded-xl"
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Pesquisar"}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 px-4 md:px-6 py-4 border-t border-border/50 flex flex-col md:flex-row gap-3 justify-between items-center">
            <p className="text-[9px] md:text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center md:text-left">
              Gestão Institucional de Equipamentos de Suporte
            </p>
            <div className="flex gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-pmpa-navy" />
                  <span className="text-[10px] font-bold text-pmpa-navy uppercase">Carregando...</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mt-0.5" />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Banco Sincronizado</span>
                </>
              )}
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
