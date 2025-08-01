import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService, CartSummary } from '../../services/cart.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  dropdownOpen = false;
  mobileMenuOpen = false;
  cartModalOpen = false;

  cartSummary: CartSummary = {
    items: [],
    subtotal: 0,
    total: 0,
    itemCount: 0
  };

  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService) {}

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

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  toggleCart() {
    this.cartModalOpen = !this.cartModalOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }

  closeMobileMenu() {
    this.mobileMenuOpen = false;
  }

  closeCartModal() {
    this.cartModalOpen = false;
  }
}
