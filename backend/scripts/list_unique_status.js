const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function listStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    console.log('--- Status em SERVICOS ---');
    const sValues = await db.collection('servicos').distinct('Serviço');
    console.log(sValues);

    console.log('\n--- Status em MISSOES ---');
    const mValues = await db.collection('missoes').distinct('servico');
    console.log(mValues);

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

listStatus();
