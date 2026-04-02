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
import { useEffect } from "react";
import { UnidadeCombobox } from "./UnidadeCombobox";
import { API_BASE } from "../lib/api-config";

const formSchema = z.object({
  os: z.union([z.string(), z.number()]).transform(v => String(v)),
  secao: z.string().min(1, "Seção é obrigatória"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  data: z.string().min(1, "Data é obrigatória"),
  tecnicos: z.string().optional(),
  def_recla: z.string().optional(),
  solicitante: z.string().optional(),
  n_pae: z.string().optional(),
  servico: z.string().min(1, "Serviço é obrigatório"),
  analise: z.string().optional(),
  observacao: z.string().optional(),
  solucao: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ServicoInternoExternoFormProps {
  id?: string;
  initialData?: any;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export const ServicoInternoExternoForm = ({
  id,
  initialData,
  onSubmit,
  onCancel,
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
        const date = new Date(d);
        return isNaN(date.getTime()) ? "" : date.toISOString().split('T')[0];
      };

      reset({
        os: String(initialData.os || initialData.Id_cod || ""),
        secao: initialData.secao || initialData.Seção_Ditel || initialData.Seção || initialData.Secao || "",
        unidade: initialData.unidade || initialData.Unidade || "",
        data: fmtDate(initialData.data || initialData.Data_Ent || initialData.Data),
        tecnicos: initialData.tecnicos || initialData.Tecnico || initialData.Técnicos || initialData.Técnico || "",
        def_recla: initialData.def_recla || initialData.Defeito_Recl || initialData.Defeito || "",
        solicitante: initialData.solicitante || initialData.Solicitante || "",
        n_pae: initialData.n_pae || initialData.Nº_PAE || "",
        servico: initialData.servico || initialData.Serviço || "",
        analise: initialData.analise || initialData.Analise_Tecnica || initialData.Analise || "",
        observacao: initialData.observacao || initialData.Observaçoes || initialData.Observacao || "",
        solucao: initialData.solucao || initialData.Solução || initialData.Solucao || initialData.Soluçao || "",
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
        servico: "",
        analise: "",
        observacao: "",
        solucao: "",
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
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto pr-3 space-y-4 custom-scrollbar px-1 py-1">
        
        {/* Row 1: OS, Seção, Unidade */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-1">
          <div className="md:col-span-2 space-y-1.5">
            <Label htmlFor="os" className="text-sm font-bold uppercase text-pmpa-navy">OS (MISSÃO) *</Label>
            <Input
              id="os"
              disabled
              {...register("os")}
              placeholder="Gerado Auto."
              className={`h-10 bg-muted font-bold text-lg text-center ${errors.os ? "border-destructive" : ""}`}
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="secao" className="text-sm font-bold uppercase text-pmpa-navy">Seção *</Label>
            <Select onValueChange={(value) => setValue("secao", value)} value={watch("secao")}>
              <SelectTrigger className={`h-10 ${errors.secao ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SUPORTE">Suporte</SelectItem>
                <SelectItem value="TELECOM">Telecom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-sm font-bold uppercase text-pmpa-navy">Unidade *</Label>
            <UnidadeCombobox
              value={watch("unidade")}
              onChange={(value) => setValue("unidade", value, { shouldValidate: true })}
            />
            {errors.unidade && <p className="text-xs text-destructive">{errors.unidade.message}</p>}
          </div>
        </div>

        {/* Row 2: Data, Técnicos */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="space-y-1.5 lg:col-span-1">
            <Label htmlFor="data" className="text-sm font-bold uppercase text-pmpa-navy">Data *</Label>
            <Input id="data" type="date" {...register("data")} className={`h-10 ${errors.data ? "border-destructive" : ""}`} />
          </div>

          <div className="space-y-1.5 md:col-span-3 lg:col-span-4">
            <Label htmlFor="tecnicos" className="text-sm font-bold uppercase text-pmpa-navy">Técnicos</Label>
            <Input id="tecnicos" {...register("tecnicos")} placeholder="Nome dos técnicos" className="h-10" />
          </div>
        </div>

        {/* Row 3: Solicitante, PAE, Serviço, Reclamação */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="solicitante" className="text-sm font-bold uppercase text-pmpa-navy">Solicitante</Label>
            <Input id="solicitante" {...register("solicitante")} placeholder="Solicitante" className="h-10" />
          </div>

          <div className="space-y-1.5 md:col-span-1">
            <Label htmlFor="n_pae" className="text-sm font-bold uppercase text-pmpa-navy">Nº PAE</Label>
            <Input id="n_pae" {...register("n_pae")} placeholder="PAE" className="h-10" />
          </div>

          <div className="space-y-1.5 lg:col-span-1">
            <Label htmlFor="servico" className="text-sm font-bold uppercase text-pmpa-navy">Serviço *</Label>
            <Select onValueChange={(value) => setValue("servico", value)} value={watch("servico")}>
              <SelectTrigger className={`h-10 ${errors.servico ? "border-destructive" : ""}`}>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interno">Interno</SelectItem>
                <SelectItem value="externo">Externo</SelectItem>
                <SelectItem value="remoto">Remoto</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="manutencao">Manutenção</SelectItem>
                <SelectItem value="instalacao">Instalação</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label htmlFor="def_recla" className="text-sm font-bold uppercase text-pmpa-navy">Defeito/Reclamação</Label>
            <Input id="def_recla" {...register("def_recla")} placeholder="Descreva brevemente" className="h-10" />
          </div>
        </div>

        {/* Areas: Solução Aplicada (Único campo de detalhamento agora) */}
        <div className="space-y-1.5 pb-2">
          <Label htmlFor="solucao" className="text-sm font-bold uppercase text-pmpa-navy">Solução Aplicada</Label>
          <Textarea 
            id="solucao" 
            {...register("solucao")} 
            placeholder="Descreva a solução aplicada na missão..." 
            className="min-h-[150px] text-base resize-none border-pmpa-navy/20 focus-visible:ring-pmpa-navy shadow-inner bg-card" 
          />
        </div>
      </div>
    </form>
  );
};
