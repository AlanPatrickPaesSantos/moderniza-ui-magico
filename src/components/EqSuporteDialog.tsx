import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Headphones, Plus, Loader2 } from "lucide-react";
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
    
    if (!window.confirm(`ATENÇÃO: Deseja realmente excluir o equipamento "${equipamento}"?`)) return;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden border-none shadow-2xl">
        <div className="bg-pmpa-navy p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Headphones className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight uppercase">
                Registros de Suporte
              </DialogTitle>
              <p className="text-[10px] opacity-70 font-bold uppercase tracking-widest">
                Gestão Institucional PMPA
              </p>
            </div>
          </div>
          <div className="flex gap-2 pr-8">
            <Button
              size="sm"
              variant="outline"
              onClick={handleNovo}
              className="h-9 px-4 font-bold uppercase text-[11px] tracking-wider gap-2 shadow-sm text-pmpa-navy bg-white hover:bg-muted"
            >
              <Plus className="h-4 w-4" />
              Novo
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSave}
              disabled={isSaving}
              className="h-9 px-4 font-bold uppercase text-[11px] tracking-wider gap-2 shadow-sm"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting || isNewRecord}
              className={`h-9 px-4 font-bold uppercase text-[11px] tracking-wider gap-2 shadow-sm ${isNewRecord ? 'opacity-50' : 'bg-pmpa-red hover:bg-pmpa-red/90'}`}
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Excluir
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6 bg-background">
          <div className="grid grid-cols-6 gap-4 p-5 rounded-2xl border border-border/60 bg-muted/20">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="id" className="text-[11px] font-black uppercase text-pmpa-navy opacity-70">
                ID do Equipamento
              </Label>
              <Input
                id="id"
                value={id}
                className="h-12 font-bold text-center bg-white border-border/80 text-lg text-slate-500"
                readOnly
              />
            </div>

            <div className="col-span-4 space-y-2">
              <Label htmlFor="equipamento" className="text-[11px] font-black uppercase text-pmpa-navy opacity-70">
                Equipamento / Descrição
              </Label>
              <Input
                id="equipamento"
                value={equipamento}
                onChange={(e) => setEquipamento(e.target.value)}
                className="h-12 font-black bg-white border-border/80 text-lg text-slate-800 focus-visible:ring-pmpa-navy uppercase"
                placeholder="Ex: NOBREAK INTELBRAS"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border/50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center p-1 bg-muted rounded-xl border border-border/40">
                  <Button size="icon" variant="ghost" onClick={goToFirst} disabled={currentIndex === 0 || isLoading} className="h-8 w-8 hover:bg-white rounded-lg">
                    <ChevronsLeft className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={goToPrevious} disabled={currentIndex === 0 || isLoading} className="h-8 w-8 hover:bg-white rounded-lg">
                    <ChevronLeft className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                  
                  <div className="px-4 flex items-center gap-1.5 border-x border-border/30 mx-1">
                    <span className="text-[13px] font-black text-pmpa-navy">{currentDisplayRecord}</span>
                    <span className="text-[11px] font-bold text-muted-foreground uppercase opacity-60">de</span>
                    <span className="text-[13px] font-black text-pmpa-navy opacity-70">{totalRecords}</span>
                  </div>

                  <Button size="icon" variant="ghost" onClick={goToNext} disabled={currentIndex >= totalRecords - 1 || isLoading} className="h-8 w-8 hover:bg-white rounded-lg">
                    <ChevronRight className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={goToLast} disabled={currentIndex >= totalRecords - 1 || isLoading} className="h-8 w-8 hover:bg-white rounded-lg">
                    <ChevronsRight className="h-4 w-4 text-pmpa-navy" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-48">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Buscar equipamento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 h-9 text-[13px] bg-muted/30 border-border/40 text-slate-800 focus:bg-white transition-all uppercase"
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleSearch}
                  disabled={isLoading}
                  className="h-9 font-bold uppercase text-[10px] tracking-widest border-pmpa-navy/20 hover:bg-pmpa-navy hover:text-white transition-all shadow-sm"
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Pesquisar"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-muted/30 px-6 py-3 border-t border-border/50 flex justify-between items-center">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            Gestão Institucional de Equipamentos de Suporte
          </p>
          <div className="flex gap-1">
            {isLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-pmpa-navy" />
                <span className="text-[10px] font-bold text-pmpa-navy uppercase">Carregando...</span>
              </>
            ) : (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Banco Sincronizado</span>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
