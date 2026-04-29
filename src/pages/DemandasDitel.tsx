import React, { useEffect, useState, useMemo } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Inbox, Activity, CheckCircle2, AlertTriangle, MessageSquare, Wrench, Shield, Monitor, Battery, Radio } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { API_BASE } from "@/lib/api-config";
import { format, startOfDay, subDays } from "date-fns";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend 
} from 'recharts';
import MapaInterativoPara from "@/components/MapaInterativoPara";

export default function DemandasDitel() {
  const { toast } = useToast();
  const [chamados, setChamados] = useState<any[]>([]);
  const [relatorios, setRelatorios] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCPR, setSelectedCPR] = useState<string>('');

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

  // --- Processamento de Dados para Gráficos com FILTRO ---
  const filteredData = useMemo(() => {
    let c = chamados;
    let r = relatorios;
    
    if (selectedCPR) {
      // Filtra por CPR (considerando que o nome da unidade começa com a CPR ou contém)
      c = chamados.filter(item => item.unidadeSolicitante.includes(selectedCPR));
      r = relatorios.filter(item => item.unidade.includes(selectedCPR));
    }
    
    return { chamados: c, relatorios: r };
  }, [chamados, relatorios, selectedCPR]);

  const stats = useMemo(() => {
    const { chamados: fC, relatorios: fR } = filteredData;
    const pendentes = fC.filter(c => c.status === 'pendente' || c.status === 'em_analise').length;
    const criticos = fR.filter(r => r.statusGeral === 'Critica').length;
    
    const ultimos7Dias = Array.from({length: 7}).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const label = format(d, 'dd/MM');
      const count = fC.filter(c => format(new Date(c.dataAbertura || c.createdAt), 'dd/MM') === label).length;
      return { name: label, total: count };
    });

    const statusData = [
      { name: 'Excelente', value: fR.filter(r => r.statusGeral === 'Excelente').length, color: '#10b981' },
      { name: 'Boa', value: fR.filter(r => r.statusGeral === 'Boa').length, color: '#3b82f6' },
      { name: 'Com Falhas', value: fR.filter(r => r.statusGeral === 'Com falhas').length, color: '#f59e0b' },
      { name: 'Crítica', value: fR.filter(r => r.statusGeral === 'Critica').length, color: '#ef4444' },
    ].filter(s => s.value > 0);

    const equipData = fR.slice(0, 5).map(r => ({
      name: r.unidade.split(' - ')[1] || r.unidade,
      operantes: (r.equipamentos?.radiosHT?.operantes || 0) + (r.equipamentos?.computadores?.operantes || 0),
      inoperantes: (r.equipamentos?.radiosHT?.inoperantes || 0) + (r.equipamentos?.computadores?.inoperantes || 0),
    }));

    const totalRadiosOpe = fR.reduce((acc, curr) => acc + (curr.equipamentos?.radiosHT?.operantes || 0) + (curr.equipamentos?.radiosMoveis?.operantes || 0), 0);
    const totalComputadoresOpe = fR.reduce((acc, curr) => acc + (curr.equipamentos?.computadores?.operantes || 0), 0);
    const totalComputadoresIno = fR.reduce((acc, curr) => acc + (curr.equipamentos?.computadores?.inoperantes || 0), 0);

    return { pendentes, criticos, ultimos7Dias, statusData, equipData, totalRadiosOpe, totalComputadoresOpe, totalComputadoresIno };
  }, [filteredData]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'pendente': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'em_analise': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprovado': return 'bg-green-100 text-green-800 border-green-200';
      case 'recusado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white">
      <Header />
      <main className="w-full max-w-7xl mx-auto flex-1 px-4 py-8">
        
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 flex items-center gap-3 tracking-tighter">
              DITEL CENTRAL COMMAND
            </h1>
            <p className="text-slate-400 mt-1 font-medium">
              {selectedCPR ? `Visualizando: ${selectedCPR}` : 'Gestão de Demandas Estaduais e Inteligência Logística'}
            </p>
          </div>
          <div className="flex gap-2">
             <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1">V.4.5 GEOGRAPHIC</Badge>
             {selectedCPR && (
               <Button size="sm" variant="outline" className="h-7 text-[10px] uppercase font-black" onClick={() => setSelectedCPR('')}>Limpar Filtro</Button>
             )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
          {/* Lado Esquerdo: MAPA e Seleção */}
          <div className="lg:col-span-1 space-y-6">
            <MapaInterativoPara onRegionClick={setSelectedCPR} selectedRegion={selectedCPR} />
            
            {selectedCPR && (
              <Card className="bg-slate-900/50 border border-slate-800 p-4 animate-in slide-in-from-left-4">
                <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3">Unidades na Região</h4>
                <div className="space-y-2">
                  {filteredData.relatorios.slice(0, 6).map((r, i) => (
                    <button key={i} className="w-full text-left p-3 rounded-lg bg-slate-950/50 border border-slate-800 hover:border-blue-500/50 transition-all text-xs font-bold text-slate-300">
                      {r.unidade.split(' - ')[1] || r.unidade}
                    </button>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Lado Direito: Dashboards */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="qualidade" className="space-y-6">
              <TabsList className="bg-slate-900/50 border border-slate-800 p-1.5 rounded-2xl backdrop-blur-xl w-fit">
                <TabsTrigger value="qualidade" className="py-2.5 px-8 rounded-xl font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
                  <Activity className="h-4 w-4 mr-2" /> DASHBOARD ANALÍTICO
                </TabsTrigger>
                <TabsTrigger value="inbox" className="py-2.5 px-8 rounded-xl font-black data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white transition-all">
                  <Inbox className="h-4 w-4 mr-2" /> CAIXA DE ENTRADA
                  {stats.pendentes > 0 && <Badge variant="destructive" className="ml-2 bg-red-500 animate-pulse">{stats.pendentes}</Badge>}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qualidade" className="space-y-6">
                {/* KPI CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gradient-to-br from-purple-600 to-blue-700 border-0 shadow-xl p-6">
                    <p className="text-blue-100 font-bold uppercase text-[10px] tracking-widest mb-1">Pendentes</p>
                    <h3 className="text-3xl font-black text-white">{stats.pendentes}</h3>
                  </Card>
                  <Card className="bg-gradient-to-br from-cyan-500 to-blue-600 border-0 shadow-xl p-6">
                    <p className="text-cyan-50 font-bold uppercase text-[10px] tracking-widest mb-1">Computadores OK</p>
                    <h3 className="text-3xl font-black text-white">{stats.totalComputadoresOpe}</h3>
                  </Card>
                  <Card className="bg-slate-900 border border-slate-800 p-6 flex justify-between items-center">
                    <div>
                      <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest mb-1">Alertas</p>
                      <h3 className="text-3xl font-black text-red-500">{stats.criticos}</h3>
                    </div>
                    <Shield className="h-6 w-6 text-red-500" />
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-slate-900/50 border border-slate-800 p-6">
                    <h4 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest">Fluxo Temporal</h4>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.ultimos7Dias}>
                          <XAxis dataKey="name" stroke="#475569" fontSize={10} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                          <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.1} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                  <Card className="bg-slate-900/50 border border-slate-800 p-6">
                    <h4 className="text-xs font-black uppercase text-slate-500 mb-4 tracking-widest">Logística por Unidade</h4>
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.equipData}>
                          <XAxis dataKey="name" stroke="#475569" fontSize={8} />
                          <Bar dataKey="operantes" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="inoperantes" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="inbox" className="animate-in slide-in-from-bottom-4 duration-500">
                <Card className="bg-slate-900/50 border border-slate-800 overflow-hidden">
                  <div className="divide-y divide-slate-800">
                    {filteredData.chamados.length === 0 ? (
                      <div className="p-20 text-center text-slate-500 italic">Nenhum chamado para esta região.</div>
                    ) : (
                      filteredData.chamados.map((chamado) => (
                        <div key={chamado._id} className="p-6 hover:bg-white/[0.02] transition-all">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex gap-2 items-center">
                              <Badge className="bg-blue-600">{chamado.protocolo}</Badge>
                              <span className="font-bold text-sm">{chamado.unidadeSolicitante}</span>
                            </div>
                            <Badge variant="outline" className={getStatusColor(chamado.status)}>{chamado.status}</Badge>
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 italic">"{chamado.descricao}"</p>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
