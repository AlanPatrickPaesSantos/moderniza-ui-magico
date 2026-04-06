const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const Servico = require('../models/Servico');
const Missao = require('../models/Missao');

async function importEquipment() {
    return new Promise((resolve) => {
        const results = [];
        fs.createReadStream(path.join(__dirname, '../data/Btl_Principal_v3.csv'), { encoding: 'utf8' })
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`\n--- Importando ${results.length} Equipamentos... ---`);
                for (let row of results) {
                    const id = parseInt(row['ID']);
                    const update = {
                        Defeito_Recl: row['Defeito'],
                        Analise_Tecnica: row['Analise'],
                        saidaEquip: row['Data Saida']
                    };
                    
                    if (row['Data Saida'] && row['Data Saida'].match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
                        const [d, m, y] = row['Data Saida'].split('/');
                        update.dataRetorno = new Date(`${y}-${m}-${d}T12:00:00Z`);
                    }
                    
                    await Servico.updateOne({ Id_cod: id }, { $set: update });
                }
                resolve();
            });
    });
}

async function importMissions() {
    return new Promise((resolve) => {
        const results = [];
        fs.createReadStream(path.join(__dirname, '../data/Btl_Missions_v3.csv'), { encoding: 'utf8' })
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                console.log(`\n--- Importando ${results.length} Missões... ---`);
                for (let row of results) {
                    const os = parseInt(row['OS']);
                    const update = {
                        def_recla: row['Defeito'],
                        analise: row['Analise'],
                        solucao: row['Solucao'],
                        horario: row['Horario'],
                        relatorio: row['Relatorio']
                    };
                    await Missao.updateOne({ os: os }, { $set: update });
                }
                resolve();
            });
    });
}

async function main() {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB para importação via CSV...');

    await importEquipment();
    await importMissions();

    mongoose.connection.close();
    console.log('\n>>> REPARO DE DADOS CONCLUÍDO! <<<');
}

main();
