import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface OrderItem {
  nome: string;
  marca: string;
  categoria: string;
  preco: number;
  quantidade: number;
  imagem: string;
}

interface Order {
  id: string;
  createdAt: Date;
  status: string;
  total: number;
  items: OrderItem[];
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
  paymentMethod: string;
  trackingCode?: string;
  estimatedDelivery?: Date;
}

@Component({
  selector: 'app-my-orders',
  templateUrl: './my-orders.component.html',
  styleUrls: ['./my-orders.component.scss']
})
export class MyOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = false;
  customerEmail = '';
  showOrders = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Pode carregar pedidos se o usuário estiver logado
  }

  searchOrders(): void {
    if (!this.customerEmail.trim()) {
      alert('Por favor, digite seu e-mail.');
      return;
    }

    this.loading = true;
    
    // Simular busca por pedidos
    setTimeout(() => {
      this.orders = this.getMockOrders();
      this.showOrders = true;
      this.loading = false;
    }, 1000);
  }

  trackOrder(orderId: string): void {
    this.router.navigate(['/rastreamento'], { queryParams: { order: orderId } });
  }

  viewOrderDetails(order: Order): void {
    // Implementar visualização detalhada
    console.log('Ver detalhes do pedido:', order);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Pendente',
      'confirmed': 'Confirmado',
      'preparing': 'Preparando',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-purple-100 text-purple-800',
      'shipped': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'express': 'Cartão de Crédito',
      'pix': 'PIX',
      'bank_transfer': 'Transferência Bancária'
    };
    return labels[method] || method;
  }

  private getMockOrders(): Order[] {
    return [
      {
        id: 'PJ1234567890ABCD',
        createdAt: new Date('2024-01-20'),
        status: 'delivered',
        total: 2850.00,
        items: [
          {
            nome: 'Kit Freio Performance BMW Serie 3',
            marca: 'Brembo',
            categoria: 'Freios',
            preco: 1200.00,
            quantidade: 1,
            imagem: '/assets/images/produtos/kit-freio-brembo.jpg'
          },
          {
            nome: 'Pastilhas de Freio Cerâmicas',
            marca: 'Brembo',
            categoria: 'Freios',
            preco: 450.00,
            quantidade: 2,
            imagem: '/assets/images/produtos/pastilhas-ceramicas.jpg'
          }
        ],
        customerInfo: {
          nome: 'João Silva',
          email: this.customerEmail,
          telefone: '+244 923 456 789'
        },
        shippingAddress: {
          endereco: 'Rua das Flores',
          numero: '123',
          complemento: 'Apt 45',
          bairro: 'Maianga',
          cidade: 'Luanda',
          estado: 'Luanda',
          cep: '12345'
        },
        paymentMethod: 'express',
        trackingCode: 'BR123456789AO',
        estimatedDelivery: new Date('2024-01-25')
      },
      {
        id: 'PJ2234567890EFGH',
        createdAt: new Date('2024-01-18'),
        status: 'shipped',
        total: 3200.00,
        items: [
          {
            nome: 'Bodykit BMW M3 E46',
            marca: 'Pandem',
            categoria: 'Bodykit',
            preco: 3200.00,
            quantidade: 1,
            imagem: '/assets/images/produtos/bodykit-bmw-m3.jpg'
          }
        ],
        customerInfo: {
          nome: 'João Silva',
          email: this.customerEmail,
          telefone: '+244 923 456 789'
        },
        shippingAddress: {
          endereco: 'Rua das Flores',
          numero: '123',
          complemento: 'Apt 45',
          bairro: 'Maianga',
          cidade: 'Luanda',
          estado: 'Luanda',
          cep: '12345'
        },
        paymentMethod: 'bank_transfer',
        trackingCode: 'BR987654321AO',
        estimatedDelivery: new Date('2024-01-23')
      },
      {
        id: 'PJ3234567890IJKL',
        createdAt: new Date('2024-01-15'),
        status: 'preparing',
        total: 850.00,
        items: [
          {
            nome: 'Filtro de Ar Esportivo K&N',
            marca: 'K&N',
            categoria: 'Motor',
            preco: 300.00,
            quantidade: 1,
            imagem: '/assets/images/produtos/filtro-ar-kn.jpg'
          },
          {
            nome: 'Vela de Ignição NGK',
            marca: 'NGK',
            categoria: 'Motor',
            preco: 55.00,
            quantidade: 10,
            imagem: '/assets/images/produtos/vela-ngk.jpg'
          }
        ],
        customerInfo: {
          nome: 'João Silva',
          email: this.customerEmail,
          telefone: '+244 923 456 789'
        },
        shippingAddress: {
          endereco: 'Rua das Flores',
          numero: '123',
          complemento: 'Apt 45',
          bairro: 'Maianga',
          cidade: 'Luanda',
          estado: 'Luanda',
          cep: '12345'
        },
        paymentMethod: 'pix',
        estimatedDelivery: new Date('2024-01-22')
      }
    ];
  }
}
