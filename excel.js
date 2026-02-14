import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

/**
 * Exporta leads para arquivo Excel
 */
export async function exportToExcel(leads, filename = 'orcamentos-viagens.xlsx') {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orçamentos');

    // Configurar propriedades do workbook
    workbook.creator = 'Chatbot Viagens';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Definir colunas
    worksheet.columns = [
      { header: 'Protocolo', key: 'id', width: 15 },
      { header: 'Data/Hora', key: 'created_at', width: 20 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Tipo de Viagem', key: 'tipo_viagem', width: 20 },
      { header: 'Destino', key: 'destino', width: 25 },
      { header: 'Período', key: 'periodo', width: 20 },
      { header: 'Nº Passageiros', key: 'num_passageiros', width: 15 },
      { header: 'Idades', key: 'idades', width: 30 },
      { header: 'Orçamento', key: 'orcamento', width: 18 },
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Adicionar dados
    leads.forEach(lead => {
      const row = worksheet.addRow({
        id: `#${lead.id}`,
        created_at: new Date(lead.created_at).toLocaleString('pt-BR'),
        phone: lead.phone,
        tipo_viagem: lead.tipo_viagem || '-',
        destino: lead.destino || '-',
        periodo: lead.periodo || '-',
        num_passageiros: lead.num_passageiros || '-',
        idades: lead.idades || '-',
        orcamento: lead.orcamento || '-',
      });

      // Estilizar linhas alternadas
      if (row.number % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' }
        };
      }

      // Alinhar células
      row.alignment = { vertical: 'middle' };
    });

    // Adicionar bordas
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });
    });

    // Adicionar filtros
    worksheet.autoFilter = {
      from: 'A1',
      to: 'I1'
    };

    // Adicionar rodapé com estatísticas
    const lastRow = worksheet.rowCount + 2;
    worksheet.mergeCells(`A${lastRow}:I${lastRow}`);
    const footerCell = worksheet.getCell(`A${lastRow}`);
    footerCell.value = `Total de orçamentos: ${leads.length} | Gerado em: ${new Date().toLocaleString('pt-BR')}`;
    footerCell.font = { italic: true, size: 10 };
    footerCell.alignment = { horizontal: 'center' };

    // Salvar arquivo
    const exportsDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const filepath = path.join(exportsDir, filename);
    await workbook.xlsx.writeFile(filepath);

    console.log(`📊 Excel exportado com sucesso: ${filepath}`);
    return filepath;
  } catch (error) {
    console.error('❌ Erro ao exportar Excel:', error);
    throw error;
  }
}

/**
 * Gera Excel e retorna buffer para download
 */
export async function generateExcelBuffer(leads) {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Orçamentos');

    // Configurar propriedades
    workbook.creator = 'Chatbot Viagens';
    workbook.created = new Date();

    // Definir colunas
    worksheet.columns = [
      { header: 'Protocolo', key: 'id', width: 15 },
      { header: 'Data/Hora', key: 'created_at', width: 20 },
      { header: 'Telefone', key: 'phone', width: 18 },
      { header: 'Tipo de Viagem', key: 'tipo_viagem', width: 20 },
      { header: 'Destino', key: 'destino', width: 25 },
      { header: 'Período', key: 'periodo', width: 20 },
      { header: 'Nº Passageiros', key: 'num_passageiros', width: 15 },
      { header: 'Idades', key: 'idades', width: 30 },
      { header: 'Orçamento', key: 'orcamento', width: 18 },
    ];

    // Estilizar cabeçalho
    worksheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF667EEA' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
    worksheet.getRow(1).height = 25;

    // Adicionar dados
    leads.forEach(lead => {
      const row = worksheet.addRow({
        id: `#${lead.id}`,
        created_at: new Date(lead.created_at).toLocaleString('pt-BR'),
        phone: lead.phone,
        tipo_viagem: lead.tipo_viagem || '-',
        destino: lead.destino || '-',
        periodo: lead.periodo || '-',
        num_passageiros: lead.num_passageiros || '-',
        idades: lead.idades || '-',
        orcamento: lead.orcamento || '-',
      });

      if (row.number % 2 === 0) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF8F9FA' }
        };
      }

      row.alignment = { vertical: 'middle' };
    });

    // Adicionar bordas
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
        };
      });
    });

    // Adicionar filtros
    worksheet.autoFilter = {
      from: 'A1',
      to: 'I1'
    };

    // Retornar buffer
    return await workbook.xlsx.writeBuffer();
  } catch (error) {
    console.error('❌ Erro ao gerar buffer Excel:', error);
    throw error;
  }
}

/**
 * Exporta um único lead para Excel
 */
export async function exportSingleLeadToExcel(lead) {
  return await exportToExcel([lead], `orcamento-${lead.id}.xlsx`);
}
