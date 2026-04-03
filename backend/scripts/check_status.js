const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Servico = require('../models/Servico');

async function checkStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected.');

    const group = await Servico.aggregate([
      { $group: { _id: "$Serviço", count: { $sum: 1 } } }
    ]);
    console.log('--- Status Counts ---');
    console.log(JSON.stringify(group, null, 2));

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkStatus();
