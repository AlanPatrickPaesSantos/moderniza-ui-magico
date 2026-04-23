const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  // Pega o token do cabeçalho de autorização ou do corpo da requisição
  const headerAuth = req.headers['authorization'];
  
  // Format: "Bearer <token>"
  const token = headerAuth && headerAuth.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Acesso Negado: Nenhum token de autenticação fornecido. Você deve se logar no DITEL.' });
  }

  try {
    // Processa e verifica com o segredo (Deve ser IDÊNTICO ao do server.js)
    const SECRET = process.env.JWT_SECRET || 'DitelPMPA-Seguranca-Fixa-2026';
    const chaveDecodificada = jwt.verify(token, SECRET);
    
    // Anexa as informações do usuário logado na requisição (usando 'user' para compatibilidade)
    req.user = chaveDecodificada;
    next(); 
  } catch (err) {
    res.status(401).json({ error: 'Sessão Expirada ou Token Inválido. Faça o login novamente.' });
  }
};

module.exports = verificarToken;
