require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/Usuario');

const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('🚨 Uso incorreto. Para rodar, digite: node criar-usuario.js <nome_do_usuario> <senha>');
  console.log('Exemplo: node criar-usuario.js admin senha123');
  process.exit(1);
}

const [username, plainPassword] = args;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ditel-v2')
  .then(async () => {
    console.log('✅ Conectado ao banco. Preparando para criar usuário...');

    // Verifica se já existe
    const existe = await Usuario.findOne({ username });
    if (existe) {
      console.log(`⚠️ Já existe um usuário com o login: "${username}". Processo abortado.`);
      process.exit(1);
    }

    // Criptografa a senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(plainPassword, salt);

    // Salva o usuario
    const novoUsuario = new Usuario({
      username,
      password: hashedPassword,
      papel: 'admin'
    });

    await novoUsuario.save();
    console.log(`🎉 Sucesso! Usuário "${username}" foi criado com a senha criptografada militarmente!`);
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Erro no Script:', err);
    process.exit(1);
  });
