const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MissaoSchema = new mongoose.Schema({
  data: Date,
  servico: String,
  unidade: String
}, { collection: 'missoes' });

const ServicoSchema = new mongoose.Schema({
  Data_Ent: Date,
  Serviço: String
}, { collection: 'servicos' });

const Missao = mongoose.model('ExploreMissao', MissaoSchema);
const Servico = mongoose.model('ExploreServico', ServicoSchema);

async function explore() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');

  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  console.log(`Período: ${startMonth.toISOString()} até ${endMonth.toISOString()}`);

  const counts = await Promise.all([
    Missao.countDocuments({ data: { $gte: startMonth, $lte: endMonth } }),
    Servico.countDocuments({ Serviço: /^\s*PENDENTE\s*$/i }),
    Servico.countDocuments({ Serviço: /^\s*PRONTO\s*$/i }),
    Missao.countDocuments({}), // Total histórico missões
    Servico.countDocuments({}) // Total histórico serviços
  ]);

  console.log('--- ESTATÍSTICAS REAIS ---');
  console.log('Missões neste mês (field: data):', counts[0]);
  console.log('Serviços PENDENTES (Todos):', counts[1]);
  console.log('Serviços PRONTOS (Todos):', counts[2]);
  console.log('Total Missões na DB:', counts[3]);
  console.log('Total Serviços na DB:', counts[4]);

  const sampleMission = await Missao.findOne({ data: { $exists: true } }).sort({ data: -1 }).lean();
  console.log('Exemplo Missão Recente:', JSON.stringify(sampleMission, null, 2));

  process.exit();
}

explore().catch(err => { console.error(err); process.exit(1); });
