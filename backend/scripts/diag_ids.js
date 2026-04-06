const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Servico = require('../models/Servico');

async function diag() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('--- Diagnóstico de IDs (Servico) ---');

    const all = await Servico.find({}, 'Id_cod').lean();
    console.log('Total de registros:', all.length);

    const ids = all.map(r => r.Id_cod);
    
    // 1. Verificar nulos ou não-numéricos
    const invalid = all.filter(r => typeof r.Id_cod !== 'number' || isNaN(r.Id_cod));
    console.log('IDs inválidos/nulos:', invalid.length);
    if (invalid.length > 0) console.log('Exemplos de IDs inválidos:', invalid.slice(0, 5));

    // 2. Verificar duplicatas
    const counts = {};
    const dupes = [];
    ids.forEach(id => {
      counts[id] = (counts[id] || 0) + 1;
      if (counts[id] === 2) dupes.push(id);
    });
    console.log('IDs duplicados:', dupes.length);
    if (dupes.length > 0) console.log('Exemplos de duplicatas:', dupes.slice(0, 10));

    // 3. Verificar o próximo ID (lógica do server.js)
    const sorted = all.filter(r => typeof r.Id_cod === 'number').sort((a,b) => b.Id_cod - a.Id_cod);
    const maxId = sorted[0] ? sorted[0].Id_cod : 0;
    console.log('Maior ID numérico encontrado:', maxId);
    console.log('Próximo ID sugerido (Server Logic):', maxId + 1);

    mongoose.connection.close();
  } catch (err) {
    console.error('Erro no diagnóstico:', err);
  }
}

diag();
