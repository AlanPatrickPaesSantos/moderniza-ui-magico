const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const Servico = require('../models/Servico');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const content = fs.readFileSync('C:/Users/Alan/Downloads/Btl_Principal.txt', 'latin1');
    const rawLines = content.split('\n');
    
    // Alvo específico
    const targets = [2362, 2363];
    
    for (const id of targets) {
        let fullText = "";
        let found = false;
        for (let i = 0; i < rawLines.length; i++) {
            if (rawLines[i].match(new RegExp(`^\\s*${id}\\s+`))) {
                found = true;
                fullText = rawLines[i];
                for (let j = i + 1; j < rawLines.length; j++) {
                    if (rawLines[j].match(/^\s*(\d+)\s+(\d{1,2}\/)/)) break;
                    fullText += " " + rawLines[j].trim();
                }
                break;
            }
        }
        
        if (found) {
            const fullClean = fullText.replace(/\s+/g, ' ');
            const quotes = fullClean.match(/"([^"]*)"/g) || [];
            const cleanQuotes = quotes.map(q => q.replace(/"/g, '').trim());
            const dates = fullClean.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g) || [];

            let updateData = {};
            if (cleanQuotes.length >= 2) {
                updateData.Analise_Tecnica = cleanQuotes[cleanQuotes.length - 1];
                updateData.Defeito_Recl = cleanQuotes[cleanQuotes.length - 2];
            }
            if (dates.length >= 2) {
                const [d, m, y] = dates[1].split('/');
                updateData.dataRetorno = new Date(`${y}-${m}-${d}T12:00:00Z`);
            }

            console.log(`OS ${id} Fix:`, updateData);
            await Servico.updateOne({ Id_cod: id }, { $set: updateData });
        }
    }
    mongoose.connection.close();
}
run();
