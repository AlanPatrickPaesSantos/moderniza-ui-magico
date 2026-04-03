const mongoose = require('mongoose');
const MONGODB_URI = 'mongodb://ALAN:Al%402131@ac-co9oixe-shard-00-00.orghwak.mongodb.net:27017,ac-co9oixe-shard-00-01.orghwak.mongodb.net:27017,ac-co9oixe-shard-00-02.orghwak.mongodb.net:27017/teste?ssl=true&authSource=admin&retryWrites=true&w=majority';

function toISO(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') return dateStr;
  if (dateStr.includes('-')) return dateStr;
  const parts = dateStr.split('/');
  if (parts.length === 3) {
    const [d, m, y] = parts;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr;
}

mongoose.connect(MONGODB_URI).then(async () => {
  console.log('🔗 Conectado para Migração de Datas...');
  
  const Servico = mongoose.model('Servico', new mongoose.Schema({}, { strict: false, collection: 'servicos' }));
  const Missao = mongoose.model('Missao', new mongoose.Schema({}, { strict: false, collection: 'missoes' }));

  const servicos = await Servico.find({});
  let servUpdated = 0;
  for (const s of servicos) {
    const update = {};
    const processField = (val) => (val && typeof val === 'string' && val.includes('/')) ? toISO(val) : null;

    const dataEntNew = processField(s.Data_Ent);
    const dataEnvioNew = processField(s.Data_Envio);
    const dataRetornoNew = processField(s.Data_Retorno);
    const dataSaidaNew = processField(s.Data_Saida);

    if (dataEntNew) update.Data_Ent = dataEntNew;
    if (dataEnvioNew) update.Data_Envio = dataEnvioNew;
    if (dataRetornoNew) update.Data_Retorno = dataRetornoNew;
    if (dataSaidaNew) update.Data_Saida = dataSaidaNew;
    
    if (Object.keys(update).length > 0) {
      await Servico.updateOne({ _id: s._id }, { $set: update });
      servUpdated++;
    }
  }

  const missoes = await Missao.find({});
  let missUpdated = 0;
  for (const m of missoes) {
    if (m.data && m.data.includes('/')) {
      await Missao.updateOne({ _id: m._id }, { $set: { data: toISO(m.data) } });
      missUpdated++;
    }
  }

  console.log(`✅ MIGRAÇÃO CONCLUÍDA! Serviços ajustados: ${servUpdated}, Missões ajustadas: ${missUpdated}`);
  process.exit(0);
}).catch(err => {
  console.error('❌ Erro técnico na migração:', err);
  process.exit(1);
});
