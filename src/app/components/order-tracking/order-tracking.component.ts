import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderTrackingService, OrderTracking } from '../../services/order-tracking.service';

@Component({
  selector: 'app-order-tracking',
  templateUrl: './order-tracking.component.html',
  styleUrls: ['./order-tracking.component.scss']
})
export class OrderTrackingComponent implements OnInit {
  orderId: string = '';
  orderTracking: OrderTracking | null = null;
  loading = false;
  error = '';
  searchOrderId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderTrackingService: OrderTrackingService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.orderId = params['orderId'];
        this.searchOrderId = this.orderId;
        this.trackOrder();
      }
    });
  }

  trackOrder(): void {
    if (!this.searchOrderId.trim()) {
      this.error = 'Por favor, informe um número de pedido válido';
      return;
    }

    this.loading = true;
    this.error = '';
    this.orderTracking = null;

    this.orderTrackingService.getOrderTracking(this.searchOrderId.trim())
      .subscribe({
        next: (tracking) => {
          this.orderTracking = tracking;
          this.orderId = tracking.id;
          this.loading = false;
          
          // Update URL with order ID
          this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { orderId: tracking.id },
            queryParamsHandling: 'merge'
          });
        },
        error: (err) => {
          this.error = 'Pedido não encontrado. Verifique o número do pedido e tente novamente.';
          this.loading = false;
        }
      });
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'confirmed': 'text-blue-600 bg-blue-100',
      'processing': 'text-purple-600 bg-purple-100',
      'shipped': 'text-indigo-600 bg-indigo-100',
      'delivered': 'text-green-600 bg-green-100',
      'cancelled': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'pending': 'Aguardando Pagamento',
      'confirmed': 'Pagamento Confirmado',
      'processing': 'Preparando Pedido',
      'shipped': 'Enviado',
      'delivered': 'Entregue',
      'cancelled': 'Cancelado'
    };
    return labels[status] || status;
  }

  getPaymentMethodLabel(method: string): string {
    const labels: { [key: string]: string } = {
      'express': 'Cartão de Crédito',
      'pix': 'PIX',
      'bank_transfer': 'Transferência Bancária',
      'card': 'Cartão',
      'transfer': 'Transferência'
    };
    return labels[method] || method;
  }

  copyTrackingCode(): void {
    if (this.orderTracking?.trackingCode) {
      navigator.clipboard.writeText(this.orderTracking.trackingCode).then(() => {
        // Could show a toast notification here
        console.log('Código de rastreio copiado');
      });
    }
  }

  shareOrder(): void {
    if (this.orderTracking) {
      const shareText = `Acompanhe meu pedido PJ Limitada: ${this.orderTracking.id}`;
      const shareUrl = `${window.location.origin}/rastreamento?orderId=${this.orderTracking.id}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Acompanhamento de Pedido - PJ Limitada',
          text: shareText,
          url: shareUrl
        });
      } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
        console.log('Link de acompanhamento copiado');
      }
    }
  }

  continueShopping(): void {
    this.router.navigate(['/pecas']);
  }

  contactSupport(): void {
    const message = `Olá! Gostaria de informações sobre meu pedido ${this.orderId}`;
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }
}
