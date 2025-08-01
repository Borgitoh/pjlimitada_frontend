import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CheckoutService } from '../../services/checkout.service';

@Component({
  selector: 'app-order-success',
  templateUrl: './order-success.component.html',
  styleUrls: ['./order-success.component.scss']
})
export class OrderSuccessComponent implements OnInit {
  order: any;
  paymentMethod: string = '';
  pixData: any;
  bankInfo: any;

  constructor(
    private router: Router,
    private checkoutService: CheckoutService
  ) {
    // Get order data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.order = navigation.extras.state['order'];
      this.paymentMethod = navigation.extras.state['paymentMethod'];
    }
  }

  ngOnInit(): void {
    // Redirect if no order data
    if (!this.order) {
      this.router.navigate(['/pecas']);
      return;
    }

    // Load payment-specific data
    if (this.paymentMethod === 'pix') {
      this.pixData = this.checkoutService.generatePixPayment(this.order.total);
    } else if (this.paymentMethod === 'bank_transfer') {
      this.bankInfo = this.checkoutService.getBankTransferInfo();
    }
  }

  trackOrder(): void {
    // Navigate to order tracking page (would be implemented)
    alert('Funcionalidade de acompanhamento será implementada em breve!');
  }
}
