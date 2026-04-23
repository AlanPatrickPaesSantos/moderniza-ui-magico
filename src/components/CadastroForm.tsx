import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { API_BASE } from "@/lib/api-config";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EquipCombobox } from "./EquipCombobox";
import { UnidadeCombobox } from "./UnidadeCombobox";

const cadastroSchema = z.object({
  os: z.string().optional(),
  tecnico: z.string().optional(),
  secaoDitel: z.string().optional(),
  tEquipSuporte: z.string().optional(),
  solicitante: z.string().optional(),
  unidade: z.string().min(1, "A unidade é obrigatória"),
  dataEnt: z.string().min(1, "A data de entrada é obrigatória"),
  nPae: z.string().optional(),
  rp: z.string().optional(),
  nSerie: z.string().optional(),
  defeitoRecl: z.string().optional(),
  analiseTecnica: z.string().optional(),
  servico: z.string().optional(),
  garantia: z.string().optional(),
  bateria: z.string().optional(),
  dataEnvio: z.string().optional(),
  dataRetorno: z.string().optional(),
  laudoTecnico: z.string().optional(),
  telefone: z.string().optional(),
  saidaEquip: z.string().optional(),
  dataSaida: z.string().optional(),
  fonteCabo: z.boolean().default(false),
});

type CadastroFormValues = z.infer<typeof cadastroSchema>;

interface CadastroFormProps {
  onSubmit: (data: CadastroFormValues) => void | Promise<void>;
  onCancel: () => void;
  onPrint?: (type: 'laudo' | 'saida' | 'entrada') => void;
  onNavigate?: (dir: 'prev' | 'next') => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  initialData?: any;
  id?: string;
  isEditMode?: boolean;
  readOnly?: boolean;
}

import { 
  Printer, 
  Loader2, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Building, 
  Calendar, 
  Tag, 
  Hash, 
  Layout, 
  Stethoscope, 
  CheckCircle2, 
  History, 
  Sparkles,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const CadastroForm = ({ onSubmit, onCancel, onPrint, onNavigate, hasPrev, hasNext, initialData, id = "cadastro-form", isEditMode, readOnly }: CadastroFormProps) => {
  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      fonteCabo: false,
      saidaEquip: "",
      dataSaida: "",
    },
  });

  const handleError = (errors: any) => {
    console.error("Erro de validação:", errors);
    toast.error("⚠️ Existem campos inválidos ou obrigatórios não preenchidos.");
  };

  const [nextOs, setNextOs] = useState<string>("");

  useEffect(() => {
    if (!initialData) {
      const token = localStorage.getItem("ditel_token");
      fetch(`${API_BASE}/servicos/next-os`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => {
          const osVal = String(d.nextOs);
          setNextOs(osVal);
          form.setValue("os", osVal);
        })
        .catch(() => {});
    }
  }, [initialData, form]);

  const [historyMatches, setHistoryMatches] = useState<any[]>([]);
  const [isSearchingHistory, setIsSearchingHistory] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Auto-save logic
  useEffect(() => {
    if (isEditMode) return; // Don't auto-save in edit mode to avoid overwriting master data
    const subscription = form.watch((value) => {
      localStorage.setItem("ditel_draft_cadastro", JSON.stringify(value));
      setLastSaved(new Date());
    });
    return () => subscription.unsubscribe();
  }, [form, isEditMode]);

  // Load draft
  useEffect(() => {
    if (isEditMode) return;
    const draft = localStorage.getItem("ditel_draft_cadastro");
    if (draft && !initialData) {
      try {
        const parsed = JSON.parse(draft);
        // Only load if it's a fresh form
        if (!form.getValues("os")) {
          form.reset(parsed);
          toast.info("📋 Rascunho carregado automaticamente.");
        }
      } catch (e) {}
    }
  }, [isEditMode, initialData, form]);

  // History Check logic
  const checkHistory = async (type: 'rp' | 'nSerie', value: string) => {
    if (!value || value.length < 3) return;
    setIsSearchingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/servicos?q=${value}&limit=3`);
      const data = await res.json();
      const matches = Array.isArray(data) ? data.filter((item: any) => item.Id_cod != (initialData?.Id_cod || 0)) : [];
      setHistoryMatches(matches);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearchingHistory(false);
    }
  };

  useEffect(() => {
    if (initialData) {
      const fmtDate = (d: any) => {
// ... existing date logic ...
        if (!d) return "";
        if (typeof d === 'string' && d.includes('/')) {
          // Handle DD/MM/YYYY from legacy data, trimming any extra spaces
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

      form.reset({
        os: String(initialData.Id_cod || initialData.os || ""),
        tecnico: initialData.Tecnico || initialData.tecnico || initialData.Técnico || "",
        secaoDitel: initialData.Seção_Ditel || initialData.secaoDitel || "",
        tEquipSuporte: initialData.T_EquipSuporte || initialData.tEquipSuporte || "",
        solicitante: initialData.Solicitante || initialData.solicitante || "",
        unidade: initialData.Unidade || initialData.unidade || "",
        dataEnt: fmtDate(initialData.Data_Ent || initialData.dataEnt),
        nPae: initialData.Nº_PAE || initialData.nPae || "",
        rp: initialData.RP || initialData.rp || "",
        nSerie: initialData.Nº_Serie || initialData.nSerie || "",
        defeitoRecl: initialData.Defeito_Recl || initialData.defeitoRecl || "",
        analiseTecnica: initialData.Analise_Tecnica || initialData.analiseTecnica || "",
        servico: String(initialData.Serviço || initialData.servico || "").toUpperCase(),
        garantia: String(initialData.Garantia || initialData.garantia || "").toLowerCase().replace('não', 'nao').replace('não', 'nao'),
        dataEnvio: fmtDate(initialData.Data_Envio || initialData.dataEnvio),
        dataRetorno: fmtDate(initialData.Data_Retorno || initialData.dataRetorno),
        laudoTecnico: initialData.Laudo_Tecnico || initialData.laudoTecnico || "",
        telefone: initialData.telefone || initialData.Telefone || "",
        dataSaida: fmtDate(initialData.Data_Saida || ""),
        saidaEquip: typeof initialData.saidaEquip === 'string' && !initialData.saidaEquip.includes('-') && !initialData.saidaEquip.includes('/') ? initialData.saidaEquip : "", 
        fonteCabo: initialData.fonteCabo === true || initialData.fonteCabo === 'true' || false,
      });
    } else {
      // Quando não há dados iniciais (Novo Cadastro), reseta para o estado vazio
      form.reset({
        tecnico: "",
        secaoDitel: "",
        tEquipSuporte: "",
        solicitante: "",
        unidade: "",
        dataEnt: "",
        nPae: "",
        rp: "",
        nSerie: "",
        defeitoRecl: "",
        analiseTecnica: "",
        servico: "",
        garantia: "",
        dataEnvio: "",
        dataRetorno: "",
        laudoTecnico: "",
        telefone: "",
        dataSaida: "",
        saidaEquip: "",
        fonteCabo: false,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit, handleError)} className="flex flex-col h-full">
        <fieldset disabled={readOnly} className="flex-1 flex flex-col min-h-0 border-none p-0 m-0">
          <Tabs defaultValue="identificacao" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full inline-flex p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl mb-6 gap-1 overflow-x-auto overflow-y-hidden no-scrollbar justify-start border border-slate-200/50 dark:border-slate-700/50">
            <TabsTrigger value="identificacao" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-700 data-[state=active]:text-[#004e9a] data-[state=active]:dark:text-white data-[state=active]:shadow-sm rounded-lg px-5 md:px-8 py-2.5 font-bold uppercase tracking-wider text-[11px] md:text-sm transition-all duration-300 data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-200/50 whitespace-nowrap">
              Identificação
            </TabsTrigger>
            <TabsTrigger value="analise" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-700 data-[state=active]:text-[#004e9a] data-[state=active]:dark:text-white data-[state=active]:shadow-sm rounded-lg px-5 md:px-8 py-2.5 font-bold uppercase tracking-wider text-[11px] md:text-sm transition-all duration-300 data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-200/50 whitespace-nowrap">
              Análise & Serviço
            </TabsTrigger>
            {isEditMode && (
              <TabsTrigger value="historico" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-700 data-[state=active]:text-[#004e9a] data-[state=active]:dark:text-white data-[state=active]:shadow-sm rounded-lg px-5 md:px-8 py-2.5 font-bold uppercase tracking-wider text-[11px] md:text-sm transition-all duration-300 data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-200/50 whitespace-nowrap">
                Histórico
              </TabsTrigger>
            )}
          </TabsList>

          <div className="flex-1 overflow-y-auto px-1 md:px-4 pb-4 custom-scrollbar relative">
            
            {/* STEPPER VISUAL */}
            <div className="mb-8 px-2">
              <div className="flex items-center justify-between max-w-2xl mx-auto relative">
                {/* Line Background */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-800 -translate-y-1/2 z-0" />
                
                {/* Step 1: Entrada */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    form.getValues("dataEnt") ? "bg-[#004e9a] border-[#004e9a] text-white shadow-lg" : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                  )}>
                    <Calendar className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Entrada</span>
                </div>

                {/* Step 2: Triagem */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    form.getValues("tecnico") || form.getValues("defeitoRecl") ? "bg-[#004e9a] border-[#004e9a] text-white shadow-lg" : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                  )}>
                    <Stethoscope className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Análise</span>
                </div>

                {/* Step 3: Pronto */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    (form.watch("servico") === "PRONTO" || form.watch("servico") === "LAUDO") ? "bg-emerald-500 border-emerald-500 text-white shadow-lg" : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                  )}>
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Pronto</span>
                </div>

                {/* Step 4: Saída */}
                <div className="relative z-10 flex flex-col items-center gap-2">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                    form.getValues("dataSaida") ? "bg-indigo-600 border-indigo-600 text-white shadow-lg" : "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                  )}>
                    <Layout className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-tighter">Entregue</span>
                </div>
              </div>
            </div>

            {/* ALERTA DE HISTÓRICO */}
            {historyMatches.length > 0 && (
              <div className="mb-6 animate-in slide-in-from-top-4 duration-300 shrink-0">
                <div className="bg-amber-50 dark:bg-amber-950/30 border-2 border-amber-200 dark:border-amber-900/50 p-4 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500 rounded-xl text-white">
                      <History className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-black text-amber-900 dark:text-amber-400 uppercase tracking-tighter text-sm">Atenção: Equipamento Recorrente</h4>
                      <p className="text-xs text-amber-700 dark:text-amber-500">Foram encontradas <strong>{historyMatches.length} passagens anteriores</strong> para este Serial/RP no banco de dados.</p>
                    </div>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-amber-700 dark:text-amber-400 font-bold hover:bg-amber-100 dark:hover:bg-amber-900/50 uppercase text-[10px]"
                    onClick={() => {
                      if (onNavigate) {
                        toast.info("Redirecionando para o registro mais recente...");
                        // This is a placeholder for navigation, normally we'd show a list
                      }
                    }}
                  >
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            )}
            
            {/* ABA 1: IDENTIFICAÇÃO */}
            <TabsContent value="identificacao" className="m-0 space-y-6">
              <div className="p-6 bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5 relative overflow-hidden transition-all focus-within:shadow-[0_8px_30px_rgba(0,78,154,0.08)] focus-within:border-[#004e9a]/30">
                <div className="absolute top-0 left-0 w-1 bottom-0 bg-[#004e9a]/80" />
                <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  Informações Principais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField control={form.control} name="os" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">OS (Auto)</FormLabel>
                      <FormControl><Input className="h-10 bg-muted/40 font-mono font-bold text-pmpa-navy" readOnly {...field} value={initialData ? field.value : nextOs} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tecnico" render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <User className="w-3 h-3 text-[#004e9a]" /> Técnico Responsável
                      </FormLabel>
                      <FormControl><Input className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="secaoDitel" render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Building className="w-3 h-3 text-[#004e9a]" /> Seção
                      </FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="SUPORTE">Suporte</SelectItem><SelectItem value="TELECOM">Telecom</SelectItem></SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="telefone" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#004e9a]" /> Telefone
                      </FormLabel>
                      <FormControl><Input className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <FormField control={form.control} name="tEquipSuporte" render={({ field }) => (
                    <FormItem><FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Equipamento (Suporte/TI)</FormLabel><EquipCombobox value={field.value} onChange={field.onChange} /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="bateria" render={({ field }) => (
                    <FormItem><FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Bateria</FormLabel><FormControl><Input className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" {...field} /></FormControl></FormItem>
                  )} />
                </div>
              </div>

              <div className="p-6 bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5 relative overflow-hidden transition-all focus-within:shadow-[0_8px_30px_rgba(0,78,154,0.08)] focus-within:border-[#004e9a]/30">
                <div className="absolute top-0 left-0 w-1 bottom-0 bg-[#004e9a]/60" />
                <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  Dados de Entrada
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <FormField control={form.control} name="solicitante" render={({ field }) => (
                    <FormItem><FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Solicitante</FormLabel><FormControl><Input className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="dataEnt" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest flex gap-1">
                        Data Entrada <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl><Input type="date" className="h-10 border-pmpa-navy/20 focus:ring-pmpa-navy" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="unidade" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest flex gap-1">
                        Unidade <span className="text-red-500">*</span>
                      </FormLabel>
                      <UnidadeCombobox value={field.value} onChange={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="nPae" render={({ field }) => (
                    <FormItem><FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Nº PAE</FormLabel><FormControl><Input className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="rp" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#004e9a]" /> RP
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className="h-11 bg-slate-50 dark:bg-slate-900/50 transition-all rounded-xl" 
                          {...field} 
                          onBlur={(e) => checkHistory('rp', e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="nSerie" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                        <Hash className="w-3 h-3 text-[#004e9a]" /> Nº Série / Patrimônio
                      </FormLabel>
                      <FormControl>
                        <Input 
                          className="h-11 bg-slate-50 dark:bg-slate-900/50 transition-all rounded-xl" 
                          {...field} 
                          onBlur={(e) => checkHistory('nSerie', e.target.value)}
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="fonteCabo" render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-xl border border-border/80 p-4 bg-muted/10">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-bold text-sm cursor-pointer text-pmpa-navy">EQUIPAMENTO ACOMPANHA FONTE E CABO</FormLabel>
                  </FormItem>
                )} />
              </div>
            </TabsContent>

            {/* ABA 2: ANÁLISE & SERVIÇO */}
            <TabsContent value="analise" className="m-0 space-y-6">
              <div className="p-6 bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5 relative overflow-hidden transition-all focus-within:shadow-[0_8px_30px_rgba(0,78,154,0.08)] focus-within:border-[#004e9a]/30">
                <div className="absolute top-0 left-0 w-1 bottom-0 bg-[#004e9a]/80" />
                <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  Diagnóstico
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="defeitoRecl" render={({ field }) => (
                    <FormItem><FormLabel className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest">Defeito Reclamado</FormLabel>
                      <FormControl><Textarea {...field} className="min-h-[160px] text-sm leading-relaxed p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium custom-scrollbar" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="analiseTecnica" render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest">Análise Técnica Preliminar</FormLabel>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-500" /> Sugestões:
                          </span>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-[9px] uppercase font-bold border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                            onClick={() => form.setValue("analiseTecnica", "Realizado backup dos dados e formatação completa do sistema.")}
                          >
                            Backup & Formatação
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-[9px] uppercase font-bold border-blue-200 hover:bg-blue-50 text-blue-700"
                            onClick={() => form.setValue("analiseTecnica", "Executada limpeza interna preventiva para remoção de poeira e oxidação.")}
                          >
                            Limpeza Interna
                          </Button>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm" 
                            className="h-6 text-[9px] uppercase font-bold border-purple-200 hover:bg-purple-50 text-purple-700"
                            onClick={() => form.setValue("analiseTecnica", "Substituição de bateria por componente novo e testes de autonomia realizados.")}
                          >
                            Troca de Bateria
                          </Button>
                        </div>
                      </div>
                      <FormControl><Textarea {...field} className="min-h-[160px] text-sm leading-relaxed p-4 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium custom-scrollbar" /></FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>

              <div className="p-6 bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-5 relative overflow-hidden transition-all focus-within:shadow-[0_8px_30px_rgba(0,78,154,0.08)] focus-within:border-[#004e9a]/30">
                <div className="absolute top-0 left-0 w-1 bottom-0 bg-[#004e9a]/60" />
                <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-2">
                  Conclusão e Saída
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="servico" render={({ field }) => (
                    <FormItem><FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Status do Serviço</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="PRONTO">PRONTO</SelectItem>
                          <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                          <SelectItem value="LAUDO">LAUDO</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="garantia" render={({ field }) => (
                    <FormItem><FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Garantia</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="sim">Sim</SelectItem><SelectItem value="nao">Não</SelectItem></SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dataSaida" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Data / Hora Saída Definitiva</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          className="h-10 border-red-200 focus:ring-red-500 bg-red-50/20" 
                          {...field} 
                        />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="saidaEquip" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-[#004e9a] uppercase tracking-widest">Quem Recebeu (Nome / RG)</FormLabel>
                      <FormControl><Input className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" placeholder="Nome do recebedor..." {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dataEnvio" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data de Envio (Manutenção Ext.)</FormLabel>
                      <FormControl><Input type="date" className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dataRetorno" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Data de Retorno (Manutenção Ext.)</FormLabel>
                      <FormControl><Input type="date" className="h-11 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-900 focus:border-[#004e9a]/40 dark:focus:border-[#004e9a]/60 focus:ring-4 focus:ring-[#004e9a]/10 dark:focus:ring-[#004e9a]/20 transition-all rounded-xl shadow-sm text-slate-800 dark:text-slate-100 font-medium" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField control={form.control} name="laudoTecnico" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Laudo Técnico Final</FormLabel>
                      <FormControl>
                        <Textarea className="h-32 p-4 text-sm leading-relaxed border-slate-200 focus:ring-pmpa-navy focus:border-pmpa-navy" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>
            </TabsContent>
            
            {isEditMode && initialData && (
              <TabsContent value="historico" className="m-0 space-y-6 animate-in fade-in-50 duration-500">
                <div className="p-8 bg-white/95 dark:bg-slate-900/95 border border-slate-200/60 dark:border-white/10 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden transition-all">
                  <div className="absolute top-0 left-0 w-1 bottom-0 bg-emerald-500/80" />
                  <h3 className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800 pb-3 mb-8 flex items-center gap-2">
                    Linha do Tempo de Vida
                  </h3>

                  <div className="relative space-y-8 left-4 border-l-2 border-slate-100 dark:border-slate-800 pl-8 pb-4">
                    {/* Evento 1: Entrada */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-blue-500 border-4 border-white dark:border-slate-900 shadow-sm" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Chegada no Ditel</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {initialData.Data_Ent ? new Date(initialData.Data_Ent).toLocaleDateString('pt-BR') : 'Data não registrada'}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">Equipamento foi cadastrado e deu entrada para triagem técnica.</p>
                      </div>
                    </div>

                    {/* Evento 2: Análise Técnica */}
                    <div className="relative">
                      <div className="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-amber-500 border-4 border-white dark:border-slate-900 shadow-sm" />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Análise Técnica</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">Técnico: {initialData.Tecnico || initialData.tecnico || 'Não atribuído'}</span>
                        <p className="text-xs text-slate-500 mt-1 italic line-clamp-2">
                          "{initialData.Defeito_Recl || 'Nenhuma observação de defeito registrada.'}"
                        </p>
                      </div>
                    </div>

                    {/* Evento 3: Saída / Conclusão */}
                    <div className="relative">
                      <div className={`absolute -left-[41px] top-1 w-5 h-5 rounded-full border-4 border-white dark:border-slate-900 shadow-sm ${initialData.Data_Saida ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${initialData.Data_Saida ? 'text-emerald-500' : 'text-slate-400'}`}>Saída Definitiva</span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                          {initialData.Data_Saida ? new Date(initialData.Data_Saida).toLocaleDateString('pt-BR') : 'Aguardando entrega'}
                        </span>
                        <p className="text-xs text-slate-500 mt-1">
                          {initialData.saidaEquip ? `Recebido por: ${initialData.saidaEquip}` : 'Equipamento ainda se encontra no departamento ou em manutenção.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            )}
          </div>
        </Tabs>
        </fieldset>

        {/* Barra de Ações Interna ao Formulário */}
        <div className="mt-6 bg-muted/20 flex flex-col md:flex-row items-center justify-between gap-3 p-2 md:p-3 -mx-2 md:-mx-4 rounded-b-xl border-t border-slate-100 dark:border-slate-800">
          <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
            {lastSaved && !readOnly && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-widest shrink-0">
                <Save className="w-3 h-3 text-emerald-500" /> Rascunho Salvo {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
            
            {readOnly && (
              <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 font-black uppercase tracking-widest text-[10px] py-1 px-4">
                🔒 Modo de Visualização
              </Badge>
            )}

            {/* Grupo de Navegação Unificado */}
            {onNavigate && (
              <div className="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 shadow-sm">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onNavigate('prev')}
                  disabled={!hasPrev}
                  className="h-9 gap-2 text-pmpa-navy hover:bg-pmpa-navy/5 font-bold px-3 transition-all"
                  title="OS Anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="text-[10px] uppercase">Anterior</span>
                </Button>
                
                <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-0.5" />

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => onNavigate('next')}
                  disabled={!hasNext}
                  className="h-9 gap-2 text-pmpa-navy hover:bg-pmpa-navy/5 font-bold px-3 transition-all"
                  title="Próxima OS"
                >
                  <span className="text-[10px] uppercase">Próximo</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap md:flex-nowrap w-full md:w-auto gap-2 justify-center md:justify-end items-center">
            <div className="flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 mr-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onPrint?.('entrada')}
                className="h-10 gap-1 md:gap-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold px-2 md:px-3 rounded-lg transition-all"
                disabled={!initialData}
                title="Imprimir Guia de Entrada"
              >
                <Printer className="h-4 w-4" />
                <span className="text-[10px] uppercase">Entrada</span>
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                onClick={() => onPrint?.('laudo')}
                className="h-10 gap-1 md:gap-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold px-2 md:px-3 rounded-lg transition-all"
                disabled={!initialData}
                title="Imprimir Laudo Técnico"
              >
                <Printer className="h-4 w-4" />
                <span className="text-[10px] uppercase">Laudo</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={() => onPrint?.('saida')}
                className="h-10 gap-1 md:gap-2 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 font-bold px-2 md:px-3 rounded-lg transition-all"
                disabled={!initialData}
                title="Imprimir Guia de Saída"
              >
                <Printer className="h-4 w-4" />
                <span className="text-[10px] uppercase">Saída</span>
              </Button>
            </div>
            
            {!readOnly && (
              <Button
                type="submit"
                className="bg-pmpa-navy hover:bg-pmpa-navy/90 text-white h-10 md:h-12 px-6 md:px-10 font-black shadow-lg shadow-pmpa-navy/20 uppercase tracking-tighter text-xs md:text-base border-b-4 border-pmpa-navy/50 active:border-b-0 active:translate-y-1 transition-all flex-1 md:flex-none"
              >
                {isEditMode || initialData ? <Save className="w-4 h-4 mr-2" /> : null}
                {isEditMode || initialData ? "Atualizar Registro" : "Finalizar Cadastro"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};
