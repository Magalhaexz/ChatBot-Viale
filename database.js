import fs from "fs";
import path from "path";
import { sendEmailNotification } from "./email.js";
import { exportSingleLeadToExcel } from "./excel.js";
import { addLeadToGoogleSheets } from "./googleSheets.js";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "leads.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));

function readDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return [];
  }
}
function writeDB(leads) {
  fs.writeFileSync(DB_PATH, JSON.stringify(leads, null, 2));
}

export function saveLead(phone, data) {
  try {
    const leads = readDB();

    const lead = {
      id: Date.now(),
      phone,
      status: data?.status || "Novo",
      tipo_atendimento: data?.tipo_atendimento || "Orçamento",
      notes: data?.notes || "",
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    leads.push(lead);
    writeDB(leads);

    console.log("💾 Lead salvo:", lead.id);

    // integrações (não bloqueiam)
    sendEmailNotification(lead).catch((err) =>
      console.error("⚠️  Erro ao enviar email:", err.message)
    );

    exportSingleLeadToExcel(lead).catch((err) =>
      console.log("ℹ️  Excel individual não exportado:", err.message)
    );

    addLeadToGoogleSheets(lead).catch((err) =>
      console.log("ℹ️  Google Sheets não atualizado:", err.message)
    );

    return lead;
  } catch (error) {
    console.error("❌ Erro ao salvar lead:", error);
    return null;
  }
}

export function getLeads() {
  return readDB();
}

export function getLeadById(id) {
  const leads = readDB();
  return leads.find((l) => l.id === id);
}

export function getLeadsByPhone(phone) {
  const leads = readDB();
  return leads.filter((l) => l.phone === phone);
}

export function updateLeadStatus(id, status) {
  try {
    const leads = readDB();
    const idx = leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;

    leads[idx].status = status;
    leads[idx].updated_at = new Date().toISOString();
    writeDB(leads);
    return leads[idx];
  } catch (e) {
    console.error("❌ Erro ao atualizar status:", e);
    return null;
  }
}

export function updateLeadAssignment(id, attendant) {
  try {
    const leads = readDB();
    const idx = leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;

    leads[idx].atendente_nome = attendant?.nome || "";
    leads[idx].atendente_id = attendant?.id || "";
    leads[idx].atendente_numero = attendant?.numero || "";
    leads[idx].updated_at = new Date().toISOString();

    writeDB(leads);
    return leads[idx];
  } catch (e) {
    console.error("❌ Erro ao reatribuir lead:", e);
    return null;
  }
}

export function updateLeadNotes(id, notes) {
  try {
    const leads = readDB();
    const idx = leads.findIndex((l) => l.id === id);
    if (idx === -1) return null;

    leads[idx].notes = String(notes || "");
    leads[idx].updated_at = new Date().toISOString();

    writeDB(leads);
    return leads[idx];
  } catch (e) {
    console.error("❌ Erro ao salvar notas:", e);
    return null;
  }
}

export function getLeadsStats() {
  const leads = readDB();
  const today = new Date().toDateString();

  return {
    total: leads.length,
    today: leads.filter((l) => new Date(l.created_at).toDateString() === today).length,
    thisWeek: leads.filter((l) => {
      const d = new Date(l.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return d >= weekAgo;
    }).length,
    thisMonth: leads.filter((l) => {
      const d = new Date(l.created_at);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length,
  };
}

export function getTopDestinations(limit = 5) {
  const leads = readDB();
  const map = {};
  leads.forEach((l) => {
    if (l.destino) map[l.destino] = (map[l.destino] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([destino, count]) => ({ destino, count }));
}

export function getTopTravelTypes() {
  const leads = readDB();
  const map = {};
  leads.forEach((l) => {
    if (l.tipo_viagem) map[l.tipo_viagem] = (map[l.tipo_viagem] || 0) + 1;
  });
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([tipo, count]) => ({ tipo, count }));
}
