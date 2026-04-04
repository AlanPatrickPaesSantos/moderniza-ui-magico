const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Servico = require('../models/Servico');
const Missao = require('../models/Missao');

async function verify() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    const now = new Date();
    const yearStart = new Date(now.getFullYear(), 0, 1);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    console.log(`Checking for year start: ${yearStart.toISOString()}`);
    console.log(`Checking for month: ${monthStart.toISOString()} to ${monthEnd.toISOString()}`);

    // Widget 1: Manutenção (PENDENTE desde o início do ano)
    const maintenanceCount = await Servico.countDocuments({
      Data_Ent: { $gte: yearStart },
      Serviço: { $regex: /^\s*PENDENTE\s*$/i }
    });
    console.log(`Widget 1 (Manutenção Pendente): ${maintenanceCount}`);

    // Widget 2: Missões (Tudo realizado no mês atual)
    const missionsCount = await Missao.countDocuments({
      data: { $gte: monthStart, $lte: monthEnd }
    });
    console.log(`Widget 2 (Missões no Mês): ${missionsCount}`);

    // Se as contagens forem 0, vamos ver se existem registros SEM filtro de data
    if (maintenanceCount === 0) {
      const globalPend = await Servico.countDocuments({ Serviço: { $regex: /^\s*PENDENTE\s*$/i } });
      console.log(`Total Pendentes no banco (sem filtro de data): ${globalPend}`);
      if (globalPend > 0) {
        const sample = await Servico.findOne({ Serviço: { $regex: /^\s*PENDENTE\s*$/i } }).sort({ Data_Ent: -1 });
        console.log(`Amostra de data de pendência: ${sample.Data_Ent}`);
      }
    }

    if (missionsCount === 0) {
      const globalMiss = await Missao.countDocuments({});
      console.log(`Total Missões no banco (sem filtro de data): ${globalMiss}`);
      if (globalMiss > 0) {
        const sample = await Missao.findOne({}).sort({ data: -1 });
        console.log(`Amostra de data de missão: ${sample.data}`);
      }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
verify();
