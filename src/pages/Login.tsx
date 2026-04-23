import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Lock, User, Terminal } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { API_BASE } from '../lib/api-config';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Credenciais inválidas');
      }

      login(data.token, { username: data.username, papel: data.papel, nomeCompleto: data.nomeCompleto });
      
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
      
      toast({
        title: "Acesso Autorizado",
        description: `Bem-vindo de volta, ${data.username}!`,
        duration: 3000,
      });

    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Acesso Negado",
        description: err.message,
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-[#004e9a] to-[#002f5c] p-4 relative overflow-hidden">
      
      {/* Background Decorativo Elegante */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex justify-center items-center opacity-[0.03]">
        <img 
          src="/logo-pmpa.png" 
          alt="Watermark PMPA" 
          className="w-[80vw] max-w-[800px] h-auto object-contain grayscale scale-150 rotate-[-15deg]"
        />
      </div>

      <div className="w-full max-w-[420px] relative z-10 flex flex-col items-center">
        
        {/* Brasão PMPA com Destaque Premium */}
        <div className="w-32 h-36 mb-6 flex justify-center drop-shadow-2xl hover:scale-105 transition-transform duration-500">
          <img 
            src="/logo-pmpa.png" 
            alt="Brasão PMPA" 
            className="w-full h-full object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
          />
        </div>

        {/* Títulos Corporativos Melhorados */}
        <div className="text-center mb-8 space-y-1">
          <h1 className="text-white text-2xl md:text-[28px] font-bold tracking-tight drop-shadow-lg">
            Polícia do Estado do Pará
          </h1>
          <h2 className="text-blue-100 text-[15px] md:text-lg font-medium opacity-90 tracking-wide">
            Sistema de Cadastro Ditel
          </h2>
        </div>

        {/* Card de Formulário Moderno e Nítido */}
        <Card className="w-full bg-white/95 backdrop-blur-md rounded-2xl border border-white/20 p-8 shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
          <p className="text-slate-600 text-center text-sm md:text-[15px] mb-8 font-semibold tracking-tight">
            Informe suas credenciais para acessar
          </p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="relative group">
              <Input 
                autoFocus
                placeholder="Login / Matrícula" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 border-slate-300 rounded-xl bg-white text-slate-900 text-base pl-4 pr-11 focus-visible:ring-2 focus-visible:ring-[#004e9a] focus-visible:border-transparent transition-all placeholder:text-slate-400 font-medium"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-md group-focus-within:bg-blue-50 transition-colors">
                <User className="w-[18px] h-[18px] text-slate-500 group-focus-within:text-[#004e9a]" strokeWidth={2.5} />
              </div>
            </div>

            <div className="relative group">
              <Input 
                type="password" 
                placeholder="Senha Corporativa" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-slate-300 rounded-xl bg-white text-slate-900 text-base pl-4 pr-11 focus-visible:ring-2 focus-visible:ring-[#004e9a] focus-visible:border-transparent transition-all placeholder:text-slate-400 font-medium"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-slate-100 rounded-md group-focus-within:bg-blue-50 transition-colors">
                <Lock className="w-[18px] h-[18px] text-slate-500 group-focus-within:text-[#004e9a]" strokeWidth={2.5} />
              </div>
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={isLoading || !username || !password}
                className="w-full h-12 bg-[#004e9a] hover:bg-[#003d7a] text-white font-bold text-base rounded-xl tracking-wide shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Fazer Login"}
              </Button>
            </div>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-blue-200/60 font-medium uppercase tracking-widest drop-shadow-sm">
          Diretoria de Telemática © 2026
        </p>
      </div>

    </div>
  );
};

export default Login;
