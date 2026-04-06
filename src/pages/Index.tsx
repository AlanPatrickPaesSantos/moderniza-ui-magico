import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { NavigationCard } from "@/components/NavigationCard";
import { ConsultasSection } from "@/components/ConsultasSection";
// Lazy load components that are not needed immediately
const RelatoriosSection = lazy(() => import("@/components/RelatoriosSection").then(m => ({ default: m.RelatoriosSection })));
const EqSuporteDialog = lazy(() => import("@/components/EqSuporteDialog").then(m => ({ default: m.EqSuporteDialog })));
const EqTelecomDialog = lazy(() => import("@/components/EqTelecomDialog").then(m => ({ default: m.EqTelecomDialog })));
const EqUnidadeDialog = lazy(() => import("@/components/EqUnidadeDialog").then(m => ({ default: m.EqUnidadeDialog })));

import { Database, Headphones, Phone, Building, Server, Shield, Wrench, Activity, Loader2 } from "lucide-react";
import { API_BASE } from "@/lib/api-config";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [eqSuporteOpen, setEqSuporteOpen] = useState(false);
  const [eqTelecomOpen, setEqTelecomOpen] = useState(false);
  const [eqUnidadeOpen, setEqUnidadeOpen] = useState(false);
  const [stats, setStats] = useState({ maintenance: 0, ready: 0, missions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [externalReportTrigger, setExternalReportTrigger] = useState<{ id: string; dateRange?: { start: string; end: string }; q?: string } | null>(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const now = new Date();
        const yearStart = `${now.getFullYear()}-01-01`;
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        // Busca Manutenções (Pendentes desde o início do ano)
        const [servPentoResp, servProntoResp, missResp] = await Promise.all([
          fetch(`${API_BASE}/servicos/count?status=PENDENTE&startDate=${yearStart}`),
          fetch(`${API_BASE}/servicos/count?status=PRONTO&startDate=${yearStart}`),
          fetch(`${API_BASE}/missoes/count?startDate=${firstDay}&endDate=${lastDay}`)
        ]);

        if (servPentoResp.ok && servProntoResp.ok && missResp.ok) {
          const pentoData = await servPentoResp.json();
          const prontoData = await servProntoResp.json();
          const missData = await missResp.json();
          setStats({
            maintenance: pentoData.count || 0,
            ready: prontoData.count || 0,
            missions: missData.total || 0
          });
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error);
        toast.error("Erro ao carregar dados do dashboard.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />


      <main className="container flex-1 px-6 pt-2 pb-4 relative">
        {/* Background Watermark */}
        <div className="absolute bottom-10 right-10 opacity-[0.03] pointer-events-none z-0">
          <img src="/logo-pmpa.png" alt="PMPA Watermark" className="w-[450px] h-auto grayscale" />
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
            <div 
              onClick={() => {
                const now = new Date();
                const yearStart = `${now.getFullYear()}-01-01`;
                const yearEnd = `${now.getFullYear()}-12-31`;
                setExternalReportTrigger({ 
                  id: "Rel_Equipamentos", 
                  dateRange: { start: yearStart, end: yearEnd } 
                });
              }}
              className="group bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer hover:border-pmpa-red/30 active:scale-[0.98]"
            >
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
                <div className="flex items-end justify-between">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-black text-pmpa-navy dark:text-white">
                        {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-pmpa-red/30" /> : stats.maintenance}
                      </p>
                      <span className="text-[10px] font-bold text-pmpa-red uppercase tracking-tighter bg-pmpa-red/5 px-1.5 py-0.5 rounded">Em Conserto</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Widget 2: Serviços Int/Ext Mês */}
            <div 
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                setExternalReportTrigger({ 
                  id: "Rel_Missao_Consolidado", 
                  dateRange: { start: firstDay, end: lastDay } 
                });
              }}
              className="group bg-card border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden cursor-pointer hover:border-pmpa-navy/30 active:scale-[0.98]"
            >
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
                  <p className="text-4xl font-black text-pmpa-navy dark:text-white mb-2 flex items-center gap-2">
                    {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-pmpa-navy/30" /> : stats.missions}
                  </p>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Serviços Int/Ext Realizados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-2 gap-4">
            <ConsultasSection />
            <Suspense fallback={
              <div className="flex items-center justify-center p-12 bg-card border border-border/60 rounded-2xl animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin text-pmpa-navy/20" />
              </div>
            }>
              <RelatoriosSection externalTrigger={externalReportTrigger} onTriggerClean={() => setExternalReportTrigger(null)} />
            </Suspense>
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

      <Suspense fallback={null}>
        <EqSuporteDialog open={eqSuporteOpen} onOpenChange={setEqSuporteOpen} />
        <EqTelecomDialog open={eqTelecomOpen} onOpenChange={setEqTelecomOpen} />
        <EqUnidadeDialog open={eqUnidadeOpen} onOpenChange={setEqUnidadeOpen} />
      </Suspense>
    </div>
  );
};

export default Index;
