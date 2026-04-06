const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function backup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const Servico = mongoose.connection.db.collection('servicos');
    
    const badStatus = await Servico.find({ 
      $or: [ 
        { Defeito_Recl: { $in: ['PRONTO', 'PENDENTE', 'LAUDO', 'Manutenção'] } }, 
        { Analise_Tecnica: { $in: ['PRONTO', 'PENDENTE', 'LAUDO'] } } 
      ] 
    }).toArray();

    fs.writeFileSync(path.join(__dirname, 'backup_bad_records.json'), JSON.stringify(badStatus, null, 2));
    console.log(`✅ Backup de ${badStatus.length} registros salvo.`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro no backup:', err);
    process.exit(1);
  }
}

backup();
