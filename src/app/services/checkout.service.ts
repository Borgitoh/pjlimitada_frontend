import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface CheckoutData {
  customerInfo: {
    nome: string;
    email: string;
    telefone: string;
    cpf: string;
  };
  shippingAddress: {
    cep: string;
    endereco: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  paymentMethod: 'express' | 'bank_transfer' | 'pix';
  paymentData?: any;
}

export interface Order {
  id: string;
  items: any[];
  total: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered';
  paymentMethod: string;
  customerInfo: any;
  shippingAddress: any;
  createdAt: Date;
  estimatedDelivery?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  constructor() { }

  processOrder(checkoutData: CheckoutData, cartItems: any[], total: number): Observable<Order> {
    // Simulate order processing
    const order: Order = {
      id: this.generateOrderId(),
      items: cartItems,
      total: total,
      status: 'pending',
      paymentMethod: checkoutData.paymentMethod,
      customerInfo: checkoutData.customerInfo,
      shippingAddress: checkoutData.shippingAddress,
      createdAt: new Date(),
      estimatedDelivery: this.calculateEstimatedDelivery()
    };

    // Integrate with admin sales system
    this.addToAdminSales(order, checkoutData);

    return of(order).pipe(delay(2000)); // Simulate API call
  }

  private addToAdminSales(order: Order, checkoutData: CheckoutData): void {
    // Convert e-commerce order to admin sale format
    console.log(order);
    
    const adminSale = {
      id: order.id,
      date: order.createdAt,
      sellerId: 'ecommerce', // Special seller ID for e-commerce
      sellerName: 'E-commerce Online',
      items: order.items.map(item => ({
        productId: item.id.toString(),
        productName: item.nome,
        quantity: item.quantidade,
        unitPrice: item.preco,
        total: item.preco * item.quantidade
      })),
      status: order.status,
      subtotal: order.total,
      discount: 0,
      total: order.total,
      paymentMethod: this.mapPaymentMethod(order.paymentMethod),
      customerName: checkoutData.customerInfo.nome,
      notes: `Pedido e-commerce - ${checkoutData.customerInfo.email}`
    };

    // In a real app, this would be an API call to save the sale
    console.log('Sale integrated with admin system:', adminSale);

    // Store in localStorage for demo purposes
    const existingSales = JSON.parse(localStorage.getItem('admin_sales') || '[]');
    existingSales.unshift(adminSale);
    localStorage.setItem('admin_sales', JSON.stringify(existingSales));
  }

  private mapPaymentMethod(method: string): 'cash' | 'card' | 'transfer' {
    switch (method) {
      case 'express':
        return 'card';
      case 'pix':
      case 'bank_transfer':
        return 'transfer';
      default:
        return 'card';
    }
  }

  getPaymentMethods() {
    return [
      {
        id: 'express',
        name: 'Pagamento Express',
        description: 'Cartão de crédito/débito - Aprovação instantânea',
        icon: 'smartphone',
        processingTime: 'Imediato'
      },
      {
        id: 'referencia',
        name: 'Pagamento por referência',
        description: 'Transferência instantânea via PIX',
        icon: 'credit-card',
        processingTime: 'Até 1 hora'
      },
      {
        id: 'bank_transfer',
        name: 'Transferência Bancária',
        description: 'TED/DOC para conta da empresa',
        icon: 'bank',
        processingTime: '1-2 dias úteis'
      }
    ];
  }

  generatePixPayment(total: number) {
    return {
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', // Placeholder
      pixKey: '12345678901',
      value: total,
      expirationTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      instructions: [
        'Abra o app do seu banco',
        'Escaneie o QR Code ou copie a chave PIX',
        'Confirme o pagamento',
        'Envie o comprovante para confirmação'
      ]
    };
  }

  getBankTransferInfo() {
    return {
      bankName: 'Banco BAI',
      agency: '1234-5',
      account: '12345-6',
      accountType: 'Conta Corrente',
      cnpj: '12.345.678/0001-90',
      companyName: 'PJ Limitada LTDA',
      instructions: [
        'Faça a transferência para os dados bancários acima',
        'Envie o comprovante para confirmação',
        'Prazo para pagamento: 3 dias úteis'
      ]
    };
  }

  checkOrderStatus(orderId: string): Observable<Order> {
    // Simulate order status check
    const order: Order = {
      id: orderId,
      items: [],
      total: 0,
      status: 'confirmed',
      paymentMethod: 'express',
      customerInfo: {},
      shippingAddress: {},
      createdAt: new Date(),
      estimatedDelivery: this.calculateEstimatedDelivery()
    };

    return of(order).pipe(delay(1000));
  }

  private generateOrderId(): string {
    return 'PJ' + Date.now().toString() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  private calculateEstimatedDelivery(): Date {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate;
  }
}
