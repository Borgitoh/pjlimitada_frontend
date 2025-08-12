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
    // Fundo do cabeçalho
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(margin, y, contentWidth, 45, 'F');

    // Logo (simulado com texto estilizado)
    doc.setFontSize(32);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('PJ', margin + 10, y + 25);
    
    // Circle around logo
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(3);
    doc.circle(margin + 20, y + 20, 15);

    // Título FATURA
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('FATURA', margin + contentWidth - 80, y + 20);
    
    // Subtítulo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('INVOICE', margin + contentWidth - 50, y + 32);

    // Número da fatura em destaque
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Nº ${invoiceData.fatura.numero}`, margin + contentWidth - 80, y + 42);
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
    // Cabeçalho da tabela
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(margin, y, contentWidth, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    
    // Colunas da tabela
    const headers = ['CÓDIGO', 'DESCRIÇÃO', 'QTD', 'UNIDADE', 'PREÇO UNIT.', 'TOTAL'];
    const colWidths = [25, 70, 20, 25, 30, 30];
    let currentX = margin + 5;
    
    headers.forEach((header, index) => {
      doc.text(header, currentX, y + 8);
      currentX += colWidths[index];
    });

    y += 12;

    // Linhas da tabela
    invoiceData.itens.forEach((item: any, index: number) => {
      // Alternar cor de fundo
      if (index % 2 === 0) {
        doc.setFillColor(backgroundColor.r, backgroundColor.g, backgroundColor.b);
        doc.rect(margin, y, contentWidth, 10, 'F');
      }

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      currentX = margin + 5;
      const rowData = [
        item.codigo,
        item.nome.length > 30 ? item.nome.substring(0, 30) + '...' : item.nome,
        item.quantidade.toString(),
        item.unidade,
        `${item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`,
        `${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`
      ];

      rowData.forEach((data, colIndex) => {
        doc.text(data, currentX, y + 7);
        currentX += colWidths[colIndex];
      });

      y += 10;
    });

    // Borda da tabela
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(margin, y - (invoiceData.itens.length * 10) - 12, contentWidth, (invoiceData.itens.length * 10) + 12);

    return y + 10;
  }

  private drawFinancialSummary(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, primaryColor: any, accentColor: any): number {
    const summaryX = margin + contentWidth - 120;
    const summaryWidth = 110;

    // Fundo do resumo
    doc.setFillColor(248, 249, 250);
    doc.rect(summaryX, y, summaryWidth, 45, 'F');

    // Borda
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(summaryX, y, summaryWidth, 45);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);

    const summaryItems = [
      ['Subtotal:', `${invoiceData.resumo.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`],
      ['Desconto:', `${invoiceData.resumo.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`],
      ['Impostos:', `${invoiceData.resumo.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`]
    ];

    summaryItems.forEach((item, index) => {
      const itemY = y + 10 + (index * 8);
      doc.setFont('helvetica', 'normal');
      doc.text(item[0], summaryX + 5, itemY);
      doc.text(item[1], summaryX + 55, itemY);
    });

    // Total em destaque
    doc.setFillColor(accentColor.r, accentColor.g, accentColor.b);
    doc.rect(summaryX, y + 32, summaryWidth, 13, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', summaryX + 5, y + 42);
    doc.text(`${invoiceData.resumo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, summaryX + 55, y + 42);

    // Total por extenso
    y += 55;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`Total por extenso: ${invoiceData.resumo.totalPorExtenso}`, margin + 10, y);

    return y + 10;
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
    const footerY = pageHeight - 20;
    
    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY - 5, margin + contentWidth, footerY - 5);
    
    // Texto do rodapé
    doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    
    const footerText = 'Este documento foi gerado automaticamente pelo sistema PJ Limitada';
    const textWidth = doc.getTextWidth(footerText);
    const centerX = margin + (contentWidth - textWidth) / 2;
    
    doc.text(footerText, centerX, footerY);
    
    // Data de geração
    const now = new Date();
    const generatedText = `Gerado em: ${now.toLocaleDateString('pt-BR')} às ${now.toLocaleTimeString('pt-BR')}`;
    const generatedWidth = doc.getTextWidth(generatedText);
    const rightX = margin + contentWidth - generatedWidth;
    
    doc.text(generatedText, rightX, footerY + 8);
  }
}
