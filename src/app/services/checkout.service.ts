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

    return of(order).pipe(delay(2000)); // Simulate API call
  }

  getPaymentMethods() {
    return [
      {
        id: 'express',
        name: 'Pagamento Express',
        description: 'Cartão de crédito/débito - Aprovação instantânea',
        icon: 'credit-card',
        processingTime: 'Imediato'
      },
      {
        id: 'pix',
        name: 'PIX',
        description: 'Transferência instantânea via PIX',
        icon: 'smartphone',
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
      bankName: 'Banco do Brasil',
      agency: '1234-5',
      account: '12345-6',
      accountType: 'Conta Corrente',
      cnpj: '12.345.678/0001-90',
      companyName: 'PJ Limitada LTDA',
      instructions: [
        'Faça a transferência para os dados bancários acima',
        'Use seu CPF/CNPJ como identificação',
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
