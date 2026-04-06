const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function findOS() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Check servicos
    const s = await db.collection('servicos').findOne({ Id_cod: 2182 });
    if (s) {
      console.log('--- ENCONTRADO EM SERVICOS ---');
      console.log(JSON.stringify(s, null, 2));
    }

    // Check missoes
    const m = await db.collection('missoes').findOne({ os: 2182 });
    if (m) {
      console.log('--- ENCONTRADO EM MISSOES ---');
      console.log(JSON.stringify(m, null, 2));
    }

    if (!s && !m) {
      console.log('Registro 2182 não encontrado.');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

findOS();
