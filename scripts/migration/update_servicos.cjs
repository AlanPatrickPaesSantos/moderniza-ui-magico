const fs = require('fs');
const iconv = require('iconv-lite');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/teste?directConnection=true&serverSelectionTimeoutMS=5000';
const FILE_PATH = 'C:\\Users\\Alan\\Downloads\\Btl_Principal.txt';

function clean(val) {
  if (!val) return '';
  return val.trim().replace(/^"(.*)"$/s, '$1').trim();
}

function parseDate(s) {
  if (!s || s.trim() === '') return null;
  const datePart = s.trim().split(' ')[0];
  const p = datePart.split('/');
  if (p.length === 3) {
    const [d, m, y] = p;
    return new Date(`${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`);
  }
  return null;
}

async function runUpdate() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB.');
    const col = client.db().collection('servicos');

    const buffer = fs.readFileSync(FILE_PATH);
    const content = iconv.decode(buffer, 'win1252');
    const lines = content.split('\n');
    const records = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const fields = trimmed.split('\t');
      const id = parseInt(fields[0]);
      if (isNaN(id)) continue;

      records.push({
        Id_cod:          id,
        Defeito_Recl:    clean(fields[11]),
        Analise_Tecnica: clean(fields[12]),
        Serviço:         clean(fields[13]),
        Laudo_Tecnico:   clean(fields[17]),
        Nº_Serie:        clean(fields[10]),
        RP:              clean(fields[9]),
        Nº_PAE:          clean(fields[8]),
        Data_Ent:        parseDate(clean(fields[1])),
      });
    }

    console.log(`📋 ${records.length} registros lidos do arquivo.`);
    if (records.length === 0) {
      console.log('⚠️  Nenhum registro encontrado.');
      return;
    }

    console.log('\n📌 Amostra do 1º registro:');
    console.log('  ID:', records[0].Id_cod);
    console.log('  Defeito:', records[0].Defeito_Recl?.substring(0, 100));
    console.log('  Análise:', records[0].Analise_Tecnica?.substring(0, 100));
    console.log('  Serviço:', records[0].Serviço);

    let updated = 0, notFound = 0;
    for (const rec of records) {
      const result = await col.updateOne(
        { Id_cod: rec.Id_cod },
        { $set: {
          Defeito_Recl:    rec.Defeito_Recl,
          Analise_Tecnica: rec.Analise_Tecnica,
          Serviço:         rec.Serviço,
          Laudo_Tecnico:   rec.Laudo_Tecnico,
          Nº_Serie:        rec.Nº_Serie,
          RP:              rec.RP,
          Nº_PAE:          rec.Nº_PAE,
          Data_Ent:        rec.Data_Ent,
        }}
      );
      if (result.matchedCount > 0) updated++;
      else {
        notFound++;
        if (notFound <= 5) console.log(`  ⚠️  ID ${rec.Id_cod} não encontrado.`);
      }
    }

    console.log(`\n✅ ${updated} registros atualizados.`);
    if (notFound > 0) console.log(`⚠️  ${notFound} IDs não encontrados no banco.`);

    // Verifica o ID 2691
    const check = await col.findOne({ Id_cod: 2691 });
    if (check) {
      console.log('\n🔍 Verificação ID 2691:');
      console.log('  Defeito:', check.Defeito_Recl);
      console.log('  Análise:', check.Analise_Tecnica);
      console.log('  Serviço:', check.Serviço);
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.close();
  }
}

runUpdate();
