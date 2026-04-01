const fs = require('fs');
const path = require('path');
const iconv = require('iconv-lite');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const uri = process.env.MONGODB_URI + "?directConnection=true&serverSelectionTimeoutMS=5000";

async function migrateMissions() {
  const client = new MongoClient(uri);

  try {
    console.log('🔗 Conectando para RE-IMPORTAÇÃO FINAL (Mapeamento Robusto)...');
    await client.connect();
    const db = client.db();
    const missoesCol = db.collection('missoes');

    console.log('🧹 Limpando dados para correção definitiva...');
    await missoesCol.deleteMany({});

    const filePath = path.join(__dirname, '../../data/legacy/missoes_legacy.txt');
    const buffer = fs.readFileSync(filePath);
    const content = iconv.decode(buffer, 'win1252');
    const lines = content.split('\n');

    let records = [];
    let recordBuffer = [];

    for (let line of lines) {
      line = line.trim();
      if (line.startsWith('---') || line.length === 0) {
        if (recordBuffer.length > 0) processMissionBuffer(recordBuffer, records);
        recordBuffer = [];
        continue;
      }

      const parts = line.split('|').map(p => p.trim());
      const first = parts.filter(p => p.length > 0)[0];
      if (first && /^\d+$/.test(first) && recordBuffer.length > 0) {
        processMissionBuffer(recordBuffer, records);
        recordBuffer = [line];
      } else {
        recordBuffer.push(line);
      }
    }
    if (recordBuffer.length > 0) processMissionBuffer(recordBuffer, records);

    if (records.length > 0) {
        console.log(`📡 Injetando ${records.length} missões com Mapeamento Inteligente...`);
        await missoesCol.insertMany(records);
        console.log('✅ SUCESSO: Dados unificados e campos corrigidos!');
    }

  } catch (err) {
    console.error('❌ Erro:', err.message);
  } finally {
    await client.close();
    process.exit(0);
  }
}

function convertDate(dateStr) {
  if (!dateStr || !dateStr.includes('/')) return "";
  const parts = dateStr.split('/');
  return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : dateStr;
}

function processMissionBuffer(lines, records) {
  const raw = lines.join(' ');
  const parts = raw.split('|').map(p => p.trim()).filter((p, i, a) => {
      if (i === 0 && p === "") return false;
      if (i === a.length - 1 && p === "") return false;
      return true;
  });

  if (parts.length >= 10) {
    const os = parseInt(parts[0]);
    if (!isNaN(os)) {
      // No legado, a descrição do serviço pode estar tanto na "Análise" (p[6]) quanto na "Solução" (p[7])
      // Vamos pegar o conteúdo de ambos para não perder nada.
      const descritivoCompleto = [parts[6], parts[7]].filter(x => x).join(' - ');

      records.push({
        os: os,
        data: convertDate(parts[1]),
        secao: "SUPORTE",
        tecnicos: parts[3] || "",
        unidade: parts[4] || "",
        def_recla: parts[5] || "",
        analise: parts[6] || "",
        solucao: descritivoCompleto || "", // << FIX: Unificando o que foi feito na Solução
        n_pae: "",                         // << ABSOLUTAMENTE Vazio
        solicitante: parts[8] || "",
        horario: parts[9] || "",
        observacao: parts[10] || "",
        servico: (parts[11] || "interno").toLowerCase()
      });
    }
  }
}

migrateMissions();
