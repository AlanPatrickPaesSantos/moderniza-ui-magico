const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function auditBadFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Servico = mongoose.connection.db.collection('servicos');
    
    // Find records where Defeito_Recl or Analise_Tecnica contain "PRONTO", "PENDENTE", or look like names
    const badStatus = await Servico.find({ 
      $or: [
        { Defeito_Recl: { $in: ['PRONTO', 'PENDENTE', 'LAUDO', 'Manutenção'] } },
        { Analise_Tecnica: { $in: ['PRONTO', 'PENDENTE', 'LAUDO'] } }
      ]
    }).toArray();

    console.log(`Encontrados ${badStatus.length} registros com campos trocados.`);
    badStatus.slice(0, 10).forEach(r => {
      console.log(`OS ${r.Id_cod}: Defeito="${r.Defeito_Recl}", Analise="${r.Analise_Tecnica}", Serviço="${r.Serviço}"`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

auditBadFields();
