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
    <div id="printable-mission" className="hidden print:block bg-white text-black min-h-screen font-sans">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 10mm; }
          body { background: white; -webkit-print-color-adjust: exact; }
          body > *:not(#print-portal-container) { display: none !important; }
          #print-portal-container { position: absolute; left: 0; top: 0; width: 100vw; }
        }
        .text-os { font-family: monospace; }
      `}</style>

      <div className="mx-auto w-full max-w-[210mm] p-4">
        {/* Cabeçalho Oficial */}
        <div className="flex justify-between items-start mb-4 border-b-2 border-black pb-4">
          <div className="w-24">
            <img src="/logo-pmpa.png" alt="Logo PMPA" style={{ height: '75px', width: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="text-center flex-1 font-bold uppercase text-[10px] space-y-0.5">
            <p>GOVERNO DO ESTADO DO PARÁ</p>
            <p>SECRETARIA DE ESTADO DE SEGURANÇA PÚBLICA E DEFESA SOCIAL</p>
            <p>POLÍCIA MILITAR DO PARÁ</p>
            <p>DEPARTAMENTO GERAL DE ADMINISTRAÇÃO</p>
            <p className="text-[12px] mt-1 font-black">DIRETORIA DE TELEMÁTICA</p>
          </div>
          <div className="w-24 flex justify-end">
            <img src="/Logo Ditel.jpeg" alt="Logo Ditel" style={{ height: '75px', width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>

        <h1 className="text-center text-lg font-black uppercase mb-4 tracking-widest leading-none">Ordem de Serviço</h1>

        {/* Info Grid - Replicating PDF Rows */}
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-12 border border-black border-collapse">
            <div className="col-span-3 border-r border-black p-2">
              <span className="text-[9px] font-black uppercase block border-b border-black mb-1 pb-1">Ordem de Serviço:</span>
              <span className="text-lg font-black text-os">{data.os}</span>
            </div>
            <div className="col-span-9 p-2">
              <span className="text-[9px] font-black uppercase block border-b border-black mb-1 pb-1">Unidade/Seção:</span>
              <span className="text-sm font-bold uppercase">{data.unidade || 'N/A'}</span>
            </div>
          </div>

          <div className="border border-black p-2 bg-gray-50/20">
             <div className="flex justify-between items-center px-4 py-0.5">
                <span className="text-[10px] font-black uppercase">DATA: <span className="font-bold ml-2">{formatDateBR(data.data) || '___/___/______'}</span></span>
                <span className="text-[10px] font-black uppercase">HORÁRIO: <span className="font-bold ml-2">{data.horario || '__:__' || '___:___'}</span></span>
             </div>
          </div>

          <div className="grid grid-cols-2 border border-black divide-x divide-black">
            <div className="p-2">
              <span className="text-[9px] font-black uppercase block border-b border-black mb-1 pb-1">Solicitante:</span>
              <span className="text-xs font-bold uppercase">{data.solicitante || '____________________'}</span>
            </div>
            <div className="p-2">
              <span className="text-[9px] font-black uppercase block border-b border-black mb-1 pb-1">Seção DITEL:</span>
              <span className="text-xs font-bold uppercase uppercase">{data.secao || 'SUPORTE'}</span>
            </div>
          </div>
        </div>

        {/* Descrição Section */}
        <div className="mb-4">
          <h2 className="text-center font-black uppercase border border-black py-1 mb-0 text-[10px] bg-gray-100/50">Descrição e Informação</h2>
          <div className="border border-black border-t-0 p-3 min-h-[120px]">
            <p className="text-[9px] font-black uppercase mb-1">Defeito Reclamado / Constatado:</p>
            <p className="text-[12px] leading-snug whitespace-pre-wrap">{data.def_recla || 'CONFORME SOLICITADO.'}</p>
          </div>
        </div>

        {/* Atendimento Section */}
        <div className="mb-4">
          <h2 className="text-center font-black uppercase border border-black py-1 mb-0 text-[10px] bg-gray-100/50">Atendimento</h2>
          <div className="grid grid-cols-2 border border-black border-t-0 divide-x divide-black">
            <div className="p-2">
              <span className="text-[9px] font-black uppercase block mb-1">Técnico:</span>
              <span className="text-xs font-bold uppercase">{data.tecnicos || '____________________'}</span>
            </div>
            <div className="p-2">
              <span className="text-[9px] font-black uppercase block mb-1">Status da Missão:</span>
              <span className="text-xs font-black uppercase">CONCLUÍDO / PRONTO</span>
            </div>
          </div>
        </div>

        {/* Solução Section */}
        <div className="mb-6">
          <h2 className="text-center font-black uppercase border border-black py-1 mb-0 text-[10px] bg-gray-100/50">Solução Aplicada</h2>
          <div className="border border-black border-t-0 p-3 min-h-[160px]">
            <div className="text-[12px] leading-snug whitespace-pre-wrap">
              {data.solucao ? (
                data.solucao
              ) : (
                "VISTORIA TÉCNICA E PROCEDIMENTOS DE MANUTENÇÃO FINALIZADOS COM SUCESSO."
              )}
            </div>
          </div>
        </div>

        {/* Observações - If any */}
        {data.observacao && (
          <div className="mb-4 border border-black p-2 border-dashed">
            <span className="text-[9px] font-black uppercase">OBSERVAÇÕES: </span>
            <span className="text-[10px] uppercase font-medium">{data.observacao}</span>
          </div>
        )}

        {/* Materiais Utilizados */}
        {data.materiais && data.materiais.length > 0 && (
          <div className="mb-6 border border-black p-3 bg-gray-50/10">
            <h3 className="text-[9px] font-black uppercase border-b border-black mb-2 pb-1">Materiais Utilizados / Aplicados:</h3>
            <div className="grid grid-cols-3 gap-y-1">
              {data.materiais.map((m, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <span className="text-[10px] font-bold">☑</span>
                  <span className="text-[10px] font-bold uppercase">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Assinaturas */}
        <div className="grid grid-cols-2 gap-20 mt-12 py-4 text-center uppercase">
          <div className="space-y-1">
            <div className="border-t-2 border-black mx-4"></div>
            <p className="text-[9px] font-black">Técnico/Responsável</p>
          </div>
          <div className="space-y-1">
            <div className="border-t-2 border-black mx-4"></div>
            <p className="text-[9px] font-black">Solicitante / Receptor</p>
          </div>
        </div>
      </div>
    </div>,
    mountNode
  );
};
