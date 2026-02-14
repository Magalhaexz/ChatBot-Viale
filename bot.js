import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;

import qrcode from "qrcode-terminal";
import { handleMessage } from "./handleMessage.js";

console.log("🤖 Iniciando Chatbot VIALE TURISMO...");

const client = new Client({
  authStrategy: new LocalAuth({ clientId: "viale-bot" }),
  puppeteer: {
    headless: true,
    executablePath: (process.env.PUPPETEER_EXECUTABLE_PATH || "").trim(),
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  },
});

client.on("qr", (qr) => {
  console.log("\n📱 Escaneie o QR Code abaixo com seu WhatsApp:\n");
  qrcode.generate(qr, { small: true });
  console.log("\n🔄 Aguardando conexão...\n");
});

client.on("ready", () => {
  console.log("✅ Bot conectado e pronto!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🚀 Sistema: ONLINE");
  console.log("⏰ Hora:", new Date().toLocaleString("pt-BR"));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
});

client.on("message", async (msg) => {
  try {
    // ✅ só conversa normal de usuário
    if (!msg.from.endsWith("@c.us")) return;
    if (msg.fromMe) return;

    const phone = msg.from.replace("@c.us", "");
    const message = msg.body || "";

    console.log(`\n📩 Mensagem recebida de ${phone}: ${message}`);

    const response = handleMessage(phone, message, client);
    if (response && response.trim()) {
      await client.sendMessage(msg.from, response);
      console.log(`✅ Resposta enviada para ${phone}`);
    }
  } catch (error) {
    console.error("❌ Erro ao processar mensagem:", error);
    try {
      if (msg?.from?.endsWith("@c.us")) {
        await client.sendMessage(
          msg.from,
          "Desculpe, ocorreu um erro. Digite *menu* para voltar ao início."
        );
      }
    } catch {}
  }
});

client.on("disconnected", (reason) => console.log("❌ Bot desconectado:", reason));
client.on("auth_failure", (m) => console.error("❌ Falha na autenticação:", m));

client.initialize();

process.on("unhandledRejection", (error) => console.error("❌ Erro não tratado:", error));

export default client;
