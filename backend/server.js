const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// Carregamento resiliente do .env (Apenas se o arquivo existir localmente)
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log('📝 .env carregado localmente');
} else {
  console.log('🌐 Usando variáveis de ambiente do sistema/Render');
}

const https = require('https');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
if (!process.env.MONGODB_URI) {
  console.error('❌ ERRO CRÍTICO: MONGODB_URI não definida nas variáveis de ambiente!');
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log(`✅ Conectado ao MongoDB [${process.env.NODE_ENV === 'production' ? 'CLOUD' : 'LOCAL'}]`))
  .catch(err => {
    console.error('❌ Erro na conexão com o MongoDB:', err.message);
    if (err.message.includes('undefined')) {
      console.error('   DICA: Verifique se a MONGODB_URI está configurada no painel do Render.');
    }
  });

const Servico = require('./models/Servico');
const Unidade = require('./models/Unidade');
const EqSuporte = require('./models/EqSuporte');
const Missao = require('./models/Missao');
const Usuario = require('./models/Usuario');
const bcrypt = require('bcryptjs');
const verificarToken = require('./middleware/authMiddleware');

// Status
app.get('/api/status', (req, res) => {
  res.json({ status: 'Rodando', database: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado' });
});

// ====== ROTA DE AUTENTICAÇÃO ======
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Informe usuário e senha.' });
    }

    const user = await Usuario.findOne({ username: username.toLowerCase() }).lean();
    if (!user) {
      return res.status(401).json({ success: false, error: 'Acesso Negado: Usuário incorreto ou inexistente.' });
    }

    const senhaValida = await bcrypt.compare(password, user.password);
    if (!senhaValida) {
      return res.status(401).json({ success: false, error: 'Acesso Negado: Senha inválida.' });
    }

    // Segurança de Token: Prioriza variável de ambiente para produção on-premise (Ditel/PMPA)
    const SECRET = process.env.JWT_SECRET;
    if (!SECRET && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ AVISO DE SEGURANÇA: JWT_SECRET não definida. Usando chave padrão (NÃO RECOMENDADO EM PRODUÇÃO)!');
    }
    const finalSecret = SECRET || 'DitelPMPA-Seguranca-Fixa-2026';
    const token = jwt.sign({ id: user._id, username: user.username, papel: user.papel }, finalSecret, { expiresIn: '24h' });

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
app.use('/api/eqsuporte', verificarToken);

// Helper para construir queries de serviços de suporte de forma unificada
const buildServiceQuery = (params) => {
  const { q, startDate, endDate, status, bateria, garantia, bateria_vazia, filterType } = params;
  let query = {};

  if (q) {
    const isNum = !isNaN(q);
    if (filterType === 'os' && isNum) {
      query.Id_cod = parseInt(q);
    } else if (filterType === 'serie') {
      query.Nº_Serie = { $regex: q, $options: 'i' };
    } else if (filterType === 'rp') {
      query.RP = { $regex: q, $options: 'i' };
    } else if (filterType === 'unidade') {
      query.Unidade = { $regex: q, $options: 'i' };
    } else {
      query.$or = [
        ...(isNum ? [{ Id_cod: parseInt(q) }] : []),
        { Nº_Serie: { $regex: q, $options: 'i' } },
        { RP: { $regex: q, $options: 'i' } },
        { Solicitante: { $regex: q, $options: 'i' } },
        { Unidade: { $regex: q, $options: 'i' } },
        { Serviço: { $regex: q, $options: 'i' } }
      ];
    }
  }

  if (startDate || endDate) {
    query.Data_Ent = {};
    if (startDate) query.Data_Ent.$gte = new Date(startDate + 'T00:00:00.000Z');
    if (endDate) query.Data_Ent.$lte = new Date(endDate + 'T23:59:59.999Z');
  }

  if (status) {
    query.Serviço = { $regex: new RegExp(`^\\s*${status}\\s*$`, 'i') };
  }

  if (bateria === "true") {
    query.Bateria = { $ne: "", $exists: true };
  }

  if (garantia === "true") {
    query.Garantia = { $regex: /^\s*sim\s*$/i };
  }

  if (bateria_vazia === "true") {
    query.$or = [
      { Bateria: "" },
      { Bateria: { $exists: false } }
    ];
  }

  return query;
};


// Busca e filtros de serviços (listagem com limite)
app.get('/api/servicos', async (req, res) => {
  try {
    const query = buildServiceQuery(req.query);
    const servicos = await Servico.find(query).limit(50).sort({ Id_cod: -1 }).lean();
    res.json(servicos);
  } catch (err) {
    console.error('Erro ao buscar serviços:', err);
    res.status(500).json({ error: 'Erro interno ao buscar serviços.' });
  }
});

// Contagem EXATA de serviços para relatórios (sem limite)
app.get('/api/servicos/count', async (req, res) => {
  try {
    const query = buildServiceQuery(req.query);
    const total = await Servico.countDocuments(query);
    res.json({ count: total });
  } catch (err) {
    console.error('Erro na contagem de serviços:', err);
    res.status(500).json({ error: 'Erro interno na contagem de serviços.' });
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
    const record = await Servico.findOne({ Id_cod: id_num }).lean();
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
    const record = await Servico.findOne({ Id_cod: { $lt: id } }).sort({ Id_cod: -1 }).lean();
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
    const record = await Servico.findOne({ Id_cod: { $gt: id } }).sort({ Id_cod: 1 }).lean();
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

// ====== ROTAS DE UNIDADES (SIMPLES E CRUD) ======

// Lista simples (usada globalmente para Dropdowns)
app.get('/api/unidades', async (req, res) => {
  try {
    const unidades = await Unidade.find({}, 'UNIDADE').sort({ UNIDADE: 1 }).lean();
    res.json(unidades.map(u => u.UNIDADE));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listagem detalhada para o Painel de Gestão (Busca)
app.get('/api/unidades/list', async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};
    
    if (q) {
      query.UNIDADE = { $regex: q, $options: 'i' };
    }
    
    const unidades = await Unidade.find(query).sort({ ID_UNID_SEÇÃO: 1 }).lean();
    res.json(unidades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter próximo ID de unidade disponível
app.get('/api/unidades/next-id', async (req, res) => {
  try {
    const last = await Unidade.findOne().sort({ ID_UNID_SEÇÃO: -1 }).lean();
    res.json({ nextId: last && last.ID_UNID_SEÇÃO ? last.ID_UNID_SEÇÃO + 1 : 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar nova Unidade
app.post('/api/unidades', async (req, res) => {
  try {
    let { UNIDADE } = req.body;
    if (!UNIDADE || UNIDADE.trim() === '') {
      return res.status(400).json({ error: 'A sigla da unidade é obrigatória.' });
    }
    
    UNIDADE = UNIDADE.trim().toUpperCase();
    
    // Check de duplicação ignorando maiúsculas/minúsculas
    const existe = await Unidade.findOne({ UNIDADE: { $regex: new RegExp(`^\\s*${UNIDADE}\\s*$`, 'i') } });
    
    if (existe) {
      return res.status(400).json({ error: 'Já existe uma unidade cadastrada com esta sigla.' });
    }
    
    const last = await Unidade.findOne().sort({ ID_UNID_SEÇÃO: -1 }).lean();
    const nextId = last && last.ID_UNID_SEÇÃO ? last.ID_UNID_SEÇÃO + 1 : 1;
    
    const novaUnidade = new Unidade({
      ID_UNID_SEÇÃO: nextId,
      UNIDADE: UNIDADE
    });
    
    await novaUnidade.save();
    res.status(201).json({ success: true, unidade: novaUnidade });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar Unidade
app.put('/api/unidades/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let { UNIDADE } = req.body;
    
    if (!UNIDADE || UNIDADE.trim() === '') {
      return res.status(400).json({ error: 'A sigla da unidade é obrigatória.' });
    }
    
    UNIDADE = UNIDADE.trim().toUpperCase();
    
    // Verifica se a sigla já existe em OUTRA unidade
    const existe = await Unidade.findOne({ 
      UNIDADE: { $regex: new RegExp(`^\\s*${UNIDADE}\\s*$`, 'i') },
      ID_UNID_SEÇÃO: { $ne: id }
    });
    
    if (existe) {
      return res.status(400).json({ error: 'Já existe outra unidade cadastrada com esta sigla.' });
    }
    
    const updated = await Unidade.findOneAndUpdate(
      { ID_UNID_SEÇÃO: id },
      { $set: { UNIDADE: UNIDADE } },
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ error: 'Unidade não encontrada.' });
    res.json({ success: true, unidade: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar Unidade
app.delete('/api/unidades/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await Unidade.findOneAndDelete({ ID_UNID_SEÇÃO: id });
    
    if (!deleted) return res.status(404).json({ error: 'Unidade não encontrada.' });
    res.json({ success: true, message: 'Unidade removida com sucesso.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ====== ROTAS DE EQUIPAMENTOS DE SUPORTE ======

// Lista simples (usada globalmente para Dropdowns)
app.get('/api/eqsuporte', async (req, res) => {
  try {
    const equips = await EqSuporte.find({}, 'EQUIPAMENTO').sort({ EQUIPAMENTO: 1 }).lean();
    res.json(equips.map(e => e.EQUIPAMENTO));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Listagem detalhada para o Painel de Gestão (Busca)
app.get('/api/eqsuporte/list', async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};
    if (q) {
      query.EQUIPAMENTO = { $regex: q, $options: 'i' };
    }
    const equips = await EqSuporte.find(query).sort({ ID_EQUIP: 1 }).lean();
    res.json(equips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter próximo ID disponível
app.get('/api/eqsuporte/next-id', async (req, res) => {
  try {
    const last = await EqSuporte.findOne().sort({ ID_EQUIP: -1 }).lean();
    res.json({ nextId: last && last.ID_EQUIP ? last.ID_EQUIP + 1 : 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar novo Equipamento de Suporte
app.post('/api/eqsuporte', async (req, res) => {
  try {
    let { EQUIPAMENTO } = req.body;
    if (!EQUIPAMENTO || EQUIPAMENTO.trim() === '') {
      return res.status(400).json({ error: 'O nome do equipamento é obrigatório.' });
    }
    EQUIPAMENTO = EQUIPAMENTO.trim();
    
    const existe = await EqSuporte.findOne({ EQUIPAMENTO: { $regex: new RegExp(`^\\s*${EQUIPAMENTO}\\s*$`, 'i') } });
    if (existe) {
      return res.status(400).json({ error: 'Já existe um equipamento cadastrado com este nome.' });
    }
    
    const last = await EqSuporte.findOne().sort({ ID_EQUIP: -1 }).lean();
    const nextId = last && last.ID_EQUIP ? last.ID_EQUIP + 1 : 1;
    
    const novo = new EqSuporte({ ID_EQUIP: nextId, EQUIPAMENTO });
    await novo.save();
    res.status(201).json({ success: true, equipamento: novo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar Equipamento de Suporte
app.put('/api/eqsuporte/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    let { EQUIPAMENTO } = req.body;
    
    if (!EQUIPAMENTO || EQUIPAMENTO.trim() === '') {
      return res.status(400).json({ error: 'O nome do equipamento é obrigatório.' });
    }
    EQUIPAMENTO = EQUIPAMENTO.trim();
    
    const existe = await EqSuporte.findOne({ 
      EQUIPAMENTO: { $regex: new RegExp(`^\\s*${EQUIPAMENTO}\\s*$`, 'i') },
      ID_EQUIP: { $ne: id }
    });
    
    if (existe) {
      return res.status(400).json({ error: 'Já existe outro equipamento cadastrado com este nome.' });
    }
    
    const updated = await EqSuporte.findOneAndUpdate(
      { ID_EQUIP: id },
      { $set: { EQUIPAMENTO: EQUIPAMENTO } },
      { new: true }
    );
    
    if (!updated) return res.status(404).json({ error: 'Equipamento não encontrado.' });
    res.json({ success: true, equipamento: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Deletar Equipamento de Suporte
app.delete('/api/eqsuporte/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const deleted = await EqSuporte.findOneAndDelete({ ID_EQUIP: id });
    if (!deleted) return res.status(404).json({ error: 'Equipamento não encontrado.' });
    res.json({ success: true, message: 'Equipamento removido com sucesso.' });
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
      Data_Saida: data.dataSaida ? new Date(data.dataSaida) : null,
      saidaEquip: data.saidaEquip || '',
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
          Data_Saida: data.dataSaida ? new Date(data.dataSaida) : null,
          saidaEquip: data.saidaEquip || '',
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
      if (startDate) query.data.$gte = new Date(startDate + 'T00:00:00.000Z');
      if (endDate) query.data.$lte = new Date(endDate + 'T23:59:59.999Z');
    }

    if (servico) {
      // Busca exata mas insensível a maiúsculas (ex: interno, INTERNO, Interno)
      query.servico = { $regex: new RegExp(`^\\s*${servico}\\s*$`, 'i') };
    }

    // Usa countDocuments para contagem exata sem limite
    const [missoes, total] = await Promise.all([
      Missao.find(query).limit(200).sort({ os: -1 }).lean(),
      Missao.countDocuments(query)
    ]);

    res.set('X-Total-Count', total);
    res.json(missoes);
  } catch (err) {
    console.error('Erro ao buscar missões:', err);
    res.status(500).json({ error: err.message });
  }
});

// Rota Consolidada de Alta Performance para Relatórios
app.get('/api/stats/consolidated', async (req, res) => {
  try {
    const { startDate, endDate, q } = req.query;
    
    // 1. Prepara queries
    let dateQuery = {};
    if (startDate) dateQuery.$gte = new Date(startDate + 'T00:00:00.000Z');
    if (endDate) dateQuery.$lte = new Date(endDate + 'T23:59:59.999Z');
    
    const baseMissaoQuery = (startDate || endDate) ? { data: dateQuery } : {};
    if (q) {
      const isNum = !isNaN(q);
      baseMissaoQuery.$or = [
        ...(isNum ? [{ os: parseInt(q) }] : []),
        { solicitante: { $regex: q, $options: 'i' } },
        { unidade: { $regex: q, $options: 'i' } }
      ];
    }

    const serviceQuery = buildServiceQuery(req.query);

    // 2. Executa todas as contagens e rankings em paralelo no Banco de Dados (v40.5 Integridade Total)
    const [counts, topUnidades, topServicos, topDefeitos] = await Promise.all([
      // Contagens Simples
      Promise.all([
        Missao.countDocuments(baseMissaoQuery),
        Missao.countDocuments({ ...baseMissaoQuery, $or: [{ servico: /^\s*interno\s*$/i }, { categoria: /^\s*interno\s*$/i }] }),
        Missao.countDocuments({ ...baseMissaoQuery, $or: [{ servico: /^\s*externo\s*$/i }, { categoria: /^\s*externo\s*$/i }] }),
        Missao.countDocuments({ ...baseMissaoQuery, $or: [{ servico: /^\s*remoto\s*$/i }, { categoria: /^\s*remoto\s*$/i }] }),
        Missao.countDocuments({ ...baseMissaoQuery, servico: /^\s*pendente\s*$/i }),
        Servico.countDocuments(serviceQuery),
        Servico.countDocuments({ ...serviceQuery, Serviço: /^\s*PRONTO\s*$/i }),
      ]),

      // Ranking Unidades (Auditado sobre TODOS os registros do período)
      Missao.aggregate([
        { $match: baseMissaoQuery },
        { $group: { _id: "$unidade", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      // Ranking Serviços/Demandas
      Missao.aggregate([
        { $match: baseMissaoQuery },
        { $group: { _id: "$servico", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      // Ranking Defeitos/Reclamações
      Missao.aggregate([
        { $match: baseMissaoQuery },
        { $group: { _id: "$def_recla", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      missoes: {
        total: counts[0],
        interno: counts[1],
        externo: counts[2],
        remoto: counts[3],
        pendente: counts[4],
        rankings: {
          unidades: topUnidades.map(u => [u._id || "NÃO INFORMADO", u.count]),
          servicos: topServicos.map(s => [s._id || "NÃO INFORMADO", s.count]),
          defeitos: topDefeitos.map(d => [d._id || "NÃO INFORMADO", d.count])
        }
      },
      servicos: {
        total: counts[5],
        pronto: counts[6]
      }
    });
  } catch (err) {
    console.error('Erro na rota consolidada:', err);
    res.status(500).json({ error: err.message });
  }
});


// Obter a próxima OS de Missão disponível
app.get('/api/missoes/next-os', async (req, res) => {
  try {
    const last = await Missao.findOne({}, 'os').sort({ os: -1 }).lean();
    res.json({ nextOs: last ? last.os + 1 : 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar uma Missão específica pela OS (com adjacentes)
app.get('/api/missoes/:id', async (req, res) => {
  try {
    const os = parseInt(req.params.id);
    const missao = await Missao.findOne({ os: os }).lean();
    if (!missao) return res.status(404).json({ error: 'Missão não encontrada' });
    
    // Verifica se existem adjacentes para controle de UI
    const [prev, next] = await Promise.all([
      Missao.findOne({ os: { $lt: os } }, 'os').sort({ os: -1 }),
      Missao.findOne({ os: { $gt: os } }, 'os').sort({ os: 1 })
    ]);

    res.json({ 
      record: missao, 
      hasPrev: !!prev, 
      hasNext: !!next 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Navegar para o próximo ou anterior (Missões)
app.get('/api/missoes/:id/:direction', async (req, res) => {
  try {
    const os = parseInt(req.params.id);
    const { direction } = req.params;
    
    let record;
    if (direction === 'prev') {
      record = await Missao.findOne({ os: { $lt: os } }).sort({ os: -1 }).lean();
    } else {
      record = await Missao.findOne({ os: { $gt: os } }).sort({ os: 1 }).lean();
    }

    if (!record) return res.status(404).json({ error: 'Fim dos registros' });

    // Re-checar adjacentes para o novo record
    const newOs = record.os;
    const [prev, next] = await Promise.all([
      Missao.findOne({ os: { $lt: newOs } }, 'os').sort({ os: -1 }),
      Missao.findOne({ os: { $gt: newOs } }, 'os').sort({ os: 1 })
    ]);

    res.json({ record, hasPrev: !!prev, hasNext: !!next });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Criar nova Missão
app.post('/api/missoes', async (req, res) => {
  try {
    const data = req.body;
    const last = await Missao.findOne({}, 'os').sort({ os: -1 }).lean();
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
      { new: true, lean: true }
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

// ====== CRON: AUTO-PING RENDER ======
// NOTA: Só ativa se estiver REALMENTE no Render (evita pings desnecessários no Docker/PMPA)
const RENDER_URL = process.env.RENDER_EXTERNAL_URL || 'https://moderniza-ui-magico-1.onrender.com';
if (process.env.RENDER) {
  setInterval(() => {
    https.get(`${RENDER_URL}/api/status`, (res) => {
      console.log(`[Auto-Ping] OK: ${res.statusCode} para ${RENDER_URL}`);
    }).on('error', (err) => {
      console.error('[Auto-Ping] ERRO:', err.message);
    });
  }, 14 * 60 * 1000); // 14 minutos
  console.log(`⏰ Cron-job Ativado (RENDER): Ping a cada 14 min em ${RENDER_URL}`);
} else {
  console.log('⏰ Cron-job Ignorado: Ambiente Local ou Docker (Não necessita de wake-up).');
}
