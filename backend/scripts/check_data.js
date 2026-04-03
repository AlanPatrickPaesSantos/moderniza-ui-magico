const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Servico = require('../models/Servico');
const Missao = require('../models/Missao');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const servico = await Servico.findOne({ Data_Ent: { $exists: true } }).sort({ _id: -1 });
    if (servico) {
      console.log('--- Servico Sample ---');
      console.log('Data_Ent:', servico.Data_Ent);
      console.log('Type of Data_Ent:', typeof servico.Data_Ent);
      console.log('Is Date:', servico.Data_Ent instanceof Date);
    }

    const missao = await Missao.findOne({ data: { $exists: true } }).sort({ _id: -1 });
    if (missao) {
      console.log('--- Missao Sample ---');
      console.log('data:', missao.data);
      console.log('Type of data:', typeof missao.data);
      console.log('Is Date:', missao.data instanceof Date);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
