const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/teste';
const idsToRemove = [2693, 2694, 2695, 2696, 2697];

async function runCleanup() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB.');
    const col = client.db().collection('servicos');

    const result = await col.deleteMany({ Id_cod: { $in: idsToRemove } });
    console.log(`🧹 ${result.deletedCount} registros de teste removidos com sucesso.`);

    // Verifica a última OS agora
    const last = await col.findOne({}, 'Id_cod').sort({ Id_cod: -1 });
    console.log(`📌 Última OS legítima agora é a: ${last?.Id_cod}`);
    console.log(`🚀 Próxima OS gerada será a: ${last ? last.Id_cod + 1 : 1}`);

  } catch (err) {
    console.error('❌ Erro na limpeza:', err.message);
  } finally {
    await client.close();
  }
}

runCleanup();
