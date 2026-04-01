const fs = require('fs');
const iconv = require('iconv-lite');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/teste?directConnection=true&serverSelectionTimeoutMS=5000';
const FILE_PATH = 'C:\\Users\\Alan\\Downloads\\Btl_Principal.txt';
const TARGET_ID = 2188;

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

async function restoreRecord() {
  // Parse o arquivo para encontrar o registro original
  const buffer = fs.readFileSync(FILE_PATH);
  const content = iconv.decode(buffer, 'win1252');
  const lines = content.split('\n');

  let original = null;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const fields = trimmed.split('\t');
    const id = parseInt(fields[0]);
    if (id === TARGET_ID) {
      original = {
        Id_cod:          id,
        Data_Ent:        parseDate(clean(fields[1])),
        Tecnico:         clean(fields[2]),
        T_EquipSuporte:  clean(fields[5]),
        Solicitante:     clean(fields[6]),
        Nº_PAE:          clean(fields[8]),
        RP:              clean(fields[9]),
        Nº_Serie:        clean(fields[10]),
        Defeito_Recl:    clean(fields[11]),
        Analise_Tecnica: clean(fields[12]),
        Serviço:         clean(fields[13]),
        Laudo_Tecnico:   clean(fields[17]),
        Data_Envio:      parseDate(clean(fields[18])),
      };
      break;
    }
  }

  if (!original) {
    console.log(`❌ OS ${TARGET_ID} não encontrada no arquivo.`);
    return;
  }

  console.log('📋 Dados originais encontrados no arquivo:');
  console.log('  Técnico:   ', original.Tecnico);
  console.log('  Solicitante:', original.Solicitante);
  console.log('  Defeito:   ', original.Defeito_Recl);
  console.log('  Análise:   ', original.Analise_Tecnica);
  console.log('  Serviço:   ', original.Serviço);

  // Restaura no MongoDB
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const col = client.db().collection('servicos');

    const result = await col.findOneAndUpdate(
      { Id_cod: TARGET_ID },
      { $set: {
        Tecnico:         original.Tecnico,
        Solicitante:     original.Solicitante,
        Defeito_Recl:    original.Defeito_Recl,
        Analise_Tecnica: original.Analise_Tecnica,
        Serviço:         original.Serviço,
        Laudo_Tecnico:   original.Laudo_Tecnico,
        Nº_PAE:          original.Nº_PAE,
        RP:              original.RP,
        Nº_Serie:        original.Nº_Serie,
        Data_Ent:        original.Data_Ent,
      }},
      { new: true }
    );

    console.log(`\n✅ OS ${TARGET_ID} restaurada com sucesso!`);
    console.log('  Técnico agora:', result?.Tecnico);
  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.close();
  }
}

restoreRecord();
