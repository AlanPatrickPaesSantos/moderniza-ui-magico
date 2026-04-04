const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Servico = require('../models/Servico');
const Missao = require('../models/Missao');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // 1. Check ALL records in 2026
    const serv2026 = await Servico.countDocuments({ Data_Ent: { $gte: new Date('2026-01-01T00:00:00Z') } });
    const miss2026 = await Missao.countDocuments({ data: { $gte: new Date('2026-01-01T00:00:00Z') } });
    
    // 2. Check for ANY records with string dates (to see if normalization missed something)
    const servStr = await Servico.countDocuments({ Data_Ent: { $type: 'string' } });
    const missStr = await Missao.countDocuments({ data: { $type: 'string' } });

    // 3. Check for records specifically in April 2026
    const servApril = await Servico.countDocuments({ Data_Ent: { $gte: startOfCurrentMonth } });
    const missApril = await Missao.countDocuments({ data: { $gte: startOfCurrentMonth } });

    console.log('--- Summary ---');
    console.log('Total Servicos in 2026 (Date object):', serv2026);
    console.log('Total Missoes in 2026 (Date object):', miss2026);
    console.log('Servicos with String Data_Ent:', servStr);
    console.log('Missoes with String data:', missStr);
    console.log('Servicos in April 2026:', servApril);
    console.log('Missoes in April 2026:', missApril);

    if (servStr > 0) {
        const sample = await Servico.findOne({ Data_Ent: { $type: 'string' } });
        console.log('Sample Servico String Date:', sample.Data_Ent);
    }
    if (missStr > 0) {
        const sample = await Missao.findOne({ data: { $type: 'string' } });
        console.log('Sample Missao String Date:', sample.data);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
