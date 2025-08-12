import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../services/admin.service';
import { Sale, SaleItem, Product, User, TableColumn, TableAction } from '../../models/admin.models';

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
}
