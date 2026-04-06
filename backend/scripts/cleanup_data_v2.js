const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const PLACEHOLDERS = [
  'ANÁLISE TÉCNICA', 'ANALISE TECNICA', 'ÁNALISE TÉCNICA', 'ANALISE TÉCNICA',
  'ANALISAR', 'A VERIFICAR', 'VERIFICAR', 'ANALISE', '0', '.', '...', '..', '-',
  'SERVIÇO PRONTO', 'PRONTO', 'PENDENTE', 'LAUDO', 'NÃO LIGA', 'Lentidão', 'Analisar'
];

const RANKS = ['TEN', 'SD', 'SGT', 'VC', 'ST', 'CB', 'MAJ', 'CAP', 'TC'];

async function deepCleanup() {
  try {
    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const servicos = db.collection('servicos');
    const missoes = db.collection('missoes');

    console.log('📦 Iniciando faxina geral (v2)...');
    let totalUpdated = 0;

    // 1. PROCESSAR SERVICOS
    const sDocs = await servicos.find({}).toArray();
    console.log(`📄 Analisando ${sDocs.length} registros de Equipamentos...`);
    
    for (const doc of sDocs) {
      let up = {};
      let changed = false;

      ['Defeito_Recl', 'Analise_Tecnica'].forEach(field => {
        const val = (doc[field] || '').trim();
        if (PLACEHOLDERS.some(p => p.toUpperCase() === val.toUpperCase())) {
          up[field] = "";
          changed = true;
        }
      });

      const anaVal = (doc.Analise_Tecnica || '').trim().toUpperCase();
      if (RANKS.some(r => anaVal.startsWith(r))) {
        if (!doc.Tecnico || doc.Tecnico.length < 3) {
          up.Tecnico = doc.Analise_Tecnica;
          up.Analise_Tecnica = "";
          changed = true;
        } else if (doc.Tecnico.trim().toUpperCase() !== anaVal) {
          up.Analise_Tecnica = "";
          changed = true;
        }
      }

      if (changed) {
        await servicos.updateOne({ _id: doc._id }, { $set: up });
        totalUpdated++;
      }
    }

    // 2. PROCESSAR MISSOES
    const mDocs = await missoes.find({}).toArray();
    console.log(`📄 Analisando ${mDocs.length} registros de Missões...`);
    
    for (const doc of mDocs) {
      let up = {};
      let changed = false;

      ['def_recla', 'analise'].forEach(field => {
        const val = (doc[field] || '').trim();
        if (PLACEHOLDERS.some(p => p.toUpperCase() === val.toUpperCase())) {
          up[field] = "";
          changed = true;
        }
      });

      if (changed) {
        await missoes.updateOne({ _id: doc._id }, { $set: up });
        totalUpdated++;
      }
    }

    console.log(`✅ Faxina v2 concluída! Total de ${totalUpdated} campos organizados.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro crítico na faxina:', err);
    process.exit(1);
  }
}

deepCleanup();
