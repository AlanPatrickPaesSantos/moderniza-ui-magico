import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { Loader2, Lock, User, X } from 'lucide-react';
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

      // Sucesso no login, salva no Context e redireciona
      login(data.token, { username: data.username, papel: data.papel });
      
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
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      {/* Janela Principal estilo Desktop Clássico */}
      <div className="w-[500px] bg-[#0054ab] border border-black shadow-2xl relative flex flex-col items-center pb-12 pt-8">
        
        {/* Ícone de fechar (X) no topo direito - Cosmético simulando o sistema antigo */}
        <div className="absolute top-4 right-4 cursor-pointer hover:opacity-70 transition-opacity">
          <X className="w-6 h-6 text-black" strokeWidth={1.5} />
        </div>

        {/* Brasão PMPA */}
        <div className="w-[120px] h-[140px] mb-6 flex justify-center">
          <img 
            src="/logo-pmpa.png" 
            alt="Brasão PMPA" 
            className="w-full h-full object-contain filter drop-shadow-md"
          />
        </div>

        {/* Títulos Oficiais */}
        <h1 className="text-white text-2xl font-normal tracking-wide mb-6">
          Policia Do Estado Do Pará
        </h1>
        <h2 className="text-white text-lg font-normal mb-8">
          Sistema De Cadastro Ditel
        </h2>

        {/* Card de Formulário Branco */}
        <Card className="w-[400px] bg-white rounded-md border border-gray-400 p-8 shadow-md">
          <p className="text-black text-center text-[15px] mb-8 font-normal">
            Informe suas credenciais para entrar na aplicação
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Input 
                autoFocus
                placeholder="Login" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10 border-black/80 rounded-md bg-white text-black text-base pr-10 focus-visible:ring-1 focus-visible:ring-black placeholder:text-black/80"
              />
              <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black" strokeWidth={2.5} />
            </div>

            <div className="relative">
              <Input 
                type="password" 
                placeholder="Senha" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 border-black/80 rounded-md bg-white text-black text-base pr-10 focus-visible:ring-1 focus-visible:ring-black placeholder:text-black/80"
              />
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-black/70" strokeWidth={2} />
            </div>

            <div className="flex justify-center pt-2">
              <Button 
                type="submit" 
                disabled={isLoading || !username || !password}
                className="w-32 h-10 bg-[#0054ab] hover:bg-[#00428a] text-white font-normal text-base rounded-md tracking-wide"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Entrar"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
