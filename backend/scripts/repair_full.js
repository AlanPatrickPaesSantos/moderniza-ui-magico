const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Servico = require('../models/Servico');
const Missao = require('../models/Missao');

async function repairEquipmentFull() {
  const filePath = 'C:/Users/Alan/Downloads/Btl_Principal.txt';
  if (!fs.existsSync(filePath)) return console.log('Arquivo Btl_Principal não encontrado.');

  const content = fs.readFileSync(filePath, 'latin1');
  const rawLines = content.split('\n');
  
  let records = [];
  let currentRecord = null;

  console.log('\n>>> Analisando Btl_Principal para reconstrução total...');

  for (let line of rawLines) {
    const idMatch = line.match(/^\s*(\d+)\s+(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (idMatch) {
      if (currentRecord) records.push(currentRecord);
      currentRecord = { id: parseInt(idMatch[1]), text: line };
    } else if (currentRecord && line.trim()) {
      currentRecord.text += ' ' + line.trim();
    }
  }
  if (currentRecord) records.push(currentRecord);

  let updatedCount = 0;
  for (let rec of records) {
    const fullText = rec.text.replace(/\s+/g, ' ');
    
    // Extrator de aspas robusto (pega o que está entre aspas, mesmo com quebras)
    const quotes = fullText.match(/"([^"]*)"/g) || [];
    const cleanQuotes = quotes.map(q => q.replace(/"/g, '').trim());

    // Extrator de datas robusto
    const dates = fullText.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g) || [];

    // Priorizamos Defeito e Análise (costumam ser as últimas aspas longas)
    // No Btl_Principal: Técnico é q[0], se houver Solicitante/Outros...
    // Defeito costuma ser a penúltima, Análise a última (conforme observado na OS 2362)
    let defeito = "";
    let analise = "";
    let dataSaidaString = dates.length >= 2 ? dates[1] : null;

    if (cleanQuotes.length >= 3) {
      // Padrão: [Técnico, Defeito, Análise] ou [Técnico, Solicitante, Defeito, Análise]
      analise = cleanQuotes[cleanQuotes.length - 1];
      defeito = cleanQuotes[cleanQuotes.length - 2];
    } else if (cleanQuotes.length === 2) {
      defeito = cleanQuotes[1];
    }

    // Validação extra para OS 2362 especificamente (para garantir sucesso total)
    if (rec.id === 2362) {
        console.log(`Debug OS 2362:\nQuotes (${cleanQuotes.length}):`, cleanQuotes);
        console.log(`Dates (${dates.length}):`, dates);
    }

    if (defeito || analise || dataSaidaString) {
      const updateData = {};
      if (defeito) updateData.Defeito_Recl = defeito;
      if (analise) updateData.Analise_Tecnica = analise;
      
      if (dataSaidaString) {
        const [d, m, y] = dataSaidaString.split('/');
        updateData.dataRetorno = new Date(`${y}-${m}-${d}T12:00:00Z`);
      }

      await Servico.updateOne({ Id_cod: rec.id }, { $set: updateData });
      updatedCount++;
    }
  }
  console.log(`Equipamentos processados: ${records.length}, Atualizados no MongoDB: ${updatedCount}`);
}

async function repairMissionsFull() {
  const filePath = 'C:/Users/Alan/Downloads/Banco De Dados Ditel/Btlserviço.txt';
  if (!fs.existsSync(filePath)) return console.log('Arquivo Btlserviço não encontrado.');

  const content = fs.readFileSync(filePath, 'latin1');
  const rawLines = content.split('\n');
  
  let records = [];
  let currentRecord = null;

  console.log('\n>>> Analisando Btlserviço para reconstrução total...');

  for (let line of rawLines) {
    const osMatch = line.match(/^\|\s*(\d+)\s*\|/);
    if (osMatch) {
      if (currentRecord) records.push(currentRecord);
      currentRecord = { os: parseInt(osMatch[1]), text: line };
    } else if (currentRecord && line.includes('|')) {
      currentRecord.text += ' ' + line.trim();
    }
  }
  if (currentRecord) records.push(currentRecord);

  let updatedCount = 0;
  for (let rec of records) {
    const parts = rec.text.split('|').map(p => p.trim());
    if (parts.length >= 9) {
      const updateData = {
        def_recla: parts[6],
        analise: parts[7],
        solucao: parts[8],
        relatorio: parts[11] || "",
        horario: parts[10] || ""
      };
      
      await Missao.updateOne({ os: rec.os }, { $set: updateData });
      updatedCount++;
    }
  }
  console.log(`Missões processadas: ${records.length}, Atualizadas no MongoDB: ${updatedCount}`);
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB para reparo COMPLETO...');

    await repairEquipmentFull();
    await repairMissionsFull();

    mongoose.connection.close();
    console.log('\n--- Reparo TOTAL FINALIZADO com sucesso! ---');
}

main();
