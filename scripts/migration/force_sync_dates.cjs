const fs = require('fs');
const iconv = require('iconv-lite');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/teste?directConnection=true&serverSelectionTimeoutMS=5000';
const FILE_PATH = 'data/legacy/servicos.txt';

function clean(val) {
  if (!val) return '';
  return val.trim();
}

function parseDateISO(s) {
  if (!s || s.trim() === '') return '';
  const datePart = s.trim().split(' ')[0];
  const p = datePart.split('/');
  if (p.length === 3) {
    let [d, m, y] = p;
    if (y.length === 2) y = '20' + y;
    return `${y.padStart(4, '0')}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Se ja parecer ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s.trim())) return s.trim();
  return '';
}

async function runForceSync() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB.');
    const col = client.db().collection('servicos');

    const buffer = fs.readFileSync(FILE_PATH);
    const content = iconv.decode(buffer, 'win1252');
    const lines = content.split('\n');
    const records = [];

    console.log('⏳ Sincronizando e Normalizando todas as datas (Forçado)...');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.includes('|')) continue;
      
      const fields = line.split('|').map(f => clean(f));
      const id = parseInt(fields[1]);
      if (isNaN(id)) continue;

      // Pegando do arquivo v19 (Saida), v17 (Retorno), v16 (Envio), v2 (Entrada)
      // Ajuste de indices baseado na OS 13 verídica
      const ent   = parseDateISO(fields[2]);
      const envio = parseDateISO(fields[16]);
      const ret   = parseDateISO(fields[17]);
      const saida = parseDateISO(fields[19]);

      records.push({
        Id_cod:       id,
        Data_Ent:     ent,
        Data_Envio:   envio,
        Data_Retorno: ret,
        Data_Saida:   saida,
        telefone:     fields[22] || '',
      });
    }

    console.log(`📋 ${records.length} registros para processar.`);

    let updated = 0;
    for (const rec of records) {
      // Usamos updateMany ou updateOne sem updatedAt automatico se possivel, 
      // mas aqui queremos garantir a mudança.
      const result = await col.updateOne(
        { Id_cod: rec.Id_cod },
        { 
          $set: {
            Data_Ent:     rec.Data_Ent || undefined,
            Data_Envio:   rec.Data_Envio,
            Data_Retorno: rec.Data_Retorno,
            Data_Saida:   rec.Data_Saida,
            telefone:     rec.telefone
          } 
        }
      );
      if (result.matchedCount > 0) updated++;
    }

    console.log(`\n✅ ${updated} registros atualizados.`);

    // Check 2188
    const check = await col.findOne({ Id_cod: 2188 });
    console.log('\n🔍 Check Final OS 2188:');
    console.log('  Data_Ent:', check?.Data_Ent);
    console.log('  Data_Saida:', check?.Data_Saida);
    console.log('  Data_Retorno:', check?.Data_Retorno);

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.close();
  }
}

runForceSync();
