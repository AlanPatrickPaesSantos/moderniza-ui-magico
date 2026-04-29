import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface LaudoData {
  Id_cod: number | string;
  T_EquipSuporte?: string;
  T_EquipTelecom?: string;
  Unidade?: string;
  Nº_PAE?: string;
  RP?: string;
  Nº_Serie?: string;
  Solicitante?: string;
  Data_Ent?: string;
  Defeito_Recl?: string;
  Analise_Tecnica?: string;
  Laudo_Tecnico?: string;
  Data_Saida?: string;
  Tecnico?: string;
}

export const LaudoPrint = ({ data, type = 'laudo' }: { data: LaudoData, type?: 'laudo' | 'saida' | 'entrada' }) => {
  const [mountNode, setMountNode] = useState<HTMLElement | null>(null);

  const formatDateBR = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      // Se já estiver no formato brasileiro DD/MM/AAAA, retorna direto
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return dateStr;

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;

      // Usamos UTC para evitar que o fuso horário mude a data em 1 dia para trás
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

  const renderHalf = () => (
    <div className="laudo-half px-6 py-4 flex flex-col h-full font-sans text-[11px] leading-tight text-black bg-white relative overflow-hidden">
      {/* Logos and Header */}
      <img src="/logo-pmpa.png" alt="Watermark" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.05, width: '380px', zIndex: 0, pointerEvents: 'none' }} />
      <div className="flex justify-between items-start mb-2 relative border-b-[1.2pt] border-black pb-2">
        <div className="w-32 flex justify-start">
          <img src="/logo-pmpa.png" alt="Logo PMPA" style={{ height: '75px', width: 'auto', objectFit: 'contain' }} />
        </div>
        <div className="text-center flex-1 font-bold uppercase space-y-0.5 text-[9px]">
          <p>Governo do Estado do Pará</p>
          <p>Secretaria de Estado de Segurança Pública e Defesa Social</p>
          <p>Polícia Militar do Pará</p>
          <p>Departamento Geral de Administração</p>
          <p className="text-[10px] mt-1">Diretoria de Telemática</p>
        </div>
        <div className="w-32 flex justify-end translate-x-2">
          <img
            src="/Logo Ditel.jpeg"
            alt="Logo DITEL"
            style={{ height: '75px', width: 'auto', objectFit: 'contain', imageRendering: '-webkit-optimize-contrast' }}
          />
        </div>
      </div>

      <div className="text-center mb-3">
        <h2 className="text-sm font-black tracking-wide">
          {type === 'saida' ? 'RELATÓRIO DE SAÍDA DE EQUIPAMENTO' : 
           type === 'entrada' ? 'RELATÓRIO DE ENTRADA DE EQUIPAMENTO' : 
           'RELATÓRIO DE LAUDO TÉCNICO'}
        </h2>
      </div>

      {/* Row 1: OS / Suporte / Telecom */}
      <div className="grid grid-cols-6 gap-2 mb-2 items-center border-b border-black pb-1">
        <div className="col-span-1 font-black text-sm">OS: {data.Id_cod}</div>
        <div className="col-span-2 text-[10px]">
          <span className="font-bold uppercase">Suporte:</span> {data.T_EquipSuporte || ''}
        </div>
        <div className="col-span-3 text-[10px]">
          <span className="font-bold uppercase">Telecom:</span> {data.T_EquipTelecom || ''}
        </div>
      </div>

      {/* Row 2: Grid Info */}
      <div className="grid grid-cols-6 gap-4 mb-0.5 font-bold uppercase text-[9px]">
        <div>Unidade</div>
        <div>Nº PAE</div>
        <div>RP/PM</div>
        <div className="col-span-1">Nº SERIE</div>
        <div className="col-span-1">Solicitante</div>
        <div>Data Entrada</div>
      </div>
      <div className="grid grid-cols-6 gap-4 mb-3 text-[10px] min-h-[1rem]">
        <div>{data.Unidade || '-'}</div>
        <div>{data.Nº_PAE || '-'}</div>
        <div>{data.RP || '-'}</div>
        <div>{data.Nº_Serie || '-'}</div>
        <div>{data.Solicitante || '-'}</div>
        <div>{formatDateBR(data.Data_Ent) || '-'}</div>
      </div>

      {/* Defeitos */}
      <div className="space-y-2 flex-1">
        <div>
          <h3 className="font-bold uppercase mb-0.5 text-[10px] border-l-2 border-black pl-1.5 bg-gray-50">Defeito Reclamado:</h3>
          <p className="min-h-[1.5rem] text-[10px] leading-normal">{data.Defeito_Recl || 'Não informado.'}</p>
        </div>
        <div>
          <h3 className="font-bold uppercase mb-0.5 text-[10px] border-l-2 border-black pl-1.5 bg-gray-50">Análise Técnica:</h3>
          <p className="min-h-[1.5rem] text-[10px] leading-normal">{data.Analise_Tecnica || 'Sob análise.'}</p>
        </div>
        {type === 'laudo' && (
          <div>
            <h3 className="font-bold uppercase mb-0.5 text-[10px] border-l-2 border-black pl-1.5 bg-gray-50">Laudo Técnico:</h3>
            <p className="min-h-[1.5rem] text-[10px] leading-normal font-medium">{data.Laudo_Tecnico}</p>
          </div>
        )}
      </div>

      {/* Row Footer: Data Saída / Tecnico */}
      <div className="mt-auto">
        <div className="grid grid-cols-2 gap-8 mb-3 pb-2 border-b border-black">
          <div className="text-[10px]"><span className="font-bold uppercase">Data de Saída:</span> {formatDateBR(data.Data_Saida) || '___/___/______'}</div>
          <div className="text-[10px]"><span className="font-bold uppercase">Técnico Resp:</span> {data.Tecnico || '____________________'}</div>
        </div>

        <div className="text-center font-bold text-[8.5px] mb-6 italic">
          "A Diretoria de Telemática não possui peças de reposição ou suprimento para aquisição destas peças informadas"
        </div>

        {/* Assinaturas */}
        <div className="grid grid-cols-2 gap-12 text-center text-[9px]">
          <div className="border-t border-black pt-1 uppercase">
            <p className="font-bold">MADAKE MARCOS LEAL DO NASCIMENTO - 2º TEN PM RG 44448</p>
            <p>Chefe das Seções de Telecomunicação e Suporte ao Usuário</p>
          </div>
          <div className="border-t border-black pt-1 uppercase flex flex-col justify-end">
            <p className="font-bold">RECEBEDOR DO EQUIPAMENTO</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (!mountNode) return null;

  return createPortal(
    <div id="printable-report" className="hidden print:block bg-white text-black min-h-screen">
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 0; }
          body { background: white; -webkit-print-color-adjust: exact; }
          img { -webkit-print-color-adjust: exact; }
          
          /* CRITICAL: Hides everything on the page except our print portal wrapper */
          body > *:not(#print-portal-container) {
            display: none !important;
          }
          /* Removes margin from the portal container to align properly */
          #print-portal-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100vw;
          }
        }
      `}</style>
      <div className="mx-auto w-full max-w-[210mm] h-[290mm] overflow-hidden flex flex-col justify-between">
        <div className="flex-1 w-full flex flex-col overflow-hidden">
          {renderHalf()}
        </div>

        {/* Visual divider space / Cutline */}
        <div className="h-0 border-t-2 border-dashed border-gray-400 w-full -my-px no-print z-10"></div>

        <div className="flex-1 w-full flex flex-col overflow-hidden">
          {renderHalf()}
        </div>
      </div>
    </div>,
    mountNode
  );
};
