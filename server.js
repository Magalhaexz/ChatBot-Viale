import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import {
  getLeads,
  getLeadById,
  getLeadsByPhone,
  getLeadsStats,
  getTopDestinations,
  getTopTravelTypes,
  updateLeadStatus,
  updateLeadAssignment,
  updateLeadNotes,
} from "./database.js";

import { generateExcelBuffer } from "./excel.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));
app.use("/exports", express.static(path.join(process.cwd(), "exports")));

// LISTAR
app.get("/api/leads", (req, res) => {
  try {
    const leads = getLeads();
    res.json({ success: true, total: leads.length, leads: leads.reverse() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POR ID
app.get("/api/leads/:id", (req, res) => {
  try {
    const lead = getLeadById(parseInt(req.params.id));
    if (!lead) return res.status(404).json({ success: false, error: "Lead não encontrado" });
    res.json({ success: true, lead });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// POR TELEFONE
app.get("/api/leads/phone/:phone", (req, res) => {
  try {
    const leads = getLeadsByPhone(req.params.phone);
    res.json({ success: true, total: leads.length, leads: leads.reverse() });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// STATS
app.get("/api/stats", (req, res) => {
  try {
    const stats = getLeadsStats();
    res.json({
      success: true,
      stats: {
        ...stats,
        topDestinations: getTopDestinations(),
        topTravelTypes: getTopTravelTypes(),
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// PIPELINE: atualizar status
app.patch("/api/leads/:id/status", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body || {};
    if (!status) return res.status(400).json({ success: false, error: "Status inválido" });

    const updated = updateLeadStatus(id, status);
    if (!updated) return res.status(404).json({ success: false, error: "Lead não encontrado" });

    res.json({ success: true, lead: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Reatribuir
app.patch("/api/leads/:id/assign", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { nome, id_atendente, numero } = req.body || {};
    if (!nome || !numero)
      return res.status(400).json({ success: false, error: "Dados da atendente inválidos" });

    const updated = updateLeadAssignment(id, { nome, id: id_atendente, numero });
    if (!updated) return res.status(404).json({ success: false, error: "Lead não encontrado" });

    res.json({ success: true, lead: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// Notas internas
app.patch("/api/leads/:id/notes", (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { notes } = req.body || {};

    const updated = updateLeadNotes(id, notes || "");
    if (!updated) return res.status(404).json({ success: false, error: "Lead não encontrado" });

    res.json({ success: true, lead: updated });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
});

// EXCEL (todos)
app.get("/api/export/excel", async (req, res) => {
  try {
    const leads = getLeads();
    if (leads.length === 0)
      return res.status(404).json({ success: false, error: "Nenhum lead encontrado para exportar" });

    const buffer = await generateExcelBuffer(leads);
    const filename = `orcamentos-viale-turismo-${new Date().toISOString().split("T")[0]}.xlsx`;

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", buffer.length);

    res.send(buffer);
    console.log(`📥 Excel baixado: ${filename}`);
  } catch (e) {
    console.error("❌ Erro ao exportar Excel:", e);
    res.status(500).json({ success: false, error: e.message });
  }
});

// health
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "online", timestamp: new Date().toISOString() });
});

// painel
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`\n🌐 Painel Web: http://localhost:${PORT}`);
  console.log(`📊 API: http://localhost:${PORT}/api/leads`);
  console.log(`📥 Excel: http://localhost:${PORT}/api/export/excel\n`);
});

export default app;
