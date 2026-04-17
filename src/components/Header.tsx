import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";

export const Header = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full shadow-md bg-gradient-to-r from-[#004e9a] to-[#002f5c] border-b border-[#001f3f]">
      {/* Linha fina dourada/branca no topo para contraste PMPA */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/20" />

      <div className="w-full flex h-[70px] md:h-[90px] items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="translate-y-[2px] md:translate-y-[4px] flex items-center justify-center transition-all hover:scale-105" onClick={() => navigate("/")} role="button">
            <img src="/logo-pmpa.png" alt="Brasão PMPA" className="h-[50px] md:h-[80px] w-auto object-contain" />
          </div>
          <div className="flex flex-col justify-center -translate-y-[2px] md:-translate-y-[5px]" onClick={() => navigate("/")} role="button">
            <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-white uppercase leading-none mb-0.5 md:mb-1 drop-shadow-md">
              PMPA
            </h1>
            <p className="text-[10px] md:text-[13px] font-bold text-blue-100 tracking-widest uppercase leading-none">
              Ditel / Suporte
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <ThemeToggle />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleLogout}
            className="flex items-center gap-2 font-black text-[10px] md:text-xs uppercase tracking-widest text-white hover:bg-white/10 transition-colors rounded-xl px-4 py-2 h-auto"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
