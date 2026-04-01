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
    // Processa e verifica com o segredo (definido no servidor)
    const SECRET = process.env.JWT_SECRET || 'DitelPMPA!2026@Segredo';
    const chaveDecodificada = jwt.verify(token, SECRET);
    
    // Anexa as informações do usuário logado na requisição para as próximas rotas usarem se quiserem
    req.usuario = chaveDecodificada;
    next(); 
  } catch (err) {
    res.status(403).json({ error: 'Sessão Expirada ou Token Inválido. Faça o login novamente.' });
  }
};

module.exports = verificarToken;
