import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { UnidadeCombobox } from "./UnidadeCombobox";
import { API_BASE } from "../lib/api-config";
import { Printer, ChevronLeft, ChevronRight, CheckCircle2, Layout, Car, Globe, Package, Zap, Router, Cable, Layers } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  os: z.union([z.string(), z.number()]).transform(v => String(v)),
  secao: z.string().min(1, "Seção é obrigatória"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  data: z.string().min(1, "Data é obrigatória"),
  tecnicos: z.string().optional(),
  def_recla: z.string().optional(),
  solicitante: z.string().optional(),
  n_pae: z.string().optional(),
  servico: z.string().optional(), // Status (Pronto/Pendente)
  categoria: z.string().min(1, "Categoria é obrigatória"), // Tipo (Interno/Externo)
  horario: z.string().optional(),
  analise: z.string().optional(),
  observacao: z.string().optional(),
  solucao: z.string().optional(),
  relatorio: z.string().optional(),
  materiais: z.array(z.string()).default([]),
});

type FormData = z.infer<typeof formSchema>;

interface ServicoInternoExternoFormProps {
  id?: string;
  initialData?: any;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
  onPrint?: (type: 'laudo' | 'saida' | 'entrada') => void;
  onNavigate?: (dir: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  isEditMode?: boolean;
}

export const ServicoInternoExternoForm = ({
  id,
  initialData,
  onSubmit,
  onCancel,
  onPrint,
  onNavigate,
  hasPrev,
  hasNext,
  isEditMode,
}: ServicoInternoExternoFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (initialData) {
      const fmtDate = (d: any) => {
        if (!d) return "";
        if (typeof d === 'string' && d.includes('/')) {
          const parts = d.split('/');
          if (parts.length === 3) {
            const day = parts[0].trim().padStart(2, '0');
            const month = parts[1].trim().padStart(2, '0');
            const year = parts[2].trim();
            return `${year}-${month}-${day}`;
          }
        }
        const date = new Date(d);
        return isNaN(date.getTime()) ? "" : date.toISOString().split('T')[0];
      };

      reset({
        os: String(initialData.os || initialData.Id_cod || ""),
        secao: String(initialData.secao || initialData.Seção_Ditel || initialData.Seção || initialData.Secao || "").toUpperCase(),
        unidade: initialData.unidade || initialData.Unidade || "",
        data: fmtDate(initialData.data || initialData.Data_Ent || initialData.Data),
        tecnicos: initialData.tecnicos || initialData.Tecnico || initialData.Técnicos || initialData.Técnico || "",
        def_recla: initialData.def_recla || initialData.Defeito_Recl || initialData.Defeito || "",
        solicitante: initialData.solicitante || initialData.Solicitante || "",
        n_pae: initialData.n_pae || initialData.Nº_PAE || "",
        servico: String(initialData.servico || "").toUpperCase() === "PENDENTE" 
          ? "PENDENTE" 
          : "PRONTO",
        categoria: String(initialData.categoria || initialData.servico || "").toLowerCase().includes("pendente")
          ? "interno" // Fallback if it was Pendente
          : String(initialData.categoria || initialData.servico || "interno").toLowerCase(),
        horario: initialData.horario || initialData.Horário || "",
        analise: initialData.analise || initialData.Analise_Tecnica || initialData.Analise || "",
        observacao: initialData.observacao || initialData.Observaçoes || initialData.Observacao || "",
        solucao: initialData.solucao || initialData.Solução || initialData.Solucao || initialData.Soluções || "",
        relatorio: initialData.relatorio || initialData.Relatório || "",
        materiais: Array.isArray(initialData.materiais) ? initialData.materiais : [],
      });
    } else {
      reset({
        os: "",
        secao: "",
        unidade: "",
        data: new Date().toISOString().split('T')[0],
        tecnicos: "",
        def_recla: "",
        solicitante: "",
        n_pae: "",
        servico: "PRONTO",
        categoria: "interno",
        solucao: "",
        materiais: [],
      });
      
      const fetchNextOs = async () => {
        try {
          const res = await fetch(`${API_BASE}/missoes/next-os`);
          const data = await res.json();
          if (data.nextOs) setValue("os", data.nextOs.toString());
        } catch (err) {
          console.error("Erro ao puxar próxima OS", err);
        }
      };
      
      fetchNextOs();
    }
  }, [initialData, reset, setValue]);

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-1 py-1">
      <div className="space-y-4">
        
                <div className="p-6 bg-slate-50/30 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm relative overflow-hidden transition-all focus-within:shadow-[0_8px_30px_rgba(0,78,154,0.06)] focus-within:border-[#004e9a]/30">
          <div className="absolute top-0 left-0 w-1 bottom-0 bg-[#004e9a]/80" />
          <h3 className="text-[12px] font-black text-[#004e9a] uppercase tracking-[0.2em] border-b border-slate-200/60 dark:border-slate-800 pb-2 mb-5 flex items-center gap-2">
            Identificação Principal
          </h3>
        {/* Row 1: OS, Seção, Unidade */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="os" className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest">OS (MISSÃO) *</Label>
            <Input
              id="os"
              disabled
              {...register("os")}
              placeholder="Gerado Auto."
              className={`h-11 bg-blue-50/40 dark:bg-blue-900/20 border-[#004e9a]/20 dark:border-[#004e9a]/40 text-[#004e9a] dark:text-blue-400 font-black text-lg text-center transition-all rounded-xl shadow-inner ${errors.os ? "border-destructive" : ""}`}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="secao" className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest">Seção *</Label>
            <Select onValueChange={(value) => setValue("secao", value)} value={watch("secao")}>
              <SelectTrigger className={`h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium ${errors.secao ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPORTE">Suporte</SelectItem>
                <SelectItem value="TELECOM">Telecom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest">Unidade *</Label>
            <UnidadeCombobox
              value={watch("unidade")}
              onChange={(value) => setValue("unidade", value, { shouldValidate: true })}
            />
            {errors.unidade && <p className="text-xs text-destructive">{errors.unidade.message}</p>}
          </div>
        </div>

        {/* Row 2: Data, Horário, Técnicos */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="space-y-1.5 lg:col-span-1">
            <Label htmlFor="data" className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest">Data *</Label>
            <Input id="data" type="date" {...register("data")} className={`h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium ${errors.data ? "border-destructive" : ""}`} />
          </div>

          <div className="space-y-1.5 lg:col-span-1">
            <Label htmlFor="horario" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Horário</Label>
            <Input id="horario" {...register("horario")} placeholder="HH:MM" className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" />
          </div>

          <div className="space-y-1.5 md:col-span-2 lg:col-span-4">
            <Label htmlFor="tecnicos" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Técnicos</Label>
            <Input id="tecnicos" {...register("tecnicos")} placeholder="Nome dos técnicos" className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" />
          </div>
        </div>

        {/* Row 3: Solicitante, PAE, Serviço, Reclamação */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="solicitante" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Solicitante</Label>
            <Input id="solicitante" {...register("solicitante")} placeholder="Solicitante" className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" />
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="n_pae" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nº PAE</Label>
            <Input id="n_pae" {...register("n_pae")} placeholder="PAE" className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" />
          </div>

          <div className="space-y-1.5 lg:col-span-3 h-full flex flex-col justify-end">
            <Label className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest mb-1 shadow-none">Categoria da Missão *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1 md:mt-0">
              <button
                type="button"
                onClick={() => setValue("categoria", "interno")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-tighter",
                  watch("categoria") === "interno" 
                    ? "bg-blue-600 border-blue-600 text-white shadow-md scale-[1.02]" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-blue-400"
                )}
              >
                <Layout className="w-4 h-4" /> Interno
              </button>
              <button
                type="button"
                onClick={() => setValue("categoria", "externo")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-tighter",
                  watch("categoria") === "externo" 
                    ? "bg-amber-500 border-amber-500 text-white shadow-md scale-[1.02]" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-amber-400"
                )}
              >
                <Car className="w-4 h-4" /> Externo
              </button>
              <button
                type="button"
                onClick={() => setValue("categoria", "remoto")}
                className={cn(
                  "flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all font-black text-[10px] uppercase tracking-tighter",
                  watch("categoria") === "remoto" 
                    ? "bg-purple-600 border-purple-600 text-white shadow-md scale-[1.02]" 
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-purple-400"
                )}
              >
                <Globe className="w-4 h-4" /> Remoto
              </button>
            </div>
          </div>

          <div className="space-y-1.5 lg:col-span-1">
            <Label htmlFor="servico" className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest">Status *</Label>
            <Select onValueChange={(value) => setValue("servico", value)} value={watch("servico")}>
              <SelectTrigger className={`h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium ${errors.servico ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PRONTO">PRONTO</SelectItem>
                <SelectItem value="PENDENTE">PENDENTE</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* CHECKLIST DE MATERIAIS (Sugestão 5) */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-200/60 dark:border-slate-800">
          <div className="md:col-span-6">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
              <Package className="w-3 h-3" /> Materiais Utilizados na Missão
            </h4>
          </div>
          
          {[
            { id: "roteador", label: "Roteador", icon: <Router className="w-4 h-4" /> },
            { id: "cat5", label: "Cabo CAT 5", icon: <Cable className="w-4 h-4" /> },
            { id: "cat5e", label: "Cabo CAT 5e", icon: <Cable className="w-4 h-4" /> },
            { id: "cat6", label: "Cabo CAT 6", icon: <Cable className="w-4 h-4" /> },
            { id: "conectores", label: "Conectores", icon: <Zap className="w-4 h-4" /> },
            { id: "canaletas", label: "Canaletas", icon: <Layers className="w-4 h-4" /> }
          ].map((item) => (
            <div key={item.id} className="flex items-center space-x-2 bg-slate-50/50 dark:bg-slate-800/30 p-2 rounded-lg border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 transition-colors">
              <Checkbox 
                id={item.id} 
                checked={watch("materiais")?.includes(item.id)}
                onCheckedChange={(checked) => {
                  const current = watch("materiais") || [];
                  if (checked) {
                    setValue("materiais", [...current, item.id]);
                  } else {
                    setValue("materiais", current.filter(id => id !== item.id));
                  }
                }}
              />
              <label htmlFor={item.id} className="text-[10px] font-bold uppercase text-slate-600 dark:text-slate-400 cursor-pointer flex items-center gap-1">
                {item.icon} {item.label}
              </label>
            </div>
          ))}
        </div>

        
        </div>
        
        <div className="p-6 bg-slate-50/30 dark:bg-slate-800/20 border border-slate-200/60 dark:border-slate-800 rounded-2xl shadow-sm relative overflow-hidden transition-all focus-within:shadow-[0_8px_30px_rgba(0,78,154,0.06)] focus-within:border-[#004e9a]/30">
          <div className="absolute top-0 left-0 w-1 bottom-0 bg-[#004e9a]/60" />
          <h3 className="text-[12px] font-black text-[#004e9a] uppercase tracking-[0.2em] border-b border-slate-200/60 dark:border-slate-800 pb-2 mb-5 flex items-center gap-2">
            Detalhamento Técnico
          </h3>
        {/* Row 4: Descrições Técnicas (Lado a Lado) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="def_recla" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Defeito/Reclamação</Label>
            <Textarea 
              id="def_recla" 
              {...register("def_recla")} 
              placeholder="Descreva o defeito" 
              className="min-h-[140px] text-sm leading-relaxed p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium custom-scrollbar" 
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="solucao" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Solução Aplicada</Label>
            <Textarea 
              id="solucao" 
              {...register("solucao")} 
              placeholder="Descreva a solução aplicada na missão..." 
              className="min-h-[140px] text-sm leading-relaxed p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium custom-scrollbar" 
            />
          </div>
        </div>

        <div className="space-y-1.5 pb-2 pt-2 border-t border-border/40">
          <Label htmlFor="relatorio" className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Relatório de Missão (Legado)</Label>
          <Textarea 
            id="relatorio" 
            {...register("relatorio")} 
            placeholder="Informações adicionais do relatório..." 
            className="min-h-[100px] text-sm leading-relaxed p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium custom-scrollbar" 
          />
        </div>

        </div>
        
        {/* Barra de Ações Interna ao Formulário */}
        <div className="mt-6 bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-3 p-2 md:p-3 -mx-2 md:-mx-4 rounded-b-xl">
          <div className="flex flex-wrap md:flex-nowrap w-full md:w-auto gap-2 justify-center md:justify-start">
            {onNavigate && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onNavigate('prev')}
                disabled={!hasPrev}
                className="h-10 md:h-12 w-10 md:w-auto md:px-4 gap-2 text-pmpa-navy hover:bg-pmpa-navy/10 font-black border border-pmpa-navy/20"
                title="OS Anterior"
              >
                <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
                <span className="hidden md:inline text-xs uppercase tracking-tighter">Anterior</span>
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => onPrint?.('saida')}
              className="h-10 md:h-12 gap-1 md:gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold px-2 md:px-4 flex-1 sm:flex-none"
              disabled={!initialData}
            >
              <Printer className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-[10px] md:text-[13px] uppercase">Saída</span>
            </Button>
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap w-full md:w-auto gap-2 items-center justify-center md:justify-end">
            <Button
              type="submit"
              className="bg-pmpa-navy hover:bg-pmpa-navy/90 text-white h-10 md:h-12 px-6 md:px-12 font-black shadow-lg uppercase tracking-tight text-xs md:text-lg border-2 border-white/10"
            >
              {isEditMode || initialData ? "Atualizar Missão" : "Salvar Missão"}
            </Button>

            {onNavigate && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => onNavigate('next')}
                disabled={!hasNext}
                className="h-10 md:h-12 w-10 md:w-auto md:px-4 gap-2 text-pmpa-navy hover:bg-pmpa-navy/10 font-black border border-pmpa-navy/20"
                title="Próxima OS"
              >
                <span className="hidden md:inline text-xs uppercase tracking-tighter">Próximo</span>
                <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
              </Button>
            )}
            
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onCancel} 
              className="h-10 md:h-12 px-3 md:px-4 font-bold text-muted-foreground hover:text-foreground uppercase text-xs"
            >
              Voltar
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
};
