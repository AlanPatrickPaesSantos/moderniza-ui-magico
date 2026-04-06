const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function auditBadFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const keywords = ['PRONTO', 'PENDENTE', 'LAUDO', 'MANUTENÇÃO', 'ENTREGA', 'CONCLUÍDO', 'SAÍDA', 'ENTREGUE', 'INTERNO', 'EXTERNO', 'REMOTO'];
    const suspectRegex = new RegExp(`^\\s*(${keywords.join('|')})\\s*[\\.\\!]*$`, 'i');

    console.log('--- BUSCANDO REGISTROS EM SERVICOS ---');
    const sRecords = await db.collection('servicos').find({
      $or: [
        { Defeito_Recl: suspectRegex },
        { Analise_Tecnica: suspectRegex }
      ]
    }).toArray();
    console.log(`Encontrados ${sRecords.length} em SERVICOS.`);

    console.log('--- BUSCANDO REGISTROS EM MISSOES ---');
    const mRecords = await db.collection('missoes').find({
      $or: [
        { def_recla: suspectRegex },
        { analise: suspectRegex }
      ]
    }).toArray();
    console.log(`Encontrados ${mRecords.length} em MISSOES.`);

    console.log('\n--- AMOSTRAS (SERVICOS) ---');
    sRecords.slice(0, 10).forEach(r => {
      console.log(`OS ${r.Id_cod}: Defeito="${r.Defeito_Recl}", Analise="${r.Analise_Tecnica}", Status="${r.Serviço}"`);
    });

    console.log('\n--- AMOSTRAS (MISSOES) ---');
    mRecords.slice(0, 10).forEach(r => {
      console.log(`OS ${r.os}: Defeito="${r.def_recla}", Analise="${r.analise}", Status="${r.servico}"`);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

auditBadFields();
