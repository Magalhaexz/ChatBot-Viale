import { users } from "./users.js";
import { saveLead, getLeadById } from "./database.js";

const AGENCY_NAME = "VIALE TURISMO";

// atendentes (E.164)
const ATTENDANTS = [
  { id: "milene", nome: "Milene", numero: "5562991989622" },
  { id: "leane", nome: "Leane", numero: "5562999646094" },
  { id: "danubia", nome: "Danubia", numero: "5562999967460" },
];

const CMD_MENU = new Set(["menu", "inicio", "início", "reiniciar"]);
const CMD_CANCEL = new Set(["cancelar", "cancela", "sair", "parar", "encerrar", "0"]);

const followUps = new Map(); // phone -> {t1,t2,leadId,sent1,sent2}

function cancelFollowUps(phone) {
  const s = followUps.get(phone);
  if (!s) return;
  if (s.t1) clearTimeout(s.t1);
  if (s.t2) clearTimeout(s.t2);
  followUps.delete(phone);
}

function scheduleFollowUps(phone, client, leadId) {
  if (!leadId) return;

  cancelFollowUps(phone);

  const state = { t1: null, t2: null, leadId, sent1: false, sent2: false };

  const canFollowUp = () => {
    const lead = getLeadById(leadId);
    if (!lead) return false;
    return (lead.status || "Novo") === "Novo";
  };

  state.t1 = setTimeout(async () => {
    try {
      const cur = followUps.get(phone);
      if (!cur || cur.sent1) return;
      if (users[phone]) return;

      if (!canFollowUp()) {
        cancelFollowUps(phone);
        return;
      }

      await client.sendMessage(
        `${phone}@c.us`,
        `Oi 😊 só passando para confirmar se você recebeu minha última mensagem.\n\nPosso te ajudar com mais alguma informação?\n\n(Se quiser, digite *menu*.)`
      );
      cur.sent1 = true;
      followUps.set(phone, cur);
      console.log(`🔁 Follow-up 1 enviado para ${phone}`);
    } catch (e) {
      console.log("❌ Erro follow-up 1:", e.message);
    }
  }, 30 * 60 * 1000);

  state.t2 = setTimeout(async () => {
    try {
      const cur = followUps.get(phone);
      if (!cur || cur.sent2) return;
      if (users[phone]) return;

      if (!canFollowUp()) {
        cancelFollowUps(phone);
        return;
      }

      await client.sendMessage(
        `${phone}@c.us`,
        `Ainda quer receber opções para sua viagem? 😊\n\nPosso te enviar *2 sugestões personalizadas*.\n\n(Responda por aqui ou digite *menu*.)`
      );
      cur.sent2 = true;
      followUps.set(phone, cur);
      console.log(`🔁 Follow-up 2 enviado para ${phone}`);
    } catch (e) {
      console.log("❌ Erro follow-up 2:", e.message);
    }
  }, 24 * 60 * 60 * 1000);

  followUps.set(phone, state);
}

function menuInicial() {
  return `👋 Olá! Seja bem-vindo(a) à *${AGENCY_NAME}* ✨

Escolha uma opção:

1️⃣ *Solicitar orçamento*
2️⃣ *Ajuda com viagem já comprada*
3️⃣ *Falar direto com uma atendente*

0️⃣ *Cancelar atendimento*

_Digite 1, 2, 3 ou 0_`;
}

function menuAtendentes() {
  return `👩‍💼 *Escolha a atendente:*
1️⃣ Milene
2️⃣ Leane
3️⃣ Danubia

0️⃣ Cancelar

_Digite 1, 2, 3 ou 0_`;
}

function getAttendantByOption(opt) {
  const map = { "1": ATTENDANTS[0], "2": ATTENDANTS[1], "3": ATTENDANTS[2] };
  return map[opt] || null;
}

function resumoOrcamento(data) {
  return `━━━━━━━━━━━━━━━━━━━━
📋 *RESUMO DO ORÇAMENTO*
━━━━━━━━━━━━━━━━━━━━

🌍 *Destino:* ${data.destino || "-"}
🛫 *Saída:* ${data.cidade_saida || "-"}
📅 *Datas/Período:* ${data.periodo || "-"}
🗓️ *Flexibilidade:* ${data.flexibilidade || "-"}
👥 *Passageiros:* ${data.num_passageiros || "-"}
👶 *Idades:* ${data.idades || "-"}
💰 *Orçamento:* ${data.orcamento || "-"}
🏨 *Preferência:* ${data.preferencia || "-"}
✈️ *Tipo:* ${data.tipo_viagem || "-"}

━━━━━━━━━━━━━━━━━━━━`;
}

async function sendLeadToAttendant(client, attendant, customerPhone, data, protocol, motivo) {
  if (!client || !attendant?.numero) return;

  const msg = `🔔 *NOVO LEAD - ${AGENCY_NAME}*
━━━━━━━━━━━━━━━━━━━━
👩‍💼 *Atendente:* ${attendant.nome}
📱 *Cliente:* ${customerPhone}
🎯 *Protocolo:* #${protocol}
🧩 *Motivo:* ${motivo}

${motivo === "Orçamento" ? `🌍 *Destino:* ${data.destino || "-"}
🛫 *Saída:* ${data.cidade_saida || "-"}
📅 *Datas/Período:* ${data.periodo || "-"}
🗓️ *Flexibilidade:* ${data.flexibilidade || "-"}
👥 *Passageiros:* ${data.num_passageiros || "-"}
👶 *Idades:* ${data.idades || "-"}
💰 *Orçamento:* ${data.orcamento || "-"}
🏨 *Preferência:* ${data.preferencia || "-"}
✈️ *Tipo:* ${data.tipo_viagem || "-"}` : `📌 *Info:* ${data.info_viagem || "-"}`}

🕐 *Data:* ${data.data_solicitacao || new Date().toLocaleString("pt-BR")}
━━━━━━━━━━━━━━━━━━━━`;

  try {
    const number = attendant.numero.replace(/\D/g, "");
    const numberId = await client.getNumberId(number);
    if (!numberId?._serialized) {
      console.log(`⚠️ Sem NumberId para: ${attendant.nome} (${number})`);
      return;
    }
    await client.sendMessage(numberId._serialized, msg);
    console.log(`✅ Lead enviado para atendente: ${attendant.nome}`);
  } catch (e) {
    console.log("❌ Erro ao enviar lead para atendente:", e.message);
  }
}

export function handleMessage(phone, message, client) {
  const raw = (message || "").trim();
  const msg = raw.toLowerCase();

  // qualquer msg cancela follow-ups pendentes
  cancelFollowUps(phone);

  // cancelar
  if (CMD_CANCEL.has(msg)) {
    delete users[phone];
    return `✅ Atendimento cancelado.\n\nSe precisar novamente, digite *menu*.`;
  }

  // menu
  if (CMD_MENU.has(msg)) {
    delete users[phone];
    users[phone] = { step: 1, data: {}, timestamp: Date.now() };
    return menuInicial();
  }

  // iniciar
  if (!users[phone]) {
    users[phone] = { step: 1, data: {}, timestamp: Date.now() };
    return menuInicial();
  }

  const user = users[phone];
  user.timestamp = Date.now();

  switch (user.step) {
    // MENU
    case 1: {
      if (!["1", "2", "3"].includes(msg)) return `❌ Opção inválida.\n\n${menuInicial()}`;

      if (msg === "1") {
        user.data.flow = "orcamento";
        user.step = 10;
        return `Perfeito ✅ Vamos solicitar seu orçamento.\n\n✈️ *Qual tipo de viagem você deseja?*\n1️⃣ Passagens (aéreo)\n2️⃣ Aéreo + Hotel\n3️⃣ Pacote completo (aéreo + hotel + passeios)\n\n0️⃣ Cancelar`;
      }

      if (msg === "2") {
        user.data.flow = "pos_compra";
        user.step = 20;
        return `Certo ✅ Essa viagem foi comprada com a *${AGENCY_NAME}*?\n\n1️⃣ Sim\n2️⃣ Não\n\n0️⃣ Cancelar`;
      }

      user.data.flow = "contato_direto";
      user.step = 30;
      return `Claro 😊\n\n${menuAtendentes()}`;
    }

    // ORÇAMENTO: tipo
    case 10: {
      if (!["1", "2", "3"].includes(msg)) return `❌ Opção inválida. Digite 1, 2 ou 3 (ou 0).`;
      const tipos = { "1": "Somente Aéreo", "2": "Aéreo + Hotel", "3": "Pacote Completo" };
      user.data.tipo_viagem = tipos[msg];
      user.step = 11;
      return `🌍 *Para qual destino você deseja viajar?*\n\nEx.: Itália, Paris, Maceió, Europa\n\n0️⃣ Cancelar`;
    }

    // destino
    case 11: {
      if (raw.length < 2) return `❌ Informe um destino válido (ou 0).`;
      user.data.destino = raw;
      user.step = 12;
      return `🛫 *De qual cidade/aeroporto vocês saem?*\n\nEx.: Goiânia, Brasília, São Paulo (GRU)\n\n0️⃣ Cancelar`;
    }

    // saída
    case 12: {
      if (raw.length < 2) return `❌ Informe a cidade/aeroporto de saída (ou 0).`;
      user.data.cidade_saida = raw;
      user.step = 13;
      return `📅 *Qual data ou período da viagem?*\n\nEx.: 10/07 a 18/07, Julho/2026, Dezembro\n\n0️⃣ Cancelar`;
    }

    // período
    case 13: {
      if (raw.length < 2) return `❌ Informe um período válido (ou 0).`;
      user.data.periodo = raw;
      user.step = 14;
      return `🗓️ Suas datas são fixas ou tem flexibilidade de *+/- 3 dias*?\n\n1️⃣ Datas fixas\n2️⃣ Pode flexibilizar\n\n0️⃣ Cancelar`;
    }

    // flex
    case 14: {
      if (!["1", "2"].includes(msg)) return `❌ Opção inválida. Digite 1 ou 2 (ou 0).`;
      user.data.flexibilidade = msg === "1" ? "Datas fixas" : "Pode flexibilizar (+/- 3 dias)";
      user.step = 15;
      return `👥 *Quantas pessoas vão viajar?*\n\nDigite apenas o número (ex.: 2)\n\n0️⃣ Cancelar`;
    }

    // passageiros
    case 15: {
      const n = parseInt(raw, 10);
      if (Number.isNaN(n) || n < 1 || n > 50) return `❌ Digite um número válido (1 a 50) ou 0.`;
      user.data.num_passageiros = String(n);
      user.step = 16;
      return `👶 *Idades dos passageiros?*\n\nEx.: 2 adultos / 2 adultos e 1 criança (5 anos)\n\n0️⃣ Cancelar`;
    }

    // idades
    case 16: {
      if (raw.length < 2) return `❌ Informe as idades (ou 0).`;
      user.data.idades = raw;
      user.step = 17;
      return `💰 *Qual orçamento total aproximado?*\n\nEx.: R$ 8.000 / Até R$ 15.000\n\n0️⃣ Cancelar`;
    }

    // orçamento
    case 17: {
      if (raw.length < 2) return `❌ Informe o orçamento (ou 0).`;
      user.data.orcamento = raw;
      user.step = 18;
      return `🏨 Preferência?\n\n1️⃣ Econômica + hotel 3⭐ (com café)\n2️⃣ Econômica + hotel 4⭐ (com café)\n3️⃣ Econômica + hotel 5⭐ (com café)\n4️⃣ Executiva + hotel 4/5⭐ (com café)\n5️⃣ Quero sugestões\n\n0️⃣ Cancelar`;
    }

    // preferência
    case 18: {
      const prefMap = {
        "1": "Econômica + hotel 3⭐ (com café)",
        "2": "Econômica + hotel 4⭐ (com café)",
        "3": "Econômica + hotel 5⭐ (com café)",
        "4": "Executiva + hotel 4/5⭐ (com café)",
        "5": "Quero sugestões",
      };
      if (!prefMap[msg]) return `❌ Opção inválida. Digite 1 a 5 (ou 0).`;

      user.data.preferencia = prefMap[msg];
      user.data.data_solicitacao = new Date().toLocaleString("pt-BR");

      user.step = 19;
      return `${resumoOrcamento(user.data)}\n\n✅ Deseja confirmar e escolher a atendente?\n1️⃣ Sim\n2️⃣ Não (voltar ao menu)\n\n0️⃣ Cancelar`;
    }

    // confirmar
    case 19: {
      if (!["1", "2"].includes(msg)) return `❌ Opção inválida. Digite 1, 2 ou 0.`;
      if (msg === "2") {
        delete users[phone];
        users[phone] = { step: 1, data: {}, timestamp: Date.now() };
        return menuInicial();
      }
      user.step = 40;
      return `✅ Perfeito! Agora escolha a atendente:\n\n${menuAtendentes()}`;
    }

    // escolhe atendente (orçamento)
    case 40: {
      const attendant = getAttendantByOption(msg);
      if (!attendant) return `❌ Opção inválida.\n\n${menuAtendentes()}`;

      const leadData = {
        ...user.data,
        status: "Novo",
        tipo_atendimento: "Orçamento",
        atendente_nome: attendant.nome,
        atendente_id: attendant.id,
        atendente_numero: attendant.numero,
      };

      const lead = saveLead(phone, leadData);
      sendLeadToAttendant(client, attendant, phone, leadData, lead?.id || Date.now(), "Orçamento");

      // ✅ follow-up só para status Novo
      scheduleFollowUps(phone, client, lead?.id);

      delete users[phone];

      return `✅ Solicitação enviada!\n\n${resumoOrcamento(leadData)}\n\n👩‍💼 *Atendente:* ${attendant.nome}\n📱 Falar agora: https://wa.me/${attendant.numero}\n🎯 *Protocolo:* #${lead?.id || "N/A"}\n\nSe precisar, digite *menu*.`;
    }

    // pós-compra
    case 20: {
      if (!["1", "2"].includes(msg)) return `❌ Opção inválida. Digite 1, 2 ou 0.`;
      if (msg === "2") {
        delete users[phone];
        return `Entendi 😊\n\nNo momento, a *${AGENCY_NAME}* presta suporte apenas para viagens adquiridas conosco.\n\nSe quiser, podemos te ajudar com um *novo orçamento* ✅\n\nDigite *menu* para voltar ao início.`;
      }
      user.step = 21;
      return `Com qual atendente você comprou?\n\n${menuAtendentes()}`;
    }

    case 21: {
      const attendant = getAttendantByOption(msg);
      if (!attendant) return `❌ Opção inválida.\n\n${menuAtendentes()}`;
      user.data.atendente_nome = attendant.nome;
      user.data.atendente_id = attendant.id;
      user.data.atendente_numero = attendant.numero;
      user.step = 22;
      return `✅ Me diga rapidamente sua necessidade com a viagem já comprada.\n\nEx.: alteração de data, bagagem, check-in, hotel...\n\n0️⃣ Cancelar`;
    }

    case 22: {
      if (raw.length < 3) return `❌ Escreva um resumo (ou 0).`;
      const attendant = ATTENDANTS.find((a) => a.id === user.data.atendente_id);

      const leadData = {
        ...user.data,
        status: "Em atendimento",
        tipo_atendimento: "Pós-compra",
        info_viagem: raw,
        data_solicitacao: new Date().toLocaleString("pt-BR"),
      };

      const lead = saveLead(phone, leadData);
      sendLeadToAttendant(client, attendant, phone, leadData, lead?.id || Date.now(), "Pós-compra");

      delete users[phone];

      return `✅ Encaminhado para *${attendant.nome}*.\n\n📱 Falar agora: https://wa.me/${attendant.numero}\n🎯 *Protocolo:* #${lead?.id || "N/A"}\n\nDigite *menu* para voltar ao início.`;
    }

    // contato direto
    case 30: {
      const attendant = getAttendantByOption(msg);
      if (!attendant) return `❌ Opção inválida.\n\n${menuAtendentes()}`;

      const leadData = {
        status: "Contato direto",
        tipo_atendimento: "Contato direto",
        atendente_nome: attendant.nome,
        atendente_id: attendant.id,
        atendente_numero: attendant.numero,
        data_solicitacao: new Date().toLocaleString("pt-BR"),
        info_viagem: "Cliente solicitou contato direto com a atendente.",
      };

      const lead = saveLead(phone, leadData);
      sendLeadToAttendant(client, attendant, phone, leadData, lead?.id || Date.now(), "Contato direto");

      // ❌ NÃO agenda follow-up para contato direto (evita incômodo)
      delete users[phone];

      return `✅ Pronto! Registrei como *Contato direto*.\n\n📱 Falar agora com *${attendant.nome}*: https://wa.me/${attendant.numero}\n🎯 *Protocolo:* #${lead?.id || "N/A"}\n\nDigite *menu* para voltar ao início.`;
    }

    default:
      delete users[phone];
      users[phone] = { step: 1, data: {}, timestamp: Date.now() };
      return menuInicial();
  }
}
