import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Inbox, Activity, CheckCircle2, AlertTriangle, MessageSquare, Wrench } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE } from "@/lib/api-config";
import { format } from "date-fns";

export default function DemandasDitel() {
  const { toast } = useToast();
  const [chamados, setChamados] = useState<any[]>([]);
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDados = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('ditel_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [resChamados, resRelatorios] = await Promise.all([
        fetch(`${API_BASE}/chamados`, { headers }),
        fetch(`${API_BASE}/relatorios-qualidade`, { headers })
      ]);

      if (resChamados.ok) {
        const data = await resChamados.json();
        setChamados(Array.isArray(data) ? data : data.chamados || []);
      }
      
      if (resRelatorios.ok) {
        const data = await resRelatorios.json();
        setRelatorios(Array.isArray(data) ? data : data.relatorios || []);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Erro", description: "Falha ao carregar as demandas.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDados();
  }, []);

  const handleUpdateChamado = async (id: string, novoStatus: string) => {
    try {
      const token = localStorage.getItem('ditel_token');
      const res = await fetch(`${API_BASE}/chamados/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: novoStatus })
      });
      if (!res.ok) throw new Error("Falha ao atualizar");
      
      toast({ title: "Sucesso", description: "Status do chamado atualizado." });
      fetchDados();
    } catch (err) {
      toast({ title: "Erro", description: "Não foi possível atualizar.", variant: "destructive" });
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Novo': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Em Análise': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Aprovado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Recusado': return 'bg-red-100 text-red-800 border-red-200';
      case 'Finalizado': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getQualidadeColor = (status: string) => {
    switch(status) {
      case 'Excelente': return 'bg-emerald-500';
      case 'Boa': return 'bg-blue-500';
      case 'Com falhas': return 'bg-yellow-500';
      case 'Critica': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header />
      <main className="w-full max-w-7xl mx-auto flex-1 px-4 py-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Activity className="h-8 w-8 text-amber-500" /> 
            C.Q. & Demandas do Interior
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Painel exclusivo do DITEL para gerenciar chamados e monitorar a qualidade de comunicação no estado.
          </p>
        </div>

        <Tabs defaultValue="inbox" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
            <TabsTrigger value="inbox" className="py-2.5 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white">
              <Inbox className="h-4 w-4 mr-2" />
              Caixa de Entrada (Chamados)
              {chamados.filter(c => c.status === 'Novo').length > 0 && (
                <Badge variant="destructive" className="ml-2 bg-red-500">{chamados.filter(c => c.status === 'Novo').length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="qualidade" className="py-2.5 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              Painel de Qualidade (Heatmap)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbox">
            <Card className="border-0 shadow-lg dark:bg-slate-900">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <CardTitle>Chamados Recebidos</CardTitle>
                <CardDescription>Gerencie as solicitações feitas pelas unidades OPM/CPR.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#004e9a]" /></div>
                ) : chamados.length === 0 ? (
                  <div className="text-center p-12 text-slate-500">Nenhum chamado recebido.</div>
                ) : (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {chamados.map((chamado) => (
                      <div key={chamado._id} className="p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <Badge className="font-mono bg-[#004e9a]">{chamado.protocolo}</Badge>
                            <span className="font-bold text-lg text-slate-900 dark:text-white">{chamado.unidadeSolicitante}</span>
                            <Badge variant="outline" className={getStatusColor(chamado.status)}>{chamado.status}</Badge>
                            {chamado.urgencia === 'critica' && <Badge variant="destructive" className="bg-red-500 animate-pulse"><AlertTriangle className="w-3 h-3 mr-1"/> CRÍTICO</Badge>}
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                            <div>
                              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Tipo de Demanda</p>
                              <p className="font-medium flex items-center gap-2"><Wrench className="w-4 h-4 text-slate-400"/> {(chamado.tipoDemanda || 'outro').replace(/_/g, ' ').toUpperCase()}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Solicitante</p>
                              <p className="font-medium">{chamado.nomeSolicitante}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Contato</p>
                              <p className="font-medium">{chamado.contato}</p>
                            </div>
                            <div>
                              <p className="text-slate-500 text-xs font-bold uppercase mb-1">Data</p>
                              <p className="font-medium">{format(new Date(chamado.dataAbertura || new Date()), "dd/MM/yyyy HH:mm")}</p>
                            </div>
                          </div>

                          <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl">
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap"><strong className="text-blue-900 dark:text-blue-300">Descrição:</strong> {chamado.descricao}</p>
                          </div>
                        </div>

                        <div className="w-full md:w-48 shrink-0 flex flex-col gap-2 justify-center border-l border-slate-100 dark:border-slate-800 pl-0 md:pl-6">
                          <p className="text-xs font-bold text-slate-500 mb-1">Ações (Mudar Status)</p>
                          <Select value={chamado.status} onValueChange={(val) => handleUpdateChamado(chamado._id, val)}>
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Novo">Novo</SelectItem>
                              <SelectItem value="Em Análise">Em Análise</SelectItem>
                              <SelectItem value="Aprovado">Aprovado</SelectItem>
                              <SelectItem value="Recusado">Recusado</SelectItem>
                              <SelectItem value="Finalizado">Finalizado</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" className="w-full mt-2 gap-2" onClick={() => window.open(`https://wa.me/55${(chamado.contato || '').replace(/\D/g, '')}`, '_blank')}>
                            <MessageSquare className="w-4 h-4" /> Whatsapp
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="qualidade">
            <Card className="border-0 shadow-lg dark:bg-slate-900">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                <CardTitle>Painel de Qualidade (Heatmap Mensal)</CardTitle>
                <CardDescription>Visão geral de como as unidades avaliam a sua comunicação neste mês.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                 {isLoading ? (
                  <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-[#004e9a]" /></div>
                ) : relatorios.length === 0 ? (
                  <div className="text-center p-12 text-slate-500">Nenhum relatório de qualidade recebido ainda.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatorios.map((rel) => (
                      <div key={rel._id} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                        <div className={`h-2 w-full ${getQualidadeColor(rel.statusGeral)}`} />
                        <div className="p-5">
                          <h3 className="font-black text-lg text-slate-800 dark:text-slate-100 mb-1">{rel.unidade}</h3>
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-xs text-slate-500">Mês: {rel.mesReferencia}</span>
                            <Badge variant="outline" className={`font-bold border-0 text-white ${getQualidadeColor(rel.statusGeral)}`}>
                              {rel.statusGeral}
                            </Badge>
                          </div>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-600 dark:text-slate-400">Maior Necessidade:</span>
                              <span className="font-bold text-slate-900 dark:text-white">{rel.maiorNecessidade}</span>
                            </div>
                            <div className="flex gap-2">
                              <div className="flex-1 bg-green-50 dark:bg-green-900/10 p-2 rounded-lg text-center border border-green-100 dark:border-green-900/30">
                                <span className="block text-xl font-black text-green-600 dark:text-green-400">{rel.qtdOperantes}</span>
                                <span className="text-[10px] uppercase font-bold text-green-800 dark:text-green-300">Operantes</span>
                              </div>
                              <div className="flex-1 bg-red-50 dark:bg-red-900/10 p-2 rounded-lg text-center border border-red-100 dark:border-red-900/30">
                                <span className="block text-xl font-black text-red-600 dark:text-red-400">{rel.qtdInoperantes}</span>
                                <span className="text-[10px] uppercase font-bold text-red-800 dark:text-red-300">Inoperantes</span>
                              </div>
                            </div>
                            {rel.relatorioLivre && (
                              <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-xs text-slate-500 italic line-clamp-3">"{rel.relatorioLivre}"</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      </main>
    </div>
  );
}
