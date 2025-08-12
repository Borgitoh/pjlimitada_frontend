import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { OrderTrackingService, OrderTracking, OrderStatusUpdate } from '../../../services/order-tracking.service';
import { AdminService } from '../../services/admin.service';
import { TableColumn, TableAction } from '../../models/admin.models';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  filteredOrders: any[] = [];

  // Filters
  statusFilter: string = '';
  dateFrom: string = '';
  dateTo: string = '';

  // Stats
  totalOrders = 0;
  pendingOrders = 0;
  shippedOrders = 0;
  deliveredOrders = 0;

  // Modal
  selectedOrder: OrderTracking | null = null;
  isModalOpen = false;
  modalTitle = '';

  // Status update
  statusUpdate: OrderStatusUpdate = {
    status: 'pending',
    trackingCode: '',
    notes: ''
  };

  private destroy$ = new Subject<void>();

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'Pedido', sortable: true, type: 'text' },
    { key: 'customerName', label: 'Cliente', type: 'text' },
    { key: 'date', label: 'Data', type: 'date', sortable: true },
    { key: 'itemsCount', label: 'Itens', type: 'number' },
    { key: 'total', label: 'Total', type: 'currency', sortable: true },
    { key: 'status', label: 'Status', type: 'badge' },
    { key: 'actions', label: 'Ações', type: 'actions', width: '150px' }
  ];

  tableActions: TableAction[] = [
    {
      label: 'Ver Detalhes',
      icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z',
      type: 'primary',
      action: (order: any) => this.viewOrder(order)
    },
    {
      label: 'Atualizar Status',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
      type: 'secondary',
      action: (order: any) => this.updateOrderStatus(order)
    }
  ];

  statusOptions = [
    { value: 'pending', label: 'Aguardando Pagamento', color: 'yellow' },
    { value: 'confirmed', label: 'Pagamento Confirmado', color: 'blue' },
    { value: 'processing', label: 'Preparando Pedido', color: 'purple' },
    { value: 'shipped', label: 'Enviado', color: 'indigo' },
    { value: 'delivered', label: 'Entregue', color: 'green' },
    { value: 'cancelled', label: 'Cancelado', color: 'red' }
  ];

  constructor(
    private orderTrackingService: OrderTrackingService,
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrders(): void {
    // Get e-commerce orders from localStorage
    const ecommerceSales = JSON.parse(localStorage.getItem('admin_sales') || '[]');
    const ecommerceOrders = ecommerceSales
      .filter((sale: any) => sale.sellerId === 'ecommerce')
      .map((sale: any) => ({
        id: sale.id,
        customerName: sale.customerName,
        date: new Date(sale.date),
        items: sale.items,
        itemsCount: sale.items.length,
        total: sale.total,
        status: sale.status || 'confirmed',
        paymentMethod: sale.paymentMethod,
        trackingCode: sale.trackingCode,
        adminNotes: sale.adminNotes
      }));

    this.orders = ecommerceOrders;
    this.filterOrders();
    this.calculateStats();
  }

  filterOrders(): void {
    let filtered = [...this.orders];

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(order => order.status === this.statusFilter);
    }

    // Date filters
    if (this.dateFrom) {
      const fromDate = new Date(this.dateFrom);
      filtered = filtered.filter(order => new Date(order.date) >= fromDate);
    }

    if (this.dateTo) {
      const toDate = new Date(this.dateTo);
      filtered = filtered.filter(order => new Date(order.date) <= toDate);
    }

    // Add badge data for display
    this.filteredOrders = filtered.map(order => ({
      ...order,
      statusBadge: {
        label: this.getStatusLabel(order.status),
        color: this.getStatusColor(order.status)
      }
    }));
  }

  viewOrder(order: any): void {
    this.orderTrackingService.getOrderTracking(order.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(tracking => {
        this.selectedOrder = tracking;
        this.modalTitle = `Detalhes do Pedido #${tracking.id}`;
        this.isModalOpen = true;
      });
  }

  updateOrderStatus(order: any): void {
    this.selectedOrder = order;
    this.statusUpdate = {
      status: order.status,
      trackingCode: order.trackingCode || '',
      notes: order.adminNotes || ''
    };
    this.modalTitle = `Atualizar Status - Pedido #${order.id}`;
    this.isModalOpen = true;
  }

  saveStatusUpdate(): void {
    if (!this.selectedOrder) return;

    this.orderTrackingService.updateOrderStatus(this.selectedOrder.id, this.statusUpdate)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.closeModal();
        this.loadOrders();
      });
  }

  closeModal(): void {
    this.isModalOpen = false;
    this.selectedOrder = null;
    this.statusUpdate = { status: 'pending', trackingCode: '', notes: '' };
  }

  isViewMode(): boolean {
    return this.modalTitle.includes('Detalhes');
  }

  private calculateStats(): void {
    this.totalOrders = this.orders.length;
    this.pendingOrders = this.orders.filter(o => o.status === 'pending').length;
    this.shippedOrders = this.orders.filter(o => o.status === 'shipped').length;
    this.deliveredOrders = this.orders.filter(o => o.status === 'delivered').length;
  }

  getStatusLabel(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.label : status;
  }

  private getStatusColor(status: string): string {
    const option = this.statusOptions.find(opt => opt.value === status);
    return option ? option.color : 'gray';
  }
}
