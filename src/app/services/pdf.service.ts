import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generateInvoicePdf(invoiceData: any): void {
    const pdf = new jsPDF();
    
    // Título
    pdf.setFontSize(20);
    pdf.text('FATURA DE VENDA', 20, 20);
    
    // Informações da empresa
    pdf.setFontSize(12);
    pdf.text('PJ LIMITADA', 20, 40);
    pdf.text('Peças Automotivas Premium', 20, 50);
    pdf.text('Luanda, Angola', 20, 60);
    pdf.text('Tel: +244 923 456 789', 20, 70);
    
    // Número da fatura
    pdf.text(`Fatura: ${invoiceData.fatura.numero}`, 20, 90);
    pdf.text(`Data: ${invoiceData.fatura.data}`, 20, 100);
    pdf.text(`Cliente: ${invoiceData.fatura.cliente}`, 20, 110);
    pdf.text(`Vendedor: ${invoiceData.fatura.vendedor}`, 20, 120);
    
    // Itens
    let yPosition = 140;
    pdf.text('ITENS:', 20, yPosition);
    yPosition += 10;
    
    invoiceData.itens.forEach((item: any) => {
      pdf.text(`${item.nome} - Qtd: ${item.quantidade} - KZ ${item.total.toFixed(2)}`, 20, yPosition);
      yPosition += 10;
    });
    
    // Total
    yPosition += 10;
    pdf.setFontSize(14);
    pdf.text(`TOTAL: KZ ${invoiceData.resumo.total.toFixed(2)}`, 20, yPosition);
    
    // Baixar
    const fileName = `Fatura_${invoiceData.fatura.numero}.pdf`;
    pdf.save(fileName);
  }
}
