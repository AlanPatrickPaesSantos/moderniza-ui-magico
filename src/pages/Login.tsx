import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { ShieldAlert, Loader2, Lock } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

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
      const response = await fetch('http://localhost:5001/api/auth/login', {
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

      // Sucesso no login, salva no Context e redireciona!
      login(data.token, { username: data.username, papel: data.papel });
      
      const destination = location.state?.from?.pathname || '/';
      navigate(destination, { replace: true });
      
      toast({
        title: "Acesso Autorizado",
        description: `Bem-vindo de volta, ${data.username}! Sessão da PMPA conectada.`,
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      
      {/* Background Decorativo Elegante */}
      <div className="absolute top-0 w-full h-full overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pmpa-navy rounded-full blur-[120px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] bg-pmpa-light rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="flex flex-col items-center mb-8 gap-3">
          <div className="w-28 h-28 bg-white/50 dark:bg-white/10 p-2 rounded-2xl flex items-center justify-center mb-2 shadow-xl border border-primary/20 backdrop-blur-sm overflow-hidden">
             <img 
                src="/Logo Ditel.jpeg" 
                alt="Logo DITEL PMPA" 
                className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal rounded-xl"
             />
          </div>
          <h1 className="text-3xl font-black text-foreground tracking-tight text-center uppercase">
            DITEL <span className="text-primary">PMPA</span>
          </h1>
          <p className="text-muted-foreground text-sm font-semibold tracking-wider uppercase text-center">
            Acesso Restrito ao Sistema
          </p>
        </div>

        <Card className="p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-border/40 bg-card/80 backdrop-blur-md">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Usuário / Matrícula
              </label>
              <Input 
                autoFocus
                placeholder="Ex: admin" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 border-border/50 bg-background/50 text-foreground text-lg focus-visible:ring-primary focus-visible:border-primary shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex justify-between">
                <span>Senha Corporativa</span>
              </label>
              <Input 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-border/50 bg-background/50 text-foreground text-lg focus-visible:ring-primary focus-visible:border-primary shadow-sm"
              />
            </div>

            <Button 
              type="submit" 
              disabled={isLoading || !username || !password}
              className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-black tracking-widest uppercase transition-all shadow-md group mt-2"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" /> Entrar no Sistema
                </span>
              )}
            </Button>
          </form>
        </Card>

        <p className="mt-8 text-center text-xs text-muted-foreground/60 font-semibold uppercase tracking-widest">
          Polícia Militar do Pará - Diretoria de Telemática © 2026
        </p>
      </div>
    </div>
  );
};

export default Login;
