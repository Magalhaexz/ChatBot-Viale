import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configurar transporter do email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT) || 587,
  secure: false, // true para porta 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envia email com os dados do orçamento
 */
export async function sendEmailNotification(lead) {
  // Verificar se as credenciais de email estão configuradas
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('⚠️  Email não configurado. Configure EMAIL_USER e EMAIL_PASS no .env');
    return false;
  }

  try {
    const emailHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
          }
          .container {
            background-color: white;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          h1 {
            color: #667eea;
            border-bottom: 3px solid #764ba2;
            padding-bottom: 10px;
          }
          .info-row {
            margin: 15px 0;
            padding: 10px;
            background-color: #f8f9fa;
            border-left: 4px solid #667eea;
          }
          .label {
            font-weight: bold;
            color: #333;
          }
          .value {
            color: #555;
            margin-left: 10px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #888;
            font-size: 12px;
          }
          .protocol {
            background-color: #667eea;
            color: white;
            padding: 15px;
            border-radius: 5px;
            text-align: center;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🎯 Novo Orçamento de Viagem Recebido!</h1>
          
          <div class="protocol">
            <strong>Protocolo:</strong> #${lead.id}
          </div>

          <div class="info-row">
            <span class="label">📱 Telefone:</span>
            <span class="value">${lead.phone}</span>
          </div>

          <div class="info-row">
            <span class="label">✈️ Tipo de Viagem:</span>
            <span class="value">${lead.tipo_viagem}</span>
          </div>

          <div class="info-row">
            <span class="label">🌍 Destino:</span>
            <span class="value">${lead.destino}</span>
          </div>

          <div class="info-row">
            <span class="label">📅 Período:</span>
            <span class="value">${lead.periodo}</span>
          </div>

          <div class="info-row">
            <span class="label">👥 Número de Passageiros:</span>
            <span class="value">${lead.num_passageiros}</span>
          </div>

          <div class="info-row">
            <span class="label">👶 Idades:</span>
            <span class="value">${lead.idades}</span>
          </div>

          <div class="info-row">
            <span class="label">💰 Orçamento:</span>
            <span class="value">${lead.orcamento}</span>
          </div>

          <div class="info-row">
            <span class="label">🕐 Recebido em:</span>
            <span class="value">${new Date(lead.created_at).toLocaleString('pt-BR')}</span>
          </div>

          <div class="footer">
            <p>Este email foi gerado automaticamente pelo sistema de chatbot.</p>
            <p>Acesse o painel administrativo para mais detalhes.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
Novo Orçamento de Viagem Recebido!

Protocolo: #${lead.id}
Telefone: ${lead.phone}
Tipo de Viagem: ${lead.tipo_viagem}
Destino: ${lead.destino}
Período: ${lead.periodo}
Passageiros: ${lead.num_passageiros}
Idades: ${lead.idades}
Orçamento: ${lead.orcamento}
Recebido em: ${new Date(lead.created_at).toLocaleString('pt-BR')}
    `;

    // Enviar email
    const info = await transporter.sendMail({
      from: `"${process.env.BOT_NAME || 'Chatbot Viagens'}" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `🎯 Novo Orçamento #${lead.id} - ${lead.destino}`,
      text: emailText,
      html: emailHTML,
    });

    console.log('📧 Email enviado com sucesso:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error.message);
    return false;
  }
}

/**
 * Testa a configuração de email
 */
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Servidor de email está pronto para enviar mensagens');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração de email:', error.message);
    return false;
  }
}
