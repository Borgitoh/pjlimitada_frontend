import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface OrderTracking {
  id: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  estimatedDelivery: Date;
  trackingCode?: string;
  customerInfo: {
    nome: string;
    email: string;
    telefone: string;
  };
  shippingAddress: {
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  items: Array<{
    id: string;
    nome: string;
    marca: string;
    quantidade: number;
    preco: number;
    imagem: string;
  }>;
  total: number;
  paymentMethod: string;
  timeline: OrderTimelineEvent[];
}

export interface OrderTimelineEvent {
  status: string;
  title: string;
  description: string;
  date: Date;
  isCompleted: boolean;
}

export interface OrderStatusUpdate {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingCode?: string;
  notes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrderTrackingService {

  constructor() { }

  getOrderTracking(orderId: string): Observable<OrderTracking> {
    // Get order from localStorage (e-commerce orders) or mock data
    const ecommerceSales = JSON.parse(localStorage.getItem('admin_sales') || '[]');
    const order = ecommerceSales.find((sale: any) => sale.id === orderId);

    if (order) {
      const tracking: OrderTracking = {
        id: order.id,
        status: this.getRandomStatus(),
        createdAt: new Date(order.date),
        updatedAt: new Date(),
        estimatedDelivery: this.calculateEstimatedDelivery(new Date(order.date)),
        trackingCode: this.generateTrackingCode(),
        customerInfo: {
          nome: order.customerName || 'Cliente E-commerce',
          email: order.notes?.split(' - ')[1] || 'cliente@email.com',
          telefone: '(11) 99999-9999'
        },
        shippingAddress: {
          endereco: 'Rua das Entregas, 123',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234-567'
        },
        items: order.items.map((item: any) => ({
          id: item.productId,
          nome: item.productName,
          marca: 'PJ Limitada',
          quantidade: item.quantity,
          preco: item.unitPrice,
          imagem: '/assets/images/gear.svg'
        })),
        total: order.total,
        paymentMethod: order.paymentMethod || 'express',
        timeline: this.generateOrderTimeline(this.getRandomStatus())
      };

      return of(tracking).pipe(delay(800));
    }

    // Return mock data if order not found
    return this.getMockOrderTracking(orderId);
  }

  updateOrderStatus(orderId: string, update: OrderStatusUpdate): Observable<boolean> {
    // In a real app, this would update the database
    console.log(`Updating order ${orderId} status to:`, update);

    // Update order in localStorage
    const ecommerceSales = JSON.parse(localStorage.getItem('admin_sales') || '[]');
    const orderIndex = ecommerceSales.findIndex((sale: any) => sale.id === orderId);
    
    if (orderIndex !== -1) {
      ecommerceSales[orderIndex].status = update.status;
      ecommerceSales[orderIndex].trackingCode = update.trackingCode;
      ecommerceSales[orderIndex].updatedAt = new Date();
      if (update.notes) {
        ecommerceSales[orderIndex].adminNotes = update.notes;
      }
      localStorage.setItem('admin_sales', JSON.stringify(ecommerceSales));
    }

    return of(true).pipe(delay(500));
  }

  getOrderStatusOptions() {
    return [
      { value: 'pending', label: 'Aguardando Pagamento', color: 'yellow' },
      { value: 'confirmed', label: 'Pagamento Confirmado', color: 'blue' },
      { value: 'processing', label: 'Preparando Pedido', color: 'purple' },
      { value: 'shipped', label: 'Enviado', color: 'indigo' },
      { value: 'delivered', label: 'Entregue', color: 'green' },
      { value: 'cancelled', label: 'Cancelado', color: 'red' }
    ];
  }

  private getMockOrderTracking(orderId: string): Observable<OrderTracking> {
    const tracking: OrderTracking = {
      id: orderId,
      status: 'processing',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      trackingCode: this.generateTrackingCode(),
      customerInfo: {
        nome: 'João da Silva',
        email: 'joao@email.com',
        telefone: '(11) 99999-9999'
      },
      shippingAddress: {
        endereco: 'Rua das Flores, 123',
        numero: '123',
        complemento: 'Apto 45',
        bairro: 'Centro',
        cidade: 'São Paulo',
        estado: 'SP',
        cep: '01234-567'
      },
      items: [
        {
          id: '1',
          nome: 'Kit Freio Performance BMW',
          marca: 'Brembo',
          quantidade: 1,
          preco: 2500,
          imagem: '/assets/images/gear.svg'
        },
        {
          id: '2',
          nome: 'Filtro de Ar Esportivo',
          marca: 'K&N',
          quantidade: 2,
          preco: 350,
          imagem: '/assets/images/gear.svg'
        }
      ],
      total: 3200,
      paymentMethod: 'express',
      timeline: this.generateOrderTimeline('processing')
    };

    return of(tracking).pipe(delay(800));
  }

  private generateOrderTimeline(currentStatus: string): OrderTimelineEvent[] {
    const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(currentStatus);
    
    const events: OrderTimelineEvent[] = [
      {
        status: 'pending',
        title: 'Pedido Realizado',
        description: 'Seu pedido foi recebido e está aguardando confirmação de pagamento',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        isCompleted: currentIndex >= 0
      },
      {
        status: 'confirmed',
        title: 'Pagamento Confirmado',
        description: 'Pagamento processado com sucesso. Pedido será preparado em breve',
        date: new Date(Date.now() - 36 * 60 * 60 * 1000),
        isCompleted: currentIndex >= 1
      },
      {
        status: 'processing',
        title: 'Preparando Pedido',
        description: 'Produtos sendo separados e embalados para envio',
        date: new Date(Date.now() - 12 * 60 * 60 * 1000),
        isCompleted: currentIndex >= 2
      },
      {
        status: 'shipped',
        title: 'Pedido Enviado',
        description: 'Pedido despachado e a caminho do destino',
        date: new Date(Date.now() + 6 * 60 * 60 * 1000),
        isCompleted: currentIndex >= 3
      },
      {
        status: 'delivered',
        title: 'Pedido Entregue',
        description: 'Pedido entregue no endereço de destino',
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        isCompleted: currentIndex >= 4
      }
    ];

    return events;
  }

  private getRandomStatus(): 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' {
    const statuses: ('pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered')[] = 
      ['confirmed', 'processing', 'shipped'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private generateTrackingCode(): string {
    return 'BR' + Date.now().toString().slice(-8) + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  private calculateEstimatedDelivery(orderDate: Date): Date {
    const deliveryDate = new Date(orderDate);
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days for delivery
    return deliveryDate;
  }
}
