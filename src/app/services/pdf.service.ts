import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generateInvoicePdf(invoiceData: any): void {
    const doc = new jsPDF();

    // Configurações minimalistas - seguindo modelo SMILODON
    const margin = 25;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const contentWidth = pageWidth - (margin * 2);

    // Cores minimalistas e profissionais
    const colors = {
      primary: [52, 73, 156],     // Azul profissional como SMILODON
      text: [75, 85, 99],         // Cinza escuro para texto
      lightText: [107, 114, 128], // Cinza claro para subtextos
      border: [229, 231, 235],    // Bordas sutis
      background: [249, 250, 251] // Fundo muito sutil
    };

    let y = margin;

    // === CABEÇALHO LIMPO ESTILO SMILODON ===
    this.drawCleanHeader(doc, invoiceData, y, contentWidth, margin, colors);
    y += 50;

    // === DADOS DA EMPRESA (simples) ===
    y = this.drawCompanyInfo(doc, invoiceData, y, margin, colors);
    y += 40;

    // === FATURAR PARA ===
    y = this.drawBillTo(doc, invoiceData, y, margin, colors);
    y += 30;

    // === TABELA LIMPA DE PRODUTOS ===
    y = this.drawCleanTable(doc, invoiceData, y, contentWidth, margin, colors);
    y += 20;

    // === RESUMO FINANCEIRO ALINHADO ===
    y = this.drawCleanSummary(doc, invoiceData, y, contentWidth, margin, colors);
    y += 30;

    // === MENSAGEM DE AGRADECIMENTO ===
    this.drawThankYouMessage(doc, y, margin, colors);

    // Salvar com nome limpo
    const fileName = `Fatura_${invoiceData.fatura.numero}.pdf`;
    doc.save(fileName);
  }

  private drawCleanHeader(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): void {
    // Nome da empresa no estilo SMILODON - lado esquerdo
    doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    doc.text('PJ LIMITADA', margin, y + 20);

    // FATURA grande - lado direito
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(32);
    doc.setFont('helvetica', 'bold');
    const faturaText = 'FATURA';
    const faturaWidth = doc.getTextWidth(faturaText);
    doc.text(faturaText, margin + contentWidth - faturaWidth, y + 20);

    // Informações da fatura - lado direito
    doc.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const faturaInfo = [
      `Número: ${invoiceData.fatura.numero}`,
      `Data: ${invoiceData.fatura.data}`,
      `Vencimento: ${invoiceData.fatura.dataVencimento || 'À vista'}`
    ];

    faturaInfo.forEach((info, index) => {
      const infoWidth = doc.getTextWidth(info);
      doc.text(info, margin + contentWidth - infoWidth, y + 35 + (index * 8));
    });
  }

  private drawCompanyInfo(doc: jsPDF, invoiceData: any, y: number, margin: number, colors: any): number {
    // Informações da empresa - estilo minimalista
    doc.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    doc.text('Peças Automotivas Premium', margin, y);
    doc.text('Luanda, Angola', margin, y + 8);
    doc.text('contato@pjlimitada.com', margin, y + 16);

    return y + 24;
  }

  private drawBillTo(doc: jsPDF, invoiceData: any, y: number, margin: number, colors: any): number {
    // Título "Faturar a:"
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Faturar a:', margin, y);

    // Nome do cliente
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.fatura.cliente, margin, y + 12);

    return y + 20;
  }

  private drawCleanTable(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): number {
    // Cabeçalho da tabela - estilo SMILODON
    doc.setFillColor(colors.background[0], colors.background[1], colors.background[2]);
    doc.rect(margin, y, contentWidth, 12, 'F');

    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.5);
    doc.rect(margin, y, contentWidth, 12);

    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');

    // Colunas simples como SMILODON
    const colunas = ['Produto', 'Qtd', 'Preço Unit.', 'Total'];
    const larguras = [85, 25, 40, 40];
    let currentX = margin + 5;

    colunas.forEach((coluna, index) => {
      if (index === 1 || index === 2 || index === 3) {
        const textWidth = doc.getTextWidth(coluna);
        doc.text(coluna, currentX + (larguras[index] - textWidth) / 2, y + 8);
      } else {
        doc.text(coluna, currentX, y + 8);
      }
      currentX += larguras[index];
    });

    y += 12;

    // Linhas da tabela - minimalistas
    invoiceData.itens.forEach((item: any, index: number) => {
      const alturaLinha = 15;

      // Borda inferior sutil
      doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, y + alturaLinha, margin + contentWidth, y + alturaLinha);

      doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      currentX = margin + 5;
      const dados = [
        item.nome,
        item.quantidade.toString(),
        `${item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`,
        `${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`
      ];

      dados.forEach((dado, colIndex) => {
        const yPos = y + 10;

        if (colIndex === 1 || colIndex === 2 || colIndex === 3) {
          const textWidth = doc.getTextWidth(dado);
          doc.text(dado, currentX + (larguras[colIndex] - textWidth) / 2, yPos);
        } else {
          doc.text(dado, currentX, yPos);
        }

        currentX += larguras[colIndex];
      });

      y += alturaLinha;
    });

    return y + 10;
  }

  private drawCleanSummary(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): number {
    // Resumo financeiro alinhado à direita - estilo SMILODON
    const resumoX = margin + contentWidth - 120;

    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    // Subtotal
    doc.text('Subtotal:', resumoX, y);
    const subtotalText = `${invoiceData.resumo.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`;
    const subtotalWidth = doc.getTextWidth(subtotalText);
    doc.text(subtotalText, resumoX + 120 - subtotalWidth, y);

    // IVA (se houver)
    if (invoiceData.resumo.impostos && invoiceData.resumo.impostos > 0) {
      doc.text('IVA (18%):', resumoX, y + 10);
      const ivaText = `${invoiceData.resumo.impostos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`;
      const ivaWidth = doc.getTextWidth(ivaText);
      doc.text(ivaText, resumoX + 120 - ivaWidth, y + 10);
      y += 10;
    }

    // Linha separadora
    doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
    doc.setLineWidth(0.5);
    doc.line(resumoX, y + 15, resumoX + 120, y + 15);

    // Total em destaque
    doc.setTextColor(colors.text[0], colors.text[1], colors.text[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Total:', resumoX, y + 25);

    const totalText = `${invoiceData.resumo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`;
    const totalWidth = doc.getTextWidth(totalText);
    doc.text(totalText, resumoX + 120 - totalWidth, y + 25);

    return y + 35;
  }

  private drawThankYouMessage(doc: jsPDF, y: number, margin: number, colors: any): void {
    // Mensagem de agradecimento - estilo SMILODON
    doc.setTextColor(colors.lightText[0], colors.lightText[1], colors.lightText[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Obrigado pela preferência!', margin, y);
  }

  private drawCorporateFooter(doc: jsPDF, pageHeight: number, contentWidth: number, margin: number, colors: any, invoiceData: any): void {
    const footerY = pageHeight - 40;

    // Observações (se existirem)
    if (invoiceData.observacoes) {
      doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES:', margin, footerY - 25);

      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      const linhas = doc.splitTextToSize(invoiceData.observacoes, contentWidth - 20);
      linhas.forEach((linha: string, index: number) => {
        doc.text(linha, margin, footerY - 18 + (index * 4));
      });
    }

    // Linha decorativa superior
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(2);
    doc.line(margin, footerY - 2, margin + contentWidth, footerY - 2);

    // Fundo do rodapé
    doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.rect(margin, footerY, contentWidth, 35, 'F');

    // Faixa colorida superior
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, footerY, contentWidth, 3, 'F');

    // Informações legais principais
    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('PJ LIMITADA - PEÇAS AUTOMOTIVAS', margin + 10, footerY + 12);

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Sociedade por Quotas | NIF: 5417048598 | Registro Comercial: 123456789', margin + 10, footerY + 17);
    doc.text('Av. Marginal, Edifício Torres Dipanda, 15º Andar - Luanda, Angola', margin + 10, footerY + 21);
    doc.text('Tel: +244 923 456 789 | Email: contato@pjlimitada.com', margin + 10, footerY + 25);

    // Informações de geração (lado direito)
    const agora = new Date();
    const textoGeracao = `Gerado: ${agora.toLocaleDateString('pt-BR')} ${agora.toLocaleTimeString('pt-BR')}`;
    const hash = Math.random().toString(36).substring(2, 12).toUpperCase();

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text(textoGeracao, margin + contentWidth - 80, footerY + 17);
    doc.text(`Hash: ${hash}`, margin + contentWidth - 80, footerY + 21);

    // Selo de autenticidade
    doc.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
    doc.circle(margin + contentWidth - 20, footerY + 20, 8);

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text('✓', margin + contentWidth - 23, footerY + 22);
    doc.text('VÁLIDO', margin + contentWidth - 28, footerY + 28);
  }
}
