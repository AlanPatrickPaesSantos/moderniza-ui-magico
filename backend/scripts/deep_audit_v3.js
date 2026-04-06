const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function deepAudit() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    console.log('--- BUSCANDO PADRÕES COMPLEXOS EM SERVICOS ---');
    const sDocs = await db.collection('servicos').find({}).toArray();
    let suspectCount = 0;

    sDocs.forEach(doc => {
      let issues = [];
      const def = (doc.Defeito_Recl || '').trim();
      const ana = (doc.Analise_Tecnica || '').trim();
      const serial = (doc.Nº_Serie || '').trim();
      const pae = (doc.Nº_PAE || '').trim();

      // Padrão 1: Protocolo (PAE) no Defeito
      if (def.match(/^\d{4}\/\d+$/) && (!pae || pae === "")) {
        issues.push(`Protocolo [${def}] no campo de Defeito.`);
      }

      // Padrão 2: Serial Number no Defeito
      if (def.length > 5 && def.match(/^[A-Z0-9]+$/) && def !== "PRONTO" && def !== "PENDENTE") {
        if (!serial || serial === "") {
            issues.push(`Serial [${def}] no campo de Defeito.`);
        }
      }

      // Padrão 3: Campos muuuito curtos ou vazios (suspeitos de perda de dados)
      if (def === "0" || def === "." || def === "-") {
        issues.push(`Campo de defeito com lixo: "${def}"`);
      }

      if (issues.length > 0) {
        suspectCount++;
        if (suspectCount <= 15) {
          console.log(`OS ${doc.Id_cod}: ${issues.join(' | ')}`);
        }
      }
    });

    console.log(`\nTotal de registros com padrões complexos: ${suspectCount}`);
    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

deepAudit();
