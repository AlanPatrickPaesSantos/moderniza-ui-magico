const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const uri = process.env.MONGODB_URI + "?directConnection=true&serverSelectionTimeoutMS=5000";

async function executeMigration() {
  const client = new MongoClient(uri);

  try {
    console.log('🔗 Conectando via Driver Nativo em:', uri);
    await client.connect();
    console.log('✅ Conectado com sucesso!');

    const db = client.db();
    const unidadesCol = db.collection('unidades');
    const servicosCol = db.collection('servicos');

    // Helper para ler com encoding correto
    const readEncodedFile = (filePath) => {
      const buffer = fs.readFileSync(filePath);
      return iconv.decode(buffer, 'win1252');
    };

    // 1. Unidades
    const unidadesPath = path.join(__dirname, '../../data/legacy/unidades.txt');
    if (fs.existsSync(unidadesPath)) {
      const uContent = readEncodedFile(unidadesPath);
      const uLines = uContent.split('\n');
      const units = uLines
        .filter(l => l.includes('|') && !l.includes('---'))
        .map(l => {
          const p = l.split('|').map(x => x.trim()).filter(x => x.length > 0);
          return p.length >= 2 && !isNaN(p[0]) ? { ID_UNID_SEÇÃO: parseInt(p[0]), UNIDADE: p[1] } : null;
        })
        .filter(x => x !== null);

      if (units.length > 0) {
        await unidadesCol.deleteMany({});
        await unidadesCol.insertMany(units);
        console.log(`✅ ${units.length} Unidades importadas.`);
      }
    }

    // 2. Serviços
    const servicosPath = path.join(__dirname, '../../data/legacy/servicos.txt');
    if (fs.existsSync(servicosPath)) {
      console.log('⏳ Lendo Serviços (Btl_Principal.txt)...');
      const sContent = readEncodedFile(servicosPath);
      const sLines = sContent.split('\n');
      
      let records = [];
      let buffer = [];

      for (let line of sLines) {
        line = line.trim();
        if (line.startsWith('---') || line.length === 0) {
          if (buffer.length > 0) processBuffer(buffer, records);
          buffer = [];
          continue;
        }
        
        // Verifica se é o início de um registro (Número ID no primeiro campo)
        const parts = line.split('|').map(p => p.trim());
        const first = parts.filter(p => p.length > 0)[0];
        if (first && /^\d+$/.test(first) && buffer.length > 0) {
            processBuffer(buffer, records);
            buffer = [line];
        } else {
            buffer.push(line);
        }
      }
      if (buffer.length > 0) processBuffer(buffer, records);

      if (records.length > 0) {
        await servicosCol.deleteMany({});
        const batchSize = 1000;
        for (let i = 0; i < records.length; i += batchSize) {
          await servicosCol.insertMany(records.slice(i, i + batchSize));
          console.log(`📡 Inserindo: ${i + Math.min(batchSize, records.length - i)}/${records.length}...`);
        }
        console.log('✅ Todos os serviços foram migrados!');
      }
    }

  } catch (err) {
    console.error('❌ Erro Fatal:', err.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

function processBuffer(lines, records) {
  const raw = lines.join(' ');
  const parts = raw.split('|').map(p => p.trim()).filter((p, i, a) => {
      if (i === 0 && p === "") return false;
      if (i === a.length - 1 && p === "") return false;
      return true;
  });

  if (parts.length >= 1) {
    const id = parseInt(parts[0]);
    if (!isNaN(id)) {
      records.push({
        Id_cod: id,
        Data_Ent: parseDate(parts[1]),
        Tecnico: parts[2] || "",
        Seção_Ditel: parts[3] || "",
        T_EquipTelecom: parts[4] || "",
        T_EquipSuporte: parts[5] || "",
        Solicitante: parts[6] || "",
        Unidade: parts[7] || "",
        Nº_PAE: parts[8] || "",
        RP: parts[9] || "",
        Nº_Serie: parts[10] || "",
        Defeito_Recl: parts[11] || "",
        Analise_Tecnica: parts[12] || "",
        Serviço: parts[13] || "",
        Garantia: parts[14] || "",
        Data_Envio: parseDate(parts[15]),
        Data_Retorno: parseDate(parts[16]),
        Laudo_Tecnico: parts[17] || ""
      });
    }
  }
}

function parseDate(s) {
  if (!s || s.trim() === "") return null;
  const p = s.split('/');
  return p.length === 3 ? new Date(`${p[2]}-${p[1]}-${p[0]}`) : null;
}

executeMigration();
