import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  generateInvoicePdf(invoiceData: any): void {
    const doc = new jsPDF();
    
    // Configurações
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = margin;

    // Cores
    const primaryColor = [51, 122, 183]; // Azul
    const textColor = [0, 0, 0]; // Preto

    // === CABEÇALHO ===
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(margin, y, pageWidth - (margin * 2), 40, 'F');
    
    // Logo e título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('PJ LIMITADA', margin + 10, y + 20);
    
    doc.setFontSize(20);
    doc.text('FATURA', pageWidth - 80, y + 20);
    
    doc.setFontSize(12);
    doc.text(`Nº ${invoiceData.fatura.numero}`, pageWidth - 80, y + 32);
    
    y += 50;

    // === INFORMAÇÕES DA EMPRESA ===
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DADOS DA EMPRESA:', margin, y);
    
    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoiceData.empresa.nome, margin, y);
    doc.text(invoiceData.empresa.endereco, margin, y + 6);
    doc.text(invoiceData.empresa.cidade, margin, y + 12);
    doc.text(`Tel: ${invoiceData.empresa.telefone}`, margin, y + 18);
    doc.text(`NIF: ${invoiceData.empresa.nif}`, margin, y + 24);

    // === INFORMAÇÕES DO CLIENTE ===
    const clientX = pageWidth / 2 + 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CLIENTE:', clientX, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoiceData.fatura.cliente, clientX, y + 8);
    doc.text(`Vendedor: ${invoiceData.fatura.vendedor}`, clientX, y + 14);
    doc.text(`Data: ${invoiceData.fatura.data}`, clientX, y + 20);
    doc.text(`Pagamento: ${invoiceData.fatura.formaPagamento}`, clientX, y + 26);

    y += 40;

    // === TABELA DE ITENS ===
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('ITENS DA FATURA:', margin, y);
    y += 10;

    // Cabeçalho da tabela
    doc.setFillColor(240, 240, 240);
    doc.rect(margin, y, pageWidth - (margin * 2), 10, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('DESCRIÇÃO', margin + 2, y + 7);
    doc.text('QTD', margin + 100, y + 7);
    doc.text('PREÇO', margin + 120, y + 7);
    doc.text('TOTAL', margin + 150, y + 7);
    
    y += 15;

    // Itens da tabela
    doc.setFont('helvetica', 'normal');
    invoiceData.itens.forEach((item: any, index: number) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248);
        doc.rect(margin, y - 3, pageWidth - (margin * 2), 12, 'F');
      }
      
      doc.text(item.nome, margin + 2, y + 5);
      doc.text(item.quantidade.toString(), margin + 100, y + 5);
      doc.text(`${item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, margin + 120, y + 5);
      doc.text(`${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, margin + 150, y + 5);
      
      y += 12;
    });

    y += 10;

    // === RESUMO ===
    const resumoX = pageWidth - 120;
    doc.setFillColor(240, 240, 240);
    doc.rect(resumoX, y, 100, 40, 'F');
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Subtotal:', resumoX + 5, y + 10);
    doc.text(`${invoiceData.resumo.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, resumoX + 50, y + 10);
    
    doc.text('Desconto:', resumoX + 5, y + 20);
    doc.text(`${invoiceData.resumo.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, resumoX + 50, y + 20);
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('TOTAL:', resumoX + 5, y + 35);
    doc.text(`${invoiceData.resumo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} Kz`, resumoX + 50, y + 35);

    y += 50;

    // === OBSERVAÇÕES ===
    if (invoiceData.observacoes) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('OBSERVAÇÕES:', margin, y);
      
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(invoiceData.observacoes, pageWidth - (margin * 2) - 20);
      lines.forEach((line: string) => {
        doc.text(line, margin, y);
        y += 5;
      });
    }

    // === RODAPÉ ===
    const footerY = doc.internal.pageSize.getHeight() - 30;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('Documento gerado automaticamente pelo sistema PJ Limitada', margin, footerY);
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, margin, footerY + 8);

    // Salvar PDF
    const fileName = `Fatura_${invoiceData.fatura.numero}_${invoiceData.fatura.data.replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
  }
}
