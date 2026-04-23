import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, X, PlayCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Step {
  targetId: string;
  title: string;
  content: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const steps: Step[] = [
  {
    targetId: 'command-center-title',
    title: 'Bem-vindo ao Centro de Comando 🛰️',
    content: 'Este é o seu novo painel de gestão. Aqui você tem uma visão completa e em tempo real de todas as operações da Ditel.',
    position: 'bottom'
  },
  {
    targetId: 'executive-toolbar',
    title: 'Barra de Ferramentas Executiva 🛠️',
    content: 'Aqui você acessa os módulos de Cadastro, Telecom, Suporte e Unidades. Cada botão abre um painel especializado para gestão de dados.',
    position: 'bottom'
  },
  {
    targetId: 'widget-manutencao',
    title: 'Monitor de Manutenção 🔧',
    content: 'Acompanhe quantos equipamentos estão atualmente em processo de reparo. Clique para ver o relatório detalhado de equipamentos.',
    position: 'right'
  },
  {
    targetId: 'widget-missoes',
    title: 'Produção do Mês 📈',
    content: 'Veja o total de missões realizadas pela equipe no mês vigente. Clique para abrir o relatório consolidado de missões.',
    position: 'left'
  },
  {
    targetId: 'box-busca-rapida',
    title: 'Busca Ultra-Rápida 🔍',
    content: 'Precisa encontrar uma missão específica? Digite o ID ou parte da descrição aqui para resultados instantâneos.',
    position: 'top'
  },
  {
    targetId: 'box-relatorios',
    title: 'Painel de Inteligência 📊',
    content: 'Acesse relatórios consolidados e gráficos de performance para auxiliar na tomada de decisões estratégicas.',
    position: 'top'
  }
];

export const OnboardingTour = () => {
  const [active, setActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });

  const startTour = () => {
    setCurrentStep(0);
    setActive(true);
  };

  useEffect(() => {
    if (active) {
      const element = document.getElementById(steps[currentStep].targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        setCoords({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        });
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [active, currentStep]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      setActive(false);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <>
      {/* Botão flutuante para iniciar o manual */}
      <Button
        onClick={startTour}
        className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-[#004e9a] hover:bg-blue-600 text-white shadow-2xl flex items-center justify-center group transition-all hover:scale-110 active:scale-95"
        title="Manual Interativo"
      >
        <Info className="h-7 w-7" />
        <span className="absolute right-16 bg-slate-900 text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap tracking-widest">
          Manual Interativo
        </span>
      </Button>

      <AnimatePresence>
        {active && (
          <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Overlay Escurecido com Furo (Highlight) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 pointer-events-auto"
              style={{
                clipPath: `polygon(
                  0% 0%, 
                  0% 100%, 
                  ${coords.left}px 100%, 
                  ${coords.left}px ${coords.top}px, 
                  ${coords.left + coords.width}px ${coords.top}px, 
                  ${coords.left + coords.width}px ${coords.top + coords.height}px, 
                  ${coords.left}px ${coords.top + coords.height}px, 
                  ${coords.left}px 100%, 
                  100% 100%, 
                  100% 0%
                )`
              }}
            />

            {/* Caixa de Texto do Tour */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ 
                opacity: 1, 
                y: 0, 
                scale: 1,
                top: steps[currentStep].position === 'bottom' ? coords.top + coords.height + 20 : 
                     steps[currentStep].position === 'top' ? coords.top - 200 :
                     steps[currentStep].position === 'center' ? '50%' : coords.top,
                left: steps[currentStep].position === 'right' ? coords.left + coords.width + 20 :
                      steps[currentStep].position === 'left' ? coords.left - 320 :
                      steps[currentStep].position === 'center' ? '50%' : coords.left,
                transform: steps[currentStep].position === 'center' ? 'translate(-50%, -50%)' : 'none'
              }}
              className="absolute z-[110] w-[300px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 pointer-events-auto border border-blue-100 dark:border-slate-800"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                  Passo {currentStep + 1} de {steps.length}
                </span>
                <button onClick={() => setActive(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h4 className="text-lg font-black text-slate-900 dark:text-white mb-2 leading-tight">
                {steps[currentStep].title}
              </h4>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                {steps[currentStep].content}
              </p>

              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className="text-slate-500 font-bold uppercase text-[10px]"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleNext}
                  className="bg-[#004e9a] hover:bg-blue-600 text-white font-black uppercase text-[10px] px-4"
                >
                  {currentStep === steps.length - 1 ? 'Concluir' : 'Próximo'} 
                  {currentStep < steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
