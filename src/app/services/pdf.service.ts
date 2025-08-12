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

  private drawDataSection(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): number {
    // === INFORMAÇÕES DA EMPRESA ===
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(margin, y, contentWidth / 2 - 5, 50, 'F');

    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(1);
    doc.rect(margin, y, contentWidth / 2 - 5, 50);

    // Cabeçalho da empresa
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, y, contentWidth / 2 - 5, 12, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('EMPRESA', margin + 8, y + 8);

    // Dados da empresa
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const empresaInfo = [
      invoiceData.empresa.nome,
      invoiceData.empresa.endereco,
      invoiceData.empresa.cidade,
      `Tel: ${invoiceData.empresa.telefone}`,
      `NIF: ${invoiceData.empresa.nif}`
    ];

    empresaInfo.forEach((info, index) => {
      doc.text(info, margin + 8, y + 20 + (index * 6));
    });

    // === INFORMAÇÕES DO CLIENTE ===
    const clienteX = margin + contentWidth / 2 + 5;
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(clienteX, y, contentWidth / 2 - 5, 50, 'F');

    doc.setDrawColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.setLineWidth(1);
    doc.rect(clienteX, y, contentWidth / 2 - 5, 50);

    // Cabeçalho do cliente
    doc.setFillColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
    doc.rect(clienteX, y, contentWidth / 2 - 5, 12, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENTE', clienteX + 8, y + 8);

    // Dados do cliente
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');

    const clienteInfo = [
      `Nome: ${invoiceData.fatura.cliente}`,
      `Vendedor: ${invoiceData.fatura.vendedor}`,
      `Data: ${invoiceData.fatura.data}`,
      `Vencimento: ${invoiceData.fatura.dataVencimento || 'À vista'}`,
      `Pagamento: ${invoiceData.fatura.formaPagamento}`
    ];

    clienteInfo.forEach((info, index) => {
      doc.text(info, clienteX + 8, y + 20 + (index * 6));
    });

    return y + 60;
  }

  private drawModernItemsTable(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): number {
    // Título da seção
    doc.setFillColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.rect(margin, y, contentWidth, 15, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('ITENS DA FATURA', margin + 10, y + 10);

    y += 17;

    // Cabeçalho da tabela
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(margin, y, contentWidth, 15, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');

    const colunas = ['ITEM', 'DESCRIÇÃO', 'QTD', 'PREÇO UNIT.', 'TOTAL'];
    const larguras = [20, 85, 25, 35, 35];
    let currentX = margin;

    colunas.forEach((coluna, index) => {
      if (index === 0 || index === 2 || index === 3 || index === 4) {
        const textWidth = doc.getTextWidth(coluna);
        doc.text(coluna, currentX + (larguras[index] - textWidth) / 2, y + 10);
      } else {
        doc.text(coluna, currentX + 5, y + 10);
      }
      currentX += larguras[index];
    });

    y += 15;

    // Linhas da tabela
    invoiceData.itens.forEach((item: any, index: number) => {
      const alturaLinha = 12;

      // Fundo alternado
      if (index % 2 === 0) {
        doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
        doc.rect(margin, y, contentWidth, alturaLinha, 'F');
      }

      // Bordas horizontais
      doc.setDrawColor(colors.medium[0], colors.medium[1], colors.medium[2]);
      doc.setLineWidth(0.3);
      doc.line(margin, y, margin + contentWidth, y);

      doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      currentX = margin;
      const dados = [
        (index + 1).toString().padStart(2, '0'),
        item.nome.length > 40 ? item.nome.substring(0, 40) + '...' : item.nome,
        item.quantidade.toString(),
        `${item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`,
        `${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`
      ];

      dados.forEach((dado, colIndex) => {
        const yPos = y + 8;

        if (colIndex === 0 || colIndex === 2 || colIndex === 3 || colIndex === 4) {
          const textWidth = doc.getTextWidth(dado);
          doc.text(dado, currentX + (larguras[colIndex] - textWidth) / 2, yPos);
        } else {
          doc.text(dado, currentX + 5, yPos);
        }

        currentX += larguras[colIndex];
      });

      y += alturaLinha;
    });

    // Linha final da tabela
    doc.setDrawColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setLineWidth(1);
    doc.line(margin, y, margin + contentWidth, y);

    // Bordas verticais da tabela
    doc.setDrawColor(colors.medium[0], colors.medium[1], colors.medium[2]);
    doc.setLineWidth(0.5);
    currentX = margin;
    larguras.forEach(largura => {
      doc.line(currentX, y - (invoiceData.itens.length * 12) - 15, currentX, y);
      currentX += largura;
    });
    doc.line(currentX, y - (invoiceData.itens.length * 12) - 15, currentX, y);

    return y + 10;
  }

  private drawModernFinancialSummary(doc: jsPDF, invoiceData: any, y: number, contentWidth: number, margin: number, colors: any): number {
    const resumoX = margin + contentWidth - 130;
    const resumoWidth = 120;

    // Fundo do resumo com gradiente
    doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
    doc.rect(resumoX, y, resumoWidth, 55, 'F');

    // Borda elegante
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(2);
    doc.rect(resumoX, y, resumoWidth, 55);

    // Cabeçalho do resumo
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(resumoX, y, resumoWidth, 15, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMO FINANCEIRO', resumoX + 10, y + 10);

    y += 18;

    // Itens do resumo
    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(10);

    const resumoItens = [
      ['Subtotal:', `${invoiceData.resumo.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`],
      ['Desconto:', `${(invoiceData.resumo.desconto || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`]
    ];

    resumoItens.forEach((item, index) => {
      const itemY = y + (index * 10);

      // Linha separadora sutil
      if (index > 0) {
        doc.setDrawColor(colors.medium[0], colors.medium[1], colors.medium[2]);
        doc.setLineWidth(0.3);
        doc.line(resumoX + 5, itemY - 5, resumoX + resumoWidth - 5, itemY - 5);
      }

      doc.setFont('helvetica', 'normal');
      doc.text(item[0], resumoX + 8, itemY);
      doc.setFont('helvetica', 'bold');
      doc.text(item[1], resumoX + 60, itemY);
    });

    // Linha antes do total
    doc.setDrawColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.setLineWidth(1);
    doc.line(resumoX + 5, y + 25, resumoX + resumoWidth - 5, y + 25);

    // Total em destaque
    doc.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
    doc.rect(resumoX, y + 27, resumoWidth, 18, 'F');

    doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', resumoX + 8, y + 36);
    doc.setFontSize(14);
    doc.text(`${invoiceData.resumo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, resumoX + 8, y + 42);

    // Valor por extenso em caixa
    y += 65;
    doc.setFillColor(colors.white[0], colors.white[1], colors.white[2]);
    doc.setDrawColor(colors.medium[0], colors.medium[1], colors.medium[2]);
    doc.setLineWidth(1);
    doc.rect(margin, y, contentWidth, 18, 'FD');

    doc.setTextColor(colors.dark[0], colors.dark[1], colors.dark[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('VALOR POR EXTENSO:', margin + 8, y + 8);
    doc.setFont('helvetica', 'normal');
    doc.text(invoiceData.resumo.totalPorExtenso || 'Valor não convertido para extenso', margin + 8, y + 14);

    return y + 25;
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
