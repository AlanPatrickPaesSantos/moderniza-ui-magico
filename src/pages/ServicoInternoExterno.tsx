import { useNavigate } from "react-router-dom";
import { ServicoInternoExternoForm } from "@/components/ServicoInternoExternoForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ServicoInternoExterno = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    console.log("Serviço salvo:", data);
    toast.success("Serviço registrado com sucesso!");
    navigate("/");
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
        
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Serviço Interno e Externo
            </h1>
            <p className="text-muted-foreground">
              Registre os dados do serviço interno ou externo
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-[var(--shadow-card)] border border-border p-6">
            <ServicoInternoExternoForm 
              onSubmit={handleSubmit}
              onCancel={() => navigate("/")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicoInternoExterno;
