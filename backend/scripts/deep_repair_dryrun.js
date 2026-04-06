const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Servico = require('../models/Servico');

async function repairEquipment() {
    const inputPath = 'C:/Users/Alan/Downloads/Btl_Principal.txt';
    if (!fs.existsSync(inputPath)) {
        console.error('Arquivo fonte não encontrado!');
        return;
    }

    const content = fs.readFileSync(inputPath, 'latin1');
    
    // Regex para pegar tokens: (Aspas "..." incluindo quebras de linha) OU (caracteres sem espaço)
    const tokens = content.match(/"[^"]*"|[^\s"]+/g) || [];
    
    const records = [];
    let current = null;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        // Se o token for um ID (\d+) seguido de um Token que parece uma Data
        const possibleId = parseInt(token);
        const nextToken = tokens[i+1] || "";
        
        if (!isNaN(possibleId) && nextToken.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
            // Início de Registro!
            if (current) records.push(current);
            current = { id: possibleId, dataEnt: nextToken, quotes: [] };
            i++; // consome a data
        } else if (current && token.startsWith('"')) {
            // Se for aspas, remove as aspas e guarda
            current.quotes.push(token.substring(1, token.length - 1).trim());
        }
    }
    if (current) records.push(current);

    console.log(`\n--- Extração concluída: ${records.length} registros ---`);
    
    // DRY RUN: Vamos ver a OS 2362
    const os2362 = records.find(r => r.id === 2362);
    if (os2362) {
        console.log('\n>>> DRY RUN: OS 2362 ENCONTRADA!');
        console.log('ID:', os2362.id);
        console.log('Data Entrada:', os2362.dataEnt);
        console.log('Aspas encontradas:', os2362.quotes.length);
        
        // Mapeando heursitica de Btl_Principal:
        // Aspas 0: Técnico
        // Aspas 1: Equipamento (Modelo)
        // Aspas 2: Defeito
        // Aspas 3: Análise Técnica
        // Aspas 4: Status (PRONTO/PENDENTE)
        
        console.log('--- Todas as Aspas Encontradas ---');
        os2362.quotes.forEach((q, idx) => console.log(`[${idx}]: ${q}`));
        
        // Vamos procurar as descrições longas
        const longQuotes = os2362.quotes.filter(q => q.length > 20);
        console.log('\n--- Possíveis Descrições Longas ---');
        longQuotes.forEach(q => console.log(`> ${q.substring(0, 50)}...`));
    } else {
        console.log('\n!!! OS 2362 NÃO ENCONTRADA NO DRY RUN !!!');
        // Imprime os primeiros 5 para debug
        console.log('Primeiros IDs:', records.slice(0, 5).map(r => r.id));
    }
}

async function run() {
    await repairEquipment();
}

run();
