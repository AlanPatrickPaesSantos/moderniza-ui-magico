const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function findPatterns() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const collections = ['servicos', 'missoes'];
    const fields = {
      'servicos': ['Defeito_Recl', 'Analise_Tecnica'],
      'missoes': ['def_recla', 'analise']
    };

    for (const coll of collections) {
      console.log(`\n--- Analisando ${coll} ---`);
      for (const field of fields[coll]) {
        const pipeline = [
          { $group: { _id: `$${field}`, count: { $sum: 1 } } },
          { $match: { _id: { $ne: null, $ne: "" }, count: { $gt: 1 } } },
          { $addFields: { len: { $strLenCP: { $toString: "$_id" } } } },
          { $match: { len: { $lt: 20 } } },
          { $sort: { count: -1 } }
        ];
        const results = await db.collection(coll).aggregate(pipeline).toArray();
        console.log(`\nField: ${field} (repetidos < 20 chars):`);
        results.slice(0, 20).forEach(r => console.log(`  "${r._id}" (${r.count}x)`));
      }
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

findPatterns();
