import React from 'react';

interface MapaInterativoParaProps {
  onRegionClick: (region: string) => void;
  selectedRegion?: string;
}

const MapaInterativoPara: React.FC<MapaInterativoParaProps> = ({ onRegionClick, selectedRegion }) => {
  // Coordenadas estilizadas simplificadas para representar as regiões do Pará
  // Isso é uma representação visual para o protótipo.
  const regions = [
    { id: 'CPR I - Santarém', name: 'Baixo Amazonas (CPR I)', path: 'M 10,40 L 40,30 L 50,60 L 20,70 Z', color: '#06b6d4' },
    { id: 'CPRM - Belém', name: 'Metropolitana (CPRM)', path: 'M 80,45 L 95,45 L 95,55 L 80,55 Z', color: '#a855f7' },
    { id: 'CPR II - Marabá', name: 'Sudeste (CPR II)', path: 'M 60,70 L 90,65 L 95,90 L 70,95 Z', color: '#3b82f6' },
    { id: 'CPR IV - Altamira', name: 'Xingu (CPR IV)', path: 'M 40,30 L 70,25 L 80,65 L 50,60 Z', color: '#10b981' },
    { id: 'CPR XI - Breves', name: 'Marajó (CPR XI)', path: 'M 65,10 L 85,15 L 80,40 L 60,35 Z', color: '#f59e0b' },
    { id: 'CPR V - Redenção', name: 'Araguaia (CPR V)', path: 'M 40,75 L 60,70 L 70,95 L 45,98 Z', color: '#ec4899' },
    { id: 'CPR VIII - Itaituba', name: 'Tapajós (CPR VIII)', path: 'M 5,75 L 35,72 L 40,95 L 10,98 Z', color: '#8b5cf6' },
  ];

  return (
    <div className="relative w-full aspect-[4/3] bg-slate-900/20 rounded-3xl border border-slate-800/50 p-4 overflow-hidden group">
      <div className="absolute top-4 left-4 z-10">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Seletor Geográfico</h4>
        <p className="text-xs font-bold text-white">Mapa de Comando do Pará</p>
      </div>
      
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(59,130,246,0.2)]">
        {regions.map((region) => (
          <path
            key={region.id}
            d={region.path}
            fill={selectedRegion === region.id ? region.color : 'transparent'}
            stroke={selectedRegion === region.id ? '#fff' : region.color}
            strokeWidth={selectedRegion === region.id ? '1.5' : '0.5'}
            className="cursor-pointer transition-all duration-300 hover:fill-slate-800/50 hover:stroke-white"
            onClick={() => onRegionClick(region.id)}
          >
            <title>{region.name}</title>
          </path>
        ))}
      </svg>
      
      <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
        <div className="flex gap-1">
          {['Excelente', 'Alerta', 'Crítico'].map((s, i) => (
            <div key={i} className="flex items-center gap-1">
              <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-emerald-500' : i === 1 ? 'bg-yellow-500' : 'bg-red-500'}`}></div>
              <span className="text-[8px] font-bold text-slate-500 uppercase">{s}</span>
            </div>
          ))}
        </div>
        {selectedRegion && (
          <button 
            onClick={(e) => { e.stopPropagation(); onRegionClick(''); }}
            className="text-[10px] font-black text-blue-400 hover:text-white uppercase tracking-wider"
          >
            Resetar Mapa
          </button>
        )}
      </div>
    </div>
  );
};

export default MapaInterativoPara;
