import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NavigationCard } from "@/components/NavigationCard";
import { ConsultasSection } from "@/components/ConsultasSection";
import { CadastroVRTSection } from "@/components/CadastroVRTSection";
import { RelatoriosSection } from "@/components/RelatoriosSection";
import { EqSuporteDialog } from "@/components/EqSuporteDialog";
import { EqTelecomDialog } from "@/components/EqTelecomDialog";
import { Database, Headphones, Phone, Building, Server, Shield } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [eqSuporteOpen, setEqSuporteOpen] = useState(false);
  const [eqTelecomOpen, setEqTelecomOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/20 blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary-foreground/10 blur-3xl translate-y-1/2 -translate-x-1/3" />
        </div>
        <div className="container px-6 py-6 relative">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-gold-light" />
            <p className="text-primary-foreground/90 text-sm font-medium">
              Sistema de Gestão de Equipamentos
            </p>
          </div>
        </div>
      </div>

      <main className="container px-6 py-8">
        {/* Navigation Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
          <NavigationCard icon={Database} title="Cadastro" onClick={() => navigate("/cadastro")} />
          <NavigationCard icon={Headphones} title="Suporte" onClick={() => setEqSuporteOpen(true)} />
          <NavigationCard icon={Phone} title="Telecom" onClick={() => setEqTelecomOpen(true)} />
          <NavigationCard icon={Building} title="Unidade" />
          <NavigationCard icon={Server} title="Serv_Int_Ext" onClick={() => navigate("/servico-interno-externo")} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-5">
          <ConsultasSection />
          <CadastroVRTSection />
          <RelatoriosSection />
        </div>

        {/* Footer */}
        <div className="mt-8 relative overflow-hidden rounded-xl border border-border/50 bg-card shadow-[var(--shadow-card)]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary via-gold to-primary" />
          <div className="p-6 text-center">
            <p className="text-sm font-bold text-foreground tracking-wide">
              PROGRAMA DE CADASTRO DE EQUIPAMENTOS DA PMPA
            </p>
            <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
              Use este modelo para controlar a entrada e saída de equipamentos. 
              Explore os recursos do sistema através do menu de navegação.
            </p>
          </div>
        </div>
      </main>

      <EqSuporteDialog open={eqSuporteOpen} onOpenChange={setEqSuporteOpen} />
      <EqTelecomDialog open={eqTelecomOpen} onOpenChange={setEqTelecomOpen} />
    </div>
  );
};

export default Index;
