const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Servico = require('../models/Servico');
const Missao = require('../models/Missao');

async function repairEquipment() {
    const inputPath = 'C:/Users/Alan/Downloads/Btl_Principal.txt';
    if (!fs.existsSync(inputPath)) return;

    console.log('Lendo Btl_Principal.txt...');
    const content = fs.readFileSync(inputPath, 'latin1');
    const tokens = content.match(/"[^"]*"|[^\s"]+/g) || [];
    const records = [];
    let current = null;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!isNaN(parseInt(token)) && tokens[i+1]?.match(/^\d{1,2}\/\d{1,2}\/\d{4}/)) {
            if (current) records.push(current);
            current = { id: parseInt(token), quotes: [] };
            i++; 
        } else if (current && token.startsWith('"')) {
            current.quotes.push(token.substring(1, token.length - 1).trim());
        }
    }
    if (current) records.push(current);

    console.log(`\n--- Reparando ${records.length} Equipamentos... ---`);
    let success = 0;

    for (let r of records) {
        try {
            const update = {};
            // Heurística baseada no número de aspas
            if (r.quotes.length >= 9) {
                // Caso complexo (como OS 2362)
                update.Defeito_Recl = r.quotes[5];
                update.Analise_Tecnica = r.quotes[8];
            } else if (r.quotes.length >= 5) {
                // Caso simples (OS 13)
                update.Defeito_Recl = r.quotes[2];
                update.Analise_Tecnica = r.quotes[3];
            } else if (r.quotes.length > 0) {
                // Fallback: Maior string
                const sorted = [...r.quotes].sort((a, b) => b.length - a.length);
                update.Defeito_Recl = sorted[0];
            }

            if (Object.keys(update).length > 0) {
                await Servico.updateOne({ Id_cod: r.id }, { $set: update });
                success++;
                if (success % 500 === 0) console.log(`Progresso: ${success}...`);
            }
        } catch (err) {
            console.error(`Erro no ID ${r.id}:`, err.message);
        }
    }
    console.log(`Sucesso Equipamentos: ${success}`);
}

async function repairMissions() {
    const inputPath = 'C:/Users/Alan/Downloads/Banco De Dados Ditel/Btlserviço.txt';
    if (!fs.existsSync(inputPath)) return;

    console.log('Lendo Btlserviço.txt...');
    const content = fs.readFileSync(inputPath, 'latin1');
    
    // As missões são separadas por linhas de traços
    const sections = content.split(/----------------------------+/);
    const records = [];

    for (let section of sections) {
        // Cada seção deve conter um ID de OS no formato | 123 |
        const idMatch = section.match(/\|\s*(\d+)\s*\|/);
        if (idMatch) {
            // Limpamos a seção para pegar apenas o conteúdo entre Pipes
            const parts = section.split('|').map(p => p.trim()).filter(p => !p.startsWith('---'));
            // Filtramos partes vazias mas mantemos a estrutura
            const cleanParts = section.split('|').map(p => p.trim());
            
            // Heurística para Missões (contando pipes)
            // parts[6] = Defeito, parts[7] = Analise, parts[8] = Solucao, parts[11] = Relatorio
            if (cleanParts.length >= 12) {
                records.push({
                    os: parseInt(idMatch[1]),
                    def_recla: cleanParts[6],
                    analise: cleanParts[7],
                    solucao: cleanParts[8],
                    horario: cleanParts[10],
                    relatorio: cleanParts[11]
                });
            }
        }
    }

    console.log(`\n--- Reparando ${records.length} Missões... ---`);
    let success = 0;

    for (let r of records) {
        try {
            await Missao.updateOne({ os: r.os }, { 
                $set: { 
                    def_recla: r.def_recla,
                    analise: r.analise,
                    solucao: r.solucao,
                    horario: r.horario,
                    relatorio: r.relatorio
                } 
            });
            success++;
            if (success % 1000 === 0) console.log(`Progresso: ${success}...`);
        } catch (err) {
            console.error(`Erro na Missão OS ${r.os}:`, err.message);
        }
    }
    console.log(`Sucesso Missões: ${success}`);
}

async function main() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Iniciando Reparo Profundo...');
        await repairEquipment();
        await repairMissions();
        mongoose.connection.close();
        console.log('\n>>> REPARO CONCLUÍDO! <<<');
    } catch (err) {
        console.error('CRASH FATAL:', err);
    }
}

main();
