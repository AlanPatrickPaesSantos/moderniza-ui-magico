const fs = require('fs');
const content = fs.readFileSync('C:/Users/Alan/Downloads/Btl_Principal.txt', 'latin1');
const os = '2362';
const lines = content.split('\n');

let fullText = '';
let found = false;
for (let i = 0; i < lines.length; i++) {
    if (lines[i].match(new RegExp('^\\s*' + os + '\\s+'))) {
        found = true;
        fullText = lines[i];
        for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].match(/^\\s*(\d+)\s+(\d{1,2}\/)/)) break;
            fullText += ' ' + lines[j].trim();
        }
        break;
    }
}

if (found) {
    const fullClean = fullText.replace(/\s+/g, ' ');
    const quotes = fullClean.match(/"([^"]*)"/g) || [];
    const cleanQuotes = quotes.map(q => q.replace(/"/g, '').trim()).filter(q => q.length > 0);
    const dates = fullClean.match(/(\d{1,2}\/\d{1,2}\/\d{4})/g) || [];

    console.log('--- RECONSTRUCTED RAW TEXT ---');
    console.log(fullClean);
    console.log('\n--- QUOTES FOUND ---');
    cleanQuotes.forEach((q, idx) => console.log(`Q[${idx}]: ${q}`));
    console.log('\n--- DATES FOUND ---');
    dates.forEach((d, idx) => console.log(`D[${idx}]: ${d}`));
} else {
    console.log('OS ' + os + ' não encontrada.');
}
