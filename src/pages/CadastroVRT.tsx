import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Save, Trash2, ChevronFirst, ChevronLeft, ChevronRight, ChevronsRight, Search, Wifi } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const CadastroVRT = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    ordem: "",
    numPAE: "",
    unidadeVrt: "",
    dataServico: "",
    tecnico: "",
    defeito: "",
    solicitante: "",
    placaVRT: "",
    preFixo: "0",
    modRadio: "",
    kmVrt: "0",
    numSerie: "",
    defCons: "",
    solucao: "",
    servicos: "",
  });

  const [checkboxes, setCheckboxes] = useState({
    progPadraoFreqRadioHTs: false,
    progPadraoFreqRadioFixo: false,
    manutCorretRadioHT: false,
    manutCorretRadioMovel: false,
    vistAnaliseRadioMoveis: false,
    progPadraoRadioMovel: false,
    vistRadioFixos: false,
    vistAnaliseRadio: false,
    vistRadioPortateis: false,
    manutCorretAntenaBaseFixa: false,
    manutCorretAntenaVTR: false,
    levantSituaRedeRadio: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Cadastro VRT salvo:", { ...formData, ...checkboxes });
    toast.success("Cadastro VRT salvo com sucesso!");
  };

  const handleDelete = () => {
    toast.success("Registro excluído com sucesso!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
        
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Cadastro VRT - TELECOM
            </h1>
            <p className="text-muted-foreground">
              Gerenciamento de equipamentos e serviços de telecomunicações
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="bg-card rounded-lg shadow-[var(--shadow-card)] border border-border p-6 space-y-6">
              {/* Primeira linha - Ordem, Novo, Nº/PAE */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ordem">Ordem</Label>
                  <Input
                    id="ordem"
                    value={formData.ordem}
                    onChange={(e) => setFormData({ ...formData, ordem: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numPAE">Nº/PAE</Label>
                  <Input
                    id="numPAE"
                    value={formData.numPAE}
                    onChange={(e) => setFormData({ ...formData, numPAE: e.target.value })}
                  />
                </div>
              </div>

              {/* Segunda linha - UnidadeVrt, Data Serviço, Técnico */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unidadeVrt">UnidadeVrt</Label>
                  <Select value={formData.unidadeVrt} onValueChange={(value) => setFormData({ ...formData, unidadeVrt: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unidade1">Unidade 1</SelectItem>
                      <SelectItem value="unidade2">Unidade 2</SelectItem>
                      <SelectItem value="unidade3">Unidade 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataServico">Data Serviço</Label>
                  <Input
                    id="dataServico"
                    type="date"
                    value={formData.dataServico}
                    onChange={(e) => setFormData({ ...formData, dataServico: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tecnico">Técnico</Label>
                  <Input
                    id="tecnico"
                    value={formData.tecnico}
                    onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                  />
                </div>
              </div>

              {/* Defeito */}
              <div className="space-y-2">
                <Label htmlFor="defeito">Defeito</Label>
                <Textarea
                  id="defeito"
                  value={formData.defeito}
                  onChange={(e) => setFormData({ ...formData, defeito: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              {/* Solicitante */}
              <div className="space-y-2">
                <Label htmlFor="solicitante">Solicitante</Label>
                <Input
                  id="solicitante"
                  value={formData.solicitante}
                  onChange={(e) => setFormData({ ...formData, solicitante: e.target.value })}
                />
              </div>

              {/* Linha - PlacaVRT, Pre_fixo, Mod_Radio, km_vrt, Nº/Serie */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="placaVRT">PlacaVRT</Label>
                  <Input
                    id="placaVRT"
                    value={formData.placaVRT}
                    onChange={(e) => setFormData({ ...formData, placaVRT: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preFixo">Pre_fixo</Label>
                  <Input
                    id="preFixo"
                    type="number"
                    value={formData.preFixo}
                    onChange={(e) => setFormData({ ...formData, preFixo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="modRadio">Mod_Radio</Label>
                  <Input
                    id="modRadio"
                    value={formData.modRadio}
                    onChange={(e) => setFormData({ ...formData, modRadio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="kmVrt">km_vrt</Label>
                  <Input
                    id="kmVrt"
                    type="number"
                    value={formData.kmVrt}
                    onChange={(e) => setFormData({ ...formData, kmVrt: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="numSerie">Nº/Serie</Label>
                  <Input
                    id="numSerie"
                    value={formData.numSerie}
                    onChange={(e) => setFormData({ ...formData, numSerie: e.target.value })}
                  />
                </div>
              </div>

              {/* Grid com Checkboxes e área central */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna esquerda - Checkboxes */}
                <div className="space-y-3">
                  {[
                    { id: "progPadraoFreqRadioHTs", label: "Prog. e padrão. de Freq. Radio HTs" },
                    { id: "progPadraoFreqRadioFixo", label: "Prog. e padrão. de Freq. Radio Fixo" },
                    { id: "manutCorretRadioHT", label: "Manut. Corret. Radio HT (Terceiros)" },
                    { id: "manutCorretRadioMovel", label: "Manut. Corret. Radio Movel (Terceir)" },
                    { id: "vistAnaliseRadioMoveis", label: "Vist. Analise de Radio Moveis" },
                    { id: "progPadraoRadioMovel", label: "Prog. Padrão. de Radio Movel" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id}
                        checked={checkboxes[item.id as keyof typeof checkboxes]}
                        onCheckedChange={(checked) =>
                          setCheckboxes({ ...checkboxes, [item.id]: checked })
                        }
                      />
                      <Label htmlFor={item.id} className="text-sm font-normal cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>

                {/* Coluna central - DeF_Cons, Ícone WiFi, Solução */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="defCons">DeF_Cons</Label>
                    <Textarea
                      id="defCons"
                      value={formData.defCons}
                      onChange={(e) => setFormData({ ...formData, defCons: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="flex justify-center py-4">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg p-8 border border-primary/20">
                      <Wifi className="h-20 w-20 text-primary" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="solucao">Solução</Label>
                    <Textarea
                      id="solucao"
                      value={formData.solucao}
                      onChange={(e) => setFormData({ ...formData, solucao: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                {/* Coluna direita - Mais Checkboxes */}
                <div className="space-y-3">
                  {[
                    { id: "vistRadioFixos", label: "Vist. Radio Fixos" },
                    { id: "vistAnaliseRadio", label: "Vist. e Analise de Radio" },
                    { id: "vistRadioPortateis", label: "Vist. Radio Portateis" },
                    { id: "manutCorretAntenaBaseFixa", label: "Manut. Corret. Antena Base Fixa" },
                    { id: "manutCorretAntenaVTR", label: "Manut. Corret. Antena VTR" },
                    { id: "levantSituaRedeRadio", label: "Levant. Situa. Rede Radio" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={item.id}
                        checked={checkboxes[item.id as keyof typeof checkboxes]}
                        onCheckedChange={(checked) =>
                          setCheckboxes({ ...checkboxes, [item.id]: checked })
                        }
                      />
                      <Label htmlFor={item.id} className="text-sm font-normal cursor-pointer">
                        {item.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Serviços */}
              <div className="space-y-2">
                <Label htmlFor="servicos">Serviços</Label>
                <Select value={formData.servicos} onValueChange={(value) => setFormData({ ...formData, servicos: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o serviço" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="servico1">Serviço 1</SelectItem>
                    <SelectItem value="servico2">Serviço 2</SelectItem>
                    <SelectItem value="servico3">Serviço 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
                <div className="flex gap-2">
                  <Button type="submit" className="gap-2">
                    <Save className="h-4 w-4" />
                    Salvar
                  </Button>
                  <Button type="button" variant="destructive" onClick={handleDelete} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Excluir
                  </Button>
                </div>

                {/* Navegação de registros */}
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" size="icon">
                    <ChevronFirst className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon">
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CadastroVRT;
