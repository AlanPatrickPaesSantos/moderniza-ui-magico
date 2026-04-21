import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface MissaoData {
  os: string | number;
  unidade?: string;
  solicitante?: string;
  secao?: string;
  data?: string;
  horario?: string;
  tecnicos?: string;
  def_recla?: string;
  solucao?: string;
  observacao?: string;
  materiais?: string[];
}

export const MissaoPrint = ({ data }: { data: MissaoData }) => {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = String(date.getUTCDate()).padStart(2, '0');
      const month = String(date.getUTCMonth() + 1).padStart(2, '0');
      const year = date.getUTCFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  useEffect(() => {
    let el = document.getElementById('print-portal-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'print-portal-container';
      document.body.appendChild(el);
    }
    setMountNode(el);
  }, []);

  if (!mountNode || !data) return null;

  return createPortal(
    <div id="printable-mission" className="hidden print:block bg-white text-black min-h-screen font-sans leading-tight">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 12mm; }
          body { background: white; -webkit-print-color-adjust: exact; }
          body > *:not(#print-portal-container) { display: none !important; }
          #print-portal-container { position: absolute; left: 0; top: 0; width: 100%; }
        }
        .premium-border { border: 1px solid #cbd5e1; }
        .section-header { border-bottom: 1px solid #004e9a; padding: 4px 12px; display: flex; align-items: center; }
        .label-box { padding: 4px 8px; border-right: 1px solid #cbd5e1; display: flex; align-items: center; }
        .content-box { padding: 4px 12px; display: flex; align-items: center; }
      `}</style>

      <div className="mx-auto w-full max-w-[210mm]">
        {/* CABEÇALHO INSTITUCIONAL */}
        <div className="flex justify-between items-center mb-6 pt-2">
          <img src="/logo-pmpa.png" alt="PMPA" className="h-20 w-auto object-contain" />
          <div className="text-center font-bold uppercase text-[10px] space-y-0.5 flex-1">
            <p className="text-slate-500">Governo do Estado do Pará</p>
            <p className="text-slate-600">Secretaria de Segurança Pública e Defesa Social</p>
            <p className="text-slate-800">Polícia Militar do Pará</p>
            <p className="text-slate-800">Departamento Geral de Administração</p>
            <p className="text-[14px] mt-2 font-black text-black tracking-tighter">Diretoria de Telemática</p>
          </div>
          <img src="/Logo Ditel.jpeg" alt="DITEL" className="h-20 w-auto object-contain" />
        </div>

        <div className="text-center mb-6">
          <h1 className="text-lg font-black uppercase tracking-widest pt-4 pb-1 border-t border-slate-900">
            Ordem de Missão Técnica
          </h1>
        </div>

        {/* SEÇÃO 1: IDENTIFICAÇÃO */}
        <div className="premium-border mb-6">
          <div className="section-header">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-black">1. Identificação do Chamado</h2>
          </div>
          <div className="grid grid-cols-12 border-b border-slate-300">
            <div className="col-span-3 label-box">
              <span className="text-[12px] font-black uppercase text-slate-500">Nº da O.S.</span>
            </div>
            <div className="col-span-3 content-box border-r border-slate-300">
              <span className="text-[14px] font-black tracking-tighter">#{data.os}</span>
            </div>
            <div className="col-span-3 label-box">
              <span className="text-[12px] font-black uppercase text-slate-500">Data de Registro</span>
            </div>
            <div className="col-span-3 content-box">
              <span className="text-[12px] font-bold">{formatDateBR(data.data)}</span>
            </div>
          </div>
          <div className="grid grid-cols-12">
            <div className="col-span-3 label-box">
              <span className="text-[12px] font-black uppercase text-slate-500">Unidade Solicitante</span>
            </div>
            <div className="col-span-9 content-box font-bold text-[12px] uppercase">
              {data.unidade || "Não Informada"}
            </div>
          </div>
          <div className="grid grid-cols-12 border-t border-slate-300">
            <div className="col-span-3 label-box">
              <span className="text-[12px] font-black uppercase text-slate-500">Solicitante / Receptor</span>
            </div>
            <div className="col-span-9 content-box font-bold text-[12px] uppercase italic">
              {data.solicitante || "DADOS NÃO INFORMADOS"}
            </div>
          </div>
        </div>

        {/* SEÇÃO 2: EQUIPE TÉCNICA */}
        <div className="premium-border mb-6">
          <div className="section-header">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-black">2. Atendimento Técnico</h2>
          </div>
          <div className="grid grid-cols-12 border-b border-slate-300">
            <div className="col-span-3 label-box">
              <span className="text-[12px] font-black uppercase text-slate-500">Técnicos Designados</span>
            </div>
            <div className="col-span-5 content-box border-r border-slate-300 font-bold uppercase text-[12px]">
              {data.tecnicos || "Equipe de Plantão Ditel"}
            </div>
            <div className="col-span-2 label-box">
              <span className="text-[12px] font-black uppercase text-slate-500">Seção</span>
            </div>
            <div className="col-span-2 content-box font-black text-[12px] text-black">
              {data.secao || "SUPORTE"}
            </div>
          </div>
        </div>

        {/* SEÇÃO 3: DESCRIÇÃO E ANÁLISE */}
        <div className="premium-border mb-6">
          <div className="section-header">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-black">3. Descrição do Problema e Análise</h2>
          </div>
          <div className="p-4 min-h-[120px]">
            <p className="text-[12px] font-black uppercase text-slate-400 mb-2">Defeito Reclamado / Constatação Inicial</p>
            <div className="text-[12px] leading-relaxed text-slate-800 whitespace-pre-wrap">
              {data.def_recla || "Ação de manutenção preventiva/corretiva conforme ordem de missão superior."}
            </div>
          </div>
        </div>

        {/* SEÇÃO 4: SOLUÇÃO APLICADA */}
        <div className="premium-border mb-6">
          <div className="section-header">
            <h2 className="text-[12px] font-black uppercase tracking-widest text-black">4. Solução Técnica Efetuada</h2>
          </div>
          <div className="p-4 min-h-[160px]">
            <div className="text-[12px] leading-relaxed font-bold text-slate-900 whitespace-pre-wrap italic">
              {data.solucao || "Procedimentos de manutenção técnica realizados com sucesso, restabelecendo a operacionalidade plena dos serviços/equipamentos."}
            </div>
          </div>
        </div>

        {/* SEÇÃO 5: MATERIAIS */}
        {data.materiais && data.materiais.length > 0 && (
          <div className="premium-border mb-6">
            <div className="section-header">
              <h2 className="text-[10px] font-black uppercase tracking-widest text-[#004e9a]">5. Materiais e Componentes Utilizados</h2>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4">
              {data.materiais.map((m, idx) => (
                <div key={idx} className="flex items-center gap-3 border-b border-slate-100 pb-1">
                  <div className="h-3 w-3 border border-slate-400 flex items-center justify-center text-[10px] font-bold">✓</div>
                  <span className="text-[12px] font-bold uppercase text-slate-700">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OBSERVACÕES ADICIONAIS */}
        {data.observacao && (
          <div className="mb-8 p-4 border border-blue-100 rounded-lg">
            <span className="text-[9px] font-black uppercase text-black block mb-1">Notas e Observações:</span>
            <p className="text-xs italic text-slate-600 font-medium leading-tight">"{data.observacao}"</p>
          </div>
        )}

        {/* TERMO DE ENCERRAMENTO */}
        <div className="mt-12 mb-16">
          <div className="grid grid-cols-2 gap-24 px-8 text-center">
            <div className="space-y-4">
              <div className="border-t border-slate-900 pt-2">
                <p className="text-[10px] font-black uppercase">Responsável Técnico</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Diretoria de Telemática - PMPA</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="border-t border-slate-900 pt-2">
                <p className="text-[10px] font-black uppercase">Assinatura do Receptor / Solicitante</p>
                <p className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Unidade Receptora - PMPA</p>
              </div>
            </div>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="border-t-2 border-slate-100 pt-4 text-center mt-auto">
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em]">
            Ditel - Diretoria de Telemática | {new Date().getFullYear()}
          </p>
          <p className="text-[8px] text-slate-300 font-medium mt-1">
            Este documento é de uso institucional. Sistema de Gestão Ditel (v40)
          </p>
        </div>
      </div>
    </div>,
    mountNode
  );
};
