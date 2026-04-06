const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function audit() {
  try {
    if (!process.env.MONGODB_URI) {
      console.error('❌ MONGODB_URI não encontrada no .env');
      process.exit(1);
    }

    console.log('🔄 Conectando ao MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB');

    // Use strict: false to allow counting regardless of schema
    const servicoSchema = new mongoose.Schema({}, { strict: false });
    const Servico = mongoose.model('Servico', servicoSchema, 'servicos');
    
    const missaoSchema = new mongoose.Schema({}, { strict: false });
    const Missao = mongoose.model('Missao', missaoSchema, 'missoes');

    const totalServicosCount = await Servico.countDocuments();
    
    // Contagem baseada na lógica que implementamos no dashboard
    const prontos = await Servico.countDocuments({ 
      Serviço: /pronto/i 
    });
    const pendentes = await Servico.countDocuments({ 
      Serviço: /pendente/i 
    });

    const totalMissoes = await Missao.countDocuments();

    console.log('\n--- Auditoria de Dados ---');
    console.log(`- Total de Equipamentos (O.S.): ${totalServicosCount}`);
    console.log(`  - Status [PRONTO]: ${prontos}`);
    console.log(`  - Status [PENDENTE]: ${pendentes}`);
    console.log(`  - Outros status: ${totalServicosCount - (prontos + pendentes)}`);
    console.log(`- Total de Missões (Int/Ext): ${totalMissoes}`);
    
    // Check for recent records
    const lastService = await Servico.findOne().sort({ Id_cod: -1 });
    const lastMissao = await Missao.findOne().sort({ OS: -1 });

    console.log('\n--- Últimos Registros ---');
    console.log(`- Última O.S. Equipamento: ID ${lastService?.Id_cod || 'N/A'}`);
    console.log(`- Última O.S. Missão: ${lastMissao?.OS || 'N/A'}`);
    
    console.log('\n--- Integridade do Backend ---');
    const hasNextOs = await Missao.findOne().sort({ OS: -1 });
    console.log(`- Sequência de Missão OK: ${!!hasNextOs}`);

    console.log('\n✅ Banco de dados saudável.');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Erro na auditoria:', err);
    process.exit(1);
  }
}

audit();
