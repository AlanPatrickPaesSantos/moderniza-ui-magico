const mongoose = require('mongoose');

const ServicoSchema = new mongoose.Schema({
  Id_cod: { type: Number, unique: true },
  Data_Ent: { type: Date, index: true },
  Tecnico: String,
  Seção_Ditel: String,
  T_EquipTelecom: String,
  T_EquipSuporte: String,
  Solicitante: { type: String, index: true },
  Unidade: { type: String, index: true },
  Nº_PAE: String,
  RP: { type: String, index: true },
  Nº_Serie: { type: String, index: true },
  Defeito_Recl: String,
  Analise_Tecnica: String,
  Serviço: { type: String, index: true },
  Garantia: String,
  Data_Envio: Date,
  Data_Retorno: Date,
  Data_Saida: Date,
  Bateria: String,
  telefone: String,
  Laudo_Tecnico: String,
  fonteCabo: Boolean
}, {
  timestamps: true,
  collection: 'servicos'
});

module.exports = mongoose.model('Servico', ServicoSchema);
