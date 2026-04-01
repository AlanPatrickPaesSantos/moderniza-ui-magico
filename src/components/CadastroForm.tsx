import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  unidade: z.string().optional(),
  dataEnt: z.string().optional(),
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
  fonteCabo: z.boolean().default(false),
});

type CadastroFormValues = z.infer<typeof cadastroSchema>;

interface CadastroFormProps {
  onSubmit: (data: CadastroFormValues) => void | Promise<void>;
  onCancel: () => void;
  initialData?: any;
  id?: string;
}

export const CadastroForm = ({ onSubmit, initialData, id = "cadastro-form" }: CadastroFormProps) => {
  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      fonteCabo: false,
      saidaEquip: "",
    },
  });

  const [nextOs, setNextOs] = useState<string>("");

  useEffect(() => {
    if (!initialData) {
      fetch("http://localhost:5001/api/servicos/next-os")
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
        const date = new Date(d);
        return isNaN(date.getTime()) ? "" : date.toISOString().split('T')[0];
      };

      form.reset({
        os: initialData.Id_cod?.toString() || "",
        tecnico: initialData.Tecnico || "",
        secaoDitel: initialData.Seção_Ditel || "",
        tEquipSuporte: initialData.T_EquipSuporte || initialData.T_EquipTelecom || "",
        solicitante: initialData.Solicitante || "",
        unidade: initialData.Unidade || "",
        dataEnt: fmtDate(initialData.Data_Ent),
        nPae: initialData.Nº_PAE || "",
        rp: initialData.RP || "",
        nSerie: initialData.Nº_Serie || "",
        defeitoRecl: initialData.Defeito_Recl || "",
        analiseTecnica: initialData.Analise_Tecnica || "",
        servico: initialData.Serviço || "",
        garantia: initialData.Garantia || "",
        dataEnvio: fmtDate(initialData.Data_Envio),
        dataRetorno: fmtDate(initialData.Data_Retorno),
        laudoTecnico: initialData.Laudo_Tecnico || "",
        telefone: initialData.telefone || "",
        saidaEquip: initialData.Data_Saida || initialData.saidaEquip || "",
        fonteCabo: initialData.fonteCabo || false,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form id={id} onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <Tabs defaultValue="identificacao" className="flex-1 flex flex-col min-h-0">
          <TabsList className="w-full justify-start border-b rounded-none px-0 mb-3 bg-transparent border-border/50 gap-4 shrink-0 h-auto">
            <TabsTrigger value="identificacao" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-pmpa-navy rounded-none px-2 py-3 font-bold uppercase tracking-wider text-sm transition-all">
              Identificação & Equipamento
            </TabsTrigger>
            <TabsTrigger value="analise" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-pmpa-navy rounded-none px-2 py-3 font-bold uppercase tracking-wider text-sm transition-all">
              Análise & Serviço
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pl-4 pr-2 pb-8 custom-scrollbar">
            
            {/* ABA 1: IDENTIFICAÇÃO */}
            <TabsContent value="identificacao" className="m-0 space-y-5">
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-pmpa-navy uppercase tracking-widest border-b border-border/50 pb-1">Informações Principais</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="os" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold text-muted-foreground">OS (Gerada Automática)</FormLabel>
                      <FormControl><Input className="h-10 bg-muted/40 font-mono font-bold text-pmpa-navy" readOnly {...field} value={initialData ? field.value : nextOs} /></FormControl>
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="tecnico" render={({ field }) => (
                    <FormItem className="md:col-span-2"><FormLabel className="text-sm font-semibold">Técnico Responsável</FormLabel><FormControl><Input className="h-10" {...field} /></FormControl></FormItem>
                  )} />
                </div>
                <FormField control={form.control} name="tEquipSuporte" render={({ field }) => (
                  <FormItem><FormLabel className="text-sm font-semibold">Tipo de Equipamento</FormLabel><EquipCombobox value={field.value} onChange={field.onChange} /></FormItem>
                )} />
              </div>

              <div className="space-y-4 pt-4 border-t border-border/20">
                <h3 className="text-sm font-bold text-pmpa-navy uppercase tracking-widest border-b border-border/50 pb-1">Dados de Entrada</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField control={form.control} name="solicitante" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Solicitante</FormLabel><FormControl><Input className="h-10" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="dataEnt" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Data Entrada</FormLabel><FormControl><Input type="date" className="h-10" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="unidade" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Unidade</FormLabel><UnidadeCombobox value={field.value} onChange={field.onChange} /></FormItem>
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
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-pmpa-navy uppercase tracking-widest border-b border-border/50 pb-1">Diagnóstico</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name="defeitoRecl" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Defeito Reclamado</FormLabel><FormControl><Textarea className="resize-none h-32" {...field} /></FormControl></FormItem>
                  )} />
                  <FormField control={form.control} name="analiseTecnica" render={({ field }) => (
                    <FormItem><FormLabel className="text-sm font-semibold">Análise Técnica Preliminar</FormLabel><FormControl><Textarea className="resize-none h-32" {...field} /></FormControl></FormItem>
                  )} />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/20">
                <h3 className="text-sm font-bold text-pmpa-navy uppercase tracking-widest border-b border-border/50 pb-1">Conclusão e Saída</h3>
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
                  <FormField control={form.control} name="saidaEquip" render={({ field }) => (
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
                
                <div className="grid grid-cols-1 gap-4">
                  <FormField control={form.control} name="laudoTecnico" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-semibold">Laudo Técnico Final</FormLabel>
                      <FormControl>
                        <Textarea className="resize-none h-32" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </form>
    </Form>
  );
};
