import { sendEmailNotification, testEmailConnection } from './src/email.js';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 Testando configuração de email...\n');

// Testar conexão
const connectionOk = await testEmailConnection();

if (!connectionOk) {
  console.log('\n❌ Configuração de email com problema.');
  console.log('\n📝 Verifique:');
  console.log('1. Arquivo .env existe?');
  console.log('2. EMAIL_USER está configurado?');
  console.log('3. EMAIL_PASS está correto (senha de app)?');
  console.log('4. Verificação em 2 etapas ativada no Gmail?');
  process.exit(1);
}

console.log('\n✅ Conexão OK! Enviando email de teste...\n');

// Lead de teste
const testLead = {
  id: Date.now(),
  phone: '5562999999999',
  tipo_viagem: 'Aéreo',
  destino: 'Paris',
  periodo: 'Julho',
  num_passageiros: '2',
  idades: '2 adultos',
  orcamento: 'R$ 15.000',
  created_at: new Date().toISOString()
};

// Enviar email de teste
const emailSent = await sendEmailNotification(testLead);

if (emailSent) {
  console.log('\n✅ Email de teste enviado com sucesso!');
  console.log(`📧 Verifique a caixa de entrada de: ${process.env.EMAIL_TO || process.env.EMAIL_USER}`);
} else {
  console.log('\n❌ Falha ao enviar email de teste');
  console.log('\n📝 Verifique os logs acima para mais detalhes');
}

console.log('\n🎉 Teste concluído!\n');
