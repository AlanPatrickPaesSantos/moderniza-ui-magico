const mongoose = require('mongoose');

const MissaoSchema = new mongoose.Schema({
  os: { type: Number, unique: true },
  secao: String,
  unidade: { type: String, index: true },
  data: { type: Date, index: true },
  horario: String,
  tecnicos: String,
  def_recla: String,
  solicitante: { type: String, index: true },
  n_pae: String,
  servico: { type: String, index: true },
  analise: String,
  observacao: String,
  solucao: String
}, {
  timestamps: true,
  collection: 'missoes'
});

module.exports = mongoose.model('Missao', MissaoSchema);
