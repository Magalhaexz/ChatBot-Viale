# ⚡ GUIA RÁPIDO - 5 MINUTOS

## ✅ Antes de Começar

- [ ] Node.js instalado? [Baixar aqui](https://nodejs.org)
- [ ] WhatsApp disponível no celular?
- [ ] Gmail configurado?

---

## 🚀 Instalação em 5 Passos

### 1️⃣ Instalar

```bash
npm install
```

⏳ Aguarde 2-3 minutos...

---

### 2️⃣ Configurar Email

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

**Configure sua senha de app do Gmail:**

1. Acesse: https://myaccount.google.com/security
2. Ative **Verificação em 2 etapas**
3. Crie uma **Senha de app**
4. Copie a senha gerada

Edite o arquivo `.env`:

```env
# Seu número (formato: 5562999999999)
NOTIFY_PHONE=5562999999999

# Gmail (OBRIGATÓRIO)
EMAIL_USER=seuemail@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx  # ← Cole a senha de app aqui
EMAIL_TO=vendas@suaagencia.com  # ← Email que receberá os orçamentos
```

---

### 3️⃣ Iniciar

```bash
npm start
```

---

### 4️⃣ Conectar WhatsApp

1. **Escaneie o QR Code** que apareceu no terminal
2. Aguarde: "✅ Bot conectado e pronto!"

---

### 5️⃣ Testar

**Envie de outro celular:**

```
Olá
```

O bot deve responder! 🤖

---

## 🎉 PRONTO!

### Acesse o Painel

```
http://localhost:3000
```

### Recursos Disponíveis

✅ **Email automático** - Cada orçamento enviado para seu email
✅ **Download Excel** - Clique no botão "📥 Baixar Excel"
✅ **Painel em tempo real** - Veja todos os leads
✅ **Busca e filtros** - Encontre rapidamente

---

## 📥 Baixar Excel

No painel, clique em **"📥 Baixar Excel"**

Ou via terminal:

```bash
curl -O http://localhost:3000/api/export/excel
```

---

## ❓ Problemas?

### QR Code não aparece?

```bash
# Pare (Ctrl+C) e reinicie
npm start
```

### Email não envia?

1. Verifique se usou **senha de app** (não a senha normal)
2. Verifique se ativou **Verificação em 2 etapas**

### Porta 3000 em uso?

No `.env`, mude para outra porta:

```env
PORT=3001
```

Acesse: `http://localhost:3001`

---

## 🎯 Teste Completo

1. Envie "Olá" → Bot responde
2. Digite "1" (Orçamento)
3. Escolha "1" (Aéreo)
4. Destino: "Paris"
5. Período: "Julho"
6. Passageiros: "2"
7. Idades: "2 adultos"
8. Orçamento: "R$ 15000"

✅ Verifique seu email! 📧
✅ Veja no painel! 📊
✅ Baixe o Excel! 📥

---

## 💡 Google Sheets (Opcional)

Quer integrar com Google Sheets? Veja instruções completas no **README.md**

---

## 🔥 Manter Rodando 24/7

```bash
# Instalar PM2
npm install -g pm2

# Iniciar
pm2 start src/index.js --name chatbot

# Ver status
pm2 status

# Parar
pm2 stop chatbot
```

---

**🎊 Tudo funcionando? Agora você tem um sistema profissional de captação de leads!**

Para mais detalhes, veja o **README.md** completo.
