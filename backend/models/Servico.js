const mongoose = require('mongoose');

const ServicoSchema = new mongoose.Schema({
  Id_cod: { type: Number, unique: true },
  Data_Ent: Date,
  Tecnico: String,
  Seção_Ditel: String,
  T_EquipTelecom: String,
  T_EquipSuporte: String,
  Solicitante: String,
  Unidade: String,
  Nº_PAE: String,
  RP: String,
  Nº_Serie: String,
  Defeito_Recl: String,
  Analise_Tecnica: String,
  Serviço: String,
  Garantia: String,
  Data_Envio: Date,
  Data_Retorno: Date,
  Data_Saida: String,
  Bateria: String,
  telefone: String,
  Laudo_Tecnico: String,
  fonteCabo: Boolean
}, {
  timestamps: true,
  collection: 'servicos'
});

module.exports = mongoose.model('Servico', ServicoSchema);
