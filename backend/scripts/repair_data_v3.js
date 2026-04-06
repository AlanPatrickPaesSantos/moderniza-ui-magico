const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function repairV3() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI não encontrada.');
      process.exit(1);
    }

    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const servicos = db.collection('servicos');

    console.log('🛠️ Iniciando Reparo Profundo (v3)...');
    
    // Pegar todos os registros de equipamentos
    const all = await servicos.find({}).toArray();
    console.log(`📄 Analisando ${all.length} registros...`);
    
    let totalUpdated = 0;

    for (const doc of all) {
      try {
        let up = {};
        let changed = false;

        const def = String(doc.Defeito_Recl || '').trim();
        const serial = String(doc.Nº_Serie || '').trim();
        const pae = String(doc.Nº_PAE || '').trim();

        // 1. Serial Number no lugar do Defeito (8 a 15 dígitos numéricos)
        if (def.match(/^[0-9]{8,15}$/)) {
          if (!serial || serial === "" || serial === "." || serial === "-") {
            up.Nº_Serie = def;
            up.Defeito_Recl = "";
            changed = true;
          } else if (serial === def) {
            up.Defeito_Recl = "";
            changed = true;
          }
        }

        // 2. Protocolo PAE no lugar do Defeito (YYYY/NNNNNN)
        if (def.match(/^\d{4}\/\d+$/)) {
          if (!pae || pae === "" || pae === "." || pae === "-") {
            up.Nº_PAE = def;
            up.Defeito_Recl = "";
            changed = true;
          } else if (pae === def) {
            up.Defeito_Recl = "";
            changed = true;
          }
        }

        // 3. Limpeza de ruído
        ['Defeito_Recl', 'Analise_Tecnica'].forEach(field => {
          const val = String(doc[field] || '').trim();
          if (val === "." || val === "-" || val === "0" || val === ".." || val === "...") {
            if (!up[field] && up[field] !== "") {
               up[field] = "";
               changed = true;
            }
          }
        });

        if (changed) {
          await servicos.updateOne({ _id: doc._id }, { $set: up });
          totalUpdated++;
          if (totalUpdated % 50 === 0) console.log(`  Progres: ${totalUpdated} corrigidos...`);
        }
      } catch (innerErr) {
        console.error(`⚠️ Erro na OS ${doc.Id_cod}:`, innerErr.message);
      }
    }

    console.log(`\n✅ Reparo v3 concluído! ${totalUpdated} registros reorganizados.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro crítico no reparo v3:', err);
    process.exit(1);
  }
}

repairV3();
