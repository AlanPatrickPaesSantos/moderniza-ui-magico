const fs = require('fs');
const iconv = require('iconv-lite');
const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/teste?directConnection=true&serverSelectionTimeoutMS=5000';
const FILE_PATH = 'C:\\Users\\Alan\\Downloads\\Btl_Principal.txt';
const TARGET_ID = 2691;

async function diagnose() {
  // 1. Parse the file and find the record
  const buffer = fs.readFileSync(FILE_PATH);
  const content = iconv.decode(buffer, 'win1252');
  const lines = content.split('\n');

  const records = [];
  let buf = [];

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('---') || line.length === 0) {
      if (buf.length > 0) processBuffer(buf, records);
      buf = [];
      continue;
    }
    const parts = line.split('|').map(p => p.trim());
    const first = parts.filter(p => p.length > 0)[0];
    if (first && /^\d+$/.test(first) && parseInt(first) > 100 && buf.length > 0) {
      processBuffer(buf, records);
      buf = [line];
    } else {
      buf.push(line);
    }
  }
  if (buf.length > 0) processBuffer(buf, records);

  const fileRecord = records.find(r => r.Id_cod === TARGET_ID);
  
  console.log('=== ARQUIVO NOVO ===');
  if (fileRecord) {
    console.log('Encontrado! Campos de texto:');
    console.log('  Defeito_Recl:   ', fileRecord.Defeito_Recl);
    console.log('  Analise_Tecnica:', fileRecord.Analise_Tecnica);
    console.log('  Serviço:        ', fileRecord.Serviço);
  } else {
    const ids = records.map(r => r.Id_cod);
    const maxId = Math.max(...ids);
    const minId = Math.min(...ids);
    console.log(`❌ ID ${TARGET_ID} NÃO encontrado no arquivo.`);
    console.log(`   Arquivo contém IDs de ${minId} a ${maxId} (${records.length} registros)`);
    // Mostra os 5 IDs mais próximos
    const nearby = ids.filter(id => Math.abs(id - TARGET_ID) < 20).sort((a,b)=>a-b);
    console.log('   IDs próximos:', nearby);
  }

  // 2. Check MongoDB
  console.log('\n=== BANCO DE DADOS ===');
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const r = await client.db().collection('servicos').findOne({ Id_cod: TARGET_ID });
    if (r) {
      console.log('Encontrado no MongoDB:');
      console.log('  Defeito_Recl:   ', r.Defeito_Recl);
      console.log('  Analise_Tecnica:', r.Analise_Tecnica);
      console.log('  Serviço:        ', r.Serviço);
      console.log('  T_EquipSuporte: ', r.T_EquipSuporte);
    } else {
      console.log(`❌ ID ${TARGET_ID} NÃO existe no MongoDB.`);
    }
  } finally {
    await client.close();
  }
}

function processBuffer(lines, records) {
  const raw = lines.join(' ');
  const parts = raw.split('|').map(p => p.trim()).filter((p, i, a) => {
    if (i === 0 && p === '') return false;
    if (i === a.length - 1 && p === '') return false;
    return true;
  });
  if (parts.length >= 1) {
    const id = parseInt(parts[0]);
    if (!isNaN(id)) {
      records.push({
        Id_cod: id,
        Defeito_Recl:    parts[11] || '',
        Analise_Tecnica: parts[12] || '',
        Serviço:         parts[13] || '',
        T_EquipSuporte:  parts[5]  || '',
      });
    }
  }
}

diagnose();
