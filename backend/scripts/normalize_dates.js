const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

function parseDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const trimmed = dateStr.trim();
  if (trimmed === '') return null;
  if (trimmed.match(/^\d{4}-\d{2}-\d{2}/)) {
    const d = new Date(trimmed);
    return isNaN(d.getTime()) ? null : d;
  }
  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (brMatch) {
    const day = parseInt(brMatch[1], 10);
    const month = parseInt(brMatch[2], 10) - 1;
    const year = parseInt(brMatch[3], 10);
    const d = new Date(Date.UTC(year, month, day));
    return isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(trimmed);
  return isNaN(d.getTime()) ? null : d;
}

async function normalize() {
  try {
    console.log('Connecting to Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const collections = ['servicos', 'missoes'];
    const dateFields = { 'servicos': ['Data_Ent', 'Data_Saida'], 'missoes': ['data'] };
    const statusFields = { 'servicos': ['Serviço'], 'missoes': ['servico'] };

    for (const colName of collections) {
      console.log(`Processing collection: ${colName}`);
      const cursor = db.collection(colName).find({
        $or: [
          ...dateFields[colName].map(f => ({ [f]: { $type: 'string' } })),
          ...statusFields[colName].map(f => ({ [f]: { $regex: /^\s|\s$/ } }))
        ]
      });

      let bulkOps = [];
      let count = 0;
      let totalUpdated = 0;

      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        let update = {};

        for (const f of dateFields[colName]) {
          if (typeof doc[f] === 'string') {
            const d = parseDate(doc[f]);
            if (d) update[f] = d;
          }
        }

        for (const f of statusFields[colName]) {
          if (doc[f] && typeof doc[f] === 'string') {
            const t = doc[f].trim();
            if (t !== doc[f]) update[f] = t;
          }
        }

        if (Object.keys(update).length > 0) {
          bulkOps.push({
            updateOne: {
              filter: { _id: doc._id },
              update: { $set: update }
            }
          });
        }

        count++;
        if (bulkOps.length >= 100) {
          await db.collection(colName).bulkWrite(bulkOps);
          totalUpdated += bulkOps.length;
          console.log(`[${colName}] Processed ${count}, Updated ${totalUpdated}...`);
          bulkOps = [];
        }
      }

      if (bulkOps.length > 0) {
        await db.collection(colName).bulkWrite(bulkOps);
        totalUpdated += bulkOps.length;
        console.log(`[${colName}] Finished. Total Updated: ${totalUpdated}`);
      } else {
        console.log(`[${colName}] Finished. No updates needed.`);
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}
normalize();
