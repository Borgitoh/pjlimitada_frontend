import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService, CartSummary } from '../../services/cart.service';
import { CheckoutService, CheckoutData } from '../../services/checkout.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  currentStep = 1;
  steps = ['Dados Pessoais', 'Endereço', 'Pagamento'];
  processing = false;

  customerForm: FormGroup;
  addressForm: FormGroup;
  
  paymentMethods: any[] = [];
  selectedPaymentMethod = '';

  cartSummary: CartSummary = {
    items: [],
    subtotal: 0,
    total: 0,
    itemCount: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {
    this.customerForm = this.fb.group({
      nome: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      telefone: ['', [Validators.required]],
    });

    this.addressForm = this.fb.group({
      cep: ['', [Validators.required]],
      endereco: ['', [Validators.required]],
      cidade: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    // Load cart summary
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
        // Redirect to cart if empty
        if (summary.itemCount === 0) {
          this.router.navigate(['/pecas']);
        }
      });

    // Load payment methods
    this.paymentMethods = this.checkoutService.getPaymentMethods();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  nextStep(): void {
    if (this.canProceed()) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  canProceed(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.customerForm.valid;
      case 2:
        return this.addressForm.valid;
      case 3:
        return !!this.selectedPaymentMethod;
      default:
        return false;
    }
  }

  selectPaymentMethod(methodId: string): void {
    this.selectedPaymentMethod = methodId;
  }

  buscarCep(): void {
    const cep = this.addressForm.get('cep')?.value;
    if (cep && cep.length === 9) {
      // Simulate CEP lookup
      setTimeout(() => {
        this.addressForm.patchValue({
          endereco: 'Rua das Flores',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP'
        });
      }, 1000);
    }
  }

  finishOrder(): void {
    if (!this.canProceed() || this.processing) return;

    this.processing = true;

    const checkoutData: CheckoutData = {
      customerInfo: this.customerForm.value,
      shippingAddress: this.addressForm.value,
      paymentMethod: this.selectedPaymentMethod as any
    };

    this.checkoutService.processOrder(checkoutData, this.cartSummary.items, this.cartSummary.total)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (order) => {
          // Clear cart
          this.cartService.clearCart();
          
          // Navigate to success page with order info
          this.router.navigate(['/order-success'], { 
            state: { order: order, paymentMethod: this.selectedPaymentMethod } 
          });
        },
        error: (error) => {
          console.error('Order processing failed:', error);
          this.processing = false;
          // Show error message to user
        }
      });
  }
}
