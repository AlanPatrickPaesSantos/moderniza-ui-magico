const mongoose = require('mongoose');

const relatorioQualidadeSchema = new mongoose.Schema({
  unidade: {
    type: String,
    required: true
  },
  oficialResponsavel: {
    type: String,
    required: true
  },
  mesReferencia: {
    type: String, // ex: "2026-04"
    required: true
  },
  statusGeral: {
    type: String,
    enum: ['Excelente', 'Boa', 'Com falhas', 'Critica'],
    required: true
  },
  maiorNecessidade: {
    type: String,
    enum: ['Radios HT', 'Radios Moveis', 'Baterias', 'Repetidoras', 'Manutencao', 'Nenhuma'],
    required: true
  },
  qtdOperantes: {
    type: Number,
    required: true,
    default: 0
  },
  qtdInoperantes: {
    type: Number,
    required: true,
    default: 0
  },
  relatorioLivre: {
    type: String,
    default: ''
  },
  dataEnvio: {
    type: Date,
    default: Date.now
  }
});

// Garantir que cada unidade só envie 1 relatório por mês
relatorioQualidadeSchema.index({ unidade: 1, mesReferencia: 1 }, { unique: true });

module.exports = mongoose.model('RelatorioQualidade', relatorioQualidadeSchema);
