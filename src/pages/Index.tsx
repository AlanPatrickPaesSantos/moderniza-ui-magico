import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NavigationCard } from "@/components/NavigationCard";
import { ConsultasSection } from "@/components/ConsultasSection";
import { RelatoriosSection } from "@/components/RelatoriosSection";
import { EqSuporteDialog } from "@/components/EqSuporteDialog";
import { EqTelecomDialog } from "@/components/EqTelecomDialog";
import { EqUnidadeDialog } from "@/components/EqUnidadeDialog";
import { Database, Headphones, Phone, Building, Server, Shield, Wrench, Activity } from "lucide-react";
import pmpaBrasao from "@/assets/pmpa-brasao.png";

const Index = () => {
  const navigate = useNavigate();
  const [eqSuporteOpen, setEqSuporteOpen] = useState(false);
  const [eqTelecomOpen, setEqTelecomOpen] = useState(false);
  const [eqUnidadeOpen, setEqUnidadeOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />


      <main className="container flex-1 px-6 pt-2 pb-4 relative">
        {/* Background Watermark */}
        <div className="absolute bottom-10 right-10 opacity-[0.03] pointer-events-none z-0">
          <img src={pmpaBrasao} alt="PMPA Watermark" className="w-[450px] h-auto grayscale" />
        </div>

        <div className="relative z-10">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-pmpa-navy dark:text-white tracking-tight">Painel de Controle</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Acesso rápido às ferramentas do sistema</p>
            </div>
          </div>

          {/* Navigation Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
            <NavigationCard icon={Database} title="Cadastro" onClick={() => navigate("/cadastro")} />
            <NavigationCard icon={Server} title="Serviço Int/Ext" onClick={() => navigate("/servico-interno-externo")} />
            <NavigationCard icon={Phone} title="Telecom" onClick={() => setEqTelecomOpen(true)} />
            <NavigationCard icon={Building} title="Unidade" onClick={() => setEqUnidadeOpen(true)} />
            <NavigationCard icon={Headphones} title="Suporte" onClick={() => setEqSuporteOpen(true)} />
          </div>

          <div className="mb-2 flex items-center justify-between mt-4">
            <div>
              <h2 className="text-2xl font-bold text-pmpa-navy dark:text-white tracking-tight">Visão Geral</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Acompanhamento e relatórios do mês atual</p>
            </div>
          </div>

          {/* Dashbaord Widgets */}
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            {/* Widget 1: Manutenção */}
            <div className="group bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute right-[-16px] bottom-[-16px] opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                <Wrench className="w-32 h-32 text-pmpa-red" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-pmpa-red/10 rounded-xl">
                    <Wrench className="w-6 h-6 text-pmpa-red" />
                  </div>
                  <span className="text-xs font-semibold text-pmpa-red bg-pmpa-red/10 px-3 py-1 rounded-full">Atual</span>
                </div>
                <div>
                  <p className="text-4xl font-black text-pmpa-navy dark:text-white mb-2">12</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Equipamentos em Manutenção</p>
                </div>
              </div>
            </div>

            {/* Widget 2: Serviços Int/Ext Mês */}
            <div className="group bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute right-[-16px] bottom-[-16px] opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
                <Activity className="w-32 h-32 text-pmpa-navy" />
              </div>
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-pmpa-navy/10 rounded-xl">
                    <Activity className="w-6 h-6 text-pmpa-navy" />
                  </div>
                  <span className="text-xs font-semibold text-pmpa-navy bg-pmpa-navy/10 px-3 py-1 rounded-full">Neste Mês</span>
                </div>
                <div>
                  <p className="text-4xl font-black text-pmpa-navy dark:text-white mb-2">45</p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Serviços Int/Ext Realizados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-4">
            <ConsultasSection />
            <RelatoriosSection />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-card relative">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-pmpa-navy" />
        <div className="container px-6 py-3 text-center flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-1.5">
            <Shield className="h-4 w-4 text-pmpa-navy opacity-80 translate-y-[-1px]" />
            <p className="text-xs font-extrabold text-pmpa-navy dark:text-white tracking-widest uppercase">
              PROGRAMA DE CADASTRO DE EQUIPAMENTOS E SERVIÇOS DA PMPA
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Use este sistema corporativo para controlar a entrada e saída de equipamentos com máxima segurança e rastreabilidade. Ditel - Diretoria de Informática e Telecomunicações.
          </p>
        </div>
        {/* Linha fina azul marinho no fundo para dar um acabamento PMPA igual ao header */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-pmpa-navy" />
      </footer>

      <EqSuporteDialog open={eqSuporteOpen} onOpenChange={setEqSuporteOpen} />
      <EqTelecomDialog open={eqTelecomOpen} onOpenChange={setEqTelecomOpen} />
      <EqUnidadeDialog open={eqUnidadeOpen} onOpenChange={setEqUnidadeOpen} />
    </div>
  );
};

export default Index;
