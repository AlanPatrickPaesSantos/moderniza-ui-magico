const mongoose = require('mongoose');

const MissaoSchema = new mongoose.Schema({
  os: { type: Number, unique: true },
  secao: String,
  unidade: String,
  data: String,
  horario: String,
  tecnicos: String,
  def_recla: String,
  solicitante: String,
  n_pae: String,
  servico: String,
  analise: String,
  observacao: String,
  solucao: String
}, {
  timestamps: true,
  collection: 'missoes'
});

module.exports = mongoose.model('Missao', MissaoSchema);
