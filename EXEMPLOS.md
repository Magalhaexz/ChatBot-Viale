# 📚 EXEMPLOS PRÁTICOS

## 🎯 Casos de Uso Comuns

### 1. Configurar Email do Gmail

**Passo a passo:**

1. Acesse https://myaccount.google.com/security
2. Role até "Como fazer login no Google"
3. Clique em "Verificação em duas etapas" → Ativar
4. Volte para Segurança
5. Clique em "Senhas de app"
6. Selecione "Outro (nome personalizado)"
7. Digite "Chatbot Viagens"
8. Clique em "Gerar"
9. **Copie a senha de 16 caracteres**

No arquivo `.env`:

```env
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # Cole aqui a senha gerada
EMAIL_TO=vendas@minhaagencia.com
```

---

### 2. Testar Email

Depois de configurar, teste:

```bash
npm run test-email
```

Você deve ver:

```
✅ Servidor de email está pronto para enviar mensagens
✅ Conexão OK! Enviando email de teste...
📧 Email enviado com sucesso
```

Verifique sua caixa de entrada!

---

### 3. Baixar Excel de Todos os Leads

**Opção 1: Pelo Painel**

1. Abra http://localhost:3000
2. Clique no botão "📥 Baixar Excel"
3. Arquivo baixado automaticamente!

**Opção 2: Via Terminal**

```bash
curl -O http://localhost:3000/api/export/excel
```

**Opção 3: No Navegador**

Acesse: http://localhost:3000/api/export/excel

---

### 4. Baixar Excel de um Período Específico

**Exemplo 1: Leads de Janeiro**

```bash
curl -O "http://localhost:3000/api/export/excel/date/2024-01-01/2024-01-31"
```

**Exemplo 2: Última semana**

```bash
# No Linux/Mac
curl -O "http://localhost:3000/api/export/excel/date/$(date -d '7 days ago' +%Y-%m-%d)/$(date +%Y-%m-%d)"
```

**No navegador:**

```
http://localhost:3000/api/export/excel/date/2024-01-01/2024-01-31
```

---

### 5. Buscar Leads pela API

**Todos os leads:**

```bash
curl http://localhost:3000/api/leads | jq
```

**Lead específico por ID:**

```bash
curl http://localhost:3000/api/leads/1707856234567 | jq
```

**Leads de um telefone:**

```bash
curl http://localhost:3000/api/leads/phone/5562999999999 | jq
```

**Estatísticas:**

```bash
curl http://localhost:3000/api/stats | jq
```

---

### 6. Integrar com Google Sheets

**Passo 1: Criar Projeto no Google Cloud**

1. Acesse: https://console.cloud.google.com
2. Crie novo projeto: "Chatbot Viagens"
3. Ative a API: "Google Sheets API"

**Passo 2: Criar Service Account**

1. Menu → IAM & Admin → Service Accounts
2. "Create Service Account"
3. Nome: "chatbot-sheets"
4. Clique em "Create and Continue"
5. Skip as próximas etapas
6. Clique no service account criado
7. Aba "Keys" → "Add Key" → "Create New Key"
8. Escolha JSON → Create
9. **Baixe o arquivo JSON**

**Passo 3: Configurar Planilha**

1. Crie uma planilha no Google Sheets
2. Copie o ID da URL:
   ```
   https://docs.google.com/spreadsheets/d/ABC123XYZ789/edit
                                            ^^^^^^^^^^^^
                                            Este é o ID
   ```
3. Abra o JSON baixado e copie o `client_email`
4. Compartilhe a planilha com este email (permissão de Editor)

**Passo 4: Configurar .env**

Abra o JSON e copie os valores:

```env
GOOGLE_SHEETS_ID=ABC123XYZ789
GOOGLE_SERVICE_ACCOUNT_EMAIL=chatbot-sheets@projeto.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEv...\n-----END PRIVATE KEY-----\n"
```

**⚠️ Importante:** A private key deve estar entre aspas e com `\n` preservados!

**Passo 5: Criar Cabeçalho**

Execute apenas uma vez:

```javascript
// Criar arquivo setup-sheets.js:
import { createSheetsHeader } from './src/googleSheets.js';
await createSheetsHeader();
```

```bash
node setup-sheets.js
```

Pronto! Agora todo lead novo será adicionado automaticamente!

---

### 7. Personalizar Mensagens do Bot

Edite `src/handleMessage.js`:

```javascript
// Linha ~10 - Mensagem de boas-vindas
const welcomeMessage = `👋 Olá! Bem-vindo à *Agência XYZ*!

Estou aqui para te ajudar! Escolha uma opção:

1️⃣ Solicitar Orçamento de Viagem
2️⃣ Falar com Atendente

Digite *1* ou *2*`;
```

---

### 8. Adicionar Novo Campo ao Orçamento

**Exemplo: Adicionar campo "Observações"**

Em `src/handleMessage.js`, adicione um novo step:

```javascript
export const steps = {
  // ... outros steps
  
  observacoes: {
    question: 'Alguma observação adicional? (Ex: alergia, mobilidade reduzida)\n\n_Digite "nao" se não tiver_',
    nextStep: 'confirmar',
    validate: (answer) => {
      return { valid: true };
    },
    saveAs: 'observacoes'
  },
  
  confirmar: {
    // ... resto do código
  }
};
```

No step anterior, altere o `nextStep`:

```javascript
orcamento: {
  question: '💰 Qual o orçamento disponível para a viagem?\n\n_Ex: R$ 5.000 por pessoa_',
  nextStep: 'observacoes',  // ← Era 'confirmar', agora é 'observacoes'
  // ...
}
```

Pronto! O campo será automaticamente:
- ✅ Salvo no JSON
- ✅ Enviado por email
- ✅ Incluído no Excel
- ✅ Adicionado ao Google Sheets

---

### 9. Integrar com CRM/Webhook

Edite `src/database.js`, na função `saveLead()`:

```javascript
export function saveLead(phone, data) {
  try {
    // ... código existente ...
    
    // Integrar com seu CRM
    fetch('https://seu-crm.com/api/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SEU_TOKEN_AQUI'
      },
      body: JSON.stringify({
        name: data.destino,
        phone: phone,
        email: '', // Se capturar
        custom_fields: {
          tipo_viagem: data.tipo_viagem,
          destino: data.destino,
          periodo: data.periodo,
          orcamento: data.orcamento
        }
      })
    }).catch(err => console.log('CRM integration error:', err));
    
    return lead;
  } catch (error) {
    // ...
  }
}
```

**Exemplos de CRMs:**
- RD Station
- HubSpot
- Pipedrive
- Salesforce
- ActiveCampaign

---

### 10. Rodar 24/7 no Servidor

**Usando PM2:**

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar o bot
pm2 start src/index.js --name chatbot-viagens

# Ver status
pm2 status

# Ver logs em tempo real
pm2 logs chatbot-viagens

# Parar
pm2 stop chatbot-viagens

# Reiniciar
pm2 restart chatbot-viagens

# Deletar
pm2 delete chatbot-viagens

# Salvar configuração para auto-start
pm2 save

# Configurar para iniciar no boot
pm2 startup
# Copie e execute o comando mostrado
```

**Logs:**

```bash
# Ver últimas 100 linhas
pm2 logs chatbot-viagens --lines 100

# Limpar logs
pm2 flush
```

---

### 11. Backup dos Dados

**Backup manual:**

```bash
# Copiar banco de dados
cp data/leads.json backup-leads-$(date +%Y%m%d).json

# Copiar exports
tar -czf backup-exports-$(date +%Y%m%d).tar.gz exports/
```

**Backup automático (cron):**

```bash
# Abrir crontab
crontab -e

# Adicionar backup diário às 3h
0 3 * * * cd /caminho/do/bot && cp data/leads.json backups/leads-$(date +\%Y\%m\%d).json
```

---

### 12. Monitorar o Bot

**Ver se está rodando:**

```bash
pm2 status
```

**Ver uso de recursos:**

```bash
pm2 monit
```

**Verificar API:**

```bash
curl http://localhost:3000/api/health
```

Resposta esperada:
```json
{
  "success": true,
  "status": "online",
  "timestamp": "2024-02-10T14:30:00.000Z"
}
```

---

### 13. Exportar Dados para Análise

**Converter JSON para CSV:**

```javascript
// script: json-to-csv.js
import fs from 'fs';

const leads = JSON.parse(fs.readFileSync('data/leads.json', 'utf8'));

const csv = [
  'ID,Data,Telefone,Tipo,Destino,Periodo,Passageiros,Orcamento',
  ...leads.map(l => 
    `${l.id},${l.created_at},${l.phone},${l.tipo_viagem},${l.destino},${l.periodo},${l.num_passageiros},${l.orcamento}`
  )
].join('\n');

fs.writeFileSync('leads.csv', csv);
console.log('✅ CSV gerado: leads.csv');
```

```bash
node json-to-csv.js
```

---

### 14. Personalizar Painel Web

Edite `public/index.html`:

**Mudar cores:**

```css
/* Linha ~80 - Gradiente principal */
background: linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%);

/* Linha ~200 - Cor dos cards */
color: #FF6B6B;
```

**Adicionar logo:**

```html
<!-- Linha ~500 - No header -->
<header>
    <img src="/logo.png" alt="Logo" style="height: 50px;">
    <h1>Minha Agência</h1>
    <!-- ... -->
</header>
```

---

### 15. Adicionar Múltiplos Destinos

Para empresas com filiais:

```javascript
// src/handleMessage.js

destino: {
  question: `🌍 Para qual destino você gostaria de viajar?

*BRASIL:*
1️⃣ Fernando de Noronha
2️⃣ Rio de Janeiro
3️⃣ Salvador

*INTERNACIONAL:*
4️⃣ Paris
5️⃣ Nova York
6️⃣ Dubai

Ou digite o destino desejado:`,
  nextStep: 'periodo',
  validate: (answer) => {
    const destinos = {
      '1': 'Fernando de Noronha',
      '2': 'Rio de Janeiro',
      '3': 'Salvador',
      '4': 'Paris',
      '5': 'Nova York',
      '6': 'Dubai'
    };
    
    const destino = destinos[answer] || answer;
    return { valid: true, value: destino };
  },
  saveAs: 'destino'
}
```

---

## 🎉 Próximos Passos

Agora que você domina o básico, explore:

1. ✨ Adicionar campos customizados
2. 📊 Criar dashboards com gráficos
3. 🔗 Integrar com seu CRM favorito
4. 📧 Personalizar templates de email
5. 🤖 Adicionar respostas com IA (GPT)
6. 📱 Criar app mobile do painel
7. 🌐 Deploy em produção (VPS ou cloud)

**Divirta-se! 🚀**
