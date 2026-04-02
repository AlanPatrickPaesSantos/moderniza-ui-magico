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
  externalTrigger?: { id: string; dateRange?: { start: string; end: string } } | null;
  onTriggerClean?: () => void;
}

export const RelatoriosSection = ({ externalTrigger, onTriggerClean }: RelatoriosSectionProps) => {
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ startDate: "", endDate: "", q: "" });
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, interno: 0, externo: 0, remoto: 0, pendente: 0 });

  const [printType, setPrintType] = useState<'laudo' | 'saida'>('laudo');

  // Gatilho Externo (vido do Dashboard)
  useEffect(() => {
    if (externalTrigger && externalTrigger.id) {
      const start = externalTrigger.dateRange?.start || "";
      const end = externalTrigger.dateRange?.end || "";
      
      setFilters({ startDate: start, endDate: end, q: "" });
      setActiveReport(externalTrigger.id);
      
      // Pequeno delay para garantir que os estados foram aplicados antes da busca
      setTimeout(() => {
        handleGenerateReportFromParams(start, end);
      }, 100);
      
      onTriggerClean?.();
    }
  }, [externalTrigger]);

  // Função unificada para busca de dados (Estatísticas + Lista)
  const fetchReportData = async (start: string, end: string, reportId: string) => {
    setIsLoading(true);
    try {
      const isMissions = reportId === "Rel_Missao_Consolidado";
      const endpoint = isMissions ? "missoes" : "servicos";
      const statusParam = isMissions ? "" : "&status=PENDENTE";
      const searchQuery = filters.q ? `&q=${encodeURIComponent(filters.q)}` : "";

      // 1. Busca Contagens Exatas
      const countUrl = `${API_BASE}/${endpoint}/count?startDate=${start}&endDate=${end}${statusParam}${searchQuery}`;
      const countResp = await fetch(countUrl);
      const exactStats = await countResp.json();

      // 2. Busca Registros para a Lista
      const listUrl = `${API_BASE}/${endpoint}?startDate=${start}&endDate=${end}${statusParam}${searchQuery}`;
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
        });
      } else {
        setStats({
          total: exactStats?.count || 0,
          interno: 0, externo: 0, remoto: 0, pendente: exactStats?.count || 0
        });
      }
    } catch (error) {
      console.error("Erro ao gerar relatório:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReportFromParams = async (start: string, end: string) => {
    if (!activeReport) return;
    await fetchReportData(start, end, activeReport);
  };
  
  const handleGenerateReport = async () => {
    if (!activeReport) return;
    await fetchReportData(filters.startDate, filters.endDate, activeReport);
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
        setSelectedRecord(fullData);
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
          .logo { width: 60px; height: 60px; object-fit: contain; }
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
          <img src="${logoBase}/Logo Ditel.jpeg" class="logo" onerror="this.style.display='none'" />
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
      <Card className="overflow-hidden shadow-[var(--shadow-card)] border-border/60 hover:shadow-[var(--shadow-card-hover)] transition-shadow duration-300">
        <div className="h-1 bg-primary" />
        <div className="p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-lg font-bold text-foreground tracking-tight">Relatórios</h2>
          </div>

          <div className="space-y-3">
            {[
              { icon: Activity, id: "Rel_Missao_Consolidado", title: "Consolidado Missões", desc: "Relatório de serviços Int/Ext" },
            ].map((item) => (
              <Button 
                key={item.id}
                onClick={() => {
                   setActiveReport(item.id);
                   setResults([]);
                }}
                variant="outline" 
                className="w-full justify-start gap-3 h-auto py-3.5 border-[1.5px] border-border hover:bg-primary/5 hover:border-primary/20 transition-all group"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <item.icon className="h-4 w-4" />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-sm group-hover:text-pmpa-navy transition-colors">{item.title}</p>
                  <p className="text-xs text-muted-foreground group-hover:text-pmpa-navy/70 transition-colors">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-pmpa-navy/40 opacity-0 group-hover:opacity-100 transition-all translate-x-1" />
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Dialog open={!!activeReport} onOpenChange={(open) => {
        if (!open) {
          setActiveReport(null);
          setResults([]);
          setStats({ total: 0, interno: 0, externo: 0, remoto: 0, pendente: 0 });
          setFilters({ startDate: "", endDate: "", q: "" });
        }
      }}>
        <DialogContent className="max-w-5xl w-[95vw] sm:w-full max-h-[92vh] overflow-hidden flex flex-col p-4 md:p-6 border-border/50 shadow-2xl">
          <DialogHeader className="p-2 md:p-4 border-b border-border/50 bg-muted/20 rounded-t-lg">
            <DialogTitle className="text-xl md:text-2xl font-black text-pmpa-navy uppercase">Gerador de Relatórios</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">Visualize e imprima relatórios consolidados do sistema DITEL.</DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Filtros */}
            <div className="flex flex-wrap gap-3 items-end bg-muted/20 p-4 rounded-xl border border-border/40 print:hidden">
              <div className="space-y-1.5 flex-1 min-w-[150px]">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Início</label>
                <Input type="date" value={filters.startDate} onChange={(e) => setFilters({...filters, startDate: e.target.value})} />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[150px]">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Fim</label>
                <Input type="date" value={filters.endDate} onChange={(e) => setFilters({...filters, endDate: e.target.value})} />
              </div>
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Busca Rápida (OS, Unidade, Nome)</label>
                <Input 
                  placeholder="Pesquisar..." 
                  value={filters.q} 
                  onChange={(e) => setFilters({...filters, q: e.target.value})} 
                  onKeyDown={(e) => e.key === "Enter" && handleGenerateReport()}
                />
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

            {/* Resumo Estatístico (Visível em Missões) */}
            {activeReport === "Rel_Missao_Consolidado" && results.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 print:hidden">
                <div className="bg-muted/40 p-3 rounded-lg border border-border/50">
                  <p className="text-[10px] font-black uppercase text-muted-foreground">Total</p>
                  <p className="text-2xl font-black text-foreground">{String(stats.total || 0)}</p>
                </div>
                <div className="bg-blue-500/10 p-3 rounded-lg border border-blue-500/20">
                  <p className="text-[10px] font-black uppercase text-blue-500">Internas</p>
                  <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{String(stats.interno || 0)}</p>
                </div>
                <div className="bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <p className="text-[10px] font-black uppercase text-emerald-500">Externas</p>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{String(stats.externo || 0)}</p>
                </div>
                <div className="bg-purple-500/10 p-3 rounded-lg border border-purple-500/20">
                  <p className="text-[10px] font-black uppercase text-purple-500">Remotas</p>
                  <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{String(stats.remoto || 0)}</p>
                </div>
                <div className="bg-orange-500/10 p-3 rounded-lg border border-orange-500/20">
                  <p className="text-[10px] font-black uppercase text-orange-500">Pendentes</p>
                  <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{String(stats.pendente || 0)}</p>
                </div>
              </div>
            )}

            {/* Lista de Resultados */}
            <div className="flex-1 overflow-y-auto border border-border/40 rounded-lg divide-y divide-border/40 custom-scrollbar print:hidden shadow-inner bg-card">
              {results.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                  <FileText className="h-12 w-12 opacity-10" />
                  <p className="font-bold text-xs uppercase tracking-widest text-center px-4">Nenhum dado carregado para este período.</p>
                </div>
              )}
              {Array.isArray(results) && results.filter(Boolean).map((item, index) => (
                <button 
                  key={item._id || `report-item-${index}`}
                  onClick={() => loadDetail(item)}
                  className="w-full text-left p-4 hover:bg-primary/5 transition-colors group flex items-center justify-between"
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
                    <div className="md:col-span-2 space-y-0.5">
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
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
                        {activeReport === "Rel_Missao_Consolidado" ? "Tipo" : "Status"}
                      </p>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        (String(item.servico) === 'externo' || String(item.Serviço) === 'PRONTO') ? 'bg-green-500/10 text-green-600 dark:text-green-400' : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {activeReport === "Rel_Missao_Consolidado" ? String(item.servico || "N/A") : String(item.Serviço || "PENDENTE")}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-pmpa-navy/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
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
              <ServicoInternoExternoForm id="report-detail-form" initialData={selectedRecord} onCancel={() => setSelectedRecord(null)} onSubmit={handleSave} />
            ) : (
              <CadastroForm id="report-detail-form" initialData={selectedRecord} onCancel={() => setSelectedRecord(null)} onSubmit={handleSave} />
            )}
            {selectedRecord && <LaudoPrint data={selectedRecord} type={printType} />}
          </div>

          <div className="p-3 md:p-4 border-t bg-muted/20 shrink-0 shadow-inner">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
              <Button
                variant="outline"
                onClick={() => setSelectedRecord(null)}
                className="h-12 md:h-14 gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold"
              >
                FECHAR
              </Button>

              <Button
                variant="outline"
                onClick={() => { setPrintType('laudo'); setTimeout(() => window.print(), 100); }}
                className="h-12 md:h-14 gap-1 md:gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold px-1"
              >
                <Printer className="h-4 w-4 md:h-6 md:w-6" />
                <span className="inline text-[9px] md:text-[13px]">LAUDO</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => { setPrintType('saida'); setTimeout(() => window.print(), 100); }}
                className="h-12 md:h-14 gap-1 md:gap-2 text-pmpa-navy border-pmpa-navy/30 hover:bg-pmpa-navy/5 font-bold px-1"
              >
                <Printer className="h-4 w-4 md:h-6 md:w-6" />
                <span className="inline text-[9px] md:text-[13px]">SAÍDA</span>
              </Button>

              <Button
                type="submit"
                form="report-detail-form"
                className="h-12 md:h-14 bg-pmpa-navy hover:bg-pmpa-navy/90 text-white font-black text-lg shadow-lg border-2 border-white/10 uppercase tracking-tight"
              >
                SALVAR
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

    </>
  );
};
