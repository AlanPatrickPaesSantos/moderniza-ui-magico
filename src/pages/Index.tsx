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
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />


      <main className="container flex-1 px-6 pt-6 pb-12 relative overflow-hidden">
        {/* Dynamic Abstract Vercel/Linear-style Background Blobs */}
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-[#004e9a]/10 dark:bg-[#004e9a]/20 blur-[120px] rounded-full pointer-events-none z-0 mix-blend-multiply dark:mix-blend-lighten" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none z-0 mix-blend-multiply dark:mix-blend-lighten" />
        
        {/* Subtle Watermark Overlay */}
        <div className="absolute bottom-10 right-10 opacity-[0.02] dark:opacity-[0.03] pointer-events-none z-0">
          <img src="/logo-pmpa.png" alt="PMPA Watermark" className="w-[500px] h-auto grayscale" />
        </div>

        <div className="relative z-10 w-full mb-10">
          <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/50 mb-3">
                <span className="w-2 h-2 rounded-full bg-[#004e9a] animate-pulse" />
                <span className="text-[10px] font-bold text-[#004e9a] dark:text-blue-400 uppercase tracking-widest">Painel Inteligente PMPA</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-sm">Centro de Comando</h2>
            </div>
          </div>

          {/* BENTO GRID ARCHITECTURE */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            
            {/* [BENTO 1] Destaque: Cadastro (Ocupa 2 Colunas) */}
            <div 
              onClick={() => navigate("/cadastro")} 
              className="lg:col-span-2 group relative bg-gradient-to-br from-[#004e9a] to-[#002f5c] rounded-[2rem] p-8 overflow-hidden cursor-pointer shadow-lg hover:shadow-[0_20px_50px_rgba(0,78,154,0.3)] transition-all duration-500 hover:-translate-y-1"
            >
              <div className="absolute right-[-10%] bottom-[-20%] opacity-[0.06] pointer-events-none group-hover:scale-110 group-hover:-rotate-6 transition-transform duration-700">
                <Database className="w-64 h-64 text-white" />
              </div>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-cyan-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-between min-h-[160px]">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-4 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl">
                    <Database className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-[10px] font-bold text-white/80 bg-white/10 px-3 py-1 rounded-full uppercase tracking-widest border border-white/5">Principal</span>
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-1 tracking-tight">Novo Cadastro</h3>
                  <p className="text-sm font-medium text-blue-200">Dar entrada em equipamentos gerais no sistema.</p>
                </div>
              </div>
            </div>

            {/* [BENTO 2] Stats: Manutenção (Ocupa 1 Coluna) */}
            <div 
              onClick={() => {
                const now = new Date();
                const yearStart = `${now.getFullYear()}-01-01`;
                const yearEnd = `${now.getFullYear()}-12-31`;
                setExternalReportTrigger({ id: "Rel_Equipamentos", dateRange: { start: yearStart, end: yearEnd } });
              }}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-7 cursor-pointer shadow-sm hover:shadow-[0_15px_40px_rgba(220,38,38,0.1)] transition-all duration-500 hover:-translate-y-1 hover:border-red-200 dark:hover:border-red-900/50"
            >
              <div className="absolute right-[-24px] bottom-[-24px] opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                <Wrench className="w-32 h-32 text-red-600" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                 <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl group-hover:bg-red-100 transition-colors">
                    <Wrench className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mt-2" />
                </div>
                <div>
                  <p className="text-4xl font-black text-slate-800 dark:text-white tracking-tighter mb-1">
                    {isLoading ? <Loader2 className="h-8 w-8 animate-spin text-red-500/50" /> : stats.maintenance}
                  </p>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Painel de Manutenção</p>
                </div>
              </div>
            </div>

            {/* [BENTO 3] Stats: Missões (Ocupa 1 Coluna) */}
            <div 
              onClick={() => {
                const now = new Date();
                const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
                const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
                setExternalReportTrigger({ id: "Rel_Missao_Consolidado", dateRange: { start: firstDay, end: lastDay } });
              }}
              className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 cursor-pointer shadow-sm hover:shadow-[0_15px_40px_rgba(0,78,154,0.1)] transition-all duration-500 hover:-translate-y-1 hover:border-blue-200 dark:hover:border-blue-900/50 flex flex-col justify-between"
            >
              <div className="absolute right-[-14px] bottom-[-14px] opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                <Activity className="w-24 h-24 text-[#004e9a]" />
              </div>
              <div className="flex justify-between items-center mb-3 relative z-10">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:bg-blue-100 transition-colors">
                  <Activity className="w-4 h-4 text-[#004e9a]" />
                </div>
                <span className="text-[9px] font-bold text-[#004e9a] uppercase tracking-widest">Neste Mês</span>
              </div>
              <div className="relative z-10">
                <p className="text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin text-[#004e9a]/50" /> : stats.missions}
                </p>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Missões Reg.</p>
              </div>
            </div>

            {/* [BENTO 4] Atalho: Serviço Interno/Externo (Ocupa 1 Coluna) */}
            <div 
              onClick={() => navigate("/servico-interno-externo")}
              className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 cursor-pointer hover:border-[#004e9a]/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-center gap-4"
            >
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-50 transition-colors">
                <Server className="w-6 h-6 text-slate-500 group-hover:text-[#004e9a]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Serviços</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Int / Ext</p>
              </div>
            </div>

            {/* --- SEGUNDA LINHA DO BENTO GRID --- */}

            {/* [BENTO 5] Gerenciar: Telecom (Ocupa 1 Coluna) */}
            <div onClick={() => setEqTelecomOpen(true)} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 cursor-pointer hover:border-[#004e9a]/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-center gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-50 transition-colors">
                <Phone className="w-6 h-6 text-slate-500 group-hover:text-[#004e9a]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Telecom</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Módulo</p>
              </div>
            </div>

            {/* [BENTO 6] Gerenciar: Unidade (Ocupa 1 Coluna) */}
            <div onClick={() => setEqUnidadeOpen(true)} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 cursor-pointer hover:border-[#004e9a]/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-center gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-50 transition-colors">
                <Building className="w-6 h-6 text-slate-500 group-hover:text-[#004e9a]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Unidades</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Módulo</p>
              </div>
            </div>

            {/* [BENTO 7] Gerenciar: Suporte (Ocupa 1 Coluna) */}
            <div onClick={() => setEqSuporteOpen(true)} className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 cursor-pointer hover:border-[#004e9a]/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex items-center gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-blue-50 transition-colors">
                <Headphones className="w-6 h-6 text-slate-500 group-hover:text-[#004e9a]" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-800 dark:text-white">Suporte</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Módulo</p>
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
      <footer className="w-full mt-auto bg-white/80 dark:bg-slate-900 relative border-t border-slate-200 dark:border-slate-800">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#004e9a]/20 to-transparent" />
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
