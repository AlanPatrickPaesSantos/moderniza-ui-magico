const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;

async function convertEquipment() {
  const inputPath = 'C:/Users/Alan/Downloads/Btl_Principal.txt';
  const outputPath = path.join(__dirname, '../data/Btl_Principal_v2.csv');
  
  if (!fs.existsSync(inputPath)) return;
  if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const content = fs.readFileSync(inputPath, 'latin1');
  const lines = content.split('\n');
  
  const records = [];
  let current = null;

  console.log('\n>>> Analisando Btl_Principal para conversão estruturada...');

  for (let line of lines) {
    // Detecta início de registro (Número + Data)
    const masterMatch = line.match(/^\s*(\d+)\s+(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (masterMatch) {
      if (current) records.push(current);
      current = { id: masterMatch[1], dataEnt: masterMatch[2], text: line.trim() };
    } else if (current && line.trim()) {
      // Se não for início de novo registro, é continuação do anterior
      current.text += ' ' + line.trim();
    }
  }
  if (current) records.push(current);

  const writer = csvWriter({
    path: outputPath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'dataEnt', title: 'Data Entrada' },
      { id: 'tecnico', title: 'Tecnico' },
      { id: 'defeito', title: 'Defeito' },
      { id: 'analise', title: 'Analise' },
      { id: 'dataSaida', title: 'Data Saida' }
    ]
  });

  const cleanRecords = records.map(r => {
    const full = r.text.replace(/\s+/g, ' ');
    const quotes = full.match(/"([^"]*)"/g) || [];
    const cleanQuotes = quotes.map(q => q.replace(/"/g, '').trim()).filter(q => q.length > 0);
    const dates = full.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g) || [];

    // Escolha de Técnico: Primeira aspas suelen ser o técnico
    let tecnico = cleanQuotes[0] || '';
    
    // Escolha de Defeito: Primeira aspas descritiva longa (>5 caracteres) que não seja o técnico
    const descriptives = cleanQuotes.slice(1).filter(q => q.length > 5 && !['LAUDO', 'PRONTO', 'NÃO', 'SIM'].includes(q.toUpperCase()));
    
    let defeito = descriptives[0] || '';
    let analise = descriptives[1] || '';
    
    // Escolha da Data de Saída: A última data que não seja a data de entrada
    let dataSaida = dates.length >= 2 ? dates[dates.length - 1] : '';

    return {
      id: r.id,
      dataEnt: r.dataEnt,
      tecnico: tecnico,
      defeito: defeito,
      analise: analise,
      dataSaida: dataSaida
    };
  });

  await writer.writeRecords(cleanRecords);
  console.log(`Btl_Principal: ${cleanRecords.length} registros convertidos para CSV.`);
}

async function convertMissions() {
  const inputPath = 'C:/Users/Alan/Downloads/Banco De Dados Ditel/Btlserviço.txt';
  const outputPath = path.join(__dirname, '../data/Btl_Missions_v2.csv');
  
  if (!fs.existsSync(inputPath)) return;
  if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const content = fs.readFileSync(inputPath, 'latin1');
  const lines = content.split('\n');
  
  const records = [];
  let current = null;

  console.log('\n>>> Analisando Btlserviço para conversão estruturada...');

  for (let line of lines) {
    const osMatch = line.match(/^\|\s*(\d+)\s*\|/);
    if (osMatch) {
      if (current) records.push(current);
      current = { os: osMatch[1], text: line.trim() };
    } else if (current && line.includes('|')) {
      current.text += ' ' + line.trim();
    }
  }
  if (current) records.push(current);

  const writer = csvWriter({
    path: outputPath,
    header: [
      { id: 'os', title: 'OS' },
      { id: 'data', title: 'Data' },
      { id: 'secao', title: 'Secao' },
      { id: 'tecnicos', title: 'Tecnicos' },
      { id: 'unidade', title: 'Unidade' },
      { id: 'defeito', title: 'Defeito' },
      { id: 'analise', title: 'Analise' },
      { id: 'solucao', title: 'Solucao' },
      { id: 'solicitante', title: 'Solicitante' },
      { id: 'horario', title: 'Horario' },
      { id: 'relatorio', title: 'Relatorio' },
      { id: 'servico', title: 'Servico' }
    ]
  });

  const cleanRecords = records.map(r => {
    const parts = r.text.split('|').map(p => p.trim());
    return {
      os: r.os,
      data: parts[2] || '',
      secao: parts[3] || '',
      tecnicos: parts[4] || '',
      unidade: parts[5] || '',
      defeito: parts[6] || '',
      analise: parts[7] || '',
      solucao: parts[8] || '',
      solicitante: parts[9] || '',
      horario: parts[10] || '',
      relatorio: parts[11] || '',
      servico: parts[12] || ''
    };
  });

  await writer.writeRecords(cleanRecords);
  console.log(`Btl_Missions: ${cleanRecords.length} registros convertidos para CSV.`);
}

async function run() {
  await convertEquipment();
  await convertMissions();
}

run();
