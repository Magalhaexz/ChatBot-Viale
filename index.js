import dotenv from 'dotenv';
import './bot.js';
import './server.js';
import { testEmailConnection } from './email.js';

// Carregar variáveis de ambiente
dotenv.config();

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🤖 CHATBOT DE VIAGENS - SISTEMA COMPLETO');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// Verificar configurações
console.log('📋 Verificando Configurações:\n');

// 1. Porta do servidor
const PORT = process.env.PORT || 3000;
console.log(`✅ Porta do servidor: ${PORT}`);

// 2. Nome do bot
const BOT_NAME = process.env.BOT_NAME || 'Assistente de Viagens';
console.log(`✅ Nome do bot: ${BOT_NAME}`);

// 3. Telefone de notificação
if (process.env.NOTIFY_PHONE) {
  console.log(`✅ Notificações WhatsApp: ${process.env.NOTIFY_PHONE}`);
} else {
  console.log('⚠️  Notificações WhatsApp: Não configurado');
}

// 4. Email
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  console.log(`✅ Email configurado: ${process.env.EMAIL_USER}`);
  console.log(`✅ Destino dos emails: ${process.env.EMAIL_TO || process.env.EMAIL_USER}`);
  
  // Testar conexão de email
  testEmailConnection().then(success => {
    if (success) {
      console.log('✅ Conexão com servidor de email: OK\n');
    } else {
      console.log('❌ Conexão com servidor de email: FALHOU\n');
      console.log('⚠️  Verifique suas credenciais de email no arquivo .env\n');
    }
  });
} else {
  console.log('⚠️  Email: Não configurado (configure para receber notificações)');
  console.log('   Configure EMAIL_USER e EMAIL_PASS no arquivo .env\n');
}

// 5. Google Sheets
if (process.env.GOOGLE_SHEETS_ID && process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL) {
  console.log(`✅ Google Sheets: Configurado (ID: ${process.env.GOOGLE_SHEETS_ID.substring(0, 10)}...)`);
} else {
  console.log('ℹ️  Google Sheets: Não configurado (opcional)');
}

console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📱 Aguarde a conexão do WhatsApp...');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
