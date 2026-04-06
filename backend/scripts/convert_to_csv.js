const fs = require('fs');
const path = require('path');
const csvWriter = require('csv-writer').createObjectCsvWriter;

async function convertEquipment() {
  const inputPath = 'C:/Users/Alan/Downloads/Btl_Principal.txt';
  const outputPath = path.join(__dirname, '../data/Btl_Principal_Limpo.csv');
  
  if (!fs.existsSync(inputPath)) return;
  if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const content = fs.readFileSync(inputPath, 'latin1');
  const lines = content.split('\n');
  
  const records = [];
  let current = null;

  for (let line of lines) {
    const match = line.match(/^\s*(\d+)\s+(\d{1,2}\/\d{1,2}\/\d{4})/);
    if (match) {
      if (current) records.push(current);
      current = { id: match[1], dataEnt: match[2], text: line.trim() };
    } else if (current && line.trim()) {
      current.text += ' ' + line.trim();
    }
  }
  if (current) records.push(current);

  const writer = csvWriter({
    path: outputPath,
    header: [
      { id: 'id', title: 'ID' },
      { id: 'dataEnt', title: 'Data_Entrada' },
      { id: 'tecnico', title: 'Tecnico' },
      { id: 'defeito', title: 'Defeito' },
      { id: 'analise', title: 'Analise' },
      { id: 'dataSaida', title: 'Data_Saida' }
    ]
  });

  const cleanRecords = records.map(r => {
    const full = r.text.replace(/\s+/g, ' ');
    const quotes = full.match(/"([^"]*)"/g) || [];
    const cleanQuotes = quotes.map(q => q.replace(/"/g, '').trim()).filter(q => q.length > 0);
    const dates = full.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g) || [];

    // Heurística de Campos para Btl_Principal:
    // q[0] costuma ser o Técnico
    // q[1] ou q[2] costuma ser o Defeito
    // q[2] ou q[3] costuma ser o Análise
    // q[length-1] e q[length-2] costumam ser tags curtas como "NÃO", "LAUDO", "PRONTO"
    
    let tecnico = cleanQuotes[0] || '';
    let defeito = '';
    let analise = '';

    // Filtramos apenas as aspas "descritivas" (que tenham mais de 10 caracteres ou palavras comuns)
    const descriptive = cleanQuotes.slice(1).filter(q => q.length > 5 && !['LAUDO', 'PRONTO', 'NÃO', 'SIM', 'A VERIFICAR'].includes(q.toUpperCase()));

    if (descriptive.length >= 2) {
        defeito = descriptive[0];
        analise = descriptive[1];
    } else if (descriptive.length === 1) {
        defeito = descriptive[0];
    }

    return {
      id: r.id,
      dataEnt: r.dataEnt,
      tecnico: tecnico,
      defeito: defeito,
      analise: analise,
      dataSaida: dates.length >= 2 ? dates[1] : ''
    };
  });

  await writer.writeRecords(cleanRecords);
  console.log(`CSV de Equipamentos gerado: ${outputPath} (${cleanRecords.length} registros)`);
}

async function convertMissions() {
  const inputPath = 'C:/Users/Alan/Downloads/Banco De Dados Ditel/Btlserviço.txt';
  const outputPath = path.join(__dirname, '../data/Btl_Missions_Limpo.csv');
  
  if (!fs.existsSync(inputPath)) return;
  if (!fs.existsSync(path.dirname(outputPath))) fs.mkdirSync(path.dirname(outputPath), { recursive: true });

  const content = fs.readFileSync(inputPath, 'latin1');
  const lines = content.split('\n');
  
  const records = [];
  let current = null;

  for (let line of lines) {
    const match = line.match(/^\|\s*(\d+)\s*\|/);
    if (match) {
      if (current) records.push(current);
      current = { os: match[1], text: line.trim() };
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
  console.log(`CSV de Missões gerado: ${outputPath} (${cleanRecords.length} registros)`);
}

async function run() {
  await convertEquipment();
  await convertMissions();
}

run();
