import pmpaBrasao from "@/assets/pmpa-brasao.png";
import { ThemeToggle } from "@/components/ThemeToggle";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 glass-effect bg-background/95">
      {/* Linha fina azul marinho no topo para dar um acabamento PMPA */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-pmpa-navy" />

      <div className="w-full flex h-[70px] md:h-[90px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="translate-y-[2px] md:translate-y-[4px] flex items-center justify-center transition-all hover:scale-105">
            <img src={pmpaBrasao} alt="Brasão PMPA" className="h-[50px] md:h-[80px] w-auto object-contain" />
          </div>
          <div className="flex flex-col justify-center -translate-y-[2px] md:-translate-y-[5px]">
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-pmpa-navy dark:text-white uppercase leading-none mb-0.5 md:mb-1">
              PMPA
            </h1>
            <p className="text-[10px] md:text-[13px] font-bold text-pmpa-navy dark:text-white/90 tracking-widest uppercase leading-none">
              Suporte
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
