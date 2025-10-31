import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NavigationCard } from "@/components/NavigationCard";
import { ConsultasSection } from "@/components/ConsultasSection";
import { CadastroVRTSection } from "@/components/CadastroVRTSection";
import { RelatoriosSection } from "@/components/RelatoriosSection";
import { EqSuporteDialog } from "@/components/EqSuporteDialog";
import { EqTelecomDialog } from "@/components/EqTelecomDialog";
import { Database, Headphones, Phone, Building, Server } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [eqSuporteOpen, setEqSuporteOpen] = useState(false);
  const [eqTelecomOpen, setEqTelecomOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Header />
      
      <main className="container px-6 py-8">
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <NavigationCard icon={Database} title="Cadastro" onClick={() => navigate("/cadastro")} />
          <NavigationCard icon={Headphones} title="Suporte" onClick={() => setEqSuporteOpen(true)} />
          <NavigationCard icon={Phone} title="Telecom" onClick={() => setEqTelecomOpen(true)} />
          <NavigationCard icon={Building} title="Unidade" />
          <NavigationCard icon={Server} title="Serv_Int_Ext" onClick={() => navigate("/servico-interno-externo")} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <ConsultasSection />
          </div>
          
          <div className="space-y-6">
            <CadastroVRTSection />
          </div>
          
          <div className="space-y-6">
            <RelatoriosSection />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 p-6 rounded-lg bg-card border border-border shadow-[var(--shadow-card)]">
          <p className="text-sm text-center text-muted-foreground">
            <span className="font-semibold text-foreground">PROGRAMA DE CADASTRO DE EQUIPAMENTOS DA PMPA</span>
            <br />
            <span className="text-xs mt-2 block">
              Use este modelo para controlar a entrada e saída de equipamentos. 
              Explore os recursos do sistema através do menu de navegação.
            </span>
          </p>
        </div>
      </main>

      <EqSuporteDialog open={eqSuporteOpen} onOpenChange={setEqSuporteOpen} />
      <EqTelecomDialog open={eqTelecomOpen} onOpenChange={setEqTelecomOpen} />
    </div>
  );
};

export default Index;
