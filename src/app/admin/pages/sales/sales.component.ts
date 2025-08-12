import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { Sale, SaleItem, Product, User, TableColumn, TableAction } from '../../models/admin.models';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit, OnDestroy {
  sales: Sale[] = [];
  filteredSales: Sale[] = [];
  availableProducts: Product[] = [];
  sellers: User[] = [];

  // Filters
  dateFrom: string = '';
  dateTo: string = '';
  selectedSeller: string = '';
  selectedPayment: string = '';

  // Stats
  todaySales = 0;
  todayCount = 0;
  monthSales = 0;
  averageTicket = 0;

  // Form
  currentSale: any = {
    date: new Date().toISOString().split('T')[0],
    sellerId: '',
    customerName: '',
    items: [],
    discount: 0,
    paymentMethod: '',
    notes: '',
    subtotal: 0,
    total: 0
  };

  isModalOpen = false;
  modalTitle = '';
  editMode = false;

  private destroy$ = new Subject<void>();

  tableColumns: TableColumn[] = [
    { key: 'date', label: 'Data', type: 'date', sortable: true },
    { key: 'sellerName', label: 'Vendedor', sortable: true, type: 'text' },
    { key: 'customerName', label: 'Cliente', type: 'text' },
    { key: 'itemsCount', label: 'Itens', type: 'number' },
    { key: 'total', label: 'Total', type: 'currency', sortable: true },
    { key: 'paymentMethodLabel', label: 'Pagamento', type: 'text' },
    { key: 'actions', label: 'Ações', type: 'actions', width: '120px' }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Ver Detalhes',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      type: 'primary',
      action: (sale: Sale) => this.viewSale(sale)
    },
    {
      label: 'Baixar Fatura',
      icon: 'M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2z',
      type: 'success',
      action: (sale: Sale) => this.downloadInvoice(sale)
    },
    {
      label: 'Imprimir',
      icon: 'M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z',
      type: 'secondary',
      action: (sale: Sale) => this.printSale(sale)
    }
  ];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadSales();
    this.loadProducts();
    this.loadSellers();
    this.calculateStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openSaleModal(): void {
    this.editMode = false;
    this.modalTitle = 'Nova Venda';
    this.currentSale = {
      date: new Date().toISOString().split('T')[0],
      sellerId: '',
      customerName: '',
      items: [this.createEmptyItem()],
      discount: 0,
      paymentMethod: '',
      notes: '',
      subtotal: 0,
      total: 0
    };
    this.isModalOpen = true;
  }

  viewSale(sale: Sale): void {
    this.editMode = true;
    this.modalTitle = 'Detalhes da Venda';
    this.currentSale = {
      ...sale,
      date: new Date(sale.date).toISOString().split('T')[0]
    };
    this.isModalOpen = true;
  }

  printSale(sale: Sale): void {
    alert(`Função de impressão seria implementada aqui para a venda #${sale.id}`);
  }

  async downloadInvoice(sale: Sale): Promise<void> {
    try {
      // Gerar dados da fatura
      const invoiceData = this.generateInvoiceData(sale);

      // Criar PDF usando jsPDF
      const pdf = new jsPDF('p', 'mm', 'a4');

      // Configurações de cores
      const primaryColor: [number, number, number] = [0, 188, 212]; // PJ Cyan
      const darkColor: [number, number, number] = [0, 96, 100];
      const lightGray: [number, number, number] = [245, 245, 245];
      const textColor: [number, number, number] = [33, 33, 33];

      // Header com logo e informações da empresa
      await this.addCompanyHeader(pdf, primaryColor, darkColor);

      // Título da fatura
      pdf.setFillColor(...primaryColor);
      pdf.rect(20, 60, 170, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('FATURA DE VENDA', 105, 70, { align: 'center' });

      // Informações da fatura
      this.addInvoiceInfo(pdf, invoiceData, textColor, 85);

      // Informações do cliente
      this.addClientInfo(pdf, invoiceData, textColor, 110);

      // Tabela de itens
      this.addItemsTable(pdf, invoiceData, primaryColor, lightGray, textColor, 135);

      // Resumo financeiro
      this.addFinancialSummary(pdf, invoiceData, primaryColor, textColor);

      // Rodapé
      this.addFooter(pdf, primaryColor, textColor);

      // Baixar o PDF
      const fileName = `Fatura_${sale.id}_${new Date(sale.date).toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar a fatura. Tente novamente.');
    }
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.resetForm();
  }

  isFormValid(): boolean {
    return !!(
      this.currentSale.date &&
      this.currentSale.sellerId &&
      this.currentSale.paymentMethod &&
      this.currentSale.items.length > 0 &&
      this.currentSale.items.every((item: any) => item.productId && item.quantity > 0)
    );
  }

  saveSale(): void {
    if (!this.isFormValid()) return;

    if (!this.editMode) {
      const newSale: Sale = {
        id: Date.now().toString(),
        date: new Date(this.currentSale.date),
        sellerId: this.currentSale.sellerId,
        sellerName: this.getSellerName(this.currentSale.sellerId),
        items: this.currentSale.items,
        subtotal: this.currentSale.subtotal,
        discount: this.currentSale.discount || 0,
        total: this.currentSale.total,
        paymentMethod: this.currentSale.paymentMethod,
        customerName: this.currentSale.customerName,
        notes: this.currentSale.notes
      };
      this.sales.unshift(newSale);
      this.filterSales();
      this.calculateStats();
    }

    this.closeModal();
  }

  addItem(): void {
    this.currentSale.items.push(this.createEmptyItem());
  }

  removeItem(index: number): void {
    this.currentSale.items.splice(index, 1);
    this.updateSaleTotal();
  }

  updateItemProduct(index: number, productId: string): void {
    const product = this.availableProducts.find(p => p.id === productId);
    if (product) {
      this.currentSale.items[index].productName = product.name;
      this.currentSale.items[index].unitPrice = product.price;
      this.updateItemTotal(index);
    }
  }

  updateItemTotal(index: number): void {
    const item = this.currentSale.items[index];
    item.total = (item.quantity || 0) * (item.unitPrice || 0);
    this.updateSaleTotal();
  }

  updateSaleTotal(): void {
    this.currentSale.subtotal = this.currentSale.items.reduce((sum: number, item: any) => sum + (item.total || 0), 0);
    this.currentSale.total = this.currentSale.subtotal - (this.currentSale.discount || 0);
  }

  filterSales(): void {
    let filtered = [...this.sales];

    // Date filters
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(sale => new Date(sale.date) >= fromDate);
    }

    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      filtered = filtered.filter(sale => new Date(sale.date) <= toDate);
    }

    // Seller filter
    if (this.selectedSeller) {
      filtered = filtered.filter(sale => sale.sellerId === this.selectedSeller);
    }

    // Payment filter
    if (this.selectedPayment) {
      filtered = filtered.filter(sale => sale.paymentMethod === this.selectedPayment);
    }

    // Add calculated fields for display
    this.filteredSales = filtered.map(sale => ({
      ...sale,
      itemsCount: sale.items.length,
      paymentMethodLabel: this.getPaymentMethodLabel(sale.paymentMethod)
    })) as any;
  }

  private loadSales(): void {
    this.adminService.getSales()
      .pipe(takeUntil(this.destroy$))
      .subscribe(sales => {
        this.sales = sales;
        this.filterSales();
        this.calculateStats();
      });
  }

  private loadProducts(): void {
    this.adminService.getProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(products => {
        this.availableProducts = products.filter(p => p.active);
      });
  }

  private loadSellers(): void {
    this.adminService.getUsers()
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.sellers = users.filter(u => u.active && (u.role === 'seller' || u.role === 'manager' || u.role === 'admin'));
      });
  }

  private calculateStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySales = this.sales.filter(sale => {
      const saleDate = new Date(sale.date);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });

    this.todaySales = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    this.todayCount = todaySales.length;

    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const monthSales = this.sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return saleDate.getMonth() === currentMonth && saleDate.getFullYear() === currentYear;
    });

    this.monthSales = monthSales.reduce((sum, sale) => sum + sale.total, 0);
    this.averageTicket = this.sales.length > 0 ? this.sales.reduce((sum, sale) => sum + sale.total, 0) / this.sales.length : 0;
  }

  private createEmptyItem(): SaleItem {
    return {
      productId: '',
      productName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
  }

  private getSellerName(sellerId: string): string {
    const seller = this.sellers.find(s => s.id === sellerId);
    return seller ? seller.name : 'Vendedor não encontrado';
  }

  private getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'cash': 'Dinheiro',
      'card': 'Cartão',
      'transfer': 'Transferência'
    };
    return labels[method] || method;
  }

  private resetForm(): void {
    this.currentSale = {
      date: new Date().toISOString().split('T')[0],
      sellerId: '',
      customerName: '',
      items: [],
      discount: 0,
      paymentMethod: '',
      notes: '',
      subtotal: 0,
      total: 0
    };
  }

  private generateInvoiceData(sale: Sale) {
    const currentDate = new Date();
    const saleDate = new Date(sale.date);

    return {
      empresa: {
        nome: 'PJ Limitada',
        endereco: 'Avenida Marginal, Edifício Torres Dipanda, 15º Andar',
        cidade: 'Luanda, Angola',
        telefone: '+244 923 456 789',
        email: 'contato@pjlimitada.com',
        website: 'www.pjlimitada.com',
        nif: '5417048598',
        registro: 'Registro Comercial: 123456789'
      },
      fatura: {
        numero: `FAT-${sale.id}`,
        serie: '001',
        data: saleDate.toLocaleDateString('pt-BR'),
        dataVencimento: new Date(saleDate.getTime() + (30 * 24 * 60 * 60 * 1000)).toLocaleDateString('pt-BR'),
        vendedor: sale.sellerName,
        cliente: sale.customerName || 'Cliente Geral',
        formaPagamento: this.getPaymentMethodLabel(sale.paymentMethod),
        moeda: 'Kwanza (KZ)'
      },
      itens: sale.items.map((item, index) => ({
        codigo: `${index + 1}`.padStart(3, '0'),
        nome: item.productName,
        descricao: `Peça automotiva de alta qualidade`,
        quantidade: item.quantity,
        unidade: 'UN',
        precoUnitario: item.unitPrice,
        total: item.total,
        categoria: 'Peças Automotivas'
      })),
      resumo: {
        subtotal: sale.subtotal,
        desconto: sale.discount || 0,
        impostos: 0, // Angola pode ter IVA
        total: sale.total,
        totalPorExtenso: this.numberToWords(sale.total)
      },
      observacoes: sale.notes || 'Garantia de 6 meses em todas as peças. Válido apenas com apresentação desta fatura.',
      condicoes: [
        'Pagamento conforme condições acordadas',
        'Mercadoria viajam por conta e risco do comprador',
        'Não nos responsabilizamos por avarias após a entrega',
        'Garantia válida apenas com apresentação desta fatura'
      ]
    };
  }

  private numberToWords(value: number): string {
    // Implementação simples para converter número em palavras (português)
    if (value === 0) return 'Zero kwanzas';

    const ones = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove'];
    const teens = ['dez', 'onze', 'doze', 'treze', 'catorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove'];
    const tens = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa'];
    const hundreds = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos', 'seiscentos', 'setecentos', 'oitocentos', 'novecentos'];

    const integerPart = Math.floor(value);
    const decimalPart = Math.round((value - integerPart) * 100);

    let result = '';

    if (integerPart >= 1000000) {
      const millions = Math.floor(integerPart / 1000000);
      result += `${millions === 1 ? 'um milhão' : millions + ' milhões'} `;
      integerPart %= 1000000;
    }

    if (integerPart >= 1000) {
      const thousands = Math.floor(integerPart / 1000);
      if (thousands === 1) {
        result += 'mil ';
      } else {
        result += `${thousands} mil `;
      }
      integerPart %= 1000;
    }

    if (integerPart >= 100) {
      if (integerPart === 100) {
        result += 'cem ';
      } else {
        result += hundreds[Math.floor(integerPart / 100)] + ' ';
      }
      integerPart %= 100;
    }

    if (integerPart >= 20) {
      result += tens[Math.floor(integerPart / 10)];
      if (integerPart % 10 > 0) {
        result += ' e ' + ones[integerPart % 10];
      }
    } else if (integerPart >= 10) {
      result += teens[integerPart - 10];
    } else if (integerPart > 0) {
      result += ones[integerPart];
    }

    result += ' kwanzas';

    if (decimalPart > 0) {
      result += ` e ${decimalPart} cêntimos`;
    }

    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  private async addCompanyHeader(pdf: jsPDF, primaryColor: [number, number, number], darkColor: [number, number, number]): Promise<void> {
    // Background header
    pdf.setFillColor(...primaryColor);
    pdf.rect(0, 0, 210, 50, 'F');

    // Logo placeholder (círculo com PJ)
    pdf.setFillColor(255, 255, 255);
    pdf.circle(35, 25, 15, 'F');
    pdf.setTextColor(...darkColor);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PJ', 35, 30, { align: 'center' });

    // Company info
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PJ LIMITADA', 60, 20);

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Peças Automotivas Premium', 60, 30);
    pdf.text('Luanda, Angola', 60, 38);
    pdf.text('Tel: +244 923 456 789 | Email: contato@pjlimitada.com', 60, 46);
  }

  private addInvoiceInfo(pdf: jsPDF, data: any, textColor: [number, number, number], yPosition: number): void {
    // Box para informações da fatura
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.rect(20, yPosition, 80, 20);

    pdf.setTextColor(...textColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('INFORMAÇÕES DA FATURA', 22, yPosition + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`Número: ${data.fatura.numero}`, 22, yPosition + 12);
    pdf.text(`Data: ${data.fatura.data}`, 22, yPosition + 16);

    // Box para vendedor
    pdf.rect(110, yPosition, 80, 20);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('VENDEDOR', 112, yPosition + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.text(`${data.fatura.vendedor}`, 112, yPosition + 12);
    pdf.text(`Pagamento: ${data.fatura.formaPagamento}`, 112, yPosition + 16);
  }

  private addClientInfo(pdf: jsPDF, data: any, textColor: [number, number, number], yPosition: number): void {
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(20, yPosition, 170, 15);

    pdf.setTextColor(...textColor);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CLIENTE', 22, yPosition + 6);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(11);
    pdf.text(`${data.fatura.cliente}`, 22, yPosition + 12);
  }

  private addItemsTable(pdf: jsPDF, data: any, primaryColor: [number, number, number], lightGray: [number, number, number], textColor: [number, number, number], yPosition: number): number {
    // Cabeçalho da tabela
    pdf.setFillColor(...primaryColor);
    pdf.rect(20, yPosition, 170, 8, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'bold');
    pdf.text('PRODUTO/SERVIÇO', 22, yPosition + 5);
    pdf.text('QTD', 110, yPosition + 5);
    pdf.text('PREÇO UNIT.', 130, yPosition + 5);
    pdf.text('TOTAL', 170, yPosition + 5);

    let currentY = yPosition + 8;

    // Itens da tabela
    data.itens.forEach((item: any, index: number) => {
      if (index % 2 === 0) {
        pdf.setFillColor(...lightGray);
        pdf.rect(20, currentY, 170, 8, 'F');
      }

      pdf.setTextColor(...textColor);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      // Quebrar texto longo do produto
      const splitTitle = pdf.splitTextToSize(item.nome, 85);
      pdf.text(splitTitle, 22, currentY + 5);

      pdf.text(item.quantidade.toString(), 110, currentY + 5);
      pdf.text(`KZ ${item.precoUnitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 130, currentY + 5);
      pdf.text(`KZ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 170, currentY + 5);

      currentY += 8;
    });

    return currentY;
  }

  private addFinancialSummary(pdf: jsPDF, data: any, primaryColor: [number, number, number], textColor: [number, number, number]): void {
    const yStart = 220; // Posição fixa para o resumo

    // Box do resumo
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(1);
    pdf.rect(130, yStart, 60, 30);

    pdf.setTextColor(...textColor);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');

    let yPos = yStart + 8;
    pdf.text(`Subtotal: KZ ${data.resumo.subtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 132, yPos);

    if (data.resumo.desconto > 0) {
      yPos += 6;
      pdf.text(`Desconto: KZ ${data.resumo.desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 132, yPos);
    }

    // Total em destaque
    yPos += 8;
    pdf.setFillColor(...primaryColor);
    pdf.rect(130, yPos - 4, 60, 10, 'F');

    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text(`TOTAL: KZ ${data.resumo.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 160, yPos + 2, { align: 'center' });
  }

  private addFooter(pdf: jsPDF, primaryColor: number[], textColor: number[]): void {
    const yFooter = 270;

    // Linha decorativa
    pdf.setDrawColor(...primaryColor);
    pdf.setLineWidth(2);
    pdf.line(20, yFooter, 190, yFooter);

    // Texto do rodapé
    pdf.setTextColor(...textColor);
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Obrigado pela sua preferência!', 105, yFooter + 8, { align: 'center' });
    pdf.text('PJ Limitada - Peças Automotivas Premium | www.pjlimitada.com', 105, yFooter + 14, { align: 'center' });
    pdf.text(`Fatura gerada em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 105, yFooter + 20, { align: 'center' });
  }
}
