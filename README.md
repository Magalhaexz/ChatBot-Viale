# 🤖 Chatbot de Viagens Completo - WhatsApp

Sistema completo de atendimento automatizado para agências de viagens via WhatsApp com:
- ✅ Envio automático por **Email**
- ✅ Exportação para **Excel** 
- ✅ Integração com **Google Sheets** (opcional)
- ✅ Painel administrativo web em tempo real
- ✅ Download de relatórios

---

## 🚀 Instalação Rápida

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Email e Outras Opções

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
# Servidor
PORT=3000
BOT_NAME=Assistente de Viagens

# WhatsApp
NOTIFY_PHONE=5562999999999

# ========== EMAIL (OBRIGATÓRIO PARA NOTIFICAÇÕES) ==========
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
EMAIL_TO=vendas@suaagencia.com

# ========== GOOGLE SHEETS (OPCIONAL) ==========
GOOGLE_SHEETS_ID=
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
```

### 3. Iniciar o Bot

```bash
npm start
```

### 4. Conectar WhatsApp

1. Escaneie o QR Code que aparecer no terminal
2. Aguarde a mensagem "✅ Bot conectado e pronto!"

---

## 📧 Configurar Email (Gmail)

### Passo 1: Criar Senha de App no Gmail

1. Acesse: https://myaccount.google.com/security
2. Ative a **Verificação em duas etapas**
3. Em "Senhas de app", crie uma nova senha
4. Escolha "Outro (nome personalizado)" → "Chatbot Viagens"
5. **Copie a senha gerada** (16 caracteres)

### Passo 2: Configurar no .env

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # Senha de app (cole aqui)
EMAIL_TO=vendas@suaagencia.com   # Email que receberá os orçamentos
```

### Passo 3: Testar

Quando um novo orçamento for recebido, você receberá automaticamente um email com:
- Dados completos do cliente
- Protocolo do atendimento
- Formato profissional em HTML

---

## 📊 Exportar para Excel

### Download pelo Painel

1. Acesse: `http://localhost:3000`
2. Clique no botão **"📥 Baixar Excel"**
3. O arquivo será baixado automaticamente

### Download via API

```bash
# Baixar todos os leads
curl -O http://localhost:3000/api/export/excel

# Baixar leads de um período específico
curl -O "http://localhost:3000/api/export/excel/date/2024-01-01/2024-12-31"
```

### O que o Excel contém?

- ✅ Cabeçalho estilizado (azul com texto branco)
- ✅ Todas as colunas: Protocolo, Data, Telefone, Tipo, Destino, etc.
- ✅ Linhas alternadas (zebra striping)
- ✅ Filtros automáticos
- ✅ Bordas e formatação profissional
- ✅ Rodapé com estatísticas

---

## 📱 Integração com Google Sheets (Opcional)

Permite que todos os orçamentos sejam adicionados automaticamente a uma planilha do Google.

### Passo 1: Criar Service Account

1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto (ou use existente)
3. Ative a **Google Sheets API**
4. Vá em **Credenciais** → **Criar credenciais** → **Conta de serviço**
5. Baixe o JSON da conta de serviço

### Passo 2: Configurar Planilha

1. Crie uma planilha no Google Sheets
2. Copie o ID da planilha (da URL)
3. Compartilhe a planilha com o email da service account

### Passo 3: Configurar no .env

Abra o JSON baixado e copie:

```env
GOOGLE_SHEETS_ID=1abc123xyz789  # ID da planilha
GOOGLE_SERVICE_ACCOUNT_EMAIL=chatbot@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nXXXXXX\n-----END PRIVATE KEY-----\n"
```

### Passo 4: Criar Cabeçalho (Primeira Vez)

Edite `src/index.js` e adicione após iniciar o bot:

```javascript
import { createSheetsHeader } from './googleSheets.js';

// Executar apenas uma vez
await createSheetsHeader();
```

Depois remova ou comente esta linha.

---

## 🎯 Funcionalidades Principais

### 1. Atendimento Automatizado

O bot captura as seguintes informações:
- Tipo de viagem (Aéreo, Rodoviário, Marítimo, Pacote Completo)
- Destino
- Período de viagem
- Número de passageiros
- Idades dos passageiros
- Orçamento disponível

### 2. Notificações Automáticas

Quando um novo orçamento é recebido:
- ✅ Email enviado automaticamente
- ✅ Lead salvo no banco de dados (JSON)
- ✅ Excel individual criado (pasta `/exports`)
- ✅ Adicionado ao Google Sheets (se configurado)
- ✅ Notificação via WhatsApp para equipe

### 3. Painel Administrativo

Acesse: `http://localhost:3000`

**Recursos:**
- 📊 Estatísticas em tempo real
- 🔍 Busca e filtros
- 📥 Download Excel
- 🔄 Auto-refresh (30s)
- 📱 Responsivo (mobile)

### 4. API REST

```bash
# Listar todos os leads
GET /api/leads

# Buscar por ID
GET /api/leads/:id

# Buscar por telefone
GET /api/leads/phone/:phone

# Estatísticas
GET /api/stats

# Download Excel
GET /api/export/excel

# Download Excel por período
GET /api/export/excel/date/:startDate/:endDate
```

---

## 📁 Estrutura de Arquivos

```
chatbot-viagens-melhorado/
├── src/
│   ├── index.js          # Inicializador principal
│   ├── bot.js            # Cliente WhatsApp
│   ├── handleMessage.js  # Lógica do chatbot
│   ├── database.js       # Persistência de dados
│   ├── email.js          # ✨ Envio de emails
│   ├── excel.js          # ✨ Exportação Excel
│   ├── googleSheets.js   # ✨ Integração Google Sheets
│   ├── server.js         # API e servidor web
│   └── users.js          # Gerenciamento de sessões
├── public/
│   └── index.html        # Painel administrativo
├── data/
│   └── leads.json        # Banco de dados
├── exports/              # ✨ Arquivos Excel gerados
├── .env                  # Configurações
└── package.json
```

---

## 🔧 Comandos Úteis

```bash
# Iniciar o bot
npm start

# Modo desenvolvedor (auto-reload)
npm run dev

# Testar apenas o servidor web
node src/server.js

# Ver logs em tempo real
tail -f logs/bot.log  # Se configurar logging
```

---

## 📧 Exemplo de Email Recebido

```
De: Assistente de Viagens <seu-email@gmail.com>
Para: vendas@suaagencia.com
Assunto: 🎯 Novo Orçamento #1707856234567 - Paris

[Email HTML formatado com todas as informações]

Protocolo: #1707856234567
Telefone: +55 62 99999-9999
Tipo de Viagem: Aéreo
Destino: Paris
Período: Julho
Passageiros: 2
Idades: 2 adultos
Orçamento: R$ 15.000
Recebido em: 10/02/2026 às 14:30
```

---

## 📊 Exemplo de Excel Gerado

| Protocolo | Data/Hora | Telefone | Tipo de Viagem | Destino | Período | Nº Passageiros | Idades | Orçamento |
|-----------|-----------|----------|----------------|---------|---------|----------------|--------|-----------|
| #1707856234567 | 10/02/2026 14:30 | +55 62 99999-9999 | Aéreo | Paris | Julho | 2 | 2 adultos | R$ 15.000 |

✅ Com cabeçalho colorido, bordas, filtros e zebra striping!

---

## 🛠 Personalização

### Alterar Mensagens do Bot

Edite `src/handleMessage.js`

### Adicionar Campos ao Orçamento

1. Adicione novo `step` em `handleMessage.js`
2. Salve em `user.data.nome_campo`
3. Será automaticamente salvo no JSON, Email e Excel

### Integrar com CRM

Edite `src/database.js`, função `saveLead()`:

```javascript
// Adicionar após salvar no JSON
await fetch('https://seu-crm.com/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(lead)
});
```

---

## ⚠️ Solução de Problemas

### Email não está sendo enviado

1. Verifique se configurou corretamente o `.env`
2. Use **senha de app** do Gmail (não a senha normal)
3. Ative "Verificação em 2 etapas" no Gmail
4. Veja os logs: procure por mensagens com 📧

### Excel não baixa

1. Verifique se há leads no banco
2. Abra o console do navegador (F12)
3. Tente via API: `curl -O http://localhost:3000/api/export/excel`

### Google Sheets não atualiza

1. Verifique se o service account tem acesso à planilha
2. Certifique-se que a `GOOGLE_PRIVATE_KEY` está com `\n` corretos
3. Crie o cabeçalho primeiro: `createSheetsHeader()`

---

## 🚀 Deploy em Produção

### Opção 1: VPS (Digital Ocean, AWS, etc)

```bash
# Instalar PM2
npm install -g pm2

# Iniciar com PM2
pm2 start src/index.js --name chatbot-viagens

# Salvar configuração
pm2 save

# Auto-start no boot
pm2 startup
```

### Opção 2: Render.com / Railway.app

1. Conecte seu repositório Git
2. Configure as variáveis de ambiente
3. Deploy automático!

**⚠️ Atenção:** WhatsApp Web.js precisa de Chrome/Chromium. Em alguns hosts pode ser necessário usar a API oficial do WhatsApp Business.

---

## 📝 Licença

MIT - Livre para uso comercial e pessoal.

---

## 🆘 Suporte

- 📧 Email: suporte@suaagencia.com
- 💬 Issues: Abra uma issue no GitHub
- 📚 Docs WhatsApp Web.js: https://wwebjs.dev

---

## ✨ Recursos Futuros

- [ ] Dashboard com gráficos (Chart.js)
- [ ] Exportar para PDF
- [ ] Enviar orçamento por WhatsApp
- [ ] Integração com Zapier
- [ ] Multi-atendentes
- [ ] IA para respostas (GPT)
- [ ] Agendamento de follow-up

---

**Desenvolvido com ❤️ para facilitar o atendimento de agências de viagens**

🎉 **Agora você tem um sistema completo de captação de leads com email, Excel e muito mais!**
