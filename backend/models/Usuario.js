const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  nomeCompleto: {
    type: String,
    required: false
  },
  papel: {
    type: String,
    enum: ['admin', 'operador', 'visualizador'],
    default: 'operador'
  },
  unidadeVinculada: {
    type: String,
    required: false,
    default: 'DITEL' // O padrão será DITEL para usuários antigos
  },
  dataCriacao: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Usuario', usuarioSchema);
