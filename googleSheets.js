import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

let sheetsClient = null;
let isConfigured = false;

/**
 * Inicializa o cliente do Google Sheets
 */
function initSheetsClient() {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.log('ℹ️  Google Sheets não configurado (opcional)');
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheetsClient = google.sheets({ version: 'v4', auth });
    isConfigured = true;
    console.log('✅ Google Sheets configurado com sucesso');
    return sheetsClient;
  } catch (error) {
    console.error('❌ Erro ao configurar Google Sheets:', error.message);
    return null;
  }
}

/**
 * Adiciona lead ao Google Sheets
 */
export async function addLeadToGoogleSheets(lead) {
  if (!isConfigured && !initSheetsClient()) {
    return false;
  }

  if (!process.env.GOOGLE_SHEETS_ID) {
    console.log('⚠️  GOOGLE_SHEETS_ID não configurado');
    return false;
  }

  try {
    const values = [
      [
        `#${lead.id}`,
        new Date(lead.created_at).toLocaleString('pt-BR'),
        lead.phone,
        lead.tipo_viagem || '-',
        lead.destino || '-',
        lead.periodo || '-',
        lead.num_passageiros || '-',
        lead.idades || '-',
        lead.orcamento || '-',
      ]
    ];

    await sheetsClient.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'A:I', // Colunas A até I
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    console.log('📊 Lead adicionado ao Google Sheets');
    return true;
  } catch (error) {
    console.error('❌ Erro ao adicionar ao Google Sheets:', error.message);
    return false;
  }
}

/**
 * Cria cabeçalho no Google Sheets
 */
export async function createSheetsHeader() {
  if (!isConfigured && !initSheetsClient()) {
    return false;
  }

  if (!process.env.GOOGLE_SHEETS_ID) {
    return false;
  }

  try {
    const headers = [[
      'Protocolo',
      'Data/Hora',
      'Telefone',
      'Tipo de Viagem',
      'Destino',
      'Período',
      'Nº Passageiros',
      'Idades',
      'Orçamento'
    ]];

    await sheetsClient.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: 'A1:I1',
      valueInputOption: 'USER_ENTERED',
      resource: { values: headers },
    });

    // Formatar cabeçalho (negrito)
    await sheetsClient.spreadsheets.batchUpdate({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      resource: {
        requests: [{
          repeatCell: {
            range: {
              startRowIndex: 0,
              endRowIndex: 1,
            },
            cell: {
              userEnteredFormat: {
                textFormat: { bold: true },
                backgroundColor: { red: 0.4, green: 0.49, blue: 0.91 },
                textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 } }
              }
            },
            fields: 'userEnteredFormat(textFormat,backgroundColor)'
          }
        }]
      }
    });

    console.log('✅ Cabeçalho criado no Google Sheets');
    return true;
  } catch (error) {
    console.error('❌ Erro ao criar cabeçalho:', error.message);
    return false;
  }
}

/**
 * Testa conexão com Google Sheets
 */
export async function testGoogleSheetsConnection() {
  if (!isConfigured && !initSheetsClient()) {
    return false;
  }

  if (!process.env.GOOGLE_SHEETS_ID) {
    console.log('⚠️  GOOGLE_SHEETS_ID não configurado');
    return false;
  }

  try {
    await sheetsClient.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
    });
    console.log('✅ Conexão com Google Sheets OK');
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com Google Sheets:', error.message);
    return false;
  }
}
