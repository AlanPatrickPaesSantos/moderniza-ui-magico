const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function aggressiveAudit() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Servico = mongoose.connection.db.collection('servicos');
    
    // Status keywords to look for
    const keywords = ['PRONTO', 'PENDENTE', 'LAUDO', 'MANUTENÇÃO', 'ENTREGA', 'CONCLUÍDO', 'SAÍDA'];
    
    const suspectRegex = new RegExp(keywords.join('|'), 'i');

    const suspects = await Servico.find({ 
      $or: [
        { Defeito_Recl: suspectRegex },
        { Analise_Tecnica: suspectRegex }
      ]
    }).toArray();

    console.log(`Encontrados ${suspects.length} registros suspeitos.`);
    
    // Mostramos os que NÃO são óbvios (os que escaparam da v1)
    suspects.slice(0, 20).forEach(r => {
      console.log(`OS ${r.Id_cod}: Defeito="${r.Defeito_Recl}", Analise="${r.Analise_Tecnica}", Serviço="${r.Serviço}"`);
    });

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

aggressiveAudit();
