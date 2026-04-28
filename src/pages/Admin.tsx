import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { 
  Users, 
  UserPlus, 
  Shield, 
  Trash2, 
  UserCheck, 
  AlertCircle,
  Loader2,
  Lock,
  ArrowLeft,
  Pencil
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { API_BASE } from "@/lib/api-config";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PainelDemandas } from "@/components/PainelDemandas";

interface Usuario {
  _id: string;
  username: string;
  papel: string;
  nomeCompleto?: string;
}

const Admin = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // States para Criar/Editar
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    nomeCompleto: "",
    password: "",
    papel: "operador"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("ditel_token");
      const res = await fetch(`${API_BASE}/usuarios`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      } else {
        toast.error("Erro ao carregar usuários.");
      }
    } catch (error) {
      toast.error("Erro de conexão ao servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.papel !== 'admin') {
      toast.error("Acesso restrito!");
      navigate("/");
      return;
    }
    fetchUsuarios();
  }, [user, navigate]);

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData({ username: "", nomeCompleto: "", password: "", papel: "operador" });
    setIsOpen(true);
  };

  const handleOpenEdit = (u: Usuario) => {
    setEditingId(u._id);
    setFormData({ 
      username: u.username, 
      nomeCompleto: u.nomeCompleto || "", 
      password: "", // Senha em branco na edição
      papel: u.papel
    });
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingId;

    if (!isEditing && (!formData.username || !formData.password || !formData.papel)) {
      toast.warning("Preencha os campos obrigatórios.");
      return;
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("ditel_token");
      const url = isEditing ? `${API_BASE}/usuarios/${editingId}` : `${API_BASE}/usuarios`;
      const method = isEditing ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(isEditing ? "✅ Usuário atualizado!" : "✅ Usuário criado!");
        setIsOpen(false);
        fetchUsuarios();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao processar solicitação.");
      }
    } catch (err) {
      toast.error("Erro de conexão.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      const token = localStorage.getItem("ditel_token");
      const res = await fetch(`${API_BASE}/usuarios/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Usuário removido.");
        fetchUsuarios();
      } else {
        const error = await res.json();
        toast.error(error.error || "Erro ao excluir.");
      }
    } catch (err) {
      toast.error("Erro de conexão.");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-slate-950 flex flex-col">
      <Header />
      
      <main className="flex-1 container max-w-6xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        <div className="mb-6 flex justify-between items-center">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2 text-slate-500 hover:text-pmpa-navy">
            <ArrowLeft className="h-4 w-4" /> Voltar ao Início
          </Button>
        </div>
        <Tabs defaultValue="demandas" className="space-y-6">
          <TabsList className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 p-1 rounded-xl w-full justify-start overflow-x-auto h-auto">
            <TabsTrigger value="demandas" className="py-3 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white">
              <AlertCircle className="h-4 w-4 mr-2" />
              Central de Demandas Externas
            </TabsTrigger>
            <TabsTrigger value="usuarios" className="py-3 px-6 rounded-lg font-bold data-[state=active]:bg-[#004e9a] data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              Gestão de Usuários (DITEL)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="demandas">
            <PainelDemandas />
          </TabsContent>

          <TabsContent value="usuarios">
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-pmpa-navy">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Shield className="h-8 w-8 text-pmpa-navy" />
                    Gestão de Usuários
                  </h1>
                </div>
                <p className="text-muted-foreground font-medium flex items-center gap-2 pl-12">
                  Controle de acesso e privilégios administrativos
                </p>
              </div>

              <Button 
                onClick={handleOpenCreate}
                className="bg-pmpa-navy hover:bg-pmpa-navy/90 text-white font-black uppercase tracking-tighter shadow-lg shadow-pmpa-navy/20 gap-2 h-12 px-6"
              >
                <UserPlus className="h-5 w-5" />
                Novo Usuário
              </Button>

              <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <form onSubmit={handleSubmit}>
                <DialogHeader>
                  <DialogTitle className="text-xl font-black uppercase tracking-tight text-pmpa-navy">
                    {editingId ? "Editar Usuário" : "Criar Novo Acesso"}
                  </DialogTitle>
                  <DialogDescription className="font-medium">
                    {editingId ? "Atualize as informações do colaborador." : "Preencha as credenciais para o novo colaborador do sistema."}
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Nome Completo</Label>
                    <Input 
                      placeholder="Ex: João da Silva Santos" 
                      value={formData.nomeCompleto}
                      onChange={(e) => setFormData({...formData, nomeCompleto: e.target.value})}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Login / Usuário</Label>
                    <Input 
                      disabled={!!editingId}
                      placeholder="Ex: joao.silva" 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      {editingId ? "Nova Senha (Deixe em branco para manter)" : "Senha"}
                    </Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="h-11 rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-500">Papel / Nível de Acesso</Label>
                    <Select value={formData.papel} onValueChange={(val) => setFormData({...formData, papel: val as any})}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Selecione o papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-red-500" />
                            <span>Administrador</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="operador">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4 text-pmpa-navy" />
                            <span>Operador (Edição)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="visualizador">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-amber-500" />
                            <span>Visualizador (Leitura)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    type="submit" 
                    className="w-full bg-pmpa-navy text-white font-black h-12 uppercase tracking-widest"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : editingId ? "Salvar Alterações" : "Confirmar Cadastro"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200/60 dark:border-slate-800 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
              <TableRow className="hover:bg-transparent border-slate-200/60 dark:border-slate-800">
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-5 pl-8">Login / Nome</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-5">Nível de Acesso</TableHead>
                <TableHead className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 py-5 text-right pr-8">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="h-10 w-10 animate-spin text-pmpa-navy/30" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Carregando usuários...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : usuarios.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-48 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <AlertCircle className="h-10 w-10 text-slate-300" />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Nenhum usuário encontrado</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                usuarios.map((u) => (
                  <TableRow key={u._id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/30 border-slate-100 dark:border-slate-800 transition-colors">
                    <TableCell className="py-5 pl-8">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                          <Users className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-slate-200 text-lg tracking-tight leading-none mb-1">
                            {u.username}
                          </span>
                          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                            {u.nomeCompleto || "Nome não informado"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-5">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        u.papel === 'admin' 
                          ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-400' 
                          : u.papel === 'visualizador'
                            ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-900/20 dark:text-amber-400'
                            : 'bg-blue-50 text-blue-600 border border-blue-100 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {u.papel === 'admin' ? <Shield className="h-3 w-3" /> : u.papel === 'visualizador' ? <Lock className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        {u.papel}
                      </span>
                    </TableCell>
                    <TableCell className="py-5 text-right pr-8">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-pmpa-navy hover:bg-slate-100 dark:hover:bg-slate-800 transition-all rounded-xl"
                          onClick={() => handleOpenEdit(u)}
                          title="Editar Usuário"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all rounded-xl"
                          onClick={() => handleDeleteUser(u._id)}
                          disabled={u.username === user?.username}
                          title={u.username === user?.username ? "Você não pode se excluir" : "Excluir Usuário"}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-8 p-6 bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl flex items-start gap-4">
          <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-400 uppercase tracking-widest">Informações de Segurança</h4>
            <p className="text-xs text-amber-800 dark:text-amber-500 font-medium leading-relaxed">
              As permissões são aplicadas em tempo real. Usuários com nível <strong>Visualizador</strong> não podem realizar alterações em nenhum registro, enquanto <strong>Operadores</strong> têm acesso total às funções de cadastro e edição, exceto gerenciamento de usuários.
            </p>
          </div>
        </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
