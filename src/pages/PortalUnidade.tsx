import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Radio, AlertTriangle, CheckCircle2, Clock, Send, LogOut, ShieldAlert, Monitor, Server, Activity, Wrench, XCircle, UploadCloud, User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "../contexts/AuthContext";

const PortalUnidade = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  
  const unidadeStr = user?.unidadeVinculada || "Comando de Policiamento Regional I - Santarém";
  const nomeUsuario = user?.nomeCompleto || "Oficial";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipoDemanda, setTipoDemanda] = useState("manutencao_radio");
  
  const [qualidadeData, setQualidadeData] = useState({
    statusGeral: "Boa",
    maiorNecessidade: "Radios HT",
    qtdOperantes: "",
    qtdInoperantes: "",
    relatorioLivre: ""
  });

  const [chamadoData, setChamadoData] = useState({
    nomeSolicitante: user?.nomeCompleto || "",
    contato: "",
    urgencia: "normal",
    numeroSerie: "",
    quantidade: "",
    boletimOcorrencia: "",
    unidadeDestino: "",
    descricao: ""
  });

  const handleQualidadeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const mesAtual = new Date().toISOString().slice(0, 7); // YYYY-MM
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/relatorios-qualidade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ditel_token')}`
        },
        body: JSON.stringify({
          unidade: unidadeStr,
          oficialResponsavel: nomeUsuario,
          mesReferencia: mesAtual,
          statusGeral: qualidadeData.statusGeral,
          maiorNecessidade: qualidadeData.maiorNecessidade,
          qtdOperantes: parseInt(qualidadeData.qtdOperantes) || 0,
          qtdInoperantes: parseInt(qualidadeData.qtdInoperantes) || 0,
          relatorioLivre: qualidadeData.relatorioLivre
        })
      });

      if (!res.ok) throw new Error(await res.text());

      toast({
        title: "Relatório Enviado com Sucesso",
        description: "Obrigado. Suas informações foram registradas no DITEL para o mês atual.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao Enviar",
        description: err.message || "Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/chamados`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('ditel_token')}`
        },
        body: JSON.stringify({
          unidadeSolicitante: unidadeStr,
          tipoDemanda: tipoDemanda,
          nomeSolicitante: chamadoData.nomeSolicitante,
          contato: chamadoData.contato,
          urgencia: chamadoData.urgencia,
          numeroSerie: chamadoData.numeroSerie,
          quantidade: parseInt(chamadoData.quantidade) || 0,
          boletimOcorrencia: chamadoData.boletimOcorrencia,
          unidadeDestino: chamadoData.unidadeDestino,
          descricao: chamadoData.descricao
        })
      });

      if (!res.ok) throw new Error(await res.text());
      const resData = await res.json();

      toast({
        title: "Chamado Registrado com Sucesso!",
        description: `O DITEL foi notificado. Protocolo: ${resData.chamado.protocolo}`,
      });
      // reset optionally
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Erro ao Enviar Chamado",
        description: err.message || "Tente novamente mais tarde.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Header Simplificado */}
      <header className="bg-[#004e9a] text-white p-4 shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-yellow-400" />
            <div>
              <h1 className="font-black text-xl tracking-wider">PORTAL DA UNIDADE</h1>
              <p className="text-xs text-blue-200 font-medium">{unidadeStr}</p>
            </div>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/20 gap-2" onClick={() => { logout(); navigate("/login"); }}>
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Bem-vindo, {nomeUsuario}.</h2>
          <p className="text-slate-500 dark:text-slate-400">Verifique sua carga ou abra um chamado técnico para o DITEL.</p>
        </div>

        <Tabs defaultValue="chamado" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto h-auto">
            <TabsTrigger value="chamado" className="py-3 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Abrir Chamado
            </TabsTrigger>
            <TabsTrigger value="inventario" className="py-3 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white">
              <Radio className="h-4 w-4 mr-2" />
              Meu Inventário Declarado
            </TabsTrigger>
            <TabsTrigger value="historico" className="py-3 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white">
              <Clock className="h-4 w-4 mr-2" />
              Meus Chamados
            </TabsTrigger>
            <TabsTrigger value="qualidade" className="py-3 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white whitespace-nowrap">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Controle de Qualidade (Tenente)
            </TabsTrigger>
          </TabsList>

          {/* ABA 1: ABRIR CHAMADO */}
          <TabsContent value="chamado">
            <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none dark:border dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-6">
                <CardTitle className="text-xl text-[#004e9a] dark:text-blue-400 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" /> Formulário de Solicitação Técnica
                </CardTitle>
                <CardDescription>
                  Preencha os dados abaixo para enviar uma demanda oficial ao DITEL.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Dados de Contato */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <User className="h-4 w-4 text-[#004e9a]" /> Nome do Solicitante
                      </label>
                      <Input placeholder="Ex: SGT PM Silva" className="h-12 bg-slate-50 dark:bg-slate-950" required value={chamadoData.nomeSolicitante} onChange={e => setChamadoData({...chamadoData, nomeSolicitante: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-[#004e9a]" /> WhatsApp / Contato
                      </label>
                      <Input placeholder="(91) 90000-0000" className="h-12 bg-slate-50 dark:bg-slate-950" required value={chamadoData.contato} onChange={e => setChamadoData({...chamadoData, contato: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Tipo de Demanda</label>
                      <Select value={tipoDemanda} onValueChange={setTipoDemanda}>
                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manutencao_radio">Manutenção de Rádio</SelectItem>
                          <SelectItem value="manutencao_repetidora">Falha em Repetidora</SelectItem>
                          <SelectItem value="solicitacao_novo">Solicitação de Novos Equipamentos</SelectItem>
                          <SelectItem value="acessorios">Solicitação de Acessórios (Baterias, Antenas)</SelectItem>
                          <SelectItem value="extravio_dano">Comunicação de Extravio/Dano Operacional</SelectItem>
                          <SelectItem value="transferencia">Transferência de Equipamento (Carga)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nível de Urgência</label>
                      <Select value={chamadoData.urgencia} onValueChange={val => setChamadoData({...chamadoData, urgencia: val})}>
                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950">
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa (Preventiva/Rotina)</SelectItem>
                          <SelectItem value="normal">Normal (Problema isolado)</SelectItem>
                          <SelectItem value="alta">Alta (Impacto parcial no policiamento)</SelectItem>
                          <SelectItem value="critica">Crítica (Comunicação 100% inoperante)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {tipoDemanda === "manutencao_radio" && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-900/30 animate-in fade-in zoom-in-95 duration-300">
                      <label className="text-sm font-bold text-blue-800 dark:text-blue-300 mb-2 block">Número de Série (Tombamento)</label>
                      <Input placeholder="Digite o serial do equipamento com defeito" className="h-12 bg-white dark:bg-slate-950 border-blue-200 dark:border-blue-800" value={chamadoData.numeroSerie} onChange={e => setChamadoData({...chamadoData, numeroSerie: e.target.value})} />
                    </div>
                  )}

                  {tipoDemanda === "solicitacao_novo" && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/30 animate-in fade-in zoom-in-95 duration-300">
                      <label className="text-sm font-bold text-green-800 dark:text-green-300 mb-2 block">Quantidade Desejada</label>
                      <Input type="number" min="1" placeholder="Ex: 5" className="h-12 bg-white dark:bg-slate-950 border-green-200 dark:border-green-800 w-full sm:w-1/3" value={chamadoData.quantidade} onChange={e => setChamadoData({...chamadoData, quantidade: e.target.value})} />
                      <p className="text-xs text-green-600 mt-2 font-medium">Justifique a necessidade no campo de descrição abaixo.</p>
                    </div>
                  )}

                  {tipoDemanda === "extravio_dano" && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in zoom-in-95 duration-300">
                      <label className="text-sm font-bold text-red-800 dark:text-red-300 mb-2 block">Número do B.O / Sindicância</label>
                      <Input placeholder="Ex: BO-001/2026" className="h-12 bg-white dark:bg-slate-950 border-red-200 dark:border-red-800" value={chamadoData.boletimOcorrencia} onChange={e => setChamadoData({...chamadoData, boletimOcorrencia: e.target.value})} />
                      <p className="text-xs text-red-600 mt-2 font-medium">É obrigatório anexar o processo físico posteriormente.</p>
                    </div>
                  )}

                  {tipoDemanda === "transferencia" && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-100 dark:border-purple-900/30 animate-in fade-in zoom-in-95 duration-300 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2 block">Série do Equipamento</label>
                        <Input placeholder="Número de Série" className="h-12 bg-white dark:bg-slate-950 border-purple-200 dark:border-purple-800" value={chamadoData.numeroSerie} onChange={e => setChamadoData({...chamadoData, numeroSerie: e.target.value})} />
                      </div>
                      <div>
                        <label className="text-sm font-bold text-purple-800 dark:text-purple-300 mb-2 block">Unidade de Destino</label>
                        <Input placeholder="Ex: 2º BPM" className="h-12 bg-white dark:bg-slate-950 border-purple-200 dark:border-purple-800" value={chamadoData.unidadeDestino} onChange={e => setChamadoData({...chamadoData, unidadeDestino: e.target.value})} />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descrição Detalhada do Problema / Solicitação</label>
                    <Textarea 
                      placeholder="Descreva o que está acontecendo. Ex: O rádio não liga, a bateria não segura carga, botão PTT está falhando..." 
                      className="min-h-[120px] bg-slate-50 dark:bg-slate-950 resize-y"
                      required
                      value={chamadoData.descricao}
                      onChange={e => setChamadoData({...chamadoData, descricao: e.target.value})}
                    />
                  </div>

                  {/* Mock Upload de Arquivos */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Anexar Evidências (Fotos/Ofícios)</label>
                    <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors cursor-pointer group">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <UploadCloud className="h-6 w-6 text-[#004e9a] dark:text-blue-400" />
                      </div>
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Clique para anexar ou arraste os arquivos</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG ou PDF (Máx. 5MB)</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button type="submit" size="lg" disabled={isSubmitting} className="bg-[#004e9a] hover:bg-[#003870] text-white px-8 font-bold gap-2">
                      <Send className="h-4 w-4" /> {isSubmitting ? "Enviando..." : "Enviar Solicitação ao DITEL"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: INVENTÁRIO DECLARADO (DASHBOARD) */}
          <TabsContent value="inventario" className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-slate-900/50 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform duration-500">
                  <Server className="h-24 w-24" />
                </div>
                <CardContent className="p-5 flex flex-col gap-2 relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-1">
                    <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Carga Total</p>
                    <p className="text-3xl font-black text-slate-800 dark:text-slate-100">89</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-white to-green-50/50 dark:from-slate-900 dark:to-green-900/10 border border-green-100 dark:border-green-900/30 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-green-900 group-hover:scale-110 transition-transform duration-500">
                  <Activity className="h-24 w-24" />
                </div>
                <CardContent className="p-5 flex flex-col gap-2 relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-1">
                    <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500 mb-0.5">Em Operação</p>
                    <p className="text-3xl font-black text-green-700 dark:text-green-400">75</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-white to-yellow-50/50 dark:from-slate-900 dark:to-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-yellow-900 group-hover:scale-110 transition-transform duration-500">
                  <Wrench className="h-24 w-24" />
                </div>
                <CardContent className="p-5 flex flex-col gap-2 relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 flex items-center justify-center mb-1">
                    <Wrench className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-yellow-600 dark:text-yellow-500 mb-0.5">Manutenção</p>
                    <p className="text-3xl font-black text-yellow-700 dark:text-yellow-400">8</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-white to-red-50/50 dark:from-slate-900 dark:to-red-900/10 border border-red-100 dark:border-red-900/30 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5 text-red-900 group-hover:scale-110 transition-transform duration-500">
                  <XCircle className="h-24 w-24" />
                </div>
                <CardContent className="p-5 flex flex-col gap-2 relative z-10">
                  <div className="h-10 w-10 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center mb-1">
                    <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500 mb-0.5">Inoperantes</p>
                    <p className="text-3xl font-black text-red-700 dark:text-red-400">6</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Tabela de Radiocomunicação */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                      <Radio className="h-5 w-5 text-[#004e9a] dark:text-blue-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100">Radiocomunicação</CardTitle>
                      <CardDescription className="text-xs">Terminais portáteis, fixos e repetidoras</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] font-black text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/80 tracking-widest border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-3">Equipamento</th>
                          <th className="px-2 py-3 text-center">Total</th>
                          <th className="px-2 py-3 text-center">OPE</th>
                          <th className="px-2 py-3 text-center">MAN</th>
                          <th className="px-2 py-3 text-center">INO</th>
                          <th className="px-4 py-3">Motivo (Inoperantes)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">HT Motorola APX 2000</td>
                          <td className="px-2 py-4 text-center font-black">45</td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">40</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">3</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">2</span></td>
                          <td className="px-4 py-4 text-xs text-slate-500 font-medium">Bateria viciada / Display quebrado</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">Rádio Fixo APX 2500</td>
                          <td className="px-2 py-4 text-center font-black">12</td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">10</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">1</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">1</span></td>
                          <td className="px-4 py-4 text-xs text-slate-500 font-medium">Falta de Antena Veicular</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">Repetidora SLR 5300</td>
                          <td className="px-2 py-4 text-center font-black">2</td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">1</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">1</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">0</span></td>
                          <td className="px-4 py-4 text-xs text-slate-400 font-medium italic">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* Tabela de Informática */}
              <Card className="border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-white dark:from-slate-800/50 dark:to-slate-900 border-b border-slate-100 dark:border-slate-800 py-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                      <Monitor className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-black text-slate-800 dark:text-slate-100">Informática e Redes</CardTitle>
                      <CardDescription className="text-xs">Estações de trabalho, switches e afins</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] font-black text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/80 tracking-widest border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="px-4 py-3">Equipamento</th>
                          <th className="px-2 py-3 text-center">Total</th>
                          <th className="px-2 py-3 text-center">OPE</th>
                          <th className="px-2 py-3 text-center">MAN</th>
                          <th className="px-2 py-3 text-center">INO</th>
                          <th className="px-4 py-3">Motivo (Inoperantes)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">Computador Desktop (Sede)</td>
                          <td className="px-2 py-4 text-center font-black">25</td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">20</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">2</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">3</span></td>
                          <td className="px-4 py-4 text-xs text-slate-500 font-medium">Placa mãe queimada / Sem HD</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">Notebook Lenovo</td>
                          <td className="px-2 py-4 text-center font-black">4</td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">3</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">1</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">0</span></td>
                          <td className="px-4 py-4 text-xs text-slate-400 font-medium italic">-</td>
                        </tr>
                        <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-4 py-4 font-bold text-slate-700 dark:text-slate-200">Switch Cisco 24p</td>
                          <td className="px-2 py-4 text-center font-black">1</td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">1</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">0</span></td>
                          <td className="px-2 py-4 text-center"><span className="inline-flex items-center justify-center min-w-[28px] h-6 px-2 rounded-full text-xs font-bold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">0</span></td>
                          <td className="px-4 py-4 text-xs text-slate-400 font-medium italic">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
              <ShieldAlert className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                Os números apresentados acima refletem o controle oficial do sistema DITEL. Se os equipamentos da sua OPM não baterem com essa tabela, por favor, abra um <strong className="font-bold">Chamado de Regularização de Carga</strong> na aba ao lado informando a inconsistência.
              </p>
            </div>
          </TabsContent>

          {/* ABA 3: HISTÓRICO */}
          <TabsContent value="historico">
            <div className="space-y-4">
              {[
                { id: "DITEL-2026-8472", tipo: "Falha em Repetidora", data: "Hoje", status: "Em Análise", cor: "bg-yellow-500" },
                { id: "DITEL-2026-1029", tipo: "Solicitação de Baterias", data: "15/04/2026", status: "Despachado", cor: "bg-blue-500" },
                { id: "DITEL-2026-0041", tipo: "Manutenção Rádio HT", data: "02/03/2026", status: "Finalizado", cor: "bg-green-500" },
              ].map((chamado, i) => (
                <Card key={i} className="border border-slate-200 dark:border-slate-800 hover:border-[#004e9a]/30 transition-colors">
                  <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-slate-500">{chamado.id}</span>
                        <Badge variant="outline" className="text-[10px] uppercase border-slate-200">{chamado.data}</Badge>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-200">{chamado.tipo}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${chamado.cor}`}></div>
                      <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{chamado.status}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ABA 4: CONTROLE DE QUALIDADE */}
          <TabsContent value="qualidade">
            <Card className="border-0 shadow-xl shadow-slate-200/50 dark:shadow-none dark:border dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 pb-6">
                <CardTitle className="text-xl text-[#004e9a] dark:text-blue-400 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" /> Controle de Qualidade Mensal
                </CardTitle>
                <CardDescription>
                  Preencha o formulário abaixo para enviar o resumo da situação da sua unidade. 
                  Isso ajuda o DITEL a mapear e priorizar as necessidades do estado.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form className="space-y-6" onSubmit={handleQualidadeSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Status Geral de Comunicação</label>
                      <Select value={qualidadeData.statusGeral} onValueChange={(val) => setQualidadeData({...qualidadeData, statusGeral: val})}>
                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Excelente">Excelente (Sem problemas)</SelectItem>
                          <SelectItem value="Boa">Boa (Pequenas falhas)</SelectItem>
                          <SelectItem value="Com falhas">Com Falhas (Requer atenção)</SelectItem>
                          <SelectItem value="Critica">Crítica (Operação comprometida)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Maior Necessidade Atual</label>
                      <Select value={qualidadeData.maiorNecessidade} onValueChange={(val) => setQualidadeData({...qualidadeData, maiorNecessidade: val})}>
                        <SelectTrigger className="h-12 bg-slate-50 dark:bg-slate-950">
                          <SelectValue placeholder="Selecione a necessidade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Radios HT">Rádios Portáteis (HT)</SelectItem>
                          <SelectItem value="Radios Moveis">Rádios Móveis (Viatura)</SelectItem>
                          <SelectItem value="Baterias">Baterias</SelectItem>
                          <SelectItem value="Repetidoras">Sinal / Repetidoras</SelectItem>
                          <SelectItem value="Manutencao">Manutenção de Equipamentos</SelectItem>
                          <SelectItem value="Nenhuma">Nenhuma Prioridade</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Quantidade de HTs Operantes</label>
                      <Input type="number" min="0" placeholder="Ex: 15" className="h-12 bg-slate-50 dark:bg-slate-950" value={qualidadeData.qtdOperantes} onChange={(e) => setQualidadeData({...qualidadeData, qtdOperantes: e.target.value})} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Quantidade de HTs Inoperantes</label>
                      <Input type="number" min="0" placeholder="Ex: 3" className="h-12 bg-slate-50 dark:bg-slate-950" value={qualidadeData.qtdInoperantes} onChange={(e) => setQualidadeData({...qualidadeData, qtdInoperantes: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Relato Livre (Opcional)</label>
                    <Textarea 
                      placeholder="Descreva problemas com sinal em áreas específicas, necessidade de baterias, ou outras observações operacionais..." 
                      className="min-h-[120px] bg-slate-50 dark:bg-slate-950 resize-y"
                      value={qualidadeData.relatorioLivre}
                      onChange={(e) => setQualidadeData({...qualidadeData, relatorioLivre: e.target.value})}
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                    <Button type="submit" size="lg" disabled={isSubmitting} className="bg-[#004e9a] hover:bg-[#003870] text-white px-8 font-bold gap-2">
                      <Send className="h-4 w-4" /> {isSubmitting ? "Enviando..." : "Enviar Relatório de Qualidade"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PortalUnidade;
