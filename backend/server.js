const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(`✅ Conectado ao MongoDB [${process.env.NODE_ENV === 'production' ? 'CLOUD' : 'LOCAL'}]`))
  .catch(err => console.error('❌ Erro ao conectar ao MongoDB:', err));

const Servico = require('./models/Servico');
const Unidade = require('./models/Unidade');
const Missao = require('./models/Missao');
const Usuario = require('./models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const verificarToken = require('./middleware/authMiddleware');

// [DEBUG TEMPORÁRIO] Verificar data da última OS real
app.get('/api/admin/debug-os-date', async (req, res) => {
  try {
    const lastReal = await Servico.findOne({ Id_cod: 2692 });
    const lastMission = await Missao.findOne().sort({ os: -1 });
    const countApril = await Servico.countDocuments({ Data_Ent: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } });
    
    res.json({ 
      success: true, 
      os_2692_date: lastReal ? lastReal.Data_Ent : "Não encontrada",
      last_mission_os: lastMission ? lastMission.os : "Nenhuma",
      count_servicos_april: countApril
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ====== ROTA DE AUTENTICAÇÃO ======
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Informe usuário e senha.' });
    }

    const user = await Usuario.findOne({ username: username.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Acesso Negado: Usuário incorreto ou inexistente.' });
    }

    const senhaValida = await bcrypt.compare(password, user.password);
    if (!senhaValida) {
      return res.status(401).json({ success: false, error: 'Acesso Negado: Senha inválida.' });
    }

    // Gera emissão de chave para 24 horas usando variável de ambiente
    const SECRET = process.env.JWT_SECRET || 'DitelPMPA-Seguranca-2026';
    const token = jwt.sign({ id: user._id, username: user.username, papel: user.papel }, SECRET, { expiresIn: '24h' });

    res.json({ success: true, token, username: user.username, papel: user.papel });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ success: false, error: 'Erro de Autenticação no Servidor.' });
  }
});

// APLICAÇÃO DE BLOQUEIO GLOBAL: Daqui para baixo, todas essas rotas exigem Token (Sessão Logada)
app.use('/api/servicos', verificarToken);
app.use('/api/missoes', verificarToken);
app.use('/api/unidades', verificarToken);


// Busca e filtros de serviços (listagem com limite)
app.get('/api/servicos', async (req, res) => {
  try {
    const { q, startDate, endDate, status } = req.query;
    let query = {};

    if (q) {
      const isNum = !isNaN(q);
      query = {
        $or: [
          ...(isNum ? [{ Id_cod: parseInt(q) }] : []),
          { Nº_Serie: { $regex: q, $options: 'i' } },
          { RP: { $regex: q, $options: 'i' } },
          { Solicitante: { $regex: q, $options: 'i' } },
          { Unidade: { $regex: q, $options: 'i' } }
        ]
      };
    }

    if (startDate || endDate) {
      query.Data_Ent = {};
      if (startDate) query.Data_Ent.$gte = new Date(startDate);
      if (endDate) query.Data_Ent.$lte = new Date(endDate + 'T23:59:59');
    }

    if (status) {
      // Busca insensível a maiúsculas/minúsculas para manter consistência com a rota de contagem
      query.Serviço = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    const servicos = await Servico.find(query).limit(50).sort({ Id_cod: -1 });
    res.json(servicos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Contagem EXATA de serviços para relatórios (sem limite)
app.get('/api/servicos/count', async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    let query = {};

    if (startDate || endDate) {
      query.Data_Ent = {};
      if (startDate) query.Data_Ent.$gte = new Date(startDate);
      if (endDate) query.Data_Ent.$lte = new Date(endDate + 'T23:59:59');
    }

    if (status) {
      // Busca insensível a maiúsculas/minúsculas (ex: PRONTO, Pronto, pronto)
      query.Serviço = { $regex: new RegExp(`^${status}$`, 'i') };
    }

    const total = await Servico.countDocuments(query);
    res.json({ count: total });
  } catch (err) {
    console.error('Erro na contagem de serviços:', err);
    res.status(500).json({ error: err.message });
  }
});


// Próxima OS disponível (deve vir ANTES de /api/servicos/:id)
app.get('/api/servicos/next-os', async (req, res) => {
  try {
    const last = await Servico.findOne({}, 'Id_cod').sort({ Id_cod: -1 });
    const nextId = last ? last.Id_cod + 1 : 1;
    res.json({ nextOs: nextId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single record with Navigation Flags (Turbo Mode)
app.get('/api/servicos/:id', async (req, res) => {
  try {
    const id_num = parseInt(req.params.id);
    const record = await Servico.findOne({ Id_cod: id_num });
    if (!record) return res.status(404).json({ error: 'Registro não encontrado' });

    const [hasPrev, hasNext] = await Promise.all([
      Servico.exists({ Id_cod: { $lt: id_num } }),
      Servico.exists({ Id_cod: { $gt: id_num } })
    ]);

    res.json({ record, hasPrev: !!hasPrev, hasNext: !!hasNext });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registro anterior (Turbo Mode: Single Call)
app.get('/api/servicos/:id/prev', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await Servico.findOne({ Id_cod: { $lt: id } }).sort({ Id_cod: -1 });
    if (!record) return res.status(404).json({ error: 'Sem registro anterior' });

    const [hasPrev, hasNext] = await Promise.all([
      Servico.exists({ Id_cod: { $lt: record.Id_cod } }),
      Servico.exists({ Id_cod: { $gt: record.Id_cod } })
    ]);

    res.json({ record, hasPrev: !!hasPrev, hasNext: !!hasNext });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Próximo registro (Turbo Mode: Single Call)
app.get('/api/servicos/:id/next', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const record = await Servico.findOne({ Id_cod: { $gt: id } }).sort({ Id_cod: 1 });
    if (!record) return res.status(404).json({ error: 'Sem próximo registro' });

    const [hasPrev, hasNext] = await Promise.all([
      Servico.exists({ Id_cod: { $lt: record.Id_cod } }),
      Servico.exists({ Id_cod: { $gt: record.Id_cod } })
    ]);

    res.json({ record, hasPrev: !!hasPrev, hasNext: !!hasNext });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Unidades
app.get('/api/unidades', async (req, res) => {
  try {
    const unidades = await Unidade.find({}, 'UNIDADE').sort({ UNIDADE: 1 });
    res.json(unidades.map(u => u.UNIDADE));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar novo cadastro
app.post('/api/servicos', async (req, res) => {
  try {
    const data = req.body;
    const last = await Servico.findOne({}, 'Id_cod').sort({ Id_cod: -1 });
    const nextId = last ? last.Id_cod + 1 : 1;

    const novo = new Servico({
      Id_cod: nextId,
      Data_Ent: data.dataEnt ? new Date(data.dataEnt) : new Date(),
      Tecnico: data.tecnico || '',
      T_EquipSuporte: data.tEquipSuporte || '',
      Solicitante: data.solicitante || '',
      Unidade: data.unidade || '',
      'Nº_PAE': data.nPae || '',
      RP: data.rp || '',
      'Nº_Serie': data.nSerie || '',
      Defeito_Recl: data.defeitoRecl || '',
      Analise_Tecnica: data.analiseTecnica || '',
      'Serviço': data.servico || '',
      Garantia: data.garantia || '',
      Laudo_Tecnico: data.laudoTecnico || '',
      Data_Envio: data.dataEnvio ? new Date(data.dataEnvio) : null,
      Data_Retorno: data.dataRetorno ? new Date(data.dataRetorno) : null,
      Data_Saida: data.saidaEquip || '',
      Bateria: data.bateria || '',
      telefone: data.telefone || '',
      Seção_Ditel: data.secaoDitel || '',
      fonteCabo: data.fonteCabo || false,
    });

    await novo.save();
    res.status(201).json({ success: true, os: nextId, record: novo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar registro existente
app.put('/api/servicos/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const data = req.body;

    const updated = await Servico.findOneAndUpdate(
      { Id_cod: id },
      {
        $set: {
          Tecnico: data.tecnico || '',
          T_EquipSuporte: data.tEquipSuporte || '',
          Solicitante: data.solicitante || '',
          Unidade: data.unidade || '',
          'Nº_PAE': data.nPae || '',
          RP: data.rp || '',
          'Nº_Serie': data.nSerie || '',
          Defeito_Recl: data.defeitoRecl || '',
          Analise_Tecnica: data.analiseTecnica || '',
          'Serviço': data.servico || '',
          Garantia: data.garantia || '',
          Laudo_Tecnico: data.laudoTecnico || '',
          Data_Ent: data.dataEnt ? new Date(data.dataEnt) : undefined,
          Data_Envio: data.dataEnvio ? new Date(data.dataEnvio) : null,
          Data_Retorno: data.dataRetorno ? new Date(data.dataRetorno) : null,
          Data_Saida: data.saidaEquip || '',
          Bateria: data.bateria || '',
          telefone: data.telefone || '',
          Seção_Ditel: data.secaoDitel || '',
          T_EquipTelecom: '', // Limpa campo legado ao atualizar pela nova UI
          fonteCabo: data.fonteCabo || false,
        }
      },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Registro não encontrado' });
    res.json({ success: true, record: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== ROTAS DE MISSÕES (SERVIÇOS INTERNOS/EXTERNOS) ======

// Busca e filtros de Missões (Relatórios) - listagem
app.get('/api/missoes', verificarToken, async (req, res) => {
  try {
    const { q, startDate, endDate, servico } = req.query;
    let query = {};

    if (q) {
      const isNum = !isNaN(q);
      query.$or = [
        ...(isNum ? [{ os: parseInt(q) }] : []),
        { solicitante: { $regex: q, $options: 'i' } },
        { unidade: { $regex: q, $options: 'i' } },
        { tecnicos: { $regex: q, $options: 'i' } },
        { def_recla: { $regex: q, $options: 'i' } }
      ];
    }

    if (startDate || endDate) {
      query.data = {};
      if (startDate) query.data.$gte = startDate;
      if (endDate) query.data.$lte = endDate;
    }

    if (servico) {
      query.servico = { $regex: new RegExp(`^${servico}$`, 'i') };
    }

    // Usa countDocuments para contagem exata sem limite
    const [missoes, total] = await Promise.all([
      Missao.find(query).limit(500).sort({ os: -1 }),
      Missao.countDocuments(query)
    ]);

    res.set('X-Total-Count', total);
    res.json(missoes);
  } catch (err) {
    console.error('Erro ao buscar missões:', err);
    res.status(500).json({ error: err.message });
  }
});

// Contagem EXATA de missões por tipo (para relatórios precisos)
app.get('/api/missoes/count', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    let dateQuery = {};
    if (startDate) dateQuery.$gte = startDate;
    if (endDate) dateQuery.$lte = endDate;
    const baseQuery = (startDate || endDate) ? { data: dateQuery } : {};

    const [total, interno, externo, remoto, pendente] = await Promise.all([
      Missao.countDocuments(baseQuery),
      Missao.countDocuments({ ...baseQuery, servico: 'interno' }),
      Missao.countDocuments({ ...baseQuery, servico: 'externo' }),
      Missao.countDocuments({ ...baseQuery, servico: 'remoto' }),
      Missao.countDocuments({ ...baseQuery, servico: 'pendente' }),
    ]);

    res.json({ total, interno, externo, remoto, pendente });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Obter a próxima OS de Missão disponível
app.get('/api/missoes/next-os', async (req, res) => {
  try {
    const last = await Missao.findOne({}, 'os').sort({ os: -1 });
    res.json({ nextOs: last ? last.os + 1 : 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar uma Missão específica pela OS
app.get('/api/missoes/:id', async (req, res) => {
  try {
    const os = parseInt(req.params.id);
    const missao = await Missao.findOne({ os: os });
    if (!missao) return res.status(404).json({ error: 'Missão não encontrada' });
    res.json(missao);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar nova Missão
app.post('/api/missoes', async (req, res) => {
  try {
    const data = req.body;
    const last = await Missao.findOne({}, 'os').sort({ os: -1 });
    const nextOs = last ? last.os + 1 : 1;

    const novaMissao = new Missao({
      os: nextOs,
      ...data
    });

    await novaMissao.save();
    res.status(201).json({ success: true, missao: novaMissao });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar Missão existente
app.put('/api/missoes/:id', async (req, res) => {
  try {
    const os = parseInt(req.params.id);
    const data = req.body;

    // Proteger IDs
    delete data._id;
    delete data.os;

    const updated = await Missao.findOneAndUpdate(
      { os: os },
      { $set: data },
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: 'Missão não encontrada' });
    res.json({ success: true, missao: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ====== SERVIR FRONTEND ESTÁTICO (PRODUÇÃO) ======
if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  // Middleware de captura final para o React (SPA)
  // Se não caiu em nenhuma rota /api, entrega o index.html
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT} [MODO: ${process.env.NODE_ENV || 'development'}]`);
});
