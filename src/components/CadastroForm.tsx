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
  tEquipTelecom: z.string().optional(),
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
}

import { Printer, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const CadastroForm = ({ onSubmit, onCancel, onPrint, onNavigate, hasPrev, hasNext, initialData, id = "cadastro-form", isEditMode }: CadastroFormProps) => {
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
      fetch(`${API_BASE}/servicos/next-os`)
        .then(r => r.json())
        .then(d => {
          const osVal = String(d.nextOs);
          setNextOs(osVal);
          form.setValue("os", osVal);
        })
        .catch(() => {});
    }
  }, [initialData, form]);

  useEffect(() => {
    if (initialData) {
      const fmtDate = (d: any) => {
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
        tEquipTelecom: initialData.T_EquipTelecom || initialData.tEquipTelecom || "",
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
        <Tabs defaultValue="identificacao" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full inline-flex p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl mb-6 gap-1 overflow-x-auto overflow-y-hidden no-scrollbar justify-start border border-slate-200/50 dark:border-slate-700/50">
            <TabsTrigger value="identificacao" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-700 data-[state=active]:text-[#004e9a] data-[state=active]:dark:text-white data-[state=active]:shadow-sm rounded-lg px-5 md:px-8 py-2.5 font-bold uppercase tracking-wider text-[11px] md:text-sm transition-all duration-300 data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-200/50 whitespace-nowrap">
              Identificação
            </TabsTrigger>
            <TabsTrigger value="analise" className="data-[state=active]:bg-white data-[state=active]:dark:bg-slate-700 data-[state=active]:text-[#004e9a] data-[state=active]:dark:text-white data-[state=active]:shadow-sm rounded-lg px-5 md:px-8 py-2.5 font-bold uppercase tracking-wider text-[11px] md:text-sm transition-all duration-300 data-[state=inactive]:text-slate-500 data-[state=inactive]:hover:bg-slate-200/50 whitespace-nowrap">
              Análise & Serviço
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto px-1 md:px-4 pb-4 custom-scrollbar relative">
            
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
                      <FormLabel className="text-sm font-semibold text-muted-foreground">OS (Auto)</FormLabel>
                      <FormControl><Input className="h-10 bg-muted/40 font-mono font-bold text-pmpa-navy" readOnly {...field} value={initialData ? field.value : nextOs} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tecnico" render={({ field }) => (
                    <FormItem className="md:col-span-1"><FormLabel className="text-sm font-semibold">Técnico Responsável</FormLabel><FormControl><Input className="h-10" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="secaoDitel" render={({ field }) => (
                    <FormItem className="md:col-span-1">
                      <FormLabel className="text-sm font-semibold">Seção</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent><SelectItem value="SUPORTE">Suporte</SelectItem><SelectItem value="TELECOM">Telecom</SelectItem></SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="telefone" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Telefone</FormLabel><FormControl><Input className="h-10" {...field} /></FormControl></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="tEquipSuporte" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Equipamento (Suporte/TI)</FormLabel><EquipCombobox value={field.value} onChange={field.onChange} /></FormItem>
                  )} />
                  <FormField control={form.control} name="tEquipTelecom" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Equipamento (Telecom/Rádio)</FormLabel><EquipCombobox value={field.value} onChange={field.onChange} /></FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="bateria" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Bateria</FormLabel><FormControl><Input className="h-10" {...field} /></FormControl></FormItem>
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
                    <FormItem><FormLabel className="text-sm font-semibold">Solicitante</FormLabel><FormControl><Input className="h-10" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="dataEnt" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-pmpa-navy flex gap-1">
                        Data Entrada <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl><Input type="date" className="h-10 border-pmpa-navy/20 focus:ring-pmpa-navy" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="unidade" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-bold text-pmpa-navy flex gap-1">
                        Unidade <span className="text-red-500">*</span>
                      </FormLabel>
                      <UnidadeCombobox value={field.value} onChange={field.onChange} />
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="nPae" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Nº PAE</FormLabel><FormControl><Input className="h-10" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="rp" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">RP</FormLabel><FormControl><Input className="h-10" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="nSerie" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Nº Série / Patrimônio</FormLabel><FormControl><Input className="h-10" {...field} /></FormControl></FormItem>
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
                    <FormItem><FormLabel className="text-sm font-bold uppercase text-pmpa-navy">Defeito Reclamado</FormLabel>
                      <FormControl><Textarea {...field} className="min-h-[160px] text-base leading-relaxed p-4 border-pmpa-navy/20 focus:ring-pmpa-navy shadow-inner bg-card transition-all" /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="analiseTecnica" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-bold uppercase text-pmpa-navy">Análise Técnica Preliminar</FormLabel>
                      <FormControl><Textarea {...field} className="min-h-[160px] text-base leading-relaxed p-4 border-pmpa-navy/20 focus:ring-pmpa-navy shadow-inner bg-card transition-all" /></FormControl>
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
                    <FormItem><FormLabel className="text-sm font-semibold">Status do Serviço</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="PRONTO">PRONTO</SelectItem>
                          <SelectItem value="PENDENTE">PENDENTE</SelectItem>
                          <SelectItem value="LAUDO">LAUDO</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="garantia" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Garantia</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="Selecione" /></SelectTrigger></FormControl>
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
                      <FormLabel className="text-sm font-bold uppercase text-pmpa-navy">Quem Recebeu (Nome / RG)</FormLabel>
                      <FormControl><Input className="h-10" placeholder="Nome do recebedor..." {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dataEnvio" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Data de Envio (Manutenção Ext.)</FormLabel>
                      <FormControl><Input type="date" className="h-10" {...field} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="dataRetorno" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Data de Retorno (Manutenção Ext.)</FormLabel>
                      <FormControl><Input type="date" className="h-10" {...field} /></FormControl>
                    </FormItem>
                  )} />
                </div>
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField control={form.control} name="laudoTecnico" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Laudo Técnico Final</FormLabel>
                      <FormControl>
                        <Textarea className="h-32" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

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
              onClick={() => onPrint?.('entrada')}
              className="h-10 md:h-12 gap-1 md:gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold px-2 md:px-4 flex-1 sm:flex-none"
              disabled={!initialData}
            >
              <Printer className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-[10px] md:text-[13px] uppercase">Entrada</span>
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => onPrint?.('laudo')}
              className="h-10 md:h-12 gap-1 md:gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold px-2 md:px-4 flex-1 sm:flex-none"
              disabled={!initialData}
            >
              <Printer className="h-4 w-4 md:h-5 md:w-5" />
              <span className="text-[10px] md:text-[13px] uppercase">Laudo</span>
            </Button>
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
              {isEditMode || initialData ? "Atualizar" : "Finalizar Cadastro"}
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
          </div>
        </div>
      </form>
    </Form>
  );
};
