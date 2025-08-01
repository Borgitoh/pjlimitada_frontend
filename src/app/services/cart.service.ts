import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface CartItem {
  id: number;
  nome: string;
  preco: number;
  imagem: string;
  quantidade: number;
  tipo: 'peca' | 'bodykit';
  categoria?: string;
  marca?: string;
  estoque: number;
}

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartSummary>(this.calculateSummary());

  cart$ = this.cartSubject.asObservable();

  constructor() {
    // Load cart from localStorage
    this.loadCartFromStorage();
  }

  addToCart(item: any, tipo: 'peca' | 'bodykit', quantidade: number = 1): void {
    const existingItemIndex = this.cartItems.findIndex(cartItem => 
      cartItem.id === item.id && cartItem.tipo === tipo
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      const newQuantity = this.cartItems[existingItemIndex].quantidade + quantidade;
      if (newQuantity <= item.estoque) {
        this.cartItems[existingItemIndex].quantidade = newQuantity;
      }
    } else {
      // Add new item to cart
      if (quantidade <= item.estoque) {
        const cartItem: CartItem = {
          id: item.id,
          nome: item.nome,
          preco: item.preco,
          imagem: item.imagem,
          quantidade: quantidade,
          tipo: tipo,
          categoria: item.categoria,
          marca: item.marca,
          estoque: item.estoque
        };
        this.cartItems.push(cartItem);
      }
    }

    this.updateCart();
  }

  removeFromCart(id: number, tipo: 'peca' | 'bodykit'): void {
    this.cartItems = this.cartItems.filter(item => 
      !(item.id === id && item.tipo === tipo)
    );
    this.updateCart();
  }

  updateQuantity(id: number, tipo: 'peca' | 'bodykit', quantidade: number): void {
    const itemIndex = this.cartItems.findIndex(item => 
      item.id === id && item.tipo === tipo
    );

    if (itemIndex > -1) {
      if (quantidade <= 0) {
        this.removeFromCart(id, tipo);
      } else if (quantidade <= this.cartItems[itemIndex].estoque) {
        this.cartItems[itemIndex].quantidade = quantidade;
        this.updateCart();
      }
    }
  }

  clearCart(): void {
    this.cartItems = [];
    this.updateCart();
  }

  getCartItems(): CartItem[] {
    return [...this.cartItems];
  }

  isInCart(id: number, tipo: 'peca' | 'bodykit'): boolean {
    return this.cartItems.some(item => item.id === id && item.tipo === tipo);
  }

  getCartItemQuantity(id: number, tipo: 'peca' | 'bodykit'): number {
    const item = this.cartItems.find(item => item.id === id && item.tipo === tipo);
    return item ? item.quantidade : 0;
  }

  private calculateSummary(): CartSummary {
    const subtotal = this.cartItems.reduce((sum, item) => sum + (item.preco * item.quantidade), 0);
    const itemCount = this.cartItems.reduce((sum, item) => sum + item.quantidade, 0);

    return {
      items: [...this.cartItems],
      subtotal: subtotal,
      total: subtotal, // No taxes or shipping for now
      itemCount: itemCount
    };
  }

  private updateCart(): void {
    this.saveCartToStorage();
    this.cartSubject.next(this.calculateSummary());
  }

  private saveCartToStorage(): void {
    localStorage.setItem('pj_cart', JSON.stringify(this.cartItems));
  }

  private loadCartFromStorage(): void {
    const savedCart = localStorage.getItem('pj_cart');
    if (savedCart) {
      try {
        this.cartItems = JSON.parse(savedCart);
        this.cartSubject.next(this.calculateSummary());
      } catch (error) {
        console.error('Error loading cart from storage:', error);
        this.cartItems = [];
      }
    }
  }
}
