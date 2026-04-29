const mongoose = require('mongoose');

const chamadoSchema = new mongoose.Schema({
  protocolo: {
    type: String,
    required: true,
    unique: true
  },
  unidadeSolicitante: {
    type: String,
    required: true
  },
  nomeSolicitante: {
    type: String,
    required: true
  },
  contato: {
    type: String,
    required: true
  },
  tipoDemanda: {
    type: String,
    required: true
  },
  urgencia: {
    type: String,
    enum: ['baixa', 'normal', 'alta', 'critica'],
    default: 'normal'
  },
  // Campos dinâmicos baseados no tipo de demanda
  numeroSerie: { type: String, default: '' },
  quantidade: { type: Number, default: 0 },
  boletimOcorrencia: { type: String, default: '' },
  unidadeDestino: { type: String, default: '' },
  
  descricao: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'em_analise', 'aprovado', 'recusado'],
    default: 'pendente'
  },
  dataAbertura: {
    type: Date,
    default: Date.now
  },
  dataResolucao: {
    type: Date
  },
  respostaDitel: {
    type: String,
    default: ''
  }
});

module.exports = mongoose.model('Chamado', chamadoSchema);
