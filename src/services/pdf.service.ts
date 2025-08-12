import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  generateInvoicePdf(invoiceData: any): void {
    const doc = new jsPDF();

    // Configurações de página e cores modernas
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);

    // Paleta de cores corporativa moderna
    const colors = {
      primary: [13, 148, 136],    // Teal moderno
      secondary: [99, 102, 241],  // Indigo elegante
      accent: [245, 158, 11],     // Âmbar para destaques
      success: [34, 197, 94],     // Verde sucesso
      dark: [31, 41, 55],         // Cinza escuro
      light: [249, 250, 251],     // Cinza muito claro
      medium: [156, 163, 175],    // Cinza médio
      white: [255, 255, 255]
    };

    let y = margin;

    // === CABEÇALHO CORPORATIVO MODERNO ===
    this.drawModernCorporateHeader(doc, invoiceData, y, contentWidth, margin, colors);
    y += 70;

    // === SEÇÃO DE DADOS EMPRESA/CLIENTE ===
    y = this.drawDataSection(doc, invoiceData, y, contentWidth, margin, colors);
    y += 20;

    // === TABELA DE ITENS PREMIUM ===
    y = this.drawModernItemsTable(doc, invoiceData, y, contentWidth, margin, colors);
    y += 15;

    // === RESUMO FINANCEIRO DESTACADO ===
    y = this.drawModernFinancialSummary(doc, invoiceData, y, contentWidth, margin, colors);
    y += 25;

    // === RODAPÉ CORPORATIVO ===
    this.drawCorporateFooter(doc, pageHeight, contentWidth, margin, colors, invoiceData);

    // Salvar com nome profissional
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `PJ_Limitada_Fatura_${invoiceData.fatura.numero}_${timestamp}.pdf`;
    doc.save(fileName);
  }

  private drawModernCorporateHeader(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): void {
    // Fundo principal com gradiente simulado
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, y, contentWidth, 55, 'F');

    // Faixa decorativa superior
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(margin, y, contentWidth, 4, 'F');

    // Faixa decorativa inferior
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.rect(margin, y + 51, contentWidth, 4, 'F');

    // Logo corporativo premium
    this.drawPremiumLogo(doc, margin + 20, y + 27, colors);

    // Informações da empresa - lado esquerdo
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PJ LIMITADA', margin + 65, y + 20);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('PEÇAS AUTOMOTIVAS PREMIUM', margin + 65, y + 28);
    doc.text('Av. Marginal, Edifício Torres Dipanda', margin + 65, y + 36);
    doc.text('Luanda, Angola | Tel: +244 923 456 789', margin + 65, y + 43);

    // Caixa da fatura - lado direito
    const faturaX = margin + contentWidth - 120;
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.roundedRect(faturaX, y + 10, 110, 35, 5, 5, 'F');

    // Sombra da caixa
    doc.setFillColor(0, 0, 0, 0.1);
    doc.roundedRect(faturaX + 2, y + 12, 110, 35, 5, 5, 'F');
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.roundedRect(faturaX, y + 10, 110, 35, 5, 5, 'F');

    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('FATURA', faturaX + 25, y + 24);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('COMMERCIAL INVOICE', faturaX + 20, y + 30);

    // Número da fatura em destaque
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.roundedRect(faturaX + 10, y + 32, 90, 10, 2, 2, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nº ${invoiceData.fatura.numero}`, faturaX + 30, y + 40);
  }

  private drawPremiumLogo(doc: jsPDF, x: number, y: number, colors: any): void {
    // Círculo externo
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.circle(x, y, 18);

    // Círculo interno principal
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.circle(x, y, 15);

    // Círculo interno menor
    doc.setFillColor(colors.accent[0], colors.accent[1], colors.accent[2]);
    doc.circle(x, y, 12);

    // Texto PJ
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('PJ', x - 10, y + 6);
  }

  private drawModernLogo(doc: jsPDF, x: number, y: number, color: number[]): void {
    // Círculo principal
    doc.setFillColor(color[0], color[1], color[2]);
    doc.circle(x, y, 15);

    // Círculo interno decorativo
    doc.setFillColor(52, 168, 83); // Verde
    doc.circle(x, y, 12);

    // Texto PJ estilizado
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('PJ', x - 8, y + 5);
  }

  private drawCompanyClientSection(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): number {
    // Fundo da seção
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(margin, y, contentWidth, 45, 'F');

    // Bordas elegantes
    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setLineWidth(1);
    doc.rect(margin, y, contentWidth, 45);

    // Coluna da empresa
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('🏢 DADOS DA EMPRESA', margin + 8, y + 12);

    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    const empresaInfo = [
      `📍 ${invoiceData.empresa.endereco}`,
      `🌍 ${invoiceData.empresa.cidade}`,
      `📞 ${invoiceData.empresa.telefone}`,
      `✉️  ${invoiceData.empresa.email}`,
      `🆔 NIF: ${invoiceData.empresa.nif}`
    ];

    empresaInfo.forEach((info, index) => {
      doc.text(info, margin + 8, y + 20 + (index * 5));
    });

    // Linha divisória vertical
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(2);
    doc.line(margin + (contentWidth / 2), y + 5, margin + (contentWidth / 2), y + 40);

    // Coluna do cliente
    const clienteX = margin + (contentWidth / 2) + 8;
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('👤 FATURADO PARA', clienteX, y + 12);

    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${invoiceData.fatura.cliente}`, clienteX, y + 20);
    doc.text(`Vendedor: ${invoiceData.fatura.vendedor}`, clienteX, y + 26);
    doc.text(`Data: ${invoiceData.fatura.data}`, clienteX, y + 32);
    doc.text(`Pagamento: ${invoiceData.fatura.formaPagamento}`, clienteX, y + 38);

    return y + 50;
  }

  private drawInvoiceDetails(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): number {
    // Cabeçalho da seção
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, y, contentWidth, 12, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('📋 DETALHES DA TRANSAÇÃO', margin + 8, y + 8);

    y += 15;
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(9);

    const detalhes = [
      [`📅 Data de Emissão:`, invoiceData.fatura.data],
      [`⏰ Data de Vencimento:`, invoiceData.fatura.dataVencimento || 'À vista'],
      [`🏷️  Série:`, invoiceData.fatura.serie],
      [`💰 Moeda:`, invoiceData.fatura.moeda]
    ];

    detalhes.forEach((detalhe, index) => {
      const x1 = margin + 8 + (index % 2) * (contentWidth / 2);
      const currentY = y + Math.floor(index / 2) * 8;

      doc.setFont('helvetica', 'bold');
      doc.text(detalhe[0], x1, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(detalhe[1], x1 + 60, currentY);
    });

    return y + 20;
  }

  private drawPremiumTable(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): number {
    // Título da tabela
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(margin, y, contentWidth, 10, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('🛒 ITENS FATURADOS', margin + 8, y + 7);

    y += 12;

    // Cabeçalho da tabela
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, y, contentWidth, 12, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');

    const colunas = ['#', 'DESCRIÇÃO DO PRODUTO', 'QTD', 'PREÇO UNIT.', 'TOTAL'];
    const larguras = [15, 90, 25, 35, 35];
    let currentX = margin + 3;

    colunas.forEach((coluna, index) => {
      if (index === 0 || index === 2 || index === 3 || index === 4) {
        const textWidth = doc.getTextWidth(coluna);
        doc.text(coluna, currentX + (larguras[index] - textWidth) / 2, y + 8);
      } else {
        doc.text(coluna, currentX + 3, y + 8);
      }
      currentX += larguras[index];
    });

    y += 12;

    // Linhas da tabela
    invoiceData.itens.forEach((item: any, index: number) => {
      const alturaLinha = 10;

      // Fundo alternado
      if (index % 2 === 0) {
        doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
        doc.rect(margin, y, contentWidth, alturaLinha, 'F');
      }

      // Bordas
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(margin, y + alturaLinha, margin + contentWidth, y + alturaLinha);

      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');

      currentX = margin + 3;
      const dados = [
        (index + 1).toString().padStart(2, '0'),
        item.nome.length > 45 ? item.nome.substring(0, 45) + '...' : item.nome,
        item.quantidade.toString(),
        `${item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`,
        `${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`
      ];

      dados.forEach((dado, colIndex) => {
        const yPos = y + 7;

        if (colIndex === 0 || colIndex === 2 || colIndex === 3 || colIndex === 4) {
          const textWidth = doc.getTextWidth(dado);
          doc.text(dado, currentX + (larguras[colIndex] - textWidth) / 2, yPos);
        } else {
          doc.text(dado, currentX + 3, yPos);
        }

        currentX += larguras[colIndex];
      });

      y += alturaLinha;
    });

    // Borda final da tabela
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(1);
    doc.rect(margin, y - (invoiceData.itens.length * 10) - 24, contentWidth, (invoiceData.itens.length * 10) + 24);

    return y + 5;
  }

  private drawFinancialSummary(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): number {
    const resumoX = margin + contentWidth - 110;
    const resumoWidth = 100;

    // Caixa do resumo
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(resumoX, y, resumoWidth, 45, 'F');

    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(1);
    doc.rect(resumoX, y, resumoWidth, 45);

    // Título
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(resumoX, y, resumoWidth, 10, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('💰 RESUMO FINANCEIRO', resumoX + 5, y + 7);

    y += 12;

    // Linhas do resumo
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(9);

    const resumoItens = [
      ['Subtotal:', `${invoiceData.resumo.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`],
      ['Desconto:', `${invoiceData.resumo.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`]
    ];

    resumoItens.forEach((item, index) => {
      const itemY = y + 5 + (index * 8);
      doc.setFont('helvetica', 'normal');
      doc.text(item[0], resumoX + 5, itemY);
      doc.setFont('helvetica', 'bold');
      doc.text(item[1], resumoX + 45, itemY);
    });

    // Total destacado
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(resumoX, y + 20, resumoWidth, 13, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GERAL:', resumoX + 5, y + 29);
    doc.text(`${invoiceData.resumo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, resumoX + 45, y + 29);

    // Valor por extenso
    y += 50;
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(margin, y, contentWidth, 12, 'FD');

    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Valor por extenso:', margin + 5, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceData.resumo.totalPorExtenso || 'Valor não convertido', margin + 5, y + 9);

    return y + 15;
  }

  private drawNotesSection(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): number {
    if (invoiceData.observacoes) {
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('📝 OBSERVAÇÕES:', margin, y);

      y += 8;
      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      const linhas = doc.splitTextToSize(invoiceData.observacoes, contentWidth - 20);
      linhas.forEach((linha: string) => {
        doc.text(linha, margin, y);
        y += 4;
      });
    }

    return y + 10;
  }

  private drawProfessionalFooter(doc: jsPDF, pageHeight: number, contentWidth: number, margin: number, colors: any): void {
    const footerY = pageHeight - 25;

    // Linha decorativa
    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setLineWidth(2);
    doc.line(margin, footerY - 5, margin + contentWidth, footerY - 5);

    // Fundo do rodapé
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(margin, footerY, contentWidth, 20, 'F');

    // Informações legais
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');

    const textoLegal = `PJ LIMITADA - Sociedade por Quotas | NIF: 5417048598 | Registro Comercial: 123456789`;
    const textoEndereco = `Av. Marginal, Edifício Torres Dipanda, 15º Andar - Luanda, Angola`;

    doc.text(textoLegal, margin + 5, footerY + 6);
    doc.text(textoEndereco, margin + 5, footerY + 10);

    // Data de geração
    doc.setFont('helvetica', 'italic');
    const agora = new Date();
    const textoGeracao = `Documento gerado em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR')}`;
    doc.text(textoGeracao, margin + 5, footerY + 16);

    // Hash de verificação
    const hash = Math.random().toString(36).substring(2, 15).toUpperCase();
    doc.setFont('helvetica', 'bold');
    doc.text(`Hash: ${hash}`, margin + contentWidth - 60, footerY + 16);
  }
}
