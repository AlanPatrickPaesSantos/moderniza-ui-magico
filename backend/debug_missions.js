const mongoose = require('mongoose');
require('dotenv').config();
const Missao = require('./models/Missao');

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  console.log(`Checking missions between ${firstDay.toISOString()} and ${lastDay.toISOString()}`);

  const count = await Missao.countDocuments({
    data: { $gte: firstDay, $lte: lastDay }
  });

  console.log(`Total missions this month: ${count}`);

  const total = await Missao.countDocuments({});
  console.log(`Total missions in DB: ${total}`);

  const lastMissions = await Missao.find({}).sort({ data: -1 }).limit(5).lean();
  console.log("Last 5 missions in DB:");
  lastMissions.forEach(m => console.log(`OS: ${m.os}, Date: ${m.data}`));

  process.exit(0);
}

check();
