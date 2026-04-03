const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Servico = require('../models/Servico');
const Missao = require('../models/Missao');

async function normalize() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    // Normalize Servicos
    console.log('Normalizing Servicos (Data_Ent)...');
    const servicos = await Servico.find({ 
      $or: [
        { Data_Ent: { $type: 'string' } },
        { Data_Saida: { $type: 'string' } }
      ]
    });
    
    console.log(`Found ${servicos.length} servicos to normalize.`);
    for (const record of servicos) {
      let updated = false;
      if (typeof record.Data_Ent === 'string' && record.Data_Ent.trim() !== '') {
        const d = new Date(record.Data_Ent);
        if (!isNaN(d.getTime())) {
          record.Data_Ent = d;
          updated = true;
        }
      }
      if (typeof record.Data_Saida === 'string' && record.Data_Saida.trim() !== '') {
        const d = new Date(record.Data_Saida);
        if (!isNaN(d.getTime())) {
          record.Data_Saida = d;
          updated = true;
        }
      }
      if (updated) {
        await record.save();
      }
    }

    // Normalize Missoes
    console.log('Normalizing Missoes (data)...');
    const missoes = await Missao.find({ data: { $type: 'string' } });
    console.log(`Found ${missoes.length} missoes to normalize.`);
    for (const record of missoes) {
      if (typeof record.data === 'string' && record.data.trim() !== '') {
        const d = new Date(record.data);
        if (!isNaN(d.getTime())) {
          record.data = d;
          await record.save();
        }
      }
    }

    console.log('Normalization complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error during normalization:', err);
    process.exit(1);
  }
}

normalize();
