const mongoose = require('mongoose');
const Missao = require('./backend/models/Missao');
const Servico = require('./backend/models/Servico');
require('dotenv').config({ path: './backend/.env' });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected');

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

  const missionsThisMonth = await Missao.countDocuments({
    data: { $gte: firstDay, $lte: lastDay }
  });

  const totalPendings = await Servico.countDocuments({
    Serviço: /^\s*PENDENTE\s*$/i
  });

  const totalProntos = await Servico.countDocuments({
    Serviço: /^\s*PRONTO\s*$/i
  });

  console.log('--- RESULTADOS ---');
  console.log('Missões este mês:', missionsThisMonth);
  console.log('Total Pendentes (Geral):', totalPendings);
  console.log('Total Prontos (Geral):', totalProntos);
  
  process.exit();
}

check();
