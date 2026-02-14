// Armazena o estado da conversa de cada usuário
export const users = {};

// Função para limpar sessões antigas (mais de 24h)
export function cleanOldSessions() {
  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;
  
  for (const phone in users) {
    if (now - users[phone].timestamp > dayInMs) {
      delete users[phone];
      console.log(`🧹 Sessão expirada removida: ${phone}`);
    }
  }
}

// Limpar sessões antigas a cada hora
setInterval(cleanOldSessions, 60 * 60 * 1000);
