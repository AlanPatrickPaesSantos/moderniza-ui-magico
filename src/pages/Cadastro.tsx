import { useNavigate } from "react-router-dom";
import { CadastroForm } from "@/components/CadastroForm";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Cadastro = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: any) => {
    console.log("Cadastro salvo:", data);
    toast.success("Cadastro salvo com sucesso!");
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
        
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Novo Cadastro de Equipamento
            </h1>
            <p className="text-muted-foreground">
              Preencha os dados do equipamento
            </p>
          </div>

          <div className="bg-card rounded-lg shadow-[var(--shadow-card)] border border-border p-6">
            <CadastroForm 
              onSubmit={handleSubmit}
              onCancel={() => navigate("/")}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
