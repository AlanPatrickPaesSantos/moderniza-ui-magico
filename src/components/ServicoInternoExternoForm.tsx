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

const formSchema = z.object({
  os: z.string().min(1, "OS é obrigatório"),
  secao: z.string().min(1, "Seção é obrigatória"),
  unidade: z.string().min(1, "Unidade é obrigatória"),
  data: z.string().min(1, "Data é obrigatória"),
  horario: z.string().min(1, "Horário é obrigatório"),
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
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export const ServicoInternoExternoForm = ({
  onSubmit,
  onCancel,
}: ServicoInternoExternoFormProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const handleNovoOS = () => {
    const novoOS = `OS${Date.now().toString().slice(-6)}`;
    setValue("os", novoOS);
    toast.success(`Nova OS gerada: ${novoOS}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* OS e Novo Button */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto] gap-4">
        <div className="space-y-2">
          <Label htmlFor="os">OS *</Label>
          <Input
            id="os"
            {...register("os")}
            placeholder="Número da OS"
            className={errors.os ? "border-destructive" : ""}
          />
          {errors.os && (
            <p className="text-sm text-destructive">{errors.os.message}</p>
          )}
        </div>
        <div className="flex items-end">
          <Button type="button" onClick={handleNovoOS} variant="secondary">
            Novo
          </Button>
        </div>
      </div>

      {/* Seção, Unidade, Data, Horário */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="secao">Seção *</Label>
          <Select
            onValueChange={(value) => setValue("secao", value)}
            value={watch("secao")}
          >
            <SelectTrigger className={errors.secao ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="secao1">Seção 1</SelectItem>
              <SelectItem value="secao2">Seção 2</SelectItem>
              <SelectItem value="secao3">Seção 3</SelectItem>
            </SelectContent>
          </Select>
          {errors.secao && (
            <p className="text-sm text-destructive">{errors.secao.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="unidade">Unidade *</Label>
          <Select
            onValueChange={(value) => setValue("unidade", value)}
            value={watch("unidade")}
          >
            <SelectTrigger className={errors.unidade ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unidade1">Unidade 1</SelectItem>
              <SelectItem value="unidade2">Unidade 2</SelectItem>
              <SelectItem value="unidade3">Unidade 3</SelectItem>
            </SelectContent>
          </Select>
          {errors.unidade && (
            <p className="text-sm text-destructive">{errors.unidade.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="data">Data *</Label>
          <Input
            id="data"
            type="date"
            {...register("data")}
            className={errors.data ? "border-destructive" : ""}
          />
          {errors.data && (
            <p className="text-sm text-destructive">{errors.data.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="horario">Horário *</Label>
          <Input
            id="horario"
            type="time"
            {...register("horario")}
            className={errors.horario ? "border-destructive" : ""}
          />
          {errors.horario && (
            <p className="text-sm text-destructive">{errors.horario.message}</p>
          )}
        </div>
      </div>

      {/* Técnicos, Def_Recla */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tecnicos">Técnicos</Label>
          <Input
            id="tecnicos"
            {...register("tecnicos")}
            placeholder="Nome dos técnicos"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="def_recla">Def_Recla</Label>
          <Input
            id="def_recla"
            {...register("def_recla")}
            placeholder="Defeito/Reclamação"
          />
        </div>
      </div>

      {/* Solicitante, Nº_PAE, SERVIÇO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="solicitante">Solicitante</Label>
          <Input
            id="solicitante"
            {...register("solicitante")}
            placeholder="Nome do solicitante"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="n_pae">Nº_PAE</Label>
          <Input
            id="n_pae"
            {...register("n_pae")}
            placeholder="Número PAE"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="servico">SERVIÇO *</Label>
          <Select
            onValueChange={(value) => setValue("servico", value)}
            value={watch("servico")}
          >
            <SelectTrigger className={errors.servico ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="interno">Serviço Interno</SelectItem>
              <SelectItem value="externo">Serviço Externo</SelectItem>
              <SelectItem value="manutencao">Manutenção</SelectItem>
              <SelectItem value="instalacao">Instalação</SelectItem>
            </SelectContent>
          </Select>
          {errors.servico && (
            <p className="text-sm text-destructive">{errors.servico.message}</p>
          )}
        </div>
      </div>

      {/* Analise, Observação, Solução */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="analise">Análise</Label>
          <Textarea
            id="analise"
            {...register("analise")}
            placeholder="Descreva a análise do problema"
            className="min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observacao">Observação</Label>
          <Textarea
            id="observacao"
            {...register("observacao")}
            placeholder="Observações adicionais"
            className="min-h-[120px]"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="solucao">Solução</Label>
        <Textarea
          id="solucao"
          {...register("solucao")}
          placeholder="Descreva a solução aplicada"
          className="min-h-[100px]"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button type="submit" className="flex-1">
          Salvar
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  );
};
