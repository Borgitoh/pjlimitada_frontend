import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService, CartItem, CartSummary } from '../../services/cart.service';

@Component({
  selector: 'app-cart-modal',
  templateUrl: './cart-modal.component.html',
  styleUrls: ['./cart-modal.component.scss']
})
export class CartModalComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  cartSummary: CartSummary = {
    items: [],
    subtotal: 0,
    total: 0,
    itemCount: 0
  };

  private destroy$ = new Subject<void>();

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeModal(): void {
    this.isOpen = false;
    this.closed.emit();
  }

  updateQuantity(item: CartItem, newQuantity: number): void {
    this.cartService.updateQuantity(item.id, item.tipo, newQuantity);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeFromCart(item.id, item.tipo);
  }

  proceedToCheckout(): void {
    this.closeModal();
    this.router.navigate(['/checkout']);
  }
}
