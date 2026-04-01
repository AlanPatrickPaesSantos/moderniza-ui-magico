const mongoose = require('mongoose');

const UnidadeSchema = new mongoose.Schema({
  ID_UNID_SEÇÃO: { type: Number, unique: true },
  UNIDADE: String
}, {
  timestamps: true,
  collection: 'unidades'
});

module.exports = mongoose.model('Unidade', UnidadeSchema);
