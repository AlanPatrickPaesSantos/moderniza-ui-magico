const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const Servico = require('../models/Servico');
const Missao = require('../models/Missao');

async function run() {
    await mongoose.connect(process.env.MONGODB_URI);
    const content = fs.readFileSync('C:/Users/Alan/Downloads/Btl_Principal.txt', 'latin1');
    const lines = content.split('\n');
    
    // Alvos específicos
    const targets = [2362, 2363];
    
    for (const id of targets) {
        let fullText = "";
        for (let i = 0; i < lines.length; i++) {
            if (lines[i].match(new RegExp(`^\\s*${id}\\s+`))) {
                fullText = lines[i];
                for (let j = i + 1; j < lines.length; j++) {
                    if (lines[j].match(/^\s*(\d+)\s+(\d{1,2}\/)/)) break;
                    fullText += " " + lines[j].trim();
                }
                break;
            }
        }
        
        const quotes = fullText.match(/"([^"]{3,})"/g);
        if (quotes && quotes.length >= 2) {
            const defeito = quotes[quotes.length - 2].replace(/"/g, '').trim();
            const analise = quotes[quotes.length - 1].replace(/"/g, '').trim();
            console.log(`Reparando OS ${id}: ${defeito.substring(0,20)}...`);
            await Servico.updateOne({ Id_cod: id }, { $set: { Defeito_Recl: defeito, Analise_Tecnica: analise } });
        }
    }
    mongoose.connection.close();
}
run();
