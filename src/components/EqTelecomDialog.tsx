import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Trash2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search, Filter } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EqTelecomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EqTelecomDialog = ({ open, onOpenChange }: EqTelecomDialogProps) => {
  const [currentRecord, setCurrentRecord] = useState(1);
  const [totalRecords] = useState(28);
  const [id, setId] = useState("1");
  const [municipalRu, setMunicipalRu] = useState("TV");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterActive, setFilterActive] = useState(false);

  const handleSave = () => {
    toast({
      title: "Registro salvo",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleDelete = () => {
    toast({
      title: "Registro excluído",
      description: "O registro foi excluído com sucesso.",
      variant: "destructive",
    });
  };

  const handleSearch = () => {
    toast({
      title: "Pesquisando",
      description: `Buscando por: ${searchTerm}`,
    });
  };

  const toggleFilter = () => {
    setFilterActive(!filterActive);
    toast({
      title: filterActive ? "Filtro desativado" : "Filtro ativado",
      description: filterActive ? "Exibindo todos os registros" : "Filtro aplicado aos registros",
    });
  };

  const goToFirst = () => setCurrentRecord(1);
  const goToPrevious = () => setCurrentRecord(Math.max(1, currentRecord - 1));
  const goToNext = () => setCurrentRecord(Math.min(totalRecords, currentRecord + 1));
  const goToLast = () => setCurrentRecord(totalRecords);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-primary flex items-center gap-2">
            EQ_TELECOM
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              onClick={handleSave}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              Salvar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleDelete}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          </div>

          {/* Form Fields */}
          <div className="grid gap-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="id" className="text-right font-semibold">
                ID_
              </Label>
              <Input
                id="id"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="municipal" className="text-right font-semibold">
                MUNICIPAL_RU
              </Label>
              <Input
                id="municipal"
                value={municipalRu}
                onChange={(e) => setMunicipalRu(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>

          {/* Navigation and Search */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Registro: {currentRecord} de {totalRecords}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <Button
                size="icon"
                variant="outline"
                onClick={goToFirst}
                disabled={currentRecord === 1}
                className="h-8 w-8"
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={goToPrevious}
                disabled={currentRecord === 1}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={goToNext}
                disabled={currentRecord === totalRecords}
                className="h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={goToLast}
                disabled={currentRecord === totalRecords}
                className="h-8 w-8"
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant={filterActive ? "default" : "outline"}
                onClick={toggleFilter}
                className="h-8 gap-1"
              >
                <Filter className="h-4 w-4" />
                {filterActive ? "Com Filtro" : "Sem Filtro"}
              </Button>
              <Input
                placeholder="Pesquisar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-40 h-8"
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <Button
                size="sm"
                variant="outline"
                onClick={handleSearch}
                className="h-8 gap-1"
              >
                <Search className="h-4 w-4" />
                Pesquisar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
