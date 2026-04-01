const fs = require('fs');
const iconv = require('iconv-lite');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/teste?directConnection=true&serverSelectionTimeoutMS=5000';
const FILE_PATH = 'data/legacy/servicos.txt';

function clean(val) {
  if (!val) return '';
  return val.trim();
}

async function runUpdate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB.');
    const col = client.db().collection('servicos');

    const buffer = fs.readFileSync(FILE_PATH);
    const content = iconv.decode(buffer, 'win1252'); // Access export costuma ser win1252
    const lines = content.split('\n');
    const records = [];

    console.log('⏳ Processando arquivo...');
    for (const line of lines) {
      if (!line.includes('|')) continue;
      const fields = line.split('|').map(f => clean(f));
      
      // fields[0] é vazio (antes da primeira pipa), entao ID é fields[1]
      const id = parseInt(fields[1]);
      if (isNaN(id)) continue;

      // Colunas no arquivo servicos.txt:
      // 1: Id_cod | 2: Data_Ent | 3: Tecnico | ... | 18: Laudo_Tecnico | 19: Saida_Equip | 20: Recebedor
      // No .split('|'), os indices mudam:
      // idx 1: Id_cod
      // idx 19: Saida_Equip (Data / Hora Saída)
      // idx 22: Telefone
      
      records.push({
        Id_cod:          id,
        Data_Saida:      fields[19] || '',
        telefone:        fields[22] || '',
        Bateria:         fields[23] || '',
      });
    }

    console.log(`📋 ${records.length} registros extraídos.`);

    let updated = 0;
    for (const rec of records) {
      const result = await col.updateOne(
        { Id_cod: rec.Id_cod },
        { $set: {
          Data_Saida: rec.Data_Saida,
          telefone: rec.telefone,
          Bateria: rec.Bateria
        }}
      );
      if (result.matchedCount > 0) updated++;
    }

    console.log(`\n✅ ${updated} registros atualizados com Data de Saída.`);

    // Verificação amostral
    const sample = await col.findOne({ Id_cod: 2188 });
    console.log('\n🔍 Verificação OS 2188:');
    console.log('  Data Saída:', sample?.Data_Saida);

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.close();
  }
}

runUpdate();
