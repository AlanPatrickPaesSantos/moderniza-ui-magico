const mongoose = require('mongoose');
const fs = require('fs');
const readline = require('readline');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Missao = require('../models/Missao');
const Servico = require('../models/Servico');

/**
 * Função para limpar strings e remover ruídos de quebra de linha do parser de texto
 */
function clean(str) {
  if (!str) return '';
  return str.trim().replace(/\s+/g, ' ');
}

/**
 * Converte data DD/MM/YYYY para Objeto Date
 */
function parseDate(dateStr) {
  if (!dateStr || !dateStr.includes('/')) return null;
  const parts = clean(dateStr).split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const d = new Date(Date.UTC(year, month, day, 12, 0, 0)); // Meio dia UTC para evitar problemas de fuso
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Parser de Tabela TXT
 * @param {string} filePath - Caminho do arquivo
 * @param {Function} mapper - Função que transforma o array de colunas em um objeto do Mongoose
 */
async function importTable(filePath, Model, mapper, collectionName) {
  console.log(`\n>>> Iniciando importação de: ${filePath} para ${Model.modelName}...`);
  
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let count = 0;
  let updated = 0;
  let currentRecord = null;
  let headers = [];

  for await (const line of rl) {
    // Ignorar linhas de borda ou vazias
    if (line.includes('---') || !line.includes('|')) continue;

    const parts = line.split('|').map(p => p.trim());
    
    // Identificar Cabeçalho (primeira linha com '|' que não é dados)
    // Se a primeira coluna contém "OS" ou "Id_cod", é o cabeçalho
    if (parts[1] && (parts[1].toLowerCase().includes('os') || parts[1].toLowerCase().includes('id_cod'))) {
      headers = parts;
      continue;
    }

    if (headers.length === 0) continue; // Pula até achar o cabeçalho

    // Se parts[1] (OS/ID) tem Valor, inicia um novo registro
    const osValue = parseInt(parts[1], 10);
    if (!isNaN(osValue)) {
      // Salva o registro anterior se existir
      if (currentRecord) {
        await upsertRecord(Model, currentRecord);
        count++;
        if (count % 100 === 0) process.stdout.write('.');
      }
      // Inicia novo
      currentRecord = mapper(parts);
    } else if (currentRecord) {
      // Continuação do registro anterior (multiline)
      // Concatena campos de texto se houver conteúdo nas partes
      appendData(currentRecord, parts, Model.modelName);
    }
  }

  // Salva o último
  if (currentRecord) {
    await upsertRecord(Model, currentRecord);
    count++;
  }

  console.log(`\nConcluído! ${count} registros processados para ${collectionName}.`);
}

async function upsertRecord(Model, data) {
  try {
    // Para Missão, a chave é 'os'. Para Servico, a chave é 'os' (vinda de Id_cod)
    await Model.findOneAndUpdate(
      { os: data.os },
      data,
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error(`Erro ao salvar OS ${data.os}:`, err.message);
  }
}

function appendData(record, parts, type) {
  if (type === 'Missao') {
    if (parts[3]) record.secao += ' ' + parts[3];
    if (parts[4]) record.tecnicos += ' ' + parts[4];
    if (parts[6]) record.def_recla += ' ' + parts[6];
    if (parts[7]) record.analise += ' ' + parts[7];
    if (parts[8]) record.solucao += ' ' + parts[8];
    if (parts[9]) record.solicitante += ' ' + parts[9];
    if (parts[11]) record.relatorio += ' ' + parts[11];
  } else if (type === 'Servico') {
    // Id_cod(1), Data_Ent(2), Tecnico(3), Seção_Ditel(4), T_EquipTelecom(5), T_EquipSuporte(6), Solicitante(7), Unidade(8)...
    if (parts[3]) record.Tecnico += ' ' + parts[3];
    if (parts[6]) record.Equip_Suporte += ' ' + parts[6];
    if (parts[7]) record.Solicitante += ' ' + parts[7];
    if (parts[12]) record.Defeito += ' ' + parts[12];
    if (parts[13]) record.Analise_Tecnica += ' ' + parts[13];
    if (parts[18]) record.Laudo_Tecnico += ' ' + parts[18];
  }
}

// Mapas específicos para cada arquivo
const missaoMapper = (p) => ({
  os: parseInt(p[1], 10),
  data: parseDate(p[2]),
  secao: clean(p[3]),
  tecnicos: clean(p[4]),
  unidade: clean(p[5]),
  def_recla: clean(p[6]),
  analise: clean(p[7]),
  solucao: clean(p[8]),
  solicitante: clean(p[9]),
  horario: clean(p[10]),
  relatorio: clean(p[11]),
  servico: clean(p[12])
});

const servicoMapper = (p) => ({
  os: parseInt(p[1], 10), // Id_cod mapeia para 'os' no Schema Mongoose (seguindo padrão do server.js)
  Data_Ent: parseDate(p[2]),
  Tecnico: clean(p[3]),
  Secao_Ditel: clean(p[4]),
  Equip_Telecom: clean(p[5]),
  Equip_Suporte: clean(p[6]),
  Solicitante: clean(p[7]),
  Unidade: clean(p[8]),
  PAE: clean(p[9]),
  RP: clean(p[10]),
  Serie: clean(p[11]),
  Defeito: clean(p[12]),
  Analise_Tecnica: clean(p[13]),
  Servico: clean(p[14]),
  Garantia: clean(p[15]),
  Data_Envio: parseDate(p[16]),
  Data_Saida: parseDate(p[17]),
  Laudo_Tecnico: clean(p[18]),
  // ... outros campos podem ser adicionados conforme a necessidade do schema
});

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB para importação...');

    // 1. Importar Missões
    const fileM = 'C:/Users/Alan/Downloads/Banco De Dados Ditel/Btlserviço.txt';
    if (fs.existsSync(fileM)) {
      await importTable(fileM, Missao, missaoMapper, 'Missões');
    }

    // 2. Importar Serviços (Manutenção)
    const fileS = 'C:/Users/Alan/Downloads/Banco De Dados Ditel/Btl_Principal.txt';
    if (fs.existsSync(fileS)) {
      await importTable(fileS, Servico, servicoMapper, 'Serviços');
    }

    mongoose.connection.close();
    console.log('\n--- Script finalizado com sucesso! ---');
  } catch (err) {
    console.error('Erro fatal:', err);
    process.exit(1);
  }
}

main();
