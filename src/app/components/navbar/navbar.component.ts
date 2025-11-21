import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService, CartSummary } from '../../services/cart.service';
import { Router } from '@angular/router';

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
  user: any = null;

  private destroy$ = new Subject<void>();

  constructor(private cartService: CartService, private router: Router) { }

  ngOnInit(): void {
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(summary => {
        this.cartSummary = summary;
      });

    const userData = localStorage.getItem('user');
    if (userData) {
      this.user = JSON.parse(userData);
    }
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

  isAdmin() {
    return this.user && ['admin', 'gestor', 'master', 'vendedor'].includes(this.user.role);
  }

  isCliente() {
    return this.user && this.user.role === 'cliente';
  }
  logout() {
    localStorage.removeItem('user');
    this.user = null;
    this.router.navigate(['/login']);
  }
}
