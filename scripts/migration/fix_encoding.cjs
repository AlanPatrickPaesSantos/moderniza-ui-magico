const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/teste?directConnection=true&serverSelectionTimeoutMS=5000';

async function findAndFixAll() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const col = client.db().collection('unidades');

    // Busca TODOS os documentos e filtra em JS (mais robusto)
    const all = await col.find({}).toArray();
    
    const bad = all.filter(d => d.UNIDADE && d.UNIDADE.includes('\u00c2'));
    console.log(`🔍 Ainda com problema: ${bad.length}`);
    bad.forEach(d => console.log('  -', JSON.stringify(d.UNIDADE)));

    // Corrige com regex mais agressivo — remove qualquer Â seguido ou não de º
    let count = 0;
    for (const doc of bad) {
      // Substitui Â seguido de qualquer caractere pelo caractere correto
      const fixed = doc.UNIDADE
        .replace(/\u00c2\u00ba/g, 'º')   // Âº → º
        .replace(/\u00c2\u00b0/g, '°')   // Â° → °
        .replace(/\u00c2\u00a0/g, ' ')   // espaço não-quebrável
        .replace(/\u00c2/g, '')          // remove qualquer Â restante
        .trim();

      await col.updateOne({ _id: doc._id }, { $set: { UNIDADE: fixed } });
      console.log(`  ✅ "${doc.UNIDADE}" → "${fixed}"`);
      count++;
    }

    console.log(`\n✅ ${count} corrigidos. Verificando resultado final...`);
    
    // Mostra todos para conferência
    const final = await col.find({}).sort({ UNIDADE: 1 }).toArray();
    const stillBad = final.filter(d => d.UNIDADE && d.UNIDADE.includes('\u00c2'));
    console.log(`Restam com Â: ${stillBad.length}`);

  } catch (err) {
    console.error('❌', err.message);
  } finally {
    await client.close();
  }
}

findAndFixAll();
