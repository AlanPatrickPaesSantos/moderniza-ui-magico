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
  // Tenta extrair apenas a parte da data DD/MM/AAAA
  const datePart = s.trim().split(' ')[0];
  const p = datePart.split('/');
  if (p.length === 3) {
    let [d, m, y] = p;
    // Se o ano tiver 2 digitos, assume 20xx
    if (y.length === 2) y = '20' + y;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // Se ja parecer ISO YYYY-MM-DD, retorna original
  if (/^\d{4}-\d{2}-\d{2}$/.test(s.trim())) return s.trim();
  return '';
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

    console.log('⏳ Analisando arquivo para sincronização total de datas...');
    for (const line of lines) {
      if (!line.includes('|')) continue;
      const fields = line.split('|').map(f => clean(f));
      
      const id = parseInt(fields[1]);
      if (isNaN(id)) continue;

      // Mapeamento correto baseado na análise da OS 13:
      // 1: Id_cod
      // 2: Data_Ent
      // 16: Data_Envio
      // 17: Data_Retorno
      // 19: Saida_Equip
      
      records.push({
        Id_cod:       id,
        Data_Ent:     parseDateISO(fields[2]),
        Data_Envio:   parseDateISO(fields[16]),
        Data_Retorno: parseDateISO(fields[17]),
        Data_Saida:   parseDateISO(fields[19]),
        telefone:     fields[22] || '',
        Bateria:      fields[23] || '',
      });
    }

    console.log(`📋 ${records.length} registros processados para atualização.`);

    let updated = 0;
    for (const rec of records) {
      const result = await col.updateOne(
        { Id_cod: rec.Id_cod },
        { $set: {
          Data_Ent:     rec.Data_Ent || undefined, // Mantem original se vazio no arquivo
          Data_Envio:   rec.Data_Envio,
          Data_Retorno: rec.Data_Retorno,
          Data_Saida:   rec.Data_Saida,
          telefone:     rec.telefone,
          Bateria:      rec.Bateria
        }}
      );
      if (result.matchedCount > 0) updated++;
    }

    console.log(`\n✅ ${updated} registros sincronizados com formato ISO YYYY-MM-DD.`);

    // Verificação de um registro conhecido (OS 13)
    const sample = await col.findOne({ Id_cod: 13 });
    console.log('\n🔍 Verificação OS 13:');
    console.log('  Data Saída (ISO):', sample?.Data_Saida);
    console.log('  Data Retorno (ISO):', sample?.Data_Retorno);

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.close();
  }
}

runUpdate();
