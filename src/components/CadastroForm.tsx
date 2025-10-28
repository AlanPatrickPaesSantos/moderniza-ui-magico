import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Calendar } from "lucide-react";

const cadastroSchema = z.object({
  codigo: z.string().optional(),
  tecnico: z.string().min(1, "Técnico é obrigatório"),
  secaoDitel: z.string().optional(),
  tEquipoTelecom: z.string().optional(),
  tEquipSuporte: z.string().optional(),
  solicitante: z.string().min(1, "Solicitante é obrigatório"),
  dataEnt: z.string().optional(),
  unidade: z.string().optional(),
  nPae: z.string().optional(),
  rp: z.string().optional(),
  nSerie: z.string().optional(),
  defeitoRecl: z.string().optional(),
  analiseTecnica: z.string().optional(),
  servico: z.string().optional(),
  garantia: z.string().optional(),
  dataEnvio: z.string().optional(),
  telefone: z.string().optional(),
  dataRetorno: z.string().optional(),
  bateria: z.string().optional(),
  atendenteDitel: z.string().optional(),
  horasRebimento: z.string().optional(),
  laudoTecnico: z.string().optional(),
  fonteCabo: z.boolean().default(false),
  outrosPerifericos: z.string().optional(),
  saidaEquip: z.string().optional(),
  recebedorUndSecao: z.string().optional(),
  obs: z.string().optional(),
});

type CadastroFormValues = z.infer<typeof cadastroSchema>;

interface CadastroFormProps {
  onSubmit: (data: CadastroFormValues) => void;
  onCancel: () => void;
}

export const CadastroForm = ({ onSubmit, onCancel }: CadastroFormProps) => {
  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      fonteCabo: false,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Informações Principais */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Informações Principais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="codigo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input placeholder="(Novo)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tecnico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Técnico *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do técnico" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secaoDitel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Seção Ditel</FormLabel>
                  <FormControl>
                    <Input placeholder="Seção" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="tEquipoTelecom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>T_EquipoTelecom</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="radio">Rádio</SelectItem>
                      <SelectItem value="telefone">Telefone</SelectItem>
                      <SelectItem value="computador">Computador</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tEquipSuporte"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>T_EquipSuporte</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="notebook">Notebook</SelectItem>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="impressora">Impressora</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Dados do Equipamento */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Dados do Equipamento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="solicitante"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Solicitante *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do solicitante" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dataEnt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Entrada</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="unidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unidade</FormLabel>
                  <FormControl>
                    <Input placeholder="Unidade" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="nPae"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº PAE</FormLabel>
                  <FormControl>
                    <Input placeholder="Número PAE" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="rp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RP</FormLabel>
                  <FormControl>
                    <Input placeholder="RP" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nSerie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nº Série</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de série" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Análise e Serviço */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Análise e Serviço
          </h3>
          <FormField
            control={form.control}
            name="defeitoRecl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Defeito Reclamado</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Descreva o defeito reclamado" 
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="analiseTecnica"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Análise Técnica</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Análise técnica detalhada" 
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="servico"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serviço</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="reparo">Reparo</SelectItem>
                      <SelectItem value="manutencao">Manutenção</SelectItem>
                      <SelectItem value="configuracao">Configuração</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="garantia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Garantia</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="sim">Sim</SelectItem>
                      <SelectItem value="nao">Não</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Datas e Contato */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Datas e Contato
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="dataEnvio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Envio</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dataRetorno"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data Retorno</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input placeholder="Telefone de contato" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="bateria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bateria</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Status da bateria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="boa">Boa</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="ruim">Ruim</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="atendenteDitel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Atendente/Ditel</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do atendente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="horasRebimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horas/Rebimento</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
            Informações Adicionais
          </h3>
          <FormField
            control={form.control}
            name="laudoTecnico"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Laudo Técnico</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Laudo técnico completo" 
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fonteCabo"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Fonte e Cabo</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="outrosPerifericos"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Outros Periféricos</FormLabel>
                  <FormControl>
                    <Input placeholder="Descreva outros periféricos" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="saidaEquip"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saída Equipamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Data/hora de saída" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="recebedorUndSecao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recebedor/Und/Seção</FormLabel>
                  <FormControl>
                    <Input placeholder="Quem recebeu" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="obs"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Observações adicionais" 
                    className="resize-none"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            Salvar Cadastro
          </Button>
        </div>
      </form>
    </Form>
  );
};
