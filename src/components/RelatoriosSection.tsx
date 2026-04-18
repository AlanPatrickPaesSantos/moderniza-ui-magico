import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Calendar, Settings, ChevronRight, Loader2, Search, X, Activity, Printer, Wrench } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CadastroForm } from "./CadastroForm";
import { ServicoInternoExternoForm } from "./ServicoInternoExternoForm";
import { API_BASE } from "../lib/api-config";
import { LaudoPrint } from "./LaudoPrint";
import { toast } from "sonner";
// Removido import de RelatorioMissaoPrint para usar janela isolada


interface RelatoriosSectionProps {
  externalTrigger?: { id: string; dateRange?: { start: string; end: string }; q?: string; status?: string } | null;
  onTriggerClean?: () => void;
}

export const RelatoriosSection = ({ externalTrigger, onTriggerClean }: RelatoriosSectionProps) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", q: "", status: "", bateria: false, garantia: false });
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [stats, setStats] = useState<{
    total: number;
    interno: number;
    externo: number;
    remoto: number;
    pendente: number;
    pronto: number;
    laudo: number;
    bateria: number;
    garantia: number;
  }>({ total: 0, interno: 0, externo: 0, remoto: 0, pendente: 0, pronto: 0, laudo: 0, bateria: 0, garantia: 0 });

  const [printType, setPrintType] = useState<'laudo' | 'saida' | 'entrada'>('laudo');

  // Gatilho Externo (vido do Dashboard)
  useEffect(() => {
    if (externalTrigger && externalTrigger.id) {
      const start = externalTrigger.dateRange?.start || "";
      const end = externalTrigger.dateRange?.end || "";
      const query = externalTrigger.q || "";
      const statusValue = externalTrigger.status || "";

      setFilters({ startDate: start, endDate: end, q: query, status: statusValue, bateria: false });
      setActiveReport(externalTrigger.id);

      // Pequeno delay para garantir que os estados foram aplicados antes da busca
      setTimeout(() => {
        handleGenerateReportFromParams(start, end, query, statusValue);
      }, 100);

      onTriggerClean?.();
    }
  }, [externalTrigger]);

  // Função unificada para busca de dados (Estatísticas + Lista)
  const fetchReportData = async (start: string, end: string, reportId: string, queryText?: string, statusText?: string) => {
    setIsLoading(true);
    try {
      const isMissions = reportId === "Rel_Missao_Consolidado";
      const isEquipments = reportId === "Rel_Equipamentos";
      const endpoint = isMissions ? "missoes" : "servicos";

      // Se houver statusText ou filters.status, usamos ele estritamente
      // Caso contrário, se for relatórios de missões ou específico, o statusParam fica vazio.
      const currentStatus = statusText !== undefined ? statusText : filters.status;
      const statusParam = currentStatus ? `&status=${currentStatus}` : (isMissions || isEquipments ? "" : "&status=PENDENTE");

      const currentQ = queryText !== undefined ? queryText : filters.q;
      const searchQuery = currentQ ? `&q=${encodeURIComponent(currentQ)}` : "";

      const currentBateria = filters.bateria;
      const bateriaParam = currentBateria ? "&bateria=true" : "";

      const currentGarantia = filters.garantia;
      const garantiaParam = currentGarantia ? "&garantia=true" : "";

      // 1. Busca Contagens Exatas
      const countUrl = `${API_BASE}/${endpoint}/count?startDate=${start}&endDate=${end}${statusParam}${searchQuery}${bateriaParam}`;
      const countResp = await fetch(countUrl);
      const exactStats = await countResp.json();

      // 2. Busca Registros para a Lista
      const listUrl = `${API_BASE}/${endpoint}?startDate=${start}&endDate=${end}${statusParam}${searchQuery}${bateriaParam}${garantiaParam}`;
      const listResp = await fetch(listUrl);
      const data = await listResp.json();

      setResults(Array.isArray(data) ? data : []);

      if (isMissions) {
        setStats({
          total: exactStats?.total || 0,
          interno: exactStats?.interno || 0,
          externo: exactStats?.externo || 0,
          remoto: exactStats?.remoto || 0,
          pendente: exactStats?.pendente || 0,
          pronto: 0,
          laudo: 0,
          bateria: 0
        });
      } else {
        // Para Equipamentos, buscamos Total, Pendente e Pronto separadamente se necessário
        // Mas por padrão a busca principal já traz o que está no statusParam
        // Para uma visão consolidada, faremos buscas paralelas
        const [pentoResp, prontoResp, laudoResp, bateriaResp, totalResp] = await Promise.all([
          fetch(`${API_BASE}/servicos/count?startDate=${start}&endDate=${end}&status=PENDENTE${searchQuery}`),
          fetch(`${API_BASE}/servicos/count?startDate=${start}&endDate=${end}&status=PRONTO${searchQuery}`),
          fetch(`${API_BASE}/servicos/count?startDate=${start}&endDate=${end}&status=LAUDO${searchQuery}`),
          fetch(`${API_BASE}/servicos/count?startDate=${start}&endDate=${end}&bateria=true${searchQuery}`),
          fetch(`${API_BASE}/servicos/count?startDate=${start}&endDate=${end}&garantia=true${searchQuery}`),
          fetch(`${API_BASE}/servicos/count?startDate=${start}&endDate=${end}${searchQuery}`)
        ]);

        const pentoData = await pentoResp.json();
        const prontoData = await prontoResp.json();
        const laudoData = await laudoResp.json();
        const bateriaData = await bateriaResp.json();
        const garantiaData = await garantiaResp.json();
        const totalData = await totalResp.json();

        setStats({
          total: totalData.count || 0,
          interno: 0, externo: 0, remoto: 0,
          pendente: pentoData.count || 0,
          pronto: prontoData.count || 0,
          laudo: laudoData.count || 0,
          bateria: bateriaData.count || 0,
          garantia: garantiaData.count || 0
        });
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReportFromParams = async (start: string, end: string, queryText?: string, statusText?: string) => {
    if (!activeReport) return;
    await fetchReportData(start, end, activeReport, queryText, statusText);
  };

  const handleGenerateReport = async () => {
    if (!activeReport) return;
    await fetchReportData(filters.startDate, filters.endDate, activeReport, filters.q, filters.status);
  };

  const handleSave = async (data: any) => {
    if (!selectedRecord) return;
    try {
      const isMissions = activeReport === "Rel_Missao_Consolidado";
      const endpoint = isMissions ? "missoes" : "servicos";
      const id = isMissions ? selectedRecord.os : selectedRecord.Id_cod;

      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (result.success) {
        toast.success(`✅ Registro #${id} atualizado com sucesso!`);
        setSelectedRecord(result.record || result.missao || data);
        // Atualiza a lista de resultados para refletir a mudança
        handleGenerateReport();
      } else {
        toast.error("Erro ao salvar: " + (result.error || "Tente novamente."));
      }
    } catch (err) {
      toast.error("Erro de conexão com o servidor.");
    }
  };

  const loadDetail = async (item: any) => {
    setIsLoading(true);
    try {
      const isMissions = activeReport === "Rel_Missao_Consolidado";
      const endpoint = isMissions ? "missoes" : "servicos";
      const id = isMissions ? item.os : item.Id_cod;
      const res = await fetch(`${API_BASE}/${endpoint}/${id}`);
      if (res.ok) {
        const fullData = await res.json();
        // A API de serviços retorna um envelope { record, hasPrev, hasNext },
        // enquanto a de missões retorna o objeto direto.
        setSelectedRecord(isMissions ? fullData : fullData.record);
      } else {
        setSelectedRecord(item);
      }
    } catch {
      setSelectedRecord(item);
    } finally {
      setIsLoading(false);
    }
  };


  const handlePrint = async () => {
    if (stats.total === 0) return;

    // 1. Abre a janela de impressão IMEIDATAMENTE para contornar qualquer bloqueador de popups.
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor, permita pop-ups no seu navegador para imprimir o relatório.");
      return;
    }

    // Tela de carregamento temporária na nova aba
    printWindow.document.write(`
      <html>
        <head>
          <title>Gerando Relatório...</title>
          <style>body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; font-size: 1.2rem; color: #555; }</style>
        </head>
        <body>Aguarde, calculando dados do relatório...</body>
      </html>
    `);

    // Busca contagens exatas
    let manutencaoStats = { total: 0, prontas: 0 };
    try {
      const [prontoResp, totalResp] = await Promise.all([
        fetch(`${API_BASE}/servicos/count?startDate=${filters.startDate}&endDate=${filters.endDate}&status=PRONTO`),
        fetch(`${API_BASE}/servicos/count?startDate=${filters.startDate}&endDate=${filters.endDate}`)
      ]);
      if (prontoResp.ok) {
        const prontoData = await prontoResp.json();
        manutencaoStats.prontas = prontoData.count;
      }
      if (totalResp.ok) {
        const totalData = await totalResp.json();
        manutencaoStats.total = totalData.count;
      }
    } catch (e) {
      console.error("Erro ao buscar manutenções:", e);
      printWindow.document.write("<p style='color:red'>Erro ao carregar dados complementares (Manutencao). O relatório pode estar incompleto.</p>");
    }

    const logoBase = window.location.origin;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Ditel PMPA</title>
        <meta charset="UTF-8" />
        <style>
          @page { margin: 0mm; size: A4; }
          body { font-family: Arial, sans-serif; padding: 0.8cm 1.2cm; color: black; line-height: 1.2; background: white; font-size: 9pt; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid black; padding-bottom: 6px; margin-bottom: 8px; }
          .logo { height: 85px; width: auto; object-fit: contain; image-rendering: -webkit-optimize-contrast; }
          .header-text { text-align: center; flex: 1; font-weight: bold; text-transform: uppercase; font-size: 8.5pt; line-height: 1.4; }
          .header-text .ditel { font-size: 11pt; }
          .doc-title { text-align: center; font-weight: 900; text-transform: uppercase; font-size: 11pt; margin: 8px 0; }
          .meta { display: flex; justify-content: space-between; font-size: 8pt; font-weight: bold; border-bottom: 1px dotted black; padding-bottom: 4px; margin-bottom: 8px; }
          section { margin-bottom: 10px; }
          .section-title { font-size: 9pt; font-weight: 900; text-transform: uppercase; margin-bottom: 5px; padding-bottom: 2px; letter-spacing: 0.5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
          th, td { border: 1px solid black; padding: 4px 8px; font-size: 8.5pt; text-align: center; }
          th { background-color: #e8e8e8; font-weight: 900; text-transform: uppercase; font-size: 8pt; }
          td.label { text-align: left; font-weight: bold; width: 65%; }
          td.value { font-size: 11pt; font-weight: 900; }
          .total-row td { background-color: #d8d8d8; font-weight: 900; }
          .footer { margin-top: 20px; text-align: center; }
          .signature-line { width: 220px; border-top: 1px solid black; margin: 30px auto 4px; }
          .footer-text { font-weight: bold; text-transform: uppercase; font-size: 9pt; }
          .obs { font-size: 7pt; color: #444; margin-top: 6px; font-style: italic; }
        </style>
      </head>
      <body>

        <div class="header">
          <img src="${logoBase}/logo-pmpa.png" class="logo" onerror="this.style.display='none'" />
          <div class="header-text">
            <div>GOVERNO DO ESTADO DO PARÁ</div>
            <div>SECRETARIA DE ESTADO DE SEGURANÇA PÚBLICA E DEFESA SOCIAL</div>
            <div>POLÍCIA MILITAR DO PARÁ</div>
            <div>DEPARTAMENTO GERAL DE ADMINISTRAÇÃO</div>
            <div class="ditel">DIRETORIA DE TELEMÁTICA</div>
          </div>
          <img src="${logoBase}/Logo Ditel.jpeg" class="logo" onerror="this.style.display='none'" style="transform: translateX(5px);" />
        </div>

        <div class="doc-title">RELATÓRIO CONSOLIDADO DE ATIVIDADES - DITEL</div>

        <div class="meta">
          <span>EMITIDO EM: ${new Date().toLocaleDateString("pt-BR")}</span>
          <span>PERÍODO DE REFERÊNCIA: ${filters.startDate || "INÍCIO"} A ${filters.endDate || "FIM"}</span>
        </div>

        <!-- SEÇÃO 1: MISSÕES INTERNAS E EXTERNAS -->
        <section>
          <div class="section-title">1. Serviços de Suporte – Missões (Int/Ext/Remoto)</div>
          <table>
            <thead>
              <tr>
                <th style="text-align:left">TIPO DE SERVIÇO</th>
                <th>QUANTIDADE</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="label">Serviços Internos</td><td class="value">${stats.interno}</td></tr>
              <tr><td class="label">Serviços Externos</td><td class="value">${stats.externo}</td></tr>
              <tr><td class="label">Serviços Remotos</td><td class="value">${stats.remoto}</td></tr>
              <tr><td class="label">Pendentes</td><td class="value">${stats.pendente}</td></tr>
              <tr class="total-row"><td class="label">TOTAL DE MISSÕES NO PERÍODO</td><td class="value">${stats.total}</td></tr>
            </tbody>
          </table>
        </section>

        <!-- SEÇÃO 2: MANUTENÇÕES -->
        <section>
          <div class="section-title">2. Serviços de Manutenção de Equipamentos</div>
          <table>
            <thead>
              <tr>
                <th style="text-align:left">INDICADOR</th>
                <th>QUANTIDADE</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="label">Total de O.S. Registradas no Período</td><td class="value">${manutencaoStats.total}</td></tr>
              <tr class="total-row"><td class="label">O.S. Concluídas (Status: PRONTO)</td><td class="value">${manutencaoStats.prontas}</td></tr>
            </tbody>
          </table>
        </section>

        <!-- SEÇÃO 3: RESUMO GERAL -->
        <section>
          <div class="section-title">3. Resumo Geral de Atendimentos</div>
          <table>
            <thead>
              <tr>
                <th style="text-align:left">CATEGORIA</th>
                <th>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="label">Total de Missões (Int + Ext + Remoto)</td><td class="value">${(stats.interno || 0) + (stats.externo || 0) + (stats.remoto || 0)}</td></tr>
              <tr><td class="label">Total de Manutenções Concluídas</td><td class="value">${manutencaoStats.prontas || 0}</td></tr>
              <tr class="total-row"><td class="label">TOTAL GERAL DE ATENDIMENTOS</td><td class="value">${(stats.interno || 0) + (stats.externo || 0) + (stats.remoto || 0) + (manutencaoStats.prontas || 0)}</td></tr>
            </tbody>
          </table>
          <p class="obs">* Relatório gerado automaticamente pelo sistema DITEL/PMPA. Dados referentes ao período informado acima.</p>
        </section>

        <div class="footer">
          <div class="signature-line"></div>
          <p class="footer-text">Responsável pela Emissão</p>
          <p style="font-size: 8pt; text-transform: uppercase; margin-top: 4px;">Diretoria de Telemática – PMPA</p>
        </div>

        <script>
          let impresso = false;
          function chamarImpressao() {
            if (impresso) return;
            impresso = true;
            window.print();
          }
          
          window.onload = function() { setTimeout(chamarImpressao, 500); };
          setTimeout(chamarImpressao, 2000); // Fallback: força a impressão se imagens travarem
          
          window.onafterprint = function() {
            window.close(); // Fecha a aba automaticamente e libera o sistema principal
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open(); // Limpa o documento anterior (a tela de carregamento)
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <>
      <Card className="relative overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-200/50 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_15px_40px_rgba(0,78,154,0.1)] transition-all duration-500 group">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#004e9a] to-[#002f5c] transform origin-left transition-transform duration-500" />
        <div className="absolute -right-12 -top-12 w-32 h-32 bg-blue-100/50 dark:bg-blue-900/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        <div className="p-6 md:p-8 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/40 border border-blue-100 dark:border-blue-800 shadow-sm transition-transform group-hover:scale-110 duration-500">
              <FileText className="h-6 w-6 text-[#004e9a] dark:text-blue-400 drop-shadow-sm" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight drop-shadow-sm">Painel de Relatórios</h2>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { icon: Activity, id: "Rel_Missao_Consolidado", title: "Consolidado Missões", desc: "Relatório de serviços Int/Ext" },
              { icon: Wrench, id: "Rel_Equipamentos", title: "Consolidado Equipamentos", desc: "Relatório de Manutenção e Reparos" },
            ].map((item) => (
              <Button
                key={item.id}
                onClick={() => {
                  setActiveReport(item.id);
                  setResults([]);
                }}
                variant="outline"
                className="w-full justify-start gap-4 h-auto py-4 px-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-[#004e9a]/50 transition-all duration-300 group/btn shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(0,78,154,0.08)] hover:-translate-y-0.5"
              >
                <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover/btn:bg-white dark:group-hover/btn:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
                  <item.icon className="h-5 w-5 text-slate-500 group-hover/btn:text-[#004e9a]" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-bold text-[14px] text-slate-700 dark:text-slate-200 group-hover/btn:text-[#004e9a] dark:group-hover/btn:text-blue-400 transition-colors tracking-wide">{item.title}</span>
                  <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{item.desc}</span>
                </div>
                <ChevronRight className="ml-auto h-5 w-5 text-slate-300 group-hover/btn:text-[#004e9a] transition-all group-hover/btn:translate-x-1" />
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Dialog open={!!activeReport} onOpenChange={(open) => {
        if (!open) {
          setActiveReport(null);
          setResults([]);
          setStats({ total: 0, interno: 0, externo: 0, remoto: 0, pendente: 0, pronto: 0, laudo: 0, bateria: 0 });
          setFilters({ startDate: "", endDate: "", q: "", status: "", bateria: false });
        }
      }}>
        <DialogContent className="max-w-5xl w-[95vw] sm:w-full max-h-[92vh] overflow-hidden flex flex-col p-4 md:p-6 border-border/50 shadow-2xl">
          <DialogHeader className="p-1 md:p-4 border-b border-border/50 bg-muted/20 rounded-t-lg">
            <DialogTitle className="text-lg md:text-2xl font-black text-pmpa-navy uppercase">
              {activeReport === "Rel_Missao_Consolidado" ? "Relatório de Missões" : "Relatório de Equipamentos"}
            </DialogTitle>
            <DialogDescription className="text-[10px] md:text-sm">Visualize e imprima relatórios consolidados do sistema DITEL.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-2 md:gap-4 p-1 md:p-0">
            {/* Filtros */}
            <div className="flex flex-wrap gap-2 md:gap-3 items-end bg-muted/20 p-2 md:p-4 rounded-xl border border-border/40 print:hidden shrink-0">
              <div className="space-y-1.5 flex-1 min-w-[150px]">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Início</label>
                <Input type="date" value={filters.startDate} onChange={(e) => setFilters({ ...filters, startDate: e.target.value })} />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[150px]">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Fim</label>
                <Input type="date" value={filters.endDate} onChange={(e) => setFilters({ ...filters, endDate: e.target.value })} />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">Busca Rápida</label>
                  {filters.status && (
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${filters.status === 'PRONTO' ? 'bg-emerald-500/20 text-emerald-600' : 'bg-orange-500/20 text-orange-600'}`}>
                      Filtro: {filters.status}
                    </span>
                  )}
                  {filters.bateria && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase bg-amber-500/20 text-amber-600">
                      Filtro: BATERIA
                    </span>
                  )}
                </div>
                <div className="relative">
                  <Input
                    placeholder="Pesquisar..."
                    value={filters.q}
                    onChange={(e) => setFilters({ ...filters, q: e.target.value, status: "", bateria: false })}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerateReport()}
                    className={(filters.status || filters.bateria) ? "border-primary/50 bg-primary/5" : ""}
                  />
                  {(filters.status || filters.bateria) && (
                    <button
                      onClick={() => {
                        const newFilters = { ...filters, status: "", bateria: false };
                        setFilters(newFilters);
                        fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "");
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-md transition-colors"
                    >
                      <X className="h-3 w-3 text-muted-foreground" />
                    </button>
                  )}
                </div>
              </div>

              <Button onClick={handleGenerateReport} className="bg-pmpa-navy hover:bg-pmpa-navy/90 gap-2 h-10 px-6">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                GERAR
              </Button>

              {results.length > 0 && activeReport === "Rel_Missao_Consolidado" && (
                <Button onClick={handlePrint} variant="outline" className="border-pmpa-navy text-pmpa-navy hover:bg-pmpa-navy/5 gap-2 h-10">
                  <FileText className="h-4 w-4" />
                  Imprimir
                </Button>
              )}
            </div>

            {/* Resumo Estatístico Missões */}
            {activeReport === "Rel_Missao_Consolidado" && results.length > 0 && (
              <div className="relative overflow-hidden print:hidden border-b border-border/20 mb-6 pb-2 z-20 bg-background/95 backdrop-blur-sm shrink-0">
                <div className="flex flex-nowrap md:grid md:grid-cols-5 gap-2 overflow-x-auto pb-4 px-1 md:pb-0 custom-scrollbar scroll-smooth snap-x snap-mandatory">
                  <div className="bg-muted/40 p-2 md:p-3 rounded-lg border border-border/50 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Total</p>
                    <p className="text-sm md:text-xl font-black text-foreground">{String(stats.total || 0)}</p>
                  </div>
                  <div className="bg-blue-500/10 p-2 md:p-3 rounded-lg border border-blue-500/20 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-blue-500">Internas</p>
                    <p className="text-sm md:text-xl font-black text-blue-600 dark:text-blue-400">{String(stats.interno || 0)}</p>
                  </div>
                  <div className="bg-emerald-500/10 p-2 md:p-3 rounded-lg border border-emerald-500/20 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-emerald-500">Externas</p>
                    <p className="text-sm md:text-xl font-black text-emerald-600 dark:text-emerald-400">{String(stats.externo || 0)}</p>
                  </div>
                  <div className="bg-purple-500/10 p-2 md:p-3 rounded-lg border border-purple-500/20 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-purple-500">Remotas</p>
                    <p className="text-sm md:text-xl font-black text-purple-600 dark:text-purple-400">{String(stats.remoto || 0)}</p>
                  </div>
                  <div className="bg-orange-500/10 p-2 md:p-3 rounded-lg border border-orange-500/20 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-orange-500">Pendentes</p>
                    <p className="text-sm md:text-xl font-black text-orange-600 dark:text-orange-400">{String(stats.pendente || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {activeReport === "Rel_Equipamentos" && results.length > 0 && (
              <div className="relative overflow-hidden print:hidden border-b border-border/20 mb-6 pb-2 z-20 bg-background/95 backdrop-blur-sm shrink-0">
                <div className="flex flex-nowrap md:grid md:grid-cols-6 gap-2 overflow-x-auto pb-4 px-1 md:pb-0 custom-scrollbar scroll-smooth snap-x snap-mandatory">

                  <div className="bg-muted/40 p-2 md:p-3 rounded-lg border border-border/50 min-w-[110px] md:min-w-0 flex-shrink-0 snap-start">
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-muted-foreground tracking-tighter">Total O.S.</p>
                    <p className="text-sm md:text-xl font-black text-foreground">{String(stats.total || 0)}</p>
                  </div>

                  <div
                    onClick={() => {
                      const newFilters = { ...filters, q: "", status: "PENDENTE", bateria: false, garantia: false };
                      setFilters(newFilters);
                      fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "PENDENTE");
                    }}
                    className={`bg-orange-500/10 p-2 md:p-3 rounded-lg border min-w-[110px] md:min-w-0 flex-shrink-0 cursor-pointer hover:bg-orange-500/20 active:scale-[0.97] transition-all snap-start ${filters.status === "PENDENTE" ? "ring-2 ring-orange-500 border-orange-500 bg-orange-500/20" : "border-orange-500/20"}`}
                  >
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-orange-500">Pendente</p>
                    <p className="text-sm md:text-xl font-black text-orange-600 dark:text-orange-400">{String(stats.pendente || 0)}</p>
                  </div>

                  <div
                    onClick={() => {
                      const newFilters = { ...filters, q: "", status: "LAUDO", bateria: false, garantia: false };
                      setFilters(newFilters);
                      fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "LAUDO");
                    }}
                    className={`bg-blue-500/10 p-2 md:p-3 rounded-lg border min-w-[110px] md:min-w-0 flex-shrink-0 cursor-pointer hover:bg-blue-500/20 active:scale-[0.97] transition-all snap-start ${filters.status === "LAUDO" ? "ring-2 ring-blue-500 border-blue-500 bg-blue-500/20" : "border-blue-500/20"}`}
                  >
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-blue-500">LAUDO</p>
                    <p className="text-sm md:text-xl font-black text-blue-600 dark:text-blue-400">{String(stats.laudo || 0)}</p>
                  </div>

                  <div
                    onClick={() => {
                      const newFilters = { ...filters, q: "", status: "", bateria: true, garantia: false };
                      setFilters(newFilters);
                      fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "");
                    }}
                    className={`bg-amber-500/10 p-2 md:p-3 rounded-lg border min-w-[110px] md:min-w-0 flex-shrink-0 cursor-pointer hover:bg-amber-500/20 active:scale-[0.97] transition-all snap-start ${filters.bateria ? "ring-2 ring-amber-500 border-amber-500 bg-amber-500/20" : "border-amber-500/20"}`}
                  >
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-amber-500">Bateria</p>
                    <p className="text-sm md:text-xl font-black text-amber-600 dark:text-amber-400">{String(stats.bateria || 0)}</p>
                  </div>

                  <div
                    onClick={() => {
                      const newFilters = { ...filters, q: "", status: "PRONTO", bateria: false, garantia: false };
                      setFilters(newFilters);
                      fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "PRONTO");
                    }}
                    className={`bg-emerald-500/10 p-2 md:p-3 rounded-lg border min-w-[110px] md:min-w-0 flex-shrink-0 cursor-pointer hover:bg-emerald-500/20 active:scale-[0.97] transition-all snap-start ${filters.status === "PRONTO" ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-500/20" : "border-emerald-500/20"}`}
                  >
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-emerald-500">PRONTO</p>
                    <p className="text-sm md:text-xl font-black text-emerald-600 dark:text-emerald-400">{String(stats.pronto || 0)}</p>
                  </div>

                  <div
                    onClick={() => {
                      const newFilters = { ...filters, q: "", status: "", bateria: false, garantia: true };
                      setFilters(newFilters);
                      fetchReportData(newFilters.startDate, newFilters.endDate, activeReport!, "", "");
                    }}
                    className={`bg-cyan-500/10 p-2 md:p-3 rounded-lg border min-w-[110px] md:min-w-0 flex-shrink-0 cursor-pointer hover:bg-cyan-500/20 active:scale-[0.97] transition-all snap-start ${filters.garantia ? "ring-2 ring-cyan-500 border-cyan-500 bg-cyan-500/20" : "border-cyan-500/20"}`}
                  >
                    <p className="text-[8px] md:text-[10px] font-black uppercase text-cyan-500">Garantia</p>
                    <p className="text-sm md:text-xl font-black text-cyan-600 dark:text-cyan-400">{String(stats.garantia || 0)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de Resultados */}
            <div className="flex-1 min-h-[250px] overflow-y-auto border border-border/40 rounded-lg divide-y divide-border/40 custom-scrollbar print:hidden shadow-inner bg-card">
              {isLoading ? (
                <div className="space-y-4 p-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-3 animate-pulse">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
                        <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
                        <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-full w-20" />
                      </div>
                      <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-full" />
                      <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-2/3" />
                    </div>
                  ))}
                </div>
              ) : results.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <FileText className="h-12 w-12 opacity-10" />
                  <p className="font-bold text-xs uppercase tracking-widest text-center px-4">Nenhum dado carregado para este período.</p>
                </div>
              )}
              {Array.isArray(results) && results.filter(Boolean).map((item, index) => (
                <button
                  key={item._id || `report-item-${index}`}
                  onClick={() => loadDetail(item)}
                  className="w-full text-left p-4 hover:bg-primary/5 transition-colors group flex flex-col relative pr-10"
                >
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        {activeReport === "Rel_Missao_Consolidado" ? "OS #" : "ID / Código"}
                      </p>
                      <p className="font-bold text-foreground">
                        #{activeReport === "Rel_Missao_Consolidado" ? String(item.os || "---") : String(item.Id_cod || "---")}
                      </p>
                    </div>
                    <div className="md:col-span-1 space-y-0.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        {activeReport === "Rel_Missao_Consolidado" ? "Unidade / Solicitante" : "Equipamento / Unidade"}
                      </p>
                      <p className="font-semibold text-foreground truncate">
                        {activeReport === "Rel_Missao_Consolidado"
                          ? `${String(item.unidade || "N/A")} - ${String(item.solicitante || 'N/A')}`
                          : `${String(item.T_EquipSuporte || item.T_EquipTelecom || "N/A")} - ${String(item.Unidade || "N/A")}`}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Data Ref.</p>
                      <p className="font-bold text-foreground">
                        {(() => {
                          const d = item.Data_Saida || item.saidaEquip || item.data || item.Data_Ent;
                          if (!d) return "---";
                          if (typeof d === 'string' && d.includes('/')) return d.split(' ')[0];
                          const date = new Date(d);
                          return isNaN(date.getTime()) ? "---" : date.toLocaleDateString('pt-BR');
                        })()}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        {activeReport === "Rel_Missao_Consolidado" ? "Tipo" : "Status"}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${(() => {
                        const val = String(item.servico || item.Serviço || "").toLowerCase();
                        if (val.includes("externo")) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
                        if (val.includes("interno")) return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
                        if (val.includes("remoto")) return "bg-purple-500/10 text-purple-600 dark:text-purple-400";
                        if (val.includes("pronto")) return "bg-green-500/10 text-green-600 dark:text-green-400";
                        return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
                      })()
                        }`}>
                        {activeReport === "Rel_Missao_Consolidado" ? String(item.servico || "N/A") : String(item.Serviço || "PENDENTE")}
                      </span>
                    </div>
                  </div>

                  {/* Prévia de Defeito/Análise - VISIBILIDADE TOTAL */}
                  <div className="mt-4 pt-3 border-t border-border/20 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-70">Defeito Reclamado</p>
                      <p className="text-xs text-foreground/80 leading-relaxed break-words whitespace-pre-wrap">
                        {String(item.Defeito_Recl || item.def_recla || "---").substring(0, 300)}
                        {String(item.Defeito_Recl || item.def_recla || "").length > 300 ? "..." : ""}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground opacity-70">Análise Técnica</p>
                      <p className="text-xs text-foreground/80 leading-relaxed break-words whitespace-pre-wrap">
                        {String(item.Analise_Tecnica || item.analise || "---").substring(0, 300)}
                        {String(item.Analise_Tecnica || item.analise || "").length > 300 ? "..." : ""}
                      </p>
                    </div>
                  </div>

                  <ChevronRight className="absolute right-4 top-6 h-5 w-5 text-pmpa-navy/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-4xl w-[95vw] sm:w-full max-h-[92vh] overflow-hidden flex flex-col p-0 border-border/50 shadow-2xl">
          <DialogHeader className="p-4 md:p-6 pb-2 border-b border-border/50 bg-pmpa-navy/5">
            <DialogTitle className="text-xl md:text-2xl font-black text-pmpa-navy uppercase tracking-tight">
              {activeReport === "Rel_Missao_Consolidado" ? `Missão OS #${selectedRecord ? String(selectedRecord.os) : ""}` : `Equipamento #${selectedRecord ? String(selectedRecord.Id_cod) : ""}`}
            </DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Detalhamento técnico do registro selecionado no relatório.
            </DialogDescription>
          </DialogHeader>
          <div className="p-4 md:p-6 flex-1 overflow-y-auto">
            {activeReport === "Rel_Missao_Consolidado" ? (
              <ServicoInternoExternoForm
                id="report-detail-form"
                initialData={selectedRecord}
                onCancel={() => setSelectedRecord(null)}
                onSubmit={handleSave}
                onPrint={(type) => { setPrintType(type); setTimeout(() => window.print(), 100); }}
                isEditMode={!!selectedRecord}
              />
            ) : (
              <CadastroForm
                id="report-detail-form"
                initialData={selectedRecord}
                onCancel={() => setSelectedRecord(null)}
                onSubmit={handleSave}
                onPrint={(type) => { setPrintType(type); setTimeout(() => window.print(), 100); }}
                isEditMode={!!selectedRecord}
              />
            )}
            {selectedRecord && <LaudoPrint data={selectedRecord} type={printType} />}
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};
