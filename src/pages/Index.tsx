import { useEffect, useState, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { 
  Database, 
  Server, 
  Phone, 
  Building, 
  Headphones, 
  Wrench, 
  Activity, 
  Search, 
  Loader2, 
  Shield 
} from "lucide-react";
import { ConsultasSection } from "@/components/ConsultasSection";
// Lazy load components that are not needed immediately
const RelatoriosSection = lazy(() => import("@/components/RelatoriosSection").then(m => ({ default: m.RelatoriosSection })));
const EqSuporteDialog = lazy(() => import("@/components/EqSuporteDialog").then(m => ({ default: m.EqSuporteDialog })));
const EqTelecomDialog = lazy(() => import("@/components/EqTelecomDialog").then(m => ({ default: m.EqTelecomDialog })));
const EqUnidadeDialog = lazy(() => import("@/components/EqUnidadeDialog").then(m => ({ default: m.EqUnidadeDialog })));

import { API_BASE } from "@/lib/api-config";
import { toast } from "sonner";
import { OnboardingTour } from "@/components/OnboardingTour";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const navigate = useNavigate();
  const [eqSuporteOpen, setEqSuporteOpen] = useState(false);
  const [eqTelecomOpen, setEqTelecomOpen] = useState(false);
  const [eqUnidadeOpen, setEqUnidadeOpen] = useState(false);
  const [stats, setStats] = useState({ maintenance: 0, ready: 0, missions: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [externalReportTrigger, setExternalReportTrigger] = useState<{ id: string; dateRange?: { start: string; end: string }; q?: string } | null>(null);
  const { user } = useAuth();
  const isViewer = user?.papel === 'visualizador';

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

        // Busca Estatísticas Consolidadas (v40.11 Restauração Total)
        const token = localStorage.getItem("ditel_token");
        const statsUrl = `${API_BASE}/stats/consolidated?startDate=${firstDay}&endDate=${lastDay}`;
        const resp = await fetch(statsUrl, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        if (resp.ok) {
          const allStats = await resp.json();
          setStats({
            maintenance: allStats.dashboard.maintenance || 0, // Manutenção (YTD - Desde Janeiro)
            ready: allStats.dashboard.ready || 0,             // Pronto para Entrega (YTD)
            missions: allStats.dashboard.missions || 0       // Missões do Mês (Apenas mês atual)
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
    <div className="min-h-screen flex flex-col bg-slate-200 dark:bg-slate-950 overflow-x-hidden">
      <Header />


      <main className="w-full max-w-screen-xl mx-auto flex-1 px-3 md:px-6 pt-4 md:pt-8 pb-10">

        <div className="relative z-10 w-full mb-8 md:mb-10">
          <div className="mb-5 md:mb-6 px-1 md:px-0">
            <h2 id="command-center-title" className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-sm inline-block">Centro de Comando</h2>
          </div>

          {/* EXECUTIVE COMMAND TOOLBAR (High-End Design) */}
          <div id="executive-toolbar" className="flex flex-wrap items-stretch gap-3 md:gap-4 mb-8">
            
            {/* Cadastro - Escondido para Visualizador */}
            {!isViewer && (
              <div 
                onClick={() => navigate("/cadastro")} 
                className="flex-1 min-w-[140px] group relative bg-white dark:bg-slate-900 backdrop-blur-md p-4 md:p-5 cursor-pointer transition-all duration-300 flex flex-col items-start gap-3 overflow-hidden rounded-t-xl shadow-sm hover:shadow-md"
              >
                <div className="p-2 bg-slate-800/5 dark:bg-white/5 rounded-lg group-hover:bg-[#004e9a]/10 transition-colors">
                  <Database className="w-5 h-5 md:w-6 md:h-6 text-[#004e9a] dark:text-blue-400" />
                </div>
                <span className="block text-sm md:text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">Cadastro</span>
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#004e9a] shadow-[0_0_8px_#004e9a]" />
                </div>
              </div>
            )}

            {/* Serv_Int_Ext */}
            <div 
              onClick={() => navigate("/servico-interno-externo")} 
              className="flex-1 min-w-[140px] group relative bg-white dark:bg-slate-900 backdrop-blur-md p-4 md:p-5 cursor-pointer transition-all duration-300 flex flex-col items-start gap-3 overflow-hidden rounded-t-xl shadow-sm hover:shadow-md"
            >
              <div className="p-2 bg-slate-800/5 dark:bg-white/5 rounded-lg group-hover:bg-[#004e9a]/10 transition-colors">
                <Server className="w-5 h-5 md:w-6 md:h-6 text-[#004e9a] dark:text-blue-400" />
              </div>
              <span className="block text-sm md:text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">Serv_Int_Ext</span>
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-[#004e9a] shadow-[0_0_8px_#004e9a]" />
              </div>
            </div>

            {/* Telecom */}
            <div 
              onClick={() => setEqTelecomOpen(true)} 
              className="flex-1 min-w-[140px] group relative bg-white dark:bg-slate-900 backdrop-blur-md p-4 md:p-5 cursor-pointer transition-all duration-300 flex flex-col items-start gap-3 overflow-hidden rounded-t-xl shadow-sm hover:shadow-md"
            >
              <div className="p-2 bg-slate-800/5 dark:bg-white/5 rounded-lg group-hover:bg-[#004e9a]/10 transition-colors">
                <Phone className="w-5 h-5 md:w-6 md:h-6 text-[#004e9a] dark:text-blue-400" />
              </div>
              <span className="block text-sm md:text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">Telecom</span>
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-[#004e9a] shadow-[0_0_8px_#004e9a]" />
              </div>
            </div>

            {/* Unidade */}
            <div 
              onClick={() => setEqUnidadeOpen(true)} 
              className="flex-1 min-w-[140px] group relative bg-white dark:bg-slate-900 backdrop-blur-md p-4 md:p-5 cursor-pointer transition-all duration-300 flex flex-col items-start gap-3 overflow-hidden rounded-t-xl shadow-sm hover:shadow-md"
            >
              <div className="p-2 bg-slate-800/5 dark:bg-white/5 rounded-lg group-hover:bg-[#004e9a]/10 transition-colors">
                <Building className="w-5 h-5 md:w-6 md:h-6 text-[#004e9a] dark:text-blue-400" />
              </div>
              <span className="block text-sm md:text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">Unidade</span>
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-[#004e9a] shadow-[0_0_8px_#004e9a]" />
              </div>
            </div>

            {/* Suporte */}
            <div 
              onClick={() => setEqSuporteOpen(true)} 
              className="flex-1 min-w-[140px] group relative bg-white dark:bg-slate-900 backdrop-blur-md p-4 md:p-5 cursor-pointer transition-all duration-300 flex flex-col items-start gap-3 overflow-hidden rounded-t-xl shadow-sm hover:shadow-md"
            >
              <div className="p-2 bg-slate-800/5 dark:bg-white/5 rounded-lg group-hover:bg-[#004e9a]/10 transition-colors">
                <Headphones className="w-5 h-5 md:w-6 md:h-6 text-[#004e9a] dark:text-blue-400" />
              </div>
              <span className="block text-sm md:text-base font-black text-slate-900 dark:text-white tracking-tight uppercase">Suporte</span>
              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-[#004e9a] shadow-[0_0_8px_#004e9a]" />
              </div>
            </div>

          </div>

          {/* EXECUTIVE STATS WIDGETS */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            
            {/* Widget: Manutenção */}
            <div 
              id="widget-manutencao"
              onClick={() => {
                const now = new Date();
                const yearStart = `${now.getFullYear()}-01-01`;
                const yearEnd = `${now.getFullYear()}-12-31`;
                setExternalReportTrigger({ id: "Rel_Equipamentos", dateRange: { start: yearStart, end: yearEnd } });
              }}
              className="group relative bg-white dark:bg-slate-900 backdrop-blur-md p-5 md:p-6 cursor-pointer transition-all duration-300 flex items-center gap-5 overflow-hidden rounded-xl shadow-sm hover:shadow-md"
            >
              <img 
                src="/images/maintenance_bg.png" 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700" 
              />
              <div className="relative z-10 p-3.5 bg-red-50 dark:bg-red-900/20 rounded-lg group-hover:bg-red-500 transition-colors duration-500">
                <Wrench className="w-6 h-6 text-red-500 group-hover:text-white transition-colors" />
              </div>
              <div className="relative z-10">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-red-500/50" /> : stats.maintenance}
                  </p>
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Em Manutenção</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]" />
              </div>
            </div>

            {/* Widget: Missões */}
            <div 
              id="widget-missoes"
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                setExternalReportTrigger({ id: "Rel_Missao_Consolidado", dateRange: { start: firstDay, end: lastDay } });
              }}
              className="group relative bg-white dark:bg-slate-900 backdrop-blur-md p-5 md:p-6 cursor-pointer transition-all duration-300 flex items-center gap-5 overflow-hidden rounded-xl shadow-sm hover:shadow-md"
            >
              <img 
                src="/images/missions_bg.png" 
                alt="" 
                className="absolute inset-0 w-full h-full object-cover opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-700" 
              />
              <div className="relative z-10 p-3.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-[#004e9a] transition-colors duration-500">
                <Activity className="w-6 h-6 text-[#004e9a] group-hover:text-white transition-colors" />
              </div>
              <div className="relative z-10">
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-blue-500/50" /> : stats.missions}
                  </p>
                  <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Missões do Mês</span>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-1.5 h-1.5 rounded-full bg-[#004e9a] shadow-[0_0_8px_#004e9a]" />
              </div>
            </div>
          </div>
 
          {/* Main Content Grid */}
          <div className="mt-8 grid lg:grid-cols-2 gap-4 md:gap-6 items-stretch w-full max-w-full">
            
            {/* Box de Busca */}
            <div id="box-busca-rapida" className="bg-white dark:bg-slate-900 backdrop-blur-md rounded-b-2xl rounded-t-none p-4 md:p-6 shadow-sm transition-all duration-300 h-full flex flex-col w-full max-w-full overflow-hidden">
              <div className="flex items-center gap-3 mb-5 md:mb-6">
                <div className="p-2 bg-[#004e9a]/10 rounded-lg">
                  <Search className="w-4 h-4 md:w-5 md:h-5 text-[#004e9a]" />
                </div>
                <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Busca Rápida</h3>
              </div>
              <div className="flex-1 w-full">
                <ConsultasSection />
              </div>
            </div>
            
            {/* Box de Relatórios */}
            <Suspense fallback={
              <div className="flex items-center justify-center p-8 md:p-12 bg-card border border-border/60 rounded-2xl animate-pulse">
                <Loader2 className="h-8 w-8 animate-spin text-pmpa-navy/20" />
              </div>
            }>
              <div id="box-relatorios" className="bg-white dark:bg-slate-900 backdrop-blur-md rounded-b-2xl rounded-t-none p-4 md:p-6 shadow-sm transition-all duration-300 h-full flex flex-col w-full max-w-full overflow-hidden">
                <div className="flex items-center gap-3 mb-5 md:mb-6">
                  <div className="p-2 bg-[#004e9a]/10 rounded-lg">
                    <Activity className="w-4 h-4 md:w-5 md:h-5 text-[#004e9a]" />
                  </div>
                  <h3 className="text-sm md:text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Painel de Relatórios</h3>
                </div>
                <div className="flex-1 w-full">
                  <RelatoriosSection externalTrigger={externalReportTrigger} onTriggerClean={() => setExternalReportTrigger(null)} />
                </div>
              </div>
            </Suspense>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full mt-auto bg-white/80 dark:bg-slate-900 relative border-t border-slate-200 dark:border-slate-800">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#004e9a]/20 to-transparent" />
        <div className="w-full max-w-screen-xl mx-auto px-4 py-4 text-center flex flex-col items-center justify-center">
          <div className="flex flex-col md:flex-row items-center gap-2 mb-2">
            <Shield className="shrink-0 h-4 w-4 text-pmpa-navy opacity-80" />
            <p className="text-[9px] md:text-xs font-extrabold text-pmpa-navy dark:text-white tracking-widest uppercase leading-tight max-w-[280px] md:max-w-none">
              PROGRAMA DE CADASTRO DE EQUIPAMENTOS E SERVIÇOS DA PMPA
            </p>
          </div>
          <div className="text-[9px] md:text-[11px] text-muted-foreground leading-relaxed flex flex-col md:flex-row items-center gap-1 md:gap-2">
            <span>Ditel - Diretoria de Informática e Telecomunicações</span>
            <span className="hidden md:inline opacity-30">|</span>
            <span className="font-black uppercase tracking-[0.2em] text-[8px] md:text-[9px] opacity-40">System Design by Alan Santos</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-pmpa-navy" />
      </footer>

      <Suspense fallback={null}>
        <EqSuporteDialog open={eqSuporteOpen} onOpenChange={setEqSuporteOpen} readOnly={isViewer} />
        <EqTelecomDialog open={eqTelecomOpen} onOpenChange={setEqTelecomOpen} readOnly={isViewer} />
        <EqUnidadeDialog open={eqUnidadeOpen} onOpenChange={setEqUnidadeOpen} readOnly={isViewer} />
      </Suspense>

      <OnboardingTour />
    </div>
  );
};

export default Index;
