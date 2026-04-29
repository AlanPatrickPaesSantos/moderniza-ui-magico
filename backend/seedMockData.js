const mongoose = require('mongoose');
const Chamado = require('./models/Chamado');
const RelatorioQualidade = require('./models/RelatorioQualidade');

const MONGODB_URI = "mongodb://ALAN:Al%402131@ac-co9oixe-shard-00-00.orghwak.mongodb.net:27017,ac-co9oixe-shard-00-01.orghwak.mongodb.net:27017,ac-co9oixe-shard-00-02.orghwak.mongodb.net:27017/teste?ssl=true&authSource=admin&retryWrites=true&w=majority";

const unidadesMock = [
  "CPR I - Santarém",
  "CPR II - Marabá",
  "CPR III - Castanhal",
  "CPR IV - Tucuruí",
  "1º BPM - Belém",
  "2º BPM - Belém",
  "3º BPM - Ananindeua"
];

const contatosMock = ["(91) 98888-1111", "(93) 99999-2222", "(94) 97777-3333"];
const solicitantesMock = ["Tenente Silva", "Capitão Mendes", "Sargento Oliveira", "Cabo Santos"];

const relatoriosMock = unidadesMock.map(unidade => {
  const isCritico = Math.random() > 0.8;
  const isExcelente = Math.random() > 0.7;
  let statusGeral = "Boa";
  if (isCritico) statusGeral = "Critica";
  else if (isExcelente) statusGeral = "Excelente";
  else if (Math.random() > 0.5) statusGeral = "Com falhas";

  return {
    unidade,
    oficialResponsavel: solicitantesMock[Math.floor(Math.random() * solicitantesMock.length)],
    statusGeral,
    maiorNecessidade: ['Radios HT', 'Radios Moveis', 'Baterias', 'Repetidoras', 'Manutencao', 'Nenhuma'][Math.floor(Math.random() * 6)],
    qtdOperantes: Math.floor(Math.random() * 50) + 20,
    qtdInoperantes: isCritico ? Math.floor(Math.random() * 30) + 10 : Math.floor(Math.random() * 5),
    relatorioLivre: "Estamos necessitando de atenção especial na região. " + (isCritico ? "Muitos equipamentos parando por bateria viciada." : "Situação sob controle mas requer preventivas."),
    mesReferencia: new Date().toISOString().substring(0, 7) // Ex: "2026-04"
  };
});

const chamadosMock = Array.from({ length: 8 }).map((_, i) => ({
  protocolo: `CH-${new Date().getFullYear()}${new Date().getMonth()+1}${new Date().getDate()}-${Math.floor(1000 + Math.random() * 9000)}`,
  unidadeSolicitante: unidadesMock[Math.floor(Math.random() * unidadesMock.length)],
  nomeSolicitante: solicitantesMock[Math.floor(Math.random() * solicitantesMock.length)],
  contato: contatosMock[Math.floor(Math.random() * contatosMock.length)],
  tipoDemanda: ["manutencao_radio", "substituicao_bateria", "transferencia", "outro"][Math.floor(Math.random() * 4)],
  urgencia: Math.random() > 0.7 ? "critica" : "normal",
  descricao: "Rádio apresentando falhas intermitentes de transmissão durante o patrulhamento. Necessitamos de verificação ou substituição imediata, pois a equipe está operando com rádio pessoal em algumas ocorrências.",
  status: ["pendente", "em_analise", "aprovado"][Math.floor(Math.random() * 3)],
  createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 86400000) // Dias aleatórios no passado
}));

async function seed() {
  try {
    console.log("Conectando ao banco...");
    await mongoose.connect(MONGODB_URI);
    console.log("Conectado! Limpando dados antigos...");
    
    // Limpar coleções
    await Chamado.deleteMany({});
    await RelatorioQualidade.deleteMany({});

    console.log("Inserindo dados falsos...");
    await Chamado.insertMany(chamadosMock);
    await RelatorioQualidade.insertMany(relatoriosMock);

    console.log("Seed concluído com sucesso!");
  } catch (error) {
    console.error("Erro no seed:", error);
  } finally {
    mongoose.disconnect();
  }
}

seed();
