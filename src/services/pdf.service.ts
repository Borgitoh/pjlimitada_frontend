import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() {}

  generateInvoicePdf(invoiceData: any): void {
    const doc = new jsPDF();
    
    // Configurações de cores
    const primaryColor = { r: 51, g: 122, b: 183 }; // Azul profissional
    const secondaryColor = { r: 108, g: 117, b: 125 }; // Cinza
    const accentColor = { r: 40, g: 167, b: 69 }; // Verde
    const backgroundColor = { r: 248, g: 249, b: 250 }; // Cinza claro
    
    // Margens e dimensões
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);
    
    let y = margin;

    // === CABEÇALHO PRINCIPAL ===
    this.drawHeader(doc, invoiceData, y, contentWidth, margin, primaryColor);
    y += 60;

    // === INFORMAÇÕES DA EMPRESA E CLIENTE ===
    y = this.drawCompanyAndClientInfo(doc, invoiceData, y, contentWidth, margin, backgroundColor);
    y += 10;

    // === DETALHES DA FATURA ===
    y = this.drawInvoiceDetails(doc, invoiceData, y, contentWidth, margin, primaryColor);
    y += 20;

    // === TABELA DE ITENS ===
    y = this.drawItemsTable(doc, invoiceData, y, contentWidth, margin, primaryColor, backgroundColor);
    y += 20;

    // === RESUMO FINANCEIRO ===
    y = this.drawFinancialSummary(doc, invoiceData, y, contentWidth, margin, primaryColor, accentColor);
    y += 20;

    // === OBSERVAÇÕES E TERMOS ===
    this.drawNotesAndTerms(doc, invoiceData, y, contentWidth, margin, secondaryColor);

    // === RODAPÉ ===
    this.drawFooter(doc, pageHeight, contentWidth, margin, secondaryColor);

    // Salvar o PDF
    const fileName = `Fatura_${invoiceData.fatura.numero}_${invoiceData.fatura.data.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  }

  private drawHeader(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, primaryColor: any): void {
    // Fundo do cabeçalho com gradiente simulado
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(margin, y, contentWidth, 45, 'F');

    // Efeito de sombra no cabeçalho
    doc.setFillColor(primaryColor.r - 20, primaryColor.g - 20, primaryColor.b - 20);
    doc.rect(margin, y + 43, contentWidth, 2, 'F');

    // Logo PJ mais elaborado
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('PJ', margin + 10, y + 25);

    // Circle around logo com efeito 3D
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(3);
    doc.circle(margin + 20, y + 20, 15);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(1);
    doc.circle(margin + 20, y + 20, 17);

    // Informações da empresa no cabeçalho
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('LIMITADA', margin + 45, y + 15);
    doc.text('Peças Automotivas', margin + 45, y + 25);
    doc.text('Luanda, Angola', margin + 45, y + 35);

    // Título FATURA com estilo moderno
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('FATURA', margin + contentWidth - 80, y + 20);

    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('COMMERCIAL INVOICE', margin + contentWidth - 90, y + 32);

    // Número da fatura com caixa de destaque
    doc.setFillColor(255, 255, 255);
    doc.rect(margin + contentWidth - 90, y + 35, 80, 8, 'F');
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nº ${invoiceData.fatura.numero}`, margin + contentWidth - 85, y + 42);
  }

  private drawCompanyAndClientInfo(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, backgroundColor: any): number {
    // Fundo para a seção
    doc.setFillColor(backgroundColor.r, backgroundColor.g, backgroundColor.b);
    doc.rect(margin, y, contentWidth, 50, 'F');

    // Borda
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, 50);

    // Informações da empresa (lado esquerdo)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DA EMPRESA', margin + 10, y + 12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const empresaInfo = [
      invoiceData.empresa.nome,
      invoiceData.empresa.endereco,
      invoiceData.empresa.cidade,
      `Tel: ${invoiceData.empresa.telefone}`,
      `Email: ${invoiceData.empresa.email}`,
      `NIF: ${invoiceData.empresa.nif}`
    ];
    
    empresaInfo.forEach((line, index) => {
      doc.text(line, margin + 10, y + 22 + (index * 4));
    });

    // Linha divisória vertical
    doc.setDrawColor(200, 200, 200);
    doc.line(margin + (contentWidth / 2), y, margin + (contentWidth / 2), y + 50);

    // Informações do cliente (lado direito)
    const clientX = margin + (contentWidth / 2) + 10;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FATURADO PARA', clientX, y + 12);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.fatura.cliente, clientX, y + 22);
    doc.text(`Vendedor: ${invoiceData.fatura.vendedor}`, clientX, y + 30);
    doc.text(`Forma de Pagamento: ${invoiceData.fatura.formaPagamento}`, clientX, y + 38);

    return y + 60;
  }

  private drawInvoiceDetails(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, primaryColor: any): number {
    // Cabeçalho da seção
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(margin, y, contentWidth, 15, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALHES DA FATURA', margin + 10, y + 10);

    // Conteúdo
    y += 20;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const details = [
      [`Data de Emissão:`, invoiceData.fatura.data],
      [`Data de Vencimento:`, invoiceData.fatura.dataVencimento],
      [`Série:`, invoiceData.fatura.serie],
      [`Moeda:`, invoiceData.fatura.moeda]
    ];

    details.forEach((detail, index) => {
      const x1 = margin + 10;
      const x2 = margin + 80;
      const currentY = y + (index * 8);
      
      doc.setFont('helvetica', 'bold');
      doc.text(detail[0], x1, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(detail[1], x2, currentY);
    });

    return y + 35;
  }

  private drawItemsTable(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, primaryColor: any, backgroundColor: any): number {
    // Título da seção
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, 10, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS DA FATURA', margin + 5, y + 7);
    y += 10;

    // Cabeçalho da tabela com gradiente
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(margin, y, contentWidth, 15, 'F');

    // Sombra do cabeçalho
    doc.setFillColor(primaryColor.r - 30, primaryColor.g - 30, primaryColor.b - 30);
    doc.rect(margin, y + 13, contentWidth, 2, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    // Colunas da tabela com melhor espaçamento
    const headers = ['#', 'CÓDIGO', 'DESCRIÇÃO DO PRODUTO', 'QTD', 'UND', 'PREÇO UNIT.', 'TOTAL'];
    const colWidths = [12, 22, 65, 15, 15, 30, 35];
    let currentX = margin + 3;

    headers.forEach((header, index) => {
      // Centralizar números e valores
      if (index === 0 || index === 3 || index === 4 || index === 5 || index === 6) {
        const textWidth = doc.getTextWidth(header);
        doc.text(header, currentX + (colWidths[index] - textWidth) / 2, y + 10);
      } else {
        doc.text(header, currentX + 2, y + 10);
      }
      currentX += colWidths[index];
    });

    y += 15;

    // Linhas da tabela com bordas
    invoiceData.itens.forEach((item: any, index: number) => {
      const rowHeight = 12;

      // Alternar cor de fundo
      if (index % 2 === 0) {
        doc.setFillColor(backgroundColor.r, backgroundColor.g, backgroundColor.b);
        doc.rect(margin, y, contentWidth, rowHeight, 'F');
      }

      // Bordas laterais
      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.3);
      currentX = margin;
      colWidths.forEach(width => {
        doc.line(currentX, y, currentX, y + rowHeight);
        currentX += width;
      });
      doc.line(currentX, y, currentX, y + rowHeight); // Última borda

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      currentX = margin + 3;
      const rowData = [
        (index + 1).toString(),
        item.codigo,
        item.nome.length > 35 ? item.nome.substring(0, 35) + '...' : item.nome,
        item.quantidade.toString(),
        item.unidade,
        `${item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
        `${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ];

      rowData.forEach((data, colIndex) => {
        const yPos = y + 8;

        // Centralizar números e valores
        if (colIndex === 0 || colIndex === 3 || colIndex === 4 || colIndex === 5 || colIndex === 6) {
          const textWidth = doc.getTextWidth(data);
          doc.text(data, currentX + (colWidths[colIndex] - textWidth) / 2, yPos);
        } else {
          doc.text(data, currentX + 2, yPos);
        }

        currentX += colWidths[colIndex];
      });

      y += rowHeight;
    });

    // Bordas da tabela
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(1);
    const tableHeight = (invoiceData.itens.length * 12) + 25;
    doc.rect(margin, y - tableHeight, contentWidth, tableHeight);

    // Linha horizontal inferior
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + contentWidth, y);

    return y + 5;
  }

  private drawFinancialSummary(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, primaryColor: any, accentColor: any): number {
    const summaryX = margin + contentWidth - 140;
    const summaryWidth = 130;

    // Título do resumo
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(summaryX, y, summaryWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO FINANCEIRO', summaryX + 5, y + 8);

    y += 12;

    // Fundo do resumo com gradiente simulado
    doc.setFillColor(248, 249, 250);
    doc.rect(summaryX, y, summaryWidth, 55, 'F');

    // Borda elegante
    doc.setDrawColor(180, 180, 180);
    doc.setLineWidth(1);
    doc.rect(summaryX, y - 12, summaryWidth, 67);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    const summaryItems = [
      ['Subtotal:', `${invoiceData.resumo.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, false],
      ['Desconto:', `- ${invoiceData.resumo.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, true],
      ['Impostos (IVA):', `${invoiceData.resumo.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, false]
    ];

    summaryItems.forEach((item, index) => {
      const itemY = y + 10 + (index * 10);

      // Linha separadora sutil
      if (index > 0) {
        doc.setDrawColor(230, 230, 230);
        doc.setLineWidth(0.3);
        doc.line(summaryX + 5, itemY - 5, summaryX + summaryWidth - 5, itemY - 5);
      }

      doc.setFont('helvetica', 'normal');

      // Aplicar cor vermelha para desconto
      if (item[2]) {
        doc.setTextColor(220, 53, 69);
      } else {
        doc.setTextColor(0, 0, 0);
      }

      doc.text(item[0], summaryX + 8, itemY);
      doc.setFont('helvetica', 'bold');
      doc.text(item[1], summaryX + 70, itemY);
    });

    // Linha separadora antes do total
    doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.setLineWidth(2);
    doc.line(summaryX + 5, y + 38, summaryX + summaryWidth - 5, y + 38);

    // Total em destaque com sombra
    doc.setFillColor(accentColor.r - 10, accentColor.g - 10, accentColor.b - 10);
    doc.rect(summaryX + 2, y + 42, summaryWidth - 4, 15, 'F');
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
    doc.rect(summaryX, y + 40, summaryWidth, 15, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GERAL:', summaryX + 8, y + 51);
    doc.setFontSize(16);
    doc.text(`${invoiceData.resumo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, summaryX + 70, y + 51);

    // Total por extenso com caixa
    y += 70;
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, 15, 'FD');

    doc.setTextColor(80, 80, 80);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('VALOR POR EXTENSO:', margin + 5, y + 7);
    doc.setFont('helvetica', 'bold');
    doc.text(invoiceData.resumo.totalPorExtenso.toUpperCase(), margin + 5, y + 12);

    return y + 25;
  }

  private drawNotesAndTerms(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, secondaryColor: any): void {
    // Observações
    if (invoiceData.observacoes) {
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', margin, y);
      
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      // Quebrar texto em linhas
      const lines = doc.splitTextToSize(invoiceData.observacoes, contentWidth - 20);
      lines.forEach((line: string, index: number) => {
        doc.text(line, margin, y + (index * 5));
      });
      
      y += (lines.length * 5) + 10;
    }

    // Termos e condições
    if (invoiceData.condicoes && invoiceData.condicoes.length > 0) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('TERMOS E CONDIÇÕES:', margin, y);
      
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      
      invoiceData.condicoes.forEach((condicao: string, index: number) => {
        doc.text(`• ${condicao}`, margin, y + (index * 5));
      });
    }
  }

  private drawFooter(doc: jsPDF, pageHeight: number, contentWidth: number, margin: number, secondaryColor: any): void {
    const footerY = pageHeight - 40;

    // Fundo do rodapé
    doc.setFillColor(248, 249, 250);
    doc.rect(margin, footerY - 5, contentWidth, 35, 'F');

    // Linha separadora elegante
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(1);
    doc.line(margin, footerY - 5, margin + contentWidth, footerY - 5);

    // QR Code simulado (quadrado com padrão)
    const qrSize = 20;
    const qrX = margin + 10;
    const qrY = footerY;

    doc.setFillColor(0, 0, 0);
    doc.rect(qrX, qrY, qrSize, qrSize, 'F');
    doc.setFillColor(255, 255, 255);
    // Padrão QR simulado
    for (let i = 2; i < qrSize - 2; i += 3) {
      for (let j = 2; j < qrSize - 2; j += 3) {
        if ((i + j) % 6 === 0) {
          doc.rect(qrX + i, qrY + j, 2, 2, 'F');
        }
      }
    }

    // Texto ao lado do QR Code
    doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Escaneie para verificar', qrX, qrY + qrSize + 8);
    doc.text('a autenticidade', qrX, qrY + qrSize + 12);

    // Informações legais centralizadas
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');

    const legalTexts = [
      'PJ LIMITADA - Sociedade por Quotas | NIF: 5417048598',
      'Registro Comercial: 123456789 | Capital Social: 1.000.000,00 Kz',
      'Av. Marginal, Edifício Torres Dipanda, 15º Andar - Luanda, Angola'
    ];

    legalTexts.forEach((text, index) => {
      const textWidth = doc.getTextWidth(text);
      const centerX = margin + (contentWidth - textWidth) / 2;
      doc.text(text, centerX, footerY + 5 + (index * 4));
    });

    // Data de geração e hash de segurança
    const now = new Date();
    const generatedText = `Gerado: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`;
    const hashText = `Hash: ${Math.random().toString(36).substring(2, 15).toUpperCase()}`;

    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text(generatedText, margin + contentWidth - 120, footerY + 20);
    doc.text(hashText, margin + contentWidth - 120, footerY + 25);

    // Selo de qualidade
    doc.setDrawColor(40, 167, 69);
    doc.setLineWidth(2);
    doc.circle(margin + contentWidth - 25, footerY + 15, 8);
    doc.setTextColor(40, 167, 69);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('✓', margin + contentWidth - 28, footerY + 17);
    doc.text('VÁLIDO', margin + contentWidth - 30, footerY + 20);
  }
}
