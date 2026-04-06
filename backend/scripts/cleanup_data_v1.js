const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function migrate() {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const Servico = mongoose.connection.db.collection('servicos');
    
    // Pegar todos os registros afetados (mesma lógica do backup)
    const affected = await Servico.find({ 
      $or: [ 
        { Defeito_Recl: { $in: ['PRONTO', 'PENDENTE', 'LAUDO', 'Manutenção'] } }, 
        { Analise_Tecnica: { $in: ['PRONTO', 'PENDENTE', 'LAUDO'] } } 
      ] 
    }).toArray();

    console.log(`🔍 Processando ${affected.length} registros...`);
    let updatedTotal = 0;

    for (const doc of affected) {
      let updateSet = {};
      let changed = false;

      const def = (doc.Defeito_Recl || '').trim().toUpperCase();
      const ana = (doc.Analise_Tecnica || '').trim().toUpperCase();
      
      const isStatus = (v) => ['PRONTO', 'PENDENTE', 'LAUDO'].includes(v);

      // Regra 1: Status no lugar do Defeito
      if (isStatus(def)) {
        updateSet.Defeito_Recl = ""; // Limpa o defeito pois era só o status
        updateSet.Serviço = def;    // Garante que o status está no campo certo
        changed = true;
      }

      // Regra 2: Status no lugar da Análise
      if (isStatus(ana)) {
        updateSet.Analise_Tecnica = ""; // Limpa a análise pois era só o status
        updateSet.Serviço = ana;       // Garante que o status está no campo certo
        changed = true;
      }

      // Regra Especial para a OS 2182 (e similares): Nome de técnico na análise
      const isTecName = (v) => v.startsWith("SUBTEN") || v.startsWith("SGT") || v.startsWith("CB") || v.startsWith("MAJ") || v.startsWith("CAP");
      if (isTecName(ana)) {
        // Se o campo Tecnico estiver vazio ou curto, movemos o nome pra lá
        if (!doc.Tecnico || doc.Tecnico.length < 5) {
          updateSet.Tecnico = doc.Analise_Tecnica;
          updateSet.Analise_Tecnica = "";
          changed = true;
        } else if (doc.Tecnico !== doc.Analise_Tecnica) {
          // Se já tem técnico mas o da análise é diferente, limpamos a análise apenas se for redundante
          updateSet.Analise_Tecnica = "";
          changed = true;
        }
      }

      if (changed) {
        await Servico.updateOne({ _id: doc._id }, { $set: updateSet });
        updatedTotal++;
      }
    }

    console.log(`✅ Migração concluída: ${updatedTotal} registros corrigidos.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro na migração:', err);
    process.exit(1);
  }
}

migrate();
