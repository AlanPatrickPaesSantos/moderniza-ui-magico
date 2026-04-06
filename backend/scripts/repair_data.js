const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Servico = require('../models/Servico');
const Missao = require('../models/Missao');

async function repairEquipmentAll() {
  const filePath = 'C:/Users/Alan/Downloads/Btl_Principal.txt';
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'latin1');
  const lines = content.split('\n');
  
  let count = 0;
  console.log('\n>>> Processando reparo total de Equipamentos (Btl_Principal)...');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\s*(\d+)\s+(\d{1,2}\/\d{1,2}\/\d{4})/);
    
    if (match) {
      const id = parseInt(match[1]);
      let fullRecordText = line;
      
      // Captura linhas de continuação
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j];
        if (nextLine.match(/^\s*(\d+)\s+(\d{1,2}\/\d{1,2}\/\d{4})/) || nextLine.includes('---------')) {
          break;
        }
        fullRecordText += ' ' + nextLine.trim();
        i = j; // Avança o ponteiro principal
      }

      // Extrai o que está entre aspas para identificar Defeito e Analise
      const quotes = fullRecordText.match(/"([^"]{3,})"/g);
      if (quotes && quotes.length >= 2) {
        const defeito = quotes[quotes.length - 2].replace(/"/g, '').trim();
        const analise = quotes[quotes.length - 1].replace(/"/g, '').trim();
        
        if (defeito.length > 5 || analise.length > 5) {
            await Servico.updateOne({ Id_cod: id }, { $set: { Defeito_Recl: defeito, Analise_Tecnica: analise } });
            count++;
        }
      }
    }
  }
  console.log(`Concluído! ${count} equipamentos reparados.`);
}

async function repairMissionsAll() {
  const filePath = 'C:/Users/Alan/Downloads/Banco De Dados Ditel/Btlserviço.txt';
  if (!fs.existsSync(filePath)) return;

  const content = fs.readFileSync(filePath, 'latin1');
  const lines = content.split('\n');
  
  let count = 0;
  console.log('\n>>> Processando reparo total de Missões (Btlserviço)...');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^\|\s*(\d+)\s*\|/);
    
    if (match) {
      const os = parseInt(match[1]);
      let fullRecordText = line;
      
      // Captura linhas de continuação
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j];
        if (nextLine.match(/^\|\s*(\d+)\s*\|/) || nextLine.includes('----------------')) {
          break;
        }
        fullRecordText += ' ' + nextLine.trim();
        i = j; 
      }

      // Para Missões, o separador é o Pipe. Vamos reconstruir os campos.
      const parts = fullRecordText.split('|').map(p => p.trim());
      if (parts.length >= 9) {
        const defeito = parts[6];
        const analise = parts[7];
        const solucao = parts[8];
        const relatorio = parts[11];
        
        await Missao.updateOne({ os }, { $set: { 
            def_recla: defeito, 
            analise: analise, 
            solucao: solucao,
            relatorio: relatorio
        } });
        count++;
      }
    }
  }
  console.log(`Concluído! ${count} missões reparadas.`);
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB para reparo total...');

    await repairEquipmentAll();
    await repairMissionsAll();

    mongoose.connection.close();
    console.log('\n--- Reparo finalizado com sucesso! ---');
}

main();
